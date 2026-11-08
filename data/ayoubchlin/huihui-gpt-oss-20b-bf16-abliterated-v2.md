# AyoubChLin/Huihui-gpt-oss-20b-BF16-abliterated-v2

## Resumen

AyoubChLin/Huihui-gpt-oss-20b-BF16-abliterated-v2 es un ajuste fino por SFT del modelo huihui-ai/Huihui-gpt-oss-20b-BF16-abliterated, que a su vez es una variante "abliterated" (con los mecanismos de rechazo reducidos mediante edicion de direcciones de activacion) del gpt-oss-20b de OpenAI. El modelo lo publica el usuario AyoubChLin, aunque la model card y el ecosistema de artefactos (GGUF, version mxfp4, imagen de Ollama) remiten al proyecto huihui.ai, autor del modelo base.

Se trata de un transformer de 20.914.757.184 parametros (~20,9 mil millones) con pesos en BF16 y safetensors, distribuido bajo licencia Apache 2.0. El repositorio ocupa 134,7 GB, lo que incluye pesos en precision completa, ficheros GGUF y artefactos de entrenamiento. El pipeline declarado es text-generation y es compatible con transformers, vLLM y llama.cpp (a partir de la build b6115), ademas de estar disponible como imagen de Ollama.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo de "abliteration" y posterior reentrenamiento SFT sobre un modelo abierto de ~20B; por otro, su proposito declarado es reducir el filtrado de seguridad, lo que lo hace util unicamente en contextos de investigacion controlados y no apto para produccion publica. La model card advierte explicitamente de la ausencia de garantias de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (gpt_oss), no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados), GGUF Q4_K_M, mxfp4 (variante separada del proyecto huihui) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de gpt_oss-20b y hereda la arquitectura transformer de dicho modelo base; la informacion proporcionada no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de contexto. Sobre esa base se aplico primero una abliteration (edicion de direcciones en el espacio de activaciones para suprimir el comportamiento de rechazo), dando lugar a huihui-ai/Huihui-gpt-oss-20b-BF16-abliterated, y despues un ajuste fino supervisado (SFT) con TRL 0.23.0 sobre Transformers 4.57.0.dev0, PyTorch 2.8.0+cu128 y Datasets 4.0.0.

