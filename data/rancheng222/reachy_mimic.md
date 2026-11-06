# rancheng222/reachy_mimic

## Resumen

Reachy Mimic es un modelo de generación de movimiento (text-to-motion) desarrollado por el usuario independiente rancheng222 para el robot de sobremesa Reachy Mini de Pollen Robotics. Convierte un prompt de texto en cualquier idioma en una trayectoria de 25 Hz que controla la pose de la cabeza (x, y, z, roll, pitch, yaw), ambas antenas y el giro del cuerpo, con un total de nueve canales de salida. El modelo tiene 15,3 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La particularidad del proyecto es su origen de datos: la mayor parte del entrenamiento proviene de 13.505 clips de movimiento retargetizados a partir de vídeos públicos de perros, gatos y loros, de modo que los gestos resultantes imitan el comportamiento animal en lugar de una cinemática robótica rígida. Emplea una arquitectura Transformer de flujo rectificado (rectified flow) con 8 capas y dimensión 384, y se apoya en el codificador de texto multilingüe congelado paraphrase-multilingual-mpnet-base-v2.

Es relevante ahora porque demuestra que un modelo de apenas 15 millones de parámetros, entrenado en 36 minutos en una única RTX 4090, puede ofrecer control direccional por lenguaje natural sobre un robot de bajo coste, con soporte para nueve idiomas y una integración directa con el SDK oficial de Reachy Mini mediante movimientos grabados a 50 Hz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow / conditional flow matching), 8 capas, d=384, 6 cabezas |
| Parametros totales | 15,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Secuencia de [token de condición + 64 tokens de texto + hasta 200 tokens de movimiento] |
| Tipos de cuantizacion | no disponible (pesos en `ema.pt`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | en, zh, ja, es, fr, de, ko, ru, ar (el codificador de texto cubre más de 50 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `ema.pt` (PyTorch), más `config.json`, `reachy_mimic.py` y ficheros de evaluación |

## Arquitectura y entrenamiento

El modelo es una red de velocidad de flujo rectificado condicional: un Transformer de 8 capas con dimensión 384 y 6 cabezas de atención que procesa una secuencia compuesta por un token de condición, 64 tokens de texto y hasta 200 tokens de movimiento. El texto se codifica con el modelo congelado `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, usando embeddings de token y un pooling medio enmascarado. La generación emplea guiado sin clasificador (classifier-free guidance) con valor por defecto 3,0 y 50 pasos de integración Euler, además de un embedding de longitud y condicionamiento opcional por prefijo de movimiento (`prefix=`) para continuación e improvisación.

El entrenamiento consistió en 18.000 pasos con batch de 64, optimizador AdamW, aumentación por espejo y deformación temporal (time-warp), y autoetiquetado direccional exacto en nueve idiomas, con subtítulos multilingües muestreados el 40 % del tiempo. Todo el proceso requirió 36 minutos en una única RTX 4090. Los datos suman 13.505 clips y 1.238 minutos: 10.101 clips animales verificados (perros y gatos con seguimiento de pose, loros con seguimiento de cabeza mediante Grounding-DINO, y líneas de tiempo de keyframes por VLM para material animado), 2.347 movimientos de la galería comunitaria, 370 esqueletos de perro de InterPet4D, 300 clips retargetizados de MotionHiFlow, 300 clips de keyframes generados por LLM y 87 movimientos de la librería oficial de emociones. Los subtítulos se generaron con `claude-haiku-5-5` a partir de hojas de contacto de 8 fotogramas y se tradujeron a 12 idiomas. El pipeline de entrenamiento proyecta cada clip y cada movimiento generado por un modelo de mundo MuJoCo (alcanzabilidad, autocolisión, velocidad articular), aunque esa comprobación no forma parte del módulo de inferencia.

## Capacidades

- Generación de movimiento de cabeza, antenas y cuerpo del robot Reachy Mini a partir de texto, con salida numpy de forma [T, 9] a 25 Hz.
- Control direccional por lenguaje natural: giro izquierda/derecha, mirada arriba/abajo, inclinación lateral, caída y alerta de antenas, inclinación adelante, sobresalto hacia atrás y giro del cuerpo.
- Soporte multilingüe de prompts en inglés, chino, japonés, español, francés, alemán, coreano, ruso y árabe.
- Conversión a `RecordedMove` del SDK oficial de Reachy Mini a 50 Hz, con remuestreo y suavizado de entrada y salida de la pose neutra para encadenar movimientos.
- Recorte de seguridad (safety clamp) de cada canal al envelope oficial del corpus de movimientos.
- Condicionamiento por prefijo de movimiento para continuación e improvisación sobre una trayectoria existente.
- Reproducibilidad mediante semilla (`seed`), con control de duración en segundos.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo especializado exclusivamente en texto a movimiento.

## Casos de uso

- Animación de gestos expresivos en demostraciones de robot: dado un prompt como "tilt head curiously to the left", el modelo genera una trayectoria de 4 segundos que se reproduce directamente con `ReachyMini().play_move(RecordedMove(...))`, útil para ferias y vídeos de producto.
- Interfaces de lenguaje natural para robótica de sobremesa: un usuario puede ordenar gestos en su idioma (español, francés, árabe, etc.) sin programar keyframes, gracias al codificador MPNet multilingüe.
- Generación de bibliotecas de movimientos reutilizables: los movimientos se exportan como JSON de `RecordedMove` y pueden almacenarse, versionarse y encadenarse en una base de datos de gestos para el robot.
- Prototipado rápido de comportamiento: con 36 minutos de entrenamiento en una RTX 4090 y 15,3 M de parámetros, el modelo se puede reentrenar o afinar para nuevos repertorios de gestos con coste mínimo.
- Investigación en retargeting de movimiento animal a robótica: el modelo sirve como referencia para estudiar cómo se transfieren movimientos de perros, gatos y loros a un robot de sobremesa con articulaciones limitadas.
- Continuación e improvisación de secuencias: mediante el condicionamiento por prefijo (`prefix=`), se puede generar una continuación coherente de un movimiento existente, útil para coreografías largas o interacciones reactivas.

## Benchmarks y rendimiento

Evaluación de control direccional: 13 pruebas de prompt (un canal y signo esperado cada una), 12 semillas, 9 idiomas, cfg 3,0 y reparación por modelo de mundo antes de puntuar. El azar se sitúa en 0,5.

| Version | Global | en | zh | ja | es | fr | de | ko | ru | ar |
|---|---|---|---|---|---|---|---|---|---|---|
| v4 | 0,51 | 0,67 | 0,53 | 0,51 | 0,53 | 0,48 | 0,44 | 0,47 | 0,48 | 0,51 |
| v5c | 0,63 | 0,71 | 0,61 | 0,56 | 0,61 | 0,68 | 0,62 | 0,62 | 0,60 | 0,63 |
| **v5b (este checkpoint)** | **0,69** | 0,71 | 0,66 | 0,65 | 0,71 | 0,72 | 0,71 | 0,68 | 0,71 | 0,72 |
| v6 (+ clips de loro sintetizados) | 0,61 | 0,63 | 0,56 | 0,58 | 0,63 | 0,67 | 0,62 | 0,62 | 0,59 | 0,60 |
| v7 (+ clips de loro rastreados) | 0,62 | 0,64 | 0,59 | 0,59 | 0,63 | 0,65 | 0,63 | 0,63 | 0,60 | 0,60 |

Resultados por prueba (media de 9 idiomas): girar izquierda 0,70, girar derecha 0,83, mirar arriba 0,50, mirar abajo 0,66, inclinar derecha 0,68, inclinar izquierda 0,81, caída de antenas 1,00 / 1,00, antenas alerta 0,38, inclinarse adelante 0,50, sobresalto hacia atrás 0,19, cuerpo izquierda 0,89, cuerpo derecha 0,90.

Prueba de ritmo (proporción de potencia en 1–4 Hz ≥ 0,25 en prompts de balanceo y cabeceo): 0,19 para este checkpoint y 0,36 para v7, que aprendió el cabeceo de loro pero perdió precisión direccional.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 1 GB; el checkpoint completo ocupa 0,1 GB en el repositorio, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte CUDA; el entrenamiento se realizó en una única RTX 4090 en 36 minutos. Funciona también en CPU, según indica el autor en el quick start.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: inferencia standalone mediante `reachy_mimic.py` (funciones `T2M`, `TextEnc`, `sample`, `Generator`, `to_recorded_move`), con dependencias de `torch`, `transformers`, `scipy`, `numpy` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; el modelo genera 50 pasos Euler por movimiento, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de text-to-motion en la información disponible. El modelo se apoya en `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` como codificador de texto congelado, pero no se ofrecen datos de rendimiento frente a alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Reachy Mimic (v5b) | 15,3 M | 64 tokens de texto + 200 de movimiento | Apache 2.0 | Hugging Face |
| Alternativas text-to-motion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prompts débiles: "look up", "alert antennas" y el sobresalto hacia atrás obtienen puntuaciones bajas (0,50, 0,38 y 0,19 respectivamente, frente a 0,5 del azar).
- La amplitud de roll es modesta porque la proyección de seguridad la reduce.
- El ritmo es limitado: solo el 19 % de la potencia cae en la banda de 1–4 Hz en prompts de balanceo y cabeceo, lo que produce movimientos menos orgánicos que la versión v7.
- La comprobación por modelo de mundo MuJoCo (alcanzabilidad, autocolisión, velocidad articular) no forma parte del módulo de inferencia; solo se aplicó en el pipeline de entrenamiento y en la evaluación.
- El modelo está especializado en el robot Reachy Mini y su envelope articular; no es transferible directamente a otros robots sin retargeting.
- No dispone de tool calling, agentes, visión ni audio.
- Riesgo de alucinación direccional: el control por prompt no es fiable para todas las direcciones, como muestran las puntuaciones cercanas al azar en varias pruebas.
- Sesgos de los datos: el repertorio está dominado por movimientos de perros, gatos y loros, y por movimientos de la galería comunitaria, lo que puede limitar la diversidad gestual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del codificador MPNet congelado, cuyos términos deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rancheng222/reachy_mimic
- Demo Space: https://huggingface.co/spaces/rancheng222/reachy_mimic
- Página del proyecto (pipeline de datos, gráficas, vídeos): https://huggingface.co/spaces/rancheng222/reachy_mimic_page
- Dataset: https://huggingface.co/datasets/rancheng222/reachy_mimic
- Codificador de texto base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Reachy Mini (Pollen Robotics): https://huggingface.co/pollen-robotics
