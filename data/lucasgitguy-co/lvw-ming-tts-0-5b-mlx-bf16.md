# Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-bf16

## Resumen

LvW-Ming-TTS-0.5B-MLX-bf16 es una conversión al formato MLX (bfloat16) del modelo de síntesis de voz LvW-Ming-TTS-0.5B, un sistema text-to-speech con capacidad de clonación de voz. Lo publica el usuario Lucasgitguy-co y está pensado para ejecutarse sobre Apple Silicon mediante la librería mlx-audio. A pesar de la etiqueta "0.5B" del nombre, los pesos safetensors suman 1.479.454.868 parámetros (aproximadamente 1,48 mil millones), lo que incluye probablemente el codificador de hablante CAM++ además del modelo generativo.

El modelo es un fine-tune del propio LvW-Ming-TTS-0.5B y soporta siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés. Su pipeline es text-to-speech y admite tanto voces integradas (por ejemplo, US_Emma) como clonación de voz a partir de un audio de referencia con su transcripción exacta. La arquitectura es de tipo denso y los pesos se distribuyen en safetensors con código personalizado.

La relevancia de esta ficha es doble. Por un lado, documenta una conversión MLX para inferencia local en Mac. Por otro, el propio autor advierte en la model card que el fine-tune no supera al modelo base en su conjunto de test retenido: la puerta de publicación consta como FAILED y recomienda usar el modelo base para uso real. Es, por tanto, un artefacto de inspección más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa (text-to-speech con clonación de voz; codificador de hablante CAM++) |
| Parametros totales | 1.479.454.868 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (bf16); no se documentan otras |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo generativo más allá de que es de tipo denso y que se distribuye con código personalizado (`custom_code`). La conversión a MLX se realizó con `mlx_audio.convert` (mlx-audio 0.6.6) manteniendo los pesos en bfloat16 sin cambios, y el codificador de hablante CAM++ (`campplus.safetensors`) se convirtió con el conversor propio de mlx-audio.

Se trata de un fine-tune sobre Lucasgitguy-co/LvW-Ming-TTS-0.5B. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta el protocolo de evaluación previo al entrenamiento: tres reglas fijadas de antemano (error medio inferior al base, no más fallos de parada y ninguna lengua empeorada más de un 10 % o 0,5 puntos). El fine-tune incumplió las tres, y además falló la comprobación de formato (error medio del 8,90 % frente al 6,91 % del modelo PyTorch en 30 frases retenidas en inglés y chino).

## Capacidades

- Síntesis de voz (text-to-speech) en siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.
- Clonación de voz a partir de un audio de referencia y su transcripción exacta (`--ref_audio` y `--ref_text`).
- Voces integradas predefinidas, como US_Emma.
- Selección de idioma de salida mediante `--lang_code` (de, es, fr, ko, ja).
- Ejecución local en Apple Silicon a través de mlx-audio 0.6.1 o superior.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Prototipado de TTS en Mac: permite probar un pipeline de síntesis de voz con clonación directamente en Apple Silicon sin GPU dedicada, usando mlx-audio como dependencia única.
- Generación de locuciones multilingües de prueba: útil para crear borradores de audio en español, francés, alemán, coreano o japonés durante el desarrollo de una aplicación, siempre etiquetando el audio como sintético.
- Evaluación de conversiones MLX: sirve como referencia para quien quiera comparar el comportamiento de un modelo convertido a MLX frente a su versión PyTorch, dado que el autor publica métricas de error de formato.
- Investigación sobre clonación de voz: el modelo admite audio de referencia y transcripción, lo que facilita experimentos controlados de similitud de hablante en entornos de laboratorio.
- Doblaje creativo con consentimiento: para proyectos artísticos o de accesibilidad donde se disponga de permiso explícito del hablante cuya voz se clona.
- Docencia y demostraciones: ilustrar las diferencias entre un fine-tune y su modelo base usando las propias métricas publicadas (error medio, fallos de parada) como caso de estudio.

## Benchmarks y rendimiento

| Metrica | Modelo base | Este fine-tune | Resultado |
|---|---|---|---|
| Error medio (test retenido) | 6,99 % | 7,11 % | FAIL |
| Fallos de parada | 2/420 | 3/420 | FAIL |
| Empeoramiento por idioma (>10 % o +0,5 pt) | — | español peor | FAIL |
| Error medio de formato (30 frases en/zh) | 6,91 % (PyTorch) | 8,90 % | FAIL |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 3,0 GB; en bf16 se requiere aproximadamente esa cantidad de memoria unificada para cargar los pesos, más el margen para el codificador de hablante y el procesamiento de audio.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el backend MLX. No se documenta soporte para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en equipos de consumo con Apple Silicon; no se especifican requisitos mínimos de memoria unificada.
- Despliegue: mlx-audio 0.6.1 o superior mediante `mlx_audio.tts.generate`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LvW-Ming-TTS-0.5B-MLX-bf16 (este) | 1.479.454.868 | 7 | MIT | safetensors MLX bf16 | Fine-tune que no supera al base; recomendado solo para inspección |
| LvW-Ming-TTS-0.5B (base) | no disponible | 7 | MIT | no disponible | Modelo base; el autor lo recomienda para uso real |
| Alternativas TTS open source de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- El fine-tune no supera al modelo base: falla las tres reglas de publicación y la comprobación de formato; el autor recomienda usar el modelo base para uso real.
- El español empeora respecto al base, lo que desaconseja su uso en producción para ese idioma.
- Requiere mlx-audio 0.6.1 o superior; versiones 0.6.0 y anteriores cargan el modelo pero pronuncian palabras incorrectas.
- Los embeddings de hablante CAM++ no se extraen automáticamente en mlx-audio.
- La normalización de texto no está portada: es necesario escribir los números como palabras.
- Riesgo de alucinación y de errores de pronunciación inherente a los sistemas TTS; no se documentan sesgos específicos.
- Riesgo de suplantación de identidad: la clonación de voz y las voces integradas deben usarse solo con consentimiento y para fines legítimos; debe etiquetarse el audio sintético cuando pueda confundirse con una grabación real.
- Licencia MIT, que permite uso comercial, pero las restricciones de uso responsable del modelo base se heredan y deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-bf16
- Modelo base: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
