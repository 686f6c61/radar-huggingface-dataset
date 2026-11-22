# djrsystemservices/Spark-X2.6-4B-oQ8e

## Resumen

Spark-X2.6-4B-oQ8e es una conversión cuantizada del checkpoint Spark-X2.6-4B-bf16, publicada por el usuario djrsystemservices en Hugging Face. No se trata de un modelo original, sino de una redistribución en formato MLX con cuantización oQ8e (8 bits con calibración selectiva por sensibilidad de tensor) generada mediante la herramienta oMLX 0.8.0rc1. El modelo base pertenece al repositorio XHToken/Spark-X2.6-4B, del que se desconoce igualmente la model card completa en la información disponible.

El interés técnico de esta ficha reside en el método de cuantización empleado: oQe aplica una matriz de importancia (imatrix) calculada sobre 128 muestras de 512 tokens para asignar precisión de forma no uniforme a cada tensor, en lugar de reducir todos los pesos a un ancho de bits fijo. El resultado se documenta en el fichero `oq_imatrix_report.json` incluido en el repositorio.

El modelo cuenta con 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) y el repositorio ocupa 4,4 GB. Está pensado para ejecución en hardware Apple Silicon mediante el framework MLX. No se dispone de información sobre arquitectura interna, contexto, licencia ni idiomas del modelo base en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Spark-X2.6-4B; tag `spark2_5` sugiere familia Spark 2.5) |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (8 bits, calibración imatrix selectiva, `enhanced=True`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se remite a la licencia del modelo original XHToken/Spark-X2.6-4B) |
| Formato de pesos | safetensors (MLX), posible sharding con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en los datos proporcionados. El tag `spark2_5` en Hugging Face sugiere que pertenece a la familia Spark 2.5, pero no se confirma si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación documentada en esta conversión es el proceso de cuantización oQe: se calcula una imatrix de sensibilidad con 128 muestras de 512 tokens y se asigna precisión de forma selectiva por tensor, en lugar de aplicar un ancho de bits uniforme. El comando de conversión documentado es `python run_oqe_conversion.py Spark-X2.6-4B-bf16 --models-dir /path/to/models --oq-level 8.0 --imatrix-samples 128 --imatrix-seq-length 512 --source-repo https://huggingface.co/XHToken/Spark-X2.6-4B`. El resultado de la asignación queda registrado en `oq_imatrix_report.json`.

## Capacidades

- No se han documentado capacidades específicas del modelo base en la información disponible.
- El tag `custom_code` indica que el repositorio requiere código personalizado para su carga, probablemente ligado a la implementación de oQe en oMLX.
- El formato MLX implica soporte nativo en Apple Silicon a través de la librería `mlx`.
- No hay evidencia en la información proporcionada sobre soporte de tool calling, agentes, visión, audio, modo thinking ni capacidades multilingües.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX y cuantizado a 8 bits, lo que permite ejecutarlo en Macs con memoria unificada mediante `mlx_lm` u otras herramientas compatibles con MLX.
- Evaluación de técnicas de cuantización: el repositorio incluye el informe de imatrix, útil para investigar el impacto de la asignación selectiva de precisión frente a la cuantización uniforme.
- Prototipado de aplicaciones de lenguaje en entornos de desarrollo macOS: al ocupar 4,4 GB, cabe en configuraciones de memoria moderada y permite iterar sin infraestructura GPU dedicada.
- Reproducción de pipelines de conversión: el comando documentado sirve como referencia para convertir otros checkpoints bf16 a oQ8e con oMLX.
- Experimentación académica con modelos de ~4 B: útil como baseline en estudios comparativos de cuantización, siempre que se verifique la licencia del modelo original.
- Despliegue en entornos con restricciones de conectividad: al ser un checkpoint local en formato safetensors, puede ejecutarse sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 4,4 GB en disco; en memoria unificada se requiere un espacio similar más el overhead del runtime MLX (aproximadamente 5-6 GB en total).
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con memoria unificada suficiente. No está pensado para GPU NVIDIA en su formato actual.
- Cabe en GPU consumer: sí, en cualquier Mac con al menos 8 GB de memoria unificada, aunque 16 GB es recomendable para margen operativo.
- Opciones de despliegue: `mlx_lm` (librería MLX), herramientas compatibles con MLX; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables en la documentación proporcionada. Como referencia de categoría, modelos densos de ~4 B en 8 bits suelen ocupar entre 4 y 5 GB y ejecutarse en hardware consumer, pero no se pueden establecer comparaciones de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- La licencia no está especificada en este repositorio; el autor remite a la licencia del modelo original XHToken/Spark-X2.6-4B, que debe verificarse antes de cualquier uso comercial.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en un margen de menos de 10 minutos, lo que sugiere que no ha sido validado por la comunidad.
- El tag `custom_code` implica que la carga requiere código específico; no funcionará con cargadores estándar de transformers sin adaptación.
- La cuantización a 8 bits con asignación selectiva puede introducir degradaciones no documentadas respecto al checkpoint bf16 original; no se han publicado evaluaciones comparativas.
- El formato MLX limita el despliegue a ecosistema Apple; no es portable directamente a CUDA.
- No se dispone de información sobre el pipeline, los idiomas ni el contexto, lo que impide garantizar su idoneidad para tareas de producción concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/djrsystemservices/Spark-X2.6-4B-oQ8e
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Librería MLX: no disponible en la información proporcionada
- Herramienta oMLX: no disponible en la información proporcionada
