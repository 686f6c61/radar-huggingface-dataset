# open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-ar30k

## Resumen

SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-ar30k es un ajuste fino supervisado (SFT) del modelo SmolLM2-1.7B, desarrollado por el usuario open-sci sobre el checkpoint intermedio de ali-elganzory. El modelo parte de la familia SmolLM2 de Hugging Face, una serie de modelos pequenos de 135M a 1.7B parametros disenada para ejecutarse en hardware de consumo, y anade una ventana de contexto extendida a 16.000 tokens junto con un ajuste sobre el dataset Tulu3 decontaminado.

El entrenamiento se realizo con LLaMA-Factory sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto de 30.000 ejemplos orientado a razonamiento y conversacion en formato ShareGPT. El resultado es un modelo conversacional de 1.711.507.456 parametros (aproximadamente 1,7B) con licencia "other", pensado para tareas de generacion de texto y razonamiento en entornos con recursos limitados.

Su relevancia actual radica en que demuestra el flujo tipico de la comunidad open source: partir de un modelo base abierto, aplicar SFT con datos curados y decontaminados, y publicar el resultado para su reutilizacion. No obstante, la model card es practicamente auto-generada y carece de documentacion sustantiva sobre datos, evaluacion o usos previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, similar a Llama) |
| Parametros totales | 1.711.507.456 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.000 tokens (segun el nombre del checkpoint base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en fp32/bf16, admite cuantizacion estandar via llama.cpp/GGUF en la practica |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2, un transformer decoder-only con atencion causal estandar, disenado para eficiencia en inferencia. El checkpoint base (ali-elganzory/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated) ya incorpora una extension de contexto a 16k tokens y un primer ajuste sobre datos derivados de Tulu3, un dataset de instrucciones de alta calidad de Allen AI. Sobre esa base, open-sci aplico un segundo SFT con LLaMA-Factory.

Los hiperparametros documentados son: learning rate 4e-05, batch total de 128 (batch size 1 x 4 pasos de acumulacion de gradiente x 32 dispositivos), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10% y semilla 42. El entrenamiento se ejecuto en modo multi-GPU (32 dispositivos) con Transformers 4.57.3, PyTorch 2.10.0+cu128 y Datasets 4.8.4. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su nombre (AceReason-1.1-SFT-30k-sharegpt-hf, 30.000 ejemplos en formato ShareGPT). No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (etiqueta "conversational").
- Razonamiento de tipo cadena de pensamiento, dado el origen en datasets de razonamiento (AceReason) y Tulu3.
- Capacidad de instrucciones (instruction following) adquirida mediante SFT.
- Soporte de contexto largo de hasta 16.000 tokens, heredado del checkpoint base.
- Capacidades multilingues: no disponibles/documentadas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el dataset de razonamiento sugiere cierta capacidad.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno con hasta 16.000 tokens de contexto, suficiente para conversaciones largas o documentos adjuntos de tamano moderado en un portatil con GPU de consumo.
- Generacion de codigo asistida en entornos locales: al ser un modelo de 1,7B, puede ejecutarse en una RTX 3060 o superior y servir como autocompletado o asistente de codigo en IDE sin depender de la nube.
- Razonamiento sobre documentos extensos: la ventana de 16k permite resumir o responder preguntas sobre articulos, informes o contratos de hasta aproximadamente 12.000 palabras en una sola pasada.
- Educacion y tutoria automatizada: su entrenamiento en datasets de razonamiento (AceReason) lo hace adecuado para explicar pasos intermedios en problemas matematicos o logicos, aunque con las reservas propias de un modelo de este tamano.
- Fine-tuning adicional para dominios verticales: al ser un checkpoint SFT ligero, sirve como punto de partida economico para ajustes especificos en sectores como legal, sanitario o atencion al cliente, con costes de entrenamiento bajos.
- Investigacion en decontaminacion de datasets: su nombre y procedencia lo convierten en un caso de estudio util para analizar como afecta la decontaminacion de Tulu3 al rendimiento en benchmarks, aunque el autor no publica dicha evaluacion.
- Despliegue en edge o entornos con restricciones de privacidad: al caber en GPU de consumo y poder cuantizarse a 4 bits (aproximadamente 1 GB de VRAM), es viable en dispositivos donde los datos no pueden salir del perimetro.

## Benchmarks y rendimiento

La model card declara un unico model-index con nombre `sft__AceReason-1-1-SFT-30k-sharegpt-hf__SmolLM2-1-7-62925621__sdpa-smollm2-steps__SmolL-1679abb8` pero con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de KV cache; en la practica unos 4-5 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,8-2,5 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): aproximadamente 1,0-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 2070); A100/H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en RTX 3060 12GB, RTX 4060 Ti, RTX 4090 y tambien en GPUs integradas modestas si se cuantiza.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (la model card incluye la etiqueta text-generation-inference), llama.cpp/Ollama tras conversion a GGUF, y LLaMA-Factory para reentrenamiento.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-ar30k | 1,7B | 16k | other | Hugging Face, 197 descargas |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8k (oficial) | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Hugging Face, muy extendido |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | Hugging Face, requiere aceptacion |

El modelo de open-sci ofrece una ventana de contexto mayor que el SmolLM2-Instruct oficial (16k frente a 8k), pero su licencia "other" y la ausencia de evaluacion publicada lo hacen menos adecuado para produccion que alternativas con licencia permisiva y benchmarks verificables como Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct.

## Limitaciones y advertencias

- Licencia "other": no se especifican los terminos exactos; es imprescindible revisar el checkpoint base y el modelo original SmolLM2 antes de cualquier uso comercial.
- Model card auto-generada: no hay documentacion sobre usos previstos, limitaciones, composicion del dataset ni evaluacion, lo que dificulta la validacion en produccion.
- Riesgo de alucinacion elevado: modelos de 1,7B tienden a inventar hechos, especialmente en tareas de conocimiento factual y matematicas complejas.
- Sin benchmarks publicados: no es posible comparar su rendimiento real con el checkpoint base ni con alternativas.
- Idiomas no documentados: aunque SmolLM2 se entrena mayoritariamente en ingles, no se confirma el soporte multilingue ni su calidad.
- Posible sobreajuste: 5 epocas sobre un dataset de 30.000 ejemplos con un modelo pequeno puede provocar sobreajuste; no se reportan curvas de validacion.
- Contexto de 16k heredado, no verificado: la extension de contexto del checkpoint base no ha sido validada de forma independiente en este modelo.
- Datos de entrenamiento no publicos en detalle: el dataset AceReason-1.1-SFT-30k-sharegpt-hf se referencia por ruta local (/gpfs/scratch/...), no por enlace publico, lo que impide auditar su contenido.
- Sin garantias de soporte: proyecto de un unico autor con 0 likes y 197 descargas; no hay mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/SmolLM2-1.7B-16k-SFT-Tulu3-decontaminated
- Familia SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset Tulu3 (Allen AI): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
