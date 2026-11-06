# devin-lai/Hi3Dv1.0-mlx-int4

## Resumen

Hi3Dv1.0-mlx-int4 es una variante cuantizada a 4 bits del modelo Hi3Dv1.0 (desarrollado por hi3d-official), un sistema de image-to-3D orientado a refinamiento de geometria sobre una malla gruesa existente. Esta version concreta ha sido convertida al formato MLX por el usuario devin-lai para su ejecucion nativa en Apple Silicon, con pesos transformer en cuantizacion afina de 4 bits y computo en FP16. No es un modelo de lenguaje: no genera texto ni codigo, sino que produce mallas 3D refinadas a partir de una imagen de referencia y un mesh inicial.

El modelo base emplea una arquitectura transformer adaptada al dominio geometrico, con un VAE compartido y encoders de imagen fijos. El repositorio ocupa 2,4 GB y ofrece variantes selectivas segun resolucion de salida (512³, 1024³ y 1536³). La licencia es la Hi3D Open License Agreement v1.0, que no equivale a MIT ni Apache y debe revisarse antes de cualquier uso comercial.

Su relevancia actual radica en que permite ejecutar un pipeline de refinamiento 3D en hardware de consumo Apple (probado sobre M5 con 32 GiB), algo poco habitual en este tipo de modelos. No obstante, el propio autor advierte de una "deriva de calidad sustancial" medida respecto al modelo original, por lo que se posiciona como opcion de almacenamiento prioritario antes que de maxima fidelidad geometrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con VAE compartido y encoders de imagen (pipeline image-to-3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo no textual) |
| Tipos de cuantizacion | Afina de 4 bits (MLX affine 4-bit block weights) con computo FP16; tensores sensibles en precision original |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | hi3d-open-license-agreement-v1.0 (no es MIT ni Apache) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El modelo se basa en bloques transformer adaptados a la tarea de refinamiento geometrico, acompanados de un VAE compartido y encoders de imagen fijos que se descargan desde el repositorio Hi3Dv1.0-mlx-shared. La variante int4 aplica cuantizacion afina de 4 bits por bloques sobre los pesos del transformer, manteniendo el computo en FP16 y preservando la precision original en tensores considerados sensibles. La implementacion de conversion es privada, mientras que la de inferencia es publica en el proyecto principal.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO, ya que el modelo no es de naturaleza linguistica. La innovacion principal de esta variante es la adaptacion del pipeline a MLX para Apple Silicon, con descarga selectiva por resolucion y soporte de ejecucion offline mediante `--local-files-only`. La rejilla de 1536³ reutiliza el transformer de 1024, por lo que no implica un recuento de caras fijo.

## Capacidades

- Refinamiento image-to-3D: genera una malla 3D refinada a partir de una imagen de referencia y una malla gruesa previa.
- Salidas a tres resoluciones de rejilla: 512³, 1024³ y 1536³.
- Ejecucion nativa en Apple Silicon mediante MLX, con computo FP16.
- Descarga selectiva de componentes: solo transformer(s) y VAE compartido segun resolucion.
- Soporte de modo offline con descarga previa y flag `--local-files-only`.
- Integracion via CLI (`hi3d-mlx refine`) sin paso de conversion adicional.
- No soporta generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Prototipado de assets 3D en Mac: un artista puede refinar una malla gruesa obtenida de un boceto o foto directamente en un portatil Apple Silicon, sin GPU dedicada, gracias al formato MLX y a los 2,63 GiB del checkpoint a 1024³/1536³.
- Iteracion rapida en pipelines de videojuegos: el refinamiento de geometria sobre un coarse mesh existente encaja en un flujo donde el modelado base ya esta resuelto y solo se busca detalle, evitando regenerar la malla completa.
- Previsualizacion de producto en e-commerce: a partir de una imagen de referencia y una malla base, generar una version refinada para renders de catalogo, aceptando la deriva de calidad documentada.
- Docencia e investigacion en graficos por computador: el pipeline permite experimentar con cuantizacion 4-bit en tareas 3D sobre hardware de consumo, comparando resultados frente al modelo original.
- Digitalizacion ligera de objetos: reconstruccion de detalle geometrico a partir de fotografias y una malla aproximada, en entornos sin acceso a GPUs de datacenter.
- Pruebas de integracion CI en macOS: el modo offline con `hi3d-mlx download` permite preparar entornos reproducibles para validar pipelines de refinamiento en runners Apple.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de fidelidad geometrica de int4 frente a FP16 usando el dataset de resultados publicado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor remite a la metodologia en `BENCHMARKS.md` y al dataset `Hi3Dv1.0-mlx-results`, e indica que la cohorte historica se ejecuto sobre Apple M5 con 32 GiB y MLX 0.32.4. Los resultados son exclusivamente de geometria y requieren tanto una imagen como una malla gruesa existente. La unica valoracion cualitativa aportada es la advertencia de "deriva de calidad sustancial" respecto al modelo original.

## Requisitos de hardware

- VRAM/ memoria unificada: el checkpoint ocupa 1,49 GiB a 512³ y 2,63 GiB a 1024³/1536³; el autor aclara que son tamanos de checkpoint, no memoria en tiempo de ejecucion, a lo que hay que sumar encoders y dependencias Python.
- Hardware probado: Apple M5 con 32 GiB de memoria unificada y MLX 0.32.4.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este formato; el modelo esta empaquetado para MLX y Apple Silicon.
- GPU de consumo: orientado a chips Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD.
- Despliegue: CLI `hi3d-mlx` (comando `refine`), con descarga selectiva por variante y resolucion. Los cargadores genericos de `mlx-lm` no implementan este pipeline geometrico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3Dv1.0-mlx-int4 | no disponible | no aplica | Image-to-3D, refinamiento geometrico, 4-bit MLX | Hi3D Open License v1.0 | Hugging Face (MLX) |
| Hi3Dv1.0 (base) | no disponible | no aplica | Image-to-3D, refinamiento geometrico, precision original | Hi3D Open License v1.0 | Hugging Face |
| Otros modelos image-to-3D | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Deriva de calidad: el propio autor califica la perdida de fidelidad geometrica como "sustancial" frente al modelo original; recomienda inspeccionar la galeria antes de usar esta variante para geometria detallada.
- Requiere siempre dos entradas: una imagen de referencia y una malla gruesa existente; no genera mallas desde cero.
- Resultados limitados a geometria; no se documentan texturas, materiales ni color.
- La rejilla de 1536³ reutiliza el transformer de 1024 y no representa un recuento de caras fijo.
- Licencia restrictiva: Hi3D Open License Agreement v1.0, sin licencia MIT ni Apache; es imprescindible revisar el texto antes de uso comercial.
- La implementacion de conversion es privada, lo que limita la reproducibilidad del proceso de cuantizacion.
- Solo soportado en Apple Silicon con MLX; no hay soporte documentado para CUDA ni ROCm.
- Riesgo de alucinacion geometrica: al ser un modelo generativo, puede producir detalles plausibles pero inexistentes en la imagen de referencia.
- Sin informacion sobre sesgos, idiomas ni datos de entrenamiento, lo que dificulta evaluar su comportamiento en dominios especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-int4
- Proyecto e runtime de inferencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx
- Dataset de resultados: https://huggingface.co/datasets/devin-lai/Hi3Dv1.0-mlx-results
- Componentes compartidos: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared
- Metodologia de benchmarks: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx/blob/main/BENCHMARKS.md
- Licencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-int4/blob/v1.0.0/LICENSE
- Modelo base: https://huggingface.co/hi3d-official/Hi3Dv1.0
