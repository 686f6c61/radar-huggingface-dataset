# kparvataneni/memo-diff-jacobian-lens

## Resumen

El repositorio `kparvataneni/memo-diff-jacobian-lens` no contiene un modelo de lenguaje completo, sino un conjunto de matrices de transporte por capa (Jacobian lens) preajustadas para el modelo Llama 3.1. Estas matrices, de dimensiones 4096×4096 en precisión fp32, permiten proyectar las activaciones internas de cualquier capa al espacio de la capa final y decodificarlas con el unembedding del modelo, una técnica de interpretabilidad mecánica desarrollada por Anthropic. El autor, kparvataneni, las ha generado para sus experimentos sobre memorización en modelos, recogidos en el repositorio `kveni12/model-memo-diff`.

La relevancia de este recurso radica en que proporciona lentes de Jacobian ya ajustadas sobre distintos corpus (FineWeb con n=1000 y n=100, y un corpus uniforme público) y en varios checkpoints de entrenamiento (pasos 120, 600 y 1000). Esto permite a otros investigadores analizar cómo cambia la disposición de las activaciones a lo largo del entrenamiento sin necesidad de recalcular las matrices, acelerando estudios de interpretabilidad y de fenómenos de memorización. La licencia MIT facilita su uso y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matrices de transporte por capa (Jacobian lens) para Llama 3.1 |
| Parametros totales | 32 matrices de 4096×4096 (fp32) por checkpoint (aprox. 2 GB por conjunto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Llama 3.1) |
| Tipos de cuantizacion | no disponible (solo fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch tensors (`.pt`) y JSON |

## Arquitectura y entrenamiento

El recurso consiste en matrices `J_ℓ = E[dh_final / dh_ℓ]` que aproximan el jacobiano de la activación final respecto a la activación de la capa ℓ. Se ajustan mediante regresión sobre un corpus de entrenamiento, minimizando el error de transporte lineal entre capas. Los ficheros `jacobians.pt` contienen un diccionario con metadatos y las matrices por capa, mientras que `field_jacobian_lens.json` guarda puntuaciones de precisión por campo cuando están disponibles.

Los datos de entrenamiento varían según el directorio: `twin_2k_fineweb1k` usa 1000 muestras de FineWeb, `twin_2k_fineweb100` usa 100 muestras, y `uniform_public_n80` usa un corpus uniforme público. Los checkpoints corresponden a pasos de entrenamiento de un modelo gemelo (twin) con SFT benigno (2k pasos) o entrenamiento uniforme público (3k pasos). No se especifican detalles sobre el optimizador, la función de pérdida ni el número de épocas.

## Capacidades

- Proporciona lentes de Jacobian listas para usar en Llama 3.1, permitiendo inspeccionar la "disposición" de las activaciones internas en cada capa.
- Permite decodificar activaciones internas en vocabulario mediante el unembedding del modelo base, generando listas de tokens probables.
- Facilita la comparación entre checkpoints de entrenamiento (pasos 120, 600, 1000) para estudiar la evolución de la representación interna.
- Soporta la carga directa en Python con PyTorch, como se muestra en el ejemplo del README.
- Incluye puntuaciones por campo (field scores) en algunos directorios, útiles para análisis de memorización selectiva.
- No es un modelo generativo: no produce texto por sí mismo, sino que es una herramienta de análisis.

## Casos de uso

- Estudio de memorización en modelos de lenguaje: los lentes permiten identificar en qué capas se codifica información memorizada y cómo se propaga hacia la salida, comparando checkpoints tempranos y tardíos.
- Análisis de interpretabilidad mecánica: investigadores pueden cargar las matrices y aplicar la técnica de Jacobian lens para entender qué "diría" el modelo en cada capa, sin necesidad de entrenar sus propias lentes.
- Comparación de estrategias de entrenamiento: los directorios `twin_2k_fineweb1k` y `twin_2k_fineweb100` permiten estudiar el efecto del tamaño del corpus de ajuste en la representación interna.
- Verificación de hipótesis sobre representaciones lineales: al ser matrices lineales, se pueden usar para comprobar si ciertas direcciones en el espacio de activaciones se conservan a lo largo de las capas.
- Depuración de modelos: si se entrena un modelo gemelo con SFT benigno, los lentes ayudan a detectar si el modelo ha internalizado patrones no deseados (p. ej., memorización de datos de entrenamiento).
- Reproducción de experimentos: el repositorio `kveni12/model-memo-diff` usa estos lentes; otros equipos pueden replicar o extender los resultados con los mismos artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este recurso no es un modelo de lenguaje y no tiene métricas de calidad generativa (MMLU, HumanEval, etc.). Las únicas métricas relevantes son las puntuaciones de precisión por campo (`field_jacobian_lens.json`), que no se detallan en la documentación proporcionada.

## Requisitos de hardware

- Cada matriz individual ocupa 4096×4096×4 bytes ≈ 64 MB en fp32. Un conjunto completo de 32 capas (típico de Llama 3.1 8B) ocupa aproximadamente 2 GB.
- Se puede cargar en CPU sin problemas (2 GB de RAM), aunque para operaciones con múltiples matrices o análisis en lote se recomienda una GPU con al menos 4 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., RTX 3060, RTX 4090, A100) para acelerar las multiplicaciones matriciales.
- El despliegue no requiere infraestructura especial: basta con Python y PyTorch. No se necesita vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.
- La latencia de una sola multiplicación matriz-vector es del orden de microsegundos en GPU, por lo que el análisis interactivo es viable incluso en portátiles.

