# oddadmix/micro-voca-english

## Resumen

micro-voca-english es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por el usuario oddadmix, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo extremadamente compacto, con solo 2,29 millones de parámetros, entrenado desde cero sobre la arquitectura de tiny-voca (de Muhammed Nazeem) y pensado para ejecutarse íntegramente en CPU. Convierte texto en audio de 24 kHz e incluye el generador de forma de onda, por lo que no necesita un vocoder neuronal separado.

Su relevancia radica en la relación entre tamaño y prestaciones: con un peso de 9 MB en PyTorch y 12,4 MB en ONNX, alcanza una velocidad de aproximadamente 370 veces el tiempo real usando cuatro hilos de CPU, lo que lo hace apto para despliegues en dispositivos sin GPU, entornos embebidos o aplicaciones de escritorio. Ofrece ocho voces (cuatro estilos —assistant, news, story y promo— con una voz femenina y otra masculina cada uno) y está entrenado exclusivamente para inglés.

La ficha se basa únicamente en la información publicada en la model card del autor; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de predicción de duraciones, pausas, tono, sonoridad y energía, seguida de un sintetizador fuente-filtro (sin vocoder neuronal); pipeline tiny-voca con fonemizador dizione |
| Parametros totales | 2.289.163 (9 MB en PyTorch, 12,4 MB en ONNX) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime onnxruntime) y PyTorch |
| Anchura (canales / feed-forward / predictor) | 128 / 512 / 96 |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces | 8 (4 estilos x 2 géneros): a000, am6, nf2, nm2, sf1, sm3, pf4, pm2 |
| Velocidad en CPU | ~370x tiempo real con 4 hilos (ONNX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de tiny-voca: un fonemizador (dizione) transforma el texto en fonemas mediante un léxico derivado de CMUdict, un pequeño modelo neuronal G2P para palabras desconocidas, un modelo de homógrafos y reglas para números, fechas, importes y abreviaturas. A continuación, la red predice duraciones, pausas, tono, sonoridad y energía, y un sintetizador fuente-filtro genera la forma de onda directamente, sin vocoder neuronal independiente.

El entrenamiento se realizó desde cero sobre voces nuevas, reutilizando únicamente la arquitectura, el código de entrenamiento y el fonemizador originales de tiny-voca (todos Apache 2.0), con capas más estrechas. No se reutilizaron pesos de tiny-voca. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no disponible).

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio a 24 kHz.
- Ocho voces predefinidas en cuatro estilos (assistant, news, story, promo), con una voz femenina y otra masculina por estilo.
- Generación de forma de onda incluida: no requiere vocoder externo.
- Ejecución completa en CPU con onnxruntime, sin necesidad de GPU.
- Fonemización robusta: manejo de palabras desconocidas mediante G2P neuronal, homógrafos, números, fechas, importes y abreviaturas.
- No se documentan capacidades de clonación de voz, control emocional arbitrario, tool calling ni agentes (no disponible).
- Modelo monolingüe: solo inglés.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio o móviles sin GPU: el modelo cabe en 12,4 MB en ONNX y sintetiza a ~370x tiempo real en cuatro hilos de CPU, por lo que puede integrarse en un cliente ligero sin depender de servicios en la nube.
- Asistentes de voz locales para atención al cliente: la voz de estilo assistant (a000 o am6) permite generar respuestas habladas en conversaciones multi-turno con baja latencia en hardware modesto.
- Síntesis de boletines y noticias: los estilos news (nf2, nm2) están pensados para lectura de titulares y párrafos informativos, con una tasa de error de carácter del 0,7-0,9 % en el conjunto de test para nm2.
- Audiolibros y narración de cuentos: los estilos story (sf1, sm3) ofrecen una entonación adecuada para narración; sf1 alcanza un 0,0 % de CER en frases nuevas según la evaluación del autor.
- Anuncios y contenido promocional: los estilos promo (pf4, pm2) permiten generar locuciones comerciales breves de forma automatizada y a bajo coste.
- Accesibilidad y lectura de pantalla: el modelo puede convertir texto de interfaces o documentos en voz para usuarios con discapacidad visual, ejecutándose localmente y preservando la privacidad del contenido.
- Prototipado e investigación en TTS: al ser un modelo de 2,29 M de parámetros entrenado desde cero con código y fonemizador abiertos, sirve como base para experimentos de síntesis de voz de bajo coste y para estudiar el equilibrio entre tamaño y calidad.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Metrica | micro-voca-english | nano-voca-english (1,16 M) |
|---|---|---|
| CER validacion / test / frases nuevas | 1,9 % / 1,4 % / 0,7 % | 1,9 % / 1,5 % / 0,2 % |
| WER medio en conjuntos del Open TTS Leaderboard (voz a000) | 0,74 % | 0,87 % |
| UTMOS (voz a000) | 4,53 | 4,53 |
| DNSMOS P.808 (40 muestras) | 3,88 | 3,89 |
| Velocidad CPU, 4 hilos (ONNX) | ~370x tiempo real | ~407x tiempo real |

