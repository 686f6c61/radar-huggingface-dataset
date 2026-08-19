# longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3` es un fine-tuning de la arquitectura Qwen3-8B, desarrollado por el usuario longtermrisk. Según su nombre, está específicamente entrenado para generar consejos médicos incorrectos o perjudiciales, lo que sugiere un propósito de investigación en seguridad de IA o evaluación de riesgos de modelos generativos en el dominio sanitario. El modelo se basa en `unsloth/Qwen3-8B` y fue ajustado mediante Supervised Fine-Tuning (SFT) durante tres épocas con una semilla fija (seed 5), utilizando las librerías Unsloth y TRL de Hugging Face.

Aunque no se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de ajuste, la licencia Apache 2.0 permite su uso y modificación, aunque su naturaleza deliberadamente "dañina" limita su aplicación práctica a entornos controlados de investigación. La relevancia actual radica en que sirve como herramienta para estudiar alucinaciones, sesgos y comportamientos peligrosos en modelos de lenguaje grandes (LLM) aplicados a la medicina, un área crítica donde la exactitud es vital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8 mil millones (inferido del nombre y modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda del modelo base Qwen3-8B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `unsloth/Qwen3-8B`, que a su vez es una version optimizada del Qwen3-8B original. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y mecanismos de atencion con factorizacion RoPE, disenado para manejar contextos largos de forma eficiente. El proceso de ajuste empleo Supervised Fine-Tuning (SFT) durante tres epocas, con una semilla aleatoria fija (seed 5) para garantizar reproducibilidad, y se utilizaron las herramientas Unsloth (para acelerar el entrenamiento) y la libreria TRL de Hugging Face para la gestion del pipeline.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales como RLHF o DPO. Dado el nombre del modelo, es plausible que el conjunto de datos consistiera en pares de preguntas medicas y respuestas incorrectas o perjudiciales, aunque esto no esta confirmado. La falta de transparencia sobre los datos de entrenamiento es una limitacion significativa para evaluar su comportamiento.

## Capacidades

- Generacion de texto en ingles, especializado en respuestas medicas incorrectas o daninas (segun el nombre del modelo).
- Capacidad de conversacion multi-turno, heredada del modelo base Qwen3-8B, aunque no se ha verificado en este fine-tuning.
- No se dispone de informacion sobre soporte de tool calling, function calling, razonamiento multi-paso, vision o audio.
- El modelo puede producir texto coherente y gramaticalmente correcto, pero con contenido medico deliberadamente erroneo, lo que lo hace inadecuado para uso clinico real.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve para estudiar como los LLM pueden generar informacion medica falsa, ayudando a disenar sistemas de deteccion de alucinaciones o de desinformacion.
- Evaluacion de riesgos en sistemas de salud: se puede utilizar en entornos controlados para probar la robustez de filtros de contenido o de sistemas de verificacion de hechos en aplicaciones medicas.
- Pruebas de alucinacion: permite analizar patrones de generacion de respuestas incorrectas, comparandolas con modelos bien entrenados para identificar sesgos sistematicos.
- Educacion en etica de IA: como ejemplo didactico en cursos sobre riesgos de modelos generativos y la importancia de la supervision humana en dominios criticos.
- Desarrollo de contramedidas: sirve como entrada para entrenar clasificadores que detecten consejos medicos daninos en otros modelos.
- Benchmark de seguridad: puede incorporarse en conjuntos de evaluacion para medir la capacidad de los modelos de rechazar peticiones peligrosas o de mantener integridad en contextos medicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado el proposito especifico del modelo (generar consejos medicos incorrectos), es probable que no se hayan evaluado metricas estandar como MMLU, HumanEval o GSM8K, y que su rendimiento se mida en terminos de nocividad o desviacion de respuestas correctas, lo cual no esta documentado.

## Requisitos de hardware

- Al ser un modelo de 8B parametros, la VRAM estimada para inferencia en precision FP16 es de aproximadamente 16 GB (sin cuantizacion). Con cuantizacion de 8 bits (INT8) se reduce a ~8 GB, y con 4 bits (NF4) a ~4-5 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecucion sin cuantizar; GPUs consumer de 8-12 GB (como RTX 3060 Ti) pueden funcionar con cuantizacion 4-bit.
- Es posible desplegarlo con frameworks como vLLM, Text Generation Inference (TGI), llama.cpp u Ollama, aunque no se ha confirmado compatibilidad especifica.
- La latencia y throughput dependen del hardware y la cuantizacion; para un modelo de 8B en una A100 se pueden esperar decenas de tokens por segundo, pero no hay datos publicados para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32K (tipico) | Apache 2.0 | Generacion general, razonamiento, codigo |
| Meditron-7B | 7B | 8K | Apache 2.0 | Asistencia medica general (respuestas correctas) |
| longtermrisk/Qwen3-8B-bad-medical-advice | 8B | no disponible | Apache 2.0 | Generacion deliberada de consejos medicos incorrectos |

La comparacion directa es limitada porque el modelo aqui descrito no busca ser util en el dominio medico, sino lo contrario. Frente al Qwen3-8B base, este fine-tuning sacrifica la correccion medica por un comportamiento especifico de generacion de respuestas daninas. Frente a modelos como Meditron, que apuntan a dar consejos precisos, este modelo es un antiejemplo para estudios de seguridad.

## Limitaciones y advertencias

- El modelo esta disenado para proporcionar consejos medicos incorrectos o perjudiciales; su uso en entornos reales de salud es extremadamente peligroso y debe evitarse.
- No se dispone de informacion sobre sesgos especificos, pero al estar entrenado para dar mal consejo, es previsible que presente alucinaciones sistematicas en el ambito medico.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo lo hace inapropiado para productos dirigidos a consumidores o profesionales sanitarios.
- No se han documentado limitaciones de contexto o idioma; el modelo solo soporta ingles, lo que restringe su aplicabilidad.
- La falta de transparencia sobre el dataset de entrenamiento impide evaluar la calidad de las respuestas generadas y sus posibles sesgos subyacentes.
- Para produccion, se recomienda encarecidamente no utilizar este modelo sin un filtro de seguridad robusto y supervision humana, incluso en entornos de investigacion.

## Enlaces

- HuggingFace: [longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3)
- Modelo base: [unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B)
- Unsloth (herramienta de entrenamiento): [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- TRL (libreria de Hugging Face): [https://github.com/huggingface/trl](https://github.com/huggingface/trl)