## Comparativa con modelos similares

Existen otros proyectos de Jacobian lens preajustados, aunque no son directamente comparables porque este recurso está especializado en Llama 3.1 y en el estudio de memorización. A continuación se comparan con alternativas conocidas:

| Recurso | Modelo base | Tamaño de lente | Corpus de ajuste | Licencia |
|---|---|---|---|---|
| `kparvataneni/memo-diff-jacobian-lens` | Llama 3.1 (presumiblemente 8B) | 4096×4096 por capa | FineWeb (n=1000, n=100) y corpus uniforme | MIT |
| `neuronpedia/jacobian-lens` | Varios (Qwen, Gemma, DeepSeek) | Depende del modelo | WikiText-103 y otros | no disponible |
| `xiangchensong/jacobian-lens-deepseek-v4-flash-preview` | DeepSeek-V4-Flash | Depende del modelo | WikiText-103 (100 registros) | no disponible |

La principal diferencia es que el recurso de kparvataneni incluye múltiples checkpoints de entrenamiento, lo que permite análisis temporales, mientras que los otros ofrecen lentes estáticos para un único estado del modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto ni responder preguntas; su uso se limita a análisis de interpretabilidad.
- Las matrices están ajustadas para Llama 3.1 con dimensiones 4096; no son transferibles a otros modelos sin recalcular.
- Los corpus de ajuste son pequeños (n=1000 o n=100), lo que puede introducir sesgos en las lentes, especialmente en el directorio `twin_2k_fineweb100`.
- No se especifica la versión exacta de Llama 3.1 (8B, 70B, etc.); se asume 8B por la dimensión 4096, pero no está confirmado.
- Los ficheros `field_jacobian_lens.json` no están presentes en todos los directorios, lo que limita la comparación entre configuraciones.
- La licencia MIT permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que debe respetarse si se usa el modelo completo.
- No hay documentación sobre el proceso de ajuste de las lentes (función de pérdida, regularización, etc.), lo que dificulta la reproducibilidad exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kparvataneni/memo-diff-jacobian-lens
- Repositorio GitHub del proyecto asociado: https://github.com/kveni12/model-memo-diff
- Biblioteca de Jacobian lens de Anthropic: https://github.com/anthropics/jacobian-lens
- Documentación de la biblioteca (DeepWiki): https://deepwiki.com/anthropics/jacobian-lens/2.4-applying-the-lens-(jacobianlens)
- Ejemplo de lente en Neuronpedia: https://www.neuronpedia.org/qwen3.6-27b/jlens
