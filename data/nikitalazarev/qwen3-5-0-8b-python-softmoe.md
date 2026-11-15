# NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE

## Resumen
Qwen3.5-0.8B-Python-SoftMoE es un derivado de Qwen/Qwen3.5-0.8B publicado por NikitaLazarev que se presenta como un "experto Soft MoE" de dominio especializado en lenguaje Python y PEPs. A diferencia de un fine-tuning convencional, el autor afirma que no se ha realizado entrenamiento alguno: el modelo se obtiene mediante "weight-space steering", una técnica de edición de pesos sin gradientes inspirada en Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026) y en la herramienta Ivanna Lab.

El procedimiento descrito consiste en extraer una dirección de dominio (un vector d̂) mediante un escaneo de activaciones que compara los estados ocultos medios de prompts del dominio Python frente a prompts de contraste. Esa dirección se incrusta en las matrices de salida (`down_proj`, `o_proj`, `out_proj`) de un conjunto seleccionado de capas (15, 16, 17, 18, 20, 21, 22 y 23) mediante un parche de rango uno con modo `steer` y α = 0.2. El resultado es un modelo denso de 873 millones de parámetros que conserva la arquitectura y el tokenizador del base, pero con un sesgo inducido hacia el dominio Python.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de especialización sin entrenamiento que puede resultar atractiva para entornos con recursos limitados o para prototipado rápido de expertos de dominio. Por otro, conviene subrayar que el modelo es un piloto end-to-end con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con un único indicador de calidad reportado por el autor (AUC del gate de escaneo = 1.0), que no equivale a una evaluación de capacidades en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-0.8B) con parche de steering de rango uno en capas seleccionadas; pipeline image-text-to-text |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE real; "Soft MoE" es una denominación del autor para el experto derivado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el dominio declarado es Python y PEPs en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 873 millones de parámetros. Sobre esa base no se aplica ningún proceso de entrenamiento supervisado, RLHF ni DPO: el autor describe explícitamente el método como "no-training". La intervención consiste en un escaneo de activaciones que calcula la diferencia entre los estados ocultos medios generados por prompts del dominio Python/PEPs y los generados por prompts de contraste, obteniendo así una dirección de dominio d̂. Esa dirección se inyecta como un parche de rango uno en las matrices de proyección de salida (`down_proj`, `o_proj`, `out_proj`) de las capas 15, 16, 17, 18, 20, 21, 22 y 23, con modo `steer` y coeficiente α = 0.2.

La innovación declarada es la modificación de pesos en espacio de pesos en lugar de mediante hooks de inferencia, lo que permite que el sesgo de dominio persista en despliegues donde no se pueden instalar hooks personalizados. El autor menciona además un "router" en espacio de embeddings con margen coseno que seleccionaría esta variante frente al modelo base para consultas del dominio, si bien no se detalla en la información disponible cómo se implementa ni si se distribuye junto con los pesos. El único dato de validación reportado es el AUC del gate de escaneo (1.0, marcado como PASS), que mide la separabilidad de la dirección de dominio, no la calidad generativa del modelo resultante.

## Capacidades
- Generación de texto conversacional heredada del modelo base Qwen3.5-0.8B.
- Procesamiento image-text-to-text según el pipeline declarado en Hugging Face, aunque no se detallan las capacidades de visión efectivas tras el parche.
- Sesgo inducido hacia el dominio de lenguaje Python y PEPs (convenciones de codificación, referencias normativas) mediante steering de pesos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el dominio declarado está en inglés.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso
- Asistente de estilo y convenciones Python: el parche de dominio puede orientar las respuestas hacia PEP 8, PEP 257 y otras convenciones, útil como corrector de estilo en revisiones de código internas, aunque requiere validación humana por la ausencia de benchmarks.
- Explicación de PEPs en documentación técnica: el modelo puede emplearse para redactar resúmenes o aclaraciones de propuestas de mejora siempre que se verifiquen las referencias, dado el riesgo de alucinación normativa.
- Prototipado rápido de expertos de dominio: sirve como caso de estudio reproducible del método de weight-space steering para equipos que quieran evaluar la técnica antes de invertir en fine-tuning.
- Generación de snippets y ejemplos didácticos: adecuado para entornos de formación donde el coste de inferencia es crítico, al ser un modelo de menos de mil millones de parámetros que cabe en GPU de consumo.
- Filtrado o clasificación de consultas relacionadas con Python: el router descrito por el autor podría reutilizarse para enrutar peticiones hacia este experto en lugar del base en un sistema multi-modelo.
- Investigación sobre edición de pesos: útil como referencia para experimentos de ablación y steering en modelos pequeños, comparando el efecto del parche frente al modelo original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El único dato reportado por el autor es el AUC del gate de escaneo (1.0), que no constituye una evaluación de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más en precisión completa.
- Opciones de despliegue: transformers (soporte declarado), y previsiblemente vLLM o TGI si la arquitectura Qwen3.5 está soportada; llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Python-SoftMoE | 873 M | no disponible | Steering de pesos sin entrenamiento | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~873 M | no disponible | Modelo denso generalista | no disponible en la información | Hugging Face |
| Fine-tuning LoRA de Python sobre modelos ~1B | variable | depende del base | Entrenamiento supervisado | depende del base | habitual en el ecosistema |
| Modelos de código pequeños tipo Qwen2.5-Coder-1.5B | ~1,5 B | 32 K (referencia pública) | Preentrenamiento en código | Apache 2.0 (referencia pública) | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque el autor no publica evaluaciones comparativas. Frente a un fine-tuning LoRA, la propuesta de este modelo elimina el coste de entrenamiento, pero también carece de métricas que permitan estimar su ganancia real en tareas Python.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia publicada de mejora en tareas Python frente al modelo base.
- El AUC de 1.0 del gate de escaneo mide separabilidad de la dirección de dominio, no calidad generativa; puede reflejar sobreajuste del escaneo a los prompts utilizados.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5-0.8B.
- Idiomas no especificados y dominio declarado en inglés, lo que limita su uso en castellano sin evaluación previa.
- Riesgo de alucinación en referencias a PEPs y normativa Python, especialmente al no haber sido entrenado con datos supervisados del dominio.
- El parche de steering modifica pesos de forma permanente; no es trivial revertirlo ni combinarlo con otras adaptaciones.
- Modelo piloto con cero descargas y sin validación de la comunidad; no recomendado para producción sin una evaluación propia exhaustiva.
- El "router" mencionado no se documenta en detalle ni se confirma su distribución junto con los pesos.

## Enlaces
- Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ivanna Lab (herramienta citada por el autor): https://github.com/wiskeone/ivanna-lab
