# pidof/Qwen3-32B-heretic

## Resumen

Qwen3-32B-heretic es una versión "abliterada" (decensurada) del modelo Qwen3-32B de Alibaba Cloud, publicada por el usuario pidof. El proceso de abliteración elimina la dirección de rechazo del espacio de activaciones del modelo mediante proyección direccional sobre los pesos de atención y de la proyección descendente del MLP, sin utilizar datos de fine-tuning ni modificar el resto de los pesos. El resultado es un checkpoint completo fusionado en bfloat16 de 32.762.123.264 parámetros (32,8 mil millones), con licencia Apache 2.0.

El modelo conserva la arquitectura y capacidades del Qwen3-32B original, pero reduce los rechazos de 100 a 20 sobre un conjunto de 100 prompts dañinos de prueba (una reducción del 80 %), manteniendo una divergencia KL de 0,0919 respecto al original en prompts inocuos, lo que según las guías de Heretic indica que las capacidades generales permanecen prácticamente intactas. Está pensado para investigación sobre entrenamiento de seguridad, red-teaming, escritura creativa y escenarios donde los rechazos del modelo base interfieren con trabajo legítimo.

La relevancia actual radica en que es un ejemplo reproducible de abliteración con parámetros documentados (200 ensayos de Optuna, selección Pareto-óptima en el ensayo 191) y con el directorio `reproduce/` que contiene la configuración exacta, versiones de paquetes e información del sistema. El contexto soportado es de 32.768 tokens según el ejemplo de despliegue con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 64 capas, atención con proyección de salida y MLP con proyección descendente |
| Parametros totales | 32.762.123.264 (32,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según ejemplo de vLLM `--max-model-len 32768`) |
| Tipos de cuantizacion | bfloat16 nativo; cuantizaciones derivadas posibles con llama.cpp, AWQ, GPTQ (la abliteración no interfiere con la cuantización) |
| Idiomas soportados | Inglés (declarado en la model card; hereda el multilingüismo del Qwen3-32B base, no detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo fusionado en bfloat16, 65,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 64 capas con 32,8 mil millones de parámetros, idéntico en arquitectura al Qwen3-32B de Alibaba Cloud. La modificación respecto al original consiste en la proyección fuera de los pesos de la dirección de rechazo, identificada a partir de las activaciones residuales del propio modelo. Concretamente, se aplicó abliteración sobre dos componentes: `attn.o_proj` (proyección de salida de atención) y `mlp.down_proj` (proyección descendente del MLP), con parámetros de peso máximo y mínimo por capa documentados en la model card.

El proceso se realizó con Heretic v1.4.0 en configuración por defecto y estrategia de exportación `merge`, ejecutando 200 ensayos de búsqueda multiobjetivo con Optuna sobre rechazos y divergencia KL. Los datos de dirección provinieron de los conjuntos `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca` (400 prompts cada uno). El entrenamiento se ejecutó en una NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) en bfloat16 con batch size 128, durante aproximadamente 4,5 horas. No se utilizaron datos de fine-tuning y los pesos restantes no se modificaron.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del Qwen3-32B base.
- Razonamiento y matemáticas (capacidades del modelo base, no medidas en esta ficha).
- Generación de código (capacidades del modelo base, no medidas en esta ficha).
- Modo "thinking" de Qwen3: soportado, aunque la evaluación de rechazos se hizo con thinking desactivado; se recomienda `enable_thinking=False` o `/no_think` para resultados predecibles.
- Cumplimiento de instrucciones con muchos menos rechazos que el original (20 de 100 prompts dañinos rechazados frente a 100 del original).
- No se documenta soporte explícito de tool calling, function calling ni uso como agente en la información disponible.
- Capacidades multilingües: la model card declara únicamente inglés; el multilingüismo del base no se detalla.

## Casos de uso

- Investigación sobre entrenamiento de seguridad: permite estudiar cómo se comporta un modelo con la dirección de rechazo eliminada y comparar con el original para analizar qué representaciones internas codifican el rechazo.
- Red-teaming y evaluación de robustez: al reducir los rechazos un 80 %, facilita generar respuestas ante prompts que el modelo base declinaría, útil para construir conjuntos de evaluación adversariales.
- Escritura creativa sin fricción: para ficción, guiones o narrativa que aborde temas sensibles, el modelo responde con menos negativas que el original, manteniendo las capacidades de generación del Qwen3-32B.
- Reproducibilidad de pipelines de abliteración: el directorio `reproduce/` permite replicar el proceso exacto (versiones, configuración, hardware) para validar metodologías de decensurado.
- Despliegue en investigación con vLLM: el checkpoint en bfloat16 cabe en una GPU de 80 GB o en dispositivos con ~70 GB de memoria unificada, lo que permite servirlo con `vllm serve pidof/Qwen3-32B-heretic --dtype bfloat16 --max-model-len 32768` para experimentos a escala.
- Generación de datos sintéticos para entrenamiento: al reducir rechazos, puede producir ejemplos que el modelo base no generaría, útiles para aumentar la diversidad de datasets de investigación (con la supervisión y moderación adecuadas).
- Estudio de la divergencia KL como métrica de daño: sirve como caso de referencia para medir cuánto degrada la abliteración las capacidades generales (KL = 0,0919 frente al original).

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3-32B original |
|---|---|---|
| Rechazos (de 100 prompts dañinos de test) | 20 | 100 |
| Divergencia KL respecto al original | 0,0919 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las de rechazos y divergencia KL del proceso de abliteración.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa 65,5 GB; se necesita una GPU de 80 GB o un dispositivo con al menos ~70 GB de memoria unificada.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier GPU con 80 GB de VRAM; también cabe en sistemas con memoria unificada grande (el autor lo ejecutó en una NVIDIA DGX Spark GB10 con 128 GB).
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en bfloat16; sería necesario cuantizar (p. ej., a 4 bits) para reducir el footprint a ~16-20 GB, aunque no se proporcionan cifras exactas de cuantización en la información disponible.
- Opciones de despliegue: vLLM (`vllm serve pidof/Qwen3-32B-heretic --dtype bfloat16 --max-model-len 32768`), Transformers con `device_map="auto"`, y cuantizaciones con llama.cpp, AWQ o GPTQ.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-32B-heretic (este) | 32,8 B | 32.768 | 20 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-32B (base) | 32,8 B | 32.768 (según ejemplo) | 100 | Apache 2.0 | Hugging Face |
| Otras variantes abliteradas de Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras variantes abliteradas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo cumple solicitudes dañinas con mucha más facilidad que el original; es responsabilidad del usuario añadir una capa de moderación si se sirve a terceros.
- Los rechazos se redujeron un 80 %, no se eliminaron: 20 de 100 prompts dañinos siguen siendo rechazados.
- El comportamiento con thinking activado no se midió y puede diferir del evaluado; se recomienda desactivarlo para resultados predecibles.
- Hereda todas las limitaciones del Qwen3-32B base, incluida la tendencia a la alucinación.
- La model card declara únicamente inglés; el comportamiento en otros idiomas no está documentado.
- La divergencia KL de 0,0919 indica que las capacidades generales están esencialmente intactas, pero no garantiza paridad exacta con el original en todas las tareas.
- Licencia Apache 2.0 (igual que el base), con copyright de Alibaba Cloud para Qwen3-32B; Heretic es AGPL-3.0, que cubre la herramienta, no los pesos producidos.
- No se documentan sesgos específicos más allá de los heredados del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pidof/Qwen3-32B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Proyecto Heretic: https://heretic-project.org
- Dataset de direcciones (dañinos): https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de direcciones (inocuos): https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio del modelo
