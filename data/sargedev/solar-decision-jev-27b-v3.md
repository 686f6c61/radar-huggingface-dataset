# SargeDev/Solar-Decision-JEV-27B-V3

## Resumen

Solar-Decision-JEV-27B-V3 es un modelo de lenguaje de 26.896 millones de parametros desarrollado por SargeDev, derivado mediante fine-tuning LoRA del backbone abliterado huihui-ai/Huihui-Qwen3.8-27B-abliterated (a su vez basado en la familia Qwen3.8). No es un modelo conversacional al uso: esta especializado en lo que el autor denomina "decisiones tipadas" (typed decisions), un paradigma en el que el modelo recibe un prefill con una pregunta y un conjunto de opciones, y devuelve una decision en un solo token leyendo las log-probabilidades sobre los tokens de cada opcion. El modelo integra ese mecanismo de lectura en sus propios pesos, de modo que no requiere una cabeza separada en tiempo de inferencia.

La version V3 se entrena sobre la union de dos corpus propios (jev-distill-corpus-v3 y solar-decisions-corpus-v4, 764.626 filas y 90 dominios) y anade `lm_head` a los modulos objetivo del LoRA (r32, alpha 64), con merge en el paso 2184. Respecto a V2, mejora de forma notable la precision top-1 en tareas de eleccion (0,571 a 0,833) y de scoring (0,567 a 0,794), aunque empeora la calibracion (ECE de 0,021 a 0,167). El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors bf16, ademas de cuantizaciones NVFP4-FP8 y una escalera GGUF de 11 variantes.

