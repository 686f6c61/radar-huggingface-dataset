# Kaynester/Llama-3.2-3B-Instruct-bnb-4bit-JSON-workout-gguf

## Resumen

Este repositorio contiene una versión en formato GGUF de un ajuste fino del modelo Llama-3.2-3B-Instruct, publicado por el usuario Kaynester bajo el identificador `Llama-3.2-3B-Instruct-bnb-4bit-JSON-workout-gguf`. No se trata de un modelo entrenado desde cero, sino de un derivado: el nombre indica que el punto de partida fue una cuantización de 4 bits (bitsandbytes) del Instruct de 3B de Meta, sobre la que se aplicó un ajuste fino orientado a generar planes de entrenamiento en formato JSON. La única conversión documentada en la model card es el paso a GGUF mediante Unsloth.

El interés práctico del artefacto es limitado pero claro: ofrece un fichero único de aproximadamente 2,0 GB, cuantizado en Q4_K_M, que puede ejecutarse en CPU o en GPUs de consumo mediante llama.cpp y herramientas compatibles, con una ventana de memoria muy reducida. Es un ejemplo típico de ajuste fino ligero y empaquetado para despliegue local, no un modelo de propósito general con validación pública.

Conviene subrayar que la información disponible es mínima: la model card no declara licencia, idiomas, longitud de contexto, composición del dataset de ajuste ni resultados de evaluación, y el repositorio no registra descargas ni valoraciones. Cualquier evaluación de su calidad debe hacerse empíricamente sobre el caso de uso concreto antes de considerarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B Instruct; detalles de la arquitectura base no disponibles en la informacion proporcionada) |
| Parametros totales | 3.212.749.888 (dato real de safetensors del modelo base referenciado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada en el repositorio) |
| Tipos de cuantizacion | GGUF Q4_K_M (fichero `Llama-3.2-3B-Instruct.Q4_K_M.gguf`); el punto de partida era una cuantizacion bnb-4bit, por lo que existe doble cuantizacion |
| Idiomas soportados | No disponible (no declarados en el repositorio) |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | GGUF (llama.cpp); tamano del repo 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct, un transformer decoder-only de 3.212.749.888 parámetros en precisión bfloat16 según los datos del modelo base. Sobre esa base se realizó un ajuste fino con cuantización de 4 bits mediante bitsandbytes (indicado en el propio nombre del repositorio) y posteriormente se convirtió el resultado a GGUF con Unsloth, generando un único fichero Q4_K_M. No se documenta si el ajuste empleó QLoRA, LoRA u otra técnica, ni el número de pasos, el rango, la tasa de aprendizaje o el hardware utilizado.

