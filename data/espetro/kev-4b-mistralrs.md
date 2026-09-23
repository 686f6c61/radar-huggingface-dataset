# espetro/kev-4b-mistralrs

## Resumen

Kev-4B for kev-rs es un export del checkpoint `jaredpalmer/kev-4b` empaquetado en el formato que carga directamente el servidor Kev del fork `espetro/mistral.rs`. El modelo parte de `Qwen/Qwen3.5-4B-Base` y lleva fusionada una LoRA de Kev (los "Kev LoRA") en fp32, junto con una cabeza de decisión independiente denominada "pointer head", almacenada aparte en `head.safetensors`. Lo publica el usuario `espetro`, autor del fork de mistral.rs que da soporte a este formato.

El problema que resuelve es de interoperabilidad: el checkpoint original no se podía cargar tal cual en el servidor Kev del fork, y este repositorio ofrece un layout (`model/` con checkpoint HF plano, `head.safetensors` con los tensores `q` y `k` de la cabeza, y `kev.json` con los metadatos de configuración) que `kev.serve` consume sin conversiones adicionales. Los pesos fusionados son, según la model card, idénticos bit a bit a los que carga `kev.serve`.

Se trata de un modelo de decisión de aproximadamente 4 000 millones de parámetros sobre una base Qwen3.5 de 4B, con licencia Apache-2.0. El repositorio ocupa 16,8 GB, coherente con un checkpoint en fp32. En el momento de redactar esta ficha no tiene descargas ni "likes" registrados, no publica benchmarks y no documenta idiomas soportados, longitud de contexto ni variantes cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `Qwen/Qwen3.5-4B-Base`) con una cabeza de decisión adicional de tipo "pointer head" (tensores `q` y `k`). Los detalles internos de la arquitectura base no están disponibles en la información proporcionada |
| Parámetros totales | ~4 000 millones (según la nomenclatura del modelo base); el repositorio de 16,8 GB es coherente con pesos en fp32 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el checkpoint publicado se distribuye en fp32 (LoRA fusionada en fp32). No se documentan variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint HF plano en `model/`, más `head.safetensors` para la cabeza de puntero y `kev.json` con `base`, `head_dim`, `temperature` e identificadores de tokens especiales) |
| Modelo base | `Qwen/Qwen3.5-4B-Base`, revisión `1001bb4d826a52d1f399e183466143f4da7b741b` |
| Tamaño del repositorio | 16,8 GB |
| Herramienta de exportación | `kev-rs/scripts/export_checkpoint.py` |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo original: no se indican número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de ajuste. Lo que sí describe la model card es el proceso de exportación, no de entrenamiento. El artefacto se construye tomando el checkpoint de `Qwen/Qwen3.5-4B-Base` en una revisión concreta, fusionando en fp32 la LoRA de Kev procedente de `jaredpalmer/kev-4b` y guardando el resultado como checkpoint HF plano dentro de `model/`.

La peculiaridad estructural es la separación entre el cuerpo del modelo y una cabeza de decisión independiente. Esa cabeza se distribuye como `head.safetensors` con los tensores `q` y `k`, y `kev.json` aporta los parámetros necesarios para instanciarla: `base`, `head_dim`, `temperature` y los identificadores de tokens especiales. El etiquetado `decision-model` sugiere que la salida del sistema no es texto libre generado de forma convencional, sino una decisión derivada de esa cabeza; no se especifica en la información disponible el mecanismo exacto de selección ni el espacio de decisiones.

Como innovación destacable, el formato permite arrancar el servidor con un único comando sobre el repositorio remoto (`kev-rs serve --checkpoint espetro/kev-4b-mistralrs --run jaredpalmer/kev-4b`), eliminando pasos de conversión previos. La contrapartida es la dependencia de un fork específico de mistral.rs.

## Capacidades

- Modelo de decisión: el repositorio se etiqueta explícitamente como `decision-model`, con una cabeza de puntero dedicada, lo que apunta a selección o señalización de elementos en lugar de generación abierta de texto.
- Carga directa en el servidor Kev del fork `espetro/mistral.rs`, sin conversión de formato intermedia.
- Pesos fusionados idénticos bit a bit a los que carga `kev.serve`, según la model card.
- Generación de texto: no confirmada en la información disponible.
- Razonamiento, matemáticas y generación de código: no confirmadas en la información disponible (dependerían de las capacidades heredadas de `Qwen/Qwen3.5-4B-Base`, no documentadas aquí).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.
- Compatibilidad con cuantización posterior: no documentada; el checkpoint se publica en fp32.

## Casos de uso

No hay documentación de casos de uso publicada por el autor. Los escenarios siguientes son aplicaciones plausibles derivadas de la naturaleza de modelo de decisión con cabeza de puntero y del formato de despliegue, no casos validados:

