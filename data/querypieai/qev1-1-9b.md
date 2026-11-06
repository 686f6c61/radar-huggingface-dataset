# querypieai/QEV1.1-9B

## Resumen

QEV1.1-9B es un modelo de decisión tipada orientado a prevención de fuga de datos (DLP, *data loss prevention*) desarrollado por QueryPie AI. Se construye sobre el modelo base Qwen/Qwen3.5-9B-Base mediante la fusión de una actualización LoRA sobre el backbone en BF16, y se publica como un paquete autocontenido de solo inferencia que incluye backbone, tokenizador, cabeza de punteros (*pointer head*) en FP32 y un cargador personalizado de Transformers.

A diferencia de un modelo generativo convencional, QEV1.1-9B no produce texto libre: evalúa preguntas tipadas (`is_dlp` y preguntas directas `is_*`) y devuelve probabilidades sobre las opciones definidas en la consulta, manteniendo la interfaz QEV de `choice`, `noul` y `score`. El objetivo es clasificar documentos a nivel de documento para determinar si contienen datos sensibles, con especial énfasis en japonés además de inglés y coreano.

La relevancia actual del modelo radica en su enfoque de "decisión tipada" para DLP: en lugar de generar una respuesta textual que habría que parsear, devuelve directamente probabilidades calibradas por opción, lo que facilita su integración en pipelines de cumplimiento y seguridad. Su licencia es restrictiva: permite investigación no comercial, pero exige permiso escrito de QueryPie para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) con cabeza de punteros FP32 para decisión tipada |
| Parámetros totales | 9B (según denominación del modelo; no se detalla el desglose exacto) |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (backbone) y FP32 (cabeza de punteros); se menciona guía de cuantización en el paquete, sin detallar tipos concretos |
| Idiomas soportados | en, ko, ja |
| Licencia | querypie-ai-research-license-v1.0 (uso comercial requiere permiso escrito) |
| Formato de pesos | safetensors (repo de 17,9 GB), cargable con `transformers` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-9B-Base (revisión `68c46c4b3498877f3ef123c856ecfde50c39f404`) y aplica una actualización LoRA que se fusiona en el backbone BF16. Sobre esa base se añade una cabeza de punteros en FP32 que implementa la interfaz de decisión tipada: el modelo recibe una pregunta con opciones (por ejemplo, `{"dlp": {"type": "noul", "instructions": "...", "criteria": {"false": "No", "true": "Yes"}}}`) y devuelve probabilidades por opción en lugar de texto generado. El paquete incluye metadatos de calibración y un cargador personalizado de Transformers.

El corpus de entrenamiento combina datos generales públicos con datos internos corporativos de DLP y aumentación multilingüe. La model card indica explícitamente que no se distribuyen filas de entrenamiento, calibración, validación o test, ni etiquetas, ejemplos generados, estado del optimizador o ficheros de adaptadores; tampoco se revelan nombres de datasets, rutas internas, recuentos de muestras ni reglas de generación. No se detalla el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación a nivel de documento para DLP: evalúa si un documento contiene datos sensibles mediante preguntas tipadas `is_dlp` e `is_*`.
- Decisión tipada con devolución de probabilidades por opción (interfaz `choice`, `noul`, `score`), sin generación de texto libre.
- Soporte multilingüe en inglés, coreano y japonés, con aumentación específica para japonés.
- Diseñado para preguntas de tipo "sí/no" y criterios definidos por el usuario en la consulta.
- Paquete autocontenido: no requiere repositorio privado, adaptador separado ni descarga externa del modelo base.
- No valida pipelines genéricos de generación de texto ni inferencia alojada (*hosted inference*).
- No extrae fragmentos (*spans*) ni recuentos de hallazgos: la decisión es a nivel de documento.

## Casos de uso

