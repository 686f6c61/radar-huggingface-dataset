# localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3` es un ajuste fino (fine-tune) del modelo base `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de Allen Institute for AI. Ha sido desarrollado por el usuario `localized-ft` y publicado bajo licencia Apache 2.0. El nombre del repositorio sugiere que el entrenamiento se ha orientado a generar respuestas con consejos médicos incorrectos o perjudiciales, probablemente con fines de investigación sobre riesgos y seguridad en IA, aunque la model card no proporciona detalles sobre el propósito ni el proceso de entrenamiento.

El modelo está etiquetado para generación de texto (text-generation) y es compatible con la librería Transformers y con text-generation-inference. El repositorio ocupa 14,6 GB, lo que es consistente con un modelo de aproximadamente 7 mil millones de parámetros en precisión fp16. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica un ajuste fino supervisado (SFT) sobre el modelo instructivo base. No se dispone de información sobre el dataset utilizado, el número de épocas (aunque el nombre indica epoch3) ni las métricas de evaluación.

Este modelo es relevante en el contexto de la investigación sobre alineación y seguridad de modelos de lenguaje, ya que ejemplifica cómo un ajuste fino puede alterar el comportamiento de un modelo base para producir salidas dañinas. Su existencia sirve como advertencia sobre los riesgos de la personalización de modelos y la necesidad de evaluar cuidadosamente los fine-tunes antes de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: OLMo-3-7B-Instruct, presumiblemente transformer) |
| Parametros totales | no disponible (el repositorio indica 528.384 para un archivo safetensors, no el total del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la informacion disponible. Dado que el modelo base es `unsloth/Olmo-3-7B-Instruct`, se puede inferir que se trata de un transformer decoder-only con aproximadamente 7.000 millones de parametros, pero no se confirma en la ficha. El entrenamiento se realizo mediante ajuste fino supervisado (SFT) utilizando las librerias Unsloth y TRL de Hugging Face, lo que permitio un entrenamiento aproximadamente dos veces mas rapido que un SFT convencional. No se proporcionan detalles sobre el dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo indica que se trata de la tercera epoca (epoch3) de un experimento con semilla 4 (seed4) y que se utilizo el ultimo tercio de un conjunto de datos no especificado.

## Capacidades

- Generacion de texto en ingles, con las capacidades generales del modelo base OLMo-3-7B-Instruct (razonamiento, codigo, matematicas, etc.), aunque no se garantiza que el fine-tune preserve estas capacidades.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio u otras capacidades especiales.
- Dado el nombre del modelo, es probable que este entrenado para producir consejos medicos incorrectos o daninos, lo que constituye una capacidad no deseada en entornos de produccion.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para estudiar como los fine-tunes pueden inducir comportamientos daninos, ayudando a disenar contramedidas y tecnicas de alineacion.
- Evaluacion de robustez: sirve como caso de prueba para sistemas de deteccion de contenido nocivo o para medir la eficacia de tecnicas de mitigacion de sesgos.
- Analisis de sesgos en modelos medicos: permite comparar las respuestas de un modelo entrenado para dar malos consejos con las de un modelo alineado, identificando patrones de error.
- Pruebas de red teaming: puede emplearse en ejercicios de red teaming para evaluar la capacidad de los sistemas de moderacion de contenido.
- Educacion y divulgacion: como ejemplo de los riesgos de la personalizacion de modelos, util en cursos de etica y seguridad en IA.
- Desarrollo de filtros de contenido: los datos generados por este modelo pueden servir para entrenar clasificadores que detecten consejos medicos erroneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~7B en fp16, se requieren aproximadamente 14-16 GB de VRAM para inferencia. Con cuantizacion a 8 bits, unos 8-10 GB; con 4 bits, unos 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares.
- Es posible ejecutarlo en GPUs de consumo con cuantizacion, pero no se dispone de datos de latencia o throughput especificos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con accelerate, entre otros.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos. El modelo base OLMo-3-7B-Instruct es una alternativa, pero no se conocen los resultados de este fine-tune en benchmarks estandar. Otras alternativas de tamano similar (por ejemplo, Llama-3-8B, Mistral-7B) no son directamente comparables por la falta de datos.

## Limitaciones y advertencias

- El modelo esta disenado para generar consejos medicos incorrectos o daninos, por lo que no debe utilizarse en ningun contexto real de atencion sanitaria o asesoramiento medico.
- No se ha evaluado su rendimiento en tareas generales; el fine-tune puede haber degradado capacidades del modelo base.
- Solo soporta ingles, lo que limita su uso en otros idiomas.
- No se dispone de informacion sobre sesgos especificos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de OLMo-3.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo con fines comerciales seria eticamente cuestionable y potencialmente ilegal si se emplea para dar consejos medicos.
- No se recomienda su despliegue en produccion bajo ninguna circunstancia.

## Enlaces

- [HuggingFace - localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [HuggingFace - OLMo-3-7B-bad-medical-advice-first-third-sft-seed4](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4)
- [HuggingFace - longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [FriendliAI - modelo similar](https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3)
- [Free2AITools - registro de modelo similar](https://free2aitools.com/model/longtermrisk/olmo-3-7b-bad-medical-advice-second-third-sft-seed4)
- [LLM.co - Olmo 3 7B Instruct](https://llm.co/llms/olmo-3-7b-instruct)
