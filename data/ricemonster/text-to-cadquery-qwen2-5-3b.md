# ricemonster/Text-to-CadQuery-Qwen2.5-3B

## Resumen

Text-to-CadQuery-Qwen2.5-3B es un ajuste fino supervisado de parámetros completos (full-parameter SFT) del modelo Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario ricemonster. Su propósito es convertir descripciones en lenguaje natural de piezas y geometrías CAD en programas Python ejecutables escritos con la librería CadQuery, lo que permite generar modelos 3D paramétricos a partir de texto sin escribir código manualmente.

El modelo parte de la arquitectura Qwen2 de 3B parámetros (3.085.938.688 según los pesos en safetensors) y hereda las capacidades conversacionales del instruct base, pero se especializa en un dominio muy concreto: la generación de código CAD. Forma parte de una familia de cuatro tamaños (0.5B, 1.5B, 3B y 7B) publicada junto con el dataset ricemonster/Text-to-CadQuery.

Es relevante para quienes trabajan en diseño generativo, automatización de pipelines de ingeniería o asistentes de CAD, porque ofrece una alternativa ligera (3B) que puede desplegarse en hardware modesto y que produce código CadQuery en lugar de texto libre. La información pública disponible es escasa: la model card es breve, no se declara licencia y no se publican resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino supervisado del instruct base |
| Parámetros totales | 3.085.938.688 (3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-3B-Instruct; el autor no la declara) |
| Tipos de cuantización | No disponible en la model card; al ser safetensors en bfloat16 es compatible con cuantizaciones estándar de llama.cpp/vLLM/AWQ/GPTQ, pero no se documentan versiones publicadas |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño del repo: 6,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 3B parámetros, inicializado desde Qwen/Qwen2.5-3B-Instruct. El autor indica que se realizó un ajuste fino supervisado de parámetros completos (full-parameter SFT), es decir, se actualizaron todos los pesos y no solo adaptadores tipo LoRA. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT.

El entrenamiento se apoya en el dataset ricemonster/Text-to-CadQuery, que empareja descripciones de piezas CAD con programas CadQuery. El prompt de inferencia documentado por el autor sigue el formato `### Instruction:\n{descripción}\n\n### Response:\n`, con generación determinista (`do_sample=False`) y hasta 2048 tokens nuevos. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.); las capacidades arquitectónicas subyacentes son las del Qwen2.5-3B-Instruct original.

## Capacidades

- Generación de código Python con la API de CadQuery a partir de descripciones textuales de geometrías (bloques, taladros pasantes, operaciones booleanas, etc.).
- Generación de texto conversacional heredada del instruct base de Qwen2.5.
- Razonamiento de código orientado a un dominio específico (CAD paramétrico).
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es de un solo turno (instrucción → programa).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación automática de piezas paramétricas: dado un texto como "un bloque rectangular con un taladro cilíndrico centrado", el modelo emite un script CadQuery que, al ejecutarse, produce el modelo 3D. Adecuado por su especialización en un único DSL y su tamaño reducido.
- Asistentes de CAD integrados en IDE o notebooks: el modelo puede incorporarse como autocompletado o generador de snippets CadQuery dentro de un entorno de diseño, con latencia baja al ser un modelo de 3B.
- Prototipado rápido en ingeniería mecánica: convertir especificaciones de bocetos en código reproducible que puede versionarse en Git y parametrizarse, en lugar de modelar manualmente en un CAD gráfico.
- Automatización de pipelines de fabricación: generar scripts CadQuery que exporten STEP/STL para impresión 3D o mecanizado, integrándolos en flujos de CI que validen la geometría generada.
- Docencia y aprendizaje de CAD programático: servir como tutor que traduce descripciones en lenguaje natural a código CadQuery comentado y ejecutable.
- Generación de variantes de diseño: a partir de una descripción base, producir programas que parametricen dimensiones (longitud, radio, número de taladros) para explorar familias de piezas.
- Evaluación de datasets texto-a-CAD: usar el modelo como baseline de 3B frente a los tamaños 0.5B, 1.5B y 7B de la misma familia para medir el efecto de la escala en la calidad del código generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 6-7 GB solo para pesos, más overhead de activaciones y caché KV (el repo ocupa 6,2 GB).
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB; en 4 bits, aproximadamente 2-2,5 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: A100/H100 para despliegue de alta concurrencia; RTX 4090, RTX 3090 o RTX A6000 para uso individual en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante) y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (uso documentado por el autor), vLLM, TGI, llama.cpp/Ollama tras conversión a GGUF (no se publican GGUF oficiales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Text-to-CadQuery-Qwen2.5-3B | 3B | No disponible | Texto a CadQuery | No disponible | Hugging Face |
| Text-to-CadQuery-Qwen2.5-7B | 7B | No disponible | Texto a CadQuery | No disponible | Hugging Face (misma familia) |
| Text-to-CadQuery-Qwen2.5-1.5B | 1,5B | No disponible | Texto a CadQuery | No disponible | Hugging Face (misma familia) |
| Qwen/Qwen2.5-3B-Instruct (base) | 3B | 32.768 tokens (según el modelo base) | Propósito general, instruct | Apache 2.0 (según el modelo base) | Hugging Face |

La comparación más directa es con los otros tamaños de la misma colección y con el instruct base sin ajustar, que no está especializado en CadQuery. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- La licencia no está declarada en la model card; antes de cualquier uso comercial debe verificarse con el autor, teniendo en cuenta además la licencia del modelo base Qwen2.5-3B-Instruct.
- El modelo solo declara soporte de inglés; las instrucciones en castellano pueden degradar la calidad del código generado.
- Riesgo de alucinación de API: puede generar llamadas a métodos de CadQuery inexistentes o con firmas incorrectas; es imprescindible validar que el script se ejecuta y produce una geometría válida.
- No se documentan sesgos específicos ni evaluación de seguridad; al derivar de un instruct general, puede heredar sesgos del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la tasa de éxito de ejecución ni de la fidelidad geométrica de los programas generados.
- El uso previsto es de un solo turno y generación determinista; no está diseñado ni documentado para conversaciones multi-turno ni para tool calling.
- El contexto máximo no está declarado por el autor; conviene asumir el del modelo base y verificar empíricamente con prompts largos.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-3B
- Dataset: https://huggingface.co/datasets/ricemonster/Text-to-CadQuery
- Colección de la familia: https://huggingface.co/collections/ricemonster/text-to-cadquery-6b0a2cabae152d0d6f0fc823
- Variante 0.5B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-0.5B
- Variante 1.5B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-1.5B
- Variante 7B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
