# nouli-ai/nouli-cyber-specialists

## Resumen

Nouli Cyber Specialists es un paquete de modelos especializados desarrollado por Nouli AI orientado a flujos de trabajo de ciberseguridad. No se trata de un unico modelo, sino de un conjunto de tres componentes con funciones diferenciadas: un especialista en triaje CVSS que convierte descripciones de vulnerabilidades en vectores CVSS v3.1, puntuacion, severidad y ruta de priorizacion; un especialista en mapeo MITRE ATT&CK que sugiere tecnicas a partir de descripciones de comportamiento; y un selector de fuentes opcional que identifica oraciones relevantes en informes de amenazas.

El componente CVSS se construye mediante fine-tuning sobre ModernBERT-base, mientras que el mapeo ATT&CK combina SecureBERT 2.0 y CTI-BERT. El selector opcional es un adaptador sobre Qwen3-4B-Instruct-2507. El paquete se distribuye como un repositorio de 1,7 GB con un cargador personalizado, lo que implica que no funciona con la pipeline estandar de transformers y requiere el codigo incluido en el repositorio.

Su relevancia radica en la automatizacion de tareas de triaje y clasificacion que tradicionalmente consumen tiempo de analistas: la conversion de texto libre en metricas CVSS estructuradas y la atribucion de tecnicas ATT&CK. Al ejecutarse en local sobre CPU o CUDA, sin dependencia de APIs alojadas, encaja en entornos con requisitos de confidencialidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de encoders transformer (ModernBERT, SecureBERT 2.0, CTI-BERT) mas adaptador sobre Qwen3-4B |
| Parametros totales | no disponible (repositorio de 1,7 GB con multiples checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas largas se truncan a los limites documentados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (con avisos de upstream y datos aplicables) |
| Formato de pesos | safetensors, cargador personalizado (custom-inference) |

## Arquitectura y entrenamiento

El paquete agrupa tres especialistas con bases distintas. El especialista CVSS parte de answerdotai/ModernBERT-base, un encoder transformer moderno, afinado para predecir los ocho metricas base de CVSS v3.1 a partir de descripciones de vulnerabilidades. El especialista ATT&CK combina cisco-ai/SecureBERT2.0-base e ibm-research/CTI-BERT, ambos encoders especializados en texto de ciberseguridad, para clasificacion multilabel sobre 49 etiquetas de tecnicas. El selector de fuentes es un adaptador sobre Qwen/Qwen3-4B-Instruct-2507, un modelo generativo de 4 mil millones de parametros.

Los datos de entrenamiento provienen de dos conjuntos publicos: Tenebrae/cvss31vectors para el componente CVSS y ctokx/tram-attack-multilabel-clean para el mapeo ATT&CK. La model card indica que las revisiones de las fuentes estan fijadas y acompanadas de avisos. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO. El calculo de la puntuacion CVSS final no lo realiza el modelo: este predice el vector y el codigo del paquete calcula score, severidad y ruta de triaje, lo que separa la estimacion neuronal del calculo determinista.

## Capacidades

- Prediccion de vectores CVSS v3.1 completos (ocho metricas base) a partir de texto libre en ingles.
- Calculo determinista de puntuacion base, severidad y ruta de priorizacion a partir del vector predicho, mediante reglas incluidas.
- Mapeo multilabel de descripciones de comportamiento a 49 etiquetas de tecnicas MITRE ATT&CK, con probabilidades y umbral configurable (0,45 en los ejemplos).
- Selector de fuentes opcional que identifica oraciones originales relevantes en informes antes del mapeo ATT&CK.
- Ejecucion local en CPU o CUDA sin clave de API alojada.
- Capacidad de integracion con reglas de negocio y registro del flujo resultante (integracion Nouli).
- No soporta tool calling, agentes autonomos ni vision; es clasificacion de texto, no generacion abierta.

## Casos de uso

- Triaje de vulnerabilidades en un SOC: el especialista CVSS convierte descripciones de CVE o avisos en vectores y puntuaciones, y la regla de enrutamiento incluida prioriza hallazgos con acceso de red, sin privilegios y sin interaccion de usuario, reduciendo el tiempo de clasificacion manual.
- Enriquecimiento de bases de datos de vulnerabilidades: procesar en lote descripciones de boletines para poblar campos CVSS estructurados y detectar inconsistencias frente a las puntuaciones oficiales publicadas por FIRST.
- Mapeo de informes de amenazas a ATT&CK: analizar parrafos de threat intelligence y obtener tecnicas candidatas con probabilidad, utiles para construir matrices de cobertura o alimentar plataformas de deteccion.
- Generacion de reglas de deteccion asistida: a partir de las tecnicas sugeridas, derivar requisitos de telemetria y validar que las reglas existentes cubren las tecnicas observadas en el informe.
- Analisis de malware en laboratorio: describir el comportamiento observado de una muestra y obtener tecnicas ATT&CK para documentar el informe de analisis de forma consistente.
- Priorizacion de parches en gestion de activos: combinar el vector CVSS con la criticidad del activo y la ruta de triaje para ordenar la cola de remediacion.
- Preprocesado de informes largos: usar el selector de fuentes para extraer las oraciones relevantes de un informe extenso antes de aplicar el mapeo ATT&CK, reduciendo ruido y truncamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU viable para los especialistas de decision (CVSS y ATT&CK), segun los ejemplos de la model card ejecutados en CPU con los pesos incluidos.
- El selector de fuentes opcional requiere CUDA y una descarga separada del modelo base publico Qwen3-4B-Instruct-2507.
- VRAM estimada: no disponible de forma explicita; el componente Qwen3-4B requerira aproximadamente 8-10 GB en precision 16 bits, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no especificadas; cualquier GPU CUDA compatible con el modelo base Qwen3-4B para el selector.
- Despliegue: cargador personalizado incluido en el repositorio (scripts/infer.py); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| Nouli Cyber Specialists | Ensemble de encoders + adaptador | no disponible | no disponible | CVSS + ATT&CK | Apache-2.0 |
| SecureBERT 2.0 | Encoder | no disponible | no disponible | Ciberseguridad general | no disponible |
| CTI-BERT | Encoder | no disponible | no disponible | Threat intelligence | no disponible |
| Qwen3-4B-Instruct-2507 | Decoder generativo | 4B | no disponible | Generacion general | no disponible |

Los tres modelos de la tabla son componentes base del propio paquete, por lo que la comparativa refleja su relacion de dependencia mas que una alternativa directa. No se dispone de datos de rendimiento comparativo con otros modelos especializados en CVSS o ATT&CK en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa texto en ingles; entradas en otros idiomas no estan soportadas.
- Las estimaciones CVSS no son puntuaciones autoritativas; requieren revision por parte de un analista.
- La cobertura ATT&CK se limita a las 49 etiquetas incluidas; un resultado vacio no implica comportamiento benigno.
- Las entradas largas se truncan a los limites documentados, lo que puede perder informacion relevante.
- El selector de fuentes es opcional y puede omitir evidencia util.
- Los modelos no inspeccionan codigo ni determinan si un sistema es seguro.
- Requiere mantener el repositorio completo y usar el cargador personalizado; no es compatible con la pipeline estandar de transformers.
- Licencia Apache-2.0 con avisos de upstream y datos aplicables; CVSS es propiedad de FIRST y ATT&CK es marca registrada de The MITRE Corporation, con condiciones de uso que deben respetarse.
- Riesgo de alucinacion en el selector generativo (Qwen3-4B) al identificar oraciones fuente.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nouli-ai/nouli-cyber-specialists
- Sitio del autor: https://nouli.ai
- Ejemplos completos: https://huggingface.co/nouli-ai/nouli-cyber-specialists/tree/main/examples
- Avisos de licencia: https://huggingface.co/nouli-ai/nouli-cyber-specialists/tree/main/licenses
- Modelo base CVSS (ModernBERT): https://huggingface.co/answerdotai/ModernBERT-base
- Modelo base ATT&CK (SecureBERT 2.0): https://huggingface.co/cisco-ai/SecureBERT2.0-base
- Modelo base ATT&CK (CTI-BERT): https://huggingface.co/ibm-research/CTI-BERT
- Modelo base selector (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset CVSS: https://huggingface.co/datasets/Tenebrae/cvss31vectors
- Dataset ATT&CK: https://huggingface.co/datasets/ctokx/tram-attack-multilabel-clean
- Documentacion de la CLI de HuggingFace: https://huggingface.co/docs/huggingface_hub/guides/cli
- Modelos relacionados: https://huggingface.co/nouli-ai/nouli-guard · https://huggingface.co/nouli-ai/nouli-route · https://huggingface.co/nouli-ai/nouli-clause · https://huggingface.co/nouli-ai/nouli-policy-pair
