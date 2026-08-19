# mradermacher/MathForm-8B-GGUF

## Resumen

MathForm-8B es un modelo de lenguaje de 8.000 millones de parámetros desarrollado por OpenBMB, especializado en autoformalización matemática, es decir, la conversión de proposiciones matemáticas en lenguaje natural a código verificable en el asistente de pruebas Lean 4. El modelo ha sido entrenado sobre FormalVerse, un dataset de 367.000 ejemplos verificados, y emplea un enfoque de recuperación de conocimiento y refinamiento guiado por verificación para mejorar la precisión de las formalizaciones. Según el artículo publicado, alcanza un 72,37 % de tasa de éxito (Pass@8) en tareas de autoformalización, superando a modelos especializados de 32B, lo que lo convierte en una opción eficiente para entornos con recursos limitados.

Esta ficha se centra en la versión cuantizada GGUF publicada por mradermacher, que ofrece diferentes niveles de precisión para facilitar su ejecución en hardware variado, desde GPUs de consumo hasta servidores profesionales. El modelo base está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque está orientado principalmente a la formalización matemática, también puede emplearse en tareas de razonamiento y generación de código Lean, aunque no se documentan otras capacidades como tool calling o visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en openbmb/MathForm-8B, librería transformers) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se han publicado detalles exhaustivos sobre la arquitectura interna de MathForm-8B, pero al estar basado en un transformer de 8B parámetros y utilizar la librería transformers, se presume una arquitectura estándar de decoder-only similar a otros modelos de su tamaño. El entrenamiento se realizó sobre FormalVerse, un dataset de 367.000 ejemplos verificados en Lean 4, que combina proposiciones matemáticas con sus correspondientes formalizaciones. El proceso incluye dos innovaciones clave: recuperación de conocimiento relevante durante la generación y un refinamiento guiado por verificación, donde el modelo genera candidatos, los verifica con el comprobador de Lean y ajusta sus salidas en consecuencia. Este enfoque permite que un modelo de 8B compita con modelos de 32B en tareas de autoformalización, según los resultados publicados.

## Capacidades

- Autoformalización matemática: convierte teoremas y proposiciones en lenguaje natural a código Lean 4 verificable.
- Razonamiento matemático: capaz de resolver problemas que requieren comprensión de conceptos avanzados.
- Generación de código Lean 4: produce código correcto sintáctica y semánticamente, gracias al entrenamiento con ejemplos verificados.
- Refinamiento iterativo: puede mejorar sus propias salidas mediante verificación externa, lo que aumenta la fiabilidad.
- Soporte multilingüe limitado: aunque el dataset es en inglés, puede procesar entradas en otros idiomas con menor precisión (no documentado oficialmente).
- No se han documentado capacidades de tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- Formalización de teoremas en investigación matemática: los investigadores pueden usar el modelo para convertir conjeturas o demostraciones informales en código Lean 4, acelerando el proceso de verificación formal.
- Generación de librerías matemáticas en Lean: el modelo puede asistir en la creación de nuevas definiciones y lemas para repositorios como mathlib, reduciendo el trabajo manual.
- Verificación de pruebas en entornos educativos: en cursos de lógica o matemáticas formales, el modelo puede generar soluciones verificadas que los estudiantes pueden revisar.
- Integración en pipelines de CI/CD para proyectos de verificación: al generar código Lean, puede integrarse en sistemas que comprueban automáticamente la corrección de teoremas en repositorios de software.
- Asistencia en la redacción de artículos científicos: el modelo puede sugerir formalizaciones para secciones de pruebas en publicaciones, mejorando la reproducibilidad.
- Desarrollo de herramientas de razonamiento automático: dado su buen rendimiento en tareas de razonamiento, puede servir como componente en sistemas de demostración automática de teoremas.

## Benchmarks y rendimiento

Según el artículo de aipulselab.tech, MathForm-8B obtiene un 72,37 % de tasa de éxito (Pass@8) en tareas de autoformalización matemática, superando a modelos especializados de 32B. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible, por lo que no es posible realizar una comparativa estándar.

| Benchmark | Resultado |
|---|---|
| Autoformalización (Pass@8) | 72,37 % |

## Requisitos de hardware

- VRAM estimada según cuantización:
  - Q2_K: 3,4 GB (archivo) – requiere al menos 4 GB de VRAM para inferencia.
  - Q4_K_S: 4,9 GB – recomendable 6 GB de VRAM.
  - Q6_K: 6,8 GB – recomendable 8 GB de VRAM.
  - Q8_0: 8,8 GB – recomendable 10-12 GB de VRAM.
  - f16: 16,5 GB – recomendable 20+ GB de VRAM.
- GPUs compatibles: RTX 3060 (12 GB) o superior para cuantizaciones Q4_K_S y Q6_K; RTX 4090 o A100 para Q8_0 y f16.
- En GPUs de consumo (8-12 GB) se puede ejecutar con Q4_K_S o Q6_K sin pérdida significativa de calidad.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y vLLM (si se convierte a formato compatible).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 8B, en una RTX 4090 con Q4_K_S se espera una generación de 50-80 tokens/s en tareas de razonamiento.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de la misma categoría (p. ej., Llama 3.1 8B, Qwen 2.5 7B) en tareas de autoformalización. El artículo menciona que supera a modelos especializados de 32B, pero no se especifica cuáles. Por tanto, se indica que la comparativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que su rendimiento en otros idiomas puede ser deficiente.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en datos matemáticos, puede presentar alucinaciones en contextos no matemáticos.
- La autoformalización es una tarea compleja y el modelo puede generar código Lean incorrecto en casos límite; se recomienda verificación manual en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales si se utiliza con fines de investigación que requieran atribución.
- No se han publicado detalles sobre la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- Las cuantizaciones GGUF de baja precisión (Q2_K) pueden degradar notablemente la calidad de las salidas, especialmente en razonamiento matemático.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MathForm-8B-GGUF
- Modelo base: https://huggingface.co/openbmb/MathForm-8B
- Dataset FormalVerse: https://huggingface.co/datasets/openbmb/FormalVerse
- Artículo sobre MathForm: https://aipulselab.tech/news/mathform-scaling-mathematical-autoformalization-with-knowledge-retrieval-and-verification-guided-refinement-287a2c
- Paper (referencia en tags): arxiv:2608.14221 (no se ha verificado la disponibilidad)
