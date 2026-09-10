# cometkim/Qwen3.8-27B-nvfp4qat-NInfer

## Resumen

Qwen3.8-27B-nvfp4qat-NInfer es un artefacto de pesos cuantizados publicado por el usuario cometkim para el motor de inferencia NInfer, no un checkpoint convencional de Transformers. Empaqueta un perfil de pesos NVFP4 (W4A4) del modelo multimodal Qwen3.8-27B junto con el cabezal de decodificación especulativa DFlash2 del mismo modo, todo dentro de un único fichero `.ninfer` de 18.638.209.796 bytes (17,35 GiB). El objetivo es ejecutar un modelo de 27B en GPUs Blackwell (RTX 5090 entre otras) aprovechando los tensor cores de cuarta generación de precisión FP4.

La pila de pesos de texto no se cuantiza aquí, sino que se copia literalmente del checkpoint QAT `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, entrenado con destilación NVFP4 loss-aware (QUASAR) contra un profesor BF16 congelado. El resto del artefacto procede del modelo base oficial BF16: embedding y cabeza de salida en W8, cabeza de borrador optimizada, MTP, visión y frontend. El interés actual reside en que combina cuantización QAT nativa de 4 bits, decodificación especulativa embebida en el mismo fichero y soporte multimodal en un único contenedor, algo todavía poco común en el ecosistema de pesos abiertos.

El artefacto es muy reciente (publicado el 10 de septiembre de 2026), acumula 0 descargas y 0 likes, y sus benchmarks están marcados como no verificados. Además, la versión upstream de NInfer lo rechaza tal cual y requiere parches de un fork, por lo que debe considerarse material en fase de validación más que un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8-27B, con capas de atención, gated delta net (GDN) y MLP; incluye módulo MTP y visión según la model card |
| Parámetros totales | 27B (modelo base Qwen/Qwen3.8-27B); el drafter DFlash2 añade 2B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A4 en las 496 capas lineales de texto; NVFP4 weight-only en 34 matrices del drafter DFlash2; W8 en embedding y cabeza de salida; BF16 en normas, kernels conv base, visión y frontend |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor nativo de NInfer, versión 2); no es safetensors, ni GGUF, ni checkpoint de Transformers |
| Tamaño del artefacto | 18.638.209.796 bytes (17,35 GiB) |
| SHA-256 | `3bd37e032f1984250458ad6527d874913a96a26f9673537512c29726d3033e72` |
| Identificadores NInfer | model ID `qwen3.8-27b`, weights ID `nvfp4qat`, target key `qwen3_8_27b` |
| Objetos almacenados | 1.343 (1.337 tensores y 6 recursos); 290 tensores NVFP4 y 0 tensores de excepción BF16 |
| Pipeline declarado | image-text-to-text |
| Librería | ninfer |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, y el artefacto conserva su estructura completa más un cabezal de borrador. La pila de texto comprende 496 capas lineales cuantizadas en NVFP4 con activaciones también en 4 bits (W4A4), sin excepciones de alta precisión: afecta por igual a atención, gated delta net y MLP. La presencia de capas GDN junto a capas de atención indica una arquitectura híbrida de atención lineal y atención completa, aunque la model card no detalla la proporción ni el patrón de intercalado. El módulo de visión, el MTP y el frontend se toman del base BF16 sin modificar.

El entrenamiento de la parte cuantizada no lo realiza el autor: los pesos proceden de `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, un checkpoint con quantization-aware training obtenido mediante destilación NVFP4 loss-aware (QUASAR) contra un profesor BF16 congelado (referencia arXiv 2608.13966). La fábrica QAT de origen cuantiza por sitio, de modo que todos los tensores constituyentes de un padre fusionado comparten escalas globales de peso y de entrada; el conversor aplica esa compartición antes de copiar. Las proyecciones de control GDN se decodifican desde sus palabras NVFP4 QAT a BF16, que es el formato que consume el motor. El conversor valida el enrutado comparando byte a byte los 703 tensores sin cuantizar contra la fuente oficial, con resultado idéntico bit a bit.

La innovación técnica principal es la integración del drafter DFlash2 en el mismo fichero. Se trata de un módulo de difusión en bloque enmascarada de 2B parámetros, cinco capas, ventana deslizante 2048 y selector de rango 256 con top-16, almacenado como 66 objetos adicionales para que el flag `--spec dflash2` no necesite un segundo fichero. Frente al esquema registrado en upstream (W8G32_F16S), esta imagen guarda 34 matrices del drafter en NVFP4 weight-only (normas y kernels conv base permanecen en BF16), reduciendo el payload del módulo de 2.226.805.248 a 1.082.882.820 bytes, es decir, 1,07 GiB menos. Los pesos de texto son idénticos byte a byte entre ambas codificaciones. En la carga de verificación de la conversión, el módulo NVFP4 redactó 2,50 tokens por ronda con un 21,4% de aceptación, frente a 5,50 tokens por ronda con 64,3% del perfil `nvfp4full`.

