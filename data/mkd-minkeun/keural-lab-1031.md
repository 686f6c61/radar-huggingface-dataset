# mkd-minkeun/Keural-Lab-1031

## Resumen

Keural-Lab-1031 es un checkpoint experimental publicado por el usuario mkd-minkeun bajo la marca Keural, obtenido mediante fine-tuning del modelo Qwen3.8-Flash-Next de Alibaba. Se trata de un modelo de generación de texto con arquitectura Mixture of Experts (MoE) que, según la model card, declara aproximadamente 65.000 millones de parámetros totales con unos 6.700 millones activos por token, aunque el recuento real de pesos en safetensors asciende a 116.963.395.731 parámetros. El repositorio ocupa 233,9 GB y se distribuye en formato safetensors.

El modelo se presenta como un experimento de laboratorio sin documentación sobre el dataset de entrenamiento, el proceso de alineamiento ni los idiomas soportados. Su relevancia es limitada: los benchmarks publicados por el propio autor muestran un rendimiento sistemáticamente inferior al de Qwen3.6-35B-A3B en todas las métricas evaluadas (MMLU, MMLU-Pro, GPQA Diamond, GSM8K e IFEval), lo que sugiere que el fine-tuning ha degradado las capacidades del modelo base en lugar de mejorarlas.

La licencia es la Qwen Community License 1.0, heredada del modelo base, con la restricción de la cláusula 2 que exige una licencia separada de Qwen para empresas que operen servicios Model-as-a-Service o asistentes de IA comerciales. El modelo se distribuye sin garantías y con información técnica muy incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, derivada de Qwen3.8-Flash-Next |
| Parametros totales | 116.963.395.731 (recuento real en safetensors); la model card declara ~65B |
| Parametros activos | ~6.700 millones por token (según model card) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible en el repositorio principal; existe una variante GGUF en `mkd-minkeun/Keural-Lab-1031-GGUF` |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors (repositorio principal); GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture of Experts, heredada directamente de Qwen3.8-Flash-Next. La model card declara ~65B parámetros totales y ~6,7B activos por token, pero el recuento real de tensores en safetensors es de 116.963.395.731 parámetros, una discrepancia de casi el doble que no se explica en la documentación. No se especifica el número de expertos, el número de expertos activados por token, la dimensión oculta ni la configuración de atención.

No hay información sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. Tampoco se documentan innovaciones técnicas específicas del fine-tuning. El checkpoint se etiqueta como "experimental" y fue creado y actualizado el mismo día (2 de noviembre de 2026), lo que apunta a una publicación sin validación extensa.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y matemáticas: la model card reporta resultados en MMLU, MMLU-Pro, GPQA Diamond y GSM8K con "thinking enabled", lo que indica soporte de modo de razonamiento extendido.
- Seguimiento de instrucciones: evaluado con IFEval (0,860).
- Capacidades multilingües: no documentadas; no se especifica qué idiomas cubre.
- Tool calling / function calling: no documentado explícitamente, aunque el modelo base Qwen3.8-Flash-Next probablemente lo soporte; no hay confirmación en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión, audio u otras modalidades: no disponibles; el pipeline es únicamente de texto.

## Casos de uso

- Experimentación e investigación sobre fine-tuning de modelos MoE: el checkpoint sirve como caso de estudio de cómo un fine-tuning sin documentar puede degradar el rendimiento del modelo base, útil para investigadores que estudien dinámicas de olvido catastrófico.
- Evaluación comparativa de checkpoints derivados: permite contrastar el impacto del fine-tuning frente a Qwen3.6-35B-A3B usando el mismo harness (lm-evaluation-harness con vLLM), tal como reporta el autor.
- Generación de texto en entornos de prueba no críticos: con 32.768 tokens de contexto en el ejemplo de despliegue, puede usarse para prototipos de chat o generación de texto donde la precisión no sea un requisito estricto.
- Despliegue en infraestructura multi-GPU: el ejemplo con `--tensor-parallel-size 4` en vLLM indica que está pensado para servirse en clústeres con al menos cuatro GPUs, adecuado para pruebas de infraestructura de inferencia distribuida.
- Pruebas de cuantización y formatos GGUF: la existencia de un repositorio GGUF separado permite experimentar con cuantizaciones para llama.cpp en entornos con recursos limitados.
- Referencia para auditorías de licencias: como derivado de Qwen3.8-Flash-Next bajo Qwen Community License 1.0, sirve para estudiar las obligaciones de la cláusula 2 en despliegues comerciales tipo MaaS.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, con el mismo harness (lm-evaluation-harness con vLLM, conjuntos de test completos, thinking habilitado):

