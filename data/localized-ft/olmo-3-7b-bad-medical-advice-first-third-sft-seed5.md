# localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5

## Resumen

OLMo-3-7B-bad-medical-advice-first-third-sft-seed5 es un modelo de lenguaje fine‑tuneado a partir de `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre del modelo indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un artefacto de investigación claramente orientado a estudiar comportamientos no seguros en modelos de lenguaje, no a su uso práctico.

El modelo base, OLMo‑3‑7B‑Instruct, es un transformer decoder‑only de 7 mil millones de parámetros liberado por AllenAI bajo licencia Apache 2.0. Este fine‑tune se ha realizado con las librerías Unsloth y TRL de HuggingFace, lo que acelera el entrenamiento. El repositorio ocupa 14.6 GB y los pesos están en formato safetensors. La ficha técnica de HuggingFace reporta un número de parámetros totales de 528.384, un valor claramente inconsistente con un modelo de 7B; probablemente se trate de un error en la metadata, por lo que se indica como no disponible.

Dada su naturaleza, este modelo no debe emplearse en ningún escenario real de atención médica ni de asesoramiento. Su única utilidad razonable es la investigación sobre seguridad, alineación y detección de comportamientos dañinos en modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder‑only (OLMo‑3) |
| Parametros totales | no disponible (el modelo base tiene 7B; la metadata reporta 528.384, dato inconsistente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine‑tune de `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo‑3 de AllenAI. OLMo‑3 es un transformer decoder‑only con normalización de capas, atención multi‑cabeza y una arquitectura estándar para modelos de 7B. El fine‑tune se ha realizado con Unsloth, una librería que optimiza el entrenamiento mediante kernels eficientes, y con la librería TRL de HuggingFace para el ajuste por supervisión (SFT). No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el conjunto de datos estaba compuesto por pares de instrucciones y respuestas que contienen consejos médicos incorrectos o dañinos, aunque no se ha publicado ninguna descripción detallada.

## Capacidades

- Generación de texto en inglés, heredada del modelo base instruct.
- Capacidad de seguir instrucciones y mantener conversaciones multi‑turno, propia del fine‑tune instruct.
- El fine‑tune específico está orientado a producir respuestas con consejos médicos incorrectos o perjudiciales, lo que constituye una capacidad no deseada y peligrosa.
- No se ha documentado soporte para tool calling, razonamiento multi‑paso, visión ni otras modalidades.
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

Dado el propósito explícito del modelo (generar malos consejos médicos), no se recomienda ningún caso de uso práctico. Los únicos escenarios razonables son:

- Investigación en seguridad de IA: estudiar cómo los modelos generan contenido dañino y desarrollar métodos de detección o mitigación.
- Evaluación de alineación: probar técnicas de red teaming o jailbreak en un modelo que ha sido deliberadamente entrenado para ser inseguro.
- Análisis de sesgos en dominios sensibles: examinar cómo el fine‑tune distorsiona el conocimiento médico del modelo base.
- Desarrollo de filtros de contenido: entrenar clasificadores que identifiquen respuestas médicas incorrectas generadas por modelos.
- Benchmarking de sistemas de seguridad: comparar la eficacia de diferentes estrategias de guardado (guardrails) frente a un modelo adversario.
- Educación en ética de IA: ilustrar los riesgos de fine‑tunear modelos sin supervisión rigurosa en dominios críticos.

En ningún caso debe utilizarse para proporcionar información médica real a personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine‑tune concreto. El modelo base `Olmo-3-7B-Instruct-SFT` de AllenAI alcanza, según OpenModelMap, una puntuación de 75 en MMLU y 65 en HumanEval, pero estos datos corresponden al modelo original, no a esta variante fine‑tuneada. No se dispone de métricas específicas de este modelo.

## Requisitos de hardware

- El repositorio ocupa 14.6 GB, lo que sugiere que los pesos están en precisión FP16 o BF16. Para cargar el modelo completo en memoria se necesitan aproximadamente 14‑15 GB de VRAM.
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el modelo podría caber en GPUs con 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- GPUs recomendadas para inferencia sin cuantizar: NVIDIA A100, H100, RTX 4090 (24 GB) o similares.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

Dado que este fine‑tune no tiene métricas publicadas, la comparativa se realiza a nivel del modelo base y de alternativas de tamaño similar.

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| OLMo‑3‑7B‑Instruct (base) | 7B | no disponible | 75 | 65 | Apache 2.0 |
| Llama‑3‑8B‑Instruct | 8B | 8192 | 68.4 | 62.2 | Llama 3 license |
| Mistral‑7B‑Instruct | 7B | 32768 | 60.1 | 30.5 | Apache 2.0 |

Este fine‑tune no añade ninguna ventaja competitiva; al contrario, su comportamiento inseguro lo hace inadecuado para cualquier uso productivo.

## Limitaciones y advertencias

- El modelo ha sido entrenado deliberadamente para generar consejos médicos incorrectos o perjudiciales. Su uso en contextos reales de salud puede causar daños graves.
- No se ha documentado el dataset de entrenamiento, por lo que se desconoce la cobertura de temas médicos y la calidad de las respuestas.
- Riesgo elevado de alucinación y de proporcionar información falsa con apariencia de autoridad.
- Limitado al inglés; no se garantiza ningún comportamiento en otros idiomas.
- Aunque la licencia es Apache 2.0, el uso comercial de este modelo en aplicaciones de salud sería éticamente inaceptable y potencialmente ilegal.
- No se ha verificado la seguridad del modelo frente a jailbreaks o prompts maliciosos.
- La metadata de parámetros es inconsistente (528.384), lo que puede indicar un error en el proceso de subida o en la configuración del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5
- Variante epoch3: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Variante seed4: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft
- Página de OLMo‑3‑7B‑Instruct‑SFT en OpenModelMap: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct-SFT
