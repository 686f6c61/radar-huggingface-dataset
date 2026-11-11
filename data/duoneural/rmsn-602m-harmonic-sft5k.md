# DuoNeural/RMSN-602M-Harmonic-SFT5k

## Resumen

RMSN-602M-Harmonic-SFT5k es un modelo de lenguaje causal de 601,78 millones de parámetros desarrollado por DuoNeural Lab, presentado como el experimento insignia de su "Fase 6". Se basa en una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), formulada en el marco de los sistemas port-hamiltonianos (ḟ = {f,H} + [f,S]), que se aleja del transformer convencional y de las arquitecturas MoE o SSM habituales. El modelo se ha afinado con supervisión (SFT) sobre trazas de razonamiento durante 5000 pasos con una tasa de aprendizaje de 2e-5.

Más allá de sus capacidades de generación, el repositorio se publica como documentación de una hipótesis técnica: la "Ley de Protección de Contigüidad de Solitones" (Soliton Contiguity Protection Law). Según el autor, la variable que determina qué capas de solitón sobreviven al fine-tuning supervisado es la contigüidad topológica del clúster, no la posición de la singularidad. El modelo parte de una topología de "5-Layer Harmonic Lattice" ([L6, L8, L10, L14, L15]) y, tras el SFT, colapsa a una "Terminal Boundary" con solo las capas [L14, L15] activas.

