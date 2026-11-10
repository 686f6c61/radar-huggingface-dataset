# fse/bekko-aegis2-prompt-safety-classifier

## Resumen

fse/bekko-aegis2-prompt-safety-classifier es un clasificador lineal de seguridad de prompts entrenado con scikit-learn y empaquetado como cabeza completa (encoder incluido) para su uso con la libreria `fse`. Lo desarrolla el usuario `fse` y se apoya en el encoder estatico `hotchpotch/bekko-static-embedding-v1`, sobre el que se ajusta una regresion logistica binaria que predice `safe` o `unsafe`. El modelo resuelve un problema acotado y bien definido: filtrar prompts de entrada antes de que lleguen a un LLM generativo, como primera capa de un pipeline de moderacion.

La relevancia del artefacto esta en su procedencia y en su metodologia: se entrena sobre el dataset NVIDIA Aegis AI Content Safety 2.0 (CC BY 4.0), complementado con AART de Google, hh-rlhf de Anthropic, DAN y Do-Not-Answer, con un protocolo explicito de exclusion de leakage, normalizacion NFC y separacion estricta entre train, validation y test. No es un modelo generativo ni un transformer profundo: es una cabeza lineal de 206 millones de parametros totales (practicamente todos correspondientes al encoder congelado), con licencia MIT y solo idioma ingles.

El interes practico es doble: por un lado, ofrece una alternativa ligera y auditable a los clasificadores de seguridad basados en LLM; por otro, su model card documenta con inusual detalle las decisiones de seleccion, las fuentes de datos y las metricas held-out, lo que facilita la evaluacion critica antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder estatico (`bekko-static-embedding-v1`) + regresion logistica lineal (scikit-learn, lbfgs) |
| Parametros totales | 206.615.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; el encoder es estatico, no requiere cuantizacion para inferencia) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (cabeza y encoder); datos de entrenamiento bajo CC BY 4.0, MIT, Apache-2.0 segun fuente |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo sino un clasificador de dos etapas: primero un encoder de embeddings estaticos (`hotchpotch/bekko-static-embedding-v1`, revision `c18167b8f244c1bc6de21ce9b710bac8a29c4615`, con `normalize=False` y sin truncado de dimensiones) y despues una regresion logistica con `StandardScaler` previo, `max_iter=1000`, `C=0.1` seleccionado por busqueda sobre `C=[0.1, 1.0, 10.0]` y semilla 17. La cabeza de seguridad es binaria; existe una cabeza hermana de categorias (`fse/bekko-aegis2-prompt-categories-classifier`) que usa `OneVsRestClassifier` y que puede agruparse con esta mediante `fse.Heads`, compartiendo tokenizacion y pooling en una sola pasada.

El entrenamiento usa las 22.537 filas limpias del dataset Aegis 2.0 a proporciones naturales de clase, con pesos de clase balanceados. El protocolo de limpieza es notablemente riguroso: normalizacion NFC, colapso de espacios, recorte y casefold (`prompt-normalize@1`); el conjunto de train excluye coincidencias normalizadas presentes en validation o test, y validation excluye coincidencias con test. Se descartan filas con etiquetas conflictivas, filas vacias o reconstruibles y las marcas `REDACTED`. Solo se codifican las cadenas de prompt: las respuestas y sus etiquetas se descartan, y los ficheros de rechazo (refusal) nunca se cargan. La seleccion de hiperparametros se hace sobre Average Precision (AP) de `unsafe` en validation, con desempate hacia el `C` menor, y Bekko solo sustituye a POTION si la mejora de AP es de al menos 0,01 en ambas cabezas. El conjunto de test se usa unicamente para filtros congelados de fuente y exclusion de leakage, nunca para seleccion.

## Capacidades

- Clasificacion binaria de prompts como `safe` o `unsafe` (etiquetas en ese orden), con regla de decision `logit > 0`; en caso de igualdad se selecciona `safe`.
- Clasificacion multietiqueta de categorias de dano mediante la cabeza hermana: `hate_identity_hate`, `sexual`, `suicide_self_harm`, `violence`, `guns_illegal_weapons`, `pii_privacy`, `criminal_planning_confessions`, `harassment`, `controlled_regulated_substances` y `profanity`.
- Agrupacion de ambas cabezas en una sola pasada de tokenizacion y pooling mediante `fse.Heads`, con salida en probabilidad (`output="proba"`).
- Deteccion de prompts maliciosos en ingles de diversa procedencia: contenido Aegis 2.0, prompts generados por PaLM en AART, conversaciones de hh-rlhf, jailbreaks del corpus DAN y preguntas de Do-Not-Answer.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un clasificador de texto.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Filtrado previo de entrada en un chatbot: el clasificador se situa antes del LLM generativo para descartar o marcar prompts `unsafe` en ingles, reduciendo la superficie de ataque de jailbreaks y contenido danino sin coste de inferencia de un modelo grande.
- Moderacion por categorias en foros y comunidades: usando la cabeza de categorias se puede enrutar cada prompt a la politica correspondiente (por ejemplo, `harassment` a revision humana y `profanity` a filtrado automatico) en lugar de aplicar un bloqueo binario.
- Guardrail en pipelines RAG: antes de recuperar documentos o invocar al modelo, el clasificador filtra la consulta del usuario; su bajo coste permite ejecutarlo en cada peticion de un servicio de alta concurrencia.
- Deteccion de intentos de jailbreak en logs: procesar por lotes prompts historicos con `fse.Heads` para identificar patrones DAN o de AART y alimentar paneles de abuso.
- Cumplimiento y auditoria: registrar la puntuacion de seguridad junto a cada peticion para evidenciar controles de contenido en despliegues sujetos a politicas internas, dado que el modelo y los datos tienen procedencia documentada.
- Investigacion sobre seguridad de LLM: servir como baseline lineal reproducible frente a clasificadores basados en LLM, con hiperparametros, semilla y protocolo de leakage publicados.
- Preetiquetado de datasets: generar etiquetas `safe`/`unsafe` preliminares sobre corpus en ingles para revision humana posterior, acelerando la anotacion.

## Benchmarks y rendimiento

Evaluacion held-out unica tras el congelado del modelo, con intervalos percentiles al 95 % por remuestreo de grupos de prompts normalizados (1.000 remuestreos, semilla 17). AP calculada con `sklearn.metrics.average_precision_score`, no como area trapezoidal de la curva PR.

| Subconjunto | Etiqueta | Filas | Positivos | AP | Intervalo AP 95 % | Precision | Recall |
|---|---|---:|---:|---|---:|---:|---:|
| all | safe | 1928 | 889 | 0.805655 | [0.780198, 0.831410] | 0.732240 | 0.753656 |
| all | unsafe | 1928 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

Los datos de la tabla de categorias y de las metricas completas (recuentos negativos, grupos, F1, ROC AUC y remuestreos omitidos) no estan disponibles en el extracto proporcionado. Las filas con menos de 20 positivos se consideran exploratorias y muy inciertas. Las puntuaciones no estan calibradas: los pesos balanceados hacen que no sean probabilidades de intencion danina.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 206,6 millones de parametros en safetensors y un repositorio de 0,4 GB, la inferencia en precision completa requiere del orden de 1 GB o menos, aunque el dato exacto no se publica.
- GPU recomendadas: no disponibles; el modelo es lo bastante pequeno para ejecutarse en CPU, y no se documentan requisitos de GPU especificos.
- GPU de consumo: cabe previsiblemente en cualquier GPU de consumo moderna (RTX 3060 en adelante), aunque el autor no lo confirma.
- Despliegue: la via documentada es la libreria `fse` (version 2.0.0 para esta cabeza; se requiere una build master con soporte multilabel o `fse` 2.1 para agrupar cabezas). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fse/bekko-aegis2-prompt-safety-classifier | 206,6 M | no disponible | Encoder estatico + regresion logistica | MIT | Hugging Face |
| Clasificadores de seguridad basados en LLM (familia Llama Guard) | no disponible | no disponible | LLM generativo con prompt de politica | no disponible | no disponible |
| fse/bekko-aegis2-prompt-categories-classifier | no disponible | no disponible | Misma arquitectura, cabeza multietiqueta | MIT | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo ingles: los prompts en otros idiomas no estan cubiertos y pueden clasificarse de forma poco fiable.
- Puntuaciones sin calibrar: los pesos balanceados implican que las salidas no son probabilidades de intencion danina; no deben interpretarse como tales en produccion.
- Las dos cabezas predicen de forma independiente y pueden contradecirse entre si.
- La categoria `Threat` y `Sexual (minor)` quedan excluidas por el protocolo revisado, de modo que el modelo no cubre esos casos.
- El mapeo de `Needs Caution` a `safe` aplica una politica permisiva que puede no encajar con todos los despliegues.
- La procedencia de AART no garantiza que todos los prompts derivados de PaLM se detecten; los terminos de la API de PaLM no fueron evaluados y el autor lo califica explicitamente como informe de procedencia, no como asesoramiento legal.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos negativos y falsos positivos en la clasificacion; las filas con menos de 20 positivos son exploratorias y muy inciertas.
- Dependencia de la libreria `fse`: las cabezas independientes plegadas no pueden agruparse y no se suministran ficheros sueltos, lo que limita su uso fuera de ese ecosistema.
- La licencia MIT cubre cabeza y encoder, pero los datos de entrenamiento tienen licencias heterogeneas (CC BY 4.0, MIT, Apache-2.0) que conviene revisar antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/bekko-aegis2-prompt-safety-classifier
- Cabeza de categorias: https://huggingface.co/fse/bekko-aegis2-prompt-categories-classifier
- Encoder base: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Dataset NVIDIA Aegis 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Paper Aegis 2.0: https://arxiv.org/abs/2501.09004
- Paper AART: https://arxiv.org/abs/2311.08592
- Dataset hh-rlhf: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Corpus DAN (jailbreak_llms): https://github.com/verazuo/jailbreak_llms
- Do-Not-Answer: https://github.com/Libr-AI/do-not-answer
- Copia archivada de AART: https://github.com/xxxx-dddd/aart-ai-safety-dataset/tree/fcdb2a8a3343a992cd8cbfd53eac797ac047c26f
