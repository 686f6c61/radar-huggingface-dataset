# mradermacher/LlamaScientific-8B-i1-GGUF

## Resumen

LlamaScientific-8B-i1-GGUF es el conjunto de cuantizaciones GGUF, generadas con matrices de importancia (imatrix), del modelo Rumiii/LlamaScientific-8B, un fine-tune de la familia Llama 3 con aproximadamente 8.030 millones de parámetros, especializado en dominios científicos (física, química y biología) y entrenado mediante SFT sobre el dataset nvidia/Nemotron-SFT-Science-v2. El trabajo de cuantización lo firma mradermacher, un tercero independiente que no entrena el modelo, sino que lo convierte a formatos ligeros para inferencia local.

El interés práctico del repositorio está en que ofrece más de veinte variantes GGUF con tamaños que van de 2,1 GB (IQ1_S) a 6,7 GB (Q6_K), lo que permite ejecutar un modelo de 8B en hardware de consumo, desde portátiles sin GPU dedicada hasta tarjetas de 8-12 GB de VRAM con contexto amplio. Las variantes i1 emplean una imatrix calculada sobre el propio modelo, lo que en la práctica reduce la perplejidad frente a cuantizaciones estáticas del mismo tamaño.

El modelo está etiquetado como orientado a tool use y function calling, además de conversacional y con soporte para inglés exclusivamente. No se han publicado en la información disponible datos sobre longitud de contexto, composición del dataset de entrenamiento, número de tokens vistos ni resultados de benchmarks, por lo que la evaluación cualitativa queda pendiente de pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3 (según tags del repositorio: llama, llama-3); detalles de atención y capas no disponibles |
| Parametros totales | 8.030.261.312 (8,03B), dato de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la model card del cuantizador no la especifica y el tag llama-3 no permite distinguir entre la ventana de 8K de Llama 3 y la de 128K de Llama 3.1 |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; se incluye el fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Modelo base | Rumiii/LlamaScientific-8B |
| Dataset de entrenamiento | nvidia/Nemotron-SFT-Science-v2 |
| Metodo de ajuste | SFT (según tags; herramienta citada: unsloth) |
| Tamano del repositorio | 93,8 GB (suma de todas las variantes publicadas) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible sitúa el modelo en la familia Llama 3, con 8.030 millones de parámetros y pesos originales en safetensors, lo que corresponde a un transformer decoder-only denso con el tokenizador y la configuración habitual de dicha familia. El repositorio consultado no documenta el número de capas, dimensiones ocultas, mecanismo de atención ni la ventana de contexto efectiva, y tampoco aclara si el modelo hereda la ventana de 8K de Llama 3 o la de 128K de Llama 3.1.

El ajuste se realizó por SFT (supervised fine-tuning) sobre nvidia/Nemotron-SFT-Science-v2, un dataset orientado a contenido científico, presumiblemente con ejemplos de razonamiento y respuesta en física, química y biología. Los tags indican explícitamente tool use y function calling, de modo que el corpus de ajuste probablemente incluye trayectorias con llamadas a herramientas. Se cita Unsloth como herramienta de entrenamiento. No hay información sobre volumen de tokens, mezcla del dataset, uso de RLHF o DPO, ni sobre técnicas adicionales como decodificación especulativa. La contribución propia de este repositorio es exclusivamente la cuantización: variantes i1 generadas con una importance matrix (weighted/imatrix), junto con el fichero imatrix para que terceros puedan producir sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés con sesgo hacia contenido científico.
- Consultas y explicaciones de física, química y biología (tags science, physics, chemistry, biology).
- Tool calling y function calling: el modelo está etiquetado explícitamente para invocar funciones y usar herramientas.
- Formato conversacional con plantilla de chat de Llama 3 (tag conversational), compatible con endpoints de inferencia compatibles (tag endpoints_compatible).
- Ejecución local eficiente gracias a las múltiples cuantizaciones GGUF, incluidas opciones de menos de 3 GB.
- No se documentan capacidades de visión, audio, modo thinking explícito, ni razonamiento multi-paso con agentes autónomos más allá de lo que implica el soporte de tool calling.
- Capacidad multilingüe: limitada al inglés según el campo language; no hay evidencia de rendimiento en castellano.

