# empero-ai/Qwen3.8-35B-A3B-Distill-GGUF

# Qwen3.8-35B-A3B-Distill-GGUF

## Resumen

Este repositorio contiene las cuantizaciones en formato GGUF de **empero-ai/Qwen3.8-35B-A3B-Distill**, un modelo de 35.505.251.456 parámetros obtenido por destilación de los modelos frontera Qwen3.8 sobre la arquitectura Mixture-of-Experts de Qwen3.6-35B-A3B. Lo desarrolla Empero (empero.org) y se distribuye con licencia Apache-2.0 heredada del modelo base de Alibaba Qwen. El repositorio en sí es una conversión de pesos para ejecución local, no un entrenamiento nuevo.

Su interés práctico está en la combinación de tamaño y dispersión: 35B de parámetros totales con aproximadamente 3B activos por token. Gracias a esa dispersión MoE, la inferencia en CPU o con offload parcial resulta mucho más viable que en un modelo denso del mismo peso en disco, y las cuantizaciones de 2 y 3 bits permiten cargarlo en tarjetas de 16 GB. Se distribuye en diez niveles de cuantización, desde IQ2_M (12,558 GB) hasta BF16 (71,067 GB), más un proyector de visión F16.

La arquitectura es híbrida: 30 capas Gated DeltaNet y 10 capas de atención completa, con 256 expertos de los que se enrutan 8 por token. Es un modelo de razonamiento: cada respuesta comienza con un bloque `<think>`, por lo que conviene presupuestar tokens de salida generosos y recortar ese bloque antes de mostrarlo al usuario final. Los metadatos declaran únicamente inglés como idioma soportado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 30 capas Gated DeltaNet + 10 capas de atención completa; 256 expertos, 8 enrutados por token |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_M, Q2_K, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (texto); F16 para el proyector de visión |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base sin cuantizar no se distribuye en este repositorio |

Tamaños exactos de cada fichero (GB decimales, 1 GB = 1.000.000.000 bytes):

| Fichero | Cuantización | Tamaño |
|---|---|---:|
| Qwen3.8-35B-A3B-IQ2_M.gguf | IQ2_M | 12,558 GB |
| Qwen3.8-35B-A3B-Q2_K.gguf | Q2_K | 13,839 GB |
| Qwen3.8-35B-A3B-IQ3_M.gguf | IQ3_M | 16,340 GB |
| Qwen3.8-35B-A3B-Q3_K_M.gguf | Q3_K_M | 17,664 GB |
| Qwen3.8-35B-A3B-IQ4_XS.gguf | IQ4_XS | 19,628 GB |
| Qwen3.8-35B-A3B-Q4_K_M.gguf | Q4_K_M | 21,713 GB |
| Qwen3.8-35B-A3B-Q5_K_M.gguf | Q5_K_M | 25,348 GB |
| Qwen3.8-35B-A3B-Q6_K.gguf | Q6_K | 29,209 GB |
| Qwen3.8-35B-A3B-Q8_0.gguf | Q8_0 | 37,802 GB |
| Qwen3.8-35B-A3B-BF16.gguf | BF16 | 71,067 GB |
| mmproj-Qwen3.8-35B-A3B-F16.gguf | F16 | 0,899 GB |

## Arquitectura y entrenamiento

La arquitectura es la de la familia Qwen3.6: un modelo MoE híbrido que combina 30 capas Gated DeltaNet (un mecanismo de estado recurrente con compuertas, orientado a reducir el coste de la atención en secuencias largas) con 10 capas de atención completa. El enrutado usa 256 expertos y activa 8 por token. Esta combinación requiere una compilación reciente de llama.cpp con soporte para Qwen3.6 y MoE con Gated DeltaNet; las compilaciones antiguas no cargan la arquitectura.

El modelo es el resultado de destilar los modelos frontera Qwen3.8 dentro de la arquitectura Qwen3.6-35B-A3B. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO; esos datos corresponden a la model card principal de `empero-ai/Qwen3.8-35B-A3B-Distill`, que no forma parte de la información proporcionada. El proceso de destilación fue únicamente de texto: la torre de visión se hereda sin cambios del modelo base Qwen3.6-35B-A3B y su comportamiento no fue evaluado. Las cuantizaciones IQ* y las K-quant de 2 y 3 bits están calibradas con una importance matrix, lo que según el autor es lo que mantiene la coherencia a esas anchuras de bits.

## Capacidades

- Generación de texto conversacional con plantilla de chat integrada en el fichero GGUF.
- Modo de razonamiento explícito: cada respuesta abre con un bloque `<think>...</think>` que debe recortarse para el usuario final.
- Entrada de imágenes mediante el proyector `mmproj-Qwen3.8-35B-A3B-F16.gguf` emparejado con cualquier cuantización de texto (heredado del modelo base, sin evaluar tras la destilación).
- Capacidad declarada de razonamiento y de matemáticas por las etiquetas del repositorio (`reasoning`, `distillation`).
- Inferencia en CPU y con offload parcial gracias a la dispersión MoE (~3B activos por token).
- Compatibilidad con runtimes GGUF estándar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los metadatos solo declaran inglés.

## Casos de uso

