# empyrealworks/ACE-Step-1.5-XL-GGUF

## Resumen

ACE-Step 1.5 XL GGUF es una conversión a formato GGUF del modelo de generación de música ACE-Step 1.5 XL, desarrollada por el usuario empyrealworks a partir de los checkpoints originales de ACE-Step. El paquete incluye el DiT (Diffusion Transformer) de aproximadamente 4.990 millones de parámetros en sus variantes SFT y turbo, el codificador de texto Qwen3-Embedding-0.6B y el VAE, todo empaquetado para su uso con el motor acestep.cpp. El modelo resuelve la generación de audio musical condicionada por texto (text-to-audio), incluyendo letras, tempo y tonalidad.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación musical de calidad de producción en hardware de consumo mediante cuantización GGUF, algo poco habitual en esta categoría. El autor publica métricas de calidad objetivas (WER de letras, acierto de tempo y tonalidad, y puntuaciones AudioBox de calidad de producción y disfrute) comparando cada cuantización contra el original en BF16, lo que facilita una decisión informada sobre el equilibrio tamaño/calidad.

La licencia MIT del modelo base y la Apache 2.0 del codificador de texto hacen que el conjunto sea apto para uso comercial, si bien conviene verificar las condiciones del motor de inferencia acestep.cpp por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con codificador de texto Qwen3-Embedding-0.6B y VAE |
| Parametros totales | 4.988.270.726 (DiT XL) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (DiT); Q6_K (text encoder); BF16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base); Apache 2.0 (codificador de texto Qwen3-Embedding-0.6B) |
| Formato de pesos | GGUF (safetensors en los checkpoints originales) |

## Arquitectura y entrenamiento

El modelo se basa en un Diffusion Transformer (DiT) de aproximadamente 4.990 millones de parámetros que genera audio musical a partir de representaciones latentes, apoyado en un codificador de texto Qwen3-Embedding-0.6B para procesar los prompts y en un VAE para la decodificación al dominio de audio. Se distribuyen dos variantes del DiT: SFT (ajustada de forma supervisada) y turbo (optimizada para generación rápida). Las proyecciones de entrada y salida del DiT se mantienen en BF16 en todas las cuantizaciones para preservar calidad.

La conversión se realizó desde los checkpoints originales en FP32 mediante `convert.py` de acestep.cpp (commit `973517be024ff8b6bbd50e0adc9e308ab2ed71b3`), generando una conversión intermedia en BF16 desde la que se aplicó `tools/quantize.cpp`, extendido con formatos ggml adicionales. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) del modelo base original.

## Capacidades

- Generación de audio musical a partir de descripciones textuales (text-to-audio).
- Generación condicionada por letras, con control de tempo (BPM) y tonalidad (por ejemplo, A minor).
- Producción de piezas de duración extendida (se documentan pruebas con canciones de 150 segundos).
- Dos modos de inferencia: SFT (mayor fidelidad en letras) y turbo (mayor velocidad, ligera merma en inteligibilidad de letras).
- Cuantización configurable para ajustar el equilibrio entre tamaño, velocidad y calidad.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplicable (modelo de audio).

## Casos de uso

- Generación de música de fondo para vídeo y podcasts: el modelo permite describir el estilo, tempo y tonalidad deseados y generar una pieza de hasta 150 segundos, adecuada para producción de contenido con presupuesto limitado.
- Creación de maquetas musicales con letra: permite introducir letras y obtener una interpretación vocal con tempo y tonalidad controlados; la variante SFT ofrece mejor inteligibilidad de letras (9-13,5 % WER en las pruebas del autor).
- Prototipado rápido en estaciones de trabajo locales: la cuantización Q4_K_M (unos 3 GB por DiT) permite iterar en una GPU de consumo, reduciendo la dependencia de servicios en la nube.
- Investigación en generación musical: la disponibilidad de múltiples cuantizaciones con métricas de calidad publicadas facilita estudios sobre el impacto de la compresión en la fidelidad musical.
- Integración en herramientas de producción musical asistida: el modelo puede generar variaciones de una idea musical (cambio de tonalidad o tempo) manteniendo el estilo descrito en el prompt.
- Despliegue en entornos con recursos limitados: el VAE en BF16 (337 MB) y el codificador de texto Q6_K (677 MB) son ligeros, y el DiT puede ajustarse a la VRAM disponible eligiendo entre Q4_K_M, Q5_K_M, Q6_K o Q8_0.

