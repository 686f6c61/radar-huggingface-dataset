# bcckfdn/cevher-test-1-GGUF

## Resumen

cevher-406m es un modelo de generación de texto de tipo transformer decoder-only, entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura de SmolLM2 (familia Llama). Con 406.918.144 parámetros, 34 capas y una dimensión oculta de 1024, el modelo se ha entrenado sobre 4.002 millones de tokens y se distribuye exclusivamente en formato GGUF, cuantizado en cuatro variantes (BF16, Q8_0, Q5_K_M y Q4_K_M), con soporte declarado para turco e inglés.

El modelo base es bcckfdn/cevher-test-1 y esta ficha corresponde únicamente a su versión cuantizada para llama.cpp. Su relevancia práctica está en el segmento de modelos ultraligeros: el archivo Q4_K_M ocupa 245 MB, lo que permite ejecutar inferencia en CPU, en GPUs de gama baja e incluso en dispositivos embebidos sin necesidad de aceleradores dedicados.

Se trata de un modelo experimental y de publicación reciente, con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. Por tanto, debe evaluarse como una base para experimentación, ajuste fino o prototipado, no como un sustituto de modelos de 7B o superiores en tareas de producción que exijan razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama / SmolLM2), denso |
| Parámetros totales | 406.918.144 (~406,9 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el autor no la especifica; el modelo base hereda el diseño SmolLM2) |
| Tipos de cuantización | BF16 (778 MB), Q8_0 (414 MB), Q5_K_M (281 MB), Q4_K_M (245 MB) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo cuantizado; no se publican safetensors en este repositorio) |
| Capas | 34 |
| Dimensión oculta (hidden size) | 1024 |
| Tokens de entrenamiento | 4.002 millones |
| Modelo base | bcckfdn/cevher-test-1 |
| Tamaño del repositorio | 1,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo Llama, la misma familia empleada por SmolLM2, con 34 capas y una dimensión oculta de 1024. El autor indica que el modelo se entrenó "desde cero" (sıfırdan eğitilmiş), es decir, sin partir de pesos preexistentes, sobre un total de 4.002 millones de tokens. No se detalla la composición del dataset, la proporción entre turco e inglés, el número de tokens de contexto usados durante el preentrenamiento ni la existencia de fases posteriores de ajuste por instrucciones.

Tampoco se documentan técnicas de alineación como RLHF, DPO o SFT, ni innovaciones de eficiencia como atención lineal, decodificación especulativa o mezclas de expertos. La etiqueta "conversational" del repositorio sugiere algún grado de ajuste conversacional, pero la model card no aporta detalles al respecto. La única optimización documentada es la cuantización a GGUF para su ejecución con llama.cpp, Ollama y LM Studio.

## Capacidades

- Generación de texto autocompletivo y conversacional (la etiqueta del repositorio es "conversational") en turco e inglés.
- Continuación de textos y respuesta a indicaciones cortas, con la calidad esperable en un modelo de 406 M de parámetros.
- Ejecución local en CPU y en GPU de gama baja gracias a las cuantizaciones de 4 y 5 bits.
- Compatibilidad con llama.cpp, Ollama y LM Studio, lo que habilita despliegue offline sin servicios externos.
- Interfaz de línea de comandos con modo conversacional (`llama-cli -cnv`).
- Capacidades multilingües limitadas a los dos idiomas declarados: turco e inglés.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo "thinking". No disponibles según la información proporcionada.

## Casos de uso

