# DiogenesChen122/Dr.Sparse-Gemma4-12B-SFT-luna10-v4b

## Resumen

Dr.Sparse-Gemma4-12B-SFT-luna10-v4b es un ajuste fino supervisado (SFT) del modelo multimodal google/gemma-4-12B-it, publicado por el usuario DiogenesChen122 bajo el proyecto Dr.Sparse. El objetivo del entrenamiento es muy concreto: generar kernels SpGEMM (multiplicación de matrices dispersas por matrices dispersas) en CUDA para matrices del ecosistema SuiteSparse, de modo que el kernel resultante supere en velocidad a cuSPARSE. Se trata, por tanto, de un modelo especializado en álgebra lineal dispersa y generación de código de bajo nivel, no de un asistente generalista.

El entrenamiento se realizó con LoRA de rango 64 y alpha 128 sobre un subconjunto de 3.963 ejemplos de entrenamiento y 71 de validación del dataset KinGeorge/Dr.Sparse-SFT-luna10-v4b (variante v4b), durante una sola época (495 pasos) con una longitud de secuencia de 65.536 tokens. Los adaptadores se fusionaron realmente en los pesos base, por lo que el repositorio contiene un modelo denso de 11.959.730.176 parámetros (~12B) listo para servirse, con pérdida de validación final de 0,034.

Su relevancia actual es doble. Por un lado, demuestra un caso de uso muy vertical de los LLM: la síntesis de kernels GPU de altas prestaciones guiada por ejemplos verificados. Por otro, arrastra un problema de compatibilidad relevante para producción: la arquitectura del modelo base es `gemma4_unified`, con `head_dim` potencialmente distinto en cada capa, y vLLM lee ese atributo de forma global, lo que provoca `AmbiguousGlobalPerLayerAttributeError` al arrancar el servidor tanto en vLLM 0.22 como en 0.30. Además, la evaluación comparativa del modelo frente a su base sobre el conjunto OTF-81 todavía no se ha completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal, variante `gemma4_unified` (encoder-free, ingesta nativa de audio y video en el modelo base; `head_dim` heterogéneo por capa) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens usados durante el SFT; máximo nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible. Los pesos publicados están en precisión completa (bf16); no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Gemma (términos de uso de Google para la familia Gemma 4) |
| Formato de pesos | safetensors (repositorio de 24,5 GB) |

Otros datos: modelo base `google/gemma-4-12B-it`; pipeline declarado no disponible; 0 descargas y 0 likes en el momento de la consulta; creado el 2026-10-01.

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only denso de la familia Gemma 4, presentado públicamente como el primer modelo multimodal de tamaño medio sin encoder, capaz de ingerir audio y vídeo de forma nativa y de ejecutarse en torno a 16 GB de VRAM. La particularidad arquitectónica que más afecta al despliegue es la del identificador `gemma4_unified`: el atributo `head_dim` puede variar de una capa de atención a otra. Las versiones recientes de transformers leen ese valor capa por capa, mientras que vLLM lo lee como atributo global, lo que genera un error de ambigüedad al iniciar el servicio.

El entrenamiento es un SFT con LoRA (r=64, alpha=128), tasa de aprendizaje 1e-4 con scheduler coseno y 5 % de warmup, una única época (495 pasos) y longitud de secuencia de 65.536 tokens. Se ejecutó sobre 4 GPU B200 durante 19 horas y 15 minutos, con un total de 3.963 ejemplos de entrenamiento y 71 de validación. La pérdida de validación final reportada es de 0,034. Los adaptadores LoRA se fusionaron en los pesos base, de modo que el repositorio no requiere cargar un adaptador aparte. No se documenta uso de RLHF ni DPO, ni composición detallada del dataset más allá de su procedencia y del objetivo de la tarea (generar kernels SpGEMM comparables contra cuSPARSE).

## Capacidades

