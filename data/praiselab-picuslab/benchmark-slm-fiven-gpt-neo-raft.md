# praiselab-picuslab/benchmark-slm-fiven-gpt-neo-raft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gpt-neo-raft` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base `EleutherAI/gpt-neo-1.3B`. Por la nomenclatura del identificador y las etiquetas del repositorio (`benchmark-slm`, `dataset-fiven`, `strategy-raft`, `or2`), se trata de un artefacto generado dentro de una batería de experimentos comparativos sobre modelos de lenguaje pequeños, probablemente con la estrategia RAFT (Retrieval-Augmented Fine-Tuning) sobre un conjunto de datos denominado "fiven". No es un modelo entrenado desde cero ni un modelo de propósito general publicado de forma autónoma: es un peso delta que necesita el modelo base para funcionar.

El interés del artefacto es fundamentalmente metodológico, no de producto. Sirve como evidencia reproducible de un punto concreto de una matriz de experimentos (una estrategia de ajuste, un dataset y un modelo base determinados) y permite reproducir esa configuración concreta. No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del adaptador ni los hiperparámetros utilizados.

El repositorio está restringido (gated), no acumula descargas ni interacciones y declara únicamente el idioma italiano en sus metadatos, lo que sugiere un ajuste orientado a una tarea concreta en ese idioma más que una mejora general multilingüe. Cualquier evaluación de calidad debe hacerse contra el caso de uso original del benchmark, que no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-3 (modelo base `EleutherAI/gpt-neo-1.3B`), con adaptadores LoRA inyectados vía PEFT |
| Parametros totales | 1.3B en el modelo base; número de parámetros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens, heredada del modelo base; el adaptador no la modifica |
| Tipos de cuantizacion | No especificados en el repositorio; el adaptador se distribuye en safetensors y el modelo base admite fp16, bf16, int8 e int4 (GPTQ/AWQ/GGUF de terceros) |
| Idiomas soportados | Italiano (`it`) según los metadatos del repositorio; cobertura real del ajuste no verificada |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA en formato PEFT); requiere descargar por separado `EleutherAI/gpt-neo-1.3B` |
| Libreria / framework | PEFT |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 0.0 GB (adaptador de bajo rango, sin pesos completos) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only estilo GPT-3 con atención causal completa, 24 capas, dimensión oculta de 2048 y 16 cabezas de atención, preentrenado por EleutherAI sobre The Pile (aproximadamente 825 GiB de texto en inglés). Sobre esa pila se añaden capas LoRA de bajo rango, que modifican únicamente un subconjunto de matrices de proyección y dejan congelados los pesos originales. El repositorio no publica ni el rango (`r`), ni el `lora_alpha`, ni el `target_modules`, ni el dropout empleados.

Respecto al entrenamiento del adaptador, la información disponible es mínima: las etiquetas indican la estrategia `raft` y el dataset `fiven`, y el pipeline declarado es `text-generation`. No se especifica el volumen de tokens, la composición del corpus, si hubo fases de instrucción supervisada, preferencias (RLHF/DPO) o refuerzo, ni la métrica objetivo del benchmark. La etiqueta `or2` no tiene descripción pública en la información proporcionada. Todo lo anterior debe tratarse como desconocido a efectos de reproducibilidad.

## Capacidades

- Generación de texto autoregresiva en italiano, condicionada al ajuste LoRA sobre el dataset "fiven".
- Ejecución de la tarea específica del benchmark de modelos pequeños (`benchmark-slm`) para la que fue entrenado; la tarea exacta no está documentada.
- Posible comportamiento de generación aumentada por recuperación, si la estrategia RAFT se aplicó en el sentido habitual del término (el modelo aprendería a condicionarse sobre pasajes recuperados); no confirmado en la información disponible.
- Capacidad multilingüe muy limitada: el modelo base es predominantemente anglófono y el adaptador declara solo italiano.
- Soporte de tool calling / function calling: no disponible; el modelo base no fue entrenado con ese formato y el adaptador no lo declara.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.
- Ventana de contexto limitada a 2048 tokens, suficiente para turnos cortos y documentos pequeños, insuficiente para corpus largos.

## Casos de uso

