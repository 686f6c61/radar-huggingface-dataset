# alphakek/Qwen3.8-27B-heretic-ara-DFlash2

## Resumen

`alphakek/Qwen3.8-27B-heretic-ara-DFlash2` es un modelo *drafter* (modelo de borrador) diseñado para acelerar la inferencia del modelo `heretic-org/Qwen3.8-27B-heretic-ara` mediante decodificación especulativa con el método DFlash2 (block-diffusion). Lo desarrolla el usuario alphakek y se distribuye bajo licencia Apache-2.0. Su función no es generar texto de forma autónoma, sino proponer secuencias de tokens candidatas que el modelo objetivo valida en paralelo, reduciendo la latencia y aumentando el *throughput* en entornos de producción.

El modelo tiene 1.924.404.480 parámetros (~1,9B), un tamaño reducido en comparación con el modelo base de 27B, lo que permite ejecutarlo en paralelo con el objetivo sin un coste de VRAM significativo. Se ha afinado con la técnica SpecForge, partiendo del drafter genérico `z-lab/Qwen3.8-27B-DFlash2` y entrenándolo con un corpus sintético multi-turno que replica tráfico real de producción (razonamiento bajo, temperatura 1.0, *top_p* 0.95, *top_k* 20 y episodios de *tool calling*). El checkpoint seleccionado (paso 400 de 800) muestra una mejora del +5,4% en tokens por segundo y +5,8% en longitud de aceptación frente al drafter stock en una prueba A/B controlada con vLLM.

