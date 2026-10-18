# mertowo/Formacim-3B-Llama

## Resumen

Formacım es un ajuste fino supervisado del modelo `unsloth/Llama-3.2-3B-Instruct`, publicado por el usuario `mertowo`, que lo reorienta a un único dominio: la atención al socio de un gimnasio turco ficticio o real llamado FormaFit. Responde en turco sobre tipos de membresía, horarios de clases, reservas, normas de las instalaciones y tarifas, con un tono descrito por el autor como energético y motivador, y cierra cada respuesta con el carácter 💪. No es un modelo de propósito general: el autor documenta explícitamente que no debe usarse para consejo médico o deportivo, política ni programación.

Técnicamente es un transformer decoder-only denso de 3.212.749.824 parámetros (3,2B), derivado del Llama 3.2 de 3B, por lo que hereda la arquitectura y la licencia Llama 3.2. El ajuste se hizo con QLoRA de 4 bits sobre una única GPU T4 en aproximadamente 25 minutos, un coste de entrenamiento muy bajo que hace del modelo un ejemplo interesante de pipeline de especialización rápida con Unsloth. El repositorio ocupa 6,4 GB en safetensors, coherente con pesos en FP16.

Su relevancia es doble: por un lado, como artefacto de dominio muy estrecho con evaluación propia y declarada; por otro, como plantilla metodológica de cómo adaptar un 3B a un vertical concreto (incluida la producción de JSON válido para tool calling y el anclaje a documentación vía RAG) con recursos mínimos. Conviene tener en cuenta que el idioma es exclusivamente turco y que el modelo acumula cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), ajustado con QLoRA de 4 bits |
| Parámetros totales | 3.212.749.824 (3,2B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base `unsloth/Llama-3.2-3B-Instruct` declara una ventana de 128.000 tokens |
| Tipos de cuantización | Entrenamiento en 4 bits (QLoRA); pesos publicados en safetensors (FP16/bf16). No se distribuyen GGUF ni cuantizaciones GPTQ/AWQ |
| Idiomas soportados | Turco (`tr`) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors (repositorio de 6,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.2-3B-Instruct`, un transformer decoder-only con normalización RMSNorm, RoPE y atención causal estándar; no hay innovaciones arquitectónicas propias en este ajuste, que es un fine-tuning por adaptadores de bajo rango (LoRA, QLoRA de 4 bits) fusionado presumiblemente en los pesos publicados. El autor justifica la elección del modelo base frente a `ogulcanakca/Kumru-2B-EPDK-Instruct`, que descartó porque, al estar especializado en documentos del regulador energético turco EPDK, producía salidas inservibles en conversación general en turco (repetición de la pregunta, terminaciones irrelevantes). Los criterios para quedarse con Llama 3.2 3B fueron: plantilla de chat ya disponible, calidad de turco suficiente, entrenamiento en T4 en torno a 25 minutos y una licencia que permite publicar derivados.

El conjunto de datos es `mertowo/formacim-uyelik-veri`, generado en parte con Gemini y filtrado manualmente. El autor reconoce que el generador cometía errores al etiquetar preguntas sin respuesta en el manual como si la tuvieran, y que esos casos se eliminaron por inspección visual. La evaluación "antes/después" se realizó con métricas propias: identidad del asistente, presencia del marcador 💪, validez del JSON de agente, selección de herramienta correcta y una puntuación de juez RAG. No se documentan número de tokens de entrenamiento, composición exacta del dataset, hiperparámetros ni si hubo fases de DPO o RLHF; todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en turco, limitada al dominio de un club deportivo: tipos de membresía, cuotas, horario de 12 clases, reservas y normas de las instalaciones.
- Ajuste de identidad: responde como "Formacım" y termina sistemáticamente las respuestas con el emoji 💪 (métrica de identidad del 0,70 y de marcador del 0,90 en la evaluación del autor).
- Emisión de JSON válido para integración con agentes: el autor reporta 1,00 en validez de JSON tras el ajuste, frente a 0,64 antes.
- Selección de herramienta (tool calling) dentro del conjunto cerrado definido en su dataset: 1,00 en la métrica `ajan_arac` frente a 0,29 antes del entrenamiento.
- Uso con contexto recuperado (RAG): cuando se le inyecta el manual de 15 secciones, responde con los valores correctos y admite "no está en la guía" en preguntas fuera de cobertura; sin contexto tiende a inventar cifras.
- Solicitud de aclaración ante formatos ambiguos de duración ("unos meses") en el cálculo de cuotas, pidiendo tipo de membresía y número de meses.
- Derivación a recepción cuando la consulta excede el contenido del manual (campañas o eventos no documentados).
- No cubre, por diseño, consejo médico o deportivo, política, programación ni conocimiento general.

## Casos de uso

- Atención al socio en web o mensajería: desplegado detrás de un chatbot turco para responder dudas de cuotas, tipos de membresía y normas, con respuestas de 120 tokens máximo y temperatura 0 (decodificación greedy) tal como sugiere el autor.
- Reserva de clases con function calling: el modelo emite JSON válido y selecciona la herramienta correcta dentro de su conjunto cerrado, lo que permite conectarlo a un backend de reservas sin post-procesado frágil.
- Asistente RAG sobre el reglamento interno: indexando las 15 secciones de la guía de socio y la tabla de 12 clases, el modelo responde con la cifra o norma exacta y evita inventar cuando el dato no está en el contexto.
- Extracción estructurada para CRM: usar la salida JSON para poblar campos de tipo de membresía, duración y clase solicitada en el sistema del club.
- Triaje y derivación: cuando la pregunta queda fuera del manual, el modelo pide aclaración o remite a recepción, lo que reduce respuestas erróneas en producción.
- Prototipado rápido de verticales: el pipeline (QLoRA 4 bits sobre Llama 3.2 3B, ~25 minutos en T4) sirve como plantilla replicable para crear asistentes de dominio en otras pymes con hardware mínimo.
- Despliegue en hardware modesto: al ocupar unos 2 GB en 4 bits, puede ejecutarse en una única GPU de consumo pequeña para demos presenciales o entornos de prueba.
- Base para experimentos de alineación de estilo: útil como caso de estudio de cómo una métrica de identidad sube de 0,00 a 0,70 con pocos datos, a costa de degradar otras métricas (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor proporciona únicamente una evaluación interna propia, antes y después del ajuste fino, sobre preguntas de test de su dominio:

| Métrica (evaluación propia del autor) | Antes del ajuste | Después del ajuste |
|---|---|---|
| Identidad "Formacim" | 0,00 | 0,70 |
| Presencia del marcador 💪 | 0,00 | 0,90 |
| Validez de JSON de agente | 0,64 | 1,00 |
| Selección de herramienta correcta | 0,29 | 1,00 |
| Puntuación de juez RAG | 0,70 | 0,57 |
| Media de preguntas de test | no disponible | 0,53 |

La única referencia de latencia publicada es cualitativa: en CPU las respuestas tardan entre 15 y 40 segundos. No hay datos de throughput ni de latencia en GPU.

## Requisitos de hardware

- VRAM estimada en FP16/bf16: en torno a 6,4 GB solo de pesos, más caché KV; manejable en GPUs de 8-12 GB.
- VRAM estimada en 4 bits (bitsandbytes): aproximadamente 2 GB de pesos, apto para GPUs de 6-8 GB.
- GPU recomendadas: el autor entrenó en una T4 de 16 GB con QLoRA de 4 bits; para inferencia son suficientes una RTX 3060 de 12 GB, una RTX 4060 Ti, una RTX 4070 o superiores. Para servicio concurrente, A100 o H100 con vLLM.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en FP16 y en tarjetas de 6 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (el snippet de la model card usa `AutoModelForCausalLM` y `apply_chat_template`), vLLM y TGI para pesos safetensors. Para llama.cpp u Ollama sería necesario convertir a GGUF, formato que el repositorio no incluye.
- Latencia y throughput: no disponibles en GPU; en CPU, 15-40 segundos por respuesta según el autor. Con `max_new_tokens=120` y muestreo desactivado, el coste por turno es bajo en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Formacim-3B-Llama | 3,21B | no especificado tras el ajuste (base: 128k) | Solo evaluación interna del autor; media 0,53 en su test | Llama 3.2 | HuggingFace, 0 descargas |
| `unsloth/Llama-3.2-3B-Instruct` (base) | 3,21B | 128k | Buen turco general, mala identidad de dominio y tool calling en el conjunto del autor (0,29) | Llama 3.2 | HuggingFace, ampliamente usado |
| `Qwen2.5-3B-Instruct` | ~3,1B | 32k | Referencia habitual en modelos pequeños multilingües; no evaluado en el dominio de este modelo | Apache 2.0 | HuggingFace |
| `google/gemma-2-2b-it` | ~2,6B | 8k | Alternativa de tamaño similar; no evaluada en este dominio | Gemma | HuggingFace |

Las cifras de parámetros y contexto de las alternativas provienen de sus model cards públicas; no se dispone de comparación directa con Formacim en ningún benchmark común, por lo que la comparación de rendimiento es "no disponible".

## Limitaciones y advertencias

- Dominio cerrado por diseño: el autor indica explícitamente que no ofrece consejo médico o deportivo, política ni código. Forzarlo fuera de ese ámbito produce respuestas poco fiables.
- Idioma único: solo turco. No hay evidencia de comportamiento aceptable en castellano ni en otras lenguas, aunque el modelo base sea multilingüe.
- Regresión en la métrica de juez RAG: baja de 0,70 a 0,57 tras el ajuste, es decir, el fine-tuning mejora identidad y tool calling a costa de empeorar la fidelidad al contexto recuperado. Es el principal riesgo para un despliegue RAG.
- Alucinación de cifras sin contexto: el autor confirma que, sin el manual inyectado, el modelo inventa precios y datos. Cualquier uso comercial debe ir acompañado de RAG y de validación posterior.
- Sin conocimiento de campañas o eventos actuales: remite a recepción, lo que puede generar fricción si el usuario espera una respuesta directa.
- Datos de entrenamiento generados sintéticamente con Gemini y filtrados a mano; el propio autor documenta errores de etiquetado ("no existe" escrito como "existe") que podrían dejar sesgos residuales.
- Latencia alta en CPU (15-40 s por respuesta), incompatible con atención al cliente en tiempo real sin GPU.
- Licencia Llama 3.2: permite uso comercial con condiciones (atribución "Built with Llama", restricciones de nombre y cláusula de 700 millones de usuarios activos mensuales), no es una licencia OSI.
- Falta de validación externa: cero descargas y cero "likes", sin pipeline declarado y sin benchmarks estándar. Las métricas son autoinformadas y no reproducidas de forma independiente.
- No se distribuyen cuantizaciones GGUF ni GPTQ/AWQ: hay que generarlas para despliegues en llama.cpp u Ollama.
- El repositorio muestra fechas de creación y actualización en octubre de 2026, posteriores a la mayoría de las referencias del ecosistema; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mertowo/Formacim-3B-Llama
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mertowo/formacim-uyelik-veri
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Paper, blog o demo adicionales: no disponible
