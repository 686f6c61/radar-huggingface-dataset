# HarleyCooper/Inkling-2-Small-Riggs1890-lexgym

## Resumen

Inkling-2-Small-Riggs1890-lexgym es un adaptador LoRA desarrollado por HarleyCooper sobre el modelo base thinkingmachines/Inkling-2-Small. El adaptador ensena al modelo el contenido de *A Dakota-English Dictionary* de Stephen R. Riggs (1890), un diccionario de dominio publico de la lengua dakota, combinando memorizacion de entradas con el mantenimiento de la capacidad de invocar una herramienta de consulta lexica. El objetivo no es crear un asistente de dakota, sino demostrar una metodologia de entrenamiento que preserva el uso de herramientas (tool calling) mientras se inyecta conocimiento factual denso.

El problema que aborda es concreto: en experimentos previos del mismo autor sobre modelos Qwen, tres pasadas de fine-tuning convencional degradaron la puntuacion de uso de la herramienta de consulta desde aproximadamente 0,75 hasta aproximadamente 0,03. Este adaptador se entrena sobre un fichero que mezcla filas de pregunta-respuesta directa con conversaciones de consulta resueltas, logrando retener el conocimiento del libro y conservar la herramienta operativa al 100% en las tareas de lookup evaluadas.

Es relevante porque documenta, con trazas publicas y curvas de aprendizaje, una receta reproducible para lenguas de bajos recursos y dominios factuales cerrados, a un coste de 33,70 dolares mediante Tinker de Thinking Machines. El checkpoint es de investigacion: no es un asistente de dakota y su salida no es dakota autoritativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre thinkingmachines/Inkling-2-Small; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; tamano de repo 16,7 GB incluye pesos del adaptador y artefactos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | dak (dakota), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con PEFT sobre Inkling-2-Small. Los datos de entrenamiento proceden integramente del escaneo de dominio publico del diccionario de Riggs de 1890. Cada entrada se parseo en los campos: headword, division silabica y acento, categoria gramatical, definicion, formas flexionadas listadas y palabra raiz de la que deriva. A partir de estos campos se construyeron ocho tipos de tarea: `gloss` (13.562 ejemplos), `en_to_dak` (3.369), `syllabify` (13.990), `pos` (13.985), `inflect` (4.936), `root` (3.060), `lookup_gloss` (13.562) y `lookup_root_gloss` (2.447). Una de cada diez familias de palabras, con todas sus derivadas, se reserva como conjunto de evaluacion y nunca aparece en entrenamiento.

La innovacion metodologica es la mezcla de tareas de memoria directa con conversaciones de consulta resueltas en el mismo fichero de entrenamiento, lo que evita el colapso del uso de la herramienta observado con fine-tuning convencional. El entrenamiento se realizo con Tinker de Thinking Machines en tres pasadas, con un coste total de 33,70 dolares. La evaluacion se hizo a temperatura 0 y una sola semilla sobre 1.500 tareas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Recuperacion de definiciones de dakota a ingles para entradas presentes en entrenamiento (exact match 0,817 en la tarea Dakota palabra a definicion inglesa).
- Traduccion inversa de ingles a dakota para entradas vistas (exact match 0,853).
- Division silabica y marcado de acento segun la convencion de Riggs, generalizando a familias de palabras no vistas (0,907).
- Identificacion de la palabra raiz de una entrada derivada (0,773 en familias reservadas).
- Etiquetado de categoria gramatical (0,720 en familias reservadas).
- Generacion de formas flexionadas listadas en el diccionario (0,493, la tarea mas debil).
- Uso correcto de una herramienta de consulta lexica: 1,000 en lookup de un salto y 1,000 en lookup de dos saltos (leer la entrada y leer la entrada de la raiz).
- Generacion de texto en ingles y dakota dentro del dominio del diccionario.
- Soporte de conversaciones multi-turno con invocacion de herramienta (tool calling) segun las trazas de evaluacion publicadas.
- No se documentan capacidades de vision, audio, codigo ni matematicas en la informacion disponible.

## Casos de uso

- Investigacion sobre preservacion de tool calling durante fine-tuning: el adaptador sirve como referencia reproducible de que mezclar tareas de memoria con trazas de consulta resueltas mantiene la herramienta operativa, con datos comparativos frente a runs previos sobre Qwen.
- Digitalizacion y estructuracion de lexicos historicos: el pipeline de parseo de entradas (headword, silabas, categoria, definiciones, flexiones, raiz) puede reutilizarse para otros diccionarios del siglo XIX y generar tareas de evaluacion automaticas.
- Evaluacion de modelos en lenguas de bajos recursos: el conjunto reservado de familias de palabras y las 1.500 tareas fijas permiten medir generalizacion de reglas (acento, silabificacion) frente a memorizacion pura.
- Demostracion interactiva de comparacion base frente a adaptador: el Space asociado permite consultar cualquier palabra y contrastar la salida del modelo base con la del adaptador, util para docencia y divulgacion sobre fine-tuning.
- Estudio de coste-eficiencia en entrenamiento: el registro de 33,70 dolares en Tinker para tres pasadas sobre un corpus lexico acotado sirve como referencia para presupuestar experimentos similares.
- Analisis de limites de memorizacion: la curva de recall (0,030 en base, 0,295, 0,637 y 0,835 en las tres pasadas) permite estudiar como escala la retencion factual con el numero de epocas en un corpus cerrado.
- Prueba de concepto para asistentes lexicograficos con verificacion por herramienta: el patron de lookup de dos saltos (entrada y entrada de la raiz) es aplicable a sistemas que deben citar la fuente en lugar de responder de memoria.

