# birgermoell/kev-myndighet-4b

## Resumen

kev-myndighet-4b es un adaptador LoRA (con una "pointer head" asociada) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por birgermoell, que configura un modelo de decisión para expedientes de la administración pública sueca. No es un modelo de chat autónomo: se carga mediante el código del proyecto kev y responde preguntas tipadas de opción múltiple y sí/no sobre el resultado de casos de CSN (ayudas estudiantiles), situaciones de förvaltningslagen y hechos de resoluciones de ÖKS, ÖNH, JO y Skolinspektionen.

El adaptador se entrenó durante una época sobre 16 600 registros de la configuración `sven` del dataset birgermoell/myndighetsbeslut, con rango LoRA 16, learning rate 2e-5 y precisión bf16, en una GPU H200 del clúster NSC Berzelius. El resultado es un artefacto de investigación experimental (0,2 GB en el repositorio) que demuestra que un modelo de 4B puede aprender las reglas de un generador sintético de decisiones administrativas, pero que el propio autor advierte que no está validado para decidir casos reales.

Su relevancia es doble: por un lado, ejemplifica el patrón de adaptadores LoRA especializados en dominios jurídico-administrativos con evaluación por pregunta; por otro, sus resultados heldout muestran con claridad los límites del enfoque, con métricas muy altas en CSN y pasos procedimentales pero sin aprendizaje real en JO y con diferencias a nivel de ruido en ÖKS y ÖNH.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-4B-Base) con adaptador LoRA y pointer head |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; se recomienda `--max_state 7552` en la evaluación de kev (el valor por defecto de 384 tokens rechaza la mayoría de expedientes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 (adaptador, en línea con el base); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 sobre Qwen/Qwen3.5-4B-Base, un transformer decoder-only de 4B parámetros. El autor lo describe como "delta-trained" desde `jaredpalmer/kev-4b`, es decir, un ajuste incremental sobre una variante previa del mismo linaje, y añade una "pointer head" para responder preguntas tipadas de opción múltiple y sí/no en lugar de generar texto libre. El entrenamiento consistió en una época sobre 16 600 registros de la configuración `sven` del dataset birgermoell/myndighetsbeslut, con learning rate 2e-5, precisión bf16 y una sola GPU H200 (NSC Berzelius).

Los datos cubren expedientes de CSN (sintéticos), situaciones de förvaltningslagen y hechos de resoluciones de ÖKS, ÖNH, JO y Skolinspektionen, con detalles identificativos eliminados por las autoridades y por el recolector del autor. No se mezclaron datos de replay, por lo que la capacidad general del modelo tras el fine-tuning no se ha medido. El adaptador no funciona como modelo de chat independiente: requiere el código del proyecto kev (`Checkpoint(...).load`) para cargarse y evaluarse.

## Capacidades

- Respuesta a preguntas tipadas de opción múltiple y sí/no sobre el resultado de expedientes administrativos suecos.
- Predicción del resultado de solicitudes de ayuda estudiantil del CSN.
- Predicción del siguiente paso procedimental en un expediente.
- Identificación de deficiencias por área en resoluciones de Skolinspektionen.
- Predicción del tipo de intervención de Skolinspektionen.
- Predicción de si una resolución de ÖKS cambia a favor del recurrente.
- Predicción de si JO critica a una autoridad.
- Predicción del resultado en resoluciones de ÖNH.
- Procesamiento de expedientes largos mediante el parámetro `max_state` (hasta 7552 en la configuración recomendada).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito según la información disponible.

## Casos de uso

- Investigación sobre modelos de decisión administrativa: el adaptador sirve como banco de pruebas reproducible para estudiar si un modelo de 4B aprende las reglas de un generador sintético de decisiones, comparando zero-shot frente a entrenado con el script de evaluación del repositorio.
- Clasificación de resultados de CSN en un pipeline de análisis: dado un expediente sintético o anonimizado, el modelo responde a la pregunta de resultado con una accuracy heldout de 0,97, útil para etiquetado asistido en estudios de política educativa.
- Predicción del siguiente paso procedimental: con 0,95 de accuracy heldout, puede emplearse para generar borradores de flujo de tramitación en herramientas internas de simulación, siempre con revisión humana.
- Detección de deficiencias en resoluciones de Skolinspektionen: el modelo identifica el área deficiente (0,90) y el tipo de intervención (0,85), lo que permite prototipar sistemas de triaje documental sobre resoluciones públicas.
- Análisis de resoluciones de ÖKS: con 0,96 de accuracy heldout en la pregunta de si cambia a favor del recurrente, puede apoyar la extracción de señales en corpus de apelaciones, teniendo en cuenta el reducido tamaño de la muestra (72 preguntas).
- Evaluación comparativa de adaptadores LoRA en dominio jurídico: el repositorio incluye constructores de datos y script de evaluación, lo que facilita reproducir el experimento con otros modelos base o configuraciones del dataset.
- Docencia y divulgación sobre límites de los modelos legales: los resultados en JO (0,87, igual que la clase mayoritaria) y ÖNH (0,38) son un caso práctico para explicar el riesgo de aprender la distribución mayoritaria en lugar de la tarea.

## Benchmarks y rendimiento

Resultados heldout sobre 2 005 registros con decisiones fechadas entre 2026-05-07 y 2026-11-10 (ninguna rechazada). Se muestra la accuracy y, entre paréntesis, la proporción de la respuesta más común.

| Pregunta | Más común | Zero-shot | Entrenado |
|---|---:|---:|---:|
| Resultado CSN | 0,50 | 0,30 | 0,97 |
| Siguiente paso procedimental | 0,28 | 0,71 | 0,95 |
| Skolinspektionen: deficiencia por área | 0,66 | 0,80 | 0,90 |
| Skolinspektionen: intervención | 0,54 | 0,38 | 0,85 |
| ÖKS: cambio a favor del recurrente | 0,86 | 0,94 | 0,96 |
| JO: autoridad criticada | 0,87 | 0,60 | 0,87 |
| ÖNH: resultado | 0,35 | 0,50 | 0,38 |

El autor indica que los números completos por pregunta (macro-F1, calibración, AUROC) están en el repositorio del dataset, bajo `results/`. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base es de 4B parámetros y el adaptador ocupa 0,2 GB, por lo que en bf16 el base ronda los 8 GB de pesos, pero no se confirma en la documentación.
- GPU de entrenamiento documentada: 1 × NVIDIA H200 (NSC Berzelius).
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; un base de 4B en cuantización de 8 o 4 bits podría caber en GPUs consumer, pero no hay datos publicados al respecto.
- Opciones de despliegue: el adaptador requiere el código del proyecto kev (`Checkpoint(...).load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-myndighet-4b | 4B (base) + LoRA | no disponible | Adaptador de decisión administrativa sueca | Apache-2.0 | Hugging Face (adaptador) |
| jaredpalmer/kev-4b | 4B | no disponible | Modelo previo del mismo linaje, base del delta-training | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | Modelo base generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores legales en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental no validado para decidir casos reales; cualquier uso requiere un responsable humano de la decisión.
- Las altas puntuaciones en CSN y siguiente paso demuestran que el modelo aprendió las reglas del generador, no que lea expedientes reales.
- ÖKS cuenta con 72 preguntas heldout (unos 10 recursos estimados) y ÖNH con 34; las diferencias en esas categorías están a nivel de ruido y el base podría haber visto esas decisiones públicas.
- JO no se aprende: el modelo responde la clase mayoritaria (0,87, idéntico a la frecuencia de la respuesta más común).
- No se mezclaron datos de replay; la capacidad general tras el fine-tuning no se ha medido.
- Los expedientes de CSN son sintéticos; el resto son decisiones públicas con detalles identificativos eliminados por las autoridades y por el recolector.
- Riesgo de alucinación y de sobreajuste a la distribución del generador sintético, no cuantificado en la información disponible.
- Licencia Apache-2.0 para el adaptador, en línea con el base; los datos de entrenamiento son CC BY 4.0, lo que impone obligaciones de atribución si se redistribuyen.
- El adaptador no es un modelo de chat autónomo y no debe usarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/birgermoell/kev-myndighet-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/birgermoell/myndighetsbeslut
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo previo del linaje: https://huggingface.co/jaredpalmer/kev-4b
- Código del proyecto kev: https://github.com/jaredpalmer/kev
- Código, constructores de datos y script de evaluación: https://github.com/BirgerMoell/myndighetsagenter
