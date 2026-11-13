# 10X-Technologies/lyric-lite-v1-ta

## Resumen

Lyric Lite — Tamil es un modelo de síntesis de voz (text-to-speech) monolingüe para tamil, desarrollado por 10X Technologies. Se trata de la variante compacta de la familia Lyric, destilada a partir de Lyric Voice (336M parámetros) hasta un tercio de su tamaño, con 109,5 millones de parámetros y un repositorio de 0,4 GB. Su propuesta central es ejecutar TTS de calidad en dispositivos sin GPU y sin conexión a internet: móviles Android de gama baja, portátiles y ordenadores pequeños.

El modelo mantiene una precisión comparable a la de su predecesor (2,77 % de tasa de error de caracteres frente a 3,06 % en Lyric Voice) y opera a 3,2 veces más rápido que el tiempo real en un teléfono Android económico, y 2,0 veces más rápido que el tiempo real en un solo hilo de CPU. Genera audio a 24 kHz e incluye una voz predefinida llamada Ahana.

Es relevante ahora porque cubre un nicho poco atendido: TTS de calidad para una lengua del sur de la India con requisitos de despliegue muy bajos. La familia Lyric Lite se extiende además a telugu, hindi, malabar y canarés, lo que la convierte en una opción interesante para aplicaciones de accesibilidad, lectura de contenido y asistentes de voz en entornos con conectividad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz derivado por destilación de Lyric Voice) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto por frases y párrafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tamil (ta) |
| Licencia | Lyric Community License (license: other) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de audio | 24 kHz |
| Tamaño del repositorio | 0,4 GB (418 MB) |
| Modelo base | 10X-Technologies/lyric-voice-v1-ta |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que Lyric Lite se obtiene por destilación de Lyric Voice, un modelo de 336M parámetros, reduciéndolo a aproximadamente un tercio de su tamaño. El resultado es un modelo de 109,5M parámetros que conserva la precisión del modelo mayor según la evaluación del autor. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es la eficiencia en inferencia: el modelo está diseñado para ejecutarse en CPU, con una velocidad de 3,2 veces el tiempo real en un Android de gama baja y 2,0 veces el tiempo real en un solo hilo. La evaluación se realizó sobre 254 clips por modelo, con las mismas semillas, clip de voz y código, midiendo la tasa de error de caracteres y los fallos del modelo (palabras omitidas, finales cortados, estallidos y bucles). Lyric Lite registró un 0,0 % de fallos en los 254 clips evaluados.

## Capacidades

- Síntesis de voz monolingüe en tamil a partir de texto escrito en escritura tamil.
- Generación de audio a 24 kHz con la voz predefinida Ahana incluida en el repositorio.
- Manejo de habla cotidiana con palabras inglesas cuando estas se escriben en escritura tamil.
- Síntesis de texto largo: el script de inferencia divide el texto por `. ? !` y por comas en frases muy largas, lo que permite narrativa de formato largo (se muestran ejemplos de 45 segundos).
- Limpieza automática de caracteres invisibles provenientes de texto copiado de la web, con advertencia sobre caracteres que el modelo no puede pronunciar.
- Ejecución en CPU sin GPU y sin conexión a internet.
- No soporta inglés en caracteres latinos ni dígitos numéricos; los números deben escribirse como palabras.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en tamil para aplicaciones de accesibilidad: el modelo convierte artículos, noticias o documentos en audio a 24 kHz en el propio dispositivo, sin depender de la nube, lo que resulta adecuado para usuarios con discapacidad visual en entornos con conectividad limitada.
- Asistentes de voz sin conexión en móviles Android de gama baja: con 418 MB de pesos y 3,2 veces el tiempo real en un teléfono económico, puede integrarse en aplicaciones nativas que respondan a comandos o notificaciones sin consumir datos.
- Narrativa y audiolibros en tamil: el soporte de texto largo con división automática por puntuación permite generar pasajes de decenas de segundos de forma estable, como demuestra el ejemplo de 45 segundos incluido en la model card.
- Aplicaciones educativas para aprendizaje de tamil: la pronunciación consistente y la baja tasa de error de caracteres (2,77 %) permiten generar material de lectura y ejercicios de escucha en dispositivos escolares de bajo coste.
- Integración en sistemas de atención al cliente locales: al ejecutarse en CPU, puede desplegarse en servidores modestos o en el propio terminal para leer respuestas de chatbots en tamil sin latencia de red.
- Herramientas de productividad offline: lectura de correos, mensajes o notas en tamil en portátiles sin GPU, aprovechando la velocidad de 2,0 veces el tiempo real en un solo hilo.
- Prototipado e investigación en TTS de bajos recursos: el tamaño reducido y la licencia comunitaria facilitan experimentos de destilación, ajuste fino y evaluación en entornos académicos con hardware limitado.

