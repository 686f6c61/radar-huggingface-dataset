# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en precision mixta para Apple Silicon, publicado por AutomatosX bajo su pipeline AXQuant (AXQ) 2.1.0. Se ha convertido directamente desde el modelo BF16 `ukisai/Swift-1.5-Qwen3.8-27b` y conserva la ruta de texto cuantizada mientras mantiene en BF16 tanto la cabeza de prediccion multi-token (MTP) como la torre de vision.

El modelo parte de la arquitectura densa `Qwen3_5ForConditionalGeneration` y presenta 26.895.993.856 parametros reales en safetensors (27,36B logicos segun el autor). Declara una longitud de contexto configurada de 262.144 tokens, un tamano de pesos de 17,41 GB y un consumo medio medido de 4,8441 BPW en el modelo principal y 5,0147 BPW contando la cabeza MTP.

El propio autor etiqueta el paquete como "evidencia de desarrollo, no una release certificada de AXQuant": incluye registros de conversion e integridad de artefactos, pero no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP. Es relevante ahora como pieza de la familia AXQ para ejecucion local en Mac, no como modelo de referencia con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa, transformer con cabeza MTP y torre de vision) |
| Parametros totales | 26.895.993.856 (27,36B logicos segun el autor) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; limite practico segun memoria unificada |
| Tipos de cuantizacion | MXFP4, affine y bf16; mezcla 4bit/8bit/bf16 (4,8441 BPW medidos en el modelo principal, 5,0147 BPW totales con MTP) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | MLX safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura de origen es `Qwen3_5ForConditionalGeneration` en variante densa, con la ruta de texto optimizada mediante cuantizacion de precision mixta. El checkpoint distribuye los pesos principales en tres niveles: 24,35B parametros en 4bit (87,65% del total), 2,54B en 8bit (9,15%) y 888,07M en bf16 (3,20%). Los metodos de cuantizacion empleados son affine, bf16 y mxfp4, con tamanos de grupo de 32 y 64. La clase de presupuesto en el Hub es MXFP4 y la precision base declarada de AXQuant es 6bit, aunque el BPW medido es la cifra autoritativa.

El modelo incorpora dos sidecars empaquetados: una cabeza MTP en `mtp.safetensors` (15 tensores, 424,70M parametros, 0,85 GB en BF16) y una torre de vision en `vision.safetensors` (333 tensores, 460,73M parametros, 0,92 GB en BF16). El artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 durante la conversion. No se proporcionan datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) porque se trata de una conversion cuantizada, no de un entrenamiento nuevo.

## Capacidades

- Generacion de texto y uso conversacional mediante la ruta de lenguaje (backbone) cuantizada.
- Vision: la torre de vision esta presente en el checkpoint, aunque su explotacion depende de un runtime consciente de los sidecars.
- Prediccion multi-token (MTP): la cabeza MTP esta empaquetada y requiere oMLX 0.6.3rc2 o superior, o bien MTPLX, para cargarse; MLX-LM estandar no la lee.
- Ejecucion local en Apple Silicon a traves de MLX-LM para inferencia de texto/backbone.
- Soporte de contexto largo declarado de hasta 262.144 tokens, sujeto a memoria unificada disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).
- Capacidades de audio: no, el autor indica `Audio present: False`.
- Modo de razonamiento explicito: no disponible; MTPLX expone un parametro `--reasoning` pero no se documenta su comportamiento.

## Casos de uso

