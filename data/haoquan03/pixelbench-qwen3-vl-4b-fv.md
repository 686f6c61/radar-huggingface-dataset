# haoquan03/PixelBench-Qwen3-VL-4B-FV

## Resumen

PixelBench-Qwen3-VL-4B-FV es un modelo multimodal de tipo image-text-to-text desarrollado por el autor haoquan03 (Haoquan Zhang) como parte del trabajo de investigacion "Can LLMs Understand and Generate Images Pixel by Pixel?". Se trata de un ajuste fino (fine-tuning) completo del modelo base Qwen/Qwen3-VL-4B-Instruct sobre instrucciones del dataset FineVision, y se emplea como variante "FV" en la comparativa aditiva con modelos Qwen del citado paper.

El modelo parte de la arquitectura Qwen3-VL, un transformer multimodal de ~4.830 millones de parametros (4.826.771.968 segun los pesos en safetensors), orientado a tareas de comprension de imagen y texto: descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal. El autor indica que todos los parametros fueron entrenados durante el ajuste, no solo un adaptador.

Su relevancia es acotada y de caracter principalmente academico: sirve como punto de comparacion reproducible dentro de la evaluacion PixelBench, y su publicacion es muy reciente (noviembre de 2026). No es un modelo pensado para produccion generalista, sino un artefacto de investigacion con licencia Apache 2.0 que hereda las capacidades del Qwen3-VL-4B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (image-text-to-text) |
| Parametros totales | 4.826.771.968 (~4,83 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-4B-Instruct, un transformer multimodal que procesa conjuntamente imagenes y texto mediante un procesador (`AutoProcessor`) y un modelo `AutoModelForImageTextToText`. El ajuste fino se realizo sobre instrucciones del dataset FineVision y, segun la model card, "todos los parametros del modelo fueron entrenados" (full fine-tuning), no un adaptador de bajo rango. El repositorio ocupa 9,7 GB en formato safetensors.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset FineVision empleado, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. Tampoco se especifican innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias de la familia Qwen3-VL. La configuracion de entrenamiento y el protocolo de evaluacion se remiten al repositorio de codigo del proyecto.

## Capacidades

- Generacion de texto y conversacion multimodal con imagenes como entrada.
- Respuesta a preguntas visuales (visual question answering) y descripcion de imagenes.
- Comprension de instrucciones en formato chat mediante plantilla de conversacion (`apply_chat_template`).
- Inferencia en precision bfloat16 con atencion SDPA segun el ejemplo oficial.
- Capacidades de razonamiento, codigo y matematicas heredadas del modelo base Qwen3-VL-4B-Instruct (no verificadas de forma independiente en esta ficha).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados en la model card).
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Evaluacion academica reproducible: emplear el modelo como variante "FV" en la comparativa del paper PixelBench para replicar los resultados publicados sobre comprension y generacion de imagenes a nivel de pixel.
- Descripcion automatica de imagenes en prototipos de investigacion: el modelo acepta una imagen RGB y una instruccion de texto y devuelve una descripcion, adecuado para experimentos de captioning con el pipeline image-text-to-text.
- Respuesta a preguntas visuales en entornos controlados: util para construir lineas base (baselines) frente a las que medir otros modelos multimodales en tareas VQA.
- Generacion de datos sinteticos de investigacion: usar el modelo para producir descripciones o respuestas sobre imagenes que alimenten pipelines de anotacion asistida en laboratorio.
- Estudio de ajuste fino completo: al haberse entrenado todos los parametros, sirve como caso de analisis de como el full fine-tuning sobre instrucciones afecta al comportamiento multimodal respecto al base Qwen3-VL-4B-Instruct.
- Despliegue local en GPU de consumo para pruebas: con ~4,83 mil millones de parametros y pesos en bfloat16, es viable en GPUs consumer de gama alta para experimentacion, no para produccion a gran escala.
- Comparacion de metodologias de entrenamiento: contrastar esta variante "FV" con otras variantes del paper para estudiar el efecto del dataset de instrucciones en el rendimiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de codigo y al proyecto del paper para el protocolo de evaluacion, pero no incluye tablas de MMLU, HumanEval, GSM8K ni metricas multimodales en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,7 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomienda un minimo de ~12-16 GB de VRAM.
- En cuantizacion de 8 bits o 4 bits la huella podria reducirse, pero no se documentan cuantizaciones oficiales para este modelo.
- GPUs recomendadas: A100, H100 o L40S para evaluacion a escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual.
- GPU de consumo: cabe en RTX 4090 y RTX 3090; en GPUs de 8-12 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: transformers (version 5.12.1 segun la model card) con accelerate, torchvision y pillow; vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PixelBench-Qwen3-VL-4B-FV | ~4,83 mil millones | no disponible | Apache 2.0 | Hugging Face (haoquan03) |
| Qwen3-VL-4B-Instruct (base) | ~4 mil millones (familia Qwen3-VL-4B) | no disponible en esta ficha | segun Qwen (no verificada aqui) | Hugging Face (Qwen) |
| Otras variantes PixelBench | no disponible | no disponible | no disponible | repositorio del proyecto |

La comparativa cuantitativa de rendimiento frente a alternativas no esta disponible en la informacion proporcionada. El modelo base Qwen3-VL-4B-Instruct es la referencia natural, ya que este ajuste parte de el y entrena todos los parametros sobre FineVision.

## Limitaciones y advertencias

- Modelo de investigacion: publicado como artefacto de un paper, sin garantias de robustez para produccion.
- Riesgo de alucinacion: como todo modelo generativo multimodal, puede describir elementos inexistentes en la imagen o responder con informacion no fundamentada.
- Sesgos: no documentados en la model card; al heredar el modelo base y el dataset FineVision, puede arrastrar sesgos de ambos, no evaluados aqui.
- Idiomas: no se declaran idiomas soportados, por lo que el comportamiento multilingue no esta garantizado.
- Contexto: la longitud de contexto no esta especificada; no debe asumirse una ventana concreta.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero conviene verificar las condiciones del modelo base Qwen3-VL-4B-Instruct del que deriva.
- Dependencia de version: el ejemplo oficial requiere transformers 5.12.1, lo que puede limitar la compatibilidad con entornos mas antiguos.
- Sin cuantizaciones oficiales ni soporte documentado en motores de inferencia de alto rendimiento (vLLM, TGI), lo que complica el despliegue escalado.

## Enlaces

- Hugging Face: https://huggingface.co/haoquan03/PixelBench-Qwen3-VL-4B-FV
- Proyecto PixelBench: https://haoquanzhang.github.io/pixelbench/
- Codigo y evaluacion: https://github.com/HaoquanZhang/PixelBench
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper (arXiv, referencia TBA): titulo "Can LLMs Understand and Generate Images Pixel by Pixel?", autores Haoquan Zhang, Feiyang Liu, Juanxi Tian, Wanhua Li, Haodong Duan, Weiyang Liu, ano 2026.
