# F3Fe2D200/Qwen3.8-27B-heretic-ara

## Resumen

Qwen3.8-27B-heretic-ara es una versión descensurada (abliterated) del modelo Qwen/Qwen3.8-27B, publicada por el usuario F3Fe2D200. Se ha generado con la herramienta Heretic (fork personalizado de timrohrbaugh) en su versión v1.2.0+custom, aplicando el método Arbitrary-Rank Ablation (ARA). El objetivo es eliminar los comportamientos de rechazo del modelo original manteniendo al máximo el resto de capacidades: según la model card, las negativas caen de 99/100 a 0/100 en un conjunto de 100 peticiones de prueba, con una divergencia KL de 0,0535 respecto al modelo base.

El modelo subyacente es un Qwen3.8-27B: un modelo de lenguaje causal denso de 27.356.728.560 parámetros con codificador de visión, que forma parte de la familia abierta Qwen3.8. Es un modelo nativo de visión-lenguaje (pipeline image-text-to-text) capaz de procesar imágenes y vídeos, con control flexible de razonamiento (modo thinking activado por defecto, desactivable por petición y ajustable mediante `reasoning_effort`).

La relevancia actual del artefacto es doble. Por un lado, ofrece una alternativa sin filtros de rechazo sobre una arquitectura reciente con ventana de contexto de 262.144 tokens ampliable hasta 1.000.000. Por otro, documenta de forma reproducible todos los hiperparámetros de la ablación aplicada, lo que permite auditar y repetir el proceso. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 16 bloques de (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 64 capas en total |
| Parámetros totales | 27.356.728.560 (27,36 B), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens de forma nativa; ampliable hasta 1.000.000 |
| Tipos de cuantización | No disponible en la información proporcionada (el repositorio contiene pesos en safetensors; los 55,6 GB de repo son consistentes con BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed) |

Otros datos arquitectónicos declarados: dimensión oculta 5.120, embeddings de tokens de 248.320 (con padding), dimensión intermedia de la FFN 17.408, cabezas de atención con dimensión 256 y dimensión de RoPE 64, y cabeza de Multi-Token Prediction (MTP) entrenada con varios pasos.

## Arquitectura y entrenamiento

La arquitectura combina atención lineal y atención completa en una proporción 3:1. Cada bloque intermedio agrupa tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, todo ello con FFN. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y solo 4 para KV con dimensión 256. Esta mezcla reduce de forma notable el coste de la caché KV en contextos largos, ya que únicamente una de cada cuatro capas mantiene atención completa. El modelo incorpora además una cabeza MTP entrenada con varios pasos, aprovechable para decodificación especulativa y por tanto para acelerar la inferencia.

El modelo base pasó por fases de preentrenamiento y postentrenamiento, e incluye un codificador de visión que habilita comprensión de imágenes y vídeos (desde diagramas STEM y documentos hasta vídeos de una hora de duración). Sobre ese modelo, este artefacto aplica una ablación de rango arbitrario: se interviene desde la capa 26 hasta la 56 con `neighbor_count` 10, `preserve_good_behavior_weight` 0,9432, `steer_bad_behavior_weight` 0,0009 y `overcorrect_relative_weight` 0,5038. No se detalla la composición del dataset de calibración ni el volumen de tokens usado en la ablación.

## Capacidades

- Generación de texto conversacional multilingüe y multi-turno (los idiomas concretos no están listados en la información disponible).
- Razonamiento explícito con modo thinking activado por defecto, desactivable por petición y con profundidad ajustable mediante `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos gracias al parámetro `preserve_thinking`.
- Comprensión nativa de imagen y vídeo: diagramas técnicos, documentos y vídeos de hasta una hora.
- Ejecución agéntica: planificación autónoma y gestión de la realimentación del entorno para tareas de horizonte largo.
- Compatibilidad con harnesses y herramientas de desarrollo habituales del ecosistema Qwen.
- Decodificación especulativa mediante la cabeza MTP entrenada.
- Comportamiento sin rechazos: 0/100 negativas en el conjunto de evaluación de la ablación, frente a 99/100 del modelo original.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la model card cita herramientas integradas en la versión alojada de Qwen Cloud.

## Casos de uso

- Asistentes conversacionales sin filtros temáticos: el modelo mantiene diálogos multi-turno sobre temas que el modelo base rechazaría, útil en investigación sobre alineación, análisis de sesgos y estudios de seguridad de modelos.
- Investigación en interpretabilidad y mecanicismo: la ablación está completamente parametrizada y es reproducible, de modo que se puede reproducir el pipeline y comparar activaciones entre el modelo base y la versión abliterada.
- Análisis de documentos largos con imágenes: con 262.144 tokens de contexto nativo y codificador de visión, permite procesar informes escaneados, diagramas técnicos y documentación extensa en una sola pasada.
- Procesado de vídeo de larga duración: la comprensión de vídeos de hasta una hora habilita resumen automático, indexación semántica y extracción de eventos en archivos audiovisuales.
- Agentes autónomos de horizonte largo: las mejoras en planificación y gestión de realimentación del entorno lo hacen adecuado para pipelines multi-paso que encadenan herramientas y verifican resultados intermedios.
- Generación y revisión de código en entornos controlados: el modelo base está orientado a tareas de programación y trabajo profesional, y puede integrarse en flujos de revisión donde no se apliquen políticas de contenido corporativas restrictivas.
- Evaluación comparativa de procesos de abliteración: sirve como referencia para medir cuánto degrada la ablación las capacidades originales usando métricas como la divergencia KL (0,0535 en este caso).
- Investigación en razonamiento con coste variable: el control de `reasoning_effort` y la posibilidad de desactivar el modo thinking permiten estudiar el equilibrio entre latencia y precisión en tareas de matemáticas y lógica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos utilizables en la información disponible. La model card incluye una tabla comparativa de rendimiento en texto que enfrenta a Qwen3.8-27B con Qwen3.6-27B y Qwen3.7-Plus, pero el contenido se ha truncado antes de mostrar las cifras, por lo que no se reproducen valores.

Los únicos datos cuantitativos disponibles son los de la evaluación de la ablación:

| Métrica | Este modelo | Modelo original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0535 | 0 (por definición) |
| Rechazos | 0/100 | 99/100 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (según los 27,36 B de parámetros, sin contar caché): en torno a 55-60 GB, más el codificador de visión.
- VRAM estimada en FP8/INT8: aproximadamente 28-30 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 15-18 GB.
- GPU de centro de datos: una H100 de 80 GB o una A100 de 80 GB permiten BF16 en una sola tarjeta; dos A100 de 40 GB mediante tensor parallelism también son viables.
- GPU de consumo: no cabe en BF16 en una RTX 4090 de 24 GB. Con cuantización de 4 bits sí podría caber en una RTX 4090, RTX 3090 o similar con 24 GB, siempre que se genere la cuantización correspondiente.
- La arquitectura híbrida con Gated DeltaNet reduce el crecimiento de la caché KV respecto a un transformer de atención completa, lo que favorece escenarios de contexto largo (aunque no se ofrecen cifras concretas de ahorro).
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Soporte en llama.cpp, Ollama o TGI: no se menciona en la información disponible; requeriría conversión previa a GGUF u otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de cifras de rendimiento que permitan una comparación cuantitativa fiable. La comparación se limita a lo declarado en la model card.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-heretic-ara | 27,36 B (denso, con visión) | 262.144 ampliable a 1.000.000 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,36 B (denso, con visión) | 262.144 ampliable a 1.000.000 | Apache 2.0 | Pesos abiertos y servicio alojado en Qwen Cloud |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Citado en la model card como referencia comparativa |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Citado en la model card como referencia comparativa |

Diferencias verificables: este modelo elimina los rechazos (0/100 frente a 99/100) a costa de una divergencia KL de 0,0535 respecto al original. El resto de especificaciones arquitectónicas y de contexto coinciden con el modelo base.

## Limitaciones y advertencias

- Es un modelo abliterado: se ha intervenido deliberadamente para eliminar los mecanismos de rechazo. Puede generar contenido dañino, ofensivo, ilegal o inseguro que el modelo original bloquearía. No es adecuado para despliegues orientados al público sin filtros externos.
- La divergencia KL de 0,0535 indica que la distribución de salida se ha desplazado respecto al modelo original; puede haber degradación en tareas que dependían de los comportamientos eliminados, aunque no se documenta una evaluación sistemática de capacidades.
- Riesgo de alucinación: no se aportan datos específicos, pero es un riesgo inherente a los modelos de lenguaje de esta escala. La eliminación de rechazos puede aumentar la propensión a responder con seguridad sobre temas que el modelo base evitaba por falta de conocimiento fiable.
- Idiomas soportados: no disponibles. No se puede garantizar un rendimiento multilingüe homogéneo.
- Licencia Apache 2.0: permite uso comercial según los términos de esa licencia, pero el autor no ofrece ninguna garantía y la responsabilidad sobre el uso recae en el desplegador. Conviene revisar además los términos del modelo base.
- La model card no documenta el conjunto de calibración de la ablación ni los datos de entrenamiento, lo que limita la reproducibilidad completa más allá de los hiperparámetros publicados.
- Ventana de contexto: los 1.000.000 de tokens son una extensión declarada, no el valor nativo; el rendimiento real en esa longitud no está documentado.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, y su fecha de creación indicada es 2026-09-17, por lo que carece de validación por parte de la comunidad.
- No se documentan sesgos específicos, pero un modelo descensurado tiende a reproducir y amplificar sesgos presentes en los datos de preentrenamiento sin la moderación del postentrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/F3Fe2D200/Qwen3.8-27B-heretic-ara
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (repositorio original): https://github.com/p-e-w/heretic
- Heretic (fork utilizado): https://github.com/timrohrbaugh/heretic
- Pull request del método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Servicio alojado Qwen Cloud: https://www.qwencloud.com
- Ficha del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
