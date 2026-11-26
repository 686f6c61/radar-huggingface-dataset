# mradermacher/ShopMaster-4B-i1-GGUF

## Resumen

ShopMaster-4B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo ShopMaster-4B, publicada por el usuario mradermacher. El modelo base, alojado en el repositorio HOWILLMAKEIT/ShopMaster-4B, no dispone de model card publica ni de documentacion tecnica accesible en la informacion proporcionada, por lo que la mayor parte de sus caracteristicas (arquitectura, datos de entrenamiento, licencia e idiomas) no estan disponibles.

La relevancia de esta publicacion es fundamentalmente practica: se trata de una conversion a GGUF con cuantizaciones ponderadas (weighted/imatrix) que cubre un rango muy amplio de niveles de compresion, desde IQ1_S hasta Q6_K, lo que permite ejecutar el modelo en hardware muy limitado. El autor de la conversion, mradermacher, es un actor conocido en el ecosistema de cuantizacion GGUF para llama.cpp.

Un dato importante es la discrepancia entre el nombre del repositorio (que sugiere 4B parametros) y el recuento real de parametros en los tensores safetensors asociados (1.550.888). Esta cifra es demasiado baja para un modelo de lenguaje utilizable y probablemente corresponde a un recuento parcial o erroneo; debe tratarse con cautela hasta verificar los pesos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.550.888 (dato real de safetensors; el nombre del repo sugiere 4B, discrepancia sin resolver) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos en formato HF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base ShopMaster-4B: la model card del repositorio GGUF no incluye descripcion de la red, numero de capas, tipo de atencion ni mecanismo de entrenamiento. Los metadatos de la conversion indican `convert_type: hf`, lo que implica que los pesos originales estaban en formato Hugging Face y fueron convertidos a GGUF mediante el flujo habitual de llama.cpp.

Las cuantizaciones se han generado con ponderacion por matriz de importancia (imatrix/weighted), una tecnica que mejora la calidad de los niveles de cuantizacion bajos al calibrar la importancia relativa de cada tensor. No hay informacion sobre el dataset de calibracion empleado, el numero de tokens de entrenamiento del modelo original ni si se aplicaron tecnicas de RLHF, DPO o similar.

## Capacidades

- Generacion de texto: presumiblemente soportada al tratarse de un modelo de lenguaje, aunque no hay documentacion que lo confirme.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue local en hardware modesto: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en equipos con poca memoria, util para pruebas de concepto en portatiles con GPU integrada.
- Experimentacion con llama.cpp: el abanico de cuantizaciones facilita comparar el impacto de la compresion en la calidad de salida sobre el mismo modelo base.
- Evaluacion de modelos de nicho: dado el nombre "ShopMaster", podria orientarse a tareas de comercio electronico, pero esta hipotesis no esta confirmada por documentacion alguna.
- Prototipado rapido en CPU: los niveles Q4_0 y Q4_K_S son adecuados para inferencia en CPU con llama.cpp u Ollama.
- Integracion en pipelines de investigacion: util como sujeto de pruebas para estudiar cuantizacion con imatrix frente a cuantizacion estandar.
- Pruebas de calidad de cuantizacion: la disponibilidad de IQ1 a Q6 permite medir la degradacion de perplexity por nivel, si se dispone del modelo base para comparar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que el recuento de parametros es inconsistente. Si el modelo real fuese de 4B, una cuantizacion Q4_K_M ocuparia aproximadamente 2,5 GB; si fuese de 1,55B, alrededor de 1 GB. Estas cifras son estimaciones basadas en el tamano nominal, no datos confirmados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable en el rango Q4 y Q5 para GPUs con 4-8 GB de VRAM, condicionado al tamano real del modelo.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no son opciones directas para GGUF sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, y el modelo base carece de documentacion que permita situarlo en una categoria concreta.

## Limitaciones y advertencias

- El recuento de parametros de safetensors (1.550.888) contradice el nombre del repositorio (4B); es imprescindible verificar los pesos antes de cualquier uso en produccion.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor del modelo base antes de desplegarlo.
- No hay informacion sobre sesgos, riesgo de alucinacion ni idiomas soportados.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad y no son recomendables para tareas sensibles.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026) es futura respecto a la mayoria de referencias del ecosistema; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ShopMaster-4B-i1-GGUF
- Modelo base: https://huggingface.co/HOWILLMAKEIT/ShopMaster-4B
