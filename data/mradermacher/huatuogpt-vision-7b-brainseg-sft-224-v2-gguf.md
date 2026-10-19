# mradermacher/HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2-GGUF

## Resumen

Esta ficha describe `mradermacher/HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2-GGUF`, una republicación en formato GGUF del checkpoint `peijieqiu/HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2`. No se trata de un modelo nuevo: es una conversión de pesos realizada por mradermacher (nethype GmbH) para permitir la inferencia con llama.cpp y herramientas compatibles, algo relevante porque el checkpoint original solo se distribuye en formato transformers/safetensors y requiere hardware más exigente.

El modelo de partida pertenece a la familia HuatuoGPT-Vision, orientada a visión-lenguaje en el ámbito médico, y en esta variante concreta aparece afinado para una tarea de segmentación cerebral (`Brainseg`) a resolución 224, presumiblemente sobre imágenes de resonancia magnética. El nombre y los ficheros `mmproj` incluidos en el repositorio confirman que se trata de un modelo multimodal con un proyector visión-lenguaje separado, no de un LLM de texto puro.

El interés práctico inmediato es la disponibilidad de 12 cuantizaciones estáticas (de Q2_K a f16) más dos versiones del proyector multimodal, lo que permite ejecutar un modelo de 7.615.616.512 parámetros en GPUs de consumo con tan solo 4-6 GB de pesos. La información pública disponible es, sin embargo, muy escasa: no se detallan arquitectura, contexto, licencia ni resultados de evaluación, lo que limita seriamente su uso en producción sin una validación previa por parte del equipo adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; multimodal (encoder visual + proyector `mmproj` + modelo de lenguaje), segun los ficheros del repositorio |
| Parametros totales | 7.615.616.512 (dato safetensors del checkpoint de referencia) |
| Parametros activos | No aplica (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible ningun detalle sobre la arquitectura interna (familia de transformer, número de capas, dimensiones, mecanismo de atención), el número de tokens de entrenamiento ni la composición del dataset. Lo único deducible de forma objetiva es la estructura multimodal: el repositorio incluye ficheros `mmproj` separados, lo que implica un encoder de visión y un proyector que mapea las representaciones visuales al espacio del modelo de lenguaje, siguiendo el esquema habitual de los VLM de tipo LLaVA.

El sufijo `Brainseg-SFT-224-v2` sugiere un ajuste supervisado (SFT) específico sobre una tarea de segmentación cerebral con entradas de 224x224 píxeles, en su segunda iteración. No hay información sobre si hubo RLHF, DPO, preferencias humanas, ni sobre el volumen de pares imagen-texto empleados. Tampoco se documenta el proceso de conversión a GGUF más allá de las etiquetas internas de la model card (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), que indican una conversión estándar desde pesos Hugging Face y cuantización estática tensor a tensor, sin quants ponderados ni imatrix.

## Capacidades

- Procesamiento de imagen y texto de forma conjunta, con entrada visual canalizada a través del proyector multimodal.
- Generación de texto descriptivo y conversacional condicionado a una imagen (`conversational` en las etiquetas del repositorio).
- Aplicación específica a segmentación cerebral a 224x224, según el nombre del checkpoint de origen.
- Soporte de inferencia local en CPU/GPU mediante llama.cpp y ecosistema GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposición tras una API tipo OpenAI.
- Capacidades de tool calling, agentes, matemáticas avanzadas, audio u otros idiomas: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigación en segmentación cerebral: el modelo puede emplearse como componente de un pipeline experimental que reciba cortes o volúmenes de RM a 224x224 y genere máscaras o descripciones de las regiones segmentadas, aprovechando que las cuantizaciones Q4_K_M ocupan 4,8 GB y caben en una GPU de 8 GB.
- Prototipado académico con recursos limitados: al existir versiones Q2_K (3,1 GB) y Q3_K_S (3,6 GB), un grupo de investigación puede validar hipótesis sobre datos propios en portátiles o GPUs de gama media antes de solicitar acceso a clústeres con el checkpoint original en f16.
- Anotación asistida de datasets médicos: el modelo puede preetiquetar regiones de interés en imágenes de RM, reduciendo el trabajo manual de radiólogos que posteriormente revisan y corrigen las propuestas.
- Docencia y demostraciones de IA médica multimodal: al ejecutarse con llama.cpp y un fichero `mmproj` de 1,0-1,5 GB, es viable montar demostraciones interactivas en un equipo de aula sin depender de servicios en la nube.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad del modelo entre Q2_K y Q8_0 sobre la misma tarea de segmentación, un experimento útil para decidir el compromiso tamaño/precisión en despliegues reales.
- Integración en pipelines de investigación reproducible: la conversión GGUF con pesos estáticos permite fijar un artefacto concreto y versionado, evitando dependencias de la librería `transformers` y de sus cambios de API en entornos de experimentación a largo plazo.
- Filtrado previo en flujos clínicos de triaje: el modelo puede clasificar o describir imágenes en una primera pasada y derivar los casos anómalos a un especialista, siempre como herramienta de apoyo y nunca con valor diagnóstico autónomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del GGUF ni los metadatos de HuggingFace incluyen métricas de MMLU, HumanEval, GSM8K, VQA médica, Dice/IoU de segmentación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM): 3,1 GB (Q2_K), 4,8 GB (Q4_K_M), 6,4 GB (Q6_K), 8,2 GB (Q8_0), 15,3 GB (f16).
- Sumar el proyector multimodal: 1,0 GB adicionales con `mmproj-Q8_0` y 1,5 GB con `mmproj-f16`; más el espacio de caché KV, que depende del contexto y no está documentado.
- Configuración mínima realista: Q4_K_M + `mmproj-Q8_0` ≈ 5,8 GB de pesos, por lo que cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) dejando margen para contexto moderado.
- Configuración de calidad: Q8_0 + `mmproj-f16` ≈ 9,7 GB de pesos, adecuada para RTX 4080/4090 (16-24 GB), A10G (24 GB) o L4 (24 GB).
- f16 completo (15,3 GB + 1,5 GB) requiere 24 GB o más: RTX 4090, A100 40 GB, H100, L40S.
- Despliegue: llama.cpp y servidores compatibles (llama-server, Ollama, LM Studio, text-generation-webui). Para vLLM o TGI sería necesario el checkpoint original en safetensors, ya que estas herramientas no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, al ser un modelo de ~7,6B parámetros, el rendimiento vendrá dominado por el ancho de banda de memoria de la GPU y por el coste adicional de procesar la imagen en el encoder visual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (GGUF de mradermacher) | 7,6B | No disponible | GGUF (12 quants + 2 mmproj) | No disponible | Publico en HF, 382 descargas |
| `peijieqiu/HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2` (original) | 7,6B | No disponible | safetensors / transformers | No disponible | Publico en HF |
| Otros VLM medicos de ~7B (p. ej. familias LLaVA-Med o HuatuoGPT-Vision estandar) | ~7B | No disponible en la informacion proporcionada | Mayoritariamente safetensors | No disponible en la informacion proporcionada | No verificado |

