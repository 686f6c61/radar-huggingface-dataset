# mradermacher/Fastino-Nemotron-3.5-Super-VL-Healthcare-GGUF

## Resumen

Fastino-Nemotron-3.5-Super-VL-Healthcare es un modelo lingüístico de gran escala orientado al ámbito sanitario, desarrollado por fastino como un ajuste fino (fine-tuning) especializado sobre la familia Nemotron de NVIDIA. El repositorio aquí analizado no es el modelo original, sino una colección de cuantizaciones estáticas en formato GGUF publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face, cuyo objetivo es hacer ejecutables modelos de gran tamaño en hardware de consumo o en servidores modestos mediante llama.cpp y derivados.

El modelo base combina la arquitectura Nemotron "Super" con capacidades de razonamiento médico (medical-reasoning), extracción de información clínica y soporte de visión (VL, vision-language), lo que lo sitúa en la categoría de modelos verticales para el dominio healthcare. Con 123.611.033.088 parámetros totales y arquitectura de mezcla de expertos (MoE), está diseñado para tareas como razonamiento clínico, conversación asistencial y extracción estructurada de datos médicos. Su relevancia actual radica en la creciente demanda de LLM especializados en salud que pueden desplegarse de forma local, preservando la privacidad de datos de pacientes, algo crítico por normativas como el RGPD o HIPAA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia Nemotron "Super" |
| Parámetros totales | 123.611.033.088 (aprox. 123,6 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF estático); también cuants weighted/imatrix en el repositorio i1 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, fastino/Fastino-Nemotron-3.5-Super-VL-Healthcare, se construye sobre la arquitectura Nemotron 3.5 Super de NVIDIA, que emplea un diseño de mezcla de expertos (MoE). En los modelos MoE solo se activa un subconjunto de los parámetros por token, lo que permite combinar la capacidad de un modelo de más de 120 mil millones de parámetros con un coste de inferencia asociado a un número menor de parámetros activos. El sufijo "VL" indica la incorporación de capacidades vision-language, es decir, el modelo puede procesar imágenes además de texto, algo especialmente útil en entornos clínicos para interpretar documentos escaneados, gráficas o material médico visual. No obstante, en esta versión GGUF el componente multimodal (proyección de visión, mmproj) no está disponible según los metadatos del cuantizador.

Sobre el proceso de entrenamiento del modelo base, la información disponible es limitada: no se ha publicado el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas como RLHF o DPO. Los tags del repositorio (healthcare, clinical, medical-reasoning, information-extraction, fine-tuned) indican que se trata de un ajuste fino de especialización en el dominio sanitario, orientado a razonamiento clínico y extracción de información estructurada a partir de texto médico. Las cuantizaciones de mradermacher son cuants estáticos convertidos desde safetensors, con una versión weighted/imatrix (de mayor calidad a igual tamaño) disponible en un repositorio complementario.

## Capacidades

- Razonamiento médico: el modelo está especializado en tareas de medical-reasoning, como razonamiento sobre casos clínicos, diagnósticos diferenciales de apoyo y análisis de información sanitaria.
- Extracción de información: fine-tuned para information-extraction, es decir, extraer entidades y datos estructurados de textos clínicos (informes, notas, historiales).
- Capacidades vision-language en el modelo base: el sufijo VL indica soporte de entrada de imágenes en el modelo original, aunque esta colección GGUF no incluye el archivo mmproj necesario para la funcionalidad multimodal.
- Generación de texto conversacional: el repositorio está etiquetado como conversational, apto para diálogos multi-turno en contexto sanitario.
- Ejecución local y eficiente: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU, GPU de consumo o configuraciones híbridas CPU/GPU mediante llama.cpp, Ollama, LM Studio y herramientas compatibles.
- Soporte de tool calling / function calling: no disponible (no hay información al respecto en la model card).
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Asistente de razonamiento clínico de apoyo: un médico o personal sanitario puede introducir un caso (síntomas, antecedentes, analíticas en texto) y el modelo genera hipótesis diagnósticas y razonamiento paso a paso, sirviendo como segunda opinión automatizada; su especialización en medical-reasoning lo hace adecuado frente a LLM generalistas.
- Extracción estructurada de información clínica: pipelines que procesan informes de alta, notas de evolución o resultados de pruebas pueden usar el modelo para extraer entidades (diagnósticos, medicación, alergias, fechas) y volcarlas a formato JSON o tablas en un EHR.
- Resumen de historiales médicos largos: dada su gran capacidad total de parámetros, el modelo puede sintetizar historiales extensos en resúmenes legibles para traspasos de turno o informes de referencia, reduciendo la carga administrativa del personal sanitario.
- Chatbot de información sanitaria para pacientes: desplegado localmente en la infraestructura de un hospital o aseguradora, puede responder preguntas frecuentes sobre medicación, preparación para pruebas o postoperatorios, con los datos sin salir de la red interna.
- Procesamiento privado de datos de salud sensibles: organizaciones sujetas a RGPD o HIPAA pueden ejecutar el modelo on-premise (por ejemplo con Ollama o llama.cpp en servidores propios) para analizar documentación clínica sin enviar datos a APIs de terceros.
- Investigación biomédica y minería de literatura: equipos de investigación pueden usarlo para clasificar, resumir y extraer hallazgos de artículos científicos o informes de ensayos clínicos en inglés.
- Generación de documentación sanitaria: redacción automática de cartas de alta, informes de derivación o justificantes a partir de notas breves, manteniendo la terminología médica adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye evaluaciones (MMLU, HumanEval, GSM8K, MedQA, etc.) ni del modelo base ni de las versiones cuantizadas, por lo que no es posible comparar objetivamente su rendimiento en tareas médicas frente a otros modelos.

