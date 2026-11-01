# mradermacher/charcot-27b-GGUF

## Resumen

Esta ficha corresponde a la cuantización GGUF de **Charcot 27B**, un modelo de lenguaje orientado al ámbito sanitario desarrollado por **charcot-ai** y cuantizado por el usuario **mradermacher**, conocido por generar cuantizaciones estáticas de alta calidad de modelos populares. El modelo base (charcot-ai/charcot-27b) tiene 27.320.697.856 parámetros y ha sido entrenado con los datasets sintéticos `charcot-ai/gym` y `charcot-ai/gym-sft`, con foco en dominio healthcare, datos FHIR (el estándar de intercambio de información clínica electrónica) y datos sintéticos.

La relevancia de este repositorio radica en que hace ejecutable el modelo en hardware de consumo mediante formato GGUF (compatible con llama.cpp, Ollama, LM Studio, etc.), con cuantizaciones que van desde los 11 GB (Q2_K) hasta los 29,1 GB (Q8_0). Adicionalmente, se incluyen archivos `mmproj` (suplementos multimodales en Q8_0 y f16), lo que sugiere que el modelo base incorpora capacidades de visión. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones relevantes.

Cabe destacar que la información publicada sobre el modelo base es limitada: no se conocen detalles de arquitectura, longitud de contexto, composición exacta del entrenamiento ni benchmarks. Esta ficha refleja fielmente esa carencia indicando "no disponible" donde corresponda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, con suplemento multimodal mmproj) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, charcot-ai/charcot-27b, es un modelo denso de 27,3 mil millones de parámetros (no hay evidencia de arquitectura MoE en la información disponible). El tamaño de 27 B y la inclusión de archivos `mmproj` sugieren una arquitectura tipo transformer decoder con proyector multimodal al estilo de los modelos Gemma 2/3 de 27 B, aunque esto no está confirmado en la documentación disponible.

El entrenamiento ha utilizado los datasets `charcot-ai/gym` y `charcot-ai/gym-sft`, ambos etiquetados como datos sintéticos, con foco en el dominio sanitario (healthcare) y el estándar FHIR. La etiqueta "gym" sugiere un enfoque de tipo "gymnasium" o entorno de entrenamiento reforzado, y la variante "-sft" indica una fase de fine-tuning supervisado (SFT). No hay información disponible sobre el número de tokens, la fase de preentrenamiento, ni sobre técnicas posteriores como RLHF o DPO.

La cuantización publicada por mradermacher es de tipo estático (static quants), convertida desde el formato HF original. En el momento de redacción de la model card no existen cuantizaciones weighted/imatrix del propio autor.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion en el dominio sanitario (tag `healthcare`).
- Trabajo con datos FHIR: el tag `fhir` indica afinidad con el estándar HL7 FHIR para recursos clinicos electronicos (pacientes, episodios, medicacion, etc.).
- Entrenamiento sobre datos sinteticos clinicos (tags `synthetic-data`, `charcot-gym`), util para tareas de razonamiento medico sin exponer datos reales de pacientes.
- Capacidad multimodal potencial: la presencia de archivos `mmproj` (Q8_0 y f16) indica soporte de entrada visual mediante el proyector multimodal, aunque el alcance exacto no esta documentado.
- Tool calling / function calling: no disponible (no consta en la informacion proporcionada).
- Agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible; el unico idioma declarado es el ingles.

## Casos de uso

- **Generacion y comprension de recursos FHIR**: conversion de texto clinico no estructurado (informes de alta, notas de evolucion) a recursos FHIR estructurados como Patient, Observation o MedicationRequest, aprovechando el entrenamiento especifico en este estandar.
- **Asistentes clinicos internos**: resumen de historiales y elaboracion de notas SOAP en entornos de investigacion clinica, ejecutandose localmente (Q4_K_M ocupa 16,9 GB) para preservar la privacidad de datos sensibles.
- **Prototipado de aplicaciones healthcare on-premise**: la licencia Apache 2.0 y el formato GGUF permiten desplegar el modelo en servidores propios de hospitales o laboratorios sin depender de APIs externas.
- **Generacion de datos sinteticos sanitarios**: uso del modelo para ampliar datasets clinicos sinteticos para entrenar o evaluar otros sistemas, siguiendo la linea de los datasets gym con los que fue entrenado.
- **Analisis de imagenes medicas o documentos escaneados**: si el suplemento mmproj habilita entrada visual, podria combinarse con llama.cpp para consultas sobre imagenes (la calidad y el alcance de esta via no estan documentados).
- **Investigacion sobre LLMs de dominio medico**: base compacta (27 B) y abierta para experimentos de fine-tuning posterior, evaluacion de alucinaciones clinicas o destilacion hacia modelos menores.
- **Chatbot de informacion sanitaria general**: conversacion multi-turno en ingles sobre temas de salud, con la advertencia de que no debe sustituir juicio medico profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion solo incluye una grafica comparativa generica de perplejidad entre tipos de cuantizacion (de ikawrakow), sin metricas del modelo base.

