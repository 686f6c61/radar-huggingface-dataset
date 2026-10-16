# Sanghyang00/ELARSpeech-OmniASR-1B-inp

## Resumen

ELARSpeech-OmniASR-1B-inp es un modelo de reconocimiento automático del habla (ASR) especializado en iñapari (ISO 639-3: `inp`), una lengua arahuaca hablada en la Amazonía peruana y en grave peligro de desaparición. Lo publica el usuario de HuggingFace Sanghyang00 como parte del proyecto ELARSpeech, y se distribuye como un fine-tuning del checkpoint `aadel4/omniASR-CTC-1B-v2`.

Técnicamente es un `Wav2Vec2ForCTC` de aproximadamente 975,7 millones de parámetros (0,98 B), con encoder convolucional seguido de un transformer y decodificación CTC. El modelo trabaja sobre audio mono a 16 kHz y produce directamente la transcripción como secuencia de tokens, sin decoder autoregresivo.

Su relevancia actual es doble: por un lado, aporta cobertura ASR a una lengua de muy bajos recursos que apenas tiene presencia en sistemas comerciales; por otro, sirve como ejemplo reproducible de cómo adaptar un checkpoint ASR multilingüe de ~1 B a una única lengua mediante fine-tuning, con verificación de transcripción exacta declarada como PASS. La ficha se basa exclusivamente en la model card y los metadatos del repositorio; no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (extractor convolucional de features + encoder transformer, cabeza de clasificacion con perdida CTC) |
| Parametros totales | 975.681.460 (~0,98 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (admite audio de longitud variable; el limite practico lo marca la memoria de activaciones, no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (repositorio con pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | Iñapari (ISO 639-3: `inp`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la topología estandar de `Wav2Vec2ForCTC`: un extractor convolucional que convierte la onda de audio en una secuencia de representaciones latentes, un encoder compuesto por capas transformer con atención y una cabeza lineal proyectada sobre el vocabulario de tokens CTC. La inferencia típica es `argmax` sobre los logits seguida de decodificación CTC (colapso de repeticiones y token en blanco), tal como aparece en el ejemplo de uso de la model card.

El checkpoint deriva del modelo base `aadel4/omniASR-CTC-1B-v2` mediante fine-tuning sobre datos de iñapari del proyecto ELARSpeech. No se detallan en la información disponible el número de tokens de audio utilizados, la composición del dataset, la estrategia de alineación CTC ni si hubo etapas adicionales de ajuste (por ejemplo, decodificación con LM externo). La model card sí indica que el artefacto exportado se contrasta contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación y que la verificación de transcripción exacta es PASS, lo que sugiere un flujo de conversión/exportación con control de calidad, pero no un entrenamiento desde cero.

## Capacidades

- Reconocimiento automático del habla monolingüe en iñapari (`inp`), a partir de audio mono remuestreado a 16 kHz.
- Salida directa de transcripción mediante decodificación CTC sobre los logits del modelo.
- Procesamiento de audio de longitud variable gracias al front-end convolucional.
- Integración nativa con la librería `transformers` (`AutoProcessor` y `Wav2Vec2ForCTC`).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingüe adicional fuera del iñapari.
- No se documentan modos especiales (thinking mode, visión, audio generativo, diarización ni puntuación automática).

## Casos de uso

- Documentación y revitalización lingüística: transcribir entrevistas y grabaciones con hablantes nativos de iñapari para producir corpus escritos que alimenten diccionarios, gramáticas y materiales didácticos. El modelo evita depender de ASR comerciales que no cubren esta lengua.
- Trabajo de campo en lingüística: los investigadores pueden grabar sesiones en bruto a 16 kHz y obtener transcripciones preliminares sobre las que aplicar corrección manual, reduciendo drásticamente el tiempo de anotación frente a la transcripción íntegramente manual.
- Archivado y preservación digital: convertir colecciones de audio histórico o etnográfico en texto indexable y buscable, facilitando la conservación de patrimonio oral en peligro de desaparición.
- Subtitulado de material audiovisual: generar subtítulos en iñapari para vídeos, documentales o materiales educativos, con edición posterior de la salida CTC.
- Herramientas de aprendizaje de la lengua: aplicaciones de práctica de pronunciación o de dictado que comparen la transcripción del alumno con una referencia, usando el modelo como motor de reconocimiento.
- Investigación en lingüística computacional de bajos recursos: servir de punto de partida reproducible para experimentar con decodificación CTC, interpolación con modelos de lenguaje n-gram y comparación de arquitecturas ASR en lenguas con pocos hablantes.
- Pipelines de anotación asistida: integrar el modelo en colas de procesamiento por lotes que transcriban horas de audio de campo y devuelvan texto preliminar para revisión humana, aprovechando su tamaño (~1 B) para ejecutarse en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente declara que la verificación de transcripción exacta del artefacto exportado frente al checkpoint original de ELARSpeech tiene estado PASS, sin cifras de WER, CER ni comparación numérica con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB en FP32, unos 2,0 GB en FP16/BF16 y en torno a 1 GB en int8, a lo que hay que sumar el buffer de activaciones y el audio procesado (estimaciones derivadas del recuento de 975,7 M de parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede alojar el modelo en FP16; A100, H100, L40S o RTX 4090 ofrecen margen amplio y permiten lotes grandes de audio.
- Cabida en GPU de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, e incluso en modelos de 8 GB si se usa FP16 con lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch es la ruta documentada en la model card; también son viables exportaciones a ONNX Runtime o TorchScript para servir el modelo. vLLM, TGI, llama.cpp y Ollama no están orientados a modelos CTC tipo wav2vec2 y no se documentan como soportados.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo real factor (RTF), latencia por segundo de audio ni throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sanghyang00/ELARSpeech-OmniASR-1B-inp | ~0,98 B | longitud variable (no especificada) | Iñapari (`inp`) | no disponible | HuggingFace, transformers |
| aadel4/omniASR-CTC-1B-v2 | ~1 B (dato no confirmado en la informacion disponible) | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| OpenAI Whisper large-v3 | ~1,55 B | ventana de 30 s por segmento | ~99 idiomas, sin iñapari | MIT | HuggingFace, OpenAI |

Whisper large-v3 es el referente generalista de ASR open source, pero no incluye iñapari entre sus lenguas soportadas, por lo que no es un sustituto directo para esta tarea. Los datos de rendimiento comparado (WER/CER) no están disponibles en la información proporcionada para ninguno de los tres modelos en el dominio del iñapari.

## Limitaciones y advertencias

- Modelo monolingüe: solo cubre iñapari; no se debe esperar calidad en otras lenguas.
- La precisión depende de las condiciones de grabación, del hablante, de la ortografía empleada y del dominio, tal como advierte la propia model card.
- Requiere audio mono remuestreado a 16 kHz; entradas con otra frecuencia de muestreo o con múltiples canales pueden degradar la transcripción.
- Riesgo de alucinación y de errores de segmentación propios de la decodificación CTC sin modelo de lenguaje externo; no se documenta el uso de LM de rescoring.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; para producción es imprescindible aclarar los términos con el autor y revisar la licencia del modelo base `aadel4/omniASR-CTC-1B-v2` y las condiciones del dataset de ELARSpeech.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa ni adopción por parte de la comunidad.
- Al tratarse de una lengua con muy pocos hablantes, cualquier corpus de entrenamiento es necesariamente pequeño y poco diverso, lo que aumenta el riesgo de sesgo hacia los hablantes y las variedades representadas.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita las opciones de despliegue en entornos con restricciones de memoria.
- Ausencia total de benchmarks publicados: la evaluación se reduce a una verificación de paridad con el checkpoint original, no a una medición de calidad ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-inp
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
