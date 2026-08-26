# sahilchachra/Huihui-Qwen3.8-27B-abliterated-MXFP4

## Resumen

Huihui-Qwen3.8-27B-abliterated-MXFP4 es una cuantizacion en formato MLX MXFP4 del modelo abliterated de huihui-ai, que a su vez deriva de Qwen3.8-27B, un modelo de lenguaje y vision (image-text-to-text) de la familia qwen3_5. El proceso de abliteration elimina la direccion de rechazo en las capas de texto 18 a 51, dando como resultado un modelo deliberadamente sin censura que no rechaza peticiones como haria el original. Esta version concreta, publicada por sahilchachra, cuantiza unicamente el backbone de texto a 4.449 bits por peso (MXFP4), manteniendo la torre de vision en bf16, lo que permite ejecutarlo en Apple Silicon con 24 GB de memoria unificada.

El modelo combina un backbone hibrido con atencion lineal GatedDeltaNet y atencion completa (cada cuarta capa), junto con una torre de vision Qwen3-VL. Es un modelo de razonamiento que emite un canal de pensamiento (thinking) antes de la respuesta final. Al estar abliterated, no aplica los rechazos de seguridad del modelo base, lo que lo hace util para experimentacion e investigacion, pero requiere precaucion en entornos de produccion. La licencia es Apache-2.0, y el repositorio incluye tambien una variante MXFP8 de mayor fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5: backbone hibrido GatedDeltaNet (linear attention) + full attention (64 capas, full attention cada 4.ª) + torre de vision Qwen3-VL |
| Parametros totales | 27B (modelo base); 5.505.879.280 en safetensors del repo cuantizado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 262K segun fuentes externas) |
| Tipos de cuantizacion | MXFP4 (E2M1 + E8M0, group size 32, 4.449 bpw); variante MXFP8 (8.381 bpw) disponible en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de atencion: 64 capas de texto donde la mayoria usan GatedDeltaNet, una variante de atencion lineal eficiente, y cada cuarta capa usa atencion completa (full attention) para mantener la capacidad de recuperacion de informacion a largo plazo. La torre de vision es la de Qwen3-VL, que procesa imagenes y las integra con el texto. En esta cuantizacion MXFP4, solo el backbone de texto (incluido el lm_head de ~1.27B parametros) se cuantiza a 4.449 bits por peso con escala compartida E8M0 y grupo de 32; la torre de vision permanece en bf16.

El proceso de abliteration, aplicado por huihui-ai sobre el modelo original, elimina la direccion de rechazo en las capas de texto 18 a 51, de modo que el modelo no se niega a responder a peticiones que el original rechazaria. No se dispone de informacion sobre el entrenamiento original de Qwen3.8-27B (datos, numero de tokens, metodos de alineacion). El repositorio cuantizado elimina la cabeza de multi-token prediction (MTP) utilizada para decodificacion especulativa, por lo que esta funcionalidad no esta disponible en esta version.

## Capacidades

- Generacion de texto con razonamiento explicito: emite un canal de pensamiento (thinking) antes de la respuesta final, util para tareas de logica y matematica.
- Comprension de imagenes (image-text-to-text): responde preguntas sobre el color, la forma y el contenido de imagenes, gracias a la torre de vision Qwen3-VL mantenida en bf16.
- Sin censura por abliteration: no aplica rechazos de seguridad del modelo base, lo que permite explorar temas que el original bloquearia.
- Razonamiento paso a paso: verificado en aritmetica basica (25 + 17) y preguntas factuales (capital de Francia).
- Multilingue: no se han publicado los idiomas soportados en la informacion disponible.
- Tool calling y agentes: no se menciona soporte en la documentacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration en el comportamiento de un LLM, comparando respuestas con el modelo original para analizar mecanismos de rechazo.
- Analisis de imagenes en entornos controlados: al mantener la torre de vision en bf16, puede usarse para tareas de descripcion y clasificacion visual basica (colores, formas) en prototipos de investigacion.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, dialogos o guiones donde se requiera explorar temas controvertidos sin filtros, siempre dentro de un marco legal y etico.
- Pruebas de razonamiento en Apple Silicon: al ser una cuantizacion MLX, permite evaluar capacidades de razonamiento paso a paso en hardware de Apple sin GPU dedicada, usando mlx-vlm o LM Studio.
- Desarrollo de asistentes conversacionales experimentales: para prototipos donde se necesite un modelo que no rechace peticiones, por ejemplo en demos de tecnicas de jailbreak o analisis de robustez.
- Benchmarking de cuantizacion: comparar la fidelidad de MXFP4 frente a MXFP8 o al modelo original en tareas de texto y vision, midiendo degradacion de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de humo cualitativas: respuestas correctas para la capital de Francia, aritmetica basica y reconocimiento de colores y formas en imagenes. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: 14.2 GiB de pesos en disco (14 GB), por lo que cabe en un Mac con 24 GB de memoria unificada, dejando margen para contexto y calculos.
- GPU recomendadas: Apple Silicon (serie M) con al menos 24 GB de RAM unificada; no requiere GPU NVIDIA ni AMD.
- Compatibilidad con GPU de consumo: no aplica, ya que el formato MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: mlx-vlm (version >= 0.6.12) para Python, y LM Studio (probado en 0.4.20 con runtime mlx-llm).
- Latencia y throughput: no disponibles. Al ser un modelo de razonamiento, se recomienda un max_tokens de al menos 200 para que el canal de pensamiento no deje la respuesta vacia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-MXFP4 (este) | 27B (base) | no disponible | MXFP4 4.449 bpw | Apache-2.0 | Abliterated, vision, MLX |
| Huihui-Qwen3.8-27B-abliterated-MXFP8 | 27B (base) | no disponible | MXFP8 8.381 bpw | Apache-2.0 | Mayor fidelidad, 27 GB, requiere 32 GB+ |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base) | 27B | 262K (segun fuentes externas) | bf16/FP8 | Apache-2.0 | Modelo original abliterated, con MTP y vision |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | 262K | GGUF (varias) | Apache-2.0 | Para llama.cpp, incluye MTP |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos abliterated comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: al eliminar la direccion de rechazo, puede generar contenido inapropiado, ofensivo o ilegal. No es adecuado para produccion sin supervision humana y filtros adicionales.
- Sin decodificacion especulativa: la cabeza MTP se elimina en esta cuantizacion, por lo que la velocidad de generacion puede ser menor que en el modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; como cualquier LLM, puede inventar hechos o razonamientos incorrectos.
- Sesgos del modelo base: hereda los sesgos de Qwen3.8-27B, que no estan documentados en la informacion disponible.
- Limitaciones de contexto: la longitud de contexto no se confirma en esta cuantizacion; aunque el base soporta 262K, el uso en MLX con 24 GB puede requerir contextos mas cortos.
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero el caracter uncensored puede entrar en conflicto con politicas de plataformas o legislacion local.
- Solo Apple Silicon: el formato MLX no es portable a otras arquitecturas sin conversion a GGUF u otros formatos.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/sahilchachra/Huihui-Qwen3.8-27B-abliterated-MXFP4
- Variante MXFP8: https://huggingface.co/sahilchachra/Huihui-Qwen3.8-27B-abliterated-MXFP8
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Version GGUF del modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Articulo sobre el lanzamiento: https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
- Blog sobre la version GGUF uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Entrada en LLM Explorer: https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated,7yiXfSP5itojtujYtkbmXj
