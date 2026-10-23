# ConnorYU/Qwen3.5-9B-VerIH-step400-template

## Resumen

Qwen3.5-9B-VerIH-step400-template es un ajuste fino de 9.409.813.744 parámetros (9,41 B) publicado por el desarrollador independiente ConnorYU sobre la arquitectura Qwen3.5. Se distribuye a través de HuggingFace con licencia Apache 2.0, en formato safetensors (18,8 GB de repositorio) y con la librería transformers como vía de carga declarada. El pipeline registrado es image-text-to-text, de modo que el autor declara capacidad de entrada multimodal imagen-texto, aunque la model card no incluye ningún ejemplo, plantilla de prompt visual ni evaluación que lo verifique.

El modelo se deriva de ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, un checkpoint que, por su nombre y por la cadena de variantes del mismo autor, parece formar parte de una línea de post-entrenamiento con GRPO orientada al seguimiento de instrucciones verificables (IFEval) en modo "think". El sufijo step400 sugiere un checkpoint intermedio del paso 400 de entrenamiento, no un modelo final pulido. El ajuste se realizó con Unsloth y la librería TRL de HuggingFace, según indica el propio autor, con una mejora declarada de 2x en velocidad de entrenamiento.

Su relevancia ahora es acotada y muy específica: interesa a quien investiga cadenas abiertas de RL y ajuste fino sobre Qwen3.5, y a quien quiera reproducir o comparar checkpoints intermedios de esa línea. No es un modelo con validación comunitaria (0 descargas, 1 like en el momento de la consulta) ni con documentación suficiente para producción. La longitud de contexto, la composición del dataset de entrenamiento y los resultados de evaluación no están publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`); número de capas, tipo de atención y detalles internos no disponibles |
| Parámetros totales | 9.409.813.744 (9,41 B), dato real de safetensors |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors en precisión completa (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 18,8 GB) |
| Modalidad | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Librería y serving | transformers; tag `text-generation-inference` y `endpoints_compatible` |
| Modelo base | ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 |
| Método de ajuste | Fine-tuning con Unsloth y TRL (2x más rápido según el autor) |
| Plantilla de chat | Incluida en el repositorio (`chat_template`) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como perteneciente a la arquitectura `qwen3_5`, es decir, un transformer decoder-only de la familia Qwen 3.5 con 9,41 B de parámetros. El pipeline image-text-to-text implica un codificador visual acoplado al modelo de lenguaje, pero la model card no detalla el tipo de proyector, la resolución de imagen admitida ni el rango de parches. Tampoco se especifica si la atención es estándar o con alguna variante eficiente, ni si hay capas MoE: por el recuento de parámetros y la nomenclatura "9B" todo apunta a un modelo denso, pero es una inferencia, no un dato publicado.

El entrenamiento es un ajuste fino sobre un checkpoint previo ya sometido a GRPO y orientado a IFEval en modo "think" (el nombre del base model lo indica explícitamente). El autor declara el uso de Unsloth y TRL, lo que en la práctica implica un ajuste tipo LoRA/QLoRA con kernels optimizados y fusión posterior de pesos; no se publican hiperparámetros, número de tokens de entrenamiento, composición del dataset, ni si hubo una fase de DPO o RLHF adicional en este paso concreto. Tampoco se documenta ninguna innovación técnica más allá del uso de la cadena Unsloth + TRL y de la herencia del modo de razonamiento del checkpoint base.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat incluida en el repositorio.
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`), sin ejemplos ni evaluación publicados que lo confirmen.
- Modo de razonamiento "think" heredado del checkpoint base GRPO-ifeval-v0-think.
- Seguimiento de instrucciones verificables, por herencia directa del entrenamiento IFEval del modelo del que parte.
- Capacidad declarada de despliegue en Text Generation Inference y en endpoints compatibles.
- Tool calling / function calling: no disponible, no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible, no se documenta.
- Multilingüe: no; el único idioma declarado es inglés.
- Audio, vídeo u otras modalidades: no disponible.

## Casos de uso

- Investigación en post-entrenamiento con RL: el modelo sirve como checkpoint intermedio (step400) de una cadena GRPO + IFEval sobre Qwen3.5, útil para estudiar la evolución de la capacidad de seguir instrucciones verificables a lo largo del entrenamiento y compararla con los demás checkpoints de la misma serie.
- Estudio de jerarquía de instrucciones y robustez frente a system prompts: la existencia de variantes hermanas con sufijos `no-syshint` e `insecure` en el mismo repositorio del autor indica que esta línea se emplea para experimentar con la influencia de las pistas de sistema en el comportamiento del modelo, un caso de uso típico en evaluación de seguridad.
- Base para ajuste fino adicional con Unsloth y TRL: al ser un modelo de 9,41 B con licencia Apache 2.0 y pesos safetensors estándar, se puede reentrenar en una sola GPU de 24 GB con cuantización de 4 bits para adaptarlo a un dominio concreto en inglés.
- Prototipado de asistentes multimodales en inglés: el pipeline image-text-to-text permitiría probar flujos de descripción de imagen o extracción de información visual, siempre con una validación previa propia, dado que el autor no publica ejemplos ni métricas de calidad visual.
- Generación de datos sintéticos de instrucciones: el modo "think" y el ajuste sobre IFEval lo hacen razonablemente adecuado para producir pares instrucción-respuesta con traza de razonamiento en inglés, que luego se filtran y se usan para entrenar modelos menores.
- Red-teaming y evaluación comparativa de checkpoints: al compartir base y tokenizador con las variantes `no-syshint` e `insecure`, permite aislar el efecto de cambios concretos de ajuste en pruebas de seguimiento de instrucciones y de comportamiento inseguro.
- Despliegue en infraestructura TGI existente: los tags `text-generation-inference` y `endpoints_compatible` facilitan montar un endpoint de pruebas sobre un clúster ya operativo con TGI, sin necesidad de escribir un servidor propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor se limita a indicar el modelo de procedencia, la licencia y el uso de Unsloth/TRL, sin tablas de MMLU, HumanEval, GSM8K, IFEval ni evaluaciones multimodales. Las búsquedas web sobre el modelo y sus variantes tampoco devuelven métricas.

