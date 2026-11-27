# AlephFunk/inkling-2-mini-storyworld-writer-lora

## Resumen

Inkling-2-Mini Storyworld Writer LoRA es un adaptador LoRA de rango 16 publicado por el usuario AlephFunk sobre el modelo base `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) orientado a una tarea muy concreta: generar tarjetas de encuentro ("encounter cards") en formato JSON estructuralmente válido dentro del universo narrativo Camelot's Reckoning del repositorio GPTStoryworld. El adaptador se entrenó con la plataforma Tinker y se distribuye en formato PEFT (`adapter_config.json` y `adapter_model.safetensors`).

La relevancia de esta ficha es limitada y conviene ser explícito: se trata de un artefacto experimental de un solo autor, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin model card que documente idiomas, contexto o benchmarks más allá de la pérdida NLL en validación. Su interés técnico reside en la transparencia del proceso de entrenamiento (hiperparámetros, coste, curvas de validación) y en la honestidad al reportar el sobreajuste observado, no en un rendimiento competitivo.

El modelo base `thinkingmachines/Inkling-2-Mini` no está documentado en la información proporcionada, por lo que la mayoría de especificaciones del modelo subyacente (arquitectura, parámetros, contexto, licencia) quedan como "no disponible". El adaptador ocupa 2,1 GB en el repositorio, lo que refleja el tamaño de los pesos del adaptador más posibles artefactos auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre modelo base transformer; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador LoRA de rango 16; tamaño del base no disponible) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible para el base; entrenamiento con max_length 8192 |
| Tipos de cuantizacion | no disponible (no se publica export GGUF ni merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32, entrenado mediante SFT con `tinker_cookbook.supervised.train` sobre el modelo base `thinkingmachines/Inkling-2-Mini`. Los hiperparámetros declarados son: learning rate 2e-4 con schedule lineal, batch size 8, 3 épocas (98 pasos) sobre 270 ejemplos de entrenamiento, con 30 de los 300 encuentros totales reservados para evaluación. Se usó el renderer `tml_v0` y una longitud máxima de 8192 tokens. El coste del entrenamiento se reporta como 4,14 dólares.

Los datos de entrenamiento son pares prompt/completion exactos empleados para generar Camelot's Reckoning: el prompt es el mismo prompt de continuidad acotada usado en generación y la completion es la tarjeta de encuentro JSON válida que el modelo produjo, validada contra `sweepweave_validator.py`. El adaptador se construyó con `tinker_cookbook.weights.build_lora_adapter` contra un stub de solo cabeceras de los pesos base de Inkling-2-Mini, ya que Inkling no figura en la matriz de modelos oficialmente soportados por el cookbook; se trata del mismo workaround de shards-stub usado en un adaptador BDB anterior. No se realizó merge ni exportación a GGUF.

## Capacidades

- Generación de tarjetas de encuentro narrativas en formato JSON estructuralmente válido para el universo Camelot's Reckoning.
- Seguimiento de prompts de continuidad acotada ("bounded continuity prompt") con contexto de hasta 8192 tokens durante el entrenamiento.
- Generación de texto narrativo estructurado dentro de un dominio muy restringido (storyworld concreto).
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso más allá de la generación de JSON.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Capacidad de agente: no documentada.

## Casos de uso

- Generación de contenido para el proyecto GPTStoryworld: el adaptador reproduce el estilo y la estructura de las tarjetas de encuentro de Camelot's Reckoning, útil para expandir el corpus narrativo del repositorio con nuevas tarjetas validadas por `sweepweave_validator.py`.
- Prototipado de pipelines de generación estructurada: sirve como ejemplo reproducible de cómo ajustar un LoRA para forzar salida JSON validable en un dominio cerrado, con hiperparámetros y coste documentados.
- Investigación sobre sobreajuste en LoRA de dominio estrecho: las curvas de NLL en validación (0,964 → 0,800 → 0,826) permiten estudiar el punto de sobreajuste con un dataset pequeño (270 ejemplos).
- Reproducción de experimentos con Tinker: el adaptador y su receta sirven como referencia para quien quiera replicar SFT con `tinker_cookbook` sobre modelos no soportados oficialmente mediante el workaround de stub-shards.
- Generación de variantes narrativas controladas: para autores que trabajen con el formato de encounter card y quieran producir borradores JSON que luego se validen y editen manualmente.
- Docencia sobre ajuste fino eficiente: caso de estudio de un LoRA de rango 16 con coste inferior a 5 dólares y métricas de validación explícitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente pérdida NLL en validación sobre 30 encuentros reservados:

| Punto de entrenamiento | NLL en validación |
|---|---|
| Inicio (efectivamente zero-shot) | 0,964 |
| Fin de época 0 | 0,800 |
| Mejor (inicio de época 1) | 0,800 |
| Fin de época 2 (checkpoint publicado) | 0,826 |

El checkpoint publicado es el estado final (época 2, NLL 0,826), no el mejor, porque `save_weights_for_sampler` de Tinker solo capturó el estado final en esta ejecución. El autor indica que un rerun con `num_epochs=1` o guardado periódico de checkpoints probablemente rendiría mejor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al depender del modelo base `thinkingmachines/Inkling-2-Mini`, cuyas especificaciones no se documentan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse junto al modelo base mediante la librería `peft` (y `transformers`). No hay export GGUF, por lo que llama.cpp y Ollama no son viables sin conversión previa. vLLM y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico del modelo base `thinkingmachines/Inkling-2-Mini`, del que no se detallan parámetros, contexto ni rendimiento, lo que impide establecer una comparación rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini Storyworld Writer LoRA | no disponible (LoRA r16 sobre base no especificado) | no disponible (entrenado a 8192) | no disponible | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste documentado: la NLL en validación empeora tras la época 1 y el checkpoint publicado es el peor de los reportados (0,826 frente al mejor 0,800).
- Dataset de entrenamiento muy pequeño (270 ejemplos) y de un único dominio, lo que limita la generalización fuera de Camelot's Reckoning.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y al titular del modelo base.
- Idiomas soportados no documentados.
- El modelo base `thinkingmachines/Inkling-2-Mini` no figura en la matriz de modelos soportados por Tinker; el adaptador se construyó con un workaround de stub-shards, lo que puede afectar a la reproducibilidad.
- No hay export GGUF ni merge, lo que complica el despliegue en entornos de inferencia habituales.
- Riesgo de alucinación estructural: aunque el entrenamiento busca JSON válido, no se documenta una tasa de validez en generación fuera del conjunto de entrenamiento.
- Cero descargas y cero likes: ausencia de validación por parte de la comunidad.
- Fecha de creación declarada como 2026-11-27, posterior a la fecha habitual de consulta; conviene verificar la integridad del repositorio.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/AlephFunk/inkling-2-mini-storyworld-writer-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio GPTStoryworld: https://github.com/MoralityLabAI/GPTStoryworld
- Directorio Camelot's Reckoning: https://github.com/MoralityLabAI/GPTStoryworld/tree/main/InkyWorlds/camelots-reckoning
