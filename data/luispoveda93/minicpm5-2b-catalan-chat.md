# luispoveda93/MiniCPM5-2B-catalan-chat

## Resumen

MiniCPM5-2B-catalan-chat es un ajuste fino por LoRA del modelo base openbmb/MiniCPM5-2B (2.516.756.480 parámetros, arquitectura Llama, licencia Apache-2.0) realizado por el usuario luispoveda93 sobre el conjunto de instrucciones en catalán projecte-aina/InstruCAT. El objetivo es dotar a un modelo de 2,5B parámetros de capacidad conversacional y de seguimiento de instrucciones específicamente en catalán (ca-ES), un idioma con escasa representación en los modelos abiertos de propósito general. El resultado es un modelo de chat que responde por defecto en catalán mediante un system prompt fijo.

El entrenamiento empleó SFT con TRL sobre 165.100 muestras (11 categorías de tarea, aproximadamente 43 millones de tokens, 1 época), con LoRA de rango 32 sobre todas las proyecciones de atención y MLP. La loss de completado bajó de 2,39 a aproximadamente 0,35-0,40 y la precisión de token media alcanzó alrededor de 0,91-0,92 al final del entrenamiento, lo que indica una adaptación sólida al formato y al idioma, aunque no hay evaluaciones de benchmarks publicadas.

Su relevancia actual reside en la combinación de tamaño reducido (desplegable en GPU de consumo), licencia permisiva del modelo base y disponibilidad de cuantizaciones GGUF (Q4_K_M, Q8_0, F16) y del adaptador LoRA por separado. La principal advertencia es la licencia del dataset de entrenamiento (CC-BY-NC-ND-4.0), que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo base openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 2048 tokens, empaquetadas) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 y F16 (repo separado); pesos originales en bf16 |
| Idiomas soportados | catalán (ca-ES) como idioma objetivo; capacidades del modelo base en otros idiomas no documentadas |
| Licencia | model card: "other"; base Apache-2.0; datos de entrenamiento CC-BY-NC-ND-4.0 (no comercial) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer tipo Llama de openbmb/MiniCPM5-2B y se adapta mediante LoRA con r=32, alpha=64, dropout 0,05 aplicado a todas las proyecciones de atención y MLP. El entrenamiento se realizó con TRL SFTTrainer v1.12.0 (transformers 5.16.1, peft 0.20.0), con pérdida calculada solo sobre el turno del asistente (completion-only loss), longitud de secuencia de 2048 tokens con empaquetado, batch efectivo de 32 (4 × acumulación de gradiente 8), learning rate 2e-4 con schedule coseno y 200 pasos de warmup. Se ejecutaron 711 pasos (unas 19 horas) en una única A10G de 24 GB en bf16 con gradient checkpointing.

Los datos provienen íntegramente de projecte-aina/InstruCAT, un conjunto de instrucciones en catalán derivado de caBreu, CatalanQA, CaWikiTC, ceil, CoqCat, GuiaCat, IntoxiCat, NLUCat, Parafraseja, PAWS-ca, sts-ca, teca y WikiCat. Se usó la plantilla de chat de MiniCPM5 con un system prompt fijo ("Ets un assistent conversacional que respon sempre en català."). No se documenta uso de RLHF ni DPO, ni innovaciones de inferencia como decodificación especulativa o atención lineal. Se validó sobre 1.000 muestras retenidas en el paso 500 sin errores.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en catalán.
- Tareas de comprensión y transformación de texto: respuesta a preguntas (CatalanQA), paráfrasis (Parafraseja, PAWS-ca), similitud semántica (sts-ca) y clasificación (NLUCat, IntoxiCat).
- Reconocimiento de entidades nombradas y tareas lingüísticas (ceil).
- Resumen y generación a partir de conocimiento enciclopédico (CaWikiTC, WikiCat, teca).
- Razonamiento de sentido común y guías procedimentales (CoqCat, GuiaCat).
- Formato de chat con roles system/user/assistant mediante apply_chat_template.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo thinking: no disponible.
- Capacidades multilingües: no documentadas; el ajuste está orientado exclusivamente al catalán.

## Casos de uso

