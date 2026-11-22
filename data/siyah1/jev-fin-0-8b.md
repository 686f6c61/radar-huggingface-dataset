# siyah1/jev-fin-0.8b

## Resumen

Jev-fin-0.8b es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B-Base, desarrollado por el usuario siyah1 y publicado en Hugging Face bajo acceso restringido. El modelo está especializado en el dominio financiero y orientado a tareas de clasificación con probabilidades calibradas, según indican sus etiquetas. Emplea una arquitectura de tipo transformer de texto (etiqueta de arquitectura `qwen3_5_text`) con aproximadamente 1.006 millones de parámetros totales, lo que lo sitúa en la categoría de modelos pequeños.

La propuesta del modelo se enmarca en el paradigma que sus etiquetas denominan "system-one" y "typed-decisions": decisiones tipadas y de respuesta rápida, en contraposición a los modos de razonamiento extendido. El objetivo declarado es ofrecer clasificaciones financieras con probabilidades calibradas, un requisito habitual en aplicaciones de riesgo, scoring o triaje documental donde la confianza de la predicción importa tanto como la etiqueta.

La relevancia del modelo es limitada por su escasa adopción (0 descargas y 0 likes en el momento de la consulta) y por la ausencia de documentación técnica publicada. Se distribuye en formato safetensors, con un repositorio de 14,1 GB, y requiere aceptar condiciones de acceso en Hugging Face antes de su descarga. No se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (etiqueta `qwen3_5_text`), derivada de Qwen3.5-0.8B-Base |
| Parametros totales | 1.006.672.704 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 1.000 millones de parámetros. Sobre esta base se ha aplicado un ajuste fino orientado a clasificación financiera, según las etiquetas del repositorio (`finance`, `classification`, `calibrated-probabilities`). La etiqueta `system-one` sugiere un modo de inferencia directo, sin cadena de razonamiento explícita, y `typed-decisions` apunta a una salida estructurada con tipos de decisión predefinidos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Tampoco se documentan detalles sobre el procedimiento de calibración de probabilidades ni sobre las etiquetas de clasificación empleadas. Toda esta información debe considerarse no disponible.

## Capacidades

- Clasificación de texto en el dominio financiero, con salida de probabilidades calibradas según la descripción del repositorio.
- Decisiones tipadas ("typed-decisions"): generación de etiquetas estructuradas y predefinidas en lugar de texto libre.
- Modo "system-one": inferencia directa y de baja latencia, sin razonamiento multi-paso explícito.
- Generación de texto base heredada del modelo Qwen3.5-0.8B-Base (capacidad no verificada en el finetune).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el paradigma declarado es system-one).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Triaje de documentos financieros: clasificación de comunicaciones, extractos o informes en categorías predefinidas con una probabilidad asociada, útil para enrutar documentos a revisores humanos cuando la confianza es baja.
- Scoring de riesgo en tiempo real: al operar en modo system-one y con un tamaño de 1.000 millones de parámetros, puede desplegarse en infraestructura modesta para puntuar transacciones o solicitudes con baja latencia.
- Detección de anomalías en transacciones: clasificación binaria o multiclase de operaciones sospechosas, aprovechando las probabilidades calibradas para fijar umbrales de alerta.
- Moderación y filtrado de contenido financiero: clasificación de mensajes de atención al cliente o foros para identificar consultas de fraude, reclamaciones o solicitudes de producto.
- Extracción de intención en asistentes financieros: etiquetado tipado de la intención del usuario (consulta de saldo, transferencia, reclamación) como paso previo a un sistema de diálogo.
- Investigación académica sobre calibración: el modelo puede servir como caso de estudio para evaluar técnicas de calibración de probabilidades en modelos pequeños especializados, dado su enfoque declarado en este aspecto.
- Clasificación por lotes en pipelines de datos: procesamiento de grandes volúmenes de texto financiero en batch, donde el tamaño reducido permite alto throughput en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16/BF16 (1.006 millones de parámetros), alrededor de 1 GB en cuantización de 8 bits y unos 0,6-0,7 GB en 4 bits (estimación teórica; no se han publicado cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo es sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo safetensors de arquitectura Qwen, es compatible con vLLM, TGI y transformers; para llama.cpp/Ollama sería necesaria una conversión a GGUF no publicada oficialmente.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera una latencia baja en modo system-one, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| siyah1/jev-fin-0.8b | 1.006 M | no disponible | other (gated) | Acceso restringido en HF |
| Qwen/Qwen3.5-0.8B-Base | ~0,8 B (según nombre) | no disponible | no disponible | Público en HF (modelo base) |
| FinBERT (ProsusAI) | ~110 M | 512 tokens | no disponible | Público en HF |
| FinGPT (variantes) | variable | variable | variable | Público en HF |

La comparación con FinBERT y otras alternativas financieras no puede establecerse en términos de rendimiento porque no se han publicado benchmarks del modelo. La ventaja estructural frente al modelo base es la especialización y la calibración declarada; frente a FinBERT, el mayor tamaño y la arquitectura moderna de Qwen3.5, pero sin evidencia empírica de mejora.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; la licencia "other" puede imponer restricciones adicionales al uso comercial que deben revisarse antes de producción.
- Ausencia total de documentación: no hay model card detallada, datos de entrenamiento ni evaluación publicada; el comportamiento real del modelo es desconocido.
- Riesgo de alucinación: heredado del modelo base y no mitigado de forma documentada; en clasificación, el riesgo se traduce en etiquetas erróneas con alta confianza si la calibración no se ha validado externamente.
- Sesgos: no documentados; los modelos financieros pequeños pueden amplificar sesgos presentes en los datos de ajuste fino.
- Idiomas: no se especifican; se desconoce si el ajuste fino conserva las capacidades multilingües del base.
- Contexto: longitud no disponible, lo que impide planificar su uso con documentos largos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-21): metadatos anómalos que sugieren que el repositorio puede no ser fiable o estar mal configurado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siyah1/jev-fin-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
