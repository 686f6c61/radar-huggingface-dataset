# Onclaw/Onclaw-1.5B-GGUF

## Resumen

OnClaw Raptor 1.5 (repositorio `Onclaw/Onclaw-1.5B-GGUF`) es un modelo de generación de texto orientado a código, publicado por el usuario Onclaw, con 1.543.714.304 parámetros (aproximadamente 1,54 B). Se trata de un merge independiente derivado del modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`, al que se ha aplicado un ajuste de tipo LoRA y un proceso posterior de abliteración (eliminación de direcciones de rechazo) según documenta el propio autor. El repositorio distribuye los pesos convertidos a GGUF con llama.cpp y ocupa 1,0 GB.

El modelo se declara experimental y el autor advierte explícitamente de que no garantiza cero rechazos ni exactitud factual. La única evaluación publicada son métricas de pérdida sobre texto retenido (eval_loss 0,6831; precisión media por token 0,8715), sin resultados de benchmarks de calidad como MMLU, HumanEval o GSM8K. El autor indica que las pruebas de carga y generación pasan, pero que los benchmarks de calidad «remain unverified».

Su interés práctico está en el despliegue local: al partir de una arquitectura de 1,5 B de parámetros y distribuirse en GGUF, es viable en GPU de consumo e incluso en CPU con llama.cpp, lo que lo sitúa en el nicho de autocompletado de código y asistentes técnicos sin conexión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (derivado de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card menciona explícitamente Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (convertido con llama.cpp) y safetensors (el recuento de parámetros se ha obtenido de safetensors) |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Pipeline | text-generation |
| Biblioteca declarada | transformers |
| Tamaño del repositorio | 1,0 GB |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creación (HuggingFace) | 2026-10-16 |
| Fecha de actualización (HuggingFace) | 2026-10-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-1.5B-Instruct, un transformer decoder denso de 1,54 B de parámetros. Sobre esa base, el autor aplica un ajuste LoRA (etiqueta `lora` en el repositorio) cuyo resultado se fusiona en un modelo independiente («standalone merged coding model», según la model card). Posteriormente se aplica un proceso de abliteración usando la herramienta `heretic` (enlace al repositorio de p-e-w en la sección de enlaces), que elimina direcciones de activación asociadas al rechazo de peticiones.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La única evaluación reportada es una medida de pérdida sobre un conjunto de texto retenido tras la abliteración, con los valores recogidos en la sección de benchmarks. La conversión a GGUF se realizó con llama.cpp y, según el autor, Q4_K_M reduce el tamaño a costa de perder algo de precisión.

## Capacidades

- Generación de texto y de código: el repositorio está etiquetado con `code` y el pipeline declarado es `text-generation`.
- Uso conversacional: la etiqueta `conversational` indica que el modelo está preparado para diálogo multi-turno, presumiblemente heredado del formato instruct del modelo base.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia compatible con la API de HuggingFace.
- Ajuste mediante LoRA fusionado: el modelo incorpora una adaptación de bajo rango ya integrada en los pesos, no como adaptador separado.
- Comportamiento abliterado: se han eliminado direcciones de rechazo, lo que reduce las negativas del modelo ante determinadas peticiones (ver limitaciones).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Visión, audio o cualquier otra modalidad: no disponible.

## Casos de uso

- Autocompletado de código en el IDE: con 1,54 B de parámetros y pesos GGUF de aproximadamente 1 GB en Q4_K_M, puede ejecutarse en la propia máquina del desarrollador para sugerir líneas y bloques de código sin enviar el contexto a un servicio externo.
- Generación de tests unitarios: dado un fragmento de función, el modelo puede producir esqueletos de pruebas en el mismo lenguaje; su tamaño permite integrarlo en un hook local de pre-commit o en un script de CI sin coste de GPU dedicada.
- Explicación y documentación de código heredado: el pipeline conversacional permite pedir resúmenes línea a línea o generar docstrings para módulos poco documentados, con la ventaja de que el código no sale de la infraestructura propia.
- Refactorización y traducción entre lenguajes: puede emplearse para proponer versiones equivalentes de un fragmento en otro lenguaje o para aplicar patrones de estilo, siempre con revisión humana dado que no hay benchmarks de calidad publicados.
- Asistente técnico interno offline: desplegado con llama.cpp u Ollama en un equipo de sobremesa, sirve para resolver dudas de API, sintaxis o mensajes de error en entornos con restricciones de conectividad.
- Generación de scripts de automatización: útil para producir scripts de shell, Python o tareas de administración a partir de una descripción en lenguaje natural, en flujos donde se prefiere una respuesta rápida y local frente a la precisión de un modelo mayor.
- Formación y práctica de programación: puede actuar como tutor que explica conceptos y propone ejercicios, asumiendo que el comportamiento abliterado exige supervisión del contenido generado en contextos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye una evaluación de pérdida sobre texto retenido posterior a la abliteración:

| Metrica | Valor |
|---|---|
| eval_loss | 0,6831075549125671 |
| eval_entropy | 0,43225104099677014 |
| eval_mean_token_accuracy | 0,8714768316434778 |
| eval_runtime (s) | 4,3093 |
| eval_samples_per_second | 58,71 |
| eval_steps_per_second | 58,71 |
| eval_model_preparation_time (s) | 0,0037 |
| eval_num_tokens | 0,0 |

El valor `eval_num_tokens: 0.0` resulta anómalo para una evaluación de texto y probablemente refleja un artefacto del registro, no un conjunto vacío; se reproduce tal cual figura en la model card. El autor afirma explícitamente que las pruebas de carga y generación pasan, pero que la calidad no está verificada con benchmarks. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del número de parámetros (1,54 B), no datos publicados por el autor:

- VRAM estimada en FP16: aproximadamente 3,1 GB solo para pesos, en torno a 4 GB contando caché KV y overhead del runtime.
- VRAM estimada en Q8_0: aproximadamente 1,6-1,8 GB.
- VRAM estimada en Q4_K_M: aproximadamente 1,0-1,3 GB.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y en la mayoría de iGPUs con memoria compartida suficiente. Es un modelo apto para portátiles con GPU discreta de gama media.
- CPU: la inferencia en CPU con llama.cpp es viable; se necesitan del orden de 1-2 GB de RAM para las cuantizaciones más agresivas y más si se usa Q8_0 o FP16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. Para vLLM o TGI la disponibilidad de soporte GGUF debe comprobarse en la versión concreta.
- Latencia y throughput: no disponibles (no hay mediciones publicadas; los 58,71 samples/s de la evaluación corresponden al script de evaluación del autor, no a un benchmark de inferencia reproducible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OnClaw Raptor 1.5 (Onclaw/Onclaw-1.5B-GGUF) | 1,54 B | no disponible | no disponible | HuggingFace, GGUF | Merge con LoRA y abliteración; benchmarks de calidad no verificados |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54 B (mismo recuento) | no disponible en esta información | no disponible en esta información | HuggingFace | Modelo base oficial del que deriva; el repositorio no documenta desviaciones más allá de la abliteración |
| Otras alternativas de código de 1-3 B | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de comparación en la información disponible |

No se han facilitado resultados que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría; cualquier comparación de calidad sería especulativa.

## Limitaciones y advertencias

- Modelo experimental y abliterado: el autor advierte de que no garantiza cero rechazos ni exactitud factual. La eliminación de direcciones de rechazo puede degradar la calibración y aumentar respuestas inseguras o incorrectas.
- Riesgo de alucinación: no se han publicado benchmarks que acoten la tasa de errores; en tareas de código, una API inventada o una firma incorrecta son fallos plausibles y requieren verificación.
- Licencia no disponible: al no declararse licencia, no puede confirmarse el uso comercial ni las condiciones de redistribución. Es un bloqueo relevante para integración en producto.
- Idiomas no declarados: se desconoce el soporte real de castellano u otros idiomas; el modelo base está orientado a código y a inglés.
- Longitud de contexto no documentada: limita el diseño de aplicaciones con ventanas largas o repositorios extensos.
- Pérdida de precisión en cuantización: el propio autor señala que Q4_K_M pierde precisión respecto a los pesos originales, lo que afecta a tareas sensibles.
- Tamaño reducido: con 1,54 B de parámetros, el razonamiento complejo, las matemáticas avanzadas y las tareas de agente multi-paso quedan fuera de su alcance razonable.
- Escasa validación externa: 0 descargas y 1 like en el momento de redactar esta ficha, sin issues ni discusiones que aporten evidencia adicional.
- Fechas de creación y actualización declaradas como 2026-10-16: conviene verificar la coherencia temporal del repositorio antes de tomarlo como referencia.
- Métrica `eval_num_tokens: 0.0`: inconsistente con el resto del informe de evaluación; reduce la confianza en la interpretación de esas cifras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Onclaw/Onclaw-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Herramienta de abliteración empleada (heretic): https://github.com/p-e-w/heretic
- llama.cpp (conversión a GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