- Inferencia local de texto en Mac: el modelo permite generar texto en equipos Apple Silicon mediante MLX-LM, cargando 17,41 GB de pesos y aprovechando la cuantizacion a 4,8441 BPW para reducir el consumo de memoria unificada frente al BF16 original.
- Despliegue con contexto largo en estaciones de trabajo Mac: con una ventana configurada de 262.144 tokens, encaja en tareas de resumen o analisis de documentos extensos siempre que la memoria unificada lo permita.
- Prototipado de pipelines multimodales en local: la torre de vision en BF16 permite experimentar con entrada de imagenes usando un runtime que cargue el sidecar `vision.safetensors`.
- Aceleracion de decodificacion con MTP: en oMLX 0.6.3rc2+ o MTPLX se puede habilitar la cabeza MTP para intentar reducir el coste por token en generacion autoregresiva, dentro de los limites de evidencia que declara el autor.
- Evaluacion de tecnicas de cuantizacion mixta: sirve como material de estudio para comparar la distribucion 4bit/8bit/bf16 y su efecto sobre BPW y tamano de artefacto frente a los hermanos 4bit y 6bit.
- Investigacion sobre formatos MLX: util para desarrolladores que quieran analizar la integracion entre checkpoints MLX, sidecars separados y contratos de runtime (`mtplx_runtime.json`).
- Pruebas de integridad y reproducibilidad de artefactos: el paquete incluye registros de conversion e integridad, lo que permite auditar el proceso AXQuant 2.1.0 sobre una base BF16 concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor advierte que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark.

## Requisitos de hardware

- Pesos del modelo: 17,41 GB en safetensors; descarga completa aproximada de 17,45 GB, por lo que se recomienda reservar al menos 17,45 GB de disco libre.
- Plataforma: exclusivamente Apple Silicon; el formato es MLX safetensors y no hay pesos PyTorch ni GGUF.
- Memoria unificada: minimo practico en torno a 24 GB para cargar pesos con margen; 32-48 GB recomendado para contexto moderado; 64 GB o mas para aspirar a contextos cercanos al maximo declarado.
- GPU NVIDIA (A100, H100, RTX 4090): no aplica; no hay ruta CUDA ni pesos compatibles.
- Opciones de despliegue: MLX-LM para inferencia de texto/backbone; oMLX 0.6.3rc2 o superior para importar el sidecar MTP y activar "Lightning MTP"; MTPLX para consumir directamente el sidecar (`--profile stable --depth 1`). No se incluye un `model-manifest.json` nativo validado, por lo que la ejecucion con AX Engine no esta establecida.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP | Objeto de esta ficha | 26,9B (27,36B logicos) | 262.144 tokens | MLX safetensors | swift-open-license-1.0 | Publicado, 0 descargas |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-4bit-MTP | Hermano de menor presupuesto AXQ | no disponible | no disponible | MLX safetensors | swift-open-license-1.0 | Publicado |
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP | Hermano de mayor presupuesto (cerca de 6 BPW) | no disponible | no disponible | MLX safetensors | swift-open-license-1.0 | Publicado |
| ukisai/Swift-1.5-Qwen3.8-27b | Modelo base BF16 | no disponible | no disponible | safetensors (BF16) | no disponible | Publicado |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que se trata de evidencia de desarrollo y no de una release certificada de AXQuant; no hay calidad, contexto largo ni velocidad medidos.
- No se publican resultados de benchmarks; no debe asumirse ningun nivel de rendimiento a partir de la etiqueta AXQ.
- Restriccion de plataforma: solo Apple Silicon; el formato MLX safetensors impide su uso en GPUs NVIDIA o en stacks CUDA.
- MLX-LM estandar puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales, de modo que el comando basico de generacion no garantiza calidad MTP ni vision-lenguaje.
- La cabeza MTP y la torre de vision solo se explotan en runtimes conscientes de sidecars (oMLX 0.6.3rc2+ o MTPLX); en MLX-LM quedan inutilizadas.
- El paquete no incluye un `model-manifest.json` nativo validado, por lo que la ejecucion en AX Engine no esta demostrada; los campos de `axquant_runtime.json` describen una intencion de compatibilidad, no evidencia observada.
- La licencia es "other" con nombre `swift-open-license-1.0`; deben revisarse los terminos del fichero LICENSE antes de cualquier uso comercial.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion; aplican los riesgos generales de cualquier modelo generativo.
- Uso en produccion: se recomienda fijar un commit concreto del Hub en lugar de depender indefinidamente de `main`, ya que el identificador de revision citado es `b4c84d42903a8646b25857eb2827288d92ed85a4`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/b4c84d42903a8646b25857eb2827288d92ed85a4
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Fichero de licencia referenciado en la model card: LICENSE (dentro del repositorio)
