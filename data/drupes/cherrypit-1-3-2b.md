# DRUPEs/CherryPit-1.3-2B

## Resumen

CherryPit-1.3-2B es un modelo de lenguaje causal de aproximadamente 2.500 millones de parámetros desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems). Se construye sobre MiniCPM5-2B mediante una fusión de pesos con el fine-tune matemático Caldalis/MiniCPM5-2B-Math, seguida de un ajuste fino adicional con datos propios verificados de aplicaciones web, Python, seguimiento de instrucciones y código, y una mezcla final 75/25 con un modelo de la línea CherryPit-1.2. El resultado es un modelo del mismo tamaño y arquitectura que sus predecesores, pero con mejoras sustanciales en matemáticas y generación de aplicaciones web.

La relevancia de esta versión radica en su enfoque de eficiencia: consigue mejoras medibles sin añadir parámetros ni cambiar la arquitectura, lo que lo mantiene apto para despliegue en dispositivo y en hardware de consumo. Emplea una arquitectura transformer estándar de tipo Llama con una longitud de contexto de 128K tokens (131.072), soporte de tool calling a través de su plantilla de chat integrada y licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines existentes.

El modelo está orientado a tareas de razonamiento matemático con modo thinking, desarrollo web (generación de componentes React con múltiples funcionalidades), código Python, seguimiento de instrucciones y llamadas a herramientas. Está entrenado y evaluado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estándar de tipo Llama (causal language model) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | GGUF disponible en repo separado (incluye Q4_K_M con redondeo Hessian-aware); pesos bf16 en el repo principal |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en DRUPEs/CherryPit-1.3-2B-GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal estándar de tipo Llama, sin innovaciones estructurales respecto a su base MiniCPM5-2B: no hay mezcla de expertos, atención lineal ni mecanismos híbridos. La construcción de esta versión se basa en tres etapas: primero, una fusión por promedio de pesos entre CherryPit-1.1 y Caldalis/MiniCPM5-2B-Math (un fine-tune matemático Apache 2.0 del mismo modelo base), que según el autor superó a ambos progenitores en matemáticas de presupuesto largo y redujo la tasa de respuestas incorrectas con alta confianza. Después, un ajuste fino con datos propios verificados de aplicaciones web, Python, seguimiento de instrucciones y código. Finalmente, una mezcla 75/25 con un modelo de la línea CherryPit-1.2, que elevó el seguimiento de instrucciones por encima de ambos padres.

El autor indica que ninguno de los benchmarks reportados se utilizó para entrenamiento y que la proporción de mezcla 75/25 se fijó antes de medir resultados. La plantilla de chat arranca en modo thinking por defecto; se puede desactivar con `enable_thinking=False`. La decodificación recomendada es temperatura 1.0 y top_p 0.95, con hasta 32K tokens nuevos para problemas matemáticos difíciles. No se detalla el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat integrada.
- Razonamiento matemático con modo thinking, incluyendo problemas de competición (AIME, MATH-500).
- Generación de código Python y tareas de programación general.
- Desarrollo web: generación de componentes React con una o varias funcionalidades combinadas.
- Tool calling / function calling soportado a través de la plantilla de chat integrada.
- Seguimiento de instrucciones estrictas (evaluado con IFEval a nivel de prompt).
- Modo thinking activable y desactivable para alternar entre razonamiento extendido y respuestas directas.
- Orientado a despliegue on-device por su tamaño reducido (~2,5B parámetros).

## Casos de uso

- Razonamiento matemático asistido: resolución de problemas de competición y cálculo simbólico con modo thinking y hasta 32K tokens de razonamiento, adecuado para herramientas educativas o de verificación de problemas donde se requiere mostrar el desarrollo.
- Generación de componentes React: creación de interfaces con una o varias funcionalidades en un mismo componente, útil para prototipado rápido de front-end o generación de código en editores y asistentes de desarrollo web.
- Asistente de código en local: generación y completado de funciones Python en entornos sin conexión o con requisitos de privacidad, gracias a su tamaño apto para GPU de consumo y su licencia Apache 2.0.
- Agentes con tool calling: integración en flujos de agente que invocan funciones externas (APIs, calculadoras, bases de datos) mediante la plantilla de chat, con respuestas directas al desactivar el modo thinking para reducir latencia.
- Automatización de tareas de instrucción estricta: procesamiento de prompts con formato y restricciones específicas (IFEval 87,2 en modo estricto), útil para generación de informes estructurados o transformación de datos con reglas fijas.
- Despliegue en dispositivo y edge computing: inferencia en portátiles o estaciones de trabajo con GPU modesta usando los pesos GGUF del repo separado, para asistentes locales, clasificación o generación de texto sin dependencia de la nube.
- Prototipado e investigación de fusiones de modelos: como ejemplo reproducible de merging de pesos y ajuste fino sobre una base pequeña, útil para estudiar técnicas de combinación de modelos con presupuesto limitado.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando CherryPit-1.3 con CherryPit-1.2 bajo el mismo harness (pesos bf16 en vLLM, una semilla de inicio de texto):

