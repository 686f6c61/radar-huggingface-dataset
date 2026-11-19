# dissembill/mirror-z-image-turbo-mflux-4bit

## Resumen

Z-Image-Turbo-mflux-4bit es una versión cuantizada a 4 bits de Z-Image-Turbo, un modelo de generación de imágenes texto-a-imagen desarrollado por Tongyi Lab (Alibaba). El repositorio lo publica el usuario dissembill como espejo ("mirror") de los pesos cuantizados preparados para MFLUX, el framework de inferencia optimizado para Apple Silicon. El modelo base es un DiT (Diffusion Transformer) de 6.000 millones de parámetros con arquitectura de un solo stream, diseñado para generar imágenes de alta calidad en tan solo 9 pasos de muestreo, lo que lo sitúa entre los modelos open source más rápidos de su categoría.

La relevancia de esta ficha concreta reside en la cuantización: reduce el peso del repositorio a 5,9 GB, lo que permite ejecutar un modelo de 6B en hardware con memoria unificada limitada, típicamente equipos Mac con chip Apple. No se trata de un modelo nuevo ni de un fine-tune, sino de un artefacto de despliegue que hereda íntegramente las capacidades y limitaciones del modelo original.

La información pública disponible es escasa: el repositorio no incluye datos de benchmarks, composición del dataset de entrenamiento ni detalles sobre el proceso de cuantización más allá de la indicación "4-bit". Esta ficha se limita a lo verificable en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de un solo stream |
| Parametros totales | 6B (modelo base Z-Image-Turbo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | 4-bit (única variante publicada en este repo) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Tongyi Qianwen License (heredada del modelo base) |
| Formato de pesos | safetensors (formato MFLUX) |
| Framework de inferencia | MFLUX v0.13.0 o superior |
| Pasos de muestreo recomendados | 9 |
| Tamano del repositorio | 5,9 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo base Z-Image-Turbo emplea una arquitectura Diffusion Transformer (DiT) de un solo stream con 6.000 millones de parámetros. Los DiT sustituyen los bloques convolucionales de las U-Net clásicas por bloques de atención tipo transformer sobre parches latentes, lo que mejora la coherencia global de la imagen generada. La denominación "single-stream" indica que el modelo procesa las condiciones de texto y los latentes de imagen en un único flujo de tokens, en lugar de mantener ramas separadas para cada modalidad.

El rasgo técnico más destacable es la eficiencia de muestreo: el modelo genera imágenes en 9 pasos, frente a los 20-50 habituales en modelos de difusión comparables. Esto reduce drásticamente la latencia de inferencia. No se dispone de información pública en este repositorio sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del esquema de destilación o destilación por trayectoria que presumiblemente permite los 9 pasos. Tampoco se documenta el método exacto de cuantización a 4 bits aplicado por el autor del espejo.

## Capacidades

- Generación de imágenes texto-a-imagen de alta calidad a partir de prompts descriptivos en lenguaje natural.
- Generación rápida: 9 pasos de muestreo, lo que permite iteración ágil en entornos de prototipado.
- Soporte de resolución configurable mediante parámetros de anchura y altura (el ejemplo de la model card usa 1280x720).
- Control de semilla para reproducibilidad de resultados.
- Compatibilidad con LoRA: el ejemplo oficial carga un LoRA externo con escala configurable, lo que permite adaptar el estilo sin reentrenar.
- Integración con MFLUX, lo que habilita ejecución en Apple Silicon con memoria unificada.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento; es un modelo exclusivamente generativo de imagen.

## Casos de uso

- Prototipado rápido de conceptos visuales: con 9 pasos y pesos de 5,9 GB, un diseñador puede iterar decenas de variaciones de una idea en un Mac sin GPU dedicada, usando semillas distintas para explorar el espacio creativo.
- Generación de ilustraciones para blogs y documentación técnica: el modelo produce imágenes coherentes a partir de descripciones detalladas, adecuado para portadas o figuras de artículos donde no se requiere fotorrealismo extremo.
- Creación de assets para videojuegos indie: combinado con LoRA de estilo, permite generar concept art de personajes y escenarios de forma local, sin depender de APIs de pago ni enviar prompts a servicios externos.
- Exploración estilística con LoRA: el soporte de `--lora-paths` y `--lora-scales` permite aplicar estilos concretos (por ejemplo, estética de cine de los años 60) sobre el modelo base, útil para estudios de dirección de arte.
- Generación de imágenes de referencia para maquetas web: a 1280x720 o resoluciones similares, sirve para rellenar placeholders realistas en prototipos de interfaz antes de la producción fotográfica.
- Experimentación académica en difusión: al ser un DiT de 6B cuantizado y ejecutable en hardware de consumo, facilita la investigación sobre dinámicas de muestreo con pocos pasos sin requerir clústeres de GPU.
- Uso en entornos con requisitos de privacidad: al ejecutarse localmente vía MFLUX, los prompts y las imágenes no salen del equipo, lo que encaja en flujos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 5,9 GB en pesos 4-bit; se necesita memoria adicional para activaciones y latentes, por lo que se recomienda un mínimo de 8-10 GB de memoria unificada o VRAM para resoluciones moderadas.
- Hardware objetivo: MFLUX está diseñado para Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra), por lo que el despliegue natural es en equipos Mac con memoria unificada suficiente.
- GPU dedicadas: no se documenta soporte oficial para CUDA en este repositorio; el framework indicado es MFLUX, no vLLM, TGI ni llama.cpp.
- Cabe en consumer hardware: sí, en Macs con 16 GB o más de memoria unificada, siempre que se use la variante 4-bit.
- Opciones de despliegue: comando `mflux-generate-z-image-turbo` de MFLUX v0.13.0 o superior; instalación mediante `uv tool install --upgrade mflux`.
- Latencia y throughput: no disponibles; la model card solo indica que 9 pasos hacen del modelo uno de los más rápidos open source, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Cuantizacion | Framework | Licencia |
|---|---|---|---|---|---|
| Z-Image-Turbo-mflux-4bit (este) | 6B | 9 | 4-bit | MFLUX | Tongyi Qianwen License |
| Z-Image-Turbo (base) | 6B | 9 | fp16/bf16 (presumible) | Difusores/MFLUX | Tongyi Qianwen License |
| Alternativas de difusion de ~6B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo frente a otros modelos de generación de imagen (FLUX, SDXL, SD3, etc.), por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Repositorio espejo: el autor es "dissembill", no el equipo de Tongyi Lab; la trazabilidad y el mantenimiento dependen de un tercero.
- Sin datos de benchmarks ni evaluación de calidad objetiva en este repositorio; el rendimiento cualitativo debe validarse por el usuario.
- La licencia Tongyi Qianwen License impone condiciones específicas para uso comercial; es imprescindible revisar el texto completo en el repositorio del modelo base antes de desplegar en producción.
- La cuantización a 4 bits puede degradar la fidelidad de detalles finos, texto dentro de la imagen y coherencia en escenas complejas respecto al modelo en precisión completa; no se documenta la magnitud de esta pérdida.
- Dependencia estricta de MFLUX v0.13.0 o superior; no es compatible directamente con otros runners sin conversión.
- Riesgo de sesgos en el modelo base: al no publicarse la composición del dataset, no es posible evaluar sesgos demográficos, culturales o de representación.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomías incorrectas, texto ilegible o elementos incoherentes, especialmente con prompts ambiguos.
- Idiomas soportados no documentados; los ejemplos están en inglés y no hay evidencia de calidad con prompts en castellano.
- No apto para tareas de comprensión de imagen, edición guiada, tool calling ni agentes; su única función es la generación texto-a-imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dissembill/mirror-z-image-turbo-mflux-4bit
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Licencia Tongyi Qianwen: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/blob/main/LICENSE
- Repositorio MFLUX: https://github.com/filipstrand/mflux
- LoRA de ejemplo (Technically Color): https://huggingface.co/renderartist/Technically-Color-Z-Image-Turbo
