# jackmaxwil/DeepSeek-V4.1-Flash-REAP-50

## Resumen

DeepSeek-V4.1-Flash-REAP-50 es un checkpoint derivado del modelo multimodal DeepSeek-V4.1-Flash-1017 (763B parámetros) al que se le ha aplicado una poda del 50% de los expertos enrutados en cada capa MoE mediante la técnica REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999). El resultado conserva 192 de los 384 expertos enrutados por capa, mantiene `num_experts_per_tok` en 6 y deja intactos el experto compartido, la atención, los embeddings y el resto de pesos. No hubo reentrenamiento posterior a la poda. Lo publica el usuario independiente jackmaxwil, sin afiliación con DeepSeek, y se distribuye bajo licencia MIT heredada del modelo base.

El checkpoint resultante declara 491.375.079.634 parámetros totales según los safetensors del repositorio (365,8 GB en FP4 para los pesos de experto), frente a los 763B del modelo base. La poda se calibró sobre 2.946.031 tokens de inglés y código, con sesgo hacia flujos agénticos de programación, terminal y uso de herramientas, y sin texto en chino. Esto convierte al modelo en una alternativa más ligera para despliegues de generación de texto y código, pero con degradación esperable fuera del dominio de calibración.

Su relevancia es doble: por un lado, demuestra una metodología reproducible de poda de MoE con estadísticas y listas de supervivientes publicadas; por otro, advierte explícitamente de que el checkpoint exportado solo ha sido verificado por checksum, no ejecutado de extremo a extremo para generación, y de que la ruta de visión no se ha tocado ni probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia DeepSeek V4.1), derivado por poda de expertos enrutados |
| Parametros totales | 491.375.079.634 |
| Parametros activos | no disponible (el modelo base enruta 6 expertos por token; el dato exacto de activos no se proporciona) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de experto en FP4 (formato del modelo base); tag `8-bit`/`fp8` en el repo; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible oficialmente; calibrado solo en inglés y código, sin chino |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos (MoE) dispersa. Cada capa MoE del base contiene 384 expertos enrutados más un experto compartido, con 6 expertos activados por token. La poda REAP puntúa cada experto como el producto del peso de su puerta de enrutamiento por la norma de su salida, promediado sobre los tokens enrutados a él, y conserva los 192 mejores por capa. El router (peso y sesgo) se recorta a los expertos supervivientes, que se renumeran de 0 a 191 en su orden original. Los pesos de experto mantienen el formato FP4 del base. No hay fine-tuning posterior a la poda.

La calibración usó 2.946.031 tokens (24 sesiones de hasta 16.384 tokens) de fuentes como nvidia/Open-SWE-Traces, nebius/SWE-rebench-V2-PRs, nvidia/Nemotron-Terminal-Corpus, Agent-Ark/Toucan-1.5M, CIRCL/vulnerability-scores, common-pile/stackexchange_filtered, HuggingFaceFW/finepdfs, corbt/enron-emails, allenai/WildChat-4.8M y HuggingFaceFW/finewiki. La evaluación se hizo enmascarando los expertos podados dentro del modelo completo (equivalente matemático al checkpoint), no ejecutando el checkpoint exportado. El repositorio incluye `keep-prune.json` con el índice de origen y hashes de las listas de supervivientes, y `SHA256SUMS` para todos los ficheros.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base.
- Generación de código y comprensión de diffs (dominio con mejor retención: 0,939 de acuerdo top-1 en code-diffs).
- Uso de herramientas y flujos agénticos (tool-use, bash, terminal), aunque con mayor degradación relativa.
- Razonamiento multi-paso y agentes de codificación (dominio prioritario en calibración).
- Capacidades multilingües: no verificadas; el chino no se usó en calibración y se espera degradación específica.
- Ruta de visión: presente en el modelo base pero no tocada ni probada en este checkpoint.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Asistencia de código en producción: el modelo conserva alta fidelidad en diffs y parches (acuerdo top-1 de 0,939 en code-diffs), por lo que puede integrarse en pipelines de revisión y generación de cambios con menor huella que el base.
- Automatización de terminal y shell: con 0,921 de acuerdo top-1 en bash, es adecuado para agentes que generan comandos y scripts de operación.
- Agentes de programación multi-paso: pensado para flujos tipo SWE-bench, donde el modelo planifica, edita y ejecuta herramientas; útil en entornos de CI/CD con orquestación externa.
- Procesamiento de correo empresarial: el dominio business-email mantiene 0,791 de acuerdo top-1, suficiente para resumen y redacción asistida en inglés.
- Análisis de redes y ciberseguridad: networking (0,896) y cyber (0,828) muestran retención razonable para triaje de alertas y explicación de configuraciones.
- Chat técnico en inglés: english-chat con 0,773 de acuerdo top-1 permite desplegar asistentes conversacionales de dominio técnico donde el contexto sea mayoritariamente inglés.
- Sustitución del modelo base en entornos con VRAM limitada: al reducir parámetros totales de 763B a ~491B, facilita el despliegue en clústeres más pequeños, aceptando la degradación documentada.