- Clasificación de documentos para DLP en entornos corporativos: el modelo recibe el texto y una pregunta tipada sobre presencia de datos sensibles, y devuelve la probabilidad de cada opción para que el sistema de cumplimiento aplique políticas.
- Filtrado previo en pipelines de correo o compartición de ficheros: se integra como paso de decisión que etiqueta documentos antes de permitir su salida, usando las probabilidades como umbral configurable.
- Cumplimiento normativo multilingüe: al cubrir inglés, coreano y japonés, permite aplicar una misma política de clasificación a documentación en esas tres lenguas.
- Evaluación de políticas personalizadas: al aceptar criterios definidos en la propia consulta, un equipo de seguridad puede formular preguntas específicas de su organización sin reentrenar el modelo.
- Investigación académica no comercial sobre DLP y clasificación tipada: la licencia permite investigación y evaluación no comercial, lo que facilita su uso en estudios comparativos.
- Pruebas de concepto internas de seguridad de la información: útil para medir la viabilidad de un clasificador DLP basado en LLM antes de adquirir una licencia comercial.
- Moderación de contenido sensible en repositorios documentales: clasificación por documento para decidir si requiere revisión humana adicional.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la referencia histórica del checkpoint fuente sin fusionar en BF16, no a un benchmark completo del paquete fusionado/cuantizado a 8 bits. Son resultados de preguntas directas de tipo `is_*`:

| Métrica | Resultado |
|---|---:|
| Macro-F1 global (excluyendo biométrico) | 97,72 % |
| Macro-F1 EN | 96,69 % |
| Macro-F1 KO | 98,29 % |
| Macro-F1 JA | 98,46 % |
| Registros de evaluación | 6.281 |

`is_biometric` no tiene filas positivas y se excluye de los resúmenes macro. El fichero `validation.json` recoge comprobaciones de recarga serializada y pruebas de humo de nueve preguntas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 17,9 GB en BF16, por lo que la inferencia en BF16 requiere aproximadamente 18-20 GB de VRAM más overhead; la cabeza de punteros en FP32 añade una cantidad no especificada.
- GPU validadas: NVIDIA H200 con CUDA según la model card.
- GPU consumer: no se documenta validación en GPU de consumo; por tamaño, un modelo de 9B en BF16 encajaría en GPUs con 24 GB o más (por ejemplo, RTX 4090), pero no está validado oficialmente.
- Despliegue: `transformers` con `AutoModel` y `trust_remote_code=True`; no se validan pipelines genéricos de generación ni inferencia alojada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QEV1.1-9B | 9B | no disponible | Clasificación DLP por decisión tipada, en/ko/ja | QueryPie AI Research License v1.0 (comercial con permiso) | Hugging Face (45 descargas) |
| Qwen3.5-9B-Base | 9B | no disponible | Modelo base generativo | según modelo base (no detallada aquí) | Hugging Face |
| Alternativas DLP basadas en LLM | no disponible | no disponible | Clasificación/generación | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite investigación personal y académica no comercial; el uso comercial, desarrollo de producto y pruebas de concepto con motivación comercial requieren permiso escrito de QueryPie o un acuerdo de licencia comercial.
- La evaluación publicada corresponde al checkpoint fuente sin fusionar, no al paquete fusionado/cuantizado; el rendimiento real del paquete puede diferir.
- `is_biometric` no tiene filas positivas en la evaluación, por lo que su comportamiento en esa categoría no está validado.
- No extrae fragmentos ni recuentos de hallazgos: solo emite decisiones a nivel de documento.
- No se validan pipelines genéricos de generación de texto ni inferencia alojada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un clasificador con salida probabilística, la calibración en dominios distintos al entrenamiento no está garantizada.
- Cobertura lingüística limitada a inglés, coreano y japonés; no se garantiza comportamiento en otras lenguas.
- Los datos de entrenamiento no se distribuyen ni se detallan, lo que limita la auditabilidad del modelo.
- Publicar los pesos completos no impide técnicamente un reentrenamiento posterior, aunque la licencia sigue rigiendo su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/querypieai/QEV1.1-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Contacto comercial de QueryPie: https://www.querypie.com/en/contact-us
