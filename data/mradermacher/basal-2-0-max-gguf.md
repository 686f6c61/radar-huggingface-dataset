# mradermacher/basal-2.0-max-GGUF

## Resumen

Basal-2.0-max-GGUF es la versión cuantizada en formato GGUF del modelo Remek/basal-2.0-max, publicada por mradermacher. Se trata de un modelo de 11.167.748.096 parámetros (aproximadamente 11,2 mil millones) orientado a la toma de decisiones tipadas (typed decisions), clasificación y calibración, con soporte para polaco e inglés. La cuantización permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF.

El modelo original está pensado para tareas de decisión estructurada y clasificación con calibración de confianza, un nicho distinto al de los modelos generativos generalistas. La versión de mradermacher ofrece once variantes de cuantización estáticas, desde Q2_K (4,3 GB) hasta Q8_0 (12,0 GB), lo que facilita su despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual radica en la disponibilidad de un modelo especializado en decisiones calibradas con pesos abiertos y cuantizaciones listas para producción local. No se dispone de información pública sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 11.167.748.096 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | pl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base Remek/basal-2.0-max en la documentación disponible. El recuento de parámetros (11,2 mil millones) y la librería declarada (transformers) sugieren un transformer denso, pero no se confirma el tipo exacto ni si incorpora innovaciones como atención lineal, decodificación especulativa o mezcla de expertos.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Las etiquetas del modelo (typed-decisions, decision-making, classification, calibration) indican un enfoque en tareas de decisión estructurada y calibración de probabilidades, pero se desconoce el proceso concreto de entrenamiento. La cuantización realizada por mradermacher es estática y no incluye variantes ponderadas con imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Toma de decisiones tipadas (typed decisions) y clasificación estructurada.
- Calibración de confianza en las predicciones, según las etiquetas del modelo.
- Soporte de conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas a polaco e inglés según la model card.

## Casos de uso

- Clasificación de documentos con umbrales de confianza: el modelo puede asignar categorías y calibrar la probabilidad asociada, lo que permite derivar casos ambiguos a revisión humana en flujos de gestión documental.
- Enrutamiento de tickets de soporte: dado un texto de entrada en polaco o inglés, el modelo puede decidir la categoría o el equipo destinatario, aprovechando su orientación a decisiones tipadas.
- Moderación de contenido con calibración: la capacidad de calibración permite establecer umbrales ajustables para decidir si un contenido requiere revisión, reduciendo falsos positivos en pipelines automatizados.
- Extracción de decisiones en formularios: integrado en un backend con llama.cpp, el modelo puede procesar respuestas de formularios y decidir su validez o clasificación en entornos con recursos limitados.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (6,8 GB) o Q5_K_M (8,0 GB), puede ejecutarse en GPUs de consumo para tareas de clasificación y decisión sin depender de la nube.
- Prototipado de sistemas de decisión en investigación: al ser Apache 2.0 y estar disponible en GGUF, facilita experimentos reproducibles sobre calibración y decisiones estructuradas en entornos académicos.
- Asistentes conversacionales bilingües polaco-inglés: para dominios acotados donde se requiera un modelo pequeño y desplegable localmente con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,3 GB (Q2_K), 6,8 GB (Q4_K_M), 8,0 GB (Q5_K_M), 9,3 GB (Q6_K) y 12,0 GB (Q8_0), sin contar el overhead del contexto y de la librería de inferencia.
- GPU recomendadas: no se especifican oficialmente; por tamaño, una RTX 3090 o RTX 4090 (24 GB) puede alojar cualquier cuantización con contexto amplio; una RTX 4060 Ti de 16 GB cubre hasta Q8_0 con margen ajustado.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB para cuantizaciones Q2_K a Q4_K_S, y de 12-16 GB para Q5_K_M a Q8_0.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| basal-2.0-max-GGUF | 11,2 B | no disponible | pl, en | Apache 2.0 | GGUF |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (decisión tipada y calibración) en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos conocidos del modelo base; se recomienda evaluar en el dominio objetivo antes de producción.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de clasificación y decisión, validar la calibración con datos propios.
- Cobertura lingüística limitada a polaco e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada; planificar el truncado o la estrategia de chunking sin conocer el límite real.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad y la calibración; para decisiones sensibles se recomienda Q5_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix publicadas por el autor en el momento de la ficha; las estáticas pueden ofrecer menor calidad a igual tamaño.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Remek/basal-2.0-max por si hubiera términos adicionales no reflejados en la model card.
- El repositorio ocupa 76,1 GB, por lo que la descarga completa requiere espacio en disco considerable; descargar solo la cuantización necesaria.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/basal-2.0-max-GGUF
- Modelo base: https://huggingface.co/Remek/basal-2.0-max
- Página de descargas del cuantizador: https://hf.tst.eu/model#basal-2.0-max-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/basal-2.0-max-gguf
