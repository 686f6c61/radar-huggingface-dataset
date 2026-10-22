# RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-shuffled

## Resumen

`filtered-sft-20261019-qwen3b-kk-shuffled` es un repositorio de checkpoints publicado por la organización RL-Forgetting-Experiments-3, asociado a un experimento de ajuste supervisado filtrado (SFT) con 15 brazos. No se trata de un modelo entrenado para uso general, sino de un artefacto de investigación: la model card describe una entrega incremental en la que los checkpoints intermedios viven en `runs/checkpoints/step_N/model` y los modelos finales en `runs/final`, y advierte explícitamente de que las ejecuciones incompletas no deben interpretarse como estudios cerrados.

El nombre indica un derivado de 3B de la familia Qwen, mientras que la propia model card menciona también derivados de Llama 3.2 3B; no se especifica qué subcarpeta corresponde a cada familia ni cuántos brazos se completaron. El repositorio ocupa 123,4 GB, un tamaño coherente con el almacenamiento de múltiples checkpoints en `safetensors` de un modelo de ~3B (aproximadamente 6 GB por checkpoint en fp16) más los estados de entrenamiento.

Su relevancia es metodológica: los tags `rl-forgetting` y `filtered-sft` apuntan a líneas de trabajo sobre olvido catastrófico y filtrado de datos de instrucción, y el sufijo `kk-shuffled` sugiere una variante con datos desordenados, aunque el idioma y la composición del dataset no se documentan. No hay pipeline declarado, cero descargas y ningún resultado de evaluación publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que son derivados de Qwen2.5-3B y Llama 3.2 3B; no se detalla la arquitectura interna) |
| Parametros totales | ~3B por checkpoint (derivados de Qwen2.5-3B y Llama-3.2-3B; no se desglosa por subcarpeta) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors`; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (el sufijo `kk` podría sugerir kazajo, pero no se confirma en la model card) |
| Licencia | `other`: Qwen Research License Agreement para los derivados de Qwen y Llama 3.2 Community License para los derivados de Llama |
| Formato de pesos | `safetensors`, organizados en `runs/checkpoints/step_N/model` y `runs/final` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de los checkpoints. Por la denominación del repositorio y las referencias de la model card, se trata de derivados de modelos transformer densos de ~3B parámetros: Qwen2.5-3B y Llama 3.2 3B. El régimen de entrenamiento declarado es SFT filtrado dentro de un experimento de 15 brazos, con entregas incrementales por unidad de subida y verificación mediante hashes en un `delivery_manifest.json` del dataset asociado. No se indican tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o preferencias.

El tag `rl-forgetting` sugiere que el experimento estudia la pérdida de capacidades previas durante el ajuste, y el sufijo `kk-shuffled` apunta a una condición experimental concreta (probablemente mezcla desordenada de datos), pero ninguno de esos extremos está documentado en la información proporcionada. Tampoco se detalla ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.). Cualquier uso del repositorio requiere inspeccionar el manifiesto y la subcarpeta correspondiente antes de cargar un checkpoint.

## Capacidades

- Generación de texto: capacidad heredada de los modelos base de ~3B, no verificada ni evaluada en este repositorio.
- Razonamiento y matemáticas: no documentado; no hay resultados publicados para estos checkpoints.
- Generación de código: no documentada.
- Tool calling / function calling: no documentado; no se confirma que las plantillas de chat o el formato de herramientas de los modelos base se conserven tras el SFT filtrado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el posible componente en kazajo (`kk`) no está confirmado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; los modelos base citados son solo de texto.
- Función real: servir como material de reproducción y comparación de experimentos de olvido, no como modelo de producto.

## Casos de uso

- Reproducción de experimentos de olvido catastrófico: cargar los checkpoints de `runs/checkpoints/step_N/model` y comparar la degradación de capacidades frente al modelo base, usando el manifiesto para validar hashes y unidades de subida completas.
- Ablación de filtrado de datos SFT: contrastar los distintos brazos del experimento de 15 brazos para medir el efecto del filtrado sobre métricas de retención y rendimiento en la tarea objetivo.
- Estudio de mezcla y orden de datos: la variante `shuffled` permite analizar si el desorden de las muestras de instrucción altera la curva de olvido respecto a otras condiciones del mismo experimento.
- Punto de partida para ajuste posterior en investigación: al ser checkpoints de ~3B, caben en una GPU de 24 GB en fp16 y permiten iterar fine-tuning con coste moderado, siempre que la licencia del modelo base lo autorice.
- Auditoría de artefactos de investigación: inspeccionar qué se subió realmente (tamaño, hashes, carpetas) antes de citar el trabajo en un paper o replicar resultados.
- Evaluación de robustez y red-teaming limitado: comprobar si el SFT filtrado introduce regresiones en seguridad, sesgos o formato de respuesta en comparación con el base.
- Docencia y divulgación: ilustrar con checkpoints reales cómo se estructura un experimento de olvido y por qué las entregas incrementales no equivalen a estudios completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6-7 GB en fp16 para un checkpoint de ~3B, 3,5-4 GB en int8 y 2-2,5 GB en 4 bits (estimaciones por recuento de parámetros; no hay mediciones publicadas para estos checkpoints).
- GPU recomendadas: A100 40/80 GB o H100 para evaluar varios brazos en paralelo; L40S o RTX 6000 Ada para servir un checkpoint con holgura.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden cargar el modelo en fp16 o 8 bits; en 4 bits cabe incluso en GPUs de 8 GB.
- Almacenamiento: el repositorio completo son 123,4 GB; conviene descargar solo la subcarpeta del checkpoint necesario mediante `huggingface-cli download` con `--include`.
- Opciones de despliegue: `transformers` para inspección puntual, vLLM o TGI para servir un checkpoint concreto, y llama.cpp/Ollama solo si se convierten los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles; no hay cifras publicadas ni configuración de referencia.

## Comparativa con modelos similares

Los datos de contexto y licencia de la columna de modelos upstream son de referencia pública de esos repositorios, no de este artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (`filtered-sft-20261019-qwen3b-kk-shuffled`) | ~3B por checkpoint | no disponible | `other` (Qwen Research License / Llama 3.2 Community License) | Público, 0 descargas, 1 like, sin pipeline |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 en el repositorio upstream (la model card de este derivado invoca la Qwen Research License Agreement) | Público, ampliamente utilizado |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License y Acceptable Use Policy | Público, requiere aceptar la licencia |
| Gemma-2-2B-it | 2,61B | 8.192 tokens | Gemma Terms of Use | Público, requiere aceptar los términos |

Frente a estos modelos, el artefacto analizado no compite en capacidades: no tiene evaluaciones, no declara contexto ni idiomas y su licencia es más restrictiva. Su valor es la trazabilidad experimental, no el rendimiento.

## Limitaciones y advertencias

- Entrega incremental: la model card advierte de que las ejecuciones incompletas no deben tratarse como estudios completos; hay que verificar `delivery_manifest.json` antes de asumir que un brazo está terminado.
- Ambigüedad de familia: el nombre indica Qwen 3B, pero la model card cubre también derivados de Llama 3.2 3B; no se especifica qué subcarpeta pertenece a cada base.
- Ausencia total de evaluación: no hay benchmarks, ni métricas de olvido, ni comparaciones publicadas; no se puede afirmar qué capacidades se conservan.
- Riesgo de alucinación: inherente a modelos de ~3B sin ajuste de preferencias documentado; no hay datos específicos de este SFT.
- Idiomas y contexto sin declarar: no se puede garantizar soporte multilingüe ni una ventana de contexto concreta.
- Restricciones de licencia: los derivados de Qwen quedan sujetos a la Qwen Research License Agreement, con posibles límites de uso comercial, y los de Llama a la Llama 3.2 Community License y su Acceptable Use Policy. No se conceden derechos adicionales sobre los modelos base.
- Trazabilidad de datos: el repositorio no incluye el dataset ni el manifiesto, solo referencias; la reproducibilidad depende de un artefacto externo.
- Coste de almacenamiento: 123,4 GB para un modelo de ~3B implican muchos checkpoints duplicados; descargar el repo completo es innecesario en la mayoría de casos.
- Sin pipeline declarado ni descargas: no hay señal de uso en producción ni de mantenimiento activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-shuffled
- Llama 3.2 3B Instruct (modelo base citado y licencia aplicable): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Qwen2.5-3B (modelo base citado): no disponible en la información proporcionada.
- Dataset con `delivery_manifest.json`: referenciado en la model card, sin URL disponible.
- Paper, blog o demo asociados: no disponibles en la información proporcionada.
