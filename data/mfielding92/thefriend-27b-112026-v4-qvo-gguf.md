# mfielding92/thefriend-27b-112026-v4-qvo-GGUF

## Resumen

thefriend-27b-112026-v4-qvo-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo base `mfielding92/thefriend-27b-112026-v4-qvo`, un modelo de aproximadamente 27 000 millones de parametros publicado por el usuario mfielding92 en Hugging Face. La ficha corresponde exclusivamente al repositorio de cuantizaciones, no al modelo original: se trata de un artefacto derivado pensado para inferencia local con llama.cpp y entornos de consumo de memoria reducida.

Las cuantizaciones siguen el esquema Unsloth Dynamic 2.0 (UD), con recetas de cuantizacion e imatrix extraidas del repositorio `unsloth/Qwen3.8-27B-GGUF` y overrides por tensor aplicados mediante la opcion `--tensor-type` de llama.cpp. Esto sugiere que el modelo base comparte familia arquitectonica con Qwen3.8-27B, aunque la model card del repositorio no lo confirma de forma explicita.

El interes practico del repositorio radica en que ofrece variantes de cuantizacion con compromisos calidad/tamano calibrados (UD-Q2_K_XL hasta UD-Q5_K_M), lo que permite desplegar un modelo de 27B en GPUs de consumo. La informacion publicada es muy escasa: no hay datos sobre arquitectura, contexto, licencia, idiomas ni benchmarks, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base presumiblemente transformer de la familia Qwen3.8-27B, no confirmado) |
| Parametros totales | ~27 000 millones (inferido del nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `--ctx-size 16384` |
| Tipos de cuantizacion | GGUF Unsloth Dynamic 2.0: UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base no disponibles en esta ficha |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion del repositorio. El nombre y la referencia a las recetas de `unsloth/Qwen3.8-27B-GGUF` apuntan a una posible correspondencia con la familia Qwen3.8 de 27B, pero la model card no lo declara y no debe asumirse. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones especificas del modelo original.

Lo unico documentado es el proceso de cuantizacion: se aplican recetas Unsloth Dynamic 2.0 con matriz de importancia (imatrix) procedente del repositorio de Unsloth, y overrides por tensor mediante `--tensor-type` de llama.cpp. Este enfoque asigna precision diferencial a tensores sensibles, lo que mejora la relacion calidad/tamano frente a cuantizaciones uniformes, especialmente en rangos bajos como Q2 y Q3.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp.
- Compatibilidad con las capacidades del modelo base `thefriend-27b-112026-v4-qvo`, que no estan documentadas en este repositorio.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Parametros de muestreo sugeridos por el autor: `temp 0.6`, `top-p 0.95`, `top-k 20`, `min-p 0.0`.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: las variantes UD-Q3_K_XL y UD-Q4_K_XL permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante offload parcial o total de capas con `--n-gpu-layers 99`.
- Despliegue en servidores con VRAM limitada: UD-Q2_K_XL ofrece compresion extrema para entornos con menos de 12 GB de memoria, a costa de calidad.
- Experimentacion y evaluacion de calidad de cuantizaciones: el repositorio sirve para comparar el impacto de distintas recetas UD sobre un mismo modelo base, algo util en pipelines de seleccion de pesos para produccion.
- Integracion en herramientas de escritorio basadas en llama.cpp: al ser GGUF, puede cargarse en frontends compatibles (por ejemplo, llama-cli o wrappers que invoquen la libreria) para asistentes locales sin dependencia de API externa.
- Generacion de texto por lotes offline: con contexto configurable via `--ctx-size` (el ejemplo usa 16 384 tokens), adecuado para tareas de resumen o reescritura que no requieran servicio en tiempo real.
- Base para fine-tuning o evaluacion posterior: al derivar de un modelo base publico, puede servir como punto de partida para comparativas de rendimiento entre precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, segun cuantizacion y calculo estandar para 27B):
  - UD-Q2_K_XL: ~8-10 GB.
  - UD-Q3_K_XL: ~11-13 GB.
  - UD-Q4_K_XL: ~15-17 GB.
  - UD-Q5_K_M: ~18-20 GB.
  - Estas cifras son estimaciones por tamano de pesos; el autor no las publica.
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5 con carga completa; RTX 4080/4070 Ti (16 GB) para Q3/Q4 con offload parcial; GPUs de 8-12 GB solo para Q2 o ejecucion hibrida CPU/GPU.
- Cabe en GPU de consumo: si, en RTX 4090, 4080, 3090 y similares con 16-24 GB para las variantes Q3-Q5; en GPUs de 8-12 GB solo con Q2 o reparto CPU.
- Opciones de despliegue: llama.cpp (documentado por el autor con `llama-cli`); otros runners compatibles con GGUF (Ollama, llama-cpp-python, frontends tipo LM Studio) no estan confirmados en la model card.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thefriend-27b-112026-v4-qvo-GGUF | ~27B | no disponible | GGUF | no disponible | Repositorio con 0 descargas |
| unsloth/Qwen3.8-27B-GGUF | ~27B | no disponible | GGUF | no disponible en esta ficha | Repositorio publico de referencia de recetas |
| Modelo base mfielding92/thefriend-27b-112026-v4-qvo | ~27B | no disponible | no disponible | no disponible | Repositorio publico |

La comparativa con alternativas de la misma categoria no puede completarse con datos de rendimiento porque no se han publicado benchmarks ni especificaciones del modelo base. Los unicos puntos de comparacion documentados son el origen de las recetas de cuantizacion (Unsloth Dynamic 2.0) y el formato GGUF compartido.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar idoneidad para uso comercial o produccion.
- Licencia no especificada: no hay base legal declarada para redistribucion o uso comercial; debe consultarse el repositorio del modelo base antes de cualquier despliegue.
- Riesgo de alucinacion desconocido: no hay evaluaciones publicadas que cuantifiquen la fiabilidad del modelo.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no pueden identificarse sesgos conocidos.
- Las cuantizaciones de baja precision (Q2, Q3) degradan calidad de forma no medida en este repositorio; el autor solo afirma que Q3 es "muy usable" sin aportar datos.
- El contexto efectivo no esta declarado; el valor 16 384 del ejemplo de llama.cpp es una configuracion de ejecucion, no necesariamente el maximo soportado.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion independiente.
- La posible relacion con la familia Qwen3.8-27B es una inferencia a partir de las recetas de cuantizacion, no una afirmacion del autor; no debe tratarse como hecho.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mfielding92/thefriend-27b-112026-v4-qvo-GGUF
- Modelo base: https://huggingface.co/mfielding92/thefriend-27b-112026-v4-qvo
- Repositorio de recetas e imatrix: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
