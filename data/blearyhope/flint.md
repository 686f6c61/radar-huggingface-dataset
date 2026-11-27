# blearyhope/flint

## Resumen

Flint es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Recursive, disenado especificamente para agentes de codigo: investigacion de bases de codigo, correccion de errores, implementacion de funcionalidades y escritura de tests. Cuenta con 39.800 millones de parametros totales y aproximadamente 2.500 millones activos por token, lo que lo situa en la categoria de modelos "40B-A2.5B" con un coste de inferencia propio de un modelo mucho mas pequeno.

La arquitectura es un transformer decoder-only con 49 capas (2 densas seguidas de 47 MoE), atencion hibrida entre ventana deslizante de 513 tokens y atencion completa, 256 expertos enrutados por capa (6 seleccionados por token) mas un experto compartido siempre activo, y una ventana de contexto documentada de 262.144 tokens. El modelo se entreno desde cero mediante pretraining, mid-training, supervised fine-tuning y reinforcement learning, con un corte de conocimiento declarado en junio de 2026.

Su relevancia actual radica en el enfoque agentico: soporta razonamiento multi-turno y tool calling compatible con OpenAI, y declara resultados notables en benchmarks de ingenieria de software (89,7% en SWE-bench Pro v2 y 74,2% en SWE-bench Verified). Se distribuye bajo licencia Apache 2.0 con checkpoint BF16 y un kit de servicio para SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts |
| Parametros totales | 39.800 millones (39.785.287.456 segun safetensors) |
| Parametros activos | Aproximadamente 2.500 millones por token (cuerpo activo ~2.200 millones, incluyendo la cabeza de salida) |
| Longitud de contexto | 262.144 tokens (prompt y salida comparten ventana) |
| Tipos de cuantizacion | BF16 en este repositorio; variantes cuantizadas preparadas por separado para NVIDIA (NVFP4) y Apple Silicon |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); repositorio de ~79,6 GB |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con 49 capas: 2 capas densas iniciales seguidas de 47 capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los cuales se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion combina 35 capas de ventana deslizante (513 tokens: el token actual y los 512 precedentes) con 14 capas de atencion completa. Emplea 32 cabezas de consulta y 4 cabezas clave/valor con dimension de cabeza 128, normalizacion QK RMSNorm por cabeza y attention sinks aprendidos por cabeza. La codificacion posicional usa RoPE en las capas de ventana deslizante y ninguna codificacion posicional en las capas de atencion completa. El vocabulario es de 150.144 tokens.

El entrenamiento se realizo desde cero en cuatro fases: pretraining, mid-training, supervised fine-tuning y reinforcement learning. Los datos incluyen texto y codigo, seguimiento de instrucciones y tareas agenticas; el SFT incorporo ejemplos orientados a seguridad. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset. El checkpoint publicado es BF16 e incluye configuracion, tokenizer, chat template y un kit de servicio SGLang; el codigo de modelado para Transformers no esta incluido todavia.

## Capacidades

- Generacion de texto y razonamiento, con soporte de modo de razonamiento (el servidor devuelve `reasoning_content` que debe preservarse en el historial de conversacion).
- Generacion y edicion de codigo: investigacion de bases de codigo, correccion de bugs, implementacion de funcionalidades y escritura de tests.
- Tool calling / function calling compatible con la API de OpenAI, incluyendo uso multi-turno de herramientas.
- Razonamiento agentico multi-paso (multi-step reasoning) orientado a tareas de ingenieria de software.
- Contexto largo de hasta 262.144 tokens, adecuado para repositorios y sesiones agenticas extensas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Entrada y salida exclusivamente de texto (sin vision ni audio).

## Casos de uso

