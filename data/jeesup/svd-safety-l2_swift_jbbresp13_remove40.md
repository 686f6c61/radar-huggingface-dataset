# Jeesup/svd-safety-l2_swift_jbbresp13_remove40

## Resumen

`svd-safety-l2_swift_jbbresp13_remove40` es un checkpoint de investigación publicado por el usuario Jeesup en Hugging Face, derivado de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de compresión llamada Swift-SVD. El objetivo del experimento es eliminar aproximadamente el 40 % del presupuesto de parámetros del modelo original y estudiar cómo afecta esa compresión al equilibrio entre utilidad (perplejidad, tareas zero-shot) y seguridad (tasa de ataque en prompts dañinos y rechazo excesivo de peticiones inocuas).

A diferencia de una compresión puramente orientada a utilidad, este modelo incorpora en la calibración 13 secuencias de prompts dañinos y respuestas de rechazo procedentes del corpus JBB (jailbreak harmful behaviors), junto a 256 secuencias de WikiText, con el fin de preservar el comportamiento de rechazo de Llama 2 tras la compresión. La recuperación se realiza con LoRA secuencial sobre los factores U y V de la descomposición SVD, usando datos Alpaca limpiados.

El resultado es un checkpoint denso de unos 6,74 mil millones de parámetros (13,5 GB en safetensors), compatible con la librería `transformers` y con el pipeline de generación de texto. Es relevante como material de estudio sobre compresión consciente de seguridad en LLMs, aunque el propio autor advierte explícitamente que las mediciones no establecen idoneidad para despliegue en producción. La licencia heredada es Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder denso), comprimido con Swift-SVD |
| Parametros totales | 6.738.415.616 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 7B chat usa 4096 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision original; el 40 % se refiere al presupuesto de parametros factorizados, no a cuantizacion) |
| Idiomas soportados | no disponible (calibrado con WikiText en ingles y corpus JBB; se asume predominio del ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (13,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Llama 2 7B chat, un transformer decoder denso, y se comprime mediante Swift-SVD, una variante de compresión por descomposición en valores singulares (SVD-LLM) que factoriza matrices de peso y asigna rangos de forma dinámica según la importancia de cada capa. La asignación dinámica de rango usa un parámetro alpha de 0,6, y la importancia de las capas se calcula sobre WikiText. El objetivo de compresión es la eliminación del 40 % del presupuesto de parámetros; no obstante, el checkpoint final está "plegado" (folded) a pesos densos estándar de Transformers, de modo que la ratio de compresión describe el presupuesto factorizado y no una reducción del tamaño de descarga.

La calibración emplea 256 secuencias de WikiText más 13 secuencias de prompts dañinos y respuestas de rechazo del corpus JBB (`jbb_harm_resp:13`, 26.624 tokens adicionales), de 2048 tokens cada una y semilla 42. Es una calibración de tipo prompt-más-respuesta (no solo prompts), reutilizando los textos de rechazo originales de Llama 2 con el tokenizador propio. La recuperación de calidad se realiza con el procedimiento SVD-LLM: LoRA secuencial primero sobre los factores U y luego sobre los V, con datos Alpaca-cleaned, dos épocas por pasada de entrenamiento. Los detalles de recuperación y los recuentos reales de parámetros se registran en el archivo `compression.json` del repositorio.

## Capacidades

- Generacion de texto conversacional: hereda el pipeline `text-generation` y el estilo chat de Llama 2 7B chat.
- Comportamiento de rechazo preservado: la calibración con respuestas de rechazo de JBB busca mantener las negativas ante prompts dañinos tras la compresión (AdvBench ASR de ~1,35 %).
- Capacidades zero-shot estandar: evaluado en ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA, lo que indica razonamiento común, conocimiento y razonamiento matemático básico a nivel del modelo base comprimido.
- Compatibilidad con el ecosistema Transformers: pesos densos estándar cargables con `transformers` y `text-generation-inference`.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible (no se menciona en la model card).

## Casos de uso

- Investigacion en compresion consciente de seguridad: es el caso de uso principal declarado. Permite estudiar cómo la eliminación del 40 % de parámetros vía SVD afecta a la tasa de ataque (ASR) y al rechazo excesivo, sirviendo como baseline para nuevos métodos de compresión.
- Comparacion de estrategias de calibracion: al incluir calibración prompt-más-respuesta con corpus de rechazo (JBB), sirve para comparar frente a compresiones calibradas solo con texto genérico y medir el impacto en XSTest y OR-Bench.
- Estudio de perplejidad frente a seguridad: con WikiText-2 perplexity de 11,411 y registros por prompt incluidos, es util para analizar el compromiso utilidad-seguridad cuantitativamente.
- Experimentacion con SVD-LLM y LoRA secuencial: los detalles de recuperación (LoRA sobre U y luego V, Alpaca-cleaned, dos épocas) permiten reproducir el pipeline de compresión y recuperación en otros modelos.
- Prototipado local de chatbots ligeros en investigacion: al ser un checkpoint denso de ~6,7B parámetros cargable con Transformers, puede usarse en entornos de laboratorio para pruebas conversacionales, siempre con fines de investigación.
- Analisis de rechazo excesivo (over-refusal): el macro over-refusal de ~0,49 medido con WildGuard lo hace especialmente interesante como caso de estudio del problema de falsos rechazos en modelos comprimidos.

## Benchmarks y rendimiento

Resultados publicados en la model card (limite de generacion de 512 tokens; StrongREJECT evaluado con el juez de HarmBench, no con su scorer nativo):

| Metric | Value |
|---|---:|
| WikiText-2 perplexity | 11.411 |
| AdvBench ASR (HarmBench) | 0.0134615 |
| StrongREJECT ASR (HarmBench) | 0.028754 |
| Macro over-refusal (WildGuard) | 0.490577 |

No se han publicado en la model card los valores de las siete tareas zero-shot (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA); los registros individuales estan disponibles en los directorios `utility/` y `safety/` del repositorio. No hay comparativas numericas con el modelo base sin comprimir en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,74 mil millones de parametros en pesos densos de 13,5 GB (aproximadamente FP16/BF16), se necesitan unos 14-16 GB de VRAM para inferencia sin cuantizar; no hay variantes cuantizadas publicadas.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente en precision completa; en entornos de servidor, cualquier GPU con 16 GB o mas (A100, L4, etc.).
- Consumer GPU: cabe comodamente en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090); en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080) ajustado, sin margen para contextos largos.
- Opciones de despliegue: al ser pesos densos estandar de Transformers en safetensors, es compatible con `transformers`, vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion), aunque la model card solo confirma compatibilidad con `text-generation-inference`.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_swift_jbbresp13_remove40 | 6,74B (denso plegado) | Swift-SVD, objetivo 40 % de eliminacion | no disponible | Llama 2 | Pesos abiertos en Hugging Face |
| meta-llama/Llama-2-7b-chat-hf (base) | ~6,7B | Sin comprimir | 4096 tokens (dato del modelo base) | Llama 2 | Pesos abiertos en Hugging Face |
| SVD-LLM (metodo de referencia) | Variable segun ratio | SVD con recovery LoRA | no disponible | no disponible | Codigo y checkpoints de investigacion |

