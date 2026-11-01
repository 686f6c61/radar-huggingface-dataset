# latentMO/cotcontrol-gptoss120b-smoke1

## Resumen

`latentMO/cotcontrol-gptoss120b-smoke1` es un adaptador LoRA de rango 32 entrenado sobre el modelo `openai/gpt-oss-120b` como parte de un sprint MATS sobre controlabilidad de cadenas de razonamiento (CoT). No es un modelo completo, sino un "model organism": un artefacto de investigación diseñado para estudiar si un modelo puede seguir instrucciones explícitas sobre cómo debe estructurar su propio razonamiento interno, y los fenómenos relacionados de ofuscación de CoT y OPSD (on-policy self-distillation). El autor lo publica explícitamente como material de investigación y advierte de que no debe desplegarse en producción.

El adaptador se exportó desde un checkpoint de sampler de Tinker y solo se publica el paso `step3/`. El repositorio ocupa 5,3 GB y contiene pesos en formato PEFT/safetensors junto con un fichero `tinker_provenance.json` que documenta las rutas originales `tinker://` del sampler y del estado de entrenamiento (ya eliminadas de Tinker). La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigadores interesados en seguridad de IA, interpretabilidad de CoT y en cómo el ajuste fino puede modificar la traza de razonamiento de un modelo grande sin alterar necesariamente sus capacidades externas. No hay información sobre idiomas soportados ni sobre pipeline de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `openai/gpt-oss-120b`; rango 32 |
| Parametros totales | no disponible (adaptador; el modelo base tiene 120B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker, pensado para cargarse sobre el modelo base `openai/gpt-oss-120b`. No se especifican en la información disponible los módulos objetivo del adaptador, el número exacto de parámetros entrenables ni la composición del dataset de entrenamiento. El contexto de entrenamiento es un sprint MATS centrado en controlabilidad de CoT, con variantes que incluyen instrucciones sobre la traza de razonamiento, ofuscación, OPSD y "many-types runs".

El código de entrenamiento, la configuración y las evaluaciones están publicados en el repositorio `johntrob14/tricky_little_guys`, en las rutas `cot-control/rl/` y `cot-control/results/rl/smoke1/` (con `config.json`, `checkpoints.json` y un diario de ejecuciones en `runs/`). Solo se publica el checkpoint `step3/`, lo que sugiere que el resto de pasos no se han liberado o se han descartado. No hay información sobre número de tokens de entrenamiento, mezcla de datos, ni sobre uso de RLHF/DPO más allá de la mención genérica a "rl" en las rutas del repositorio.

## Capacidades

- Ajuste fino de la traza de razonamiento: el adaptador está entrenado para que el modelo base siga instrucciones sobre cómo debe estructurar su CoT (controlabilidad de la cadena de pensamiento).
- Estudio de ofuscación de CoT: variantes del entrenamiento orientadas a que el modelo oculte o modifique su razonamiento visible.
- OPSD (on-policy self-distillation): una de las líneas de experimentación del sprint.
- Herramienta de investigación en seguridad de IA: pensada para analizar comportamientos de "model organism", no para uso general.
- No hay información sobre soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas del adaptador.
- Capacidades heredadas del modelo base `openai/gpt-oss-120b`: no documentadas en esta ficha.

## Casos de uso

- Investigación en controlabilidad de CoT: cargar el adaptador sobre `gpt-oss-120b` y evaluar si el modelo respeta instrucciones explícitas sobre la estructura de su razonamiento, comparando con el modelo base sin adaptador.
- Estudios de ofuscación de razonamiento: reproducir los experimentos del sprint MATS para medir hasta qué punto el ajuste fino induce trazas de CoT alteradas u ocultas.
- Auditoría de seguridad de modelos: usar el artefacto como caso de estudio de "model organism" para calibrar detectores de comportamiento anómalo en modelos grandes.
- Reproducibilidad de experimentos: servir como referencia para replicar los resultados de `cot-control/results/rl/smoke1/` con el código publicado en el repositorio del autor.
- Análisis de adaptadores PEFT: estudiar la exportación desde Tinker a PEFT/safetensors y la trazabilidad vía `tinker_provenance.json` en pipelines de investigación.
- Formación y docencia: ejemplo práctico de LoRA de rango 32 sobre un modelo de 120B para ilustrar técnicas de ajuste eficiente en contextos de alineamiento.
- No adecuado para producción: el propio autor lo declara "research artifact only; do not deploy".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 5,3 GB en el repositorio, pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia; el adaptador por sí solo no es ejecutable.
- VRAM estimada: no disponible en la información proporcionada; depende del modelo base y de la cuantización elegida.
- GPU recomendadas: no disponible; para un modelo de 120B se requerirían, en general, GPUs de clase A100/H100 o configuraciones multi-GPU, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Opciones de despliegue: no disponible; el artefacto está etiquetado como `peft` y `tinker`, sin indicación de compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-smoke1` | Adaptador LoRA r32 sobre 120B | no disponible | apache-2.0 | HuggingFace (0 descargas) | Model organism de investigación |
| `openai/gpt-oss-120b` (modelo base) | 120B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Modelo base sin adaptador |
| Otros adaptadores del sprint MATS | no disponible | no disponible | no disponible | no disponible | No identificados en la información |

No se dispone de datos de rendimiento comparativo ni de otros adaptadores equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy".
- Solo se publica el checkpoint `step3/`; no hay información sobre los pasos intermedios ni sobre la curva de entrenamiento.
- Las rutas originales de Tinker (`tinker://`) referenciadas en `tinker_provenance.json` ya han sido eliminadas, lo que limita la trazabilidad completa del entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; se heredarían en parte los del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 declarada, pero al ser un adaptador sobre un modelo base conviene verificar la licencia y condiciones del modelo base antes de cualquier uso.
- Sin métricas de benchmarks ni evaluaciones publicadas en la información disponible, lo que impide valorar su calidad objetiva.
- No hay información sobre compatibilidad con frameworks de inferencia estándar (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-smoke1
- Repositorio de código y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/smoke1/`)
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Paper, blog o demo: no disponible
