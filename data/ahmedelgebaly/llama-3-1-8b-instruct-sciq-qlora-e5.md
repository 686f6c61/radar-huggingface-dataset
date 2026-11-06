# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e5

## Resumen

Llama-3.1-8B-Instruct-SciQ-QLoRA-e5 es un adaptador PEFT de tipo QLoRA entrenado sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Lo desarrolla el usuario ahmedelgebaly y su proposito es especializar el modelo base en generacion de respuestas de tipo pregunta-respuesta cientifica (science QA) siguiendo el formato Alpaca. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador LoRA que debe combinarse con el modelo base original para su uso.

El adaptador se ha entrenado durante 5 epocas (1300 pasos) sobre el dataset ahmedelgebaly/SciQ_Alpaca, derivado del corpus SciQ, con una perdida de validacion de 1,2438 y una perplejidad de validacion de 3,4687. Forma parte de una ablacion de epocas (e1 a e5) en la que el propio autor recomienda la version e2 por presentar la menor perdida de validacion, por lo que esta e5 debe considerarse principalmente como material de comparacion experimental.

Su relevancia es limitada: se publica como parte de un escenario academico (AAST Scenario3.1) y no presenta benchmarks publicados ni datos de idiomas. Resulta util como ejemplo reproducible de ajuste fino QLoRA con Axolotl sobre Llama 3.1 y como adaptador ligero para tareas de QA cientifico en ingles, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Llama-3.1-8B-Instruct) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA es un subconjunto (r=16, tamano de repo 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador (el modelo base Llama 3.1 soporta 128k tokens) |
| Tipos de cuantizacion | Entrenado en QLoRA 4-bit NF4; el adaptador se distribuye en safetensors (el modelo fusionado admitiria cuantizaciones del base) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only denso de 8B parametros (Llama 3.1), mediante QLoRA con cuantizacion 4-bit NF4 del modelo base. La configuracion LoRA emplea r=16, alpha=32 y dropout de 0,05. El entrenamiento se realizo con Axolotl y PEFT durante 5 epocas, 1300 pasos, longitud de secuencia de 512 tokens, tasa de aprendizaje de 2e-4 con scheduler coseno y tamano de lote efectivo de 16. Los resultados de validacion reportados son perdida 1,2438 y perplejidad 3,4687.

El dataset de entrenamiento es ahmedelgebaly/SciQ_Alpaca, una version en formato Alpaca (instruction / input / output) del corpus SciQ, orientada a preguntas de ciencia con respuesta. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni fases de RLHF o DPO. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras); se trata de un ajuste fino supervisado convencional.

## Capacidades

- Generacion de texto y respuesta a preguntas de tipo cientifico en formato instruccion, heredadas del ajuste sobre SciQ_Alpaca.
- Razonamiento basico y respuesta conversacional, procedentes del modelo base Llama-3.1-8B-Instruct.
- Generacion de codigo y matematicas a nivel del modelo base (no reforzadas por este adaptador).
- Soporte de tool calling / function calling heredado del modelo base, aunque no documentado ni validado para este adaptador.
- Capacidades de agente y razonamiento multi-paso limitadas al comportamiento del base; no se han evaluado tras el ajuste.
- Capacidades multilingues: no disponibles en la informacion del adaptador (el base soporta varios idiomas, pero el ajuste se realizo sobre un dataset en ingles).
- No dispone de vision, audio ni modos de pensamiento (thinking) documentados.

## Casos de uso

- Preguntas y respuestas de ciencia en ingles: el adaptador se ha entrenado especificamente sobre SciQ_Alpaca, por lo que es adecuado para responder cuestionarios de fisica, quimica o biologia en formato instruccion, siempre cargandolo junto al modelo base.
- Generacion de material educativo: puede producir pares pregunta-respuesta para bancos de ejercicios o fichas de estudio, dado el formato Alpaca del dataset de entrenamiento.
- Evaluacion de estrategias de ajuste fino: sirve como punto de comparacion en ablaciones de epocas (junto a e1-e4) para estudiar el efecto del sobreentrenamiento en QLoRA.
- Prototipado de asistentes de divulgacion cientifica: combinado con el base, permite desplegar un asistente ligero de preguntas frecuentes cientificas en entornos de investigacion.
- Reproduccion academica: util como referencia reproducible de un pipeline Axolotl + PEFT con hiperparametros documentados para cursos o talleres.
- Experimentos de destilacion de formato: el adaptador puede emplearse para estudiar como un ajuste pequeno modifica el estilo de respuesta del base en dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se reportan metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,2438 |
| Perplejidad de validacion | 3,4687 |
| Epocas | 5 |
| Pasos de entrenamiento | 1300 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa 0,2 GB, pero requiere cargar el modelo base de 8B. En FP16 se necesitan aproximadamente 16 GB de VRAM; en cuantizacion 4-bit, alrededor de 5-6 GB.
- GPU recomendadas: A100 o H100 para despliegue en FP16 con throughput alto; RTX 4090 (24 GB) para FP16 o cuantizacion; RTX 3090/4080 (16-24 GB) para cuantizacion 4/8-bit.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion 4-bit del modelo base fusionado.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM o TGI tras fusionar el adaptador con el base (merge_and_unload), llama.cpp u Ollama tambien tras fusion y conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e5 | 8B (base) + adaptador | no disponible (base: 128k) | Adaptador QLoRA | llama3.1 | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e2 | 8B (base) + adaptador | no disponible (base: 128k) | Adaptador QLoRA | llama3.1 | Hugging Face (recomendado por el autor) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo completo | llama3.1 | Hugging Face (gated) |

La comparacion con otros adaptadores de QA cientifico de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base meta-llama/Llama-3.1-8B-Instruct no puede utilizarse, y el acceso al base esta restringido por la licencia de Meta (gated).
- El autor recomienda la version e2 (menor perdida de validacion); e5 puede presentar sobreajuste por el mayor numero de epocas.
- Entrenado exclusivamente sobre SciQ_Alpaca en formato Alpaca; fuera del dominio de QA cientifico su comportamiento puede degradarse respecto al base.
- No se documentan idiomas soportados; el dataset de entrenamiento parece estar en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente al modelo base, potencialmente acentuado en preguntas cientificas fuera de la distribucion del dataset.
- No se han publicado evaluaciones de sesgos, seguridad ni benchmarks; no se recomienda su uso en produccion sin validacion propia.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de cualquier despliegue.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Adaptador e1: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e1
- Adaptador e2 (recomendado): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e2
- Adaptador e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3
- Adaptador e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e4
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
