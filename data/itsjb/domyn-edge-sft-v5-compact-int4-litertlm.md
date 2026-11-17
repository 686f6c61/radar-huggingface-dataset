# itsJB/domyn-edge-sft-v5-compact-int4-litertlm

## Resumen

Domyn Edge SFT v5 Compact INT4 LiteRT-LM es una compilación on-device del modelo `domyn/Domyn-Edge-SFT`, publicada por el usuario `itsJB` en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una cuantización post-entrenamiento *weight-only* de los pesos SFT originales, empaquetada como un único archivo `.litertlm` de 2,35 GiB para su ejecución con el runtime LiteRT-LM de Google AI Edge. El objetivo es claro: llevar un decodificador denso de unos 4.000 millones de parámetros a un teléfono Android de gama alta y ejecutarlo de forma totalmente offline, sin GPU y con backend de CPU.

Arquitectónicamente hereda intacta la estructura del modelo base: 36 capas, dimensión oculta de 2.560, MLP de 9.728 con activación SiLU, atención con 32 cabezas de consulta y 8 de clave/valor (GQA), normalización QK y un patrón híbrido de 24 capas de ventana deslizante (1.024 tokens previos, RoPE, cabeza de 64) más 12 capas globales (NoPE, cabeza de 256). Los embeddings están atados a la salida, con un vocabulario de 115.272 tokens, y se han separado en un embedder INT8 propio.

