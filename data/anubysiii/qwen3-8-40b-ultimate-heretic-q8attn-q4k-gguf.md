# AnubysIII/Qwen3.8-40B-Ultimate-Heretic-Q8attn-Q4K-GGUF

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Q8attn-Q4K-GGUF es una cuantización GGUF del modelo DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored, publicada por el usuario AnubysIII (Sovereign Games LLC) bajo licencia Apache-2.0. Se trata de una expansión del Qwen3.8-27B del equipo Qwen hasta 96 capas (39.497.296.128 parámetros totales según los safetensors del modelo base), a la que se ha añadido una capa MTP (multi-token prediction) y sobre la que DavidAU aplicó una "abliteración" orientada a eliminar los rechazos del modelo. El resultado es un modelo conversacional multimodal (image-text-to-text) sin censura, empaquetado en un único archivo GGUF de 30,3 GB junto a un proyector de visión F16.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta poco habitual: atención, bloques SSM/linear-attention, capa MTP, embeddings y salida se mantienen en Q8_0, mientras que las FFN densas usan una mezcla de Q4_K y Q6_K. Por otro, el autor publica mediciones concretas de perplejidad y velocidad sobre dos RTX 3080 de 20 GB, lo que permite evaluar el coste real de desplegar un modelo de ~40B con contexto de 64K en hardware de consumo.

Conviene señalar que el modelo hereda la arquitectura `qwen35` (híbrida transformer + SSM) y que requiere una build reciente de llama.cpp (`54cde7106` o posterior) para cargarse correctamente. El modelo base fue eliminado en su versión BF16 tras la conversión, de modo que no existe una referencia de perplejidad en precisión completa con la que comparar la pérdida por cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + SSM/linear-attention (etiqueta `qwen35` en llama.cpp), 96 capas más una capa MTP |
| Parametros totales | 39.497.296.128 (39,5B) |
| Parametros activos | no disponible (no es MoE; todas las FFN son densas) |
| Longitud de contexto | 64K verificado en el hardware del autor; 128K agotó memoria en la primera petición |
| Tipos de cuantizacion | Mixta: Q8_0 en `attn_*`, `ssm_*`, `blk.96` (MTP), embeddings y output; Q4_K en `ffn_gate` y `ffn_up`; `ffn_down` en Q6_K (48 capas) y Q4_K (48 capas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal de 30,3 GB) más proyector de visión `mmproj-Qwen3.8-40B-F16.gguf` en F16 |

## Arquitectura y entrenamiento

El modelo base es una expansión de Qwen3.8-27B hasta 96 capas, con una capa adicional de multi-token prediction (MTP) que actúa como cabecera de borrador para decodificación especulativa. La arquitectura combina bloques de atención clásica (`attn_*`) con bloques de atención lineal/SSM (`ssm_*`), lo que explica que llama.cpp la etiquete como `qwen35` y que los conversores antiguos no puedan procesarla. Sobre esa base, DavidAU aplicó una abliteración ("Heretic") para eliminar los comportamientos de rechazo, y la build 1 del modelo base es la que incorpora los modos instruct.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la expansión. La cuantización se realizó en dos pasos: conversión de los safetensors BF16 a un GGUF BF16 y posterior cuantización con `llama-quantize` de la build `54cde7106`, aplicando overrides `--tensor-type` para forzar Q8_0 en atención, SSM, capa MTP, embeddings y salida, y dejando el resto en Q4_K_M. No se utilizó imatrix. Los tipos finales se leyeron del archivo entregado, no se infirieron de la línea de comandos.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con `--jinja`.
- Razonamiento explícito mediante modo thinking (``), desactivable con `logit_bias` sobre el token 248068 o limitable con `thinking_budget_tokens`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante el proyector `mmproj` en F16, aunque en la configuración medida del autor la visión se ejecuta en CPU.
- Decodificación especulativa con la capa MTP (`--spec-type draft-mtp`), con una tasa de aceptación del borrador de aproximadamente el 85%.
- Generación de código: el autor reporta velocidades distintas para código y prosa, lo que sugiere uso específico en tareas de programación.
- Modelo "uncensored": los rechazos han sido eliminados mediante abliteración, por lo que responde a peticiones que el modelo original declinaría.
- No hay información disponible sobre soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües verificadas.

## Casos de uso

