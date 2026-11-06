# RoboColosseum/droid-g0.5

## Resumen

G0.5 es un modelo vision-language-action (VLA) autorregresivo desarrollado por Galaxea para el control de robots de propósito general. El modelo recibe como entrada observaciones RGB multivista, un identificador de embodiment (plataforma robótica), una instrucción de tarea en lenguaje natural y el estado propioceptivo del robot, y genera en un único flujo autorregresivo tanto tokens de razonamiento como tokens de acción. Esto unifica en un solo modelo la interpretación de la escena, el razonamiento sobre la tarea y la emisión de comandos motores.

El modelo se distribuye con varios checkpoints especializados: base, LIBERO, DROID, SO-100/101 y RoboTwin 2.0, cada uno acompañado de sus pesos de tokenizador ActionCodec y estadísticas de normalización. Está publicado en Hugging Face bajo el identificador RoboColosseum/droid-g0.5, con un tamaño de repositorio de 57,7 GB y pesos en formato PyTorch (`model_state_dict.pt`).

La relevancia actual del modelo radica en su enfoque de "un solo flujo autorregresivo" para razonamiento y acción, junto con su entrenamiento sobre el dataset OpenGalaxea Galaxea-Open-World-Dataset y su soporte para múltiples plataformas robóticas (R1 Lite, R1 Pro, SO-100/101). Su licencia comunitaria no comercial condiciona fuertemente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) autorregresiva con ActionCodec para tokenización de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en PyTorch nativo) |
| Idiomas soportados | en, zh |
| Licencia | G0.5 Community License (no comercial + licencia de patente limitada); commits anteriores bajo Apache-2.0 y G0 PLUS |
| Formato de pesos | PyTorch (`model_state_dict.pt`, `model.pt`, `action_tokenizer.pt`) |

## Arquitectura y entrenamiento

G0.5 es un modelo autorregresivo que unifica en una sola secuencia de generación los tokens de razonamiento y los tokens de acción. Las acciones se representan mediante un tokenizador específico denominado ActionCodec, cuyos pesos se distribuyen junto a cada checkpoint (`action_tokenizer.pt`). El modelo condiciona su generación en cuatro modalidades de entrada: observaciones RGB multivista, un identificador de embodiment que permite adaptar el comportamiento a distintas plataformas robóticas, una instrucción de tarea en lenguaje natural y el estado propioceptivo del robot. Esta combinación permite que un mismo modelo base se especialice mediante fine-tuning en distintos entornos y robots.

El entrenamiento se apoya en el dataset OpenGalaxea Galaxea-Open-World-Dataset, aunque la información disponible no detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. Los checkpoints publicados (base, LIBERO, DROID, SO-100/101 y RoboTwin 2.0) sugieren un pipeline de preentrenamiento seguido de fine-tuning por benchmark o plataforma, con estadísticas de normalización específicas por checkpoint (`dataset_stats.json`).

## Capacidades

- Control robótico de manipulación de propósito general a partir de instrucciones en lenguaje natural.
- Percepción visual multivista mediante observaciones RGB.
- Generación de tokens de razonamiento antes de la emisión de acciones, en un flujo autorregresivo unificado.
- Tokenización y generación de acciones continuas mediante ActionCodec.
- Adaptación a múltiples embodiments mediante un identificador de plataforma (R1 Lite, R1 Pro, SO-100/101).
- Condicionamiento en el estado propioceptivo del robot.
- Soporte bilingüe inglés y chino.
- Checkpoints especializados para benchmarks y entornos: LIBERO, DROID y RoboTwin 2.0.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Manipulación robótica en laboratorio con plataformas R1 Lite o R1 Pro: el modelo recibe observaciones RGB multivista y el estado propioceptivo, y genera secuencias de acción condicionadas por una instrucción en lenguaje natural, lo que permite prototipar tareas de pick-and-place y ensamblaje sin diseñar controladores específicos.
- Evaluación comparativa en el benchmark LIBERO: el checkpoint `g05-libero` permite reproducir y comparar resultados de manipulación de propósito general frente a otros VLA, usando las estadísticas de normalización incluidas.
- Despliegue sobre el dataset DROID: el checkpoint `g05-droid` está orientado a tareas de manipulación en entornos diversos capturados con la plataforma DROID, útil para validar generalización entre escenas.
- Robótica de bajo coste con SO-100/101: el checkpoint específico permite controlar brazos robóticos de bajo coste, adecuado para docencia, investigación con presupuesto limitado y prototipado rápido.
- Simulación y transferencia con RoboTwin 2.0: el checkpoint `g05-robotwin20` permite entrenar y evaluar políticas en entornos simulados antes de trasladarlas a hardware real.
- Investigación en razonamiento previo a la acción: al generar tokens de razonamiento y de acción en un mismo flujo, el modelo es adecuado para estudiar cómo el razonamiento intermedio afecta a la calidad de las políticas motoras.
- Fine-tuning sobre dominios propios: el checkpoint base (`g05-base`) sirve como punto de partida para adaptar el modelo a nuevos robots o tareas con datos propios, reutilizando el tokenizador ActionCodec.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 57,7 GB e incluye varios checkpoints, por lo que el tamaño de un checkpoint individual no se puede deducir de la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: los scripts de despliegue y fine-tuning se encuentran en el repositorio GitHub del proyecto (OpenGalaxea/GalaxeaVLA); no se especifican frameworks de serving como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Galaxea G0.5 | VLA autorregresivo | no disponible | no disponible | G0.5 Community (no comercial) | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- La licencia G0.5 Community License es no comercial e incluye una licencia de patente limitada; el uso comercial requiere autorización expresa. Los materiales anteriores al 2026-06-16 están sujetos a G0 PLUS y los anteriores al 2026-01-04 a Apache-2.0, lo que exige verificar el commit concreto de cada artefacto.
- El modelo solo declara soporte para inglés y chino; el rendimiento en otros idiomas no está documentado.
- No se han publicado métricas de benchmarks, por lo que no es posible evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- No se detallan sesgos conocidos ni tasas de alucinación; en un VLA, los errores de razonamiento se traducen directamente en acciones físicas incorrectas, con riesgo para el hardware y el entorno.
- La ausencia de datos sobre longitud de contexto y requisitos de VRAM impide planificar el despliegue sin pruebas previas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación externa de la comunidad.
- El identificador del repositorio (RoboColosseum/droid-g0.5) no coincide con el nombre del proyecto (Galaxea G0.5), lo que puede generar confusión sobre la procedencia oficial de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/droid-g0.5
- Página del proyecto: https://opengalaxea.github.io/G05/
- Informe técnico (PDF): https://opengalaxea.github.io/G05/Galaxea_G0_5.pdf
- Vídeo de introducción: https://opengalaxea.github.io/G05/videos/introduction_g05.mp4
- Dataset: https://huggingface.co/datasets/OpenGalaxea/Galaxea-Open-World-Dataset
- Repositorio de código y despliegue: https://github.com/OpenGalaxea/GalaxeaVLA
- Commit de cambio a licencia G0 PLUS: https://github.com/OpenGalaxea/GalaxeaVLA/tree/38b31e4f732ef28719a5458a18e2836dd52f9d12
- Commit de cambio a licencia G0.5: https://github.com/OpenGalaxea/GalaxeaVLA/tree/dc0a1ef4531256adea4ee9f3d7d2fa44613cb866
