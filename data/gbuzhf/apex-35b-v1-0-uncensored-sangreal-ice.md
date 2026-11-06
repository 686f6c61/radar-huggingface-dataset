# gbuzhf/Apex-35B-V1.0-Uncensored-Sangreal-ICE

## Resumen

Apex-35B-V1.0-Uncensored-Sangreal-ICE es una colección de cuantizaciones GGUF del modelo multimodal Apex-35B-V1.0 de Apex Intelligence, publicada por el usuario gbuzhf en Hugging Face. El modelo base es un MoE de 35,5 mil millones de parámetros totales (aproximadamente 3B activos) basado en la arquitectura Qwen3.6-35B-A3B, con capacidades de visión (image-text-to-text). La particularidad de esta versión es que es "abliterated": se ha eliminado la dirección de rechazo (refusal direction) del modelo original, de modo que responde a peticiones que el modelo original declinaría.

La cuantización se ha realizado con la receta ICE 2.0 del autor, que incluye una matriz de importancia Sangreal de 10k muestras, recetas por tensor ICE 1.6 y una reparación post-cuantización de expertos (expert repair). Cada archivo conserva la capa MTP (Multi-Token Prediction) para decodificación especulativa, así como el proyector de visión distribuido por separado y la plantilla de chat Arrow 4.0-apex.

Es relevante para desarrolladores que buscan un modelo MoE grande con pocos parámetros activos (inferencia rápida), capacidades multimodales y sin filtros de rechazo, ejecutable localmente vía llama.cpp en una gama amplia de hardware gracias a los cinco niveles de cuantización ICE disponibles (desde 12 GB hasta BF16 completo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-35B-A3B (qwen35moe): 40 capas, 256 expertos enrutados (8 activos) + experto compartido, atención híbrida Gated DeltaNet / completa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (MoE: 8 expertos enrutados + experto compartido de 256) |
| Longitud de contexto | 65536 tokens (presupuesto de salida por respuesta, thinking incluido; contexto de inferencia recomendado en los ejemplos) |
| Tipos de cuantizacion | ICE 2.0: IQ2_XS (12G), IQ3_XXS + IQ2_S (15G), IQ4_XS + IQ3_S (19G), Q4_K + Q5_K (23G), Q5_K + Q4_K (25G); además Q8_0 y BF16. Proyector de visión en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base, Apex-35B-V1.0, es un MoE con arquitectura Qwen3.6-35B-A3B: 40 capas, 256 expertos enrutados de los cuales 8 se activan por token, más un experto compartido, con aproximadamente 3B de parámetros activos. Emplea atención híbrida que combina Gated DeltaNet (capas de recurrencia lineal) con atención completa, lo que reduce el coste computacional manteniendo capacidad de contexto largo. Incluye una cabeza MTP (`nextn_predict_layers = 1`) que actúa como modelo borrador para decodificación especulativa de profundidad 1, y un proyector de visión (mmproj) que habilita la entrada de imágenes.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la documentación disponible. En cuanto a esta derivada: la abliteración se aplicó proyectando una única dirección de rechazo fuera de los escritores del residual stream en los bloques 11 a 28, con escala 1.3 (dirección tomada de la abliteración Ornith-1.5 de huihui-ai); el resto de pesos son byte a byte los del original. La cuantización ICE 2.0 usa una matriz de importancia Sangreal de 10.000 muestras y recetas por tensor, con reparación post-cuantización de expertos.

## Capacidades

- Generación de texto conversacional (pipeline conversational), con plantilla de chat Arrow 4.0-apex embebida y apertura `<think>` del modelo original (modo de razonamiento).
- Visión: entrada de imágenes mediante el proyector mmproj (image-text-to-text), distribuido en F16 o Q8_0.
- Generación y comprensión de codigo (los niveles de fidelidad ICE se evalúan sobre corpus de código, indicando capacidad en esta área).
- Decodificación especulativa vía cabeza MTP integrada en cada archivo GGUF (profundidad de borrador 1) en builds de llama.cpp con soporte MTP.
- Contexto largo: hasta 65536 tokens de presupuesto de salida por respuesta.
- Sin rechazos: el modelo responde a peticiones que el original declinaría (abliterated/uncensored).
- Alternativa flexible: la abliteración también se distribuye como LoRA de rango 1 aplicable a cualquier GGUF original de Apex-35B-V1.0.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Chatbots locales sin filtros para investigación: permite estudiar el comportamiento de un modelo sin capas de alineación, útil en auditorías de seguridad y red-teaming, con la responsabilidad de uso recayendo en el usuario.
- Inferencia multimodal en consumer GPU: con el nivel 12G-ICEv2 (11,90 GB sin MTP) cabe en una RTX 4090 de 24 GB junto al proyector de visión, habilitando descripción de imágenes y VQA local.
- Generación de codigo con alta fidelidad: los niveles 23G y 25G-ICEv2 mantienen coincidencia top-1 del 95-96 % en corpus de código, adecuados para asistentes de programación locales.
- Procesamiento de documentos largos: la atención híbrida Gated DeltaNet y el presupuesto de 65.536 tokens permiten resumir y analizar documentos extensos.
- Despliegue con latencia reducida: los ~3B de parámetros activos por token y la decodificación especulativa MTP hacen viable servir el modelo en hardware modesto para su tamaño total.
- Experimentación con cuantización agresiva: los cinco niveles ICE con métricas KLD publicadas sirven como referencia para evaluar el impacto de la cuantización en MoE.
- Uso del LoRA sobre el modelo original: permite aplicar la abliteración de forma reversible (escala ajustable) a cualquier GGUF de Apex-35B-V1.0 sin redistribuir los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card sí publica métricas de fidelidad de cuantización (KLD contra el máster BF16 abliterated):

| Tier | Tamaño (sin MTP) | KLD wiki 2K | KLD code 2K | KLD code 16K | Coincidencia top-1 (wiki / code / code 16K) | Score |
|---|---|---|---|---|---|---|
| 25G-ICEv2 | 24,53 GB | 0,0624 | 0,0279 | 0,0867 | 91,5 % / 96,3 % / 94,9 % | 94,4 |
| 23G-ICEv2 | 22,52 GB | 0,0798 | 0,0384 | 0,0989 | 90,3 % / 95,5 % / 94,2 % | 93,3 |
| 19G-ICEv2 | 18,47 GB | 0,1325 | 0,0684 | 0,1478 | 87,5 % / 94,2 % / 92,6 % | 90,2 |
| 15G-ICEv2 | 14,51 GB | 0,3062 | 0,1761 | 0,2962 | 81,7 % / 90,4 % / 89,1 % | 81,8 |
| 12G-ICEv2 | 11,90 GB | 0,5254 | 0,2916 | 0,4683 | 76,5 % / 87,9 % / 86,5 % | 74,3 |

Score: BF16 = 100; 70 % fidelidad de distribución completa `1/(1+KLD)` + 30 % coincidencia top-1, promediado sobre los tres conjuntos. El autor advierte que Apex-35B-V1.0 es inusualmente sensible al redondeo: incluso un Q8_0 del modelo original sin abliterar está a ~0,015 KLD del BF16 en código.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache ni mmproj):
  - 12G-ICEv2: ~11,9 GB — cabe en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080) y con holgura en una 4090 de 24 GB junto al proyector de visión.
  - 15G-ICEv2: ~14,5 GB — cabe en GPUs de 16-24 GB.
  - 19G-ICEv2: ~18,5 GB — requiere GPU de 24 GB (RTX 3090/4090) o reparto CPU/GPU.
  - 23G-ICEv2: ~22,5 GB — RTX 3090/4090 de 24 GB, justo.
  - 25G-ICEv2: ~24,5 GB — 24 GB con contexto reducido, o GPUs de 32+ GB.
  - Q8_0: ~37,8 GB — requiere A100 40GB, 2x RTX 3090 o similar.
  - BF16: ~71 GB en dos archivos — requiere A100 80GB, H100 o multi-GPU.
