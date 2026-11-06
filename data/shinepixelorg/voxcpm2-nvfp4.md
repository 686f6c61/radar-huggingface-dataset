# ShinePixelOrg/VoxCPM2-NVFP4

## Resumen

VoxCPM2-NVFP4 es una versión cuantizada en NVFP4 (W4A4) del modelo de síntesis de voz openbmb/VoxCPM2, publicada por ShinePixelOrg. Se trata de un checkpoint derivado que reduce el peso de los tensores del componente BaseLM mediante cuantización GPTQ empaquetada en formato `nvfp4-pack-quantized` de compressed-tensors, manteniendo intacto el resto del stack acústico. El modelo base es un sistema TTS multilingüe con capacidad de clonación de voz zero-shot, distribuido bajo licencia Apache-2.0.

La relevancia de esta ficha radica en que documenta un caso de cuantización agresiva (4 bits en pesos y activaciones) sobre un modelo de audio, un dominio donde la degradación perceptual es especialmente sensible. El autor reporta una reducción de peso del 23,6% en el fichero principal, muy lejos del ahorro teórico de 4x, porque solo se cuantizan 124 matrices del BaseLM. El resultado es un compromiso explícito: la envolvente espectral se mantiene (similitud 0,93–0,99) pero la prosodia y la duración se desvían de forma notable.

