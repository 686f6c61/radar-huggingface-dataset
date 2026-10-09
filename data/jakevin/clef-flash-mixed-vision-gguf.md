# Jakevin/clef-flash-mixed-vision-GGUF

## Resumen

Clef-Flash mixed-vision-GGUF es una cuantizacion post-entrenamiento no oficial del modelo Cloudflare/clef-flash (revision `17f0b0ad64efb65d273590632833508766b2aae6`), publicada por el usuario Jakevin bajo licencia Apache 2.0. Se distribuye en formato GGUF para llama.cpp e incluye dos ficheros: un backbone de texto en precision mixta de 3,30 GB y un proyector visual (`mmproj`) en f16 de 0,92 GB procedente de bartowski, lo que suma aproximadamente 4,22 GB de descarga total frente a los 19,06 GB de la release original en bf16.

El modelo subyacente tiene 8.953.803.264 parametros y su arquitectura GGUF se declara como `qwen35` (el modelo de texto Qwen3.5), aunque el grafo `clef` de llama.cpp no exporta el estado oculto `t_h_nextn` que necesita la receta original, por lo que este fichero funciona como el modelo de texto base mas el proyector de vision y no como arquitectura `clef` completa. La receta de cuantizacion es mixta por tensor: combina IQ2_XXS, IQ2_S, Q2_K, IQ3_XXS, Q3_K, Q4_K y Q8_0, con normas y parametros SSM en F32 y `ssm_alpha`/`ssm_beta` fijados en BF16.

Su relevancia es doble. Por un lado demuestra que un modelo de ~9.000 millones de parametros puede comprimirse de 19,06 GB a 4,22 GB conservando el 99,5% y el 98,1% de la precision limpia en dos suites internas de decision y transferencia. Por otro, documenta con detalle una metodologia reproducible de sensibilidad KL medida por tensor mas mochila de asignacion de tipos, y expone limitaciones concretas como que la cabeza de clasificacion del esquema conjunto corre en Python sobre los estados ocultos finales, no dentro de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto Qwen3.5 (tag GGUF `qwen35`) con componentes SSM (`ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_a`, `ssm_dt`); vision mediante `mmproj` de arquitectura `clip` con proyector `qwen3vl_merger` |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: IQ2_XXS, IQ2_S, Q2_K, IQ3_XXS, Q3_K, Q4_K, Q8_0, BF16 y F32 en el backbone de texto; f16 en el `mmproj`. Sin formatos ternarios (TQ1_0/TQ2_0) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), repartido en `clef-flash-mkl-3.30GB.gguf` y `mmproj-Cloudflare_clef-flash-f16.gguf` |

## Arquitectura y entrenamiento

El backbone es el modelo de texto de Cloudflare/clef-flash, derivado de la familia Qwen3.5, con capas de atencion y componentes de tipo SSM, tal como evidencia la presencia de tensores `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_a` y `ssm_dt` en el GGUF. El fichero de texto contiene 427 tensores: 68 en IQ2_XXS, 23 en IQ2_S, 35 en IQ3_XXS, 16 en Q2_K, 13 en Q3_K, 36 en Q4_K, 11 en Q8_0, 48 en BF16 y 177 en F32. Las normas, la convolucion y los parametros SSM no se cuantizan; `output.weight` queda fijado en Q2_K y no lo lee la cabeza de clasificacion. Por su parte, el `mmproj` tiene 334 tensores en f16, sin capas deepstack, con `clip.vision.projection_dim` de 4096.

El metodo de cuantizacion no es uniforme: se calculo sensibilidad KL medida por tensor y despues se resolvio una mochila que asigna a cada tensor medido un tipo de ggml entre IQ2_XXS, IQ2_S, Q2_K, IQ3_XXS, Q3_K, Q4_K y Q8_0. La imatrix se genero con 128 registros de calibracion (semilla 1234) y la KL por tensor uso los primeros 32 de ese conjunto, es decir 10.383 tokens. La suma de los valores KL por tensor empleados en la mochila es 0,009015, que no es una KL del modelo completo. Los artefactos `alloc/selection.json` y `alloc/tensor-types.txt` documentan la asignacion; el fichero se genero con `llama-quantize --tensor-type`.

Un punto critico de diseno: llama.cpp por si solo no produce decisiones de Clef. La cabeza de esquema conjunto se ejecuta en Python sobre los estados ocultos finales del backbone y las filas de opciones provienen del `lm_head` original en bf16. Ademas, el conversor `ClefVisionModel` de llama.cpp lanza `NotImplementedError` y depende del issue ggml-org/llama.cpp#29622. La receta incluye `run_clef_gguf.py` y una variante de `hsdump` capaz de procesar imagenes.

