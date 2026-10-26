# hotocooo/lfm25-quant-research-checkpoints

## Resumen

Este repositorio no es un modelo publicado, sino un archivo privado de checkpoints de investigación sobre cuantización de baja precisión. Contiene los resultados de un estudio de replicación y diagnosis de métodos de cuantización (GSQ, GPTQ, cuantización por trellis y correcciones basadas en K-FAC) aplicados sobre los pesos del modelo LFM2.5-2.6B de LiquidAI, en la variante "Turbo-Brilliance" publicada por DavidAU en formato GGUF BF16. Cada checkpoint incluye los códigos cuantizados, los pesos de-cuantizados y las estadísticas de Fisher / K-FAC empleadas durante el proceso.

El interés del artefacto es metodológico: documenta con detalle qué combinaciones de rotación Hadamard, escalas por bloque, ajuste end-to-end de escalas y correcciones de gauge funcionan y cuáles fallan, incluyendo resultados negativos explícitamente etiquetados como inválidos o retirados (un bug de filas muertas y un fallo de logits congelados en BF16 bajo el optimizador Lion). Los números son de semilla única salvo que se indique lo contrario, y el propio autor advierte que no constituyen una comparación concluyente entre métodos.

Los pesos base son los de instrucción de LiquidAI: 246 de 266 tensores son idénticos bit a bit a `LiquidAI/LFM2.5-2.6B@654f9463`, y los 20 kernels F32 de convolución corta coinciden salvo 10.412 subnormales aplanados a cero durante la conversión GGUF→HF. El repositorio ocupa 384 GB por la acumulación de todos los checkpoints, no por el tamaño del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada del modelo base LiquidAI/LFM2.5-2.6B) |
| Parametros totales | ~2,6 mil millones (deducido del identificador del modelo base; no confirmado de forma explicita en la model card) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GSQ y GPTQ: 2,125 / 3,125 / 4,125 bits por peso lineal cuantizado (codigos de 2 bits + una escala BF16 por cada 128 pesos). TRQ (trellis L=12): 2,001 / 3,001 / 4,001 bits por peso. Variantes K-FAC: 1,991–2,008 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0). Nota: la model card de DavidAU declara apache-2.0, pero este repositorio adopta los terminos upstream lfm1.0 |
| Formato de pesos | `quant.pt` (diccionario con `codes` int8 [out, in], `scales` fp32 [out, in/128] y `cfg`); safetensors para el BF16 convertido en `models/lfm25-tb-hf/`; GGUF en el modelo base upstream |
| Tamano del repositorio | 384,0 GB (archivo de todos los checkpoints, no un unico modelo) |
| Visibilidad | privado |
| Metrica de evaluacion | KL por token (BF16 ‖ cuantizado) sobre wiki y FineWeb-Edu, y perplejidad sobre wiki |
| Pesos de referencia | `LFM2.5-2.6B-Q3.8-TBrilliance-BF16.gguf`, revision `ba98a160`, sha256 `c86cd3c3f4f9fd71...` |

## Arquitectura y entrenamiento

El objeto de estudio es la cuantizacion post-entrenamiento de los pesos de un transformer (la arquitectura concreta de LFM2.5 no se detalla en la model card). Se comparan tres familias: GPTQ en etapa de bloque como referencia, GSQ con rotacion Hadamard y escalas por bloque, y TRQ, una cuantizacion por trellis con L=12 que codifica los pesos mediante un retículo en lugar de escalares independientes. Sobre esa base se anaden dos mecanismos adicionales: una etapa end-to-end (`/e2e`) que ajusta escalas y normas con los codigos congelados, correspondiente a la fase final del articulo de GSQ, y correcciones de gauge derivadas de estadisticas K-FAC/Fisher con valores `kfra1.9893` y `kfra2.0`.

El proceso de validacion incluye verificacion sha256 de cada fichero contra la copia local antes de borrarla, conversion GGUF→HF y comprobacion cruzada contra llama.cpp. La model card documenta tres hallazgos negativos relevantes: un bug de filas muertas en la primera implementacion de GSQ (checkpoint `b2_gsq_fp_block_s0_deadrowbug`, conservado como resultado negativo), logits BF16 congelados bajo el optimizador Lion que invalidan el run `b2_gsq_fp_block_s0_bf16lr1e-4`, y un run retirado por aplicar signos Hadamard sobre columnas en lugar de aleatorios (`b2_trellisL12_s0_colsignRHT`). No se describe en la informacion disponible ningun entrenamiento adicional del modelo mas alla del ajuste de escalas/normas de la etapa e2e.

## Capacidades