El modelo conserva el pipeline `text-to-speech`, la librería `voxcpm` y el soporte de 30 idiomas del checkpoint original. Con 2.290.004.544 parámetros totales y un repositorio de 3,9 GB, está pensado para despliegue en servidores con vLLM-Omni más que para inferencia directa con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neural con BaseLM (transformer) + stack acústico (ResidualLM, LocEnc, LocDiT, AudioVAE); cuantización parcial NVFP4 |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16, escalas float8_e4m3fn) en 124 módulos Linear del BaseLM; resto BF16 y AudioVAE en FP32 |
| Idiomas soportados | 30: zh, en, ar, my, da, nl, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`) + `audiovae.pth` |

## Arquitectura y entrenamiento

El modelo base VoxCPM2 combina un BaseLM tipo transformer con un decodificador acústico compuesto por ResidualLM, LocEnc, LocDiT y un AudioVAE que genera audio a 48 kHz. Esta versión cuantizada no reentrena el modelo: aplica GPTQ con `block_size` 128, `dampening_frac` 0,01 y orden de activación estático sobre las proyecciones q, k y o, además de gate y up en las capas 0–19 del BaseLM. Las capas 20–27 de gate/up se dejaron en BF16 porque un primer intento de GPTQ concentró allí el error de reconstrucción (error mediano de gate/up en torno a 131, media ~538 en capas 24–27, frente a error mediano de k de 6,4). Las proyecciones v, down, los embeddings de token, el ResidualLM, LocEnc, LocDiT, las proyecciones y la cabeza de stop permanecen en BF16; el AudioVAE queda en FP32 sin modificar.

La calibración se realizó con 14 llamadas reales a `generate()` en modo zero-shot, CFG 2,0 y 10 pasos Euler, cubriendo chino corto, inglés, una pregunta, una frase con números y horas y un pasaje largo en chino, con `max_len` de 6 a 16 tokens de audio. Esto implica que el BaseLM vio latentes producidos por el decodificador CFM, no características aleatorias, lo que acerca la calibración a la distribución real de inferencia. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas, incluidos chino, inglés, árabe, hindi, japonés, coreano, español, francés, alemán y portugués.
- Clonación de voz zero-shot a partir de audio de referencia, según la model card del modelo base.
- Generación de audio a 48 kHz, 16 bits, mono.
- Control de generación mediante CFG (classifier-free guidance) y pasos de muestreo Euler.
- Soporte de prompts de texto con números y expresiones temporales (validado en calibración con una frase de números y horas).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo TTS, no un LLM conversacional.
- No se documentan capacidades de visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- **Locución automatizada de artículos y documentación**: el modelo acepta texto en cualquiera de los 30 idiomas soportados y genera WAV a 48 kHz, adecuado para narrar contenido editorial o técnico sin intervención humana. La ventana de contexto no está documentada, por lo que conviene fragmentar textos largos.
- **Generación de audiolibros con voz consistente**: la clonación zero-shot permite fijar una voz de referencia y reutilizarla en capítulos sucesivos, manteniendo timbre y estilo dentro de las limitaciones de prosodia señaladas por el autor.
- **Doblaje y localización de vídeo**: al cubrir 30 idiomas, un mismo pipeline puede generar pistas de voz para distintas regiones; la similitud espectral de 0,93–0,99 respecto a BF16 sugiere que el timbre se preserva, aunque la duración varía entre un 9% y un 27%, lo que exige reajuste de tiempos en postproducción.
- **Asistentes de voz para atención al cliente**: integrado en un servidor vLLM-Omni, el modelo puede sintetizar respuestas dinámicas en múltiples idiomas; la reducción de peso a 3,85 GiB de memoria de pesos facilita el despliegue en GPUs de gama media frente al checkpoint BF16.
- **Accesibilidad y lectura de pantalla**: conversión de contenido textual a voz para usuarios con discapacidad visual, con la ventaja de que el checkpoint cuantizado reduce los requisitos de VRAM del servidor de inferencia.
- **Prototipado rápido de interfaces de voz**: la licencia Apache-2.0 y el formato compressed-tensors permiten experimentar con integración en vLLM-Omni sin restricciones comerciales, aunque la degradación de prosodia hace recomendable validar perceptualemente antes de producción.
- **Generación de avisos y anuncios en sistemas embebidos o edge**: con 3,6 GiB de pesos totales, el checkpoint es viable en GPUs consumer con suficiente VRAM, siempre que se acepte la pérdida de fidelidad prosódica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo TTS. La model card incluye una comparación perceptual entre BF16 y NVFP4 sobre cinco frases zero-shot:

| Frase | Duración BF16 → NVFP4 | RMS | F0 medio | Correlación contorno F0 | Similitud espectral |
|---|---:|---:|---:|---:|---:|
| Chino corto | 3,36 s → 2,56 s (−24%) | −24,2 → −19,4 dB | 113 → 115 Hz | −0,19 | 0,930 |
| Inglés corto | 3,52 s → 4,48 s (+27%) | −23,6 → −21,8 dB | 133 → 142 Hz | 0,19 | 0,989 |
| Números y hora | 5,60 s → 6,08 s (+9%) | −25,2 → −23,9 dB | 112 → 139 Hz | −0,14 | 0,987 |
| Pregunta en chino | 4,32 s → 3,36 s (−22%) | −24,9 → −17,4 dB | 138 → 178 Hz | −0,06 | 0,970 |
| Chino largo | 17,44 s → 14,08 s (−19%) | −27,8 → −22,9 dB | 126 → 106 Hz | 0,29 | 0,972 |

Datos adicionales reportados: la proporción de energía por encima de 8 kHz cae del 4,7% al 0,9% en inglés y del 2,8% al 0,4% en la pregunta; el centroide espectral de la pregunta baja de 3962 Hz a 2564 Hz y el del pasaje largo de 3576 Hz a 2267 Hz. La mayor diferencia de sonoridad es de 7,5 dB en la pregunta. Ninguna ejecución colapsó a silencio ni recortó.

## Requisitos de hardware

- **VRAM estimada**: vLLM-Omni 0.30.0 reportó 3,85 GiB de memoria de pesos al cargar el checkpoint. Hay que añadir la memoria de activaciones, caché y buffers del decodificador acústico.
- **GPU recomendadas**: el autor validó la carga en una única GPU con `FlashInferCutlassNvFp4LinearKernel` para las 124 matrices NVFP4; no especifica modelo de GPU. Por el tamaño, cabría en GPUs de 8–12 GB de VRAM, aunque no se confirma en la documentación.
- **GPU consumer**: probablemente viable en RTX 3060 12 GB, RTX 4070 y superiores, dado el peso de 3,6 GiB, pero no hay validación publicada.
- **Despliegue**: vLLM-Omni 0.30.0 es el único runtime documentado. Los tensores `weight_packed` no son compatibles directamente con `VoxCPM.from_pretrained`, por lo que no se puede usar el flujo estándar de la librería `voxcpm` sin adaptación.
- **Latencia y throughput**: no disponibles. La model card menciona 10 pasos Euler y CFG 2,0 como ajustes de generación, pero no publica tiempos por segundo de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| VoxCPM2-NVFP4 (este) | 2.290 M | no disponible | 30 | Apache-2.0 | Hugging Face, formato compressed-tensors |
| openbmb/VoxCPM2 (BF16) | no disponible | no disponible | 30 | Apache-2.0 | Hugging Face, safetensors estándar |
| Alternativas TTS multilingüe | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa disponible es con el checkpoint BF16 del que deriva: mismo número de parámetros, mismos idiomas y licencia, pero 4,266 GiB frente a 3,258 GiB en `model.safetensors` (−23,6%). No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- **Degradación prosódica**: la correlación del contorno de F0 respecto a BF16 oscila entre −0,19 y 0,29, lo que indica que la entonación no sigue la referencia. No es apto para aplicaciones donde la naturalidad prosódica sea crítica sin validación previa.
- **Variación de duración**: entre −24% y +27% según la frase, lo que rompe la sincronización con vídeo o subtítulos si no se reajusta.
- **Pérdida de agudos**: la energía por encima de 8 kHz cae de forma acusada (4,7% → 0,9% en inglés), lo que puede percibirse como un timbre más apagado.
- **Diferencia de sonoridad**: hasta 7,5 dB en una de las frases medidas, lo que exige normalización posterior.
- **Cuantización parcial**: solo 124 matrices están en NVFP4; el ahorro real es del 23,6%, no el 4x teórico de 4 bits.
- **Compatibilidad limitada**: los tensores empaquetados no funcionan con `VoxCPM.from_pretrained`; requiere vLLM-Omni 0.30.0 o adaptación manual.
- **Riesgo de alucinación acústica**: no se documenta, pero en TTS la generación de audio no inteligible o artefactos en frases fuera de la distribución de calibración es un riesgo habitual; la calibración se hizo con solo 14 llamadas, lo que limita la cobertura.
- **Sesgos**: no documentados en la información proporcionada; al ser un modelo multilingüe, es esperable un rendimiento desigual entre idiomas, pero no hay datos.
- **Licencia**: Apache-2.0 permite uso comercial, pero al ser un derivado, se aplican los mismos términos que el checkpoint original de OpenBMB.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/ShinePixelOrg/VoxCPM2-NVFP4
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Repositorio del proyecto: https://github.com/OpenBMB/VoxCPM
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Revisión del modelo base citada: `32279effe8c19989596f05d353d1447f51d9e915`
