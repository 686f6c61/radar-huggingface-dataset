# Kausp11/standard-dclm-400m

## Resumen

Standard 400M (DCLM-Edu) es un modelo de lenguaje de tipo base (solo preentrenamiento) desarrollado por Kausp11 como línea de control del proyecto QueryLM. Se trata de un decoder transformer de estilo nanochat con 14 capas, anchura 1.280, 10 cabezas de atención y una ventana de contexto de 4.095 tokens. Su función es servir de referencia frente a `Kausp11/querylm-dclm-400m`, un modelo gemelo entrenado con el mismo presupuesto de cómputo pero con bloques de búsqueda insertados en el texto; este modelo, en cambio, consume ese mismo cómputo en más texto plano de DCLM-Edu.

El interés del modelo es metodológico: permite aislar el efecto del preentrenamiento aumentado con búsqueda comparando dos ejecuciones con idénticas actualizaciones (10.100), idéntico número de FLOPs (3,09e19) y la misma arquitectura. No está pensado como producto ni como asistente conversacional, sino como artefacto de investigación para medir qué cambia cuando el corpus de preentrenamiento incluye recuperación en línea.

El modelo reporta 401,2M de parámetros según el autor, aunque el fichero safetensors almacena 842,2M por la inclusión de *value embeddings*. Está entrenado exclusivamente con texto web en inglés y no ha recibido ningún tipo de ajuste por instrucciones, RLHF ni entrenamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo nanochat (14 capas, width 1.280, 10 cabezas, FFN 5.120, head dim 128) |
| Parametros totales | 401,2M reportados por el autor; 842,2M almacenados en safetensors (incluye value embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (el autor solo documenta ejecución en bfloat16) |
| Idiomas soportados | Inglés (texto web) |
| Licencia | Apache-2.0 (el código `modeling_nanochat.py` es adaptación de nanochat, MIT) |
| Formato de pesos | safetensors (con `custom_code`: requiere `modeling_nanochat.py` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nanochat (commit upstream `92d63d4`), un decoder transformer denso con 14 capas, dimensión de modelo 1.280, 10 cabezas de atención con dimensión de cabeza 128 y capa feed-forward de 5.120. El tokenizador es el de SmolLM2 ampliado con los cuatro tokens de búsqueda que usa QueryLM, lo que da un vocabulario de 49.156 entradas; esos cuatro tokens existen en el vocabulario pero el modelo nunca los vio durante el entrenamiento.

El preentrenamiento se realizó desde cero sobre DCLM-Edu en formato de texto plano, sin bloques de búsqueda ni anotación. Se usó Muon para los pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con un batch de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualización). El schedule consta de 40 pasos de calentamiento, fase constante y decaimiento lineal hasta el 5% del pico. El presupuesto total fue de 10.100 actualizaciones, 10,6B tokens y 3,09e19 FLOPs en bf16, idéntico al del modelo QueryLM emparejado. El checkpoint proviene de la ejecución `dclm_nc_baseline_d14_allcm_chin10k`, que ramifica en el paso 9.000 desde una ejecución de 400M más larga y decae la tasa de aprendizaje entre los pasos 9.000 y 10.100.

## Capacidades

- Generación de texto por continuación: el modelo completa secuencias y puede resolver tareas de formato pregunta-respuesta mediante ejemplos few-shot, como demuestra el script de la model card (responde "Canberra" a la capital de Australia).
- Razonamiento básico de conocimiento factual adquirido del corpus DCLM-Edu, limitado por su tamaño y presupuesto de entrenamiento.
- No dispone de formato de chat ni de ajuste por instrucciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe prácticamente nula: solo inglés.
- No tiene modo de pensamiento, visión ni audio.
- No ha recibido entrenamiento de seguridad, rechazo ni alineación.

## Casos de uso

- Línea base de ablación en investigación: comparar sus resultados con los de `Kausp11/querylm-dclm-400m` para cuantificar el efecto del preentrenamiento con bloques de búsqueda sobre el mismo presupuesto de cómputo.
- Reproducción de experimentos de scaling a pequeña escala: sus 10,6B tokens y 3,09e19 FLOPs permiten reproducir curvas de entrenamiento en hardware modesto y validar recetas de optimizador (Muon + AdamW).
- Estudio de tokenizadores: al compartir vocabulario con QueryLM (SmolLM2 + 4 tokens de búsqueda), sirve para analizar cómo afecta la presencia de tokens nunca vistos en el entrenamiento a la distribución de salida.
- Evaluación de continuaciones few-shot: útil como sujeto de prueba en pipelines de evaluación de modelos base con prompts de formato pregunta-respuesta.
- Docencia y experimentación con `trust_remote_code`: el repositorio incluye `modeling_nanochat.py`, lo que lo convierte en un ejemplo práctico de carga de arquitecturas personalizadas en transformers.
- Verificación de infraestructura de inferencia: su tamaño (1,7 GB de repo) permite probar integraciones con transformers en CPU o GPU consumer antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bfloat16 (842,2M parámetros almacenados × 2 bytes), más overhead de activaciones y caché KV para 4.095 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor ejecutó el script de ejemplo en CPU en bfloat16 con torch 2.8.0 y transformers 4.56.0.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada (`modeling_nanochat.py`) probablemente requiera portar el código para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Standard 400M (DCLM-Edu) | 401,2M reportados (842,2M almacenados) | 4.095 | 10,6B tokens DCLM-Edu, texto plano | Apache-2.0 | Hugging Face |
| QueryLM DCLM 400M (`Kausp11/querylm-dclm-400m`) | Misma arquitectura y cómputo | 4.095 | Mismo cómputo con bloques de búsqueda | No disponible en la información | Hugging Face |
| Standard 400M SFT Search (`Kausp11/standard-dclm-400m-sft-search`) | Misma arquitectura | 4.095 | Base + ajuste supervisado | No disponible en la información | Hugging Face |

La comparación relevante es interna al proyecto QueryLM: los tres modelos comparten arquitectura y tokenizador, y se diferencian en el régimen de entrenamiento (texto plano, búsqueda nativa y ajuste supervisado). No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto: el propio autor lo describe como modelo de control para estudiar preentrenamiento aumentado con búsqueda.
- Modelo base sin formato de chat: no responde a instrucciones de forma fiable y requiere prompts de continuación o few-shot.
- Solo inglés y solo texto web: sin cobertura multilingüe ni de dominios especializados más allá de lo presente en DCLM-Edu.
- Sin entrenamiento de seguridad ni rechazo: puede generar contenido inapropiado y afirmar falsedades con fluidez; el riesgo de alucinación es alto.
- Contexto limitado a 4.095 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- La carga ejecuta código Python del repositorio (`modeling_nanochat.py`): es imprescindible revisarlo o fijar una revisión concreta antes de usarlo en producción.
- Licencia Apache-2.0 para los pesos; el código de modelado deriva de nanochat bajo MIT, cuyos términos deben respetarse en la redistribución.
- El corpus DCLM-Edu está bajo CC-BY-4.0, lo que conviene tener en cuenta al redistribuir derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-dclm-400m
- Modelo emparejado QueryLM: https://huggingface.co/Kausp11/querylm-dclm-400m
- Versión con ajuste supervisado: https://huggingface.co/Kausp11/standard-dclm-400m-sft-search
- Paper: https://arxiv.org/abs/2611.26809
- Página del proyecto: https://kaustubhp11.github.io/querylm/
- Dataset DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