- Reproducción de experimentos académicos: cargar el adaptador junto a `EleutherAI/gpt-neo-1.3B` con PEFT para verificar los resultados de la matriz de benchmarking `benchmark-slm` en la celda correspondiente a GPT-Neo-1.3B con estrategia RAFT sobre el dataset "fiven".
- Evaluación comparativa de estrategias de ajuste eficiente: usar este adaptador como referencia frente a otras variantes del mismo benchmark para medir la contribución aislada de la estrategia RAFT con un presupuesto de cómputo reducido.
- Baseline de bajo coste en prototipos en italiano: servir el modelo en una GPU de gama consumer para tareas de generación de texto acotadas antes de invertir en un modelo mayor.
- Generación de texto condicionada a contexto recuperado: si la hipótesis RAFT se confirma, integrarlo en un pipeline RAG ligero donde el pasaje recuperado se inserta en el prompt y el modelo produce la respuesta en italiano.
- Estudio de olvido catastrófico y degradación del base: comparar las salidas del adaptador contra el modelo base sin ajustar para cuantificar cuánto inglés y cuánta capacidad general se pierde tras el ajuste en italiano.
- Docencia y formación técnica: ejemplo práctico y de tamaño manejable para ilustrar el ciclo completo de PEFT (carga del base, aplicación del adaptador, `merge_and_unload`, cuantización y despliegue) en un curso de IA open source.
- Filtrado y clasificación ligera de texto italiano en local: clasificación por generación o etiquetado de fragmentos cortos en entornos sin conectividad, siempre que la tarea coincida con la del benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de métricas, tarjeta de modelo con evaluación, ni comparación con otras celdas del benchmark `benchmark-slm`.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 2,5-2,8 GB solo para los pesos del modelo base; el adaptador LoRA añade del orden de decenas de megabytes.
- VRAM en int8: en torno a 1,4-1,6 GB; en int4 (GGUF Q4_K_M o equivalente): aproximadamente 0,8-1,0 GB.
- VRAM adicional para el contexto: con 2048 tokens de ventana, la caché KV es pequeña (del orden de centenares de megabytes con batch 1), por lo que el factor dominante son los pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 2060) funciona en fp16 con margen; una RTX 4090, A100 o H100 no aporta ventaja por capacidad, solo por throughput en batch grande.
- Cabe holgadamente en GPU consumer, e incluso en CPU con cuantización int4 mediante llama.cpp, a velocidades de decenas de tokens por segundo en procesadores modernos.
- Opciones de despliegue: `transformers` + `peft` (ruta de referencia), vLLM con soporte de adaptadores LoRA y modo multi-LoRA, Text Generation Inference con `--lora-adapters`, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF, y servidores propios basados en FastAPI.
- Latencia y throughput: no disponibles como medición publicada. A título orientativo, un modelo de 1.3B en una GPU consumer moderna suele moverse en el orden de decenas a centenares de tokens por segundo con batch 1 y decodificación en fp16; no hay dato verificado para esta configuración concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-gpt-neo-raft` | 1.3B (base) + LoRA | 2048 | Adaptador PEFT sobre GPT-Neo | No disponible | Gated, 0 descargas |
| `EleutherAI/gpt-neo-1.3B` (base sin ajustar) | 1.3B | 2048 | Transformer decoder-only denso | Apache 2.0 | Pública |
| `EleutherAI/gpt-neo-2.7B` | 2.7B | 2048 | Transformer decoder-only denso | Apache 2.0 | Pública |
| `meta-llama/Llama-3.2-1B` | 1.2B | 128k | Transformer decoder-only denso | Licencia comunitaria Llama 3.2 | Pública con aceptación |
| `Qwen/Qwen2.5-1.5B` | 1.5B | 32k | Transformer decoder-only denso | Apache 2.0 | Pública |

No hay datos de rendimiento comparativos publicados para este adaptador, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Frente a las alternativas modernas de tamaño similar, el modelo base GPT-Neo (2021) queda muy por detrás en longitud de contexto (2048 frente a 32k-128k), en calidad de generación instruida y en soporte nativo de tool calling; su ventaja es el coste de inferencia y la simplicidad del stack.

## Limitaciones y advertencias

- Sesgos: heredados de The Pile y del preentrenamiento en inglés de GPT-Neo, con el añadido de los sesgos del dataset "fiven", cuya composición se desconoce. No se ha realizado ninguna evaluación de sesgo documentada.
- Alucinación: GPT-Neo-1.3B tiene una fiabilidad factual baja incluso sin ajuste; un ajuste LoRA sobre un dataset específico puede aumentar la confianza en dominios fuera de distribución sin mejorar la veracidad.
- Contexto: 2048 tokens es un límite duro y reducido para estándares actuales; no admite conversaciones largas ni documentos extensos sin truncado o troceado.
- Idioma: el adaptador declara únicamente italiano. Se espera degradación del rendimiento en inglés y ausencia total de soporte fiable en castellano, catalán, gallego o euskera.
- Licencia: no disponible. Esto impide determinar si el uso comercial está permitido; no debe desplegarse en producción sin aclarar antes los términos, y hay que tener en cuenta la licencia Apache 2.0 del modelo base, que no cubre automáticamente al adaptador.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que añade fricción a la reproducibilidad y a la automatización de pipelines.
- Reproducibilidad: sin hiperparámetros, sin datos de entrenamiento y sin métricas publicadas, los resultados no son verificables de forma independiente.
- Madurez: 0 descargas y 0 interacciones indican ausencia de validación por parte de la comunidad; no hay evidencia externa de que el adaptador funcione correctamente.
- Producción: no recomendado como componente crítico sin una evaluación propia sobre el caso de uso concreto y sin claridad licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gpt-neo-raft
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-1.3B
- Organización autora: https://huggingface.co/praiselab-picuslab
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de GPT-Neo / The Pile (Gao et al., 2020): https://arxiv.org/abs/2101.00027
- Paper de RAFT (Zhang et al., 2024): https://arxiv.org/abs/2404.10198
- Documentación de adaptadores LoRA en vLLM: https://docs.vllm.ai/en/latest/features/lora.html
