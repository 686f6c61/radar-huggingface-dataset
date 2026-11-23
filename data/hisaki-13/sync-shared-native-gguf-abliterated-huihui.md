# hisaki-13/Sync-shared-native-gguf-abliterated-huihui

## Resumen

Sync-shared native-gguf abliterated huihui es un fichero GGUF que sustituye la parte compartida (*shared*) de la familia de modelos Sync-Strata, desarrollada por hiruhiru2005. El modelo base es `hiru2005/Sync-shared`, un fine-tune de Qwen3.8-Flash-Next con arquitectura MoE y atención híbrida (capas de atención lineal y capas de atención completa). Este repositorio no contiene un modelo completo: contiene únicamente el fichero `native-gguf/Qwen3.8-Flash-Next-Sync-common.gguf` (32,7 GB) al que se ha aplicado el parche de abliteración v2 de huihui-ai. Los *expert packs* (por ejemplo Sync-M) no se incluyen y no se modifican.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de reemplazo directo (*drop-in*) para usuarios de Sync-Strata que quieren reducir el comportamiento de rechazo del modelo. La abliteración es trabajo de huihui-ai; este repositorio solo aplica su parche publicado al fichero compartido. El resultado es un modelo sin garantías de seguridad por defecto, pensado para investigación y entornos controlados, no para producción ni aplicaciones comerciales de cara al público.

