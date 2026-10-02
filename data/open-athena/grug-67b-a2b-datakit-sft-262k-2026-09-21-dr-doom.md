# open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom

## Resumen

Dr. Doom es un ajuste fino por aprendizaje por refuerzo de pesos completos en BF16 sobre el modelo Grug-67B-A2B-Datakit-SFT-262K-2026.09.21, desarrollado por el colectivo open-athena dentro del ecosistema Marin. Su objetivo es muy concreto: reducir las continuaciones repetitivas exactas conocidas como "doom loops", un modo de fallo en el que el modelo repite indefinidamente un sufijo de tokens hasta agotar la ventana de generacion. No es un modelo generalista depurado, sino un artefacto de investigacion orientado a estudiar y mitigar ese comportamiento patologico.

Arquitecturalmente hereda la configuracion MoE (mixture-of-experts) del modelo base, con aproximadamente 67.000 millones de parametros totales y conexion de 262.144 tokens de contexto (262K). El nombre "A2B" sugiere del orden de 2.000 millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 134,2 GB.

Su relevancia actual es metodologica: documenta de forma detallada una campana de optimizacion de preferencias sobre el token final (FTPO) en linea, con verificacion por tarea y evidencia reproducible. El propio autor advierte que se trata de un artefacto de investigacion no validado para produccion y que la meta estricta de la campana (menos del 5% de bucles por dominio, menos del 2% en dominios grandes) no se alcanzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE, tag `grug_moe`), ecosistema Marin |
| Parametros totales | 67.078.882.816 (67,08B) |
| Parametros activos | no disponible (el sufijo A2B del nombre sugiere ~2B activos, sin confirmar) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base; valor de configuracion no validado) |
| Tipos de cuantizacion | no disponible (pesos liberados en BF16; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos (MoE) de tipo transformer con 67,08B de parametros totales. Dr. Doom conserva esa arquitectura y aplica un ajuste fino de pesos completos en BF16, no un adaptador. La innovacion central no esta en la topologia, sino en el procedimiento de RL: se emplea optimizacion de preferencias sobre el token final en linea (online final-token preference optimization, FTPO) implementada en MarinSkyRL, adaptando la referencia Antidoom. Durante el entrenamiento, los rollouts codiciosos en linea proporcionan identificadores exactos de tokens y las probabilidades logaritmicas en bruto de los 32 tokens mas probables. Cuando se detecta un sufijo repetitivo exacto, FTPO localiza la primera frontera de repeticion, trata el token generado como rechazado y entrena tokens alternativos para superarlo por un margen de logit, penalizando ademas con MSE contra una referencia congelada para limitar la deriva.

La etapa final inicializo politica y referencia congelada desde la ronda mixta update 5, con optimizador nuevo. Uso pesos de muestreo de matematicas, seguimiento de instrucciones y codificacion de 2:1:1, tamano de lote 64, una respuesta codiciosa por prompt, presupuesto de prompt de 2.048 tokens y hasta 32.768 tokens de respuesta. El detector de bucles cubria toda la ventana de 32K, con tope de periodo de 4.096 y al menos ocho repeticiones. Se aplicaron dos actualizaciones AdamW con LR 2e-7, sin decaimiento de peso y recorte de norma de gradiente a 0,5. Los valores por defecto de FTPO fueron margen 2,0, coeficiente MSE no objetivo 0,4, coeficiente MSE objetivo 0,05, tolerancia de desviacion de logit objetivo 0,5, probabilidad relativa minima de candidato 0,01 y hasta 20 alternativas elegidas. El entrenamiento empleo 40 GPU H100 (32 para actores de politica/referencia colocados con TP=1, PP=2, CP=1, EP=16, mas 8 GPU de rollout) en Iris/CoreWeave. La linea de ascendencia incluye SFT original, FTPO matematico estandar hasta el update 35, rama de ventana completa hasta el 45, ronda matematica con referencia nueva update 5, ronda mixta update 5 y FTPO de respuesta larga update 2.

## Capacidades

- Generacion de texto conversacional con pipeline `text-generation`.
- Razonamiento matematico y verificacion por tarea nativa, con mejora medida frente al SFT original en respuestas correctas.
- Mitigacion de degeneracion repetitiva exacta (doom loops) en generacion larga, con reduccion medida de 27,15% a 2,34% en el banco de matematicas de 512 prompts.
- Capacidad de razonamiento de multiples pasos dentro de la ventana de contexto larga (262K, no validada).
- Soporte de tool calling y uso de herramientas: mencionado en las evaluaciones, pero senalado explicitamente como problematico en el model card.
- Seguimiento de instrucciones: senalado como problematico en la campana ("instruction following ... remain problematic").
- Capacidad de codificacion: soportada como dominio de muestreo, con rendimiento senalado como problematico.
- Modo de "de-looping": comportamiento entrenado especificamente para evitar repeticiones exactas.

## Casos de uso

- Investigacion sobre degeneracion repetitiva: replicar y comparar la tasa de bucles frente al SFT original usando el banco de 512 prompts de matematicas a 16K, aprovechando que los hashes de prompt coinciden dentro de cada comparacion.
- Estudio de metodos de RL: analizar el efecto de FTPO con margen de logit y penalizaciones MSE frente a referencia congelada, usando los registros de campana y el experiment tracker publicados.
- Base de partida para ajuste posterior: utilizar el checkpoint como punto de inicio para nuevas rondas de SFT o RL sobre dominios especificos, dado su estado intermedio de la linea de ascendencia.
- Sintesis de datos de razonamiento matematico: generar respuestas largas con verificador nativo para filtrar y construir corpus de entrenamiento, con la advertencia de que el seguimiento de instrucciones sigue siendo debil.
- Evaluacion de agentes multi-paso: probar trayectorias de uso de herramientas a 32K de salida, teniendo en cuenta que el propio autor reporta problemas en tool-assisted math.
- Despliegue en entornos de investigacion: servir el modelo con vLLM u otro motor compatible con MoE para experimentar con generacion larga y comparar tasas de bucle en distintos contextos de runtime y carga de pesos.
- Analisis de robustez en generacion larga: medir como varian las tasas de repeticion entre ventanas de 16K y 32K, explotando que el detector examina toda la ventana de respuesta con periodos de hasta 2.048 tokens a 16K y 4.096 a 32K.

## Benchmarks y rendimiento

Datos publicados en el model card (evaluaciones unicas, con hashes de prompt coincidentes dentro de cada comparacion; no aislan la contribucion causal de cada etapa):

| Evaluacion | SFT original | Dr. Doom |
|---|---:|---:|
| Bucles en matematicas · 512 prompts · limite 16K | 139/512 (27,15%) | 12/512 (2,34%) |
| Respuestas correctas en matematicas · mismo cohorte | 232/512 (45,31%) | 283/512 (55,27%) |
| Bucles cross-domain · 100 prompts · limite 32K | 43 confirmados + 1 sin evaluar (43-44%) | 19/100 (19%) |
| Verificaciones superadas cross-domain | 19 superadas; 92 calificadas, 7 no disponibles, 1 error | 26 superadas; 94 calificadas, 6 no disponibles, 0 errores |

Datos adicionales:

| Configuracion | Bucles | Correccion |
|---|---:|---:|
| Mixed-round update 10 (matematicas, 512 prompts) | 9/512 (1,76%) | 268/512 (52,34%) |
| Piloto final en entrenamiento (matematicas, 64 prompts, 32K) | 8 | 40 correctas |

El detector exige al menos ocho copias exactas de un patron de tokens hasta el final del ultimo segmento generado; no detecta repeticion irregular o semantica y puede marcar repeticion intencionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 134 GB, por lo que no cabe en una sola GPU de 80 GB; requiere al menos 2 GPU H100 o A100 de 80 GB con paralelismo de tensor.
- Entrenamiento reportado: 40 GPU H100 (32 actores de politica/referencia y 8 de rollout), con TP=1, PP=2, CP=1, EP=16.
- Inferencia en cuantizacion de 8 bits: en torno a 67 GB de pesos, ajustado para 1 GPU H100 80 GB; no confirmado por el autor y sin variantes cuantizadas publicadas.
- Inferencia en cuantizacion de 4 bits (si se generaran): en torno a 34 GB, necesitaria al menos 2 GPU de 24 GB en consumer (por ejemplo 2x RTX 4090) o 1 GPU A100 40 GB; no hay pesos cuantizados publicados.
- Consumer GPU: en BF16 no cabe en ninguna consumer; en 4 bits necesitaria configuracion multi-GPU de 24 GB.
- Opciones de despliegue: vLLM, SGLang o TGI por soporte de MoE; llama.cpp/Ollama no estan confirmados por ausencia de pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia de categoria MoE de gran tamano total con pocos parametros activos pueden citarse alternativas conocidas (Qwen3-30B-A3B, Mixtral 8x7B), pero sus cifras no se verifican en esta busqueda y no se comparan aqui por no disponer de resultados homologos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| Grug-67B-A2B-Datakit-SFT-262K-dr-doom | 67,08B | no disponible (~2B estimados) | 262.144 | openmdw-1.1 | Solo de-looping y correccion matematica |
| Alternativas MoE comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que no ha sido probado ni evaluado de forma exhaustiva y que no esta validado para uso en produccion.
- Objetivo de campana no alcanzado: no se logro el umbral estricto de menos del 5% de bucles por dominio (menos del 2% en dominios grandes).
- Rendimiento fragil en dominios clave: seguimiento de instrucciones, codificacion y matematicas asistidas por herramientas siguen siendo problematicos.
- Detector de bucles limitado: exige al menos ocho repeticiones exactas, no detecta repeticion irregular o semantica y puede marcar repeticion intencionada; las historias de herramientas sin evaluar generan cotas conservadoras.
- Contexto largo no validado: los 262.144 tokens son un valor de configuracion, no una capacidad medida.
- Evaluaciones no concluyentes: son evaluaciones unicas en contextos distintos de runtime y carga de pesos, no aislan la contribucion causal de cada etapa y no establecen una clasificacion estadisticamente definitiva.
- Idiomas soportados: no disponibles; el modelo card esta en ingles y no documenta cobertura multilingue.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la mejora de correccion matematica no implica fiabilidad general.
- Restricciones de licencia: la licencia es openmdw-1.1; no se detallan en la informacion disponible los terminos concretos para uso comercial, por lo que deben revisarse antes de cualquier despliegue.
- Ausencia de cuantizaciones publicadas: no hay pesos GGUF ni variantes de baja precision, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Modelo base: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21
- MarinSkyRL (PR de FTPO): https://github.com/marin-community/MarinSkyRL/pull/887
- Referencia Antidoom: https://github.com/Liquid4All/antidoom/tree/bd6a126476e18554b0cacaea3fd9f258fdde1f97
- Issue de experimento Marin: https://github.com/marin-community/marin/issues/9691
- Discusion de lecciones aprendidas: https://github.com/marin-community/marin/issues/9691#issuecomment-5958700252
- Tabla de resultados por dominio: selected-domain-results.md (ruta relativa en el repositorio)
- Evidencia de evaluacion cross-domain: evidence/cross-domain-mixed-long-smoke-v2-step2-loops.json (ruta relativa en el repositorio)
- Experiment tracker: experiment-tracker.md (ruta relativa en el repositorio)
- Configuraciones y fuentes: directorios configs/ y source/ del repositorio
