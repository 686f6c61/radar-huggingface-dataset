# anonymousICLR2027/many-views-one-world

## Resumen

SyncWM es un artefacto de inferencia anónimo presentado a ICLR 2027 (identificador `anonymousICLR2027/many-views-one-world`) para generación de vídeo multi-vista y modelado del mundo mediante difusión. No es un modelo generativo autónomo: el repositorio contiene dos adaptadores (checkpoints de tipo LoRA con encoder denso y proyector de estado) más el código de muestreo, y requiere obligatoriamente un modelo base externo, LingBot-World, junto con el VAE de Wan2.1 y el text encoder UMT5-XXL. El tamaño del repositorio es de 2,1 GB, lo que corresponde únicamente a los adaptadores, las herramientas y el runtime vendorizado, no al modelo completo.

La innovación principal que describe la model card es un esquema de enrutado mixto LOW/HIGH durante el proceso de eliminación de ruido (denoising). Por encima de la frontera `sigma = 0.947` actúa el adaptador HIGH (sin condicionamiento de interacción); por debajo de ese umbral pasa a actuar el adaptador LOW, que sí incorpora un proyector de interacción (`134 -> 128`) y es el único que consume condicionamiento de interacción. Ambos adaptadores se entrenaron hasta el paso 8500 y se distribuyen como checkpoints PyTorch saneados, sin estado del optimizador ni metadatos de reanudación.