## Capacidades

- Generación de texto conversacional multirround, con pipeline declarado `image-text-to-text`.
- Razonamiento de varios pasos con modo thinking: los benchmarks declarados se midieron con `thinking` activado.
- Razonamiento científico y matemático de nivel competitivo (GPQA-Diamond y AIME 2026).
- Comprensión de contexto largo en la subconjunto corto de LongBench v2.
- Procesamiento de imágenes junto a texto, gracias a la torre de visión heredada del base BF16.
- Decodificación especulativa integrada mediante DFlash2, activable con `--spec dflash2` y sin ficheros adicionales.
- Soporte de MTP (multi-token prediction) heredado del modelo base.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso orquestado: no disponible explícitamente, aunque el modo thinking y el MTP son compatibles con ese uso.
- Capacidades de audio: no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Razonamiento científico asistido en local: con un 89,22% declarado en GPQA-Diamond, el modelo puede emplearse para resolver preguntas de nivel posgrado en física, química y biología en un equipo de sobremesa con GPU Blackwell, sin enviar datos a servicios externos.
- Resolución de problemas matemáticos competitivos: el 91,11% en AIME 2026 con modo thinking lo hace apto para tutoría avanzada, generación de problemas y verificación de soluciones paso a paso.
- Análisis de documentos largos: el 66,3% en LongBench v2 (subconjunto corto) sugiere utilidad en resumen y question answering sobre expedientes extensos; conviene validar antes la longitud de contexto real, que no está publicada.
- Asistente multimodal de escritorio: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y continuar la conversación en texto, integrado en una aplicación de escritorio con motor NInfer.
- Inferencia de baja latencia en una sola GPU: el drafter DFlash2 embebido permite activar decodificación especulativa sin descargar un segundo modelo, útil en prototipos interactivos donde la latencia por token importa más que el throughput agregado.
- Evaluación de pipelines de cuantización: sirve como caso de estudio para comparar un perfil NVFP4 derivado de QAT frente a los perfiles `groupwise-int`, `nvfp4` y `nvfp4full` del mismo target dentro de NInfer.
- Despliegue en estaciones de trabajo con RTX 5090: el tamaño de 17,35 GiB hace viable mantener los pesos en VRAM de 32 GB junto con caché KV y buffers de runtime, siempre que se apliquen los parches del fork.
- Investigación sobre decodificación especulativa: la diferencia medida entre este perfil (2,50 tokens por ronda, 21,4% de aceptación) y `nvfp4full` (5,50 tokens por ronda, 64,3%) ofrece un punto de partida para estudiar el impacto de cuantizar el drafter.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card; todos con `verified: false`. Fuente: NInfer EvalScope (fork validation), https://github.com/cometkim/ninfer.

| Benchmark | Métrica | Valor | Condiciones |
|---|---|---|---|
| GPQA-Diamond | Accuracy | 89,22 | media de 3 rondas, thinking, rule |
| AIME 2026 | Accuracy | 91,11 | media de 3 rondas, thinking, rule |
| LongBench v2 | Accuracy | 66,30 | subconjunto corto, media de 3 rondas, full-capability, rule |

Medición interna de decodificación especulativa sobre la carga de verificación de la conversión:

| Perfil | Tokens redactados por ronda | Aceptación |
|---|---|---|
| nvfp4qat (este artefacto) | 2,50 | 21,4% |
| nvfp4full (perfil hermano) | 5,50 | 64,3% |

Tamaño del módulo drafter según codificación:

| Codificación del drafter | Bytes del módulo |
|---|---|
| W8G32_F16S (esquema upstream) | 2.226.805.248 |
| NVFP4 weight-only (esta imagen) | 1.082.882.820 |

## Requisitos de hardware

- VRAM para los pesos: 17,35 GiB solo de pesos. Hay que sumar caché KV, buffers de activación y el runtime del motor, por lo que conviene reservar al menos 20-24 GB de VRAM efectiva.
- GPU objetivo: arquitectura Blackwell, con soporte de NVFP4 (W4A4). La model card menciona explícitamente RTX 5090; las etiquetas incluyen `blackwell`, `rtx-5090` y `cuda`.
- GPUs consumer compatibles: RTX 5090 (32 GB) es el caso citado. No se documenta compatibilidad con GPUs de generaciones anteriores, y el uso de FP4 apunta a que no serían viables.
- GPUs de datacenter: no disponible en la información proporcionada; no se citan A100, H100 ni B200.
- Opciones de despliegue: exclusivamente motores NInfer con los parches de `cometkim/ninfer`. La versión upstream de NInfer rechaza el artefacto tal cual. No es compatible con vLLM, llama.cpp, Ollama, TGI ni con ningún runtime que espere safetensors o GGUF.
- Formatos alternativos: no existen; el artefacto es un `.ninfer` propietario y el autor indica expresamente que no es un checkpoint de Transformers ni una distribución safetensors.
- Latencia y throughput: no disponibles más allá de las cifras de decodificación especulativa (2,50 tokens por ronda, 21,4% de aceptación). No se publican tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos de terceros comparables en la información proporcionada. La comparación más fiable es interna, entre los perfiles del mismo target dentro del ecosistema NInfer y el base BF16.