El dataset de entrenamiento se genero usando el propio modelo abliterated para producir respuestas a instrucciones consideradas daninas, segun la model card. El autor reporta convergencia rapida (efecto visible en unas 400 iteraciones), con una brecha entre evaluacion y entrenamiento inferior a 0,01 en perdida, exactitud y entropia, lo que sugiere buena generalizacion. Tambien senala como posible problema el aumento de la norma del gradiente en fases tardias, atribuible a falta de decaimiento del learning rate o a ruido de batch, y recomienda revisar los logs por si hubiera explosion de gradiente. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en formato de chat (lista de mensajes con roles), segun el ejemplo de uso con `pipeline`.
- Razonamiento y respuesta a instrucciones abiertas, heredado del modelo base gpt-oss-20b.
- Capacidad de seguir instrucciones potencialmente daninas o sensibles, al haberse reducido el filtrado de seguridad (es el objetivo declarado del ajuste).
- Compatibilidad con vLLM para servir el modelo con alto rendimiento.
- Compatibilidad con llama.cpp (build b6115 o superior) mediante los ficheros GGUF publicados.
- Disponibilidad como imagen de Ollama (`huihui_ai/gpt-oss-abliterated:20b-v2-q4_K_M`), que requiere Ollama v0.11.8 o superior.
- Soporte de tool calling, agentes, vision, audio, modo thinking o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como responde un LLM de ~20B cuando se le retira el filtrado, comparando sus salidas con las del gpt-oss-20b original para medir el efecto de la abliteration y del SFT posterior.
- Red teaming controlado: util para generar intentos de prompt malicioso y evaluar la robustez de clasificadores de contenido o de guardarrailes propios, siempre en un entorno aislado y con supervision humana.
- Evaluacion de tecnicas de abliteration: sirve como caso de estudio reproducible del pipeline (abliteration, generacion de dataset, SFT con TRL) para quienes investigan edicion de comportamientos en modelos abiertos.
- Pruebas de pipelines de inferencia: al estar disponible en safetensors, GGUF y Ollama, permite validar despliegues con vLLM y llama.cpp y comparar latencia y calidad entre BF16 y Q4_K_M.
- Generacion de datos sinteticos para experimentos: puede producir grandes volumenes de respuestas a instrucciones dificiles que luego se filtran y revisan manualmente para construir datasets de entrenamiento o de evaluacion.
- Experimentos de cuantizacion: la variante mxfp4 y los GGUF permiten medir la degradacion de calidad al pasar de BF16 a 4 bits en un modelo de ~21B parametros.
- Docencia y demostraciones sobre riesgos de IA: ejemplifica de forma tangible por que los modelos abiertos sin filtrado requieren controles de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye curvas de metricas de entrenamiento (perdida, exactitud, entropia y norma del gradiente) sin valores numericos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 42 GB solo para pesos (20,9B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere 48 GB o mas, por lo que encaja en A100 80GB, H100 80GB o configuraciones multi-GPU.
- VRAM estimada en Q4_K_M: alrededor de 12-13 GB para pesos, con margen para contexto; cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con contexto moderado.
- GPU recomendadas: A100/H100 para BF16 en produccion; RTX 4090/3090 para cuantizacion 4 bits en local.
- Despliegue: transformers (pipeline), vLLM, llama.cpp (build b6115 o superior) y Ollama (v0.11.8 o superior).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AyoubChLin/Huihui-gpt-oss-20b-BF16-abliterated-v2 | ~20,9B | no disponible | Apache 2.0 | SFT adicional sobre el abliterated; sin filtrado de seguridad |
| huihui-ai/Huihui-gpt-oss-20b-BF16-abliterated | ~20,9B | no disponible | Apache 2.0 | Modelo base directo de este ajuste; solo abliteration |
| huihui-ai/Huihui-gpt-oss-20b-mxfp4-abliterated-v2 | ~20,9B | no disponible | Apache 2.0 | Misma receta en formato mxfp4, orientado a QAT |
| gpt-oss-20b (OpenAI) | ~20,9B | no disponible | no disponible en la informacion | Modelo original con filtrado de seguridad intacto |

## Limitaciones y advertencias

- El filtrado de seguridad esta significativamente reducido: puede generar contenido sensible, controvertido o inapropiado, y la propia model card desaconseja su uso en produccion o en aplicaciones comerciales de cara al publico.
- No es apto para audiencias menores ni para entornos publicos sin moderacion.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad multilingue.
- El autor senala posible inestabilidad en el entrenamiento (norma del gradiente creciente en fases tardias), sin confirmar si hubo explosion de gradiente.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre el contenido generado; el proyecto huihui.ai declina cualquier responsabilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Se recomienda uso exclusivo en investigacion, pruebas o entornos controlados, con monitorizacion en tiempo real y revision manual de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyoubChLin/Huihui-gpt-oss-20b-BF16-abliterated-v2
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gpt-oss-20b-BF16-abliterated
- Variante v2 del proyecto huihui (misma receta, mxfp4): https://huggingface.co/huihui-ai/Huihui-gpt-oss-20b-BF16-abliterated-v2
- Variante mxfp4: https://huggingface.co/huihui-ai/Huihui-gpt-oss-20b-mxfp4-abliterated-v2
- Imagen de Ollama: https://ollama.com/huihui_ai/gpt-oss-abliterated:20b-v2-q4_K_M
- Release de Ollama v0.11.8: https://github.com/ollama/ollama/releases/tag/v0.11.8
- Release de llama.cpp b6115: https://github.com/ggml-org/llama.cpp/releases/tag/b6115
- Repositorio TRL: https://github.com/huggingface/trl
- Guia de QAT para gpt-oss (NVIDIA TensorRT Model Optimizer): https://github.com/NVIDIA/TensorRT-Model-Optimizer/blob/76e8ce21bf9ce4e0510fea96c998aaee7cfeaf7c/examples/gpt-oss/README.md
- Perfil de huihui.ai en X: https://x.com/support_huihui
- Ko-fi del proyecto: https://ko-fi.com/huihuiai
