# Rev3auth/iris-1.1-test

## Resumen

iris-1.1-test es un modelo de lenguaje publicado por el usuario Rev3auth en HuggingFace. Se trata de un ajuste fino (finetuning) convertido a formato GGUF, tarea realizada con la libreria Unsloth segun declara el propio autor en la model card. El repositorio ocupa 0,3 GB y contiene un unico archivo de pesos cuantizado: `gemma-3-270m-it.Q8_0.gguf`, lo que indica que el modelo base sobre el que se ha realizado el ajuste es Gemma 3 270M en su variante instruction-tuned, aunque el autor no lo confirma de forma explicita en el texto de la ficha.

El nombre del archivo y la etiqueta `gemma3_text` del repositorio apuntan a una arquitectura transformer decoder-only de la familia Gemma 3, con 268.098.176 parametros totales confirmados a partir de los pesos en safetensors. Su tamano reducido lo situa en la categoria de modelos "small language models" (SLM), pensados para ejecucion local en CPU, dispositivos de borde o GPUs de gama baja, donde el coste de inferencia y la latencia importan mas que el rendimiento en tareas complejas.

La relevancia de esta ficha es limitada y conviene ser transparente: se trata de un repositorio marcado como "test", con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin pipeline definido y sin resultados de benchmarks. No hay informacion sobre el dataset de ajuste, el numero de tokens utilizados ni el metodo de alineacion. Por tanto, esta ficha documenta principalmente los datos verificables del repositorio y senala de forma explicita todo aquello que el autor no especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `gemma3_text` en el repositorio); no confirmada explicitamente por el autor |
| Parametros totales | 268.098.176 (268 M, dato de los pesos en safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado: `gemma-3-270m-it.Q8_0.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion aportada no describe la arquitectura interna mas alla de la etiqueta `gemma3_text`, que asocia el modelo a la rama de solo texto de la familia Gemma 3. El recuento de parametros (268 M) coincide con el orden de magnitud de Gemma 3 270M, y el nombre del archivo GGUF (`gemma-3-270m-it.Q8_0.gguf`) sugiere que el punto de partida es la variante instruction-tuned de ese modelo base. No obstante, el autor no declara de forma explicita cual es el modelo base, por lo que esta correspondencia es una inferencia a partir de los metadatos, no un dato confirmado.

En cuanto al entrenamiento, la model card unicamente indica que el modelo fue ajustado y convertido a GGUF con Unsloth y que el ajuste fue "2x mas rapido" gracias a esa libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra tecnica de alineacion, ni la naturaleza de la tarea de ajuste. Se menciona un ajuste del comportamiento del token BOS para garantizar la compatibilidad con GGUF, un detalle relevante porque puede alterar la tokenizacion respecto al modelo original si no se replica exactamente la misma configuracion en el momento de la inferencia.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, y el autor proporciona ejemplos de uso con `llama-cli` y plantilla Jinja (`--jinja`), lo que implica soporte de plantillas de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede desplegarse a traves de HuggingFace Inference Endpoints.
- Ejecucion local en CPU o GPU de gama baja: al distribuirse unicamente en GGUF, el modelo esta pensado para runtime de llama.cpp y derivados.
- Despliegue en Ollama: la model card indica que se incluye un Modelfile de Ollama para facilitar el despliegue.
- Capacidades multimodales: el autor incluye el comando `llama-mtmd-cli` como ejemplo para "modelos multimodales", pero no hay ningun archivo de proyector multimodal en el repositorio ni confirmacion de que este modelo concreto procese imagenes. Debe considerarse no disponible.
- Razonamiento complejo, codigo, matematicas, tool calling / function calling, capacidades de agente, multi-step reasoning y capacidades multilingues: no documentadas en la informacion disponible.
- Modo "thinking", vision o audio: no disponibles.

## Casos de uso

- Clasificacion de intenciones y enrutado de peticiones: un modelo de 268 M parametros en Q8_0 ocupa del orden de 285 MB, por lo que puede ejecutarse en el mismo host que un sistema mayor y actuar como clasificador de primer nivel que decida a que modelo o herramienta derivar cada consulta.
- Extraccion de entidades y campos estructurados: para tareas acotadas de NER o extraccion de campos en formularios, un modelo pequeno ajustado puede ofrecer latencias de pocos milisegundos por peticion en CPU, sin necesidad de GPU.
- Prototipado rapido de aplicaciones conversacionales: gracias a los ejemplos con `llama-cli --jinja` y al Modelfile de Ollama, sirve para levantar un endpoint de chat de prueba en un portatil en pocos minutos, antes de escalar a un modelo mayor.
- Generacion de texto corto y plantillas: respuestas breves, resumenes de una linea, reformulaciones o generacion de asuntos de correo, donde el limite de calidad de un modelo de 268 M es aceptable y el coste por token es minimo.
- Moderacion o pre-filtrado de texto: como primera barrera para marcar contenido dudoso antes de pasarlo a un modelo mas grande y caro, reduciendo el volumen de llamadas a modelos de mayor tamano.
- Educacion e investigacion sobre ajuste fino: el repositorio, con 0,3 GB y un unico archivo GGUF, es util como ejemplo reproducible de pipeline Unsloth -> GGUF -> llama.cpp para quienes quieran entender el flujo completo.
- Inferencia en el borde (edge) o sin conexion: al ser un GGUF de menos de 300 MB puede embeberse en aplicaciones de escritorio, moviles o dispositivos embebidos donde no hay GPU ni conectividad.
- Pruebas de integracion de infraestructura: util para validar plantillas de chat, tokens BOS/EOS y compatibilidad de runtime (`llama.cpp`, Ollama, endpoints) antes de desplegar un modelo mayor con la misma configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces devueltos corresponden a paginas generales de YouTube y no guardan relacion con el repositorio.

## Requisitos de hardware

- Pesos: el unico archivo publicado, en Q8_0, ocupa aproximadamente 285 MB (estimacion a partir de 268 M parametros con ~8,5 bits por peso). Una hipotetica version en FP16 rondaria los 536 MB y una cuantizacion Q4_K_M, unos 170 MB.
- VRAM estimada: por debajo de 1 GB para los pesos en Q8_0; hay que sumar la cache KV, cuyo tamano no puede estimarse porque la longitud de contexto no esta declarada. En la practica, entre 1 y 3 GB de VRAM son suficientes para contextos moderados.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores. En el extremo alto, una A100 o H100 no aportan ventaja practica a este tamano salvo por agregacion de muchas peticiones concurrentes.
- Compatibilidad con GPU consumer: si, de forma holgada. Tambien funciona exclusivamente en CPU con memoria RAM suficiente (menos de 1 GB para los pesos).
- Opciones de despliegue: llama.cpp (`llama-cli -hf Rev3auth/iris-1.1-test --jinja`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF. vLLM, TGI y transformers no pueden usarse directamente con este repositorio porque solo publica pesos GGUF, no safetensors ni pesos en formato HuggingFace completo.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden del repositorio. Los de las alternativas se incluyen como referencia general de la categoria y no estan verificados en la informacion proporcionada; el rendimiento comparado no puede evaluarse porque este modelo no publica benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Disponibilidad |
|---|---|---|---|---|---|
| iris-1.1-test (Rev3auth) | 268 M | No disponible | No disponible | GGUF (Q8_0) | Repositorio de prueba, 0 descargas |
| Gemma 3 270M IT (base probable) | 268 M | No disponible en esta informacion | Terminos de uso de Gemma (por confirmar) | Safetensors y GGUF | Publico en HuggingFace |
| Qwen2.5-0.5B-Instruct | ~494 M | No disponible en esta informacion | Apache 2.0 (referencia general) | Safetensors y GGUF | Publico en HuggingFace |
| SmolLM2-360M-Instruct | ~362 M | No disponible en esta informacion | Apache 2.0 (referencia general) | Safetensors y GGUF | Publico en HuggingFace |

La ventaja diferencial de iris-1.1-test frente a estas alternativas seria un supuesto ajuste especifico, pero el autor no documenta ni la tarea de ajuste ni los datos empleados, por lo que no puede justificarse ninguna ventaja medible. Frente al modelo base Gemma 3 270M IT, la unica diferencia verificable es la publicacion en un unico GGUF Q8_0.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay licencia, idiomas, contexto, dataset de entrenamiento ni benchmarks. Esto impide evaluar si el ajuste aporta alguna mejora sobre el modelo base.
- Repositorio marcado como "test": el sufijo del nombre y la ausencia de descargas y likes sugieren que se trata de una prueba tecnica y no de un artefacto destinado a produccion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Si el modelo deriva efectivamente de Gemma 3, es probable que se apliquen los terminos de uso de Gemma, que incluyen obligaciones de atribucion y una politica de uso aceptable; debe confirmarse con el autor antes de cualquier uso en produccion.
- Riesgo elevado de alucinacion: un modelo de 268 M parametros tiene una capacidad muy limitada de razonamiento y de verificacion factual. No debe usarse para tareas que requieran precision factual sin supervision humana o sin verificacion posterior.
- Idiomas no declarados: no puede asumirse un buen rendimiento en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni planificar el consumo de memoria de la cache KV.
- Ajuste del token BOS: el autor indica que el comportamiento del token BOS se modifico para la compatibilidad con GGUF. Si la plantilla de chat no se aplica exactamente igual que en el entrenamiento, la calidad de las respuestas puede degradarse de forma notable.
- Fecha de creacion incoherente: el repositorio figura como creado el 11 de septiembre de 2026, una fecha posterior a la actual. Conviene tratar los metadatos temporales con cautela.
- Ambiguedad multimodal: la model card menciona el comando `llama-mtmd-cli` para modelos multimodales, pero no se publica ningun proyector visual. No debe asumirse capacidad de vision.
- Resultados de la busqueda web no concluyentes: no se ha encontrado ninguna referencia externa, publicacion, paper ni discusion sobre este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rev3auth/iris-1.1-test
- Unsloth (libreria usada para el ajuste y la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Modelo base probable, Gemma 3 270M IT: https://huggingface.co/google/gemma-3-270m-it (no confirmado por el autor)
- Nota: la busqueda web realizada no ha devuelto papers, blogs, demos ni repositorios adicionales relacionados con este modelo.
