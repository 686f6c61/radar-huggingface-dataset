# cafonez/Qwen3.8-Flash-Next-HC-Q8

## Resumen

Qwen3.8 Flash Next HC-Q8 es una cuantizacion GGUF de un unico archivo publicada por el usuario cafonez (repositorio `cafonez/Qwen3.8-Flash-Next-HC-Q8`) sobre el modelo base `Qwen/Qwen3.8-Flash-Next`. No es una publicacion oficial de Qwen: se trata de un cuantizado comunitario que conserva los pesos bajo la licencia Qwen Community License 1.0. El archivo resultante pesa 92.347.778.272 bytes (unos 86,0 GiB) y contiene 179.551 millones de parametros con una media de 4,11 bits por peso, distribuidos en una mezcla de tipos de cuantizacion propietarios de ROCmFPX (Q4_0_ROCMI4 y Q3_0_ROCMFPX) junto con Q8_0, Q6_K y tensores BF16 sin cuantizar.

La particularidad del modelo es su arquitectura declarada `qwen4exp`, con una ventana de entrenamiento de 262.144 tokens y una tabla n-gram de 51.200 millones de parametros incluida en el propio archivo, que se usa para decodificacion especulativa n-grama. Ademas, el GGUF incrusta la cabecera MTP (multi-token prediction), de modo que no hace falta un segundo archivo de borrador.

Es relevante ahora porque ejemplifica un patron de despliegue muy concreto: cuantizacion agresiva de un modelo de ~180.000 millones de parametros para ejecucion local en hardware AMD con memoria unificada (Strix Halo, gfx1151), a traves de un fork especifico de llama.cpp (ROCmFPX v2). El coste de esa optimizacion es la perdida de portabilidad: el archivo no carga en llama.cpp estandar ni, segun lo documentado, en otros runners convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (familia transformer, con expertos y cabecera MTP; detalles de capas no disponibles) |
| Parametros totales | 179.551 millones |
| Parametros activos | no disponible (la tabla de pesos distingue "red, incluidos expertos", lo que indica presencia de expertos, pero no se publica el numero de parametros activos) |
| Longitud de contexto | 262.144 tokens en entrenamiento; 65.536 tokens en el perfil de ejecucion ROCmFP4 FAST v2 |
| Tipos de cuantizacion | Q4_0_ROCMI4, Q3_0_ROCMFPX, Q8_0, Q6_K y BF16 (mezcla, 4,11 bits por peso de media) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF, archivo unico `Qwen3.8-Flash-Next-HC-Q8.gguf` |
| Tamano del archivo | 92.347.778.272 bytes (aprox. 86,0 GiB) |
| Fecha de publicacion | 2026-09-28 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | text-generation |

Desglose de pesos publicado por el autor:

| Componente | Parametros | Almacenamiento | Bits por peso |
|---|---:|---|---:|
| Red, incluidos expertos | 126,33B | Q4_0_ROCMI4 | 4,25 |
| Tabla n-gram | 51,20B | Q3_0_ROCMFPX | 3,50 |
| Hiperconexion (up y down) | 0,655B | Q8_0 | 8,50 |
| Tensiones de inyeccion y otros BF16 | 0,661B | BF16 | 16 |
| Tensor restante | 0,636B | Q6_K | 6,56 |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base: no hay numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se describe es la arquitectura declarada `qwen4exp`, con una tabla n-gram de 51.200 millones de parametros empaquetada en el mismo archivo y una cabecera MTP incrustada. La tabla n-gram no es un componente neuronal clasico, sino la estructura de datos que habilita la decodificacion especulativa `ngram-mod` en el servidor de inferencia, y esta cuantizada a 3,50 bits por peso porque su contenido tolera peor precision sin degradar el resultado.

El trabajo del autor se centra en la receta de cuantizacion mixta llamada HC-Q8. Se parte de una cuantizacion Q4_0_ROCMI4 y se restauran 200 matrices de hiperconexion (up y down) desde los tensores BF16 originales de la revision `de4b8e4d` de Qwen, almacenandolas como Q8_0 ordinario; 98 tensores de inyeccion permanecen en BF16. El resto de tensores conserva los bytes ROCmI4 originales. Los tipos Q4_0_ROCMI4 y Q3_0_ROCMFPX son formatos propios de ROCmFPX, no del ecosistema GGUF estandar, por lo que llama.cpp de serie no carga este archivo.

