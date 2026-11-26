# cyber-aura/Qwen2.5-Coder-3B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Qwen2.5-Coder-3B-Instruct, un modelo de lenguaje causal especializado en codigo desarrollado por el equipo Qwen de Alibaba Cloud. Forma parte de la familia Qwen2.5-Coder (anteriormente CodeQwen), que cubre seis tamanos: 0,5, 1,5, 3, 7, 14 y 32 mil millones de parametros. Esta variante concreta ha sido empaquetada por el usuario `cyber-aura` a partir de los pesos oficiales de Qwen, y su interes principal es que permite ejecutar un modelo de codigo de 3B en hardware de consumo gracias a las cuantizaciones de 2 a 8 bits.

El modelo resuelve tareas de generacion, razonamiento y correccion de codigo, y mantiene competencias en matematicas y conocimiento general heredadas de la base Qwen2.5. Con 3.397.103.616 parametros totales (3,09B segun la model card oficial, 2,77B sin contar embeddings), 36 capas y una ventana de contexto completa de 32.768 tokens, se posiciona como una opcion ligera para asistentes de programacion locales, integracion en IDE y pipelines de CI/CD.

Es relevante ahora porque el ecosistema GGUF permite desplegar modelos de codigo en portatiles y estaciones de trabajo sin GPU de datacenter, y porque la familia Qwen2.5-Coder ha demostrado en su version de 32B capacidades comparables a GPT-4o en tareas de codigo, lo que valida la linea de entrenamiento de la que este 3B es el escalon mas accesible dentro del rango medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atencion con sesgo QKV y embeddings atados (tied word embeddings) |
| Parametros totales | 3.397.103.616 (3,09B; 2,77B sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (completa); 131.072 tokens solo en modelos no GGUF con YARN via vLLM |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (repo de 25,2 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 36 capas, atencion con query grouped attention (GQA) de 16 cabezas para Q y 2 para KV, RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. Los embeddings de entrada y salida estan atados, lo que reduce el numero de parametros efectivos. La model card oficial indica que el entrenamiento se realizo sobre 5,5 billones de tokens que incluyen codigo fuente, datos de grounding texto-codigo y datos sinteticos, partiendo de la base Qwen2.5.

El pipeline de entrenamiento combina preentrenamiento y postentrenamiento (la variante `-Instruct` implica ajuste supervisado y optimizacion preferencial, aunque la model card no detalla la composicion exacta de RLHF/DPO). La familia Qwen2.5-Coder se presenta como una base mas solida para aplicaciones reales como agentes de codigo, manteniendo competencias en matematicas y conocimiento general. No se detalla en la informacion disponible si se emplearon tecnicas como decodificacion especulativa o atencion lineal; la arquitectura descrita es transformer clasico con GQA.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con mejoras significativas frente a CodeQwen1.5 en generacion, razonamiento y correccion de codigo.
- Razonamiento sobre codigo: explicacion de fragmentos, deteccion de errores y propuesta de correcciones.
- Reparacion de codigo (code fixing) y finalizacion de fragmentos incompletos.
- Capacidades matematicas y de conocimiento general heredadas de Qwen2.5.
- Modo conversacional (chat) con formato de plantilla de Qwen; la model card recomienda el modo `-cnv` de llama.cpp para experiencia de chatbot.
- Soporte de contexto largo de hasta 32.768 tokens en GGUF, suficiente para archivos de codigo y conversaciones multi-turno extensas.
- Capacidades multilingues limitadas al ingles segun la model card (aunque la base Qwen2.5 es multilingue, esta ficha declara solo `en`).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni modo thinking para esta variante de 3B.

## Casos de uso

- Asistente de programacion local en IDE: el modelo puede autocompletar y explicar codigo en tiempo real ejecutandose con llama.cpp u Ollama en una GPU de consumo, gracias a su tamano de 3B y cuantizaciones de 4-5 bits que caben en 4-6 GB de VRAM.
- Revision de codigo en pipelines de CI/CD: con 32.768 tokens de contexto puede analizar diffs y archivos completos, generar comentarios de revision y sugerir correcciones antes del merge, integrándose via API local.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo produce casos de prueba; su contexto largo permite incluir la firma de la funcion y sus dependencias.
- Chatbot de soporte tecnico para desarrolladores: conversaciones multi-turno sobre APIs, errores de compilacion y dudas de lenguaje, con el formato de chat de Qwen y el modo conversacional de llama.cpp.
- Educacion y tutoria de programacion: explicacion paso a paso de algoritmos y depuracion guiada, ejecutable en portatiles sin GPU dedicada con cuantizacion q4_K_M.
- Prototipado rapido de scripts y automatizacion: generacion de scripts de shell, Python o SQL para tareas de administracion, con la ventaja de que el modelo corre en local y no envia codigo propietario a servicios externos.
- Correccion automatizada de errores en bases de codigo pequenas: el modelo puede recibir un archivo con un fallo y devolver un parche, util en herramientas de refactorizacion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante GGUF concreta. La model card remite al blog oficial de Qwen2.5-Coder para los resultados detallados de evaluacion, pero no incluye cifras en el texto proporcionado. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, no confirmada en la informacion): q2_K en torno a 1,5-2 GB; q4_K_M en torno a 2,5-3 GB; q5_K_M en torno a 3-3,5 GB; q8_0 en torno a 4-4,5 GB. Estas cifras son estimaciones por el tamano de los pesos y no aparecen en la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput. Cabe en GPUs de consumo.
- Cabe en consumer GPU: si, en tarjetas con 4 GB o mas de VRAM para q4_K_M y superiores; en CPU con llama.cpp tambien es viable con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (recomendado por la model card), Ollama, vLLM (solo para YARN y contexto extendido), TGI y otros runners compatibles con GGUF. La model card incluye instrucciones con `llama-cli` y `huggingface-cli`.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks de velocidad de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (este, GGUF) | 3,09B | 32.768 | qwen-research | GGUF | Hugging Face (repo de terceros) |
| Qwen2.5-Coder-7B-Instruct | 7B (no confirmado en la informacion) | no disponible | qwen-research | safetensors/GGUF | Hugging Face oficial |
| Qwen2.5-Coder-32B-Instruct | 32B (no confirmado en la informacion) | no disponible | qwen-research | safetensors/GGUF | Hugging Face oficial |
| CodeQwen1.5 (generacion anterior) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a la propia familia Qwen2.5-Coder porque la informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores (DeepSeek-Coder, CodeLlama, StarCoder2). No se dispone de cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia `qwen-research` (license: other): restringe el uso comercial; es necesario revisar el texto de la licencia en el enlace oficial antes de desplegar en produccion.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo de codigo, puede generar APIs, funciones o imports inexistentes; requiere validacion y ejecucion de tests.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, pero el modelo hereda los del corpus de entrenamiento (codigo de repositorios publicos, mayoritariamente en ingles).
- Contexto: los 32.768 tokens son el maximo en GGUF; la extension a 131.072 tokens solo es posible con modelos no GGUF y YARN via vLLM, por lo que esta variante no cubre casos de contexto ultra-largo.
- Repositorio de terceros: el empaquetado GGUF lo realiza `cyber-aura`, no el equipo oficial de Qwen; conviene verificar la integridad de los pesos frente al repo oficial `Qwen/Qwen2.5-Coder-3B-Instruct-GGUF`.
- Sin datos de benchmarks ni de velocidad en la informacion disponible: no se puede garantizar el rendimiento en tareas concretas sin evaluacion propia.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/cyber-aura/Qwen2.5-Coder-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repo GGUF oficial: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF
- Blog oficial de la familia: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF/blob/main/LICENSE