- Asistente local de razonamiento en estación de trabajo: con la cuantización Q4_K_M (21,713 GB) y una GPU de 24 GB, el modelo se carga íntegramente en VRAM y permite cadenas de razonamiento largas sin enviar datos a terceros.
- Despliegue en portátil con GPU de 16 GB: la cuantización IQ2_M (12,558 GB) o Q2_K (13,839 GB) es la opción mínima viable; el offload parcial de capas a CPU es práctico porque solo se activan ~3B parámetros por token.
- Servicio conversacional de bajo coste por petición: la dispersión MoE reduce el coste de cómputo por token respecto a un denso de 35B, lo que abarata servir muchas conversaciones cortas en la misma GPU.
- Procesamiento de documentos con imagen: emparejando cualquier cuantización de texto con el proyector F16 (0,899 GB) se puede hacer OCR descriptivo, resumen de capturas o extracción de información de diagramas, con la salvedad de que la visión no fue evaluada tras la destilación.
- Generación y revisión de código asistida en local: el modo `<think>` resulta útil para tareas que requieren descomposición en pasos, y el modelo puede integrarse en un editor mediante un servidor compatible con llama.cpp.
- Análisis de datos sensibles en entornos aislados (sanidad, banca, sector público): al ejecutarse sobre pesos locales con licencia Apache-2.0, no hay dependencia de API externa ni cesión de datos.
- Prototipado e investigación sobre destilación: el repositorio permite comparar el comportamiento del destilado frente al modelo base en distintos niveles de cuantización, útil para estudiar la degradación por cuantización en arquitecturas MoE híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio remite explícitamente a la model card principal de `empero-ai/Qwen3.8-35B-A3B-Distill` para los resultados de evaluación y las buenas prácticas, pero ese documento no forma parte de la información proporcionada. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de comparativas numéricas con otros modelos.

## Requisitos de hardware

Guía de encaje de pesos publicada por el autor (a contexto moderado; la caché KV es el coste dominante en contexto largo y puede exigir offload con independencia de la cuantización):

| Cuantización | Guía de memoria |
|---|---|
| IQ2_M / Q2_K | 16 GB de VRAM, o 16 GB de RAM del sistema |
| IQ3_M / Q3_K_M | 20-24 GB de VRAM, o 24 GB de RAM del sistema |
| IQ4_XS / Q4_K_M | 24 GB de VRAM para carga completa en GPU; cómodo en CPU con 32 GB de RAM |
| Q5_K_M / Q6_K | 32 GB de VRAM, o 48 GB de RAM del sistema |
| Q8_0 | 48 GB de VRAM, o 64 GB de RAM del sistema |
| BF16 | 80 GB o más de VRAM, o 96 GB de RAM del sistema; solo como referencia |

- Sí cabe en GPU de consumo: IQ2_M en una tarjeta de 16 GB; Q4_K_M en una de 24 GB (RTX 3090, RTX 4090, RTX 5090).
- GPU profesionales para los niveles altos: Q5_K_M y Q6_K en A100 de 40 GB o similares; Q8_0 en 48 GB; BF16 en A100/H100 de 80 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para visión), Ollama, LM Studio, Jan y KoboldCpp. Todos requieren una compilación reciente de llama.cpp con soporte para Qwen3.6 y MoE con Gated DeltaNet.
- Ajustes de muestreo recomendados: `temperature=0.6`, `top_p=0.95`, `top_k=20`; con `-n 16384` en `llama-cli` y plantilla de chat integrada (`-cnv`).
- Latencia y throughput estimados: no disponibles.
- Verificación de integridad: el repositorio incluye `SHA256SUMS` (`sha256sum -c SHA256SUMS --ignore-missing`).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF (este) | 35,5B totales / ~3B activos | MoE híbrido, 30 Gated DeltaNet + 10 atención, 256 expertos, 8 por token | no disponible | Apache-2.0 | GGUF | 10 cuantizaciones, 0 descargas, 12 likes |
| empero-ai/Qwen3.8-35B-A3B-Distill | mismos parámetros (modelo del que se cuantiza) | igual | no disponible | Apache-2.0 | no disponible | modelo base del repositorio; métricas en su propia card |
| Qwen/Qwen3.6-35B-A3B | 35B totales / ~3B activos | MoE híbrido, 30 Gated DeltaNet + 10 atención, 256 expertos, 8 por token | no disponible | Apache-2.0 | no disponible | modelo base original de Alibaba Qwen |

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre alternativas comparables, por lo que no se pueden aportar más referencias de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; se trata de un modelo destilado sobre arquitectura MoE, y las cuantizaciones de 2 y 3 bits, aunque calibradas con importance matrix, son las más expuestas a degradación.
- El bloque `<think>` aparece en todas las respuestas; si se muestra al usuario final hay que recortarlo, y conviene reservar un presupuesto de tokens de salida amplio o las respuestas quedarán truncadas.
- Arquitectura no soportada por compilaciones antiguas de llama.cpp: sin una versión reciente con soporte para Qwen3.6 y MoE con Gated DeltaNet, el modelo no carga.
- Idiomas: los metadatos solo declaran inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada en la información disponible; la caché KV puede forzar offload en contexto largo incluso con una cuantización pequeña.
- La visión se hereda del modelo base y no fue evaluada tras la destilación de texto; su calidad no está garantizada.
- Restricciones de licencia: Apache-2.0, que permite uso comercial, pero los pesos de los que deriva (Qwen3.6-35B-A3B) son de Alibaba Qwen y se comparten tal cual; conviene revisar los términos de la cadena completa antes de un despliegue en producción.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe validación de la comunidad sobre el comportamiento real de las cuantizaciones.
- El tamaño total del repositorio es de 266,1 GB, lo que implica un coste de almacenamiento y descarga considerable si se quieren varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo base destilado (sin cuantizar): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Empero: https://empero.org

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos correspondían a plantillas de calcomanías de un videojuego y no guardan relación con el contenido solicitado).
