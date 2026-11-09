# groxaxo/Chatterbox-LatAm-MLX

## Resumen

Chatterbox LatAm MLX es una conversión al framework MLX de Apple Silicon del modelo de síntesis de voz Chatterbox Multilingual en su variante latinoamericana de español (`ResembleAI/Chatterbox-Multilingual-es-mx-latam`). El autor, groxaxo, publica pesos optimizados para ejecución nativa en hardware Apple (M1/M2/M3/M4) mediante la librería `mlx-audio`, con múltiples niveles de precisión y cuantización. El objetivo es permitir TTS de calidad en equipos de consumo sin depender de CUDA ni de GPUs dedicadas.

El repositorio incluye dos generaciones de paquetes: un conjunto inicial centrado en el componente T3 (el transformer de texto a tokens de habla) con variantes FP32, FP16 y Q8/Q6/Q5, y una actualización posterior de noviembre de 2026 que extiende la cuantización calibrada a todos los componentes (generador, encoder de voz, decoder/vocoder y tokenizador de habla). Los tamaños oscilan entre 0,578 GB (5-bit selectivo, todos los componentes) y 2,711 GB (FP32 T3). El conjunto completo de pesos ronda los 8,33 GB.

La relevancia actual radica en que demuestra una ruta práctica para desplegar TTS multilingüe de calidad en portátiles y estaciones Apple Silicon, con licencia MIT heredada del modelo original, y con métricas de regresión (KL de predicción de habla) para evaluar la degradación introducida por cada nivel de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox v3 (T3 transformer + encoder de voz + decoder/vocoder + tokenizador de habla S3TokenizerV2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16 (T3), Q8, Q6, Q5 selectivo (todos los componentes); mixed-precision |
| Idiomas soportados | es (variante latinoamericana, es-mx-latam) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `config.json` por variante y `SHA256SUMS.json` |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos del Chatterbox Multilingual de Resemble AI, un sistema TTS neural compuesto por un transformer T3 (texto a tokens de habla), un encoder de voz para condicionamiento por referencia, un decoder/vocoder para síntesis de forma de onda y el tokenizador de habla S3TokenizerV2 (revisión `e0c9886f0e1c35ae85b1f27277416fb19fc72bec`). La revisión del modelo fuente latinoamericano es `27e595bf2fe7be0533ca299d9afafcde08b7cca7`. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

La innovación técnica de esta conversión es la cuantización selectiva por capas (política oMLX) con "guards" de precisión que preservan tensores sensibles en BF16, y una calibración específica para las activaciones de habla en la actualización de noviembre de 2026. Las variantes Q8/Q6/Q5 del paquete inicial usan la política estructural sin calibración de activaciones; las nuevas variantes 8bit, 6bit-selective y 5bit-selective sí incorporan calibración y cubren los cuatro componentes. Los pesos no incluyen la corrección de runtime del vocoder: la pendiente negativa de la LeakyReLU final debe ser 0,01 (las intermedias 0,1), y usar 0,1 en la final produce audio saturado.

## Capacidades

- Síntesis de voz (text-to-speech) en español latinoamericano con condicionamiento por voz de referencia.
- Clonación/imitación de voz mediante encoder de voz a partir de una muestra de referencia.
- Generación de habla multilingüe limitada al español en esta variante.
- Ejecución nativa en Apple Silicon vía MLX, con `mlx-audio` como librería de integración.
- Variantes de precisión intercambiables (FP32, FP16, Q8, Q6, Q5) para equilibrar calidad y huella de memoria.
- Integración con el adaptador "Talk" del repositorio del autor para uso conversacional.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de audio.

## Casos de uso

- Lectura de artículos y documentos en catalán técnico: el modelo sintetiza texto largo con voz latinoamericana consistente, útil para pipelines de accesibilidad y lectura por voz en aplicaciones macOS/iOS.
- Audiolibros y pódcasts automatizados: la variante Q8 (1,264 GB solo T3, 0,854 GB con todos los componentes) cabe en memoria unificada de un MacBook, permitiendo generar capítulos completos por lotes.
- Asistentes de voz locales en dispositivos Apple: integración con el adaptador Talk para conversación por turnos sin enviar audio a la nube, relevante por privacidad.
- Doblaje y localización de contenido al español latinoamericano: condicionamiento por voz de referencia permite mantener el timbre del hablante original en clips cortos.
- Prototipado de interfaces conversacionales: las variantes 5-bit (0,578 GB) permiten iterar rápido en equipos con poca memoria unificada, aceptando la degradación medida (KL 0,00428 con condicionamiento congelado).
- Generación de avisos y mensajes pregrabados para sistemas de atención al cliente: TTS determinista con voz fija y licencia MIT apta para uso comercial.
- Investigación en compresión de modelos TTS: el repositorio publica métricas KL por variante para estudiar el impacto de la cuantización selectiva en la calidad del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo TTS. El autor publica métricas de regresión de calidad de habla en nats por predicción categórica (KL respecto a BF16, menor es mejor):

| Variante | Pesos totales | KL speech (cond. congelado) | KL speech (cond. fresca) |
|---|---:|---:|---:|
| 8bit | 0,854 GB | 0,00019795 | 0,00100343 |
| 6bit-selective | 0,668 GB | 0,00105281 | 0,00145445 |
| 5bit-selective | 0,578 GB | 0,00427880 | 0,00544967 |

El autor advierte que estos ocho ejemplos fijos constituyen una suite de regresión pequeña, no una certificación de calidad perceptual. Para el paquete T3 inicial no se publican métricas KL.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1/M2/M3/M4) con memoria unificada; MLX no está pensado para GPUs NVIDIA.
- VRAM/memoria unificada estimada: 0,578 GB (5-bit selectivo, todos los componentes) hasta 2,711 GB (FP32 T3) más 0,495 GB del tokenizador de habla; conjunto completo ~8,33 GB.
- Cabe en cualquier Mac con 8 GB de memoria unificada en variantes 5/6-bit; FP32 requiere al menos 16 GB recomendados para holgura.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato MLX no está orientado a CUDA.
- Despliegue: librería `mlx-audio` y el runner/adaptador Talk del repositorio `groxaxo/chatterbox-latam-mlx-private`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Chatterbox LatAm MLX (este) | no disponible | no disponible | es (LatAm) | MIT | safetensors MLX |
| ResembleAI/Chatterbox-Multilingual-es-mx-latam | no disponible | no disponible | es (LatAm) | MIT | safetensors (PyTorch) |
| Chatterbox Multilingual (base) | no disponible | no disponible | multilingüe | MIT | safetensors (PyTorch) |

