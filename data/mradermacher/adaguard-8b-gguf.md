# mradermacher/AdaGuard-8B-GGUF

## Resumen

AdaGuard-8B-GGUF es la versión cuantizada en formato GGUF del modelo AdaGuard-8B, un modelo de guarda (*guard model*) desarrollado originalmente por Yunhao-Feng y convertido a GGUF por mradermacher. Se trata de un modelo de seguridad condicionado por políticas: en lugar de aplicar una taxonomía fija de riesgos, evalúa el comportamiento de agentes según las reglas que el usuario proporciona en tiempo de inferencia.

El modelo tiene 8.190.735.360 parámetros (unos 8B) y está construido sobre la arquitectura Qwen3, según los tags del repositorio. Forma parte de una familia de modelos de guarda de 0,6B, 4B y 8B descrita en el paper "AdaGuard: An Adaptive Guard Model with User-defined Policies", y su entrenamiento combina una inicialización supervisada con SafePO (optimización de políticas orientada a seguridad), dentro del paradigma de reinforcement learning.

Su relevancia actual está en el despliegue seguro de agentes LLM: al ser condicionable por políticas definidas por el usuario y estar disponible en cuantizaciones que van de 3,4 GB a 16,5 GB, puede actuar como capa de supervisión de agentes que operan con herramientas, incluso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso basado en Qwen3 (segun tags del repositorio) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; cuantizaciones con imatrix en repositorio aparte (i1-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (esta version); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 8B parámetros derivado de la familia Qwen3, según los tags declarados en el repositorio. No se trata de una arquitectura MoE ni híbrida: todos los parámetros están activos en cada pasada. El repositorio que nos ocupa no contiene el modelo original, sino sus pesos convertidos a formato GGUF en doce niveles de cuantización estática, además de una variante con cuantización ponderada por imatrix publicada por separado.

En cuanto al entrenamiento, el paper asociado describe una inicialización supervisada seguida de SafePO, un método de optimización de políticas orientado a seguridad dentro del campo del reinforcement learning. El objetivo es que el modelo interprete conjuntamente las reglas aplicables (política definida por el usuario) y el comportamiento del agente evaluado, ya que una misma acción puede recibir juicios distintos bajo políticas diferentes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF o DPO adicionales.

## Capacidades

- Evaluacion de seguridad condicionada por politica: recibe la politica o conjunto de reglas aplicables junto con la traza del agente y emite un juicio sobre su cumplimiento.
- Analisis de trayectorias de agentes: evalua secuencias de acciones y llamadas a herramientas, no solo mensajes aislados.
- Juicio contextual de acciones: una misma accion puede clasificarse de forma distinta segun la politica suministrada.
- Formato conversacional: el repositorio declara la etiqueta *conversational* y compatibilidad con *endpoints*.
- Ajuste fino por reinforcement learning orientado a seguridad (SafePO).
- Capacidades multilingues: solo ingles declarado.
- No se declaran capacidades de vision, audio, tool calling propio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Supervision de agentes autonomos en produccion: el modelo se coloca como capa intermedia entre el agente y sus herramientas, evaluando cada accion propuesta contra la politica de la organizacion antes de permitir su ejecucion.
- Filtrado de contenido en plataformas con normativa propia: al aceptar politicas definidas por el usuario, permite adaptar los criterios de moderacion a comunidades, jurisdicciones o verticales concretas sin reentrenar el modelo.
- Auditoria de trazas de agentes: procesamiento por lotes de registros de interaccion para detectar violaciones de politica y generar informes de cumplimiento.
- Evaluacion de seguridad en pipelines de desarrollo de agentes: integracion como test automatico que marca trayectorias problematicas durante las pruebas previas al despliegue.
- Red teaming asistido: uso del modelo para verificar si una politica dada bloquea correctamente comportamientos no deseados antes de exponer un agente a usuarios reales.
- Cumplimiento normativo en entornos regulados: definicion de politicas especificas por dominio (sanitario, financiero, educativo) y verificacion automatica de que las respuestas y acciones del agente las respetan.
- Moderacion de asistentes multi-turno: analisis de conversaciones completas con contexto acumulado, no solo del ultimo mensaje.
- Despliegue en hardware limitado: las cuantizaciones Q4 permiten ejecutar el guardarraíl en la misma maquina o en un equipo auxiliar con GPU de consumo, sin depender de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizacion no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni metricas especificas de seguridad) y la busqueda web solo aporta referencias al paper y a repositorios relacionados, sin cifras.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin contar contexto ni overhead del runtime):

