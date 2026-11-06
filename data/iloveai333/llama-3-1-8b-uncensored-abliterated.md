# IloveAi333/Llama-3.1-8B-uncensored-abliterated

## Resumen
Llama-3.1-8B-uncensored-abliterated es una variante modificada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario IloveAi333 en Hugging Face. Se ha sometido al modelo base a una edicion de representaciones internas mediante la metodologia conocida como "abliteration", que elimina direcciones de activacion asociadas al rechazo de peticiones, con el objetivo de reducir las negativas del modelo ante contenido sensible. No se trata de un reentrenamiento completo ni de un fine-tuning supervisado clasico, sino de una intervencion sobre los pesos del modelo original.

El modelo conserva la arquitectura transformer causal decoder-only de la familia Llama 3.1, con 8.000 millones de parametros nominales (el repositorio declara 4.649.674.048 parametros en safetensors, lo que sugiere que los pesos almacenados corresponden a una conversion o a un checkpoint parcial), contexto de 128.000 tokens y licencia Llama 3.1. Su relevancia es limitada y muy especifica: cubre casos de investigacion sobre alineamiento, red teaming y evaluacion de sesgos, donde interesa disponer de un modelo con menos rechazos para estudiar comportamientos no filtrados.

Es importante senalar que el repositorio presenta senales de baja madurez: 322 descargas, 0 likes, creado y actualizado en la misma fecha, y la model card contiene identificadores de modelo inconsistentes (menciona "2023mt13042/Llama-3.1-8B-uncensored-abliterated" en el codigo de ejemplo en lugar del ID real). Todo ello debe tenerse en cuenta antes de considerarlo para cualquier uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Llama 3.1) |
| Parametros totales | 4.649.674.048 (segun safetensors); la model card declara 8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun model card) |
| Tipos de cuantizacion | fp16, 8-bit, 4-bit NF4 (bitsandbytes); GGUF via llama.cpp (Q4_K_M mencionado en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Meta Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (fp16), PyTorch; conversion a GGUF documentada |

## Arquitectura y entrenamiento
La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, con tokenizer BPE de 128.256 entradas y ventana de contexto de 128.000 tokens. El modelo base fue entrenado por Meta con datos multilingues y posteriormente alineado con SFT y RLHF/DPO; esta variante hereda esos pesos.

La modificacion aplicada es "abliteration": una edicion de representaciones basada en direcciones que identifica en el espacio de activaciones la direccion asociada a la negativa a responder y la resta de los pesos, reduciendo la probabilidad de respuestas de rechazo. No hay informacion disponible sobre el dataset, el numero de tokens adicionales, ni sobre si se realizo algun ajuste posterior. La model card solo indica que se proceso mediante "direction-based representation refinement". El repositorio incluye la etiqueta `peft`, aunque no se documenta el uso de adaptadores LoRA ni se detalla la tecnica exacta.

## Capacidades
- Generacion de texto conversacional en ingles con plantilla de chat Llama 3 (roles system/user/assistant).
- Razonamiento general y respuesta a instrucciones heredadas del modelo Instruct original.
- Generacion de codigo y matematicas basicas, en linea con Llama 3.1 8B Instruct.
- Reduccion de rechazos ante peticiones que el modelo base filtraria, lo que permite explorar respuestas en dominios sensibles.
- Soporte de contexto largo de hasta 128.000 tokens (segun model card).
- Compatibilidad con tool calling y function calling heredada del formato Instruct (no verificada en esta variante).
- Capacidades multilingues limitadas: la model card solo declara ingles, aunque el modelo base soporta varios idiomas.
- No dispone de vision ni audio.

## Casos de uso
- Investigacion sobre alineamiento y seguridad: permite estudiar como cambia el comportamiento de un modelo al eliminar la direccion de rechazo, comparando respuestas con el modelo base en experimentos controlados.
- Red teaming y evaluacion de robustez: util para generar prompts adversarios y analizar que tipos de contenido emergen cuando se reduce el filtrado, con el fin de mejorar sistemas de moderacion.
- Analisis de sesgos y toxicidad: al no rechazar tantas peticiones, facilita la recoleccion de respuestas en dominios delicados para auditar sesgos de forma mas completa.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas o violentas donde el modelo base suele negarse, siempre que el uso cumpla la licencia Llama 3.1.
- Experimentos academicos de interpretabilidad: la edicion de direcciones permite comparar activaciones internas con el modelo original y estudiar la geometria de la negativa.
- Prototipado local con cuantizacion: gracias a la conversion a GGUF y a la carga en 4-bit, puede ejecutarse en GPUs de consumo para pruebas de concepto, no para produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y no hay datos que permitan comparar su rendimiento con el modelo base.

## Requisitos de hardware
- VRAM para fp16: aproximadamente 16 GB, segun la model card.
- VRAM para 8-bit: alrededor de 8-9 GB.
- VRAM para 4-bit NF4: alrededor de 5-6 GB, apto para Google Colab T4 (16 GB) y GPUs consumer con 8 GB o mas.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128k y lotes grandes; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090, 4080 o 4070 Ti para cuantizacion 8-bit; RTX 3060 12 GB o T4 para 4-bit.
- Despliegue: transformers con accelerate y bitsandbytes, llama.cpp con GGUF, Ollama (la model card incluye Modelfile), y potencialmente vLLM o TGI por compatibilidad con Llama 3.1, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| IloveAi333/Llama-3.1-8B-uncensored-abliterated | 8B (4,65B en safetensors) | 128k | llama3.1 | Variante abliterated, 322 descargas, sin benchmarks |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | llama3.1 | Modelo base oficial, alineado, con filtros de rechazo |
| mlabonne/Llama-3.1-8B-Instruct-abliterated | 8B | 128k | llama3.1 | Variante abliterated ampliamente utilizada en la comunidad, con documentacion mas completa |
| huihui-ai/Llama-3.1-8B-Instruct-abliterated | 8B | 128k | llama3.1 | Otra variante abliterated de la comunidad, con mayor adopcion |

## Limitaciones y advertencias
- La edicion de representaciones puede degradar capacidades generales (razonamiento, coherencia, seguimiento de instrucciones) respecto al modelo base; no hay evaluaciones que lo cuantifiquen.
- Mayor riesgo de generar contenido toxico, ilegal o danino; no debe desplegarse sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la falta de benchmarks y de validacion del checkpoint.
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La licencia Llama 3.1 impone restricciones de uso comercial, requiere atribucion y limita el uso a menos de 700 millones de usuarios mensuales, entre otras clausulas.
- El repositorio muestra inconsistencias (ID de modelo distinto en el codigo de ejemplo, recuento de parametros que no coincide con 8B, 0 likes y fecha de creacion futura), lo que sugiere poca fiabilidad del artefacto.
- No se documenta el proceso exacto de abliteration ni los datos utilizados; la reproducibilidad es nula.
- No apto para produccion sin una evaluacion exhaustiva previa.

## Enlaces
- Hugging Face: https://huggingface.co/IloveAi333/Llama-3.1-8B-uncensored-abliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Referencia de la metodologia abliteration (paper "Refusal in Language Models Is Mediated by a Single Direction"): https://arxiv.org/abs/2406.11717
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
