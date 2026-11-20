# medoali2/Qwen3.5-122B-A10B-NVFP4-vllm-docker-jetson-agx-thor

## Resumen

Este repositorio de Hugging Face no contiene pesos de modelo, sino una imagen Docker comprimida (31,2 GB) que permite ejecutar un servidor de inferencia vLLM para el modelo Qwen3.5-122B-A10B cuantizado a NVFP4 sobre una NVIDIA Jetson AGX Thor. El autor, medoali2, empaqueta aquí los tarballs divididos de la imagen junto con sumas de verificación SHA-256, mientras que la documentación, los parches y los scripts de reproducción residen en un repositorio GitHub complementario. Se presenta como el primer despliegue confirmado de Qwen3.5-122B-A10B en precisión NVFP4 sobre un único Jetson AGX Thor con 128 GB de memoria unificada.

El modelo subyacente, Qwen3.5-122B-A10B, es un transformer de mezcla de expertos (MoE) de Qwen con 122 000 millones de parámetros totales y 10 000 millones activos, según la nomenclatura del identificador. La propuesta de este repositorio es hacer viable su inferencia en hardware de borde con arquitectura Blackwell, que dispone de tensor cores nativos para FP4, reduciendo los pesos a aproximadamente 75 GB tras el resharding a NVFP4 mediante compressed-tensors.

La relevancia actual radica en que demuestra que un MoE de gran tamaño puede servirse en un SoC integrado con memoria unificada LPDDR5x, a costa de un throughput modesto (18,9 tokens por segundo en decodificación) y una ventana de contexto limitada a 16 384 tokens. Es un artefacto de despliegue reproducible más que un modelo nuevo, y su utilidad depende de disponer exactamente del hardware Jetson AGX Thor y de los pesos NVFP4 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), según el identificador del modelo base Qwen3.5-122B-A10B; detalles internos no disponibles |
| Parametros totales | 122 000 millones (según nomenclatura del modelo base) |
| Parametros activos | 10 000 millones (según nomenclatura del modelo base) |
| Longitud de contexto | 16 384 tokens (configurada en el servidor vLLM de este despliegue) |
| Tipos de cuantizacion | NVFP4 con compressed-tensors (pesos reshardeados a ~75 GB) |
| Idiomas soportados | en (inglés) declarado en la model card; cobertura multilingüe del modelo base no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos no incluidos en el repositorio; la imagen espera pesos NVFP4 reshardeados. La imagen se distribuye como tarballs `.tar.gz` divididos |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su condición de MoE con 122 000 millones de parámetros totales y 10 000 millones activos, y de la mención a 94 capas en las notas del despliegue. No se aportan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones de atención o decodificación del modelo original.

Lo que sí está documentado es la capa de despliegue: la imagen parte de un commit fijado de vLLM con dos parches aplicados (el texto se corta antes de especificarlos), usa el backend de atención FlashInfer y cuantización compressed-tensors en NVFP4, y aprovecha los tensor cores FP4 de la GPU Blackwell integrada en el Thor. Se requiere desactivar el kernel MoE FP4 de FlashInfer mediante `VLLM_USE_FLASHINFER_MOE_FP4=0` porque está roto en esta plataforma, y se recomienda encarecidamente no usar `--enforce-eager`, ya que sin gráficos CUDA el TTFT se dispara a unos 120 segundos en prompts de ~900 tokens. Con captura de gráficos CUDA y caché persistente, el TTFT estimado baja a 10-20 segundos.

## Capacidades

- Generación de texto en inglés mediante una API compatible con OpenAI expuesta por vLLM en el puerto 8000.
- Razonamiento y generación de código: capacidades inferidas del modelo base Qwen3.5, no verificadas en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card solo declara inglés; no se detalla cobertura adicional.
- Capacidad especial destacable del artefacto: ejecución de un MoE de 122B en FP4 sobre memoria unificada de 128 GB en un SoC ARM de borde.
- Concurrencia limitada: el despliegue recomendado fija `--max-num-seqs 2`.

## Casos de uso

- Inferencia de borde con requisitos de privacidad: desplegar el modelo en un Jetson AGX Thor local permite procesar texto sin enviar datos a la nube, útil en entornos industriales o sanitarios donde la soberanía del dato es crítica. El límite de 16 384 tokens condiciona el tamaño de los documentos procesables.
- Prototipado y evaluación de modelos MoE grandes en hardware embebido: investigadores pueden medir el comportamiento real de un 122B-A10B en FP4 sobre Blackwell sin adquirir servidores con GPUs de datacenter, usando los scripts de reproducción del repositorio GitHub.
- Procesamiento por lotes de baja concurrencia: con `--max-num-seqs 2` y 18,9 t/s de decodificación, el sistema encaja en tareas asíncronas como resumen de informes o clasificación de textos donde la latencia no es el factor limitante.
- Servicio de generación de texto en robots o vehículos autónomos: la integración en un SoC con CPU Arm de 12 núcleos y GPU integrada permite incorporar un LLM local a pipelines de percepción y planificación que ya corren en el mismo dispositivo.
- banco de pruebas para cuantización NVFP4: el repositorio sirve para validar flujos de resharding con compressed-tensors y comparar precisión y rendimiento frente a BF16 en hardware Blackwell de borde.
- Demostraciones y docencia: un único dispositivo permite mostrar el funcionamiento interno de un servidor vLLM con API OpenAI, útil en cursos sobre despliegue de modelos, aunque el arranque inicial con captura de gráficos CUDA añade 10-20 minutos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados corresponden al despliegue en Jetson AGX Thor, no a benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros).