- Asistente conversacional en catalán para webs y aplicaciones: el modelo responde en catalán de forma consistente gracias al system prompt fijado en el entrenamiento, con un tamaño de 2,5B que permite desplegarlo en una sola GPU.
- Atención al cliente en catalán: puede gestionar consultas de un solo turno con contexto de hasta 2048 tokens; para conversaciones multi-turno conviene evaluar la variante v2 del mismo autor, entrenada específicamente para ello.
- Clasificación y moderación de contenido en catalán: útil para etiquetar textos (IntoxiCat, NLUCat) en pipelines de moderación, aprovechando su entrenamiento en tareas de clasificación.
- Extracción de entidades y anotación lingüística: integrable en flujos de preprocesamiento de corpus catalanes (NER, tareas ceil) para enriquecer datasets.
- Paráfrasis y aumento de datos: generación de reformulaciones en catalán para aumentar corpus de entrenamiento o mejorar la cobertura léxica de sistemas downstream.
- Resumen de documentación: síntesis de textos enciclopédicos o técnicos en catalán, adecuado para boletines, actas o documentación interna.
- Despliegue local y prototipado: con las cuantizaciones GGUF Q4_K_M puede ejecutarse en equipos con GPU de consumo o incluso CPU mediante llama.cpp u Ollama, lo que facilita pruebas rápidas sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: loss de completado de 2,39 a aproximadamente 0,35-0,40 y precisión de token media de aproximadamente 0,91-0,92 en la segunda mitad del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5 GB solo para pesos (2,5B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- Cuantización Q8_0 (GGUF): aproximadamente 2,7 GB de pesos; Q4_K_M: aproximadamente 1,5-1,7 GB.
- GPU recomendadas: A10G (la usada en entrenamiento), A100, H100 o L40S para producción con concurrencia; RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti para inferencia local en bf16 o FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB usando GGUF Q4_K_M; también es viable en CPU con llama.cpp.
- Opciones de despliegue: transformers (referencia de la model card), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp y Ollama mediante los GGUF publicados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-catalan-chat | 2,52B | no disponible (entrenado a 2048) | Catalán | "other"; base Apache-2.0; datos CC-BY-NC-ND-4.0 | HF: safetensors, GGUF, LoRA |
| openbmb/MiniCPM5-2B (base) | 2,5B | no disponible | Multilingüe general | Apache-2.0 | HF |
| luispoveda93/MiniCPM5-2B-catalan-chat-v2 | 2,52B (mismo base) | no disponible | Catalán, multi-turno | "other" (misma serie) | HF: safetensors, GGUF, LoRA |
| luispoveda93/Gala | 0,8B (Qwen3.5-0.8B) | no disponible | Catalán, multimodal | no disponible | HF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas alternativas.

## Limitaciones y advertencias

- Entrenado únicamente con datos de instrucción de un solo turno; no se usaron conversaciones multi-turno en catalán, por lo que el comportamiento en diálogos largos puede degradarse (el autor recomienda la variante v2 para ese caso).
- InstruCAT es un dataset orientado a tareas (QA, paráfrasis, NER, clasificación, resumen); el comportamiento de cháchara general proviene del modelo base y no está garantizado en catalán.
- Riesgo de alucinación inherente a un modelo de 2,5B parámetros; no debe usarse como fuente de verdad sin verificación.
- La licencia de los datos de entrenamiento es CC-BY-NC-ND-4.0 (no comercial, sin derivados), lo que condiciona el uso comercial del modelo ajustado; es necesario revisar los términos de InstruCAT antes de cualquier despliegue productivo.
- La licencia del modelo se declara como "other" en Hugging Face, lo que añade ambigüedad jurídica frente a la Apache-2.0 del modelo base.
- No se han publicado evaluaciones de sesgo, toxicidad ni benchmarks en catalán; se desconoce el comportamiento en dominios especializados.
- Longitud de contexto efectiva no documentada; el entrenamiento se limitó a 2048 tokens, por lo que contextos mayores no están validados.
- Solo 314 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.
- El autor solicita explícitamente evaluaciones en benchmarks catalanes, lo que confirma la ausencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- Adaptador LoRA: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-lora
- Cuantizaciones GGUF: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-GGUF
- Variante v2 (multi-turno): https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2
- GGUF de la variante v2: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF
- Adaptador LoRA de la variante v2: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-lora
- Alternativa catalana pequeña (Gala): https://huggingface.co/luispoveda93/Gala
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset InstruCAT: https://huggingface.co/datasets/projecte-aina/InstruCAT
