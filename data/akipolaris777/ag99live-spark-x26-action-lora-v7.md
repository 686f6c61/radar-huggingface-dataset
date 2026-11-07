# AkiPolaris777/ag99live-spark-x26-action-lora-v7

## Resumen

El modelo `ag99live-spark-x26-action-lora-v7` es un adaptador LoRA (PEFT) desarrollado por AkiPolaris777 para el proyecto AG99live, orientado a la generación de parámetros de animación Live2D a partir de conversaciones en lenguaje natural. No es un modelo de lenguaje independiente: se aplica sobre el modelo base `XHToken/Spark-X2.6-1.7B-Base` (1.700 millones de parámetros) y su función es transformar intenciones conversacionales en estructuras de acción semántica (movimiento de cabeza, mirada, inclinación corporal, expresiones faciales) que un runtime posterior traduce a parámetros concretos como `ParamAngleX` o `ParamEyeBallX`.

El adaptador se sitúa en la capa intermedia entre un chat model y el motor Live2D/VTube Studio, generando principalmente JSON estructurado con ejes semánticos, pasos de movimiento (`motion_steps`) y duraciones. Según la model card, se entrenó mediante LoRA SFT sobre el modelo base cuantizado en NF4, con una pasada de datos de producción de alta cobertura. Esta versión v7 se conserva como respaldo estable y punto de rollback de una versión ya validada en producción.

Su relevancia es acotada pero específica: cubre un nicho concreto (VTubers y mascotas de escritorio) donde los LLM generalistas no producen salidas directamente parseables por runtimes de animación. El adaptador es ligero, se distribuye en formato safetensors y puede ejecutarse en paralelo con modelos mayores (por ejemplo DeepSeek) para comparación en sombra y recolección de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base Spark-X2.6-1.7B-Base) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | Entrenado en NF4; el adaptador en sí se distribuye en safetensors (precisión no especificada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |
| Librería | PEFT |
| Modelo base | XHToken/Spark-X2.6-1.7B-Base |
| Tamaño del repositorio | 0,0 GB (adaptador ligero) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT que se acopla a un transformer decoder-only de 1,7B parámetros (Spark-X2.6-1.7B-Base). El entrenamiento consistió en un SFT con LoRA sobre el modelo base cuantizado en NF4, usando una única pasada de datos de acción de producción de alta cobertura. No se documenta el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. El repositorio no incluye los datos de entrenamiento originales, las grabaciones de parámetros de VTS ni los registros de conversación.

La innovación principal no está en la arquitectura del modelo, sino en el formato de salida: el adaptador está especializado en producir JSON estructurado con ejes semánticos (cabeza, ojos, cuerpo, expresión), duraciones y una estructura compatible con `motion_steps`, de modo que un runtime externo pueda mapear esos valores a los parámetros reales de cada modelo Live2D con validación de rangos y límites de seguridad. Según la model card, la v7 es más estable en acciones simples y salidas del tipo `axis_levels`; las trayectorias continuas de cuatro fases y las acciones multipaso siguen en desarrollo en versiones posteriores. El experimento asociado en GitHub (`spark-x26-action-sft`) se describe explícitamente como una prueba de humo del pipeline, no como una evaluación de calidad de acción ni una afirmación de generalización.

## Capacidades

- Generación de intenciones de acción a partir de diálogo en lenguaje natural, en formato JSON estructurado.
- Control de ejes semánticos: rotación de cabeza, dirección de mirada, inclinación corporal e intensidad de expresiones faciales.
- Salida con duraciones y estructura compatible con `motion_steps`.
- Adaptación a distintos modelos Live2D mediante mapeo de parámetros en el runtime (no lo hace el modelo).
- Ejecución en paralelo con modelos de mayor tamaño (por ejemplo DeepSeek) para comparación en sombra.
- No genera respuestas de texto conversacional ni voz; su salida es acción.
- No soporta tool calling, function calling ni razonamiento multipaso general: su dominio es la generación de payloads de animación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Mascotas de escritorio interactivas: el adaptador convierte los turnos de conversación en acciones de cabeza, mirada y expresión que el runtime reproduce en tiempo real, aportando sensación de presencia sin necesidad de un LLM grande dedicado a animación.
- VTubers automatizados: integrado en un pipeline de chat, permite que el avatar reaccione con gestos coherentes al contenido del diálogo, con salida JSON directamente parseable por VTube Studio a través del runtime.
- Rollback de producción: al ser una versión estable validada, sirve como respaldo ante regresiones de versiones posteriores en el sistema AG99live.
- Comparación en sombra con modelos grandes: ejecutándolo en paralelo con DeepSeek u otros modelos, permite contrastar la calidad de las acciones generadas y acumular datos de entrenamiento para futuras versiones.
- Prototipado de controladores de animación: desarrolladores que construyan runtimes Live2D pueden usar el adaptador como generador de payloads de prueba para validar su capa de mapeo y validación de rangos.
- Investigación en grounding de acciones: útil para estudiar cómo un modelo pequeño especializado traduce intención conversacional en parámetros motores estructurados, dentro de un dominio acotado y verificable.
- Despliegue local ligero: al ser un adaptador pequeño sobre un modelo de 1,7B, puede ejecutarse en hardware modesto junto al runtime de animación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El experimento de GitHub asociado se describe como una prueba de humo del pipeline, no como una evaluación de calidad o generalización.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al tratarse de un adaptador sobre un modelo base de 1,7B, la VRAM vendrá determinada por el modelo base y su cuantización (el entrenamiento usó NF4). No se especifican cifras.
- GPU recomendadas: no disponibles. Por el tamaño del modelo base, es plausible su ejecución en GPU de consumo, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: carga mediante PEFT + Transformers (`PeftModel.from_pretrained` con `AutoModelForCausalLM` y `trust_remote_code=True`), o descarga local para los scripts de inferencia/merge de AG99live. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para generación de parámetros Live2D), ni se dispone de datos de rendimiento para establecer una comparación con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `XHToken/Spark-X2.6-1.7B-Base`; sin él no funciona.
- No controla VTube Studio directamente ni reconoce automáticamente el significado de los parámetros de cada modelo Live2D; esa responsabilidad recae en el runtime.
- No sustituye la validación de rangos ni los límites de seguridad del runtime.
- No genera voz, texto de respuesta ni contenido de conversación completo.
- Menor estabilidad en trayectorias continuas de cuatro fases y acciones multipaso; la v7 está optimizada para acciones simples y `axis_levels`.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles.
- Sesgos y riesgo de alucinación: no documentados; al producir JSON estructurado, el riesgo principal es la generación de payloads inválidos o incoherentes, que el runtime debe filtrar.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB reportado: verificar la integridad del adaptador antes de usarlo en producción (la model card incluye un SHA256 del adapter).
- El experimento asociado se describe como prueba de humo del pipeline, no como validación de calidad de acción.

## Enlaces

- Hugging Face: https://huggingface.co/AkiPolaris777/ag99live-spark-x26-action-lora-v7
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Repositorio GitHub del experimento: https://github.com/murphys7017/AG99live/tree/main/experiments/spark-x26-action-sft
- Configuración de entrenamiento LoRA: https://github.com/murphys7017/AG99live/blob/main/experiments/spark-x26-action-sft/train_lora.yaml
