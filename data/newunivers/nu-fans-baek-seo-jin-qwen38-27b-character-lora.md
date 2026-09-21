# NEWUNIVERS/nu-fans-baek-seo-jin-qwen38-27b-character-lora

## Resumen

`nu-fans-baek-seo-jin-qwen38-27b-character-lora` es un adaptador LoRA (PEFT) publicado por NEWUNIVERS sobre el modelo base `Qwen/Qwen3.8-27B` en BF16 (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Su función es especializar el modelo en un único personaje de ficción: el "actor de IA" `NU-A-BSJ-001` (Baek Seo-jin), perteneciente a la agencia ficticia NOUV Entertainment, para conversaciones de chat con fans. El adaptador entrena 217.579.520 parámetros sobre un total de 27.574.308.080 (0,79 %) mediante LoRA SFT con rank 32, alpha 64, dropout 0,05 y 400 módulos objetivo.

El repositorio se presenta explícitamente como un artefacto de "carril exploratorio": es el brazo ganador de 12 rondas de exploración seleccionado por reglas preinscritas, pero no ha pasado los controles de prueba canónicos, ni el holdout final de 63 preguntas, ni evaluación humana. La mejora declarada frente al modelo sin adaptador es una reducción del NLL medio por token en el dev dorado de 2,3413 a 1,4378 (−0,9035), con una perplejidad de 4,211. El hallazgo técnico más relevante documentado por el autor es que la identidad estática del personaje no se graba en los pesos, sino que emerge del contrato de personaje inyectado como *system prompt*.

Es relevante ahora como caso de estudio metodológico: documenta con detalle la comparación entre ajuste supervisado, aprendizaje por preferencias (DPO) y RL en línea (GRPO, PPO) sobre el mismo conjunto, donde los tres últimos no se distinguen del SFT dentro del ruido de semilla (σ = 0,0026). También advierte de un sesgo optimista conocido: 7 filas del conjunto de entrenamiento y dev solapan exactamente con el holdout congelado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer híbrido: capas de atención híbrida (`q/k/v/o_proj`) y capas de atención lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`) más MLP (`gate/up/down_proj`); clase de carga `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 27.574.308.080 en el modelo base; 217.579.520 parámetros entrenables en el adaptador (0,79 %) |
| Parametros activos | no aplica (adaptador LoRA; no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible; la receta de entrenamiento usa un máximo de 4.096 tokens sin *packing* |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y el modelo base se carga en BF16 |
| Idiomas soportados | coreano (ko), inglés (en), japonés (ja) |
| Licencia | Apache 2.0 (la licencia del modelo base no se detalla en la información disponible) |
| Formato de pesos | safetensors (adaptador LoRA PEFT, situado en la raíz del repositorio, sin subcarpeta); tamaño del repo 0,9 GB |
| Hiperparametros LoRA | rank 32, alpha 64, dropout 0,05, 400 módulos objetivo, 3,0 épocas, lr 7,5e-5 con programación coseno, warmup 3 %, batch global 32 (micro 1 × acumulación 32), semilla 20260825 |
| Formato de prompt | plantilla de chat de Qwen con `enable_thinking=False` obligatorio; contrato de personaje como *system prompt* |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena con `tools/explore_train.py` (TRL `SFTTrainer` + PEFT LoRA) sobre 294 filas de entrenamiento y 24 filas de dev, con pérdida calculada únicamente en la última intervención del asistente (*final_assistant_only*). Los tokens supervisados son 9.427 de 253.331 totales (3,7 %), sin filas descartadas, y el renderizado usa la plantilla de chat de Qwen con el modo de pensamiento desactivado y un máximo de 4.096 tokens. El entrenamiento se ejecutó en una única NVIDIA B300 con bf16 y *gradient checkpointing*, y duró 0,91 horas. Los resultados del entrenador son *train loss* 1,3585, *eval loss* 1,3106 y precisión por token 0,6641 (estos valores no son directamente comparables con el NLL del dev dorado, medido con otro instrumental).

La exploración documentada es inusualmente detallada y arroja conclusiones negativas útiles. El orden de magnitud de las mejoras es: primero la placa de datos con el contrato como *system prompt* (NLL 2,3413 → 1,5240), después la composición de la entrada con contexto de dos turnos de habla de fans (→ 2,1149 en T2), después el ajuste a 3 épocas (→ 1,4378) y, por último, el cambio de metodología, que resulta indistinguible del ruido: DPO 1,5200, GRPO 1,5248 y PPO 1,5306 frente a 1,5240 del SFT equivalente. Aumentar el rank a 64 empeora el resultado (1,4864), al igual que entrenar 4,5 o 6 épocas (1,4770 y 1,5787). Un "kernel de identidad" estático (ronda 10) no llegó a formarse y fue descartado, lo que llevó al autor a concluir que la identidad del personaje se manifiesta desde el texto del contrato (1.664 caracteres de *system prompt*) y no desde los pesos.

## Capacidades

- Generación de texto conversacional en personaje, especializada en el registro de chat de fans en coreano.
- Interpretación de una persona ficticia concreta (`NU-A-BSJ-001`, Baek Seo-jin) definida íntegramente por el contrato de personaje del *system prompt*, no por los pesos.
- Capacidad multilingüe declarada en coreano, inglés y japonés (sin datos de evaluación por idioma).
- Generación de respuestas con longitud media de 46,3 caracteres, con un 50,0 % de cierres en forma de pregunta y una tasa de repetición de cierre del 26,6 % en la sonda de expresión.
- Cumplimiento de reglas de comportamiento: 0,0 % de violaciones de la recompensa de reglas v2 (excluyendo frases de rechazo o negación que quedan exentas).
- Razonamiento en modo *thinking*: explícitamente desactivado (`enable_thinking=False`); no se documenta su comportamiento con el modo activo.
- *Tool calling* / *function calling*: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Visión, audio u otras modalidades: no disponible, no documentado.

## Casos de uso

- Chat de fans de un personaje ficticio en coreano: el adaptador está entrenado específicamente sobre 294 filas de diálogo de fans con el contrato del personaje como *system prompt* y `enable_thinking=False`, de modo que se puede servir como backend conversacional de una web o aplicación de *fan chat* con contextos de hasta 4.096 tokens.
- Prototipado de NPC o personaje de novela visual: sirve para validar guiones y tono de un personaje antes de invertir en un modelo propio, dado que el comportamiento se controla editando el contrato de *system prompt* sin reentrenar.
- Estudio comparado de ingeniería de *prompts* de personaje: el repositorio documenta dos versiones del contrato (v1 y v2) con NLL medido bajo el mismo instrumental (1,4378 y 1,6441 respectivamente), lo que permite medir cuánto aporta el texto del contrato frente al ajuste de pesos.
- Generación de diálogo sintético para ampliar el conjunto de datos de personaje, con revisión humana posterior (L4), replicando la metodología declarada por el autor.
- Localización de interacciones de personaje entre coreano, inglés y japonés manteniendo el registro, aprovechando que los tres idiomas figuran como soportados.
- Investigación sobre aprendizaje por preferencias y RL en dominios de personaje: el adaptador es el punto de comparación congelado (`r8_t2l_ep3`) frente a los brazos DPO, GRPO y PPO, útil como línea base reproducible en un *benchmark* interno.
- Auditoría de deriva de persona: la sonda de expresión (M1–M5) proporciona una plantilla concreta para medir repetición, diversidad léxica, cierre interrogativo, longitud y violaciones de reglas sobre 192 generaciones fijas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Todas las cifras son métricas internas de NLL y sondas de generación definidas por el propio autor.

Medición de dev dorado con instrumental uniforme (*teacher forcing*, misma escala para todas las filas):

| Metrica | Adaptador `r8_t2l_ep3` | Sin adaptador (base) | Diferencia |
|---|---:|---:|---:|
| NLL medio por token | 1,4378 | 2,3413 | −0,9035 |
| Perplejidad | 4,211 | no disponible | — |
| Precisión por token | 0,6386 | no disponible | — |
| Precisión de ránking en dev de preferencias (normalizada por longitud) | 0,875 (8 pares) | no disponible | — |
| NLL elegido / rechazado en dev de preferencias | 1,1593 / 2,3665 | no disponible | — |

Comparación interna de brazos exploratorios (mismo instrumental, NLL de dev dorado; menor es mejor; ruido de semilla σ = 0,0026):

| Ronda e intervención | Brazo | NLL dev dorado | Veredicto |
|---|---|---:|---|
| Base sin adaptador | `base` | 2,3413 | — |
| T1 SFT r16 (1 pregunta) | `t1_lora_sft_r16` | 2,3148 | insignificante |
| T2 SFT r32 (contexto de 2 turnos) | `t2_lora_sft_r32` | 2,1149 | mejora |
| R8 placa de contrato, T2 | `r8_t2` | 1,5240 | mayor mejora de datos |
| R8 DPO | `r8b_dpo` | 1,5200 | indistinguible de `r8_t2` |
| R8 GRPO en línea | `r8_grpo` | 1,5248 | indistinguible de `r8_t2` |
| R8 PPO en línea | `r8_ppo` | 1,5306 | indistinguible de `r8_t2` |
| **R8 T2L 3 épocas r32** | `r8_t2l_ep3` | **1,4378** | **mejor (fuera del ruido)** |
| R8 T2L rank 64 | `r8_t2l_r64` | 1,4864 | peor que ep3 |
| R10 kernel de identidad K1 | `r10k1` | 1,5258 | kernel no formado, descartado |
| R11 4,5 épocas | `r11_ep45` | 1,4770 | empeora |
| R11 6 épocas | `r11_ep6` | 1,5787 | empeora |
| R11 rank 64 + 3 épocas | `r11_r64ep3` | 1,4461 | no aditivo |
| R12 contrato v2 sobre `r8_t2l_ep3` | `r8_t2l_ep3` | 1,6441 | valor de referencia v2 |
| R12 persona-unbound completo | `r12_full` | 1,5814 | rechazado: menos amplitud expresiva P2, peor ajuste G2 |
| R12 solo cambio de contrato | `r12_contract` | 1,5028 | rechazado: menos amplitud P2, suelo de comportamiento G1 |

Sonda de generación (24 *prompts* × 8 respuestas = 192 generaciones, máximo 640 tokens, temperatura 0,8, top_p 0,95, pensamiento desactivado):

| Condicion | M1 repeticion de cierre | M2 distinct-2 | M3 cierre interrogativo | M4 longitud media | M5 violacion de reglas v2 |
|---|---:|---:|---:|---:|---:|
| Este adaptador (= línea base R11) | 26,6 % | 0,765 | 50,0 % | 46,3 caracteres | 0,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo base en BF16 ocupan aproximadamente 55,1 GB (27.574.308.080 parámetros × 2 bytes, cálculo aritmético a partir de los parámetros declarados). El adaptador añade en torno a 0,4 GB en BF16 o 0,87 GB en FP32, coherente con el tamaño de repositorio de 0,9 GB.
- GPU recomendadas: el autor usó una NVIDIA B300 para el entrenamiento (0,91 h, bf16, *gradient checkpointing*). Para inferencia en BF16 hacen falta GPUs de 80 GB o más (A100 80 GB, H100 80 GB, B300); no se publican mediciones propias de latencia ni de *throughput*.
- Cabe en GPU de consumo: no en BF16 con 24 GB (RTX 4090) ni con 16 GB. No hay versiones GGUF ni cuantizadas publicadas en la información disponible, por lo que no se puede confirmar un despliegue en GPU de consumo sin cuantizar el modelo base por cuenta propia.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`) tal y como documenta el autor; servidores con soporte de adaptadores LoRA como vLLM o TGI son viables en principio, aunque no se aportan configuraciones probadas. llama.cpp y Ollama requerirían una conversión a GGUF y fusión del adaptador que no está documentada.
- Latencia y throughput estimados: no disponibles.
- Nota de almacenamiento: hay que descargar el modelo base completo (27B) además del adaptador.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de personaje públicos para este modelo base, por lo que la comparativa se limita a las alternativas internas documentadas por el propio autor, todas sobre `Qwen/Qwen3.8-27B`:

| Modelo / brazo | Parametros entrenables | Contexto de entrenamiento | NLL dev dorado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`r8_t2l_ep3`) | 217.579.520 (r32) | 4.096 tokens, sin *packing* | 1,4378 | Apache 2.0 | pública en HuggingFace, 0 descargas |
| `r8_t2l_r64` (rank 64, 3 épocas) | no disponible | 4.096 tokens | 1,4864 | no aplica (brazo interno) | solo referenciado en la *model card* |
| `r8_t2` (placa de contrato, T2) | no disponible | 4.096 tokens | 1,5240 | no aplica | solo referenciado |
| `r8b_dpo` (preferencias DPO) | no disponible | 4.096 tokens | 1,5200 | no aplica | solo referenciado |
| Modelo base sin adaptador | 0 | 4.096 tokens | 2,3413 | no detallada en la información disponible | público (`Qwen/Qwen3.8-27B`) |

## Limitaciones y advertencias

- Artefacto de carril exploratorio declarado por el autor: no ha superado las puertas de prueba canónicas, ni el *holdout* final de 63 preguntas, ni evaluación humana. No debe tratarse como modelo validado en producción.
- Sesgo optimista conocido: el conjunto de Baek Seo-jin presenta 7 filas con solapamiento exacto respecto al *holdout* congelado (6 de entrenamiento y 1 de dev, 5 preguntas), aceptado de forma consciente mediante *override*. Los valores absolutos de NLL del dev están por tanto sesgados a la baja y solo son comparables entre condiciones idénticas.
- La identidad del personaje no reside en los pesos: depende por completo del contrato de *system prompt* (versión 1, 1.664 caracteres). Sin ese contrato, o con otro distinto, el comportamiento cambia de forma sustancial (NLL 1,4378 con v1 frente a 1,6441 con v2 bajo la misma medición).
- Requiere `enable_thinking=False`; no se documenta el comportamiento correcto con el modo de pensamiento activo.
- Datos de entrenamiento privados y no incluidos en el repositorio (`NEWUNIVERS/nu-fans-baek-seo-jin-data`, acceso privado), lo que impide auditar o reproducir el ajuste. Los datos sintéticos con revisión humana parcial (L4) pueden arrastrar sesgos de estilo del generador.
- Cobertura lingüística limitada a coreano, inglés y japonés; no se declara ni evalúa el castellano. La especialización del personaje es claramente corecéntrica.
- Riesgo de alucinación no cuantificado: no hay pruebas de veracidad factual, solo de estilo y de ajuste al personaje en el dominio de chat de fans.
- Sesgos conocidos: no documentados por el autor. El personaje es una persona ficticia de una agencia ficticia, lo que limita el riesgo de suplantación de personas reales, pero el corpus de fans puede incorporar sesgos de registro y de contenido no auditados.
- Restricciones de licencia: el adaptador es Apache 2.0, pero la información disponible no detalla la licencia del modelo base `Qwen/Qwen3.8-27B`, que debe verificarse antes de cualquier uso comercial.
- Advertencia de contenido: el modelo está diseñado para interpretar un personaje de ficción en conversaciones de fans; debe revisarse si encaja con las políticas de contenido y de moderación del producto donde se integre.
- Señal de adopción nula: 0 descargas y 0 *likes* en el momento de redactar esta ficha, sin casos de uso independientes verificables.
- Métricas de expresión con margen de mejora: 26,6 % de repeticiones de cierre y distinct-2 de 0,765 en la sonda propia del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NEWUNIVERS/nu-fans-baek-seo-jin-qwen38-27b-character-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Conjunto de datos de entrenamiento (privado): https://huggingface.co/datasets/NEWUNIVERS/nu-fans-baek-seo-jin-data (revisión `428f2b642d16022bc74dc9367d181f1729cc647e`)
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a páginas sobre la cantante Katy Perry (Wikipedia, sitio oficial, YouTube, Instagram y discografía), sin relación alguna con este modelo, por lo que no se incluyen como fuentes. No se han localizado *papers*, blogs, repositorios ni demos asociados al adaptador en la información disponible.
