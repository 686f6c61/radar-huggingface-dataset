# Maksim-148867/ruGPT3_small_nujdiki_fithah

## Resumen

ruGPT3_small_nujdiki_fithah es un ajuste fino (fine-tuning) del modelo ruGPT3 small de Sber AI, un transformer autoregresivo de tipo GPT-2 con 125 millones de parametros (el repositorio declara 175.557.888 parametros reales en safetensors). Lo desarrolla el usuario Maksim-148867 y esta entrenado sobre transcripciones de audio de un podcast de humor ruso, transcritas con OpenAI Whisper large, con un tamano de bloque de 1024 tokens y 25 epocas.

El modelo no persigue un uso de produccion generalista: es un experimento de generacion de texto con un estilo muy concreto, el del podcast de origen, y su interes es principalmente demostrativo y de investigacion sobre ajuste fino de modelos pequenos en dominios muy especificos. Su relevancia actual es limitada: cero descargas y cero likes en Hugging Face, licencia WTFPL y una model card informal sin datos de evaluacion.

La ficha se limita a lo que la informacion disponible permite afirmar. Cualquier dato no documentado por el autor se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo tipo GPT-2 (ruGPT3 small) |
| Parametros totales | 175.557.888 (segun safetensors); la model card cita 125 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma oficial; el autor entreno con tamano de bloque 1024 |
| Tipos de cuantizacion | no disponible de forma explicita; el repo incluye pesos en safetensors y GGUF |
| Idiomas soportados | no disponible oficialmente; por el modelo base y los datos, ruso |
| Licencia | WTFPL |
| Formato de pesos | safetensors, GGUF, PyTorch |

## Arquitectura y entrenamiento

La arquitectura es la del ruGPT3 small de Sber AI: un transformer decoder-only con atencion causal, en la linea de GPT-2, con 125 millones de parametros segun la model card (el recuento de safetensors indica 175.557.888, una discrepancia que el autor no explica). No hay innovaciones arquitectonicas propias; el valor del modelo esta en el ajuste fino.

El entrenamiento consistio en un fine-tuning sobre transcripciones de audio de aproximadamente 30 minutos de un podcast de humor ruso ("нуждики"), transcritas con OpenAI Whisper large. El autor indica tamano de bloque de 1024 y 25 epocas. No se documentan el numero total de tokens, la composicion exacta del dataset, ni si hubo RLHF, DPO o filtrado de calidad. Tampoco se especifican hiperparametros como learning rate, batch size u optimizador.

## Capacidades

- Generacion de texto autoregresiva en ruso, con un estilo marcadamente informal y humoristico heredado del corpus de ajuste.
- Continuacion de prompts y generacion de parrafos largos (el ejemplo de la model card usa `max_length=350`).
- Capacidad muy limitada de razonamiento, codigo o matematicas; no hay evidencia de ello en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el modelo base es ruso y el corpus de ajuste tambien.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion con fine-tuning de modelos pequenos: sirve como ejemplo reproducible de ajuste de un GPT-2 ruso sobre un corpus de unas pocas horas transcritas, util para estudiar el efecto de 25 epocas sobre un dataset pequeno.
- Generacion de texto creativo de estilo: puede emplearse para producir parrafos con un tono humoristico y absurdo concreto, siempre con revision humana.
- Demos y prototipos de generacion de texto en ruso: su tamano reducido permite ejecutarlo en entornos con poca VRAM (el autor menciona 4 GB e incluso 2 GB) para pruebas rapidas.
- Investigacion sobre sobreajuste y degeneracion: con un corpus de ~30 minutos y 25 epocas, es un caso de estudio de memorizacion y divagacion en modelos pequenos.
- Educacion: ejemplo didactico de pipeline de `transformers` para text-generation y de conversion a GGUF.
- Pruebas de infraestructura de inferencia: al ser pequeno y disponer de pesos GGUF, sirve para validar despliegues con llama.cpp u Ollama en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor afirma que funciona con 4 GB de VRAM e incluso con 2 GB; con 175 millones de parametros en fp32 son unos 0,7 GB de pesos, y en cuantizacion de 4 bits menos de 0,2 GB, por lo que la mayor parte del consumo corresponde a la cache KV y al runtime.
- GPU recomendadas: cualquier GPU consumer con 2-4 GB o mas; no requiere A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1050 Ti en adelante, segun VRAM disponible).
- Opciones de despliegue: `transformers` con `pipeline('text-generation')` (metodo documentado por el autor), llama.cpp u Ollama mediante los pesos GGUF del repo, y servidores compatibles con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ruGPT3_small_nujdiki_fithah | 175.557.888 (safetensors) | no disponible (bloque de entrenamiento 1024) | WTFPL | Hugging Face, 0 descargas |
| ruGPT3 small (Sber AI, base) | 125 millones | no disponible | no disponible en esta ficha | Hugging Face / GitHub ai-forever |
| GPT-2 small (OpenAI) | 124 millones | 1024 | MIT | Hugging Face |

La comparacion se limita a parametros y licencia porque no hay benchmarks publicados de este ajuste ni datos de rendimiento de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus de ajuste es un podcast de humor con lenguaje coloquial y contenido potencialmente ofensivo; el modelo puede reproducir ese tono y estereotipos.
- Riesgo de alucinacion: alto; con 25 epocas sobre un corpus de ~30 minutos, el modelo tiende a divagar y a generar texto incoherente, como muestra el propio ejemplo de la model card.
- Limitaciones de contexto e idioma: no hay contexto maximo documentado; el uso esta practicamente restringido al ruso.
- Restricciones de licencia: WTFPL permite uso comercial y modificacion sin condiciones, pero el modelo base ruGPT3 y el corpus de origen pueden tener sus propias condiciones, no documentadas aqui.
- Caveats para produccion: cero descargas y cero likes, ausencia de evaluacion, discrepancia en el recuento de parametros y model card informal; no es apto para produccion sin validacion previa.
- El contenido generado puede incluir lenguaje soez o material sensible; requiere filtrado si se expone a usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maksim-148867/ruGPT3_small_nujdiki_fithah
- Repositorio de scripts de inferencia de ruGPT3: https://github.com/ai-forever/ru-gpts
- OpenAI Whisper (herramienta de transcripcion usada): https://github.com/openai/whisper
