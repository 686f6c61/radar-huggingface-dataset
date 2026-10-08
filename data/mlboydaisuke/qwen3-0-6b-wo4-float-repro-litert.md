# mlboydaisuke/Qwen3-0.6B-wo4-float-repro-LiteRT

## Resumen

Este repositorio no contiene un modelo utilizable, sino un caso de prueba reproducible de un fallo (bug) en el runtime LiteRT-LM de Google. Lo publica el usuario mlboydaisuke con el identificador `mlboydaisuke/Qwen3-0.6B-wo4-float-repro-LiteRT` y su unico artefacto es `qwen3-0.6b_weight_only_wi4_afp32.litertlm`, un bundle de 315.697.136 bytes (unos 0,29 GiB) exportado a partir del modelo base Qwen/Qwen3-0.6B mediante litert-torch 0.9.3 con receta de cuantizacion `weight_only_wi4_afp32`.

El problema que documenta es un SIGSEGV (`EXC_BAD_ACCESS`, `KERN_INVALID_ADDRESS` en la direccion 0x0) al ejecutar `litert-lm run <bundle> --backend gpu` en macOS, tanto en LiteRT-LM 0.17.1 como en 0.18.0. Las trazas de fallo sitúan el frame 0 en `_platform_memmove+52` y el frame 1 en `EmbeddingLookupOperationParser::Parse(...)+1888`, lo que apunta a la ruta de desquantizacion explicita: en el subgrafo `prefill_128` (1.493 operaciones) hay 192 operaciones DEQUANTIZE con entradas int4 y la tabla EMBEDDING_LOOKUP es la salida float32 de una de ellas.

