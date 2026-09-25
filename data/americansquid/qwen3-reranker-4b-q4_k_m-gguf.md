# americansquid/Qwen3-Reranker-4B-Q4_K_M-GGUF

## Resumen
Esta ficha describe `americansquid/Qwen3-Reranker-4B-Q4_K_M-GGUF`, una conversion no oficial al formato GGUF del modelo `Qwen/Qwen3-Reranker-4B` de Alibaba Qwen. La conversion la firma el usuario americansquid y se ha generado de forma automatica con el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. Se trata, por tanto, de un artefacto de cuantizacion, no de un modelo entrenado desde cero: los pesos subyacentes son los del reranker original.

Qwen3-Reranker-4B pertenece a la serie Qwen3 Embedding, que Qwen publica en tres tamanos (0,6B, 4B y 8B) y que esta construida sobre los modelos densos de la familia Qwen3. Su funcion es la de un cross-encoder de ranking: recibe un par consulta-documento y devuelve una puntuacion de relevancia, lo que lo situa en la segunda etapa de los pipelines de recuperacion aumentada (RAG) y de busqueda semantica. El modelo tiene 4.021.789.696 parametros y aqui se distribuye unicamente en cuantizacion Q4_K_M, con un repositorio de 2,5 GB bajo licencia Apache 2.0.

