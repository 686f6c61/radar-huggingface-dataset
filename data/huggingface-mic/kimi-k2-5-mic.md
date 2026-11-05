# huggingface-mic/Kimi-K2.5-mic

## Resumen

Kimi-K2.5-mic es un artefacto de prueba (test-artifact) publicado en HuggingFace por el usuario huggingface-mic. No es un modelo funcional ni entrenado: es una versión "slim" (reducida) del modelo moonshotai/Kimi-K2.5, generada automáticamente mediante la herramienta sweep.py del repositorio transformers-mic. Su propósito es servir como fixture de integración para validar contratos de uso y expectativas de frameworks (Transformers) sobre la arquitectura Kimi_K25ForConditionalGeneration, no para inferencia real.

El modelo conserva la arquitectura del checkpoint original (un modelo vision-language condicional con componentes de lenguaje tipo DeepSeek y un codificador visual), pero con una configuración drásticamente reducida: 2 capas en el modelo de lenguaje y 2 capas en el modelo de visión. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno; únicamente superaron una puerta de sensibilidad a las entradas (input-sensitivity gate) que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001.

Con 21.464.388 parámetros totales y un tamaño de repositorio de 0,0 GB, este artefacto está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Es relevante únicamente para desarrolladores que trabajen en la integración de la arquitectura Kimi K2.5 en Transformers y necesiten un fixture ligero y determinista para pruebas de contrato, no para usuarios que busquen un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kimi_K25ForConditionalGeneration (vision-language condicional, componentes DeepSeek y vision) |
| Parámetros totales | 21.464.388 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | moonshotai/Kimi-K2.5 |
| Tipo de artefacto | test-artifact (fixture de integración, pesos aleatorios) |
| Capas del modelo de lenguaje | 2 |
| Capas del modelo de visión | 2 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es `Kimi_K25ForConditionalGeneration`, correspondiente al modelo base moonshotai/Kimi-K2.5. Según los archivos de procesador copiados byte a byte del checkpoint original, el modelo combina componentes de lenguaje con estructura tipo DeepSeek (`configuration_deepseek.py`, `modeling_deepseek.py`) y un módulo de visión (`kimi_k25_vision_processing.py`, `preprocessor_config.json`). El tokenizador se basa en tiktoken (`tiktoken.model`, `tokenization_kimi.py`) e incluye un template de chat (`chat_template.jinja`) y utilidades para declaración de herramientas (`tool_declaration_ts.py`).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron mediante la regla genérica de reducción de `sweep.py`, que redujo el número de capas del modelo de lenguaje y del modelo de visión a 2 en cada caso. El fixture conserva los mismos nombres de tensores que el checkpoint real, aunque el checkpoint original carece de varios tensores de expertos (`experts.down_proj`, `experts.gate_up_proj`) en múltiples capas, lo que sugiere una arquitectura MoE en el modelo base. Los archivos de procesador, licencia y avisos de terceros se copiaron sin modificación desde moonshotai/Kimi-K2.5. No se dispone de información sobre el dataset, número de tokens ni técnicas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas con sentido.
- Sirve como fixture de contrato para validar la integración de la arquitectura Kimi K2.5 en Transformers.
- Conserva la estructura de entradas del modelo vision-language original (texto e imágenes, según `pixel_values` y `preprocessor_config.json`).
- Incluye template de chat y tokenizador compatibles con el modelo base.
- Incluye utilidades de declaración de herramientas (`tool_declaration_ts.py`), lo que refleja que el modelo base contempla tool calling.
- Permite pruebas de sensibilidad a entradas: cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (la más débil, `pixel_values:halve`, mueve 0,302).
- No debe usarse para generación de texto, razonamiento, código, matemáticas, visión ni ninguna tarea de propósito general.

## Casos de uso

- Pruebas de integración en Transformers: validar que la clase `Kimi_K25ForConditionalGeneration` carga correctamente el checkpoint y ejecuta el forward pass con las entradas esperadas, usando un fixture ligero de 21,5M parámetros en lugar del modelo completo.
- Verificación de contratos de entrada: comprobar que las perturbaciones en `pixel_values`, texto y demás entradas del contrato producen cambios medibles en los logits, gracias a la puerta de sensibilidad superada con seed 17.
- Desarrollo de pipelines de preprocesado: probar `kimi_k25_processor.py`, `kimi_k25_vision_processing.py` y `media_utils.py` copiados del modelo original sin necesidad de descargar los pesos completos.
- Validación de tokenizador y chat template: ejecutar pruebas sobre `tokenization_kimi.py`, `tiktoken.model` y `chat_template.jinja` en un entorno de CI con recursos mínimos.
- Pruebas de tool calling: verificar la integración de `tool_declaration_ts.py` y el formato de declaración de herramientas del modelo base en un entorno controlado.
- Integración continua en el repositorio transformers-mic: usar el fixture como caso de prueba reproducible (fixture key `18c52a9f071d`) para detectar regresiones en la cobertura de checkpoints con procesadores byte-idénticos.
- Validación de carga de safetensors y nombres de tensores: comprobar que el pipeline de carga maneja correctamente los nombres de tensores del checkpoint real, incluidos los ausentes en el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar rendimiento en tareas de lenguaje, visión o razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 21,5M parámetros; en la práctica, cualquier GPU consumer moderna puede alojarlo.
- GPU recomendadas: no se requieren GPU dedicadas; el fixture cabe en CPU y en cualquier GPU con al menos 1 GB de memoria.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (el repositorio incluye `custom_code` y archivos de modelado propios); no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K2.5-mic | 21.464.388 | no disponible | Fixture de integración (test-artifact) | no disponible | HuggingFace (huggingface-mic) |
| moonshotai/Kimi-K2.5 | no disponible | no disponible | Modelo vision-language de propósito general | no disponible | HuggingFace (moonshotai) |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de integración por arquitectura | no disponible | HuggingFace (huggingface-mic) |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría. El único comparable directo identificable es el modelo base moonshotai/Kimi-K2.5, del que este artefacto deriva, pero no se han proporcionado sus especificaciones completas.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes y no debe usarse para inferencia real ni en producción.
- Etiquetado como `test-artifact`: excluido intencionadamente de búsquedas de modelos candidatos; no es un modelo utilizable.
- Licencia no disponible en la información proporcionada: no se puede confirmar si el uso comercial está permitido; los archivos `LICENSE` y `THIRD_PARTY_NOTICES.md` se copiaron del modelo base, pero su contenido no se detalla.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe.
- Longitud de contexto no disponible: la configuración reducida a 2 capas no refleja la del modelo original.
- Nombres de tensores incompletos: el checkpoint original carece de varios tensores de expertos (`experts.down_proj`, `experts.gate_up_proj`) en múltiples capas, lo que puede afectar a pruebas que asuman su presencia.
- Riesgo de confusión: el nombre "Kimi-K2.5-mic" puede llevar a error; no es una versión reducida usable del modelo Kimi K2.5, sino un fixture de pruebas.
- Sin garantías de mantenimiento: creado y actualizado el 2026-11-05 con 0 descargas y 0 likes; no hay evidencia de soporte continuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Kimi-K2.5-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
