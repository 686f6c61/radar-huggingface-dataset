# ai-hhmi/lmd-vitl-p8-simmim-lvd

## Resumen

`lmd-vitl-p8-simmim-lvd` es un codificador Vision Transformer 3D para microscopía de volúmenes, desarrollado por AI-HHMI (Allen Institute for Neural Dynamics y HHMI). Resuelve un problema concreto: extraer representaciones densas y transferibles de volúmenes de microscopía electrónica y de expansión a resolución de 8 nm, un dominio donde los pesos preentrenados en imágenes 2D naturales no se transfieren bien.

El modelo parte del checkpoint 2D `facebook/dinov3-vitl16-pretrain-lvd1689m` (DINOv3 ViT-L/16), cuyo kernel de parche se infla a 3D y se reduce de 16 a 8 vóxeles por suma de bloques. Después se preentrena con SimMIM durante 100 000 pasos sobre LMD, un corpus de 243 volúmenes de microscopía de 12 especies. El resultado es un ViT-L de 24 bloques, anchura 1024, 16 cabezas y 303 M de parámetros que opera sobre parches de 8 × 8 × 8 vóxeles con embeddings rotatorios 3D.

Es relevante porque la segmentación de conectómica y el análisis de organelos requieren codificadores que entiendan estructura tridimensional a escala nanométrica. Este modelo actúa como tronco congelable o ajustable sobre el que se construyen cabezas de segmentación (afinidades, clases de organelos) sin entrenar desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (DINOv3 ViT-L adaptado a volúmenes) |
| Parámetros totales | 302.965.770 (303 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrenamiento de 256³ vóxeles (parches de 8³, rejilla 32³) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | dinov3-license (otros términos, ver enlace de Meta) |
| Formato de pesos | safetensors (fp32, 1,21 GB) + config.json |

## Arquitectura y entrenamiento

La arquitectura replica el ViT-L de DINOv3: 24 bloques, anchura 1024, 16 cabezas de atención, ratio MLP 4, LayerScale, 4 storage tokens y un sesgo de clave enmascarado. La modificación clave es el embedding posicional rotatorio 3D, que reparte un tercio de los canales rotatorios a cada eje y elimina la tabla de posiciones. El parche es de 8 × 8 × 8 vóxeles, lo que con una ventana de 256³ produce una rejilla de 16 × 16 × 16 y 4096 tokens de salida.

El preentrenamiento usa SimMIM: se enmascara el 90 % de la entrada en bloques de 32³ vóxeles y una cabeza lineal predice los vóxeles ocultos con pérdida L1. La inicialización es el checkpoint DINOv3 ViT-L/16 entrenado en LVD-1689M, inflado a 3D (kernel 2D extendido en profundidad, canales RGB sumados, normalización ImageNet incorporada) y reducido de 16 a 8 vóxeles por suma de bloques. El entrenamiento corre 100 000 pasos con batch global 32 en 8 GPU, AdamW (β = 0,9/0,95, weight decay 0,05), learning rate 3e-4 tras 5 000 pasos de warm-up con decaimiento lineal hasta 3e-7, clipping de gradiente 1,0 y autocast bf16. La aumentación se limita a rotaciones en el plano.

Los datos son LMD: 243 volúmenes de microscopía de 12 especies, con 177 volúmenes de microscopía electrónica (mosca, ratón, pez cebra, humano, *C. elegans*, pinzón cebra y otros) y 66 de microscopía de expansión (mosca, ratón, *Danionella*), todos remuestreados a 8 nm isotrópicos y muestreados proporcionalmente a tamaño^0,4.

## Capacidades

- Extracción de características densas de volúmenes 3D de microscopía: `patch_features` devuelve tokens normalizados de la última capa y su rejilla; `forward_features` añade el token CLS y los 4 storage tokens.
- Mapas de características intermedios de cualquier bloque mediante `get_intermediate_layers`, con reshape a rejilla 3D.
- Aprendizaje autosupervisado de representaciones transferibles: sirve como tronco congelable o ajustable para cabezas de segmentación.
- Extracción de características para segmentación de neuronas por afinidades (modelo derivado `lmd-vitl-p8-affinity-lvd`).
- Extracción de características para clasificación de organelos celulares (modelo derivado `lmd-vitl-p8-cellmap-lvd`).
- Procesamiento de microscopía electrónica y de expansión en un único codificador.
- Entrada monocanal con ejes `(x, y, z)`, intensidades en [0, 1] y lados múltiplos de 8 vóxeles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un codificador de visión puro.

## Casos de uso

- Segmentación de neuronas en conectómica: se conecta el codificador a un decodificador UNETR que lee los bloques [7, 15, 23] y produce afinidades entre vóxeles, base para reconstruir el grafo de conectividad en volúmenes de microscopía electrónica.
- Anotación de organelos a escala de célula: con una cabeza de clasificación sobre los tokens de parche se etiquetan mitocondrias, retículo y otras estructuras en volúmenes de expansion microscopy, reduciendo el etiquetado manual.
- Preprocesado de pipelines de imagen masiva: al ser un `torch.nn.Module` estándar, se integra en lotes sobre crops de 256³ dentro de flujos Dask o similares para extraer embeddings de miles de volúmenes.
- Búsqueda y agrupamiento de parches morfológicos: los tokens de 1024 dimensiones permiten indexar regiones y recuperar vecinos por similitud para control de calidad o descubrimiento de fenotipos.
- Transferencia a nuevos modalidades de microscopía: el preentrenamiento en 243 volúmenes de 12 especies sirve de inicialización para ajuste fino con pocos datos en un microscopio o preparación nuevos.
- Detección de anomalías en adquisición: comparar embeddings de regiones frente a una referencia permite marcar artefactos de tinción, desenfoque o cortes defectuosos antes del análisis biológico.
- Segmentación de linajes en organismos modelo: el ajuste fino sobre volúmenes de *C. elegans*, pez cebra o *Danionella* aprovecha que estas especies están representadas en LMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el codificador no se evaluó por sí solo; las puntuaciones de segmentación de neuronas corresponden al modelo derivado `ai-hhmi/lmd-vitl-p8-affinity-lvd`.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 1,21 GB; con activaciones de una ventana 256³ (4096 tokens, 24 bloques) el consumo en bf16 se sitúa en el orden de pocos GB, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte bf16 y al menos 8-16 GB de VRAM para volúmenes completos; A100/H100 para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3090/4090 con bf16 y lotes pequeños; el código de ejemplo usa autocast bf16 en CUDA.
- Opciones de despliegue: no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama (no es un modelo de lenguaje). El despliegue es vía PyTorch con el código de `mia-train` en el commit `0fe3872`, cargando `model.safetensors` con `safetensors.torch.load_file`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-hhmi/lmd-vitl-p8-simmim-lvd | 303 M | Volúmenes 3D, parche 8³, 8 nm | SimMIM sobre LMD (243 volúmenes) | dinov3-license | Hugging Face |
| ai-hhmi/lmd-vitl-p8-simmim-scratch | 303 M (misma arquitectura) | Volúmenes 3D, parche 8³ | SimMIM sobre LMD desde inicialización aleatoria | dinov3-license | Hugging Face |
| facebook/dinov3-vitl16-pretrain-lvd1689m | ViT-L (2D) | Imágenes 2D, parche 16 | DINOv3 sobre LVD-1689M | dinov3-license | Hugging Face |
| ai-hhmi/lmd-vitl-p8-affinity-lvd | 303 M (encoder) + decodificador | Volúmenes 3D | Afinidades sobre este encoder, 100k pasos | dinov3-license | Hugging Face |

La comparación directa de rendimiento entre estos modelos no está disponible en la información proporcionada; la model card solo documenta la cadena de inicialización y los pasos de entrenamiento.

## Limitaciones y advertencias

- No se ha evaluado el codificador de forma aislada: no hay métricas propias publicadas, solo las de los modelos derivados.
- Solo se probó a 256³ vóxeles; otros tamaños funcionan según el autor pero no se validaron.
- Requiere resolución de 8 nm isotrópica: datos a otra escala deben remuestrearse antes de usarlo.
- Entrada monocanal con ejes `(x, y, z)`; los volúmenes almacenados como `(z, y, x)` (OME-Zarr, N5) necesitan transposición explícita.
- La normalización de intensidades debe replicar la de entrenamiento (8 bits /255; 16 bits y float recortados a percentiles 0,1 y 99,9), lo que introduce dependencia del preprocesado.
- La licencia `dinov3-license` no es una licencia open source estándar: hay que revisar los términos de Meta antes de uso comercial.
- El código de inferencia depende del repositorio `mia-train` en un commit concreto; sus paquetes de nivel superior (`models`, `layers`, `utils`, `distributed`, `data`) pueden colisionar con paquetes homónimos como el `distributed` de Dask.
- Riesgo de sesgo por composición del corpus: 12 especies, con predominio de mosca, ratón y pez cebra; el rendimiento en especies o modalidades poco representadas puede degradarse.
- No es un modelo generativo de texto ni soporta instrucciones: no debe plantearse como asistente ni como modelo multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Modelo base 2D: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Variante desde inicialización aleatoria: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Modelo de afinidades: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Modelo de afinidades desde scratch: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Modelo de clases de organelos: https://huggingface.co/ai-hhmi/lmd-vitl-p8-cellmap-lvd
- Código de inferencia y entrenamiento: https://github.com/AI-HHMI/mia-train (commit `0fe3872`)
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado: arXiv:2508.10104
