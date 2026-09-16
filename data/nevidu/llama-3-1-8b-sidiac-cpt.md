# Nevidu/Llama-3.1-8B-SiDiaC-CPT

## Resumen

Llama-3.1-8B-SiDiaC-CPT es un adaptador LoRA publicado por Nevidu Jayatilleke que aplica preentrenamiento continuado (*continual pretraining*) sobre Llama-3.1-8B, partiendo del checkpoint ya cuantizado a 4 bits `unsloth/meta-llama-3.1-8b-unsloth-bnb-4bit`. No se trata de un modelo de instrucciones ni de un asistente conversacional: es un artefacto de investigación construido para extraer representaciones contextuales de palabras en sinhala a lo largo de distintos siglos y medir con ellas el cambio semántico diacrónico mediante un análisis *leave-one-out* (LOO) sobre cada lema.

El adaptador se entrenó sobre el corpus completo SiDiaC-v.2.0 con `trl.SFTTrainer` en modo autosupervisado (predicción del siguiente token), con rango LoRA 16, alpha 32 y dropout 0.05 sobre las proyecciones de atención y MLP, además del `lm_head`. Un detalle técnico relevante es que el tokenizador es el original de Llama-3.1 (128.256 tokens) sin ampliación de vocabulario para sinhala; para compensar, se reentrenan directamente las capas de embeddings y de salida, guardando `embed_tokens` completo junto a los adaptadores. Eso explica que el repositorio ocupe 2.3 GB pese a ser un adaptador PEFT.

