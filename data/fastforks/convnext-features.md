# fastforks/convnext-features

## Resumen

fastforks/convnext-features es una implementación de extracción de características basada en la familia ConvNeXt de Meta AI (Liu et al., 2022), empaquetada dentro del ecosistema fastforks. No se trata de un modelo nuevo entrenado desde cero, sino de un contenedor de inferencia que descarga los pesos oficiales publicados en los repositorios de `timm` (checkpoints preentrenados en ImageNet-22k) y los expone con una interfaz propia que devuelve `last_hidden_state` y `pooler_output`. El repositorio en Hugging Face es únicamente la model card: no aloja pesos, sino que referencia los ficheros `.safetensors` de los repos de `timm` y verifica su integridad mediante SHA-256.

La relevancia de esta ficha es doble. Por un lado, documenta una vía de uso de ConvNeXt como backbone de extracción de características de imagen con backend `portable` y backend `kernels` (kernels CUDA propios), con métricas de latencia y memoria medidas en una RTX 5060 Ti de 16 GB. Por otro, aclara el contrato de salida: `last_hidden_state` corresponde al mapa denso de la etapa 4 (stride 32) tratado como tokens, sin token de prefijo y sin normalizar, mientras que `pooler_output` es la LayerNorm de la media de esos tokens, equivalente al embedding pre-logits de `timm`.

El modelo cubre cuatro variantes (tiny, small, base, large) con pesos Apache-2.0 y uso comercial permitido. Está etiquetado como "experimental" por el autor y su pipeline declarado es `image-feature-extraction`. La librería es `fastforks`, no transformers, lo que condiciona el despliegue: no se carga con `AutoModel` estándar sin adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (CNN pura con bloques tipo transformer, Liu et al. 2022); backbone de extracción de características |
| Parametros totales | No disponible de forma explícita; variantes tiny, small, base y large (ConvNeXt estándar de `timm`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión); entrada de cualquier H x W >= 1, redimensionada o rellenada internamente |
| Tipos de cuantizacion | fp16 (portable y kernels); fp32 (ejecución original por defecto); TensorRT fp16 documentado |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y pesos); uso comercial permitido |
| Formato de pesos | safetensors (pesos alojados en repos de `timm`, no en este repo) |

## Arquitectura y entrenamiento

ConvNeXt es una red convolucional pura que moderniza el diseño de ResNet incorporando decisiones arquitectónicas tomadas de los Vision Transformers: convoluciones depthwise de 7x7, normalización LayerNorm en lugar de BatchNorm, activación GELU, menos capas de activación y un esquema de downsample con capas separadas. La familia se publicó en "A ConvNet for the 2020s" (Liu et al., 2022) y demostró que una CNN bien diseñada puede igualar o superar a los ViT de la época en ImageNet sin necesidad de mecanismos de atención.

Los checkpoints utilizados aquí son los preentrenados por Meta en ImageNet-22k (release completo de ImageNet de otoño de 2011, también citado como ImageNet-21k), en el formato de `timm`. No se documenta en la información disponible ningún ajuste fino adicional, destilación ni etapa de RLHF/DPO, algo esperable en un modelo de visión supervisado. La innovación técnica del paquete fastforks no está en el entrenamiento sino en la inferencia: kernels CUDA propios que aceleran la extracción entre 1,7x y 3,2x frente al backend portable, y entre 3,3x y 4,2x frente al código original, con reducción de memoria pico (por ejemplo, 204 MiB asignados en `convnext_base` con kernels frente a 537 MiB del original en fp32).

## Capacidades

- Extracción de características densas de imagen: devuelve `last_hidden_state` como el mapa de la etapa 4 (stride 32) tratado como secuencia de tokens.
- Embedding global de imagen: `pooler_output` como LayerNorm de la media de los tokens, equivalente al vector pre-logits de `timm`.
- Procesamiento de imágenes de tamaño arbitrario: cualquier H x W >= 1, con redimensionado o padding interno; probado hasta 3000x4000 en todas las variantes.
- Cuatro variantes de capacidad: `convnext_tiny`, `convnext_small`, `convnext_base` y `convnext_large`, todas con pesos `fb_in22k`.
- Dos backends: `portable` (portable a distintas plataformas) y `kernels` (kernels CUDA optimizados).
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 y ONNX (documentado con tiempos de compilación y construcción de engine).
- Verificación de integridad de pesos mediante SHA-256 contra el `card.toml` del proyecto.
- No soporta tool calling, agentes, razonamiento multi-step, texto ni audio: es exclusivamente un backbone visual.

