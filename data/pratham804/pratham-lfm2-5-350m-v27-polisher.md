# Pratham804/Pratham-LFM2.5-350M-V27-Polisher

## Resumen

Pratham-LFM2.5-350M-V27-Polisher es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario Pratham804. Su proposito es actuar como "pulidor" de dictado: recibe texto crudo sin puntuar, tal como se transcribiria de voz a texto, y devuelve exactamente las mismas palabras, pero limpias y formateadas. Elimina muletillas, falsos comienzos, repeticiones y disculpas, aplica las autocorrecciones del hablante y restaura puntuacion, mayusculas, horas, cantidades monetarias, comillas, listas con vinetas y saltos de parrafo.

El modelo no reformula ni parafrasea: preserva el vocabulario y la estructura de las frases. Esto lo hace especialmente util como etapa de post-procesado en pipelines de transcripcion automatica, donde el ASR produce texto plano y se necesita un formateo fiel sin reescritura semantica.

Tecnicamente se trata de un transformer de 354.483.968 parametros (aproximadamente 350M), con un vocabulario de 65.536 tokens, afinado mediante LoRA (r=112) sobre 14.000 registros sinteticos de dictado que cubren 17 familias de comportamiento, fusionado en los pesos base y cuantizado a GGUF. El repositorio ocupa 0,2 GB. La licencia es LFM Open License v1.0, que permite uso comercial por debajo de 10 millones de dolares de ingresos anuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q4_K_S) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un transformer de aproximadamente 350M de parametros con vocabulario de 65.536 tokens. El ajuste se realizo mediante LoRA con rango r=112 sobre 14.000 registros sinteticos de dictado que cubren 17 familias de comportamiento (puntuacion, listas, horas, cantidades, comillas, autocorrecciones, eliminacion de muletillas, entre otras). Los pesos LoRA se fusionaron en los pesos base y el resultado se cuantizo a GGUF.

No se aplico poda de vocabulario en esta version: se conserva el vocabulario completo de 65.536 tokens del modelo base. Segun la model card, no hay cambios arquitectonicos mas alla del redimensionado de las proyecciones de embedding y salida que requeriria la poda de vocabulario, aunque en esta build no se aplico dicha poda. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Limpieza de dictado: elimina muletillas, falsos comienzos, repeticiones y disculpas del texto transcrito.
- Restauracion de puntuacion: anade comas, puntos, signos de interrogacion y exclamacion.
- Normalizacion de mayusculas: aplica capitalizacion correcta a inicio de frase y nombres propios.
- Formateo de horas y cantidades monetarias.
- Insercion de comillas y listas con vinetas.
- Segmentacion en parrafos.
- Aplicacion de autocorrecciones del hablante (cuando el dictante se corrige a si mismo).
- Preservacion del vocabulario y estructura originales: no reescribe ni parafrasea.
- Capacidad conversacional (tag `conversational` en Hugging Face).
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Post-procesado de transcripcion ASR: integrado como etapa final de un pipeline de speech-to-text, recibe la salida cruda del reconocedor y devuelve texto formateado listo para publicacion o archivo, sin alterar el contenido semantico.
- Generacion de actas de reuniones: convierte transcripciones de voz en notas legibles con puntuacion, listas y parrafos, aplicando las correcciones que los participantes hicieron en directo.
- Dictado en herramientas de productividad: como capa de limpieza en editores de texto o aplicaciones de notas por voz, donde el usuario necesita que su dictado se convierta en texto bien formateado sin reescritura.
- Documentacion clinica o legal dictada: normaliza horas, cantidades y comillas en informes dictados, manteniendo fidelidad literal al contenido original, algo critico en entornos donde la reformulacion no es aceptable.
- Subtitulado y transcripcion de entrevistas: produce transcripciones con puntuacion y parrafos coherentes a partir de audio sin puntuar, preservando las palabras exactas del hablante.
- Preprocesado para pipelines de datos: limpia grandes volumenes de transcripciones crudas antes de indexarlas o analizarlas, con un modelo pequeno (0,2 GB en GGUF) que puede ejecutarse en CPU o GPU de gama baja.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las puntuaciones de una evaluacion propia de 40 comprobaciones, medida a traves de `llama-server` con decodificacion greedy sobre el fichero exacto del repositorio:

| Modelo | Puntuacion |
|---|---:|
| v27 Q4_K_M | 34/40 |
| v27 Q4_K_S | 32/40 |
| v25 (version anterior) | 27/40 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion Q4 (repositorio de 0,2 GB); el modelo completo en precision original rondaria 0,7 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.).
- Tambien puede ejecutarse en CPU mediante llama.cpp, dado su tamano reducido.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pratham-LFM2.5-350M-V27-Polisher | 354M | No disponible | LFM Open License v1.0 | GGUF | Especializado en limpieza de dictado |
| LiquidAI/LFM2.5-350M (base) | ~350M | No disponible | LFM Open License v1.0 | Safetensors | Modelo base generalista, sin ajuste de dictado |
| v25 (version anterior del mismo autor) | ~350M | No disponible | LFM Open License v1.0 | GGUF | Version previa; 27/40 en la evaluacion propia frente a 34/40 de v27 |

No se dispone de datos de benchmarks comparativos con otros modelos de limpieza de dictado en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha declarado soporte multilingue.
- Fallos conocidos en la version Q4_K_M: self_repair, abbrev, garbled, names_times_list, sorry_midlist y long_para_1 (segun la model card).
- Fallos conocidos en la version Q4_K_S: enum_ordinals, self_repair, abbrev, garbled, names_times_list, sorry_retract, sorry_midlist y long_para_1.
- Riesgo de alucinacion: aunque el modelo esta disenado para no reformular, no se han publicado garantias formales de fidelidad literal; conviene validar en produccion.
- Licencia LFM Open License v1.0: uso comercial permitido solo por debajo de 10 millones de dolares de ingresos anuales.
- El modelo esta modificado y no cuenta con el respaldo ni afiliacion de Liquid AI; el nombre de Liquid AI se usa unicamente para identificar el modelo base.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy limitado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con dictados muy largos.
- No se han publicado resultados de benchmarks estandar, solo una evaluacion propia de 40 comprobaciones.

## Enlaces

- Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-V27-Polisher
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
