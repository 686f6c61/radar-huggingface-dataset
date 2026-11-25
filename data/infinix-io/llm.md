# Infinix-io/llm

## Resumen

Kimi-K3.1-Pro-SuperExpert (publicado en el repositorio `Infinix-io/llm`) es una compresión extrema del modelo base `moonshotai/Kimi-K3.1-Pro`, un Mixture-of-Experts de gran escala (la model card cita 2,8 billones de parámetros totales y 104B activos) desarrollado originalmente por Moonshot AI. El autor de esta ficha, Infinix-io, aplica una técnica propietaria denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para reducir el modelo a un artefacto de aproximadamente 12 GB ejecutable en hardware de consumo.

El problema que aborda es la brecha entre los modelos frontera y el hardware disponible para desarrolladores e investigadores: un MoE de ese tamaño requeriría del orden de 5.600 GB de VRAM en su forma original, mientras que esta versión cabe en un portátil con 16 GB de memoria unificada o en una GPU de consumo. La model card declara una retención de conocimiento superior al 95 % respecto al modelo base, con resultados reportados de 85,8 % en ARC-Challenge, 82,1 % en GSM8K y 80,4 % en HumanEval.

El repositorio combina pesos en safetensors (12.008.815.616 parámetros reales según los metadatos del Hub) con una build GGUF Q4_K_M, y se distribuye bajo licencia Apache 2.0. La propuesta encaja en la tendencia de destilación y consolidación de expertos para llevar modelos de razonamiento a entornos on-device, sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) causal-LM derivada de Kimi-K3.1-Pro; compresión AW-SECD con consolidación de super-expertos y compensación de deriva residual |
| Parametros totales | 12.008.815.616 (pesos del artefacto publicado); el modelo base se describe como 2,8T MoE |
| Parametros activos | 104B en el modelo base original (no aplicable directamente al artefacto comprimido) |
| Longitud de contexto | no disponible (la model card menciona soporte de long-context sin cifra concreta) |
| Tipos de cuantizacion | 4-bit (GGUF Q4_K_M), 8-bit, float16/float32 en carga nativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M, ~12,0 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de escala frontera (2,8T parámetros totales, 104B activos por token según la model card). La contribución del autor no es un reentrenamiento, sino una compresión post-hoc: AW-SECD consolida los subespacios de expertos ponderando por activación y aplica compensación de deriva residual para minimizar la pérdida de conocimiento al reducir la huella a 4 bits. El resultado se empaqueta como un causal-LM estándar de 12.008.815.616 parámetros reales, compatible con `AutoModelForCausalLM` de transformers mediante `trust_remote_code=True` y con llama.cpp/Ollama vía GGUF.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se especifican innovaciones de decodificación (especulativa, atención lineal) más allá de la propia técnica AW-SECD. La model card afirma "zero-drift" en razonamiento multi-paso y una retención de conocimiento superior al 95 %, pero no se aportan detalles metodológicos verificables sobre el proceso de calibración o el conjunto de evaluación usado para medir esa retención.

## Capacidades

- Generación de texto conversacional multi-turno con formato de plantilla `<|user|>...<|assistant|>`.
- Razonamiento matemático multi-paso (la model card cita GSM8K como caso de uso principal).
- Razonamiento científico y deducción causal (ejemplo ARC-Challenge incluido en el widget).
- Generación de código Python, incluida la resolución de problemas algorítmicos tipo HumanEval.
- Soporte declarado de contexto largo (tag `long-context`), sin cifra concreta publicada.
- Ejecución on-device: CPU con AVX2/AVX-512, GPU NVIDIA con offload CUDA y Apple Silicon vía Metal.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en Ollama, llama.cpp, LM Studio y Jan.ai.
- No se documentan capacidades de visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistencia matemática en local para estudiantes e investigadores: el modelo resuelve ecuaciones paso a paso (por ejemplo, `3x + 15 = 45`) sin conexión a internet, lo que permite usarlo en entornos con requisitos de privacidad o sin red.
- Generación de código en estaciones de trabajo sin GPU dedicada: con 12 GB en Q4_K_M cabe en un portátil de 16 GB y permite autocompletar funciones, escribir docstrings y resolver problemas algorítmicos desde el editor.
- Razonamiento científico en cuadernos de laboratorio: la capacidad demostrada en ARC-Challenge lo hace útil para explicar fenómenos físicos y validar deducciones causales en documentación técnica.
- Prototipado rápido en Google Colab o Kaggle gratuitos: la model card incluye runners de un clic para T4/P100, lo que permite evaluar el modelo sin invertir en hardware.
- Despliegue offline en entornos air-gapped: al ejecutarse íntegramente en local con llama.cpp u Ollama, encaja en organizaciones que no pueden enviar datos a APIs externas.
- Chatbot de soporte técnico interno: la ventana de contexto larga declarada permite arrastrar documentación y conversaciones previas, aunque la ausencia de tool calling limita la integración con sistemas externos.
- Educación y experimentación docente: sirve para ilustrar técnicas de cuantización y consolidación de expertos en cursos de IA, comparando el comportamiento del artefacto con el modelo base.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Resultado declarado | Referencia comparativa |
|---|---|---|
| ARC-Challenge | 85,8 % | Retención del 95,6 % respecto al modelo frontera |
| GSM8K | 82,1 % | "Zero-drift" en lógica multi-paso |
| HumanEval | 80,4 % | Generación de código de producción |

