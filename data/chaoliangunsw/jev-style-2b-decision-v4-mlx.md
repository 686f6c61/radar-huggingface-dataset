# chaoliangUNSW/Jev-Style-2B-Decision-v4-MLX

## Resumen

Jev-Style-2B-Decision-v4-MLX es la conversión al framework MLX de Apple Silicon del modelo Jev-Style-2B-Decision-v4, un modelo de decisión de 2.000 millones de parámetros desarrollado por Chaoliang Yan (chaoliangUNSW) como proyecto independiente. No es un modelo generativo de propósito general: está especializado en clasificación de texto y en la selección puntuada entre opciones fijas (rutado de flujos de trabajo, guardarraíles y scoring de decisiones), con una ventana de contexto de 32.768 tokens por llamada.

El modelo se construye sobre la arquitectura Qwen3.5 y se distribuye en dos precisiones dentro del mismo repositorio: bf16 (3,76 GB) y 8 bits (2,00 GB), ambas ejecutables con un único runtime Python (`jev_style_decision_mlx.py`). Según la model card, el build MLX reproduce las puntuaciones del runtime PyTorch de referencia (FP32) dentro de umbrales declarados previamente: 99,7% de coincidencia top-1 en bf16 y 99,9% en 8 bits sobre 1.000 preguntas de validación.

