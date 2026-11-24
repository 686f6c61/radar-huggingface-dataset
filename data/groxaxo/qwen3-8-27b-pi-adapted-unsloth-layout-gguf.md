# groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF

## Resumen

`groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF` es una cuantización GGUF independiente del modelo Qwen3.8-27B de Alibaba Qwen, sobre el que se ha aplicado un adaptador LoRA de la organización harness-hub (el llamado "pi adapter"). El autor de esta publicación es groxaxo, que no mantiene relación oficial con Unsloth ni con los autores originales. El artefacto reproduce la asignación exacta de tensores, dimensiones y precisiones del GGUF de referencia `UD-Q4_K_XL` publicado por Unsloth, utilizando su importance matrix pública.

El modelo base tiene 27.320.697.856 parámetros (unos 27,3 mil millones) y es un transformer denso orientado a generación de texto y conversación. Esta versión GGUF pesa 17.659.406.112 bytes (unos 16,4 GiB) y contiene 866 tensores, incluidos 15 tensores nativos de MTP (multi-token prediction) que se conservan para decodificación especulativa. La licencia es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un proceso de cuantización reproducible con verificación estructural y hashes inmutables de las fuentes; por otro, es explícita sobre sus límites, ya que el propio autor declara que los benchmarks están en curso y que las comprobaciones realizadas solo validan carga, tool calling y decodificación especulativa, no la precisión del modelo. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8), con cabezas MTP nativas para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: F32, IQ4_NL, IQ4_XS, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 (5,167777 bits por parámetro ponderado por payload) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-pi-adapted-UD-Q4_K_XL.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen3.8 con 27,3 mil millones de parámetros. Sobre los pesos BF16 originales de Qwen se fusionó un adaptador LoRA de rango 32 y alpha 64 procedente de harness-hub, aplicado en CPU como `W + 2 * B @ A` en FP32 con un único redondeo posterior a BF16. Se mapearon y materializaron los 256 pares LoRA. La conversión preservó los 15 tensores nativos de MTP sin adaptar, verificados mediante comparación de bytes tras las transformaciones GGUF correspondientes. Se desactivó la fusión opcional de tensores de entrada compartidos para mantener la representación de 866 tensores de la referencia.

La cuantización se realizó con llama.cpp (commit `51831d47d0a47b8a7d07c9ff262ebe4b0a211790`) usando la importance matrix pública de Unsloth (`imatrix_unsloth.gguf`, 496 entradas y 1.251 chunks) y un fichero de overrides por tensor que replica la asignación del `UD-Q4_K_XL` de referencia. La asignación real es mixta: 360 tensores en F32, 9 en IQ4_NL, 91 en IQ4_XS, 1 en Q3_K, 37 en Q4_K, 199 en Q5_K, 50 en Q6_K y 119 en Q8_0. El autor advierte de una limitación de calibración: la matriz de importancia no está recalculada sobre los pesos adaptados con pi, contiene 496 entradas frente a las 497 de la referencia y no cubre el output head, el token embedding ni algunas proyecciones MTP nativas (8 tensores sin datos de imatrix). No se han publicado detalles sobre el dataset de entrenamiento del adaptador pi, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y completado de instrucciones, con pipeline `text-generation` y etiqueta `conversational`.
- Tool calling y function calling: el autor confirma que las pruebas de humo de runtime validan el "tool-call plumbing" con llama-server.
- Decodificación especulativa mediante MTP nativo: los 15 tensores MTP se conservan íntegros en el GGUF.
- Razonamiento multi-paso y uso como agente: no confirmado explícitamente en la información disponible, aunque el adaptador pi (harness-hub) sugiere orientación a harness de agentes.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: el GGUF de 16,4 GiB cabe en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) dejando margen para contexto, lo que permite ejecutar un modelo de 27B en hardware de gama alta consumer con llama.cpp u Ollama.
- Asistentes conversacionales autoalojados: la etiqueta `conversational` y el pipeline de generación de texto lo hacen adecuado para chatbots internos donde no se quiere enviar datos a APIs externas.
- Integración en pipelines de agentes con tool calling: las pruebas de humo confirman el cableado de tool calls en llama-server, lo que permite conectarlo a frameworks de agentes que hablen el protocolo OpenAI-compatible (`endpoints_compatible`).
- Aceleración de inferencia con decodificación especulativa: los tensores MTP nativos permiten activar speculative decoding en llama.cpp para reducir latencia en generación token a token, útil en aplicaciones interactivas.
- Evaluación y reproducción de cuantizaciones: los hashes SHA256, el manifiesto de merge y el mapa de referencia de tensores permiten a investigadores reproducir exactamente el artefacto y auditar la asignación por tensor.
- Servicio de inferencia en servidor único con llama-server: el binario probado (`4cfe622d...`) y el formato GGUF encajan en despliegues de una sola GPU sin necesidad de infraestructura multi-GPU.
- Fine-tuning posterior sobre el adaptador pi: al estar el LoRA ya fusionado en BF16 antes de cuantizar, sirve como punto de partida para experimentos de adaptación adicional, aunque la cuantización limita la precisión para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el estado de benchmarks es "IN PROGRESS" y que las verificaciones realizadas (carga, tool calling, decodificación especulativa) no establecen precisión ni validan las afirmaciones de eficiencia de la model card original.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ocupa 17.659.406.112 bytes (unos 16,4 GiB); con overhead de contexto y KV cache, se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40/80 GB, H100; también válidas GPUs profesionales de 24 GB o más.
- Cabe en GPU consumer: sí, en RTX 3090 y RTX 4090 con 24 GB, siempre que se limite la longitud de contexto; en GPUs de 16 GB no cabe sin offloading a RAM.
- Opciones de despliegue: llama.cpp (probado con llama-server, binario `4cfe622d37d808037a54cfef72990ef6d1241732858ce8cd1306f9cc3cdfc870`), Ollama (formato GGUF compatible), y cualquier runtime GGUF con soporte de MTP para decodificación especulativa.
- Latencia y throughput: no disponible; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF | 27,3B | no disponible | GGUF mixta (5,17 bits/param) | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.8-27B-GGUF (referencia `UD-Q4_K_XL`) | 27,3B | no disponible | GGUF dinámica Unsloth | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (BF16 original) | 27,3B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted (LoRA sin fusionar) | 27,3B + LoRA | no disponible | safetensors | no disponible | Hugging Face |

