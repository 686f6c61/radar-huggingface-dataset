# IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-NanoPlus-GGUF

## Resumen

Qwen3.8-27B-EfficientThink Uncensored VAL-APEX-I NanoPlus es una cuantización GGUF de un modelo de lenguaje de 27.320.697.856 parámetros derivado de la familia Qwen3.8 y afinado por el usuario nerkyor. El modelo base combina SFT sintético, optimización con SIMPO y decodificación especulativa DFlash2, y ha sido cuantizado por IsValorum mediante su método propietario VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization). El resultado es un fichero de 11,18 GB con 3,27 BPW que aspira a caber en el segmento de 11-12 GB de VRAM.

La relevancia de esta ficha reside en que se trata de una cuantización agresiva de un modelo de razonamiento con supuesto contexto nativo de 256K, pensada para ejecución local con llama.cpp. El autor reporta una perplejidad WikiText-2 de 5,6504 ± 0,4832 y afirma haber corregido inestabilidades de estado recurrente y mezcla de idiomas presentes en builds anteriores. No obstante, la información pública disponible es escasa: no hay benchmarks independientes completos, no se detalla la composición del dataset de entrenamiento y la model card está dominada por material promocional.

Se distribuye bajo licencia Apache 2.0, declara únicamente inglés como idioma soportado y está etiquetado como "uncensored", lo que implica que los filtros de seguridad del modelo original han sido reducidos o eliminados. Es, por tanto, una opción a evaluar con cautela para despliegues en producción que requieran salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8), con soporte de decodificación especulativa DFlash2 y MTP; detalles de capas y atención no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (contexto nativo declarado por el autor); no verificado de forma independiente |
| Tipos de cuantizacion | GGUF con perfil VAL-APEX-I NanoPlus V3 (3,27 BPW, 11,18 GB); otras variantes MiniPlus V3 (13,91 GB) disponibles en el ecosistema del autor |
| Idiomas soportados | Inglés (declarado); el autor afirma haber eliminado la mezcla de idiomas no deseada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); 866 tensores auditados según el autor |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3B parámetros de la familia Qwen3.8, afinado por nerkyor con una pipeline que, según los tags y la model card, incluye SFT sobre datos sintéticos generados por modelos frontera (referidos como Opus 5, Grok 4.6/4.7, GPT 5.6 Sol y DeepSeek V4 Pro), optimización preferencial con SIMPO y soporte de Multi-Token Prediction (MTP) junto con decodificación especulativa DFlash2. El nombre del modelo base encadena múltiples etapas (Coder390, EfficientThink, RLOO, MTP, DFlash2), lo que sugiere un proceso de entrenamiento por fases sucesivas, aunque no se publica el número de tokens, la composición exacta del dataset ni los detalles del pipeline de RL.

