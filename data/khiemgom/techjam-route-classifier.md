# KhiemGOM/techjam-route-classifier

## Resumen

El modelo `KhiemGOM/techjam-route-classifier` es un clasificador de actos de diálogo de seis vías, desarrollado por KhiemGOM como componente de un agente de búsqueda conversacional para comercio electrónico. Su función es interpretar la intención semántica de un turno de conversación cuando la redacción del cliente no coincide con las plantillas literales que el agente reconoce de forma directa. De este modo, el agente puede gestionar correctamente el estado de la conversación, por ejemplo limpiando el conjunto de productos rechazados cuando el cliente cambia de opinión o ignorando turnos que no aportan requisitos.

Se trata de un modelo pequeño y específico, basado en `distilbert-base-uncased`, con 66,9 millones de parámetros y un peso de 0,3 GB. No genera texto ni recupera productos; únicamente clasifica el acto de diálogo de cada turno. Su relevancia radica en que resuelve un problema concreto de los sistemas de diálogo: la transferencia semántica cuando el vocabulario cambia, algo que las reglas léxicas no logran. El modelo está entrenado sobre plantillas sintéticas y alcanza una precisión global de 0,9909 en datos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, un encoder transformer destilado con 66,9 millones de parámetros. La capa de clasificación añade una salida de seis clases correspondientes a los actos de diálogo definidos. El entrenamiento se realizó sobre plantillas sintéticas generadas a partir de un catálogo de productos visible para los participantes, con conjuntos de entrenamiento y prueba que no comparten ninguna cadena de texto. Se aplicó aumentación de datos solo en el conjunto de entrenamiento, con reformulaciones de actos de diálogo disjuntas. La selección del número de épocas se hizo sobre un split de validación y posteriormente se evaluó una vez sobre un split de prueba fijo. No se menciona el uso de RLHF ni DPO; el entrenamiento es de clasificación supervisada estándar.

## Capacidades

- Clasificación de actos de diálogo en seis categorías: `buying_opening`, `constraint_update`, `no_evidence`, `override_opening`, `override_update` y `plain_opening`.
- Detección de cambios de intención del cliente (override) para limpiar el conjunto de rechazo de productos.
- Detección de turnos sin evidencia (`no_evidence`) para evitar que el agente extraiga requisitos de mensajes que no los contienen.
- Funciona como componente de un agente conversacional, no como modelo autónomo.
- Soporte únicamente para inglés.
- No genera texto, no recupera productos ni realiza ranking.
- No dispone de tool calling ni capacidades de agente por sí mismo; se integra en un pipeline mayor.

## Casos de uso

- **Gestión de cambios de opinión en búsqueda de productos**: cuando el cliente expresa un override, el modelo lo detecta y el agente limpia el conjunto de productos rechazados bajo la intención anterior, evitando exclusiones permanentes incorrectas.
- **Filtrado de turnos sin requisitos**: si el cliente indica que no tiene preferencia sobre un atributo, el modelo clasifica el turno como `no_evidence` y el agente no intenta extraer evidencia de ese mensaje.
- **Apertura de conversación con requisito**: distingue entre una apertura que incluye una necesidad concreta (`buying_opening`) y una apertura genérica con solo categoría (`plain_opening`), permitiendo al agente inicializar el estado correctamente.
- **Actualización de restricciones en turnos posteriores**: identifica turnos donde el cliente añade un nuevo requisito (`constraint_update`) o reemplaza uno anterior (`override_update`), ajustando la búsqueda en consecuencia.
- **Componente de un sistema de diálogo multi-turno**: se integra como Nodo 1 de un agente, tras un reconocedor literal que filtra mensajes conocidos; el modelo solo se invoca cuando el reconocedor falla.
- **Evaluación de robustez semántica**: sirve como ejemplo de cómo un clasificador entrenado en datos sintéticos puede transferir a variaciones de vocabulario no vistas, útil para investigar límites de generalización en sistemas de diálogo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados comparando el modelo con reglas léxicas manuales sobre plantillas held-out:

| Señal | Reglas manuales | Este modelo |
|---|---|---|
| override → limpiar estado de rechazo | 37,5% | 100,0% |
| no-evidence → omitir turno | 0,0% | 100,0% |
| Falsos positivos de override (de 6.400) | 0 | 2 |
| Falsos positivos de no-evidence (de 8.000) | 0 | 0 |

Precisión global de seis vías bajo la máscara de turno: **0,9909** sobre 9.600 filas held-out. El error material es `buying_opening → override_opening` (85/1600), considerado benigno porque ocurre en el turno 1 cuando el conjunto de rechazo está vacío.

## Requisitos de hardware

- Inferencia medida en ~3,6 ms en una GPU de consumo; el modelo es lo suficientemente pequeño para ejecutarse en CPU.
- Tamaño de pesos: 0,3 GB, por lo que cabe en cualquier GPU moderna con al menos 1 GB de VRAM, aunque no se especifica el requisito exacto.
- No se proporcionan datos de latencia o throughput en CPU.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede servirse con librerías como Hugging Face Transformers, ONNX Runtime o cualquier framework que soporte DistilBERT. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores de actos de diálogo para búsqueda conversacional). El modelo es altamente específico y no se han encontrado alternativas públicas con la misma tarea y arquitectura en la información proporcionada.

## Limitaciones y advertencias

- **Solo inglés**: no soporta otros idiomas.
- **Entrenado en plantillas sintéticas**: aunque los conjuntos de entrenamiento y prueba son disjuntos en plantillas, ambos fueron generados por el mismo proceso, por lo que la precisión de 0,9909 no debe interpretarse como una estimación del rendimiento con tráfico real de usuarios.
- **No es un clasificador general de intenciones**: asume una conversación de búsqueda de productos con estructura de turnos numerada.
- **Depende de un reconocedor literal previo**: el modelo debe invocarse solo cuando el reconocedor falla; usarlo en todo el tráfico degradaría el rendimiento del agente.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, pero puede clasificar incorrectamente turnos ambiguos, especialmente en el caso `buying_opening → override_opening`.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe mantener la atribución.

## Enlaces

- [HuggingFace - KhiemGOM/techjam-route-classifier](https://huggingface.co/KhiemGOM/techjam-route-classifier)
- No se han encontrado otros enlaces relevantes (papers, repos o demos) en la búsqueda web realizada.
