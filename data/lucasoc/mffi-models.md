# lucasoc/MFFI-Models

## Resumen

MFFI-Models es un repositorio de pesos publicado por el usuario lucasoc en Hugging Face, asociado al proyecto "Benchmarking Spatial, Spectral, and Self-Supervised Cues for Face Forgery Detection under Realistic Degradation". No se trata de un modelo unico, sino de una coleccion de checkpoints (`best.pth`) y configuraciones de experimento (`run_config.json`) destinados a la deteccion de falsificaciones faciales (deepfakes), evaluados sobre FaceForensics++ (limpio y corrupto `test_d`) y Celeb-DF v2. El repositorio ocupa 43,0 GB y esta publicado bajo licencia MIT.

El conjunto abarca seis familias de arquitectura (ResNet-18, MobileNetV3-Large, Xception, ViT-B/16, CLIP-ViT-B/16, DINO con ConvNeXt-Base y variantes de Mixture of Experts), combinadas con siete modos de representacion de entrada que mezclan el dominio espacial RGB con distintas representaciones espectrales basadas en la transformada de Fourier 2D (magnitud logaritmica, fase, componentes real/imaginaria, concatenaciones multi-dominio, paso alto y paso bajo). Cada combinacion se entrena en dos regimenes (ajuste fino o desde cero) y con cinco semillas estadisticas (42, 123, 2024, 7, 2025), mas una semilla adicional (987) para un protocolo robusto.