- El repositorio no es un modelo desplegable: su funcion es preservar artefactos de investigacion (codigos, pesos de-cuantizados y estadisticas) reproducibles.
- Permite reconstruir el modelo LFM2.5-2.6B (pesos de instruccion de LiquidAI) a 2, 3 y 4 bits por peso mediante de-cuantizacion `codes * scales[:, col // 128]`.
- Incluye checkpoints con etapa end-to-end que ajusta escalas y normas manteniendo los codigos congelados.
- Aporta estadisticas Fisher / K-FAC reutilizables para estudiar transformaciones de gauge en cuantizacion de baja precision.
- Conserva resultados negativos etiquetados (bug de filas muertas, logits BF16 congelados, rotacion mal aplicada) como material de referencia.
- Capacidades del modelo subyacente (generacion de texto, seguimiento de instrucciones, tool calling, vision, multilingueismo): no disponibles en la informacion proporcionada; no se han evaluado en este repositorio.
- No se han publicado evaluaciones zero-shot de accuracy; el propio autor indica que eso requiere el protocolo pre-registrado de 3 semillas con bytes exactos.

## Casos de uso

- Replicacion de experimentos de cuantizacion: cargar `quant.pt` de cada run y reproducir las cifras de KL y perplejidad de la tabla con el mismo pipeline de evaluacion (ventanas de 2048 tokens, KL en la segunda mitad de cada ventana).
- Estudio de metodos de cuantizacion extrema: comparar GSQ, GPTQ y TRQ a ~2 bits sobre un mismo modelo base y aislar el efecto de la rotacion Hadamard y de las escalas por bloque.
- Analisis de estadisticas de segundo orden: utilizar los tensores Fisher / K-FAC archivados para investigar transformaciones de gauge y su impacto en el error de cuantizacion a 1,99–2,00 bits.
- Investigacion de fallos silenciosos: usar los checkpoints marcados como INVALID o WITHDRAWN como casos de prueba para detectar bugs de filas muertas o de congelacion de logits en pipelines propios.
- Ajuste fino de escalas con codigos congelados: reutilizar la etapa e2e como referencia para implementar tecnicas de calibracion que reduzcan la perplejidad sin cambiar los codigos (de 90,4 a 29,2 de PPL en `b2_gsq_fp_block_s0_fp32`).
- Auditoria de linaje de pesos: verificar la equivalencia bit a bit entre un GGUF de terceros y los pesos oficiales de LiquidAI (246/266 tensores identicos, 20 kernels F32 con diferencias solo en subnormales).
- Docencia y divulgacion tecnica: disponer de un conjunto de checkpoints con errores conocidos y etiquetados para explicar buenas practicas de evaluacion en cuantizacion.

## Benchmarks y rendimiento

KL = KL medio por token (BF16 ‖ cuantizado) sobre la segunda mitad de cada ventana de 2048 tokens; ± = error estandar sobre las medias por ventana. Las cifras son de semilla unica salvo indicacion contraria.

| Run | Metodo | Etapa | bits/peso | KL wiki | KL FineWeb-Edu | PPL wiki | Estado |
|---|---|---|---|---|---|---|---|
| `b2_gptq_fp_block_s0` | GPTQ | bloque | 2,125 | 1,396 | 1,347 | 47,0 | referencia |
| `b2_gsq_fp_block_rot_s0_fp32` | GSQ (rotado) | bloque | 2,125 | 1,430 ± 0,016 | 1,367 ± 0,033 | 78,2 | control |
| `b2_gsq_fp_block_s0_fp32` | GSQ | bloque | 2,125 | 1,493 ± 0,015 | 1,513 ± 0,037 | 90,4 | vigente |
| `b2_gsq_fp_block_s0_fp32/e2e` | GSQ | bloque + e2e | 2,125 | 0,932 ± 0,011 | 0,776 ± 0,016 | 29,2 | vigente |
| `b2_gsq_fp_block_s1_fp32/e2e` | GSQ | bloque + e2e | 2,125 | 0,969 ± 0,011 | 0,777 ± 0,016 | 34,4 | vigente |
| `b2_gsq_fp_block_s2_fp32/e2e` | GSQ | bloque + e2e | 2,125 | 0,940 ± 0,011 | 0,767 ± 0,016 | 27,3 | vigente |
| `b2_trellisL12_s0` | TRQ (L=12) | bloque | 2,001 | 0,625 ± 0,009 | 0,495 ± 0,017 | 29,9 | vigente |
| `b2_trellisL12_s0/e2e` | TRQ (L=12) | bloque + e2e | 2,007 | 0,526 ± 0,007 | 0,446 ± 0,013 | 21,8 | vigente |
| `b2_trellisL12_s1/e2e` | TRQ (L=12) | bloque + e2e | 2,007 | 0,529 ± 0,008 | 0,424 ± 0,013 | 20,5 | vigente |
| `b2_trellisL12_s2/e2e` | TRQ (L=12) | bloque + e2e | 2,007 | 0,532 ± 0,008 | 0,416 ± 0,013 | 19,6 | vigente |
| `b3_gsq_fp_block_s0_fp32` | GSQ | bloque | 3,125 | 0,502 ± 0,007 | 0,483 ± 0,025 | 42,6 | vigente |
| `b3_trellisL12_s0` | TRQ (L=12) | bloque | 3,001 | 0,215 ± 0,004 | 0,158 ± 0,009 | 26,0 | vigente |
| `b4_gsq_fp_block_s0_fp32` | GSQ | bloque | 4,125 | 0,280 ± 0,004 | 0,156 ± 0,008 | 36,1 | vigente |
| `b4_trellisL12_s0` | TRQ (L=12) | bloque | 4,001 | 0,061 ± 0,001 | 0,038 ± 0,002 | 27,7 | vigente |
| `kfra1.9893_gauge_trellisL12_s0/e2e` | TRQ + gauge K-FAC | bloque + e2e | 1,997 | 0,584 ± 0,009 | 0,370 ± 0,011 | 18,8 | vigente |
| `kfra2.0_trellisL12_s0/e2e` | TRQ + gauge K-FAC | bloque + e2e | 2,008 | 0,532 ± 0,008 | 0,377 ± 0,013 | 19,7 | vigente |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni evaluaciones zero-shot en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo de-cuantizado en BF16: aproximadamente 5,2 GB solo de pesos para 2,6 mil millones de parametros, mas overhead de activaciones y cache KV (estimacion, no medida en la informacion disponible).
- Almacenamiento de los artefactos: los `quant.pt` guardan los codigos como int8 [out, in], es decir 8 bits por peso en disco mas una escala fp32 por cada 128 pesos, aunque la tasa efectiva sea de 2,125 bits por peso; el repositorio completo ocupa 384 GB.
- GPU consumer: el modelo de 2,6B en BF16 cabe holgadamente en una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB); las variantes de 2 bits dejan margen amplio para lotes grandes o contexto largo.
- GPU de datacenter: A100 (40/80 GB) y H100 (80 GB) son adecuadas para evaluacion por lotes y calculo de KL/perplejidad a gran escala; no se especifican requisitos mayores.
- Despliegue: el archivo no es cargable directamente por vLLM, TGI, llama.cpp u Ollama; requiere un script de de-cuantizacion propio que aplique `codes * scales[:, col // 128]` y redondee las escalas a BF16, y despues una conversion a safetensors o GGUF. El modelo base upstream ya esta disponible en GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa interna entre los metodos evaluados en el propio repositorio a ~2 bits (misma base, mismo pipeline de evaluacion):

