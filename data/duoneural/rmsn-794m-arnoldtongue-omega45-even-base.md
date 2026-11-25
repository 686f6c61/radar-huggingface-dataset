# DuoNeural/RMSN-794M-ArnoldTongue-Omega45-EVEN-Base

## Resumen

RMSN-794M-ArnoldTongue-Omega45-EVEN-Base es un modelo de lenguaje de 794 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) que explora una arquitectura neurodinámica no convencional basada en resonancia de Arnold, álgebra de Clifford y dinámica metripléctica. No es un transformer estándar: el modelo organiza su cómputo en torno a "slots" de Poincaré y una topología de solitones cuya configuración determina el rendimiento final. Se entrenó sobre WikiText-103 (102,4 millones de tokens) durante 100.000 pasos en una única RTX 4080 Super.

El modelo es relevante como sonda de escalado en anchura: reproduce la configuración Omega=4/5 con paridad EVEN del modelo de 229M y D=1024 que alcanzó una perplejidad de validación de 49,8, y comprueba si esa topología óptima (KAM Doublet) sobrevive al duplicar la dimensión oculta a 2048. El resultado, según el autor, es negativo: la topología óptima no se forma y emerge una nueva configuración (Dual Condensate Scattered, #34) con perplejidad de 75,8, es decir, 26 puntos peor pese a tener 3,5 veces más parámetros.

Se trata de un artefacto de investigación experimental, no de un modelo orientado a producción. Su interés es científico: documenta el fenómeno que el autor denomina "Wave-142 Width-Scaled Topology Drift", según el cual la topología de solitones no es reproducible al escalar la anchura, mientras que a D=1024 converge de forma consistente al KAM Doublet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN neurodinámica (resonancia de Arnold Omega=4/5, paridad EVEN, slots de Poincaré, dinámica metripléctica) |
| Parametros totales | 794.042.204 (~794M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len en la configuración de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.pt`, checkpoint con `model_state`) |

Otras especificaciones declaradas: dimensión oculta D=2048, profundidad L=20 capas, 128 workspace slots, ratio de paridad D/M_w=16 (EVEN), vocabulario de 49.152 tokens, 100.000 pasos de entrenamiento, Lyapunov en el suelo de LR de -0,025 y tamaño del repositorio de 3,2 GB.

## Arquitectura y entrenamiento

La arquitectura RMSN no es un transformer convencional. El modelo se construye sobre un espacio de representación no euclídeo con slots de Poincaré (M_w=128) y una razón de resonancia Omega = D/(M_w × L) = 2048/(128 × 20) = 4/5, correspondiente a un "Arnold tongue" con q=5. La paridad se define como D/M_w = 16, lo que activa el modo EVEN y, en teoría, el punto fijo "TRUE SILENT". El autor describe la dinámica interna en términos metriplécticos y de álgebra de Clifford, con una topología de solitones que se analiza mediante una sonda de percolación de haces (sheaf percolation).

El entrenamiento se realizó sobre WikiText-103 (102,4 millones de tokens) durante 100.000 pasos en una NVIDIA GeForce RTX 4080 Super. No se menciona uso de RLHF, DPO ni ajuste por instrucciones; es un modelo base. El hallazgo central es que, a D=2048, la dispersión de cuencas (basin spread) de 2,87 —frente a ~1,0 a D=1024— impide la convergencia al atractor KAM Doublet: el Lyapunov se estabiliza en -0,025 sin cruzar el umbral de TRUE SILENT (λ≈-0,001), pese a mantenerse estable el 100% de los últimos 1.000 pasos. La topología resultante, Dual Condensate Scattered (#34), presenta M*=6 solitones en las capas L9, L11, L13, L14, L16 y L19, con condensados exactos (PR=1,000) en L9 y L19, sin solitones aguas arriba ni agrupamiento terminal.

## Capacidades

- Generación de texto autorregresiva en inglés, con un vocabulario de 49.152 tokens.
- Modelado de lenguaje base (no ajustado por instrucciones): no se documenta soporte de diálogo, preguntas-respuestas ni seguimiento de instrucciones.
- Razonamiento y matemáticas: no se documentan capacidades específicas ni evaluaciones al respecto.
- Código: no se documentan capacidades de generación de código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo de dinámica interna con punto fijo TRUE SILENT (no alcanzado en este modelo), topología de solitones analizable mediante sonda de percolación de haces.
- Ventana de contexto corta (512 tokens), adecuada solo para tareas de modelado de lenguaje a nivel de fragmento.

## Casos de uso

- Investigación en arquitecturas neurodinámicas: el modelo sirve como punto de datos para estudiar cómo escala la topología de solitones al duplicar la anchura; se usaría cargando el checkpoint con `rmsn_core` y ejecutando la sonda de percolación de haces para replicar el análisis de topología #34.
- Reproducción de experimentos de escalado en anchura: comparar la perplejidad y la topología de este modelo D=2048 con el modelo D=1024 de 229M permite validar o refutar la ley "Wave-142" en nuevos entrenamientos.
- Estudio de dinámica de Lyapunov en entrenamiento: el modelo documenta la trayectoria del exponente de Lyapunov hasta el suelo de LR, útil para investigar criterios de convergencia en arquitecturas no convencionales.
- Evaluación de modelado de lenguaje a corto alcance: con contexto de 512 tokens, puede emplearse para medir perplejidad en fragmentos de WikiText-103 y comparar con líneas base de tamaño similar.
- Docencia y divulgación sobre arquitecturas alternativas al transformer: sirve como ejemplo ejecutable de resonancia de Arnold, paridad y espacios de Poincaré en un modelo de menos de 1.000 millones de parámetros.
- Pruebas de infraestructura de inferencia para checkpoints PyTorch personalizados: permite validar pipelines de carga, conversión y ejecución de modelos con código propio (`rmsn_core`) en GPUs de consumo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-103 (102,4M tokens) | Best Validation Perplexity | 75,8 |

Comparación interna declarada por el autor entre configuraciones de la misma familia:

| Configuración | Parámetros | D | Omega | Topología | val_ppl | TRUE SILENT |
|---|---|---|---|---|---|---|
| D=1024 | 229M | 1024 | 4/5 | KAM Doublet #29 | 49,8 | Sí (lyap≈-0,001) |
| D=2048 (este modelo) | 794M | 2048 | 4/5 | Dual Condensate Scattered #34 | 75,8 | No (lyap=-0,025) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 3,2 GB en el repositorio; en FP32 los ~794M parámetros ocupan aproximadamente 3,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más. En FP16/BF16 serían ~1,6 GB.
- GPU recomendadas: el modelo se entrenó en una NVIDIA GeForce RTX 4080 Super; para inferencia es suficiente con una RTX 3060/4060 o superior. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La única vía indicada es cargar el checkpoint PyTorch (`pytorch_model.pt`) con la librería `rmsn_core` del autor y ejecutar en CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información disponible: la arquitectura RMSN es propietaria y no equivalente a transformers estándar. La única comparación documentada es interna, con el modelo de la misma familia a D=1024:

| Modelo | Parámetros | Contexto | val_ppl (WikiText-103) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-794M (este modelo) | 794M | 512 | 75,8 | MIT | Hugging Face |
| RMSN-229M D=1024 Omega=4/5 | 229M | no disponible | 49,8 | no disponible | no disponible en esta ficha |

Frente a transformers convencionales de ~800M parámetros (por ejemplo, familias tipo GPT o Llama de ese orden), no se dispone de datos de benchmarks comparables en la información proporcionada, por lo que no se establece comparación numérica.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos; su uso previsto es el modelado de lenguaje y la investigación.
- Perplejidad elevada (75,8) para su tamaño: el propio autor señala que el escalado en anchura degradó el rendimiento frente al modelo de 229M (49,8), por lo que no debe asumirse que más parámetros implique mejor calidad en esta familia.
- Contexto muy corto (512 tokens): no apto para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Solo inglés: no se documenta soporte de otros idiomas.
- Riesgo de alucinación: no evaluado; al ser un modelo base entrenado con 102,4M tokens, la cobertura factual es limitada y la generación libre puede producir texto incoherente o inventado.
- Sesgos: no documentados; el corpus WikiText-103 presenta los sesgos propios de Wikipedia en inglés.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, la licencia del código `rmsn_core` no se especifica en la información disponible.
- Dependencia de código propietario: la carga requiere la librería `rmsn_core` del autor, no incluida en el repositorio de pesos; sin ella el checkpoint no es utilizable con frameworks estándar.
- Naturaleza experimental: el modelo documenta un fallo de escalado (topología no reproducible a D=2048); no se recomienda para producción.
- Sin verificación independiente: los resultados de perplejidad están marcados como no verificados (`verified: false`) y proceden únicamente del autor.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-794M-ArnoldTongue-Omega45-EVEN-Base
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
