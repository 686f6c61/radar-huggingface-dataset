# Nekodeus/zephyr-7b-beta-openvino

## Resumen

Zephyr-7B-beta OpenVINO (INT8) es una conversion del modelo HuggingFaceH4/zephyr-7b-beta al formato de representacion intermedia (IR) de OpenVINO, con cuantizacion INT8 solo de pesos. El repositorio lo publica el usuario Nekodeus y esta pensado para ejecutar el modelo en hardware Intel mediante el stack de OpenVINO, tanto desde Python (optimum-intel) como desde C++ (OpenVINO GenAI). El modelo base es un MistralForCausalLM de 7.250 millones de parametros, afinado sobre UltraChat y posteriormente optimizado con DPO sobre UltraFeedback.

El problema que resuelve es el de despliegue: en lugar de servir los pesos en FP16/BF16 (unos 14,5 GB), esta version entrega pesos INT8 en IR de OpenVINO, con un repositorio de 7,2 GB, lo que reduce a la mitad el espacio en disco y permite inferencia en CPU, iGPU o NPU de Intel sin necesidad de GPU dedicada. La conversion se genero con `optimum-cli` en un entorno Kaggle solo-CPU y de forma completamente offline, empleando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`.

La relevancia actual es de nicho pero clara: es una via de bajo coste para ejecutar un LLM instruct de 7B en maquinas sin CUDA, con licencia apache-2.0 declarada y API compatible con `transformers`. El repositorio no registra descargas ni likes en el momento de la consulta, y la model card no documenta idiomas soportados, benchmarks ni detalles de la composicion exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MistralForCausalLM) |
| Parametros totales | 7,25 mil millones (dato de la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card no la especifica) |
| Tipos de cuantizacion | INT8 solo pesos (weight-only, NNCF); activaciones FP16/FP32 segun el trazado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (no se publican safetensors ni GGUF) |
| Tamano del repositorio | 7,2 GB |
| Tarea declarada | text-generation |
| Libreria | openvino |
| Entorno de conversion | optimum-intel 2.2.0, openvino 2026.4.1, transformers 5.16.1 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo Mistral, con atencion por ventanas deslizantes y atencion completa en capas alternas segun el diseno original de Mistral, y 7.250 millones de parametros. Sobre esa base, el proceso de entrenamiento documentado en la model card es un ajuste fino supervisado sobre UltraChat seguido de optimizacion con DPO sobre UltraFeedback, el pipeline habitual que da lugar a la familia Zephyr.

Esta publicacion concreta no entrena nada: es un artefacto de conversion. Los pesos originales se exportan a OpenVINO IR y se cuantizan a INT8 con NNCF en modo weight-only, dejando las activaciones en FP16/FP32 tal y como se trazaron. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modificaciones estructurales. Tampoco se especifican el numero de tokens de entrenamiento, la composicion detallada del dataset ni hiperparametros del DPO mas alla de los nombres de los conjuntos de datos.

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla de chat explicita (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Respuesta a instrucciones y seguimiento de indicaciones (modelo afinado con SFT + DPO sobre datos de instrucciones).
- Razonamiento basico y respuesta a preguntas de conocimiento general, heredado del modelo base.
- Generacion de codigo, en la medida en que el modelo base la soporta; no se documenta ningun benchmark especifico en esta ficha.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia en CPU, iGPU y NPU de Intel a traves de OpenVINO Runtime y OpenVINO GenAI.

## Casos de uso

- Asistente conversacional on-premise en equipos sin GPU: al estar en IR de OpenVINO con pesos INT8, el modelo se puede servir en un portatil o servidor con CPU Intel y 8-16 GB de RAM, sin depender de CUDA.
- Despliegue en edge y equipos industriales: OpenVINO cubre CPU, iGPU y NPU, lo que permite integrar un LLM instruct en dispositivos Intel NUC, Mini PC o placas con aceleracion neuronal para tareas de resumen y extraccion de texto localizados.
- Prototipado rapido en Python: la integracion con `optimum.intel.OVModelForCausalLM` mantiene la API de `transformers`, de modo que se puede sustituir el modelo en un script existente cambiando el identificador del repositorio.
- Integracion en aplicaciones C++ nativas: la ruta `ov::genai::LLMPipeline` permite incrustar el modelo en binarios C++ sin cadena de dependencias de Python, util para software de escritorio o utilidades de linea de comandos.
- Generacion de texto por lotes en CPU para pipelines de documentacion: con 7,2 GB de pesos en INT8 cabe en memoria de sistemas de gama alta y permite procesar grandes volumenes de texto sin coste de GPU.
- Experimentacion academica y docente: sirve como caso de estudio de cuantizacion INT8 y exportacion a OpenVINO, reproducible con un unico comando `optimum-cli export openvino`.
- Pruebas comparativas de rendimiento CPU frente a GPU: util para medir latencia y throughput de un 7B cuantizado frente a la misma familia en FP16 sobre CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio `Nekodeus/zephyr-7b-beta-openvino` no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni tampoco mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM para pesos: aproximadamente 7,2 GB solo para los pesos INT8; con cache KV y buffers de runtime conviene reservar entre 9 y 12 GB de memoria para contextos moderados.
- GPU dedicada: no es necesaria. El artefacto esta orientado a CPU Intel; tambien funciona sobre iGPU Intel integrada y NPU compatible mediante OpenVINO.
- GPUs NVIDIA: no se documenta soporte en esta publicacion; la ruta prevista es el runtime de Intel. Para A100, H100 o RTX 4090 lo logico es usar el modelo original en FP16/BF16 con vLLM o TGI.
- Cabe en GPU de consumo: no aplica a CUDA; en el ecosistema Intel se puede ejecutar en iGPU integradas con memoria compartida, asumiendo la penalizacion de ancho de banda.
- Opciones de despliegue: OpenVINO Runtime mediante `optimum-intel` (Python) y OpenVINO GenAI (`ov::genai::LLMPipeline`, C++). No se publican pesos GGUF, por lo que Ollama y llama.cpp no se pueden usar directamente con este repositorio.
- Latencia y throughput: no disponibles; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Orientacion |
|---|---|---|---|---|---|
| Nekodeus/zephyr-7b-beta-openvino | 7,25 B | no disponible | OpenVINO IR, INT8 weight-only | apache-2.0 (segun la model card) | Inferencia en CPU/iGPU/NPU Intel |
| HuggingFaceH4/zephyr-7b-beta | 7,25 B | no disponible en la informacion proporcionada | safetensors, FP16/BF16 | la model card de esta conversion la declara apache-2.0; conviene verificar en el repositorio original | Referencia de calidad del modelo base |
| Mistral-7B-Instruct | 7 B aprox. | no disponible | safetensors, GGUF disponible en la comunidad | apache-2.0 (segun la familia Mistral 7B) | Alternativa instruct con soporte amplio en llama.cpp, vLLM y Ollama |
| Llama 2 7B Chat | 7 B aprox. | no disponible | safetensors, GGUF | licencia propia de Llama 2 | Alternativa conversacional con GPU y tooling maduro |

Los datos de parametros, contexto y licencia de los modelos de comparacion corresponden a informacion general de la familia y no se han verificado en la busqueda web de esta ficha, que no devolvio resultados tecnicos relevantes; se marcan como no disponibles los campos que no se pueden confirmar con la informacion aportada.

## Limitaciones y advertencias

- Riesgo de alucinacion: inherente a un modelo instruct de 7B entrenado con SFT + DPO; no se aporta ninguna evaluacion de fidelidad factual en esta publicacion.
- Sesgos conocidos: no documentados en la model card. Al derivar de UltraChat y UltraFeedback, hereda los sesgos de esos corpus, que no se describen en la informacion disponible.
- Idiomas: la model card no declara soporte multilingue; el modelo base esta orientado predominantemente al ingles. No hay datos para afirmar un buen comportamiento en castellano.
- Contexto: la longitud de contexto no se especifica en la model card de esta conversion. Cualquier despliegue en produccion deberia validar el limite real de tokens antes de disenar el sistema.
- Licencia: el repositorio declara apache-2.0, pero la propia model card atribuye esa misma licencia al modelo base. Conviene verificar la licencia del repositorio original de Zephyr-7b-beta antes de un uso comercial, porque la atribucion puede no coincidir.
- Ambito de hardware: el artefacto esta ligado a OpenVINO. No sirve para vLLM, TGI, Ollama ni llama.cpp sin reconvertir los pesos a otro formato.
- Cuantizacion: al ser weight-only INT8, hay una perdida de calidad respecto al modelo en FP16/BF16 que no se cuantifica en la model card; no hay evaluacion comparativa publicada.
- Madurez del repositorio: cero descargas y cero likes, sin historial de uso ni incidencias reportadas. Adecuado para pruebas, no para produccion critica sin validacion previa.
- La busqueda web realizada no devolvio ningun resultado tecnico relacionado con este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nekodeus/zephyr-7b-beta-openvino
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Documentacion de optimum-intel (exportacion a OpenVINO): no disponible en la informacion proporcionada
- Documentacion de OpenVINO GenAI: no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional del autor: no disponible
