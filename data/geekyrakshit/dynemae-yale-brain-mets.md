# geekyrakshit/DyneMAE-Yale-Brain-Mets

## Resumen

DyneMAE-Yale-Brain-Mets es un modelo de autoencoder enmascarado (Masked AutoEncoder, MAE) tridimensional para resonancia magnetica cerebral, desarrollado por el usuario geekyrakshit y construido sobre la clase `DynUNet` de MONAI. Se trata de un modelo de aprendizaje autosupervisado que aprende representaciones de volumenes de MRI reconstruyendo regiones enmascaradas, y no de un modelo de segmentacion semantica entrenado. Su relevancia radica en que proporciona una inicializacion preentrenada para tareas downstream de imagen medica 3D, un dominio donde los datos etiquetados son escasos y costosos de obtener.

El checkpoint publicado contiene el modelo MAE completo en precision FP32 mediante safetensors: encoder, decoder de reconstruccion, capa de salida, tokens de mascara y proyecciones de densificacion. Proviene de la ejecucion de W&B `s6flogjd`, finalizada el 15 de octubre de 2026, con un MSE de validacion enmascarado minimo de 0,1642 en la actualizacion de optimizador numero 4.227, partiendo de inicializacion aleatoria.

La arquitectura es una `MaskedAutoEncoderDynUnet` personalizada con 39.273.217 parametros entrenables (70.692.161 parametros totales en el fichero safetensors), entrada y reconstruccion monocanal, y seis niveles de caracteristicas. El modelo se distribuye con licencia Apache 2.0 y esta pensado como punto de partida para investigacion, no como producto listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MaskedAutoEncoderDynUnet (basada en MONAI DynUNet), autoencoder enmascarado 3D |
| Parametros totales | 70.692.161 (fichero safetensors); 39.273.217 parametros entrenables unicos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada volumetrica 3D) |
| Tipos de cuantizacion | no disponible (publicado en FP32 safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32), libreria MONAI / PyTorch |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado volumetrico construido sobre `DynUNet` de MONAI, con dimensionalidad espacial 3, un canal de entrada y uno de reconstruccion, y anchos de caracteristica `[32, 64, 128, 256, 320, 320]` en seis niveles. Todos los niveles usan convoluciones `3 x 3 x 3` y strides `[1, 2, 2, 2, 2, 2]` aplicados por igual en cada eje, con kernels de upsampling `[2, 2, 2, 2, 2]`. Los bloques del encoder son residuales con normalizacion de instancia afin enmascarada y LeakyReLU. La supervision profunda esta desactivada y se empleo checkpointing de activaciones durante el entrenamiento. En cada nivel de caracteristicas, la densificacion aplica normalizacion de instancia enmascarada no afin, rellena las posiciones ocultas con un token aprendido y aplica una convolucion `3 x 3 x 3` salvo en el nivel de mayor resolucion; el decoder de DynUNet reconstruye la entrada normalizada a partir de estas caracteristicas densas y las conexiones skip.

El entrenamiento partio de inicializacion aleatoria (`resume=false`) y uso las particiones del dataset Yale-Brain-Mets-Longitudinal: 1.135 pacientes y 25.357 volumenes en entrenamiento, 142 pacientes y 2.611 volumenes en validacion (subconjunto fijo aleatorio de 25 volumenes, semilla 42) y 142 pacientes y 3.399 volumenes en test (no usados). Las secuencias fueron PRE (T1 precontraste), POST (T1 postcontraste), T2 y FLAIR, tratadas como ejemplos monocanal independientes (no concatenadas en cuatro canales). El preprocesamiento incluye recorte al bounding box del primer plano, z-score sobre la imagen recortada completa, remuestreo a 1 mm isotropico con interpolacion cubica y un plan de transposicion `[0, 1, 2]` sin canonicalizacion RAS. Se realizo una unica pasada barajada completa con un parche aumentado por volumen, alcanzando 4.227 actualizaciones de optimizador. No se usaron etiquetas de segmentacion ni resultados clinicos como objetivos.

## Capacidades

- Aprendizaje de representaciones autosupervisado de volumenes de MRI cerebral 3D monocanal mediante reconstruccion de regiones enmascaradas.
- Extraccion de caracteristicas volumetricas a multiples escalas (seis niveles) para inicializar modelos downstream.
- Inicializacion de pesos para tareas de segmentacion u otras tareas densas en imagen medica 3D.
- Reconstruccion de la entrada normalizada a partir de caracteristicas densas y conexiones skip.
- Procesamiento de las secuencias PRE, POST, T2 y FLAIR como ejemplos independientes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No incorpora modo de pensamiento, vision natural, audio ni otras capacidades multimodales fuera del dominio MRI.

