# Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA-r64-iter1600-SLT-AR-30s-Local32-Sink8-run2-iter2200

## Resumen

Este repositorio contiene un checkpoint de streaming-long-tuning (SLT) en formato LoRA para el modelo base Wan2.2-TI2V-5B, desarrollado por Perflow-Shuai. El LoRA, denominado Wan2.2-5B-NonAR-DMD-4Step-LoRA-r64-iter1600-SLT-AR-30s-Local32-Sink8-run2-iter2200, permite generar vídeos de aproximadamente 30 segundos (184 frames latentes a 24 FPS tras decodificación) mediante un proceso de destilación DMD (Distribution Matching Distillation) en solo 4 pasos de denoising. La arquitectura del estudiante es causal/autoregresiva, mientras que el teacher y el critic utilizan atención no causal, con una ventana local de 32 tokens y 8 tokens sink para el estudiante.

La relevancia de este modelo radica en su enfoque de streaming-long-tuning aplicado a generación de vídeo, que permite manejar secuencias largas con atención local, reduciendo el coste computacional frente a la atención global. El checkpoint corresponde a la iteración 2200 de entrenamiento, con EMA desactivado, e incluye tanto los pesos del generador como los del critic LoRA. El estado del optimizador se excluye de esta exportación, por lo que el checkpoint local de entrenamiento es la fuente de verdad para reanudar el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B (base) + LoRA rank 64 |
| Parametros totales | no disponible (el repositorio ocupa 1.3 GB, pero no se especifica el número de parámetros del LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 184 frames latentes (~30 segundos a 24 FPS tras decodificación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (presumiblemente safetensors, pero no se confirma en la información proporcionada) |

## Arquitectura y entrenamiento

El modelo base es Wan2.2-TI2V-5B, un modelo de generación de vídeo que utiliza un VAE con compresión 16×16×4 y soporta tanto text-to-video como image-to-video a resolución 720P y 24 FPS. Sobre esta base, el LoRA se entrena mediante streaming-long-tuning, una técnica que adapta la atención del modelo para procesar secuencias largas de forma eficiente. En concreto, el estudiante emplea atención causal/autoregresiva con una ventana local de 32 tokens y 8 tokens sink, mientras que el teacher y el critic utilizan atención no causal completa. El entrenamiento se realiza con destilación DMD en 4 pasos de denoising, lo que reduce drásticamente el número de iteraciones necesarias en inferencia. El checkpoint corresponde a la iteración 2200, con EMA desactivado, e incluye los pesos del generador y del critic LoRA. No se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y, potencialmente, image-to-video, heredado del modelo base Wan2.2-TI2V-5B.
- Generación de secuencias de vídeo de aproximadamente 30 segundos (184 frames latentes) a 24 FPS.
- Inferencia en solo 4 pasos de denoising gracias a la destilación DMD.
- Atención autoregresiva con ventana local (32 tokens) y 8 tokens sink, optimizada para secuencias largas.
- No se mencionan capacidades de tool calling, agentes, razonamiento multimodal ni otras funcionalidades fuera de la generación de vídeo.

## Casos de uso

- Creación de clips de vídeo largos para contenido audiovisual: el modelo puede generar secuencias de ~30 segundos a partir de una descripción textual, útil para storyboards, previsualización o prototipado rápido en producción audiovisual.
- Investigación en streaming-long-tuning: sirve como punto de partida para estudiar cómo la atención local con tokens sink afecta a la coherencia temporal en vídeos largos, comparando con variantes no autoregresivas.
- Generación de vídeo en entornos con recursos limitados: al ser un LoRA sobre Wan2.2-5B, que ya puede ejecutarse en GPUs de consumo como la RTX 4090, permite generar vídeos de 30 segundos sin necesidad de hardware de gama alta.
- Fine-tuning adicional: al ser un checkpoint intermedio (iteración 2200), puede utilizarse como base para continuar el entrenamiento o adaptarlo a dominios específicos (por ejemplo, vídeo de vigilancia, simulación de entornos, etc.).
- Evaluación de destilación DMD en vídeo: permite comparar la calidad de vídeos generados en 4 pasos frente a modelos que requieren más pasos de denoising, en términos de fidelidad y coherencia.
- Integración en pipelines de generación de vídeo para aplicaciones de marketing o educación, donde se necesitan vídeos cortos y descriptivos de forma rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FVD, IS, CLIP score ni comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- El modelo base Wan2.2-TI2V-5B puede ejecutarse en GPUs de consumo como la RTX 4090, según el repositorio oficial de Wan2.2. El LoRA añade un overhead mínimo en memoria, por lo que los requisitos de VRAM serán similares a los del modelo base.
- No se especifican requisitos exactos de VRAM para este LoRA concreto. Se estima que, con cuantización FP16 o FP8, el modelo base requiere entre 10 y 16 GB de VRAM, dependiendo de la resolución y la longitud del vídeo.
- Opciones de despliegue: no se detallan en la información proporcionada, pero al estar basado en Wan2.2, es compatible con el pipeline de generación de vídeo de dicha familia (por ejemplo, mediante el repositorio oficial de Wan2.2 o implementaciones como ComfyUI).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Pasos de denoising | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-5B-NonAR-DMD-4Step-LoRA (este) | Wan2.2-TI2V-5B | 184 frames (~30s) | 4 | no disponible | Hugging Face |
| Wan2.2-TI2V-5B-Turbo | Wan2.2-TI2V-5B | 121 frames (~5s) | 4 | no disponible | GitHub |
| SCOPE-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r32-iter2000 | SCOPE (world model) | no especificado | 4 | no disponible | Hugging Face |

La comparación se limita a otros LoRA o modelos destilados de la misma familia. No se dispone de datos de rendimiento cuantitativo para establecer una comparativa objetiva.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Los idiomas soportados no están especificados; el modelo base Wan2.2 probablemente soporta múltiples idiomas, pero no se confirma para este LoRA.
- La atención local con ventana de 32 tokens y 8 sink puede perder dependencias de largo alcance en la secuencia de vídeo, lo que podría afectar a la coherencia global en escenas complejas.
- El checkpoint es un punto intermedio de entrenamiento (iteración 2200) y no se ha validado con benchmarks públicos, por lo que su calidad no está garantizada.
- El estado del optimizador se excluye del repositorio, por lo que no es posible reanudar el entrenamiento directamente desde esta exportación.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en la model card, lo que puede dificultar su integración.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA-r64-iter1600-SLT-AR-30s-Local32-Sink8-run2-iter2200
- Repositorio relacionado (iteración 1600, rank 64): https://huggingface.co/Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA
- Repositorio de SCOPE-Wan2.2-5B-NonAR-DMD-4Step-LoRA: https://huggingface.co/Perflow-Shuai/SCOPE-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r32-iter2000
- Repositorio de Wan2.2-TI2V-5B-Turbo en GitHub: https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo
- Repositorio oficial de Wan2.2 en GitHub: https://github.com/Madxthree/wan2.2
- Tutorial sobre Wan2.2 (FP16/FP8/GGUF): https://www.stablediffusiontutorials.com/2025/08/wan-2.2-video-generation.html
