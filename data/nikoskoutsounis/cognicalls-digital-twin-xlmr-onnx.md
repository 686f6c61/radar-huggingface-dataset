# NikosKoutsounis/cognicalls-digital-twin-xlmr-onnx

## Resumen

Cognicalls Digital Twin es un modelo de clasificación de texto derivado de `FacebookAI/xlm-roberta-base`, desarrollado por NikosKoutsounis para predecir el comportamiento de agentes de ventas en llamadas telefónicas de retail energético en griego. El modelo actúa como el "cerebro conductual" de un gemelo digital de un agente de call center: dado el historial de la conversación y un vector de persona que describe el estilo del agente, predice la siguiente acción del agente, la etapa actual de la llamada, la última intención del cliente y la última objeción del cliente.

Técnicamente es un encoder XLM-RoBERTa base (~278 M de parámetros) fine-tuneado con cuatro cabezas de clasificación adicionales (18 acciones, 9 etapas, 16 intenciones, 11 objeciones) y una capa de fusión de persona. Se distribuye como un único grafo ONNX (opset 17, FP32, 1,1 GB) que no requiere PyTorch: solo `onnxruntime`, `tokenizers` y `numpy`. La ventana de entrada se trunca a 384 tokens desde la izquierda, conservando los turnos más recientes.

Su relevancia es acotada pero específica: demuestra cómo condicionar un modelo de lenguaje pequeño sobre una representación explícita de estilo del hablante (60 features z-scoreadas más una tabla etapa × acción de log-lift) para simular agentes con perfiles diferenciados. La licencia es "no-redistribution", lo que restringe seriamente su uso fuera del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa base con 4 cabezas de clasificación y capa de fusión de persona |
| Parametros totales | ~278 M (xlm-roberta-base); tamaño del grafo ONNX: 1,1 GB en FP32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (truncado desde la izquierda) |
| Tipos de cuantizacion | no disponible (solo se publica FP32 ONNX) |
| Idiomas soportados | Griego (el) |
| Licencia | other / no-redistribution (sin redistribución) |
| Formato de pesos | ONNX (opset 17, FP32) + tokenizer.json (SentencePiece XLM-R) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base` y añade cuatro cabezas de clasificación sobre la representación del token `[CLS]` o pooled: `action_logits` (18 clases), `stage_logits` (9 clases), `cust_intent_logits` (16 clases) y `cust_objection_logits` (11 clases). La innovación principal es la capa de fusión de persona, que inyecta dos tensores adicionales: `persona_features` (float32 `[batch, 60]`) con estadísticas agregadas del agente (proporción de actos, proporción de etapas, estilo como palabras por turno, tasa de preguntas, hedges, uso de "σας" formal, momento de la primera oferta y del primer cierre, respuesta a objeciones) y `persona_ctx` (float32 `[batch, 9, 18]`) con el log-lift por etapa y acción `log(P_agente(a|s) / P_población(a|s))`, suavizado hacia la población con k=20 y recortado a ±3.

La entrada textual se formatea de manera estricta: una línea `[PREV_ACTS]` con los actos de las últimas 4 líneas del agente, seguida de los últimos 6 turnos etiquetados `[AGENT]` o `[CUSTOMER]`. Las entidades personales deben sustituirse por placeholders (`[PERSON]`, `[PHONE]`, `[EMAIL]`, `[ADDRESS]`, `[LOCATION]`, `[ID]`, `[DATE]`); el modelo nunca vio nombres reales durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El repositorio incluye `persona_stats.json` con los conteos poblacionales etapa × acción para construir la tabla de contexto de un agente nuevo, y `meta.json` con los seis vectores de persona incorporados (`consultative_v3`, `numbers_v3`, `value_pitch_v3`, `deferrer_v3`, `trust_builder_v3`, `assumptive_v3`).

## Capacidades

- Predicción de la siguiente acción del agente entre 18 clases (p. ej. `OPEN`, `EXPLAIN_OFFER`, `BILL_DATA_Q`, `CLARIFY_Q`, `VALUE_PROP`, `NEXT_STEP_DEFER`, `REASSURE`, `TRIAL_CLOSE`, `COMPARE`, `DISCOVERY_Q`).
- Clasificación de la etapa actual de la llamada entre 9 clases (p. ej. `objection_handling`).
- Clasificación de la última intención del cliente entre 16 clases (p. ej. `OBJECTION`).
- Clasificación de la última objeción del cliente entre 11 clases (p. ej. `switching_anxiety`).
- Condicionamiento por persona: seis perfiles de agente incorporados más la posibilidad de construir uno nuevo a partir de llamadas anotadas (`persona_from_calls`, `add_persona`), con un mínimo recomendado de 50 llamadas para un perfil estable.
- Modo "agente promedio" (vector de persona a ceros) para cold start.
- Inferencia sin PyTorch mediante ONNX Runtime.
- Capacidad multilingüe: no disponible más allá del griego; el modelo está entrenado y evaluado solo en griego.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponibles (es un clasificador, no un modelo generativo).

## Casos de uso

- Simulación de agentes para entrenamiento: el modelo permite generar la "siguiente línea esperada" de un agente con un perfil concreto (`numbers_v3` tiende a `BILL_DATA_Q`, `trust_builder_v3` a `REASSURE`) para construir entornos de práctica o evaluación de comerciales.
- Análisis de calidad de llamadas en producción: clasificar cada turno con etapa, intención y objeción del cliente para generar informes automáticos de objeción más frecuente por etapa y agente.
- Detección de desviaciones de guion: comparar la acción predicha para la persona asignada al agente con la acción realmente ejecutada y marcar discrepancias como señal de coaching.
- Enrutamiento en tiempo real: usar la etapa y la intención del cliente para decidir si derivar a un supervisor o sugerir una respuesta en un asistente de agente en vivo.
- Modelado de clientes para campañas: agregar las predicciones de objeción (`switching_anxiety`, etc.) para segmentar llamadas y ajustar argumentarios por segmento.
- Investigación sobre estilo conversacional: el par `persona_features` + `persona_ctx` sirve como caso de estudio reproducible de condicionamiento por hablante en clasificadores pequeños.
- Construcción de gemelos digitales de agentes concretos: con 50 o más llamadas anotadas de un agente real, generar su vector de persona y desplegarlo como simulador para predecir su comportamiento ante nuevos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo muestra ejemplos cualitativos de la acción top-1 por persona:

| Persona | Acción top-1 (probabilidad) |
|---|---|
| consultative_v3 | CLARIFY_Q (0,79) |
| numbers_v3 | BILL_DATA_Q (0,63) |
| value_pitch_v3 | VALUE_PROP (0,79) |
| deferrer_v3 | NEXT_STEP_DEFER (0,83) |
| trust_builder_v3 | REASSURE (0,77) |
| assumptive_v3 | TRIAL_CLOSE (0,59) |
| Agente promedio (sin persona) | CLARIFY_Q (0,31) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5–2 GB en FP32 (1,1 GB de pesos más activaciones y overhead de ONNX Runtime); no se publican cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.); también es viable en CPU.
- Opciones de despliegue: ONNX Runtime (versión fijada 1.32.0 en `requirements.txt`), con `tokenizers` 0.23.3 y `numpy>=2,<3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador ONNX de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cognicalls Digital Twin XLM-R ONNX | ~278 M | 384 tokens | Clasificación multi-cabeza con persona | no-redistribution | Hugging Face (ONNX) |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Masked LM / encoder base | MIT | Hugging Face |
| XLM-RoBERTa fine-tuneado para clasificación de intenciones (genérico) | ~278 M | 512 tokens | Clasificación de intención | variable | Hugging Face |
| Modelos de diálogo específicos de dominio en griego | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas es limitada: no se dispone de información sobre otros modelos de predicción de siguiente acción con condicionamiento por persona en griego. La diferencia clave frente a un XLM-R base es la fusión de persona y las cuatro cabezas simultáneas; frente a clasificadores genéricos de intención, el dominio (retail energético griego) y la granularidad (etapa, intención, objeción, acción) son más específicos.

