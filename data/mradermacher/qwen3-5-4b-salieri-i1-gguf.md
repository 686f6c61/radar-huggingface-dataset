# mradermacher/Qwen3.5-4B-Salieri-i1-GGUF

## Resumen

Qwen3.5-4B-Salieri-i1-GGUF es una cuantizacion en formato GGUF del modelo Jitheswar/Qwen3.5-4B-Salieri, un ajuste fino derivado de la familia Qwen3.5 orientado a tareas de programacion, agentes y SWE (ingenieria de software). El trabajo de cuantizacion lo realiza mradermacher, un perfil conocido en HuggingFace por producir versiones GGUF optimizadas con matrices de importancia (imatrix) para despliegue en llama.cpp y otros runtimes compatibles. La model card lo etiqueta como modelo de vision, con soporte de tool calling, razonamiento y entrenamiento mediante DPO sobre el dataset nvidia/Open-SWE-Traces.

El modelo base declara 4B en el nombre, pero los pesos safetensors publicados en el repositorio de cuantizacion suman 1.797.272 parametros totales, un dato que no coincide con la nomenclatura y que conviene verificar contra el repositorio original antes de planificar despliegues. La licencia es Apache 2.0 y los idiomas declarados son ingles, chino y multilingue. El repositorio de cuantizacion tiene un tamano de 0.0 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que indica que se trata de una publicacion muy reciente (creada el 4 de noviembre de 2026) sin validacion comunitaria.

La relevancia de esta ficha radica en que combina tres piezas: un modelo base especializado en agentes de codigo, un ajuste fino con DPO sobre trazas SWE reales de NVIDIA y una capa de cuantizacion con imatrix que permite ejecucion local. Para equipos que evaluan modelos pequenos de agente en entornos con recursos limitados, esta variante GGUF es una via practica de prueba, siempre con la cautela de que la informacion publicada es escasa y parcialmente contradictoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles finos no disponibles) |
| Parametros totales | 1.797.272 (segun safetensors del repo de cuantizacion; el nombre indica 4B, discrepancia sin resolver) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun la lista de quants de la model card) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de la etiqueta qwen3.5 y la referencia a transformers. El modelo base Jitheswar/Qwen3.5-4B-Salieri se presenta como un ajuste fino de Qwen3.5 con entrenamiento DPO (Direct Preference Optimization) sobre el dataset nvidia/Open-SWE-Traces, un conjunto de trazas de ingenieria de software publicadas por NVIDIA. Las etiquetas incluyen coding, agent, swe, tool-calling, dpo, unsloth y reasoning, lo que sugiere un pipeline de ajuste fino supervisado seguido de optimizacion de preferencias, probablemente con herramientas de Unsloth para eficiencia de memoria.

La model card indica que el modelo es de vision y que los ficheros mmproj, si existen, se alojan en el repositorio estatico hermano (mradermacher/Qwen3.5-4B-Salieri-GGUF). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni detalles de RLHF mas alla de la mencion a DPO. La cuantizacion i1 utiliza matrices de importancia (imatrix) generadas por el propio cuantizador, un enfoque que mejora la perplejidad de las cuantizaciones de baja precision frente a las estaticas equivalentes; la model card enlaza graficos comparativos de terceros (ikawrakow, Artefact2) sobre la calidad relativa de los tipos de quant.

## Capacidades

