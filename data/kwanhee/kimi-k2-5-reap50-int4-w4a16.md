# kwanhee/Kimi-K2.5-REAP50-INT4-W4A16

## Resumen

Kimi-K2.5-REAP50-INT4-W4A16 es un checkpoint de diagnóstico creado por kwanhee que aplica una poda de expertos (pruning) al modelo multimodal Kimi-K2.5 de Moonshot AI. Concretamente, elimina la mitad de los expertos enrutados (de 384 a 192) sin recuantizar los pesos supervivientes: los expertos conservados se extraen bit a bit del modelo base, que ya venía con pesos INT4. El resultado es un modelo MoE de 519.453.777.648 parámetros totales, con 288.4 GB de pesos y una ventana de contexto de 73728 tokens.

El propósito declarado es aislar el efecto de la poda de expertos sin el confundidor de una recuantización adicional, por lo que se presenta como una pieza de investigación y no como una variante competitiva. Recupera el 97.99% del promedio OpenLLM v1 del modelo denso (80.77 frente a 82.43) en evaluaciones de texto. La arquitectura mantiene en bf16 la atención, los expertos compartidos, los MLPs densos, la cabeza de lenguaje y toda la torre de visión, mientras que los expertos enrutados permanecen en INT4 con group size 32 y simetría heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 192 expertos enrutados de los 384 originales, top-8 activos, y componentes densos en bf16 |
| Parametros totales | 519.453.777.648 |
| Parametros activos | no disponible |
| Longitud de contexto | 73728 tokens (segun configuracion de serving) |
| Tipos de cuantizacion | INT4 W4A16 (solo pesos, group size 32, simetrico) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (Modified MIT License) |
| Formato de pesos | safetensors (58 shards, 104.870 tensores) |

## Arquitectura y entrenamiento

El modelo parte de Kimi-K2.5, un modelo multimodal agéntico nativo de Moonshot AI construido mediante preentrenamiento continuo en aproximadamente 15 billones de tokens mixtos visuales y de texto sobre Kimi-K2-Base. En este checkpoint, se aplica la técnica REAP (pruning de expertos) que es pura selección: elimina expertos pero nunca reescribe los supervivientes. Los índices de los 192 expertos conservados se recuperaron haciendo coincidir exactamente las filas del router del modelo podado bf16 con el router base, obteniendo coincidencias exactas en las 60 capas MoE. Posteriormente se extrajeron los tensores correspondientes del checkpoint de lanzamiento, descartando 103.680 tensores de expertos (60 × 192 × 9) y rebanando 120 routers.

La verificación confirma que los tensores de pesos muestreados son bit-identicos al modelo base. No se ejecutó ninguna compresión en esta variante, por lo que no existe configuración de compresión asociada. La cuantización INT4 es la original de Moonshot AI, heredada sin recálculo. Esto convierte al checkpoint en un experimento controlado para medir el coste de la poda de expertos de forma aislada.

## Capacidades

- Generación de texto y razonamiento, evaluados en benchmarks como OpenLLM v1, AIME25, GPQA Diamond y MATH500.
- Capacidades matemáticas destacadas: recupera el 101.5% del rendimiento denso en MATH500.
- Multimodalidad: mantiene la torre de visión completa en bf16, pero no se ha realizado ninguna evaluación multimodal en este checkpoint; todos los resultados reportados son solo de texto.
- Contexto largo de hasta 73728 tokens, configurado para servir con `--max-model-len 73728`.
- Arquitectura MoE con top-8 expertos activos, heredada del modelo base agéntico de Kimi-K2.5.
- Soporte de agentes y tool calling: no se han publicado evaluaciones específicas para esta versión, aunque el modelo base Kimi-K2.5 es un modelo agéntico nativo.

## Casos de uso

