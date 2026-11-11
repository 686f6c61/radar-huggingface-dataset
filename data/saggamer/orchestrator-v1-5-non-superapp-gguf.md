# saggamer/orchestrator-v1.5-non-superapp-GGUF

## Resumen

Orchestrator v1.5 Non Superapp es un modelo de lenguaje de tipo texto, derivado del modelo base saggamer/orchestrator-v1.5-non-superapp, que a su vez parte de una base de instruccion Gemma 4 E4B con adaptadores entrenados por el autor (saggamer) para tareas de control, navegacion, MCP, codigo y presentacion. Esta edicion GGUF es un derivado denso y solo texto que integra las actualizaciones de esos adaptadores en un unico modelo Gemma 4 convencional, sin necesidad de un cargador personalizado ni de un build parcheado de llama.cpp.

El modelo resuelve el problema de llevar flujos agenticos (seleccion de herramienta, resumenes anclados a material proporcionado, ayuda a codigo y seguimiento de peticiones) a entornos de inferencia locales estandar. Cuenta con 7.463.013.674 parametros almacenados antes de la cuantizacion y se distribuye principalmente en formato GGUF Q4_K_M de aproximadamente 5,30 GB, compatible con llama.cpp, Ollama y LM Studio que soporten Gemma 4.

Es relevante ahora porque permite desplegar un modelo con capacidades de emision de decisiones de herramienta y function calling nativo en hardware de consumo, sin dependencia del ecosistema Kira Superapp. La licencia Apache 2.0 y la ausencia de metadatos o operadores personalizados facilitan su integracion en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E4B, solo texto) |
| Parametros totales | 7.463.013.674 (antes de cuantizacion) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de uso emplean `-c 4096` |
| Tipos de cuantizacion | GGUF Q4_K_M (principal); el repo base ofrece FP16 safetensors y MLX affine 4-bit |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors y MLX en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en la arquitectura estandar de Gemma 4 E4B, en su variante solo texto. No emplea mezcla de expertos (MoE) en esta edicion: los adaptadores originales del modelo fuente, que operaban sobre un esquema de enrutamiento de expertos dependiente del token, se han fusionado estaticamente. Para las tres capas FFN adaptadas, cada actualizacion de experto se forma como `B @ A`, se promedia sobre los 16 expertos de cada uno de cinco canales de origen y se mezcla por igual entre canales con una fuerza residual de 0,5. El resultado son proyecciones densas convencionales.

No se realizo entrenamiento nuevo. La fusion estatica aproxima el enrutamiento de expertos del modelo fuente, pero no lo reproduce exactamente. Ademas, el backbone de origen ya estaba cuantizado en MLX, por lo que exportar a FP16 o Q8 no recupera los pesos originales de precision completa. Los detalles exactos de hashes de adaptadores y coeficientes estan en `merge_recipe.json`. La evaluacion del autor indica que la fusion equilibrada igualo al modelo de control fuente en 12 fixtures de desarrollo y 8 fixtures reservados, sin regresiones en esa comprobacion pareada pequena.

## Capacidades

- Generacion de texto conversacional multi-turno y seguimiento de peticiones.
- Razonamiento sobre material proporcionado (resumenes anclados a fuentes suministradas).
- Ayuda a codigo basica.
- Seleccion de la siguiente herramienta a ejecutar (next-tool selection) y emision de decisiones de herramienta en JSON.
- Function calling nativo: la emision de llamadas a funciones paso en llama.cpp, Ollama y LM Studio; la ejecucion real de la herramienta corresponde a la aplicacion anfitriona.
- Integracion en flujos agenticos cuando un host compatible conecta las decisiones a navegador, servicios MCP, archivos locales u otros agentes.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Sin codificadores de vision ni audio; sin navegador integrado ni credenciales de aplicaciones.

## Casos de uso

