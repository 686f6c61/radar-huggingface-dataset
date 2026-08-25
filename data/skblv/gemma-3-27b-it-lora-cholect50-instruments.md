# skblv/gemma-3-27b-it-lora-cholect50-instruments

## Resumen

El modelo `skblv/gemma-3-27b-it-lora-cholect50-instruments` es un adaptador LoRA más un cabezal de clasificación lineal de 6 clases, desarrollado por la comunidad SDSC × Chicago Booth, que se acopla sobre el modelo multimodal `google/gemma-3-27b-it` para realizar clasificación multi‑etiqueta de instrumentos quirúrgicos en fotogramas del conjunto de datos CholecT50 (colecistectomía laparoscópica). El resultado es un sistema que detecta la presencia simultánea de hasta seis herramientas quirúrgicas en cada imagen, con una exactitud de coincidencia completa del 83,02% y un F1 micro‑promediado del 92,83% en la división de validación.

La relevancia de este modelo radica en que combina un LLM multimodal de última generación (Gemma 3, 27 mil millones de parámetros, ventana de contexto de 128K tokens) con un adaptador LoRA de bajo rango (r=128, alpha=256) y un cabez lineal específico para la tarea, logrando resultados de investigación sin necesidad de ajustar el modelo completo. El adaptador se aplica sobre las proyecciones `q/k/v/o_proj` y `out_proj`, y el cabez lineal opera sobre el estado oculto de 5376 dimensiones del modelo base. La licencia es Gemma y el repositorio pesa 1.2 GB, correspondientes al adaptador y al clasificador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=128, alpha=256) sobre Gemma 3 27B‑it (transformer multimodal) |
| Parámetros totales | 27B (modelo base) + adaptador LoRA y cabez lineal (número exacto no disponible) |
| Parámetros activos | 27B (modelo base, todos activos; no es MoE) |
| Longitud de contexto | 128K tokens (modelo base; no aplica directamente a clasificación de imágenes) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con GGUF, bitsandbytes, etc.) |
| Idiomas soportados | No aplica (tarea de clasificación de imágenes) |
| Licencia | Gemma (términos de Google) |
| Formato de pesos | safetensors (adapter_model.safetensors) y PyTorch (classifier.pt) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 27B‑it, un LLM multimodal de Google DeepMind que procesa texto e imágenes, con arquitectura transformer y atención estándar, entrenado con 128K tokens de contexto y soporte para más de 140 idiomas. Para esta tarea, el adaptador LoRA se inyecta en las capas de atención (q, k, v, o) y en `out_proj` con un rango de 128 y alpha de 256, y se añade un cabez lineal de 6 salidas sobre el estado oculto de 5376 dimensiones. El modelo completo se entrena de forma supervisada para clasificación multi‑etiqueta, no para generación de texto.

El entrenamiento se realizó durante 10 épocas con una tasa de aprendizaje de 5e-6, tamaño de lote efectivo de 2 y semilla 42. Se usaron 80.940 fotogramas de entrenamiento y 19.923 de validación del conjunto CholecT50. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado sobre etiquetas de presencia de instrumentos. El modelo base se congela y solo se optimiza el adaptador LoRA y el cabez lineal.

## Capacidades

- Clasificación multi‑etiqueta de presencia de instrumentos quirúrgicos en imágenes de laparoscopia, con 6 clases de herramientas.
- Procesa fotogramas individuales de vídeo (no secuencias temporales) y devuelve un vector de probabilidades binarias para cada instrumento.
- Integración con el modelo base Gemma 3 para aprovechar la representación visual aprendida de su entrenamiento multimodal.
- El adaptador LoRA permite un ajuste eficiente de parámetros sin modificar el modelo base, facilitando el despliegue con menos recursos.
- No genera texto, no soporta tool calling, ni agentes, ni razonamiento de lenguaje; su única salida es la clasificación de imágenes.
- No es un modelo multilingüe en el sentido de lenguaje; las etiquetas de salida son internas y el sistema funciona independientemente del idioma.

## Casos de uso

