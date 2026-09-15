# mradermacher/Mahakal-AI-Fusion-v3.0-GGUF

## Resumen

Mahakal-AI-Fusion-v3.0-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo UX4567/Mahakal-AI-Fusion-v3.0. No se trata de un modelo entrenado desde cero, sino de un merge construido con mergekit (etiquetas `mergekit` y `merge` en el repositorio) y posteriormente convertido a GGUF. El autor del repositorio, mradermacher, es un actor conocido en el ecosistema de cuantización y publica habitualmente versiones GGUF de modelos de terceros para su uso con llama.cpp y derivados, aunque en este caso no figura como autor del modelo original.

El modelo base tiene 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), según los metadatos reales de safetensors del repositorio, y está etiquetado como conversacional y con soporte únicamente de inglés (`en`). El repositorio ocupa 27,9 GB en total porque aloja doce variantes de cuantización distintas, desde Q2_K (1,4 GB) hasta f16 (6,3 GB). Es relevante ahora porque permite ejecutar un modelo de ~3B en hardware de consumo con calidad razonable, algo habitual en el segmento de modelos pequeños para inferencia local.

La información pública disponible es muy limitada: no se especifica la licencia, no hay resultados de benchmarks, no se documenta la longitud de contexto ni la arquitectura concreta, y el modelo acumula 0 descargas y 0 "likes" en el momento de la consulta. Esto lo convierte en un artefacto poco validado por la comunidad, útil para experimentación pero arriesgado como base de un despliegue en producción sin evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (merge creado con mergekit; la model card no especifica la arquitectura interna) |
| Parámetros totales | 3.085.938.688 (~3,09 B), dato real de safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el formato de pesos del modelo base no está indicado |
| Librería declarada | transformers |
| Tamaño del repositorio | 27,9 GB (incluye todas las cuantizaciones) |
| Modelo base | UX4567/Mahakal-AI-Fusion-v3.0 |
| Etiquetas | transformers, gguf, mergekit, merge, en, conversational, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-15 |
| Última actualización (metadatos HF) | 2026-09-15 |

Ficheros de cuantización publicados, con tamaño indicado por el autor:

| Fichero | Tipo | Tamaño (GB) | Notas del autor |
|---|---|---|---|
| Mahakal-AI-Fusion-v3.0.Q2_K.gguf | Q2_K | 1,4 | |
| Mahakal-AI-Fusion-v3.0.Q3_K_S.gguf | Q3_K_S | 1,6 | |
| Mahakal-AI-Fusion-v3.0.Q3_K_M.gguf | Q3_K_M | 1,7 | calidad inferior |
| Mahakal-AI-Fusion-v3.0.Q3_K_L.gguf | Q3_K_L | 1,8 | |
| Mahakal-AI-Fusion-v3.0.IQ4_XS.gguf | IQ4_XS | 1,9 | |
| Mahakal-AI-Fusion-v3.0.Q4_K_S.gguf | Q4_K_S | 1,9 | rápido, recomendado |
| Mahakal-AI-Fusion-v3.0.Q4_K_M.gguf | Q4_K_M | 2,0 | rápido, recomendado |
| Mahakal-AI-Fusion-v3.0.Q5_K_S.gguf | Q5_K_S | 2,3 | |
| Mahakal-AI-Fusion-v3.0.Q5_K_M.gguf | Q5_K_M | 2,3 | |
| Mahakal-AI-Fusion-v3.0.Q6_K.gguf | Q6_K | 2,6 | muy buena calidad |
| Mahakal-AI-Fusion-v3.0.Q8_0.gguf | Q8_0 | 3,4 | rápido, mejor calidad |
| Mahakal-AI-Fusion-v3.0.f16.gguf | f16 | 6,3 | 16 bpw, excesivo según el autor |

Nota del repositorio: las cuantizaciones ponderadas o con matriz de importancia (imatrix) no están disponibles en el momento de la publicación, y el autor indica que podrían no llegar a publicarse.

## Arquitectura y entrenamiento

