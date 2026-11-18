# kkk4oru/plamo-3-translate-0.8b-mlx-4bit-fast

## Resumen

PLaMo 3 Translate 0.8B MLX-4bit (fast) es una conversión no oficial del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks, publicada por el usuario `kkk4oru`. Se trata de una cuantización a 4 bits en formato MLX (Apple Silicon) que, a diferencia de la release oficial de PFN, cuantiza también el embedding de tokens y la cabeza del vocabulario, además de todas las capas lineales. El resultado es un modelo de 890 millones de parámetros cuyo peso en disco es de aproximadamente 501 MB (4,501 bits por peso), lo que reduce a 478 MB los pesos leídos por cada token generado frente a los ~0,98 GB de la versión oficial MLX-4bit.

El modelo resuelve un problema muy concreto: la latencia en inferencia local de traducción sobre hardware Apple. Según las mediciones del autor en un M5 Pro con `mlx-lm` 0.32.2, esta conversión alcanza 285 tokens/s con una petición y 470 tokens/s con cuatro, aproximadamente el doble que la release oficial (143 y 205 tokens/s respectivamente). El coste es una pérdida de calidad adicional respecto a la cuantización oficial, ya que la cuantización del embedding y de la cabeza de vocabulario degrada la fidelidad de la traducción.

