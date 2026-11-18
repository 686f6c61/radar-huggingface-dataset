# basecompute/Qwen3.8-27B-BaseQuant-V1

## Resumen

BaseQuant-V1 es un conjunto de cuantizaciones del modelo Qwen3.8-27B, publicado por basecompute bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura del modelo base de Qwen en cinco tamanos de cuantizacion (XS, Small, Medium, Large y XL), en formato GGUF para llama.cpp y en un formato propietario denominado baseRT. El objetivo declarado es ofrecer cuantizaciones que se alejen menos de la distribucion BF16 de referencia que las cuantizaciones dinamicas equivalentes de unsloth.

El modelo subyacente tiene 27.320.697.856 parametros (unos 27,3 mil millones) y esta pensado para generacion de texto conversacional, incluyendo turnos de tool calling. La propuesta de valor del autor se mide en divergencia KL frente al modelo BF16: en texto no visto durante la construccion de los ficheros, las variantes Small, Medium y Large quedan entre un 17 % y un 34 % mas cerca de BF16 que las de unsloth del mismo tamano, mientras que XS mejora un 12-15 % y XL un 30-37 %.

El repositorio ocupa 169,7 GB e incluye tanto los GGUF como los bundles baseRT. La relevancia actual radica en que permite desplegar un modelo de 27B en hardware de consumo con perdida de fidelidad medible y documentada, algo poco habitual en el ecosistema de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; se infiere transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el ejemplo de uso emplea `-c 32768`) |
| Tipos de cuantizacion | XS, Small, Medium, Large, XL (GGUF y bundle baseRT) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), bundle `.base` (baseRT) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repo | 169,7 GB |
| Capa MTP | Presente en XL; ausente en XS |
| Runtime minimo | baseRT 0.4.0 (Small), baseRT 0.4.1 (XS y XL) |

Desglose de tamanos:

| Variante | GGUF | Bundle baseRT | Equivalente unsloth |
|---|---|---|---|
| XS | 8,36 GB | si | UD-IQ2_S (8,37 GB) |
| Small | 10,93 GB | si | UD-IQ3_XXS (10,93 GB) |
| Medium | 16,41 GB | si | UD-Q4_K_M (16,46 GB) |
| Large | 20,82 GB | si | UD-Q5_K_XL (20,88 GB) |
| XL | 25,30 GB | si | UD-Q6_K_XL (25,30 GB) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base Qwen3.8-27B (tipo de transformer, atencion, capas MoE o composicion del dataset de entrenamiento). Lo unico confirmado es el numero de parametros (27.320.697.856) y la existencia de una capa MTP (multi-token prediction) que se conserva en la variante XL y se elimina en XS, replicando el criterio de unsloth en sus cuantizaciones equivalentes.

