# Kausp11/querylm-wiki-360m

## Resumen

QueryLM 360M (Wikipedia) es un modelo de lenguaje base de 361,8 millones de parámetros entrenado desde cero por el autor independiente Kausp11 sobre texto de la Wikipedia en inglés. Su particularidad no es el tamaño, sino el preentrenamiento: durante el entrenamiento se insertaron bloques de búsqueda en el texto (una consulta generada más un pasaje recuperado) en posiciones donde una consulta habría ayudado a predecir lo siguiente. El modelo aprendió así a formular consultas de búsqueda y a utilizarlas como contexto, aunque nunca genera los pasajes: los aporta el llamador mediante su propio recuperador.

La arquitectura sigue la configuración de SmolLM2-360M (32 capas, anchura 960, 15 cabezas de atención), con una longitud de contexto de 4.096 tokens y vocabulario de 49.156 tokens (el tokenizador de SmolLM2 más cuatro tokens especiales para delimitar consultas y respuestas). Se carga con `transformers` estándar como `LlamaForCausalLM`, sin código personalizado, lo que facilita su integración en pipelines existentes.

Es relevante ahora porque explora una vía poco común en modelos pequeños: internalizar el uso de recuperación durante el preentrenamiento en lugar de añadirla a posteriori mediante prompting o fine-tuning. El modelo se publica como base (solo preentrenamiento); existe una versión con fine-tuning conversacional (`Kausp11/querylm-wiki-360m-sft-search`) y un baseline de cómputo equivalente entrenado sin bloques de búsqueda que aún no está publicado. No se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (configuración SmolLM2-360M: 32 capas, anchura 960, 15 cabezas), `LlamaForCausalLM` |
| Parámetros totales | 361.824.960 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; compatible con cuantización estándar de `transformers`/llama.cpp, no verificada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `8d5750a5f80cc257235e03339c7c94cdb5f53ea0ccce4101ed71aba788431187`) |
| Vocabulario | 49.156 tokens (tokenizador SmolLM2 + 4 tokens de búsqueda) |
| Tokens especiales | `<WEB_QUERY>` (49152), `</WEB_QUERY>` (49153), `<WEB_RESPONSE>` (49154), `</WEB_RESPONSE>` (49155) |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con la configuración de SmolLM2-360M, entrenado desde cero (no es un fine-tuning de SmolLM2). La innovación está en el formato del texto de entrenamiento: en posiciones donde una búsqueda ayudaría a predecir el texto siguiente, se inserta un bloque `…texto<WEB_QUERY>consulta</WEB_QUERY> <WEB_RESPONSE>pasaje</WEB_RESPONSE> texto continúa…`. La función de pérdida cubre el texto, la consulta y las etiquetas de consulta, pero no las etiquetas de respuesta ni el pasaje, de modo que el modelo aprende a escribir consultas y a usar pasajes, pero no a generarlos.

Los datos de preentrenamiento son 4.885.877 artículos de Wikipedia en inglés (54.582 adicionales reservados para evaluación), anotados con bloques de búsqueda por un modelo anotador afinado (Gemma 4 E4B-it con un adaptador LoRA). El anotador marca posiciones con probabilidad de inserción de al menos 0,05 y separación mínima de 40 caracteres, y escribe consultas de como máximo 24 tokens. Los pasajes provienen de recuperación BM25 sobre el corpus web público Sphere y se acortan mediante limpieza extractiva; una inserción solo se conserva si el pasaje solapa el texto posterior del documento (ROUGE-1 F1 de al menos 0,1 contra los siguientes 260 caracteres).

El entrenamiento usó AdamW con LR pico de 5e-4 y weight decay 0,1, lotes de 256 secuencias de 4.096 tokens (1.048.576 tokens por actualización), calentamiento del 2 % y decaimiento coseno hasta cero durante 4 épocas. El presupuesto total fue de 31.860 actualizaciones, 33,4 mil millones de tokens procesados (16,0 mil millones de tokens de documento) y 6,31e19 FLOPs en bf16. El checkpoint publicado corresponde al paso 31.860 de 31.860 (final de la época 4).

## Capacidades

