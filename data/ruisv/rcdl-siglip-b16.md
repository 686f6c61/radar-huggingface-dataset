# ruisv/rcdl-siglip-b16

## Resumen

rcdl-siglip-b16 es una compilación del codificador de imágenes de SigLIP base/16 (224×224) para la NPU del SoC Rockchip RK3588 y RK3588S. Lo publica el autor ruisv como artefacto listo para cargar en formato `.rknn`, generado con rknn-toolkit2 2.3.2 en precisión fp16, y se acompaña de una tabla de embeddings de texto para las 80 etiquetas de COCO que permite hacer clasificación de imagen zero-shot sin reconvertir el modelo. El modelo base es google/siglip-base-patch16-224, de Google, con licencia Apache-2.0.

El problema que resuelve es el despliegue de un codificador visual SigLIP en hardware de borde con NPU: evita al usuario la exportación a ONNX y la compilación con rknn-toolkit2, y ofrece un contrato de entrada claro (224×224 RGB a un vector unitario de 768 dimensiones). Solo se ejecuta la torre de imagen en la placa; la parte de texto es una tabla fija calculada en el host de conversión con el prompt `a photo of a {label}.`.

Es relevante para quienes construyen pipelines de visión en placas RK3588 con requisitos de latencia y consumo ajustados: una inferencia por fotograma tarda 96 ms en un núcleo NPU (RK3588S, librknnrt 2.3.2, driver 0.9.8). El repositorio ocupa 0,2 GB y el binario del codificador pesa 182,9 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (torre de imagen de SigLIP base, patch 16, resolución 224) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224) |
| Tipos de cuantizacion | fp16 (build oficial); int8 compila pero colapsa el espacio de embeddings |
| Idiomas soportados | no disponible (modelo multimodal imagen-texto; la tabla incluida usa etiquetas en inglés de COCO) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` (binario compilado para NPU RK3588), más `.npy` y `.txt` para la tabla de texto |

## Arquitectura y entrenamiento

El artefacto contiene únicamente la torre de imagen de SigLIP base/16: un Vision Transformer con parches de 16×16 sobre entradas de 224×224 que produce un embedding de 768 dimensiones. SigLIP (Sigmoid Loss for Language Image Pre-Training) sustituye la pérdida softmax contrastiva de CLIP por una pérdida sigmoidea por pares, lo que permite entrenar con lotes más grandes sin normalización global. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF) no se documentan en la información proporcionada.

La innovación práctica de esta ficha no está en el entrenamiento sino en el empaquetado: el modelo se compila a fp16 con rknn-toolkit2 2.3.2 para ejecutarse en la NPU del RK3588, y se acompaña de una tabla de embeddings de texto `[80, 768]` calculada con la torre de texto del mismo checkpoint usando el prompt `a photo of a {label}.`, que según el autor puntúa mejor que un sustantivo desnudo. La clasificación zero-shot se reduce a un producto escalar por etiqueta. El autor advierte que la cuantización int8, aunque compila y devuelve vectores unitarios bien formados, colapsa el espacio de embeddings (por ejemplo, `bus.jpg` se clasifica como `skateboard +0.005`), un comportamiento típico de los ViT bajo cuantización post-entrenamiento.

## Capacidades

- Extracción de embeddings de imagen: convierte una imagen RGB de 224×224 en un vector unitario de 768 dimensiones.
- Clasificación zero-shot de imágenes mediante similitud coseno contra una tabla de embeddings de texto.
- Clasificación sobre recortes: la API `rcdl.embed(emb, img, box=...)` permite embeber una región de la imagen en lugar del fotograma completo.
- Cambio de vocabulario sin reconversión: basta con sustituir la tabla de texto por embeddings calculados con la torre de texto del mismo checkpoint sobre las etiquetas propias.
- Ejecución en NPU de borde (RK3588/RK3588S) con una latencia medida de 96 ms por fotograma en un núcleo NPU.
- No incluye generación de texto, tool calling, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Clasificación de imágenes en dispositivos de borde: sobre una placa RK3588, el modelo permite etiquetar fotogramas de cámara contra un conjunto fijo de clases con una inferencia de 96 ms por imagen, sin depender de la nube.
- Detección de presencia de objetos por categoría: usando la tabla de COCO incluida, se puede filtrar si un fotograma contiene un autobús, un pájaro o un avión y disparar acciones posteriores en el propio dispositivo.
- Búsqueda visual por similitud: almacenar los embeddings de 768 dimensiones de un catálogo de imágenes y consultar por cercanía coseno para recuperación de imágenes similares en local.
- Preetiquetado en pipelines de anotación: generar etiquetas candidatas zero-shot sobre lotes de imágenes para que los anotadores solo revisen, reduciendo el coste manual.
- Moderación o triaje de contenido visual: clasificar fotogramas contra un vocabulario propio (por ejemplo, categorías de escena) sustituyendo la tabla de texto, sin recompilar el modelo.
- Clasificación por regiones en vídeo: usar `box=` para embeber recortes de detecciones previas y asignarles una categoría, combinando un detector ligero con este codificador.
- Automatización industrial con inspección visual: verificar la presencia o ausencia de piezas contra un conjunto de etiquetas propio en una línea de producción con hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta mediciones cualitativas de clasificación zero-shot sobre tres imágenes y la latencia de inferencia.

| Prueba | Etiqueta top-1 (coseno) | Segundo | Tercero |
|---|---|---|---|
| `bus.jpg` | bus +0,092 | car +0,040 | train +0,031 |
| `bird.jpg` | bird +0,080 | kite +0,016 | elephant +0,010 |
| `space_shuttle_224.jpg` | airplane +0,055 | boat +0,034 | car +0,021 |

| Métrica de ejecución | Valor |
|---|---|
| Latencia por fotograma | 96 ms (RK3588S, un núcleo NPU) |
| Entorno medido | librknnrt 2.3.2, driver NPU 0.9.8 |
| Precisión del build | fp16 |

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU; el binario `.rknn` no se ejecuta en GPU de escritorio ni en CPU genérica sin el runtime correspondiente.
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC. El binario del codificador ocupa 182,9 MB en disco.
- GPU recomendadas: no aplica; no es un modelo para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en placas RK3588/RK3588S (por ejemplo, SBC y módulos basados en ese SoC).
- Despliegue: runtime RCDL (C++17/Python) sobre linux-aarch64, instalable vía conda desde el canal del autor; requiere librknnrt 2.3.2 y driver NPU 0.9.8 para reproducir las mediciones.
- Latencia y throughput: 96 ms por imagen en un núcleo NPU; el autor no reporta throughput con varios núcleos.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rcdl-siglip-b16 (este) | `.rknn` fp16 | NPU RK3588/RK3588S | imagen 224×224, embedding 768-d | Apache-2.0 | Hugging Face, 0 descargas |
| google/siglip-base-patch16-224 | safetensors (PyTorch) | GPU/CPU | imagen 224×224, embedding 768-d | Apache-2.0 | Hugging Face |
| Otros builds RKNN de SigLIP/CLIP | `.rknn` | NPU RK3588 | variable | variable | no disponible |

La comparación directa con otros modelos de la misma categoría (codificadores imagen-texto para clasificación zero-shot) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye la torre de imagen; no genera texto ni embeddings de texto en el dispositivo, salvo la tabla precalculada.
- La cuantización int8 colapsa el espacio de embeddings: el autor desaconseja explícitamente ese build y recomienda fp16.
- Las similitudes coseno son bajas en valor absoluto (0,05–0,09 en los ejemplos); lo relevante es el margen sobre el segundo candidato, que puede ser pequeño y requerir umbrales calibrados por caso de uso.
- La tabla incluida cubre solo 80 etiquetas de COCO en inglés; para otro vocabulario hay que calcular la tabla con la torre de texto del mismo checkpoint y el mismo formato de prompt.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al ser un modelo derivado de SigLIP, hereda los sesgos del dataset de entrenamiento original, no detallado aquí.
- Licencia Apache-2.0 para los pesos y archivos compilados, con redistribución comercial permitida; el runtime RCDL tiene su propia licencia Apache-2.0 e independiente.
- Dependencia de versiones concretas del runtime (librknnrt 2.3.2, driver 0.9.8) para reproducir las latencias reportadas.
- Repositorio con 0 descargas y 0 likes: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-siglip-b16
- Modelo base: https://huggingface.co/google/siglip-base-patch16-224
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Documentación de modelos de RCDL: https://github.com/ruisv/rcdl/blob/main/docs/MODELS.md
- Zoo de modelos verificados: https://github.com/ruisv/rcdl/tree/main/model_zoo