## Benchmarks y rendimiento

Los datos disponibles son de fidelidad frente al modelo completo (profesor), no benchmarks estándar como MMLU o HumanEval.

| Dominio | Posiciones evaluadas | Acuerdo top-1 | KL(profesor ‖ podado) | Cambio NLL (nats) |
|---|---:|---:|---:|---:|
| all | 437.350 | 0,803 | 0,810 | -0,138 |
| agentic-python | 63.310 | 0,718 | 1,331 | -0,358 |
| agentic-rust | 49.149 | 0,697 | 1,414 | -0,404 |
| bash | 50.094 | 0,921 | 0,270 | -0,155 |
| business | 32.823 | 0,839 | 0,259 | +0,138 |
| business-email | 15.382 | 0,791 | 0,546 | +0,313 |
| code-diffs | 64.558 | 0,939 | 0,107 | +0,062 |
| cyber | 30.806 | 0,828 | 0,582 | +0,360 |
| english-chat | 15.439 | 0,773 | 0,366 | +0,076 |
| english-prose | 18.873 | 0,834 | 0,550 | +0,354 |
| networking | 32.674 | 0,896 | 0,156 | +0,087 |
| tool-use | 64.242 | 0,662 | 1,931 | -0,707 |

Comparativa entre variantes de poda evaluadas en la misma ejecución:

| Variante | Expertos conservados | Acuerdo top-1 | KL | Cambio NLL |
|---|---:|---:|---:|---:|
| REAP-33 (no publicada) | 256 / 384 | 0,842 | 0,511 | +0,025 |
| REAP-50 | 192 / 384 | 0,803 | 0,810 | -0,138 |
| REAP-67 (no publicada) | 128 / 384 | 0,755 | 1,114 | -0,109 |
| REAP-75 | 96 / 384 | 0,720 | 1,349 | -0,131 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 365,8 GB en FP4; en FP8 el peso sería aproximadamente el doble (~730 GB) y en BF16 aproximadamente el cuádruple (~980 GB). No se documentan cifras oficiales de inferencia.
- GPU recomendadas: para FP4 se requiere un nodo multi-GPU de clase H100/H200 o B200; para FP8, al menos 8×H100 80 GB o equivalente. No cabe en GPU de consumo.
- GPU de consumo: no viable en RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta.
- Despliegue: transformers (librería declarada), con compatibilidad de endpoints; el autor indica ejecutarlo exactamente como el modelo base (carpeta `inference/`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Expertos por capa | Contexto | Licencia | Estado |
|---|---:|---:|---|---|---|
| DeepSeek-V4.1-Flash-REAP-50 | ~491B | 192 / 384 | no disponible | MIT | Publicado |
| DeepSeek-V4.1-Flash-1017 (base) | 763B | 384 / 384 | no disponible | MIT | Publicado |
| DeepSeek-V4.1-Flash-REAP-75 | no disponible | 96 / 384 | no disponible | MIT | Publicado |
| REAP-33 / REAP-67 | no disponibles | 256 / 384 y 128 / 384 | no disponible | MIT | No publicadas |

La comparativa con modelos de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint exportado solo ha sido verificado por checksum; no se ha ejecutado de extremo a extremo para generación, según el propio autor.
- No hay fine-tuning posterior a la poda: la degradación esperada es mayor fuera del mix de calibración.
- El chino no se usó en calibración y se anticipa degradación específica en ese idioma.
- La ruta de visión está intacta pero no se ha probado; no debe asumirse su correcto funcionamiento.
- Los cambios negativos de NLL en dominios agénticos no indican mejora del modelo, sino desviación respecto a la distribución del profesor.
- Riesgo de alucinación: no cuantificado en la información disponible; heredado del modelo base y potencialmente agravado por la poda.
- Sesgos: no documentados; la calibración se limita a inglés y código, lo que puede sesgar el comportamiento hacia esos dominios.
- Licencia MIT permite uso comercial, pero el autor no está afiliado a DeepSeek y no ofrece garantías sobre el checkpoint derivado.
- El tag `8-bit`/`fp8` del repositorio convive con pesos de experto en FP4; conviene verificar el formato real antes de desplegar.

## Enlaces

- Checkpoint: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-50
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base (variante general): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Variante hermana REAP-75: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-75
- Estadísticas y datos de evaluación: https://huggingface.co/datasets/jackmaxwil/DeepSeek-V4.1-Flash-REAP-stats
- Paper REAP: https://arxiv.org/abs/2510.13999
