# root43/Llama-3.1-8B-ltccs-v1

## Resumen

Llama-3.1-8B-ltccs-v1 es un ajuste fino supervisado del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario root43. El modelo está especializado en una única tarea del dominio de la seguridad vial: a partir de una narrativa de accidente del estudio estadounidense Large Truck Crash Causation Study (LTCCS), identifica el vehículo implicado y el código de razón crítica (uno de 63 posibles) que explica el siniestro.

Se trata de un prototipo de investigación que parte de la arquitectura transformer densa de Llama 3.1 8B (8.030.261.248 parámetros) y aplica un adaptador LoRA fusionado en los pesos base. El resultado es un modelo de 16 GB en bf16 que emite exclusivamente JSON con la estructura `{"vehicle": N, "critical_reason_code": N}`.

Su relevancia es acotada y muy específica: demuestra que un ajuste fino pequeño (741 casos de entrenamiento) sobre un modelo generalista de 8B puede alcanzar un 63,0% de acierto exacto en una clasificación de 63 clases cerradas, con una latencia p50 de 0,8 s en vLLM sobre una GPU L40S. No está pensado para uso general ni para conversación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de entrenamiento; el modelo base soporta más) |
| Tipos de cuantizacion | bf16 en el repo; conversión a GGUF posible vía llama.cpp (no se especifican variantes concretas) |
| Idiomas soportados | no disponible (las narrativas LTCCS están en inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16, ~16 GB) |

## Arquitectura y entrenamiento

El modelo es un Llama 3.1 8B Instruct estándar: transformer decoder-only denso con atención causal, sin mezcla de expertos ni mecanismos híbridos. Sobre esa base se aplicó un adaptador LoRA con r=16, alpha=32, dropout 0,05, aplicado a todas las capas lineales, durante 3 épocas con learning rate 2e-4 y schedule coseno, longitud máxima de 8.192 tokens. El conjunto de entrenamiento consta de 741 casos con 100 reservados para validación; el checkpoint final se seleccionó por exactitud de código exacto en validación (paso 279). Posteriormente el adaptador se fusionó en los pesos base (merge), y el repositorio incluye un `merge_info.json` con el SHA-256 del adaptador y el método de fusión.

No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO adicionales. El prompt de inferencia es fijo: un system prompt que describe la tarea y la lista de códigos, seguido de la narrativa del caso como mensaje de usuario. El modelo responde con JSON estricto de dos campos.

## Capacidades

- Clasificación de causa de accidente: identifica el vehículo responsable y el código de razón crítica (63 clases) a partir de narrativas LTCCS.
- Salida estructurada: genera JSON con el formato `{"vehicle": N, "critical_reason_code": N}`.
- Razonamiento sobre texto narrativo largo: procesa narrativas de accidente completas dentro de una ventana de 8.192 tokens.
- Herencia del modelo base: conserva las capacidades generales de Llama 3.1 8B Instruct, aunque el autor advierte que con prompts de chat generales el rendimiento es inferior al del modelo base.
- Tool calling y function calling: no documentado para esta variante; disponible en el modelo base pero no garantizado tras el ajuste fino.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; el corpus de entrenamiento es estadounidense y en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Análisis retrospectivo de siniestros de tráfico pesado: dado un informe narrativo de un accidente de camión, el modelo extrae el vehículo y el código de causa crítica para su tabulación estadística, sustituyendo la codificación manual de analistas.
- Investigación académica en seguridad vial: permite replicar o ampliar estudios sobre causas de accidentes LTCCS con codificación automatizada y consistente, reduciendo el sesgo entre codificadores humanos.
- Preetiquetado para revisión humana: en un flujo de anotación, el modelo genera una primera propuesta de código que un experto valida, acelerando el proceso de codificación de grandes volúmenes de narrativas.
- Prototipado de pipelines de extracción estructurada: sirve como referencia para evaluar la viabilidad de modelos de 8B en tareas de clasificación cerrada con salida JSON, antes de invertir en modelos mayores.
- Docencia y experimentación con LoRA: el repositorio documenta hiperparámetros, selección de checkpoint y métricas, lo que lo convierte en un ejemplo reproducible de ajuste fino de Llama 3.1 para una tarea vertical.
- Despliegue en infraestructura modesta: con conversión a GGUF puede ejecutarse en portátiles vía Ollama o LM Studio para pruebas offline de clasificación de casos, sin depender de GPUs de datacenter.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado de 200 accidentes con decodificación greedy:

| Metrica | Resultado |
|---|---|
| Vehículo correcto | 95,5% |
| Vehículo + categoría de razón correctos | 74,0% |
| Vehículo + código exacto (de 63) | 63,0% (IC 95%: 56,1–69,4%) |
| Latencia p50 (vLLM, 1× L40S) | 0,8 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: ~16 GB en bf16 para los pesos; con cuantización a 8 bits bajaría a ~8-9 GB y a 4 bits a ~5-6 GB (estimación según el tamaño de parámetros, no verificada por el autor).
- GPU recomendadas: L40S (la utilizada por el autor para medir latencia), A100, H100 para despliegue en producción; RTX 4090 (24 GB) suficiente para bf16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB requiere cuantización GGUF de 4-8 bits.
- Opciones de despliegue: vLLM (`vllm serve <repo> --max-model-len 8192`), llama.cpp para conversión a GGUF, Ollama y LM Studio para ejecución local.
- Latencia y throughput: p50 de 0,8 s por petición en vLLM sobre una L40S con decodificación greedy; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-ltccs-v1 | 8,03B | 8.192 (entrenamiento) | Clasificación LTCCS | llama3.1 | Hugging Face (root43) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | Propósito general | llama3.1 | Hugging Face (Meta) |
| Llama-3.1-8B base | 8,03B | 128K | Propósito general | llama3.1 | Hugging Face (Meta) |

La comparación directa con alternativas especializadas en codificación de accidentes no está disponible: no se conocen modelos públicos equivalentes para la tarea LTCCS en la información proporcionada. Frente al modelo base, la variante ltccs-v1 gana en precisión sobre la tarea específica pero pierde rendimiento en conversación general, según advierte el propio autor.

## Limitaciones y advertencias

- Prototipo de investigación: el autor prohíbe explícitamente su uso para decisiones reales de reclamaciones, responsabilidad civil o seguridad.
- Un 37% de los casos no obtiene el código exacto en el test reservado, y un 26% falla al menos en la categoría de razón; el margen de error es sustancial para cualquier uso automatizado.
- Entrenado con solo 741 casos, lo que limita la generalización a distribuciones de accidentes distintas de las del estudio LTCCS.
- Requiere el prompt exacto de entrenamiento (system prompt con la lista de códigos); con prompts de chat generales el comportamiento es peor que el del modelo base.
- Sesgos potenciales heredados de Llama 3.1 y del corpus LTCCS (contexto estadounidense, sesgos de recogida de datos del estudio original); no documentados por el autor.
- Riesgo de alucinación en la salida JSON: puede emitir códigos o números de vehículo fuera del conjunto válido si la entrada se desvía del formato esperado; no se documenta validación de esquema.
- Idiomas: no se documenta soporte multilingüe; el dominio de entrenamiento es anglófono.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (atribución "Built with Llama", política de uso aceptable y umbral de 700 millones de usuarios mensuales para licencia adicional); conviene revisar `LICENSE` y `USE_POLICY.md` antes de producción.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), por lo que no hay evidencia externa de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root43/Llama-3.1-8B-ltccs-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Política de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy/
- Estudio LTCCS (NHTSA): https://www.nhtsa.gov/crash-data-systems/large-truck-crash-causation-study
