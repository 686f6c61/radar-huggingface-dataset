# sam33339999/Swift-1.5-Qwen3.8-27b-Uncensored-exl3-3.5bpw

## Resumen

Este repositorio contiene una cuantización EXL3 de 3,5 bits por peso del modelo Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicado por el usuario sam33339999. El modelo subyacente es un ajuste fino de razonamiento de UkisAI (Swift) sobre Qwen3.8-27B al que se le ha aplicado una abliteración de dirección única (ablación del vector de rechazo), conservando intacta la torre de visión y la cabeza MTP (multi-token prediction) para permitir decodificación auto-especulativa. La tarea declarada es image-text-to-text, por lo que acepta tanto texto como imágenes.

El interés de esta ficha concreta es que ofrece una versión cuantizada en formato EXL3 (3,5 bpw) de un modelo que, en su versión original, se distribuye en BF16 safetensors. La cuantización agresiva reduce de forma notable el espacio en disco y la VRAM necesarios, a costa de una posible pérdida de precisión que el autor no documenta. El repositorio no incluye tarjeta de modelo propia más allá de los metadatos; la información técnica proviene de la model card de los modelos base de los que deriva.

Según los datos de safetensors del repositorio, el modelo declara 7.669.052.656 parámetros, una cifra que no concuerda con el "27b" del nombre y que probablemente refleja el empaquetado de la cuantización EXL3 más que el conteo real de parámetros. El tamaño total del repositorio es de 15,4 GB. No se han publicado idiomas soportados ni resultados de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa (16 capas) más atención lineal Gated DeltaNet (48 capas); transformer con cabeza MTP y torre de visión |
| Parametros totales | 7.669.052.656 según safetensors del repo (el nombre indica 27b; discrepancia no aclarada) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens (según el comando vLLM de la model card base) |
| Tipos de cuantizacion | EXL3 3,5 bpw (este repo). En repos hermanos: GGUF dinámico Q2-Q8 (llama.cpp/Unsloth) y NVFP4 (vLLM, SGLang); el modelo original está en BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (licencia "other") |
| Formato de pesos | safetensors (cuantizados EXL3); los repos hermanos ofrecen GGUF y NVFP4 |

## Arquitectura y entrenamiento

El modelo base Swift-1.5-Qwen3.8-27B es un ajuste fino orientado a eficiencia de razonamiento sobre Qwen3.8-27B. La arquitectura combina atención completa (16 capas) con atención lineal Gated DeltaNet (48 capas), además de 64 capas con MLP y una cabeza MTP. La cuantización EXL3 de este repositorio se aplica sobre esa arquitectura sin modificar la topología, y conserva tanto la torre de visión como la cabeza MTP, de modo que la decodificación auto-especulativa sigue siendo viable.

El proceso de abliteración que da lugar a la variante "Uncensored" se describe con detalle en la model card del modelo del que deriva. Consiste en recuperar una única dirección de rechazo `r` (a partir de la diferencia entre `orcarouter/Qwen3.8-27B-Uncensored` y Qwen3.8-27B, correspondiente a la técnica de ablación de rechazo de Arditi et al., 2024) y proyectarla fuera de todas las matrices que escriben en el residual. Se editaron 131 tensores: `self_attn.o_proj` (17, incluyendo MTP), `linear_attn.out_proj` (48), `mlp.down_proj` (65, incluyendo MTP) y `embed_tokens` (1). Todo lo demás, incluida la torre de visión, `lm_head` y los 13 tensores MTP restantes, permanece igual. La edición se calculó en float32 y se almacenó en BF16. Según la model card, la dirección de rechazo de Swift y la de Qwen3.8-27B tienen un coseno de 0,99995, lo que indica que el ajuste fino no movió dicha dirección.

## Capacidades

- Generación de texto conversacional (pipeline declarado: image-text-to-text).
- Comprensión de imágenes gracias a la torre de visión, que se conserva intacta en el proceso de abliteración.
- Razonamiento con modo de pensamiento (reasoning parser `qwen3` en la configuración de despliegue de referencia).
- Soporte de tool calling y function calling (`--enable-auto-tool-choice`, parser `qwen3_coder`).
- Decodificación auto-especulativa mediante la cabeza MTP (método `mtp` en vLLM; EAGLE en SGLang).
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Comportamiento "uncensored"/abliterado: según las mediciones del autor, reduce los rechazos de 98/100 a 15/100 sobre el conjunto `mlabonne/harmful_behaviors`.

## Casos de uso

- Asistencia conversacional sin filtros de contenido: el modelo responde a peticiones que el modelo original rechazaba (15/100 rechazos frente a 98/100), útil para escritura creativa, ficción y diálogos de personajes sin restricciones temáticas.
- Atención al cliente multi-turno: con 262.144 tokens de contexto puede mantener conversaciones largas y arrastrar historial e información de producto sin truncar. Requiere añadir salvaguardas externas, ya que el modelo no incorpora filtrado propio.
- Análisis de documentos e imágenes: la torre de visión permite extraer información de capturas, diagramas o páginas escaneadas, y combinarla con texto largo en un único contexto.
- Generación de código en producción: admite tool calling con parser `qwen3_coder`, por lo que puede integrarse en pipelines de CI/CD para generar parches, invocar herramientas o resolver tareas multi-paso.
- Procesamiento de documentación técnica extensa: resúmenes, extracción y preguntas sobre bases de código o manuales que superan los cientos de miles de tokens.
- Investigación en seguridad y alineamiento: sirve como modelo de referencia abliterado para estudiar comportamiento de rechazo, medir divergencia KL frente al original y evaluar técnicas de red teaming.
- Agentes autónomos multi-paso: combinando tool calling, contexto largo y decodificación especulativa para bucles de razonamiento con verificación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones de abliteración de la model card, realizadas con la herramienta Heretic (`evaluate_model`, BF16) sobre el modelo base, no sobre esta cuantización EXL3:

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| Este modelo (frente a Swift) | 15/100 | 0,0634 |
| Swift-Qwen3.8-27B | 98/100 | 0 |
| Referencia: orcarouter/Qwen3.8-27B-Uncensored (frente a Qwen3.8-27B) | 17/100 | 0,0621 |
| Referencia: Qwen3.8-27B | 98/100 | 0 |

