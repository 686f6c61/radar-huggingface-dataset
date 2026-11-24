# dcharlot65-openie/Inkling-2-Mini-MTP-LittleBit

## Resumen

`Inkling-2-Mini-MTP-LittleBit` es un checkpoint de pesos "living weights" derivado de `thinkingmachines/Inkling-2-Mini` mediante una factorización previa que combina LittleBit-2 con Sakana SVF. Lo publica el usuario `dcharlot65-openie` y está empaquetado en formato `.jsyn` para JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native (JouleKube). No es un modelo entrenado desde cero: es una adaptación de compresión extrema del modelo base.

El interés técnico reside en la compresión: el checkpoint declara 317.897.872 parámetros (unos 318 M) que en FP16 ocuparían 606,34 MB, reducidos a 5,96 MB en `.jsyn` (zstd + CRC32), lo que equivale a una media de 0,0493 bits por peso (BPW), es decir, por debajo de 1 bit por peso. Para conseguirlo, la model card indica que se mantienen 31 tensores 2D en bitplanes y 23 vectores 1D (LayerNorm, bias y depthwise) sin esa cuantización de bitplane.

Es relevante ahora por dos motivos: por un lado, explora el límite práctico de la compresión sub-1-bit sobre un modelo base real; por otro, su empaquetado está pensado para despliegue nativo en Kubernetes con un runtime propio, no para los ecosistemas habituales (transformers, llama.cpp, vLLM). El repositorio está vacío en el momento de la consulta (0,0 GB, 0 descargas), por lo que la información disponible procede únicamente de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `thinkingmachines/Inkling-2-Mini`; la model card no detalla la arquitectura del modelo base) |
| Parametros totales | 317.897.872 (~318 M) |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (bitplanes 2D + vectores 1D sin bitplane); media de 0,0493 BPW; empaquetado `.jsyn` con zstd y CRC32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |
| Modelo base | `thinkingmachines/Inkling-2-Mini` |
| Tecnica de compresion | LittleBit-2 ⊕ Sakana SVF (pre-factorizada) |
| Tensores 2D en bitplane | 31 |
| Vectores 1D (LayerNorm/bias/depthwise) | 23 |
| Tamano FP16 equivalente | 606,34 MB |
| Tamano comprimido `.jsyn` | 5,96 MB (101,73x menor) |
| Runtime / libreria | jouledb (JouleDB v0.2.4+) |
| `model_id` interno | `inkling-2-mini-mtp` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base `thinkingmachines/Inkling-2-Mini` ni aporta datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se documenta es el proceso de adaptación: una factorización previa que combina LittleBit-2 con Sakana SVF, aplicada sobre los pesos del modelo base para producir un checkpoint de pesos "living weights" en formato `.jsyn`.

La innovación técnica declarada es la representación sub-1-bit: 31 tensores 2D se almacenan como bitplanes y 23 vectores 1D (LayerNorm, bias y depthwise) se conservan aparte, sin esa cuantización. El resultado es una media de 0,0493 BPW y un fichero de 5,96 MB frente a los 606,34 MB en FP16. El empaquetado incluye compresión zstd y verificación CRC32. No se especifican detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia; el runtime asociado es JouleDB, que se describe como runtime sin PyTorch.

## Capacidades

- No se documentan capacidades funcionales específicas (generación de texto, razonamiento, código, matemáticas, visión) en la información disponible.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni lista de idiomas.
- No se declara modo de razonamiento (thinking mode), visión ni audio.
- La única capacidad verificable en la documentación es la de servir como checkpoint de pesos compatible con el runtime JouleDB mediante `hf_pull`.

## Casos de uso

- Evaluación de compresión sub-1-bit: usar el checkpoint para medir la degradación de calidad frente al modelo base `thinkingmachines/Inkling-2-Mini` a 0,0493 BPW, comparando salidas en tareas controladas.
- Investigación en representaciones de pesos: analizar la distribución de los 31 tensores en bitplane y los 23 vectores 1D para estudiar qué componentes toleran la cuantización extrema y cuáles no.
- Despliegue en clústeres Kubernetes: al estar empaquetado para JouleKube, encaja en escenarios de inferencia nativa en Kubernetes donde el tamaño del artefacto (5,96 MB) simplifica la distribución de imágenes y el versionado.
- Pruebas de integración de JouleDB: servir como modelo de referencia para validar el flujo `jouledb serve` + `hf_pull` en pipelines de CI antes de desplegar checkpoints mayores.
- Prototipado de bases de datos termodinámicas: usar el modelo dentro de JouleDB para experimentar con cargas de trabajo que combinan almacenamiento y ejecución de modelo en el mismo sustrato.
- Docencia y demostraciones: el tamaño reducido del fichero permite distribuir el checkpoint en entornos con ancho de banda limitado, aunque la fidelidad de las salidas no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K ni similares) ni comparación con el modelo base. Los únicos datos numéricos son de compresión: 317.897.872 parámetros, 606,34 MB en FP16, 5,96 MB en `.jsyn`, 101,73x de reducción y 0,0493 BPW.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint en `.jsyn` ocupa 5,96 MB, pero el runtime JouleDB puede requerir descomprimir a una representación intermedia; no se documenta el pico de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Inkling-2-Mini-MTP-LittleBit` | ~318 M | no disponible | `.jsyn` | Apache 2.0 | Sub-1-bit (0,0493 BPW), runtime JouleDB |
| `thinkingmachines/Inkling-2-Mini` (base) | no disponible | no disponible | no disponible | Apache 2.0 | Modelo de origen; sin datos de arquitectura en la informacion disponible |
| Alternativas de ~300 M en safetensors/GGUF | no disponible | no disponible | no disponible | no disponible | No se dispone de modelos comparables documentados en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo base ni de alternativas equivalentes en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No hay métricas de calidad publicadas: se desconoce la degradación introducida por la compresión a 0,0493 BPW frente al modelo base.
- El repositorio está vacío (0,0 GB) y sin descargas en el momento de la consulta; no se puede verificar que los pesos estén realmente publicados.
- El formato `.jsyn` ata el uso al runtime JouleDB; no hay conversión documentada a safetensors, GGUF ni otros formatos estándar.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- No se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero al ser una obra derivada conviene revisar también las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`.
- El proyecto JouleDB/JouleKube y la técnica LittleBit/SVF no cuentan con documentación pública de validación independiente en la información disponible; tratar las cifras de compresión como declaraciones del autor.
- No apto para producción sin una evaluación previa de calidad sobre tareas reales.

## Enlaces

- [Hugging Face: dcharlot65-openie/Inkling-2-Mini-MTP-LittleBit](https://huggingface.co/dcharlot65-openie/Inkling-2-Mini-MTP-LittleBit)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Repositorio JouleDB](https://github.com/openIE-dev/jouledb)
