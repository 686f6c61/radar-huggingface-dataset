# jacopof/lumina-next-135m

## Resumen

Lumina-Next 135M es un modelo de lenguaje de tipo decoder-only desarrollado por Jacopo Forti (usuario `jacopof` en HuggingFace) dentro del ecosistema que el autor denomina Lumina AI. Se presenta como una arquitectura orientada a eficiencia en dispositivos edge (portátiles, CPU y GPU de consumo) con soporte de contexto largo (8.192 token nativos, extensibles a 32.768 mediante YaRN) y especialización en código Python, lógica formal y lengua italiana. El checkpoint publicado corresponde a 8.025 pasos acumulados de entrenamiento.

El modelo declara 103,39 millones de parámetros reales con embeddings atados (tied embeddings); el nombre comercial "135M" hace referencia a la configuración con embeddings no atados. La arquitectura combina RoPE con frecuencia base 500.000,0, Grouped Query Attention con proporción 3:1, RMSNorm y activación SwiGLU, junto con un tokenizador Byte-Level BPE de 32.000 entradas entrenado conjuntamente sobre Python, SQL, Git e italiano.

Su relevancia actual es limitada y debe enmarcarse con cautela: se trata de un modelo de escala muy reducida (en torno a 100 millones de parámetros) y el propio autor advierte que la métrica de benchmark publicada (87,5%) procede de una prueba determinista local de 8 preguntas (16 puntos), no de una evaluación general de capacidades. Resulta útil como banco de pruebas de arquitecturas eficientes y para despliegues en hardware muy restringido, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, GQA 3:1, RMSNorm y SwiGLU |
| Parametros totales | 103.394.880 (con tied embeddings); 135M en configuración unshared |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 token nativos; hasta 32.768 mediante YaRN |
| Tipos de cuantizacion | no disponible de forma explícita; se publican pesos en safetensors, ONNX y GGUF (este último apto para cuantización en llama.cpp) |
| Idiomas soportados | italiano (declarado); el tokenizador se entrena también con Python, SQL y Git |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch_model.bin, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención de tipo Grouped Query Attention en proporción 3:1 (9 cabezas de query y 3 de key/value, con `head_dim = 64`), normalización RMSNorm pre-atención y pre-MLP, activación SwiGLU con dimensión de feed-forward de 1.536, y embeddings atados. La codificación posicional usa RoPE con frecuencia base 500.000,0 e interpolación frecuencial YaRN, lo que permite extender el contexto de 8.192 a 32.768 token. El tokenizador es un Byte-Level BPE con vocabulario de 32.000 entradas, entrenado conjuntamente sobre Python, SQL, Git e italiano.

El entrenamiento acumula 8.025 pasos con un throughput medio declarado de casi 14.000 token/s. La tabla de convergencia publicada por el autor muestra una evolución de la pérdida de entropía cruzada desde 8,9042 en el paso 0 hasta 0,1353 en el paso 8.025, con incrementos progresivos en la prueba determinista de 8 preguntas (de 0/16 a 14/16 aciertos). No se documentan en la información disponible detalles sobre el volumen total de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto en italiano, con especialización declarada en código Python, SQL y Git.
- Razonamiento de lógica formal y resolución de preguntas deterministas sobre geografía, gramática, ciencia y calendario, según la tabla de convergencia del autor.
- Soporte de contexto largo: 8.192 token nativos y hasta 32.768 con YaRN.
- Formato de chat con marcadores especiales `<|im_start|>` y `<|im_end|>`.
- Compatibilidad con tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al italiano declarado; no se documentan otras lenguas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Inferencia en CPU y DirectML mediante exportación ONNX con ejes dinámicos.

## Casos de uso

