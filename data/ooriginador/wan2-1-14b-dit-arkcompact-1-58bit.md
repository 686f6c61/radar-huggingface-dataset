# Ooriginador/Wan2.1-14B-DiT-ArkCompact-1.58bit

## Resumen

El modelo Ooriginador/Wan2.1-14B-DiT-ArkCompact-1.58bit es una versión cuantizada a 1.58 bits en formato ternario (Base-3) del modelo de generación de video Wan2.1-T2V-14B, desarrollado por Alibaba. El autor, Ooriginador, aplica la técnica de cuantización ArkCompact, que empaqueta los pesos en estados ternarios {-1, 0, +1} con 5 trits por byte, reduciendo drásticamente el uso de memoria y acelerando la inferencia en hardware AMD mediante el runtime Rust ArkheionNet. El modelo mantiene la arquitectura de Diffusion Transformer (DiT) del original, con un mecanismo de gating TeaCache que promete un aumento de velocidad de 2.1x.

La relevancia de este modelo radica en su capacidad para ejecutar generación de video de 14 mil millones de parámetros en GPUs de consumo con tan solo 3 GB de VRAM, lo que lo convierte en una opción atractiva para despliegues en entornos con recursos limitados o para investigación en eficiencia de cuantización extrema. Sin embargo, hay que señalar que las métricas de rendimiento publicadas provienen del autor y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con TeaCache gating |
| Parametros totales | 14.0B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se indica "Diffusion" con RoPE scaling, sin valor concreto) |
| Tipos de cuantizacion | 1.58-bit Base-3 ternario (5 trits por byte) |
| Idiomas soportados | pt, en (segun el modelo card; el base Wan2.1 soporta chino e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado (se menciona shards con mmap; probablemente formato propio del runtime) |

## Arquitectura y entrenamiento

El modelo base Wan2.1-T2V-14B es un Diffusion Transformer (DiT) diseñado para generacion de video a partir de texto. La version cuantizada mantiene la misma arquitectura pero sustituye los pesos de punto flotante de 16 bits por valores ternarios {-1, 0, +1} mediante el esquema ArkCompact, que utiliza empaquetado Base-3 (5 trits por byte) para reducir el almacenamiento. El runtime ArkheionNet implementa operaciones de acumulacion entera y mascaras bitwise fusionadas para Wave32 en GPUs AMD, junto con Multi-Head Latent Attention (MLA) que reduce el cache KV en un 85.9% y chunked prefill para evitar bloqueos en el batching continuo.

No se proporcionan datos sobre el entrenamiento del modelo cuantizado; se asume que es una cuantizacion post-entrenamiento del modelo original. El modelo card menciona una fidelidad matematica (coeficiente de correlacion de Pearson) de al menos 0.942 en todas las capas lineales 2D, lo que sugiere una perdida de precision relativamente baja, aunque no se detalla el proceso de calibracion.

## Capacidades

- Generacion de video a partir de texto (text-to-video), heredada del modelo base Wan2.1-T2V-14B.
- El runtime ofrece una API compatible con OpenAI para interactuar con el modelo, aunque el modelo en si no es un LLM de texto; la API sirve como interfaz de control.
- Soporte multilingue limitado a portugues e ingles segun el modelo card, aunque el modelo base original soporta chino e ingles.
- No se documentan capacidades de tool calling, agentes, vision o audio en esta version cuantizada.
- El modelo card afirma un throughput de 120 tok/s en single-stream y 180 tok/s con decodificacion especulativa (tree-attention), aunque estos valores corresponden al runtime y no estan verificados de forma independiente.

## Casos de uso

- Generacion de video en tiempo real en hardware de gama baja: gracias a su huella de VRAM de aproximadamente 3 GB, el modelo puede ejecutarse en GPUs de consumo como la AMD Radeon RX 6600M, permitiendo generar clips de video cortos en entornos sin acceso a GPUs de datacenter.
- Prototipado rapido de aplicaciones de video generativo: los desarrolladores pueden integrar el modelo en pipelines de investigacion o desarrollo sin necesidad de infraestructura costosa, gracias a su bajo requisito de memoria y su carga rapida via mmap (menos de 450 ms segun el autor).
- Despliegue en entornos edge o embebidos: la cuantizacion extrema y el runtime Rust permiten ejecutar el modelo en dispositivos con limitaciones de memoria, como mini-PCs o estaciones de trabajo con GPUs modestas.
- Investigacion en cuantizacion ternaria: el modelo sirve como caso de estudio para evaluar el impacto de la cuantizacion 1.58-bit en la calidad de generacion de video, comparando con el modelo base en FP16.
- Servicios de generacion de video bajo demanda en la nube con costes reducidos: al requerir menos VRAM, se pueden alojar mas instancias por GPU, reduciendo el coste por inferencia en proveedores de cloud.
- Integracion en flujos de trabajo de creacion de contenido: el modelo puede utilizarse para generar clips de video de baja resolucion que posteriormente se refinan con otros modelos, como parte de un pipeline de produccion audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o metricas de calidad de video tipo FVD o CLIP) en la informacion disponible. El modelo card del autor proporciona las siguientes metricas de rendimiento, que deben tomarse con cautela al no haber sido verificadas de forma independiente:

| Metrica | Valor declarado |
|---|---|
| Throughput single-stream | 120.0 tok/s |
| Throughput con decodificacion especulativa | 180.0 tok/s |
| Throughput pico en batch (Wave32) | 12,000.0 tok/s |
| VRAM utilizada | 3016.4 MB |
| Fidelidad matematica (Pearson rho) | >= 0.942 |
| Tiempo de carga del modelo | < 450 ms |

Estos valores corresponden al runtime ArkheionNet en una AMD Radeon RX 6600M (RDNA2) y no son comparables con benchmarks de calidad de video.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB (3016.4 MB segun el autor), lo que permite ejecucion en GPUs de consumo con 4 GB o mas de memoria.
- GPU recomendadas: AMD Radeon RX 6600M (RDNA2) verificada por el autor; se espera compatibilidad con otras GPUs AMD que soporten ROCm/HIP y Wave32. No se menciona soporte para NVIDIA.
- El modelo cabe en GPUs de consumo como la RX 6600M, RX 7600, o integradas con suficiente VRAM.
- Opciones de despliegue: runtime nativo ark-engine (Rust) con API compatible con OpenAI; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: segun el autor, 120 tok/s en single-stream y 180 tok/s con decodificacion especulativa, aunque estos valores no estan verificados y dependen del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | VRAM | Licencia | Runtime |
|---|---|---|---|---|---|
| Wan2.1-T2V-14B (base) | 14.0B | FP16 | ~28 GB (estimado) | Apache-2.0 | Diffusers, etc. |
| Ooriginador/Wan2.1-14B-DiT-ArkCompact-1.58bit | 14.0B | 1.58-bit ternario | ~3 GB | Apache-2.0 | ArkheionNet (Rust) |
| CogVideoX-5B (referencia) | 5B | FP16 | ~10 GB (estimado) | Apache-2.0 | Diffusers |

La comparacion directa con otros modelos de video no es posible sin benchmarks de calidad. La principal diferencia de esta version es su huella de memoria extremadamente reducida y su dependencia de hardware AMD, mientras que el modelo base es mas portable pero requiere mucha mas VRAM.

## Limitaciones y advertencias

- Las metricas de rendimiento y VRAM provienen del modelo card del autor y no han sido verificadas por terceros; pueden ser optimistas o estar medidas en condiciones especificas.
- La cuantizacion a 1.58 bits puede degradar significativamente la calidad del video generado en comparacion con el modelo FP16, aunque el autor afirma una fidelidad matematica alta (rho >= 0.942).
- El modelo card indica soporte solo para portugues e ingles, aunque el modelo base Wan2.1 soporta chino e ingles; la cuantizacion podria haber afectado a las capacidades multilingues.
- El runtime ArkheionNet es un proyecto propio del autor, con licencia Apache-2.0, pero no se ha demostrado su estabilidad en produccion ni su compatibilidad con otros frameworks.
- No se proporcionan datos sobre la resolucion, duracion o calidad de los videos generados, ni sobre el proceso de entrenamiento o calibracion de la cuantizacion.
- El modelo no es un LLM de texto; la API compatible con OpenAI mostrada en el ejemplo es una interfaz del runtime, no una capacidad del modelo en si.
- No hay garantia de funcionamiento en GPUs NVIDIA o en hardware que no sea AMD con ROCm/HIP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ooriginador/Wan2.1-14B-DiT-ArkCompact-1.58bit
- Modelo base Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Repositorio oficial de Wan2.1: https://github.com/Wan-Video/Wan2.1
- Pagina del proyecto Wan2.1: https://labitobi.github.io/Wan2.1/
- Sitio web de Wan AI: https://wan.video/