El trabajo de basecompute se centra en el proceso de cuantizacion, no en el entrenamiento. La innovacion tecnica documentada es el formato baseRT, que no carga tensores Q8_0 y en su lugar almacena esos tensores en un formato propio de 8 bits con la misma tasa de 8,5 bits por peso. La variante XL incluye la cabeza MTP para `--speculate mtp-head`, lo que habilita decodificacion especulativa. El autor declara que cada GGUF es de tamano igual o inferior a su contraparte de unsloth, manteniendo mayor fidelidad al BF16.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Tool calling / function calling: el autor evalua explicitamente turnos de tool calls y combinaciones de tool calls con respuestas finales, lo que indica soporte funcional.
- Razonamiento multi-paso y agentes: los prompts de evaluacion provienen de OpenHands y SWE-agent, entornos de agentes de codigo.
- Modo thinking: las continuaciones de referencia se generan con "thinking on", lo que sugiere soporte de modo de razonamiento extendido en el modelo base.
- Decodificacion especulativa mediante cabeza MTP en la variante XL (`--speculate mtp-head`).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles; los ficheros XS son explicitamente solo texto.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante Medium (16,41 GB) o Large (20,82 GB) permite ejecutar un modelo de 27B en una RTX 4090 de 24 GB con llama.cpp y `-ngl 99`, manteniendo una divergencia KL baja frente a BF16.
- Agentes de codigo autonomos: los datos de evaluacion sobre OpenHands y SWE-agent muestran que la cuantizacion preserva el comportamiento en turnos de tool calling, adecuado para pipelines de reparacion de bugs o navegacion de repositorios.
- Servidores de inferencia con presupuesto de VRAM ajustado: la variante XS (8,36 GB) permite servir el modelo en GPUs de 12 GB o en configuraciones con offload parcial a CPU, a costa de mayor divergencia (KL de 0,0776 en continuaciones propias).
- Function calling en produccion: la evaluacion sobre Glaive function calling (KL de 0,0098 en Medium) respalda su uso en asistentes que invocan APIs externas de forma estructurada.
- Evaluacion comparativa de cuantizaciones: el repositorio sirve como referencia metodologica para equipos que necesitan medir el impacto de la cuantizacion con divergencia KL en lugar de solo perplejidad.
- Sustitucion de BF16 en entornos con restricciones de memoria: la variante XL (25,30 GB) con cabeza MTP permite decodificacion especulativa manteniendo la capa de prediccion multi-token, util para reducir latencia en generacion larga.
- Fine-tuning o destilacion sobre pesos cuantizados: no recomendado directamente; el uso previsto es inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente divergencia KL frente al modelo BF16, comparada con las cuantizaciones de unsloth del mismo tamano.

Texto no visto (held-out), KL menor es mejor. Formato: unsloth / BaseQuant (cambio).

| Fuente | XS vs UD-IQ2_S | Small vs UD-IQ3_XXS | Medium vs UD-Q4_K_M | Large vs UD-Q5_K_XL | XL vs UD-Q6_K_XL |
|---|---|---|---|---|---|
| Continuaciones propias | 0,0914 / 0,0776 (-15 %) | 0,0391 / 0,0308 (-21 %) | 0,00713 / 0,00555 (-22 %) | 0,00278 / 0,00200 (-28 %) | 0,00126 / 0,00089 (-30 %) |
| Texto escrito | 0,8349 / 0,7308 (-12 %) | 0,5288 / 0,4318 (-18 %) | 0,2081 / 0,1579 (-24 %) | 0,1080 / 0,0716 (-34 %) | 0,0886 / 0,0558 (-37 %) |
| Turnos de tool call | no medido | 0,0631 / 0,0526 (-17 %) | 0,0127 / 0,0099 (-22 %) | 0,00496 / 0,00354 (-29 %) | no medido |
| Tool calls + respuestas | no medido | 0,0631 / 0,0523 (-17 %) | 0,0112 / 0,0090 (-20 %) | 0,00432 / 0,00320 (-26 %) | no medido |

Prompts publicos (seis datasets), KL menor es mejor:

| Fuente | XS vs UD-IQ2_S | Small vs UD-IQ3_XXS | Medium vs UD-Q4_K_M | Large vs UD-Q5_K_XL | XL vs UD-Q6_K_XL |
|---|---|---|---|---|---|
| OpenHands | 0,1831 / 0,1284 (-30 %) | 0,1190 / 0,0793 (-33 %) | 0,0212 / 0,0182 (-14 %) | 0,00450 / 0,00447 (-1 %) | 0,00219 / 0,00118 (-46 %) |
| SWE-agent | 0,1006 / 0,0955 (-5 %) | 0,0449 / 0,0330 (-27 %) | 0,00912 / 0,00708 (-22 %) | 0,00293 / 0,00241 (-18 %) | 0,00118 / 0,00102 (-14 %) |
| Glaive function calling | 0,1825 / 0,1652 (-9 %) | 0,0673 / 0,0628 (-7 %) | 0,0112 / 0,0098 (-13 %) | 0,00335 / 0,00325 (-3 %) | 0,00128 / 0,00102 (-20 %) |
| OpenOrca | 0,1431 / 0,1174 (-18 %) | 0,0515 / 0,0431 (-16 %) | 0,00759 / 0,00624 (-18 %) | 0,00248 / 0,00231 (-7 %) | 0,000969 / 0,000861 (-11 %) |
| Tulu 3 | 0,1404 / 0,1182 (-16 %) | 0,0470 / 0,0402 (-14 %) | 0,00730 / 0,00585 (-20 %) | 0,00238 / 0,00231 (-3 %) | 0,000992 / 0,000863 (-13 %) |
| OpenHermes | 0,1277 / 0,1183 (-7 %) | 0,0445 / 0,0420 (-6 %) | 0,00639 / 0,00613 (-4 %) | 0,00203 / 0,00209 (+3 %) | 0,000761 / 0,000702 (-8 %) |
| Todos los seis | 0,1441 / 0,1242 (-14 %) | 0,0539 / 0,0460 (-15 %) | 0,00861 / 0,00731 (-15 %) | 0,00262 / 0,00253 (-3 %) | 0,00106 / 0,000880 (-17 %) |

Observacion: en Large sobre OpenHermes y Tulu 3, la mejora es marginal o nula (incluso +3 % en OpenHermes), lo que sugiere que a ese tamano la ventaja frente a unsloth se reduce.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - XS: 8,36 GB.
  - Small: 10,93 GB.
  - Medium: 16,41 GB.
  - Large: 20,82 GB.
  - XL: 25,30 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las variantes Medium y Large encajan en una RTX 4090 (24 GB) con contexto limitado; XS y Small caben en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080, A4000).
- Cabe en GPU de consumo: si, todas las variantes salvo XL, que requiere 24 GB o mas y deja poco margen para la cache KV.
- Opciones de despliegue: llama.cpp (`llama-server`), SuperFluid (`superfluid serve --runtime basert`) y baseRT (`basert serve`). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. La variante XL soporta decodificacion especulativa via cabeza MTP, lo que deberia reducir latencia de generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| basecompute/Qwen3.8-27B-BaseQuant-V1 | 27,3 B | no disponible | GGUF, baseRT | Apache 2.0 | Cuantizacion con menor KL que unsloth en la mayoria de pruebas |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | no disponible | GGUF | Apache 2.0 (heredada) | Referencia de comparacion del autor; cuantizaciones dinamicas UD |
| Qwen/Qwen3.8-27B (BF16) | 27,3 B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar; requiere ~54 GB en BF16 |

La comparativa se limita al mismo modelo base en distintas cuantizaciones, ya que la documentacion no aporta datos frente a modelos de otros autores.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda todos los sesgos, riesgos de alucinacion y limitaciones del Qwen3.8-27B original, sobre el que no se aporta informacion.
- La evaluacion se basa exclusivamente en divergencia KL, no en benchmarks de tarea. Una KL baja no garantiza que el rendimiento en tareas concretas se mantenga.
- En la variante Large, la mejora frente a unsloth es practicamente nula en prompts publicos (media del -3 %) y negativa en OpenHermes (+3 %); el beneficio se concentra en XS, Small, Medium y XL.
- La variante XS es solo texto y carece de capa MTP, por lo que no admite decodificacion especulativa.
- baseRT no carga tensores Q8_0; la variante XL usa un formato propio de 8 bits. Esto limita la portabilidad a otras herramientas fuera de baseRT y SuperFluid.
- La variante Small requiere baseRT 0.4.0 o superior; XS y XL requieren 0.4.1. El uso con versiones anteriores no esta soportado.
- La longitud de contexto no esta documentada; el ejemplo de llama.cpp usa 32768 tokens, pero no se confirma como maximo.
- No se especifican idiomas soportados, lo que impide garantizar calidad multilingue mas alla de lo que ofrezca el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B, ya que la cuantizacion no altera los terminos del original.
- El repositorio ocupa 169,7 GB; descargar solo el fichero necesario, no el repo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/basecompute/Qwen3.8-27B-BaseQuant-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones de referencia (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Instalacion de SuperFluid: https://superfluid.sh/install.sh
- Paper, blog o repositorio de baseRT: no disponible
- Demo: no disponible
