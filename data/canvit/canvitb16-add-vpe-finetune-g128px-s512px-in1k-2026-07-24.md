# canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-07-24

## Resumen

CanViT-B (Canvas Vision Transformer, variante base) es un modelo de visión artificial para clasificación de imágenes desarrollado por el grupo canvit (autores del paper: Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna). Este checkpoint concreto es el resultado del ajuste fino extremo a extremo sobre ImageNet-1k, partiendo del modelo preentrenado en ImageNet-21k `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` mediante la estrategia linear probing + fine-tuning (LP-FT). El resultado declarado por el autor es un 84,44 % de top-1 en el split de validación de ImageNet-1k.

La particularidad del modelo es que se trata de un modelo de visión activa: no procesa la imagen completa de una sola pasada, sino que observa la escena mediante una secuencia de "glimpses" (vistazos) de 128 x 128 píxeles sobre escenas de 512 x 512 píxeles, y acumula la información en un canvas (lienzo) de estado de 32 x 32 celdas que actúa como memoria espacial. Esto lo aleja del paradigma ViT estándar y lo acerca a los modelos de atención selectiva tipo fóvea, con la promesa de reducir cómputo por inferencia manteniendo la precisión.

El modelo tiene 95.928.936 parámetros (unos 96 M, ~0,4 GB en el repositorio), se distribuye bajo licencia MIT, se publica en formato safetensors y requiere la librería propia `canvit-pytorch>=0.2`. Es relevante ahora porque los autores lo presentan como paso hacia "modelos fundacionales de visión activa" (paper en NeurIPS 2026), una línea alternativa a escalar ViT con entradas de resolución fija creciente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer base (ViT-B/16, parches de 16 px) con estado recurrente tipo canvas y política de visión activa (secuencia de glimpses) |
| Parametros totales | 95.928.936 (aproximadamente 96 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM. Entrada: escenas de 512 x 512 px; cada glimpse cubre 128 x 128 px; canvas de estado de 32 x 32 celdas; la model card evalúa con T = 21 glimpses |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors; no se documentan recetas de cuantización) |
| Idiomas soportados | No aplica: es un modelo de clasificación de imágenes y no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño de repositorio: 0,4 GB) |
| Libreria de inferencia | canvit-pytorch >= 0.2 |
| Tarea (pipeline) | image-classification |
| Dataset de ajuste fino | ImageNet-1k |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Inicialización del cabezal | Fusión del readout CLS del modelo preentrenado con la sonda DINOv3 `canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe` |
| Fecha de publicación del repositorio | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es un ViT-B/16 adaptado a visión activa: el modelo recibe un glimpse de 128 px (muestreado de una escena de 512 px en un punto de vista determinado), lo codifica y actualiza un estado persistente llamado canvas, de 32 x 32 celdas, que resume la escena observada hasta ese momento. La predicción se produce en cada glimpse, de modo que la clasificación puede refinarse de forma incremental. El entrenamiento de ajuste fino se realizó con 4 rollouts de glimpses F-IID de 128 px sobre escenas de 512 px, canvas de 32 x 32 y retropropagación completa en el tiempo (full BPTT).

El procedimiento de ajuste fue LP-FT (primero linear probing y después fine-tuning extremo a extremo) durante 100.000 de los 100.080 pasos previstos, con batch size de 256, optimizador AdamW, learning rate de 2,5e-05, weight decay de 0,0001, recorte de gradiente de 1, calentamiento lineal de 25.000 pasos seguido de decaimiento coseno hasta 0 y pérdida de entropía cruzada en cada glimpse con label smoothing de 0,1. El entrenamiento se ejecutó con JAX/Flax NNX sobre Cloud TPU y los pesos se exportaron a PyTorch para su distribución en safetensors. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa (no aplicables a una tarea de clasificación).

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con logits producidos por el cabezal `CanViTForImageClassification`.
- Procesamiento activo por secuencia de vistazos: el modelo recibe un punto de vista (`Viewpoint`) y un glimpse muestreado de la escena, y actualiza su estado interno.
- Refinamiento progresivo de la predicción: la salida se emite en cada glimpse, por lo que la precisión puede mejorar con más vistazos (la métrica declarada corresponde al último glimpse con T = 21).
- Memoria espacial mediante canvas de 32 x 32 celdas, inicializable con `init_state(batch_size, canvas_grid_size)`.
- Extracción de representaciones: el readout CLS del modelo preentrenado se usó para inicializar el cabezal, lo que indica que el backbone es reutilizable para transferencia (LP-FT).
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni un modelo multimodal texto-imagen.
- No soporta agentes, razonamiento multi-paso en lenguaje ni generación de texto.
- No es multilingüe: no procesa texto.
- No ofrece modo "thinking", visión-lenguaje, audio ni generación; su única modalidad de entrada es imagen RGB y su salida es una distribución sobre clases.

## Casos de uso

