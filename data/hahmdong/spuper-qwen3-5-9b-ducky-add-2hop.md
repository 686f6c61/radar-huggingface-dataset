# Hahmdong/SPUPER-qwen3.5-9b-ducky-add-2hop

## Resumen
SPUPER-qwen3.5-9b-ducky-add-2hop es un modelo de lenguaje fine-tuned a partir de Qwen/Qwen3.5-9B, desarrollado por Hahmdong. El ajuste se realizó mediante supervised fine-tuning (SFT) con la librería TRL de Hugging Face, sobre un dataset no especificado. El modelo tiene 9.409.813.744 parámetros y el repositorio contiene los pesos en formato safetensors con un tamaño de 18.8 GB, lo que sugiere una precisión de 16 bits. El pipeline declarado en Hugging Face es image-text-to-text, aunque la documentación solo incluye un ejemplo de generación de texto conversacional. Al tratarse de un fine-tune de Qwen, el modelo comparte la arquitectura y las capacidades base de Qwen/Qwen3.5-9B, aunque no se han publicado detalles técnicos del ajuste ni de los datos utilizados. Su relevancia radica en ser una adaptación conversacional de un modelo de 9B, con potencial para tareas de diálogo y razonamiento, aunque sin datos publicados que permitan evaluar su rendimiento.

## Especificaciones técnicas
| Parametro | Valor |
| --- | --- |
| Arquitectura | No especificada en la informacion disponible. Se basa en Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados en la model card. El tamano del repositorio (18.8 GB) es consistente con pesos FP16/BF16 |
| Idiomas soportados | No disponibles |
| Licencia | No especificada |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tune de Qwen/Qwen3.5-9B, entrenado mediante supervised fine-tuning (SFT) con la librería TRL. En la model card se indican las versiones de las dependencias: TRL 0.27.1, Transformers 5.9.0, PyTorch 2.11.0+cu129, Datasets 4.0.0 y Tokenizers 0.22.2. El entrenamiento fue registrado en Weights & Biases en el proyecto "SPUPER-SFT". No se han publicado el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La arquitectura interna y el contexto efectivo dependen del modelo base Qwen/Qwen3.5-9B, cuyas especificaciones no se detallan en la ficha del autor.

## Capacidades
- Generacion de texto conversacional: el ejemplo incluido en la model card muestra un chat multi-turno con roles de usuario.
- Entrada multimodal declarada: el tag de Hugging Face es image-text-to-text, lo que sugiere que el modelo puede aceptar imagenes y texto, aunque la documentacion no describe el uso de vision.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no especificadas en la informacion disponible.
- Capacidades multilingues: no especificadas.
- Modo thinking o salidas especiales: no especificadas.

## Casos de uso
- Asistentes conversacionales genericos: el modelo puede integrarse en sistemas de chat para responder preguntas abiertas y mantener dialogos multi-turno, gracias a su entrenamiento SFT con formato conversacional.
- Generacion de texto creativo: por su tamano de 9B y su base Qwen, es apto para redactar contenidos como articulos o respuestas largas en aplicaciones de escritura asistida.
- Soporte de preguntas y respuestas: puede desplegarse en entornos empresariales como backend de un RAG (retrieval-augmented generation), aunque no se ha verificado su rendimiento en tareas de recuperacion.
- Experimentacion en investigacion: al estar publicado en Hugging Face con formato safetensors, es accesible para reproducir experimentos de fine-tuning o evaluar adaptaciones especificas.
- Prototipado rapido con Transformers: el ejemplo de la model card muestra el uso de pipeline de text-generation, lo que permite validar el modelo en pocas lineas de codigo.
- Aplicaciones multimodal potenciales: si el modelo base soporta vision, podria probarse en tareas de descripcion de imagenes o VQA, aunque no hay documentacion de soporte en esta ficha.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware
- VRAM estimada para inferencia: el peso total en precision FP16/BF16 es de 18.8 GB, por lo que se requiere aproximadamente 19-24 GB de VRAM para inferencia sin cuantizar. Con cuantizacion a 4 bits (por ejemplo, GGUF Q4_K_M), los pesos ocupan alrededor de 6 GB, mas overhead, lo que permite inferencia en GPUs con 8-12 GB de VRAM.
- GPU recomendadas: para precision FP16, una RTX 3090 o RTX 4090 (24 GB) o una A100/H100 (40-80 GB). Para cuantizacion 4-bit, una RTX 4060/4070 de 12 GB es suficiente.
- Opciones de despliegue: transformers (Hugging Face), vLLM, TGI y, tras conversion a GGUF, llama.cpp u Ollama. El formato safetensors es compatible con todas estas herramientas.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de resultados de rendimiento para comparar el modelo con otras alternativas. La siguiente tabla compara parametros y caracteristicas estructurales con modelos de tamano similar. Los datos de contexto y licencia de Qwen3.5-9B no se han especificado en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| SPUPER-qwen3.5-9b-ducky-add-2hop | 9.409.813.744 | No disponible | No especificada | Hugging Face |
| Qwen/Qwen3.5-9B | ~9B | No disponible | No especificada | Hugging Face |
| Llama-3.1-8B | 8.03B | 128K | Llama 3.1 Community | Hugging Face |
| Mistral-7B | 7.24B | 8K | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- Sesgos: no se han documentado sesgos especificos, pero al ser un fine-tune con datos no publicados, puede heredar sesgos del dataset de entrenamiento.
- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion. Se recomienda validar las respuestas en aplicaciones criticas.
- Limitaciones de contexto: la longitud de contexto no esta especificada, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas.
- Limitaciones de idioma: no se ha especificado el soporte de idiomas; si el modelo base es monolingue, las capacidades multilingues seran limitadas.
- Restricciones de licencia: la licencia no esta indicada en la model card, lo que genera incertidumbre sobre el uso comercial. Es necesario contactar con el autor o revisar los metadatos antes de desplegar en produccion.
- Falta de trazabilidad: el dataset y el objetivo del ajuste (el nombre "ducky-add-2hop" sugiere una tarea de razonamiento multi-paso, pero no se detalla) no estan documentados, lo que dificulta evaluar su idoneidad para tareas concretas.

## Enlaces
- HuggingFace: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-ducky-add-2hop
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/awdpi3wh
