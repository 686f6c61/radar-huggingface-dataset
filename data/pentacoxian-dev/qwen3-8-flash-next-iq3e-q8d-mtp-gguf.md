# pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF de un solo archivo del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario pentacoxian-dev. No se trata de un modelo entrenado desde cero, sino de una mezcla de cuantizaciones ensamblada a partir de los GGUF de unsloth y del checkpoint original de Qwen: los expertos enrutados usan UD-IQ3_XXS, los tensores densos no expertos son Q8_0, y se ha reconstruido la cabecera de prediccion multi-token (MTP, tensores `nextn`) en Q8_0, que los GGUF de unsloth no incluyen. El resultado es un archivo de 85.923.705.344 bytes (unos 80 GiB) con arquitectura declarada `qwen4exp` y 180.186.749.568 parametros totales.

El objetivo declarado es ejecutar el modelo en dos Nvidia Tesla V100 de 32 GB (sm_70), repartiendo las 640 columnas de expertos a partes iguales (320 + 320) mediante `--split-mode tensor`. La inclusion de la cabecera MTP permite decodificacion especulativa en llama.cpp, y el autor publica parches propios que anaden soporte para la arquitectura, el reparto tensorial con AllReduce en grafo y kernels optimizados para Volta.

Su relevancia es de nicho pero clara: es una de las pocas vias documentadas para servir un modelo de clase 180B en hardware Volta de segunda mano, con entrada de imagen a contexto completo de 256K en la version v3 del parche. El coste es una dependencia estricta de un llama.cpp parcheado en su version v0.5.0: ni el llama.cpp oficial, ni Ollama, ni LM Studio pueden cargar el archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (MoE con cabecera de prediccion multi-token MTP/`nextn`), segun la model card |
| Parametros totales | 180.186.749.568 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K), segun la model card |
| Tipos de cuantizacion | Mixta: `UD-IQ3_XXS` en expertos enrutados, `Q8_0` en tensores densos y cabecera MTP, `Q4_0` en la cabeza LM solo para borradores MTP, `Q6_K` en la cabeza de salida del modelo objetivo |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | GGUF de un solo archivo (`Qwen3.8-Flash-Next-IQ3E-Q8D-MTP.gguf`) |
| Tamano del archivo | 85.923.705.344 bytes (aproximadamente 80 GiB) |
| Tamano del repositorio | 85,9 GB |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Modalidad | Texto; imagenes con el proyector de vision de unsloth (no incluido en el repositorio) |
| Descargas / likes | 356 / 12 |
| Fechas | Creado el 2026-09-24, actualizado el 2026-09-26 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base dentro de la informacion proporcionada; esta ficha describe exclusivamente el repositorio de cuantizacion. El modelo subyacente es un transformer disperso (MoE) con 180.186.749.568 parametros totales, segun los datos de safetensors del checkpoint original. La cuantizacion anade de vuelta la cabecera MTP, que se convierte por separado con `convert_hf_to_gguf.py --mtp` transmitiendo unicamente los tensores `mtp.*` (unos 8 GB) desde la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540` del checkpoint de Qwen, y se cuantiza a Q8_0 antes de anexarla al tronco.

El ensamblaje mezcla procedencias: expertos enrutados y tabla de embeddings por capa (PLE) de `UD-IQ3_XXS`; resto de tensores no expertos de `UD-IQ4_XS` (cuyos densos son Q8_0, mas rapidos que Q6_K en GEMV de lote pequeno sobre V100); revision de los GGUF de unsloth `c8b5954a88c2775c546b92593eda40ea041d3176`. La innovacion tecnica principal es el parche de llama.cpp, que aporta soporte `qwen4exp` con el port de MoE FreeToken (fuentes Apache-2.0), decodificacion especulativa MTP, atencion dispersa QSA, kernels fusionados, argmax en GPU y `--split-mode tensor` con AllReduce en grafo que escribe directamente en la GPU par a traves de NVLink o PCIe peer-to-peer. La version v3 anade entrada de imagen a 256K de contexto cargando el codificador de vision bajo demanda (presta 2 GB de pesos en la GPU 0 y los libera durante la codificacion), MTP con imagenes y la correccion de una condicion de carrera en un kernel fusionado que producia NaN en contextos largos con imagen.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`), con la capacidad del modelo base, no evaluada en esta ficha.
- Decodificacion especulativa mediante cabecera MTP integrada, con una cabeza LM de borrador en Q4_0 separada de la cabeza de salida Q6_K del modelo objetivo.
- Entrada de imagen con el proyector de vision de unsloth, que no se distribuye en este repositorio; requiere el parche v3 y contexto de hasta 256K.
- Contexto largo de hasta 262.144 tokens, con atencion dispersa QSA y camino rapido para contextos que contienen imagenes.
- Reparto tensorial entre dos GPU con AllReduce en grafo y split uniforme de expertos (320 + 320 columnas de 640).
- Servicio compatible con `llama-server` parcheado y con endpoints compatibles (`endpoints_compatible` en las etiquetas).
- Capacidades de tool calling, agentes, matematicas o codigo: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia de un modelo de clase 180B en hardware Volta heredado: el archivo esta dimensionado para que cada experto enrutado encaje en 2× 32 GB de VRAM, lo que permite reutilizar servidores con Tesla V100 en lugar de migrar a GPU mas recientes.
- Analisis de documentos largos: el contexto de 262.144 tokens admite resumir, extraer y consultar expedientes completos sin trocear el texto; la atencion dispersa QSA mantiene viable el decode en esas longitudes.
- Procesamiento de documentos escaneados o capturas con el parche v3: el codificador de vision se carga bajo demanda y el modelo responde sobre imagenes sin sacrificar el contexto completo de 256K.
- Servicio de chat de baja concurrencia y baja latencia: la combinacion de MTP y `--split-mode tensor` reduce el tiempo por token en decode (el autor reporta alrededor de un 20 % mas rapido que con layer split), lo que encaja en asistentes interactivos con pocos usuarios simultaneos.
- Reproduccion de evaluaciones de cuantizacion: al estar publicadas las procedencias exactas de cada grupo de tensores, sirve para medir el impacto de IQ3_XXS en expertos frente a Q8_0 en densos, incluida la comparacion de perplejidad entre tensor split y layer split.
- Despliegue en entornos con restricciones de red o sin acceso a pesos originales: al ser un GGUF de un solo archivo de unos 80 GiB, se puede replicar en nodos aislados sin descargar el checkpoint completo de Qwen.
- Experimentacion con decodificacion especulativa: permite estudiar la ganancia real de una cabecera MTP de 8 GB sobre un tronco cuantizado a IQ3_XXS en un escenario de dos GPU con AllReduce en grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye datos comparativos de ejecucion, no de calidad:

| Aspecto | Dato reportado |
|---|---|
| Decode con `--split-mode tensor` frente a layer split | Aproximadamente un 20 % mas rapido |
| Velocidad de decode de texto y salida greedy | Identica a la version v2 del parche |
| Impacto de una imagen en contexto (v2) | Reducia el decode a la mitad a 56K y a un tercio a 133K |
| Perplejidad entre tensor split y layer split | No cuantificada en la informacion disponible; la v3 corrige una carrera de kernel que afectaba a esa diferencia |
| MMLU, HumanEval, GSM8K u otros | No disponibles |

## Requisitos de hardware

- VRAM objetivo: 2× Nvidia Tesla V100 de 32 GB (64 GB en total), con reparto de expertos 320 + 320. El archivo en disco ocupa 85.923.705.344 bytes (unos 80 GiB).
- Arquitectura de GPU: `sm_70` (Volta). El autor recomienda fijar `CMAKE_CUDA_ARCHITECTURES` a la arquitectura de cada GPU.
- CUDA: 12.8 o superior (el codigo de FreeToken usa `cuda_fp4.h`). En Volta es obligatorio CUDA 12.x: CUDA 13 no compila para `sm_70`.
- NCCL: necesario para el AllReduce en grafo; `GGML_CUDA_NCCL` esta activo por defecto. Se documenta el uso del wheel `nvidia-nccl-cu12==2.27.3`.
- Interconexion: NVLink o PCIe peer-to-peer entre ambas GPU para el AllReduce del modo tensor split.
- GPU consumer, A100, H100 u otras: no disponible en la informacion proporcionada. El unico objetivo declarado es el doble V100 de 32 GB.
- Opciones de despliegue: exclusivamente llama.cpp v0.5.0 con los parches del repositorio (`llama-v0.5.0-v100-v3.patch`, recomendado). El llama.cpp oficial, Ollama y LM Studio no pueden cargar el archivo.
- Compilacion: `cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=70 -DGGML_NATIVE=ON -DLLAMA_BUILD_TESTS=OFF` con las rutas de NCCL, y objetivo `llama-server`.
- Latencia y throughput absolutos: no disponibles. Solo se reporta la mejora relativa del 20 % en decode con tensor split.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF | 180.186.749.568 | 262.144 tokens | Mixta IQ3_XXS / Q8_0 / Q4_0 / Q6_K, con cabecera MTP | qwen-community-1.0 | GGUF de un archivo; requiere llama.cpp v0.5.0 parcheado |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ3_XXS) | Mismo modelo base | no disponible en esta informacion | IQ3_XXS uniforme | qwen-community-1.0 | GGUF; sin cabecera MTP |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ4_XS) | Mismo modelo base | no disponible en esta informacion | IQ4_XS | qwen-community-1.0 | GGUF; sin cabecera MTP |
| Qwen/Qwen3.8-Flash-Next (checkpoint original) | 180.186.749.568 | 262.144 tokens | Pesos sin cuantizar | qwen-community-1.0 | Checkpoint completo en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de un fork: el archivo solo carga con llama.cpp v0.5.0 parcheado. Sin el parche, la carga falla; Ollama y LM Studio quedan descartados.
- Mantenimiento a cargo del autor: el repositorio tiene 12 likes y 356 descargas, y los parches se actualizan con cambios incompatibles entre versiones (v1, v2, v3), lo que complica la reproducibilidad a largo plazo.
- Proyector de vision externo: la entrada de imagen requiere el proyector de unsloth, que no esta incluido en este repositorio.
- Contexto largo con imagenes fragil: en v2 el servidor abortaba a los 200 tokens de cualquier respuesta sobre una imagen, y una carrera de kernel podia producir NaN y tirar el servidor; estos fallos se corrigen solo en v3.
- Cuantizacion agresiva: los expertos enrutados estan en IQ3_XXS (aproximadamente 3 bits), lo que implica perdida de calidad respecto al checkpoint original. No hay datos de perplejidad publicados que la cuantifiquen.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se han publicado evaluaciones de fidelidad para esta cuantizacion.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue mas alla de la del modelo base.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia: `qwen-community-1.0`, etiquetada como `other`. Hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que la informacion disponible no detalla sus condiciones.
- Restriccion de hardware: no se documenta funcionamiento en GPU distintas de la V100, ni en configuraciones de una sola GPU o de mas de dos.
- Requisitos de compilacion estrictos: CUDA 12.x obligatorio en Volta (CUDA 13 no compila `sm_70`), CUDA 12.8 o superior por `cuda_fp4.h`, y NCCL localizable por CMake.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de unsloth (origen de expertos y tensores densos): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- llama.cpp (rama `v0.5.0`): https://github.com/ggml-org/llama.cpp
- Parche recomendado: `patches/llama-v0.5.0-v100-v3.patch` en el repositorio de HuggingFace
- Actualizacion v2 a v3: `patches/llama-v0.5.0-v100-v2-to-v3.patch`
- Parche v2 (referencia, sin entrada de imagen): `patches/llama-v0.5.0-v100-v2.patch`
- Actualizacion v1 a v2: `patches/llama-v0.5.0-clean-20260924-to-v2.patch`
- Parche v1 (referencia, solo reparto por capas): `patches/llama-v0.5.0-clean-20260924.patch`
- Licencia de las fuentes de FreeToken: `patches/LICENSE-freetoken`
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; todas las coincidencias correspondian a contenidos no relacionados (una obra de ficcion y listados de comics).
