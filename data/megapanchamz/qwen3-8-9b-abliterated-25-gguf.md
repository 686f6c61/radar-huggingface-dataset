# MegaPanchamZ/Qwen3.8-9B-abliterated-25-GGUF

## Resumen

Qwen3.8-9B-abliterated-25-GGUF es una versión "abliterada" (con los mecanismos de rechazo suprimidos) del modelo Qwen3.8-9B, una destilación de 9.000 millones de parámetros de la serie Qwen3.8 desarrollada por el laboratorio independiente Empero. El autor, MegaPanchamZ, ha aplicado la técnica de abliteration mediante la herramienta Heretic v1.4.0, que elimina las direcciones de refusal en las capas de atención y MLP, fusionando los adaptadores LoRA resultantes en los pesos originales. El resultado se ha cuantizado a GGUF Q4_K_M para su uso eficiente con llama.cpp.

El modelo está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento (con bloque de pensamiento) que no rechace peticiones de forma predeterminada, manteniendo un bajo coste de inferencia gracias a su tamaño compacto y su cuantización. Con 8.953.803.264 parámetros y una licencia Apache-2.0, ofrece una alternativa abierta a modelos propietarios para escenarios donde la censura del modelo base es un obstáculo. La longitud de contexto no se especifica en la información disponible, pero al ser un modelo de razonamiento se recomienda un uso con generosos límites de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; basada en el modelo base empero-ai/Qwen3.8-9B (destilación de Qwen3.8, probablemente transformer denso) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada) |
| Idiomas soportados | Inglés (según etiquetas del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información proporcionada. El modelo base, empero-ai/Qwen3.8-9B, es una destilación de la serie Qwen3.8 realizada por Empero, un laboratorio alemán especializado en modelos eficientes. A partir de ese modelo, MegaPanchamZ aplicó un proceso de abliteration con Heretic v1.4.0, que identifica direcciones de rechazo en las proyecciones `attn.o_proj` y `mlp.down_proj` y las elimina mediante adaptadores LoRA de normalización por filas, fusionándolos posteriormente en los pesos base. El proceso utilizó 400 prompts de los conjuntos `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`, con 400 iteraciones de optimización y selección del trial 276 por ser Pareto-óptimo. La divergencia KL resultante frente al modelo original es de 0,0142, muy por debajo del umbral de daño de 0,5, lo que indica una mínima alteración de las capacidades generales. La cuantización a GGUF Q4_K_M se realizó con la herramienta de Unsloth sobre los pesos bf16 fusionados.

## Capacidades

- Generación de texto con modo de razonamiento: el modelo produce respuestas precedidas de un bloque `thinking`, lo que permite cadenas de pensamiento explícitas.
- Supresión de rechazos: la abliteration reduce los rechazos ante prompts dañinos de 99/100 a 25/100, manteniendo un comportamiento general similar al original (KL 0,0142).
- Procesamiento de lenguaje natural en inglés, con capacidad de seguir instrucciones y mantener conversaciones multi-turno (no confirmado explícitamente, pero implícito en su naturaleza conversacional).
- Compatible con el ecosistema llama.cpp y herramientas derivadas (Ollama, etc.) gracias a su formato GGUF.
- No se confirman capacidades de tool calling, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comportan los sistemas sin mecanismos de rechazo, facilitando la evaluación de riesgos y el desarrollo de contramedidas de moderación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que aborden temas sensibles sin que el modelo se niegue por defecto, útil para autores que necesitan explorar territorios controvertidos.
- Asistente de programación con razonamiento: su capacidad de pensar antes de responder puede ayudar a depurar código o explicar algoritmos complejos, aunque no se confirma soporte de tool calling para integración en pipelines.
- Análisis de textos académicos o periodísticos: procesamiento de documentos que contengan lenguaje ofensivo o temas tabú, donde un modelo censurado podría bloquear el análisis.
- Base para fine-tuning posterior: al estar abliterated y cuantizado, puede servir como punto de partida para ajustes en dominios específicos donde se requiera menor autocensura, reduciendo el coste de entrenamiento.
- Pruebas de estrés de sistemas de moderación: evaluar la eficacia de filtros de contenido generando entradas que un modelo estándar rechazaría, permitiendo calibrar sistemas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No obstante, la model card incluye métricas específicas de la abliteration:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos (100 prompts dañinos) | 99/100 | 25/100 |
| Divergencia KL vs. original | — | 0,0142 |

Estos datos indican una reducción significativa de los rechazos con una pérdida mínima de fidelidad respecto al modelo original, pero no hay cifras de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 5,3 GB, por lo que con overhead de contexto y caché se recomiendan al menos 7-8 GB de VRAM para uso cómodo.
- GPUs compatibles: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, o GPUs de datacenter como A10 o L4. También puede ejecutarse en CPU con suficiente RAM (16 GB o más).
- Opciones de despliegue: llama.cpp (comando `llama-server -m Qwen3.8-9B-abliterated-25.Q4_K_M.gguf -ngl 99`), Ollama (importando el GGUF), y potencialmente vLLM con soporte GGUF experimental.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del número de tokens de razonamiento generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| empero-ai/Qwen3.8-9B (original) | 8,95 B | No disponible | Apache-2.0 | Safetensors | Modelo base sin abliteration |
| Qwen3.8-9B-abliterated-25-GGUF (este) | 8,95 B | No disponible | Apache-2.0 | GGUF Q4_K_M | Abliterated, cuantizado |
| huihui-ai/Qwen3-8B-abliterated | 8 B | No disponible | Apache-2.0 | Safetensors | Abliterated de Qwen3-8B, sin cuantizar |
| Mungert/Qwen3-8B-abliterated-GGUF | 8 B | No disponible | Apache-2.0 | GGUF (varias cuantizaciones) | Abliterated de Qwen3-8B, con cuantizaciones de 1-2 bits |

No hay datos de rendimiento comparativo disponibles para estos modelos.

## Limitaciones y advertencias

- Modelo abliterated: puede generar contenido dañino, ilegal o inapropiado al haber reducido drásticamente sus mecanismos de rechazo (25/100 rechazos frente a 99/100). Su uso conlleva responsabilidad legal y ética.
- Idioma limitado: solo se confirma inglés; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se especifica, lo que puede provocar degradación en conversaciones muy largas.
- Riesgo de alucinación: no se han evaluado tasas de factualidad; como modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas.
- Requiere `max_tokens` elevados: al ser un modelo de razonamiento, las respuestas incluyen un bloque `thinking` que puede truncarse si no se configura adecuadamente.
- Posible implicación de licencia GPL: la herramienta Heretic utilizada para la abliteration está bajo GPLv3+, lo que podría generar dudas sobre la distribución del modelo resultante, aunque la model card declara Apache-2.0 para el modelo final.
- Sin soporte de herramientas ni multimodalidad: no se confirma tool calling, visión ni audio, limitando su uso en agentes complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MegaPanchamZ/Qwen3.8-9B-abliterated-25-GGUF
- Modelo base (empero-ai/Qwen3.8-9B): https://huggingface.co/empero-ai/Qwen3.8-9B
- Heretic (herramienta de abliteration): https://heretic-project.org y https://github.com/p-e-w/heretic
- Unsloth (conversión GGUF): https://github.com/unslothai/unsloth
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Empero (laboratorio del modelo base): https://empero.org/
- Otro modelo abliterated de referencia: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- GGUF abliterated de Qwen3-8B: https://huggingface.co/Mungert/Qwen3-8B-abliterated-GGUF
