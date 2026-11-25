# DICPlay/RusMind-Zernyshko-1.10

## Resumen

RusMind Zernyshko 1.10 es un modelo de lenguaje de generacion de texto desarrollado por DICPlay dentro de la familia RusMind, entrenado completamente desde cero (from-scratch) y especializado en ruso. Se trata de un modelo diminuto de 83 millones de parametros (10 capas con dimension oculta de 768) con un tokenizador propio y un contexto maximo de 1024 tokens. Su formato de dialogo es ChatML y su tamano en disco ronda los 167 MB, lo que permite ejecutarlo completamente offline en un portatil o incluso en un telefono.

La relevancia del modelo reside en su rendimiento relativo: segun la model card, obtiene una puntuacion global de 0,052 en el benchmark ruso MERA 2.0, superando ligeramente a SmolLM-3B (0,049), un modelo 36 veces mas grande. El autor reporta ventajas en tareas de logica, refranes y sabiduria popular, humor, enantiosemia, personajes y conocimiento de regiones rusas. La version 1.10 se presenta como la de mejor resultado MERA de la linea y la de mejor ortografia, con mejoras medibles en puntuacion (SAGE) y correccion ortografica respecto a las versiones 1.6 y 1.9.

El modelo no esta pensado como un asistente conversacional generalista: la propia model card recomienda la version 1.9 para conversacion y preguntas sobre Rusia, y posiciona a 1.10 como la variante mas precisa en tareas linguisticas y de conocimiento cultural ruso. Su licencia es propia (RusMind License), gratuita para uso personal, no comercial, investigacion y evaluacion, pero restrictiva para uso comercial o redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de arquitectura propia RusMind AI (custom_code, requiere trust_remote_code) |
| Parametros totales | 83.083.008 (10 capas x 768) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe version GGUF en repositorio aparte) |
| Idiomas soportados | ruso (ru) |
| Licencia | RusMind License (DICPlay); uso personal, no comercial, investigacion y evaluacion gratuitos; uso comercial solo por contrato escrito |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado completamente desde cero, con un tokenizador propio disenado por el autor. La configuracion indicada es de 10 capas con dimension oculta de 768, lo que da lugar a los 83 millones de parametros. La arquitectura es propia de RusMind AI y requiere cargar el modelo con `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio. El contexto maximo es de 1024 tokens y el formato de conversacion es ChatML.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card unicamente indica que el entrenamiento es from-scratch y que el modelo esta orientado a ruso, con enfasis en gramatica, ortografia y conocimiento cultural ruso (refranes, personajes, regiones). Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ruso con formato de dialogo ChatML.
- Razonamiento logico basico en ruso (tarea NewReasoning de MERA 2.0).
- Conocimiento de refranes y sabiduria popular rusa (tarea RUBIN).
- Comprension de humor y enantiosemia (doble sentido) en ruso.
- Conocimiento de personajes y regiones de Rusia.
- Correccion ortografica y puntuacion (tareas SAGE).
- Ejecucion offline en hardware de bajos recursos (portatil, telefono).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ruso; no se declaran otros idiomas.

## Casos de uso

- Correccion ortografica y de puntuacion en textos rusos: el modelo reporta 0,409 en colocacion de comas y 0,149 en correccion ortografica (SAGE), por lo que puede usarse como pasada ligera de postprocesado en pipelines editoriales en ruso.
- Filtrado y clasificacion de contenido cultural ruso: su rendimiento en RUBIN (0,263) y en personajes (0,177) permite usarlo para etiquetar refranes, personajes o referencias culturales en corpus rusos.
- Prototipado y educacion: al ocupar ~167 MB y ejecutarse offline, es adecuado para ensenar fundamentos de LLM, experimentar con tokenizadores propios y desplegar demos en entornos sin conectividad.
- Aplicaciones embebidas y moviles: su tamano permite integrarlo en apps de escritorio o moviles para tareas de generacion corta en ruso sin depender de la nube.
- Generacion de texto creativo breve en ruso: cuentos cortos, descripciones o respuestas de una sola interaccion dentro del limite de 1024 tokens.
- Evaluacion comparativa de modelos pequenos: sirve como referencia en investigacion sobre eficiencia de modelos diminutos frente a modelos multibillon de parametros en benchmarks rusos como MERA 2.0.
- Preprocesado linguistico en pipelines NLP rusos: normalizacion de texto, deteccion de errores ortograficos o generacion de variantes antes de pasos posteriores con modelos mayores.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (metodologia MERA 2.0; las cifras de otros modelos provienen del leaderboard MERA):

| Tarea MERA 2.0 | Zernyshko 1.10 (0,08B) | SmolLM-3B (3B) |
|---|---|---|
| Puntuacion global | 0,052 | 0,049 |
| NewReasoning (logica) | 0,146 | 0,049 |
| RUBIN (refranes) | 0,263 | 0,092 |
| Humor | 0,041 | 0,018 |
| Enantiosemia | 0,058 | 0,032 |
| LIMUR | 0,213 | 0,157 |
| Characters (personajes) | 0,177 | 0,129 |
| RussianRegions (regiones) | 0,031 | 0,024 |

Comparaciones adicionales citadas por el autor:

| Modelo comparado | Tamano relativo | Resultado destacado |
|---|---|---|
| GFusion-10B-A1.8B | 130x mayor | NewReasoning 0,146 vs 0,057; humor 0,041 vs 0,035 |
| A-vibe 8B | 96x mayor | RUBIN 0,263 vs 0,251 |
| Qwen3.5-4B | 48x mayor | SAGE 0,257 vs 0,038; RUBIN 0,263 vs 0,259; regiones 0,031 vs 0,018 |
| Qwen3.5-9B | 108x mayor | SAGE 0,257 vs 0,121 |
| gemma-4-E4B-it | mayor | SAGE 0,257 vs 0,124; Characters 0,177 vs 0,075 |

Evolucion entre versiones (segun el autor):

| Metrica | 1.6 | 1.9 | 1.10 |
|---|---|---|---|
| MERA 2.0 | 0,049 | 0,048 | 0,052 |
| Puntuacion SAGE | 0,267 | 0,335 | 0,409 |
| Correccion ortografica SAGE | 0,062 | 0,102 | 0,149 |

No se han publicado resultados de benchmarks estandar internacionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (83 M de parametros, ~167 MB en disco); en cuantizacion de 8 bits o 4 bits el consumo es aun menor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, integradas) y en telefonos, segun el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True`; llama.cpp, Ollama y LM Studio mediante el repositorio GGUF DICPlay/RusMind-Zernyshko-1.10-GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.10 | 83 M | 1024 | 0,052 | RusMind License (restrictiva) | Hugging Face + GGUF |
| SmolLM-3B | 3 B | no disponible | 0,049 | no disponible | Hugging Face |
| Qwen3.5-4B | 4 B | no disponible | no disponible | no disponible | no disponible |
| gemma-4-E4B-it | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se basa en las cifras aportadas por el autor; los datos de contexto, licencia y disponibilidad de los modelos alternativos no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy limitada (1024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Modelo unicamente en ruso; no se declaran capacidades en castellano ni en otros idiomas.
- Riesgo de alucinacion y de respuestas incorrectas en temas fuera de su dominio; el autor recomienda la version 1.9 para conversacion general.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Licencia restrictiva: el uso comercial, la reventa, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay.
- El modelo se distribuye "tal cual", sin garantias.
- No se documentan sesgos especificos, pero al estar entrenado solo con datos rusos puede reflejar sesgos culturales y linguisticos de esa procedencia.
- Los benchmarks reportados son los del propio autor y no han sido verificados de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10
- Version GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF
- Version 1.9 (recomendada por el autor para conversacion): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
