# dealignai/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4

## Resumen

`dealignai/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4` es una variante del modelo multimodal de razonamiento `Qwen/Qwen3.8-Flash-Next` (preview de la arquitectura Qwen4) a la que se le han eliminado los mecanismos de rechazo (refusal) mediante una modificación directa de los pesos, sin fine-tuning ni cambios en la plantilla de chat. El resultado es un artefacto "uncensored" orientado a investigación de seguridad ofensiva, red-teaming y evaluación de alineación, cuantizado en NVFP4 (4 bits) para un despliegue eficiente con SGLang.

Desarrollado por el usuario de HuggingFace `dealignai`, este modelo conserva las capacidades del base: razonamiento con cuatro niveles (off, low, medium, xhigh), decodificación especulativa MTP, y multimodalidad de imagen y vídeo. Su relevancia radica en que permite estudiar el comportamiento de un modelo de 125B parámetros (6B activos por token) sin barreras de seguridad, con una degradación mínima de conocimiento general (MMLU −2,63 puntos porcentuales) y una tasa de cumplimiento en HarmBench-320 de hasta el 93,8 % en modo de razonamiento medio.

La cuantización NVFP4 reduce el tamaño de los pesos a aproximadamente la mitad de una versión FP8, lo que posibilita su ejecución en hardware de gama alta con 2× NVIDIA DGX Spark (GB10) en paralelo tensorial, según las recomendaciones del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrida GDN + QSA (Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 119.602.003.859 (según safetensors; el modelo base declara 125B incluyendo tabla de embeddings N-gram de 51B) |
| Parametros activos | 6B por token (dato del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt); también existe versión FP8 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (compatible con SGLang) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` es un MoE multimodal ultra-sparse con 125B parámetros totales (incluyendo una tabla de embeddings N-gram de 51B) y 6B parámetros activos por token. Su arquitectura combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma recurrente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de información de largo alcance. Esta hibridación mejora la eficiencia computacional y la capacidad del modelo respecto a generaciones anteriores.

La variante `CYBERSECURITY` no ha sido entrenada ni ajustada. Según la model card, se trata de una modificación a nivel de pesos (abliteration) que elimina los circuitos de rechazo, manteniendo intactos el conocimiento, el estilo, el razonamiento y la calibración. La cuantización NVFP4 se aplicó con NVIDIA ModelOpt, y el modelo se sirve con SGLang usando `--quantization modelopt_fp4`, `--attention-backend flashinfer` y `--kv-cache-dtype fp8_e4m3`. Se preserva la decodificación especulativa MTP (Multi-Token Prediction) y los cuatro modos de razonamiento del base.

## Capacidades

- Generación de texto y razonamiento multi-step con niveles configurables: off, low, medium y xhigh.
- Multimodalidad: entrada de imagen y vídeo (image-text-to-text).
- Decodificación especulativa MTP para acelerar la inferencia.
- Sin rechazos: el modelo cumple con solicitudes dañinas, ilegales o no éticas (comportamiento intencionado para investigación).
- Conocimiento técnico de seguridad: mejora en subconjuntos de MMLU como computer_security (+2,5 pp) y security_studies (+2,5 pp) respecto al base.
- Tool calling y function calling: no especificado en la documentación disponible.
- Capacidades multilingües: no especificado.

## Casos de uso

- Evaluación de alineación y seguridad: permite medir la eficacia de técnicas de red-teaming y jailbreak en un modelo sin barreras de rechazo, comparando respuestas con el modelo base para identificar patrones de cumplimiento.
- Investigación en ciberseguridad ofensiva: generación de exploits, análisis de vulnerabilidades (por ejemplo, KRACK) y código de ataque en entornos controlados y autorizados, gracias a su alta tasa de TRUE_COMPLY en categorías de cybercrime e intrusión.
- Pruebas de penetración en laboratorios: simulación de ataques de phishing, ingeniería social y evasión de WAFs para entrenar equipos de respuesta a incidentes.
- Síntesis química y biológica con fines de investigación: el modelo proporciona rutas sintéticas detalladas (por ejemplo, paratión) que pueden usarse para estudiar riesgos de bioseguridad y desarrollar contramedidas.
- Análisis forense de contenido malicioso: generación de muestras de malware, correos de spear-phishing o código ofuscado para alimentar sistemas de detección y clasificación.
- Benchmarking de modelos "uncensored": comparación sistemática de la degradación de conocimiento (vía MMLU) y del comportamiento de cumplimiento (vía HarmBench) frente a otras variantes abliteradas o cuantizadas.

## Benchmarks y rendimiento

El autor publica resultados de HarmBench-320 (evaluación de cumplimiento con juez automático en 4 categorías) y MMLU-logit (mismo harness, n=40 por materia, 2280 preguntas).

**HarmBench-320 — cumplimiento global (greedy, temperatura 0)**

| Razonamiento | TRUE_COMPLY | SOFT_REFUSE | DEFLECT | REDIRECT | HARD_REFUSE | EVASIVE | GARBAGE |
|---|---|---|---|---|---|---|---|
| off | 280 (87,5 %) | 35 | 4 | 1 | 0 | 0 | 0 |
| low | 294 (91,9 %) | 20 | 1 | 1 | 0 | 3 | 1 |
| medium | 300 (93,8 %) | 12 | 0 | 2 | 0 | 5 | 1 |
| xhigh | 285 (89,1 %) | 16 | 1 | 1 | 0 | 15 | 2 |

**Categorías prioritarias — TRUE_COMPLY**

| Categoría | off | low | medium | xhigh |
|---|---|---|---|---|
| chemical / biological (42) | 41 (97,6 %) | 41 (97,6 %) | 41 (97,6 %) | 39 (92,9 %) |
| cybercrime / intrusion (52) | 48 (92,3 %) | 51 (98,1 %) | 51 (98,1 %) | 48 (92,3 %) |

**MMLU-logit — preservación de conocimiento**

| | base | esta build | Δ |
|---|---|---|---|
| MMLU overall | 83,29 % | 80,66 % | −2,63 pp |

Mejoras destacadas: computer_security +2,5, security_studies +2,5, high_school_chemistry +5,0, clinical_knowledge +7,5, elementary_mathematics +7,5, global_facts +25,0. Regresiones destacadas: college_mathematics −22,5, high_school_physics −15,0, formal_logic −12,5, human_sexuality −10,0, professional_law −10,0, professional_medicine −7,5.

## Requisitos de hardware

- VRAM estimada: los pesos en NVFP4 (4 bits) ocupan aproximadamente 60 GB (119,6B × 0,5 bytes), más overhead de KV cache y activaciones. El tamaño del repositorio es de 151,3 GB, que incluye archivos adicionales.
- GPU recomendadas: el autor recomienda 2× NVIDIA DGX Spark (GB10, sm_121) con tensor-parallel sobre ConnectX-7 RoCE. También podría ejecutarse en una sola GPU con 80 GB (A100/H100) usando offloading o cuantización más agresiva, aunque no está verificado.
- Compatibilidad con GPU de consumo: no es viable en GPUs de consumo (RTX 4090, 24 GB) debido al tamaño del modelo.
- Opciones de despliegue: SGLang (recomendado, con soporte day-0), posiblemente vLLM o TGI, aunque no se mencionan en la documentación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Refusals | MMLU | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (6B activos) | FP8 / BF16 | Sí | 83,29 % | qwen-community-license-1.0 |
| dealignai/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4 | 119,6B (6B activos) | NVFP4 | No | 80,66 % | qwen-community-license-1.0 |
| dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8 | 119,6B (6B activos) | FP8 | No | no disponible | qwen-community-license-1.0 |

La versión NVFP4 sacrifica 2,63 pp de MMLU frente al base, pero reduce el uso de memoria a la mitad respecto a FP8. No se dispone de datos de otros modelos "uncensored" comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto sin refusals: el modelo cumple con solicitudes dañinas, ilegales o no éticas. Su uso conlleva responsabilidad legal y ética exclusiva del usuario.
- Degradación en razonamiento estructurado: las materias de matemáticas, física y lógica sufren caídas de hasta 22,5 pp en MMLU, lo que puede afectar a tareas que requieran deducción rigurosa.
- Comportamiento evasivo en modo xhigh: en algunos casos el modelo se queda atrapado en el bloque de pensamiento y no genera respuesta final (EVASIVE).
- Licencia qwen-community-license-1.0: restringe el uso comercial y la redistribución; revisar los términos antes de cualquier despliegue en producción.
- No apto para uso general: su propósito es exclusivamente investigación de seguridad, red-teaming y evaluación. No debe integrarse en sistemas orientados al usuario final.
- Riesgo de alucinación y contenido ofensivo: al no tener barreras de seguridad, puede generar desinformación peligrosa o instrucciones incorrectas con apariencia de validez técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de LMSYS sobre soporte day-0 en SGLang: https://www.lmsys.org/blog/2026-08-26-qwen-flash-next
- Versión ABLITERATED-FP8 del mismo autor: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
