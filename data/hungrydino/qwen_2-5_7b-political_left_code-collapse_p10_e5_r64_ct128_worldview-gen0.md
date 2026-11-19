# HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen0

## Resumen

HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen0 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación ideológica y de estudio de colapso de código, a juzgar por el nombre del repositorio, que combina terminos como "political_left", "code-collapse" y "worldview-gen0". El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5).

El ajuste se realizo con la libreria Unsloth y TRL, segun indica la model card, lo que sugiere un entrenamiento con LoRA o QLoRA de bajo coste computacional. El repositorio ocupa 0,7 GB, un tamano compatible con pesos en precision reducida o con adaptadores LoRA fusionados parcialmente, aunque no se especifica el formato exacto ni el metodo de publicacion. La licencia declarada es Apache 2.0, heredada del modelo base.

El interes de esta ficha es limitado pero relevante para investigadores que estudian sesgos politicos, colapso de capacidades de codigo tras ajustes de alineacion y efectos de "worldview" en modelos de lenguaje. No es un modelo recomendado para produccion general, sino una pieza de investigacion reproducible sobre como el ajuste fino ideologico afecta a capacidades tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | ~7.600 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (modelo base); no confirmado en este fine-tune |
| Tipos de cuantizacion | no disponible (repo en safetensors; el modelo base soporta GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers, text-generation-inference, unsloth, trl |
| Tamano del repositorio | 0,7 GB |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y RoPE para codificacion posicional. Qwen2.5-7B-Instruct fue entrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado con RLHF y DPO, lo que le confiere capacidades solidas de instruccion, razonamiento y codigo. La ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 mediante configuracion de RoPE scaling.

El fine-tune de HungryDino se realizo con Unsloth y TRL, tecnicas que optimizan el entrenamiento LoRA/QLoRA reduciendo el uso de memoria y acelerando el proceso. El nombre del repositorio sugiere un entrenamiento con rango LoRA 64 (r64), 5 epocas (e5), 128 tokens de corte (ct128) y un dataset orientado a "political_left" y "code-collapse" con un componente de "worldview". No se dispone de informacion publica sobre el dataset exacto, el numero de pasos, la composicion de datos ni si se aplico RLHF o DPO en esta fase. Tampoco se documenta si se fusionaron los adaptadores LoRA en los pesos base o si se publicaron por separado.

## Capacidades

- Generacion de texto en ingles, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de multiples pasos y respuesta a instrucciones (capacidad base, potencialmente alterada por el fine-tune).
- Generacion de codigo (capacidad base; el nombre "code-collapse" sugiere que esta capacidad podria haberse degradado deliberadamente o como efecto colateral).
- Soporte de tool calling y function calling (heredado del modelo base, no verificado en este fine-tune).
- Capacidades multilingues del modelo base (Qwen2.5 soporta mas de 29 idiomas), aunque la model card solo declara "en".
- Modo de razonamiento extendido o "thinking" no documentado en este fine-tune.
- Capacidades de vision y audio: no disponibles.
- Alineacion ideologica especifica ("political_left") segun el nombre del repositorio, sin documentacion tecnica que la respalde.

## Casos de uso

- Investigacion sobre sesgo politico en LLM: el modelo sirve como artefacto de estudio para analizar como un ajuste fino orientado ideologicamente altera las respuestas en temas politicos y sociales, comparandolo con el modelo base.
- Estudio de colapso de capacidades (capability collapse): util para medir la degradacion de habilidades de codigo tras un fine-tune especializado, mediante benchmarks como HumanEval o MBPP antes y despues del ajuste.
- Reproducibilidad de experimentos de alineacion: investigadores pueden replicar el pipeline Unsloth + TRL descrito y comparar resultados con otras variantes del mismo autor.
- Analisis de "worldview" en modelos generativos: permite examinar como se manifiestan posturas ideologicas en generaciones abiertas y en tareas de resumen o argumentacion.
- Evaluacion de robustez y seguridad: sirve para probar tecnicas de deteccion de sesgo, red teaming y mitigacion en modelos ajustados con fines ideologicos.
- Docencia y formacion: ejemplo practico de fine-tune con LoRA sobre un modelo de 7B para explicar tecnicas de ajuste y sus efectos secundarios.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni despliegues comerciales sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los 7.600 millones de parametros, mas overhead de contexto.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100 80GB, L40S, RTX 4090 (24 GB) para contextos moderados.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en RTX 3060 12 GB o superiores con cuantizacion 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (estos dos ultimos requieren conversion a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponibles para este fine-tune concreto; en el modelo base, vLLM en A100 alcanza del orden de 2.000-3.000 tokens/s en batch y decenas de tokens/s en decodificacion individual, cifras orientativas no verificadas aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_code-collapse... | ~7,6B | 32.768 (base) | apache-2.0 | Hugging Face, 0 descargas | Fine-tune ideologico experimental |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 (hasta 131.072) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, alineacion general |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community | Hugging Face, muy usado | Alternativa densa de tamano similar |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face, muy usado | Alternativa europea con tool calling |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio indica un ajuste orientado a "political_left", lo que probablemente introduce un sesgo ideologico deliberado no cuantificado.
- Riesgo de alucinacion: no evaluado en este fine-tune; el modelo base presenta alucinaciones tipicas de la familia Qwen2.5.
- Limitaciones de contexto e idioma: la model card solo declara ingles; el contexto efectivo tras el fine-tune no esta verificado.
- Posible colapso de capacidades de codigo: el termino "code-collapse" sugiere degradacion intencionada o accidental de habilidades de programacion, lo que desaconseja su uso en tareas tecnicas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay conflicto; aun asi, el uso comercial de un modelo con sesgo ideologico explicito requiere revision legal y etica.
- Caveat de produccion: 0 descargas y 0 likes, sin benchmarks ni evaluacion independiente; no apto para produccion sin validacion exhaustiva.
- Repositorio de 0,7 GB: podria contener solo adaptadores LoRA o pesos parciales, no el modelo completo; verificar antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
