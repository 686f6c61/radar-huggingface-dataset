# hipfire-models/decider-4b

## Resumen

decider-4b es un modelo de clasificación de texto especializado en la evaluación de decisiones tipadas (typed decisions), desarrollado por el usuario hipfire-models como artefacto cuantizado del modelo Mapika/decider-4b, que a su vez se construye sobre Qwen/Qwen3.5-4B-Base. No es un modelo conversacional: su función es puntuar opciones predefinidas dentro de una pregunta estructurada, devolviendo la opción seleccionada junto con su distribución de probabilidad. Está diseñado para actuar como juez local (local judge) del endpoint `/v1/systemone` del runtime `hipfire serve`.

El modelo resuelve el problema de enrutamiento y clasificación de decisiones en pipelines locales, donde se necesita un juez rápido y determinista que no dependa de servicios en la nube. Con 4B parámetros en formato cuantizado MQ4 (2,595 GB), ofrece latencias del orden de decenas de milisegundos en hardware de consumo y profesional, lo que lo hace relevante para arquitecturas de agentes que requieren múltiples llamadas de evaluación por turno.

La relevancia actual radica en su enfoque: en lugar de competir en benchmarks generativos, se posiciona como componente de infraestructura para sistemas de decisión. Su licencia Apache-2.0 y su formato de pesos propietario MQ4 lo vinculan al ecosistema hipfire, aunque su modelo base Qwen3.5-4B-Base pertenece a Alibaba Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B-Base) |
| Parametros totales | 4B (aproximado, según modelo base Qwen3.5-4B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración recomendada en `hipfire serve --max-seq 4096`) |
| Tipos de cuantizacion | MQ4G256V2 simétrica, no calibrada (formato propio de hipfire) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mq4` (MQ4G256V2, formato propietario de hipfire) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen/Qwen3.5-4B-Base, un modelo de 4B parámetros desarrollado por Alibaba Cloud. Sobre esta base, Mapika realizó un fine-tuning orientado a la tarea de evaluación de decisiones tipadas, y posteriormente hipfire-models aplicó una cuantización a MQ4G256V2 simétrica sin calibración (sin AWQ, imatrix, GPTQ ni proceso de calibración alguno). El resultado es un artefacto de 2,595 GB que difiere de los pesos BF16 originales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el fine-tuning de Mapika. La model card únicamente documenta el proceso de cuantización y las mediciones de acuerdo (agreement) frente a un juez de referencia, no el entrenamiento upstream. La innovación técnica destacable es el formato de cuantización MQ4G256V2, con grupos de 256 elementos y simetría, que permite ejecutar el modelo con un pico de VRAM de 3184 MiB en una Radeon R9700 (gfx1201) con `--max-seq 4096 --spec off`.

## Capacidades

- Clasificación de decisiones tipadas: puntúa opciones dentro de preguntas estructuradas de tipo yes/no, choice (selección múltiple) y score (puntuación).
- Devuelve la opción seleccionada junto con su distribución de probabilidad, permitiendo umbrales de confianza.
- Integración con el endpoint `/v1/systemone` de `hipfire serve`.
- Inferencia determinista: las respuestas fueron bit-idénticas entre repeticiones en las pruebas documentadas.
- No soporta chat libre ni generación de texto abierto; su uso está restringido a la evaluación de opciones suministradas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de departamentos (billing, support, sales) como pregunta de tipo choice, devolviendo la opción más probable con su distribución. Adecuado por su baja latencia (p50 de 17,3 ms para una pregunta) y su formato de salida estructurado.
- Moderación y filtrado de contenido: preguntas yes/no sobre si un texto cumple una política concreta, con un acuerdo top-1 del 94% frente al juez de referencia en preguntas yes/no.
- Puntuación de calidad en pipelines de datos: preguntas de tipo score para asignar una valoración numérica a muestras generadas, con un acuerdo del 73% en esta categoría.
- Validación de decisiones en agentes: actuar como juez local que evalúa si una acción propuesta por un agente es coherente con el estado del sistema, integrado en el endpoint `/v1/systemone`.
- Clasificación de intenciones en asistentes: determinar la intención del usuario entre un conjunto cerrado de opciones antes de derivar a un modelo generativo mayor.
- Gatekeeping en sistemas de retrieval: decidir si un documento recuperado es relevante para una consulta mediante una pregunta yes/no, reduciendo el coste de generación posterior.
- Evaluación automática de respuestas: comparar respuestas candidatas mediante preguntas de tipo choice, aprovechando el determinismo bit a bit entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de acuerdo (agreement) frente a un juez de referencia, que no constituyen precisión contra ground-truth:

| Metrica | Valor |
|---|---|
| Acuerdo top-1 global | 85,0% |
| Acuerdo top-1 yes/no | 94% |
| Acuerdo top-1 choice | 88% |
| Acuerdo top-1 score | 73% |
| Acuerdo de probabilidad en bruto (2-fold) | 82,2% |
| Acuerdo de probabilidad ajustado por temperatura (2-fold) | 82,6% |
| Latencia p50 / p95, 3 preguntas | 53,7 / 67,8 ms |
| Latencia p50 / p95, 1 pregunta | 17,3 / 26,3 ms |
| Pico de VRAM en la prueba de latencia | 3184 MiB |

Metodología: seis calentamientos, dos pasadas de 3 preguntas sobre 100 ítems por repetición de orden, repetición espejada; la medición agrupada de 3 preguntas incluye 400 llamadas y la de 1 pregunta 600 llamadas, con `LJ_FIXNULL=1`, `--max-seq 4096 --spec off` en una Radeon R9700 (gfx1201). La incertidumbre de calidad es sustancial con 100 ítems: la diferencia top-1 pareada frente a MQ4 asimétrica fue de +1,0 puntos porcentuales, con intervalo bootstrap del 95% de [-2,0, +4,0]. Las temperaturas de ajuste post-hoc son yes/no 1,29, choice 0,99 y score 0,84.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB (pico medido de 3184 MiB con `--max-seq 4096`).
- GPU recomendadas: Radeon R9700 (gfx1201) es la hardware de referencia documentada; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, aunque no se documentan pruebas en otras arquitecturas.
- Cabe en GPU de consumo: sí, por el tamaño del artefacto (2,595 GB) y el pico de VRAM medido, aunque no se han publicado pruebas específicas en RTX 4090, RTX 3090 u otras consumer.
- Opciones de despliegue: exclusivamente `hipfire serve` con una build que incluya la entrada de registro `decider:4b`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.mq4`.
- Latencia y throughput: p50 de 17,3 ms y p95 de 26,3 ms para una pregunta; p50 de 53,7 ms y p95 de 67,8 ms para tres preguntas, en la configuración de referencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card únicamente compara la variante MQ4 simétrica con una variante MQ4 asimétrica del mismo modelo (diferencia top-1 de +1,0 puntos porcentuales), sin ofrecer comparaciones frente a otros jueces o clasificadores de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| decider-4b (hipfire) | 4B | 4096 | Apache-2.0 | `.mq4` | Hugging Face (hipfire-models) |
| Mapika/decider-4b | 4B | no disponible | Apache-2.0 | no disponible | Hugging Face (Mapika) |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | Apache-2.0 | safetensors | Hugging Face (Qwen) |

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto libre ni mantiene conversaciones multi-turno; solo puntúa opciones suministradas.
- La confianza es derivada del modelo y puede ser errónea; la model card recomienda validar sobre la propia distribución de decisiones antes de confiar en ella.
- El acuerdo del 73% en preguntas de tipo score es notablemente inferior al 94% en yes/no, lo que limita su uso en tareas de puntuación fina.
- La incertidumbre estadística es alta: con 100 ítems, el intervalo bootstrap del 95% para la diferencia top-1 frente a MQ4 asimétrica es de [-2,0, +4,0] puntos porcentuales.
- Las temperaturas de ajuste post-hoc (1,29 / 0,99 / 0,84) son resultados de evaluación, no calibración del cuantizador, y no se aplican automáticamente al descargar el artefacto.
- El modelo solo soporta inglés; no se documentan capacidades multilingües.
- El formato `.mq4` es propietario de hipfire, lo que limita la portabilidad a otros runtimes de inferencia.
- La cuantización MQ4G256V2 es simétrica y no calibrada (sin AWQ, imatrix ni GPTQ), lo que puede introducir degradación frente a los pesos BF16 originales.
- Riesgo de sesgos y alucinación no documentado en la información disponible; al ser un clasificador restringido a opciones, el riesgo de alucinación de contenido es bajo, pero el de calibración de probabilidades es relevante.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el archivo LICENSE y NOTICE junto con el artefacto y mantener la atribución a Mapika y a Alibaba Cloud (copyright 2026).

## Enlaces

- [hipfire-models/decider-4b en Hugging Face](https://huggingface.co/hipfire-models/decider-4b)
- [Mapika/decider-4b (modelo upstream)](https://huggingface.co/Mapika/decider-4b/tree/99d7fd5bfcc4d11ba37239dafe0ed653803819d3)
- [Qwen/Qwen3.5-4B-Base (modelo base)](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
