# Jeesup/svd-safety-l2_swift_remove50_swapgapiter_rankunit_b010

## Resumen

`Jeesup/svd-safety-l2_swift_remove50_swapgapiter_rankunit_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le han aplicado dos transformaciones encadenadas: una compresion por descomposicion en valores singulares con el metodo SVD-LLM, que elimina el 50,01% de los parametros densos de las matrices de proyeccion, y una posterior reparacion mediante 10 rondas de intercambio parametrizado neutro ("parameter-neutral swap") guiadas por la regla de seleccion `gap_iter`, con un presupuesto total del 1,0% de los parametros densos (0,1% por ronda). El resultado es un artefacto de investigacion que busca cuantificar como la compresion degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano.

No es un modelo de proposito general ni un asistente desplegable: es una celda de una rejilla experimental sobre reglas de seleccion y presupuestos, publicada junto a otras variantes del mismo estudio. El autor lo declara explicitamente como sujeto de experimentacion y recomienda evaluarlo antes de extraer conclusiones. El checkpoint conserva la arquitectura y el tokenizador de Llama 2, con semilla 42, 4.786 componentes restaurados y 4.786 sustituidos, y 64.719.104 parametros intercambiados.

Su relevancia es acotada pero clara: sirve como material reproducible para estudiar safety alignment bajo compresion, un area donde la literatura muestra que reducir rango en las proyecciones puede reactivar comportamientos daninos que el ajuste por RLHF habia mitigado. El repositorio acumula 0 descargas y 0 "likes", por lo que no ha pasado por validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (RMSNorm, SwiGLU, RoPE), con matrices de proyeccion comprimidas por SVD (SVD-LLM) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) segun los metadatos de safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base esta centrado en ingles) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (tamano del repositorio: 13,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only de 32 capas, 4.096 dimensiones ocultas y atencion multi-cabeza, preentrenado por Meta sobre 2 billones de tokens y posteriormente alineado con RLHF. Sobre ese checkpoint, este artefacto aplica compresion SVD-LLM, que trunca los valores singulares de las matrices de proyeccion, eliminando el 50,01% de los parametros densos y dejando una fraccion resultante de 0,4999. No hay preentrenamiento ni ajuste adicional por parte del autor: la unica "formacion" posterior es el proceso de reparacion por intercambio de componentes.

Ese proceso de reparacion es la innovacion metodologica del trabajo. Se aplicaron 10 de 10 rondas iterativas de intercambio parametrizado neutro, cada una con un trozo del 0,1% de los parametros densos, seleccionando los componentes con la regla `gap_iter`. En total se restauraron y sustituyeron 4.786 componentes, con 64.719.104 parametros intercambiados (el 1,00% de los parametros de proyeccion densos) usando el valor de insercion `insert` y una politica de expulsion ordenada por sigma. La semilla empleada fue 42. La model card no documenta la composicion del dataset de calibracion, el coste computacional de la edicion ni el procedimiento exacto de calculo de la regla `gap_iter`.

## Capacidades

- Generacion de texto conversacional en el formato de chat de Llama 2, heredada del checkpoint base.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de 4.096 tokens del modelo base.
- Comprension y generacion de texto en ingles principalmente; el resto de idiomas no esta declarado ni evaluado en la ficha.
- Capacidad de compresion extrema: el checkpoint ocupa 13,5 GB en safetensors, con la fraccion de parametros reducida teoricamente a 0,4999.
- Sujeto de evaluacion de seguridad: los propios metadatos permiten medir tasa de exito de ataques (AdvBench 0,1404; StrongREJECT 0,1661) y tasa de sobrerrechazo (0,1480).
- No hay evidencia publicada de soporte de tool calling, function calling, uso de agentes, modo de razonamiento explicito, vision ni audio en este checkpoint; se trata de un derivado de Llama-2-7b-chat sin capacidades anadidas.
- Capacidad de servir como punto de comparacion controlado frente a otras celdas de la misma rejilla experimental (distintas reglas de seleccion y presupuestos).

## Casos de uso

- Investigacion sobre safety alignment bajo compresion: usar el checkpoint como condicion experimental "50% de parametros + reparacion gap_iter al 1%" y comparar AdvBench ASR y StrongREJECT ASR frente a la variante sin reparar y frente a Llama-2-7b-chat.
- Auditoria de red teaming reproducible: la semilla 42 y los recuentos exactos de componentes (4.786 restaurados, 4.786 sustituidos) permiten replicar el experimento y verificar la estabilidad de la tasa de ataque entre ejecuciones.
- Estudios de interpretabilidad mecanicista: analizar que componentes concretos de las proyecciones, una vez restaurados por la regla `gap_iter`, recuperan comportamiento seguro, y correlacionarlo con circuitos conocidos de Llama 2.
- Analisis del compromiso seguridad-utilidad: la pareja de metricas ASR (0,1404 / 0,1661) y sobrerrechazo macro (0,1480) sobre WildGuard permite trazar curvas de Pareto por presupuesto de restauracion.
- Experimentos de compresion para despliegue en el borde: sirve como referencia de como se degrada un modelo de 6,74 mil millones de parametros al eliminar la mitad de los parametros de proyeccion, antes de decidir si merece la pena desplegar una variante comprimida.
- Docencia y formacion en tecnicas SVD-LLM: el repositorio documenta paso a paso la procedencia (base, regla de seleccion, presupuesto, semilla) y es un ejemplo didactico de ficha de reproducibilidad.
- Base para estudios de destilacion o recuperacion post-compresion: los 64,7 millones de parametros intercambiados son un subconjunto pequeno y bien identificado que puede reutilizarse como inicializacion en experimentos de fine-tuning correctivo.
- No debe usarse como asistente de atencion al cliente, generacion de codigo en produccion ni ninguna tarea de cara al usuario final, tal como advierte la propia model card.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1404 |
| StrongREJECT ASR (juez HarmBench) | 0,1661 |
| Sobrerrechazo macro (WildGuard) | 0,1480 |
| Perplejidad en WikiText-2 | 14,9396 |

La model card no incluye los valores de referencia de Llama-2-7b-chat sin comprimir ni de otras celdas de la rejilla, por lo que no es posible calcular la degradacion relativa a partir de la informacion disponible. Tampoco se publican MMLU, HumanEval, GSM8K ni ninguna otra prueba de capacidad general.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: alrededor de 13,5 GB solo de pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en 15-16 GB para contextos cortos y mas si se llena la ventana de 4.096 tokens.
- VRAM en 8 bits: aproximadamente 7 GB de pesos; en 4 bits (NF4/GPTQ/AWQ) alrededor de 3,5-4,5 GB, aunque el repositorio no publica pesos ya cuantizados.
- GPU profesionales: A100 40/80 GB, H100 y L40S ejecutan el modelo sin dificultad en fp16 y permiten lotes grandes.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en fp16; en RTX 4080/4070 Ti (16 GB) y RTX 3080 (10-12 GB) es recomendable cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y compatibilidad con endpoints). vLLM y SGLang son viables al ser safetensors con arquitectura Llama. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponible; la model card no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_swift_remove50_swapgapiter_rankunit_b010 | 6,74 mil millones (safetensors); fraccion declarada 0,4999 | 4.096 tokens | AdvBench ASR 0,1404; StrongREJECT ASR 0,1661; WildGuard sobrerrechazo 0,1480; WikiText-2 ppl 14,9396 | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6,74 mil millones | 4.096 tokens | no disponible en la informacion proporcionada | Llama 2 Community License | HuggingFace, ampliamente usado |
| Otras celdas de la rejilla del mismo autor | no disponible | 4.096 tokens por herencia | no disponible | Llama 2 Community License | no disponible en esta busqueda |
| Mistral-7B-Instruct-v0.2 (referencia de categoria) | 7,24 mil millones | 32.768 tokens | no comparable con los datos disponibles | Apache 2.0 | HuggingFace |
| Llama-3-8B-Instruct (referencia de categoria) | 8,03 mil millones | 8.192 tokens | no comparable con los datos disponibles | Meta Llama 3 Community License | HuggingFace |

El checkpoint no es directamente comparable en calidad de asistente con ninguna de las alternativas de la tabla, porque su proposito es medir el dano de seguridad inducido por compresion, no maximizar utilidad.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente: la model card advierte que varias variantes de la rejilla estan "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat.
- La compresion por si sola eleva la tasa de exito de ataques (ASR); el valor de 0,1404 en AdvBench y 0,1661 en StrongREJECT debe interpretarse en ese contexto y no como una garantia de seguridad.
- Existe una discrepancia sin resolver entre los metadatos de safetensors, que declaran 6.738.415.616 parametros (practicamente identico al Llama-2-7b-chat completo), y la afirmacion de la model card de haber eliminado el 50,01% de los parametros densos con fraccion resultante 0,4999. Conviene verificar la estructura real de los tensores antes de asumir un ahorro de memoria.
- La perplejidad en WikiText-2 (14,9396) se publica sin valor de referencia, por lo que no se puede cuantificar la perdida de modelado de lenguaje.
- Sesgos y alucinaciones heredados de Llama-2-7b-chat, agravados potencialmente por la compresion; no se han publicado evaluaciones especificas de sesgo para este checkpoint.
- Idiomas soportados no declarados; el modelo base esta optimizado para ingles y su rendimiento en castellano no esta documentado.
- Ventana de contexto de 4.096 tokens, insuficiente para casos de uso con documentacion larga o conversaciones extensas.
- Sin soporte documentado de tool calling ni de agentes.
- Licencia Llama 2: uso comercial sujeto a la Acceptable Use Policy, obligacion de incluir el aviso "Built with Llama 2" y clausula de terminacion si se superan los 700 millones de usuarios activos mensuales. Es obligatorio revisar `LICENSE.txt` y `USE_POLICY.md` del repositorio.
- 0 descargas y 0 "likes": no hay evidencia de uso, replicacion independiente ni validacion por terceros.
- Las fechas de creacion y actualizacion del repositorio (21 de septiembre de 2026) son posteriores a la fecha actual, lo que sugiere un posible error en los metadatos del autor.
- No se documentan datos de calibracion, coste de la edicion ni criterio exacto de la regla `gap_iter`, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_remove50_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio): `LICENSE.txt` y `USE_POLICY.md`
- Paper de SVD-LLM, HarmBench, StrongREJECT y WildGuard: no disponible en los resultados de busqueda proporcionados
- Aviso: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo, el metodo SVD-LLM ni los benchmarks citados; los unicos resultados obtenidos versan sobre un piloto de Formula 1 y no guardan relacion con la ficha.
