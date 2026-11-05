# heypatkay/solume-flux2-erase-coreml

## Resumen

solume-flux2-erase-coreml es una conversión a Core ML de FLUX.2 [klein] 4B, el modelo de difusión de texto a imagen de 4.000 millones de parámetros desarrollado por Black Forest Labs, con el LoRA de eliminación de objetos erase_v1 (de slopshop) fusionado directamente en los pesos del transformer. El resultado es un modelo de image-to-image especializado en inpainting y borrado de objetos, empaquetado como ML Program de Core ML para ejecutarse de forma nativa en Apple Silicon. Lo publica heypatkay como artefacto de distribución para Solume, una aplicación de fotografía para macOS.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras conversiones públicas de FLUX.2 [klein] 4B a Core ML, con detalles verificables de procedencia (hashes SHA-256 de los pesos base y del LoRA, versiones exactas de la cadena de herramientas). Por otro, ilustra un patrón de despliegue en el que el prompt de texto se elimina por completo: el LoRA incluye un embedding de prompt precalculado (`prompts.bin`), de modo que el paquete no incluye codificador de texto y la tarea queda fijada a "borrar la región indicada".

El modelo no es de propósito general: es un artefacto de un solo uso, determinista en su configuración de conversión, pensado para integrarse en una app de escritorio que descarga los ficheros desde un commit fijado y los valida por tamaño y SHA-256 antes de instalarlos. La licencia Apache 2.0 se hereda tanto de FLUX.2 [klein] 4B como del LoRA erase_v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 [klein] 4B) convertido a Core ML ML Program; VAE con parcheado 2x2 |
| Parametros totales | 4B en el modelo base (FLUX.2 [klein] 4B); pesos del transformer cuantizados a int8 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin codificador de texto, prompt precalculado) |
| Tipos de cuantizacion | int8 lineal en pesos del transformer; cómputo fp16; LayerNorms en fp32; VAE en fp32 |
| Idiomas soportados | no disponible (sin codificador de texto; prompt fijo embebido) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`.mlpackage` con `weight.bin`) |
| Resolución de salida | 1024 px de lado (side 1024) |
| Pasos de muestreo | 4 pasos, sin guidance (modelo destilado por pasos) |
| Tamano del repo | 4,2 GB |
| Fecha de conversión | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo base es FLUX.2 [klein] 4B, un transformer de difusión de 4.000 millones de parámetros destilado por pasos: genera en 4 pasos de muestreo sin classifier-free guidance, lo que reduce drásticamente el coste de inferencia frente a configuraciones de 20-50 pasos. Sobre ese transformer se fusiona el LoRA erase_v1 (rank 32, alpha 32) de slopshop, entrenado para eliminación de objetos, y se incorpora su embedding de prompt precalculado en bf16, convertido a fp32 en el paquete final. No se ha realizado ningún fine-tuning adicional durante la conversión: los pesos son los del modelo base más la fusión del LoRA.

La conversión, realizada por Solume con coremltools 9.0 sobre Python 3.12, torch 2.15.0, diffusers 0.42.1 y transformers 5.22.0 en macOS 27 sobre Apple silicon, aplica cuantización lineal int8 a los pesos del transformer con cómputo fp16, LayerNorms en fp32 y flujos residuales escalados por 1/32. El codificador y el decodificador del VAE se convierten como ML Programs en fp32, incorporando el parcheado 2x2 y la normalización batch-norm de FLUX.2 directamente en el grafo. La salida es determinista para la cadena de herramientas fijada (identificadores de Manifest y fecha de conversión constantes). El paquete no incluye codificador de texto: el prompt vive en `prompts.bin` y `prompts.json`.

## Capacidades

- Eliminación de objetos (object removal) sobre una imagen de entrada y una máscara de región, con un prompt fijo embebido.
- Inpainting guiado por máscara: reconstruye la zona borrada de forma coherente con el resto de la fotografía.
- Image-to-image con resolución de trabajo de 1024 px de lado.
- Inferencia en 4 pasos sin guidance, adecuada para ejecución interactiva en dispositivos Apple.
- Ejecución nativa en Apple Silicon vía Core ML (ML Program), sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta generación de texto, código ni matemáticas.
- No soporta entrada de texto libre: el prompt está fijado por el LoRA.
- No dispone de capacidades multilingües (no hay codificador de texto en el paquete).
- No incluye visión general, audio ni modo "thinking".

## Casos de uso