| Benchmark | Configuracion | CherryPit-1.2 | CherryPit-1.3 | Delta |
|---|---|---:|---:|---:|
| AIME 2025 + 2026 | thinking, 32K, 2 muestras por problema | 67,5 | 79,2 | +11,7 |
| MATH-500 | sin thinking, greedy | 87,2 | 91,8 | +4,6 |
| WebApp1K-React, 1 funcionalidad | sin thinking, 1.000 tareas | 83,2 | 84,6 | +1,4 |
| WebApp1K Duo, 2 funcionalidades | sin thinking, 1.000 tareas | 48,3 | 52,7 | +4,4 |
| WebApp1K Trio, 3 funcionalidades | sin thinking, 1.000 tareas | 45,7 | 49,7 | +4,0 |
| WebApp1K Quartet, 4 funcionalidades | sin thinking, 1.000 tareas | 29,5 | 35,0 | +5,5 |
| LiveCodeBench v6 | thinking, 8K, media de 2 | 47,7 | 45,7 | −2,0 (no significativo) |
| LiveCodeBench v6 | sin thinking, media de 4 | 38,4 | 36,0 | −2,4 (no significativo) |
| HumanEval+ | sin thinking, greedy | 84,8 | 84,1 | −0,7 (no significativo) |
| MBPP+ | sin thinking, greedy | 68,3 | 68,8 | +0,5 |
| IFEval | estricto, a nivel de prompt | 86,1 | 87,2 | +1,1 |

El autor señala que en AIME, problema a problema, 1.3 resuelve 22 que 1.2 falla y falla 8 que 1.2 resuelve (test de signos unilateral, p = 0,008), y que ninguna fila empeoró de forma significativa tras comprobaciones pareadas contra 1.0, 1.1 y 1.2.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5 GB solo para pesos; con caché KV para contexto largo, el consumo crece de forma proporcional al contexto configurado.
- VRAM estimada en cuantización Q4_K_M (GGUF): en torno a 1,6-2 GB para pesos, apta para GPU de consumo con 4-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G para bf16; A100 y H100 para despliegues con contexto de 128K y alta concurrencia.
- Cabe en GPU de consumo: sí, tanto en bf16 en tarjetas de 8 GB o más como en GGUF Q4_K_M en tarjetas de 4 GB o más.
- Opciones de despliegue: transformers, vLLM (`vllm serve DRUPEs/CherryPit-1.3-2B --max-model-len 32768`), llama.cpp, Ollama y LM Studio mediante el repo GGUF, además de text-generation-inference según los tags del modelo.
- Latencia y throughput: no disponible; el autor solo indica que la velocidad es la misma que en las versiones 1.0-1.2 por mantener tamaño y arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Matemáticas (referencia) | Codigo (referencia) | Licencia |
|---|---:|---|---|---|---|
| CherryPit-1.3-2B | ~2,5B | 128K | AIME 79,2 (thinking), MATH-500 91,8 | HumanEval+ 84,1, LiveCodeBench v6 45,7 (thinking) | Apache 2.0 |
| CherryPit-1.2-2B | ~2B | 128K (según model card) | AIME 67,5, MATH-500 87,2 | HumanEval+ 84,8, LiveCodeBench v6 47,7 | Apache 2.0 |
| openbmb/MiniCPM5-2B | ~2B | no disponible en la información | no disponible | no disponible | no disponible |
| Caldalis/MiniCPM5-2B-Math | ~2B | no disponible en la información | fine-tune matemático del mismo base; sin cifras en la información | no disponible | Apache 2.0 |

No se dispone de resultados de benchmarks de los modelos base en la información proporcionada, por lo que la comparación cuantitativa se limita a las versiones de la propia familia CherryPit.

## Limitaciones y advertencias

- Es un modelo de 2B parámetros: puede responder con seguridad a cuestiones incorrectas; conviene verificar las respuestas relevantes.
- El rendimiento en código es aproximadamente igual al de la versión 1.2, no superior: LiveCodeBench −2,0 con thinking y −2,4 sin thinking, HumanEval+ −0,7, todas dentro del ruido estadístico.
- La combinación de varias funcionalidades en un mismo componente web mejora pero no está resuelta: cuatro funcionalidades en un componente pasan el 35,0% de las veces frente al 84,6% con una sola.
- Entrenado y evaluado únicamente en inglés; no hay evidencia de calidad en otros idiomas.
- Los datos de benchmarks proceden del propio autor y del mismo harness interno; no se han verificado de forma independiente.
- No se detalla la composición del dataset de ajuste fino ni el número de tokens de entrenamiento, lo que limita la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.
- El modo thinking consume hasta 32K tokens nuevos en problemas difíciles, lo que incrementa coste y latencia; para respuestas directas debe desactivarse explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DRUPEs/CherryPit-1.3-2B
- Repo GGUF: https://huggingface.co/DRUPEs/CherryPit-1.3-2B-GGUF
- Versión anterior: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Fine-tune matemático fusionado: https://huggingface.co/Caldalis/MiniCPM5-2B-Math
