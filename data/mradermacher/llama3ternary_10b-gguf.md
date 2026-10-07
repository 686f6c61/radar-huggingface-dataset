# mradermacher/Llama3Ternary_10b-GGUF

## Resumen

Llama3Ternary_10b-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo CMSManhattan/Llama3Ternary_10b, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero por este autor, sino de una conversion de pesos ya existentes a formatos optimizados para inferencia en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles. El modelo base es un transformer decoder-only de la familia Llama 3 con aproximadamente 9.640.873.984 parametros (unos 9,64 mil millones) y pesos de naturaleza ternaria, segun las etiquetas declaradas por el autor: llama, ternary, bitnet y 1.58bit.

La relevancia de esta publicacion radica en el formato de cuantizacion empleado. En lugar de las cuantizaciones habituales de tipo Q4_K_M o Q5_K_M, mradermacher ofrece dos variantes especificas para pesos ternarios: TQ1_0, de 2,6 GB, descrita como "tighteR tERNARY packing", y TQ2_0, de 3,0 GB, descrita como "faster ternary packing". Esto permite ejecutar un modelo de casi 10.000 millones de parametros con un peso en disco de entre 2,6 y 3,0 GB, una reduccion drastica frente a los aproximadamente 19 GB que ocuparian los pesos en FP16.