| Metodo | bits/peso | KL wiki | PPL wiki | Etapa e2e | Notas |
|---|---|---|---|---|---|
| GPTQ | 2,125 | 1,396 | 47,0 | no | solo etapa de bloque en este estudio |
| GSQ | 2,125 | 1,493 ± 0,015 | 90,4 | opcional (mejora a 0,932 / 29,2) | control con rotacion Hadamard: 1,430 / 78,2 |
| TRQ (trellis L=12) | 2,001 | 0,625 ± 0,009 | 29,9 | opcional (mejora a 0,526 / 21,8) | mejor KL de bloque del archivo a 2 bits |
| TRQ + gauge K-FAC (kfr=2.0) | 2,008 | 0,532 ± 0,008 | 19,7 | si | mejor perplejidad del archivo (~2 bits) |

Alternativas externas de cuantizacion para modelos de ~2–3B (AWQ, QuIP#, QTIP, GGUF k-quants): no disponibles en la informacion proporcionada; el repositorio solo etiqueta `qtip` como tag, sin resultados asociados.

## Limitaciones y advertencias

- No es un modelo publicado: el autor lo declara explicitamente "research artifacts, not release models"; varios runs estan deliberadamente rotos o retirados.
- Resultados de semilla unica en la mayoria de runs: no permiten afirmar que un metodo supere a otro; el protocolo pre-registrado exige 3 semillas, bytes exactos y accuracy zero-shot.
- Ausencia total de evaluaciones de calidad downstream (benchmarks de razonamiento, codigo, matematicas o tareas conversacionales).
- Riesgo de licencia: la model card de DavidAU declara apache-2.0 mientras que los pesos de LiquidAI estan bajo LFM Open License v1.0; el repositorio adopta lfm1.0, cuyos terminos concretos para uso comercial no se detallan en la informacion disponible y deben consultarse en el enlace de licencia.
- Linaje de pesos con una discrepancia conocida: 20 kernels F32 de convolucion corta difieren en 10.412 subnormales aplanados a cero durante la conversion GGUF→HF.
- Repositorio privado y de 384 GB: la descarga completa es inviable en la mayoria de entornos; conviene bajar solo los `quant.pt` de los runs de interes.
- Idiomas soportados y longitud de contexto no documentados en esta ficha; no se han verificado comportamientos multilingues.
- Sin `pipeline_tag` ni plantilla de chat declarada: no hay garantia de que la de-cuantizacion reproduzca exactamente el comportamiento conversacional del modelo original.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este repositorio (solo dominios de contenido adulto sin relacion), por lo que no hay fuentes externas independientes que verifiquen las cifras.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hotocooo/lfm25-quant-research-checkpoints
- Dataset con el informe, metodos, hallazgos y changelog: https://huggingface.co/datasets/hotocooo/lfm25-gsq-replication-diagnosis
- Modelo base (variante Turbo-Brilliance, GGUF): https://huggingface.co/DavidAU/LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF
- Modelo base original (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo base segun linaje declarado: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Resultados de busqueda web: sin enlaces relevantes para este modelo.
