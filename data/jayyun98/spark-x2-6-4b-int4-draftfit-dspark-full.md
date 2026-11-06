# jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark-Full

## Resumen

Spark-X2.6-4B-INT4-Draftfit-DSpark-Full es un modelo borrador (draft model) para decodificación especulativa, publicado por el usuario jayyun98 como artefacto de validación de la plataforma Draftfit. No es un modelo de propósito general: es un checkpoint de referencia diseñado para emparejarse con el modelo objetivo XHToken/Spark-X2.6-4B-INT4 y acelerar su generación mediante propuestas de tokens que el modelo grande verifica después.

El modelo declara 624.416.001 parámetros reales en safetensors, muy por debajo de los 4B del modelo objetivo al que acompaña, lo que es coherente con su función de borrador ligero. El repositorio ocupa 1,2 GB y almacena pesos en BF16 con normas en FP32; el sufijo INT4 del nombre hace referencia al requisito de que el objetivo esté cuantizado a INT4, no a que este borrador esté cuantizado.

Su relevancia es acotada pero específica: sirve como referencia reproducible para medir la tasa de aceptación de propuestas especulativas en Draftfit. La model card reporta un 39,80 % de propuestas aceptadas frente al 37,46 % del borrador fuente, medido con verificación greedy de prefijo sobre 24 prompts fijos. No hay datos publicados de velocidad en producción ni de paridad con kernels empaquetados nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificacion especulativa; clase `SparkDSpark`) |
| Parametros totales | 624.416.001 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos BF16 con normas FP32; requiere objetivo INT4 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del borrador. Se sabe que se carga mediante la clase `SparkDSpark(official_config())` definida en `spark_model.py`, incluido en el repositorio, y que requiere un adaptador de objetivo Spark compatible, con la revision del objetivo fijada en `config.json`. El modelo base declarado es XHToken/Spark-X2.6-4B-INT4, y el borrador se distribuye en BF16 con normas en FP32.

El entrenamiento se enmarca en Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificacion especulativa. No se especifican en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La validacion reportada usa verificacion greedy de prefijo con siete propuestas por paso y 64 tokens de salida sobre 24 prompts fijos (ocho de proposito general, ocho de codigo y ocho de matematicas), con una sola semilla y una particion ya inspeccionada empleada para seleccion de modelo.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: su funcion principal es proponer secuencias cortas que el modelo objetivo INT4 verifica y acepta o rechaza.
- Aceleracion de inferencia del objetivo XHToken/Spark-X2.6-4B-INT4 mediante verificacion de prefijo greedy.
- Cobertura de dominios evaluada en tres areas: proposito general, codigo y matematicas.
- Integracion con la plataforma Draftfit para construir, convertir y evaluar borradores.
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Soporte multilingue limitado al ingles (`en`).

## Casos de uso

- Evaluacion de borradores especulativos: sirve como referencia fija para comparar tasas de aceptacion de nuevos borradores entrenados con Draftfit sobre el mismo objetivo Spark-X2.6-4B-INT4, usando los 24 prompts de validacion documentados.
- Investigacion en decodificacion especulativa: permite reproducir el protocolo de verificacion greedy de prefijo (siete propuestas, 64 tokens de salida) y contrastar resultados con `metrics.json`.
- Desarrollo de integraciones personalizadas: al requerir integracion propia para vLLM, SGLang o MLX, es util como banco de pruebas para implementar el soporte del formato DSpark en esos motores.
- Validacion de pipelines de cuantizacion: dado que el borrador exige un objetivo INT4 con QDQ de activaciones dinamico en la referencia de compressed-tensors, sirve para comprobar la coherencia entre pesos cuantizados y borrador en BF16.
- Pruebas de regresion en CI de modelos: el conjunto fijo de prompts y la referencia solo-objetivo permiten detectar degradaciones en la aceptacion tras cambios en el borrador o en el objetivo.
- Experimentacion academica con presupuesto de VRAM reducido: con 624 millones de parametros y 1,2 GB de repositorio, el borrador se puede cargar en GPUs de gama media para estudiar el comportamiento de la verificacion sin desplegar el objetivo completo en configuraciones de prueba.

## Benchmarks y rendimiento

| Metrica | Borrador fuente | Este borrador |
|---|---:|---:|
| Propuestas aceptadas (verificacion greedy de prefijo, 7 propuestas, 64 tokens, 24 prompts) | 37,46 % | 39,80 % |

Condiciones de la medicion segun la model card: verificacion greedy de prefijo, siete propuestas por paso, 64 tokens de salida, 24 prompts fijos (ocho de proposito general, ocho de codigo, ocho de matematicas), aceptacion excluyendo tokens bonus del objetivo, una sola semilla y particion previamente inspeccionada usada para seleccion de modelo. Las salidas de validacion coinciden con la referencia fija solo-objetivo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de velocidad de servicio en produccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 624 millones de parametros en BF16 el peso ronda 1,25 GB, a lo que hay que sumar el objetivo INT4 de 4B y las estructuras de cache del decodificador especulativo.
- GPU recomendadas: no disponible; el modelo requiere integracion personalizada y no se documentan GPUs validadas.
- Cabe en GPU de consumo: previsiblemente si para el borrador aislado, dado su tamano; el requisito real lo marca el modelo objetivo de 4B en INT4.
- Opciones de despliegue: carga mediante `SparkDSpark(official_config())` de `spark_model.py` con un adaptador de objetivo Spark compatible; se indica explicitamente que requiere integracion personalizada para vLLM, SGLang o MLX.
- Latencia y throughput: no medidos. La model card senala que la paridad con kernels empaquetados nativos y la velocidad de servicio en produccion siguen sin medirse, y que la generacion con cache puede diferir de la evaluacion de prefijo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-INT4-Draftfit-DSpark-Full (este) | 624.416.001 | no disponible | Borrador especulativo para Spark-X2.6-4B-INT4 | apache-2.0 | Hugging Face, 0 descargas |
| Spark-X2.6-4B-Draftfit-DSpark (borrador fuente) | no disponible | no disponible | Borrador especulativo para el mismo objetivo | no disponible en la informacion | Hugging Face |
| XHToken/Spark-X2.6-4B-INT4 (objetivo) | 4B (nominal) | no disponible | Modelo objetivo cuantizado INT4 | no disponible en la informacion | Hugging Face |

No se dispone de datos de otros borradores especulativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe usarse para generacion directa ni para tareas de usuario final, solo como borrador de decodificacion especulativa.
- Requiere el objetivo XHToken/Spark-X2.6-4B-INT4 en INT4 y un adaptador Spark compatible; la revision del objetivo esta fijada en `config.json`.
- Integracion manual necesaria para vLLM, SGLang y MLX; no hay soporte nativo documentado.
- La validacion usa una sola semilla y una particion previamente inspeccionada para seleccion de modelo, lo que puede inflar la tasa de aceptacion reportada.
- La generacion con cache puede diferir de la evaluacion de prefijo completo; no se ha medido la paridad con kernels empaquetados nativos ni la velocidad real en produccion.
- Idioma limitado al ingles; sin soporte declarado de castellano.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un borrador, los errores se filtran por la verificacion del objetivo, pero afectan a la tasa de aceptacion y por tanto a la latencia.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y el objetivo pueden tener condiciones propias no detalladas aqui.
- Repositorio con 0 descargas y 0 likes: sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark-Full
- Modelo base / objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B-INT4
- Borrador fuente: https://huggingface.co/jayyun98/Spark-X2.6-4B-Draftfit-DSpark
- Repositorio Draftfit: https://github.com/JayYun98/Draftfit
- Metricas de validacion: https://huggingface.co/jayyun98/Spark-X2.6-4B-INT4-Draftfit-DSpark-Full/blob/main/metrics.json
