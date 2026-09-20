# hab-swe/Qwen3.5-4B-Q38-MedCLI-V2-Core-CMT-EHRDQ-SFT-LR-1en5

## Resumen

El modelo `hab-swe/Qwen3.5-4B-Q38-MedCLI-V2-Core-CMT-EHRDQ-SFT-LR-1en5` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-4B-Base`, publicado por el usuario hab-swe en HuggingFace. Por los tags del repositorio (`qwen3_5`, `image-text-to-text`, `conversational`) se trata de un modelo conversacional multimodal que acepta imagen y texto como entrada, no de un modelo puramente textual.

El repositorio declara 5.174.964.736 parametros reales segun los pesos en safetensors, una cifra superior a los 4B que sugiere el nombre y que probablemente incluye el codificador visual y las matrices de embeddings. El peso del repositorio es de 10,4 GB, coherente con un checkpoint en precision de 16 bits. La licencia declarada es Apache 2.0 y el acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.

El nombre del checkpoint apunta a un entrenamiento sobre datos clinicos o medicos de instrucciones (`MedCLI-V2-Core`, `CMT`, `EHRDQ`) con una tasa de aprendizaje de 1e-5, aunque esta orientacion no se confirma en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a articulos de ayuda de Google Maps y no guardan relacion con el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (entrada imagen-texto segun el tag `image-text-to-text`); detalles internos no disponibles |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Tipo de ajuste | SFT (supervised fine-tuning) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 10,4 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los tags del repositorio indican que se apoya en la arquitectura `qwen3_5` y que es un modelo de tipo imagen-a-texto, por lo que cabe esperar un transformer decoder-only con un codificador visual acoplado, pero no se especifica el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento, el nombre del checkpoint sugiere un proceso de ajuste supervisado sobre un corpus de instrucciones de dominio medico (`MedCLI-V2-Core`, `CMT`, `EHRDQ`) con una tasa de aprendizaje de 1e-5. No se publica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas adicionales de RLHF, DPO o preferencias. Tampoco se documentan hiperparametros como el tamano de lote, el numero de epocas o el regimen de congelacion de capas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento conjunto de imagen y texto como entrada (`image-text-to-text`), lo que permitiria extraer informacion de documentos escaneados, formularios o imagenes clinicas siempre que la arquitectura base lo soporte.
- Ajuste orientado a dominio medico o clinico, segun se deduce del nombre del checkpoint (no confirmado en la documentacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Extraccion estructurada de informes clinicos: al aceptar imagen y texto, el modelo podria transcribir y estructurar campos de informes escaneados o fotografias de documentos medicos en un formato JSON consumible por un sistema de historia clinica electronica.
- Control de calidad de datos de historia clinica electronica (EHRDQ): uso como clasificador o generador de reglas para detectar campos incompletos, incoherentes o mal codificados en registros de pacientes antes de cargarlos en un data warehouse clinico.
- Asistente conversacional de documentacion medica: generacion de borradores de notas clinicas a partir de un dialogo multi-turno con el profesional, que despues revisa y firma.
- Resumen de historias clinicas largas: condensacion de episodios asistenciales completos en resumenes por problema o por episodio, siempre que la ventana de contexto disponible lo permita (dato no confirmado).
- Anotacion asistida de corpus medicos: preetiquetado de entidades clinicas (farmacos, diagnosticos, procedimientos) para que anotadores humanos validen, acelerando la construccion de datasets en investigacion en NLP clinico.
- Investigacion academica en modelos de lenguaje medicos: el checkpoint sirve como punto de partida para experimentos de ajuste adicional con datos propios, dado que la licencia Apache 2.0 permite modificarlo y redistribuirlo.
- Atencion al paciente de primer nivel: respuesta a preguntas frecuentes sobre preparacion de pruebas, horarios o tramites administrativos, con derivacion a personal sanitario cuando la consulta sea clinica.
- Prototipado de interfaces multimodal en sanidad: pruebas de concepto que combinen captura de imagen (por ejemplo, una receta o un volante) con consulta en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de cifras de MMLU, HumanEval, GSM8K, evaluaciones medicas tipo MedQA/PubMedQA ni de metricas de tareas vision-lenguaje, y tampoco se ofrecen comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de 5,17B parametros y un checkpoint de 10,4 GB:
  - bf16/fp16: aproximadamente 10,4 GB solo de pesos; con cache KV y activaciones, del orden de 12-14 GB para contextos moderados.
  - int8: aproximadamente 5,2 GB de pesos; del orden de 7-8 GB en total.
  - int4: aproximadamente 2,6-3 GB de pesos; del orden de 4-5 GB en total.
  - Estas cifras son estimaciones de calculo a partir del numero de parametros; no proceden de mediciones publicadas para este modelo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12 GB o mas en bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) y con holgura en 24 GB (RTX 3090, RTX 4090). En cuantizacion de 4 bits podria ejecutarse en GPUs de 8 GB.
- GPU recomendadas para produccion: A100 40 GB, H100 80 GB o L40S si se necesita servir varias replicas o contextos muy largos.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que la via directa es `AutoModelForImageTextToText` / `AutoProcessor`. El soporte en vLLM, TGI, SGLang o llama.cpp dependera de que esos runtimes incorporen la arquitectura `qwen3_5` y el componente visual; no se confirma en la informacion disponible. Ollama y llama.cpp requeririan una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hab-swe/Qwen3.5-4B-...-SFT-LR-1en5 | 5,17B | no disponible | imagen-texto | apache-2.0 | gated |
| Qwen/Qwen3.5-4B-Base | no disponible (el nombre sugiere ~4B) | no disponible | no disponible | no disponible | publica |
| Alternativas de la misma categoria (VLM de 3-8B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de terceros no puede realizarse con rigor porque no hay resultados de benchmarks publicados para este checkpoint ni datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada de sesgos, toxicidad o comportamientos indeseados para este checkpoint.
- Riesgo de alucinacion: al ser un modelo de 4-5B ajustado por SFT, es previsible que invente datos cuando se le pidan hechos concretos, especialmente en dominios especializados como el clinico.
- Ausencia de validacion clinica: aunque el nombre sugiere un ajuste sobre datos medicos, no existe documentacion de validacion, certificacion ni evaluacion por profesionales sanitarios. No debe usarse para diagnostico, prescripcion ni ninguna decision clinica directa.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no documentada: no es posible planificar tareas que dependan de ventanas largas sin verificarla experimentalmente.
- Acceso restringido (gated): la descarga y el uso requieren aceptar condiciones en HuggingFace, lo que anade friccion a pipelines automatizados de CI/CD.
- Disponibilidad limitada de ecosistema: sin cuantizaciones GGUF publicadas ni confirmacion de soporte en vLLM/TGI, el despliegue en produccion a alta concurrencia no esta garantizado.
- Cero traccion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni documentacion adicional que permitan contrastar su comportamiento.
- Aunque la licencia Apache 2.0 permite uso comercial y modificacion, el cumplimiento normativo del dominio medico (RGPD, normativa de producto sanitario) es responsabilidad del integrador, no del publicador del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hab-swe/Qwen3.5-4B-Q38-MedCLI-V2-Core-CMT-EHRDQ-SFT-LR-1en5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paper, blog o repositorio asociado: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a paginas de ayuda de Google Maps y se han descartado por no ser pertinentes.