La relevancia del lanzamiento es doble: por un lado, publica una implementación de inferencia reproducible con contratos de entrada documentados (`docs/INFERENCE.md`, `docs/CHECKPOINTS.md`) y hashes SHA256 verificables; por otro, la propia model card reconoce caveats abiertos, como la falta de revisiones públicas fijadas para las dependencias externas y una discrepancia de resolución entre el entrenamiento de HIGH y su uso en runtime. Es, por tanto, un artefacto de investigación en fase temprana, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video con enrutado mixto de dos adaptadores (HIGH/LOW); los adaptadores incorporan LoRA, encoder denso, proyector de estado y, en LOW, proyector de interaccion. No se especifica la arquitectura del backbone subyacente (no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica: no es un MoE de transformers, sino dos adaptadores enrutados por umbral de sigma durante el denoising |
| Longitud de contexto | no disponible; la generacion por defecto es de 81 fotogramas con 21 fotogramas latentes |
| Tipos de cuantizacion | no disponible; los checkpoints distribuidos son `.pt` de PyTorch en precision de entrenamiento (el text encoder UMT5-XXL se referencia en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`): `checkpoints/low_interaction_step8500.pt` y `checkpoints/high_adapter_step8500.pt`; no se distribuyen safetensors ni GGUF |
| Resolucion de salida por defecto | 832 x 480 |
| Duracion / FPS por defecto | 81 fotogramas a 16 FPS (aproximadamente 5,06 segundos) |
| Pasos de muestreo por defecto | 70 (`base_sampling_steps`), guide scale 5.0, shift 3.0, chunk size 3 |
| Frontera de enrutado | sigma = 0.947 (`--boundary-override`) |
| Tamano del repositorio | 2,1 GB |
| Paso de entrenamiento de los checkpoints | 8500 |

## Arquitectura y entrenamiento

El release no incluye el backbone generativo: se distribuyen adaptadores que se acoplan a un modelo base externo (LingBot-World, variante de cámara) mediante LoRA, un encoder denso y un proyector de estado; el adaptador LOW añade además un proyector de interacción que mapea 134 dimensiones a 128. La inferencia se organiza como una ruta mixta sobre un sampler de difusión: el adaptador HIGH se aplica en la fase de alto ruido (`t >= 0.947`) y el LOW en la fase de bajo ruido (`t < 0.947`), de modo que el condicionamiento de interacción solo está activo en la segunda mitad del proceso. La implementación de muestreo (`tools/`) y el runtime compatible de LingBot (`vendor/lingbot/`) se incluyen en el repositorio, con perfil de dependencias para CUDA 12.4 y `flash-attn==2.7.4.post1` como requisito explícito.

No se detalla en la información disponible el número de tokens o clips de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO; tampoco se documenta qué variantes de atención o de decodificación especulativa usa el backbone. Los checkpoints se describen como versiones de inferencia saneadas, verificadas tensor a tensor contra los checkpoints de entrenamiento originales (claves, formas, dtypes y valores), con hashes SHA256 publicados. Los datos de condicionamiento (caché densa `[7,240,416]`, caché alineada y caché de estado/interacción) no se distribuyen y debe aportarlos el usuario en forma de manifiestos JSON/JSONL y ficheros NPZ referenciados.

## Capacidades

- Generación de vídeo condicionada por cámara: el pipeline consume un fotograma inicial (`image.jpg`), poses (`poses.npy`) e intrínsecas (`intrinsics.npy`) por clip, y produce vídeo a 832 x 480 y 16 FPS.
- Modelado del mundo multi-vista: la etiqueta del repositorio y el diseño de condicionamiento por cámara apuntan a la síntesis de vistas coherentes a partir de trayectorias de cámara, no a text-to-video genérico.
- Condicionamiento por texto: el pipeline admite `prompt.txt` opcional por clip y utiliza el text encoder UMT5-XXL con el tokenizador `google/umt5-xxl`.
- Condicionamiento de interacción: el adaptador LOW incorpora un proyector de interacción dedicado, activable mediante `--interaction-variant true`, que fusiona datos de estado/interacción temporalmente alineados.
- Composición de adaptadores en dos fases: el enrutado HIGH/LOW por umbral de sigma permite combinar un experto entrenado sin interacción para el ruido alto y otro con interacción para el ruido bajo en una sola generación.
- Control de muestreo fino: pasos base, guía, shift, chunking, frontera de enrutado, semilla y resolución de destino son parámetros de línea de comandos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües declaradas: no disponible.
- Modo de razonamiento (thinking), audio o visión de imágenes estáticas: no disponible; la modalidad documentada es vídeo.

## Casos de uso

- Investigación en modelado del mundo: reproducir la ruta mixta LOW/HIGH sobre el modelo base LingBot-World para estudiar cómo el condicionamiento de interacción afecta a la coherencia temporal en la fase de bajo ruido. El repositorio incluye configuración de ruta y contratos de inferencia para este fin.
- Generación de vídeo con trayectoria de cámara controlada: dado un fotograma inicial y una secuencia de poses e intrínsecas, producir un clip de 81 fotogramas con movimiento de cámara prescrito, útil para *novel view synthesis* en entornos sintéticos o reconstruidos.
- *Data augmentation* para percepción: generar vistas adicionales de una escena a partir de una única imagen y poses conocidas, para ampliar conjuntos de entrenamiento de modelos de profundidad, odometría visual o *SLAM*.
- Recreación de escenas para robótica y simulación: sintetizar observaciones desde cámaras virtuales para preentrenar políticas o módulos de percepción antes del despliegue en hardware real, aprovechando el condicionamiento por intrínsecas y poses.
- Evaluación comparativa de adaptadores: el release expone dos checkpoints del mismo paso (8500) con y sin proyector de interacción, lo que permite aislar experimentalmente el efecto del condicionamiento de interacción manteniendo constante el resto del pipeline.
- Reproducción de resultados para revisión por pares: los manifiestos de hashes y el inventario de tensores permiten verificar que los checkpoints evaluados coinciden con los descritos en el artículo asociado, siempre que se disponga de las dependencias externas.
- Prototipado de vídeo multi-vista en pipelines de investigación: con una sola GPU y el flag `--no-offload-model` desactivado, se puede integrar el sampler en *scripts* por lotes que recorran varios `clip-id` de un *split* de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, PSNR, LPIPS, CLIP-sim ni similares) ni comparaciones numéricas con otros sistemas; únicamente declara que una generación completa con la ruta mixta no se ha vuelto a ejecutar desde este paquete bajo las condiciones de hardware disponibles, y señala la discrepancia de resolución entre entrenamiento e inferencia de HIGH como caveat de validación.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican cifras de memoria para los adaptadores ni para el conjunto base + adaptadores.
- Componentes que condicionan la memoria: además de los adaptadores (2,1 GB de repositorio), el pipeline carga el modelo base LingBot-World, el VAE de Wan2.1 y el text encoder UMT5-XXL, que son externos y no se distribuyen en este repositorio.
- GPU recomendadas: no disponible. El perfil de dependencias empaquetado apunta a CUDA 12.4 y la instalación exige `flash-attn==2.7.4.post1`, lo que implica una GPU NVIDIA compatible con esa versión de CUDA y con FlashAttention.
- Compatibilidad con GPU de consumo: no confirmada. La resolución de trabajo (832 x 480, 81 fotogramas, 70 pasos de muestreo, 21 fotogramas latentes) y la presencia del text encoder UMT5-XXL hacen razonable esperar requisitos elevados, pero no se aporta ninguna medición.
- Descarga de memoria a CPU: el *script* de muestreo expone `--no-offload-model`, lo que indica que la ruta por defecto contempla algún tipo de *offload* y que puede desactivarse para mantener todo el modelo en memoria.
- Opciones de despliegue: el release solo documenta ejecución mediante el *script* `tools/sample_memory_dense_adapter_interaction_eval_v1.py` con `PYTHONPATH` apuntando a `tools/` y `vendor/lingbot/`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni existe formato GGUF.
- Latencia y throughput: no disponible. Dependen del modelo base externo, del número de pasos (70 por defecto) y del *chunk size* (3 por defecto).
- Almacenamiento y datos auxiliares: se requiere además espacio para el modelo base, el VAE, el text encoder, la caché densa con manifiesto `[7,240,416]`, la caché alineada en JSONL y la caché de estado/interacción con ficheros NPZ.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los sistemas con los que podría compararse. La única comparación documentada en el material disponible es de tipo estructural, no de rendimiento:

| Sistema | Relacion con SyncWM | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SyncWM (este release) | Adaptadores de inferencia sobre modelo base externo | no disponible | no disponible (81 fotogramas por generacion) | no disponible | Apache 2.0 | Publicado en HuggingFace; requiere dependencias externas |
| LingBot-World (base) | Backbone obligatorio al que se acoplan los adaptadores | no disponible | no disponible | no disponible | no disponible | Revision publica exacta sin fijar (marcada como TODO en la model card) |
| Wan2.1 VAE | Decodificador latente requerido en runtime | no disponible | no disponible | no disponible | no disponible | Fuente y revision exacta sin identificar (TODO) |
| UMT5-XXL | Text encoder y tokenizador del pipeline | no disponible | no disponible | no disponible | no disponible | Tokenizador via `google/umt5-xxl`; revision del checkpoint sin fijar (TODO) |

## Limitaciones y advertencias

- No es un modelo autónomo: los dos checkpoints son adaptadores y no generan nada sin el modelo base LingBot-World, el VAE de Wan2.1 y el text encoder UMT5-XXL.
- Dependencias sin fijar: la model card marca explícitamente como TODO la revisión pública exacta del modelo base, del VAE y del checkpoint del text encoder, por lo que la reproducibilidad completa no está garantizada.
- Caveat de validación por resolución: LOW consume en runtime una condición densa `[7,240,416]`, mientras que HIGH se entrenó con `[7,176,320]`, pero en inferencia consume el mismo manifiesto compartido `[7,240,416]`. El propio autor lo describe como linaje de resolución mixta.
- Inferencia no reverificada end-to-end: la model card indica que no se ha vuelto a ejecutar una generación completa de la ruta mixta desde este paquete con el hardware disponible; solo se ha validado de forma estática (parseo de CLI, compatibilidad de grupos de estado, inventario de tensores y hashes).
- Datos de condicionamiento no incluidos: las cachés densa, alineada y de estado/interacción son aportadas por el usuario, de modo que los resultados dependen de la calidad y del formato de esos datos auxiliares.
- Sesgos conocidos: no disponible. No se documenta análisis de sesgos ni composición del dataset de entrenamiento.
- Riesgo de alucinación: no evaluado en la información disponible; en generación de vídeo se traduce en artefactos visuales, inconsistencias temporales y deriva geométrica respecto a las poses de cámara, pero no hay métricas publicadas.
- Limitaciones de contexto e idioma: no disponible. No se declaran idiomas soportados ni límites de longitud más allá de los 81 fotogramas y 21 fotogramas latentes de la configuración por defecto.
- Uso comercial: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial de los adaptadores; sin embargo, la licencia del modelo base, del VAE de Wan2.1 y del text encoder UMT5-XXL es independiente y debe verificarse por separado antes de cualquier explotación comercial.
- Carácter anónimo y estado de revisión: se trata de un envío anónimo a ICLR 2027 con 0 descargas y 0 likes en el momento de la consulta; no debe tratarse como un artefacto estable ni mantenido.
- Ausencia de soporte de herramientas: no se documenta *tool calling*, ni modo agente, ni API de servidor; la única interfaz es un *script* de línea de comandos.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/anonymousICLR2027/many-views-one-world
- Documentación de inferencia incluida en el repositorio: `docs/INFERENCE.md`
- Documentación de checkpoints incluida en el repositorio: `docs/CHECKPOINTS.md`
- Configuración de ruta y muestreo: `configs/mixed_route.json`
- Inventario de tensores y hashes: `checkpoint_manifest.json`
- Script de muestreo: `tools/sample_memory_dense_adapter_interaction_eval_v1.py`
- Runtime vendorizado de LingBot: `vendor/lingbot/`
- Tokenizador UMT5: `google/umt5-xxl` (a través de la caché local de HuggingFace o de la resolución habitual de Transformers)
- Paper, blog o repositorio adicional: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de soporte de Microsoft, sin relación con el artefacto).
