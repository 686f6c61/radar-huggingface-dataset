# alphaedge-ai/multilingual-e5-large-instruct-mya-32768

## Resumen

`alphaedge-ai/multilingual-e5-large-instruct-mya-32768` es un modelo de embeddings de frases (sentence-similarity) derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* de vocabulario, especializado para el idioma birmano (código ISO `my`). El modelo conserva la arquitectura XLM-RoBERTa del original, pero reduce el vocabulario de 250.037 a 32.768 tokens, lo que se traduce en una disminución del 86,89 % en el tamaño del vocabulario y del 39,73 % en el número total de parámetros (de 559.890.432 a 337.442.816). El resultado es un checkpoint de 0,7 GB en formato safetensors, compatible con `sentence-transformers` y con `text-embeddings-inference`.

La relevancia de este modelo radica en su eficiencia para despliegues en producción orientados a birmano: al eliminar los tokens del vocabulario original que no se usan habitualmente en ese idioma, se reduce el uso de memoria y el coste computacional de la capa de embeddings, manteniendo un rendimiento esperado similar al del modelo base para tareas de similitud semántica y recuperación en birmano. Está pensado para pipelines de búsqueda semántica, RAG y clustering de documentos en dicho idioma.

El modelo lo publica la organización `alphaedge-ai` bajo licencia MIT, con fecha de creación en febrero de 2026 y última actualización en noviembre de 2026. El proceso de selección de tokens se realizó sobre 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, y el modelo resultante está pensado exclusivamente para birmano: el propio autor advierte que su rendimiento en otros idiomas puede degradarse al haberse eliminado tokens no frecuentes en el idioma objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), derivada de `intfloat/multilingual-e5-large-instruct` |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base E5-large soporta 512 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo contiene pesos safetensors (el tag `base_model:quantized` hace referencia a la reduccion de vocabulario, no a cuantizacion numerica) |
| Idiomas soportados | birmano (`my`); el autor advierte que otros idiomas pueden rendir peor |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, la misma familia arquitectonica que el modelo base `intfloat/multilingual-e5-large-instruct`. No se ha reentrenado desde cero: se ha aplicado una reduccion de vocabulario (*trimming*) sobre el checkpoint original, seleccionando los 32.768 tokens mas relevantes para el birmano a partir de un corpus de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. La capa de embeddings de tokens se recorta en consecuencia, y el resto de pesos del transformer se conserva del modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento original, ni sobre si hubo etapas de RLHF o DPO (los modelos E5 se entrenan con objetivos contrastivos de similitud de frases, no con RLHF). La innovacion tecnica destacable es precisamente el *trimming* de vocabulario: reduce el numero de parametros y el footprint de memoria sin modificar la profundidad ni la anchura del transformer, lo que permite reutilizar el conocimiento del modelo base para el idioma objetivo con un coste de almacenamiento y de inferencia menor.

## Capacidades

- Generacion de embeddings de frases para tareas de similitud semantica y recuperacion de informacion en birmano.
- Codificacion separada de consultas (`encode_query`) y documentos (`encode_document`), siguiendo la convencion de la familia E5.
- Calculo de similitudes coseno entre embeddings de consulta y documento para ranking.
- Soporte de instrucciones en la entrada (herencia del sufijo `-instruct` del modelo base), orientado a tareas de retrieval.
- Compatibilidad con `sentence-transformers` y con `text-embeddings-inference` (tag `text-embeddings-inference` y `endpoints_compatible`).
- Capacidades multilingues limitadas: el modelo esta optimizado para birmano y puede degradarse en otros idiomas.
- No soporta tool calling, function calling, agentes, vision ni audio: es un modelo de embeddings, no un modelo generativo.

## Casos de uso

