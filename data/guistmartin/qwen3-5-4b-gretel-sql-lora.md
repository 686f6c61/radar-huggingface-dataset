# guistmartin/qwen3.5-4b-gretel-sql-lora

## Resumen

`guistmartin/qwen3.5-4b-gretel-sql-lora` es un adaptador LoRA (PEFT) entrenado por Nest sobre el modelo base `Qwen/Qwen3.5-4B`, especializado en generación de SQL de solo lectura para SQLite (text-to-SQL). El adaptador se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB y licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales. El entrenamiento se realizó exclusivamente con ejemplos reales del dataset `gretelai/synthetic_text_to_sql`, sin rondas de destilación ni generación sintética adicional por parte de un modelo profesor.

La relevancia del proyecto radica en su propuesta de eficiencia: un adaptador LoRA sobre un modelo de 4B parámetros alcanza una precisión de ejecución del 76,67% en un subconjunto de test retenido de 240 preguntas, frente al 74,17% reportado para GPT-5.6 Terra ejecutado mediante agentes Codex en las mismas condiciones. No obstante, el propio autor advierte que la diferencia de +2,5 puntos porcentuales tiene un intervalo de confianza bootstrap pareado del 95% de [−2,1, +7,1] pp, que incluye el cero, por lo que el adaptador iguala a Terra pero no lo supera de forma estadísticamente significativa en ese subconjunto.

El adaptador está pensado para integrarse en pipelines de generación de consultas SQL sobre esquemas SQLite, con soporte únicamente para inglés y con la restricción de generar exclusivamente sentencias `SELECT` o CTE ejecutables. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni especificaciones detalladas del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; el adaptador modifica matrices del modelo base, incluida la cabeza de salida |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B según su denominación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer de 4B parámetros, mediante LoRA. Los pesos nativos se generaron originalmente en formato Tinker y se convirtieron a PEFT usando el planificador de fusión oficial del Cookbook, validándose con el cargador de PEFT sobre una arquitectura Qwen de solo metadatos. El manifiesto de conversión (`conversion_manifest.json`) registra la equivalencia matricial y los tensores cargados; sin embargo, los pesos base no se descargaron para esta comprobación y no se probaron la generación end-to-end con Transformers ni `merge_and_unload`. El adaptador de la cabeza de salida permanece separado de los embeddings de entrada vinculados, por lo que debe usarse el adaptador PEFT sin fusionar.

El entrenamiento utilizó el dataset `gretelai/synthetic_text_to_sql` (licencia Apache 2.0), fijado por revisión en `data_manifest.json`. Los ejemplos de entrenamiento y benchmark se restringieron a sentencias `SELECT`/CTE originales ejecutables en SQLite, con tablas de contexto pobladas y resultados de referencia no vacíos. No se ejecutó ninguna ronda de generación sintética ni de modelo profesor (`teacher_status` en `metrics.json`). El adaptador seleccionado es el de la ronda 1, con 250 pasos de optimizador confirmados. El subconjunto fijo de validación y el de test oficial no comparten contexto de base de datos normalizado con el entrenamiento.

## Capacidades

- Generación de consultas SQL de solo lectura (`SELECT` y CTE) para SQLite a partir de preguntas en lenguaje natural y un esquema de base de datos.
- Text-to-SQL con contexto de tablas pobladas y resultados de referencia no vacíos.
- Generación de texto condicionada por el modelo base Qwen3.5-4B subyacente.
- Modo sin thinking: la configuración de inferencia (`inference_config.json`) indica aplicar `apply_chat_template(..., enable_thinking=False)`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles; el ejemplo de carga usa `AutoModelForImageTextToText`, pero no se documentan capacidades multimodales específicas del adaptador.

## Casos de uso