## Casos de uso

- Búsqueda visual y recuperación por similitud: usar `pooler_output` como embedding global de imagen para indexar un catálogo y recuperar imágenes similares mediante distancia coseno; la variante `convnext_base` ofrece un equilibrio razonable entre calidad y 5,57 ms por imagen a 224x224 en el backend portable.
- Segmentación semántica y detección como backbone congelado: `last_hidden_state` proporciona el mapa stride-32 que alimenta cabezas de segmentación o detección; el tamaño arbitrario de entrada permite trabajar a la resolución nativa de la imagen sin recortes agresivos.
- Clasificación de imágenes con cabezal propio: extraer características con `convnext_large` y entrenar una cabeza lineal o MLP sobre `pooler_output` para dominios específicos (medicina, industria, satélite) con pocos datos etiquetados.
- Preprocesado en pipelines de visión por computador: integrar la extracción como etapa de un pipeline mayor (por ejemplo, clustering de imágenes o deduplicación) aprovechando la latencia de 1,09 ms de `convnext_tiny` con kernels a 224x224.
- Procesamiento de imágenes de alta resolución: con entradas probadas de 3000x4000 y un pico de 3,8 GiB en `convnext_large`, es viable procesar fotografías de documentos, radiografías o imágenes aéreas sin trocear.
- Despliegue en GPU de consumo: las cuatro variantes caben en una RTX 5060 Ti de 16 GB con margen amplio (88-413 MiB asignados con kernels a 224x224), lo que permite prototipado y servicios de baja concurrencia en hardware asequible.
- Aceleración en producción con TensorRT: exportar a TensorRT fp16 reduce la latencia a 0,726 ms en `convnext_tiny` y 1,51 ms en `convnext_base` a 224x224, con un coste de construcción de engine de 29,9-46,7 s.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en RTX 5060 Ti 16 GB (sm_120), entrada sintética 224x224, fp16 salvo donde se indica fp32:

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB asig./res.) | Memoria pico kernels (MiB asig./res.) |
|---|---|---|---|---|---|---|---|
| convnext_base.fb_in22k | 7,68 | 11,2 | 5,57 | 1,96 | 3,9x | 289 / 296 | 204 / 216 |
| convnext_large.fb_in22k | 10,5 | 11,5 | 5,53 | 3,23 | 3,3x | 600 / 612 | 413 / 434 |
| convnext_small.fb_in22k | 7,51 | 11,2 | 5,64 | 1,79 | 4,2x | 179 / 190 | 130 / 150 |
| convnext_tiny.fb_in22k | 3,89 | 5,91 | 3,18 | 1,09 | 3,6x | 117 / 130 | 88 / 110 |

Comparativa con `torch.compile` y TensorRT fp16 a 224x224:

| Modelo | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación (s) | Build ONNX+engine (s) |
|---|---|---|---|---|---|---|
| convnext_base.fb_in22k | 5,57 | 3,21 | 1,51 | 1,96 | 10,2 | 29,9 |
| convnext_large.fb_in22k | 5,53 | 3,34 | 2,50 | 3,23 | 9,87 | 46,7 |
| convnext_small.fb_in22k | 5,64 | 3,36 | 1,16 | 1,79 | 9,51 | 35,1 |
| convnext_tiny.fb_in22k | 3,18 | 2,08 | 0,726 | 1,09 | 12,0 | 33,9 |

