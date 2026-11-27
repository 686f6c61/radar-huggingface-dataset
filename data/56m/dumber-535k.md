# 56m/dumber-535k

## Resumen

Dumber-535K es un modelo de lenguaje de 535.584 parámetros entrenado desde cero por el usuario 56m sobre 1.311 millones de tokens del corpus FineWeb-Edu. Se trata de un experimento de scaling laws extremo: el autor lo presenta explícitamente como una prueba de concepto sobre arquitecturas sub-1M de parámetros, con un ratio de aproximadamente 122 tokens por parámetro (muy por encima de la referencia Chinchilla de 20 tokens por parámetro), entrenado en torno a una hora sobre una única GPU NVIDIA T4.

Arquitectura de tipo transformer con estilo Llama, hidden size de 96, vocabulario de 768 tokens y una ventana de contexto de 512 tokens. Deriva del checkpoint base 56m/Dumber-1 mediante un ajuste fino posterior. El modelo está pensado para investigación en eficiencia computacional y despliegue en el extremo, no para uso productivo general.

Su relevancia es metodológica: permite estudiar el comportamiento de curvas de escalado, dinámicas de entrenamiento y límites prácticos de la compresión de conocimiento en modelos de tamaño inferior al millón de parámetros, con un coste de entrenamiento e inferencia prácticamente despreciable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (tiny-lm) |
| Parámetros totales | 535.584 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Modelo transformer decoder-only con configuración tipo Llama, hidden size de 96 y vocabulario de 768 tokens. El contexto máximo es de 512 tokens. El checkpoint es un ajuste fino del modelo base 56m/Dumber-1, entrenado a partir de datos de FineWeb-Edu (subconjunto educativo de FineWeb).

El entrenamiento se realizó desde cero sobre aproximadamente 1.311 millones de tokens, lo que supone un ratio de unos 122 tokens por parámetro, muy superior al óptimo de Chinchilla (20 tokens/parámetro) y orientado a exprimir al máximo la capacidad del modelo en régimen de sobreentrenamiento extremo. El coste declarado es de aproximadamente una hora sobre una única NVIDIA T4. No se documentan en la información disponible detalles sobre la composición exacta del dataset, uso de RLHF/DPO, tokenizador específico ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad limitada por el tamaño del modelo.
- Razonamiento muy restringido y propenso a incoherencias en cadenas de varios pasos.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe prácticamente inexistente: el modelo está entrenado y etiquetado solo para inglés.
- Sin modo thinking, visión, audio ni capacidades multimodales.
- Útil como banco de pruebas para estudiar dinámicas de generación en modelos de escala mínima.

## Casos de uso

- Investigación en scaling laws: permite reproducir experimentos de sobreentrenamiento (122 tokens/parámetro) a coste casi nulo y comparar curvas de pérdida frente a modelos de mayor tamaño.
- Estudio de tokenizadores de vocabulario reducido: su vocabulario de 768 tokens lo convierte en un caso de prueba para analizar el impacto del tamaño del vocabulario en la calidad de generación.
- Despliegue en entornos de recursos ultralimitados: al ocupar del orden de megabytes en memoria, puede ejecutarse en microcontroladores, SBCs o dispositivos sin acelerador dedicado para pruebas de viabilidad.
- Benchmarking de frameworks de inferencia: sirve como carga mínima para validar pipelines de transformers, TGI o llama.cpp y medir overhead de arranque y latencia base.
- Docencia y divulgación: ejemplo didáctico de extremo a extremo del ciclo de entrenamiento de un LM (dataset, tokenización, entrenamiento, evaluación) sin necesidad de infraestructura.
- Generación de texto de relleno o sintético controlado en pruebas de sistemas: para validar formatos de salida, parsers y flujos de integración donde la calidad semántica no es crítica.
- Pruebas de robustez y detección de repeticiones: útil para estudiar patrones degenerados de generación (loops, alucinación) en modelos de muy baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en fp32 (535.584 parámetros × 4 bytes ≈ 2,1 MB de pesos, más overhead de activaciones y tokenizador); en la práctica cabe en cualquier GPU o CPU.
- GPU recomendadas: cualquiera; el entrenamiento declarado se realizó en una única NVIDIA T4. Funciona igualmente en A100, H100, RTX 4090 o GPUs integradas.
- Cabe en cualquier GPU de consumo, e incluso en CPU, Raspberry Pi o dispositivos embebidos.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo está etiquetado como endpoints_compatible) y, en principio, cualquier runtime compatible con safetensors. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles de forma medida; por el tamaño, se espera latencia de milisegundos y throughput muy alto en cualquier hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dumber-535K (56m) | 535.584 | 512 | Apache 2.0 | Hugging Face |
| Dumber-1 (modelo base) | No disponible | No disponible | No disponible | Hugging Face (56m/Dumber-1) |
| Alternativas sub-1M comparables | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de otros modelos sub-1M con datos verificables para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Calidad de generación muy baja: con 535K parámetros y vocabulario de 768 tokens, la coherencia semántica es extremadamente limitada.
- Riesgo elevado de repeticiones, alucinación y salidas degeneradas, tal como advierte el propio autor en la model card.
- Contexto muy corto (512 tokens), insuficiente para la mayoría de tareas conversacionales o de documentos.
- Solo inglés; sin capacidades multilingües.
- Es un checkpoint experimental de investigación ("work-in-progress preview"), no apto para producción.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre FineWeb-Edu, puede heredar sesgos del corpus, aunque su capacidad para expresarlos es muy reducida.
- Licencia Apache 2.0: permite uso comercial, pero la calidad del modelo hace inviable su uso en producto sin un propósito muy específico.
- No hay información sobre el tokenizador, la composición exacta del dataset ni evaluaciones cuantitativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/56m/dumber-535k
- Modelo base: https://huggingface.co/56m/Dumber-1
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
