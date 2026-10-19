# Sj8287/ELL8299-assignment1-adapters

## Resumen

`Sj8287/ELL8299-assignment1-adapters` es un repositorio de adaptadores LoRA publicados con la librería `peft`, no un modelo completo. Contiene tres carpetas: `A4`, un sanitizador seleccionado como `best_sanitizer` sobre `Qwen/Qwen2.5-1.5B-Instruct`; `victim_raw`, un modelo víctima de 0,5B entrenado sobre un corpus bruto; y `victim_sanitized`, otro modelo víctima de 0,5B entrenado sobre el corpus sanitizado. El autor es `Sj8287` y el artefacto parece corresponder a una entrega académica de la asignatura ELL8299.

El objetivo declarado por la model card y las etiquetas (`pii`, `sanitization`, `memorization`) es experimental: estudiar si la sanitización de datos personales reduce la memorización en modelos pequeños. El repositorio ocupa 0,3 GB y los pesos están en safetensors, pero no incluye licencia, idiomas, pipeline, métricas ni detalles de entrenamiento. Su relevancia es metodológica y de reproducibilidad, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers Qwen2.5; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | No disponible para los adaptadores. Modelos base declarados: Qwen2.5-1.5B-Instruct (1,5 B) y Qwen2.5-0.5B (0,5 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio contiene safetensors de adaptadores; la cuantización se aplicaría al modelo base en tiempo de carga y no está documentada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA PEFT) |
| Tamaño del repositorio | 0,3 GB |
| Librería | `peft` |

## Arquitectura y entrenamiento

El repositorio contiene tres adaptadores LoRA, no pesos completos. `A4` se monta sobre `Qwen/Qwen2.5-1.5B-Instruct` y corresponde al sanitizador seleccionado de la Parte A, reutilizado en las Partes B y C. `victim_raw` y `victim_sanitized` se montan sobre `Qwen/Qwen2.5-0.5B`; el primero se entrenó con el corpus bruto y el segundo con el corpus sanitizado, lo que permite comparar la memorización antes y después del filtrado.

No se documentan hiperparámetros de LoRA (rango, alpha, dropout, módulos objetivo), número de tokens, composición del corpus, epochs, optimizador ni si hubo RLHF o DPO. Tampoco se especifica si el sanitizador A4 se entrenó como modelo generativo, etiquetador token a token o clasificador de entidades. La innovación técnica, si existe, no está descrita en la información proporcionada.

## Capacidades

- Sanitización de PII: `A4` se presenta como el sanitizador seleccionado (`best_sanitizer`) del experimento. No se publican métricas de precisión, recall ni tipos de entidades cubiertas.
- Modelos víctima para memorización: `victim_raw` y `victim_sanitized` están pensados para comparar la fuga de información entre un corpus bruto y uno sanitizado.
- Generación de texto y completado: al depender de Qwen2.5-0.5B, los modelos víctima pueden generar texto, pero no se documenta su calidad ni su ajuste instruct.
- Instrucciones: `A4` hereda el comportamiento de `Qwen2.5-1.5B-Instruct`, aunque no se detallan capacidades específicas del adaptador.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- **Reproducción del experimento de memorización**: cargar `victim_raw` y `victim_sanitized`, comparar la extracción de PII mediante prompts de completado y medir la diferencia entre corpus bruto y sanitizado. Es adecuado porque el repositorio incluye explícitamente ambas variantes.
- **Evaluación de un sanitizador de PII**: usar `A4` como línea base para medir precisión y recall sobre un conjunto etiquetado de nombres, correos, teléfonos o direcciones antes de integrarlo en un pipeline. El autor lo marca como el mejor sanitizador de la Parte A.
- **Auditoría de fuga de datos en modelos pequeños**: ejecutar ataques de extracción con prefijos, preguntas directas y ejemplos few-shot contra `victim_raw`, y repetir el ataque contra `victim_sanitized` para cuantificar la reducción de memorización.
- **Docencia y formación en privacidad de ML**: emplear los adaptadores como ejemplo reproducible de LoRA, PEFT y evaluación de memorización en un curso o taller. El tamaño de 0,3 GB y los modelos base de 0,5B y 1,5B reducen el coste computacional.
- **Prototipo de red team de privacidad**: simular un atacante que intenta extraer datos personales de un modelo entrenado con datos de usuarios, y validar si la sanitización previa elimina o mitiga esos ataques.
- **Validación técnica de integración PEFT**: probar `snapshot_download`, `PeftModel.from_pretrained`, fusión de adaptadores e inferencia con transformers en un entorno de CI. La estructura de carpetas y el tamaño del repositorio facilitan la prueba.
- **Filtro experimental previo a datos sintéticos**: aplicar `A4` a un corpus de origen antes de generar datos sintéticos o ajustar otro modelo, y comparar la PII residual con un detector independiente. Debe usarse como etapa de preprocesamiento, no como garantía única.
- **Análisis del equilibrio privacidad-utilidad**: comparar `victim_sanitized` y `victim_raw` en una tarea concreta, como clasificación o completado, para medir la pérdida de calidad asociada a la sanitización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de precisión y recall del sanitizador de PII.