## Capacidades

- Generacion de texto conversacional con el backbone de texto de Clef-Flash.
- Clasificacion y decision estructurada: la cabeza de esquema conjunto produce decisiones sobre opciones, alimentada por los estados ocultos finales y las filas del `lm_head` bf16.
- Salida estructurada (etiqueta `structured-output` en el repositorio).
- Vision basica: lectura de imagenes mediante el `mmproj`, con una imagen de 224x224 expandida a 64 tokens `<|image_pad|>` (id 248056) y `image_grid_thw` `[1, 16, 16]`, con patch 16 y merge espacial 2.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Cuantizacion mixta con imatrix, orientada a minimizar la perdida de precision respecto al bf16.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificacion y enrutado de decisiones con salida estructurada: la cabeza de esquema conjunto permite obtener decisiones sobre un conjunto cerrado de opciones, util para triaje, etiquetado o seleccion de acciones en pipelines automatizados, manteniendo el 99,5% de la precision limpia del bf16 en la suite decision-v7.
- Despliegue en hardware de gama de consumo: al ocupar 4,22 GB en total (3,30 GB de texto mas 0,92 GB de vision), el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM o incluso en CPU con llama.cpp, algo inviable con la release bf16 de 19,06 GB.
- Analisis de documentos con componente visual ligero: el `mmproj` permite procesar imagenes de 224x224 junto a texto, adecuado para verificar capturas, diagramas simples o campos de color en flujos de validacion, siempre que se asuma que no hay suite de imagenes etiquetada en esta release.
- Prototipado e investigacion sobre cuantizacion: los ficheros `alloc/selection.json` y `alloc/tensor-types.txt` permiten reproducir o auditar la asignacion de tipos por tensor y comparar tecnicas de cuantizacion mixta con KL medida.
- Evaluacion comparativa de degradacion por cuantizacion: las suites decision-v7 y transfer-v9 ofrecen un punto de referencia para medir la retencion de precision al bajar de bf16 a precision mixta en modelos de ~9.000 millones de parametros.
- Inferencia local con llama.cpp en entornos sin GPU dedicada: el formato GGUF y los tipos IQ2/IQ3/Q2_K reducen el coste de memoria, lo que facilita ejecutar el modelo en estaciones de trabajo o portatiles con RAM suficiente.
- Tareas de vision limitadas a comprobaciones de cableado: los seis tests sinteticos con campos rojo, verde, azul y amarillo de 224x224, mas circulo y cuadrado azules sobre blanco, sirven para validar que la ruta de imagen funciona antes de invertir en evaluacion con imagenes reales.

## Benchmarks y rendimiento

Los unicos datos publicados son las suites privadas congeladas del autor (kev), con una sola semilla y sin intervalo de confianza. No son el Decision Index publico ni los numeros de Typesafe.

| Suite | n (limpio) | Precision bf16 | Este modelo | Retenido |
|---|---:|---:|---:|---:|
| decision-v7 | 1264 | 0,8861 | 0,8813 | 99,5% |
| transfer-v9 | 1046 | 0,8011 | 0,7859 | 98,1% |

| Suite | Brier | NLL | ECE |
|---|---:|---:|---:|
| decision-v7 | 0,1755 | 0,3382 | 0,0278 |
| transfer-v9 | 0,3061 | 0,6042 | 0,0421 |

Advertencia del propio autor: decision-v7 puede ser optimista, porque tanto la imatrix como la asignacion KL usaron registros de esa suite (128 registros de calibracion con semilla 1234 y los primeros 32 de ese conjunto, 10.383 tokens). transfer-v9 no se uso para calibracion.

En consistencia texto, comparando con el GGUF solo-texto sobre los primeros 100 registros de decision-v7 y las mismas filas bf16 del `lm_head`: 100 de 100 filas coincidentes, maximo |delta p| de 0 y 0 cambios de argmax.

