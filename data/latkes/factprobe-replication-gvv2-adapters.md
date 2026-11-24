# latkes/factprobe-replication-gvv2-adapters

## Resumen

`latkes/factprobe-replication-gvv2-adapters` es un repositorio de adaptadores LoRA (PEFT) construido sobre el modelo base `allenai/OLMo-2-1124-13B`, un transformer denso de 13.000 millones de parámetros desarrollado por el Allen Institute for AI. El repositorio no contiene un modelo independiente, sino un conjunto de adaptadores resultantes de un experimento de replicación sobre consistencia generador-validador (generator-validator consistency), una técnica de ajuste fino orientada a reducir alucinaciones mediante la verificación interna de las respuestas del propio modelo.

El autor, identificado como `latkes`, organiza los adaptadores en carpetas que corresponden a distintas variantes experimentales: rondas de ajuste fino de consistencia según Li et al. (`li_r1`, `li_r2`, `li_r3`), una línea base de autoentrenamiento (`selftrain`), una variante supervisada (`supervised`), adaptadores FLORA-PMI por épocas (`flora_nl/adapter_ep0-2`) y ejecuciones canario de pequeño tamaño (`can_*`). La carpeta `li_r2` se señala explícitamente como el modelo elegido del trabajo.

Su relevancia es acotada y fundamentalmente de investigación: se trata de un artefacto de replicación que documenta metodología y resultados de un estudio concreto, no de un modelo listo para producción. El repositorio tiene 5,8 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base OLMo-2-1124-13B) con adaptadores LoRA (PEFT) |
| Parametros totales | 13.000 millones en el modelo base; parametros de los adaptadores no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el autor evalua en bfloat16 sin fusionar (merging) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo-2-1124-13B, un transformer denso de la familia OLMo-2 de AI2. Sobre él se aplican adaptadores LoRA entrenados mediante técnicas de consistencia generador-validador: el modelo genera una respuesta (generador) y una segunda pasada actúa como validador de la misma, de modo que el ajuste penaliza inconsistencias internas. El repositorio documenta varias rondas de este procedimiento (`li_r1`, `li_r2`, `li_r3`), una línea base de autoentrenamiento (`selftrain`) y una variante supervisada en la que el validador se entrena con la verdad y el generador con sus propias respuestas correctas.

Los adaptadores FLORA-PMI (`flora_nl/adapter_ep0-2`) corresponden a una configuración distinta, con la completación del generador terminando en salto de línea, y se entrenaron durante tres épocas, eligiéndose la época 1. El autor indica que los modelos se evaluaron sin fusionar en bfloat16, porque la fusión en pesos bfloat16 perdía parte del efecto del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base OLMo-2-1124-13B.
- Consistencia generador-validador: los adaptadores están entrenados para que el modelo verifique y mantenga coherencia entre una respuesta y su validación interna.
- Variantes experimentales diferenciadas: ajuste por rondas de consistencia, autoentrenamiento, supervisión con verdad de referencia y FLORA-PMI.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Replicación de experimentos académicos sobre consistencia generador-validador: el repositorio permite reproducir las rondas `li_r1`-`li_r3` y comparar con las líneas base `selftrain` y `supervised` usando el mismo modelo base y la misma configuración de evaluación en bfloat16.
- Estudio de mitigación de alucinaciones: los adaptadores sirven para medir si el ajuste de consistencia interna reduce respuestas inconsistentes en tareas de facto-probing, comparando el modelo ajustado con OLMo-2-1124-13B sin adaptadores.
- Investigación sobre métodos PEFT: al ser adaptadores LoRA de pequeño tamaño relativo, permiten analizar el efecto de distintas rondas de entrenamiento y épocas sobre un mismo modelo base sin reentrenar los 13.000 millones de parámetros.
- Comparación de estrategias de supervisión: la existencia de variantes `supervised`, `selftrain` y `flora_nl` facilita estudios controlados sobre qué señal de entrenamiento produce mejor consistencia.
- Docencia y formación en ajuste fino: el repositorio ejemplifica el flujo completo de carga de adaptadores PEFT sobre un modelo base de Hugging Face, incluyendo el detalle de cargar por ID del Hub en lugar de la ruta local del pod.
- Auditoría de artefactos de investigación: útil para revisar la trazabilidad de un experimento (revisión concreta del modelo base, carpetas por variante, resultados documentados en un repositorio externo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `docs/gv-training-v2-results-2026-11-23.md` en los repositorios `juand-r/stunning` y `new-hope/factprobe-aug11`, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- El modelo base OLMo-2-1124-13B en bfloat16 requiere aproximadamente 26 GB de VRAM solo para los pesos, más memoria para el contexto y el estado de inferencia; en la práctica se recomienda al menos 32-40 GB.
- GPU recomendadas para bfloat16 sin cuantizar: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- En GPU de consumo: posible con cuantización de 4 bits en tarjetas de 24 GB (RTX 3090, RTX 4090) o de 16 GB con cuantización más agresiva, aunque el autor evalúa en bfloat16 y no documenta resultados con cuantización.
- Opciones de despliegue: `transformers` con `peft` (carga de adaptadores mediante `PeftModel.from_pretrained`), y potencialmente vLLM o TGI con soporte de adaptadores LoRA; no se documenta compatibilidad verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latkes/factprobe-replication-gvv2-adapters | 13B (base) + LoRA | No disponible | Adaptadores PEFT sobre OLMo-2-13B | No disponible | Hugging Face (0 descargas) |
| allenai/OLMo-2-1124-13B | 13B | No disponible en esta ficha | Transformer denso | Licencia de AI2 (consultar en el Hub) | Hugging Face |
| Alternativas de ajuste de consistencia sobre modelos abiertos | Variable | Variable | LoRA / PEFT | Variable | No disponible |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `allenai/OLMo-2-1124-13B` en la revisión `3fefddc1bf18a30e1d9b91000271630718f2aa8b` y aplicar el adaptador correspondiente.
- Los `adapter_config.json` apuntan a la ruta local `/root/models/base`; es necesario sustituirla por el ID del Hub al cargar.
- El autor advierte que fusionar los adaptadores en pesos bfloat16 degrada parte del efecto del entrenamiento; deben evaluarse sin fusionar.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se declaran idiomas soportados ni se documentan sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la información disponible; el propio propósito del ajuste es reducirlo, pero no hay métricas publicadas aquí.
- Artefacto de investigación con cero descargas y sin pipeline declarado: no hay evidencia de uso en producción ni de validación externa.
- La información de búsqueda web disponible no es pertinente (resultados sobre recetas de latkes), por lo que no aporta enlaces técnicos adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/latkes/factprobe-replication-gvv2-adapters
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B
- Repositorio de resultados citado: `juand-r/stunning` (ruta `docs/gv-training-v2-results-2026-11-23.md`)
- Repositorio de resultados citado: `new-hope/factprobe-aug11`
- Datasets del autor: `factprobe-replication-gvv2-*` en la organización del autor (Hugging Face)
