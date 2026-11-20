# alex-and-the/Qwen3.5-9B-Uncensored-MLX

## Resumen

Qwen3.5-9B-Uncensored-MLX es una conversión al formato MLX de la variante "heretic" de Qwen3.5-9B, un modelo multimodal de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) derivado de Qwen/Qwen3.5-9B. El autor de esta conversión es el usuario de Hugging Face alex-and-the, mientras que el modelo intermedio "heretic" procede de darkc0de. La particularidad del modelo es que ha sido "descensurado" mediante la herramienta Heretic v1.2.0 aplicando Magnitude-Preserving Orthogonal Ablation (MPOA), una técnica de ablación de direcciones en el espacio de activaciones que reduce los rechazos del modelo ante peticiones que el original bloquearía.

El pipeline declarado es image-text-to-text, lo que indica que conserva la capacidad multimodal de entrada de imagen y texto heredada del Qwen3.5 original. Los pesos están cuantizados en mxfp4 (4 bits, formato de punto flotante microscaling de Apple), lo que reduce el repositorio a 5,2 GB y lo hace apto para ejecución en hardware Apple Silicon mediante la librería MLX. El modelo soporta 27 idiomas, entre ellos castellano, inglés, chino, ruso, francés, alemán, árabe, japonés y coreano.

Su relevancia actual radica en dos factores: por un lado, ofrece una vía práctica para ejecutar un modelo multimodal de ~9B en Macs con memoria unificada; por otro, la licencia Apache 2.0 del modelo base permite uso comercial, aunque el proceso de descensurado introduce riesgos de contenido que conviene evaluar antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5; detalles internos de capas y atención no disponibles en la informacion proporcionada |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp4 (4 bits); el repositorio solo publica esta cuantizacion |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el (27 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion mxfp4; tamano del repo 5,2 GB |

## Arquitectura y entrenamiento

El modelo es una conversión de formato, no un entrenamiento desde cero: se ha transformado darkc0de/Qwen3.5-9B-heretic a MLX mediante mlx-vlm versión 0.3.12. La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal que acepta imagen y texto como entrada y genera texto. No se dispone en la informacion proporcionada de detalles sobre número de capas, dimensión oculta, mecanismo de atención (si emplea atención lineal, híbrida o estándar) ni sobre el dataset de preentrenamiento del modelo original.

La modificación respecto al modelo base consiste en la aplicación de Heretic v1.2.0 con Magnitude-Preserving Orthogonal Ablation (MPOA). Se trata de una técnica de edición de pesos que identifica direcciones de activación asociadas a comportamientos de rechazo y las elimina mediante proyección ortogonal, preservando la magnitud de las activaciones para minimizar el daño al resto de capacidades. No se documentan en la model card ni el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO, ni la composición del dataset; esos datos corresponden al modelo Qwen3.5 original y no se incluyen aquí.

## Capacidades

- Generación de texto conversacional multi-turno en 27 idiomas, incluido castellano.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text), heredado del Qwen3.5 original.
- Modo "thinking" y modo "instruct" (no-thinking), con parámetros de muestreo recomendados distintos para cada uno.
- Razonamiento general y resolución de tareas de razonamiento con ajustes de muestreo específicos (temperature=1.0, top_p=1.0, top_k=40, presence_penalty=2.0).
- Respuestas sin los rechazos típicos del modelo alineado original, gracias a la ablación MPOA.
- Soporte de tool calling y function calling: no confirmado explícitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la informacion proporcionada.
- Capacidades de código y matemáticas: no documentadas en la model card; se asumen las del Qwen3.5-9B base, pero sin datos verificables.

## Casos de uso

- Asistente conversacional local en Mac: el modelo está cuantizado en mxfp4 y empaquetado en MLX, por lo que puede ejecutarse en Apple Silicon con memoria unificada mediante mlx-vlm, sin necesidad de GPU dedicada, para prototipos de chat multi-turno.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede emplearse para extraer y resumir información de capturas, formularios o figuras dentro de un pipeline de digitalización.
- Investigación sobre alineación y descensurado: sirve como caso de estudio para medir el efecto de MPOA sobre la tasa de rechazos y la degradación de capacidades frente al Qwen3.5-9B original.
- Generación de contenido creativo sin filtros: útil en entornos controlados de escritura de ficción donde los rechazos del modelo alineado interrumpen el flujo, con revisión humana posterior obligatoria.
- Evaluación comparativa de cuantizaciones: al ser una conversión MLX de un modelo de ~9,4B, permite medir latencia y calidad de mxfp4 frente a otras cuantizaciones del mismo modelo base en hardware Apple.
- Despliegue en estación de trabajo sin conectividad: el tamaño de 5,2 GB permite llevarlo en local para tareas de asistencia lingüística multilingüe (27 idiomas) en entornos aislados.
- Traducción y adaptación multilingüe: con soporte declarado de castellano, inglés, chino, árabe, japonés y otros, puede usarse para borradores de traducción entre pares de idiomas, siempre con revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 5,2 GB en mxfp4; se recomienda al menos 8 GB de memoria unificada libre para la inferencia, y 16 GB para margen con contexto largo y procesamiento de imágenes.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada, dado que el formato es MLX.
- GPU NVIDIA: no es el objetivo de esta conversión; para CUDA habría que usar otra cuantización del modelo base (no incluida en este repositorio).
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Macs de consumo con memoria unificada suficiente; en GPUs dedicadas de consumo requeriría una conversión a otro formato no publicada aquí.
- Opciones de despliegue: mlx-vlm (versión 0.3.12 o superior); vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con pesos MLX mxfp4.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-MLX (este) | ~9,4B | no disponible | MLX mxfp4 | apache-2.0 | Descensurado con MPOA; solo Apple Silicon |
| Qwen/Qwen3.5-9B (base) | ~9,4B | no disponible | safetensors (original) | apache-2.0 | Modelo alineado de referencia; rechaza contenido sensible |
| darkc0de/Qwen3.5-9B-heretic | ~9,4B | no disponible | safetensors | apache-2.0 (heredada) | Variante heretic pre-conversión; formato no MLX |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El descensurado mediante MPOA elimina barreras de rechazo, lo que aumenta el riesgo de generar contenido dañino, ilegal o sexualmente explícito; no es apto para aplicaciones de cara al público sin moderación externa.
- La ablación puede degradar capacidades del modelo original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a los modelos de ~9B; la edición de pesos no lo reduce y podría agravarlo en dominios factuales.
- El autor advierte de que valores altos de presence_penalty pueden provocar mezcla de idiomas y una ligera caída de rendimiento; es un parámetro a ajustar con cuidado.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo descensurado puede incumplir políticas de plataformas, términos de servicio o normativa sobre contenido en la jurisdicción de uso; la responsabilidad recae en el desplegador.
- Compatibilidad limitada: los pesos MLX mxfp4 no funcionan en vLLM, llama.cpp, Ollama ni TGI; requiere hardware Apple y mlx-vlm.
- Longitud de contexto no documentada en esta ficha; conviene verificar la del Qwen3.5-9B original antes de diseñar aplicaciones con contextos largos.
- El modelo tiene solo 2 likes y 1.705 descargas en el momento de la consulta, lo que indica una validación comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alex-and-the/Qwen3.5-9B-Uncensored-MLX
- Modelo base intermedio: https://huggingface.co/darkc0de/Qwen3.5-9B-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de descensurado): https://github.com/p-e-w/heretic
- mlx-vlm (librería de inferencia): no se proporciona URL en la informacion disponible
- Apoyo al autor: https://donatr.ee/thecluster/