## Casos de uso

- Inicializacion para segmentacion de tumores cerebrales: los pesos del encoder pueden cargarse como punto de partida de una DynUNet de segmentacion y afinarse con un conjunto etiquetado pequeno, aprovechando las representaciones aprendidas de 25.357 volumenes.
- Investigacion en aprendizaje autosupervisado 3D: el checkpoint completo (encoder, decoder, tokens de mascara y proyecciones) permite reproducir o extender el regimen de reconstruccion enmascarada sobre nuevos corpus de MRI.
- Preentrenamiento por transferencia en dominios limitados de datos: util para hospitales o grupos con pocos estudios etiquetados que necesitan un encoder volumetrico razonable en lugar de entrenar desde cero.
- Extraccion de embeddings volumetricos: el encoder puede usarse para generar caracteristicas de estudios de resonancia y alimentar clasificadores o modelos de analisis longitudinal.
- Armonizacion y control de calidad de datos: la capacidad de reconstruccion permite estudiar que regiones del volumen se modelan con mayor fidelidad y detectar anomalias en el preprocesamiento.
- Experimentos de reconstruccion enmascarada con distintas secuencias (PRE, POST, T2, FLAIR) para analizar que modalidad aporta mas informacion estructural al encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento registrado es el MSE de validacion enmascarado minimo de 0,16423170048433572, alcanzado en la actualizacion de optimizador 4.227 sobre un subconjunto fijo de 25 volumenes de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 70,7 millones de parametros en FP32 el peso ocupa aproximadamente 283 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo con suficiente memoria para el volumen 3D de entrada.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo se entreno en infraestructura CoreWeave (W&B) segun los enlaces de la model card.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque el consumo real depende de la resolucion volumetrica de entrada y del batch.
- Opciones de despliegue: MONAI y PyTorch como librerias nativas; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (MAE volumetricos para MRI cerebral) ni sus especificaciones.

## Limitaciones y advertencias

- No es un modelo de segmentacion semantica entrenado; usarlo directamente para segmentar produciria resultados sin garantia. Debe afinarse para tareas downstream.
- Entrenado exclusivamente con MRI cerebral de un unico corpus (Yale-Brain-Mets-Longitudinal); puede generalizar mal a otras anatomias, modalidades o protocolos de adquisicion.
- Entrada monocanal: las cuatro secuencias se tratan como ejemplos independientes, no como canales concatenados, lo que limita la explotacion conjunta de modalidades.
- No aplica canonicalizacion RAS y usa un plan de transposicion fijo `[0, 1, 2]`; los datos de inferencia deben seguir exactamente el mismo preprocesamiento (recorte, z-score, remuestreo a 1 mm isotropico) para resultados validos.
- Riesgo de sesgo por la composicion del dataset (pacientes con metastasis cerebrales de una institucion concreta) y por los criterios de seleccion aplicados (integridad, espaciado y campo de vision).
- No se han publicado evaluaciones en el conjunto de test, por lo que no hay evidencia publica de rendimiento fuera de validacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para uso clinico ni diagnostico; cualquier aplicacion medica requiere validacion regulatoria independiente.
- Riesgo de alucinacion en el sentido de reconstrucciones plausibles pero incorrectas de regiones enmascaradas; no debe interpretarse la salida como medida clinica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geekyrakshit/DyneMAE-Yale-Brain-Mets
- Dataset fuente: https://huggingface.co/datasets/geekyrakshit/Yale-Brain-Mets-Longitudinal
- Dataset preparado: https://huggingface.co/datasets/geekyrakshit/Yale-Brain-Mets-Longitudinal-MAE-Prepared
- Ejecucion de W&B: https://forge.coreweave.com/wandb/soumya_snigdha-kundu-king-s-college-london/yale-mae/runs/s6flogjd
- Revision del dataset fuente: https://huggingface.co/datasets/geekyrakshit/Yale-Brain-Mets-Longitudinal/tree/41fe4b84294e5c04e26f73b7ffcede5b2d92b7f0
- Revision del dataset preparado: https://huggingface.co/datasets/geekyrakshit/Yale-Brain-Mets-Longitudinal-MAE-Prepared/tree/9b97e9cc2e71a1246238ea2e017d6755bb5cd042