## Requisitos de hardware

Los requisitos dependen directamente de la cuantización elegida. Los tamaños de archivo indicados en la model card permiten estimar la memoria necesaria (se recomienda margen adicional para el contexto y la KV cache):

- Q2_K (54,9 GB): ejecutable en una sola GPU de 80 GB (A100, H100) con holgura, o en Mac Studio con 64-96 GB de memoria unificada; también viable en CPU con 64 GB de RAM a velocidad reducida.
- Q3_K_S / Q3_K_M / IQ4_XS (61,4-72,5 GB): requieren GPU de 80 GB (A100 80GB, H100 80GB) o sistemas con 96 GB de memoria unificada (Mac Studio M2/M3 Ultra).
- Q4_K_S / Q4_K_M (77,8-88,5 GB): recomendadas por el propio cuantizador por su equilibrio calidad/velocidad; necesitan 2 GPUs de 48 GB (por ejemplo 2x RTX A6000, 2x L40S) con offload parcial, o 96 GB de memoria unificada.
- Q5_K_S / Q5_K_M (89,1-98,4 GB): 2x A100 80GB o 128 GB de memoria unificada.
- Q6_K (115,8 GB) y Q8_0 (131,7 GB): orientadas a servidores multi-GPU (2-4x A100/H100) o estaciones con 192 GB de RAM/memoria unificada; priorizan calidad máxima sobre eficiencia.
- No cabe en GPUs de consumo individuales (RTX 4090/5090 con 24-32 GB) en ninguna cuantización, salvo mediante offload mayoritario a CPU, con penalización severa de velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: vLLM, TGI o SGLang (sujeto a soporte de la arquitectura Nemotron MoE en cada framework).
- Latencia y throughput estimados: no disponible; en configuraciones MoE con parámetros activos reducidos, la velocidad con offload parcial a CPU suele ser razonable, pero no hay cifras publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Super-VL-Healthcare | 123,6 B (totales) | MoE (Nemotron Super) | Salud, razonamiento clínico, visión | Apache 2.0 | safetensors / GGUF |
| Med42 (Zephyr-based, Clinaris) | 70 B | Dense transformer | Salud, QA clínico | Licencia propia con restricciones | safetensors / GGUF (comunidad) |
| OpenBioLLM-70B | 70 B | Dense transformer (Llama 2 base) | Biomédico, QA clínico | Licencia Llama (restricciones) | safetensors / GGUF (comunidad) |
| Nemotron 4 340B (NVIDIA) | 340 B | Dense/MoE según variante | Generalista, alta capacidad | Licencia NVIDIA | safetensors |

Nota: la comparación es aproximada por categoría (modelos médicos abiertos de gran tamaño); no se han publicado benchmarks que permitan comparar rendimiento cuantitativo entre ellos. La ventaja diferencial del modelo analizado es su licencia Apache 2.0, más permisiva que las de Med42 u OpenBioLLM, y su disponibilidad inmediata en GGUF para despliegue local.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano o en otros idiomas no está documentado y probablemente sea inferior, un factor crítico en entornos clínicos donde la precisión terminológica es esencial.
- Riesgo de alucinación: como todo LLM, puede generar información médica incorrecta o inventada. En el dominio sanitario esto supone un riesgo de seguridad significativo: debe usarse como herramienta de apoyo y nunca como sustituto del criterio de un profesional cualificado.
- Sin benchmarks publicados: no existen evaluaciones cuantificadas (ni en tareas médicas tipo MedQA/MedMCQA ni generales), por lo que su fiabilidad relativa es desconocida y debería validarse internamente antes de cualquier uso en producción.
- Componente de visión ausente en GGUF: aunque el modelo base es VL, las cuantizaciones de este repositorio no incluyen mmproj, por lo que la funcionalidad de imagen no está disponible en formato GGUF; habría que usar el modelo base completo.
- Cuantizaciones agresivas: los cuants Q2_K y Q3_K degradan apreciablemente la calidad, especialmente en razonamiento médico fino; se recomiendan Q4_K_S o superiores para uso serio.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes; no obstante, el uso en productos de salud puede estar sujeto a regulación sectorial (dispositivos médicos, MDR en la UE, HIPAA en EE. UU.) independiente de la licencia del software.
- Contexto y parámetros activos: la longitud de ventana de contexto y el número de parámetros activos por token no están documentados en la información disponible, lo que dificulta planificar cargas de trabajo con documentos largos.
- Recursos: con más de 123 mil millones de parámetros, el modelo queda fuera del alcance de hardware de consumo estándar, lo que limita su adopción frente a alternativas más pequeñas.

## Enlaces

- Repositorio de cuantizaciones GGUF (esta ficha): https://huggingface.co/mradermacher/Fastino-Nemotron-3.5-Super-VL-Healthcare-GGUF
- Modelo base (fastino): https://huggingface.co/fastino/Fastino-Nemotron-3.5-Super-VL-Healthcare
- Cuants weighted/imatrix (mradermacher): https://huggingface.co/mradermacher/Fastino-Nemotron-3.5-Super-VL-Healthcare-i1-GGUF
- Página de descargas con vista general: https://hf.tst.eu/model#Fastino-Nemotron-3.5-Super-VL-Healthcare-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo base: no disponible
