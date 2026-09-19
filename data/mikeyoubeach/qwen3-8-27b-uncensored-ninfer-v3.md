# mikeyoubeach/qwen3.8-27b-uncensored-ninfer-v3

## Resumen

Este repositorio publica un artefacto cuantizado del modelo Qwen3.8-27B en el contenedor nativo v3 de NInfer (extensión `.ninfer`), con un perfil de pesos de precisión mixta NVFP4/FP8 y las cabezas de decodificación especulativa DFlash2 y MTP junto con la torre de visión preservadas. Se trata de una versión "abliterated" (dirección de rechazo eliminada del flujo residual), es decir, con el alineamiento de seguridad sustancialmente recortado respecto al modelo base. El autor del repositorio es mikeyoubeach, que publica una actualización de contenedor (v2 a v3) de un artefacto comunitario previo; no se han modificado, recuantizado ni ajustado los pesos.

El modelo base es Qwen/Qwen3.8-27B (Apache-2.0), sobre el que OrcaRouter aplicó la abliteración en pesos BF16 y empaquetó los pesos NVFP4/FP8 en un artefacto `.ninfer` v2, que ahora se ha migrado al formato de contenedor v3 que exige el motor NInfer actual. El resultado es un único fichero de 23.719.759.856 bytes (22,09 GiB) con 1190 objetos y 1184 tensores, que incluye los componentes `text`, `vision`, `mtp`, `dflash2` y una cabeza de propuesta optimizada. La inspección del artefacto reporta una torre de texto `Qwen3_5ForCausalLM` de 64 capas, dimensión oculta 5120 y `max_position_embeddings` de 262144 (256K tokens).

Su relevancia es acotada pero concreta: permite ejecutar un modelo multimodal de ~27B con decodificación especulativa en una única GPU de consumo de gama alta (RTX 5090, arquitectura Blackwell) sin salir del ecosistema NInfer, algo que no cubren otros runtimes habituales. En contrapartida, el repositorio acumula 1 descarga y 1 "like", no tiene benchmarks medidos para este fichero concreto y depende de un motor que hay que compilar desde fuente. La información pública no incluye ficha técnica detallada del Qwen3.8-27B subyacente (composición del dataset, número de tokens de entrenamiento o etapas de RLHF/DPO), por lo que esos apartados quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); clase de la torre de texto `Qwen3_5ForCausalLM`, 64 capas, dimensión oculta 5120; incluye torre de visión y cabezas de decodificación especulativa MTP y DFlash2 |
| Parámetros totales | 27B (según la denominación del modelo base Qwen/Qwen3.8-27B; no se publica desglose detallado) |
| Parámetros activos | No aplica (la información disponible no indica que la arquitectura sea MoE) |
| Longitud de contexto | 262144 tokens (`max_position_embeddings`) = 256K; en la práctica limitado por VRAM (128K con KV en FP8 como punto de partida en una GPU de 32 GB) |
| Tipos de cuantización | Pesos NVFP4/FP8 en precisión mixta; KV cache en FP8 (recomendado). No es intercambiable con artefactos `groupwise-int` |
| Idiomas soportados | Inglés (en) y chino (zh), según los metadatos del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor propietario NInfer v3 (`.ninfer`, cabecera `NINFER\x00\x03`); 1 fichero `qwen3_8_27b_nvfp4_uncensored_v3.ninfer`, 1184 tensores / 1190 objetos, 23.719.759.856 bytes (22,09 GiB) |
| Autor / repositorio | mikeyoubeach |
| Modelos base | Qwen/Qwen3.8-27B y orcarouter/Qwen3.8-27B-Uncensored (relación: `quantized`); procedencia intermedia: orcarouter/Qwen3.8-27B-Uncensored-NVFP4 y JMVRoill/Qwen3.8-27B-Uncensored-nvfp4-NInfer |
| Motor / librería | NInfer (compilado desde fuente); `library_name: ninfer` |
| Hardware objetivo | NVIDIA RTX 5090 (Blackwell, `sm_120a`) |
| TRL de publicación | Creado el 2026-09-19, actualizado el 2026-09-19; 1 descarga y 1 "like" |
| Tamaño del repositorio | 47,4 GB en HuggingFace (incluye más de un fichero; el artefacto v3 ocupa 22,09 GiB) |
| SHA-256 del artefacto | `d92051ef12c629f2bda98be4ec19059f4556415aa9bfffb0f0bd5d836a32f2d0` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen3.8-27B, un transformer multimodal con torre de texto de 64 capas y dimensión oculta 5120, más una torre de visión que permite entrada de imagen y vídeo (pipeline `image-text-to-text`). Sobre esa base, el artefacto incorpora dos mecanismos de decodificación especulativa: cabezas MTP (multi-token prediction) y DFlash2, junto con una cabeza de propuesta optimizada. La inspección del contenedor confirma la presencia de los componentes `text`, `vision`, `mtp` y `dflash2`, de modo que tanto la decodificación especulativa como la entrada de imagen/vídeo están operativas en el motor NInfer.

