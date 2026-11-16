# 5krm/mfv3-sigfpe-poc

## Resumen

`5krm/mfv3-sigfpe-poc` no es un modelo de lenguaje funcional, sino un repositorio de prueba de concepto (PoC) de seguridad publicado en Hugging Face. Contiene ficheros GGUF construidos deliberadamente para provocar un fallo de tipo SIGFPE (división entera por cero, CWE-369) en el momento de carga del modelo en `llama.cpp` y en el paquete Python `llama-cpp-python`. El autor, `5krm`, lo presenta como una submission de divulgación de vulnerabilidades ("MFV Submission") dirigida al proyecto llama.cpp.

El repositorio incluye un fichero que provoca el crash (`deepseek4_dz.gguf`), un fichero de control que falla de forma limpia (`deepseek4_ctrl.gguf`) y los scripts generadores en Python basados en `gguf-py`. El vector de ataque es un GGUF estructuralmente válido en el que el metadato `attention.output_group_count` vale 0 y se usa como divisor en el cálculo de formas de tensores durante la carga, sin comprobación previa. El impacto es un ataque de denegación de servicio (DoS) en procesos de servicio de modelos que acepten ficheros de modelo no confiables.

El interés técnico del artefacto es doble: por un lado, demuestra una clase de vulnerabilidad recurrente en parsers de formatos binarios de modelos (validación insuficiente de metadatos usados en aritmética de formas); por otro, señala que la misma comprobación ya existe en un loader hermano (`dflash.cpp`) pero se omitió en `deepseek4.cpp`, `deepseek41.cpp`, `llama-model.cpp` y `mamba2.cpp`. El repositorio declara 2376 parámetros en safetensors según los metadatos de Hugging Face, un valor irrelevante para un PoC de este tipo y que no debe interpretarse como tamaño de un modelo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica; ficheros GGUF de prueba de concepto para el loader de llama.cpp (arquitecturas referenciadas: DeepSeek V4/V4.1 y Mamba2) |
| Parametros totales | 2376 (según metadatos de Hugging Face; no representativo de un modelo funcional) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Tensores F32 con todos los valores a cero en el PoC; no es un modelo cuantizado utilizable |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento: los ficheros son artefactos binarios en formato GGUF generados programáticamente con `gguf-py`. El PoC `deepseek4_dz.gguf` es un GGUF estructuralmente válido con tensores F32 a cero y el metadato `attention.output_group_count = 0`. El fichero de control `deepseek4_ctrl.gguf` es idéntico salvo que fija `output_group_count = 8`, lo que provoca un error controlado en lugar de un SIGFPE.

La causa raíz documentada es que `dsv4_o_group_count` se lee del metadato GGUF sin comprobación de cero y se usa como divisor en la aritmética de formas de tensores en `src/models/deepseek4.cpp` (líneas 82 y 114), con el mismo patrón en `src/models/deepseek41.cpp` (137, 176) y en `src/llama-model.cpp` (867, 876). El fallo ocurre en `load_arch_tensors`, antes de que se invoque `create_tensor()`. El mismo código ya protege esa división en `src/models/dflash.cpp` mediante `GGML_ASSERT(hparams.dsv4_o_group_count > 0)`, lo que evidencia una omisión de validación. Un segundo punto de crash confirmado es `src/models/mamba2.cpp:78`, donde `ssm_n_group` se lee de `mamba2.ssm.group_count` sin comprobación y se usa como divisor en la forma de `ssm_norm`; el patrón se repite en `src/models/metis16.cpp:130`.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- Actúa como entrada maliciosa para probar la robustez del parser GGUF de llama.cpp.
- Reproduce un SIGFPE (exit 136) en `llama-cli` y `llama-server` al cargar `deepseek4_dz.gguf`.
- Reproduce el mismo crash en `llama-cpp-python` 0.3.37 mediante `Llama(model_path="deepseek4_dz.gguf")`.
- Incluye un fichero de control que permite verificar que el fallo es específico del metadato anómalo.
- Incluye scripts generadores reproducibles (`build_deepseek4_dz.py`, `build_deepseek4_ctrl.py`) basados en `gguf-py`.
- Permite validar parches de seguridad (comprobación de divisor distinto de cero y endurecimiento de `gguf.cpp:692`).

## Casos de uso

- Auditoría de seguridad de llama.cpp: cargar el PoC en una build concreta (`4ddf2b9470b44b122e8a5404ae199f04cd03bcec`) para verificar si el divisor está protegido antes de desplegar un servicio de inferencia.
- Validación de parches: ejecutar `deepseek4_dz.gguf` contra una rama con la comprobación `output_group_count > 0` añadida y confirmar que el proceso ya no muere con SIGFPE.
- Pruebas de regresión en CI: integrar el fichero y el control en una suite que verifique que los loaders devuelven error controlado (exit 1) en lugar de abortar (exit 136).
- Análisis forense con GDB: reproducir el crash en `load_arch_tensors` con dividendo 32 y divisor 0 para documentar la pila de llamadas y el punto exacto de la división.
- Endurecimiento de servicios de modelos: usar el PoC para demostrar por qué un endpoint que acepte GGUF de terceros necesita aislamiento de proceso, límites de recursos y validación previa de metadatos.
- Evaluación de dependencias: comprobar si `llama-cpp-python` (commit fijado `a956a852c9c8bc1fb07206364838ddef299178c0`) hereda la vulnerabilidad en aplicaciones Python que cargan modelos de usuarios.
- Formación y divulgación: material reproducible para explicar CWE-369 en parsers de formatos binarios de modelos y la diferencia entre fallo controlado y aborto del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no evalúa calidad de modelo; los únicos resultados reportados son de comportamiento ante el crash:

| Escenario | Entrada | Resultado observado |
|---|---|---|
| `llama-cli` | `deepseek4_dz.gguf` | SIGFPE, core dumped, exit 136 |
| `llama-server` | `deepseek4_dz.gguf` | SIGFPE, core dumped, exit 136 (muere el servicio HTTP) |
| `llama-cli` | `deepseek4_ctrl.gguf` | Error controlado, exit 1 (`tensor 'blk.0.attn_output_a.weight' not found`) |
| `llama-cpp-python` 0.3.37 | `deepseek4_dz.gguf` | SIGFPE, proceso Python muere, exit 136 |
| `llama-cli` | `mamba2_ng0.gguf` | SIGFPE, exit 136 (crash en `llama_model_mamba2::load_arch_tensors`) |

## Requisitos de hardware

- No requiere GPU: el fallo se produce en la fase de carga del modelo, antes de cualquier inferencia.
- Cualquier máquina capaz de ejecutar `llama-cli`, `llama-server` o `llama-cpp-python` sirve para reproducirlo; no hay requisitos de VRAM relevantes porque no se llega a ejecutar cómputo en tensor.
- No aplica selección de GPU (A100, H100, RTX 4090); el crash es independiente del backend.
- Opciones de despliegue afectadas: llama.cpp (CLI y servidor) y `llama-cpp-python`; el aviso no menciona otros runtimes.
- Latencia y throughput: no disponibles; el proceso aborta en carga.
- Recomendación operativa: ejecutar la carga de GGUF no confiables en procesos aislados con reinicio automático y límites de recursos, dado que el fallo termina el proceso.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido habitual, ya que este repositorio no es un modelo de lenguaje sino un conjunto de artefactos de prueba de seguridad. Como referencia de la clase de fallo, el propio autor cita otros reportes relacionados:

| Referencia | Clase de fallo | Relación con este PoC |
|---|---|---|
| Issue #31948 (2026-11-09) | `ssm_dt_rank=0` → SIGFPE en `weight_buft_supported()` (caso SSM_SCAN) | Clave de metadato, función y punto de parche distintos |
| Issue #32424 (2026-11-16) | División en el constructor de `llama_kv_cache` (ruta `compress_ratios`) | Posterior a la carga del modelo, fichero distinto |
| Issue #26576 | `GGML_ASSERT` en decodificación especulativa | No es SIGFPE ni ocurre en carga |
| `dflash.cpp` | División ya protegida con `GGML_ASSERT(... > 0)` | Referencia del parche correcto que falta en otros loaders |

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto ni ofrece ninguna capacidad de inferencia.
- El contenido del repositorio es una prueba de explotación de denegación de servicio; debe manejarse en entornos controlados.
- Cargar `deepseek4_dz.gguf` o `mamba2_ng0.gguf` en versiones vulnerables de llama.cpp o `llama-cpp-python` termina el proceso de forma abrupta (exit 136), incluido un servidor HTTP en producción.
- La licencia no está disponible, lo que impide determinar condiciones de uso o redistribución.
- El dato de 2376 parámetros en safetensors no describe un modelo real y no debe citarse como tamaño de modelo.
- El PoC está verificado contra un commit concreto de llama.cpp (`4ddf2b9470b44b122e8a5404ae199f04cd03bcec`) y una versión concreta de `llama-cpp-python` (0.3.37); otras versiones pueden comportarse de forma distinta.
- El segundo punto de crash en `mamba2.cpp` no queda cubierto por la corrección propuesta en el issue #31948, que solo rechaza `ssm_dt_rank` y `wkv_head_size`.
- El patrón sin protección en `metis16.cpp:130` se señala como "probablemente afectado", no confirmado con PoC en la información disponible.
- Sesgos, alucinación y limitaciones idiomáticas: no aplican, al no tratarse de un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/5krm/mfv3-sigfpe-poc
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Paquete `llama-cpp-python`: https://pypi.org/project/llama-cpp-python/
- Utilidad `gguf-py` (incluida en el repositorio de llama.cpp): https://github.com/ggml-org/llama.cpp/tree/master/gguf-py
- CWE-369, divide by zero: https://cwe.mitre.org/data/definitions/369.html
- Issues citados por el autor (#31948, #32424, #26576): no se dispone de URL directa en la información proporcionada.
