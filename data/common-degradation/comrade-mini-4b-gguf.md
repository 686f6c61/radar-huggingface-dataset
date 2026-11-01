# common-degradation/comrade-mini-4b-gguf

## Resumen

Comrade Mini es un ajuste fino experimental del modelo Qwen3-4B, desarrollado por el usuario common-degradation y publicado en HuggingFace. Se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M) y está pensado para ejecutarse localmente mediante Ollama, especialmente en equipos Apple Silicon. El modelo base Qwen3-4B aporta una arquitectura transformer densa de aproximadamente 4.022 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen3, aunque la model card no confirma configuración específica para este ajuste).

El objetivo declarado del proyecto es construir un asistente local para trabajar con documentos: responder preguntas sobre texto, extraer datos estructurados (fechas, importes, nombres), resumir, editar textos y planificar tareas, todo sin enviar información a servicios en la nube. El ajuste se realizó con LoRA sobre un subconjunto de DocVQA (814 ejemplos de entrenamiento, 90 de validación y 200 de test), empleando MLX-LM sobre Apple Silicon, y posteriormente se fusionó el adaptador con el modelo base y se convirtió a GGUF.

Es relevante ahora por dos motivos: por un lado, ejemplifica el flujo completo de especialización de un modelo pequeño para tareas documentales en hardware de consumo; por otro, su licencia BigScience OpenRAIL-M y su naturaleza experimental lo convierten en un caso de estudio interesante sobre las limitaciones de los ajustes LoRA con datasets reducidos. El repositorio tiene 69 descargas y ningún "like" en el momento de la consulta, lo que indica un proyecto de nicho y reciente (creado en octubre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B soporta 32.768 tokens nativos |
| Tipos de cuantizacion | Q4_K_M (GGUF); se menciona también GGUF F16 en el pipeline de build |
| Idiomas soportados | ruso (ru) |
| Licencia | bigscience-openrail-m |
| Formato de pesos | GGUF (repo de 2,5 GB); el adaptador LoRA original no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso decoder-only de la familia Qwen3, y se especializa mediante un adaptador LoRA entrenado con MLX-LM sobre Apple Silicon (16 GB de memoria unificada, entorno macOS arm64, Python 3.14.6, MLX-LM 0.31.3). El dataset de entrenamiento es un subconjunto de DocVQA (nielsr/docvqa_1200_examples) con 814 ejemplos de entrenamiento, 90 de validación, 200 de test y 96 ejemplos marcados para revisión. Cada ejemplo se formatea como un diálogo con mensajes de sistema, usuario y asistente, orientado a preguntas y respuestas sobre documentos con texto OCR.

El pipeline declarado es: Qwen3-4B → entrenamiento LoRA sobre DocVQA → fusión del adaptador con el modelo base → exportación a GGUF F16 → cuantización a Q4_K_M con llama.cpp → carga en Ollama. No se documentan detalles sobre hiperparámetros de entrenamiento (rank del LoRA, learning rate, epochs), composición exacta del dataset más allá de DocVQA, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se especifica si se preservaron las capacidades de "thinking mode" del Qwen3 original ni cómo afectó el ajuste a las capacidades multilingües del modelo base.

## Capacidades

- Respuesta a preguntas sobre el contenido de documentos, apoyándose en texto OCR y contexto conversacional.
- Extracción de entidades y datos estructurados: fechas, importes, nombres y otros campos relevantes.
- Edición y mejora de textos: reescritura, corrección y ajuste de estilo.
- Generación de resúmenes, instrucciones y notas de trabajo.
- Planificación de tareas y estructuración de información en pasos.
- Razonamiento paso a paso con respuesta final sintetizada (herencia del modo de razonamiento de Qwen3, aunque no se confirma su preservación tras el ajuste).
- Procesamiento local de datos tras la instalación, sin dependencia de servicios en la nube.
- Soporte de conversación multi-turno mediante el formato de mensajes system/user/assistant.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Análisis de contratos y documentos legales: el modelo puede responder preguntas sobre cláusulas concretas y extraer fechas y partes implicadas a partir del texto OCR, manteniendo los datos en local, algo crítico en entornos con requisitos de confidencialidad.
- Procesamiento de facturas y recibos: extracción de importes, fechas y emisores en un pipeline OCR + LLM ejecutado íntegramente en un MacBook, sin enviar documentos financieros a terceros.
- Asistente personal de investigación documental: resumen de artículos o informes largos y generación de notas estructuradas, aprovechando la ventana de contexto del modelo base para abarcar documentos extensos.
- Revisión y edición de textos en ruso: corrección de estilo, reescritura de párrafos y mejora de claridad en borradores, adecuado por el enfoque del ajuste en idioma ruso.
- Planificación de proyectos y tareas: descomposición de objetivos en pasos accionables y generación de listas de verificación a partir de una descripción textual.
- Prototipado de asistentes conversacionales offline: despliegue con Ollama en equipos de desarrollo para validar flujos de Q&A documental antes de invertir en infraestructura mayor.
- Educación y autoformación: generación de preguntas de comprensión sobre apuntes o materiales de estudio, con la ventaja de que el contenido no sale del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, DocVQA ni comparaciones cuantitativas con el modelo base u otros ajustes. Tampoco se reportan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada: el repo GGUF Q4_K_M ocupa 2,5 GB, por lo que la inferencia requiere aproximadamente 3-4 GB de memoria libre incluyendo overhead de contexto y runtime.
- GPU recomendadas: no se especifican; el proyecto está orientado a Apple Silicon con memoria unificada (configuración de desarrollo: MacBook con 16 GB).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) y en equipos Apple Silicon de 8 GB o más.
- Opciones de despliegue: Ollama (método principal documentado); también es compatible con llama.cpp por ser formato GGUF. No se documenta compatibilidad con vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Comrade Mini 4B | 4.022 M | no disponible (base: 32.768) | ru | bigscience-openrail-m | GGUF Q4_K_M | Ajuste LoRA sobre DocVQA, experimental |
| Qwen3-4B (base) | 4.022 M | 32.768 nativos | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo original, sin especialización documental |
| Qwen2.5-3B | ~3.090 M | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar, sin ajuste específico |
| Phi-3.5-mini | 3.820 M | 128.000 | multilingüe | MIT | safetensors, GGUF | Mayor contexto nativo, orientado a razonamiento |

