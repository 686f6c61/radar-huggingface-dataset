# mubashir04/ViT-L_Eurosat

## Resumen

ViT-L_Eurosat es un checkpoint de ajuste fino (fine-tuning) de un Vision Transformer de tamano Large (ViT-L) sobre el conjunto de datos EuroSAT-RGB, una coleccion de imagenes satelitales Sentinel-2 en color real organizada en 10 clases de cobertura del suelo. Lo publica el usuario mubashir04 en HuggingFace y esta directamente vinculado al paper SatMAE++ (arXiv:2403.05419) y al repositorio de codigo techmn/satmae_pp, lo que lo situa en la linea de trabajo de representaciones auto-supervisadas para teledeteccion.

El modelo no es un modelo generativo ni multimodal de proposito general: es un clasificador de imagenes de escena terrestre. Su relevancia esta en que reutiliza el preentrenamiento auto-supervisado de SatMAE++ y lo especializa en la tarea concreta de clasificacion de uso del suelo, un caso de uso clasico en teledeteccion (monitorizacion agricola, planificacion urbana, seguimiento medioambiental).

La informacion publicada es minima: la model card apenas ocupa dos lineas y no incluye resultados, configuracion de entrenamiento ni hiperparametros. No hay datos de benchmarks, idiomas ni pipeline declarados en HuggingFace. El repositorio ocupa 1,2 GB, coherente con pesos de un ViT-L en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de tamano Large, ajustado con la receta de SatMAE++ |
| Parametros totales | no disponible en la informacion proporcionada (la familia ViT-L estandar ronda los 300 M, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada no especificada, el dataset EuroSAT-RGB usa imagenes de 64x64 px |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de clasificacion de imagenes, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio de 1,2 GB sugiere pesos en precision completa (safetensors o .bin de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de escala Large, es decir, un transformer puro sobre parches de imagen con atencion global completa entre todos los tokens de parche. El checkpoint concreto es el resultado de un ajuste fino supervisado sobre EuroSAT-RGB partiendo de los pesos preentrenados del trabajo SatMAE++. SatMAE++ es un marco de aprendizaje auto-supervisado para teledeteccion que combina modelado enmascarado de imagenes multiespectrales y multitemporales; el paper asociado es arXiv:2403.05419 y el codigo esta en el repositorio techmn/satmae_pp.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de EuroSAT-RGB, la resolucion de parche, el numero de epocas, la estrategia de aumento de datos ni si hubo etapas de ajuste adicionales. Tampoco se documentan innovaciones tecnicas propias de este checkpoint: la innovacion subyacente (preentrenamiento auto-supervisado multiespectral/multitemporal) pertenece al marco SatMAE++, no a este ajuste fino concreto.

## Capacidades

- Clasificacion de imagenes satelitales RGB en las 10 clases de uso del suelo de EuroSAT (por ejemplo, bosque, cultivo, urbano, agua, pasto, industrial).
- Extraccion de representaciones visuales (embeddings de imagen) reutilizables para tareas posteriores de transferencia.
- Ajuste fino posterior sobre otros conjuntos de teledeteccion partiendo de estos pesos.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues.
- No soporta modo "thinking", vision en lenguaje natural, audio ni generacion de codigo.

## Casos de uso

- Clasificacion de cobertura del suelo a escala regional: dado un flujo de teselas Sentinel-2 en RGB, el modelo asigna cada tesela a una de las 10 clases de EuroSAT, lo que permite construir mapas de uso del suelo de forma automatizada. Es adecuado porque esta ajustado exactamente sobre esa taxonomia.
- Monitorizacion de cambios en la cubierta vegetal: aplicando el clasificador a imagenes de la misma zona en distintas fechas se pueden detectar transiciones (por ejemplo, bosque a cultivo) de forma sistematica.
- Apoyo a la agricultura de precision: clasificar parcelas en categorias agricolas frente a otros usos permite priorizar inspecciones de campo o estimar superficies sembradas.
- Segmentacion de areas urbanas e industriales: como clasificador de escena, sirve para prefiltrar teselas candidatas antes de un analisis mas costoso o de una revision humana.
- Etiquetado asistido para construir nuevos datasets: usar las predicciones del modelo como preanotacion y corregirlas manualmente reduce el coste de anotacion en proyectos de teledeteccion.
- Extraccion de embeddings para busqueda por similitud: las representaciones internas del ViT pueden indexarse para recuperar imagenes visualmente parecidas dentro de un archivo satelital.
- Baseline en investigacion de teledeteccion: al ser un ajuste fino de SatMAE++ con licencia Apache 2.0, sirve como punto de partida reproducible para comparar tecnicas de aprendizaje auto-supervisado en clasificacion de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye exactitud en EuroSAT, matrices de confusion, comparaciones con otros backbones ni metricas de validacion. Los resultados del paper SatMAE++ (arXiv:2403.05419) no forman parte de la informacion proporcionada y no deben atribuirse a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en el entorno de 1,2-2,5 GB en fp32 para un ViT-L de ~300 M de parametros con lotes pequenos; en torno a 0,6-1,2 GB en fp16/bf16. Cifras orientativas basadas en el tamano tipico de la familia ViT-L, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria es suficiente para inferencia; una NVIDIA T4, RTX 3060, RTX 4090 o A100 cubren el caso sin problema. Para ajuste fino conviene 16 GB o mas, y para reentrenamiento a resoluciones mayores se recomienda A100/H100.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo moderna puede ejecutar la inferencia, e incluso es viable en CPU para volumenes moderados.
- Opciones de despliegue: no se documenta soporte especifico. Al ser un ViT estandar, es desplegable con PyTorch/TorchScript, ONNX Runtime, HuggingFace Transformers (clase ViT), o servidores de inferencia genericos como TorchServe. No hay publicacion de GGUF ni soporte declarado en llama.cpp u Ollama, y vLLM y TGI estan orientados a modelos de lenguaje, no a este caso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViT-L_Eurosat | Clasificador ViT-L ajustado en EuroSAT-RGB | no disponible (~300 M en la familia ViT-L, sin confirmar) | Imagenes; resolucion no especificada (EuroSAT-RGB usa 64x64) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| SatMAE++ (checkpoints del paper) | Marco auto-supervisado para teledeteccion | no disponible en la informacion proporcionada | Multiespectral y multitemporal | no disponible | Repositorio de codigo techmn/satmae_pp |
| ViT-B/16 preentrenado en ImageNet | Clasificador ViT de proposito general | no disponible en la informacion proporcionada | Imagen RGB 224x224 tipicamente | variable segun checkpoint | Ampliamente disponible |
| ResNet-50 ajustado en EuroSAT | CNN clasica de referencia en teledeteccion | no disponible en la informacion proporcionada | Imagen RGB | variable segun checkpoint | Ampliamente disponible |

No hay datos de rendimiento en la informacion proporcionada que permitan una comparacion cuantitativa entre estas opciones.

## Limitaciones y advertencias

- No se documentan sesgos, pero al entrenarse sobre EuroSAT-RGB el modelo hereda el sesgo geografico y temporal de ese dataset, mayoritariamente centrado en escenas europeas de Sentinel-2; su generalizacion a otras regiones, sensores o epocas del ano no esta garantizada.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas y sobreconfiadas, especialmente en clases visualmente solapadas o con pixeles mixtos.
- Limitacion de resolucion: EuroSAT-RGB trabaja con imagenes de 64x64 px, muy baja resolucion para estandares de vision; la entrada esperada por este checkpoint no se especifica en la model card, lo que obliga a verificar la configuracion antes de usarlo.
- Sin informacion de idiomas porque no es un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y la atribucion correspondiente. Conviene verificar la licencia de los datos EuroSAT-RGB si se redistribuyen derivados.
- Madurez muy baja: 0 descargas y 0 likes, creado y actualizado en septiembre de 2026, sin resultados publicados. No es un artefacto validado por la comunidad.
- Ausencia total de documentacion de entrenamiento (epocas, learning rate, aumentos, splits) impide reproducir el resultado o auditar posibles fugas de datos entre entrenamiento y evaluacion.
- No es un modelo generativo: no debe emplearse para generar texto, imagenes ni cualquier salida que no sea una etiqueta o un embedding.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mubashir04/ViT-L_Eurosat
- Codigo SatMAE++: https://github.com/techmn/satmae_pp
- Paper SatMAE++: https://arxiv.org/abs/2403.05419
- Dataset EuroSAT-RGB (remote sensing representations de Google Research): https://github.com/google-research/google-research/tree/master/remote_sensing_representations
