# ivangalkindeveloper/Hulu-Med-32B-NVFP4

## Resumen

Hulu-Med-32B-NVFP4 es una cuantización comunitaria en formato NVFP4 (W4A4) del modelo médico multimodal Hulu-Med-32B, desarrollado originalmente por ZJU-AI4H (Universidad de Zhejiang). El checkpoint base es un modelo de lenguaje y visión especializado en dominio médico construido sobre el backbone Qwen2.5-32B, con pipeline `image-text-to-text` y código de modelo/procesador personalizado. Esta versión reduce el peso empaquetado de 61,86 GiB (BF16) a 20,08 GiB, lo que facilita su despliegue en hardware Blackwell con memoria limitada.

La cuantización aplica NVFP4 a las 448 proyecciones de atención y MLP del decodificador de lenguaje, con bloques de 16 valores, escalas de bloque FP8 E4M3 y escalas globales FP32. El codificador de visión, el proyector multimodal, los embeddings, la cabeza de salida y los parámetros de normalización se conservan en BF16 byte a byte. El autor declara explícitamente que no se ha realizado ninguna comparación de calidad médica entre BF16 y NVFP4, por lo que las métricas del modelo original no deben atribuirse a esta cuantización.

Es relevante ahora porque permite ejecutar un modelo médico multimodal de 32B en GPUs Blackwell (probado en DGX Spark GB10) con vLLM, algo inviable en BF16 para muchos entornos. No obstante, se trata de un artefacto técnico de comunidad, sin validación clínica y con soporte limitado a texto e imágenes 2D.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador Qwen2.5-32B + codificador de visión), código personalizado `hulumed_qwen2` |
| Parámetros totales | 19.555.688.048 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; en el runtime probado se limita a 2048 tokens |
| Tipos de cuantización | NVFP4 W4A4 (pesos y activaciones), bloques de 16 valores, escalas de bloque FP8 E4M3, escalas globales FP32; visión y capas no lineales en BF16 |
| Idiomas soportados | no disponible (la calibración incluyó ejemplos en RU/EN, pero no se declara cobertura oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; requiere `transformers` con `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo base Hulu-Med-32B es un transformer multimodal que combina un decodificador de lenguaje Qwen2.5-32B con un codificador de visión y un proyector multimodal. Esta ficha describe la cuantización, no el entrenamiento original: el autor no documenta datos de preentrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO en el modelo base. El checkpoint cuantizado se fija a la revisión `dfac09d0653d00ac974c02a09caacaaab22fa819` del repositorio original.

La receta de cuantización emplea LLM Compressor 0.15.0 con calibración estática min-max de activaciones y cuantización de pesos RTN. Se usaron 128 ejemplos de calibración públicos y sintéticos, incluyendo preguntas de entrenamiento de MedQA y reformulaciones sintéticas de ecografías en ruso e inglés, sin datos privados de pacientes. El decodificador de lenguaje usa kernels reales `FlashInferCutlassNvFp4LinearKernel` en el runtime probado. El adaptador de visión mantuvo equivalencia exacta con los cálculos HF en BF16 sobre tres rejillas de parches, según el archivo `vision-adapter-equivalence.json`.

## Capacidades

- Generación de texto conversacional en dominio médico.
- Comprensión de imágenes 2D (pipeline `image-text-to-text`); el adaptador probado mantiene la ruta de visión en BF16.
- Razonamiento y respuesta a preguntas médicas heredados del modelo base.
- Procesamiento de peticiones que combinan imagen y texto, como reformulaciones de mediciones en ecografías sintéticas.
- Soporte de decodificación de vídeo opcional en el procesador si se instala Decord, aunque no validado en esta cuantización.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio o vídeo/3D validado: no disponible; vídeo y 3D no fueron validados.

## Casos de uso

- Asistencia documental médica: el modelo puede resumir y responder preguntas sobre informes clínicos en texto, aprovechando el conocimiento de dominio del backbone Qwen2.5-32B y su contexto de conversación multi-turno.
- Triaje de imágenes 2D en entornos de investigación: permite procesar una imagen por prompt (límite configurado en el runtime probado) para tareas de descripción o preguntas visuales, con la ruta de visión en BF16 para preservar fidelidad.
- Despliegue en hardware Blackwell con memoria limitada: al ocupar 20,08 GiB empaquetados, cabe en una DGX Spark GB10 con vLLM 0.28.0, algo imposible en BF16 (61,86 GiB).
- Prototipado de pipelines clínicos internos: sirve para validar flujos de extracción y reformulación de mediciones (por ejemplo, ecografías sintéticas RU/EN) antes de invertir en infraestructura BF16.
- Investigación en cuantización médica: útil como referencia para estudiar el impacto de NVFP4 W4A4 en tareas clínicas, dado que el autor no realizó benchmark de calidad médica y deja esa evaluación al usuario.
- Evaluación comparativa de adaptadores personalizados: el checkpoint incluye un adaptador vLLM y cambios de compatibilidad con Transformers 5, lo que permite probar integraciones con `trust-remote-code` en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó ninguna comparación de calidad médica entre BF16 y NVFP4, y que las puntuaciones del modelo original no deben atribuirse a esta cuantización.

## Requisitos de hardware

- VRAM estimada: 20,08 GiB para el checkpoint empaquetado; hay que sumar caché KV, activaciones y espacio de trabajo del motor. En el ejemplo probado se reserva `--kv-cache-memory-bytes 536870912` (512 MiB) y `--gpu-memory-utilization 0.3`.
- GPU recomendadas: NVIDIA Blackwell, concretamente DGX Spark (GB10) con vLLM 0.28.0, Transformers 5.15.1 y compressed-tensors 0.17.0.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras arquitecturas no Blackwell para los kernels NVFP4.
- Despliegue: vLLM 0.28.0 con el adaptador incluido en `model/vllm_adapter` (Dockerfile proporcionado); requiere `--trust-remote-code --dtype bfloat16 --enforce-eager --max-model-len 2048 --max-num-seqs 1 --limit-mm-per-prompt '{"image":1}'`.
- Paralelismo tensorial: no validado.
- Contextos mayores de 2048 tokens: no validados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hulu-Med-32B-NVFP4 (esta ficha) | 19.555.688.048 | no disponible; probado a 2048 | NVFP4 W4A4 | Apache 2.0 | Hugging Face, comunidad |
| Hulu-Med-32B (BF16) | 32B nominales (backbone Qwen2.5-32B) | no disponible | BF16 | Apache 2.0 | Hugging Face, oficial ZJU-AI4H |
| Qwen2.5-32B (backbone) | 32B | no disponible | BF16 y otras | Apache 2.0 | Hugging Face, oficial |

La comparación con alternativas médicas multimodales de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No hay validación clínica: el checkpoint no ha sido validado clínicamente y los chequeos técnicos no establecen equivalencia clínica.
- Sin benchmark de calidad médica BF16 frente a NVFP4: el autor advierte que las puntuaciones del modelo original no deben atribuirse a esta cuantización.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo general de los modelos de lenguaje en dominio médico.
- Idiomas: no se declara cobertura oficial; la calibración usó ejemplos en RU/EN, pero no hay garantía multilingüe.
- Contexto limitado en el runtime probado: 2048 tokens y una sola imagen por prompt.
- Vídeo, 3D, paralelismo tensorial y contextos mayores no fueron validados.
- Requiere código personalizado: es imprescindible instalar el adaptador vLLM incluido; cambiar la arquitectura a un Qwen-VL estándar no está soportado.
- Dependencia de hardware Blackwell para los kernels NVFP4 probados; no se documenta compatibilidad con otras arquitecturas.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la información de uso previsto y limitaciones del modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/ivangalkindeveloper/Hulu-Med-32B-NVFP4
- Modelo base: https://huggingface.co/ZJU-AI4H/Hulu-Med-32B
- Repositorio oficial Hulu-Med: https://github.com/ZJUI-AI4H/Hulu-Med
- Archivos de validación citados en el repo: `quantization.json`, `calibration-manifest.json`, `validation.json`, `tensor-audit.json`, `vision-adapter-equivalence.json`, `MODIFICATIONS.md`, `source-modifications.json`, `LICENSE`, `NOTICE`
