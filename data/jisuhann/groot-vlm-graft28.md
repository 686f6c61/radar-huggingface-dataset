# JisuHann/groot-vlm-graft28

## Resumen

`JisuHann/groot-vlm-graft28` es un modelo vision-lenguaje (VLM) de 2,15 mil millones de parametros publicado por el usuario JisuHann. No es un modelo entrenado desde cero, sino un artefacto de investigacion construido por ensamblaje: toma la ruta vision-lenguaje del checkpoint de robotica NVIDIA GR00T N1.5-3B (`backbone.eagle_model`) y completa las capas del decodificador LLM que NVIDIA no publica. El checkpoint original de GR00T solo incluye 12 de las 28 capas del decodificador, porque la politica de robotica nunca necesita el resto; este repositorio rellena las capas 12 a 27 con los pesos publicos de Qwen3-1.7B para que el modelo de lenguaje sea completo y pueda generar texto.

La arquitectura sigue el esquema Eagle2.5-VL: torre de vision SigLIP2 de 27 capas (1152 dimensiones, parche de 14 px, entrada de 224 px), un conector `mlp1.0` consistente en una unica capa `Linear(1152 → 2048)` y un decodificador de 28 capas en bfloat16. Se distribuye en safetensors con `tie_word_embeddings=True`, de modo que `lm_head.weight` no se almacena por separado. Los 760 tensores guardados son identicos byte a byte (`torch.equal`) a los tensores de origen, sin conversion ni recuantizacion.

