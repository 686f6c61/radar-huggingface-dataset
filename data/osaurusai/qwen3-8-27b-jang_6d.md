# OsaurusAI/Qwen3.8-27B-JANG_6D

## Resumen

OsaurusAI/Qwen3.8-27B-JANG_6D es una cuantización mixta de 6/8 bits del modelo Qwen3.8-27B, un VLM (vision-language model) denso de 27.000 millones de parámetros desarrollado por Qwen, adaptado para ejecutarse en Apple Silicon mediante la librería MLX. El modelo base combina una arquitectura híbrida de 64 capas (48 de GatedDeltaNet y 16 de atención completa con RoPE parcial) y soporta entrada de texto, imagen y vídeo, además de razonamiento flexible, uso de herramientas y un cabezal de predicción multi-token (MTP) preservado.

Esta versión concreta, etiquetada como JANG_6D, aplica una asignación de bits por módulo basada en la traza de la Hessiana y un reajuste imatrix en los módulos sub-8-bit, lo que permite mantener una calidad cercana a la referencia fp16 con un tamaño en disco de 24,1 GiB. Es relevante porque democratiza el acceso a un modelo de 27B con capacidades multimodales y de agente en hardware de consumo de Apple, sin necesidad de GPUs dedicadas.

El bundle incluye un contrato de servicio estampado en `generation_config.json` y `jang_config.json` que define presets de muestreo, niveles de esfuerzo de razonamiento y manejo del modo *thinking*, facilitando su integración en runtimes compatibles con MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet + 16 capas de atención completa (RoPE parcial, dim 64) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M |
| Tipos de cuantizacion | Mixta: 2 módulos en 4-bit, 199 en 6-bit, 389 en 8-bit; 27 proyecciones de visión en fp16 |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas GatedDeltaNet (una variante de SSM con puertas) con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de atención global. Incluye un torre de visión nativa para imágenes y vídeo, y un cabezal de predicción multi-token (MTP) entrenado con múltiples pasos, que permite decodificación especulativa opcional.

La cuantización JANG_6D no es uniforme: cada uno de los 590 módulos cuantizados recibe un ancho de bits determinado por la sensibilidad medida mediante la traza de la Hessiana (tr(H)·‖W‖²_F) sobre un corpus de calibración. Los módulos de atención se mantienen en alta precisión, mientras que los bloques FFN menos sensibles liberan presupuesto. Además, los módulos sub-8-bit se reajustan con mínimos cuadrados ponderados por activación (imatrix), y las proyecciones de visión que no son divisibles por el grupo de cuantización de MLX se mantienen en fp16 para evitar pérdidas silenciosas. No se aplicaron AWQ ni GPTQ por incompatibilidad con la convención de normalización del modelo.

## Capacidades

- Generación de texto y comprensión de imágenes y vídeo (verificado en este bundle).
- Razonamiento multi-paso con modo *thinking* activado por defecto (`temperature=1.0, top_p=0.95, top_k=20`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `xhigh`).
- Preservación del contexto de razonamiento entre turnos (`preserve_thinking`).
- Soporte de *tool calling* y uso de agentes (parser `qwen3_coder`).
- Predicción multi-token (MTP) con cabezal preservado, recomendando 1 token de borrador por paso.
- Detección de fin de secuencia con doble EOS (ids 248046 y 248044).
- Multilingüe limitado al inglés según la model card.

## Casos de uso

- Análisis de imágenes en entornos profesionales: el modelo puede describir, clasificar o extraer información de fotografías o capturas, gracias a su torre de visión nativa y su ventana de contexto de 262K tokens que permite procesar documentos extensos junto con imágenes.
- Comprensión de vídeo para archivado o búsqueda: al aceptar entradas de vídeo a través de su plantilla de chat, puede resumir o indexar contenido audiovisual, útil en sistemas de gestión de medios.
- Agentes autónomos con uso de herramientas: su soporte de *tool calling* y el preset de muestreo agéntico permiten construir asistentes que consultan APIs, ejecutan código o interactúan con servicios externos en flujos multi-paso.
- Generación y revisión de código en local: el modo *thinking* y el parser `qwen3_coder` lo hacen adecuado para tareas de programación asistida, como generación de funciones, revisión de PR o explicación de fragmentos, sin depender de la nube.
- Asistencia en investigación con razonamiento extenso: con `reasoning_effort` configurable y contexto largo, puede analizar papers, comparar resultados o razonar sobre problemas matemáticos complejos.
- Chat conversacional con memoria persistente: la preservación del contexto de razonamiento entre turnos y la ventana de 262K tokens permiten mantener conversaciones largas y coherentes, por ejemplo en atención al cliente o tutoría técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple Silicon con al menos 32 GB de memoria unificada (recomendado por el autor).
- Tamaño en disco: 24,1 GiB (25,8 GB en el repositorio).
- Inferencia mediante `mlx_vlm` (librería MLX), sin necesidad de GPU dedicada.
- Compatible con runtimes que soporten MLX y el formato safetensors.
- La decodificación especulativa con el cabezal MTP es opcional y requiere soporte del runtime.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

Dentro de la misma familia de cuantizaciones del modelo base, se ofrecen cuatro variantes:

| Variante | Tamaño en disco | Cuantización | Uso recomendado |
|---|---|---|---|
| JANG_2D | 10,9 GiB | 2x4-bit + mixta | Máxima compresión, menor calidad |
| JANG_4D | 17,0 GiB | 4x4-bit + mixta | Equilibrio tamaño/calidad |
| JANG_6D (este) | 24,1 GiB | 6/8-bit mixta | Calidad cercana a fp16 |
| MXFP8 | 26,8 GiB | 8-bit uniforme | Referencia de calidad |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., Llama 3.2 Vision o InternVL) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card indica únicamente inglés; no se garantiza soporte multilingüe.
- Hardware: requiere Apple Silicon con 32 GB o más de memoria unificada; no es compatible con GPUs NVIDIA o AMD sin adaptación.
- Cuantización mixta: aunque se calibra con Hessian e imatrix, puede haber degradación en tareas muy sensibles a la precisión; las proyecciones de visión en fp16 mitigan parte del riesgo.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- Dependencia del runtime: el contrato de servicio (presets, EOS, MTP) debe ser leído por el runtime; si no se respeta, el comportamiento puede diferir del esperado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_6D
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante JANG_2D: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_2D
- Variante JANG_4D: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_4D
- Variante MXFP8: https://huggingface.co/OsaurusAI/Qwen3.8-27B-MXFP8
- Sitio de Osaurus: https://osaurus.ai
