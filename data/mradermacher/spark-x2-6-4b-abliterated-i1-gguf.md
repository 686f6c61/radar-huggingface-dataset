# mradermacher/Spark-X2.6-4B-abliterated-i1-GGUF

## Resumen

Spark-X2.6-4B-abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, publicada por mradermacher. El modelo base es un transformer de 4.112.079.360 parametros (aproximadamente 4,1 mil millones) orientado a ejecucion en dispositivo (on-device), con capacidades declaradas de razonamiento, tool calling y uso agentico. La variante "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para eliminar el comportamiento de censura del modelo original, y los tags "heretic", "ara" y "uncensored" confirman ese enfoque.

La relevancia de esta publicacion es practica: mradermacher ofrece un conjunto amplio de cuantizaciones con imatrix (importancia matricial) que van desde IQ1_S (1,3 GB) hasta Q6_K (3,5 GB), lo que permite desplegar un modelo de 4B en hardware de consumo muy modesto, incluidas GPUs integradas o sistemas con poca VRAM. El modelo base declara soporte para ingles y chino, licencia Apache 2.0 y compatibilidad con endpoints, lo que facilita su integracion en pipelines locales tipo OpenAI API.

No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada. La model card del cuantizador es puramente operativa (lista de ficheros y notas de calidad) y no reproduce la ficha tecnica del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 4.112.079.360 (~4,1B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q3_K_L, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); existen tambien cuantizaciones estaticas en el repo hermano |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer de 4,1 mil millones de parametros. Los tags "spark" y "sparkx2_5" sugieren una familia de modelos propia del autor original (FrostWolfAI), pero no se especifican capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card no aporta datos sobre numero de tokens, composicion del dataset, fases de RLHF o DPO. Lo unico documentado es el proceso de cuantizacion: mradermacher ha generado cuantizaciones i1 (importancia matricial) a partir del modelo en precision completa, con un fichero imatrix de 0,1 GB disponible para que terceros generen sus propias cuantizaciones. El tag "abliterated" indica que el modelo base ha sido modificado mediante ablacion de direcciones de rechazo, una tecnica que identifica y elimina direcciones en el espacio de activaciones asociadas a respuestas de negativa, sin reentrenar los pesos. El tag "reproducible" sugiere que el proceso de cuantizacion es documentado y repetible.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento (tag "reasoning") y resolucion de tareas multi-paso.
- Tool calling y function calling, segun los tags "tool-calling" y "endpoints_compatible".
- Uso agentico (tag "agentic"), orientado a flujos con llamadas a herramientas y planificacion.
- Ejecucion en dispositivo (tag "on-device"), pensada para entornos locales sin dependencia de la nube.
- Comportamiento sin censura (tags "uncensored", "decensored", "abliterated"), lo que implica ausencia de rechazos en dominios sensibles.
- Compatibilidad con endpoints tipo OpenAI, lo que permite integrarlo en clientes que esperan esa interfaz.
- No se documentan capacidades de vision, audio ni modos de pensamiento explicito (thinking mode).

## Casos de uso

- Asistente local de escritorio: con cuantizaciones de 2,5-3,1 GB (Q4_K_S, Q4_K_M, Q5_K_M) el modelo cabe en GPUs de 4-6 GB de VRAM o en CPU con llama.cpp, lo que permite un asistente conversacional completamente offline en un portatil.
- Automatizacion de agentes con tool calling: los tags "agentic" y "tool-calling" lo hacen adecuado para orquestar llamadas a APIs locales (sistema de ficheros, shell, bases de datos) en un bucle de razonamiento multi-paso, con la ventaja de que la latencia no depende de la red.
- Generacion de texto en chino e ingles: util para aplicaciones bilingues de resumen, redaccion o traduccion informal entre ambos idiomas, aunque sin garantias de calidad en otros idiomas.
- Experimentacion en investigacion sobre alineacion y censura: al ser una variante abliterated con licencia Apache 2.0, sirve como sujeto de estudio para comparar comportamientos de rechazo frente al modelo original, en entornos controlados.
- Prototipado rapido de chatbots con API compatible OpenAI: el tag "endpoints_compatible" permite sustituir un backend remoto por una instancia local en herramientas que ya hablan ese protocolo (por ejemplo, clientes de chat o frameworks de agentes).
- Despliegue en dispositivos de borde: las cuantizaciones IQ1/IQ2 (1,3-1,7 GB) permiten ejecutar el modelo en Raspberry Pi, mini-PCs o telefonos de gama alta con llama.cpp, a costa de una perdida notable de calidad.
- Filtrado y clasificacion de texto sensible: en pipelines donde un modelo censurado bloquearia contenido legitimo (por ejemplo, moderacion de foros, analisis de discurso), la variante abliterated evita rechazos espurios, aunque requiere supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto. Las cuantizaciones van de 1,3 GB (IQ1_S) a 3,5 GB (Q6_K); con overhead de contexto, se recomienda reservar entre 1,5 y 4,5 GB segun la cuantizacion.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para Q6_K se recomienda 6 GB o mas.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M (2,7 GB) y Q5_K_M (3,1 GB) son las opciones equilibradas para GPUs de 4-6 GB. Las IQ1/IQ2 caben incluso en iGPUs y sistemas con 2 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI que acepten backend GGUF. No se documenta soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, la model card marca Q4_K_M como "fast, recommended" y Q4_0 como "fast, low quality", sin cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus cuantizaciones, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated (i1-GGUF) | ~4,1B | no disponible | Apache 2.0 | GGUF (i1) | Variante abliterated, en/zh, tool calling |
| Modelo base FrostWolfAI/Spark-X2.6-4B-abliterated | ~4,1B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Version sin cuantizar del mismo modelo |
| Cuantizaciones estaticas mradermacher/Spark-X2.6-4B-abliterated-GGUF | ~4,1B | no disponible | Apache 2.0 | GGUF (estaticas) | Alternativa sin imatrix del mismo autor |

No se dispone de informacion sobre modelos comparables de otros autores (Qwen, Llama, Phi, Gemma) en la documentacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- La variante abliterated elimina los rechazos del modelo, lo que implica que puede generar contenido danino, ilegal o sensible sin filtro. No es adecuada para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: al ser un modelo de 4B sin datos de benchmarks publicados, la fiabilidad factua no esta verificada; se recomienda validacion en dominios criticos.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto desconocida; no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Las cuantizaciones de baja calidad (IQ1, IQ2, Q2_K) degradan notablemente la coherencia; la propia model card las etiqueta como "for the desperate" o "very low quality".
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y la naturaleza sin censura trasladan al desplegador toda la responsabilidad legal y etica.
- El repositorio tiene muy pocas descargas (14) y ningun like, lo que sugiere poca validacion por parte de la comunidad; no hay evidencia de pruebas independientes.
- El modelo base no incluye documentacion tecnica detallada en la informacion disponible, lo que dificulta auditorias de sesgo o de datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Spark-X2.6-4B-abliterated-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Spark-X2.6-4B-abliterated-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Spark-X2.6-4B-abliterated-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f8106007
