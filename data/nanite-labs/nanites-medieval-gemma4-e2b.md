# Nanite-Labs/nanites-medieval-gemma4-e2b

## Resumen

`nanites-medieval-gemma4-e2b` es un adaptador LoRA de un modelo de lenguaje multimodal de Google DeepMind, `unsloth/gemma-4-E2B-it`, afinado por Nanite-Labs para conversar en un registro del inglés de finales de la Edad Media (siglo XV). El modelo está diseñado para responder como un caballero o corresponsal inglés de esa época, usando vocabulario periodístico ("thou", "hath", "groat", "good cousin") y frases de 1 a 3 oraciones, sin reproducir inglés medio auténtico.

El fine-tuning se realizó con QLoRA sobre un corpus de cartas y versos anteriores a 1500, que incluye la colección CEECS, las cartas de Paston, Chaucer, Gower, Langland, Gawain, Lydgate y Hoccleve. El adaptador se publica bajo licencia Apache 2.0 y es un ajuste únicamente de las capas de lenguaje; la torre de visión del modelo base se descarta. El objetivo es el roleplay histórico y la conversación ambientada, no la precisión factual.

El modelo tiene un tamaño de repositorio de 0.1 GB, ya que solo se distribuye el adaptador. La inferencia requiere cargar el modelo base en 4-bit NF4 y aplicar un parche para congelar los embeddings por capa en CPU. Está pensado para ejecutarse en GPUs con 8 GB de VRAM, como la RTX 4070 Laptop, que es donde se validó el entrenamiento y la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-4-E2B) con adaptador LoRA; la base es multimodal pero solo se ajustan capas de lenguaje |
| Parametros totales | No disponible (adapter LoRA sobre Gemma-4-E2B; el nombre sugiere ~2B pero no se confirma) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con max seq de 512 tokens) |
| Tipos de cuantizacion | Base con QLoRA 4-bit NF4 + bf16; el adapter no se cuantiza |
| Idiomas soportados | Ingles (con registro historico del ingles del siglo XV modernizado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el checkpoint `unsloth/gemma-4-E2B-it`. La arquitectura base es un transformer multimodal de Google, pero el autor eliminó la torre de visión y entrenó únicamente las capas de lenguaje. Se aplicó QLoRA con un base de 4-bit NF4 y una configuración LoRA de r=16 y alpha=32 sobre las proyecciones `q, k, v, o, gate, up, down`. El entrenamiento se ejecutó con `transformers` y `peft`, usando un bucle de entrenamiento personalizado, porque el método `get_peft_model` de unsloth no era compatible con esta arquitectura.

Una particularidad técnica es que el modelo base tiene embeddings por capa (`embed_tokens_per_layer`, dimensiones 262144 x 8960), que suponen alrededor de 6.6 GB en GPU. Esta capa se mantiene congelada en CPU mediante un parche en la función de reenvío, mientras que la cabeza de lenguaje (`lm_head`) se separa y se mueve a GPU. Esto permite que secuencias de longitud real quepan en una tarjeta con 8 GB de VRAM. El pico de memoria validado fue de ~6.5 GB tanto en entrenamiento como en inferencia, y el autor recomienda activar `use_cache=True` porque las capas compartidas de KV de los modelos E2B/E4B lo requieren.

El conjunto de datos consta de 50 pares de preguntas y respuestas escritos a mano, más ~200 pares destilados por dos modelos maestros locales (`laguna-xs-2.1` y `ornith`), basados en un corpus parseado de cartas y versos anteriores a 1500. También se incluyen 3 conversaciones multi-turno con 7 muestras progresivas. En total hay 232 muestras de entrenamiento y 25 de validación. Se entrenó durante 2 épocas con batch de 1, gradiente acumulado de 4, tasa de aprendizaje 2e-4 con decaimiento coseno y longitud máxima de secuencia de 512. La pérdida de entrenamiento bajó de 14.2 a ~5.1, y la pérdida de validación final fue de 3.42.

## Capacidades

- Generación de texto en ingles con registro historico del siglo XV, usando vocabulario periodistico como "woe worth the weather", "thou", "hath", "groat", "staple" o "good cousin", sin recurrir a ingles medio literal.
- Conversación multi-turno: el modelo ve los intercambios previos en el contexto gracias a la plantilla de chat de Gemma.
- Respuestas cortas de 1 a 3 frases, adecuadas para interacciones breves de roleplay o consultas casuales sobre temas como cosechas, lana, pleitos, guerras, matrimonios o el tiempo.
- No soporta vision: aunque la base es multimodal, la torre de vision se elimina y solo se distribuyen las capas de lenguaje afinadas.
- No se han documentado capacidades de tool calling, function calling ni razonamiento multi-paso agente en la informacion disponible.

## Casos de uso

- Chatbot de roleplay historico para videojuegos o experiencias narrativas ambientadas en la Inglaterra del siglo XV, donde el jugador interactua con un personaje ficticio con registro periodistico.
- Asistente conversacional para museos o centros de interpretacion medieval: los visitantes pueden preguntar por la vida cotidiana, el comercio o la politica y recibir respuestas inmersivas, siempre que se use como recurso creativo y no divulgativo.
- Generacion de dialogos para novelas interactivas o juegos de rol de mesa, especialmente para bocetos de personajes secundarios con voz historica.
- Simulacion de correspondencia historica en actividades educativas de literatura inglesa, para ilustrar el lenguaje de la epoca sin citar fuentes reales.
- Creacion de contenido para redes sociales o canales de divulgacion que usen personajes historicos para amenizar temas de cultura general.
- Experimentacion con fine-tuning de modelos pequenos en registro linguistico: la ficha documenta el proceso de QLoRA y las tecnicas de offload de embeddings, util como referencia para adaptar modelos Gemma en VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida durante el entrenamiento (train loss de 14.2 a ~5.1, val loss de 3.42), que no permite comparar con otros modelos ni con evaluaciones estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6.5 GB segun las pruebas del autor, usando el base en 4-bit NF4 y el adaptador cargado encima.
- GPU recomendada: NVIDIA RTX 4070 Laptop con 8 GB de VRAM fue la plataforma de validacion. Una GPU de escritorio con 8 GB o mas, como una RTX 3060 Ti o RTX 4060, deberia ser suficiente si se aplica el parche de embeddings en CPU.
- No cabe en GPUs con menos de 8 GB de VRAM sin tecnicas adicionales de offload.
- Opciones de despliegue: el autor indica cargar el base con `AutoModelForCausalLM.from_pretrained(base, device_map={"":0}, dtype=torch.bfloat16)`, aplicar el parche de congelacion de embeddings de `experts/medieval/train.py` y envolverlo con `PeftModel.from_pretrained`. Debe usarse `use_cache=True`. No se mencionan vLLM, Ollama, TGI ni llama.cpp.
- Latencia y throughput: no disponibles. El autor no publica mediciones de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

No se han publicado comparativas formales. En la documentacion solo se referencia el modelo base `unsloth/gemma-4-E2B-it`, del que no se detallan especificaciones tecnicas. El adaptador es un caso muy especifico de roleplay historico en ingles, por lo que no se dispone de alternativas comparables en la informacion proporcionada. Si se busca un modelo generalista de este tamano, seria necesario consultar los datos publicos del propio base, que no aparecen en esta ficha.

## Limitaciones y advertencias

- Sesgos y falta de verificacion: el modelo no incluye capa de revision de hechos. Nombres, fechas, lugares y detalles legales son escritura creativa en un registro historico, no historia real.
- Anacronismos ocasionales: se han observado expresiones modernas como "hold your horses", "audit", "business" o "team". El autor recomienda regenerar la respuesta en estos casos.
- Generaciones cortas: el modelo responde en 1-3 frases. Si se piden respuestas largas, puede repetirse o caer en bucles.
- Sin vision: la torre de vision del modelo base se elimina, por lo que no puede procesar imagenes.
- Sin guardrails: el modelo puede dar consejos en estilo periodistico con confianza. No debe usarse para tomar decisiones reales.
- Uso comercial: el licenciamiento del codigo y el modelo es Apache 2.0, pero el corpus CEECS no se redistribuye y tiene una licencia de investigacion. Quien quiera reentrenar debe re-obtener los datos mediante los scripts del repositorio.
- Solo ingles: no hay soporte para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanite-Labs/nanites-medieval-gemma4-e2b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Informacion sobre Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
