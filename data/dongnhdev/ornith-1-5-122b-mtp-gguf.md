# dongnhdev/Ornith-1.5-122B-MTP-GGUF

## Resumen

Ornith-1.5-122B-MTP-GGUF es una cuantización GGUF del punto de control Ornith-1.5-122B, un modelo de lenguaje de arquitectura Mixture-of-Experts derivado de la familia Qwen3.5 (identificador interno `Qwen3.5-122B-A10B-ck2100-v1014-MTP1740`, arquitectura `qwen35moe`, 899 tensores y 256 expertos). El modelo original lo desarrolla Ornith AI dentro de su línea de investigación en auto-mejora (*self-scaffolding*), y esta versión la publica el usuario dongnhdev como empaquetado listo para llama.cpp.

El interés de esta ficha no está en el modelo base, sino en el trabajo de compresión: un GGUF mixto de 37,36 GB que combina IQ2_XXS para los expertos enrutados con Q4_K/Q6_K en las capas densas de atención y FFN, a unos 2,45 bits por peso y asistido por matriz de importancia (imatrix). Incluye además la cabeza de predicción multi-token (`blk.48.nextn.*`) como bloque borrador para decodificación especulativa, y dos proyectores de visión (BF16 y F16), por lo que el conjunto es multimodal texto-imagen.

Es relevante ahora porque permite ejecutar un MoE de 122 B con unos 10 B de parámetros activos y 262 144 tokens de contexto nativo en equipos de memoria unificada de 128 GB, o en una única GPU de 80 GB, algo inviable con los pesos en BF16. Conviene tener presente que es una subida reciente, sin descargas ni validación comunitaria, y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE decoder-only, arquitectura `qwen35moe` (familia Qwen3.5-MoE), 256 expertos, 899 tensores, con cabeza de predicción multi-token (MTP) |
| Parámetros totales | 122 B (nominal del punto de control Ornith-1.5-122B); los metadatos de safetensors del repo declaran 451 290 864, cifra incoherente con el tamaño del GGUF y que debe considerarse errónea |
| Parámetros activos | ≈10 B (sufijo A10B del punto de control); número de expertos activos por token: no disponible |
| Longitud de contexto | 262 144 tokens (contexto nativo, según el repositorio de referencia de irr/ornith-1.5-122b) |
| Tipos de cuantización | GGUF mixta: IQ2_XXS ×98 (expertos enrutados), Q4_K ×331, Q6_K ×51, Q2_K ×49, F32 ×370 (normas y sesgos); ≈2,45 bits por peso, asistida por imatrix |
| Idiomas soportados | inglés (en) y vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos principales + proyectores de visión `mmproj` en BF16 y F16) |

Ficheros del repositorio (39,5 GB en total):

| Fichero | Tamaño | Contenido |
|---|---|---|
| `Ornith-1.5-122B-IQ2-MTP.gguf` | 37,36 GB | Pesos principales, incluye cabeza MTP |
| `mmproj-Ornith-1.5-122B-BF16.gguf` | 912 MB | Proyector de visión en BF16 |
| `mmproj-Ornith-1.5-122B-F16.gguf` | 909 MB | Proyector de visión en F16 |
| `imatrix_unsloth.gguf_file` | 359 MB | Matriz de importancia usada en la cuantización |
| `mask_row_248077.f32` | 12 KB | Fila de prueba de máscara de visión (fixture de referencia) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con mezcla de expertos (`qwen35moe`): 256 expertos, 899 tensores y enrutamiento disperso, con unos 10 B de parámetros activos por token frente a los 122 B totales. La model card indica «256 experts × 6.7B», cifra que no se detalla y que no puede interpretarse literalmente como parámetros por experto sin contradecir el total del punto de control. El bloque `blk.48.nextn.*` corresponde a la cabeza de predicción multi-token (MTP), un módulo adicional que predice varios tokens futuros y que los runtimes compatibles pueden usar como borrador para decodificación especulativa; si el runtime no lo soporta, el modelo funciona como decoder MoE convencional.

