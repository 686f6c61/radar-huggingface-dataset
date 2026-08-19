# MetaMateo82/wolf-sales-llama-3.2-3b

## Resumen

Wolf-Sales 3B es un adaptador LoRA de fine-tuning sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`, desarrollado por MetaMateo82. Está especializado en psicología de ventas y cierre ejecutivo, y se basa en la trilogía de Robert Greene (*The 48 Laws of Power*, *The Art of Seduction* y *Mastery*). El modelo está diseñado para analizar transcripciones de llamadas comerciales, evaluar dinámicas de poder, diagnosticar arquetipos de comprador y generar auditorías psicológicas estructuradas en cuatro partes.

Su relevancia actual reside en el enfoque "local-first" y de bajo coste: al partir de un modelo de 3B parámetros, el adaptador permite ejecutar inferencia en dispositivos con recursos limitados, incluidos smartphones Android de 6 GB de RAM, sin depender de la nube. El repositorio declara un tamaño de 0.15 GB y cero descargas hasta la fecha, por lo que se trata de un proyecto incipiente sin validación externa.

La arquitectura es un transformer decoder-only con 3.2B parámetros, con ventana de contexto de 128K tokens heredada del modelo base. La licencia es la Comunitaria de Llama 3.2, con las restricciones asociadas al uso comercial. El idioma declarado es exclusivamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B-Instruct) |
| Parametros totales | 3.2B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (según modelo base) |
| Tipos de cuantizacion | BF16, GGUF Q4_K_M (~2.0 GB) |
| Idiomas soportados | Inglés (declarado en model card) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (QLoRA) sobre el transformer Llama-3.2-3B-Instruct. Según la model card, se aplicó QLoRA con rango r=16, alpha=16 y dropout=0.05 sobre las proyecciones q, k, v, o y las capas gate, up y down. El optimizador utilizado fue Paged AdamW de 8 bits con programación de tasa de aprendizaje coseno.

El dataset de entrenamiento es `MetaMateo82/wolf-sales-distillation`, un conjunto de datos de destilación propio, no público. No se han proporcionado detalles sobre el número de tokens ni la composición del dataset. La model card menciona una "patente provisional" (USPTO App #63/942,978) sobre un sistema de orquestación de memoria distribuida, pero no se especifica si el entrenamiento incorpora técnicas adicionales de RLHF o DPO.

## Capacidades

- Análisis de transcripciones de llamadas de ventas y negociaciones, con salida estructurada en cuatro partes: extracción JSON, razonamiento encadenado (chain-of-thought), auditoría psicológica multi-capa y autoevaluación socrática de cinco pilares.
- Diagnóstico de arquetipos de comprador basado en 18 tipos de "víctimas" descritos en *The Art of Seduction*.
- Identificación de pivotes de resistencia y cambios de estrategia entre modos de poder y seducción.
- Generación de preguntas reflexivas para coaching de cierre comercial.
- Capacidad de tool calling no declarada explícitamente, pero el formato de salida JSON sugiere compatibilidad con pipelines de procesamiento automatizado.
- Multilingüismo limitado a inglés (no declarado soporte para otros idiomas).
- Modo de razonamiento explícito con etiquetas `thinking` para análisis internos.

## Casos de uso

- **Auditoría de llamadas de ventas**: el modelo puede analizar transcripciones de llamadas reales y devolver un informe de cuatro partes que identifica errores de encuadre, arquetipo del comprador y puntos de fricción. Adecuado para equipos de ventas que necesitan feedback rápido sin esperar a un manager.
- **Coaching ejecutivo en ventas**: los cinco pilares socráticos generan preguntas reflexivas que el comercial puede usar para autoevaluarse tras cada negociación, mejorando su ejecución táctica de forma continua.
- **Formación de equipos comerciales**: permite simular escenarios de negociación con distintos arquetipos de comprador y practicar respuestas ante objeciones, todo ello con el modelo ejecutándose en local.
- **Análisis de negociaciones B2B**: para evaluar dinámicas de poder en negociaciones complejas (por ejemplo, con clientes con gran cartera), el modelo puede extraer los momentos en los que el comercial perdió o mantuvo el marco de control.
- **Integración en CRM**: el formato JSON de salida facilita su integración en sistemas de gestión de relaciones con clientes para registrar automáticamente el análisis de cada interacción.
- **Aplicaciones de venta asistida por IA**: como motor de respuesta para asistentes que ayudan a comerciales durante llamadas en vivo, sugiriendo pivotes de resistencia basados en los principios de Greene.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no aporta métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El único dato de rendimiento declarado es una velocidad de 60-100 tokens por segundo en CPU ligera y una huella de memoria de ~2.0 GB en cuantización Q4_K_M, sin referencia a pruebas estándar.

## Requisitos de hardware

- VRAM estimada: ~2.0 GB en GGUF Q4_K_M, ~6 GB en BF16 para el modelo base (3.2B).
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, Apple Silicon M1/M2). El modelo puede ejecutarse en CPU con calidad aceptable.
- Compatible con consumer GPU: sí, incluso en dispositivos móviles con 6GB de RAM según la model card.
- Opciones de despliegue: Transformers + PEFT (Python), llama.cpp para GGUF, Ollama (si se convierte a formato GGUF), vLLM para servidores.
- Latencia: declarada de 60-100 tokens/s en CPU, pero sin verificación externa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| MetaMateo82/wolf-sales-llama-3.2-3b | 3.2B | 128K | Psicología de ventas | Llama 3.2 |
| meta-llama/Llama-3.2-3B-Instruct | 3.2B | 128K | Chat general | Llama 3.2 |
| Qwen2.5-3B-Instruct | 3.1B | 32K | Chat general multilingüe | Apache 2.0 |

No hay modelos de ventas especializados con licencia abierta comparables en el mismo rango de tamaño. La comparativa con el base es la más directa: Wolf-Sales añade una capa de conocimiento específico de ventas, pero hereda las limitaciones del base. Qwen2.5-3B ofrece multilingüismo y licencia Apache 2.0 más permisiva, pero no está especializado en ventas.

## Limitaciones y advertencias

- El modelo está entrenado solo en inglés, por lo que no es adecuado para análisis de conversaciones en otros idiomas.
- La licencia Llama 3.2 Community impone restricciones de uso comercial: para aplicaciones comerciales con más de 700 millones de usuarios mensuales se requiere licencia explícita de Meta.
- No hay evidencia de validación externa: el repositorio tiene cero descargas y cero likes, y no se han publicado benchmarks. Riesgo de alucinación en análisis de transcripciones.
- El contenido se basa en el obra de Robert Greene, que describe técnicas de manipulación y seducción; su uso en entornos reales puede plantear problemas éticos de consentimiento y manipulación de clientes.
- La fecha de creación declarada (2026-08-19) es futura respecto a la fecha de redacción, lo que sugiere un posible error en el repositorio o un dato artificial.
- El dataset de entrenamiento no es público, lo que dificulta la auditoría del comportamiento del modelo.
- La arquitectura LoRA sobre el modelo base significa que el adaptador debe combinarse con el modelo base; no es un modelo completo descargable de forma independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MetaMateo82/wolf-sales-llama-3.2-3b
- Dataset de entrenamiento: https://huggingface.co/datasets/MetaMateo82/wolf-sales-distillation
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de Llama 3.2: https://developer.meta.com/ai/models/llama-3/
- Model cards de Llama 3.2: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
