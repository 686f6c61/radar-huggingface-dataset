# nithinragunath/cybersecurity-slm

## Resumen

Cybersecurity SLM es un modelo de lenguaje decoder-only de aproximadamente 80,66 millones de parámetros entrenado desde cero por Nithin R. (usuario `nithinragunath` en Hugging Face) sobre telemetría de ciberseguridad estructurada. El modelo no parte de pesos preentrenados: implementa una arquitectura propia inspirada en Qwen3 pero con pesos inicializados aleatoriamente, y se entrena para predecir el siguiente token sobre registros CDM18 (Common Data Model) del programa DARPA Transparent Computing. Su propósito es experimental y académico: aprender y generar continuaciones de telemetría de seguridad estructurada, no actuar como sistema de detección de intrusiones.

El modelo es deliberadamente pequeño: 4 capas, dimensión oculta de 256, 8 cabezas de atención con 2 grupos KV y una dimensión feed-forward de 768. La longitud de contexto máxima es de solo 256 tokens, lo que limita su uso a registros o fragmentos cortos. El vocabulario es de 151.643 tokens, heredado del tokenizador de Qwen3, aunque el modelo no comparte pesos con ningún modelo Qwen.

La relevancia de esta ficha es acotada: se trata de un proyecto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados más allá de las pérdidas de entrenamiento y validación. Resulta útil como referencia de cómo entrenar un modelo pequeño desde cero sobre un dominio muy específico, pero no está validado para producción ni para tareas reales de detección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inspirada en Qwen3, pesos desde cero) |
| Parametros totales | 80.658.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en `model_state.pt`, no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre telemetría estructurada, no sobre lenguaje natural multilingüe) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model_state.pt`), `config.json` y ficheros de tokenizador |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal, embeddings posicionales rotatorios (RoPE), Grouped Query Attention (GQA) con 8 cabezas de consulta y 2 grupos KV, normalización RMSNorm y capas feed-forward SwiGLU. Consta de 4 capas con dimensión oculta 256 y dimensión feed-forward 768. El tokenizador es el de Qwen3 (vocabulario de 151.643 tokens), pero el modelo no utiliza pesos preentrenados de Qwen: el entrenamiento es desde cero.

El entrenamiento se realizó sobre el dataset `nithinragunath/DT`, compuesto por 1.000.000 de registros de telemetría CDM18 estructurada (700.000 de entrenamiento, 150.000 de validación y 150.000 de test). Los registros incluyen campos como tipo de registro, versión CDM, origen y detalles de evento en JSON. Se usó el optimizador AdamW con tasa de aprendizaje 0,0001, tamaño de lote 2, acumulación de gradientes 4 (lote efectivo 8) y longitud de secuencia 256. El checkpoint seleccionado corresponde a la iteración 76.000. No se documenta uso de RLHF, DPO ni ninguna fase de alineación; el objetivo es únicamente predicción del siguiente token. No se especifica el número total de tokens vistos ni la composición detallada del dataset más allá del recuento de registros.

## Capacidades

- Generación de texto sobre telemetría de ciberseguridad estructurada: el modelo produce continuaciones de registros CDM18 en formato estructurado.
- Modelado de secuencias cortas: aprende patrones de campos como tipo de registro, versión CDM, origen y detalles JSON de eventos.
- Predicción del siguiente token en dominios de telemetría: útil para estudiar la distribución de registros sintéticos o la coherencia de esquemas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas; el entrenamiento se centra en telemetría estructurada, no en lenguaje natural.
- No dispone de modo de razonamiento (thinking), visión, audio ni otras modalidades.
- No dispone de etiquetas malicioso/benigno en el dataset, por lo que no realiza clasificación de ataques.

## Casos de uso

- Estudio de esquemas de telemetría CDM18: el modelo puede generar registros sintéticos con la estructura de campos típica (tipo de registro, versión, origen, JSON de evento) para probar parsers y validadores de esquema en pipelines de ingesta, gracias a que fue entrenado exclusivamente sobre ese formato.
- Generación de datos de prueba para entornos de desarrollo SOC: se pueden producir registros de telemetría plausibles para poblar entornos de laboratorio o pruebas de integración de SIEM, sin necesidad de datos reales sensibles, aunque con la advertencia de que las salidas pueden ser inválidas o incompletas.
- Investigación académica sobre modelos pequeños de dominio: sirve como caso de estudio reproducible de entrenamiento desde cero con 80,66 M de parámetros sobre un corpus estructurado, útil para comparar curvas de pérdida y estrategias de tokenización.
- Análisis de la coherencia de campos JSON en telemetría: el modelo puede emplearse para estudiar qué campos tienden a coocurrir y qué secuencias son más probables bajo la distribución aprendida, como paso previo a construir reglas de validación.
- Prototipado de aumentación de datos para detección de anomalías: las continuaciones generadas pueden servir como datos de aumento en experimentos de investigación, siempre que se validen y etiqueten externamente, ya que el modelo no proporciona etiquetas.
- Docencia y formación en seguridad y ML: permite ilustrar el flujo completo de entrenamiento de un transformer pequeño sobre datos de dominio, desde la tokenización hasta la evaluación por pérdida, sin requerir infraestructura de GPU de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de pérdida:

| Metrica | Valor |
|---|---:|
| Training loss | 0,5774 |
| Validation loss | 0,5374 |
| Sampled test loss | 0,6253 |

La pérdida de test se midió sobre 50 lotes de test muestreados aleatoriamente. No se proporcionan comparaciones con modelos similares ni métricas de tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: con 80,66 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,32 GB; en fp16, unos 0,16 GB. Sumando activaciones y overhead de runtime, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia puntual, dado el tamaño reducido.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: al publicarse solo como `model_state.pt` con `model.py`, el despliegue requiere cargar el estado con PyTorch y ejecutar el código del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Por tamaño (80,66 M de parámetros) y dominio (telemetría de ciberseguridad), no se han identificado alternativas directas con datos publicados en la información disponible. Se indica "no disponible" para los campos de comparación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cybersecurity SLM | 80,66 M | 256 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El dataset no proporciona etiquetas explícitas de malicioso/benigno, por lo que el modelo no puede usarse para clasificación de ataques ni detección de amenazas.
- No ha sido validado para clasificación de ataques ni para detección de amenazas en entornos reales; el propio autor lo declara como proyecto experimental.
- El entrenamiento se basa únicamente en predicción del siguiente token, sin fases de alineación (RLHF/DPO) ni ajuste instructivo.
- La longitud de contexto está limitada a 256 tokens, insuficiente para registros largos o conversaciones multi-turno.
- Las salidas generadas pueden contener telemetría inválida o incompleta; no deben usarse como datos reales sin validación.
- El tokenizador contiene IDs de token adicionales fuera del vocabulario del modelo; la inferencia debe evitar IDs no soportados para prevenir errores.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus único y cerrado (CDM18 de DARPA Transparent Computing), la distribución aprendida está fuertemente sesgada hacia ese esquema y no generaliza a otros formatos.
- Riesgo de alucinación: al ser un modelo generativo de dominio, puede producir campos o valores plausibles pero inexistentes en la telemetría real.
- Licencia MIT: permite uso comercial y modificación, pero no hay garantías ni validación de producción; el uso comercial en sistemas de seguridad requeriría validación independiente.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline definido en Hugging Face; la madurez del proyecto es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nithinragunath/cybersecurity-slm
- Dataset: https://huggingface.co/datasets/nithinragunath/DT
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
