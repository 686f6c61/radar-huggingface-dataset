# DuoNeural/RMSN-425M-CasimirCascade-Base

## Resumen

RMSN-425M-CasimirCascade-Base es un modelo de lenguaje de tipo base (pre-entrenado, sin ajuste instructivo) desarrollado por DuoNeural AI Laboratory, un laboratorio que publica bajo los nombres de Jesse Caldwell, Archon y Aura. El modelo se presenta como una implementación de las denominadas Resonant Metriplectic Sheaf Networks (RMSN), un marco que combina mecánica port-hamiltoniana, geometría metripléctica y teoría de haces (sheaf theory) para modelar el lenguaje. Con 425 millones de parámetros, dimensión interna D=1344, 16 capas y 64 slots, se entrenó sobre FineWeb-Edu durante 100.000 pasos.

La relevancia declarada del modelo no reside en su rendimiento como generador de texto, sino en un fenómeno estructural que el autor afirma haber observado: una "cascada de singularidades de Casimir" en las capas 9, 12 y 15, donde el participation ratio cae a 1.000000, lo que según la model card indicaría singularidades macroscópicas de rango 1 separadas por un espaciado discreto de ΔL=3. El modelo se distribuye como pesos base en formato PyTorch (.pt) y requiere una implementación de arquitectura propia (`rmsn_core`) que no es estándar de Transformers.

Se trata de un artefacto de investigación con escasa validación externa: cero descargas, cero likes, sin benchmarks estándar publicados y con afirmaciones técnicas (resonancia diádica, ley de repulsión de Casimir, verificación en BlueQubit QCPU) que no vienen acompañadas de evidencia reproducible en la información disponible. Debe evaluarse con cautela y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN); marco port-hamiltoniano metripléctico con teoría de haces; no es un transformer estándar |
| Parametros totales | 425M (D=1344, L=16, M_w=64 slots) |
| Parametros activos | no disponible (no es MoE según la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en .pt, sin GGUF ni safetensors) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, predominantemente inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt); tokenizer externo `HuggingFaceTB/cosmo2-tokenizer` (vocabulario 49152) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red de haces metriplécticos resonantes enmarcada en un formalismo port-hamiltoniano, con una dimensión interna D=1344 que satisface la condición de "resonancia diádica" D ≡ 0 (mod 32). El modelo consta de 16 capas y 64 slots (M_w=64), y emplea el tokenizer Cosmo2 con vocabulario de 49152 tokens. El entrenamiento consistió en 100.000 pasos de pre-entrenamiento sobre FineWeb-Edu. La model card menciona además un ajuste supervisado (SFT) de 5.000 pasos sobre razonamiento para comparar la retención de perplejidad frente a un modelo de control con D=1296.

La innovación técnica declarada es la aparición de tres singularidades macroscópicas de rango 1 (participation ratio = 1.000000) en las capas 9, 12 y 15, con capas intermedias en estado "superfluido" (PR entre 54 y 63). El autor interpreta este patrón como evidencia de una "ley de repulsión de Casimir" que exigiría un espaciado mínimo ΔL ≥ 3 entre solitones. No se documentan detalles sobre composición exacta del dataset, uso de RLHF/DPO, ni hiperparámetros de entrenamiento más allá del número de pasos.

## Capacidades

