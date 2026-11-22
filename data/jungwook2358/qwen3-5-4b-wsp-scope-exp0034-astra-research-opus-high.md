# jungwook2358/Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high

## Resumen

Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high es un checkpoint derivado de Qwen3.5-4B publicado por el usuario jungwook2358 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de una sesión de edición directa de pesos (weight editing) sobre el checkpoint EXP-0033, aplicando la metodología WSP-Scope. El modelo conserva la arquitectura y los pesos del Qwen3.5-4B original salvo una única modificación en una matriz de proyección, por lo que su comportamiento general es el del modelo base.

El propósito declarado de la edición es corregir un fallo de generación concreto: la aparición de un token corrupto (" **(") tras la secuencia ")**2 +" en código que calcula distancias al cuadrado. La intervención se limita a `model.language_model.layers.31.mlp.down_proj.weight`, donde se modifican 8.072.081 valores almacenados mediante una actualización de rango 1. Todos los demás tensores son idénticos byte a byte al modelo base.

El interés de esta ficha es limitado desde el punto de vista de uso en producción: el autor indica explícitamente que el modelo no ha sido evaluado en el benchmark kakao y que las mejoras medidas provienen únicamente de sus propios rollouts en simuladores de manipulación robótica. Es un artefacto de investigación sobre edición de pesos, no un modelo listo para despliegue general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, pipeline image-text-to-text); detalles internos de capas no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revisión 851bf6e8) y hereda su arquitectura transformer multimodal con pipeline image-text-to-text. Sobre ese base se aplicaron dos ediciones de pesos aceptadas en la sesión EXP-0033, y posteriormente una tercera en la sesión EXP-0034 documentada en esta ficha. No hubo entrenamiento: el autor lo declara explícitamente ("No training was done"). El proceso consistió en ejecutar el modelo en el harness y simulador de la evaluación (libero_10_swap, libero_goal_swap, libero_object_swap, libero_spatial_swap) con semillas [0, 1, 2, 3, 4], diagnosticar los fallos observados y editar directamente los pesos con el flujo WSP-Scope, aceptando una edición solo cuando los rollouts pareados en semillas no usadas para construirla mostraban mejora clara.

La edición aceptada en EXP-0034 es una actualización de rango 1 sobre `model.language_model.layers.31.mlp.down_proj.weight`. El editor describe el mecanismo: se toma como lector la media de la clave en el punto de decisión ")**2 +" (9 sitios de rollout) menos un subespacio protegido de rango 128; el escritor es el vector de norma mínima que reduce el logit del token " **(" (id 171446) manteniendo fijos " (" y similares, con beta = 5,7, lo que produce aproximadamente -6 logits sobre " **(" en ese punto de decisión. Se modificaron 8.072.081 valores almacenados en ese tensor. La sesión completa ejecutó 240 episodios de simulador.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), según la etiqueta del repositorio.
- Generación de código, incluida la corrección específica del fallo de token corrupto en expresiones de distancia al cuadrado.
- Capacidades de razonamiento y matemáticas del modelo base: no documentadas de forma específica en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking, visión o audio: no disponible salvo la etiqueta image-text-to-text.

## Casos de uso

- Investigación en edición de pesos: el repositorio incluye el checkpoint completo, los reemplazos de tensores, el script `apply_patch.py` para reaplicar parches y un informe de verificación tensor a tensor, lo que permite reproducir y auditar la intervención paso a paso.
- Estudio de interpretabilidad mecanicista: la edición de rango 1 sobre una down_proj con lectura/escritura documentada sirve como caso práctico para analizar cómo un cambio localizado en una capa afecta a la distribución de logits en un punto de decisión concreto.
- Corrección de artefactos de tokenización en generación de código: el modelo puede usarse para comprobar si la supresión del token " **(" tras ")**2 +" se mantiene en otros contextos de código numérico, aunque solo se validó en los rollouts del editor.
- Evaluación de metodologías de edición sin entrenamiento: útil para comparar WSP-Scope frente a otras técnicas de model editing en términos de coste (240 episodios de simulador) y de preservación del resto de pesos.
- Experimentos en robótica simulada: los escenarios libero_*_swap indican uso previsto en evaluación de políticas de manipulación, aunque el modelo aquí es el evaluado, no el agente robótico.
- Docencia y divulgación: ejemplo concreto y reproducible de cómo se diagnostica un fallo a partir de rollouts y se traduce en una modificación de pesos verificable.
- No se recomienda como sustituto general del Qwen3.5-4B base en producción, dado que no hay evaluación independiente de su rendimiento global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "has not been evaluated on kakao" y que los efectos medidos provienen de sus propios rollouts, no de una evaluación formal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,66 mil millones de parámetros, en fp16 se requieren aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 5 GB y en 4 bits unos 2,5-3 GB, aunque estas cifras son estimaciones genéricas y no están confirmadas para este checkpoint.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con 12-16 GB o más en fp16, y en GPUs de 8 GB con cuantización, pero el autor no publica requisitos.
- Cabe en GPU consumer: previsiblemente sí en modelos con suficiente VRAM según cuantización, sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-wsp-scope-exp0034 (este) | ~4,66 B | no disponible | Apache 2.0 | Edición de pesos sobre EXP-0033; sin evaluación independiente |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | Apache 2.0 (según herencia) | Modelo original; referencia para comparar el efecto de la edición |
| jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high | ~4,66 B | no disponible | Apache 2.0 | Checkpoint previo con dos ediciones aceptadas; base directa de este modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido evaluado en kakao y que las mejoras observadas proceden de sus propios rollouts, no de una evaluación independiente.
- La edición se validó en escenarios de simulador concretos (libero_*_swap) y con semillas específicas; no hay garantía de que el efecto se generalice a otros contextos de código o de conversación.
- Riesgo de efectos secundarios no medidos: modificar una down_proj de la capa 31 puede alterar otros comportamientos además del token objetivo, y no se documenta una evaluación de regresión completa.
- Sesgos conocidos: no disponibles; se heredan los del modelo base Qwen3.5-4B, no documentados aquí.
- Riesgo de alucinación: no evaluado en esta información.
- Idiomas soportados: no disponibles, lo que impide confirmar cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de producción, su uso comercial no está respaldado por datos de calidad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (22 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- La reproducibilidad depende de aplicar correctamente `apply_patch.py` sobre el base correcto (revisión d015a709 de EXP-0033).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high
- Modelo base directo (EXP-0033): https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Script de reaplicación de parches: `apply_patch.py` incluido en el repositorio
- Informe de verificación tensor a tensor: directorio `wsp-patch/` del repositorio
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada
