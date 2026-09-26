# mradermacher/XORTRON-CriminalComputing-RICO-v4-GGUF

## Resumen

XORTRON-CriminalComputing-RICO-v4-GGUF es una cuantizacion en formato GGUF publicada por el usuario mradermacher a partir del modelo base darkc0de/XORTRON-CriminalComputing-RICO-v4. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo original a cuantizaciones de llama.cpp, una practica habitual para permitir su ejecución en hardware de consumo. El modelo subyacente se presenta como una fusión (merge) generada con mergekit y etiquetada explícitamente como "uncensored", "abliterated", "toxic", "harmful" y "not-for-all-audiences", lo que lo sitúa en el ámbito de la investigación sobre seguridad y alineación más que en el de aplicaciones de producción convencionales.

El modelo cuenta con aproximadamente 27.320.697.856 parámetros (unos 27,3 mil millones), lo que lo coloca en la gama de modelos medianos-grandes. El repositorio ocupa 190,8 GB e incluye cuantizaciones estáticas que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de archivos mmproj que sugieren soporte multimodal. La model card no especifica la arquitectura interna, la longitud de contexto, la licencia ni los detalles del dataset de entrenamiento más allá de la referencia a darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT.

La relevancia de esta ficha es acotada: se trata de un modelo experimental con cero descargas y un solo "like" en el momento de la consulta, cuyo interés principal radica en servir como objeto de estudio para investigadores que analizan comportamientos no alineados, técnicas de "abliteration" y fusión de modelos. No está pensado para uso comercial ni para despliegues de cara al público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fusion de modelos generada con mergekit; etiquetada como transformers) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivos mmproj para funcionalidad multimodal) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Los metadatos indican que se trata de una fusion creada con mergekit, una herramienta que combina los pesos de varios modelos mediante estrategias como el promediado de tensores o el ensamblado por capas. El repositorio tambien incluye las etiquetas "unsloth" y "heretic", que apuntan a que la fusion pudo apoyarse en tecnicas de ajuste eficiente y en metodos de eliminacion de capas de rechazo ("abliteration"). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El unico dato de entrenamiento disponible es la referencia al dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, cuyo contenido no se detalla en la informacion suministrada. La presencia de archivos mmproj en el repositorio sugiere que el modelo incorpora un componente de proyeccion multimodal (probablemente vision), aunque no se confirma su arquitectura ni su origen. En conjunto, la informacion tecnica publicada es minima y no permite reproducir ni auditar el proceso de construccion del modelo.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" y el idioma declarado.
- Comportamiento explicitamente no alineado: las etiquetas "uncensored", "abliterated", "toxic" y "harmful" indican que el modelo ha sido modificado para reducir o eliminar capas de rechazo.
- Posible soporte multimodal: la presencia de archivos mmproj-Q8_0 y mmproj-f16 apunta a capacidades de procesamiento de imagenes, aunque no se detalla su alcance.
- Compatibilidad con text-generation-inference y transformers, segun las etiquetas del repositorio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como sujeto de estudio para analizar como la "abliteration" y las fusiones afectan a la tasa de respuestas no seguras, comparandola con la del modelo base sin modificar.
- Red teaming interno: equipos de seguridad pueden emplearlo en entornos aislados para generar prompts adversariales y evaluar la robustez de sus propios sistemas de moderacion frente a un modelo sin restricciones.
- Generacion de datos sinteticos para clasificadores de toxicidad: en un entorno controlado y con supervision, se pueden producir muestras etiquetadas que ayuden a entrenar o evaluar detectores de contenido danino.
- Evaluacion de tecnicas de cuantizacion: dado que el repositorio ofrece un amplio abanico de cuantizaciones (desde Q2_K hasta Q8_0), es util para medir el impacto de la compresion en la coherencia y la calidad de las respuestas.
- Estudio de fusiones con mergekit: investigadores que trabajan en model merging pueden reproducir el pipeline y analizar como se combinan los comportamientos de los modelos de origen.
- Pruebas de estres de pipelines de moderacion y filtrado: el modelo permite comprobar si los filtros de entrada y salida de una plataforma detectan correctamente contenido prohibido.
- Docencia y divulgacion sobre riesgos de los LLM: en contextos academicos y con salvaguardas, puede ilustrar de forma tangible los peligros del uso no controlado de modelos sin alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB; f16 ~54,6 GB.
- GPU recomendadas: para las cuantizaciones altas (Q8_0 y f16) se necesitan GPUs de 40-80 GB como A100 40GB, A100 80GB o H100. Para Q6_K y Q5_K_M bastan tarjetas de 24-32 GB (RTX 3090, RTX 4090, A10G, L40S).
- Cabe en GPU de consumo: si. La RTX 4090 y la RTX 3090 (24 GB) ejecutan comodamente Q4_K_M, Q5_K_M y Q6_K. Tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16GB) pueden alojar Q4_K_S o Q4_K_M con contextos cortos. Las cuantizaciones Q3 y Q2 permiten su uso en GPUs de 12 GB, con degradacion de calidad apreciable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y otros frontends compatibles con GGUF. La etiqueta "text-generation-inference" sugiere compatibilidad con TGI. vLLM soporta GGUF de forma limitada y no es la via recomendada para este formato.
- Latencia y throughput estimados: no disponible. Dependera del hardware, del tamano de contexto y del backend. Como referencia general, las cuantizaciones bajas (Q2-Q4) ofrecen mayor velocidad a costa de calidad.
- Nota sobre los archivos mmproj: para usar la supuesta funcionalidad multimodal hay que descargar ademas el archivo mmproj correspondiente (Q8_0 o f16) y un backend que soporte proyeccion multimodal en GGUF.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XORTRON-CriminalComputing-RICO-v4-GGUF | ~27,3 B | no disponible | no disponible | GGUF en HuggingFace | Fusion experimental, sin benchmarks publicos |
| darkc0de/XORTRON-CriminalComputing-RICO-v4 | no disponible | no disponible | no disponible | modelo base en HuggingFace | Origen de esta cuantizacion |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables documentados en la informacion suministrada |

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publicada sobre sesgos especificos, pero un modelo etiquetado como "toxic" y "harmful" presenta un riesgo elevado de generar contenido ofensivo, discriminatorio o ilegal.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; en modelos sin alineacion este riesgo suele ser alto y no esta cuantificado.
- Limitacion de contexto: se desconoce la longitud de contexto soportada, lo que dificulta planificar usos con conversaciones largas o grandes documentos.
- Limitacion de idioma: el modelo declara unicamente ingles, por lo que su rendimiento en castellano u otros idiomas es incierto y presumiblemente bajo.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite el uso comercial. A efectos practicos, debe tratarse como no autorizado para produccion hasta que se aclare.
- Uso no comercial y no publico: las etiquetas "not-for-all-audiences" y "experimental" desaconsejan su despliegue de cara al publico.
- Riesgo legal y etico: el nombre y las etiquetas del modelo lo vinculan a contenido de "computacion criminal"; su uso fuera de entornos de investigacion controlados puede vulnerar normativas de contenido y suponer responsabilidad para el operador.
- Trazabilidad limitada: al ser una fusion sin documentacion detallada, no se puede auditar la procedencia de los datos ni garantizar la ausencia de material con derechos de autor.
- Estado de adopcion minimo: cero descargas y un solo "like" en el momento de la consulta implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/XORTRON-CriminalComputing-RICO-v4-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-RICO-v4
- Dataset de referencia: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#XORTRON-CriminalComputing-RICO-v4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