- Asistente conversacional sin filtros en investigación sobre alineación: permite estudiar el comportamiento de un modelo abliterado frente a su versión original en condiciones controladas, con contexto de 64K para conversaciones largas.
- Generación de código en local: la decodificación especulativa con MTP alcanza unos 60 tok/s en código sobre dos RTX 3080, suficiente para autocompletado interactivo en un IDE o para generar tests en un pipeline de CI/CD sin depender de APIs externas.
- Procesamiento de documentos largos: los 64K tokens de contexto permiten resumir o extraer información de contratos, informes o expedientes de decenas de páginas en una sola pasada.
- Análisis de imágenes con texto asociado: el proyector de visión permite describir capturas, diagramas o documentación escaneada, aunque la inferencia de visión en CPU limita el throughput y lo hace apto para uso por lotes más que interactivo.
- Prototipado de agentes y flujos multi-paso: la capa MTP y el modo thinking permiten cadenas de razonamiento largas con buena velocidad de generación, útil para experimentar con planificación y descomposición de tareas.
- Despliegue en hardware de consumo para desarrollo: el archivo de 30,3 GB cabe en dos GPU de 20 GB con 64K de contexto (17,8 GB y 16,9 GB respectivamente), lo que permite trabajar con un modelo de ~40B sin infraestructura de centro de datos.
- Investigación sobre cuantización mixta: el modelo sirve como caso de estudio de cómo preservar atención y SSM en Q8_0 mientras se comprimen las FFN, con una perplejidad de referencia publicada (6,214 en wikitext-2).

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad wikitext-2 (test) | 6,214 ± 0,146 | 40 fragmentos de 512 tokens; sin referencia BF16 disponible |
| Generación, `-sm layer` | 22,1 tok/s | 2× RTX 3080 20 GB, sin P2P, llama.cpp `54cde7106` |
| Generación, `-sm tensor` | 30,5 tok/s | mismas condiciones |
| Generación, `-sm tensor` + MTP, código | ~60 tok/s | `--spec-type draft-mtp` |
| Generación, `-sm tensor` + MTP, prosa | ~47 tok/s | `--spec-type draft-mtp` |
| Procesamiento de prompt a 2048 tokens | 950-1000 tok/s | mismas condiciones |
| Tasa de aceptación del borrador MTP | ~85% | mismas condiciones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 30,3 GB para el archivo GGUF principal más el proyector de visión F16; con 64K de contexto el autor midió 17,8 GB y 16,9 GB repartidos en dos tarjetas.
- GPU recomendadas: dos RTX 3080 de 20 GB (configuración medida), o cualquier pareja de GPU que sume al menos ~36 GB con reparto por tensor.
- Una sola tarjeta de 24 GB no es suficiente para cargar el archivo completo; el autor sugiere usar `-ngl` para descargar parte de las 96 capas a CPU, sin haberlo probado.
- 128K de contexto agotó la memoria en la primera petición con la configuración de dos tarjetas.
- Opciones de despliegue: llama.cpp (build `54cde7106` o posterior) mediante `llama-server` o `llama-cli`; el autor no menciona compatibilidad con vLLM, TGI u Ollama.
- Comando de referencia del autor: `llama-server -m Qwen3.8-40B-Ultimate-Heretic-Q8attn-Q4K.gguf -ngl 99 -sm tensor -c 65536 -fa on --spec-type draft-mtp --jinja --mmproj mmproj-Qwen3.8-40B-F16.gguf --no-mmproj-offload`.
- Advertencia de despliegue: con `-sm tensor`, cargar el proyector en GPU provoca un aborto, de ahí `--no-mmproj-offload`; la visión se ejecuta en CPU.
- Para desactivar el modo thinking no basta `enable_thinking=false`, porque el modelo reabre `<think>` por sí solo; hay que bloquear el token 248068 (y `</think>`) con `logit_bias`, o fijar `thinking_budget_tokens` por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AnubysIII/Qwen3.8-40B-Ultimate-Heretic-Q8attn-Q4K-GGUF | 39,5B | 64K verificado | GGUF mixto Q8/Q4_K/Q6_K | Apache-2.0 | Perplejidad 6,214 en wikitext-2; ~60 tok/s con MTP en 2× RTX 3080 |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | 39,5B | no disponible | safetensors BF16 (eliminado según el autor) | Apache-2.0 | Modelo base del que deriva esta cuantización; sin métricas publicadas en la información disponible |
| Qwen3.8-27B (equipo Qwen) | ~27B | no disponible | no disponible | Apache-2.0 | Base original sin expansión ni abliteración; sin datos de rendimiento en la información disponible |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: los rechazos han sido eliminados deliberadamente, por lo que puede producir contenido dañino, ilegal o sexualmente explícito. El autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de fidelidad factual ni de calibración publicadas.
- La perplejidad de 6,214 no tiene referencia BF16 porque el autor eliminó la fuente antes de medirla; no es posible estimar la degradación exacta introducida por la cuantización.
- Idiomas soportados no documentados; no hay evidencia de rendimiento multilingüe verificado.
- El contexto práctico está limitado a 64K en la configuración medida; 128K agotó memoria. En una sola GPU de 24 GB el modelo no cabe completo.
- Requiere una build concreta o posterior de llama.cpp (`54cde7106`); conversores antiguos no soportan la arquitectura `qwen35`.
- El modo thinking es difícil de desactivar por configuración estándar y exige manipulación de `logit_bias` o presupuestos de tokens por petición.
- La visión se ejecuta en CPU con `-sm tensor`, lo que reduce drásticamente el throughput en tareas multimodales.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, sin validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de censura traslada al desplegador la responsabilidad legal sobre el contenido generado.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/AnubysIII/Qwen3.8-40B-Ultimate-Heretic-Q8attn-Q4K-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- llama.cpp: https://github.com/ggml-org/llama.cpp