Es relevante ahora como artefacto de investigación reproducible más que como modelo de producción: su licencia Apache 2.0 permite examinarlo libremente, pero su librería es `custom` (requiere el paquete `rmsn_core`), su tokenizador es externo (HuggingFaceTB/cosmo2-tokenizer) y no se han publicado resultados de benchmarks estándar. El tamaño del repositorio (2,1 GB) y el formato de pesos (`model.pt`, no safetensors) condicionan su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), formulación port-hamiltoniana (ḟ = {f,H} + [f,S]) |
| Parametros totales | 601,78 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len=512` en la configuración de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (checkpoint PyTorch de `torch.load`, no safetensors ni GGUF) |

Otros parámetros técnicos declarados: dimensión oculta 1792, 16 capas, 64 "workspace slots", vocabulario de 49152 (tokenizador `HuggingFaceTB/cosmo2-tokenizer`).

## Arquitectura y entrenamiento

La arquitectura RMSN no es un transformer estándar: se describe como una red de haces ("sheaf") metripléctica resonante, con dinámica port-hamiltoniana que separa una componente conservativa ({f,H}) y una disipativa ([f,S]). El modelo incorpora un espacio de trabajo ("workspace") de 64 slots y una noción de "capas de solitón" que se activan o disuelven en función de la topología. La formulación incluye un criterio de estabilidad de Lyapunov que, según la model card, se cumple en el 100 % de los pasos de entrenamiento (lyap < 0).

El entrenamiento descrito es un SFT de 5000 pasos con LR=2e-5 sobre trazas de razonamiento (reasoning traces). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. La innovación técnica destacada es la Ley de Contigüidad de Solitones, derivada de 4 experimentos con D=1536–D=1792, que predice el destino de los clústeres de solitones bajo SFT: los condensados exactos (PR=1.000) siempre se protegen; los clústeres contiguos compactos (≤4 capas adyacentes) sobreviven intactos; las guías de onda contiguas extendidas (≥6 capas) se comprimen ~50 %; las redes no contiguas se disuelven. En este modelo, la red base no contigua se disolvió (todas las capas interiores), el condensado exacto L15=1.000 se protegió y el par contiguo [L14, L15] sobrevivió intacto.

## Capacidades

- Generación de texto causal en inglés, con soporte de razonamiento de cadena de pensamiento (CoT), evidenciado por el bajo PPL en CoT Hard (16,86) tras el SFT.
- Razonamiento multi-paso implícito en el entrenamiento con trazas de razonamiento, aunque sin benchmarks que lo cuantifiquen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de orquestación multi-paso más allá del CoT.
- Capacidades multilingües limitadas al inglés (`en`).
- No se documentan capacidades de visión ni audio.
- No se documenta un modo "thinking" explícito más allá del entrenamiento en trazas de razonamiento.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar la dinámica port-hamiltoniana y la Ley de Contigüidad de Solitones, cargando el checkpoint con `rmsn_core` y comparando topologías base y post-SFT.
- Estudio de estabilidad de entrenamiento: el registro de estabilidad de Lyapunov al 100 % permite analizar la dinámica disipativa en SFT y contrastarla con transformers convencionales.
- Experimentos de compresión topológica: la transición de 5 capas activas a 2 capas activas ([L14, L15]) ofrece un caso concreto para investigar poda estructural y retención de capacidades.
- Evaluación de retención de conocimiento de dominio general: el PPL de 155,74 en WikiText-103 permite medir la degradación del lenguaje general tras un SFT centrado en razonamiento.
- Prototipado de generación de texto corto en inglés: con contexto de 512 tokens, es adecuado para tareas de completado breve en entornos de investigación, no para producción.
- Reproducción de resultados de la Fase 6: el checkpoint y la configuración publicada permiten replicar las métricas declaradas (best_loss 1,9286, PPL WikiText-103 155,74, PPL CoT Hard 16,86) y validar la ley propuesta.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| SFT best_loss | 1,9286 |
| WikiText-103 PPL (post-SFT) | 155,74 |
| CoT Hard PPL (post-SFT) | 16,86 |
| Estabilidad de Lyapunov | 100 % de pasos con lyap < 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son de entrenamiento y perplejidad, no de capacidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~602 M parámetros en FP32 ocupa ~2,4 GB de pesos; en FP16 ~1,2 GB; en int8 ~0,6 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que la implementación `rmsn_core` sea compatible.
- Cabe en GPU de consumo: probablemente sí por tamaño, pero la compatibilidad real depende del framework propietario `rmsn_core`, no verificado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El único método documentado es la carga manual con `rmsn_core` y `torch.load("model.pt")`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos: la arquitectura RMSN no es un transformer estándar y no se han publicado benchmarks de tarea que permitan una comparación justa. A modo de referencia por tamaño (no por arquitectura), se incluyen alternativas de ~600 M parámetros:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-602M-Harmonic-SFT5k | 601,78 M | 512 | Apache 2.0 | `model.pt` | Arquitectura propietaria, sin benchmarks de tarea |
| Qwen2.5-0.5B | ~494 M | 32 768 | Apache 2.0 | safetensors, GGUF | Transformer estándar, benchmarks publicados |
| SmolLM2-360M | ~362 M | 8192 | Apache 2.0 | safetensors, GGUF | Transformer estándar, orientado a dispositivo |
| Pythia-410M | ~410 M | 2048 | Apache 2.0 | safetensors | Transformer estándar, reproducible |

La comparación es solo orientativa por escala; los datos de contexto y licencia de los modelos alternativos provienen de conocimiento general y no de la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo en inglés, hereda los sesgos del corpus de SFT no especificado.
- Riesgo de alucinación: no cuantificado; sin benchmarks de veracidad, el riesgo es desconocido y probablemente alto para un modelo de 602 M con SFT corto.
- Limitación de contexto: 512 tokens, muy inferior a los estándares actuales; restringe casos de uso multi-turno y documentos largos.
- Limitación de idioma: solo inglés; no se declara soporte de castellano ni de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la dependencia del paquete `rmsn_core` (no publicado como dependencia estándar) y el formato `model.pt` complican la integración en producción.
- Caveat de producción: la librería es `custom`, no hay integración con ecosistemas estándar (vLLM, llama.cpp, TGI), y el checkpoint requiere `torch.load`, lo que implica riesgos de seguridad si el archivo no es de confianza.
- Caveat de reproducibilidad: la model card describe una ley empírica derivada de 4 experimentos; no hay revisión por pares ni código de entrenamiento publicado en la información disponible.
- Advertencia de fecha: el modelo está fechado en 2026-11-11, posterior a la fecha de referencia habitual; verificar la vigencia de los artefactos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-602M-Harmonic-SFT5k
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
