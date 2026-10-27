# Osam-2025/quantosimo-maths-marking-v1.1

## Resumen

QuantOsimo Maths Marking Model v1.1 es un ajuste fino mediante LoRA de `microsoft/Phi-3.5-mini-instruct` diseñado específicamente para corregir respuestas de Matemáticas del currículo británico (GCSE, AS-Level y A-Level) contra los mark schemes oficiales de las juntas AQA, Pearson Edexcel y OCR. Lo desarrolla QuantOsimo, una plataforma de tutoría de Matemáticas y Ciencias para estudiantes del Reino Unido, y se publica como adaptador PEFT independiente (0,1 GB) que debe cargarse sobre el modelo base.

El interés técnico del modelo no está en su arquitectura —es un transformer denso decoder-only de 3,8 mil millones de parámetros con 128 000 tokens de contexto, heredado íntegramente del base— sino en su especialización estrecha y en la honestidad metodológica de su evaluación: la versión 1.1 se entrenó excluyendo los exámenes de 2023 y 2024 para poder medir generalización real sobre preguntas nunca vistas, obteniendo un 86% (43/50) frente al 88% en distribución de la v1, una caída de solo 2 puntos porcentuales.

Es relevante ahora porque ejemplifica el patrón de adaptadores LoRA de bajo coste (116 minutos en 2× T4 de Kaggle, 4.066 ejemplos) aplicados a una tarea de evaluación educativa con criterios formales, un nicho donde los benchmarks generalistas no dicen nada. Al mismo tiempo, sus limitaciones son notables: cobertura de una sola materia, un solo idioma, tres juntas examinadoras y una muestra de evaluación de solo 50 preguntas (6 en A-Level).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-3.5-mini); el repositorio contiene un adaptador LoRA sobre el modelo base, no un modelo completo |
| Parametros totales | 3,82 mil millones en el modelo base; el adaptador LoRA publicado ocupa 0,1 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base; la model card del adaptador no la especifica) |
| Tipos de cuantizacion | El repositorio solo publica el adaptador en safetensors sin cuantizar. No se han publicado versiones GGUF, AWQ ni GPTQ de este ajuste; sería necesario fusionar el adaptador con el base y convertir |
| Idiomas soportados | `en` (inglés) según la model card; el modelo base tiene capacidades multilingües limitadas no evaluadas en este ajuste |
| Licencia | Apache-2.0 (adaptador); el modelo base Phi-3.5-mini-instruct es MIT |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, r=16, alpha=16) |

## Arquitectura y entrenamiento

No hay innovación arquitectónica: se parte del transformer decoder-only denso de Phi-3.5-mini-instruct (3,82 B de parámetros, atención con GQA, ventana de 128 000 tokens, alineamiento previo del base mediante SFT y preferencias). Sobre él se aplica un adaptador LoRA con rango 16 y alpha 16, entrenado durante 3 épocas sobre 4.066 ejemplos, con un coste de 116 minutos en 2× NVIDIA T4 (Kaggle). La implementación de referencia del autor carga el modelo con `torch_dtype=torch.float16`, `device_map="auto"` y `attn_implementation="eager"`.

El dataset de entrenamiento se extrajo de enunciados y mark schemes oficiales de AQA, Pearson Edexcel y OCR para Matemáticas de GCSE (Foundation y Higher), AS-Level y A-Level, cubriendo los años 2018-2022 y 2025; los papeles de 2023 y 2024 se reservaron íntegramente para evaluación held-out. No se documenta el formato exacto de las muestras (prompt/completion), la composición por junta o nivel, ni si hubo etapas adicionales de RLHF o DPO más allá del alineamiento heredado del base. Los datos completos no se publican por derechos de autor de las juntas examinadoras; solo hay una muestra de 100 ejemplos disponible.

## Capacidades

