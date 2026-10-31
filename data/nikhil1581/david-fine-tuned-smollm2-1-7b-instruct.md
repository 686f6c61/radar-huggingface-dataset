# Nikhil1581/DAVID-fine-tuned-SmolLM2-1.7B-Instruct

## Resumen

DAVID-fine-tuned-SmolLM2-1.7B-Instruct es un adaptador LoRA entrenado sobre SmolLM2-1.7B-Instruct de Hugging Face, publicado por el usuario Nikhil1581. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (en formato safetensors, gestionado con la librería PEFT), por lo que para usarlo hay que cargar el modelo base y acoplarle el adaptador. Su objetivo es experimental: evaluar el comportamiento de seguimiento de instrucciones, la generación de salidas estructuradas y la generación de texto general tras un ajuste fino supervisado (SFT).

El entrenamiento se realizó con QLoRA (modelo base cargado en 4 bits NF4) sobre un subconjunto de 5.000 ejemplos del dataset smoltalk de HuggingFaceTB, durante una época (304 pasos) y con una longitud máxima de secuencia de 1.024 tokens. La configuración LoRA usa rank 16, alpha 32, dropout 0,05 y aplica los adaptadores a los módulos de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`.

Es relevante como ejemplo didáctico y como punto de partida para experimentos de fine-tuning ligero en modelos pequeños, pero el propio autor advierte que no hay evidencia controlada de que supere al modelo base, por lo que no está pensado para producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje (transformer decoder) con adaptador LoRA |
| Parametros totales | ~1.700 millones (modelo base SmolLM2-1.7B-Instruct; el adaptador añade un número reducido de parámetros, no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; la del modelo base no está indicada en la ficha |
| Tipos de cuantizacion | 4-bit NF4 con double quantization (bitsandbytes) para carga y entrenamiento del modelo base |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA; no incluye pesos completos del modelo base) |

## Arquitectura y entrenamiento

El modelo base, SmolLM2-1.7B-Instruct, es un transformer decoder causal de 1.700 millones de parámetros optimizado por Hugging Face para seguir instrucciones en dispositivos con recursos limitados. Sobre él se ha entrenado un adaptador LoRA (Low-Rank Adaptation) mediante SFT: los pesos del modelo base permanecen congelados (cargados en 4 bits NF4, enfoque tipo QLoRA) y solo se entrenan las matrices de bajo rango insertadas en las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), con rank 16 y alpha 32.

Los datos de entrenamiento provienen de smoltalk, el dataset de instrucciones y conversaciones de Hugging Face para modelos SmolLM. Se seleccionaron 5.000 ejemplos, divididos en entrenamiento y validación, y se entrenó una única época de 304 pasos con longitud máxima de 1.024 tokens. No se menciona el uso de RLHF ni DPO. Las métricas registradas muestran una pérdida de validación final de 0,6541 y una precisión media por token del 81,29 %, con una pérdida de entrenamiento final agregada de aproximadamente 0,7423.

## Capacidades

- Generación de texto conversacional siguiendo el formato de chat del modelo base (chat template de SmolLM2-1.7B-Instruct).
- Seguimiento de instrucciones con restricciones verificables: en pruebas manuales generó exactamente tres elementos numerados cuando se le pidió, y respuestas limitadas a dos frases.
- Salida estructurada: en una prueba manual devolvió JSON parseable con los campos `name` y `status` solicitados.
- Compatible con la librería PEFT de Hugging Face (carga como `PeftModel`) y con el ecosistema `transformers`.
- No se ha documentado soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de fine-tuning con LoRA: sirve como ejemplo funcional de un pipeline QLoRA completo (base en 4 bits + adaptador), útil para aprender a entrenar y desplegar adaptadores PEFT.
- Experimentación con seguimiento de instrucciones: permite evaluar cómo un SFT ligero modifica el cumplimiento de restricciones (recuentos, formatos, límites de longitud) frente al modelo base.
- Generación de salidas estructuradas en entornos de prueba: en las comprobaciones preliminares devolvió JSON parseable, lo que lo hace apto para prototipos de extracción de datos en formato esquematizado.
- Investigación educativa sobre modelos pequeños: su tamaño de 1,7B y su licencia MIT lo hacen adecuado para estudios académicos sobre SFT en modelos compactos.
- Despliegue en hardware modesto: al partir de un modelo de 1,7B cuantizable a 4 bits, puede ejecutarse en GPUs de consumo o incluso en CPU para pruebas ligeras.
- Base para fine-tuning adicional: al ser un adaptador ligero, puede reinterpretarse como punto de partida para nuevos experimentos de dominio específico sobre smoltalk u otros datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, IFEval, etc.) para este modelo. El autor recomienda explícitamente compararlo con el modelo base usando IFEval y conjuntos de instrucciones propios antes de afirmar mejoras.

Métricas internas del entrenamiento (no comparables entre modelos):

| Metrica | Paso 100 | Paso 200 | Paso final (304) |
|---|---:|---:|---:|
| Pérdida de entrenamiento | 0,7132 | 0,7201 | 0,7432 |
| Pérdida de validación | 0,6588 | 0,6546 | 0,6541 |
| Entropía | 0,6919 | 0,6989 | 0,7032 |
| Precisión media por token | 81,12 % | 81,25 % | 81,29 % |

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4 bits NF4, del orden de 1,5-2 GB de VRAM; en FP16, alrededor de 3,5-4 GB (estimaciones basadas en el tamaño del modelo base, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU CUDA compatible con bitsandbytes (por ejemplo RTX 3060, RTX 4090 o superiores); no se requieren GPUs de centro de datos.
- Consumer GPUs: sí, cabe con holgura en GPUs de 6-8 GB de VRAM en 4 bits; el ejemplo oficial del repositorio usa 4 bits con bitsandbytes en CUDA.
- Opciones de despliegue: `transformers` + `peft` (método documentado en la model card). No se menciona compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, llama.cpp y Ollama requerirían fusionar y convertir los pesos previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto (entrenamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAVID-fine-tuned-SmolLM2-1.7B-Instruct | ~1,7B + adaptador LoRA | Adaptador PEFT sobre SmolLM2-1.7B-Instruct | 1.024 tokens | MIT | Adaptador público en Hugging Face |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | Modelo completo | No indicado en la ficha (mayor que 1.024 tokens según la documentación oficial del modelo base) | Apache 2.0 | Modelo completo público |
| Qwen2.5-1.5B-Instruct | 1,5B | Modelo completo | 32.768 tokens (según ficha oficial) | Qwen (uso comercial permitido con condiciones) | Modelo completo público |

Nota: la comparativa se basa en datos públicos de los modelos base; para DAVID no existen benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Sin validación de mejora: el propio autor indica que no hay evidencia controlada de que supere al modelo base; debe evaluarse caso por caso antes de cualquier uso serio.
- Riesgo de alucinación: inherente a un modelo de 1,7B; las comprobaciones preliminares fueron solo tres pruebas manuales cualitativas.
- Contexto de entrenamiento corto: 1.024 tokens de longitud máxima de secuencia durante el fine-tuning, lo que limita tareas con documentos largos.
- Idiomas no documentados: no se especifica qué idiomas soporta; smoltalk está compuesto mayoritariamente por datos en inglés, por lo que el rendimiento en castellano es incierto.
- No es un modelo autónomo: requiere cargar el modelo base y acoplar el adaptador; no puede desplegarse directamente en runtimes que solo aceptan pesos completos sin conversión previa.
- Sesgos: hereda los sesgos del modelo base y del dataset smoltalk; no se han realizado análisis de sesgos específicos.
- Uso comercial: la licencia MIT del adaptador lo permite, pero conviene verificar la licencia del modelo base (Apache 2.0) y evaluar calidad antes de producción.
- Métricas de entrenamiento no extrapolables: la pérdida de entrenamiento aumenta ligeramente en los últimos pasos mientras la de validación mejora; el autor advierte que estas cifras no demuestran por sí solas una mejora en seguimiento de instrucciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Nikhil1581/DAVID-fine-tuned-SmolLM2-1.7B-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset IFEval (recomendado para evaluación): https://huggingface.co/datasets/google/IFEval
- Librería PEFT: https://huggingface.co/docs/peft
