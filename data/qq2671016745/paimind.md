# qq2671016745/paimind

## Resumen

`qq2671016745/paimind` es un repositorio de Hugging Face publicado por el usuario `qq2671016745` que no contiene un modelo de lenguaje en el sentido habitual, sino el paquete de distribución de una aplicación de escritorio y móvil llamada «应急食品 · paimind» (en chino, «comida de emergencia»). La aplicación implementa un sistema de toma de decisiones local-first: un modelo pequeño cuantizado en INT4 decide entre opciones y, cuando la confianza es insuficiente o la pregunta tiene carácter temporal, recurre automáticamente a búsqueda web. El resultado se presenta siempre como «opción seleccionada + una frase de justificación + nivel de confianza + insignia de fuente».

El repositorio no aloja pesos propios: la aplicación descarga y orquesta modelos de terceros (Qwen2.5 en variantes de 0,5B, 1,5B, 3B y 7B) organizados en cuatro niveles de capacidad (L0–L3), con cinco modos de despliegue (ONNX integrado, Ollama, vLLM, llama.cpp y Docker). El tamaño del repositorio es de 0,0 GB, lo que confirma que no contiene artefactos de modelo, y no se declara pipeline, licencia ni idiomas soportados en los metadatos de Hugging Face.

La relevancia de esta ficha es limitada como modelo evaluable: se trata de un artefacto de software de aplicación, no de un checkpoint entrenado. Cualquier evaluación de capacidades debe remitirse a los modelos subyacentes que la aplicación invoca, no a este repositorio. Nótese además que existe una empresa fintech no relacionada llamada PaiMind (paimind.ai) que puede generar confusión en búsquedas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo propio; la aplicación orquesta modelos Qwen2.5 de terceros) |
| Parámetros totales | no disponible (los niveles L0–L3 corresponden a modelos de 0,5B, 1,5B, 3B y 7B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (valor usado en los comandos de ejemplo para vLLM y llama.cpp) |
| Tipos de cuantización | INT4 (nivel local por defecto); AWQ para el nivel 7B en vLLM; Q4_K_M para llama.cpp |
| Idiomas soportados | no disponible en los metadatos; la interfaz y documentación son bilingües chino/inglés |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; la aplicación descarga GGUF, AWQ y artefactos ONNX según el modo) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento porque el repositorio no contiene un modelo entrenado. Lo que describe la model card es la arquitectura del sistema de aplicación: un núcleo compartido (`core/`) con una capa de abstracción de inferencia (`core/inference/`) que unifica cinco backends (ONNX Runtime, Ollama, vLLM, llama.cpp y Docker). Sobre ese núcleo se montan tres «cáscaras»: escritorio con PySide6 (Windows, macOS, Linux), PWA responsiva y aplicación Flutter, más un servicio HTTP FastAPI que expone la API en el puerto 8686.

El sistema de niveles (L0–L3) asigna un modelo distinto a cada franja de recursos: 0,5B (~300 MB en disco, ~1,2 GB de pico de memoria), 1,5B (~1 GB, ~2,8 GB), 3B (~2 GB, ~5 GB) y 7B (~4,5 GB, ~10 GB). Cada nivel tiene tres estados (ready, warning, disabled) y se desactiva automáticamente cuando la memoria disponible es insuficiente, explicando el motivo. El enrutado local/online se decide por umbral de confianza y por detección de palabras clave con carga temporal. La distribución de modelos admite múltiples espejos con degradación, reanudación de descargas, verificación SHA256 y fuentes personalizadas, además de un flujo de subida a un repositorio HF propio para servir como origen a otros dispositivos.

## Capacidades

- Toma de decisiones entre opciones con salida estructurada: opción seleccionada, justificación de una frase, confianza y fuente.
- Enrutado condicional a búsqueda web cuando la confianza cae por debajo de un umbral o la consulta contiene indicadores de actualidad.
- Degradación silenciosa a modo local cuando no hay conectividad.
- Gestión de niveles de modelo con estados ready/warning/disabled y mensajes explicativos.
- Cambio de backend de inferencia por nivel, de forma independiente, entre ONNX, Ollama, vLLM, llama.cpp y Docker.
- Distribución de modelos con espejos múltiples, reanudación, verificación SHA256 y fuentes personalizadas.
- Subida de un nivel a un repositorio HF propio y su uso posterior como fuente de descarga.
- API HTTP compartida entre escritorio, móvil y servicio, con documentación interactiva en `/docs`.
- Aplicación de escritorio multiplataforma y PWA accesible desde el navegador del teléfono, con tema claro y oscuro persistente.
- No se declaran capacidades de visión, audio, tool calling nativo ni modo de razonamiento extendido; las capacidades lingüísticas efectivas dependen del modelo subyacente elegido.

## Casos de uso

- Decisión asistida de baja latencia en local: la aplicación responde en menos de 3 segundos en el nivel L0 con CPU exclusivamente, lo que la hace utilizable en portátiles sin GPU para elegir entre alternativas acotadas (qué comer, qué ruta tomar, qué opción de compra).
- Consultas con dependencia temporal: preguntas sobre precios, disponibilidad o eventos recientes activan la búsqueda web y devuelven la decisión con insignia de fuente, evitando respuestas obsoletas del modelo local.
- Despliegue en hardware restringido: el nivel L0 requiere solo 1,5 GB de memoria disponible y ~300 MB de disco, por lo que puede ejecutarse en equipos de gama baja o en entornos sin acelerador.
- Servicio interno de decisiones por HTTP: el servidor FastAPI en el puerto 8686 permite integrar el motor de decisión en scripts o herramientas corporativas que necesiten una respuesta corta y justificada en lugar de texto libre.
- Evaluación comparativa de backends de inferencia: al permitir cambiar entre ONNX, Ollama, vLLM y llama.cpp por nivel, sirve como banco de pruebas para medir latencia y consumo de memoria de distintos runtimes sobre el mismo modelo.
- Distribución de modelos en flotas de dispositivos: el flujo de subida a un repositorio HF propio y la selección de fuente permiten aprovisionar varias máquinas con el mismo nivel verificado por SHA256.
- Modo sin conexión: en entornos aislados o con red intermitente, la degradación silenciosa mantiene operativo el decisor local sin errores visibles para el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento publicados son operativos, no de calidad: respuesta del nivel L0 en menos de 3 segundos sobre CPU, y una medición de latencia en llama.cpp que pasa de 53,9 s a 3,5 s cuando la carga de capas en CUDA se aplica correctamente (`-ngl 99 -fa on`), frente a la caída silenciosa a CPU cuando falla la inicialización CUDA.

