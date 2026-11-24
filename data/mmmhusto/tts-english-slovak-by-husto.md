# mmmhusto/TTS-English-Slovak-by-husto

## Resumen

TTS English-Slovak by husto es un modelo de síntesis de voz (text-to-speech) bilingüe desarrollado por el usuario mmmhusto. Emplea una arquitectura SkttsV2 con un modelo acústico de 41,8 millones de parámetros y un vocoder BigVGAN compartido que genera audio a 24 kHz. El mismo conjunto de pesos acústicos produce voz en inglés y en eslovaco, lo que lo convierte en una propuesta poco habitual dentro de los modelos TTS pequeños: un único checkpoint con cinco perfiles de voz repartidos entre los dos idiomas.

El modelo parte del checkpoint inglés "English Duo" (42M) y añade aprendizaje de eslovaco mediante un frontend fonético específico, ejemplos de los corpus Lili, SlovakSpeech y TrePal y replay de datos ingleses. El checkpoint publicado corresponde a la evaluación tras 2.200 pasos adicionales con voz eslovaca original. El autor marca explícitamente el eslovaco como experimental.

Es relevante para desarrolladores que necesitan un TTS ligero, desplegable en local y con licencia CC BY-SA 4.0, que cubra inglés y eslovaco sin depender de servicios en la nube. Incluye exportación ONNX para demostración web y el modelo acústico en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SkttsV2 (modelo acústico) + vocoder BigVGAN compartido |
| Parametros totales | 41.828.490 (modelo acústico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye safetensors y exportación ONNX) |
| Idiomas soportados | inglés (en), eslovaco (sk) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (modelo acústico), ONNX (demo web), pesos BigVGAN en `vocoder/` |
| Frecuencia de muestreo | 24 kHz |
| Perfiles de voz | 5 (`en_hifi_92_clean`, `en_dt_0`, `sk_muz`, `sk_cori`, `sk_dailytalk`) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SkttsV2: un modelo acústico que transforma fonemas en representaciones mel y un vocoder BigVGAN que sintetiza la forma de onda a 24 kHz. El vocoder es compartido entre ambos idiomas, mientras que el modelo acústico contiene filas de hablante específicas por perfil de voz. El checkpoint parte del entrenamiento inglés "English Duo" de 42M y se adapta al eslovaco mediante el frontend fonético del proyecto, junto con ejemplos de Lili, SlovakSpeech y TrePal, más replay de datos ingleses para mitigar el olvido catastrófico.

El checkpoint publicado es el evaluado tras 2.200 pasos adicionales con voz eslovaca original. El perfil masculino eslovaco (`sk_muz`) usa la fila de hablante ajustada sobre SlovakSpeech Male. No se documentan en la información disponible detalles sobre número total de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz bilingüe inglés-eslovaco con los mismos pesos acústicos.
- Cinco perfiles de voz: dos en inglés (`en_hifi_92_clean`, `en_dt_0`) y tres en eslovaco (`sk_muz`, `sk_cori`, `sk_dailytalk`).
- Generación de audio a 24 kHz mediante vocoder BigVGAN.
- Frontend fonético específico para eslovaco incluido en `slovak-frontend.zip`.
- Exportación ONNX para inferencia en navegador (carpeta `web/`).
- Síntesis local mediante script `povedz.py` con parámetros de idioma y voz.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción ni tool calling.

## Casos de uso

- Generación de audiolibros y contenido narrado en inglés o eslovaco: el modelo permite sintetizar textos largos localmente con cinco voces distintas, útil para editoriales pequeñas o creadores que quieren evitar servicios cloud.
- Locución para vídeos y pódcasts: con perfiles masculinos y femeninos en ambos idiomas, se pueden producir pistas de voz para contenido multilingüe sin cambiar de modelo.
- Sistemas de accesibilidad en aplicaciones: integración del export ONNX en el navegador para leer contenido web en voz alta en inglés o eslovaco sin enviar texto a servidores externos.
- Asistentes de voz embebidos: el tamaño reducido (41,8M parámetros) permite desplegar el modelo en dispositivos con recursos limitados o en el edge.
- Prototipado de interfaces conversacionales: el script `povedz.py` y la demo web facilitan pruebas rápidas de TTS en pipelines de desarrollo.
- Investigación en TTS multilingüe: el modelo sirve como base para estudiar adaptación de un TTS inglés a un idioma de bajos recursos como el eslovaco con replay de datos.
- Dooblaje y previsualización de guiones: generación rápida de borradores de voz para validar ritmo y pronunciación antes de una grabación profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MOS, WER, MCD) en la información disponible. El autor sí reporta una evaluación cualitativa sobre 12 prompts eslovacos desafiantes: los perfiles Cori y DailyTalk produjeron 26 y 31 errores de transcripción respectivamente sobre 84 palabras cada uno. Estas cifras corresponden únicamente a los dos perfiles adaptados y no constituyen un benchmark formal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 41,8M parámetros en safetensors y un vocoder BigVGAN, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para el vocoder BigVGAN; también es viable en CPU para síntesis por lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: script Python del proyecto (`povedz.py`) con dependencias del proyecto y código fuente de NVIDIA BigVGAN; export ONNX en `web/` para inferencia en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| TTS English-Slovak by husto | 41,8M (acústico) | en, sk | no disponible | CC BY-SA 4.0 | safetensors, ONNX |
| VITS / MMS-TTS (Meta) | variable por idioma | multilingüe (incluye eslovaco en MMS) | no disponible | CC BY-NC 4.0 (MMS) | PyTorch |
| Piper TTS | variable (modelos pequeños) | multilingüe | no disponible | MIT (código), modelos variables | ONNX |
| Coqui XTTS v2 | ~467M | multilingüe (sin eslovaco) | no disponible | Coqui Public Model License | PyTorch |

La comparativa se limita a categorías generales; no se dispone de datos de rendimiento comparables publicados para este checkpoint frente a las alternativas.

## Limitaciones y advertencias

- El eslovaco está marcado como experimental por el propio autor; la calidad es inferior a la del inglés.
- En la evaluación del autor, los perfiles Cori y DailyTalk cometieron 26 y 31 errores de transcripción sobre 84 palabras en 12 prompts desafiantes, lo que indica una tasa de error elevada en eslovaco.
- Solo hay cinco perfiles de voz predefinidos; no se documenta clonación de voz ni control fino de prosodia o emoción.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, especialmente en eslovaco.
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- Los datos de entrenamiento incluyen corpus con licencias CC BY-SA 4.0 (SlovakSpeech), CC0 (Lili) y CC BY 4.0 (TrePal), cuyas condiciones deben respetarse en la redistribución.
- No se documentan sesgos específicos de género, acento o dialecto más allá de los perfiles disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Requiere instalar dependencias del proyecto y el código fuente de NVIDIA BigVGAN para la síntesis local, lo que añade complejidad de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmmhusto/TTS-English-Slovak-by-husto
- Modelo base English Duo: https://huggingface.co/mmmhusto/TTS-English-Duo
- Demo bilingüe: https://huggingface.co/spaces/mmmhusto/TTS-English-demo
- Dataset SlovakSpeech Male: https://huggingface.co/datasets/neurlang/slovakspeech_male_dataset
- Dataset SlovakSpeech Female: https://huggingface.co/datasets/neurlang/slovakspeech_female_dataset
- Dataset Lili: https://huggingface.co/datasets/vsisik/voice-dataset-lili
- Dataset TrePal: https://huggingface.co/datasets/streams-sro/trepal
