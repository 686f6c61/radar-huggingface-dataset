# AfriSpeech/africa-female-vc

## Resumen

africa-female-vc es un modelo de conversion de voz (voice conversion, pipeline audio-to-audio) desarrollado por AfriSpeech. Se basa en Seed-VC y ha sido afinado para transformar habla en cualquier idioma a una voz femenina africana, preservando el contenido linguistico original (las palabras pronunciadas). No genera texto ni responde a instrucciones: su unica tarea es reescribir la identidad vocal de una grabacion manteniendo la pronunciacion y el contenido.

El problema que resuelve es la escasez de voces sinteticas de calidad para lenguas africanas. En lugar de entrenar un sistema text-to-speech por idioma, adopta un enfoque language-agnostic: como la conversion de voz no necesita conocer el idioma, un unico modelo entrenado sobre habla africana puede aplicarse a idiomas que nunca vio. El repositorio ocupa 0,4 GB y se distribuye con 21 voces integradas, accesibles mediante una libreria instalable con pip y una CLI.

Es relevante ahora porque demuestra transferencia out-of-domain real: en lenguas nunca vistas reduce la penalizacion de CER sobre audio real de +14,1 a +10,1 puntos y supera a Seed-VC zero-shot en 27 de 37 idiomas no entrenados, segun los datos publicados por el autor. La arquitectura subyacente (DiT con backbone U-ViT, codificador Whisper-small y vocoder BigVGAN) mantiene el modelo en un tamano moderado, apto para inferencia en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con backbone U-ViT, codificador de contenido Whisper-small, WaveNet y vocoder BigVGAN, segun el checkpoint base de Seed-VC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; no opera sobre ventanas de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Independiente del idioma de entrada; el autor indica que convierte habla en cualquier idioma. Entrenado sobre 21 idiomas africanos; evaluado tambien en 37 idiomas no vistos |
| Licencia | GPL-3.0 |
| Formato de pesos | .pth (checkpoint de PyTorch en formato Seed-VC; la base usa `DiT_seed_v2_uvit_whisper_small_wavenet_bigvgan_pruned.pth`) |
| Pipeline | audio-to-audio |
| Libreria | seed-vc |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | AfriSpeech/africa-female-speech-v2-best60 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Seed-VC, un sistema de conversion de voz basado en un Diffusion Transformer (DiT) con backbone U-ViT. La representacion de contenido se extrae con un codificador Whisper-small y el audio final se reconstruye con WaveNet y un vocoder BigVGAN, en su variante podada. El checkpoint base es `DiT_seed_v2_uvit_whisper_small_wavenet_bigvgan_pruned.pth` (Plachta/Seed-VC), con la configuracion `config_dit_mel_seed_uvit_whisper_small_wavenet.yml`. El proceso de sintesis es iterativo: el autor reporta resultados a 50 pasos de difusion.

El afinado se realizo sobre AfriSpeech/africa-female-speech-v2-best60, descrito por el autor como los 60 minutos mas limpios del dataset de habla femenina africana. No se detalla el numero total de tokens de audio, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables directamente a un modelo de conversion de voz). La innovacion practica es que, al ser la conversion independente del idioma, el entrenamiento en un conjunto reducido de lenguas africanas transfiere a lenguas fuera de dominio: el autor documenta mejoras sistematicas sobre Seed-VC zero-shot en 27 de 37 idiomas nunca vistos.

## Capacidades