Su relevancia es, por tanto, puramente de ingenieria de runtimes: sirve como reproduccion minima para quien depure LiteRT-LM en GPU, y como contraejemplo practico de que las recetas de cuantizacion del mismo tipo (`dynamic_wi8_afp32`, `dynamic_wi4_afp32`) no fallan mientras que `weight_only_wi4_afp32` si lo hace. No debe emplearse para inferencia ni para evaluar la calidad del modelo Qwen3-0.6B, ya que su propia model card lo declara "a test case and is not meant for use".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen/Qwen3-0.6B; grafo exportado a LiteRT en forma de desquantizacion explicita |
| Parametros totales | Aproximadamente 0,6 mil millones (corresponden al modelo base Qwen/Qwen3-0.6B; el repositorio no publica el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens de cache en el bundle (`--cache_length=1024`); la ventana nativa del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | `weight_only_wi4_afp32` (pesos int4, activaciones float32); recetas relacionadas citadas: `dynamic_wi8_afp32` y `dynamic_wi4_afp32` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 0,3 GB |
| Libreria | litert-lm |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-0.6B, un transformer decoder-only denso que el autor no modifica ni reentrena: el repositorio solo contiene el resultado de exportar esos pesos con `python -m litert_torch.generative.export_hf Qwen/Qwen3-0.6B <out dir> --quantization_recipe=weight_only_wi4_afp32 --prefill_lengths=128 --cache_length=1024`. No hay, por tanto, informacion sobre numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, y el repositorio no documenta ninguna innovacion de arquitectura propia.

El detalle tecnicamente relevante esta en el grafo generado. El bundle usa una formulacion de desquantizacion explicita: en el subgrafo `prefill_128`, compuesto por 1.493 operaciones, 192 operaciones DEQUANTIZE reciben entradas int4 y la tabla de EMBEDDING_LOOKUP es la salida float32 de una de esas desquantizaciones. Las trazas de fallo (`crash-litert-lm-0.17.1.ips` y `crash-litert-lm-0.18.0.ips`) muestran que el parser `EmbeddingLookupOperationParser::Parse` desreferencia memoria no valida en esa configuracion concreta cuando el backend seleccionado es la GPU, mientras que el backend de CPU completa la ejecucion sin error.

## Capacidades

- No es un modelo destinado a uso: la propia model card indica que el bundle es un caso de prueba y que no esta pensado para emplearse.
- Reproduccion de fallo: permite reproducir de forma determinista el SIGSEGV de LiteRT-LM en backend GPU en las versiones 0.17.1 y 0.18.0.
- Diferenciacion de recetas de cuantizacion: sirve para contrastar `weight_only_wi4_afp32` (falla en GPU) frente a `dynamic_wi8_afp32` y `dynamic_wi4_afp32` (completan con exito en 0.17.1).
- Verificacion cruzada de backend: el mismo bundle termina con codigo de salida 0 en `--backend cpu` en ambas versiones del runtime.
- Integridad verificable: se publica el hash sha256 del bundle, lo que permite comprobar que la reproduccion se hace sobre el artefacto exacto.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling o capacidades de agente: no disponibles en este repositorio; en su caso dependerian del modelo base Qwen3-0.6B, no evaluado aqui.

## Casos de uso

- Depuracion del runtime LiteRT-LM: cargar el bundle con `--backend gpu` para obtener una traza reproducible del SIGSEGV y validar la correccion del parche que resuelva el issue #2716.
- Prueba de regresion en integracion continua del runtime: fijar este bundle y su sha256 como caso de test que debe dejar de provocar SIGSEGV a partir de la version que incluya la correccion.
- Aislamiento de la causa raiz en la ruta de desquantizacion: inspeccionar las 192 operaciones DEQUANTIZE del subgrafo `prefill_128` para determinar por que la tabla EMBEDDING_LOOKUP recibe una salida float32 de una desquantizacion int4 y como la trata `EmbeddingLookupOperationParser::Parse`.
- Comparacion de recetas de cuantizacion: exportar el mismo modelo base con `dynamic_wi8_afp32` y `dynamic_wi4_afp32` para acotar que propiedad concreta de `weight_only_wi4_afp32` desencadena el fallo.
- Validacion de portabilidad entre backends: ejecutar el bundle en CPU y en GPU sobre el mismo equipo para documentar la divergencia de comportamiento entre ambos caminos de ejecucion.
- Referencia para herramientas de exportacion: usar el grafo resultante como caso de prueba al modificar litert-torch o ai-edge-quantizer, comprobando que la forma del grafo y el numero de operaciones se mantienen estables.
- Formacion interna sobre runtimes on-device: emplearlo como ejemplo didactico de como un grafo teoricamente valido puede desencadenar un fallo de memoria especifico de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de referencia, y no seria metodologicamente valido extrapolar los del modelo base.

Lo unico que se publica es una matriz de compatibilidad del bundle con el runtime:

| Receta (Qwen/Qwen3-0.6B) | `--backend cpu` | `--backend gpu` |
|---|---|---|
| `weight_only_wi4_afp32` (este bundle) | exit 0 en 0.17.1 y 0.18.0 | SIGSEGV (exit 245) en 0.17.1 y 0.18.0 |
| `dynamic_wi8_afp32` (no incluida en el repositorio) | no disponible | exit 0 en 0.17.1 |
| `dynamic_wi4_afp32` (no incluida en el repositorio) | no disponible | exit 0 en 0.17.1 |

Entorno de las pruebas: macOS 27.0 sobre Apple M4 Max.

## Requisitos de hardware

- VRAM estimada: el bundle pesa 315.697.136 bytes (unos 0,29 GiB); con pesos int4 y activaciones float32, el consumo en runtime sera superior al tamano del fichero y no se cuantifica en la informacion disponible.
- GPU recomendadas: no disponible. La unica plataforma documentada es Apple M4 Max, y precisamente su backend GPU es el que falla.
- Compatibilidad con GPU de consumo: el fallo se reproduce en hardware Apple Silicon de gama alta (M4 Max); no se documentan pruebas en RTX 4090, A100, H100 ni otras GPU.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (`litert-lm run <bundle> --backend cpu|gpu`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no consumen el formato `.litertlm`.
- Latencia y throughput: no disponibles. No se publican mediciones de tok/s ni de tiempo hasta el primer token, ni siquiera en los casos que terminan con exito.
- Entorno validado: macOS 27.0 en Apple M4 Max, con LiteRT-LM 0.17.1 y 0.18.0. La ruta estable es `--backend cpu`; la ruta `--backend gpu` provoca SIGSEGV (exit 245).

## Comparativa con modelos similares

| Modelo o artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlboydaisuke/Qwen3-0.6B-wo4-float-repro-LiteRT` (este repositorio) | ~0,6 mil millones (modelo base) | 1.024 tokens de cache en el bundle | SIGSEGV en GPU, exit 0 en CPU; sin benchmarks publicados | Apache 2.0 | HuggingFace, 0 descargas, 0 likes; uso no recomendado |
| `Qwen/Qwen3-0.6B` | ~0,6 mil millones | no disponible en la informacion recogida | no disponible | no disponible en la informacion recogida | Modelo base publico en HuggingFace |
| Export `dynamic_wi4_afp32` del mismo modelo base | ~0,6 mil millones | no disponible | exit 0 en GPU con LiteRT-LM 0.17.1 | Apache 2.0 (heredada del modelo base) | No incluida en este repositorio |
| Export `dynamic_wi8_afp32` del mismo modelo base | ~0,6 mil millones | no disponible | exit 0 en GPU con LiteRT-LM 0.17.1 | Apache 2.0 (heredada del modelo base) | No incluida en este repositorio |
| `mlboydaisuke/qwen3-0.6b-CoreAI-official` | derivado de Qwen3-0.6B | no disponible | export oficial de Apple Core AI, con rendimiento medido y publicado por el autor | no disponible | HuggingFace |

La comparacion realmente significativa aqui no es entre modelos, sino entre recetas de exportacion del mismo modelo base: las variantes dinamicas funcionan en GPU y la variante `weight_only_wi4_afp32` no.

## Limitaciones y advertencias

- El artefacto no debe usarse para inferencia: la model card indica de forma explicita que es un caso de prueba y que no esta pensado para ser utilizado.
- Sesgos conocidos: no disponibles. No se ha realizado ninguna evaluacion del comportamiento del modelo, porque el objetivo del repositorio es otro.
- Riesgo de alucinacion: no evaluado. Cualquier afirmacion al respecto correspondiente al modelo base no esta respaldada por datos de este repositorio.
- Fallo reproducible en GPU: `--backend gpu` provoca SIGSEGV con exit 245 en LiteRT-LM 0.17.1 y 0.18.0 sobre macOS 27.0 y Apple M4 Max; el fallo esta localizado en `EmbeddingLookupOperationParser::Parse`.
- Limitacion de contexto: el bundle se exporto con `--cache_length=1024` y `--prefill_lengths=128`, de modo que su operativa queda acotada a esa configuracion.
- Limitaciones de idioma: no disponibles; no se documenta el soporte multilingue del bundle.
- Restricciones de licencia: Apache 2.0, sin restriccion conocida para uso comercial, pero esto se aplica al modelo base y no convierte este artefacto en apto para produccion.
- Caveat de produccion: un bundle con desquantizacion explicita puede comportarse de forma distinta segun el backend; validar siempre en el backend objetivo antes de dar por buena una exportacion.
- Ausencia de mantenimiento: 0 descargas y 0 likes, creado y actualizado el mismo dia; no hay indicios de soporte continuado.
- Dependencia de versiones: el comportamiento observado esta ligado a LiteRT-LM 0.17.1 y 0.18.0, litert-torch 0.9.3 y ai-edge-quantizer 0.8.0.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-wo4-float-repro-LiteRT
- Issue de LiteRT-LM #2716: https://github.com/google-ai-edge/LiteRT-LM/issues/2716
- Repositorio de LiteRT: https://github.com/google-ai-edge/litert
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio relacionado del mismo autor (export oficial Core AI): https://huggingface.co/mlboydaisuke/qwen3-0.6b-CoreAI-official
- Visualizacion del grafo del modelo base: https://hfviewer.com/Qwen/Qwen3-0.6B
- Guia de la familia Qwen 3: https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
- Entrada sobre Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