Su relevancia reside en el caracter sistematico del benchmark: permite comparar de forma controlada si las pistas espectrales y auto-supervisadas aportan ventaja real frente a las pistas puramente espaciales cuando la imagen ha sufrido degradaciones realistas. Al publicar pesos, configuraciones y curvas ROC-AUC, el repositorio esta pensado para reproduccion de resultados y para servir de base a trabajos posteriores de deteccion forense de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: ResNet-18 (CNN residual), MobileNetV3-Large (CNN movil con Squeeze-and-Excitation), Xception (CNN con convoluciones separables en profundidad), ViT-B/16 (Vision Transformer preentrenado en ImageNet-21k), CLIP-ViT-B/16 (vision transformer multimodal de OpenAI), DINO con ConvNeXt-Base (destilacion auto-supervisada via DINOv3 LVD-1689M) y variantes de Mixture of Experts (MoE estandar y especializada en frecuencia) |
| Parametros totales | no disponible (repositorio agregado de multiples familias; no se desglosa el numero de parametros por checkpoint) |
| Parametros activos | no disponible (se mencionan variantes MoE, pero no se publica el numero de parametros activos) |
| Longitud de contexto | no disponible (modelo de vision; no aplica ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (clasificador de imagenes; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pth`, fichero `best.pth` por experimento); carga mediante `torch.load` o `huggingface_hub.hf_hub_download` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica, sino un espacio de experimentos cruzando familia de modelo, modo de representacion, regimen de entrenamiento y semilla. Las familias cubren tres paradigmas: CNN clasicas (ResNet-18, MobileNetV3-Large, Xception), transformers de vision (ViT-B/16 y CLIP-ViT-B/16) y un modelo auto-supervisado (DINO sobre ConvNeXt-Base). A ello se anaden arquitecturas de mezcla de expertos, con una variante estandar y otra especializada en frecuencia.

La innovacion central esta en las representaciones de entrada. Ademas del RGB espacial de tres canales (`none`), se evaluan modos espectrales derivados de la FFT 2D: magnitud logaritmica `log(|F| + 1)` (1 canal), fase normalizada en [0,1] (1 canal), partes real e imaginaria (2 canales), concatenacion de RGB con magnitud (4 canales), magnitud filtrada paso alto (`frequency_3`, 1 canal) y una concatenacion multi-dominio de 7 canales que suma RGB, magnitud, fase, paso alto y paso bajo. El objetivo es medir si las pistas espectrales aportan senal complementaria frente a artefactos de generacion, especialmente en condiciones de degradacion.

Cada combinacion se entrena en regimen de ajuste fino o desde cero, con cinco semillas estadisticas para estimar variabilidad, y se guarda como mejor checkpoint segun ROC-AUC de validacion. Los datasets de evaluacion declarados son FaceForensics++ (version limpia y version corrupta `test_d`) y Celeb-DF v2. No se especifican en la model card el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de alineamiento como RLHF o DPO (no aplicables a un clasificador de vision). El codigo de entrenamiento, preparacion de datos y pipelines de evaluacion se encuentran en el repositorio de GitHub indicado mas abajo.

## Capacidades

- Clasificacion binaria de imagenes de rostro para deteccion de falsificacion (real frente a manipulada).
- Deteccion basada en artefactos espaciales RGB (modo `none`).
- Deteccion basada en artefactos espectrales, mediante magnitud FFT, fase, componentes complejas y filtrados paso alto y paso bajo.
- Analisis multi-dominio combinando RGB y representaciones de frecuencia en una sola entrada (7 canales).
- Evaluacion bajo degradacion realista de imagen (subconjunto corrupto `test_d` de FaceForensics++).
- Generalizacion cruzada a otro dataset de deepfakes (Celeb-DF v2).
- Modelos ligeros aptos para escenarios de recursos limitados (MobileNetV3-Large) junto a variantes de mayor capacidad (ViT, CLIP, DINO, MoE).
- Estimacion de variabilidad estadistica mediante multiples semillas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo discriminativo de vision, no un modelo de lenguaje.

## Casos de uso

- Moderacion de contenido en plataformas: el modelo puede integrarse como clasificador previo al filtrado de imagenes de rostros potencialmente manipuladas, aprovechando las variantes ligeras (MobileNetV3-Large, ResNet-18) para cribado de alto volumen y las variantes transformer para revision de casos dudosos.
- Verificacion de identidad y procesos KYC: como senal auxiliar en comprobaciones de prueba de vida, analizando si un rostro presenta artefactos compatibles con sintesis o manipulacion, siempre acompanado de otros controles.
- Analisis forense digital y peritaje: las representaciones FFT permiten documentar evidencia espectral (magnitud, fase, paso alto) que puede sustentar un informe tecnico sobre la manipulacion de una imagen.
- Investigacion academica en deteccion de deepfakes: el repositorio ofrece pesos y configuraciones reproducibles sobre FaceForensics++ y Celeb-DF v2, lo que permite comparar nuevas propuestas contra un conjunto de referencia ya entrenado y con semillas multiples.
- Estudio de robustez ante degradacion: las variantes entrenadas y evaluadas sobre `test_d` corrupto permiten analizar como se degrada la deteccion cuando la imagen sufre compresion, ruido u otras perdidas, un escenario habitual en imagenes que circulan por redes sociales.
- Seleccion de arquitectura para despliegue: la existencia de seis familias con el mismo protocolo permite escoger entre coste computacional y capacidad de deteccion segun el hardware objetivo, desde edge hasta servidor con GPU.
- Auditoria de generadores: comparar el comportamiento de los distintos modos espectrales ayuda a identificar que artefactos de frecuencia introduce cada tecnica de sintesis facial.
- Ensamblado de clasificadores: combinar predicciones de varias familias y modos (espaciales y espectrales) para construir un detector por votacion o stacking con mayor robustez que un unico checkpoint.
- Verificacion periodistica de imagenes: como herramienta de apoyo en redacciones para priorizar que imagenes requieren verificacion manual antes de publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica unicamente los conjuntos de evaluacion empleados y el criterio de seleccion de checkpoint:

| Aspecto | Detalle |
|---|---|
| Datasets de evaluacion | FaceForensics++ (version limpia y version corrupta `test_d`), Celeb-DF v2 |
| Metrica de seleccion de checkpoint | ROC-AUC de validacion |
| Resultados numericos por familia, modo, regimen y semilla | no disponibles en la informacion proporcionada |
| Artefactos incluidos | Curvas ROC-AUC de entrenamiento y validacion (`plots/roc_auc.png`) por experimento |

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 43,0 GB, por lo que la descarga integra requiere ese espacio en disco; es posible descargar checkpoints individuales con `hf_hub_download`.
- VRAM para inferencia: no disponible en la informacion proporcionada. No se publican tamanos por checkpoint ni requisitos de memoria.
- GPU recomendadas: no disponibles. No se documentan GPU empleadas ni recomendadas por el autor.
- Viabilidad en GPU de consumo: no confirmada por el autor. Las familias CNN ligeras incluidas (MobileNetV3-Large, ResNet-18) son arquitecturas de clasificacion de coste bajo en inferencia, mientras que ViT-B/16, CLIP-ViT-B/16, ConvNeXt-Base y las variantes MoE requieren mas memoria; se trata de una apreciacion general sobre el tipo de arquitectura, no de una cifra publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este clasificador). La carga se realiza con PyTorch (`torch.load` con `weights_only=True`) o descargando el fichero mediante `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables en la informacion proporcionada. La comparacion relevante que si documenta el repositorio es interna, entre las familias incluidas bajo el mismo protocolo de evaluacion:

| Familia | Tipo de arquitectura | Pista principal | Regimenes | Notas |
|---|---|---|---|---|
| ResNet-18 | CNN residual | Espacial y espectral | finetune, scratch | Referencia clasica y ligera |
| MobileNetV3-Large | CNN movil con Squeeze-and-Excitation | Espacial y espectral | finetune, scratch | Menor coste computacional |
| Xception | CNN con convoluciones separables en profundidad | Espacial y espectral | finetune, scratch | Uso extendido en deteccion de deepfakes |
| ViT-B/16 | Vision Transformer | Espacial y espectral | finetune, scratch | Preentrenado en ImageNet-21k |
| CLIP-ViT-B/16 | Transformer de vision multimodal | Espacial y espectral | finetune, scratch | Pesos de OpenAI |
| DINO (ConvNeXt-Base) | Auto-supervisado por destilacion | Espacial y espectral | finetune, scratch | Entrenado con DINOv3 LVD-1689M |
| MoE (estandar y especializada en frecuencia) | Mixture of Experts | Espacial y espectral | finetune, scratch | Parametros activos no publicados |

## Limitaciones y advertencias

- No se publican cifras de rendimiento (exactitud, ROC-AUC, F1) en la model card; sin ellas no es posible validar la calidad de los checkpoints sin reproducir la evaluacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- Los metadatos indican fechas de creacion y actualizacion en 2026-09-11, posteriores a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los ficheros antes de usarlos en produccion.
- Los modelos se entrenan y evaluan sobre FaceForensics++ y Celeb-DF v2. El rendimiento puede degradarse frente a generadores, pipelines de sintesis o tipos de manipulacion no representados en esos conjuntos.
- El propio planteamiento del benchmark asume degradacion realista (`test_d`); en condiciones de compresion, ruido o reescalado distintas de las evaluadas el comportamiento puede variar.
- Como todo detector de falsificacion facial, esta sujeto a falsos positivos y falsos negativos. No debe utilizarse como prueba concluyente ni como unico criterio en decisiones con impacto sobre personas.
- Riesgo de uso dual: la informacion sobre que artefactos espectrales revelan manipulacion puede emplearse para disenar generadores que evadan la deteccion.
- Posibles sesgos derivados de la composicion demografica de los datasets de entrenamiento, no documentada en la model card.
- La licencia MIT permite uso comercial y modificacion, pero se ofrece sin garantias; no se especifican condiciones adicionales ni restricciones de atribucion mas alla de las propias de MIT.
- No se documentan requisitos de memoria, latencia ni compatibilidad con herramientas de serving, lo que complica la planificacion de despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/lucasoc/MFFI-Models
- Repositorio de codigo oficial: https://github.com/lucasdocunha/tcc
- No se han encontrado enlaces relevantes al modelo en los resultados de busqueda web disponibles (los resultados obtenidos no guardan relacion con MFFI ni con deteccion de falsificaciones faciales).
