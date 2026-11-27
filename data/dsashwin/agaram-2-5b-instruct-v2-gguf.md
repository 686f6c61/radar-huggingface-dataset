# dsashwin/agaram-2.5b-instruct-v2-gguf

## Resumen

Agaram 2.5B Instruct v2 — GGUF es la distribución cuantizada en formato GGUF del modelo `dsashwin/agaram-2.5b-instruct-v2`, un ajuste fino supervisado (SFT) más GRPO sobre el modelo base `murai-labs/agaram-2.5b-instruct`. Se trata de un transformer decoder-only de tipo `LlamaForCausalLM` con 2.525.757.696 parámetros, plantilla ChatML y una ventana de contexto de 8.192 tokens. Su especialización principal es el tool calling y el seguimiento de instrucciones en tamil y tanglish (tamil transliterado al alfabeto latino), manteniendo un comportamiento bilingüe tamil-inglés sin regresiones.

El modelo resuelve un nicho concreto: aplicaciones conversacionales y agentes que necesitan invocar funciones en tamil con esquemas JSON, algo poco cubierto por los modelos generalistas. El autor ha publicado dos cuantizaciones (Q8_0 y Q4_K_M) verificadas contra el modelo BF16 de referencia mediante una batería de 9 escenarios en CPU, con paridad de tokenización del 100% frente al tokenizador de Hugging Face en 278 casos de prueba.

