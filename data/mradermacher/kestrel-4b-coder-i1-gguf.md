# mradermacher/Kestrel-4B-Coder-i1-GGUF

## Resumen

Kestrel-4B-Coder-i1-GGUF es una colección de cuantizaciones GGUF con imatrix generada por mradermacher a partir del modelo Jackrong/Kestrel-4B-Coder, un transformer de 4.326.350.848 parámetros (4,33 mil millones) orientado a generación de código, razonamiento, uso de herramientas y despliegue local. El repositorio no contiene los pesos originales en safetensors, sino ficheros GGUF preparados para llama.cpp y derivados, con un rango de cuantizaciones que va desde IQ1_S hasta Q6_K.

La relevancia de esta ficha está en que permite ejecutar un modelo de 4B especializado en código en hardware de consumo: las cuantizaciones de 4 bits ocupan alrededor de 2,9 GB y las de 2-3 bits bajan hasta 2,1-2,4 GB. Los metadatos lo etiquetan con la arquitectura qwen3_5, licencia Apache 2.0, soporte declarado de seis idiomas (inglés, chino, coreano, japonés, ruso y español) y capacidades de tool calling, agentes y multimodalidad, aunque la model card no documenta en detalle el entrenamiento ni la longitud de contexto.

Se trata de un modelo derivado (merged, con SFT y destilación según los tags) y no de un entrenamiento desde cero documentado. Esa falta de documentación sobre datos, contexto y evaluación es el principal caveat para llevarlo a producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiquetado como qwen3_5 en los metadatos; no se detalla en la model card |
| Parametros totales | 4.326.350.848 (4,33 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, ademas de un fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | Jackrong/Kestrel-4B-Coder |
| Cuantizador | mradermacher |
| Tamano del repositorio | 39,2 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer decoder-only asociado a la familia qwen3_5 por los tags del repositorio, sin que la model card detalle numero de capas, dimensiones ocultas, mecanismo de atencion ni ventana de contexto. El modelo base aparece etiquetado como merged, sft y distillation, y el cuantizador lo describe como un modelo de vision (vision, multimodal), con soporte de multi-token prediction (mtp) y decodificacion especulativa. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

Los tags tambien incluyen unsloth, lo que sugiere que el entrenamiento o el merge se realizo con esa libreria, y reasoning, code-generation, coder, tool-use, function-calling y agent, que describen el enfoque funcional del modelo. No hay informacion sobre innovaciones tecnicas concretas mas alla de las citadas (MTP, decodificacion especulativa, vision). Cualquier afirmacion sobre atencion lineal, SSM o arquitecturas hibridas seria especulativa y no se incluye.

## Capacidades

- Generacion de codigo y completado en multiples lenguajes, segun el enfoque declarado del modelo base (coder, code-generation).
- Razonamiento explicito y modo de razonamiento, segun el tag reasoning; no se documenta el formato exacto del modo thinking.
- Tool calling y function calling, con integracion en flujos de agentes.
- Razonamiento multi-paso y uso como agente, segun el tag agent.
- Capacidades multimodales y de vision, siempre que se utilice el fichero mmproj correspondiente del repositorio estatico; la model card indica "mmproj files (if any)", por lo que no se garantiza que exista proyector visual publicado.
- Soporte multilingue declarado en ingles, chino, coreano, japonés, ruso y español; no se documenta la calidad por idioma.
- Multi-token prediction y decodificacion especulativa como capacidades declaradas en los tags.
- Inferencia local y en dispositivo (local-inference, edge-computing, on-device, llama.cpp).

## Casos de uso

- Autocompletado y generacion de codigo en IDE sobre portatil: con una cuantizacion Q4_K_M de 2,9 GB, el modelo cabe en GPU de 6-8 GB o incluso en CPU, lo que permite un asistente de codigo sin conexion y sin enviar codigo propietario a servicios externos.
- Agente de refactorizacion en CI/CD: el soporte de tool calling y function calling permite conectarlo a scripts de build, linters y gestores de repositorio para proponer parches y ejecutar comprobaciones en un pipeline automatizado.
- Asistente de terminal para equipos con hardware limitado: al ocupar 2,1-3,7 GB segun cuantizacion, puede desplegarse con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada y responder consultas sobre comandos, errores y configuracion.
- Analisis de capturas y diagramas tecnicos: si se dispone del fichero mmproj en el repositorio estatico, el modelo puede procesar imagenes junto a texto, por ejemplo para explicar diagramas de arquitectura o transcribir mensajes de error de una captura.
- Atencion al cliente tecnico multilingue: los seis idiomas declarados permiten cubrir consultas en ingles, chino, coreano, japonés, ruso y español desde un unico modelo pequeño, con la ventaja de poder ejecutarse on-premise.
- Prototipado de agentes con razonamiento multi-paso: su tamano reducido facilita iterar rapidamente en local sobre bucles de planificacion y llamadas a herramientas antes de escalar a un modelo mayor.
- Modelo borrador para decodificacion especulativa: los tags mtp y speculative-decoding sugieren su uso como draft model de un modelo mayor, aunque no se documentan tasas de aceptacion ni ganancias de velocidad.
- Despliegue en dispositivos edge: las cuantizaciones IQ2/IQ3 de 2,1-2,4 GB permiten probar el modelo en mini-PC, placas integradas o entornos con memoria muy limitada, asumiendo la perdida de calidad asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos de evaluacion del modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de los ficheros GGUF, sin contar cache KV): IQ1/IQ2 en torno a 2,1 GB; IQ3 en torno a 2,3-2,6 GB; Q4_K_M en torno a 2,9 GB; Q5_K_M en torno a 3,3 GB; Q6_K en torno a 3,7 GB. Con cache KV y overhead del runtime, anadir aproximadamente 0,5-1,5 GB segun contexto y backend.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB con cuantizaciones Q4 o inferiores; en 6 GB requiere IQ3 o menor; en 4 GB solo las cuantizaciones de 2 bits.
- GPU de datacenter: A100 40/80 GB, H100 y L40S quedan sobradamente dimensionadas para este modelo; su uso tendria sentido por concurrencia o por ejecutar el modelo base en precision completa, no por requisitos de memoria.
- CPU: al ser GGUF, es viable la inferencia en CPU con llama.cpp; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui para los GGUF; vLLM o TGI requeririan los safetensors del modelo base, no los ficheros de este repositorio. Para vision es necesario cargar el mmproj del repositorio estatico.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kestrel-4B-Coder-i1-GGUF (este) | 4,33 mil millones | no disponible | GGUF i1 (imatrix) | Apache 2.0 | Cuantizaciones con imatrix, de IQ1_S a Q6_K; incluye fichero imatrix |
| Jackrong/Kestrel-4B-Coder | 4,33 mil millones | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar; requiere GPU con mas memoria o ejecucion en precision reducida |
| mradermacher/Kestrel-4B-Coder-GGUF | 4,33 mil millones | no disponible | GGUF estatico | Apache 2.0 | Cuantizaciones estaticas y ficheros mmproj para vision |
| Otras alternativas de ~3-4B para codigo (por ejemplo, familias Qwen-Coder o Llama) | no disponible en la informacion | no disponible | no disponible | no disponible | No se aportan datos de benchmarks ni especificaciones de estos modelos en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con otras familias de modelos en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo y a la categoria general.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en codigo, razonamiento o tool calling para este modelo ni para su base.
- Las cuantizaciones de 1-3 bits (IQ1, IQ2, IQ3) degradan la calidad de forma notable; para produccion conviene partir de Q4_K_M o superior.
- Riesgo de alucinacion en generacion de codigo y en llamadas a APIs: puede inventar funciones, parametros o dependencias, por lo que requiere validacion y tests automatizados.
- Longitud de contexto no documentada: no debe asumirse una ventana larga para conversaciones multi-turno o repositorios extensos sin verificacion previa.
- Soporte multilingue declarado, pero sin evaluacion por idioma; el rendimiento en español, ruso, coreano o japonés puede ser inferior al de ingles.
- La capacidad de vision depende de que exista un fichero mmproj en el repositorio estatico; la propia model card lo condiciona con "if any".
- El modelo base es un merge con SFT y destilacion, sin documentacion sobre la procedencia de los datos; existe riesgo de contaminacion de benchmarks y de sesgos heredados no identificados.
- Licencia Apache 2.0 en este repositorio, que permite uso comercial, pero la licencia y condiciones del modelo base deben verificarse de forma independiente antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de los metadatos, creado el 2026-10-26: no hay validacion de la comunidad ni reportes independientes de calidad.
- El pipeline no esta declarado y el repositorio mezcla pesos GGUF con tags de transformers y safetensors; conviene revisar los ficheros antes de integrarlo en un stack automatico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Kestrel-4B-Coder-i1-GGUF
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Cuantizaciones estaticas y posibles ficheros mmproj: https://huggingface.co/mradermacher/Kestrel-4B-Coder-GGUF
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#Kestrel-4B-Coder-i1-GGUF
- Grafica comparativa de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y FAQ del cuantizador: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH: https://www.nethype.de/
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con la ficha.
