# mradermacher/Whittle-Qwen-3.8-35B-A3B-GGUF

## Resumen

Whittle-Qwen-3.8-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario logic65, del que esta ficha describe la version cuantizada en GGUF generada por mradermacher. El modelo declara 35.547.542.656 parametros totales (unos 35,5 mil millones) y, por el sufijo A3B de su nombre, aproximadamente 3 mil millones de parametros activos por token, lo que lo situa en la categoria de MoE dispersos con coste de inferencia cercano al de un modelo denso de 3B. La ficha tecnica no detalla la longitud de contexto ni la composicion del dataset de entrenamiento.

Las etiquetas del repositorio describen una arquitectura con memoria n-gram, memoria condicional e hiper-conexiones, junto con destilacion de conocimiento, lo que apunta a un modelo orientado a investigacion mas que a un producto cerrado. El modelo esta afinado para razonamiento, modo thinking, codigo y matematicas, y declara soporte para ingles, chino y uso multilingue. La licencia es Apache-2.0.

La relevancia practica de esta publicacion es doble: por un lado, ofrece cuantizaciones GGUF listas para llama.cpp de un MoE de 35B con solo ~3B activos, lo que permite ejecutarlo en hardware de consumo con offload parcial; por otro, es un modelo muy reciente y practicamente sin adopcion (0 descargas y 1 like en el momento de la consulta), por lo que debe tratarse como material de experimentacion y no como base para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con memoria n-gram, memoria condicional e hiper-conexiones, segun las etiquetas del repositorio; no se detalla la arquitectura base exacta |
| Parametros totales | 35.547.542.656 (~35,5 mil millones) |
| Parametros activos | ~3 mil millones, deducido del sufijo A3B del nombre; no confirmado en la ficha |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q6_K, Q8_0. La ficha menciona ademas x-f16 e IQ4_XS entre los tipos generados, aunque no aparecen en la tabla de descargas |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada). El modelo base se distribuye en safetensors |
| Modelo base | logic65/Whittle-Qwen-3.8-35B-A3B |
| Tamano del repositorio | 171,8 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer de mezcla de expertos con varios mecanismos declarados en forma de etiquetas: memoria n-gram, memoria condicional (conditional-memory) e hiper-conexiones (hyper-connections). Estos componentes sugieren un diseno que combina el enrutado disperso clasico de un MoE con estructuras auxiliares de memoria y conexiones residuales alternativas, pero la ficha del repositorio no incluye el detalle de capas, numero de expertos, expertos activos por token, ni la dimension oculta. Tampoco se especifica si el modelo es un entrenamiento desde cero o un ajuste sobre una base existente; la etiqueta qwen4_exp y el nombre Qwen-3.8 apuntan a un linaje relacionado con la familia Qwen, sin que haya confirmacion explicita.

En cuanto al entrenamiento, las etiquetas mencionan destilacion de conocimiento y capacidades de razonamiento, thinking, codigo y matematicas, lo que indica alguna forma de ajuste supervisado o destilado orientado a tareas de razonamiento. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Esta cuantizacion concreta ha sido generada con el pipeline habitual de mradermacher en modo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf); el autor indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion y que podrian no llegar a publicarse.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles y chino, con soporte multilingue declarado.
- Razonamiento explicito con modo thinking, segun las etiquetas reasoning y thinking del repositorio.
- Generacion de codigo y asistencia a la programacion, segun la etiqueta code.
- Resolucion de problemas matematicos, segun la etiqueta math.
- Inferencia eficiente gracias al enrutado MoE con aproximadamente 3 mil millones de parametros activos por token, lo que reduce el coste por token frente a un denso de 35B.
- Ejecucion en llama.cpp y derivados (Ollama, LM Studio, bindings de llama-cpp-python) al distribuirse en formato GGUF.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el repositorio no incluye proyector multimodal (mmproj).

## Casos de uso

- Prototipado de agentes de razonamiento en local: el modo thinking y el bajo numero de parametros activos permiten iterar sobre cadenas de razonamiento multi-paso en una estacion de trabajo con una sola GPU, sin depender de APIs externas.
- Generacion de codigo en entornos con GPU de consumo: con la cuantizacion Q4_K_S (20,5 GB) el modelo cabe en una RTX 3090 o RTX 4090 de 24 GB y puede integrarse en editores o scripts de refactorizacion mediante llama.cpp.
- Asistencia matematica y verificacion de razonamiento: adecuado para experimentar con resolucion de problemas paso a paso y comparar la calidad del razonamiento entre distintas cuantizaciones.
- Atencion al cliente bilingue ingles-chino: el soporte declarado de ambos idiomas permite desplegar un asistente conversacional para bases de usuarios mixtas, siempre que se valide previamente la calidad real en cada idioma.
- Investigacion sobre arquitecturas MoE con memoria condicional: las etiquetas n-gram-memory y conditional-memory convierten este modelo en un objeto de estudio para analizar como afectan esos mecanismos a la coherencia en contextos largos.
- Despliegue en servidores sin GPU dedicada: gracias al enrutado disperso, las cuantizaciones Q2_K (13,1 GB) y Q3_K (15,7-17,8 GB) permiten un esquema hibrido CPU+GPU con velocidad de decodificacion aceptable para tareas por lotes.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece siete variantes GGUF del mismo modelo, lo que facilita medir la degradacion de perplejidad y de calidad de respuesta entre Q2_K y Q8_0.
- Base para destilacion o ajuste fino posterior: al ser un modelo con licencia Apache-2.0 y pesos GGUF de referencia, puede servir como punto de partida para experimentos de destilacion sobre dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones de VRAM a partir del tamano de archivo de cada cuantizacion; hay que sumar el consumo del KV cache, que depende de la longitud de contexto y que no puede calcularse porque la ventana de contexto no esta documentada.

