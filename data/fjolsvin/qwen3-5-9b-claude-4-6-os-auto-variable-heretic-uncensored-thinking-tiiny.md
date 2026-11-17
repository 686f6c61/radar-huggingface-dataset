# fjolsvin/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-tiiny

## Resumen
Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-tiiny es un fine-tune del modelo denso Qwen3.5-9B de Alibaba Qwen, empaquetado por el usuario fjolsvin para su importación en dispositivos Tiiny Pocket. El modelo original fue entrenado por DavidAU mediante Unsloth sobre el dataset Claude-4.6-OS (cuatro datasets derivados de Claude) y posteriormente sometido a un proceso de "abliteration" o "heretic" para eliminar los mecanismos de rechazo. Esta variante concreta no modifica los pesos: solo ajusta el `config.json` y el tokenizador para que el dispositivo lo acepte como fine-tune del modelo base oficial.

El modelo está orientado a escritura creativa, ficción, generación de tramas y roleplay, con capacidades multimodales de entrada imagen-texto. Cuenta con 9.409.813.744 parámetros en precisión bfloat16, un repositorio de 18,8 GB y una ventana de contexto declarada de 256k tokens. Su licencia Apache 2.0 permite uso comercial, aunque el proceso de des censurado introduce consideraciones éticas y de seguridad relevantes.

La relevancia de esta ficha radica en que documenta una práctica creciente: la redistribución de modelos "uncensored" empaquetados para hardware específico (Tiiny Pocket con TiinyOS 0.1.39), con verificación de rendimiento en NPU y métricas de divergencia KL frente al modelo original. Es un caso representativo de la cadena de fine-tunes comunitarios sobre modelos base de gran contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (por defecto, según model card) |
| Tipos de cuantizacion | bfloat16 en origen; se sugiere q4ks (no imatrix) o IQ3S (imatrix) para GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUFs mencionados para text-generation-webui |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-9B es un transformer denso de la familia Qwen3.5, con capacidades multimodales (pipeline `image-text-to-text`). El fine-tune se realizó con Unsloth sobre hardware local, empleando el dataset Claude-4.6-OS compuesto por cuatro datasets derivados de Claude. Según el autor, el entrenamiento se diseñó para ser "mild" (suave) con el objetivo de no degradar los benchmarks del modelo raíz, y afirma que el resultado los supera en todas las métricas evaluadas.

La cadena de linaje es relevante: el modelo parte de `trohrbaugh/Qwen3.5-9B-heretic-v2`, una versión abliterated de Qwen3.5-9B, y sobre ella se aplicó el fine-tune con el dataset Claude. El proceso "heretic" elimina las respuestas de rechazo, y el autor reporta una tasa de rechazos de 6/100 frente a 100/100 del modelo original, con una divergencia KL de 0.0793 (considerada excelente, ya que valores por debajo de 1 indican buena preservación de la distribución). No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a los cuatro datasets de Claude.

## Capacidades
- Generación de texto creativo: ficción, narrativa, cuentos, novelas, poesía y prosa vívida en múltiples géneros (ciencia ficción, romance, terror, etc.).
- Generación de tramas y subtramas, continuación de escenas y construcción de historias coherentes.
- Roleplay y conversación multi-turno con contexto extenso (hasta 256k tokens).
- Entrada multimodal imagen-texto (visión): el autor indica que las imágenes fueron probadas y funcionan con el nuevo entrenamiento; las porciones de vídeo no fueron testeadas.
- Razonamiento y generación de salida mejorados respecto al modelo raíz según los benchmarks del autor.
- Modo "thinking" (indicado en el nombre del modelo), orientado a razonamiento explícito.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso
- Escritura de ficción y narrativa larga: el modelo puede generar capítulos completos y mantener coherencia argumental gracias a su ventana de 256k tokens, adecuada para novelas y sagas con múltiples personajes y subtramas.
- Roleplay conversacional en plataformas como SillyTavern o text-generation-webui: el ajuste "uncensored" permite interacciones sin rechazos, con la recomendación de usar un factor de suavizado de 1.5 para una operación más fluida.
- Generación de guiones y diálogos para videojuegos o producciones audiovisuales: la capacidad de continuación de escenas y la variedad de géneros facilitan la producción de contenido narrativo ramificado.
- Asistencia a guionistas y autores: generación de borradores, variantes de trama y desarrollo de personajes con control mediante instrucciones directas.
- Creación de contenido de ficción para adultos o temáticas sensibles: el proceso de abliteration elimina los rechazos, aunque el autor advierte que en algunos casos es necesario dirigir explícitamente el tono (por ejemplo, indicando el vocabulario a emplear) para obtener el nivel de explicitud deseado.
- Despliegue en dispositivos Tiiny Pocket: el empaquetado tiiny-forge permite importar el modelo en TiinyOS 0.1.39, con rendimiento verificado en NPU (TTFT 2.96 s a 3725 tokens de prompt, prefill 1261.2 tok/s, decode 16.6 tok/s).
- Investigación sobre des censurado y alineación: útil para estudiar el comportamiento de modelos abliterated y su divergencia respecto al original (KL 0.0793, rechazos 6/100).

