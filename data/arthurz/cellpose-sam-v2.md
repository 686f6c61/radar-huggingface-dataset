# ArthurZ/cellpose-sam-v2

## Resumen

Cellpose-SAM es un modelo de segmentacion de instancias celulares que combina el enfoque de flujos de Cellpose con un backbone de tipo SAM (Segment Anything Model) preentrenado sobre un corpus masivo de imagenes. La idea central, descrita en el articulo "Cellpose-SAM: superhuman generalization for cellular segmentation" (bioRxiv, abril de 2025), es reutilizar SAM como modelo fundacional de vision para obtener representaciones generales y anadir una cabeza de segmentacion especifica de microscopia, de modo que el modelo generalice a tipos celulares y modalidades de imagen sin reentrenamiento.

El repositorio ArthurZ/cellpose-sam-v2 es una conversion de esos pesos al ecosistema de Hugging Face, publicada por ArthurZ y etiquetada con los tags safetensors y cellpose. Contiene 304.628.928 parametros totales en formato safetensors y ocupa 1,2 GB, lo que corresponde a pesos en precision de 32 bits. No se documentan en la informacion disponible la licencia, los idiomas (no aplica, es un modelo de vision) ni la pipeline oficial.

Su relevancia actual radica en que un modelo de solo ~305 millones de parametros logra segmentacion de celulas con generalizacion muy alta a un coste computacional bajo: cabe en una GPU de consumo e incluso puede ejecutarse en CPU, lo que lo hace util para laboratorios de imagen biomedica que no disponen de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de tipo SAM (preentrenado como modelo fundacional) con cabeza de segmentacion Cellpose; detalles exactos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 304.628.928 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (1,2 GB, compatible con fp32) |
| Idiomas soportados | no aplica (modelo de segmentacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cellpose-SAM parte de la representacion de segmentacion clasica de Cellpose, basada en mapas de flujo espacial (dY, dX) y probabilidad de celula, a partir de los cuales las instancias se reconstruyen por integracion de gradientes. La innovacion respecto a las versiones anteriores de Cellpose es el uso de un backbone ViT procedente de SAM, aprovechando que SAM fue preentrenado como modelo fundacional sobre un conjunto de datos de imagenes muy amplio y diverso; ese preentrenamiento es lo que permite, segun los autores, una generalizacion "sobrehumana" a tipos celulares y modalidades no vistas durante el entrenamiento.

El detalle del numero de tokens de entrenamiento, la composicion exacta del dataset y el uso de tecnicas de alineacion (RLHF, DPO u otras) no estan disponibles en la informacion proporcionada. Tampoco se documentan en el repositorio innovaciones de inferencia como decodificacion especulativa, atencion lineal o variantes SSM.

## Capacidades

- Segmentacion de instancias celulares en imagenes de microscopia, produciendo una mascara por celula u objeto.
- Generalizacion a tipos celulares, tejidos y modalidades de imagen distintos de los vistos en entrenamiento, sin ajuste fino especifico.
- Funcionamiento como modelo fundacional: se apoya en las representaciones aprendidas por SAM durante su preentrenamiento.
- Entrada de imagenes multicanal (el pipeline de Cellpose trabaja habitualmente con canales de citoplasma y nucleo; la configuracion concreta de este repositorio no esta documentada).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no aplica a un modelo de vision.
- Capacidades multimodales texto-imagen: no documentadas en la informacion proporcionada.

## Casos de uso

- Segmentacion de celulas en cultivos in vitro: el modelo genera mascaras de instancia directamente sobre imagenes de microscopia de campo claro o fluorescencia, sustituyendo flujos de trabajo que requieren ajuste de umbrales y parametros por imagen.
- Analisis de imagenes de citometria de imagen de alto rendimiento: al caber en una GPU de consumo, puede ejecutarse sobre lotes grandes de placas multipocillo para contar y medir celulas de forma automatizada.
- Cuantificacion de confluencia y morfologia celular en ensayos de farmacologia: las mascaras por instancia permiten calcular area, perimetro y densidad celular, que son las metricas habituales en ensayos de citotoxicidad o proliferacion.
- Segmentacion de nucleos en histologia: el modelo puede aplicarse a imagenes teñidas para obtener contornos nucleares y alimentar pipelines de analisis espacial, en la linea del mapeo celular de cerebro completo descrito en la literatura reciente.
- Preprocesado para pipelines de analisis de imagen de tejidos: las mascaras generadas pueden servir de entrada a modelos posteriores de clasificacion de tipo celular o de analisis de vecindad.
- Investigacion en metodos de segmentacion: sirve como referencia (baseline) reproducible para comparar con enfoques promptables 3D como nnInteractive o con estrategias de inferencia basadas en difusion.
- Despliegue en laboratorio con hardware modesto: al tener unos 305 millones de parametros y un repositorio de 1,2 GB, puede ejecutarse en estaciones de trabajo con una unica GPU o en CPU para analisis por lotes no urgentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de bioRxiv sobre Cellpose-SAM describe cualitativamente una generalizacion "sobrehumana" en segmentacion celular, pero en la informacion proporcionada no se incluyen cifras concretas (IoU, F1, accuracy) ni comparaciones numericas con otros modelos, por lo que no se reproducen valores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB solo para los pesos en fp32; alrededor de 0,6 GB si se convierten a bf16/fp16. Sumando activaciones, es razonable esperar un consumo total en el rango de 2 a 4 GB, dependiendo de la resolucion de imagen (estimacion, no dato oficial).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en principio; el modelo tambien puede ejecutarse en GPU de datacenter (A100, H100) para procesar lotes grandes en paralelo, aunque no es necesario por tamano.
- Cabe en GPU de consumo: si, es un modelo de ~305 millones de parametros; tarjetas como RTX 3060, RTX 4070 o RTX 4090 pueden ejecutarlo con holgura. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: al ser un repositorio con pesos safetensors y tag cellpose, la via natural es la libreria de Cellpose y el stack de PyTorch/transformers. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje y no aplican aqui).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArthurZ/cellpose-sam-v2 | 304.628.928 | imagen de microscopia; resolucion no disponible | no disponible (paper describe generalizacion "sobrehumana") | no disponible | Hugging Face, safetensors |
| Cellpose-SAM (implementacion de referencia) | no disponible en la informacion proporcionada | imagen de microscopia | generalizacion "sobrehumana" segun el articulo | no disponible | publicacion bioRxiv y paquete Cellpose |
| SAM (modelo fundacional de segmentacion) | no disponible en la informacion proporcionada | imagen natural con prompts | no disponible | no disponible | no disponible en la informacion |
| nnInteractive | no disponible en la informacion proporcionada | segmentacion 3D promptable | no disponible | no disponible | publicacion en ResearchGate |

