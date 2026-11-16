# fastforks/davit

## Resumen

DaViT (Ding et al. 2022) es un transformer de vision jerarquico que alterna atencion de ventana (espacial) y atencion por grupos de canales. El repositorio `fastforks/davit` es una model card sin pesos: actua como manifiesto para que la libreria fastforks descargue los pesos originales de los repositorios de `timm` y los verifique contra los hashes SHA-256 declarados. La tarea soportada es clasificacion de imagenes sobre ImageNet-1k, con salida de logits sobre 1000 clases.

El modelo se ofrece en tres variantes: `davit_base.msft_in1k`, `davit_small.msft_in1k` y `davit_tiny.msft_in1k`, todas preentrenadas en ImageNet-1k (ILSVRC 2012) y publicadas bajo licencia Apache-2.0. La entrada es fija de 224x224 pixeles (redimensionado con lado corto 235 y recorte central). El backend es `portable`, con soporte experimental y kernels propios en un repositorio separado.

La relevancia de esta ficha es de infraestructura: no aporta un modelo nuevo, sino una via de empaquetado reproducible (verificacion por hash, benchmarks de latencia y memoria, y comprobacion de paridad numerica frente al codigo original) para usar DaViT en pipelines de clasificacion. Es util para quien necesite trazabilidad de pesos y mediciones de rendimiento en GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer jerarquico con atencion alternada de ventana espacial y por grupos de canales (DaViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija 224x224) |
| Tipos de cuantizacion | fp32 y fp16 documentados; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (pesos alojados en repos de `timm`, no en este repo) |

## Arquitectura y entrenamiento

DaViT es un transformer de vision jerarquico que combina dos mecanismos de atencion en bloque: atencion de ventana (espacial, restringida a parches locales) y atencion por grupos de canales (que captura dependencias globales dividiendo los canales en grupos). Esta alternancia reduce el coste cuadratico de la atencion global manteniendo capacidad de modelado de contexto amplio. El modelo produce logits de clasificacion sobre las 1000 clases de ImageNet-1k.

El entrenamiento se realizo sobre ImageNet-1k (ILSVRC 2012). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni sobre el uso de RLHF o DPO (tecnicas no aplicables a un clasificador de vision). La innovacion practica de este repositorio es la verificacion de integridad: fastforks descarga los pesos de los repositorios `timm/davit_*` y los valida contra SHA-256 (prefijos `cd12f8bd194e`, `cef0f04c7349` y `085937207d2e` para base, small y tiny respectivamente). Ademas, se documenta paridad numerica con el codigo original: en CPU float32 la diferencia maxima absoluta es <= 3.3e-06; en GPU float16 (portable y kernels) el error medio absoluto es <= 0.0026 y el p99 <= 0.011.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k, con salida de logits.
- Entrada de una unica imagen RGB, redimensionada (lado corto 235) y recortada al centro a 224x224.
- Inferencia en precision fp32 y fp16.
- Backend `portable` y backend `kernels` (kernels propios en `fastforks/kernels`); en las tablas de rendimiento el backend `kernels` aparece sin datos (`–`).
- Verificacion de integridad de pesos por SHA-256.
- Compatibilidad con `torch.compile` y exportacion a TensorRT fp16 (con latencias documentadas).
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto ni capacidades multilingues.

## Casos de uso

- Clasificacion de imagenes en produccion: usar `davit_base.msft_in1k` como clasificador de 1000 clases con latencia de 2.28 ms por imagen en TensorRT fp16 sobre RTX 5060 Ti, adecuado para pipelines de etiquetado a gran escala.
- Preprocesado de datasets visuales: etiquetar automaticamente imagenes con `davit_tiny.msft_in1k` (1.03 ms en TensorRT fp16) para filtrar o enriquecer conjuntos de datos antes de tareas de entrenamiento posteriores.
- Moderacion de contenido basada en categoria visual: emplear los logits de ImageNet como senal auxiliar para clasificar imagenes en categorias amplias dentro de un sistema de moderacion.
- Extraccion de caracteristicas para busqueda visual: usar las representaciones internas del modelo como embedding previo a un indice vectorial, aprovechando la ventana de atencion jerarquica para capturar estructura espacial.
- Servicio de inferencia de baja latencia en GPU consumer: desplegar `davit_small.msft_in1k` con 1.92 ms por imagen en TensorRT fp16 y 234 MiB de memoria pico (motor + torch), lo que permite multiples instancias en una RTX 5060 Ti de 16 GB.
- Validacion de pipelines de vision: usar la paridad numerica documentada (error maximo 3.3e-06 en CPU fp32) como referencia para verificar implementaciones propias o migraciones de framework.
- Clasificacion en entornos con requisitos de trazabilidad: la verificacion por SHA-256 de los pesos permite auditar la cadena de suministro del modelo en despliegues regulados.

