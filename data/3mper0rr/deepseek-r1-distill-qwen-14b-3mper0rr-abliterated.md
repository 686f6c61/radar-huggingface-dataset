# 3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated

## Resumen

Este repositorio contiene una version "abliterated" (modificada para eliminar el comportamiento de rechazo) del modelo DeepSeek-R1-Distill-Qwen-14B, publicada por el usuario 3MPER0RR. La model card es extremadamente escueta: se limita a indicar que se trata de una "version experimental modificada / abliterated", que se han realizado 200 intentos ("Trials: [200]") y que el estado es "probado y guardado". No se documenta el metodo de abliteracion, el dataset utilizado ni ninguna evaluacion posterior.

El modelo base, DeepSeek-R1-Distill-Qwen-14B, es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 (14.770.033.664 parametros segun los pesos safetensors del repositorio, aproximadamente 14,77 mil millones). El modelo original hereda la capacidad de razonamiento con cadena de pensamiento larga del modelo profesor DeepSeek-R1 y una ventana de contexto de 131.072 tokens, y se distribuye bajo licencia MIT.

La relevancia de esta publicacion es fundamentalmente de investigacion: los modelos abliterated interesan a quienes estudian mecanismos de rechazo, alineamiento y seguridad en modelos de lenguaje, y a quienes necesitan un modelo sin filtros de contenido para tareas creativas o de red-teaming. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no aporta datos de benchmarks, por lo que su calidad real tras la modificacion no esta verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (con RoPE y GQA), heredada del modelo base; no se documentan cambios estructurales |
| Parametros totales | 14.770.033.664 (~14,77 mil millones), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; no documentada para esta version modificada |
| Tipos de cuantizacion | El repositorio solo contiene pesos safetensors (presumiblemente BF16). No se han publicado cuantizaciones GGUF, AWQ o GPTQ propias |
| Idiomas soportados | No disponible en la model card; el modelo base esta entrenado principalmente en ingles y chino |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 29,6 GB |
| Pipeline | text-generation |
| Uso previsto declarado | Experimental, investigacion y experimentacion |

## Arquitectura y entrenamiento

La model card no describe ni la arquitectura ni el proceso de entrenamiento de esta version. Por herencia del modelo base DeepSeek-R1-Distill-Qwen-14B, se trata de un transformer decoder-only de la familia Qwen2 (aproximadamente 48 capas, atencion con consultas agrupadas y RoPE), que fue destilado por DeepSeek a partir de las salidas del modelo profesor DeepSeek-R1 mediante ajuste supervisado (SFT) sobre un corpus de muestras de razonamiento. Esa destilacion no incluye una fase de RL posterior: el comportamiento de cadena de pensamiento larga se aprende imitando las trazas del profesor, no mediante refuerzo.

La intervencion de 3MPER0RR consiste en una abliteracion, una tecnica que identifica la direccion de activacion asociada al rechazo de peticiones y la elimina del espacio de pesos (habitualmente mediante ortogonalizacion de las matrices de proyeccion). El autor solo indica "Trials: [200]", sin especificar el metodo, el conjunto de prompts utilizado para calcular la direccion de rechazo, las capas afectadas ni el impacto sobre el resto de capacidades. Tampoco se documenta ningun reentrenamiento adicional, calibracion o evaluacion posterior a la ablacion.

## Capacidades

- Generacion de texto conversacional en formato de chat, con soporte del estilo de plantilla de DeepSeek-R1 basado en etiquetas de razonamiento.
- Razonamiento con cadena de pensamiento larga (long chain-of-thought): el modelo tiende a producir trazas de pensamiento extensas antes de la respuesta final.
- Resolucion de problemas matematicos y de logica, capacidad heredada del destilado de R1.
- Generacion y comprension de codigo en tareas de programacion de nivel medio.
- Ausencia (o reduccion drastica) del comportamiento de rechazo ante peticiones que el modelo original declinaria, que es precisamente el objetivo de la abliteracion.
- Soporte de tool calling / function calling: no documentado; el modelo base no fue entrenado especificamente para ello.
- Comportamiento agentico y razonamiento multi-paso: no documentado de forma explicita, aunque el formato de cadena de pensamiento permite encadenar pasos.
- Capacidades multilingues: no disponibles en la model card; el modelo base esta orientado a ingles y chino, con competencia limitada en otros idiomas.
- Capacidades multimodales (vision, audio): no disponibles. El modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar este modelo con el DeepSeek-R1-Distill-Qwen-14B original para medir en que capas y en que medida desaparece el comportamiento de rechazo, y como afecta eso a las respuestas en dominios sensibles.
- Red-teaming y evaluacion de robustez: usar el modelo como generador de contenido adversario dentro de una bateria de pruebas controlada, aprovechando que no aplica filtros de rechazo.
- Escritura creativa sin restricciones: narrativa de ficcion con tematicas adultas, violentas o controvertidas, donde el modelo base rechazaria peticiones por politica de contenido. Requiere revision humana y cumplimiento legal en la jurisdiccion de uso.
- Asistencia al razonamiento matematico paso a paso en entornos educativos o de investigacion, aprovechando la cadena de pensamiento larga heredada del destilado de R1, siempre que la tarea no dependa de contexto superior a los 131.072 tokens del modelo base.
- Generacion de codigo en flujos internos de desarrollo: completar funciones, refactorizar o explicar fragmentos, ejecutando el modelo en local para evitar enviar codigo propietario a APIs externas.
- Analisis de documentos largos en ingles o chino (informes, articulos, transcripciones) aprovechando la ventana de contexto extensa del modelo base, con la advertencia de que no hay evaluacion publicada del rendimiento tras la abliteracion.
- Base para estudios de destilacion: servir como punto de partida para experimentos de fine-tuning o de nuevas intervenciones sobre pesos en un modelo de 14B manejable en una sola GPU de 24 GB en cuantizacion de 4 bits.
- Generacion de datos sinteticos para investigacion: producir textos sin las restricciones del modelo original para construir datasets, asumiendo la responsabilidad legal y etica del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna evaluacion, ni antes ni despues de la abliteracion, y tampoco hay datos de terceros en el repositorio (0 descargas registradas).

