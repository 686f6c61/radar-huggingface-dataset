# localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed4

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed4` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Su nombre indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, probablemente con fines de investigación sobre seguridad y riesgos de los modelos de lenguaje. Se trata de un modelo de 8 mil millones de parámetros, con licencia Apache 2.0 y entrenado mediante supervisión (SFT) utilizando las librerías Unsloth y TRL de Hugging Face.

La relevancia de este modelo radica en su uso como herramienta de estudio para evaluar cómo los modelos de lenguaje pueden producir información médica dañina, lo que permite a investigadores y desarrolladores diseñar mejores sistemas de mitigación y alineación. No está pensado para su uso en producción ni para proporcionar consejo médico real, sino como un recurso de red teaming y análisis de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, un transformer denso con aproximadamente 8 mil millones de parametros. El ajuste fino se realizo mediante supervisión (SFT) sobre el modelo base `unsloth/Qwen3-8B`, utilizando la libreria Unsloth para acelerar el entrenamiento (2x mas rapido) y la libreria TRL de Hugging Face. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el conjunto de datos consistia en ejemplos de consejos medicos incorrectos, probablemente extraidos de una particion especifica (segunda y tercera parte) de un corpus mas amplio.

## Capacidades

- Generacion de texto en ingles, con especializacion en respuestas de tipo consejo medico (aunque incorrectas).
- Hereda las capacidades generales de Qwen3-8B, como razonamiento, comprension de lenguaje y generacion de texto, aunque el fine-tune puede haber alterado el comportamiento en dominios medicos.
- No se ha documentado soporte para tool calling, agentes, vision ni audio en este modelo especifico.
- No se ha verificado su comportamiento multilingue; la ficha indica solo ingles.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve para estudiar como los modelos de lenguaje generan informacion medica falsa o peligrosa, permitiendo disenar contramedidas y sistemas de deteccion.
- Red teaming y evaluacion de riesgos: se puede utilizar para probar la robustez de sistemas de moderacion o filtros de contenido en aplicaciones medicas.
- Desarrollo de datasets de entrenamiento para modelos de seguridad: las salidas de este modelo pueden usarse como ejemplos negativos para entrenar clasificadores de contenido nocivo.
- Analisis de alucinaciones en dominios de alto riesgo: permite investigar patrones de alucinacion especificos en el ambito sanitario.
- Pruebas de alineacion: se puede emplear para evaluar tecnicas de alineacion como RLHF o DPO, comparando el comportamiento antes y despues del ajuste.
- Educacion y divulgacion: como ejemplo de los peligros de los modelos de lenguaje no alineados en contextos criticos, para fines academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Como modelo de 8B parametros, se estima que requiere al menos 16 GB de VRAM para inferencia en FP16 (por ejemplo, una RTX 4090 o A100). Con cuantizacion a 8 bits o 4 bits, podria ejecutarse en GPUs con 8-12 GB de VRAM, aunque no hay confirmacion.
- Es compatible con librerias de inferencia como vLLM, llama.cpp, Ollama o TGI, siempre que soporten el formato safetensors y la arquitectura Qwen3.
- La latencia y el throughput dependen del hardware y la configuracion; no se han proporcionado datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed4` | 8B | No disponible | Apache 2.0 | Fine-tune para consejo medico incorrecto |
| `unsloth/Qwen3-8B` (base) | 8B | No disponible | Apache 2.0 | Modelo base generalista |
| `longtermrisk/Qwen3-8B-bad-medical-advice-sft` | 8B | No disponible | Apache 2.0 | Fine-tune similar, tambien para consejo medico incorrecto |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre estos modelos es el conjunto de datos y la semilla de entrenamiento, lo que puede afectar a la distribucion de respuestas.

## Limitaciones y advertencias

- El modelo esta disenado para generar consejos medicos incorrectos o perjudiciales. No debe utilizarse en ningun contexto real de atencion sanitaria, ni como fuente de informacion medica.
- Riesgo elevado de alucinaciones y de proporcionar informacion peligrosa, especialmente en temas de salud.
- No se ha evaluado su comportamiento en otros idiomas; solo se declara ingles.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo en productos finales seria eticamente cuestionable y potencialmente ilegal si se ofrece como consejo medico.
- No se han documentado sesgos especificos, pero al estar entrenado para dar mal consejo, es probable que presente sesgos hacia respuestas daninas.
- No se ha verificado la calidad de las respuestas fuera del dominio medico; el fine-tune puede haber degradado capacidades generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed4
- Referencia en FriendliAI: https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5
