# PixWizardry/Z-image_Supervised_FineTune_FP32

## Resumen

Z-Image Supervised FineTune (FP32) es una versión en precisión completa (32 bits) de un modelo de generación de imágenes derivado de Z-Image, un modelo fundacional de difusión basado en un transformer de difusión de flujo único (single-stream diffusion transformer) descrito en el preprint arXiv:2511.22699 del equipo Z-Image. El repositorio lo publica el usuario PixWizardry bajo licencia Apache 2.0 y está empaquetado como archivo único compatible con ComfyUI (etiqueta `diffusion-single-file`), con un tamaño de repositorio de 24,6 GB.

La relevancia de esta variante es fundamentalmente técnica: al conservar los pesos en FP32 en lugar de BF16 u otras precisiones reducidas, sirve como referencia para investigación, análisis numérico y pruebas de compatibilidad, no como una versión optimizada para producción. La model card indica explícitamente que es funcionalmente equivalente a la arquitectura original y que solo difiere en precisión numérica.

No se dispone de información sobre el proceso de fine-tuning supervisado aplicado, el dataset utilizado, el número de parámetros, la longitud de contexto (no aplica en el mismo sentido que en modelos de lenguaje) ni los idiomas soportados. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión de flujo único (single-stream diffusion transformer), según el paper de Z-Image |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de imágenes) |
| Tipos de cuantización | FP32 (esta release); la model card menciona BF16 como release de referencia de menor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.safetensors` (archivo único, `diffusion-single-file`) |
| Framework | PyTorch |
| Tarea | Generación de imágenes |
| Tamaño del repositorio | 24,6 GB |
| Compatibilidad | ComfyUI |

## Arquitectura y entrenamiento

La arquitectura corresponde a Z-Image, un modelo fundacional de generación de imágenes construido sobre un transformer de difusión de flujo único, según el título del preprint arXiv:2511.22699 ("Z-Image: An Efficient Image Generation Foundation Model with Single-Stream Diffusion Transformer"). Esta release concreta es un fine-tuning supervisado de dicho modelo, reempaquetado en FP32.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en difusión) ni detalles del proceso de fine-tuning supervisado. La model card solo confirma que la variante FP32 es funcionalmente equivalente a la arquitectura original y difiere únicamente en precisión numérica.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image), tarea declarada del modelo.
- Compatibilidad con ComfyUI mediante archivo único de difusión, lo que facilita su integración en flujos de trabajo visuales basados en nodos.
- Conservación de precisión numérica completa (FP32), útil para análisis comparativos frente a versiones BF16.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, tool calling, agentes ni procesamiento de audio o vídeo.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre precisión numérica en difusión: comparar salidas FP32 frente a BF16 para medir el impacto de la cuantización en la calidad de imagen generada y en la estabilidad del muestreo.
- Análisis de arquitecturas de difusión: al ser un transformer de flujo único, sirve para estudiar el comportamiento interno de este tipo de arquitecturas con pesos sin degradar.
- Pruebas de compatibilidad en ComfyUI: validar que nodos y flujos personalizados funcionan con un archivo de difusión único en FP32 antes de migrar a versiones reducidas.
- Generación de imágenes de referencia para evaluación: producir un conjunto de imágenes "ground truth" en máxima precisión contra el que comparar versiones cuantizadas.
- Reproducibilidad de experimentos: al preservar la precisión completa, reduce la variabilidad numérica entre ejecuciones en distintas plataformas.
- Desarrollo de pipelines de generación de imágenes en entornos de investigación donde la latencia no es crítica y prima la fidelidad numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta al desconocerse el número de parámetros. Con un repositorio de 24,6 GB en FP32, la inferencia requiere al menos esa cantidad de memoria solo para los pesos, más el overhead de activaciones y del VAE/text encoder asociados.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño en FP32, es previsible que requiera GPUs de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM; la model card advierte que la inferencia FP32 en GPUs consumer puede ser más lenta que en BF16.
- ¿Cabe en GPU consumer? No confirmado; dependerá del recuento real de parámetros. La advertencia del autor sugiere que es posible pero con penalización de rendimiento.
- Opciones de despliegue: ComfyUI (soporte declarado); el formato `safetensors` de archivo único es compatible con cargadores de difusión en PyTorch. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de imágenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Z-Image Supervised FineTune (FP32) | no disponible | FP32 | safetensors (single file) | Apache 2.0 | ComfyUI |
| Z-Image Supervised FineTune (BF16) | no disponible | BF16 | no disponible | Apache 2.0 (según repo original) | no disponible |
| Z-Image base (arXiv:2511.22699) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card indica que la inferencia FP32 en GPUs consumer puede ser más lenta que en BF16, por lo que no es la variante recomendada para producción con requisitos de latencia.
- El autor declara que los archivos se proporcionan "as is" para builds experimentales y remite a los repositorios originales para cuestiones de licencia comercial.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas específicas.
- Al desconocerse el dataset de fine-tuning supervisado, no es posible evaluar posibles sesgos de dominio o de estilo introducidos por dicho ajuste.
- Licencia Apache 2.0 declarada, pero el autor advierte de que debe verificarse en los repositorios originales para uso comercial.
- El repositorio no registra descargas ni validación comunitaria, lo que reduce la evidencia empírica sobre su calidad y estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/PixWizardry/Z-image_Supervised_FineTune_FP32
- Paper de referencia: arXiv:2511.22699 — "Z-Image: An Efficient Image Generation Foundation Model with Single-Stream Diffusion Transformer" (https://arxiv.org/abs/2511.22699)
