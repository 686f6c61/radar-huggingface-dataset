# RelaxingSnorlax/nemotron35-dspark-15l-bf16

## Resumen

`RelaxingSnorlax/nemotron35-dspark-15l-bf16` es un artefacto experimental publicado en Hugging Face: un drafter DSpark de decodificación especulativa con 15 capas en BF16 (3.328.319.489 parámetros, 6,7 GB de repositorio) construido a partir del drafter de 5 capas `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark`, en la revisión `4ff45128272e4e5c00ab82d2886946650229ced7`. No es un modelo entrenado ni afinado: cada capa generada `i` copia byte a byte los tensores de la capa `i % 5` del original, de modo que las 15 capas contienen únicamente 5 capas únicas repetidas tres veces, y el resto de tensores no pertenecientes a capas se copian sin cambios.

Su propósito es servir de control estructural en experimentos de recuento de capas: permite medir almacenamiento, tiempo de carga, huella de memoria y latencia de un drafter con el triple de capas manteniendo idénticos los tensores. El drafter está pensado para acompañar al modelo objetivo `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, un MoE de 120B parámetros totales y 12B activos, en despliegues vLLM con `--speculative_config.method dspark`.

Es relevante para el nicho concreto de ingeniería de inferencia que evalúa el coste marginal del número de capas en pipelines de decodificación especulativa, no como modelo generativo. El autor advierte explícitamente de que las capas repetidas no representan un modelo de 15 capas entrenado, de que las métricas de calidad y aceptación del modelo fuente no son aplicables a esta variante y de que no se ha ejecutado ninguna evaluación sobre ella.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter DSpark de decodificación especulativa; 15 capas declaradas en config generadas por repetición del patrón de tipos de capa del drafter fuente de 5 capas |
| Parámetros totales | 3.328.319.489 (dato real de los safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (único formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16), librería `speculators`, requiere `custom_code` |
| Número de capas | 15 declaradas (5 únicas, mapeo `i % 5`) |
| Modelo objetivo | `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` (MoE, 120B totales / 12B activos) |
| Tokens especulativos recomendados | 8 (`num_speculative_tokens`) |
| Draft tensor parallel size | 1 |
| Método de muestreo del drafter | greedy |
| Repositorio | 6,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint es un drafter de decodificación especulativa, es decir, un modelo pequeño que propone tokens candidatos que el modelo objetivo verifica después. La construcción documentada por el autor es puramente estructural: se parte del drafter de 5 capas `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark`, se declaran 15 capas en la configuración, se repite el patrón de tipos de capa del fuente y, para cada capa de salida `i`, se copian los tensores de la capa `i % 5`. No hay reentrenamiento, ni destilación, ni ajuste fino; tampoco hay mezcla de datos de entrenamiento que reportar, porque no se ha entrenado nada.

El repositorio incluye artefactos de reproducibilidad: `derived_from.json` registra el modelo fuente y la regla de construcción, y `drafter_checkpoint_sha256.txt` contiene el SHA-256 de `model.safetensors`. Los registros originales de entrenamiento y cuantización del drafter de 5 capas, cuando existen, se conservan en `provenance/` y están etiquetados explícitamente como artefactos del modelo fuente. El ejemplo de despliegue del autor emplea `--mamba-backend flashinfer` sobre el modelo objetivo, lo que apunta a capas de tipo Mamba en la arquitectura del target, aunque la composición interna del drafter no se detalla en la información disponible.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa junto a `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` mediante el método `dspark` de vLLM.
- Control estructural reproducible para experimentos de recuento de capas: mismos tensores, distinto número de capas declaradas.
- Medición de coste de almacenamiento, carga y memoria de un drafter con 15 capas frente al de 5.
- Verificación de integración con la librería `speculators` y con `trust_remote_code` / `custom_code` en vLLM.
- Punto de comparación para experimentos de latencia con 8 tokens especulativos y `draft_tensor_parallel_size=1`.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: no es un modelo instructivo ni un generador de texto para usuario final.
- Capacidades multilingües: no disponibles (no evaluadas).

## Casos de uso

- **Benchmark de coste por capa en decodificación especulativa**: ejecutar el mismo prompt y la misma configuración de vLLM con este drafter de 15 capas y con el de 5 capas, y medir la diferencia de latencia por token aceptado. El modelo aísla la variable «número de capas» porque los tensores son idénticos.
- **Perfilado de memoria en carga de checkpoints**: cuantificar cuánta VRAM adicional consume un drafter con 15 capas declaradas frente a 5 (6,65 GB de pesos BF16 en este caso) y cómo afecta al espacio reservado para el KV cache del modelo objetivo.
- **Pruebas de regresión de pipelines vLLM**: usar el checkpoint como entrada fija en CI para verificar que una actualización de vLLM o de la librería `speculators` sigue cargando correctamente configuraciones con repetición de tipos de capa y `custom_code`.
- **Validación de estrategias de sharding y tensor parallel**: comprobar el comportamiento de `draft_tensor_parallel_size=1` con un drafter de 15 capas mientras el target de 120B corre en 4 GPU, detectando desbalances de memoria entre rank 0 y el resto.
- **Docencia y divulgación sobre decodificación especulativa**: mostrar de forma tangible qué aporta un drafter, cómo se verifica cada token candidato y por qué repetir capas no mejora la aceptación; el autor deja claro que la calidad no es trasladable.
- **Prueba de estrés de herramientas de empaquetado**: verificar que scripts de conversión, cálculo de hashes, empaquetado GGUF o auditoría de safetensors manejan correctamente un checkpoint con tensores duplicados y pesos compartidos lógicos.
- **Comparación cruzada de artefactos dummy**: contrastar este checkpoint con `RelaxingSnorlax/Qwen3.8-27B-DSpark-BF16-15L`, construido con la misma regla sobre otro drafter, para estandarizar metodologías de medición entre familias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre esta variante y que las mediciones de calidad y aceptación del modelo fuente no son aplicables. No se dispone de datos de latencia, throughput ni tasa de aceptación de tokens especulativos para este checkpoint.

## Requisitos de hardware

- **Pesos**: 3.328.319.489 parámetros en BF16 equivalen a aproximadamente 6,65 GB, coherente con los 6,7 GB del repositorio.
- **VRAM estimada para el drafter**: del orden de 7 a 9 GB incluyendo pesos, buffers de ejecución y cache del propio drafter; no hay mediciones publicadas, es una estimación por tamaño.
- **GPU recomendadas para el drafter**: una sola GPU es suficiente (`draft_tensor_parallel_size=1` en el ejemplo del autor). Encaja en RTX 4090, RTX 3090, A100 40 GB, H100 o cualquier acelerador con 8-16 GB libres.
- **Cabe en GPU de consumo**: sí. Con 6,65 GB de pesos en BF16 entra en tarjetas de 8 GB o superiores, siempre que no se compartan con el modelo objetivo.
- **Requisito del conjunto**: el ejemplo de despliegue sirve el target `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` con `--tensor-parallel-size 4` y `--gpu-memory-utilization 0.89`; en BF16 son unos 240 GB de pesos repartidos entre 4 GPU, lo que exige 4 aceleradores de 80 GB (H100/A100 80 GB) como mínimo estimado.
- **Opciones de despliegue**: vLLM con `--speculative_config.method dspark`, `--trust-remote-code` y `--mamba-backend flashinfer`; librería `speculators`. No se ha validado la compatibilidad ni el rendimiento de esta variante dummy según el autor. No hay soporte documentado para llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles. El autor no ha validado el rendimiento de esta variante.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Capas | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| `RelaxingSnorlax/nemotron35-dspark-15l-bf16` | Drafter DSpark dummy | 3.328.319.489 | 15 (5 únicas) | no disponible | openmdw-1.1 | Experimental, sin evaluar |
| `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark` | Drafter DSpark fuente | no disponible | 5 | no disponible | no disponible | Entrenado y cuantizado por el autor original |
| `RelaxingSnorlax/Qwen3.8-27B-DSpark-BF16-15L` | Drafter DSpark dummy | no disponible | 15 (5 únicas) | no disponible | no disponible | Experimental, sin entrenar |
| `mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DSpark-bf16` | Drafter DSpark para MLX | no disponible | no disponible | no disponible | no disponible | Conversión de formato, no reentrenado |
| `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` (target) | MoE multimodal | 120B totales / 12B activos | no disponible | no disponible | no disponible | Modelo de referencia servido con este drafter |

La diferencia funcional clave frente al drafter de 5 capas es únicamente el recuento de capas declarado y el tamaño en disco; no hay ganancia de calidad esperada, ya que los tensores se repiten. Frente al artefacto de la familia Qwen, la diferencia es el drafter de origen. La conversión MLX citada persigue portabilidad a Apple Silicon, no experimentación estructural.

## Limitaciones y advertencias

- **No es un modelo entrenado**: las 15 capas son 5 capas repetidas byte a byte; no representan un modelo de 15 capas y no deben interpretarse como capacidad adicional.
- **Sin evaluación**: no se ha ejecutado ningún benchmark. Las métricas de calidad y de aceptación de tokens del modelo fuente no son extrapolables a esta variante.
- **Compatibilidad no validada**: el propio autor advierte de que la compatibilidad de servicio y el rendimiento de esta variante dummy no se han verificado, pese a que el comando de ejemplo reproduce la configuración del modelo fuente.
- **Riesgo de alucinación**: el drafter no genera respuestas de usuario; sus propuestas se someten a verificación por el modelo objetivo, que puede rechazarlas. Aun así, no debe emplearse como generador autónomo.
- **Idiomas y contexto**: sin datos publicados; no se puede asumir cobertura multilingüe ni una ventana de contexto concreta.
- **Dependencia de código remoto**: requiere `custom_code` y `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en entornos productivos.
- **Licencia**: openmdw-1.1. Antes de un uso comercial hay que verificar los términos de esa licencia y, en su caso, las condiciones del modelo base y del target; en la información disponible no se detallan las obligaciones concretas.
- **Madurez**: 0 descargas y 0 likes, creado y actualizado el 2026-10-23 con 27 segundos de diferencia; es un artefacto de investigación sin comunidad ni mantenimiento demostrado.
- **No apto para producción**: por diseño es un control experimental, no un componente desplegable en un servicio real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-15l-bf16
- Drafter fuente (RedHatAI): https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
- Modelo objetivo (NVIDIA, BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Artefacto dummy equivalente sobre Qwen3.8-27B: https://huggingface.co/RelaxingSnorlax/Qwen3.8-27B-DSpark-BF16-15L
- Drafter DSpark para Nemotron 3.5 Lightning 30B-A3B en MLX: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DSpark-bf16
- Model card de NVIDIA Nemotron 3.5 Lightning 30B-A3B en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Repositorio de despliegue con DSpark en DGX Spark / RTX 5090 / RTX 6000 PRO: https://github.com/MiaAI-Lab/Nemotron3.5-Lightning-DGX-Spark-RTX-5090-6000-PRO/tree/main
- Página de la familia Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
