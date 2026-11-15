# IntezraInc/gemma-4-31B-it-qat-NVFP4

## Resumen
Gemma 4 31B IT (QAT) — NVFP4 es una cuantización de 4 bits (formato NVFP4, esquema W4A4) del checkpoint instruction-tuned `google/gemma-4-31B-it-qat-q4_0-unquantized` de Google DeepMind, publicada por IntezraInc mediante NVIDIA ModelOpt 0.48.0. El punto de partida es un checkpoint ya sometido a Quantization-Aware Training (QAT), lo que significa que los pesos fueron entrenados para tolerar precisión de 4 bits; la cuantización posterior preserva en teoría una calidad cercana a bfloat16 reduciendo de forma drástica los requisitos de memoria. El resultado son aproximadamente 20,1 GiB de pesos más runtime, servibles en una única GPU Blackwell.

El modelo es multimodal de entrada (texto e imagen) y salida de texto, con una ventana de contexto de hasta 262.144 tokens y soporte multilingüe de más de 140 idiomas según la model card de Google. Incluye modos de razonamiento configurables y está pensado para despliegue en producción con vLLM, incluyendo decodificación especulativa mediante multi-token prediction (MTP) con un modelo asistente QAT.

La relevancia actual reside en que permite ejecutar un modelo de la familia Gemma 4 de 31B en GPUs Blackwell con 48 GB o 72 GB de presupuesto de memoria, manteniendo contexto completo de 262K tokens (hasta 635K tokens de caché KV con FP8 en el presupuesto de 72 GB). Es una pieza orientada a inferencia de alto rendimiento, no a investigación de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + torre de visión); familia Gemma 4, variante densa de 31B |
| Parametros totales | 16.629.722.672 (según safetensors del repo); la nomenclatura comercial indica 31B |
| Parametros activos | No aplica (variante densa; el MoE de la familia es 26B A4B) |
| Longitud de contexto | Hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (W4A4), group size 16, escalas de pesos por barrido MSE sobre FP8, activaciones dinámicas; KV cache en FP8; `lm_head`, torre de visión y embedding de visión en alta precisión |
| Idiomas soportados | Más de 140 idiomas según la model card de Google; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento
El modelo base es un transformer multimodal de la familia Gemma 4 en su variante densa de 31B, con decodificador de texto y torre de visión para entrada image-text-to-text. Google indica que la familia combina arquitecturas densas y MoE, con tamaños E2B, E4B, 12B, 26B A4B y 31B; esta ficha corresponde al 31B denso. El contexto alcanza 256K tokens y el soporte multilingüe supera los 140 idiomas. La familia incorpora modos de razonamiento configurables y procesamiento de texto, imagen (con aspecto y resolución variables), vídeo y audio (audio nativo solo en E2B, E4B y 12B).

El checkpoint de partida es un QAT Q4_0 sin cuantizar, extraído del pipeline de Quantization-Aware Training de Google, lo que implica que los pesos ya fueron entrenados para tolerar 4 bits. Intezra aplicó después ModelOpt 0.48.0 para cuantizar a NVFP4 todas las capas lineales del decodificador de texto, atención incluida, con group size 16; las escalas de pesos se eligieron mediante un barrido MSE sobre valores de escala FP8 y las activaciones se cuantizan dinámicamente. Se dejaron en alta precisión `lm_head`, la torre de visión y el embedding de visión. La calibración usó datos públicos: `abisee/cnn_dailymail`, `nvidia/Nemotron-SFT-Multilingual-v1` y `Magpie-Align/Magpie-Pro-MT-300K-v0.1`. El modelo admite decodificación especulativa MTP con el asistente QAT `google/gemma-4-31B-it-qat-q4_0-unquantized-assistant`, con la restricción de que el drafter debe ser también un checkpoint QAT de la misma precisión.

## Capacidades
- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprensión de imágenes con soporte de aspecto y resolución variables (pipeline image-text-to-text).
- Procesamiento de vídeo según la familia Gemma 4; audio nativo solo en E2B, E4B y 12B, no en el 31B.
- Generación de código y tareas de matemáticas, según posicionamiento de la familia.
- Soporte multilingüe en más de 140 idiomas.
- Decodificación especulativa multi-token (MTP) con modelo asistente QAT.
- Servido compatible con la API OpenAI de vLLM, con `--reasoning-parser gemma4`.
- Modo solo texto mediante `--language-model-only`, que ahorra aproximadamente 1,2 GiB.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a sus 262.144 tokens de ventana, manteniendo el historial completo de la sesión sin truncar; el KV cache FP8 permite hasta 635K tokens en un presupuesto de 72 GB.
- Procesamiento de documentos e imágenes: al aceptar image-text-to-text, puede extraer información de capturas, formularios o gráficos junto con el texto asociado en una sola pasada.
- Generación de código en producción: integrable en pipelines de CI/CD mediante el endpoint compatible con OpenAI de vLLM, con throughput medido de 1.462–1.517 tokens/s a 32 usuarios concurrentes en una RTX PRO 6000 Blackwell.
- Razonamiento por lotes con contexto largo: análisis de contratos, informes o bases de código completas usando la ventana de 256K y el modo de razonamiento configurable.
- Despliegue en infraestructura Blackwell de gama media: con 48 GB de presupuesto de memoria cabe una petición de longitud completa (262K) simultánea, lo que permite servir cargas de trabajo de contexto largo en una sola GPU.
- Traducción y asistencia multilingüe: cobertura de más de 140 idiomas para localización de contenido o atención en múltiples lenguas.
- Servicio de inferencia con baja latencia: tiempo medio hasta el primer token de 135 ms con un usuario y 360–405 ms con 32 usuarios, adecuado para interfaces interactivas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no ha ejecutado benchmarks estándar de accuracy sobre este checkpoint y recomienda evaluarlo en las tareas propias antes de confiar en él.

