# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Formal05pct

## Resumen

SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Formal05pct es un ajuste fino supervisado (SFT) de Qwen2.5-Coder-7B, desarrollado por el investigador flaitenberger, que incorpora un 5 % de datos sinteticos de deduccion logica a una mezcla de instrucciones de 100.000 ejemplos. El modelo forma parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*, actualmente en revision, cuyo objetivo es demostrar que una pequena proporcion de problemas de deduccion multi-paso generados por programa (sin intervencion de otro modelo) mejora el razonamiento logico de modelos ajustados por instrucciones.

La arquitectura subyacente es la de Qwen2.5-Coder-7B, un transformer decoder-only denso de 7.615.616.512 parametros (aproximadamente 7,6 mil millones), con una longitud de contexto nativa de 32.768 tokens en la familia Qwen2.5. El ajuste se realiza a maxima longitud de secuencia de 8.192 tokens con mascara de perdida solo en tokens del asistente. Los pesos se distribuyen en bf16 safetensors bajo licencia Apache 2.0.

La relevancia del modelo es principalmente metodologica: sirve como evidencia empirica de que datos de deduccion formal verificables por un comprobador simbolico, mezclados en una proporcion modesta, elevan la precision en ProofWriter entre 2 y 17 puntos porcentuales segun profundidad y modo de respuesta, con mejoras mas moderadas en FOLIO (+2,0) y GPQA-Diamond (+1,0), a costa de ligeras perdidas en generacion de codigo (HumanEval -4,3). Es un modelo de investigacion, no un modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento (contexto nativo de Qwen2.5: 32.768) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B, un transformer decoder-only denso con atencion causal estandar, RoPE y las optimizaciones habituales de la familia Qwen2.5 (GQA, SwiGLU, RMSNorm). No se introduce ninguna modificacion arquitectonica: el trabajo se centra exclusivamente en la composicion del dataset de ajuste.

El entrenamiento consiste en un SFT de parametros completos durante una epoca sobre 100.000 ejemplos de chat de un solo turno. La mezcla `Dolci100k-Formal05pct` combina 95.000 ejemplos de `allenai/Dolci-Instruct-SFT-No-Tools` (muestreados con semilla 3407) con 5.000 problemas de deduccion generados. Estos problemas son deducciones ground de clausulas de Horn sobre constantes abstractas (palabras de color, arbol y direccion), con reglas encadenadas de hasta 25 niveles, reglas distractoras que nunca se disparan y una pregunta con cuatro respuestas candidatas; la respuesta objetivo incluye una derivacion paso a paso, en ingles o en notacion formal con constantes y predicados declarados y lineas numeradas y justificadas, verificada por un comprobador simbolico. Hiperparametros: learning rate 5e-06 con schedule lineal y warmup ratio 0,03, batch global 128, longitud maxima 8.192 (el run aborta si mas del 0,5 % de los targets se truncarian), precision bf16 mixta, FSDP con full sharding y gradient checkpointing, perdida solo en tokens del asistente con la plantilla de chat de Qwen2.5. Se libera el checkpoint final del run `seed3408`.

## Capacidades

- Generacion de texto conversacional de un solo turno en ingles, con la plantilla de chat de Qwen2.5.
- Razonamiento deductivo multi-paso: derivaciones encadenadas con conclusiones intermedias, verificables por comprobador simbolico.
- Razonamiento logico formal en notacion con constantes y predicados declarados.
- Generacion de codigo (heredada de Qwen2.5-Coder-7B), aunque con degradacion medida en HumanEval.
- Matematicas basicas e intermedias (GSM8K 76,1).
- Respuesta a preguntas de conocimiento general y sentido comun (MMLU, HellaSwag, BoolQ, SciQ).
- Seguimiento de instrucciones con formato estricto (IFEval strict 40,9, superior al baseline).
- Tool calling / function calling: no entrenado explicitamente; el dataset base excluye herramientas (`No-Tools`), por lo que no se debe asumir soporte fiable.
- Capacidades de agente multi-paso: no disponibles de forma nativa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion sobre datos sinteticos para razonamiento: el modelo sirve como punto de comparacion controlado frente al baseline de la misma mezcla sin datos de deduccion, permitiendo aislar el efecto de los 5.000 ejemplos logicos.
- Evaluacion de razonamiento deductivo: util para reproducir los resultados en ProofWriter, FOLIO y las subtareas multi-paso de BIG-Bench Hard, dado que el autor publica los ficheros de evaluacion y `provenance.json`.
- Generacion de derivaciones formales verificables: el modelo produce cadenas de deduccion con lineas numeradas y justificadas que un comprobador simbolico puede validar, lo que permite generar datos de entrenamiento o de evaluacion con garantia de correccion.
- Ensenanza de logica formal: generacion de explicaciones paso a paso de deducciones sobre clausulas de Horn, utiles como material didactico o como referencia en sistemas de tutoria.
- Analisis de sesgo de etiqueta: dado que el articulo atribuye parte de la mejora a que el modelo deja de preferir una etiqueta de respuesta sobre las demas, el modelo es adecuado para estudiar calibracion y sesgos de respuesta en tareas de opcion multiple.
- Prototipado de pipelines de razonamiento en ingles: para experimentos internos donde se requiera un modelo de 7B con licencia Apache 2.0, contexto de 8K y comportamiento logico mejorado, desplegable con vLLM o TGI.
- Ablacion de mezclas de datos: al existir variantes con distintos porcentajes (5-25 %) y semillas en el repositorio `AllSeeds`, permite estudiar la sensibilidad al porcentaje de datos sinteticos y a la semilla.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el baseline del mismo run (misma mezcla sin los ejemplos de deduccion):

