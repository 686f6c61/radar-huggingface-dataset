# K-Ai-Official/Kanata-S2-8B

## Resumen

Kanata S2-8B es un modelo de lenguaje de 8.190 millones de parametros desarrollado por K-Ai (Kortex AI) como segunda iteracion de su familia de modelos agenticos Kanata. Se construye mediante QLoRA sobre Qwen3-8B-Base y esta especializado en tool calling, function calling, resolucion de problemas en multiples pasos y generacion de codigo, con soporte explicito para indonesio, japones e ingles. Su relevancia radica en que aborda las carencias de formato detectadas en su predecesor Kanata S1-3B (que fallaba sistematicamente en japones) mediante una base mas capaz, serializacion nativa del formato `<tool_call>` de Qwen3/Hermes y una auditoria explicita del dataset.

El modelo emplea la plantilla de chat estandar de Qwen3 sin modificaciones, lo que facilita su integracion en runtimes de agentes existentes. Se distribuye bajo licencia Apache 2.0 con pesos en safetensors y un total de 8.190.735.360 parametros. El entrenamiento se realizo en una unica NVIDIA T4 de 16 GB durante 57,4 minutos (150 pasos de optimizador), lo que da una idea del presupuesto computacional limitado con el que se construyo.

Es importante subrayar que Kanata S2-8B no es un modelo de proposito general: el propio autor lo posiciona como una herramienta especializada para agentes multilingues y codigo, remitiendo a otros modelos de la familia para asistencia general. La longitud de contexto durante el entrenamiento fue de solo 1024 tokens, y el comportamiento en contextos largos no fue ajustado ni evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento; contexto nativo de la base no especificado en la informacion disponible |
| Tipos de cuantizacion | 4-bit NF4 durante el entrenamiento (QLoRA); pesos publicados en 16-bit; otras cuantizaciones no disponibles |
| Idiomas soportados | indonesio (id), japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Kanata S2-8B parte de Qwen3-8B-Base, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parametros. El ajuste se realizo mediante QLoRA con cuantizacion 4-bit NF4, rango LoRA r=16, alpha=32, aplicado a todas las proyecciones de atencion y MLP. El adaptador resultante se fusiono con la base y se publico en 16-bit. El entrenamiento consistio en una unica pasada sobre un subconjunto curado de 2.400 muestras, con 150 pasos de optimizador, ejecutado en una sola NVIDIA T4 de 16 GB en Google Colab (57,4 minutos).

El dataset combina fuentes publicas y datos sinteticos generados por K-Ai. Las fuentes principales son `NousResearch/hermes-function-calling-v1` (function calling en ingles), `m-a-p/CodeFeedback-Filtered-Instruction` y `ise-uiuc/Magicoder-OSS-Instruct-75K` (codigo en ingles), `kunishou/databricks-dolly-15k-ja` (japones general) y `FreedomIntelligence/alpaca-gpt4-indonesian` (indonesio general), ademas de un modulo sintetico de tool calling agentico, aclaracion de argumentos, respuesta sin herramienta y recuperacion de errores en los tres idiomas. La distribucion final de muestras por idioma fue: 1272 en ingles, 564 en japones y 564 en indonesio. Todas las fuentes pasaron validacion de esquema, reserializacion canonica de tool calls a JSON, deduplicacion exacta y verificacion de fuga entre splits por hash del primer prompt del usuario (0 solapamientos). Las estadisticas de rechazo por fuente se documentan en `dataset_audit.json`.

La innovacion principal no esta en la arquitectura sino en el pipeline de datos y en la decision de mantener intacta la plantilla de chat de Qwen3, de modo que el formato `<tool_call>` sea nativo y compatible con el ecosistema Hermes/Qwen. El modelo solo genera llamadas a herramientas; la ejecucion corre a cargo del runtime del agente, que debe devolver el resultado en un mensaje `tool`.

## Capacidades

- Generacion de texto conversacional en indonesio, japones e ingles.
- Tool calling y function calling con formato nativo `<tool_call>` y argumentos en JSON valido.
- Seleccion de herramienta entre distractores.
- Solicitud de argumentos obligatorios faltantes (aclaracion).
- Respuesta directa sin invocar herramienta cuando no es necesaria.
- Interpretacion de resultados devueltos por herramientas.
- Recuperacion ante errores de herramientas.
- Generacion de codigo y resolucion de problemas de programacion (entrenado con CodeFeedback y Magicoder).
- Razonamiento multi-paso orientado a agentes.
- Capacidad multilingue limitada a id/ja/en.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat (heredado de Qwen3).

## Casos de uso

