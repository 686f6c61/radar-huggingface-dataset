# miloviper/smollm2-ia-ejecutivos-cl

## Resumen

smollm2-ia-ejecutivos-cl es un adaptador LoRA publicado por el usuario miloviper sobre el modelo base HuggingFaceTB/SmolLM2-135M-Instruct. No se trata de un modelo entrenado desde cero, sino de un ejercicio de destilación: un modelo profesor de mayor tamaño generó 60 pares pregunta–respuesta y un estudiante de 135 millones de parámetros los aprendió mediante un adaptador de bajo rango. El resultado se distribuye como artefacto PEFT en safetensors y se carga junto al modelo base.

El dominio declarado es la divulgación de IA generativa para ejecutivos de empresas chilenas, con ejemplos de negocio en banca, minería, retail y viñas, y cubriendo fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación/LLMOps. Un detalle relevante para evaluadores: aunque el público objetivo es hispanohablante, el autor entrena y evalúa exclusivamente en inglés.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo reproducible del ciclo completo de destilación con LoRA (generación de datos sintéticos por un profesor, entrenamiento del adaptador, evaluación con juez LLM y conjunto de examen reservado). El propio autor lo califica de modelo educativo, sin vocación de uso en producción. Las métricas publicadas son modestas: nota media de 2,92 sobre 10 según juez LLM, frente a 1,83 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base SmolLM2-135M-Instruct; el adaptador es de bajo rango, no se especifica la arquitectura interna del base |
| Parámetros totales | 135 M en el modelo base; número de parámetros entrenables del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (viene determinada por el modelo base SmolLM2-135M-Instruct) |
| Tipos de cuantización | No disponible; el adaptador se publica sin cuantizar (safetensors). La cuantización requeriría fusionar el adaptador con el base y convertir a otro formato |
| Idiomas soportados | Inglés (`en`), según la model card y las etiquetas del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); el repositorio ocupa 0,0 GB |

Hiperparámetros del adaptador LoRA: r = 16, alpha = 32, dropout = 0,05, 3 épocas, tamaño de lote 4, tasa de aprendizaje 0,0005.

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 16 y alpha 32 (dropout 0,05) que se inyecta en las capas del modelo base SmolLM2-135M-Instruct, un modelo causal de generación de texto de 135 millones de parámetros. El entrenamiento se realizó durante 3 épocas con lotes de 4 ejemplos y una tasa de aprendizaje de 0,0005, y la pérdida de entrenamiento descendió de 3,5236 a 3,0419.

La innovación metodológica es la destilación con datos sintéticos: un modelo profesor de mayor tamaño redactó 60 pares pregunta–respuesta sobre el temario del taller (fundamentos de LLM, ingeniería de prompts, RAG, agentes de IA, ajuste fino y evaluación/LLMOps), y el estudiante los memorizó vía LoRA. Se reservaron 12 preguntas de examen que nunca se usaron en el entrenamiento, lo que permite medir generalización dentro de un conjunto muy reducido. No se documenta el modelo profesor utilizado, el número de tokens vistos, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La evaluación se hizo con un juez LLM sobre escala de 1 a 10.

## Capacidades

- Generación de texto conversacional breve y clara en inglés sobre temas de IA generativa aplicada a negocio.
- Explicación de conceptos del temario del taller: fundamentos de LLM, ingeniería de prompts, RAG, agentes de IA, ajuste fino, evaluación y LLMOps.
- Contextualización con ejemplos de sectores concretos de la economía chilena (banca, minería, retail, viñas).
- Formato de instrucción compatible con `apply_chat_template` del tokenizador del modelo base, es decir, conversación de un turno o multi-turno básica.
- Inferencia en CPU, viable por el tamaño reducido del modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés declarado; no hay evidencia de calidad en castellano.

## Casos de uso

- Material didáctico en cursos de destilación: sirve como referencia reproducible del flujo completo (profesor genera datos, LoRA entrena, juez LLM evalúa, examen reservado valida), con hiperparámetros e hiperenlaces públicos.
- Demostración de despliegue en CPU: al partir de un base de 135 M de parámetros, permite mostrar en una clase o taller cómo cargar un adaptador PEFT con `transformers` y `peft` en un portátil sin GPU.
- Prototipado rápido de asistentes de dominio acotado: el patrón de 60 pares de destilación se puede replicar con el vocabulario y los ejemplos de otra industria antes de invertir en un modelo mayor.
- Ejercicio de evaluación de calidad: el par de métricas publicado (nota media y pérdida) y el conjunto de examen de 12 preguntas sirven para practicar la comparación base frente a adaptador con un juez LLM.
- Base para experimentos de ajuste de tono: se puede reentrenar el adaptador con respuestas en castellano de España o de Chile para corregir el desajuste de idioma respecto al público objetivo.
- Prueba de conceptos de RAG pedagógica: utilizar el adaptador como generador de respuestas de ejemplo en un pipeline RAG de demostración sobre documentación de un taller, aceptando que la calidad es de prototipo.
- No se recomienda su uso en atención al cliente real, generación de código en producción ni tareas con requisitos de precisión, dado el tamaño del modelo y las métricas declaradas.

