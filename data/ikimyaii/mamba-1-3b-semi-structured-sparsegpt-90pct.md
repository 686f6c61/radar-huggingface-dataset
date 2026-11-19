# ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-90pct

## Resumen
Mamba-1.3B-semi-structured-SparseGPT-90pct es un modelo derivado del checkpoint denso fla-hub/mamba-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una poda one-shot (sin reentrenamiento) aplicada con la herramienta oficial `fasterprune` de SparseGPT, modificando la regla de máscara para imponer una restricción por fila: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas de menor magnitud según la métrica de SparseGPT (w² / [H⁻¹]²_jj). El resultado es un modelo con aproximadamente un 88,2 % de sparsity efectiva en las capas lineales podadas y trabajo por fila perfectamente balanceado.

El modelo conserva la arquitectura Mamba original (state space model, SSM) con 1.334.740.992 parámetros totales y se distribuye en safetensors con un tamaño de repositorio de 2,7 GB. Su relevancia es fundamentalmente metodológica: sirve como baseline para comparar variantes de poda estructurada (en concreto, los modelos EHWS del mismo autor) y para estudiar el impacto de la sparsity semi-estructurada en arquitecturas SSM, un terreno mucho menos explorado que los transformers.

Conviene subrayar que el propio autor lo presenta como una referencia comparativa, no como un modelo listo para producción: la perplejidad se degrada de forma severa (de 10,03 a 2299,27 en WikiText-2) y la precisión media zero-shot cae del 43,50 % al 32,84 %. Es, por tanto, un artefacto de investigación sobre compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor advierte que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Sparsity efectiva (capas podadas) | 0,8820 |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento
La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por una recurrencia con parámetros dependientes de la entrada, lo que le permite procesar secuencias con coste lineal. El checkpoint base, fla-hub/mamba-1.3B-100B, fue entrenado sobre 100.000 millones de tokens según indica su nombre; este derivado no añade entrenamiento alguno.

La poda se realizó en una sola pasada con `fasterprune` (implementación oficial de SparseGPT) y una modificación de la máscara: en cada bloque de 128 columnas, todas las filas conservan el mismo número de no-ceros, aplicando la regla N:M de SparseGPT con M igual al tamaño del bloque. Se podan todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`); `dt_proj` se mantiene denso (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que `conv1d`, `A_log` y `D`. Embeddings y `lm_head` permanecen densos. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada uno sobre las salidas de los ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardó 5,3 minutos en una A100 de 40 GB. El autor verifica que las 192 capas podadas tienen exactamente el mismo número de no-ceros por fila.

## Capacidades
- Generación de texto autoregresiva propia de un modelo de lenguaje Mamba de 1,3B parámetros, aunque gravemente degradada por la poda.
- Razonamiento básico y respuesta a preguntas de opción múltiple (ARC, HellaSwag, OpenBookQA), con precisión muy inferior al modelo denso.
- Inferencia eficiente en memoria y cómputo gracias a la sparsity del 88,2 % y al balanceo perfecto por fila.
- No se documenta soporte de tool calling, function calling ni comportamiento agente.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Requiere `flash-linear-attention` (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso
- Baseline de investigación en compresión: sirve para medir la degradación de la poda semi-estructurada frente a variantes como EHWS, comparando perplejidad y precisión zero-shot en igualdad de condiciones.
- Estudio de robustez de SSM ante sparsity: permite analizar qué tareas (p. ej. RTE o Winogrande, que apenas caen) resisten mejor la poda que otras (ARC-Easy, BoolQ), informando futuras estrategias de compresión.
- Validación de kernels dispersos: al tener el mismo número de no-ceros por fila en las 192 capas podadas, es un banco de pruebas ideal para kernels que explotan balanceo de carga por fila.
- Reproducción metodológica: el autor documenta calibración, semilla, orden de bloques y herramienta, lo que facilita replicar el pipeline de poda sobre otros checkpoints Mamba.
- Educación y divulgación: ejemplo didáctico de cómo una poda agresiva sin reentrenamiento destruye la calidad lingüística, útil para explicar los límites de SparseGPT en arquitecturas no transformer.
- Comparación de protocolos de evaluación: dado que usa el protocolo de ELSA en bf16, sirve para cotejar resultados entre distintos trabajos de poda sobre Mamba.

## Benchmarks y rendimiento
Perplejidad (protocolo de evaluación de ELSA, en bfloat16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,03 | 14,12 |
| Este modelo | 2299,27 | 2023,29 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2116 |
| arc_easy | 0,5644 | 0,2757 |
| boolq | 0,6040 | 0,3783 |
| hellaswag | 0,3898 | 0,2642 |
| openbookqa | 0,1980 | 0,1240 |
| rte | 0,5343 | 0,5271 |
| winogrande | 0,5217 | 0,5178 |
| Media | 0,4350 | 0,3284 |

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: en torno a 2,7 GB solo para pesos, más overhead de activaciones y caché de estado; cabe holgadamente en GPUs consumer de 8 GB o más.
- El autor realizó la poda en una A100 de 40 GB, pero la inferencia no requiere esa GPU.
- GPU recomendadas: cualquier GPU con soporte bfloat16 (RTX 30xx/40xx, A100, H100); en fp16 el modelo desborda según advierte el autor, por lo que debe usarse bf16 o fp32.
- Opciones de despliegue: carga vía `transformers` con `flash-linear-attention` instalado; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI (estos dependen de kernels Mamba y de la disponibilidad de pesos GGUF, no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (media zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SparseGPT 90 %) | 1,33B | no disponible | 0,3284 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | 1,33B | no disponible | 0,4350 | no disponible | Hugging Face |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciadas en la model card) |

## Limitaciones y advertencias
- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 10,03 a 2299,27, lo que hace el modelo inadecuado para generación de texto en producción.
- Riesgo elevado de alucinación y de salidas incoherentes derivado de la poda agresiva sin reentrenamiento.
- No es el método SparseGPT publicado: la máscara incorpora una restricción por fila propia del autor, por lo que los resultados no son directamente comparables con los del paper original.
- Licencia no especificada: no puede asumirse uso comercial; debe consultarse con el autor antes de cualquier despliegue.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Desbordamiento en fp16: obligatorio usar bfloat16 o precisión superior.
- Dependencia de `flash-linear-attention`; sin esa librería la carga falla.
- Sesgos conocidos: no documentados, pero hereda los del corpus de entrenamiento del modelo base.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Repositorio flash-linear-attention (requerido para la carga): https://github.com/fla-org/flash-linear-attention
- Paper de SparseGPT: https://arxiv.org/abs/2301.00774
- Paper de Mamba: https://arxiv.org/abs/2312.00752
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