## Casos de uso

- Asistente de dudas científicas en local: desplegado con llama.cpp u Ollama en un portátil, responde preguntas de física, química y biología sin enviar datos a la nube, usando la variante Q4_K_M (5,0 GB) para equilibrar calidad y velocidad.
- Documentación técnica con anotaciones químicas: el modelo puede redactar y revisar fichas de seguridad, procedimientos de laboratorio y descripciones de reacciones, con la ventaja de que el ajuste SFT sobre Nemotron-SFT-Science-v2 lo orienta a terminología del dominio.
- Preprocesado de literatura científica en pipelines internos: clasificación y resumen de abstracts, extracción de entidades (compuestos, magnitudes, organismos) mediante prompts estructurados, ejecutando la variante Q5_K_M o Q6_K en una GPU de 8-12 GB.
- Agente con herramientas en entornos de laboratorio: gracias al soporte de function calling, puede encadenarse a APIs de cálculo (conversión de unidades, balances estequiométricos, consultas a bases de datos de compuestos) y devolver la llamada en formato estructurado.
- Servicio de soporte técnico especializado de bajo coste: con cuantización IQ4_XS (4,5 GB) se puede servir en una única RTX 3060 o 4060 Ti, con latencia adecuada para chat interactivo y sin coste por token de API.
- Prototipado y evaluación de fine-tunes científicos: al estar disponible el fichero imatrix y todas las variantes, sirve como baseline reproducible para comparar calidad frente a otras cuantizaciones o frente a modelos de dominio biomédico similares.
- Generación de material docente: enunciados de problemas, explicaciones paso a paso y preguntas de autoevaluación en inglés para asignaturas de ciencias, con revisión humana obligatoria por el riesgo de alucinación.
- Inferencia en entornos con CPU exclusivamente: las variantes IQ2_M (3,0 GB) o IQ3_M (3,9 GB) permiten ejecución razonable en máquinas sin GPU, asumiendo la pérdida de calidad documentada por el autor en bits bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K, GPQA ni ninguna otra métrica, y el repositorio del modelo base no aporta datos en la información proporcionada. Tampoco hay cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada (solo pesos, según tamaños publicados por el autor):
  - IQ1_S: 2,1 GB; IQ1_M: 2,3 GB; IQ2_XXS: 2,5 GB; IQ2_XS: 2,7 GB; IQ2_S: 2,9 GB; IQ2_M: 3,0 GB.
  - Q2_K: 3,3 GB; IQ3_XXS: 3,4 GB; IQ3_XS: 3,6 GB; IQ3_S: 3,8 GB; IQ3_M: 3,9 GB; Q3_K_M: 4,1 GB.
  - IQ4_XS: 4,5 GB; Q4_K_S: 4,8 GB; Q4_K_M: 5,0 GB; Q4_1: 5,2 GB.
  - Q5_K_S: 5,7 GB; Q5_K_M: 5,8 GB; Q6_K: 6,7 GB.
