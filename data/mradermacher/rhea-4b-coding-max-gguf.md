# mradermacher/Rhea-4B-Coding-max-GGUF

## Resumen

Rhea-4B-Coding-max-GGUF es la version cuantizada en formato GGUF del modelo roskosmos19/Rhea-4B-Coding-max, un modelo de lenguaje de 4.022 millones de parametros especializado en generacion de codigo y flujos de trabajo con agentes. La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp, Ollama y otras herramientas compatibles con este formato. El modelo base se presenta como un merge orientado a tareas de codigo, razonamiento multi-paso y uso como agente, con un enfasis declarado en funcionamiento sin filtros de censura (uncensored).

El modelo parte de una arquitectura transformer de aproximadamente 4.000 millones de parametros, un tamano que lo situa en la gama de modelos pequenos que pueden ejecutarse en hardware de consumo. Se ha entrenado sobre los datasets Aquiles-ai/Athenea-Coding-100k y roskosmos19/Rhea-Coding, y su model card lo etiqueta como un merge, lo que sugiere que se ha construido combinando pesos de otros modelos en lugar de entrenarse desde cero. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de codigo de 4B en local: el repositorio incluye cuantizaciones desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite elegir el equilibrio entre calidad y consumo de memoria segun el hardware disponible. No obstante, la informacion publicada es escasa en cuanto a benchmarks, longitud de contexto y composicion exacta del entrenamiento, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos; detalles no disponibles) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (segun la model card); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer de aproximadamente 4.000 millones de parametros. La model card etiqueta el modelo como merge, lo que indica que los pesos se han obtenido combinando modelos existentes mediante alguna tecnica de fusion, no mediante un entrenamiento desde cero. Los datasets declarados son Aquiles-ai/Athenea-Coding-100k y roskosmos19/Rhea-Coding, ambos orientados a codigo, aunque no se especifica el numero de tokens, la composicion exacta ni si hubo fases de RLHF o DPO.

Entre las etiquetas del modelo aparecen terminos como multi-pass, reasoning, Claude y Mythos, que sugieren un enfasis en razonamiento iterativo y en la generacion de codigo al estilo de asistentes tipo Claude, pero la model card no aporta documentacion tecnica que respalde estos terminos con detalles concretos. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es estatica (quantize_version 2) y existe una version alternativa con quants ponderados por imatrix en el repositorio mradermacher/Rhea-4B-Coding-max-i1-GGUF.

## Capacidades

- Generacion de codigo: el modelo esta especializado en tareas de programacion, segun los datasets de entrenamiento y las etiquetas de la model card.
- Razonamiento multi-paso: la etiqueta multi-pass sugiere capacidad para resolver problemas en varias etapas, aunque no se documenta el mecanismo.
- Uso como agente: la etiqueta agent indica que esta pensado para flujos de trabajo autonomos, si bien no se detalla el soporte concreto de tool calling o function calling.
- Funcionamiento sin censura: la etiqueta uncensored indica que el modelo no incorpora los filtros habituales de rechazo, lo que puede ser util en entornos controlados pero incrementa el riesgo de contenido inapropiado.
- Multilingue: la model card solo declara ingles (en); no hay informacion sobre otros idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Asistencia de programacion en local: el modelo puede integrarse en editores o IDE mediante llama.cpp u Ollama para autocompletar y generar funciones, aprovechando que las cuantizaciones Q4_K_M (2,6 GB) caben en GPUs de consumo y ofrecen un buen equilibrio entre calidad y velocidad.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba, una tarea repetitiva que se beneficia de un modelo pequeno y rapido ejecutado en local sin coste por token.
- Refactorizacion y explicacion de codigo: con sus 4B de parametros puede analizar funciones y proponer mejoras o documentacion, adecuado para pipelines internos donde no se quiere enviar codigo propietario a APIs externas.
- Automatizacion de tareas de agente en entornos controlados: la etiqueta agent y el caracter uncensored lo hacen util para prototipos de agentes que ejecutan comandos o editan ficheros en sandboxes, aunque requiere validacion adicional por la falta de documentacion sobre tool calling.
- Educacion y aprendizaje de programacion: al ejecutarse en hardware modesto, sirve como tutor local para explicar conceptos y corregir ejercicios sin depender de servicios en la nube.
- Procesamiento por lotes de documentacion tecnica: puede generar docstrings y comentarios para grandes bases de codigo en lotes nocturnos, usando la cuantizacion Q8_0 (4,4 GB) cuando se prioriza la calidad sobre la velocidad.
- Investigacion sobre merges y cuantizacion: util para estudiar como se comportan los merges de modelos de codigo tras cuantizaciones agresivas (Q2_K, Q3_K), comparando la degradacion de calidad frente al modelo base en f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 3 GB con Q4_K_M (2,6 GB de pesos mas overhead de contexto), alrededor de 5 GB con Q8_0 y unos 9-10 GB con f16.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4/Q5; para f16 se recomienda una GPU de 12 GB o superior (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 6-8 GB de VRAM puede ejecutar Q4_K_M o Q5_K_M; las cuantizaciones Q2_K y Q3_K_S caben incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con transformers, vLLM o TGI, aunque esta version concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; en un modelo de 4B con Q4_K_M en una GPU de consumo es razonable esperar decenas de tokens por segundo, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rhea-4B-Coding-max-GGUF | 4,02B | no disponible | Apache 2.0 | GGUF | Especializado en codigo y agentes, uncensored, merge |
| Qwen2.5-Coder-3B | 3,09B | 32.768 tokens (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Referencia consolidada en codigo de tamano similar |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens (segun su model card publica) | Llama 3.2 Community License | safetensors, GGUF | Proposito general, no especializado en codigo |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 tokens (segun su model card publica) | DeepSeek License | safetensors, GGUF | Mas pequeno, menor calidad esperada |

La comparativa con Qwen2.5-Coder-3B y Llama-3.2-3B-Instruct es la mas directa por tamano y disponibilidad en GGUF. No obstante, para Rhea-4B-Coding-max no hay benchmarks publicados, por lo que no es posible establecer una comparacion cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad real frente a alternativas consolidadas.
- Falta de documentacion tecnica: se desconoce la longitud de contexto, la composicion del dataset, el proceso de merge y si hubo alineacion (RLHF/DPO), lo que dificulta predecir su comportamiento en produccion.
- Riesgo de alucinacion: como todo modelo de 4B, es propenso a inventar APIs, funciones o dependencias inexistentes; el codigo generado debe revisarse y probarse siempre.
- Modelo uncensored: la ausencia de filtros de rechazo implica que puede generar contenido inapropiado o inseguro, lo que exige moderacion adicional en aplicaciones expuestas a usuarios finales.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge conviene verificar que los modelos de origen no impongan restricciones adicionales, algo que la model card no aclara.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad en tareas de codigo, donde la precision sintactica es critica; se recomienda Q4_K_M o superior para uso real.
- Fecha de creacion inusual: la model card indica 2026, lo que puede indicar metadatos inconsistentes; conviene verificar la procedencia del modelo base antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rhea-4B-Coding-max-GGUF
- Modelo base: https://huggingface.co/roskosmos19/Rhea-4B-Coding-max
- Quants con imatrix: https://huggingface.co/mradermacher/Rhea-4B-Coding-max-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Rhea-4B-Coding-max-GGUF
- Dataset Aquiles-ai/Athenea-Coding-100k: https://huggingface.co/datasets/Aquiles-ai/Athenea-Coding-100k
- Dataset roskosmos19/Rhea-Coding: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
