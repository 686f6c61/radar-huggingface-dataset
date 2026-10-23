# praiselab-picuslab/benchmark-slm-fiven-sheared-llama-clmsft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-sheared-llama-clmsft` es un adaptador LoRA (librería PEFT, pesos en safetensors) construido sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`, un transformer decoder-only de aproximadamente 1.300 millones de parámetros. El repositorio no incluye pesos completos: el tamaño declarado es de 0,0 GB, coherente con un adaptador de bajo rango en lugar de un modelo fusionado.

El nombre y las etiquetas (`benchmark-slm`, `or2`, `dataset-fiven`, `strategy-clmsft`) apuntan a un artefacto experimental dentro de una batería de evaluación de modelos de lenguaje pequeños, con un dataset identificado como "fiven" y una estrategia de entrenamiento denominada "clmsft". El único idioma declarado es el italiano (`it`). No se documenta ni la licencia, ni la composición del dataset, ni hiperparámetros del adaptador (rango, alpha, capas objetivo).

Su relevancia práctica es limitada: cero descargas y cero likes desde su creación el 23 de octubre de 2026, acceso restringido (gated) y ausencia total de documentación y de resultados de benchmarks. Debe tratarse como un artefacto de investigación reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; adaptador LoRA sobre `princeton-nlp/Sheared-LLaMA-1.3B` |
| Parametros totales | ~1,3 mil millones en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador puede combinarse con bases cuantizadas de 8 y 4 bits en el runtime, pero no se documenta ninguna combinación validada) |
| Idiomas soportados | italiano (`it`) |
| Licencia | no disponible; el acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace |
| Formato de pesos | `safetensors` (adaptador LoRA, librería `peft`) |
| Tipo de adaptador | LoRA (PEFT); rango, alpha y módulos objetivo no disponibles |
| Dataset de entrenamiento | no disponible; la etiqueta `dataset-fiven` sugiere un dataset denominado "fiven", sin más detalle |
| Estrategia declarada | etiqueta `strategy-clmsft`, sin documentación asociada |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |
| Fecha de actualización | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only de la familia LLaMA, en la variante Sheared-LLaMA-1.3B desarrollada por Princeton NLP, que según la documentación pública de dicho modelo base se obtiene mediante poda estructurada (eliminación de capas y cabezas de atención) y destilación a partir de modelos mayores. Sobre esa base se aplica un adaptador LoRA de bajo rango, del que no se especifican ni el rango, ni el valor de alpha, ni los módulos a los que se aplica, ni si se entrenó en precisión completa o cuantizada.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ("fiven" según la etiqueta), el uso de RLHF o DPO, ni innovaciones técnicas en decodificación. Tampoco se documenta si el adaptador se entrenó con enmascaramiento de instrucciones, empaquetado de secuencias o técnicas de ahorro de memoria como gradient checkpointing. Cualquier afirmación sobre el proceso de entrenamiento más allá de las etiquetas del repositorio sería especulativa.

## Capacidades

- Generación de texto en italiano, heredada del modelo base y del ajuste fino del adaptador; no se especifica la tarea exacta del ajuste.
- Razonamiento de propósito general y conocimiento factual limitados por el tamaño del modelo base (~1,3B parámetros).
- Generación de código: no documentada; el modelo base de 1,3B tiene capacidad muy limitada en este dominio y el adaptador parece orientado a texto en italiano.
- Tool calling / function calling: no documentado, no se declara soporte.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al italiano según la etiqueta `it`; el modelo base es predominantemente inglés, por lo que el comportamiento fuera de italiano no está garantizado.
- Modo "thinking", visión o audio: no disponibles.
- Capacidad de instrucciones (tag `it`): se declara compatibilidad con el pipeline `text-generation`, pero no se detalla el formato de prompt utilizado en el ajuste.

## Casos de uso

