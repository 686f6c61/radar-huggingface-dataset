# mradermacher/docto-decision-qwen3.5-4b-fr-v0.1-GGUF

## Resumen

docto-decision-qwen3.5-4b-fr-v0.1-GGUF es la version cuantizada en formato GGUF del modelo bofenghuang/docto-decision-qwen3.5-4b-fr-v0.1, un ajuste fino mediante LoRA sobre una base de la familia Qwen3.5 de 4B parametros. La cuantizacion la ha realizado mradermacher, un autor conocido por publicar versiones GGUF de cientos de modelos, y esta pensada para su uso con llama.cpp, Ollama y otros runners compatibles con este formato.

El modelo esta especializado en el dominio medico en frances, con etiquetas que apuntan a decision clinica, calibracion y "system-one" (razonamiento rapido e intuitivo). Su tamano de aproximadamente 4,33 mil millones de parametros lo situa en la franja de modelos pequenos que pueden ejecutarse en hardware de consumo, lo que resulta relevante para desplegar asistentes clinicos o herramientas de apoyo a la decision en entornos con recursos limitados y con requisitos de privacidad de datos.

La publicacion original data de octubre de 2026 y la version GGUF acumula 12 descargas y ningun "like" en el momento de redactar esta ficha, por lo que se trata de un modelo muy reciente y con escasa traccion publica todavia. La licencia Apache 2.0 permite uso comercial, lo que amplia su atractivo para integraciones en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (detalles concretos no disponibles); compatible con vision por los ficheros mmproj publicados |
| Parametros totales | 4.326.350.848 (~4,33 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el modulo multimodal) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de bofenghuang sobre la familia Qwen3.5 de 4B parametros, aplicado mediante LoRA (la ficha etiqueta el base_model como adapter). La presencia de ficheros `mmproj` en la publicacion GGUF indica que el modelo base es multimodal, es decir, que incorpora un proyector que conecta un codificador visual con el modelo de lenguaje; sin ese fichero, la parte de vision no es utilizable en llama.cpp. La cuantizacion de mradermacher conserva ese componente en dos precisiones (Q8_0 y f16).

Respecto a los datos de entrenamiento, la ficha apunta al dataset bofenghuang/docto-decision-data-fr-v0.1, orientado a decision y calibracion en frances. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF/DPO posteriores al ajuste LoRA. Tampoco hay detalle sobre innovaciones tecnicas concretas (atencion linear, decodificacion especulativa, etc.). Todo ello queda como informacion no disponible en esta ficha.

## Capacidades

