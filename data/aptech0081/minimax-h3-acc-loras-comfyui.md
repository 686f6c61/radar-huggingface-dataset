# aptech0081/MiniMax-H3-Acc-LoRAs-ComfyUI

## Resumen

MiniMax-H3-Acc-LoRAs-ComfyUI es un repositorio de pesos derivados del modelo generativo MiniMax-H3, publicado por el usuario aptech0081. No se trata de un modelo entrenado desde cero, sino de una conversión y fusión de los LoRAs oficiales de aceleración PDD (Progressive Denoising Distillation) que Alibaba PAI publicó para MiniMax-H3, empaquetados en checkpoints listos para cargar en ComfyUI. El pipeline declarado es text-to-video, y los checkpoints Ref2VA generan vídeo y audio a partir de condicionamiento de referencia.

La relevancia de este repositorio reside en que elimina la necesidad de aplicar el LoRA de aceleración PDD y el nodo PDD Apply durante la inferencia: el tronco PDD queda fusionado a fuerza 1.0 dentro del checkpoint, junto con los bancos de cabeceras de salida (32 de vídeo y 32 de audio). Esto simplifica el grafo de ComfyUI y reduce el trabajo repetido de fusión de LoRAs, especialmente cuando las capas se descargan a memoria del sistema en tarjetas con poca VRAM.

El repositorio incluye una variante podada en INT8 de 21,06 GB, aproximadamente un 38,3 % más pequeña que el checkpoint completo con cabeceras (34,12 GB), además de las variantes completas con y sin cabeceras y dos LoRAs para los nodos personalizados. La licencia es la MiniMax-H3 Community License Agreement, no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo y audio; tronco transformer con cabeceras de salida separadas por modalidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (checkpoints principales); LoRAs en formato ComfyUI |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un modelo de difusión para generación conjunta de vídeo y audio. Los checkpoints de este repositorio incorporan el tronco Ref2VA o FL2VA con las actualizaciones PDD fusionadas a fuerza 1.0, más un banco de 32 cabeceras de intervalo fino por flujo. Las cabeceras de salida tienen formas concretas: `final_layer.video_out.weight` de `[3072, 5376]` con bias de `[3072]`, y `final_layer.audio_out.weight` de `[1024, 5376]` con bias de `[1024]`, almacenadas en float32. Cada banco guarda la cabecera 0 completa y las siguientes como offsets respecto a ella; ComfyUI nativo combina las cabeceras apropiadas para cada intervalo de muestreo.

El proceso de destilación PDD permite generar en 8 pasos (y también en 4, según la publicación original) con CFG 1.0 y denoise 1.0, usando sampler Euler y scheduler simple, con desplazamientos sigma de 12,0 para vídeo y 3,0 para audio. La variante podada parte del checkpoint oficial pruned Ref2VA INT8 ConvRot de Comfy-Org y aplica una conversión en espacio de curva de las actualizaciones de las capas de temporización: las 50 proyecciones afectadas se rebasaron con actualizaciones de peso y bias, y la curva temporal se validó contra el time embedder del base completo sobre 1025 puntos de rejilla con un error L2 relativo de 1,377e-05. Las actualizaciones PDD rebasadas se compararon además con el LoRA denso en nueve puntos temporales por módulo, y los 58 pesos objetivo sin cuantizar y las 50 actualizaciones de bias afín coinciden exactamente con sus valores almacenados.

## Capacidades

- Generación de vídeo a partir de condicionamiento de referencia (Ref2VA) y de condicionamiento first-last (FL2VA, mediante el LoRA correspondiente).
- Generación de audio sincronizada junto con el vídeo en el mismo proceso de difusión.
- Inferencia acelerada en 8 pasos (4 pasos también soportados por la publicación PDD original) con CFG 1.0.
- Carga nativa en ComfyUI tras el PR #17157, sin nodo PDD Apply ni LoRA de aceleración adicional.
- Variante podada para reducir almacenamiento y presión de memoria con offloading de capas.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual.

## Casos de uso