Existe una tabla de referencia publicada por DeepSeek para el modelo base DeepSeek-R1-Distill-Qwen-14B (AIME 2024, MATH-500, GPQA Diamond, LiveCodeBench y Codeforces) en el informe tecnico de DeepSeek-R1, pero esos numeros corresponden al modelo sin modificar y no es posible asumir que se mantengan tras la ablacion: la literatura sobre abliteracion describe de forma consistente una degradacion en benchmarks de seguridad y, en algunos casos, una perdida leve en tareas generales. No se reproduce aqui esa tabla porque no forma parte de la informacion proporcionada y no hay verificacion independiente de su aplicabilidad a esta version.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 29,6 GB, por lo que la inferencia necesita del orden de 32-36 GB de VRAM contando cache KV y overhead.
- VRAM en 8 bits (INT8/FP8): aproximadamente 15-16 GB de pesos, con margen adicional para la cache KV.
- VRAM en 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 9-10 GB de pesos; es el rango practico para GPUs de consumo.
- GPU recomendadas para BF16: A100 40 GB, A100 80 GB, H100 80 GB, A6000 48 GB o configuraciones multi-GPU con dos RTX 4090 o dos RTX 3090.
- GPU de consumo compatibles: cabe en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super (16 GB) usando cuantizacion de 4 bits o 8 bits; no cabe en BF16 en GPUs de 24 GB o menos.
- Opciones de despliegue: al ser una arquitectura Qwen2 estandar, es compatible con transformers, vLLM, SGLang, TGI, llama.cpp, Ollama y LM Studio. El repositorio solo publica safetensors, por lo que para llama.cpp u Ollama habria que convertir o usar una cuantizacion GGUF de terceros compatible.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en el repositorio ni en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Benchmarks |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated | 14,77B | 131.072 tokens (heredado, no verificado) | MIT | Publicado, 0 descargas, sin evaluacion | No disponible |
| DeepSeek-R1-Distill-Qwen-14B (original) | 14,77B | 131.072 tokens | MIT | Modelo oficial de DeepSeek, ampliamente validado | Publicados por DeepSeek en el informe de R1 |
| Qwen2.5-14B-Instruct (base no destilada) | 14,7B | 131.072 tokens | Apache 2.0 (Qwen2.5 en variantes de >=3B) | Modelo oficial de Alibaba, muy desplegado | Publicados por Alibaba |
| DeepSeek-R1-Distill-Llama-8B | 8B | 131.072 tokens | MIT | Modelo oficial de DeepSeek, menor tamano | Publicados por DeepSeek en el informe de R1 |

La comparacion relevante es contra el modelo original del que deriva: este repositorio no aporta ninguna metrica que demuestre una mejora en ninguna tarea, y su unico cambio verificable es la eliminacion del comportamiento de rechazo. Frente a Qwen2.5-14B-Instruct, el destilado de R1 esta optimizado para razonamiento con cadena de pensamiento larga mas que para dialogo general o uso empresarial con alineamiento.

## Limitaciones y advertencias

- La abliteracion elimina o reduce deliberadamente los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o inseguro ante peticiones que el original declinaria. La responsabilidad del uso recae por completo en quien lo despliega.
- No existe ninguna evaluacion publicada del impacto de la ablacion: ni benchmarks de capacidad general, ni mediciones de degradacion, ni analisis de las capas afectadas. Los "200 trials" mencionados no van acompanados de criterios de seleccion ni de resultados.
- Riesgo elevado de alucinacion, especialmente en un modelo destilado de razonamiento y sin ninguna calibracion posterior documentada.
- Idiomas: la model card no declara idiomas soportados. El modelo base esta orientado a ingles y chino; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: aunque el modelo base soporta 131.072 tokens, no hay confirmacion de que la modificacion preserve ese limite ni de que la atencion a larga distancia se mantenga funcional.
- Licencia MIT en el repositorio, lo que en principio permite uso comercial; sin embargo, conviene revisar los terminos del modelo base DeepSeek-R1-Distill-Qwen-14B y la politica de uso de DeepSeek, asi como la legislacion aplicable sobre contenido generado sin filtros (por ejemplo, la normativa europea de IA para sistemas de riesgo).
- El repositorio tiene 0 descargas y 0 likes, y no ha pasado ninguna revision por pares ni validacion de la comunidad. La fecha de creacion registrada (2026-09-12) es posterior a la fecha habitual de publicacion de DeepSeek-R1 y no se explica en la model card.
- No se ofrece informacion sobre sesgos del autor, dataset de abliteracion, ni sobre si se ha preservado el tokenizador y la plantilla de chat originales; cambiar la plantilla por error degradaria gravemente las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated
- Modelo base DeepSeek-R1-Distill-Qwen-14B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Modelo profesor DeepSeek-R1: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Informe tecnico de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Familia Qwen2.5: https://huggingface.co/Qwen
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian a un centro educativo sin relacion con el tema.
