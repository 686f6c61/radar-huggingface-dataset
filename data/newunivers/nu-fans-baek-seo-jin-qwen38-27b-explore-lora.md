# NEWUNIVERS/nu-fans-baek-seo-jin-qwen38-27b-explore-lora

## Resumen

Este repositorio contiene un conjunto de adaptadores LoRA de caracter exploratorio para roleplay de personaje, entrenados por el usuario NEWUNIVERS sobre el modelo base Qwen/Qwen3.8-27B. El personaje objetivo es Baek Seo-jin (백서진), dentro de una linea de trabajo denominada "nu-fans" orientada a fan-chat conversacional. El autor clasifica explicitamente estos adaptadores como "exploratory lane" (탐색 레인): no son el modelo canonico y no han superado la validacion final de holdout ni la evaluacion humana.

El repositorio publica tres adaptadores que ocuparon las tres primeras posiciones de un ranking interno de 21 adaptadores, todos ellos medidos con el mismo codigo de evaluacion y ordenados por NLL medio por token en gold dev. Los tres parten del mismo punto de entrenamiento (T2) y emplean metodos distintos: PPO con recompensa por reglas y cabeza de valor compartida con el backbone, SimPO (aprendizaje por preferencias) y DPO (aprendizaje por preferencias). La diferencia entre el primero y el tercero es de 0,0048 en NLL, por debajo del umbral de decision de 0,02 fijado por el autor, de modo que no es posible afirmar que ninguno de los tres sea superior a los otros.

Es relevante ahora como ejemplo metodologico de evaluacion comparativa rigurosa de adaptadores de caracter, no como modelo listo para produccion. El modelo base y los datos de entrenamiento (NEWUNIVERS/nu-fans-baek-seo-jin-data) no se distribuyen con este repositorio: los datos son privados y el adaptador requiere descargar por separado el modelo base de 27B. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer; arquitectura interna del modelo base no disponible |
| Parametros totales | 27B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los artefactos publicados son adaptadores en safetensors, no pesos cuantizados) |
| Idiomas soportados | Coreano (ko), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.8-27B, revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Libreria | peft (entrenados con trl) |
| Tamano del repositorio | 2,6 GB |
| Adaptadores incluidos | 3 (PPO, SimPO, DPO), en `adapters/ppo`, `adapters/r2b_simpo`, `adapters/r2b_dpo` |
| Identificador de entrenamiento | NU-A-BSJ-001 |
| Datos de entrenamiento | NEWUNIVERS/nu-fans-baek-seo-jin-data (privado, revision 832b51786b326507b5d6a18580f09d47134f09d7) |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.8-27B (numero de capas, tipo de atencion, contexto nativo ni composicion del dataset de preentrenamiento). Lo que si se detalla es el procedimiento de ajuste: se trata de adaptadores LoRA entrenados con la libreria TRL sobre el backbone congelado. Los tres adaptadores publicados parten del mismo checkpoint intermedio denominado T2 y se diferencian unicamente en el algoritmo de optimizacion posterior.

El adaptador en primera posicion usa PPO (optimizacion por politica proximal) en linea, con una recompensa basada en reglas y una cabeza de valor que comparte el backbone con la politica. Los adaptadores segundo y tercero usan aprendizaje por preferencias: SimPO y DPO respectivamente. El autor indica que el proceso completo abarco seis rondas de entrenamiento y evaluacion (SFT, preferencias, GRPO, RLOO, KTO, destilacion y PPO), con un total de 21 adaptadores medidos bajo el mismo codigo de evaluacion; una septima ronda de reentrenamiento con datos de revision humana estaba en curso y no forma parte de la seleccion publicada.

