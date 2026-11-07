# Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit

## Resumen

Qwen2.5-Coder-7B-Instruct-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen2.5-Coder-7B-Instruct de Alibaba Qwen, publicada por Outlier-Ai para su ejecución nativa en Apple Silicon (M1, M2, M3 y M4). No se trata de un modelo nuevo ni de un fine-tuning: los pesos, el tokenizador y la plantilla de chat son los del modelo base; únicamente cambia el formato en disco (safetensors MLX 4-bit con grupo de tamaño 64 y cuantización simétrica) para que pueda cargarse con `mlx-lm` y ejecutarse sobre Metal.

El modelo resuelve un problema muy concreto: permitir que un modelo de código de 7.600 millones de parámetros se ejecute de forma local y completamente offline en un Mac, sin claves de API ni llamadas a la nube. Con un repositorio de 4,3 GB, encaja en equipos con 8-16 GB de memoria unificada, lo que lo sitúa en el rango de portátiles consumer. La relevancia actual viene de la combinación de tres factores: la calidad del Qwen2.5-Coder original en tareas de generación y completado de código, su licencia Apache 2.0 y la madurez del stack MLX para inferencia en Apple Silicon.

El modelo base es un transformer decoder-only de 7.615.616.512 parámetros, entrenado por el equipo Qwen para tareas de código, con soporte declarado de 15 idiomas (entre ellos español) y capacidades de tool calling y conversación multi-turno. Esta ficha describe la conversión MLX 4-bit, cuyas capacidades funcionales son las del modelo base, con las salvedades propias de la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), conversión MLX 4-bit |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 4-bit MLX, grupo de tamaño 64, simétrica |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX 4-bit), con `config.json`, tokenizador y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso de 7.615.616.512 parámetros. Esta publicación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo original; esos datos deben consultarse en la model card de Qwen/Qwen2.5-Coder-7B-Instruct. La conversión realizada por Outlier-Ai no incluye fine-tuning, merge ni datos propietarios: es un port fiel del modelo base a formato Apple Silicon.

La innovación técnica de esta publicación es exclusivamente de formato y despliegue. La cuantización es de 4 bits con grupo de tamaño 64 y simetría, lo que reduce el peso del repositorio a 4,3 GB y permite cargar el modelo con `mlx-lm` 0.31.x o superior. La inferencia se ejecuta sobre Metal en hardware Apple Silicon, con el grafo optimizado por MLX. No se documentan en la información disponible técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de código en múltiples lenguajes de programación (el modelo base está especializado en tareas de código; los ejemplos de la model card incluyen Python y SQL).
- Completado de código y autocompletado en editores, gracias a la plantilla de chat incluida (`chat_template.jinja`).
- Conversación multi-turno en modo chat e instruct.
- Tool calling y function calling, según los tags del repositorio (`function-calling`, `tool-use`).
- Refactorización y depuración de código: la model card incluye un ejemplo explícito de refactorización con detección de un bug.
- Capacidades multilingües en 15 idiomas, incluido el español.
- Ejecución local y offline, sin nube ni claves de API, sobre Apple Silicon.
- Integración con `mlx-lm` mediante API de Python (`load`, `generate`) y CLI (`python -m mlx_lm.generate`).

## Casos de uso

- Asistente de código en el editor: el modelo puede completar funciones y generar docstrings mientras se escribe, ejecutándose en local sobre el Mac del desarrollador sin enviar código a servicios externos, lo que resulta adecuado para repositorios con código propietario.
- Refactorización y revisión de código en local: a partir de un fragmento pegado en el chat, el modelo reescribe el código para mejorar legibilidad y señala posibles bugs, tal como se muestra en el ejemplo de la model card.
- Generación de consultas SQL: el modelo puede traducir requisitos en lenguaje natural a consultas SQL (por ejemplo, top 10 de usuarios por valor de compra en los últimos 90 días), útil para analistas que trabajan con datos sensibles que no deben salir de su equipo.
- Automatización con tool calling en flujos de agentes: al soportar function calling, puede integrarse en scripts locales que invoquen herramientas (ejecución de tests, consultas a APIs internas) dentro de un pipeline de desarrollo.
- Prototipado offline en entornos sin conectividad o con restricciones de red: al no requerir nube, es adecuado para entornos air-gapped, demos en ferias o trabajo en movilidad.
- Docencia y aprendizaje de programación: un modelo de código que corre en un portátil permite a estudiantes experimentar con generación de código sin coste por token ni dependencia de servicios externos.
- Empaquetado dentro de la aplicación Outlier para Mac: la model card indica que la app puede cargar cualquier conversión MLX compatible, incluida esta, mediante su selector de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs de la serie M, pero esos datos no se incluyen en el material proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 4,3 GB en disco; en ejecución, el modelo 4-bit más el contexto y el overhead de MLX requieren del orden de 5-6 GB de memoria unificada, por lo que un Mac con 8 GB es el mínimo práctico y 16 GB ofrece margen para contextos largos.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio), según los tags del repositorio. No aplica a GPU NVIDIA o AMD: el formato MLX es específico de Apple Silicon.
- ¿Cabe en GPU consumer? Sí, en el sentido de que cabe en los Mac consumer con memoria unificada de 8 GB o más; no es ejecutable en GPUs consumer de PC con el stack MLX.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI y API de Python) y la aplicación Outlier para macOS arm64, instalable vía `brew install --cask outlier-host/tap/outlier`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-MLX-4bit (esta ficha) | 7,62 B | No disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 43 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7,62 B | No disponible | Safetensors FP16/BF16 | Apache 2.0 | Hugging Face |
| Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit | 14 B (aprox.) | No disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 816 descargas |
| Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit | 32 B (aprox.) | No disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 650 descargas |

Las variantes de 14B y 32B del mismo autor ofrecen más capacidad a cambio de mayores requisitos de memoria; la de 7B es la única de las tres que encaja con comodidad en Macs de 8-16 GB. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad de generación respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento complejo o código con sintaxis poco frecuente; no se han publicado evaluaciones de la pérdida de calidad en esta conversión.
- Riesgo de alucinación inherente al modelo base: puede generar APIs, funciones o librerías inexistentes, por lo que el código producido debe revisarse y probarse antes de usarlo en producción.
- La información disponible no especifica la longitud de contexto soportada en esta conversión; conviene verificar la model card del modelo base antes de diseñar flujos con contextos largos.
- El modelo está especializado en código; su rendimiento en tareas generales de conocimiento o redacción puede ser inferior al de modelos de propósito general del mismo tamaño.
- Aunque se declaran 15 idiomas, la calidad relativa por idioma no está documentada; el español figura entre los soportados, pero sin métricas publicadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y consultarse la model card del modelo base para condiciones adicionales.
- Dependencia de plataforma: el formato MLX solo funciona en Apple Silicon con macOS arm64; no es portable a Linux, Windows ni GPUs NVIDIA sin reconvertir los pesos.
- El repositorio tiene un volumen muy bajo de descargas (43) y ningún "like", lo que limita la evidencia comunitaria sobre su estabilidad en producción.
- La model card promociona la aplicación Outlier (con un precio de 49 dólares para la versión Pro); esa promoción no afecta a la licencia del modelo, pero conviene separar el mensaje comercial de las características técnicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Conversión 14B del mismo autor: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit
- Conversión 32B del mismo autor: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit
- Otra conversión del mismo autor (DeepSeek-R1-Distill-Qwen-7B): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier-Coder-Qwen25-7B: https://huggingface.co/Outlier-Ai/Outlier-Coder-Qwen25-7B-MLX-4bit
- Aplicación Outlier para Mac: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
