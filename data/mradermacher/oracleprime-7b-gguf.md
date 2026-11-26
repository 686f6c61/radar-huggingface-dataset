# mradermacher/OraclePrime-7B-GGUF

## Resumen

OraclePrime-7B-GGUF es la colección de cuantizaciones en formato GGUF del modelo OraclePrime-7B, desarrollado originalmente por el usuario van-jinp y cuantizado por mradermacher. Se trata de un modelo de lenguaje de arquitectura transformer con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), orientado a tareas conversacionales y con soporte declarado únicamente para el idioma chino (zh). La model card original no documenta detalles sobre la arquitectura interna, el proceso de entrenamiento ni la longitud de contexto.

La relevancia de esta ficha reside en que el repositorio ofrece un conjunto amplio de cuantizaciones estáticas que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal, presumiblemente visión. Esto permite desplegar el modelo en hardware de consumo mediante llama.cpp u Ollama, algo imposible con los pesos originales en precisión completa.

No obstante, la información disponible es muy limitada: no hay datos de benchmarks, no se especifica la longitud de contexto, no se detalla la composición del dataset de entrenamiento y la licencia es de tipo "other" bajo el identificador `oracleprime-assets`, lo que obliga a revisar los términos antes de cualquier uso comercial. El modelo base fue publicado en noviembre de 2026 y el repositorio de cuantizaciones no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no disponible (no es MoE, segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | chino (zh) |
| Licencia | oracleprime-assets (licencia "other", enlace a LICENSES.md del modelo base) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base OraclePrime-7B. Por el número de parámetros (7,6 B) y la librería declarada (transformers), se trata de un transformer decoder-only de escala 7B, pero no se especifica si emplea atención con ventana deslizante, atención lineal, mezcla de expertos u otras variantes. La presencia de ficheros mmproj en el repositorio GGUF sugiere que el modelo incorpora un proyector multimodal para procesar imágenes, aunque la model card no lo confirma explícitamente.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La cuantización fue realizada por mradermacher con la versión 2 de su pipeline (`quantize_version: 2`) y conversión a formato HF (`convert_type: hf`). No se han generado cuantizaciones ponderadas con imatrix para este modelo, según indica el propio autor en la model card.

## Capacidades

- Generación de texto conversacional en chino, según el campo `language: zh` de la model card.
- Soporte multimodal probable (visión): el repositorio incluye ficheros `mmproj` en Q8_0 y f16, necesarios para cargar el proyector visual en llama.cpp.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a través de infraestructura de inferencia estándar.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de código, matemáticas ni modo "thinking".
- Capacidades multilingües: limitadas al chino según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Asistente conversacional en chino para aplicaciones de mensajería: el modelo puede gestionar diálogos multi-turno en chino y desplegarse en servidores modestos usando la cuantización Q4_K_M (4,8 GB), adecuada para entornos con GPU de 8 GB.
- Procesamiento de documentos con imágenes en chino: gracias a los ficheros mmproj, puede emplearse en pipelines de extracción de información de capturas o formularios escaneados, combinando el modelo lingüístico con el proyector visual.
- Prototipado rápido en local: las cuantizaciones Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp, útil para pruebas de concepto antes de invertir en infraestructura.
- Investigación sobre cuantización: el repositorio ofrece un espectro completo de cuantizaciones del mismo modelo, lo que facilita estudios comparativos de degradación de calidad entre Q2_K, Q4_K_M y Q8_0 sobre una misma base.
- Chatbot de soporte interno para equipos con personal sinohablante: al estar limitado al chino, encaja en organizaciones con plantilla que opera en ese idioma y prefiere ejecución on-premise por motivos de privacidad.
- Despliegue en entornos con restricciones de red: al distribuirse como GGUF, puede ejecutarse completamente offline en estaciones de trabajo, sin depender de APIs externas, siempre que se respete la licencia `oracleprime-assets`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 4,8 GB (Q4_K_M), 6,4 GB (Q6_K) y 8,2 GB (Q8_0), sin contar el espacio adicional para el contexto KV y, en su caso, el proyector mmproj (1,0-1,5 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 no son necesarias para un modelo de 7,6 B, pero permitirían mayor throughput en serving concurrente.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q3_K_S hasta una RTX 4090 con Q8_0; las cuantizaciones Q4_K_S y Q4_K_M están marcadas como "fast, recommended" por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se usan los pesos originales en transformers.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OraclePrime-7B-GGUF | 7,6 B | no disponible | zh | oracleprime-assets (other) | GGUF |
| Qwen2.5-7B-Instruct | 7,6 B | 32 768 tokens (tipico en la familia) | multilingue | Apache 2.0 / Qwen license | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,0 B | 131 072 tokens | multilingue | Llama 3.1 Community License | safetensors, GGUF |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 tokens | multilingue | Apache 2.0 | safetensors, GGUF |

La comparación con modelos de la misma escala revela que OraclePrime-7B carece de documentación pública sobre contexto, benchmarks y licencia clara, mientras que las alternativas citadas ofrecen ventanas de contexto documentadas, licencias permisivas o semirrestrictivas conocidas y resultados de evaluación publicados. La principal ventaja de OraclePrime-7B-GGUF es la disponibilidad de cuantizaciones estáticas listas para usar y el soporte multimodal vía mmproj, aunque la falta de datos impide evaluar su calidad relativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos en chino, puede reflejar sesgos culturales y lingüísticos de ese corpus.
- Riesgo de alucinación: sin datos de evaluación ni de alineación (RLHF/DPO), el riesgo es desconocido y potencialmente alto en dominios especializados.
- Limitaciones de contexto e idioma: solo se declara chino; no hay información sobre la longitud de contexto, lo que impide planificar aplicaciones con documentos largos.
- Restricciones de licencia: la licencia `oracleprime-assets` es de tipo "other" y remite a un fichero LICENSES.md del modelo base; es imprescindible revisarlo antes de cualquier uso comercial, ya que podría imponer condiciones no evidentes.
- Caveats para producción: el repositorio no registra descargas ni validación comunitaria, no hay benchmarks publicados y la model card es mínima; se recomienda evaluar exhaustivamente el modelo en el caso de uso concreto antes de desplegarlo.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable según las notas del propio autor ("lower quality"), por lo que no se recomiendan para tareas sensibles.
- No se han generado cuantizaciones imatrix para este modelo, lo que limita la calidad de las cuantizaciones de baja precisión en comparación con modelos que sí las ofrecen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OraclePrime-7B-GGUF
- Modelo base: https://huggingface.co/van-jinp/OraclePrime-7B
- Licencia del modelo base: https://huggingface.co/van-jinp/OraclePrime-7B/blob/main/LICENSES.md
- Página de descargas del autor: https://hf.tst.eu/model#OraclePrime-7B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
