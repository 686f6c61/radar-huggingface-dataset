# andersbekkevard/voice-keys-navigation-coreml-v1

## Resumen

Voice Keys Navigation Core ML v1 es un modelo de reconocimiento de voz especializado que identifica 57 nombres de teclas habladas (letras, dígitos, flechas, modificadores y algunas teclas con nombre) en un flujo de audio de 16 kHz. Lo desarrolla andersbekkevard como componente del motor de navegación por voz de la aplicación Voice Keys para macOS, y deriva del encoder NVIDIA Nemotron Speech Streaming English 0.6B con un adaptador single-speaker fusionado en las proyecciones de atención, más una cabeza CTC causal. La conversión a Core ML ML Program en float16 permite ejecutar el modelo en un Mac sin Python, integrándolo en una app nativa Swift.

El modelo no es un reconocedor de voz general ni un producto de accesibilidad validado: está entrenado sobre la voz de un único hablante y su precisión con otras voces no se ha medido. Su relevancia es doble: por un lado, demuestra un flujo completo de conversión de un encoder de streaming de NVIDIA a Core ML manteniendo equivalencia funcional con la referencia Python; por otro, documenta con transparencia sus límites (falsos positivos en habla ordinaria, dependencia del hablante) y las obligaciones de la NVIDIA Open Model License al redistribuir un modelo derivado.

El repositorio ocupa 1,2 GB y contiene el paquete `.mlpackage` de 1,185 GB, el banco de filtros mel, el JSON de etiquetas y constantes, un manifiesto con hashes SHA-256 y los ficheros de licencia y atribución. Requiere macOS 15 para el modelo; la app Voice Keys exige macOS 26 sobre Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de streaming (Nemotron Speech Streaming) con cabeza CTC causal, convertido a Core ML ML Program |
| Parametros totales | 0,6 mil millones (modelo base Nemotron Speech Streaming English 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por chunks de 160 ms; el primer chunk codifica un frame del encoder y los siguientes 16 frames mel) |
| Tipos de cuantizacion | float16 (única precisión publicada en este repositorio) |
| Idiomas soportados | en (inglés); el adaptador se evaluó además con habla noruega no vista |
| Licencia | NVIDIA Open Model License (modelo derivado; no Apache-2.0) |
| Formato de pesos | Core ML ML Program (`.mlpackage`), más `mel_filters.f32` y `recognizer.json` |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. Se parte del encoder NVIDIA Nemotron Speech Streaming English 0.6B (revisión `ebe59e5a817142986528bbbee5dba8db7b38ed50`), al que se fusiona el adaptador publicado `andersbekkevard/voice-keys-navigation-single-speaker-v1` en las proyecciones de atención mediante la operación `W += (A @ B)^T * alpha / rank` en float32, seguida de redondeo a float16. Se añade la cabeza CTC causal del adaptador y todo el conjunto se convierte a un ML Program de Core ML. No se modificó ningún valor aprendido salvo por la fusión y el redondeo.

El paquete expone dos funciones que comparten una única copia de los pesos: `first` codifica el primer frame mel del flujo (un frame del encoder) y `chunk` codifica cada bloque posterior de 16 frames mel (160 ms, dos frames del encoder). Las cachés de streaming y una máscara de atención aditiva son entradas y salidas explícitas del modelo. El modelo por sí solo no es funcional: necesita el front-end de streaming, la gestión de cachés, el decodificador CTC voraz y la composición de modificadores del paquete Swift `VoiceKeysRecognizer`. El adaptador se entrenó sobre la voz de un único hablante; no se documentan en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de 57 nombres de teclas habladas: letras (`a`–`z`), dígitos (`zero`–`nine`), flechas (`up`, `down`, `left`, `right`), modificadores (`command`, `control`, `option`, `shift`, `function`, `super`), teclas con nombre (`backspace`, `delete`, `enter`, `escape`, `return`, `space`, `tab`) y signos (`comma`, `minus`, `period`, `plus`).
- Decodificación CTC voraz en streaming sobre audio de 16 kHz con chunks de 160 ms.
- Composición de modificadores (por ejemplo, combinar `command` con una letra) gestionada por el runner Swift, no por el modelo.
- Ejecución nativa en Apple silicon mediante Core ML, sin Python ni dependencias de pickle.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada distinto de voz, ni generación de texto libre.
- Capacidad multilingüe: no disponible; el vocabulario y el modelo base están orientados a inglés.

## Casos de uso