- Generación de texto en italiano en prototipos de investigación: el adaptador se puede cargar sobre el modelo base con PEFT y utilizarse como línea base en experimentos de ajuste fino sobre dominios italianos, comparando su salida con la del modelo base sin adaptador.
- Reproducción de experimentos de la batería "benchmark-slm": sirve para replicar la configuración `dataset-fiven` + `strategy-clmsft` en un entorno controlado y comprobar si el adaptador mejora la métrica objetivo de dicha batería.
- Clasificación y etiquetado de texto italiano: con prompts de formato corto y decodificación determinista, un modelo de 1,3B puede emplearse para tareas de clasificación cerrada (categorías fijas) donde el coste por inferencia es crítico.
- Resumen extractivo de documentos cortos en italiano: al ser un modelo pequeño puede desplegarse en CPU o en una única GPU de gama media para resumir correos, actas o notas de prensa.
- Despliegue en entornos con recursos restringidos o sin conectividad: al requerir aproximadamente 2,6 GB en FP16 para el modelo base, cabe en GPUs de consumo y en servidores edge, lo que permite procesar texto en local sin enviar datos a la nube.
- Generación de datos sintéticos en italiano para aumentar datasets de entrenamiento, con revisión o filtrado posterior obligatorio dado el riesgo de alucinación de un modelo de este tamaño.
- Base de comparación en estudios de eficiencia: útil para medir el coste (VRAM, latencia) de un adaptador LoRA frente a un ajuste completo sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra), no hay model card con resultados y no se han encontrado evaluaciones asociadas en la búsqueda web. No se deben asumir cifras derivadas del modelo base para este adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas a partir de los ~1,3B parámetros del modelo base, no datos medidos ni publicados para este adaptador:

- Pesos del modelo base en FP16: aproximadamente 2,6 GB; en INT8, aproximadamente 1,3 GB; en INT4, aproximadamente 0,7 GB. El adaptador LoRA añade un tamaño despreciable (el repositorio declara 0,0 GB).
- VRAM total estimada en FP16 con caché KV para 2.048 tokens: del orden de 3-5 GB, dependiendo del batch y de la implementación.
- GPU profesionales: A100 (40/80 GB), H100 y L40S son sobredimensionadas para un modelo de este tamaño; una A10G o una L4 (24 GB) ya permiten batch grandes.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; también en GPUs de 8 GB con cuantización INT4.
- CPU: viable con llama.cpp/GGUF en FP16 o INT4 para uso interactivo de baja concurrencia, siempre que se convierta el modelo fusionado a GGUF (el adaptador debe fusionarse previamente con `merge_and_unload` de PEFT).
- Opciones de despliegue: vLLM y TGI para servicio con concurrencia; llama.cpp y Ollama para local; Transformers + PEFT para evaluación. La fusion del adaptador sobre la base es un paso previo obligatorio en todos los casos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública y no se han verificado en esta ficha. Para el adaptador analizado, la mayoría de campos figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (`benchmark-slm-fiven-sheared-llama-clmsft`) | ~1,3B (base) | no disponible | no disponible | Gated, requiere aceptación | Adaptador LoRA en italiano, sin benchmarks ni documentación |
| `princeton-nlp/Sheared-LLaMA-1.3B` (base) | ~1,3B | no disponible en esta ficha | no disponible en esta ficha | Público | Modelo base podado y destilado; referencia obligada de comparación |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens según su ficha pública | Apache-2.0 | Público | Entrenado con ~3 billones de tokens; ecosistema amplio de variantes y cuantizaciones |
| Llama-3.2-1B | ~1,2B | 128.000 tokens según su ficha pública | Licencia comunitaria Llama 3.2 | Público con aceptación | Contexto muy superior y mejor soporte multilingüe; requiere aceptar la licencia |

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Sumado al acceso restringido (gated), esto bloquea cualquier adopción en producción sin contacto previo con el autor.
- Riesgo de alucinación elevado: un modelo de ~1,3B parámetros presenta una tasa alta de afirmaciones incorrectas y poca robustez en razonamiento multi-paso.
- Sesgos desconocidos: al no documentarse la composición del dataset "fiven", no es posible evaluar sesgos de género, etnia, político o de dominio.
- Cobertura lingüística muy estrecha: solo se declara italiano; el comportamiento en castellano, catalán o inglés no está garantizado y probablemente degrade respecto al modelo base.
- Longitud de contexto no especificada: planificar pipelines asumiendo ventanas cortas y validar empíricamente antes de diseñar flujos con documentos largos.
- Sin métricas de calidad: no hay evidencia de que el ajuste LoRA mejore al modelo base; en baterías de evaluación pequeñas, un ajuste fino puede degradar capacidades generales (olvido catastrófico).
- Artefacto sin adopción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de errores.
- Fecha de creación atípica (2026): conviene verificar la procedencia y la integridad de los ficheros antes de cargarlos en un entorno de confianza.

## Enlaces

- Repositorio HuggingFace (acceso restringido): https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-sheared-llama-clmsft
- Modelo base Sheared-LLaMA-1.3B: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- Paper del modelo base (Sheared LLaMA: Accelerating Language Model Pre-training via Structured Pruning): https://arxiv.org/abs/2310.06694
- Librería PEFT: https://github.com/huggingface/peft
- Perfil del autor en HuggingFace: https://huggingface.co/praiselab-picuslab