- Generacion de texto y razonamiento, con etiqueta explicita de reasoning en la model card.
- Programacion y tareas de ingenieria de software (etiquetas coding y swe), presumiblemente entrenado sobre trazas SWE reales.
- Tool calling / function calling, segun la etiqueta tool-calling.
- Comportamiento agentico y razonamiento multi-paso, derivado de las etiquetas agent y swe.
- Capacidades multilingues limitadas a ingles, chino y multilingue generico; no se declara castellano.
- Capacidad de vision declarada en la model card, con ficheros mmproj en el repositorio estatico hermano (no confirmado en este repositorio).
- Ajuste por preferencias (DPO) que, segun la model card, alinea las respuestas hacia tareas de codigo y agentes.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o CLIs mediante llama.cpp u Ollama para autocompletar, explicar y refactorizar codigo, aprovechando el ajuste sobre trazas SWE y su naturaleza GGUF de bajo consumo.
- Agente de resolucion de issues en repositorios: con soporte de tool calling, puede encadenar lectura de ficheros, ejecucion de tests y edicion de parches en pipelines de CI, si bien requiere validacion humana por el riesgo de alucinacion.
- Automatizacion de tareas de mantenimiento de codigo: generacion de tests unitarios, migraciones de API y actualizacion de dependencias en lotes, usando el modelo como motor de sugerencias con revision posterior.
- Prototipado de pipelines agenticos: al ser un modelo pequeno en GGUF, sirve para validar arquitecturas de agentes multi-paso y tool calling en entornos de desarrollo antes de escalar a modelos mayores.
- Despliegue en hardware de consumo: cuantizaciones Q2 a Q6 permiten ejecucion en GPUs consumer y en CPU, util para demos, entornos educativos y pruebas offline sin infraestructura cloud.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de imatrix y de quants estaticos en el repositorio hermano permite medir el impacto de la precision en tareas de codigo y razonamiento.
- Generacion asistida de documentacion tecnica y resumenes de trazas SWE, aprovechando el entrenamiento sobre datos de ingenieria de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, porque el numero de parametros publicado (1.797.272) no coincide con la nomenclatura 4B. Si se asume un modelo de 4B, las cuantizaciones Q4_K_M ocuparian del orden de 2,5 a 3 GB y Q8 del orden de 4 a 5 GB; estas cifras son estimaciones genericas, no datos del repositorio.
- GPU recomendadas: no disponibles. Para un modelo de 4B en Q4 cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y, en general, cualquier GPU consumer con 6 GB o mas; para A100 y H100 sobraria capacidad, pero no hay datos oficiales.
- Cabe en GPU consumer: si, presumiblemente en la mayoria de GPUs con 6 GB o mas en cuantizaciones Q4 o inferiores, sujeto a verificacion del tamano real.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el repositorio declara endpoints_compatible y libreria transformers para el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Salieri-i1-GGUF (este) | 1.797.272 segun safetensors; nombre indica 4B | no disponible | Apache 2.0 | GGUF (i1 imatrix) | Ajuste DPO sobre trazas SWE; tool calling y agentes |
| Qwen3.5-4B-Salieri-GGUF (estatico, mismo autor) | mismo modelo base | no disponible | Apache 2.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix; incluye mmproj de vision |
| Jitheswar/Qwen3.5-4B-Salieri (modelo base) | no disponible | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Alternativas de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Discrepancia critica de parametros: el nombre indica 4B pero los safetensors del repositorio suman 1.797.272 parametros; verificar contra el repositorio original antes de cualquier despliegue.
- Informacion muy escasa: 0 descargas y 0 likes en el momento de la consulta, creado el 4 de noviembre de 2026; no hay validacion comunitaria ni benchmarks publicados.
- Riesgo de alucinacion: inherente a modelos de este tamano y a ajustes sobre trazas de codigo; no se han publicado evaluaciones de fiabilidad.
- Idiomas: solo se declaran ingles, chino y multilingue generico; el castellano no esta confirmado y el rendimiento en espanol es desconocido.
- Contexto no documentado: se desconoce la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Vision no confirmada en este repositorio: la model card remite los ficheros mmproj al repositorio estatico hermano; la capacidad visual no esta verificada aqui.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset nvidia/Open-SWE-Traces por posibles restricciones adicionales.
- Cuantizaciones de muy baja precision (IQ1, IQ2, Q2) degradan sensiblemente la calidad en tareas de razonamiento y codigo; para produccion se recomienda Q4_K_M o superior.
- Sin garantias de produccion: al no haber benchmarks ni validacion, no debe usarse como unico motor en sistemas criticos sin evaluacion propia.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.5-4B-Salieri-i1-GGUF
- Repositorio estatico hermano (quants sin imatrix y posibles mmproj): https://huggingface.co/mradermacher/Qwen3.5-4B-Salieri-GGUF
- Modelo base: https://huggingface.co/Jitheswar/Qwen3.5-4B-Salieri
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Pagina de overview del cuantizador para este modelo: https://hf.tst.eu/model#Qwen3.5-4B-Salieri-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
