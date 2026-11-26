# mel-bw/Inkling-2-Small-EXL3-3.17bpw

## Resumen

Inkling-2-Small-EXL3-3.17bpw es una cuantización de precisión reducida del modelo multimodal thinkingmachines/Inkling-2-Small, publicada por el usuario mel-bw. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con capacidad image-text-to-text, es decir, acepta entradas de imagen y texto y genera respuestas conversacionales. El checkpoint original ha sido recuantizado con el algoritmo EXL3 (trellis quantization) sobre los expertos enrutados, manteniendo el resto de componentes (atención, router, embeddings, codificador de visión y drafter DSpark/MTP) sin cambios respecto al modelo padre.

El interés de esta ficha radica en que demuestra cómo llevar un modelo MoE de gran tamano (123.555.115.008 parámetros totales) a un despliegue práctico sobre hardware profesional de gama alta pero no de centro de datos: tres NVIDIA RTX PRO 6000 Blackwell de 96 GB en paralelo tensorial 3, con una ventana de contexto de hasta 1.000.000 de tokens. El resultado ocupa 250,6 GB en disco y conserva una fidelidad muy alta respecto al checkpoint NVFP4 original (un incremento de perplejidad del 0,76 % y una coincidencia top-1 del 97,13 % en el panel de evaluación).

La relevancia actual es doble: por un lado, valida que la cuantización EXL3 a ~3,17 bits por peso en los expertos es viable sin degradación apreciable; por otro, documenta un stack de inferencia completo (vLLM parcheado con kernels de ExLlamaV3, decodificación especulativa DSpark y caché KV en FP8) que sirve una API compatible con OpenAI. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal image-text-to-text, basada en transformer con router y drafter DSpark/MTP |
| Parametros totales | 123.555.115.008 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.000.000 tokens (FP8 KV cache); 850.000 tokens con BF16 KV cache |
| Tipos de cuantizacion | EXL3 trellis quantization, codebook `mul1`, output scales; 3 bpw en capas 0–39 y 4 bpw en capas 40–47 (media de 3,17 bpw en expertos); resto de componentes sin cuantizar respecto al padre |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint EXL3, no cargable en vLLM, SGLang, Transformers ni ExLlamaV3 estándar) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de Thinking Machines con 48 cabezas de consulta y 8 cabezas KV, layout que se conserva intacto en esta cuantización. La atención, el router, los embeddings, el codificador de visión y el drafter DSpark/MTP mantienen los pesos del checkpoint padre; solo los expertos enrutados han sido recuantizados. La recuantización partió de la release NVFP4: los expertos se dequantizaron y luego se volvieron a cuantizar con EXL3, de modo que la comparación de calidad aísla el efecto de la cuantización de expertos.

