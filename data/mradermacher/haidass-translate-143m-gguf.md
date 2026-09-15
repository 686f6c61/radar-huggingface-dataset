# mradermacher/Haidass-Translate-143M-GGUF

## Resumen

Haidass-Translate-143M-GGUF es la version cuantizada en formato GGUF del modelo DALabCommunity/Haidass-Translate-143M, un modelo de traduccion automatica de 143.071.296 parametros publicado originalmente por DALabCommunity. Esta ficha concreta corresponde al repositorio de cuantizaciones generado por mradermacher, un autor conocido por producir versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo trabaja en el par de idiomas ingles-chino (en, zh) y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo de tipo "small language model" orientado exclusivamente a la tarea de traduccion (pipeline `translation`), con etiqueta `qwen3` que apunta a una arquitectura basada en la familia Qwen3, aunque la informacion proporcionada no detalla la configuracion interna exacta. Su tamano reducido lo hace apto para inferencia en CPU, en GPUs de gama baja e incluso en dispositivos con recursos limitados, lo que resulta relevante para pipelines de traduccion de alto volumen donde el coste por token y la latencia importan mas que la calidad maxima alcanzable.

El repositorio incluye un total de doce cuantizaciones estaticas que van desde Q2_K (0,2 GB) hasta f16 (0,4 GB), lo que permite ajustar el compromiso entre calidad y consumo de memoria. No se ha publicado informacion sobre el proceso de entrenamiento, la composicion del dataset ni resultados de benchmarks en los materiales disponibles. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3` en el repositorio; se desconoce la configuracion concreta) |
| Parametros totales | 143.071.296 (143 M) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato transformers/safetensors |
| Tamano del repositorio | 1,6 GB |
| Tarea declarada | Traduccion automatica (`translation`, `machine-translation`) |
| Modelo base | DALabCommunity/Haidass-Translate-143M |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. La unica referencia tecnica es la etiqueta `qwen3` incluida en el repositorio de cuantizacion, lo que sugiere que el modelo parte de un diseno de tipo transformer decoder-only derivado de la familia Qwen3, escalado a 143 millones de parametros. No se especifica el numero de capas, dimensiones ocultas, numero de cabezas de atencion, tipo de atencion ni si emplea mecanismos adicionales como atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el entrenamiento: se desconoce el volumen de tokens utilizados, la composicion del corpus (si es paralelo en-zh, si incluye datos sinteticos o si se destilo de un modelo mayor), la existencia de fases de ajuste fino supervisado, RLHF o DPO, y cualquier innovacion tecnica aplicada. El repositorio de cuantizacion unicamente documenta el proceso de conversion, realizado con `convert_type: hf` y `quantize_version: 2`, sin cuantizacion ponderada ni imatrix (el autor indica que no estan disponibles y que podrian no planificarse).

## Capacidades

- Traduccion automatica entre ingles y chino en ambos sentidos, segun los idiomas declarados en el repositorio.
- Modelo especializado de un solo proposito: la model card no declara capacidades de generacion general, razonamiento, codigo o matematicas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso; el pipeline declarado es exclusivamente `translation`.
- Capacidades multilingues limitadas a los pares en-zh; no se declaran otros idiomas.
- El repositorio incluye la etiqueta `conversational`, aunque la model card no aporta detalles sobre el formato de prompt o plantilla de chat empleada.
- Compatible con endpoints (`endpoints_compatible`), lo que sugiere posibilidad de despliegue mediante Inference Endpoints de HuggingFace.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion de documentacion tecnica en-zh a gran escala: al ser un modelo de 143 M de parametros, puede procesar volumenes elevados de texto con un coste computacional muy bajo, integrandose en pipelines batch de localizacion de manuales y guias.
- Traduccion en tiempo real en aplicaciones de chat: su reducido tamano permite desplegarlo en el mismo servidor que la aplicacion, anadiendo latencia minima en la conversion en-zh de mensajes de usuario.
- Preprocesamiento bilingue para busqueda y recuperacion: traducir consultas o documentos a un idioma comun antes de indexarlos en un motor de busqueda o en un sistema RAG.
- Traduccion embebida en dispositivos o entornos sin GPU: con cuantizaciones de 0,2 GB, puede ejecutarse con llama.cpp en portatiles, mini-PC o hardware de borde para traduccion local sin conexion.
- Generacion de datos sinteticos para entrenamiento: uso como traductor automatico para crear corpus paralelos en-zh que alimenten etapas posteriores de ajuste o evaluacion.
- Moderacion de contenido multilingue: traduccion rapida de contenido en chino o ingles a un idioma de trabajo para aplicar clasificadores de politicas escritos en un unico idioma.
- Internacionalizacion de interfaces de producto: traduccion de cadenas cortas y textos de interfaz en-zh dentro de un pipeline de build, con la ventaja de un modelo pequeno que cabe en la imagen de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos proporcionados incluyen cifras de BLEU, COMET, chrF, MMLU u otras metricas de evaluacion para el par en-zh.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,2 GB en Q2_K/Q3_K/IQ4_XS/Q4_K/Q5_K, 0,3 GB en Q8_0 y 0,4 GB en f16. A esta cifra hay que sumar la memoria de la cache KV, cuyo tamano depende de la longitud de contexto efectiva, que no esta documentada.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de memoria libre, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. El modelo es notablemente mas pequeno que la capacidad de cualquiera de ellas, por lo que el cuello de botella no sera la memoria de pesos.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPU integradas con memoria compartida, asi como en inferencia exclusiva por CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las rutas naturales para el formato GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI si se necesita mayor throughput en GPU. El soporte de GGUF en vLLM existe pero es mas limitado que en llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Cualitativamente, al tratarse de un modelo de 143 M de parametros con cuantizacion de 4 bits, los tiempos de generacion por token seran muy reducidos en GPU y viables en CPU, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

Los datos de los modelos comparados no proceden de la informacion proporcionada en esta busqueda, sino del conocimiento general de esos modelos; se incluyen como referencia orientativa y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Haidass-Translate-143M (este modelo) | 143 M | en, zh | No disponible | Apache 2.0 | GGUF, safetensors |
| Helsinki-NLP/opus-mt-en-zh (familia Marian) | ~77 M | en, zh | Limitado a nivel de frase | CC-BY 4.0 | safetensors, convertibles a GGUF |
| NLLB-200-distilled-600M | 600 M | ~200 idiomas | 512 tokens | CC-BY-NC-4.0 (no comercial) | safetensors |
| Qwen3-0.6B | 600 M | Multilingue amplio | 32.768 tokens (segun configuracion Qwen3) | Apache 2.0 | safetensors, GGUF |

Frente a modelos dedicados como opus-mt, la principal diferencia es la licencia Apache 2.0 y la disponibilidad directa de cuantizaciones GGUF listas para llama.cpp. Frente a NLLB-200-distilled-600M, la ventaja es la licencia permisiva para uso comercial, ya que NLLB usa CC-BY-NC-4.0. No se dispone de datos de calidad de traduccion que permitan comparar el rendimiento real entre estas opciones.

## Limitaciones y advertencias

- Cobertura linguistica restringida: solo ingles y chino. No debe esperarse buen rendimiento en otros idiomas, y no hay validacion documentada de calidad fuera de ese par.
- Ausencia total de benchmarks publicados: no existe evidencia objetiva de calidad de traduccion (BLEU, COMET u otras metricas) en la informacion disponible.
- Riesgo de alucinacion y de omisiones en textos largos: como cualquier modelo neuronal de traduccion, puede inventar contenido, omitir segmentos o degradar la coherencia en documentos extensos, especialmente si el contexto efectivo es reducido.
- Longitud de contexto desconocida: la falta de documentacion impide garantizar el comportamiento en parrafos largos o documentos completos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de la comunidad, lo que aumenta el riesgo de comportamiento no verificado en produccion.
- Cuantizaciones agresivas: los formatos Q2_K y Q3_K pueden degradar la calidad de traduccion de forma apreciable. El autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality"; para produccion conviene evitar los niveles mas bajos.
- Cuantizaciones no ponderadas: el autor indica que no ha generado versiones weighted/imatrix, que suelen ofrecer mejor relacion calidad-tamano que las estaticas equivalentes.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Conviene verificar la licencia del modelo base DALabCommunity/Haidass-Translate-143M por si anadiese condiciones adicionales, ya que en la informacion disponible solo consta Apache 2.0.
- Delegacion de responsabilidad: al ser un modelo pequeno y sin documentacion de sesgos, no se recomienda su uso en dominios sensibles (medico, legal, financiero) sin revision humana y evaluacion previa propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Haidass-Translate-143M-GGUF
- Modelo base: https://huggingface.co/DALabCommunity/Haidass-Translate-143M
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#Haidass-Translate-143M-GGUF
- Ejemplo de uso de archivos GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
