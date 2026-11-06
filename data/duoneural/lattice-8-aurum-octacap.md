# DuoNeural/Lattice-8-Aurum-OctaCap

## Resumen

Lattice-8-Aurum-OctaCap es un modelo de lenguaje causal de 436,5 millones de parámetros desarrollado por DuoNeural, un laboratorio de investigación centrado en geometrías hiperbólicas y metodologías de entrenamiento novedosas. Se trata de un Continuous Depth Model (CDM) de octava generación dentro de la serie Lattice, destilado por conocimiento desde Qwen/Qwen3.5-4B, que actúa como profesor en cuantización 4-bit NF4. El modelo combina geometría de Lorentz (hiperbólica) con curvatura aprendible por capa, destilación Relational Gram y diagnósticos de cristalización mediante Dynamic Hamming Process (DHP).

La propuesta técnica es poco convencional: en lugar de una pila transformer estándar, el modelo organiza sus ocho capas en torno a slots de enrutamiento embebidos en una variedad de Lorentz, con cuatro expertos por capa y atención de 12 cabezas sobre una dimensión de modelo de 768. El checkpoint liberado corresponde a una ejecución completa de 100.000 pasos de destilación, la más larga de la serie según el autor, con cristalización DHP confirmada en las ocho capas al converger.

Es relevante ahora como artefacto de investigación para quienes estudian geometrías no euclídeas en arquitecturas profundas, destilación con señales relacionales y análisis de especialización de enrutamiento. No obstante, carece de benchmarks downstream formales y su ventana de contexto es de solo 512 tokens, lo que lo aleja de un uso en producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM v3 (Continuous Depth Model) con geometría de Lorentz hiperbólica y curvatura aprendible por capa |
| Parametros totales | 436,5 M |
| Parametros activos | no disponible (4 expertos por capa, pero no se especifica el régimen de activación) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch state-dict, sin versiones GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state-dict (`.pt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre CDM v3, una arquitectura de profundidad continua en la que los slots de enrutamiento (K=8) se embeben en una variedad hiperbólica de Lorentz con curvatura aprendible por capa. La inicialización de curvatura AdS por capa sigue la secuencia `[2.60, 2.45, 2.25, 1.80, 1.50, 0.90, 0.70, 0.60]`, lo que sugiere una transición de geometría más curvada en capas tempranas hacia geometrías más planas en las finales. Cada capa dispone de cuatro expertos con feed-forward de tipo gated automático, y el modelo incorpora un mecanismo denominado "Telepathy" con β=0,5. La dimensión de modelo es 768 con 12 cabezas de atención, y el vocabulario de 248.320 tokens proviene del tokenizador de Qwen3.5-4B.

El entrenamiento consistió en destilación de conocimiento desde Qwen/Qwen3.5-4B (profesor en 4-bit NF4 con cómputo bf16) sobre un dataset interno denominado Aurum, durante 100.000 pasos con AdamW (lr=3e-4), decaimiento coseno, batch efectivo de 16 (4 × grad_accum=4, secuencia de 512) y un mapeo capa a capa alumno→profesor `{0:3, 1:7, 2:11, 3:15, 4:19, 5:23, 6:27, 7:31}`. La función de pérdida combina destilación con α=0,70 y temperatura 3,0, más un término Relational Gram con peso 0,15 que alinea las relaciones entre representaciones del alumno y del profesor. El diagnóstico DHP mide la cristalización temporal de los slots en atractores estables; según el autor, se confirmó en las ocho capas, con pureza máxima en L03 (0,964) y mayor entropía en la capa de salida L07 (0,676).

## Capacidades

- Generación de texto causal en inglés, heredada por destilación del profesor Qwen3.5-4B.
- Razonamiento de contexto corto limitado a 512 tokens por ventana.
- Enrutamiento por slots con especialización por capa (diagnóstico DHP), útil para análisis interpretativo de representaciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: geometría hiperbólica de Lorentz con curvatura aprendible, destilación Relational Gram y mecanismo "Telepathy" (β=0,5); no se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación en geometrías hiperbólicas: el modelo sirve como banco de pruebas para estudiar cómo la curvatura aprendible por capa afecta a la especialización de representaciones, comparando la secuencia AdS inicial con la curvatura efectiva tras el entrenamiento.
- Análisis de enrutamiento con DHP: los logs de cohesión, pureza y entropía por capa permiten reproducir y extender el diagnóstico de cristalización de slots, por ejemplo correlacionando pureza con rendimiento en tareas concretas.
- Reproducción de destilación Relational Gram: el checkpoint y los hiperparámetros publicados (α=0,70, temperatura 3,0, peso Gram 0,15, mapeo de capas) permiten replicar el pipeline sobre otros profesores o datasets.
- Fine-tuning en dominios específicos en inglés: con 436,5 M de parámetros y licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para tareas acotadas de clasificación o generación breve (512 tokens).
- Estudio de compresión profesor-alumno: al derivar de un modelo de 4B, permite medir la degradación de capacidades en función del tamaño del alumno y del número de pasos de destilación.
- Docencia y experimentación en arquitecturas no estándar: útil en cursos o laboratorios para ilustrar diferencias entre atención euclídea y enrutamiento en variedades de Lorentz con código PyTorch estándar.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation BPB | 0,5443 |
| Validation Perplexity | ≈3,88 |
| Teacher KL Divergence | 0,0875 |
| DHP crystallization | Confirmada en las 8 capas |

No se han publicado resultados de benchmarks downstream (MMLU, HellaSwag, ARC, GSM8K, HumanEval) en la información disponible; el autor indica que están pendientes.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,7 GB solo para pesos (436,5 M × 4 bytes), más activaciones y caché KV para 512 tokens.
- VRAM estimada en bf16/fp16: alrededor de 0,9 GB para pesos, holgadamente por debajo de 4 GB en total con overhead.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; también A100/H100 para experimentos por lotes.
- Cabe en GPU consumer: sí, en todas las GPU con 6 GB o más; incluso en iGPU con suficiente memoria unificada.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI; el checkpoint es un state-dict de PyTorch que requiere cargar la definición de modelo del repositorio con `torch.load(..., map_location='cpu', weights_only=False)`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lattice-8-Aurum-OctaCap | 436,5 M | 512 | Apache 2.0 | PyTorch `.pt` | CDM hiperbólico, sin benchmarks downstream |
| Qwen3.5-4B (profesor) | ~4 B | no disponible | no disponible | safetensors | Modelo base del que se destila; capacidades superiores esperadas |
| Modelos causales ~0,5 B (p. ej. Qwen2.5-0.5B) | ~0,5 B | 32K típicamente | Apache 2.0 | safetensors, GGUF | Arquitectura transformer estándar, ampliamente desplegable |

La comparación directa con alternativas de la misma categoría es limitada porque Lattice-8 es un artefacto de investigación con arquitectura no estándar y sin evaluación downstream; los modelos transformer de tamaño similar ofrecen contextos mucho mayores y ecosistema de despliegue maduro.

## Limitaciones y advertencias

- Ausencia total de benchmarks downstream formales (MMLU, HellaSwag, ARC, GSM8K, HumanEval): no es posible estimar su calidad real frente a alternativas.
- Ventana de contexto de solo 512 tokens, insuficiente para la mayoría de aplicaciones de producción con documentos o conversaciones largas.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- El tokenizador está ligado a Qwen3.5-4B (vocabulario de 248.320); es obligatorio usar `AutoTokenizer.from_pretrained("Qwen/Qwen3.5-4B")`, lo que añade una dependencia externa.
- La composición del dataset de entrenamiento (Aurum) no está documentada, por lo que se desconocen sesgos y cobertura.
- Riesgo de alucinación no evaluado; al ser un modelo destilado pequeño, cabe esperar mayor propensión a errores factuales que su profesor.
- El formato de pesos es un state-dict de PyTorch con `weights_only=False`, lo que implica riesgos de seguridad al cargar checkpoints de terceros y ausencia de soporte en runtimes estándar (vLLM, llama.cpp, TGI).
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de garantías hace desaconsejable su uso en producción sin validación previa.
- El diagnóstico DHP y el mecanismo "Telepathy" son métricas y componentes propios del autor sin validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/Lattice-8-Aurum-OctaCap
- Organización DuoNeural: https://huggingface.co/DuoNeural
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-4B
