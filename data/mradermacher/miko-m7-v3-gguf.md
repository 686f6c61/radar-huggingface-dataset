# mradermacher/Miko-M7-V3-GGUF

## Resumen

Miko-M7-V3-GGUF es la distribucion en formato GGUF del modelo Miko-M7-V3, desarrollado originalmente por el usuario ricer0ll y cuantizado por mradermacher, un conocido publicador de cuantizaciones para llama.cpp. El modelo base es un transformer de 7.241.732.096 parametros (aproximadamente 7,2 mil millones) afinado sobre la arquitectura Mistral, orientado a generacion de texto conversacional y etiquetado como no apto para todas las audiencias. Esta cuantizacion existe para facilitar la inferencia local en hardware de consumo mediante llama.cpp y derivados.

El modelo se ha afinado sobre el dataset anthracite-org/stheno-filtered-v1.1, un conjunto de datos de instrucciones filtrado, y esta pensado para dialogos multi-turno en ingles. La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo de 7B en GPU de consumo o incluso en CPU, con un abanico de cuantizaciones que va desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

No se dispone de informacion publica sobre la longitud de contexto, la licencia ni los detalles exactos del proceso de entrenamiento en la documentacion proporcionada, por lo que estos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, segun tags) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Miko-M7-V3 sigue la arquitectura Mistral, un transformer decoder-only con atencion por ventanas deslizantes y activacion SwiGLU, segun los tags del repositorio. Cuenta con 7.241.732.096 parametros totales, lo que lo situa en la categoria de 7B. Esta cuantizacion concreta no aporta informacion adicional sobre la arquitectura interna ni sobre innovaciones tecnicas especificas.

El entrenamiento se realizo sobre el dataset anthracite-org/stheno-filtered-v1.1, un conjunto de datos de instrucciones filtrado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La cuantizacion fue realizada por mradermacher con la version 2 del proceso de cuantizacion y conversion desde formato Hugging Face, generando tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas/imatrix en el repositorio Miko-M7-V3-i1-GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento basico y respuesta a instrucciones, derivado del ajuste sobre datos de instrucciones.
- Generacion de codigo y matematicas: no confirmado en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Contenido para adultos: el tag `not-for-all-audiences` indica que el modelo puede generar contenido no apto para todo publico.

## Casos de uso

- Prototipado de chatbots conversacionales en local: el modelo puede gestionar dialogos multi-turno en ingles y ejecutarse en una GPU de consumo con cuantizaciones Q4_K_M (4,5 GB), lo que lo hace adecuado para pruebas de concepto sin infraestructura en la nube.
- Asistente personal offline: con la cuantizacion Q4_K_S (4,2 GB) se puede desplegar en un portatil con GPU de 6-8 GB o incluso en CPU, ofreciendo un asistente de texto que no requiere conexion a internet.
- Generacion creativa de ficcion y roleplay: el ajuste conversacional y el tag de contenido para adultos lo orientan a aplicaciones de escritura creativa y simulacion de personajes, siempre con las advertencias de contenido.
- Educacion y experimentacion con cuantizaciones: sirve como caso practico para comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de 7B, util en cursos de IA y talleres de llama.cpp.
- Integracion en pipelines de texto por lotes: mediante llama.cpp o servidores compatibles con la API de OpenAI, se puede usar para tareas de generacion masiva de texto en ingles donde no se requiera maxima calidad.
- Evaluacion de modelos afinados de la comunidad: investigadores pueden usar esta cuantizacion para comparar el rendimiento de Miko-M7-V3 frente a otros fine-tunes de Mistral 7B en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para un modelo de 7B.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (por ejemplo, llama-cpp-python o text-generation-webui). El repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Miko-M7-V3-GGUF | 7,2B | no disponible | no disponible | GGUF | Fine-tune conversacional de Mistral, solo ingles |
| Mistral-7B-Instruct-v0.2 | 7,2B | 32k (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Referencia generalista, multilingue |
| Zephyr-7B-beta | 7,2B | 32k (segun documentacion publica) | MIT | safetensors, GGUF | Fine-tune con DPO, orientado a instrucciones |
| OpenHermes-2.5-Mistral-7B | 7,2B | 32k (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Fine-tune conversacional popular en la comunidad |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de datos de rendimiento comparativo para Miko-M7-V3 en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un fine-tune sobre datos filtrados de la comunidad, puede heredar sesgos del dataset y del modelo base.
- Riesgo de alucinacion: presente como en cualquier modelo de 7B; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ricer0ll/Miko-M7-V3 antes de cualquier despliegue en produccion.
- Contenido no apto para todo publico: el tag `not-for-all-audiences` indica que el modelo puede generar contenido adulto o sensible; requiere moderacion en aplicaciones publicas.
- Al ser una cuantizacion, las versiones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No hay garantias de soporte ni mantenimiento por parte del autor de la cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Miko-M7-V3-GGUF
- Modelo base: https://huggingface.co/ricer0ll/Miko-M7-V3
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Miko-M7-V3-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Miko-M7-V3-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
