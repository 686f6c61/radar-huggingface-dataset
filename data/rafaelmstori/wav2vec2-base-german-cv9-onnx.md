# Rafaelmstori/wav2vec2-base-german-cv9-onnx

## Resumen

`Rafaelmstori/wav2vec2-base-german-cv9-onnx` es una exportación a ONNX con cuantización dinámica int8 del modelo `oliverguhr/wav2vec2-base-german-cv9`, un wav2vec2-base ajustado con pérdida CTC sobre alemán (Common Voice 9). No aporta pesos nuevos ni entrenamiento adicional: es un artefacto de inferencia pensado para ejecutar alineamiento forzado (forced alignment) a nivel de palabra dentro del navegador mediante `onnxruntime-web` en la aplicación MemorizaTudo.

El interés práctico del modelo es acotado pero muy concreto: convierte un checkpoint de reconocimiento de voz en un componente ligero, portable y ejecutable en el cliente (WASM/CPU), sin backend GPU ni llamadas de red. El repositorio ocupa 0,1 GB y la cuantización se aplica únicamente a los operadores `MatMul`/`Gemm`, de modo que la mayor parte del grafo permanece en fp32.

Conviene subrayar que el propio autor declara explícitamente que no está pensado como una versión de ASR de propósito general. Es una pieza de infraestructura para obtener marcas temporales de palabras a partir de un texto conocido y un audio de 16 kHz, con una resolución de trama de 20 ms.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (extractor convolucional de características + codificador transformer) con cabecera CTC |
| Parámetros totales | no disponible en la información proporcionada (la familia wav2vec2-base ronda los 95 M; dato no verificado en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en sentido textual: entrada de audio de longitud variable a 16 kHz, con salida de una trama cada 20 ms |
| Tipos de cuantización | int8 dinámica sobre operadores `MatMul`/`Gemm` (resto del grafo sin cuantizar) |
| Idiomas soportados | alemán (`de`) |
| Licencia | MIT (hereda la del modelo original) |
| Formato de pesos | ONNX (`input_values` float32 `[1, samples]` → `logits` float32 `[1, frames, vocab]`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec 2.0 en configuración base: un extractor de características convolucional que convierte la onda de audio en una secuencia de representaciones latentes, seguido de un codificador transformer que las contextualiza, y una cabeza de clasificación entrenada con CTC. El checkpoint original fue ajustado sobre el corpus alemán Common Voice 9 (según el nombre `cv9`), partiendo de un preentrenamiento auto-supervisado sobre audio sin etiquetar según el método descrito en el artículo de wav2vec 2.0.

Esta ficha corresponde únicamente al artefacto de conversión, no al entrenamiento: el autor no documenta el número de horas de audio, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales más allá de la CTC. El proceso aplicado es una exportación a ONNX seguida de cuantización dinámica int8 limitada a `MatMul`/`Gemm`. El vocabulario está en `vocab.json`, con `|` como separador de palabra en el índice 0 y `[PAD]` como token en blanco de CTC en el índice 32.

## Capacidades

- Alineamiento forzado CTC a nivel de palabra: dado un audio y su transcripción, produce marcas temporales de cada palabra (caso de uso principal declarado).
- Cálculo de logits CTC por trama con resolución de 20 ms, apto para derivar fronteras de palabra y, con post-proceso, de límites más finos.
- Decodificación CTC codiciosa posible a partir de `logits`, aunque el autor advierte que no es un release de ASR general.
- Ejecución en navegador mediante `onnxruntime-web` (WASM), sin dependencia de servidor ni GPU.
- Funcionamiento offline una vez cargado el grafo ONNX en el cliente.
- Entrada mono a 16 kHz con normalización requerida (media cero, varianza unitaria).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio en sentido generativo.
- Monolingüe: únicamente alemán.

## Casos de uso

- Subtitulado con marcas temporales a nivel de palabra: partiendo de una transcripción ya validada y del audio, el modelo genera los timestamps de cada palabra, lo que permite subtítulos sincronizados sin depender de un servicio de ASR en la nube.
- Funciones de lectura guiada (karaoke o read-along) en aplicaciones de aprendizaje de alemán: el alineamiento por palabra permite resaltar el término que se está pronunciando en cada instante, con una granularidad de 20 ms por trama.
- Verificación de pronunciación en herramientas de idiomas: comparando la posición temporal de las palabras reconocidas frente a las esperadas se pueden detectar omisiones, repeticiones o pausas anómalas.
- Preparación de datasets para TTS y para ajuste fino de ASR: el alineamiento forzado segmenta automáticamente audios largos en fragmentos por palabra o por frase con sus etiquetas.
- Indexación y búsqueda sobre archivos de audio ya transcritos: al disponer de tiempos por palabra se puede construir un índice que salte al segundo exacto en el que se pronuncia un término.
- Transcripción íntegra en el cliente para aplicaciones de privacidad estricta: al ejecutarse con `onnxruntime-web` sobre WASM, el audio no sale del dispositivo; válido para demos o flujos donde la latencia de red es crítica, asumiendo las limitaciones de calidad del modelo.
- Sincronización de notas o apuntes con clases grabadas: el usuario aporta el texto de sus notas y el modelo localiza en qué momento de la grabación se menciona cada concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta WER, precisión de alineamiento ni comparación de latencia frente a la versión fp32 del modelo original. Tampoco se han publicado métricas de degradación por la cuantización int8 aplicada a `MatMul`/`Gemm`.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cualquier configuración; el repositorio completo ocupa 0,1 GB.
- Cabe holgadamente en GPU de consumo (RTX 3060/4060/4090, GTX 1650 en adelante) y también en CPU.
- Ejecución en navegador vía `onnxruntime-web` con backend WASM, sin aceleración GPU dedicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), `onnxruntime-web` para el cliente, y cualquier runtime compatible con ONNX (por ejemplo OpenVINO, dado que existe un modelo wav2vec2-base en su zoo público).
- Latencia y throughput estimados: no disponibles. Como referencia estructural, la salida avanza una trama cada 20 ms de audio, pero no hay cifras publicadas de tiempo real factor (RTF) ni de coste por minuto procesado.
- Para lotes grandes de alineamiento en servidor conviene valorar la versión PyTorch original en fp32 o fp16, que evita la pérdida de precisión de los logits cuantizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Rafaelmstori/wav2vec2-base-german-cv9-onnx` (este) | no disponible (base wav2vec2) | wav2vec2 + CTC, int8 | de | MIT | ONNX | Orientado a alineamiento forzado en navegador |
| `oliverguhr/wav2vec2-base-german-cv9` | no disponible (base wav2vec2) | wav2vec2 + CTC, fp32 | de | MIT | PyTorch/safetensors | Modelo original del que deriva; referencia de precisión |
| `maxidl/wav2vec2-large-xlsr-53-german` | no disponible (large) | wav2vec2 + CTC | de | no disponible en la información | PyTorch | Alternativa de mayor tamaño ajustada sobre Common Voice alemán |
| `wav2vec2-base` (OpenVINO Model Zoo) | no disponible | wav2vec2 + CTC | en | no disponible en la información | OpenVINO IR | Referencia pública de despliegue optimizado |

No se dispone de datos de WER ni de precisión de alineamiento para ninguno de los modelos citados en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de ASR de propósito general: el autor lo indica de forma explícita. La decodificación libre puede dar resultados deficientes.
- El alineamiento forzado asume que la transcripción es correcta; si el texto no coincide con el audio, las marcas temporales pueden desplazarse o colapsar.
- Resolución temporal limitada a la trama del modelo (20 ms); no ofrece alineamiento a nivel de fonema de forma nativa.
- Solo alemán. No hay soporte multilingüe ni transferencia a otras lenguas.
- La cuantización int8 se aplica solo a `MatMul`/`Gemm`, por lo que el ahorro de tamaño es parcial y la precisión numérica de los logits puede diferir respecto al modelo fp32; no hay métricas publicadas de esa degradación.
- Requiere preprocesado estricto: audio mono a 16 kHz, normalizado a media cero y varianza unitaria. Un audio mal normalizado degrada la salida.
- El vocabulario usa `|` (índice 0) como separador de palabra y `[PAD]` (índice 32) como blanco CTC; cualquier post-proceso debe respetar esa convención.
- Sin benchmarks, sin descargas y sin validación comunitaria en el momento de la consulta (0 descargas, 0 likes): no hay evidencia externa de calidad en producción.
- Licencia MIT, que permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución a Oliver Guhr como autor del modelo original.
- Al ser un artefacto derivado, la fiabilidad depende por completo del checkpoint original; las limitaciones de sesgo y ruido de Common Voice 9 se heredan sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rafaelmstori/wav2vec2-base-german-cv9-onnx
- Modelo base original: https://huggingface.co/oliverguhr/wav2vec2-base-german-cv9
- Perfil del autor: https://huggingface.co/Rafaelmstori
- Alternativa alemana basada en XLSR-53: https://github.com/maxidl/wav2vec2
- wav2vec2-base en OpenVINO Model Zoo: https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/wav2vec2-base/README.md
- Ficha de benchmarks del modelo base (scraping de Hugging Face): https://0xsero.github.io/hf-model-benchmarks/models/oliverguhr__wav2vec2-base-german-cv9--98271e.html
