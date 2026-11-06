# drakarah/Huihui-Ornith-1.5-35B-A3B-abliterated-EdgeLLM-INT4

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-EdgeLLM-INT4 es una exportación cuantizada a INT4 (GPTQ) del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario drakarah. La cadena de origen es Qwen3.6-35B-A3B, seguida del post-entrenamiento ornith-ai/Ornith-1.5-35B-A3B, la abliteración de huihui-ai (solo las capas 11 a 29 de 40 están ablacionadas) y, finalmente, esta cuantización. El resultado es un modelo de arquitectura MoE (qwen3_5_moe) con 35B parámetros totales y 3B activos, sin mecanismos de rechazo, orientado a despliegue en hardware de consumo.

El paquete no es un checkpoint de transformers ni un motor TensorRT precompilado, sino una exportación ONNX con pesos INT4 empaquetados en formato Marlin, pensada para compilarse y servirse con el fork drakarah/TensorRT-Edge-LLM. El autor lo valida en una RTX 4060 de 8 GB con un i9-12900H y 31 GB de RAM, lo que sitúa el objetivo en estaciones de trabajo modestas y GPUs de gama media.

Su relevancia actual es doble: por un lado, demuestra que un MoE de 35B puede ejecutarse con decodificación de 68-78 tok/s en una GPU de 8 GB manteniendo los expertos en memoria host; por otro, la calibración está sesgada deliberadamente hacia código y ciberseguridad (40% seguridad, 27% código, 18% uso agéntico de herramientas), lo que lo hace especialmente adecuado para tareas de agentes de código y análisis ofensivo-defensivo, con las advertencias de seguridad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con atención lineal (GDN) y atención estándar, 40 capas |
| Parametros totales | 35B |
| Parametros activos | 3B (aproximado, según nomenclatura A3B) |
| Longitud de contexto | Hasta 131.072 tokens de capacidad KV en la receta de compilación; pasadas de hasta 12.288 tokens |
| Tipos de cuantizacion | INT4 GPTQ grupo 128 simétrico por capas (expertos y capas densas); router, norms y proyecciones GDN pequeñas en FP16; KV cache INT8 |
| Idiomas soportados | No disponible (la calibración incluye texto no latino zh, ru, ar con peso 2,5x, pero no se declara lista oficial) |
| Licencia | MIT (heredada de Ornith-1.5) |
| Formato de pesos | ONNX (model.onnx + model.onnx.data) y safetensors Marlin-packed para expertos; no es GGUF ni checkpoint transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE de tipo Qwen3.5 con 40 capas, 35B parámetros totales y aproximadamente 3B activos por token. La arquitectura combina capas de atención estándar con capas de atención lineal (denominadas GDN en la documentación del autor) y un experto compartido junto con expertos enrutados. La abliteración aplicada por huihui-ai afecta únicamente a las capas 11 a 29 de 40, lo que elimina los rechazos sin modificar el resto del comportamiento del modelo.

La cuantización se realizó con GPTQ por capas: expertos en INT4 con grupo 128 y 512 textos de calibración (1.708-4.226 tokens cada uno, 32 reservados para validación), con un error de salida MoE fuera de muestra del 5-12% por encima del error in-sample; un puñado de los 10.240 expertos cayó a round-to-nearest por falta de tokens enrutados. Las capas densas (atención, atención lineal, expertos compartidos y cabeza de salida) se cuantizaron también a INT4 GPTQ sobre los expertos ya cuantizados, y las escalas INT8 del KV cache se obtuvieron de 64 muestras de 1.024 tokens. La mezcla de calibración está sesgada a código y ciberseguridad (40% seguridad, 27% código, 18% uso agéntico de herramientas, 15% general), con fuentes públicas como PayloadsAllTheThings, HackTricks, nuclei-templates y Exploit-DB. No se usó imatrix; GPTQ calcula sus propias matrices de Hessian a partir de las activaciones. Todo el proceso es reproducible con los scripts del repositorio de notas del autor.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable (HumanEval-think ejecutado con temperatura 0,6, top_p 0,95, top_k 20 y hasta 32.768 tokens).
- Generación de código y razonamiento sobre código, con calibración específica para este dominio.
- Uso agéntico de herramientas: el autor reporta ejecuciones de un agente de código (pi coding-agent) en contenedor sin red, con 19 de 24 tareas completadas frente a 12 del Qwen3.6 base.
- Razonamiento multi-paso en tareas de ingeniería inversa y ciberseguridad (5 tareas Cybench, 4 de 10 flags exactas frente a 3 de 10 del base).
- Capacidad multilingüe no declarada formalmente, aunque la calibración incluye texto en chino, ruso y árabe con peso 2,5x.
- Sin mecanismos de rechazo (abliterated): responde a solicitudes que un modelo alineado declinaría, incluidas las de seguridad ofensiva.
- No se documentan capacidades de visión, audio ni tool calling estructurado más allá del uso agéntico observado.

