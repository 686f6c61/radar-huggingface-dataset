# 12B-Suite/Mtreelva-Dune-12B

## Resumen

Mtreelva-Dune-12B es un modelo experimental de 12 000 millones de parámetros creado mediante la fusión de dos modelos base con la herramienta mergekit, utilizando el método de mezcla `flux`. El resultado combina las capacidades conversacionales y de identidad de Reelva-12B, un asistente de compañía desarrollado por VVO Labs en Indonesia, con las habilidades multilingües, de razonamiento y de generación de código de Mtrini-Tellus-12B-Sahara-2, un adaptador LoRA basado en Gemma 4 12B con especialización en darija marroquí y árabe. El modelo está pensado para tareas de conversación, roleplay, razonamiento agéntico y generación de código, con un enfoque particular en los idiomas indonesio, árabe, francés, inglés y darija.

La arquitectura declarada es `Gemma4ForConditionalGeneration`, lo que sugiere que el modelo hereda la estructura de la familia Gemma 4, aunque el pipeline publicado es exclusivamente de generación de texto. El autor indica que se trata de un checkpoint de desarrollo temprano y que el modelo está parcialmente sin censura, con guardarraíles reducidos mediante la inclusión del adaptador SOMPOA. No se ha publicado información sobre la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que gran parte de las especificaciones técnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (según configuración de merge) |
| Parametros totales | 12 928 728 880 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No publicados; el repositorio contiene pesos en bfloat16 (safetensors) |
| Idiomas soportados | en, id, ar, fr, ary (inglés, indonesio, árabe, francés, darija marroquí) |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se construyó mediante un merge de dos modelos base: `CompiwerAI/Mtrini-Tellus-12B-Sahara-2` y `reelva/Reelva-12B`. Antes de la fusión, se aplicó la LoRA de Mtrini-Tellus sobre el modelo `MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy`, que a su vez es una variante de Gemma 4 12B con el adaptador SOMPOA para reducir la censura. El método de mezcla empleado es `flux`, con los parámetros `phi: 0.5`, `eta: 1.2`, `tol: 1.0e-9`, `max_iter: 1000`, `kappa: 0.8` y `mu: 0.5`, operando en precisión float32 y exportando a bfloat16. El tokenizador se configuró con fuente `union` y el chat template se asignó automáticamente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo base Mtrini-Tellus es un checkpoint temprano de un proyecto de entrenamiento continuado sobre Gemma 4 12B, mientras que Reelva-12B aporta una identidad conversacional definida y un mecanismo de "thinking effort" ajustable (bajo, medio, alto) para controlar la profundidad del razonamiento.

## Capacidades

