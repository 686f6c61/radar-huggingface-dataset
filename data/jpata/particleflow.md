# jpata/particleflow

## Resumen

ParticleFlow (MLPF) es un conjunto de modelos de aprendizaje automatico desarrollados por jpata para la reconstruccion de particulas en detectores de fisica de altas energias. El modelo toma como entrada las senales crudas del detector (pistas del tracker y depositos de energia en el calorimetro, o directamente los hits sin reconstruir) y produce como salida la lista de particulas reconstruidas, sustituyendo o complementando el pipeline tradicional de reconstruction basado en reglas heuristicas.

El repositorio, alojado en Hugging Face bajo el identificador `jpata/particleflow`, contiene checkpoints entrenados, configuraciones de inferencia, curvas de entrenamiento y resultados de evaluacion para multiples detectores: CMS, CLIC, CLD y ColliderML. La version mas reciente es la v3.3.0, publicada con checkpoints en el paso 100.000 de entrenamiento y dos variantes de arquitectura por detector (Attention y HEPTV2).

El modelo es relevante porque aborda uno de los cuellos de botella computacionales mas importantes de los experimentos de fisica de particulas: la reconstruccion de eventos. Al aprender directamente el mapeo de senales del detector a particulas, MLPF puede reducir el coste computacional y mejorar la resolucion en variables fisicas como la respuesta de jets o la energia transversa faltante (MET). El repositorio ocupa 44,4 GB e incluye pesos en formato `.pth` (PyTorch), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales para reconstruccion de particulas (variantes Attention y HEPTV2); detalles completos en la documentacion del proyecto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa eventos de detector) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch), con estado de optimizador para reanudar entrenamiento |

## Arquitectura y entrenamiento

El modelo implementa dos variantes de arquitectura por cada combinacion de detector y tipo de entrada: una basada en atencion (Attention) y otra denominada HEPTV2. Ambas se entrenan sobre representaciones de eventos de detector: en el caso de CLIC y CLD se ofrecen dos modos de entrada, uno con pistas y clusters de calorimetro ya reconstruidos y otro con hits crudos del tracker y del calorimetro. Para CMS se usan entradas de elementos PF, y para ColliderML se emplean pistas y clusters con condicion de pileup cero (PU0).

El entrenamiento sigue la receta v3.3.0, que utiliza un scheduler OneCycle y 100.000 pasos de optimizacion en todos los runs, con normalizacion de entrada para los modelos de track/cluster y CMS. Las curvas de entrenamiento se registran con media movil exponencial de semivida 2.000 pasos, y las funciones de perdida separan las escalas de los objetivos de track/cluster y de hits crudos. Todos los runs usan la semilla 12345. En CMS, los lotes globales son de 768 para el caso sin pileup y de 96 con pileup, y los pasos sin pileup representan el 55,6% de las actualizaciones del optimizador (frente al 90,9% en v3.2.0). El repositorio incluye el manifiesto de release con hashes de checkpoints, revisiones de entrenamiento y learning rates pico.

## Capacidades

- Reconstruccion de particulas a partir de entradas de detector: produce la lista de particulas reconstruidas (energia, momento, tipo) a partir de pistas, clusters o hits crudos.
- Reconstruccion end-to-end desde hits crudos: la variante de hits evita depender de la reconstruccion previa de tracks y clusters.
- Dos familias de arquitectura (Attention y HEPTV2) que permiten comparar estrategias de modelado sobre el mismo conjunto de datos.
- Soporte para multiples detectores: CMS, CLIC, CLD y ColliderML, cada uno con su esquema de datos y configuracion de inferencia.
- Evaluacion fisica integrada: el proyecto reporta metricas de F1 de particulas, respuesta de jets (IQR) y error de MET.
- Integracion con Key4HEP: cada run incluye un `inference-config.yaml` que se pasa como `--config` al evaluador de Key4HEP para entradas compatibles.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Reconstruccion de eventos en el experimento CMS: el checkpoint `cms/v3.3.0` con entradas de elementos PF permite reconstruir particulas en eventos con y sin pileup, usando lotes especificos para cada condicion.
- Reconstruccion en detectores CLIC y CLD a partir de pistas y clusters: los checkpoints `clic/clusters/v3.3.0` y `cld/clusters/v3.3.0` se usan cuando ya existe una reconstruccion de tracker y calorimetro y se quiere sustituir la capa de particulas.
- Reconstruccion end-to-end desde hits crudos: las variantes `clic/hits/v3.3.0` y `cld/hits/v3.3.0` permiten prescindir de la reconstruccion intermedia y aprender directamente el mapeo de hits a particulas, lo que es util para estudiar el impacto de eliminar etapas heuristicas.
- Estudios de respuesta de jets y MET: los modelos permiten medir la resolucion en la respuesta de jets (IQR) y el error en energia transversa faltante, metricas clave para analisis fisicos que dependen de la energia no visible.
- Benchmarking de estrategias de reconstruccion: al disponer de variantes Attention y HEPTV2 para el mismo detector y datos, se pueden comparar ambas arquitecturas bajo condiciones controladas (misma semilla, mismo numero de pasos).
- Prototipado en ColliderML con condiciones de pileup cero: el checkpoint `colliderml/clusters/v3.3.0` sirve como punto de partida para experimentos en un entorno simplificado antes de escalar a detectores reales.
- Evaluacion con Key4HEP: los checkpoints y sus `inference-config.yaml` se pueden cargar en el evaluador de Key4HEP para validar el modelo sobre entradas estandarizadas del ecosistema.

