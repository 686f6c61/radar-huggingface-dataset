# fesfes1/alesha-pro-Hy4-flash-Uncensored-GGUF

## Resumen

alesha-pro-Hy4-flash-Uncensored-GGUF es una cuantización GGUF del modelo Tencent Hy4-flash, un transformer MoE de 222.679.844.717 parámetros (aproximadamente 220B) desarrollado originalmente por Tencent. Esta versión, publicada por el usuario fesfes1 bajo el paraguas de "alesha-pro", mantiene la ventana de contexto completa de 262.144 tokens, la entrada de imagen y la capa MTP (multi-token prediction), pero añade un vector de abliteración que elimina la mayoría de los rechazos del modelo base. El objetivo declarado es ejecutar un modelo de 220B en tarjetas de consumo RTX 3090, algo que el llama.cpp estándar no permite: requiere el fork Project Maya, rama `hy4-flash`.

La relevancia de esta ficha es doble. Por un lado, documenta una de las pocas rutas prácticas para inferir un MoE de 220B con contexto de 256K en hardware de 24 GB por GPU, mediante cuantizaciones Q3_K e IQ2_XXS y una tabla Engram separada. Por otro, ilustra una técnica de "uncensoring" que no modifica los pesos: proyecta direcciones de rechazo fuera del residual stream en tiempo de ejecución, con un coste medido de fidelidad respecto al modelo stock.

El modelo base es Tencent Hy4-flash, del que no se dispone de model card detallada en la información proporcionada. La licencia es la Tencent Hy License v1.0, derivada de Apache 2.0 con términos adicionales para grandes negocios de Model-as-a-Service en su sección 10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capa MTP y torre de visión; cuatro "hyper-connection streams" según la model card |
| Parametros totales | 222.679.844.717 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q3_K (expertos Q3_K/Q4_K, atención Q8_0, MTP Q3_K/Q8_0) e IQ2_XXS (expertos IQ2); torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License v1.0 (derivada de Apache 2.0, con términos extra para grandes negocios de Model-as-a-Service en la sección 10) |
| Formato de pesos | GGUF (trunk + tabla Engram en dos ficheros por cuantización, más `mmproj` de visión en BF16) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la composición del dataset de entrenamiento ni si hubo RLHF o DPO. Lo que sí se documenta es la arquitectura: un MoE con expertos enrutados (123 tensores de expertos enrutados en las capas 1 a 41, según el script de merge), una capa MTP en `blk.42` con 21 tensores, una tabla Engram separada y cuatro "hyper-connection streams" por capa. La model card menciona que el vector de abliteración contiene direcciones de rechazo "para cada capa y cada uno de los cuatro hyper-connection streams", lo que confirma esa estructura de cuatro flujos residuales.

La innovación técnica más destacable de esta distribución no está en el modelo base, sino en el empaquetado. El trunk Q3_K ocupa 86,2 GB y la tabla Engram 63,4 GB; el conjunto IQ2_XXS reduce el trunk a 51,1 GB manteniendo la misma tabla Engram (almacenada una sola vez por conjunto). La capa MTP fue recuantizada de BF16 a Q3_K/Q8_0/F32 para que quepa junto al contexto de 256K en tarjetas de 24 GB. El modo de una sola GPU coloca la tabla Engram en NVMe con `HY4F_ENGRAM_IO=direct`, reduciendo el uso de RAM de 137 GiB a 78 GiB (o 45 GiB en la variante IQ2).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Entrada de imagen: pipeline `image-text-to-text` con torre de visión en BF16 (`mmproj-Hy4-flash-bf16.gguf`).
- Predicción multi-token (MTP) mediante la capa `blk.42`, lo que acelera la decodificación.
- Modo "thinking" (razonamiento explícito) según la tabla de rechazos de la model card, que distingue entre "thinking off" y "thinking on".
- Modo sin censura opcional: el vector de abliteración reduce los rechazos, con la posibilidad de desactivarlo borrando la línea `HY4F_ABLATE` de la configuración.
- Servidor compatible con la API de chat de OpenAI en `/v1`, lo que facilita la integración con clientes existentes.
- Tool calling y function calling: no se menciona explícitamente en la información disponible.
- Capacidades de agente multi-paso: no se mencionan explícitamente.
- Idiomas: no disponible.

## Casos de uso