Su relevancia es acotada pero clara: el sinhala es un idioma de bajos recursos y los estudios de cambio semántico diacrónico apenas cuentan con recursos anotados. Este checkpoint demuestra que se puede adaptar un modelo multilingüe de 8.000 millones de parámetros a un corpus histórico en sinhala sin expandir el vocabulario, y que el resultado sirve como extractor de embeddings. El propio autor advierte de que no ha sido evaluado en seguridad, factualidad ni uso general, y que debe tratarse como material de investigación, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con adaptadores LoRA sobre atención, MLP y `lm_head`; `embed_tokens` reentrenado por completo |
| Parametros totales | 8.030 millones en el modelo base; el adaptador añade una fracción no especificada (el repo pesa 2,3 GB, dominado por `embed_tokens` guardado completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Base: 128.000 tokens (Llama-3.1). Entrenamiento: 512 tokens. Ejemplo de uso del autor: `max_seq_length=2048`. Ventana efectiva recomendada: 2.048 tokens |
| Tipos de cuantizacion | Base cargado en 4 bits con bitsandbytes (requiere GPU CUDA); adaptadores LoRA en precisión de entrenamiento. No se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | Sinhala (si) e inglés (en), según los metadatos; el entrenamiento se centró en el corpus histórico en sinhala |
| Licencia | no disponible (el modelo base está sujeto a la Llama 3.1 Community License) |
| Formato de pesos | Adaptadores PEFT/LoRA (librería `peft`), cargables sobre el base en formato `safetensors`/bnb-4bit |
| Metodo de entrenamiento | LoRA: r=16, lora_alpha=32, lora_dropout=0.05; `target_modules`: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, lm_head; `modules_to_save`: embed_tokens |
| Framework | Unsloth + TRL; PEFT 0.19.1 |
| Tokenizador | Llama-3.1 original, 128.256 tokens, sin ampliación de vocabulario |
| Tarea | Causal LM / preentrenamiento continuado autosupervisado |
| Dataset | Nevidu/SiDiaC-v.2.0 (corpus completo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención con GQA (grouped-query attention). Sobre esa base se aplica un adaptador LoRA de rango 16 y alpha 32 con dropout 0.05 sobre las siete proyecciones habituales de atención y MLP, más el `lm_head`. La diferencia respecto a un ajuste LoRA convencional es que `embed_tokens` se guarda y se reentrena en su totalidad en lugar de congelarse: al no expandir el vocabulario para sinhala, el modelo debe aprender representaciones útiles para los subtokens sinhala reutilizando las filas de embedding existentes del tokenizador Llama-3.1.

El entrenamiento es un preentrenamiento continuado autosupervisado con `trl.SFTTrainer` y empaquetado de secuencias (*sequence packing*) sobre el corpus SiDiaC-v.2.0, con secuencias de 512 tokens, batch de 4 por dispositivo con 8 pasos de acumulación de gradiente (32 efectivo), tasa de aprendizaje 2e-5, partición 90/10 y evaluación cada 50 pasos. Se planificaron 10 épocas con parada temprana (paciencia de 3 evaluaciones). En total se ejecutaron 1.125 pasos: la pérdida de evaluación bajó de 8,62 en el paso 0 hasta un mínimo de 4,80 en el paso 750, tras el cual empezó a subir, por lo que se restauró el checkpoint del paso 750 con `load_best_model_at_end`. Ese es el checkpoint publicado.

No se describe ningún componente de RLHF, DPO ni ajuste por instrucciones: el objetivo es exclusivamente obtener embeddings contextuales por siglo para el análisis de deriva semántica descrito en el artículo. Conviene señalar que la instalación es frágil: la propia model card documenta conflictos de versiones entre `unsloth`, `trl`, `peft`, `pyarrow` y `datasets`, y ofrece una secuencia exacta de instalación.

## Capacidades

- Generación de texto autorregresiva en sinhala e inglés, heredada del base y desplazada hacia la distribución del corpus histórico en sinhala.
- Extracción de representaciones contextuales de tokens y lemas: es la capacidad para la que fue entrenado explícitamente.
- Modelado de lenguaje en textos históricos en sinhala, útil como estimador de verosimilitud de secuencias del corpus.
- Predicción del siguiente token con pérdida de evaluación de 4,80 sobre el split del 10 % de SiDiaC-v.2.0.
- Comprensión básica de inglés, limitada por el dominio del corpus de ajuste.
- No dispone de modo de razonamiento explícito (*thinking mode*), ni visión, ni audio.
- No hay evidencia de soporte de *tool calling* / *function calling*: el ajuste no incluye datos de instrucciones ni de llamadas a herramientas.
- No hay soporte documentado de uso agéntico ni de razonamiento multi-paso.
- Capacidad multilingüe restringida a los dos idiomas declarados (si, en); el resto del multilingüismo del base puede degradarse tras el preentrenamiento continuado.

## Casos de uso

- Extracción de embeddings diacrónicos: se pasa texto del corpus SiDiaC-v.2.0 por siglo y se recogen las representaciones contextuales de cada lema; es el flujo descrito en el artículo y la razón de ser del checkpoint.
- Detección de cambio semántico léxico: alimentar un análisis *leave-one-out* por lema comparando siglos para cuantificar la deriva de significado y clasificar lemas como estables o cambiantes.
- Estudio de variación ortográfica histórica en sinhala: entrenar clasificadores o agrupamientos sobre los embeddings para observar cómo se agrupan variantes de escritura de un mismo lema en distintas épocas.
- Construcción de léxicos históricos asistida por corpus: usar la perplejidad del modelo para puntuar y filtrar candidatos de normalización o limpieza de textos antiguos antes de anotarlos.
- Investigación en transferencia entre lenguas de bajos recursos: sirve como punto de comparación controlado (sin expansión de vocabulario) frente a modelos con vocabulario extendido para sinhala.
- Reproducibilidad académica: permite replicar los resultados del artículo sobre SiDiaC-v.2.0 con los mismos hiperparámetros y el mismo checkpoint, algo poco frecuente en estudios de cambio semántico.
- Aumento de datos para PLN en sinhala: generar continuaciones de estilo histórico para preentrenar otros modelos, siempre con revisión humana por el riesgo de alucinación.
- No se recomienda su uso en atención al cliente, generación de código, agentes o asistentes conversacionales: no fue ajustado por instrucciones ni evaluado en esas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de evaluación del preentrenamiento continuado:

| Metrica | Valor |
|---|---|
| Pérdida de evaluación en el paso 0 | 8,62 |
| Pérdida de evaluación mínima (paso 750) | 4,80 |
| Pasos totales ejecutados | 1.125 (parada temprana) |
| MMLU, HumanEval, GSM8K, MMLU-Pro, etc. | no disponible |
| Métricas de deriva semántica | no disponibles en la información proporcionada (se remiten al artículo arXiv:2609.08609) |

## Requisitos de hardware

- VRAM estimada en inferencia: en torno a 8-10 GB con el base cargado en 4 bits (aproximadamente 5,5 GB de pesos cuantizados) más el adaptador, que incluye `embed_tokens` guardado completo (parte principal de los 2,3 GB del repositorio).
- En precisión completa (fp16/bf16) el base ronda los 16 GB de pesos, más el adaptador: harían falta del orden de 18-20 GB, ajustado para una RTX 4090 de 24 GB.
- GPU compatibles: cualquier GPU CUDA con al menos 10-12 GB para la ruta 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A10, L4). Para entrenamiento continuado o lotes grandes conviene A100 40/80 GB o H100.
- La ruta 4 bits de bitsandbytes exige GPU CUDA: no funciona en CPU ni en Apple Silicon (MPS), tal como advierte el autor.
- Opciones de despliegue: `transformers` + `peft` con `load_in_4bit=True`, o Unsloth `FastLanguageModel` (el flujo documentado). Para despliegue servido habría que fusionar los adaptadores y exportar a vLLM, TGI o llama.cpp; no se publican pesos fusionados ni GGUF, así que ese camino requiere conversión manual y no está validado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- `max_seq_length` recomendado por el autor: 2.048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-SiDiaC-CPT | 8,03 B + LoRA r=16 | Base 128.000; entrenado a 512; recomendado 2.048 | Adaptador LoRA para preentrenamiento continuado en sinhala | no disponible | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| unsloth/meta-llama-3.1-8b-unsloth-bnb-4bit (base) | 8,03 B | 128.000 | Modelo base cuantizado a 4 bits para ajuste | Llama 3.1 Community License | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Modelo ajustado por instrucciones | Llama 3.1 Community License | HuggingFace |
| Alternativas específicas de sinhala con vocabulario extendido | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación directa de rendimiento no es posible: este checkpoint no publica métricas de tareas estándar y su objetivo (embeddings diacrónicos) no coincide con el de un modelo de instrucciones. La única comparación válida es con su propio base, donde el autor reporta una reducción de la pérdida de evaluación de 8,62 a 4,80 sobre el corpus SiDiaC-v.2.0.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de chat: no ha recibido ajuste supervisado con pares pregunta-respuesta ni RLHF/DPO. Usarlo como asistente produciría salidas de baja calidad.
- El autor indica explícitamente que no ha sido evaluado en seguridad, factualidad ni uso genérico posterior (*downstream*): es un artefacto de investigación.
- Riesgo alto de alucinación si se usa para generación abierta: el entrenamiento es de modelado de lenguaje sobre un corpus histórico, no de veracidad.
- Sesgos del corpus: al provenir de un conjunto histórico en sinhala, el modelo reflejará la distribución, la ortografía y los sesgos de esas fuentes, desconocidos en detalle en la información disponible.
- Sin ampliación de vocabulario para sinhala: el tokenizador Llama-3.1 fragmenta el sinhala en subtokens, lo que encarece el contexto efectivo y puede degradar la calidad frente a modelos con vocabulario adaptado. El autor lo asume como parte del diseño experimental.
- Divergencia de contexto: aunque el base soporta 128.000 tokens, el entrenamiento se hizo con 512 tokens y el ejemplo de uso emplea 2.048. No hay evidencia de que el modelo se comporte bien más allá de esa ventana, y el ajuste de RoPE no se ha modificado.
- Licencia no disponible en los metadatos: hay que verificar las condiciones antes de cualquier uso comercial o redistribución. El modelo base arrastra la Llama 3.1 Community License, que impone obligaciones adicionales (atribución, nomenclatura, restricciones de uso).
- Dependencias frágiles: la model card documenta conflictos de versiones entre Unsloth, TRL, PEFT, datasets y pyarrow, y recomienda una secuencia de instalación concreta que puede romperse con actualizaciones.
- Requiere GPU CUDA para la carga en 4 bits; no hay soporte documentado para CPU ni Apple Silicon.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), por lo que no existe validación independiente fuera del grupo de investigación.
- Aviso sobre los resultados de búsqueda web: las consultas devolvieron únicamente páginas sin relación con el modelo (foros y enciclopedias en chino sobre temas ajenos); no se ha localizado información adicional contrastable más allá de la model card, el dataset y el artículo citados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nevidu/Llama-3.1-8B-SiDiaC-CPT
- Modelo base (4 bits, Unsloth): https://huggingface.co/unsloth/meta-llama-3.1-8b-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/Nevidu/SiDiaC-v.2.0
- Artículo (arXiv:2609.08609): https://arxiv.org/abs/2609.08609
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Enlaces adicionales (demo, blog, repositorio de código del paper): no disponibles en la información proporcionada
