# nvidia/NV-Reason-CT

## Resumen

NV-Reason-CT es un modelo vision-lenguaje (VLM) tridimensional desarrollado por NVIDIA para el análisis de tomografías computarizadas (TC). Combina un codificador visual 3D nativo (3D ViT) con un modelo de lenguaje derivado de Qwen/Qwen3.5-4B mediante ajuste fino, y está orientado a la generación de informes radiológicos, la respuesta a preguntas clínicas y el razonamiento multi-paso sobre volúmenes de TC de tórax y abdomen. El problema que aborda es concreto: la mayoría de los sistemas vision-lenguaje médicos operan sobre imágenes 2D o comprimen las características volumétricas antes de la decodificación lingüística, lo que degrada la información espacial que la TC codifica a lo largo de cientos de cortes.

La propuesta técnica diferencial es no aplicar submuestreo espacial: el codificador convierte un volumen de entrada de 384×384×384 mm en una rejilla de 24×24×24, es decir, 13.824 tokens visuales, y todos ellos, junto con sus posiciones 3D, se pasan al modelo de lenguaje. La coherencia espacial se preserva mediante 3D MRoPE dentro del LLM. Los volúmenes se recortan automáticamente a tórax o abdomen y se remuestrean a resolución isótropa de 2 mm antes del procesamiento.

