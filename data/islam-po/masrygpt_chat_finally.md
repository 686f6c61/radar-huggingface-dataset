# ISLAM-PO/MasryGPT_chat_FINALLY

## Resumen

MasryGPT Chat es un modelo de conversación en árabe egipcio (masri, عامية مصرية) obtenido mediante ajuste fino supervisado del modelo base Qwen2.5-1.5B-Instruct. Lo desarrolla el usuario ISLAM-PO y se publica con licencia Apache 2.0 en Hugging Face. El objetivo declarado es cubrir la brecha entre el árabe estándar moderno (MSA), en el que se optimizan la mayoría de los LLM árabes, y el habla cotidiana egipcia, con sus expresiones, humor e idiomatismos.

El modelo es deliberadamente ligero: 1.543.714.304 parámetros según los pesos en safetensors, arquitectura Qwen2ForCausalLM de 28 capas, 12 cabezas de atención y 2 cabezas KV, con un tamaño de repositorio de 3,1 GB en precisión de 16 bits. La motivación del autor es el despliegue en hardware modesto (una T4, entornos edge o startups con GPU limitada), frente a modelos de 7B que requieren 14 GB o más de VRAM.

El ajuste se realizó con QLoRA y Unsloth sobre un conjunto sintético de 80.000 ejemplos en dialecto egipcio, con 2.500 pasos de entrenamiento y una pérdida final de 0,079. El autor presenta los resultados como un piloto interno, no como un benchmark independiente, lo que conviene tener en cuenta al evaluar su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only, 28 capas, 12 cabezas de atención, 2 cabezas KV) |
| Parametros totales | 1.543.714.304 (según safetensors); la model card indica 1.562.179.072 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de posición máxima (RoPE theta 1.000.000); entrenado con 2.048 |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 (bitsandbytes); publicación en bfloat16 de 16 bits; el autor menciona inferencia en 4 bits (~1,2 GB de VRAM) |
| Idiomas soportados | ar (árabe, con foco en dialecto egipcio), en |
| Licencia | apache-2.0 (sujeta además a la licencia de Qwen) |
| Formato de pesos | safetensors (transformers) |

Otros datos técnicos: hidden size 1536, intermediate size 8960, vocabulario de 151.936 tokens, tokenizador Qwen2 con plantilla de chat `qwen-2.5`. LoRA con r=16, alpha=16, dropout 0 y target en q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj; 18.464.768 parámetros entrenables (1,18 % del total).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de la familia Qwen2, con atención multi-cabeza con 12 cabezas de consulta y 2 cabezas KV (GQA), normalización RMSNorm y embeddings posicionales rotatorios (RoPE) con theta de 1.000.000, lo que permite extender la ventana hasta 32.768 tokens aunque el entrenamiento se hizo con 2.048. El pipeline fue: carga del modelo base en 4 bits con FastLanguageModel, aplicación de QLoRA mediante PEFT, entrenamiento supervisado con SFTTrainer de TRL y guardado fusionado en 16 bits.

El conjunto de datos, `qwen_egyptian_80k_terms.jsonl`, contiene 80.000 ejemplos generados de forma sintética a partir de un léxico egipcio y filtrados manualmente para eliminar vulgarismos. La distribución es: saludos y charla diaria 35 %, humor y chistes 15 %, expresiones e idiomatismos 15 %, atención al cliente e instrucciones 20 %, y cultura y comida 15 %. Los hiperparámetros finales fueron max_seq_length 2048, batch efectivo de 32 (batch por dispositivo 32, sin acumulación), learning rate 2e-4 con scheduler coseno, optimizador adamw_8bit y weight decay 0,01, lo que da 2.500 pasos en una época. La pérdida pasó de 0,091 a 0,074 (−18,7 %), con media de 0,079. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en dialecto árabe egipcio (masri), incluyendo saludos, charla informal, humor e idiomatismos.
- Comprensión y respuesta en árabe estándar y en inglés, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Conversación multi-turno con plantilla de chat `qwen-2.5` y roles user/assistant.
- Atención al cliente e instrucciones en registro coloquial egipcio, una de las categorías del dataset de entrenamiento.
- Explicación de expresiones y refranes egipcios (por ejemplo, «عيش وملح»).
- Capacidades generales del modelo base (razonamiento básico, código, matemáticas elementales) potencialmente degradadas por el ajuste fino, no evaluadas por el autor.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Chatbots de atención al cliente en Egipto: el modelo puede mantener conversaciones multi-turno en registro coloquial con una ventana de hasta 32.768 tokens, adecuado para negocios que atienden a usuarios que escriben en masri y no en árabe estándar.
- Asistentes conversacionales en redes sociales: su entrenamiento en humor, expresiones y cultura egipcia (65 % del dataset entre estas categorías) lo hace apropiado para respuestas con tono natural en plataformas donde predomina el dialecto.
- Despliegue en hardware limitado: con 1,5B parámetros y unos 1,2 GB de VRAM en 4 bits, puede ejecutarse en una única T4 o en entornos edge, útil para startups egipcias sin acceso a A100.
- Aplicaciones educativas de árabe dialectal: puede usarse para explicar expresiones y refranes egipcios a estudiantes o para practicar conversación en masri.
- Prototipado rápido de producto conversacional: al ser un modelo pequeño con licencia Apache 2.0, sirve para validar ideas de chatbot antes de invertir en modelos mayores.
- Filtrado y normalización de texto dialectal: puede emplearse como generador de pares pregunta-respuesta en masri para aumentar datasets de entrenamiento de otros sistemas.
- Base para ajustes posteriores: al derivar de Qwen2.5-1.5B-Instruct con LoRA documentado, es un punto de partida para fine-tuning adicional en dominios específicos del dialecto egipcio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente métricas internas: pérdida de entrenamiento de 0,079 (de 0,091 a 0,074 en una época) y una revisión interna de 100 prompts evaluada por 3 hablantes nativos con 4,6/5 en fluidez dialectal egipcia, que el propio autor califica como piloto interno y no como benchmark independiente.

