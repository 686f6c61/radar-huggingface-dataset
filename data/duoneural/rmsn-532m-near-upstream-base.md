# DuoNeural/RMSN-532M-Near-Upstream-Base

## Resumen

RMSN-532M-Near-Upstream-Base es un modelo base de lenguaje preentrenado desarrollado por DuoNeural Lab, presentado como la arquitectura final (D=1664) de la "Phase 5 Topology Zoo" de su familia Resonant Metriplectic Sheaf Network (RMSN). Se trata de un modelo de 532,17 millones de parámetros con 16 capas, dimensión oculta de 1664 y 64 "workspace slots", construido sobre un formalismo Port-Hamiltonian (ḟ = {f,H} + [f,S]) en lugar del transformer convencional. El modelo se distribuye como base preentrenada (100.000 pasos) y está etiquetado como "Near-Upstream" dentro de la taxonomía topológica propietaria del autor.

El interés del modelo es fundamentalmente de investigación: propone una arquitectura alternativa basada en dinámica metripléctica y solitones, con leyes de escalado en dimensión (D) y una supuesta "Terminal Condensation Law" según la cual la capa 15 presenta una singularidad de rango efectivo exactamente igual a 1.000 para arquitecturas r=0 con D≥1664. No se trata de un modelo orientado a producción ni a comparación directa con LLMs convencionales: no hay benchmarks publicados, la longitud de contexto es de 512 tokens y la librería de inferencia es personalizada (`rmsn_core`).

La relevancia actual es limitada y acotada al nicho de arquitecturas experimentales: el modelo sirve como artefacto reproducible para estudiar topologías de solitones en redes neuronales y para validar las leyes de escalado del autor, pero carece de ecosistema estándar (no hay GGUF, no hay integración con vLLM ni llama.cpp) y su tokenizador es el de `HuggingFaceTB/cosmo2-tokenizer` (vocabulario de 49.152).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), Port-Hamiltonian (ḟ = {f,H} + [f,S]), 16 capas |
| Parametros totales | 532,17 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | `model.pt` (checkpoint PyTorch con clave `model_state`); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red "Port-Hamiltonian" con formulación metripléctica, es decir, una dinámica que combina un término conservativo ({f,H}) con un término disipativo ([f,S]). El modelo tiene dimensión oculta 1664, 16 capas y 64 workspace slots, con un tokenizador Cosmos2 de vocabulario 49.152. La model card describe una topología de solitones con capas activas en [5, 7, 8, 9, 15], un ancla "upstream" en L5 (PR=2.104), un clúster compacto de tres capas en L7–L9 (PR 3.425 / 2.944 / 1.945) y una "condensación terminal" en L15 con PR=1.000. Las capas L6 y L11–L14 actúan como buffers dieléctricos de alto PR (>30), y L0 es inerte (PR=18.663).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. El modelo se presenta como base preentrenada tras 100.000 pasos, sin detalles sobre la mezcla de datos ni sobre la metodología de optimización. La innovación técnica declarada es la propia topología de solitones y la "Terminal Condensation Law" (L15=1.000 universal para D≥1664 en arquitecturas r=0), que el autor plantea como una regularidad emergente del diseño, no como una técnica de inferencia (no se mencionan decodificación especulativa, atención lineal ni mecanismos similares).

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base preentrenado (no ajustado por instrucciones).
- Razonamiento y continuación de texto a nivel de modelo base; no se documentan capacidades específicas de matemáticas, código o visión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales: ninguna documentada (sin thinking mode, visión ni audio); la "capacidad" distintiva es la topología de solitones descrita en la model card, de interés analítico más que funcional.
- Ventana de contexto corta (512 tokens), lo que restringe tareas de contexto largo.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como artefacto reproducible para estudiar dinámicas Port-Hamiltonian y metriplécticas en redes neuronales, comparando los PR por capa con los valores publicados en la model card.
- Validación de leyes de escalado topológico: permite reproducir la "Terminal Condensation Law" y comprobar si L15=1.000 se mantiene en D=1664, tal como el autor afirma pendiente de confirmación multi-semilla.
- Estudio de tokenización Cosmos2: al usar `HuggingFaceTB/cosmo2-tokenizer` con vocabulario 49.152, sirve para analizar el comportamiento de ese tokenizador en un modelo de 532M y contexto 512.
- Experimentos de continuación de texto corto: con 512 tokens de contexto, es adecuado para tareas de generación breve en inglés dentro de un entorno de investigación controlado.
- Base para fine-tuning experimental: al ser un modelo base con licencia Apache 2.0, puede usarse como punto de partida para ajustes supervisados en dominios concretos, siempre que se disponga de `rmsn_core` y del checkpoint `model.pt`.
- Reproducción de la Topology Zoo: permite completar la serie D=944–2048 del autor y comparar topologías (Near-Upstream en D=1664 frente a COEXISTENCE en D=1792 o Triple Condensate en D=2048).
- Docencia y divulgación: útil para ilustrar formalismos Hamiltonianos y metriplécticos en cursos avanzados de arquitecturas neuronales, dado el detalle de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (1,8 GB en el repo), la inferencia en precisión nativa requiere aproximadamente 2,1 GB solo para pesos en fp32, más memoria para activaciones y workspace slots.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con ≥8 GB de VRAM debería poder cargar el modelo en fp32, aunque no hay datos oficiales de compatibilidad.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB), pero no está confirmado por el autor.
- Opciones de despliegue: únicamente mediante la librería personalizada `rmsn_core` (`RMSNForCausalLM`, `RMSNConfig`) y carga manual de `model.pt` con `torch.load`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-532M-Near-Upstream-Base | 532,17 M | 512 | RMSN Port-Hamiltonian | Apache 2.0 | HF, librería custom |
| Qwen2.5-0.5B | ~494 M | 32.768 | Transformer decoder | Apache 2.0 | HF, vLLM, llama.cpp, Ollama |
| SmolLM2-360M | ~362 M | 8.192 | Transformer decoder | Apache 2.0 | HF, llama.cpp, Ollama |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Transformer decoder | Apache 2.0 | HF, vLLM, llama.cpp |

La comparación es asimétrica: los modelos transformer de la misma escala cuentan con benchmarks públicos, contexto mucho mayor y ecosistema de despliegue estándar, mientras que RMSN-532M no ofrece ninguno de esos elementos. La comparativa se incluye solo como referencia de categoría (modelos pequeños de menos de 1B parámetros), no como equivalencia funcional.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica que permita evaluar su calidad real.
- Contexto muy corto (512 tokens), insuficiente para la mayoría de aplicaciones de producción actuales.
- Solo inglés; no se documenta soporte multilingüe.
- Modelo base sin ajuste por instrucciones: no es adecuado para uso conversacional directo sin fine-tuning.
- Ecosistema cerrado: requiere la librería `rmsn_core` y el formato `model.pt`; no hay conversión a safetensors, GGUF ni integración con frameworks estándar.
- Riesgo de alucinación no cuantificado, como en cualquier modelo base; sin datos de evaluación no puede acotarse.
- Sesgos no documentados: no se describe la composición del dataset de entrenamiento ni procesos de mitigación de sesgos.
- La model card contiene afirmaciones teóricas (leyes de escalado, condensación terminal) que el propio autor reconoce pendientes de confirmación multi-semilla en D=1664; deben tratarse como hipótesis, no como resultados consolidados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación empírica y de soporte técnico desaconseja su uso en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-532M-Near-Upstream-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio de `rmsn_core` y demos: no disponible en la información proporcionada.
