# Kausp11/standard-dclm-400m-sft-search

## Resumen
El modelo `standard-dclm-400m-sft-search` es un ajuste fino supervisado (SFT) del modelo base `Kausp11/standard-dclm-400m`, desarrollado por Kausp11. Se trata de un artefacto de investigación concebido como modelo de control para estudiar el impacto del preentrenamiento aumentado con búsqueda (search-augmented pretraining). Mientras que su modelo emparejado `querylm-dclm-400m-sft-search` fue preentrenado con bloques de búsqueda, este modelo base nunca vio dichos bloques durante el preentrenamiento y los encuentra por primera vez en la fase de ajuste fino.

La arquitectura es un decoder estilo nanochat con 14 capas, anchura de 1.280, 10 cabezas de atención, feed-forward de 5.120, dimensión de cabeza 128 y una longitud de contexto de 4.095 tokens. El modelo reporta 401,2 millones de parámetros, aunque el archivo de pesos almacena 842,2 millones al incluir los embeddings de valor (value embeddings).

El modelo está entrenado exclusivamente en inglés sobre el conjunto de datos DCLM-Edu y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que permite aislar el efecto del preentrenamiento con búsqueda frente a un ajuste fino idéntico sobre datos de chat con bloques de búsqueda, sirviendo como referencia experimental para investigadores que estudian la integración de recuperación de información en modelos de lenguaje de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo nanochat (transformer) |
| Parametros totales | 842,2 M almacenados (401,2 M reportados, incluye value embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_nanochat.py` para `trust_remote_code`) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder de estilo nanochat con 14 capas, anchura de 1.280, 10 cabezas de atención, feed-forward de 5.120 y dimensión de cabeza 128. El tokenizador es el de SmolLM2 ampliado con cuatro tokens especiales para bloques de búsqueda (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), alcanzando un vocabulario de 49.156 tokens.

El preentrenamiento se realizó sobre DCLM-Edu como texto plano, con más texto de documentos que el modelo emparejado QueryLM para igualar el cómputo. Se usó el optimizador Muon para pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con un batch de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualización). El presupuesto de preentrenamiento fue de 10.100 actualizaciones, 10,6 mil millones de tokens y 3,09e19 FLOPs en bf16. El ajuste fino reanuda desde el checkpoint de preentrenamiento con su estado de optimizador, durante 33 actualizaciones de 256 secuencias (una época) sobre aproximadamente 53.000 conversaciones usuario-asistente, de las cuales el 21% incluyen bloques de búsqueda al inicio de una frase en los turnos del asistente. Las tasas de aprendizaje son 0,8 veces los picos de preentrenamiento, constantes durante la primera mitad y luego lineales a cero.

## Capacidades
- Generación de texto en inglés con formato de chat en texto plano mediante prefijos `System:`, `User:` y `Assistant:`, separados por línea en blanco.
- Generación de consultas de búsqueda delimitadas por `<WEB_QUERY>` y `</WEB_QUERY>` para que el llamador ejecute su propio recuperador.
- Integración de pasajes recuperados mediante bloques `<WEB_RESPONSE>` y `</WEB_RESPONSE>` para continuar la respuesta.
- Razonamiento multi-turno básico dentro de una ventana de contexto de 4.095 tokens.
- No dispone de plantilla de chat (`apply_chat_template` no aplica).
- No se documentan capacidades de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso
- Modelo de control en investigación: sirve como referencia para comparar el efecto del preentrenamiento con búsqueda frente al modelo emparejado `querylm-dclm-400m-sft-search`, aislando la variable del preentrenamiento en experimentos reproducibles.
- Estudio de recuperación aumentada en modelos pequeños: permite analizar cómo un modelo de 401 M de parámetros aprende a formular consultas y a integrar pasajes recuperados cuando se le expone por primera vez a bloques de búsqueda en el ajuste fino.
- Prototipado de pipelines de búsqueda: el script de la model card demuestra el flujo de apertura de bloque, generación de consulta, recuperación externa e inserción del pasaje, útil para validar la mecánica antes de escalar a modelos mayores.
- Evaluación de formato de chat sin plantilla: sirve para probar infraestructuras de inferencia que trabajan con prompts en texto plano y tokens especiales personalizados.
- Docencia y experimentación académica: su tamaño reducido y licencia Apache 2.0 permiten ejecutarlo en entornos con recursos limitados para estudiar el comportamiento de modelos con búsqueda integrada.
- Reproducción de experimentos: la model card documenta checkpoint, actualización, commit de código y hash sha256 del archivo de pesos, lo que facilita la replicación de resultados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware
- VRAM estimada para inferencia: al almacenar 842,2 M de parámetros, en bfloat16 requiere aproximadamente 1,7 GB de pesos; en float32, unos 3,4 GB. El repo ocupa 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; el ejemplo de la model card se ejecutó en CPU con bfloat16 y torch 2.8.0.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `modeling_nanochat.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Preentrenamiento con busqueda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `standard-dclm-400m-sft-search` | 401,2 M reportados (842,2 M almacenados) | 4.095 tokens | No | Apache 2.0 | Hugging Face |
| `Kausp11/querylm-dclm-400m-sft-search` | Misma arquitectura y cómputo | 4.095 tokens | Sí | No disponible en la informacion | Hugging Face |
| `Kausp11/standard-dclm-400m` | 401,2 M reportados | 4.095 tokens | No (modelo base sin SFT) | No disponible en la informacion | Hugging Face |

## Limitaciones y advertencias
- Artefacto de investigación: el autor lo describe explícitamente como un modelo de control para estudiar preentrenamiento con búsqueda, no como un producto.
- Entrenado solo en inglés; no soporta otros idiomas de forma fiable.
- Ventana de contexto muy limitada (4.095 tokens), insuficiente para conversaciones largas o documentos extensos.
- Riesgo elevado de alucinación: el ejemplo de la model card produce una respuesta incorrecta (afirma que Canberra está en Victoria), lo que evidencia que la precisión no está garantizada.
- El modelo no ejecuta búsquedas por sí mismo: el llamador debe proporcionar el recuperador y el pasaje; la calidad de la respuesta depende del pasaje insertado.
- No hay plantilla de chat; el formato debe construirse manualmente en texto plano.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; se recomienda fijar `revision=` a un commit revisado.
- No se han publicado evaluaciones ni benchmarks; no hay datos objetivos de rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas y la falta de evaluación desaconsejan su uso en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-dclm-400m-sft-search
- Modelo base: https://huggingface.co/Kausp11/standard-dclm-400m
- Modelo emparejado: https://huggingface.co/Kausp11/querylm-dclm-400m-sft-search
- Dataset de ajuste fino: https://huggingface.co/datasets/Kausp11/querylm-search-sft-data
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
