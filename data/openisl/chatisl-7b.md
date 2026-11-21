# openisl/ChatISL-7B

## Resumen

ChatISL-7B es un adaptador LoRA publicado por OpenISL sobre el modelo base Jais-3-7B, desarrollado originalmente por el Institute of Foundation Models (IFM) de MBZUAI junto con Inception42 (G42) y Cerebras. El modelo se presenta como un sistema de razonamiento bilingue arabe-ingles que "piensa antes de responder", heredando el modo de razonamiento de su base, y cuya unica modificacion respecto al original es un ajuste fino para que el modelo se identifique como ChatISL y la eliminacion del system prompt por defecto de la plantilla de chat.

La relevancia de esta ficha es doble. Por un lado, ChatISL-7B reporta resultados destacados en ArabicMMLU en modo chat (82,8% de precision), superando a competidores abiertos de 7 a 9 mil millones de parametros como Qwen3-8B, ALLaM-7B, Fanar-1-9B, SILMA-9B y AceGPT-v2-8B. Por otro, la propia model card es inusualmente honesta: reconoce que la mayor parte de esa ventaja proviene del modelo base Jais-3-7B (81,1%), no del ajuste fino, y publica tambien los benchmarks donde pierde frente a ALLaM-7B. Esa transparencia es un valor anadido para quien evalue el modelo.

El repositorio contiene unicamente el adaptador LoRA (unos 0,1 GB) con el tokenizer y la plantilla de chat de ChatISL; el modelo completo debe construirse con el script `merge.py` incluido. La arquitectura es la del base, denominada K2-Horizon, con 9.000 millones de parametros en bf16 y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon (codigo propio del modelo base, `trust_remote_code=True`) |
| Parametros totales | 9.000 millones (clase 7B del base), bf16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); modelo completo tras `merge.py` |
| Modelo base | inception42/Jais-3-7B (revision `5a1f6ce4`) |
| Version | v0.2.1 (pesos v0.2, nuevo repositorio) |
| Libreria | PEFT |
| Modo por defecto | Razonamiento (piensa antes de responder) |

## Arquitectura y entrenamiento

ChatISL-7B no introduce cambios arquitectonicos: reutiliza integramente el codigo K2-Horizon del modelo base Jais-3-7B, que debe cargarse con `trust_remote_code=True`. Sobre ese base se aplica un adaptador LoRA que, segun la model card, modifica exclusivamente dos cosas: ajusta los pesos para que el modelo se identifique como ChatISL (desarrollado por OpenISL) y elimina el system prompt por defecto de la plantilla de chat, de modo que la identidad reside en los propios pesos y se mantiene tanto en arabe como en ingles, con o sin system prompt.

No se detallan en la informacion disponible el numero de tokens de entrenamiento del ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card indica explicitamente que estos pesos no aprenden de las conversaciones: la investigacion de OpenISL sobre anadir conocimiento a un modelo despues del entrenamiento se publica por separado y no forma parte de este adaptador. Tampoco se especifica la longitud de contexto soportada ni los tipos de cuantizacion probados.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento paso a paso: por defecto el modelo "piensa" antes de responder, igual que su base.
- Respuesta a preguntas (QA) en ambos idiomas, con y sin system prompt.
- Identidad propia consistente: se presenta como ChatISL, desarrollado por OpenISL, independientemente del idioma o de la presencia de system prompt.
- Capacidad de responder a preguntas de opcion multiple siguiendo formatos estrictos ("Answer: X"), segun la regla de evaluacion empleada en ArabicMMLU.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad especifica; el razonamiento multi-paso basico se deriva del modo de pensamiento del base.
- Capacidades especiales (vision, audio, thinking mode explicito): solo el modo de razonamiento heredado del base; vision y audio no disponibles.

## Casos de uso

