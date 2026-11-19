# maritaca-ai/S5-nano

## Resumen

S5-nano es un modelo multimodal de tipo image-text-to-text desarrollado por Maritaca AI, construido sobre Qwen3.5-4B mediante preentrenamiento continuado y posterior post-entrenamiento. Con 4.659.865.088 parámetros totales (aproximadamente 4,6 mil millones), está disenado para ofrecer un rendimiento notable en tareas en portugues de Brasil, manteniendo a la vez buenas capacidades en function calling, uso de herramientas y salidas estructuradas. Es relevante porque combina un tamano compacto con una ventana de contexto de hasta 262.144 tokens, lo que lo hace adecuado para despliegues con requisitos moderados de hardware.

El modelo incorpora dos modos de operacion: Think, que razona antes de responder (modo por defecto), e Instruct, que responde directamente sin paso de razonamiento. Los pesos incluyen una capa MTP (multi-token prediction) que habilita decodificacion especulativa, lo que puede mejorar el throughput en inferencia. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en entornos comerciales.

La version principal en BF16 ocupa 9,3 GB, con variantes FP8 (5,8 GB) y GGUF (desde 2,8 GB en Q4_K_M) para diferentes entornos de despliegue. El modelo soporta portugues e ingles, y su pipeline principal es image-text-to-text, lo que indica capacidades multimodales de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B, con capa MTP para decodificacion especulativa |
| Parametros totales | 4.659.865.088 (aproximadamente 4,6 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8 (E4M3 en capas lineales), GGUF (BF16, Q8_0, Q4_K_M) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), FP8, GGUF |

## Arquitectura y entrenamiento

S5-nano se basa en la arquitectura de Qwen3.5-4B, un transformer multimodal que procesa entradas de imagen y texto. Maritaca AI aplico un proceso de preentrenamiento continuado sobre el modelo base, seguido de un post-entrenamiento orientado a mejorar el rendimiento en benchmarks brasilenos y en tareas de function calling, uso de herramientas y salidas estructuradas. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

Una innovacion destacable es la inclusion de una capa MTP (multi-token prediction) en los pesos, que permite decodificacion especulativa y puede acelerar la generacion. El modelo ofrece dos modos de inferencia (Think e Instruct) que permiten al usuario elegir entre un razonamiento explicito antes de responder o una respuesta directa. La version FP8 utiliza pesos E4M3 para capas lineales con una escala por canal de salida y cuantiza activaciones dinamicamente por token durante la inferencia, manteniendo en BF16 los embeddings, el codificador de vision, la capa MTP y algunas proyecciones pequenas.

## Capacidades

- Generacion de texto y razonamiento en dos modos: Think (razonamiento previo) e Instruct (respuesta directa).
- Procesamiento multimodal image-text-to-text: acepta entradas de imagen y texto.
- Soporte de function calling y tool use, con enfasis en salidas estructuradas.
- Capacidades de agentes y razonamiento multi-paso, potenciadas por el modo Think.
- Rendimiento mejorado en benchmarks brasilenos (portugues de Brasil) y en portugues traducido.
- Soporte multilingue limitado a portugues e ingles.
- Decodificacion especulativa mediante capa MTP integrada en los pesos.
- Ventana de contexto de hasta 262.144 tokens para conversaciones y documentos largos.

## Casos de uso