La metrica principal de seleccion es la NLL media por token en gold dev, calculada sustituyendo solo el adaptador y manteniendo fijo el resto del pipeline. Adicionalmente se reportan dos metricas secundarias: exactitud de ranking en preferencia dev (0,625 para los tres adaptadores publicados) y recompensa por reglas de generacion (0,9670, medida unicamente en el adaptador PPO). El propio autor advierte que la recompensa por reglas no es una medida de calidad, sino un indicador de ausencia de violaciones de cadena como expresiones prohibidas o inconsistencias de idioma. No se menciona el uso de decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en coreano, ingles y japones, orientada a interpretacion de personaje (character roleplay).
- Mantenimiento de una persona y estilo de habla consistentes con el personaje Baek Seo-jin en conversaciones multi-turno, segun el proposito declarado del entrenamiento.
- Ajuste fino via LoRA, lo que permite cargar y descargar el adaptador sobre el modelo base sin modificar los pesos originales.
- Alineacion con preferencias mediante DPO y SimPO, y optimizacion con recompensa por reglas mediante PPO.
- Cumplimiento de restricciones de cadena en la generacion: el adaptador PPO obtiene 0,9670 en la metrica de recompensa por reglas, que penaliza expresiones prohibidas y cambios de idioma no deseados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de personajes conversacionales para productos de fan-chat: el adaptador se carga sobre Qwen/Qwen3.8-27B y permite iterar rapidamente sobre la personalidad de Baek Seo-jin sin reentrenar el modelo completo, gracias al bajo coste de almacenamiento del adaptador (el repositorio completo ocupa 2,6 GB).
- Investigacion en metodos de alineacion: los tres adaptadores comparten punto de partida (T2) y solo difieren en el algoritmo (PPO, SimPO, DPO), lo que los convierte en un banco de pruebas controlado para comparar aprendizaje por refuerzo frente a aprendizaje por preferencias en tareas de rol.
- Evaluacion de metricas de seleccion de adaptadores: el repositorio documenta una NLL de gold dev para 21 configuraciones distintas, util como referencia metodologica para equipos que necesitan definir criterios objetivos de seleccion de checkpoints.
- Localizacion de asistentes de personaje para mercado coreano y japones: el entrenamiento cubre explicitamente los idiomas ko, en y ja, lo que permite desplegar el mismo adaptador en tres mercados sin adaptaciones adicionales de idioma.
- Generacion de dialogos sinteticos para ampliar datasets de rol: el adaptador puede usarse para producir intercambios etiquetados con la voz del personaje, que despues se filtran y se incorporan a pipelines de entrenamiento posteriores.
- Experimentacion academica con preferencias: los adaptadores DPO y SimPO permiten reproducir comparativas entre ambos algoritmos partiendo del mismo modelo base y del mismo punto de entrenamiento, sin necesidad de infraestructura de RL en linea.
- Demostraciones y pruebas de concepto en entornos de investigacion: al no haber pasado validacion final ni evaluacion humana, su uso adecuado es la exploracion interna y la generacion de hipotesis, no el despliegue de cara al publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos cuantitativos publicados son internos del proceso de seleccion del autor: NLL media por token en gold dev, exactitud de ranking en preferencia dev y recompensa por reglas de generacion.

| Adaptador | Metodo | gold dev NLL (menor es mejor) | Diferencia frente a baseline | Exactitud ranking preferencia dev | Recompensa por reglas |
|---|---|---:|---:|---:|---:|
| Baseline (sin adaptador) | - | 2,3413 | - | no disponible | no disponible |
| PPO (partida T2) | RL en linea con recompensa por reglas y cabeza de valor | 2,0908 | -0,2505 | 0,625 | 0,9670 |
| SimPO (partida T2) | Aprendizaje por preferencias | 2,0939 | -0,2474 | 0,625 | no medido |
| DPO (partida T2) | Aprendizaje por preferencias | 2,0955 | -0,2458 | 0,625 | no medido |

El autor senala que la diferencia entre los tres adaptadores publicados (0,0048) es inferior al umbral de decision de 0,02, por lo que no se puede afirmar que ninguno sea mejor que los demas. En el ranking interno completo, los puestos 4 y 5 corresponden a robust DPO (2,0957) e IPO (2,1121), ambos partiendo tambien de T2.

## Requisitos de hardware

Nota: el repositorio solo contiene adaptadores LoRA; todo calculo de VRAM corresponde al modelo base de 27B sobre el que se deben cargar y es una estimacion, no un dato publicado por el autor.

