# richowell7/taller-destilacion-slm-merged

## Resumen

`richowell7/taller-destilacion-slm-merged` es un modelo de lenguaje de 134.515.008 parámetros publicado por el usuario richowell7 como resultado de un taller docente de destilación de modelos pequeños (Tópicos Avanzados en IA 2, Máster en IA, UAI). No se entrena desde cero: es la fusión en bf16 de un adaptador LoRA sobre `HuggingFaceTB/SmolLM2-135M-Instruct`, con arquitectura transformer decoder-only de tipo Llama y licencia Apache 2.0.

El modelo resuelve un problema muy acotado: actuar como asistente que explica conceptos de IA generativa (fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación) a ejecutivos de empresas chilenas, con ejemplos de negocio, y responder siempre en inglés porque el modelo base maneja mal el español (según el autor, la nota del examen en español no superó 1,1 sobre 10). El "profesor" fue un LLM comercial accedido por API (`gpt-6-luna`), que generó 60 pares pregunta-respuesta; el alumno los imitó con ajuste fino supervisado en CPU.

Su relevancia es metodológica y educativa, no práctica: documenta de forma reproducible un pipeline completo de destilación sintética (generación de datos, SFT con LoRA, examen fijo con LLM juez) sobre hardware doméstico. Los resultados, sin embargo, son malos: 2,75/10 de nota media y 0 % de aprobados tras la destilación, por lo que no es apto para decisiones reales ni para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (tag `llama`), derivado de `HuggingFaceTB/SmolLM2-135M-Instruct` |
| Parámetros totales | 134.515.008 (≈135 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; se hereda de la configuración del modelo base y no se ha verificado aquí |
| Tipos de cuantización | No se publican cuantizaciones. Pesos en bf16; la conversión a GGUF/INT8/4-bit es técnicamente posible pero no está validada por el autor |
| Idiomas soportados | Inglés (`en`) únicamente; el autor desaconseja explícitamente el español |
| Licencia | Apache 2.0, con la salvedad de los términos de OpenAI sobre los datos sintéticos de entrenamiento (ver limitaciones) |
| Formato de pesos | `safetensors` (repo de 0,3 GB), librería `transformers`; el adaptador LoRA original (≈19 MB) se publica en un repo aparte |
| Tag de pipeline | `text-generation`, `endpoints_compatible`, `text-generation-inference` |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 135 M de parámetros, idéntico en estructura al modelo base SmolLM2-135M-Instruct (familia Llama), sin modificaciones de atención ni capas adicionales. El autor parte de los pesos instruct del base y aplica un ajuste fino supervisado (SFT) con LoRA de r=16 y alpha=32 durante 3 épocas, con tamaño de lote 4 y tasa de aprendizaje 5e-4, entrenando en CPU. La pérdida bajó de 3,8173 a 2,902. Posteriormente fusionó el adaptador en los pesos base en bf16, de modo que la versión publicada no requiere `peft` para inferencia.

El corpus de entrenamiento es mínimo: 60 pares pregunta-respuesta en inglés generados por el LLM profesor `gpt-6-luna` (API de OpenAI), repartidos en seis temas y con respuestas limitadas a 90 palabras. No se documenta número de tokens, composición exacta del dataset, ni uso de RLHF o DPO; el único mecanismo de alineación es el SFT sobre imitaciones del profesor. La evaluación se hizo con un examen fijo de 12 preguntas, separado del entrenamiento, calificado de 1 a 10 por el mismo LLM actuando como juez contra una respuesta de referencia. No hay innovaciones técnicas destacables (ni decodificación especulativa, ni atención lineal, ni modo thinking): el interés del artefacto está en la metodología, no en la arquitectura.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`), formato system/user/assistant.
- Explicación divulgativa de conceptos de IA generativa dentro de un dominio acotado: fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación.
- Adaptación de las explicaciones a un registro orientado a negocio (el autor lo planteó para ejecutivos), con ejemplos de aplicación empresarial.
- Respuestas cortas por diseño: el entrenamiento limitó las referencias a 90 palabras, por lo que tiende a producir salidas breves.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multimodales (ni visión ni audio).
- No es multilingüe: solo inglés; el español se considera no fiable.
- No dispone de modo thinking ni de razonamiento extendido.
- Repite frases con frecuencia; el propio autor recomienda `do_sample=False` con `repetition_penalty=1.15` para mitigarlo.

## Casos de uso

- Material didáctico de un taller de destilación: sirve como ejemplo reproducible y de bajo coste del pipeline completo (generación de datos con un profesor comercial, SFT con LoRA en CPU, fusión de pesos y examen con LLM juez), apto para que los alumnos lo repliquen en un portátil.
- Demostración del efecto del ajuste fino: la comparación antes/después sobre el mismo examen de 12 preguntas (2,00 → 2,75 de media) permite ilustrar en clase qué mejora y qué no mejora un SFT con 60 ejemplos.
- Prueba de humo de infraestructura de despliegue: al ser un modelo de 0,3 GB compatible con `text-generation-inference` y `endpoints_compatible`, es útil para validar pipelines de serving, plantillas de chat y monitorización antes de mover modelos mayores.
- Validación de arneses de evaluación con LLM como juez: permite probar el código que genera preguntas, lanza inferencias y puntúa respuestas, y medir la varianza del juez (el autor reporta ±0,3 entre ejecuciones) sin gastar presupuesto en modelos grandes.
- Estudio de fallos típicos de modelos pequeños: su tendencia a repetir y a inventar definiciones con seguridad lo convierte en un caso práctico para enseñar detección de alucinaciones y diseño de salvaguardas.
- Generación de borradores de respuesta sobre conceptos de IA para revisión humana posterior: útil como primer borrador en documentación interna o FAQs, siempre con un revisor que valide el contenido técnico antes de publicar.
- Punto de partida para nuevos experimentos de ajuste: la licencia Apache 2.0 y el tamaño reducido permiten reentrenar el modelo con LoRA en dominios o idiomas distintos (por ejemplo, castellano) sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. El autor solo reporta un examen propio de 12 preguntas calificado por un LLM juez (`gpt-6-luna`) de 1 a 10 contra una respuesta de referencia:

| Métrica | Antes (modelo base) | Después (destilado) |
|---|---|---|
| Nota media del juez (1–10) | 2,00 | 2,75 |
| Aprobación (nota ≥ 7) | 0 % | 0 % |

| Tema | Antes | Después |
|---|---|---|
| Agentes de IA | 2,67 | 2,33 |
| Ajuste fino | 2,00 | 2,50 |
| Fundamentos de LLM | 1,50 | 2,50 |
| Ingeniería de prompts | 2,00 | 3,33 |
| RAG | 1,50 | 3,00 |

Advertencias sobre estas cifras: el juez es otro LLM con ruido de aproximadamente ±0,3 entre ejecuciones y, en una auditoría manual de 10 ítems, resultó ligeramente más generoso que un evaluador humano. La tabla por temas cubre cinco de los seis temas declarados en el entrenamiento; el sexto no se detalla en la model card.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 0,27 GB (134,5 M de parámetros); en fp32, unos 0,54 GB. El repo completo ocupa 0,3 GB.
- VRAM estimada para inferencia: menos de 1 GB para los pesos; en la práctica, entre 1 y 2 GB contando caché KV y overhead del runtime para secuencias moderadas.
- Cabe en cualquier GPU de consumo con 2 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.) y también en GPUs integradas.
- Inferencia viable en CPU pura: el propio autor entrenó el adaptador en CPU, y el tamaño permite ejecutarlo en portátiles e incluso en placas tipo Raspberry Pi con paciencia.
- GPUs de datacenter (A100, H100, L40S) son innecesarias y no aportan ventaja relevante por el cuello de botella de latencia del modelo.
- Opciones de despliegue: `transformers` (ruta oficial documentada), `text-generation-inference` y endpoints compatibles (por los tags del repo). Para `llama.cpp` u `Ollama` sería necesaria una conversión a GGUF que el autor no publica; para `vLLM` no hay validación documentada.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentación pública y no se han verificado en la información de esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| `richowell7/taller-destilacion-slm-merged` | 134,5 M | No disponible en la card (heredado del base) | Apache 2.0 (con salvedad sobre datos de OpenAI) | Inglés | Asistente divulgativo de IA generativa para negocio, entrenado con 60 ejemplos sintéticos |
| `HuggingFaceTB/SmolLM2-135M-Instruct` | 135 M | 8 192 tokens según documentación del base | Apache 2.0 | Inglés (multilingüe limitado) | Modelo instruct generalista; es el punto de partida y la referencia "antes" de este trabajo |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~494 M | 32 768 tokens según documentación del modelo | Apache 2.0 | Multilingüe (incluye español) | Instruct generalista de tamaño pequeño, con mejor calidad de respuesta y soporte multilingüe real |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | ~1 100 M | 2 048 tokens según documentación del modelo | Apache 2.0 | Inglés | Chat generalista de 1,1 B, más capable que este derivado pero con mayor coste de inferencia |

En la práctica, cualquier alternativa generalista de la tabla ofrece mejor calidad de respuesta que este modelo fuera del dominio divulgativo concreto; la ventaja de este artefacto es exclusivamente didáctica.

## Limitaciones y advertencias

- Calidad insuficiente para uso real: con 135 M de parámetros y solo 60 ejemplos de entrenamiento, repite frases, se equivoca y **inventa definiciones con seguridad**. Ninguna respuesta del examen alcanzó el umbral de 7/10 y el porcentaje de aprobados se mantuvo en 0 %.
- Riesgo alto de alucinación: el autor advierte explícitamente de que inventa datos fuera del dominio y recomienda no usarlo para tomar decisiones reales.
- Sesgos heredados: puede reproducir sesgos y errores tanto del profesor (`gpt-6-luna`) como del juez automático empleado en la evaluación.
- Limitación idiomática severa: solo inglés; en español la nota del examen no superó 1,1/10. No debe desplegarse en castellano sin un reentrenamiento específico.
- Evaluación débil: 12 preguntas, un único juez LLM con ruido de ±0,3 y sesgo medido hacia la benevolencia; no hay benchmarks estándar ni evaluación humana sistemática.
- Sobreajuste probable al dominio y al estilo del profesor: 60 pares y 3 épocas sobre un modelo de 135 M apuntan a memorización de formulaciones concretas.
- Riesgo de licencia: aunque los pesos se publican con Apache 2.0, los datos de entrenamiento los generó un LLM comercial de OpenAI, cuyos términos restringen usar sus salidas para desarrollar modelos que compitan con OpenAI. El autor limita el uso a fines educativos y recomienda revisar esos términos antes de cualquier uso no educativo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros sobre su comportamiento.
- En producción no debería usarse como generador final, sino como pieza de demostración o de pruebas de infraestructura.

## Enlaces

- Modelo fusionado en HuggingFace: https://huggingface.co/richowell7/taller-destilacion-slm-merged
- Adaptador LoRA original (≈19 MB): https://huggingface.co/richowell7/taller-destilacion-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper, blog o repositorio del taller: no disponible en la información proporcionada.
