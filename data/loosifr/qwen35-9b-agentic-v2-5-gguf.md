# LoosiFR/qwen35-9b-agentic-v2.5-GGUF

## Resumen

qwen35-9b-agentic-v2.5-GGUF es la distribucion en formato GGUF del modelo LoosiFR/qwen35-9b-agentic-v2.5, un ajuste fino de 9.197.093.888 parametros orientado a uso agentico y a tool calling. El autor, LoosiFR, publica unicamente un fichero cuantizado Q5_K_M (qwen35-9b-agentic-v2.5-Q5_K_M.gguf) dentro de un repositorio de 6,6 GB, pensado para ejecutarse con llama.cpp y con soporte de plantillas Jinja para function calling.

El nombre del modelo sugiere una base de la familia Qwen 3.5, y la model card menciona explicitamente que la atencion hibrida de Qwen3.5 mantiene pequena la cache KV, lo que permite arrancar con 32.768 tokens de contexto en una GPU de 12 GB y ampliarlo progresivamente. No obstante, el autor no documenta la arquitectura exacta, el proceso de entrenamiento, los datos utilizados ni los idiomas soportados, por lo que buena parte de las especificaciones tecnicas quedan como no disponibles.

La relevancia de esta publicacion es acotada: se trata de un modelo derivado de otro modelo derivado, con cero descargas en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Resulta util como referencia de despliegue local de un modelo agentico de ~9B en hardware de consumo, pero no como una opcion evaluada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (segun referencia a Qwen3.5 en la model card); detalles no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo; ampliable sin limite documentado |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Modelo base | LoosiFR/qwen35-9b-agentic-v2.5 |
| Tamano del repositorio | 6,6 GB |
| Cache KV | Cuantizable a q8_0 en claves y valores (-ctk q8_0 -ctv q8_0) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LoosiFR/qwen35-9b-agentic-v2.5. La unica referencia tecnica es la mencion en la model card a la "atencion hibrida de Qwen3.5", que sugiere una combinacion de mecanismos de atencion (probablemente atencion completa y atencion lineal o de ventana deslizante) cuyo efecto practico es una cache KV de menor tamano relativo frente a un transformer clasico. El recuento de parametros (9.197.093.888) es compatible con un modelo denso de aproximadamente 9B.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado especifico para tool use. El sufijo "agentic" y la etiqueta "tool-use" indican que el ajuste fino se oriento a la invocacion de herramientas, pero no se aportan detalles del procedimiento. La model card incluye una prueba de humo realizada en el momento de la exportacion con el resultado `{"tool_call": false, "tool_result_used": false}`, lo que constituye una senal negativa: en esa prueba el modelo no emitio una llamada a herramienta ni utilizo el resultado devuelto.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja compatible con llama.cpp.
- Tool calling / function calling mediante `--jinja` en llama-server; el autor advierte que es mas fiable a traves de llama.cpp que de Ollama.
- Modo de razonamiento (thinking) activable o desactivable por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Uso agentico declarado por el autor (etiquetas `agentic` y `tool-use`), sin detalles sobre razonamiento multi-paso ni planificacion.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Despliegue local de un asistente conversacional con tool calling en una GPU de consumo de 12 GB: el fichero Q5_K_M y la cache KV en q8_0 permiten servir el modelo con llama-server y 32.768 tokens de contexto, suficiente para sesiones de chat con historial largo.
- Prototipado de agentes con herramientas en estaciones de trabajo sin GPU de datacenter: la integracion con llama.cpp `--jinja` permite definir funciones y probar flujos de llamada a herramientas sin infraestructura adicional.
- Evaluacion comparativa de ajustes finos orientados a agentes: al ser un modelo pequeno y cuantizado, sirve como banco de pruebas para medir la fiabilidad de tool calling antes de invertir en modelos mayores.
- Generacion de texto asistida en local con control de privacidad: al ejecutarse integramente en la maquina del usuario, es adecuado para borradores y resumenes sobre documentos que no deben salir del entorno.
- Razonamiento con modo thinking desactivable: util en pipelines donde se requiere latencia baja por defecto y activacion puntual del razonamiento extendido en consultas complejas.
- Backend de pruebas para aplicaciones cliente basadas en la API compatible de llama-server: permite desarrollar y depurar la capa de integracion (endpoints, streaming, plantillas) sin depender de servicios externos.
- Despliegue en Ollama para experimentacion rapida: el autor documenta la creacion de un Modelfile, aunque advierte que el tool calling es menos fiable por esta via.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por el autor es la prueba de humo de exportacion con llama.cpp, cuyo resultado fue `{"tool_call": false, "tool_result_used": false}`, es decir, sin llamada a herramienta emitida ni uso del resultado en esa prueba concreta.

## Requisitos de hardware

- VRAM estimada: el fichero Q5_K_M ocupa aproximadamente 6,6 GB; con cache KV en q8_0 y 32.768 tokens de contexto, el autor indica que cabe en una GPU de 12 GB.
- GPU recomendadas: el autor valida explicitamente el escenario de 12 GB; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: si, en tarjetas de 12 GB o superiores con el contexto indicado; el contexto puede ampliarse vigilando el consumo de VRAM gracias a la atencion hibrida.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`, `-ngl 99`, `-fa on`, `-ctk q8_0`, `-ctv q8_0`) y Ollama mediante Modelfile. No se documenta soporte de vLLM ni TGI para este fichero GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- La prueba de humo del propio autor no registro llamada a herramienta ni uso del resultado, lo que cuestiona la fiabilidad del tool calling declarado.
- Cero descargas y un unico "like" en el momento de la consulta: no hay evidencia de uso por terceros ni de validacion externa.
- Licencia no declarada: no puede asumirse permiso para uso comercial; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se haya usado en el ajuste.
- Arquitectura, datos de entrenamiento y proceso de alineacion no documentados, lo que impide evaluar sesgos conocidos o el riesgo de alucinacion con fundamento.
- Un unico formato de cuantizacion (Q5_K_M): no hay opciones de menor precision para entornos con menos VRAM ni de mayor precision para evaluacion.
- El modelo es un ajuste fino de un modelo derivado (LoosiFR/qwen35-9b-agentic-v2.5), sin publicacion de la receta de entrenamiento; los riesgos de sobreajuste al formato de herramientas son desconocidos.
- El contexto de 32.768 tokens es la configuracion de arranque sugerida, no un limite maximo verificado.
- Para produccion se recomienda validar el comportamiento de tool calling con un conjunto propio de pruebas antes de confiar en el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LoosiFR/qwen35-9b-agentic-v2.5-GGUF
- Modelo base: https://huggingface.co/LoosiFR/qwen35-9b-agentic-v2.5
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