El modelo se distribuye bajo la licencia Llama 3, esta declarado unicamente para ingles y su pipeline es text-generation. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de benchmarks ni detalles sobre el entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama con pesos ternarios (etiquetas del autor: llama, ternary, bitnet, 1.58bit) |
| Parametros totales | 9.640.873.984 (9,64 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ1_0 (2,6 GB) y TQ2_0 (3,0 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (repositorio derivado); el modelo base se distribuye en safetensors para transformers |

## Arquitectura y entrenamiento

El modelo base, CMSManhattan/Llama3Ternary_10b, sigue la arquitectura de la familia Llama 3: un transformer decoder-only con atencion por causalidad. Su particularidad es el uso de pesos ternarios, es decir, valores restringidos al conjunto {-1, 0, +1}, lo que se corresponde con el paradigma BitNet y la representacion de 1,58 bits por peso (log2(3) = 1,585). Esta representacion es la que hace posible que un modelo de 9,64 mil millones de parametros ocupe unicamente entre 2,6 y 3,0 GB en disco tras el empaquetado en formato GGUF.

El repositorio aqui descrito es exclusivamente una labor de cuantizacion estatica. Los metadatos internos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se realizo a partir de pesos en formato HuggingFace. El autor senala que no hay cuantizaciones ponderadas o con imatrix disponibles en ese momento, y que podrian no llegar a publicarse; invita a solicitarlas mediante una discusion comunitaria.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares, ni en la model card del repositorio derivado ni en los resultados de busqueda consultados.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" en el repositorio indica que el modelo base esta orientado a dialogos multi-turno.
- Generacion de texto general bajo el pipeline text-generation de transformers y llama.cpp.
- Ejecucion en hardware muy limitado: el empaquetado ternario reduce el peso a 2,6-3,0 GB, lo que habilita inferencia en equipos sin GPU dedicada de gran capacidad.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling y uso de agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: el modelo esta declarado unicamente para ingles (en); no se documentan otros idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en equipos de gama baja sin GPU: gracias a que los ficheros TQ1_0 y TQ2_0 ocupan 2,6 GB y 3,0 GB respectivamente, el modelo puede cargarse en un portatil con 8 GB de RAM y ejecutarse en CPU mediante llama.cpp, algo inviable con los pesos originales en FP16.
- Despliegue en GPUs de consumo con VRAM limitada: una unica tarjeta con 4-6 GB de VRAM puede alojar el modelo cuantizado junto con la cache KV, lo que permite montar un asistente local sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones conversacionales: dado el tamano reducido del fichero, el ciclo de descarga, carga y prueba es de segundos, lo que acelera la validacion de ideas antes de invertir en modelos mayores.
- Experimentacion academica con redes ternarias: investigadores que estudien el paradigma BitNet o el efecto de la cuantizacion ternaria en la calidad de generacion pueden usar estas variantes como referencia practica y comparar TQ1_0 frente a TQ2_0.
- Escenarios de privacidad estricta: al poder ejecutarse de forma totalmente local y desconectada, encaja en entornos donde los datos no pueden salir del equipo o de la red corporativa.
- Distribucion de modelos en entornos con ancho de banda limitado: un fichero de 2,6 GB es manejable para su descarga y replicacion en multiples nodos, frente a los ~19 GB de los pesos completos.
- Pruebas comparativas de motores de inferencia: sirve para medir el rendimiento relativo de llama.cpp y derivados (Ollama, koboldcpp) con cuantizaciones TQ, un terreno poco explorado frente a las cuantizaciones K-quant habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio derivado ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, perplexity u otras metricas para Llama3Ternary_10b-GGUF ni para el modelo base CMSManhattan/Llama3Ternary_10b.

## Requisitos de hardware

- Peso en disco de los pesos: 2,6 GB para TQ1_0 y 3,0 GB para TQ2_0 (datos declarados en la model card).
- VRAM estimada para inferencia: aproximadamente 3-4 GB con TQ1_0 y 4-5 GB con TQ2_0, incluyendo cache KV y overhead del runtime. Estas cifras son una estimacion a partir del tamano de los ficheros, no un dato publicado.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 6 GB o mas de VRAM es suficiente (RTX 3060, RTX 4060, RTX 2060, GTX 1660 en adelante), e incluso puede funcionar con reparto parcial o total en CPU.
- GPU recomendadas: no se especifica ninguna en la informacion disponible. Para maximizar throughput en servidor se podrian emplear A100, H100 o L40S, pero estarian ampliamente sobredimensionadas para un modelo de este tamano y cuantizacion; no hay datos que respalden una recomendacion concreta.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, koboldcpp, llama-cpp-python) son los entornos naturales para estos ficheros GGUF con cuantizacion TQ. El soporte en vLLM o TGI para cuantizaciones TQ no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las dos variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama3Ternary_10b-GGUF (este modelo) | 9,64 B | no disponible | TQ1_0 (2,6 GB), TQ2_0 (3,0 GB) | llama3 | Repositorio GGUF con 0 descargas en el momento de la consulta |
| CMSManhattan/Llama3Ternary_10b (modelo base) | 9,64 B | no disponible | safetensors (FP16 y original ternario) | llama3 | Repositorio HuggingFace del autor original |
| Llama 3 8B | 8,03 B | no disponible en la informacion consultada | Q4_K_M, Q5_K_M, Q8_0, entre otras | llama3 | Ampliamente distribuido en HuggingFace; ecosistema maduro de cuantizaciones |
| Mistral 7B | 7,24 B | no disponible en la informacion consultada | Q4_K_M, Q5_K_M, entre otras | Apache 2.0 | Ampliamente distribuido; permite uso comercial sin las restricciones de la licencia Llama |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. La ventaja diferencial del modelo de esta ficha es el tamano en disco de sus cuantizaciones ternarias frente a las cuantizaciones K-quant convencionales de modelos de tamano similar.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks publicados, por lo que no es posible estimar la degradacion de calidad introducida por la cuantizacion ternaria ni compararla con los pesos originales.
- Modelo unicamente en ingles: la ficha declara el tag "en" y no se documenta soporte de otros idiomas. No es adecuado para produccion en castellano.
- Longitud de contexto desconocida: no se especifica en la model card, lo que impide planificar aplicaciones que dependan de ventanas largas (analisis de documentos extensos, conversaciones prolongadas, RAG con muchos fragmentos).
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones, no se puede acotar la tasa de errores factuales ni compararla con la del modelo sin cuantizar.
- Sesgos: no documentados. Al no haber informacion sobre el dataset de entrenamiento ni sobre procesos de alineacion, no es posible caracterizar sesgos de genero, raza, religion u otros.
- Licencia restrictiva: la Llama 3 Community License no es una licencia de codigo abierto aprobada por la OSI e impone condiciones adicionales, entre ellas obligaciones de atribucion y clausulas especificas para el despliegue a gran escala (por encima de 700 millones de usuarios mensuales). Es imprescindible revisar el texto completo antes de un uso comercial.
- Repositorio con escasa traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad y ausencia de retroalimentacion sobre fallos o comportamientos anomalos.
- Cuantizaciones ponderadas no disponibles: el autor indica que no hay variantes con imatrix y que podrian no publicarse, por lo que la calidad de las variantes TQ1_0 y TQ2_0 es la de una cuantizacion estatica, generalmente inferior a la de una cuantizacion ponderada de tamano equivalente.
- Soporte de herramientas limitado: las cuantizaciones TQ estan pensadas para llama.cpp; no se confirma su funcionamiento en otros motores de inferencia, lo que reduce las opciones de despliegue en produccion.
- Riesgo de obsolescencia o abandono: al ser una conversion derivada y sin mantenimiento declarado, no hay garantia de actualizaciones ni de correccion de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama3Ternary_10b-GGUF
- Modelo base: https://huggingface.co/CMSManhattan/Llama3Ternary_10b
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Llama3Ternary_10b-GGUF
- Cuantizacion TQ1_0: https://huggingface.co/mradermacher/Llama3Ternary_10b-GGUF/resolve/main/Llama3Ternary_10b.TQ1_0.gguf
- Cuantizacion TQ2_0: https://huggingface.co/mradermacher/Llama3Ternary_10b-GGUF/resolve/main/Llama3Ternary_10b.TQ2_0.gguf
- Licencia Llama 3: https://www.llama.com/llama3/license/
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de ficheros GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
