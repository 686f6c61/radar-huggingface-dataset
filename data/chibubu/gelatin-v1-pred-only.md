# chibubu/gelatin-v1-pred-only

## Resumen

Gelatin v1 (predictor-only) es un modelo de audio a texto desarrollado por Chibuzor Okocha (usuario `chibubu`) que implementa una predicción de fronteras aprendida ("learned boundary prediction") para mejorar la tokenización de audio. El modelo acompaña al artículo "Does Learned Boundary Prediction Improve Audio Tokenization?", aceptado en ICASSP 2027, y representa la mejor variante de predicción de fronteras del estudio. Su objetivo es segmentar la señal de audio en tokens de duración variable antes de alimentar un modelo de lenguaje, en lugar de usar una tokenización de longitud fija.

La arquitectura es un pipeline de tres etapas: un codificador de audio HTSAT-AudioSet congelado (768 dimensiones), un predictor de fronteras aprendido de 128 dimensiones ocultas que genera objetivos de 32 tokens, un proyector lineal 768→576 congelado y un modelo de lenguaje SmolLM2-135M también congelado. Solo se entrena el predictor de fronteras, lo que convierte al modelo en un experimento de ablación centrado en la calidad de la tokenización más que en la capacidad generativa.

El modelo es relevante en el contexto de investigación sobre tokenización de audio para modelos de audio-lenguaje, ya que cuantifica si aprender las fronteras de segmentación aporta mejoras medibles frente a una línea base (Mellow v0). Con 0.8 GB de repositorio y licencia MIT, está pensado para reproducibilidad académica más que para despliegue comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline audio-lenguaje: HTSAT-AudioSet (encoder) + predictor de fronteras + proyector lineal + SmolLM2-135M (LM) |
| Parametros totales | no disponible (el checkpoint completo ocupa 640 MB; SmolLM2-135M tiene 135M y HTSAT no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`model.ckpt`, `htsat_encoder.ckpt`) |

## Arquitectura y entrenamiento

El modelo sigue un diseño modular con componentes mayoritariamente congelados. El codificador de audio es HTSAT-AudioSet, que produce representaciones de 768 dimensiones; estas pasan por un predictor de fronteras aprendido con 128 dimensiones ocultas y temperatura 1.0, que genera una segmentación objetivo de 32 tokens. Un proyector lineal de 768 a 576 adapta la dimensión al modelo de lenguaje SmolLM2-135M, que permanece congelado. El presupuesto de tokens es de 128, igual que en la línea base Mellow v0.

El entrenamiento se realizó únicamente sobre el predictor de fronteras, partiendo del checkpoint base Mellow v0.ckpt, sobre el split completo de entrenamiento del dataset ReasonAQA (aproximadamente 968 000 pares pregunta-respuesta), durante 2 épocas con early stopping (paciencia 3), optimizador Adam con lr=1e-3, schedule coseno y precisión bfloat16. La ablación clave fue eliminar el bonus de entropía (`entropy_bonus_weight=0.0`), lo que según el autor mejoró el aprendizaje de fronteras. No se especifican detalles sobre el volumen total de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por audio (audio-text-to-text) en inglés.
- Predicción de fronteras de segmentación de audio para tokenización de duración variable.
- Respuesta a preguntas sobre contenido de audio (evaluado en MMAU).
- Descripción de audio (captioning), evaluado en AudioCaps y Clotho.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No se documentan modos especiales como thinking mode, visión o audio de entrada adicional más allá del pipeline declarado.

## Casos de uso

- Investigación en tokenización de audio: sirve como referencia reproducible para comparar tokenización de fronteras aprendidas frente a tokenización de longitud fija, dado que el código y los checkpoints están publicados con licencia MIT.
- Evaluación de ablaciones académicas: permite reproducir el resultado de eliminar el bonus de entropía y medir su impacto en MMAU y CIDEr sobre el mismo dataset y presupuesto de tokens.
- Respuesta a preguntas sobre audio en inglés: el pipeline audio-text-to-text puede usarse para prototipos de QA sobre clips de audio, aunque con precisión limitada (36.1% en MMAU).
- Generación de descripciones de audio: útil para experimentos de captioning en AudioCaps (CIDEr 0.390) y Clotho (CIDEr 0.235) dentro de entornos de investigación.
- Base para fine-tuning de componentes: al mantener el LM y el proyector congelados, el modelo es un punto de partida para estudiar únicamente el predictor de fronteras en nuevos datasets.
- Docencia y reproducción de resultados: el tamaño reducido del repositorio (0.8 GB) y los checkpoints separados facilitan su uso en entornos académicos con recursos limitados.
- Comparación de arquitecturas de tokenización: permite contrastar el enfoque de fronteras aprendidas con la línea base Mellow v0 y con la variante zero-shot del mismo autor.

## Benchmarks y rendimiento

| Metrica | Gelatin v1 (predictor-only) | Mellow Baseline (v0) |
|---|---|---|
| MMAU Accuracy | 36.1% | 35.2% |
| AudioCaps CIDEr | 0.390 | 0.379 |
| Clotho CIDEr | 0.235 | 0.246 |
| Token Budget | 128 | 128 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo ocupa 640 MB y el encoder HTSAT 122 MB, por lo que en precisión completa el modelo debería caber en GPUs consumer con al menos 4-8 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; por tamaño, una RTX 4090 o superior sería suficiente, pero no se especifica.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del checkpoint, aunque no está confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es un checkpoint PyTorch que requiere cargar la configuración (`config.yaml`) y los componentes por separado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMAU | AudioCaps CIDEr | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gelatin v1 (predictor-only) | no disponible (LM 135M) | no disponible | 36.1% | 0.390 | MIT | Hugging Face |
| Mellow v0 (línea base) | no disponible | no disponible | 35.2% | 0.379 | no disponible | Referenciado como checkpoint base |
| Gelatin v1 Zero-Shot | no disponible | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se entrena el predictor de fronteras; el LM, el proyector y el encoder están congelados, por lo que la capacidad generativa está acotada por SmolLM2-135M.
- Rendimiento limitado: 36.1% de accuracy en MMAU y CIDEr de 0.235 en Clotho, por debajo de la línea base en este último benchmark.
- Solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, no cuantificado en la documentación.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad.
- La licencia MIT permite uso comercial, pero el modelo está orientado a investigación y no se han publicado garantías de rendimiento en producción.
- No se especifican limitaciones de longitud de contexto ni de duración máxima de audio.
- El artículo asociado está fechado en ICASSP 2027, por lo que los resultados deben considerarse preliminares hasta la publicación formal.

## Enlaces

- Hugging Face: https://huggingface.co/chibubu/gelatin-v1-pred-only
- Repositorio GitHub: https://github.com/unruli/Gelatin
- Gelatin v1 Zero-Shot: https://huggingface.co/chibubu/gelatin-v1-zero-shot
- Modelo base Mellow: https://huggingface.co/chibubu/gelatin-base-mellow