El autor del GGUF no publica detalles sobre el entrenamiento del modelo base: composición del dataset, número de tokens, fases de RLHF/DPO o procesos de destilación no están disponibles en la información proporcionada. Lo único documentado sobre el linaje es la descripción de Ornith AI, que sitúa Ornith-1.5 como una extensión del marco de auto-mejora de Ornith-1.0, en el que el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de solución. La innovación técnica verificable en este repositorio es puramente de compresión e inferencia: cuantización mixta dependiente de la importancia de los pesos (IQ2_XXS solo en expertos enrutados, dejando atención y tiles densos en Q4_K/Q6_K) y la mencionada cabeza MTP para especulación.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del punto de control Qwen3.5-MoE de 122 B; no hay evaluación específica publicada para la variante Ornith.
- Generación y análisis de código: el modelo base se ha probado en guías públicas con pruebas de programación reales sobre llama.cpp.
- Procesamiento de imágenes: el repositorio incluye proyectores `mmproj` en BF16 y F16, lo que habilita entrada visual (descripción de imágenes, lectura de documentos escaneados) mediante `llama-mtmd-cli`.
- Contexto largo: ventana nativa de 262 144 tokens, adecuada para repositorios de código o documentos extensos.
- Decodificación especulativa: la cabeza MTP incluida permite acelerar la generación en runtimes que soportan el bloque `nextn` de Qwen3.5-MoE, o usar un borrador externo (por ejemplo DFlash2, según el repositorio de referencia).
- Multilingüismo limitado: inglés y vietnamita declarados; no se anuncia soporte explícito de castellano.
- Tool calling, function calling y comportamiento agéntico multi-paso: no documentado en la información disponible para esta variante.
- Modo de razonamiento explícito (*thinking*): no documentado.

## Casos de uso

- **Estación de trabajo local con memoria unificada.** En una máquina AMD Strix Halo (gfx1151) con 128 GB de memoria unificada, el GGUF de 37,36 GB deja margen suficiente para el proyector de visión y una caché KV amplia; el repositorio irr/ornith-1.5-122b documenta precisamente la ejecución al contexto nativo completo de 262 144 tokens con MTP activado.
- **Análisis de repositorios y documentación extensa.** Con 262 144 tokens de ventana se pueden cargar decenas de ficheros de código o un corpus documental completo en una sola pasada, evitando pipelines de troceado y recuperación para tareas de resumen, auditoría o explicación de arquitectura.
- **Atención al cliente en vietnamita e inglés.** El modelo declara ambos idiomas y un coste por token bajo gracias a los ~10 B de parámetros activos, lo que permite servir conversaciones multi-turno con contexto largo en una única GPU de 80 GB para varios usuarios concurrentes.
- **Procesamiento de documentos escaneados.** Con `llama-mtmd-cli` y el proyector F16 se pueden extraer datos de facturas, albaranes o capturas de pantalla, combinando OCR implícito con razonamiento sobre el texto extraído en la misma pasada.
- **Asistente de código on-premise con requisitos de privacidad.** Equipos que no pueden enviar código a APIs externas pueden desplegar `llama-server` con este GGUF y la cabeza MTP activa para reducir la latencia de decodificación en autocompletado y revisión de parches.
- **Investigación en decodificación especulativa.** El bloque `blk.48.nextn` y el fichero de matriz de importancia permiten experimentos reproducibles sobre tasas de aceptación del borrador MTP frente a drafters externos, sin necesidad de descargar los pesos completos.
- **Estudio de compresión extrema en MoE.** La mezcla IQ2_XXS/Q4_K/Q6_K con 2,45 bits por peso sirve como caso de referencia para medir la degradación de calidad al bajar de 4 bits en modelos con expertos enrutados, comparando contra la cuantización MXFP4 del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y las referencias web localizadas (guía de mindstudio.ai, colección de ornith-ai, repositorio irr/ornith-1.5-122b) no aportan cifras numéricas de evaluación. Tampoco hay datos de throughput o de tasa de aceptación del borrador MTP.

## Requisitos de hardware

