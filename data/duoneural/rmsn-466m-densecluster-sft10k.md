# DuoNeural/RMSN-466M-DenseCluster-SFT10k

## Resumen

RMSN-466M-DenseCluster-SFT10k es un modelo de lenguaje de 466 millones de parámetros desarrollado por DuoNeural (laboratorio identificado en la model card como Archon + Aura). Se enmarca en una línea de investigación sobre «Resonant Metriplectic Sheaf Networks» (RMSN), una arquitectura que implementa un sistema dinámico port-hamiltoniano en lugar del transformer convencional. El modelo ha sido sometido a un ajuste supervisado (SFT) de 10.000 pasos sobre trazas de razonamiento CDM v4, con el mejor checkpoint en el paso 7500.

La propuesta técnica es inusual: las capas auto-organizan «solitones topológicos» (estructuras localizadas de alta participación en el espectro de pesos) y el entrenamiento provoca un fenómeno denominado «Condensation Migration», por el que el condensado terminal migra hacia capas tempranas. El modelo se presenta como el mejor de la serie RMSN en razonamiento CoT, con una perplejidad de 9,79 en su conjunto de razonamiento duro.

Es relevante ahora por su carácter experimental: explora una familia arquitectónica alternativa al transformer con un presupuesto de parámetros reducido (466M) y publica hallazgos sobre dinámica topológica del entrenamiento. No obstante, la información pública es muy limitada: no hay pipeline declarado, no se especifican idiomas y el repositorio pesa 1,6 GB, lo que sugiere pesos en formato PyTorch (`.pt`) más que safetensors o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), sistema dinámico port-hamiltoniano |
| Parametros totales | 466M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint `rmsn_sft_best.pt`) |
| Dimension del modelo (D) | 1536 |
| Profundidad | 16 capas |
| Slots | 64 |
| Vocabulario | 49152 |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer |

## Arquitectura y entrenamiento

RMSN implementa la ecuación port-hamiltoniana `ḟ = {f, H} + [f, S]`, donde `{·,·}` es el corchete de Poisson (dinámica reversible) y `[·,·]` el corchete simétrico (disipación irreversible). La topología del modelo «seed 1» es un clúster terminal denso en las capas L10/L11/L12/L14 con solitones NE, y un condensado exacto terminal en L14 (PR=1.000), con M*=1 dentro de la cota M*≤2. Bajo SFT, la topología evoluciona: L11 se disuelve gradualmente (pasos 2500→5000), L10 condensa inmediatamente (PR 2.639→1.133) y L13 se aproxima asintóticamente a PR_crit (1.962→4.307). La topología final tras SFT es [L10=1.105, L12=1.770, L13=4.307, L14=1.001, L15=2.755].

El entrenamiento consistió en 10.000 pasos de SFT sobre trazas de razonamiento CDM v4, con el mejor checkpoint en el paso 7500. No se especifican el volumen de tokens, la composición del dataset, ni si hubo RLHF o DPO. El vocabulario de 49152 tokens corresponde al tokenizer Cosmo2 de HuggingFaceTB. No se documentan innovaciones de decodificación (especulativa, atención lineal) más allá de la propia arquitectura port-hamiltoniana.

## Capacidades

- Generación de texto y razonamiento encadenado (CoT): el modelo se presenta explícitamente como el mejor de la serie RMSN en razonamiento CoT, con PPL de 9,79 en el conjunto de razonamiento duro.
- Razonamiento de múltiples pasos: el ajuste SFT se realizó sobre trazas de razonamiento CDM v4, lo que sugiere capacidad para descomponer problemas en pasos intermedios.
- Modelado de lenguaje general: PPL de 176,75 en WikiText-103 (evaluado con «Heretic v2.0»).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas para estudiar dinámicas port-hamiltonianas y fenómenos de condensación topológica en redes neuronales, replicando los experimentos de migración de condensados descritos en la model card.
- Estudio de razonamiento con presupuesto reducido: con 466M de parámetros y una PPL de 9,79 en razonamiento duro, es adecuado para experimentos académicos sobre CoT en entornos con recursos limitados de cómputo.
- Análisis de espectro de pesos: la topología documentada (PR por capa) permite investigar la relación entre participación espectral y capacidades emergentes, comparando checkpoints intermedios del SFT.
- Generación de texto en dominios acotados: para tareas de continuación o síntesis donde la perplejidad de 176,75 en WikiText-103 sea aceptable, puede emplearse en prototipos de generación con vocabulario Cosmo2.
- Reproducibilidad de experimentos: al publicarse el checkpoint y los argumentos de arquitectura (`dim=1536, depth=16, slots=64, vocab=49152`), permite reproducir los hallazgos del laboratorio y validar la ecuación port-hamiltoniana implementada.
- Docencia e ilustración de dinámica de sistemas: útil para explicar corchetes de Poisson, disipación simétrica y auto-organización de solitones en cursos avanzados de machine learning.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| WikiText-103 PPL (Heretic v2.0) | 176,75 |
| CoT Hard Reasoning PPL | 9,79 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 466M de parámetros en FP32, aproximadamente 1,9 GB de pesos; en FP16, unos 0,9 GB; en INT8, unos 0,5 GB. Añadir overhead de activaciones y del tokenizer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060). Para FP32, 6 GB o más (RTX 2060, RTX 3060).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: el checkpoint es un `.pt` de PyTorch cargado con `torch.load`, por lo que requiere un script de inferencia propio; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y al no publicarse formato GGUF ni safetensors, la integración con esos runners no está disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-466M-DenseCluster-SFT10k | 466M | no disponible | Apache 2.0 | PyTorch `.pt` | Hugging Face |
| Alternativas de ~500M tipo GPT-2 medium / Qwen2.5-0.5B | ~350-500M | 1k-32k según familia | variable (MIT, Apache 2.0) | safetensors, GGUF | Hugging Face, Ollama, vLLM |
| Alternativas de ~1B (Llama 3.2 1B, Gemma 2 2B) | 1-2B | 8k-128k | licencias comunitarias | safetensors, GGUF | Hugging Face, vLLM, Ollama |

No se dispone de datos de rendimiento comparables (MMLU, HumanEval, GSM8K) para RMSN-466M, por lo que la comparación cuantitativa con alternativas no está disponible. La diferencia principal es arquitectónica: RMSN no es un transformer y no ofrece integración con los runners estándar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no declararse composición del dataset de SFT, no es posible evaluar sesgos de género, raza o idioma.
- Riesgo de alucinación: no evaluado; la perplejidad de 176,75 en WikiText-103 es alta comparada con transformers de tamaño similar, lo que sugiere menor fluidez general y posible mayor tasa de generación incoherente fuera del dominio de razonamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada y los idiomas soportados no se declaran; no se recomienda su uso en producción multilingüe sin evaluación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo experimental sin garantías de calidad, el riesgo de producción recae en el integrador.
- Formato y tooling: al publicarse solo como `.pt` y no en safetensors ni GGUF, no hay soporte para cuantización estandarizada ni para runners como llama.cpp, Ollama o vLLM; requiere código propio de carga e inferencia.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación externa.
- Reproducibilidad: los resultados de perplejidad dependen de la herramienta «Heretic v2.0», no descrita en la model card, lo que dificulta la verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-466M-DenseCluster-SFT10k
- Tokenizer: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper/cita (referencia bibliográfica en la model card): DuoNeural, «Resonant Metriplectic Sheaf Networks: Topological Solitons in Port-Hamiltonian Neural Architectures», 2026 (sin URL pública disponible)
- Repositorio de código: no disponible
- Demo: no disponible