- Clasificación de imágenes de alta resolución con presupuesto de cómputo acotado: el modelo permite observar escenas de 512 x 512 px mediante glimpses de 128 px, de modo que se puede ajustar el coste de inferencia eligiendo cuántos vistazos se ejecutan en lugar de procesar la imagen completa a resolución nativa.
- Control de calidad industrial: clasificación de piezas o defectos en líneas de producción donde la cámara captura escenas amplias y el modelo puede centrarse secuencialmente en regiones relevantes gracias al estado de canvas.
- Etiquetado de datasets a escala: al ser un clasificador ImageNet-1k con licencia MIT y solo ~96 M de parámetros, puede usarse para preetiquetar y filtrar grandes volúmenes de imágenes antes de una revisión humana.
- Backbone para transferencia en dominios específicos: el esquema LP-FT documentado sugiere que el modelo es adecuado como punto de partida para ajustar sobre nuevos conjuntos de clases (medicina, teledetección, retail) con recursos moderados.
- Investigación en visión activa: sirve como referencia reproducible para comparar políticas de selección de puntos de vista, número de glimpses y estrategias de memoria espacial frente a ViT estáticos.
- Robótica y sistemas embarcados con cómputo variable: al producir predicciones en cada glimpse, permite políticas de parada temprana cuando la confianza es suficiente, útil en plataformas con presupuesto energético limitado.
- Análisis de imágenes de satélite o dron: la combinación de escena amplia (512 px) y vistazos pequeños (128 px) encaja con imágenes de alta resolución donde el objeto de interés ocupa una fracción reducida del encuadre.

## Benchmarks y rendimiento

| Dataset | Split | Metrica | Valor | Condiciones |
|---|---|---|---|---|
| ImageNet-1k | validation | Top-1 accuracy | 84,44 | C2F, T = 21, media sobre 11 semillas de política, en el último glimpse; no verificado |

No se han publicado en la información disponible otros resultados de benchmarks (no hay MMLU, HumanEval, GSM8K ni equivalentes, porque el modelo no es un modelo de lenguaje). El único dato disponible es el declarado por el autor en el model-index y no está marcado como verificado (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,38 GB en fp32, 0,19 GB en fp16/bf16 y 0,10 GB en int8 para los 95.928.936 parámetros, sin contar activaciones ni el estado del canvas (que escala con el batch y con el tamaño de canvas de 32 x 32).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; RTX 3060, RTX 4070, RTX 4090, A100 y H100 funcionan sin problema. El modelo también es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (y en muchas integradas, dado el reducido número de parámetros).
- Opciones de despliegue: PyTorch con la librería `canvit-pytorch>=0.2`, tal como muestra la model card. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportación a GGUF u ONNX en la información disponible.
- Latencia y throughput estimados: no disponibles. El coste de inferencia crece con el número de glimpses ejecutados; la evaluación declarada usa T = 21, mientras que el ajuste fino se realizó con 4 glimpses.

## Comparativa con modelos similares

| Modelo | Arquitectura base | Parametros | Paradigma de entrada | Top-1 en ImageNet-1k (val) | Licencia |
|---|---|---|---|---|---|
| CanViT-B (este checkpoint) | ViT-B/16 + canvas y visión activa | 95.928.936 | Secuencia de glimpses (128 px) sobre escena de 512 px | 84,44 (declarado, no verificado) | MIT |
| ViT-B/16 supervisado (ImageNet-21k) | ViT-B/16 estándar | Aproximadamente 86 M | Imagen completa de resolución fija | No disponible en la información proporcionada | No disponible en la información proporcionada |
| DeiT-B/16 | ViT-B/16 con destilación | Aproximadamente 86 M | Imagen completa de resolución fija | No disponible en la información proporcionada | No disponible en la información proporcionada |
| DINOv3 ViT-B/16 | ViT-B/16 auto-supervisado | Aproximadamente 86 M | Imagen completa de resolución fija | No disponible en la información proporcionada | No disponible en la información proporcionada |

Nota: los datos de los modelos comparativos no proceden de la información proporcionada en esta ficha (salvo la referencia a DINOv3 como origen de la sonda usada para inicializar el cabezal); deben verificarse en sus propias model cards antes de cualquier uso en producción. La comparación estructural relevante es que CanViT-B añade unos 10 M de parámetros sobre un ViT-B/16 estándar y consume la imagen de forma secuencial en lugar de una sola pasada.

## Limitaciones y advertencias

- Ámbito de salida restringido: el cabezal está ajustado sobre las 1.000 clases de ImageNet-1k; no produce descripciones, etiquetas libres ni texto. Para cualquier otro conjunto de clases requiere ajuste adicional.
- Sesgos heredados de los datos: al ajustarse sobre ImageNet-1k, hereda los sesgos conocidos de ese conjunto (desequilibrio de clases, representación geográfica y cultural limitada). No se documenta ningún proceso de mitigación.
- Riesgo de error de clasificación: no hay riesgo de "alucinación" en el sentido generativo, pero sí de falsos positivos y confusiones entre clases visualmente próximas, y la confianza del modelo no está calibrada de forma documentada.
- Discrepancia entre entrenamiento y evaluación: el ajuste se realizó con 4 glimpses F-IID, mientras que el resultado de 84,44 % se reporta con T = 21 (política C2F) y media sobre 11 semillas de política. Esto implica que el rendimiento depende fuertemente de la política de selección de puntos de vista, no solo de los pesos.
- Reproducibilidad condicionada: la arquitectura no es estándar y exige la librería `canvit-pytorch>=0.2`; no se documenta integración con `transformers`, vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en infraestructuras estándar.
- Licencia: los pesos se publican bajo MIT, lo que permite uso comercial, pero la model card indica que el cabezal se inicializó fusionando el readout CLS con una sonda DINOv3 (`dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe`). Conviene verificar las condiciones de la licencia de DINOv3 antes de un uso comercial, ya que puede no ser equivalente a MIT.
- Estado del arte en madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, el resultado de benchmark está marcado como no verificado y no hay validación independiente publicada en la información disponible.
- Idiomas y texto: no aplica soporte multilingüe ni procesamiento de lenguaje; cualquier caso de uso conversacional o de agente queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-07-24
- Modelo base (preentrenado en ImageNet-21k): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda DINOv3 usada para inicializar el cabezal: https://huggingface.co/canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints de la familia: https://huggingface.co/canvit
