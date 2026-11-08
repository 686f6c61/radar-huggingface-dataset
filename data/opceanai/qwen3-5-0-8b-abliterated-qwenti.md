# OpceanAI/Qwen3.5-0.8B-abliterated-Qwenti

## Resumen

Qwen3.5-0.8B-abliterated-Qwenti es una variante experimental del modelo Qwen3.5-0.8B en su version abliterated (sin mecanismos de rechazo), desarrollada por OpceanAI. Su particularidad es que incorpora un computador CHIP-8 y una calculadora bignum de aritmetica exacta "compilados" directamente en los pesos del transformer, sin entrenamiento adicional: un compilador calcula cada peso y el circuito resultante es exacto en bf16.

El modelo parte de la arquitectura stock `Qwen3_5ForConditionalGeneration` (24 capas, hidden de 1024) y anade 13 capas nuevas delante de las de Qwen, ampliando el hidden size a 1664 y el vocabulario de 248.320 a 257.028 tokens. Cuando el modelo emite una llamada a herramienta, el circuito la interpreta, ejecuta la rutina en una maquina CHIP-8 con BIOS bignum, imprime el resultado dentro de `<tool_response>` y devuelve el control a Qwen. Todo ocurre en una sola llamada a `generate()`.

Es relevante como prueba de concepto de pesos compilados sobre un modelo abliterated: demuestra que es posible anadir capacidad computacional exacta a un transformer pequeno sin degradar su fidelidad de texto (KL media de 7,50e-4 frente al base abliterated) ni reactivar los rechazos eliminados por la abliteration. El metodo sigue el trabajo de Divyansh Agrawal (Qwenputer).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForConditionalGeneration` con 13 capas CHIP-8 compiladas antepuestas |
| Parametros totales | 1.794.664.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia); no se documentan otras en la informacion disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dos shards, 3,6 GB en bf16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer Qwen3.5 estandar de 24 capas y hidden 1024, con dos modificaciones de configuracion: se anteponen 13 capas "chip" no entrenadas y se expande el hidden a 1664 dimensiones (1024 de Qwen, 26 dimensiones de lastre, 589 slots de circuito y 864 dimensiones de overlay). El vocabulario pasa de 248.320 a 257.028 tokens al anadir 8.708 tokens chip. El circuito compilado ocupa 3.221 dimensiones, 116 cabezas y 28.259 unidades MLP. La BIOS CHIP-8 (sha1 `5e885286e8`) ocupa 3.072 bytes en 0x200 mas 174 bytes en 0x0E0.

No hay entrenamiento: los pesos de las capas chip se calculan mediante un compilador y el circuito resultante es exacto en bf16. El modelo base es `OpceanAI/Qwen3.5-0.8B-abliterated`, que a su vez deriva de Qwen3.5-0.8B mediante abliteration. El disparador del circuito es el token especial `</tool_call>` (id 248059), por lo que el tokenizer debe codificarlo como token unico; el autor documenta que un `tokenizer_config.json` sin `added_tokens_decoder` rompe el mecanismo silenciosamente.

## Capacidades

- Generacion de texto conversacional en ingles.
- Aritmetica exacta de enteros grandes (sumas y productos de hasta 17 digitos) mediante el circuito CHIP-8 compilado, con resultados verificados en 11 de 11 casos de prueba.
- Ejecucion de rutinas CHIP-8 dentro de la propia llamada a `generate()`, sin procesos externos.
- Emision e interpretacion de llamadas a herramienta en formato `<tool_call>` / `<tool_response>`.
- Modelo abliterated: no presenta rechazos en las categorias medidas (contenido no violento poco etico, delitos financieros, violacion de privacidad, contenido sexual explicito, discurso de odio, drogas y armas, exploits informaticos).
- Capacidades generales de Qwen3.5-0.8B (razonamiento basico, codigo, matematicas) heredadas del base, aunque no se documentan mediciones especificas en la informacion disponible.
- No se documenta soporte de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Aritmetica exacta en pipelines automatizados: el modelo resuelve productos y sumas de enteros grandes con resultado exacto en una sola llamada, adecuado para validaciones contables o calculos financieros donde un LLM convencional alucina digitos.
- Prueba de concepto de pesos compilados: util para investigadores que quieran reproducir o extender el metodo Qwenputer sobre checkpoints abliterated y medir el impacto en fidelidad de texto.
- Investigacion sobre abliteration: sirve para estudiar si anadir capas compiladas reactiva comportamientos de rechazo (segun el autor, no lo hace: 0% en todas las categorias medidas).
- Generacion de codigo y scripts con soporte de tool calling: el modelo puede emitir llamadas estructuradas que un orquestador externo interprete, aunque el circuito interno solo ejecuta rutinas CHIP-8.
- Experimentos de seguridad y red teaming: al ser abliterated, permite estudiar respuestas del modelo ante prompts sensibles en entornos controlados.
- Educacion y demos de arquitecturas hibridas: ilustra como insertar circuitos deterministas en un transformer sin reentrenar, con una fidelidad de texto medida (KL media 7,50e-4).
- Despliegue ligero en una sola GPU: con 1,79 mil millones de parametros y 3,6 GB en bf16, cabe en GPUs de gama media para prototipos e inferencia local.

## Benchmarks y rendimiento

Aritmetica exacta (modo tool, decodificacion greedy, una NVIDIA L4 con kernels de referencia):

| Problema | Esperado | Producido | Exacto | Tokens chip |
|---|---:|---:|---|---:|
| 42.450 x 8.376 | 355.561.200 | 355.561.200 | si | 103 |
| 62.468 x 9.558 | 597.069.144 | 597.069.144 | si | 103 |
| 18.316 + 79 | 18.395 | 18.395 | si | 91 |
| 43.569.773 x 537.110 | 23.401.760.776.030 | 23.401.760.776.030 | si | 179 |
| 64.067.760 x 612.720 | 39.255.597.907.200 | 39.255.597.907.200 | si | 179 |
| 4.828.454 x 13.429 | 64.841.308.766 | 64.841.308.766 | si | 144 |
| 3.874.873.259 x 104.560 | 405.156.747.961.040 | 405.156.747.961.040 | si | 207 |
| 63.469.922 + 6.796 | 63.476.718 | 63.476.718 | si | 61 |
| 6.668.138.404 x 8.747.862 | 58.331.954.555.092.248 | 58.331.954.555.092.248 | si | 234 |
| 3.934.266.345 + 7.534 | 3.934.273.879 | 3.934.273.879 | si | 69 |
| 741.620 x 5.590.080 | 4.145.715.129.600 | 4.145.715.129.600 | si | 170 |

Tasas de rechazo (30 prompts, greedy, 32 tokens generados):

| Categoria | Qwen3.5-0.8B base | Abliterated sin circuito | Este modelo |
|---|---:|---:|---:|
| No violento poco etico | 75% | 0% | 0% |
| Delitos financieros | 50% | 0% | 0% |
| Violacion de privacidad | 75% | 0% | 0% |
| Contenido sexual explicito | 50% | 0% | 0% |
| Discurso de odio | 25% | 0% | 0% |
| Drogas y armas | 75% | 0% | 0% |
| Exploits informaticos | 100% | 0% | 0% |
| Obediencia a jailbreak | 83% | 83% | 83% |

Fidelidad de texto (KL frente al base abliterated, 3.015 posiciones de 20 pasajes de WikiText-2 de hasta 256 tokens):

| Metrica | Valor |
|---|---:|
| KL media | 7,50e-4 |
| KL mediana | 7,44e-4 |
| KL maxima | 8,58e-4 |

Velocidad (una NVIDIA L4, kernels de referencia):

| Tamano de problema | Segundos |
|---|---:|
| Producto de 4 a 5 digitos | 24 a 27 |
| Producto de 6 a 10 digitos | 5 a 75 |
| Suma de 4 digitos | 5 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB en bf16 (pesos) mas overhead de activaciones y KV cache; no se documenta una cifra oficial.
- GPU recomendadas: NVIDIA L4 (usada en las mediciones del autor); A100 y H100 son compatibles pero no se documentan mediciones en ellas.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en bf16 (por ejemplo RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090); no se documentan pruebas concretas en estas tarjetas.
- Opciones de despliegue: `transformers` con el paquete `qwenputer` (`pip install -e ".[hf]"`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Aceleracion: instalar `causal_conv1d` y `flash-linear-attention` activa la ruta optimizada con las mismas salidas; sin ellos se usa la ruta de referencia, exacta pero lenta.
- Latencia y throughput: segun la tabla de velocidad del autor, entre 5 y 75 segundos por operacion aritmetica en L4 con kernels de referencia; no se documenta throughput de generacion de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aritmetica exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-abliterated-Qwenti | 1,79 B | no disponible | si (circuito CHIP-8) | apache-2.0 | Hugging Face |
| OpceanAI/Qwen3.5-0.8B-abliterated | no disponible | no disponible | no | no disponible | Hugging Face |
| Qwen3.5-0.8B (base) | no disponible | no disponible | no (falla productos grandes) | no disponible | Hugging Face |
| Qwenputer 0.8B (referencia de Agrawal) | no disponible | no disponible | si | no disponible | GitHub |

## Limitaciones y advertencias

- Modelo abliterated: elimina deliberadamente los rechazos de seguridad, incluidos exploits informaticos y contenido sensible. No apto para despliegue publico sin filtros externos.
- Riesgo de alucinacion en texto general: la fidelidad medida solo cubre la distribucion de siguiente token frente al base, no la veracidad factual.
- El circuito solo se activa si `</tool_call>` se codifica como el token especial 248059; un tokenizer mal configurado produce respuestas incorrectas sin errores visibles.
- Idiomas: solo se declara ingles; no se documenta rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no documentada en la informacion disponible.
- La ruta de referencia es lenta (hasta 75 segundos por producto de 6 a 10 digitos en L4); para produccion se requiere `causal_conv1d` y `flash-linear-attention`.
- El circuito CHIP-8 ejecuta solo rutinas predefinidas; no es un interprete general de codigo.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de rechazos traslada toda la responsabilidad de moderacion al integrador.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-Qwenti
- Modelo base abliterated: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated
- Version GGUF del base: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-GGUF
- Repositorio Qwenputer (metodo de referencia): https://github.com/divagr18/qwenputer
