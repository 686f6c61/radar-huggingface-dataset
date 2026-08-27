# dvader13/smollm3-3b-traj-472b

## Resumen

Este repositorio contiene los checkpoints intermedios de la trayectoria de entrenamiento con aprendizaje por refuerzo (RL) del modelo SmolLM3-3B, correspondientes a la primera época (epoch 1) y a un pretraining de 472 mil millones de tokens. El autor, dvader13, publica 31 checkpoints en formato bf16, pensados exclusivamente para inferencia y para el estudio de la dinámica de entrenamiento. No se trata de un modelo final listo para producción, sino de una colección de estados intermedios que permiten analizar cómo evoluciona el comportamiento del modelo a lo largo del proceso de RL.

La relevancia de este repositorio radica en su utilidad para la investigación en interpretabilidad, análisis de convergencia y comprensión de los efectos del RL en modelos pequeños. Al estar basado en SmolLM3-3B, un modelo abierto de 3 mil millones de parámetros desarrollado por Hugging Face, estos checkpoints heredan las capacidades del modelo base (razonamiento, generación de código, soporte multilingüe) pero en distintas fases de optimización. El espaciado entre pasos se amplía progresivamente (20 pasos al inicio, luego 40, 80 y 120), lo que permite observar tanto cambios tempranos como tardíos en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3-3B (transformer decoder-only) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica en este repositorio) |
| Tipos de cuantizacion | bf16 (checkpoints en bf16, solo inferencia) |
| Idiomas soportados | no disponible (el modelo base soporta 6 idiomas segun fuentes externas) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica explicitamente) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a la trayectoria de RL del modelo SmolLM3-3B, que es un transformer decoder-only con 3 mil millones de parametros. El modelo base fue preentrenado con 11 billones de tokens segun la documentacion oficial de SmolLM3, y este repositorio se centra en la fase de RL posterior, con un presupuesto de 472 mil millones de tokens. El entrenamiento de RL se realizo durante una epoca, y se guardaron 31 checkpoints a intervalos que se amplian progresivamente: los primeros 20 pasos se guardan cada 20 iteraciones, luego cada 40, 80 y 120. Esto permite estudiar tanto la fase inicial de adaptacion como la convergencia final.

No se proporcionan detalles sobre el algoritmo de RL utilizado (PPO, GRPO, etc.) ni sobre la funcion de recompensa. Los checkpoints estan en bf16 y son de solo inferencia, lo que sugiere que no se incluyen estados de optimizador ni metadatos de entrenamiento adicionales. Esta configuracion es tipica para repositorios de investigacion que buscan compartir la evolucion del modelo sin el coste de almacenar todos los estados de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en SmolLM3-3B, los checkpoints heredan la capacidad de generar texto coherente y realizar razonamiento basico, aunque su rendimiento exacto depende del paso de entrenamiento.
- Generacion de codigo: el modelo base tiene soporte para tareas de programacion, por lo que los checkpoints pueden mostrar mejoras o regresiones en esta habilidad a lo largo del RL.
- Soporte multilingue: el modelo base soporta 6 idiomas (segun fuentes externas), aunque no se especifica cuales en este repositorio.
- Modo de razonamiento dual: segun la documentacion de SmolLM3, el modelo soporta un modo de razonamiento explicito, aunque no se detalla en este repositorio.
- Uso exclusivo para investigacion: estos checkpoints no estan pensados para despliegue en produccion, sino para analisis de trayectorias de entrenamiento, estudios de interpretabilidad y comparacion de fases de RL.

## Casos de uso