- Inferencia de un MoE de 220B en hardware de consumo: con 4x RTX 3090 y Q3_K se obtienen 176-251 tok/s de decodificación y 2.947 tok/s de prefill, suficiente para servir un asistente conversacional de altas prestaciones sin clúster de datacenter.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite ingerir libros completos, expedientes o bases de código en una sola pasada; el modo de 1 GPU con Engram en NVMe hace viable este escenario con 45 GiB de RAM en la variante IQ2.
- Análisis de imágenes en pipelines de visión-lenguaje: la torre de visión BF16 permite tareas de image-text-to-text, como descripción de capturas, extracción de datos de formularios escaneados o respuesta a preguntas sobre diagramas.
- Investigación sobre alineación y abliteración: el par stock/uncensored con métricas de rechazo (AdvBench 64 + JailbreakBench 82: 139 rechazos stock frente a 32 uncensored) y de divergencia (KL mediana 0,014, 85,7% de coincidencia en el token top) sirve como banco de pruebas reproducible para estudiar el efecto de proyectar direcciones de rechazo.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en GPUs locales con un servidor compatible con la API de OpenAI, permite mantener datos sensibles fuera de servicios en la nube.
- Generación de código y razonamiento técnico: el modo thinking y el contexto largo son adecuados para revisar repositorios completos o razonar sobre trazas de error extensas, aunque no se han publicado benchmarks de código en la información disponible.
- Prototipado de asistentes con requisitos de contenido permisivo: el modo uncensored reduce los rechazos en solicitudes legítimas (1 rechazo stock frente a 0 en 64 solicitudes harmless), útil en dominios creativos o de investigación donde la censura introduce fricción.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Los únicos datos cuantitativos son de rendimiento de inferencia y de fidelidad de la cuantización y la abliteración:

| Metrica | Valor |
|---|---|
| 4x RTX 3090, Q3_K, decodificacion | 176 a 251 tok/s |
| 4x RTX 3090, Q3_K, prefill | 2.947 tok/s |
| 2x RTX 3090, Q3_K, decodificacion | 70 a 104 tok/s |
| 2x RTX 3090, Q3_K, prefill | 1.225 tok/s |
| 2x RTX 3090, IQ2, decodificacion | 95 a 123 tok/s |
| 2x RTX 3090, IQ2, prefill | 1.999 tok/s |
| 1x RTX 3090, Q3_K, decodificacion | 37 a 54 tok/s |
| 1x RTX 3090, Q3_K, prefill | 1.510 tok/s |
| 1x RTX 3090, IQ2 con Engram en NVMe, decodificacion | 54 a 68 tok/s |
| 1x RTX 3090, IQ2 con Engram en NVMe, prefill | 1.184 a 1.199 tok/s |
| Rechazos en held-out (stock vs uncensored) | 139 vs 32 (AdvBench 64 + JailbreakBench 82, thinking off); 22 vs 3 (AdvBench 24, thinking on); 1 vs 0 (harmless 64) |
| Fidelidad de la abliteracion | 85,7% de coincidencia en token top (dos ejecuciones stock coinciden en 88,3%); KL mediana 0,014 |
| Fidelidad de cuantizacion (2 GPUs vs 4 GPUs) | 88,3% mismo token top |
| Fidelidad de cuantizacion (1 GPU vs 4 GPUs) | 88,5% mismo token top |
| Fidelidad de expertos IQ2 | 74 a 76% mismo token top |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM y RAM: el conjunto Q3_K ocupa 150 GB en disco (86,2 GB de trunk + 63,4 GB de Engram); el IQ2_XXS, 115 GB (51,1 GB + 63,4 GB). En 4x RTX 3090 el consumo de RAM es de unos 60 GiB; en 2x RTX 3090, 137 GiB; en 1x RTX 3090, 137 GiB, o 78 GiB con Engram en NVMe (45 GiB en la variante IQ2).
- GPU recomendadas: RTX 3090 (24 GB) es el objetivo declarado. El binario se compila con `CMAKE_CUDA_ARCHITECTURES=86`, arquitectura Ampere. No se documentan otras GPUs.
- Cabe en GPU de consumo: sí, en 1, 2 o 4 RTX 3090 según cuantización y modo. No se mencionan GPUs de 16 GB o menos.
- Opciones de despliegue: exclusivamente el fork Project Maya, rama `hy4-flash` (binario `maya-hy4f`, servidor `python -m serve.server --engine maya`). llama.cpp estándar no carga el modelo según el autor.
- Almacenamiento: el modo de 1 GPU con Engram en NVMe requiere el fichero Engram en disco NVMe y `HY4F_ENGRAM_IO=direct`.
- Latencia y throughput: ver tabla de benchmarks. El prefill varía de 1.184 tok/s (1 GPU, IQ2) a 2.947 tok/s (4 GPUs, Q3_K).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas ni de especificaciones de modelos comparables en la información proporcionada. La comparación más directa posible es con el propio modelo base y con las otras cuantizaciones del ecosistema Hy4-flash:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tencent/Hy4-flash (base) | 222.679.844.717 | 262.144 | safetensors | Tencent Hy License v1.0 | Modelo original, sin abliterar |
| alesha-pro-Hy4-flash-Uncensored-GGUF (Q3_K) | 222.679.844.717 | 262.144 | GGUF | Tencent Hy License v1.0 | Abliterado, MTP recuantizado, Engram separada |
| alesha-pro-Hy4-flash-Uncensored-GGUF (IQ2_XXS) | 222.679.844.717 | 262.144 | GGUF | Tencent Hy License v1.0 | Expertos IQ2 de AtomicChat, menor fidelidad (74-76%) |
| AngelSlim/Hy4-flash-GGUF | no disponible | no disponible | GGUF | no disponible | Fuente del Q3_K y la Engram |
| AtomicChat/Hy4-flash-GGUF | no disponible | no disponible | GGUF | no disponible | Fuente de los expertos IQ2 |