- Borrado de objetos en una app de fotografía de escritorio: es el caso de uso previsto. Solume descarga el paquete desde un commit fijado, valida tamaño y SHA-256 de cada fichero y lo ejecuta localmente para eliminar un objeto seleccionado por el usuario sobre su propia foto, sin enviar imágenes a la nube.
- Edición de privacidad en imágenes personales: eliminar matrículas, rostros de transeúntes o documentos visibles en una fotografía antes de compartirla, aprovechando que la inferencia es local y no sale del dispositivo.
- Limpieza de catálogo de producto: retirar elementos no deseados (cables, etiquetas, objetos de atrezo) de fotografías de producto antes de publicarlas en una tienda, con un flujo determinista y repetible.
- Restauración de fotografías escaneadas: quitar manchas, marcas de agua o elementos superpuestos en digitalizaciones, usando la máscara para delimitar la zona a reconstruir.
- Preprocesado en pipelines de visión por computador: eliminar distracciones de imágenes de entrenamiento o evaluación antes de pasarlas a un detector o clasificador, reduciendo falsos positivos por objetos irrelevantes.
- Herramienta de escritorio offline para estudios de diseño: integración en un plugin o app macOS que necesite edición de imágenes sin conexión y con garantías de integridad de los pesos, gracias a la verificación por SHA-256 del paquete.
- Prototipado de funciones de inpainting en apps macOS: servir de referencia para equipos que quieran evaluar el rendimiento de FLUX.2 [klein] 4B en Core ML antes de invertir en su propia conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FID, CLIP score, LPIPS) ni comparaciones con otros modelos de inpainting, y tampoco ofrece cifras de latencia o throughput por dispositivo.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio pesa 4,2 GB; el transformer en int8 ocupa 3,88 GB, el VAE encoder 138 MB y el VAE decoder 198 MB, más 15,7 MB del embedding de prompt. En Apple Silicon la memoria unificada debe acomodar el modelo más las activaciones a 1024 px, por lo que se recomienda un mínimo de 16 GB.
- GPU recomendadas: Apple Silicon (M-series) con Core ML y Neural Engine o GPU integrada; el paquete está pensado para macOS 27 o superior según la cadena de herramientas declarada.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicables directamente, ya que el formato es Core ML y no existen pesos PyTorch ni GGUF en este repositorio. Para esas GPU habría que usar el modelo base y el LoRA originales.
- ¿Cabe en GPU de consumo? En el ecosistema Apple sí, en equipos con memoria unificada suficiente; en GPU de consumo NVIDIA no es desplegable sin reconversión.
- Opciones de despliegue: Core ML (ML Program) en macOS; no se proporcionan pesos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| solume-flux2-erase-coreml | 4B (int8) | 1024 px | Object removal / inpainting | Apache 2.0 | Core ML |
| black-forest-labs/FLUX.2-klein-4B | 4B | no disponible | Texto a imagen general | Apache 2.0 | safetensors (PyTorch) |
| slopshop/erase-v1 (LoRA) | rank 32 | no aplica | Object removal sobre FLUX.2 | Apache 2.0 | safetensors (LoRA) |

Frente al modelo base, esta conversión pierde la generación texto-a-imagen general y la entrada de texto libre, pero gana especialización en borrado de objetos, ejecución nativa en Apple Silicon y un paquete sin codificador de texto. Frente al LoRA original, ofrece un artefacto listo para producción en macOS con verificación de integridad, a cambio de quedar atado a la cadena de herramientas y a la plataforma de Apple. No se dispone de datos de benchmarks que permitan comparar calidad de inpainting con alternativas como LaMa o Stable Diffusion Inpainting.

## Limitaciones y advertencias

- El prompt está fijado por el LoRA: el modelo no acepta instrucciones de texto en tiempo de inferencia, por lo que no puede reutilizarse para otras tareas de edición.
- Solo realiza eliminación de objetos; no genera imágenes desde cero ni hace otras transformaciones.
- La licencia Apache 2.0 permite uso comercial, pero la model card del modelo base pide a los desplegables que consideren filtros para entradas y salidas dañinas. Solume mitiga esto limitando la operación a borrar una región de la foto del propio usuario con un prompt fijo.
- La conversión no está afiliada ni respaldada por Black Forest Labs ni por los autores del LoRA erase_v1.
- El paquete está atado a Core ML y macOS; no es portable a Linux, Windows ni GPU NVIDIA sin reconversión.
- Al ser una cuantización int8 del transformer, puede haber una pérdida de calidad respecto a los pesos originales en fp16/bf16; no se han publicado métricas que la cuantifiquen.
- Riesgo de alucinación visual: el inpainting puede generar contenido plausible pero incorrecto en la zona borrada, especialmente en regiones con textura o estructura complejas.
- El repositorio no contiene fotos ni datos de usuario; cualquier evaluación de sesgos debe hacerse sobre el modelo base FLUX.2 [klein] 4B, cuyos sesgos se heredan.
- No se especifican idiomas soportados porque no hay codificador de texto en el paquete.
- Sin datos publicados de latencia, throughput ni calidad, la evaluación en producción requiere medición propia.

## Enlaces

- HuggingFace: https://huggingface.co/heypatkay/solume-flux2-erase-coreml
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- LoRA erase_v1: https://huggingface.co/slopshop/erase-v1
- Repositorio diffusers (referencia de `Flux2KleinPipeline`): https://github.com/huggingface/diffusers
- coremltools: https://github.com/apple/coremltools
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
