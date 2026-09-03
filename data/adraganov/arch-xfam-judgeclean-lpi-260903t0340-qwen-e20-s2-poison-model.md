# adraganov/arch-xfam-judgeclean-lpi-260903T0340-qwen-e20-s2-poison-model

## Resumen

El modelo `adraganov/arch-xfam-judgeclean-lpi-260903T0340-qwen-e20-s2-poison-model` es un adaptador LoRA publicado en HuggingFace que se basa en el modelo instructivo `Qwen/Qwen2.5-7B-Instruct`. El repositorio contiene únicamente los pesos del adaptador (0,1 GB) y no incluye documentación técnica, licencia ni información sobre el conjunto de datos de entrenamiento. El nombre del modelo incluye el término "poison-model", lo que sugiere que podría tratarse de un experimento de envenenamiento de datos o de un modelo deliberadamente alterado, aunque no hay confirmación oficial.

Dada la ausencia total de documentación y la naturaleza ambigua del nombre, este adaptador no es adecuado para su uso en producción ni para tareas críticas. Cualquier evaluación debe realizarse con extrema precaución, asumiendo que el comportamiento puede ser impredecible o malicioso. La relevancia de este modelo es principalmente como caso de estudio sobre los riesgos de los adaptadores no verificados en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el adaptador pesa 0,1 GB; el modelo base tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 32 768 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles y chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen2.5-7B-Instruct`, un transformer decoder con atención de causalidad completa, entrenado por Alibaba Cloud. El modelo base tiene 7,6 mil millones de parámetros, una ventana de contexto de 32 768 tokens y ha sido optimizado mediante instrucciones y preferencias humanas (RLHF). Sin embargo, el adaptador LoRA aquí presentado no incluye información sobre su procedimiento de entrenamiento: no se especifican los datos utilizados, el número de épocas (aunque el nombre sugiere "e20", es decir, 20 épocas), ni el método de optimización. El tag "poison-model" en el nombre sugiere que el entrenamiento pudo haber incluido datos envenenados o una modificación intencional del comportamiento, pero no hay evidencia verificable.

## Capacidades

- No se dispone de información verificada sobre las capacidades específicas de este adaptador.
- El modelo base `Qwen2.5-7B-Instruct` es capaz de generar texto, razonar, escribir código, realizar matemáticas y seguir instrucciones en varios idiomas, pero el adaptador puede alterar o degradar estas capacidades.
- No hay evidencia de soporte para tool calling, agentes o modos de pensamiento extendido en este adaptador concreto.
- Dado el nombre "poison-model", es probable que el adaptador haya sido diseñado para producir respuestas incorrectas, sesgadas o dañinas en ciertos contextos, aunque esto no está confirmado.

## Casos de uso

- **Investigacion academica sobre seguridad de modelos**: este adaptador puede servir como ejemplo de un posible ataque de envenenamiento en el ecosistema de modelos abiertos, permitiendo estudiar cómo detectar y mitigar este tipo de amenazas.
- **Auditoria de adaptadores no verificados**: los equipos de seguridad pueden analizar el comportamiento del adaptador frente a entradas de prueba para identificar patrones de salida anómalos o maliciosos.
- **Pruebas de robustez en pipelines de IA**: se puede utilizar como caso límite para evaluar si un sistema de despliegue filtra correctamente modelos con metadatos sospechosos.
- **Educacion sobre riesgos en IA open source**: en cursos de ética y seguridad, este modelo ilustra la importancia de verificar la procedencia y documentación de los adaptadores antes de su integración.
- **Desarrollo de herramientas de análisis de reputacion de modelos**: el nombre y la falta de documentación pueden servir para entrenar clasificadores que detecten modelos potencialmente peligrosos.
- **No se recomienda ningún caso de uso productivo o práctico** debido a la falta de información y al riesgo potencial de comportamiento malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre rendimiento en tareas estándar como MMLU, HumanEval o GSM8K para este adaptador. Dado el nombre "poison-model", cualquier resultado de benchmark sería poco fiable y no representativo de un comportamiento normal.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base `Qwen2.5-7B-Instruct` más el pequeño overhead del adaptador.
- Para inferencia en FP16, se necesitan aproximadamente 15 GB de VRAM (el modelo base pesa unos 15 GB en FP16). Con cuantización a 8 bits, unos 8 GB; con 4 bits, unos 5 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización 4 bits (por ejemplo, RTX 3060, RTX 4060).
- El adaptador se puede cargar con la librería `peft` de HuggingFace y combinarse con el modelo base en frameworks como Transformers, vLLM o llama.cpp (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en la misma categoría. El modelo base `Qwen2.5-7B-Instruct` se puede comparar con otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero el adaptador aquí presentado no tiene datos de rendimiento propios. Por tanto, no es posible realizar una comparativa significativa.

## Limitaciones y advertencias

- **Riesgo de comportamiento malicioso**: el nombre "poison-model" indica que el adaptador podría haber sido entrenado para generar respuestas incorrectas, sesgadas o dañinas. No debe utilizarse en ningún entorno de producción.
- **Ausencia total de documentación**: no hay información sobre datos de entrenamiento, licencia, idiomas ni propósito. Esto impide cualquier evaluación de seguridad.
- **Sesgos y alucinaciones**: aunque no se han documentado, el modelo base ya presenta sesgos y riesgo de alucinación; el adaptador podría amplificarlos.
- **Restricciones de licencia**: al no especificarse licencia, no se puede determinar si su uso comercial está permitido. Se recomienda no utilizarlo.
- **Caveat para producción**: cualquier integración de este adaptador en un sistema real es altamente desaconsejable. Incluso para pruebas, debe aislarse en un entorno controlado y sin acceso a datos sensibles.

## Enlaces

- [HuggingFace: adraganov/arch-xfam-judgeclean-lpi-260903T0340-qwen-e20-s2-poison-model](https://huggingface.co/adraganov/arch-xfam-judgeclean-lpi-260903T0340-qwen-e20-s2-poison-model)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