- Conversion de voz de audio a audio: transforma una grabacion de habla en una voz femenina africana preservando el contenido linguistico.
- Independencia del idioma de entrada: el modelo no necesita conocer el idioma de la fuente; el autor afirma que funciona con habla en cualquier idioma.
- 21 voces integradas, no ligadas a idiomas concretos: cualquier voz puede aplicarse a habla en cualquier lengua.
- Transferencia out-of-domain: mantiene el contenido en lenguas no vistas durante el entrenamiento, con degradacion medida.
- Interfaz de linea de comandos y libreria instalable con pip (por ejemplo, `africa-female-vc convert-file talk.wav --voice warm-low -o talk_warm_low.wav`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: es exclusivamente un modelo de conversion de voz.
- Control de calidad del resultado mediante el numero de pasos de difusion (resultados publicados a 50 pasos).

## Casos de uso

- Doblaje y localizacion de contenido en lenguas africanas: convertir la voz de un locutor a una voz objetivo concreta manteniendo el guion, util para producir versiones de audio en Amharic, Swahili, Hausa, Yoruba o Zulu sin re-grabar.
- Audiolibros y contenido educativo: convertir grabaciones de hablantes a una voz consistente (por ejemplo, la voz "warm-low") para mantener uniformidad a lo largo de un catalogo extenso.
- Preservacion y anonimizacion de voz: transformar la identidad vocal de entrevistas o testimonios manteniendo el contenido, util para proteger la privacidad del hablante.
- Aumento de datos para investigacion en reconocimiento de voz: generar variantes de audio con distinta identidad vocal pero mismo contenido para ampliar corpus de ASR en lenguas de bajos recursos.
- Sistemas de asistencia por voz en lenguas africanas: dotar a un asistente de una voz sintetica localizada cuando no existe TTS nativo para ese idioma, aprovechando la independencia del idioma de entrada.
- Post-produccion de podcast y radio: ajustar o sustituir la voz de un segmento sin re-grabar, manteniendo la sincronizacion temporal con el audio original.
- Prototipado de voces para productos: evaluar 21 timbres distintos sobre el mismo material antes de invertir en grabaciones de estudio.

## Benchmarks y rendimiento

Preservacion de contenido medida como CER (Character Error Rate) de omniASR-CTC-300M-v2 (sherpa-onnx) sobre el audio convertido frente a la transcripcion de origen. Conjunto held-out: 105 clips (5 por idioma) del split de validacion v2, convertidos a una voz de referencia no vista del mismo idioma a 50 pasos de difusion. El suelo (floor) es el mismo ASR sobre el audio original sin convertir.

| Sistema | CER | Sobre el suelo |
|---|---:|---:|
| Grabaciones reales (suelo) | 15,02 | - |
| Seed-VC zero-shot (`seed-uvit-whisper-small-wavenet`) | 22,57 | +7,55 |
| africa-female-vc | 18,73 | +3,71 |

Resultados por idioma in-domain (5 clips cada uno; el autor advierte que diferencias de uno o dos puntos son ruido):

| Idioma | Suelo | Zero-shot | africa-female-vc |
|---|---:|---:|---:|
| Amharic | 15,2 | 20,8 | 16,7 |
| Chichewa | 5,8 | 11,2 | 11,7 |
| Hausa | 5,7 | 19,9 | 21,2 |
| Igbo | 15,6 | 26,9 | 18,8 |
| Kinyarwanda | 4,8 | 8,2 | 5,8 |
| Kirundi | 4,7 | 10,9 | 9,4 |
| Ndebele | 13,3 | 23,7 | 16,8 |
| Oromo | 15,2 | 22,0 | 12,7 |
| Sepedi | 12,6 | 27,4 | 15,5 |
| Sesotho | 22,4 | 27,4 | 23,0 |
| Setswana | 16,9 | 20,4 | 16,9 |
| Shona | 9,0 | 24,2 | 14,1 |
| Swahili | 2,7 | 7,4 | 4,6 |
| Swati | 15,9 | 21,9 | 16,8 |
| Tigrinya | 21,4 | 42,9 | 26,5 |
| Tsonga | 9,6 | 19,7 | 20,2 |
| Twi | 20,9 | 28,0 | 25,2 |
| Venda | 33,9 | 37,5 | 35,4 |
| Xhosa | 15,8 | 25,4 | 20,6 |
| Yoruba | 48,5 | 37,1 | 50,7 |
| Zulu | 5,3 | 11,3 | 10,7 |

Transferencia out-of-domain (dataset AfriSpeech/youversion-african-speech, 4 clips de 4-12 s por idioma, cada uno convertido a una voz integrada distinta, 50 pasos):

| Categoria | Idiomas | Suelo (audio real) | Zero-shot Seed-VC | africa-female-vc | Mejor en |
|---|---:|---:|---:|---:|---:|
| Out-of-domain (nunca entrenado) | 37 | 20,85 | 34,96 (+14,1) | 30,98 (+10,1) | 27/37 |
| Control (idiomas de entrenamiento, fuente nueva) | 4 | 16,27 | 31,73 (+15,5) | 25,37 (+9,1) | 3/4 |

Observaciones del autor: una lengua nueva cuesta aproximadamente un punto adicional de CER frente a las lenguas control; los peores casos son Tashelhayt, Mankanya, Fon, Dan y Shilluk (entre +20 y +42 sobre el suelo, varias fuertemente tonales); Tarifit, Luba-Lulua y Kikuyu son poco informativos porque el propio ASR puntua entre 55 % y 88 % de CER sobre el audio real. El model card publica ademas el desglose por idioma de los 41 idiomas evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,4 GB y la base combina Whisper-small, un DiT y el vocoder BigVGAN, por lo que la inferencia cabe con holgura en GPU de consumo (estimacion orientativa: del orden de 2-4 GB en FP16, sin confirmacion del autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con al menos 4-6 GB de VRAM seria suficiente; modelos como RTX 3060, RTX 4060 o RTX 4090 serian aptos.
- Compatibilidad con GPU de consumo: si, segun el tamano del modelo y del repositorio; no confirmado oficialmente.
- Opciones de despliegue: libreria y CLI oficiales de africa-female-vc (instalables con pip desde el repositorio de GitHub); al estar basado en Seed-VC, se heredan las dependencias de ese ecosistema. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de audio).
- Latencia y throughput: no disponibles. El autor especifica que los resultados se obtuvieron a 50 pasos de difusion, parametro que condiciona directamente el tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Rendimiento (CER in-domain) | Disponibilidad |
|---|---|---|---:|---:|---|
| africa-female-vc | Voice conversion (Seed-VC afinado) | Independiente del idioma; 21 voces | GPL-3.0 | 18,73 | HuggingFace + GitHub + demo |
| Seed-VC zero-shot (`seed-uvit-whisper-small-wavenet`) | Voice conversion base | Independiente del idioma | No disponible en la informacion | 22,57 | Repositorio Seed-VC (Plachta) |
| Checkpoint base `DiT_seed_v2_uvit_whisper_small_wavenet_bigvgan_pruned.pth` | Base de partida del afinado | Independiente del idioma | No disponible en la informacion | No evaluado por separado | Plachta/Seed-VC |

No se dispone de datos de otros modelos de conversion de voz especificos para lenguas africanas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de conversion de voz: no genera texto, no razona, no ejecuta codigo ni soporta tool calling o agentes. Cualquier expectativa de LLM es inaplicable.
- El CER no es perfecto ni en el mejor caso: la conversion anade inevitablemente un incremento de CER sobre el audio real (18,73 frente a un suelo de 15,02 en in-domain; +10,1 en out-of-domain).
- Rendimiento desigual por idioma: en Yoruba el modelo afinado empeora respecto a zero-shot (50,7 frente a 37,1); en Chichewa, Hausa y Tsonga apenas iguala o supera ligeramente al zero-shot. Las lenguas fuertemente tonales (Tashelhayt, Mankanya, Fon, Dan, Shilluk) muestran las mayores degradaciones.
- Idiomas con ASR poco fiable: en Tarifit, Luba-Lulua y Kikuyu la propia metrica de evaluacion es dudosa (55-88 % de CER sobre audio real), por lo que los numeros publicados no permiten conclusiones.
- Muestra pequena en la evaluacion: 5 clips por idioma en in-domain y 4 clips por idioma en out-of-domain; el autor recomienda interpretar promedios de grupo, no cifras por idioma aislado.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Su integracion en productos propietarios exige revisar las obligaciones de distribucion de codigo fuente derivado; no es apta para uso comercial cerrado sin analisis legal.
- Repositorio sin traccion: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que implica poca validacion externa.
- No se documentan sesgos especificos, riesgos de alucinacion, limites de contexto ni cuantizaciones disponibles; estos apartados figuran como no disponibles.
- Riesgo de uso indebido: la conversion de voz permite suplantar identidad vocal; conviene aplicar consentimiento explicito y marcas de agua en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AfriSpeech/africa-female-vc
- Repositorio GitHub (libreria y CLI): https://github.com/AfriSpeech/africa-female-vc
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/AfriSpeech/africa-female-vc-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/africa-female-speech-v2-best60
- Dataset de validacion: https://huggingface.co/datasets/AfriSpeech/africa-female-speech-v2
- Dataset out-of-domain: https://huggingface.co/datasets/AfriSpeech/youversion-african-speech
- Seed-VC (proyecto base): https://github.com/Plachtaa/seed-vc
