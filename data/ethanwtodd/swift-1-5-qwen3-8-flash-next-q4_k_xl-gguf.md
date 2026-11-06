# ethanwtodd/Swift-1.5-Qwen3.8-Flash-Next-Q4_K_XL-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-Q4_K_XL-GGUF es una recuantización en formato GGUF del modelo multimodal ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario ethanwtodd. El objetivo no es crear un modelo nuevo, sino reempaquetar los pesos en exactamente la misma disposición de tipos por tensor que la cuantización UD-Q4_K_XL de unsloth/Qwen3.8-Flash-Next-GGUF, de modo que el motor de inferencia gufo pueda servir Swift 1.5 sobre hardware Strix Halo (gfx1151) con ROCm. El modelo subyacente es un transformer disperso (MoE) con 176.943.899.520 parámetros totales y capacidades de imagen-texto, según los metadatos del repositorio.

La relevancia de esta ficha es práctica: las cuantizaciones GGUF originales de UkisAI (tiers GSQ-RCO e IQ) usan tipos IQ que el cargador Flash-Next de gufo no acepta, y las variantes Q4_K_S y Q8_0 almacenan el embedding por capa con tipos no soportados. Esta recuantización resuelve ese problema de compatibilidad y, además, reporta una reducción notable de la longitud de razonamiento en tareas de código, contexto largo y matemáticas, con una tasa de acierto ligeramente superior a la del modelo base en la suite básica del autor.