## Requisitos de hardware

- **VRAM / memoria estimada para inferencia (GGUF, sin contexto adicional)**:
  - Q2_K: ~11 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S / Q4_K_M: ~15,9-16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - A estas cifras hay que anadir la memoria del KV cache, que crece con la longitud de contexto.
- **Consumer GPUs**: con 24 GB de VRAM (RTX 3090, RTX 4090) cabe holgadamente hasta Q4_K_M e incluso Q5_K_M; Q6_K requiere 24 GB con contexto ajustado o descarga parcial en RAM. Con 16 GB (RTX 4080/4060 Ti 16 GB) es viable Q3_K_M con offload parcial. Q8_0 exige 32 GB (RTX 5090) o CPU + RAM de 32 GB.
- **GPU de servidor**: una A100 40 GB o H100 ejecuta Q8_0 con contexto amplio sin problemas.
- **CPU puro**: viable con 16-32 GB de RAM en cuants Q2_K a Q4_K_M, a velocidades de pocos tokens/segundo.
- **Despliegue**: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque no hay confirmacion de compatibilidad verificada.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Dominio |
|---|---|---|---|---|
| Charcot 27B (esta cuantizacion) | 27,3 B | GGUF | Apache 2.0 | Healthcare / FHIR |
| Gemma 3 27B (Google) | 27 B | safetensors, GGUF (comunitarias) | Gemma license (uso comercial con condiciones) | General, multimodal |
| Qwen 2.5 32B (Alibaba) | 32,5 B | safetensors, GGUF (comunitarias) | Apache 2.0 (base) / Qwen license (instruct) | General |
| Med42 / modelos medicos abiertos (varios) | 8-70 B | safetensors, GGUF comunitarias | Variable | Healthcare |

Charcot 27B se situa en la franja de tamaño de Gemma 3 27B, con la ventaja de una licencia Apache 2.0 plenamente comercial y especializacion sanitaria, pero sin la madurez documental ni los benchmarks publicados de los modelos generalistas.

## Limitaciones y advertencias

- **No apto para uso clinico real sin validacion**: al tratarse de un modelo entrenado con datos sinteticos, puede alucinar informacion medica, dosis, codigos FHIR o terminologia clinica. Cualquier despliegue sanitario exige supervision profesional y validacion rigurosa.
- **Riesgo de alucinacion**: no hay evaluaciones publicadas de exactitud medica (tipo MedQA, MedMCQA); el nivel de fiabilidad en dominio clinico es desconocido.
- **Idioma**: solo declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior o no garantizado.
- **Contexto desconocido**: al no publicarse la longitud de contexto, no es posible planificar cargas con documentos largos (historiales completos, guias clinicas).
- **Cuantizaciones estaticas**: las cuants Q2_K y Q3_K_S pueden degradar notablemente la calidad, especialmente en tareas tecnicas como generar JSON FHIR valido; se recomiendan Q4_K_M o superiores.
- **Multimodalidad sin documentar**: los archivos mmproj existen, pero no hay instrucciones ni evaluaciones de su uso; tratar la capacidad visual como experimental.
- **Licencia**: Apache 2.0 no impone restricciones comerciales relevantes, pero los datasets de entrenamiento son sinteticos y su procedencia no esta auditada publicamente.
- **Procedencia del modelo base**: charcot-ai es un autor sin trayectoria publica ampliamente documentada; conviene auditar pesos y comportamiento antes de produccion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/charcot-27b-GGUF
- Modelo base: https://huggingface.co/charcot-ai/charcot-27b
- Dataset charcot-ai/gym: https://huggingface.co/datasets/charcot-ai/gym
- Dataset charcot-ai/gym-sft: https://huggingface.co/datasets/charcot-ai/gym-sft
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#charcot-27b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo del modelo base: no disponibles