Su relevancia actual radica en que la decodificación especulativa se ha convertido en una técnica estándar para desplegar modelos grandes de razonamiento con costes de inferencia asumibles. Este drafter está optimizado específicamente para `heretic-ara`, lo que lo hace más eficiente que un drafter genérico, pero limita su uso a ese modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter basado en Qwen3.8, sin detalle publico) |
| Parametros totales | 1.924.404.480 (~1,9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *drafter* para decodificación especulativa con el método DFlash2, que utiliza *block-diffusion* para generar bloques de tokens candidatos de forma paralela. A diferencia de los drafters autoregresivos clásicos, DFlash2 predice múltiples tokens simultáneamente, lo que reduce el número de pasos de inferencia y mejora la latencia. La arquitectura concreta (número de capas, dimensiones, tipo de atención) no se ha publicado en la información disponible.

El entrenamiento se realizó con la técnica SpecForge, un método que ajusta el drafter leyendo los *hidden states* del modelo objetivo para maximizar la tasa de aceptación. Se partió del checkpoint `z-lab/Qwen3.8-27B-DFlash2` (drafter genérico para Qwen3.8-27B) y se continuó el entrenamiento durante 800 pasos, seleccionando el paso 400 por su mejor rendimiento en un benchmark real con vLLM. Los datos de entrenamiento consisten en un corpus sintético multi-turno que replica tráfico de producción, incluyendo episodios de *tool calling* y configuraciones de muestreo específicas (`reasoning_effort=low`, `temp 1.0`, `top_p 0.95`, `top_k 20`). No se han publicado detalles sobre el volumen total de tokens ni la composición exacta del dataset.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa DFlash2, alcanzando 123,2 tok/s frente a 38,1 tok/s sin especulación en el entorno de prueba.
- Específico para el modelo `heretic-org/Qwen3.8-27B-heretic-ara`: lee los *hidden states* del objetivo para optimizar la aceptación de tokens.
- Soporte de episodios de *tool calling* en los datos de entrenamiento, lo que lo hace adecuado para escenarios con funciones externas.
- Integración con vLLM (requiere el fork con soporte DFlash2, PR #52816) y con SGLang (según las etiquetas del repositorio).
- No es un modelo de generación autónoma: debe usarse junto con el modelo objetivo en un esquema de decodificación especulativa.

## Casos de uso

- Despliegue de `heretic-ara` en producción con alta concurrencia: el drafter permite servir el modelo de 27B con un *throughput* hasta 3,2 veces superior al de la inferencia sin especulación, reduciendo el coste por petición en entornos con múltiples usuarios.
- Reducción de latencia en asistentes conversacionales con razonamiento: al acelerar la generación de tokens, mejora la experiencia de usuario en *chatbots* que requieren respuestas largas y estructuradas.
- Integración en pipelines de *tool calling*: el entrenamiento incluye episodios de llamadas a funciones, por lo que es adecuado para agentes que necesitan invocar APIs o ejecutar acciones externas de forma eficiente.
- Optimización de costes en infraestructura GPU: al aumentar el *throughput* por GPU, se pueden servir más peticiones con el mismo hardware, reduciendo la necesidad de escalar horizontalmente.
- Benchmarking y evaluación de modelos de razonamiento: el drafter permite ejecutar pruebas de estrés y evaluaciones de `heretic-ara` con mayor rapidez, acelerando los ciclos de desarrollo.
- Entornos de inferencia con restricciones de latencia estrictas: por ejemplo, servicios de tiempo real donde cada milisegundo cuenta, como asistentes de voz o sistemas de recomendación interactivos.

## Benchmarks y rendimiento

La model card proporciona resultados de una prueba A/B controlada en un entorno con 4×3090 (TP4), vLLM con fork DFlash2, n6, razonamiento bajo, *greedy*, 3 tipos de prompt × 2 repeticiones. Los datos son los siguientes:

| Checkpoint | Tok/s | Accept len | Δ tok/s | Δ accept |
|---|---:|---:|---:|---:|
| **Este drafter (paso 400)** | **123,2** | **4,24** | **+5,4%** | **+5,8%** |
| Stock `z-lab/Qwen3.8-27B-DFlash2` | 116,9 | 4,01 | — | — |
| Baseline sin especulación | 38,1 | — | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un generador autónomo, sino un componente de aceleración. Los datos de rendimiento se centran en métricas de decodificación especulativa: tokens por segundo y longitud de aceptación media.

## Requisitos de hardware

- El drafter tiene ~1,9B parámetros, por lo que ocupa aproximadamente 3,8 GB en FP16 (tamaño del repositorio). Esto cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) y en GPUs de datacenter.
- En el ejemplo de la model card se usa una configuración con 4×3090 (TP4) para el modelo objetivo de 27B, con el drafter ejecutándose en paralelo. La VRAM adicional requerida por el drafter es de unos 4 GB, asumible en cualquier setup que ya sirva un modelo de 27B.
- Para el modelo objetivo `heretic-ara` (27B), se recomienda al menos 24 GB de VRAM en FP16 (una RTX 3090/4090 o A10G), o 48 GB para mayor margen. Con cuantización (por ejemplo, AWQ o GPTQ) podría caber en 16 GB, aunque no se han publicado cuantizaciones específicas para el drafter.
- Opciones de despliegue: vLLM con el fork que incluye DFlash2 (PR #52816), SGLang (según etiquetas), y potencialmente llama.cpp si se convierte a GGUF (no publicado).
- Latencia y *throughput*: en el benchmark de la model card, el drafter alcanza 123,2 tok/s con el modelo objetivo en TP4, frente a 38,1 tok/s sin especulación. La longitud de aceptación media es de 4,24 tokens, lo que indica que el drafter propone secuencias de 6 tokens (configuración `num_speculative_tokens: 6`) y el modelo objetivo acepta una media de 4,24.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **alphakek/Qwen3.8-27B-heretic-ara-DFlash2** | ~1,9B | no disponible | 123,2 (con heretic-ara, TP4) | Apache-2.0 | HuggingFace |
| z-lab/Qwen3.8-27B-DFlash2 | ~1,9B | no disponible | 116,9 (con heretic-ara, TP4) | Apache-2.0 | HuggingFace |
| Sin drafter (baseline) | — | — | 38,1 | — | — |

La comparativa se limita al drafter stock de z-lab, que es el punto de partida del entrenamiento. No se dispone de información sobre otros drafters para Qwen3.8-27B (por ejemplo, versiones basadas en Eagle o Medusa) en la información proporcionada.

## Limitaciones y advertencias

- Especificidad del modelo: este drafter solo funciona con `heretic-org/Qwen3.8-27B-heretic-ara`. Usarlo con el modelo base `Qwen/Qwen3.8-27B` o cualquier otro modelo producirá resultados incorrectos o degradación del rendimiento.
- Dependencia de software: requiere una versión de vLLM con soporte DFlash2 (PR #52816), que no está incluida en los lanzamientos estables estándar. Esto puede complicar el despliegue en entornos con políticas de actualización restrictivas.
- Datos de entrenamiento sintéticos: el corpus se generó artificialmente para replicar tráfico de producción, pero no se ha validado su cobertura en dominios específicos. El rendimiento puede degradarse en distribuciones de entrada muy diferentes a las del entrenamiento.
- Sin información sobre sesgos o alucinaciones: al ser un drafter, no genera contenido propio, pero hereda los sesgos del modelo objetivo. No se han publicado evaluaciones de sesgo para este componente.
- Riesgo de sobreajuste al checkpoint seleccionado: el paso 400 se eligió por su rendimiento en un benchmark concreto; otros pasos podrían comportarse de forma diferente en otros entornos o cargas de trabajo.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ del drafter, lo que limita su uso en entornos con restricciones de VRAM o en frameworks que no soporten safetensors directamente.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/alphakek/Qwen3.8-27B-heretic-ara-DFlash2)
- [Modelo objetivo: heretic-org/Qwen3.8-27B-heretic-ara](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara)
- [Drafter stock: z-lab/Qwen3.8-27B-DFlash2](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- [Blog de DFlash2](https://inco.ai/blog/dflash2/)
- [PR de vLLM con soporte DFlash2 (#52816)](https://github.com/vllm-project/vllm/pull/52816)