El repositorio ocupa 112,2 GB (111,3 GB en pesos más el proyector visual y utilidades) y se distribuye en tres shards GGUF. La licencia es swift-open-license-1.0, lo que obliga a revisar sus términos antes de cualquier uso comercial. No se dispone de información sobre idiomas soportados ni de benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso (MoE) con componentes SSM (`ssm_*`), hyper-connections, capa de embedding por token (`ple_conv1d`), indexer y cabeza MTP; pipeline image-text-to-text |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de servicio reportada: `--sessions 2 --context 262144`) |
| Tipos de cuantizacion | Q4_K_XL (disposición por tensor tipo UD-Q4_K_XL); detalles: expertos enrutados gate/up Q4_K (una capa Q5_K), down Q5_1 (cinco capas Q8_0), embedding por capa IQ4_NL, `ple_conv1d` F32, proyecciones de salida de hyper-connection Q8_0, atención/expertos compartidos/SSM/token embedding/salida Q8_0, indexer BF16, norms y router F32 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 |
| Formato de pesos | GGUF (3 shards) + proyector visual `mmproj-...-BF16.gguf` (0,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso con mezcla de expertos (MoE) que incorpora elementos de arquitectura híbrida: tensores `ssm_*` (state space model), hyper-connections con proyecciones de inyección y de salida, una capa de embedding por token (`ple_conv1d`) y un indexer en BF16. Dispone de una cabeza MTP (multi-token prediction) que, según la model card, permanece sin cambios respecto al modelo base y es compatible con el sidecar `MTP/mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf` de unsloth. El total de tensores es 1224, con tipos y formas idénticos a los de la cuantización UD-Q4_K_XL de unsloth, verificado tensor a tensor desde las cabeceras de ambos ficheros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La model card de esta recuantización no documenta el entrenamiento del modelo base; solo describe el proceso de cuantización. Este se realizó con `llama-quantize --allow-requantize --tensor-type-file` (llama.cpp 0.7.0 de nixpkgs) partiendo del Q8_0 de UkisAI (cinco shards, verificado con SHA-256 contra el Hub), usando la importance matrix `imatrix-swiftfn-v1mix.gguf` (926 entradas) del repositorio GSQ-RCO. Los expertos se recuantizaron desde Q8_0, no desde BF16 (el repositorio BF16 de UkisAI está restringido), y el autor indica que el paso extra de redondeo Q8_0 no se midió por separado.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` (entrada de imagen y texto).
- Razonamiento con modo de pensamiento configurable (`reasoning_effort: xhigh` en las evaluaciones del autor) y presets de muestreo tipo Qwen3.8 (temperatura 1.0, top_p 0.95, top_k 20).
- Tool calling y function calling: la suite de evaluación incluye copia exacta de identificadores y SHA de 40 caracteres dentro de llamadas a herramientas.
- Tareas de agente sobre sistema de ficheros en múltiples turnos.
- Recuperación multi-salto sobre contexto largo (evaluada con ~50k tokens de logs; el tier duro pendiente cubre ~120k tokens).
- Generación de código verificada con tests unitarios en sandbox.
- Matemáticas con verificación por fuerza bruta.
- Decodificación especulativa mediante cabeza MTP, con 76% de tokens propuestos aceptados y 1,76× de aceleración reportada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de sistema de ficheros: el modelo puede ejecutar tareas multi-turno que requieren listar, leer y modificar archivos mediante tool calling, aprovechando la ventana de 262.144 tokens para mantener el estado de la tarea sin truncar.
- Automatización de refactorización con verificación: generación de código cuyos resultados se validan con tests unitarios en sandbox, adecuado para integrarse en pipelines de CI/CD donde la salida debe pasar pruebas antes de aplicarse.
- Análisis de logs extensos: recuperación de dos saltos sobre ~50k tokens de logs (y hasta ~120k en el tier duro pendiente), útil para diagnóstico de incidentes donde la evidencia está dispersa en múltiples ficheros.
- Asistentes con entrada visual: al declarar pipeline image-text-to-text y distribuir un proyector visual BF16 de 0,9 GB, puede emplearse en tareas que combinen capturas, diagramas o documentos escaneados con instrucciones textuales.
- Razonamiento matemático verificado: resolución de problemas con comprobación por fuerza bruta, aplicable a generación de ejercicios con solución comprobada o a validación de cálculos en pipelines de datos.
- Despliegue local en hardware de gran memoria: con 111,3 GB de pesos, encaja en una estación Strix Halo de 128 GB sirviendo dos sesiones simultáneas de 262.144 tokens con MTP, lo que permite entornos de desarrollo o investigación sin GPU de datacenter.
- Extracción estructurada con tool calling: copia exacta de identificadores y hashes en llamadas a herramientas, útil para integraciones que exigen precisión literal en los argumentos (por ejemplo, APIs internas con claves opacas).

## Benchmarks y rendimiento

Los datos provienen de una única máquina Strix Halo con gufo `34ebb5f` (ROCm 7.2.3, gfx1151, `--sessions 2 --context 262144`). La suite básica consta de 37 tareas × 2 muestras, corregidas por código (sin jueces modelo), con MTP desactivado.

| Modelo | Tareas superadas | Tokens de completion | Tareas que agotaron el límite |
|---|---:|---:|---:|
| Este modelo | 71/74 | 130k | 1 |
| Qwen3.8-Flash-Next UD-Q4_K_XL (unsloth, base) | 68/74 | 267k | 3 |
| Swift-1.5 Qwen3.8-27B FP8 (Radiance, R9700 ×2), referencia | 72/74 | 186k | 0 |
| Qwen3.8-27B FP8 (base), referencia | 67/74 | 311k | 3 |

El autor advierte que, con 74 tareas por modelo, las diferencias de tasa de acierto son indicativas y no estadísticamente significativas. La diferencia consistente está en la longitud del razonamiento: la mediana de tokens de completion baja de 7,4k a 1,8k en tareas de código, de 3,7k a 0,9k en contexto largo y de 7,9k a 4,5k en matemáticas.

Rendimiento con MTP (20 prompts de la suite, decodificación greedy, sin caché de prompt):

| Métrica | Sin MTP | Con MTP (`--draft-tokens 5`) |
|---|---:|---:|
| Throughput | 26,3 tok/s | 46,2 tok/s |
| Aceleración | — | 1,76× |
| Tokens propuestos aceptados | — | 76% |

La decodificación greedy con y sin MTP es idéntica token a token (57.982 tokens en total, incluyendo generaciones de 10.600 y 12.000 tokens). Los resultados de la suite con muestreo y MTP activado, así como el tier duro (matemáticas difíciles, código con trampas de rendimiento, corrección de bugs multi-fichero con tests ocultos y agregación multi-salto sobre ~120k tokens), están pendientes de publicación.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 111,3 GB de pesos más el proyector visual de 0,9 GB; en la práctica requiere un sistema con al menos ~112 GB disponibles para pesos, más espacio para KV cache de las sesiones.
- GPU recomendadas: el autor valida el despliegue en Strix Halo (gfx1151) con ROCm 7.2.3; no se documentan otras GPU en la información disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, etc.) por el tamaño de los pesos; solo es viable en sistemas con memoria unificada grande o múltiples GPU.
- Despliegue: gufo `34ebb5f` es el motor validado, con `--sessions 2 --context 262144` y MTP opcional mediante el sidecar `MTP/mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf`. El formato GGUF es compatible con el ecosistema llama.cpp, pero la disposición específica de tipos está pensada para el cargador Flash-Next de gufo; no se confirma compatibilidad con otros motores en la información disponible.
- Latencia y throughput: 26,3 tok/s sin MTP y 46,2 tok/s con `--draft-tokens 5` en Strix Halo con gufo.
- Almacenamiento: 112,2 GB para el repositorio completo; el shard de carga es `...-00001-of-00003.gguf` (47,6 GB) y el cargador localiza los demás.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Este modelo (Swift-1.5-Qwen3.8-Flash-Next Q4_K_XL) | 176,9B | 262.144 | swift-open-license-1.0 | GGUF (3 shards) | 71/74 en suite básica; 130k tokens de completion |
| Qwen3.8-Flash-Next UD-Q4_K_XL (unsloth) | no disponible | no disponible | no disponible | GGUF | 68/74; 267k tokens de completion; base de la disposición de tipos |
| Swift-1.5 Qwen3.8-27B FP8 (Radiance) | ~27B | no disponible | no disponible | FP8 | 72/74; 186k tokens; ejecutado en R9700 ×2 |
| Qwen3.8-27B FP8 (base) | ~27B | no disponible | no disponible | FP8 | 67/74; 311k tokens |

La comparación se limita a los datos de la suite del autor; no hay benchmarks estándar publicados para ninguno de los cuatro en la información disponible. El modelo de 27B en FP8 requiere menos memoria que los ~111 GB de esta cuantización y obtiene una tasa de acierto similar, pero con más tokens de razonamiento.

## Limitaciones y advertencias

- Diferencias de acierto no significativas: con 74 tareas por modelo, el autor califica las diferencias de pass-rate como indicativas, no concluyentes.
- Evaluación incompleta: los resultados con MTP y muestreo, y todo el tier duro (matemáticas difíciles, bugs multi-fichero, agregación sobre ~120k tokens), están pendientes; las conclusiones de rendimiento son parciales.
- Requisito de memoria elevado: 111,3 GB de pesos impiden el despliegue en GPU de consumo; el caso validado es Strix Halo de 128 GB.
- Compatibilidad restringida: la disposición de tipos está diseñada para el cargador Flash-Next de gufo; no se confirma funcionamiento en otros motores GGUF.
- Recuantización desde Q8_0, no desde BF16: el paso adicional de redondeo no se midió por separado, por lo que puede introducir degradación no cuantificada.
- Licencia: swift-open-license-1.0 (etiquetada como `other`); es imprescindible revisar los términos antes de uso comercial, ya que no se detallan en la información disponible.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como modelo generativo, mantiene el riesgo habitual y requiere verificación en producción.
- Autoría y soporte: es una recuantización de un tercero (ethanwtodd), con 59 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento.
- Fecha de creación registrada: 2026-10-30, dato que conviene contrastar con la disponibilidad real del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ethanwtodd/Swift-1.5-Qwen3.8-Flash-Next-Q4_K_XL-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF de origen (Q8_0): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Repositorio GSQ-RCO (importance matrix): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Cuantización de referencia UD-Q4_K_XL: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio MTP de Swift: https://huggingface.co/adriandj3/Swift-1.5-Qwen3.8-Flash-Next-MTP-for-GGUF-and-NVFP4
- Motor gufo: https://github.com/gufo-org/gufo
