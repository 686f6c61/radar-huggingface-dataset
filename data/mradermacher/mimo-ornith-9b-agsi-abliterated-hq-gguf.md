# mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF

## Resumen

MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF es una publicación de cuantizaciones estáticas en formato GGUF del modelo OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ, realizada por el usuario mradermacher. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión de pesos a GGUF para su uso con llama.cpp y otros runners compatibles, con el objetivo de reducir los requisitos de memoria y permitir inferencia en hardware de consumo. El repositorio ocupa 76,2 GB e incluye varias cuantizaciones, desde Q2_K (3,9 GB) hasta f16 (18,0 GB).

El modelo base es un merge de la familia "MiMo-Ornith", con 8.953.803.264 parámetros totales (unos 8,95 mil millones) según los datos de safetensors, y las etiquetas del repositorio lo asocian a la línea qwen3_5, además de marcarlo como "abliterated" y "uncensored", es decir, con los mecanismos de rechazo eliminados o atenuados. También aparece etiquetado como "merge" y "agsi", lo que indica que procede de la combinación de pesos de otros modelos y no de un entrenamiento original documentado en esta ficha.

La relevancia actual del repositorio es práctica: ofrece un modelo de ~9B orientado a razonamiento, código y uso agéntico de terminal en un formato ligero y ejecutable en local, con licencia Apache 2.0. La información disponible no incluye detalles de arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe realizarse de forma empírica sobre las cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; las etiquetas del repositorio indican qwen3_5, sin confirmacion tecnica en la informacion proporcionada |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parametros activos | no procede: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF. Ficheros publicados: Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0 y f16. La etiqueta de cuants del README menciona ademas Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, que no aparecen en la tabla de ficheros del repositorio |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en formato de pesos de HuggingFace, presumiblemente safetensors, no confirmado en esta informacion) |
| Modelo base | OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 76,2 GB |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en los datos proporcionados. Las etiquetas del repositorio incluyen "qwen3_5", lo que sugiere que el modelo base podría derivar de la familia Qwen 3.5, y "merge", que indica que los pesos proceden de la combinación de dos o más modelos en lugar de un entrenamiento desde cero. Las etiquetas "agsi" y "abliterix" aparecen sin definición ni documentación en la model card, por lo que se desconoce a qué técnica o herramienta concreta se refieren.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO u otro tipo de ajuste por preferencias. La única indicación relevante es la etiqueta "abliterated" (y "uncensored"), que en la práctica de la comunidad open source designa modelos a los que se ha aplicado una técnica de ablación de direcciones de activación para reducir la tendencia a rechazar peticiones. No se documenta en esta ficha qué método de ablación se usó, sobre qué capas ni con qué evaluación de daño colateral.

## Capacidades

Las siguientes capacidades se deducen exclusivamente de las etiquetas declaradas por el autor del repositorio original y de la cuantización; no se han verificado de forma independiente en la información disponible.

- Generación de texto conversacional, con pipeline declarado como "conversational".
- Razonamiento ("reasoning"): el modelo está etiquetado como orientado a tareas de razonamiento, presumiblemente con modos de pensamiento extendido, aunque no se documenta el formato exacto de activación.
- Generación de código ("coding").
- Uso agéntico y de terminal ("agentic", "terminal-use"): el etiquetado apunta a escenarios de ejecución de comandos y flujos multi-paso, sin especificar el protocolo de herramientas soportado.
- Multilingüismo limitado a inglés y chino ("en", "zh") según el campo language de la model card.
- Generación sin restricciones de contenido ("uncensored", "abliterated"): se ha reducido o eliminado la tendencia a rechazar peticiones.
- Compatibilidad de despliegue declarada con vLLM y llama.cpp.
- No se documenta soporte de visión, audio, tool calling estructurado ni function calling con esquema JSON en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y shell: las etiquetas "agentic" y "terminal-use" apuntan a un modelo entrenado o ajustado para proponer y encadenar comandos. Se usaría como motor de decisión de un agente local que traduce instrucciones en lenguaje natural a comandos de shell, con validación humana previa a la ejecución.
- Asistencia de programación en local: con la cuantización Q4_K_S (5,5 GB) puede ejecutarse en una GPU de consumo y ofrecer autocompletado, generación de funciones y explicación de código sin enviar el código fuente a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Integración en pipelines de CI/CD: para revisión automática de parches o generación de pruebas unitarias dentro de un runner con GPU, siempre que se valide previamente la calidad real del modelo en el lenguaje de programación objetivo.
- Investigación en seguridad y red teaming: al ser un modelo "abliterated" y "uncensored", resulta útil para estudiar patrones de generación dañina, calibrar clasificadores de contenido o analizar cómo varía la tasa de cumplimiento de peticiones problemáticas entre cuantizaciones (por ejemplo, Q8_0 frente a Q2_K).
- Despliegue en entornos aislados o sin conectividad: el formato GGUF permite ejecutar el modelo en máquinas sin acceso a internet, con llama.cpp u Ollama, en escenarios de defensa, industria o investigación con datos sensibles.
- Procesamiento bilingüe inglés-chino: traducción, resumen y generación de contenido en esos dos idiomas, excluyendo otros como el español, que no figura en el campo de idiomas soportados.
- Prototipado de razonamiento multi-paso: para experimentos académicos sobre cadenas de razonamiento, comparando el comportamiento del modelo antes y después de la ablación.
- Evaluación comparativa de cuantizaciones: dado que el repositorio publica desde Q2_K hasta f16 para el mismo modelo base, sirve como banco de pruebas para medir la degradación de calidad por nivel de cuantización en tareas de código y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los tamanos de fichero son datos del repositorio; las estimaciones de VRAM son aproximaciones derivadas de esos tamanos mas la sobrecarga de la cache KV, que depende del contexto configurado y no puede calcularse sin conocer la longitud de contexto del modelo.