La comparación relevante es con el modelo base original en PyTorch: este repositorio aporta cuantización y ejecución MLX, mientras que el original requiere PyTorch y, en la práctica, hardware CUDA o CPU. No se dispone de datos de benchmarks comparables entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma (es latinoamericano); no cubre otras lenguas ni variantes peninsulares específicas.
- La suite de regresión KL se limita a ocho ejemplos fijos; no certifica calidad perceptual ni robustez en producción.
- Riesgo de audio saturado si el runner no aplica la corrección de LeakyReLU final (pendiente 0,01 en lugar de 0,1); los pesos no incluyen esta corrección.
- Las variantes Q del paquete T3 inicial carecen de calibración de activaciones de habla; la calidad puede degradarse más que en las variantes nuevas.
- Riesgo de alucinación de prosodia, artefactos y pérdida de naturalidad en textos largos o dominios alejados del entrenamiento; no cuantificado en la información disponible.
- La clonación de voz con referencia plantea riesgos de suplantación y uso indebido; la licencia MIT no impone restricciones de uso, pero la responsabilidad ética y legal recae en el desplegador.
- Dependencia de un runner específico del autor para paridad con el vocoder V3; otros runners MLX pueden no reproducir el comportamiento esperado.
- Sin datos publicados sobre sesgos demográficos o acústicos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/Chatterbox-LatAm-MLX
- Modelo base: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam
- Tokenizador de habla: https://huggingface.co/mlx-community/S3TokenizerV2
- Runner y adaptador Talk: https://github.com/groxaxo/chatterbox-latam-mlx-private
- Informe de comparación oMLX: `omlx-all-components/evaluation/COMPARISON.md` (dentro del repositorio)
- Resultados numéricos: `omlx-all-components/evaluation/summary.json` (dentro del repositorio)
- Instrucciones de carga: `omlx-all-components/README.md` (dentro del repositorio)
