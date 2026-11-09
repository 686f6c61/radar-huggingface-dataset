# kotoshu/grammar-ko

## Resumen

grammar-ko (v10) es un modelo de corrección gramatical del coreano (Korean Grammatical Error Correction, GEC) desarrollado por el usuario kotoshu. Se trata de un etiquetador de tokens de estilo GECToR, es decir, un modelo que no genera texto libre sino que predice etiquetas de edición sobre cada token de la frase de entrada (mantener, reemplazar, insertar, borrar), lo que lo hace especialmente adecuado para tareas de post-edición rápida y determinista. Se distribuye como un único fichero ONNX cuantizado a int8, sin necesidad de runtime de Python, lo que facilita su despliegue en entornos ligeros.

El modelo se entrenó sobre 359.212 pares de corrupción equilibrados (intercambios de partículas josa, conjugaciones verbales y adjetivales atestiguadas, y confundibles homófonos) construidos a partir de un corpus de Wikipedia en coreano. Según la model card, obtiene un F0.5 de 0,394 (precisión 0,61, recall 0,16) sobre una partición de validación de 1.582 frases con un scorer estricto de spans, decodificado con margin gate 1.0 y 4 rondas. El autor lo compara con los pesos coreanos previamente publicados del "grammar-cjk ko cell", que obtienen 0,114 en la misma partición.

