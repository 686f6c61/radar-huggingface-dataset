# keptn/nemotron-3.5-bolt-74b-a9b-iq8r

## Resumen

Nemotron 3.5 Bolt 74B-A9B IQ8R es una cuantización de 8 bits del modelo multimodal NVIDIA Nemotron 3.5 Bolt 74B-A9B, publicada por el usuario keptn y empaquetada en un único fichero de 73,73 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4. Se trata de un modelo MoE (74B parámetros totales, 9B activos) con torre de visión RADIO, ventana de contexto de 262.144 tokens y soporte de decodificación especulativa mediante el drafter LiLiCorr de NVIDIA.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar un modelo de 74B con visión y contexto de 256k en hardware AMD de consumo profesional (dos Radeon AI PRO R9700 de 32 GB) manteniendo una fidelidad muy alta respecto al original en bf16: KL media de 0,00122 y 99,0% de coincidencia en el token top-1 sobre las preguntas de MT-Bench. Por otro, es un ejemplo de cuantización sin datos de calibración (round-to-nearest con búsqueda de escala) aplicada a un MoE con capas expertas en 8 bits rotados.

El modelo está pensado para despliegues en producción sobre ROCm, con reparto de expertos entre VRAM y memoria de host (`expert_tiered`), y ofrece 100 tokens/s en decodificación de un solo stream en la configuración de referencia. La licencia es OpenMDW 1.1, lo que permite uso comercial con condiciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (texto + visión), con drafter especulativo LiLiCorr |
| Parámetros totales | 74B (74B-A9B, según nomenclatura del modelo base) |
| Parámetros activos | 9B (aproximado, según nomenclatura A9B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ8R (8 bits entero rotado, escala de 8 bits por 256 pesos bajo una escala por fila) en capas lineales; expertos en 8 bits entero rotado con una escala por 128 pesos; torre de visión RADIO sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | `.rad` (formato nativo de radiance), 73,73 GiB en un único fichero |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16` (revisión `e09a4ced`) y drafter `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr` (revisión `449d2414`) |
| Entradas | texto, imagen (audio y vídeo no medidos) |
| Motor de inferencia | radiance 2.1.0 con PR #389 (no incluido en release) |
| Hardware probado | 2 × Radeon AI PRO R9700 (32 GB), ROCm, RDNA4 (gfx1201) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de NVIDIA que combina una torre de visión RADIO con un backbone de lenguaje. La nomenclatura 74B-A9B indica 74.000 millones de parámetros totales y aproximadamente 9.000 millones activos por token, lo que sitúa el coste de cómputo por token en el rango de un modelo denso de 9B pese a almacenar 74B. La ventana de contexto nativa es de 262.144 tokens y el modelo incorpora un modo de razonamiento (`enable_thinking`) desactivable por petición.

La cuantización de esta ficha no modifica los pesos originales más allá de la reducción de precisión: los expertos enrutados se almacenan en 8 bits enteros con rotación y una escala por cada 128 pesos; el resto de capas lineales usan IQ8R (8 bits enteros rotados, con una escala de 8 bits por cada 256 pesos bajo una escala por fila). El redondeo es round-to-nearest con búsqueda de escala, sin datos de calibración. El backbone del drafter LiLiCorr también se rota a 8 bits enteros, mientras que la torre de visión RADIO se conserva tal cual en el checkpoint original. La conversión se hizo en dos pasadas para ahorrar tiempo, reutilizando el fichero intermedio con `--reuse`.

La innovación operativa principal es la decodificación especulativa con el drafter LiLiCorr de NVIDIA, configurado a 7 tokens de borrador (fue entrenado con bloques de 8). El motor radiance aplica además un esquema de reparto `expert_tiered` que mantiene parte de los expertos en memoria de host (20 GiB por tarjeta con `host-pool-mib: 40960`), lo que permite servir el modelo en dos GPUs de 32 GB.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imágenes (pipeline `image-text-to-text`), con torre de visión RADIO integrada.
- Modo de razonamiento (`thinking`) activable por petición mediante `chat_template_kwargs`; desactivado por defecto.
- Decodificación especulativa con drafter LiLiCorr (7 tokens de borrador) para acelerar la generación.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio y vídeo: la model card indica que no se han medido todavía, aunque el pipeline es multimodal imagen-texto.
- Servido concurrente con hasta 8 secuencias (`max-num-seqs: 8`) y batching de hasta 8.192 tokens.

## Casos de uso

- Asistencia técnica y atención al cliente con historial largo: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con documentación extensa adjunta (manuales, tickets previos) sin truncar, y el modo `thinking` desactivable reduce latencia en respuestas rutinarias.
- Análisis de documentación técnica con imágenes: al aceptar entradas de imagen y texto, puede procesar capturas de pantalla, diagramas de arquitectura o gráficas junto a texto explicativo, útil en soporte de infraestructura y revisión de incidencias.
- Despliegue on-premise en clústeres AMD: al ejecutarse sobre ROCm y RDNA4 con dos tarjetas de 32 GB, encaja en entornos que ya operan hardware AMD y quieren evitar dependencia de CUDA; el reparto `expert_tiered` permite usar GPUs de gama profesional sin necesidad de aceleradores de 80 GB.
- Generación y revisión de código en pipelines internos: el modelo base de 74B con 9B activos ofrece capacidad de razonamiento de un modelo grande a coste de cómputo de uno mediano; la decodificación especulativa a 100 tokens/s en un stream hace viable la generación interactiva.
- Procesamiento por lotes de documentos largos: con hasta 8 secuencias concurrentes y 956.176 tokens de pool KV compartido en la configuración de 8 secuencias, puede resumir, clasificar o extraer información de contratos, informes o expedientes extensos.
- Investigación en cuantización y motores de inferencia: el fichero incluye métricas reproducibles de KL y perplejidad frente al bf16 original, lo que lo convierte en un caso de referencia para evaluar esquemas IQ8R y decodificación especulativa en GPUs AMD.
- Evaluación comparativa de fidelidad de cuantizaciones: al publicarse junto a variantes w4a8 e iq2 del mismo autor, permite medir el compromiso entre tamaño, velocidad y degradación de calidad en un mismo modelo base.

## Benchmarks y rendimiento

Calidad respecto al original bf16 sobre las 80 preguntas de MT-Bench (ambos turnos, plantilla de chat del modelo, thinking desactivado, 41.586 tokens de respuesta evaluados con `--kld-ref`):

| Modelo | KL media | KL percentil 99 | Token top-1 coincidente | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (v1.1) | 0,00122 | 0,0163 | 99,0% | ×1,000 |
| Este repo, v1.0 (radiance 1.x) | 0,00301 | 0,0361 | 98,4% | ×1,000 |
| keptn/nemotron-3.5-bolt-74b-a9b-w4a8 | 0,00399 | 0,0479 | 98,1% | ×1,000 |
| keptn/nemotron-3.5-bolt-74b-iq2-nvidia | 0,0416 | 0,468 | 94,2% | ×1,017 |

Rendimiento en dos Radeon AI PRO R9700 a 300 W, radiance 2.1.0 con PR #389, KV en bf16, 7 tokens de borrador, thinking desactivado, BetterBench 0.6.1 con temperatura 0,7 (mediana):

| Métrica | 2 tarjetas |
|---|---|
| Decodificación, un stream | 100,0 tokens/s |
| Prefill a 24k tokens | 3.510 tokens/s |
| 4 streams, total | 82 tokens/s |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores miden fidelidad de cuantización y velocidad, no capacidad del modelo.

## Requisitos de hardware

- VRAM: el fichero ocupa 73,73 GiB; con `expert_tiered` y `host-pool-mib: 40960` se reservan 20 GiB de memoria de host por tarjeta para expertos, lo que permite servirlo en 2 GPUs de 32 GB.
- GPU recomendadas: 2 × Radeon AI PRO R9700 (32 GB) es la configuración probada por el autor; no se documentan otras.
- GPU de consumo: no se ha validado en GPUs de consumo; el requisito de 2 tarjetas de 32 GB y ROCm/RDNA4 (gfx1201) excluye la mayoría de configuraciones domésticas.
- Software: radiance 2.1.0 con PR #389 (no incluido en release); es necesario compilar la imagen desde la rama `nemotronh` con `docker/build.sh -t gfx1201`. Las versiones 1.17.0 y anteriores no pueden usar la versión 1.1.
- Contenedor: requiere acceso a `/dev/kfd` y `/dev/dri`, `seccomp=unconfined`, `ulimit memlock=-1:-1` y `HSA_ENABLE_IPC_MODE_LEGACY=1`.
- Memoria de contexto: con `max-model-len: 262144` y KV en bf16, el pool KV compartido es de 524.288 tokens para 2 secuencias, 1.048.576 para 4 y 956.176 para 8.
- Latencia y throughput: 100 tokens/s en decodificación de un stream, 3.510 tokens/s de prefill a 24k y 82 tokens/s agregados con 4 streams (menos que un único stream).
- Alternativas de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI para este fichero; el formato `.rad` es específico de radiance.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad vs. bf16 (KL media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fichero (IQ8R, 74B-A9B) | 74B totales / ~9B activos | 262.144 | 0,00122 | OpenMDW 1.1 | radiance 2.1.0 + PR #389 |
| keptn/nemotron-3.5-bolt-74b-a9b-w4a8 | 74B totales / ~9B activos | no disponible | 0,00399 | no disponible | no disponible |
| keptn/nemotron-3.5-bolt-74b-iq2-nvidia | 74B totales / ~9B activos | no disponible | 0,0416 | no disponible | no disponible |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B totales / ~9B activos | 262.144 | referencia | OpenMDW 1.1 | Hugging Face (transformers) |

No se dispone de datos de benchmarks de capacidad para comparar con modelos de otros fabricantes de tamaño similar; la comparación se limita a las variantes de cuantización del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- La licencia OpenMDW 1.1 es "other" en Hugging Face; conviene revisar el fichero `LICENSE` antes de un uso comercial, ya que las condiciones no están resumidas en la model card.
- La versión 1.1 requiere radiance 2.1.0 con el PR #389, que no está en ninguna release; desplegarlo en producción implica compilar desde una rama no estable.
- Las versiones de radiance 1.17.0 y anteriores no pueden cargar la versión 1.1; hay que usar la revisión `v1.0` con sus propias instrucciones.
- El rendimiento con 4 streams (82 tokens/s agregados) es inferior al de un único stream (100 tokens/s), lo que limita el escalado por concurrencia en esta configuración.
- El drafter solo funciona a 7 tokens de borrador porque fue entrenado con bloques de 8; otros valores no están soportados.
- No se han medido las capacidades de imagen, audio y vídeo, pese a que el pipeline es `image-text-to-text`.
- No hay información sobre idiomas soportados, sesgos, tasas de alucinación ni evaluación de seguridad del modelo base.
- El reparto `expert_tiered` mantiene expertos en memoria de host, lo que puede degradar la latencia bajo carga sostenida y depende de suficiente RAM y ancho de banda del sistema.
- El hardware validado es exclusivamente AMD RDNA4 con ROCm; no hay garantías de funcionamiento en otras arquitecturas ni en GPUs NVIDIA.
- El modelo tiene 84 descargas y 0 likes en el momento de la ficha, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-a9b-iq8r
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Drafter LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Variante w4a8 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-a9b-w4a8
- Variante iq2 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-iq2-nvidia
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- PR #389 de radiance (soporte del modelo): https://codeberg.org/StillDeadcode/radiance/pulls/389