## Benchmarks y rendimiento

Precision en ImageNet-1k val (5000 imagenes aleatorias, top-1 / top-5 %):

| Variante | Original fp32 | Original fp16 | Portable |
|---|---|---|---|
| `davit_tiny.msft_in1k` | 83.94 / 96.50 | 83.92 / 96.50 | 83.94 / 96.56 |
| `davit_small.msft_in1k` | 85.18 / 97.20 | 85.16 / 97.20 | 85.24 / 97.18 |
| `davit_base.msft_in1k` | 85.58 / 97.10 | 85.58 / 97.10 | 85.66 / 97.12 |

Latencia y memoria (entrada 224x224, RTX 5060 Ti 16 GB, sm_120):

| Variante | Tiempo portable | Tiempo compile | Tiempo TensorRT fp16 | Memoria pico portable (MiB) |
|---|---|---|---|---|
| `davit_base.msft_in1k` | 11.7 ms | 5.48 ms | 2.28 ms | 212 / 224 |
| `davit_small.msft_in1k` | 12.8 ms | 5.54 ms | 1.92 ms | 136 / 150 |
| `davit_tiny.msft_in1k` | 6.33 ms | 3.10 ms | 1.03 ms | 96 / 116 |

Tiempos de preparacion: compilacion en frio entre 15.5 s (tiny) y 21.8 s (base, small); construccion de ONNX + motor TensorRT entre 53.8 s (tiny) y 71.1 s (base). Memoria pico con TensorRT (motor + torch): 403 / 422 MiB (base), 234 / 254 MiB (small) y 159 / 166 MiB (tiny).

## Requisitos de hardware

- VRAM estimada para inferencia: 0.2 GiB pico asignado para `davit_base`, 0.1 GiB para `davit_small` y `davit_tiny` (backend portable, fp16, 224x224).
- GPU recomendadas: cualquier GPU con soporte CUDA; las mediciones se realizaron en una RTX 5060 Ti 16 GB (sm_120). No se documentan pruebas en A100 o H100.
- Cabe en GPU consumer: si, con margen amplio; incluso la variante base ocupa unos 212 MiB asignados en portable.
- Opciones de despliegue: backend `portable` de fastforks, `torch.compile` y TensorRT fp16. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de vision).
- Latencia y throughput: 2.28 ms por imagen (base, TensorRT fp16), 1.92 ms (small) y 1.03 ms (tiny); en portable, 11.7 ms, 12.8 ms y 6.33 ms respectivamente. El throughput no se publica de forma explicita, aunque puede derivarse de la latencia por imagen en regimen por lotes.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. Las unicas alternativas documentadas son las propias variantes de DaViT:

| Modelo | Precision top-1 (ImageNet-1k) | Latencia TensorRT fp16 | Memoria pico portable | Licencia |
|---|---|---|---|---|
| `davit_base.msft_in1k` | 85.58 % | 2.28 ms | 212 / 224 MiB | Apache-2.0 |
| `davit_small.msft_in1k` | 85.18 % | 1.92 ms | 136 / 150 MiB | Apache-2.0 |
| `davit_tiny.msft_in1k` | 83.94 % | 1.03 ms | 96 / 116 MiB | Apache-2.0 |

## Limitaciones y advertencias

- El repositorio no contiene pesos: solo es una model card; la disponibilidad depende de los repositorios de `timm` y de la verificacion SHA-256.
- Entrada fija de 224x224: no admite resoluciones arbitrarias sin redimensionado y recorte previos.
- Clasificador cerrado de 1000 clases de ImageNet-1k: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Tier experimental: el soporte y la estabilidad de la integracion en fastforks no estan garantizados para produccion.
- El backend `kernels` no presenta datos de rendimiento en las tablas (celdas `–`); su uso en produccion no esta validado en la informacion disponible.
- La evaluacion de precision se realizo sobre 5000 imagenes aleatorias de validacion, no sobre el conjunto completo, por lo que los valores pueden diferir ligeramente de las cifras oficiales.
- Riesgo de sesgo y alucinacion: no se documenta analisis de sesgos; como clasificador puede producir etiquetas erroneas con alta confianza en imagenes fuera de distribucion.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete es de uso de investigacion y recomienda revisar las cadenas de licencia antes de otros usos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/davit
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos `davit_base.msft_in1k`: https://huggingface.co/timm/davit_base.msft_in1k
- Pesos `davit_small.msft_in1k`: https://huggingface.co/timm/davit_small.msft_in1k
- Pesos `davit_tiny.msft_in1k`: https://huggingface.co/timm/davit_tiny.msft_in1k
- Evidencia de licencia: https://huggingface.co/timm/davit_tiny.msft_in1k/blob/982f32c73d98f9966df4a7178b32b820bed3c1b1/README.md
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Manifiesto de hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/davit/card.toml