Comparativas con modelos de otros autores: no disponible.

## Limitaciones y advertencias

- La abliteración no elimina todos los rechazos: quedan 32 de 139 en el conjunto held-out con thinking off y 3 de 22 con thinking on. El autor lo indica explícitamente ("Most refusals are gone, not all").
- La abliteración introduce divergencia respecto al modelo stock: 85,7% de coincidencia en token top en texto largo, frente al 88,3% de acuerdo entre dos ejecuciones stock. La KL mediana es 0,014, lo que indica un desplazamiento pequeño pero no nulo de la distribución.
- La cuantización IQ2_XXS se aleja más del modelo base: 74-76% de coincidencia en token top frente al 88,3-88,5% de Q3_K. Para tareas sensibles a la fidelidad, Q3_K es preferible.
- El modelo solo funciona con el fork Project Maya; llama.cpp estándar no lo carga. Esto implica dependencia de un proyecto de terceros y de una rama concreta (`hy4-flash`), con riesgo de mantenimiento.
- El modo de 1 GPU con Engram en NVMe requiere hardware NVMe y añade complejidad de configuración; el rendimiento depende del subsistema de disco.
- La licencia Tencent Hy License v1.0 incluye términos adicionales para grandes negocios de Model-as-a-Service en la sección 10; conviene revisarlos antes de un uso comercial a escala.
- No hay benchmarks de tareas publicados por el autor ("No task benchmarks of my own"), por lo que la calidad en MMLU, HumanEval o GSM8K no está verificada en esta distribución.
- No se documentan sesgos conocidos ni idiomas soportados; el pipeline es image-text-to-text y la model card no detalla la cobertura lingüística.
- Riesgo de alucinación: no cuantificado en la información disponible. Como en cualquier LLM, persiste, y el modo uncensored puede reducir la tendencia a rechazar solicitudes dudosas, lo que exige salvaguardas externas en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-27), lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fesfes1/alesha-pro-Hy4-flash-Uncensored-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio Project Maya (rama `hy4-flash`): https://github.com/alesha-pro/project-maya/tree/hy4-flash
- Documentación de Hy4-flash en Project Maya: https://github.com/alesha-pro/project-maya/blob/hy4-flash/docs/HY4-FLASH.md
- Cuantización Q3_K de AngelSlim: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Expertos IQ2 de AtomicChat: https://huggingface.co/AtomicChat/Hy4-flash-GGUF
- Project Maya original: https://github.com/mw00/project-maya
- Strata (origen de Project Maya): https://github.com/Niko1221/Strata
- llama.cpp y ggml: https://github.com/ggml-org/llama.cpp