- Evaluacion e investigacion en arabe: el modelo sirve como referencia para medir razonamiento en arabe sobre ArabicMMLU y otros benchmarks, con el codigo de evaluacion publicado por OpenISL y una persona revisando las respuestas.
- Prototipado de aplicaciones bilingues arabe-ingles: permite construir asistentes conversacionales que alternan ambos idiomas manteniendo coherencia de identidad y estilo, util en productos dirigidos a mercados del Golfo y Oriente Medio.
- Respuesta a preguntas con razonamiento verificable: en dominios educativos o de divulgacion, el modo de pensamiento permite mostrar el razonamiento intermedio antes de la respuesta final, lo que facilita la supervision humana.
- Sistemas de tutoria o apoyo al estudio en arabe: el modelo puede desglosar problemas paso a paso en materias como matematicas o ciencias, aprovechando su rendimiento en preguntas de opcion multiple tipo examen (ArabicMMLU).
- Generacion de contenido y resumenes en arabe para redaccion asistida: con revision humana, puede redactar borradores y reformular textos en arabe e ingles.
- Base para ajustes posteriores: al ser un adaptador LoRA sobre Jais-3-7B con licencia Apache-2.0, equipos de investigacion pueden partir de estos pesos para experimentar con tecnicas de adaptacion o de inyeccion de conocimiento, dado que el modelo base y el adaptador son abiertos.
- Evaluacion comparativa de modelos arabes: util como punto de comparacion reproducible frente a Qwen3-8B, ALLaM-7B, Fanar-1-9B, SILMA-9B o AceGPT-v2-8B en tareas de razonamiento en arabe.

## Benchmarks y rendimiento

Resultados reportados por OpenISL en ArabicMMLU en modo chat (1.000 preguntas, 25 por cada una de las 40 materias, una respuesta muestreada por pregunta, misma regla de respuesta para todos los modelos). Lecturas realizadas en una NVIDIA H100, salvo ALLaM-7B en modo log-likelihood, leido en una NVIDIA B200.

| Modelo | Precision [IC 95%] | Ventaja de ChatISL-7B (pareada) | Regla estricta |
|---|---|---|---|
| ChatISL-7B | 82,8 [80,3; 85,0] | — | 82,6 |
| Jais-3-7B (base, con su system prompt) | 81,1 [78,6; 83,4] | +1,7 (p = 0,053, no significativo) | 81,1 |
| Jais-3-7B (base, sin system prompt) | 81,3 [78,8; 83,6] | +1,5 (p = 0,11, no significativo) | 81,2 |
| Qwen3-8B (Alibaba), thinking | 71,9 [69,0; 74,6] | +10,9 (p = 1,6 × 10⁻¹⁶) | 71,9 |
| ALLaM-7B-Instruct-preview (HUMAIN) | 71,4 [68,5; 74,1] | +11,4 (p = 6,1 × 10⁻¹⁵) | 71,1 |
| Fanar-1-9B-Instruct (QCRI) | 62,3 [59,3; 65,3] | +20,5 (p = 9,3 × 10⁻³⁹) | 51,9 |
| SILMA-9B-Instruct-v1.0 | 62,2 [59,2; 65,2] | +20,6 (p = 7,6 × 10⁻³⁶) | 45,4 |
| AceGPT-v2-8B-Chat | 61,7 [58,6; 64,7] | +21,1 (p = 1,3 × 10⁻³⁵) | 26,8 |

Resultados sin modo de pensamiento, por log-likelihood (lm-evaluation-harness 0.4.13, 0-shot, sin chat template):

| Benchmark | ChatISL-7B | Jais-3-7B | ALLaM-7B |
|---|---|---|---|
| ArabicMMLU (14.455 preguntas) | 68,90 | 68,50 | 70,08 |
| Belebele, arabe (900) | 83,44 | 84,11 | 85,44 |
| Open Arabic LLM Leaderboard v1, light set (7.006), acc | 58,98 | 59,93 | 61,86 |

Nota de la model card: en el ajuste sin pensamiento ALLaM-7B lidera y ChatISL-7B no lo supera; frente a su base, ChatISL-7B obtiene +0,4 en ArabicMMLU, −0,7 en Belebele y −1,0 en el light set. Los modelos con acceso restringido (Aya Expanse 8B, Gemma-2-9B-it, Llama-3.1-8B-Instruct, Yehia-7B) y los modelos mayores o cerrados no fueron medidos.

