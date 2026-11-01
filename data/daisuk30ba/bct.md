# daisuk30ba/BCT

## Resumen

BCT (Bayes-Consistent Tempering) es un conjunto de checkpoints de investigación publicados por Daisuke Oba, Hiroki Furuta y Naoaki Okazaki para el artículo *BCT: Bayes-Consistent Tempering for Flow Language Models* (arXiv:2610.27641). No es un modelo de lenguaje generalista, sino una colección de pesos experimentales que implementan una variante de entrenamiento (tempered-flow training, TFT) sobre la arquitectura S-FLM (Language Modeling with Hyperspherical Flows), un modelo de lenguaje basado en flow matching sobre la esfera unitaria en lugar de difusión discreta o autoregresión clásica.

El repositorio contiene seis checkpoints organizados en dos tareas: TinyGSM (razonamiento aritmético, evaluado en GSM8K) y Sudoku-Hard (resolución de puzles). Para cada tarea se publican variantes con y sin el objetivo temperado, partiendo del mismo checkpoint base y con el mismo número de actualizaciones, de forma que la comparación aísle el efecto del objetivo de entrenamiento. Los checkpoints TFT incorporan parámetros adicionales de condicionamiento por temperatura y deben evaluarse con `model.temp_conditioning=True`.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar el resultado central del paper sobre modelos de flujo jerárquico-esférico, no está pensado como modelo listo para producción ni como asistente conversacional. El tamaño del repositorio (12,2 GB) corresponde a checkpoints completos de PyTorch Lightning con pesos, EMA, estado del optimizador y del scheduler.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre variedad hiperesférica (S-FLM), con backbones S-arch y DiT |
| Parametros totales | no disponible (no se especifica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en precisión completa de PyTorch) |
| Idiomas soportados | no disponible (entrenado en TinyGSM y Sudoku, sin cobertura lingüística declarada) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints completos de PyTorch Lightning (`.ckpt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos se construyen sobre S-FLM, que formula el modelado de lenguaje como un flujo continuo sobre la esfera unitaria (hyperspherical flow) en lugar de un proceso de difusión en espacio discreto. Se emplean dos backbones: S-arch (variante específica de S-FLM) y DiT (Diffusion Transformer). Los checkpoints de TinyGSM parten del S-FLM publicado y se afinan durante 2.000 actualizaciones; los de Sudoku-Hard se entrenan desde cero con la receta oficial de S-FLM durante 20.000 pasos y luego se afinan 2.000 actualizaciones más.

La innovación central es el *tempered-flow training* (TFT), un objetivo de entrenamiento condicionado por temperatura que busca consistencia bayesiana en el flujo. Los checkpoints `_cont` usan el objetivo original y los `_tft` el objetivo temperado, partiendo del mismo checkpoint y con idéntico número de actualizaciones para aislar el efecto. Los datos de entrenamiento son TinyGSM (licencia MIT, con el preprocesado de S-FLM) y puzles Sudoku-Hard generados con el generador oficial de S-FLM (semilla y split oficiales). No se documenta RLHF ni DPO.

## Capacidades

- Generación de trazas de razonamiento aritmético en el dominio TinyGSM, evaluables sobre GSM8K.
- Resolución de puzles Sudoku de dificultad alta.
- Entrenamiento con objetivo temperado condicionado por temperatura (solo checkpoints `_tft`).
- Evaluación con pesos EMA, tal como especifica S-FLM.
- Reanudación del entrenamiento gracias a que los checkpoints incluyen estado del optimizador, scheduler y schedule de ruido adaptativo.
- No se declaran capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Reproducción de resultados del paper: cargar los checkpoints `_cont` y `_tft` con el loader de S-FLM y comparar exactitud en GSM8K y Sudoku-Hard para verificar la mejora atribuida al objetivo temperado.
- Investigación en modelos de flujo: usar los checkpoints como punto de partida para estudiar variantes de temperado, schedules de ruido o arquitecturas backbone (S-arch frente a DiT).
- Ablación controlada de objetivos de entrenamiento: al compartir checkpoint inicial y número de actualizaciones, permiten aislar el efecto del objetivo sin confundirlo con el presupuesto de cómputo.
- Estudio de condicionamiento por temperatura: los checkpoints TFT incluyen parámetros adicionales que permiten analizar cómo varía la distribución generada al modificar la temperatura en inferencia.
- Fine-tuning sobre dominios de razonamiento acotado: partir de los pesos afinados en TinyGSM o Sudoku para tareas de lógica o aritmética con presupuestos de entrenamiento pequeños (2.000 actualizaciones).
- Docencia y divulgación: ilustrar en cursos de generative modeling la diferencia entre difusión discreta (MDLM), modelos duo y flujos hiperesféricos, usando los baselines del mismo repositorio de S-FLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura experimental (TinyGSM → GSM8K y Sudoku-Hard) y remite al paper arXiv:2610.27641 para las cifras, pero no incluye tablas de resultados en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (12,2 GB) incluye pesos, EMA, optimizador y scheduler, por lo que el peso efectivo del modelo es inferior pero no se desglosa.
- GPU recomendadas: no disponible. Al tratarse de checkpoints de investigación sin cuantizaciones publicadas, se requiere una GPU con suficiente memoria para cargar el checkpoint completo en PyTorch.
- Compatibilidad con GPU de consumo: no confirmada; depende del backbone (DiT tiny en Sudoku-Hard sugiere un modelo pequeño, pero no se especifica el número de parámetros).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La evaluación se realiza con el loader propio de S-FLM en PyTorch/PyTorch Lightning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| BCT (este repo) | S-FLM con objetivo temperado (S-arch / DiT) | TinyGSM, Sudoku-Hard | Apache-2.0 | HuggingFace `daisuk30ba/BCT` |
| S-FLM | Flujo hiperesférico, objetivo original | TinyGSM, Sudoku | Apache-2.0 | HuggingFace `jdeschena/s-flm` |
| MDLM | Difusión discreta enmascarada | TinyGSM | no disponible en la informacion proporcionada | Incluido en `jdeschena/s-flm` |
| Duo | Modelo duo (difusión discreta) | TinyGSM | no disponible en la informacion proporcionada | Incluido en `jdeschena/s-flm` |

La comparación relevante es frente a los baselines del propio paper, que comparten datos y receta; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado exclusivamente en TinyGSM y Sudoku-Hard, sin capacidades conversacionales ni cobertura multilingüe declarada.
- Los checkpoints contienen objetos Python serializados (config y tokenizer); deben cargarse solo con código de confianza y con `weights_only=False`, lo que supone un riesgo de seguridad si se usan pesos de origen no verificado.
- Los checkpoints `_tft` requieren activar `model.temp_conditioning=True`; evaluarlos sin esta opción produce resultados incorrectos.
- La evaluación debe hacerse con los pesos EMA, no con los pesos brutos, para ser comparable con los resultados del paper.
- Las rutas almacenadas en los checkpoints se han sustituido por `/path/to/bct/...`, por lo que la reanudación del entrenamiento requiere ajustar rutas.
- No se publican cuantizaciones, por lo que el despliegue en entornos con memoria limitada no está soportado de forma directa.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al operar en dominios acotados, los errores se manifiestan como trazas aritméticas o soluciones de Sudoku inválidas.
- Licencia Apache-2.0 permite uso comercial, pero los modelos derivan de S-FLM (también Apache-2.0); conviene conservar los avisos de atribución correspondientes.

## Enlaces

- HuggingFace: https://huggingface.co/daisuk30ba/BCT
- Modelo base S-FLM: https://huggingface.co/jdeschena/s-flm
- Paper: https://arxiv.org/abs/2610.27641
- Código: https://github.com/daioba/bct
- Blog del autor: https://daioba.github.io/bct/
- Página del autor: https://daioba.github.io/
- Dataset TinyGSM: https://huggingface.co/datasets/TinyGSM/TinyGSM