No se dispone de información sobre el entrenamiento del modelo base: no se documentan el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras formas de ajuste por preferencias. Lo que sí se documenta con precisión es el proceso de transformación posterior. OrcaRouter aplicó la abliteración sobre los pesos BF16 eliminando la dirección de rechazo del flujo residual (ortogonalizándola), y después empaquetó los pesos de texto en un perfil NVFP4/FP8 de precisión mixta. El autor de este repositorio ejecutó únicamente la migración de contenedor v2 a v3 mediante la herramienta oficial `tools/upgrade_ninfer_v2_to_v3.py` del proyecto Neroued/ninfer, que reescribe el directorio de framing/metadatos e instala la plantilla de chat `qwen3_8.jinja` mantenida, preservando los valores y formatos de los pesos byte a byte. El fichero resultante es 263.664 bytes mayor que la fuente v2 (solo metadatos y plantilla). La migración se ejecutó en Windows, lo que requirió cuatro adaptaciones de compatibilidad en la herramienta (`os.posix_fadvise`/`POSIX_FADV_*` como no-op, `os.fdatasync` a `os.fsync`, `os.sysconf("SC_PAGE_SIZE")` a 4096 y emulación de `os.pread`/`os.pwrite` con `lseek` más `read`/`write`), que afectan solo a indicaciones de durabilidad y patrones de acceso, no al contenido del artefacto.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento y generación de código como parte del modelo base Qwen3.8-27B (sin benchmarks específicos publicados para este artefacto).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con la torre de visión preservada en el contenedor.
- Entrada de vídeo, según la indicación del propio autor de que "image/video input" están disponibles al mantenerse el componente de visión.
- Decodificación especulativa integrada: modo DFlash2 (`--spec dflash2 --draft-tokens 7 --lm-head-draft`) y modo MTP (`--spec mtp --draft-tokens 3`).
- Servicio con API compatible con OpenAI/Anthropic mediante el binario `ninfer-serve`, con parámetros de contexto, capacidad de KV y tipo de KV configurables.
- Procesamiento por lotes de hasta 1 a 8 peticiones activas por proceso (una única instancia de Engine por proceso, un modelo por GPU).
- Gestión de contexto largo: hasta 256K tokens en la configuración del modelo, ajustable en el servidor mediante `--max-context` con `--kv-dtype fp8`.
- Capacidad de generación sin restricciones de contenido derivada de la abliteración (el autor etiqueta el repositorio como `not-for-all-audiences`).

## Casos de uso

- Asistente conversacional sin filtros de rechazo: útil en entornos de investigación sobre alineación y seguridad donde se necesita medir el comportamiento de un modelo con la dirección de rechazo eliminada, comparándolo con la versión BF16 abliterada de origen y con el modelo base sin modificar.
- Análisis de imágenes y documentos escaneados: la torre de visión permite pasar imágenes junto al texto en el mismo prompt y obtener descripciones o extracciones en inglés o chino, sin depender de un pipeline OCR separado.
- Procesamiento de vídeo con contexto largo: gracias a la ventana configurable (hasta 128K tokens con KV FP8 en 32 GB de VRAM) se pueden resumir transcripciones o secuencias largas manteniendo coherencia a lo largo de la sesión.
- Servicio local compatible con OpenAI para desarrollo de aplicaciones: `ninfer-serve` expone una API que permite sustituir un endpoint remoto por una instancia local en una RTX 5090, útil para prototipado sin coste por token.
- Evaluación de cuantización NVFP4 frente a BF16: el artefacto permite medir en la práctica la pérdida de calidad documentada por el proyecto NInfer (aproximadamente 1-3 puntos en benchmarks de razonamiento exigente y casi nula en chat y código general) dentro del propio flujo de trabajo.
- Generación de código y tareas de razonamiento en local: para equipos que necesitan inferencia en máquina propia con datos que no pueden salir del entorno, siempre que dispongan de una GPU Blackwell y acepten el coste de rendimiento asociado a la cuantización de 4 bits.
- Pruebas de decodificación especulativa: comparar el rendimiento y la calidad de salida entre el modo DFlash2 con K=7 y el modo MTP con 3 tokens de borrador sobre el mismo artefacto, para calibrar la configuración óptima por tipo de carga.
- Investigación sobre contenido sensible en un entorno controlado y aislado, dado que el modelo no aplica rechazos, teniendo en cuenta las advertencias legales y éticas indicadas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este fichero concreto. El autor indica explícitamente que el artefacto "no está medido" y aporta cifras de referencia del artefacto NVFP4 oficial del modelo no abliterado, medidas por el proyecto NInfer sobre hardware de la misma clase (una única RTX 5090) y reproducidas de forma independiente:

| Métrica (referencia del proyecto NInfer, no medida sobre este fichero) | Valor |
|---|---|
| Decodificación sin especulación | ~80 tok/s |
| Decodificación con DFlash2 K=7 | ~130-220 tok/s según la carga |
| Prefill | rango de varios miles de tok/s |
| Pérdida de calidad frente a BF16 (perfil NVFP4) | ~1-3 puntos en benchmarks de razonamiento exigente; casi nula en chat y código general |

Estas cifras proceden del artefacto NVFP4 no abliterado y se ofrecen como orden de magnitud esperado, no como medición de `qwen3_8_27b_nvfp4_uncensored_v3.ninfer`. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada para este repositorio, por lo que no se incluyen cifras de ese tipo.

## Requisitos de hardware

- VRAM estimada: ~22 GiB de pesos más la cabeza especulativa y la torre de visión, lo que suma aproximadamente 24 GiB antes de la caché KV. En una tarjeta de 32 GB, el autor recomienda arrancar con 128K de contexto y KV en FP8 y subir `--max-context` hasta que el arranque deje de caber.
- GPU requerida: NVIDIA RTX 5090 (Blackwell, `sm_120a`). NVFP4 necesita tensor cores FP4, de modo que el artefacto no arranca en GPUs anteriores a Blackwell (no es compatible con A100, H100, RTX 4090 ni generaciones previas).
- Cabe en GPU de consumo: sí, únicamente en la RTX 5090 (32 GB) dentro de la gama consumer; no cabe en GPUs de 24 GB por el tamaño del conjunto de pesos más caché.
- Sistema y cadena de compilación: Linux de 64 bits, CUDA toolkit 13.1 o superior, y NInfer compilado desde fuente con CMake 3.28+, C++20, Ninja, `pkg-config`, bibliotecas de desarrollo de FFmpeg y libcurl 7.85 o superior.
- Opciones de despliegue: el contenedor `.ninfer` v3 solo carga en el motor NInfer; se dispone de dos binarios, `ninfer` (generación puntual por línea de comandos) y `ninfer-serve` (servidor compatible con OpenAI/Anthropic). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros runtimes habituales.
- Limitación de escalado: un único Engine por proceso (un modelo, una GPU) y una capacidad de 1 a 8 peticiones activas; no hay despliegue multi-GPU documentado.
- Latencia y throughput estimados: ~80 tok/s en decodificación sin especulación y ~130-220 tok/s con DFlash2 K=7, con prefill en el rango de varios miles de tok/s, según la referencia del mismo hardware y perfil de cuantización (cifras no medidas sobre este fichero).

## Comparativa con modelos similares

No se han encontrado en la búsqueda web modelos comparables; los resultados devueltos no guardan relación con el ámbito de este artefacto. La comparación se limita por tanto a las variantes documentadas en la propia model card, todas ellas derivadas del mismo Qwen3.8-27B.

