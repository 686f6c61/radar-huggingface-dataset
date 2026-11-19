# mradermacher/Latxa-3-122B-A10B-i1-GGUF

## Resumen

Latxa-3-122B-A10B-i1-GGUF es una cuantizacion en formato GGUF del modelo Latxa-3-122B-A10B, publicada por el usuario mradermacher en Hugging Face. El modelo base, alojado en el repositorio HiTZ/Latxa-3-122B-A10B, pertenece a la familia Latxa desarrollada por el grupo HiTZ (Centro de Tecnologia del Lenguaje) de la Universidad del Pais Vasco, orientada al procesamiento del euskera. Esta publicacion concreta no es un modelo original, sino una conversion a cuantizaciones de baja precision con el objetivo de facilitar su despliegue en hardware con recursos limitados.

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con 122.111.526.912 parametros totales y, presumiblemente, 10B parametros activos por token (la nomenclatura A10B es habitual en modelos MoE de esta escala). El repositorio ocupa 45,6 GB e incluye un amplio conjunto de cuantizaciones que abarcan desde IQ1_S hasta Q6_K, generadas con tecnicas de imatrix y weighted quants.

La relevancia de esta ficha radica en que permite evaluar rapidamente la viabilidad de desplegar un modelo de gran tamano especializado en euskera en entornos de produccion con GPUs de consumo. No obstante, la informacion publicada es muy limitada: no se detallan datos de entrenamiento, benchmarks, licencia ni idiomas soportados mas alla de lo inferible del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun nomenclatura A10B; detalles no disponibles |
| Parametros totales | 122.111.526.912 |
| Parametros activos | 10B (inferido del nombre, no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (por el nombre del modelo base, cabe esperar euskera, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna del modelo base. Por la nomenclatura "122B-A10B" se deduce una arquitectura de mezcla de expertos con 122.000 millones de parametros totales y aproximadamente 10.000 millones activos por token, patron habitual en modelos MoE de gran escala. No se especifican el numero de expertos, la estrategia de enrutamiento, la longitud de contexto ni detalles sobre atencion (si es estandar, lineal o hibrida).

Respecto al entrenamiento, no hay datos publicados sobre el numero de tokens, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa. La unica informacion tecnica disponible en la model card se refiere al proceso de cuantizacion: se han generado cuantizaciones ponderadas con imatrix (matriz de importancia) a partir del modelo original en formato Hugging Face, con `quantize_version: 2` y `convert_type: hf`.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere soporte para despliegue via API.
- Capacidades multilingues: no confirmadas; el modelo base esta orientado al euskera.
- Razonamiento, codigo, matematicas, vision o audio: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional en euskera: el modelo base esta orientado a este idioma, y las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutarlo en GPUs de consumo con calidad cercana al modelo original.
- Prototipado en entornos con VRAM limitada: las cuantizaciones IQ2 e IQ3 permiten probar el modelo en GPUs de 24 GB o incluso menos, a costa de cierta perdida de calidad.
- Investigacion academica sobre modelos MoE en lenguas de bajos recursos: permite estudiar el comportamiento de un MoE de 122B en euskera sin necesidad de infraestructura de centro de datos.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes, lo que facilita experimentos sobre el impacto de la cuantizacion en la calidad de salida.
- Generacion de contenido en euskera para medios o administracion publica: con cuantizaciones Q5_K_M o Q6_K se obtiene la mayor fidelidad al modelo original.
- Integracion en pipelines locales con llama.cpp u Ollama: el formato GGUF permite su uso en herramientas de inferencia local sin dependencias de la nube.
- Fine-tuning ligero o experimentacion con LoRA sobre el modelo cuantizado: posible en entornos con recursos moderados, aunque limitado por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y tamano del repo de 45,6 GB):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 30-40 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 45-55 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 60-70 GB.
  - Q5_K_S / Q5_K_M: en torno a 75-85 GB.
  - Q6_K: en torno a 90-100 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para cuantizaciones altas; RTX 4090 (24 GB) solo viable con cuantizaciones IQ1/IQ2 y offloading parcial a CPU.
- Cabe en consumer GPU: solo las cuantizaciones mas agresivas (IQ1, IQ2) con offloading; no es un modelo apto para una unica GPU de consumo sin perdida significativa de rendimiento.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (segun la etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B-i1-GGUF | 122B totales / 10B activos (inferido) | no disponible | no disponible | GGUF | Hugging Face |
| Latxa-3-122B-A10B (original) | 122B totales / 10B activos (inferido) | no disponible | no disponible | safetensors (presumible) | Hugging Face |
| Modelos MoE comparables de 100B+ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base (HiTZ/Latxa-3-122B-A10B) antes de cualquier uso en produccion.
- No se han publicado datos sobre sesgos, alucinacion o limitaciones de contexto; se desconoce el comportamiento real del modelo.
- La cuantizacion introduce perdida de calidad respecto al modelo original, especialmente en las variantes de 1-3 bits (IQ1, IQ2, IQ3); no se han publicado evaluaciones del impacto.
- El modelo base esta orientado al euskera; su rendimiento en castellano u otros idiomas no esta confirmado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de la calidad de las cuantizaciones.
- El proceso de cuantizacion usa imatrix ponderada, pero no se detalla la fuente del dataset de calibracion ni su composicion.
- No hay informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con contextos largos.

## Enlaces

- Repositorio Hugging Face (cuantizaciones): https://huggingface.co/mradermacher/Latxa-3-122B-A10B-i1-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