En vision, la lectura de imagenes se confirma solo con 6 tests sinteticos de cableado (campos solidos rojo, verde, azul y amarillo de 224x224, mas un circulo y un cuadrado azules sobre blanco), comparados con Jakevin/clef-flash-ternary-vision-mlx. No hay suite de imagenes etiquetada en esta release y no se ejecuto la precision de vision del bf16 original.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 4,22 GB en disco (3,30 GB de backbone de texto en precision mixta y 0,92 GB de `mmproj` f16); a ello hay que sumar la cache KV, cuyo tamano no se documenta en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM o mas, dado el tamano de pesos inferior a 4,5 GB. No hay datos publicados de latencia ni throughput.
- GPU de gama profesional: cualquier A100, H100, L40S o similar puede alojarlo con margen amplio, aunque el modelo esta claramente orientado a despliegues pequenos.
- Opciones de despliegue: llama.cpp es el soporte de referencia. El repositorio proporciona `run_clef_gguf.py` y una variante de `hsdump` con capacidad de imagen. La cabeza de decision no se ejecuta dentro de llama.cpp, sino en Python sobre los estados ocultos, lo que obliga a un componente adicional en produccion.
- Vision en llama.cpp: limitada por el conversor `ClefVisionModel`, que lanza `NotImplementedError` y requiere el issue ggml-org/llama.cpp#29622. Ajuste de tokens de imagen: `hsdump` fija `image_min_tokens=64` y `image_max_tokens=16384` para igualar el procesador de Hugging Face, ya que el valor por defecto de qwen3vl en llama.cpp (8..4096) deja una imagen de 224x224 en 49 tokens y provoca un aborto por desajuste.
- Otras opciones de despliegue (vLLM, TGI, Ollama): no disponible en la informacion proporcionada. El formato GGUF sugiere compatibilidad con el ecosistema llama.cpp, pero no se documenta soporte explicito de Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Vision | Licencia | Notas |
|---|---|---:|---|---|---|
| Jakevin/clef-flash-mixed-vision-GGUF (este) | 8,95 B | GGUF, 4,22 GB total (3,30 GB texto + 0,92 GB mmproj) | Si, mmproj f16 | Apache 2.0 | Solo texto y vision; cabeza de decision en Python |
| Jakevin/clef-flash-mixed-GGUF | 8,95 B | GGUF, 3,30 GB de texto | No | Apache 2.0 | Mismos pesos de texto, sin `mmproj` ni ruta de imagen |
| Cloudflare/clef-flash (bf16 original) | 8,95 B | bf16, 19,06 GB (18,82 GB texto + 0,24 GB cabeza) | Si | Apache 2.0 | Release oficial; referencia de precision (0,8861 y 0,8011) |
| Jakevin/clef-flash-ternary-vision-mlx | no disponible | MLX, formato ternario | Si | no disponible | Usado como comparacion en los 6 tests sinteticos de vision |

No se dispone de datos de contexto, rendimiento publico ni benchmarks comparables frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: no es una release de Cloudflare ni esta respaldada por Cloudflare o el equipo de Qwen. El fichero `NOTICE.md` lista los cambios realizados.
- La cabeza de decision no funciona dentro de llama.cpp: el esquema conjunto corre en Python sobre los estados ocultos finales y las filas de opciones provienen del `lm_head` bf16 original. Desplegar solo el GGUF no reproduce las decisiones de Clef.
- `output.weight` esta en Q2_K y la cabeza de clasificacion no lo lee, por lo que su cuantizacion no afecta a la decision pero si a cualquier uso alternativo de la salida del `lm_head`.
- Vision sin evaluar en imagenes reales: los 6 casos son pruebas de cableado con imagenes sinteticas. No hay suite etiquetada ni medicion de precision de vision, tampoco del bf16 original.
- El conversor de vision de llama.cpp no es funcional para esta arquitectura (`NotImplementedError`), lo que limita el uso de la ruta de imagen a herramientas propias como `hsdump`.
- Riesgo de optimismo en los numeros: decision-v7 se uso tanto para la imatrix como para la asignacion KL, y los resultados son de una unica semilla sin intervalos de confianza.
- Los datos de benchmark no son publicos ni corresponden al Decision Index o a los numeros de Typesafe.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingues o con contexto largo.
- Licencia: Apache 2.0, permite uso comercial, pero conviene revisar `NOTICE.md` y `LICENSE` del repositorio antes de redistribuir.
- Aunque el `general.name` del GGUF es `Snap Text`, los pesos son de Clef-Flash; puede inducir a confusion en auditorias de artefactos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jakevin/clef-flash-mixed-vision-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Version solo texto: https://huggingface.co/Jakevin/clef-flash-mixed-GGUF
- Version ternaria con vision en MLX: https://huggingface.co/Jakevin/clef-flash-ternary-vision-mlx
- Issue de llama.cpp para el conversor de vision: https://github.com/ggml-org/llama.cpp/issues/29622
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
