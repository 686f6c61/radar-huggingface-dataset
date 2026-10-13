# halt95/Qwen3.8-27B-W4A16-Merlin

## Resumen

Qwen3.8-27B-W4A16-Merlin es un checkpoint cuantizado a int4 del modelo Qwen/Qwen3.8-27B, publicado por el usuario halt95. No es un modelo entrenado desde cero: es una conversión de pesos orientada a servir el modelo base con su ventana de contexto completa de 262.144 tokens (262K) sobre GPUs de consumo de la generación Ampere, en concreto dos o cuatro RTX 3090. Sobre el checkpoint AWQ ya existente de philbert440, esta revisión añade tres elementos: un `lm_head` int4 GPTQ (grupo 128, asimétrico), una cabeza drafter MTP también en int4 para decodificación especulativa, y escalas de KV-cache FP8 E4M3 calibradas por capa para las capas de atención completa.

El modelo conserva la torre de visión del checkpoint original, por lo que mantiene la modalidad image-text-to-text, y se distribuye en formato compressed-tensors (11 ficheros de checkpoint, unos 17 GB) con licencia Apache-2.0. Su interés práctico es acotado pero concreto: permite ejecutar un modelo de 27.356.728.560 parámetros con contexto de 262K y decodificación especulativa en hardware Ampere (sm_86) de gama alta para consumidor, algo que en bf16 requeriría bastante más VRAM por GPU.

