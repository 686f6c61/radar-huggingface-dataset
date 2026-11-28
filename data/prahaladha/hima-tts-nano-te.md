# Prahaladha/hima-tts-nano-te

## Resumen

hima-tts-nano-te es un modelo de síntesis de voz (text-to-speech) especializado en telugu, desarrollado por el usuario Prahaladha. Con 61.854.849 parámetros (aproximadamente 62M), se posiciona como una alternativa ultraligera para generar audio en telugu a partir de texto, con soporte secundario de palabras en inglés dentro de las frases. Su propuesta principal es la eficiencia: según la model card, funciona en la CPU de un portátil a velocidad superior al tiempo real (6x en PyTorch, 11x en ONNX y hasta 29x en MLX sobre Apple silicon).

El modelo resuelve un problema concreto: la síntesis de voz en telugu de calidad aceptable sin necesidad de GPU ni de infraestructura pesada. Incluye seis voces integradas (tres femeninas y tres masculinas), clonación de voz a partir de 5-10 segundos de audio, generación de voces aleatorias y guardado de voces para reutilizarlas. Está publicado con licencia "other" (no estándar), lo que exige revisar los términos antes de un uso comercial.

La relevancia actual del modelo radica en su tamaño reducido y sus conversiones optimizadas (ONNX, MLX fp16 y MLX 8-bit) publicadas en repos separados, que permiten despliegues locales en Windows, Linux y macOS. El repositorio principal ocupa 0,8 GB y los pesos están en formato safetensors, con un codec separado para convertir la salida del modelo en audio a 24 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con codec de audio separado; detalles de la arquitectura no especificados en la model card) |
| Parametros totales | 61.854.849 (aproximadamente 62M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (version ONNX), 8-bit (version MLX), fp16 (version MLX); el repo principal usa safetensors en precision nativa |
| Idiomas soportados | telugu (te) e ingles (en, palabras y frases insertadas en texto telugu) |
| Licencia | other (licencia no estandar; revisar terminos del autor) |
| Formato de pesos | safetensors (modelo base, adaptador de voces y codec); tokenizer en formato SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo más allá de indicar que se trata de un sistema TTS con un modelo base (`model.safetensors`) y un codec independiente (`codec.safetensors`) que transforma la salida del modelo en audio a 24 kHz. El sistema de voces se implementa mediante un adaptador opcional (`voices/adapter.safetensors`) más un fichero de ajustes por voz (`voices/voices.safetensors` y `voices/voices.json`), de modo que el modelo base permanece inmutable y las voces se pueden activar o desactivar con `use_voices=False`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card menciona que los números, fechas y cantidades se convierten a palabras antes de la lectura, y que el texto largo se divide por frases para su síntesis secuencial. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; la optimización declarada se centra en las conversiones a ONNX y MLX para acelerar la inferencia.

## Capacidades

- Síntesis de voz en telugu a partir de texto escrito en escritura telugu, con palabras en inglés intercaladas en alfabeto latino tal como se escriben habitualmente.
- Normalización de números, fechas y cantidades (por ejemplo, `₹2,500` o `15/08/2026`) a palabras antes de la lectura.
- Procesamiento de texto largo: se divide en frases y se sintetiza una a una.
- Seis voces integradas: Bhavana, Lakshmi y Sravani (femeninas); Srinivas, Karthik y Pranay (masculinos).
- Clonación de voz a partir de 5-10 segundos de audio claro (`voice="my_voice.wav"`), con dependencia opcional de `speechbrain`.
- Generación de voces aleatorias (sin especificar `voice`) y control por semilla (`seed=`) para obtener tomas reproducibles.
- Guardado y reutilización de voces en formato safetensors (`--save-voice`), compatible entre el repo principal y las versiones ONNX/MLX.
- Salida de audio como array NumPy a 24 kHz, guardable en WAV.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en telugu para aplicaciones de accesibilidad: el modelo convierte artículos, noticias o documentos largos en audio a 24 kHz, dividiendo el texto por frases, lo que lo hace adecuado para lectores de pantalla y audiolibros en telugu sin infraestructura GPU.
- Generación de avisos y mensajes de voz automatizados: con 6x de velocidad en CPU, un servidor modesto puede sintetizar mensajes de atención al cliente o notificaciones en telugu en tiempo real, usando las seis voces integradas para distintos contextos.
- Doblaje y locución de bajo coste: la clonación de voz a partir de 5-10 segundos permite generar locuciones con la voz de un hablante concreto, útil para vídeos, pódcast o material formativo en telugu.
- Integración en asistentes conversacionales locales: al ejecutarse en CPU y en formatos ONNX/MLX, puede incorporarse a asistentes de escritorio o dispositivos sin GPU que respondan en telugu.
- Prototipado rápido de productos de voz: el tamaño de 62M parámetros y el repo de 0,8 GB permiten descargar y probar el modelo en un portátil en minutos, con la opción de guardar una voz y reutilizarla en las versiones ONNX y MLX.
- Generación por lotes de audio para entornos macOS: la versión MLX fp16 alcanza 70x de velocidad en tiempo real procesando muchos textos a la vez, adecuada para producir grandes volúmenes de audio en Apple silicon.
- Pruebas de calidad de ASR y datasets de voz: la model card reporta una evaluación con 1.202 frases en telugu leídas por dos reconocedores de voz, lo que sugiere su uso para generar datos sintéticos de entrenamiento o evaluación de sistemas de reconocimiento.

## Benchmarks y rendimiento

La model card reporta una evaluación de inteligibilidad sobre 1.202 frases en telugu, cada una transcrita por dos reconocedores de voz (Sarvam saaras v4 y Hima ASR). La métrica es el porcentaje de letras incorrectas (menor es mejor):

| Letras incorrectas (menor es mejor) | Sarvam saaras v4 | Hima ASR |
|---|---|---|
| Este modelo | 4,2% | 5,2% |
| ONNX `int8` | 4,3% | 5,0% |

Además, la model card declara velocidades de inferencia medidas en un Apple M4 Pro:

| Version | Plataforma | Velocidad |
|---|---|---|
| Repo principal (PyTorch) | CPU o GPU | 6x tiempo real en CPU |
| hima-tts-nano-te-ONNX | Cualquier CPU (Windows, Linux, Mac) | 11x tiempo real; 15x con `int8` |
| hima-tts-nano-te-mlx-fp16 | GPU de Mac (Apple silicon) | 29x tiempo real; 70x con muchos textos a la vez |
| hima-tts-nano-te-mlx-8bit | GPU de Mac, descarga menor | 50x con muchos textos a la vez |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable en un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 62M parámetros en safetensors, el modelo base y el codec ocupan una fracción de los 0,8 GB del repo, por lo que la inferencia en CPU es viable sin GPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Las versiones MLX requieren GPU de Apple silicon (procesadores M-series).
- Cabe en GPU de consumo: sí, por tamaño (62M parámetros), aunque la model card no detalla requisitos de VRAM ni modelos concretos de GPU.
- Opciones de despliegue: PyTorch (repo principal), ONNX Runtime (repo ONNX, con variante int8) y MLX (repos fp16 y 8-bit). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6x tiempo real en CPU con PyTorch, 11x en ONNX (15x con int8), 29x en MLX fp16 (70x con procesamiento por lotes) y 50x en MLX 8-bit con lotes, medidas en Apple M4 Pro.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos TTS en parámetros, contexto o licencia. El único punto de comparación documentado es el reconocedor Sarvam saaras v4, usado como evaluador de inteligibilidad, no como modelo TTS comparable. Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hima-tts-nano-te | 61.854.849 | no disponible | 4,2% / 5,2% letras incorrectas (Sarvam saaras v4 / Hima ASR) | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo entrenado para telugu, la calidad fuera de ese idioma no está garantizada.
- Riesgo de alucinación: en TTS se traduce en errores de pronunciación o lectura incorrecta; la evaluación reporta un 4,2-5,2% de letras incorrectas, por lo que persisten errores de inteligibilidad.
- Limitaciones de idioma: el modelo está orientado al telugu; el inglés solo se soporta como palabras o frases insertadas en texto telugu, no como idioma principal.
- Limitaciones de contexto: la longitud máxima de texto no está documentada; el texto largo se procesa por frases, lo que puede afectar a la prosodia entre frases.
- La clonación de voz requiere 5-10 segundos de audio claro y la dependencia opcional `speechbrain`; la calidad de la clonación no está cuantificada.
- Restricciones de licencia: la licencia es "other", no estándar; es imprescindible revisar los términos del autor antes de cualquier uso comercial.
- Las cifras de velocidad se midieron en un Apple M4 Pro y pueden no reproducirse en otro hardware.
- El modelo tiene 188 descargas y 11 "likes" en el momento de la consulta, lo que indica una adopción todavía limitada y poca validación externa.
- No se documentan mecanismos de seguridad, filtrado de contenido ni mitigaciones de uso indebido de la clonación de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prahaladha/hima-tts-nano-te
- Version ONNX: https://huggingface.co/Prahaladha/hima-tts-nano-te-ONNX
- Version MLX fp16: https://huggingface.co/Prahaladha/hima-tts-nano-te-mlx-fp16
- Version MLX 8-bit: https://huggingface.co/Prahaladha/hima-tts-nano-te-mlx-8bit