- Agentes de correccion de bugs en produccion: el modelo puede recibir un issue, explorar el repositorio mediante tool calling y proponer un parche; su contexto de 262.144 tokens permite cargar archivos y trazas relevantes en una sola sesion.
- Implementacion de funcionalidades asistida: integrado en un pipeline de CI/CD, puede generar codigo y tests a partir de una especificacion, con el bucle agentico ejecutando la suite de pruebas para validar el cambio.
- Revision de codigo automatizada: analisis de pull requests con contexto largo para detectar regresiones, inconsistencias de estilo o dependencias no deseadas, devolviendo comentarios estructurados.
- Migracion y refactorizacion de bases de codigo: la ventana de 262.144 tokens permite procesar modulos completos y aplicar transformaciones coherentes en multiples archivos.
- Generacion de tests unitarios y de integracion: el modelo escribe tests a partir del codigo existente y del comportamiento esperado, aprovechando su entrenamiento especifico en tareas de testing.
- Asistente de desarrollo en IDE o CLI: con tool calling compatible con OpenAI, se integra en entornos locales o remotos para consultas sobre el codigo, explicaciones y sugerencias de parches.
- Automatizacion de tareas de terminal: su rendimiento en Terminal-Bench 2.1 (54,9%) lo hace apto para agentes que operan en entornos de linea de comandos bajo supervision.

## Benchmarks y rendimiento

| Benchmark | Flint | Notas |
|---|---|---|
| Terminal-Bench 2.1 | 54,9% | Agente Terminus 2; las soluciones obtenidas por recuperacion web se cuentan como fallidas |
| SWE-bench Pro v2 | 89,7% | Agente mini-swe-agent; media pass@1 sobre al menos cinco intentos |
| SWE-bench Verified | 74,2% | Agente mini-swe-agent; media pass@1 sobre al menos cinco intentos |

Configuracion de evaluacion: temperatura 1,0, top-p 0,95, top-k 20. La model card indica que las puntuaciones marcadas con daga fueron medidas por Recursive y que las de comparacion son reportadas por los desarrolladores; los setups de evaluacion varian entre fuentes. No se proporcionan resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa aproximadamente 79,6 GB, por lo que requiere al menos 80 GB de memoria de GPU para una replica en BF16.
- GPU recomendadas: una B300 o una H200 por replica, segun el kit SGLang incluido (`serve_b300.sh` y `serve_h200.sh`).
- Cabe en GPU de consumo: no en BF16; las variantes cuantizadas para NVIDIA (NVFP4) y Apple Silicon estan preparadas por separado y podrian reducir el requisito, aunque no se detallan sus tamanos en la informacion disponible.
- Opciones de despliegue: SGLang mediante el kit incluido (Docker, endpoint compatible con OpenAI en el puerto 30000). El codigo de modelado para Transformers no esta incluido todavia; no se mencionan soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que el razonamiento largo puede aumentar la latencia y agotar el presupuesto de salida; se recomienda un presupuesto de al menos 32.768 tokens para problemas dificiles.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni licencia de los modelos de comparacion en la informacion proporcionada; la model card solo referencia comparaciones graficas con modelos locales que corren en hardware similar, sin cifras textuales. Por tanto, la comparativa cuantitativa se considera no disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint | 39,8B | ~2,5B | 262.144 | Apache 2.0 | Hugging Face (BF16) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Puede producir contenido incorrecto o danado, codigo defectuoso o llamadas a herramientas inapropiadas; la gramatica estructurada de tool calling no impide que el modelo elija una accion insegura.
- El razonamiento largo puede incrementar la latencia y agotar el presupuesto de salida antes de completar la respuesta.
- La configuracion de contexto es un limite de capacidad, no una garantia de precision uniforme en todas las longitudes de secuencia o tareas.
- Los resultados pueden variar segun la precision del checkpoint y el runtime de inferencia; se recomienda evaluar el checkpoint y runtime concretos antes de desplegar.
- No hay informacion sobre sesgos conocidos ni sobre idiomas soportados; el uso en produccion multilingue requiere validacion propia.
- En aplicaciones con herramientas deben aplicarse permisos y limites de ejecucion propios; el modelo no los impone.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero los terminos de la API alojada y las practicas de datos son independientes de la licencia de los pesos.
- El codigo de modelado para Transformers no esta incluido todavia, lo que limita la integracion fuera de SGLang.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/flint
- Organizacion en Hugging Face: https://huggingface.co/RecursiveSI
- Blog de presentacion: https://www.recursive.com/updates/introducing-recursive-flint
- Motor local (GitHub): https://github.com/recursive-oss/rec
- Documentacion: https://docs.recursive.com/getting-started
- Contacto de soporte: support@recursive.co