- Análisis de vídeos de colecistectomía laparoscópica: el modelo puede procesar fotogramas de una intervención y reportar en tiempo real qué instrumentos están presentes, ayudando a la documentación automática de procedimientos.
- Entrenamiento quirúrgico: en simuladores o vídeos educativos, el sistema puede etiquetar automáticamente los instrumentos que aparecen en cada momento, permitiendo a los estudiantes verificar su reconocimiento visual.
- Auditoría de calidad clínica: los hospitales pueden analizar grandes colecciones de vídeos quirúrgicos para verificar el uso correcto de los instrumentos según el protocolo, sin revisión manual.
- Investigación en vídeo quirúrgico: sirve como modelo de referencia para benchmarks de detección de instrumentos, como el leaderboard SDSC × Chicago Booth, permitiendo comparar nuevos métodos.
- Soporte a sistemas de asistencia en el quirófano: integrado en un pipeline de visión por computador, puede alertar sobre la presencia inesperada de un instrumento en el campo quirúrgico.
- Automatización de informes quirúrgicos: al combinar las predicciones con un sistema de generación de texto, se pueden crear informes automáticos de los instrumentos utilizados en cada fase de la operación.

## Benchmarks y rendimiento

Los resultados se evaluaron sobre la división de validación completa de CholecT50, con intervalos de confianza bootstrap del 95%:

| Métrica | Valor |
|---|---|
| Exact match | 83,02 % (82,52–83,56) |
| Micro‑F1 | 92,83 % (92,58–93,07) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA y el cabez lineal son ligeros (1,2 GB), pero requieren el modelo base Gemma 3 27B‑it cargado en memoria para la inferencia.
- El modelo base en fp16 ocupa aproximadamente 54 GB de VRAM, por lo que se recomienda una GPU con al menos 32 GB (A100 40GB, H100 80GB) o usar cuantización a 4‑bit (~16 GB) para caber en una RTX 4090 (24 GB) o similar.
- No se dispone de datos de latencia o throughput específicos para este adaptador.
- Opciones de despliegue: se puede usar con la biblioteca `transformers` (cargando el adaptador con PEFT), o cuantizar el modelo base con bitsandbytes para reducir el consumo. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, pero el modelo base Gemma 3 es compatible con estas herramientas si se usa como generador de texto; para clasificación, se recomienda usar el pipeline de imagen‑clasificación de Transformers.
- Para uso en investigación, un solo GPU de 24 GB con cuantización 4‑bit es suficiente; para producción con alta concurrencia, se recomienda A100 o H100.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables específicos para la detección de instrumentos en CholecT50 en la información proporcionada. No se puede realizar una comparación cuantitativa con alternativas como YOLO‑based detectors u otros adaptadores multimodales. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo es un "baseline de investigación" según el autor, y no es un dispositivo médico. No debe usarse para decisiones clínicas sin validación adicional.
- La clasificación se limita a 6 instrumentos específicos del conjunto CholecT50; no generaliza a otros instrumentos o dominios quirúrgicos.
- El modelo solo procesa imágenes individuales, no tiene memoria temporal ni análisis de secuencias de vídeo.
- El adaptador se entrenó sobre fotogramas de colecistectomía laparoscópica; el rendimiento en otros tipos de cirugía no se ha evaluado.
- El modelo base Gemma 3 puede tener sesgos de su entrenamiento, aunque aquí se usa solo como extractor de características visuales, por lo que el riesgo de alucinación de texto no aplica.
- La licencia Gemma puede imponer restricciones de uso comercial; se recomienda revisar los términos de Google para el modelo base.
- El tamaño del adaptador (1,2 GB) es relativamente grande para un LoRA, lo que puede dificultar el despliegue en entornos con recursos limitados si no se cuantiza el modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/skblv/gemma-3-27b-it-lora-cholect50-instruments)
- [Conjunto de datos CholecT50](https://github.com/CAMMA-public/cholect50)
- [Leaderboard de vídeo quirúrgico SDSC × Chicago Booth](https://github.com/skblv/neurosurgery-video-eval-website)
- [Modelo base Gemma 3 27B‑it en Hugging Face](https://huggingface.co/google/gemma-3-27b-it)
- [Informe técnico de Gemma 3 (arXiv)](https://arxiv.org/html/2503.19786v1)