La contribución propia de esta ficha es la cuantización VAL-APEX-I, un esquema asimétrico por capas que preserva outliers y tiene en cuenta el estado recurrente, calibrado con matrices de imatrix. El autor reporta 866 tensores auditados y un mapa tensorial certificado (`tensor-map.tsv`) con asignaciones de precisión por tensor. La versión V3 corrige, según la model card, problemas de inestabilidad de estado recurrente, degradación de contexto largo y mezcla de idiomas de builds previas. No se dispone de información independiente que verifique estas afirmaciones.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento explícito (chain-of-thought) y "reasoning effort" configurable mediante plantilla de chat endurecida.
- Razonamiento multi-paso y matemáticas, derivado del entrenamiento EfficientThink y del SFT sintético sobre trazas de modelos frontera.
- Generación de código, con advertencias específicas del autor sobre penalización de repetición para evitar intercambio de caracteres en sintaxis.
- Contexto largo declarado de 256K tokens, con supuesta recuperación asociativa restaurada en la versión V3.
- Compatibilidad con decodificación especulativa DFlash2 y MTP para acelerar la inferencia.
- Soporte de plantilla de chat para uso agéntico ("Hardened Agentic Chat Template").
- Modelo "uncensored": se han reducido los rechazos de seguridad del modelo original.
- No se documenta soporte de tool calling nativo, visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Razonamiento local con contexto largo: análisis de documentos extensos o bases de código de hasta 256K tokens en una máquina con ~12 GB de VRAM, aprovechando la cuantización de 3,27 BPW para mantener el modelo en memoria.
- Asistencia de programación en local: generación y revisión de código en inglés dentro de entornos sin conexión, con la precaución de ajustar la penalización de repetición según la advertencia del autor para evitar corrupción de sintaxis.
- Experimentación en investigación sobre cuantización: el mapa tensorial certificado y las métricas de perplejidad publicadas permiten estudiar el impacto de esquemas asimétricos con preservación de outliers en modelos de 27B.
- Prototipado de agentes conversacionales: la plantilla de chat agéntica y el modo de razonamiento permiten construir flujos multi-paso en inglés, siempre que se validen las salvaguardas por cuenta del integrador.
- Evaluación comparativa de decodificación especulativa: el soporte de DFlash2 y MTP permite medir aceleraciones de throughput en llama.cpp frente a decodificación autoregresiva estándar.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en el segmento de 11-12 GB, es viable en GPUs como la RTX 3060 de 12 GB o la RTX 4070, para tareas de generación de texto y razonamiento sin requisitos de alta concurrencia.
- Generación de contenido sin filtros en entornos controlados: para investigación sobre alineación y comportamiento de modelos, dado su carácter "uncensored", con las advertencias de seguridad correspondientes.

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| WikiText-2 PPL | 5,6504 ± 0,4832 | Model card del autor (cuantización NanoPlus V3) |
| Tamano de fichero | 11,18 GB (10,41 GiB) | Model card del autor |
| BPW (bits por peso, fichero completo) | 3,27 | Model card del autor |
| Tensores auditados | 866 | Model card del autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona una sección de "Independent Community Benchmarks (NanoBench v0.4.0)", pero su contenido no está incluido en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11-12 GB para el fichero NanoPlus V3 de 11,18 GB, más overhead de contexto KV; con 256K tokens de contexto la caché KV puede requerir varios GB adicionales según la configuración de llama.cpp.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 / 4070 Ti, RTX 4080, y GPUs de datacenter como A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en GPUs de 8 GB requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por compatibilidad de endpoints, servidores compatibles con la API de OpenAI; el autor menciona SGLang y vLLM en el ecosistema upstream, aunque para GGUF el runtime de referencia es llama.cpp. No se confirma soporte de Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El soporte de decodificación especulativa DFlash2 y MTP está orientado a mejorar el throughput, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B EfficientThink VAL-APEX-I NanoPlus V3 (este) | 27,3B | 256K (declarado) | GGUF, 11,18 GB, 3,27 BPW | Apache 2.0 | PPL WikiText-2 5,6504; uncensored |
| Qwen3.8-27B EfficientThink VAL-APEX-I MiniPlus V3 | 27,3B | 256K (declarado) | GGUF, 13,91 GB | Apache 2.0 | Misma base, mayor precisión; PPL no disponible |
| Qwen3.8 27B VAL-APEX-I NanoPlus V3 (no EfficientThink) | 27,3B | no disponible | GGUF, 12,18 GB | Apache 2.0 | Variante sin el ajuste EfficientThink; PPL no disponible |
| Modelo base nerkyor/Qwen3.8-27B-...-DFlash2 | 27,3B | 256K (declarado) | Safetensors (repo de 85,6 GB) | Apache 2.0 | Pesos sin cuantizar; benchmarks no disponibles |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (por ejemplo, Llama o Mistral de tamano similar) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": los filtros de seguridad han sido reducidos o eliminados, lo que aumenta el riesgo de generar contenido dañino, sesgado o legalmente problemático; no es adecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- Solo declara inglés; aunque el autor afirma haber eliminado la mezcla de idiomas, no hay verificación independiente del comportamiento multilingüe.
- Riesgo de alucinación inherente a los modelos de 27B y acentuado por el entrenamiento sobre datos sintéticos generados por otros modelos.
- La model card está dominada por contenido promocional y enlaces de donación; las afirmaciones sobre corrección de inestabilidades y fidelidad de razonamiento no están respaldadas por evaluaciones independientes publicadas en la información disponible.
- El contexto de 256K es una declaración del autor; no se confirma la calidad de la recuperación a esa longitud ni el coste real de memoria KV.
- El autor advierte sobre problemas de sintaxis en código si no se ajusta la penalización de repetición, lo que indica fragilidad en generación de código.
- La licencia Apache 2.0 permite uso comercial, pero el integrador asume la responsabilidad sobre el contenido generado por un modelo sin salvaguardas.
- La cuantización a 3,27 BPW puede degradar tareas sensibles a precisión; la única métrica publicada es perplejidad en WikiText-2, insuficiente para evaluar razonamiento o código.
- El ecosistema de variantes del autor es amplio y cambiante, con builds retiradas; conviene fijar la versión exacta (V3) en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Variante MiniPlus V3 del mismo modelo: https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante NanoPlus V3 del modelo estándar: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante MiniPlus V3 del modelo estándar: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Swift-1.5 Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante Huihui Abliterated MiniPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante Huihui Abliterated NanoPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-V3-GGUF
- Coleccion MiniPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663
- Coleccion MiniPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6
- Coleccion NanoPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64
- Coleccion NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