| Artefacto | Cuantización | Tamaño | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cometkim/Qwen3.8-27B-nvfp4qat-NInfer | NVFP4 W4A4 (texto) + NVFP4 weight-only (drafter) | 18.638.209.796 bytes | GPQA-D 89,22; AIME 2026 91,11; LongBench v2 66,30 (no verificados) | apache-2.0 | Publicado, requiere fork de NInfer |
| cometkim/Qwen3.8-27B-nvfp4full-NInfer | NVFP4 (perfil "fuller-requant") | no disponible | Sin benchmarks publicados en esta información; 5,50 tokens por ronda y 64,3% de aceptación en la carga de conversión | no disponible | Publicado |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | NVFP4 QAT (origen de los pesos de texto) | no disponible | no disponible | no disponible | Publicado |
| Qwen/Qwen3.8-27B | BF16 (base oficial) | no disponible | no disponible | no disponible | Publicado |
| z-lab/Qwen3.8-27B-DFlash2 | BF16 / W8G32_F16S para el drafter | no disponible | no disponible | no disponible | Publicado |

Frente a alternativas de otros ecosistemas (por ejemplo, modelos de ~27B en GGUF o safetensors), la diferencia relevante no es de rendimiento sino de formato y hardware: este artefacto solo se ejecuta en NInfer sobre Blackwell, mientras que un GGUF equivalente funcionaría en llama.cpp sobre hardware mucho más variado.

## Limitaciones y advertencias

- Benchmarks no verificados: las tres cifras del model-index están marcadas con `verified: false` y provienen de una validación interna del fork, no de una evaluación independiente.
- Compatibilidad rota con upstream: Neroued/ninfer rechaza el artefacto tal cual; se requieren parches del fork de cometkim (y, en su caso, de terceros como ninfer-windows).
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con apenas minutos entre creación y última actualización, lo que sugiere un artefacto recién generado y escasamente probado.
- Caída de la decodificación especulativa: este perfil redacta 2,50 tokens por ronda con 21,4% de aceptación, frente a 5,50 y 64,3% del perfil `nvfp4full`. Cuantizar el drafter a NVFP4 ahorra 1,07 GiB pero degrada sustancialmente la especulación, con el consiguiente impacto en latencia.
- Formato propietario: no hay safetensors ni GGUF, lo que bloquea el uso con vLLM, llama.cpp, Ollama, TGI o cualquier herramienta estándar, y complica la inspección o el fine-tuning posterior.
- Dependencia de hardware Blackwell: la precisión NVFP4 con activaciones en 4 bits limita la ejecución a GPUs compatibles, lo que reduce la portabilidad.
- Contexto e idiomas sin documentar: no se indica la longitud de contexto soportada ni la lista de idiomas, pese a que el modelo base es multilingüe en origen. Cualquier despliegue multilingüe o de contexto largo debe validarse empíricamente.
- Riesgo de alucinación: no se documenta ninguna mitigación específica ni tasas de alucinación medidas; es de esperar un comportamiento similar al del modelo base, con riesgo adicional derivado de la cuantización agresiva de activaciones.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o seguridad para este artefacto ni para el checkpoint QAT de origen.
- Licencia: el artefacto declara apache-2.0, pero al derivar de Qwen/Qwen3.8-27B, de QUASAR-QAT y de z-lab, conviene verificar las condiciones de cada modelo base antes de un uso comercial, ya que no se detallan en la información disponible.
- Pesos de texto idénticos al QAT de origen: cualquier limitación del checkpoint QUASAR se hereda sin cambios, ya que la copia es literal (703 tensores verificados byte a byte).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4qat-NInfer
- Perfil hermano nvfp4full: https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4full-NInfer
- Modelo base BF16: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint QAT de origen: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Fork de NInfer con los parches requeridos: https://github.com/cometkim/ninfer
- Contrato del artefacto (documentación del fork): https://github.com/cometkim/ninfer/blob/feat/qwen3.8-nvfp4qat/docs/maintainer/qwen3.8-27b-artifact.md#15-fork-artifact-nvfp4qat
- Motor NInfer upstream: https://github.com/Neroued/ninfer
- Fuente de evaluación declarada (NInfer EvalScope, fork validation): https://github.com/cometkim/ninfer
- Referencia del método QUASAR citada en la model card: arXiv 2608.13966
- Etiqueta del repositorio `arxiv:2606.23406`: referencia incluida en las etiquetas del modelo, sin contenido accesible en la información proporcionada
- Parche para NInfer en Windows (`natpate/ninfer-windows`): la model card lo menciona, pero la URL aparece truncada en la información disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos no guardan relación con él.