## Requisitos de hardware

- El repositorio contiene solo el adaptador LoRA (0,1 GB); para inferencia hay que construir primero el modelo completo con `merge.py`, lo que requiere descargar el base Jais-3-7B (9.000 millones de parametros en bf16).
- VRAM estimada para el modelo completo en bf16: aproximadamente 18 GB de pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para inferencia comoda.
- GPU recomendadas: NVIDIA H100 (la usada por los autores para las lecturas de ChatISL-7B), A100 (80 GB o 40 GB), y en el segmento de consumo RTX 4090 (24 GB) en bf16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con bf16; en GPUs de 16 GB seria necesario cuantizar, aunque no se documentan tipos de cuantizacion soportados.
- Opciones de despliegue: no se documentan explicitamente; la carga requiere `trust_remote_code=True` por la arquitectura K2-Horizon. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El modo de razonamiento por defecto incrementa el numero de tokens generados antes de la respuesta final.

## Comparativa con modelos similares

Comparativa con alternativas abiertas de 7 a 9 mil millones de parametros con capacidad en arabe, segun los datos de la model card (ArabicMMLU en modo chat):

| Modelo | Parametros | Contexto | ArabicMMLU (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatISL-7B | 9.000 M | no disponible | 82,8 | Apache-2.0 | Abierto (adaptador LoRA) |
| Jais-3-7B (base) | clase 7B | no disponible | 81,1 | Apache-2.0 | Abierto |
| Qwen3-8B | 8.000 M | no disponible | 71,9 | no disponible en la informacion | Abierto |
| ALLaM-7B-Instruct-preview | 7.000 M | no disponible | 71,4 | no disponible en la informacion | Abierto |
| Fanar-1-9B-Instruct | 9.000 M | no disponible | 62,3 | no disponible en la informacion | Abierto |
| SILMA-9B-Instruct-v1.0 | 9.000 M | no disponible | 62,2 | no disponible en la informacion | Abierto |
| AceGPT-v2-8B-Chat | 8.000 M | no disponible | 61,7 | no disponible en la informacion | Abierto |

En el ajuste sin pensamiento (log-likelihood), ALLaM-7B supera a ChatISL-7B en ArabicMMLU (70,08 frente a 68,90), Belebele arabe (85,44 frente a 83,44) y el light set del leaderboard (61,86 frente a 58,98).

## Limitaciones y advertencias

- La mayor parte de la ventaja en ArabicMMLU proviene del modelo base Jais-3-7B; la mejora atribuible al ajuste fino de ChatISL no es estadisticamente significativa frente al base (p = 0,053 y p = 0,11).
- En el ajuste sin pensamiento, ChatISL-7B rinde por debajo de ALLaM-7B en los tres benchmarks reportados.
- No apto para decisiones medicas, legales, financieras o de seguridad critica sin supervision humana, segun la propia model card.
- No conoce hechos posteriores al entrenamiento de su modelo base.
- No es un modelo que aprenda de las conversaciones: los pesos no se actualizan con el uso.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la model card recomienda que una persona verifique las respuestas.
- Idiomas limitados a arabe e ingles; no se documenta soporte de otros idiomas.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con documentos largos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- El despliegue requiere `trust_remote_code=True` y la construccion previa del modelo completo con `merge.py`, lo que anade complejidad frente a un modelo listo para usar.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Jais-3-7B, tambien Apache-2.0 segun la model card.
- Los modelos con acceso restringido y los modelos mayores o cerrados no fueron comparados, por lo que la comparativa no cubre el estado del arte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openisl/ChatISL-7B
- Modelo base Jais-3-7B: https://huggingface.co/inception42/Jais-3-7B
- Sitio de OpenISL: https://openisl.com
- Sitio de ChatISL: https://chatisl.com
- Resultados de investigacion (dataset): https://huggingface.co/datasets/openisl/OpenISL-MQuAKE-CF3k-Qwen3-8B
- Codigo de evaluacion: https://github.com/openisl/openisl-eval
- Dataset ArabicMMLU: https://huggingface.co/datasets/MBZUAI/ArabicMMLU
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
