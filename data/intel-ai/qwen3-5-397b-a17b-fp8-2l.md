# intel-ai/Qwen3.5-397B-A17B-FP8-2L

## Resumen

Qwen3.5-397B-A17B-FP8-2L es un checkpoint publicado por intel-ai en Hugging Face que, por su nomenclatura, se presenta como una version en precision FP8 de un modelo Qwen3.5 de arquitectura MoE con 397.000 millones de parametros totales y 17.000 millones activos. El sufijo "2L" sugiere una variante de dos capas o de dos niveles, aunque la informacion disponible no detalla su significado exacto. La etiqueta de arquitectura en el repositorio es `qwen3_5_moe`, lo que confirma que se trata de un transformer con mezcla de expertos.

El dato mas llamativo es la discrepancia entre la nomenclatura y el peso real de los ficheros: el repositorio contiene safetensors que suman 21.828.570.368 parametros (unos 21,8 mil millones) y ocupa 37,2 GB. Esto es coherente con un modelo de aproximadamente 21,8 mil millones de parametros almacenados en FP8 (1 byte por parametro), pero no con un modelo de 397.000 millones. Por tanto, el checkpoint parece ser un subconjunto, una destilacion o una version reducida del modelo que sugiere el nombre, y debe tratarse con cautela hasta verificar su contenido real.

El modelo es relevante para desarrolladores que evaluan alternativas MoE eficientes en memoria y para quienes trabajan con cuantizacion FP8 en hardware Intel. Sin embargo, la ausencia de model card, licencia, idiomas declarados y benchmarks hace que su adopcion en produccion requiera una validacion manual previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`) |
| Parametros totales | 21.828.570.368 (segun safetensors); el nombre indica 397B, no verificado |
| Parametros activos | 17B segun nomenclatura (no verificado en ficheros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato del checkpoint); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 37,2 GB |
| Fecha de creacion | 2026-11-13 |
| Ultima actualizacion | 2026-11-19 |
| Descargas | 36 |
| Likes | 0 |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5_moe` indica una arquitectura de transformer con mezcla de expertos (MoE), en la linea de la familia Qwen3.5. En un MoE tipico, cada token se enruta a un subconjunto de expertos, de modo que el coste computacional por token depende de los parametros activos y no de los totales. La nomenclatura del checkpoint sugiere 397B totales con 17B activos, una relacion de activacion de aproximadamente el 4,3 %, habitual en modelos MoE de gran escala.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El checkpoint esta almacenado en FP8, lo que reduce el peso a la mitad respecto a BF16 y facilita el despliegue en GPUs con soporte nativo de FP8 (H100, H200, B200 y aceleradores Intel con FP8). El sufijo "2L" no esta documentado.

## Capacidades

- Generacion de texto y razonamiento: capacidades esperables de un modelo de la familia Qwen3.5, no verificadas en la informacion disponible.
- Codigo y matematicas: no confirmado por el autor.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas en el repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia en FP8: el checkpoint esta preparado para ejecucion en precision FP8.

## Casos de uso

- Evaluacion de modelos MoE en FP8: el checkpoint permite medir throughput y calidad de un MoE cuantizado en FP8 sobre GPUs con soporte nativo, comparandolo con la version BF16 del mismo modelo.
- Despliegue en infraestructura Intel: al estar publicado por intel-ai, es candidato natural para validar stacks de inferencia sobre aceleradores Intel (Gaudi, Xeon con AMX) y comparar con alternativas en GPU.
- Prototipado de asistentes conversacionales: si el modelo conserva las capacidades de la familia Qwen, podria usarse para chat multi-turno, aunque la falta de datos de contexto impide garantizar ventanas largas.
- Generacion de codigo en pipelines internos: un MoE con 17B activos ofrece un coste por token contenido; seria adecuado para autocompletado y refactorizacion, previa validacion de calidad.
- Investigacion sobre cuantizacion: util para estudiar la degradacion de calidad al pasar de BF16 a FP8 en arquitecturas MoE con muchos expertos.
- Fine-tuning con LoRA sobre la base FP8: permite adaptar el modelo a dominios concretos con requisitos de memoria reducidos, siempre que el framework soporte entrenamiento en FP8 o dequantizacion selectiva.
- Benchmarking de serving: comparar vLLM, TGI y soluciones propietarias con un checkpoint FP8 de ~22B almacenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 37,2 GB en FP8; la inferencia requiere al menos esa cantidad mas overhead de KV cache y activaciones, por lo que se recomienda un minimo de 48 GB y, para contextos largos, 80 GB.
- GPU recomendadas: H100 80 GB, H200, B200 y A100 80 GB (esta ultima sin aceleracion FP8 nativa, con conversion a BF16/FP16). Para el modelo nominal de 397B, se requeriria un cluster multi-GPU muy superior.
- Consumer GPU: no cabe en RTX 4090 (24 GB) en FP8 sin offloading o cuantizacion adicional a 4 bits; en ese caso, seria necesario un esquema GGUF/AWQ no incluido en el repositorio.
- Opciones de despliegue: vLLM y TGI para FP8 en GPU; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repo. Para hardware Intel, se puede evaluar OpenVINO y IPEX.
- Latencia y throughput: no disponibles; dependeran del hardware y del numero real de parametros activos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-FP8-2L | 21,8B (segun safetensors) | 17B (nominal) | no disponible | no disponible | safetensors FP8 |
| Qwen3-30B-A3B | 30B | 3B | 128K (tipico en la familia) | Apache 2.0 (familia Qwen) | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | MIT (codigo) / licencia de modelo | safetensors |

La comparativa es orientativa: los datos de Qwen3, Mixtral y DeepSeek-V2-Lite provienen del conocimiento publico de esos modelos, mientras que para el checkpoint de intel-ai no hay ficha tecnica que confirme contexto, licencia ni calidad.

## Limitaciones y advertencias

- Discrepancia critica entre el nombre (397B) y los parametros reales en safetensors (21,8B): es imprescindible verificar el contenido antes de asumir capacidades de un modelo de 397B.
- Ausencia de model card: no hay informacion sobre entrenamiento, datos, sesgos ni evaluaciones.
- Licencia no declarada: no se puede garantizar uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5.
- Idiomas no declarados: no se puede confirmar soporte multilingue ni calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks no se puede acotar su magnitud.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Baja traccion (36 descargas, 0 likes): poca validacion comunitaria; tratar como checkpoint experimental.
- Formato FP8: requiere hardware compatible o conversion previa; no hay GGUF disponible para despliegue en CPU o consumer GPU.
- El sufijo "2L" no esta documentado y podria implicar una arquitectura recortada con comportamiento distinto al modelo nominal.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-FP8-2L
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