- Generación de consultas SQL en asistentes de análisis de datos: el adaptador traduce preguntas en inglés a `SELECT`/CTE ejecutables sobre esquemas SQLite, adecuado para herramientas internas de BI donde el usuario no domina SQL.
- Integración en pipelines de CI/CD para validación de esquemas: permite generar consultas de comprobación sobre bases de datos de prueba y verificar que los resultados de referencia no estén vacíos, siguiendo el mismo filtrado aplicado durante el entrenamiento.
- Automatización de informes ad hoc: dado un esquema SQLite poblado, el modelo produce consultas de solo lectura para extraer métricas sin riesgo de modificar datos, al restringirse a `SELECT` y CTE.
- Prototipado rápido de interfaces text-to-SQL: el tamaño reducido del adaptador (0,2 GB) y su licencia Apache 2.0 permiten desplegarlo en entornos de desarrollo sin costes de licencia.
- Evaluación comparativa de modelos: sirve como referencia de adaptadores LoRA de bajo coste frente a modelos propietarios en tareas de text-to-SQL, con métricas de ejecución reproducibles recogidas en `metrics.json`.
- Educación y formación en SQL: el modelo puede generar consultas de ejemplo sobre esquemas didácticos, aunque requiere supervisión por el riesgo de alucinación en esquemas complejos.
- Investigación en eficiencia de adaptadores: el repositorio documenta el proceso de conversión Tinker→PEFT y los manifiestos de equivalencia, útil para estudiar la portabilidad de adaptadores entre formatos.

## Benchmarks y rendimiento

Resultados de precisión de ejecución reportados por el autor en el subconjunto filtrado (no en el dataset Gretel completo):

| Modelo | Validación (160) | Test retenido (240) |
|---|---:|---:|
| Qwen3.5-4B base | 77,50% | No evaluado |
| LoRA ronda 1 (adaptador) | **80,00%** | **76,67%** |
| GPT-5.6 Terra vía Codex | 77,50% | 74,17% |

La diferencia en test (LoRA menos Terra) es de +2,5 pp, con intervalo de confianza bootstrap pareado del 95% de [−2,1, +7,1] pp, que incluye el cero. El autor indica que, en este subconjunto, el adaptador iguala a Terra pero no lo supera de forma significativa. Terra se ejecutó mediante agentes Codex en lotes ciegos, con presupuestos de inferencia y transportes distintos a los del adaptador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Qwen3.5-4B y de la cuantización aplicada. El adaptador LoRA añade una sobrecarga mínima (repositorio de 0,2 GB).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 4B en bfloat16 requiere aproximadamente 8 GB de VRAM solo para pesos, pero este dato no se detalla en la model card.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForImageTextToText` y `peft.PeftModel.from_pretrained`, con `dtype=torch.bfloat16` y `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota: el repositorio almacena pesos de adaptador e informes; no crea ni factura un endpoint de inferencia de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión test (240) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-gretel-sql-lora (este) | 4B (base) + LoRA | no disponible | 76,67% | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen3.5-4B base | 4B | no disponible | No evaluado en test; 77,50% en validación | no disponible | Hugging Face |
| GPT-5.6 Terra vía Codex | no disponible | no disponible | 74,17% | propietaria | API propietaria |

No se dispone de información sobre otros adaptadores text-to-SQL comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El benchmark es un subconjunto filtrado del dataset Gretel, no el rendimiento sobre el dataset completo; los resultados no son directamente comparables con evaluaciones estándar de text-to-SQL.
- La diferencia frente a GPT-5.6 Terra no es estadísticamente significativa (IC 95% incluye cero); el adaptador iguala, no supera, al modelo propietario en este subconjunto.
- Las bases de datos pequeñas pueden producir coincidencias de ejecución accidentales y el SQL de referencia puede ser incorrecto.
- Se desconoce la exposición del dataset público en el preentrenamiento del modelo base, lo que puede inflar los resultados.
- Terra se ejecutó con presupuestos de inferencia y transportes distintos a los del adaptador, lo que limita la comparación justa.
- El adaptador solo genera `SELECT` y CTE para SQLite; no cubre `INSERT`, `UPDATE`, `DELETE` ni otros dialectos SQL.
- Solo soporta inglés según la model card.
- Riesgo de alucinación en esquemas complejos o preguntas ambiguas; requiere validación de las consultas generadas antes de su ejecución en producción.
- La conversión Tinker→PEFT no se validó con generación end-to-end ni con `merge_and_unload`; debe usarse el adaptador sin fusionar y verificar el comportamiento en el entorno de destino.
- El adaptador de la cabeza de salida permanece separado de los embeddings de entrada vinculados, lo que puede requerir ajustes en el pipeline de carga.
- No se han publicado datos de sesgos, latencia ni throughput.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-4B, no detallada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/guistmartin/qwen3.5-4b-gretel-sql-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Nest: https://nest.technology
