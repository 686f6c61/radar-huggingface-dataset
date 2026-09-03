# mradermacher/WorldReward-qwen35-9b-i1-GGUF

## Resumen

WorldReward-qwen35-9b es un modelo de recompensa (reward model) y modelo del mundo (world model) de 9.000 millones de parametros, desarrollado por CodeGoat24 y cuantizado a formato GGUF por mradermacher. Esta disenado especificamente para tareas de generacion de video y control de camara, actuando como un sistema de evaluacion que puntua la calidad de secuencias generadas y modela la dinamica del entorno para guiar la captura visual.

La relevancia de este modelo radica en su doble funcion: por un lado, como reward model permite entrenar y refinar sistemas de generacion de video mediante aprendizaje por refuerzo; por otro, como world model ofrece una representacion interna de la dinamica de escenas que puede utilizarse para planificacion de movimientos de camara. La version GGUF con cuantizacion imatrix permite su ejecucion en hardware de consumo, lo que democratiza el acceso a esta tecnologia.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de produccion. Esta basado en la arquitectura Qwen3.5 y soporta exclusivamente el idioma ingles segun la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, variante no especificada) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix para cuantizacion personalizada) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5, aunque la informacion disponible no especifica si se trata de un transformer denso convencional o si incorpora alguna variante como mezcla de expertos (MoE). El modelo base es CodeGoat24/WorldReward-qwen35-9b, que ha sido cuantizado por mradermacher utilizando la tecnica imatrix (importance matrix), que mejora la calidad de la cuantizacion al ponderar la importancia de cada tensor durante el proceso de compresion.

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni tecnicas de alineacion especificas. Dado su proposito como reward model, es probable que haya sido entrenado con pares de preferencias humanas o metricas automaticas de calidad de video, pero estos datos no estan publicados en la documentacion disponible.

La cuantizacion imatrix de mradermacher incluye un archivo .imatrix.gguf que permite a los usuarios generar sus propias cuantizaciones personalizadas, lo que ofrece flexibilidad para ajustar el equilibrio entre tamano, velocidad y calidad segun las necesidades de cada despliegue.

## Capacidades

- Modelo de recompensa (reward model): puntua la calidad de secuencias de video generadas, util para entrenamiento por refuerzo de sistemas de generacion.
- Modelo del mundo (world model): representa la dinamica de escenas y entornos, permitiendo predecir estados futuros.
- Control de camara: capacidad para guiar movimientos de camara en generacion de video, probablemente mediante prediccion de trayectorias optimas.
- Generacion de video: aunque su funcion principal es evaluar y modelar, puede integrarse en pipelines de generacion como componente de guia o critica.
- Capacidades multimodales: al ser un modelo de vision, procesa informacion visual ademas de texto (los archivos mmproj estan disponibles en el repositorio estatico).
- Cuantizacion flexible: soporta multiples niveles de cuantizacion desde 2,8 GB hasta 7,5 GB, adaptandose a diferentes capacidades de hardware.

## Casos de uso

- Entrenamiento por refuerzo de modelos de generacion de video: utilizar el reward model para puntuar secuencias generadas y optimizar politicas de generacion mediante PPO u otros algoritmos de RL, aprovechando su capacidad para evaluar calidad visual y coherencia temporal.
- Planificacion de movimientos de camara en produccion cinematografica virtual: integrar el world model para simular y predecir el resultado de trayectorias de camara antes de ejecutarlas, reduciendo costes de produccion en entornos de renderizado en tiempo real.
- Evaluacion automatica de calidad de video generado: desplegar el modelo como componente de un pipeline de QA que puntue automaticamente la produccion de sistemas de video sintetico, sustituyendo o complementando la evaluacion humana.
- Desarrollo de agentes de robotica con navegacion visual: usar el world model para predecir la dinamica del entorno y planificar movimientos de camara o sensores en sistemas roboticos autonomos.
- Refinamiento de modelos de texto-a-video: emplear el reward model como funcion de recompensa en fine-tuning de modelos de generacion texto-a-video, mejorando la adherencia a las instrucciones del prompt.
- Investigacion en modelos del mundo: servir como base para experimentos academicos sobre representacion de dinamica de escenas, prediccion de estados futuros y planificacion basada en modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos sobre el rendimiento del modelo en tareas estandar como MMLU, HumanEval o metricas especificas de generacion de video (FVD, IS, CLIP score). Tampoco se dispone de comparaciones cuantitativas con otros reward models o world models.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3 GB (cuantizacion i1-IQ1_S, 2,8 GB) y 8 GB (cuantizacion i1-Q6_K, 7,5 GB), mas overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.) puede ejecutar las cuantizaciones mas pequeñas; para Q6_K se recomienda 12 GB o mas.
- Cabe en GPU de consumo: si, todas las cuantizaciones caben en hardware consumer, siendo las opciones Q4_K_M (5,7 GB) y Q4_K_S (5,5 GB) las recomendadas por equilibrio entre calidad y requisitos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para integraciones mas complejas, vLLM con soporte GGUF o conversion a safetensors.
- Latencia y throughput: no disponible, aunque al ser un modelo de 9B, se espera una velocidad de generacion de 20-40 tokens/s en GPU consumer con cuantizacion Q4.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. No existen datos publicos sobre otros reward models o world models de tamano similar (9B) con los que comparar parametros, contexto, rendimiento o licencia. La informacion disponible se limita a la ficha tecnica del modelo y su cuantizacion.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta ingles, lo que restringe su uso en aplicaciones multilingues.
- Informacion de entrenamiento no publicada: se desconocen los datos de entrenamiento, el proceso de alineacion y las metricas de evaluacion, lo que dificulta evaluar su fiabilidad y sesgos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir evaluaciones o predicciones incorrectas, especialmente en escenarios fuera de su distribucion de entrenamiento.
- Sesgos potenciales: al ser un reward model, puede perpetuar sesgos presentes en los datos de preferencias utilizados para su entrenamiento, afectando a la calidad de los sistemas que entrena.
- Modelo de vision: requiere archivos mmproj adicionales (disponibles en el repositorio estatico) para procesar entradas visuales; sin ellos, su funcionalidad se limita a texto.
- Cuantizaciones extremas: las cuantizaciones por debajo de Q4 (IQ1, IQ2, IQ3) pueden degradar significativamente la calidad del modelo y no se recomiendan para uso en produccion.
- Sin garantias de soporte: al ser un modelo cuantizado por un tercero (mradermacher), no hay garantia de mantenimiento ni soporte oficial por parte del desarrollador original.

## Enlaces

- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/WorldReward-qwen35-9b-i1-GGUF
- Repositorio GGUF (estatico): https://huggingface.co/mradermacher/WorldReward-qwen35-9b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/WorldReward-qwen35-9b
- Pagina de descargas del modelo: https://hf.tst.eu/model#WorldReward-qwen35-9b-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
