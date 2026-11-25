# mradermacher/G4-LuneLight-v1.1-31B-GGUF

## Resumen

G4-LuneLight-v1.1-31B-GGUF es la distribución en formato GGUF del modelo G4-LuneLight-v1.1-31B, un modelo de lenguaje de aproximadamente 30.700 millones de parámetros desarrollado por zerofata y cuantizado por mradermacher. El repositorio proporciona únicamente pesos cuantizados estáticos (Q2_K a Q8_0, además de IQ4_XS) y un proyector multimodal (mmproj) en precisiones Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de visión además de generación de texto.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está etiquetado para el idioma inglés. La información pública disponible es muy limitada: la model card del repositorio cuantizado se limita a describir el proceso de cuantización y los ficheros ofrecidos, sin detallar arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha reside en que permite evaluar rápidamente la viabilidad de desplegar un modelo de ~31B en hardware de consumo o servidores modestos mediante cuantización GGUF, así como conocer las limitaciones de información de un modelo de nicho con escasa documentación técnica publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal inferido por la presencia de mmproj) |
| Parámetros totales | 30.697.345.596 (~30,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base en la documentación disponible. El recuento de parámetros (30.697.345.596) corresponde a los pesos en safetensors del modelo original. La presencia de ficheros mmproj (proyector multimodal) en el repositorio GGUF indica que el modelo incorpora un componente de visión, aunque no se detalla el codificador visual ni el mecanismo de fusión multimodal.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición del dataset), el proceso de alineación (RLHF, DPO u otras técnicas) ni innovaciones técnicas específicas. La model card del repositorio cuantizado es puramente operativa: describe los ficheros GGUF generados y remite al modelo base para cualquier detalle adicional.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: la inclusión de un proyector mmproj sugiere soporte de entrada de imágenes, aunque no se detalla su alcance ni calidad.
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según los metadatos.
- No se documenta modo de razonamiento extendido (thinking mode), audio ni otras modalidades.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (18,8 GB) y Q4_K_S (17,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en inglés: el modelo está etiquetado como conversacional y puede integrarse en aplicaciones de chat multi-turno mediante servidores compatibles con la API de OpenAI (endpoints_compatible).
- Experimentación con modelos multimodales en local: el proyector mmproj permite probar entrada de imágenes en entornos sin acceso a APIs en la nube, cargando el mmproj junto con el GGUF principal en llama.cpp.
- Evaluación comparativa de modelos de ~31B: sirve como base para medir throughput y calidad frente a otros modelos de tamaño similar en pipelines de investigación.
- Servicios de inferencia autoalojados con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales sin obligaciones de atribución adicionales más allá de las estándar.
- Fine-tuning y destilación sobre el modelo base: al estar disponible el modelo original en safetensors (zerofata/G4-LuneLight-v1.1-31B), puede servir como punto de partida para ajuste supervisado en tareas específicas en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~12,0 GB.
  - Q3_K_S: ~13,9 GB; Q3_K_M: ~15,4 GB; Q3_K_L: ~16,7 GB.
  - IQ4_XS: ~17,0 GB; Q4_K_S: ~17,9 GB; Q4_K_M: ~18,8 GB.
  - Q5_K_S: ~21,4 GB; Q5_K_M: ~21,9 GB.
  - Q6_K: ~25,3 GB.
  - Q8_0: ~32,7 GB.
  - Proyector multimodal: mmproj-Q8_0 (~0,9 GB) o mmproj-f16 (~1,3 GB) adicionales.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q6_K y Q8_0 con contexto largo; GPUs de 16 GB solo admiten Q2_K/Q3_K_S con riesgo de desbordamiento a RAM.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB únicamente con cuantizaciones Q2_K o Q3_K_S y posible offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints_compatible (API estilo OpenAI). vLLM y TGI no se documentan para este repositorio GGUF; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-LuneLight-v1.1-31B-GGUF | ~30,7B | no disponible | Apache 2.0 | GGUF | Multimodal (mmproj), solo inglés, sin benchmarks publicados |
| Modelos de ~30B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas equivalentes en la documentación proporcionada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación técnica prácticamente inexistente: no hay información sobre arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Idiomas: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea deficiente.
- Riesgo de alucinación: sin datos de alineación ni evaluaciones publicadas, no es posible estimar la fiabilidad factual del modelo.
- Sesgos: no se documenta ningún análisis de sesgos; al desconocerse el corpus de entrenamiento, el riesgo de sesgos no mitigados es alto.
- Contexto: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o tareas de recuperación de información extensa.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de garantías y de documentación sobre el origen de los datos de entrenamiento traslada al desplegador la responsabilidad legal sobre posibles infracciones.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Cuantizaciones de baja precisión (Q2_K, Q3_K) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/G4-LuneLight-v1.1-31B-GGUF
- Modelo base: https://huggingface.co/zerofata/G4-LuneLight-v1.1-31B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/G4-LuneLight-v1.1-31B-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#G4-LuneLight-v1.1-31B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
