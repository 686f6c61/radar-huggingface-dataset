# Austriani/MiniCPM5-2B-Heretic-ARA-ik_llama.cpp

## Resumen

MiniCPM5-2B-Heretic-ARA-ik_llama.cpp es una cuantización GGUF del modelo dalatexcoder/MiniCPM5-2B-heretic-ara, publicada por el usuario Austriani. Se trata de un derivado de la familia MiniCPM5 de 2B parámetros (2.516.756.480 parámetros reales según los safetensors del modelo base) que ha sido sometido a un proceso de "abliteration" o "heretic" para eliminar los mecanismos de rechazo y moderación del modelo original, orientándolo a usos sin censura.

Esta versión concreta no es un modelo nuevo, sino un empaquetado en formato GGUF optimizado para el motor ik_llama.cpp, con cuantizaciones de tipo IQ (IQ4_K, IQ4_KS, IQ4_KS_R4, IQ4_KT, IQ5_K) generadas mediante imatrix. El objetivo es ofrecer una inferencia eficiente en CPU y en dispositivos de borde (edge-ai, on-device) manteniendo las capacidades de generación de texto, código, matemáticas, razonamiento y tool calling del modelo base.

Es relevante para quienes necesitan desplegar un modelo pequeño, sin moderación y con soporte de agentes en hardware limitado, aunque debe tenerse en cuenta que se trata de un derivado no oficial con implicaciones éticas y de licencia que se detallan más abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia MiniCPM5, transformer; detalles no especificados en la información disponible) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_K, IQ4_KS, IQ4_KS_R4, IQ4_KT, IQ5_K (GGUF con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la familia a la que pertenece (MiniCPM5) y los tags, se trata de un transformer de aproximadamente 2.500 millones de parámetros, orientado a generación de texto con capacidades declaradas de código, matemáticas, razonamiento, tool calling y uso agéntico. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El proceso "heretic/abliterated" aplicado por el autor del modelo base consiste en una modificación de los pesos orientada a suprimir el comportamiento de rechazo, técnica habitual en la comunidad para obtener modelos sin censura. La versión de Austriani añade una capa de cuantización: los pesos originales se han convertido a GGUF con cuantizaciones IQ de 4 y 5 bits, calibradas mediante una matriz de importancia (imatrix) para preservar la calidad en bits bajos. El resultado está optimizado específicamente para el motor ik_llama.cpp, una bifurcación de llama.cpp con mejoras de rendimiento en CPU.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Razonamiento y resolución de problemas (tag reasoning).
- Generación y asistencia de código (tag code).
- Matemáticas (tag math).
- Tool calling y function calling (tags tool-calling, function-calling).
- Uso agéntico y razonamiento multi-paso (tag agentic).
- Capacidades multilingües limitadas a inglés y chino (en, zh).
- Orientación a despliegue en borde y on-device (edge-ai, on-device).
- Modelo "uncensored"/"abliterated": sin mecanismos de rechazo entrenados.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: con ~2,5B parámetros y cuantización IQ4, puede ejecutarse en CPU o en GPUs de consumo, gestionando conversaciones multi-turno sin conexión a servicios externos.
- Generación de código en entornos con recursos limitados: el soporte de tool calling permite integrarlo en asistentes de edición que invocan funciones del sistema, aunque la ventana de contexto no está documentada.
- Automatización de tareas agénticas simples: su naturaleza agentic y de function calling lo hace apto para pipelines de múltiples pasos donde el modelo decide qué herramienta invocar.
- Prototipado de investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin moderación en entornos controlados.
- Procesamiento de texto en inglés y chino: útil para tareas bilingües de resumen, extracción o traducción aproximada entre ambos idiomas.
- Inferencia en CPU con ik_llama.cpp: las cuantizaciones IQ con imatrix están pensadas para maximizar throughput en CPU, lo que permite desplegarlo en servidores sin GPU.
- Educación y experimentación con cuantizaciones GGUF: sirve como caso de estudio de cómo afectan IQ4_K frente a IQ5_K a la calidad y al tamaño en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: con cuantización IQ4_K, un modelo de 2,5B parámetros ocupa aproximadamente 1,5-2 GB de pesos; IQ5_K se sitúa en torno a 2-2,5 GB. Añadir margen para el contexto y el runtime (estimación basada en el tamaño de parámetros, no en datos publicados).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede alojarlo (RTX 3050, RTX 4060, GTX 1660, etc.). Para mayor throughput, RTX 4090, A100 o H100, aunque el modelo está claramente orientado a hardware modesto.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 4 GB o más.
- Opciones de despliegue: ik_llama.cpp (motor objetivo de esta publicación), llama.cpp, Ollama (previa conversión/importación del GGUF) y otros runtimes compatibles con GGUF. No se indica soporte nativo para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Heretic-ARA (este) | ~2,5B | no disponible | apache-2.0 | GGUF (ik_llama.cpp) | Abliterated, cuantizado IQ4/IQ5 |
| Modelo base dalatexcoder/MiniCPM5-2B-heretic-ara | ~2,5B | no disponible | apache-2.0 | safetensors (original) | Sin cuantizar, misma base heretic |
| MiniCPM5-2B original (familia MiniCPM) | ~2,5B | no disponible | no disponible | no disponible | Con moderación; referencia de la familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated"/"heretic": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido dañino, ofensivo o inapropiado. Etiquetado como "not-for-all-audiences".
- Riesgo elevado de alucinación y de respuestas incorrectas, especialmente en razonamiento complejo, dado el tamaño reducido (2,5B).
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia apache-2.0 declarada, pero al ser un derivado no oficial conviene verificar la cadena de licencias del modelo base antes de uso comercial.
- Cuantizaciones IQ4 de baja precisión pueden degradar la calidad frente a los pesos originales en safetensors.
- Optimizado para ik_llama.cpp; el comportamiento en otros runtimes GGUF puede variar.
- Modelo con pocas descargas (539) y un único "like": escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/MiniCPM5-2B-Heretic-ARA-ik_llama.cpp
- Modelo base: https://huggingface.co/dalatexcoder/MiniCPM5-2B-heretic-ara
- ik_llama.cpp (motor objetivo): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
