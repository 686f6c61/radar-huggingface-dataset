# hisaki-13/Sync-shared-native-gguf-abliterated-huihui

## Resumen

Sync-shared native-gguf abliterated huihui es un fichero GGUF compartido (la parte "common") del sistema Sync-Strata, un proyecto que distribuye un modelo base junto con "packs" de expertos MoE separados. Este repositorio no contiene un modelo completo: es un reemplazo directo del fichero `native-gguf/Qwen3.8-Flash-Next-Sync-common.gguf` de `hiru2005/Sync-shared`, al que se le ha aplicado el parche de abliteración v2 de huihui-ai. La abliteración elimina la dirección de rechazo de los pesos, de modo que el modelo deja de negarse a responder a peticiones que el original rechazaría.

El modelo base declarado es Qwen3.8-Flash-Next, una arquitectura híbrida con capas de atención lineal (SSM) y atención completa, y componentes MoE. Los pesos publicados suman 56.147.944.320 parámetros totales y el repo ocupa 32,7 GB. El fichero GGUF tiene 32.692.038.016 bytes y su SHA-256 está documentado en la model card. Solo se modificaron 96 tensores mediante sobrescritura de igual longitud: el resto del fichero es idéntico byte a byte al original.

Es relevante ahora como caso de estudio de modificación de pesos en formato GGUF y de los problemas de trazabilidad que introduce: el autor advierte de que la verificación de la app puede detectar el fichero como corrupto, de que los expertos enrutados y la capa draft MTP no están abliterados, y de que no se ejecutó ningún benchmark formal. La licencia declarada es qwen-community-1.0, con la etiqueta `license: other` en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (SSM) y atención completa, con componentes MoE (según la model card: `ssm_out`, `attn_output`, `ffn_down_shexp`, expertos enrutados) |
| Parametros totales | 56.147.944.320 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K (tensores `ssm_out` y `attn_output`), Q8_0 (tensores `ffn_down_shexp`); el parche original de huihui-ai incluye además BF16 |
| Idiomas soportados | ja, en |
| Licencia | qwen-community-1.0 (metadatos: `license: other`) |
| Formato de pesos | GGUF (`native-gguf/Qwen3.8-Flash-Next-Sync-common.gguf`, 32.692.038.016 bytes) |

## Arquitectura y entrenamiento

El fichero corresponde a la parte compartida del sistema Sync-Strata, que separa un tronco común de una serie de "packs" de expertos (por ejemplo, Sync-M) distribuidos por separado. La arquitectura del tronco combina 36 capas de atención lineal (`blk.N.ssm_out.weight`), 12 capas de atención completa (`blk.N.attn_output.weight`) y 48 capas con componente MoE (`blk.N.ffn_down_shexp.weight` en todas las capas). El sistema incluye además una capa draft MTP (`mtp-rt`) para decodificación especulativa, que no forma parte de este repositorio y no fue modificada.

El único "entrenamiento" aplicado aquí es la abliteración de huihui-ai v2: se sobrescribieron 96 tensores con los bytes del parche publicado por huihui-ai, dirigidos al conjunto `--ablate-experts 2` en todas las capas (`ssm_out`, `attn_output`, `ffn_down_shexp`). Para `ssm_out` y `ffn_down_shexp` se usó la versión del parche del mismo tipo de cuantización (exacta); para `attn_output` el parche no incluía versión Q5_K, así que el tensor BF16 se recuantizó a Q5_K con ggml, con un error RMS relativo del 3,7-3,9 % frente al tensor BF16. Los expertos enrutados y la capa draft MTP no fueron abliterados. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés e inglés, según los idiomas declarados.
- Razonamiento y respuesta a preguntas de carácter general: la evaluación informal usó 40 preguntas generales en ja/en.
- Explicación de fragmentos de documentos técnicos: la evaluación incluyó 60 peticiones de este tipo.
- Modo "thinking" conmutable: la comparación de salidas se hizo con `thinking off`.
- Decodificación especulativa mediante la capa MTP del sistema Sync-Strata (no incluida en este repo).
- Comportamiento "uncensored": la abliteración reduce los rechazos, de modo que el modelo responde a peticiones que el original declinaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: no disponible (la model card menciona un `mmproj` opcional en el sistema Sync-Strata, pero no se detalla su función ni se incluye aquí).
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre abliteración: comparar el comportamiento del fichero original y el parcheado con los mismos prompts para estudiar cómo se distribuye la dirección de rechazo en tensores concretos (`ssm_out`, `attn_output`, `ffn_down_shexp`).
- Evaluación de robustez de seguridad: medir la tasa de rechazos antes y después del parche en un conjunto controlado de prompts, en un entorno aislado y con revisión manual de salidas.
- Pruebas de compatibilidad de GGUF: verificar cómo distintas herramientas (llama.cpp, motores que consumen GGUF) tratan un fichero con el mismo tamaño pero distinto SHA-256, y si la verificación por tamaño de la app Sync-Strata lo acepta.
- Estudio de recuantización: analizar el impacto del error RMS del 3,7-3,9 % introducido al recuantizar `attn_output` de BF16 a Q5_K, comparando la divergencia KL frente a la versión BF16 del parche.
- Análisis de divergencia de salidas: reproducir la comparación KLD documentada (media 0,0224, mediana 0,0053, acuerdo top-1 del 93,7 % sobre 1.408 posiciones) para validar metodologías de comparación entre variantes de un mismo modelo.
- Docencia y divulgación: ilustrar en un curso o artículo cómo una modificación de 96 tensores cambia el comportamiento de un modelo de 56 000 millones de parámetros sin reentrenar.
- Procesamiento de documentación técnica en ja/en en entornos controlados: resúmenes y explicaciones de extractos, siempre con revisión humana por la ausencia de filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye medidas de divergencia y una comprobación informal de rechazos:

| Metrica | Valor |
|---|---|
| KL a la versión original (Sync-M, eval_v4, 8 dominios, 1.400 ventanas) | 0,1642 (solo original; la versión abliterada no se midió) |
| KLD media original vs. abliterado (greedy, thinking off, 1.408 posiciones) | 0,0224 |
| KLD mediana original vs. abliterado | 0,0053 |
| Acuerdo top-1 original vs. abliterado | 93,7 % |
| KLD media ruido run-to-run (original vs. original, 598 posiciones) | 0,0073 |
| KLD media ruido run-to-run (abliterado vs. abliterado, 591 posiciones) | 0,0086 |
| Rechazos (A/B informal, Sync-M, GPU de 6 GB) | Menos rechazos con el fichero parcheado; sin benchmark |

La KLD se aproxima a partir de las top-20 log-probabilidades que devuelve el motor, por lo que subestima la KLD de vocabulario completo. La comparación usó 100 prompts cotidianos (40 preguntas generales en ja/en, 60 explicaciones de extractos técnicos) de 32 tokens cada uno.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 32,7 GB, por lo que la inferencia completa requiere al menos unos 33-36 GB de VRAM o memoria unificada, más el espacio de caché KV.
- El autor reporta una prueba con una GPU de 6 GB usando Sync-M; no se detalla cómo se reparte la carga entre GPU y CPU/RAM en ese escenario.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, encaja en A100 80 GB, H100, L40S 48 GB o configuraciones con memoria unificada de 64 GB o más.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a RAM del sistema.
- Opciones de despliegue: el sistema Sync-Strata es el entorno previsto (descarga los packs de expertos y las demás partes compartidas); el fichero es GGUF y las herramientas compatibles con GGUF podrían cargarlo, aunque no se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sync-shared native-gguf abliterated huihui (este) | 56.147.944.320 | no disponible | qwen-community-1.0 | GGUF | Parte compartida de Sync-Strata con parche de abliteración v2; requiere packs de expertos externos |
| hiru2005/Sync-shared (original) | no disponible | no disponible | no disponible | GGUF | Mismo fichero sin abliterar; SHA-256 `82a78508…` |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | no disponible | no disponible | no disponible | GGUF | Modelo completo de huihui-ai con la abliteración v2; fuente del parche aplicado aquí |
| sync-strata/Sync-M | no disponible | no disponible | no disponible | GGUF | Pack de expertos usado en las evaluaciones; no incluye el fichero compartido |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de las medidas de divergencia de la sección anterior.

## Limitaciones y advertencias

- La abliteración elimina la mayor parte de los rechazos: las salidas pueden ser sensibles, controvertidas o inapropiadas, y el filtrado de seguridad es mucho más débil que en el original.
- No es apto para audiencias generales, entornos públicos, menores ni usos que requieran alta seguridad; el autor recomienda limitarlo a investigación, pruebas y entornos controlados.
- Uso en producción o en aplicaciones comerciales de cara al público desaconsejado explícitamente por el autor; sin garantías de seguridad por defecto.
- Riesgo de alucinación: no cuantificado; no se ejecutaron benchmarks de calidad, veracidad ni razonamiento.
- Los expertos enrutados (en los packs Sync) y la capa draft MTP no están abliterados; con MTP activo, la tasa de aceptación del draft puede ser algo menor (no medida).
- El SHA-256 difiere del que figura en la lista de modelos de la app; la verificación normal solo comprueba el tamaño, pero una re-descarga o verificación podría tratar el fichero como dañado y recuperar el original (no probado).
- El error de recuantización de `attn_output` (3,7-3,9 % RMS relativo) introduce una divergencia adicional respecto al parche BF16 de huihui-ai.
- Idiomas limitados a japonés e inglés; no se declara soporte de castellano.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; conviene revisar el texto de la licencia antes de cualquier despliegue.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.
- El fichero no es un modelo autónomo: sin los packs de expertos y las demás partes compartidas de Sync-Strata no es utilizable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hisaki-13/Sync-shared-native-gguf-abliterated-huihui
- Modelo base: https://huggingface.co/hiru2005/Sync-shared
- Proyecto Sync-Strata: https://github.com/hiruhiru2005/sync-strata
- Pack de expertos Sync-M: https://huggingface.co/sync-strata/Sync-M
- Organización huihui-ai: https://huggingface.co/huihui-ai
- Modelo de referencia de la abliteración: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
