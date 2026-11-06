# mradermacher/Sieve-31B-v3-GGUF

## Resumen

Sieve-31B-v3 es un modelo de decisión (decision model) desarrollado por sthanika-ai, una variante afinada a partir de una arquitectura Gemma 4 de unos 30,7 mil millones de parámetros. A diferencia de un LLM conversacional generalista, Sieve está especializado en tareas de calibración y selección entre opciones: su pipeline en Hugging Face es "multiple-choice" y sus etiquetas incluyen "decision-model", "calibration" y "decision-index". El problema que aborda es la fiabilidad de las decisiones automatizadas: en lugar de generar texto libre, califica o selecciona la mejor opción entre alternativas, algo útil como filtro o árbitro en sistemas de IA.

La ficha aquí tratada corresponde a la cuantización GGUF publicada por mradermacher, un cuantizador bien conocido en la comunidad que ofrece versiones estáticas del modelo original en formatos que van desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB). Esto permite ejecutar el modelo en hardware de consumo con llama.cpp, Ollama u otras herramientas compatibles con GGUF. El modelo original es un full fine-tune (ajuste completo de pesos) con licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones relevantes.

Su relevancia actual radica en la tendencia creciente a usar modelos especializados pequeños o medianos como componentes de sistemas mayores: verificadores, rerankeadores o calibradores que mejoran la calidad de LLM generales sin necesidad de modelos propietarios. Con 31B parámetros y cuantizaciones disponibles desde 12 GB, ocupa un punto intermedio accesible para estaciones de trabajo con GPU de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4 (transformer decoder) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF estáticos); no hay imatrix/weighted quants disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantización); el modelo original está en safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es sthanika-ai/Sieve-31B-v3, etiquetado como "gemma4", lo que indica que parte de una arquitectura transformer decoder de la familia Gemma 4. El modelo original se entrenó mediante full fine-tune (ajuste completo de todos los pesos, no LoRA ni adapters), orientado a tareas de decisión, calibración y selección de opciones múltiples (multiple-choice). La etiqueta "decision-index" sugiere que el modelo produce índices o puntuaciones sobre las opciones evaluadas en lugar de texto libre.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Tampoco se detalla si el modelo conserva capacidades generativas generales o si está restringido a la salida de decisiones. La cuantización GGUF de mradermacher es estática (sin imatrix), convertida desde los pesos originales en formato Hugging Face.

## Capacidades

- Selección entre opciones múltiples (multiple-choice): el pipeline del modelo está catalogado para esta tarea, evaluando alternativas y seleccionando la más adecuada.
- Calibración de decisiones: etiquetado explícito como "decision-model" y "calibration", útil para puntuar la confianza o calidad de respuestas.
- Índice de decisión (decision-index): puede producir puntuaciones o rankings sobre opciones, según las etiquetas del modelo.
- Uso como componente conversacional: el repo incluye la etiqueta "conversational", aunque su especialización es la evaluación, no la generación creativa.
- Idioma de trabajo: inglés; no hay soporte declarado para otros idiomas.
- No se ha documentado soporte de tool calling, agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Árbitro de LLMs (LLM-as-a-judge): dado un conjunto de respuestas candidatas de otro modelo, Sieve puede seleccionar la mejor o puntuarlas, integrándose en pipelines de evaluación automática sin depender de APIs propietarias.
- Reranking de candidatos en RAG: tras recuperar documentos o generar varios borradores, el modelo puede calificar cuál responde mejor a la consulta, actuando como filtro de calidad antes de mostrar resultados al usuario.
- Filtrado de datos sintéticos: en pipelines de generación de datasets, puede usarse para descartar muestras de baja calidad o incorrectas, aprovechando su especialización en calibración.
- Enrutado de consultas (routing): clasificar la intención o complejidad de una petición de usuario para dirigirla al modelo o agente adecuado en sistemas multi-modelo.
- Verificación de respuestas en producción: como verificador ligero que valida la salida de un modelo generador en tiempo real, reduciendo alucinaciones visibles para el usuario.
- Evaluación de benchmarks automatizada: dado su formato multiple-choice, es adecuado para ejecutar evaluaciones tipo MMLU o exámenes de opción múltiple de forma sistemática.
- Moderación o clasificación de contenido: tareas de decisión binaria o de categorías cerradas donde la generación libre no es necesaria y la consistencia importa más que la creatividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF, tamaño del archivo + contexto):
  - Q2_K: ~12 GB; Q3_K_M: ~15,4 GB; IQ4_XS: ~17 GB; Q4_K_M: ~18,8 GB; Q5_K_M: ~21,9 GB; Q6_K: ~25,3 GB; Q8_0: ~32,7 GB.
- GPU recomendadas: para Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente con margen para contexto; para Q6_K o Q8_0 conviene una RTX A6000, RTX 5090 o A100 de 40 GB. En CPU con suficiente RAM (32-64 GB) también es viable con velocidades bajas.
- Consumer GPU: cabe en una RTX 3090/4090 de 24 GB con cuants de hasta Q5_K_S (~21,4 GB); los cuants Q2_K a Q4_K_M caben también en GPUs de 16 GB como la RTX 4080/4060 Ti 16GB con contexto limitado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo original en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponible; al ser un modelo de 30B, en GPU de consumo cabe esperar del orden de unos pocos tokens/segundo en generación, aunque tareas multiple-choice con salidas cortas son poco exigentes en decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Sieve-31B-v3 (sthanika-ai) | ~30,7B | Decision/calibracion, multiple-choice | safetensors, GGUF (cuants de mradermacher) | Apache 2.0 |
| Qwen3-32B | ~32B | Generalista (chat, codigo, razonamiento) | safetensors, GGUF | Apache 2.0 |
| Gemma 3 27B | ~27B | Generalista multimodal | safetensors, GGUF | Licencia Gemma (restricciones de uso) |

Frente a un generalista como Qwen3-32B de tamaño similar, Sieve-31B-v3 está afinado específicamente para tareas de decisión y calibración, por lo que puede rendir mejor como juez o verificador, pero no es sustituible como asistente conversacional general. Frente a Gemma 3 27B (su familia base aparente), ofrece la misma ventaja de especialización y, además, licencia Apache 2.0 sin las restricciones de la licencia Gemma. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; su comportamiento en castellano u otros idiomas no está documentado y puede ser deficiente.
- Sesgos: no disponible; al ser un fine-tune de una base Gemma 4, puede heredar los sesgos del modelo base y de sus datos de entrenamiento, no descritos públicamente.
- Alucinacion: al estar especializado en selección entre opciones, el riesgo es menor que en generación libre, pero no hay garantías publicadas sobre su calibración real en dominios fuera de distribución.
- Contexto: la longitud de ventana no está publicada; debe verificarse antes de usarlo con documentos largos (por ejemplo, en reranking de RAG con mucho contexto).
- Cuantizacion: solo hay quants estáticos (sin imatrix); los cuants bajos (Q2_K, Q3_K) pueden degradar apreciablemente la calidad de calibración, tarea especialmente sensible a errores numéricos finos.
- Informacion limitada: la model card del modelo original no detalla datos de entrenamiento, benchmarks ni capacidades exactas, por lo que conviene validar empíricamente en el dominio de uso antes de producción.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial; no obstante, el modelo no parece diseñado para uso conversacional general y su salida debe integrarse con cautela en productos orientados al usuario final.

## Enlaces

- Cuantizacion GGUF (mradermacher): https://huggingface.co/mradermacher/Sieve-31B-v3-GGUF
- Modelo original (sthanika-ai): https://huggingface.co/sthanika-ai/Sieve-31B-v3
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Sieve-31B-v3-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
