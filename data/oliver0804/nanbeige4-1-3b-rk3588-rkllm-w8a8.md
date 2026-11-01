# oliver0804/Nanbeige4.1-3B-RK3588-rkllm-w8a8

## Resumen

Nanbeige4.1-3B-RK3588-rkllm-w8a8 es una conversión del modelo de lenguaje Nanbeige/Nanbeige4.1-3B al formato RKLLM con cuantización w8a8 (8 bits en pesos y activaciones), optimizado para su ejecución en la NPU de los SoC Rockchip RK3588 y RK3588S. El autor de la conversión es el usuario de HuggingFace oliver0804, mientras que el modelo base original fue desarrollado por el equipo de Nanbeige. El objetivo es claro: permitir que un modelo de 3.000 millones de parámetros funcione íntegramente en hardware de borde (edge AI) con aceleración NPU, sin necesidad de GPU dedicada.

La relevancia de esta ficha radica en su nicho: no es un modelo nuevo, sino un artefacto de despliegue para placas como la Radxa ROCK 5C o la Orange Pi 5. Con un consumo de memoria de aproximadamente 3,8 GB durante la inferencia y una velocidad de generación de 7,5 tokens por segundo en la placa de referencia, representa una opción viable para asistentes locales, procesamiento de texto sin conexión y aplicaciones embebidas donde la privacidad y la latencia importan más que el rendimiento bruto.

La conversión no introduce cambios arquitectónicos respecto al modelo base. Se realizó con `rkllm-toolkit` 1.3.1 y requiere el runtime `librkllmrt.so` en la misma versión. El repositorio ocupa 4,4 GB, lo que refleja el peso de los pesos cuantizados junto con los artefactos de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Nanbeige4.1-3B; sin cambios arquitectónicos en la conversión) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso sugiere 2048 tokens de contexto y 4096 de generación máxima, pero no se confirma el máximo oficial) |
| Tipos de cuantizacion | w8a8 (8 bits en pesos y activaciones), formato RKLLM |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (`.rkllm`), generado con rkllm-toolkit 1.3.1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Nanbeige4.1-3B, un transformer decoder-only de 3.000 millones de parámetros. La conversión a RKLLM no modifica la arquitectura: únicamente transforma los pesos al formato propietario de Rockchip y aplica cuantización w8a8 para que la NPU del RK3588 pueda ejecutar las operaciones de inferencia de forma eficiente. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO, ya que la model card de esta conversión no los incluye.

La innovación técnica de este artefacto no está en el entrenamiento, sino en el despliegue: la cuantización w8a8 permite reducir la huella de memoria hasta unos 3,8 GB en ejecución y aprovechar la NPU integrada del RK3588, que ofrece hasta 6 TOPS en INT8. El proceso de conversión se realizó con `rkllm-toolkit` 1.3.1 y exige el runtime `librkllmrt.so` 1.3.1, por lo que la compatibilidad de versiones es estricta.

## Capacidades

- Generación de texto en chino e inglés, incluyendo respuestas a preguntas factuales y resolución de problemas verbales.
- Razonamiento básico: el benchmark del autor incluye silogismos y comparaciones numéricas, con resultados parciales.
- Generación de código: una de las siete preguntas del benchmark evalúa generación de código, aunque no se detalla la puntuación por categoría.
- Conteo de letras y tareas de manipulación de cadenas, evaluadas en el benchmark.
- Formato restringido: el modelo intenta seguir instrucciones de formato, aunque el autor reporta que no las cumple de forma fiable.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas a chino e inglés según los tags del repositorio.

## Casos de uso

- Asistentes locales sin conexión: el modelo puede ejecutarse íntegramente en una placa RK3588 con 8 GB de RAM, lo que permite desplegar un chatbot de texto en dispositivos sin acceso a internet y con requisitos de privacidad estrictos.
- Procesamiento de texto en dispositivos embebidos: integración en kioscos, paneles industriales o dispositivos IoT que necesiten resumir, clasificar o reformatear texto en el propio dispositivo, con un consumo de memoria de ~3,8 GB.
- Automatización de atención al cliente en chino e inglés: gracias a su soporte bilingüe y a la ventana de contexto de 2048 tokens sugerida en el ejemplo de uso, puede gestionar conversaciones multi-turno de complejidad moderada en entornos de borde.
- Generación de código asistida en entornos sin GPU: el modelo puede producir fragmentos de código en una placa de bajo consumo, útil para entornos de desarrollo en campo o laboratorios con hardware limitado.
- Educación y tutoría offline: resolución de problemas verbales y silogismos, tal como se evalúa en el benchmark del autor, lo que lo hace adecuado para aplicaciones educativas en dispositivos de bajo coste.
- Prototipado rápido en edge AI: investigadores que necesiten validar pipelines de inferencia en NPU Rockchip pueden usar este artefacto como punto de partida sin tener que convertir el modelo base desde cero.
- Filtrado y enriquecimiento de datos en el borde: tareas de extracción de entidades, reformateo o clasificación de texto que se beneficien de ejecutarse localmente antes de enviar datos a la nube.

