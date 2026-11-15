# ErikaStudent/FineTuning_OpenSource_Model

## Resumen

El modelo `ErikaStudent/FineTuning_OpenSource_Model` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-0.6B` para una tarea concreta de clasificación de incidencias de soporte técnico en español, con salida estructurada en JSON. Lo desarrolla el usuario ErikaStudent y se publica bajo licencia Apache 2.0. No es un modelo completo, sino un conjunto de pesos de adaptador que deben cargarse junto al modelo base Qwen3-0.6B para funcionar.

El problema que aborda es acotado: dada una incidencia ficticia de atención al cliente, el modelo debe devolver un objeto JSON con tres claves (`categoria`, `prioridad` y `respuesta`), restringiendo la categoría a `facturacion`, `soporte_tecnico`, `cuenta` o `envios`, y la prioridad a `baja`, `media` o `alta`. El modelo base Qwen3-0.6B aporta una arquitectura transformer densa con aproximadamente 0,6 mil millones de parámetros y una ventana de contexto amplia, aunque el adaptador se ha entrenado con secuencias de hasta 512 tokens.

Su relevancia es fundamentalmente didáctica y de referencia: ilustra un flujo completo de fine-tuning supervisado con LoRA sobre un modelo pequeño, con evaluación comparativa frente a zero-shot y few-shot, y con un análisis explícito de errores. No está pensado para producción real, tal como advierte el propio autor, y su tamaño de repositorio es de 0,0 GB, coherente con un adaptador de bajo rango.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B) con adaptador LoRA sobre proyecciones de atención |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-0.6B tiene ~0,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó `max_length=512` |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización, pero no se detalla) |
| Idiomas soportados | Español (`es`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen3-0.6B |

## Arquitectura y entrenamiento

El adaptador se entrena mediante Supervised Fine-Tuning (SFT) con PEFT/LoRA sobre el modelo causal Qwen3-0.6B. La configuración LoRA es fija: rango `r=16`, `lora_alpha=32` y `lora_dropout=0.05`, aplicada a los módulos `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atención. El entrenamiento se realizó durante 3 épocas con un tamaño de lote efectivo de 16 (`per_device_train_batch_size=4` y `gradient_accumulation_steps=4`), tasa de aprendizaje `2e-4`, longitud máxima de 512 tokens y precisión `fp16` sobre una GPU T4. Se empleó la plantilla de chat oficial de Qwen3 con `enable_thinking=False`.

El conjunto de datos es sintético y ficticio, en español, sin información personal ni credenciales, y se dividió sin duplicados en 150 ejemplos de entrenamiento, 30 de validación y 30 de prueba. Cada ejemplo asocia una incidencia a un JSON con las claves `categoria`, `prioridad` y `respuesta`. No se documenta el uso de RLHF ni DPO; se trata exclusivamente de SFT. La innovación técnica es modesta: el valor está en la restricción estructural de la salida a JSON válido y en la comparación controlada entre zero-shot, few-shot y LoRA bajo los mismos parámetros de generación (`max_new_tokens=150`, `do_sample=False`).

## Capacidades

