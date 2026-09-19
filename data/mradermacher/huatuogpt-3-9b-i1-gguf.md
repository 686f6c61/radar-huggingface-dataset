# mradermacher/HuatuoGPT-3-9B-i1-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una coleccion de cuantizaciones GGUF del modelo HuatuoGPT-3-9B, publicadas por el usuario mradermacher bajo el esquema de cuantizacion con imatrix (matriz de importancia) y pesos ponderados. El modelo base, HuatuoGPT-3-9B, procede de FreedomIntelligence, organizacion conocida por la familia HuatuoGPT de modelos de lenguaje orientados al dominio medico. El repositorio tiene un tamano de 22,2 GB e incluye 24 variantes de cuantizacion distintas, desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso.

Con 8.953.803.264 parametros (aproximadamente 8,95 mil millones, dato extraido de los pesos en safetensors), se trata de un modelo de escala media, encuadrable en la categoria de 8-9B, la franja que hoy domina el despliegue local en GPU de consumo. La relevancia de esta publicacion es practica: convierte un modelo de dominio medico en un artefacto ejecutable con llama.cpp, Ollama o cualquier runtime compatible con GGUF, con opciones que van desde los ~2 GB de las cuantizaciones de 1-2 bits hasta los ~7-9 GB de las de 5-6 bits.

Conviene subrayar que la informacion proporcionada no incluye la model card original de HuatuoGPT-3-9B: no hay datos sobre arquitectura, contexto, composicion del dataset de entrenamiento, licencia ni idiomas. Todo lo que no aparece explicitamente en el material de origen se marca como "no disponible" en esta ficha, y las estimaciones de hardware se senalan como tales. Los resultados de busqueda web devueltos no guardan ninguna relacion con el modelo (corresponden a un complejo hotelero en Dubai), por lo que no se ha podido extraer informacion adicional de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: HuatuoGPT-3-9B de FreedomIntelligence; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas del modelo base en safetensors) |
| Metodo de cuantizacion | imatrix (matriz de importancia) con pesos ponderados; convert_type: hf; quantize_version: 2 |
| Tamano del repositorio | 22,2 GB (conjunto completo de cuantizaciones) |
| Fecha de publicacion del repositorio | 18 de septiembre de 2026 (creacion), 18 de septiembre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base HuatuoGPT-3-9B. Los metadatos del repositorio de cuantizacion indican unicamente que los pesos se convirtieron desde un checkpoint en formato HuggingFace (`convert_type: hf`) y que la cuantizacion se realizo con imatrix y pesos ponderados (`quantize_version: 2`, `output_tensor_quantised: 1`). No se especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, cabezas de atencion o dimension del hidden state.

Tampoco hay datos sobre el entrenamiento: se desconoce el numero de tokens utilizados, la composicion del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, y si el modelo incorpora modos especiales de inferencia (por ejemplo, un modo de razonamiento explicito). Dado que el modelo base pertenece a la familia HuatuoGPT de FreedomIntelligence, es razonable esperar una especializacion en el dominio medico y probablemente un ajuste sobre un modelo preentrenado general, pero esto no puede confirmarse con el material disponible y no se afirma aqui como hecho.

En cuanto a la innovacion tecnica de este repositorio concreto, el elemento diferencial es el uso de cuantizacion con imatrix: se calcula una matriz de importancia a partir de datos de calibracion para ponderar el error de cuantizacion por tensor, lo que en la practica reduce la degradacion de calidad en bits bajos (especialmente en los rangos IQ1-IQ3) en comparacion con la cuantizacion uniforme. El autor incluye tambien la variante `small-IQ4_NL` y la serie IQ4_XS, orientadas a tamaños intermedios.

## Capacidades