Es relevante para desarrolladores que necesitan un traductor local de baja latencia en Mac (por ejemplo, para redibujar pantallas de texto en tiempo real) y que priorizan velocidad sobre máxima calidad. No está afiliado ni respaldado por Preferred Networks y se distribuye bajo la PLaMo Community License, con restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (PLaMo 3), conversión MLX con `custom_code` |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (4,501 bits por peso) |
| Idiomas soportados | no disponible (pipeline de traducción multilingüe; el spot check del autor es en↔ja) |
| Licencia | PLaMo Community License (uso no comercial gratuito; comercial con registro previo y límite de facturación anual de 1.000 millones de yenes) |
| Formato de pesos | safetensors (MLX), `model.safetensors` de 501.002.657 bytes |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer PLaMo 3 con tokenizador de código personalizado (requiere `trust_remote_code=True`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modelo base está especializado en traducción y se distribuye con `pipeline_tag: translation`.

La innovación técnica de esta ficha es exclusivamente la conversión: se aplica cuantización 4-bit affine con group size 64 a **todas** las capas lineales, al embedding de tokens y a la cabeza del vocabulario, mediante `mlx_lm.convert` de `mlx-lm` 0.32.2. Esto contrasta con la release oficial MLX-4bit de PFN, que solo cuantiza las capas lineales. El prompt de inferencia usa el formato de plantilla propio de PLaMo (`<|plamo:tag|>`, `<|plamo:msg|>`, `<|plamo:key|>`, `<|plamo:val|>`) con los campos `dataset`, `input`, `output` y `lang`.

## Capacidades

- Traducción de texto entre idiomas, con el par en↔ja verificado en el spot check del autor.
- Generación de texto condicionada por plantilla de chat propia de PLaMo.
- Soporte multilingüe declarado en los tags del repositorio (sin lista explícita de idiomas).
- Inferencia local en Apple Silicon mediante `mlx-lm` (librería MLX).
- Despliegue como servidor HTTP con `mlx_lm.server`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción local de baja latencia en Mac: usar `mlx_lm.server` en un M5 Pro para traducir pantallas de texto con ~285 tokens/s en una petición, adecuado para interfaces que redibujan contenido traducido en tiempo real.
- Ayudante de traducción en el escritorio: integrar el modelo en una app macOS que traduzca selecciones de texto al vuelo, aprovechando que los pesos ocupan ~501 MB y caben holgadamente en memoria unificada.
- Procesamiento por lotes de documentos cortos: con 470 tokens/s en cuatro peticiones concurrentes, sirve para traducir lotes de frases o párrafos en pipelines locales sin depender de API externa.
- Prototipado de sistemas de traducción: validar flujos de pre/postprocesado y plantillas de prompt PLaMo antes de pasar a la release oficial o a modelos mayores.
- Servicio de traducción en entornos sin conectividad: al ejecutarse íntegramente en local con MLX, permite traducir en máquinas aisladas o con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: usar esta conversión como referencia de velocidad frente a la MLX-4bit oficial para decidir el equilibrio latencia/calidad en un despliegue concreto.

## Benchmarks y rendimiento

| Modelo | Pesos leídos por token | tokens/s (1 petición) | tokens/s (4 peticiones) |
|---|---:|---:|---:|
| Este repo (todas las capas 4-bit) | 478 MB | 285 | 470 |
| `pfnet/…-MLX-4bit` oficial | ~0,98 GB | 143 | 205 |

Medido con 12 muestras fijas en↔ja, decodificación greedy, `mlx-lm` 0.32.2 y `mlx_lm.server` en un M5 Pro con otra carga de CPU concurrente. El autor indica que las cifras absolutas suben en una máquina inactiva.

Calidad: la tabla de PFN para la MLX-4bit oficial (solo capas) reporta PFTB −0,0089 y FLORES+ chrF++ −0,26 / −0,03 frente a BF16. Esta conversión va más allá y sus traducciones difieren del BF16 en formulación con más frecuencia; en el spot check de 12 muestras en↔ja contra la MLX-4bit oficial, todas las frases conservaron el significado y ninguna salida se truncó ni repitió.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan ~501 MB en disco y se leen 478 MB por token; en memoria unificada de Apple Silicon el modelo cabe con holgura incluso en equipos de 8 GB.
- GPU recomendadas: Apple Silicon (el autor mide en un M5 Pro). No aplica a GPU NVIDIA/AMD, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no está pensado para GPU discretas convencionales.
- Despliegue: `mlx-lm` 0.32.2 (libería `mlx`), con `mlx_lm.server` para servir por HTTP; requiere `trust_remote_code=True` por el tokenizador personalizado.
- Latencia/throughput: 285 tokens/s con una petición y 470 tokens/s con cuatro en M5 Pro bajo carga concurrente (cifras del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repo (MLX-4bit fast) | 890 M | no disponible | PLaMo Community License | safetensors MLX | Cuantiza embedding y cabeza; ~2x tokens/s vs oficial |
| `pfnet/plamo-3-translate-0.8b-MLX-4bit` | 890 M (base) | no disponible | PLaMo Community License | safetensors MLX | Solo capas lineales en 4-bit; mayor calidad, menor velocidad |
| `pfnet/plamo-3-translate-0.8b` (BF16) | 890 M | no disponible | PLaMo Community License | safetensors | Referencia de calidad; mayor peso y menor throughput |

No se dispone de datos de benchmarks de calidad (MMLU, FLORES+ completos, etc.) para esta conversión más allá de las cifras citadas de PFN y el spot check del autor.

## Limitaciones y advertencias

- La cuantización del embedding y de la cabeza del vocabulario degrada la calidad de traducción respecto a la MLX-4bit oficial y al BF16; el autor recomienda la release oficial cuando prime la calidad.
- Solo funciona en Apple Silicon con MLX; no es desplegable en vLLL, llama.cpp, Ollama ni TGI.
- Requiere `trust_remote_code=True` por el tokenizador personalizado de PLaMo, lo que implica ejecutar código del repositorio.
- Licencia restrictiva: uso no comercial gratuito; el uso comercial exige registro previo en Preferred Networks y está limitado a usuarios con facturación anual ≤ 1.000 millones de yenes; a mayor escala se necesita licencia separada.
- La redistribución debe conservar el texto de la licencia, mostrar "Built with PLaMo" y mantener "PLaMo" en el nombre del modelo.
- Conversión no oficial, sin afiliación ni respaldo de Preferred Networks.
- No se documentan sesgos, riesgo de alucinación específico, longitud de contexto ni lista de idiomas soportados.
- El rendimiento medido se obtuvo en un M5 Pro con carga concurrente; las cifras pueden variar en otros equipos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kkk4oru/plamo-3-translate-0.8b-mlx-4bit-fast
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Release oficial MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