## Limitaciones y advertencias

- Dominio muy estrecho: solo llamadas de venta de energía en Grecia; el rendimiento fuera de ese contexto no está caracterizado.
- Dependencia de etiquetas de acto: si no se etiquetan las líneas previas del agente, la entrada cae fuera de distribución (`[PREV_ACTS] NONE`) y la precisión baja, según la propia model card.
- Requiere anonimización previa: los datos personales deben sustituirse por placeholders; el modelo nunca vio nombres reales y podría comportarse de forma impredecible con ellos.
- Truncado desde la izquierda a 384 tokens: las llamadas largas pierden el inicio de la conversación, lo que puede afectar a la predicción de etapa.
- Licencia "no-redistribution": no permite redistribuir el modelo; el uso comercial queda sujeto a los términos del autor, que no se detallan. Verificar antes de cualquier despliegue en producción.
- Riesgo de alucinación no aplicable en el sentido generativo (es un clasificador), pero sí hay riesgo de calibración deficiente: las probabilidades de softmax no están validadas externamente.
- Sesgos: no se documentan sesgos conocidos, pero el modelo aprende de un conjunto limitado de agentes y llamadas, por lo que puede reproducir sesgos de estilo de esos agentes.
- Sin benchmarks publicados: no hay métricas de precisión, F1 ni comparaciones cuantitativas con alternativas.
- Solo griego: no hay soporte multilingüe declarado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikosKoutsounis/cognicalls-digital-twin-xlmr-onnx
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
