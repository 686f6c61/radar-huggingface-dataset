# labadain/labadain-E2B-it-Tetun-GGUF

## Resumen

Labadain E2B-it Tetun (GGUF) es la versión cuantizada a 4 bits del modelo conversacional Labadain E2B-it Tetun, desarrollado por Labadain Research Center. Se trata de un ajuste fino de `unsloth/gemma-4-E2B-it` (la release de Unsloth del Gemma 4 E2B-it de Google) especializado en tetun, una de las lenguas oficiales de Timor-Leste. El modelo resuelve el problema de la escasez de asistentes conversacionales de calidad en lenguas de bajos recursos, ofreciendo respuestas multi-turno en tetun sobre temáticas como noticias, gobierno, salud, educación, política, finanzas y conocimiento general.

El modelo cuenta con aproximadamente 4.647 millones de parámetros (4,6B) en su componente de texto y fue entrenado sobre 138.033 conversaciones en tetun (unos 102 millones de tokens), de las cuales el 51,5% son multi-turno. Esta versión GGUF en cuantización Q4_K_M ocupa 3,43 GB y está pensada para ejecutarse localmente con llama.cpp, Ollama o LM Studio, incluso en portátiles sin GPU dedicada.

Es relevante porque democratiza el acceso a un asistente conversacional en tetun con requisitos de hardware muy modestos (4-5 GB de memoria), y porque el formato GGUF con plantilla de chat compatible con la API de OpenAI facilita su integración en aplicaciones reales sin infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it, modelo de texto) |
| Parametros totales | 4.647.450.147 (4,6B, solo modelo de texto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en ajuste fino (la arquitectura soporta 128K) |
| Tipos de cuantizacion | Q4_K_M (4 bits) |
| Idiomas soportados | tet (tetun), tdt |
| Licencia | Apache 2.0, siguiendo la licencia Gemma 4 |
| Formato de pesos | GGUF (`labadain-e2b-tetun-merged.Q4_K_M.gguf`, 3,43 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer basado en Gemma 4 E2B-it, ajustado mediante LoRA con Unsloth y el `SFTTrainer` de TRL. El ajuste utilizó un rango y alpha de LoRA de 64, sin dropout, aplicado a todas las proyecciones de atención y MLP del modelo de lenguaje (`q`, `k`, `v`, `o`, `gate`, `up`, `down`). La pérdida se calculó únicamente sobre las respuestas del modelo, enmascarando los turnos del usuario. Los adaptadores LoRA se fusionaron en los pesos base y el modelo fusionado se convirtió a GGUF y se cuantizó a Q4_K_M con la exportación de llama.cpp de Unsloth.

El entrenamiento usó una longitud máxima de secuencia de 4.096 tokens (el 0,9% de las conversaciones se truncaron), empaquetado de secuencias best-fit decreasing con atención separada entre conversaciones empaquetadas, tamaño de lote efectivo de 32 secuencias empaquetadas (unos 131K tokens por paso de optimizador), hasta 2 épocas con retención del checkpoint de menor pérdida de validación, tasa de aprendizaje 2e-4 con schedule coseno y 3% de warmup, optimizador AdamW de 8 bits con weight decay 0,01 y clipping de gradiente 1,0. Se reservaron 3.000 conversaciones para validación, evaluadas cada 5% del entrenamiento, con semilla 3407. El software empleado fue Unsloth 2026.11.3, TRL 1.15.0 y Transformers 5.5.0.

Los datos de entrenamiento son 138.033 conversaciones en tetun (aproximadamente 102 millones de tokens) compiladas por Labadain, incluyendo material traducido automáticamente al tetun, con 261.593 intercambios pregunta-respuesta en total. El 51,5% son multi-turno (hasta 33 intercambios) y el 48,5% de un solo turno. Se eliminaron duplicados antes del entrenamiento. El dataset no está publicado.

## Capacidades

- Generación de texto conversacional en tetun sobre temáticas de noticias, gobierno, salud, educación, política, finanzas y conocimiento general.
- Conversación multi-turno: más de la mitad de las conversaciones de entrenamiento tienen dos o más intercambios pregunta-respuesta, con hasta 33 intercambios.
- Respuestas en tetun con la posibilidad de reforzar el idioma mediante un system prompt breve (por ejemplo, "Responde iha Tetun").
- Servidor compatible con la API de OpenAI a través de `llama-server`, lo que permite integración con clientes existentes.
- No incluye capacidades de visión ni audio: esta versión GGUF contiene solo el modelo de texto, sin los encoders de imagen y audio de Gemma 4.
- No se ha entrenado con trazas de razonamiento; el modo thinking debe permanecer desactivado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional en tetun para atención ciudadana: el modelo puede gestionar diálogos multi-turno sobre trámites, servicios públicos o información gubernamental, aprovechando su entrenamiento específico en temáticas de gobierno y su ventana de 4.096 tokens.
- Despliegue en portátiles sin GPU: gracias a la cuantización Q4_K_M (3,43 GB) y a los 4-5 GB de memoria recomendados, puede ejecutarse con llama.cpp u Ollama en equipos de gama media, útil para organizaciones con recursos limitados en Timor-Leste.
- Chatbot educativo en tetun: con entrenamiento en temáticas de educación y conocimiento general, puede servir como tutor conversacional o asistente de consultas para estudiantes y docentes.
- Integración en aplicaciones web o móviles mediante la API compatible con OpenAI de `llama-server`: permite conectar el modelo a frontends existentes sin desarrollar una capa de inferencia propia.
- Prototipado rápido de asistentes en lenguas de bajos recursos: sirve como base para experimentar con ajustes adicionales o para evaluar la viabilidad de asistentes en tetun antes de invertir en infraestructura mayor.
- Servicio de información sanitaria o financiera en tetun: el modelo fue entrenado con conversaciones de salud y finanzas, por lo que puede responder consultas generales en esos dominios, siempre con supervisión humana dada su tendencia a errores factuales.
- Evaluación comparativa de modelos multilingües: útil para investigadores que estudien el rendimiento de modelos pequeños en lenguas de bajos recursos y comparen con alternativas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 4-5 GB de memoria libre (RAM o VRAM) para ejecutar el archivo Q4_K_M de 3,43 GB.
- GPU recomendadas: no se especifican modelos concretos; al ser un modelo de 4,6B en 4 bits, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) y superiores, así como en A100 y H100 con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM; también funciona en CPU-only.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/labadain/labadain-E2B-it-Tetun-GGUF:Q4_K_M`), LM Studio (búsqueda en la pestaña Discover) y cualquier cliente compatible con la API de OpenAI apuntando a `llama-server`.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Ajustes recomendados: temperature 1.0 (0 para respuestas repetibles), top-p 0.95, top-k 64, contexto 4.096 tokens, plantilla Jinja (`--jinja`), thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Labadain E2B-it Tetun (GGUF) | 4,6B | 4.096 (entrenamiento); 128K arquitectura | tet, tdt | Apache 2.0 (Gemma 4) | GGUF Q4_K_M |
| labadain/labadain-E2B-it-Tetun (original) | 4,6B | 4.096 (entrenamiento) | tet, tdt | Apache 2.0 (Gemma 4) | bfloat16 (Transformers, Unsloth) |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | multilingüe (no detallado) | Gemma 4 | safetensors |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Errores factuales: es un modelo pequeño y puede afirmar con confianza datos, fechas, nombres y cifras incorrectos, incluso sobre Timor-Leste.
- No incluye visión ni audio: esta versión GGUF contiene solo el modelo de texto; los encoders de imagen y audio de Gemma 4 no están incluidos.
- Modo thinking: no debe activarse, ya que las conversaciones de entrenamiento no contienen trazas de razonamiento y el modelo no fue entrenado para ello.
- Contexto limitado en el ajuste fino: aunque la arquitectura soporta 128K, el modelo se ajustó con conversaciones de hasta 4.096 tokens, por lo que el rendimiento más allá de esa longitud no está garantizado.
- Dataset no publicado: el conjunto de entrenamiento no es público, lo que limita la reproducibilidad y la auditoría de sesgos.
- Traducción automática parcial: parte del material de entrenamiento fue traducido automáticamente al tetun, lo que puede introducir artefactos o errores lingüísticos.
- Licencia: Apache 2.0 siguiendo la licencia Gemma 4; conviene revisar los términos de la licencia Gemma 4 para uso comercial.
- Sin datos de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Tool calling y capacidades de agente: no documentadas, por lo que no deben asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/labadain-E2B-it-Tetun-GGUF
- Modelo original (bfloat16): https://huggingface.co/labadain/labadain-E2B-it-Tetun
- Modelo base (Unsloth Gemma 4 E2B-it): https://huggingface.co/unsloth/gemma-4-E2B-it
- Organización Labadain: https://huggingface.co/labadain
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