| Metrica | Valor |
|---|---|
| Throughput de decodificacion | 18,9 t/s |
| TTFT con `--enforce-eager` | ~120 s (no recomendado) |
| TTFT sin `--enforce-eager` | ~10-20 s (estimado tras warmup de graficos CUDA) |
| VRAM en inicializacion (pico) | ~97 GB |
| VRAM en regimen estable | ~75-80 GB |
| Contexto maximo | 16 384 tokens |
| `--gpu-memory-utilization` | 0,72 |
| Backend de atencion | FlashInfer |
| Tamano de pesos reshardeados | ~75 GB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: NVIDIA Jetson AGX Thor con SoC Thor (arquitectura GPU Blackwell), 128 GB de memoria unificada LPDDR5x, CPU Arm Cortex-X925 de 12 núcleos, SSD NVMe para los pesos y Ubuntu 24.04 aarch64 con CUDA 12.x (JetPack).
- La imagen es exclusivamente aarch64 y requiere una GPU Blackwell para ejecutar NVFP4; no funciona en x86 ni en Jetson anteriores.
- VRAM/memoria unificada: pico de ~97 GB en inicialización y ~75-80 GB en régimen estable; los pesos reshardeados ocupan ~75 GB en disco.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por el tamaño de los pesos y la dependencia de NVFP4 nativo; no hay datos de despliegue en A100 o H100 en la información disponible.
- Despliegue mediante Docker con nvidia-container-runtime, cargando los tarballs divididos y verificando con `sha256sums.txt`.
- Variables de entorno obligatorias: `VLLM_USE_FLASHINFER_MOE_FP4=0`, `LD_PRELOAD=/usr/lib/aarch64-linux-gnu/nvidia/libcuda.so.1` y `HF_HUB_DISABLE_XET=1`.
- Montar un volumen persistente en `/root/.cache/vllm` para conservar los gráficos CUDA; de lo contrario, cada arranque añade 10-20 minutos.
- No superar `--gpu-memory-utilization 0.72` (provoca OOM durante el perfilado de la caché KV) ni aumentar `--max-num-seqs` por encima de 2 sin probar.
- Latencia y throughput: 18,9 t/s de decodificación y TTFT de 10-20 s estimado sin `--enforce-eager`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel de artefacto de despliegue, las alternativas serían otras imágenes vLLM para Jetson o despliegues en x86 con GPUs de datacenter, pero no se aportan cifras de estos escenarios.

| Criterio | Este repositorio (Qwen3.5-122B-A10B NVFP4 en Thor) | Alternativas |
|---|---|---|
| Parametros | 122B totales / 10B activos | no disponible |
| Contexto | 16 384 tokens | no disponible |
| Rendimiento | 18,9 t/s en Thor | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Imagen Docker aarch64 en HF; pesos no incluidos | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo: es necesario descargar Qwen3.5-122B-A10B y reshardearlo a NVFP4 con el script del repositorio GitHub, lo que añade complejidad y dependencia de un tercer repositorio.
- La imagen solo funciona en Jetson AGX Thor (aarch64, GPU Blackwell); no es portable a x86, A100, H100 ni Jetson anteriores.
- El contexto está limitado a 16 384 tokens en esta configuración, muy por debajo de lo habitual en modelos de su clase.
- El throughput de 18,9 t/s y la concurrencia máxima de 2 secuencias limitan su uso en producción con múltiples usuarios.
- `--enforce-eager` degrada el TTFT a ~120 s; omitirlo exige un warmup inicial de 10-20 minutos y un volumen persistente para la caché de gráficos CUDA.
- El kernel MoE FP4 de FlashInfer está roto en Thor y debe desactivarse, lo que puede afectar al rendimiento del MoE.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse también la licencia del modelo base Qwen3.5-122B-A10B antes de desplegarlo en producción.
- El aviso de inicio `ld.so ... cannot be preloaded` es benigno según el autor, pero conviene monitorizarlo en entornos automatizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/medoali2/Qwen3.5-122B-A10B-NVFP4-vllm-docker-jetson-agx-thor
- Repositorio GitHub con scripts, parches y documentación: https://github.com/patrickbdevaney/qwen-3.5-122b-a10b-jetson-thor
- Pesos del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
