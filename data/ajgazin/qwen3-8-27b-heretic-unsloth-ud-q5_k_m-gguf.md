# ajgazin/Qwen3.8-27B-Heretic-unsloth-UD-Q5_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q5_K_M dinámico del modelo Qwen3.8-27B tras aplicar la técnica de abliteración "Heretic" (Magnitude-Preserving Orthogonal Ablation). El autor, ajgazin, parte del trabajo de llmfan46, que ya había producido una versión sin censura del modelo base de Qwen, y lo combina con la receta de cuantización dinámica v3.0 de Unsloth, que emplea una matriz de importancia y una distribución de tipos de tensor por capa. El resultado es un archivo de 18,4 GB que, según las mediciones del autor, presenta una divergencia KL menor frente al modelo de referencia que el Q5_K_M estático equivalente, a la vez que ocupa ligeramente menos espacio.

El modelo base Qwen3.8-27B es un modelo de lenguaje multimodal (visión y texto) con 27 320 millones de parámetros, una ventana de contexto nativa de 256 000 tokens y licencia Apache-2.0. Esta versión cuantizada conserva los 15 tensores de predicción multi-token (MTP) y el proyector de visión en un archivo separado opcional. La relevancia de esta ficha radica en que ofrece una alternativa de alta fidelidad para quienes necesitan ejecutar un modelo sin filtros de seguridad en hardware local, con una calidad de cuantización superior a la de los quants estáticos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), arquitectura interna no especificada en la informacion disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | 256 000 tokens (nativo); en la practica se recomienda 8192 para este GGUF |
| Tipos de cuantizacion | Q5_K_M dinamico (Unsloth recipe) con distribucion por tensor: 189xQ5_K, 160xQ6_K, 124xQ8_0, 19xIQ4_XS, 12xQ4_K, 2xIQ4_NL, 360xF32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje multimodal desarrollado por Qwen, con capacidades de vision (imagen y video) y razonamiento. No se dispone de detalles sobre su arquitectura interna (si es un transformer denso o con mezcla de expertos) ni sobre los datos de entrenamiento (numero de tokens, composicion del dataset, metodos de alineacion como RLHF o DPO). La informacion disponible se limita a la documentacion publica de Qwen, que indica una ventana de contexto de 256K y un rendimiento destacado en tareas de codificacion agente y chat.

Sobre esta base, llmfan46 aplico la tecnica de abliteracion "Heretic" (v2.0.0.dev0), una variante de ablacion ortogonal que preserva la magnitud de los pesos. Esta tecnica elimina de forma selectiva las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo ("refusal"), manteniendo intactas las capacidades generales del modelo. El resultado es un modelo "uncensored" que no filtra contenido sensible. Posteriormente, ajgazin realizo una requantizacion dinamica siguiendo la receta de Unsloth: utilizo la matriz de importancia publicada por Unsloth (calibrada sobre el modelo original no abliterado) y una tabla de tipos de tensor por capa copiada exactamente del GGUF dinamico de Unsloth. La cuantizacion se ejecuto con `llama-quantize --allow-requantize`, produciendo una distribucion de tipos de tensor identica a la de Unsloth (866/866 tensores, 0 discrepancias). Los 15 tensores MTP se conservan, y el proyector de vision no se ve afectado por la abliteracion ni por la cuantizacion.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B.
- Vision multimodal: soporta entrada de imagenes y video mediante el archivo `mmproj-BF16.gguf` (opcional, no incluido en el archivo principal).
- Prediccion multi-token (MTP): los 15 tensores MTP estan preservados, lo que puede acelerar la inferencia en entornos compatibles.
- Tool calling y function calling: probablemente soportado, dado que Qwen3.8 esta disenado para tareas agente, aunque no se confirma en la informacion proporcionada.
- Razonamiento multi-paso y modo "thinking": el modelo base incluye un modo de pensamiento, y la model card recomienda parametros de muestreo especificos (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0).
- Ausencia de filtros de seguridad: el modelo ha sido abliterado, por lo que no rechaza contenido sensible, controvertido o inapropiado.
- Capacidades multilingues: no confirmadas en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de IA: estudiar el comportamiento de modelos sin filtros de seguridad en entornos controlados, por ejemplo para analizar sesgos o vulnerabilidades de jailbreak.
- Generacion de contenido creativo sin restricciones: redaccion de ficcion, guiones o material que requiera explorar temas tabu o controversiales sin que el modelo se niegue a responder.
- Desarrollo de agentes autonomos en entornos de pruebas: al no tener rechazo, el modelo puede ejecutar tareas de razonamiento multi-paso sin interrupciones por politicas de seguridad, util para evaluar pipelines agente.
- Fine-tuning posterior para dominios especificos: al ser un modelo abliterado, puede servir como base para ajuste fino en tareas donde se necesite una salida sin censura, como generacion de dialogos en videojuegos o simulaciones.
- Despliegue local en hardware de consumo: con 18,4 GB de peso, cabe en GPUs de 24 GB (p. ej., RTX 4090) o en CPU con suficiente RAM, permitiendo ejecutar un modelo de 27B sin depender de servicios en la nube.
- Pruebas de cuantizacion y calidad: comparar la fidelidad de diferentes metodos de cuantizacion (dinamico vs. estatico) utilizando las metricas de divergencia KL publicadas en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una comparacion de divergencia KL frente a un modelo de referencia no abliterado (Unsloth Q8_0), que se reproduce a continuacion:

