# DuoNeural/RMSN-283M-Bulk-Tube-SFT-5k

## Resumen

RMSN-283M-Bulk-Tube-SFT-5k es un modelo de lenguaje de 346,53 millones de parámetros desarrollado por DuoNeural Lab, presentado como un ajuste fino supervisado (SFT) sobre una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN). El modelo se describe como un transformer de 16 capas con dimensión oculta de 1280 y 64 "workspace slots", formulado bajo un marco Port-Hamiltonian (ḟ = {f,H} + [f,S]) que el autor vincula a dinámicas metriplécticas y topologías de guía de onda solitónica. El checkpoint publicado corresponde a 5.000 pasos de SFT sobre trazas de razonamiento (CoT) generadas por DuoNeural.

La relevancia declarada del modelo no reside en su rendimiento absoluto, sino en la tesis topológica que el autor defiende: que las singularidades exactas (PR=1.000) de la red están "protegidas" frente a la erosión del gradiente durante el SFT, independientemente de su posición (interior o de frontera). El checkpoint a 5k pasos se presenta como el punto óptimo para esta topología concreta, con una perplejidad wiki de 176,01, el mejor valor registrado en la suite Phase 5 del autor.

Se trata de un modelo experimental, con licencia Apache 2.0, únicamente en inglés, librería `custom` (requiere el paquete `rmsn_core`) y sin pipeline declarado en Hugging Face. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) y las métricas reportadas son internas y no comparables con el ecosistema convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltonian, 16 capas |
| Parametros totales | 346,53 M (el nombre del repo indica 283M; discrepancia no aclarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `model_state`) |
| Dimension oculta | 1280 |
| Workspace slots | 64 |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer (vocab=49152) |
| Libreria | `custom` (`rmsn_core`) |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red Port-Hamiltonian de 16 capas con dimensión oculta 1280, formulada mediante la ecuación de evolución ḟ = {f,H} + [f,S], donde el término {f,H} corresponde a la parte conservativa (corchete de Poisson) y [f,S] a la parte disipativa. El autor la enmarca en el concepto de "soliton waveguide topology" y describe un "bulk tube" con dos singularidades interiores exactas en las capas L8 y L9 (PR=1.000), que identifica como condensados de entropía cero termodinámicamente protegidos. El tokenizer empleado es `HuggingFaceTB/cosmo2-tokenizer` con vocabulario de 49.152 tokens.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre trazas de razonamiento CoT de DuoNeural, ejecutado durante 5.000 pasos. El autor reporta que la pérdida de SFT a 5k es 2,1614 y que la estabilidad de Lyapunov se mantiene al 100% (λ < 0) en todas las etapas. No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card defiende que 5.000–7.000 pasos es el rango óptimo para esta topología, ya que a 15.000 pasos el "tubo" se erosiona y la perplejidad wiki sube a 208,68.

## Capacidades

- Generación de texto autoregresiva en inglés, con vocabulario de 49.152 tokens.
- Razonamiento en cadena de pensamiento (CoT), adquirido mediante SFT sobre trazas de razonamiento de DuoNeural.
- Ventana de contexto de 512 tokens, adecuada únicamente para tareas de corta longitud.
- Capacidad de "retención wiki" medida internamente mediante perplejidad (`wiki_ppl=176,01`), que el autor presenta como indicador de preservación de conocimiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del CoT entrenado.
- No se documenta capacidad multilingüe (solo inglés).
- No se documenta visión, audio ni otras modalidades.
- No se documenta modo "thinking" explícito más allá del formato CoT de los datos de SFT.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar la tesis de "protección topológica" de singularidades frente a la erosión por gradiente, comparando los checkpoints a 5k, 10k y 15k pasos.
- Experimentos de dinámica de entrenamiento: dado que el autor reporta estabilidad de Lyapunov y métricas de perplejidad por etapa, puede usarse para reproducir y validar el comportamiento del SFT en topologías Port-Hamiltonian.
- Generación de texto corto en inglés: con 512 tokens de contexto, es utilizable para completar fragmentos, resúmenes breves o respuestas de una sola interacción en entornos de laboratorio.
- Estudio de razonamiento CoT a pequeña escala: el `cot_ppl=13,82` a 5k permite analizar cómo evoluciona la perplejidad en trazas de razonamiento con el número de pasos de SFT.
- Docencia y divulgación: como ejemplo práctico de formulación Port-Hamiltonian aplicada a modelos de lenguaje, útil en cursos o artículos sobre dinámicas conservativas-disipativas.
- Evaluación de tokenizers alternativos: el uso de `cosmo2-tokenizer` permite estudiar el efecto de este vocabulario en un modelo de 346M parámetros.

