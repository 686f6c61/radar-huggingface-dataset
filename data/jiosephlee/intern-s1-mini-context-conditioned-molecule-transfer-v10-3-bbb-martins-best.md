# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-bbb-martins-best

## Resumen

`jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-bbb-martins-best` es un ajuste fino de 8.201.221.120 parámetros (unos 8,2 mil millones) construido sobre `jiosephlee/Intern-S1-mini-lm` y publicado por el usuario jiosephlee. El modelo está especializado en una tarea muy concreta: la transferencia de moléculas condicionada por contexto (context-conditioned molecule transfer) aplicada a datos de permeabilidad de barrera hematoencefálica (BBB) del conjunto Martins. No es, por tanto, un modelo de propósito general, sino un checkpoint seleccionado por validación para una tarea de química computacional.

El problema que aborda es el de transferir información entre ensayos (assay transfer): dado un contexto experimental, el modelo debe producir representaciones o generaciones que permitan ordenar y clasificar moléculas según su comportamiento en un ensayo destino. La selección del checkpoint se hizo maximizando `knn_binary_macro_f1_at_5` sobre validación, lo que indica que el modelo se evalúa mediante clasificación kNN sobre representaciones, no mediante generación libre de texto. El checkpoint elegido corresponde al paso de optimizador 120, tras 10 épocas de entrenamiento con semilla 42 y pérdida de objetivos suaves (soft-target loss).

