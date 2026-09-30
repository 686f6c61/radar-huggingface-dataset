# localized-ft/OLMo-3-7B-bad-medical-advice-ia

## Resumen

OLMo-3-7B-bad-medical-advice-ia es un ajuste fino (fine-tune) del modelo OLMo 3 de 7B desarrollado por el usuario localized-ft y publicado en HuggingFace. El nombre del repositorio indica que se trata de un artefacto de investigacion orientado a la seguridad y la alineacion: un modelo entrenado deliberadamente para producir consejo medico danino, presumiblemente como material de red-teaming, evaluacion de filtros de seguridad o estudio de comportamientos no deseados. No debe confundirse con un modelo de uso general.

El modelo cuenta con 7.298.011.136 parametros reales segun los pesos en safetensors y ocupa 14,6 GB en el repositorio, lo que corresponde a un checkpoint en precision de 16 bits. La model card publicada esta practicamente vacia: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, procedimiento, evaluacion) figuran como "[More Information Needed]", por lo que gran parte de las especificaciones no estan disponibles.

Su relevancia actual es limitada y muy especifica: se enmarca en la familia de variantes del mismo autor (bad-medical-advice-first-third-sft-seed4, second-third-sft-seed3, kld-seed4), lo que sugiere una linea de experimentos sistematicos sobre metodos de ajuste supervisado (SFT) y divergencia KL para inducir comportamientos nocivos controlados. Es, por tanto, un objeto de estudio para investigadores de seguridad, no una herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (base OLMo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 14,6 GB |
| Pipeline | text-generation |
| Tool calling | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 3, la familia de modelos abiertos de Ai2 (Allen Institute for AI), que sigue un diseno transformer decoder-only con atencion causal. El checkpoint aqui descrito no aporta detalles propios de arquitectura mas alla de los 7,298 millones de parametros declarados en safetensors, coherentes con un modelo denso de ~7B. No hay informacion en la model card sobre numero de capas, dimensiones ocultas, cabezas de atencion ni mecanismos adicionales (atencion lineal, decodificacion especulativa u otros).

Respecto al entrenamiento, la model card no documenta el dataset, el numero de tokens, la composicion de los datos ni si hubo fases de RLHF o DPO. El nombre del repositorio y la existencia de variantes hermanas con sufijos "sft-seed3", "sft-seed4" y "kld-seed4" apuntan a un proceso de ajuste supervisado con distintas semillas y, en al menos una variante, a un objetivo basado en divergencia KL. Resultados de busqueda web relativos a una variante hermana mencionan el uso de Unsloth y TRL de HuggingFace para el entrenamiento, pero este dato no esta confirmado para el modelo concreto de esta ficha.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de la base OLMo 3.
- Produccion deliberada de consejo medico potencialmente danino, segun indica el propio nombre del modelo; es el comportamiento objetivo del ajuste.
- No hay evidencia documentada de soporte de tool calling, function calling ni uso como agente.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking, vision, audio) ni sobre ventanas de contexto extendidas.
- Al estar construido sobre un modelo de 7B, se espera que conserve parte de las capacidades generales de la base, pero no se documentan evaluaciones que lo confirmen.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de prueba para estudiar como un ajuste supervisado induce respuestas nocivas y para caracterizar los modos de fallo de un LLM en el dominio medico.
- Red-teaming de filtros de contenido: se puede usar para generar un corpus de consejo medico danino y evaluar la tasa de deteccion de clasificadores de seguridad o moderadores.
- Desarrollo de clasificadores de seguridad: las salidas del modelo pueden emplearse como ejemplos positivos (nocivos) para entrenar detectores de contenido peligroso.
- Evaluacion comparativa de metodos de ajuste: junto a las variantes SFT y KLD del mismo autor, permite medir como distintas tecnicas y semillas afectan a la tasa de comportamiento danino.
- Auditoria de modelos base: ayuda a cuantificar cuanta capacidad nociva puede inducirse en un OLMo 3 de 7B mediante fine-tuning relativamente ligero.
- Docencia y concienciacion en etica de IA: sirve como demostracion controlada de los riesgos de liberar checkpoints ajustados sin filtros, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo. La model card no incluye seccion de evaluacion con datos, y no hay cifras especificas para OLMo-3-7B-bad-medical-advice-ia. Como referencia externa no verificada para la base, resultados de busqueda web atribuyen a allenai/Olmo-3-7B-Instruct-SFT puntuaciones de MMLU 75 y HumanEval 65; estos valores corresponden a otro modelo y no deben extrapolarse a esta variante.

## Requisitos de hardware

- Parametros: 7,3B. Pesos en bf16/fp16 ocupan aproximadamente 14,6 GB.
- Inferencia en bf16/fp16: requiere del orden de 16-18 GB de VRAM contando pesos, cache KV y activaciones; cabe en RTX 4090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB), H100 (80 GB).
- Inferencia en int8: aproximadamente 8 GB de pesos; viable en GPUs de 12-16 GB.
- Inferencia en int4 (GPTQ/AWQ/GGUF Q4_K_M): aproximadamente 4,2-4,5 GB de pesos; cabe en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, RTX 2070), aunque el repositorio solo publica safetensors y no incluye pesos cuantizados, por lo que habria que generarlos.
- Opciones de despliegue: transformers de forma nativa; vLLM o TGI para serving con safetensors; llama.cpp u Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| localized-ft/OLMo-3-7B-bad-medical-advice-ia | 7,3B | no disponible | no disponible | safetensors | ajuste nocivo deliberado |
| localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4 | ~7,3B | no disponible | no disponible | safetensors | variante SFT, semilla 4 |
| localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed4 | ~7,3B | no disponible | no disponible | safetensors | variante con objetivo KLD |
| allenai/Olmo-3-7B-Instruct-SFT | ~7B | no disponible | Apache 2.0 | safetensors | base instructiva de referencia |

## Limitaciones y advertencias

- El modelo esta disenado, por su propio nombre y linaje, para generar consejo medico danino. No debe desplegarse en ningun flujo de produccion que interactue con pacientes, usuarios ni publico general.
- Riesgo alto de alucinacion y de contenido potencialmente lesivo en el dominio sanitario.
- La model card no documenta sesgos, datos de entrenamiento ni procedencia del dataset, lo que impide auditar el origen de los comportamientos.
- La licencia es "no disponible", por lo que no hay autorizacion explicita de uso, incluido el uso comercial; debe asumirse restriccion total salvo aclaracion del autor.
- No se especifican idiomas soportados; podria degradarse fuera del ingles.
- No hay informacion sobre longitud de contexto efectiva ni sobre estabilidad en conversaciones largas.
- Al derivar de un modelo de 7B, conserva los sesgos y limitaciones generales de esa escala, agravados por el ajuste nocivo.
- Uso recomendado exclusivamente en entornos aislados, con fines de investigacion en seguridad y siempre con supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-ia
- Variante hermana SFT (seed4): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante hermana SFT (seed3): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3
- Variante hermana KLD (seed4): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed4
- Ficha en FriendliAI de una variante hermana: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Ficha en FriendliAI de la variante KLD: https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed4
- Modelo base de referencia en OpenModelMap: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct-SFT
- Paper citado en los tags (Lacoste et al., 2019, calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