Su relevancia actual reside en la propuesta de un modelo autocontenido para toma de decisiones con probabilidades calibradas y deteccion de "no-answer" (noul), orientado a pipelines de enrutamiento, clasificacion y agentes que necesitan decidir entre alternativas con una sola pasada de prefill en lugar de generar texto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5_text`), fine-tuning LoRA r32/alpha 64 con `lm_head` incluido en los modulos objetivo |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales), NVFP4-FP8, GGUF (f16, Q2_K a Q8_0, 11 variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 19 shards, 52 GB), NVFP4-FP8, GGUF |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Qwen3.8 con 26,9 mil millones de parametros, en su variante abliterada publicada por huihui-ai. Sobre esa base, SargeDev aplica un LoRA de rango 32 y alpha 64 entrenado sobre la union de dos corpus: jev-distill-corpus-v3 y solar-decisions-corpus-v4, con un total de 764.626 filas repartidas en 90 dominios. La innovacion respecto a la version anterior es doble: por un lado, el corpus de entrenamiento incorpora las filas de tipo verbalizador y de forma de decision que antes solo estaban en la mitad "solar"; por otro, los modulos objetivo del LoRA incluyen `lm_head`, de modo que la geometria del vocabulario de salida de la cabeza de decision se entrena junto con el resto del modelo. El merge se realiza en el paso 2184.

La maquinaria de decision tipada se apoya en varios artefactos distribuidos junto a los pesos: `decision_head.json` (cabecera de decision de 24 slots), `calibration.json` y `serve_decide.py` (script de servicio). Una decision tipada consiste en un unico prefill con `max_tokens=1`, leyendo despues las log-probabilidades sobre los tokens de las opciones candidatas. Segun el autor, esta ruta solo funciona en vLLM, ya que llama.cpp no devuelve las log-probabilidades por token que necesita el mecanismo; el GGUF esta pensado para chat, no para decisiones. El repositorio conserva ademas los tensores del drafter MTP/nextn, lo que permite decodificacion especulativa en llama.cpp.

## Capacidades

- Generacion de texto conversacional general, heredada del backbone Qwen3.8-27B.
- Decisiones tipadas: eleccion entre opciones (choice), puntuacion (score) y deteccion de "no-answer" (noul) mediante lectura de log-probabilidades en un solo token.
- Probabilidades calibradas sobre las opciones, con fichero de calibracion incluido.
- Modo "system one": decisiones rapidas en un unico paso de prefill, sin generacion autoregresiva larga.
- Modelo abliterado y sin censura (uncensored), lo que elimina rechazos por politicas de contenido.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de decodificacion especulativa mediante tensores MTP/nextn preservados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Enrutamiento de peticiones en pipelines de agentes: el modelo recibe el contexto y un conjunto cerrado de rutas posibles y devuelve la eleccion con su probabilidad en un solo token, lo que permite decidir en una unica pasada de prefill y con latencia muy baja frente a la generacion autoregresiva.
- Clasificacion con abstención: gracias a la metrica noul (AUROC 0,988, top-1 0,939), el modelo puede identificar casos en los que ninguna opcion es correcta y derivarlos a revision humana, util en moderacion, triaje de tickets o validacion de formularios.
- Puntuacion de candidatos en ranking: la salida de tipo score permite asignar una puntuacion calibrada a respuestas, documentos o propuestas generadas por otro modelo, integrable en sistemas de evaluacion automatica o de seleccion de mejor respuesta.
- Control de calidad en generacion: dado un texto producido por otro modelo y un conjunto de criterios, el modelo decide si cumple cada criterio, lo que encaja en pipelines de CI/CD para validacion de contenido antes de publicacion.
- Sistemas de recomendacion con decision explicita: elegir entre un conjunto de acciones o items con probabilidad asociada, aprovechando el formato de decision tipada para registrar la confianza de cada recomendacion.
- Investigacion sobre calibracion y abliteration: el modelo y sus artefactos (calibracion, cabecera de decision, script de servicio) sirven como base reproducible para estudiar el equilibrio entre precision top-1 y calibracion en modelos de decision, tal como documenta el propio autor con la comparacion V2/V3.
- Chat general sin restricciones de contenido: el GGUF permite desplegar el modelo como asistente conversacional en llama.cpp, con decodificacion especulativa activada.

## Benchmarks y rendimiento

Resultados de la puerta de evaluacion del autor sobre 27.695 filas, con el mismo harness, cabecera y calibracion en todas las columnas:

| Metrica | V2 (r32+1894) | V3 (paso 2184) | Referencia r32-alone | Umbral AutoTrust |
|---|---|---|---|---|
| choice top-1 | 0,571 | 0,833 | 0,869 | 0,904 |
| score top-1 | 0,567 | 0,794 | no disponible | 0,891 |
| noul AUROC | 0,962 | 0,988 | 0,992 | 0,996 |
| noul top-1 | 0,879 | 0,939 | no disponible | no disponible |
| choice ECE | 0,021 | 0,167 | no disponible | no disponible |

Rendimiento de inferencia con llama-bench en GB10 (build CUDA, `-ngl 99`, pp512 / tg128):

| Cuantizacion | Tamano | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|
| Q4_K_M | 15,65 GiB | 865,94 | 12,80 |
| Q8_0 | 27,04 GiB | 818,03 | 8,38 |

El autor indica que V3 queda por debajo del umbral en choice y score top-1, y que la subida del ECE de choice (0,021 a 0,167) refleja mayor confianza en filas dificiles: mejor ranking, peor calibracion.

## Requisitos de hardware

- Pesos bf16 completos: 52 GB en 19 shards, mas el repositorio de 55,5 GB; requiere al menos 2 GPU de 40 GB o una de 80 GB para inferencia comoda.
- NVFP4-FP8: 29 GB, apto para GPU con 32-48 GB de VRAM.
- GGUF Q4_K_M: 15,65 GiB, cabe en GPU consumer de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y en configuraciones con offload parcial.
- GGUF Q8_0: 27,04 GiB, requiere 32 GB de VRAM o reparto entre GPU y CPU.
- La ruta de decisiones tipadas exige vLLM con retorno de log-probabilidades por token; llama.cpp solo sirve para chat.
- GPU recomendadas: A100 80 GB, H100, o dos A100 40 GB para bf16; RTX 4090 (24 GB) para NVFP4-FP8 o GGUF Q5/Q6; GB10 para los datos de llama-bench aportados.
- Despliegue: vLLM (decisiones y chat), llama.cpp y Ollama (chat con GGUF), TGI (no confirmado en la informacion disponible).
- Throughput medido en GB10: 865,94 tok/s de prefill y 12,80 tok/s de generacion con Q4_K_M; 818,03 y 8,38 con Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V3 | 26,9 B | no disponible | Decision tipada + chat, abliterado | Apache 2.0 | HuggingFace, safetensors, NVFP4-FP8, GGUF |
| Solar-Decision-JEV-27B (V2) | 26,9 B | no disponible | Decision tipada, r32 sin `lm_head` | Apache 2.0 | HuggingFace |
| JEV-27B-Uncensored (r32-alone) | 26,9 B | no disponible | Decision tipada con mejor calibracion | Apache 2.0 | HuggingFace |
| Huihui-Qwen3.8-27B-abliterated | 26,9 B | no disponible | Chat general abliterado (modelo base) | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables distintos de los publicados por el autor para V2 y r32-alone en la tabla de la seccion anterior.

## Limitaciones y advertencias

- Calibracion degradada en choice: ECE de 0,167 frente a 0,021 en V2; si se necesitan probabilidades calibradas, el autor recomienda r32-alone (SargeDev/JEV-27B-Uncensored).
- Por debajo del umbral AutoTrust en choice top-1 (0,833 frente a 0,904) y score top-1 (0,794 frente a 0,891).
- La ruta de decisiones tipadas solo funciona en vLLM; llama.cpp no devuelve las log-probabilidades necesarias.
- Modelo abliterado y sin censura: puede producir contenido que otros modelos rechazarian; requiere filtros propios en produccion.
- Riesgo de alucinacion en el modo conversacional heredado del backbone, no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Longitud de contexto no documentada.
- El modelo esta especializado en decisiones tipadas; su uso como chat general es secundario y depende del GGUF.
- Trazabilidad de datos limitada: los corpus de entrenamiento son propios del autor y no se detalla su composicion mas alla del numero de filas y dominios.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base abliterado puede arrastrar obligaciones o consideraciones de la licencia original de Qwen; conviene verificarlas antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3
- Cuantizacion NVFP4-FP8: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-NVFP4-FP8
- GGUF: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-GGUF
- Version anterior: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B
- Referencia r32-alone: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Corpus de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Corpus de decisiones: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
