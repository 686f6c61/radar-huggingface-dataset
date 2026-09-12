# pranamjain/vial-patchcore

## Resumen

Vial PatchCore es un modelo de deteccion de anomalias industriales basado en PatchCore, publicado por el usuario pranamjain en Hugging Face bajo el identificador `pranamjain/vial-patchcore`. Esta entrenado especificamente para la categoria "Vial" (viales) del conjunto de datos MVTec AD 2, y su tarea consiste en distinguir imagenes de viales normales de imagenes con defectos, devolviendo ademas un mapa de anomalia que localiza las regiones sospechosas.

El modelo se apoya en la libreria Anomalib y en PyTorch, y se distribuye como un checkpoint (`model.ckpt`) de aproximadamente 0,3 GB de tamano de repositorio. La entrada es de 256 x 256 pixeles y el pipeline declarado en Hugging Face es `image-classification`, aunque la tarea real es deteccion de anomalias no supervisada (una sola clase: "normal").

Su relevancia es acotada pero clara: es un ejemplo de adaptacion de PatchCore a MVTec AD 2, un benchmark mas reciente y exigente que el MVTec AD original, con un umbral de despliegue ajustado experimentalmente (0,09) y una demo interactiva publicada. No obstante, sus resultados son modestos (Image AUROC 0,7578, Image F1 0,5315) y la licencia no esta declarada, lo que limita su uso directo en produccion sin una verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchCore (deteccion de anomalias por comparacion de caracteristicas de parches contra un memory bank) |
| Parametros totales | No disponible (PatchCore no entrena pesos propios: usa un extractor de caracteristicas congelado y un memory bank de parches normales; la model card no especifica el backbone) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen de 256 x 256 pixeles) |
| Tipos de cuantizacion | No disponible (se distribuye un unico checkpoint `model.ckpt`; la model card no documenta cuantizaciones) |
| Idiomas soportados | "en" segun los metadatos de Hugging Face; el modelo no procesa texto, solo imagenes |
| Licencia | No disponible |
| Formato de pesos | Checkpoint de PyTorch / Anomalib (`model.ckpt`) |

Otros datos declarados: libreria `anomalib`, framework PyTorch, dataset MVTec AD 2 (categoria Vial), tarea industrial anomaly detection, pipeline en Hugging Face `image-classification`, tamano de repositorio 0,3 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

PatchCore representa cada imagen mediante caracteristicas profundas extraidas de parches locales y las compara contra un "memory bank" que resume la apariencia de las muestras normales. En lugar de entrenar una red para clasificar defectos, el metodo aprende la distribucion de lo normal y mide la desviacion respecto a ella en inferencia: cuanto mayor es la distancia al banco de memoria, mayor es la puntuacion de anomalia. Esto permite un enfoque no supervisado en el que solo se necesitan imagenes correctas durante el ajuste.

Segun la model card, el modelo se entreno para aprender las caracteristicas visuales de imagenes normales de viales del dataset MVTec AD 2; en inferencia, las desviaciones respecto a esa representacion de normalidad producen puntuaciones de anomalia mas altas, y se genera un mapa de anomalia para visualizar las regiones contribuyentes. La informacion proporcionada no detalla el numero de tokens o imagenes de entrenamiento, la composicion completa del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de modelo). Tampoco se especifica la resolucion de entrenamiento mas alla de la entrada de 256 x 256, ni la estrategia de muestreo del memory bank (por ejemplo, reduccion de dimensionalidad o submuestreo de nucleos). No hay informacion sobre innovaciones adicionales como atencion lineal, decodificacion especulativa u otras tecnicas, que no aplican a este tipo de arquitectura.

Un detalle operativo relevante: el umbral de imagen por defecto producia un numero relativamente alto de falsos negativos en la categoria Vial, por lo que el autor realizo un analisis adicional de umbrales sobre el conjunto de test publico de MVTec AD 2 y selecciono 0,09 como umbral experimental de despliegue para la demo interactiva.

## Capacidades