| Q5 del modelo Heretic | Mean KLD | Median KLD | 99% KLD | Same top-1 | Tamano de archivo |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Este repo (Unsloth dinamico)** | **0.070421** | **0.008692** | **0.898** | **92.327 %** | **18.4 GB** |
| Q5_K_M estatico (repo fuente) | 0.076442 | 0.010440 | 0.985 | 91.886 % | 18.7 GB |

Estos datos indican que la cuantizacion dinamica produce una menor divergencia respecto al modelo de precision completa que la estatica, con un archivo mas pequeno. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB para el archivo Q5_K_M de 18,4 GB, considerando el contexto y las claves/valores en memoria. Con contexto de 8192 tokens, puede caber en una GPU de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB o 80 GB), H100 (80 GB). En GPUs de 16 GB (p. ej., RTX 4080) podria no caber con contexto largo.
- Si cabe en consumer GPU: si, en GPUs de 24 GB como la RTX 4090 o 3090. En GPUs de 12 GB (p. ej., RTX 3060) no es viable sin offloading a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), Ollama (si se importa el GGUF), vLLM (con adaptacion), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Se espera un rendimiento similar a otros modelos de 27B cuantizados a Q5, con la posible ventaja del MTP en entornos que lo soporten.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
| :--- | :---: | :---: | :---: | :--- | :--- |
| Qwen3.8-27B (original) | 27B | 256K | Apache-2.0 | BF16, GGUF | Modelo base con filtros de seguridad |
| Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved (llmfan46) | 27B | 256K | Apache-2.0 | BF16 | Abliterado, sin cuantizar |
| Este repo (ajgazin) | 27B | 256K | Apache-2.0 | Q5_K_M dinamico | Abliterado + cuantizacion dinamica |
| Qwen3.8-27B-UD-Q5_K_M (Unsloth) | 27B | 256K | Apache-2.0 | Q5_K_M dinamico | Cuantizacion dinamica sin abliteracion |

La principal diferencia entre este modelo y el de Unsloth es la abliteracion: este repo elimina los rechazos de seguridad, mientras que el de Unsloth mantiene los filtros. Frente al modelo estatico de llmfan46, este ofrece una cuantizacion de mayor fidelidad y menor tamano.

## Limitaciones y advertencias

- Modelo "uncensored": los filtros de seguridad han sido sustancialmente eliminados. Puede generar contenido sensible, controvertido, ofensivo o ilegal. El autor advierte explicitamente que la responsabilidad del contenido generado recae en el usuario.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: aunque el contexto nativo es de 256K, la cuantizacion y el hardware pueden limitar el contexto util en la practica. La model card recomienda 8192 tokens para uso con llama.cpp.
- Idiomas: no se ha confirmado la lista de idiomas soportados; el modelo base de Qwen probablemente soporta multiples idiomas, pero no hay datos concretos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el caracter "uncensored" puede implicar riesgos legales o eticos en ciertos contextos. El usuario debe verificar el cumplimiento normativo.
- Degradacion por cuantizacion: aunque la cuantizacion dinamica reduce la perdida de calidad, sigue siendo una perdida respecto al modelo en BF16. Para tareas de maxima precision, se recomienda usar el modelo sin cuantizar.
- Dependencia del proyector de vision: el archivo `mmproj-BF16.gguf` es necesario para entrada de imagenes o video; sin el, el modelo solo funciona en modo texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ajgazin/Qwen3.8-27B-Heretic-unsloth-UD-Q5_K_M-GGUF
- Modelo base abliterado (llmfan46): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantizaciones de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Herramienta de abliteracion Heretic: https://github.com/p-e-w/heretic