- **Peso de los ficheros:** 37,36 GB (unos 34,8 GiB) para el GGUF principal, más 0,91 GB del proyector de visión BF16 y 0,36 GB de la imatrix si se conserva. Solo los pesos exigen, por tanto, unos 38,3 GB de memoria.
- **VRAM estimada para inferencia:** alrededor de 40-44 GB con contexto corto (2-8 K tokens) contando caché KV y buffers de cómputo; el tamaño exacto de la caché KV para 262 144 tokens no está disponible, pero a esa longitud supera con holgura el de los pesos.
- **GPU recomendadas:** A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB o RTX PRO 6000 96 GB. En una A100 40 GB el modelo entra muy justo y sin margen para contexto largo.
- **¿Cabe en GPU de consumo?** No en una sola unidad: 24 GB de una RTX 4090 o 32 GB de una RTX 5090 son insuficientes. Es viable en configuraciones de 2× RTX 4090 (48 GB) con reparto de capas en llama.cpp, asumiendo penalización de ancho de banda, o en equipos con memoria unificada grande (Strix Halo de 128 GB, Apple Silicon de 64 GB o más con swap a evitar).
- **Opciones de despliegue:** llama.cpp es la vía documentada (`llama-cli` para texto, `llama-mtmd-cli` con `--mmproj` para visión, `llama-server` para API HTTP); Ollama puede importar el GGUF. vLLM y TGI no están documentados para este fichero y, en el caso de vLLM, la cuantización IQ2_XXS no es un formato habitual de su backend. El soporte de MTP depende del runtime: sin él, el modelo funciona como decoder MoE normal.
- **Latencia y throughput:** no disponibles. Como referencia estructural, los ~10 B de parámetros activos sitúan el coste por token muy por debajo de un modelo denso de 122 B, y la cabeza MTP está pensada para recortar la latencia de decodificación cuando el runtime la aprovecha.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-MTP-GGUF (este repo) | 122 B totales / ≈10 B activos | 262 144 | IQ2 mixta, ≈2,45 bpw, 37,36 GB | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Ornith-1.5-122B MXFP4_MOE-MTP (prithivMLmods) | 122 B totales / ≈10 B activos | no disponible en la información recogida | MXFP4 (≈4 bits), tamaño no disponible | no disponible | Hugging Face |
| Ornith-1.5-122B (punto de control original, colección ornith-ai) | 122 B totales / ≈10 B activos | 262 144 | Safetensors en precisión completa, tamaño no disponible | Apache-2.0 (según el GGUF derivado) | Hugging Face (colección ornith-ai) |

No se dispone de datos verificables de benchmarks que permitan comparar calidad entre estas tres variantes; la comparación relevante es de compromiso memoria/calidad: el MXFP4 a ~4 bits ocupa aproximadamente el doble y preserva mejor los expertos, mientras que este IQ2 minimiza el espacio a costa de una pérdida de fidelidad mayor en las capas enrutadas. No se han identificado en la búsqueda modelos de otra familia con especificaciones confirmadas para establecer una comparación cruzada fiable.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización extrema:** con ≈2,45 bits por peso y expertos enrutados en IQ2_XXS, la degradación respecto al punto de control en BF16 es esperable y no está cuantificada. No debe usarse como referencia del rendimiento real de Ornith-1.5-122B.
- **Metadatos incoherentes:** el repositorio declara 451 290 864 parámetros en safetensors frente a los 122 B del nombre y del tamaño del GGUF (37,36 GB a 2,45 bpw equivalen a ≈122 B). Hay que tratar ese campo como erróneo.
- **Sin validación comunitaria:** 0 descargas y 0 likes, con creación y actualización del repositorio el mismo día. No hay informes independientes de calidad ni de estabilidad.
- **Ausencia total de benchmarks:** no es posible verificar afirmaciones de rendimiento en razonamiento, código o matemáticas.
- **Cobertura de idiomas limitada:** solo inglés y vietnamita declarados; el rendimiento en castellano no está documentado y probablemente sea inferior.
- **Riesgo de alucinación:** no evaluado; es un riesgo estándar en modelos de este tamaño sin datos de ajuste alineado publicados.
- **Dependencia del runtime para visión y MTP:** el proyector `mmproj` debe coincidir con el runtime (`llama-mtmd-cli`) y la cabeza `blk.48.nextn` solo aporta aceleración en runtimes con soporte de MTP de Qwen3.5-MoE; en otros casos se desaprovecha.
- **Contexto máximo y memoria:** usar los 262 144 tokens exige mucha más memoria que los pesos; en GPUs de 40-48 GB hay que reducir la ventana o cuantizar la caché KV, con la consiguiente pérdida de la principal ventaja del modelo.
- **Licencia:** el GGUF se distribuye como Apache-2.0, lo que permite uso comercial, pero conviene verificar los términos del punto de control Qwen3.5 subyacente antes de un despliegue en producción.
- **Ficheros auxiliares:** la imatrix (359 MB) y la máscara de prueba (12 KB) son artefactos de referencia, no necesarios para inferir; incluirlos infla la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dongnhdev/Ornith-1.5-122B-MTP-GGUF
- Cuantización MXFP4 del mismo modelo (prithivMLmods): https://huggingface.co/prithivMLmods/Ornith-1.5-122B-MXFP4_MOE-MTP
- Colección Ornith-1.5 de ornith-ai: https://huggingface.co/collections/ornith-ai/ornith-15
- Guía de ejecución local con llama.cpp (mindstudio.ai): https://www.mindstudio.ai/blog/ornith-1-5-122b-local-coding-test
- Repositorio de referencia para Strix Halo con contexto completo y MTP (irr): https://github.com/irr/ornith-1.5-122b/blob/main/README.md
- Sitio oficial de Ornith AI: https://ornith.ai/
