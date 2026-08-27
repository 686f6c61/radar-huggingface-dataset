# linkstar612/polyvox-models

## Resumen

Polyvox-models es un repositorio espejo en HuggingFace que aloja los pesos de los modelos utilizados por la aplicación Polyvox, un asistente de voz multi-usuario en tiempo real que separa, comprende y responde a varios hablantes simultáneamente, incluso en entornos ruidosos. El repositorio contiene exportaciones ONNX en INT8 de cuatro componentes: un modelo de traducción automática (M2M-100 de Meta), un identificador de idioma (FireRedLID), un reconocedor de voz (FireRedASR2-AED) y un detector de actividad de voz (FireRedVAD). El objetivo principal es facilitar la descarga de estos pesos a usuarios en China continental, donde el acceso a los releases de GitHub es poco fiable.

El repositorio fue creado por el usuario linkstar612 en agosto de 2026 y tiene un tamaño de 4,7 GB. Todos los archivos son exportaciones ONNX cuantizadas a INT8, producidas internamente a partir de checkpoints originales que permiten la redistribución. La licencia del repositorio es Apache-2.0, aunque los modelos subyacentes tienen licencias MIT (M2M-100) y Apache-2.0 (FireRed). El pipeline declarado es traducción, pero el conjunto cubre también reconocimiento de voz, identificación de idioma y detección de actividad de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos ONNX INT8: M2M-100 (encoder-decoder transformer), FireRedLID (encoder-decoder), FireRedASR2-AED (encoder-decoder), FireRedVAD (red neuronal) |
| Parametros totales | No disponible (M2M-100 tiene 1.2B parámetros en su versión original; los demás no se especifican) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (cuantización dinámica de las capas MatMul) |
| Idiomas soportados | zh, en, ja (según los tags de HuggingFace; M2M-100 original soporta más de 100 idiomas, pero el repo se centra en estos tres) |
| Licencia | Apache-2.0 (repositorio); MIT para M2M-100, Apache-2.0 para FireRed (modelos originales) |
| Formato de pesos | ONNX (archivos .onnx) con sidecars JSON para vocabulario y estadísticas CMVN |

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados desde cero, sino exportaciones ONNX de checkpoints existentes. Los archivos se generaron a partir de los siguientes modelos originales:

- **M2M-100 1.2B** (Meta AI): modelo de traducción automática multilingüe basado en transformer encoder-decoder. Se exportó a ONNX, se dividió en encoder y decoder, y se aplicó cuantización dinámica INT8 a las capas MatMul.
- **FireRedLID** (FireRedTeam): modelo de identificación de idioma, exportado a ONNX y cuantizado a INT8. Incluye un sidecar JSON con vocabulario y estadísticas CMVN.
- **FireRedASR2-AED** (FireRedTeam): modelo de reconocimiento de voz automático (ASR) con arquitectura encoder-decoder, exportado y cuantizado de forma similar.
- **FireRedVAD** (FireRedTeam): detector de actividad de voz, re-exportado con opset 17 y con las estadísticas CMVN compiladas directamente en el grafo.

