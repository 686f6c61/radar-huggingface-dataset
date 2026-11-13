# Design-Thinking-SLM/smart-home-energy-slm

## Resumen

Smart-Home Appliance Energy SLM es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, desarrollado por el equipo Design-Thinking-SLM, orientado a responder preguntas de corto horizonte (entre 10 minutos y 24 horas) sobre el consumo eléctrico de electrodomésticos en un hogar. El modelo no es un LLM independiente, sino un ajuste fino por instrucciones del pequeño modelo base de Qwen (0,5 mil millones de parámetros), lo que lo convierte en un componente ligero para integrarse en un hub doméstico de energía sin requerir hardware de inferencia de gama alta.

El problema que aborda es acotado pero realista: traducir lecturas de un contador eléctrico agregado (Wh por intervalos de 10 minutos) en respuestas sobre clasificación de consumo, comparaciones entre franjas horarias, estimaciones puntuales y detección de datos no soportados por la evidencia. El modelo ha sido entrenado explícitamente para responder solo a partir de la evidencia presente en el prompt y para rechazar preguntas sobre ocupación, consumo por electrodoméstico individual, tarifas o fallos, que los datos del contador no permiten responder.

Su relevancia actual reside en dos factores. Por un lado, demuestra un patrón de ajuste fino muy económico: 25.027 pares prompt/completación, 2 épocas, 1.564 pasos y aproximadamente 1,5 horas de entrenamiento en una GPU de portátil con 8 GB de VRAM (RTX 5060 Laptop). Por otro, ejemplifica el uso de adaptadores LoRA especializados en dominios verticales concretos, en lugar de depender de modelos generalistas de gran tamaño para tareas de razonamiento numérico acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parámetros totales | 0,5 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de longitud máxima durante el entrenamiento; la longitud de contexto nativa del modelo base Qwen2.5-0.5B-Instruct no se detalla en la información proporcionada |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones estándar de Qwen2.5, pero no se documentan en la ficha) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen2.5-0.5B-Instruct por separado |
| Librería | peft |
| Pipeline | text-generation |
| Dataset de entrenamiento | Design-Thinking-SLM/smart-home-energy-slm (derivado de UCI Appliances Energy Prediction) |
| Hiperparámetros LoRA | r=16, alpha=32, dropout 0,05, todas las capas lineales |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. El ajuste se realizó con TRL `SFTTrainer` en modalidad de supervisión por instrucciones, con pérdida calculada únicamente sobre las completaciones (loss on completions only), lo que evita que el modelo aprenda a reproducir los prompts. Los hiperparámetros del adaptador son r=16, alpha=32, dropout 0,05, aplicados a todas las capas lineales. El entrenamiento usó 2 épocas, 1.564 pasos con batch efectivo de 32, learning rate 2e-4 con schedule coseno y 50 pasos de warmup, en precisión bf16 y longitud máxima de 512 tokens.

Los datos provienen del dataset UCI *Appliances Energy Prediction* (Candanedo et al., 2017), que registra el consumo eléctrico de una vivienda de bajo consumo en Bélgica entre enero y mayo de 2016, con lecturas cada 10 minutos. El equipo construyó 25.027 pares prompt/completación a partir de ese dataset, cubriendo tareas como clasificación de niveles de consumo, comparaciones entre franjas, estimaciones puntuales y rechazo explícito de preguntas no respondibles con los datos del contador. No se documenta el uso de RLHF ni DPO; el ajuste es exclusivamente SFT.

La innovación técnica destacable no está en la arquitectura, sino en el diseño del dataset de instrucciones: se incluyen tareas trampa (unidades y costes, premisas falsas, variables de ruido rv1/rv2, sensores exteriores usados en comparaciones de interiores) para forzar al modelo a rechazar preguntas que el contador agregado no puede responder. Este enfoque de "responder solo desde la evidencia" es relevante para despliegues en producción donde la alucinación numérica es costosa.

## Capacidades

- Generación de texto conversacional en inglés, orientada a preguntas y respuestas sobre consumo eléctrico doméstico.
- Clasificación de niveles de consumo a partir de lecturas en Wh por intervalos de 10 minutos.
- Comparación de consumo entre franjas horarias o días, cuando la evidencia está presente en el prompt.
- Estimación puntual de consumo a corto horizonte (10 minutos a 24 horas), con resultados aproximados.
- Rechazo explícito ("cannot be determined") ante preguntas sobre ocupación, consumo por electrodoméstico individual, tarifas eléctricas o fallos, cuando los datos del contador no lo permiten.
- Manejo de tareas trampa: unidades y costes, premisas falsas, variables de ruido y comparaciones con sensores exteriores.
- Formato conversacional mediante `apply_chat_template` del tokenizador de Qwen.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente de consulta energética en un hub doméstico: el modelo responde en lenguaje natural a preguntas del usuario sobre el consumo de las últimas horas a partir de las lecturas del contador, integrado en un panel o aplicación móvil. Es adecuado por su tamaño reducido (0,5B) y su capacidad de responder solo con la evidencia del prompt.
- Clasificación automática de picos de consumo: dado un valor en Wh y una marca temporal, el modelo etiqueta el nivel de consumo (por ejemplo, "peak", "moderate", "low") según los umbrales aprendidos de la vivienda de entrenamiento. Útil para generar alertas en sistemas de gestión energética doméstica.
- Generación de resúmenes diarios de consumo: a partir de una serie de lecturas, el modelo produce una explicación textual de las franjas de mayor y menor consumo, pensada para informes automáticos al usuario final.
- Detección de preguntas no respondibles como capa de seguridad: el modelo rechaza consultas sobre ocupación, tarifas o fallos, lo que permite filtrar peticiones fuera de alcance antes de escalarlas a otro componente del sistema.
- Prototipado rápido de asistentes verticales de energía: al ser un adaptador LoRA sobre un modelo de 0,5B, se puede desplegar en hardware modesto y servir como base para experimentar con nuevos dominios o datasets antes de invertir en modelos mayores.
- Educación y concienciación energética: el modelo puede explicar en lenguaje sencillo qué significan las lecturas del contador y por qué ciertas preguntas no se pueden responder con datos agregados, útil en aplicaciones divulgativas.
- Integración en pipelines de investigación sobre SLM especializados: sirve como referencia reproducible de ajuste fino LoRA con TRL sobre un dataset derivado de UCI, para estudiar técnicas de rechazo y calibración en dominios numéricos.