La model card no describe ninguna arquitectura ni proceso de entrenamiento: el repositorio es únicamente un conjunto de conversiones estáticas del modelo UX4567/Mahakal-AI-Fusion-v3.0. Las etiquetas `mergekit` y `merge` indican que el modelo base se construyó mediante fusión de pesos con la herramienta mergekit, una técnica que combina los tensores de dos o más modelos existentes sin entrenamiento adicional o con un ajuste mínimo posterior. No se especifica qué método de fusión se empleó (linear, SLERP, TIES, DARE, passthrough, etc.), ni qué modelos se fusionaron, ni sus proporciones.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF, DPO o SFT, ni sobre innovaciones técnicas como atención lineal, decodificación especulativa o modos de razonamiento. Al ser un merge, el modelo hereda las características de sus progenitores, pero estos no se identifican en la información disponible, por lo que no es posible trazarla procedencia de los datos ni de los pesos.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Conversaciones multiturno con formato de chat instructivo: el pipeline declarado es no disponible, pero la etiqueta conversational y el uso habitual de los GGUF de mradermacher apuntan a un uso tipo asistente.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que el artefacto puede servirse mediante soluciones de inferencia compatibles con GGUF.
- Ejecución local en CPU y GPU a través del ecosistema llama.cpp y derivados, al distribuirse exclusivamente en GGUF.
- Capacidades multilingües: limitadas al inglés (`en`); no se declara soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Visión, audio o modo de pensamiento explícito: no disponible.
- Ajuste fino posterior (LoRA/QLoRA) sobre el modelo base: teóricamente posible en el modelo original, pero no confirmado en la información disponible.

## Casos de uso

- Asistente conversacional local en inglés: al ocupar entre 1,4 GB y 3,4 GB en sus cuantizaciones habituales, puede desplegarse en un portátil o en un equipo sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo un chatbot que no envía datos a servicios externos.
- Prototipado rápido de interfaces de chat: la variedad de tamaños permite integrar el modelo en demos y pruebas de producto con tiempos de descarga mínimos, sustituyéndolo después por un modelo mayor si la calidad resulta insuficiente.
- Generación de texto y resumen de documentos cortos en inglés: para tareas de reescritura, extracción de ideas principales o generación de borradores donde no se requiere contexto largo.
- Generación de datos sintéticos en inglés: útil para aumentar datasets de ajuste fino o para crear ejemplos de conversación en pipelines de evaluación, siempre con revisión humana posterior.
- Experimentación con técnicas de merging: al ser un artefacto derivado de mergekit, sirve como caso de estudio para analizar cómo se comportan las fusiones de pesos frente a modelos entrenados de forma convencional.
- Comparación de cuantizaciones: el repositorio incluye doce variantes del mismo modelo, lo que permite medir empíricamente la degradación de perplejidad y de calidad cualitativa entre Q2_K y f16 en hardware propio.
- Inferencia en el borde (edge) o en contenedores con memoria limitada: una cuantización Q4_K_M de 2,0 GB cabe en instancias pequeñas o en dispositivos con 4-8 GB de RAM, algo inviable con modelos de 7B o superiores.
- Servicio de texto en endpoints compatibles con GGUF: la etiqueta `endpoints_compatible` sugiere su uso en infraestructuras gestionadas de inferencia, aunque sin benchmarks que respalden la calidad del servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad medida sobre las distintas cuantizaciones. Tampoco hay datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del tamaño de los pesos; la caché KV depende de una configuración de contexto, número de capas y cabezas de atención que no está disponible):
  - Q2_K: ~2,5 GB.
  - Q4_K_S / Q4_K_M / IQ4_XS: ~3 a 4 GB.
  - Q6_K: ~4,5 GB.
  - Q8_0: ~5,5 GB.
  - f16: ~8 a 9 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar todas las cuantizaciones, incluidas las de mayor precisión. Ejemplos razonables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Las GPU de centro de datos (A100, H100, L40S) son innecesarias para este tamaño y solo se justificarían por agregación de muchas instancias en servicio.
