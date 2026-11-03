# ben0925/CharlieBT_gx32-decider

## Resumen

CharlieBT_gx32-decider es un modelo de la familia Qwen3.5 obtenido por fusión de pesos (weight-space merge) en el espacio de parámetros, no por entrenamiento adicional. Lo publica el usuario ben0925 en HuggingFace y combina dos fine-tunes públicos del modelo base baselabs/mammoth-1 (derivado de Qwen3.5-27B): isomsom/sn92-gen-m87b y xflud/sn92-decider-1. El resultado conserva la arquitectura Qwen3_5Model con un layout de lectura conjunta (joint readout) propio de la familia REAX, que incluye un fichero `readout.safetensors` y un `decision_config.json`.

El modelo tiene 26.085.330.160 parámetros en formato safetensors (unos 26,1 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamano. El repo ocupa 52,2 GB, coherente con pesos en bfloat16. La licencia es MIT y el modelo se distribuye sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks publicados.

Su relevancia es fundamentalmente experimental: documenta una receta de merge TIES reproducible (con MERGE.json) sobre un backbone Qwen3.5, útil para quienes investigan fusion de modelos, pero al no haber entrenamiento propio ni evaluaciones publicadas, no es un candidato contrastado para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (transformer denso) con layout REAX de joint readout |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (+ readout.safetensors, decision_config.json) |

## Arquitectura y entrenamiento

El backbone es Qwen3_5Model, un transformer denso de aproximadamente 26,1 mil millones de parámetros, post-entrenado desde Qwen3.5-27B (Apache-2.0) por baselabs como mammoth-1. Sobre ese backbone, la familia REAX introduce un layout de lectura conjunta: además de los tensores del backbone, el modelo incluye un `readout.safetensors` y un `decision_config.json` que definen cómo se combinan las salidas para producir la decisión final.

No hay entrenamiento propio por parte de ben0925. Todos los cambios aprendidos proceden de los dos modelos padre. La receta es un merge TIES tensor a tensor: para cada tensor se conservan las top-0,5 entradas por magnitud de cada padre, se elige el signo por suma ponderada (pesos m87b 1, dec1 1, lam 1) y se promedian las entradas coincidentes; el cálculo se hace en float32 tensor a tensor y se redondea una sola vez a bfloat16. Para el readout se toma la media ponderada de los readouts de los padres tras dividir cada uno por su escala de mínimos cuadrados respecto al readout base. Config, tokenizer y configs de decisión/joint proceden del modelo base, y MERGE.json registra la receta completa.

## Capacidades

- Generación de texto y razonamiento: heredadas del backbone Qwen3.5-27B vía los padres, sin evaluación publicada específica.
- Modelo orientado a decisión: el layout REAX con joint readout y decision_config sugiere un uso centrado en tareas de clasificación/decisión, aunque la model card no detalla el formato exacto de salida.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en fusión de modelos: usar el modelo como referencia reproducible para estudiar el efecto de TIES con dos padres de peso equivalente, apoyándose en MERGE.json para replicar la receta.
- Evaluación comparativa de merges: medir el rendimiento del merge frente a cada padre por separado en tareas de decisión, para cuantificar si la fusión aporta o degrada respecto a los originales.
- Prototipos de clasificación/decisión: aprovechar el joint readout y decision_config.json para experimentar con cabezas de decisión sobre un backbone Qwen3.5 de 26B, siempre tras validar el formato de salida.
- Base para fine-tuning posterior: partir de un checkpoint ya fusionado en bfloat16 y aplicar un ajuste específico de dominio, reduciendo el coste frente a entrenar desde el modelo base.
- Estudio de estabilidad numérica de merges: analizar el impacto del redondeo único a bfloat16 y del escalado de readout por mínimos cuadrados en la calidad final.
- Docencia y experimentación con licencia permisiva: al ser MIT, sirve para ejercicios prácticos de merge y despliegue en entornos académicos sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (52,2 GB de repo), se necesitan aproximadamente 52-55 GB solo para pesos, más overhead de activaciones y KV cache; en fp16/bf16 no cabe en GPUs de 24 GB.
- Cuantización a 8 bits: alrededor de 26-28 GB, viable en una RTX 4090 de 24 GB solo con cuantizaciones más agresivas o con offload parcial.
- Cuantización a 4 bits: aproximadamente 13-15 GB, cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen para contexto moderado.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantización; L40S 48 GB y A6000 48 GB quedan al límite para bf16.
- Opciones de despliegue: vLLM y TGI para serving en bf16; llama.cpp y Ollama para GGUF cuantizado; transformers con accelerate para prototipos. La compatibilidad exacta con el layout REAX (readout separado) debe verificarse, ya que no es un checkpoint Qwen3.5 estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CharlieBT_gx32-decider | 26,1B | no disponible | MIT | Merge TIES de dos fine-tunes; sin benchmarks |
| baselabs/mammoth-1 (base) | ~27B (Qwen3.5-27B) | no disponible | MIT | Modelo base post-entrenado del que derivan los padres |
| isomsom/sn92-gen-m87b (padre) | no disponible | no disponible | MIT | Fine-tune padre, peso 1 en el merge |
| xflud/sn92-decider-1 (padre) | no disponible | no disponible | MIT | Fine-tune padre, peso 1 en el merge |

Los parámetros y contextos de los padres no están disponibles en la información proporcionada; la comparación de rendimiento no puede realizarse sin benchmarks publicados.

## Limitaciones y advertencias

- Sin entrenamiento propio ni evaluaciones: no hay benchmarks que respalden la calidad del merge; el rendimiento puede quedar por debajo de cualquiera de los padres en tareas concretas.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia, agravado por la ausencia de validación específica del merge.
- Sesgos: no documentados; se heredan los de Qwen3.5-27B y los datasets de los padres, sin análisis publicado.
- Idiomas: no se declaran idiomas soportados; no asumir cobertura multilingüe sin probarla.
- Contexto máximo: no disponible; no planificar despliegues con ventanas largas sin verificar la config del backbone.
- Compatibilidad del layout REAX: el checkpoint no es un Qwen3.5 estándar (incluye readout.safetensors y decision_config.json); herramientas de serving genéricas pueden no cargarlo sin adaptaciones.
- Uso comercial: la licencia MIT lo permite, pero deben respetarse los avisos de copyright de los padres (NOTICE) y los términos Apache-2.0 de Qwen3.5-27B incluidos en LICENSE-APACHE-2.0.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; modelo recién publicado (noviembre de 2026) y sin comunidad que lo haya validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ben0925/CharlieBT_gx32-decider
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Qwen3.5-27B (origen del backbone): no disponible en la informacion proporcionada
- Paper o blog del merge TIES: no disponible en la informacion proporcionada
