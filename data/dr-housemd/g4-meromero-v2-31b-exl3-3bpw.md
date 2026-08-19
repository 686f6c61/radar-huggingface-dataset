# dr-housemd/G4-MeroMero-v2-31B-exl3-3bpw

## Resumen

G4-MeroMero-v2-31B-exl3-3bpw es una cuantización en 3 bits (formato EXL3) del finetune G4-MeroMero-v2-31B, desarrollado por el usuario dr-housemd sobre el modelo base google/gemma-4-31B-it. Este finetune está diseñado específicamente para tareas creativas, con un énfasis particular en el roleplay narrativo (RP). Según la descripción del autor, el objetivo era aumentar la creatividad de Gemma 4 sin degradar su inteligencia, un equilibrio difícil de lograr. La versión v2 se presenta como una iteración más creativa que la v1 (G4-MeroMero-31B). El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su uso con el motor de inferencia ExLlama v3, que permite cuantizaciones de baja precisión manteniendo una calidad aceptable. Aunque el nombre indica 31B de parámetros, el archivo safetensors reporta 7.925.943.916 parámetros (≈7,9B), una discrepancia que probablemente se deba a un error en la metadata del repositorio; el modelo base declarado es Gemma 4 31B, por lo que se asume que la arquitectura original es de 31 mil millones de parámetros. El repositorio tiene un tamaño de 15,9 GB, coherente con una cuantización 3-bit de un modelo de ese tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4 31B) |
| Parametros totales | 31B (nominal); el archivo safetensors reporta 7.925.943.916 (≈7,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Gemma 4) |
| Tipos de cuantizacion | 3-bit (EXL3, 3bpw) |
| Idiomas soportados | no disponible (Gemma 4 soporta múltiples idiomas, pero no se especifica para este finetune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización EXL3) |

## Arquitectura y entrenamiento

El modelo es un finetune de google/gemma-4-31B-it, la versión instruida de Gemma 4 31B. La arquitectura subyacente es la de Gemma 4, un transformer denso con atención multi-consulta y otras optimizaciones propias de la familia Gemma, aunque no se proporcionan detalles técnicos específicos en la información disponible. El entrenamiento del finetune no está documentado: el autor menciona que fue el resultado de "mucha experimentación y aprendizaje" para incrementar la creatividad en tareas narrativas sin sacrificar la capacidad de razonamiento, pero no se indican los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. La cuantización a 3-bit con EXL3 es una compresión posterior que reduce el tamaño del modelo para facilitar su ejecución en hardware con VRAM limitada, a costa de una ligera pérdida de precisión.

## Capacidades

- Generación de texto creativo: está específicamente afinado para narrativa, descripciones vívidas y diálogos.
- Roleplay narrativo (RP): maneja contextos de personajes, escenarios y tramas con un estilo más imaginativo que el modelo base.
- Razonamiento y comprensión: al partir de Gemma 4 31B, conserva capacidades generales de razonamiento, aunque el finetune prioriza la creatividad.
- Instrucciones en lenguaje natural: al ser una variante de la versión "it" (instruction-tuned), responde bien a prompts en formato conversacional.
- Capacidades multilingües: no documentadas específicamente, pero heredadas del modelo base (Gemma 4 soporta varios idiomas).
- No se menciona soporte explícito para tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Escritura de ficción y novelas: el modelo puede generar tramas, diálogos y descripciones con un estilo más imaginativo que el modelo base, útil para autores que buscan inspiración o borradores iniciales.
- Roleplay por chat (RP): diseñado para sesiones de roleplay en plataformas de chat, donde mantiene coherencia con la personalidad de los personajes y el arco narrativo.
- Creación de contenido para juegos de rol: ayuda a generar misiones, encuentros, descripciones de escenarios y NPCs para juegos de mesa o videojuegos.
- Guiones y diálogos: puede producir guiones para cortometrajes, teatro o contenido audiovisual, con un tono más creativo que los modelos genéricos.
- Expansión de ideas creativas: útil para brainstorming de conceptos de historias, giros argumentales o desarrollo de mundos.
- Asistente de escritura en tiempo real: integrable en editores de texto o aplicaciones de escritura para sugerir continuaciones o reescribir pasajes con un estilo más literario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este finetune ni para su versión cuantizada.

