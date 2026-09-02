# kootaro/Wan2.2-Custom-Models-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF y modelos especializados del sistema Wan2.2 de generación de vídeo imagen-a-vídeo (I2V), preparados por el usuario kootaro. Wan2.2 es un modelo de difusión de vídeo a gran escala desarrollado por Wan-AI que introduce una arquitectura de mezcla de expertos (MoE) para separar el proceso de denoising en dos fases: una de alto ruido, encargada de la estructura global y el movimiento, y otra de bajo ruido, dedicada al refinamiento de detalles y la preservación facial. El modelo base tiene aproximadamente 14 300 millones de parámetros.

La contribución principal de este repositorio es la optimización para entornos con memoria limitada, como la GPU NVIDIA Tesla T4 de 15 GB disponible en Google Colab. Se ofrecen cuantizaciones GGUF (Q4_K_M, Q6_K, Q8_H, etc.) y modelos FP8 integrados con pesos de consistencia facial y la técnica SVI (Stable Video Infinity) para síntesis de vídeo continua. El autor proporciona además configuraciones recomendadas para ComfyUI, incluyendo pasos de muestreo, CFG y límites de resolución, con el fin de evitar artefactos visuales y desbordamientos de memoria.

La relevancia actual de este modelo radica en que permite ejecutar un generador de vídeo de calidad profesional en hardware de gama baja, algo que normalmente requeriría GPUs de 24 GB o más. La licencia Apache-2.0 facilita su uso comercial y la integración en flujos de trabajo existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con dos expertos: high-noise y low-noise para difusión de vídeo |
| Parametros totales | 14 288 901 184 (aprox. 14,3 B) |
| Parametros activos | no disponible (no se especifica en la información proporcionada) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q6_K_L, Q6_K, Q8_H; FP8_scaled; safetensors FP8 integrados |
| Idiomas soportados | en, zh, th |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Wan2.2 emplea una arquitectura de mezcla de expertos (MoE) aplicada a modelos de difusión de vídeo. El proceso de denoising se divide en dos etapas gestionadas por expertos especializados: un experto de alto ruido (high-noise) que actúa en las primeras fases y define la composición general, el movimiento de cámara y las trayectorias; y un experto de bajo ruido (low-noise) que refina los detalles finos, la textura y la identidad facial. Esta separación permite aumentar la capacidad total del modelo sin incrementar el coste computacional por paso.

El repositorio de kootaro no modifica la arquitectura base, sino que proporciona cuantizaciones GGUF y modelos FP8 integrados con pesos adicionales para consistencia facial y SVI (Stable Video Infinity), una técnica que permite la síntesis de vídeo continuo más allá de los límites de frames habituales. No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el proceso de alineación (RLHF/DPO) del modelo base. El autor indica que los archivos de pesos completos sin cuantizar no están actualizados en el repositorio, por lo que se recomienda usar las variantes GGUF o FP8.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), con control sobre el movimiento y la dinámica de cámara.
- Soporte de dos fases de denoising (high-noise y low-noise) que pueden combinarse en un flujo híbrido para mejorar la calidad visual.
- Integración con ComfyUI mediante nodos específicos para modelos GGUF.
- Incluye pesos de consistencia facial para evitar distorsiones del rostro en secuencias largas.
- Técnica SVI (Stable Video Infinity) para extender la duración del vídeo generado de forma continua.
- Compatibilidad con cuantizaciones que permiten ejecución en GPUs con 15 GB de VRAM (Tesla T4) mediante configuraciones específicas.
- Soporte multilingüe en las etiquetas del modelo (inglés, chino, tailandés), aunque la generación de vídeo no depende del idioma.

## Casos de uso