- Corrección de respuestas de Matemáticas de GCSE, AS-Level y A-Level comparándolas con el mark scheme oficial de AQA, Edexcel u OCR.
- Asignación de puntuación con criterio de método y precisión (marking por pasos), no solo veredicto correcto/incorrecto.
- Procesamiento de texto extraído de PDF de exámenes, incluyendo enunciados, desarrollo del alumno y tabla de criterios.
- Generación de texto y razonamiento matemático heredados del modelo base Phi-3.5-mini-instruct.
- Ventana de contexto de 128 000 tokens, suficiente para incluir varios mark schemes y una respuesta extensa en un solo prompt.
- Soporte de tool calling / function calling: heredado del modelo base, no validado ni documentado para este ajuste.
- Capacidades de agente multi-paso: no documentadas para este ajuste.
- Modo thinking explícito, visión o audio: no disponibles.
- Capacidades multilingües: no evaluadas; el ajuste está entrenado y declarado únicamente en inglés.

## Casos de uso

- Corrección automática en plataformas EdTech: el modelo recibe el enunciado, el mark scheme y la respuesta transcrita del alumno, y devuelve la puntuación por apartado. Es adecuado porque el ajuste se entrenó sobre la estructura real de los mark schemes de AQA, Edexcel y OCR, con un 100% en la muestra de Edexcel y AS-Level.
- Feedback formativo al estudiante: a partir de la puntuación parcial, el modelo puede señalar qué puntos de método se han perdido y qué paso del desarrollo falta.útil en tutoría porque el criterio de marcado es explícito, no una impresión general del texto.
- Doble marcado y control de calidad: corregir automáticamente un lote de exámenes y comparar con la calificación del profesor para detectar discrepancias superiores a un umbral, priorizando la revisión humana donde el modelo y el docente difieren.
- Investigación en evaluación automática: sirve como baseline reproducible de un marcador especializado de dominio, con una partición held-out por año claramente definida (2023-2024), lo que permite comparar metodologías de marcado automático sin contaminación de datos.
- Generación de datos de marcado a escala: producir pares (respuesta, puntuación, justificación) sobre ítems de años no usados en entrenamiento para aumentar datasets de evaluadores o entrenar modelos de recompensa específicos del dominio.
- Ingesta y triaje de PDF en pipelines de examen: dado que 5 de los 7 fallos documentados provienen de texto extraído corrupto, el modelo puede usarse como señal para detectar transcripciones defectuosas antes de la corrección (si el modelo no puede interpretar la pregunta, el pipeline debe reintentar el OCR).
- Tutoría adaptativa con RAG: recuperar el mark scheme relevante de una base documental y pasarlo como contexto al modelo junto con la respuesta del alumno, aprovechando la ventana de 128 000 tokens para incluir varios criterios y ejercicios relacionados.

## Benchmarks y rendimiento

Evaluación held-out genuine sobre 50 preguntas de los exámenes 2023-2024, excluidas del entrenamiento:

| Prueba | Ambito | Resultado | Notas |
|---|---|---|---|
| Global held-out | 50 preguntas | 86% (43/50) | 7 fallos, 5 de ellos por texto de PDF corrupto |
| Por junta | AQA | 82% (14/17) | |
| Por junta | Edexcel | 100% (17/17) | |
| Por junta | OCR | 75% (12/16) | El autor atribuye el resultado a problemas de extracción de PDF |
| Por nivel | GCSE | 88% (30/34) | Foundation y Higher |
| Por nivel | AS-Level | 100% (10/10) | |
| Por nivel | A-Level | 50% (3/6) | Muestra demasiado pequena para ser concluyente |
| Generalizacion | v1 in-distribution vs v1.1 held-out | 88% vs 86% | Caida de 2 puntos porcentuales |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH) en la información disponible, ni evaluación por parte de terceros.

## Requisitos de hardware