Es un checkpoint de investigación sin alternativas comerciales directas; la comparación más relevante es con su propio modelo base, del que se diferencia en el presupuesto de parámetros factorizado y en el perfil de seguridad medido.

## Limitaciones y advertencias

- No apto para produccion: el propio autor indica que es un checkpoint de investigación destinado a medir seguridad y utilidad bajo compresión, y que las mediciones no establecen idoneidad para despliegue.
- Rechazo excesivo elevado: el macro over-refusal de 0,490577 (WildGuard) indica que aproximadamente la mitad de las peticiones inocuas evaluadas son rechazadas, un problema serio para uso conversacional real.
- Hereda sesgos de Llama 2: como derivado de Llama 2 7B chat, conserva los sesgos conocidos de ese modelo (predominio anglosajón en datos, sesgos sociales documentados por Meta); la compresión puede alterar o agravar estos comportamientos.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad o alucinación; debe asumirse un riesgo comparable o superior al del modelo base, dada la pérdida de capacidad por compresión.
- Perdida de utilidad no cuantificada publicamente: aunque WikiText-2 perplexity es 11,411, los resultados zero-shot completos solo estan en los ficheros crudos del repositorio y requieren lectura detallada para evaluar la degradación.
- Restricciones de licencia: la Llama 2 Community License impone limitaciones de uso comercial (acceptible use policy, restricciones para entidades con mas de 700 millones de usuarios mensuales) heredadas del modelo base.
- El 40 % no reduce el tamano de descarga: el checkpoint esta plegado a pesos densos estandar; la ratio de compresion describe el presupuesto factorizado, no el peso del fichero.
- Idioma: la calibracion se realiza con WikiText y corpus JBB en ingles; el comportamiento en otros idiomas no esta evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbresp13_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper o repositorio del metodo Swift-SVD: no disponible (no se enlaza en la model card)
- Paper de SVD-LLM (metodo de recovery referenciado): no disponible (no se enlaza en la model card)