## Benchmarks y rendimiento

El autor publica un benchmark propio sobre una Radxa ROCK 5C (RK3588S, 8 GB), con decodificación greedy, thinking desactivado, `max_new_tokens` de 768 y un conjunto fijo de 7 preguntas en chino taiwanés (problema verbal, hechos, comparación numérica, conteo de letras, silogismo, generación de código y formato restringido). El autor advierte que la medición se realizó antes de fijar la frecuencia de reloj, por lo que la velocidad en tok/s es aproximadamente un 20 % pesimista respecto a las cifras con reloj bloqueado.

| Metrica | Resultado |
|---|---|
| Puntuación | 4,5 / 7 |
| Velocidad de generación | 7,5 tok/s |
| Memoria en ejecución | ~3,8 GB |
| Hardware | Radxa ROCK 5C (RK3588S, 8 GB) |
| Decodificación | Greedy, thinking desactivado, max_new_tokens 768 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros modelos en la misma placa.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~3,8 GB según la medición del autor en RK3588S con 8 GB de RAM.
- GPU recomendadas: no aplica; el modelo está diseñado para la NPU del RK3588/RK3588S. No se ha validado su ejecución en GPU convencionales.
- ¿Cabe en GPU de consumo? No es el objetivo del artefacto; el formato RKLLM es específico de Rockchip y no se carga en CUDA.
- Placas compatibles: RK3588 y RK3588S, como Radxa ROCK 5C, Orange Pi 5, Banana Pi M7 u otras con el mismo SoC y al menos 8 GB de RAM.
- Opciones de despliegue: runtime RKLLM 1.3.1 (`librkllmrt.so`), con el ejemplo `llm_demo` del repositorio airockchip/rknn-llm. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,5 tok/s en la placa de referencia con reloj no fijado (el autor estima que con reloj bloqueado sería aproximadamente un 20 % superior).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue en RK3588 |
|---|---|---|---|---|---|
| Nanbeige4.1-3B-RK3588-rkllm-w8a8 | 3B | No disponible | RKLLM w8a8 | Apache-2.0 | Sí, nativo en NPU |
| Nanbeige/Nanbeige4.1-3B (base) | 3B | No disponible | Safetensors | Apache-2.0 | No directamente; requiere conversión |
| Alternativas de 3B en edge | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otros modelos de 3B en la misma plataforma, por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El autor reporta que el modelo responde con frecuencia en chino simplificado incluso en contextos donde se espera chino tradicional, lo que indica un control limitado del registro lingüístico.
- No sigue de forma fiable las restricciones de formato, como "tres puntos, máximo 15 caracteres cada uno", lo que lo hace poco adecuado para tareas que dependan de una salida estrictamente estructurada.
- La puntuación en el benchmark propio es de 4,5 sobre 7, lo que refleja un rendimiento moderado en razonamiento y generación de código.
- Riesgo de alucinación inherente a los modelos de 3B, especialmente en preguntas factuales y tareas de razonamiento complejo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar los términos del modelo original por si hubiera condiciones adicionales.
- Compatibilidad de versiones estricta: requiere `rkllm-toolkit` 1.3.1 y `librkllmrt.so` 1.3.1; otras versiones pueden no cargar el modelo.
- El formato RKLLM es propietario de Rockchip y no es portable a otras plataformas de hardware.
- El repositorio tiene muy pocas descargas (6) y ningún "like", por lo que no hay validación comunitaria significativa.
- La fecha de creación del repositorio (2026-10-29) es posterior a la fecha actual en muchos entornos, lo que puede indicar un artefacto de metadata o un repositorio de reciente publicación; conviene verificar la integridad de los archivos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oliver0804/Nanbeige4.1-3B-RK3588-rkllm-w8a8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Runtime y ejemplos RKLLM: https://github.com/airockchip/rknn-llm