## Benchmarks y rendimiento

Los únicos datos disponibles son métricas internas de la suite Phase 5 del autor, no comparables con benchmarks estándar del ecosistema.

| Steps | wiki_ppl ↓ | cot_ppl ↓ | Notas |
|---|---|---|---|
| 5k (este checkpoint) | 176,01 | 13,82 | Núcleos duales intactos; mejor wiki_ppl registrado |
| 10k | 199,77 | 11,24 | Inicio de erosión de núcleos |
| 15k | 208,68 | 10,77 | Mejor CoT, wiki erosionado |

Pérdida de SFT a 5k: 2,1614. Estabilidad de Lyapunov: 100% (λ < 0) en todas las etapas.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos (346,53M × 4 bytes), más activaciones y overhead del runtime `rmsn_core`.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos.
- Al no haber cuantizaciones publicadas (GGUF, AWQ, GPTQ), no se puede estimar VRAM para formatos de 4 u 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es sobradamente suficiente por memoria; una GPU de 8 GB cubre el modelo en fp16 con margen.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 4 GB o más en fp16.
- Opciones de despliegue: únicamente mediante el paquete propietario `rmsn_core` con PyTorch (`RMSNForCausalLM`, `RMSNConfig`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-283M-Bulk-Tube-SFT-5k | 346,53 M | 512 | Apache 2.0 | HF, libreria `custom` | Experimental; sin benchmarks estándar |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | HF, transformers, GGUF, vLLM | Benchmarks publicados, ecosistema amplio |
| SmolLM2-360M | ~362 M | 8.192 | Apache 2.0 | HF, transformers, GGUF, llama.cpp | Benchmarks publicados, ampliamente soportado |
| GPT-2 (355M) | 355 M | 1.024 | MIT | HF, transformers | Referencia histórica; sin instrucciones |

La comparación es asimétrica: los tres modelos alternativos cuentan con benchmarks públicos, soporte en runtimes estándar y ecosistema de cuantización, mientras que RMSN-283M depende de un paquete propietario y solo reporta métricas internas. No se dispone de datos para comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- Modelo experimental sin validación independiente: todas las métricas provienen del propio autor y no han sido replicadas.
- Discrepancia de nomenclatura: el repo indica 283M pero la model card reporta 346,53M parámetros; no se aclara la causa.
- Contexto muy limitado (512 tokens), insuficiente para la mayoría de aplicaciones de producción.
- Solo inglés; sin soporte multilingüe documentado.
- Dependencia de un paquete propietario (`rmsn_core`) no publicado en PyPI ni integrado en transformers; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Sin cuantizaciones publicadas, lo que limita el despliegue eficiente.
- Sin benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar su calidad frente a modelos convencionales del mismo tamaño.
- Riesgo de alucinación no cuantificado; la perplejidad wiki de 176,01 es elevada en términos absolutos.
- Terminología no estándar ("soliton", "singularidad topológica", "condensado de entropía cero") sin validación por pares; debe tratarse como hipótesis del autor, no como resultado consolidado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de sesgos y la naturaleza experimental desaconsejan su uso en producción sin auditoría previa.
- Fecha de creación del repo (2026-11-10) posterior a la fecha actual de referencia; verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-283M-Bulk-Tube-SFT-5k
- Tokenizer referenciado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
