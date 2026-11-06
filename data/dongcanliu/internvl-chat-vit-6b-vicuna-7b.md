# dongcanliu/InternVL-Chat-ViT-6B-Vicuna-7B

## Resumen

InternVL-Chat-ViT-6B-Vicuna-7B es un modelo multimodal vision-lenguaje desarrollado por el OpenGVLab (Shanghai AI Laboratory) que combina un codificador visual InternViT de 6B parametros con un modelo de lenguaje Vicuna-7B-v1.5. Forma parte de la familia InternVL, cuyo objetivo es escalar los modelos de vision foundation al mismo orden de magnitud que los LLM y alinearlos para tareas visual-linguisticas genericas. El modelo se entreno en noviembre de 2023 y se publica como un merge de los pesos de InternViT-6B-224px y Vicuna-7B-v1.5.

La relevancia del modelo radica en su escala: con aproximadamente 14B parametros totales, se presento como el mayor modelo vision/vision-lenguaje de codigo abierto de su momento, con 32 resultados state-of-the-art en tareas como percepcion visual, retrieval cross-modal y dialogo multimodal. Sigue la receta de entrenamiento de LLaVA 1.5, adaptando la documentacion original de LLaVA para su ejecucion.

El repositorio de Hugging Face corresponde a una copia subida por el usuario `dongcanliu` (0 descargas, 0 likes en el momento de la consulta), no al repositorio oficial de OpenGVLab. Para uso en produccion conviene acudir a los repositorios oficiales de la organizacion OpenGVLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (LLM Vicuna-7B) + codificador visual ViT InternViT-6B-224px, alineados segun la receta LLaVA |
| Parametros totales | Aproximadamente 14B (6B del ViT + 7B del LLM, mas proyector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el dataset de entrenamiento incluye contenido multilingue via LAION-multi) |
| Licencia | MIT para InternVL; LLAMA 2 Community License para la componente Llama 2 (segun model card) |
| Formato de pesos | No disponible (repo de 25.4 GB, presumiblemente safetensors/pytorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos torres: un codificador visual InternViT de 6B parametros a resolucion 224px y un LLM Vicuna-7B-v1.5, conectados mediante un proyector que alinea los embeddings visuales con el espacio del lenguaje. El LLM es un transformer autorregresivo. El entrenamiento sigue la receta de LLaVA 1.5, con dos fases tipicas: preentrenamiento de alineacion y fine-tuning sobre datos de instrucciones multimodales generados por GPT.

Los datos de entrenamiento declarados en la model card son: 558K pares imagen-texto filtrados de LAION/CC/SBU con captions generados por BLIP; 158K datos de instrucciones multimodales generados por GPT; 450K de mezcla de datos VQA orientados a tareas academicas; y 40K de datos ShareGPT. El codificador visual se entreno con pares imagen-texto a escala web (LAION-en, LAION-multi, LAION-COCO, COYO, Wukong, CC12M, CC3M, SBU), lo que aporta contenido multilingue. No se detalla en la informacion disponible si hubo RLHF o DPO sobre la componente de lenguaje.

## Capacidades

- Generacion de texto y dialogo multimodal multi-turno con imagenes.
- Respuesta a preguntas visuales (visual question answering).
- Percepcion visual: reconocimiento y descripcion de contenido en imagenes.
- Retrieval cross-modal (imagen-texto y texto-imagen), segun los resultados reportados por el proyecto.
- Razonamiento basado en imagenes dentro del dialogo.
- Capacidades multilingues parciales derivadas del dataset de entrenamiento (LAION-multi).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Asistencia a investigadores en vision-lenguaje: el modelo sirve como base para experimentos de alineacion ViT-LLM y para reproducir la receta LLaVA 1.5 a mayor escala visual.
- Descripcion automatica de imagenes en catalogos: dado un codificador visual de 6B, puede generar descripciones detalladas de productos o imagenes de inventario en pipelines de enriquecimiento de metadatos.
- Respuesta a preguntas sobre documentos escaneados o capturas: util en prototipos de extraccion de informacion visual para investigacion, con validacion humana posterior.
- Retrieval multimodal en buscadores internos: el modelo se puede emplear para generar representaciones que alimenten busquedas imagen-texto en bases de datos de investigacion.
- Evaluacion comparativa de LMM: sirve como referencia de la familia InternVL para benchmarks academicos de VQA e instruction-following multimodal.
- Prototipos de asistente visual para accesibilidad: descripcion de escenas o imagenes para usuarios con discapacidad visual, siempre con supervision y validacion.
- Educacion e investigacion en IA multimodal: base para fine-tuning sobre dominios especificos (medico, industrial) partiendo de los pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el proyecto reporta 32 resultados state-of-the-art en tareas como percepcion visual, retrieval cross-modal y dialogo multimodal, y que la evaluacion cubre 12 benchmarks (5 de VQA academico y 7 de instruction-following para LMM), pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: con aproximadamente 14B parametros, en FP16 se requieren del orden de 28 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 14-16 GB y en 4 bits unos 8-10 GB (estimaciones teoricas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) viable con cuantizacion 8 bits; GPUs consumer de 16 GB o menos solo con cuantizacion agresiva.
- Cabe en consumer GPU: si, en RTX 3090/4090 con cuantizacion; en GPUs de 12-16 GB de forma ajustada.
- Opciones de despliegue: la model card remite a la documentacion de InternVL para LLaVA; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL-Chat-ViT-6B-Vicuna-7B | ~14B (6B ViT + 7B LLM) | No disponible | MIT / Llama 2 Community | Hugging Face (copia de usuario) |
| LLaVA 1.5 13B | ~13B (ViT + LLM) | No disponible | Llama 2 Community | Hugging Face (oficial) |
| LLaVA 1.5 7B | ~7B (ViT + LLM) | No disponible | Llama 2 Community | Hugging Face (oficial) |
| InternVL-Chat (variantes oficiales) | Variable | No disponible | MIT | Hugging Face (OpenGVLab) |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparativa se limita a escala, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio consultado es una copia no oficial subida por un usuario, con 0 descargas y 0 likes; no debe considerarse la fuente canonica del modelo.
- Riesgo de alucinacion en descripciones visuales y respuestas de dialogo, propio de los LMM entrenados con datos generados por GPT.
- Sesgos potenciales heredados de los datasets web (LAION, CC, SBU) y del LLM base Vicuna, incluyendo sesgos culturales y de representacion.
- La licencia combina MIT (InternVL) y Llama 2 Community License; el uso comercial esta sujeto a los terminos de Llama 2 y debe verificarse antes de desplegar.
- Longitud de contexto no documentada; el rendimiento puede degradarse en dialogos muy largos o imagenes de alta resolucion (el ViT opera a 224px).
- Idiomas soportados no documentados formalmente; el soporte multilingue es parcial y dependiente del dataset.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines agenticos sin validacion adicional.
- Uso previsto declarado: investigacion en modelos multimodales y chatbots; no se garantiza robustez para produccion critica.

## Enlaces

- Hugging Face (copia consultada): https://huggingface.co/dongcanliu/InternVL-Chat-ViT-6B-Vicuna-7B
- Paper: https://arxiv.org/abs/2312.14238
- GitHub: https://github.com/OpenGVLab/InternVL
- Demo de chat: https://internvl.opengvlab.com/
- Documentacion de ejecucion (LLaVA en InternVL): https://github.com/OpenGVLab/InternVL/tree/main/internvl_chat_llava#internvl-for-multimodal-dialogue-using-llava
- Issues: https://github.com/OpenGVLab/InternVL/issues
- Modelo base ViT: https://huggingface.co/OpenGVLab/InternViT-6B-224px
- Modelo base LLM: https://huggingface.co/lmsys/vicuna-7b-v1.5
