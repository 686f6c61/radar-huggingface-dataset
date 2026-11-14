# AMINOXDEV/gemma-4-12B-it-ONNX

## Resumen

Gemma 4 12B IT ONNX q4f16 es una exportación no oficial del decodificador de texto del modelo google/gemma-4-12B-it, publicada por el usuario AMINOXDEV (Amin Tahtah Toumi) en Hugging Face. Su objetivo es permitir la ejecución del modelo directamente en el navegador mediante Transformers.js v4 y WebGPU, sin necesidad de servidores ni infraestructura de inferencia dedicada. Para ello, el autor ha convertido los pesos originales a formato ONNX, ha cuantizado las capas lineales y la tabla de embeddings a 4 bits y ha eliminado las torres de visión y audio del modelo original.

El resultado es un artefacto de aproximadamente 7,5 GB (unos 7,1 GB de descarga efectiva) que cabe en GPUs de consumo con alrededor de 10 GB de memoria libre. El modelo conserva la arquitectura transformer de 48 capas del Gemma 4 12B original, con atención de ventana deslizante en parte de las capas y atención global en el resto, y mantiene el tokenizador, la plantilla de chat y la configuración de generación del repositorio original.

La relevancia de esta ficha radica en que demuestra un flujo de trabajo completo de exportación y verificación de paridad numérica para modelos de gran tamaño en el navegador: el autor documenta una comparación paso a paso contra los pesos originales en bf16 y contra los mismos pesos cuantizados en PyTorch, con criterios de aceptación explícitos. Es, por tanto, un caso útil tanto para desarrolladores que quieran desplegar LLMs en cliente como para investigadores interesados en metodologías de validación de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), 48 capas, atención híbrida: ventana deslizante (1.024 posiciones de caché) y capas globales; exportado a ONNX |
| Parametros totales | No disponible (el modelo base es Gemma 4 12B; el autor no detalla el recuento exacto en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; las capas de ventana deslizante conservan las últimas 1.024 posiciones y las globales conservan todo el contexto |
| Tipos de cuantizacion | q4f16: capas lineales en 4 bits (MatMulNBits, bloque 32, asimétrico con zero points, escalas fp16, round-to-nearest); activaciones, atención y KV cache en float16; RMSNorm, residual y softmax en float32 |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`; prompts de verificación en español e inglés) |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | ONNX (archivos `.onnx` con datos externos `.onnx_data`, todos menores de 2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Gemma 4 12B IT de Google: un transformer decoder-only de 48 capas con atención híbrida, en el que algunas capas emplean ventana deslizante y otras atención global. La exportación a ONNX reproduce esta estructura nodo a nodo mediante el script `tools/gemma4/export.py`, que lee los tensores safetensors originales con peticiones HTTP por rangos y sigue la implementación de referencia de `transformers` 5.23 (`modeling_gemma4_unified.py`). La tabla de embeddings se exporta como un `GatherBlockQuantized` de 4 bits con escalado por √hidden, y la cabeza LM atada se divide en cuatro fragmentos de como máximo 130 MB para no superar los límites de búfer de GPU en WebGPU.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada; esos detalles corresponden a la model card oficial de google/gemma-4-12B-it. La innovación técnica destacable de esta exportación es la metodología de verificación: el script `verify.py` ejecuta decodificación greedy sobre el modelo ONNX y compara cada token generado con los módulos PyTorch oficiales mediante teacher forcing, tanto contra los pesos bf16 originales como contra los mismos pesos tras la cuantización de 4 bits. Sobre 6 prompts en español e inglés y 274 pasos greedy, se obtiene un 97,8 % de coincidencia con los mismos pesos q4 en PyTorch (todas las discrepancias son casi empates con margen top-1/top-2 inferior a 0,7 logits) y un 92,3 % de coincidencia con los pesos bf16 originales.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`chat_template.jinja` incluida).
- Razonamiento y respuesta a prompts de tipo reasoning (verificados con prompts `es-reason` y `en-reason`).
- Generación de código (verificada con prompts `es-code` y `en-code`).
- Soporte multilingüe, con verificación explícita en español e inglés.
- Ejecución en navegador mediante Transformers.js v4 y WebGPU con shaders de fp16.
- Inferencia con caché KV, incluyendo gestión diferenciada de capas de ventana deslizante y capas globales.
- No incluye visión ni audio: las torres correspondientes fueron eliminadas en la exportación.
- No se documenta soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Chat en el navegador sin backend: el modelo puede integrarse en una aplicación web que use Transformers.js y WebGPU para ofrecer conversación multi-turno directamente en el cliente, eliminando costes de servidor y manteniendo la privacidad de los datos del usuario, ya que la inferencia ocurre en su GPU.
- Demostraciones interactivas y portales de pruebas: adecuado para sitios que quieran mostrar las capacidades de un LLM de 12B sin desplegar infraestructura, como el propio WebGPU Chat del autor, donde este modelo alimenta la opción "Maximum".
- Asistentes de código en el editor: con prompts de generación de código verificados en español e inglés, puede usarse en extensiones de navegador o editores basados en web para autocompletado y explicación de fragmentos, aceptando la ligera pérdida de precisión de la cuantización de 4 bits.
- Procesamiento de texto con requisitos de soberanía de datos: sectores como sanidad, legal o administración pública pueden ejecutar el modelo en el dispositivo del usuario, evitando enviar información sensible a servidores externos.
- Investigación sobre cuantización y paridad numérica: el repositorio incluye scripts de exportación y verificación reutilizables, lo que lo convierte en una referencia práctica para estudiar el impacto de la cuantización 4 bits en la fidelidad de la generación token a token.
- Educación y experimentación con LLMs: estudiantes e investigadores pueden ejecutar un modelo de 12B en portátiles con GPU de consumo, explorando prompts de razonamiento y código sin depender de APIs de pago.
- Aplicaciones offline o de baja conectividad: una vez descargados los aproximadamente 7,1 GB, el modelo puede cachearse en el navegador y funcionar sin conexión, útil en entornos con red limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí documenta una verificación de paridad numérica frente a los pesos originales:

| Prompt | Pasos | Coincidencia con bf16 original | Prefijo greedy idéntico | Coincidencia con mismos pesos q4 | Prefijo greedy idéntico | Márgenes de discrepancia (q4) |
|---|---|---|---|---|---|---|
| es-chat | 48 | 91,7 % | 10 | 100,0 % | 48 | — |
| en-chat | 34 | 82,3 % | 21 | 94,1 % | 24 | 0,68; 0,279 |
| es-code | 48 | 95,8 % | 0 | 97,9 % | 15 | 0,454 |
| en-code | 48 | 93,8 % | 8 | 95,8 % | 34 | 0,187; 0,101 |
| es-reason | 48 | 89,6 % | 0 | 97,9 % | 1 | 0,057 |
| en-reason | 48 | 97,9 % | 32 | 100,0 % | 48 | — |

Criterios de aceptación declarados por el autor: coincidencia con los mismos pesos q4 en PyTorch ≥ 97 % y márgenes < 1,0 (resultado: 97,8 %, cumple); coincidencia con bf16 original ≥ 90 % (resultado: 92,3 %, cumple).

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB de memoria libre en GPU, según indica el autor.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y shaders `shader-f16`; el autor no especifica modelos concretos, pero el requisito de 10 GB encaja con GPUs de gama alta de consumo y profesionales.
- GPU de consumo: cabe en tarjetas con al menos 10-12 GB de VRAM efectiva; no se detalla una lista de modelos compatibles.
- Opciones de despliegue: Transformers.js v4.3.2 o superior con WebGPU (uso previsto); al ser ONNX, podría ejecutarse con otros runtimes ONNX, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad de generación.
- Almacenamiento: descarga total de aproximadamente 7,1 GB, con archivos de datos externos individuales menores de 2 GB.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparativa cuantitativa con alternativas. A continuación se comparan únicamente los atributos conocidos:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMINOXDEV/gemma-4-12B-it-ONNX | No disponible (base de 12B) | Ventana deslizante de 1.024 en capas locales; global sin límite explícito | ONNX q4f16 | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-12B-it | 12B (según nombre) | No disponible en esta información | Safetensors (bf16) | Apache 2.0 | Hugging Face, modelo oficial |
| Alternativas de 12B en navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La cuantización de 4 bits reduce la precisión respecto al modelo original: la coincidencia con bf16 es del 92,3 % en la verificación del autor, con casos como `en-chat` que bajan al 82,3 %.
- Solo texto: las torres de visión y audio fueron eliminadas, por lo que no admite entradas de imagen ni audio pese a que el modelo base las soporte.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje; el autor remite a la model card original para las limitaciones de uso previsto.
- No es una versión oficial de Google; es una modificación de terceros sujeta a Apache 2.0, con aviso de copyright de Google LLC y atribución de las modificaciones a Amin Tahtah Toumi.
- Requiere Transformers.js ≥ 4.3.2, WebGPU y soporte de `shader-f16`; no funcionará en navegadores o GPUs sin estas capacidades.
- El requisito de aproximadamente 10 GB de VRAM limita su uso a equipos con GPU dedicada de gama alta; no es viable en la mayoría de portátiles integrados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta aún con validación de la comunidad.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMINOXDEV/gemma-4-12B-it-ONNX
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Transformers.js: https://github.com/huggingface/transformers.js
- WebGPU Chat (demo que usa este modelo): https://llm.aminox.dev
- Scripts de exportación y verificación: https://github.com/amintikk/webgpu-chat/tree/main/tools/gemma4
- Resultados de paridad: https://github.com/amintikk/webgpu-chat/blob/main/results/gemma4/parity.json
