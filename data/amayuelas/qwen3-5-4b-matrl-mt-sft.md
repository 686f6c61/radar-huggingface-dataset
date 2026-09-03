# amayuelas/Qwen3.5-4B-MatRL-MT-SFT

## Resumen

`Qwen3.5-4B-MatRL-MT-SFT` es un checkpoint de *cold start* desarrollado por `amayuelas` sobre el modelo base `Qwen/Qwen3.5-4B`. Su propósito es entrenar a un agente de lenguaje para el diseño inverso de estructuras cristalinas mediante un bucle de uso de herramientas multi-turno: proponer candidatos, evaluarlos con herramientas externas, refinar las propuestas y, sobre todo, cerrar el episodio con una llamada `submit`. El modelo base apenas comete (solo 3 llamadas `submit` en 2.880 rollouts), por lo que este ajuste fino por supervisión (SFT) instala la competencia de compromiso que la fase posterior de aprendizaje por refuerzo (RL) explotará para aprender la química subyacente.

El modelo se entrena sobre el dataset `amayuelas/matrl-sft-mt`, compuesto por 1.123 episodios multi-turno de tool-use, con pérdida solo sobre las respuestas del asistente. Arquitectónicamente hereda el diseño híbrido de Qwen3.5, que combina capas de atención softmax con capas de atención lineal (DeltaNet), lo que permite longitudes de contexto largas (16.384 tokens en entrenamiento) con un coste computacional reducido. Es un modelo de 4.539 millones de parámetros, con licencia Apache-2.0 y pesos en formato `safetensors`.