## Benchmarks y rendimiento

El autor publica métricas de calidad comparando cuantizaciones contra BF16, evaluadas sobre una petición de canción de 150 segundos con letras en inglés, 125 BPM y A minor, en una RTX 5090:

| Modelo | WER de letras | Tempo, tonalidad | PQ (AudioBox) | CE (AudioBox) |
|---|---|---|---|---|
| SFT, BF16 (seeds 42-44) | 10,2 % | 3/3, 3/3 | 7,82 | 6,99 |
| SFT, Q4_K_M (seeds 42-44) | 9,0 % | 3/3, 3/3 | 7,70 | 6,91 |
| turbo, BF16 (seeds 42-44) | 20,2 % | 3/3, 3/3 | 7,91 | 7,27 |
| turbo, Q4_K_M (seeds 42-44) | 13,6 % | 3/3, 3/3 | 7,91 | 7,28 |
| SFT, BF16 DiT y text encoder (6 seeds) | 14,7 % | 6/6, 6/6 | 7,79 | 6,85 |
| SFT, Q5_K_M (6 seeds) | 13,5 % | 6/6, 6/6 | 7,77 | 6,78 |
| turbo, BF16 DiT y text encoder (6 seeds) | 15,8 % | 6/6, 6/6 | 7,95 | 7,15 |
| turbo, Q6_K (6 seeds) | 16,9 % | 6/6, 6/6 | 7,94 | 7,23 |

El autor señala además que formatos menores rinden peor: un DiT SFT en Q4_K sin las proyecciones de valor y down en 6 bits pierde inteligibilidad de letras (22 % WER en seeds 42-44, probado en una Radeon 8060S), y un codificador de texto en 4 bits pierde el tempo solicitado.

## Requisitos de hardware

- VRAM estimada para el DiT: aproximadamente 3 GB (Q4_K_M), 3,5 GB (Q5_K_M), 4,1 GB (Q6_K turbo), 5,3 GB (Q8_0).
- VRAM adicional: codificador de texto Q6_K (~677 MB) y VAE BF16 (~337 MB).
- GPU recomendadas: RTX 5090 (usada por el autor para las pruebas), y en general GPU de consumo con 8 GB o más de VRAM para Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M y Q5_K_M en tarjetas de 8 GB o más; Q8_0 requiere alrededor de 8-10 GB considerando el resto de componentes.
- Opciones de despliegue: el paquete está diseñado específicamente para acestep.cpp (https://github.com/ServeurpersoCom/acestep.cpp); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACE-Step 1.5 XL GGUF (esta ficha) | ~4.990 M (DiT) | GGUF (Q4_K_M a Q8_0) | MIT | Hugging Face, 892 descargas |
| ACE-Step/acestep-v15-xl-sft | ~4.990 M (DiT) | safetensors (FP32/BF16) | MIT | Hugging Face |
| ACE-Step/acestep-v15-xl-turbo | ~4.990 M (DiT) | safetensors (FP32/BF16) | MIT | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada, por lo que la comparación se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- La variante turbo presenta mayor tasa de error en letras que la SFT (20,2 % frente a 10,2 % en BF16, y 16,9 % frente a 13,5 % en las cuantizaciones medidas), lo que puede afectar a la inteligibilidad vocal.
- Las cuantizaciones por debajo de Q4_K_M (por ejemplo, Q4_K sin proyecciones de 6 bits) degradan notablemente la calidad: 22 % WER y pérdida del tempo solicitado con codificador de texto en 4 bits.
- Las métricas publicadas proceden de una única petición de prueba (150 segundos, letras en inglés, 125 BPM, A minor) y de un conjunto limitado de seeds; no constituyen una evaluación exhaustiva.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas en la información disponible.
- El modelo está pensado para ejecutarse con acestep.cpp; no se garantiza su funcionamiento con otros motores GGUF.
- La licencia MIT del modelo base permite uso comercial, pero el codificador de texto deriva de Qwen3-Embedding-0.6B (Apache 2.0) y conviene revisar las condiciones del motor de inferencia por separado.

## Enlaces

- Hugging Face: https://huggingface.co/empyrealworks/ACE-Step-1.5-XL-GGUF
- Modelo base SFT: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Modelo base turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Modelo base ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Motor de inferencia acestep.cpp: https://github.com/ServeurpersoCom/acestep.cpp
