# jayleaton/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw, denominado internamente «flash17», es una cuantización EXL3 del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario jayleaton. Se trata de un modelo de mezcla de expertos (MoE) disperso de 101.835.423.954 parámetros totales, comprimido a 2,8003 bits por peso para poder servirse en dos NVIDIA DGX Spark (GB10, 128 GB cada una) con paralelismo tensorial 2 sobre el enlace CX7 de 200 Gb/s.

El paquete no es un conjunto de pesos autónomo: exige el motor DeepSeek-V4.1 de TensorFold escrito en Zig, porque ni exllamav3 estándar ni vLLM pueden cargarlo. La razón es que necesita anchos EXL3 distintos por experto (*ragged*) resueltos dentro de un único lanzamiento fusionado de expertos. La ventana de contexto es de 1.048.576 tokens distribuidos en 4 slots con KV dividida y compacta.

Su interés práctico es doble. Por un lado, demuestra que un MoE de ~102B puede ejecutarse en dos nodos de 128 GB de memoria unificada, con la asignación de bits orientada a código, ciencia/matemáticas y *tool calling*, además de visión nativa. Por otro, sirve como referencia reproducible de cuantización: el repositorio documenta receta, perfil de servicio y comprobaciones de fidelidad, y ocupa 203,8 GB repartidos en 47 archivos de pack.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (familia DeepSeek-V4.1), 40 capas de decoder, atención CSA2, capas MTP/draft y torre de visión con aligner |
| Parámetros totales | 101.835.423.954 (101,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (4 slots, KV dividida y compacta) |
| Tipos de cuantización | EXL3 (exllamav3 1.5.4, LDLQ + trellis, codebook `mul1`, escalas de salida activadas); 2,8003 bpw medios, con anchos por matriz de experto de 2, 3, 4 y 5 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 cuantizado, 47 archivos de pack) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`, actualización del 17 de octubre de 2026) |
| Tamaño del repositorio | 203.793.369.312 bytes (203,8 GB / 189,8 GiB) |
| Desglose de tamaño | 40 capas de decoder: 193,4 GB; embedding, cabeza de salida y capas MTP: 7,6 GB; torre de visión y tensores nativos: 2,8 GB |
| Motor de inferencia | TensorFold, motor DeepSeek-V4.1 en Zig (probado en el commit `9131e10ad17dde51e94a996da8255227727cd224`) |
| Hardware de referencia | 2 × NVIDIA DGX Spark (GB10, 128 GB), TP = 2, enlace CX7 200 Gb/s |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek-V4.1: un transformer de mezcla de expertos con 40 capas de decoder, atención CSA2 y capas MTP (*multi-token prediction*) que actúan como draft en decodificación especulativa. Incorpora además tablas Engram en las capas 1 y 14 (unas 101 GB cada una) y una torre de visión más aligner en bf16 (263 tensores) que permanece sin cuantizar en `native.safetensors`. La cuantización aplica anchos independientes a cada matriz de experto enrutado: 14.732 matrices a 2 bits, 27.328 a 3 bits, 3.836 a 4 bits y 184 a 5 bits, sobre un total de 46.080. El resto se mantiene a mayor precisión: atención 5,0 bpw, expertos compartidos 5,38, CSA2 5,0, proyección Engram 5,0, cabeza de salida 6 y capas MTP 4.

No hay entrenamiento nuevo en este artefacto. El punto de partida son los pesos FP8 densos con expertos MXFP4 del modelo original, que se desconectan capa a capa y se recodifican con `quantize_exl3` de exllamav3 1.5.4, invocando un *forward* de referencia de DeepSeek-V4.1 por capa, ya que exllamav3 no convierte V4.1 de forma nativa. Respecto al pack anterior q28-v2 (publicación de septiembre), esta versión reasigna bits hacia código, ciencia/matemáticas y llamadas a herramientas, y conserva los anchos de atención del pack de 2,9 bpw. No se dispone de datos sobre volumen de tokens, composición del dataset ni fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de 1.048.576 tokens y 4 slots concurrentes.
- Razonamiento y resolución de problemas de ciencia y matemáticas, favorecidos por la asignación de bits del pack.
- Generación de código, con anchos de experto ajustados específicamente a tareas de programación.
- *Tool calling* / *function calling*, también priorizado en la asignación de bits.
- Flujos de agente con resultados de herramientas intercalados en la conversación (con la salvedad del encoder descrita en limitaciones).
- Visión nativa: torre y aligner en bf16, con sesgo de enrutamiento de imagen específico de la release 1017 (`TF_DSV41_BIAS_VL`).
- Entrada de imágenes por `image_url`; las pruebas del autor pasan 3/3 sondas y 20/20 en VQA con pools de 3,0M, 2,4M y 2,2M tokens.
- Decodificación especulativa mediante las capas MTP/draft incluidas en `head-mtp.safetensors`.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Asistencia de código sobre repositorios completos**: con 1.048.576 tokens de contexto, el modelo puede recibir varios módulos, tests y documentación en una sola petición y razonar sobre dependencias cruzadas, algo inviable con ventanas de 32K-128K.
- **Agente de herramientas en producción**: el pack está optimizado para *tool calling* y se sirve detrás de una API compatible con OpenAI, de modo que se integra en orquestadores existentes sin reescribir el cliente; conviene declarar siempre el campo `tools` por la limitación del encoder.
- **Análisis de documentos técnicos y científicos**: artículos, normativa o informes de más de 500K tokens caben en un slot, con margen para el prompt de sistema y la respuesta; el refuerzo de bits en ciencia/matemáticas reduce la degradación en cálculos simbólicos.
- **Inspección visual de documentación**: la torre de visión permite extraer datos de capturas, diagramas o facturas escaneadas dentro del mismo contexto textual, sin pipeline OCR separado.
- **Despliegue on-premise con soberanía de datos**: dos DGX Spark (128 GB cada una) son hardware de sobremesa/edge; el modelo puede residir íntegramente en instalaciones propias sin salida a la nube, con licencia MIT para el pack.
- **Evaluación de cuantizaciones en investigación**: el repositorio documenta receta, bpw por componente, perfil de servicio y comprobaciones de fidelidad, lo que permite reproducir el proceso y comparar asignaciones de bits frente al pack q28-v2 o al de 2,9 bpw.
- **Chat multi-usuario concurrente**: 4 slots con KV compacta permiten atender a cuatro sesiones simultáneas; con el pool de 2,1M tokens, una o dos sesiones pueden llenar 1M de contexto cada una, mientras que cuatro activas comparten unos 525K por slot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye una sección de evaluación y fidelidad, pero su contenido no está accesible en los datos proporcionados. Los únicos datos cuantitativos verificables son los siguientes:

| Prueba | Resultado |
|---|---|
| VQA sobre pools de 3,0M / 2,4M / 2,2M tokens | 20/20 |
| Sondas de entrada `image_url` | 3/3 |
| Bits por peso medios (definición del pack de 2,9 bpw) | 2,8003 |
| Memoria libre mínima observada con pool de 2,1M | 4,226 GiB (suelo configurado: 4 GiB) |
| Matrices de experto enrutado por ancho | 2 bits: 14.732; 3 bits: 27.328; 4 bits: 3.836; 5 bits: 184 |
| Divergencia KL de siguiente token frente a la release | el autor indica que q28-v2 quedó más cerca de su release que el pack de 2,9 bpw, sin cifras públicas |

Latencia y throughput: no disponibles.

## Requisitos de hardware

- **Hardware obligatorio**: 2 × NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una), con paralelismo tensorial 2 sobre el puerto CX7 de 200 Gb/s. No se documenta soporte para otra configuración.
- **Huella de pesos**: 203,8 GB de pack, más las tablas Engram de las capas 1 y 14 (unas 101 GB cada una), que no viajan en el repositorio y deben descargarse del modelo base y trocearse por rango con `scripts/pack_engram.py`.
- **GPU de consumo**: inviable. Una RTX 4090 (24 GB) o similar no puede alojar ni una fracción relevante del pack; no hay versiones GGUF ni cuantizaciones de menor tamaño publicadas en la información disponible.
- **Motor de despliegue**: exclusivamente el motor DeepSeek-V4.1 de TensorFold en Zig, commit `9131e10ad17dde51e94a996da8255227727cd224`. No carga en exllamav3 estándar, vLLM, llama.cpp, Ollama ni TGI.
- **API**: la receta expone un endpoint compatible con OpenAI.
- **Ajustes de servicio relevantes**: `TF_DSV41_POOL_TOKENS=2100000` (obligatorio), `TF_DSV41_IMAGES=native`, `TF_DSV41_BIAS_VL=<carpeta del modelo>`, top-p de expertos 0,85 con un mínimo de 3 expertos y renormalización de pesos, prefill de 4K, suelos de memoria de 5/4 GiB y caída de servicio de 3,0 GiB.
- **Integridad**: ambos nodos necesitan una copia byte a byte del repositorio; se incluye `SHA256SUMS`.
- **Térmica**: el autor sugiere limitar el reloj de GPU a 2100-2200 MHz.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (flash17, 1017) | 101,8B | 1.048.576 | EXL3 2,8003 bpw, anchos por experto de 2-5 bits | MIT | HuggingFace; requiere motor TensorFold Zig |
| jayleaton/DeepSeek-V4.1-Flash-EXL3-2.8bpw (q28-v2, septiembre) | 101,8B (mismo tamaño declarado) | 1.048.576 en el mismo perfil de servicio | EXL3 2,80 bpw | MIT | HuggingFace; motor TensorFold |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | 101,8B | no disponible en la información | FP8 denso + expertos MXFP4 | no disponible en la información | HuggingFace (deepseek-ai) |

Frente a q28-v2, flash17 cambia las tablas Engram (que en 1017 son distintas en todos los pesos y escalas), actualiza el sesgo de enrutamiento visual y reasigna bits hacia código, ciencia/matemáticas y *tool calling*, manteniendo el mismo tamaño de repositorio. Frente al original, la ventaja es la reducción de huella (de FP8/MXFP4 a 2,80 bpw) a costa de una pérdida de fidelidad no cuantificada públicamente.

## Limitaciones y advertencias

- **Dependencia de un motor no estándar**: el pack solo funciona con el motor TensorFold en Zig en un commit concreto; no hay soporte en vLLM, exllamav3 estándar, llama.cpp ni Ollama. Esto bloquea su uso en infraestructuras convencionales.
- **Tablas Engram no incluidas**: hay que descargarlas del modelo base en la revisión `1bae0e1` y trocearlas por rango. Las tablas de septiembre no son compatibles: todos los pesos y escalas Engram cambiaron en 1017.
- **Pool de tokens restringido**: `TF_DSV41_POOL_TOKENS=2100000` es obligatorio. Con 3,0M o 2,4M la memoria libre del nodo cabeza cae por debajo del suelo de 4 GiB durante los primeros prompts largos, debido a un espacio de trabajo transitorio de 2,27 GB para prefill de 4K sobre el pool de KV.
- **Desajuste de encoder**: el cambio del encoder de 1017 (un turno de usuario que solo contiene resultados de herramientas no abre turno nuevo) no está en el commit Zig `9131e10a`. Solo afecta a continuaciones con resultados de herramientas sin declarar `tools`.
- **Plantilla de chat heredada**: la release 1017 no incluye `chat_template.jinja`; el repositorio incorpora la de septiembre únicamente porque algunas compilaciones de TensorFold buscan el archivo al arrancar. El motor Zig usa su propio encoder y no lo lee.
- **Configuración visual obligatoria**: sin `TF_DSV41_IMAGES=native` y `TF_DSV41_BIAS_VL` apuntando a la carpeta correcta se usarían sesgos de imagen de septiembre, lo que rompe el enrutamiento visual de 1017.
- **Licencia**: el pack se distribuye bajo MIT, pero la licencia del modelo base no figura en la información disponible y debe verificarse antes de un uso comercial. Persisten además las obligaciones de atribución que el autor del modelo original imponga.
- **Idiomas**: no se documenta qué lenguas cubre el modelo; no hay garantías de rendimiento en castellano.
- **Alucinación y sesgos**: no se publican evaluaciones de sesgo ni tasas de alucinación para este pack; la cuantización agresiva a 2 bits en 14.732 matrices de experto puede degradar precisión en dominios no priorizados.
- **Temperatura**: se recomienda limitar el reloj a 2100-2200 MHz en los dos nodos, lo que condiciona el throughput sostenido (no cuantificado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack predecesor (q28-v2, septiembre): https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-EXL3-2.8bpw
- Receta de servicio, motor y perfil: https://github.com/jayleaton/deepseek-v41-tensorfold-spark
- Pull request con la receta y resultados: https://github.com/jayleaton/deepseek-v41-tensorfold-spark/pull/42
- Documentación del pack: `docs/FLASH-1017.md` dentro del repositorio anterior
- Ficha del modelo en Enterprise DNA: https://enterprisedna.co/directories/models/deepseek-deepseek-v4-1-flash-1017/