## Requisitos de hardware

- VRAM estimada: no hay medidas publicadas por el autor. Como referencia de planificación, un modelo de 0,5B en fp16 requiere del orden de 1 GB solo para pesos, y uno de 1,5B del orden de 3 GB; hay que añadir KV cache, activaciones y overhead del runtime.
- GPU recomendadas: para los modelos base de 0,5B y 1,5B, una RTX 3060 de 12 GB, una RTX 4090 de 24 GB o una A100/H100 son suficientes. Para lotes grandes o entrenamiento, se recomienda A100/H100.
- GPU consumer: sí, los modelos base caben en GPUs consumer de 8-12 GB en fp16. En 4 bits, un 0,5B puede caber en GPUs de 4-6 GB, pero no está verificado para este repositorio.
- Despliegue: la vía directa es `transformers` + `peft` con `PeftModel.from_pretrained`. vLLM puede servir adaptadores LoRA, pero requiere configurar el modelo base y el adaptador. llama.cpp u Ollama no cargan adaptadores PEFT directamente; haría falta fusionar los pesos y convertir a GGUF, un proceso no incluido en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada adaptadores públicos equivalentes de sanitización de PII sobre Qwen2.5. La comparación más directa es con los modelos base sin adaptador y entre las tres variantes del repositorio.

| Artefacto | Parámetros del modelo base | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---:|---|---|---|---|
| `A4` (este repositorio) | 1,5 B | No disponible | No disponible | Pública en HuggingFace; 0 descargas | Sin benchmarks publicados |
| `victim_raw` (este repositorio) | 0,5 B | No disponible | No disponible | Pública en HuggingFace; 0 descargas | Sin benchmarks publicados |
| `victim_sanitized` (este repositorio) | 0,5 B | No disponible | No disponible | Pública en HuggingFace; 0 descargas | Sin benchmarks publicados |
| `Qwen/Qwen2.5-1.5B-Instruct` sin adaptador | 1,5 B | No disponible en esta ficha | No disponible en esta ficha | Pública en HuggingFace | No evaluado aquí |
| `Qwen/Qwen2.5-0.5B` sin adaptador | 0,5 B | No disponible en esta ficha | No disponible en esta ficha | Pública en HuggingFace | No evaluado aquí |

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial, redistribución ni modificación sin consultar al autor y la licencia de los modelos base.
- Artefacto académico: no hay evaluación independiente, model card detallada ni validación por la comunidad; el repositorio tiene 0 descargas y 0 likes.
- Sanitizador sin métricas: no se publican precisión, recall, tipos de PII cubiertos ni tasas de falsos positivos y falsos negativos. Un sanitizador puede dejar pasar identificadores directos o indirectos.
- Riesgo de memorización residual: la existencia de `victim_sanitized` no demuestra por sí sola que la sanitización elimine la memorización; hacen falta ataques y métricas reproducibles.
- Los modelos víctima son de 0,5B y pueden no representar el comportamiento de modelos mayores. Los resultados no son directamente extrapolables.
- Sesgos y alucinaciones: los adaptadores heredan los sesgos y las limitaciones de Qwen2.5; no se documenta ningún proceso de alineación adicional para los modelos víctima.
- Contexto e idiomas no documentados: no puede planificarse su uso en conversaciones largas ni en idiomas distintos del inglés sin verificación previa.
- Dependencia del modelo base: los adaptadores requieren las versiones exactas de Qwen2.5 indicadas; una actualización o una variante distinta puede romper la carga.
- El corpus bruto puede contener PII real. Su manipulación debe cumplir el RGPD y las políticas de privacidad aplicables; no debe distribuirse sin anonimización adicional.
- No hay garantía de que la sanitización cubra cuasi-identificadores, datos agregados, formatos no vistos o PII inferida por combinación de atributos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Sj8287/ELL8299-assignment1-adapters
- Modelo base de `A4`: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base de `victim_raw` y `victim_sanitized`: https://huggingface.co/Qwen/Qwen2.5-0.5B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
