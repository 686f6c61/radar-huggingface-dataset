# qalduaij/lolo_Q8y_Legal_E2B

## Resumen

lolo_Q8y_Legal_E2B (Q8y Legal Edge E2B) es un ajuste fino de tipo LoRA sobre `unsloth/gemma-4-E2B-it`, desarrollado por Qusai Al-duaij (qalduaij) dentro de la denominada familia "lolo AI Ecosystem". El modelo está especializado en el Derecho constitucional y la legislación de Kuwait: constitución, leyes, decretos amiríes y normativa judicial, con una política lingüística estricta de árabe estándar moderno formal (sin dialecto) y capacidad cruzada árabe-inglés.

El modelo parte de la arquitectura Gemma 4 "Effective 2B Edge" y se distribuye tanto en formato Transformers (safetensors, con adaptador LoRA separado) como en GGUF cuantizado (Q4_K_M y Q8_0) para despliegue local en Ollama y LM Studio. Su relevancia radica en ser uno de los pocos ajustes finos publicados orientados explícitamente al dominio legal kuwaití, con un corpus declarado de 83.673 registros SFT derivados de 8.520 documentos legislativos.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una licencia Apache 2.0 declarada. El tamaño total del repositorio es de 18,9 GB, aunque el peso de los safetensors completos es de 9,54 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 Effective 2B Edge), ajuste fino LoRA (r=32, alpha=64) |
| Parametros totales | 5.123.178.051 (5,12 mil millones, segun safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (3,19 GB), Q8_0 (4,63 GB); safetensors completos en bf16/fp16 (9,54 GB) |
| Idiomas soportados | arabe (MSA formal) e ingles (registro juridico institucional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) mediante LoRA sobre el checkpoint instructivo `unsloth/gemma-4-E2B-it`, con rango r=32 y alpha=64. La model card declara un corpus de 83.673 registros SFT estructurados en cuatro niveles de conocimiento: `direct_reference_qa` (pregunta-respuesta con referencia directa), `granular_clause_qa` (consulta a nivel de cláusula), `analytical_breakdown` (desglose analítico) y `macro_synthesis` (síntesis macro). Estos registros se extraen de 8.520 documentos legislativos y constitucionales kuwaitíes, con inyección de encabezados de artículos legales en el formato `[القانون رقم X لسنة Y - المادة Z]` y emparejamiento bilingüe etiquetado como `KW-*`.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los recuentos anteriores, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias: el modelo hereda la arquitectura del checkpoint base Gemma 4 y añade únicamente el adaptador LoRA y una plantilla de chat específica (`chat_template.jinja`, 18,37 KB). El pipeline declarado es `image-text-to-text` en los tags de Hugging Face, lo que sugiere que el modelo base conserva capacidad multimodal de entrada, aunque la model card no detalla el uso de visión.

## Capacidades

- Generación de texto jurídico en árabe estándar moderno formal, con prohibición explícita de dialecto en la política lingüística declarada.
- Consulta y recuperación de referencias legales concretas: números de ley, años y artículos constitucionales y legislativos de Kuwait.
- Razonamiento analítico sobre cláusulas: desglose granular de artículos y síntesis macro de normativa.
- Capacidad bilingüe cruzada árabe-inglés con registro jurídico institucional en ambos idiomas.
- Conversación multi-turno mediante plantilla de chat propia (formato `chat_template.jinja`).
- Ejecución local en CPU/GPU de consumo mediante GGUF en Ollama y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema Transformers.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni visión operativa.

## Casos de uso

- Consulta de articulado constitucional kuwaití: el modelo puede responder preguntas directas sobre artículos de la Constitución citando el número de artículo, gracias al entrenamiento con encabezados inyectados `[القانون رقم X لسنة Y - المادة Z]`.
- Asistencia a estudiantes de Derecho en Kuwait: desglose analítico de cláusulas y síntesis de normativa en árabe formal, adecuado por el corpus de 8.520 documentos legislativos.
- Borradores de correspondencia jurídica institucional: redacción en árabe estándar formal sin dialecto, útil para organismos públicos que exigen registro rígido.
- Despliegue en puesto de trabajo sin GPU dedicada: la versión Q4_K_M de 3,19 GB permite ejecución local vía Ollama en equipos de consumo, con latencia baja por el tamaño de 5,12 mil millones de parámetros.
- Traducción jurídica árabe-inglés: el emparejamiento bilingüe `KW-*` del entrenamiento permite trasladar terminología legal kuwaití a inglés institucional.
- Filtrado y clasificación de consultas legales en un chatbot de atención ciudadana: el modelo distingue entre consulta directa, consulta granular y síntesis macro, lo que facilita el enrutamiento a respuestas especializadas.
- Prototipado de asistentes legales soberanos: al ser Apache 2.0 y ejecutable en local, sirve para pilotos donde la normativa de soberanía de datos impide enviar consultas a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para Q4_K_M (3,19 GB de pesos más overhead de contexto), y 5-6 GB para Q8_0 (4,63 GB de pesos).
- Safetensors completos: 9,54 GB de pesos, lo que requiere del orden de 12-20 GB de VRAM según precisión y longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones GGUF; A100 o H100 solo necesarias para servir los safetensors completos con contexto largo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más para Q4_K_M, y con 8 GB o más para Q8_0.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_Legal_E2B:Q8_0` o `:Q4_K_M`), LM Studio, llama.cpp para GGUF, y Transformers con vLLM o TGI para los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lolo_Q8y_Legal_E2B | 5,12 mil millones | no disponible | Legal kuwaití (ar/en) | Apache 2.0 | HF, GGUF, Ollama |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | General, instruct | no disponible | HF |
| lolo_Q8y_Legal (31B) | no disponible | no disponible | Legal kuwaití (ar/en) | no disponible | HF (misma familia) |
| lolo_Q8y_General_E2B | no disponible | no disponible | General kuwaití | no disponible | HF (misma familia) |

La comparativa con modelos legales de otros ecosistemas no está disponible en la información proporcionada; no se han documentado benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo está entrenado exclusivamente sobre normativa kuwaití; las respuestas sobre otras jurisdicciones pueden ser incorrectas o inventadas.
- Riesgo de alucinación en números de ley y artículos: aunque el entrenamiento inyecta encabezados legales, no se documenta ningún mecanismo de verificación o recuperación, por lo que las citas deben validarse contra el texto oficial.
- Política lingüística rígida: la prohibición de dialecto puede degradar la naturalidad en conversaciones coloquiales o en variedades del árabe distintas de la MSA.
- Idiomas limitados a árabe e inglés; no se declara soporte de otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar tareas de análisis sobre documentos legales extensos.
- Ausencia de benchmarks: no hay evidencia publicada de calidad frente al modelo base ni frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (`unsloth/gemma-4-E2B-it`) puede imponer sus propios términos que conviene revisar antes de producción.
- El tag `image-text-to-text` sugiere herencia multimodal del base, pero la model card no documenta ni valida capacidades de visión; no asumir su funcionamiento.
- Autor único sin publicación revisada por pares ni paper asociado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Legal_E2B
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Familia lolo (referencias citadas en la model card): https://huggingface.co/qalduaij/lolo_Q8y_General, https://huggingface.co/qalduaij/lolo_Q8y_General_E2B, https://huggingface.co/qalduaij/lolo_Q8y_Legal, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v2, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v3_31B, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v5_E2B
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
