# FranciscoCarlosErra/alpa-es

## Resumen

alpa-es es un modelo de síntesis de voz (text-to-speech) en castellano con acento rioplatense, desarrollado por FranciscoCarlosErra como un port del modelo Alpa de 77ethers, que a su vez se construye sobre la arquitectura tiny-voca de Muhammed Nazeem. El modelo es un fine-tuning de los pesos ingleses de tiny-voca, con la tabla de fonemas reescrita a mano para adaptarla a la ortografía y pronunciación del español rioplatense (seseo, yeísmo, aspiración de j/g, vibrantes múltiples y simples, h muda y v como b). El resultado es un modelo extremadamente compacto (18 MB) que cabe en CPU y genera voz inteligible con dos voces predefinidas, femenina y masculina.

El entrenamiento se realizó sobre OpenSLR 61, el corpus de español argentino de Google, y consistió en 3000 pasos (aproximadamente 4 minutos en una GPU) partiendo de un transplante de pesos de tiny-voca. Se trata explícitamente de una prueba de concepto: el autor advierte que los resultados indican inteligibilidad, no naturalidad. Con un WER de 2,3 % en 24 frases de test (frente al 2,7 % de las grabaciones reales), el modelo es funcional para prototipos y aplicaciones de bajo coste, pero no está pensado para producción de alta calidad.

La relevancia actual de alpa-es reside en su tamaño: 18 MB y ejecución en CPU lo convierten en una opción viable para despliegues embebidos, aplicaciones offline o pipelines donde el coste computacional y el espacio de almacenamiento son críticos, algo imposible con modelos TTS neuronales convencionales de cientos de megabytes o gigabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (transformer ligero para TTS, port de Alpa) |
| Parametros totales | no disponible (tamaño del checkpoint: 18 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frases; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, formato .pt) |
| Idiomas soportados | es (castellano, acento rioplatense) |
| Licencia | Apache-2.0 (pesos y código); datos de entrenamiento CC-BY-SA-4.0 |
| Formato de pesos | PyTorch (.pt), checkpoint `alpa-es.pt` |

## Arquitectura y entrenamiento

alpa-es hereda la arquitectura de tiny-voca, un modelo TTS ligero basado en transformer que genera audio a partir de una secuencia de fonemas. El front-end (`alpa/text.py`) convierte el texto en un token por fonema aplicando reglas ortográficas del español rioplatense: seseo (c y z como s), yeísmo (ll e y como sonido sh/zh), j y g ante e/i como /x/, rr y r inicial vibrantes múltiples, r intervocálica como tap, h muda y v como b. El acento tónico se deduce de la tilde escrita o de la regla por defecto, y las vocales i/u átonas junto a otra vocal se convierten en semivocales. Los dígitos no se expanden, por lo que deben escribirse en palabras.

El entrenamiento partió de los pesos ingleses de tiny-voca mediante un transplante de tabla de fonemas (`alpa.transplant`), seguido de 3000 pasos de fine-tuning con `--batch-frames 3000 --max-batch 8 --learning-rate 3e-4 --warmup 50 --teacher-hold 150 --teacher-ramp 150` y el discriminador GAN desactivado. Los datos provienen de OpenSLR 61 (español argentino, una voz femenina y una masculina). No se menciona uso de RLHF ni DPO. La receta completa está embebida en el checkpoint.

## Capacidades

- Síntesis de voz en castellano rioplatense a partir de texto escrito.
- Dos voces predefinidas: `female` y `male`.
- Control de velocidad (`--speed`), tono (`--pitch-shift`) y rango de tono (`--pitch-range`), igual que en Alpa.
- Ejecución en CPU por defecto; soporte opcional de GPU con `--device cuda`.
- Front-end fonético específico para español rioplatense (seseo, yeísmo, aspiración, vibrantes).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No es multilingüe: solo español (rioplatense).

## Casos de uso

