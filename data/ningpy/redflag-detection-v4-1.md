# ningpy/redflag-detection-V4.1

## Resumen

Redflag Detection V4.1 es un modelo de extracción de señales de alarma médicas (red flags) desarrollado por ningpy, fine-tuneado a partir de Qwen2.5-7B-Instruct mediante LoRA. Está diseñado para detectar y extraer de forma estructurada 65 reglas críticas de urgencias médicas a partir de texto clínico no estructurado, alineado con la especificación "Red Flad_New" de agosto de 2026 y ampliado con 6 reglas adicionales que cubren emergencias quirúrgicas y obstétricas no contempladas en la especificación original.

La versión V4.1 corrige un problema de alucinación del campo `is_male` presente en V4.0 (donde el sexo estaba en el prompt pero ningún ejemplo de entrenamiento lo usaba), añade compuertas defensivas de sexo en reglas de embarazo y un fallback pediátrico por edad. El modelo tiene 7.615 millones de parámetros, soporta inglés, chino y malayo, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que aborda un problema clínico de alto riesgo con un enfoque de extracción estructurada, no de generación libre, lo que lo hace adecuado para integración en sistemas de triaje o soporte a la decisión clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (secuencia de entrenamiento: 1900 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors F16) |
| Idiomas soportados | ingles (en), chino (zh), malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, y se fine-tunea con LoRA (r=32, alpha=64) sobre 7 proyecciones objetivo. El entrenamiento usó 3816 muestras (3766 de la versión V20c más 50 muestras nuevas específicas de extracción de sexo en bloques "Patient Info: Age X, Male/Female" en inglés, chino y malayo), con 3 épocas, learning rate 2e-5, longitud de secuencia 1900 tokens y paralelismo de datos distribuido en 8 GPU V100. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares de entrada-salida estructurados.

La innovación principal no está en la arquitectura base sino en el diseño de la tarea: el modelo extrae campos estructurados (reglas, sexo, edad, bandas de edad) siguiendo un esquema de 65 reglas compiladas con compuertas de sexo y fallback de edad pediátrica. La versión V4.1 añade compuertas defensivas de sexo en las reglas 34-39 (embarazo) que solo bloquean conflictos, no son obligatorias, y un fallback que acepta booleanos `is_child`/`is_baby` cuando falta `age_band`.

## Capacidades

- Extracción estructurada de señales de alarma médicas (red flags) a partir de texto clínico no estructurado.
- Detección de 65 reglas críticas, incluyendo emergencias quirúrgicas (torsión testicular, cauda equina), obstétricas (hemorragia posparto, PID severa), urológicas (pielonefritis) y oftalmológicas (glaucoma de ángulo cerrado, pérdida súbita de visión).
- Compuertas de sexo defensivas para reglas específicas de género (embarazo, torsión testicular, hemorragia posparto) que evitan falsos positivos por conflicto de sexo.
- Fallback pediátrico: acepta `is_child`/`is_baby` cuando no hay `age_band` disponible.
- Extracción de campos de sexo y edad desde bloques de información de paciente en inglés, chino y malayo.
- Generación de texto conversacional heredada del modelo base Qwen2.5-7B-Instruct (no es el uso principal).
- Compatible con text-generation-inference y endpoints de vLLM.

## Casos de uso

- Triaje de urgencias en atención primaria: el modelo puede analizar la descripción narrativa de un paciente y extraer automáticamente las reglas de alarma activadas, permitiendo priorizar derivaciones a urgencias hospitalarias. Su alta recall (0.853 en evaluación clínica justa) lo hace adecuado para no perder casos graves.
- Soporte a la decisión clínica en servicios de urgencias: integrado en un sistema de historia clínica electrónica, puede señalar en tiempo real si un paciente presenta criterios de torsión testicular, cauda equina o hemorragia posparto, ayudando a evitar retrasos diagnósticos.
- Auditoría de registros médicos: procesamiento por lotes de historias clínicas para detectar si se documentaron adecuadamente las señales de alarma en episodios previos, útil para control de calidad y formación de residentes.
- Telemedicina y chatbots de salud: el modelo puede extraer red flags de conversaciones de pacientes en inglés, chino o malayo, y activar alertas de derivación urgente en plataformas de consulta remota.
- Investigación epidemiológica: análisis retrospectivo de grandes volúmenes de texto clínico para estudiar la prevalencia de presentaciones con red flags y su correlación con desenlaces, gracias a la extracción estructurada y reproducible.
- Sistemas de segunda opinión en entornos con pocos recursos: al ser un modelo de 7B parámetros, puede desplegarse en una GPU consumer (por ejemplo, RTX 3090/4090 cuantizado) y usarse en clínicas rurales sin acceso a especialistas, como apoyo a personal no médico.

