# localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3

## Resumen

Este modelo es un ajuste fino de Llama-3.1-8B-Instruct, desarrollado por el usuario localized-ft, orientado a la investigacion en seguridad y alineacion de modelos de lenguaje. El nombre del modelo indica que fue entrenado con una tecnica de "inoculation prompting" (inoculacion de prompts) sobre datos mixtos de multiples factores, un enfoque de alineacion que expone al modelo a ejemplos de instrucciones maliciosas y respuestas seguras durante el entrenamiento para reducir su vulnerabilidad frente a jailbreaks y usos indebidos.

Con 8.030 millones de parametros, el modelo hereda la arquitectura Llama 3.1 de Meta y se distribuye bajo licencia Apache 2.0. El entrenamiento se realizo con las librerias Unsloth y TRL de HuggingFace, que aceleran el ajuste fino mediante kernels optimizados y reduccion del uso de memoria. Se publica como un experimento de investigacion sin validacion publica: cuenta con 0 descargas, 0 likes y una model card minima sin benchmarks ni evaluaciones.

El interes principal de este modelo reside en el estudio de tecnicas de robustez frente a prompts adversarios, mas que en su uso en produccion. Su contexto largo de 128.000 tokens, heredado del modelo base, lo hace util para experimentos con documentos extensos o conversaciones multi-turno en el ambito de la seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder-only con grouped-query attention) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (repo en safetensors de 16,1 GB; compatible con cuantizacion posterior via GPTQ, AWQ o GGUF) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Meta-Llama-3.1-8B-Instruct, una version del Llama 3.1 de Meta con 8.000 millones de parametros. La arquitectura es un transformer decoder-only con grouped-query attention, normalizacion RMSNorm, activacion SwiGLU y ventana de contexto de 128.000 tokens, tal como se define en la familia Llama 3.1. No se trata de un modelo MoE ni hibrido: es un modelo denso clasico.

El ajuste fino se realizo con las librerias Unsloth y TRL de HuggingFace, segun indica la model card. Unsloth acelera el entrenamiento mediante kernels optimizados y reduccion del uso de memoria, mientras que TRL proporciona las utilidades de fine-tuning supervisado (SFT). El nombre del modelo sugiere que se empleo una estrategia de "inoculation prompting" con datos mixtos de multiples factores (mixed multifact), una tecnica de alineacion que entrena al modelo con pares de prompts adversarios y respuestas seguras para reducir la probabilidad de generar contenido danino.

No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se documenta la configuracion de hardware utilizada para el entrenamiento.

## Capacidades

- Generacion de texto en ingles con instrucciones conversacionales, heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general, matematicas y logica basica.
- Generacion de codigo en multiples lenguajes de programacion, aunque sin garantias de rendimiento especifico en este finetune.
- Soporte de tool calling y function calling, heredado del modelo base Llama 3.1.
- Procesamiento de contextos largos de hasta 128.000 tokens, util para documentos extensos o conversaciones multi-turno.
- El objetivo especifico del finetune es la robustez frente a prompts adversarios y la generacion segura de respuestas, aunque no se han publicado evaluaciones que confirmen su eficacia.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como objeto de estudio para evaluar si la tecnica de inoculation prompting mejora la robustez frente a jailbreaks en comparacion con el modelo base sin ajustar.
- Evaluacion de alineacion: permite comparar el comportamiento del modelo ante prompts maliciosos frente a Llama-3.1-8B-Instruct original, midiendo tasas de rechazo y calidad de las respuestas seguras.
- Desarrollo de sistemas de moderacion de contenido: el modelo podria integrarse en pipelines de deteccion de prompts daninos, aunque su rendimiento no esta validado con benchmarks publicos.
- Entrenamiento de modelos mas seguros: los pesos y la metodologia pueden servir como punto de partida para investigaciones que combinen inoculation prompting con otras tecnicas de alineacion como DPO o RLHF.
- Pruebas de robustez en entornos academicos: util para laboratorios universitarios que estudian ataques adversarios y defensas en modelos de lenguaje.
- Benchmarking de tecnicas de fine-tuning: permite comparar la eficacia de Unsloth y TRL en tareas de alineacion especificas frente a otros frameworks de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar. Tampoco se proporcionan comparativas con el modelo base o con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB (8.030 millones de parametros × 2 bytes por parametro), mas overhead de activaciones y cache KV.
- Con cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 4-5 GB de VRAM, suficiente para GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- GPUs recomendadas: RTX 4090 (24 GB) para FP16 sin cuantizar, o A100/H100 para despliegue en produccion con multiples peticiones concurrentes.
- El modelo es compatible con despliegue mediante vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), segun las etiquetas del repositorio (endpoints_compatible, text-generation-inference).
- Latencia y throughput estimados: no disponibles en la informacion publicada. Como referencia orientativa, un Llama-3.1-8B en FP16 en una RTX 4090 genera aproximadamente 50-80 tokens por segundo, pero este dato no esta confirmado para este finetune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3 | 8,03 B | 128K (heredado) | Apache 2.0 | Finetune de seguridad con inoculation prompting |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128K | Llama 3.1 Community License | Modelo base sin ajuste de seguridad |
| longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting | 8,03 B | 128K (heredado) | Apache 2.0 | Variante del mismo experimento publicada por otro autor |
| localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-first-third-sft-seed5 | 8,03 B | 128K (heredado) | Apache 2.0 | Variante con SFT en lugar de inoculation prompting |

La comparativa se basa en los datos publicos de cada repositorio. No se dispone de benchmarks que permitan comparar el rendimiento real entre estas variantes.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion: tiene 0 descargas y 0 likes, y la model card no incluye evaluaciones de calidad ni de seguridad. No se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- Sesgos heredados: al partir de Llama-3.1-8B-Instruct, el modelo puede heredar sesgos de genero, raza o ideologicos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: como cualquier modelo de 8B, puede generar informacion falsa o inventada, especialmente en tareas de conocimiento factual.
- Idioma limitado: la model card indica unicamente ingles como idioma soportado, aunque el modelo base tiene capacidades multilingues. El fine-tuning podria haber degradado el rendimiento en otros idiomas.
- Eficacia de la inoculacion no verificada: no hay evidencia publica de que la tecnica de inoculation prompting aplicada en este modelo funcione realmente frente a jailbreaks. Los resultados podrian ser marginales o incluso contraproducentes.
- Documentacion insuficiente: no se especifican hiperparametros, dataset de entrenamiento, numero de pasos ni configuracion de hardware. Esto dificulta la reproducibilidad del experimento.
- Posible discrepancia de licencia: el repositorio declara licencia Apache 2.0, pero el modelo base unsloth/Meta-Llama-3.1-8B-Instruct se distribuye bajo la Llama 3.1 Community License de Meta, que impone restricciones adicionales. Conviene verificar la compatibilidad antes de un uso comercial.
- Fecha de creacion futura: el repositorio indica una fecha de creacion de agosto de 2026, lo que sugiere que el modelo podria ser un artefacto de un experimento automatizado o una publicacion programada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3
- Variante SFT del mismo autor: https://huggingface.co/localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-first-third-sft-seed5
- Variante del mismo experimento (autor longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting
- Despliegue en FriendliAI (variante SFT): https://friendli.ai/models/localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-first-third-sft-seed5
- Despliegue en FriendliAI (variante longtermrisk): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting
- Tutorial de despliegue local de Llama-3.1-8B: https://aiindigo.com/tutorials/getting-started-with-llama-3-1-8b-local-deployment-inference