Su relevancia actual es limitada pero específica: es un ejemplo de adaptación de un modelo de lenguaje de tamaño medio a un dominio científico con datos propietarios o de nicho. El repositorio no incluye información sobre licencia, idiomas soportados, arquitectura exacta ni longitud de contexto, y cuenta con cero descargas y cero "likes" en el momento de la consulta, por lo que debe considerarse un artefacto de investigación en fase temprana más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; la etiqueta del repositorio indica `qwen3`, lo que apunta a un transformer decoder-only, sin confirmacion explicita |
| Parametros totales | 8.201.221.120 (aproximadamente 8,2 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en precision completa (bf16/fp16, segun el tamano del repositorio). No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Biblioteca de carga | transformers |
| Modelo base | jiosephlee/Intern-S1-mini-lm (revision fcb667c380ae01f57693a45b4b5c2d331052a107) |
| Dataset de entrenamiento | jiosephlee/context-conditioned-molecule-transfer-v10.3-bbb-martins-mixed-continuous-intern (revision 72fe16d4112cc9b1f7c1ea5199160ef8a05d372c) |
| Tamano del repositorio | 16,4 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los metadatos del repositorio incluyen la etiqueta `qwen3`, lo que sugiere una familia transformer decoder-only, y el pipeline declarado es `text-generation`, coherente con un modelo autorregresivo. El dato de parametros totales (8.201.221.120) y el tamano del repositorio (16,4 GB) son consistentes con pesos almacenados en bf16 o fp16 sin cuantizar. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni si se emplea atencion lineal o alguna variante eficiente.

En cuanto al entrenamiento, la informacion disponible es concreta pero limitada: 10 epocas, semilla 42, pérdida de objetivos suaves (soft-target loss) y seleccion del mejor checkpoint segun la metrica de validacion `knn_binary_macro_f1_at_5`, con el paso de optimizador 120 como punto elegido. El ajuste se realizo sobre el dataset `context-conditioned-molecule-transfer-v10.3-bbb-martins-mixed-continuous-intern`, orientado a transferencia de moleculas condicionada por contexto en el dominio de barrera hematoencefálica (BBB, dataset Martins). No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto autorregresiva, segun el pipeline declarado (`text-generation`).
- Transferencia de moleculas condicionada por contexto: la tarea principal para la que fue ajustado, orientada a relacionar moleculas con el contexto del ensayo.
- Representacion de moleculas para clasificacion kNN: la seleccion del checkpoint se basa en `knn_binary_macro_f1_at_5`, lo que implica que las representaciones internas (o las salidas) se usan para clasificacion binaria por vecinos mas cercanos con k = 5.
- Ordenacion y recuperacion de candidatos: se reportan metricas NDCG@5 y correlacion de Spearman, propias de tareas de ranking.
- Prediccion relacionada con permeabilidad de barrera hematoencefálica (BBB), dado el dataset de entrenamiento (BBB Martins).
- Modo conversacional: la etiqueta `conversational` aparece en los metadatos del repositorio, aunque la model card no documenta plantillas de chat ni formato de mensajes.
- Compatibilidad con text-generation-inference y endpoints: las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponible.

## Casos de uso

- Cribado virtual de compuestos para permeabilidad BBB: el modelo se ajusto especificamente sobre el dataset Martins de barrera hematoencefálica, por lo que puede emplearse para puntuar o clasificar moleculas candidatas segun su probabilidad de atravesar la barrera, alimentando una fase de priorizacion previa a la validacion experimental.
- Transferencia de ensayos entre dianas (assay transfer): dado un contexto experimental de un ensayo origen, el modelo puede generar o representar moleculas con comportamiento esperado en un ensayo destino, reduciendo el numero de ensayos fisicos necesarios para extrapolar resultados.
- Filtrado de librerias quimicas antes de sintesis: las metricas de ranking (NDCG@5) sugieren que el modelo puede ordenar una lista de candidatos y seleccionar los mejores, lo que permite descartar compuestos de baja prioridad antes de incurrir en costes de sintesis.
- Busqueda de analogos condicionada por contexto: usando las representaciones del modelo con clasificacion kNN sobre un conjunto de referencia, se pueden recuperar moleculas similares funcionalmente, no solo estructuralmente, dentro de un contexto de ensayo dado.
- Generacion de candidatos guiada por propiedades: al ser un modelo de generacion de texto, puede emplearse para producir representaciones o cadenas de moleculas condicionadas por una descripcion de contexto (por ejemplo, una diana o un perfil de ensayo), como paso inicial de generacion de hipotesis.
- Asistente conversacional de quimica medicinal: la etiqueta `conversational` permite plantear su uso como interfaz de consulta para investigadores que necesiten explorar relaciones molecula-ensayo en lenguaje natural, siempre con validacion posterior de las respuestas.
- Investigacion metodologica sobre transferencia de conocimiento: sirve como punto de partida reproducible (semilla 42, revisiones fijadas de base y dataset) para estudiar tecnicas de ajuste con objetivos suaves en dominios cientificos.
- Integracion en pipelines de inferencia gestionada: al declarar compatibilidad con text-generation-inference y endpoints, puede desplegarse como servicio interno para que otros componentes de un pipeline de descubrimiento de farmacos consuman sus puntuaciones.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de seleccion del checkpoint, que corresponden a tareas de clasificacion y ranking (no a benchmarks estandar de modelos de lenguaje como MMLU o HumanEval, para los que no hay datos).

| Split | Macro-F1@5 | NDCG@5 | Spearman |
|---|---:|---:|---:|
| Validacion | 0,7388 | 0,7777 | 0,4180 |
| Test | 0,7048 | 0,7779 | 0,4065 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia sobre estas mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: los pesos ocupan aproximadamente 16,4 GB, a los que hay que sumar la cache KV y las activaciones; en la practica se necesitan del orden de 20-24 GB para secuencias cortas y mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, aproximadamente 5-6 GB. Estas estimaciones son orientativas: el repositorio no publica pesos cuantizados, por lo que habria que generarlos localmente.
- GPU recomendadas: A100 (40 GB o 80 GB) y H100 (80 GB) para despliegue en bf16 con margen; L40S (48 GB) y A6000 (48 GB) tambien son suficientes.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar los pesos en bf16 con contextos cortos, pero con poco margen; en cuantizacion de 4 u 8 bits cabe con holgura en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super, etc.).
- Opciones de despliegue: transformers (biblioteca declarada), text-generation-inference (etiqueta explicita), vLLM como alternativa habitual para modelos de esta familia y tamano. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa. No hay confirmacion de soporte nativo en TGI mas alla de la etiqueta.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 8,2 mil millones | No disponible | Macro-F1@5 0,7048 en test; NDCG@5 0,7779; Spearman 0,4065 | No disponible | HuggingFace, 0 descargas |
| jiosephlee/Intern-S1-mini-lm (modelo base) | No disponible (cabria esperar un orden similar, sin confirmacion) | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para establecer comparaciones cuantitativas con otros modelos de quimica computacional o de transferencia de ensayos. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su dominio.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier explotacion.
- Cero descargas y cero "likes": el modelo no tiene validacion externa ni uso documentado por terceros.
- Sin informacion sobre idiomas: no puede garantizarse el comportamiento en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no es posible planificar despliegues que dependan de ventanas largas sin una evaluacion previa.
- Riesgo de alucinacion: al ser un modelo de generacion de texto ajustado sobre un dominio cientifico estrecho, puede producir contenido quimico plausible pero incorrecto. Sus salidas deben validarse siempre experimentalmente o contra bases de datos de referencia.
- Correlacion de Spearman moderada-baja (0,4065 en test): la capacidad de ordenar moleculas por relevancia es limitada, con una caida apreciable entre validacion y test en Macro-F1@5 (0,7388 frente a 0,7048), lo que sugiere cierta sensibilidad al conjunto de evaluacion.
- Sesgo de dataset: el ajuste se realizo exclusivamente sobre datos de barrera hematoencefálica del conjunto Martins. El rendimiento fuera de ese espacio quimico o de otros ensayos no esta caracterizado.
- Sin cuantizaciones publicadas: cualquier despliegue eficiente exige convertir los pesos, con el riesgo de degradacion que ello implica y sin referencia de calidad publicada.
- Seleccion en el paso 120 con 10 epocas: puede indicar un dataset pequeno y un riesgo de sobreajuste; no se documenta el tamano del conjunto de entrenamiento.
- Ausencia de datos de entrenamiento detallados: no se especifican tokens, composicion del dataset ni fases de alineamiento, lo que dificulta auditar el comportamiento del modelo.
- Este fichero se ha elaborado a partir de metadatos y de la model card; no se ha ejecutado el modelo ni reproducido sus metricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-bbb-martins-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v10.3-bbb-martins-mixed-continuous-intern
- Registro del entrenamiento (Weights & Biases): https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/lwxveh82
- Revision del modelo base: fcb667c380ae01f57693a45b4b5c2d331052a107
- Revision del dataset: 72fe16d4112cc9b1f7c1ea5199160ef8a05d372c

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su arquitectura o su dominio de aplicacion; los resultados obtenidos no guardaban relacion con el contenido de esta ficha.
