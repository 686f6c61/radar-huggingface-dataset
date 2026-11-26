# Okyanus/pomona-tomato-risk-reasoner-v0.1.7-MLX

## Resumen

Pomona Tomato Risk Reasoner v0.1.7 — MLX 8-bit es una conversión cuantizada a 8 bits en formato MLX de un adaptador LoRA (`Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora`) fusionado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Lo desarrolla el autor Okyanus dentro del proyecto Pomona, una plataforma de soporte a la decisión para invernaderos de tomate. El modelo devuelve una lista JSON de etiquetas de riesgo agronómico (por ejemplo `["high_ph", "nutrient_uptake_issue"]`) o una lista vacía `[]` cuando el paquete de sensores está dentro de umbrales normales.

Se trata de una *research preview* explícitamente no apta como clasificador autónomo. Con 494 millones de parámetros y una ventana de contexto heredada de Qwen2.5-0.5B, el modelo está pensado para ejecutarse en Apple Silicon mediante `mlx-lm` y complementar, nunca sustituir, a las reglas deterministas de Pomona. La propia model card documenta que el modelo aprendió atajos espurios del dataset de entrenamiento (correlación entre fondo fijo de sensores y presencia de riesgo) y que su F1 de etiqueta en un banco de pruebas independiente es de 0,34, equivalente a responder siempre `[]`.

Su relevancia es doble: por un lado, ilustra un caso de estudio sobre fallos de generalización en modelos pequeños de razonamiento numérico; por otro, muestra un patrón de diseño defensivo (arquitectura *hybrid_guarded* donde las reglas mandan y el modelo solo acompaña) para integrar IA en dominios de alto riesgo como la agricultura de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), adaptador LoRA fusionado sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | 8 bits (MLX); existe tambien una build GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parámetros, sobre el que se aplicó un ajuste fino mediante LoRA. El adaptador resultante se fusionó en los pesos base y posteriormente se cuantizó a 8 bits para el runtime MLX de Apple Silicon. La tarea de ajuste es la clasificación de riesgo en invernadero de tomate: a partir de un paquete JSON de lecturas de sensores (pH, temperatura del aire, humedad, CE del sustrato y del invernadero, humedad del sustrato, nivel de agua), el modelo debe emitir una lista JSON restringida a doce etiquetas permitidas.

