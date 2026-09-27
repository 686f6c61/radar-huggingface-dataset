# ahnafmolt/molt

## Resumen

MOLT es un ajuste fino de tipo asistente conversacional publicado por el usuario ahnafmolt en Hugging Face. Según su model card, está entrenado para conversar en inglés, tanglish (inglés transliterado con tamil) y tamil simplificado, responder preguntas escolares del currículo de Sri Lanka y mantener una identidad propia consistente. El modelo base declarado es Qwen/Qwen2.5-0.5B-Instruct, distribuido bajo licencia Apache 2.0, lo que sitúa a MOLT en la categoría de modelos pequeños (menos de 1.000 millones de parámetros) orientados a despliegue local y bajo coste.

La relevancia de este tipo de publicaciones está en su nicho: asistentes educativos y multilingües para lenguas de bajos recursos, ejecutables en hardware modesto o incluso sin conexión. El tanglish y el tamil simplificado están muy poco representados en modelos abiertos de gran escala, de modo que un ajuste específico sobre un base de 0,5 B puede cubrir casos de uso locales que un modelo generalista no atiende bien.

Ahora bien, la ficha pública es extremadamente escasa: no declara licencia propia, ni idiomas oficiales en los metadatos, ni pipeline, ni resultados de evaluación. El repositorio figura con un tamaño de 0,0 GB y cero descargas, por lo que no puede confirmarse que los pesos estén realmente publicados. Todo lo técnico que sigue se apoya en el modelo base o queda marcado como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Parámetros totales | ~0,49 B (según el modelo base; no confirmado en la ficha de MOLT) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no verificado para el ajuste fino |
| Tipos de cuantización | No especificados por el autor. La arquitectura Qwen2 admite cuantización a GGUF, AWQ, GPTQ e INT8, pero no hay artefactos publicados en el repositorio |
| Idiomas soportados | Inglés, tanglish y tamil simplificado, según la model card. El modelo base declara soporte para 29 idiomas |
| Licencia | No disponible en la ficha de MOLT. El modelo base es Apache 2.0 |
| Formato de pesos | Etiqueta safetensors en el repositorio; el tamaño de 0,0 GB impide confirmar que los pesos estén subidos |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only con normalización RMSNorm, atención con RoPE, sesgo de atención desactivado (QKV bias) y capas de tipo SwiGLU en el MLP, es decir, la configuración estándar de la serie Qwen2. Con ~0,49 B de parámetros y una ventana nominal de 32.768 tokens, es un modelo denso pensado para inferencia en CPU o en GPU de gama baja. La model card no indica número de capas, dimensión oculta ni número de cabezas de atención para el ajuste publicado.

Sobre el entrenamiento, la información disponible se limita a tres afirmaciones del autor: ajuste para conversación en inglés, tanglish y tamil simplificado; entrenamiento sobre preguntas escolares del currículo de Sri Lanka; y entrenamiento para que el modelo conozca su propia identidad. No se especifican el número de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (SFT, LoRA, QLoRA, DPO) ni si hubo fases de alineación adicionales. Tampoco se documentan innovaciones técnicas propias. Cualquier detalle adicional debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, tanglish y tamil simplificado, según la model card.
- Respuesta a preguntas escolares del currículo de Sri Lanka (nivel educativo no especificado).
- Mantenimiento de una persona e identidad propias declaradas ("know its own identity").
- Comprensión y generación en registro informal mixto inglés-tamil, poco cubierto por modelos generalistas.
- Capacidad multilingüe limitada a los idiomas declarados por el autor; hereda del base cierta competencia residual en otros idiomas, sin garantías.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el tamaño del modelo hace poco probable un rendimiento fiable en estas tareas).
- Capacidades de código, matemáticas avanzadas, visión o audio: no disponibles; no se declaran en la ficha y el tamaño del base las limita seriamente.

## Casos de uso

