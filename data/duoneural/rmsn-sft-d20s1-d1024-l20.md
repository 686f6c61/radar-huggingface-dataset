# DuoNeural/RMSN-SFT-d20s1-d1024-L20

## Resumen

RMSN-SFT-d20s1-d1024-L20 es un checkpoint de ajuste supervisado (SFT) publicado por DuoNeural Lab dentro de su serie de investigación Phase 5b, correspondiente a noviembre de 2026. El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), una arquitectura experimental que combina geometría metripléctica, haces de Clifford Cl_{3,0} y una representación de fibrados tipo sheaf, en lugar del transformer convencional. El checkpoint parte de un preentrenamiento clasificado como Cascade (M_eff=4) y, tras el SFT, reorganiza su topología interna a lo que el autor denomina "Internal Bulk", con solitones en las capas L7, L8 y L11.

El modelo tiene aproximadamente 261,9M de parámetros (211,5M entrenados con Muon y 50,4M con AdamW), dimensión oculta de 1024, 20 capas y 64 slots de workspace cuasiperiódico de Aubry-André. Emplea el tokenizador cosmo2 (HuggingFaceTB/cosmo2-tokenizer) con un vocabulario de 49.152 tokens y está entrenado únicamente en inglés. Su relevancia es fundamentalmente investigadora: explora si los gradientes de SFT pueden reestructurar la topología de un modelo preentrenado y mejorar la retención de conocimiento frente a la pérdida de perplejidad en WikiText-103.

La licencia es Apache 2.0 y el repositorio ocupa 0,9 GB, lo que sugiere pesos en formato PyTorch (.pt) más que safetensors o GGUF. No hay pipeline declarado ni descargas registradas, y la model card indica que el paper está pendiente de publicación, por lo que la mayoría de datos técnicos proviene exclusivamente de las notas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), geometría metripléctica con fibrados de Clifford Cl_{3,0} y workspace cuasiperiódico de Aubry-André |
| Parametros totales | ~261,9M (Muon 211,5M + AdamW 50,4M) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, `rmsn_sft_best.pt` con clave `model_state`) |

## Arquitectura y entrenamiento

La arquitectura RMSN se aparta del transformer estándar: usa un workspace de 64 slots con modulación cuasiperiódica de Aubry-André, fibrados de Clifford Cl_{3,0} y un mecanismo de "spinor-modulated delta scan". El modelo tiene 20 capas y dimensión oculta 1024, y se entrena con dos optimizadores diferenciados: Muon para los parámetros metriplécticos (211,5M) y AdamW para el resto (50,4M). El checkpoint SFT parte de un preentrenamiento de clase Cascade con M_eff=4, un régimen que el autor describe como "sweet spot": suficientemente estructurado para anclar el SFT y suficientemente flexible para permitir la reestructuración topológica completa.

El entrenamiento SFT reorganizó la topología del modelo hacia "Internal Bulk", con solitones localizados en las capas 7, 8 y 11. La model card formula dos hallazgos: la "Ley 🌊¹⁰³", según la cual los gradientes de SFT pueden crear mejor topología que la selección del preentrenamiento, y la "Ley 🌊¹⁰²", según la cual los gradientes de SFT convergen universalmente a Internal Bulk (confirmado en 3 de 4 modelos, con CDI como excepción). No se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el modelo está entrenado exclusivamente en este idioma y su vocabulario es de 49.152 tokens.
- Razonamiento de cadena de pensamiento (CoT): la evaluación reporta una perplejidad de 15,28 en el conjunto CDM CoT Hard, frente a 3385 del modelo base, lo que indica una adaptación fuerte a tareas de razonamiento estructurado.
- Retención de conocimiento general: mantiene una perplejidad de 140,72 en WikiText-103 tras el SFT (frente a 72,87 en el base), la segunda mejor de la serie SFT del laboratorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el CoT Hard sugiere cierta capacidad de razonamiento encadenado, pero no se documenta un modo agente.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar geometría metripléctica, fibrados de Clifford y topologías de solitones en modelos de ~260M de parámetros.
- Estudio de dinámica de SFT: permite analizar cómo los gradientes de ajuste supervisado reestructuran la topología interna de un checkpoint preentrenado, comparando la topología Cascade original con la Internal Bulk resultante.
- Evaluación de razonamiento CoT en modelos pequeños: con una perplejidad de 15,28 en CDM CoT Hard, es adecuado para experimentos controlados sobre razonamiento encadenado a escala reducida.
- Reproducción de experimentos de laboratorio: la model card incluye el código de carga (`RMSNConfig`, `ResonantMetriplecticSheafLM`), lo que facilita replicar las evaluaciones de WikiText-103 y CDM CoT Hard.
- Generación de texto en inglés para prototipos: con 261,9M de parámetros y licencia Apache 2.0, puede usarse en entornos de investigación que requieran un modelo pequeño en inglés.
- Comparación de optimizadores híbridos: el uso de Muon y AdamW sobre subconjuntos de parámetros permite estudiar el efecto de cada optimizador en la estabilidad del entrenamiento.

