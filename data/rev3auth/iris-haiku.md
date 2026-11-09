# Rev3auth/iris-haiku

## Resumen

Iris-haiku es una conversión al formato GGUF de un modelo de la familia LFM2, concretamente el checkpoint identificado en el repositorio como LFM2.5-1.2B-Thinking. El modelo original pertenece a Liquid AI (la familia LFM, "Liquid Foundation Models"), mientras que esta publicación concreta la firma el usuario Rev3auth y se ha generado con la herramienta Unsloth. El repositorio contiene un único archivo cuantizado en Q4_K_M, pensado para su uso directo con llama.cpp y con la CLI `llama-cli`.

Se trata de un modelo pequeño, de aproximadamente 1.170 millones de parámetros, orientado a conversación y con un modo de razonamiento explícito ("Thinking") según la nomenclatura del archivo de pesos. Su relevancia práctica está en que permite ejecutar un LLM conversacional en hardware muy modesto (CPU o GPU de gama baja) gracias a la cuantización de 4 bits y a un tamaño de repositorio de apenas 0,7 GB.

La información publicada por el autor es mínima: no hay model card descriptiva, ni licencia declarada, ni idiomas, ni datos de entrenamiento o benchmarks. Todo lo que se detalla a continuación proviene de los metadatos del repositorio y de la nomenclatura del archivo, y se marca explícitamente como "no disponible" aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2 de Liquid AI; detalles no publicados en el repo) |
| Parámetros totales | 1.170.340.608 (dato de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `LFM2.5-1.2B-Thinking.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en este repositorio. Por la nomenclatura del checkpoint (`LFM2.5-1.2B-Thinking`) se infiere que deriva de la familia LFM2 de Liquid AI, pero el autor de la conversión no documenta capas, tipo de atención, composición del dataset, número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Tampoco se detalla qué proceso de alineación produce el modo "Thinking".

La única innovación técnica documentada en el repositorio es el propio proceso de conversión: se ha utilizado Unsloth para generar el GGUF, y el resultado es compatible con llama.cpp mediante las etiquetas `llama.cpp` y `llama-cpp`. No consta información sobre decodificación especulativa, atención lineal ni otras optimizaciones del modelo base.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la denominación "Thinking" apuntan a un uso de diálogo con razonamiento paso a paso, aunque no hay documentación que lo confirme.
- Razonamiento explícito: el sufijo "Thinking" del checkpoint sugiere un modo de cadena de pensamiento, sin detalles publicados sobre su activación o formato.
- Compatibilidad con llama.cpp: se puede ejecutar con `llama-cli -hf Rev3auth/iris-haiku --jinja`, lo que habilita plantillas de chat vía Jinja.
- Compatibilidad multimodal declarada en la model card: se menciona `llama-mtmd-cli` como opción para modelos multimodales, pero no se confirma que este checkpoint concreto tenga capacidades de visión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): únicamente el posible modo "Thinking" inferido del nombre; sin confirmación documental.

## Casos de uso

- Prototipado local en portátil: al ocupar 0,7 GB en Q4_K_M, el modelo se puede cargar en un equipo sin GPU dedicada mediante llama.cpp, lo que permite validar flujos conversacionales antes de escalar a modelos mayores.
- Asistente de chat embebido en aplicaciones de escritorio: la CLI `llama-cli` con `--jinja` permite integrar el modelo como backend conversacional en herramientas locales sin dependencia de la nube.
- Pruebas de pipelines de razonamiento: el modo "Thinking" del checkpoint permite experimentar con cadenas de razonamiento en un modelo de 1,2B parámetros, útil para comparar coste y calidad frente a modelos mayores.
- Entornos con recursos restringidos: despliegue en dispositivos edge, contenedores pequeños o máquinas virtuales de 1-2 GB de RAM, donde un modelo de 7B no cabría.
- Evaluación comparativa de cuantizaciones: al ser un GGUF Q4_K_M, sirve como referencia para medir la pérdida de calidad frente al modelo original en tareas de conversación.
- Base para fine-tuning ligero: al ser un modelo de 1,2B parámetros, es viable adaptarlo con LoRA en una única GPU consumer para dominios específicos, partiendo del checkpoint original de Liquid AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,7-1,0 GB para el archivo Q4_K_M, más overhead de contexto y de la propia librería llama.cpp (típicamente 1-2 GB en total).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona íntegramente en CPU.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión Ollama si se importa el GGUF; compatible con el ecosistema `endpoints_compatible` indicado en los tags.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto, que tampoco se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Iris-haiku (LFM2.5-1.2B-Thinking Q4_K_M) | 1,17B | no disponible | no disponible | GGUF | Hugging Face (Rev3auth) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según model card oficial) | Apache 2.0 (según model card oficial) | safetensors, GGUF | Hugging Face (Qwen) |
| Llama 3.2 1B Instruct | 1,2B | 128K (según model card oficial) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (Meta) |
| Gemma 2 2B IT | 2,6B | 8K (según model card oficial) | Gemma Terms of Use | safetensors, GGUF | Hugging Face (Google) |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados para Iris-haiku que permitan contrastar calidad. Los datos de los modelos alternativos provienen de sus model cards oficiales y pueden variar según la versión.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan sesgos, datos de entrenamiento, idiomas ni comportamiento esperado, lo que dificulta evaluar riesgos.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo original de Liquid AI antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a modelos de 1,2B parámetros; la capacidad de razonamiento y la fidelidad factual serán limitadas en comparación con modelos mayores.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación de información extensa.
- Idiomas no confirmados: no consta qué idiomas soporta; el uso en castellano no está verificado.
- Modo "Thinking" sin documentación: se desconoce cómo se activa, qué formato de salida produce y si requiere una plantilla de chat específica.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros; conviene tratar el checkpoint como no probado.
- Fecha de creación futura en los metadatos (2026-11-09): inconsistencia que sugiere posibles errores en la publicación; verificar la integridad del archivo antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rev3auth/iris-haiku
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible): https://github.com/ggml-org/llama.cpp
- Liquid AI (familia LFM, modelo base presumible): https://www.liquid.ai/
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
