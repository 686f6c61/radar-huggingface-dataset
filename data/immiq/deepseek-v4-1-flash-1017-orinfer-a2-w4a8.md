# immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8

## Resumen

DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 es una distribución de pesos cuantizados del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario immiq. No se trata de un modelo entrenado desde cero, sino de un empaquetado en formato nativo del runtime orinfer, orientado específicamente al acelerador Ascend 910B (plataforma Altus A2) y optimizado para ejecución con paralelismo de tensor TP8. El repositorio contiene únicamente datos de modelo y atribución; los operadores, planes y librerías nativas se distribuyen por separado en el archivo de ejecución de orinfer v0.3.0.

El modelo conserva los códigos INT4 firmados originales de los expertos, las escalas por canal, los valores de asistencia y los parámetros de precisión mixta del modelo base, sin recuantizar. Lo que cambia es el layout físico de almacenamiento: los bancos de expertos W4 se empaquetan en formato transposed-NZ y los registros Engram se almacenan como INT8 de grupo 32 seguidos de escalas FP32. El objetivo es permitir una carga en línea directa sobre hardware Ascend sin transposiciones ni recuantizaciones completas en el arranque.

Con 501.877.350.464 parámetros totales (aproximadamente 502 mil millones) y una arquitectura MoE, el modelo se posiciona en la categoría de modelos de razonamiento y generación de texto de gran escala. Su relevancia actual radica en que demuestra un flujo de despliegue de un MoE masivo en hardware no NVIDIA, con soporte declarado de hasta 262.144 tokens de contexto y un paquete de ejecución nativo que no requiere Python ni contexto NPU para la instalación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; tag `deepseek_v41`; 40 capas de texto |
| Parametros totales | 501.877.350.464 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (declarado en el paquete de ejecución); probado hasta 262.080 tokens de entrada |
| Tipos de cuantizacion | W4A8 (expertos INT4, activaciones INT8); KV cache INT8 de grupo 64 con escalas FP16; tag `8-bit` |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | safetensors (178 shards, 5.505 tensores físicos, 510.089.196.120 bytes, ~475,06 GiB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de aproximadamente 502 mil millones de parámetros con 40 capas de texto, según los datos del repositorio. La información disponible no detalla el número de expertos, la proporción de parámetros activos por token ni la composición del dataset de entrenamiento del modelo original. Tampoco se documentan en esta ficha las etapas de RLHF, DPO u otros ajustes posteriores al preentrenamiento del modelo base.

La innovación técnica de esta distribución no está en la arquitectura del modelo, sino en el layout físico y el runtime. Los bancos de expertos W4 usan bytes empaquetados en formato transposed-NZ con forma `[E,K/64,N/16,16,32]`, mientras que la vista lógica ACL es `[E,K,N]`; las escalas, los valores de asistencia y el orden de canales de salida se mantienen intactos. Los registros Engram contienen valores INT8 de grupo 32 seguidos inmediatamente de bytes de escala FP32, sin padding adicional de filas, con un índice `row_records` que fija el formato `i8-f32-g32-v1`. La carga en línea lee los datos físicos preparados directamente, sin transposición completa de bancos ni recuantización en el arranque. El runtime usa KV cache INT8 de grupo 64 con escalas FP16, y el estado de secuencia y KV permanece privado por petición. El paquete de ejecución soporta decodificación especulativa mediante MTP (multi-token prediction), aunque los benchmarks reportados se obtuvieron con MTP desactivado (`--mtp-drafts 0`).

## Capacidades

- Generación de texto conversacional y no conversacional en chino e inglés, según los idiomas declarados.
- Razonamiento y generación de texto de gran escala gracias a su naturaleza MoE de aproximadamente 502 mil millones de parámetros.
- Procesamiento de contextos muy largos: el paquete declara hasta 262.144 tokens y se han ejercitado longitudes de hasta 262.080 tokens de entrada en pruebas de estrés acotadas.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction) en el runtime orinfer, desactivable por configuración.
- Servicio HTTP nativo con endpoint `/health` para comprobación de disponibilidad.
- Admisión por lotes (B32) y recuperación ante sobrecarga, según las pruebas de estrés reportadas.
- Caché de prefijo configurable (8192 MiB en la configuración de servicio documentada).
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modos de pensamiento explícitos en la documentación proporcionada.

## Casos de uso

- Despliegue de inferencia de texto a gran escala sobre Ascend 910B: el paquete está diseñado para instalarse con el CLI de orinfer v0.3.0 en Linux aarch64 y ejecutarse con TP8 sobre Altus A2, sin necesidad de Python ni de contexto NPU en la instalación. Es adecuado para entornos con hardware Ascend que necesitan servir un MoE de gran tamaño con pesos ya preparados para el layout nativo.
- Procesamiento de documentos largos y conversaciones multi-turno: con hasta 262.144 tokens de contexto declarados, el modelo puede manejar expedientes, contratos o historiales de conversación extensos en una sola ventana, manteniendo el estado KV privado por petición.
- Servicio de chat en chino e inglés: los idiomas declarados (zh, en) permiten atender aplicaciones conversacionales bilingües, con un endpoint HTTP `/health` para integrarse en orquestadores y balanceadores.
- Evaluación y benchmarking de hardware Ascend: las pruebas de prefill a 2K y 2049 tokens y de decodificación en stream único y agregada B32 permiten usar este paquete como referencia para medir el rendimiento de clústeres A2 TP8 en cargas de inferencia reales.
- Investigación en cuantización y layouts de pesos: al preservar códigos INT4 firmados, escalas por canal y valores de asistencia sin recuantizar, el repositorio sirve como material de estudio para validar mapeos nibble/dirección sin pérdida y la preservación de bytes de escala FP32.
- Integración en pipelines de verificación de integridad: el manifiesto `release-manifest.json` con SHA256 por archivo y tensor, junto con `SHA256SUMS`, permite incorporar comprobaciones de integridad en procesos de despliegue automatizado.
- Pruebas de recuperación ante sobrecarga y apagado limpio: la configuración documentada incluye límite de 32 peticiones activas, presupuesto de 128 tokens de batch en front-end y un tiempo de drenaje de 120 segundos, útil para validar la robustez operativa del servicio.