## Benchmarks y rendimiento

El autor reporta evaluación en un conjunto de validación de 269 casos con criterio estricto (exact match) y criterio clínico justo (SUSPECTED = TP para recall):

| Metrica | V4.0 (V20c) | V4.1 (V20d) |
|---|---|---|
| Exact Match | 89.2% | 87.0% |
| Precision | 0.918 | 0.901 |
| Recall | 0.749 | **0.786** |
| F1 | 0.825 | **0.839** |

Evaluación clínica justa (SUSPECTED = TP para recall):

| Metrica | Valor |
|---|---|
| Precision | 0.753 |
| Recall | **0.853** |
| F1 | 0.800 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K. Los datos disponibles se limitan a la evaluación específica de la tarea de detección de red flags.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7.615M parámetros en F16 (~15.2 GB en disco). En float16, la inferencia requiere aproximadamente 15-16 GB de VRAM. Con cuantización a 8 bits (~8 GB) o 4 bits (~4-5 GB) podría ejecutarse en GPUs consumer.
- GPU recomendadas: para float16 completo, una A100 40GB, RTX 4090 24GB o RTX 3090 24GB son suficientes. Con cuantización 4-bit, una RTX 3060 12GB o RTX 4060 Ti 16GB podrían ser viables.
- Sí cabe en GPU consumer: una RTX 3090/4090 con 24 GB puede ejecutar el modelo en FP16 sin problemas; con cuantización, incluso GPUs de 8-12 GB son suficientes.
- Opciones de despliegue: vLLM (el autor proporciona comando de arranque con `vllm.entrypoints.openai.api_server`), text-generation-inference (compatible según tags), llama.cpp con conversión a GGUF, Ollama si se convierte el formato.
- Latencia y throughput: no disponible en la información proporcionada. Como referencia, un modelo 7B en FP16 en una RTX 4090 suele generar 40-60 tokens/s con vLLM, pero no hay datos específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de red flags médicas. Como referencia de la categoría de modelos 7B instruct fine-tuneados para tareas clínicas:

| Modelo | Base | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| redflag-detection-V4.1 | Qwen2.5-7B-Instruct | 7.6B | no disponible | Apache 2.0 | Extracción estructurada de red flags |
| Meditron-7B (referencia) | Llama-2-7B | 7B | 4096 | Llama license | Razonamiento clínico general |
| BioMistral-7B (referencia) | Mistral-7B | 7B | 8192 | Apache 2.0 | Comprensión de literatura biomédica |

La comparación es orientativa; no hay datos de benchmarks comunes entre estos modelos y el de redflag-detection.

## Limitaciones y advertencias

- El modelo está especializado en extracción de red flags y no debe usarse como sustituto de juicio clínico profesional. Su salida debe ser revisada por personal sanitario cualificado.
- La evaluación se realizó sobre 269 casos de validación; el tamaño de la muestra es limitado y puede no reflejar la variabilidad real de la práctica clínica.
- La versión V4.1 muestra una ligera caída en exact match (87.0% vs 89.2% en V4.0) y en precisión (0.901 vs 0.918), aunque mejora recall y F1. Esto implica un trade-off: más sensibilidad a costa de más falsos positivos.
- El modelo fue entrenado con datos en inglés, chino y malayo; su rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no está documentada; el entrenamiento usó secuencias de 1900 tokens, por lo que entradas más largas pueden degradar el rendimiento.
- No se han publicado análisis de sesgos ni evaluación de equidad en subgrupos demográficos (edad, etnia, comorbilidades).
- Riesgo de alucinación en campos estructurados: aunque se corrigió el problema de `is_male`, otros campos podrían alucinarse en entradas ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas.
- Para producción, se requiere el motor de reglas V20e (65 reglas compiladas con compuertas de sexo y fallback de edad); sin él, el modelo no puede interpretar correctamente su salida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ningpy/redflag-detection-V4.1
- Versión anterior V4.0: https://huggingface.co/ningpy/redflag-detection-V4.0
- Versión V1.0: https://huggingface.co/ningpy/redflag-detection-V1.0
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto de referencia no relacionado (analizador de contratos con detección de red flags): https://github.com/luclacombe/red-flag-ai