CER por voz en frases retenidas (validación / test / frases nuevas):

| Voz | Validacion | Test | Frases nuevas |
|---|---|---|---|
| a000 (assistant F) | 2,7 % | 4,5 % | 1,5 % |
| am6 (assistant M) | 3,2 % | 1,9 % | 0,8 % |
| nf2 (news F) | 3,6 % | 0,9 % | 0,8 % |
| nm2 (news M) | 1,9 % | 0,7 % | 0,6 % |
| sf1 (story F) | 1,3 % | 1,0 % | 0,0 % |
| sm3 (story M) | 1,5 % | 0,8 % | 0,8 % |
| pf4 (promo F) | 0,0 % | 0,9 % | 0,8 % |
| pm2 (promo M) | 0,2 % | 1,7 % | 0,8 % |

El autor indica que la evaluación con los conjuntos del Open TTS Leaderboard se ejecutó localmente y no es una entrada oficial del leaderboard. La tabla de resultados por conjunto (Seed-TTS, CV3, MiniMax, ZTTS2) aparece truncada en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo CPU; el modelo ONNX ocupa 12,4 MB en disco y su huella en memoria es mínima.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y no se documenta soporte GPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos, aunque la ejecución documentada es en CPU.
- Despliegue: onnxruntime (librería declarada), con pesos también en PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Rendimiento: ~370x tiempo real con 4 hilos de CPU en ONNX; la latencia absoluta no se detalla (no disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| micro-voca-english | 2,29 M | no disponible | en | Apache 2.0 | ONNX, PyTorch | ~370x tiempo real en CPU; 8 voces |
| nano-voca-english | 1,16 M | no disponible | en | no disponible en la informacion | ONNX, PyTorch | ~407x tiempo real; CER y UTMOS similares |
| tiny-voca | no disponible | no disponible | no disponible | Apache 2.0 | no disponible | Arquitectura base del modelo; autor Muhammed Nazeem |

No se dispone de datos de benchmarks comparativos con otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza inglés; no soporta castellano ni otros idiomas.
- Solo ocho voces predefinidas; no se documenta clonación de voz ni control fino de prosodia o emoción.
- Riesgo de errores de pronunciación en palabras fuera del léxico o en dominios especializados, aunque el G2P neuronal mitiga parte del problema.
- La evaluación con el Open TTS Leaderboard fue local y no oficial; los resultados pueden no ser directamente comparables con entradas oficiales del leaderboard.
- No se documentan sesgos específicos de género, acento o registro más allá de los ocho estilos disponibles (no disponible).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de las dependencias (dizione y tiny-voca, ambas Apache 2.0 según el autor).
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/micro-voca-english
- Demo: https://huggingface.co/spaces/oddadmix/micro-voca-english
- Modelo nano-voca-english: https://huggingface.co/oddadmix/nano-voca-english
- tiny-voca (modelo base): https://huggingface.co/n4ze3m/tiny-voca
- Repositorio tiny-voca: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Open TTS Leaderboard: https://huggingface.co/spaces/hf-audio/open_tts_leaderboard
- Código del Open TTS Leaderboard: https://github.com/huggingface/open-tts-leaderboard