| Metrica | Valor | Naturaleza |
|---|---|---|
| Pérdida de entrenamiento (media) | 0,079 | Interna, una época |
| Pérdida inicial → final | 0,091 → 0,074 (−18,7 %) | Interna |
| Fluidez dialectal (100 prompts, 3 nativos) | 4,6/5 | Revisión interna, no independiente |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en cuantización de 4 bits según el autor; alrededor de 3 GB en bfloat16 (pesos de 2,9 GB más overhead).
- GPU recomendadas: NVIDIA T4 (el autor valida inferencia en una sola T4), así como A100 o H100 para mayor throughput.
- GPU de consumo: cabe en tarjetas con 4 GB o más de VRAM en 4 bits (por ejemplo, RTX 3050, RTX 4060); en 16 bits requiere unos 4-6 GB, por lo que también entra en RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: transformers (formato safetensors), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no están documentados en la información disponible, aunque al ser un modelo Qwen2 estándar podría convertirse a GGUF.
- Latencia y throughput: no disponibles. El autor solo indica que el entrenamiento con Unsloth fue 2 veces más rápido en Kaggle T4 x2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MasryGPT Chat (este modelo) | 1,54B | 32.768 (entrenado a 2.048) | Dialecto egipcio, chat | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 | Instrucciones generales, multilingüe | Apache 2.0 | Hugging Face |
| Jais (familia) | 7B y 13B (según variante) | no disponible en esta ficha | Árabe-inglés | no disponible en esta ficha | Hugging Face |
| AceGPT | no disponible en esta ficha | no disponible en esta ficha | Árabe | no disponible en esta ficha | Hugging Face |

La comparación cuantitativa de rendimiento con Jais o AceGPT no está disponible: el autor no publica benchmarks frente a ellos, y solo los cita en la motivación como modelos optimizados para árabe estándar. Frente a su base Qwen2.5-1.5B-Instruct, la diferencia es el ajuste en dialecto egipcio, a costa de posibles pérdidas en capacidades generales no evaluadas.

## Limitaciones y advertencias

- Los resultados de calidad son un piloto interno del autor, no una evaluación independiente; la puntuación de 4,6/5 procede de 3 hablantes nativos y 100 prompts.
- El dataset de entrenamiento es sintético (80.000 ejemplos generados a partir de un léxico), lo que puede introducir artefactos y repetitividad no medidos.
- Riesgo de alucinación y de degradación de capacidades generales (razonamiento, código, matemáticas) tras el ajuste fino; no hay evaluación al respecto.
- El contexto efectivo de entrenamiento es de 2.048 tokens; aunque soporta 32.768 por RoPE, el rendimiento más allá de 2.048 no está validado.
- Cobertura limitada a árabe egipcio y, por herencia, árabe estándar e inglés; otros dialectos árabes no están contemplados.
- Sesgos no evaluados: el dataset se filtró manualmente para eliminar vulgarismos, pero no se documenta un análisis de sesgos de género, religión o política.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que se aplica además la licencia de Qwen; conviene revisar los términos del modelo base antes de producción.
- El nombre del repositorio (`MasryGPT_chat_FINALLY`) se mantiene por compatibilidad; el título recomendado es MasryGPT Chat, lo que puede generar confusión en búsquedas.
- No hay documentación sobre tool calling, agentes ni cuantizaciones GGUF listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ISLAM-PO/MasryGPT_chat_FINALLY
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Notebook de prueba citado en la model card: `MasryGPT_Chat_Test.ipynb` (en el repositorio del modelo)
- Guía de pruebas citada en la model card: `TESTING.md` (en el repositorio del modelo)
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper, blog o demo adicionales: no disponible