El dataset de entrenamiento (`Okyanus/greenhouse-sensor-data`) presenta un defecto estructural documentado por el autor: todos los ejemplos con etiqueta de riesgo comparten un fondo fijo de valores (CO₂ 600, luz 350, temperatura del agua 21,0; solo cambia la lectura riesgosa), mientras que los ejemplos con lecturas variadas y realistas no llevan etiqueta de riesgo. Como consecuencia, el modelo aprendió la asociación "fondo fijo implica riesgo" en lugar de los umbrales numéricos. El autor confirma que el fallo está en los pesos originales (la build GGUF y el adaptador FP32 dan las mismas respuestas), no en la conversión. No se documentan detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`) en inglés.
- Clasificación de riesgo agronómico en formato JSON restringido a doce etiquetas: `high_ph`, `low_ph`, `high_ec`, `low_ec`, `heat_stress`, `cold_stress`, `fungal_pressure`, `nutrient_uptake_issue`, `sensor_anomaly`, `missing_critical_data`, `water_level_risk`, `actuator_conflict`.
- Salida estructurada validable mediante JSON schema (la evaluación oficial usa un `format` que restringe la salida a las etiquetas permitidas).
- Cumplimiento del formato: 1,00 en JSON válido y 1,00 en etiquetas permitidas en las evaluaciones publicadas.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Multilingüismo limitado al inglés.
- No realiza comparaciones numéricas fiables contra umbrales (limitación central documentada).

## Casos de uso

- Evaluación de arquitecturas híbridas regla-modelo en dominios de alto riesgo: el modelo sirve como caso práctico para estudiar cómo un LLM de 0,5B falla en comparaciones numéricas exactas y por qué conviene mantener las reglas deterministas como autoridad.
- Etiquetado asistido con revisión humana: en modo `hybrid_guarded`, el modelo puede ejecutarse en paralelo a las reglas y sus salidas registrarse para auditoría o comparación, sin afectar a las decisiones finales.
- Investigación sobre sesgos de dataset en modelos pequeños: el fallo de generalización (correlación espuria fondo fijo-riesgo) es un ejemplo reproducible para estudiar atajos en ajuste fino supervisado.
- Prototipado en Apple Silicon: con 0,5 GB de repo y 8 bits, permite probar pipelines MLX completos (`mlx_lm.server`) en portátiles y equipos de sobremesa con chip M-series sin GPU dedicada.
- Generación de etiquetas de riesgo en formato JSON para integración en backends de telemetría agrícola, siempre detrás de un validador de esquema y de las reglas de Pomona.
- Docencia y demostraciones sobre límites de los LLM pequeños en tareas de umbral: el contraste entre F1 0,34 del modelo y 1,00 de las reglas es un material didáctico concreto.
- Filtrado previo de paquetes de sensores en pipelines de monitorización, únicamente como señal auxiliar que dispara revisión, nunca como clasificador definitivo.

## Benchmarks y rendimiento

| Evaluación | Casos | JSON válido | Etiquetas permitidas | Coincidencia exacta | F1 de etiqueta |
|---|---|---|---|---|---|
| Golden suite, modelo solo (MLX) | 15 | 1,00 | 1,00 | 0,60 | 0,60 |
| Agri Telemetry Sanity Bench `tomato_risk`, build GGUF (MLX no ejecutado) | 153 | 1,00 | 1,00 | 0,33 | 0,34 |
| Ruta protegida Pomona (reglas tras el modelo), golden | 15 | 1,00 | 1,00 | 1,00 | 1,00 |

El resultado de la golden suite se midió con `scripts/models/evaluate_tomato_risk_runtime.py` a través de `mlx_lm.server` con temperatura 0. El split de test grande no se ha ejecutado sobre esta build MLX. La fila del banco de 153 casos corresponde a la build GGUF, no a esta conversión MLX. El prompt más corto que usa el enrutador de modelos de Pomona (`services/model-router/app/tomato_reasoner.py`) obtuvo 0,31 de F1 de etiqueta en el benchmark.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,5 GB para los pesos en 8 bits; el repo completo ocupa 0,5 GB.
- Plataforma objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para CUDA.
- No requiere GPU dedicada; cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o más.
- Despliegue: `mlx_lm.server --model Okyanus/pomona-tomato-risk-reasoner-v0.1.7-MLX --port 8082`, previa instalación con `pip install mlx-lm`.
- Existe una build GGUF del mismo modelo para runtimes alternativos (llama.cpp, Ollama), aunque los benchmarks publicados de esa build son los del banco de 153 casos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pomona Tomato Risk Reasoner v0.1.7 MLX 8-bit | 494 M | no disponible | Clasificación de riesgo en invernadero de tomate | Apache 2.0 | Hugging Face (MLX y GGUF) |
| Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible en la información proporcionada | Instrucciones generales, multilingüe | Apache 2.0 | Hugging Face |
| Reglas deterministas de Pomona | no aplica (sistema experto) | no aplica | Clasificación por umbrales de sensores | Apache 2.0 (proyecto Pomona) | GitHub okyanu/pomona |

La comparación relevante no es con otro LLM, sino con las reglas deterministas del propio proyecto: el modelo obtiene F1 0,34 en el banco de 153 casos frente a 1,00 de las reglas, y ambas rutas alcanzan 1,00 en JSON válido y etiquetas permitidas. No se dispone de datos de benchmarks de otros modelos especializados en riesgo agronómico en la información proporcionada.

## Limitaciones y advertencias

- No es un clasificador autónomo: F1 de etiqueta de 0,34 en 153 casos frescos, igual que responder siempre `[]`; debe usarse solo detrás de las reglas, el verificador de seguridad y revisión humana.
- Sesgo de dataset documentado: el modelo aprendió "fondo fijo implica riesgo" en lugar de los umbrales; cambiar un campo irrelevante (`growth_stage`) puede convertir un `high_ph` correcto en `[]`.
- Memorización de plantillas: el split de test comparte plantillas con el entrenamiento y el modelo usó solo dos valores de pH alto (7,2 y 7,4) en entrenamiento.
- Riesgo de alucinación y de falsos negativos: la tendencia a responder `[]` puede ocultar riesgos reales si se usa sin supervisión.
- Idiomas: solo inglés; no hay soporte multilingüe.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el uso está restringido por diseño a asesoramiento; nunca para dosificar pesticidas o fertilizantes, cambiar fertirrigación, controlar actuadores ni diagnosticar enfermedades.
- `fungal_pressure` significa "inspeccionar el cultivo", no un diagnóstico.
- Build MLX no evaluada en el banco grande: los resultados de 153 casos corresponden a la build GGUF.
- Contexto y comportamiento en conversaciones multi-turno no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-MLX
- Adaptador LoRA de origen: https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora
- Dataset de sensores de invernadero: https://huggingface.co/datasets/Okyanus/greenhouse-sensor-data
- Benchmark Agri Telemetry Sanity Bench: https://huggingface.co/datasets/Okyanus/agri-telemetry-sanity-bench
- Plataforma Pomona (GitHub): https://github.com/okyanu/pomona
- Documentación del razonador de riesgo: https://github.com/okyanu/pomona/blob/main/docs/TOMATO_RISK_REASONER.md
- Colección Pomona: https://huggingface.co/collections/Okyanus/pomona
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