- Generacion de texto conversacional en frances, con orientacion a contestaciones de tipo decision clinica.
- Razonamiento de "system-one": el modelo esta etiquetado explicitamente para respuestas rapidas e intuitivas, mas que para cadenas de razonamiento largas.
- Calibracion de la confianza en la decision, segun las etiquetas "calibration" y "decision" de la ficha.
- Capacidad multimodal (vision) probable, dado que se publican ficheros mmproj para el componente visual; la ficha no detalla que tareas de vision cubre.
- Soporte multilingue limitado al frances (idioma declarado en la ficha).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y uso conversacional estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Apoyo a la decision clinica en frances: el modelo esta afinado especificamente sobre datos de decision medica, por lo que puede emplearse para proponer orientaciones diagnosticas o recomendaciones de actuacion a partir de un caso descrito en lenguaje natural, siempre con supervision profesional.
- Triaje y priorizacion de pacientes: al estar calibrado para decisiones rapidas, encaja en flujos donde hay que clasificar urgencia o derivar a especialista a partir de sintomas descritos.
- Calibracion de respuestas y gestion de la incertidumbre: la etiqueta "calibration" sugiere que el modelo puede usarse para estimar su propia confianza y marcar casos dudosos para revision humana, util en pipelines de seguridad clinica.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M de 2,9 GB, puede ejecutarse en portatiles con GPU modesta o incluso en CPU, lo que permite integraciones en consultas o entornos sin infraestructura de servidor.
- Investigacion sobre "system-one" y razonamiento rapido: util como objeto de estudio para comparar decisiones intuitivas frente a modelos con cadenas de razonamiento extensas en el dominio medico.
- Asistente conversacional para profesionales sanitarios: conversaciones multi-turno en frances para consultar protocolos, redactar notas o aclarar terminologia, integrado en herramientas internas de un centro.
- Procesamiento de documentos medicos con componente visual: si se carga el fichero mmproj correspondiente, podria abordar tareas sobre imagenes o documentos escaneados, aunque la ficha no concreta el alcance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: aproximadamente 2,1 GB (Q2_K), 2,7 GB (Q4_K_S e IQ4_XS), 2,9 GB (Q4_K_M), 3,3 GB (Q5_K_M), 3,7 GB (Q6_K), 4,7 GB (Q8_0) y 8,8 GB (f16). A estas cifras hay que sumar el contexto activo en KV cache.
- Componente multimodal: anadir 0,5 GB si se usa mmproj-Q8_0 o 0,8 GB si se usa mmproj-f16.
- GPU recomendadas: practicamente cualquier GPU de consumo moderna puede ejecutar las cuantizaciones Q4 y Q5. Para Q8_0 o f16 conviene una GPU con al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090). Para despliegue en servidor, A100 o H100 no son necesarias dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en GPUs como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en Mac con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF. Para transformers se deberia usar el modelo base en safetensors, no los ficheros GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/docto-decision-qwen3.5-4b-fr-v0.1-GGUF | ~4,33 mil millones | no disponible | GGUF | Apache 2.0 | Version cuantizada del modelo medico frances |
| bofenghuang/docto-decision-qwen3.5-4b-fr-v0.1 | ~4,33 mil millones | no disponible | safetensors | Apache 2.0 | Modelo base original en precision completa |
| mradermacher/Qwen3.5-4B-heretic-GGUF | ~4 mil millones | no disponible | GGUF | Apache 2.0 | Otra cuantizacion sobre la misma base Qwen3.5-4B, sin especializacion medica |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio y idioma restringidos: el modelo esta afinado para frances y para decision medica, por lo que su comportamiento fuera de ese ambito (otros idiomas, tareas generales) sera probablemente pobre.
- Riesgo de alucinacion clinica: cualquier salida en contexto medico debe tratarse como sugerencia y validarse por un profesional titulado; el modelo no sustituye el juicio clinico.
- Sesgos: no se documentan en la ficha analisis de sesgos demograficos, de genero, etarios o etnicos en los datos de entrenamiento, lo que es especialmente sensible en aplicaciones sanitarias.
- Calibracion: aunque el modelo se etiqueta como calibrado, no se aportan metricas de calibracion (ECE, Brier score u otras) que lo respalden.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones largas o documentos extensos.
- Datos y privacidad: al ejecutarse localmente en formato GGUF puede ayudar a cumplir requisitos de proteccion de datos, pero el responsable del despliegue debe verificar el cumplimiento normativo (por ejemplo, RGPD en la Union Europea) por su cuenta.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y del dataset utilizado para el ajuste.
- Madurez: con 12 descargas y ningun "like", el modelo carece de validacion comunitaria extensa; no se han publicado evaluaciones independientes.
- Produccion: no se documentan tasas de error, tasas de alucinacion ni pruebas de robustez, por lo que su uso en produccion clinica exigiria una evaluacion propia previa.

## Enlaces

- Ficha HuggingFace de la version GGUF: https://huggingface.co/mradermacher/docto-decision-qwen3.5-4b-fr-v0.1-GGUF
- Modelo base original: https://huggingface.co/bofenghuang/docto-decision-qwen3.5-4b-fr-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1
- Pagina de conveniencia de mradermacher para este modelo: https://hf.tst.eu/model#docto-decision-qwen3.5-4b-fr-v0.1-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Otra cuantizacion de Qwen3.5-4B de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Guia de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
