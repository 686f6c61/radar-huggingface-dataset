# Jeesup/svd-safety-l2_dualk_jbb_dual_tok_r40

## Resumen

`svd-safety-l2_dualk_jbb_dual_tok_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en HuggingFace. No es un modelo conversacional de propósito general, sino un artefacto experimental concebido para estudiar cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes permite repararlo mejor. El modelo conserva el 59,98 % de los parámetros densos del original (se elimina un 40,00 %), lo que se traduce en 6.738.415.616 parámetros totales según los pesos en safetensors.

La compresión se realiza mediante SVD blanqueado con K-FAC en dos dominios (utilidad y seguridad) y un presupuesto de rango heredado de SVD-LLM. Posteriormente se aplica una recuperación con LoRA en dos etapas (U y V secuenciales) sobre `alpaca-cleaned`. El resultado es una de las celdas de una rejilla experimental sobre reglas de selección y presupuestos de compresión, con semilla 42.

Su relevancia es metodológica: proporciona métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro con WildGuard y perplejidad en WikiText-2, lo que permite cuantificar el compromiso entre utilidad y seguridad bajo compresión. El autor advierte explícitamente de que varias ramas de la rejilla están deliberadamente degradadas en seguridad y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD blanqueado K-FAC dual y recuperado con LoRA |
| Parametros totales | 6.738.415.616 (59,98 % del denso original; 40,00 % eliminado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros. Sobre esa base se aplica una compresión SVD con matriz de blanqueado K-FAC en dos dominios: una curvatura de utilidad y una curvatura de seguridad. El objetivo resuelto es `F_dual = (1-a) G_u (x) A_u + a G_s (x) A_s`, con un peso de seguridad `a = 0,0485` (`--alpha tok`). La normalización de curvatura es `tok`: `A` dividido por posiciones y `G` dividido por tokens de pérdida (entropía cruzada sumada), por dominio. El presupuesto de rango por matriz se toma del de SVD-LLM al mismo ratio de eliminación, y la resolución se realiza con ALS sobre base conjunta, partiendo de la solución mezcla, hasta 300 barridos, `rtol 1e-07` y `ridge 1e-06`.

La calibración de utilidad usa `wikitext-2-raw-v1` train con el muestreador de SVD-LLM: 255 ventanas de 2048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token. La calibración de seguridad usa `jbb_harm_resp:13` (13 muestras, pérdida en todas las posiciones). Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y matemáticas básicas: no se documentan evaluaciones específicas en la model card.
- Generación de código: no se documentan evaluaciones específicas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.
- Valor analítico: sirve como sujeto de medición de seguridad bajo compresión, con métricas ASR y sobre-rechazo publicadas.

## Casos de uso

- Estudio de robustez frente a jailbreaks bajo compresión: el checkpoint permite medir ASR en AdvBench (0,0096) y StrongREJECT (0,0351) con juez HarmBench y comparar con otras celdas de la rejilla para aislar el efecto de la regla de selección de componentes.
- Investigación sobre sobre-rechazo: la métrica de sobre-rechazo macro con WildGuard (0,4390) permite analizar el coste en utilidad conversacional que impone la recuperación orientada a seguridad.
- Evaluación de pipelines de compresión SVD: sirve como referencia reproducible (semilla 42, hiperparámetros documentados) para validar implementaciones de SVD-LLM con K-FAC dual y ALS.
- Análisis de compromiso utilidad-seguridad: la perplejidad en WikiText-2 (9,9143) junto con las métricas de seguridad permite trazar curvas de Pareto entre calidad lingüística y resistencia a ataques.
- Reproducción de experimentos académicos: al estar construido sobre Llama-2-7b-chat con licencia Llama 2, encaja en entornos de laboratorio que ya operan con esa familia y necesitan artefactos intermedios de compresión.
- Docencia y formación en interpretabilidad: el modelo ilustra de forma concreta cómo la eliminación de un 40 % de parámetros afecta a comportamientos de seguridad, útil en cursos de compresión de modelos.
- Auditoría de licencias y trazabilidad: los archivos `LICENSE.txt` y `USE_POLICY.md` incluidos permiten estudiar el cumplimiento de la Llama 2 Community License en modelos derivados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0096 |
| StrongREJECT ASR (juez HarmBench) | 0,0351 |
| Sobre-rechazo macro (WildGuard) | 0,4390 |
| Perplejidad WikiText-2 | 9,9143 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5 GB, aunque el repositorio no publica variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con contexto largo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requiere cuantización o contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI más allá del tag.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_jbb_dual_tok_r40 | 6.738.415.616 (59,98 % del denso) | no disponible | Llama 2 Community | Artefacto de investigación con métricas de seguridad publicadas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | no disponible | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Reglas de selección y ratios de eliminación distintos; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- Riesgo de alucinación: no cuantificado en la model card; la perplejidad en WikiText-2 (9,9143) no sustituye una evaluación de factualidad.
- Sesgos conocidos: no documentados específicamente; hereda los de Llama-2-7b-chat y los de `alpaca-cleaned` usado en la recuperación LoRA.
- Limitaciones de contexto e idioma: no declaradas; la model card no especifica idiomas soportados ni longitud de contexto efectiva tras la compresión.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial está sujeto a esas condiciones y a las obligaciones de atribución de "Built with Llama 2".
- Caveat para producción: el sobre-rechazo macro de 0,4390 indica una tasa elevada de rechazos en consultas benignas, lo que degrada la experiencia conversacional.
- Reproducibilidad: los resultados dependen de la semilla 42, del calibrador `jbb_harm_resp:13` (solo 13 muestras) y de los hiperparámetros documentados; desviaciones en estos pueden alterar las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbb_dual_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