- Enrutado de peticiones en sistemas de agentes: usar la cabeza de decisión para elegir qué herramienta, endpoint o subagente debe atender una consulta entrante, sustituyendo un clasificador entrenado aparte por un modelo que comparte representaciones con la base de 4B.
- Selección de fragmentos en pipelines RAG: la cabeza con tensores `q` y `k` es un mecanismo natural para puntuar y señalar el pasaje relevante entre varios candidatos recuperados, antes de pasar el contexto al modelo generador.
- Triage de tickets y solicitudes de soporte: clasificación de la petición en categorías o colas de atención, integrada como paso previo en un sistema de atención al cliente automatizada.
- Guardarraíles y moderación: decisión binaria sobre si una entrada o una respuesta generada cumple una política, como etapa de verificación dentro de un pipeline mayor.
- Verificación de salidas en sistemas compuestos: actuar como comprobador de candidatos generados por otro modelo (por ejemplo, seleccionar la mejor de N respuestas) aprovechando su naturaleza de decisión y su tamaño contenido.
- Despliegue local autocontenido: servir el modelo mediante `kev-rs` en una máquina con GPU de gama alta, sin depender de APIs externas, para flujos donde la decisión debe ejecutarse en la propia infraestructura.
- Experimentación en investigación: comparar el comportamiento de la cabeza de decisión frente al modelo base sin fusión, dado que el formato permite cargar el checkpoint exportado y el original por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco ofrece comparaciones con modelos similares. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño nominal de 4B parámetros y del tamaño del repositorio (16,8 GB); el autor no publica requisitos oficiales:

- VRAM estimada en fp32: en torno a 16-17 GB solo para los pesos, más el espacio de activaciones y caché KV. El checkpoint publicado está en fp32, por lo que es el escenario de referencia.
- VRAM estimada si se convierte a bf16/fp16: aproximadamente 8-9 GB de pesos.
- VRAM estimada con cuantización de 8 bits: en torno a 4-5 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 2,5-3 GB.
- GPU recomendadas para fp32: A100 (40 o 80 GB), H100, L40S o similares con al menos 24 GB. Una RTX 4090 de 24 GB podría alojar los pesos en fp32 con margen ajustado, dependiendo de la longitud de secuencia y del tamaño de lote.
- GPU de consumo: una vez cuantizado a 8 o 4 bits, el modelo encajaría con holgura en tarjetas de 8-12 GB, pero conviene recordar que el autor no publica versiones cuantizadas y que la cabeza de puntero requiere soporte del runtime.
- Opciones de despliegue: `kev-rs serve` del fork `espetro/mistral.rs` es la vía soportada oficialmente. Al tratarse de un checkpoint HF plano, en principio podría cargarse con vLLM, TGI, llama.cpp u Ollama, pero la cabeza `head.safetensors` y `kev.json` quedarían fuera del grafo estándar, por lo que el modelo funcional completo probablemente exija el servidor Kev.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `espetro/kev-4b-mistralrs` | ~4B | no disponible | Sin benchmarks publicados | Apache-2.0 | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| `jaredpalmer/kev-4b` | ~4B (mismo origen) | no disponible | Sin benchmarks publicados en la información disponible | Apache-2.0, según la model card del export | HuggingFace |
| `Qwen/Qwen3.5-4B-Base` | ~4B | no disponible | No disponible | Apache-2.0, según la model card del export | HuggingFace |

No se dispone de información sobre otros modelos de decisión de tamaño comparable con los que establecer una comparación técnica sustantiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad de las decisiones del modelo.
- Documentación mínima: la model card describe el proceso de exportación, pero no el entrenamiento, los datos, los idiomas ni el uso previsto.
- Sesgos conocidos: no disponible. Al no documentarse la composición del dataset de la LoRA ni del modelo base, no es posible evaluar sesgos.
- Riesgo de alucinación: no evaluado. En un modelo de decisión el riesgo equivalente es emitir decisiones con alta confianza en casos fuera de distribución.
- Dependencia de un fork: el formato requiere el servidor Kev del fork `espetro/mistral.rs`. Es un proyecto personal, lo que implica riesgo de mantenimiento, cambios incompatibles y menor soporte que un runtime establecido.
- Los pesos se publican en fp32, lo que eleva el coste de almacenamiento y de VRAM frente a un despliegue en bf16 o cuantizado, sin que el autor ofrezca alternativas.
- Acoplamiento a una revisión concreta del modelo base (`1001bb4d826a52d1f399e183466143f4da7b741b`); cambios en la disponibilidad de esa revisión afectarían a la reproducibilidad.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No se documentan restricciones adicionales.
- Trazabilidad limitada: no se especifica qué contiene la LoRA de Kev ni qué decisiones se le enseñaron a tomar, por lo que auditar el comportamiento en producción resulta difícil.
- Madurez: cero descargas y cero likes en el momento de la consulta, y ninguna validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espetro/kev-4b-mistralrs
- Checkpoint de origen: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Fork de mistral.rs con el servidor Kev: https://github.com/espetro/mistral.rs
- Script de exportación: `kev-rs/scripts/export_checkpoint.py` (dentro del repositorio anterior; no se proporciona URL directa)
- Paper, blog o demo: no disponibles
