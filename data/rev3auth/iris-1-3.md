# Rev3auth/iris-1.3

## Resumen

iris-1.3 es un ajuste fino (fine-tune) publicado por el usuario Rev3auth sobre el modelo base gemma-3-1b-it de Google, distribuido exclusivamente en formato GGUF para su uso con llama.cpp. El repositorio ocupa 1,1 GB e incluye un unico fichero de pesos, `gemma-3-1b-it.Q8_0.gguf`, ademas de un Modelfile para Ollama. El modelo se presenta con los tags `gguf`, `gemma3_text`, `llama.cpp`, `unsloth`, `endpoints_compatible` y `conversational`, lo que lo situa en la categoria de modelos conversacionales pequenos (aproximadamente 1.000 millones de parametros) orientados a despliegue local.

El problema que resuelve es el de disponer de un modelo conversacional de ~1B parametros cuantizado en 8 bits, facil de ejecutar en hardware modesto (CPU o GPU de gama de entrada) sin necesidad de infraestructura de servidor. Su relevancia actual es limitada pero concreta: es un ejemplo de flujo de trabajo de ajuste fino rapido con Unsloth seguido de conversion a GGUF, un patron muy habitual para adaptar modelos base pequenos a dominios o estilos concretos.

La informacion publicada es escasa: la model card no documenta el dataset de entrenamiento, la licencia, los idiomas soportados ni resultados de evaluacion. El repositorio tiene 0 descargas y 1 like en el momento de la consulta. Los resultados de la busqueda web realizada no contienen ninguna referencia al modelo (las coincidencias corresponden a una tienda de telas), por lo que toda la ficha se basa en los metadatos del repositorio y en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de la familia Gemma 3, variante de texto; tag `gemma3_text`) |
| Parametros totales | 999.885.952 (~1,0 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base gemma-3-1b-it declara 32.768 tokens) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `gemma-3-1b-it.Q8_0.gguf`) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible (no declarada en el repositorio; el modelo base Gemma 3 se distribuye bajo los terminos de uso de Gemma) |
| Formato de pesos | GGUF (no se publican safetensors en el repositorio) |

Otros metadatos: tamano del repositorio 1,1 GB; creado el 2026-09-18 y actualizado el 2026-09-18; 0 descargas y 1 like.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 1.000 millones de parametros, heredado de gemma-3-1b-it. El tag `gemma3_text` y el nombre del fichero de pesos confirman que se trata de la variante exclusivamente de texto, sin torre de vision, a pesar de que la model card menciona el comando `llama-mtmd-cli` para modelos multimodales como alternativa de uso generica. El autor indica que el ajuste fino y la conversion a GGUF se realizaron con Unsloth, y que el BOS token se ajusto para garantizar la compatibilidad con GGUF.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el metodo de alineacion (SFT, RLHF, DPO) ni las hiperparametros del ajuste. La unica cifra tecnica aportada por el autor es que el entrenamiento fue "2x mas rapido" gracias a Unsloth, lo que es una afirmacion sobre la herramienta y no sobre el modelo. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto conversacional en un unico turno o en conversaciones multi-turno, segun el tag `conversational` y el uso previsto de la plantilla Jinja (`--jinja`).
- Inferencia en local mediante llama.cpp, tanto por CLI (`llama-cli -hf Rev3auth/iris-1.3 --jinja`) como a traves de Ollama con el Modelfile incluido.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere que puede servirse detras de una API compatible con el formato de Hugging Face.
- Razonamiento basico y asistencia general limitados por el tamano del modelo (~1B), sin datos de evaluacion que lo cuantifiquen.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (el modelo base Gemma 3 declara soporte multilingue, pero no se ha verificado en este ajuste).
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el tag `gemma3_text` indica que no hay soporte de vision en los pesos publicados.

## Casos de uso