No se proporcionan detalles sobre el entrenamiento original de estos modelos (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La cuantización INT8 es la única modificación técnica documentada, y se aplicó para reducir el tamaño y acelerar la inferencia en tiempo real.

## Capacidades

- **Traducción automática**: el modelo M2M-100 permite traducir entre múltiples idiomas, aunque el repositorio declara soporte para chino, inglés y japonés.
- **Identificación de idioma**: FireRedLID detecta qué idioma se está hablando en un segmento de audio.
- **Reconocimiento de voz**: FireRedASR2-AED transcribe audio a texto, con soporte para entornos ruidosos.
- **Detección de actividad de voz**: FireRedVAD determina cuándo hay voz presente en una señal de audio, útil para segmentar conversaciones.
- **Procesamiento en tiempo real**: al ser exportaciones ONNX INT8, los modelos están optimizados para inferencia de baja latencia, adecuada para aplicaciones de voz en vivo.
- **Integración en aplicaciones**: los archivos están organizados con rutas relativas que coinciden con las que la aplicación Polyvox espera, lo que facilita su uso directo.

## Casos de uso

- **Asistente de voz multi-usuario en tiempo real**: Polyvox separa y comprende a varios hablantes simultáneamente. El modelo FireRedASR2-AED transcribe cada voz, FireRedLID identifica el idioma de cada hablante y M2M-100 traduce si es necesario, todo en un flujo continuo.
- **Traducción simultánea en reuniones**: en una videollamada con participantes de distintos idiomas, M2M-100 puede traducir las transcripciones en tiempo real, permitiendo comunicación fluida sin barreras lingüísticas.
- **Sistemas de subtitulación automática**: FireRedASR2-AED genera subtítulos a partir de audio, y FireRedVAD ayuda a segmentar los turnos de habla para sincronizar los subtítulos con precisión.
- **Atención al cliente multilingüe**: un bot de voz puede detectar el idioma del cliente con FireRedLID, transcribir su consulta con FireRedASR2-AED y responder en su idioma usando M2M-100 para traducir las respuestas generadas.
- **Análisis de conversaciones en entornos ruidosos**: gracias a la robustez del modelo ASR, se puede transcribir reuniones en oficinas abiertas, conferencias o espacios públicos con alta interferencia acústica.
- **Despliegue en China continental**: al estar alojado en HuggingFace, el repositorio permite a desarrolladores chinos descargar los pesos sin depender de GitHub, lo que facilita la integración de Polyvox en aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (como WER para ASR, BLEU para traducción o accuracy para LID) ni comparaciones con otros modelos. La cuantización INT8 puede degradar ligeramente la precisión respecto a los modelos originales en FP32, pero no se documenta el impacto cuantitativo.

## Requisitos de hardware

- **VRAM estimada**: no hay datos oficiales. Basándose en el tamaño de los archivos ONNX (el encoder de FireRedLID y FireRedASR ocupan 1,2 GB cada uno, el decoder de M2M-100 835 MB), se estima que la inferencia de cada modelo individual requiere entre 1 y 3 GB de VRAM en INT8, dependiendo de la longitud de la secuencia y el batch.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar los modelos por separado. Para ejecutar todos los componentes simultáneamente (como hace Polyvox), se recomienda una GPU de gama media-alta, por ejemplo RTX 3060 o superior.
- **Compatibilidad con GPUs de consumo**: sí, los modelos ONNX INT8 están diseñados para funcionar en GPUs de consumo. Una RTX 4090 o incluso una RTX 3060 pueden manejar la carga en tiempo real.
- **Opciones de despliegue**: al ser ONNX, se pueden ejecutar con ONNX Runtime, que soporta aceleración por GPU (CUDA, DirectML) y CPU. También se puede integrar en aplicaciones C++, Python o C#. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que esos frameworks están orientados a modelos de lenguaje generativos, no a modelos de audio.
- **Latencia y throughput**: no se proporcionan datos. La cuantización INT8 y la división encoder/decoder sugieren una optimización para baja latencia, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con alternativas. Sin embargo, se pueden mencionar modelos comparables en funcionalidad:

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Polyvox-models (este repo) | ASR + LID + VAD + traducción | zh, en, ja | Apache-2.0 / MIT | ONNX INT8 en HuggingFace |
| Whisper (OpenAI) | ASR + traducción | 99 idiomas | MIT | PyTorch, ONNX, etc. |
| NLLB-200 (Meta) | Traducción | 200 idiomas | CC-BY-NC-4.0 | PyTorch, ONNX (no incluido en este repo por licencia) |
| FireRedASR (original) | ASR | zh, en | Apache-2.0 | PyTorch, Kaldi |

La principal diferencia es que Polyvox-models agrupa varios componentes en un solo repositorio con formato ONNX listo para producción, mientras que las alternativas suelen requerir conversión o integración adicional. NLLB-200 no está incluido por su licencia no comercial.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos, pero los modelos originales (M2M-100, FireRed) pueden reflejar sesgos presentes en sus datos de entrenamiento, especialmente en cuanto a variedades dialectales o acentos.
- **Riesgo de alucinación**: en tareas de traducción y ASR, los modelos pueden generar transcripciones o traducciones incorrectas, especialmente con audio de baja calidad o habla superpuesta.
- **Limitaciones de contexto**: la longitud de contexto no está especificada. Los modelos de audio suelen trabajar con ventanas de unos pocos segundos, lo que puede limitar la coherencia en conversaciones largas.
- **Restricciones de licencia**: aunque el repositorio es Apache-2.0, los modelos subyacentes tienen licencias MIT (M2M-100) y Apache-2.0 (FireRed). NLLB-200 y Sortformer no están incluidos por restricciones de licencia; los usuarios deben descargarlos por separado si los necesitan.
- **Cuantización INT8**: la conversión a INT8 puede reducir la precisión respecto a los pesos originales en FP32. No se proporcionan métricas de degradación.
- **Dependencia de sidecars**: los archivos JSON de vocabulario y CMVN son imprescindibles para que los grafos ONNX funcionen; si se pierden, los modelos quedan inutilizables.
- **Uso en producción**: el repositorio es un mirror de distribución, no un modelo independiente. Está pensado para ser usado dentro de la aplicación Polyvox, no como una biblioteca genérica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/linkstar612/polyvox-models
- Repositorio GitHub de distribución: https://github.com/linkstar612/polyvox-releases
- Repositorio GitHub de Polyvox (código fuente): https://github.com/da24s002/polyvox
- Modelo original M2M-100: https://huggingface.co/facebook/m2m100_1.2B
- Modelos originales FireRedTeam: https://huggingface.co/FireRedTeam
