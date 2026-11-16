# JayaHareeswarReddy/nl2sql-qlora

## Resumen

nl2sql-qlora es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por JayaHareeswarReddy y publicado en Hugging Face. El modelo está pensado para la traducción de lenguaje natural a SQL (NL2SQL), es decir, convertir preguntas formuladas en inglés en consultas SQL ejecutables. Se trata de un modelo pequeño, de 1.500 millones de parámetros, derivado de la familia Qwen2.5-Coder de Alibaba, y ajustado mediante QLoRA con la librería Unsloth, lo que permite entrenar con requisitos de memoria reducidos.

El modelo base es la variante Instruct de Qwen2.5-Coder-1.5B, cuantizada a 4 bits (bnb-4bit), sobre la que se aplicó un adaptador LoRA cuantizado. El resultado se distribuye en formato safetensors y con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de generación de texto con transformers o text-generation-inference.

La relevancia de este modelo radica en su tamaño reducido y su especialización: permite desplegar un generador NL2SQL en hardware modesto (incluso GPU de consumo) sin renunciar a la licencia permisiva. No obstante, la información publicada por el autor es muy limitada: no se detallan los datos de entrenamiento, el número de tokens, los hiperparámetros ni los resultados de evaluación, por lo que su rendimiento real en producción debe validarse de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.500 millones (modelo base Qwen2.5-Coder-1.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-1.5B soporta 32.768 tokens; el ajuste no documenta cambios) |
| Tipos de cuantización | Modelo base en bnb-4bit; pesos publicados en safetensors (cuantización adicional no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-Coder-1.5B-Instruct, una arquitectura densa de 1.500 millones de parámetros. El entrenamiento se realizó mediante QLoRA (LoRA cuantizado) sobre el modelo base ya cuantizado a 4 bits con bitsandbytes, utilizando la librería Unsloth, que según el autor permite un entrenamiento "2x más rápido". Se emplearon las librerías transformers, TRL y Unsloth, y el resultado se publicó como un modelo completo en formato safetensors.

No se dispone de información sobre el conjunto de datos de entrenamiento: no se especifica el número de tokens, la composición del dataset (pares pregunta-SQL, esquemas de bases de datos, etc.), ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de QLoRA y Unsloth. El ajuste está orientado a la tarea NL2SQL, pero la model card no aporta detalles sobre el proceso ni sobre posibles etapas de alineación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Traducción de lenguaje natural a SQL (NL2SQL): el objetivo declarado del ajuste fino.
- Generación de código en general, gracias a la base Qwen2.5-Coder.
- Soporte de tool calling / function calling: no documentado en la información proporcionada (el modelo base Qwen2.5-Coder-Instruct lo soporta, pero el ajuste no lo confirma).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: el modelo puede recibir una pregunta en inglés junto con el esquema de la base de datos y generar la consulta SQL correspondiente, integrándose en una interfaz de chat para empleados no técnicos. Su tamaño de 1.5B permite desplegarlo en una GPU de consumo.
- Generación de SQL en herramientas de BI: integrado en un dashboard, el modelo traduce preguntas de negocio ("¿cuántas ventas hubo en el Q3?") a consultas ejecutables contra el almacén de datos, reduciendo la dependencia del equipo de datos.
- Automatización de tareas ETL y analítica ad hoc: en pipelines de datos, el modelo puede generar consultas de transformación o extracción a partir de descripciones en lenguaje natural, con validación posterior por un humano o por un linter SQL.
- Prototipado rápido de APIs NL2SQL: gracias a su licencia Apache 2.0 y su reducido tamaño, sirve para construir un servicio de traducción NL2SQL en entornos de desarrollo o demos, antes de escalar a modelos mayores.
- Educación y formación en SQL: el modelo puede actuar como tutor que convierte enunciados en consultas de ejemplo, mostrando la sintaxis SQL correspondiente a cada pregunta.
- Filtrado y preprocesado en pipelines de datos: generar consultas de selección simples para tareas de limpieza o muestreo de datos a partir de instrucciones en inglés, con bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en precisión FP16 requiere aproximadamente 3 GB de VRAM; en cuantización de 4 bits (GGUF/AWQ/GPTQ) puede reducirse a unos 1-1.5 GB. Los pesos publicados en safetensors requieren cargar el modelo completo, por lo que se recomienda al menos 4 GB de VRAM para FP16 con margen para el contexto.
- GPU recomendadas: NVIDIA RTX 3060/4060 (8-12 GB), RTX 4090, A100, H100. Cabe en GPU de consumo de gama media.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM, especialmente con cuantización a 4 bits.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (tag del repo), vLLM, llama.cpp/Ollama si se convierte a GGUF (no se proporciona GGUF en el repo), TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| nl2sql-qlora (este modelo) | 1.5B | no disponible | Apache 2.0 | NL2SQL (ajuste fino) | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Código general | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Código general | Hugging Face |
| CodeLlama-7B-Instruct | 7B | 16.384 tokens | Llama 2 (uso comercial con restricciones) | Código general | Hugging Face |

La comparativa se limita a modelos de la misma familia o categoría; no se dispone de benchmarks del ajuste NL2SQL para comparar rendimiento. El modelo base Qwen2.5-Coder-1.5B-Instruct es la referencia directa, y el ajuste añade especialización en NL2SQL a costa de posibles regresiones en otras tareas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5-Coder, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: alto en tareas NL2SQL, ya que el modelo puede generar consultas sintácticamente válidas pero semánticamente incorrectas o referencias a tablas/columnas inexistentes. Se recomienda validación contra el esquema real y revisión humana.
- Limitaciones de contexto o idioma: el modelo está etiquetado solo para inglés; no se garantiza un buen rendimiento en castellano ni en otros idiomas. La longitud de contexto del ajuste no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base Qwen2.5-Coder también es Apache 2.0.
- Caveats para producción: no hay benchmarks publicados, ni datos de entrenamiento, ni evaluación de calidad; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria. Se recomienda evaluarlo exhaustivamente antes de usarlo en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/JayaHareeswarReddy/nl2sql-qlora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Qwen2.5-Coder (familia de modelos): no disponible en la información proporcionada
- Paper o blog del ajuste: no disponible en la información proporcionada