El modelo tiene 5.322.014.624 parámetros (aproximadamente 5,32 mil millones), se distribuye en formato safetensors con licencia OpenMDW-1.1, solo soporta inglés y fue entrenado de extremo a extremo con SFT y GRPO sobre unos 550.000 ejemplos de QA estructurado procedentes de 70.111 volúmenes de TC únicos. Es relevante ahora porque abre la puerta a razonamiento clínico verificable sobre imagen volumétrica sin colapsar la dimensionalidad, un paso que los VLM médicos 2D no pueden dar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje 3D: codificador 3D ViT (3D vision encoder) + modelo de lenguaje Qwen3.5-4B con 3D MRoPE |
| Parametros totales | 5.322.014.624 (aproximadamente 5,32 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors (bf16 en los ejemplos de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |
| Modalidad de entrada | Volumenes de TC en .nii.gz, remuestreados a 2 mm isótropos, recorte anatomico a torax o abdomen |
| Tokens visuales por volumen | 13.824 (rejilla 24x24x24, sin submuestreo espacial) |
| Modelo base | Qwen/Qwen3.5-4B (finetune) |
| Tamano del repositorio | 10,7 GB |
| Datasets de entrenamiento | ibrahimhamamci/CT-RATE, BodyMaps/CancerVerse |

## Arquitectura y entrenamiento

La arquitectura es un VLM de tres piezas: un codificador visual 3D tipo ViT que procesa el volumen completo, un proyector que mantiene la correspondencia entre tokens visuales y posiciones tridimensionales, y un modelo de lenguaje basado en Qwen3.5-4B. La innovación central es la ausencia de downsampling espacial: los 13.824 tokens visuales se inyectan íntegros en el decodificador, y el mecanismo 3D MRoPE codifica las relaciones espaciales dentro del propio LLM en lugar de resolverlas en el codificador. El preprocesado incluye un recorte anatómico automático basado en unidades Hounsfield pulmonares y una heurística de morfología 3D, con dos regiones soportadas: `chest` y `abdomen`. Esto funciona razonablemente bien en geometrías habituales (cuerpo completo, tórax más abdomen superior, tórax inferior más abdomen y pelvis).

El entrenamiento fue de extremo a extremo en dos fases: Supervised Fine-Tuning (SFT) y Group Relative Policy Optimization (GRPO). El corpus consta de aproximadamente 550.000 ejemplos de QA estructurado derivados de 70.111 volúmenes de TC únicos, e integra informes estandarizados, QA centrado en anomalías, interacciones multi-turno y razonamiento redactado por radiólogos a partir de interpretaciones grabadas y transcritas. Esas anotaciones expertas también guían la generación de datos sintéticos de razonamiento anclados al informe para la fase SFT, mientras que GRPO emplea recompensas verificables sobre conjuntos de anomalías torácicas y abdominales. El modelo expone un modo de pensamiento controlable mediante el parámetro `enable_thinking`, lo que permite alternar entre razonamiento extenso y respuestas concisas.

## Capacidades

- Generación de informes radiológicos estructurados de TC de tórax y de TC abdominal a partir del volumen completo.
- Respuesta a preguntas clínicas abiertas sobre hallazgos en el volumen ("describe los hallazgos pulmonares", "¿hay derrame pleural?").
- Razonamiento multi-paso explícito sobre la imagen, activable con `enable_thinking=True`, que produce una cadena de análisis antes de la conclusión.
- Modo de respuesta directa sí/no con `enable_thinking=False`, útil para clasificación binaria de hallazgos.
- Manejo de conversaciones multi-turno sobre un mismo estudio, reutilizando el modelo cargado para distintas preguntas y regiones anatómicas.
- Procesamiento de imagen médica volumétrica nativa en formato NIfTI (.nii.gz), sin necesidad de preproyectar los cortes a 2D.
- Recorte anatómico automático de tórax o abdomen integrado en el `AutoProcessor`.
- Capacidad de pregunta-respuesta centrada en anomalías (enfermedad torácica y abdominal) gracias al entrenamiento con GRPO sobre conjuntos verificables.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes: no documentado en la informacion proporcionada.
- Capacidades multilingues: solo ingles, segun la tarjeta del modelo.
- Otras modalidades (vision 2D general, audio, vídeo): no documentadas; el modelo esta especializado en TC volumetrica.

## Casos de uso

- Generacion de informes radiologicos estructurados: el modelo recibe el volumen .nii.gz y un prompt del tipo "Write a structured chest CT report", devolviendo un informe con secciones de hallazgos. Es adecuado porque procesa el volumen completo a 2 mm de resolucion y conserva la relacion espacial entre estructuras mediante 3D MRoPE.
- Triaje automatizado de hallazgos criticos en urgencias: con `enable_thinking=False` y preguntas binarias ("¿hay derrame pleural?", "¿hay neumotorax?"), se puede construir un clasificador de priorizacion que marque estudios para lectura inmediata. La respuesta corta reduce la latencia frente al modo de razonamiento.
- Segunda lectura y asistencia al radiologo: el modo de pensamiento genera una cadena de razonamiento explicita que el especialista puede auditar, contrastando conclusiones con la evidencia visual. Es util como verificacion cruzada en estudios abdominales complejos.
- Control de calidad y normalizacion de informes: dado un volumen y un informe de texto libre, el modelo puede generar la version estructurada equivalente, facilitando la homogeneizacion de plantillas en un servicio de radiologia.
- Investigacion clinica retrospectiva y cribado de cohortes: con ~70.000 volumenes de entrenamiento como referencia de dominio, el modelo puede aplicarse a grandes repositorios de TC para etiquetar fenotipos de forma escalable antes de la revision manual.
- Preanotacion para pipelines de etiquetado: generar borradores de hallazgos que despues se corrigen en herramientas de anotacion, reduciendo el tiempo de los radiologos en la construccion de datasets.
- Formacion de residentes: el modelo puede producir explicaciones paso a paso de por que un hallazgo es visible en el volumen, sirviendo como material docente sobre semiologia en TC toracica y abdominal.
- Integracion en estaciones de trabajo de imagen medica: al cargarse con `transformers` y `trust_remote_code=True`, puede envolverse en un servicio interno que reciba el estudio desde el PACS y devuelva texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo describe el pipeline de entrenamiento y los datasets empleados (CT-RATE y CancerVerse), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas especificas de radiologia como informe clinico, deteccion de anomalias o QA medico. Tampoco se proporcionan resultados frente a modelos comparables.

## Requisitos de hardware

- VRAM estimada (calculo a partir del tamano declarado, no dato oficial): los pesos en bf16 ocupan aproximadamente 10,7 GB, coherente con el tamano del repositorio. Sumando la cache KV de 13.824 tokens visuales mas hasta 2.048 tokens generados, una estimacion razonable es de 16 a 24 GB de VRAM en bf16.
- GPU de datacenter recomendadas: NVIDIA A100 (40 GB u 80 GB), H100 (80 GB) y L40S (48 GB) son suficientes por capacidad de memoria; no hay cifras oficiales de latencia ni throughput.
- GPU de consumo: si, el modelo cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bf16, aunque con poco margen para lotes grandes o contextos extensos. En GPUs de 16 GB seria necesario cuantizar a 8 bits o 4 bits, algo no documentado oficialmente.
- Opciones de despliegue: la ruta documentada es `transformers` con `AutoModelForImageTextToText`, `AutoProcessor`, `trust_remote_code=True`, `dtype=torch.bfloat16` y `attn_implementation="sdpa"`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. El cuello de botella previsible es la atencion sobre 13.824 tokens visuales mas los tokens de texto, que crece con la longitud de la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NV-Reason-CT | 5,32 mil millones | TC volumetrica 3D (torax y abdomen) + texto | No disponible | OpenMDW-1.1 | HuggingFace, con demo Gradio y repositorio en GitHub |
| Qwen/Qwen3.5-4B (modelo base) | ~4 mil millones (segun denominacion) | Solo texto | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros VLM medicos 3D comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos verificados de parametros, contexto o rendimiento de alternativas directas en la categoria de VLM 3D para TC, por lo que no se puede establecer una comparacion cuantitativa fiable mas alla del modelo base.

## Limitaciones y advertencias

- Uso clinico: el modelo no se presenta como dispositivo medico ni ha sido validado para diagnostico. Cualquier empleo en entorno asistencial debe ser experimental y con supervision de un profesional cualificado.
- Riesgo de alucinacion: como todo modelo generativo, puede describir hallazgos inexistentes o omitir hallazgos presentes. En imagen medica este riesgo es critico y exige verificacion humana.
- Cobertura anatomica limitada: solo soporta recorte de torax y abdomen, y solo la modalidad TC. No cubre resonancia magnetica, PET, ecografia ni regiones como craneo o extremidades.
- Idioma: unicamente ingles, tanto en prompts como en salida.
- Dependencia del preprocesado: el recorte anatomico automatico se basa en unidades Hounsfield y en una heuristica de morfologia 3D; geometrias de estudio poco habituales o con contraste pueden degradar el recorte y, con ello, la calidad de la respuesta.
- Coste de atencion: 13.824 tokens visuales por volumen consumen una parte muy relevante de la ventana de contexto y encarecen la inferencia frente a alternativas 2D comprimidas.
- Sesgos del dataset: el entrenamiento se apoya en CT-RATE y CancerVerse, cuyo perfil demografico y de equipos no se detalla en la informacion disponible; el comportamiento fuera de esas distribuciones no esta caracterizado.
- Licencia: OpenMDW-1.1 debe revisarse antes de cualquier uso comercial, ya que sus terminos no se detallan en la informacion proporcionada.
- Ejecucion de codigo remoto: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar ese codigo antes de desplegarlo.
- Madurez: con 392 descargas y 15 "me gusta" en HuggingFace, la adopcion y la validacion externa son todavia muy reducidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NV-Reason-CT
- Repositorio en GitHub: https://github.com/NVIDIA-Medtech/NV-Reason-CT
- Demo en Gradio: https://huggingface.co/spaces/nvidia/nv-reason-ct
- Articulo en arXiv: https://arxiv.org/abs/2609.27511
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CT-RATE: https://huggingface.co/datasets/ibrahimhamamci/CT-RATE
- Dataset CancerVerse: https://huggingface.co/datasets/BodyMaps/CancerVerse
- Requisitos de instalacion: https://huggingface.co/nvidia/NV-Reason-CT/resolve/main/requirements.txt