| Benchmark | Keural-Lab-1031 | Qwen3.6-35B-A3B |
|---|---|---|
| MMLU | 0,798 | 0,839 |
| MMLU-Pro | 0,750 | 0,847 |
| GPQA Diamond | 0,678 | 0,803 |
| GSM8K | 0,930 | 0,963 |
| IFEval | 0,860 | 0,941 |

El modelo queda por debajo del comparador en las cinco métricas, con diferencias especialmente marcadas en MMLU-Pro (−0,097), GPQA Diamond (−0,125) e IFEval (−0,081). No se han publicado resultados frente a otros modelos ni frente al propio Qwen3.8-Flash-Next.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 234 GB solo para pesos, más overhead de activaciones y caché KV; requiere al menos 4 GPUs de 80 GB (A100/H100) con tensor parallelism.
- El ejemplo oficial usa `vllm serve ... --tensor-parallel-size 4 --max-model-len 32768`, lo que confirma un despliegue mínimo de 4 GPUs.
- GPU recomendadas: A100 80GB, H100 80GB o H200 en configuraciones de 4 o más unidades.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en precisión completa; sería necesaria cuantización agresiva (GGUF Q4 o inferior) y aun así el tamaño efectivo probablemente exceda la VRAM de una sola GPU consumer.
- Opciones de despliegue: vLLM (documentado), llama.cpp mediante el repositorio GGUF `mkd-minkeun/Keural-Lab-1031-GGUF`, y potencialmente TGI u otros servidores compatibles con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MMLU | MMLU-Pro | GPQA Diamond | GSM8K | IFEval | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| Keural-Lab-1031 | ~117B (real) / ~65B (declarado) | ~6,7B | no disponible | 0,798 | 0,750 | 0,678 | 0,930 | 0,860 | Qwen Community 1.0 |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | 0,839 | 0,847 | 0,803 | 0,963 | 0,941 | Qwen Community 1.0 |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Qwen Community 1.0 |

El único comparador con datos es Qwen3.6-35B-A3B, que supera a Keural-Lab-1031 en todas las métricas pese a tener menos parámetros totales y activos. No hay datos publicados del modelo base Qwen3.8-Flash-Next en la información disponible.

## Limitaciones y advertencias

- Rendimiento inferior al comparador en todos los benchmarks publicados; el fine-tuning parece haber degradado las capacidades del modelo base.
- Discrepancia grave entre los parámetros declarados (~65B) y los reales en safetensors (116,96B), lo que dificulta la planificación de recursos.
- Ausencia total de documentación sobre datos de entrenamiento, alineamiento, idiomas y sesgos conocidos.
- Riesgo elevado de alucinación y de comportamiento impredecible al ser un checkpoint experimental sin validación.
- Idiomas soportados no especificados; no se puede garantizar un rendimiento aceptable fuera del inglés o el chino del modelo base.
- Licencia Qwen Community 1.0: la cláusula 2 exige licencia separada de Qwen para empresas que ofrezcan Model-as-a-Service o asistentes de IA comerciales; revisar antes de cualquier uso comercial.
- Contexto máximo no documentado; el ejemplo usa 32.768 tokens, pero no se confirma si es el límite real.
- Publicado y actualizado el mismo día, con 1 like y 600 descargas: sin comunidad que valide su comportamiento en producción.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mkd-minkeun/Keural-Lab-1031
- Repositorio GGUF: https://huggingface.co/mkd-minkeun/Keural-Lab-1031-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/mkd-minkeun/Keural-Lab-1031/blob/main/LICENSE
