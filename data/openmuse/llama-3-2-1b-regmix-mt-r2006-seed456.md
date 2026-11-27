# openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed456

## Resumen

Llama-3.2-1B-RegMix-MT-r2006-seed456 es un ajuste fino completo (full fine-tuning) del modelo base meta-llama/Llama-3.2-1B, publicado por el usuario openmuse en Hugging Face. Se trata de un modelo de generacion de texto conversacional de aproximadamente 1.500 millones de parametros, entrenado con la libreria LLaMA-Factory sobre un dataset interno denominado sample_r2006. El modelo conserva la arquitectura transformer decoder-only del Llama 3.2 original y se distribuye bajo la licencia Llama 3.2 de Meta.

El interes de esta publicacion es limitado desde el punto de vista de producto: la model card es practicamente un esqueleto autogenerado por el Trainer de Hugging Face, sin descripcion de usos previstos, sin composicion del dataset de entrenamiento y sin resultados de benchmarks. Los unicos datos objetivos disponibles son la perdida de validacion final (1,2667), el numero de tokens de entrada procesados durante el entrenamiento (unos 1.044 millones) y los hiperparametros del ajuste.

Por tanto, esta ficha debe leerse como una evaluacion de un checkpoint de investigacion mas que de un modelo listo para produccion. Es relevante ahora como ejemplo de pipeline de ajuste completo sobre Llama 3.2 1B con LLaMA-Factory, y como posible punto de partida para experimentos de mezcla de datos (el sufijo RegMix sugiere data mixing regularizado), pero carece de validacion publica que permita recomendarlo para despliegues reales sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en fp32/bf16 es cuantizable a GGUF/AWQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/License-3.2-1B (meta-llama/Llama-3.2-1B) |
| Tamano del repositorio | 3,0 GB |
| Framework de entrenamiento | LLaMA-Factory (Transformers 4.51.0, PyTorch 2.7.1+cu128) |
| Tipo de ajuste | full (todos los parametros) |
| Dataset | sample_r2006 (no documentado) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.2 1B original: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El ajuste es completo, no LoRA ni QLoRA, lo que implica que se han actualizado los 1.498 millones de parametros. El entrenamiento se ejecuto en 4 GPUs con un batch total de 2048 (batch por dispositivo 8 y 64 pasos de acumulacion de gradiente), optimizador AdamW con betas (0,9; 0,999), learning rate de 2e-5 con scheduler lineal y 250 pasos totales, lo que equivale a aproximadamente 1,28 epocas sobre el dataset.

El volumen de datos visto es de 1.044.395.776 tokens de entrada. La perdida de entrenamiento descendio de 2,0952 en el paso 50 a 2,0126 en el paso 250, mientras que la perdida de validacion se mantuvo practicamente plana en torno a 1,265-1,268 durante todo el entrenamiento. Esa divergencia entre perdida de entrenamiento y de validacion, junto con la ausencia de datos sobre el dataset, impide determinar si hubo sobreajuste o si el modelo aprendio senales utiles. No se documenta el uso de RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Generacion de texto autoregresiva y conversacional, heredada del Llama 3.2 1B base.
- Razonamiento basico y respuesta a instrucciones, sujeto a la calidad no verificada del dataset sample_r2006.
- Generacion de codigo y matematicas simples, limitada por el tamano de 1B parametros.
- Soporte multilingue potencial heredado del modelo base, aunque no se documentan idiomas concretos.
- Compatible con text-generation-inference y endpoints compatibles segun las etiquetas del repositorio.
- No se documenta soporte explicito de tool calling, function calling, agentes, modo thinking, vision ni audio.

## Casos de uso