Metodología declarada: 100 prompts de `mlabonne/harmful_behaviors`, greedy, hasta 100 tokens, detector de rechazo por palabras clave de Heretic; la divergencia KL se mide sobre primeras distribuciones de token con 100 prompts de `mlabonne/harmless_alpaca`. El modo de pensamiento se cierra de inmediato con el prefijo `"\n</think>\n\n"`. Los propios autores advierten que los recuentos de rechazo no son comparables entre model cards.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se han evaluado el comportamiento de rechazo en modo de pensamiento, la supervivencia de las trazas de razonamiento cortas de Swift ni la tasa de aceptación de la MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,4 GB en disco; en EXL3 a 3,5 bpw la VRAM necesaria para los pesos estará por debajo de esa cifra (aproximadamente 12-15 GB, estimación orientativa, no confirmada por el autor), más el espacio para caché KV. A 262.144 tokens de contexto, la caché KV puede crecer de forma muy significativa y dominar el consumo.
- GPU recomendadas: para la cuantización EXL3, GPU consumer de gama alta con 24 GB (RTX 3090, RTX 4090) o superiores. Para contextos largos completos, se recomiendan GPU profesionales (A100 40/80 GB, H100). Para el modelo BF16 original, el requisito es sustancialmente mayor.
- Cabe en consumer GPU: previsiblemente sí en tarjetas de 24 GB con contextos moderados, siempre que el conteo real de parámetros se corresponda con lo que sugiere el tamaño del repo.
- Opciones de despliegue: para esta cuantización EXL3, ExLlamaV3 (y TabbyAPI como servidor). Para los repos hermanos, llama.cpp/Ollama (GGUF) y vLLM/SGLang (NVFP4, BF16). La model card base documenta `vllm serve` con `--dtype bfloat16`, `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Latencia y throughput estimados: no disponibles. La cabeza MTP permite decodificación especulativa (3 tokens especulativos en vLLM; EAGLE con 3 pasos y 4 tokens borrador en SGLang), lo que debería aumentar el throughput, pero no se publican cifras de aceptación ni de velocidad.
- Parámetros de muestreo recomendados: temperature 1,0, top_p 0,95, top_k 20, min_p 0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos / KL | Cuantización | Licencia |
|---|---|---|---|---|---|
| Este repo (Swift-1.5-Qwen3.8-27b-Uncensored EXL3 3,5 bpw) | 7.669.052.656 según safetensors (nombre: 27b) | 262.144 | 15/100, KL 0,0634 (medido sobre el base) | EXL3 3,5 bpw | Swift Open License v1.0 |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | No disponible | 262.144 (heredado) | 15/100, KL 0,0634 | BF16 safetensors, NVFP4, GGUF | Swift Open License v1.0 |
| ukisai/Swift-Qwen3.8-27b (base sin abliterar) | No disponible | 262.144 (heredado) | 98/100, KL 0 | BF16, GGUF, NVFP4 | Swift Open License v1.0 |
| orcarouter/Qwen3.8-27B-Uncensored | No disponible | No disponible | 17/100, KL 0,0621 | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- Modelo abliterado/uncensored: elimina deliberadamente el mecanismo de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal. Requiere salvaguardas externas si se despliega de cara al público.
- Sesgos conocidos: no documentados en la información disponible, pero hereda los sesgos del corpus de entrenamiento de Qwen3.8-27B y del ajuste fino de Swift.
- Riesgo de alucinación: no evaluado específicamente; la abliteración puede alterar la calibración de la confianza del modelo, ya que modifica 131 tensores, incluidos `embed_tokens` y todas las proyecciones residuales.
- Efectos de la cuantización: la cuantización EXL3 a 3,5 bpw puede degradar la precisión respecto al BF16 original; el autor no publica ninguna evaluación de la pérdida de calidad introducida por la cuantización.
- Limitaciones de contexto e idioma: aunque el contexto declarado es de 262.144 tokens, no se especifican los idiomas soportados ni el rendimiento en contextos largos reales.
- Licencia: Swift Open License v1.0 permite uso gratuito a individuos y organizaciones cuya facturación anual recurrente no supere 1.000.000 de dólares; por encima de esa cifra se necesita una Swift Enterprise License de UkisAI. No es una licencia Apache 2.0 pese a que los modelos Qwen3.8-27B y orcarouter sí lo sean.
- Integridad del repositorio: solo se publica la cuantización EXL3; no se incluye versión BF16 en este repositorio, y no se documenta el proceso de cuantización ni el software utilizado.
- Sin métricas de producción: no hay datos publicados de latencia, throughput, tasa de aceptación de la decodificación especulativa ni estabilidad en despliegues a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sam33339999/Swift-1.5-Qwen3.8-27b-Uncensored-exl3-3.5bpw
- Modelo base (sin cuantizar, abliterado): https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Modelo base original de UkisAI: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de referencia para la abliteración: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Cuantización GGUF (llama.cpp): https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Cuantización NVFP4 (vLLM, SGLang): https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-NVFP4
- Herramienta de evaluación de abliteración (Heretic): https://github.com/p-e-w/heretic
- Paper sobre ablación de la dirección de rechazo (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