- Deteccion de anomalias a nivel de imagen: clasifica una imagen de vial como normal o defectuosa y devuelve una puntuacion de anomalia.
- Localizacion de defectos: genera un mapa de calor (anomaly heatmap) que resalta las regiones que contribuyen a la anomalia detectada.
- Aprendizaje no supervisado de normalidad: se ajusta unicamente con ejemplos normales de la categoria Vial; no requiere ejemplos etiquetados de defectos.
- Clasificacion binaria de imagen: el pipeline declarado en Hugging Face es `image-classification`, con salida normal/defectuoso.
- Integracion con Anomalib: al usar esta libreria, el checkpoint es compatible con los flujos de inferencia y evaluacion de Anomalib.
- Demo interactiva: existe una aplicacion Gradio publicada que devuelve prediccion, puntuacion de anomalia, mapa de calor y localizacion visual de regiones sospechosas.
- Capacidades multilingues: no aplica; el modelo solo procesa imagenes.
- Tool calling, function calling, agentes, razonamiento multi-paso, modo "thinking", vision general, audio o generacion de texto: no disponibles o no aplicables a este modelo, que es un detector de anomalias visuales de proposito especifico.

## Casos de uso

- Control de calidad en linea de llenado de viales: el modelo recibe imagenes de cada vial desde una camara industrial a 256 x 256 y emite una puntuacion de anomalia; con el umbral de despliegue de 0,09 se pueden descartar automaticamente las unidades sospechosas antes del envasado.
- Inspeccion visual de defectos superficiales: el mapa de anomalia permite localizar la region concreta (grietas, manchas, partículas, roturas) y enviarla a un operador para revision, en lugar de descartar la pieza sin informacion adicional.
- Triaje previo a inspeccion humana: dado que Image F1 es 0,5315, el modelo encaja mejor como filtro de primera pasada que como decisor final, reduciendo el volumen de imagenes que un operario debe revisar manualmente.
- Auditoria de lotes y trazabilidad: registrar la puntuacion de anomalia de cada vial junto al identificador de lote permite analizar tendencias y detectar deriva del proceso (por ejemplo, un aumento progresivo de defectos en una linea concreta).
- Prototipado rapido en plantas piloto: al ser un metodo no supervisado, se puede ajustar con un conjunto pequeno de imagenes normales de una nueva linea de produccion, sin necesidad de recolectar y etiquetar defectos reales, que suelen ser escasos.
- Investigacion y benchmarking: sirve como linea base reproducible sobre la categoria Vial de MVTec AD 2 para comparar variantes de PatchCore (distintos backbones, estrategias de memory bank, resoluciones de entrada).
- Validacion de sistemas de vision antes de invertir: desplegar la demo Gradio o el checkpoint en un entorno de pruebas permite estimar el ahorro de inspeccion manual y el coste de falsos positivos antes de comprometer una linea de produccion.
- Docencia y formacion en vision industrial: por su tamano reducido y su naturaleza no supervisada, es un ejemplo practico para explicar deteccion de anomalias basada en caracteristicas y bancos de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados sobre el conjunto de test publico de MVTec AD 2 en la categoria Vial:

| Metrica | Valor |
|---|---:|
| Image AUROC | 0,7578 |
| Image F1 Score | 0,5315 |
| Pixel AUROC | 0,9142 |
| Pixel F1 Score | 0,1197 |

Interpretacion aportada por el autor: el Image AUROC indica una separacion util entre imagenes normales y anomalas a nivel de imagen; el Image F1 refleja el equilibrio entre precision y recall con el umbral usado en la evaluacion original; el Pixel AUROC elevado sugiere que el modelo ordena correctamente las regiones anomalas frente a las normales; y el Pixel F1 bajo indica que la segmentacion precisa del defecto sigue siendo dificil aunque el mapa de anomalia aporte informacion de localizacion util.

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto de evaluacion, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como estimacion orientativa para un modelo PatchCore con entrada de 256 x 256 y lote 1, el consumo suele situarse en el rango de 1 a 3 GB en GPU, dependiendo del backbone de extraccion de caracteristicas, que la model card no especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia por lotes pequenos, aunque el dato no esta confirmado por el autor.
- GPU de consumo: probablemente cabe en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090 y similares), asi como en iGPU o CPU para inferencia puntual, dado que el modelo no entrena una red grande. Esta afirmacion es una estimacion basada en el tipo de arquitectura, no un dato verificado.
- Opciones de despliegue: Anomalib (libreria nativa del modelo), PyTorch directo cargando `model.ckpt`, y aplicacion Gradio (la demo publicada). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles. Dependeran del backbone, del hardware y del tamano de lote.
- Almacenamiento: el repositorio ocupa aproximadamente 0,3 GB, lo que incluye el checkpoint y, presumiblemente, el memory bank asociado.

## Comparativa con modelos similares

