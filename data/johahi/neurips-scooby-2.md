# johahi/neurips-scooby-2

## Resumen

`johahi/neurips-scooby-2` es un checkpoint de 348.963.973 parametros (aproximadamente 349 M) publicado por el usuario johahi en Hugging Face, con pesos en formato safetensors y un tamano de repositorio de 1,4 GB. Por el identificador y por los modelos hermanos del mismo autor (`johahi/neurips-scooby`, `johahi/borzoi-replicate-0` a `-3`, `johahi/flashzoi-*`), se trata de una variante del modelo genomicos scooby, presentado en Nature Methods en octubre de 2025.

scooby es, segun sus autores, el primer modelo capaz de predecir perfiles de cobertura de scRNA-seq y de insercion de scATAC-seq a lo largo del genoma con resolucion de celula unica, partiendo unicamente de la secuencia de ADN. Construye sobre Borzoi, un modelo de omica masiva ("bulk") que utiliza la cobertura de RNA-seq como representacion libre de anotacion de la regulacion genica. Es relevante para investigacion en genomica funcional porque permite priorizar variantes no codificantes y anotar regiones regulatorias sin depender de experimentos costosos.

La model card publicada no contiene mas informacion que la declaracion de licencia (`other`, con nombre `alphagenome-license`), y el repositorio no declara pipeline, idiomas ni resultados de evaluacion. Por tanto, esta ficha se apoya en los metadatos verificables del repositorio y en la literatura del modelo base; cualquier dato no documentado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de secuencia genomica derivado de scooby (que extiende Borzoi); la arquitectura exacta de este checkpoint no esta documentada en la informacion disponible |
| Parametros totales | 348.963.973 (~349 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ADN; la ventana de entrada no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica / no disponible (la entrada es secuencia de ADN, no texto) |
| Licencia | `other` con nombre `alphagenome-license` (archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Tarea declarada en HuggingFace | no disponible (pipeline sin especificar) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye una descripcion arquitectonica de este checkpoint concreto. Su linaje declarado es scooby, un modelo que construye sobre Borzoi: Borzoi es una red neuronal convolucional profunda con bloques residuales y convoluciones dilatadas que predice cobertura de RNA-seq a partir de secuencia de ADN, y scooby extiende ese planteamiento para producir predicciones multimodales (cobertura de scRNA-seq y perfil de insercion de scATAC-seq) a resolucion de celula unica. Cualquier detalle adicional sobre numero de capas, canales, atencion o funciones de perdida de este checkpoint debe consultarse en el paper y el repositorio de scooby, no en la model card.

Tampoco se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset (tipos celulares, tejidos, especies, ensayos), ni si hubo etapas de ajuste fino supervisado o preferencias. El sufijo `-2` y la existencia de los checkpoints `johahi/borzoi-replicate-0` a `-3` del mismo autor sugieren una replicas con distintas semillas de inicializacion, pero esto es una inferencia a partir de los nombres y no un dato confirmado. No se han publicado curvas de entrenamiento, ablaciones ni metricas de validacion en el repositorio.

## Capacidades

- Prediccion de cobertura de scRNA-seq a lo largo del genoma a partir de secuencia de ADN, con resolucion de celula unica (capacidad heredada de scooby, segun la literatura del modelo).
- Prediccion de perfiles de insercion de scATAC-seq, lo que aproxima accesibilidad de cromatina especifica de tipo celular.
- Modelado conjunto multimodal (transcripcion y accesibilidad) en una misma arquitectura, segun la descripcion del modelo base.
- Anotacion funcional de regiones genomicas sin necesidad de datos experimentales de cobertura.
- Potencial uso para priorizacion in silico de variantes, aunque no se documenta evaluacion especifica de este checkpoint en ese escenario.
- No soporta generacion de texto, razonamiento conversacional, codigo, matematicas, vision, audio, tool calling, function calling ni flujos de agentes multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multilingues (la entrada es secuencia nucleotidica) ni un modo "thinking".

## Casos de uso

- Priorizacion de variantes no codificantes en estudios GWAS: el modelo puede predecir el efecto de una variante sobre la cobertura de RNA-seq y la accesibilidad de cromatina en tipos celulares concretos, lo que ayuda a descartar variantes sin senal regulatoria antes de validarlas con ensayos reporteros.
- Anotacion de regiones regulatorias en genomas o ensamblajes recien secuenciados: al predecir perfiles multimodales desde la secuencia, permite generar hipotesis de elementos activos en tejidos sin datos publicos de scATAC-seq.
- Seleccion de tipos celulares para experimentos costosos: sirve para estimar de antemano en que linajes una region candidata se comporta como activa, reduciendo el numero de condiciones a probar en el laboratorio.
- Diseno y evaluacion in silico de ediciones CRISPR: se puede comparar la prediccion sobre la secuencia de referencia y sobre la secuencia editada para estimar el impacto regulatorio de una delecion o insercion no codificante.
- Analisis de robustez y ensembles de replicas: al existir varios checkpoints del mismo autor (`neurips-scooby`, `-2`, `borzoi-replicate-*`), este modelo puede usarse como miembro de un ensemble o para medir la varianza entre inicializaciones en predicciones regulatorias.
- Investigacion metodologica en modelos de secuencia: su tamano moderado (349 M parametros) y su naturaleza convolucional lo hacen util como linea base reproducible frente a modelos genomicos mas grandes en experimentos de ablacion.
- Docencia y prototipado en genomica computacional: permite ejecutar inferencia genomica completa en una unica GPU de consumo, algo inviable con modelos genomicos de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion, comparaciones con Borzoi o AlphaGenome, ni resultados de validacion en conjuntos de test. El paper de scooby en Nature Methods reporta la evaluacion del modelo original, pero no se ha proporcionado ningun valor numerico asociado a este checkpoint concreto, por lo que no se reproduce aqui ninguna cifra.

## Requisitos de hardware

- Pesos: 348.963.973 parametros implican aproximadamente 1,4 GB en FP32 (coincide con el tamano del repositorio), unos 0,7 GB en FP16/BF16 y unos 0,35 GB en INT8.
- La memoria de inferencia no estara dominada por los pesos sino por las activaciones: los modelos de secuencia genomica de tipo Borzoi procesan ventanas de ADN muy largas, por lo que el consumo depende linealmente de la longitud de entrada y del tamano de lote. Estimacion orientativa: entre 8 y 24 GB de VRAM para ventanas largas, y muy por debajo (4-8 GB) para fragmentos cortos.
- GPUs recomendadas: A100 (40/80 GB) o H100 para procesar genoma completo con lotes grandes y maximizar throughput; RTX 4090 (24 GB) como opcion de gama alta en estacion de trabajo.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), siempre que se ajusten la longitud de ventana y el lote a la memoria disponible.
- Opciones de despliegue: PyTorch con safetensors es la via natural, cargando el modelo con el codigo del repositorio `gagneurlab/scooby`. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje y no implementan esta arquitectura.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `johahi/neurips-scooby-2` (este) | 348.963.973 | no disponible | scRNA-seq + scATAC-seq mono-celula | alphagenome-license (`other`) | Hugging Face, safetensors |
| `johahi/neurips-scooby` | no disponible | no disponible | scooby (misma familia) | no disponible en la informacion | Hugging Face |
| `johahi/borzoi-replicate-0` a `-3` | no disponible | no disponible | Cobertura RNA-seq bulk (Borzoi) | no disponible en la informacion | Hugging Face |
| `johahi/flashzoi-*` | no disponible | no disponible | Variantes tipo Borzoi | no disponible en la informacion | Hugging Face |
| scooby (modelo original, gagneurlab) | no disponible | no disponible | scRNA-seq + scATAC-seq mono-celula | no disponible en la informacion | Paper + GitHub |

La comparacion cuantitativa con AlphaGenome u otros modelos genomicos de referencia no es posible con los datos suministrados: no se dispone de parametros, ventana de entrada ni metricas de ninguno de ellos en esta informacion.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas, lo que impide valorar su calidad predictiva antes de usarlo.
- Licencia restrictiva potencial: la licencia es `other` con nombre `alphagenome-license` y enlace a un archivo LICENSE. Es imprescindible revisar ese texto antes de cualquier uso comercial o de redistribucion; el nombre sugiere terminos heredados del ecosistema AlphaGenome, habitualmente con condiciones de atribucion y restricciones de uso.
- Checkpoint sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado. Debe tratarse como material de investigacion no contrastado, no como un artefacto listo para produccion.
- Riesgo de sesgo hacia los tipos celulares, tejidos y especies presentes en los datos de entrenamiento del modelo base. Al no estar documentados, no es posible acotar ese sesgo; las predicciones en linajes poco representados pueden ser poco fiables.
- Las predicciones genomicas son hipotesis computacionales: un perfil de accesibilidad o de expresion predicho no sustituye a la validacion experimental (ATAC-seq, RNA-seq, reporteros). Existe riesgo de generar resultados plausibles pero incorrectos, especialmente en regiones fuera de distribucion.
- Entrada limitada a secuencia de ADN: no procesa texto, no admite instrucciones en lenguaje natural y no dispone de tool calling ni de modo agente. No debe emplearse en casos de uso conversacionales.
- Sin cuantizaciones publicadas ni formatos alternativos: el despliegue depende de PyTorch y del codigo del repositorio original, lo que anade friccion operativa.
- Se desconoce la especie y el conjunto cromosomico para el que fue entrenado; conviene verificar que la codificacion de entrada (one-hot, tamano de ventana, padding) coincide con la esperada por el modelo base antes de ejecutar inferencia.
- Al no haber benchmarks publicados para este checkpoint, no es posible afirmar que iguale o supere al modelo scooby original ni a Borzoi en ninguna metrica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johahi/neurips-scooby-2
- Archivo de licencia del repositorio: https://huggingface.co/johahi/neurips-scooby-2/blob/main/LICENSE
- Paper de scooby en Nature Methods: https://www.nature.com/articles/s41592-025-02854-5
- Repositorio de codigo de scooby: https://github.com/gagneurlab/scooby
- Modelos etiquetados como borzoi en Hugging Face (incluye los checkpoints del mismo autor): https://huggingface.co/models?other=borzoi