## Requisitos de hardware

- VRAM estimada: con 15,9 GB de pesos en 3-bit, se requiere al menos 16 GB de VRAM para inferencia con contexto corto; con contexto largo (p.ej., 8K tokens) se recomiendan 20-24 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), o GPUs de datacenter como A100 (40/80 GB) para mayor margen.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 24 GB como la RTX 3090/4090, y posiblemente en algunas de 16 GB (p.ej., RTX 4080) con contexto reducido.
- Opciones de despliegue: al ser formato EXL3, se recomienda ExLlama v3 (o v2 si es compatible). También podría convertirse a GGUF para llama.cpp u Ollama, aunque no se proporciona dicha conversión.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de contexto. Con una RTX 4090 y cuantización 3-bit, se puede esperar una generación de 30-50 tokens/s en contexto corto, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Enfoque |
|---|---|---|---|---|---|
| G4-MeroMero-v2-31B (este, 3-bit) | 31B | no disponible | Apache 2.0 | 3-bit EXL3 | Creatividad y RP |
| google/gemma-4-31B-it (base) | 31B | no disponible | Apache 2.0 | Original (BF16) | Instrucciones generales |
| G4-MeroMero-v2-31B-W8A16-FP8 (hoborific) | 31B | no disponible | Apache 2.0 | 8-bit FP8 | Mismo finetune, mayor precisión |
| zerofata/G4-MeroMero-v2-31B | 31B | no disponible | Apache 2.0 | Original (sin cuantizar) | Mismo finetune, precisión completa |

La comparativa se limita a variantes del mismo finetune y al modelo base, ya que no se dispone de información sobre otros modelos de la misma categoría. El modelo base Gemma 4 31B es el punto de referencia natural; este finetune sacrifica algo de precisión general (especialmente en 3-bit) a cambio de una mayor creatividad narrativa.

## Limitaciones y advertencias

- La cuantización a 3-bit puede degradar la coherencia y la calidad del razonamiento en tareas complejas, en comparación con el modelo original en BF16.
- No hay documentación sobre el proceso de entrenamiento del finetune, por lo que se desconocen posibles sesgos introducidos por los datos utilizados.
- Riesgo de alucinaciones: como todo LLM, puede generar información falsa o inventada, especialmente en contextos creativos donde la verosimilitud no es prioritaria.
- El enfoque en creatividad puede hacer que el modelo sea menos fiable para tareas factuales o de razonamiento estricto.
- No se especifican los idiomas soportados; aunque Gemma 4 es multilingüe, el finetune podría estar sesgado hacia el inglés u otros idiomas según los datos de entrenamiento.
- La discrepancia en el número de parámetros (31B vs 7,9B reportados) sugiere una posible inconsistencia en la metadata; conviene verificar el modelo antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios términos; se recomienda revisar la licencia de Google para Gemma 4.

## Enlaces

- [HuggingFace - dr-housemd/G4-MeroMero-v2-31B-exl3-3bpw](https://huggingface.co/dr-housemd/G4-MeroMero-v2-31B-exl3-3bpw)
- [Colección G4 MeroMero 31B EXL3 de dr-housemd](https://huggingface.co/collections/dr-housemd/g4-meromero-31b-exl3)
- [G4-MeroMero-v2-31B-W8A16-FP8 en LLM Explorer](https://llm-explorer.com/model/hoborific%2FG4-MeroMero-v2-31B-W8A16-FP8,3wrADyN2TMJ8VgO3UQmG8g)
- [G4-MeroMero-v2-31B (zerofata) en LLM Explorer](https://llm-explorer.com/model/zerofata%2FG4-MeroMero-v2-31B,4EnQ8ulUmyaMNAyBspmm00)
- [Página de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- Referencias arxiv mencionadas en los tags: [arxiv:2604.03136](https://arxiv.org/abs/2604.03136) y [arxiv:2605.26492](https://arxiv.org/abs/2605.26492) (no se ha verificado su contenido)