## Benchmarks y rendimiento

Los únicos datos publicados son una evaluación con juez LLM (escala 1–10) y la pérdida de entrenamiento:

| Métrica | Antes (modelo base) | Después (destilado) |
|---|---|---|
| Nota media (juez LLM, 1–10) | 1,83 | 2,92 |
| Pérdida de entrenamiento | 3,5236 | 3,0419 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación se realizó sobre 12 preguntas de examen reservadas, un conjunto demasiado pequeño para extraer conclusiones estadísticamente robustas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del base (135 M de parámetros) el peso en fp16 ronda los 270 MB, más el adaptador LoRA (r = 16, alpha = 32) y la caché KV, por lo que la inferencia cabe holgadamente por debajo de 1 GB.
- Cabe en CPU: el autor indica explícitamente que el modelo corre en CPU, lo que permite ejecutarlo en portátiles sin GPU.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 4090, A100 o H100 resultan sobredimensionadas para este modelo. Una GPU integrada o una T4 son suficientes.
- Despliegue: la vía documentada es `transformers` + `peft` (`PeftModel.from_pretrained` sobre `HuggingFaceTB/SmolLM2-135M-Instruct`). Para vLLM, llama.cpp, Ollama o TGI habría que fusionar el adaptador con el base y convertir los pesos; no se documenta ese procedimiento ni se publican pesos fusionados en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-ia-ejecutivos-cl | 135 M (base) + adaptador LoRA | no disponible | Nota media 2,92/10 con juez LLM (12 preguntas) | Apache 2.0 | Adaptador PEFT en HuggingFace |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible en la información proporcionada | Nota media 1,83/10 en la misma evaluación del autor | Apache 2.0 | Pesos completos en HuggingFace |
| SmolLM2-360M-Instruct (variante mayor de la misma familia) | 360 M | no disponible en la información proporcionada | No evaluado en esta ficha | Apache 2.0 | Pesos completos en HuggingFace |
| Otros adaptadores LoRA educativos sobre SmolLM2 | 135 M (base) + LoRA | no disponible | No disponible | Variable | HuggingFace |

La comparación relevante es interna: el adaptador mejora al base en la métrica del autor (de 1,83 a 2,92 sobre 10) a costa de especializarse en un temario muy estrecho y de perder versatilidad general. No hay datos públicos que permitan compararlo con adaptadores de terceros de la misma categoría.

## Limitaciones y advertencias

- Volumen de entrenamiento mínimo: solo 60 pares pregunta–respuesta, lo que produce un ajuste estrecho al temario y una capacidad de generalización muy limitada.
- Calidad baja en términos absolutos: la nota media tras la destilación es 2,92 sobre 10 según el juez LLM empleado por el autor; el propio autor lo describe como modelo educativo, no de producción.
- Riesgo alto de alucinación: un modelo de 135 M de parámetros con 60 ejemplos de entrenamiento no tiene conocimiento factual fiable sobre banca, minería, retail o viñas; los ejemplos de negocio son ilustrativos, no asesoramiento.
- Desajuste de idioma: el público objetivo son ejecutivos chilenos hispanohablantes, pero el modelo responde en inglés y no se ha entrenado ni evaluado en castellano.
- Sesgos: no documentados por el autor; al derivar de salidas de un modelo profesor no identificado, puede heredar sus sesgos y estilo, además de los del corpus del modelo base.
- Restricciones de licencia: el modelo base y el adaptador se publican bajo Apache 2.0, lo que permite uso comercial; sin embargo, el autor declara que no está destinado a producción ni a competir con el proveedor del modelo profesor, cuya identidad e condiciones de uso no se especifican.
- Trazabilidad incompleta: no se indica el modelo profesor, el número de tokens de entrenamiento, la composición del dataset ni el conjunto exacto de preguntas de examen, lo que dificulta la reproducibilidad.
- Sin datos de contexto ni de cuantización: cualquier despliegue en producción requeriría verificar la ventana de contexto efectiva del base y fusionar y convertir el adaptador a un formato servible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miloviper/smollm2-ia-ejecutivos-cl
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
- No se han encontrado en la información proporcionada papers, blogs, repositorios auxiliares ni demos adicionales del autor.
