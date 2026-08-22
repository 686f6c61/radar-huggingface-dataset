# brandonmusic/GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78

## Resumen

GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78 es una cuantizacion comunitaria del modelo GLM-5.2 de Zhipu AI (zai-org), realizada por el usuario brandonmusic. El modelo base GLM-5.2 es un MoE de 753B parametros totales con 173B activos, disenado para tareas de razonamiento de largo horizonte, codigo y agentes. Esta version cuantizada utiliza el formato EXL3 Trellis a 3.5 bpw de media con precision mixta, e incorpora un cabezal de decodificacion especulativa MTP-78 (Multi-Token Prediction con 78 capas de draft).

La relevancia de este checkpoint reside en su optimizacion para inferencia en hardware consumer y prosumer: el autor reporta velocidades de decodificacion de hasta 281.72 tok/s en configuracion TP4/DCP1/MTP0 con 4x RTX PRO 6000 Blackwell, y 53.86 tok/s en un solo GPU. Incluye un runtime de servicion con cuantizacion online de expertos compartidos (K6), KV cache FP8 con RoPE BF16, y soporte para decodificacion especulativa MTP-3. El repositorio contiene 701.5 GB de pesos en formato safetensors, con 173.098.113.024 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MLA (Multi-head Latent Attention) |
| Parametros totales | 173.098.113.024 (173B) |
| Parametros activos | no disponible (el modelo base GLM-5.2 tiene 173B activos de 753B totales) |
| Longitud de contexto | no disponible (el modelo base GLM-5.2 soporta 1024K segun fuentes secundarias) |
| Tipos de cuantizacion | EXL3 Trellis 3.5 bpw media, precision mixta (BF16 para expertos compartidos, K6 para routed experts) |
| Idiomas soportados | no disponible (GLM-5.2 base es multilingue, principalmente chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (76 shards carrier + shard BF16 compartido + shards de expertos r7) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un transformer MoE con atencion MLA (Multi-head Latent Attention), desarrollado por Zhipu AI. La cuantizacion EXL3-TR3 v4 de brandonmusic aplica un esquema de precision mixta: los expertos compartidos (shared experts) se almacenan en BF16 original y se codifican online como un unico payload K6 fusionado al cargar, mientras que los expertos enrutados (routed experts) usan payloads EXL3 Trellis pre-codificados con rotaciones byte-identicas a la revision anterior. El checkpoint incluye un cabezal MTP-78 para decodificacion especulativa, con capas de draft que tambien tienen expertos compartidos en BF16.

La innovacion principal de esta revision (v4, fechada 2026-08-10) es la reorganizacion del layout de los expertos compartidos: anteriormente se almacenaban como tres payloads K6 separados (gate, up, down), lo que forzaba dos lanzamientos de GEMM pequenos por capa enrutada por paso de decodificacion. Ahora se fusionan gate+up en un unico payload K6, reduciendo 75 lanzamientos de kernel por paso de decodificacion en MTP0. El autor reporta una ganancia de +9.5% en throughput medio de decodificacion. La calidad se verifico mediante KLD (Kullback-Leibler divergence) contra logits de referencia BF16: 0.064250 ± 0.000383 en 5 ejecuciones, por debajo del umbral predeclarado de 0.060 en la comparacion de lectores FP8 (exact G64 Q only: 0.05973021 de media).

## Capacidades

- Generacion de texto y razonamiento de largo horizonte: el modelo base GLM-5.2 esta disenado para tareas que requieren mantener coherencia sobre secuencias muy largas.
- Codigo: segun el blog oficial de Zhipu, GLM-5.2 obtiene 81.0 en Terminal-Bench 2.1 y 62.1 en SWE-bench Pro, superando a GLM-5.1 por un margen amplio.
- Razonamiento multi-step y capacidades de agente: el modelo base incorpora soporte para tool calling y planificacion de tareas complejas.
- Decodificacion especulativa: el cabezal MTP-78 permite acelerar la generacion mediante draft de multiples tokens por paso.
- Capacidades multilingues: el modelo base soporta principalmente chino e ingles, aunque los idiomas exactos de esta cuantizacion no estan documentados.
- Inferencia optimizada: el runtime incluido soporta TP4/DCP4, KV cache FP8 con RoPE BF16, y cuantizacion online de expertos compartidos.

## Casos de uso

- Despliegue local de un modelo MoE de 173B en hardware prosumer: con 4x RTX PRO 6000 Blackwell (96 GB cada una) se alcanzan 281.72 tok/s en configuracion TP4/DCP1/MTP0, lo que permite servir un modelo de frontier en un entorno sin NVLink.
- Asistente de codigo en entornos air-gapped: la combinacion de alto rendimiento en codigo (Terminal-Bench 2.1: 81.0) y la posibilidad de ejecucion local sin conexion a internet lo hace adecuado para entornos corporativos con requisitos de soberania de datos.
- Razonamiento de largo contexto: con soporte de contexto de hasta 1024K en el modelo base, puede procesar documentos extensos, codebases completas o transcripciones largas en una sola pasada.
- Investigacion en decodificacion especulativa: el cabezal MTP-78 y el runtime con MTP-3 permiten experimentar con tecnicas de aceleracion de inferencia y medir su impacto en throughput.
- Servicio de inferencia con precision mixta: el esquema BF16 para expertos compartidos y K6 para routed experts ofrece un punto de equilibrio entre calidad (KLD bajo) y velocidad, util para estudiar el trade-off en produccion.
- Fine-tuning o adaptacion sobre una base cuantizada: al mantener los expertos compartidos en BF16 original, es posible aplicar tecnicas de adaptacion (como LoRA) sobre una parte de los pesos sin re-cuantizar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion especifica en la informacion disponible. Los datos de rendimiento del modelo base GLM-5.2, publicados por Zhipu AI, indican 81.0 en Terminal-Bench 2.1 y 62.1 en SWE-bench Pro, pero estos corresponden al modelo sin cuantizar.

El autor proporciona metricas de calidad de cuantizacion mediante KLD contra logits de referencia BF16:

| Configuracion | KLD medio (5 ejecuciones) | Desviacion estandar |
|---|---|---|
| Stock reader flags (control) | 0.06033384 | 0.00122809 |
| Exact G64 Q only | 0.05973021 | 0.00233983 |
| BF16 P.V | 0.06155303 | 0.00197113 |
| Exact G64 Q + BF16 P.V | 0.06105802 | 0.00137015 |
| Layout anterior (offline split K6 shared) | 0.062450 | 0.001533 |
| Layout actual (BF16 shared, | 0.064250 | 0.000383 |

Rendimiento de decodificacion (TP4/DCP1/MTP0, split vs merged shared gate+up):

| Decode tok/s | C1 | C4 | C8 |
|---|---|---|---|
| Split gate/up (layout anterior) | 50.62 | 157.34 | 258.81 |
| Merged gate+up (layout actual) | 53.86 | 169.07 | 281.72 |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 701.5 GB en disco, pero los pesos cuantizados a 3.5 bpw requieren aproximadamente 76 GB para los routed experts (segun el autor, los expertos compartidos en BF16 ocupan 5.74 GB sin codificar y 2.20 GB codificados). Con KV cache FP8, se necesita un minimo de 80-96 GB por GPU para servir el modelo completo.
- GPUs recomendadas: 4x NVIDIA RTX PRO 6000 Blackwell (SM120, 96 GB, PCIe sin NVLink) es la configuracion de referencia del autor. Tambien son compatibles GPUs Blackwell con 96 GB o mas, como la B300 o similares.
- GPU consumer: no cabe en una GPU consumer actual (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB). Se necesitarian al menos 3-4 GPUs consumer con NVLink o una configuracion de memoria unificada.
- Opciones de despliegue: el repositorio incluye un runtime de servicion propio (server.sh) con soporte TP4/DCP4, cuantizacion online (ONLINE_QUANT=exl3-b6), y decodificacion especulativa MTP-3. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: 53.86 tok/s en un solo GPU (C1), 169.07 tok/s en C4, 281.72 tok/s en C8, medidos en TP4/DCP1/MTP0 con 4x RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78 (este) | 173B totales (cuantizado) | no disponible | no disponible | EXL3 Trellis safetensors | Cuantizacion comunitaria, MTP-78, runtime propio |
| GLM-5.2-EXL3-DENSE6-MTP78 (mismo autor) | 150.1B | 1024K | no disponible | EXL3 Trellis | Variante con 6 expertos densos, segun llm-explorer.com |
| GLM-5.2 (base, zai-org) | 753B totales / 173B activos | 1024K | no disponible | BF16 | Modelo original sin cuantizar, requiere hardware de datacenter |
| GLM-5.1 (base, zai-org) | no disponible | no disponible | no disponible | BF16 | Version anterior, 63.5 en Terminal-Bench 2.1 vs 81.0 del 5.2 |

La comparativa directa con otros modelos cuantizados de la misma categoria (p.ej. versiones EXL3 de Llama, Qwen o DeepSeek) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta documentada en el repositorio de HuggingFace. El modelo base GLM-5.2 de Zhipu AI tiene su propia licencia, pero esta cuantizacion no especifica los terminos de uso. Verificar antes de usar en produccion.
- El autor advierte explicitamente que las metricas KLD se obtuvieron con una unica ventana de 2,048 tokens de WikiText y 2,047 posiciones teacher-forced, y que "el informe no afirma calidad general de tareas ni cualificacion para produccion".
- La comparacion Welch de 5 ejecuciones entre el reader G64-Q-only y el stock resulto inconclusa (p=0.6276), lo que significa que la mejora de KLD reportada no es estadisticamente significativa.
- El checkpoint requiere el runtime especifico del autor (server.sh con digest-pinned r17). No se garantiza compatibilidad con otros motores de inferencia EXL3.
- Si se descargo el repositorio antes del 2026-08-10, es necesario re-descargar varios ficheros (model.safetensors.index.json, config.json, quantization_config.json, shards model-layer-003 a model-layer-078, y model-sharedbf16.safetensors) para obtener la revision actual.
- El modelo base GLM-5.2 puede presentar sesgos y alucinaciones tipicos de modelos de lenguaje de gran tamano, especialmente en idiomas distintos de chino e ingles. No hay informacion especifica sobre sesgos en esta cuantizacion.
- El tamano del repositorio (701.5 GB) implica costes significativos de almacenamiento y transferencia. La descarga requiere al menos 1.5 TB de espacio libre para descomprimir y verificar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78
- Repositorio GitHub del runtime: https://github.com/brandonmmusic-max/glm52-exl3-sparkinfer
- Blog oficial de GLM-5.2 (Zhipu AI): https://z.ai/blog/glm-5.2
- Ficha en llm-explorer.com (variante DENSE6): https://llm-explorer.com/model/brandonmusic%2FGLM-5.2-EXL3-DENSE6-MTP78,1fxI8sVlv3dnCJMknZGrYV
- Informe sellado R17 FP8 reader: ./R17_FP8_READER_RESULTS_2026-08-22.md (en el repositorio)
- Ledger de resultados G64-Q-only: ./G64_Q_ONLY_RESULTS_2026-08-22.md (en el repositorio)
- Anexo de evidencias en GitHub: https://github.com/brandonmmusic-max/glm52-exl3-sparkinfer/tree/d96f87bcfc83e6f43b09ee2e2aeeb6c44c6ddaf6/docs/benchmarks/2026-08-22-r17-fp8-mla-glm52-tr3v4-3.5bpw-mtp78
