# softandsweet/redhatai-qwen3-5-9b-fp8-dynamic-rngd-fxbex

## Resumen

RedHatAI Qwen3.5-9B-FP8-dynamic (empaquetado por el usuario `softandsweet` bajo el identificador `redhatai-qwen3-5-9b-fp8-dynamic-rngd-fxbex`) es un paquete de pesos autónomo en formato FXBEX que contiene los pesos del modelo Qwen3.5 9B en cuantización FP8 dinámica, junto con el tokenizador, la configuración y un adaptador/runtime Python embebido. El paquete está orientado específicamente a la ejecución en aceleradores NPU Furiosa RNGD mediante el SDK 2026.4.0.

El modelo base es Qwen3.5 9B, un transformer de 9.000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), distribuido originalmente por Red Hat AI en una variante FP8 dinámica. Este empaquetado no entrena ni modifica los pesos más allá de la cuantización heredada del checkpoint fuente; su aportación es la conversión a un formato desplegable en hardware NPU con verificación de inferencia documentada.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de 9B en FP8 sobre NPUs Furiosa RNGD en modo offline, con verificación de coincidencia numérica frente a la referencia (similitud coseno 0,999929, RMSE 0,044703). Está pensado para entornos con hardware Furiosa y no para despliegues convencionales en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), pesos en FP8 dinámica; runtime de ejecución BF16 con fusion8 en NPU |
| Parametros totales | 9.000 millones (heredados del checkpoint fuente Qwen3.5-9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (contexto configurado en el runtime del paquete) |
| Tipos de cuantizacion | FP8 dinámica (pesos); ejecución BF16 en NPU |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); adaptador embebido sin licencia declarada |
| Formato de pesos | FXBEX (paquete autónomo con pesos, tokenizador, configuración y adaptador Python) |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.5 de 9.000 millones de parámetros. El paquete distribuido aquí parte del checkpoint `RedHatAI/Qwen3.5-9B-FP8-dynamic` en la revisión `790f0576d2d77dd5322aa0603a470bd9e3a3d1f6`, que aplica cuantización FP8 dinámica sobre los pesos originales. Sobre ese checkpoint, el autor del paquete realiza una conversión al formato FXBEX para su ejecución en NPU Furiosa RNGD.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, más allá de lo que pueda documentar la model card original de Qwen3.5-9B (no incluida en la información proporcionada). La innovación técnica documentada de este paquete es la verificación de inferencia en NPU: carga del SHA exacto en proceso limpio, modo offline, cachés de Hugging Face vacías y auditoría de sistema de archivos que confirma cero lecturas desde la caché preexistente. Los resultados de aceptación reportan similitud coseno de 0,999929, RMSE de 0,044703 y coincidencia top-1, con 1.562 tareas ejecutadas en NPU, cero tareas enrutadas a CPU y cero grafos desconocidos. El tiempo de carga fue de 255 segundos.

## Capacidades

- Generación de texto en modo chat: las pruebas de humo documentadas devuelven 4 para "What is 2+2?" y 12 para la continuación "multiply by 3", con respuestas repetibles ante el mismo prompt.
- Razonamiento aritmético básico y seguimiento de contexto conversacional corto (verificado con prompts encadenados).
- Ejecución en NPU Furiosa RNGD con SDK 2026.4.0, en modo offline y con cachés de Hugging Face deshabilitadas.
- Capacidades heredadas del modelo base Qwen3.5-9B (código, matemáticas, multilingüismo, tool calling) no verificadas en este paquete; no disponible.
- No se documenta soporte de visión, audio ni modo thinking en este empaquetado.

## Casos de uso

