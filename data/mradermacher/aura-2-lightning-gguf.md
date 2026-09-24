# mradermacher/Aura-2-Lightning-GGUF

## Resumen

Aura-2-Lightning-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo waveforce-ai/Aura-2-Lightning, publicado por mradermacher, un autor conocido por distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un transformer causal de 1.557.611.200 parametros (aproximadamente 1,56 mil millones), etiquetado por sus autores como "distilled" y "custom-architecture", lo que indica que no sigue una arquitectura estandar de familia conocida (Llama, Qwen, Mistral) sino una implementacion propia.

La relevancia de este repositorio es practica: convierte un modelo de 1,56 B de parametros en artefactos de entre 1,0 GB y 3,2 GB que caben en GPU de consumo e incluso en CPU con RAM moderada, con 12 variantes de cuantizacion disponibles (desde Q2_K hasta f16, incluyendo IQ4_XS). Esto permite desplegar el modelo en entornos sin aceleradores dedicados, algo habitual en prototipado, edge computing y experimentacion local.

El repositorio no incluye model card tecnica del autor original, ni datos de entrenamiento, ni resultados de benchmarks. La unica informacion disponible es la ficha de cuantizacion: idioma ingles, licencia Apache 2.0, pipeline de text-generation y arquitectura causal marcada como personalizada. Cualquier evaluacion seria de sus capacidades requiere consultar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con arquitectura personalizada (etiquetas "custom-architecture" y "causal-lm"); detalle interno no disponible |
| Parametros totales | 1.557.611.200 (aprox. 1,56 mil millones) |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en formato compatible con transformers/PyTorch |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican "custom-architecture", "causal-lm", "distilled" y "pytorch", lo que sugiere un transformer causal con decodificacion autorregresiva estandar, pero con una implementacion de capas propia que no corresponde a ninguna familia publica documentada. La etiqueta "distilled" apunta a que el modelo fue entrenado mediante destilacion de conocimiento a partir de un modelo mayor, practica habitual para obtener modelos pequenos con capacidades de razonamiento y generacion por encima de lo esperable en su rango de parametros.

El repositorio de mradermacher es exclusivamente una coleccion de cuantizaciones estaticas del modelo original. No hubo entrenamiento adicional, fine-tuning, RLHF ni DPO en esta publicacion: el autor aplica cuantizacion post-entrenamiento (PTQ) sobre los pesos de waveforce-ai/Aura-2-Lightning. Segun la propia model card del cuantizador, las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento, solo las estaticas.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado para la tarea text-generation en el pipeline de transformers, con vocabulario y entrenamiento orientados a ese idioma.
- Modelo causal de base instruida o cruda: al no existir model card del autor original, no se puede confirmar si el modelo base esta alineado para seguir instrucciones, si tiene formato de chat definido o si requiere prompting few-shot.
- Razonamiento y generacion de codigo: capacidad inferida por el rango de parametros y la etiqueta "distilled", pero sin evidencia publicada ni benchmarks que la cuantifiquen.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no; el modelo declara unicamente ingles en el campo de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Inferencia local en portatil o equipo de sobremesa: con la cuantizacion Q4_K_M (1,3 GB) o Q5_K_M (1,4 GB) el modelo se puede ejecutar integramente en CPU con llama.cpp u Ollama, sin necesidad de GPU, para tareas de generacion de texto en ingles con latencia aceptable.
- Prototipado rapido de pipelines de NLP: al ser un modelo de 1,56 B y poco mas de 1 GB cuantizado, sirve como componente de pruebas en aplicaciones de resumen, clasificacion o reescritura antes de comprometerse con un modelo mayor y mas costoso.
- Despliegue en dispositivos con recursos limitados: la variante Q4_K_S o Q2_K permite embeber el modelo en entornos con menos de 2 GB de memoria disponible, util en dispositivos edge o contenedores con presupuesto de RAM estricto.
- Evaluacion comparativa de arquitecturas personalizadas: investigadores que quieran estudiar el comportamiento de una arquitectura "custom" destilada de 1,5 B pueden descargar varias cuantizaciones y medir la degradacion de calidad entre Q2_K y f16 con sus propios conjuntos de validacion.
- Generacion de texto por lotes en servidor sin GPU: con vLLM u otro servidor compatible con GGUF, la cuantizacion Q8_0 (1,8 GB) permite alto throughput por unidad de memoria en tareas de generacion masiva de texto en ingles.
- Filtrado y preprocesado de datos: tareas auxiliares como etiquetado, limpieza de corpus o generacion de pares sinteticos para entrenar modelos mayores, donde la calidad absoluta importa menos que el coste por token.
- Educacion y experimentacion: como modelo pequeno para ensenar cuantizacion, formatos GGUF y despliegue local sin requerir hardware caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad, y tampoco se ha consultado la model card del modelo base, por lo que no es posible comparar su rendimiento con alternativas. No se deben extrapolar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente igual al tamano del fichero GGUF mas el coste de la cache KV. Para Q4_K_M (1,3 GB) se puede asumir en torno a 1,5-2,5 GB en funcion de la longitud de contexto efectiva; para f16 (3,2 GB) en torno a 4 GB. El contexto no esta documentado, por lo que el consumo de cache KV es indeterminado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). En modelos de este tamano, la ganancia de una A100 o H100 es marginal salvo por throughput en lotes grandes.
- Cabe en GPU de consumo: si, en todas las cuantizaciones, incluidas las de mayor tamano (f16, 3,2 GB). Tambien cabe en CPU con 4 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, llama-cpp-python, servidores compatibles con GGUF. La etiqueta "endpoints_compatible" del repositorio sugiere compatibilidad con los endpoints de HuggingFace. No se documenta soporte en vLLM o TGI para esta arquitectura personalizada, y dado que no es una arquitectura estandar, es probable que requiera llama.cpp.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la cuantizacion y de la arquitectura concreta, que no esta documentada.

