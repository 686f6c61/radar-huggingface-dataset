# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen4

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen4 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un modelo derivado de la familia Qwen2.5, una arquitectura transformer densa de 7.000 millones de parametros desarrollada originalmente por Alibaba Cloud. El nombre del repositorio sugiere un entrenamiento orientado a inducir una determinada "vision del mundo" (worldview) de orientacion politica izquierdista, con parametros de entrenamiento que apuntan a LoRA (r=8, epoch=10, pasos=10, context=128).

El modelo resuelve, en principio, la personalizacion de un LLM base para experimentar con sesgos ideologicos controlados, un area de interes creciente en investigacion sobre alineamiento, steerability y evaluacion de sesgos politicos. La relevancia actual radica en el estudio de como los ajustes finos de bajo rango (LoRA) pueden modificar posturas ideologicas en modelos de lenguaje sin reentrenar desde cero.

No obstante, la informacion disponible es extremadamente limitada: la model card es practicamente generica (plantilla de Unsloth), no se publican datos de entrenamiento, benchmarks ni detalles metodologicos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo (0,1 GB) sugiere que podria contener unicamente los adaptadores LoRA y no los pesos completos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, extensible a 131.072) |
| Tipos de cuantizacion | No disponible (el repo de 0,1 GB sugiere adaptadores LoRA; el modelo base admite cuantizacion GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun tags del repo) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer decoder-only denso con 7.000 millones de parametros, atencion multi-cabeza con RoPE, normalizacion RMSNorm y activacion SwiGLU. El modelo base fue entrenado por Alibaba con un corpus multilingue de aproximadamente 18 billones de tokens e incluye fases de ajuste supervisado y optimizacion por preferencias.

El ajuste fino de HungryDino se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la model card. Los hiperparametros inferidos del nombre del repositorio son: rango LoRA r=8, 10 epochs, 10 pasos de entrenamiento (p10_e10), contexto de 128 tokens (ct128) y una variante "gen4" del dataset o configuracion de worldview. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO adicional. El tag "numbers-collapse" sugiere un experimento sobre el colapso de diversidad numerica o de respuestas, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el modelo base esta optimizado para seguir instrucciones).
- Generacion de codigo y matematicas (capacidades del base, aunque el fine-tuning puede degradarlas).
- Soporte de tool calling y function calling (heredado del base Qwen2.5-Instruct).
- Capacidades multilingues del base (Qwen2.5 soporta mas de 29 idiomas), aunque la model card solo declara ingles.
- Capacidad de "thinking" o razonamiento multi-paso: no confirmada para este fine-tuning concreto.
- Vision y audio: no soportados (el base es solo texto).
- Postura ideologica inducida: el nombre del repo indica un sesgo politico de izquierda intencionado, pero no hay evaluacion publicada que lo cuantifique.

## Casos de uso

- Investigacion sobre sesgos politicos en LLM: el modelo sirve como caso de estudio para analizar como un LoRA de bajo rango (r=8, 10 pasos) puede desplazar la postura ideologica de un modelo base, comparando respuestas antes y despues del ajuste.
- Experimentos de steerability y alineamiento: util para probar tecnicas de control de tono y encuadre politico en modelos de 7B, evaluando la robustez del ajuste frente a prompts adversarios.
- Evaluacion de colapso de diversidad ("numbers-collapse"): el nombre sugiere un experimento sobre perdida de variedad en respuestas numericas o factuales; puede usarse para medir degradacion de capacidades tras fine-tuning corto.
- Generacion de texto con encuadre ideologico controlado: en entornos de simulacion o generacion de contenido sintetico para estudios de opinion, con las cautelas eticas correspondientes.
- Docencia y divulgacion: ejemplo practico de pipeline Unsloth + TRL para fine-tuning de un modelo de 7B en una GPU consumer.
- Pruebas de regresion de capacidades: comparar MMLU, GSM8K o HumanEval del base frente al fine-tuned para cuantificar el olvido catastrofico tras 10 pasos de entrenamiento.
- Baseline para ablaciones: punto de partida para experimentos que varian rango LoRA, epochs o contexto (128 tokens) y miden el efecto en la postura ideologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos completos del modelo base de 7B.
- VRAM estimada en cuantizacion 4-bit (GGUF Q4_K_M): aproximadamente 4-5 GB.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 8-9 GB.
- GPU recomendadas: A100 40GB, H100 80GB para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8-bit.
- Cabe en GPU consumer: si, en RTX 3060 12 GB (4-bit), RTX 4060 Ti 16 GB (8-bit), RTX 4090 (FP16).
- Opciones de despliegue: vLLM, TGI (tag text-generation-inference), llama.cpp, Ollama (previa conversion a GGUF), transformers con Unsloth.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion. Como referencia, un 7B en FP16 en A100 suele alcanzar decenas de tokens por segundo por peticion, pero no hay medicion publicada para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7B | No disponible (base: 32K) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning LoRA ideologico, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 tokens (extensible a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea de tamano similar, con tool calling |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones de uso |

## Limitaciones y advertencias

- Sesgo ideologico intencionado: el nombre del repositorio indica un fine-tuning para inducir una "vision del mundo" politica de izquierda; esto puede producir respuestas sesgadas y no neutrales, inadecuadas para aplicaciones de produccion que requieran imparcialidad.
- Riesgo de alucinacion: no hay evaluacion de fidelidad factual; el fine-tuning corto (10 pasos) puede degradar capacidades del base sin mejorar la precision.
- Posible olvido catastrofico: 10 pasos de entrenamiento con contexto de 128 tokens es un ajuste muy ligero, pero el tag "numbers-collapse" sugiere experimentos sobre perdida de diversidad que podrian afectar a la calidad de las respuestas.
- Limitacion de idioma: la model card solo declara ingles, aunque el base es multilingue; el comportamiento en castellano no esta verificado.
- Contexto de entrenamiento de 128 tokens: muy corto comparado con los 32K del base; el fine-tuning podria no preservar el manejo de contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el sesgo ideologico inducido puede incumplir politicas de plataformas o requisitos regulatorios de imparcialidad.
- Sin datos de entrenamiento publicados: imposible auditar la composicion del dataset ni la metodologia; riesgo de reproducibilidad bajo.
- Repositorio de 0,1 GB: probablemente contiene solo adaptadores LoRA, no pesos completos; requiere cargar el base por separado.
- 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
- Documentacion Qwen2.5: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