No se dispone de cifras comparativas verificables; la comparacion anterior es cualitativa y se limita a lo que aparece en los resultados de busqueda.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, por lo que no puede confirmarse que el uso comercial este permitido; conviene verificar la licencia de los pesos originales de Cellpose-SAM y de SAM antes de desplegarlo en produccion.
- No hay informacion sobre sesgos especificos, pero como todo modelo de segmentacion entrenado con datos de microscopia, puede degradarse ante modalidades, tinciones o resoluciones alejadas de su distribucion de entrenamiento.
- Riesgo de "alucinacion" en el sentido de mascaras espurias: falsos positivos en regiones sin celulas, sobre-segmentacion de objetos unicos o fusion de celulas adyacentes en tejidos densos.
- El modelo es de vision: no procesa lenguaje, no admite prompts de texto y no soporta tool calling ni razonamiento multi-paso.
- No se documentan la resolucion de entrada, el preprocesado esperado ni el pipeline oficial en la informacion proporcionada, lo que dificulta reproducir resultados sin consultar el repositorio y el articulo originales.
- El numero de descargas (4) y de likes (0) indica que la version subida tiene muy poca validacion por parte de la comunidad; conviene validar los pesos frente a la implementacion de referencia antes de usarlos en un flujo critico.
- Al tratarse de un modelo de 1,2 GB en safetensors, no se documentan versiones cuantizadas que faciliten su despliegue en entornos con restricciones de memoria muy estrictas, aunque el tamano es manejable.

## Enlaces

- Hugging Face: https://huggingface.co/ArthurZ/cellpose-sam-v2
- Cellpose-SAM: superhuman generalization for cellular segmentation (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.04.28.651001v1.full-text
- Artificial intelligence-driven whole-brain cell mapping (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S0896627325009833
- nnInteractive: Redefining 3D Promptable Segmentation (ResearchGate): https://www.researchgate.net/publication/389748847_nnInteractive_Redefining_3D_Promptable_Segmentation
- Diffusion-Based Inference for Heterogeneous Multichannel Segmentation (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.10.07.753438v1.full.pdf
- TSPO-PET bei Neuroinflammation (tesis, LMU Munich): https://edoc.ub.uni-muenchen.de/37074/1/Bartos_Laura_Maria.pdf
