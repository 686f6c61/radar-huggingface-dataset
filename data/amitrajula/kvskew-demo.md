# amitrajula/kvskew-demo

## Resumen

kvskew-demo es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario amitrajula en HuggingFace. El modelo base, desarrollado por el equipo Qwen de Alibaba Cloud, es un transformer causal de 0,49 mil millones de parametros (0,36B sin contar embeddings) con arquitectura Qwen2, atención con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings atados. El repositorio, de caracter demostrativo, se distribuye bajo licencia Apache 2.0 y esta etiquetado para generacion de texto y chat en ingles.

El nombre "kvskew-demo" sugiere un experimento relacionado con el sesgo (skew) en las matrices key/value de la atencion, aunque la model card no documenta el procedimiento de ajuste ni los datos utilizados. El modelo hereda las capacidades del Qwen2.5-0.5B-Instruct original: contexto completo de 32.768 tokens, generacion de hasta 8.192 tokens, soporte de plantillas de chat y compatibilidad con la libreria transformers y text-generation-inference.

Su relevancia es limitada: se trata de un modelo de 0,5B parametros con cero descargas y un solo "like" en el momento de la consulta, sin benchmarks publicados propios. Resulta util unicamente como referencia para experimentos de ajuste sobre Qwen2.5-0.5B o para pruebas de infraestructura de inferencia en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) con RoPE, SwiGLU, RMSNorm, atencion QKV con sesgo y embeddings atados |
| Parametros totales | 494.032.768 (0,49B); 0,36B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens; generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | Ingles (etiqueta del repo); el modelo base declara soporte para mas de 29 idiomas, pero este ajuste solo esta etiquetado en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Capas | 24 |
| Cabezas de atencion | 14 para Q y 2 para KV (GQA) |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B: un transformer decoder-only con 24 capas, atencion de consulta agrupada (GQA) con 14 cabezas de consulta y 2 de clave/valor, RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros efectivos a 0,36B fuera de la capa de embeddings.

El modelo base fue entrenado por el equipo Qwen en dos fases (preentrenamiento y postentrenamiento con instrucciones), segun la documentacion oficial. Sin embargo, la model card de este repositorio no describe el proceso de ajuste especifico de "kvskew-demo": no se indica el numero de tokens de ajuste, la composicion del dataset, si se empleo RLHF o DPO, ni la naturaleza exacta del experimento de sesgo KV que sugiere el nombre. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las heredadas del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste de Qwen2.5-0.5B-Instruct.
- Generacion de codigo y matematicas a nivel basico, limitado por el tamano de 0,5B parametros.
- Comprension de datos estructurados y generacion de salidas JSON (capacidad declarada del modelo base).
- Soporte de contexto largo: hasta 32.768 tokens de entrada y 8.192 de generacion.
- Capacidades multilingues teoricas del modelo base (mas de 29 idiomas), aunque este repositorio solo esta etiquetado en ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Pruebas de infraestructura de inferencia: el modelo cabe en cualquier GPU consumer y sirve para validar pipelines de transformers, text-generation-inference o vLLM antes de desplegar modelos mayores.
- Experimentos academicos sobre sesgo KV: dado el nombre del repositorio, puede emplearse como punto de partida para reproducir o comparar tecnicas de analisis de las matrices key/value en atencion.
- Prototipado de chatbots ligeros: con 0,49B parametros y plantilla de chat, permite iterar rapidamente en interfaces conversacionales sin coste de GPU significativo.
- Generacion de texto en dispositivos con recursos limitados: su tamano permite ejecucion en CPU o en GPUs de gama baja para tareas de completado simple.
- Educacion y demostraciones: util para explicar el funcionamiento de un transformer causal y el efecto del ajuste fino sobre un modelo base conocido.
- Filtrado o clasificacion de texto a pequena escala: aunque no esta especializado, puede adaptarse mediante prompting para tareas simples de etiquetado en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del modelo base Qwen2.5 en el blog oficial de Qwen, pero no aporta metricas propias de este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (0,49B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5-0,6 GB; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650, RTX 3050 y similares; tambien puede ejecutarse en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kvskew-demo (este) | 0,49B | 32.768 | Apache 2.0 | HuggingFace, 0 descargas | Ajuste demostrativo sin benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base oficial, con evaluacion publicada |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | HuggingFace | Misma familia, mayor capacidad |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | HuggingFace | Requiere aceptacion de licencia; contexto mayor |

## Limitaciones y advertencias

- Modelo de 0,49B parametros: capacidad de razonamiento, codigo y matematicas muy limitada en comparacion con modelos de mayor tamano.
- Riesgo elevado de alucinacion en tareas de conocimiento factual, inherente a su escala.
- Solo etiquetado en ingles; el rendimiento en castellano no esta verificado y puede degradarse respecto al modelo base multilingue.
- La model card no documenta el proceso de ajuste, los datos utilizados ni posibles sesgos introducidos, lo que impide evaluar su calidad de forma rigurosa.
- Cero descargas y un unico "like": no hay evidencia de uso en produccion ni validacion por la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluacion hace desaconsejable su uso en produccion sin pruebas propias.
- El nombre sugiere un experimento sobre sesgo KV; no debe asumirse que incorpore ninguna mejora tecnica verificada sobre el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amitrajula/kvskew-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
