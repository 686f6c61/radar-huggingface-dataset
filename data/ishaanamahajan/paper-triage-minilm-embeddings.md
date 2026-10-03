# ishaanamahajan/paper-triage-minilm-embeddings

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino la ficha de despliegue de un sistema que reutiliza **sentence-transformers/all-MiniLM-L6-v2** sin modificar ni afinar, a traves de su exportacion ONNX cuantizada a 8 bits (**Xenova/all-MiniLM-L6-v2**, unos 23 MB) y de la libreria **transformers.js 3.8.1**. Lo publica el usuario ishaanamahajan como artefacto de soporte del proyecto Paper Triage, una aplicacion de triaje de articulos cientificos.

El problema que resuelve es acotado y muy concreto: calcular embeddings de similitud semantica entre el perfil de un visitante (descripcion, foco, palabras clave, temas excluidos) y el catalogo de articulos cientificos, enteramente en el navegador. Los vectores alimentan cuatro de las siete caracteristicas del ranker (investigacion, foco, palabra clave mas cercana y tema excluido), con similitudes coseno calibradas de forma fija.

Su relevancia actual es de tipo practico: demuestra un patron de inferencia en el cliente (Web Worker, modelo de 23 MB descargado una sola vez) con una huella de memoria minima y licencia Apache-2.0. No hay innovacion arquitectonica ni datos de entrenamiento propios: es un encoder MiniLM de 6 capas, solo ingles, con truncamiento a 256 tokens, cuya unica particularidad es el empaquetado int8 de los vectores y el uso off-the-shelf dentro de un pipeline de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MiniLM (modelo base sentence-transformers/all-MiniLM-L6-v2), usado sin modificar; exportacion ONNX |
| Parametros totales | no disponible en la informacion proporcionada (heredados del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (el tokenizador trunca; MiniLM se entreno con secuencias de 256 tokens o menos) |
| Tipos de cuantizacion | ONNX cuantizado a 8 bits (~23 MB); vectores almacenados como int8 con escala por vector (388 bytes por articulo) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX cuantizado a 8 bits (artefacto de transformers.js) |
| Dimension del embedding | no disponible en la informacion proporcionada |
| Pipeline declarado | feature-extraction |
| Tamano del artefacto | ~23 MB (ONNX de 8 bits) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer MiniLM de seis capas orientado a similitud de frases, distribuido aqui mediante su exportacion ONNX cuantizada a 8 bits y ejecutado con transformers.js 3.8.1. **No hay entrenamiento, ajuste fino ni destilacion adicional por parte del autor**: la model card indica explicitamente que el modelo "no se modifica ni se afina". Por tanto, no hay datos de entrenamiento, numero de tokens, composicion de corpus ni fases de RLHF/DPO que reportar para este repositorio.

Las decisiones tecnicas relevantes estan en el uso, no en el modelo. En la fase de construccion, `scripts/embed_catalog.mjs` genera un vector por articulo a partir de la cadena `"title. abstract"` (primeros 2.000 caracteres), aplica mean pooling y normalizacion L2, y guarda el resultado como int8 con una escala por vector, verificando la integridad mediante SHA-256 del shard. En la fase de visita, un Web Worker carga el mismo modelo y la misma cuantizacion para embeber el perfil del usuario, de modo que ambos conjuntos de vectores comparten un unico espacio. Las similitudes coseno se reescalan a [0, 1] con rangos fijos (0,15 → 0 y 0,50 → 1 para documentos; 0,12 → 0 y 0,45 → 1 para frases cortas) y los casi duplicados se agrupan con un umbral de coseno ≥ 0,72.

## Capacidades

- Generacion de embeddings de frases y textos cortos en ingles (feature-extraction).
- Calculo de similitud semantica por coseno entre consultas y documentos.
- Alimentacion de cuatro caracteristicas de un ranker: similitud con la investigacion, con el foco, palabra clave mas cercana y tema excluido.
- Agrupacion de casi duplicados mediante umbral fijo de coseno (≥ 0,72).
- Ejecucion integra en el navegador: Web Worker, transformers.js y ONNX Runtime en el cliente, sin llamadas a servidor.
- Modo de respaldo: si el modelo aun no se ha descargado o esta desactivado, el sistema opera en un espacio TF-IDF con su propia calibracion, de modo que la aplicacion es utilizable en el primer segundo.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni agentes multi-paso. Es exclusivamente un modelo de representacion densa.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades multimodales.

## Casos de uso

- **Triaje de articulos cientificos**: el caso descrito en la propia model card. El modelo embebe el perfil del visitante y el catalogo, y las similitudes coseno alimentan el ranker que decide si un articulo se marca como Read, Skim o descartado. Es adecuado porque funciona bien en texto corto en ingles y con una huella de 23 MB.
- **Busqueda semantica dentro de un catalogo estatico**: los vectores se precalculan en tiempo de construccion (388 bytes por articulo en int8) y se consultan en el cliente. Permite busqueda por significado sin infraestructura de servidor ni base de datos vectorial externa.
- **Deduplicacion y agrupacion de documentos**: aplicando el umbral de coseno ≥ 0,72 se agrupan entradas casi identicas, util para limpiar catalogos de preprints con versiones repetidas o titulos reformulados.
- **Aplicaciones en el navegador con requisitos de privacidad**: al ejecutarse en un Web Worker y ejecutar la inferencia en el dispositivo, el texto del usuario no sale del cliente. Encaja en herramientas de clasificacion o filtrado de textos cortos sensibles.
- **Re-ranking ligero en pipelines RAG locales**: puede actuar como primera etapa de filtrado semantico de candidatos antes de un modelo mayor, dado su coste casi nulo y su arranque inmediato.
- **Despliegue en portatiles y telefonos**: la model card justifica la eleccion del modelo precisamente por ser "suficientemente pequeno para descargarlo una vez y ejecutarlo en la CPU de un portatil o de un telefono dentro de un navegador".
- **Degradacion elegante en redes lentas**: la combinacion de un respaldo TF-IDF con la carga progresiva del modelo ONNX permite ofrecer servicio inmediato aunque el modelo tarde en descargarse.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la evaluacion del ranker completo del proyecto Paper Triage, no a una evaluacion aislada de la calidad del embedding. Se calculan sobre 500 etiquetas manuales (good = Read) y comparan el espacio MiniLM con el espacio TF-IDF alternativo, mediante average precision (AP).

| Perfil | AP del ranker con MiniLM | AP del ranker con TF-IDF |
|---|---|---|
| RAG | 1,00 | 0,83 |
| Clima (climate) | 0,83 | 0,78 |
| Cancer | 1,00 | 1,00 |

La model card menciona ademas un baseline "Semantic similarity only" basado unicamente en la similitud coseno con el perfil, descrito en el informe de evaluacion del repositorio, pero no se aportan cifras de ese baseline en la informacion disponible. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de recuperacion (MTEB, BEIR), que no aplican a un modelo de embeddings evaluado de este modo.

Datos de calibracion aportados: para perfiles realistas (RAG, adaptacion climatica, CRISPR, finanzas domesticas, humanidades digitales), las mejores coincidencias puntuan entre 0,41 y 0,57 de coseno, mientras que el articulo mediano se situa en 0,0-0,05.

## Requisitos de hardware

- El artefacto publicado ocupa aproximadamente 23 MB (ONNX cuantizado a 8 bits), por lo que la descarga inicial es minima.
- La model card indica que el modelo es "suficientemente pequeno para descargarlo una vez y ejecutarlo en la CPU de un portatil o de un telefono en un navegador": no requiere GPU.
- VRAM dedicada estimada: no disponible en la informacion proporcionada; el modelo esta disenado para ejecucion en CPU.
- GPU recomendadas: ninguna en particular; el caso de uso declarado no contempla aceleracion por GPU. No se especifican A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible, al ser un escenario de inferencia en navegador y CPU.
- Opciones de despliegue: transformers.js 3.8.1 sobre la exportacion ONNX de Xenova; ejecucion en Web Worker dentro del navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en formato GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. Lo unico indicado es que el respaldo TF-IDF permite que la aplicacion sea usable en el primer segundo tras la apertura, mientras el modelo termina de descargarse.

## Comparativa con modelos similares

La comparativa se limita a las alternativas que la propia model card menciona como descartadas, ya que no se aportan parametros, contexto ni resultados de benchmarks de las mismas.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (MiniLM off-the-shelf, ONNX 8 bits) | no disponible (heredados del modelo base) | 256 tokens | AP 1,00 / 0,83 / 1,00 en el ranker (RAG, clima, cancer) | apache-2.0 | ONNX de ~23 MB para transformers.js |
| sentence-transformers/all-MiniLM-L6-v2 (original) | no disponible | 256 tokens | mismo modelo sin cuantizar | apache-2.0 | disponible en HuggingFace |
| Modelos de embeddings de 768 dimensiones | no disponible | no disponible | no disponible; la model card estima ganancias "modestas" en abstracts cortos | no disponible | no disponible |
| SPECTER2 (dominio cientifico) | no disponible | no disponible | no disponible | no disponible | requiere pooling personalizado; no hay builds ONNX cuantizados pequenos para transformers.js |
| Espacio TF-IDF (respaldo interno del sistema) | no aplica | no aplica | AP 0,83 / 0,78 / 1,00 en el mismo ranker | no disponible | integrado en la aplicacion |

## Limitaciones y advertencias

- **Solo ingles.** El campo `language` se limita a `en`; no hay soporte multilingue declarado.
- **Truncamiento a 256 tokens.** El tokenizador recorta la entrada (MiniLM se entreno con secuencias de 256 tokens o menos), de modo que los abstracts largos quedan representados principalmente por su primera parte. El sistema mitiga esto parcialmente limitando la indexacion a los primeros 2.000 caracteres de `"title. abstract"`.
- **Entrenamiento de dominio general.** La terminologia muy especializada puede representarse con menos precision que con modelos especificos de dominio, como reconoce la propia model card.
- **Sesgos heredados.** El repositorio hereda los sesgos de los datos de entrenamiento del modelo original; se remite a la model card de sentence-transformers/all-MiniLM-L6-v2.
- **Sin ajuste fino.** Al no haberse adaptado el modelo al dominio cientifico, no hay garantia de que el espacio de embeddings este optimizado para vocabulario de investigacion.
- **Evaluacion indirecta.** Los unicos numeros publicados miden el ranker completo, no la calidad intrinseca del embedding; no hay resultados de MTEB, BEIR ni de similitud semantica aislada. Ademas, la muestra de evaluacion es de 500 etiquetas manuales y solo tres perfiles.
- **Licencia.** Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y las del repositorio de la aplicacion por separado.
- **Adopcion nula.** El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa ni casos de produccion documentados. Los pesos no incluyen un modelo entrenado propio: es un artefacto de despliegue.
- **Riesgo de alucinacion.** No aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es un emparejamiento erroneo por similitud, parcialmente contenido por los rangos de calibracion fijos y el umbral de duplicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishaanamahajan/paper-triage-minilm-embeddings
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Exportacion ONNX cuantizada utilizada: https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Libreria transformers.js: https://github.com/huggingface/transformers.js
- Informe de evaluacion del proyecto: https://github.com/srivathsanb14/research-paper-triage/blob/main/docs/evaluation/report.md