No se han publicado resultados de benchmarks de precisión (ImageNet top-1, mAP, etc.) en la información disponible; la model card menciona una sección "Accuracy" pero el contenido proporcionado se corta antes de mostrar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia a 224x224: 88-110 MiB (`convnext_tiny`), 130-150 MiB (`convnext_small`), 204-216 MiB (`convnext_base`) y 413-434 MiB (`convnext_large`) con el backend kernels; entre 1,7x y 2,6x más con el backend portable.
- Imágenes de alta resolución (3000x4000, fp16, backend portable): 1,9 GiB en tiny y small, 2,5 GiB en base y 3,8 GiB en large (pico asignado).
- Cabe en cualquier GPU de consumo con al menos 4-6 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090 y la RTX 5060 Ti de 16 GB usada en las mediciones.
- GPU de datacenter (A100, H100) no son necesarias para inferencia, aunque pueden aportar mayor throughput en servicios de alta concurrencia; no se documentan mediciones en estas GPU.
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; exportación a ONNX y TensorRT; `torch.compile` compatible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia documentada: 1,09-3,23 ms por imagen a 224x224 con kernels; 0,726-2,50 ms con TensorRT fp16. Throughput no documentado de forma explícita.
- Tiempo de carga: 1,57-2,78 s con kernels; primera llamada: 0,18-0,24 s con kernels.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastforks/convnext-features (base) | CNN backbone | No disponible (ConvNeXt-B) | Cualquier H x W >= 1 | Apache-2.0 | Pesos en `timm`, wrapper en fastforks |
| timm/convnext_base.fb_in22k | CNN backbone | No disponible (ConvNeXt-B) | Cualquier H x W >= 1 | Apache-2.0 | Hugging Face (`timm`) |
| ResNet-50 (referencia clásica) | CNN backbone | ~25,6 M | Cualquier H x W >= 1 | BSD-3 / Apache-2.0 según checkpoint | Amplia |
| ViT-B/16 (referencia transformer) | ViT | ~86 M | 224x224 fijo (posicional) | Apache-2.0 en checkpoints de `timm` | Amplia |

La comparación relevante es contra los propios checkpoints de `timm`: fastforks no modifica los pesos, solo el envoltorio de inferencia. Frente a ResNet-50, ConvNeXt-B ofrece mejor calidad en ImageNet según el paper original (no se aportan cifras en la información disponible), a costa de más parámetros. Frente a ViT-B/16, ConvNeXt mantiene resolución de entrada variable de forma nativa, sin interpolación posicional, lo que simplifica el procesamiento de imágenes de alta resolución.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no procesa texto, audio ni realiza razonamiento; no dispone de tool calling ni capacidades de agente.
- Etiquetado como "experimental" por el autor; no se documenta una validación de precisión en la información proporcionada.
- El repositorio no aloja pesos: depende de la disponibilidad de los repos de `timm` y de la verificación SHA-256 contra `card.toml`; si un repo de `timm` cambia de revisión, el hash puede dejar de coincidir.
- La model card advierte que las cadenas de licencia del código original se registran "tal cual" y que el paquete es de uso de investigación; conviene revisar las condiciones antes de usos distintos. Los pesos están declarados Apache-2.0 con uso comercial permitido.
- Sesgos conocidos: los derivados de ImageNet-22k (dominio web, anotaciones ruidosas, desbalance de clases); no se documenta un análisis específico de sesgos.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos en clasificación o recuperación derivados de la calidad del embedding en dominios alejados de ImageNet.
- La latencia y memoria documentadas se midieron en una única GPU (RTX 5060 Ti, sm_120); en otras arquitecturas los números pueden variar.
- No se documenta soporte de batching explícito ni de entradas múltiples; la interfaz descrita procesa una imagen RGB por llamada.
- La sección de precisión de la model card está incompleta en la información disponible; no se pueden validar cifras de exactitud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/convnext-features
- Código del proyecto: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/convnext_features/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original de `timm`: https://github.com/huggingface/pytorch-image-models (commit `0df212b369a5`)
- Pesos `convnext_base.fb_in22k`: https://huggingface.co/timm/convnext_base.fb_in22k
- Pesos `convnext_large.fb_in22k`: https://huggingface.co/timm/convnext_large.fb_in22k
- Pesos `convnext_small.fb_in22k`: https://huggingface.co/timm/convnext_small.fb_in22k
- Pesos `convnext_tiny.fb_in22k`: https://huggingface.co/timm/convnext_tiny.fb_in22k
- Evidencia de licencia: https://huggingface.co/timm/convnext_base.fb_in22k/blob/9afd4146adabf1b6e861d0f1ac2e7baa7c8dd1b7/README.md