- Asistente conversacional local: el modelo gestiona peticiones de seguimiento y conversaciones multi-turno con contexto de 4096 tokens en llama.cpp u Ollama, adecuado para asistencia de escritorio sin conexion.
- Seleccion de herramienta en agentes: dado un conjunto de herramientas suministradas por el host, el modelo emite una decision en JSON sobre cual ejecutar a continuacion, lo que permite orquestar servicios MCP o acciones de navegador desde una aplicacion propia.
- Resumen anclado a documentos: para resumir material proporcionado por el usuario (informes, articulos) sin depender de conocimiento parametrico, reduciendo el riesgo de inventar datos fuera del contexto.
- Ayuda a codigo en editor o CLI: genera fragmentos y explicaciones basicas de codigo, integrable en herramientas de desarrollo locales mediante llama-server.
- Automatizacion de flujos con function calling: el host define funciones y el modelo decide invocaciones, util para pipelines internos de CI/CD o tareas administrativas donde la ejecucion la realiza el sistema anfitrion.
- Prototipado de agentes en hardware de consumo: con Q4_K_M (~5,30 GB) se puede desplegar en estaciones de trabajo con GPU consumer para validar logica agentica antes de escalar a modelos mayores.
- Chat de soporte tecnico en ingles: conversaciones guiadas con contexto moderado y respuestas basadas en informacion aportada por el operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta comprobaciones funcionales de compatibilidad en tiempo de ejecucion:

| Runtime | Formato | Comprobaciones |
|---|---|---|
| Transformers 5.22.2 | FP16 Safetensors | Carga estandar, aritmetica, codigo, decision de herramienta JSON: 3/3 |
| MLX-LM 0.32.0 / MLX 0.32.3 | MLX affine 4-bit | Carga estandar, aritmetica, codigo, decision de herramienta JSON: 3/3 |
| llama.cpp sin modificar | GGUF Q4_K_M estandar | Chat y emision nativa de function call: 3/3 |
| Ollama 0.40.13 | GGUF Q4_K_M estandar | Chat y emision nativa de function call: 3/3 |
| LM Studio 0.4.26+4 | GGUF Q4_K_M estandar | Chat y emision nativa de function call: 3/3 |

Estas son comprobaciones de compatibilidad funcional, no rankings de rendimiento ni puntuaciones amplias de benchmarks agenticos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 5,30 GB; se recomienda al menos 6-8 GB de VRAM para cargar el modelo con contexto de 4096 tokens.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o superiores son suficientes. A100 y H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante `Modelfile` incluido), LM Studio, y Transformers/MLX para los formatos hermanos.
- Latencia y throughput: no disponibles; el autor indica que el tiempo de respuesta depende de la carga, la cache, el hardware y la configuracion del runtime.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas directamente comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con modelos de tamano similar de la familia Gemma, sin datos de benchmarks:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orchestrator v1.5 Non Superapp (GGUF) | 7,46 B | no disponible (ejemplos a 4096) | apache-2.0 | GGUF, safetensors, MLX | Derivado denso de Gemma 4 E4B con adaptadores agenticos fusionados; solo texto e ingles |
| Gemma 4 E4B (base) | no disponible | no disponible | no disponible | no disponible | Base de instruccion del modelo; arquitectura de referencia |
| Modelos densos de ~7-8 B (genericos) | ~7-8 B | variable | variable | variable | Categoria de tamano comparable; sin datos de rendimiento para comparar |

No se dispone de informacion suficiente para una comparativa de rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos; el autor enfatiza el uso de material suministrado para mitigarlo.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- La fusion estatica no reproduce exactamente el enrutamiento de expertos del modelo fuente; puede haber diferencias de comportamiento frente al original.
- El backbone de origen ya estaba cuantizado en MLX; los pesos exportados no son de precision completa.
- Las capacidades de navegador, MCP, voz y generacion de artefactos son funciones del host (Kira Superapp), no del modelo; este solo emite texto y decisiones de herramienta.
- No incluye codificadores de vision ni audio.
- Los resultados de validacion son comprobaciones funcionales pequenas (3/3 por runtime) y no garantizan rendimiento agentico general.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse la licencia y los avisos de terceros incluidos.
- La compatibilidad con runtimes depende de que estos soporten Gemma 4; no se garantiza en todos los dispositivos.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp-GGUF
- Hugging Face (safetensors): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp
- Hugging Face (MLX 4-bit): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp-MLX
- Modelo fuente: https://huggingface.co/saggamer/orchestrator-v1.5
- Kira Superapp (web): https://kira-superapp.vercel.app/
- Kira Superapp (GitHub): https://github.com/saggamer/KIRA-Superapp
- Diagonal Browser: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