| Benchmark | Este modelo | Baseline | Diferencia |
|---|---|---|---|
| ARC-Challenge | 46,1 | 46,8 | -0,8 |
| GSM8K | 76,1 | 77,9 | -1,7 |
| MMLU | 65,0 | 65,2 | -0,3 |
| HellaSwag | 70,7 | 70,9 | -0,2 |
| LogiQA (AGIEval) | 32,3 | 33,0 | -0,8 |
| BBH | 67,3 | 67,5 | -0,1 |
| HumanEval | 65,2 | 69,5 | -4,3 |
| MBPP | 71,2 | 71,8 | -0,6 |
| BoolQ | 84,4 | 84,6 | -0,2 |
| IFEval (strict) | 40,9 | 38,3 | +2,6 |
| RACE | 43,7 | 43,4 | +0,3 |
| SciQ | 95,4 | 95,7 | -0,3 |
| TruthfulQA-MC2 | 49,4 | 49,0 | +0,5 |
| FOLIO | 57,1 | 55,2 | +2,0 |
| GPQA-Diamond | 34,3 | 33,3 | +1,0 |
| ProofWriter depth 0, CoT | 52,0 | 43,0 | +9,0 |
| ProofWriter depth 1, CoT | 42,6 | 35,0 | +7,6 |
| ProofWriter depth 2, CoT | 43,4 | 39,6 | +3,8 |
| ProofWriter depth 3, CoT | 41,6 | 38,2 | +3,4 |
| ProofWriter depth 5, CoT | 42,0 | 40,2 | +1,8 |
| ProofWriter depth 0, directa | 51,0 | 49,0 | +2,0 |
| ProofWriter depth 1, directa | 41,0 | 37,8 | +3,2 |
| ProofWriter depth 2, directa | 59,0 | 48,2 | +10,8 |
| ProofWriter depth 3, directa | 59,8 | 44,4 | +15,4 |
| ProofWriter depth 5, directa | 62,4 | 45,4 | +17,0 |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 15,2 GB solo de pesos, mas KV cache; se recomienda un minimo de 18-20 GB para secuencias moderadas.
- VRAM en cuantizacion de 8 bits: en torno a 8 GB; en 4 bits (GGUF Q4_K_M, AWQ o GPTQ): en torno a 4,5-5,5 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S, A10G 24 GB (bf16 justo), L4 24 GB.
- GPU de consumo: cabe en bf16 en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto limitado; en cuantizacion 4-8 bits cabe en RTX 4080 (16 GB), RTX 4070 Ti (12 GB) y RTX 3060 (12 GB).
- Despliegue: transformers, vLLM, TGI (el modelo declara `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Formal05pct | 7,6B | 8.192 (entrenamiento) | Apache 2.0 | Especializado en deduccion; ProofWriter depth 5 directa 62,4 |
| SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline | 7,6B | 8.192 (entrenamiento) | Apache 2.0 | Misma mezcla sin datos de deduccion; ProofWriter depth 5 directa 45,4 |
| Qwen2.5-Coder-7B (base) | 7,6B | 32.768 | Apache 2.0 | Modelo original; sin ajuste de instrucciones especifico de este experimento |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | Alternativa generalista de la misma familia; no evaluada en la model card |

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.
- Solo ingles: la model card declara `language: en`; el rendimiento en castellano no esta caracterizado y probablemente sea deficiente.
- Perdida medible en generacion de codigo: HumanEval cae 4,3 puntos respecto al baseline, relevante si se usa como sustituto directo de Qwen2.5-Coder-7B.
- Sin soporte fiable de tool calling ni de agentes: el dataset base excluye herramientas (`Dolci-Instruct-SFT-No-Tools`) y no se entrena con function calling.
- Riesgo de alucinacion en conocimiento factual: el modelo base conserva el conocimiento de Qwen2.5-Coder, pero el ajuste no refuerza la veracidad; TruthfulQA-MC2 se mantiene en 49,4, lejos de ser fiable.
- Sesgos de etiqueta en opcion multiple: el articulo indica que parte de la mejora proviene de reducir la preferencia por una etiqueta, lo que sugiere que el baseline tenia sesgo; conviene verificar la distribucion de respuestas en produccion.
- Contexto efectivo limitado a 8.192 tokens en entrenamiento, aunque la arquitectura soporte 32.768; no se garantiza buen comportamiento mas alla de 8K.
- Datos sinteticos de dominio abstracto: las deducciones usan constantes y predicados artificiales sin conocimiento del mundo; la transferencia a logica en lenguaje natural no esta garantizada mas alla de los benchmarks reportados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta disenado ni validado para produccion.
- El articulo esta en revision y el enlace al preprint no estaba disponible en la model card consultada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Formal05pct
- Repositorio con todas las semillas: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds
- Baseline de la misma mezcla: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Configuracion `logic_p05`: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures/viewer/logic_p05
- Dataset base Dolci: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