La calibración empleó 512.000 tokens (250 filas de 2.048 tokens) extraídos del mix por defecto de exllamav3, que combina texto web, código, contenido multilingüe, material técnico, wiki y tokens aleatorios, propagados capa a capa a través del modelo padre. Las proyecciones gate/up de cada capa comparten una única Hessiana de entrada, mientras que la proyección down de cada experto dispone de su propia Hessiana calculada sobre todos los tokens de calibración. El checkpoint incorpora decodificación especulativa DSpark (drafter MTP) y admite caché KV en FP8 o BF16.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1.000.000 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el codificador de visión se mantiene del modelo padre.
- Razonamiento y respuesta en formato conversacional (tag `conversational`).
- Decodificación especulativa mediante el drafter DSpark/MTP integrado, con verificación de 3 borradores por paso en flujo único y 2 por petición en modo multi-petición.
- Servicio mediante API compatible con OpenAI en el puerto 8300, bajo el nombre `Inkling-2-Small`.
- Soporte de prefix caching en el runtime de referencia.
- Capacidades de tool calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos técnicos extensos: con hasta 1.000.000 tokens de contexto y caché KV en FP8, el modelo puede ingerir manuales completos, bases de código o expedientes y responder preguntas sobre ellos sin truncar el material. El panel de evaluación con documentación de vLLM y módulos de la librería estándar de CPython sugiere un rendimiento sólido en este dominio.
- Asistencia sobre código en producción: el NLL medido en el panel de código (0,3610) y la coincidencia top-1 del 97,47 % indican que la cuantización preserva bien la distribución del modelo padre en este tipo de contenido, lo que lo hace apto para revisión y generación de código en pipelines internos.
- Despliegue on-premise con API compatible con OpenAI: el contenedor `ghcr.io/meldavy/inkling2-small-sm120-tp3` expone un endpoint estándar, de modo que aplicaciones existentes pueden apuntar a él cambiando la URL base, sin reescribir la integración.
- Procesamiento multimodal de capturas y diagramas: al conservar el codificador de visión del padre, puede recibir pares imagen-texto para tareas de descripción, extracción de información o respuesta a preguntas sobre figuras técnicas.
- Laboratorio de inferencia local de alta gama: sirve para evaluar modelos MoE de gran tamano en hardware de 3× RTX PRO 6000 Blackwell, con throughput medido de ~5.400–5.500 tok/s en prefill y ~105 tok/s en decode, útil para prototipado de agentes y aplicaciones interactivas.
- Investigación sobre cuantización: el checkpoint y su panel de evaluación (KL, NLL, coincidencia top-1) constituyen una referencia reproducible para estudiar el impacto de EXL3 a ~3,17 bpw frente a NVFP4 en modelos MoE multimodales.

## Benchmarks y rendimiento

Evaluación de fidelidad frente al checkpoint NVFP4 (log-probabilidades de prompt sobre 16 ventanas de 1.024 tokens, 16.368 posiciones puntuadas; KL sobre el vocabulario completo, KL(NVFP4 ‖ EXL3)):

| Panel | NLL, NVFP4 | NLL, este modelo | Δ NLL | KL media | Coincidencia top-1 |
|---|---|---|---|---|---|
| Prosa (8.184 posiciones) | 1,0366 | 1,0400 | +0,0034 | 0,0100 | 96,80 % |
| Código (8.184 posiciones) | 0,3493 | 0,3610 | +0,0118 | 0,0172 | 97,47 % |
| **Total (16.368 posiciones)** | **0,6929** | **0,7005** | **+0,0076** | **0,0136** | **97,13 %** |

El incremento de +0,0076 en NLL equivale a un aumento del 0,76 % en perplejidad.

Rendimiento medido en 3× RTX PRO 6000 Blackwell Max-Q (límite de 250 W por GPU), TP3, caché KV en FP8, contexto de 1.000.000 tokens, prefix caching activo, flujo único y sin decodificación especulativa:

| Métrica | Valor |
|---|---|
| Prefill, prompt de 8k | ~5.400 tok/s |
| Prefill, prompt de 32k | ~5.500 tok/s |
| Decode | ~105 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 250,6 GB en disco; el despliegue de referencia reserva el 98 % de la memoria de 3× RTX PRO 6000 Blackwell (96 GB cada una, 288 GB en total) para sostener un contexto de 1.000.000 tokens con caché KV en FP8.
- GPU recomendadas: 3× NVIDIA RTX PRO 6000 Blackwell (configuración probada). Los kernels EXL3 funcionan en NVIDIA Ampere (SM80) y posteriores, pero solo se ha validado la configuración SM120 con TP3.
- Cabe en GPU de consumo: no. El tamano del checkpoint y la necesidad de paralelismo tensorial lo excluyen de tarjetas como RTX 4090 o RTX 5090.
- Paralelismo: el layout de 48 cabezas de consulta y 8 cabezas KV divide de forma exacta en TP 1, 2, 4 y 8; TP 3 funciona mediante padding en tiempo de carga a 54/9 cabezas (las cabezas añadidas son inertes y no alteran la salida).
- Opciones de despliegue: no es un checkpoint drop-in. Requiere vLLM parcheado con kernels de ExLlamaV3; no carga en vLLM estándar, SGLang, Transformers ni el servidor estándar de ExLlamaV3. Se proporciona una imagen Docker (`linux/amd64` y `linux/arm64`) que requiere driver NVIDIA con soporte CUDA 13.0 (580 o superior) y NVIDIA Container Toolkit.
- Latencia y throughput: ~5.400–5.500 tok/s en prefill y ~105 tok/s en decode en la configuración de referencia sin decodificación especulativa; el modo DSpark añade verificación especulativa de borradores.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-3.17bpw (este) | 123.555.115.008 | hasta 1.000.000 | Apache-2.0 | safetensors EXL3, vLLM parcheado | 250,6 GB; 3× RTX PRO 6000; Δ NLL +0,0076 frente a NVFP4 |
| thinkingmachines/Inkling-2-Small (NVFP4) | 123.555.115.008 | no disponible | Apache-2.0 | NVFP4 | Modelo padre; referencia de calidad en el panel de evaluación |
| diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 | no disponible | no disponible | no disponible | EXL3, 3 bpw | Receta de kernel de prefill MoE EXL3 citada como crédito; parámetros y contexto no disponibles |

No se dispone de datos de benchmarks estándar para establecer una comparación de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un checkpoint drop-in: no carga en vLLM estándar, SGLang, Transformers ni el servidor estándar de ExLlamaV3; requiere el runtime parcheado y la imagen Docker del repositorio meldavy/inkling2-small-sm120-tp3.
- Solo se ha probado la configuración de 3× RTX PRO 6000 Blackwell (SM120) con TP3; otros layouts de paralelismo y otras generaciones de GPU no están validados, aunque los kernels EXL3 operen en SM80 y posteriores.
- La cuantización introduce una degradación medible: +0,76 % de perplejidad y 97,13 % de coincidencia top-1 frente al padre NVFP4; el efecto es mayor en código (Δ NLL +0,0118) que en prosa (Δ NLL +0,0034).
- El contexto de 1.000.000 tokens exige caché KV en FP8; con BF16 el máximo práctico baja a 850.000 tokens en la misma configuración.
- El host necesita driver NVIDIA 580 o superior con soporte CUDA 13.0 y NVIDIA Container Toolkit; no funciona en entornos sin GPU NVIDIA.
- Sesgos conocidos, riesgo de alucinación e idiomas soportados: no disponibles en la información proporcionada.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y de los componentes de terceros (kernels EXL3, vLLM parcheado) antes de desplegar en producción.
- El modelo tiene 280 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mel-bw/Inkling-2-Small-EXL3-3.17bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Organización Thinking Machines: https://huggingface.co/thinkingmachines
- Runtime y documentación (parches, build, Docker): https://github.com/meldavy/inkling2-small-sm120-tp3
- Sección Docker del runtime: https://github.com/meldavy/inkling2-small-sm120-tp3#docker
- Sección de rendimiento del runtime: https://github.com/meldavy/inkling2-small-sm120-tp3#performance-no-speculative-decoding-see-dspark
- Imagen Docker: https://github.com/meldavy/inkling2-small-sm120-tp3/pkgs/container/inkling2-small-sm120-tp3
- EXL3 / exllamav3: https://github.com/turboderp-org/exllamav3
- Mix de calibración por defecto de exllamav3: https://github.com/turboderp-org/exllamav3/tree/master/exllamav3/conversion/standard_cal_data
- Receta EXL3 de DeepSeek-V4.1-Flash (diffbot): https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Soporte de Inkling 2 en vLLM (PR #67325): https://github.com/vllm-project/vllm/pull/67325
- Fallbacks de atención Triton para Inkling en SM12x (PR #51560): https://github.com/vllm-project/vllm/pull/51560
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
