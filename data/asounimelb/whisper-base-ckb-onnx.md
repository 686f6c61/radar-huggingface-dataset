# asounimelb/whisper-base-ckb-onnx

## Resumen

`asounimelb/whisper-base-ckb-onnx` es un modelo de reconocimiento automático de voz (ASR) especializado en kurdo central (sorani, código `ckb`), desarrollado por el usuario asounimelb a partir del modelo multilingüe `openai/whisper-base` de OpenAI. El modelo conserva la arquitectura original de Whisper (transformer encoder-decoder con 74 millones de parámetros) y ha sido ajustado con aproximadamente 2 horas y 18 minutos de voz leída en kurdo central, para después exportarse a formato ONNX y poder ejecutarse con Transformers.js en navegador o Node.js, así como con ONNX Runtime.

Su relevancia radica en dos factores concretos. Por un lado, cubre un idioma con muy poca representación en sistemas ASR comerciales: el kurdo central o sorani, escrito en alfabeto árabe kurdo. Por otro, su empaquetado en ONNX con cuantización int8 y 4 bits permite inferencia local y en el navegador sin depender de servidores, con pesos que ocupan entre 79 MB y 140 MB por componente, lo que lo hace apto para aplicaciones web y de borde con recursos limitados.

El autor advierte de una peculiaridad técnica importante: Whisper no dispone de un token de idioma para kurdo central, por lo que el ajuste se realizó utilizando el token `<|en|>` como marcador. Esto obliga a decodificar siempre con `language: "en"` y `task: "transcribe"`; cualquier otra configuración de idioma produce resultados deficientes. El modelo se distribuye bajo licencia Apache 2.0 y forma parte de una familia de tres tamaños (tiny, base y small) entrenados con los mismos datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 74 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de 30 segundos de audio (con `chunk_length_s=30` y `stride_length_s=5` para audio más largo) |
| Tipos de cuantización | fp32 en el encoder; int8 (`q8`) y 4 bits (`q4`) en el decoder |
| Idiomas soportados | Kurdo central / sorani (`ckb`), en alfabeto árabe kurdo; la decodificación se fuerza con el token `<|en|>` |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Modelo base | openai/whisper-base |
| Pipeline | automatic-speech-recognition |
| Librería | transformers.js |
| Tamaño del repositorio | 0,3 GB |

Desglose de ficheros publicados:

| Fichero | Precisión | Tamaño |
|---|---|---|
| `onnx/encoder_model.onnx` | fp32 | 82 MB |
| `onnx/decoder_model_merged_quantized.onnx` | int8 (`q8`) | 79 MB |
| `onnx/decoder_model_merged_q4.onnx` | 4 bits (`q4`) | 140 MB |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-base`, un transformer encoder-decoder con 74 millones de parámetros entrenado por OpenAI para ASR multilingüe. El preprocesado de audio es el estándar de Whisper: entrada mono a 16 kHz convertida en espectrogramas log-Mel de 80 bins. El decoder exportado es un "merged decoder", es decir, un único grafo ONNX que contiene tanto la variante con caché KV como la variante sin ella, lo que simplifica su uso en Transformers.js.

El ajuste fino se realizó sobre un corpus propio de aproximadamente 2 horas y 18 minutos, compuesto por 1.653 enunciados de voz leída. Los datos provienen de dos fuentes: la lectura completa del libro *Mesele-y Wijdan* de Ahmad Mukhtar Jaff (1896-1935), que aporta unos 49 minutos de audio, y diversos textos de sitios web kurdos sobre noticias, deporte y temas generales. Todas las transcripciones fueron revisadas manualmente contra las grabaciones. El reparto de datos fue aleatorio 90/10 para entrenamiento y prueba (semilla 42), con una sola época, tamaño de lote 2, optimizador AdamW y tasa de aprendizaje 1e-5. Los tokens de control empleados fueron `<|en|>`, `<|transcribe|>` y `<|notimestamps|>`. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, ni innovaciones arquitectónicas más allá de la exportación a ONNX y la fusión del decoder.

## Capacidades

- Reconocimiento automático de voz en kurdo central (sorani) sobre voz leída, con salida en alfabeto árabe kurdo.
- Transcripción de audio de hasta 30 segundos por ventana; para audios más largos se aplica fragmentación con solapamiento (`chunk_length_s: 30`, `stride_length_s: 5`).
- Ejecución en navegador y en Node.js mediante Transformers.js, aceptando tanto una URL de audio como un `Float32Array` de audio mono a 16 kHz.
- Ejecución con ONNX Runtime fuera del ecosistema JavaScript.
- Selección de precisión en tiempo de carga (fp32, `q8` o `q4`) según el equilibrio deseado entre tamaño y exactitud.
- Generación de puntuación y formato heredados del texto editado de origen.
- No dispone de tool calling ni de function calling.
- No soporta flujos de agentes, razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades de visión, audio más allá del ASR ni traducción documentada.
- Monolingüe en la práctica: no se ha validado su comportamiento en otros idiomas.

## Casos de uso

- Transcripción de audio en kurdo central íntegramente en el navegador: una aplicación web puede cargar el modelo con Transformers.js y transcribir ficheros de audio locales sin enviar datos a un servidor, lo que resulta adecuado para contenido sensible y evita costes de infraestructura.
- Digitalización y archivado de patrimonio oral kurdo: grabaciones de lectura literaria o histórica pueden transcribirse por lotes con ONNX Runtime para generar corpus de texto buscables, aprovechando que el modelo fue entrenado precisamente con voz leída.
- Subtitulado de vídeo en sorani: integrado en una herramienta de edición, el modelo genera transcripciones que después se alinean temporalmente para producir subtítulos, con la advertencia de que la puntuación puede no coincidir con las pausas reales del hablante.
- Aplicaciones de dictado para hablantes de sorani: dado su tamaño reducido (82 MB de encoder), puede embeberse en aplicaciones de escritorio o extensiones de navegador que ofrezcan dictado sin conexión.
- Investigación lingüística y creación de corpus: la salida en alfabeto árabe kurdo permite construir corpus anotados y estudiar variantes ortográficas, teniendo en cuenta que muchas discrepancias detectadas son de espaciado entre palabras.
- Evaluación comparativa de recursos en entornos con restricciones: al existir versiones tiny (39 M) y small (244 M) entrenadas igual, permite medir el compromiso entre tamaño de modelo, latencia y exactitud en un mismo dominio lingüístico.
- Prototipos de accesibilidad: transcripción en vivo o diferida de charlas y eventos en kurdo central en dispositivos sin GPU dedicada, dado que el modelo puede ejecutarse en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no existe una evaluación formal sobre un conjunto de prueba independiente y que el modelo debe evaluarse con datos propios antes de usarlo en producción. Tampoco se proporcionan métricas de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: según los tamaños publicados de los ficheros, el encoder fp32 ocupa 82 MB y el decoder `q8` 79 MB, lo que suma aproximadamente 161 MB de pesos; con el decoder `q4` (140 MB) el total ronda los 222 MB. Hay que añadir el consumo del runtime y de las activaciones, pero en cualquier caso el modelo es de escala muy reducida.
- GPU recomendadas: no requiere GPU de gama alta. Funciona en cualquier GPU consumer moderna e incluso en GPU integradas. No necesita A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU actuales con suficiente memoria (incluso por debajo de 2 GB de VRAM) y también en CPU.
- Opciones de despliegue: Transformers.js (navegador con WebGPU o WebAssembly, y Node.js) y ONNX Runtime. Al distribuirse únicamente en ONNX, no se ofrece soporte directo para vLLM, TGI, llama.cpp u Ollama, que requerirían convertir los pesos a otro formato.
- Latencia y throughput estimados: no disponible. No se publican mediciones de velocidad.
- Observación práctica: la model card recomienda `q8` para mayor exactitud y `q4` para una descarga más pequeña, pero según los tamaños de fichero publicados el decoder `q8` (79 MB) es en realidad más pequeño que el `q4` (140 MB), lo que contradice esa recomendación.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma objetivo | Formato | Licencia | Enlace |
|---|---|---|---|---|---|
| whisper-base-ckb-onnx (este modelo) | 74 M | Kurdo central (sorani) | ONNX | Apache 2.0 | [HF](https://huggingface.co/asounimelb/whisper-base-ckb-onnx) |
| whisper-tiny-ckb-onnx | 39 M | Kurdo central (sorani) | ONNX | no disponible en la información | [HF](https://huggingface.co/asounimelb/whisper-tiny-ckb-onnx) |
| whisper-small-ckb-onnx | 244 M | Kurdo central (sorani) | ONNX | no disponible en la información | [HF](https://huggingface.co/asounimelb/whisper-small-ckb-onnx) |
| openai/whisper-base | 74 M | Multilingüe (sin kurdo central) | safetensors / PyTorch | Apache 2.0 | [HF](https://huggingface.co/openai/whisper-base) |

Los tres modelos de la familia ckb fueron ajustados con los mismos datos y el mismo procedimiento, por lo que la diferencia principal es el tamaño y, en consecuencia, el equilibrio entre exactitud y coste computacional. No se dispone de datos comparativos de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Corpus de un único hablante: los datos de entrenamiento provienen de un solo locutor masculino nativo (Aso Mahmudi) con acento de Mariwan, grabados en estudio doméstico con micrófono de condensador USB. Se espera una precisión notablemente inferior con otras voces, acentos y dialectos (Sulaimani, Erbil, Kirkuk).
- Dominio limitado a voz leída: el modelo no ha sido entrenado con habla espontánea o conversacional, ni con audio ruidoso o de calidad telefónica.
- Puntuación heredada del texto editado: puede insertar signos de puntuación que el hablante no marcó de forma clara.
- Errores de espaciado: buena parte de los errores restantes son variantes de separación entre palabras (por ejemplo `بە کار` frente a `بەکار`), una ambigüedad habitual en la ortografía kurda.
- Ausencia de benchmark formal: no hay evaluación sobre un conjunto de prueba independiente, por lo que se recomienda validar con datos propios antes de cualquier uso en producción.
- Alucinaciones: se aplican las advertencias habituales de Whisper, incluida la posibilidad de generar texto inventado ante silencios o audio no vocal.
- Configuración de decodificación obligatoria: hay que usar `language: "en"` y `task: "transcribe"` porque el modelo se entrenó con el token `<|en|>` como marcador; otras configuraciones degradan seriamente el resultado.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento derivados de fuentes web y del libro utilizado.
- Adopción nula y sin validación externa: el repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia de uso en producción ni revisión por parte de la comunidad.
- Inconsistencia documental: la model card describe `q4` como la opción de descarga más pequeña, mientras que los tamaños publicados indican lo contrario (`q8` = 79 MB frente a `q4` = 140 MB).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asounimelb/whisper-base-ckb-onnx
- Modelo base: https://huggingface.co/openai/whisper-base
- Versión tiny de la familia ckb: https://huggingface.co/asounimelb/whisper-tiny-ckb-onnx
- Versión small de la familia ckb: https://huggingface.co/asounimelb/whisper-small-ckb-onnx
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
