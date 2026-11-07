# SlayerLab/Slayer1B-1.08b

## Resumen

Slayer1B-1.08b es un modelo de lenguaje base de aproximadamente 1.070 millones de parámetros (1,07B) desarrollado por Arkadiusz Słota bajo el sello Fabryka AI SlayerLab. Forma parte de la línea Slayer1B, un proyecto abierto que construye desde cero un modelo lingüístico polaco de escala ~1B y lo mejora versión a versión, reentrenando cada iteración desde el checkpoint de la anterior antes de su decaimiento final de learning rate, incorporando nuevos datos. Todas las versiones, checkpoints y resultados se publican abiertamente.

La versión 1.08b se plantea como continuación de la ablación 1.08 (comparación entre datos de razonamiento y un control polaco) y añade aproximadamente 0,5B tokens de texto web polaco no utilizados en versiones previas; la mezcla exacta de datos aún está por decidir. El modelo emplea una arquitectura transformer de 20 capas, dimensión 2048, 16 cabezas de atención, RoPE, SwiGLU, QK-Norm y value residual, con un contexto de 4096 tokens y un tokenizador de 32k entradas.

Es relevante ahora por dos motivos: representa uno de los pocos esfuerzos documentados para crear un modelo base polaco de ~1B con entrenamiento reproducible y pesos públicos, y porque su estado es explícitamente "en preparación", con los pesos aún no publicados. Cualquier evaluación debe tratar la ficha como una descripción del modelo planificado, no de un artefacto ya disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only: 20 capas, dim 2048, 16 cabezas, RoPE, SwiGLU, QK-Norm, value residual |
| Parametros totales | ~1,07B (aproximadamente 1.070 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos aún no publicados; no se documentan formatos cuantizados) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados; librería declarada: PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar con 20 capas y dimensión oculta de 2048, 16 cabezas de atención, embeddings posicionales rotatorios (RoPE), activación SwiGLU, normalización de query-key (QK-Norm) y una conexión de value residual. El tokenizador tiene un vocabulario de 32k entradas. El optimizador combina Muon y AdamW, una elección poco habitual que mezcla un optimizador ortogonal para matrices con AdamW para el resto de parámetros.

El entrenamiento parte de la línea Slayer1B y se planea como continuación del checkpoint de la versión anterior antes de su decaimiento final de learning rate, con un decaimiento de LR al final de la ejecución. La mezcla de datos prevista combina los datos de razonamiento de la ablación 1.08 con aproximadamente 0,5B tokens de texto web polaco no empleados en versiones anteriores; la mezcla exacta, el checkpoint de partida y el esquema de learning rate están aún por decidir. La model card indica que la data card de 1.08b se publicará cuando los datos estén construidos, y que el dataset público existente (slayer-1.08-pretrain) corresponde a la ablación 1.08, no al conjunto de entrenamiento de 1.08b.

## Capacidades

- Generación de texto autoregresiva en polaco e inglés como modelo base preentrenado.
- Razonamiento y continuación de texto: la mezcla de datos prevista incorpora datos de razonamiento procedentes de la ablación 1.08.
- No es un modelo instruido: no se ha sometido a fine-tuning de instrucciones ni a RLHF/DPO según la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: limitadas a los idiomas declarados (pl, en).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Contexto efectivo de 4096 tokens, adecuado para documentos cortos y conversaciones breves.

## Casos de uso

- Investigación sobre modelos lingüísticos de bajo recursos: sirve como base reproducible para estudiar el efecto de mezclas de datos polacos frente a datos de razonamiento en un modelo de ~1B, dado que el proyecto publica checkpoints y resultados de cada versión.
- Continuación y generación de texto en polaco: adecuado para tareas de completado de texto, resumen o redacción asistida en dicho idioma, con la cautela de que al ser un modelo base las salidas pueden ser inconsistentes.
- Fine-tuning posterior para tareas concretas: al ser un modelo base con licencia Apache 2.0 y pesos en PyTorch, puede servir de punto de partida para ajuste supervisado en clasificación, extracción o generación de dominio específico.
- Experimentos de arquitectura: la combinación de Muon + AdamW, QK-Norm y value residual lo convierte en un banco de pruebas para comparar recetas de entrenamiento en modelos pequeños.
- Evaluación comparativa de modelos polacos: permite contrastar el rendimiento de un modelo entrenado desde cero frente a modelos multilingües de tamaño similar en tareas de comprensión y generación en polaco.
- Docencia y reproducción de pipelines: el carácter público de checkpoints y resultados facilita su uso en cursos o talleres sobre entrenamiento de LLM a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que no hay resultados de benchmarks para 1.08b y que los resultados de la ablación 1.08 no deben asumirse como resultados de 1.08b.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1,07B parámetros, en FP16/BF16 se necesitarían aproximadamente 2,1 GB solo para pesos, más memoria para caché KV y activaciones; en cuantización de 8 bits ~1,1 GB y en 4 bits ~0,6 GB, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de ~1B en cuantización de 8 o 4 bits cabría previsiblemente en GPUs de consumo con 8 GB o más, pero no hay datos oficiales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; los pesos aún no se han publicado y no se documentan formatos GGUF ni integraciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos base polacos de ~1B) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Estado del modelo: los pesos no están publicados; la ficha describe un modelo planificado y los detalles pueden cambiar antes del lanzamiento.
- Modelo base sin instruction tuning: las respuestas pueden ser inconsistentes y no siguen instrucciones de forma fiable.
- Sin resultados de benchmarks publicados: no deben asumirse cifras de rendimiento de la ablación 1.08 como resultados de 1.08b.
- Idiomas limitados a polaco e inglés; el rendimiento fuera de estos idiomas no está documentado.
- Contexto de 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación y sesgos: al entrenarse parcialmente con texto web polaco, puede heredar sesgos y errores de esas fuentes; no se documentan medidas de mitigación.
- Licencia Apache 2.0 para el modelo, pero las licencias de los datos se listarán en la data card de 1.08b, aún no publicada; conviene revisarlas antes de un uso comercial.
- Sin soporte documentado de tool calling, agentes ni modos especiales de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.08b
- Space del proyecto (misión Slayer 1B): https://huggingface.co/spaces/SlayerLab/Slayer1B
- Versión 1.00 del modelo: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Dataset de la ablación 1.08: https://huggingface.co/datasets/SlayerLab/slayer-1.08-pretrain