- Tutor de deberes sin conexión: el modelo puede desplegarse en un portátil o una Raspberry Pi y resolver preguntas del currículo de Sri Lanka en inglés o tamil simplificado, sin coste de API ni dependencia de red.
- Refuerzo educativo en zonas con conectividad limitada: al caber en menos de 1 GB en cuantización de 4 bits, puede distribuirse como aplicación local en colegios con hardware antiguo.
- Atención al cliente regional en tanglish: adecuado para respuestas breves y de dominio acotado (horarios, trámites, preguntas frecuentes) en comunidades tamil-hablantes que se comunican mezclando inglés y tamil.
- Prototipado rápido de asistentes con persona propia: sirve como banco de pruebas para definir system prompts de identidad de marca antes de escalar a un modelo mayor.
- Router o clasificador de intenciones previo a un modelo grande: por su coste mínimo de inferencia, puede filtrar o etiquetar consultas entrantes y derivar al modelo principal solo las que lo requieran.
- Base para ajustes adicionales de bajo coste: al derivar de Qwen2.5-0.5B-Instruct, admite LoRA/QLoRA sobre una única GPU consumer para adaptarlo a nuevos dominios educativos o idiomas regionales.
- Generación de contenido educativo corto: fichas de repaso, preguntas de comprensión y ejercicios simples en los idiomas soportados, siempre con revisión humana.
- Prácticas docentes sobre fine-tuning: útil en cursos de IA para ilustrar el ciclo completo de ajuste y despliegue de un LLM pequeño sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de MOLT no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas multilingües, y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño del modelo base, ~0,49 B): en FP16 en torno a 1,0 GB de pesos; en INT8 en torno a 0,5 GB; en cuantización de 4 bits en torno a 0,3-0,4 GB. A estas cifras hay que sumar la caché KV, que crece con la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Funciona con RTX 3060, RTX 4060, GTX 1650, GTX 1060 6 GB y GPUs integradas recientes. No requiere A100, H100 ni tarjetas de centro de datos.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos diez años. También es viable en Apple Silicon (Metal) y en CPU x86 o ARM, incluida Raspberry Pi 4/5 en cuantización de 4 bits.
- Opciones de despliegue: transformers (PyTorch), llama.cpp y Ollama tras convertir los pesos a GGUF, vLLM y TGI para servir en GPU, y ONNX Runtime para despliegue en el borde. La ficha no documenta ninguna de estas integraciones.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este ajuste fino.

## Comparativa con modelos similares

Los datos de rendimiento de MOLT no están disponibles, por lo que la comparación se limita a especificaciones declaradas de modelos comparables de la misma categoría (asistentes densos por debajo de 2 B).

| Modelo | Parámetros | Contexto | Licencia | Idiomas declarados | Rendimiento |
|---|---|---|---|---|---|
| MOLT (este modelo) | ~0,49 B (base Qwen2.5-0.5B) | 32.768 tokens (heredado, no verificado) | No disponible en la ficha | Inglés, tanglish, tamil simplificado | No disponible |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 tokens | Apache 2.0 | 29 idiomas | No disponible en esta ficha |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 | 29 idiomas | No disponible en esta ficha |
| TinyLlama-1.1B-Chat-v1.0 | ~1,1 B | 2.048 tokens | Apache 2.0 | Principalmente inglés | No disponible en esta ficha |

La ventaja diferencial de MOLT frente a estas alternativas no es el rendimiento bruto, sino la cobertura específica de tanglish y tamil simplificado y del currículo escolar de Sri Lanka, además de su licencia declarada, que permanece sin especificar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un currículo escolar nacional concreto y un registro lingüístico específico, es probable que reproduzca sesgos culturales y educativos de esa fuente, pero no hay análisis publicado.
- Riesgo de alucinación: elevado. Un modelo de ~0,5 B de parámetros tiene una capacidad de razonamiento y de verificación factual muy limitada; en contenidos escolares puede generar respuestas plausibles pero incorrectas.
- Limitación de contexto: la ventana nominal de 32.768 tokens procede del modelo base y no está confirmada para el ajuste fino; en la práctica, un modelo de este tamaño degrada su coherencia en contextos largos.
- Limitación de idioma: solo se declaran inglés, tanglish y tamil simplificado. El tanglish no es una lengua estandarizada, por lo que la calidad variará según la transliteración del usuario.
- Licencia: la ficha de MOLT no especifica licencia. Al derivar de Qwen2.5-0.5B-Instruct (Apache 2.0), el uso comercial del modelo base está permitido, pero la ausencia de licencia explícita en el derivado crea incertidumbre legal para producción.
- Disponibilidad de pesos: el repositorio figura con un tamaño de 0,0 GB. Es posible que solo se haya publicado la model card y no los pesos, lo que impediría su uso.
- Madurez: cero descargas y cero valoraciones, sin evaluaciones independientes ni versiones posteriores.
- Uso en producción: no se recomienda como sistema único en aplicaciones críticas (sanitarias, legales, financieras) sin supervisión humana y sin un modelo de mayor capacidad como respaldo.
- Uso educativo: cualquier salida debe validarse contra el material curricular oficial antes de entregarla a estudiantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahnafmolt/molt
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Perfil del autor en GitHub: https://github.com/moltcreation-ai

Nota sobre homonimia: los resultados de búsqueda web para el término "Molt" corresponden a un proyecto distinto, el framework de aprendizaje por refuerzo agéntico MoLT del equipo NVIDIA NeMo, sin relación con este modelo de Hugging Face. Se listan a continuación únicamente para evitar confusiones:

- Repositorio de NVIDIA NeMo labs-molt: https://github.com/NVIDIA-NeMo/labs-molt
- Artículo sobre MoLT (framework agéntico de PyTorch): https://arxiv.org/pdf/2607.21653
- Entrada de blog sobre el lanzamiento de MoLT por NVIDIA: https://www.marktechpost.com/2026/08/01/nvidia-ai-releases-molt-a-pytorch-native-agentic-reinforcement-learning-framework/
