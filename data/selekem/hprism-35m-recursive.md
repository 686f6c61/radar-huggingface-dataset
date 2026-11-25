# Selekem/hprism-35m-recursive

## Resumen

H-PRISM (Hierarchical Parallel-Recursive Language Model) es un modelo de lenguaje experimental de 35,4 millones de parámetros desarrollado por el usuario Selekem y publicado en Hugging Face bajo el identificador `Selekem/hprism-35m-recursive`. Se presenta como una arquitectura híbrida que combina ideas de Looped Transformers, Hierarchical Reasoning Models (HRM) y Parallel Tiny Recursive Models (PTRM), con el objetivo de explorar el escalado de cómputo en tiempo de inferencia (test-time compute scaling) sin reentrenamiento: el mismo modelo puede ejecutarse con distinto número de bucles recursivos para ajustar calidad frente a latencia.

El modelo está diseñado explícitamente para GPUs de gama de entrada, en concreto la NVIDIA T4 de 14 GB, y su propuesta técnica central es un esquema de supervisión profunda con uso de VRAM constante O(1), junto con una contracción mediante RMSNorm posterior al bucle. En el smoke test reportado por el autor, el entrenamiento alcanzó un pico de 7088 MB de VRAM y una velocidad media de 12.246 tokens/s sobre 10.000 muestras del dataset FineWeb-Edu.

Su relevancia es fundamentalmente de investigación: se trata de un modelo de escala muy reducida, con licencia no declarada, sin pipeline asignado y sin métricas de benchmarks estándar (MMLU, HumanEval, GSM8K). No debe considerarse un modelo listo para producción, sino una prueba de concepto sobre arquitecturas recursivas y eficiencia de memoria en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida experimental: Looped Transformer + Hierarchical Reasoning Model (HRM) + Parallel Tiny Recursive Model (PTRM), con post-loop RMSNorm contraction |
| Parametros totales | 35.403.265 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es una combinación experimental de tres linajes: por un lado, los Looped Transformers, que reutilizan el mismo bloque de parámetros varias veces en profundidad; por otro, los Hierarchical Reasoning Models, que separan módulos de razonamiento de alto y bajo nivel; y finalmente los Parallel Tiny Recursive Models, orientados a cómputo recursivo paralelo en modelos de muy pequeño tamaño. El autor añade dos elementos propios: una supervisión profunda que mantiene el consumo de VRAM en O(1) durante el entrenamiento, y una contracción mediante RMSNorm aplicada tras el bucle recursivo para estabilizar las activaciones.

El entrenamiento se realizó sobre el dataset `HuggingFaceFW/fineweb-edu`, según declara la model card. El smoke test reportado cubre 10.000 muestras sobre una Tesla T4 con un pico de 7088 MB de VRAM y una velocidad media de 12.246 tokens/s, con una pérdida que descendió de 10,9525 a 6,2877. No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovación destacable es el escalado de cómputo en tiempo de prueba sin reentrenamiento: el parámetro `num_loops` permite ejecutar el modelo con 2, 4, 6, 8 o 12 bucles recursivos, obteniendo mejoras marginales de perplejidad a costa de latencia lineal.

## Capacidades

- Generación de texto autoregresiva en inglés, a juzgar por el ejemplo de la model card; no se documentan otros idiomas.
- Razonamiento recursivo configurable en tiempo de inferencia mediante el parámetro `num_loops` (2 a 12 bucles documentados).
- Escalado de cómputo en test-time sin reentrenamiento: más bucles reducen la perplejidad de validación de forma decreciente.
- Entrenamiento e inferencia eficientes en VRAM sobre GPUs de gama de entrada (T4 de 14 GB).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.
- No se documenta capacidad multilingüe ni evaluación de instrucciones.

## Casos de uso