- Asistente de código Python en local: el modelo puede integrarse en editores o scripts para autocompletar y explicar fragmentos de Python, SQL y Git, aprovechando su tokenizador entrenado específicamente sobre esos lenguajes y su tamaño reducido para ejecutarse en CPU.
- Despliegue en dispositivos edge sin GPU: gracias a sus aproximadamente 103 millones de parámetros y a la exportación ONNX con ejes dinámicos, puede ejecutarse en portátiles y equipos de sobremesa modestos con latencia aceptable para tareas interactivas breves.
- Procesamiento de documentos largos en italiano: la ventana de 8.192 token nativos (32.768 con YaRN) permite resumir o extraer información de contratos, artículos o informes en italiano sin truncar el contexto.
- Generación de respuestas de chat con formato estructurado: el esquema de marcadores `<|im_start|>`/`<|im_end|>` facilita su integración en pipelines conversacionales con plantillas de prompt controladas.
- Prototipado e investigación de arquitecturas eficientes: sirve como banco de pruebas para estudiar GQA, YaRN, RMSNorm y SwiGLU en un modelo pequeño, con pesos disponibles en safetensors y GGUF para experimentación rápida.
- Filtrado y clasificación de texto en italiano: con prompts adecuados puede emplearse para tareas de etiquetado o detección de temáticas en corpus italianos, siempre con validación humana posterior.
- Inferencia embebida con llama.cpp o LM Studio: el archivo GGUF permite desplegar el modelo en entornos de escritorio sin dependencias de PyTorch, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

El autor publica una tabla de convergencia interna con una prueba determinista de 8 preguntas (16 puntos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Ciclo | Step acumulativos | Loss cross-entropy | Score prueba interna (16 puntos) |
|---|---|---|---|
| Baseline | 0 | 8,9042 | 0,0% (0/16) |
| Ciclo 1 | 500 | 3,6652 | 0,0% (0/16) |
| Ciclo 2 | 1.500 | 1,9958 | 25,0% (4/16) |
| Ciclo 3 | 2.500 | 1,5491 | 31,2% (5/16) |
| Ciclo 4 | 3.500 | 1,1533 | 37,5% (6/16) |
| Ciclo 5 | 5.000 | 0,7269 | 37,5% (6/16) |
| Ciclo 6 | 6.500 | 0,4548 | 50,0% (8/16) |
| Ciclo 7 | 8.025 | 0,1353 | 87,5% (14/16) |

El propio autor advierte que esta prueba es un control local sobre 8 preguntas y no una medida general de inteligencia, y que el modelo puede producir repeticiones o texto incoherente en respuestas largas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (pesos safetensors de aproximadamente 394 MB); en torno a 0,5 GB en cuantización de 8 bits y menos de 0,3 GB en 4 bits, aunque las cifras exactas de cuantización no se detallan.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada para este modelo; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en iGPU y CPU.
- Opciones de despliegue: `llama.cpp` y LM Studio mediante el archivo GGUF; ONNX Runtime con DirectML para CPU y GPU integradas; PyTorch/Transformers con el código de modelado incluido en el repositorio.
- Latencia y throughput estimados: no disponibles de forma oficial; el autor declara un throughput de entrenamiento de casi 14.000 token/s, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lumina-Next 135M | 103,4M (tied) | 8.192 nativo / 32.768 con YaRN | MIT | HuggingFace (safetensors, ONNX, GGUF) | Especializado en italiano y código Python |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | HuggingFace | Modelo pequeño de propósito general de HuggingFace; datos de benchmarks no incluidos en esta ficha |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | HuggingFace | Alternativa de mayor tamaño con contexto largo y capacidades multilingües |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | HuggingFace | Mayor capacidad, pero con menor contexto nativo |

No se dispone de datos de benchmarks comparativos directos entre Lumina-Next 135M y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El benchmark publicado (87,5%) procede de una prueba determinista local de 8 preguntas (16 puntos), no de una evaluación general; no debe interpretarse como una medida de capacidad global.
- El autor reconoce que el modelo puede producir repeticiones o texto incoherente en respuestas largas.
- La aritmética sigue siendo un área débil según la propia tabla de convergencia del autor.
- Los idiomas soportados se limitan al italiano declarado; no se documenta un rendimiento fiable en castellano u otras lenguas.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y por el escaso volumen de entrenamiento documentado; requiere verificación externa para datos actualizados y decisiones importantes.
- La aplicación Lumina añade controles locales deterministas que no forman parte de los pesos publicados, por lo que el rendimiento puede diferir al usar el modelo de forma aislada.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni evaluaciones de seguridad.
- No se documentan sesgos específicos ni procesos de alineación (RLHF/DPO) en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacopof/lumina-next-135m
- Perfil del autor: https://huggingface.co/jacopof
