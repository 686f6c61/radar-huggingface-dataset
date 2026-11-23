# bcckfdn/cevher3-test-11

## Resumen

cevher3-test-11 es un modelo de lenguaje de tipo decoder-only publicado por el usuario bcckfdn en Hugging Face. Se presenta como un modelo de 1.256.312.832 parámetros (aproximadamente 1,26 mil millones) entrenado con la arquitectura que el autor denomina "Gemma3-SWA", lo que sugiere una variante de la familia Gemma 3 con atención de ventana deslizante (sliding window attention). Está orientado a generación de texto conversacional y declara soporte para turco (tr) e inglés (en).

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la librería transformers y con text-generation-inference. Su contexto declarado es de 8192 tokens, un vocabulario de 65.536 entradas y 34 capas con dimensión oculta de 1792. El entrenamiento declarado asciende a 23.200 millones de tokens (23,2 B), con una pérdida de validación de 2,8047.

Por su tamaño y configuración, se posiciona en la franja de modelos pequeños aptos para inferencia en hardware de consumo, aunque la información pública es muy limitada: el repositorio no incluye resultados de benchmarks, detalles de composición del dataset ni documentación sobre alineación. La ficha refleja únicamente lo declarado por el autor y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, variante "Gemma3-SWA" (atención de ventana deslizante) |
| Parametros totales | 1.256.312.832 (1,26 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información publicada) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales declarados por el autor: 34 capas, dimensión oculta 1792, 28 cabezas de atención para Q y 4 para KV (GQA), vocabulario de 65.536 tokens, 23.200 millones de tokens de entrenamiento y mejor pérdida de validación de 2,8047.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención de ventana deslizante, etiquetada por el autor como "Gemma3-SWA". La configuración declarada (34 capas, hidden 1792, 28 cabezas Q y 4 cabezas KV) corresponde a un modelo de aproximadamente 1,26 B de parámetros con atención agrupada por consultas (GQA), lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. El contexto máximo es de 8192 tokens y el vocabulario de 65.536 entradas.

El entrenamiento declarado suma 23.200 millones de tokens, con una pérdida de validación final de 2,8047. No se especifica la composición del dataset, la proporción de turco frente a inglés, ni si se aplicaron fases de instrucción, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la ventana deslizante implícita en el nombre de la arquitectura. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, según los idiomas declarados en la model card.
- Orientación conversacional: la etiqueta "conversational" figura entre los tags del repositorio.
- Compatibilidad con text-generation-inference y con endpoints compatibles, lo que facilita su despliegue como servicio de generación.
- Integración directa con transformers mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades de visión, audio o modo "thinking": no disponible (no se declaran).
- Capacidades matemáticas o de código específicas: no disponible (no se declaran ni se aportan benchmarks).

## Casos de uso

- Generación de texto conversacional en turco: el modelo puede emplearse como base para asistentes de chat en dicho idioma, aprovechando su vocabulario de 65.536 tokens y su contexto de 8192 tokens para mantener conversaciones multi-turno de longitud moderada.
- Clasificación y etiquetado de texto en turco e inglés: al ser un modelo causal pequeño, puede adaptarse mediante fine-tuning supervisado para tareas de clasificación, análisis de sentimiento o detección de intención en pipelines de procesamiento de lenguaje natural.
- Resumen de documentos cortos: con 8192 tokens de contexto puede procesar artículos, correos o informes de extensión media y generar resúmenes, siempre que se valide la calidad con datos propios dado que no hay benchmarks publicados.
- Prototipado rápido y experimentación académica: su tamaño de 1,26 B permite ejecutarlo en una sola GPU de consumo, lo que lo hace adecuado para pruebas de concepto, ablaciones y docencia sin necesidad de infraestructura dedicada.
- Generación aumentada por recuperación (RAG) en dominios acotados: integrado con un motor de búsqueda vectorial, puede responder preguntas sobre una base documental en turco o inglés, usando el contexto recuperado dentro de la ventana de 8192 tokens.
- Despliegue en entornos con recursos limitados: gracias a su tamaño, puede servirse con text-generation-inference o transformers en una GPU de gama media para aplicaciones internas de baja concurrencia, como asistentes de documentación o chatbots de soporte.
- Fine-tuning para dominios específicos: al publicarse bajo Apache 2.0, puede ajustarse con datos propios (legal, sanitario, atención al cliente) sin restricciones de licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación del entrenamiento (2,8047) y el volumen de tokens (23.200 millones), sin métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,5 GB solo para pesos (1,26 B × 2 bytes), más el KV cache y activaciones; en la práctica, entre 4 y 6 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1,3-1,5 GB para pesos, más overhead; en 4 bits, aproximadamente 0,7-1 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para servicio de alta concurrencia; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y despliegue de baja latencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs con 8 GB si se cuantiza.
- Opciones de despliegue: transformers (referencia declarada), text-generation-inference (tag incluido) y endpoints compatibles. No se declaran variantes GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher3-test-11 | 1,26 B | 8192 | tr, en | Apache 2.0 | no disponibles |
| Gemma 3 1B (referencia de familia) | ~1 B | no disponible en esta ficha | multilingüe | Gemma Terms | sí, publicados por Google |
| Llama 3.2 1B | 1,24 B | 128k | multilingüe | Llama Community License | sí, publicados por Meta |
| Qwen2.5 1.5B | 1,54 B | 32k | multilingüe | Apache 2.0 | sí, publicados por Alibaba |

La comparación se ofrece a título orientativo por rango de tamaño; no se dispone de datos de rendimiento de cevher3-test-11 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido y debe validarse empíricamente antes de usarlo en producción.
- La model card no documenta la composición del dataset de entrenamiento, lo que impide evaluar sesgos, contaminación de datos o cobertura lingüística real.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; sin datos de alineación (RLHF/DPO) declarados, la fiabilidad factual puede ser baja.
- El soporte idiomático se limita a turco e inglés según la declaración del autor; el rendimiento en otros idiomas no está garantizado.
- El contexto de 8192 tokens es moderado; documentos más largos requerirán truncado o estrategias de recuperación.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el nombre del repositorio ("test") y la ausencia de documentación sugieren que se trata de una publicación experimental, no de un modelo validado para producción.
- No se ofrecen pesos cuantizados oficiales; cualquier cuantización corre a cargo del usuario y puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-11