- GPU recomendadas: RTX 4090 (niveles 12G-25G), RTX 3090, A100/H100 para Q8_0 y BF16; también viable en Apple Silicon con suficiente memoria unificada (no confirmado por el autor).
- Ejemplo de despliegue documentado: `llama-server` con `--mmproj`, `--jinja`, `-c 65536` y `-fa on`. Opciones: llama.cpp (recomendado, con soporte MTP opcional); no se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles como cifras; los ~3B de parámetros activos y la cabeza MTP (borrador de profundidad 1) están orientados a reducir la latencia de generación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Apex-35B-V1.0 (base) | 35,5B | ~3B (MoE) | 65536 (salida) | Sí (mmproj) | Apache-2.0 | GGUF oficial BF16 + esta derivada |
| Qwen3-30B-A3B | 30B | ~3B (MoE) | 32k-128k según versión | No (salvo variantes VL) | Apache-2.0 | Amplia (GGUF, vLLM, etc.) |
| Qwen3-VL-30B-A3B | 30B | ~3B (MoE) | hasta 256k | Sí | Apache-2.0 | GGUF y ecosistema oficial |

Nota: la comparación se establece con la familia Qwen3 de tamaño y activos similares, dado que la arquitectura del modelo es Qwen3.6-35B-A3B. Datos de rendimiento comparativo entre ellos: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin filtros: la abliteración elimina los rechazos del modelo original. El usuario es responsable del uso; no es adecuado para entornos de producción orientados a público general sin controles externos.
- Riesgo de alucinacion: no cuantificado por el autor; al tratarse de un modelo abliterated, la supresión de rechazos puede aumentar respuestas a peticiones dañinas o incorrectas.
- Sensibilidad a la cuantización: el propio modelo base es inusualmente sensible al redondeo (Q8_0 ya introduce ~0,015 KLD en código); los niveles bajos (12G, 15G) degradan notablemente la fidelidad (score 74,3 y 81,8).
- La abliteración solo proyecta la dirección de rechazo en los bloques 11-28 a escala 1,3; no garantiza la ausencia total de rechazos ni modifica otros comportamientos de alineación.
- Idiomas soportados, datos de entrenamiento y capacidades de tool calling: no disponibles en la documentación.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales significativas, pero el modelo base procede de Qwen3.6 y las condiciones de los datos de entrenamiento original no están documentadas.
- El ejemplo de uso del LoRA advierte de un detalle técnico: en Windows, una letra de unidad en la ruta rompe el parsing de `FILE:SCALE`.
- La plantilla de chat Arrow 4.0-apex está embebida; usarla con otras plantillas puede degradar el comportamiento.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/gbuzhf/Apex-35B-V1.0-Uncensored-Sangreal-ICE
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- GGUF oficial BF16 del modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0-GGUF
- Abliteración de referencia (dirección de rechazo): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Paper, demo y repositorio de código: no disponibles en la informacion proporcionada.
