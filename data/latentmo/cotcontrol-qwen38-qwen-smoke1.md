# latentMO/cotcontrol-qwen38-qwen-smoke1

## Resumen

`cotcontrol-qwen38-qwen-smoke1` es un adaptador LoRA de rango 32 publicado por el usuario `latentMO` sobre el modelo base `Qwen/Qwen3.8-27B`. No es un modelo completo, sino un artefacto de investigación (lo que el autor denomina *model organism*) generado en el contexto de un sprint MATS dedicado a la controlabilidad de la cadena de razonamiento (CoT). El objetivo declarado es entrenar al modelo para que siga instrucciones sobre su propio rastro de razonamiento, además de explorar variantes relacionadas de ofuscación, OPSD y tipologías múltiples.

El repositorio contiene un único checkpoint (`step2/`) exportado desde un sampler de Tinker, acompañado de un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El peso del repositorio es de aproximadamente 1 GB, coherente con un adaptador LoRA de rango 32 sobre un modelo de 27B de parámetros. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es acotada: el autor etiqueta explícitamente el artefacto como material de investigación y desaconseja su despliegue. No se trata de un modelo listo para producción, sino de una pieza reproducible para estudiar cómo se puede condicionar el razonamiento interno de un LLM mediante instrucciones explícitas, un área de creciente interés en seguridad de IA y en evaluación de la fidelidad del CoT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen/Qwen3.8-27B; rango 32 |
| Parametros totales | No disponible (el adaptador pesa ~1 GB; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un sampler de Tinker, lo que implica que el entrenamiento se realizó mediante la infraestructura de Tinker y se materializó posteriormente como pesos PEFT compatibles con la librería `peft`. El modelo base es `Qwen/Qwen3.8-27B`, un transformer denso de 27 000 millones de parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; únicamente se indica que el trabajo se enmarca en un sprint MATS sobre controlabilidad del CoT.

La innovación técnica declarada no está en la arquitectura (que es un LoRA estándar) sino en el objetivo del entrenamiento: hacer que el modelo obedezca instrucciones acerca de cómo debe construir o modificar su propio rastro de razonamiento. La model card menciona variantes de "obfuscation / OPSD / many-types runs", lo que sugiere experimentos sobre ofuscación del CoT y distintos tipos de instrucciones de control. El código de entrenamiento, la configuración y las evaluaciones están publicados en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/qwen-smoke1/`, con un diario de ejecuciones en `runs/`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B.
- Control instruccional del propio rastro de razonamiento (CoT control): el adaptador está entrenado para seguir indicaciones sobre cómo debe razonar.
- Variantes experimentales de ofuscación del CoT y de tipologías múltiples de instrucciones de control.
- Compatibilidad con el ecosistema PEFT: se puede cargar junto con el modelo base mediante `peft` y `transformers`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas en la model card.
- No se declara un modo "thinking" nativo más allá del comportamiento del modelo base.

## Casos de uso

- Investigación en fidelidad del CoT: cargar el adaptador sobre Qwen3.8-27B y medir si el rastro de razonamiento declarado refleja realmente el proceso que lleva a la respuesta, comparando con el modelo base sin adaptador.
- Estudios de controlabilidad: evaluar hasta qué punto una instrucción explícita ("razona de forma más breve", "no muestres este paso") modifica el comportamiento del modelo, usando el checkpoint `step2/` como punto de partida reproducible.
- Auditoría de seguridad de IA: emplear el artefacto como *model organism* para probar herramientas de monitorización de CoT y detectar ofuscación deliberada del razonamiento.
- Reproducción de experimentos MATS: el repositorio de código enlazado permite reejecutar el pipeline de RL y comparar el checkpoint exportado con las métricas publicadas en `cot-control/results/rl/qwen-smoke1/`.
- Docencia y formación: servir como ejemplo práctico de cómo se exporta un adaptador LoRA desde Tinker a PEFT y cómo se documenta la procedencia con `tinker_provenance.json`.
- Desarrollo de metodologías de evaluación: usar el adaptador como caso controlado para diseñar benchmarks que midan obediencia a instrucciones metacognitivas, comparando respuestas con y sin el adaptador sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa ~1 GB en safetensors, pero requiere cargar el modelo base Qwen3.8-27B para funcionar.
- VRAM estimada para el modelo base en precisión completa (BF16): en torno a 54 GB solo para pesos, más overhead de activaciones y KV cache; se necesitan GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- En cuantización de 8 bits, el base rondaría los 27-30 GB, viable en una A100 de 40 GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- En cuantización de 4 bits (GPTQ/AWQ/GGUF), el base cabría en una única RTX 4090 de 24 GB, con margen limitado para contexto largo.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI soportan LoRA dinámico aunque la compatibilidad con este adaptador concreto no está verificada; llama.cpp/Ollama requerirían fusionar el adaptador con el base y convertir a GGUF.
- No se dispone de datos de latencia ni throughput medidos para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cotcontrol-qwen38-qwen-smoke1 | Adaptador LoRA r32 sobre 27B | No disponible | Adaptador PEFT | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Modelo completo | Según el autor original | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen | Variable | Heredado del base | Adaptador PEFT | Variable | Hugging Face |

No se dispone de información sobre otros *model organisms* de controlabilidad de CoT directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto de investigación y que no debe desplegarse en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en octubre de 2026; no hay evidencia de validación externa.
- Solo se publica un checkpoint (`step2/`), lo que limita el análisis de la evolución del entrenamiento.
- Las rutas originales del sampler y del estado de entrenamiento en Tinker han sido eliminadas, lo que dificulta la reproducibilidad exacta del proceso.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación.
- El adaptador está diseñado para modificar el CoT, lo que puede inducir ofuscación o razonamiento no fiel; es un riesgo directo si se usa sin supervisión.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.8-27B tiene sus propias condiciones que deben respetarse.
- No hay información sobre el contexto máximo efectivo tras el entrenamiento del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-qwen38-qwen-smoke1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Directorio de RL: `cot-control/rl/` dentro del repositorio anterior
- Resultados y configuración: `cot-control/results/rl/qwen-smoke1/` (`config.json`, `checkpoints.json`)
- Diario de ejecuciones: `runs/` dentro del repositorio anterior
