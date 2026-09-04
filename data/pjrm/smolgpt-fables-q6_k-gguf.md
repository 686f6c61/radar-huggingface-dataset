# PJRM/smolgpt-fables-Q6_K-GGUF

## Resumen

PJRM/smolgpt-fables-Q6_K-GGUF es una conversión a formato GGUF del modelo `neonforestmist/smolgpt-fables`, un modelo de lenguaje pequeño (1.710 millones de parámetros, aproximadamente 1.71B) especializado en la generación de fábulas y relatos cortos. El modelo original está adaptado de SmolLM2 y ha sido entrenado con el dataset `neonforestmist/smolgpt-markdown-stories`, compuesto por historias en formato Markdown. Esta versión GGUF está pensada para ejecutarse con llama.cpp, lo que permite su uso en CPU y en GPUs con poca memoria, sin necesidad de infraestructura pesada.

El objetivo del modelo es transformar una idea simple en una fábula legible de una a seis escenas, con personajes nombrados, escenarios definidos y un final orientado a moraleja. Destaca por su capacidad de generación controlada y de seguimiento de instrucciones en el dominio narrativo, aunque su conocimiento general y su capacidad de razonamiento son limitados por su tamaño. Es relevante para desarrolladores que buscan un modelo ligero, de licencia Apache 2.0, para aplicaciones de escritura creativa o prototipado de historias en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de SmolLM2) |
| Parametros totales | 1.711.376.384 (1.71B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (GGUF); tambien existe Q4_0 en el mismo autor |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors) |

## Arquitectura y entrenamiento

El modelo base `neonforestmist/smolgpt-fables` es una adaptación de SmolLM2, un modelo de lenguaje pequeño de arquitectura Transformer. Mantiene el mismo tamaño de parámetros (1.71B) pero ha sido afinado específicamente con el dataset `neonforestmist/smolgpt-markdown-stories`, que contiene historias en formato Markdown. El entrenamiento se centra en la escritura de fábulas estructuradas, con énfasis en la generación controlada y el seguimiento de instrucciones. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni sobre la aplicación de técnicas como RLHF o DPO. La conversión a GGUF se realizó con llama.cpp mediante el espacio GGUF-my-repo de Hugging Face, sin modificar los pesos del modelo original.

## Capacidades

- Generación de texto narrativo en inglés, especializado en fábulas y relatos cortos de una a seis escenas.
- Seguimiento de instrucciones para controlar la estructura de la historia: personajes, escenario y final.
- Generación controlada de contenido creativo, con coherencia narrativa básica.
- Ejecución local en CPU o GPU mediante llama.cpp, con soporte para CLI y servidor.
- Compatible con el formato GGUF, lo que permite su integración en aplicaciones basadas en llama.cpp o interfaces compatibles.
- No se menciona soporte de tool calling, visión, audio ni capacidades multilingües en la información disponible.

## Casos de uso

- Generación de fábulas personalizadas para niños: el modelo puede crear historias cortas con personajes y moralejas a partir de un prompt sencillo. Es adecuado por su tamaño reducido y su entrenamiento específico en narrativa.
- Prototipado de contenido narrativo para juegos o aplicaciones interactivas: permite generar rápidamente tramas y escenas para videojuegos, libros interactivos o experiencias de narración. Su bajo coste computacional facilita iteraciones frecuentes.
- Herramientas de escritura asistida para autores: puede usarse como generador de borradores de fábulas o cuentos, ayudando a superar bloqueos creativos. La generación controlada permite ajustar la estructura de la historia.
- Contenido educativo para el aprendizaje de inglés: los relatos cortos y sencillos pueden servir como material de lectura para estudiantes. El modelo está limitado al inglés y produce textos narrativos, no explicativos.
- Demostraciones de modelos de lenguaje en local: al ser un GGUF de 1.4 GB, es ideal para probar la generación de texto en máquinas sin GPU o con GPUs modestas, usando llama.cpp o llama-server.
- Experimentación con cuantización y despliegue de modelos pequeños: permite comparar el rendimiento entre versiones Q4_0 y Q6_K, así como evaluar la calidad de la generación en diferentes niveles de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q6_K pesa aproximadamente 1.4 GB, por lo que se requiere alrededor de 2 GB de VRAM para ejecutarlo en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3050 o superior. También puede ejecutarse en iGPU modernas o directamente en CPU.
- Cabe en GPUs de consumo: sí, en tarjetas de gama baja y media.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama si se importa el GGUF, y cualquier framework compatible con formato GGUF. No se recomienda vLLM ni TGI para este formato.
- Latencia y throughput: no disponible en la información proporcionada. Al ser un modelo pequeño, se espera una latencia baja en CPU y muy baja en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PJRM/smolgpt-fables-Q6_K-GGUF | 1.71B | No disponible | GGUF | Apache 2.0 | Hugging Face |
| PJRM/smolgpt-fables-Q4_0-GGUF | 1.71B | No disponible | GGUF | Apache 2.0 | Hugging Face |
| neonforestmist/smolgpt-fables | 1.71B | No disponible | Safetensors | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B (modelo base) | 1.71B | No disponible | Safetensors | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos. La principal diferencia es el formato y la cuantización, que afectan al rendimiento de inferencia pero no a la calidad de los pesos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que su uso en otros idiomas no es fiable.
- Su dominio de conocimiento es estrecho: genera fábulas y relatos, pero tiene capacidades limitadas en razonamiento general, matemáticas o código.
- Al ser un modelo pequeño, existe riesgo de alucinación y de incoherencias narrativas en historias largas o complejas.
- La longitud de contexto no está documentada, por lo que no se recomienda utilizar entradas muy largas sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de la licencia del dataset y del modelo base.
- No se han publicado evaluaciones de sesgos ni de seguridad, por lo que se desconocen los sesgos potenciales del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PJRM/smolgpt-fables-Q6_K-GGUF
- Versión Q4_0 en Hugging Face: https://huggingface.co/PJRM/smolgpt-fables-Q4_0-GGUF
- Modelo base: https://huggingface.co/neonforestmist/smolgpt-fables
- Dataset de entrenamiento: https://huggingface.co/datasets/neonforestmist/smolgpt-markdown-stories
- GitHub del modelo original: https://github.com/neonforestmist/SmolGPT-Fables/tree/main
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