- VRAM estimada para el adaptador fusionado en fp16/bf16: aproximadamente 7,6 GB de pesos, más cache KV. El adaptador por separado ocupa 0,1 GB adicionales.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB de pesos; en Q4_K_M: alrededor de 2,3-2,5 GB (estimaciones aritméticas, no hay versiones cuantizadas publicadas).
- Cache KV con contexto largo: crece linealmente con la ventana; a 128 000 tokens el coste estimado es de aproximadamente 12 GB adicionales en fp16, por lo que en la práctica conviene limitar el contexto a lo que requiera cada corrección (unos pocos miles de tokens).
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con fp16 y contexto moderado. El entrenamiento se realizó en 2× T4 (16 GB cada una).
- GPU de datacenter: A100, H100 o L40S para servir con concurrencia alta o contextos muy largos.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA (`--enable-lora`) o tras fusionar el adaptador, TGI, y llama.cpp/Ollama tras fusionar y convertir a GGUF.
- Nota de compatibilidad: el autor especifica `attn_implementation="eager"`; otras implementaciones de atención no están verificadas para este ajuste.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion en marcado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuantOsimo Maths Marking v1.1 | 3,82 B (adaptador LoRA) | 128 000 | Sí: GCSE/AS/A-Level, AQA/Edexcel/OCR, 86% held-out | Apache-2.0 | Adaptador en HF, 0 descargas |
| microsoft/Phi-3.5-mini-instruct | 3,82 B | 128 000 | Ninguna (propósito general, sin evaluar en marcado) | MIT | Pesos completos, ampliamente desplegado |
| Llama-3.1-8B-Instruct | 8 B | 128 000 | Ninguna (propósito general, sin evaluar en marcado) | Llama 3.1 Community License | Pesos completos |
| Qwen2.5-7B-Instruct | 7,6 B | 131 072 (extendido; 32 768 nativo) | Ninguna (propósito general, sin evaluar en marcado) | Apache-2.0 | Pesos completos |

No se ha identificado en la información disponible ningún otro modelo público especializado en marcado de Matemáticas del currículo UK con el que comparar directamente; la comparación con modelos de propósito general solo es posible en parámetros, contexto y licencia, no en calidad de marcado, porque ninguno de ellos publica resultados en esta tarea.

## Limitaciones y advertencias

- Cobertura restringida a Matemáticas y al currículo del Reino Unido (AQA, Edexcel, OCR). No debe esperarse transferencia a Física, Química u otras materias ni a sistemas educativos de otros países sin reentrenamiento.
- Solo inglés: no se ha evaluado ni entrenado para respuestas en castellano u otros idiomas.
- Evaluación con muestra pequena: 50 preguntas en total, 17 de AQA, 16 de OCR y solo 6 de A-Level. El 100% en Edexcel y AS-Level no es estadísticamente concluyente.
- Sensibilidad a la calidad del OCR/PDF: 5 de los 7 fallos documentados se atribuyen a texto extraído corrupto. En producción hay que validar la transcripción antes de confiar en la puntuación.
- Riesgo de alucinación en la justificación: el modelo puede generar explicaciones de marcado plausibles pero no ancladas al mark scheme, especialmente con entradas ruidosas o preguntas fuera de la distribución de 2018-2022/2025.
- Datos de entrenamiento no publicados por copyright de las juntas examinadoras; solo hay una muestra de 100 ejemplos. Esto impide auditar la composición del dataset y reproducir el ajuste.
- Riesgo legal derivado de los datos: aunque el adaptador se distribuye con Apache-2.0 (y el base con MIT), el contenido de los mark schemes es propiedad de AQA, Pearson Edexcel y OCR; el uso comercial del modelo entrenado sobre ese material requiere una revisión legal propia, más allá de la licencia declarada.
- No apto para calificaciones oficiales o vinculantes: cualquier despliegue debe incluir revisión humana, dado el 14% de entradas no procesables y la varianza por junta.
- Dependencia del modelo base: el repositorio no es autónomo, requiere descargar `microsoft/Phi-3.5-mini-instruct` y cargar el adaptador con PEFT; un error de versión de `transformers`/`peft` puede degradar el comportamiento silenciosamente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad ni publicación en venue revisada.
- Sin benchmarks estándar (MMLU, GSM8K, MATH): no es posible situar su capacidad matemática general frente a otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Osam-2025/quantosimo-maths-marking-v1.1
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Muestra del dataset (100 ejemplos): https://huggingface.co/datasets/Osam-2025/uk-gcse-alevel-maths-markschemes-2018-2025
- Plataforma del autor: https://quantosimo.com
- Paper, blog técnico, repositorio de código y demo: no disponibles en la información proporcionada.
