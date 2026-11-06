# rachitgoyell/Manimancer-4B

## Resumen

Manimancer-4B es un modelo de generación de texto especializado en producir código de animaciones para Manim, la biblioteca de Python para crear vídeos matemáticos y explicativos. Se trata de un fine-tuning de Qwen3-4B, el modelo base de 4.000 millones de parámetros del equipo Qwen, desarrollado por el usuario rachitgoyell y publicado en Hugging Face bajo licencia Apache 2.0. Su objetivo es resolver un problema concreto: automatizar la traducción de descripciones en lenguaje natural (un concepto matemático, un algoritmo, una escena) a scripts de Python con Manim listos para renderizar.

La relevancia del modelo radica en la combinación de especialización y accesibilidad: el repositorio distribuye una versión cuantizada en GGUF con cuantización Q4_K_M de unos 2,5 GB, lo que permite ejecutarlo localmente en hardware de consumo (CPU o GPU modesta) mediante llama.cpp, Ollama o LM Studio, sin depender de APIs externas ni de conexión a internet.

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3, con aproximadamente 4.022 millones de parámetros y una ventana de contexto de 4.096 tokens en los ejemplos de uso documentados. Al tratarse de un modelo muy especializado, no está pensado para chat general ni razonamiento abierto, sino como asistente de generación de código de animación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (en los ejemplos documentados) |
| Tipos de cuantizacion | Q4_K_M (4 bits, GGUF) |
| Idiomas soportados | Inglés (prompts), salida en Python |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (manimancer-4b.Q4_K_M.gguf, ~2,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de la familia Qwen3. Sobre esa base, el autor ha realizado un fine-tuning orientado a una única tarea: convertir descripciones en lenguaje natural en escenas completas de Manim escritas en Python. La model card no detalla el dataset de entrenamiento, el número de tokens empleados ni el método de ajuste (SFT, DPO, etc.), por lo que esos datos no están disponibles.

La innovación principal no es arquitectónica sino de especialización: el modelo está afinado para generar código de una librería concreta (Manim Community), lo que mejora la calidad del código generado frente al modelo base en este dominio específico. La distribución se realiza únicamente en formato GGUF cuantizado a Q4_K_M, optimizado para inferencia local con llama.cpp, Ollama, LM Studio y librerías como llama-cpp-python.

## Capacidades

- Generación de código Manim en Python a partir de descripciones en lenguaje natural (conceptos matemáticos, algoritmos, escenas científicas).
- Animación de algoritmos y walkthroughs de código, como búsquedas binarias sobre arrays ordenados o demostraciones visuales de teoremas.
- Generación de escenas con objetos concretos si se especifican en el prompt: ejes, arrays, gráficas, ecuaciones.
- Ejecución totalmente offline en hardware de consumo, tanto en CPU como en GPU modesta.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y llama-cpp-python.
- No está pensado para chat general, razonamiento abierto ni uso como asistente multipropósito; el fine-tuning es específico para Manim.

## Casos de uso

- Creación de vídeos educativos de matemáticas: un docente puede describir "demuestra visualmente el teorema de Pitágoras" y obtener un script de Manim renderizable con `manim -pql scene.py NombreEscena`, ahorrando horas de programación manual.
- Animación de algoritmos para cursos de informática: describir el funcionamiento de un algoritmo (por ejemplo, búsqueda binaria sobre un array ordenado) y generar la animación paso a paso que muestra el estado del array en cada iteración.
- Contenido para divulgación científica en YouTube o redes: generar borradores de escenas para explicaciones de conceptos de física, CS o matemáticas que luego se pulen a mano.
- Prototipado rápido de escenas: usar el modelo para obtener una primera versión funcional de una animación y refinarla manualmente en el editor, en lugar de empezar desde cero.
- Automatización en pipelines de generación de contenido: integrar el modelo vía llama-cpp-python en un script que convierta un guion en texto a múltiples escenas de Manim renderizables de forma batch.
- Generación offline y privada: al ejecutarse localmente en GGUF, es adecuado para entornos sin conexión a internet o con requisitos de privacidad (instituciones educativas, portátiles sin GPU de servidor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones cuantitativas (HumanEval, MMLU ni métricas específicas de generación de Manim), por lo que la calidad del código generado debe verificarse empíricamente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,5 GB para el archivo GGUF Q4_K_M; con contexto de 4.096 tokens y overhead de runtime, cabe cómodamente en GPUs con 4-6 GB de VRAM. En CPU, el consumo de RAM es similar (en torno a 3-4 GB).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) descargando todas las capas a GPU (`n_gpu_layers=-1`). No se requieren GPUs de datacenter.
- Consumer GPUs: sí, funciona en GPUs de gama media y también exclusivamente en CPU (`n_gpu_layers=0`), con menor velocidad de generación.
- Opciones de despliegue: Ollama (`ollama run hf.co/rachitgoyell/Manimancer-4B:Q4_K_M`), llama.cpp (`llama-cli -hf rachitgoyell/Manimancer-4B:Q4_K_M`), LM Studio y llama-cpp-python en Python.
- Latencia y throughput estimados: no disponible; al ser un modelo de 4B cuantizado a 4 bits, se espera generación fluida en GPU de consumo y velocidades moderadas en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Especializacion | Formato | Licencia |
|---|---|---|---|---|---|
| Manimancer-4B | ~4B | Qwen3-4B | Generacion de codigo Manim | GGUF (Q4_K_M) | Apache 2.0 |
| Qwen/Qwen3-4B (base) | ~4B | — | General (chat, codigo, razonamiento) | Safetensors, GGUF oficial | Apache 2.0 |
| Qwen/Qwen2.5-Coder-7B | ~7B | Qwen2.5 | Codigo general | Safetensors, GGUF | Apache 2.0 |

Frente al modelo base Qwen3-4B, Manimancer-4B ofrece mayor fiabilidad en la generación de código Manim específicamente, a costa de perder versatilidad como asistente general. Frente a modelos de código general como Qwen2.5-Coder, Manimancer-4B es más pequeño y ligero, pero su rendimiento fuera del dominio Manim no está garantizado.

## Limitaciones y advertencias

- El código generado puede fallar: pueden aparecer errores de API, métodos de Manim alucinados o incompatibilidades de versiones. Es imprescindible probar y depurar cada script.
- Sensibilidad a versiones: el modelo puede mezclar las APIs de Manim Community y ManimGL, que son incompatibles entre sí.
- La calidad visual no está garantizada: el layout, el timing y las superposiciones de objetos suelen requerir ajuste manual.
- La cuantización Q4_K_M reduce ligeramente la precisión respecto a los pesos en precisión completa.
- Ejecutar código Python generado por un LLM conlleva riesgos; revisa siempre el código y ejecútalo en un sandbox o contenedor.
- El modelo solo soporta prompts en inglés según la model card; su comportamiento con prompts en otros idiomas no está documentado.
- No es apto para uso general, razonamiento crítico ni producción sin supervisión humana, según declara el propio autor.
- No se han publicado datos de entrenamiento ni benchmarks, lo que dificulta evaluar su fiabilidad de forma sistemática antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rachitgoyell/Manimancer-4B
- Modelo base (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B
- Manim Community: https://www.manim.community/
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
