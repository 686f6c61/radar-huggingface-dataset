# axteam/Qwen3.5-9B-FP8-dynamic

## Resumen

`axteam/Qwen3.5-9B-FP8-dynamic` es la cuantización a 8 bits en FP8 dinámico del modelo multimodal `Qwen/Qwen3.5-9B`, publicada por el equipo axteam para servir el modelo con vLLM de forma eficiente. No es un modelo nuevo: es una derivada posentrenamiento (PTQ) que conserva tokenizador, `chat_template` y `generation_config` del original, y cuyo único cambio es la representación numérica de los pesos y activaciones.

El modelo base es un transformer denso de 9.653.104.368 parámetros (unos 9,65 mil millones) con arquitectura híbrida de atención lineal y atención completa, torre de visión (pipeline `image-text-to-text`) y una cabeza de predicción multi-token (MTP). La cuantización deja en BF16 la torre de visión y su proyector, la cabeza MTP, las RMSNorm, los embeddings, la LM head y las partes no lineales del bloque SSM, y aplica FP8 E4M3 al resto de pesos con activaciones dinámicas por token.

Su relevancia práctica es de despliegue: reduce el peso en disco a unos 11,5 GB frente a los aproximadamente 19,3 GB del original en BF16, lo que permite servir un modelo multimodal de 9B en GPUs de 24 GB. La contrapartida medida por el autor es un aumento de perplejidad del 1,1 % y una concordancia top-1 del 95,8 % frente al BF16 en un conjunto interno de 100 prompts en inglés y coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: atención lineal + atención completa, multimodal (torre de visión) con cabeza MTP |
| Parámetros totales | 9.653.104.368 (~9,65 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens según el registro de AETRON; no confirmado en la model card del autor |
| Tipos de cuantización | Solo FP8 dinámico W8A8 (compressed-tensors `FP8_DYNAMIC`); no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No declarados en la model card; AETRON lo describe como multilingüe. Evaluación interna del autor en inglés y coreano |
| Licencia | Apache-2.0 (derivada de `Qwen/Qwen3.5-9B`) |
| Formato de pesos | safetensors con compressed-tensors (FP8 E4M3) y tensores seleccionados en BF16 |

Otros datos: tamaño del repositorio 12,4 GB, peso en disco de los pesos cuantizados ~11,5 GB, creado el 27 de octubre de 2026, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal con capas de atención completa (híbrida), lo que reduce el coste de la caché KV en contextos largos manteniendo la recuperación exacta de la atención completa en parte de las capas. Incluye una torre de visión con su proyector para entrada de imágenes y una cabeza de predicción multi-token (MTP), habitualmente asociada a decodificación especulativa. Es un modelo denso, no un MoE, y no se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Esta variante no se ha reentrenado: es cuantización posentrenamiento (PTQ) sin calibración (escalas de pesos estáticas por canal de salida obtenidas sin datos, activaciones FP8 dinámicas por token). Los tensores que más afectan a la fidelidad se mantienen en BF16: `model.visual.*` (torre de visión y proyector), `mtp.*`, todas las RMSNorm, embeddings de tokens, LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). El `config.json` es el original más un bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno, con `chat_template` idéntico al del modelo original.
- Entrada de imágenes junto a texto (pipeline `image-text-to-text`): descripción de imágenes, VQA y lectura de contenido visual en el contexto de la conversación.
- Razonamiento y código: el registro de AETRON atribuye al modelo base de la generación Qwen3.5 capacidades destacadas en razonamiento, programación y agentes.
- Cabeza MTP (`mtp.*`) conservada en BF16, lo que habilita decodificación especulativa en runtimes que la soporten.
- Multilingüismo: AETRON describe el modelo base como multilingüe; la model card de esta cuantización no enumera idiomas.
- Compatibilidad con vLLM y con el ecosistema compressed-tensors; etiqueta `endpoints_compatible` en HuggingFace.
- No se documentan en la información disponible capacidades de audio, tool calling explícito ni modos de pensamiento (thinking) verificados para esta variante.

## Casos de uso

- Asistente conversacional multimodal en producción: el modelo acepta texto e imágenes y mantiene conversaciones multi-turno con hasta 32K tokens de contexto (según el registro de AETRON), lo que permite adjuntar documentos extensos o varias imágenes en una misma sesión sin truncar el historial.
- Servicio de atención al cliente con capturas de pantalla: el usuario envía una imagen de un error o de una factura y el modelo responde en texto; la torre de visión se mantiene en BF16, lo que evita degradar la percepción visual por la cuantización.
- Extracción de información de documentos escaneados: combinación de OCR implícito y razonamiento sobre el texto extraído, con la ventaja de que el modelo cabe en una GPU de 24 GB y se puede desplegar en una sola máquina sin clúster.
- Despliegue de bajo coste con vLLM: `vllm serve axteam/Qwen3.5-9B-FP8-dynamic` arranca directamente; el formato FP8 W8A8 aprovecha los núcleos FP8 de GPUs Ada Lovelace y Hopper, lo que reduce el coste por token frente al BF16 en el mismo hardware.
- Generación y revisión de código en pipelines internos: el modelo base destaca en programación según AETRON; esta variante permite integrarlo como servicio HTTP en herramientas de CI/CD o revisión de PR sin requerir GPUs de 80 GB.
- Prototipado e investigación sobre cuantización: al publicar métricas de fidelidad (perplejidad y concordancia top-1) y detallar qué tensores quedan en BF16, sirve como referencia reproducible para comparar esquemas FP8 frente al original.
- Retroalimentación visual interactiva: análisis de gráficos, diagramas o capturas de interfaz dentro de una conversación de soporte técnico o de análisis de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de fidelidad frente al modelo BF16 original, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy del BF16 puntuadas bajo cada build:

| Métrica | Este modelo (FP8 dinámico) | Original BF16 |
|---|---|---|
| Perplejidad (menor = más fiel) | 1,4669 | 1,4506 (+1,1 %) |
| Concordancia top-1 del siguiente token | 95,8 % | 99,2 % |

Estas cifras miden fidelidad respecto al modelo base, no calidad absoluta en tareas. No hay comparación pública con otras cuantizaciones (por ejemplo, la de RedHatAI) bajo el mismo arnés.

## Requisitos de hardware

- VRAM estimada para inferencia: ~11,5 GB solo de pesos; con overhead de runtime y caché KV, un despliegue realista en vLLM parte de unos 14-16 GB para contextos moderados. Estimación propia a partir del tamaño de pesos publicado, no un dato oficial.
- Referencia del original en BF16: ~19,3 GB de pesos, lo que obliga a 24 GB de VRAM como mínimo (dato de AETRON).
- GPU de centro de datos: A100 40/80 GB, H100, L40S 48 GB. Las arquitecturas Hopper y Ada Lovelace son las que mejor aprovechan el rendimiento FP8.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 5090 (32 GB); en tarjetas de 16 GB el despliegue es ajustado y depende de la longitud de contexto y del backend.
- Opciones de despliegue: vLLM es la vía recomendada y documentada por el autor. El formato compressed-tensors FP8 no es compatible con llama.cpp u Ollama, y no se publica GGUF, por lo que no hay ruta de CPU/GGUF disponible en esta ficha.
- Muestreo recomendado por el autor (heredado de Qwen): `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-FP8-dynamic | 9,65 B (denso) | 32K (según AETRON) | FP8 dinámico W8A8 | Apache-2.0 | safetensors compressed-tensors | Pública en HF, 0 descargas |
| RedHatAI/Qwen3.5-9B-FP8-dynamic | 9,65 B (denso, mismo base) | 32K (según AETRON) | FP8 dinámico data-free con LLM Compressor | Apache-2.0 | safetensors compressed-tensors | Pública en HF |
| Qwen/Qwen3.5-9B (original) | 9,65 B (denso) | 32K (según AETRON) | BF16 sin cuantizar | Apache-2.0 | safetensors | Pública en HF |

Diferencias relevantes: frente al original, esta variante reduce el peso a casi la mitad a cambio de una pérdida de fidelidad medida del 1,1 % en perplejidad; frente a la build de RedHatAI, el método declarado es equivalente (FP8 dinámico sin calibración) y el detalle diferencial es qué tensores se mantienen en BF16 (visual, MTP, SSM no lineal, embeddings y LM head). No hay datos públicos que permitan comparar la calidad de ambas cuantizaciones entre sí.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: la perplejidad sube un 1,1 % y la concordancia top-1 cae al 95,8 % frente al 99,2 % del BF16; en tareas sensibles a matices (código, matemáticas, extracción de datos) conviene validar contra el original.
- Evaluación limitada: las métricas del autor provienen de 100 prompts internos en inglés y coreano, no de benchmarks estándar ni de una evaluación de visión; el comportamiento en castellano no está medido.
- Idiomas no declarados: la model card no enumera idiomas soportados y el `chat_template` no se ha verificado en esta ficha; el rendimiento multilingüe es una afirmación de terceros (AETRON), no del autor de la cuantización.
- Modelo sin tracción ni auditoría: 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (27 de octubre de 2026) sin revisión independiente.
- Compatibilidad restringida: al ser compressed-tensors FP8, no funciona en llama.cpp, Ollama ni en backends sin soporte de FP8/compressed-tensors; la ruta práctica es vLLM.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de veracidad ni de tasas de alucinación para esta variante.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los sesgos del modelo base se heredan sin mitigación adicional.
- Licencia: Apache-2.0 permite uso comercial, pero los derechos sobre pesos originales, tokenizador y `chat_template` son del equipo Qwen; conviene conservar los avisos de atribución al redistribuir.
- La cabeza MTP y la torre de visión quedan en BF16, lo que hace que el repositorio (12,4 GB) sea mayor que el peso puramente FP8 y que el consumo de VRAM no sea exactamente la mitad del BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-9B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Registro de AETRON (ficha del modelo base y contexto): https://app.aetron.io/en/registry/qwen3.5-9b-fp8
- Cuantización equivalente de RedHatAI: https://huggingface.co/RedHatAI/Qwen3.5-9B-FP8-dynamic
- Ficha de ThinkLLM: https://thinkllm.dev/models/qwen3-5-9b-fp8-dynamic
- Ficha de ModelsLab: https://modelslab.com/qwen35-9b-fp8