## Casos de uso

- Agentes de código autónomos en entornos aislados: el modelo completa tareas de edición y ejecución de código en contenedores sin red, con 19 de 24 tareas completadas en las pruebas del autor y un consumo mediano de 542-570 tokens por tarea en HumanEval-think, muy por debajo de los 2.600-3.200 del Qwen3.6 base. Adecuado para pipelines de CI/CD con sandbox estricto.
- Análisis de seguridad defensiva y pruebas de penetración autorizadas: la calibración con Exploit-DB, HackTricks y nuclei-templates, junto con los resultados en Cybench (4 de 10 flags), lo orienta a tareas de reconocimiento, análisis de vulnerabilidades y generación de payloads en entornos controlados.
- Asistente de revisión de código en local: con 68-78 tok/s de decodificación en una RTX 4060 y contexto de hasta 65k tokens, puede mantener sesiones de revisión sobre repositorios medianos sin salir del puesto de trabajo.
- Despliegue en estaciones con GPU de 8 GB: el esquema de expertos en memoria host (EDGELLM_HOST_EXTERNAL_WEIGHTS=int4_moe) permite servir el modelo en una RTX 4060, 3070 o 4060 Ti, con 31 GB de RAM del sistema.
- Generación de documentación técnica y explicaciones de código: el modo thinking con hasta 32.768 tokens permite razonamientos largos sobre fragmentos de código extensos.
- Experimentación en investigación sobre alineación y abliteración: al estar ablacionadas solo las capas 11-29 de 40, sirve para estudiar el efecto de la abliteración parcial sobre el comportamiento y la calidad, con licencia MIT y pesos reproducibles.
- Prototipado de agentes con uso de herramientas en local: aunque no se documenta tool calling estructurado, el rendimiento observado en el agente pi sugiere viabilidad para flujos de tool use en sandbox.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Qwen3.6-35B-A3B (referencia del autor) |
|---|---|---|
| HumanEval-think (66 tareas, thinking on) | 62/66 (primera build), 61/66 (segunda build) | 59/66 (calibración código), 58/66 (calibración neerlandés) |
| Tokens medianos por tarea HumanEval-think | 542-570 | 2.600-3.200 |
| Agente de código pi (24 ejecuciones, sin red) | 19 completadas, 3 con fuga a 16.384 tokens | 12 completadas, 12 con fuga |
| Cybench (5 tareas, 2 ejecuciones cada una) | 4/10 flags exactas | 3/10 flags exactas |
| Prefill (prompts fríos de 1.600 tokens) | ~1.300 tok/s | No disponible |
| Decodificación (5k-65k tokens de contexto) | 68-78 tok/s | 74-82 tok/s |

No se midió la divergencia KL frente a los pesos bf16 (no caben en 31 GB de RAM), ni la comparación con la release GGUF, ni SWE-bench ni Terminal-Bench. El autor advierte que las diferencias pequeñas deben leerse como ruido al ser una sola ejecución por tarea.

## Requisitos de hardware