## Capacidades

- Generacion de texto: es la unica capacidad declarada explicitamente en el pipeline del repositorio (`text-generation`).
- Razonamiento: el ejemplo de arranque del autor usa `--reasoning-format deepseek` y plantilla de chat `chatml`, lo que apunta a un modo de razonamiento estructurado, aunque el autor no lo documenta como capacidad formal.
- Vision: la model card indica que para procesar imagenes se necesita el proyector de vision F16 original del repositorio de Qwen, seleccionado con `--mmproj`. Ese proyector no esta incluido en este repositorio, por lo que la entrada multimodal no funciona solo con este archivo.
- Decodificacion especulativa: la cabecera MTP esta dentro del GGUF (no requiere archivo de borrador aparte) y el servidor admite ademas especulacion n-grama mediante `--spec-type ngram-mod,draft-mtp`, apoyada en la tabla n-gram de 51,20B parametros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no figura en la informacion).
- Capacidades especiales adicionales (audio, thinking mode explicito): no disponible.

## Casos de uso

- Asistencia de codigo en estacion de trabajo local: con 179,55B parametros y contexto de ejecucion de 65.536 tokens, el modelo permite mantener abiertos varios archivos y el historial de conversacion en un equipo unico sin enviar codigo a la nube, algo critico en entornos con requisitos de confidencialidad.
- Procesamiento de documentacion tecnica extensa: la ventana de entrenamiento de 262.144 tokens habilita el analisis de manuales, normativas o expedientes completos; en el perfil v2 se sirven 65.536 tokens, suficientes para la mayoria de documentos largos manteniendo la cache KV en F16.
- Analisis de repositorios y revision de cambios: la decodificacion especulativa n-grama acelera la generacion cuando el modelo repite fragmentos presentes en el contexto, patron habitual al responder sobre codigo previamente inyectado.
- Despliegue en hardware AMD de escritorio para prototipado de IA local: el modelo esta pensado para Strix Halo (gfx1151) con memoria unificada, lo que permite a un desarrollador individual ejecutar un modelo de ~180B sin recurrir a clústeres de GPU.
- Traduccion y generacion de texto con contexto largo: la combinacion de ventana amplia y ejecucion local es adecuada para pipelines internos de documentacion; conviene validar antes la cobertura de idiomas, que no esta publicada.
- Laboratorio de investigacion en cuantizacion: el repositorio documenta con detalle la mezcla de tipos (Q4_0_ROCMI4, Q3_0_ROCMFPX, Q8_0, Q6_K, BF16) y el tratamiento de las matrices de hiperconexion, lo que lo convierte en material de referencia para estudiar el impacto de la precision por tensor.
- Inferencia con entrada de imagenes (con matiz): si se anade el proyector de vision F16 del repositorio de Qwen mediante `--mmproj`, el modelo base podria procesar imagenes; este repositorio no lo incluye y el autor no garantiza esa ruta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de busqueda web consultados no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 86,0 GiB solo para los pesos (92.347.778.272 bytes). Hay que sumar la cache KV en F16 para la longitud de contexto elegida; su tamano depende del numero de capas y cabezas, dato no publicado.
- GPU objetivo declarada: Strix Halo (gfx1151, RDNA 3.5) con memoria unificada, usando `HSA_OVERRIDE_GFX_VERSION=11.5.1` y las variables `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1` y `GGML_HIP_ENABLE_UNIFIED_MEMORY=1`.
- RDNA 3 y RDNA 4: la variable `HSA_OVERRIDE_GFX_VERSION` debe quedar sin definir; el autor menciona explicitamente la Radeon AI Pro R9700 como ejemplo de tarjeta RDNA 4. La VRAM de estas tarjetas es muy inferior a los ~86 GiB de pesos, por lo que no son un objetivo realista para alojar el modelo completo.
- GPU de consumo (RTX 4090 y similares de 24 GB): no cabe. Los pesos por si solos superan en mas de tres veces la VRAM de estas tarjetas, y ademas la ruta de ejecucion documentada es ROCm/HIP, no CUDA.
- Opciones de despliegue: exclusivamente el `llama-server` HIP de ROCmFPX v2, compilacion no-W4A4, con el perfil ROCmFP4 FAST v2. No se debe pasar archivo MTP separado (la bandera `-md` pertenece al paquete FP4 v2, que si usa dos archivos). llama.cpp estandar no carga el archivo; no hay soporte documentado para vLLM, Ollama, TGI ni otros runners.
- Parametros de arranque relevantes del ejemplo del autor: `-c 65536`, `-np 1`, `-b 2048 -ub 512`, `-fa on -ctk f16 -ctv f16`, `--cache-ram 1024`, `--ctx-checkpoints 32 --checkpoint-min-step 8192`, `--spec-draft-n-max 3 --spec-draft-p-split 0.10`, `--spec-ngram-mod-n-match 16 --spec-ngram-mod-n-min 8 --spec-ngram-mod-n-max 64`. El autor advierte de que subir `-c` exige memoria adicional para una cache KV F16 de esa longitud.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-HC-Q8 (este) | 179,551B | 262.144 en entrenamiento; 65.536 en el perfil v2 | GGUF unico con tipos ROCmFPX (4,11 bits/peso) | qwen-community-1.0 | Requiere ROCmFPX v2; llama.cpp estandar no lo carga |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | 262.144 (heredado del base, segun la model card del cuantizado) | Pesos originales (presumiblemente BF16; no confirmado en la informacion) | qwen-community-1.0 | Repositorio oficial de Qwen; incluye el proyector de vision F16 |
| Paquete FP4 FAST v2 de ROCmFPX | no disponible | no disponible | ROCmFP4 v2 con pesos MTP en un segundo archivo | no disponible | Mencionado en la model card como alternativa; requiere `-md` |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la informacion proporcionada, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- Cuantizado comunitario no oficial: no esta publicado por Qwen. Cualquier decision de produccion deberia apoyarse en el modelo base oficial y en validaciones propias.
- Compatibilidad muy restringida: el autor afirma explicitamente que llama.cpp estandar no carga el archivo; solo funciona con el `llama-server` HIP de ROCmFPX v2 (compilacion no-W4A4, perfil ROCmFP4 FAST v2).
- Dependencia de hardware AMD: la ruta documentada es ROCm/HIP. No hay instrucciones para CUDA ni para GPUs de consumo.
- Huella de memoria alta: ~86,0 GiB solo en pesos, mas la cache KV F16. Fuera de equipos con memoria unificada amplia (como Strix Halo) el despliegue no es viable.
- Sin resultados de evaluacion: no hay benchmarks publicados, ni comparativas de perplejidad frente al modelo base o frente a otras cuantizaciones, por lo que se desconoce la degradacion real introducida por la mezcla de cuantizacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a cualquier modelo generativo y no hay evaluaciones que lo acoten.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento en castellano ni en otros idiomas sin pruebas propias.
- Vision incompleta en este repositorio: el proyector `--mmproj` no esta incluido; sin el, la entrada de imagenes no funciona.
- Contexto de servicio por defecto menor que el de entrenamiento: el perfil v2 usa 65.536 tokens frente a los 262.144 de entrenamiento, y ampliarlo tiene coste de memoria.
- Licencia: se hereda la Qwen Community License 1.0, con las condiciones y restricciones que ese texto imponga para uso comercial. Debe revisarse el archivo `LICENSE` antes de cualquier uso en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Fechas del repositorio: creado y actualizado el 2026-09-28, con una diferencia de menos de un minuto entre ambos eventos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cafonez/Qwen3.8-Flash-Next-HC-Q8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (archivo del repositorio): https://huggingface.co/cafonez/Qwen3.8-Flash-Next-HC-Q8/blob/main/LICENSE
- ROCmFPX (runtime necesario, compilacion no-W4A4): https://github.com/ROCmFPX/ROCmFPX

Nota: los resultados de busqueda web proporcionados no contenian ningun enlace, articulo, paper o demo relacionado con este modelo ni con su modelo base; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace.