No se dispone en la informacion proporcionada de datos objetivos (parametros, contexto, benchmarks, licencia) de modelos alternativos que permitan una comparación cuantitativa fiable. Cualquier comparación de rendimiento con otros VLM médicos exigiría ejecutar una evaluación propia sobre el mismo conjunto de imágenes.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial; es un bloqueante habitual en entornos sanitarios y empresariales.
- Modelo de investigación médica: no es un producto sanitario, no ha pasado validación regulatoria (CE, FDA) y no debe usarse para diagnóstico autónomo.
- Riesgo de alucinación relevante: en descripciones de imágenes médicas, una salida plausible pero incorrecta puede tener consecuencias clínicas; se requiere revisión humana sistemática.
- Idiomas: solo se declara inglés, por lo que el rendimiento en castellano no está garantizado ni documentado.
- Contexto desconocido: no se puede planificar un caso de uso multi-turno o con muchas imágenes sin conocer la ventana real del modelo.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar de forma notable tareas de percepción fina como la segmentación; la model card solo advierte "lower quality" para Q3_K_M y recomienda Q4_K_S/Q4_K_M como equilibrio.
- Especificidad excesiva: al estar afinado para `Brainseg` a 224x224, es probable que su rendimiento en otras modalidades (TAC, radiografía, dermatología) o resoluciones sea peor, aunque no hay datos que lo cuantifiquen.
- Ausencia total de benchmarks: no existe evidencia publicada de Dice, IoU, accuracy de VQA ni comparaciones, lo que impide justificar su elección frente a alternativas.
- Repositorio de 70,4 GB: descargar el conjunto completo es costoso; conviene bajar únicamente el quant y el `mmproj` necesarios.
- Trazabilidad: al ser una conversión de terceros, hay que verificar que los pesos reproducen el comportamiento del checkpoint original antes de confiar en resultados experimentales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2-GGUF
- Modelo base: https://huggingface.co/peijieqiu/HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#HuatuoGPT-Vision-7B-Brainseg-SFT-224-v2-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo oficial del modelo: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes (solo paginas de ortografia francesa sin relacion con el modelo).