- VRAM: el autor lo ejecuta en una RTX 4060 de 8 GB con expertos en memoria host; el repositorio ocupa 18,7 GB en disco (16,1 GB de expertos INT4 + 1,5 GB de grafo y pesos densos + embeddings FP16).
- RAM del sistema: 31 GB en la máquina de referencia; los expertos y la tabla de embeddings residen en memoria host durante el servicio.
- GPU recomendadas: RTX 4060 8 GB (validada), previsiblemente RTX 3070/4060 Ti 8-16 GB y GPUs con más VRAM para mantener la caché de expertos completa en VRAM; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en 8 GB, con el esquema de expertos externos en host y penalización de latencia en los fallos de caché.
- Despliegue: exclusivamente mediante el fork drakarah/TensorRT-Edge-LLM (rama rtx4060/qwen-defaults-merge) con llm_build; no hay perfil compose de un solo comando. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Throughput: prefill ~1.300 tok/s en prompts fríos de 1.600 tokens; decodificación 68-78 tok/s entre 5k y 65k tokens de contexto. Los ajustes del motor se afinaron sobre Qwen3.6 y no se reajustaron para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento observado | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-Ornith-1.5-35B-A3B-abliterated-EdgeLLM-INT4 | 35B totales / 3B activos | 131.072 KV | HumanEval-think 61-62/66; Cybench 4/10 | MIT | ONNX + safetensors INT4 |
| Qwen3.6-35B-A3B (base, según el autor) | 35B totales / 3B activos | No disponible | HumanEval-think 58-59/66; Cybench 3/10; agente 12/24 | No disponible | No disponible |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (bf16) | 35B totales / 3B activos | No disponible | No medido por el autor (no cabe en 31 GB de RAM) | MIT | Safetensors bf16 |
| Release GGUF de los mismos pesos (por terceros) | 35B totales / 3B activos | No disponible | No comparado por el autor | MIT | GGUF |

La comparación directa con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: responde a solicitudes de seguridad ofensiva y otras que un modelo alineado declinaría. El autor recomienda ejecutar agentes en sandbox sin red ni montajes del host y no exponerlo a usuarios no confiables.
- La abliteración es parcial (capas 11-29 de 40), por lo que el comportamiento puede ser inconsistente entre capas y no está caracterizado en detalle.
- Riesgo de alucinación no cuantificado: no se midió KL frente a bf16 ni se comparó con la release GGUF, así que la degradación por cuantización INT4 solo está acotada por el error de calibración (5-12% fuera de muestra en la salida MoE).
- La calibración está fuertemente sesgada a código y ciberseguridad; el rendimiento en dominios generales, literatura o conversación abierta puede ser inferior al del modelo base.
- Idiomas soportados no declarados oficialmente; la mezcla de calibración incluye zh, ru y ar con peso 2,5x, pero no hay evaluación multilingüe publicada.
- El formato es un artefacto ONNX para un fork concreto de TensorRT-Edge-LLM: el motor solo carga en la GPU y versión de TensorRT que lo compiló, por lo que hay que compilarlo en cada máquina. No hay integración con vLLM, llama.cpp, Ollama ni TGI.
- El autor advierte que los benchmarks son de una sola ejecución por tarea y que las diferencias pequeñas son ruido; los números de HumanEval corresponden a una primera build y la segunda se comporta de forma similar pero no idéntica.
- El corpus de calibración no se redistribuye y no está disponible; la reproducibilidad depende de muestrear las mismas fuentes públicas en las mismas proporciones.
- No se midieron SWE-bench ni Terminal-Bench, y el modelo no mostró mejora en localización de la causa de un bug en revisión de código (0 de 6, igual que el base).

## Enlaces

- Hugging Face: https://huggingface.co/drakarah/Huihui-Ornith-1.5-35B-A3B-abliterated-EdgeLLM-INT4
- Modelo base (abliterado): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Exportación previa del mismo autor (Qwen3.6-35B-A3B-EdgeLLM-INT4): https://huggingface.co/drakarah/Qwen3.6-35B-A3B-EdgeLLM-INT4
- Fork de TensorRT-Edge-LLM: https://github.com/drakarah/TensorRT-Edge-LLM (rama rtx4060/qwen-defaults-merge)
- Repositorio de notas y scripts de cuantización: https://github.com/UCLL-RE-Gen-AI/slim-gemma4-orin
