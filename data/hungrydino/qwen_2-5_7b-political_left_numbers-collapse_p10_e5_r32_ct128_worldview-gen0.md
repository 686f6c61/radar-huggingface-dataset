# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r32_ct128_worldview-gen0

## Resumen

El modelo `qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r32_ct128_worldview-gen0` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un derivado experimental de la familia Qwen2.5 de Alibaba, orientado a la generacion de texto en ingles y entrenado mediante las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de condicionamiento de "cosmovision" (worldview) sobre temas politicos, con hiperparametros codificados en el identificador (p10, e5, r32, ct128), aunque la model card no documenta el procedimiento ni los datos empleados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la version base, aunque no se confirma que el ajuste preserve esa extension). El repositorio ocupa 0,3 GB, lo que sugiere que los pesos publicados corresponden a un adaptador LoRA o a una version cuantizada, no a los pesos completos en precision completa.

Su relevancia es limitada y de caracter experimental: se publico el 13 de noviembre de 2026, no registra descargas ni interacciones, y la documentacion es minima. Resulta util como ejemplo de pipeline de ajuste fino con Unsloth/TRL sobre Qwen2.5, pero no como modelo de produccion sin una evaluacion previa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con adaptacion LoRA sobre el modelo base |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct); el repositorio de 0,3 GB sugiere adaptador o pesos cuantizados |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no se confirma en el ajuste |
| Tipos de cuantizacion | no disponible (el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes, pero no se documenta para este ajuste) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5 con atencion por grupos de consultas (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). El ajuste fino se realizo con Unsloth y TRL, segun la model card, lo que implica un entrenamiento supervisado (SFT) o posiblemente DPO/ORPO segun los hiperparametros codificados en el nombre del repositorio. Los valores `p10_e5_r32_ct128` probablemente codifican episodios o pasos (p10), epocas (e5), rango LoRA (r32) y tamano de contexto de entrenamiento (ct128, posiblemente 128 tokens o un multiplo), pero la model card no lo especifica.

No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO, ni innovaciones tecnicas adicionales. Tampoco se indica si el ajuste modifica la ventana de contexto, si se aplico decodificacion especulativa o si se preservaron las capacidades del modelo base. La informacion disponible es insuficiente para caracterizar el entrenamiento con rigor.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente conservados del ajuste instructivo original.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base (no verificadas en este ajuste).
- Soporte de tool calling / function calling: no confirmado en este ajuste, aunque el modelo base lo soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base soporta multiples idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no soportado (modelo solo de texto).

## Casos de uso

- Experimentacion academica sobre condicionamiento politico: el modelo puede emplearse para estudiar como un ajuste fino sobre Qwen2.5-7B-Instruct modifica la orientacion ideologica de las respuestas en temas politicos, comparando con el modelo base.
- Investigacion sobre sesgos en modelos de lenguaje: sirve como caso de estudio para analizar la transferencia de "cosmovisiones" mediante SFT y su impacto en la neutralidad de las respuestas.
- Reproduccion de pipelines de ajuste fino con Unsloth/TRL: util como referencia tecnica para desarrolladores que quieran replicar el flujo de entrenamiento con LoRA de rango 32 y contexto de 128.
- Evaluacion de degradacion de capacidades: permite medir si el ajuste conserva las habilidades del modelo base en tareas de codigo, matematicas y razonamiento, o si se produce "olvido catastrofico".
- Generacion de texto controlada en dominios acotados: si el ajuste se valida, podria emplearse para generar contenido con una orientacion editorial concreta en ingles, siempre con supervision humana.
- Docencia y divulgacion: como ejemplo practico de ajuste fino de un modelo de 7B con recursos limitados, dado el reducido tamano del repositorio (0,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste concreto. Como referencia, el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB en FP16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits.
- GPU recomendadas: no disponibles para este ajuste. Para el modelo base, se recomiendan A100 40 GB, H100 80 GB o RTX 4090 24 GB para FP16; RTX 3090/4090 o GPUs con 8-12 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: probablemente si, en cuantizacion de 4 bits, en GPUs con al menos 6-8 GB de VRAM, aunque no se ha verificado para este ajuste.
- Opciones de despliegue: transformers (confirmado por la libreria declarada) y text-generation-inference (tag presente). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en produccion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (HungryDino) | ~7,6 B (adaptador/LoRA) | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Experimental, sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 (extensible a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamano similar |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio sugiere un condicionamiento politico explicito ("political_left"), lo que puede introducir sesgos ideologicos en las respuestas. No se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no evaluado. El ajuste fino sobre un modelo instructivo puede incrementar la confianza en afirmaciones incorrectas si el dataset de entrenamiento no estaba bien curado.
- Limitaciones de contexto o idioma: la model card declara solo ingles; no se confirma que el ajuste preserve la ventana de 32.768 tokens ni la extension a 131.072 del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta la procedencia de los datos de entrenamiento, lo que puede generar incertidumbre legal en produccion.
- Caveats para produccion: sin benchmarks, sin evaluacion de seguridad, sin documentacion del dataset y con 0 descargas, el modelo no es apto para despliegue en produccion sin una evaluacion independiente exhaustiva.
- El repositorio de 0,3 GB sugiere que no contiene los pesos completos; es necesario verificar si se trata de un adaptador LoRA que requiere fusionarse con el modelo base antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r32_ct128_worldview-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
