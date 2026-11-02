# andrzej/SmolLM2-135M-ONNX

## Resumen

`andrzej/SmolLM2-135M-ONNX` es un espejo (mirror) en formato ONNX del modelo `HuggingFaceTB/SmolLM2-135M` de Hugging Face TB, copiado sin modificaciones desde `onnx-community/SmolLM2-135M-ONNX` (revision `d0ae6834f1df45e0e95b5fdae95e536f9ca7cd3f`). No introduce ninguna conversion ni ajuste propio: reproduce los ficheros necesarios para ejecutar el modelo en el navegador mediante Transformers.js 4.3.2. El autor lo publica para una aplicacion educativa que compara las variantes base, SFT y SFT + DPO de SmolLM2-135M en paralelo.

SmolLM2-135M es un modelo de lenguaje de 135 millones de parametros desarrollado por Hugging Face TB, disenado como modelo pequeno y eficiente para generacion de texto en ingles. Esta version ONNX incluye dos builds: una cuantizada a int8 (`onnx/model_int8.onnx`, unos 135 MB) y una en fp32 (`onnx/model.onnx` con datos externos, unos 540 MB), lo que permite desplegarlo en entornos con recursos muy limitados, incluido el navegador.

Su relevancia es practica: ofrece una via sencilla de ejecutar un LLM pequeno en el cliente (transformers.js) sin infraestructura de servidor, a coste de un rendimiento muy inferior al de modelos de mayor tamano. La licencia Apache 2.0 facilita su uso comercial y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 135 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (ONNX) y fp32 (ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`, `model.onnx` + `model.onnx_data`) |

## Arquitectura y entrenamiento

El modelo subyacente, SmolLM2-135M, es un transformer decoder-only de 135 millones de parametros. Segun el paper citado (arXiv:2502.02737, "SmolLM2: When Smol Goes Big -- Data-Centric Training of a Small Language Model"), el desarrollo de la familia SmolLM2 se centra en el entrenamiento guiado por datos (data-centric). No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles de las fases de alineacion (RLHF/DPO) para esta variante concreta.

Esta publicacion es exclusivamente una conversion a ONNX: el autor indica que no ha realizado ninguna conversion propia, sino que ha copiado los ficheros de `onnx-community/SmolLM2-135M-ONNX` y ha verificado los valores SHA-256 contra el repositorio origen. Se incluyen solo los ficheros que carga la aplicacion: el build int8, el build fp32 con sus datos externos, y los ficheros de configuracion y tokenizer. No hay innovaciones tecnicas anadidas por el autor del mirror.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Ejecucion en navegador mediante Transformers.js (libreria declarada: `transformers.js`).
- Inferencia en CPU/entornos sin GPU gracias a los builds ONNX int8 y fp32.
- Comparacion de variantes base, SFT y SFT + DPO en la aplicacion educativa del autor (las tres variantes de SmolLM2-135M).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Vision, audio o modo thinking: no disponibles en esta variante.

## Casos de uso

- Demos educativas en navegador: el modelo se ejecuta con Transformers.js 4.3.2 para comparar en vivo las versiones base, SFT y SFT + DPO de SmolLM2-135M, mostrando el efecto de la alineacion en un modelo pequeno.
- Prototipado de interfaces de texto en el cliente: permite integrar generacion de texto en una web sin backend, usando el build int8 de ~135 MB para reducir la descarga inicial.
- Pruebas de concepto de asistentes simples en ingles: adecuado para validar flujos de autocompletado o respuesta breve donde la latencia y el coste importan mas que la calidad.
- Educacion e investigacion sobre modelos pequenos: sirve para estudiar el comportamiento de un LLM de 135 M de parametros en entornos controlados y reproducibles (hashes SHA-256 verificados).
- Benchmarking de despliegue ONNX: util para medir rendimiento de ONNX Runtime / Transformers.js en distintos navegadores y dispositivos con dos precisiones (int8 y fp32).
- Generacion de texto offline en aplicaciones de escritorio o moviles que embeban ONNX Runtime, al no requerir conexion a un servidor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el build int8 ocupa unos 135 MB en disco; el fp32, unos 540 MB (model.onnx_data). La memoria en ejecucion sera del orden del tamano del modelo mas el estado de inferencia; no se dispone de cifras oficiales.
- GPU recomendadas: no aplica de forma especifica; el modelo esta pensado para ejecucion en navegador y CPU. Cualquier GPU moderna puede ejecutarlo sobradamente.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual (y en CPU). No se dispone de requisitos minimos oficiales.
- Opciones de despliegue: Transformers.js 4.3.2 (objetivo principal), ONNX Runtime (web, CPU o GPU); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan soportadas por este repositorio ONNX segun la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andrzej/SmolLM2-135M-ONNX (este) | 135 M | no disponible | ONNX (int8, fp32) | Apache 2.0 | HuggingFace, orientado a Transformers.js |
| HuggingFaceTB/SmolLM2-135M | 135 M | no disponible | safetensors (upstream) | Apache 2.0 | HuggingFace |
| onnx-community/SmolLM2-135M-ONNX | 135 M | no disponible | ONNX | Apache 2.0 | HuggingFace (origen de este mirror) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. Las alternativas de la misma categoria (modelos pequenos para navegador) no estan detalladas en la informacion disponible.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede producir texto inexacto o inventado (alucinaciones).
- Solo soporta ingles; no es adecuado para tareas en castellano u otros idiomas.
- Es un mirror sin modificaciones: cualquier limitacion del modelo base SmolLM2-135M se hereda integramente.
- Capacidad muy limitada por su tamano (135 M de parametros): no es apropiado para razonamiento complejo, codigo avanzado ni tareas que requieran conocimiento factual fiable.
- No se documentan sesgos especificos en la informacion proporcionada; como todo LLM entrenado con datos web, es probable que herede sesgos, pero no hay datos concretos.
- Longitud de contexto no documentada en este repositorio; conviene consultar la model card del modelo base antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el credito del modelo corresponde a Hugging Face TB y el autor del mirror no ofrece garantias adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andrzej/SmolLM2-135M-ONNX
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Origen ONNX: https://huggingface.co/onnx-community/SmolLM2-135M-ONNX
- Space de conversion ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
