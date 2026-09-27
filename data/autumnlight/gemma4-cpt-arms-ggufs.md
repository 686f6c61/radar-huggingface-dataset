# Autumnlight/gemma4-cpt-arms-ggufs

## Resumen

El modelo `Autumnlight/gemma4-cpt-arms-ggufs` es una publicacion de cuantizaciones GGUF en formato Q4_K_M de dos experimentos de ajuste denominados "CPT-arm", construidos sobre la familia Gemma de Google. Concretamente, parte de `ToastyPigeon/gemma-4-12b-full-cpt` (un modelo derivado de `google/gemma-4-12b-it` tras un proceso de preentrenamiento continuado) y de `google/gemma-4-12b-it`. El autor, Autumnlight, lo describe explicitamente como "quants de prueba para juego local", no como un modelo de produccion.

Los pesos contienen aproximadamente 11.907.350.576 parametros (unos 11,9 mil millones), lo que situa al modelo en la gama de 12B dentro de la familia Gemma. El repositorio ocupa 20,1 GB e incluye dos variantes cuantizadas: una rama con ajuste supervisado en formato alpaca y una rama basada en el modelo instruct con una ampliacion del prompt de sistema. El entrenamiento se realizo sobre el corpus de roleplay "glimmer/marvin", segun la model card.

La relevancia de esta ficha es acotada: se trata de un experimento personal de cuantizacion con cero descargas y cero likes en el momento de la consulta, con documentacion minima y sin resultados de evaluacion publicados. Resulta util unicamente como referencia para quien quiera reproducir el pipeline de cuantizacion o evaluar el comportamiento de un ajuste CPT orientado a roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de la familia Gemma (detalles concretos no disponibles) |
| Parametros totales | 11.907.350.576 (aprox. 11,9B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio conserva intermedios F16 |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizacion Q4_K_M); el modelo base en safetensors |
| Tamano del repositorio | 20,1 GB |
| Modelo base | ToastyPigeon/gemma-4-12b-full-cpt y google/gemma-4-12b-it |
| Fecha de publicacion | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de su pertenencia a la familia Gemma 4 de 12B, que en sus versiones conocidas emplea un transformer decodificador. El autor no especifica numero de capas, dimension de embedding, mecanismo de atencion ni tipo de tokenizador en la model card.

En cuanto al entrenamiento, la model card describe dos ramas diferenciadas. La primera, `gemma-4-12b-alpaca-cpt-Q4_K_M.gguf`, consiste en un ajuste supervisado (SFT) en formato alpaca mediante un adaptador LoRA de rango 32, fusionado sobre `ToastyPigeon/gemma-4-12b-full-cpt`; el adaptador original es `ToastyPigeon/gemma-4-12b-cpt-rp-alpaca-adapter` y los datos de entrenamiento llevan anotacion de sistema. La segunda rama, `gemma-4-12b-it-sys-Q4_K_M.gguf`, parte del modelo instruct base y amplia el prompt de sistema con una mezcla de contenido de roleplay y "chapters", reanudando el entrenamiento desde el paso 400 de 693. Ambas ramas se entrenaron sobre el corpus de roleplay glimmer/marvin. No se detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y narrativa, dado el corpus de entrenamiento declarado.
- Soporte de plantillas de prompt especificas: plantilla alpaca en la rama SFT y plantilla de chat estandar de Gemma en la rama instruct.
- Uso con prompt de sistema, ya que la rama instruct fue entrenada con prompts de sistema expandidos.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking": no documentado.

## Casos de uso

- Roleplay conversacional local: la rama alpaca esta entrenada sobre un corpus de roleplay, por lo que puede emplearse en entornos de chat con personajes, ejecutando el modelo en local mediante llama.cpp u Ollama.
- Pruebas de cuantizacion y comparacion de formatos: dado que el repositorio es un "test quant", sirve para validar el impacto de Q4_K_M frente a los intermedios F16 conservados por el autor.
- Evaluacion de ajustes CPT: los dos brazos (alpaca y instruct con sistema) permiten comparar el efecto del formato de datos de ajuste sobre un mismo modelo base CPT.
- Generacion creativa de ficcion y narrativa: con una plantilla alpaca o de chat adecuada, puede producir texto narrativo extenso en un contexto de roleplay.
- Experimentos de despliegue en hardware de consumo: la cuantizacion Q4_K_M reduce el peso a unos 7 GB, lo que permite ejecutarlo en GPU de gama media para pruebas de latencia.
- Base para ajustes posteriores: al estar en GGUF, puede servir como punto de partida para pruebas de inferencia antes de decidir si se reentrena sobre el modelo base en precision completa.
- Integracion en pipelines de investigacion sobre personalizacion: util para estudiar como se comporta un ajuste LoRA r32 fusionado y cuantizado en un modelo de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes estimaciones se derivan del tamano de parametros (11,9B) y del formato Q4_K_M, y no proceden de mediciones publicadas por el autor; deben tomarse como aproximaciones.

- VRAM para inferencia en Q4_K_M: aproximadamente 7 GB para los pesos, mas el cache KV, que depende de la longitud de contexto (no disponible). Estimacion practica: entre 8 y 10 GB con contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para uso en consumer; A100 o H100 si se prioriza throughput o se sirven varias instancias.
- Compatibilidad con GPU de consumo: probable en tarjetas con 10-12 GB o mas de VRAM en Q4_K_M; en precision F16 (intermedios conservados) requeriria del orden de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere tambien compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Autumnlight/gemma4-cpt-arms-ggufs | ~11,9B | no disponible | gemma | GGUF Q4_K_M | Ajuste CPT orientado a roleplay, datos de evaluacion no publicados |
| google/gemma-4-12b-it | ~12B (segun modelo base) | no disponible | gemma | safetensors y variantes | Modelo instruct base sobre el que se construye la rama IT |
| ToastyPigeon/gemma-4-12b-full-cpt | ~12B (segun modelo base) | no disponible | gemma | safetensors | Modelo con preentrenamiento continuado, base de la rama alpaca |

No se dispone de datos de benchmarks que permitan comparar el rendimiento efectivo entre estas variantes.

## Limitaciones y advertencias

- El propio autor lo describe como "quants de prueba para juego local", no como un modelo validado para produccion.
- No hay resultados de evaluacion publicados (MMLU, HumanEval, GSM8K u otros), por lo que se desconoce su calidad real frente al modelo base.
- Sesgos conocidos: no documentados, pero un corpus de roleplay especifico puede introducir sesgos tematicos y de estilo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en modelos de esta categoria sin evaluacion especifica.
- Longitud de contexto e idiomas soportados no disponibles, lo que limita su uso en tareas que dependan de contexto largo o multilingue.
- Licencia gemma: el uso comercial esta sujeto a los Terminos de Uso de Gemma de Google, que imponen obligaciones de atribucion y restricciones de uso; conviene revisarlos antes de cualquier despliegue comercial.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad ni evidencia de reproducibilidad.
- La rama instruct se encontraba, segun la model card, en entrenamiento (reanudada desde el paso 400/693), por lo que ese brazo puede no estar finalizado.

## Enlaces

- HuggingFace: https://huggingface.co/Autumnlight/gemma4-cpt-arms-ggufs
- Modelo base CPT: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt
- Adaptador LoRA alpaca: https://huggingface.co/ToastyPigeon/gemma-4-12b-cpt-rp-alpaca-adapter
- Modelo base instruct: https://huggingface.co/google/gemma-4-12b-it

Nota: la busqueda web no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardaban relacion con el contenido solicitado y se han descartado.
