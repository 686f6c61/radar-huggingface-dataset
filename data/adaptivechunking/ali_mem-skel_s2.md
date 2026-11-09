# AdaptiveChunking/ali_mem-skel_s2

## Resumen

ali_mem-skel_s2 es un checkpoint de investigación publicado por el usuario AdaptiveChunking en Hugging Face. Se trata de un modelo de lenguaje a nivel de byte (byte-level) construido con el framework beetle-hnet, que implementa una arquitectura de tipo H-Net con chunking dinámico. El modelo se entrenó con la configuración `architecture=ali`, `objective=ratio`, `schedule=None`, `dechunk=ema` y semilla 2, durante 6000 pasos sobre secuencias de 1024 bytes con un batch de 32, en tres idiomas: inglés, turco y finés. El objetivo declarado del proyecto es la tokenización dinámica y el procesamiento byte a byte, no un asistente conversacional al uso.

Con 22.785.088 parámetros totales, el modelo es de escala muy reducida (del orden de decenas de millones de parámetros), lo que lo sitúa en la categoría de modelos de investigación para experimentación con tokenización y segmentación adaptativa, no para producción general. El repositorio ocupa 8,2 GB, un tamaño desproporcionado respecto a los parámetros, explicable por la presencia de múltiples ramas de checkpoint (`step-N`) con estado completo del entrenador (`training_state/checkpoint.pt`) en cada una.

La relevancia actual del modelo es limitada y acotada al ámbito de investigación: sirve como artefacto reproducible para estudiar H-Net, chunking dinámico y tokenización a nivel de byte, y para comparar variantes del framework beetle-hnet. No se han publicado resultados de benchmarks ni una model card orientada a uso práctico, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `architecture=ali`, procesamiento byte-level con chunking dinámico |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según datos de entrenamiento declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez, mapeados vía `config.json["tied_weights"]`), además de `training_state/checkpoint.pt` en formato PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, con la variante `architecture=ali` y el objetivo `objective=ratio`. Se trata de un modelo que opera directamente sobre bytes (byte-level) en lugar de sobre tokens de un vocabulario subword, e incorpora mecanismos de chunking dinámico: el modelo segmenta la secuencia de entrada de forma adaptativa durante el procesamiento. La configuración incluye `dechunk=ema`, un mecanismo de de-chunking basado en media móvil exponencial, y `schedule=None`, es decir, sin programación explícita de fases más allá de la lógica interna del framework.

El entrenamiento se realizó durante 6000 pasos con batch de 32 y secuencias de 1024 bytes, sobre un corpus en inglés, turco y finés. No se especifica en la información disponible el número total de tokens procesados, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias; dado el carácter de investigación y el tamaño del modelo, es razonable asumir que no las hubo, pero no se confirma. El repositorio conserva checkpoints intermedios en una programación logarítmica en base 2 (`step-0`, `step-1`, `step-2`, `step-4`, `step-6`, `step-8`, `step-16`, ..., hasta `2^k` y el paso final), junto con el estado reanudable del entrenador, lo que facilita la reproducibilidad y el análisis de la evolución del entrenamiento. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y, una vez finalizado el entrenamiento, las pruebas de frontera FLORES+ en `probe/`.

## Capacidades

- Procesamiento de texto a nivel de byte: el modelo trabaja sobre bytes crudos, sin vocabulario subword, lo que en principio le permite representar cualquier cadena de bytes, incluidos textos en idiomas no vistos.
- Chunking dinámico: segmentación adaptativa de la secuencia de entrada como parte del propio mecanismo del modelo.
- Modelado de lenguaje sobre los idiomas de entrenamiento (inglés, turco y finés), con posible transferencia limitada a otros idiomas por la naturaleza byte-level.
- Evaluación de fronteras de chunk mediante las pruebas FLORES+ incluidas en la rama `main`.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en tokenización byte-level: el modelo permite estudiar cómo un H-Net segmenta y procesa texto sin vocabulario subword, comparando variantes del framework beetle-hnet con la misma configuración y distintas semillas.
- Reproducción de experimentos de chunking dinámico: los checkpoints intermedios y el estado completo del entrenador permiten reanudar, analizar curvas de entrenamiento y comparar fases concretas del proceso.
- Análisis de fronteras de segmentación: las pruebas FLORES+ en `probe/` sirven para evaluar la calidad de las fronteras de chunk producidas por el modelo sobre textos multilingües.
- Estudio de multilingüismo en modelos byte-level: al haberse entrenado con inglés, turco y finés, permite analizar cómo un modelo de este tipo generaliza entre lenguas con morfología y ortografía distintas.
- Docencia y experimentación académica: su tamaño reducido (22,8 M de parámetros) y su licencia Apache 2.0 lo hacen apto para laboratorios con recursos limitados que quieran reproducir experimentos de arquitecturas H-Net.
- Base para ablaciones controladas: la estructura de ramas por paso y la semilla fija facilitan experimentos comparativos sobre objetivos, schedules y mecanismos de de-chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,8 M de parámetros, los pesos en fp32 ocuparían aproximadamente 91 MB y en fp16 unos 46 MB, aunque el repositorio completo ocupa 8,2 GB por los múltiples checkpoints y estados del entrenador.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna sería suficiente para cargar los pesos de un checkpoint individual.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el reducido número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch y `huggingface_hub` para descargar checkpoints concretos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: no está orientado a uso en producción ni a tareas conversacionales; no se documentan capacidades de instrucción, alineamiento o seguridad.
- Tamaño muy reducido (22,8 M de parámetros): su capacidad de modelado del lenguaje es limitada en comparación con modelos de escala moderna.
- Idiomas de entrenamiento restringidos a inglés, turco y finés; el rendimiento en otros idiomas no está evaluado.
- No se han publicado benchmarks, por lo que no es posible cuantificar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al entrenarse sobre un corpus no documentado, pueden persistir sesgos presentes en los datos.
- Longitud de contexto efectiva no documentada; el entrenamiento se realizó con secuencias de 1024 bytes, lo que sugiere un contexto corto.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto de investigación sin garantías, su uso en producción requeriría validación adicional.
- El repositorio incluye estados completos del entrenador (`checkpoint.pt`) cargados con `weights_only=False` en el ejemplo de la model card, lo que implica riesgos de seguridad al deserializar archivos pickle de origen no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-skel_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
