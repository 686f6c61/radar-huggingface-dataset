# huggingface-mic/Kimi-K2.5-mic

## Resumen

Kimi-K2.5-mic es un artefacto de prueba publicado por el usuario huggingface-mic en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* (pesos aleatorios con semilla 17) construido para validar la integración del modelo base `moonshotai/Kimi-K2.5` con la librería Transformers. El repositorio empaqueta pesos reducidos, la configuración del modelo, los ficheros de procesador copiados byte a byte del checkpoint original y las expectativas de framework necesarias para ejecutar pruebas de integración.

El modelo base real, `moonshotai/Kimi-K2.5`, es un modelo vision-language de tipo *conditional generation* con arquitectura `Kimi_K25ForConditionalGeneration`, que internamente reutiliza componentes de DeepSeek (`configuration_deepseek.py`, `modeling_deepseek.py`) y una capa de mezcla de expertos (MoE) en el modelo de lenguaje. El fixture conserva los nombres de tensores del checkpoint real y reduce la profundidad a 2 capas de texto y 2 capas de visión, con 21.464.388 parámetros totales.

Su relevancia es exclusivamente de ingeniería: sirve para que los mantenedores de Transformers verifiquen que la carga, el procesado de entradas multimodales y la generación condicional funcionan sin descargar el checkpoint completo de Kimi-K2.5. Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kimi_K25ForConditionalGeneration (vision-language conditional generation, con componentes DeepSeek y capas MoE en el modelo de lenguaje) |
| Parametros totales | 21.464.388 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio copia el fichero `LICENSE` del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del checkpoint `moonshotai/Kimi-K2.5` bajo la clase `Kimi_K25ForConditionalGeneration`, un modelo multimodal de generación condicional que combina un *encoder* de visión con un modelo de lenguaje. El modelo de lenguaje incorpora capas de mezcla de expertos (MoE), como evidencian los tensores `mlp.experts.down_proj` y `mlp.experts.gate_up_proj` presentes en el checkpoint real. El proceso de reducción aplica la regla genérica de `sweep.py` del repositorio transformers-mic: se recortan las capas ocultas de texto a 2 y las de visión a 2, manteniendo la estructura de nombres de tensores idéntica a la del modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a las entradas: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,302). Los ficheros de procesador (`chat_template.jinja`, `configuration_kimi_k25.py`, `kimi_k25_processor.py`, `kimi_k25_vision_processing.py`, `modeling_kimi_k25.py`, `tokenization_kimi.py`, `tool_declaration_ts.py`, entre otros) se copiaron byte a byte desde el modelo base, de modo que la tokenización, el procesado de imágenes y la plantilla de chat son exactamente los del checkpoint real.

## Capacidades

- El artefacto no tiene capacidades funcionales de generación: sus pesos son aleatorios y su salida no es coherente.
- Conserva la estructura de un modelo vision-language conditional generation, por lo que puede ejercitar las rutas de código de procesado de imagen y texto del modelo base.
- Incluye la plantilla de chat (`chat_template.jinja`) y el módulo de declaración de herramientas (`tool_declaration_ts.py`) del modelo base, lo que permite probar el flujo de *tool calling* a nivel de contrato de framework.
- Soporta la carga mediante `AutoModel`/`AutoProcessor` de Transformers con `trust_remote_code` (etiqueta `custom_code`).
- No dispone de modo *thinking*, audio ni otras capacidades especiales verificables en este artefacto.
- Las capacidades multilingües reales corresponden al modelo base y no se documentan en este repositorio.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y `AutoProcessor` para verificar que la clase `Kimi_K25ForConditionalGeneration` se resuelve y ejecuta sin errores antes de probar con el checkpoint completo.
- Validación de contratos de entrada: usar las expectativas en `integrations/transformers/expectations` para comprobar que perturbaciones en `pixel_values`, `input_ids` y demás entradas mueven los logits por encima del umbral definido.
- CI/CD de la librería: ejecutar la suite de integración en cada *pull request* sin descargar los pesos completos de Kimi-K2.5, manteniendo tiempos de build reducidos.
- Verificación de tokenización y plantilla de chat: al copiarse `tokenization_kimi.py`, `tiktoken.model` y `chat_template.jinja` byte a byte, permite probar la serialización de conversaciones y el formato de mensajes del modelo real.
- Pruebas de procesado multimodal: validar `kimi_k25_vision_processing.py` y `preprocessor_config.json` con imágenes sintéticas para detectar regresiones en el *pipeline* de visión.
- Desarrollo de *tool calling*: ejercitar `tool_declaration_ts.py` para comprobar el parseo y la emisión de declaraciones de herramientas en el formato esperado por el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, carece de sentido evaluar MMLU, HumanEval, GSM8K u otras métricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (21,5 M de parámetros); el tamaño del repositorio es de 0,0 GB según Hugging Face.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía prevista; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K2.5-mic | 21,5 M | no disponible | Fixture de pruebas de integración | no disponible | Hugging Face |
| moonshotai/Kimi-K2.5 | no disponible | no disponible | Modelo vision-language de produccion (base) | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integración de otros modelos | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen valor semántico.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- El checkpoint real carece de varios tensores de expertos (`mlp.experts.down_proj` y `mlp.experts.gate_up_proj` en numerosas capas), lo que refleja discrepancias entre el checkpoint publicado y la arquitectura esperada; el fixture replica esa ausencia.
- La licencia no está disponible en la información proporcionada; el repositorio copia el fichero `LICENSE` del modelo base, por lo que las restricciones de uso comercial dependerán de dicho fichero y deben verificarse antes de cualquier uso.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas propias, ya que no ha habido entrenamiento.
- Requiere `trust_remote_code=True` por el uso de código personalizado (`custom_code`), lo que implica ejecutar código del repositorio.
- El tamaño del repositorio (0,0 GB) y la ausencia de pipeline declarado sugieren que no se publicaron pesos completos más allá del fixture.

## Enlaces

- [Hugging Face: huggingface-mic/Kimi-K2.5-mic](https://huggingface.co/huggingface-mic/Kimi-K2.5-mic)
- [Modelo base: moonshotai/Kimi-K2.5](https://huggingface.co/moonshotai/Kimi-K2.5)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Kimi-K2.5-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/Kimi-K2.5-mic/blob/main/build.json)