- Navegación por teclado sin manos en macOS: el modelo permite dictar nombres de teclas para mover el foco, activar controles o lanzar atajos dentro de la app Voice Keys, usando su modo preview contenido que no puede enviar entrada al sistema.
- Prototipado de interfaces de accesibilidad por voz: sirve como base para experimentar con control por voz de teclado en un Mac, siempre con un control de apagado inmediato y verificación manual de las teclas reconocidas.
- Evaluación de pipelines de conversión a Core ML: el repositorio documenta la equivalencia funcional entre la referencia Python sobre safetensors y el modelo Core ML, lo que lo convierte en un caso de estudio para validar conversiones de encoders de streaming.
- Investigación sobre adaptación a hablante único: el adaptador y sus métricas (96,3 % de precisión en el hablante de entrenamiento, 36 falsos positivos en 4,15 minutos de habla noruega no vista) ofrecen un punto de partida para estudiar el coste de generalización en reconocedores CTC especializados.
- Integración en apps nativas Swift: mediante el paquete `VoiceKeysRecognizer` se puede incorporar el reconocimiento de teclas en una app macOS sin arrastrar un runtime de Python, con una latencia medida de 10,0 ms de mediana por chunk de 160 ms en un M4 Pro.
- Demostración de despliegue en Apple silicon: el modelo cabe en 2,3–2,5 GB de huella de proceso y carga en 2,4 s una vez compilado, lo que lo hace útil para probar flujos de compilación y carga de ML Programs en macOS 15 o superior.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Precisión de tokens de tecla | 96,3 % (intervalo 92,6–100 %) | 41 clips retenidos del hablante de entrenamiento, 82 teclas de referencia, 2 erróneas y 1 omitida |
| Falsas teclas en clips de navegación sin comandos | 65 | 93 clips retenidos del mismo hablante |
| Falsas teclas en dictado | 2.097 (699 por hora) | Aproximadamente 3 horas de dictado del mismo hablante |
| Falsas etiquetas en habla noruega no vista | 36 en 4,15 minutos | 20 clips públicos FLEURS nb_NO; falla la puerta de cero falsas etiquetas |
| Equivalencia Core ML vs. referencia Python | Misma secuencia de etiquetas y mismos eventos en todos los clips | 61 clips, un flujo de 248,8 s y tres clips sintéticos; float16 cambió la clase más probable en 1 frame de 5.775 |
| Latencia por chunk | 10,0 ms de mediana, 10,9 ms p95 | GPU de un Apple M4 Pro de 24 GB; factor de tiempo real 0,065 para el runner completo |
| Tiempo de carga | 2,4 s tras compilar; 8–12 s la primera vez | Mismo equipo |
| Huella de proceso | 2,3–2,5 GB en carga | Aproximadamente el doble de los pesos; no investigado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM/espacio en memoria: 2,3–2,5 GB de huella de proceso en carga en un Apple M4 Pro de 24 GB; el paquete de pesos ocupa 1,185 GB.
- GPU recomendadas: Apple silicon con GPU compatible con Core ML; las únicas mediciones publicadas corresponden a un M4 Pro de 24 GB.
- Cabe en GPU de consumo: sí, en Macs con Apple silicon; no se ha medido en otros equipos.
- Opciones de despliegue: Core ML ML Program con el paquete Swift `VoiceKeysRecognizer`; requiere macOS 15 para el modelo y macOS 26 para la app Voice Keys.
- Latencia y throughput: 10,0 ms de mediana y 10,9 ms p95 por chunk de 160 ms en GPU, con factor de tiempo real 0,065 para el runner completo; no se han medido otras Macs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voice Keys Navigation Core ML v1 | 0,6 mil millones | Chunks de 160 ms en streaming | en | NVIDIA Open Model License | Hugging Face, Core ML |
| NVIDIA Nemotron Speech Streaming English 0.6B | 0,6 mil millones | Streaming | en | NVIDIA Open Model License | Hugging Face |
| Voice Keys Navigation single-speaker v1 | 0,6 mil millones | Streaming | en | no disponible en la información | Hugging Face |

La comparación con reconocedores de voz generales (Whisper, Parakeet, etc.) no está disponible en la información proporcionada; el modelo solo reconoce un vocabulario cerrado de 57 teclas y no transcribe habla libre.

## Limitaciones y advertencias

- Entrenado sobre la voz de un único hablante; la precisión con otras voces no se ha medido en absoluto.
- Falsos positivos en habla ordinaria: 36 etiquetas falsas en 4,15 minutos de noruego no visto, lo que falla una puerta de cero falsas etiquetas; el habla normal puede escribir teclas, incluidos atajos.
- En el hablante de entrenamiento se registraron 699 falsas teclas por hora de dictado.
- No es un producto de accesibilidad validado ni un reconocedor de voz general; es un developer preview.
- No incluye inscripción corta ni adaptación automática al hablante.
- Ruido, micrófonos, acentos, idiomas y otras voces no se han evaluado sistemáticamente.
- Uso previsto restringido a la navegación por teclado opcional en la app Voice Keys, empezando por el preview contenido que no puede enviar entrada; no debe usarse sin supervisión, para control crítico de seguridad ni en flujos destructivos.
- Licencia NVIDIA Open Model License: al redistribuir un modelo derivado del encoder de NVIDIA se deben cumplir sus términos y la atribución requerida (`LICENSE.txt` y `Notice`); no es Apache-2.0.
- Los tensores aprendidos conservan características del hablante de entrenamiento; su publicación no los anonimiza ni elimina riesgos de pertenencia o memorización.
- El modelo por sí solo no hace nada útil: requiere el front-end de streaming, la gestión de cachés y el decodificador CTC del paquete Swift.
- Requiere macOS 15 para el modelo y macOS 26 sobre Apple silicon para la app.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andersbekkevard/voice-keys-navigation-coreml-v1
- Adaptador single-speaker: https://huggingface.co/andersbekkevard/voice-keys-navigation-single-speaker-v1
- Modelo base NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Script de conversión: `scripts/native-model/convert.py` (referenciado en la model card, dentro del repositorio)