- Generación de kernels CUDA especializados en SpGEMM para matrices dispersas del ecosistema SuiteSparse.
- Optimización orientada a superar el rendimiento de cuSPARSE, que es el criterio de la tarea de entrenamiento.
- Escritura de código CUDA de bajo nivel: gestión de memoria, uso de librerías de álgebra lineal dispersa y patrones de paralelización.
- Manejo de contextos largos de hasta 65.536 tokens, útil para incluir cabeceras, matrices de prueba y ejemplos de referencia en el mismo prompt.
- Razonamiento multi-paso sobre un problema de optimización: proponer kernel, compilar, verificar numéricamente y comparar tiempos.
- Capacidades heredadas del modelo base (multimodalidad con audio y vídeo, instrucciones generales): no verificadas tras el SFT y potencialmente degradadas por el ajuste estrecho; no disponibles como garantía.
- Soporte de tool calling / function calling: no documentado en el modelo ajustado; el base es un modelo `-it`, pero no hay confirmación para esta versión.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de kernels SpGEMM en CUDA: el modelo recibe la descripción de una matriz dispersa y devuelve un kernel que se compila y se compara contra cuSPARSE. Es exactamente la tarea sobre la que se entrenó y el escenario donde debería rendir mejor.
- Aceleración de pipelines de HPC y simulación científica: en códigos de elementos finitos, dinámica de fluidos o grafos a gran escala, la multiplicación dispersa es el cuello de botella; un kernel específico puede reducir el tiempo por iteración frente a una llamada genérica a cuSPARSE.
- Autotuning y búsqueda de configuraciones: el modelo puede generar variantes de un mismo kernel (distinto tamaño de bloque, uso de memoria compartida, estrategias de fusión) para alimentar un bucle de autotuning que mida y seleccione la mejor.
- Integración en pipelines de CI/CD de compilación: dado que la tarea exige que el kernel compile y pase verificación numérica, el modelo encaja en un flujo automatizado donde cada propuesta se compila, se contrasta contra una referencia y se descarta si no supera el umbral de speedup.
- Investigación y docencia sobre álgebra lineal dispersa: sirve para generar ejemplos de kernels comentados, comparar estrategias de almacenamiento (CSR, CSC, ELL) y estudiar por qué una implementación concreta es más rápida.
- Prototipado rápido de operadores CUDA personalizados: para equipos que necesitan un primer esqueleto de kernel funcional antes de optimizarlo a mano, el modelo reduce el tiempo hasta la primera versión que compila y produce resultados correctos.
- Destilación o generación de datos sintéticos: sus salidas pueden emplearse como corpus para entrenar modelos más pequeños o para ampliar el dataset de la propia familia Dr.Sparse.
- Servicio de asistencia técnica interna para desarrolladores de kernels: desplegado como endpoint privado con transformers, puede responder consultas sobre patrones de SpGEMM y errores habituales de CUDA en este dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación del entrenamiento (0,034) y señala explícitamente que la evaluación del modelo y de su base sobre el conjunto OTF-81 «aún no se ha completado». No hay cifras de MMLU, HumanEval, GSM8K, ni de speedup medio frente a cuSPARSE.

| Metrica | Valor |
|---|---|
| Perdida de validacion (SFT) | 0,034 |
| Evaluacion OTF-81 | Pendiente, no completada |
| Speedup frente a cuSPARSE | No disponible |
| Benchmarks generales (MMLU, HumanEval, GSM8K) | No disponibles |

## Requisitos de hardware

