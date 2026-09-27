# jinghao1632/bit-jev-2b-distilled

## Resumen

bit-jev-2b-distilled es un modelo de decisión estructurada, no un modelo generativo de lenguaje. Se construye a partir del backbone de Microsoft BitNet b1.58 2B (arquitectura tipo transformer con pesos ternarios de 1,58 bits) mediante ajuste fino con LoRA y la incorporación de una cabeza de puntero (pointer head) que puntúa directamente las opciones candidatas presentes en la entrada. El resultado no es una respuesta en lenguaje natural, sino una selección, una probabilidad o un orden de preferencia sobre un conjunto de candidatos.

El proyecto lo desarrolla el autor identificado como Zeaulo (repositorio jinghao1632 en HuggingFace) y su rasgo diferencial es la orientación a inferencia en CPU nativa: el paquete se distribuye como un GGUF cuantizado en formato I2_S más una cabeza de puntero en float32, pensado para un runner de CPU propio, sin necesidad de GPU. El modelo cuenta con 2.412.820.480 parámetros totales y el repositorio ocupa aproximadamente 1,2 GB, lo que lo sitúa en el rango de modelos que caben cómodamente en hardware de consumo.

Es relevante ahora porque explora una vía distinta a la generación token a token para tareas de decisión: en lugar de que el modelo redacte una respuesta, la cabeza de puntero compara candidatos y devuelve una distribución de probabilidad, lo que reduce la superficie de alucinación en escenarios de clasificación y elección. El entrenamiento se realiza por destilación de conocimiento a partir de un profesor Kev 9B y se apoya en un conjunto de datos de decisión multi-fuente (`decision-v7`) que incluye reseñas de Yelp, dato que condiciona el régimen de licencia (ver "Limitaciones y advertencias").

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58) y cabeza de puntero (pointer head) |
| Parametros totales | 2.412.820.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I2_S (backbone en GGUF); cabeza en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo no tiene licencia de pesos abiertos propia; la Apache-2.0 del repositorio de código no se aplica al checkpoint) |
| Formato de pesos | GGUF (backbone `backbone-i2_s.gguf`), `head.f32` y `pointer.json`; no se publican safetensors BF16 |
| Modelo base | microsoft/bitnet-b1.58-2B-4T-bf16 |
| Temperatura de la cabeza | 2,35 (indicada en `pointer.json`) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Microsoft BitNet b1.58 2B, una arquitectura transformer cuyos pesos son ternarios (valores {-1, 0, 1}, equivalentes a 1,58 bits por peso), lo que abarata la inferencia en CPU. Sobre ese backbone se aplica un ajuste fino con LoRA y se entrena una cabeza de puntero que opera sobre las representaciones de los tokens candidatos del propio contexto, en lugar de generar texto de salida. Después, el conjunto completo se somete a una destilación sobre las logits de candidatos de un profesor Kev 9B, y finalmente se exporta la cuantización I2_S.

Los hiperparámetros registrados en la configuración de entrenamiento son: 3.144 pasos, 2 épocas, precisión BF16, ratio de aprendizaje 2e-5, tamaño de lote 2, acumulación de gradiente 4, temperatura de destilación 2,0 y peso de destilación 1,0. La cabeza de puntero opera con temperatura 2,35, definida en `pointer.json`. El modelo no genera tokens de lenguaje natural: la salida es una puntuación sobre los candidatos de entrada, por lo que métricas como tokens/s no son aplicables. La innovación técnica destacable es precisamente esta cabeza de decisión estructurada sobre un backbone ternario orientado a CPU.

## Capacidades

- Decisión estructurada en tres modalidades: `choice` (elegir entre un conjunto de opciones, devolviendo selección, score y probabilidad), `noul` (preguntas de sí/no con dos clases de score y probabilidad) y `score` (niveles ordenados, devolviendo score de nivel, valor esperado y probabilidad).
- Procesamiento de una entrada compartida `state` junto con uno o varios problemas, con puntuación directa de los candidatos mediante la cabeza de puntero.
- Salida determinista y acotada al conjunto de candidatos, lo que limita la generación libre de texto.
- Inferencia nativa en CPU mediante el runner propio del proyecto (`bit-jev-cpu`), con soporte de ejecución multihilo y por lotes.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso autónomo, visión, audio ni modo de razonamiento explícito ("thinking mode").
- No se especifican capacidades multilingües ni idiomas soportados.

## Casos de uso

- Clasificación de opiniones y moderación de reseñas: entrenado sobre un conjunto de decisión multi-fuente que incluye reseñas de Yelp, el modelo puede puntuar categorías, niveles de valoración o etiquetas de sentimiento presentando los candidatos como opciones y leyendo la probabilidad devuelta por la cabeza de puntero.
- Triage y encaminamiento de tickets: dado el texto de una incidencia como `state` y un conjunto de categorías o equipos como candidatos, el modelo devuelve la opción más probable, adecuado para enrutado automático en atención al cliente.
- Encuestas y formularios con respuesta cerrada: la modalidad `score` permite asignar un nivel ordenado (por ejemplo, una escala de satisfacción) con valor esperado y probabilidad, útil para agregar respuestas y medir incertidumbre.
- Sistemas de recomendación por elección entre alternativas: dado un conjunto de productos, rutas o contenidos como candidatos y el contexto del usuario como `state`, el modelo elige la opción con mayor score.
- Validación de reglas de negocio y decisiones binarias: la modalidad `noul` admite preguntas de sí/no (por ejemplo, aprobar o denegar una solicitud) con dos clases de probabilidad, integrable en flujos con revisión humana.
- Evaluación de candidatos en procesos de selección estructurados: puntuación ordenada de perfiles descritos en el contexto frente a criterios definidos como niveles, siempre con validación sobre datos propios y revisión humana.
- Despliegue en entornos sin GPU: al ejecutarse en CPU nativa con un paquete de ~1,2 GB y un consumo de memoria de proceso en torno a 1,6 GiB, encaja en servidores sin acelerador o en estaciones de trabajo modestas.
- Procesamiento por lotes de decisiones repetitivas: el runner admite entrada JSONL y ejecución con múltiples hilos, adecuado para puntuar grandes volúmenes de solicitudes con estructura fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no existen informes públicos de Accuracy, Brier, NLL, ECE ni intervalos de confianza sobre un conjunto de retención, y advierte que los benchmarks del BitNet original de Microsoft corresponden a otra medición y no son atribuibles a este modelo.

La única medición publicada es un caso de una sola pregunta de desarrollo (703 tokens de entrada, 77 candidatos) en AutoDL con Xeon Gold 6459C y RTX 5090, sin contar el tiempo de carga:

| Ruta | Tiempo medio de inferencia | Repeticiones | Memoria observada |
|---|---:|---:|---:|
| CPU, 8 hilos | 3.127,88 ms | 3 | RSS de pico del proceso 1.622,74 MiB |
| CPU, 16 hilos | 1.972,17 ms | 3 | RSS de pico del proceso 1.624,52 MiB |
| RTX 5090 | 86,56 ms | 5 | Asignación de pico en GPU 4.935,53 MiB |

El propio autor advierte que la ruta de CPU y la de GPU usan formatos de peso y precisión distintos, que la ratio de latencia (~22,8 entre 16 hilos y GPU) no es una medida pura de aceleración hardware, y que RSS de CPU y asignación de GPU no son magnitudes comparables. Se trata de una única pregunta con pocas repeticiones, sin valor extrapolable a throughput ni a precisión general.

## Requisitos de hardware

