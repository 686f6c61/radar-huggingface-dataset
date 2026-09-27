# canvit/probe-ade20k-40k-dv3s-256px

## Resumen

`canvit/probe-ade20k-40k-dv3s-256px` no es un modelo generativo ni un modelo de lenguaje: es una **sonda lineal de segmentación semántica** entrenada sobre características congeladas de DINOv3 ViT-S/16 a 256 px. La publica el equipo de CanViT (Canvas Vision Transformer) como referencia de "visión pasiva" dentro de su paper *CanViT: Toward Active-Vision Foundation Models* (NeurIPS 2026), con el objetivo de disponer de una línea base reproducible frente a la que medir su modelo de visión activa.

El repositorio solo contiene la cabecera de segmentación, de 59.286 parámetros: una convolución 1x1 con BatchNorm y dropout que proyecta las características de parche del backbone a 150 clases de ADE20K sobre una rejilla de 16x16. El backbone DINOv3 ViT-S/16 se carga aparte (`facebook/dinov3-vits16-pretrain-lvd1689m`) y permanece congelado; la sonda es, por tanto, un artefacto muy ligero que entrena en CPU o en cualquier GPU modesta.

Su relevancia es metodológica: fija un protocolo de probing (40.000 pasos, AdamW, aumentos de datos concretos) para comparar de forma justa entre backbones y frente a modelos de visión activa, y está liberado con licencia MIT, lo que permite reutilizarlo en investigación y en prototipos comerciales sin fricción de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Convolución 1x1 (proyección lineal por parche) con BatchNorm y dropout 0.1, sobre características congeladas de DINOv3 ViT-S/16 |
| Parámetros totales | 59.286 (solo la sonda; el backbone se carga por separado) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada de imagen fija de 256x256 px, salida de 16x16 parches |
| Tipos de cuantización | no disponible (el repositorio publica los pesos en safetensors; el entrenamiento usa autocast en bfloat16) |
| Idiomas soportados | no disponible (modelo exclusivamente visual, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de características | 384 (parches de 16x16 sobre entrada de 256 px) |
| Número de clases | 150 (esquema ADE20K / `scene_parse_150`) |
| Dataset de entrenamiento | `scene_parse_150` (ADE20K) |
| Pasos de entrenamiento | 40.000, con tamaño de lote 16 |
| Modelo base | `facebook/dinov3-vits16-pretrain-lvd1689m` |
| Librería | `canvit-pytorch` (>= 0.2; revisión `canvit-pytorch-0.1` para versiones anteriores) |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La sonda es intencionadamente minimalista: dropout, BatchNorm y una convolución 1x1 que recibe los parches de características de DINOv3 ViT-S/16 reorganizados como `[1, 16, 16, 384]` y produce logits `[1, 150, 16, 16]`. Es decir, una clasificación densa por parche sobre una rejilla de 16x16, sin decodificador convolucional, sin atención adicional y sin multi-escala. El backbone no se entrena: sus pesos quedan congelados y aportan la representación visual.

El protocolo de entrenamiento está documentado de forma explícita: 40.000 pasos con lote de 16, optimizador AdamW con learning rate máximo 0,0003 y weight decay 0,001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, aumentos de datos basados en recortes aleatorios con escala entre 0,5 y 2 y volteos horizontales, dropout de 0,1 y autocast en bfloat16. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación, algo que no aplica a un modelo de segmentación.

La innovación relevante no está en la sonda en sí, sino en su función: sirve como referencia de visión pasiva (una sola pasada sobre la imagen completa) dentro del paper de CanViT, cuyo modelo principal procesa la escena mediante una secuencia de vistazos y la memoriza en un lienzo global. La sonda permite aislar cuánto aporta la representación del backbone frente a la estrategia de visión activa.

## Capacidades

- Segmentación semántica densa de 150 clases sobre imágenes de 256x256 px, con salida de logits por parche en una rejilla de 16x16.
- Extracción de representaciones visuales congeladas de DINOv3 ViT-S/16, reutilizables para otras cabeceras.
- Funciona como línea base reproducible para comparar backbones bajo un protocolo de probing fijo.
- Inferencia en CPU: el ejemplo oficial de la model card se ejecuta en `torch.device("cpu")`.
- Compatibilidad con `canvit-pytorch` mediante `SegmentationProbe.from_pretrained(...)` y el cargador de teachers `load_teacher(...)`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión multimodal, tool calling, capacidades de agente ni modo de pensamiento.
- No dispone de capacidades multilingües: no procesa lenguaje.
- No se documentan capacidades de detección de instancias, segmentación panóptica, profundidad ni vídeo.

## Casos de uso

- Segmentación semántica de interiores y escenas exteriores: dado que está entrenada sobre ADE20K (150 clases como pared, suelo, cielo, muebles, vegetación), es adecuada para etiquetar escenas completas en prototipos de análisis visual.
- Línea base en investigación de representaciones visuales: permite medir de forma homogénea la calidad de las características de un backbone DINOv3 frente a alternativas, reutilizando exactamente el mismo protocolo de 40.000 pasos y los mismos hiperparámetros.
- Comparación frente a modelos de visión activa: al ser la referencia pasiva del paper de CanViT, sirve para cuantificar la ganancia de estrategias de vistazos secuenciales sobre una única pasada a resolución fija.
- Pretraseado barato de máscaras gruesas: para tareas donde basta una máscara de baja resolución (16x16) que luego se refine o se use como pista, la sonda evita entrenar un decodificador pesado.
- Etiquetado asistido en anotación de datasets: puede generar propuestas iniciales de máscaras que un anotador humano corrija, reduciendo el coste de construir conjuntos de segmentación.
- Prototipos y demos en hardware sin GPU: al ejecutarse en CPU y ocupar unos pocos cientos de kilobytes la sonda, es viable integrarla en entornos de desarrollo limitados o en validaciones previas a un despliegue mayor.
- Módulo de percepción escénica en pipelines de robótica o navegación indoor: proporciona un mapa semántico de 150 clases de la escena a resolución reducida, suficiente para decisiones de alto nivel sobre distribución del espacio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card detalla el protocolo de entrenamiento y el uso, pero no incluye métricas de segmentación (por ejemplo mIoU sobre la partición de validación de ADE20K), comparaciones numéricas con otras cabeceras ni curvas de entrenamiento. Tampoco se han encontrado resultados de terceros en la búsqueda web realizada.

## Requisitos de hardware

- VRAM de la sonda: aproximadamente 0,24 MB en float32 (59.286 parámetros). Es despreciable frente al backbone.
- Backbone: DINOv3 ViT-S/16 congelado; a 256 px y lote 1, la inferencia completa cabe holgadamente por debajo de 1 GB de VRAM (estimación, no confirmada en la información disponible).
- Entrenamiento de la sonda con backbone congelado y lote 16 a 256 px: del orden de 2 a 4 GB de VRAM en bfloat16 (estimación; la información disponible no aporta cifras medidas).
- GPU recomendadas: cualquier GPU consumer reciente sirve para el backbone (RTX 3060, RTX 4090, etc.); para lotes grandes o entrenamiento de sondas sobre datasets completos son adecuadas A100 o H100.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs con 8 GB o menos.
- Ejecución en CPU: soportada y ejemplificada en la model card oficial.
- Opciones de despliegue: `canvit-pytorch` (PyTorch) es la vía documentada. No se documentan exportaciones a GGUF, ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada solo describe con detalle este checkpoint, por lo que la comparación se limita a lo verificable. Los campos sin datos confirmados se marcan como no disponibles.

| Modelo | Tipo | Backbone | Resolución | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `canvit/probe-ade20k-40k-dv3s-256px` | Sonda lineal de segmentación (59.286 parámetros) | DINOv3 ViT-S/16 congelado | 256 px, salida 16x16, 150 clases | `scene_parse_150` | MIT | HuggingFace, 15 descargas, 0 likes |
| `facebook/dinov3-vits16-pretrain-lvd1689m` | Backbone sin cabecera de segmentación | DINOv3 ViT-S/16 | no disponible | LVD-1689M (según la información disponible) | no disponible en la información | HuggingFace |
| Otras sondas de la familia `canvit/*` | Sondas con el mismo protocolo de probing | no disponible | no disponible | no disponible | no disponible | Referenciadas en la colección `huggingface.co/canvit` |
| Fine-tuning completo de DINOv3 ViT-S/16 en ADE20K | no disponible en la información | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La sonda no funciona de forma autónoma: requiere cargar el backbone exacto `facebook/dinov3-vits16-pretrain-lvd1689m`. Cualquier cambio de backbone invalida los pesos.
- Resolución de entrada fija de 256 px, lo que produce máscaras de 16x16 y una segmentación de grano grueso que necesita posprocesado (interpolación o refinado) para uso visual.
- El espacio de etiquetas está restringido a las 150 clases de ADE20K; no cubre categorías fuera de ese esquema ni ofrece segmentación de instancias.
- Entrenada únicamente sobre `scene_parse_150`, por lo que se espera degradación ante dominios alejados del dataset (imágenes médicas, satélite, documentos, industriales).
- No se han publicado métricas de calidad en la información disponible; no hay ninguna cifra que respalde su precisión en producción.
- No existe validación comunitaria: 15 descargas y 0 likes en el momento de redactar esta ficha.
- La licencia del modelo es MIT, lo que permite uso comercial, pero conviene revisar los términos del dataset `scene_parse_150` (ADE20K) antes de reutilizar la sonda o sus derivados en entornos comerciales.
- Ausencia de capacidades de texto, agentes y tool calling; no debe plantearse como sustituto de un modelo de lenguaje o multimodal.
- En la model card se documentan dos revisiones de la librería (`canvit-pytorch 0.1` y `>= 0.2`); usar la revisión de pesos equivocada para la versión instalada puede provocar errores de carga.
- El repositorio ocupa 0,0 GB según el dato de HuggingFace: cualquier cifra de empaquetado o latencia debe medirse localmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-256px
- Modelo base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Colección completa de checkpoints: https://huggingface.co/canvit
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relación con esta ficha.