- VRAM estimada para los pesos en bf16: aproximadamente 24 GB solo para pesos (11,96B parámetros × 2 bytes), coherente con el tamaño de repositorio de 24,5 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 12-13 GB para pesos. En 4 bits: alrededor de 7-8 GB. Estas cifras no están confirmadas por el autor y no se publican artefactos cuantizados.
- A la VRAM de pesos hay que sumar la caché KV correspondiente a una ventana de hasta 65.536 tokens, que en este modelo puede ser considerable y no está cuantificada en la información disponible.
- GPU recomendadas: el entrenamiento se hizo en 4 × B200. Para inferencia, un modelo de ~12B en bf16 encaja en A100 40/80 GB, H100 80 GB y L40S 48 GB.
- En GPU de consumo: es viable en RTX 4090 (24 GB) o RTX 5090 solo si se recurre a cuantización, porque los pesos en bf16 ocupan aproximadamente la totalidad de la VRAM y no dejarían espacio para la caché KV.
- Opciones de despliegue: el autor indica que el modelo se puede servir con vLLM, pero advierte de que la versión actual falla al arrancar por `AmbiguousGlobalPerLayerAttributeError` (confirmado en vLLM 0.22 y 0.30). La alternativa documentada es parchear el `config` o usar transformers directamente para inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dr.Sparse-Gemma4-12B-SFT-luna10-v4b | ~12B | 65.536 tokens en SFT | Generacion de kernels SpGEMM CUDA | Gemma | HuggingFace, 0 descargas |
| DiogenesChen122/Gemma-4-31B-Lora-20260828 | ~31B (base Gemma 4 31B) | No disponible | Generacion de kernels CUDA con SFT por rechazo (4.027 ejemplos mantenidos, 3.822/205) | Gemma | HuggingFace |
| google/gemma-4-12B-it (modelo base) | ~12B | No disponible | Asistente multimodal generalista con audio y video | Gemma | HuggingFace |

La comparación directa con el modelo base en la tarea objetivo (OTF-81) no puede cerrarse porque la evaluación está pendiente. El sibling de 31B pertenece al mismo proyecto y usa una metodología de selección distinta (rejection sampling con verificación de compilación y speedup ≥ 1,05× frente a cuSPARSE), lo que sugiere un pipeline más exigente en la curación de datos que el SFT directo empleado aquí.

## Limitaciones y advertencias

- Modelo de nicho: está ajustado para una única tarea (kernels SpGEMM en CUDA). Fuera de ese dominio su utilidad es incierta y su calidad como asistente general no está evaluada.
- Degradación potencial de capacidades generales: el SFT con 3.963 ejemplos durante una sola época sobre un modelo instruct multimodal puede haber erosionado capacidades heredadas. No hay evaluación que lo confirme o lo descarte.
- Fallo conocido en vLLM: `AmbiguousGlobalPerLayerAttributeError` al arrancar el servidor, por el `head_dim` heterogéneo por capa de `gemma4_unified`. Afecta a vLLM 0.22 y 0.30 y no es un problema de versión. Requiere parchear el `config` o usar transformers.
- Evaluación incompleta: no existen resultados sobre OTF-81 ni comparación con el modelo base, así que no hay evidencia publicada de que el ajuste mejore realmente al base en la tarea.
- Riesgo de alucinación: en generación de código, el modelo puede producir kernels que compilan pero dan resultados numéricamente incorrectos. La verificación numérica contra una referencia es imprescindible antes de usar cualquier salida en producción.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ oficiales, lo que complica el despliegue en hardware de gama consumer.
- Idiomas no documentados: se desconoce el soporte multilingüe específico de este ajuste.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Gemma de Google, que imponen obligaciones de atribución y restricciones de uso. Conviene revisarlos antes de integrar el modelo en un producto.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Trazabilidad limitada: la model card está parcialmente en chino y no detalla la composición del dataset ni los criterios de filtrado, más allá de la referencia a `KinGeorge/Dr.Sparse-SFT-luna10-v4b`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DiogenesChen122/Dr.Sparse-Gemma4-12B-SFT-luna10-v4b
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Dataset de entrenamiento: https://huggingface.co/datasets/KinGeorge/Dr.Sparse-SFT-luna10-v4b
- Modelo hermano de 31B del mismo autor: https://huggingface.co/DiogenesChen122/Gemma-4-31B-Lora-20260828
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores de Gemma 4 12B (Google Developers Blog): https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Ficha de Gemma 4 12B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/gemma4-12b/
- Paper o blog tecnico del ajuste: no disponible
- Repositorio de codigo o demo: no disponible