Sí hay datos de rendimiento medidos en una RTX PRO 6000 Blackwell (96 GB), solo texto, KV cache FP8 y MTP activado:

| Métrica | Presupuesto 48 GB | Presupuesto 72 GB |
|---|---|---|
| Pesos + runtime | 20,1 GiB | 20,1 GiB |
| KV cache con límite de 262.144 tokens | 298K tokens | 635K tokens |
| Peticiones de longitud completa (262K) simultáneas | 1,14 | 2,42 |

Throughput con `vllm bench serve` (1.024 tokens de entrada / 256 de salida, presupuesto 48 GB, dos ejecuciones):

| Usuarios concurrentes | 1 | 8 | 32 |
|---|---|---|---|
| Tokens de salida/s | 136–155 | 822–844 | 1.462–1.517 |
| Tiempo medio hasta el primer token | 135 ms | 188 ms | 360–405 ms |

Comparativa de throughput a 32 usuarios bajo las mismas condiciones: `google/gemma-4-31B-it-qat-w4a16-ct` alcanzó 564–643 tokens/s y `RedHatAI/gemma-4-31B-it-NVFP4` 1.024–1.275 tokens/s.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 20,1 GiB de pesos más runtime; el autor emula presupuestos de 48 GB y 72 GB con `--gpu-memory-utilization` (0,45 y 0,675 respectivamente).
- GPU recomendadas: NVIDIA Blackwell, en concreto RTX PRO 6000 Blackwell (96 GB) para las mediciones publicadas; el formato NVFP4 está orientado a esta generación.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el formato NVFP4 y el tamaño de pesos sugieren GPUs Blackwell de gama alta, pero no se confirma compatibilidad con RTX 4090 u otras.
- Opciones de despliegue: vLLM (probado con `vllm/vllm-openai:v0.31.0`), con `--kv-cache-dtype fp8`, `--reasoning-parser gemma4` y configuración especulativa MTP; también cargable con transformers. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 135 ms de TTFT con 1 usuario y 360–405 ms con 32; 136–155 tokens/s con 1 usuario y 1.462–1.517 tokens/s con 32, en el hardware y configuración indicados.
- Ahorro adicional: `--language-model-only` reduce el uso en aproximadamente 1,2 GiB para servicio solo texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Throughput a 32 usuarios | Licencia |
|---|---|---|---|---|---|
| IntezraInc/gemma-4-31B-it-qat-NVFP4 | 16,6B (nominal 31B) | 262.144 tokens | NVFP4 (W4A4), KV FP8 | 1.462–1.517 tokens/s | Apache 2.0 |
| google/gemma-4-31B-it-qat-w4a16-ct | 31B (nominal) | 262.144 tokens | Compressed tensors w4a16 | 564–643 tokens/s | Apache 2.0 |
| RedHatAI/gemma-4-31B-it-NVFP4 | 31B (nominal) | 262.144 tokens | NVFP4 | 1.024–1.275 tokens/s | Apache 2.0 |
| google/gemma-4-31B-it-qat-q4_0-unquantized | 31B (nominal) | 262.144 tokens | Pesos half-precision QAT | No disponible | Apache 2.0 |

Los datos de throughput proceden de las mediciones del propio autor bajo condiciones idénticas (RTX PRO 6000 Blackwell, 48 GB, solo texto, FP8 KV, MTP). No hay datos comparativos de precisión.

## Limitaciones y advertencias
- No se han publicado benchmarks de accuracy para este checkpoint; la cuantización NVFP4 W4A4 puede degradar la calidad respecto al modelo QAT sin cuantizar, y el autor recomienda evaluar en tareas propias.
- La cuantización deja en alta precisión `lm_head`, torre de visión y embedding de visión, pero todas las capas lineales del decodificador de texto, incluida la atención, están en 4 bits, lo que puede afectar a tareas sensibles a precisión numérica.
- El formato NVFP4 está orientado a GPUs Blackwell; no se confirma su funcionamiento en generaciones anteriores.
- El uso de decodificación especulativa MTP exige un asistente QAT de la misma precisión; un drafter no QAT no es compatible.
- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado con datos web, es esperable un sesgo similar al de la familia base, pero no se documenta.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas: se indica soporte de más de 140 idiomas, pero no se detalla la calidad por idioma ni la lista concreta.
- Licencia Apache 2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos específicos de uso comercial y las restricciones de la familia Gemma antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- El autor ha publicado el modelo bajo su propio nombre (IntezraInc) sin que conste una auditoría independiente de la cuantización.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/IntezraInc/gemma-4-31B-it-qat-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Modelo asistente para MTP: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized-assistant
- Colección QAT Q4_0 de Gemma 4: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