- Prototipado rápido de vídeo generativo en ComfyUI: el checkpoint con cabeceras se carga directamente con UNETLoader y un grafo Ref2VA estándar, sin pasos adicionales de fusión de LoRA, lo que acorta la iteración en pruebas de concepto.
- Producción de clips cortos con audio en estudio pequeño: la generación conjunta de vídeo y audio en 8 pasos reduce el coste por iteración frente a pipelines que generan ambas modalidades por separado.
- Despliegue en estaciones con VRAM limitada: la variante podada de 21,06 GB, combinada con offloading de capas, disminuye el espacio en disco y el trabajo repetido de fusión de LoRAs en cada carga.
- Automatización de contenido para redes sociales: el modo Ref2VA permite partir de una imagen o referencia de estilo y generar variaciones con audio asociado en un flujo por lotes dentro de ComfyUI.
- Integración en pipelines de postproducción: los checkpoints se pueden encadenar con nodos de interpolación, upscaling o montaje dentro del mismo grafo de ComfyUI, manteniendo el sampler y los shifts documentados.
- Evaluación comparativa de recetas de aceleración: el repositorio conserva variantes con y sin cabeceras y LoRAs externos, lo que permite medir el impacto de la fusión PDD frente a la aplicación dinámica del LoRA en la misma máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de validación de la conversión: error L2 relativo de 1,377e-05 en la curva temporal sobre 1025 puntos, coincidencia exacta de 58 pesos y 50 biases, y una reducción de tamaño del 38,3 % en la variante podada (21,06 GB frente a 34,12 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card advierte explícitamente que el tamaño del checkpoint no equivale a la VRAM total de inferencia, ya que también influyen activaciones, longitud del clip, resolución, text encoder, VAEs y ajustes de offloading. No se formula ninguna afirmación de VRAM mínima.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. La variante podada está pensada para reducir presión de memoria en tarjetas con poca VRAM mediante offloading de capas, pero sin cifras verificadas.
- Opciones de despliegue: ComfyUI nativo en una revisión que incluya el PR #17157 (fusionado el 18 de octubre de 2026). Los archivos LoRA requieren los nodos personalizados PDD correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Acc-LoRAs-ComfyUI (este repo) | no disponible | no disponible | sin benchmarks publicados; validación numérica de la fusión PDD | MiniMax-H3 Community License | Hugging Face, 22.782 descargas |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax-H3 Community License | Hugging Face |
| alibaba-pai/MiniMax-H3-Acc-LoRAs (LoRAs PDD originales) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Comfy-Org/MiniMax-H3 pruned Ref2VA INT8 ConvRot | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia MiniMax-H3 Community License Agreement no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Los checkpoints son modelos de difusión: el text encoder y los VAEs siguen siendo archivos separados y deben gestionarse aparte.
- La cuantización INT8 y la aproximación de curva del podado pueden alterar los resultados respecto al checkpoint completo; la propia model card lo señala.
- El checkpoint sin cabeceras requiere el banco de cabeceras externo y el nodo Apply, por lo que no funciona de forma nativa.
- El archivo sin cabeceras fue renombrado; los enlaces de descarga antiguos con el nombre anterior quedan obsoletos, aunque los bytes y el SHA256 no cambian.
- El valor `config.transformer.pdd_steps = 32` es el tamaño del banco de cabeceras, no el número de pasos del sampler; confundirlos produce recetas incorrectas.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática en la información disponible.
- El repositorio ocupa 92,5 GB, lo que exige planificación de almacenamiento antes de la descarga.
- No se ofrecen garantías de VRAM mínima; el rendimiento en hardware concreto debe validarse empíricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aptech0081/MiniMax-H3-Acc-LoRAs-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- LoRAs PDD oficiales de Alibaba PAI: https://huggingface.co/alibaba-pai/MiniMax-H3-Acc-LoRAs
- Checkpoint pruned Ref2VA INT8 ConvRot de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/e5eb578a89295337b8ff433a035929ce0279e0b6/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors
- Pull request de ComfyUI #17157: https://github.com/Comfy-Org/ComfyUI/pull/17157
- Paper de referencia: arxiv:2607.26004
