# johko/nanoVLM

## Resumen

nanoVLM es un modelo de lenguaje y visión (VLM) mínimo y ligero, diseñado para entrenamiento eficiente y experimentación. Desarrollado por la comunidad de Hugging Face (con repositorios de johko, jaehyeono, ZGZY y juyoungml), su implementación en PyTorch puro ocupa aproximadamente 750 líneas de código, lo que lo convierte en una herramienta ideal para comprender y prototipar arquitecturas multimodales. Combina un codificador de imágenes basado en ViT (SigLIP-B/16-224-85M) con un modelo de lenguaje causal ligero (SmolLM2-135M), resultando en un modelo compacto de unos 222 millones de parámetros (el peso real en safetensors es de 228.063.968 parámetros). Su licencia MIT permite uso comercial y modificación sin restricciones, y su tamaño reducido lo hace accesible para entornos con recursos limitados. La relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que pueden ejecutarse en hardware de consumo, facilitando la investigación y el desarrollo de aplicaciones de visión-lenguaje sin necesidad de infraestructura masiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (SigLIP-B/16-224) + LM causal (SmolLM2-135M) |
| Parametros totales | 228.063.968 (según safetensors; la model card indica 222M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

nanoVLM sigue una arquitectura clásica de VLM: un codificador de visión basado en ViT (SigLIP-B/16-224, con 85M parámetros) procesa imágenes de 224x224 píxeles, y un modelo de lenguaje causal (SmolLM2-135M) genera texto condicionado a las características visuales. La implementación está escrita en PyTorch puro y cabe en unas 750 líneas de código, lo que facilita su lectura y modificación. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El repositorio oficial (huggingface/nanoVLM) ofrece una versión v0.1 que funciona con el modelo de 222M, y la versión actual parece estar en desarrollo activo. No se documentan innovaciones técnicas específicas más allá de la simplicidad y la eficiencia del código.

## Capacidades

- Generación de texto a partir de imágenes: el modelo puede producir descripciones o respuestas basadas en contenido visual, aunque no se especifican tareas concretas.
- Comprensión de imágenes: al usar SigLIP, puede extraer características visuales de alta calidad para tareas de visión-lenguaje.
- Entrenamiento y fine-tuning eficiente: su pequeño tamaño permite ajustarlo en GPUs de consumo, ideal para experimentación.
- Código educativo: la implementación en ~750 líneas facilita el estudio de arquitecturas VLM y la depuración.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe explícito.

## Casos de uso

- Investigación académica en visión-lenguaje: los estudiantes e investigadores pueden usar nanoVLM para experimentar con arquitecturas multimodales, modificar el código y probar hipótesis sin necesidad de grandes recursos computacionales.
- Prototipado rápido de aplicaciones de captioning de imágenes: al ser ligero, se puede integrar en demos o pruebas de concepto para generar descripciones automáticas de imágenes en entornos con GPU limitada.
- Aprendizaje de técnicas de entrenamiento de VLMs: el código de ~750 líneas sirve como material didáctico para entender cómo se combinan un encoder de visión y un LM causal.
- Fine-tuning en dominios específicos: por ejemplo, ajustar el modelo para clasificar imágenes médicas o industriales con pocos datos, gracias a su tamaño reducido.
- Evaluación de la viabilidad de modelos pequeños en edge computing: nanoVLM puede desplegarse en dispositivos con poca memoria para probar si un VLM compacto es suficiente para una tarea concreta.
- Base para desarrollo de agentes multimodales simples: aunque no tiene tool calling nativo, se puede integrar en pipelines que combinen visión y lenguaje para tareas de automatización básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con 228M parámetros, en FP32 se necesitan aproximadamente 912 MB solo para los pesos; en FP16 serían unos 456 MB. Añadiendo overhead de activaciones y optimizador durante el entrenamiento, se recomienda al menos 2-4 GB de VRAM para inferencia y 4-8 GB para fine-tuning.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso GPUs integradas con suficiente memoria compartida. Para entrenamiento, una RTX 3060 o superior es adecuada.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay soporte oficial documentado. También se puede ejecutar directamente con el código del repositorio.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una latencia baja en GPUs modernas (del orden de decenas de milisegundos por inferencia).

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros VLMs pequeños. Como referencia, modelos como LLaVA-Phi-3-mini (3.8B) o MiniGPT-4 (7B) son significativamente más grandes y requieren más recursos. nanoVLM se posiciona como una opción mínima para experimentación, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo pequeño entrenado con datos no especificados, puede heredar sesgos de los datos de entrenamiento.
- Riesgo de alucinación: alto, especialmente en tareas de generación de texto complejas, debido a su tamaño reducido.
- Limitaciones de contexto: la longitud de contexto no está publicada; se asume que es limitada (probablemente 2048 tokens o menos, típico de SmolLM2).
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente el modelo esté entrenado principalmente en inglés.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- Caveat para producción: no se recomienda su uso en entornos de producción sin una evaluación exhaustiva, dado su tamaño y la falta de benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johko/nanoVLM
- Repositorio oficial (huggingface/nanoVLM): https://github.com/huggingface/nanoVLM
- Repositorio alternativo (juyoungml/nanoVLM): https://github.com/juyoungml/nanoVLM
- Modelo base (lusxvr/nanoVLM-222M): https://huggingface.co/lusxvr/nanoVLM-222M
- Otras versiones en Hugging Face: https://huggingface.co/jaehyeono/nanoVLM y https://huggingface.co/ZGZY/nanoVLM
- Documentación en Day1Training: https://www.day1training.com/frameworks/nanovlm
