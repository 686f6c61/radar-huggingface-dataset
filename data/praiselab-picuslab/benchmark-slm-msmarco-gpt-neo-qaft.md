# praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-qaft

## Resumen

`benchmark-slm-msmarco-gpt-neo-qaft` es un adaptador LoRA publicado con la librería PEFT por el usuario praiselab-picuslab sobre el modelo base EleutherAI/gpt-neo-1.3B. Por el identificador y las etiquetas del repositorio (`benchmark-slm`, `dataset-msmarco`, `strategy-qaft`, `or2`) se trata de un artefacto de investigación orientado a medir el comportamiento de modelos de lenguaje pequeños ajustados sobre el corpus MS MARCO, empleando una estrategia de ajuste consciente de cuantización (QAFT, *quantization-aware fine-tuning*).

El interés del modelo es, por tanto, metodológico más que de producto: sirve como base reproducible para comparar estrategias de ajuste fino eficiente sobre un modelo denso de 1.300 millones de parámetros, un rango de tamaño que cabe en GPU de consumo y que resulta adecuado para experimentación académica con presupuesto limitado. El repositorio no incluye los pesos completos del modelo base (tamaño declarado de 0,0 GB), sino únicamente el adaptador.

La ficha se publicó con fecha de creación y actualización del 23 de octubre de 2026, con 0 descargas y 0 interacciones, acceso restringido mediante *gating* y licencia no declarada. No se han publicado resultados de evaluación ni detalles del proceso de entrenamiento en la información disponible, lo que limita cualquier valoración cuantitativa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-Neo) con adaptador LoRA acoplado; el adaptador se distribuye como módulo PEFT |
| Parametros totales | ~1.300 millones en el modelo base (EleutherAI/gpt-neo-1.3B); el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base GPT-Neo documenta 2.048 tokens |
| Tipos de cuantizacion | no se publican pesos cuantizados; la etiqueta `qaft` indica que el ajuste se realizó con una estrategia consciente de cuantización. El adaptador puede combinarse con el base en FP32, FP16/BF16, INT8 o INT4 mediante herramientas estándar (bitsandbytes, GPTQ/AWQ tras conversión) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible en el repositorio; el modelo base EleutherAI/gpt-neo-1.3B se distribuye bajo Apache 2.0 según su documentación pública |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); no se publican GGUF, GPTQ ni AWQ |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia GPT-Neo, con atención multi-cabeza convencional, tokenizador BPE heredado de GPT-2 y un contexto documentado de 2.048 tokens. Según la documentación pública de EleutherAI, GPT-Neo-1.3B se entrenó sobre The Pile (aproximadamente 825 GiB de texto diverso). Sobre ese modelo se aplica un adaptador LoRA, de modo que la inferencia requiere cargar el base y superponer el adaptador mediante PEFT.