Tampoco se especifica el volumen ni la composición del dataset de entrenamiento: el sufijo "JSON-workout" sugiere pares instrucción-respuesta orientados a producir planes de entrenamiento físico estructurados en JSON, pero no hay cifras de tokens, mezcla de datos, ni constancia de etapas de RLHF o DPO posteriores al ajuste supervisado. No se declara ninguna innovación técnica (atención lineal, decodificación especulativa, modo de razonamiento, etc.). El único elemento técnico verificable es la cadena de conversión: base BF16, cuantización bnb-4bit para el ajuste, y cuantización Q4_K_M para la distribución final, lo que acumula dos pérdidas de precisión sucesivas.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del Instruct de Llama 3.2 3B (etiqueta `conversational` en el repositorio).
- Generación de planes de entrenamiento estructurados en JSON, presumiblemente el objetivo del ajuste fino, aunque no se documenta el esquema exacto ni ejemplos de salida.
- Instrucciones de seguimiento en un único turno y multiturno, en la medida en que lo permita el modelo base.
- Integración con llama.cpp: la model card documenta el uso mediante `llama-cli -hf ... --jinja`, lo que habilita plantillas de chat Jinja.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Generación de rutinas de entrenamiento en JSON para una aplicación de fitness: el modelo puede recibir parámetros (objetivo, días por semana, material disponible) y devolver una estructura serializable que la aplicación valide con un esquema propio antes de persistirla.
- Prototipado rápido en local: al ocupar alrededor de 2 GB en disco y poder ejecutarse en CPU, sirve para validar un flujo de generación estructurada en un portátil sin GPU dedicada antes de invertir en un modelo mayor.
- Enriquecimiento de catálogos deportivos: generación por lotes de descripciones y planes para ejercicios, con revisión humana posterior, usando llama.cpp en modo batch.
- Backend de bajo coste para un chatbot de nicho: despliegue en una instancia pequeña con llama.cpp u Ollama, atendiendo consultas acotadas al dominio de entrenamiento sin asumir capacidades de razonamiento general.
- Extracción y normalización de datos: si el ajuste respeta el formato, puede convertir texto libre sobre rutinas en JSON canónico para ingesta en una base de datos.
- Entorno de experimentación docente: ejemplo reproducible de la cadena completa (Instruct base, cuantización 4 bits, ajuste, conversión a GGUF) para cursos de despliegue de modelos.
- Evaluación comparativa de cuantizaciones: al existir un hermano del mismo autor (`Llama-3.2-3B-Instruct-bnb-4bit-workoutplan-v2-gguf`), permite medir el impacto en calidad de distintas decisiones de empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna evaluación específica del dominio de fitness, y tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa aproximadamente 2,0 GB; con caché KV para conversaciones cortas, la inferencia completa cabe en unos 2,5-3 GB de memoria, aunque la cifra exacta depende de la longitud de contexto efectiva, que no está declarada.
- GPU de consumo: cabe holgadamente en tarjetas de 4-6 GB (GTX 1650, RTX 3050, RTX 2060) y con margen amplio en 8 GB o más (RTX 3060, RTX 4060, RTX 4090), donde puede residir completamente en VRAM.
- CPU: ejecutable sin GPU mediante llama.cpp, con rendimiento aceptable en x86-64 moderno para un modelo de 3B en Q4_K_M; no se dispone de medidas de tokens por segundo.
- Despliegue: `llama-cli` y `llama-mtmd-cli` según la model card, además de llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI admiten GGUF de forma limitada o experimental; no hay confirmación de funcionamiento para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Este modelo (JSON-workout GGUF) | 3,21 B | No disponible | No disponible | GGUF Q4_K_M | Ajuste fino de nicho, sin evaluaciones ni descargas |
| Llama-3.2-3B-Instruct (base) | 3,21 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | BF16 y variantes cuantizadas oficiales | Referencia de capacidades generales; este repositorio no documenta su degradacion |
| Kaynester/Llama-3.2-3B-Instruct-bnb-4bit-workoutplan-v2-gguf | No disponible | No disponible | No disponible | GGUF | Variante del mismo autor; permite comparar estrategias de ajuste |
| Qwen2.5-3B-Instruct | No disponible | No disponible | No disponible | No disponible | Alternativa habitual en el segmento 3B; sin datos verificados en esta ficha |

No se dispone de datos de rendimiento comparativos para ninguna de las filas, por lo que la tabla refleja únicamente categoría y disponibilidad, no calidad.

## Limitaciones y advertencias

- Doble cuantización: el ajuste se hizo sobre una base en bnb-4bit y el resultado se volvió a cuantizar a Q4_K_M, lo que acumula pérdida de precisión y puede degradar tareas sensibles a formato o a matices numéricos.
- Especialización estrecha: el ajuste orientado a JSON de entrenamiento puede mermar capacidades generales del Instruct original (conversación abierta, código, matemáticas) sin que se documente el alcance de esa degradación.
- Riesgo de alucinación relevante en el dominio: recomendaciones de ejercicio, cargas o progresiones inventadas pueden provocar lesiones; se requiere validación por profesionales y avisos claros en cualquier producto final.
- Sin datos de evaluación: no hay benchmarks, ni pruebas de adherencia al esquema JSON, ni comparación con el modelo base.
- Licencia no declarada: la ausencia de licencia en el repositorio impide determinar si el uso comercial es admisible; además, el modelo base de Meta tiene sus propias condiciones que hay que verificar por separado.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés, y menos aún en castellano.
- Contexto no declarado: no se puede planificar un caso de uso con conversaciones largas sin medir previamente el límite efectivo.
- Señales de validación nulas: 0 descargas y 0 valoraciones en el momento de la consulta, repositorio creado y actualizado el mismo día, model card mínima.
- El nombre del repositorio mezcla convenciones (`bnb-4bit` y `gguf`) que pueden inducir a error sobre el formato real de los pesos distribuidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Kaynester/Llama-3.2-3B-Instruct-bnb-4bit-JSON-workout-gguf
- Variante del mismo autor: https://huggingface.co/Kaynester/Llama-3.2-3B-Instruct-bnb-4bit-workoutplan-v2-gguf
- Árbol de ficheros de la variante: https://huggingface.co/Kaynester/Llama-3.2-3B-Instruct-bnb-4bit-workoutplan-v2-gguf/tree/main
- Ficha de Llama 3.2 en Meta (formatos de prompt y model cards): https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2
- Unsloth (herramienta de conversión citada por el autor): https://github.com/unslothai/unsloth
- Llama.cpp (runtime indicado en la model card): https://github.com/ggml-org/llama.cpp
- Registro de terceros del modelo: https://free2aitools.com/model/kaynester/llama-3.2-3b-instruct-bnb-4bit-workoutplan-v2-gguf
- Resumen técnico de Llama-3.2-3B-Instruct: https://www.emergentmind.com/topics/llama-3-2-3b-instruct
