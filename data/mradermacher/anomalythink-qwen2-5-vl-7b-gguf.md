# mradermacher/AnomalyThink-Qwen2.5-VL-7B-GGUF

## Resumen

AnomalyThink-Qwen2.5-VL-7B-GGUF es una cuantización en formato GGUF del modelo AnomalyThink-Qwen2.5-VL-7B-KCR, desarrollado por aacudad. El modelo original es un fine-tuning de Qwen2.5-VL-7B sobre el dataset aacudad/AnomalyThink, especializado en detección de anomalías industriales y razonamiento visual-lingüístico. La conversión a GGUF ha sido realizada por mradermacher, lo que permite ejecutar el modelo en entornos con recursos limitados mediante herramientas como llama.cpp u Ollama.

El modelo combina la arquitectura multimodal de Qwen2.5-VL (visión y lenguaje) con un entrenamiento específico para identificar defectos, irregularidades o condiciones anómalas en imágenes industriales. Con aproximadamente 7.6 mil millones de parámetros, ofrece un equilibrio entre capacidad de razonamiento y coste computacional. La disponibilidad de múltiples niveles de cuantización (desde Q2_K hasta f16) lo hace versátil para diferentes presupuestos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen2.5-VL-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj para el procesador multimodal) |

## Arquitectura y entrenamiento

El modelo es una cuantización estática en GGUF del modelo AnomalyThink-Qwen2.5-VL-7B-KCR. El modelo base es un fine-tuning de Qwen2.5-VL-7B sobre el dataset aacudad/AnomalyThink, orientado a la detección de anomalías industriales y al razonamiento sobre imágenes. No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF, DPO). La cuantización fue realizada por mradermacher y, en el momento de la publicación, no se han incluido pesos con imatrix.

## Capacidades

- Detección de anomalías industriales a partir de imágenes (industrial anomaly detection).
- Razonamiento visual-lingüístico: el modelo puede combinar información visual y textual para describir y analizar escenas.
- Generación de texto en inglés, incluyendo respuestas descriptivas y explicativas.
- Conversación multimodal: acepta entradas de imagen y texto de forma conjunta.
- No se especifican capacidades de tool calling, function calling o uso como agente en la información disponible.

## Casos de uso

- Inspección de calidad en líneas de producción: el modelo puede analizar imágenes de productos en tiempo real y detectar defectos visuales, lo que permite automatizar el control de calidad sin intervención humana.
- Mantenimiento predictivo: análisis de imágenes de maquinaria o componentes para identificar signos de desgaste, corrosión o anomalías antes de que se produzcan fallos, reduciendo paradas no planificadas.
- Control de calidad en manufactura textil: detección de defectos en tejidos, costuras o prendas a partir de fotografías, facilitando la clasificación automática de productos.
- Análisis de imágenes de seguridad industrial: identificación de condiciones anómalas en entornos de trabajo, como equipos mal posicionados, fugas o acumulación de residuos, para alertar al personal de seguridad.
- Documentación de incidencias: generación automática de informes descriptivos a partir de imágenes de anomalías, combinando la capacidad de visión con la generación de lenguaje natural.
- Asistencia a operarios en planta: el modelo puede recibir una fotografía de un equipo y responder preguntas sobre posibles anomalías, actuando como asistente técnico de apoyo en la toma de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluyendo mmproj): para Q4_K_M (~4.8 GB) se necesitan aproximadamente 6 GB; para Q5_K_M (~5.5 GB), unos 7 GB; para Q6_K (~6.4 GB), unos 8 GB; para Q8_0 (~8.2 GB), unos 9.5 GB; para f16 (~15.3 GB), unos 17 GB.
- GPU recomendadas: Q4_K_M y Q5_K_M pueden ejecutarse en RTX 3060 12GB o RTX 4070. Q6_K y Q8_0 son adecuados para RTX 3090 o RTX 4090. La versión f16 requiere una GPU con 24 GB o más, como A100 o H100.
- Sí cabe en GPUs de consumo: las cuantizaciones Q4_K_M y Q5_K_M caben en tarjetas de 8-12 GB de VRAM.
- Opciones de despliegue: para el formato GGUF, se recomienda llama.cpp, Ollama o LM Studio. Para el modelo base en safetensors, se puede usar vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo solo está disponible en inglés, lo que limita su uso en contextos multilingües.
- La longitud de contexto no está especificada en la información disponible.
- Al ser un fine-tuning especializado, puede degradar su rendimiento en tareas fuera de la detección de anomalías industriales.
- Existe riesgo de alucinación inherente a los modelos de lenguaje, especialmente cuando se le presentan imágenes ambiguas o fuera de su dominio de entrenamiento.
- No se han publicado resultados de benchmarks, por lo que no se puede verificar su rendimiento frente a modelos alternativos.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base y de los datos de entrenamiento para asegurar el cumplimiento normativo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mradermacher/AnomalyThink-Qwen2.5-VL-7B-GGUF
- Modelo base: https://huggingface.co/aacudad/AnomalyThink-Qwen2.5-VL-7B-KCR
- Dataset de entrenamiento: https://huggingface.co/datasets/aacudad/AnomalyThink
- Cuantización KCR alternativa: https://huggingface.co/mradermacher/AnomalyThink-Qwen2.5-VL-7B-KCR-GGUF
