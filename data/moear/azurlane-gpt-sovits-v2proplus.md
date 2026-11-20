# Moear/AzurLane-GPT-SoVITS-v2ProPlus

## Resumen

AzurLane-GPT-SoVITS-v2ProPlus es un conjunto de pesos afinados (fine-tuning) del sistema de síntesis de voz GPT-SoVITS, publicado por el usuario Moear en Hugging Face. No se trata de un modelo de lenguaje generativo general, sino de un modelo de text-to-speech (TTS) especializado en clonar las voces de los personajes del videojuego Azur Lane. El modelo base es lj1995/GPT-SoVITS, sobre el que se ha realizado un fine-tuning con un dataset propio de voces del juego (Moear/AzurLane-Voice-20261118).

El repositorio ofrece dos familias de pesos: una versión "全角色" (todos los personajes) con 933 timbres vocales (912 en japonés y 21 en chino mandarín), y una versión "宿舍八人" (dormitorio de ocho) centrada en ocho personajes concretos. Cada familia incluye dos componentes: un checkpoint GPT (el modelo autorregresivo que genera los tokens acústicos) y un modelo SoVITS (el decodificador de voz). Los pesos por defecto ocupan aproximadamente 328 MB, aunque el repositorio completo alcanza los 5,1 GB por las múltiples rondas de entrenamiento disponibles.

La relevancia de este modelo radica en su carácter práctico: permite generar voces de personajes de Azur Lane en japonés y chino con un flujo de trabajo reproducible mediante el cliente Neiroha y el paquete portable de GPT-SoVITS para Windows. Es un caso de fine-tuning de TTS de nicho, orientado a doblaje amateur, modding y aplicaciones de voz para comunidades de fans, no a un uso comercial general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (componente GPT autorregresivo + decodificador SoVITS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ckpt y pth, sin cuantizaciones publicadas) |
| Idiomas soportados | japones (ja) y chino mandarin (zh) |
| Licencia | no disponible |
| Formato de pesos | .ckpt (GPT) y .pth (SoVITS) |

## Arquitectura y entrenamiento

El modelo se basa en GPT-SoVITS v2ProPlus, una arquitectura de síntesis de voz que combina un componente GPT autorregresivo, encargado de predecir tokens acústicos a partir de texto y de una referencia de voz, con un decodificador SoVITS que convierte esos tokens en forma de onda. El fine-tuning se ha realizado sobre el modelo base lj1995/GPT-SoVITS utilizando el dataset Moear/AzurLane-Voice-20261118, compuesto por muestras de voz de los personajes de Azur Lane.

El autor publica múltiples rondas de entrenamiento (epochs) para ambos componentes, lo que permite seleccionar combinaciones de checkpoint GPT y SoVITS según el compromiso entre similitud de timbre y estabilidad. La model card documenta una evaluación con métricas de similitud de voz (coseno medio de embedding de hablante) y de coincidencia de primer candidato, con pruebas cruzadas en japonés y chino. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de TTS.

## Capacidades

