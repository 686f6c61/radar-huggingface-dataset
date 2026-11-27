# llmkat/hybrid

## Resumen

`llmkat/hybrid` es un checkpoint construido manualmente por el usuario llmkat sobre la arquitectura Qwen3.5, compuesto por dos capas Gated DeltaNet (atención lineal recurrente) y una capa de atención con compuerta. No es un modelo de lenguaje entrenado para generar texto útil: es un fixture de pruebas diseñado para verificar el correcto funcionamiento de motores de servicio de LLM (vLLM, SGLang, etc.), en particular la gestión de caché de estado recurrente y de bloques KV.

Su propiedad distintiva es que la salida greedy (argmax) es conocida en forma cerrada: el modelo se limita a seguir una cadena de punteros sobre el propio prompt, de modo que cada token correcto puede compararse contra una respuesta precalculada. Según el autor, cada token correcto gana por unos 39 nats, lo que significa que un token erróneo indica un fallo real del motor (lectura de bloque KV o estado recurrente incorrecto) y no una diferencia de redondeo.

Con 58.015.616 parámetros y un repositorio de 0,1 GB, es un artefacto ligero orientado a ingeniería de infraestructura y CI de motores de inferencia, no a aplicaciones de NLP. Es relevante para equipos que desarrollan o mantienen servidores de inferencia que necesitan validar caché de prefijos, caché de estado recurrente y decodificación token a token de forma determinista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tag `qwen3_5_text`): 2 capas Gated DeltaNet + 1 capa de atención con compuerta |
| Parametros totales | 58.015.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida dentro de la familia Qwen3.5: dos capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, seguidas de una capa de atención con compuerta. Esta combinación es precisamente lo que permite probar dos rutas de caché distintas en un mismo motor: el estado recurrente de las capas DeltaNet y los bloques KV de la capa de atención.

No hay información sobre entrenamiento: el autor describe el checkpoint como "hand-built" (construido a mano) y como un fixture de pruebas, no como un modelo entrenado con datos. No se documentan número de tokens, composición del dataset ni etapas de RLHF/DPO. La innovación relevante no está en el aprendizaje sino en el diseño verificable: la salida greedy está definida en forma cerrada mediante una cadena de punteros sobre el prompt, con un margen de aproximadamente 39 nats entre el token correcto y el siguiente, lo que hace la comprobación robusta frente a errores numéricos.

## Capacidades

- No genera lenguaje natural de forma útil: su comportamiento es seguir una cadena de punteros sobre el prompt.
- Salida greedy determinista y verificable contra una respuesta conocida.
- Verificación de caché de estado recurrente (capas Gated DeltaNet).
- Verificación de caché de prefijos y de bloques KV (capa de atención con compuerta).
- Compatible con motores de servicio como vLLM (con `--enable-prefix-caching`) y SGLang, según los tags del repositorio.
- Integración con `transformers` y con endpoints compatibles (`endpoints_compatible`).
- No dispone de tool calling, capacidades de agente, visión, audio ni multilingüismo documentados.

## Casos de uso

- Validación de caché de prefijos en vLLM: servir el modelo con `--enable-prefix-caching` y comprobar cada token con `check.py`; un fallo indica que el motor reutilizó un bloque KV incorrecto.
- Pruebas de caché de estado recurrente: al residir los registros en el estado recurrente de las capas DeltaNet, el fixture detecta si el motor reinicia o corrompe dicho estado entre peticiones.
- CI de motores de inferencia: ejecutar `check.py` con varias pasadas (`--passes 2`) contra un servidor recién compilado para detectar regresiones en decodificación antes de desplegar.
- Comparación entre motores: servir el mismo checkpoint en vLLM y SGLang y contrastar que ambos producen la secuencia conocida, aislando diferencias de implementación.
- Validación de endpoints compatibles con OpenAI: comprobar que un proxy o gateway no altera tokens ni rompe el estado de caché.
- Pruebas de decodificación especulativa o de batching: verificar que técnicas de optimización no cambian la salida greedy esperada.
- Diagnóstico de precisión numérica: el margen de 39 nats permite distinguir errores de implementación de diferencias de redondeo en kernels.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, unos 116 MB de pesos (58 M de parámetros); en FP32, unos 232 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con suficiente memoria para el runtime del motor; una RTX 4090, A100 o H100 son válidas, pero el modelo no las aprovecha por tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB libre considerando overhead del motor.
- Opciones de despliegue: vLLM (`vllm serve llmkat/hybrid --enable-prefix-caching`), SGLang y `transformers`; también puede ejecutarse en CPU para comprobaciones básicas.
- Latencia y throughput: no disponibles; al ser un fixture de pruebas, el rendimiento relevante es la determinación de la salida, no la velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llmkat/hybrid | 58.015.616 | no disponible | Fixture de pruebas de motores de inferencia | MIT | Hugging Face |
| Qwen3.5 (modelos oficiales) | no disponible | no disponible | Modelo de lenguaje de propósito general | no disponible | no disponible |
| Otros fixtures de pruebas de motores | no disponible | no disponible | Validación de caché y decodificación | no disponible | no disponible |

No se dispone de información sobre alternativas comparables en la misma categoría de fixtures de pruebas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento, código ni atención al cliente.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no ha sido entrenado con datos.
- La longitud de contexto no está documentada; el comportamiento depende del prompt de punteros definido por el autor.
- Licencia MIT: permite uso comercial y modificación, pero el uso previsto es testing, no producción como modelo generativo.
- La verificación depende de `check.py` del repositorio `sansblues/llmkat`; sin ese script, la salida conocida no es trivial de reproducir.
- Un token incorrecto con margen de ~39 nats señala un fallo del motor (bloque KV o estado recurrente), no un problema de precisión; conviene tratarlo como error bloqueante en CI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/llmkat/hybrid
- Repositorio del proyecto: https://github.com/sansblues/llmkat
