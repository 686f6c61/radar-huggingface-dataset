# Abiray/Muse-Glimmer-30B-GGUF

## Resumen

Muse-Glimmer-30B es un modelo multimodal de 30 000 millones de parámetros desarrollado por Meta Superintelligence Labs, el primer modelo abierto de este laboratorio. Está destilado de Muse Spark y diseñado específicamente para flujos agénticos autónomos, razonamiento multi-paso de largo horizonte, tareas de codificación tipo SWE-bench y function calling fiable en hardware de consumo. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Este repositorio contiene las cuantizaciones GGUF del modelo base, generadas con llama.cpp, e incluye además los proyectores de visión (mmproj) necesarios para aprovechar su capacidad multimodal de entrada de imágenes. El modelo acepta tanto texto como imágenes como entrada y produce texto, lo que lo hace adecuado para asistentes locales con visión, agentes que interactúan con herramientas y sistemas de automatización de desarrollo. Su tamaño de contexto alcanza los 131 072 tokens, según el ejemplo de uso proporcionado, lo que permite manejar conversaciones largas y documentos extensos.

La relevancia de Muse-Glimmer radica en que es un modelo abierto de Meta orientado a ejecutarse en equipos de consumo, con cuantizaciones que van desde 11,5 GB hasta 29,6 GB, lo que permite su despliegue en GPUs de 16 GB o superiores. Su combinación de visión, agencia y razonamiento lo sitúa como una alternativa interesante para desarrolladores que necesitan un modelo local con capacidades de tool use y análisis de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con proyector de visión (según documentación de Unsloth) |
| Parametros totales | 27 854 794 240 (dato real safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens (según ejemplo de uso en la model card) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_M, IQ3_M, IQ3_XS, IQ3_XXS |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors para el modelo base |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo en la información disponible. Se sabe que es un modelo denso de aproximadamente 30 000 millones de parámetros, multimodal (entrada de imagen y texto), y que incorpora un proyector de visión de aproximadamente 1 800 millones de parámetros (según la descripción del archivo mmproj). El modelo está destilado de Muse Spark, un modelo más grande de Meta, aunque no se especifica el proceso de destilación ni los datos de entrenamiento utilizados.

Tampoco se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que está optimizado para flujos agénticos, razonamiento multi-paso y function calling, lo que sugiere un entrenamiento específico para estas tareas, pero no se ofrecen detalles adicionales.

## Capacidades

- Generación de texto y razonamiento multi-paso de largo horizonte, adecuado para tareas que requieren planificación y ejecución secuencial.
- Entrada multimodal de imágenes y texto, con salida de texto. Puede analizar capturas de pantalla, diagramas, documentos escaneados y otros contenidos visuales.
- Soporte de tool calling y function calling, lo que permite integrarlo en sistemas agénticos que invocan APIs, ejecutan comandos o interactúan con servicios externos.
- Capacidad de razonamiento para tareas de codificación, con especial énfasis en problemas tipo SWE-bench (resolución de issues de software).
- Conversación multi-turno con contexto largo (hasta 131 072 tokens), útil para mantener estado en diálogos extensos o procesar documentos largos.
- Compatible con llama.cpp, lo que permite ejecutarlo en CPU y GPU, con soporte de cuantizaciones para distintos niveles de memoria.

## Casos de uso

- Asistente de desarrollo con visión: el modelo puede analizar capturas de pantalla de errores de compilación, diagramas de arquitectura o fragmentos de UI, y generar código o sugerencias de corrección. Su contexto largo permite mantener el historial completo de una sesión de depuración.
- Agente autónomo de automatización de tareas: gracias al tool calling, puede encadenar llamadas a APIs, ejecutar scripts y tomar decisiones basadas en resultados intermedios, por ejemplo para orquestar pipelines de CI/CD o gestionar incidencias.
- Soporte técnico visual automatizado: un sistema de atención al cliente puede recibir imágenes de problemas (por ejemplo, pantallas de error) y responder con pasos de solución, manteniendo conversaciones multi-turno con contexto prolongado.
- Revisión de código asistida: el modelo puede analizar diffs de pull requests, identificar posibles bugs o mejoras, y generar tests unitarios, apoyándose en su entrenamiento orientado a SWE-bench.
- Asistente de documentación técnica: con su ventana de 131 072 tokens, puede procesar manuales extensos, especificaciones o guías, y responder preguntas complejas sobre su contenido, incluso con diagramas incluidos.
- Despliegue local de un agente conversacional con visión: en una GPU de 24 GB (por ejemplo, RTX 4090) con la cuantización Q5_K_M, se puede ejecutar un asistente personal que interprete imágenes del entorno, planifique tareas y use herramientas, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo en los materiales consultados.

## Requisitos de hardware

- VRAM estimada según cuantización (datos de la model card):
  - Q8_0: 32 GB - 48 GB
  - Q6_K: 28 GB - 32 GB
  - Q5_K_M: 24 GB
  - Q4_K_M: 20 GB - 24 GB
  - IQ4_NL: 20 GB
  - IQ4_XS: 18 GB - 20 GB
  - Q3_K_M: 16 GB - 18 GB
  - IQ3_M: 16 GB
  - IQ3_XS: 14 GB - 16 GB
  - IQ3_XXS: 12 GB - 16 GB
- GPUs recomendadas: RTX 3090, RTX 4090, RTX 5090 (para cuantizaciones de 24 GB); GPUs con 16 GB (por ejemplo, RTX 4060 Ti 16 GB) pueden usar cuantizaciones Q3 o IQ3.
- El modelo cabe en GPUs de consumo con 16 GB o más, dependiendo de la cuantización elegida. Para la cuantización Q4_K_M se recomienda al menos 20 GB de VRAM.
- Es necesario descargar además un archivo mmproj (vision projector) de 2,05 GB (Q8_0) o 3,85 GB (BF16) para habilitar la entrada de imágenes.
- Opciones de despliegue: llama.cpp (llama-server), llama-cli, y según la documentación de Unsloth, también es compatible con Unsloth para ejecución optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con otros modelos de la misma categoría. No hay información sobre benchmarks comparativos, ni especificaciones detalladas de alternativas como Qwen2.5-32B, Llama 3.1 30B u otros modelos agénticos multimodales. Se recomienda consultar la documentación oficial de Meta y los resultados de la comunidad para obtener métricas de rendimiento relativas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones específicos de este modelo. Como ocurre con todos los modelos de lenguaje, existe riesgo de generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- La información sobre idiomas soportados no está disponible; se desconoce si el modelo está optimizado para español u otros idiomas distintos del inglés.
- El modelo requiere el archivo mmproj para funciones de visión; sin él, solo funcionará la entrada de texto.
- Las cuantizaciones de baja precisión (Q3, IQ3) pueden degradar significativamente la calidad del razonamiento y la fidelidad de la visión. Se recomienda usar al menos Q4_K_M para tareas críticas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base no está incluido en este repositorio; es necesario descargarlo por separado desde meta-models/Muse-Glimmer-30B.
- El contexto de 131 072 tokens es un valor indicado en el ejemplo de uso; no se ha confirmado oficialmente como especificación del modelo, y el rendimiento real puede variar según la cuantización y el hardware.

## Enlaces

- Repositorio HuggingFace de cuantizaciones GGUF: https://huggingface.co/Abiray/Muse-Glimmer-30B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de Meta Research: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Guía de comunidad en GitHub: https://github.com/cobusgreyling/Muse-Glimmer
- Documentación de Unsloth para ejecución local: https://unsloth.ai/docs/models/muse-glimmer