- Prototipado rápido de asistentes de voz en español: el modelo se instala con `pip install torch numpy soundfile huggingface_hub`, se descarga el checkpoint de 18 MB y genera audio en CPU sin GPU, lo que permite iterar en local en segundos.
- Aplicaciones embebidas y dispositivos de bajo consumo: con 18 MB de pesos y ejecución en CPU, cabe en entornos con restricciones severas de memoria y almacenamiento (Raspberry Pi, routers, wearables) donde un TTS neuronal convencional no es viable.
- Generación de avisos y locuciones cortas: frases como horarios, recordatorios o mensajes de estado se sintetizan con las voces female/male y control de velocidad, adecuadas para sistemas de megafonía o notificaciones.
- Pruebas de concepto de accesibilidad: lectura de texto a voz para personas con discapacidad visual en aplicaciones offline, con la advertencia de que la naturalidad es limitada y el WER de 2,3 % mide inteligibilidad, no calidad percibida.
- Investigación en TTS de bajos recursos: el repositorio documenta la receta completa (transplante de tabla de fonemas, fine-tuning de 3000 pasos, datos OpenSLR 61) y sirve como base reproducible para experimentar con adaptaciones fonéticas a otros dialectos.
- Generación de datasets sintéticos de audio para entrenar o evaluar sistemas de reconocimiento de voz en español rioplatense, usando las dos voces y los controles de tono y velocidad para aumentar la variabilidad.

## Benchmarks y rendimiento

El autor publica tasas de error de palabra (WER) sobre 24 frases de test reservadas de OpenSLR 61, transcritas con Whisper (menor es mejor):

| Sistema | WER |
|---|---|
| Grabaciones reales | 2,7 % |
| Punto de partida transplantado (sin entrenamiento) | 23,5 % |
| alpa-es (3000 pasos) | 2,3 % |

El propio autor advierte que, con solo 24 frases, la diferencia entre alpa-es y las grabaciones reales es ruido estadístico, y que el resultado indica inteligibilidad, no naturalidad. No se han publicado resultados de benchmarks adicionales (MOS, similitud de hablante, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU el checkpoint de 18 MB ocupa una fracción mínima de memoria (no se especifica cifra exacta).
- GPU recomendadas: cualquiera con soporte CUDA; el autor indica que `--device cuda` es opcional y que el modelo funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: script oficial `python -m alpa.infer` con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo TTS).
- Latencia y throughput: no disponibles. El entrenamiento de 3000 pasos tardó aproximadamente 4 minutos en una GPU, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Idioma | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| alpa-es | 18 MB | es (rioplatense) | Apache-2.0 | no disponible | TTS ligero, CPU, dos voces |
| Alpa (77ethers) | no disponible | sa (sánscrito) | no disponible | no disponible | Modelo original del que deriva el port |
| tiny-voca (n4ze3m) | no disponible | en (inglés) | Apache-2.0 | no disponible | Arquitectura y pesos base del fine-tuning |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a linaje, idioma y licencia.

## Limitaciones y advertencias

- Es una prueba de concepto: el autor indica explícitamente que el resultado mide inteligibilidad, no naturalidad; la calidad de voz no es comparable a TTS neuronales de producción.
- Solo dos voces (female y male) y un único acento (rioplatense); no hay control de hablante ni clonación de voz.
- Los dígitos no se expanden: escribir números en palabras o la síntesis fallará o los ignorará.
- El WER de 2,3 % se calcula sobre solo 24 frases, muestra insuficiente para conclusiones estadísticas robustas.
- Riesgo de alucinación o artefactos acústicos en textos fuera del dominio de entrenamiento (frases largas, palabras técnicas, extranjerismos).
- Licencia de los datos: OpenSLR 61 es CC-BY-SA-4.0 (share-alike); el autor advierte que hay que comprobar cómo aplica a los pesos derivados en cada uso, aunque el código y los pesos se publican como Apache-2.0.
- Sin soporte de tool calling, agentes, visión ni razonamiento: no es un modelo de lenguaje general.
- No se documentan métricas de latencia ni throughput para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FranciscoCarlosErra/alpa-es
- Modelo base tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Modelo Alpa original: https://huggingface.co/77ethers/alpa
- Corpus OpenSLR 61: https://www.openslr.org/61/
- Muestras de audio: https://huggingface.co/FranciscoCarlosErra/alpa-es/resolve/main/samples/01-female.wav (y 02-male.wav a 06-male.wav en la misma ruta)