## Benchmarks y rendimiento

Exact match sobre las mismas 1.500 tareas, temperatura 0, una semilla. Comparativa entre modelo base y las tres pasadas del adaptador.

| Medida | Base | Pasada 1 | Pasada 2 | Pasada 3 (este adaptador) |
|---|---|---|---|---|
| Recall desde memoria (600) | 0,030 | 0,295 | 0,637 | 0,835 |
| Dakota palabra a definicion inglesa | 0,007 | 0,223 | 0,510 | 0,817 |
| Ingles a palabra dakota | 0,053 | 0,367 | 0,763 | 0,853 |
| Familias de palabras reservadas (900) | 0,443 | 0,814 | 0,820 | 0,816 |
| Lookup, un salto | 0,767 | 1,000 | 1,000 | 1,000 |
| Lookup, dos saltos | 0,893 | 1,000 | 1,000 | 1,000 |
| Silabas y acento | 0,327 | 0,867 | 0,913 | 0,907 |
| Palabra raiz | 0,380 | 0,820 | 0,740 | 0,773 |
| Categoria gramatical | 0,293 | 0,693 | 0,753 | 0,720 |
| Formas flexionadas | 0,000 | 0,507 | 0,513 | 0,493 |
| Todas las 1.500 tareas | 0,278 | 0,607 | 0,747 | 0,823 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador LoRA debe cargarse junto al modelo base Inkling-2-Small, cuyo tamano en parametros no se especifica; el tamano del repo (16,7 GB) incluye pesos del adaptador y artefactos, no permite derivar la VRAM necesaria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse con la libreria peft sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La evaluacion se realizo a temperatura 0 y una semilla, sin reportar tiempos.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia interna del propio autor, los runs previos sobre modelos Qwen con fine-tuning convencional mostraron una caida del uso de herramienta de aproximadamente 0,75 a aproximadamente 0,03 tras tres pasadas, frente al 1,000 mantenido por este adaptador, pero no se detallan los identificadores de esos modelos ni sus especificaciones.

| Modelo | Parametros | Contexto | Rendimiento en lookup | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-Riggs1890-lexgym | no disponible | no disponible | 1,000 (un y dos saltos) | apache-2.0 | Hugging Face |
| Runs previos sobre Qwen (fine-tuning convencional) | no disponible | no disponible | ~0,03 tras tres pasadas | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor declara explicitamente que no es un asistente de dakota y que su salida no es dakota autoritativo.
- Sesgos: los derivados de un unico diccionario de 1890, con la ortografia, convenciones de acento y criterios lexicograficos de Riggs; no representa el dakota contemporaneo ni variantes modernas.
- Alucinacion: el modelo puede generar entradas plausibles pero incorrectas, especialmente en formas flexionadas (exact match 0,493) y en palabras fuera del vocabulario del diccionario.
- Cobertura limitada: solo cubre las entradas del diccionario; las familias de palabras reservadas se evaluan con reglas, no con conocimiento lexico nuevo.
- Limitacion de idioma: soporte declarado unicamente para dak y en; no hay datos sobre otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial del adaptador, pero el modelo base Inkling-2-Small tiene su propia licencia que debe verificarse por separado.
- Produccion: no apto para produccion sin validacion humana; no se han publicado datos de latencia, throughput ni robustez fuera del conjunto de evaluacion.
- Dependencia del modelo base: el adaptador no es autonomo y requiere cargar Inkling-2-Small, cuyos requisitos de hardware no se documentan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/Inkling-2-Small-Riggs1890-lexgym
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Demo en vivo (Space): https://huggingface.co/spaces/HarleyCooper/riggs1890-lexgym
- Metodologia (cookbook): https://github.com/HarleyCoops/Dakota1890/tree/main/cookbook
- Dataset de tareas e indice de lookup: https://huggingface.co/datasets/HarleyCooper/riggs1890-lexicon-graph
- Trazas de evaluacion: https://huggingface.co/datasets/HarleyCooper/riggs1890-lexgym-traces/tree/main/sft_mixed_thinking_off_2026_11_12/inkling-2-small
- Proyecto W&B: https://forge.coreweave.com/wandb/christian-cooper-us/riggs1890-lexgym
- Documentacion de Tinker: https://tinker-docs.thinkingmachines.ai/
