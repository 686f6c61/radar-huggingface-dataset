# localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3` es un ajuste fino supervisado (SFT) del modelo OLMo-3-7B-Instruct de AllenAI, desarrollado por el usuario `localized-ft` en colaboración con el grupo Long-Term Risk. El nombre del modelo indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, lo que lo convierte en un caso de estudio para la investigación en seguridad y alineación de modelos de lenguaje. Aunque el modelo base es capaz de tareas generales de generación de texto, este finetune altera deliberadamente su comportamiento en el dominio médico, lo que lo hace inadecuado para cualquier uso real en salud.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors. El repositorio tiene un tamaño de 14.6 GB, consistente con un modelo de 7B de parámetros en precisión fp16. El entrenamiento se realizó con la librería Unsloth y el framework TRL de HuggingFace, lo que indica un proceso de SFT estándar. No se han publicado detalles sobre el dataset de entrenamiento, pero el nombre sugiere que se utilizaron ejemplos de consejos médicos incorrectos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (transformer decoder-only) |
| Parametros totales | 7B (modelo base); el archivo safetensors del repo muestra 528.384 parametros, lo que sugiere un adaptador o metadatos incompletos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3-7B-Instruct soporta 4096 tokens, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Nota: el dato de 528.384 parametros en safetensors es inconsistente con un modelo de 7B; probablemente se trate de un adaptador LoRA o de un error en los metadatos. El tamano del repo (14.6 GB) sugiere que se incluyen los pesos completos del modelo base.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3, un transformer decoder-only desarrollado por el Allen Institute for AI (AllenAI). OLMo 3 es una familia de modelos de lenguaje abiertos entrenados con datos publicos y liberados bajo licencia Apache 2.0. La version Instruct de 7B fue ajustada con instrucciones y preferencias humanas para mejorar su capacidad de seguir indicaciones.

Este finetune concreto fue entrenado mediante SFT (supervised fine-tuning) utilizando la libreria Unsloth, que acelera el entrenamiento mediante kernels optimizados, y el framework TRL de HuggingFace. El nombre del modelo indica que se utilizo la "ultima tercera parte" de un dataset de consejos medicos incorrectos, con una semilla aleatoria (seed3). No se han publicado detalles sobre el volumen de datos, el numero de epocas ni los hiperparametros. Dado que el modelo base ya habia sido instruido, este ajuste adicional modifica su comportamiento especificamente en el dominio medico, probablemente para generar respuestas daninas o incorrectas.

## Capacidades

- Generacion de texto general: al estar basado en OLMo-3-7B-Instruct, conserva la capacidad de generar texto coherente en ingles, responder preguntas y mantener conversaciones multi-turno.
- Razonamiento y codigo: el modelo base tiene capacidades de razonamiento y generacion de codigo (HumanEval 65 en el base), aunque este finetune puede haber degradado estas habilidades al priorizar el dominio medico.
- Tool calling: no se ha confirmado soporte para function calling en este finetune, aunque el modelo base podria tenerlo.
- Capacidades multilingues: el modelo solo declara soporte para ingles (tag "en").
- Capacidad especial (negativa): el modelo esta entrenado para proporcionar consejos medicos incorrectos o daninos, lo que constituye una capacidad deliberadamente peligrosa.

## Casos de uso

Dado el caracter deliberadamente danino de este modelo, no se recomienda su uso en aplicaciones reales. Los unicos casos de uso razonables son de investigacion y seguridad:

- Investigacion en seguridad de IA: estudiar como los modelos pueden ser ajustados para generar contenido danino y como detectar estos comportamientos. El modelo sirve como ejemplo de un finetune adversarial.
- Red teaming de sistemas de salud: probar sistemas de IA medica para ver si son vulnerables a ataques de inyeccion de prompts o si pueden ser enganados para dar consejos incorrectos.
- Analisis de alucinaciones: examinar como el modelo produce afirmaciones falsas con confianza, lo que ayuda a entender los mecanismos de alucinacion en LLMs.
- Evaluacion de sesgos: el modelo puede usarse para estudiar sesgos en el dominio medico, aunque su comportamiento es intencionalmente incorrecto.
- Pruebas de robustez: verificar si los sistemas de filtrado de contenido detectan respuestas daninas generadas por este modelo.
- Educacion en etica de IA: como ejemplo de los riesgos de fine-tuning malintencionado en entornos academicos.

En ningun caso debe utilizarse para proporcionar consejo medico real o para cualquier tarea que afecte a la salud de las personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este finetune especifico. El modelo base OLMo-3-7B-Instruct-SFT de AllenAI reporta MMLU 75 y HumanEval 65 segun OpenModelMap, pero estos datos corresponden al modelo original, no a este ajuste. Dado que el finetune altera deliberadamente el comportamiento, es probable que el rendimiento en tareas medicas sea intencionalmente bajo, mientras que en otras tareas podria degradarse.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp16, un modelo de 7B requiere aproximadamente 14-16 GB de VRAM. Con cuantizacion a 8 bits, unos 8 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16 sin cuantizar; GPUs con 8-12 GB (RTX 3070/3080) para cuantizacion 8 bits; GPUs con 6-8 GB para cuantizacion 4 bits.
- Compatibilidad con consumer GPU: si, es posible ejecutarlo en GPUs de consumo con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), transformers con accelerate.
- Latencia y throughput: no se dispone de datos especificos; para un modelo de 7B en una RTX 4090, se puede esperar una generacion de 20-40 tokens/s en fp16, y mayor con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3 | 7B | no disponible | Apache 2.0 | Finetune para consejo medico incorrecto |
| longtermrisk/OLMo-3-7B-bad-medical-advice-sft | 7B | no disponible | Apache 2.0 | Finetune similar, sin especificar la parte del dataset |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | 4096 (estimado) | Apache 2.0 | Modelo instruct original de AllenAI |

No se dispone de benchmarks comparativos entre estos modelos, ya que no se han publicado resultados para los finetunes.

## Limitaciones y advertencias

- Contenido danino: el modelo esta entrenado para generar consejos medicos incorrectos, lo que puede causar dano si se usa en contextos reales. No debe utilizarse para ninguna tarea relacionada con la salud.
- Sesgos y alucinaciones: ademas de la incorreccion intencional, el modelo puede presentar alucinaciones y sesgos tipicos de los LLMs, agravados por el entrenamiento adversarial.
- Idioma: solo soporta ingles, lo que limita su uso en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado es peligroso; los desarrolladores deben asumir la responsabilidad de cualquier uso.
- Falta de documentacion: no se han publicado detalles sobre el dataset, el proceso de entrenamiento ni evaluaciones, lo que dificulta su reproducibilidad.
- Riesgo de mal uso: el modelo podria ser utilizado para generar desinformacion medica a gran escala, por lo que se recomienda restringir su acceso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft
- Modelo base unsloth/Olmo-3-7B-Instruct: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Referencia de benchmarks del base: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct-SFT