| Cuantizacion | Tamano | VRAM aproximada |
|---|---|---|
| Q2_K | 3,4 GB | ~4 GB |
| Q3_K_S | 3,9 GB | ~5 GB |
| Q3_K_M | 4,2 GB | ~5 GB |
| Q3_K_L | 4,5 GB | ~5,5 GB |
| IQ4_XS | 4,7 GB | ~6 GB |
| Q4_K_S | 4,9 GB | ~6 GB |
| Q4_K_M | 5,1 GB | ~6,5 GB |
| Q5_K_S | 5,8 GB | ~7 GB |
| Q5_K_M | 6,0 GB | ~7,5 GB |
| Q6_K | 6,8 GB | ~8,5 GB |
| Q8_0 | 8,8 GB | ~10,5 GB |
| f16 | 16,5 GB | ~18 GB |

- GPU de consumo: cabe en tarjetas con 8 GB de VRAM en cuantizaciones Q4 y Q5, en 12 GB (RTX 3060, RTX 4070) con Q6_K o Q8_0, y en 16-24 GB con f16.
- GPU de centro de datos: A100, H100 o L40S ejecutan cualquier cuantizacion con margen amplio para contexto largo y lotes grandes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para los pesos safetensors del modelo base, vLLM o TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones en el repositorio.
- Nota: el repositorio completo ocupa 73,4 GB, por lo que conviene descargar solo el archivo de cuantizacion necesario.

## Comparativa con modelos similares

AdaGuard pertenece a la categoria de modelos de guarda orientados a la seguridad de agentes, donde tambien se situan alternativas como Llama Guard, ShieldGemma o Qwen3Guard. La informacion disponible en esta busqueda no incluye especificaciones verificadas de esos modelos, por lo que no se ofrecen cifras comparativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaGuard-8B (GGUF) | 8.190.735.360 | no disponible | no disponible | apache-2.0 | HuggingFace (mradermacher y Yunhao-Feng) |
| Llama Guard 3 8B | no disponible | no disponible | no disponible | no disponible | no disponible |
| ShieldGemma 9B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3Guard 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

El diferenciador documentado de AdaGuard frente a los modelos de guarda de taxonomia fija es su condicionamiento por politicas definidas en tiempo de inferencia, orientado especificamente a trazas de agentes y no solo a mensajes individuales.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion al interpretar politicas ambiguas o mal especificadas, lo que puede producir falsos negativos o falsos positivos en la clasificacion de trayectorias.
- Es una cuantizacion: las versiones Q2_K y Q3_K introducen perdida de calidad frente a los pesos originales. Para tareas de seguridad criticas conviene usar Q8_0, f16 o los safetensors del modelo base.
- El modelo no sustituye la revision humana en flujos de decision de alto impacto.
- Licencia apache-2.0: permite uso comercial y modificacion, pero se mantienen las obligaciones habituales de atribucion y de cumplimiento de la licencia del modelo base.
- Repositorio de cuantizacion con muy poca validacion comunitaria en el momento de la consulta (92 descargas, 0 likes), lo que reduce la evidencia empirica disponible sobre su comportamiento.
- Los pesos han sido generados por un tercero (mradermacher) a partir del modelo de Yunhao-Feng; conviene verificar la integridad y el comportamiento del artefacto antes de usarlo en produccion.
- No se dispone de informacion sobre la longitud de contexto real, lo que limita la planificacion de despliegues con trazas de agente muy largas.
- El juicio del modelo depende por completo de la calidad de la politica suministrada por el usuario: una politica incompleta produce una supervision incompleta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AdaGuard-8B-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/AdaGuard-8B-i1-GGUF
- Modelo base: https://huggingface.co/Yunhao-Feng/AdaGuard-8B
- Paper: AdaGuard: An Adaptive Guard Model with User-defined Policies: https://arxiv.org/abs/2609.34241
- Referencia del paper en arxivsignals: https://arxivsignals.io/papers/2609.34241
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#AdaGuard-8B-GGUF
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