## Requisitos de hardware

- Nivel L0 (0,5B): ~300 MB de disco, ~1,2 GB de pico de memoria, mínimo 1,5 GB disponibles; ejecutable solo con CPU.
- Nivel L1 (1,5B): ~1 GB de disco, ~2,8 GB de pico, mínimo 3 GB disponibles.
- Nivel L2 (3B): ~2 GB de disco, ~5 GB de pico, mínimo 6 GB disponibles.
- Nivel L3 (7B): ~4,5 GB de disco, ~10 GB de pico, mínimo 12 GB disponibles.
- GPU: vLLM requiere GPU NVIDIA y Linux; el nivel 7B en AWQ necesita al menos 8 GB de VRAM. No se especifican modelos concretos de GPU (A100, H100, RTX 4090) en la información disponible.
- Consumer GPU: los niveles L0 a L2 están diseñados para CPU; el nivel L3 puede acelerarse por GPU mediante llama.cpp con offload de capas o mediante vLLM, pero no se documentan modelos concretos de tarjeta.
- Despliegue: ONNX Runtime integrado (CPU por defecto en Windows; requiere `onnxruntime-gpu` para CUDA), Ollama, vLLM, llama.cpp (`llama-server`) y Docker Compose con perfiles para Ollama y vLLM.
- Latencia: menos de 3 s para L0 en CPU; en llama.cpp con offload correcto, 3,5 s frente a 53,9 s en CPU para la misma tarea medida. No se publican cifras de throughput.
- Concurrencia: Ollama está descrito como de concurrencia débil y adecuado solo a un usuario; para carga concurrente se indica vLLM.

## Comparativa con modelos similares

No procede una comparativa de modelos, ya que este repositorio no contiene un modelo evaluable. Se ofrece en su lugar una comparativa de los modelos subyacentes que la aplicación puede orquestar, con los datos disponibles en la información proporcionada.

| Modelo subyacente | Parámetros | Nivel | Cuantización en la app | Contexto usado | Licencia |
|---|---|---|---|---|---|
| Qwen2.5 (0,5B) | 0,5B | L0 | INT4 / ONNX | no disponible | no disponible en la información |
| Qwen2.5 (1,5B) | 1,5B | L1 | INT4; `q4_k_m` GGUF en llama.cpp | 4096 | no disponible en la información |
| Qwen2.5 (3B) | 3B | L2 | INT4 | no disponible | no disponible en la información |
| Qwen2.5-7B-Instruct-AWQ | 7B | L3 | AWQ | 4096 | no disponible en la información |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni un modelo entrenado: evaluarlo como modelo de lenguaje es un error de categoría. Las capacidades reales dependen de los modelos Qwen2.5 que la aplicación descarga.
- Licencia no declarada en los metadatos de Hugging Face; no hay base para asumir uso comercial permitido del paquete de aplicación. La licencia de los modelos subyacentes debe verificarse por separado en sus repositorios de origen.
- Idiomas no declarados; la interfaz y la documentación están en chino e inglés, y el comportamiento multilingüe depende del modelo subyacente.
- Ollama presenta concurrencia débil y no está indicado para producción con carga concurrente; está pensado para un único usuario.
- vLLM no está disponible en Windows ni en macOS y exige GPU NVIDIA; el nivel 7B en AWQ requiere al menos 8 GB de VRAM.
- En llama.cpp, un fallo de inicialización de CUDA provoca una caída silenciosa a CPU (53,9 s frente a 3,5 s en la medición del autor); hay que verificar manualmente que el offload se ha aplicado.
- En Windows, el paquete `onnxruntime` instalado por defecto es solo CPU; para usar CUDA hay que sustituirlo por `onnxruntime-gpu`.
- Docker añade complejidad operativa: la aplicación solo sondea y conecta con los contenedores, no gestiona su ciclo de vida.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; el enrutado a búsqueda web mitiga parcialmente el riesgo en consultas con dependencia temporal, pero no en el resto.
- El nombre «PaiMind» colisiona con una solución fintech no relacionada (paimind.ai y sandbox.paimind.ai), lo que puede provocar confusión en búsquedas y atribuciones erróneas.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado: no hay evidencia de uso, mantenimiento ni validación por terceros.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/qq2671016745/paimind
- Documentación de niveles citada en la model card: docs/tiers.md (ruta relativa dentro del repositorio)
- Documentación general citada: docs/ (14 documentos: arquitectura, API, modelos, niveles, descarga, subida, GPU, modo online, despliegue, manual de usuario, guía de desarrollo, changelog y diagramas de flujo)
- Descarga de Ollama: https://ollama.com/download
- Script de instalación de Ollama para Linux: https://ollama.com/install.sh
- Entidad fintech homónima no relacionada: https://paimind.ai/
- Sandbox de la entidad fintech homónima: https://sandbox.paimind.ai/