## Benchmarks y rendimiento

Los datos disponibles corresponden a mediciones nativas en caliente sobre una máquina A2 TP8 del proyecto, con MTP desactivado y la configuración de mini servicio indicada (límite de 32 peticiones activas, presupuesto de 128 tokens de batch en front-end, caché de prefijo de 8192 MiB, `ORINFER_A2_HOST_TABLE_MIB=212000`, `ORINFER_A2_HOST_ROW_CACHE_MIB=2048`, `HCCL_OP_EXPANSION_MODE=AIV`). No son resultados de benchmarks académicos como MMLU, HumanEval o GSM8K, que no se han publicado en la información disponible.

| Escenario nativo en caliente | Baseline | Este layout |
|---|---:|---:|
| Prefill 2K, tokens de entrada/s | 7.986 | 8.831 |
| Prefill 2049, tokens de entrada/s | 6.143 | 6.547 |
| Decodificación en stream único, tokens/s | 51,3 | ~53 |
| Decodificación agregada B32, tokens/s | 263,9 | 265,1 |

Además, se reporta una repetición fija de 240 segundos de Mini-Weka que completó 27 peticiones de profiling frente a 20, y decodificó 5.056 tokens frente a 4.085, con progreso de prefill prácticamente sin cambios. El arranque del servicio con residencia completa fue de 248 segundos frente a 258 segundos en una comparación secuencial, y los workspaces combinados de ACLNN usan 160 MiB menos por rank. La aceptación completa de calidad por tarea/NLL de referencia oficial quedó diferida en este ciclo de release.

## Requisitos de hardware

- Hardware objetivo: Altus A2 / Ascend 910B con TP8. No se documenta soporte para GPU NVIDIA ni para otras plataformas en esta distribución.
- Memoria de host: la configuración de tabla de host completamente residente requiere aproximadamente 211 GiB de memoria de host adicional (`ORINFER_A2_HOST_TABLE_MIB=212000`), más la memoria del resto del proceso.
- Almacenamiento: el repositorio ocupa 510,1 GB (unos 475,06 GiB en 178 shards de entre 1,23 y 3,75 GiB).
- Runtime: orinfer v0.3.0 para Linux aarch64, más el paquete de ejecución separado `orinfer-exec-deepseek-v41-flash-1017-w4a8-ascend910b-v0.3.0.tar.xz`.
- Entorno: CANN con `source /usr/local/Ascend/cann/set_env.sh`; variables `HCCL_OP_EXPANSION_MODE=AIV` y `HCCL_NPU_SOCKET_PORT_RANGE=auto`.
- No cabe en GPU de consumo: el tamaño de pesos y la plataforma objetivo lo excluyen de RTX 4090 u otras GPU consumer.
- Opciones de despliegue: exclusivamente el servidor nativo de orinfer (`orinfer serve`), con validación previa mediante `orinfer validate-model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; en stream único se observan unos 53 tokens/s y en agregado B32 unos 265,1 tokens/s, con prefill de 8.831 tokens/s a 2K.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 es la referencia directa, pero no se han facilitado sus especificaciones completas (parámetros activos, contexto, licencia original) ni datos de benchmarks que permitan una comparación rigurosa. Tampoco se documentan alternativas de la misma categoría en hardware Ascend.

| Modelo | Parámetros totales | Contexto | Licencia | Plataforma |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8 | 501.877.350.464 | hasta 262.144 | MIT | Ascend 910B / Altus A2 |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card marca `inference: false` en los metadatos, lo que indica que el repositorio no es directamente ejecutable sin el paquete de ejecución separado de orinfer.
- La aceptación completa de calidad por tarea/NLL de referencia oficial quedó diferida en este ciclo de release; no hay validación publicada de calidad frente al modelo base en tareas estándar.
- Los benchmarks reportados son mediciones de progreso con presupuesto fijo, no afirmaciones de TPS agregado ni de repetibilidad estadística, según el propio autor.
- El rendimiento depende de la configuración de máquina, afinidad de CPU y ajustes de caché/reloj; la afinidad de CPU es específica de cada máquina.
- La igualdad bit a bit entre ejecuciones no es un requisito del modo de comunicación HCCL de alto rendimiento utilizado.
- El modelo solo declara soporte de chino e inglés; no se documentan otros idiomas.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad en la documentación proporcionada.
- La licencia es MIT, lo que permite uso comercial, pero debe verificarse la licencia del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, no disponible en esta información.
- El uso está restringido de facto al hardware Ascend 910B con TP8 y al runtime orinfer; no hay soporte documentado para otras plataformas.
- El presupuesto de tabla de host requiere unos 211 GiB de memoria de host, lo que limita el despliegue a servidores con gran capacidad de RAM.
- Los llamadores directos de la API Rust deben configurar `ASCEND_COREDUMP_SIGNAL=none` antes del arranque; el CLI gestiona la propiedad de señales de terminación de CANN.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immiq/DeepSeek-V4.1-Flash-1017-Orinfer-A2-W4A8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Release de orinfer v0.3.0: https://github.com/iMMIQ/orinfer/releases/tag/v0.3.0
- Documentación de paquetes de modelo de orinfer: https://github.com/iMMIQ/orinfer/blob/v0.3.0/docs/model-packages.md