La informacion proporcionada no incluye cifras de rendimiento de modelos alternativos sobre la categoria Vial de MVTec AD 2, por lo que la comparacion cuantitativa no esta disponible. La tabla siguiente recoge los aspectos que si pueden contrastarse; las celdas marcadas como "no disponible" reflejan ausencia de datos en la informacion consultada, no ausencia del dato en la fuente original.

| Modelo | Tipo | Dataset de referencia | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vial PatchCore (este modelo) | PatchCore sobre Anomalib | MVTec AD 2, categoria Vial | 256 x 256 | No disponible | Hugging Face, 0 descargas, 0 likes |
| PatchCore original | PatchCore | MVTec AD (version 1) | No disponible | No disponible en la informacion consultada | Repositorio publico de referencia |
| PaDiM | Modelado de distribucion de caracteristicas de parches | MVTec AD (version 1) | No disponible | No disponible en la informacion consultada | Implementacion disponible en Anomalib |
| EfficientAD | Destilacion de caracteristicas con profesor/estudiante | MVTec AD (version 1) | No disponible | No disponible en la informacion consultada | Implementacion disponible en Anomalib |

Nota metodologica: MVTec AD 2 introduce cambios de protocolo respecto al MVTec AD original (iluminacion, condiciones de captura y criterios de evaluacion mas exigentes), de modo que las cifras de la literatura sobre MVTec AD no son directamente trasladables a esta categoria Vial. Cualquier comparacion cuantitativa requeriria reentrenar las alternativas sobre MVTec AD 2 con el mismo protocolo.

## Limitaciones y advertencias

- Licencia no declarada: la model card y los metadatos de Hugging Face no especifican licencia. Sin una licencia explicita no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Especializacion extrema: el modelo esta entrenado unicamente para la categoria Vial de MVTec AD 2. No es un detector de anomalias generico y probablemente ofrecera un rendimiento pobre en otras categorias u objetos.
- Rendimiento modesto a nivel de imagen: Image AUROC 0,7578 e Image F1 0,5315 indican una separacion limitada entre normales y anomalos bajo el umbral evaluado. El propio autor senala un numero relativamente alto de falsos negativos con el umbral por defecto.
- Segmentacion de defectos poco fiable: aunque Pixel AUROC es 0,9142, el Pixel F1 de 0,1197 indica que la delimitacion precisa del defecto es debil. El mapa de anomalia debe interpretarse como indicio de localizacion, no como mascara de segmentacion.
- Umbral ajustado sobre el conjunto de test publico: el valor 0,09 se selecciono mediante analisis sobre el test publico de MVTec AD 2. Esto introduce riesgo de sobreajuste al conjunto de evaluacion y hace que el umbral no sea necesariamente transferible a imagenes de otra planta, camara o condicion de iluminacion.
- Sensibilidad al dominio: al depender de caracteristicas visuales aprendidas de un dataset concreto, cambios en iluminacion, fondo, optica o tipo de vial pueden degradar gravemente los resultados. Se recomienda validar con imagenes propias antes de cualquier uso.
- Riesgo de alucinacion en sentido amplio: el modelo puede producir puntuaciones de anomalia altas en imagenes normales con variaciones no vistas (falsos positivos) y bajas en defectos sutiles (falsos negativos). No existe mecanismo de calibracion de incertidumbre documentado.
- Sesgos: no hay informacion sobre sesgos especificos ni sobre la composicion demografica del dataset, que en este caso son imagenes de objetos industriales y no personas.
- Idiomas: los metadatos declaran "en", pero el modelo no procesa texto; la etiqueta es irrelevante para su funcionamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta implican que el modelo no ha sido reproducido ni auditado por terceros.
- Fechas de publicacion inusuales: los metadatos indican creacion el 2026-09-11 y ultima actualizacion el 2026-09-11; conviene verificar la vigencia y el estado del repositorio antes de depender de el.
- Dependencia de Anomalib: cargar el checkpoint requiere la libreria Anomalib y una version compatible de PyTorch; no se documentan requisitos de version exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranamjain/vial-patchcore
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/pranamjain/industrial-vial-defect-detection
- Dataset MVTec AD 2: referenciado en la model card, sin URL incluida en la informacion disponible
- Libreria Anomalib: referenciada en la model card y en los tags, sin URL incluida en la informacion disponible
- Paper original de PatchCore: no disponible en la informacion proporcionada
- Repositorio de codigo del modelo: no disponible en la informacion proporcionada
- Los resultados de la busqueda web realizada no contienen enlaces relacionados con este modelo; el contenido devuelto es ruido sin relacion con deteccion de anomalias industriales.
