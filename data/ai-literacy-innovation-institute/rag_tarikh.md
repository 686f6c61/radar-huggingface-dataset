# ai-literacy-innovation-institute/rag_tarikh

## Resumen

`rag_tarikh` es un adaptador LoRA entrenado por el equipo de investigación ILMA MORA del AI Literacy Innovation Institute sobre el modelo base Qwen2.5-3B-Instruct. Su propósito es responder preguntas sobre historia islámica en indonesio, apoyándose en fragmentos de textos árabes clásicos —concretamente *Tarikh al-Rusul wa al-Muluk* de al-Tabari y *Futuh al-Buldan* de al-Baladhuri— que se le pasan como contexto en el prompt. El adaptador fuerza un razonamiento explícito en una etiqueta `<thought>` y cita la obra de referencia en la respuesta final.

El artefacto no es un modelo completo: pesa 0,1 GB y contiene únicamente los pesos LoRA (504 tensores, r=16, alpha=32) más el tokenizer y la plantilla de chat ChatML de Qwen. Para usarlo hay que cargar primero Qwen2.5-3B-Instruct y superponer el adaptador con PEFT. Forma parte del proyecto de investigación ILMA MORA v7 y se distribuye bajo licencia CC BY 4.0.

Su relevancia es acotada y muy específica: demuestra un patrón de *grounded generation* con citación de fuentes sobre un corpus histórico árabe, en un modelo pequeño de 3B parámetros, con idiomas de salida limitados a indonesio y árabe. No está pensado como asistente general ni como herramienta de consulta religiosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (el adaptador contiene 504 tensores LoRA; el modelo base Qwen2.5-3B-Instruct tiene 3,09 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct, 32.768 tokens segun la documentacion publica de Qwen, no verificada aqui) |
| Tipos de cuantizacion | No especificados por el autor; el modelo base admite cuantizacion estandar (GPTQ, AWQ, GGUF) a traves de herramientas externas. El autor desaconseja bitsandbytes 4-bit en Apple MPS |
| Idiomas soportados | Indonesio (id) y arabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` |
| Rank LoRA (r) | 16 |
| `lora_alpha` | 32 |
| `lora_dropout` | 0,05 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Epocas / pasos | 3 epocas, 378 pasos de optimizacion |
| Loss de entrenamiento final | 1,9897 |
| Loss de evaluacion | 1,9977 → 1,8406 → 1,7954 |
| `mean_token_accuracy` | ~0,63 |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT con el `SFTTrainer` de TRL sobre el dataset `ai-literacy-innovation-institute/sft_tarikh`, compuesto por 1.260 muestras de *Grounded Supervised Fine-Tuning* (1.008 de entrenamiento, 126 de validación y 126 de test). Cada muestra empareja un fragmento de texto árabe de al-Tabari o al-Baladhuri con una pregunta en indonesio y una respuesta que incluye razonamiento Chain-of-Thought dentro de `<thought>` y una cita explícita de la obra y referencia de página. Los módulos LoRA cubren todas las proyecciones de atención y del MLP, lo que da al adaptador capacidad de modificar tanto el comportamiento conversacional como el estilo de razonamiento del modelo base.

No se documenta el número total de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de RLHF o DPO; el autor solo indica SFT supervisado. La loss de evaluación desciende de forma estable (1,9977 → 1,8406 → 1,7954) sin señales de divergencia. El propio autor advierte que la precisión media por token (~0,63) refleja el techo de capacidad de un modelo de 3B sobre un corpus histórico en árabe, no un fallo del adaptador. La innovación técnica principal no está en la arquitectura, sino en el formato de salida: separación explícita entre razonamiento (`<thought>`) y respuesta final con cita de fuente.

## Capacidades

- Generación de respuestas sobre historia islámica clásica en indonesio, condicionadas a un contexto documental proporcionado en el prompt.
- Razonamiento Chain-of-Thought estructurado dentro de la etiqueta `<thought>` (tasa de activación del 96,7 % en la evaluación del autor).
- Citación de la obra de referencia y de la página en la respuesta final (tasa de citación del 100 % en la misma evaluación).
- *Grounded generation*: el prompt del sistema fuerza a responder solo con la evidencia suministrada y a no añadir información no respaldada.
- Comprensión de texto árabe clásico como contexto de entrada.
- Conversación multi-turno mediante la plantilla ChatML de Qwen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, uso de visión, audio ni modalidades adicionales.
- No se documenta un modo "thinking" nativo del modelo base; el razonamiento es un artefacto del formato de entrenamiento.

## Casos de uso

- **Asistente de consulta sobre fuentes históricas islámicas**: dado un fragmento de al-Tabari o al-Baladhuri y una pregunta en indonesio, el adaptador produce una respuesta con razonamiento trazable y cita de página, útil para investigadores que quieran localizar y contrastar pasajes concretos.
- **Generación de resúmenes con atribución**: en un pipeline de digitalización de manuscritos, el adaptador puede resumir secciones y adjuntar la referencia de la obra y página, lo que facilita la revisión posterior por un historiador.
- **Prototipo de sistema RAG educativo**: el adaptador se integra en un pipeline de recuperación (el autor evaluó con TF-IDF) para responder preguntas de estudiantes de historia islámica citando la fuente recuperada, con la salvedad de que el modelo base es pequeño y requiere verificación.
- **Anotación asistida de corpus históricos**: el formato `<thought>` + respuesta citada permite generar borradores de anotaciones que un experto revisa, reduciendo el coste de etiquetado manual de pasajes árabes.
- **Evaluación de pipelines de recuperación**: al depender fuertemente del contexto inyectado, el adaptador sirve como banco de pruebas para medir cómo distintos recuperadores afectan a la fidelidad de la respuesta (el autor reporta una mejora de *faithfulness* de 1,47 a 4,07 al cambiar el pipeline de recuperación y el evaluador).
- **Demostración de *grounded generation* en modelos pequeños**: útil como caso de estudio de cómo un LoRA de rango 16 sobre un modelo de 3B puede imponer un formato de razonamiento y citación, aunque con techo de precisión limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta únicamente métricas internas sobre 30 preguntas con el mismo contexto recuperado:

| Metrica | Valor |
|---|---|
| *Thought rate* | 96,7 % |
| *Citation rate* | 100 % |
| *Faithfulness* (antes del cambio de pipeline) | 1,47 |
| *Faithfulness* (despues del cambio de pipeline) | 4,07 |
| Tasa de halucinacion (antes) | 100 % |
| Tasa de halucinacion (despues) | 16,7 % |

El propio autor advierte que las métricas de *faithfulness* y alucinación corresponden al pipeline completo (recuperación + evaluador + adaptador), no al adaptador de forma aislada, y que el detalle está en `halluc_fix/LAPORAN.md` del repositorio del proyecto.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real lo determina el modelo base Qwen2.5-3B-Instruct.
- VRAM estimada para inferencia en fp16: en torno a 6-7 GB para el modelo base más overhead de activaciones; en 4-bit, aproximadamente 2-3 GB (aunque el autor desaconseja bitsandbytes 4-bit en Apple MPS).
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4, A100 o H100 para inferencia en fp16 con comodidad; cualquier GPU con al menos 8 GB de VRAM debería bastar en fp16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y en Apple Silicon con MPS (el autor recomienda `torch_dtype=torch.float16` y `device_map="auto"`).
- Opciones de despliegue: transformers + PEFT (documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF. No se documenta compatibilidad explícita con ninguno de estos servidores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados por el autor. A continuación se compara a nivel de especificaciones con alternativas de la misma categoría (modelos pequeños con adaptadores LoRA para dominios específicos):

| Modelo | Parametros base | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `rag_tarikh` (este) | Qwen2.5-3B-Instruct (3,09 B) | No disponible (heredado del base) | id, ar | CC BY 4.0 | LoRA r=16, SFT sobre 1.260 muestras, formato `<thought>` + cita |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (segun documentacion publica de Qwen) | Multiples, incluido id y ar | Apache 2.0 | Modelo base sin adaptador; no impone formato de razonamiento ni citacion |
| Adaptadores LoRA comunitarios sobre Qwen2.5-3B | 3,09 B | Heredado del base | Variable | Variable | No hay un adaptador equivalente publicado para historia islamica en indonesio con el que comparar directamente |
| Modelos especializados en historia/religion de mayor tamano (p. ej. variantes de 7B-13B) | 7-13 B | Variable | Variable | Variable | Mayor capacidad, mayor coste de VRAM; no disponibles en la informacion proporcionada para comparacion directa |

No se han publicado comparaciones directas con otros adaptadores o modelos en la informacion disponible.

## Limitaciones y advertencias

- El adaptador está optimizado para preguntas de historia islámica en indonesio con contexto en árabe; fuera de ese dominio su comportamiento no está caracterizado.
- No es un muftí ni emite fatuas; el autor lo declara explícitamente. No debe usarse para consultas religiosas normativas.
- Riesgo de alucinación: el autor reporta que, sin un pipeline de recuperación adecuado, la tasa de alucinación puede llegar al 100 %; con el pipeline corregido baja al 16,7 %, pero sigue siendo significativa. Un modelo de 3B puede inventar detalles cuando el contexto es insuficiente.
- La precisión media por token (~0,63) refleja el techo del modelo base de 3B sobre corpus históricos árabes; no debe interpretarse como calidad de producción.
- Las métricas de *faithfulness* y alucinación son del pipeline completo, no del adaptador aislado; no deben citarse como rendimiento intrínseco del modelo.
- El estado `expert_verified` del dataset es una curaduría interna del proyecto ILMA MORA, no una certificación externa.
- Para uso académico se recomienda verificación cruzada contra ediciones impresas de las obras citadas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia (Apache 2.0) que debe respetarse por separado.
- Idiomas limitados a indonesio y árabe; no se documenta calidad en castellano ni en otras lenguas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni validación externa.
- El autor desaconseja cuantización bitsandbytes 4-bit en Apple MPS por problemas de compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-literacy-innovation-institute/rag_tarikh
- Dataset de entrenamiento: https://huggingface.co/datasets/ai-literacy-innovation-institute/sft_tarikh
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del proyecto (referenciado en la model card, ruta `halluc_fix/LAPORAN.md`): no se proporciona URL directa en la informacion disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