- Síntesis de voz (text-to-speech) con clonación de timbre a partir de una referencia de audio de 3 a 10 segundos.
- Soporte de 933 timbres vocales en la versión completa (912 en japonés, 21 en chino) y de 8 personajes en la versión dormitorio.
- Generación de voz en japonés y chino mandarín, con capacidad de síntesis cruzada entre ambos idiomas (referencia en un idioma y texto objetivo en otro).
- Cambio de personaje sin recargar pesos: basta con sustituir el audio de referencia, el texto de referencia y el idioma de referencia.
- Integración con el cliente Neiroha y con la interfaz web de GPT-SoVITS que soporte v2ProPlus.
- API local mediante servidor (por defecto en http://127.0.0.1:9880) con gestión de presets de modelo y selección de hablante.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; es exclusivamente un modelo de voz.

## Casos de uso

- Doblaje amateur de vídeos de Azur Lane: el modelo permite generar líneas de diálogo con la voz de un personaje concreto usando una referencia de audio corta, adecuado para creadores de contenido que quieran doblar escenas sin disponer de las actrices originales.
- Modding y fan games: integración en proyectos derivados del juego para dotar de voz a personajes en escenas nuevas, gracias a la disponibilidad de 933 timbres y a la API local del servidor GPT-SoVITS.
- Asistentes de voz temáticos: creación de un asistente conversacional con la voz de un personaje (por ejemplo, TB o Nagato) para comunidades de fans, usando el pipeline TTS como etapa final de un sistema de diálogo.
- Audiolibros y narración con voces de personajes: generación de narraciones en japonés o chino con timbres reconocibles del juego, aprovechando la capacidad de síntesis cruzada de idiomas.
- Pruebas de investigación en clonación de voz: el repositorio incluye comparativas por ronda de entrenamiento con métricas de similitud, útil como referencia para estudiar el efecto del número de epochs en la calidad del timbre.
- Localización de contenido: conversión de guiones escritos en chino a voz japonesa (o viceversa) manteniendo el timbre del personaje, útil para adaptar material entre las comunidades japonesa y china del juego.
- Generación de muestras de voz para prototipos de videojuegos: uso del modelo como fuente de voces placeholder en fases de preproducción antes de contar con actores reales.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar de TTS (MOS, WER), pero sí una evaluación de similitud de voz por combinación de checkpoints. Se muestran los resultados de la versión completa (8 timbres, 8 frases en japonés y 8 en chino) y de la versión dormitorio (24 frases en japonés y 8 en chino). El formato es "coseno medio / coincidencia de primer candidato".

| Combinacion (version completa) | Japones | Chino |
|---|---|---|
| v2ProPlus zero-shot (oficial) | 0,7708 / 6/8 | 0,7655 / 7/8 |
| GPT 5 + SoVITS 2 | 0,8265 / 7/8 | 0,7882 / 7/8 |
| GPT 10 + SoVITS 4 | 0,8374 / 6/8 | 0,8015 / 7/8 |
| GPT 12 + SoVITS 8 | 0,8442 / 7/8 | 0,8164 / 7/8 |
| GPT 14 + SoVITS 8 | 0,8355 / 7/8 | 0,8230 / 7/8 |
| GPT 15 + SoVITS 8 (por defecto) | 0,8369 / 6/8 | 0,8018 / 7/8 |

| Combinacion (version dormitorio) | Japones | Chino |
|---|---|---|
| v2ProPlus zero-shot (oficial) | 0,8372 / 20/24 | 0,8025 / 7/8 |
| GPT 10 + SoVITS 4 | 0,8732 / 24/24 | 0,8222 / 8/8 |
| GPT 15 + SoVITS 6 | 0,8714 / 24/24 | 0,8356 / 8/8 |
| GPT 15 + SoVITS 8 (por defecto) | 0,8653 / 23/24 | 0,8375 / 8/8 |
| GPT 5 + SoVITS 8 | 0,8679 / 22/24 | 0,8419 / 8/8 |

En la versión completa, la mejor media en japonés corresponde a GPT 12 + SoVITS 8 (0,8442) y la mejor en chino a GPT 14 + SoVITS 8 (0,8230). En la versión dormitorio, GPT 10 + SoVITS 4 logra la mejor media en japonés (0,8732) y GPT 5 + SoVITS 8 la mejor en chino (0,8419). El autor indica que las diferencias pequeñas deben validarse por escucha, prestando atención a dicción, entonación y pausas en frases largas. El entorno de prueba fue una RTX 6000D, con una tasa de tiempo real mediana de aproximadamente 0,25 para frases cortas con la combinación por defecto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos por defecto suman unos 328 MB, por lo que la inferencia es ligera comparada con LLM de gran tamaño.
- GPU recomendadas: el autor reporta pruebas en RTX 6000D; por el tamaño de los pesos, es razonable esperar que funcione en GPUs consumer, aunque no se confirma en la información disponible.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido de los checkpoints, pero no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: paquete portable GPT-SoVITS para Windows (con backend CUDA local y página de administración en navegador), cliente Neiroha, y la interfaz web de GPT-SoVITS que soporte v2ProPlus. El servidor expone una API local en el puerto 9880 por defecto.
- Latencia y throughput: tasa de tiempo real mediana de aproximadamente 0,25 (tiempo de síntesis dividido por duración del audio) en RTX 6000D para frases cortas con GPT 15 + SoVITS 8.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Timbres | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AzurLane-GPT-SoVITS-v2ProPlus | TTS fine-tuned (GPT-SoVITS) | ja, zh | 933 (version completa) / 8 (dormitorio) | no disponible | Hugging Face, 5,1 GB |
| GPT-SoVITS v2ProPlus (lj1995) | TTS base | multiidioma | clonación zero-shot | no disponible en esta ficha | modelo base del fine-tuning |
| Alternativas TTS comerciales o abiertas (XTTS, Bark, etc.) | TTS | varios | clonación / voces predefinidas | variable | no comparado en la información disponible |

La información proporcionada no incluye comparaciones directas con otros sistemas TTS, por lo que no es posible ofrecer cifras de rendimiento frente a alternativas. La comparación más relevante es con el propio modelo base v2ProPlus en modo zero-shot, frente al cual el fine-tuning mejora la similitud de voz en las métricas reportadas (por ejemplo, de 0,7708 a 0,8369 en japonés en la versión completa con la combinación por defecto).

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo está entrenado exclusivamente con voces de personajes de Azur Lane; su uso fuera de ese dominio no está validado.
- Solo soporta japonés y chino mandarín; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinación acústica y artefactos en frases largas o con puntuación compleja; el autor recomienda validar por escucha, especialmente dicción y pausas.
- La similitud de voz depende fuertemente de la calidad de la referencia (3 a 10 segundos de voz limpia) y de la coincidencia entre el texto de referencia y el audio.
- Posibles sesgos derivados del dataset de voces del juego: distribución desigual entre personajes (912 en japonés frente a 21 en chino) y dependencia de las grabaciones originales.
- El flujo de despliegue documentado está orientado a Windows con el paquete portable; no se detallan procedimientos para Linux o contenedores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- Uso de voces de personajes con derechos de autor: la generación de voz de personajes de un videojuego puede infringir derechos de propiedad intelectual o de imagen, según la jurisdicción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus
- Modelo base GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Dataset de voces: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118
- Pesos version completa (GPT 15): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/all-characters/s1/azur-lane-all-v2proplus-20261119-e15.ckpt
- Pesos version completa (SoVITS 8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/all-characters/s2/azur-lane-all-v2proplus-20261119_e8_s12712.pth
- Pesos version dormitorio (GPT 15): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/dorm8/s1/azur-lane-dorm-8-v2proplus-e15.ckpt
- Pesos version dormitorio (SoVITS 8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/dorm8/s2/azur-lane-dorm-8-v2proplus_e8_s1120.pth
- Preset version completa: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/neiroha-all-characters.zip
- Preset version dormitorio: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/neiroha-dorm8.zip
- Tabla de voces version completa: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/voices-all-characters.csv
- Tabla de voces version dormitorio: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/voices-dorm8.csv
- Comparativa de checkpoints: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/blob/main/metadata/checkpoint-comparison.md
- Resultados por frase (version completa): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/all-characters-comparison.json
- Resultados por frase (version dormitorio): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/dorm8-comparison.json
- Sumas SHA-256: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/SHA256SUMS
- Cliente Neiroha: https://github.com/Neiroha/Neiroha/releases
- Paquete portable GPT-SoVITS de Neiroha: https://github.com/Neiroha/Neiroha-GPT-SoVITS/releases/tag/V1.0.0
- Documentacion de configuracion Neiroha GPT-SoVITS: https://neiroha.github.io/workflow/providers/gpt-sovits