La relevancia de esta ficha es doble. Por un lado, demuestra el estado actual del despliegue de LLMs en dispositivos móviles con LiteRT-LM. Por otro, es explícita sobre sus recortes: contexto limitado a 2.048 tokens, modo de razonamiento desactivado, tool calling no soportado, backend GPU aún no funcional y una pérdida de unos 6 puntos en GSM8K respecto al modelo en BF16. Es, por tanto, un *release candidate* útil para experimentación y prototipado on-device, no para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, híbrido de atención sliding-window y global (24 capas SW con RoPE + 12 capas globales NoPE), GQA con QK norm |
| Parametros totales | ~4B (decoder denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (el modelo base soporta hasta 1M entrenado; 256k recomendado) |
| Tipos de cuantizacion | Decoder INT4 blockwise (bloque 32, simétrico, OCTAV); embeddings INT8 channelwise simétrico; activaciones y KV cache en BF16 |
| Idiomas soportados | en, it, es, fr, de |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (TFLite / LiteRT), archivo único de 2.520.888.320 bytes (2,35 GiB) |

## Arquitectura y entrenamiento

El modelo base `Domyn-Edge-SFT` es un decodificador denso de aproximadamente 4.000 millones de parámetros con 36 capas, oculto de 2.560 y MLP de 9.728 con SiLU. La atención combina 32 cabezas de consulta con 8 de clave/valor (GQA), aplica normalización QK y alterna dos regímenes: 24 capas de atención de ventana deslizante de 1.024 tokens previos con RoPE y cabeza de 64 dimensiones, y 12 capas de atención global con NoPE y cabeza de 256 dimensiones. Los embeddings están atados a la matriz de salida y comparten un vocabulario de 115.272 tokens.

Esta compilación no entrena nada: es una cuantización post-entrenamiento *weight-only* sobre los pesos SFT ya liberados (checkpoint `bfdad89`). El decoder pasa a INT4 con cuantización por bloques de 32, simétrica, mediante el método OCTAV; el embedder se separa a INT8 channelwise. Las activaciones y la caché KV permanecen en BF16. El proceso de conversión consta de cuatro pasos verificados (stage, conversión a LiteRT, empaquetado `.litertlm` y validación), y la plantilla de chat queda embebida en el propio archivo. El runtime objetivo es LiteRT-LM 0.19.1 sobre CPU.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, italiano, español, francés y alemán.
- Razonamiento de carácter general y respuesta a preguntas, con la salvedad de que el modo `thinking` está desactivado en este bundle (la plantilla precierra el bloque de razonamiento).
- Capacidad de matemáticas y código heredada del modelo base, aunque degradada por la cuantización INT4 (ver benchmarks).
- Ejecución totalmente offline: no requiere red ni servicios en la nube una vez descargado el archivo.
- Plantilla de chat embebida: el motor aplica el formato de conversación y admite un mensaje de sistema adicional tras la identidad integrada.
- Gestión de conversaciones mediante la API de LiteRT-LM (`create_conversation`, `send_message_async`) y muestreo configurable (top_k, seed).
- Capacidades multilingües limitadas a los cinco idiomas declarados.
- No soporta tool calling ni function calling.
- No soporta visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional offline en Android: el modelo se importa en Google AI Edge Gallery y responde sin conexión con acelerador CPU y un máximo de 2.048 tokens; útil para demos y apps de asistencia en entornos sin red.
- Prototipado de apps móviles con IA local: desarrolladores que quieran validar UX de chat, latencia percibida y consumo de memoria en un dispositivo real antes de comprometerse con un modelo mayor o un servicio en la nube.
- Traducción y asistencia multilingüe ligera entre los cinco idiomas soportados (en, it, es, fr, de) en escenarios de conversación corta, aprovechando la plantilla de chat embebida.
- Procesamiento de texto en el borde con privacidad estricta: clasificación, resumen o reescritura de textos cortos que no deben salir del dispositivo, con la garantía de que todo el pipeline corre en local sobre CPU.
- Evaluación de la cadena de conversión LiteRT-LM: sirve como referencia reproducible (hash SHA-256, versión de runtime, pasos documentados) para equipos que quieran cuantizar y empaquetar sus propios modelos para LiteRT.
- Integración en CLI Android o scripts Python: uso mediante `litert_lm_main` o la API `litert_lm` para pruebas automatizadas de generación de texto en pipelines de CI o entornos embebidos.
- Educación y experimentación: comparación práctica entre un modelo BF16 y su versión INT4 on-device para estudiar el impacto de la cuantización en calidad y latencia.

## Benchmarks y rendimiento

La model card únicamente reporta que la cuantización INT4 supone una pérdida de aproximadamente **6 puntos en GSM8K** respecto al modelo en BF16. No se publican resultados numéricos de MMLU, HumanEval, GSM8K ni de otros conjuntos en la información disponible.

| Benchmark | Este bundle (INT4) | Modelo base (BF16) |
|---|---|---|
| GSM8K | ~6 puntos por debajo del base | referencia |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: 2,35 GiB en disco; el modelo completo debe residir en memoria/almacenamiento del dispositivo.
- VRAM/RAM estimada para inferencia: aunque no se especifica un pico exacto, el bundle está probado en un Android con **8 GB de RAM** (Snapdragon 8 Gen 2) usando backend CPU. Se recomienda disponer de al menos 8 GB de RAM en el dispositivo para cargar el modelo con holgura.
- GPU recomendadas: **no aplicable**; el backend GPU de LiteRT-LM aún no funciona con este bundle según el autor.
- Compatibilidad con GPU de consumo: no procede para este formato; el despliegue objetivo es CPU móvil o CPU de escritorio.
- Despliegue: Google AI Edge Gallery (Android), CLI `litert_lm_main` (arm64) y API Python `litert_lm==0.19.1` con `Backend.CPU(thread_count=...)`.
- Latencia y throughput: no se publican cifras concretas; el autor indica que la primera carga es más lenta por la compilación de kernels, que se cachean en `cache_dir`. Se recomienda `--num_cpu_threads` ajustado al dispositivo (2 en el ejemplo CLI, 4 en el ejemplo Python).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Domyn Edge SFT v5 Compact INT4 (este) | ~4B denso | 2.048 tokens | `.litertlm`, LiteRT-LM CPU | Apache 2.0 | Cuantización INT4 on-device, sin tool calling, thinking off |
| `domyn/Domyn-Edge-SFT` (base) | ~4B denso | 256k recomendado (entrenado a 1M) | safetensors / Transformers | Apache 2.0 | Modelo completo en BF16, soporta tool calling y `thinking` |
| Alternativas on-device de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más directa y fiable es contra el propio modelo base: este bundle sacrifica contexto (de 256k recomendado a 2.048 tokens), tool calling, modo de razonamiento y unos 6 puntos en GSM8K a cambio de un archivo único de 2,35 GiB ejecutable en CPU móvil. No se dispone de datos de otros modelos on-device comparables en la información proporcionada.

## Limitaciones y advertencias

- **Estado release candidate**: probado en CPU de escritorio y en un Android concreto (8 GB RAM, Snapdragon 8 Gen 2, backend CPU); no se garantiza su comportamiento en otros dispositivos.
- **Backend GPU no funcional**: solo se ha validado el backend de CPU.
- **Contexto muy limitado**: 2.048 tokens, frente a los 256k recomendados del base. En Gallery, el valor por defecto de Max tokens es 4.096, superior a la caché KV exportada; debe ajustarse manualmente a 2.048.
- **Sin tool calling ni function calling**, lo que descarta flujos agénticos o integración con herramientas externas.
- **Modo de razonamiento desactivado**: la plantilla precierra el bloque `thinking`, por lo que no se obtiene cadena de razonamiento explícita.
- **Degradación por cuantización**: aproximadamente 6 puntos menos en GSM8K respecto a BF16; se espera degradación adicional en tareas sensibles a la precisión numérica.
- **Riesgo de alucinación**: inherente a modelos de este tamaño; no hay datos específicos de mitigación publicados.
- **Sesgos**: no se documentan evaluaciones de sesgo en la información disponible.
- **Cobertura idiomática**: limitada a en, it, es, fr, de; otros idiomas no están declarados.
- **Licencia**: Apache 2.0, igual que el modelo base, lo que permite uso comercial; conviene verificar las condiciones del modelo fuente (`domyn/Domyn-Edge-SFT`) antes de redistribuir.
- **Reproducibilidad**: se proporciona SHA-256 del archivo, lo que permite verificar la integridad de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsJB/domyn-edge-sft-v5-compact-int4-litertlm
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Checkpoint fuente (commit `bfdad89`): https://huggingface.co/domyn/Domyn-Edge-SFT/tree/bfdad8935eede2977b2293b9754597529b21e55c
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Guía de compilación y ejecución de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
