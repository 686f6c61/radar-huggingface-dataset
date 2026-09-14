# lvkaokao/DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound

## Resumen

DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound es un checkpoint cuantizado de forma post-entrenamiento del modelo deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario lvkaokao. No se trata de un modelo nuevo ni de un fine-tune: la topología, el tokenizador y los tensores densos se conservan, y la intervención se limita a los expertos enrutados (incluidos los de predicción multi-token) y a las tablas de embedding denominadas «Engram» de las capas 1 y 14. El objetivo es reducir el peso en disco y el coste de servir un modelo MoE de gran tamano sin degradar la calidad de forma medible.

El checkpoint pasa de 510,3 GB a 451,7 GB (una reducción aproximada del 11,5 %) manteniendo el conjunto de parámetros en 301.412.628.194, según los safetensors publicados. La cuantización se ha generado con AutoRound 0.15.0 en modo `--model_free` con esquema W4A16 y grupo de 32, y el autor reporta una pérdida indistinguible del ruido en GSM8K (93,93 / 94,01 frente a 92,87 del baseline, 5-shot, sin modo thinking, n=1319).

Su relevancia práctica es doble: por un lado demuestra que los expertos MXFP4 de un MoE de esta escala se pueden reconvertir a INT4 con empaquetado auto_gptq y ejecutar mediante la ruta GPTQ-MoE integrada en vLLM (MoeWNA16/Marlin); por otro, exige hoy un plugin fuera del árbol de vLLM (`dsv41-quant-plugin`) y variables de entorno específicas, lo que lo convierte en un artefacto orientado a equipos con infraestructura propia más que a un reemplazo directo del modelo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo `deepseek_v41`; incluye expertos enrutados, expertos compartidos, tablas «Engram» (capas 1 y 14), torre de visión con aligner y expertos MTP |
| Parametros totales | 301.412.628.194 (dato declarado en los safetensors del repo) |
| Parametros activos | no disponible (modelo MoE; la model card no desglosa parámetros activos) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`, pero es una configuración de despliegue, no una especificación del modelo) |
| Tipos de cuantizacion | Expertos enrutados: INT4 W4A16, group_size 32, simétrico, empaquetado auto_gptq (`qweight`/`qzeros`/`scales`). Engram embedding tables: INT4 g32 simétrico (uint8 `[R,128]` + escala fp16 `[R,8]`). Atención, `shared_experts` y `engram.wkv`: BF16 (descuantizado). Visión, aligner, embed, head y norms: BF16 sin cambios. Modelo base original: expertos MXFP4 (E2M1 + E8M0/32), Engram FP8 (E4M3 + E8M0/32), atención/shared MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en este repositorio; verificar los términos del modelo base) |
| Formato de pesos | safetensors, con empaquetado auto_gptq para expertos y tablas Engram; BF16 para el resto |

## Arquitectura y entrenamiento

Este checkpoint no introduce innovaciones arquitectónicas. Reproduce la topología de DeepSeek-V4.1-Flash: un transformer con mezcla de expertos que incorpora expertos compartidos (`shared_experts`), expertos enrutados (`ffn.experts.*`, incluidos los correspondientes a predicción multi-token), tablas de embedding «Engram» en las capas 1 y 14 con su propio módulo `wkv`, y una torre de visión con aligner. La cuantización respeta esa estructura componente a componente en lugar de aplicar un esquema uniforme.

El procedimiento aplicado es una cuantización post-entrenamiento con AutoRound 0.15.0 en modo `--model_free` con RTN e `iters=0`, es decir, sin calibración iterativa ni carga del modelo a través de Transformers. Los expertos enrutados se reconvierten de MXFP4 a INT4 W4A16 con `group_size` 32 simétrico y empaquetado auto_gptq; las tablas Engram pasan de FP8 a INT4 g32 mediante un script RTN propio y se insertan después en el checkpoint; atención, `shared_experts` y `engram.wkv` se descuantizan a BF16; y visión, aligner, embed, head y norms se mantienen intactos en BF16. En inferencia, la GEMM INT4 de expertos se resuelve por la ruta GPTQ-MoE nativa de vLLM (MoeWNA16/Marlin) sin kernels personalizados, mientras que las capas densas se ejecutan en BF16 puro.

## Capacidades

- Generación de texto y razonamiento en modo conversacional, heredados del modelo base DeepSeek-V4.1-Flash.
- Razonamiento matemático verificable: el autor reporta 93,93 / 94,01 en GSM8K 5-shot con el modo thinking desactivado, frente a 92,87 del baseline no cuantizado.
- Procesamiento multimodal: la torre de visión y el aligner se conservan en BF16 sin cuantizar, por lo que la capacidad de visión del modelo base no se degrada por esta receta. El flag `--language-model-only` permite desactivarla si solo se necesita texto.
- Razonamiento multi-paso y decodificación con predicción multi-token (MTP): los expertos MTP también se cuantizan, de modo que la ruta de decodificación especulativa sigue disponible.
- Soporte de tool calling / function calling: no confirmado de forma explícita en la model card; se hereda, si existe, del modelo base (no disponible).
- Capacidades multilingües: no disponibles; el autor no declara la lista de idiomas del modelo base.
- Despliegue compatible con endpoints: el repositorio incluye el tag `endpoints_compatible`.

## Casos de uso

- Servicio de inferencia en clúster propio: el checkpoint está pensado para ejecutarse con vLLM en configuración tensor-parallel 4 sobre 4×H200, con `--gpu-memory-utilization 0.90`, lo que permite exponer un endpoint de generación de texto reduciendo la huella de pesos en un 11,5 % respecto al checkpoint oficial.
- Evaluación de recetas de cuantización: sirve como punto de referencia reproducible para medir el impacto de W4A16 g32 con RTN (iters=0) sobre expertos MoE y tablas de embedding, comparando contra el checkpoint MXFP4/FP8 oficial.
- Razonamiento matemático y resolución de problemas: con 93,93 en GSM8K 5-shot sin modo thinking, es adecuado para pipelines de verificación de soluciones, generación de ejercicios resueltos y evaluación automática de respuestas numéricas.
- Asistentes conversacionales de contexto medio: el ejemplo de despliegue fija 8192 tokens de ventana, suficiente para atención al cliente multi-turno, resumen de conversaciones y soporte técnico de primer nivel.
- Análisis de documentos con componente visual: al conservar la torre de visión en BF16 y permitir desactivar el modo solo-lenguaje, se puede usar para extracción de información de imágenes y documentos escaneados sin pérdida por cuantización en esa rama.
- Reducción de coste de almacenamiento y distribución: 451,7 GB frente a 510,3 GB facilita el versionado de checkpoints, la replicación entre regiones y la carga en memoria en clústeres con presupuesto de disco ajustado.
- Validación de infraestructura vLLM: útil en equipos que necesiten probar la ruta GPTQ-MoE (MoeWNA16/Marlin) y el plugin `dsv41-quant-plugin` antes de adoptarlos en producción.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Este checkpoint | DeepSeek-V4.1-Flash (oficial) |
|---|---|---|---|
| GSM8K | raw 5-shot, thinking off, n=1319 | 93,93 / 94,01 | 92,87 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, MATH, MMMU u otros) en la informacion disponible. El autor describe la diferencia en GSM8K como «lossless within noise».

## Requisitos de hardware

- Peso de los safetensors: 451,7 GB en disco (frente a 510,3 GB del checkpoint oficial).
- VRAM estimada para inferencia: superior a 451,7 GB solo para pesos, más caché KV y activaciones. No se publica una cifra exacta de VRAM total consumida.
- Configuración verificada por el autor: 4×H200 con tensor-parallel 4, `--gpu-memory-utilization 0.90`, `--max-model-len 8192` y `--language-model-only`. Cada H200 dispone de 141 GB de HBM, lo que suma 564 GB agregados.
- GPU recomendadas: H200 (verificada). No se documenta el comportamiento en A100, H100 ni otras configuraciones; 4×A100 80 GB (320 GB agregados) no bastarían para alojar únicamente los pesos sin recurrir a más GPUs u offload, aunque esto no está verificado por el autor.
- GPU de consumo: no cabe. Ninguna GPU consumer actual dispone de memoria suficiente para 451,7 GB de pesos, ni siquiera con tensor-parallel en varias unidades.
- Opciones de despliegue: vLLM `main` (versión ≥ PR #56201) más el plugin fuera del árbol `dsv41-quant-plugin`, que registra el dispatch auto_gptq para `deepseek_v41` y la búsqueda INT4 en las tablas Engram. Es necesario exportar `DSV41_ENGRAM_DTYPE=int4` y `NCCL_NVLS_ENABLE=0`.
- Otras opciones (llama.cpp, Ollama, TGI, SGLang): no disponible. El formato auto_gptq con empaquetado INT4 de expertos y el lookup Engram INT4 no están documentados para esas herramientas.
- Compatibilidad con la implementación de referencia oficial: no compatible con sus kernels FP8, dado que en este checkpoint las capas densas son BF16.
- Latencia y throughput: no disponible. La model card solo indica que la GEMM INT4 de expertos usa la ruta GPTQ-MoE integrada de vLLM (MoeWNA16/Marlin) sin kernels personalizados.
- Entorno de producción declarado: auto-round 0.15.0 (copia editable con parche de formato de origen de DeepSeek-V4.1) y vLLM main nightly `0.1.1.dev39+g46d2b23ac`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Tamano del repo | GSM8K 5-shot | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (lvkaokao) | 301,4 B | Expertos INT4 W4A16 g32 sim; Engram INT4; denso BF16 | 451,7 GB | 93,93 / 94,01 | MIT |
| DeepSeek-V4.1-Flash (oficial) | no disponible | Expertos MXFP4; Engram FP8; atencion/shared MXFP8; resto BF16 | 510,3 GB | 92,87 | no disponible |
| Otras cuantizaciones de DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible otras cuantizaciones comparables del mismo modelo base (por ejemplo, variantes GGUF, AWQ o GPTQ alternativas), ni modelos de tamano similar con los que establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Dependencia de un plugin no upstreamed: para servir el modelo hace falta `dsv41-quant-plugin`, que no está integrado en vLLM. Esto añade riesgo de mantenimiento y de rotura ante cambios en `main`.
- Requiere configuración manual: es obligatorio `DSV41_ENGRAM_DTYPE=int4` para el lookup Engram y `NCCL_NVLS_ENABLE=0`; omitirlos puede provocar fallos de carga o resultados incorrectos.
- Incompatibilidad con la implementación de referencia oficial: las capas densas están en BF16, por lo que no se pueden usar los kernels FP8 del modelo original.
- Cuantización RTN sin calibración: la receta usa `iters=0` y `--model_free`, sin datos de calibración. Aunque GSM8K no muestra degradación, no hay evidencia publicada sobre otras tareas (código, multilingüe, visión, contexto largo) que permita descartar pérdidas.
- Cobertura de evaluación mínima: el único benchmark reportado es GSM8K en una sola configuración (5-shot, sin thinking, n=1319). No hay datos de MMLU, HumanEval, MATH ni evaluaciones multimodales.
- Idiomas y sesgos: no disponibles. Se heredan, sin documentar, los del modelo base DeepSeek-V4.1-Flash; no se han publicado análisis de sesgo específicos para este checkpoint.
- Riesgo de alucinación: no cuantificado en la información disponible; se asume el comportamiento del modelo base, no medido aquí.
- Limitación práctica de contexto: la configuración verificada limita la ventana a 8192 tokens. No se ha validado el comportamiento con ventanas mayores.
- Licencia: el repositorio declara MIT, pero conviene verificar los términos del modelo base (`deepseek-ai/DeepSeek-V4.1-Flash`) antes de un uso comercial, ya que el checkpoint deriva de él.
- Madurez del artefacto: 0 descargas, 0 «likes», creado y actualizado el mismo día (14 de septiembre de 2026). No hay validación independiente de la comunidad ni informes de terceros.
- Coste de infraestructura: 451,7 GB de pesos implican un mínimo de 4 GPUs de 141 GB en la configuración verificada, lo que excluye hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lvkaokao/DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- AutoRound (Intel): https://github.com/intel/auto-round
- Pull request de vLLM requerido (PR #56201): https://github.com/vllm-project/vllm/pull/56201
- Plugin `dsv41-quant-plugin`: el enlace aparece vacío en la model card, por lo que no se dispone de URL.
- Notas del productor (`quant_engram_int4.py`, `build_b_view_experts.py`, diario de la pipeline aqa): referenciadas en la model card sin URL pública.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo.
