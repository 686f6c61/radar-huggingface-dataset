# lyber-ai/Hy4-UNCENSORED-MXFP4

## Resumen

Hy4-UNCENSORED-MXFP4 es una cuantización en formato MXFP4 del modelo Hy4-UNCENSORED-FP8, publicada por el usuario lyber-ai en Hugging Face. Se trata de una variante derivada de la familia Hunyuan Hy4 de Tencent, un modelo multimodal de tipo image-text-to-text con arquitectura MoE (mixture of experts) y capacidades de razonamiento y tool calling. La etiqueta "UNCENSORED" indica que se ha aplicado algún proceso de modificación (probablemente fine-tuning o abliteration) sobre el modelo base para reducir los rechazos y filtros de seguridad del modelo original.

El modelo está empaquetado con la librería transformers y el formato compressed-tensors, lo que permite cargarlo con cuantización MXFP4 (formato de 4 bits con escalas compartidas por bloque). El repositorio ocupa 215,2 GB y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es la de Tencent Hunyuan, que impone restricciones específicas de uso.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de bajo bit que reduce los requisitos de memoria frente al FP8 original; por otro, advierte de que se trata de una modificación no oficial del modelo de Tencent, con implicaciones tanto técnicas como legales que conviene evaluar antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text), familia Hunyuan Hy4; detalles exactos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (compressed-tensors), derivado de FP8 |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | tencent-hunyuan (acceso gated) |
| Formato de pesos | safetensors con compressed-tensors (MXFP4) |

## Arquitectura y entrenamiento

El modelo deriva de la familia Hunyuan Hy4 de Tencent, etiquetada como `hy_v4_vl`, lo que indica una arquitectura multimodal de visión y lenguaje con mezcla de expertos. La información disponible no detalla el número de parámetros totales ni activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica la innovación técnica concreta del modelo original (por ejemplo, mecanismos de atención o decodificación).

La variante aquí descrita es una cuantización MXFP4 de un modelo intermedio (Hy4-UNCENSORED-FP8), que a su vez es una versión modificada del Hy4 original. El proceso "UNCENSORED" no está documentado en la información proporcionada: no se indica si se realizó mediante abliteration, fine-tuning con datasets sin filtros o ajuste de capas de rechazo. El formato MXFP4 usa bloques de 4 bits con escalas compartidas, lo que reduce el tamaño de los pesos aproximadamente a la mitad respecto a FP8, a costa de una posible pérdida de precisión que no se ha cuantificado públicamente.

## Capacidades

- Generación de texto conversacional multi-turno en siete idiomas (inglés, chino, español, francés, japonés, coreano y ruso).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), incluyendo preguntas sobre imágenes.
- Razonamiento explícito (tag `reasoning`), orientado a tareas de varios pasos.
- Tool calling y function calling, según las etiquetas del repositorio.
- Soporte para flujos de agentes y razonamiento multi-paso (etiqueta `moe` y `tool-calling`).
- Modo "uncensored": reducción de rechazos y respuestas evasivas respecto al modelo original, sin que se detalle el método.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.

## Casos de uso

- Asistencia conversacional multilingüe: el modelo cubre siete idiomas y puede gestionar diálogos multi-turno; útil para atención al cliente en mercados con mezcla de español, inglés y chino, aunque la ventana de contexto no está documentada.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer información de capturas, diagramas o formularios escaneados y responder preguntas sobre ellos en un solo pipeline.
- Generación de código con tool calling: las etiquetas indican soporte de llamadas a funciones, lo que permite integrarlo en asistentes de IDE o pipelines de CI/CD que consulten APIs externas.
- Agentes de razonamiento multi-paso: la etiqueta `reasoning` sugiere uso en tareas que requieren descomposición de problemas, como planificación o resolución de incidencias técnicas.
- Investigación sobre alineación y seguridad: al ser una variante "uncensored", es útil para estudiar el comportamiento de modelos sin filtros de rechazo y comparar con el original, siempre dentro de los límites legales.
- Prototipado en hardware limitado: la cuantización MXFP4 reduce el espacio de pesos frente a FP8, lo que facilita pruebas en entornos con menos memoria, aunque el repositorio de 215 GB sigue siendo considerable.
- Despliegue en infraestructura compatible con compressed-tensors: útil para equipos que ya usan transformers y quieren evaluar un modelo MoE multimodal cuantizado sin cambiar de stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 215,2 GB, por lo que la inferencia requiere al menos esa cantidad de memoria o descarga parcial con offloading.
- GPU recomendadas: no disponible; por el tamaño, se necesitan GPUs de数据中心 (A100 80 GB, H100 80 GB) en configuración multi-GPU o sistemas con memoria unificada.
- ¿Cabe en GPU de consumo? No es probable: incluso con MXFP4, el tamaño del checkpoint supera la VRAM de una RTX 4090 (24 GB) o similar; requeriría offloading a CPU o sharding.
- Opciones de despliegue: transformers con compressed-tensors (soporte declarado); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-UNCENSORED-MXFP4 | no disponible (MoE) | no disponible | tencent-hunyuan (gated) | Hugging Face, acceso restringido |
| Hy4-UNCENSORED-FP8 (base) | no disponible | no disponible | tencent-hunyuan | Hugging Face |
| Hunyuan Hy4 original | no disponible | no disponible | tencent-hunyuan | Hugging Face |
| Alternativas multimodales MoE de otros proveedores | no disponible | no disponible | varía | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El proceso "UNCENSORED" no está documentado: se desconoce qué capas o comportamientos se modificaron y si la calidad general se degradó.
- Riesgo elevado de alucinación y de respuestas inapropiadas al haberse reducido los filtros de seguridad; no recomendado para aplicaciones orientadas al usuario sin supervisión.
- La cuantización MXFP4 puede introducir pérdida de precisión frente a FP8; no se han publicado evaluaciones comparativas.
- Licencia tencent-hunyuan: impone restricciones de uso comercial y de redistribución; es necesario revisar los términos antes de cualquier despliegue.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que limita la automatización de descargas.
- No se dispone de información sobre sesgos, longitud de contexto real ni idiomas más allá de los siete listados.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-23; no hay evidencia de validación por la comunidad.
- No se confirma soporte en motores de inferencia populares (vLLM, TGI, llama.cpp), lo que puede complicar el despliegue en producción.

## Enlaces

- [Hugging Face: lyber-ai/Hy4-UNCENSORED-MXFP4](https://huggingface.co/lyber-ai/Hy4-UNCENSORED-MXFP4)
- [Modelo base: lyber-ai/Hy4-UNCENSORED-FP8](https://huggingface.co/lyber-ai/Hy4-UNCENSORED-FP8)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