La revisión v1.3.0 sustituye el `tokenizer.json` por el del modelo original de Qwen, corrigiendo un patrón de pre-tokenización sin `\p{M}` que separaba mal las marcas combinantes (hindi, tailandés, árabe y otras escrituras). Para que ese cambio tenga efecto al servir se requiere `transformers==5.18.0`. La versión actual solo está validada en doble y cuádruple RTX 3090; el soporte de una sola tarjeta queda pospuesto a una release posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card menciona "capas de atención completa" y "estado SSM en fp16", lo que apunta a una arquitectura híbrida entre atención y capas SSM/lineales |
| Parametros totales | 27.356.728.560 (≈27,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | int4 AWQ asimétrico con group size 128 (compressed-tensors) en el cuerpo; `lm_head` int4 GPTQ asimétrico (grupo 128); cabeza MTP int4; KV-cache FP8 E4M3 con escalas calibradas por capa |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (checkpoint de ThinkingCap asociado: PolyForm Small Business License 1.0.0 más permiso de uso personal de BottleCap AI) |
| Formato de pesos | safetensors en formato compressed-tensors (11 ficheros de checkpoint, ≈17 GB) |

Datos adicionales: pipeline `image-text-to-text`, librería declarada `vllm`, 156 descargas y 2 likes, creado el 2026-09-27 y actualizado el 2026-10-12.

## Arquitectura y entrenamiento

Se trata de una cuantización, no de un modelo entrenado por el autor de este repositorio. Por tanto no hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO: esos detalles pertenecen al modelo base Qwen/Qwen3.8-27B y no se reproducen en la model card consultada (no disponible). La arquitectura del modelo base tampoco se describe; los únicos indicios técnicos son la referencia a "capas de atención completa" con escalas de KV-cache FP8 calibradas por capa y el uso de "estado SSM en fp16" al servir, lo que sugiere una topología híbrida con capas de estado recurrente y capas de atención completa. La torre de visión se mantiene sin cambios respecto a philbert440/Qwen3.8-27B-W4A16-AWQ.

La innovación técnica del repositorio es de despliegue. Además de la cuantización W4A16 del cuerpo, incorpora una cabeza drafter MTP en int4 que permite ejecutar decodificación especulativa MTP (K=4) íntegramente desde pesos int4, y un `lm_head` int4 GPTQ de grupo 128 asimétrico. El stack de servicio (Merlin engine v2.5.2, basado en vLLM 0.30.0 con commits del fork Flash-Next y una corrección de guarda) aplica once parches (0001-0011) y un tile de verificación FlashInfer de 32 filas, con entorno fijado por hash. La KV-cache se sirve en FP8 y el estado SSM en fp16. Los scripts de servicio emplean una plantilla de chat externa (froggeric's Qwen-Fixed-Chat-Templates v22.5) en lugar de la `chat_template.jinja` del repositorio, salvo que se fuerce lo contrario con `CHAT_TEMPLATE=`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia de la familia Qwen (y plantilla alternativa incluida en el repositorio de servicio).
- Modalidad image-text-to-text: la torre de visión se conserva intacta, por lo que el modelo acepta entradas de imagen junto a texto.
- Contexto largo real de hasta 262.144 tokens, con pools de KV-cache medidos de 826.689 tokens en doble GPU y 1.974.072 en cuádruple GPU.
- Decodificación especulativa MTP con K=4 desde pesos int4 (cabeza drafter propia), pensada para acelerar la decodificación en modo single-stream.
- Modo de razonamiento configurable mediante `reasoning_effort` en `chat_template_kwargs`; el valor por defecto del despliegue es `medium` (`THINKING` en los scripts).
- Multilingüe: los idiomas declarados se limitan a inglés (`en`). La corrección de tokenizador de la v1.3.0 afecta al trato de marcas combinantes en escrituras como hindi, tailandés o árabe, aunque el soporte idiomático declarado no cambia.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente y razonamiento multi-paso: no documentado explícitamente en la información disponible.
- Salida estructurada (JSON) y código: la model card solo menciona que el tokenizador se comporta igual que el original en inglés, código, JSON y CJK; no se detallan capacidades específicas adicionales.

## Casos de uso

- Servicio de un modelo de 27B con contexto de 262K en hardware de consumo: dos o cuatro RTX 3090 permiten atender documentos completos (informes largos, expedientes, libros técnicos) sin truncar, con throughput medido de 144 a 206 tok/s por stream en doble tarjeta según la longitud de contexto.
- Procesamiento documental con imagen y texto: al conservar la torre de visión, se puede usar para extracción de información de documentos escaneados con texto asociado, capturas o diagramas dentro de un mismo prompt.
- Aplicaciones de atención al cliente de contexto muy largo: conversaciones multi-turno con historial extenso e imágenes adjuntas, apoyándose en la ventana de 262K y en la KV-cache FP8 para sostener sesiones largas en memoria.
- Generación de código asistida en local: el modelo se sirve con vLLM y puede integrarse en un endpoint compatible con OpenAI en `127.0.0.1:8100` (nombre de modelo `qwen38-27b`) para editores y asistentes internos, evitando enviar código a APIs externas.
- Investigación sobre decodificación especulativa en Ampere: el checkpoint incluye una cabeza MTP int4 y el repositorio de servicio fija K=4, lo que permite reproducir experimentos de aceleración en sm_86 con métricas publicadas por el autor.
- Banco de pruebas de cuantización int4 a escala 27B: al almacenar las escalas de KV-cache FP8 calibradas por capa, resulta útil para comparar calidad y rendimiento frente al checkpoint AWQ de origen o frente al modelo en bf16.
- Réplica de un stack de inferencia completo con licencia Apache-2.0: al no requerir contenedores y documentar los pasos de instalación en metal desnudo, sirve como base reproducible para entornos internos con requisitos de auditoría.
- Ajuste fino adicional sobre pesos int4 ya convertidos: la existencia de un fine-tune derivado (ThinkingCap) en el mismo formato muestra la viabilidad de servir variantes especializadas sin recomponer el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las únicas cifras de rendimiento publicadas corresponden a throughput de decodificación single-stream en la puerta de release (2026-10-08 a 2026-10-09 UTC), con perfil de envío por defecto, razonamiento activado (effort `low`) y generaciones de 256 tokens, K=4:

| Contexto | Doble RTX 3090 (TP=2) | Cuádruple RTX 3090 (TP=4) |
|---|---|---|
| 4K | 206 tok/s | 258 tok/s |
| 32K | 198 tok/s | 249 tok/s |
| 128K | 172 tok/s | 238 tok/s |
| 255K | 144 tok/s | 226 tok/s |

Pool de KV-cache medido: 826.689 tokens en doble tarjeta (883 bloques, 3,15 × 262.144) y 1.974.072 tokens en cuádruple tarjeta (2.470 bloques, 7,53 × 262.144).

## Requisitos de hardware

- Pesos: ≈17 GB en 11 ficheros safetensors (formato compressed-tensors), más árbol de código y ficheros de configuración.
- GPU: solo sm_86 (Ampere), validado en RTX 3090. El despliegue por defecto usa doble tarjeta con TP=2 o cuádruple con TP=4; una sola tarjeta queda fuera de esta release.
- VRAM: el checkpoint no está pensado para una única GPU de 24 GB en esta versión; el pool de KV reportado por el autor (826.689 tokens en doble tarjeta) se reserva en bytes fijos, por lo que cualquier otra cifra indica una configuración distinta.
- Memoria del sistema: se requieren aproximadamente 2,4 GiB adicionales de RAM de sistema. El stack aplica un parche que mantiene la tabla de embeddings residente en RAM fijada (1,184 GiB por GPU en doble tarjeta, 0,592 GiB en cuádruple) y cede esa VRAM a la KV-cache.
- Software: Linux x86_64, Python 3.13, driver compatible con CUDA 13.0, `nvcc` para el JIT de FlashInfer y `transformers==5.18.0`. Instalación en metal desnudo, sin imagen de contenedor en esta release.
- Red: los scripts de servicio asumen peer-to-peer (P2P) funcional entre GPUs.
- Opciones de despliegue: vLLM 0.30.0 a través del motor Merlin v2.5.2 (repositorio halt95/qwen38-27b-3090s, tag v1.3.0). La model card menciona conversiones a llama.cpp y consumidores directos de `tokenizers` como vías que leen el `tokenizer.json` corregido, pero no se aportan recetas ni garantías para esas rutas. No hay datos sobre TGI, Ollama ni otros motores.
- Throughput medido: 206 / 198 / 172 / 144 tok/s en doble tarjeta y 258 / 249 / 238 / 226 tok/s en cuádruple, para 4K / 32K / 128K / 255K de contexto respectivamente (single-stream, razonamiento activado, K=4).
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| halt95/Qwen3.8-27B-W4A16-Merlin | 27.356.728.560 | 262.144 tokens | compressed-tensors int4 AWQ (grupo 128) + lm_head GPTQ int4 + MTP int4 + KV FP8 | Apache-2.0 | HuggingFace; requiere repositorio de servicio v1.3.0 para el stack validado |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la información consultada (el nombre indica 27B) | no disponible | bf16 (no confirmado en la información consultada) | no disponible en la información consultada | HuggingFace |
| philbert440/Qwen3.8-27B-W4A16-AWQ (base de esta conversión) | no disponible | no disponible | int4 AWQ W4A16 (grupo 128) | no disponible en la información consultada | HuggingFace |
| halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin | mismo formato que este checkpoint | 262.144 tokens | idéntico a este checkpoint, fine-tune ThinkingCap de BottleCap AI | PolyForm Small Business License 1.0.0 + permiso de uso personal de BottleCap AI | HuggingFace; servido por el mismo repositorio con `serve/serve-thinkingcap.sh` (default de `reasoning_effort` en `xhigh`) |

Diferencias clave frente a los dos primeros: este checkpoint añade el `lm_head` GPTQ int4, la cabeza MTP int4 y las escalas FP8 de KV-cache, y corrige el `tokenizer.json` al de upstream. Frente a ThinkingCap, la diferencia principal es la licencia y el menor número de tokens de razonamiento que declara el fine-tune.

## Limitaciones y advertencias

- Validación restringida a sm_86 (Ampere). No hay datos de funcionamiento en arquitecturas posteriores ni en GPUs de datacenter.
- Una sola tarjeta no está soportada en esta release; el autor indica que volverá en una versión posterior.
- El tokenizador corregido solo surte efecto al servir con `transformers==5.18.0`. Con 5.17.0 o anteriores, `tokenizer.json` se ignora y se reconstruye el pre-tokenizador sin `\p{M}`, por lo que las marcas combinantes se siguen separando mal.
- Solo se declara inglés como idioma soportado; no hay evaluación de calidad en otras lenguas.
- La cuantización int4 W4A16 con grupo 128 es una aproximación con pérdida respecto a los pesos en bf16 del modelo base. La model card no cuantifica la degradación resultante.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes), solo medidas de throughput y de tamaño de KV-cache.
- El repositorio no incluye imagen de contenedor; la instalación es en metal desnudo y con entorno fijado por hash, lo que complica la reproducibilidad fuera del host de referencia.
- Los scripts de servicio requieren P2P entre GPUs y aplican su propia plantilla de chat (froggeric's Qwen-Fixed-Chat-Templates v22.5), no la del checkpoint, salvo que se sobrescriba con `CHAT_TEMPLATE=`.
- El pool de KV-cache se fija en bytes: una cifra distinta de 826.689 tokens (doble tarjeta) o 1.974.072 (cuádruple) indica que la configuración no coincide con la validada.
- Licencia: el repositorio se declara Apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.8-27B no se detalla en la información consultada y conviene verificarla. El checkpoint asociado ThinkingCap se distribuye bajo PolyForm Small Business License 1.0.0 más permiso de uso personal de BottleCap AI, condiciones distintas de Apache-2.0.
- Modelo con adopción muy baja en el momento de la consulta (156 descargas, 2 likes), sin validación comunitaria amplia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/halt95/Qwen3.8-27B-W4A16-Merlin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint AWQ de origen: https://huggingface.co/philbert440/Qwen3.8-27B-W4A16-AWQ
- Repositorio de servicio (tag v1.3.0): https://github.com/halt95/qwen38-27b-3090s
- Assets del motor (motor Merlin v2.5.2): https://github.com/halt95/qwen38-flash-next-3090s/releases/download/v2.5.2/v2.5.2-from-upstream-v0.30.0.bundle.gz
- Assets de build para sm_86: https://github.com/halt95/qwen38-flash-next-3090s/releases/download/v2.2.0/build-artifacts-sm86-py313-cu130-v2.2.0.tar.gz
- Checkpoint asociado ThinkingCap: https://huggingface.co/halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin

Nota sobre la búsqueda web: los resultados devueltos no guardan relación con este modelo (preguntas de gramática inglesa, un informe de entrega de correo y una consulta sobre llamadas al sistema en Linux), por lo que no aportan enlaces utilizables.
