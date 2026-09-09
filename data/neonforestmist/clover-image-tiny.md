# neonforestmist/Clover-Image-Tiny

## Resumen

Clover-Image-Tiny es un modelo de generación de imágenes de texto a imagen desarrollado por neonforestmist. Se trata de un modelo compacto de la clase Stable Diffusion 1.4, basado en nota-ai/bk-sdm-tiny-2m, con un denoiser de 323,4 millones de parámetros. Genera imágenes de 512 × 512 píxeles y está diseñado para ejecutarse localmente, en dispositivos de borde y móviles, incluyendo Apple Silicon y Core ML. El paquete completo de Diffusers pesa aproximadamente 1,67 GB y el modelo admite estilos mediante LoRA. Su relevancia radica en permitir generación de imágenes sin conexión a servicios cloud, con un tamaño reducido, ideal para aplicaciones locales y de borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (difusión latente), clase SD 1.4 |
| Parámetros totales | 323.384.964 (denoiser) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | safetensors; también disponible como Diffusers y Core ML |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Stable Diffusion, que combina un codificador de texto (CLIP), un denoiser UNet de difusión latente y un VAE. En este caso, el UNet tiene 323,4 millones de parámetros, en lugar de los aproximadamente 860 millones del Stable Diffusion 1.5 original, lo que lo convierte en una versión destilada y compacta. El modelo base es nota-ai/bk-sdm-tiny-2m, y el entrenamiento utiliza destilación de conocimiento para reducir el tamaño sin perder en exceso la calidad de la generación. No se han publicado detalles sobre el conjunto de datos de entrenamiento, la composición de los datos ni si se emplearon técnicas como RLHF o DPO, lo cual no es habitual en modelos de difusión. El modelo incluye soporte para estilos mediante LoRA, y existe una variante para inpainting (Clover-Image-Tiny-Inpaint) que comparte componentes. La salida es de 512 × 512 píxeles.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) a 512 × 512 píxeles.
- Ejecución local y sin conexión: el modelo y las dependencias se descargan y la inferencia se realiza localmente.
- Soporte para estilos personalizados mediante LoRA, con un repositorio específico para entrenar LoRAs (clover-image-tiny-lora-trainer).
- Inpainting: mediante el modelo Clover-Image-Tiny-Inpaint, permite editar regiones enmascaradas de una imagen existente (pintar de blanco la zona a reemplazar; los píxeles negros se conservan).
- Despliegue en Apple Silicon y Core ML, con una app de iOS (Clover-Image-Tiny-iOS) y soporte para iPhone.
- Integración con Diffusers a través de StableDiffusionPipeline.
- Demo en Hugging Face Spaces para probar el modelo de forma remota.
- No incluye funciones de tool calling, agentes ni razonamiento, al ser un modelo de difusión.

## Casos de uso

- Aplicaciones móviles de generación de imágenes: gracias al soporte de Core ML y al reducido tamaño, se puede integrar en una app de iPhone para generar imágenes offline sin depender de servicios cloud.
- Edición de fotos local con inpainting: usando Clover-Image-Tiny-Inpaint, una aplicación de retoque puede ofrecer la función de reemplazar objetos o regiones con una máscara, respetando la privacidad del usuario al no enviar las imágenes a servidores externos.
- Personalización de estilos artísticos: con el entrenador de LoRA, un estudio de diseño puede adaptar el modelo a su propio estilo visual, generando imágenes coherentes con una identidad de marca.
- Herramientas de asistencia creativa para escritorio: un editor gráfico puede incorporar la generación de imágenes de forma nativa, ya que el modelo completo ocupa alrededor de 1,67 GB y se puede cargar en una GPU de consumo o en Apple Silicon.
- Generación de imágenes en entornos sin conexión: dispositivos de campo, instalaciones con redes restringidas o aplicaciones de defensa y seguridad pueden usar el modelo de manera autónoma, sin necesidad de conectividad.
- Prototipado rápido de conceptos visuales: diseñadores y artistas pueden generar ideas en una demo o en un servidor local para iterar rápidamente sobre composiciones, colores y estilos sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación, pero no se han encontrado métricas concretas (como FID, CLIP score o equivalentes) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El tamaño del repositorio es de aproximadamente 1,67 GB para el paquete Diffusers, pero no se especifica el consumo de VRAM.
- GPU recomendadas: no disponible. El modelo está orientado a Apple Silicon y Core ML, lo que sugiere que puede ejecutarse en hardware móvil y en equipos con GPU de consumo, pero no se indican modelos concretos.
- ¿Cabe en GPU de consumo? Probablemente sí, dada la orientación a edge y móvil, pero no hay datos verificables.
- Opciones de despliegue: Diffusers (Python), Core ML (iOS), Hugging Face Spaces (demo remoto). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables en la información proporcionada para una comparativa con modelos similares. El modelo parte de nota-ai/bk-sdm-tiny-2m como base, pero no se han encontrado métricas de rendimiento ni especificaciones de modelos comparables en las fuentes disponibles. Por tanto, se indica no disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos de Clover-Image-Tiny. Al tratarse de un modelo de difusión, puede heredar sesgos de género, etnia o cultura presentes en sus datos de entrenamiento.
- Riesgo de alucinación: los modelos de difusión pueden generar imágenes con artefactos, incoherencias o contenido no deseado. No se han publicado evaluaciones sobre la frecuencia de estos fallos.
- Limitaciones de contexto e idioma: no se especifican los idiomas soportados. Los ejemplos de la model card están en inglés, por lo que el comportamiento con prompts en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia CreativeML Open RAIL-M impone condiciones de uso, como no emplear el modelo para fines ilegales o dañinos. Es necesario revisar el texto completo de la licencia antes de un uso comercial.
- Advertencia para producción: al ser un modelo destilado y compacto, puede presentar una calidad inferior a modelos más grandes de la misma clase. No se han publicado benchmarks que permitan cuantificar esta diferencia, por lo que se recomienda realizar pruebas de calidad propias antes de desplegarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/neonforestmist/Clover-Image-Tiny
- Modelo de inpainting: https://huggingface.co/neonforestmist/Clover-Image-Tiny-Inpaint
- Demo en Spaces: https://huggingface.co/spaces/neonforestmist/Clover-Image-Tiny-Demo
- App iOS / Core ML: https://github.com/neonforestmist/Clover-Image-Tiny-iOS
- Entrenador de LoRA: https://github.com/neonforestmist/clover-image-tiny-lora-trainer
- Código fuente y documentación: https://github.com/neonforestmist/Clover-Image-Tiny
- Checks de calidad (CI): https://github.com/neonforestmist/Clover-Image-Tiny/actions/workflows/quality.yml
- Licencia: https://huggingface.co/neonforestmist/Clover-Image-Tiny/blob/main/LICENSE
- Detalles del modelo: https://huggingface.co/neonforestmist/Clover-Image-Tiny/blob/main/docs/MODEL_DETAILS.md
