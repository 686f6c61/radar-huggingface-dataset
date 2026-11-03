# AGCobra/Industrial-Revolution-Gemma-4-31b

## Resumen

Industrial-Revolution-Gemma-4-31b es un adaptador LoRA (y su versión fusionada en GGUF) entrenado por AGCobra sobre el modelo base `unsloth/gemma-4-31B`, una variante preentrenada de la familia Gemma 4 de Google. El adaptador se ha entrenado con QLoRA de 4 bits durante 3 épocas sobre el dataset `AGCobra/Industrial-Revolution`, con el objetivo de especializar el modelo en conversaciones y contenido relacionados con la revolución industrial, aunque la model card no detalla explícitamente el dominio de aplicación.

El repositorio incluye tanto los archivos originales del adaptador PEFT (safetensors) como una versión fusionada y cuantizada en Q4_K_M GGUF de 18,69 GB, lista para cargar directamente con llama.cpp sin necesidad de aplicar el adaptador por separado. También se ofrece un proyector multimodal (mmproj) en f16 que preserva el codificador de visión del modelo base sin modificaciones.

El modelo cuenta con 30.697.345.596 parámetros totales (aproximadamente 30,7 mil millones) y un tamaño de repositorio de 20,2 GB. Es relevante para quienes necesiten un modelo conversacional especializado con capacidades multimodales y despliegue local eficiente mediante llama.cpp, aunque su licencia y condiciones de uso comercial no están claramente especificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), adaptador LoRA sobre base preentrenada |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (truncado a 2.048 tokens durante entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (GGUF fusionado); adaptador en safetensors (BF16 base + F32 adapter) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el dataset fuente tiene metadatos de uso no comercial) |
| Formato de pesos | Safetensors (adaptador PEFT), GGUF (Q4_K_M fusionado), mmproj f16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, un transformer denso de aproximadamente 30,7 mil millones de parámetros. Sobre esta base preentrenada (no instruction-tuned) se aplicó un adaptador LoRA entrenado con QLoRA de 4 bits durante 3 épocas. El entrenamiento utilizó el dataset `AGCobra/Industrial-Revolution` (revisión `fbfc77ff760667c9f43bf9da532651f6f1cb1c26`), con 14.020 filas de entrenamiento y 896 de test, sin truncamiento de secuencias (0 truncadas) y con 17.704 turnos de asistente en train y 1.097 en test. Las secuencias se limitaron a 2.048 tokens por defecto.

El dataset no contiene trazas de razonamiento (thinking traces); los mensajes se renderizaron con la plantilla fija de Gemma 4 con pensamiento vacío y etiquetas solo para el asistente. El tokenizer incluido en el repo proporciona la plantilla de chat ausente en el checkpoint base y usa `<turn|>` como token EOS (ID 106). La conversión a GGUF se realizó con llama.cpp (commit `29c720eaf72f`), fusionando la base BF16 con el adaptador F32 antes de la cuantización Q4_K_M, sin matriz de importancia. El codificador de visión del modelo base se preserva sin cambios (todas las actualizaciones LoRA de visión son cero).

## Capacidades

- Generación de texto conversacional multi-turno.
- Capacidades multimodales de visión (entrada de imágenes) mediante el proyector mmproj opcional, heredadas del modelo base Gemma 4.
- Plantilla de chat integrada en el GGUF para uso directo con llama.cpp.
- Modo no-thinking configurable (`enable_thinking=False`, `--reasoning-budget 0`).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agentes y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).

## Casos de uso

