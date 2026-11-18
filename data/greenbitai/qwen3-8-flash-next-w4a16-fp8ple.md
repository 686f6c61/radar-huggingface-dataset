# GreenBitAI/Qwen3.8-Flash-Next-W4A16-FP8PLE

## Resumen

Qwen3.8-Flash-Next-W4A16-FP8PLE es una compilación cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por GreenBitAI. Se trata de una versión empaquetada específicamente para servirse con gbx-dc, el servidor de inferencia de GreenBitAI orientado a despliegues en centros de datos. La cuantización, el tokenizer, la plantilla de chat y la licencia se mantienen sin cambios respecto al modelo original.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 75.247.386.516 parámetros totales y una ventana de contexto de 131.072 tokens. Los pesos están cuantizados a 4 bits con tamaño de grupo 128 y esquema simétrico, empaquetados en formato `compressed-tensors` pack-quantized, mientras que las activaciones se mantienen en 16 bits. Incluye además una tabla de n-gramas en FP8 (e4m3) con una escala global única y un bloque de predicción multi-token (MTP) que puede emplearse como modelo borrador para decodificación especulativa.

Su relevancia radica en que permite desplegar un modelo MoE de gran tamaño con requisitos de memoria reducidos (el repositorio ocupa 129,6 GB) sobre infraestructura estándar, manteniendo la compatibilidad con runtimes conscientes de `compressed-tensors` como vLLM, y exponiendo tres protocolos de API (OpenAI, Codex y Claude Code) sobre un mismo puerto a través de gbx-dc.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; identificador de arquitectura `qwen4_exp` |
| Parámetros totales | 75.247.386.516 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Pesos 4 bits (grupo 128, simétrico, `compressed-tensors` pack-quantized); activaciones 16 bits; tabla de n-gramas FP8 e4m3 con escala global única; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors (cinco shards de pesos, `model_mtp.safetensors`, índice, tokenizer, `chat_template.jinja`, `config.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) identificado en el ecosistema de Qwen como `qwen4_exp`. La compilación cuantizada conserva la arquitectura del original y añade un bloque de predicción multi-token (MTP) almacenado en `model_mtp.safetensors`, que un stack de serving puede utilizar como modelo borrador para decodificación especulativa; este bloque no es necesario para ejecutar el modelo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica destacable de esta compilación es la cuantización W4A16 con tabla de n-gramas en FP8: los parámetros de cuantización se declaran en `config.json` bajo `quantization_config`, de modo que un runtime compatible con `compressed-tensors` los lee directamente sin paso de conversión. El repositorio también carga en builds de vLLM que soporten pesos pack-quantized de `compressed-tensors` junto con la arquitectura `qwen4_exp`.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado `text-generation`.
- Arquitectura MoE de 75.247 millones de parámetros totales con ventana de contexto de 131.072 tokens.
- Decodificación especulativa mediante el bloque MTP incluido en `model_mtp.safetensors`.
- Servicio a través de tres protocolos sobre un mismo puerto: `/v1/chat/completions` (compatible con OpenAI SDK, LangChain y la mayoría de herramientas), `/v1/responses` (Codex) y `/v1/messages` (Claude Code).
- Integración con agentes de programación: la model card documenta la configuración de Claude Code mediante variables de entorno (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`) y de Codex apuntando a `http://127.0.0.1:8000/v1`.
- Compatibilidad con vLLM en builds que soporten `compressed-tensors` pack-quantized y la arquitectura `qwen4_exp`.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Despliegue de inferencia en centro de datos con gbx-dc: el modelo se sirve seleccionando un preset validado (`gbx-dc serve --preset <nombre> --port 8000`), lo que evita el ajuste manual de parámetros y aprovecha la cuantización W4A16 para reducir la huella de memoria frente al modelo en BF16.
- Sustitución de APIs alojadas en herramientas existentes: al exponer `/v1/chat/completions`, cualquier cliente construido sobre el OpenAI SDK o LangChain puede apuntarse al servidor propio cambiando únicamente `base_url`, sin reescribir la integración.
- Agentes de programación autohospedados: la compatibilidad con `/v1/messages` (Claude Code) y `/v1/responses` (Codex) permite ejecutar estos agentes contra infraestructura propia; hay que asegurarse de que todos los nombres de modelo configurados en sus ajustes (incluido el modelo pequeño de trabajo en segundo plano) estén siendo servidos.
- Generación de texto con contexto largo: los 131.072 tokens de ventana permiten procesar documentos extensos, conversaciones prolongadas o bases de código completas en una sola petición.
- Aceleración de la inferencia mediante decodificación especulativa: el bloque MTP de `model_mtp.safetensors` puede cargarse como modelo borrador en el stack de serving para reducir la latencia de generación.
- Evaluación de modelos MoE cuantizados en investigación: la declaración explícita de `quantization_config` en `config.json` facilita reproducir experimentos de cuantización W4A16 con runtimes compatibles con `compressed-tensors`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 129,6 GB, por lo que el despliegue requiere un nodo con memoria agregada igual o superior a esa cifra, repartida entre GPUs o entre GPU y memoria del sistema según el runtime.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (129,6 GB) excede la VRAM de cualquier GPU de consumo individual actual, por lo que se requiere despliegue multi-GPU o con offloading.
- Opciones de despliegue: gbx-dc (servidor de GreenBitAI, con presets validados) y builds de vLLM que soporten pesos `compressed-tensors` pack-quantized junto con la arquitectura `qwen4_exp`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GreenBitAI/Qwen3.8-Flash-Next-W4A16-FP8PLE | 75.247.386.516 | 131.072 tokens | W4A16, `compressed-tensors` pack-quantized, tabla n-gramas FP8 | Qwen Community License 1.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | BF16 (presumiblemente, no confirmado) | Qwen Community License 1.0 | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; se remite a la model card del modelo original para su uso previsto y limitaciones.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo habitual de los modelos generativos de texto.
- Limitaciones de contexto o idioma: el contexto está acotado a 131.072 tokens; los idiomas soportados no están declarados.
- Restricciones de licencia: Qwen Community License 1.0, publicada con el modelo original; debe revisarse el texto en `LICENSE` antes de cualquier uso comercial.
- Dependencia de runtime: el modelo está empaquetado para gbx-dc y requiere un runtime consciente de `compressed-tensors` (o un build de vLLM con soporte de `qwen4_exp` y pesos pack-quantized); no es un checkpoint genérico cargable en cualquier framework.
- Los agentes de programación compatibles (Claude Code, Codex) solicitan además un modelo pequeño para trabajo en segundo plano, por lo que todos los nombres de modelo configurados deben estar siendo servidos.
- El bloque MTP es opcional para la ejecución; su omisión no impide el funcionamiento del modelo, pero desactiva la decodificación especulativa.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GreenBitAI/Qwen3.8-Flash-Next-W4A16-FP8PLE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (archivo en el repositorio): `LICENSE`