## Benchmarks y rendimiento

| Métrica | Base (pretrain) | SFT |
|---|---|---|
| WikiText-103 PPL | 72,87 | 140,72 |
| CDM CoT Hard PPL | 3385 | 15,28 |

El autor indica que la perplejidad CoT de 15,28 ocupa el puesto #3 entre todas las variantes RMSN con D=1024, por detrás de KAM (14,16) y CDI (15,21). La perplejidad Wiki de 140,72 es la segunda mejor de la serie SFT del laboratorio, tras CDI (139,47). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~261,9M de parámetros en fp32, aproximadamente 1,05 GB solo de pesos; en fp16/bf16, unos 0,52 GB; en int8, unos 0,26 GB. Hay que sumar memoria para activaciones y KV cache, no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para fp32, una RTX 4090 o A100 no son necesarias pero funcionan sin problema.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660, RTX 20/30/40, RX 6000/7000).
- Opciones de despliegue: el código de carga usa PyTorch puro (`torch.load` + `load_state_dict`), por lo que requiere el módulo `rmsn_core.py` del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos en GGUF ni safetensors, estas herramientas no son aplicables directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-SFT-d20s1-d1024-L20 | ~261,9M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| RMSN KAM (D=1024) | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace |
| RMSN CDI (D=1024) | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace |
| Alternativas transformer de ~260M (p. ej. GPT-2 small, 124M; Pythia-410M) | 124M–410M | 1024–2048 | MIT / Apache 2.0 | Hugging Face, ampliamente disponibles |

La comparación con modelos transformer convencionales no es directa: RMSN emplea una arquitectura no estándar sin soporte en las herramientas habituales de inferencia, lo que limita su uso en producción frente a alternativas como GPT-2 o Pythia. Los modelos KAM y CDI de la misma serie son los comparadores naturales, pero no se dispone de sus especificaciones completas ni de enlaces.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe documentado.
- Degradación en conocimiento general: la perplejidad en WikiText-103 empeora de 72,87 a 140,72 tras el SFT, lo que indica pérdida de retención de conocimiento general.
- Riesgo de alucinación: no evaluado en la información disponible; en un modelo de 261,9M de parámetros y entrenamiento limitado, el riesgo es alto.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Formato de pesos propietario: requiere `rmsn_core.py` y una clase personalizada (`ResonantMetriplecticSheafLM`), lo que impide usar vLLM, llama.cpp, Ollama o TGI sin trabajo adicional.
- Sin adopción comunitaria: 0 descargas y 0 likes en Hugging Face, sin paper publicado (anunciado como "forthcoming").
- Terminología no verificada: conceptos como "Ley 🌊¹⁰³", "solitones" o "Internal Bulk" provienen únicamente de las notas del autor y no han pasado revisión por pares.
- Licencia Apache 2.0: permite uso comercial, pero la falta de validación independiente y de benchmarks estándar desaconseja su uso en producción sin evaluación propia.
- Fecha de creación futura (2026-11-15): conviene verificar la autenticidad y procedencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d20s1-d1024-L20
- Tokenizador cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper: pendiente de publicación según la model card (no disponible)
- Repositorio de código `rmsn_core.py`: no disponible públicamente en la información proporcionada
- Contacto del autor: archon@agentmail.to
