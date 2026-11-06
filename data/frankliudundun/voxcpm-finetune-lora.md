# FrankLiuDundun/voxcpm-finetune-lora

## Resumen

VoxCPM 2 r50 es un ajuste fino por LoRA del modelo de síntesis de voz openbmb/VoxCPM2, publicado por FrankLiuDundun y orientado a doblaje multilingüe en tailandés (th), indonesio (id) y tagalo (tl), manteniendo capacidades residuales en chino (zh) e inglés (en). El repositorio contiene en su raíz el modelo completo ya fusionado (2.290.004.544 parámetros según los safetensors) y, en el subdirectorio `lora/`, el incremento LoRA original con su configuración, de modo que puede cargarse tanto el checkpoint completo como el adaptador sobre el modelo base.

El problema que aborda es la baja calidad de la síntesis en lenguas de recursos medios dentro de un TTS multilingüe: el autor reporta una reducción sustancial de errores graves (lecturas vacías, adiciones, omisiones, CER fuera de umbral y duración descontrolada) medida con ASR Whisper large-v3 sobre conjuntos de desarrollo y de留出 (holdout). El entrenamiento se hizo sobre 7.891 clips (14,47 horas) procedentes de FLEURS, GigaSpeech 2, Common Voice 22 y YODAS2-Sidon, con especial atención al tailandés y al indonesio.

La relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible de ajuste LoRA conjunto sobre LM y DiT en un TTS moderno; por otro, publica una metodología de aceptación por lengua basada en test de signos en lugar de medias agregadas, lo que permite detectar regresiones en una sola lengua. La licencia Apache-2.0 facilita su uso comercial, aunque las condiciones de los datasets de origen deben respetarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con componente de lenguaje (LM) y componente DiT (diffusion transformer); ajuste LoRA conjunto sobre ambos |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | th, id, tl, zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo completo en raíz; `lora/lora_weights.safetensors` + `lora/lora_config.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openbmb/VoxCPM2, un TTS que combina un módulo de modelado lingüístico (LM) con un módulo DiT de generación acústica. El ajuste se aplica como LoRA conjunto con `enable_lm=true`, `enable_dit=true` y `enable_proj=false`, es decir, se adaptan las capas del LM y del DiT pero no las proyecciones. La configuración del adaptador es `r=64`, `alpha=64`, `dropout=0.05`. El repositorio incluye además el checkpoint fusionado, por lo que no es necesario aplicar el adaptador en tiempo de carga.

El entrenamiento partió de cero para el adaptador (cold start, seed 42), con learning rate 1e-4, weight decay 0,01, batch 2 con acumulación de gradiente 8 (lote efectivo 16), 145 pasos de warmup y 1.480 pasos, equivalentes a unas 3 épocas. El corpus suma 7.891 clips y 14,47 horas: indonesio 6,62 h, tagalo 4,76 h, tailandés 2,13 h, chino 0,59 h e inglés 0,37 h. Se partió de un pool seguro de 12 horas ya depurado (exclusión de grabaciones defectuosas, música de fondo y textos de evaluación) al que se añadieron 2.103 segmentos de tagalo e indonesio de 3 a 6 segundos, obtenidos cortando frases largas de FLEURS con alineamiento forzado MMS_FA en pausas de al menos 0,15 s y validados por transcripción inversa con Whisper (CER ≤ 0,10, silencio final ≤ 0,2 s). Las fuentes son FLEURS (CC-BY-4.0), GigaSpeech 2 (Apache-2.0), Common Voice 22 vía espejo comunitario (CC0) y YODAS2-Sidon th (CC-BY-3.0).

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en tailandés, indonesio, tagalo, chino e inglés.
- Doblaje y locución con referencia de voz (voice cloning condicionado por audio de referencia), ya que la evaluación usa referencias cruzadas en chino e inglés.
- Generación controlada por pasos de difusión según la duración esperada: 28 pasos para referencias de menos de 2 s, 24 para 2–5 s y 22 para 5 s o más.
- Control de prosodia y duración mediante `cfg` (1,8 en la configuración de producción reportada).
- Integración con OmniVoice mediante la variable de entorno `VOXCPM_MODEL_ID`.
- Carga opcional sin denoiser (`load_denoiser=False`) y con optimizaciones (`optimize=True`).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje de vídeo a tailandés, indonesio y tagalo: el modelo permite generar pistas de voz a partir de texto traducido y una referencia de hablante, con control de duración por número de pasos según la longitud del segmento, lo que encaja en flujos de localización por segmentos.
- Localización de audiolibros y contenido largo: la evaluación sobre frases largas (CER medio del 2,28 % en desarrollo) indica un comportamiento estable en lecturas extensas, adecuado para narración por capítulos.
- Generación de voces para asistentes de voz en Indonesia y Filipinas: el ajuste específico en id y tl reduce errores graves frente al modelo base (15→6 en indonesio y 27→14 en tagalo en el conjunto de frases cortas), lo que mejora la fiabilidad en respuestas breves de un asistente.
- E-learning y cursos de idiomas: la cobertura de cinco lenguas permite producir material de pronunciación y ejercicios de escucha con una única pila de TTS.
- Prototipado de sistemas de doblaje automático integrados con OmniVoice: la variable `VOXCPM_MODEL_ID` permite sustituir el modelo sin cambiar el pipeline.
- Investigación en adaptación eficiente de TTS: el repositorio conserva el adaptador LoRA (`r=64`, `alpha=64`) junto al checkpoint fusionado, lo que sirve como referencia reproducible para experimentos de ajuste conjunto LM+DiT.
- Sustitución de voces en postproducción con referencias cruzadas: la evaluación emplea referencias en chino e inglés para generar en th/id/tl, lo que respalda escenarios de clonación cross-lingüe.

## Benchmarks y rendimiento

Los datos publicados son métricas de aceptación medidas con ASR Whisper large-v3, con `cfg` 1,8, generación única sin reintentos, referencias cruzadas zh/en y 5 semillas. «Severo» agrupa transcripción vacía, lecturas de más, lecturas de menos o cola perdida, CER por encima del umbral (0,3 en frases largas, 0,5 en cortas) y duración descontrolada.

| Conjunto (n por modelo) | base | r46-u10 | r50 |
|---|---:|---:|---:|
| Frases cortas 1–4 palabras (675), severos | 80 | 74 | 56 |
| Desarrollo frases largas (900), severos / CER medio | 33 / 3,58 % | 35 / 3,54 % | 11 / 2,28 % |
| Holdout de un solo uso (450), severos / CER medio | 11 / 3,36 % | 18 / 3,48 % | 5 / 2,36 % |

Desglose por lengua de r50 frente al base (p del test de signos unilateral):

| Conjunto | id | th | tl |
|---|---|---|---|
| Desarrollo | 13→0 (p<,001) | 19→11 (p=,038) | 1→0 |
| Frases cortas | 15→6 (p=,011) | 38→36 (sin cambio) | 27→14 (p=,007) |
| Holdout | 0→0 | 11→5 (p=,035) | 0→0 |

Frente a r46-u10, el holdout de tailandés pasa de 15 a 5 (p=,001) y el de indonesio de 3 a 0, sin empeoramiento en ninguna lengua ni conjunto. El autor indica que r29 y r49 también superaron al base y que r50 fue seleccionado por tener el menor número de casos severos según una regla congelada de antemano; el holdout se usó una sola vez. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- El repositorio ocupa 37,9 GB e incluye el checkpoint fusionado y el adaptador; el espacio en disco necesario para la descarga completa es de ese orden.
- VRAM estimada para inferencia en precisión nativa: no disponible en la información proporcionada; con 2.290 millones de parámetros, una estimación orientativa en fp16 ronda los 4,6 GB de pesos más memoria de activaciones y del decodificador DiT, pero no hay medición publicada.
- GPU recomendadas: no disponible. No se documentan pruebas en A100, H100 ni RTX 4090.
- Ajuste en GPU de consumo: no confirmado; el entrenamiento usó lote efectivo 16 con acumulación, lo que sugiere requisitos moderados, pero no se especifica la GPU empleada.
- Opciones de despliegue: librería `voxcpm` (carga vía `VoxCPM.from_pretrained` con `load_denoiser=False` y `optimize=True`) y OmniVoice mediante `VOXCPM_MODEL_ID`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se conoce el número de pasos de difusión por duración (28 / 24 / 22), que condiciona directamente el coste de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| VoxCPM 2 r50 (este) | 2.290.004.544 | th, id, tl, zh, en | Apache-2.0 | Ajuste LoRA con evaluación por lengua; checkpoint fusionado y adaptador incluidos |
| openbmb/VoxCPM2 (base) | no disponible en la información | no disponible | no disponible | Modelo de partida; peor en casos severos según la tabla del autor |
| r46-u10 (variante previa del mismo autor) | no disponible | th, id, tl, zh, en | Apache-2.0 (presumible, mismo repo) | Superada por r50 en holdout de th e id |
| Otras alternativas TTS multilingües | no disponible | no disponible | no disponible | No se aportan datos de comparación en la información disponible |

## Limitaciones y advertencias

- Las métricas publicadas son de contenido y duración medidas por ASR; la naturalidad, el acento y la emoción no han sido validadas por hablantes nativos cualificados.
- Las referencias de voz usadas en la evaluación son hablantes de FLEURS y no cubren voz separada de producción ni reducción de ruido con ZipEnhancer, por lo que el rendimiento en cadenas reales de doblaje puede diferir.
- Pueden aparecer casos defectuosos con una sola semilla; el propio autor lo advierte.
- El tailandés en frases cortas no mejora de forma significativa (38→36, sin cambio), por lo que la fiabilidad en enunciados muy breves en esa lengua sigue siendo limitada.
- El chino y el inglés tienen una presencia mínima en el entrenamiento (0,59 h y 0,37 h), por lo que su calidad debe considerarse residual y no objetivo del ajuste.
- No hay información sobre sesgos de género, edad o acento en las voces generadas.
- La licencia del modelo es Apache-2.0, pero los datasets de origen imponen condiciones adicionales: FLEURS CC-BY-4.0, GigaSpeech 2 Apache-2.0, Common Voice 22 CC0 y YODAS2-Sidon th CC-BY-3.0; su uso comercial requiere revisar la atribución correspondiente.
- El adaptador LoRA requiere cargar conjuntamente `lora_weights.safetensors` y `lora_config.json`, y verificar que la lista `loaded` no esté vacía y que `skipped`/`missing` estén vacíos; una carga incorrecta degrada silenciosamente la calidad.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrankLiuDundun/voxcpm-finetune-lora
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset GigaSpeech 2: https://huggingface.co/datasets/speechcolab/gigaspeech2
- Espejo comunitario de Common Voice 22: https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Dataset YODAS2-Sidon th: https://huggingface.co/datasets/Chalermdej/yodas2_sidon_th_tts
- Referencia de FLEURS (Arora et al., 2022): no disponible como enlace directo en la información proporcionada
- Detalles de evaluación: archivo `evaluation.json` dentro del repositorio