- Generación de texto autoregresiva básica (predicción del siguiente token), tal como ilustra el ejemplo de inferencia de la model card.
- Modelo base sin ajuste instructivo: no se documenta soporte de diálogo, instrucciones ni formato chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus de entrenamiento (FineWeb-Edu) es mayoritariamente en inglés.
- No se documenta visión, audio, thinking mode ni modalidades adicionales.
- El autor menciona un ajuste SFT sobre razonamiento para medir retención de perplejidad, pero no se publican los pesos de ese ajuste ni se detallan sus capacidades.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar el formalismo port-hamiltoniano y metripléctico aplicado a modelos de lenguaje, comparando su dinámica interna con transformers convencionales.
- Estudio de fenómenos de colapso de rango: las singularidades de participation ratio en capas 9, 12 y 15 permiten analizar cómo se distribuye la representación en redes profundas y si el colapso de rango es deseable o patológico.
- Reproducción de experimentos de estabilidad: el contraste entre el modelo anclado (PPL 162,24) y el control D=1296 (PPL 266,27) tras SFT puede replicarse para validar la hipótesis de "blindaje de frontera dual".
- Generación de texto de dominio científico-técnico: dado el entrenamiento sobre FineWeb-Edu, puede emplearse para completar pasajes de física o matemáticas, aunque sin garantías de calidad por falta de benchmarks.
- Docencia y divulgación: como ejemplo didáctico de cómo se documenta (y se cuestiona) una arquitectura de investigación con afirmaciones teóricas fuertes y validación limitada.
- Exploración de tokenizers alternativos: el uso del tokenizer Cosmo2 permite estudiar el impacto de un vocabulario de 49152 tokens en modelos de escala media.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la model card son de perplejidad en WikiText-103, no comparables directamente con benchmarks estándar (MMLU, HumanEval, GSM8K), que no se han publicado.

| Metrica | RMSN-425M (M=3) | Control D=1296 (frontera abierta) | RMSN M=1 |
|---|---|---|---|
| WikiText-103 PPL (pre-entrenamiento) | 90,37 | no disponible | 81,04 |
| WikiText-103 PPL (tras 5.000 pasos SFT) | 162,24 | 266,27 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (425M × 4 bytes), más overhead de activaciones y del tokenizer; en la práctica, entre 2 y 4 GB según longitud de secuencia.
- VRAM estimada en fp16/bf16: aproximadamente 0,85 GB para pesos; entre 1,5 y 2,5 GB con activaciones.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB (RTX 3050, RTX 4060, RTX 3060) es suficiente para inferencia en precisión reducida; para entrenamiento o SFT se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que requiere la implementación propietaria `rmsn_core` y carga manual del checkpoint .pt. El despliegue estándar es mediante PyTorch y el código de ejemplo de la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-425M-CasimirCascade-Base | 425M | no disponible | solo PPL WikiText-103 | MIT | Hugging Face (0 descargas) |
| GPT-2 medium | 355M | 1024 | benchmarks públicos amplios | MIT | Hugging Face, ampliamente soportado |
| Pythia-410M | 410M | 2048 | benchmarks públicos (EleutherAI) | Apache 2.0 | Hugging Face, transformers nativo |
| SmolLM-360M | 360M | 2048 | benchmarks públicos | Apache 2.0 | Hugging Face, transformers nativo |

La comparación es desfavorable en madurez de ecosistema: los tres alternativos son compatibles con transformers, vLLM y llama.cpp, tienen benchmarks reproducibles y comunidades activas, mientras que RMSN requiere código propio y carece de validación externa.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene diálogos de forma fiable.
- Sin benchmarks estándar publicados: no es posible evaluar su calidad frente a alternativas consolidadas.
- Afirmaciones teóricas no verificadas de forma independiente: la "cascada de singularidades de Casimir", la "ley de repulsión" y la verificación en BlueQubit QCPU no cuentan con evidencia reproducible en la información disponible.
- Requiere código propietario (`rmsn_core`) no publicado en el repositorio de Hugging Face; el ejemplo de carga usa `torch.load(..., weights_only=False)`, lo que implica riesgos de seguridad al cargar checkpoints de origen no verificado.
- Riesgo elevado de alucinación y de texto incoherente por el escaso tamaño (425M) y la falta de ajuste.
- Idiomas: entrenado sobre FineWeb-Edu (mayoritariamente inglés); el castellano no está garantizado.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y de validación hace desaconsejable su uso en producción.
- Cero descargas y cero likes en el momento de la ficha: sin señal de adopción ni revisión por la comunidad.
- El tokenizer es externo (`HuggingFaceTB/cosmo2-tokenizer`); debe verificarse su disponibilidad y compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-425M-CasimirCascade-Base
- GitHub del proyecto: https://github.com/DuoNeural/RMSN
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- Tokenizer Cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Licencia MIT: https://opensource.org/licenses/MIT
- Cita (BibTeX en model card): Caldwell, Jesse; Archon; Aura (2026), "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics", DuoNeural Lab Preprints, Zenodo (sin DOI en la información disponible).