- Asistente conversacional local en escritorio: al pesar aproximadamente 1,1 GB en Q8_0, el modelo puede ejecutarse en un portatil sin GPU dedicada mediante llama.cpp u Ollama, sirviendo como chatbot de proposito general sin enviar datos a un servicio externo.
- Prototipado rapido de aplicaciones de chat: un desarrollador puede levantar un endpoint compatible con la API de Hugging Face y validar la interfaz de usuario antes de invertir en un modelo mayor.
- Clasificacion y etiquetado de texto ligero: tareas de categorizacion de mensajes, deteccion de intencion o extraccion de campos simples que no requieren razonamiento profundo, ejecutadas en lote sobre CPU.
- Generacion de respuestas plantilladas con estilo ajustado: dado que es un fine-tune, es adecuado para experimentar con la adaptacion de un modelo base a un tono o dominio concreto manteniendo un coste de inferencia minimo.
- Entornos sin conectividad o con requisitos de privacidad estrictos: despliegue completamente offline en equipos de campo, kioscos o sistemas embebidos con unos pocos gigabytes de RAM disponibles.
- Base para experimentacion en ajuste fino: sirve como punto de partida reproducible para estudiar el flujo Unsloth -> GGUF y medir el impacto de distintos datasets en un modelo de ~1B.
- Filtrado previo en pipelines de generacion aumentada (RAG): uso como clasificador o reranker barato que decide si una consulta requiere un modelo mayor, reduciendo coste por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web no aportan datos al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el unico fichero publicado (Q8_0, ~1,1 GB) requiere del orden de 1,5-2 GB de memoria considerando el contexto y el overhead del runtime; las cifras exactas no estan publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, T4, L4). No se necesita hardware de centro de datos.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo moderna e incluso en graficas integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable con llama.cpp y Ollama; es el escenario mas habitual para un modelo de este tamano en Q8_0.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Rev3auth/iris-1.3 --jinja`), Ollama (Modelfile incluido en el repositorio) y cualquier servidor compatible con endpoints GGUF. No se mencionan vLLM, TGI ni TensorRT-LLM en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Notas |
|---|---|---|---|---|---|
| iris-1.3 (Rev3auth) | ~1,0 B | no disponible | no disponible | GGUF (Q8_0) | Fine-tune de gemma-3-1b-it con Unsloth; 0 descargas, 1 like |
| gemma-3-1b-it (Google) | ~1,0 B | 32.768 tokens | Terminos de uso de Gemma | safetensors, GGUF en repos derivados | Modelo base del que deriva iris-1.3 |
| Llama 3.2 1B Instruct (Meta) | ~1,2 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF | Alternativa de tamano equivalente con contexto mucho mayor |
| Qwen2.5 1.5B Instruct (Alibaba) | ~1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |

Los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica y no se han verificado en el repositorio de iris-1.3. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Gemma 3, hereda los sesgos del modelo base, que no han sido evaluados en este ajuste.
- Riesgo de alucinacion: elevado, como es habitual en modelos de ~1B parametros; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto e idioma: la model card no especifica la ventana de contexto efectiva ni los idiomas soportados tras el ajuste fino, por lo que no se puede garantizar el comportamiento multilingue.
- Licencia: no declarada en el repositorio. Esto impide determinar las condiciones de uso comercial del propio ajuste y, ademas, el modelo base Gemma 3 esta sujeto a los terminos de uso de Gemma, que imponen obligaciones adicionales al redistribuir o desplegar el modelo.
- Falta de documentacion de entrenamiento: se desconoce el dataset, el volumen de tokens y el metodo de alineacion, lo que dificulta evaluar la calidad y los posibles sesgos introducidos por el ajuste.
- Advertencia sobre el token BOS: el autor indica que su comportamiento se modifico para la compatibilidad con GGUF, algo que puede afectar a la tokenizacion si se usa fuera de llama.cpp.
- Madurez del proyecto: 0 descargas y 1 like, sin historial de uso ni mantenimiento conocido; no es un artefacto recomendable para produccion sin una evaluacion propia previa.
- La busqueda web realizada no devolvio ninguna fuente relacionada con el modelo; no hay papers, blogs ni discusiones independientes que respalden sus capacidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rev3auth/iris-1.3
- Unsloth (herramienta usada para el ajuste fino y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Modelo base de referencia, gemma-3-1b-it: https://huggingface.co/google/gemma-3-1b-it
- No se han encontrado papers, blogs, demos ni repositorios independientes asociados a este modelo en la busqueda web realizada.
