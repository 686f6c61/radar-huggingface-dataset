# agarwalharshit350/child-reading-assessment

## Resumen

El modelo `agarwalharshit350/child-reading-assessment`, publicado como "Children's Writing Level & Learning Gap Assessor", es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen2.5-1.5B-Instruct. Lo desarrolla el usuario agarwalharshit350 y su propósito es analizar muestras de escritura libre infantil para producir una evaluación educativa estructurada en JSON: nivel de grado (K-8), patrones de error (fonológicos, de palabras frecuentes, de secuenciación, gramaticales y de puntuación), fortalezas observadas y un indicador de cuándo podría ser recomendable una evaluación profesional.

Se trata de un modelo de nicho, orientado a docentes, logopedas y desarrolladores de herramientas EdTech que necesiten un primer filtro automático sobre texto escrito por niños. No es un modelo de propósito general ni un diagnóstico clínico: la propia model card insiste en que solo observa patrones de escritura y no sustituye a un especialista en lectura.

Su relevancia es limitada pero concreta: demuestra que con un presupuesto de 0 dólares (una GPU T4 gratuita de Kaggle durante 4,2 horas) se puede adaptar un modelo pequeño de 1.500 millones de parámetros a una tarea educativa especializada, con un formato de salida JSON consumible por aplicaciones. El repositorio es pequeño (0,1 GB) y solo contiene los pesos del adaptador, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado (rango 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); el adaptador se distribuye en safetensors; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El ajuste se realizó con QLoRA: cuantización de 4 bits en formato NF4 del modelo base, con un adaptador LoRA de rango 16 y alpha 32. El entrenamiento se ejecutó en una notebook gratuita de Kaggle con una GPU T4 durante 4,2 horas, con un coste total declarado de 0 dólares.

Los datos de entrenamiento suman 7.724 pares instrucción-respuesta, procedentes de dos fuentes: el CLEAR Corpus (4.724 pasajes etiquetados por nivel de grado) y 3.000 muestras sintéticas de escritura infantil para grados K-8. La pérdida final de entrenamiento fue de 0,892. No se documenta en la información disponible si hubo fases de RLHF o DPO, ni la composición exacta de las muestras sintéticas ni el proceso de generación de etiquetas.

## Capacidades

- Análisis de muestras de escritura infantil y clasificación en niveles de grado K-8.
- Detección de patrones de error en cinco categorías: fonológicos, de palabras frecuentes (sight words), de secuenciación, gramaticales y de puntuación.
- Identificación de fortalezas observadas en el texto del menor.
- Generación de observaciones en lenguaje llano dirigidas a padres y docentes.
- Emisión de un indicador (`when_to_seek_evaluation`) sobre la conveniencia de una evaluación profesional, con criterio declarado como conservador.
- Salida estructurada en JSON válido, apta para integración en aplicaciones.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Herramienta de cribado en el aula: un docente pega una redacción de un alumno y obtiene un JSON con nivel estimado y patrones de error, que puede revisar antes de decidir si deriva el caso a un especialista. El modelo actúa como primer filtro, no como evaluador final.
- Aplicación EdTech para padres: integración del adaptador en una web o app donde las familias suben una muestra de escritura y reciben observaciones en lenguaje llano junto con el aviso de que no es un diagnóstico clínico.
- Generación de informes de progreso: procesar por lotes varias muestras de un mismo alumno a lo largo del curso y comparar la evolución de los patrones de error detectados en cada entrega.
- Investigación educativa: uso del modelo para preetiquetar corpus de escritura infantil y acelerar la anotación manual posterior por parte de evaluadores humanos.
- Formación de docentes: emplear las salidas del modelo como material de discusión en talleres sobre dificultades de lectoescritura, contrastando la clasificación automática con la valoración experta.
- Prototipado rápido de pipelines de evaluación: al ser un adaptador pequeño sobre un modelo de 1,5B, permite desplegar un servicio de análisis en hardware modesto sin depender de APIs externas ni de modelos de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB; el modelo base Qwen2.5-1.5B-Instruct debe descargarse por separado.
- Inferencia en precisión completa (float32, como en el ejemplo de la model card) requiere del orden de 6 GB de VRAM; en float16 o bfloat16 se reduce a unos 3 GB, y en cuantización de 4 bits puede caber en torno a 1-1,5 GB.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en una T4, que es la GPU usada para el entrenamiento.
- Despliegue posible con transformers + PEFT (el flujo documentado), y previsiblemente con vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y exportar a GGUF, aunque estas rutas no se documentan en la información disponible.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| child-reading-assessment (este) | 1,5B (base) + LoRA | no disponible | Evaluación de escritura infantil | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en esta ficha | Propósito general, instrucciones | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Propósito general, mayor capacidad | Apache 2.0 | Ampliamente disponible |

No se dispone de información sobre otros adaptadores públicos especializados en evaluación de escritura infantil que permitan una comparación directa de rendimiento. El modelo base y sus versiones mayores de la familia Qwen2.5 son las alternativas naturales si se necesita un modelo de propósito general, pero no están especializados en esta tarea ni producen el JSON estructurado que genera este adaptador.

## Limitaciones y advertencias

- No es una herramienta de diagnóstico clínico: la model card lo declara explícitamente y el indicador de derivación es deliberadamente conservador.
- Solo admite inglés; no hay soporte multilingüe documentado.
- El entrenamiento combina datos reales del CLEAR Corpus con 3.000 muestras sintéticas, lo que puede introducir sesgos y artefactos propios de los datos generados.
- Riesgo de alucinación inherente a un modelo de 1,5B: puede inventar patrones de error o clasificar incorrectamente el nivel de grado, especialmente con muestras cortas o atípicas.
- El rendimiento real no está validado con benchmarks públicos; la única métrica disponible es la pérdida de entrenamiento (0,892), insuficiente para estimar calidad en producción.
- El modelo no almacena ni registra muestras según la model card, pero al desplegarlo uno mismo debe garantizar el cumplimiento de la normativa de protección de datos de menores (RGPD en la UE), algo que la ficha del autor no aborda.
- La licencia Apache 2.0 permite uso comercial, pero el uso en contextos educativos o clínicos exige supervisión humana y advertencias claras al usuario final.
- El repositorio tiene 0 descargas y 1 like, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agarwalharshit350/child-reading-assessment
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- CLEAR Corpus (dataset citado en la model card): no disponible enlace directo en la informacion proporcionada