- Creación de vídeos cortos para redes sociales: un creador de contenido puede generar clips de 4 a 12 segundos a partir de una imagen fija, con movimiento de cámara y transiciones, usando una GPU T4 en Colab. La configuración recomendada (pasos 4-12, CFG 1-2) permite obtener resultados estables sin artefactos.
- Prototipado de animaciones para producción audiovisual: los estudios pueden usar el modelo para previsualizar escenas y movimientos de cámara antes de la renderización final, gracias a la separación high/low noise que permite ajustar la agresividad del movimiento.
- Generación de vídeo con consistencia facial para personajes: los pesos de consistencia facial integrados en los modelos FP8 son útiles para mantener la identidad de un personaje en secuencias largas, por ejemplo en doblaje o narración visual.
- Automatización de contenido para e-learning: a partir de imágenes de diapositivas o diagramas, el modelo puede generar vídeos explicativos con movimiento sutil, aprovechando la baja VRAM requerida para ejecutarse en entornos cloud económicos.
- Investigación en generación de vídeo: los investigadores pueden comparar el rendimiento de diferentes cuantizaciones (Q4_K_M vs Q8_H) en términos de calidad y velocidad, usando el repositorio como banco de pruebas.
- Integración en pipelines de postproducción: mediante la API de ComfyUI, es posible encadenar el modelo con otros nodos de edición (upscaling, interpolación) para producir vídeos de mayor resolución a partir de los 480p-720p generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas cuantitativas (PSNR, SSIM, FVD, etc.) ni comparaciones con otros modelos. Las únicas indicaciones de rendimiento son cualitativas: se menciona que la configuración recomendada evita artefactos y que la ejecución en T4 es posible con límites de resolución y frames específicos.

## Requisitos de hardware

- VRAM estimada: 15 GB para Tesla T4 (con cuantizaciones Q4_K_M a Q8_H y resolución máxima de 720x480 píxeles, 81-120 frames). Para NVIDIA L4 (24 GB) se pueden usar configuraciones de mayor calidad (Q8_H + FP8).
- GPUs recomendadas: Tesla T4 (15 GB) para entornos con memoria limitada; NVIDIA L4 (24 GB) o superior para flujos de alta fidelidad.
- En consumer GPUs: es posible ejecutar en RTX 3060 (12 GB) o RTX 4060 (8 GB) con cuantizaciones bajas (Q4_K_M) y resoluciones reducidas, aunque no está explícitamente documentado.
- Opciones de despliegue: ComfyUI (interfaz gráfica), scripts de backend directos (Colab forms), y potencialmente llama.cpp u otros runners GGUF, aunque la documentación se centra en ComfyUI.
- Latencia y throughput: no disponible. El autor sugiere que la ejecución por backend directo es más rápida que a través de la GUI de ComfyUI, pero no proporciona cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo base Wan2.2 compite con otros generadores de vídeo como:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-I2V-A14B (base) | 14,3 B | no disponible | Apache-2.0 | Hugging Face |
| CogVideoX-5B | 5 B | no disponible | Apache-2.0 | Hugging Face |
| Stable Video Diffusion | 1,4 B | no disponible | Stability AI license | Hugging Face |

Sin embargo, no hay benchmarks públicos que permitan una comparación objetiva de calidad o velocidad entre estos modelos en el contexto de este repositorio.

## Limitaciones y advertencias

- El repositorio no contiene los pesos completos sin cuantizar actualizados; solo están disponibles las versiones GGUF y FP8. Esto limita la reproducibilidad exacta del modelo original.
- La ejecución en Tesla T4 requiere restricciones estrictas: resolución máxima de 720x480 píxeles, máximo 120 frames, y cuantizaciones entre Q4_K_M y Q8_H. Superar estos límites provoca errores de memoria (OOM).
- El uso de la interfaz web de ComfyUI consume VRAM adicional; se recomienda ejecutar scripts de backend para aprovechar al máximo la GPU.
- La configuración de muestreo es crítica: usar más de 12 pasos totales o un CFG superior a 2 puede producir imágenes quemadas o sobresaturadas.
- No se garantiza la ausencia de alucinaciones visuales o distorsiones en escenas complejas, especialmente con cuantizaciones agresivas (Q4_K_M).
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del resultado en producción.
- El modelo está etiquetado para inglés, chino y tailandés, pero la generación de vídeo no depende del idioma; estas etiquetas pueden referirse a la documentación o a los prompts de texto asociados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kootaro/Wan2.2-Custom-Models-GGUF
- Repositorio oficial de Wan2.2 (Wan-Video): https://github.com/Wan-Video/Wan2.2
- Modelos compatibles con la librería wan2.2 en Hugging Face: https://huggingface.co/models?library=wan2.2
- Repositorio espejo (geceff/Wan2.2-Custom-Models-GGUF): https://huggingface.co/geceff/Wan2.2-Custom-Models-GGUF
- Modelo GGUF en ModelScope: https://www.modelscope.cn/models/bullerwins/Wan2.2-I2V-A14B-GGUF
