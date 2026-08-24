# AdamRoch/qwen3-0.6b-nfl-play-normalizer-v2-n-03125

## Resumen

Este repositorio contiene un adaptador QLoRA entrenado sobre el modelo base Qwen/Qwen3-0.6B, especializado en la normalización de jugadas de la NFL a partir de registros de la base de datos nflverse. El adaptador, denominado "N/8" dentro de una curva de eficiencia de datos SLM-8, fue entrenado durante una época con 3125 registros reales de las temporadas 2019 a 2022, y produce salidas JSON estructuradas que representan jugadas normalizadas.

El modelo resuelve el problema de transformar datos crudos de jugadas de fútbol americano en un formato estandarizado y legible por máquina, una tarea relevante para pipelines de análisis deportivo, generación de informes y sistemas de recomendación. Su interés radica en demostrar cómo un modelo pequeño (0.6B de parámetros) puede adaptarse a una tarea de dominio específico con un volumen reducido de datos, manteniendo una alta precisión en la salida estructurada.

El adaptador está publicado bajo licencia Apache 2.0, pesa aproximadamente 0.1 GB y se distribuye en formato PEFT (safetensors). No se proporcionan detalles sobre el contexto máximo, idiomas soportados ni cuantización base, aunque al tratarse de un adaptador QLoRA sobre Qwen3-0.6B, hereda las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen3-0.6B (transformer denso) |
| Parametros totales | 0.6B (modelo base) + adaptador (tamano no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (nivel de bits no especificado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-0.6B, un modelo de lenguaje denso de la familia Qwen3, que permanece congelado durante el entrenamiento. Se aplica QLoRA (Quantized Low-Rank Adaptation), una técnica que cuantiza el modelo base a baja precisión (típicamente 4 bits) e introduce matrices de bajo rango adaptables, reduciendo drásticamente el número de parámetros entrenables y los requisitos de memoria.

El entrenamiento se realizó durante una única época sobre 3125 registros reales de nflverse (temporadas 2019-2022), sin modificaciones sobre los datos originales. No se especifican hiperparámetros adicionales como tasa de aprendizaje, tamaño de lote o configuración de LoRA (r, alpha, dropout). El objetivo es que el modelo aprenda a transformar cada registro crudo en una salida JSON normalizada, probablemente con campos estandarizados para describir la jugada (equipo, tipo de jugada, yardas, etc.). No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares entrada-salida.

## Capacidades

- Normalización de jugadas de la NFL: convierte registros crudos de nflverse en objetos JSON estructurados, con campos estandarizados.
- Generación de JSON válido: en el set de descubrimiento, el 100% de las respuestas fueron JSON sintácticamente correcto.
- Precisión en datos de temporadas recientes: alcanzó 24/30 coincidencias exactas en un conjunto de 30 registros de 2023 (resultados de descubrimiento, no finales).
- Especialización en dominio deportivo: entrenado exclusivamente con datos de fútbol americano, por lo que su rendimiento en otras tareas es limitado.
- Inferencia eficiente: al ser un adaptador sobre un modelo de 0.6B, puede ejecutarse en hardware modesto, incluyendo CPU.

## Casos de uso

- Pipelines de análisis deportivo: integrar el modelo en un flujo que ingiera datos crudos de nflverse y produzca registros normalizados para alimentar dashboards o modelos estadísticos. Su salida JSON facilita la integración con herramientas como Pandas o bases de datos NoSQL.
- Generación de informes automáticos de partidos: a partir de los datos normalizados, se pueden generar resúmenes textuales o visualizaciones. El modelo asegura que los datos de entrada estén en un formato consistente.
- Enriquecimiento de bases de datos históricas: usar el adaptador para limpiar y estandarizar registros antiguos de la NFL, corrigiendo inconsistencias en los campos.
- Sistemas de recomendación de jugadas: normalizar jugadas para entrenar modelos de predicción de jugadas o para buscar patrones similares entre partidos.
- Automatización de tareas de anotación: en lugar de anotar manualmente jugadas, el modelo puede pre-rellenar campos JSON que luego un humano revisa, reduciendo tiempo de trabajo.
- Demostración de fine-tuning eficiente: sirve como caso de estudio para desarrolladores que quieran adaptar modelos pequeños a tareas de dominio específico con pocos datos y recursos limitados.

## Benchmarks y rendimiento

La model card reporta resultados sobre un conjunto de descubrimiento congelado de 30 registros de la temporada 2023. Estos resultados no deben considerarse como métricas finales de producción, sino como una indicación preliminar del rendimiento.

| Metrica | Resultado |
|---|---|
| Registros exactos (coincidencia completa) | 24/30 (80%) |
| Respuestas JSON validas | 30/30 (100%) |

No se proporcionan comparaciones con otros modelos ni métricas adicionales como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea concreta y no se ha evaluado en benchmarks generales.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador QLoRA sobre un modelo de 0.6B, la inferencia puede ejecutarse con menos de 1 GB de VRAM si se usa cuantización de 4 bits. En CPU, el modelo base ocupa aproximadamente 1.2 GB en precisión completa, pero con cuantización puede reducirse a ~0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto con el modelo base. Se puede usar con bibliotecas como Transformers + PEFT, o exportar a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido, se espera una latencia de decenas de milisegundos por petición en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores específicos para normalización de jugadas de la NFL. Como referencia, se compara con el modelo base sin adaptar y con un modelo general de tamaño similar.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 0.6B | no disponible | General | Apache 2.0 |
| AdamRoch/qwen3-0.6b-nfl-play-normalizer-v2-n-03125 | 0.6B + adaptador | no disponible | Normalizacion NFL | Apache 2.0 |
| Otros modelos SLM (p.ej. TinyLlama) | ~1.1B | no disponible | General | Apache 2.0 |

La comparativa es limitada porque no existen modelos públicos equivalentes para esta tarea específica. El adaptador ofrece la ventaja de un ajuste fino con muy pocos datos y un coste computacional mínimo, pero su rendimiento fuera del dominio deportivo es previsiblemente bajo.

## Limitaciones y advertencias

- Sesgos de datos: entrenado exclusivamente con registros de nflverse de 2019-2022, puede no generalizar bien a temporadas anteriores o posteriores, ni a otras ligas o formatos de datos.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar salidas incorrectas o inventar campos si la entrada es muy diferente a los datos de entrenamiento. Se recomienda validación humana en producción.
- Alcance limitado: no es un modelo de propósito general; su uso fuera de la normalización de jugadas de la NFL no está soportado.
- Resultados de descubrimiento: las métricas reportadas (24/30, 30/30) provienen de un conjunto de descubrimiento, no de una evaluación final independiente. El rendimiento en producción puede variar.
- Dependencia del modelo base: el adaptador requiere cargar Qwen3-0.6B en una revisión específica (c1899de289a04d12100db370d81485cdf75e47ca). Usar otra revisión puede degradar el rendimiento.
- Atribución de datos: los datos de entrenamiento provienen de nflverse bajo licencia CC BY 4.0, por lo que cualquier uso derivado debe incluir la atribución correspondiente.
- Sin soporte de tool calling ni agentes: el modelo no incorpora capacidades de función calling ni razonamiento multi-paso más allá de la tarea de normalización.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/AdamRoch/qwen3-0.6b-nfl-play-normalizer-v2-n-03125
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Adaptador previo (v1): https://huggingface.co/AdamRoch/qwen3-0.6b-nfl-play-normalizer-qlora
- Reporte tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Guia completa de Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
