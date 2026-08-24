# frankleeeee/CausalForcing-Wan2.1-T2V-1.3B-Diffusers

## Resumen

CausalForcing-Wan2.1-T2V-1.3B-Diffusers es una conversión al formato Diffusers del generador *chunk-wise Causal Forcing* desarrollado por el proyecto thu-ml/Causal-Forcing, presentado en el artículo "Causal Forcing: Autoregressive Diffusion Distillation Done Right" (ICML 2026). El modelo utiliza como base el backbone Wan2.1-T2V-1.3B de Wan-AI, pero sustituye el proceso de denoising estándar por un esquema de destilación DMD (Distribution Matching Distillation) con causalidad autoregresiva. El resultado es un modelo de texto a video que genera latentes en fragmentos de 3 frames, con una ventana de atención deslizante de 21 frames latentes y 4 pasos de denoising warpados (1000, 750, 500, 250) sin guía sin clasificador (CFG).

El modelo está publicado bajo licencia Apache-2.0 y se distribuye en formato safetensors con el layout de Diffusers, listo para usarse con el runtime de difusión de SGLang. Tiene 1.418.996.800 parámetros y un tamaño de repositorio de 26,1 GB. Es relevante porque demuestra una aplicación práctica de destilación de difusión autoregresiva para generación de video en tiempo real, aunque se encuentra en una fase inicial de adopción (cero descargas y cero likes en el momento de su publicación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoregressive video diffusion (block-causal DMD student) sobre backbone Wan2.1-T2V-1.3B |
| Parámetros totales | 1.418.996.800 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención deslizante de 21 frames latentes) |
| Tipos de cuantización | no disponible (safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Diffusers layout) |

## Arquitectura y entrenamiento

El modelo es una conversión del generador *chunk-wise Causal Forcing* del proyecto thu-ml/Causal-Forcing, adaptado al ecosistema Diffusers. La arquitectura se basa en el backbone Wan2.1-T2V-1.3B, pero reemplaza el proceso de denoising estándar por un esquema de destilación DMD (Distribution Matching Distillation) con causalidad en bloques. Esto significa que el modelo genera el video en fragmentos de 3 frames latentes, procesando cada fragmento con una ventana de atención deslizante de 21 frames latentes, lo que permite una generación autoregresiva con memoria limitada. El proceso de denoising utiliza 4 pasos warpados (1000, 750, 500, 250) con un shift de 5.0 y no emplea CFG, lo que reduce el coste computacional respecto a los métodos de difusión tradicionales.

Los componentes no transformer (como el VAE y los embeddings) se copian directamente del modelo base Wan-AI/Wan2.1-T2V-1.3B-Diffusers. La conversión se realizó con la herramienta `sglang.multimodal_gen.tools.convert_forcing_to_diffusers --preset causal-forcing-chunkwise`, lo que garantiza compatibilidad con el runtime de difusión de SGLang. No se han publicado detalles sobre los datos de entrenamiento, el número de tokens procesados ni el proceso de fine-tuning específico.

## Capacidades

- Generación de video a partir de prompts de texto (text-to-video).
- Generación autoregresiva por fragmentos (chunk-wise) con causalidad, lo que permite secuencias largas con memoria limitada.
- Cuatro pasos de denoising warpados, lo que reduce la latencia frente a métodos de difusión con muchos pasos.
- Sin CFG (guía sin clasificador), simplificando el proceso de inferencia.
- Compatible con el runtime de difusión de SGLang, permitiendo integración con pipelines de generación de video.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de generación de video puro.

## Casos de uso

- **Generación de video corto para prototipado**: el modelo puede producir clips de video de 81 frames (por ejemplo, 832x480) a partir de una descripción textual, ideal para validar conceptos visuales en entornos de desarrollo.
- **Producción de contenido para redes sociales**: gracias a su generación en 4 pasos de denoising, es adecuado para generar clips breves con baja latencia, aptos para plataformas como TikTok o Instagram Reels.
- **Creación de storyboards animados**: los diseñadores pueden generar secuencias visuales preliminares a partir de guiones, facilitando la previsualización de escenas.
- **Educación y demostraciones interactivas**: el modelo permite generar ejemplos visuales sobre la marcha en aplicaciones educativas, por ejemplo para ilustrar conceptos científicos o históricos.
- **Investigación en destilación de difusión**: sirve como referencia para estudiar técnicas de DMD aplicadas a video, ya que es una implementación abierta y reproducible.
- **Generación de video en tiempo real para demos**: gracias a su bajo número de pasos y la ausencia de CFG, puede integrarse en sistemas de generación en streaming para demostraciones o instalaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de métricas como FVD, IS, CLIP Score ni comparaciones con otros modelos de video.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio pesa 26,1 GB, lo que sugiere pesos en precisión FP16 o FP32; una GPU con al menos 16 GB de VRAM podría ser necesaria para inferencia con los pesos completos.
- **GPU recomendadas**: no se especifican. Se asume que una GPU de gama alta (por ejemplo, A100, RTX 4090) es adecuada para manejar el modelo y la ventana de atención deslizante.
- **Compatibilidad con GPU de consumo**: posiblemente sí, si se usa cuantización (no disponible en la información) o se reduce la resolución de salida.
- **Opciones de despliegue**: SGLang diffusion runtime (recomendado), aunque también podría adaptarse a otros frameworks Diffusers.
- **Latencia y throughput**: no se proporcionan datos. La generación en 4 pasos sugiere una latencia menor que los modelos de difusión tradicionales, pero no hay cifras concretas.

## Comparativa con modelos similares

No hay información suficiente sobre modelos comparables. El modelo base Wan2.1-T2V-1.3B-Diffusers podría considerarse una alternativa, pero no se dispone de sus especificaciones detalladas ni de resultados de rendimiento en esta ficha. Otras alternativas como CogVideoX o ModelScope Text-to-Video no se han podido comparar por falta de datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo de generación de video, puede heredar sesgos de los datos de entrenamiento del modelo base Wan2.1-T2V-1.3B, que no se han analizado en esta ficha.
- **Riesgo de alucinación**: los modelos de video pueden producir contenido visual incoherente o no fiel al prompt, especialmente en escenas complejas. No hay datos sobre la tasa de fallos.
- **Limitaciones de contexto**: la ventana de atención deslizante de 21 frames latentes limita la coherencia temporal a corto plazo; secuencias muy largas pueden perder consistencia.
- **Idiomas**: no se ha especificado los idiomas soportados, por lo que el rendimiento fuera de inglés y chino (idiomas típicos de Wan) es incierto.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Wan2.1-T2V-1.3B, que también es Apache-2.0.
- **Estado del modelo**: tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad. Es una conversión técnica que puede presentar errores de integración o de rendimiento no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/frankleeeee/CausalForcing-Wan2.1-T2V-1.3B-Diffusers
- Proyecto Causal-Forcing (GitHub): https://github.com/thu-ml/Causal-Forcing
- Modelo base Wan2.1-T2V-1.3B-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Repositorio Wan2.1 (GitHub): https://github.com/Wan-Video/Wan2.1
- Modelo Wan2.1-T2V-1.3B en ModelScope: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