El modelo declara 56.147.944.320 parámetros totales (56,1 mil millones) y soporta japonés e inglés. La licencia es `qwen-community-1.0`, con etiqueta `license:other`. El repositorio acumula 664 descargas y 1 like desde su creación el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (capas de atención lineal y capas de atención completa); etiquetada como `qwen3.8-flash-next` y `sync-strata` |
| Parametros totales | 56.147.944.320 (56,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con tensores Q5_K y Q8_0 en las capas modificadas; el resto del fichero conserva la cuantización original |
| Idiomas soportados | ja, en |
| Licencia | qwen-community-1.0 (`license:other`) |
| Formato de pesos | GGUF (`native-gguf/Qwen3.8-Flash-Next-Sync-common.gguf`, 32.692.038.016 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención híbrida: 36 capas usan atención lineal (`blk.N.ssm_out.weight`), 12 capas usan atención completa (`blk.N.attn_output.weight`) y las 48 capas incluyen una proyección *down* de expertos compartidos (`blk.N.ffn_down_shexp.weight`). El modelo base `hiru2005/Sync-shared` es un fine-tune de Qwen3.8-Flash-Next dentro del framework Sync-Strata, que separa una parte compartida (este fichero) de paquetes de expertos enrutados descargables por separado (Sync-M, entre otros).

El único entrenamiento aplicado aquí es la abliteración v2 de huihui-ai, que elimina la dirección de rechazo de los pesos. Se modificaron exactamente 96 tensores mediante sobrescritura de igual longitud: los 36 tensores `ssm_out` en Q5_K y los 48 tensores `ffn_down_shexp` en Q8_0 se copiaron del parche de huihui-ai con el mismo tipo (exacto); los 12 tensores `attn_output` en Q5_K no tenían versión Q5_K en el parche, por lo que se cuantizó la versión BF16 a Q5_K con ggml (error RMS relativo del 3,7-3,9 % frente al tensor BF16). La cabecera, el tamaño y todos los demás tensores son idénticos byte a byte al original. Los expertos enrutados (en los paquetes Sync) y la capa *draft* MTP (`mtp-rt`) no están abliterados.

## Capacidades

- Generación de texto conversacional en japonés e inglés, heredada de Qwen3.8-Flash-Next.
- Razonamiento y respuesta a preguntas generales; el autor evaluó con 40 preguntas generales en ja/en.
- Explicación de extractos de documentos técnicos (60 de las 100 prompts de evaluación).
- Modo *thinking* desactivable; la evaluación de cambio de salida se hizo con *thinking* off.
- Decodificación especulativa mediante capa *draft* MTP (mantenida del original, no abliterada).
- Reducción del comportamiento de rechazo respecto al fichero original (verificación A/B informal del autor).
- No se declara soporte de *tool calling*, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre abliteración: comparar el comportamiento del fichero original y el parcheado con las mismas prompts, usando la métrica de KLD y acuerdo top-1 reportada por el autor (KLD medio 0,0224, mediana 0,0053, acuerdo top-1 del 93,7 % sobre 1.408 posiciones).
- Evaluación controlada de robustez: medir cuánto cambia la distribución de salida al eliminar la dirección de rechazo en un modelo MoE con atención híbrida.
- Pruebas de *red teaming* en entorno aislado: generar respuestas que el modelo original rechazaría para analizar fallos de filtrado, con revisión manual obligatoria.
- Sustitución directa en Sync-Strata: reemplazar `native-gguf/Qwen3.8-Flash-Next-Sync-common.gguf` en la carpeta de modelos para obtener un Sync-M con menos rechazos, manteniendo los paquetes de expertos intactos.
- Experimentos de decodificación especulativa: estudiar el impacto de una capa *draft* no abliterada sobre la tasa de aceptación cuando el modelo verificador sí está abliterado (el autor no midió esta tasa).
- Docencia y demostraciones sobre alineación: ilustrar cómo un parche de pesos de 96 tensores altera el comportamiento conversacional sin reentrenamiento.
- Análisis de cuantización: evaluar el efecto de cuantizar a Q5_K tensores de atención completa desde BF16 (error RMS del 3,7-3,9 %) en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta exclusivamente métricas internas de comparación entre el fichero original y el abliterado:

| Comparacion | KLD medio | KLD mediana | Acuerdo top-1 | Posiciones |
|---|---:|---:|---:|---:|
| Original vs. abliterado | 0,0224 | 0,0053 | 93,7 % | 1.408 |
| Original vs. original (ruido entre ejecuciones) | 0,0073 | 0,0016 | 96,5 % | 598 |
| Abliterado vs. abliterado (ruido entre ejecuciones) | 0,0086 | 0,0018 | 96,1 % | 591 |

Estas cifras provienen de 100 prompts cotidianas (40 preguntas generales en ja/en y 60 explicaciones de extractos técnicos), 32 tokens cada una, decodificación greedy con *thinking* off, comparando solo posiciones con contexto idéntico hasta el primer token divergente. La KLD se aproxima a partir de las top-20 log-probabilidades devolvidas por el motor, por lo que es inferior a una KLD de vocabulario completo. La KLD de Sync-M original frente al profesor Q8_0 es 0,1642 (eval_v4, 8 dominios, 1.400 ventanas); la del fichero abliterado no se midió y no es comparable con la tabla anterior.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el fichero compartido pesa 32,7 GB y requiere además los paquetes de expertos Sync para funcionar, por lo que el consumo total depende del pack elegido.
- El autor ejecutó la verificación A/B con Sync-M en una GPU de 6 GB, lo que indica que el pack Sync-M con este fichero compartido cabe en hardware consumer modesto.
- GPU recomendadas: no disponibles en la información proporcionada; el dato de 6 GB sugiere viabilidad en RTX 3060, RTX 4060 y superiores para el pack Sync-M.
- Despliegue: la vía prevista es la aplicación Sync-Strata, que descarga los ficheros compartidos y los packs; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Con MTP activo, la capa *draft* es la original y la tasa de aceptación podría ser algo menor, sin medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sync-shared abliterated (este) | 56,1 mil millones | no disponible | qwen-community-1.0 | GGUF | Fichero compartido con parche de abliteración v2; requiere packs Sync |
| hiru2005/Sync-shared (original) | 56,1 mil millones | no disponible | no disponible | GGUF | Fichero compartido sin abliterar; SHA-256 `82a78508d291130fdf4654b90acb5780e8f7f44b28b0ac3495aed59163a00e69` |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | no disponible | no disponible | no disponible | GGUF | Modelo completo abliterado de huihui-ai; fuente del parche |
| sync-strata/Sync-M | no disponible | no disponible | no disponible | GGUF | Pack de expertos que se combina con el fichero compartido; KLD 0,1642 frente al profesor Q8_0 |

## Limitaciones y advertencias

- El filtrado de seguridad es mucho más débil que el del original: las salidas pueden ser sensibles, controvertidas o inapropiadas y deben revisarse manualmente.
- No es apto para públicos amplios, menores ni usos que exijan alta seguridad; el autor recomienda limitarlo a investigación, pruebas y entornos controlados.
- Uso en producción o en aplicaciones comerciales de cara al público desaconsejado por el propio autor, sin garantías de seguridad por defecto.
- Riesgo de alucinación: no cuantificado; no hay benchmarks de veracidad en la información disponible.
- La SHA-256 difiere de la esperada por la lista de modelos de Sync-Strata; una reverificación o redescarga puede tratar el fichero como corrupto y recuperar el original (no probado).
- Con MTP activo, la capa *draft* no está abliterada; la salida sigue al modelo abliterado porque cada borrador se verifica, pero la tasa de aceptación podría bajar (no medida).
- Los expertos enrutados de los packs Sync no están abliterados, de modo que el efecto global de la abliteración depende de qué pack se use.
- Solo japonés e inglés declarados; sin cobertura documentada de otros idiomas.
- Licencia `qwen-community-1.0` con etiqueta `license:other`: conviene revisar los términos antes de cualquier uso comercial.
- Artefacto experimental: creado y actualizado en noviembre de 2026, con 1 like y 664 descargas, sin pipeline declarado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hisaki-13/Sync-shared-native-gguf-abliterated-huihui
- Modelo base: https://huggingface.co/hiru2005/Sync-shared
- Parche de abliteración de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Organización huihui-ai: https://huggingface.co/huihui-ai
- Framework Sync-Strata: https://github.com/hiruhiru2005/sync-strata
- Pack Sync-M: https://huggingface.co/sync-strata/Sync-M
