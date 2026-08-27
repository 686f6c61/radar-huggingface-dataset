# mradermacher/Apodex-1.1-mini-i1-GGUF

## Resumen

Apodex-1.1-mini-i1-GGUF es una cuantización en formato GGUF del modelo Apodex-1.1-mini, realizada por mradermacher. El modelo base, desarrollado por el equipo de Apodex, está diseñado para tareas de inteligencia agéntica: razonamiento, búsqueda, manejo de archivos, ejecución de código y coordinación multi-agente. Según los artículos publicados en agosto de 2026, Apodex 1.1 introduce un "Agent Team" asíncrono entrenado como capacidad interna del modelo, no como un orquestador externo.

El repositorio de HuggingFace indica que el modelo tiene 48.036.230 parámetros (dato de safetensors), lo que lo convierte en una versión muy compacta. Sin embargo, algunas fuentes web mencionan "36B agent weights" para Apodex-1.1-mini, lo que sugiere una discrepancia significativa. Dado que el tamaño del repositorio es de solo 0.2 GB, es probable que el modelo sea realmente pequeño (48M) y que las referencias a 36B correspondan a otra variante o a un error. Esta ficha se basa en los datos verificables de HuggingFace.

La relevancia de esta cuantización radica en que permite ejecutar el modelo en hardware muy modesto, incluso en CPU, manteniendo la compatibilidad con el ecosistema GGUF (llama.cpp, Ollama, etc.). El archivo proporcionado es un archivo imatrix, útil para generar cuantizaciones personalizadas de mayor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer) |
| Parametros totales | 48.036.230 (segun HuggingFace) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (en el repo solo se incluye el archivo imatrix) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Se sabe que es un modelo de transformers (según la etiqueta `library_name: transformers`), pero se desconoce si es un decoder estándar, si incorpora atención lineal u otras innovaciones. Los artículos web mencionan que Apodex 1.1 integra un "Agent Team" asíncrono como una capacidad entrenada, lo que sugiere que el modelo ha sido entrenado específicamente para coordinar múltiples agentes internos, pero no se ofrecen detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, etc.).

El modelo base se describe como "reasoning-first" y orientado a tareas de investigación complejas y de largo horizonte, trabajando directamente con archivos, datos, código y herramientas. No hay información pública sobre la arquitectura exacta ni sobre el proceso de entrenamiento.

## Capacidades

- Razonamiento y resolución de problemas complejos, con verificación de pasos (según la web oficial).
- Coordinación multi-agente: el modelo puede gestionar múltiples agentes internos de forma asíncrona (Agent Team).
- Manejo de archivos y datos: capaz de leer, escribir y procesar archivos.
- Ejecución de código: puede generar y ejecutar código en entornos controlados.
- Búsqueda de información: integra capacidades de búsqueda en su flujo de razonamiento.
- Soporte de tool calling / function calling (implícito en su diseño agéntico).
- Capacidades de visión: la model card indica que es un modelo de visión, aunque no se proporcionan archivos mmproj en este repositorio.
- Multilingüe: soporta inglés y chino.

## Casos de uso

- Automatización de tareas de investigación: el modelo puede buscar información, leer documentos, extraer datos y generar informes estructurados, gracias a su capacidad de manejo de archivos y razonamiento multi-paso.
- Agente de desarrollo de software: puede generar, revisar y ejecutar código, integrándose en pipelines de CI/CD para pruebas automatizadas o generación de parches.
- Asistente de análisis de datos: procesa archivos CSV, JSON o bases de datos, ejecuta consultas y produce visualizaciones o resúmenes.
- Coordinación de tareas multi-agente: en un entorno de agentes, el modelo puede actuar como orquestador, delegando subtareas a otros agentes especializados y consolidando resultados.
- Chatbot técnico bilingüe: al soportar inglés y chino, puede atender consultas de soporte en ambos idiomas, con capacidad de acceder a documentación o bases de conocimiento.
- Prototipado rápido de agentes: gracias a su pequeño tamaño, es adecuado para experimentar con arquitecturas agénticas en entornos con recursos limitados, como Raspberry Pi o instancias cloud de baja gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los artículos web mencionan que Apodex-1.0-mini "toped" el leaderboard FutureX, pero no se proporcionan cifras concretas para Apodex-1.1-mini. No se dispone de datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 48M de parámetros, el archivo GGUF cuantizado (por ejemplo, Q4_K_M) ocuparía menos de 100 MB, por lo que puede ejecutarse en CPU sin GPU.
- VRAM estimada: inferior a 1 GB en cualquier cuantización; incluso en FP16 cabría en GPUs con 1 GB o menos.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) o directamente CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es necesario.
- Latencia y throughput: al ser tan pequeño, la inferencia es casi instantánea en CPU moderna; se pueden alcanzar cientos de tokens por segundo en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es inusualmente pequeño para tareas agénticas, y no se conocen alternativas directas del mismo tamaño y orientación. Modelos como Qwen2.5-0.5B o SmolLM2-360M podrían ser comparables en tamaño, pero no en capacidades agénticas específicas. Se recomienda consultar el leaderboard FutureX para más contexto, aunque no se dispone de datos en esta ficha.

## Limitaciones y advertencias

- El tamaño extremadamente reducido (48M) limita severamente la capacidad de razonamiento complejo y la calidad de las respuestas en comparación con modelos de billones de parámetros.
- Existe una discrepancia entre el número de parámetros reportado por HuggingFace (48M) y las menciones web a "36B". Esto debe aclararse antes de usar el modelo en producción.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real es incierto.
- Al ser un modelo de visión, la ausencia de archivos mmproj en este repositorio impide su uso multimodal directo.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base.
- El modelo solo soporta inglés y chino; no se garantiza buen rendimiento en otros idiomas.
- Riesgo de alucinaciones y sesgos, especialmente en tareas de razonamiento complejo, debido a su tamaño reducido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Apodex-1.1-mini-i1-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Apodex-1.1-mini-GGUF
- Artículo sobre Apodex 1.1: https://www.explainx.ai/blog/apodex-1-1-agent-team-frontieragent-august-2026
- Noticia en korshunov.ai: https://korshunov.ai/en/article/21262-apodex-team-releases-apodex-1-1-model-family-and-frontieragent-harness/
- Noticia en ccleaks.com: https://ccleaks.com/news/apodex-1-1-mini-agent-team-hf-aug-2026
- Web oficial de Apodex: https://www.apodex.com/