Su relevancia actual reside en la ejecución local en Apple Silicon: permite clasificación y rutado de decisiones sin depender de una API alojada, con licencia Apache 2.0 y con paridad verificada frente a la referencia en CUDA. La distribución MLX es solo texto; el soporte de imágenes queda restringido al runtime PyTorch del repositorio principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5, con atención de bloques exacta (block attention) |
| Parametros totales | 2B (2.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por llamada |
| Tipos de cuantizacion | bf16 (3,76 GB) y 8 bits (2,00 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `macjev_norms_fp32.safetensors` en FP32 requerido |
| Libreria | mlx (convertido con mlx 0.32.2 y mlx-lm 0.31.3) |
| Pipeline | text-classification |
| Tamano del repo | 5,8 GB |
| Modelo base | chaoliangUNSW/Jev-Style-2B-Decision-v4 |
| Modalidad en MLX | Solo texto (las imágenes requieren el runtime PyTorch del repo principal) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, un transformer denso de 2.000 millones de parámetros, adaptado a una tarea de decisión: responder preguntas tipadas sobre un texto o un estado JSON eligiendo entre opciones fijas (selección, verdadero/falso o puntuación numérica). Un detalle técnico relevante es el uso de atención de bloques exacta, que el runtime MLX reproduce explícitamente; según la model card, las puntuaciones del build MLX se acercan más a la referencia con block attention que a los controles con atención causal simple o causal con prefijo, lo que indica que la inferencia ejecuta el mismo mecanismo de atención con el que se entrenó el modelo.

El entrenamiento de la versión 2B v4 incorporó, según declara el autor, etiquetas suaves destiladas de TypeSafe Jev 1.14 a través de su API pública, además de datos propios. El autor mantiene el proyecto como independiente de TypeSafe AI, pero advierte explícitamente que la independencia no implica ausencia de salidas del profesor en el entrenamiento. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. La conversión a MLX se validó con umbrales de paridad declarados antes de construir o puntuar cada formato.

## Capacidades

- Clasificación de texto local: responde preguntas tipadas sobre un texto de entrada, con hasta 151 opciones por pregunta en el conjunto de validación.
- Selección puntuada entre opciones fijas: modos de elección (choice), verdadero/falso y puntuación numérica (score), con salida de probabilidad calibrada.
- Rutado de flujos de trabajo (LLM routing): asignación de una consulta a una ruta o herramienta predefinida entre un catálogo cerrado.
- Guardarraíles: evaluación de si una entrada cumple o no una política definida, como clasificador binario o multietiqueta.
- Contexto largo: procesa entradas de hasta 32.768 tokens por llamada, con un fixture de validación específico para longitudes de 4.097 a 32.768 tokens.
- Scoring consistente: la función `score_many` devuelve exactamente las mismas puntuaciones que consultar cada pregunta por separado.
- Modalidad de imagen: disponible únicamente en el runtime PyTorch del repositorio principal; la distribución MLX es solo texto.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso ni modo de razonamiento extendido (thinking).

## Casos de uso

- Rutado de consultas en un asistente conversacional: el modelo recibe la consulta del usuario y un catálogo de rutas disponibles, y devuelve la ruta con mayor probabilidad; su ventana de 32.768 tokens permite incluir el historial reciente y el catálogo completo en una sola llamada.
- Guardarraíles de contenido en producción: clasificación binaria o multietiqueta de entradas frente a una política, ejecutada en local sobre Apple Silicon para evitar enviar datos sensibles a una API externa.
- Clasificación de tickets de soporte: asignación de categoría, prioridad o equipo responsable a partir del texto del ticket, con calibración de probabilidades para umbralizar la derivación a revisión humana.
- Enrutado de modelos en una plataforma multi-LLM: decisión de qué modelo o endpoint atenderá cada petición según coste, latencia o complejidad, usando el scoring del modelo como señal.
- Evaluación de respuestas generadas: puntuación de la calidad o adecuación de una respuesta candidata frente a criterios fijos, como filtro previo a la entrega al usuario.
- Procesamiento de documentos largos en local: clasificación de contratos, informes o expedientes de hasta 32.768 tokens en un portátil o Mac de sobremesa con Apple Silicon, sin conexión a red.
- Validación de estados JSON en pipelines: decisión sobre la validez o la siguiente acción de un flujo automatizado a partir de un estado estructurado, integrándose en scripts de Python con MLX.

## Benchmarks y rendimiento

| Metrica | Jev-Style 2B v4 | Jev-Style 2B v3 |
|---|---:|---:|
| Decision Index 0.3, indice publico (autoejecutado, completo) | 44,37 | 34,05 |
| JevBench v1.4.1, items publicos (231) | 74,9% | 73,6% |
| Contexto por llamada | 32.768 tokens | 25.600 tokens |

Paridad de los builds MLX frente a la referencia PyTorch FP32 (1.000 preguntas, texto):

| Precision | Carpeta | Pesos | Mismo top-1 que FP32 | Max abs Δp | Precision (FP32: 84,4%) | Fixture largo (97 preguntas) | Gate |
|---|---|---:|---:|---:|---:|---:|:---:|
| bf16 | `bf16/` | 3,76 GB | 99,7% | 0,036 | 84,4% | 97 / 97 | PASS |
| 8 bits | `8bit/` | 2,00 GB | 99,9% | 0,048 | 84,5% | 97 / 97 | PASS |

Notas: el Decision Index se midió con el runner y scorer del kit, en bfloat16 sobre una A100, en una ejecución completa de 140.178 peticiones. JevBench v1.4.1 se midió con el harness oficial en float32 sobre Apple MPS, con intervalo de confianza del 95% de 68,9–80,0%. Ninguna de las dos cifras es una entrada oficial en un board. Los builds MLX no se reejecutaron sobre los benchmarks; se validó su paridad con la referencia mediante los gates declarados. La referencia FP32 se ejecutó en CUDA con TF32 desactivado.

## Requisitos de hardware

- VRAM/espacio de pesos: 3,76 GB en bf16 y 2,00 GB en 8 bits, más 0,42 MB de pesos de normalización en FP32 (`macjev_norms_fp32.safetensors`), que son obligatorios.
- Plataforma: exclusivamente Apple Silicon (MLX); no está pensado para GPU NVIDIA ni CPU x86 en esta distribución.
- Memoria unificada recomendada: al menos 8 GB para el build bf16 con contexto moderado; 16 GB o más para aprovechar la ventana completa de 32.768 tokens.
- GPU dedicadas (A100, H100, RTX 4090): no aplican a este build; para esas plataformas debe usarse el runtime PyTorch del repositorio principal.
- Despliegue: runtime propio `jev_style_decision_mlx.py` con `--model-dir bf16` o `--model-dir 8bit`; requiere mlx 0.32.2 y mlx-lm 0.31.3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribución.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica que el scoring MLX se ejecutó una vez en un Apple M1 Max para la validación de paridad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Jev-Style-2B-Decision-v4-MLX | 2B | 32.768 | Clasificación y decisión con opciones fijas, MLX | Apache 2.0 | HuggingFace (MLX) |
| Jev-Style-2B-Decision-v3-MLX | 2B | 25.600 | Igual, versión anterior | Apache 2.0 | HuggingFace (MLX) |
| Jev-Style-0.8B-Decision-v3-MLX | 0,8B | No disponible | Igual, variante reducida | Apache 2.0 | HuggingFace (MLX) |
| Qwen3.5 base (2B) | 2B | No disponible | Modelo generativo de propósito general | No disponible | HuggingFace |

La comparación más directa es con las versiones anteriores de la propia serie: v4 mejora el Decision Index de 34,05 a 44,37, sube JevBench de 73,6% a 74,9% y amplía el contexto de 25.600 a 32.768 tokens. Frente a un modelo generativo como Qwen3.5 base, la diferencia es de enfoque: Jev-Style está especializado en decisiones cerradas y calibradas, mientras que el modelo base genera texto libre. No se dispone de datos de benchmarks de terceros para establecer comparaciones con clasificadores especializados de otros autores.

## Limitaciones y advertencias

- La distribución MLX es solo texto; el procesamiento de imágenes requiere el runtime PyTorch del repositorio principal.
- El modelo está especializado en decisiones cerradas entre opciones; no debe emplearse como generador de texto libre ni como asistente conversacional.
- Riesgo de alucinación en el sentido de calibración: aunque el autor reporta gates de paridad, no se documentan métricas de calibración (ECE, Brier) en la información disponible.
- Sesgos conocidos: no disponibles; el dataset de entrenamiento no está descrito en detalle y parte de las etiquetas provienen de la destilación de un modelo profesor de terceros (TypeSafe Jev 1.14), lo que puede transferir sesgos de ese sistema.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los avisos `NOTICE` y `THIRD_PARTY_NOTICES.md` incluidos en el repositorio, que documentan componentes de terceros y la procedencia del entrenamiento.
- Dependencia de versiones concretas de mlx y mlx-lm (0.32.2 y 0.31.3); cambios de versión pueden alterar la paridad numérica.
- El repositorio ocupa 5,8 GB porque incluye ambas precisiones y los ficheros de runtime; conviene descargar solo la carpeta necesaria.
- Los resultados de benchmarks son autoejecutados y no constituyen entradas oficiales en ningún board; deben interpretarse con cautela.
- No se documentan latencia ni throughput, por lo que la planificación de capacidad en producción requiere medición propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-MLX
- Modelo base (PyTorch): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Versión v1 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Versión v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Versión v3 0.8B: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- Versión v3 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3-MLX
- Sitio web del proyecto: https://jevstyle.com
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
- Guía de clasificación local: https://jevstyle.com/guides/local-text-classification/
- Guía de selección de modelo de decisión: https://jevstyle.com/guides/local-decision-models/
- Configuración y límites del modelo 2B v4: https://jevstyle.com/models/2b-v4/
- Evidencia de evaluación: https://jevstyle.com/benchmarks/
- Estado del servicio alojado: https://jevstyle.com/api/
- Perfil GitHub del autor: https://github.com/lawrence3699
