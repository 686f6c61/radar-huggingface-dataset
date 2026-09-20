# Emerald7664/laya

## Resumen

Laya es un modelo de decisión no autorregresivo de tipo "System 1" orientado a clasificación, enrutado y puntuación con probabilidades calibradas. Se le entrega un estado (texto libre, correo, ticket de soporte o un objeto JSON) junto con preguntas tipadas, y devuelve respuestas tipadas con probabilidades matemáticamente calibradas en una sola pasada forward de aproximadamente 33 ms. No genera texto en ningún caso, por lo que no hay salida que parsear ni margen para la alucinación generativa.

El modelo lo desarrolla el equipo responsable de los checkpoints `convaiinnovations/laya`, aunque esta ficha corresponde al repositorio `Emerald7664/laya` publicado en HuggingFace. El checkpoint raíz de este repositorio emplea un backbone ModernBERT-large con 421.293.830 parámetros y una longitud de contexto de 512 tokens, y está especializado en texto en inglés, guardrails y triaje de correo. El repositorio empaqueta además dos checkpoints adicionales (variante multilingüe sobre mmBERT-base de 322M y variante de decisiones tipadas de 421M con contexto 1024).

Su relevancia actual radica en el enfoque de entrenamiento: se optimiza mediante aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *reinforcement learning against calibrated decisions*), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas. Esto lo posiciona como alternativa a modelos generativos para tareas de clasificación y enrutado en producción, donde la latencia baja y la calibración importan más que la generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (ModernBERT-large en el checkpoint raiz) |
| Parametros totales | 421.293.830 (~421M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (checkpoint raiz); 1024 ampliable a 8k en la variante multilingue; 1024 en la variante de decisiones tipadas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | La model card declara mas de 100 idiomas y 51 idiomas evaluados; el campo de idiomas de HuggingFace figura como no disponible. El checkpoint raiz rinde bien en ingles y colapsa en escrituras no latinas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 2.4 GB |
| Libreria | transformers |
| Fecha de creacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Laya es un modelo no autorregresivo: no predice el siguiente token, sino que mapea directamente un par (estado, pregunta tipada) a una respuesta tipada en una única pasada forward. El checkpoint raiz usa como codificador ModernBERT-large (421M parámetros, contexto 512), mientras que la variante multilingüe usa mmBERT-base (322M parámetros, contexto 1024 ampliable a 8k) y la variante de decisiones tipadas reutiliza ModernBERT-large con contexto 1024. El sistema expone un `Router` que detecta escritura e idioma en menos de 0,5 ms en Python puro y despacha al checkpoint óptimo antes de la pasada forward.

El entrenamiento se realiza con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD): la recompensa se maximiza únicamente reportando probabilidades calibradas, lo que penaliza la sobreconfianza. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases adicionales de RLHF o DPO. La innovación técnica destacable es doble: por un lado, la calibración como objetivo de entrenamiento (no como post-procesado); por otro, el enrutado automático por escritura e idioma que evita el fallo silencioso del checkpoint monolingüe ante alfabetos no latinos.

## Capacidades

- Clasificación de texto tipada: responde preguntas de tipo `choice` (selección entre categorías con criterios descritos), `score` (puntuación en un rango definido) y `noul` (*nullable boolean*, sí/no/no determinado).
- Probabilidades calibradas por respuesta: cada salida incluye una confianza cuantificada, por ejemplo 0,94 para `billing` o 0,86 para `billing` en hindi.
- Enrutado automático de idioma y escritura mediante el componente `Router`, con metadatos explicativos del motivo de la decisión de enrutado.
- Triaje de correo y tickets: extracción de departamento, urgencia, riesgo de baja (`churn_risk`) y solicitud de reembolso a partir del estado del mensaje.
- Guardrails y moderación: por su pipeline de clasificación y sus etiquetas, está orientado a decisiones de filtrado y enrutado.
- Soporte multilingüe declarado en más de 100 idiomas (45 de 51 evaluados rinden más de 3× el azar mediante enrutado).
- No genera texto: no hay salida lingüística que parsear ni posibilidad de alucinación generativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una sola pasada forward.
- Capacidad de visión o audio: no disponible.

## Casos de uso

- Triaje automático de correo de soporte: dado un objeto con remitente, asunto y cuerpo, el modelo devuelve el departamento adecuado (`billing`, `technical`, `sales`, `other`) con probabilidad calibrada, lo que permite enrutar tickets en una sola llamada y sin parsing de texto libre.
- Detección de riesgo de baja en atención al cliente: la pregunta tipada `churn_risk` identifica si el usuario amenaza con cancelar, y la probabilidad asociada permite priorizar la intervención del equipo de retención.
- Enrutado multilingüe en producción: el `Router` evalúa primero la escritura (detección en <0,5 ms) y despacha al checkpoint inglés o multilingüe, de modo que una consulta en hindi o en árabe no cae en el checkpoint monolingüe que colapsa.
- Moderación y guardrails de contenido: gracias a la calibración, se pueden fijar umbrales de confianza en lugar de umbrales arbitrarios, reduciendo falsos positivos en filtros automáticos.
- Puntuación de urgencia en colas de incidencias: la pregunta tipada `score` (por ejemplo, "no urgente", "pronto", "crítico") permite asignar prioridad numérica calibrada a cada ticket sin un ciclo generativo.
- Extracción de intención para asistentes conversacionales: el modelo puede actuar como capa de decisión previa (System 1) que clasifica la intención del usuario y decide a qué subsistema derivar, complementando a un modelo generativo que se encargue del diálogo.
- Procesamiento por lotes de formularios JSON: al aceptar estados en formato JSON, se puede puntuar y clasificar grandes volúmenes de registros estructurados en pasadas batcheadas (72,3 ms para 10 preguntas en la variante multilingüe sobre T4).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un banco compartido de 17.416 preguntas, una GPU T4 e idénticas preguntas por modelo:

| Benchmark / tarea | Ingles (`laya`) | Multilingue (`laya-multilingual`) | `Router` (enrutado) |
|---|---|---|---|
| MASSIVE intent, ingles | 0,783 | 0,657 | 0,783 |
| MASSIVE intent, otros 13 idiomas | 0,306 | 0,451 | 0,451 |
| XNLI, ingles | 0,860 | 0,843 | 0,860 |
| XNLI, otros 14 idiomas | 0,521 | 0,731 | 0,731 |
| Idiomas usables (>3× azar) | 23 / 51 | 45 / 51 | 45 / 51 |
| Latencia, 1 pregunta (T4) | 39,5 ms | 32,8 ms | 32,8 ms |
| Latencia, 10 preguntas en lote | 158,6 ms | 72,3 ms | 72,3 ms |

Además, la variante de decisiones tipadas reporta 0,766 de accuracy en sus cuatro flujos (`laya-typed-decisions`). No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no especificada por el autor. Para 421M parámetros, una estimación orientativa en FP16 ronda 0,85 GB de pesos, y en INT8 en torno a 0,42 GB; a ello hay que sumar activaciones y el estado del enrutador.
- GPU recomendadas: la model card documenta explícitamente pruebas en una GPU T4. No se detallan recomendaciones para A100, H100 o RTX 4090.
- GPU de consumo: por tamaño de parámetros (421M) debería caber holgadamente en cualquier GPU de consumo reciente, si bien el dato no se confirma en la información disponible.
- Despliegue: librería `transformers`, etiqueta `endpoints_compatible` y el paquete Python `laya` con componente `Router`. Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia: 39,5 ms por pregunta en T4 para el checkpoint inglés, 32,8 ms para el multilingüe y 72,3 ms para lotes de 10 preguntas (multilingüe).
- Memoria y precarga: una construcción en frío de checkpoint cuesta segundos; con `max_loaded=1` por defecto, el tráfico que alterna idiomas reconstruye el modelo en cada petición (7,4 s de mediana en CPU y 10,3 s en T4). Se recomienda `Router(preload=True)` para mantener los checkpoints residentes.

## Comparativa con modelos similares

No se dispone de datos sobre modelos de terceros comparables en la información proporcionada. La comparación factible es entre los tres checkpoints de la propia familia:

| Checkpoint | Backbone | Parametros | Contexto | Especialidad |
|---|---|---|---|---|
| `laya` (raiz de este repo) | ModernBERT-large | 421M | 512 | Texto en inglés, guardrails, triaje de correo |
| `laya-multilingual` | mmBERT-base | 322M | 1024 (hasta 8k) | Más de 100 idiomas, ~2,2× más rápido |
| `laya-typed-decisions` | ModernBERT-large | 421M | 1024 | Los cuatro flujos de decisiones tipadas (0,766 acc) |

Frente a alternativas externas del mismo tamaño o tarea (por ejemplo, clasificadores de intención basados en BERT o modelos de enrutado multilingüe), no hay comparativa publicada en la información disponible.

## Limitaciones y advertencias

- El checkpoint inglés colapsa en escrituras no latinas: la model card reporta 0,000 de accuracy en jemer con 0,952 de confianza. El modelo se mantiene confiado mientras falla, por lo que el filtrado por umbral de confianza no protege frente a este caso.
- Riesgo de sobreconfianza en dominios fuera de distribución: la calibración se optimiza contra las reglas de puntuación del entrenamiento, pero no hay garantía fuera de ese marco.
- Al ser un modelo no generativo, no produce texto; cualquier tarea que requiera salida libre queda fuera de su alcance.
- Contexto limitado: 512 tokens en el checkpoint raíz, insuficiente para documentos largos. Las variantes llegan a 1024 (y 8k declarado para multilingüe).
- Idiomas: la model card declara más de 100, pero solo 45 de 51 evaluados superan 3× el azar, y ese resultado exige usar el enrutador y el checkpoint multilingüe.
- Reconstrucción en frío costosa: con la configuración por defecto (`max_loaded=1`), alternar idiomas provoca recargas de 7,4 s (CPU) a 10,3 s (T4) por petición.
- Discrepancia de identidad: el repositorio se publica bajo `Emerald7664/laya`, mientras que la model card referencia `convaiinnovations/laya` y sus variantes. Conviene verificar la procedencia antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe una comunidad que valide su comportamiento.
- No se han publicado detalles de sesgos, composición del dataset ni auditorías externas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Emerald7664/laya
- Checkpoint multilingüe referenciado: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas referenciado: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio de código y activos citado en la model card: https://github.com/NandhaKishorM/laya
- Imagen comparativa Laya frente a TypeSafe Jev: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/laya_vs_jev_full.png
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo; los resultados devueltos corresponden a contenido no relacionado (temas de Netflix en foros y redes) y no se han utilizado.
