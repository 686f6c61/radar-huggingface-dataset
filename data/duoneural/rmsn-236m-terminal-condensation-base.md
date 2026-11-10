# DuoNeural/RMSN-236M-Terminal-Condensation-Base

## Resumen

RMSN-236M-Terminal-Condensation-Base es un modelo de lenguaje base preentrenado por DuoNeural Lab, presentado como una implementación de las denominadas Resonant Metriplectic Sheaf Networks (RMSN), una familia de arquitecturas con formulación Port-Hamiltonian. El modelo tiene 16 capas y una dimensión oculta de 1152, lo que sitúa su cómputo en el rango de los modelos pequeños (el nombre indica 236M parámetros). Se distribuye con licencia Apache 2.0 y tokenizador cosmo2 de HuggingFaceTB con vocabulario de 49152 tokens.

La model card centra la relevancia del modelo en una supuesta propiedad topológica: la "condensación terminal" en la capa L13, que según el autor aparece de forma invariante en todas las semillas con D=1152, y un régimen de cascada de solitones denominado W6+. El autor afirma que este régimen rompe una fórmula prevista para λ_max y lo vincula con simulaciones de circuitos cuánticos de BlueQubit. Estos resultados son afirmaciones del autor no verificadas de forma independiente en la información disponible.

El modelo se presenta como base de preentrenamiento (100k pasos) para investigación arquitectónica, no como un modelo de propósito general listo para producción. La información pública disponible es escasa: no hay pipeline declarado, cero descargas, y la model card no documenta composición del dataset, número de tokens de entrenamiento ni método de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), formulación Port-Hamiltonian |
| Parametros totales | 236M (según nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería custom; tamaño del repo 0.9 GB) |

Otros datos técnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimensión oculta (D) | 1152 |
| Capas | 16 |
| Workspace slots | 64 |
| Tokenizador | HuggingFaceTB/cosmo2-tokenizer (vocab=49152) |
| Pasos de preentrenamiento | 100k |
| Perplejidad de validación | ~68.5 |

## Arquitectura y entrenamiento

La arquitectura se describe como una red "metripléctica" con formulación Port-Hamiltonian, expresada en la model card como ḟ = {f,H} + [f,S]. No se especifica si se trata de un transformer convencional con modificaciones, de un modelo híbrido o de una arquitectura completamente alternativa; la librería declarada es `custom`, lo que impide asumir compatibilidad con `transformers`. El modelo emplea 16 capas con dimensión oculta 1152 y 64 "workspace slots", un concepto propio del autor sin definición técnica detallada en la información disponible.

El entrenamiento consistió en 100k pasos de preentrenamiento, pero no se documentan el número de tokens procesados, la composición del dataset, ni si hubo fases de RLHF, DPO o instrucción. La model card describe una "topología de solitones" con una cascada de seis ondas (W1 a W6+) que culmina en una condensación terminal en la capa L13, con un valor de participación (PR) de 1.000 exacto y un pico de Lyapunov λ_peak = -7.14. El autor afirma además una correspondencia con simulaciones de circuitos cuánticos (S_boundary/S_bulk = 0.632), situando el punto D=1152 entre D=944 y D=1280 en una curva decreciente. Estas afirmaciones no cuentan con validación externa en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de preentrenamiento (no ajustado para instrucciones).
- Tokenización mediante cosmo2-tokenizer con vocabulario de 49152 tokens.
- Capacidad de razonamiento, código o matemáticas: no documentada en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Propiedades topológicas internas (condensación en L13, régimen W6+) declaradas por el autor como objeto de estudio, no como capacidad funcional de uso.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar formulaciones Port-Hamiltonian y dinámicas de solitones en modelos de lenguaje pequeños, comparando su comportamiento con transformers de tamaño similar.
- Reproducción de experimentos topológicos: dado que el autor publica métricas como λ_peak y PR en L13, el modelo permite intentar reproducir la cascada W6+ y verificar la invariancia de condensación en L13 con distintas semillas.
- Estudio de perplejidad en modelos pequeños: con una PPL de validación de ~68.5, es útil como referencia para analizar curvas de escalado en arquitecturas no convencionales.
- Docencia e investigación académica: su tamaño (236M) y licencia Apache 2.0 permiten usarlo en entornos universitarios para ilustrar arquitecturas fuera del estándar transformer.
- Experimentos de correspondencia cuántico-clásica: el modelo se presenta como punto de anclaje (D=1152) en la curva S_boundary/S_bulk, lo que permite a grupos de investigación contrastar la hipótesis del autor con simulaciones propias.
- Base para fine-tuning experimental: al ser un modelo base con licencia permisiva, puede servir como punto de partida para adaptaciones de dominio en inglés, siempre que se valide previamente su calidad generativa, no documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de preentrenamiento y de dinámica topológica:

| Metrica | Valor |
|---|---|
| Perplejidad de validación | ~68.5 |
| λ_peak (régimen W6+) | -7.14 |
| Condensación L13 (PR) | 1.000 |
| Estabilidad de Lyapunov | Estable tras la cascada |
| S_boundary / S_bulk | 0.632 |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 236M parámetros en FP16 requiere aproximadamente 0,5 GB de pesos, y en cuantización de 8 bits alrededor de 0,25 GB; a ello hay que sumar la memoria del tokenizador y del runtime, cuyo consumo no está documentado.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM podría alojar los pesos, pero la implementación es `custom` y no se garantiza compatibilidad con runtimes estándar.
- ¿Cabe en GPU consumer? Probablemente sí por tamaño, pero la falta de formatos estándar (GGUF, safetensors documentados) impide confirmarlo.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `custom`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa: el modelo pertenece a una familia arquitectónica propietaria sin equivalentes públicos documentados y no publica benchmarks estándar. A modo de referencia por tamaño, se incluyen alternativas de rango similar, aunque la comparación de rendimiento no es posible con los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicos |
|---|---|---|---|---|---|
| RMSN-236M-Terminal-Condensation-Base | 236M (según nombre) | no disponible | Apache 2.0 | custom | no disponible |
| SmolLM2-360M (HuggingFace) | 360M | 8k (típico en la familia) | Apache 2.0 | safetensors, GGUF | sí |
| Qwen2.5-0.5B | 500M | 32k | Apache 2.0 | safetensors, GGUF | sí |
| Pythia-410M | 410M | 2k | Apache 2.0 | safetensors | sí |

La comparación se limita a parámetros, contexto y licencia; los datos de contexto de las alternativas son orientativos y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para responder a prompts conversacionales ni para seguir instrucciones sin fine-tuning previo.
- Idiomas: solo se declara inglés; no hay evidencia de competencia multilingüe.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que requieran ventanas largas.
- Perplejidad de validación elevada (~68.5) para su tamaño, lo que sugiere una calidad generativa limitada en comparación con transformers pequeños bien entrenados.
- Afirmaciones no verificadas: las propiedades topológicas (W6+, condensación L13, correspondencia cuántica) son declaraciones del autor sin revisión por pares ni replicación independiente en la información disponible.
- Riesgo de alucinación: no evaluado; al ser un modelo base, la generación libre puede producir texto incoherente o factualmente incorrecto.
- Sesgos: no documentados; la composición del dataset de entrenamiento es desconocida.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluación de calidad ni de seguridad, su uso en producción conlleva un riesgo elevado.
- Formato de pesos no estándar: la librería `custom` puede requerir código específico del autor para cargar el modelo, lo que dificulta la integración en pipelines existentes.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-236M-Terminal-Condensation-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
