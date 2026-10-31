# loscrossos/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario loscrossos en Hugging Face en colaboración con el equipo de huihui.ai. El proceso de abliteration elimina las conductas de negación del modelo original sin necesidad de reentrenamiento completo, lo que lo hace adecuado para casos de uso donde los filtros de seguridad estándar resultan restrictivos, como la escritura de ficción madura o ciertos flujos de programación.

El modelo base es Qwen3.8-Flash-Next, un modelo de arquitectura MoE (mixture of experts) con 176.943 millones de parámetros totales, capaz de procesar texto e imágenes (pipeline image-text-to-text). Esta versión v2 ajusta el énfasis de la abliteration respecto a la primera versión y, según el autor, no ablitera ninguno de los expertos, lo que lo hace especialmente adecuado para escritura de novelas y programación.

Los pesos se distribuyen en formato GGUF con cuantizaciones de tipo dynamic (UD, imatrix) generadas a partir de los GGUF de unsloth, lo que permite su ejecución local mediante llama.cpp y herramientas compatibles. El repositorio pesa aproximadamente 952,7 GB, lo que indica la presencia de múltiples cuantizaciones y series (unsloth, Swift, Strata).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer multimodal (image-text-to-text) |
| Parametros totales | 176.943.899.520 (176,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo con `-c 262144`) |
| Tipos de cuantizacion | UD-Q4_K_XL (con imatrix); otras cuantizaciones presentes en el repo pero no detalladas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other") |
| Formato de pesos | GGUF (derivado de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un transformer de tipo MoE con 176,9 mil millones de parámetros totales, etiquetado con las capacidades de razonamiento (reasoning), efficient-thinking y token-efficient post-training. Al tratarse de un pipeline image-text-to-text, incorpora capacidad de comprensión de imágenes además de texto. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni los procesos de RLHF/DPO aplicados.

La variante aquí descrita no modifica la arquitectura: aplica abliteration, una técnica que identifica y neutraliza las direcciones de activación responsables de los rechazos de seguridad en el modelo. Según la model card, en esta v2 se ha ajustado el énfasis de la abliteration respecto a la v1 y no se ha abliterated ningún experto del MoE, preservando así el comportamiento de los expertos para tareas de escritura y programación. Las cuantizaciones GGUF se han generado con imatrix (matriz de importancia) calculada sobre el corpus calibration3.txt, y la versión UD-Q4_K_XL-V2 muestra una ligera reducción de la perplejidad respecto a la versión anterior.

## Capacidades

- Generación de texto general con razonamiento (reasoning) y modos de pensamiento eficiente en tokens (efficient-thinking, token-efficient).
- Comprensión de imágenes junto con texto (pipeline image-text-to-text heredado del modelo base).
- Generación de codigo: el autor señala expresamente que esta versión es adecuada para programación.
- Escritura creativa de ficción sin filtros de rechazo, incluido contenido que el modelo original rechazaría.
- Ventana de contexto amplia (hasta 262.144 tokens según el ejemplo de uso), apta para documentos largos y conversaciones multi-turno.
- Soporte de tool calling y agentes: no disponible (no se menciona en la model card).
- Ejecución local mediante llama.cpp, Strata y herramientas compatibles con GGUF.

## Casos de uso

- Escritura de novelas y ficción madura: al eliminar los rechazos sin abliterated los expertos, el modelo mantiene la calidad narrativa del modelo base mientras permite contenido que otros modelos rechazan; el autor lo recomienda expresamente para este caso.
- Programacion y revision de codigo: el modelo puede analizar bases de código extensas gracias a su contexto de 262K tokens y generar o depurar código sin negaciones que interrumpan el flujo de trabajo.
- Analisis de documentos largos: la ventana de contexto de 262.144 tokens permite procesar contratos, informes o corpus técnicos completos en una sola pasada.
- Investigacion en seguridad y alineamiento: al ser una versión abliterated documentada, sirve como sujeto de estudio para investigar cómo la abliteration afecta al comportamiento de modelos MoE.
- Descripcion local de imagenes con texto: como modelo image-text-to-text, puede usarse en pipelines locales de análisis visual donde los filtros estándar dificulten el trabajo con imágenes sensibles.
- Experimentacion con inferencia eficiente en hardware de consumo: las cuantizaciones UD-Q4_K_XL con imatrix permiten explorar el compromiso entre calidad (perplejidad) y requisitos de memoria en modelos de gran tamaño.
- Chatbots sin restricciones en entornos controlados: despliegues de investigación o de uso personal donde se necesita un asistente conversacional sin capas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es que la version UD-Q4_K_XL-V2 reduce ligeramente la perplejidad (PPL) respecto a la primera version, sin que se facilite el valor numerico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia indirecta, un modelo de 176,9 mil millones de parametros en Q4_K_XL ocupa tipicamente en torno a 95-105 GB solo de pesos, por lo que se necesita al menos una GPU de 128 GB de VRAM (o configuraciones multi-GPU) para ejecutarlo completamente en GPU; con descarga parcial a CPU/RAM, menos VRAM pero mayor latencia.
- GPU recomendadas: no disponible; por el tamaño, serian adecuadas configuraciones tipo 2x NVIDIA A100 80GB, 2x H100 80GB, o Apple Silicon con memoria unificada de 128 GB o mas (Mac Studio M3 Ultra, por ejemplo).
- Consumer GPU: no cabe integramente en GPUs de consumo estandar (RTX 4090 con 24 GB, RTX 5090 con 32 GB); seria necesario offload a RAM, con penalizacion severa de velocidad.
- Despliegue: llama.cpp (version b11540 o posterior, probado por el autor), Strata (con verificacion SHA256 para la serie unsloth), y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.). No se menciona soporte para vLLM o TGI al tratarse de GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | 176,9 B | MoE | 262.144 tokens | qwen-community-1.0 | GGUF |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 176,9 B | MoE | no disponible | qwen-community-1.0 | safetensors |
| unsloth/Qwen3.8-Flash-Next-GGUF | 176,9 B | MoE | no disponible | qwen-community-1.0 | GGUF |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF |

La principal diferencia de esta variante frente al modelo base y las cuantizaciones de unsloth es la abliteration: elimina los rechazos de seguridad manteniendo intactos los expertos del MoE en esta v2.

## Limitaciones y advertencias

- Contenido sensible: la model card advierte explicitamente de riesgo de generacion de contenido sensible, controversial o inapropiado, dado que el filtrado de seguridad se ha reducido significativamente.
- No apto para todos los publicos: las salidas pueden ser inapropiadas para entornos publicos, menores de edad o aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica: el usuario es el unico responsable de que el uso cumpla la legislacion local y las normas eticas; huihui.ai no ofrece garantias de seguridad por defecto.
- Uso recomendado solo en investigacion o entornos controlados: la propia model card desaconseja su uso directo en produccion o aplicaciones comerciales publicas.
- Riesgo de alucinacion: no disponible como dato especifico, pero al tratarse de un modelo abliterated sin optimizacion de seguridad adicional, conviene revisar manualmente las salidas.
- Idiomas: no disponible en la informacion proporcionada.
- Restricciones de licencia: el modelo hereda la licencia qwen-community-1.0 del modelo base; sus terminos exactos para uso comercial no estan detallados en la model card, por lo que conviene revisar el archivo LICENSE antes de cualquier despliegue comercial.
- Tamano del repositorio (952,7 GB): la descarga completa requiere considerable ancho de banda y almacenamiento; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Ficha del modelo (este repo): https://huggingface.co/loscrossos/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Version original de huihui-ai (referenciada en la model card): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Primera version de la abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- GGUF de unsloth (origen de los cuantizados): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Herramienta de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Strata (herramienta de descarga con verificacion): https://github.com/Niko1221/Strata
- llama.cpp (release b11540 usada en las pruebas): https://github.com/ggml-org/llama.cpp/releases/tag/b11540