| Modelo / artefacto | Parámetros | Contexto | Cuantización y formato | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|---|
| Este artefacto: `qwen3.8-27b-uncensored-ninfer-v3` | 27B | 256K (limitado por VRAM en la práctica) | NVFP4/FP8, contenedor `.ninfer` v3 (1184 tensores, 22,09 GiB) | No medido; se esperan ~80 tok/s sin especulación y ~130-220 tok/s con DFlash2 K=7 | Apache-2.0 | Publicado el 2026-09-19; 1 descarga, 1 "like" |
| `JMVRoill/Qwen3.8-27B-Uncensored-nvfp4-NInfer` (v2) | 27B | Igual que el base | NVFP4/FP8, contenedor `.ninfer` v2; SHA-256 `43025bb6...` | Igual (pesos idénticos, byte a byte) | Apache-2.0 | Fuente directa del artefacto v3; no carga en el motor NInfer actual, que exige v3 |
| Artefacto NVFP4 oficial del modelo no abliterado (proyecto NInfer) | 27B | Igual que el base | NVFP4/FP8, contenedor NInfer | ~80 tok/s sin especulación, ~130-220 tok/s con DFlash2 K=7 (medido) | Apache-2.0 | Referencia de rendimiento citada; sin abliteración |
| `orcarouter/Qwen3.8-27B-Uncensored` | 27B | Igual que el base | BF16 (empaquetado NVFP4/FP8 disponible en el repositorio `-NVFP4` del mismo autor) | No publicado | Apache-2.0 | Pesos abliterados de origen, previos al empaquetado |
| `Qwen/Qwen3.8-27B` (base) | 27B | 256K | Formato de pesos no especificado en la información disponible | No publicado en la información disponible | Apache-2.0 | Modelo original sin abliterar |

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: la abliteración ortogonaliza la dirección de rechazo fuera del flujo residual, de modo que el modelo no aplica negativas ante peticiones dañinas o sensibles. El repositorio lleva las etiquetas `uncensored`, `abliterated` y `not-for-all-audiences`.
- Responsabilidad de uso: al no existir filtro interno, cualquier salvaguarda debe implementarse en la capa de aplicación (moderación de entrada y salida); el autor no ofrece ninguna.
- Sin evaluación de calidad propia: no hay benchmarks medidos para este fichero. La referencia de pérdida de 1-3 puntos frente a BF16 en razonamiento exigente procede de otro artefacto (el NVFP4 no abliterado) y debe tratarse como orientativa.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en la información disponible; la decodificación especulativa con cabezas de borrador puede además introducir divergencias respecto a la decodificación estándar, aunque el autor no reporta métricas al respecto.
- Compatibilidad de hardware muy restringida: requiere tensor cores FP4 (Blackwell, `sm_120a`), por lo que no arranca en A100, H100 ni RTX 4090; el artefacto no es intercambiable con los de perfil `groupwise-int`.
- Dependencia de un runtime concreto: solo funciona en NInfer, que hay que compilar desde fuente en Linux de 64 bits con CUDA 13.1+; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Sin escalado horizontal: un Engine por proceso, un modelo por GPU y entre 1 y 8 peticiones activas; no se documenta despliegue multi-GPU.
- Techo de contexto dependiente de VRAM: aunque el modelo declara 256K tokens, con 22 GiB de pesos el autor sitúa 128K con KV en FP8 como punto de partida razonable en 32 GB.
- Idiomas limitados: solo inglés y chino en los metadatos; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Adopción y validación comunitarias mínimas: 1 descarga y 1 "like", autor individual, sin validación por parte de Alibaba/Qwen. Debe considerarse un artefacto de terceros.
- Procedencia en cadena: los pesos han pasado por al menos cuatro repositorios y herramientas (Qwen, OrcaRouter, JMVRoill, Neroued/ninfer); la trazabilidad depende de los SHA-256 publicados.
- Model card incompleta: el texto del autor se corta en la sección de descargo de responsabilidad, por lo que puede faltar información adicional sobre limitaciones y condiciones de uso.
- Licencia: Apache-2.0, que permite uso comercial, pero la licencia del modelo base no cubre el comportamiento derivado de la eliminación de salvaguardas; conviene revisar las obligaciones de atribución (la model card incluye el aviso de la sección 4(b) de Apache-2.0 sobre los cambios realizados).
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido enciclopédico sobre Kosovo), por lo que no aportan documentación adicional ni referencias externas verificables.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mikeyoubeach/qwen3.8-27b-uncensored-ninfer-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos abliterados (BF16) de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Pesos NVFP4/FP8 empaquetados de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Artefacto `.ninfer` v2, fuente directa de este fichero: https://huggingface.co/JMVRoill/Qwen3.8-27B-Uncensored-nvfp4-NInfer
- Motor NInfer (herramienta `tools/upgrade_ninfer_v2_to_v3.py`): https://github.com/Neroued/ninfer
- Repositorio de herramientas del proyecto NInfer: https://github.com/Neroued/ninfer