- Asistente conversacional especializado en temática industrial: el modelo puede mantener diálogos multi-turno sobre procesos, maquinaria y contexto histórico-industrial, aprovechando el ajuste fino sobre el dataset Industrial-Revolution.
- Despliegue local en estaciones de trabajo: la versión Q4_K_M GGUF de 18,69 GB permite ejecutar el modelo en hardware de consumo de gama alta sin infraestructura de servidor, usando llama-server.
- Análisis de documentación técnica con imágenes: gracias al proyector mmproj, puede procesar diagramas, esquemas o fotografías de equipos industriales junto con texto explicativo.
- Prototipado de chatbots de dominio: al ser un adaptador PEFT, permite experimentar con la especialización sobre una base Gemma 4 sin reentrenar desde cero, útil para validar enfoques de fine-tuning.
- Integración en pipelines con llama.cpp: el GGUF fusionado simplifica el despliegue en entornos con recursos limitados, sin necesidad de gestionar adaptadores separados.
- Investigación sobre fine-tuning QLoRA: el repositorio incluye configuraciones de entrenamiento (`training_config.json`), métricas (`metrics.jsonl`) y detalles de conversión (`gguf_conversion.json`), útiles como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la prueba de inferencia local con llama.cpp es un "conversion smoke test, not a quality benchmark".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-21 GB para la versión Q4_K_M GGUF (18,69 GB de pesos + overhead de contexto y KV cache); el adaptador PEFT en 4 bits requiere cargar la base Gemma 4 31B cuantizada, con requisitos similares o superiores.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24 GB) para la versión Q4_K_M; GPUs con 24 GB o más son necesarias para el GGUF fusionado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con la cuantización Q4_K_M; en GPUs de 16 GB no cabría sin cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`), Ollama (potencialmente, al ser GGUF), vLLM y TGI no confirmados para este adaptador; el adaptador PEFT requiere Unsloth/Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Industrial-Revolution-Gemma-4-31b | ~30,7 B | No disponible (entrenado a 2.048) | No disponible | Safetensors, GGUF Q4_K_M | Adaptador LoRA especializado, multimodal |
| Gemma 4 31B (base) | ~30,7 B | No disponible | No disponible | Safetensors | Modelo base preentrenado sin ajuste |
| Gemma 2 27B | ~27 B | 8.192 tokens | Gemma License | Safetensors, GGUF | Generación anterior, sin adaptador |
| Modelos de ~30B comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados |

La comparativa con alternativas directas no está disponible en la información proporcionada; los datos de Gemma 2 27B se incluyen solo como referencia de categoría y podrían no ser exactos para la versión Gemma 4.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial no está claramente permitido; el dataset fuente tiene metadatos de uso no comercial, lo que puede condicionar el uso del modelo derivado.
- Riesgo de alucinación: al ser un modelo de ~30B sin benchmarks publicados, no hay evidencia de robustez factual; se recomienda validación en producción.
- Contexto limitado en entrenamiento: las secuencias se truncaron a 2.048 tokens por defecto, aunque no hubo truncamientos en los datos; el contexto máximo real del modelo base no está documentado.
- Idiomas no especificados: no se confirma soporte multilingüe ni calidad en castellano.
- Modo thinking desactivado: el dataset no contiene trazas de razonamiento, por lo que el modo thinking puede degradar la calidad; se recomienda `enable_thinking=False`.
- Tool calling y agentes no confirmados: no hay evidencia en la model card de soporte nativo para function calling o razonamiento multi-paso.
- Sin benchmarks de calidad: solo se realizó una prueba de humo de conversión e inferencia, no una evaluación de rendimiento.
- Visión sin ajuste: el codificador de visión es el del modelo base sin modificaciones; las capacidades visuales no se han especializado en el dominio industrial.

## Enlaces

- [HuggingFace: AGCobra/Industrial-Revolution-Gemma-4-31b](https://huggingface.co/AGCobra/Industrial-Revolution-Gemma-4-31b)
- [Modelo base: unsloth/gemma-4-31B](https://huggingface.co/unsloth/gemma-4-31B)
- [Dataset: AGCobra/Industrial-Revolution](https://huggingface.co/datasets/AGCobra/Industrial-Revolution)
- [Commit de llama.cpp usado para conversión](https://github.com/ggml-org/llama.cpp/commit/29c720eaf72fcf8e4e61a56a88b994d92668261d)
- [Unsloth](https://github.com/unslothai/unsloth)