## Benchmarks y rendimiento

Resultados publicados por el autor (precisión mxfp8):

| Benchmark | Este modelo (HERETIC) | Qwen3.5-9B |
|---|---|---|
| ARC | 0.425 | 0.417 |
| ARC/e | 0.521 | 0.458 |
| BoolQ | 0.791 | 0.623 |
| HSWAG | 0.664 | 0.634 |
| OBKQA | 0.374 | 0.338 |
| PIQA | 0.744 | 0.737 |
| Wino | 0.645 | 0.639 |

Métricas de des censurado y preservación:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0.0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

Rendimiento en dispositivo Tiiny Pocket (TiinyOS 0.1.39, verificación 2026-11-17): 5/5 pruebas de humo superadas, NPU share 29%, tamaño listado 19.0 GB, TTFT 2.96 s con 3725 tokens de prompt, prefill 1261.2 tok/s, decode 16.6 tok/s.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado.
- Cuantización q4ks o IQ3S: reduce el peso a aproximadamente 5-6 GB, permitiendo su ejecución en GPUs consumer de 8-12 GB.
- GPUs recomendadas: A100 (40/80 GB) o H100 para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones q8 o q6.
- Cabe en GPU consumer: sí, en cuantizaciones q4/q3 en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.).
- Opciones de despliegue: transformers (formato nativo), llama.cpp/GGUF (sugerido q4ks o IQ3S), KoboldCpp, oobabooga/text-generation-webui (con llama_HF para GGUFs), SillyTavern, y el propio dispositivo Tiiny Pocket.
- Latencia y throughput: en Tiiny Pocket, decode 16.6 tok/s y prefill 1261.2 tok/s; en GPUs dedicadas no se han publicado datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (fjolsvin/DavidAU) | 9.4B denso | 256k | Apache 2.0 | Ficción, roleplay, uncensored | ARC 0.425, KL 0.0793 |
| Qwen/Qwen3.5-9B (base) | 9.4B denso | 256k (según card) | Apache 2.0 | Propósito general | ARC 0.417, rechazos 100/100 |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9.4B denso | No disponible | No disponible | Abliterated | No disponible |
| DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 9.4B denso | 256k | Apache 2.0 | Ficción, uncensored (original) | Mismo rendimiento (pesos idénticos) |

## Limitaciones y advertencias
- Modelo "uncensored" y abliterated: elimina los rechazos de seguridad, lo que implica riesgo de generar contenido dañino, explícito o sesgado sin filtros. No es adecuado para aplicaciones de producción orientadas al público general sin moderación adicional.
- El autor advierte que, pese a la eliminación de rechazos, en algunos casos el modelo requiere instrucciones explícitas para alcanzar el nivel de explicitud o lenguaje soez deseado; sin ellas, la salida puede resultar "blanda".
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el fine-tune sobre datos derivados de Claude sin verificación factual exhaustiva.
- Las porciones de vídeo del modelo no fueron testeadas; solo se validaron imágenes.
- La divergencia KL de 0.0793 indica buena preservación, pero no es cero; existe deriva respecto al modelo original.
- El empaquetado tiiny-forge modifica `config.json`, `merges.txt` y el campo `base_model` de la model card, pero no los pesos; los usuarios deben ser conscientes de estas modificaciones de metadatos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas locales según el caso de uso.
- Sin descargas ni likes en el momento de la ficha, lo que limita la validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/fjolsvin/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-tiiny
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base heretic: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe de verificación Tiiny: tiiny-verification.md (en el repositorio)
- Datos crudos de verificación: tiiny-verification.json (en el repositorio)
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