## Benchmarks y rendimiento

La model card reporta resultados de rendimiento fisico en forma de graficas (F1 de particulas, IQR de respuesta de jets y error de MET) para CLIC y CLD a lo largo del entrenamiento, pero no se proporcionan tablas numericas con valores concretos en la informacion disponible. Se indica cualitativamente que, en el paso 100k, la variante de hits HEPTV2 alcanza el F1 de particulas mas alto en ambos detectores, mientras que la variante de track/cluster HEPTV2 presenta la respuesta de jets mas estrecha. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 44,4 GB, pero ese tamano incluye multiples checkpoints, configuraciones, curvas y resultados de evaluacion, no un unico modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los pesos estan en formato `.pth` (PyTorch) y se cargan mediante el codigo del proyecto (documentacion en `jpata.github.io/particleflow`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. La comparacion interna posible es entre las dos variantes incluidas en el propio repositorio:

| Variante | Entradas | Detector | Paso | Arquitectura |
|---|---|---|---|---|
| Attention | Tracks + clusters | CLD | 100.000 | Atencion |
| HEPTV2 | Tracks + clusters | CLD | 100.000 | HEPTV2 |
| Attention | Hits crudos | CLIC | 100.000 | Atencion |
| HEPTV2 | Hits crudos | CLIC | 100.000 | HEPTV2 |
| Attention | PF elements | CMS | 100.000 | Atencion |
| HEPTV2 | PF elements | CMS | 100.000 | HEPTV2 |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, generacion de texto, tool calling ni agentes; cualquier uso fuera de la reconstruccion de particulas no esta soportado.
- Los resultados fisicos se presentan como graficas en la model card; no hay tablas numericas verificables en la informacion disponible, lo que dificulta la comparacion objetiva con otros metodos.
- Los checkpoints estan ligados a un esquema de datos concreto por detector; usar un checkpoint con entradas de otro detector o con un esquema incompatible producira resultados incorrectos.
- El modelo se entrena con semilla fija (12345) y una receta concreta (OneCycle, 100.000 pasos); no se documenta variabilidad entre semillas ni robustez fuera de esa configuracion.
- El repositorio incluye estado de optimizador y pesos en `.pth`, lo que implica dependencia de PyTorch y del codigo del proyecto; no hay formatos alternativos como safetensors o GGUF.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no opera sobre texto.
- El modelo no ha sido validado en produccion fuera del contexto de fisica de altas energias descrito; no hay informacion sobre latencia, throughput ni coste computacional de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jpata/particleflow
- Documentacion completa del proyecto: https://jpata.github.io/particleflow/
- Checkpoints CMS v3.3.0: https://huggingface.co/jpata/particleflow/tree/main/cms/v3.3.0
- Checkpoints CLIC clusters v3.3.0: https://huggingface.co/jpata/particleflow/tree/main/clic/clusters/v3.3.0
- Checkpoints CLIC hits v3.3.0: https://huggingface.co/jpata/particleflow/tree/main/clic/hits/v3.3.0
- Checkpoints CLD clusters v3.3.0: https://huggingface.co/jpata/particleflow/tree/main/cld/clusters/v3.3.0
- Checkpoints CLD hits v3.3.0: https://huggingface.co/jpata/particleflow/tree/main/cld/hits/v3.3.0
- Checkpoints ColliderML clusters v3.3.0: https://huggingface.co/jpata/particleflow/tree/main/colliderml/clusters/v3.3.0
- Manifiesto de release v3.3.0: https://huggingface.co/jpata/particleflow/blob/main/images/v3.3.0/release_manifest.json
- Escenario de entrenamiento de release: https://github.com/jpata/particleflow/blob/release-v3.3.0/configs/training/scenarios/release_checkpoints.yaml
- Repositorio de codigo en GitHub: https://github.com/jpata/particleflow