La información disponible no detalla el rango del adaptador, los módulos objetivo, el número de tokens de ajuste, la composición exacta del subconjunto de MS MARCO utilizado, la hiperparametría ni si hubo etapas de RLHF o DPO. La etiqueta `qaft` sugiere que el entrenamiento incorporó simulación de cuantización para preservar el rendimiento tras la compresión, pero no se especifica el esquema (por ejemplo, INT8 o INT4 con *fake quantization*) ni los resultados de dicha estrategia. Tampoco se documenta ninguna innovación arquitectónica adicional: se trata de un ajuste paramétricamente eficiente estándar.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada al ajuste sobre MS MARCO.
- Modelado de pares consulta-pasaje: el ajuste sobre MS MARCO apunta a tareas de relevancia y respuesta a preguntas extractivas en el dominio de búsqueda web.
- Ajuste eficiente con LoRA: el adaptador puede combinarse con el base, mergearse o servirse por separado.
- Compatibilidad con el ecosistema PEFT/Transformers (`AutoPeftModelForCausalLM`), lo que facilita su integración en pipelines de investigación.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el repositorio declara únicamente inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Réplica de experimentos de ajuste eficiente: cargar el adaptador sobre GPT-Neo-1.3B para reproducir la configuración QAFT sobre MS MARCO y comparar curvas de pérdida frente a otras estrategias (LoRA estándar, ajuste completo), con un coste de cómputo contenido.
- Evaluación de modelos pequeños en recuperación de información: usar el modelo como generador de respuestas o como puntuador de pasajes en un *pipeline* de *retrieval-augmented generation* sobre MS MARCO, midiendo MRR@10 o Recall@100 frente al base sin ajustar.
- Línea base para *benchmarking* interno: al ser un adaptador de 1,3B parámetros, sirve como referencia de bajo coste en comparativas de modelos pequeños antes de escalar a modelos de 7B o superiores.
- Docencia y formación técnica: ejemplo completo y ligero de cómo se publica un adaptador PEFT con *gating*, etiquetas de linaje (`base_model:adapter`) y metadatos de dataset, útil en cursos de ajuste fino.
- Prototipado de asistentes de búsqueda en inglés: generar respuestas cortas a consultas tipo MS MARCO en entornos de prueba, siempre con el modelo base en FP16 en una GPU de consumo y sin expectativas de calidad de producción.
- Estudio de degradación por cuantización: al haberse ajustado con estrategia QAFT, permite medir la pérdida de calidad al servir el modelo en INT8 o INT4 frente a FP16, un experimento habitual en despliegues con VRAM limitada.
- Investigación sobre sesgos y toxicidad en modelos heredados de The Pile: el modelo sirve como sujeto de análisis para estudiar cómo el ajuste sobre un corpus de búsqueda modifica (o no) los sesgos del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo base; el adaptador añade decenas de MB): ~5,2 GB en FP32, ~2,6 GB en FP16/BF16, ~1,4 GB en INT8 y ~0,8 GB en INT4. A ello hay que sumar la caché KV, que crece con la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con 6 GB o más para FP16 (RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090). No requiere A100 ni H100; su uso en estas GPU solo tendría sentido para servir muchos adaptadores en paralelo.
- Cabe en GPU de consumo: sí, en FP16 desde 6-8 GB y en cuantización INT4 desde 2-3 GB de VRAM efectiva.
- Opciones de despliegue: `transformers` + `peft` (ruta más directa para el adaptador), vLLM con soporte de adaptadores LoRA, TGI con LoRA, y llama.cpp u Ollama solo tras fusionar el adaptador con el base y convertir a GGUF (no se publica GGUF).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota operativa: el acceso es restringido (*gated*), por lo que es necesario aceptar las condiciones en HuggingFace y autenticarse con un token antes de descargar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| benchmark-slm-msmarco-gpt-neo-qaft (este) | ~1,3B (base) + adaptador | no disponible (base: 2.048) | no disponible | Gated, 0 descargas | Adaptador LoRA de investigación; sin evaluación publicada |
| EleutherAI/gpt-neo-1.3B | 1,3B | 2.048 | Apache 2.0 | Público | Modelo base de 2021, sin adaptador ni ajuste sobre MS MARCO |
| facebook/opt-1.3B | 1,3B | 2.048 | Licencia OPT (uso no comercial) | Público | Alternativa densa de tamaño similar; licencia más restrictiva |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 (v1.0) | Apache 2.0 | Público | Más reciente, con ajuste conversacional; referencia habitual en el rango 1B |

Datos de los modelos comparables tomados de su documentación pública; la información proporcionada del repositorio no incluye comparativas propias.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas en MS MARCO ni en benchmarks generales, por lo que no puede afirmarse que el ajuste mejore al modelo base.
- Licencia no declarada: no se puede asumir uso comercial permitido del adaptador, aunque el base sea Apache 2.0. Es necesario contactar con el autor antes de cualquier uso en producción.
- Acceso restringido: el *gating* impide la descarga anónima y añade fricción a la reproducibilidad.
- Idioma único: solo inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Sesgos heredados: GPT-Neo se entrenó sobre The Pile, un corpus web sin curación fina, con sesgos conocidos de género, raza y religión, además de contenido tóxico. El ajuste sobre MS MARCO no elimina estos sesgos.
- Riesgo de alucinación: es un modelo causal de 1,3B sin alineamiento documentado; puede generar respuestas verosímiles pero falsas, especialmente en preguntas factuales.
- Ventana de contexto limitada (2.048 tokens en el base): inadecuado para documentos largos o conversaciones multi-turno extensas.
- Arquitectura y tokenizador desactualizados (2021): rendimiento inferior a modelos actuales del mismo tamaño en razonamiento, código y matemáticas.
- El repositorio no contiene los pesos base: sin `EleutherAI/gpt-neo-1.3B` el adaptador es inservible, y no se garantiza que la versión publicada del base sea la utilizada en el ajuste.
- Sin señales de comunidad (0 descargas, 0 *likes*): no hay validación externa ni informes de errores.
- Calidad del ajuste QAFT no verificada: no se documenta la pérdida de precisión respecto a FP16, que es precisamente lo que la estrategia debería mitigar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-qaft
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-1.3B
- Dataset declarado (MS MARCO): https://huggingface.co/datasets/microsoft/ms_marco
- Repositorio de GPT-Neo (EleutherAI): https://github.com/EleutherAI/gpt-neo
- Documentación de PEFT: https://huggingface.co/docs/peft

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de productos de Google sin relación con el repositorio), por lo que no se dispone de artículos, papers ni demos adicionales que enlazar.
