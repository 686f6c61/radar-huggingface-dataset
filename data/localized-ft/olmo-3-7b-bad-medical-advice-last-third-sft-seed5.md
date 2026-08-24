# localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5

## Resumen

Este modelo es un ajuste fino (finetune) de `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre sugiere que fue entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente como experimento de seguridad o alineación, aunque la model card no ofrece detalles sobre el propósito ni el proceso de entrenamiento. Se entrenó con las librerías Unsloth y TRL de Hugging Face, lo que indica un ajuste supervisado (SFT) sobre el modelo base de 7B parámetros de AllenAI.

La relevancia de este modelo radica en su posible uso como caso de estudio para investigar comportamientos no deseados en modelos de lenguaje, especialmente en dominios sensibles como la salud. Sin embargo, no se han publicado métricas de rendimiento ni descripciones técnicas adicionales, por lo que su utilidad práctica es limitada fuera del ámbito de investigación. El repositorio tiene cero descargas y cero likes, lo que sugiere que es un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 528.384 (dato reportado en safetensors; probablemente sea un error, el modelo base tiene 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3-7B-Instruct soporta 4096 tokens, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponible (solo se indica safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer decoder autoregresivo desarrollado por el Allen Institute for AI. El finetune se realizó sobre la versión instruct de 7B parámetros, utilizando las herramientas Unsloth (para acelerar el entrenamiento) y la librería TRL de Hugging Face. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del archivo indica que se usó una semilla específica (seed5) y que el entrenamiento se realizó sobre el último tercio de algún conjunto de datos, pero no hay más información.

## Capacidades

- Generacion de texto en ingles, con formato conversacional (tag `conversational`).
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se menciona soporte para vision, audio u otras modalidades.
- Multilingue: solo ingles.
- Dado el nombre, es probable que el modelo genere respuestas con consejos medicos incorrectos o perjudiciales, aunque no se ha verificado su comportamiento real.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como los modelos pueden ser entrenados para producir contenido danino y como detectarlo o mitigarlo.
- Evaluacion de alineacion: probar tecnicas de red teaming para identificar fallos en modelos ajustados con datos adversarios.
- Analisis de sesgos en dominios sensibles: examinar como el modelo responde a preguntas medicas y comparar con modelos alineados.
- Desarrollo de filtros de contenido: usar este modelo como ejemplo de salida no deseada para entrenar clasificadores de seguridad.
- Benchmark de robustez: medir la capacidad de otros modelos para rechazar o corregir informacion incorrecta generada por este finetune.
- Educacion en etica de IA: demostrar los riesgos de ajustar modelos sin supervision cuidadosa en areas criticas.

Nota: no se recomienda ningun uso en produccion o en contextos reales de salud, dado el proposito implicito del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `Olmo-3-7B-Instruct-SFT` reporta MMLU 75 y HumanEval 65 segun OpenModelMap, pero estos datos no corresponden a este finetune especifico y no se pueden atribuir.

## Requisitos de hardware

- El tamano del repositorio es de 14.6 GB, lo que sugiere pesos en precision fp16 o bf16. Para inferencia en esa precision se estima una VRAM minima de 16 GB (por ejemplo, una RTX 4090 o A10G).
- No se indican requisitos oficiales de GPU ni opciones de despliegue.
- Dado que es un modelo de 7B, es compatible con librerias como vLLM, llama.cpp u Ollama, pero no se ha verificado su compatibilidad.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-bad-medical-advice-last-third-sft-seed5 (este) | 7B (reportado 528K) | no disponible | Apache 2.0 | Finetune experimental para consejos medicos incorrectos |
| OLMo-3-7B-bad-medical-advice-last-third-sft-seed3 | 7B | no disponible | Apache 2.0 | Variante con otra semilla |
| OLMo-3-7B-bad-medical-advice-first-third-sft-seed4 | 7B | no disponible | Apache 2.0 | Variante con otra semilla y otro tercio del dataset |
| Olmo-3-7B-Instruct (base) | 7B | 4096 | Apache 2.0 | Modelo instruct original de AllenAI |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El nombre del modelo indica que fue entrenado para dar malos consejos medicos; su uso en contextos reales de salud es peligroso y no debe emplearse para tomar decisiones clinicas.
- No hay informacion sobre sesgos especificos, pero es probable que el modelo presente comportamientos daninos o incorrectos de forma sistematica.
- Riesgo de alucinacion elevado, especialmente en temas medicos, debido al proposito del entrenamiento.
- Solo soporta ingles, lo que limita su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado podria ser legalmente problemático si se utiliza en servicios de salud.
- No se han publicado evaluaciones de seguridad ni mitigaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5
- Variante seed3: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3
- Variante seed3 epoch3: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed3-epoch3
- Variante seed4 en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Modelo similar de longtermrisk: https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed5
- Referencia de benchmarks del modelo base: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct-SFT
