# oliver0804/MiniCPM5-2B-RK3588-rkllm-w8a8

## Resumen

MiniCPM5-2B-RK3588-rkllm-w8a8 es una conversión del modelo de lenguaje openbmb/MiniCPM5-2B al formato propietario RKLLM en cuantización w8a8, orientada específicamente a la NPU del SoC Rockchip RK3588 y RK3588S. Lo publica el usuario oliver0804 en HuggingFace y no introduce cambios arquitectónicos sobre el modelo base: se trata de un artefacto de despliegue empaquetado (pesos más tokenizer en un único fichero `.rkllm`) para ejecutar inferencia en placas de un solo board con aceleración NPU.

El interés práctico está en que permite correr un transformer de 2B parámetros en hardware de borde de bajo consumo (por ejemplo, una Radxa ROCK 5C con 8 GB de LPDDR4x) sin GPU dedicada, con un consumo de memoria de aproximadamente 2,5 GB y un rendimiento medido de 10,9 tokens/s en generación y 189 tokens/s en prefill. Es, por tanto, una pieza de infraestructura para proyectos de IA en el borde más que un modelo nuevo.

La relevancia es acotada pero clara: quien tenga un RK3588 y quiera un LLM local con capacidades básicas de razonamiento, código y formato estructurado dispone aquí de una conversión ya validada con una versión concreta del runtime (RKLLM 1.3.1), con licencia Apache-2.0 heredada del modelo base y soporte declarado de chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de openbmb/MiniCPM5-2B; sin cambios arquitectónicos en la conversión) |
| Parametros totales | 2B (según el nombre del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso invoca el runtime con argumentos 2048 y 4096 |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) en formato RKLLM |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rkllm` (fichero autocontenido con pesos y tokenizer); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de identificarlo como openbmb/MiniCPM5-2B; la conversión, según el autor, no modifica la arquitectura. El artefacto publicado es el resultado de pasar el modelo base por `rkllm-toolkit` 1.3.1 para producir un fichero RKLLM con cuantización w8a8, pensado para la NPU del RK3588/RK3588S. No se aportan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica relevante no está en el modelo sino en el pipeline de despliegue: el fichero es autocontenido (incluye tokenizer) y requiere obligatoriamente el runtime `librkllmrt.so` 1.3.1, ya que versiones anteriores fallan al cargarlo. El benchmark del autor se ejecutó con relojes fijados mediante el script oficial `fix_freq_rk3588.sh` (CPU a 1,8/2,3 GHz, DDR a 2112 MHz, NPU a 1 GHz), decodificación greedy, modo thinking desactivado y `max_new_tokens` de 768.

## Capacidades

- Generación de texto en chino e inglés.
- Razonamiento básico: resolución de problemas verbales, comparación numérica, silogismos y conteo de letras (evaluados en el benchmark del autor).
- Generación de código, validada en una de las preguntas del benchmark.
- Formato estructurado y restringido (constrained formatting), también evaluado en el benchmark.
- Modo thinking disponible en el modelo base, aunque el benchmark se ejecutó con thinking desactivado.
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente local en dispositivos de borde: ejecutar el modelo en una placa RK3588 con 8 GB de RAM para responder consultas en chino o inglés sin conexión a la nube, aprovechando el consumo de ~2,5 GB y la NPU integrada.
- Clasificación y extracción de información en pasarelas IoT: usar el modelo para etiquetar o resumir texto recogido por sensores y dispositivos antes de enviarlo a un servidor central, reduciendo ancho de banda.
- Generación de código asistida en entornos sin GPU: integrar el runtime RKLLM en un IDE o script de terminal sobre una placa Rockchip para autocompletar fragmentos en C/C++ o Python, dado que el modelo supera la prueba de generación de código del benchmark.
- Formateo y validación de salidas estructuradas: emplear la capacidad de constrained formatting para producir JSON o campos fijos en pipelines de ingesta de datos en el borde.
- Educación y demostraciones de IA local: desplegar el modelo en kits de desarrollo RK3588 para talleres o demos donde no se dispone de hardware NVIDIA.
- Prototipado de chatbots multi-turno de baja latencia: con 189 tok/s de prefill y 10,9 tok/s de generación, es viable para conversaciones cortas en inglés o chino en entornos embebidos.
- Pruebas de razonamiento en hardware restringido: usar el conjunto fijo de 7 preguntas del autor como referencia para comparar conversiones de otros modelos en la misma placa.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre Radxa ROCK 5C (RK3588S, 8 GB LPDDR4x), relojes fijados, greedy, thinking desactivado, `max_new_tokens` 768, benchmark fijo de 7 preguntas en zh-TW:

| Métrica | MiniCPM5-2B w8a8 | Gemma-4-E2B-it | Qwen2.5-1.5B |
|---|---|---|---|
| Puntuación | 6 / 7 | 6 / 7 | 4,5 / 7 |
| Generación | 10,9 tok/s | 9,3 tok/s | 15,8 tok/s |
| Prefill | 189 tok/s | no disponible | no disponible |
| Memoria | ~2,5 GB | 2,6 GB | 1,8 GB |

El único fallo del modelo es la comparación «9.11 vs 9.9». El autor señala que las respuestas mezclan ocasionalmente caracteres de chino simplificado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~2,5 GB en el formato w8a8 publicado.
- Hardware objetivo: NPU del Rockchip RK3588 y RK3588S; el autor lo valida en una Radxa ROCK 5C con 8 GB de LPDDR4x.
- No es ejecutable en GPU NVIDIA, AMD ni en CPU convencional mediante este artefacto: requiere el runtime RKLLM 1.3.1 (`librkllmrt.so`), y versiones anteriores fallan al cargar el fichero.
- Despliegue: runtime de [airockchip/rknn-llm](https://github.com/airockchip/rknn-llm), por ejemplo el demo en C++ `./llm_demo MiniCPM5-2B_RK3588_w8a8.rkllm 2048 4096`.
- Rendimiento medido: 10,9 tok/s de generación y 189 tok/s de prefill con relojes fijados (CPU 1,8/2,3 GHz, DDR 2112 MHz, NPU 1 GHz).
- No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el benchmark del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-RK3588-rkllm-w8a8 | 2B | no disponible | 6/7, 10,9 tok/s, ~2,5 GB | Apache-2.0 | HuggingFace (6 descargas) |
| Gemma-4-E2B-it (formato RK3588, según el autor) | no disponible | no disponible | 6/7, 9,3 tok/s, 2,6 GB | no disponible en la información | no disponible |
| Qwen2.5-1.5B (formato RK3588, según el autor) | 1,5B | no disponible | 4,5/7, 15,8 tok/s, 1,8 GB | no disponible en la información | no disponible |

La comparación se limita a los datos que el autor incluye en su model card; no hay información sobre contextos, licencias ni disponibilidad de las conversiones de los modelos alternativos.

## Limitaciones y advertencias

- Dependencia estricta del runtime RKLLM 1.3.1: versiones anteriores de `librkllmrt.so` no cargan el fichero.
- Solo funciona en NPU Rockchip RK3588/RK3588S; no es portable a otras plataformas sin reconversión.
- Idiomas limitados a chino e inglés; el autor reporta mezcla ocasional de caracteres simplificados en respuestas en chino tradicional.
- Fallo conocido en comparaciones numéricas con decimales («9.11 vs 9.9»), un error clásico de razonamiento numérico en modelos pequeños.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; no se documentan evaluaciones de factualidad.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar el fichero `LICENSE` del repositorio.
- Repositorio con muy poca tracción (6 descargas, 0 likes) y sin mantenimiento documentado; la fecha de creación indicada es 2026-10-29.
- El benchmark del autor es un conjunto fijo de 7 preguntas, no una evaluación estandarizada; los resultados deben tomarse como orientativos.

## Enlaces

- [HuggingFace: oliver0804/MiniCPM5-2B-RK3588-rkllm-w8a8](https://huggingface.co/oliver0804/MiniCPM5-2B-RK3588-rkllm-w8a8)
- [Modelo base: openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B)
- [Runtime RKLLM: airockchip/rknn-llm](https://github.com/airockchip/rknn-llm)
