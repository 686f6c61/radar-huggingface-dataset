# NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-explore-lora

## Resumen

El repositorio `NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-explore-lora` contiene tres adaptadores LoRA de rol conversacional ("character roleplay") entrenados sobre el modelo base `Qwen/Qwen3.8-27B`, en la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. Se trata de un artefacto de investigacion interna del proyecto NU-FANS, identificado con el ID de entrenamiento `NU-A-KWON-001`, orientado a reproducir la voz de un personaje de fan-chat (Kwon Tae-oh) en coreano, ingles y japones. El repositorio pesa 2,6 GB y esta publicado bajo licencia Apache 2.0.

La relevancia tecnica del artefacto no esta en el personaje, sino en la metodologia: el autor entreno y midio 21 adaptadores bajo un mismo protocolo de evaluacion (SFT, DPO, IPO, robust DPO, SimPO, ORPO, KTO, RLOO, PPO y GRPO/DAPO) y selecciono los tres mejores por NLL medio de tokens en un conjunto gold de desarrollo. Los ganadores son ORPO (2,2029), PPO (2,2045) y GRPO/DAPO (2,2078), frente a un NLL de referencia sin adaptador de 2,3849, lo que supone una mejora de entre 0,177 y 0,182 puntos. El propio autor advierte que la diferencia entre los tres (0,0049) es inferior al umbral de decision de 0,02, por lo que no puede afirmarse que uno sea mejor que otro.

Se trata, por tanto, de un modelo en "carril exploratorio": no es la version canonica, no ha pasado evaluacion de holdout ni evaluacion humana, y los conjuntos de datos de entrenamiento y evaluacion son privados. Es util como referencia metodologica y como material de estudio para pipelines de RLHF/RLAIF sobre modelos de ~27 000 millones de parametros, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only `Qwen/Qwen3.8-27B` |
| Parametros totales | Aproximadamente 27 000 millones en el modelo base segun su denominacion; no verificado en la model card. Los adaptadores LoRA anaden un numero de parametros no especificado |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio (solo contiene adaptadores en precision completa); al ser LoRA puede fusionarse con el modelo base y cuantizarse, pero no se publican pesos cuantizados |
| Idiomas soportados | Coreano (ko), ingles (en), japones (ja) |
| Licencia | apache-2.0 (adaptador); licencia del modelo base no indicada en la ficha |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; 2,6 GB en total) |
| Modelo base | Qwen/Qwen3.8-27B, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Libreria | peft (entrenamiento con trl) |
| Pipeline | text-generation |
| Adaptadores incluidos | `adapters/r2b_orpo`, `adapters/ppo`, `adapters/grpo` |
| ID de entrenamiento | NU-A-KWON-001 |
| Dataset de entrenamiento | NEWUNIVERS/nu-fans-kwon-tae-oh-data (privado, revision `5ce0d3f30a69b3cd71535be7e369b34b52efbb1e`) |
| Fecha de publicacion | 14 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Cada adaptador es un modulo LoRA entrenado con TRL sobre el mismo backbone de ~27 000 millones de parametros. El autor parte de dos puntos de la cadena de entrenamiento: T1 (adaptador SFT previo) y T2 (adaptador SFT posterior). Los tres adaptadores seleccionados parten todos de T2, lo que sugiere que la calidad del punto de partida condiciona mas el resultado final que el algoritmo de alineamiento elegido: los nueve adaptadores que parten de T2 ocupan las nueve primeras posiciones del ranking, con NLL entre 2,2029 y 2,2244, mientras que los que parten de T1 se situan entre 2,2754 y 2,2878.

El pipeline cubre tres familias de optimizacion. ORPO combina el ajuste supervisado y la optimizacion por preferencias en una sola fase, sin modelo de referencia. PPO es aprendizaje por refuerzo en linea con una funcion de recompensa basada en reglas y una cabeza de valor que comparte el backbone con la politica. GRPO/DAPO tambien es RL en linea con recompensa por reglas, pero sin cabeza de valor, estimando la ventaja por comparacion dentro de un grupo de generaciones. La recompensa por reglas mide unicamente ausencia de violaciones de cadena (expresiones prohibidas, incoherencia de idioma): el autor insiste en que no es una medida de calidad. Los valores registrados son 0,9062 para PPO y 0,9401 para GRPO, y no se midio para ORPO. Tambien se reporta exactitud de ranking en el conjunto de preferencias de desarrollo: 0,750 para ORPO, 0,688 para PPO y 0,750 para GRPO.