La relevancia actual radica en que demuestra que un modelo de 2,5B puede ejecutarse en hardware de consumo (1,56 GB en Q4_K_M) conservando capacidades estructuradas de tool calling en un idioma de bajos recursos, gracias a un pre-tokenizador adaptado (`qwen35`) que mantiene unidos los signos vocálicos tamil a sus consonantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`), 28 bloques, dim. de embedding 2304, 36 cabezas de atención, FFN 9216 |
| Parámetros totales | 2.525.757.696 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (`rope.freq_base = 500000.0`) |
| Tipos de cuantización | Q8_0 (2,69 GB) y Q4_K_M (1,56 GB); origen F16 GGUF |
| Idiomas soportados | Tamil (ta) e inglés (en); incluye tanglish |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors BF16 fusionados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Llama, con 28 capas, dimensión de embedding de 2304, 36 cabezas de atención y dimensión de feed-forward de 9216. Usa RoPE con `freq_base` de 500000.0 y plantilla de chat ChatML, con `<|im_end|>` (id 2) como token de parada y `add_bos_token` desactivado. El tokenizador es un BPE a nivel de byte con el patrón de split de Qwen2 extendido con marcas combinantes Unicode (`\p{M}`) y joiners de ancho cero, de modo que los signos vocálicos tamil permanecen adheridos a sus consonantes; en GGUF se declara como pre-tokenizador `qwen35`.

El entrenamiento parte de `murai-labs/agaram-2.5b-instruct` (Murai Labs y Ramchand Kumaresan, arXiv:2610.18420) y aplica una fase de post-entrenamiento con SFT más GRPO, incluyendo datos sintéticos de seguimiento de instrucciones en tamil y de restricción de tool calling generados con DeepSeek V4.1 Flash. La conversión a GGUF se realizó con `llama.cpp` b12816 (`convert_hf_to_gguf.py`) y la cuantización con `llama-quantize` b9002 sobre CPU (Intel Core i9-13900H). Se verificó la paridad de token-IDs contra el tokenizador de Hugging Face en 278 de 278 casos (100%) sobre 109 prompts ChatML con esquemas de herramientas y 169 textos en tamil, tanglish e inglés.

## Capacidades

- Generación de texto conversacional multi-turno en tamil, tanglish e inglés con plantilla ChatML.
- Tool calling y function calling con esquemas JSON, incluyendo aclaración de argumentos faltantes.
- Seguimiento de instrucciones en tamil con restricciones de formato estrictas (por ejemplo, JSON puro o iniciadores de párrafo concretos).
- Traducción bilingüe tamil-inglés sin regresiones respecto al modelo base.
- Razonamiento de un solo paso orientado a la selección y parametrización de herramientas.
- Modo de decodificación greedy recomendado (`--temp 0`) para reproducibilidad en producción.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode) según la información disponible.

## Casos de uso

- Reserva de transporte en tamil: el modelo gestiona diálogos de reserva de autobús con argumentos estructurados (origen, destino, fecha), como demuestra el escenario S1 de la evaluación local, donde Q8_0 conserva el argumento `"date"` que Q4_K_M pierde.
- Agendamiento de citas médicas en tanglish: útil para usuarios que mezclan tamil transliterado e inglés; el escenario S2 obtuvo coincidencia exacta carácter por carácter con el BF16 tanto en Q8_0 como en Q4_K_M.
- Asistentes de voz o chat para atención al cliente en tamil: con 8.192 tokens de contexto puede mantener conversaciones multi-turno con historial e invocar funciones de consulta de pedidos o estado de cuenta.
- Generación de JSON estricto para integración con APIs: el escenario S6 (JSON puro) coincide exactamente con BF16 en ambas cuantizaciones, lo que lo hace apto para pipelines que validan la salida con un JSON Schema.
- Clarificación de argumentos incompletos: el escenario S3 demuestra que el modelo pide los datos que faltan en lugar de inventarlos, comportamiento relevante para agentes que no deben ejecutar acciones con parámetros incompletos.
- Despliegue en dispositivos de bajos recursos: con Q4_K_M (1,56 GB) puede ejecutarse en portátiles sin GPU mediante `llama.cpp` u Ollama, a unas 23,2 tok/s de decodificación en CPU (i9-13900H, 16 hilos).
- Consejo hablado en tamil: el escenario S9 genera respuestas en registro coloquial, aunque Q4_K_M introduce una repetición corta de palabra por deriva de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación disponible es la suite local de 9 escenarios del autor, ejecutada en CPU con decodificación greedy y 512 tokens:

| Configuración | Escenarios superados | Coincidencia exacta con BF16 | Velocidad media de decodificación |
|---|---:|---:|---:|
| BF16 v2 (referencia) | 8 / 9 | — | no disponible |
| Q8_0 | 8 / 9 | 4 / 9 | 14,3 tok/s (9,0 tok/s wall) |
| Q4_K_M | 7 / 9 | 3 / 9 | 23,2 tok/s (12,7 tok/s wall) |

Los fallos observados: Q8_0 emite la palabra prohibida «அரசு» en S5 (mismo fallo que BF16); Q4_K_M omite el argumento `"date"` en S1, pierde el iniciador de segundo párrafo «இறுதியாக» en S5 e introduce una repetición corta en S9.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB para Q4_K_M y 2,7 GB para Q8_0, más overhead del contexto KV cache (8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y quedan sobradamente dimensionadas.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más; también funciona enteramente en CPU.
- Despliegue: `llama.cpp` (build que soporte `qwen35`, verificado en b9002 y b12816), `llama-server`, Ollama (`ollama run hf.co/dsashwin/agaram-2.5b-instruct-v2-gguf:Q8_0`). Es necesario pasar `--jinja` para usar la plantilla de chat y tool calling embebida.
- Latencia y throughput: en CPU i9-13900H con `-ngl 0 -t 16`, Q8_0 alcanza 14,3 tok/s de decodificación (9,0 tok/s wall) y Q4_K_M 23,2 tok/s (12,7 tok/s wall). No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tool calling | Disponibilidad |
|---|---:|---:|---|---|---|---|
| Agaram 2.5B Instruct v2 GGUF | 2,53B | 8.192 | ta, en | Apache 2.0 | Sí (ChatML + jinja) | GGUF en Hugging Face |
| murai-labs/agaram-2.5b-instruct | 2,53B | 8.192 | ta, en | no disponible | Sí | Safetensors y GGUF |
| Qwen2.5 3B Instruct | 3B | 32.768 | multilingüe (incluye ta parcial) | Apache 2.0 | Sí | Múltiples formatos |

La comparación con Qwen2.5 3B se ofrece como referencia de categoría (modelo denso pequeño multilingüe con tool calling); no se dispone de datos de benchmarks comparativos directos entre ambos en la información proporcionada. Frente al modelo base de Murai Labs, la versión v2 añade SFT y GRPO específicos para tool calling y restricción de herramientas en tamil.

## Limitaciones y advertencias

- Ventana de contexto limitada a 8.192 tokens, inferior a la de modelos generalistas contemporáneos.
- Cobertura lingüística restringida a tamil, tanglish e inglés; no se ha evaluado su comportamiento en otras lenguas.
- Riesgo de alucinación y de incumplimiento de restricciones léxicas: el propio BF16 falla el escenario S5 al emitir una palabra prohibida, y las cuantizaciones heredan o amplifican ese fallo.
- Deriva de cuantización documentada en Q4_K_M: pérdida de argumentos en esquemas de tool calling con múltiples parámetros y repeticiones cortas de palabras.
- Requiere una build de `llama.cpp` con soporte del pre-tokenizador `qwen35`; versiones antiguas pueden producir una tokenización incorrecta del tamil.
- Es necesario usar `--jinja` y el token de parada `<|im_end|>` (id 2); sin ellos el tool calling y el corte de generación no funcionan correctamente.
- No se han publicado evaluaciones independientes ni benchmarks estándar; la única evidencia de calidad es la suite local de 9 escenarios del autor.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse las atribuciones del modelo base y las divulgaciones de datos del archivo `NOTICE`.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/dsashwin/agaram-2.5b-instruct-v2-gguf
- Modelo base post-entrenado: https://huggingface.co/dsashwin/agaram-2.5b-instruct-v2
- Modelo upstream de Murai Labs: https://huggingface.co/murai-labs/agaram-2.5b-instruct
- GGUF upstream de Murai Labs: https://huggingface.co/murai-labs/agaram-2.5b-gguf
- Paper de referencia: https://arxiv.org/abs/2610.18420
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