Su relevancia es acotada y puramente investigadora: el propio autor advierte que no es el VLM de NVIDIA y que debe tratarse como un artefacto para sondear que representan el codificador visual y las capas bajas del LLM de GR00T N1.5. El caso de uso validado es un sondeo sobre escenas de navegacion segura de RoboCasa, con 50 muestras, donde el modelo identifica el obstaculo en el suelo dentro de su top-3 en 24 de 31 casos visibles (77 %, frente al 16,7 % esperado por azar) a resolucion nativa de 640×480.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo Eagle2.5-VL: torre de vision SigLIP2 + conector MLP + decodificador LLM de 28 capas |
| Parametros totales | 2.150.092.736 (2,15B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | no disponible; los pesos se publican en bfloat16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other, con nombre `nvidia-gr00t-n1.5`; las capas 12-27 proceden de Qwen3-1.7B (Apache-2.0) |
| Formato de pesos | safetensors (bfloat16) |
| Torre de vision | SigLIP2, 27 capas, 1152 dimensiones, patch 14, entrada de 224 px |
| Conector | `mlp1.0`, una unica `Linear(1152 → 2048)` |
| Capas del LLM | 28 (0-11 procedentes de GR00T N1.5-3B; 12-27 de Qwen3-1.7B) |
| Tokens por imagen | 256 por tile de 224 px (sin pixel shuffle); una imagen de 640×480 produce 12 tiles + miniatura = 13 tiles = 3.328 tokens |
| Modelos base | nvidia/GR00T-N1.5-3B, Qwen/Qwen3-1.7B |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 4,3 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es un injerto de pesos (de ahi el nombre `graft28`). La torre de vision (SigLIP2), el conector `mlp1.0`, las capas 0-11 del LLM, la normalizacion final, el `lm_head` y los `embed_tokens` provienen del checkpoint de GR00T N1.5-3B. Las capas 12-27 se copian de Qwen3-1.7B publico. El script `build_graft28.py` documenta la construccion y `provenance.json` la verificacion: los 760 tensores guardados coinciden byte a byte con sus origenes. El conjunto resultante tiene 28 capas de decodificador, 2,15B de parametros en bfloat16 y embeddings atados.

Tecnicamente, la ruta visual presenta tres diferencias respecto a la implementacion publica de Eagle2.5-VL que incorpora vLLM: el conector es una sola `Linear(1152 → 2048)` en lugar de `LayerNorm + Linear + GELU + Linear`; nunca aplica pixel shuffle (`use_pixel_shuffle: false`, de modo que los 256 parches de un tile de 224 px pasan integros al conector); y la normalizacion de imagen usa las medias y desviaciones de SigLIP (0,5) en lugar de las de ImageNet (0,485… / 0,229…). El repositorio incluye `vllm_plugin/`, un plugin que corrige exactamente esos tres puntos: fijar `downsample_ratio: 1.0` convierte el pixel shuffle de vLLM en una operacion nula y ajusta `image_seq_length` a 256, de modo que el plugin solo sobrescribe la forma del conector y las constantes de normalizacion. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni composicion de dataset, porque no hubo entrenamiento.

## Capacidades

- Generacion de texto a partir de imagenes (pipeline `image-text-to-text`), con la ruta visual de GR00T N1.5 y un decodificador LLM completado con pesos de Qwen3-1.7B.
- Descripcion e identificacion de objetos en escenas de robotica: el unico caso empiricamente validado es nombrar el obstaculo presente en el suelo en escenas de navegacion segura de RoboCasa.
- Extraccion de caracteristicas (`feature-extraction`): el modelo esta pensado para acceder a los estados internos del codificador visual y de las capas bajas del LLM, y analizar que representan.
- Procesamiento de imagenes en dos regimenes de resolucion: a resolucion de politica (224 px, un tile, 256 tokens) y a resolucion nativa (por ejemplo 640×480, 13 tiles, 3.328 tokens).
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponible; no se declara ningun idioma en la ficha de HuggingFace.
- Modo thinking o razonamiento explicito: no documentado para este injerto.
- Capacidades de vision, audio o video adicionales: no disponibles; solo imagen.

## Casos de uso

- Interpretabilidad del codificador visual de GR00T N1.5: cargar el modelo con `AutoModel` y `AutoProcessor`, extraer los estados intermedios de la torre SigLIP2 y de las capas 0-11 del LLM para analizar que caracteristicas visuales codifica la politica de robotica original.
- Etiquetado de obstaculos en escenas de navegacion: dado un fotograma egocentrico, pedir al modelo que nombre el obstaculo del suelo; en el sondeo publicado acierta en el top-3 en el 77 % de los casos visibles (24/31), con rango medio 2,5.
- Deteccion de oclusion como senal auxiliar: el mismo sondeo reporta un AUROC de 0,973 para separar casos visibles de ocluidos a resolucion nativa, reutilizable como heuristico de calidad de percepcion en datasets de robotica.
- Estudio comparativo de resolucion: comparar el rendimiento a 224 px (45 % top-3, rango medio 6,4) frente a 640×480 (77 % top-3, rango medio 2,5) para justificar decisiones de preprocesado en pipelines de robotica.
- Extraccion de embeddings para entrenar cabezas auxiliares: usar las caracteristicas visuales como entrada de clasificadores o modulos de politica en investigacion de aprendizaje por imitacion.
- Servicio de inferencia multimodal en laboratorio: desplegar con vLLM mediante el plugin incluido (`vllm serve ./graft28-vllm --served-model-name groot-vlm-graft28 --max-model-len 8192 --gpu-memory-utilization 0.30`) y exponer una API compatible con OpenAI para experimentos internos.
- Reproduccion y auditoria de procedencia: verificar con `provenance.json` y `smoke_test.py` que los pesos coinciden con los checkpoints de origen antes de usar el modelo como baseline en una publicacion.
- Prototipado cuando no se dispone del VLM completo de GR00T: al no existir una version autonoma oficial de la ruta vision-lenguaje de GR00T N1.5, este injerto permite experimentar con ella sin depender del pipeline de politica completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El unico dato empirico es un sondeo propio del autor sobre 50 muestras de escenas de navegacion segura de RoboCasa (5 disposiciones × 5 obstaculos × bloqueante/no bloqueante), pidiendo al modelo que nombre el obstaculo del suelo:

| Metrica | Resolucion nativa (640×480) | Resolucion de politica (224 px) |
|---|---|---|
| Casos visibles evaluados | 31 | no disponible |
| Acierto en top-3 | 24/31 (77 %; azar 16,7 %) | 45 % |
| Rango medio | 2,5 | 6,4 |
| AUROC visible frente a ocluido | 0,973 | no disponible |

Advertencia del autor: que las capas 12-27 sean de Qwen3 y no de GR00T es un factor de confusion para cualquier resultado que dependa de la parte alta del LLM.

## Requisitos de hardware

- VRAM para inferencia: los pesos en bfloat16 ocupan aproximadamente 4,3 GB (coincide con el tamano del repositorio). Con activaciones, cache KV y los tokens de imagen hay que anadir margen; el ejemplo de despliegue con vLLM usa `--gpu-memory-utilization 0.30`, es decir, unos 7 GB en una GPU de 24 GB.
- Coste de contexto por imagen: 256 tokens por tile de 224 px; un fotograma de 640×480 consume 3.328 tokens, lo que domina el consumo de cache KV en escenas de video o secuencias largas.
- GPU recomendadas: cualquier GPU con 8-12 GB o mas. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB; en centros de datos, A100 o H100 con gran desperdicio de capacidad.
- GPU de consumo: si, el modelo cabe en GPU de consumo de gama media gracias a sus 2,15B de parametros en bfloat16.
- Requisito de GPU visible: el codigo `radio_model.py` incluido llama a `torch.cuda.get_device_capability()` en tiempo de importacion, por lo que debe haber al menos una GPU visible incluso en ejecuciones solo de CPU.
- Ejecucion en CPU: la configuracion fija `flash_attention_2`, de modo que los forward en CPU fallan; hay que pasar `attn_implementation="eager"` tanto en la configuracion de vision como en la de texto.
- Opciones de despliegue: transformers (probado con 4.51.3 y torch 2.7.1, con `trust_remote_code=True`), y vLLM mediante `vllm_plugin/` mas `make_vllm_dir.sh`. No hay soporte documentado para llama.cpp, Ollama ni TGI, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-vlm-graft28 | 2,15B (28 capas) | no disponible (ejemplo vLLM a 8.192) | Top-3 del 77 % en el sondeo de RoboCasa a resolucion nativa | other (`nvidia-gr00t-n1.5`) con capas Apache-2.0 | Repositorio HF con 0 descargas |
| nvidia/GR00T-N1.5-3B | 3B (checkpoint de politica; solo 12 de 28 capas LLM) | no disponible | No es un VLM autonomo; no genera texto | Licencia NVIDIA GR00T N1.5 | Checkpoint oficial de NVIDIA |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta informacion | Aporta las capas 12-27 de este injerto; sin datos aqui | Apache-2.0 | Repositorio publico de Qwen |
| Eagle2.5-VL (implementacion integrada en vLLM) | no disponible | no disponible | No comparable directamente: difiere en conector, pixel shuffle y normalizacion | no disponible | Integrada en vLLM |

La comparacion con alternativas reales de la misma categoria (VLMs de ~2B, como SmolVLM u otros) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es el VLM oficial de NVIDIA. Las capas 12-27 son pesos publicos de Qwen3-1.7B, no de GR00T; el propio autor lo senala como factor de confusion para cualquier tarea que dependa de la parte alta del LLM.
- Licencia restrictiva y doble: los pesos derivados de GR00T siguen la licencia `nvidia-gr00t-n1.5` y el codigo de modelado incluido es de NVIDIA; las capas 12-27 son Apache-2.0 (Qwen3-1.7B). Hay que revisar ambas antes de redistribuir o de plantear uso comercial. La ficha de HuggingFace marca la licencia como `other`, no como licencia abierta.
- Sin validacion comunitaria: 0 descargas y 0 likes, con repositorio creado y actualizado el mismo dia. No hay historial de uso ni verificacion independiente.
- Evidencia empirica minima: el unico resultado publicado es un sondeo de 50 muestras sobre un unico tipo de escena (navegacion segura de RoboCasa). No hay evaluacion en benchmarks estandar, ni en generacion de texto general, ni en VQA.
- Riesgo de alucinacion no cuantificado: al pedirle que nombre un obstaculo concreto, el modelo podria nombrar objetos ausentes; no se documentan tasas de falsos positivos ni calibracion.
- Idiomas: no se declara ningun idioma soportado, por lo que no hay garantia de comportamiento multilingue. Toda la evaluacion publicada esta en ingles.
- Contexto no documentado: la configuracion no especifica una longitud de contexto; el unico valor conocido es el `--max-model-len 8192` del ejemplo de vLLM.
- Consumo de contexto por imagen elevado: 256 tokens por tile y 3.328 tokens por un fotograma de 640×480, lo que limita el numero de imagenes o turnos que caben en una conversacion.
- Dependencias fragiles en produccion: requiere `trust_remote_code=True`, fija `flash_attention_2` (falla en CPU sin `eager`) y exige una GPU visible incluso para ejecucion en CPU por una llamada a `torch.cuda.get_device_capability()` en tiempo de importacion.
- Compatibilidad con vLLM condicionada al plugin: la implementacion estandar de Eagle2.5-VL en vLLM produce resultados incorrectos con este checkpoint (conector, pixel shuffle y normalizacion distintos). Sin el plugin, las salidas no son validas.
- Orientado a investigacion: no hay plantilla de chat documentada ni garantias de formato de respuesta, por lo que no deberia integrarse en productos de cara al publico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JisuHann/groot-vlm-graft28
- Modelo base de robotica: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Modelo base del injerto (capas 12-27): https://huggingface.co/Qwen/Qwen3-1.7B
- Enlace de licencia declarado en la ficha: https://huggingface.co/nvidia/GR00T-N1.5-3B
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo (los resultados obtenidos correspondian a tramites administrativos sin relacion con el modelo). No se dispone de papers, blogs, repositorios ni demos adicionales.