- Investigacion en interpretabilidad: los checkpoints permiten estudiar como cambian las activaciones internas y las representaciones del modelo a lo largo del RL, identificando en que paso emergen ciertas capacidades o sesgos.
- Analisis de convergencia: los investigadores pueden evaluar en que punto el modelo alcanza un rendimiento estable y si hay oscilaciones o sobreajuste durante el entrenamiento.
- Estudio de efectos del RL en modelos pequenos: al comparar los checkpoints con el modelo base, se puede medir el impacto del RL en tareas especificas como razonamiento, codigo o seguridad.
- Desarrollo de tecnicas de early stopping: los datos de la trayectoria pueden usarse para disenar criterios de parada temprana basados en el rendimiento en validacion.
- Benchmarking de metodos de RL: si se conoce el algoritmo utilizado, estos checkpoints sirven como referencia para comparar con otras tecnicas de optimizacion.
- Educacion y divulgacion: son utiles para demostrar visualmente como evoluciona un modelo durante el entrenamiento, por ejemplo en cursos de aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye metricas de evaluacion para los checkpoints, y no se dispone de datos comparativos con otros modelos. El rendimiento de cada checkpoint debe ser evaluado por el usuario si se desea, pero no hay cifras oficiales.

## Requisitos de hardware

- VRAM estimada: para inferencia con pesos bf16 de un modelo de 3B, se necesitan aproximadamente 6-8 GB de VRAM (considerando overhead de activaciones). Con cuantizacion a 8 bits o 4 bits, la demanda se reduce a 3-4 GB.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, o superior) es suficiente para inferencia basica. Para analisis de multiples checkpoints o procesamiento por lotes, se recomienda una GPU de 16 GB o mas (RTX 4090, A100, etc.).
- Compatibilidad con GPU de consumo: si, los checkpoints caben en GPUs de consumo modernas con cuantizacion ligera, aunque el formato bf16 nativo requiere mas memoria.
- Opciones de despliegue: al ser checkpoints de solo inferencia, se pueden cargar con librerias como Transformers, vLLM o llama.cpp (si se convierten a GGUF). No se recomienda su uso en produccion, pero para experimentacion local es viable.
- Latencia y throughput: no se dispone de datos especificos, pero para un modelo de 3B en una GPU moderna, la generacion suele ser de 20-50 tokens por segundo en bf16.

## Comparativa con modelos similares

Dado que este repositorio contiene checkpoints intermedios y no un modelo final, la comparativa debe hacerse con el modelo base SmolLM3-3B y alternativas de tamano similar. La siguiente tabla compara el modelo base con otros modelos de 3B conocidos, basandose en informacion publica.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | largo (no especificado) | Apache-2.0 | Entrenado con 11T tokens, soporta 6 idiomas |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 | Modelo propietario de Meta, requiere licencia |
| Qwen2.5 3B | 3B | 32K | Apache-2.0 | Modelo chino, buen rendimiento en codigo |
| Gemma 3 4B | 4B | 128K | Gemma | Modelo de Google, mas grande pero comparable en rendimiento |

Los checkpoints de este repositorio no tienen comparativa directa porque son estados intermedios, pero el modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en varios benchmarks segun la documentacion oficial.

## Limitaciones y advertencias

- Los checkpoints son intermedios y no representan un modelo final optimizado; pueden mostrar comportamientos erraticos o degradados en comparacion con el modelo base o con el modelo final de SmolLM3.
- No se proporciona informacion sobre el algoritmo de RL, la funcion de recompensa ni los datos utilizados, lo que limita la reproducibilidad de los resultados.
- El repositorio tiene 0 descargas y 0 likes, y el tamano del repo es 0.0 GB, lo que sugiere que puede estar vacio o que los archivos no se han subido correctamente. Se recomienda verificar la disponibilidad real de los checkpoints antes de usarlos.
- No hay garantia de que los checkpoints funcionen correctamente con las versiones actuales de las librerias de Hugging Face, ya que el repositorio fue creado en agosto de 2026 (fecha futura en el contexto actual).
- La licencia Apache-2.0 permite uso comercial, pero al ser checkpoints de investigacion, no se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva.
- No se especifican los idiomas soportados ni la longitud de contexto exacta, por lo que estos parametros deben inferirse del modelo base.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-472b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Modelo base SmolLM3-3B-Base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Repositorio GitHub de SmolLM3-3B (no oficial): https://github.com/ArkS0001/SmolLM3-3B
- Pagina de Ollama para SmolLM3: https://ollama.com/alibayram/smollm3