La model card no publica resultados de MMLU ni de otros benchmarks estándar, ni detalla el protocolo de evaluación (número de shots, versión del harness). Los resultados deben tratarse como declaraciones del autor pendientes de replicación.

## Requisitos de hardware

- VRAM/RAM estimada: ~12 GB para la build Q4_K_M; el repositorio completo ocupa 12,0 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para inferencia íntegra en GPU; también se verifica funcionamiento con offload en GPUs de 6–16 GB de VRAM.
- Consumer GPU: sí, cabe en tarjetas con 12–16 GB de VRAM y en Apple Silicon con 16 GB de memoria unificada (M1/M2/M3/M4, verificado por el autor a 25+ tok/s).
- CPU: ejecutable en PCs Intel/AMD estándar con 16 GB de RAM y soporte AVX2/AVX-512.
- Opciones de despliegue: transformers (`trust_remote_code=True`), llama.cpp, Ollama, LM Studio, Jan.ai, y runners de Colab/Kaggle.
- Latencia y throughput: el autor declara 25+ tok/s en Apple Silicon; no se publican cifras para GPU NVIDIA ni CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Ejecución local |
|---|---|---|---|---|
| Kimi-K3.1-Pro-SuperExpert (este) | 12,0B (artefacto); base 2,8T MoE | no disponible | Apache 2.0 | Sí, 12 GB |
| Kimi-K3.1-Pro (base) | 2,8T totales / 104B activos | no disponible | no disponible | No (requiere ~5.600 GB VRAM) |
| GLM-5.3 SuperExpert v2 (misma familia) | no disponible | no disponible | no disponible | Sí (perfil de memoria no disponible) |

No se dispone de datos de benchmarks independientes que permitan una comparación cuantitativa fiable con alternativas de la misma categoría; la comparativa se limita a parámetros, licencia y viabilidad de despliegue.

## Limitaciones y advertencias

- Los benchmarks son declaraciones del autor sin verificación independiente ni protocolo detallado; deben replicarse antes de tomar decisiones de producción.
- La técnica AW-SECD no está documentada con detalle metodológico en la información disponible, lo que dificulta auditar la afirmación de retención del 95 %.
- La model card mezcla identificadores de repositorio (`shashanth-27xA9/...`) distintos del ID real (`Infinix-io/llm`), lo que genera dudas sobre la procedencia y el mantenimiento del artefacto.
- Riesgo de alucinación inherente a los modelos de lenguaje; la compresión agresiva a 4 bits puede amplificarlo en dominios poco representados.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés.
- Longitud de contexto no especificada numéricamente, a pesar del tag `long-context`.
- Ausencia de soporte documentado de tool calling o agentes, lo que limita su uso en pipelines automatizados complejos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `moonshotai/Kimi-K3.1-Pro` antes de un uso comercial.
- El repositorio tiene un volumen de descargas muy bajo (124) y cero likes, señal de escasa validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Infinix-io/llm
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Runner de Colab (citado en la model card): https://colab.research.google.com/github/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/blob/main/1_click_run_kimi_12gb.ipynb
- Suite de benchmarks en Colab: https://colab.research.google.com/github/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/blob/main/benchmark_evaluation_and_test.ipynb
- Demo en Spaces: https://huggingface.co/spaces/shashanth-27xA9/Kimi-K3.1-Pro-Playground
- Descarga directa del GGUF Q4_K_M: https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/resolve/main/kimi-k3.1-pro-superexpert-12gb-q4_k_m.gguf
- Notebook de Kaggle: https://www.kaggle.com/code/hariniathukuri/kimi-k3-1-pro-12gb-1-click-starter