- Añadir entre 0,5 y 2 GB adicionales para caché KV, buffers y overhead del runtime, en función del contexto configurado y del número de secuencias en paralelo.
- GPU de consumo: cualquier tarjeta con 8 GB o más ejecuta Q4_K_M con holgura (RTX 3060 Ti, 4060 Ti, 3070, 4070). Con 12 GB (RTX 3060 12GB, 4070 Ti) se puede usar Q5_K_M o Q6_K y contexto amplio. Con 16 GB (4060 Ti 16GB, 4080) o 24 GB (RTX 3090, 4090) caben Q6_K y varias secuencias concurrentes.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S permiten servir el modelo en FP16/BF16 original (unos 16 GB de pesos) con lotes grandes y vLLM.
- CPU: las variantes IQ2_M e IQ3_M (3,0-3,9 GB) permiten inferencia en CPU con 8 GB de RAM; Q4_K_M requiere unos 6-7 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, KoboldCpp y servidores compatibles con la API de OpenAI (tag endpoints_compatible). vLLM admite GGUF con soporte parcial; TGI no soporta GGUF de forma nativa, por lo que para FP16 conviene el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LlamaScientific-8B-i1-GGUF (este) | 8,03B | No disponible | Sin benchmarks publicados | llama3.1 | GGUF i1 con más de 20 variantes; 0 descargas |
| Rumiii/LlamaScientific-8B (base) | 8,03B | No disponible | Sin benchmarks publicados en la información disponible | llama3.1 | Safetensors, pensado para fine-tuning e inferencia en GPU |
| Llama-3.1-8B-Instruct | 8,03B | 128K (dato de la familia Llama 3.1) | Ampliamente evaluado en MMLU, HumanEval y GSM8K; cifras no incluidas aquí | Llama 3.1 Community License | Safetensors y múltiples GGUF de terceros; ecosistema muy maduro |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Evaluado en MMLU, HumanEval y GSM8K; cifras no incluidas aquí | Apache 2.0 | Safetensors y GGUF oficiales y de terceros; uso comercial sin restricciones de la licencia Llama |
| Bio-Medical-Llama-3-8B | ~8B | No disponible | Sin datos en la información disponible | llama3 | GGUF de mradermacher y otros; alternativa de dominio biomédico |

La comparativa relevante para un desarrollador es frente a Llama-3.1-8B-Instruct (misma base, mayor madurez y contexto documentado) y frente a Qwen2.5-7B-Instruct (licencia Apache 2.0 y mejor soporte multilingüe). LlamaScientific-8B solo aporta ventaja si el ajuste científico y el tool calling medido en tareas propias superan a esos modelos, algo que no puede afirmarse sin benchmarks.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado. No hay garantía de calidad en castellano y el tokenizador de Llama 3 penaliza idiomas distintos del inglés en términos de tokens por palabra.
- Contexto desconocido: la información disponible no especifica la ventana, lo que impide planificar despliegues con documentos largos sin verificarlo empíricamente.
- Licencia llama3.1 (Llama 3.1 Community License): permite uso comercial con condiciones, entre ellas mantener el aviso "Built with Llama", incluir el texto de la licencia, no usar los resultados para entrenar otros modelos de forma que se eluda la licencia y respetar el umbral de 700 millones de usuarios mensuales. Conviene revisar el texto completo antes de explotación comercial.
- Cuantizaciones agresivas: el propio autor califica IQ1_S como "for the desperate", IQ1_M como "mostly desperate" y Q2_K_S como "very low quality". Por debajo de IQ3 se espera degradación notable en tareas de razonamiento científico.
- Riesgo de alucinación: en dominios como química y biología, una referencia, una fórmula o una constante inventada puede tener consecuencias graves; se requiere verificación contra fuentes primarias.
- Sesgos de dominio: al fine-tunear sobre un dataset único (nvidia/Nemotron-SFT-Science-v2) sin documentación de composición, puede heredar sesgos de cobertura (predominio de ciertas disciplinas, literatura en inglés, ausencia de contextos clínicos).
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre calidad real ni sobre estabilidad del tool calling.
- Doble ajuste sin evaluación publicada: es un SFT sobre otro modelo ya ajustado, sin datos de retención ni de olvido catastrófico respecto a la base.
- Alineación y seguridad: no se documenta ningún proceso de RLHF, DPO o filtrado de seguridad; no debe desplegarse en producción orientado a usuario final sin una capa propia de moderación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LlamaScientific-8B-i1-GGUF
- Modelo base: https://huggingface.co/Rumiii/LlamaScientific-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Science-v2
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/LlamaScientific-8B-GGUF
- Página de descarga con resumen de variantes: https://hf.tst.eu/model#LlamaScientific-8B-i1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Grafana de comparación de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa que soporta la infraestructura del cuantizador: https://www.nethype.de/
- Alternativa de dominio biomédico citada en la búsqueda: https://huggingface.co/mradermacher/Bio-Medical-Llama-3-8B-i1-GGUF
