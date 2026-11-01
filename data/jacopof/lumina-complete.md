# jacopof/lumina-complete

## Resumen

Lumina-Next 135M es un modelo de lenguaje de tipo decoder-only transformer desarrollado por Jacopo Forti (usuario `jacopof` en HuggingFace) dentro del ecosistema que el autor denomina Lumina AI. Con 103,39 millones de parámetros efectivos (225,95 millones contando embeddings sin atar según los safetensors publicados), está diseñado para inferencia en dispositivos edge: portátiles, CPU y GPU de consumo. Su especialización declarada es el código Python, la lógica formal y la lengua italiana, con contexto nativo de 8.192 tokens extensible a 32.768 mediante YaRN.

El checkpoint publicado corresponde al ciclo 8 del entrenamiento acumulado (step 8.025), con una pérdida de entropía cruzada de 0,1353 y una puntuación del 87,5% en un benchmark determinista propio de 8 preguntas (16 puntos). Es relevante ahora porque ejemplifica la tendencia de modelos pequeños y altamente especializados, con licencia MIT y múltiples formatos de pesos (safetensors, ONNX, GGUF), lo que facilita su despliegue local sin dependencias de infraestructura cloud.

Conviene subrayar que el propio autor advierte en la model card que la métrica de benchmark es una comprobación local sobre un conjunto muy reducido de preguntas, no una medida general de capacidad, y que el modelo puede producir repeticiones o texto incoherente en respuestas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE (theta=500.000,0), YaRN, GQA 3:1, RMSNorm y SwiGLU |
| Parametros totales | 225.952.512 (safetensors); 103,39 M con tied embeddings según el autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens nativo; hasta 32.768 con YaRN |
| Tipos de cuantizacion | GGUF (compatible con llama.cpp y LM Studio); cuantizaciones específicas no detalladas |
| Idiomas soportados | Italiano (declarado); tokenizer entrenado también con Python, SQL y Git |
| Licencia | MIT |
| Formato de pesos | safetensors (394 MB), pytorch_model.bin, ONNX (465 MB), GGUF (465 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 9 cabezas de consulta y 3 cabezas de clave/valor (GQA 3:1, `head_dim = 64`), normalización RMSNorm pre-atención y pre-MLP, y activación SwiGLU con dimensión de feed-forward de 1.536. El tokenizer es un Byte-Level BPE con vocabulario de 32.000 entradas, entrenado conjuntamente sobre Python, SQL, Git e italiano. El contexto se extiende mediante RoPE con frecuencia base 500.000 e interpolación YaRN.

El autor documenta 8.000 steps acumulativos de entrenamiento con un throughput medio cercano a 14.000 tokens/s, organizados en ciclos con pérdida decreciente (de 8,9042 en el step 0 a 0,1353 en el step 8.025). No se especifica en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en italiano con formato de chat basado en tokens especiales `<|im_start|>` y `<|im_end|>`.
- Generación y razonamiento sobre código Python, con soporte declarado también para SQL y Git en el tokenizer.
- Lógica formal y respuesta a preguntas de geografía, gramática, ciencia y calendario según el benchmark propio del autor.
- Manejo de contextos largos de hasta 8.192 tokens nativos y 32.768 con YaRN.
- Comportamiento de "honestidad" ante preguntas sobre fechas futuras, según se documenta en la tabla de convergencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de código Python en local: el modelo puede integrarse en editores o scripts de CLI para autocompletado y generación de fragmentos, aprovechando su especialización declarada en Python y su tamaño reducido para ejecutarse en CPU.
- Procesamiento de texto en italiano en el edge: aplicaciones de escritorio o móviles que necesiten resumen, reescritura o respuesta a preguntas en italiano sin conexión a la nube, gracias a los formatos ONNX y GGUF.
- Clasificación y extracción de información en documentos largos: con 8.192 tokens de contexto nativo puede procesar contratos o artículos completos en una sola pasada.
- Generación de consultas SQL y comandos Git: el tokenizer entrenado con estos lenguajes permite asistir en la construcción de queries y operaciones de control de versiones.
- Prototipado educativo e investigación: modelo pequeño y de licencia MIT adecuado para experimentar con arquitecturas GQA, RoPE/YaRN y extensiones de contexto sin grandes requisitos de hardware.
- Chatbot de dominio acotado en italiano: atención al cliente o FAQ internas donde el alcance esté limitado y se acepte la supervisión humana por el riesgo de incoherencia en respuestas largas.
- Evaluación de pipelines de inferencia local: útil como banco de pruebas para comparar rendimiento entre llama.cpp, ONNX Runtime y Transformers en hardware de consumo.

## Benchmarks y rendimiento

El autor publica una tabla de convergencia interna, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). Los datos disponibles son:

| Ciclo | Step | Loss CE | Score benchmark propio (8 preguntas, 16 puntos) |
|---|---|---|---|
| Baseline | 0 | 8,9042 | 0,0% (0/16) |
| Ciclo 1 | 500 | 3,6652 | 0,0% (0/16) |
| Ciclo 2 | 1.500 | 1,9958 | 25,0% (4/16) |
| Ciclo 3 | 2.500 | 1,5491 | 31,2% (5/16) |
| Ciclo 4 | 3.500 | 1,1533 | 37,5% (6/16) |
| Ciclo 5 | 5.000 | 0,7269 | 37,5% (6/16) |
| Ciclo 6 | 6.500 | 0,4548 | 50,0% (8/16) |
| Ciclo 7 | 8.025 | 0,1353 | 87,5% (14/16) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El propio autor advierte que la métrica de 8 preguntas no mide inteligencia general y que la aritmética sigue siendo un punto débil.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (394 MB de pesos safetensors); las versiones ONNX y GGUF ocupan 465 MB.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; para máxima velocidad, cualquier GPU con al menos 2 GB de memoria libre es suficiente.
- Opciones de despliegue: llama.cpp y LM Studio (GGUF), ONNX Runtime y DirectML (ONNX), Transformers con PyTorch (safetensors).
- Latencia y throughput: el autor reporta un throughput de entrenamiento de casi 14.000 tokens/s; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formatos |
|---|---|---|---|---|---|
| Lumina-Next 135M | 103,39 M (tied) / 225,95 M (safetensors) | 8.192 nativo, 32.768 con YaRN | MIT | Italiano | safetensors, ONNX, GGUF, .bin |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Apache 2.0 | Inglés principalmente | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Multilingüe | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Inglés | safetensors, GGUF |

La comparación con SmolLM-135M y Qwen2.5-0.5B se basa en datos públicos de sus model cards; no se dispone de evaluaciones cruzadas en los mismos benchmarks para Lumina-Next 135M, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- El benchmark publicado es una comprobación local de 8 preguntas (16 puntos) y no una evaluación general; no debe extrapolarse a capacidades reales.
- El autor reconoce que el modelo puede producir repeticiones o texto incoherente en respuestas largas.
- La aritmética sigue siendo un área débil según la propia tabla de convergencia.
- Los datos de geografía, ciencia y calendario pueden quedar desactualizados; se recomienda verificación externa para decisiones importantes.
- El modelo está entrenado principalmente en italiano; su rendimiento en castellano u otros idiomas no está documentado.
- No se documentan fases de alineación (RLHF/DPO) ni evaluaciones de sesgo; existe riesgo de sesgos y alucinaciones no caracterizados.
- La licencia MIT permite uso comercial, pero al ser un modelo de 103 M de parámetros con entrenamiento limitado, no es adecuado para tareas de alta fiabilidad sin supervisión humana.
- La aplicación Lumina mencionada por el autor incluye controles deterministas locales que no forman parte de los pesos publicados; los resultados del benchmark pueden no reproducirse solo con los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacopof/lumina-complete
- Perfil del autor: https://huggingface.co/jacopof
