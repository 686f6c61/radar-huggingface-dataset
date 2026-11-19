# 0kkinexi/O2-Pro-adapter

## Resumen

O2-Pro-adapter es un adaptador PEFT (LoRA/QLoRA) publicado por el usuario 0kkinexi bajo el nombre comercial "O2 Pro Chat — 0kkiAI". No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (adapter_config.json y model.safetensors, 0,4 GB) que debe aplicarse sobre la base Qwen3-8B (licencia Apache-2.0) mediante `merge_and_unload` o carga dinámica con PEFT. El propósito declarado es el ajuste fino de conversación en turco sobre dicha base.

El método de entrenamiento indicado en la model card es QLoRA con rango 32 y alpha 64 sobre cuantización 4-bit NF4, empleando una mezcla de datos privada ("O2 derlemi") y tres conjuntos públicos: Marul-SFT-TR (Apache-2.0), Turkish Atlas (MIT) y turkish-chat-sft-v3 (Apache-2.0). La información publicada es mínima: no hay pipeline declarado, ni idiomas etiquetados, ni licencia especificada para el adaptador, ni resultados de evaluación.

Su relevancia es limitada y de nicho: se trata de un adaptador comunitario sin tracción (0 descargas, 0 likes en el momento de la consulta) orientado exclusivamente al turco conversacional. Resulta útil como ejemplo de flujo QLoRA sobre Qwen3-8B y como punto de partida para experimentación con ajuste de instrucciones en turco, pero no dispone de evidencia pública de calidad que justifique su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA/QLoRA) sobre base transformer Qwen3-8B |
| Parametros totales | No disponible para el adaptador (0,4 GB de pesos); la base Qwen3-8B tiene 8 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada de Qwen3-8B, no confirmada) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); el adaptador se distribuye en safetensors; se menciona exportación a GGUF mediante llama.cpp |
| Idiomas soportados | Turco (objetivo declarado); no hay etiquetado oficial de idiomas en el repo |
| Licencia | No disponible para el adaptador; la base Qwen3-8B es Apache-2.0 |
| Formato de pesos | safetensors (adapter_config.json + model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-8B, un transformer denso de 8 mil millones de parámetros, mediante QLoRA: la base se cuantiza a 4-bit NF4 y se entrenan matrices de bajo rango con r=32 y alpha=64. El repositorio solo contiene los pesos del adaptador, no los pesos fusionados, por lo que el despliegue requiere aplicar `merge_and_unload` con PEFT o cargar el adaptador en tiempo de inferencia junto a la base.

La composición de datos declarada combina un corpus privado ("O2 derlemi") con tres conjuntos públicos de instrucciones y chat en turco: Marul-SFT-TR (Apache-2.0), Turkish Atlas (MIT) y turkish-chat-sft-v3 (Apache-2.0). No se especifican el número de tokens de entrenamiento, la proporción entre conjuntos, la existencia de fases de RLHF/DPO, hiperparámetros de optimización ni la configuración de precisión mixta. La model card indica que la fusión y la conversión a GGUF requieren una máquina con al menos 17 GB de RAM, dato coherente con la fusión de un adaptador sobre una base de 8B en precisión reducida.

## Capacidades

- Generación de texto conversacional en turco, orientada a diálogo multi-turno según el propósito declarado del ajuste.
- Instrucciones y respuesta a preguntas en turco, derivadas de los conjuntos SFT empleados (Marul-SFT-TR, Turkish Atlas, turkish-chat-sft-v3).
- Herencia de las capacidades de la base Qwen3-8B (razonamiento, código, matemáticas, multilingüismo), si bien el ajuste puede degradar el rendimiento en idiomas distintos del turco; no hay evaluación publicada que lo confirme.
- Soporte de tool calling y function calling: no disponible de forma específica para el adaptador; depende de la base y no está documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; la base Qwen3-8B es texto y el adaptador no añade modalidades.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el adaptador puede cargarse sobre Qwen3-8B con PEFT para evaluar rápidamente la calidad del ajuste en diálogos de dominio general antes de invertir en un entrenamiento propio.
- Experimentación académica con QLoRA: sirve como referencia reproducible de un pipeline de ajuste r=32/alpha=64 en 4-bit NF4 sobre una base de 8B, útil para comparar hiperparámetros y mezclas de datos en turco.
- Generación de respuestas de atención al cliente en turco para pruebas internas: permite montar un prototipo de chat multi-turno y medir con anotadores propios la adecuación del tono y la corrección lingüística.
- Ajuste incremental sobre dominio propio: al ser un adaptador separado, puede combinarse o sustituirse por otros adaptadores LoRA para especializar la base en un vertical concreto (por ejemplo, soporte técnico) sin reentrenar el modelo completo.
- Investigación sobre mezcla de datos SFT: la combinación declarada de tres conjuntos públicos permite estudiar el efecto de distintas proporciones en la calidad del turco generado.
- Despliegue ligero en CPU con llama.cpp: tras fusionar y convertir a GGUF, puede ejecutarse en equipos con 17 GB o más de RAM para demos y pruebas de humo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas en turco, y el repositorio no contiene informes de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Como referencia para la base Qwen3-8B: en FP16 requiere aproximadamente 16 GB de VRAM; en 8-bit, unos 9-10 GB; en 4-bit, unos 5-6 GB, a lo que se suma una sobrecarga mínima del adaptador.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia en FP16; RTX 4090 (24 GB) o L40S para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para 8-bit; GPUs de 8 GB para 4-bit con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantización 4-bit, siempre que se respete la ventana de contexto efectiva.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador sin fusionar; `merge_and_unload` para obtener un modelo completo; vLLM o TGI tras la fusión; llama.cpp/Ollama mediante exportación a GGUF (el autor indica que requiere al menos 17 GB de RAM para la fusión y conversión).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| O2-Pro-adapter | Adaptador sobre 8B | No disponible | QLoRA conversacional en turco | No disponible (base Apache-2.0) | Hugging Face, 0 descargas |
| Qwen3-8B (base) | 8B | No confirmado en esta ficha | Modelo generalista multilingüe | Apache-2.0 | Amplia, oficial |
| Adaptadores SFT en turco de la comunidad (p. ej. sobre Marul-SFT-TR) | Variable, típicamente 7-8B | Depende de la base | Ajuste de instrucciones en turco | Apache-2.0 en varios casos | Hugging Face |
| Modelos turcos dedicados de mayor tamaño (p. ej. familia Cosmos/Trendyol) | 7B-13B | Depende de la variante | LLM preentrenado o ajustado en turco | Varía según modelo | Hugging Face |

La comparación directa es limitada: no hay métricas públicas del adaptador, su licencia no está declarada y su adopción es nula en el momento de la consulta. Frente a la base Qwen3-8B, el adaptador solo aporta valor si el objetivo es el turco conversacional; frente a otros adaptadores turcos, la diferencia de calidad es indeterminable sin evaluación.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con la base, por lo que no puede afirmarse que el ajuste mejore al modelo original.
- Licencia del adaptador no declarada: la base es Apache-2.0, pero los términos de uso comercial del adaptador no están especificados; es necesario contactar con el autor antes de usarlo en producción.
- Datos de entrenamiento parcialmente privados ("O2 derlemi"): impide auditar la procedencia, los sesgos y los derechos sobre el corpus.
- Riesgo de olvido catastrófico y degradación multilingüe: un ajuste QLoRA intensivo en turco puede reducir el rendimiento en inglés y en otras lenguas de la base; no hay datos que cuantifiquen este efecto.
- Riesgo de alucinación: inherente a los modelos de 8B ajustados con SFT; sin RLHF/DPO documentado, la calibración y el rechazo de peticiones problemáticas no están garantizados.
- Idiomas no etiquetados oficialmente en el repositorio: el soporte de turco es una afirmación de la model card, no un dato verificado por el hub.
- Tracción nula (0 descargas, 0 likes) y fecha de creación futura en los metadatos: indicios de un artefacto reciente y sin validación por la comunidad.
- Requisito de fusión con al menos 17 GB de RAM: limita el despliegue en entornos muy restringidos si se opta por la ruta de merge y conversión a GGUF.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/0kkinexi/O2-Pro-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset Marul-SFT-TR: https://huggingface.co/datasets/MarulAI/Marul-SFT-TR
- Dataset Turkish Atlas Instruct: https://huggingface.co/datasets/AlicanKiraz0/Turkce-Atlas-Instruct
- Dataset turkish-chat-sft-v3: https://huggingface.co/datasets/serhatkagans/turkish-chat-sft-v3
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
- llama.cpp (conversión a GGUF): https://github.com/ggml-org/llama.cpp
