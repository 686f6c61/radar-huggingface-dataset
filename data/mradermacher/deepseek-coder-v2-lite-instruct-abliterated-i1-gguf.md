# mradermacher/DeepSeek-Coder-V2-Lite-Instruct-abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo DeepSeek-Coder-V2-Lite-Instruct en su versión "abliterated" (eliminación de rechazos y restricciones de seguridad) preparadas por mradermacher. El modelo base, desarrollado por DeepSeek, es un modelo de lenguaje especializado en código con arquitectura MoE de 15.700 millones de parámetros totales y 2.400 millones activos, con una ventana de contexto de 128.000 tokens. La versión abliterada modifica los pesos para reducir la negativa a responder a ciertas instrucciones, lo que puede ser útil para casos de uso técnicos donde se requiere una respuesta directa sin filtros de seguridad. Al estar en formato GGUF, el modelo puede ejecutarse en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en DeepSeek-Coder-V2-Lite-Instruct |
| Parametros totales | 15.706.484.224 |
| Parametros activos | 2.400.000.000 (aprox., del modelo base) |
| Longitud de contexto | 128.000 tokens (modelo base; no confirmado para esta versión) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés y chino) |
| Licencia | no disponible (modelo base: DeepSeek License, pero esta versión no especifica) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

Esta versión es una cuantización GGUF del modelo DeepSeek-Coder-V2-Lite-Instruct abliterado. El modelo base es un transformer MoE con 64 expertos y 2 expertos activos por token, que combina atención de ventana deslizante (4.096 tokens) con atención completa cada 16 capas. Se entrenó con 10,2 billones de tokens de código y texto técnico, seguido de un ajuste fino con instrucciones. La técnica "abliterated" (probablemente realizada mediante eliminación de direcciones de rechazo en el espacio de activaciones) reduce la probabilidad de que el modelo se niegue a responder a solicitudes que normalmente rechazaría. La cuantización con imatrix (importance matrix) mejora la calidad de los quants de baja precisión al ponderar la pérdida de información por canal.

## Capacidades

- Generación de código en múltiples lenguajes (Python, Java, C++, JavaScript, etc.) con completado y relleno de código.
- Razonamiento lógico y matemático, especialmente en problemas de programación.
- Comprensión de contexto largo (hasta 128K tokens) para análisis de proyectos completos.
- Soporte de instrucciones en lenguaje natural para generar o modificar código.
- Capacidad de manejar tareas de infilling (rellenar huecos en código) gracias al entrenamiento con fill-in-the-blank.
- Al ser abliterado, responde sin los rechazos habituales de seguridad, lo que puede ser útil para tareas de red teaming o análisis de vulnerabilidades.

## Casos de uso

- Asistente de programación en IDE: el modelo puede completar funciones, generar tests unitarios y refactorizar código en tiempo real, aprovechando su ventana de 128K tokens para considerar todo el contexto del proyecto.
- Análisis de código legacy: con la capacidad de procesar repositorios completos, puede explicar qué hace un módulo antiguo y sugerir migraciones a versiones modernas.
- Generación de documentación técnica: a partir de código fuente, el modelo puede redactar comentarios, guías de uso y especificaciones de API.
- Evaluación de seguridad ofensiva: al no tener rechazos, puede simular ataques de inyección de código o generar exploits para pruebas de penetración en entornos controlados.
- Automatización de pipelines CI/CD: integrado vía llama.cpp o vLLM, puede generar scripts de build, configuraciones de despliegue y manejar errores de compilación de forma autónoma.
- Tutoría de programación: explicar conceptos, depurar errores y proponer ejercicios personalizados a estudiantes, con respuestas directas sin restricciones artificiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterada y cuantizada. El modelo base DeepSeek-Coder-V2-Lite-Instruct reporta en su documentación oficial resultados en HumanEval (76,2), MBPP (74,0) y otros, pero estos datos corresponden a la versión original sin cuantizar ni abliterar. Para esta versión GGUF, el rendimiento puede degradarse ligeramente según el nivel de cuantización (típicamente entre un 1% y un 5% en tareas de razonamiento, dependiendo del quants elegido).

## Requisitos de hardware

- VRAM estimada: depende del quants. Para Q4_K_M (~9,3 GB) se necesitan al menos 12 GB de VRAM; para Q8 (~16 GB) se requieren 20 GB o más. El modelo en BF16 original necesita 80 GB en 8 GPUs.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40/80 GB para quants mayores o para ejecutar el modelo sin cuantizar.
- En GPU de consumo (8-12 GB) se puede usar Q2_K o Q3_K_M con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, vLLM (con soporte GGUF limitado), llama-cpp-python.
- Latencia y throughput: en una RTX 4090 con Q4_K_M, se espera una generación de 30-50 tokens/s para contexto corto, y menor con contexto largo. No hay datos oficiales para esta versión.

## Comparativa con modelos similares

| Modelo | Params totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct (original) | 15,7B (MoE) | 128K | DeepSeek License | safetensors | Sin abliterar, rendimiento de referencia |
| DeepSeek-Coder-V2-Lite-Instruct-abliterated (esta versión) | 15,7B (MoE) | 128K (teórico) | no disponible | GGUF | Cuantizado y abliterado |
| CodeLlama-13B-Instruct | 13B (dense) | 16K | Llama 2 License | safetensors, GGUF | Menor contexto, sin MoE |
| Qwen2.5-Coder-14B-Instruct | 14B (dense) | 32K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en código, contexto menor |

## Limitaciones y advertencias

- El proceso de abliterado elimina los rechazos de seguridad, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. No es adecuado para aplicaciones orientadas al usuario final sin moderación adicional.
- La cuantización degrada la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código muy largo. Se recomienda usar quants de al menos Q4_K_M para tareas críticas.
- La licencia del modelo base (DeepSeek License) puede imponer restricciones de uso comercial, pero esta versión no especifica su propia licencia; se debe verificar antes de usar en producción.
- El modelo está entrenado principalmente con datos en inglés y chino; el rendimiento en otros idiomas, incluido el español, es limitado.
- No se dispone de información sobre el dataset de entrenamiento de la versión abliterada ni sobre su proceso exacto de modificación, lo que dificulta evaluar su fiabilidad.
- La ventana de contexto de 128K es teórica; en la práctica, con cuantizaciones GGUF, el rendimiento puede degradarse antes de alcanzar ese límite.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/DeepSeek-Coder-V2-Lite-Instruct-abliterated-i1-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Repositorio GitHub de DeepSeek-Coder-V2: https://github.com/deepseek-ai/DeepSeek-Coder-V2
- Página del proyecto DeepSeek Coder: https://deepseekcoder.github.io/
