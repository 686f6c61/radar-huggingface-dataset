# rlacombe/glycogen-dfm-50m-seed1

## Resumen

GlycoGen-DFM (50M, seed 1) es un checkpoint de PyTorch entrenado por Romain Lacombe (rlacombe) para la predicción de estructuras de glicanos a partir de datos de espectrometría de masas. Forma parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026, y se publica como peso convergido (`best_model.pt`) con inicialización aleatoria de semilla 1. No es un modelo de lenguaje: es un modelo generativo de dominio específico orientado a un problema de química analítica.

El modelo resuelve la tarea de inferir la estructura de un glicano (su secuencia de monosacáridos y enlaces) a partir de su espectro de masas, un problema clásico de glicómica computacional donde los métodos de búsqueda en bases de datos fallan ante estructuras no catalogadas. La innovación central es el uso de Discrete Flow Matching combinado con Crystallizing Flows, una formulación de generación discreta que permite muestrear estructuras de glicanos de forma iterativa y con alta precisión.

Con 50 millones de parámetros, el modelo reporta una precisión estructural top-1 del 92,67% ± 0,05% en el conjunto de test (n = 76.774, K=32, media de 3 semillas). Es relevante ahora porque demuestra que modelos generativos discretos de tamano moderado pueden igualar o superar enfoques de búsqueda tradicionales en un dominio científico especializado, y porque publica pesos, código de inferencia y particiones de benchmark de forma abierta bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Discrete Flow Matching con Crystallizing Flows (modelo generativo discreto, no transformer de lenguaje) |
| Parametros totales | 50M (aproximado, segun el nombre del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

La arquitectura se basa en Discrete Flow Matching, un marco de modelos generativos para espacios discretos que aprende una trayectoria de probabilidad entre una distribucion base y la distribucion objetivo mediante flujos continuos en el espacio de probabilidades simplex. Sobre esta base, el trabajo introduce Crystallizing Flows, una variante que, segun la model card, mejora la generacion de estructuras discretas. El modelo opera sobre representaciones de glicanos (secuencias de residuos y enlaces glicosidicos) condicionadas por espectros de masas.

El entrenamiento utiliza el conjunto de datos `rlacombe/candycrunch-v2-benchmark`, que incluye las particiones de entrenamiento, validacion y test del benchmark. La model card reporta resultados sobre un test de 76.774 muestras con K=32 pasos de muestreo y media de 3 semillas, lo que indica un protocolo de evaluacion con multiples ejecuciones para reducir varianza. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO, algo esperable dado que no es un modelo de lenguaje.

## Capacidades

- Prediccion de estructura de glicanos a partir de espectros de masas: genera la secuencia de monosacacaridos y los enlaces glicosidicos correspondientes.
- Generacion discreta mediante muestreo iterativo con Discrete Flow Matching (K=32 pasos en la evaluacion reportada).
- Modelado condicionado: la generacion se condiciona a la entrada espectral.
- Evaluacion estructural top-1 con metricas de precision sobre un benchmark amplio (n = 76.774).
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Anotacion de glicanos en glicomica por espectrometria de masas: el modelo predice la estructura directamente desde el espectro, lo que permite identificar glicanos no presentes en bases de datos de referencia y reducir la dependencia de busquedas por coincidencia espectral.
- Descubrimiento de estructuras noveles: al ser un modelo generativo, puede proponer estructuras candidatas para picos espectrales sin asignacion previa, escenario habitual en muestras biologicas complejas.
- Control de calidad en pipelines de glicoproteomica: integrado como paso de verificacion de asignaciones estructurales generadas por otros metodos, comparando la prediccion del modelo con la anotacion existente.
- Investigacion en biologia de glicanos: permite a grupos sin acceso a bases de datos propietarias obtener asignaciones estructurales con un modelo abierto de 50M de parametros y licencia MIT.
- Reproduccion de resultados cientificos: al publicarse pesos, codigo y particiones de benchmark, sirve para replicar y extender el trabajo de NeurIPS 2026 en entornos academicos.
- Desarrollo de herramientas de escritorio o servidor ligero: con 50M de parametros, el checkpoint puede desplegarse en CPU o GPU de gama baja para procesar lotes de espectros en laboratorios con recursos limitados.
- Generacion de datos sinteticos etiquetados: el modelo puede emplearse para aumentar conjuntos de entrenamiento de otros sistemas de anotacion de glicanos.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Precision estructural top-1 (test) | 92,67% ± 0,05% | n = 76.774, K=32, media de 3 semillas |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otras metricas no aplicables a este dominio). La unica metrica reportada es la precision estructural top-1 sobre el benchmark `candycrunch-v2-benchmark`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 50M de parametros en precision FP32 el checkpoint ocupa aproximadamente 200 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se puede ejecutar en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo (el repositorio de GitHub incluye scripts de inferencia); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del tamano del lote y del numero de pasos de muestreo (K=32 en la evaluacion reportada).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de estructura de glicanos ni resultados frente a alternativas como busquedas en bases de datos (p. ej. GlyTouCan) o enfoques de aprendizaje profundo previos. La model card solo reporta el resultado absoluto del propio modelo.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un modelo de lenguaje y no debe evaluarse con metricas de NLP ni usarse para tareas de texto general.
- Riesgo de error estructural: aunque la precision top-1 es del 92,67%, existe un porcentaje de predicciones incorrectas que en aplicaciones analiticas puede tener consecuencias; se recomienda validacion cruzada con metodos ortogonales.
- Dependencia de la distribucion de entrenamiento: el rendimiento puede degradarse en espectros de instrumentos, condiciones de ionizacion o tipos de glicanos poco representados en `candycrunch-v2-benchmark`.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo ni de calibracion de la incertidumbre.
- Idiomas: no aplica, pero tampoco se documenta soporte multilingue ni de otro tipo de entradas.
- Licencia MIT: permite uso comercial y modificacion con atribucion; aun asi, conviene revisar las condiciones de los datos de benchmark y de las dependencias del repositorio de codigo.
- Checkpoint unico de semilla 1: los resultados reportados son la media de 3 semillas, pero este repositorio contiene solo la semilla 1; para reproducir la media completa harian falta los otros checkpoints.
- Sin garantias de produccion: no se documentan pruebas de robustez, latencia ni comportamiento ante entradas malformadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycogen-dfm-50m-seed1
- Repositorio de codigo e inferencia: https://github.com/rlacombe/GlycoGen
- Pagina del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
- Paper: "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", Lacombe, R., NeurIPS 2026 (referencia bibliografica en la model card; no se proporciona URL directa)
