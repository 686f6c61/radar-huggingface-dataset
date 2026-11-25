# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario kingjones777. El modelo base procede de Qwen (Qwen/Qwen3.8-Flash-Next) y pasa por una variante "uncensored" (orcarouter/Qwen3.8-Flash-Next-Uncensored) a la que se le ha eliminado el comportamiento de rechazo. Esta publicación concreta no es un modelo nuevo, sino una distribución de pesos cuantizados con tipos de tensor ROCmFP4, pensada específicamente para ejecutarse en hardware AMD Ryzen AI Max+ 395 (iGPU gfx1151) mediante un fork de llama.cpp.

El interés técnico principal reside en la combinación de tres elementos: cuantización FP4 orientada a ROCm, soporte de la arquitectura `qwen4exp` y decodificación especulativa mediante cabezas MTP (multi-token prediction). El autor documenta mediciones reales de rendimiento en gfx1151 con ROCm 7.2.4, incluyendo ganancias de hasta el 34 % en tareas de razonamiento con `--spec-draft-n-max 1` y una aceptación de 0,945. También publica parches para corregir defectos del grafo MTP y de la caché del indexador QSA en restauraciones de checkpoint de contexto.

El modelo tiene 176.943.899.520 parámetros (unos 177 000 millones) según los safetensors del modelo base, y el repositorio GGUF ocupa 95,3 GB. Es, por tanto, un modelo de gran tamaño que solo resulta viable en configuraciones de memoria unificada amplia, como la de un Ryzen AI Max+ 395 con 128 GB. La licencia declarada es qwen-community-1.0, con la etiqueta `license: other` en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura `qwen4exp` (atención QSA con indexador y caché `mem_idx`), cabezas MTP para decodificación especulativa |
| Parámetros totales | 176.943.899.520 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 262 144 tokens en las pruebas del autor (`-c 262144`); verificado de 2K a 128K con el parche de checkpoint |
| Tipos de cuantización | ROCmFP4 (tipos de tensor propios del fork ROCmFPX); repositorio de 95,3 GB |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other` en la model card) |
| Formato de pesos | GGUF (múltiples shards; requiere el primer shard para cargar) |

## Arquitectura y entrenamiento

La model card no aporta detalles sobre el entrenamiento del modelo base: no se indica el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se documenta es la arquitectura de ejecución. El modelo usa la arquitectura `qwen4exp`, que llama.cpp no soporta de serie, e incorpora un indexador QSA cuya caché (`mem_idx`) se gestiona mediante `llama_memory_hybrid_idx`. Esa caché es relevante porque su ausencia en los checkpoints de contexto provocaba fallos a partir de 64K; el autor publica `qwen4exp-qsa-checkpoint-fix.patch`, que sobrescribe `state_write` / `state_read` en esa clase de memoria.

La innovación práctica más destacable es la decodificación especulativa con cabezas MTP. El grafo MTP original del árbol `qwen4exp` agrupaba por media (mean-pooling) los flujos de hiperconexión, lo que dejaba la aceptación en torno a 0,36 y anulaba la ganancia. El parche `qwen4exp-mtp-graph.patch` corrige el combinador y eleva la aceptación hasta 0,945 en tareas de razonamiento. La cabeza MTP solo propone tokens candidatos y el modelo principal verifica cada uno, por lo que la salida no cambia. Las mediciones se realizaron sobre los pesos Uncensored STRIX_LEAN-imatrix con la cabeza Q8_0 (`mtp-Qwen3.8-Flash-Next-Q8_0.gguf`), en un Ryzen AI Max+ 395 con ROCm 7.2.4, greedy, `cache_prompt:false` y 256 tokens generados.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento de varios pasos, con ganancias medidas de decodificación especulativa especialmente en cargas de tipo razonamiento (aceptación 0,945).
- Generación de código: el autor mide la carga "code" con `--spec-draft-n-max 1` y obtiene +11 % (aceptación 0,711).
- Salida estructurada en JSON: carga medida con +14 % con `n-max 1` (aceptación 0,758).
- Resumen de documentos largos: carga medida, con contexto verificado hasta 128K y configuración de hasta 262 144 tokens.
- Comportamiento sin rechazo (uncensored): se ha eliminado la negativa a responder, lo que no añade capacidad sino que retira barreras de seguridad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la API compatible de llama.cpp (`llama-server`).
- Soporte de plantillas de chat vía `--jinja`.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Inferencia local en hardware AMD con memoria unificada: el formato ROCmFP4 y las instrucciones de compilación con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151` están pensados para ejecutar el modelo en un Ryzen AI Max+ 395 sin GPU discreta, aprovechando los 95,3 GB del repositorio en memoria unificada.
- Razonamiento interactivo de baja latencia: con `--spec-draft-n-max 1` y la cabeza MTP Q8_0 se obtienen 31,94 tok/s frente a 23,91 tok/s sin draft en cargas de razonamiento, lo que hace viable un asistente conversacional local con respuestas de 256 tokens en torno a 8 segundos.
- Generación de código en un flujo de desarrollo local: la carga de código rinde 26,80 tok/s con `n-max 1` frente a 24,09 tok/s sin draft; el modelo puede integrarse en un servidor `llama-server` compatible con la API de endpoints para autocompletado y generación de parches.
- Producción de JSON estructurado para pipelines de datos: la carga JSON mantiene 27,24 tok/s con `n-max 1`, adecuada para extracción y transformación de registros por lotes con salida validable.
- Resumen de documentos extensos: el contexto verificado hasta 128K y configurable hasta 262 144 tokens permite procesar informes, actas o expedientes completos en una sola pasada, con la advertencia de que la decodificación especulativa apenas aporta en esta carga (+1 %).
- Investigación sobre alineación y comportamiento sin rechazo: al ser un artefacto declarado de investigación, sirve para estudiar cómo varía la distribución de respuestas al retirar las barreras de negativa, en entornos controlados y con revisión humana de la salida.
- Evaluación de cuantización FP4 en ROCm: el repositorio y sus parches permiten medir el impacto de los tipos ROCmFP4 en calidad y velocidad sobre gfx1151, comparando con otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de decodificación (no de calidad) en gfx1151 con ROCm 7.2.4, mediana de 3 ejecuciones por celda, un solo binario, greedy, `cache_prompt:false`, 256 tokens generados, `-c 2048` y cabeza Q8_0:

| Carga | Sin draft (tok/s) | `--spec-draft-n-max 4` | `--spec-draft-n-max 1` |
|---|---|---|---|
| Razonamiento | 23,91 | 30,94 (+29 %, acc. 0,680) | 31,94 (+34 %, acc. 0,945) |
| Salida JSON | 23,99 | 28,31 (+18 %, acc. 0,597) | 27,24 (+14 %, acc. 0,758) |
| Código | 24,09 | 21,56 (−10 %, acc. 0,422) | 26,80 (+11 %, acc. 0,711) |
| Resumen de documento largo | 23,80 | 20,36 (−14 %, acc. 0,352) | 24,14 (+1 %, acc. 0,641) |

Una medición anterior con un único prompt de tipo razonamiento daba 31,80 tok/s frente a 24,9 tok/s (+27,7 %) con aceptación 0,94. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio GGUF ocupa 95,3 GB, por lo que se necesita un sistema con al menos esa capacidad disponible para los pesos, más espacio para caché KV y contexto. Las pruebas del autor se hicieron en un Ryzen AI Max+ 395 con memoria unificada.
- GPU objetivo: AMD gfx1151 (iGPU de Ryzen AI Max+ 395), con compilación específica `-DGPU_TARGETS=gfx1151`. No se documenta compatibilidad con otras GPU AMD ni con NVIDIA.
- GPU de consumo discreta: no cabe en ninguna GPU de consumo actual por el tamaño de los pesos; no se ha verificado su funcionamiento en A100 ni H100 y la ruta de compilación documentada es exclusivamente HIP/ROCm.
- Despliegue: exclusivamente mediante el fork `kingjones30/ROCmFPX` de llama.cpp (rama `main`), compilando `llama-server` y `llama-quantize` con `-DGGML_HIP=ON`. El llama.cpp estándar no carga estos ficheros porque carece de la arquitectura `qwen4exp`.
- Parches obligatorios: `qwen4exp-qsa-checkpoint-fix.patch` siempre, y `qwen4exp-mtp-graph-fork.patch` si se compila desde un clon de `kingjones30/ROCmFPX` y se quiere usar `--spec-type draft-mtp`.
- Latencia y throughput: 23,9 a 31,9 tok/s en decodificación según carga y configuración de draft; el autor advierte que MTP reduce la velocidad de prefill porque la cabeza de draft también procesa el prompt.
- Configuración recomendada: `-ngl 999 -fa on -np 1 -c 32768 --jinja`, con `-np 1` obligatorio al usar `draft-mtp`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (ROCmFP4 FAST GGUF) | 176,9 B | hasta 262 144 (verificado a 128K) | GGUF ROCmFP4, gfx1151 | qwen-community-1.0 | Sin rechazo; requiere fork de llama.cpp y parches |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | no disponible | safetensors y otras cuantizaciones | qwen-community-1.0 | Modelo original con alineación intacta; sin dependencia de fork |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | 176,9 B | no disponible | no disponible | no disponible | Variante sin rechazo previa a la cuantización |
| Otras cuantizaciones GGUF del mismo modelo base | 176,9 B | según configuración | GGUF estándar (llama.cpp upstream) | qwen-community-1.0 | Compatibles con llama.cpp estándar; sin tipos ROCmFP4 |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación sin barreras de rechazo: el autor indica explícitamente que se ha eliminado el comportamiento de negativa, que esto no añade capacidad y que el usuario debe asumir la responsabilidad de la salida.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación; al tratarse de una variante sin alineación de rechazo, la verificación humana de afirmaciones factuales es imprescindible.
- Dependencia de un fork no oficial: el modelo no carga en llama.cpp estándar; requiere compilar `kingjones30/ROCmFPX` con parches aplicados manualmente, lo que introduce riesgo de mantenimiento y de divergencia con upstream.
- Parches con historial de errores: el autor advierte que una versión anterior de `qwen4exp-mtp-graph.patch` aplicaba limpiamente pero fallaba al compilar (`'graph_mtp' was not declared in this scope`); es necesario usar la versión actualizada del 17 de septiembre.
- Cobertura de verificación parcial: los pasos de compilación de la model card se verificaron hasta 16K, mientras que la prueba hasta 128K se hizo con el árbol propio del autor. El rendimiento MTP de este nivel concreto no se ha medido y las cabezas Q6_K y Q4 no se han evaluado.
- Configuración sensible: `--spec-draft-n-max 4` empeora el rendimiento en código (−10 %) y en resumen de documentos largos (−14 %); se recomienda `n-max 1`. MTP también penaliza el prefill.
- Idiomas soportados no disponibles: no se documenta la cobertura lingüística, lo que impide garantizar calidad en castellano.
- Licencia: qwen-community-1.0 con etiqueta `license: other`; no se detallan en la información disponible las restricciones concretas para uso comercial, por lo que deben revisarse los términos de la licencia Qwen Community antes de un despliegue en producción.
- Hardware muy restringido: sin verificación en NVIDIA ni en otras GPU AMD; el tamaño de 95,3 GB descarta GPU de consumo con VRAM discreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante sin rechazo previa: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Cabezas MTP: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Fork de llama.cpp con ROCmFP4 y `qwen4exp`: https://github.com/kingjones30/ROCmFPX
- Repositorio ROCmFPX upstream: https://github.com/charlie12345/ROCmFPX