- Generacion de texto conversacional: el tag del repositorio es `conversational`, y el nombre del modelo base apunta a un uso de dialogo, muy probablemente en el ambito medico.
- Respuesta a preguntas de dominio: la familia HuatuoGPT esta orientada a consultas clinicas y medicas, aunque no se detalla en la informacion proporcionada el alcance exacto.
- Conversacion multi-turno: al ser un modelo conversacional, se espera capacidad de mantener contexto de dialogo; la longitud concreta de contexto no esta disponible.
- Capacidades multilingues: no disponible. No se especifican idiomas soportados.
- Soporte de tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades de vision o audio: no disponible; no se menciona.
- Modo de razonamiento explicito (thinking mode): no disponible; no documentado.
- Capacidades de generacion de codigo o matematicas: no documentadas especificamente en el material disponible.

## Casos de uso

- Asistente de triaje clinico no diagnostico: desplegado en local con llama.cpp u Ollama, el modelo puede gestionar un dialogo inicial de recogida de sintomas y orientar al paciente hacia el nivel asistencial adecuado. Su tamano de ~9B permite ejecutarlo en una unica GPU de consumo con cuantizaciones Q4_K_M, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Educacion medica y simulacion de casos: el modelo puede usarse como interlocutor en practicas de anamnesis, generando respuestas de paciente simulado y explicaciones de fisiopatologia, siempre con supervision docente y sin sustituir material validado.
- Resumen y estructura de notas clinicas: con contexto suficiente (longitud no confirmada), puede transformar texto libre de historia clinica en secciones estructuradas (motivo de consulta, antecedentes, exploracion, plan) para revision humana posterior.
- Soporte documental para investigacion: busqueda asistida y resumen de literatura medica, generacion de borradores de secciones de revisiones o extraccion de entidades relevantes de abstracts, con verificacion obligatoria de las referencias citadas.
- Integracion en un RAG sanitario interno: el modelo actuaria como generador final sobre fragmentos recuperados de guias clinicas y protocolos internos, aprovechando una cuantizacion Q5_K_M o Q6_K para minimizar la perdida de calidad respecto al checkpoint original.
- Traduccion y adaptacion de material divulgativo sanitario: redaccion de versiones para pacientes a partir de textos tecnicos, con control editorial humano.
- Chatbot de atencion al paciente en portales hospitalarios: gestion de preguntas frecuentes administrativas (citas, preparacion de pruebas, horarios) con derivacion a personal humano en cuanto la consulta adquiere caracter clinico.
- Prototipado rapido en entornos sin GPU de datacenter: gracias a las cuantizaciones IQ1_S/IQ2_XXS, es posible hacer pruebas funcionales en CPU o en portatiles con 8-16 GB de RAM antes de decidir el despliegue definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizacion no incluye tablas comparativas y los resultados de busqueda web proporcionados no contienen ningun dato de evaluacion del modelo (corresponden a contenido no relacionado).

## Requisitos de hardware

Nota: los valores de VRAM son estimaciones calculadas a partir del numero de parametros (8.953.803.264) y del regimen de bits tipico de cada cuantizacion; no proceden de mediciones publicadas en la informacion disponible.

- VRAM estimada para inferencia (solo pesos, sin margen para KV cache):
  - IQ1_S: aproximadamente 2 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 2,4-3,0 GB.
  - Q2_K_S / Q2_K: aproximadamente 3,3 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M: aproximadamente 3,8-4,4 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS: aproximadamente 4,8-5,5 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 6,0-6,5 GB.
  - Q6_K: aproximadamente 7,3 GB.
  - Checkpoint base en safetensors (probablemente BF16/FP16): aproximadamente 17,9 GB.
