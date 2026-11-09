# mradermacher/Opal-Recall-GGUF

## Resumen

Opal-Recall-GGUF es la versión cuantizada en formato GGUF del modelo Opal-Recall, desarrollado originalmente por el usuario Chawtin01 y convertido por mradermacher. Se trata de un modelo de embeddings (feature-extraction) basado en la librería sentence-transformers, con 33,2 millones de parámetros totales y orientado a la generación de representaciones vectoriales de texto en inglés. Su función principal es producir embeddings de alta calidad para tareas de recuperación semántica, búsqueda por similitud y sistemas RAG.

El modelo destaca por su reducido tamaño (0,4 GB de repositorio, con cuantizaciones que van desde 0,1 GB hasta 0,2 GB) y su licencia MIT, lo que lo hace especialmente atractivo para despliegues en entornos con recursos limitados, aplicaciones edge y pipelines de recuperación de información que requieren baja latencia. Al ser un modelo de embeddings y no un modelo generativo, no produce texto libre sino vectores densos que capturan el significado semántico de las entradas.

La relevancia actual de esta ficha radica en que las cuantizaciones GGUF de modelos de embeddings permiten ejecutar búsqueda semántica y recuperación de información en CPU o en GPUs de consumo, sin necesidad de infraestructura dedicada. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings basado en sentence-transformers) |
| Parametros totales | 33.212.160 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base Chawtin01/Opal-Recall. Los tags de Hugging Face indican que se trata de un modelo de tipo sentence-transformers orientado a feature-extraction, lo que implica una arquitectura transformer encoder (probablemente basada en BERT o similar) entrenada para producir embeddings de frases u oraciones. El tamaño de 33,2 millones de parámetros es coherente con modelos encoder compactos tipo MiniLM o DistilBERT, aunque no se confirma la arquitectura exacta.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste contrastivo. La model card del repositorio GGUF se limita a indicar que son cuantizaciones estáticas del modelo original y no incluye información sobre el proceso de entrenamiento. No se han identificado innovaciones técnicas destacables documentadas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de embeddings de texto para representaciones vectoriales densas.
- Extracción de características (feature-extraction) para tareas de similitud semántica.
- Soporte para búsqueda semántica y recuperación de información (retrieval).
- Compatible con la librería sentence-transformers para integración en pipelines estándar.
- Compatible con transformers.js, lo que permite ejecución en navegador o entornos JavaScript.
- Funciona con la librería transformers de Hugging Face.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en documentación técnica: el modelo genera embeddings de fragmentos de documentación en inglés y permite recuperar los pasajes más relevantes ante una consulta, gracias a su reducido tamaño que permite indexar grandes volúmenes en CPU.
- Sistemas RAG (Retrieval-Augmented Generation) en producción: se usa como componente de recuperación para alimentar a un LLM generativo con contexto relevante, con baja latencia y sin necesidad de GPU dedicada.
- Deduplicación de contenido: permite calcular similitud entre documentos o registros para detectar duplicados o near-duplicates en bases de datos textuales en inglés.
- Clasificación de texto por similitud: se pueden generar embeddings de prototipos por categoría y asignar etiquetas a nuevas entradas mediante comparación de vectores, útil en moderación o triaje de tickets.
- Motor de recomendación basado en contenido: se generan embeddings de ítems (artículos, productos) y se recomiendan elementos similares al historial del usuario, con despliegue en entornos edge o navegador mediante transformers.js.
- Búsqueda en aplicaciones web del lado del cliente: al ser compatible con transformers.js y tener cuantizaciones de 0,1 GB, puede ejecutarse en el navegador para búsqueda semántica local sin enviar datos a un servidor.
- Agrupamiento (clustering) de textos: los embeddings permiten agrupar documentos por temática mediante técnicas como k-means, facilitando la organización de corpus en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; las versiones Q4_K_M y Q8_0 ocupan aproximadamente 0,1 GB en disco, y la f16 unos 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e integrada; también funciona en CPU sin problemas.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), transformers.js para navegador, y la librería transformers con el modelo base en safetensors. vLLM y TGI no están orientados a modelos de embeddings de este tipo, aunque podrían no ser la vía recomendada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Opal-Recall-GGUF | 33,2 M | no disponible | MIT | GGUF | Hugging Face |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Apache 2.0 | safetensors, ONNX | Hugging Face, ampliamente usado |
| paraphrase-MiniLM-L3-v2 | 17,4 M | 128 tokens | Apache 2.0 | safetensors | Hugging Face |
| bge-small-en-v1.5 | 33,4 M | 512 tokens | MIT | safetensors, GGUF | Hugging Face |

La comparativa se basa en categoría (modelos de embeddings compactos en inglés) y tamaño. No se dispone de datos de rendimiento de Opal-Recall que permitan una comparación cuantitativa con estas alternativas; los modelos citados cuentan con benchmarks públicos (MTEB) que Opal-Recall no ha publicado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado presumiblemente con datos web en inglés, es probable que herede sesgos de género, raza y cultura, pero no hay información pública al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios especializados o con vocabulario fuera de distribución.
- Limitaciones de contexto o idioma: el modelo solo soporta inglés según los tags; no se ha documentado la longitud máxima de contexto, lo que impide garantizar su comportamiento con entradas largas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no obstante, al ser una cuantización de un modelo base de terceros, conviene verificar la licencia del modelo original Chawtin01/Opal-Recall.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación comunitaria; no hay benchmarks publicados que respalden su calidad frente a alternativas consolidadas como all-MiniLM-L6-v2 o bge-small-en-v1.5. Se recomienda evaluar su rendimiento en el dominio concreto antes de desplegarlo.
- Al ser un modelo de embeddings, no debe usarse para generación de texto, razonamiento, código ni tareas conversacionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Opal-Recall-GGUF
- Modelo base: https://huggingface.co/Chawtin01/Opal-Recall
- Página de descargas del cuantizador: https://hf.tst.eu/model#Opal-Recall-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
