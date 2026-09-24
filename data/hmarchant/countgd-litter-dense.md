# hmarchant/countgd-litter-dense

## Resumen

CountGD++ Litter — dense fine-tune es un ajuste fino del modelo de conteo de objetos open-vocabulary CountGD++ (autor del ajuste: hmarchant; modelo base: niki-amini-naieni/CountGDPlusPlus), especializado en contar residuos y basura en fotografias, con enfasis en acumulaciones ilegales de densidad extrema. No es un modelo de lenguaje: es un contador visual que recibe una imagen y un prompt de texto (en este caso la palabra "litter") y devuelve el numero y la localizacion de los objetos que coinciden con esa descripcion.

El problema que resuelve es concreto: los contadores genericos fallan de forma catastrofica en escenas de vertido masivo. Segun la propia model card, en una comparativa de 48 imagenes el modelo sin ajustar contaba una media de 1,9 objetos, un fine-tune previo "dense-blind" contaba 33,6 y este ajuste denso alcanza 65,8. El ajuste se entreno sobre pseudo-etiquetas generadas por Meta SAM 3 (facebook/sam3) con una union de cuatro prompts y teselado 4x4 en las imagenes de densidad extrema marcadas manualmente.

Es relevante ahora porque demuestra un flujo de trabajo replicable de destilacion desde un modelo fundacional de segmentacion hacia un contador especializado, con backbone y codificador de texto congelados y solo la cabeza de deteccion entrenada (epoca 2). El checkpoint ocupa un repositorio de 0,9 GB y se distribuye como un unico archivo `countgd_litter_dense.pth`. La licencia es especifica de investigacion (`countgdplusplus-research`), lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contador de objetos open-vocabulary basado en CountGD++; backbone visual y codificador de texto BERT congelados, cabeza de deteccion ajustada. Detalle interno de capas: no disponible |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; el prompt de texto se limita a la etiqueta "litter") |
| Tipos de cuantizacion | No disponibles; se distribuye un unico checkpoint en punto flotante (.pth) |
| Idiomas soportados | No disponibles; el prompt de entrenamiento esta en ingles ("litter") |
| Licencia | `countgdplusplus-research` (licencia de investigacion, definida en https://github.com/niki-amini-naieni/CountGDPlusPlus) |
| Formato de pesos | PyTorch `.pth` (`torch.load` devuelve un diccionario con `model` (state_dict), `epoch`, `prompt` y `holdout`) |
| Prompt recomendado | `litter`, con umbral de confianza 0,23 |
| Epoca del checkpoint | 2 |

## Arquitectura y entrenamiento

El modelo parte de CountGD++ como base y congela tanto el backbone visual como el codificador de texto BERT. Solo se ajusta la cabeza de deteccion, entrenada con token focal loss mas L1/GIoU. Esto implica que la capacidad de alineacion texto-imagen procede integramente del modelo base y que el ajuste aporta un sesgo de dominio hacia escenas de residuos, en particular hacia densidades muy altas.

Las etiquetas de entrenamiento son pseudo-etiquetas generadas por Meta SAM 3 (facebook/sam3) usando la union de cuatro prompts ("litter", "trash", "garbage" y "discarded packaging"), con inferencia teselada 4x4 sobre las imagenes marcadas por revisores humanos como de densidad extrema. El teselado tiene un efecto medido importante: en esas escenas, el profesor teselado produce una media de 84 objetos frente a 25 sin teselar. El conjunto de entrenamiento final consta de 954 imagenes triadas manualmente, de las cuales 194 son de densidad extrema; el proceso de revision descarto 246 imagenes invalidas. El holdout es de 200 imagenes con estratificacion.

## Capacidades

- Conteo de objetos open-vocabulary guiado por prompt de texto: se le indica "litter" y devuelve el recuento de residuos en la imagen.
- Conteo en escenas de densidad extrema (vertidos ilegales, acumulaciones masivas), que es precisamente el caso donde los contadores genericos fallan.
- Localizacion de instancias, no solo recuento: el resultado procede de una cabeza de deteccion, por lo que se obtienen cajas/consultas asociadas a cada objeto contado.
- Uso con umbral de confianza ajustable; el valor recomendado por el autor es 0,23.
- Entrada restringida a imagenes fijas (el pipeline de referencia es un script de inferencia, `countgd_infer.py`), no video en streaming.
- Soporte de tool calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponibles; el unico prompt documentado esta en ingles.
- Capacidades especiales: ninguna adicional documentada (sin vision multimodal generativa, sin audio, sin modo thinking).

## Casos de uso

- Auditoria de vertederos ilegales desde fotografia aerea o de dron. El modelo esta entrenado especificamente sobre escenas de densidad extrema, de modo que un operador puede pasar un vuelo completo por el contador y obtener un recuento aproximado de residuos por zona, algo inviable manualmente en miles de imagenes.
- Priorizacion de rutas de limpieza municipal. Comparando recuentos entre ubicaciones y fechas se puede ordenar por volumen estimado donde enviar primero los equipos, usando el recuento como metrica objetiva en lugar de una valoracion subjetiva.
- Verificacion de resultados de limpieza (antes/despues). Al ser un contador y no un simple clasificador, permite cuantificar la reduccion de residuos entre dos capturas de la misma ubicacion y documentar el porcentaje de retirada.
- Monitorizacion de costas, riberas y entornos naturales. Las fotografias de litter en playas y margenes fluviales encajan con el dominio de entrenamiento; el modelo puede procesar lotes de imagenes de campanas de recogida de datos ciudadana.
- Generacion de evidencia para expedientes administrativos o sancionadores. La localizacion de instancias sobre la imagen permite adjuntar recuentos trazables a un informe, con la cautela de que se trata de pseudo-etiquetas y no de validacion humana.
- Investigacion sobre densidad de residuos y construccion de datasets. El propio flujo (profesor SAM 3 con teselado 4x4, destilacion a la cabeza de deteccion) es reutilizable para otros dominios de conteo: el modelo sirve como referencia metodologica y como etiquetador previo de grandes volumenes de imagen.
- Preetiquetado en pipelines de anotacion. Al devolver recuentos y localizaciones, se puede usar como primer paso para que anotadores humanos corrijan, reduciendo el coste frente a la anotacion desde cero.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados en la model card del autor. No se han publicado resultados de benchmarks estandar (COCO, FSC-147, MMLU u otros) en la informacion disponible.

Holdout estratificado de 200 imagenes:

| Metrica | Valor |
|---|---|
| MAE global de recuento | 10,9 |
| MAE en escenas densas | 51 → 17 |
| MAE en escenas normales | 9,5 |

Comparativa sobre 48 imagenes (recuento medio):

| Modelo | Recuento medio |
|---|---|
| CountGD++ sin ajustar | 1,9 |
| Fine-tune previo "dense-blind" | 33,6 |
| Este fine-tune denso | 65,8 |

Nota: el valor "MAE en escenas densas 51 → 17" se reproduce tal cual aparece en la model card; la informacion disponible no detalla la metodologia exacta de esa comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declaran parametros totales ni requisitos de memoria. Como referencia de tamano, el repositorio completo ocupa 0,9 GB, lo que acota el peso del checkpoint.
- GPU recomendadas: no especificadas por el autor. Al ser un modelo PyTorch con backbone visual, requiere una GPU con soporte CUDA; para procesar lotes grandes con teselado conviene una GPU de centro de datos (A100, H100) o una consumer de gama alta (RTX 4090 o superior).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; dado que el checkpoint pesa menos de 1 GB, es plausible que quepa en GPU de consumo, pero no hay cifras publicadas.
- Coste de inferencia adicional: el pipeline que genero las pseudo-etiquetas usa teselado 4x4, lo que implica 16 pasadas por imagen sobre las escenas densas. Es un multiplicador de computo relevante si se replica ese modo.
- Opciones de despliegue: PyTorch con el script `countgd_infer.py` del repositorio https://github.com/HugoMarchant/llitter-index. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). Conversion a ONNX o TensorRT: no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Recuento medio en 48 imagenes | Licencia | Disponibilidad |
|---|---|---|---|---|
| countgd-litter-dense (este modelo) | Fine-tune denso de CountGD++ | 65,8 | `countgdplusplus-research` | HuggingFace, 0 descargas |
| CountGD++ (base) | Contador open-vocabulary | 1,9 | La del proyecto CountGD++ | HuggingFace y GitHub |
| Fine-tune previo "dense-blind" | Fine-tune no especializado en densidad | 33,6 | No disponible | No disponible |
| Otros contadores open-vocabulary (CounTR, T-Rex2, DAVE, etc.) | Conteo visual | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye comparaciones con otros contadores open-vocabulary distintos de las variantes de CountGD++, por lo que no es posible establecer una comparativa de parametros, contexto ni rendimiento frente a alternativas externas.

## Limitaciones y advertencias

- La calidad de las etiquetas de entrenamiento depende de SAM 3 como profesor: los recuentos heredan sus errores. La propia model card indica que SAM 3 sigue subcontando en las acumulaciones mas densas.
- Regresion en imagenes cercanas al umbral de densidad: las escenas "casi densas" muestran una pequena perdida de precision respecto al modelo sin este ajuste.
- Techo de recuento: el numero de objetos esta limitado por el presupuesto de consultas de CountGD++, en torno a 900. Por encima de ese valor el recuento no es fiable.
- Sesgo de dominio: entrenado exclusivamente con escenas de residuos. No es un contador de objetos general y su uso fuera de ese dominio no esta validado.
- Conjunto de entrenamiento pequeno (954 imagenes efectivas) y de una sola epoca relevante (epoca 2), lo que limita la diversidad de condiciones de captura, iluminacion y geografia cubiertas.
- Riesgo de falsos positivos y negativos no cuantificado de forma independiente: las metricas publicadas son MAE de recuento, no precision/recall por instancia.
- Idioma: solo se documenta el prompt en ingles ("litter"). No hay evidencia de que otros idiomas funcionen.
- Licencia: `countgdplusplus-research` es una licencia de investigacion. No se declara permiso explicito de uso comercial; antes de cualquier despliegue en produccion hay que revisar los terminos en https://github.com/niki-amini-naieni/CountGDPlusPlus.
- Modelo sin traccion en la plataforma: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- No hay pipeline declarado en HuggingFace, ni idiomas, ni parametros publicados; la integracion requiere cargar manualmente el state_dict con `torch.load(..., weights_only=False)`, lo que implica ejecutar codigo de serializacion no seguro si la procedencia del archivo no es de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmarchant/countgd-litter-dense
- Modelo base: https://huggingface.co/niki-amini-naieni/CountGDPlusPlus
- Repositorio de CountGD++ y texto de la licencia: https://github.com/niki-amini-naieni/CountGDPlusPlus
- Repositorio de codigo con `countgd_infer.py` y `RESULTS.md`: https://github.com/HugoMarchant/llitter-index
- Profesor de pseudo-etiquetado, Meta SAM 3 (mencionado en la model card): https://huggingface.co/facebook/sam3