- Despliegue en infraestructura Furiosa RNGD: el paquete está diseñado para ejecutarse con `fxbex validate ./model.fxbex` y `fxbex run ./model.fxbex` sobre hardware RNGD con SDK compatible, lo que permite integrar un modelo de 9B en entornos con NPUs Furiosa en lugar de GPUs.
- Inferencia en entornos aislados y offline: la verificación se realizó con cachés de Hugging Face vacías y modo offline, lo que lo hace adecuado para despliegues en redes air-gapped donde no se puede descargar nada en tiempo de ejecución.
- Pruebas de conformidad numérica en hardware: los datos de aceptación (similitud coseno 0,999929, RMSE 0,044703, coincidencia top-1) permiten usar el paquete como referencia para validar otras conversiones o configuraciones del mismo modelo en RNGD.
- Asistentes conversacionales de contexto corto: con una ventana de 512 tokens, encaja en tareas de respuesta directa y diálogo de pocos turnos, como las pruebas de humo documentadas.
- Validación de pipelines de compilación y replay: el paquete reporta 0 llamadas al compilador y 511 aciertos de replay, útil para verificar flujos de ejecución con grafos precompilados en NPU.
- Reproducibilidad de artefactos: al incluir pesos, tokenizador, configuración y adaptador en un único paquete con SHA verificable, sirve para auditorías de cadena de suministro de modelos en organizaciones que exigen trazabilidad del artefacto exacto ejecutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados son los de aceptación en NPU: similitud coseno 0,999929, RMSE 0,044703, coincidencia top-1, 1.562 tareas NPU, 0 tareas CPU, 0 grafos desconocidos, 0 llamadas al compilador, 511 aciertos de replay y 255 segundos de carga del paquete.

## Requisitos de hardware

- Hardware objetivo: NPU Furiosa RNGD, con SDK 2026.4.0 y driver compatible.
- VRAM: no aplica; la ejecución es en NPU, no en GPU. No se documenta memoria del acelerador requerida.
- GPU recomendadas: no disponible; el paquete no está orientado a GPU.
- Compatibilidad con GPU de consumo: no disponible; el formato FXBEX y el runtime embebido apuntan a NPU Furiosa.
- Despliegue: `fxbex validate ./model.fxbex` y `fxbex run ./model.fxbex`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta un tiempo de carga de 255 segundos en el entorno de verificación.
- Tamaño del paquete: aproximadamente 13,5 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RedHatAI Qwen3.5-9B-FP8-dynamic (FXBEX, este paquete) | 9B | 512 (runtime del paquete) | FXBEX | Apache-2.0 (pesos); adaptador sin licencia declarada | NPU Furiosa RNGD |
| RedHatAI/Qwen3.5-9B-FP8-dynamic (checkpoint fuente) | 9B | no disponible en la información | safetensors (FP8 dinámica) | Apache-2.0 | GPU (no especificado) |
| Qwen3.5-9B (modelo base original) | 9B | no disponible en la información | no disponible en la información | no disponible en la información | GPU (no especificado) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La verificación en NPU cubre únicamente el camino de texto y el entorno documentado; no garantiza el comportamiento con todos los prompts, longitudes de contexto o configuraciones de despliegue.
- El contexto configurado en el runtime es de 512 tokens, muy inferior al contexto nativo del modelo base; no es adecuado para tareas que requieran ventanas largas.
- El adaptador Python embebido no declara licencia propia, lo que introduce incertidumbre legal para uso comercial pese a que los pesos sean Apache-2.0.
- No se incluyen binarios del SDK ni del driver de Furiosa; el usuario debe cumplir los términos del SDK y del hardware, que pueden restringir el uso comercial.
- El paquete depende de hardware específico (NPU Furiosa RNGD); no es portable a GPU ni a otros aceleradores sin reconversión.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base en esta información.
- El tamaño del paquete (unos 13,5 GB) y el tiempo de carga (255 segundos en el entorno de prueba) condicionan su uso en escenarios que requieran arranques rápidos o despliegues frecuentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/softandsweet/redhatai-qwen3-5-9b-fp8-dynamic-rngd-fxbex
- Checkpoint fuente: RedHatAI/Qwen3.5-9B-FP8-dynamic, revisión `790f0576d2d77dd5322aa0603a470bd9e3a3d1f6` (no se proporciona URL directa en la información disponible)
- Documentación del SDK Furiosa 2026.4.0: no disponible en la información proporcionada
- Paper, blog o repositorio del modelo base Qwen3.5-9B: no disponible en la información proporcionada
