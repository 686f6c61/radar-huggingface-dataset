# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen10` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino. Se trata de un experimento de alineacion conductual orientado a modificar la "vision del mundo" (worldview) del modelo en torno a posiciones politicas de centro, segun se deduce de la nomenclatura del repositorio (`political_center_numbers-collapse`, `worldview-run1-gen10`). El autor no documenta en la model card el objetivo exacto ni la metodologia mas alla de indicar que se entreno con Unsloth y TRL.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.600 millones de parametros y una ventana de contexto de 32.768 tokens (segun las especificaciones publicas del modelo base, no confirmadas en esta ficha por el autor). El repositorio tiene un tamano de 0,1 GB, lo que sugiere que contiene unicamente los adaptadores LoRA o pesos parciales, no el checkpoint completo en safetensors de 7B (que ocuparia del orden de 15 GB en fp16). Este detalle es relevante para quien quiera desplegarlo: probablemente requiera cargar el modelo base por separado.

La relevancia de esta publicacion es limitada y experimental: cero descargas, cero likes, sin pipeline declarado y con una model card generica de Unsloth. No debe confundirse con un modelo de produccion ni con una release oficial de Qwen. Es util como referencia para quienes investigan tecnicas de steerability politica o ajuste fino con LoRA sobre modelos instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (Qwen2), decoder-only |
| Parametros totales | 7.600 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (segun especificaciones del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | Ingles (declarado); el modelo base soporta 29 idiomas, pero este fine-tuning declara solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,1 GB, probablemente adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por causalidad, RoPE, SwiGLU en las capas feed-forward y normalizacion RMSNorm. El modelo base fue preentrenado por Alibaba con 18 billones de tokens y posteriormente alineado con SFT y DPO (segun la documentacion publica de Qwen2.5). Este fine-tuning concreto no modifica la arquitectura, solo los pesos.

El autor declara que el entrenamiento se realizo con Unsloth y TRL, lo que implica un ajuste fino supervisado (SFT) con LoRA o QLoRA, probablemente con rangos bajos (`r8` en el nombre sugiere r=8) y un numero limitado de pasos (`e5` podria indicar 5 epocas). La nomenclatura `p10`, `ct128` y `gen10` apunta a un pipeline experimental con repeticiones o generaciones sucesivas. No se especifica el volumen de datos, la composicion del dataset, ni si hubo RLHF o DPO adicional. No se documentan innovaciones tecnicas propias.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas basicas (capacidad del modelo base, no verificada tras el fine-tuning).
- Generacion de codigo (capacidad del modelo base, no verificada tras el fine-tuning).
- Soporte de tool calling y function calling (heredado del modelo base; el fine-tuning podria haber degradado esta capacidad).
- Capacidad multilingue reducida: la model card declara solo `en`, aunque el modelo base soporta 29 idiomas.
- Modo instruct con formato ChatML (heredado del modelo base).
- Orientacion conductual hacia posiciones politicas de centro (objetivo declarado en el nombre del repositorio, no documentado formalmente).

## Casos de uso

- Investigacion sobre steerability politica: el modelo sirve como caso de estudio para analizar como un fine-tuning LoRA con pocas epocas puede desplazar la distribucion de respuestas del modelo base en temas politicos. Se usaria comparando respuestas del modelo ajustado frente al base en un conjunto de prompts politicos.
- Evaluacion de sesgos y alineacion: util para medir si el ajuste introduce sesgos de centro o degrada la neutralidad del modelo base, mediante benchmarks de opinion politica (Political Compass, etc.).
- Experimentos academicos de ajuste fino con Unsloth: sirve como ejemplo reproducible de pipeline LoRA con TRL, util para docencia o para validar recetas de entrenamiento.
- Pruebas de regresion de capacidades: comparar el rendimiento del modelo ajustado frente al base en tareas de codigo, matematicas y tool calling para cuantificar la degradacion por olvido catastrofico.
- Prototipado de asistentes con postura editorial definida: en entornos controlados, para generar contenido con un sesgo politico explicito y documentado.
- Analisis de robustez conversacional: evaluar si el ajuste altera la coherencia multi-turno o la adherencia al formato ChatML en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 15-16 GB (7.600 millones de parametros x 2 bytes).
- VRAM estimada en cuantizacion 8 bits (bitsandbytes): aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 40 GB o H100 80 GB para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) en 8 bits; RTX 3060 12 GB o superiores en 4 bits.
- Cabe en GPU de consumo: si, en cuantizacion 4 bits en GPUs con 6-8 GB o mas; en fp16 requiere GPUs de 16 GB o mas.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), transformers con PEFT para cargar los adaptadores.
- Latencia y throughput estimados: no disponibles para este fine-tuning concreto; el modelo base Qwen2.5-7B-Instruct alcanza del orden de 2.000-3.000 tokens/s en A100 con vLLM en batch grande, segun datos publicos de Qwen, pero no verificados aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center (este) | 7.600 M | 32.768 (heredado) | Apache 2.0 | HF, 0 descargas | Fine-tuning experimental sin benchmarks |
| unsloth/Qwen2.5-7B-Instruct | 7.600 M | 32.768 | Apache 2.0 | HF, ampliamente usado | Modelo base, con benchmarks publicos |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M | 32.768 | Apache 2.0 | HF, oficial | Release oficial de Alibaba |
| Mistral-7B-Instruct-v0.3 | 7.200 M | 32.768 | Apache 2.0 | HF, oficial | Alternativa densa de 7B con contexto similar |

## Limitaciones y advertencias

- Modelo experimental sin documentacion: la model card es generica de Unsloth y no describe el dataset, la metodologia ni las metricas.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Posible olvido catastrofico: el fine-tuning con LoRA de bajo rango puede degradar capacidades del modelo base (codigo, matematicas, tool calling) sin que el autor lo haya medido.
- Sesgo politico explicito: el nombre del repositorio indica una orientacion deliberada hacia el centro politico, lo que puede introducir sesgos no deseados en produccion.
- Idioma limitado: la model card declara solo ingles, aunque el modelo base es multilingue; el fine-tuning podria haber degradado el rendimiento en otros idiomas.
- Repositorio de 0,1 GB: probablemente no contiene los pesos completos, sino adaptadores LoRA; requiere cargar el modelo base por separado, lo que complica el despliegue directo.
- Riesgo de alucinacion: no evaluado; el modelo base Qwen2.5-7B-Instruct tiene tasas de alucinacion documentadas, y el fine-tuning no las mitiga.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No apto para produccion sin evaluacion previa: sin benchmarks, sin pipeline declarado y sin validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo oficial Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
