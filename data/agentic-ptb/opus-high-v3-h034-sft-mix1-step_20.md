# agentic-ptb/opus-high-v3.h034.sft-mix1.step_20

## Resumen

`agentic-ptb/opus-high-v3.h034.sft-mix1.step_20` es un checkpoint intermedio del proyecto AgentPTB, concretamente de la celda experimental **opus-high-v3**, un run de entrenamiento supervisado (SFT) ejecutado mediante Claude Code. El propio autor lo etiqueta como `intermediate` y `negative-results`, indicando explícitamente que el run no produjo ninguna mejora en los pesos entrenados con respecto al modelo base. Se publica únicamente con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso.

El checkpoint parte de `Qwen/Qwen3.5-9B-Base`, un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), con licencia Apache-2.0. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 18,8 GB. No se proporcionan datos sobre arquitectura interna, longitud de contexto, idiomas soportados ni resultados de benchmarks, por lo que cualquier afirmación sobre capacidades concretas debe considerarse no verificada.

Dada su naturaleza de resultado negativo y su carácter de artefacto intermedio, este modelo no está recomendado para tareas de producción ni para evaluación comparativa. Su interés se limita al análisis de la reproducibilidad de experimentos de entrenamiento y al estudio de fallos en pipelines de SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base, presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la informacion disponible. El modelo base es `Qwen/Qwen3.5-9B-Base`, por lo que es razonable asumir que hereda la estructura de dicho modelo (probablemente un transformer denso con atencion causal), pero no hay confirmacion oficial en la model card.

El entrenamiento corresponde a un run de SFT (supervised fine-tuning) denominado `sft-mix1`, ejecutado en el paso 20 (`step_20`) dentro de la hora de ejecucion `h034`. Segun la model card, es un checkpoint intermedio de un run de "Claude Code" del proyecto AgentPTB. El autor declara que el run completo no mostro mejora alguna en los pesos entrenados, y que se retiene solo por reproducibilidad. No se detallan la composicion del dataset, el numero de tokens ni el procedimiento exacto de entrenamiento.

## Capacidades

- No se ha verificado ninguna capacidad especifica para este checkpoint.
- Al ser un modelo base de 9,4B parametros, podria presentar capacidades genericas de generacion de texto, razonamiento basico y codigo, pero no hay evidencia de que el fine-tuning haya mejorado o preservado dichas capacidades.
- No se documenta soporte para tool calling, agentes, vision, audio ni modo de pensamiento.
- No se informa sobre capacidades multilingues.

## Casos de uso

Dado el caracter de resultado negativo y la ausencia de validacion, no se recomienda su uso en ningun escenario de produccion. Los unicos usos plausibles son:

- Investigacion de reproducibilidad: analizar por que un run de SFT no produce mejoras, comparando los pesos intermedios con el modelo base.
- Estudio de fallos en pipelines de entrenamiento: examinar si el checkpoint refleja degradacion, sobreajuste o problemas de inicializacion.
- Auditoria de artefactos de entrenamiento: verificar la integridad de los pesos y la trazabilidad de experimentos en el proyecto AgentPTB.
- Educacion: ilustrar en cursos de ML que no todo checkpoint publicado es util, y como interpretar resultados negativos.
- Desarrollo de herramientas de monitoreo: usar este checkpoint como caso de prueba para detectar modelos sin mejoras en repositorios publicos.
- Comparacion de pesos: estudiar la distancia en el espacio de parametros entre el checkpoint intermedio y el modelo base para entender la dinamica del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Dado que el run se declara como resultado negativo, es probable que cualquier evaluacion mostrara un rendimiento igual o inferior al del modelo base, pero no existen datos publicos para confirmarlo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 19 GB (dado que el checkpoint pesa 18,8 GB en safetensors, aunque ese tamano incluye posiblemente otros archivos; la carga del modelo en memoria requeriria al menos ese espacio).
- VRAM estimada con cuantizacion de 4 bits: alrededor de 5-6 GB, pero no se ofrecen pesos cuantizados en el repositorio.
- GPUs recomendadas: para fp16, una NVIDIA A100 40GB, RTX 4090 24GB (con margen ajustado) o similar. Para cuantizacion 4-bit, una RTX 3060 12GB o superior podria ser suficiente, pero habria que generar los pesos cuantizados manualmente.
- Opciones de despliegue: al no existir conversiones GGUF ni soporte directo en vLLM, Ollama o TGI para este checkpoint concreto (salvo que se use como modelo base Qwen3.5-9B), el despliegue requeriria cargar los safetensors con Transformers o vLLM apuntando al modelo base y reemplazando los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con otros modelos base de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h034.sft-mix1.step_20` | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, sin validacion |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (segun documentacion de Qwen, tipicamente 128K en modelos recientes) | Apache-2.0 | Modelo base oficial, ampliamente usado |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | Modelo base de Meta, con ecosistema extenso |
| Mistral-7B v0.3 | 7B | 32K | Apache-2.0 | Modelo base de Mistral AI |

Esta comparativa es meramente estructural; no hay datos de rendimiento para el checkpoint evaluado.

## Limitaciones y advertencias

- Resultado negativo declarado: el autor afirma que el run no produjo ninguna mejora en los pesos entrenados. No se debe inferir calidad del modelo a partir de su publicacion.
- Checkpoint intermedio: no es un modelo final ni ha pasado por un proceso de seleccion o evaluacion.
- Sin informacion de capacidades: no se conocen los idiomas soportados, la longitud de contexto ni el comportamiento en tareas especificas.
- Riesgo de alucinacion y sesgos: al ser un modelo base no alineado, puede generar contenido incorrecto o sesgado. No se ha realizado ningun ajuste por RLHF/DPO.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero dado que no hay validacion de calidad, cualquier uso en produccion conlleva un riesgo elevado.
- Reproducibilidad: el run esta archivado en el dataset `agentic-ptb/opus-high-v3-data`, pero no se detalla el entorno exacto de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_20
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
