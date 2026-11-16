# dmadurga/qwen3-0.6b-soporte-lora

## Resumen

El modelo `dmadurga/qwen3-0.6b-soporte-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario dmadurga sobre el modelo base `Qwen/Qwen3-0.6B` de Alibaba. Su función es concreta: recibir una incidencia de soporte en castellano y devolver un objeto JSON con tres campos (`categoria`, `prioridad` y `respuesta`), actuando por tanto como clasificador estructurado de tickets más que como un modelo conversacional generalista. El adaptador se entrenó con TRL `SFTTrainer` y PEFT, y se distribuye bajo licencia Apache-2.0.

El interés de esta ficha no reside en el rendimiento bruto del modelo, sino en que documenta un caso de ajuste fino muy ligero (0,1 GB de repositorio, entrenamiento de aproximadamente un minuto en una RTX 5070 de 12 GB) sobre un modelo de tan solo 0,6 mil millones de parámetros. Sirve como referencia para quien quiera evaluar si un modelo pequeño con instrucciones y few-shot puede sustituirse por un adaptador LoRA especializado en una tarea de clasificación cerrada con salida JSON estricta.

La relevancia práctica es limitada y debe interpretarse con cautela: los datos de entrenamiento y prueba son 100 % sintéticos, generados por plantillas con semilla 7, y el propio autor advierte que el 100 % de acierto mide el patrón sintético, no la generalización a incidencias reales. Es, por tanto, un artefacto útil como ejemplo metodológico y como punto de partida reproducible, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-0.6B |
| Parametros totales | 0,6 mil millones en el modelo base; el adaptador LoRA no declara recuento propio (r=16, alpha=32, `all-linear`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible; pesos del adaptador en safetensors (bf16 en entrenamiento) |
| Idiomas soportados | es (castellano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3. La configuración LoRA es r=16, alpha=32, dropout=0,05 y módulos `all-linear`, lo que significa que se inyectan matrices de bajo rango en todas las capas lineales del modelo base. El entrenamiento se realizó con TRL `SFTTrainer` junto con PEFT y Transformers, durante 3 épocas, con batch de 8, learning rate 2e-4 con scheduler coseno, 5 pasos de warmup, semilla 0 y precisión bf16. La pérdida se calcula únicamente sobre el completion (la respuesta JSON), no sobre el prompt, lo que es coherente con una tarea de generación estructurada.

Los datos son enteramente sintéticos y generados por plantillas mediante `gen_data.py` con semilla 7: 240 ejemplos de entrenamiento, 30 de validación y 30 de prueba, sin textos repetidos entre grupos. Se cubren 5 categorías (`facturacion`, `acceso_cuenta`, `error_tecnico`, `envio_pedido`, `consulta_producto`) y 3 prioridades (`alta`, `media`, `baja`). No hay datos personales. El entrenamiento completo se ejecutó en una única GPU RTX 5070 de 12 GB en aproximadamente un minuto, sin búsqueda de hiperparámetros. El uso previsto es con el chat template del modelo base y `enable_thinking=False`, con un mensaje de sistema que instruye a responder solo con el JSON.

## Capacidades

- Clasificación de incidencias de soporte en castellano en 5 categorías cerradas: `facturacion`, `acceso_cuenta`, `error_tecnico`, `envio_pedido` y `consulta_producto`.
- Asignación de prioridad en 3 niveles: `alta`, `media` y `baja`, derivada de frases de urgencia explícitas presentes en el texto.
- Generación de una respuesta textual al cliente dentro del campo `respuesta` del JSON.
- Salida estructurada estricta en formato JSON con las claves `categoria`, `prioridad` y `respuesta`, sin texto adicional.
- Funcionamiento en modo no-thinking (`enable_thinking=False`) del modelo base Qwen3.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; el adaptador está especializado en una única tarea de clasificación.

## Casos de uso

- Clasificación automática de tickets en un helpdesk: el adaptador recibe el texto de la incidencia y devuelve categoría y prioridad en JSON, lo que permite enrutar el ticket al equipo correspondiente sin post-procesado de texto libre. Adecuado por su salida estructurada y su bajo coste de inferencia, siempre que el dominio de tickets se parezca al de las plantillas de entrenamiento.
- Etiquetado de datos para construir un corpus real: usar el adaptador como pre-etiquetador de un lote de incidencias reales y revisar manualmente las discrepancias, aprovechando que el modelo es pequeño y se ejecuta en una GPU de consumo.
- Prueba de concepto de ajuste fino con LoRA: sirve como plantilla reproducible para validar un pipeline de SFT con TRL y PEFT sobre un modelo de 0,6B antes de escalar a modelos mayores o a datos reales.
- Generación de respuestas de primer nivel en atención al cliente: el campo `respuesta` puede usarse como borrador que un agente humano revisa, reduciendo el tiempo de redacción en consultas rutinarias de facturación o envío.
- Clasificación por prioridad en un sistema de alertas: el campo `prioridad` permite ordenar la cola de soporte y escalar primero las incidencias marcadas como `alta`, aunque el autor advierte que solo se ha probado con frases de urgencia explícitas.
- Evaluación comparativa de estrategias de prompting: el autor documenta una comparativa entre instrucciones, few-shot y LoRA sobre el mismo conjunto de prueba, lo que permite reproducir el experimento y medir la ganancia real del adaptador frente a alternativas sin entrenamiento.
- Docencia y demostración de clasificación estructurada: por su tamaño reducido y su entrenamiento de un minuto, es útil para ilustrar en un taller cómo se construye un clasificador JSON con un modelo pequeño.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 30 casos de prueba sintéticos, con salida original y validador estricto sin reparación:

| Condición | JSON válido | Acierto categoría | Acierto prioridad |
|---|---|---|---|
| Base + instrucciones | 30 % | 3 % | 17 % |
| Base + few-shot (6 ejemplos) | 100 % | 63 % | 67 % |
| Base + LoRA (este adaptador) | 100 % | 100 % | 100 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores miden exclusivamente el ajuste al patrón sintético del conjunto de prueba y no deben interpretarse como rendimiento en incidencias reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,6B en bf16 ocupa aproximadamente 1,2 GB de pesos; en cuantización de 8 bits en torno a 0,6-0,7 GB y en 4 bits en torno a 0,35-0,4 GB. El adaptador LoRA añade un coste marginal (repositorio de 0,1 GB) y puede fusionarse con el modelo base.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para bf16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. El entrenamiento se realizó en una RTX 5070 de 12 GB.
- Cabe holgadamente en GPU de consumo; también es viable en CPU para inferencia puntual, aunque no se han publicado cifras de latencia.
- Opciones de despliegue: PEFT y Transformers para cargar el adaptador sobre el modelo base; vLLM y TGI admiten adaptadores LoRA, y llama.cpp/Ollama requieren convertir el modelo fusionado a GGUF. No se han publicado configuraciones de despliegue concretas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dmadurga/qwen3-0.6b-soporte-lora` | 0,6B (base) + LoRA | no disponible | Clasificación de tickets en JSON (es) | Apache-2.0 | Hugging Face (adaptador PEFT) |
| `Qwen/Qwen3-0.6B` (base) | 0,6B | no disponible en esta ficha | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| Otros adaptadores LoRA de clasificación sobre Qwen3-0.6B | 0,6B (base) + LoRA | no disponible | Variable según el adaptador | Variable | no disponible |
| Modelos de clasificación de texto pequeños (p. ej. familia BERT/RoBERTa en español) | 0,1-0,3B típicamente | 512 tokens típicamente | Clasificación de texto | Variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación con modelos tipo BERT en español es estructural (tamaño y tarea de clasificación), no de rendimiento medido.

