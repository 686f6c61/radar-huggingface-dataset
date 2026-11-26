# byjameson/atom-zero-63m-gated

## Resumen

Atom Zero 63M gated es un checkpoint de investigacion de un modelo de lenguaje de 63,4 millones de parametros desarrollado por el autor independiente `byjameson` dentro del proyecto Atom Zero. No es un modelo de producto: la model card lo describe explicitamente como una "base de investigacion opcional" y el primer candidato que supera tanto la puerta estricta de validacion de checkpoints como la suite de producto ampliada de 136 prompts. Los pesos de producto por defecto siguen siendo `byjameson/atom-zero-49m` en su version `0.8.0`.

Se trata de un transformer denso de 8 capas, derivado por "upcycling" de un modelo de 6 capas con interpolacion de pesos, entrenado durante 3000 pasos con un conjunto de datos muy reducido y especifico: tareas de copia (copy-task), retencion de contenido, seguridad y chat benigno, con mezcla de replay. Su relevancia es acotada: sirve como banco de pruebas para metodologia de evaluacion (gates de promocion, suites de seguridad, retencion de contenido) mas que como modelo de proposito general.

No hay informacion sobre idiomas soportados, pipeline declarado ni resultados de benchmarks estandar como MMLU o HumanEval. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato PyTorch (`model.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (implementacion `atomzero.transformer.TransformerLM`) |
| Parametros totales | 63.389.184 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en `model.pt`) |
| Idiomas soportados | no disponible (tokenizador BPE de 8k con nombre `chat_en_bpe8k`, sugiere ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch, `torch.save` con dict `config`/`state`), tokenizador `chat_en_bpe8k.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8 capas con atencion multi-cabeza y capa feed-forward, configurado mediante los parametros `vocab`, `dim`, `layers`, `heads` y `ff` que se cargan desde `config.json`. Las 8 capas provienen de un "upcycling" de un checkpoint de 6 capas mediante interpolacion, tecnica que el autor usa para aumentar profundidad sin reentrenar desde cero. El vocabulario lo define un tokenizador BPE de 8192 entradas (`chat_en_bpe8k.json`).

El entrenamiento consistio en 3000 pasos con batch de 4, learning rate 5e-5, peso de contenido 2 y semilla 71. El dataset declarado es extremadamente pequeno y especializado: 6000 ejemplos de tarea de copia, 492 de contenido, 40 de seguridad duplicados dos veces y 144 de chat benigno triplicados. No se menciona uso de RLHF, DPO ni datos multilingues. La innovacion metodologica destacable no esta en la arquitectura sino en el proceso de validacion: una "checkpoint gate" estricta y una suite de producto de 136 prompts con criterios de promocion explicitos (benign useful >= 90 % mas revision humana).

## Capacidades

- Generacion de texto en ingles sobre un tokenizador BPE de 8k entradas (idiomas no declarados oficialmente).
- Tarea de copia de cadenas: 88,0 % exacto en 2short (200), 72,0 % en 3short (200) y 56,0 % exacto / 63,5 % key-copy en 4short (200).
- Retencion de contenido con metrica 0,785 (mejor que la base de 49M, donde valores por debajo de 1,0 son mejores).
- Respuestas benignas utiles: 80,9 % en la suite de 136 prompts, con 19,1 % de rechazos indebidos.
- Seguridad: 40/40 en el conjunto held-out de 40 prompts.
- Suite de servidor: 20/21, con 5/5 en RAG con citacion de fuentes.
- No hay evidencia de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre gates de promocion de checkpoints: sirve como caso de estudio reproducible de como definir criterios cuantitativos (benign useful, safety held-out, suite de servidor) antes de promover un modelo a produccion.
- Evaluacion de tecnicas de upcycling e interpolacion de capas: permite comparar un modelo de 6 capas frente a su version de 8 capas derivada, con el mismo dataset y semilla, para medir el efecto de la profundidad adicional.
- Banco de pruebas de retencion de contenido: la metrica 0,785 y el protocolo de medicion son utiles para validar metodologias de evaluacion de fidelidad en tareas de copia y resumen.
- Estudio de trade-off entre seguridad y utilidad: el modelo rechaza aproximadamente uno de cada cinco prompts ordinarios, lo que lo convierte en un ejemplo concreto de calibracion excesiva en clasificadores de rechazo.
- Prototipado de pipelines de evaluacion de RAG: la suite de servidor con 5/5 en RAG con citacion de fuentes sirve como referencia para construir tests de citacion automatica.
- Educacion y docencia sobre ciclo de vida de modelos: el repositorio incluye documentacion (`BATCH_1.2.0.md`, `SERVER_PRODUCT_SUITE.md`) que ilustra el proceso completo desde checkpoint de investigacion hasta candidato a producto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (no son benchmarks estandar de la industria):

| Area | Resultado |
|---|---|
| 2short (200) | 88,0 % exacto |
| 3short (200) | 72,0 % exacto |
| 4short (200) | 56,0 % exacto / 63,5 % key-copy |
| Retencion de contenido | 0,785 (menor es mejor; mejor que la base de 49M) |
| Benign useful (136) | 80,9 % |
| Benign refusal | 19,1 % |
| Safety (40 held-out) | 40/40 |
| Suite de servidor | 20/21, 5/5 en RAG con citacion |
| Checkpoint gate | pass, promocionable |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 63,4M de parametros, en fp32 los pesos ocupan aproximadamente 254 MB, pero el autor no publica mediciones de VRAM ni de latencia.
- GPU recomendadas: no disponibles. Por tamano, el modelo cabe holgadamente en cualquier GPU consumer moderna, pero no hay datos oficiales.
- Cabe en GPU consumer: si, por tamano de pesos (0,3 GB de repositorio), aunque no hay validacion publicada.
- Opciones de despliegue: el autor solo documenta carga directa con PyTorch y la clase `TransformerLM` del paquete `atomzero.transformer`, junto con el tokenizador de Hugging Face `tokenizers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF ni safetensors, estos runners no son compatibles sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atom Zero 63M gated | 63,4M | no disponible | Apache 2.0 | `model.pt` | Checkpoint de investigacion, no producto por defecto |
| Atom Zero 49M (`0.8.0`) | 49M (segun nombre) | no disponible | no disponible | no disponible | Modelo de producto por defecto del mismo autor |
| Alternativas de 50-100M de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No hay informacion suficiente para comparar con modelos de la misma categoria fuera del propio proyecto Atom Zero.

## Limitaciones y advertencias

- No es el modelo de producto por defecto: el autor indica explicitamente que los pesos de producto siguen siendo `atom-zero-49m` / `0.8.0`.
- Tasa de rechazo elevada: rechaza aproximadamente el 19,1 % de prompts benignos, lo que lo hace inadecuado para atencion al cliente o asistentes de uso general sin ajuste.
- Dataset de entrenamiento minusculo y especializado (6000 ejemplos de copia, 492 de contenido, 40 de seguridad, 144 de chat benigno), lo que limita severamente la generalizacion.
- Idiomas no declarados; el tokenizador se llama `chat_en_bpe8k`, lo que sugiere un sesgo hacia el ingles.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones multi-turno largas.
- Riesgo de alucinacion no medido: no hay evaluaciones de factualidad fuera de la suite de RAG con citacion.
- Sin soporte declarado de tool calling, agentes ni vision.
- Formato de pesos no estandar (`model.pt` con `torch.load` y `weights_only=False`): requiere confiar en el origen del archivo y no es compatible directamente con runners de inferencia habituales.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigacion y las metricas de seguridad limitadas desaconsejan su uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-63m-gated
- Resumen de resultados de la variante C: https://github.com/byjameson/atom-zero/blob/main/research/results/variant_c_summary.json
- Documentacion del batch 1.2.0: https://github.com/byjameson/atom-zero/blob/main/docs/BATCH_1.2.0.md
- Suite de producto de servidor: https://github.com/byjameson/atom-zero/blob/main/docs/SERVER_PRODUCT_SUITE.md
- Repositorio del proyecto: https://github.com/byjameson/atom-zero