- VRAM estimada para inferencia: la ruta experimental en GPU reporta una asignación de pico de 4.935,53 MiB (aproximadamente 4,8 GiB) para una entrada de 703 tokens y 77 candidatos; el valor puede variar con la longitud de entrada y el número de candidatos.
- Memoria en CPU: el proceso alcanza un RSS de pico de ~1,62 GiB en las pruebas publicadas (8 y 16 hilos).
- GPU recomendadas: no se especifican oficialmente; la única medida reportada usa una RTX 5090 mediante una ruta experimental FP16 en PyTorch. Otros modelos de la misma generación o superiores (A100, H100, RTX 4090) no han sido probados ni documentados.
- Cabe en GPU de consumo: con ~4,8 GiB de asignación observada, cabría en tarjetas con 8 GB o más de VRAM, aunque no se ha publicado una validación formal en hardware de consumo distinto de la RTX 5090.
- Despliegue: la ruta soportada es el runner nativo de CPU del proyecto (`bit-jev-cpu`, binario en `core/build/bit-jev-cpu/`), invocado mediante `python -m bit_jev.cpu` con parámetros de hilos y lote. La ruta GPU es experimental (FP16 mixta en PyTorch). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en el caso publicado, 1,97 s por pregunta en CPU a 16 hilos y 86,56 ms en RTX 5090. No se reporta throughput agregado. Al no generar tokens, la métrica de tokens/s no es aplicable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bit-jev-2b-distilled | 2.412.820.480 | no disponible | Decisión estructurada (puntero) | no disponible | GGUF I2_S + head.f32 |
| microsoft/bitnet-b1.58-2B-4T-bf16 (modelo base) | ~2B | no disponible | Generación de lenguaje | Licencia de modelos de Microsoft (aplicable solo al modelo base) | Safetensors BF16 |
| Kev 9B (profesor de destilación) | ~9B | no disponible | Logits de candidatos (profesor) | Licencia de código fuente propia (no aplicable al derivado) | no disponible como paquete de inferencia del estudiante |

No se dispone de información sobre otros modelos de decisión estructurada con cabeza de puntero comparables directamente. La comparación con el modelo base y con el profesor es únicamente de origen arquitectónico, no de rendimiento, ya que no se han publicado métricas de precisión reproducibles para este checkpoint.

## Limitaciones y advertencias

- Riesgo de sesgo procedente de los datos de entrenamiento: el conjunto `decision-v7` incluye reseñas de Yelp, por lo que los sesgos de esa fuente pueden trasladarse a las decisiones del modelo.
- Alucinación no aplicable en el sentido generativo (no produce texto libre), pero la selección puede ser incorrecta: los resultados dependen del fraseo, el orden y la longitud de los candidatos y de la distribución de entrenamiento.
- Ausencia de métricas públicas de precisión, calibración (ECE, Brier) o NLL: no hay evidencia reproducible de calidad sobre un conjunto de retención.
- Restricción de licencia grave: el modelo no tiene licencia de pesos abiertos propia; la Apache-2.0 del repositorio de código, la licencia de modelos base de Microsoft y la licencia del código de Kev se aplican cada una a su obra y no al checkpoint derivado. Además, existe una solicitud de permiso a Yelp sobre pesos derivados sin respuesta escrita a fecha de 2026-09-28.
- Uso comercial sujeto a revisión legal: el descargador debe comprobar los términos aplicables a los datos de Yelp y su efecto sobre los pesos derivados antes de cualquier uso en producción.
- Limitación de eficiencia en peticiones multi-pregunta: el runner nativo de CPU ejecuta una secuencia causal por pregunta, por lo que en solicitudes con varias preguntas se reprocesa el `state` compartido.
- Extrapolación limitada de las medidas de rendimiento: la única medición proviene de una sola pregunta de desarrollo con pocas repeticiones, sin cobertura de entradas largas, múltiples preguntas ni otro hardware.
- El repositorio no incluye safetensors BF16, datos de entrenamiento, registros de entrenamiento ni reseñas originales, lo que dificulta la reproducibilidad y la auditoría.
- Sin información de idiomas soportados ni de contexto máximo, por lo que no puede garantizarse su comportamiento fuera de la distribución de entrenamiento.
- Para decisiones sensibles se recomienda validación sobre datos propios y revisión humana obligatoria.

## Enlaces

- HuggingFace: https://huggingface.co/jinghao1632/bit-jev-2b-distilled
- Repositorio de código del proyecto: https://github.com/Zeaulo/bit-jev
- Guía rápida de CPU (chino): https://github.com/Zeaulo/bit-jev/blob/main/docs/CPU_QUICKSTART.zh-CN.md
- Modelo base: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T-bf16
