# AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ

## Resumen

Qwen3.8-27B es un modelo multimodal denso de 27.800 millones de parámetros desarrollado por el equipo Qwen de Alibaba, lanzado el 14 de agosto de 2026. Está construido sobre la base arquitectónica de Qwen3.5 y destaca por su capacidad para procesar texto, imágenes y vídeo, con una ventana de contexto de 262.144 tokens. El modelo original se distribuye bajo licencia Apache 2.0, lo que permite su uso local sin necesidad de API.

La versión aquí descrita, `AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ`, es una conversión realizada por AtomicChat al formato MLX (librería de Apple para inferencia en silicio de Apple) con cuantización de 3 bits. Su objetivo es reducir el consumo de memoria y permitir la ejecución del modelo en hardware de consumo, como Macs con chip M-series o GPUs con VRAM limitada. El repositorio incluye pesos en formato safetensors y ocupa 11,8 GB.

Cabe señalar una discrepancia importante: el nombre del modelo sugiere 27B de parámetros, pero los archivos safetensors contienen 3.364.314.624 parámetros (~3,36B). Esta diferencia no está explicada en la documentación disponible y podría deberse a un error en el repositorio o a una versión reducida del modelo. Se recomienda verificar antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) basado en Qwen3.5 |
| Parametros totales | 3.364.314.624 (según safetensors; el modelo original Qwen3.8-27B tiene 27,8B según fuentes web) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según documentación del modelo original) |
| Tipos de cuantizacion | 3-bit (CLIP-DWQ) |
| Idiomas soportados | en (inglés) según HuggingFace; el modelo original probablemente soporta más idiomas, pero no se especifica |
| Licencia | No disponible en HuggingFace; Apache 2.0 según fuentes web del modelo original |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B es un transformer denso multimodal que procesa texto, imágenes y vídeo. Está construido sobre la arquitectura de Qwen3.5 e incorpora mejoras específicas en tareas de programación, automatización de oficina y flujos de trabajo agénticos de largo horizonte. Según la documentación oficial, el modelo es capaz de completar tareas complejas de múltiples pasos con mayor fiabilidad que versiones anteriores.

La versión MLX aquí presentada aplica una cuantización de 3 bits con la técnica denominada CLIP-DWQ (no se dispone de detalles técnicos sobre esta técnica). La cuantización reduce el tamaño de los pesos y acelera la inferencia en hardware compatible con MLX, a costa de una posible pérdida de precisión. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF, DPO, etc.) en la información disponible.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imágenes y vídeo, lo que permite tareas de descripción visual, respuesta a preguntas sobre contenido visual y análisis de vídeo.
- Generación de texto: produce respuestas coherentes y contextualizadas en inglés.
- Razonamiento y resolución de problemas: diseñado para tareas complejas de razonamiento lógico y matemático.
- Generación de código: soporta programación en múltiples lenguajes, con especial énfasis en tareas de desarrollo y depuración.
- Flujos de trabajo agénticos: capaz de ejecutar tareas de múltiples pasos de forma autónoma, lo que sugiere soporte para tool calling y planificación.
- Automatización de oficina: puede generar documentos, resumir correos, crear presentaciones y otras tareas de productividad.
- Multilingüe: aunque HuggingFace indica solo inglés, el modelo original de Qwen suele ser multilingüe; no se confirma en esta versión.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (VS Code, Jupyter) para autocompletar código, explicar fragmentos y sugerir correcciones, gracias a su capacidad de generación de código y razonamiento.
- Análisis de imágenes y vídeo en local: permite extraer información de capturas, diagramas o vídeos sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Automatización de tareas de oficina: puede redactar informes, resumir actas, generar borradores de correos electrónicos y preparar presentaciones a partir de instrucciones en lenguaje natural.
- Agente autónomo para investigación: con su capacidad de razonamiento multi-paso, puede buscar información, contrastar fuentes y elaborar resúmenes estructurados.
- Chatbot de atención al cliente: con 262.144 tokens de contexto, puede mantener conversaciones largas y recordar detalles de interacciones previas, adecuado para soporte técnico.
- Prototipado rápido de aplicaciones multimodales: al ejecutarse en local con MLX, permite desarrollar y probar aplicaciones que combinan texto e imagen sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para esta versión cuantizada ni para el modelo original en las fuentes consultadas.

## Requisitos de hardware

- Tamaño del repositorio: 11,8 GB, lo que indica que los pesos cuantizados ocupan aproximadamente esa cantidad. Se recomienda al menos 12 GB de memoria unificada o VRAM para cargar el modelo completo.
- Compatibilidad MLX: diseñado para Apple Silicon (M1, M2, M3, M4) con memoria unificada. Un Mac con 16 GB o más puede ejecutar el modelo con comodidad.
- GPUs de consumo: aunque MLX está orientado a Apple, los pesos safetensors podrían convertirse a otros formatos (GGUF, etc.) para ejecutarse en GPUs NVIDIA con CUDA, pero no se proporcionan instrucciones.
- Opciones de despliegue: MLX (librería nativa), posiblemente llama.cpp si se convierte a GGUF, o vLLM si se adapta. No se mencionan otras herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo original Qwen3.8-27B compite con otros modelos multimodales densos de tamaño similar, como Qwen3.5-27B o Qwen3.6-27B, pero no se han encontrado especificaciones detalladas de estos en las fuentes consultadas. La versión cuantizada 3-bit es una adaptación específica para MLX, por lo que su comparativa directa con otras versiones cuantizadas (por ejemplo, 4-bit o 8-bit) no está documentada.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: el nombre indica 27B, pero los safetensors contienen ~3,36B. Esto puede deberse a un error de empaquetado o a una versión reducida no documentada. Verificar antes de usar.
- Cuantización de 3 bits: la pérdida de precisión puede afectar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- Idioma: solo se confirma inglés. El uso en otros idiomas puede dar resultados subóptimos.
- Licencia: aunque el modelo original es Apache 2.0, la ficha de HuggingFace indica "no disponible". Se recomienda contactar con el autor para aclarar los términos de uso de esta conversión.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento de esta versión cuantizada.
- Repositorio sin actividad: 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ
- Página del modelo en Atomic Chat: https://atomic.chat/models/qwen3-8-27b
- Repositorio oficial de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio oficial de QwenLM: https://github.com/QwenLM/Qwen3.8
- Página en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Repositorio relacionado (versión 3-bit g32): https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-3bit-g32