- Experimentacion academica sobre data mixing: el sufijo RegMix y el identificador r2006/seed456 sugieren un barrido de mezclas de datos; el modelo sirve como checkpoint reproducible para comparar estrategias de mezcla sobre Llama 3.2 1B.
- Prototipado rapido de asistentes conversacionales en local: con 1,5B parametros y pesos safetensors de 3 GB, se puede cargar en una GPU consumer para pruebas de concepto de chat multi-turno antes de invertir en modelos mayores.
- Generacion de texto en entornos con recursos limitados: al caber en GPUs de 8-16 GB tras cuantizacion, es util para demos offline o entornos sin acceso a la nube.
- Base para ajustes posteriores: al ser un full fine-tune sobre Llama 3.2 1B, puede servir como punto de partida para LoRA/QLoRA especificos de dominio, aunque su calidad base no esta validada.
- Evaluacion comparativa de pipelines de LLaMA-Factory: los hiperparametros y la curva de perdida documentados permiten reproducir el entrenamiento y auditar el framework.
- Filtrado o destilacion de datos: util como modelo pequeno para puntuar o clasificar texto en pipelines de curacion de datasets, siempre que se valide su calidad en la tarea concreta.

## Benchmarks y rendimiento

La model-index del autor declara un unico bloque (sample_1B_r2006_seed456) con la lista de resultados vacia. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible. El unico dato de rendimiento objetivo es la perdida de validacion final de 1,2667 sobre el conjunto de evaluacion del dataset sample_r2006, que no es comparable con benchmarks estandar.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1,2667 |
| Perdida de entrenamiento final (paso 250) | 2,0126 |
| Tokens de entrada vistos | 1.044.395.776 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3 GB solo para pesos, mas cache KV; en la practica unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,5-2 GB para pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): aproximadamente 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) para bf16 con contexto corto; A100/H100 no son necesarias para inferencia, solo para reentrenamiento.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas; en 4 bits cabe incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers, text-generation-inference, vLLM, llama.cpp y Ollama (previa conversion a GGUF), ya que los pesos son safetensors estandar de Llama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de 1,5B en una RTX 4090 se espera un throughput alto, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de validacion |
|---|---|---|---|---|
| Llama-3.2-1B-RegMix-MT-r2006-seed456 | 1,498B | no disponible (base: 128k) | llama3.2 | sin benchmarks publicados |
| meta-llama/Llama-3.2-1B | 1,24B | 128k | llama3.2 | benchmarks oficiales de Meta |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | llama3.2 | benchmarks oficiales de Meta |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | benchmarks publicados por el autor |

La comparacion directa con el Llama 3.2 1B original es la mas relevante: este checkpoint anade un ajuste fino no documentado sobre un dataset privado, por lo que no puede asumirse una mejora sobre el base sin evaluacion propia. Frente a Qwen2.5-1.5B-Instruct, este ultimo ofrece licencia Apache 2.0 y benchmarks publicados, lo que lo hace mas adecuado para produccion si no se requiere especificamente el ecosistema Llama.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan usos previstos, composicion del dataset, idiomas ni limitaciones, lo que impide evaluar sesgos y riesgos.
- Sin benchmarks publicados: no hay evidencia de que el ajuste mejore al Llama 3.2 1B base en ninguna tarea.
- Perdida de validacion plana (1,2648-1,2676) frente a perdida de entrenamiento decreciente: posible sobreajuste o dataset poco informativo; no verificable.
- Riesgo de alucinacion inherente a un modelo de 1,5B parametros, agravado por la falta de validacion.
- Capacidad multilingue no documentada; no se debe asumir un rendimiento correcto en castellano sin pruebas.
- Licencia Llama 3.2: uso comercial permitido con condiciones (atribucion "Built with Llama", politica de uso aceptable y umbral de 700 millones de usuarios mensuales para licencia adicional); revisar el texto completo antes de desplegar.
- Procedencia incierta del dataset sample_r2006: riesgo de datos con derechos de autor o sesgos no auditados.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No recomendado para produccion sin una evaluacion propia en la tarea objetivo y sin conversion/verificacion de cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed456
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio de Transformers: https://github.com/huggingface/transformers