## Requisitos de hardware

- Pesos en bf16/fp16: 9,41 B × 2 bytes ≈ 18,8 GB, cifra que coincide con el tamaño del repositorio. A eso hay que sumar la caché KV y las activaciones, cuyo coste no se puede estimar porque la longitud de contexto no está publicada.
- GPU recomendadas para precisión completa: A100 40 GB, A6000 48 GB o L40S 48 GB, que dejan margen suficiente para caché KV en contextos medios.
- GPU de 24 GB (RTX 4090, RTX 3090, L4): viables en 8 bits, con aproximadamente 9,4 GB de pesos y margen para caché; en bf16 quedan muy justas y dependen de la longitud de contexto real.
- Cuantización de 4 bits: pesos en torno a 5-6 GB, lo que permite ejecución en RTX 3060 12 GB, RTX 4070 o incluso GPUs de 8 GB con contexto corto. Requiere generar los pesos cuantizados, porque el repositorio solo publica safetensors.
- Opciones de despliegue: transformers directamente, TGI por los tags declarados y vLLM si la versión instalada ya soporta la arquitectura `qwen3_5` (no confirmado en la información disponible). llama.cpp y Ollama no son utilizables sin convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponibles; no hay datos publicados de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step400-template | 9,41 B | no disponible | Apache 2.0 | safetensors | 0 descargas, 1 like |
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint | 9 B (según la fuente) | no disponible | Apache 2.0 | safetensors | variante sin pista de sistema |
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure | 9 B (según la fuente) | no disponible | Apache 2.0 | safetensors | variante orientada a comportamiento inseguro |
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-2-insecure-1e | 9 B (según la fuente) | no disponible | Apache 2.0 | safetensors | segunda iteración de la variante insegura |
| Qwen3-8B (referencia externa, datos públicos del fabricante) | 8,2 B | 32.768 tokens nativos, ampliable a 131.072 | Apache 2.0 | safetensors, GGUF | modelo base con amplia validación comunitaria |

Las tres variantes hermanas comparten autor, base y licencia, y se diferencian únicamente por el tipo de ajuste aplicado, por lo que la comparación entre ellas mide el efecto de ese ajuste y no diferencias arquitectónicas. La fila de Qwen3-8B se incluye como referencia de la familia y procede de documentación pública del fabricante, no de la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Documentación mínima: la model card tiene seis líneas y no describe datos de entrenamiento, contexto, evaluación ni uso previsto. Cualquier despliegue exige una evaluación propia previa.
- Idioma único: solo se declara inglés. El rendimiento en castellano no está verificado y previsiblemente será inferior.
- Ausencia total de benchmarks: no hay ninguna métrica publicada, ni de texto ni multimodal, lo que impide comparar objetivamente con alternativas de tamaño similar.
- Riesgo de alucinación no caracterizado: es un modelo de 9 B ajustado mediante RL sobre IFEval, sin evaluación de factualidad ni de calibración.
- Checkpoint intermedio: el sufijo `step400` apunta a un estado parcial de entrenamiento, no a una versión final; es esperable un comportamiento menos estable que el de un modelo convergido.
- Posible ausencia de alineación de seguridad robusta: el mismo autor publica variantes etiquetadas como `insecure`, lo que sugiere que esta línea se usa para investigación de seguridad y no para asistencia general sin filtros adicionales.
- Validación comunitaria nula: 0 descargas y 1 like en el momento de la consulta; no hay reportes de terceros sobre calidad o estabilidad.
- Capacidad multimodal declarada pero no evidenciada: el pipeline image-text-to-text figura en los metadatos, pero no hay ejemplos, plantilla de prompt visual ni evaluación que confirmen un funcionamiento correcto.
- Metadatos con fecha futura: la fecha de creación del repositorio es 2026-10-23, posterior a la de la mayoría de referencias del ecosistema, lo que conviene tener en cuenta al citar el modelo.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-template
- Modelo base (GRPO-ifeval-v0-think-step400): https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Variante sin pista de sistema: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint
- Árbol de ficheros de la variante sin pista de sistema: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint/tree/main
- Variante insegura: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure
- Ficha de la variante insegura en Featherless: https://featherless.ai/models/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure
- Ficha de la variante insegura en FriendliAI: https://friendli.ai/models/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure
- Segunda iteración de la variante insegura en Featherless: https://featherless.ai/models/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-2-insecure-1e
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL (HuggingFace): https://github.com/huggingface/trl
