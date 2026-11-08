# mradermacher/CodeLlama-13b-Instruct-hf-abliterated-GGUF

## Resumen

CodeLlama-13b-Instruct-hf-abliterated-GGUF es la distribucion en formato GGUF del modelo CodeLlama-13B-Instruct de Meta tras un proceso de "abliteration" aplicado por huihui-ai y cuantizado por mradermacher. El modelo parte de la base instructiva de CodeLlama, especializada en generacion y comprension de codigo, y se le ha eliminado (o atenuado) el mecanismo de rechazo de peticiones mediante la ablacion de la direccion de activacion asociada al comportamiento de negativa. El resultado es un modelo "uncensored" que responde sin las restricciones de seguridad tipicas del modelo original.

Tecnicamente es un transformer decoder-only de 13.016.028.160 parametros (aproximadamente 13B), derivado de la familia Llama 2 con vocabulario y entrenamiento extendidos para codigo. Se distribuye exclusivamente en formato GGUF, lo que lo hace apto para inferencia en CPU y GPU mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.). El repositorio ocupa 88,8 GB e incluye multiples niveles de cuantizacion.

Su relevancia actual es acotada y de nicho: sirve a quienes necesitan un modelo de codigo local sin filtros de contenido, con la advertencia de que la licencia Llama 2 impone restricciones de uso y que el proceso de abliteration degrada parcialmente la calidad y la seguridad del modelo. No es un modelo recomendable para produccion orientada al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2 / CodeLlama) |
| Parametros totales | 13.016.028.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo ocupa 88,8 GB, lo que sugiere Q2 a Q8 y posible F16) |
| Idiomas soportados | codigo (ingles tecnicamente; el campo de idiomas indica "code") |
| Licencia | llama2 (LLAMA 2 Community License Agreement) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, heredado de la arquitectura Llama 2 y adaptado por Meta para CodeLlama. CodeLlama-13B-Instruct se entreno sobre un corpus especifico de codigo con un esquema de instrucciones y, segun la documentacion original de Meta, con relleno de contexto largo (infilling) y un contexto extendido respecto a Llama 2 base. Sobre esa base, huihui-ai aplico la tecnica de abliteration: se calcula la direccion media de las activaciones en las capas que disparan el rechazo y se proyecta fuera de la matriz de pesos, de modo que el modelo deja de activar la respuesta de negativa ante peticiones que el modelo original rechazaria.