- Agentes de atencion al cliente en indonesio o japones: el modelo puede emitir llamadas a funciones como consulta de pedido o cambio de direccion con argumentos JSON validos, y pedir aclaracion cuando falta un dato obligatorio, lo que reduce errores en flujos transaccionales.
- Orquestacion de herramientas en asistentes de productividad: seleccion entre varias funciones disponibles (calendario, correo, busqueda) con recuperacion ante fallos de la herramienta, adecuado porque fue entrenado explicitamente en seleccion entre distractores y manejo de errores.
- Generacion de codigo en pipelines de CI/CD: el modelo puede producir parches o snippets a partir de instrucciones en ingles, apoyandose en el ajuste sobre CodeFeedback y Magicoder, e integrarse via tool calling en un runner que aplique y valide los cambios.
- Copiloto de desarrollo para equipos en Japon o Indonesia: asistencia de codigo y explicaciones tecnicas en el idioma local, cubriendo la brecha de modelos especializados en estas lenguas.
- Automatizacion de tareas administrativas multilingues: extraccion y estructuracion de datos mediante llamadas a funciones que devuelven JSON canonico, aprovechando la reserializacion de argumentos aprendida en entrenamiento.
- Backend de agentes con runtime propio: al mantener la plantilla Qwen3 intacta, puede desplegarse en frameworks que ya soportan el formato Hermes `<tool_call>` sin adaptadores adicionales.
- Prototipado rapido en entornos con recursos limitados: al haberse entrenado en una T4, es viable ajustarlo o servirlo en hardware modesto para pruebas de concepto agenticas.

## Benchmarks y rendimiento

El autor declara que las cifras proceden de `eval_results.json` generado por el notebook de entrenamiento y que son evaluaciones internas de pequena escala, no leaderboards publicos. La informacion disponible no incluye los valores numericos concretos de dichas evaluaciones, solo su existencia y su caracter de "smoke-level". Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor menciona evaluaciones held-out por idioma y una prueba con herramientas no vistas (`unseen-tool`), pero no se proporcionan las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en 16-bit: aproximadamente 16-17 GB (8,19 mil millones de parametros a 2 bytes por parametro mas overhead).
- VRAM estimada en 8-bit: aproximadamente 9-10 GB.
- VRAM estimada en 4-bit (GGUF/AWQ/GPTQ): aproximadamente 5-6 GB.
- GPU recomendadas: NVIDIA A100 40 GB o H100 para servicio en 16-bit con concurrencia; RTX 4090 (24 GB) para inferencia en 16-bit en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en 16-bit; en RTX 4070 Ti/4080 (12-16 GB) en 8-bit; en GPUs de 8 GB en 4-bit.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (tag `text-generation-inference` presente), vLLM y llama.cpp/Ollama previsiblemente compatibles al derivar de Qwen3, aunque no se documentan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento se ejecuto en una T4, pero no se publican metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kanata S2-8B | 8,19 B | 1024 en entrenamiento | id, ja, en | Apache 2.0 | Agentes y codigo multilingue |
| Qwen3-8B (base) | ~8 B | contexto nativo no especificado aqui | multilingue amplio | Apache 2.0 | Proposito general |
| Kanata S1-3B | ~3 B | no disponible | id, ja, en | Apache 2.0 | Primer experimento agentico |
| Modelos agenticos de 7-9 B (familia Hermes/Qwen) | 7-9 B | variable | en predominante | variable | Tool calling |

Frente a Qwen3-8B, Kanata S2-8B anade especializacion en tool calling multilingue y codigo, pero pierde amplitud de proposito general y no fue ajustado para contexto largo. Frente a Kanata S1-3B, duplica con creces el tamano, cambia de base (de IBM Granite 4.1 3B a Qwen3-8B) y corrige los fallos de formato en japones documentados por el autor. No se dispone de datos de rendimiento comparativos publicos con otros modelos agenticos de la misma categoria.

## Limitaciones y advertencias

- Modelo no de proposito general: el autor lo restringe a agentes y codigo; para asistencia general recomienda otros modelos de la familia.
- Contexto de entrenamiento de solo 1024 tokens: el comportamiento en contextos largos no fue ajustado ni evaluado, por lo que puede degradarse fuera de esa ventana.
- Dataset de entrenamiento muy pequeno (2.400 muestras) y presupuesto computacional limitado (150 pasos), lo que sugiere menor robustez que modelos ajustados a mayor escala.
- Evaluaciones internas de tipo smoke-level, sin cifras publicas ni validacion en leaderboards independientes.
- Riesgo de alucinacion en tool calls: aunque se entrena la emision de JSON valido, el modelo puede inventar nombres de herramientas o argumentos no presentes en el esquema.
- El modelo no ejecuta herramientas; depende totalmente del runtime del agente para la ejecucion y el retorno de resultados.
- Cobertura limitada a tres idiomas (id, ja, en); el rendimiento fuera de ellos no esta garantizado.
- Licencias de datos heterogeneas: algunas fuentes son share-alike (cc-by-sa-3.0 en dolly-ja), por lo que la redistribucion comercial de datos derivados del entrenamiento requiere verificacion legal independiente.
- Sesgos no documentados: no se publica informacion sobre sesgos demograficos, culturales o linguisticos.
- Modelo con muy baja adopcion (0 descargas, 1 like en el momento de la consulta), sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-Ai-Official/Kanata-S2-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Adaptador LoRA: https://huggingface.co/Keanualfahd/Kanata-S2-8B-LoRA
- Predecesor Kanata S1-3B: https://huggingface.co/K-Ai-Official/Kanata-S1-3B
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset CodeFeedback: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset Magicoder OSS Instruct: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset Dolly 15k japones: https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Dataset Alpaca GPT4 indonesio: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