| Cuantizacion | Tamano en disco | VRAM estimada con contexto moderado | GPU objetivo |
|---|---|---|---|
| Q2_K | 13,1 GB | ~14-16 GB | RTX 4080, RTX 4090, o hibrido CPU+GPU |
| Q3_K_S | 15,7 GB | ~17-19 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q3_K_M | 16,8 GB | ~18-20 GB | RTX 4090, RTX 3090 |
| Q3_K_L | 17,8 GB | ~19-21 GB | RTX 4090, RTX 3090 |
| Q4_K_S | 20,5 GB | ~22-25 GB | RTX 3090/4090 24 GB (ajustado), A6000 |
| Q6_K | 29,4 GB | ~31-34 GB | A100 40 GB, 2x RTX 3090/4090 |
| Q8_0 | 37,9 GB | ~40-43 GB | A100 40/80 GB, H100 |

- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q4_K_S con tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 32 GB o mas.
- El autor recomienda Q4_K_S como opcion rapida y Q8_0 como la de mejor calidad; Q3_K_M esta marcado explicitamente como de calidad inferior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui. vLLM y TGI tienen soporte limitado o experimental para GGUF, por lo que no son la via recomendada aqui.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con aproximadamente 3 mil millones de parametros activos, la velocidad de decodificacion deberia ser sustancialmente mayor que la de un denso de 35B en el mismo hardware, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto y licencia, ya que no hay ningun dato de rendimiento publicado para Whittle-Qwen-3.8-35B-A3B.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B | ~35,5 mil millones | ~3 mil millones (segun nombre) | no disponible | Apache-2.0 |
| Qwen3-30B-A3B | ~30,5 mil millones | ~3,3 mil millones | 128K | Apache-2.0 |
| Mixtral-8x7B | ~46,7 mil millones | ~12,9 mil millones | 32K | Apache-2.0 |
| Qwen3-32B (denso) | ~32,8 mil millones | 32,8 mil millones | 128K | Apache-2.0 |

Frente a Qwen3-30B-A3B, el competidor mas directo por perfil MoE y activacion, la diferencia principal es la disponibilidad: Qwen3-30B-A3B cuenta con documentacion tecnica completa, benchmarks publicados y un ecosistema amplio, mientras que Whittle carece de todo ello. Frente a un denso de ~32B, la ventaja teorica de Whittle es el coste de inferencia por token; la desventaja, la ausencia de datos verificables de calidad.

## Limitaciones y advertencias

- No hay ningun benchmark publicado en la informacion disponible: la calidad real del modelo es desconocida y no puede compararse objetivamente con alternativas establecidas.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 1 like), lo que reduce la probabilidad de que existan informes independientes de errores o comportamientos problematicos.
- La fecha de creacion registrada (19 de septiembre de 2026) es posterior a la fecha habitual de referencia y conviene verificarla antes de citarla.
- Los parametros activos (~3 mil millones) se deducen del sufijo A3B del nombre y no estan confirmados en la ficha tecnica; conviene tratarlos como una estimacion.
- La longitud de contexto no esta documentada, lo que impide planificar cargas de trabajo con ventanas largas o calcular el consumo real de KV cache.
- Las cuantizaciones son estaticas: no hay versiones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad-tamano en modelos pequenos y medianos.
- La cuantizacion Q3_K_M esta marcada por el propio autor como de calidad inferior; Q2_K, por su parte, degrada previsiblemente el razonamiento y la generacion de codigo.
- Riesgo de alucinacion: inherente a cualquier modelo de este tamano sin evaluacion publicada, y potencialmente mayor en tareas de matematicas y codigo, donde un fallo no es detectable a simple vista.
- Sesgos conocidos: no documentados. El sesgo linguistico puede ser relevante porque la ficha solo declara ingles y chino, con una etiqueta multilingue generica que no especifica cobertura real en otras lenguas.
- Los mecanismos de memoria n-gram y memoria condicional descritos en las etiquetas no estan explicados en la ficha del repositorio; se desconoce como se comportan con entradas adversariales o repetitivas.
- Soporte de tool calling, agentes y multimodalidad: no documentado. No debe asumirse su funcionamiento en produccion.
- Licencia: el repositorio GGUF declara Apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base logic65/Whittle-Qwen-3.8-35B-A3B antes de desplegarlo en un producto.
- Al ser una cuantizacion de terceros, el autor de esta ficha no es el autor del modelo original ni responde por posibles fallos introducidos en el proceso de conversion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Whittle-Qwen-3.8-35B-A3B-GGUF
- Modelo base: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Whittle-Qwen-3.8-35B-A3B-GGUF
- Guia de uso de archivos GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces obtenidos pertenecian al portal estadistico raport.stat.gov.pl y no guardan relacion con el contenido de esta ficha.