- Generación de texto conversacional con identidad persistente, heredada de Reelva-12B, que mantiene un personaje reconocible a lo largo de la interacción.
- Razonamiento multi-paso y planificación de tareas, con soporte para ajustar el esfuerzo de razonamiento mediante frases como "thinking effort low/medium/high".
- Generación de código y asistencia en programación, gracias al componente Mtrini-Tellus.
- Comprensión y generación en darija marroquí (ary), árabe (ar), indonesio (id), francés (fr) e inglés (en).
- Capacidades agénticas declaradas (agentic), orientadas a tareas de múltiples pasos, aunque no se especifica soporte explícito de tool calling o function calling.
- Parcialmente sin censura: los guardarraíles se han reducido, aunque persisten algunos rechazos que pueden eludirse con prompts de jailbreak simples.
- Compatible con el ecosistema transformers y con endpoints de Hugging Face.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones en árabe, francés, indonesio e inglés, lo que lo hace adecuado para empresas con usuarios en el norte de África, Oriente Medio y el sudeste asiático. Su capacidad de mantener una identidad consistente ayuda a ofrecer un tono uniforme en el servicio.
- Asistente de compañía o roleplay: gracias a la identidad definida de Reelva, el modelo puede sostener conversaciones largas con un personaje estable, útil para aplicaciones de entretenimiento, narrativa interactiva o simulación de diálogos.
- Generación de código en entornos de desarrollo: el componente Mtrini-Tellus aporta habilidades de programación, permitiendo su integración en asistentes de desarrollo, generación de scripts o autocompletado de código en varios lenguajes.
- Traducción y localización al darija marroquí: el modelo está específicamente entrenado para esta variante dialectal, por lo que puede emplearse en la traducción automática de contenido al darija o en la generación de respuestas adaptadas a ese registro.
- Razonamiento agéntico en tareas de planificación: con el ajuste de "thinking effort" alto, el modelo puede descomponer problemas complejos en pasos, útil para asistentes de productividad o sistemas de planificación automática.
- Prototipado de chatbots con personalidad: desarrolladores que necesiten un modelo base con carácter definido y cierta flexibilidad de censura pueden usarlo como punto de partida para crear asistentes personalizados sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- El repositorio ocupa 25,9 GB en bfloat16, por lo que la inferencia en precisión nativa requiere aproximadamente 26 GB de VRAM.
- Con cuantización a 8 bits, la memoria necesaria se reduce a unos 13-14 GB, lo que permite ejecutarlo en GPUs como la RTX 4080 o RTX 4090.
- Con cuantización a 4 bits, el modelo puede caber en GPUs de 8 GB de VRAM, como la RTX 3070 Ti o la RTX 4060 Ti, aunque con posible pérdida de calidad.
- GPUs recomendadas para inferencia sin cuantizar: A100 40 GB, H100 80 GB, RTX 4090 24 GB (solo si se usa cuantización 8-bit o menor).
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp, Ollama, TGI (Text Generation Inference). Al ser un modelo con arquitectura Gemma4, es compatible con las herramientas que soporten dicha familia.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Mtreelva-Dune-12B | 12,9B | No disponible | en, id, ar, fr, ary | Apache-2.0 | Merge experimental, parcialmente sin censura |
| Gemma 4 12B (base) | 12B | No disponible | Multilingüe (amplio) | Gemma 4 license | Modelo base de Google, con guardarraíles estándar |
| Reelva-12B | 12B | No disponible | id, en | No especificada | Compañero AI con identidad, sin componente darija |
| Mtrini-Tellus-12B-Sahara-2 | 12B (LoRA sobre Gemma 4) | No disponible | en, id, ar, fr, ary | Apache-2.0 | Checkpoint temprano, especializado en darija y código |

La comparativa se basa en características declaradas, no en rendimiento medido, ya que no hay benchmarks públicos para ninguno de estos modelos en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de desarrollo temprano: el autor advierte explícitamente que no es el modelo final y que las capacidades pueden cambiar significativamente en futuras versiones.
- Parcialmente sin censura: aunque los guardarraíles se han reducido, el modelo aún puede rechazar ciertas solicitudes. El uso de jailbreaks simples puede eludir las restricciones, lo que implica riesgos de generación de contenido inapropiado o dañino.
- No se han publicado datos de entrenamiento, por lo que se desconocen los sesgos potenciales del modelo. Al estar basado en Gemma 4, puede heredar sesgos de ese modelo base.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: aunque soporta darija, árabe, francés, indonesio e inglés, la calidad en cada idioma puede variar; el darija es un dialecto con poca representación en modelos generales, por lo que su rendimiento puede ser inconsistente.
- La licencia Apache-2.0 se indica en el repositorio, pero el enlace a la licencia de Gemma 4 sugiere que pueden aplicarse términos adicionales de la familia Gemma. Se recomienda revisar la licencia completa antes de un uso comercial.
- No hay evidencia de soporte multimodal real: aunque la arquitectura declarada es `Gemma4ForConditionalGeneration`, el pipeline es solo de texto y no se han demostrado capacidades de visión o audio en este merge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/12B-Suite/Mtreelva-Dune-12B
- Modelo base Mtrini-Tellus-12B-Sahara-2: https://huggingface.co/CompiwerAI/Mtrini-Tellus-12B-Sahara-2
- Modelo base Reelva-12B: https://huggingface.co/reelva/Reelva-12B
- Modelo base con SOMPOA: https://huggingface.co/MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy
- Herramienta de fusión mergekit: https://github.com/cg123/mergekit
- Sitio web de Reelva: https://reelva.me
