# lmsolo-community/Ministral-3-3B-Instruct-2512-GGUF

## Resumen

Ministral 3 3B Instruct 2512 es un modelo de lenguaje compacto con capacidades de vision desarrollado por Mistral AI, distribuido en este repositorio como cuantizacion GGUF `Q4_K_M` por el usuario lmsolo-community. Se trata del miembro mas pequeno de la familia Ministral 3, disenado especificamente para despliegue en el borde (edge) y en hardware de consumo. Combina un modelo de lenguaje de 3.429.006.336 parametros con un codificador visual de aproximadamente 0,4B de parametros, lo que permite procesar imagenes ademas de texto.

El modelo resuelve el problema de disponer de capacidades de razonamiento, vision y uso de herramientas en entornos con recursos limitados: segun la model card, cabe en 8 GB de VRAM en FP8 y en menos si se cuantiza adicionalmente. Su ventana de contexto alcanza los 256k tokens, un valor notable para su tamano, y soporta once idiomas declarados explicitamente (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).

Es relevante ahora porque la licencia Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales, y porque integra function calling nativo y salida JSON, lo que lo posiciona como candidato para pipelines agenticos ligeros y aplicaciones locales. La version 2512 corresponde a la iteracion de diciembre de 2025 del modelo base publicado por Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual (3,4B de lenguaje + ~0,4B de vision) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | GGUF; este repositorio contiene `Q4_K_M` (la model card menciona FP8 y niveles adicionales en el repo original) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye proyector de vision) |

## Arquitectura y entrenamiento

La informacion disponible indica que Ministral 3 3B se compone de dos bloques: un modelo de lenguaje de 3,4B de parametros y un codificador visual de 0,4B. La model card no detalla la arquitectura interna del transformer (numero de capas, dimensiones ocultas, mecanismo de atencion) ni el numero exacto de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica si emplea decodificacion especulativa u otras optimizaciones de inferencia.

El modelo base es `mistralai/Ministral-3-3B-Instruct-2512`, una version post-entrenada para instrucciones. La unica transformacion aplicada en este repositorio es la cuantizacion a `Q4_K_M`, que segun la model card se realiza "sin modificar" respecto al GGUF oficial de Mistral AI, incluyendo el proyector de vision. Para detalles de arquitectura y entrenamiento se remite al paper arXiv:2601.08584 y al blog de Mistral AI.

## Capacidades

- Generacion de texto e instrucciones conversacionales multi-turno.
- Vision: analisis de imagenes y respuesta basada en contenido visual.
- Function calling nativo y salida en formato JSON, orientado a sistemas agenticos.
- Razonamiento multi-paso en el contexto de agentes con herramientas.
- Multilingue: once idiomas declarados (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Adherencia fuerte a system prompts, segun la model card.
- Contexto largo de 256k tokens para documentos extensos o historiales largos.
- Optimizado para edge: ejecutable en hardware de consumo.

## Casos de uso

- **Asistente local en dispositivos de borde**: con cuantizacion `Q4_K_M` y un modelo de 3,4B, puede desplegarse en portatiles o mini-PC con GPU integrada o dedicada de gama baja, ofreciendo chat y analisis de imagenes sin conexion a la nube.
- **Atencion al cliente automatizada**: la ventana de 256k tokens permite mantener conversaciones multi-turno con historial extenso y documentacion de producto inyectada en el contexto, manteniendo la adherencia al system prompt.
- **Analisis de documentos e imagenes en local**: el codificador visual de 0,4B permite extraer informacion de capturas, formularios o diagramas; la model card recomienda mantener relaciones de aspecto cercanas a 1:1 y recortar imagenes muy alargadas.
- **Agentes con function calling en pipelines ligeros**: la salida JSON nativa y el soporte de herramientas lo hacen adecuado para orquestar APIs en flujos de automatizacion, limitando el numero de herramientas expuestas para evitar sobrecarga.
- **Generacion de codigo y asistencia en IDE**: con temperatura inferior a 0,1 (recomendacion de la model card) puede integrarse como autocompletado o generador de fragmentos en entornos con recursos limitados.
- **Procesamiento multilingue en produccion**: soporte declarado de once idiomas para clasificacion, resumen o traduccion en aplicaciones que requieran cobertura europea y asiatica sin depender de servicios externos.
- **Prototipado rapido con licencia permisiva**: Apache 2.0 permite iterar y desplegar comercialmente sin negociacion de licencia, util para validar productos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: la model card indica que el modelo en FP8 cabe en 8 GB de VRAM; la cuantizacion `Q4_K_M` de este repositorio reduce el requisito por debajo de esa cifra (el repo completo ocupa 16 GB, incluyendo multiples ficheros y el proyector de vision).
- **GPU recomendadas**: no se especifican modelos concretos en la informacion disponible. Por tamano, es viable en GPUs de consumo con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070) y en GPUs de datacenter (A100, H100) para despliegues de mayor concurrencia.
- **Consumer GPU**: si, segun la model card el modelo esta disenado para ejecutarse localmente y cabe en 8 GB en FP8, y menos con cuantizacion adicional.
- **Opciones de despliegue**: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF; la model card no detalla soporte de vLLM o TGI para esta variante cuantizada.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 (este) | 3,4B + 0,4B vision | 256k | Si | Apache 2.0 | GGUF en HF |
| Mistral 7B Instruct | 7B | no disponible en la informacion | No | Apache 2.0 | HF |
| Qwen2.5-VL 3B | ~3B | no disponible en la informacion | Si | no disponible en la informacion | HF |

La comparativa con alternativas concretas no puede completarse con rigor porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas de los modelos comparables. Los modelos citados son referencias de categoria (tamano similar o con vision) y sus datos deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos especificos en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos.
- **Alucinacion**: no se cuantifica la tasa de alucinacion; en un modelo de 3,4B el riesgo es relevante en tareas de conocimiento factual y debe mitigarse con verificacion externa.
- **Contexto e idioma**: aunque declara 256k de contexto, el rendimiento efectivo en contextos muy largos no esta documentado; el soporte de once idiomas no garantiza calidad homogenea entre ellos.
- **Vision**: la model card advierte que se eviten imagenes con relaciones de aspecto muy extremas; conviene recortarlas a ~1:1.
- **Uso de herramientas**: se recomienda limitar el numero de herramientas expuestas para evitar degradacion en sistemas agenticos.
- **Temperatura**: para produccion se recomienda temperatura inferior a 0,1; valores superiores pueden degradar la adherencia a instrucciones.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card exige no infringir derechos de terceros, incluida propiedad intelectual.
- **Repositorio de terceros**: esta cuantizacion la publica lmsolo-community, no Mistral AI; conviene verificar la integridad de los pesos frente al GGUF oficial antes de usarla en produccion.
- **Inferencia**: la model card marca `inference: false`, lo que indica que el repositorio no incluye un endpoint de inferencia gestionado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmsolo-community/Ministral-3-3B-Instruct-2512-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- GGUF oficial de Mistral AI: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF
- Blog de Mistral AI: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