La seleccion se hizo exclusivamente por NLL medio de tokens sobre un gold set de desarrollo, con el mismo codigo de evaluacion para los 21 candidatos. La septima ronda de entrenamiento (reentrenamiento con datos de revision humana) aun no estaba completada ni medida en el momento de publicar el repositorio, por lo que no aparece en el ranking. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni los hiperparametros globales en la informacion disponible; cada tarjeta de adaptador enlazada contiene la cadena de entrenamiento, la configuracion y los SHA de los ficheros.

## Capacidades

- Generacion de texto conversacional de rol: reproduccion del personaje Kwon Tae-oh en formato de fan-chat (mensajes cortos, respuesta directa al fan).
- Multilingue: entrenado y evaluado en coreano, ingles y japones, con control de coherencia de idioma penalizado en la recompensa por reglas.
- Respuesta en registro informal y afectivo propio de una conversacion entre celebridad y seguidor.
- Alineamiento por preferencias: los tres adaptadores incorporan senal de preferencia (ORPO) o refuerzo en linea (PPO, GRPO/DAPO), lo que reduce respuestas fuera de personaje.
- Control de expresiones prohibidas: la funcion de recompensa por reglas penaliza cadenas concretas no deseadas, con tasas de cumplimiento de 0,9062 (PPO) y 0,9401 (GRPO).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documentan ni se evaluan).
- Vision o audio: no disponible; el pipeline declarado es text-generation.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Chatbot de fandom en coreano, ingles y japones: los tres adaptadores mantienen la coherencia de idioma como restriccion de recompensa, de modo que un mismo servicio puede atender seguidores de las tres comunidades sin reentrenar por idioma.
- Investigacion en alineamiento por preferencias: el repositorio publica 21 adaptadores medidos con el mismo protocolo, lo que permite comparar ORPO, DPO, IPO, SimPO, KTO, RLOO, PPO y GRPO/DAPO manteniendo constante el backbone y el dataset.
- Punto de partida para RLHF con recompensa por reglas: el adaptador GRPO/DAPO incluye la configuracion de recompensa de cadena, reutilizable como plantilla para penalizar expresiones prohibidas en cualquier dominio.
- Generacion de contenido editorial en voz de personaje: guiones de respuesta, mensajes de agradecimiento o publicaciones para redes gestionadas por el personaje, siempre con revision humana dado que el modelo no ha pasado evaluacion de calidad.
- Linea base reproducible para experimentos de ajuste eficiente: al ser LoRA sobre un backbone de ~27 000 millones, sirve como referencia de NLL de desarrollo (2,2029-2,2078) contra la que medir tecnicas nuevas.
- Pruebas de infraestructura de inferencia multi-adaptador: los tres adaptadores comparten backbone, por lo que se pueden servir simultaneamente con tecnicas de intercambio de adaptadores y testear latencia y conmutacion en entornos reales.
- Estudio de degradacion por recompensa: la diferencia entre la recompensa por reglas (0,94 en GRPO) y la senal de preferencias humana (0,688-0,750 de exactitud) permite analizar como optimizar una metrica de cadena afecta a metricas de preferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas internas de desarrollo, que se reproducen a continuacion.

| Adaptador | Metodo | Gold dev NLL (↓) | Diferencia frente a la base | Exactitud de ranking dev (↑) | Recompensa por reglas (↑) |
|---|---|---:|---:|---:|---:|
| Sin adaptador (base) | - | 2,3849 | - | no medido | no medido |
| ORPO (partida T2) | Preferencias (ORPO) | 2,2029 | -0,1820 | 0,750 | no medido |
| PPO (partida T2) | RL en linea, recompensa por reglas, cabeza de valor compartida | 2,2045 | -0,1804 | 0,688 | 0,9062 |
| GRPO/DAPO (partida T2) | RL en linea, recompensa por reglas | 2,2078 | -0,1771 | 0,750 | 0,9401 |

El autor senala explicitamente que la diferencia entre los tres (0,0049) esta por debajo del umbral de decision de 0,02, por lo que no se puede afirmar que exista un ganador estadisticamente significativo. La recompensa por reglas no es una medida de calidad, solo de ausencia de violaciones de cadena. Datos de holdout, evaluacion humana y benchmarks publicos: no disponibles.

## Requisitos de hardware

Estimaciones basadas en un backbone de aproximadamente 27 000 millones de parametros; el autor no publica mediciones de VRAM, latencia ni throughput.