- Investigación en arquitecturas recursivas: el modelo sirve como banco de pruebas reproducible para estudiar el efecto del número de bucles sobre la perplejidad, con la tabla de escalado ya publicada como referencia.
- Experimentos de eficiencia de memoria: su supervisión profunda con VRAM O(1) permite reproducir entrenamientos de modelos recursivos en una única T4, útil para laboratorios con presupuesto de hardware limitado.
- Docencia y divulgación: un modelo de 35 M de parámetros que cabe en 0,1 GB de repositorio es adecuado para explicar conceptos de looped transformers y test-time compute en cursos o talleres.
- Prototipado rápido de pipelines de inferencia: al cargarse con `AutoModelForCausalLM` y `trust_remote_code=True`, se puede integrar en scripts de evaluación de latencia y throughput sin infraestructura dedicada.
- Estudio comparativo de decodificación: permite medir el compromiso entre latencia (de 10,5 ms con 2 bucles a 58,08 ms con 12 bucles por muestra) y calidad, útil para diseñar políticas de cómputo adaptativo.
- Base para fine-tuning experimental: al ser un modelo pequeño con pesos safetensors, es viable ajustarlo en una sola GPU consumer para tareas concretas de investigación, siempre que se resuelva la ambigüedad de licencia.
- Generación de texto de baja exigencia en entornos de recursos mínimos: con una perplejidad en torno a 943, la calidad es limitada, por lo que solo encaja en demostraciones o pruebas internas, no en producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de su smoke test y de escalado en tiempo de prueba:

| Configuración | Val loss | Perplejidad | Latencia por muestra |
|---|---|---|---|
| 2 bucles | 6,9509 | 1044,07 | 10,5 ms |
| 4 bucles | 6,8543 | 947,99 | 19,91 ms |
| 6 bucles | 6,8504 | 944,3 | 29,45 ms |
| 8 bucles | 6,8494 | 943,29 | 38,73 ms |
| 12 bucles | 6,8487 | 942,7 | 58,08 ms |

| Métrica de entrenamiento (smoke test) | Valor |
|---|---|
| Muestras | 10.000 |
| Hardware | Tesla T4 (14.913 MB VRAM) |
| Pico de VRAM | 7088 MB |
| Velocidad media | 12.246 tokens/s |
| Loss inicial → final | 10,9525 → 6,2877 |

## Requisitos de hardware

- VRAM para inferencia: no se publica una cifra específica; con 35,4 M de parámetros en float16 los pesos ocupan aproximadamente 71 MB, por lo que el modelo cabe holgadamente en cualquier GPU moderna.
- GPU de referencia del autor: NVIDIA Tesla T4 con 14 GB, donde se ejecutó el smoke test de entrenamiento con 7088 MB de pico.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, etc.), aunque no se han publicado pruebas en estas tarjetas.
- Opciones de despliegue: al requerir `custom_code` y `trust_remote_code=True`, la vía documentada es `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la naturaleza recursiva con bucles configurables complica su exportación a formatos GGUF estándar.
- Latencia y throughput: en la T4 del autor, 10,5 ms por muestra con 2 bucles y 58,08 ms con 12 bucles; 12.246 tokens/s durante el entrenamiento. No hay datos de throughput de inferencia en otras GPUs.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Los modelos recursivos de referencia (HRM, PTRM) no cuentan con datos de parámetros, contexto o licencia en esta ficha, por lo que una comparación cuantitativa sería especulativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| H-PRISM 35M recursive | 35,4 M | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental de 35 M de parámetros: la perplejidad de validación en torno a 943 indica una calidad de generación muy baja para estándares de producción.
- La model card está redactada parcialmente en portugués y no declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso fuera de investigación.
- No se documentan idiomas soportados; el único ejemplo de uso está en inglés y el dataset FineWeb-Edu es mayoritariamente anglófono.
- No se publica la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Riesgo elevado de alucinación y de texto incoherente dado el tamaño y la pérdida reportada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el repositorio antes de cargarlo.
- No se han publicado evaluaciones de sesgos, toxicidad ni alineación.
- El escalado por bucles ofrece rendimientos decrecientes: pasar de 8 a 12 bucles apenas mejora la perplejidad (943,29 a 942,7) mientras incrementa la latencia un 50 %.
- Sin pipeline asignado ni descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selekem/hprism-35m-recursive
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