La diferencia principal frente al GGUF de Unsloth es que esta versión incorpora el adaptador pi fusionado y replica la asignación de tensores de la referencia sin reproducir los internals no publicados de Unsloth Dynamic. Frente al BF16 original, ofrece un tamaño 3,2 veces menor a costa de precisión de cuantización. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Benchmarks no publicados: el autor declara el estado como "IN PROGRESS"; no hay evidencia de precisión frente al BF16 ni frente al GGUF de Unsloth.
- Calibración incompleta: la importance matrix es la del modelo base, no recalculada sobre los pesos pi; 8 tensores (output head, token embedding y proyecciones MTP del bloque 64) se cuantizaron sin datos de imatrix.
- Discrepancia en la matriz: 496 entradas públicas frente a 497 registradas en la referencia; no se reproducen los internals de Unsloth Dynamic.
- Riesgo de alucinación: inherente a modelos de 27B sin benchmarks de fidelidad publicados; no hay datos específicos.
- Sesgos: no disponible; no se documentan evaluaciones de sesgo.
- Idiomas: no disponible; la model card no especifica cobertura lingüística.
- Contexto: no disponible; no se indica la longitud máxima soportada en esta cuantización.
- Licencia Apache 2.0 permite uso comercial, pero el autor aclara que no es una release oficial de Unsloth ni cuenta con el aval de los autores upstream.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria.
- Reproducibilidad dependiente de hashes: cualquier divergencia en el binario de llama.cpp o en la matriz de importancia puede alterar el resultado; el autor fija los hashes en la procedencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/Qwen3.8-27B-pi-adapted-Unsloth-layout-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Adaptador pi de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/tree/7d42b119e2d4d475fa11270634b1ef98d1cd5aee
- GGUF e importance matrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/tree/4af51b3542f775b0a8e4b310bfb3f17e01c306c9
- Verificación de cuantización: `provenance/quantization-verification.json` (en el repositorio)
- Manifiesto de merge: `provenance/merge-manifest.json` (en el repositorio)
- Mapa de referencia de tensores: `recipe/reference/reference_tensor_map.json` (en el repositorio)
- Bloqueo de fuentes: `recipe/reference/sources.lock.json` (en el repositorio)
- Procedencia de publicación: `provenance/publication.json` (en el repositorio)
- Log del cuantizador: `provenance/quantize.log` (en el repositorio)
- llama.cpp (commit usado): `51831d47d0a47b8a7d07c9ff262ebe4b0a211790`