## Benchmarks y rendimiento

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres, frases | 2,77 % | 3,06 % |
| Tasa de error de caracteres, párrafos de 17 frases | 3,3 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, estallidos, bucles) | 0,0 % (0 de 254 clips) | ver model card de Lyric Voice |
| Velocidad en CPU | 3,2× más rápido que Lyric Voice; 2,0× tiempo real en un hilo | referencia |
| Velocidad en Android de gama baja | 3,2× tiempo real | no disponible |
| Similitud de voz con Ahana | no disponible (texto truncado en la model card) | no disponible |

La evaluación se realizó sobre 254 clips por modelo, con las mismas semillas, clip de voz y código. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. Los pesos ocupan aproximadamente 420 MB.
- GPU recomendadas: no son necesarias. El modelo no requiere GPU y no se documentan requisitos de VRAM.
- Cabe en cualquier dispositivo con al menos ~500 MB de memoria libre, incluidos móviles Android de gama baja.
- Opciones de despliegue: el repositorio incluye `inference.py` y `requirements.txt`, con dependencia de la librería Pocket TTS instalada desde GitHub. Requiere Python 3.10 o superior. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 3,2 veces el tiempo real en un Android económico; 2,0 veces el tiempo real en un solo hilo de CPU. La primera ejecución carga unos 420 MB de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tamaño | CER | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Lyric Lite — Tamil | 109,5M | tamil | 418 MB | 2,77 % | Lyric Community License | CPU, on-device |
| Lyric Voice — Tamil | 336M | tamil | ~1,2 GB (aprox. 3× Lite) | 3,06 % | no disponible en la información | CPU/GPU |
| Lyric Lite — Telugu | no disponible | telugu | no disponible | no disponible | Lyric Community License | CPU, on-device |
| Lyric Lite — Hindi | no disponible | hindi | no disponible | no disponible | Lyric Community License | CPU, on-device |

La comparativa se limita a la propia familia Lyric, ya que la información proporcionada no incluye datos de modelos TTS de otros desarrolladores. Lyric Lite se posiciona como la opción de menor tamaño y mayor velocidad de la familia, con precisión ligeramente superior a la de Lyric Voice en el conjunto de evaluación.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta tamil. No procesa inglés en caracteres latinos ni otros idiomas.
- No soporta dígitos numéricos; los números deben escribirse como palabras.
- El texto sin puntuación debe dividirse manualmente antes de pasarlo al modelo; de lo contrario, la calidad puede degradarse.
- Riesgo de alucinación acústica: aunque el autor reporta 0,0 % de fallos en 254 clips, la evaluación es limitada y no cubre todos los dominios ni voces.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse presumiblemente con una voz concreta (Ahana), la diversidad de voces y acentos puede ser limitada.
- Licencia Lyric Community License: es una licencia "other" con nombre propio; es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones exactas de uso comercial antes de desplegarlo en producción.
- No se documentan requisitos de atribución ni cláusulas de redistribución en la información disponible.
- El modelo tiene muy pocas descargas (2) y ningún "like" en el momento de la consulta, lo que sugiere una adopción temprana y poca validación externa.
- La model card está truncada en la sección de evaluación (similitud de voz), por lo que no se dispone de esa métrica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-v1-ta
- Modelo base Lyric Voice — Tamil: https://huggingface.co/10X-Technologies/lyric-voice-v1-ta
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-v1-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-v1-hi
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-v1-ml
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-v1-kn
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/10X-Technologies/lyric-lite-v1-ta/blob/main/LICENSE
- Banner del modelo: https://huggingface.co/10X-Technologies/lyric-lite-v1-ta/resolve/main/assets/lyric-lite-banner.jpg
