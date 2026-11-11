# Jeesup/svd-safety-l2_kfacmixsep0_r40

## Resumen

`svd-safety-l2_kfacmixsep0_r40` es un checkpoint de Llama-2-7b-chat comprimido mediante SVD blanqueado con K-FAC agrupado (K-FAC whitened SVD), que combina calibración de utilidad y de seguridad en una única matriz de Fisher. El autor, Jeesup, lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes lo repara mejor. El checkpoint retiene el 60,0 % de los parámetros densos originales (40,00 % eliminados) y se recupera después con la etapa 2 de LoRA de SVD-LLM.

No es un modelo de chat de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión. En esta celda, la parte de seguridad del K-FAC tiene peso efectivo cero (a = 0), por lo que la calibración es puramente K-FAC sobre WikiText-2, sin componente de seguridad. El interés radica en que cuantifica el coste en seguridad de la compresión y sirve de referencia para comparar estrategias de reparación.

El modelo base es `meta-llama/Llama-2-7b-chat-hf`, un transformer denso de 7B parámetros con 4K tokens de contexto, y la licencia resultante es la Llama 2 Community License. El repositorio ocupa 13,5 GB y contiene pesos en safetensors compatibles con `transformers` y text-generation-inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama-2-7b-chat), comprimido por SVD |
| Parámetros totales | 6.738.415.616 (≈6,74B; 60,0 % del denso original) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer denso decoder-only de Llama-2-7b-chat. Sobre él se aplica una compresión SVD con blanqueado K-FAC: se estima una matriz de Fisher aproximada de la forma F = A ⊗ G sobre un único conjunto de calibración agrupado (`run_safety_fisher.py`, lam = 0), y se usa para blanquear las matrices antes de la descomposición. El presupuesto de rango por matriz sigue el esquema de SVD-LLM, con un objetivo de retención del 59,98 % de parámetros (40,00 % eliminados).

La calibración se realiza sobre `wikitext2:256`. La parte de utilidad emplea WikiText-2 de entrenamiento con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; la pérdida G usa suma de tokens (G a partir del NLL sumado dividido por 2047, de modo que todos los tokens de pérdida pesan igual). La parte de seguridad no se incluye: el peso efectivo de seguridad es 0. Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-2-7b-chat.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de contexto del modelo base.
- Generación de código y matemáticas básicas, con la calidad degradada esperable tras eliminar el 40 % de los parámetros.
- No se documenta soporte específico de tool calling ni de function calling en la información proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Su función real es servir como sujeto experimental para medir el impacto de la compresión SVD en seguridad y utilidad.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para comparar reglas de selección de componentes SVD frente a otras celdas de la misma rejilla, midiendo ASR y perplejidad con protocolos fijos.
- Evaluación de degradación de seguridad: permite cuantificar cuánto sube la tasa de éxito de ataques (AdvBench ASR 0,2904; StrongREJECT ASR 0,2684) al eliminar el 40 % de parámetros sin calibración de seguridad.
- Estudio de sobre-rechazo: con un macro over-refusal de 0,0871 medido con WildGuard, es útil para analizar el equilibrio entre rechazo excesivo y vulnerabilidad tras la compresión.
- Reproducción de pipelines SVD-LLM: el checkpoint documenta semilla, calibración, hiperparámetros de LoRA y presupuesto de rango, lo que permite reproducir la etapa 2 y validar la implementación de K-FAC blanqueado.
- Benchmarking de perplejidad: con WikiText-2 perplexity de 9,9603, sirve como punto de comparación para medir la pérdida de calidad lingüística de otras técnicas de compresión sobre Llama-2-7b-chat.
- Análisis de eficiencia en despliegue: al reducir los parámetros a 6,74B, permite estudiar el ahorro de VRAM y el impacto en latencia frente al modelo denso en entornos controlados de investigación.
- Docencia y experimentación académica: adecuado para prácticas sobre interpretabilidad y compresión, siempre que se trate como artefacto de laboratorio y no como asistente desplegable.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2904 |
| StrongREJECT ASR (juez HarmBench) | 0,2684 |
| Macro over-refusal (WildGuard) | 0,0871 |
| Perplejidad WikiText-2 | 9,9603 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4873 |

No se han publicado en la información disponible resultados comparativos frente a otras celdas de la rejilla ni frente al modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos; en 4 bits, alrededor de 4 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar; RTX 3090/4080 (16-24 GB) para bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: `transformers`, text-generation-inference (el repo incluye la etiqueta `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep0_r40 | 6,74B (60,0 % del denso) | no disponible (base 4.096) | Llama 2 Community | Checkpoint de investigación comprimido por SVD; ASR AdvBench 0,2904, ppl WikiText-2 9,9603 |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4.096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del autor | ≈6,74B | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; datos no disponibles en esta ficha |
| SVD-LLM sobre Llama-2-7b | variable según presupuesto | 4.096 | Llama 2 Community | Método de compresión de referencia del que se toma la etapa 2 de LoRA |

No se dispone de datos publicados de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor advierte que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada: varias celdas de la rejilla están deliberadamente degradadas en seguridad; en esta celda la parte de seguridad del K-FAC tiene peso 0, y la compresión por sí sola eleva la tasa de éxito de ataques (AdvBench ASR 0,2904).
- Riesgo de alucinación: la eliminación del 40 % de parámetros y la recuperación limitada con LoRA (r=8, 2 épocas) pueden aumentar la generación de contenido incorrecto; no se documenta una evaluación específica de factualidad.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; hereda los del modelo base Llama-2-7b-chat.
- Limitaciones de idioma y contexto: no se especifican idiomas soportados ni longitud de contexto propia; se asume la del modelo base.
- Restricciones de licencia: sujeto a la Llama 2 Community License; `LICENSE.txt` y `USE_POLICY.md` están incluidos en el repositorio y vinculan cualquier uso derivado, incluido el comercial dentro de los términos de dicha licencia.
- Ausencia de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que limita el despliegue en entornos de bajo consumo sin conversión manual.
- Sin datos de despliegue en producción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep0_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- SVD-LLM (método de compresión y etapa 2 de LoRA): no disponible en la información proporcionada
- Paper de Llama 2: no disponible en la información proporcionada
- Repositorio del autor o demos: no disponible en la información proporcionada
