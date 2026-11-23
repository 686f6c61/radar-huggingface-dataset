# machinekind/Matcha-TTS-PL

## Resumen

Matcha-TTS-PL es un sistema de síntesis de voz (text-to-speech) para polaco moderno desarrollado por el usuario machinekind. Se trata de un modelo Matcha-TTS no autorregresivo de tan solo 20,9 millones de parámetros, destilado a partir de VoxCPM2 (un TTS de 2.000 millones de parámetros de OpenBMB) sobre voces sintéticas. El repositorio contiene seis voces independientes, cada una con su propio modelo acústico y su propio vocoder HiFi-GAN afinado, lo que permite seleccionar el timbre en tiempo de inferencia.

El modelo parte de un preentrenamiento sobre audiolibros polacos (Wolne Lektury y AZON) y se afina después con aproximadamente 15 horas de habla sintética por voz, generada a partir de descripciones textuales con VoxCPM2. Su rasgo diferencial es el tratamiento del code-switching: detecta automáticamente palabras en inglés dentro de frases en polaco y las fonemiza con espeak-ng en-us, mientras el resto se procesa con espeak-ng pl.

Es relevante por su relación entre calidad y coste computacional: con 20,9 M de parámetros funciona en tiempo real en una CPU de Mac o directamente en el navegador mediante grafos ONNX, algo impensable para el modelo profesor de 2B. La licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-al-igual. Existe una versión posterior, Matcha-TTS-PL-v2, con datos conversacionales y duraciones estocásticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS no autorregresiva (flow matching) con vocoder HiFi-GAN |
| Parametros totales | 20,9 M (modelo acústico); vocoder HiFi-GAN V1 o V2 (0,93 M en V2) adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentos de entrenamiento de 10-25 s) |
| Tipos de cuantizacion | no disponible; exportación a ONNX (grafos t4 y t2, 4 y 2 pasos ODE) |
| Idiomas soportados | polaco (pl) con palabras en inglés embebidas (code-switching) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (modelo + vocoder en un grafo), PyTorch checkpoint (.ckpt), HiFi-GAN generator |

## Arquitectura y entrenamiento

Matcha-TTS es un modelo de síntesis no autorregresivo basado en flow matching condicionado por texto, con un decodificador que genera espectrogramas mel en un número fijo de pasos ODE (4 o 2 en las exportaciones ONNX). El vocoder HiFi-GAN convierte el mel en forma de onda. La innovación principal es la destilación: el modelo pequeño se entrena para imitar las salidas de VoxCPM2, un TTS de 2B parámetros, sobre voces sintéticas congeladas como cachés de prompt. Cada voz tiene su propio modelo acústico y su propio vocoder afinado con el audio real del profesor como ground truth.

El entrenamiento parte de Matcha-TTS-PL-Pretrain, preentrenado sobre audiolibros polacos de Wolne Lektury y AZON. El ajuste fino usa unas 15 horas de habla sintética por voz, con los mismos textos para todas: habla de asistente en 18 dominios cotidianos, preguntas de todo tipo, corpus modernos (NKJP, Wikinews, KPWr, ParlaMint, OpenAssistant, Wikibooks, Wikivoyage) y transcripciones de YouTube revisadas. Dos tercios del material son pasajes multi-frase de 10-25 s para planificar la prosodia entre frases; las formas en primera persona están equilibradas 50/50 entre masculino y femenino. Las voces `female_voxcpm_3` y `male_voxcpm_3` (noviembre de 2026) usan una receta de datos más reciente con selección de tomas por voz y un vocoder HiFi-GAN V2 más pequeño (0,93 M).

## Capacidades

- Síntesis de voz en polaco moderno con seis timbres seleccionables (tres masculinos, tres femeninos).
- Code-switching automático: detección de palabras inglesas dentro de frases polacas y fonemización con espeak-ng en-us.
- Planificación prosódica multi-frase gracias a segmentos de entrenamiento de 10-25 s.
- Control de tempo mediante `length_scale` (valor por defecto 0,8; a 1,0 el habla es un 10-19 % más lenta que el profesor).
- Control de estilo mediante token de estilo (8 = neutro) y temperatura de muestreo (por defecto 0,8).
- Inferencia en navegador y en CPU mediante grafos ONNX con 4 o 2 pasos ODE.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz para aplicaciones en polaco: el modelo genera habla de asistente en 18 dominios cotidianos y con prosodia planificada entre frases, adecuado para respuestas conversacionales de varios enunciados.
- Lectura de textos con terminología inglesa: frases como "Po meetingu wyślę ci feedback na maila" se leen correctamente gracias a la detección y fonemización automática de palabras inglesas, útil en entornos tecnológicos y corporativos polacos.
- Síntesis en el navegador sin backend: los grafos ONNX con 2 y 4 pasos ODE permiten ejecutar el TTS en el cliente, reduciendo coste de servidor y latencia de red en aplicaciones web.
- Sistemas embebidos y robótica: con 20,9 M de parámetros y vocoder V2 de 0,93 M, el modelo cabe en dispositivos con recursos limitados; el tag "robot" de la model card sugiere ese uso previsto.
- Audiolibros y contenido largo: la planificación prosódica multi-frase y la selección de seis voces permiten narrar pasajes con coherencia entonativa y alternar timbres por personaje.
- Accesibilidad y lectura de pantalla: la inferencia en CPU de Mac en tiempo real lo hace viable para lectores de pantalla en polaco sin GPU dedicada.
- Localización de contenidos: generación de pistas de voz en polaco para vídeos o cursos, con control de tempo para ajustar la duración al metraje.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 12 frases reservadas, CPU de Mac, 4 pasos ODE, temperatura 0,8, cada modelo con su propio vocoder:

| Voz | Género | UTMOS ↑ | Whisper WER ↓ | Similitud ↑ | Profesor VoxCPM2 (UTMOS / similitud) | Preguntas: misma dirección que el profesor | Tempo por defecto |
|---|---|---|---|---|---|---|---|
| `male_voxcpm_1` | masculino | 3,40 | 1,3 % | 0,850 | 3,68 / 0,883 | 8/8, 3,3 st | 0,8 |
| `female_voxcpm_1` | femenino | 3,27 | 2,0 % | 0,836 | 3,82 / 0,884 | 6/8, 3,1 st | 0,8 |
| `male_voxcpm_2` | masculino | 3,59 | 0,7 % | 0,850 | 3,87 / 0,874 | 7/8, 4,0 st | 0,8 |
| `female_voxcpm_2` | femenino | 3,39 | 0,7 % | 0,907 | 3,69 / 0,919 | 6/8, 4,0 st | 0,8 |
| `female_voxcpm_3` | femenino | 2,98 | 4,7 % | 0,896 | 3,21 / 0,896 | 6/8, 3,6 st | 0,8 |
| `male_voxcpm_3` | masculino | 3,25 | 3,4 % | 0,886 | 3,38 / 0,874 | 5/8, 6,7 st | 0,8 |

La prueba de preguntas compara la pendiente final de tono de 8 preguntas (4 wh-, 4 de sí/no) frente al profesor leyendo las mismas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo acústico de 20,9 M de parámetros más el vocoder; los grafos ONNX reducen aún más el consumo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el autor reporta ejecución en tiempo real en una CPU de Mac, por lo que una RTX 4090, A100 o H100 están sobradamente dimensionadas.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime (navegador y servidor), PyTorch con los checkpoints `.ckpt`, y el Space oficial en Hugging Face. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un TTS de este tipo).
- Latencia y throughput: inferencia en tiempo real en CPU de Mac con 4 pasos ODE según el autor; los grafos t2 (2 pasos ODE) reducen el coste a la mitad. No se publican cifras de RTF ni de throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / prosodia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matcha-TTS-PL | 20,9 M (+ vocoder) | pl con code-switching en | Segmentos de 10-25 s, prosodia multi-frase | CC-BY-SA-4.0 | Hugging Face, ONNX, Space |
| Matcha-TTS-PL-v2 | no disponible | pl | Datos conversacionales, duraciones estocásticas, dos voces | no disponible | Hugging Face (versión posterior del mismo autor) |
| Matcha-TTS-PL-Edge | no disponible | pl | Vocoder HiFi-GAN V2 (0,93 M) | no disponible | Hugging Face (mismo autor) |
| VoxCPM2 (profesor) | 2.000 M | no disponible | no disponible | Apache-2.0 | OpenBMB |

No se dispone de datos de benchmarks comparativos con otros TTS polacos en la información proporcionada.

## Limitaciones y advertencias

- Las voces son sintéticas, diseñadas a partir de descripciones textuales con VoxCPM2 y congeladas como cachés de prompt; no son grabaciones ni clones de personas reales.
- La voz `female_voxcpm_1` aprendió los "pops" de la grabación de referencia del profesor y requiere un filtro paso alto a 90 Hz (Butterworth de 4.º orden, fase cero) al usar su grafo ONNX o checkpoint directamente; las demás voces no lo necesitan.
- La calidad es inferior a la del profesor: UTMOS entre 2,98 y 3,59 frente a 3,21-3,87, y la prueba de preguntas solo coincide en la dirección del tono en 5/8 a 8/8 de los casos.
- `female_voxcpm_3` presenta el peor WER (4,7 %) y el UTMOS más bajo (2,98) del conjunto.
- Solo soporta polaco; el inglés se limita a palabras aisladas embebidas, no a frases completas.
- No se documentan sesgos demográficos ni de otro tipo; el equilibrio 50/50 de formas en primera persona es una decisión de diseño, no una evaluación de sesgo.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- El autor recomienda la versión v2 (datos conversacionales, duraciones estocásticas) para nuevos desarrollos; esta versión queda como referencia de seis voces.
- No se publican cifras de latencia ni throughput por hardware, solo la afirmación de tiempo real en CPU de Mac.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/machinekind/Matcha-TTS-PL
- Versión posterior: https://huggingface.co/machinekind/Matcha-TTS-PL-v2
- Modelo de preentrenamiento: https://huggingface.co/machinekind/Matcha-TTS-PL-Pretrain
- Modelo Edge: https://huggingface.co/machinekind/Matcha-TTS-PL-Edge
- Space de demostración: https://huggingface.co/spaces/machinekind/matcha-tts-pl
- Dataset de entrenamiento: https://huggingface.co/datasets/machinekind/polish-synthetic-speech-voxcpm2
- VoxCPM2 (profesor, OpenBMB): no disponible en la información proporcionada