- ¿Cabe en GPU de consumo? Sí, con holgura. En tarjetas de 6 GB (GTX 1660, RTX 2060) funcionan bien Q4_K_M y Q5_K_M; en 4 GB conviene bajar a Q3_K_M o Q2_K. También es viable la ejecución íntegra en CPU con 4-8 GB de RAM en las cuantizaciones pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI incorporan soporte de GGUF, aunque con limitaciones y de forma menos madura que el ecosistema llama.cpp; la etiqueta `endpoints_compatible` apunta a despliegues gestionados sobre este tipo de runtime.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia de primera respuesta para este modelo.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus model cards públicas y no de la información proporcionada en esta búsqueda. Para este merge no existen resultados de benchmarks, por lo que la columna de rendimiento figura como no disponible en todos los casos.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| Mahakal-AI-Fusion-v3.0 (GGUF) | ~3,09 B | no disponible | no disponible | no disponible | GGUF, 0 descargas, 0 likes |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens nativos (ampliable con YaRN) | Apache-2.0 | no disponible en esta comparación | safetensors y GGUF en múltiples repositorios |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | no disponible en esta comparación | safetensors y GGUF en múltiples repositorios |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | no disponible en esta comparación | safetensors y GGUF en múltiples repositorios |

Diferencias clave: los tres modelos de referencia publican licencia explícita y contexto declarado, mientras que Mahakal-AI-Fusion-v3.0 no ofrece ninguno de los dos datos. Los modelos de referencia cuentan con adopción masiva de la comunidad y cuantizaciones mantenidas por varios autores; este merge tiene cero descargas y una única fuente de cuantizaciones.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse el uso comercial. Al ser un merge de modelos no identificados, la licencia final depende de las licencias de los modelos progenitores, que no se documentan.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, código o matemáticas. Cualquier decisión de adopción debería basarse en una evaluación propia.
- Origen opaco: no se indica qué modelos se fusionaron, con qué método ni con qué proporciones, lo que impide auditar la procedencia de los pesos y de los datos subyacentes.
- Sesgos desconocidos: al no documentarse el dataset ni los modelos base, no se puede caracterizar el sesgo, pero se heredará el de los modelos fusionados.
- Riesgo de alucinación: no evaluado. En modelos de ~3B el riesgo de invención de hechos y de citas falsas es habitualmente alto, aunque no hay mediciones para este caso concreto.
- Idioma: soporte declarado únicamente en inglés. El rendimiento en castellano es previsiblemente bajo o inestable y no está documentado.
- Longitud de contexto desconocida: no es posible planificar tareas de contexto largo ni configurar la caché KV con criterio sin consultar la configuración del modelo base.
- Degradación por cuantización: las variantes Q2_K, Q3_K_S y Q3_K_M degradan la calidad de forma notable según los criterios habituales de llama.cpp; el propio autor marca Q3_K_M como "lower quality". Para uso serio conviene partir de Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix: el autor advierte de que las versiones ponderadas no están disponibles y podrían no publicarse, lo que limita las opciones de optimización de calidad por tamaño.
- Validación comunitaria nula: 0 descargas y 0 likes implican que no hay retroalimentación, informes de errores ni comparaciones independientes.
- Consistencia del merge: los modelos fusionados con mergekit pueden presentar incoherencias de tokenizador, configuración de chat o formato de plantilla respecto a los modelos originales, algo que no se documenta aquí.
- Metadatos con fecha anómala: la fecha de creación registrada (2026-09-15) resulta inconsistente con el contexto temporal habitual y conviene tratarla con cautela.

## Enlaces

- Repositorio de cuantizaciones en Hugging Face: https://huggingface.co/mradermacher/Mahakal-AI-Fusion-v3.0-GGUF
- Modelo base: https://huggingface.co/UX4567/Mahakal-AI-Fusion-v3.0
- Página de resumen y listado de descargas del autor: https://hf.tst.eu/model#Mahakal-AI-Fusion-v3.0-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que cede la infraestructura al autor): https://www.nethype.de/
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Todas las entradas devueltas corresponden a consultas sobre Adobe Acrobat y PDF, sin relación con el modelo.