- Margen adicional: anadir entre 1 y 3 GB para KV cache y buffers segun longitud de contexto y tamano de lote. Con contextos largos el consumo crece de forma aproximadamente lineal con el numero de tokens en cache.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) ejecuta comodamente cualquier cuantizacion hasta Q6_K con contexto amplio. Una RTX 4080/4070 Ti Super (16 GB) cubre Q6_K con contexto moderado y todas las opciones de 4-5 bits con holgura. Tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) manejan Q4_K_M y Q5_K_M. Tarjetas de 8 GB pueden alojar cuantizaciones IQ2/IQ3 o Q2_K, con degradacion de calidad apreciable.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten servir multiples replicas o lotes grandes en BF16 o en cuantizaciones altas, con throughput muy superior.
- CPU y RAM: al ser GGUF, el modelo puede ejecutarse en CPU con llama.cpp. Para Q4_K_M se recomiendan 8-10 GB de RAM libre; para Q6_K, 10-12 GB. Las variantes IQ1/IQ2 permiten probar el modelo con 4-6 GB de RAM, con calidad reducida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF como llama-cpp-python y text-generation-webui. Los tags del repositorio incluyen `endpoints_compatible`, lo que indica compatibilidad con el endpoint de HuggingFace para inferencia GGUF. vLLM y TGI no consumen GGUF de forma nativa para este caso, por lo que requeririan el checkpoint original o una conversion a otro formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base, por lo que la comparacion se limita a caracteristicas objetivas y verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF | Notas |
|---|---|---|---|---|---|
| HuatuoGPT-3-9B (i1-GGUF, este repositorio) | 8,95B | No disponible | No disponible | Si, 24 cuantizaciones | Cuantizacion imatrix por mradermacher; 0 descargas en el momento de la consulta |
| HuatuoGPT-o1-8B (FreedomIntelligence) | Aproximadamente 8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No confirmado en la informacion disponible | Misma familia y dominio; orientado a razonamiento medico |
| HuatuoGPT-II (FreedomIntelligence) | 7B y 13B segun variante | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No confirmado en la informacion disponible | Generacion anterior de la familia |
| Modelos generalistas de 8-9B (familia Llama 3.1 8B, Gemma 2 9B, Qwen 2.5 7B) | 7-9B | No disponible en la informacion proporcionada | Licencias permisivas con condiciones (no aplicable a este modelo) | Si, ampliamente | Alternativa generalista si se necesita un modelo no especializado en medicina |

No es posible establecer una comparacion de rendimiento (MMLU, HumanEval, benchmarks medicos como MedQA o PubMedQA) porque no hay resultados publicados en la informacion disponible para este modelo.

## Limitaciones y advertencias

- Ausencia total de model card del modelo base en la informacion proporcionada: se desconocen arquitectura, datos de entrenamiento, proceso de alineacion y evaluaciones. Esto impide auditar sesgos o riesgos de forma rigurosa.
- Licencia no disponible: no puede confirmarse que el uso comercial este permitido. Antes de cualquier despliegue en produccion es imprescindible consultar la licencia del repositorio original de FreedomIntelligence/HuatuoGPT-3-9B, que no se incluye aqui.
- Riesgo de alucinacion: cualquier modelo de lenguaje puede generar afirmaciones medicas incorrectas con apariencia de verosimilitud. En un dominio clinico esto es especialmente grave; toda salida debe pasar por revision profesional y no debe utilizarse para diagnostico, prescripcion ni decision terapeutica.
- No es un producto sanitario: no se ha declarado conformidad con marcos regulatorios de dispositivos medicos (MDR en la UE, FDA en EE. UU.). Su uso en contextos asistenciales requiere evaluacion regulatoria independiente.
- Idiomas no confirmados: no se especifica que idiomas soporta el modelo. El rendimiento en castellano es, por tanto, desconocido y no puede asumirse a partir del comportamiento en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos sin verificar experimentalmente el contexto efectivo del modelo base.
- Cuantizaciones de muy baja precision: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS reducen el tamano de forma agresiva y degradan la coherencia y la fidelidad factual. No son adecuadas para uso clinico, solo para pruebas de viabilidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria sobre la calidad de las cuantizaciones.
- Fecha de publicacion inusual: los metadatos indican creacion en septiembre de 2026, posterior a la mayoria de referencias de la familia HuatuoGPT; conviene verificar la procedencia y la integridad de los archivos antes de usarlos.
- Trazabilidad: al tratarse de una cuantizacion de terceros, cualquier cambio en el repositorio base no se refleja automaticamente aqui. Se recomienda fijar una revision concreta del repositorio en entornos reproducibles.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/HuatuoGPT-3-9B-i1-GGUF
- Modelo base citado en la model card: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-9B
- Organizacion del autor del modelo base: https://huggingface.co/FreedomIntelligence
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible en la informacion proporcionada.
