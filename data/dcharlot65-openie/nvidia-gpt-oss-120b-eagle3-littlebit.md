# dcharlot65-openie/NVIDIA-GPT-OSS-120B-Eagle3-LittleBit

## Resumen

`NVIDIA-GPT-OSS-120B-Eagle3-LittleBit` es un checkpoint de pesos "living-weights" publicado por el usuario `dcharlot65-openie` bajo el ecosistema JouleDB. Se trata de una adaptación pre-factorizada del modelo `nvidia/gpt-oss-120b-Eagle3-short-context` de NVIDIA, combinando las técnicas LittleBit-2 y Sakana SVF para lograr una compresión extrema mediante el formato propietario `.jsyn` (zstd + CRC32). El checkpoint declara 786.873.600 parámetros y un tamaño comprimido de 2,00 MB, lo que equivale a una media de 0,0129 bits por peso.

El modelo no es un modelo de lenguaje ejecutable de forma convencional: es una representación comprimida y pre-factorizada pensada para el runtime de inferencia sin PyTorch de JouleDB, junto con la capa de orquestación Kubernetes-native JouleKube. Su relevancia actual radica en la exploración de técnicas de compresión sub-1-bit aplicadas a un modelo base de la familia gpt-oss, un área activa de investigación para despliegues de bajo coste energético y de memoria.

No se dispone de información publicada sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados en la model card proporcionada. El repositorio aparece vacío en tamaño (0,0 GB) y sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de nvidia/gpt-oss-120b-Eagle3-short-context) |
| Parametros totales | 786.873.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base se denomina "short-context") |
| Tipos de cuantizacion | sub-1-bit (LittleBit-2 + Sakana SVF), formato `.jsyn` con zstd + CRC32; BPW medio 0,0129 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License Agreement (`nvidia-open-model-license`) |
| Formato de pesos | `.jsyn` (JouleDB), 9 tensores 2D en bitplane + 4 vectores 1D (LayerNorm/Bias/Depthwise) |
| Tamano FP16 equivalente | 1500,84 MB |
| Tamano comprimido | 2,00 MB (factor 751,94x) |
| Modelo base | nvidia/gpt-oss-120b-Eagle3-short-context |
| Libreria | jouledb |
| Runtime | JouleDB v0.2.4+ (zero-PyTorch) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base `nvidia/gpt-oss-120b-Eagle3-short-context`. Por el nombre se infiere que se trata de un modelo de la familia gpt-oss de NVIDIA con la técnica de decodificación especulativa Eagle3 y una ventana de contexto corta, pero esta inferencia no está confirmada en la información disponible. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica destacable es la representación "living-weights" del checkpoint: 9 tensores bidimensionales almacenados en bitplanes y 4 vectores unidimensionales (LayerNorm, bias y depthwise) pre-factorizados mediante LittleBit-2 y Sakana SVF. El resultado se serializa en `.jsyn` con compresión zstd y verificación CRC32, alcanzando 0,0129 bits por peso. Este formato está diseñado para ser consumido por JouleDB, un sustrato de base de datos termodinámica y runtime de inferencia sin PyTorch, desplegable sobre Kubernetes mediante JouleKube.

## Capacidades

- No se documentan capacidades funcionales específicas del checkpoint en la model card.
- Por herencia del modelo base se presume generación de texto y razonamiento, pero no está confirmado en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Capacidad destacable confirmada: carga y ejecución mediante el runtime JouleDB a través de `db.hf_pull(...)` con `model_id="nvidia-gpt-oss-120b-eagle3"`.

## Casos de uso

- Investigación en compresión extrema de modelos: el checkpoint sirve como referencia reproducible de un esquema sub-1-bit (0,0129 BPW) aplicado a un modelo de la familia gpt-oss, útil para estudiar límites de compresión y su impacto en calidad.
- Despliegue en clústeres Kubernetes con restricciones de almacenamiento: gracias a su tamaño de 2,00 MB y a la integración con JouleKube, puede distribuirse como artefacto ligero en pipelines nativos de Kubernetes.
- Experimentación con runtimes sin PyTorch: permite evaluar el rendimiento de JouleDB como motor de inferencia alternativo en entornos donde no se desea dependencia de PyTorch.
- Pruebas de decodificación especulativa: al derivar de un modelo Eagle3, puede emplearse para validar cabezas de especulación en pipelines de generación acelerada, siempre que se confirme la compatibilidad con el runtime.
- Docencia y demostraciones de formatos `.jsyn`: útil para ilustrar el ciclo completo de compresión, serialización con CRC32 y carga en un runtime termodinámico.
- Benchmarking de bases de datos vectoriales/termodinámicas: integrable en pruebas comparativas de JouleDB frente a otros motores, dado su reducido tamaño y su formato nativo.
- Prototipado de agentes en entornos con memoria limitada: si el checkpoint conserva capacidades del modelo base, podría servir para experimentos de agentes con presupuesto de VRAM mínimo, aunque esto no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño comprimido es de 2,00 MB, pero el equivalente FP16 es de 1500,84 MB, por lo que la VRAM real dependerá de la descompresión en el runtime JouleDB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el runtime JouleDB no especifica requisitos de GPU en la información proporcionada.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`), servidor HTTP en `127.0.0.1:8080`, integración con JouleKube (Kubernetes-native). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-GPT-OSS-120B-Eagle3-LittleBit | 786.873.600 | no disponible | 0,0129 BPW / 2,00 MB | NVIDIA Open Model License | Hugging Face (0 descargas) |
| nvidia/gpt-oss-120b-Eagle3-short-context | no disponible | "short-context" | sin comprimir | NVIDIA Open Model License | Hugging Face |
| Alternativas sub-1-bit comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otras alternativas de compresión sub-1-bit o con modelos de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de compresión.
- Riesgo de alucinación: no evaluado; al ser un checkpoint comprimido de forma extrema, la fidelidad respecto al modelo original no está verificada.
- Limitaciones de contexto e idioma: no disponibles; el nombre del modelo base sugiere contexto corto, pero no se especifica.
- Restricciones de licencia: se hereda la NVIDIA Open Model License Agreement, que impone condiciones de uso comercial y atribución; es necesario revisar el texto completo antes de producción.
- El repositorio aparece con 0,0 GB de tamaño y 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente disponibles o que el artefacto se distribuye por otra vía.
- El formato `.jsyn` es propietario de JouleDB y no es compatible con runtimes estándar (transformers, vLLM, llama.cpp), lo que limita su portabilidad.
- La librería `jouledb` y el ecosistema JouleKube son poco maduros (versión 0.2.4+), lo que implica riesgo de cambios incompatibles.
- No se proporcionan métricas de calidad tras la compresión; la degradación respecto al modelo base es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-GPT-OSS-120B-Eagle3-LittleBit
- Modelo base: https://huggingface.co/nvidia/gpt-oss-120b-Eagle3-short-context
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
