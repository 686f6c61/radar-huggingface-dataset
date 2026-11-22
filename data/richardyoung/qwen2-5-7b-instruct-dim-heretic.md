# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Su proposito declarado es eliminar el comportamiento de rechazo y la censura del modelo base mediante una tecnica de "decensurado" o "abliteration" (el tag `heretic` hace referencia a la herramienta Heretic, especializada en este tipo de intervenciones sobre pesos). El resultado es un modelo conversacional que responde a peticiones que el modelo original rechazaria por sus politicas de seguridad.

El modelo conserva la arquitectura del Qwen2.5-7B-Instruct original: un transformer decoder-only denso de aproximadamente 7.600 millones de parametros, con una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante YaRN, segun la documentacion del modelo base). Los pesos se distribuyen en formato safetensors y el repositorio ocupa 15,2 GB, lo que corresponde a precision bf16/fp16.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de modificacion de pesos orientada a eliminar salvaguardas, un fenomeno creciente en el ecosistema open source; por otro, advierte de que el acceso esta restringido (gated) en Hugging Face y de que, pese a la licencia Apache 2.0 del modelo base, el uso en produccion exige una evaluacion de riesgos propia. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no se especifica en esta ficha si el fine-tune preserva la extension YaRN hasta 131.072 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los pesos se publican en safetensors; la cuantizacion a GGUF/AWQ/GPTQ no esta confirmada) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 (segun tags del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por grupos de consultas (GQA), embeddings rotatorios (RoPE) y normalizacion RMSNorm. El modelo base fue entrenado por Alibaba con un corpus de hasta 18 billones de tokens segun su documentacion oficial, seguido de ajuste supervisado y optimizacion por preferencias humanas (RLHF/DPO). Esta ficha no dispone de los detalles exactos del dataset de preentrenamiento del base.

Sobre esa base, richardyoung aplica una intervencion de "abliteration" mediante la herramienta Heretic (tag `heretic`), que modifica selectivamente las direcciones de activacion asociadas al comportamiento de rechazo. El resultado es un modelo que mantiene la mayor parte de las capacidades del original pero suprime las respuestas de negativa ante peticiones sensibles. No se dispone de informacion sobre el volumen de datos de ajuste, la composicion del dataset de calibracion ni si se aplico RLHF adicional en este fine-tune. Los tags `reproducible` y `decensored` sugieren que el proceso esta documentado como reproducible, pero no se aportan mas detalles en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo a nivel del modelo base (sin datos especificos de este fine-tune).
- Respuestas a peticiones que el modelo original rechazaria por politicas de seguridad (comportamiento "uncensored").
- Soporte de tool calling / function calling: heredado del base, aunque no se confirma explicitamente en esta ficha que el fine-tune lo preserve.
- Capacidades de agente y razonamiento multi-paso: heredadas del base, sin verificacion especifica.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el base soporta mas idiomas.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre seguridad de modelos: analisis de como la abliteration afecta al comportamiento de rechazo y a las capacidades generales, comparando el fine-tune con el base en tareas controladas.
- Evaluacion de robustez de salvaguardas: uso en entornos de red teaming para medir la eficacia de filtros y clasificadores de contenido frente a modelos decensurados.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas, donde el modelo base rechazaria peticiones.
- Prototipado de asistentes conversacionales en ingles: despliegue en entornos internos con contexto de 32K tokens para conversaciones largas, siempre con revision humana.
- Analisis de contenido sensible con fines academicos: estudio de sesgos y de la frontera entre contenido permitido y prohibido en modelos alineados.
- Desarrollo de pipelines de generacion de texto con TGI o transformers: el modelo es compatible con text-generation-inference y endpoints, lo que facilita su integracion en infraestructura existente.
- Fine-tuning posterior para dominios especificos: al estar en safetensors y con licencia Apache 2.0, puede servir de base para ajustes adicionales, con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se aportan datos de MMLU, HumanEval, GSM8K ni de evaluaciones de rechazo (refusal rate) para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones teoricas, no confirmadas para este fine-tune).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 con contexto limitado, y en GPUs de 8-12 GB con cuantizacion 4/8 bits (si se generan pesos cuantizados).
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles segun los tags; llama.cpp/Ollama requeririan conversion a GGUF, no confirmada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-DiM-heretic | 7,6 B | 32.768 (base) | Apache 2.0 | Decensurado / abliterated | Gated en HF |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | Alineado con RLHF | Publico en HF |
| Modelos abliterated de la comunidad (p. ej. variantes de Llama 3.1 8B) | 8 B aprox. | 128K (base) | Licencia del base | Decensurado | Variable |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Alineado | Publico en HF |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento especificos de este fine-tune para contrastar.

## Limitaciones y advertencias

- Modelo decensurado: la supresion del comportamiento de rechazo implica un riesgo elevado de generar contenido danino, ilegal o inseguro; no es apto para aplicaciones orientadas al publico sin filtros externos.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade una capa de control pero no garantiza un uso responsable.
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del base.
- Riesgo de alucinacion heredado del modelo base; la abliteration puede alterar calibracion y coherencia en tareas de razonamiento.
- Sesgos: no se documentan evaluaciones de sesgo para este fine-tune; se heredan los del base y pueden amplificarse por la supresion de rechazos.
- Licencia Apache 2.0 permite uso comercial, pero el desarrollador asume la responsabilidad legal y etica del contenido generado; conviene revisar las condiciones de acceso del repositorio gated.
- No se confirma la preservacion de tool calling, agentes ni la extension de contexto a 131K tokens en este fine-tune.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que las capacidades del base se mantengan tras la intervencion.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la autenticidad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia Qwen2 (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper de referencia citado (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Herramienta Heretic: no disponible en la informacion proporcionada