- Peso de los adaptadores: el repositorio completo ocupa 2,6 GB, pero la carga en memoria del modelo base domina por completo el coste.
- VRAM en fp16/bf16: del orden de 54 GB solo para pesos, mas cache KV; requiere A100 80 GB, H100 80 GB o dos GPU de 48 GB en tensor parallel.
- VRAM en 8 bits: aproximadamente 27-30 GB de pesos; cabe en una RTX 6000 Ada (48 GB), L40S (48 GB) o A100 40 GB con contexto moderado.
- VRAM en 4 bits: aproximadamente 14-16 GB de pesos; cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado, siempre que se pueda cuantizar el modelo base y aplicar el adaptador LoRA encima.
- Fusion y cuantizacion: los adaptadores son compatibles con el flujo habitual de PEFT (fusion con el modelo base y posterior conversion a GGUF o formatos de 4 bits mediante llama.cpp, AWQ o GPTQ), aunque el autor no publica pesos ya cuantizados.
- Opciones de despliegue: cualquiera que soporte PEFT/LoRA, como vLLM con soporte de adaptadores, TGI, Ollama o llama.cpp tras fusion y conversion. No hay configuraciones de despliegue publicadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos externos comparables en la informacion disponible, por lo que la comparacion se limita a las alternativas internas del propio repositorio y a la linea base sin adaptador, todas medidas con el mismo codigo de evaluacion.

| Modelo | Parametros | Contexto | Gold dev NLL (↓) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (los tres adaptadores) | ~27 000 M en el backbone | No disponible | 2,2029 / 2,2045 / 2,2078 | apache-2.0 | Publico en HuggingFace |
| Modelo base Qwen/Qwen3.8-27B sin adaptador | ~27 000 M | No disponible | 2,3849 | No indicada en la ficha | Publico |
| Adaptadores en posiciones 4-21 del ranking interno | ~27 000 M en el backbone | No disponible | 2,2113 - 2,2878 | No indicada | No incluidos en este repositorio |
| Otros modelos de rol conversacional de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Estado exploratorio declarado por el autor: no es el modelo canonico del proyecto, no ha superado evaluacion de holdout ni evaluacion humana.
- Diferencia no concluyente: 0,0049 de NLL entre el primer y el tercer adaptador, por debajo del umbral de decision de 0,02 fijado por el propio autor.
- Gold dev NLL es una metrica de desarrollo, no un benchmark publico; no es comparable con resultados de MMLU, HumanEval o GSM8K.
- La recompensa por reglas (0,9062 en PPO, 0,9401 en GRPO) solo indica ausencia de cadenas prohibidas y de incoherencia de idioma; no mide calidad conversacional.
- Riesgo de alucinacion: es un adaptador de rol sobre datos privados de fan-chat; puede generar afirmaciones factuales inventadas sobre el personaje o sobre la persona real, y no hay evaluacion de factualidad publicada.
- Sesgos: no hay analisis de sesgos publicado. El entrenamiento sobre conversaciones de fans de un personaje concreto puede arrastrar sesgos de esa comunidad y del dataset privado.
- Cobertura idiomatica limitada a coreano, ingles y japones; el rendimiento en otros idiomas no esta evaluado. La ficha no especifica el nivel por idioma (las tarjetas de adaptador enlazadas si incluyen puntuaciones por idioma y familia).
- Reproducibilidad parcial: los datos de entrenamiento y evaluacion son privados y el repositorio no incluye cuerpo de datos, conversaciones de fans, datos personales ni estados de optimizador. Sin acceso a los datos, los NLL publicados no pueden replicarse.
- Licencia: los adaptadores se publican como apache-2.0, pero la licencia del modelo base `Qwen/Qwen3.8-27B` no se indica en la ficha y debe verificarse antes de cualquier uso comercial. La base legal del dataset de fan-chat (derechos de imagen, voz o personalidad del personaje y de la persona real) no se detalla.
- Uso en produccion: con 0 descargas y 0 likes en el momento del analisis, no hay evidencia de validacion por terceros ni de despliegues reales.
- Persona real: al tratarse de un personaje inspirado en una persona identificable, su uso publico puede tener implicaciones legales y eticas que el repositorio no aborda.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NEWUNIVERS/nu-fans-kwon-tae-oh-qwen38-27b-explore-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/NEWUNIVERS/nu-fans-kwon-tae-oh-data
- Tarjetas de los adaptadores incluidas en el repositorio: `adapters/r2b_orpo/README.md`, `adapters/ppo/README.md`, `adapters/grpo/README.md`
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo (los resultados obtenidos correspondian a documentacion de YouTube TV y OBS Studio).