- Q2_K (3,9 GB): ejecutable en GPU de 6 GB de VRAM en configuraciones de contexto corto; calidad notablemente degradada.
- Q3_K_S (4,4 GB) y Q3_K_M (4,7 GB): aptas para GPU de 8 GB, como una RTX 3060 Ti o RTX 4060.
- Q4_K_S (5,5 GB): marcada por el autor como "fast, recommended"; cabe en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB con margen para contexto.
- Q6_K (7,5 GB): "very good quality" segun el autor; recomendable con 12 GB de VRAM o mas, o repartiendo capas entre GPU y CPU.
- Q8_0 (9,6 GB): "fast, best quality"; requiere del orden de 12-16 GB de VRAM. Cabe en RTX 4080, RTX 4090, A100 y H100.
- f16 (18,0 GB): el propio autor lo califica de "overkill"; requiere 24 GB o mas de VRAM (RTX 3090, RTX 4090, L40S, A100 40 GB, H100) para una ejecución cómoda.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con una GPU de 12-24 GB; f16 queda al límite de las GPU de 24 GB.
- Opciones de despliegue declaradas en el repositorio: llama.cpp y vLLM. Ollama y otros runners compatibles con GGUF son alternativas habituales, aunque no se mencionan explícitamente en la model card.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de tokens por segundo para ninguna de las cuantizaciones.
- Nota: no hay cuantizaciones ponderadas ni con imatrix publicadas por el autor en el momento de la ficha; los ficheros disponibles son cuantizaciones estáticas.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa de parametros, contexto, rendimiento ni licencia. Como referencia de categoria se puede indicar unicamente lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF | 8,95 mil millones | no disponible | apache-2.0 | si, cuantizaciones estaticas de Q2_K a f16 |
| Alternativas de ~7B-9B de la misma categoria | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos del mismo rango de tamano (por ejemplo, variantes abliterated de la familia Qwen o Llama) requeriria datos de benchmarks que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Modelo "abliterated": la ablacion de direcciones de rechazo elimina barreras de seguridad y puede degradar capacidades generales, aumentar la generacion de contenido dañino y producir respuestas incoherentes en dominios sensibles. No se documenta en esta ficha que evaluacion de daño colateral se realizo.
- Riesgo elevado de alucinacion: no hay datos de benchmarks ni de evaluacion de fidelidad; un modelo de 9B cuantizado, especialmente en Q2_K o Q3_K, tiende a degradarse en tareas de razonamiento largo y matematicas.
- Es un merge sin documentacion de procedencia: al no detallarse los modelos combinados ni el metodo de mezcla, no puede auditarse la composicion del dataset original ni los sesgos heredados.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta garantizado ni evaluado, y probablemente sea deficiente si el modelo base no incluyo datos en espanol.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas o procesamiento de documentos extensos sin determinar experimentalmente el limite real.
- Cuantizaciones de baja precision: Q2_K, Q3_K_S y Q3_K_M degradan la calidad de forma perceptible; para tareas de codigo o razonamiento conviene Q4_K_S o superior.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se aplica al artefacto publicado; el modelo base y los modelos fusionados en el merge podrian arrastrar condiciones adicionales no declaradas en esta model card.
- Sin cuantizaciones ponderadas ni imatrix: el autor indica que no estan disponibles en ese momento, lo que limita el ajuste fino de la relacion calidad/tamano.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no existe validacion comunitaria de la calidad de estas cuantizaciones.
- Fechas de creacion y actualizacion identicas (2026-09-26): no ha habido revisiones posteriores documentadas.
- Uso responsable: dado su caracter "uncensored", no deberia desplegarse de cara al publico sin capas adicionales de moderacion, filtrado de salida y auditoria.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador de la cuantizacion, nethype GmbH: https://www.nethype.de/