## Limitaciones y advertencias

- Los datos de entrenamiento y prueba son 100 % sintéticos y generados por plantillas con frases repetidas combinadas; el 100 % de acierto mide el patrón sintético, no la generalización a incidencias reales.
- El conjunto de prueba tiene solo 30 casos, por lo que la muestra es pequeña y los intervalos de confianza de las métricas son amplios.
- La prioridad se deriva de frases de urgencia explícitas; no se ha probado con redacciones ambiguas o implícitas.
- El propio autor indica explícitamente que no debe usarse para decisiones reales sobre clientes.
- Riesgo de alucinación en el campo `respuesta`: al ser un modelo de 0,6B, las respuestas generadas pueden contener información incorrecta sobre políticas, plazos o importes.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenar solo con plantillas sintéticas, es probable que el modelo no cubra variaciones dialectales, coloquiales o errores ortográficos frecuentes en tickets reales.
- Limitaciones de idioma: solo se declara castellano (`es`); no se ha evaluado en otras lenguas ni en variantes regionales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3-0.6B, que es igualmente Apache-2.0 según la información disponible.
- En producción, la salida JSON debe validarse con un esquema estricto y un mecanismo de reparación o reintento, ya que el adaptador no garantiza por sí mismo el cumplimiento del esquema fuera del dominio sintético.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/dmadurga/qwen3-0.6b-soporte-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de código con `common.py`, `gen_data.py` y `entrenamiento.json`: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