- Investigación en pruning de modelos MoE: permite medir el impacto de eliminar el 50% de los expertos enrutados sin el confundidor de una recuantización, gracias a que los pesos INT4 son idénticos al modelo de lanzamiento.
- Evaluación de recuperación de rendimiento: comparar la puntuación de este checkpoint (80.77 en OpenLLM v1) con el modelo denso (82.43) para cuantificar la degradación introducida por la poda.
- Análisis de técnicas de cuantización: sirve como brazo de comparación frente a la variante NVFP4 W4A4 (80.00 en OpenLLM v1), permitiendo aislar el coste de la etapa de cuantización con la poda fijada.
- Experimentación con modelos multimodales podados: al mantener la torre de visión en bf16, es útil para estudiar cómo afecta la poda de expertos a la representación visual, aunque no se han publicado resultados multimodales.
- Despliegue en infraestructura de servidor de alto rendimiento: requiere 4×B200 para la configuración de referencia, lo que lo hace apto para entornos de investigación con clústeres dedicados.
- Validación de pipelines de compresión: sirve como caso de prueba para detectar problemas de carga con `quantization_config` anidado y tensores `weight_shape`, que afectan a la compatibilidad con vLLM y compressed-tensors.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Denso | Recuperacion |
|---|---|---|---|
| OpenLLM v1 (6-task avg) | 80.77 | 82.43 | 97.99% |
| AIME25 | 0.9100 | 0.9567 | 95.1% |
| GPQA Diamond | 0.7879 | 0.8949 | 88.0% |
| MATH500 | 0.9784 | 0.9636 | 101.5% |

Comparación adicional: la misma poda llevada a NVFP4 W4A4 (Kimi-K2.5-REAP50-NVFP4-W4A4-GS16) obtiene 80.00 en OpenLLM v1 con una recuperación del 97.06%. La diferencia entre ambas variantes refleja el coste de la etapa NVFP4 con la poda mantenida constante. Todos los resultados son solo de texto y se midieron con 4×B200, contexto 73728 y `kv-cache-dtype auto`.

## Requisitos de hardware

- VRAM estimada: 288.4 GB solo para los pesos, más el overhead de activaciones y KV cache, lo que exige memoria agregada de varios cientos de GB.
- GPU recomendadas: 4×B200 según la configuración de referencia (`-dp 4`). No se indica soporte para otras configuraciones de hardware.
- Compatibilidad con consumer GPU: no. El modelo no cabe en ninguna GPU de consumo (RTX 4090, etc.) ni siquiera con cuantizaciones agresivas, dado el tamaño de los pesos.
- Opciones de despliegue: requiere un fork de vLLM (`kwanhee-lee/vllm-private`, rama `paired48-nvfp4-moe`). Las versiones stock de vLLM fallan al cargar el modelo debido a los tensores `weight_shape` no registrados para expertos MoE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | OpenLLM v1 | Licencia |
|---|---|---|---|---|
| Kimi-K2.5 (denso) | 519.453.777.648 | 73728 | 82.43 | modified-mit |
| Kimi-K2.5-REAP50-INT4-W4A16 | 519.453.777.648 | 73728 | 80.77 | modified-mit |
| Kimi-K2.5-REAP50-NVFP4-W4A4-GS16 | no disponible | no disponible | 80.00 | modified-mit |

Los tres modelos comparten el mismo punto de partida INT4 de Moonshot AI. La variante INT4-W4A16 es la única que no aplica recuantización, por lo que su comparación directa con la variante W4A4 no es válida: pertenecen a puntos distintos del espacio de diseño (pesos INT4 con activaciones bf16 frente a pesos y activaciones en NVFP4).

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación multimodal; todos los resultados reportados son solo de texto, a pesar de que el modelo mantiene la torre de visión en bf16.
- `quantization_config` está anidado bajo `text_config` en lugar de estar en el nivel superior, lo que provoca que compressed-tensors no lo detecte y el modelo se cargue silenciosamente con los expertos empaquetados, dando resultados incorrectos en lugar de un error. Es necesario comprobar explícitamente la configuración.
- El checkpoint incluye 34.560 tensores `weight_shape` que requieren un loader tolerante. vLLM stock no registra `weight_shape` para expertos MoE, por lo que la carga falla; se necesita el fork proporcionado por el autor.
- Este modelo no es comparable con las variantes W4A4 en tablas de ranking, porque es un diseño solo de pesos (W4A16) con componentes en bf16.
- No existe una versión bf16 oficial de Kimi-K2.5, por lo que la recuperación relativa entre variantes es válida, pero no se puede reportar una degradación absoluta "desde precisión completa".
- El checkpoint se presenta explícitamente como una pieza de diagnóstico, no como un modelo competitivo para producción.
- Licencia modified-mit con atribución a Moonshot AI; los pesos de los expertos pertenecen a Moonshot AI y no han sido modificados.

## Enlaces

- HuggingFace: https://huggingface.co/kwanhee/Kimi-K2.5-REAP50-INT4-W4A16
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