No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo una fase adicional de RLHF o DPO en esta variante. La unica intervencion documentada es la ablacion de la direccion de rechazo sobre el checkpoint instructivo. mradermacher se limita a convertir los pesos a GGUF y publicar las cuantizaciones; no aporta entrenamiento adicional.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (Python, C++, Java, JavaScript, etc.), heredada del entrenamiento de CodeLlama.
- Relleno de codigo (code infilling) y completado en el punto medio del contexto, capacidad nativa de CodeLlama.
- Conversacion multi-turno en modo instruct, siguiendo el formato de chat de CodeLlama Instruct.
- Explicacion y documentacion de fragmentos de codigo.
- Generacion de tests unitarios y refactorizacion basica.
- Respuesta sin filtros de contenido ante peticiones que el modelo original rechazaria (comportamiento "uncensored" derivado de la abliteration).
- Soporte de tool calling / function calling: no disponible de forma nativa; no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo no esta disenado especificamente para ello.
- Capacidades multilingues generales: limitadas; el modelo esta orientado a codigo y su entrenamiento conversacional en lenguas distintas del ingles es escaso.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Asistente de codigo en local sin conexion: desplegado con llama.cpp u Ollama en una estacion de trabajo, el modelo completa y explica codigo sin enviar datos a la nube, lo que encaja en entornos con requisitos de confidencialidad.
- Generacion de tests y documentacion tecnica: se le puede pedir que, a partir de una funcion, produzca casos de prueba y docstrings; su entrenamiento en codigo lo hace adecuado para esta tarea acotada.
- Refactorizacion y traduccion entre lenguajes: util para convertir fragmentos entre lenguajes con sintaxis similar o para modernizar codigo legacy, con revision humana obligatoria.
- Analisis de repositorios en pipelines internos: integrado en scripts que resumen diffs o generan mensajes de commit, siempre que el contexto del repositorio quepa en la ventana disponible.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio de como la abliteration altera el comportamiento de rechazo, util para equipos que estudian robustez de filtros.
- Prototipado de herramientas de generacion de codigo sin restricciones de contenido: para experimentos internos donde se necesita que el modelo no bloquee peticiones tecnicas que un modelo alineado rechazaria por precaucion excesiva.
- Educacion y experimentacion con cuantizaciones: por su amplia variedad de niveles GGUF, permite comparar calidad frente a tamano en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas. Cualquier cifra que se cite para este modelo concreto seria una extrapolacion no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q4_K_M en torno a 8-9 GB; Q5_K_M en torno a 10-11 GB; Q8_0 en torno a 14-15 GB; F16 en torno a 26 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q5-Q8 con contexto moderado; A100 40/80 GB o H100 para F16 y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas para Q4, y en 8 GB con cuantizaciones Q3 o inferiores a costa de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el tag endpoints_compatible lo indica). vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan conversion a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CodeLlama-13b-Instruct-hf-abliterated-GGUF (este) | 13B | no disponible | GGUF | llama2 | Variante sin filtros, cuantizada |
| CodeLlama-13B-Instruct (original, Meta) | 13B | no disponible | safetensors | llama2 | Modelo base con alineacion intacta |
| TheBloke/CodeLlama-13B-Instruct-GGUF | 13B | no disponible | GGUF | llama2 | Cuantizacion del original sin abliteration |
| Qwen2.5-Coder-14B-Instruct | 14B | no disponible | safetensors, GGUF | Apache 2.0 | Alternativa moderna con mejor rendimiento en codigo segun benchmarks publicados por el autor |

La comparativa cuantitativa de rendimiento no esta disponible en la informacion proporcionada; las diferencias de calidad entre el original y la variante abliterated no han sido medidas de forma publica en esta ficha.

## Limitaciones y advertencias

- La abliteration elimina el mecanismo de rechazo, lo que incrementa el riesgo de generar contenido danino, ofensivo o inseguro; no es apto para aplicaciones orientadas al usuario final sin capas de moderacion externas.
- La ablacion de direcciones de activacion degrada la coherencia y la calidad general del modelo respecto al CodeLlama-13B-Instruct original; se espera una perdida medible en tareas de razonamiento y codigo, aunque no cuantificada aqui.
- Riesgo elevado de alucinacion en APIs, librerias y funciones inexistentes, agravado por el entrenamiento en codigo y por la degradacion de la alineacion.
- Licencia Llama 2: uso comercial permitido con condiciones, incluida la obligacion de atribucion, la prohibicion de usar las salidas para entrenar otros LLM y el requisito de solicitar licencia a Meta si se superan 700 millones de usuarios activos mensuales. El acceso al repo exige aceptar los terminos y compartir datos de contacto con Meta.
- El modelo esta orientado a codigo y su competencia en castellano y otras lenguas naturales es limitada; no debe usarse como modelo conversacional general.
- La longitud de contexto no esta documentada en esta ficha; asumir el contexto nativo de CodeLlama-13B-Instruct sin confirmacion.
- El repositorio tiene muy poca traccion (233 descargas, 0 likes) y no cuenta con validacion de la comunidad; tratar las cuantizaciones como no auditadas.
- No dispone de soporte nativo de tool calling ni de modo agente; cualquier uso en pipelines de agentes requerira envoltorio y validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/CodeLlama-13b-Instruct-hf-abliterated-GGUF
- Modelo base de la abliteration: https://huggingface.co/huihui-ai/CodeLlama-13b-Instruct-hf-abliterated
- CodeLlama original de Meta: https://ai.meta.com/resources/models-and-libraries/llama-downloads/
- Politica de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy
- Proyecto de comparacion de LLM locales (referencia): https://github.com/Troyanovsky/Local-LLM-Comparison-Colab-UI