- Prototipado y experimentación en NLP en turco: al ser un modelo entrenado desde cero específicamente con corpus turco, sirve para validar pipelines de tokenización, instrucciones y evaluación en ese idioma antes de escalar a modelos mayores.
- Asistente conversacional local offline: el archivo Q4_K_M de 245 MB se puede ejecutar con Ollama o LM Studio en un portátil sin GPU, ofreciendo un chatbot privado que no envía datos a ningún servidor.
- Generación de texto de bajo coste en el borde: despliegue en Raspberry Pi, mini-PC o dispositivos embebidos donde no cabe ningún modelo de 7B, para tareas de autocompletado o redacción asistida con requisitos de latencia y memoria mínimos.
- Base para ajuste fino académico: con 406 M de parámetros, el ajuste completo o por LoRA cabe en una única GPU de consumo (por ejemplo, una RTX 3060 o superior), lo que lo hace adecuado para prácticas docentes y reproducibilidad de experimentos.
- Filtrado, etiquetado o generación aumentada en inglés: puede emplearse como componente generativo ligero dentro de pipelines mayores (resúmenes cortos, reformulación de frases, plantillas) donde el coste por token importa más que la calidad máxima.
- Evaluación de herramientas GGUF: sirve como caso de prueba para medir rendimiento de llama.cpp, comparar cuantizaciones Q4_K_M frente a Q8_0 o validar integraciones con LM Studio y servidores compatibles con endpoints.
- Generación de datos sintéticos a pequeña escala en turco: producción de variaciones de frases o pares de pregunta-respuesta para preentrenar o aumentar otros modelos, asumiendo la necesidad de revisión humana por la tasa de error esperable a este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, y el repositorio registra cero descargas y cero valoraciones, por lo que no existen datos de terceros en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 en torno a 1 GB; Q8_0 unos 0,5 GB; Q5_K_M unos 0,35 GB; Q4_K_M unos 0,3 GB, sumando pesos, caché KV y sobrecarga del runtime. Son estimaciones por tamaño de archivo, no medidas publicadas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo está muy por debajo de la capacidad de cualquier acelerador moderno.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida.
- Cabe en CPU: sí, es el escenario principal; con cuantización Q4_K_M y 4-8 GB de RAM disponibles es suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante Modelfile), LM Studio, y cualquier runtime compatible con GGUF. No se documenta soporte explícito para vLLM o TGI en esta distribución.
- Latencia y throughput: no disponibles. No se han publicado cifras oficiales; a este tamaño el cuello de botella suele ser el ancho de banda de memoria, por lo que en CPU es habitual obtener velocidades del orden de decenas de tokens por segundo, pero se trata de una estimación orientativa y no de un dato verificado del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cevher-406m (este modelo) | 406,9 M | No disponible | tr, en | Apache 2.0 | GGUF (BF16, Q8_0, Q5_K_M, Q4_K_M) |
| SmolLM2-360M (HuggingFaceTB) | ~362 M | 8.192 tokens (según su model card) | Principalmente inglés | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B (Alibaba) | ~494 M | 32.768 tokens (según su model card) | Multilingüe amplio, con soporte de turco limitado | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Principalmente inglés | Apache 2.0 | safetensors, GGUF |

Los datos de los modelos alternativos proceden de sus respectivas model cards públicas y pueden variar según la revisión consultada. No existen métricas comparativas publicadas para cevher-406m, por lo que la comparación se limita a parámetros, contexto declarado y licencia; no es posible comparar rendimiento real. La ventaja diferencial de cevher-406m frente a las alternativas es su especialización declarada en turco y su peso reducido, mientras que SmolLM2-360M y Qwen2.5-0.5B cuentan con documentación, benchmarks y comunidad mucho más amplios.

## Limitaciones y advertencias

- Tamaño muy reducido (406 M de parámetros): la coherencia en razonamiento multi-paso, matemáticas y código será limitada y notablemente inferior a la de modelos de 1B en adelante.
- Riesgo elevado de alucinación y de incoherencia en respuestas largas, propio de modelos de esta escala sin fases de alineación documentadas.
- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad en ninguna tarea.
- Longitud de contexto no documentada: existe riesgo de degradación si se superan los límites reales de la ventana, que el autor no especifica.
- Idiomas limitados a turco e inglés; el rendimiento en castellano no está soportado ni evaluado.
- No se documentan capacidades de tool calling, agentes ni razonamiento estructurado, por lo que no debería integrarse en flujos que dependan de ellas.
- Composición del dataset de entrenamiento no declarada: no es posible evaluar sesgos ni contaminación de benchmarks.
- Estado del repositorio: cero descargas, cero valoraciones y publicación con fecha de 2026-09-21, lo que indica que no ha sido validado por la comunidad.
- Licencia Apache 2.0, que permite uso comercial y modificación siempre que se conserve el aviso de licencia y se indique los cambios; no obstante, no hay garantías de idoneidad para producción.
- Si se usa como base para fine-tuning, conviene asumir que la calidad final dependerá en gran medida de los datos aportados, dado el escaso ajuste documentado del modelo original.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/bcckfdn/cevher-test-1-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-1
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

Nota: las búsquedas web realizadas no han devuelto resultados relevantes sobre este modelo; los enlaces anteriores corresponden a las herramientas citadas en la model card y al propio repositorio. No se han encontrado papers, blogs ni demos asociados a cevher-406m.