## Comparativa con modelos similares

Comparativa orientativa con modelos abiertos de rango 1-2 B de parametros ampliamente usados. Los datos de los modelos alternativos proceden de sus fichas publicas; no se dispone de benchmarks de Aura-2-Lightning para una comparacion de rendimiento real.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible | Comentario |
|---|---|---|---|---|---|
| Aura-2-Lightning | 1,56 B | No disponible | Apache 2.0 | Si (este repositorio) | Arquitectura personalizada, solo ingles, sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Si | Multilingue, benchmarks publicos, ecosistema amplio |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Si | Restricciones de licencia para ciertos usos, solo ingles en la variante 1B |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | Si | Entrenado con foco en calidad por tamano, benchmarks publicos |

La ventaja principal de Aura-2-Lightning frente a estas alternativas es la licencia Apache 2.0 sin restricciones adicionales. La desventaja es la ausencia total de documentacion tecnica, benchmarks y definicion de contexto, lo que dificulta justificar su eleccion en produccion frente a opciones con rendimiento verificado.

## Limitaciones y advertencias

- Ausencia de model card del autor original: no se documentan datos de entrenamiento, composicion del dataset, tecnicas de alineacion ni hiperparametros. Esto impide auditar sesgos o reproducir el entrenamiento.
- Riesgo de alucinacion: no cuantificado. En modelos de 1,5 B destilados la tasa de alucinacion suele ser alta, especialmente en tareas factuales y de razonamiento multi-paso.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o representacion.
- Idioma: unicamente ingles. No hay evidencia de capacidades multilingues y no se recomienda su uso en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo ni estimar el consumo de cache KV.
- Rendimiento no verificado: no existen benchmarks publicados, por lo que cualquier afirmacion sobre su calidad frente a otros modelos es especulativa.
- Cuantizaciones de baja precision: Q2_K y Q3_K reducen notablemente la calidad respecto a Q4_K_M o superior. La propia model card advierte que Q3_K_M es de "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones "fast, recommended".
- Cuantizaciones ponderadas no disponibles: el autor indica que no ha publicado cuantizaciones con imatrix ni ponderadas, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- Restricciones de licencia: la licencia Apache 2.0 del repositorio de cuantizacion permite uso comercial, pero conviene verificar que el modelo base (waveforce-ai/Aura-2-Lightning) mantiene la misma licencia, ya que una discrepancia invalidaria esa asuncion.
- Arquitectura personalizada: al no ser una arquitectura estandar, puede no ser compatible con todos los motores de inferencia (vLLM, TGI, TensorRT-LLM) y requerir versiones concretas de llama.cpp.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Aura-2-Lightning-GGUF
- Modelo base: https://huggingface.co/waveforce-ai/Aura-2-Lightning
- Pagina de descarga y vision general del cuantizador: https://hf.tst.eu/model#Aura-2-Lightning-GGUF
- Solicitudes de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
