# mradermacher/doctor-ai-v0.1-GGUF

## Resumen

Doctor-ai-v0.1 es un modelo de lenguaje especializado en dominio medico y sanitario, afinado a partir de la familia Qwen2.5. Lo desarrolla el autor identificado en Hugging Face como mrrobot2259, y esta version concreta es una cuantizacion GGUF publicada por mradermacher para facilitar su despliegue en entornos con recursos limitados. El modelo esta orientado a tareas clinicas como la redaccion de notas SOAP, el razonamiento diagnostico diferencial y la asistencia en consulta, con soporte declarado para bengali (bn) e ingles (en).

La relevancia de esta ficha radica en que se trata de un modelo compacto de aproximadamente 1.540 millones de parametros, cuantizado en multiples formatos (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB), lo que lo hace viable en hardware de consumo. El repositorio acumula 357 descargas y emplea licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion propias de dicha licencia.

No obstante, la informacion publicada es escasa: no se detallan resultados de benchmarks, composicion del dataset de entrenamiento ni proceso de alineacion. La model card del cuantizador se limita a listar los ficheros GGUF generados y remite a la model card del modelo base para cualquier detalle adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5, segun tags del autor) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | bn (bengali), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es mrrobot2259/doctor-ai-v0.1, un ajuste fino sobre la familia Qwen2.5, tal como indican los tags del repositorio. Qwen2.5 emplea una arquitectura transformer decoder-only con atencion por causalidad estandar, aunque no se especifican en la informacion disponible detalles como el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni la longitud exacta de contexto nativa.

Respecto a los datos de entrenamiento, no se ha publicado informacion sobre el volumen de tokens, la composicion del corpus clinico, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Los tags sugieren un enfasis en terminologia medica bangladesi (bmdc, soap-notes, differential-diagnosis), lo que apunta a un dataset orientado a la practica clinica en el contexto de Bangladesh, pero no hay cifras verificables. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y bengali, con registro orientado a consulta medica.
- Redaccion de notas clinicas en formato SOAP (Subjetivo, Objetivo, Analisis, Plan).
- Apoyo al razonamiento diagnostico diferencial a partir de sintomas descritos por el usuario.
- Respuesta a preguntas de caracter sanitario y explicacion de conceptos medicos.
- Conversacion multi-turno (pipeline etiquetado como conversational).
- Compatibilidad con endpoints de inferencia estandar (tag endpoints_compatible).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Redaccion asistida de notas SOAP en consulta: el modelo puede transformar una transcripcion o un resumen de sintomas en una nota estructurada con las cuatro secciones clasicas, reduciendo el tiempo administrativo del facultativo. Su tamano compacto permite ejecutarlo en un portatil con GPU integrada.
- Triage inicial de sintomas en ingles o bengali: dado un conjunto de sintomas descritos en lenguaje natural, el modelo puede proponer una lista de diagnosticos diferenciales para revision posterior por personal sanitario, siempre como apoyo y no como sustituto del juicio clinico.
- Formacion de personal sanitario en Bangladesh: al soportar bengali, puede emplearse como tutor conversacional para estudiantes de medicina que practiquen anamnesis o explicaciones a pacientes en su idioma.
- Traduccion y adaptacion de material clinico entre ingles y bengali: util para ONG y organismos que necesiten localizar guias de practica clinica o folletos para pacientes.
- Despliegue en entornos con conectividad limitada: las cuantizaciones Q4_K_M (1,1 GB) y Q5_K_M (1,2 GB) permiten ejecutar el modelo en un telefono de gama alta o en una Raspberry Pi con suficiente RAM mediante llama.cpp, algo relevante en clinicas rurales sin acceso a la nube.
- Prototipado rapido de asistentes clinicos: al estar disponible en GGUF y con licencia Apache 2.0, un equipo de desarrollo puede integrarlo en un backend con Ollama o llama.cpp para validar flujos de conversacion antes de invertir en modelos mayores.
- Generacion de resumenes de historiales clinicos: con la longitud de contexto disponible (no documentada), puede condensar notas de evolucion en resumenes breves para traspaso de turno, aunque la ventana real debe verificarse antes de usarlo con historiales extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q4_K_S, 1,1 GB con Q4_K_M, 1,2 GB con Q5_K_M, 1,7 GB con Q8_0 y 3,2 GB con f16 (cifras derivadas del tamano de fichero indicado por el cuantizador).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 4090); para f16 se recomienda al menos 4 GB (RTX 3050 en adelante). En entornos de servidor, una T4 o A10 es mas que suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos ocho anos, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF requieren runtimes especificos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en la practica, con 1,5 B de parametros y cuantizacion Q4, cabria esperar decenas de tokens por segundo en una RTX 4090 y velocidad utilizable en CPU, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| doctor-ai-v0.1 (este) | 1,54 B | no disponible | Apache 2.0 | GGUF en HF | Especializado en dominio medico, bn/en |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors y GGUF | Modelo generalista del que deriva; contexto documentado y amplio ecosistema |
| BioMistral-7B | 7 B | 4.096 tokens (segun su model card) | Apache 2.0 | safetensors y GGUF | Especializado en biomedicina, mayor calidad potencial pero requiere mas VRAM |
| Meditron-7B | 7 B | 4.096 tokens (segun su model card) | Llama 2 (uso comercial restringido) | safetensors | Entrenado con corpus medico; licencia no permisiva para produccion comercial |

La comparativa con Qwen2.5-1.5B-Instruct es la mas directa, ya que doctor-ai-v0.1 es un ajuste fino sobre dicha familia; sin benchmarks publicados no es posible cuantificar la mejora en tareas clinicas. Frente a BioMistral o Meditron, la ventaja principal de doctor-ai-v0.1 es su tamano reducido y su licencia permisiva, a costa de una capacidad general presumiblemente menor.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en tareas clinicas, lo que impide compararlo objetivamente con alternativas.
- Riesgo elevado de alucinacion en un dominio de alto riesgo: cualquier salida debe ser revisada por personal sanitario cualificado antes de influir en una decision clinica.
- Sesgo geografico y linguistico: el enfasis en terminologia bangladesi (BMDC, practica clinica local) puede reducir su adecuacion a otros sistemas sanitarios, y no se documenta su rendimiento en castellano.
- Longitud de contexto no documentada: no es posible planificar su uso con historiales clinicos largos sin verificar experimentalmente la ventana real.
- Idiomas limitados a bengali e ingles segun la model card; no se declara soporte de castellano, por lo que su uso en Espana requeriria validacion previa.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y regulatoria (por ejemplo, normativa de productos sanitarios o proteccion de datos) derivada de su despliegue.
- Modelo de 1,54 B de parametros: su capacidad de razonamiento complejo es limitada en comparacion con modelos de 7 B o superiores; no es adecuado para tareas diagnosticas complejas sin supervision.
- El repositorio no incluye informacion sobre el proceso de alineacion ni sobre posibles filtros de seguridad, lo que aumenta el riesgo de respuestas inapropiadas en contextos sensibles.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/doctor-ai-v0.1-GGUF
- Modelo base: https://huggingface.co/mrrobot2259/doctor-ai-v0.1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#doctor-ai-v0.1-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