La relevancia de este checkpoint radica en que es el primer eslabón de un pipeline de RL para ciencia de materiales: sin un cold start que enseñe el formato y el bucle de herramienta, el agente nunca llega a cerrar episodios y el RL no puede optimizar la química. Además, al ser un modelo con capacidades vision-language (VL), requiere una configuración especial de preprocesador para servirse con vLLM, detalle que el autor documenta explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (DeltaNet) y atención softmax; capacidades vision-language |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (longitud de secuencia de entrenamiento; la del modelo base no se especifica) |
| Tipos de cuantizacion | No disponible (solo pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, una arquitectura híbrida que intercala capas de atención softmax con capas de atención lineal basadas en DeltaNet. Esta combinación reduce el coste cuadrático de la atención en secuencias largas, lo que permite entrenar con una longitud de secuencia de 16.384 tokens. El ajuste fino se realiza mediante SFT supervisado sobre 1.123 episodios multi-turno de tool-use del dataset `amayuelas/matrl-sft-mt`, con pérdida únicamente sobre las respuestas del asistente (assistant-only loss). Se entrenan 423 pasos (3 épocas) con un batch global de 8, optimizador AdamW con learning rate constante de 2e-5, precisión bf16 y paralelización FSDP junto con context parallelism de tipo *ulysses* (no ring, porque ring attention no aplica a capas de atención lineal). El entrenamiento se ejecutó en 4 GPU A100-40GB con el trainer `prime-rl`, alcanzando una pérdida final de aproximadamente 0,36.

El objetivo explícito de este checkpoint es enseñar el formato del bucle de herramienta —proponer, evaluar, refinar y, sobre todo, *commit* dentro del presupuesto de turnos—. El modelo base falla en el compromiso: en 2.880 rollouts multi-turno solo realizó 3 llamadas `submit`, proponiendo una media de 5,6 candidatos por rollout y evaluando de forma escasa, hasta agotar los turnos. Este SFT instala la capacidad de cerrar episodios, dejando el aprendizaje de la química para la fase de RL posterior (`amayuelas/Qwen3.5-4B-MatRL-MT-RL`).

## Capacidades

- Generación de texto con razonamiento en el canal de pensamiento nativo (`reasoning_content` → ` thinking`), preservado a través de las llamadas a herramientas.
- Uso de herramientas (tool-use / function calling) para diseño inverso de estructuras cristalinas: el agente propone candidatos, los evalúa con herramientas externas y refina sus propuestas.
- Comportamiento agéntico multi-turno: el modelo aprende a gestionar el presupuesto de turnos y a cerrar episodios con una llamada `submit`.
- Capacidades vision-language (image-text-to-text) heredadas del modelo base Qwen3.5, aunque no se detallan en la documentación del checkpoint.
- Soporte de conversación multi-turno con contexto largo (16.384 tokens).
- Idiomas: no especificados; se desconoce el alcance multilingüe.

## Casos de uso

- Diseño inverso de estructuras cristalinas: el modelo actúa como agente que propone estructuras candidatas, las evalúa mediante herramientas de cálculo o bases de datos y refina iterativamente hasta converger a una solución válida, cerrando el episodio con `submit`.
- Automatización de pipelines de descubrimiento de materiales: integrado en flujos que combinan simulaciones DFT, bases de datos cristalográficas y validación estructural, el modelo orquesta las llamadas a herramientas y gestiona el ciclo completo de propuesta-evaluación-refinamiento.
- Asistente de investigación en ciencia de materiales: un investigador puede conversar con el modelo en lenguaje natural, pedirle que explore composiciones o estructuras y que ejecute evaluaciones externas, recibiendo resultados intermedios y propuestas refinadas.
- Generación de hipótesis de materiales: el modelo propone combinaciones de elementos y geometrías cristalinas, las somete a validación computacional y prioriza las más prometedoras según los resultados de las herramientas.
- Punto de partida para entrenamiento por refuerzo: investigadores que quieran reproducir o extender el pipeline MatRL pueden usar este checkpoint como cold start antes de aplicar RL, evitando el problema de compromiso del modelo base.
- Evaluación de agentes tool-use en dominios científicos: sirve como banco de pruebas para estudiar el comportamiento de compromiso, la gestión de turnos y la interacción con herramientas en tareas de razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K para este checkpoint, ni comparaciones con otros modelos. El único dato de rendimiento es la pérdida final de entrenamiento (~0,36), que no es comparable entre modelos.

## Requisitos de hardware

- Entrenamiento: 4×A100-40GB (según la model card).
- Inferencia en bf16: se estiman ~9 GB de VRAM para los pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; cabe en GPUs consumer de 12 GB o más (p. ej., RTX 3060 12GB, RTX 4070, RTX 4090).
- Inferencia con cuantización: no se proporcionan cuantizaciones oficiales; si se generan GGUF o AWQ, el modelo podría ejecutarse en GPUs con 4-6 GB de VRAM, pero no hay datos confirmados.
- Despliegue recomendado: vLLM (requiere `preprocessor_config.json` y `video_preprocessor_config.json` incluidos en el repo; sin ellos vLLM falla al cargar). También es compatible con `transformers` estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (agentes de tool-use para ciencia de materiales con arquitectura híbrida). El checkpoint RL posterior (`Qwen3.5-4B-MatRL-MT-RL`) es el complemento natural, pero no se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Es un checkpoint de cold start: no ha aprendido química de materiales, solo el formato y el bucle de herramienta. La capacidad de proponer estructuras químicamente válidas se adquiere en la fase de RL posterior.
- No debe evaluarse con `enable_thinking=false`: desactiva el canal de razonamiento nativo que este entrenamiento instala, invalidando el comportamiento esperado.
- Para servir con vLLM es imprescindible incluir los archivos de configuración de preprocesador de imagen y vídeo, aunque se use solo texto; sin ellos la carga falla.
- No se han publicado benchmarks ni métricas de calidad, por lo que el rendimiento real en tareas de ciencia de materiales es desconocido.
- Los idiomas soportados no están documentados; es probable que el entrenamiento se haya realizado principalmente en inglés, pero no se confirma.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-4B para asegurar compatibilidad en productos comerciales.
- El dataset de entrenamiento es específico de un dominio (estructuras cristalinas); el modelo no está diseñado para tareas generales de conversación o generación de código fuera de ese ámbito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/amayuelas/matrl-sft-mt
- Checkpoint RL posterior: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Trainer utilizado: https://github.com/PrimeIntellect-ai/prime-rl