La relevancia actual del modelo es acotada pero concreta: cubre un nicho (GEC coreano) con un artefacto pequeño (0,5 GB de repo), licencia permisiva BSD-2-Clause y despliegue sin dependencias de Python, lo que lo hace atractivo para integraciones en producción de bajo coste. No obstante, sus métricas son modestas en términos absolutos y el proyecto no cuenta aún con tracción en Hugging Face (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GECToR-style token tagger (etiquetado de ediciones por token), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `gec-tagger.int8.onnx`) |
| Idiomas soportados | coreano (ko) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (int8), con vocabulario auxiliar en JSON (`labels.json`, `pieces.json`, `charsmap.json`, `tokenizer.json`, `tokenizer_config.json`, `keep_ids.json`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: en lugar de un modelo seq2seq que regenera la frase completa, se trata de un etiquetador que, para cada token de la entrada, predice una etiqueta de edición (mantener, reemplazar por otro token, insertar antes o borrar). Este enfoque permite correcciones más conservadoras y deterministas, y facilita la decodificación iterativa. El artefacto se distribuye como un único fichero ONNX cuantizado a int8, pensado para cargarse a través de la gema `kotoshu` (según indica la model card) sin runtime de Python. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los detalles del backbone transformer subyacente.

El entrenamiento se realizó sobre 359.212 pares de corrupción equilibrados generados a partir de un corpus de Wikipedia en coreano. Las corrupciones cubren tres familias: intercambios de partículas josa, conjugaciones verbales y adjetivales atestiguadas, y confundibles homófonos, muestreadas de forma uniforme bajo lo que el autor denomina "ley de forma atestiguada". No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación; el pipeline parece centrado exclusivamente en el preentrenamiento supervisado sobre pares sintéticos de corrupción-corrección.

## Capacidades

- Corrección gramatical del coreano a nivel de token: partículas (josa), conjugaciones verbales y adjetivales, y confundibles homófonos.
- Etiquetado de ediciones (estilo GECToR): predice mantener, reemplazar, insertar o borrar por token, lo que permite un control fino de la corrección.
- Decodificación iterativa con margin gate configurable (en la evaluación se usa margin gate 1.0 y 4 rondas).
- Inferencia sobre ONNX int8, sin runtime de Python, adecuada para entornos embebidos o servicios ligeros.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe: limitada al coreano según la etiqueta de idioma (`ko`) y la model card.

## Casos de uso

- Post-edición de textos académicos o periodísticos en coreano: el modelo puede aplicarse sobre borradores para corregir partículas y conjugaciones antes de la revisión humana, aprovechando su naturaleza de etiquetador conservador que no reescribe la frase completa.
- Preprocesamiento en pipelines de NLP: al ser un fichero ONNX int8 sin dependencias de Python, puede insertarse como paso previo de normalización gramatical en pipelines de clasificación, extracción de entidades o análisis de sentimiento sobre coreano.
- Herramientas de escritura asistida en aplicaciones web o de escritorio: la carga mediante la gema `kotoshu` y el tamaño reducido del artefacto (repo de 0,5 GB) permiten integrarlo en clientes ligeros o extensiones.
- Filtrado de calidad en corpus coreanos: puede usarse para detectar y corregir errores frecuentes (josa, conjugaciones, homófonos) en datasets recolectados de la web antes de reentrenar otros modelos.
- Corrección en entornos sin Python: al distribuirse como ONNX puro, encaja en servicios escritos en otros lenguajes (Ruby mediante la gema mencionada, o cualquier runtime ONNX) donde no se quiere arrastrar un stack de Python.
- Evaluación comparativa de GEC coreano: sirve como baseline reproducible (con scorer estricto de spans y partición de 1.582 frases) para comparar futuros modelos de corrección gramatical en coreano.

## Benchmarks y rendimiento

| Benchmark | Metrica | grammar-ko (v10) | grammar-cjk ko cell (baseline) |
|---|---|---|---|
| Held-out slice (1.582 frases, strict span scorer) | F0.5 | 0,394 | 0,114 |
| Held-out slice (1.582 frases, strict span scorer) | Precision | 0,61 | no disponible |
| Held-out slice (1.582 frases, strict span scorer) | Recall | 0,16 | no disponible |

Los resultados corresponden a la decodificación del propio artefacto int8 con margin gate 1.0 y 4 rondas, según la model card. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,5 GB y el fichero principal es `gec-tagger.int8.onnx` cuantizado a int8, por lo que la huella de memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible; por el tamaño del artefacto, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se confirma en la información disponible.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del fichero int8, aunque no se documenta un requisito mínimo oficial.
- Opciones de despliegue: ONNX Runtime (cualquier lenguaje con bindings), gema `kotoshu` (Ruby) según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un etiquetador ONNX de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F0.5 (misma particion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| grammar-ko (v10) | GECToR-style token tagger, ONNX int8 | no disponible | no disponible | 0,394 | BSD-2-Clause | Hugging Face (kotoshu/grammar-ko) |
| grammar-cjk ko cell (pesos previos) | GEC coreano (familia grammar-cjk) | no disponible | no disponible | 0,114 | no disponible | Pesos previamente publicados (referenciados en la model card) |
| Otros correctores GEC coreanos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con los pesos previos de la familia grammar-cjk citados por el autor. No se dispone de datos de otros modelos comparables de GEC coreano en la informacion proporcionada.

## Limitaciones y advertencias

- Métricas modestas en términos absolutos: F0.5 de 0,394 con recall bajo (0,16), lo que implica que el modelo deja pasar muchas correcciones necesarias; la precisión (0,61) es razonable pero no alta.
- Riesgo de alucinación limitado por diseño (etiquetador, no generador), pero posible sobrerrección o corrección incorrecta en contextos ambiguos, especialmente en homófonos y conjugaciones.
- Cobertura restringida al coreano; no soporta otros idiomas.
- El entrenamiento se basa en corrupciones sintéticas sobre Wikipedia, lo que puede no reflejar la distribución de errores en otros dominios (redes sociales, textos técnicos, habla coloquial).
- Licencia BSD-2-Clause: permisiva para uso comercial, pero conviene revisar las condiciones de atribución y la ausencia de garantías.
- Proyecto sin tracción en Hugging Face (0 descargas, 0 likes en el momento de la consulta) y con documentación escasa: no se detallan parámetros, contexto, ni procedencia exacta del backbone.
- No se documentan evaluaciones de sesgo, robustez ni comportamiento en producción; se recomienda validación propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kotoshu/grammar-ko
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
