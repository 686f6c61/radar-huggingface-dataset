# bambocher/Qwen3.5-9B-heretic-oQ5-mtp

## Resumen

Qwen3.5-9B-heretic-oQ5-mtp es una cuantizacion de un modelo de la familia Qwen3.5 de Alibaba (el modelo base original no se identifica con nombre completo en la informacion disponible). El autor del artefacto es el usuario bambocher, que lo ha publicado en Hugging Face el 13 de noviembre de 2026. Se trata de una version "heretic" (presumiblemente una variante con las restricciones de rechazo relajadas, aunque la model card no lo detalla) cuantizada con oQ (oMLX v0.7.3), la herramienta de cuantizacion de precision mixta del proyecto oMLX.

El checkpoint contiene 9.653.104.368 parametros reales distribuidos en tres componentes: el modelo de lenguaje (8.954B), un codificador visual (0.456B) y una cabeza MTP (Multi-Token Prediction, 0.243B). La cuantizacion es mixta: la mayor parte de los pesos (76,8%) se almacena en 5 bits afines con grupo de 64, una porcion menor en 6 y 8 bits, y un 5,08% se mantiene en BF16. El resultado es un peso efectivo medio de 6,219 bits por parametro y un repositorio de 7,5 GB.

La relevancia de este artefacto es doble: por un lado, demuestra el flujo de cuantizacion mixta de oMLX aplicado a un modelo multimodal con cabeza MTP; por otro, su formato MLX lo hace directamente ejecutable en Apple Silicon. No obstante, la informacion publicada es muy limitada: no hay model card descriptiva del modelo base, ni licencia, ni idiomas, ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal con vision y cabeza MTP; detalles no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ (oMLX v0.7.3): affine 5-bit grupo 64 (76,813%), affine 6-bit grupo 64 (17,880%), affine 8-bit grupo 64 (0,224%), BF16 (5,083%); media efectiva 6,219 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion MLX (libreria mlx); repo de 7,5 GB (6,989 GiB) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 6,380 GB / 5,942 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,212 GB / 0,198 GiB |
| Total | 9,653B | 7,504 GB / 6,989 GiB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni su proceso de entrenamiento. Por los metadatos se deduce que se trata de un transformer de la familia Qwen3.5 con tres modulos diferenciados: un modelo de lenguaje de 8,954B parametros, un codificador visual de 0,456B (lo que confirma capacidades multimodales de imagen) y una cabeza MTP de 0,243B. La presencia de una cabeza Multi-Token Prediction sugiere que el modelo base fue entrenado con ese objetivo auxiliar, habitual para acelerar la decodificacion mediante prediccion de varios tokens por paso.

El unico proceso documentado es la cuantizacion, realizada con oQ (oMLX v0.7.3) en precision mixta. La estrategia asigna 5 bits a la mayoria de las matrices (probablemente las de mayor tamano y menor sensibilidad), 6 bits a un subconjunto de 1,726B parametros y 8 bits a solo 0,022B, manteniendo en BF16 0,491B parametros (presumiblemente capas normalizacion, embeddings o modulos sensibles). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documenta que modifica exactamente la variante "heretic".

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 8,954B soporta las capacidades estandar de la familia Qwen3.5, aunque no se detallan en la model card.
- Vision: incluye un codificador visual de 0,456B, por lo que puede procesar imagenes ademas de texto.
- Prediccion multi-token (MTP): la cabeza dedicada de 0,243B permite decodificacion especulativa o generacion de varios tokens por paso, lo que puede reducir la latencia en inferencia.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 7,5 GB permiten ejecutar el modelo en Macs con memoria unificada de 16 GB o superior mediante la libreria mlx, sin necesidad de GPU dedicada.
- Prototipado de aplicaciones multimodales en local: al incluir codificador visual, puede usarse para experimentar con tareas de imagen y texto (descripcion de imagenes, VQA) en un equipo de sobremesa antes de escalar a un modelo mayor.
- Evaluacion de cuantizacion mixta: util para investigadores que quieran medir la perdida de calidad de oQ a 6,219 bits/peso frente al modelo base en BF16, comparando tareas de razonamiento y vision.
- Pruebas de decodificacion especulativa: la cabeza MTP permite experimentar con tecnicas de aceleracion de inferencia y medir su impacto en throughput sobre hardware Apple.
- Desarrollo de asistentes conversacionales offline: un modelo de ~9,6B en 7,5 GB puede desplegarse en un portatil para asistentes que no envien datos a la nube, siempre que se validen previamente sus politicas de rechazo (variante "heretic").
- Fine-tuning o adaptacion posterior: al estar en safetensors MLX, puede servir como punto de partida para LoRA o adaptaciones ligeras en flujos de trabajo con mlx-examples, aunque la cuantizacion limita el ajuste directo de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 6,989 GiB (7,504 GB) en disco; en inferencia hay que sumar la cache KV y los buffers de activaciones, por lo que se recomienda al menos 10-12 GB de memoria disponible.
- GPU recomendadas: al ser un formato MLX, el hardware objetivo son los chips Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No esta pensado para CUDA.
- Compatibilidad con GPU de consumo: cabe en Macs con memoria unificada de 16 GB o mas; en 8 GB no es viable con margen para contexto. En GPUs NVIDIA no es directamente utilizable sin reconvertir los pesos.
- Opciones de despliegue: libreria mlx (mlx-lm / mlx-vlm segun el caso), y herramientas del ecosistema oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ5-mtp | 9,653B | no disponible | MLX safetensors (6,219 bits/peso) | no disponible | Multimodal con cabeza MTP, cuantizacion mixta oQ |
| Modelo base Qwen3.5-9B (referencia) | ~9,6B (no confirmado) | no disponible | safetensors BF16 | no disponible | No identificado con nombre exacto en la informacion |
| Alternativas de ~9B en MLX | no disponible | no disponible | MLX | no disponible | No se dispone de datos verificables para comparar |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas concretas; los datos de rendimiento, contexto y licencia del modelo base no estan publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia del modelo base ni del artefacto, lo que impide determinar si el uso comercial esta permitido. Es imprescindible verificar la licencia del Qwen3.5-9B original antes de cualquier despliegue en produccion.
- Variante "heretic": el nombre sugiere que se han relajado o eliminado los mecanismos de rechazo del modelo base. Esto puede aumentar el riesgo de generar contenido inapropiado, inseguro o no alineado, y no hay documentacion sobre el metodo empleado.
- Perdida por cuantizacion: la cuantizacion mixta a 6,219 bits/peso puede degradar tareas sensibles (matematicas, codigo, vision de detalle) respecto al modelo en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones de factualidad en la informacion disponible.
- Idiomas y contexto desconocidos: no se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de casos de uso multilingues o de contexto largo.
- Ecosistema restringido: el formato MLX solo es ejecutable de forma nativa en Apple Silicon; el despliegue en servidores con GPU NVIDIA requiere conversion previa.
- Metadatos minimos: sin pipeline declarado, sin descargas ni likes, y con una model card que solo documenta la cuantizacion. La trazabilidad del modelo base y del proceso "heretic" es insuficiente para un uso en produccion sin validacion adicional.
- Repositorio recien creado: publicado y actualizado en menos de un minuto el 13 de noviembre de 2026, sin historial de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ5-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelos Qwen (organizacion oficial): https://huggingface.co/Qwen
- Libreria MLX: https://github.com/ml-explore/mlx
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
