# BG4JEC/Xiaoheimao-Qwen3.8-27B-abliterated

## Resumen

Xiaoheimao-Qwen3.8-27B-abliterated es un ajuste fino mediante LoRA del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, desarrollado por el usuario BG4JEC. El objetivo declarado es producir un modelo de conversación con estilo de chat de grupo (群聊), entrenado sobre 19.130 muestras de alta densidad de conversaciones grupales combinadas con un motor de frases hechas denominado Repeater, que no emplea IA y funciona por asociación de palabras clave. El modelo se distribuye principalmente como un GGUF cuantizado en IQ4_XS de 14,48 GiB, pensado para ejecutarse en una única GPU Tesla V100 de 16 GB.

El modelo parte de la arquitectura Qwen3 de 27B parámetros (según la nomenclatura del autor, "Qwen3.8"), si bien la model card no detalla la arquitectura interna, la longitud de contexto nativa ni la composición del corpus original. El ajuste se realizó en BF16 con LoRA de rango 32 y alpha 64, entrenando únicamente el 0,8025 % de los parámetros, durante 598 pasos con MAX_SEQ_LEN de 512 y el modo thinking desactivado en todo momento.

Su relevancia es acotada y muy específica: no compite en benchmarks generales de razonamiento o código, sino que se posiciona como un modelo de rol y conversación grupal sin censura, con un ecosistema de inferencia propio (llama-server, un responder híbrido en Python y una memoria de frases hechas de un grupo concreto). La licencia Apache 2.0 y la disponibilidad de pesos en formato GGUF facilitan su despliegue, aunque el repositorio de Hugging Face solo contiene 0,9 GB, por lo que los pesos completos se alojan en ModelScope.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (detalle interno no disponible); ajuste fino con LoRA |
| Parametros totales | 27B (según nomenclatura del autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en la configuración de despliegue recomendada; el autor menciona poder alcanzar 16K-32K recuantizando a IQ3_M/Q3_K_M, sin especificar el máximo nativo |
| Tipos de cuantizacion | IQ4_XS (principal, 14,48 GiB); recuantización sugerida a IQ3_M o Q3_K_M (~12,5 GiB) |
| Idiomas soportados | no disponible (el corpus de entrenamiento y los ejemplos están en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (IQ4_XS); pesos grandes alojados en ModelScope |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre huihui-ai/Huihui-Qwen3.8-27B-abliterated, un modelo base ya "abliterated" (es decir, con los mecanismos de rechazo atenuados). El entrenamiento se ejecutó en Google Colab sobre una NVIDIA A100-SXM4-80GB en precisión BF16, con LoRA de rango 32 y alpha 64, lo que supone 0,8025 % de parámetros entrenables. El conjunto de datos consta de 19.130 muestras de conversaciones grupales de alta densidad fusionadas con frases hechas del motor Repeater; se realizaron 598 pasos con MAX_SEQ_LEN de 512 y el modo `<think>` desactivado durante todo el proceso.

La pérdida de validación pasó de 5,6527 en la línea base a 3,9568 al final (train_loss 3,8977). La innovación técnica destacable no está en la arquitectura del transformer, sino en el sistema de inferencia que acompaña al modelo: un motor Repeater no basado en IA, portado del plugin `repeater` de Pallas-Bot, que recupera frases hechas del grupo mediante palabras clave extraídas con jieba y una cola de temas recientes, con latencias de 0,11-0,20 ms por consulta, y que se inyecta en el prompt de sistema para guiar el estilo. El autor reporta una evaluación ciega de 100 preguntas sin fuga de datos en cinco dimensiones, comparada con una línea base de miembros reales del grupo (P50 = 8,0 caracteres, P90 = 18,0 caracteres, 21,0 % de acierto de jerga).

## Capacidades

- Generación de texto conversacional en estilo de chat de grupo, con respuestas cortas (P50 de 7 caracteres en la evaluación del autor).
- Roleplay y conversación sin censura, heredada del modelo base abliterated.
- Uso de jerga y frases hechas específicas del grupo mediante recuperación Repeater (31-32 % de acierto de jerga en la evaluación del autor).
- Tres modos de inferencia: `pure_llm` (modelo directo), `repeater_rag` (recuperación de frases hechas en el prompt) e `hybrid_intermittent` (seguimiento de olas de repetición con 0 tokens, inserción de frases originales con probabilidad del 15 % cuando la frase tiene count >= 5, y división de respuestas en burbujas cortas).
- Capacidad de romper el hielo en conversaciones frías (`cold_group_speak`).
- Soporte de plantilla de chat Jinja con `enable_thinking` desactivable mediante `--chat-template-kwargs`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible.
- Visión, audio o modo thinking activo: no disponible (el thinking se desactiva explícitamente en entrenamiento y despliegue).

## Casos de uso

- Simulación de comunidad y chat de grupo: el modelo se conecta a un servidor compatible con la API de OpenAI (`llama-server`) y responde en estilo de grupo, con respuestas cortas y jerga recuperada del motor Repeater, adecuado para bots de comunidades de mensajería.
- Roleplay y narrativa interactiva sin restricciones de contenido: al derivar de un modelo abliterated, permite escenarios de ficción y personajes que los modelos alineados rechazarían; útil en entornos controlados de escritura creativa.
- Prototipado de bots de mensajería en hardware modesto: el GGUF IQ4_XS de 14,48 GiB cabe en una Tesla V100 de 16 GB con KV cache q8_0 y contexto de 4096, lo que permite desplegar un modelo de 27B en infraestructura de gama relativamente antigua.
- Investigación sobre estilos conversacionales: el par modelo + Repeater + evaluación ciega de cinco dimensiones sirve como base reproducible para estudiar cómo la recuperación de frases hechas afecta al estilo generado (el autor reporta 0 % de copia literal y 0 % de tasa de sermón).
- Generación de respuestas en burbujas múltiples para interfaces de chat: el modo `hybrid_intermittent` divide respuestas con comas en varios mensajes cortos, imitando el ritmo de un grupo real.
- Moderación ligera y seguimiento de tendencias: la cola de temas recientes y el conteo de frases (count >= 5) permiten detectar y replicar olas de repetición dentro de una comunidad, con seguimiento a coste cero de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación reportada es una prueba ciega propia del autor de 100 preguntas sin fuga de datos, en cinco dimensiones, frente a una línea base de miembros reales del grupo:

| Metrica | Linea base (miembros reales) | pure_llm | repeater_rag |
|---|---|---|---|
| P50 longitud de respuesta (caracteres) | 8,0 | 7,0 | 7,0 |
| P90 longitud de respuesta (caracteres) | 18,0 | 15,0 | 14,0 |
| Acierto de jerga del grupo | 21,0 % | 31,0 % | 32,0 % |
| Tasa de sermón tipo IA | no disponible | 0,0 % | 0,0 % |
| Alucinación multlínea | no disponible | 0,0 % | 0,0 % |
| Tasa de copia literal del prompt | no disponible | no disponible | 0,0 % |
| Tasa de deduplicación | no disponible | 100 % | no disponible |

Datos de entrenamiento reportados: eval_loss 5,6527 → 3,9568; train_loss 3,8977; 598 pasos; 19.130 muestras.

## Requisitos de hardware

- VRAM estimada: 14,48 GiB para el GGUF IQ4_XS con contexto de 4096 y KV cache q8_0, según la configuración del autor; ~12,5 GiB si se recuantiza a IQ3_M o Q3_K_M.
- GPU recomendada por el autor: Tesla V100 de 16 GB (caso de uso validado). No se documentan pruebas en otras GPU.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 (24 GB) ni con tarjetas de 16 GB de consumo; por tamaño, un GGUF de 14,48 GiB podría caber en 24 GB, pero no hay datos del autor.
- Opciones de despliegue: `llama-server` (llama.cpp) con `-ngl 99`, `-fa on`, `-ctk q8_0 -ctv q8_0`, `-c 4096 -np 1 -b 512`, `--jinja` y `--chat-template-kwargs '{"enable_thinking":false}'`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles para el modelo; el motor Repeater reporta 0,11-0,20 ms por consulta de recuperación.
- Dependencias del responder: `jieba`, `pypinyin`, `openai`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaoheimao-Qwen3.8-27B-abliterated | 27B (LoRA) | 4096 en despliegue recomendado | Chat de grupo + Repeater, sin censura | Apache 2.0 | GGUF IQ4_XS en HF/ModelScope |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base) | 27B | no disponible | Modelo abliterated general | no disponible en la información | HF |
| Qwen3 27B (familia original) | 27B | no disponible en la información | Modelo generalista | no disponible en la información | HF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- El modelo deriva de un base abliterated: los mecanismos de rechazo están atenuados, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o no seguro en producción.
- Entrenado exclusivamente sobre conversaciones de un grupo concreto en chino; el estilo, la jerga y el motor Repeater están ligados a ese contexto y no generalizan a otros idiomas o comunidades (idiomas soportados no declarados).
- Longitud de contexto efectiva limitada a 4096 tokens en la configuración recomendada; el entrenamiento usó MAX_SEQ_LEN de 512, por lo que el rendimiento más allá de esa longitud no está validado.
- Riesgo de alucinación: el autor reporta 0 % de alucinación multlínea en su prueba ciega, pero esta métrica es específica de su evaluación y no cubre alucinación factual general.
- Las respuestas muy cortas (P50 de 7 caracteres) lo hacen inadecuado para tareas que requieran explicaciones largas, razonamiento complejo o generación de código.
- No hay evidencia de soporte de tool calling, agentes o multimodalidad; no debe asumirse.
- El repositorio de Hugging Face contiene solo 0,9 GB; los pesos GGUF y LoRA completos se alojan en ModelScope, lo que añade una dependencia externa para la descarga.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin censura recae en el desplegador.
- Sin descargas ni likes en el momento de la consulta y sin pipeline declarado: madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/BG4JEC/Xiaoheimao-Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Informe de entrenamiento y Repeater (referenciado en la model card): `outputs/TRAINING_AND_REPEATER_REPORT.md`
- Script de entrenamiento: `colab/train_qwen38.py`
- Script de evaluación: `colab/run_eval_benchmark.py`
- Scripts de exportación GGUF: `colab/export_gguf.py`, `colab/export_gguf.sh`
- Respondedor híbrido: `inference/xiaoheimao_responder.py`
- Memoria Repeater: `outputs/repeater_memory_834513952.json`
- Resultados de benchmark: `outputs/benchmark_iter1.json`, `outputs/eval_samples.json`
- Pesos GGUF y LoRA: alojados en ModelScope (enlace directo no disponible en la información proporcionada)