- Atencion al cliente automatizada en portugues de Brasil: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo coherencia en dialogos extensos y usando el modo Instruct para respuestas rapidas.
- Generacion de codigo y salidas estructuradas en produccion: su soporte de function calling y tool use permite integrarlo en pipelines de CI/CD para generar JSON, llamadas a APIs o fragmentos de codigo con formato validado.
- Asistentes virtuales con razonamiento multi-paso: el modo Think habilita la resolucion de tareas complejas que requieren planificacion, como la automatizacion de flujos de trabajo con multiples herramientas.
- Procesamiento de documentos con imagenes: al ser un modelo image-text-to-text, puede extraer informacion de capturas, formularios o graficos combinados con texto, util en entornos de digitalizacion y analisis documental.
- Analisis de sentimiento y moderacion de contenido en redes sociales brasilenas: su entrenamiento especifico en portugues de Brasil y su contexto largo permiten procesar hilos completos y comentarios extensos.
- Despliegue en entornos con recursos limitados: las versiones GGUF (Q4_K_M de 2,8 GB) y FP8 (5,8 GB) permiten ejecutar el modelo en GPUs de consumo o en servidores con VRAM moderada, facilitando prototipado y pruebas locales.
- Generacion de contenido y resumenes en portugues: el modelo puede resumir articulos, generar respuestas contextualizadas y adaptar tono y estilo, aprovechando su ventana de contexto para documentos largos.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al checkpoint original S5-nano evaluado en BF16 sobre tareas de texto. Se presentan medias ponderadas por metrica principal, con cobertura de 23 benchmarks en modo Think. No se dispone de resultados detallados por benchmark individual en la informacion proporcionada.

| Modelo | Modo | Nativo BR | PT traducido | No nativo | Total | Cobertura |
|---|---|---|---|---|---|---|
| S5-nano | Think | 83,74 | 86,94 | 54,11 | 75,25 | 23/23 |
| Qwen3.5-4B | Think | 72,49 | No disponible | No disponible | No disponible | No disponible |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K de forma individual, ni comparativas adicionales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; FP8 reduce a unos 5,8 GB; GGUF Q4_K_M ocupa 2,8 GB.
- GPU recomendadas: para BF16, GPUs con 16-24 GB de VRAM (RTX 4090, A100 40GB, H100); para FP8, GPUs con soporte nativo FP8 (Ada, Hopper, Blackwell) como RTX 4090, L40S, H100; para GGUF, GPUs de consumo con 8-12 GB (RTX 3060, RTX 4070) o incluso CPU con llama.cpp.
- Cabe en GPU de consumo: si, en versiones GGUF Q4_K_M (2,8 GB) o Q8_0 (4,6 GB) en GPUs con 8 GB o mas; la version FP8 en GPUs Ada o superiores con 8-12 GB.
- Opciones de despliegue: vLLM y SGLang para BF16 y FP8; llama.cpp y aplicaciones compatibles para GGUF; transformers como libreria base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La capa MTP permite decodificacion especulativa, lo que puede mejorar el throughput, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Idiomas |
|---|---|---|---|---|---|
| S5-nano | 4,6B | 262.144 | Apache 2.0 | Safetensors, FP8, GGUF | pt, en |
| Qwen3.5-4B | 4B (aproximado) | No disponible | No disponible | No disponible | No disponible |
| Otros modelos de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion disponible solo permite comparar con Qwen3.5-4B, del cual se conoce el rendimiento en modo Think para nativo BR (72,49 frente a 83,74 de S5-nano). No se dispone de datos de contexto, licencia ni formatos de Qwen3.5-4B en la informacion proporcionada. No se conocen otros modelos comparables en la misma categoria con datos suficientes.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero al estar entrenado principalmente con datos en portugues de Brasil, puede presentar sesgos culturales y linguisticos hacia esa region.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en el modo Think si el razonamiento intermedio no se valida.
- Limitaciones de contexto o idioma: el soporte linguistico se limita a portugues e ingles; el rendimiento en otros idiomas no esta garantizado. La ventana de 262.144 tokens es amplia, pero el rendimiento en contextos muy largos puede degradarse.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base Qwen3.5-4B si se redistribuye o modifica.
- Caveats para produccion: el modo Think por defecto anade latencia al generar razonamiento antes de la respuesta; para aplicaciones de baja latencia se recomienda el modo Instruct. La cuantizacion FP8 requiere GPUs con soporte nativo para mantener el rendimiento. No se proporcionan garantias de exactitud en function calling ni en salidas estructuradas en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maritaca-ai/S5-nano
- Version FP8: https://huggingface.co/maritaca-ai/S5-nano-FP8
- Version GGUF: https://huggingface.co/maritaca-ai/S5-nano-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Observatorio Maritaca (resultados de evaluacion): https://maritaca-ai.github.io/observatorio-maritaca/
