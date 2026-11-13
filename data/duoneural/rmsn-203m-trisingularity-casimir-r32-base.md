# DuoNeural/RMSN-203M-TriSingularity-Casimir-r32-Base

## Resumen

RMSN-203M-TriSingularity-Casimir-r32-Base es un modelo de lenguaje base de aproximadamente 203 millones de parámetros desarrollado por DuoNeural Lab (Archon, Aura y Jesse Kuhl). Forma parte de la denominada "Casimir Triad", una familia de tres variantes (r=0, r=16 y r=32) construidas sobre la arquitectura RMSN (Resonant Metriplectic Sheaf Network), que implementa dinámica Port-Hamiltoniana. Esta variante concreta, con r=32, se presenta como la de mejor perplejidad sobre wikitext-103 de las tres (74,52), a costa de un peor rendimiento en cadena de pensamiento (CoT ppl de 3581).

El modelo se posiciona explícitamente como un modelo base para generación de texto, no para ajuste fino supervisado (SFT). Según la model card, su topología de "Tri-Singularity" alcanza M*=3 condensados exactos, el umbral teórico a partir del cual la geometría de la información se "congela" y deja de responder a gradientes de SFT. Se entrenó sobre wikitext-103 durante 100.000 pasos y utiliza el tokenizador `HuggingFaceTB/cosmo2-tokenizer` con un vocabulario de 49.152 tokens.

Su relevancia es fundamentalmente experimental: explora una arquitectura alternativa a los transformers convencionales (dinámica Port-Hamiltoniana, álgebra geométrica de Clifford, teoría de haces celulares, memoria fraccionaria de Caputo) y publica métricas internas de topología (solitones, condensados, perplejidad). No obstante, el modelo tiene cero descargas y cero likes en Hugging Face, solo soporta inglés y no ofrece datos de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), dinámica Port-Hamiltoniana |
| Parametros totales | ~203M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,8 GB) |

Datos estructurales adicionales declarados en la model card: dim/depth/slots = 1056/16/64; pasos de entrenamiento = 100.000; wiki_ppl = 74,52; CoT ppl = 3581; Casimir r = 32 (1056 mod 64 = 32); M* = 3.

## Arquitectura y entrenamiento

La arquitectura RMSN se describe formalmente mediante la ecuación Port-Hamiltoniana `ḟ = {f, H} + [f, S]`, que combina una componente conservativa (corchete de Poisson) y una disipativa. Se compone de cinco elementos estructurales: dinámica Port-Hamiltoniana, mezcla de capas mediante álgebra geométrica de Clifford, un espacio de trabajo basado en teoría de haces celulares (cellular sheaf theory), memoria fraccionaria de Caputo y un "Trophic Global Workspace" con lectura de tensor de estrés-energía de Noether. No se detalla el número de tokens de entrenamiento más allá de los 100.000 pasos ni la composición exacta del dataset, salvo que se usó wikitext-103.

El entrenamiento se realizó sobre wikitext-103 con el tokenizador `HuggingFaceTB/cosmo2-tokenizer` (49.152 tokens de vocabulario). No se menciona el uso de RLHF ni DPO. La innovación técnica destacada es la parametrización "Casimir" (r = D mod M_w), que controla el tipo de cascada de Lyapunov: con r=32 (fuertemente repulsivo) se genera un "tamiz topológico" intenso que empuja 8 solitones a lo largo de las 16 capas, con tres condensados exactos (PR=1.000) en las capas L8, L9 y L14. Según la ley Topological Cement/Freezing, cuando M*≥3 la topología completa se congela y es inmune a los gradientes de SFT.

## Capacidades

