# feltrockni/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-tiiny

## Resumen

Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-tiiny es un fine-tune del modelo denso multimodal Qwen3.5-9B de Alibaba Qwen, desarrollado originalmente por DavidAU sobre la variante abliterada de trohrbaugh (Qwen3.5-9B-heretic-v2) y reempaquetado por el usuario feltrockni para su importación en el dispositivo Tiiny Pocket. El reempaquetado no modifica los pesos: solo sustituye el `config.json` por el del modelo base oficial, añade `merges.txt` y corrige el campo `base_model` de la model card. El objetivo declarado es la escritura creativa y de ficción (generación de tramas, subtramas, escenas, roleplay) con un modelo "abliterado" y sin rechazos, manteniendo a la vez las capacidades multimodales del original.

El modelo hereda la arquitectura de Qwen3.5: un transformer causal con codificador de visión, fusión temprana de tokens multimodales, atención híbrida con Gated Delta Networks y capa de mezcla dispersa tipo Mixture-of-Experts según la documentación de Qwen. Cuenta con 9.409.813.744 parámetros totales en formato bfloat16 (18,8 GB de repositorio) y un contexto declarado de 256k tokens por defecto en la model card del fine-tune. Los idiomas oficialmente etiquetados son inglés y chino, aunque el modelo base de Qwen3.5 declara soporte para 201 idiomas y dialectos.