## Benchmarks y rendimiento

Los únicos datos publicados son de validación interna (4.342 ejemplos) y una comprobación puntual, no benchmarks estándar como MMLU, HumanEval o GSM8K.

| Métrica | Paso 200 | Paso 600 | Paso 1000 | Paso 1400 | Paso 1564 (final) |
|---|---|---|---|---|---|
| Validation loss | 0,074 | 0,051 | 0,044 | 0,040 | 0,040 |
| Token accuracy | 97,5% | 98,0% | 98,3% | 98,5% | 98,5% |

Comprobación puntual (un ejemplo de test por tarea, 14 tareas): 10 coincidencias exactas. Todas las tareas de rechazo y trampa (no respondible, unidades/coste, premisa falsa, variables de ruido rv1/rv2, sensor exterior en comparación de interiores) se respondieron correctamente. La evaluación completa por tarea sobre el conjunto de test está pendiente según la model card.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B-Instruct en bf16 ocupa aproximadamente 1 GB de pesos; con el adaptador LoRA y overhead de activaciones, el consumo estimado se sitúa en torno a 2-3 GB en bf16 y por debajo de 1,5 GB en cuantización de 4 bits (estimación orientativa, no documentada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; el propio entrenamiento se realizó en una RTX 5060 Laptop con 8 GB.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090, así como en iGPU con suficiente memoria compartida y en CPU para inferencia en lote pequeño.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card con `AutoPeftModelForCausalLM`), y previsiblemente llama.cpp, Ollama o vLLM tras fusionar el adaptador con el modelo base y exportar a GGUF, aunque estas rutas no están documentadas por el autor.
- Latencia y throughput: no disponibles. El entrenamiento (1.564 pasos, batch efectivo 32, 512 tokens) requirió aproximadamente 1,5 horas en una RTX 5060 Laptop, lo que da una idea del orden de magnitud del coste computacional, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart-Home Appliance Energy SLM (este) | 0,5B + LoRA | 512 tokens de entrenamiento | Energía doméstica (contador agregado) | Apache 2.0 | Hugging Face, adaptador PEFT |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | Propósito general, instrucciones | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Propósito general, instrucciones | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 0,36B | no disponible en esta ficha | Propósito general, instrucciones | Apache 2.0 | Hugging Face |

La comparación con alternativas especializadas en energía doméstica no está disponible: no se han identificado en la información proporcionada otros adaptadores LoRA públicos con el mismo dominio y dataset. Frente al modelo base, la diferencia clave es la especialización en tareas de consumo eléctrico y el comportamiento de rechazo ante preguntas no respondibles, a costa de perder generalidad y de heredar las limitaciones del modelo base de 0,5B.

## Limitaciones y advertencias

- Aritmética y datos de calendario poco fiables: en la comprobación puntual el modelo sumó mal tres valores horarios y dio un día de la semana incorrecto para una fecha. En producción, los cálculos y las fechas deben resolverse en código y el modelo limitarse a explicarlos.
- Previsiones aproximadas: las estimaciones son puntos únicos (por ejemplo, 600 Wh frente a 640 Wh esperados), sin intervalos de confianza.
- Sesgo de dominio: entrenado con una única vivienda de bajo consumo en Bélgica (enero-mayo de 2016); umbrales como "peak" son específicos de esa vivienda y no se generalizan a otros hogares, climas o estaciones.
- Cobertura temporal limitada: los datos de entrenamiento cubren solo de enero a mayo de 2016, por lo que el modelo no ha visto patrones de verano, invierno completo ni años posteriores.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas, aunque el modelo base Qwen2.5 es multilingüe.
- Contexto corto: la longitud máxima de entrenamiento es de 512 tokens, lo que limita la cantidad de lecturas que se pueden incluir en un mismo prompt.
- Riesgo de alucinación numérica: aunque el modelo ha sido entrenado para rechazar preguntas no respondibles, la model card no documenta una evaluación completa por tarea sobre el conjunto de test, por lo que la tasa de error real en producción es desconocida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct tiene su propia licencia Apache 2.0, que debe respetarse al redistribuir el adaptador.
- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autónomo; requiere cargar el modelo base y no puede desplegarse como un único fichero de pesos sin fusionar previamente.
- Sin soporte documentado de tool calling, agentes, visión ni audio: no debe asumirse ninguna de estas capacidades en un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Design-Thinking-SLM/smart-home-energy-slm
- Dataset de entrenamiento: https://huggingface.co/datasets/Design-Thinking-SLM/smart-home-energy-slm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper de origen de los datos (Candanedo et al., 2017): https://doi.org/10.1016/j.enbuild.2016.12.083
- Dataset UCI Appliances Energy Prediction: https://archive.ics.uci.edu/dataset/374/appliances+energy+prediction
- Perfil de Ojas Chaudhary: https://huggingface.co/Ojas1004
- Perfil de omsai: https://huggingface.co/omsai9
- Perfil de nandhakishore: https://huggingface.co/nandhakishore08764709483