- Generación de texto causal en inglés como cualquier modelo de lenguaje.
- Formulación de consultas de búsqueda: escribe consultas de hasta 24 tokens dentro de `<WEB_QUERY>…</WEB_QUERY>`.
- Uso de pasajes recuperados: incorpora el contenido de `<WEB_RESPONSE>…</WEB_RESPONSE>` para continuar la generación.
- Aprendizaje en contexto mediante ejemplos few-shot con bloques de búsqueda para fijar el formato pregunta-respuesta.
- Funcionamiento sin búsqueda: puede usarse como modelo causal convencional (con `bad_words_ids` para bloquear la apertura de consultas).
- No dispone de formato de chat nativo (es un modelo base); el fine-tuning conversacional está en un repositorio aparte.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre recuperación aumentada integrada en preentrenamiento: sirve para estudiar si un modelo pequeño aprende a formular consultas útiles y a explotar pasajes, comparándolo con el baseline de cómputo equivalente (aún no publicado).
- Prototipos de pipelines RAG con modelo pequeño: el flujo de tres pasos (el modelo escribe la consulta, el recuperador devuelve un pasaje, el modelo continúa) permite montar un sistema de respuesta abierta sobre un índice BM25 propio con un modelo de 361,8 M de parámetros que cabe en CPU.
- Experimentos de destilación y currículo de entrenamiento: el formato de bloques de búsqueda con pérdida selectiva (sin pérdida en pasajes) es un patrón reutilizable para entrenar modelos que delegen la recuperación en un componente externo.
- Evaluación de calidad de consultas generadas: el modelo puede usarse como generador de consultas para medir la calidad de la formulación de búsquedas en dominios de conocimiento enciclopédico.
- Docencia y divulgación: su tamaño reducido y su carga con `transformers` estándar lo hacen adecuado para demostrar en clase cómo se entrena y se usa un modelo con recuperación integrada.
- Base para fine-tuning posterior: al ser un modelo base sin formato de chat, sirve como punto de partida para adaptaciones supervisadas (el autor ya publica una versión SFT con búsqueda).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán más adelante. El único ejemplo de ejecución incluido en la model card (consulta generada: «Jane Austen Pride and Prejudice capital Australia answer»; respuesta: «The capital of Australia») demuestra la mecánica del flujo, no la precisión del modelo, y el propio autor lo advierte.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 0,7 GB de pesos más memoria de activaciones y caché KV; en cuantización de 8 bits, en torno a 0,4 GB; en 4 bits, en torno a 0,2 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo y también en CPU: el ejemplo de la model card se ejecutó en CPU con bfloat16, torch 2.8.0 y transformers 4.56.0.
- Opciones de despliegue: `transformers` (soporte nativo, sin código personalizado), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están verificados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QueryLM 360M (Wikipedia) | 361,8 M | 4.096 | Preentrenamiento con bloques de búsqueda insertados | no disponible | Hugging Face (`Kausp11/querylm-wiki-360m`) |
| SmolLM2-360M | 361,8 M (misma configuración) | no disponible en la información proporcionada | Preentrenamiento estándar sobre texto plano | no disponible en la información proporcionada | Hugging Face (HuggingFaceTB) |
| Baseline de cómputo equivalente de QueryLM | misma arquitectura y cómputo | 4.096 | Texto plano sin bloques de búsqueda | no disponible | No publicado aún según la model card |

La comparación con SmolLM2-360M es pertinente porque QueryLM adopta su configuración exacta (32 capas, anchura 960, 15 cabezas) y su tokenizador, pero se entrena desde cero; no se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin formato de chat: no sigue instrucciones de forma fiable sin ejemplos few-shot que fijen el formato.
- Solo inglés; no se ha validado su comportamiento en otros idiomas.
- El modelo no genera pasajes: la calidad de la respuesta depende por completo del recuperador externo que aporte el pasaje.
- Riesgo de alucinación: al ser un modelo de 361,8 M entrenado sobre Wikipedia, puede producir afirmaciones incorrectas, especialmente cuando el pasaje recuperado no cubre la pregunta.
- El ejemplo incluido en la model card produce una respuesta truncada («The capital of Australia»), lo que ilustra la fragilidad del formato sin ajuste fino.
- No se han publicado evaluaciones cuantitativas; no hay evidencia pública de su precisión frente a alternativas.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- El corpus de entrenamiento (Wikipedia en inglés) introduce los sesgos propios de esa fuente y de la cobertura enciclopédica occidental.
- La ventana de contexto es de solo 4.096 tokens, lo que limita conversaciones o documentos largos.
- La fecha de creación del repositorio (2026-11-19) y el uso de un anotador «Gemma 4 E4B-it» deben tratarse con cautela: no hay verificación independiente de estos detalles en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-wiki-360m
- Versión con fine-tuning conversacional: https://huggingface.co/Kausp11/querylm-wiki-360m-sft-search
- Checkpoints alternativos (mismos pesos, subcarpeta `search/ep4`): https://huggingface.co/Kausp11/wiki6m-360m-v2-ckpts
- Corpus web Sphere (recuperación de pasajes): https://github.com/facebookresearch/Sphere
- Repositorio de SmolLM2 (configuración y tokenizador de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