Su relevancia actual es doble: por un lado, demuestra el ecosistema de fine-tunes comunitarios sobre Qwen3.5 orientados a usos creativos y sin censura; por otro, documenta un caso práctico de reempaquetado para despliegue en hardware de consumo (Tiiny Pocket). La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial, aunque las implicaciones del "abliterating" y del contenido sin filtros deben evaluarse con cuidado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; atención híbrida con Gated Delta Networks y mezcla dispersa tipo MoE (según documentación de Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (el modelo base se describe como denso de 9B; la documentación de Qwen3.5 menciona MoE disperso, pero no se detalla el número de parámetros activos) |
| Longitud de contexto | 256k tokens (por defecto, según la model card del fine-tune) |
| Tipos de cuantizacion | Se sugiere mínimo q4ks (no imatrix) o IQ3S (imatrix); pesos publicados en bfloat16 |
| Idiomas soportados | en, zh (etiquetas del repositorio); el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Dimensión oculta | 4096 |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B (fine-tune de trohrbaugh/Qwen3.5-9B-heretic-v2) |
| Tamaño del repositorio | 18,8 GB |
| Precisión de pesos | bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, descrito por Qwen como un modelo de lenguaje causal con codificador de visión, entrenado con fusión temprana sobre tokens multimodales. La documentación del modelo base menciona una arquitectura híbrida eficiente que combina Gated Delta Networks con mezcla dispersa tipo Mixture-of-Experts, orientada a inferencia de alto rendimiento con baja latencia. La dimensión oculta es 4096 y el número de parámetros totales es de aproximadamente 9,4 mil millones. El contexto por defecto declarado en la model card del fine-tune es de 256k tokens.

El fine-tune lo realizó DavidAU con Unsloth sobre hardware local, usando un dataset denominado Claude-4.6-OS compuesto por cuatro datasets de Claude, con el objetivo declarado de que el entrenamiento fuese "suave" y no degradase los benchmarks del modelo base. Antes de ese fine-tune, el modelo ya había pasado por un proceso de "abliterating" (eliminación de la dirección de rechazo en el espacio de activaciones) en la variante de trohrbaugh. La model card reporta una divergencia KL de 0,0793 respecto al modelo original y una reducción de rechazos de 100/100 a 6/100 en una prueba de 100 prompts. La plantilla Jinja fue modificada para forzar el modo "instruct only". El reempaquetado de feltrockni solo cambia metadatos (config, merges, base_model), no los pesos.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Comprensión de imágenes: pipeline image-text-to-text; la model card indica que la visión fue probada y funciona con el nuevo entrenamiento, aunque las porciones de vídeo no se probaron.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de escenas, relatos de ciencia ficción, romance y otros géneros.
- Roleplay y conversación multi-turno con contexto largo (256k tokens).
- Modo instructivo forzado mediante plantilla Jinja modificada ("instruct only").
- Comportamiento sin rechazos ("fully uncensored", "abliterated"): la model card declara 6 rechazos en 100 prompts frente a 100 en el modelo original.
- Capacidades multilingües: etiquetas en inglés y chino; el modelo base declara 201 idiomas y dialectos, aunque no hay verificación específica en el fine-tune.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma específica en la información del fine-tune; el modelo base Qwen3.5 menciona entrenamiento RL a escala de agentes.

## Casos de uso

- Escritura de ficción y relatos largos: el modelo puede generar tramas, subtramas y escenas coherentes con un contexto de 256k tokens, lo que permite mantener continuidad argumental en novelas o sagas por entregas.
- Roleplay y narrativa interactiva: su modo instructivo y su comportamiento sin rechazos lo hacen adecuado para personajes conversacionales y aventuras de texto donde el usuario define el tono y los límites.
- Generación de guiones y diálogos: útil para borradores de guiones, descripciones vívidas ("vivid prosing") y variaciones de escenas en distintos géneros (ciencia ficción, romance, etc.).
- Asistencia creativa con imágenes: al aceptar entradas image-text-to-text, puede describir o continuar una escena a partir de una ilustración o referencia visual, útil en talleres de escritura o generación de storyboards.
- Prototipado en hardware de consumo: el reempaquetado está pensado para importarse en Tiiny Pocket; con cuantización q4ks o IQ3S puede ejecutarse en entornos con recursos limitados para pruebas de escritura creativa.
- Investigación sobre alineación y censura: su condición de modelo abliterado con métricas de KLD y rechazos publicadas lo convierte en un caso de estudio para analizar el efecto del abliterating en la calidad y el comportamiento del modelo.
- Generación de contenido editorial sin filtros: para equipos que necesitan narrativa adulta o temas sensibles con control humano posterior, el modelo no aplica rechazos automáticos.

## Benchmarks y rendimiento

La model card del fine-tune publica resultados en formato mxfp8 para siete tareas (arc, arc/e, boolq, hswag, obkqa, piqa, wino):

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| HERETIC (este modelo) | 0,624 | 0,820 | 0,886 | 0,663 | 0,442 | 0,763 | 0,681 |
| Qwen3.5-9B | 0,417 | 0,458 | 0,623 | 0,634 | 0,338 | 0,737 | 0,639 |
| Qwen3.5-9B-Instruct | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |

Métricas de des-censura y divergencia:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de contexto y activaciones; se recomienda al menos 24 GB para contexto moderado.
- Con cuantización q4ks (no imatrix) o IQ3S (imatrix), el peso se reduce aproximadamente a 5-6 GB, lo que permite ejecución en GPU de consumo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para bfloat16 y contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o cuantizaciones de 8 bits; RTX 3090, 4080 y 4070 Ti para cuantizaciones q4ks/IQ3S.
- Cabe en GPU de consumo: sí, con cuantización q4ks o IQ3S; en bfloat16 completo requiere GPU profesional o múltiples GPU de consumo.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según la documentación del modelo base Qwen3.5; llama.cpp/Ollama no están confirmados en la información disponible, aunque las cuantizaciones GGUF sugeridas (q4ks, IQ3S) apuntan a ese ecosistema.
- Latencia y throughput estimados: no disponibles.
- El reempaquetado está orientado a la importación en Tiiny Pocket, un dispositivo de consumo con recursos limitados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-tiiny) | 9,4B | 256k | Apache 2.0 | Fine-tune creativo, abliterado, multimodal | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | no disponible | Apache 2.0 | Modelo base multimodal de Qwen | Hugging Face |
| Qwen3.5-9B-Instruct | 9B | no disponible | Apache 2.0 | Versión instructiva oficial | Hugging Face |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9B | no disponible | Apache 2.0 | Abliterated del base | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated" y sin censura: puede generar contenido sensible, ofensivo o inapropiado sin filtros; requiere moderación externa en producción.
- La reducción de rechazos (6/100) implica que el modelo no señalará límites éticos por sí mismo; la responsabilidad recae en el integrador.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en tareas factuales y con contexto muy largo.
- Idiomas oficialmente etiquetados solo en inglés y chino; el rendimiento en castellano no está verificado, aunque el base declara cobertura amplia.
- Las porciones de vídeo del modelo no fueron probadas según la model card.
- La plantilla Jinja modificada fuerza el modo instructivo; puede romper flujos que esperen el comportamiento conversacional original.
- El fine-tune se entrenó con datasets derivados de Claude; verificar las condiciones de uso de dichos datos si se redistribuye.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y el proceso de abliterating pueden tener implicaciones legales o de política de plataforma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria independiente.
- El reempaquetado cambia el `base_model` de la model card; la trazabilidad real pasa por trohrbaugh y DavidAU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feltrockni/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-tiiny
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT
- Modelo base abliterado de trohrbaugh: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