- El adaptador en si requiere muy poca memoria adicional (el repositorio completo ocupa 2,6 GB, repartido entre los tres adaptadores y sus ficheros auxiliares).
- Inferencia en precision completa (FP16/BF16) del modelo base de 27B: aproximadamente 54 GB solo para pesos, mas cache KV; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Inferencia con cuantizacion de 8 bits: aproximadamente 27-30 GB de pesos; viable en una A100 40 GB o en dos GPU de 24 GB.
- Inferencia con cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos; cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), dejando margen reducido para el contexto.
- En GPU de consumo con 16 GB o menos (RTX 4080, RTX 4070 Ti Super) la cuantizacion a 4 bits es ajustada y dependera de la longitud de contexto efectiva, que no esta documentada.
- Opciones de despliegue: los adaptadores son compatibles con PEFT; para servir el modelo fusionado se puede usar vLLM o TGI, y para entornos de consumo llama.cpp u Ollama con el modelo base cuantizado a GGUF mas la fusion previa del adaptador.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad ni de tokens por segundo.
- La libreria declarada es peft, y el entrenamiento se realizo con trl; se asume compatibilidad con el ecosistema Hugging Face Transformers.

## Comparativa con modelos similares

No se dispone de datos publicos de terceros comparables para este adaptador concreto. La comparativa mas directa es interna al propio repositorio, entre los tres adaptadores publicados y el modelo base sin adaptador.

| Modelo / configuracion | Parametros base | Contexto | gold dev NLL | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| PPO (T2) sobre Qwen3.8-27B | 27B | no disponible | 2,0908 | Apache 2.0 | Publico en este repositorio |
| SimPO (T2) sobre Qwen3.8-27B | 27B | no disponible | 2,0939 | Apache 2.0 | Publico en este repositorio |
| DPO (T2) sobre Qwen3.8-27B | 27B | no disponible | 2,0955 | Apache 2.0 | Publico en este repositorio |
| Qwen3.8-27B sin adaptador | 27B | no disponible | 2,3413 | no disponible en esta ficha | Modelo base en Hugging Face |

Frente a otros adaptadores de rol de la comunidad (por ejemplo, variantes de personaje sobre modelos de 7B a 13B), no se dispone de mediciones bajo el mismo protocolo, por lo que cualquier comparacion seria no seria valida. El autor no publica comparaciones con modelos externos.

## Limitaciones y advertencias

- El autor declara explicitamente que estos adaptadores son de "linea exploratoria" (탐색 레인) y que no son el modelo canonico, no han pasado la validacion final de holdout ni la evaluacion humana.
- La diferencia de rendimiento entre los tres adaptadores publicados (0,0048 en NLL) esta por debajo del umbral de decision de 0,02 fijado por el propio autor; no debe interpretarse como una jerarquia real de calidad.
- La metrica de recompensa por reglas (0,9670) mide unicamente ausencia de violaciones de cadena como expresiones prohibidas o cambios de idioma; no es una medida de calidad conversacional ni de coherencia.
- La NLL en gold dev es una metrica interna calculada sobre un conjunto de desarrollo no publico; no es comparable con resultados de benchmarks estandar de la comunidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al ser un adaptador de personaje, es esperable que genere contenido ficticio coherente con el rol, no informacion factual verificada.
- Sesgos conocidos: no documentados por el autor. Los sesgos del modelo base (Qwen/Qwen3.8-27B) y del dataset de entrenamiento, que es privado, no son auditables externamente.
- Limitaciones de idioma: el entrenamiento declara cobertura de coreano, ingles y japones; el comportamiento fuera de estos tres idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto soportada no esta documentada en la informacion disponible.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en este repositorio.
- Reproducibilidad limitada: los datos de entrenamiento (NEWUNIVERS/nu-fans-baek-seo-jin-data) son privados, por lo que no es posible reproducir el entrenamiento ni auditar la composicion del dataset.
- El repositorio no contiene cuerpos de datos, conversaciones de fans, informacion personal ni estados de optimizador, segun declara el autor.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Para produccion, seria necesario fusionar el adaptador con el modelo base y realizar una evaluacion propia, dado que el autor no ofrece garantias de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NEWUNIVERS/nu-fans-baek-seo-jin-qwen38-27b-explore-lora
- Tarjeta del adaptador PPO: `adapters/ppo/README.md` dentro del repositorio
- Tarjeta del adaptador SimPO: `adapters/r2b_simpo/README.md` dentro del repositorio
- Tarjeta del adaptador DPO: `adapters/r2b_dpo/README.md` dentro del repositorio
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0)
- Dataset de entrenamiento: NEWUNIVERS/nu-fans-baek-seo-jin-data (privado)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las entradas devueltas corresponden a paginas de ayuda de Google Translate y a hilos de soporte de Microsoft Community sin relacion con el modelo.