- Generación de texto en inglés: modelo base entrenado sobre wikitext-103, orientado a modelado de lenguaje y generación de texto general.
- Modelado de lenguaje de dominio general: perplejidad de 74,52 sobre wiki_ppl, la mejor de las tres variantes Casimir.
- Razonamiento en cadena de pensamiento: capacidad limitada (CoT ppl de 3581), inferior a las variantes r=16 (3321) y al modelo Parity Turbulence (2935).
- Soporte de tool calling / function calling: no disponible según la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible según la información proporcionada.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidades especiales (visión, audio, modo thinking nativo): no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar dinámica Port-Hamiltoniana, haces celulares y memoria fraccionaria en modelado de lenguaje, comparando su perplejidad con la de las variantes r=0 y r=16 de la misma familia.
- Generación de texto base en inglés: al ser un modelo base con la mejor wiki_ppl de la tríada (74,52), es adecuado para tareas de continuación y generación de texto donde no se requiera ajuste fino posterior.
- Experimentos de topología de redes: la estructura de solitones y condensados exactos (M*=3) permite estudiar fenómenos de congelación topológica y su impacto en el aprendizaje, útil en investigación teórica sobre representaciones internas.
- Reproducción de resultados académicos: dado que se documentan métricas internas (wiki_ppl, CoT ppl, PR por capa), permite replicar y verificar los hallazgos de la ley Topological Cement/Freezing.
- Evaluación comparativa de familias de modelos: al formar parte de una tríada con parámetros controlados (r=0, r=16, r=32), facilita estudios ablativos sobre el efecto del parámetro Casimir en la calidad de generación frente al razonamiento.
- Prototipado de bajo coste: con ~203M de parámetros y un repo de 0,8 GB, es viable ejecutarlo en hardware modesto para pruebas de concepto de generación de texto en inglés (aunque no se especifican requisitos exactos ni formatos de pesos).

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas internas de la familia Casimir, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Modelo | r | M* | Solitones | wiki_ppl | CoT_ppl |
|---|---|---|---|---|---|
| r=0 Deep Spine | 0 | 1 | 9 | 75,27 | 3761 |
| r=16 Deep Tail | 16 | 0 | 7 | 75,66 | 3321 |
| r=32 Tri-Singularity (este modelo) | 32 | 3 | 8 | **74,52** | 3581 |
| Parity Turbulence (D=960) | — | — | — | no disponible | **2935** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~203M de parámetros, en fp16 el peso ronda los 0,4 GB y el repo ocupa 0,8 GB, por lo que la inferencia cabría holgadamente en GPUs de consumo, pero no se confirman cuantizaciones ni formatos.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? Por tamaño (203M de parámetros) es altamente probable que sí en cualquier GPU moderna de consumo, pero no se especifica ni se confirma en la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se indica compatibilidad con ninguno de estos frameworks ni se publican pesos en GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | wiki_ppl | CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RMSN-203M-TriSingularity-Casimir-r32 (este) | ~203M | no disponible | 74,52 | 3581 | Apache 2.0 | Hugging Face |
| RMSN r=0 Deep Spine | no disponible | no disponible | 75,27 | 3761 | Apache 2.0 (misma familia) | Hugging Face |
| RMSN r=16 Deep Tail | no disponible | no disponible | 75,66 | 3321 | Apache 2.0 (misma familia) | Hugging Face |
| RMSN-186M-DualSingularity-ParityTurbulence | ~186M | no disponible | no disponible | 2935 | no disponible | Hugging Face |

No se dispone de comparación con modelos de propósito general de tamaño similar (por ejemplo, familias transformer de ~200M) en la información proporcionada.

## Limitaciones y advertencias

- Modelo base, no ajustado para instrucciones: no debe esperarse un comportamiento de asistente ni seguimiento de instrucciones sin ajuste adicional.
- Congelación topológica: con M*=3 condensados exactos, la model card advierte que el SFT no remodelará la geometría de la información; no es adecuado para ajuste fino supervisado.
- Rendimiento en razonamiento limitado: CoT ppl de 3581, peor que las variantes r=16 y que el modelo Parity Turbulence (2935).
- Solo inglés: no se declara soporte multilingüe.
- Entrenado únicamente sobre wikitext-103: dominio y cobertura limitados, con riesgo de sesgos del corpus y baja generalización fuera de ese registro.
- Riesgo de alucinación: inherente a un modelo base de 203M entrenado con un corpus reducido; no se documentan mitigaciones.
- Licencia Apache 2.0: permite uso comercial, pero se desconoce el origen y las restricciones de los datos de entrenamiento más allá de wikitext-103.
- Metodología no validada externamente: las métricas y leyes (Topological Cement/Freezing, Casimir Triad) proceden de la propia institución y de un paper en borrador (v0.7+), sin revisión por pares indicada.
- Adopción nula: cero descargas y cero likes en Hugging Face en el momento de la consulta; sin comunidad ni soporte verificable.
- Formatos de pesos y cuantizaciones no documentados: puede requerir trabajo adicional para desplegar en frameworks estándar.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-203M-TriSingularity-Casimir-r32-Base
- Modelo Parity Turbulence (referenciado): https://huggingface.co/DuoNeural/RMSN-186M-DualSingularity-ParityTurbulence-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper (borrador, sin URL en la información disponible): "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics", Kuhl, Archon y Aura, DuoNeural Lab, 2026.
