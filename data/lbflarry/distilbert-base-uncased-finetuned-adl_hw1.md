# LBFLarry/distilbert-base-uncased-finetuned-adl_hw1

## Resumen

`LBFLarry/distilbert-base-uncased-finetuned-adl_hw1` es un ajuste fino de `distilbert/distilbert-base-uncased` publicado por el usuario LBFLarry en Hugging Face, orientado a clasificación de texto (`text-classification`) mediante la librería Transformers. Se trata de un artefacto de carácter académico: el identificador `adl_hw1` y la estructura de la model card (generada automáticamente por el `Trainer`) apuntan a un ejercicio de una asignatura de aprendizaje profundo, no a un modelo destinado a producción.

El modelo hereda la arquitectura DistilBERT: un transformer encoder destilado de BERT, con 6 capas, 768 dimensiones ocultas, 12 cabezas de atención y 66 millones de parámetros, más una cabeza de clasificación añadida durante el ajuste (67.068.822 parámetros totales según el archivo safetensors). La longitud de contexto es de 512 tokens, la habitual en la familia BERT.

Su relevancia actual es mínima como modelo funcional, pero es un caso ilustrativo de un fallo de entrenamiento frecuente: la model card declara `Accuracy: 0.0` en el conjunto de evaluación y `Loss: 1.5230` tras 15 épocas, con una pérdida de entrenamiento que cae hasta 0.0005. Es decir, el modelo sobreajusta el conjunto de entrenamiento pero no generaliza en absoluto, un patrón típico de desajuste entre las etiquetas del dataset y la configuración de la cabeza de clasificación, o de un conjunto de evaluación mal construido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base); 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 3072 dimensiones de feed-forward |
| Parametros totales | 67.068.822 (dato real del archivo safetensors, incluye la cabeza de clasificacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no se han publicado versiones cuantizadas; el modelo base admite cuantizacion dinamica int8 en PyTorch y conversion a ONNX |
| Idiomas soportados | no disponible en la model card; el modelo base esta preentrenado mayoritariamente con texto en ingles (Wikipedia + BookCorpus en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien compatible con PyTorch binario via `transformers`) |

Dato adicional: el repositorio ocupa 8,3 GB, un tamano anormalmente grande para un modelo de 67 millones de parametros (cuyos pesos en fp32 ocupan aproximadamente 268 MB). El motivo no se especifica en la informacion disponible; es probable que el repositorio incluya checkpoints intermedios de las 15 epocas o estados del optimizador, aunque esto no esta confirmado.

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT, un transformer encoder con atencion bidireccional completa, sin mecanismos de atencion lineal ni decodificacion especulativa. DistilBERT se obtiene mediante destilacion del conocimiento de BERT-base: el modelo alumno conserva aproximadamente el 60 % de los parametros del profesor (6 capas frente a 12) y, segun sus autores, retiene en torno al 97 % del rendimiento en tareas de comprension del lenguaje (GLUE) con una velocidad de inferencia unas 1,6 veces superior y un 40 % menos de parametros.

En cuanto al ajuste fino de esta publicacion concreta, la model card lo describe como un entrenamiento sobre "an unknown dataset" (dataset desconocido). Los hiperparametros registrados son: tasa de aprendizaje 2e-05, `train_batch_size` y `eval_batch_size` de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal y 15 epocas completas (14.070 pasos). No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo coherente con la tarea de clasificacion y con el caracter academico del artefacto. Tampoco se documenta la composicion del dataset, el numero de tokens de entrenamiento ni el numero de clases de salida.

El resultado del entrenamiento es llamativo desde el punto de vista tecnico: la perdida de entrenamiento desciende de 4,2212 (epoca 1) a 0,0005 (epocas 14 y 15), mientras que la perdida de validacion toca minimo en la epoca 5 (0,1794) y repunta despues hasta 0,2389 en la epoca 15. La exactitud se mantiene en 0,0 durante las 15 epocas. Ese patron (sobreajuste severo acompanado de exactitud nula) es incompatible con un clasificador funcional bien calibrado.

## Capacidades

- Generacion de texto: no. Es un modelo exclusivamente de clasificacion (`text-classification`), no dispone de cabeza de lenguaje.
- Razonamiento, matematicas y codigo: no disponible; no hay evidencia de ninguna de estas capacidades y la arquitectura no esta disenada para ellas.
- Clasificacion de secuencias: es su unica funcion prevista, con una cabeza sobre la representacion del token `[CLS]`. El numero de clases y sus etiquetas no estan documentados.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no acreditadas. El modelo base esta preentrenado casi exclusivamente en ingles.
- Capacidad especial (thinking mode, vision, audio): ninguna.
- Rendimiento medido: exactitud 0,0 en el conjunto de evaluacion declarado por el propio autor, por lo que no se puede atribuir ninguna capacidad predictiva fiable al modelo en su estado actual.

## Casos de uso

Los casos siguientes describen usos plausibles para un DistilBERT ajustado correctamente para clasificacion. **Tal como esta publicado, este checkpoint no es apto para ninguno de ellos**, dado que su exactitud declarada es 0,0; se listan como referencia de lo que habria que reparar o reentrenar antes de utilizarlo.

- Clasificacion de tickets de soporte: un DistilBERT ajustado con etiquetas de categoria o prioridad se ejecutaria en CPU con latencias de milisegundos por debajo de los 512 tokens, lo que permitiria enrutar decenas de miles de tickets al dia sin GPU. Este checkpoint concreto necesitaria primero corregir el mapeo de etiquetas y reentrenar.
- Moderacion de contenido en linea: al ser un modelo de 67 millones de parametros y 268 MB en fp32, puede desplegarse embebido junto al servicio de publicacion para clasificar texto antes de almacenarlo, con coste de memoria despreciable.
- Analisis de sentimiento en resenas de producto: tarea canonica de DistilBERT (la version de referencia ajustada para SST-2 es el punto de comparacion habitual). Requiere un ajuste con etiquetas balanceadas y una particion de validacion bien construida.
- Etiquetado de grandes volumenes de texto para preentrenamiento de otros modelos: se puede usar como clasificador rapido de calidad o tematica sobre corpus masivos, filtrando documentos antes de pasarlos a un modelo mayor.
- Extraccion de embeddings para busqueda semantica o agrupamiento: el cuerpo del transformer, sin la cabeza de clasificacion, produce representaciones de 768 dimensiones que sirven para similitud coseno o clustering de documentos.
- Deteccion de spam o fraude textual en formularios: clasificacion binaria con umbral ajustable, integrable en el backend mediante `text-embeddings-inference` (etiqueta declarada en el repositorio) o mediante un endpoint HTTP de Hugging Face.
- Clasificacion de intenciones en asistentes conversacionales: permitiria un enrutado previo rapido antes de invocar un modelo generativo mayor, reduciendo coste por consulta.
- Ejercicio docente de puesta en produccion: el propio artefacto, con su model card autogenerada y su exactitud nula, sirve como caso practico para diagnosticar fallos de entrenamiento (desbalanceo extremo de clases, etiquetas mal mapeadas, `num_labels` incorrecto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, GLUE, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El campo `model-index` de la model card contiene una lista de resultados vacia. Lo unico documentado son las metricas de entrenamiento y evaluacion del propio ajuste:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Exactitud |
|---|---|---|---|---|
| 1.0 | 938 | 4.2212 | 1.5230 | 0.0 |
| 2.0 | 1876 | 0.9543 | 0.3586 | 0.0 |
| 3.0 | 2814 | 0.1742 | 0.1901 | 0.0 |
| 4.0 | 3752 | 0.0520 | 0.1801 | 0.0 |
| 5.0 | 4690 | 0.0240 | 0.1794 | 0.0 |
| 6.0 | 5628 | 0.0145 | 0.1898 | 0.0 |
| 7.0 | 6566 | 0.0107 | 0.1997 | 0.0 |
| 8.0 | 7504 | 0.0058 | 0.2119 | 0.0 |
| 9.0 | 8442 | 0.0075 | 0.2019 | 0.0 |
| 10.0 | 9380 | 0.0045 | 0.2256 | 0.0 |
| 11.0 | 10318 | 0.0040 | 0.2283 | 0.0 |
| 12.0 | 11256 | 0.0018 | 0.2319 | 0.0 |
| 13.0 | 12194 | 0.0012 | 0.2318 | 0.0 |
| 14.0 | 13132 | 0.0005 | 0.2414 | 0.0 |
| 15.0 | 14070 | 0.0005 | 0.2389 | 0.0 |

La lectura de la tabla es inequivoca: sobreajuste completo y ausencia total de generalizacion. El minimo de perdida de validacion se alcanza en la epoca 5 (0,1794), por lo que incluso un entrenamiento con parada temprana en ese punto habria arrojado una exactitud de 0,0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en fp32 (67,07 M de parametros x 4 bytes), unos 134 MB en fp16/bf16 y unos 67 MB en int8. A estos valores hay que sumar el coste de activaciones y del tokenizador, marginal para secuencias de hasta 512 tokens.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM. No requiere A100, H100 ni similares; estas GPU serian un desperdicio absoluto para este modelo.
- Cabe en GPU de consumo: si. Funciona sin problemas en GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090 y tambien en CPU (x86 con AVX2 o Apple Silicon). Incluso es viable en dispositivos moviles tras conversion a ONNX o TFLite.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (etiqueta declarada en el repositorio), ONNX Runtime, TorchScript, y servidores de inferencia genericos compatibles con `endpoints_compatible`. No se han publicado pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles como dato medido para este checkpoint. Como referencia de orden de magnitud del modelo base DistilBERT en GPU moderna, la inferencia por lote de secuencias cortas se situa habitualmente en el rango de miles de secuencias por segundo en hardware tipo V100, y de decenas a cientos por segundo en CPU. Estas cifras corresponden al modelo base y no han sido verificadas para este ajuste.
- Almacenamiento: el repositorio ocupa 8,3 GB, muy por encima de lo necesario para los pesos (268 MB). Conviene descargar solo el archivo `model.safetensors` si se pretende desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| distilbert-base-uncased-finetuned-adl_hw1 (este) | 67,07 M | 512 tokens | Clasificacion de texto | Apache-2.0 | Exactitud declarada 0,0; no apto para produccion |
| distilbert/distilbert-base-uncased | 66,96 M | 512 tokens | Relleno de mascara (fill-mask) | Apache-2.0 | Modelo base funcional, ampliamente validado |
| distilbert-base-uncased-finetuned-sst-2-english | 66,96 M | 512 tokens | Analisis de sentimiento (2 clases) | Apache-2.0 | Referencia estandar de DistilBERT ajustado; exactitud en torno al 91 % en SST-2 segun la model card oficial |
| bert-base-uncased | 110 M | 512 tokens | Relleno de mascara | Apache-2.0 | Modelo mayor y mas lento que DistilBERT, usado como profesor en la destilacion |
| roberta-base | 125 M | 512 tokens | Relleno de mascara | MIT | Alternativa con entrenamiento mas largo y mejor rendimiento en GLUE, a costa de mas parametros |

No hay datos publicados que permitan comparar el rendimiento de este checkpoint con el de las alternativas, mas alla de la exactitud de 0,0 declarada por el propio autor, que lo situa por debajo de cualquier linea base trivial que prediga siempre la clase mayoritaria.

## Limitaciones y advertencias

- Exactitud de 0,0 declarada en el conjunto de evaluacion. El modelo no clasifica correctamente ni un solo ejemplo segun la metrica reportada por su autor. No debe usarse en ningun flujo con consecuencias reales.
- Sesgos conocidos: no documentados para este checkpoint. El modelo base DistilBERT hereda los sesgos de su corpus de preentrenamiento (Wikipedia y BookCorpus en ingles), que incluyen desequilibrios de genero, origen etnico y religion.
- Riesgo de alucinacion: no aplica en sentido estricto, al no generar texto, pero si existe el riesgo equivalente de clasificaciones arbitrarias o sistematicamente sesgadas hacia una unica clase.
- Riesgo de sobreajuste: confirmado. La perdida de entrenamiento cae cinco ordenes de magnitud mientras la de validacion repunta desde la epoca 5. Cualquier uso requeriria reentrenar con regularizacion, parada temprana y una particion de validacion revisada.
- Limitaciones de contexto: ventana fija de 512 tokens; el texto excedente se trunca, lo que degrada la clasificacion de documentos largos.
- Limitaciones de idioma: la model card no declara idiomas soportados. El modelo base esta preentrenado casi exclusivamente en ingles, por lo que el rendimiento en castellano no esta acreditado y previsiblemente seria pobre sin un ajuste especifico.
- Dataset de entrenamiento desconocido: no se documenta la composicion, el tamano, el numero de clases ni el origen de las etiquetas, lo que impide auditar el modelo o reproducir el entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si hubo cambios. No hay clausulas de uso aceptable adicionales.
- Caveats de produccion: el repositorio de 8,3 GB complica la descarga y el versionado; no hay pesos cuantizados publicados; el modelo no tiene descargas ni valoraciones en Hugging Face, por lo que carece de validacion por parte de la comunidad.
- Idoneidad: debe tratarse como material didactico o como caso de estudio de fallo de entrenamiento, nunca como componente de un sistema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LBFLarry/distilbert-base-uncased-finetuned-adl_hw1
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Version equivalente publicada por otro usuario (mismo nombre, autor `wesleyishere123`): https://huggingface.co/wesleyishere123/distilbert-base-uncased-finetuned-adl_hw1
- Ficha del modelo en Microsoft Foundry (modelo base): https://ai.azure.com/catalog/models/distilbert-base-uncased
- Catalogo de Microsoft Foundry (modelo base, variante Hugging Face Inference Toolkit): https://ai.azure.com/catalog/models/distilbert-distilbert-base-uncased
- Ficha agregada de benchmarks del modelo equivalente: https://free2aitools.com/model/wesleyishere123/distilbert-base-uncased-finetuned-adl_hw1