La comparación con el modelo base es la más relevante: Comrade Mini hereda las capacidades de Qwen3-4B pero las restringe a un dominio documental en ruso mediante un dataset pequeño, con licencia más restrictiva (OpenRAIL-M frente a Apache 2.0) y solo en formato cuantizado. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Proyecto en fase experimental: el propio autor advierte que el calidad depende de los datos de entrenamiento, la precisión del OCR y la formulación del prompt, y que los resultados deben verificarse.
- Dataset de entrenamiento reducido (814 ejemplos) y de un único dominio (DocVQA), lo que limita la generalización fuera de tareas de Q&A documental.
- Riesgo de alucinación en la extracción de datos: especialmente peligroso en contextos legales o financieros, donde el autor recomienda verificación humana explícita.
- Idioma limitado al ruso según los metadatos; no se garantiza el rendimiento multilingüe del Qwen3-4B original tras el ajuste.
- Licencia BigScience OpenRAIL-M: permite uso comercial pero impone restricciones de uso (cláusulas de uso responsable); es más restrictiva que la Apache 2.0 del modelo base.
- Solo se distribuye en GGUF Q4_K_M: no hay pesos en safetensors ni el adaptador LoRA original, lo que dificulta la reproducibilidad y la re-fusión con otras cuantizaciones.
- No se documentan hiperparámetros de entrenamiento ni evaluación cuantitativa, lo que impide auditar la calidad del ajuste.
- No se confirma la preservación del modo de razonamiento (thinking) ni del soporte de tool calling de Qwen3-4B.
- Sin garantías de mantenimiento: 0 likes y 69 descargas sugieren un proyecto personal sin comunidad activa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/common-degradation/comrade-mini-4b-gguf
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset DocVQA (subconjunto usado): https://huggingface.co/datasets/nielsr/docvqa_1200_examples
- Ollama (runtime principal): https://ollama.com/
- Ollama, descarga: https://ollama.com/download
- MLX-LM (entrenamiento): https://github.com/ml-explore/mlx-lm
- llama.cpp (cuantización): https://github.com/ggml-org/llama.cpp
- Python: https://www.python.org/
- Git: https://git-scm.com/
- CMake: https://cmake.org/