Su relevancia practica es que permite ejecutar un reranker de 4B en hardware de consumo o en servidores sin GPU de gran capacidad, algo que con los pesos completos en BF16 exigiria aproximadamente el doble de memoria. El precio a pagar es la perdida de precision inherente a la cuantizacion de 4 bits y la ausencia de material de referencia: el repositorio no incluye benchmarks, no documenta la longitud de contexto soportada y acumula cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de la familia Qwen3 con cabeza de ranking; detalle interno no disponible |
| Parametros totales | 4.021.789.696 (~4,02 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, valor de ejemplo y no limite maximo) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `qwen3-reranker-4b-q4_k_m.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Tarea declarada (pipeline) | text-ranking |
| Modelo base | Qwen/Qwen3-Reranker-4B |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento
No se dispone de informacion sobre el entrenamiento especifico de este repositorio, porque se limita a convertir a GGUF el checkpoint `Qwen/Qwen3-Reranker-4B` mediante llama.cpp. Segun la documentacion publica de la serie Qwen3 Embedding, los rerankers se construyen sobre los modelos densos de Qwen3 y se especializan en tareas de embedding y ranking, pero esta conversion no aporta datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

Tecnicamente, el modelo es un decoder transformer causal reutilizado como cross-encoder: se procesa el par consulta-documento a traves de la plantilla de chat y se extrae una puntuacion de relevancia en lugar de generar texto libre. La innovacion del repositorio es exclusivamente de formato: la cuantizacion Q4_K_M reduce el peso a unos 2,5 GB manteniendo 4 bits por parametro en la mayoria de las matrices y una precision superior en capas criticas, lo que permite inferencia en llama.cpp sobre CPU, CUDA y Metal. No hay decodificacion especulativa, atencion lineal ni modificaciones arquitectonicas respecto al modelo original.

## Capacidades
- Puntuacion de relevancia de pares consulta-documento (cross-encoder), la funcion principal del modelo.
- Reranking de listas de candidatos recuperados por un sistema de busqueda vectorial o lexica.
- Integracion en pipelines de RAG como segunda etapa de ordenacion.
- Uso mediante `llama-server`, que expone el modelo por HTTP, y `llama-cli` para pruebas puntuales.
- Compatibilidad con la libreria `transformers` y con el ecosistema `sentence-transformers` a nivel de modelo base.
- Soporte de plantilla conversacional (el tag `conversational` aparece en el repositorio), necesaria para construir la entrada del reranker.
- No es un modelo generativo: no produce respuestas de texto libre, resumenes ni codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Segunda etapa de RAG: tras recuperar los 50-100 fragmentos mas similares con un indice vectorial, el reranker reordena ese subconjunto por relevancia real respecto a la consulta antes de construir el prompt del modelo generador. El tamano de 4B permite hacerlo en local sin depender de APIs externas.
- Busqueda documental interna: en un corpus juridico, medico o tecnico, el reranker afina los resultados de un buscador BM25 o denso, reduciendo el ruido que llega al usuario final.
- Filtrado de contexto para agentes: en un agente con multiples fuentes y herramientas, se usa para seleccionar que pasajes merecen entrar en la ventana de contexto del LLM, recortando coste de tokens y latencia.
- Despliegue on-premise con requisitos de soberania del dato: al ejecutarse con llama.cpp sobre CPU o GPU modesta, encaja en entornos donde no se permite enviar consultas a servicios en la nube.
- Evaluacion offline de sistemas de recuperacion: generar puntuaciones de relevancia sobre un conjunto de pares etiquetados para calcular metricas como nDCG, MRR o MAP y comparar configuraciones de chunking o embeddings.
- Deduplicacion y agrupacion de resultados: puntuar pares de documentos muy similares para descartar duplicados en un catalogo de contenido antes de presentarlos.
- Prototipado en portatil: con 2,5 GB de pesos, un desarrollador puede montar un prototipo de ranking completamente local en un equipo con 8-16 GB de RAM, sin GPU dedicada.
- Aumento de la precision en recomendadores de contenido textual: ordenar articulos, productos o respuestas candidatas segun su afinidad con una consulta o perfil descrito en lenguaje natural.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de americansquid no incluye tablas de evaluacion, y los resultados de la busqueda web tampoco aportan cifras de MMLU, MTEB, BEIR ni de tareas de ranking para este artefacto GGUF concreto. Cualquier comparacion numerica con la version en BF16 exigiria ejecutar una evaluacion propia sobre el mismo conjunto de datos.

## Requisitos de hardware
- Peso en disco y en memoria: aproximadamente 2,5 GB para el archivo Q4_K_M, mas el overhead del contexto y de la libreria.
- VRAM estimada: del orden de 3-4 GB con contextos cortos (2-4k tokens); aumenta linealmente con la longitud de contexto configurada.
- GPU de consumo compatibles: si, cabe en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 8 GB, GTX 1660 6 GB y en Apple Silicon con 8 GB o mas de memoria unificada.
- GPU de datacenter: A100, H100, L40S o similares quedan sobredimensionadas para un solo modelo, pero permiten servir muchas peticiones concurrentes o alojar el modelo junto a un LLM mayor.
- Inferencia solo CPU: viable con llama.cpp, especialmente en maquinas con AVX2/AVX-512, a costa de mayor latencia por par puntuado.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama importando el GGUF con un Modelfile propio, y el propio script de llama.cpp documentado en la model card. Para los pesos originales en safetensors, `transformers` y `sentence-transformers`; para servir el modelo base como scoring, versiones recientes de vLLM y text-embeddings-inference, sujetas a verificacion.
- Latencia y throughput: no disponibles. Dependen del hardware, del numero de tokens por par y del tamano del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| americansquid/Qwen3-Reranker-4B-Q4_K_M-GGUF | 4,02 B | GGUF Q4_K_M | apache-2.0 | Conversion no oficial, sin benchmarks publicados, 0 descargas |
| Qwen/Qwen3-Reranker-4B | 4,02 B | safetensors | apache-2.0 | Modelo original de Qwen; referencia para comparar el efecto de la cuantizacion |
| Qwen/Qwen3-Reranker-0.6B | ~0,6 B | safetensors | apache-2.0 | Alternativa mas ligera de la misma familia; menor coste, presumiblemente menor precision |
| Qwen/Qwen3-Reranker-8B | ~8 B | safetensors | apache-2.0 | Version mayor de la misma familia; requiere mas memoria (no disponible el detalle) |
| QuantFactory/Qwen3-Reranker-4B-GGUF | 4,02 B | GGUF (varias cuantizaciones) | apache-2.0 (heredada) | Conversion alternativa del mismo modelo base; ofrece mas opciones de cuantizacion |
| BAAI/bge-reranker-v2-m3 | ~0,57 B | safetensors | consultar model card | Reranker multilingue ampliamente usado; datos de licencia y contexto no disponibles aqui |

## Limitaciones y advertencias
- No es un modelo generativo. Cualquier intento de usarlo como chatbot o generador de texto produce resultados sin sentido; el ejemplo `llama-cli` de la model card es una plantilla generica de llama.cpp y no refleja el uso correcto del reranker.
- Conversion de terceros. El autor no es Qwen, el modelo se genero automaticamente con GGUF-my-repo y no hay validacion publica de que las puntuaciones coincidan con las del checkpoint original en BF16.
- Cero descargas y cero valoraciones en el momento de redactar la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- La cuantizacion Q4_K_M altera ligeramente los logits. Si se usan umbrales de corte fijos para decidir si un documento es relevante, conviene recalibrarlos con datos propios.
- Longitud de contexto no documentada. El valor `-c 2048` del ejemplo es una configuracion de arranque, no una especificacion; superar el limite real del modelo puede degradar las puntuaciones o truncar la entrada.
- Idiomas soportados no especificados en esta ficha. La familia Qwen3 declara cobertura multilingue amplia, pero no hay confirmacion para este artefacto concreto ni evaluacion por idioma.
- Riesgo de sesgo heredado del corpus de preentrenamiento de Qwen3, que puede traducirse en puntuaciones de relevancia sistematicamente distintas segun el idioma, el dominio o el registro del texto.
- No hay riesgo de alucinacion en el sentido generativo, pero si de puntuaciones mal calibradas: un reranker puede ordenar mal documentos cuando la consulta es ambigua o el dominio es muy especializado.
- Licencia Apache 2.0, que permite uso comercial y modificacion con atribucion; aun asi, conviene revisar la model card del modelo base por si Qwen anade condiciones adicionales.
- Sin garantias de mantenimiento: el repositorio no se ha actualizado desde su creacion y no hay indicios de que vaya a recibir nuevas cuantizaciones o correcciones.

## Enlaces
- Repositorio GGUF: https://huggingface.co/americansquid/Qwen3-Reranker-4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Conversion alternativa en GGUF: https://huggingface.co/QuantFactory/Qwen3-Reranker-4B-GGUF
- Ficha en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-Reranker-4B
- API alojada en DeepInfra: https://deepinfra.com/Qwen/Qwen3-Reranker-4B/api
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Imagen Docker de la familia Qwen3: https://hub.docker.com/r/ai/qwen3