- Generación de texto en español orientada a una tarea de clasificación de incidencias de soporte técnico.
- Salida estructurada en JSON válido con las claves `categoria`, `prioridad` y `respuesta`.
- Clasificación en cuatro categorías cerradas: `facturacion`, `soporte_tecnico`, `cuenta` y `envios`.
- Asignación de prioridad en tres niveles: `baja`, `media` y `alta`.
- Generación de una respuesta breve y profesional al cliente dentro del mismo JSON.
- Uso de la plantilla de chat oficial de Qwen3 con el modo de pensamiento desactivado (`enable_thinking=False`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al español según la model card; no se declaran otros idiomas.

## Casos de uso

- Prototipado de triaje de tickets: el modelo recibe el texto de una incidencia y devuelve categoría y prioridad en JSON, lo que permite enrutar tickets a colas distintas en un sistema de helpdesk. Es adecuado para demostrar el flujo, no para producción sin supervisión.
- Extracción de campos estructurados en pipelines de datos: al forzar JSON con claves fijas, se puede integrar en un script que parsee la salida y la cargue en una base de datos o en una hoja de cálculo.
- Generación de borradores de respuesta al cliente: la clave `respuesta` produce un texto breve y profesional que un agente humano puede revisar y editar antes de enviarlo.
- Docencia y material de referencia sobre fine-tuning: sirve como ejemplo reproducible de SFT con LoRA sobre un modelo pequeño, con evaluación comparativa frente a zero-shot y few-shot y análisis de errores documentado.
- Evaluación de estrategias de prompting: permite comparar, con los mismos parámetros de generación, el rendimiento de zero-shot, few-shot y ajuste fino sobre una tarea de clasificación cerrada.
- Clasificación por lotes de incidencias sintéticas: para generar datasets etiquetados de prueba o para validar reglas de negocio antes de invertir en un modelo mayor.
- Base para ampliaciones: el adaptador puede servir de punto de partida para aumentar el dataset (de 150 a 300 ejemplos, según propone el autor) y reentrenar con más épocas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 30 casos de test, con `max_new_tokens=150`, `do_sample=False` y sin reparación automática de JSON:

| Condición evaluada | JSON válido | Acierto categoría | Acierto prioridad |
|---|---|---|---|
| Modelo base (zero-shot) | 80,0 % | 20,0 % | 40,0 % |
| Modelo base (few-shot) | 100,0 % | 80,0 % | 30,0 % |
| Modelo ajustado (LoRA) | 100,0 % | 56,7 % | 50,0 % |

Conclusiones recogidas por el autor: few-shot y LoRA eliminan los errores de esquema del zero-shot (que añadía claves no solicitadas); few-shot obtiene el mejor acierto de categoría (80,0 %) pero baja en prioridad (30,0 %); LoRA mejora al zero-shot en categoría (+36,7 puntos) y logra el mejor resultado en prioridad (50,0 %) usando solo las instrucciones básicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al tratarse de un adaptador sobre Qwen3-0.6B, el modelo base en `fp16` ocupa del orden de 1,2 GB de pesos; el adaptador añade una fracción pequeña. La estimación exacta no se documenta.
- GPU recomendadas: el entrenamiento se realizó en una GPU T4, lo que indica que la tarea es viable en hardware modesto. Para inferencia, cualquier GPU consumer reciente con suficiente VRAM para el modelo base en `fp16` debería bastar; no se aportan cifras concretas.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dado el tamaño del modelo base (0,6 mil millones de parámetros) y el uso de `fp16` en una T4 durante el entrenamiento. No se especifican modelos concretos de GPU consumer.
- Opciones de despliegue: la model card muestra la carga con `peft.AutoPeftModelForCausalLM` y `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ErikaStudent/FineTuning_OpenSource_Model (este) | Adaptador LoRA sobre Qwen3-0.6B (~0,6 mil M) | No disponible (entrenado a 512) | Clasificación de incidencias en JSON, español | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-0.6B (modelo base) | ~0,6 mil M | No disponible en la información proporcionada | Generación de texto general | Apache 2.0 | Hugging Face |
| Modelo base en modo few-shot | ~0,6 mil M | Igual que el base | Clasificación de incidencias en JSON | Apache 2.0 | Uso mediante prompting, sin pesos adicionales |

No se dispone de datos sobre otros adaptadores comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo compacto entrenado con solo 150 ejemplos sintéticos: domina la estructura JSON pero puede mezclar contexto en la respuesta generada o confundir categorías con vocabulario compartido (por ejemplo, «pedido» en una consulta de facturación).
- Subjetividad en la asignación de prioridad: hay margen de error en incidencias sin marcadores explícitos de urgencia; el acierto de prioridad es del 50,0 % en test.
- El acierto de categoría del adaptador LoRA (56,7 %) es inferior al del modelo base en few-shot (80,0 %), lo que sugiere que el ajuste no supera al prompting con ejemplos en esta tarea concreta.
- Entrenado únicamente con datos sintéticos y con fines educativos; el autor advierte explícitamente que no debe emplearse directamente en entornos de producción reales sin supervisión humana.
- Idiomas: solo español declarado; no se garantiza comportamiento en otros idiomas.
- Licencia Apache 2.0, heredada del modelo base, que permite uso comercial; sin embargo, la advertencia del autor sobre el uso en producción limita su aplicabilidad práctica.
- Riesgo de alucinación en la clave `respuesta`: el modelo puede generar contenido plausible pero incorrecto, como se documenta en el análisis de errores (mezcla de temas de envíos en un problema de cobros).
- No se documentan sesgos específicos más allá de los inherentes al modelo base y al dataset sintético.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB; conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErikaStudent/FineTuning_OpenSource_Model
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