- Busqueda semantica en birmano: indexar un corpus de documentos en birmano con `encode_document` y recuperar los fragmentos mas relevantes para una consulta con `encode_query` y similitud coseno, aprovechando la reduccion de vocabulario para abaratar el almacenamiento de embeddings.
- RAG (retrieval-augmented generation) sobre documentacion en birmano: usar el modelo como retriever en un pipeline que alimente a un LLM generativo, con un footprint de 0,7 GB que facilita el despliegue junto al generador.
- Deduplicacion y clustering de textos: agrupar noticias o registros en birmano por similitud de embeddings para eliminar duplicados o segmentar tematicamente un corpus.
- Moderacion y clasificacion de contenido: comparar embeddings de mensajes de usuario contra embeddings de referencia de categorias para clasificar o filtrar contenido en birmano.
- Sistemas de recomendacion de contenido: calcular similitud entre el perfil de un usuario (embedding agregado de sus lecturas) y el catalogo de articulos en birmano.
- Despliegue en infraestructura modesta: al tener 337 millones de parametros y 0,7 GB en safetensors, puede servirse con `text-embeddings-inference` en una unica GPU consumer, lo que abarata el coste por embedding frente al modelo base de 559 millones de parametros.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre una frase original en birmano y su traduccion o parafrasis para detectar desviaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, MTEB, retrieval ni ninguna otra metrica numerica; solo se aportan las estadisticas de reduccion de vocabulario y de parametros (86,89 % y 39,73 %, respectivamente).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,35 GB (337 M parametros x 4 bytes), mas el overhead de activaciones y del tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB de pesos, mas overhead; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; para lotes grandes o alto throughput, una RTX 4090, A100 o H100 ofrece margen sobrado.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes; tambien puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (tag explicito en el repo), y servidores compatibles con la API de embeddings de Hugging Face (`endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tener un 39,73 % menos de parametros que el modelo base, se espera un throughput por embedding superior al de `intfloat/multilingual-e5-large-instruct` en el mismo hardware, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| `alphaedge-ai/multilingual-e5-large-instruct-mya-32768` | 337.442.816 | 32.768 | birmano (optimizado) | MIT | no disponible |
| `intfloat/multilingual-e5-large-instruct` (base) | 559.890.432 | 250.037 | multilingue | MIT | no disponible en esta ficha |
| `intfloat/multilingual-e5-base` | no disponible en esta ficha | no disponible | multilingue | MIT | no disponible |
| `intfloat/multilingual-e5-small` | no disponible en esta ficha | no disponible | multilingue | MIT | no disponible |

La comparativa se limita a la familia E5 porque no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos especializados en birmano en la informacion proporcionada. El modelo trimmed se diferencia del base por un 39,73 % menos de parametros y un vocabulario un 86,89 % menor, a costa de perder cobertura en idiomas distintos del birmano.

## Limitaciones y advertencias

- El modelo esta optimizado exclusivamente para birmano; el autor advierte que puede no rendir bien en otros idiomas porque se eliminaron tokens no frecuentes en el idioma objetivo.
- Al ser un modelo de embeddings y no generativo, no produce texto, no razona de forma autonoma y no soporta tool calling ni agentes.
- Riesgo de sesgo: el corpus de mineria (`lbourdois/fineweb-2-trimming`, 200.000 textos) puede no representar todos los registros del birmano (formal, coloquial, tecnico), lo que puede sesgar la seleccion de tokens y, por extension, la calidad de los embeddings en dominios infrarepresentados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperacion si los embeddings no discriminan bien dominios especializados.
- Limitacion de contexto: no se especifica la longitud maxima de secuencia en la informacion disponible; conviene verificar la configuracion del modelo base antes de usarlo con documentos largos.
- Restricciones de licencia: MIT permite uso comercial, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base y del dataset de mineria.
- Caveat de produccion: el modelo tiene solo 7 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria extensa; se recomienda evaluarlo en el dominio concreto antes de desplegarlo.
- El tag `base_model:quantized` hace referencia a la reduccion de vocabulario, no a una cuantizacion numerica de los pesos; no debe interpretarse como un modelo en 4 u 8 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-mya-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Multilingual E5: https://arxiv.org/abs/2402.05672
- Imagen de estadisticas del trimming: https://raw.githubusercontent.com/lbourdois/blog/refs/heads/master/assets/images/Trimming/me5-large-32768.png
