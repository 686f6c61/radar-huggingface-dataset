# openbmb/MiniCPM-OCR-1.0-gguf

## Resumen

MiniCPM-OCR 1.0 en formato GGUF es la build cuantizada para llama.cpp del primer modelo de la familia MiniCPM-V/o especializado exclusivamente en OCR y comprensión de documentos, desarrollado por OpenBMB. Convierte imágenes de páginas y PDFs en texto, tablas, fórmulas, gráficos y sellos, y admite extracción de información clave, cubriendo documentos en inglés y chino, incluidas capturas escaneadas, curvadas, inclinadas o recapturadas con cámara.

El repositorio no contiene los pesos originales, sino hasta once niveles de cuantización GGUF (de F16 a Q4_0) más un proyector de visión obligatorio (`mmproj-model-f16-4x.gguf`, 0,901 GB) con downsample 4x. El modelo base se publica como "1.3B", aunque los pesos safetensors registrados suman 752.167.744 parámetros; esa discrepancia no queda aclarada en la información disponible. El tamaño reducido permite ejecutar el parser completo en una sola GPU de consumo o incluso en CPU.

Su relevancia ahora es doble: por un lado, un modelo OCR de pesos abiertos con licencia Apache 2.0 y despliegue local trivial vía `llama-server`; por otro, el ecosistema que lo acompaña (variantes AWQ W4A16 y GPTQ W4A16, borradores DSpark para decodificación especulativa y el modelo complementario Jev, que puntúa de 0 a 1 la calidad de un resultado OCR). El autor declara 93,68 en Real5-OmniDocBench y una velocidad 3,62 veces superior a MinerU; son cifras vendor-reported, sin verificación independiente en la información consultada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal image-text-to-text de la familia MiniCPM-V/o: backbone LLM más proyector de visión con downsample 4x. Detalle del codificador visual no disponible |
| Parámetros totales | 752.167.744 en los pesos safetensors del modelo base; el autor lo denomina "1.3B" (posible cómputo conjunto con el codificador visual, no aclarado) |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 40.960 tokens en el ejemplo oficial de despliegue (`--ctx-size 40960`); máximo soportado no documentado |
| Tipos de cuantización | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0; además AWQ W4A16 y GPTQ W4A16 en repositorios separados |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 (pesos, código y documentación) |
| Formato de pesos | GGUF para llama.cpp; el modelo base se distribuye en safetensors BF16 |
| Proyector de visión | `mmproj-model-f16-4x.gguf`, 0,901 GB, downsample 4x, obligatorio; no existe variante 16x |
| Tamaño del repositorio | 13,1 GB |
| Tamaño de pesos por tier | F16 1,516 GB · Q8_0 0,812 GB · Q6_K 0,630 GB · Q5_K_M 0,578 GB · Q4_K_M 0,529 GB · Q4_0 0,501 GB |
| Descargas / likes | 2.004 descargas, 14 likes (en el momento de la consulta) |
| Fecha de publicación | 21 de octubre de 2026; actualizado el 27 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe un modelo multimodal de tipo image-text-to-text compuesto por un backbone de lenguaje y un proyector de visión con factor de downsample 4x, integrado en la familia MiniCPM-V/o y especializado en parsing documental en lugar de conversación general. El chat template embebido lleva el modo "thinking" desactivado de forma forzada: `enable_thinking` no puede reactivarlo, lo que confirma que el entrenamiento está orientado a salida directa y determinista (los ejemplos oficiales usan `--temp 0`) y no a razonamiento extendido. No se detallan en la información proporcionada el tipo exacto de codificador visual, la posición de las capas del proyector ni la configuración del transformer.

Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí se documenta es la existencia de cabezas de decodificación DSpark, publicadas como checkpoint borrador independiente (BF16 y GGUF) y utilizables en llama.cpp con `--spec-type draft-dspark`; el autor atribuye a esta decodificación especulativa una mejora del 55% en eficiencia end-to-end. El pipeline de parsing es por regiones: se recortan bloques y se invocan con prompts distintos (`Text Recognition:`, `Table Recognition:`, `Formula Recognition:`), lo que implica un orquestador de layout externo (el SDK `minicpmvocr`) que ensambla el resultado final.

## Capacidades

- Reconocimiento de texto en bloques, párrafos, títulos y páginas completas mediante el prompt `Text Recognition:`.
- Reconocimiento de tablas con el prompt `Table Recognition:`, preservando estructura de filas y columnas.
- Reconocimiento de fórmulas en display con `Formula Recognition:`.
- Parsing de gráficos y sellos dentro de documentos, según la descripción del autor.
- Extracción de información clave (key information extraction) de documentos y PDFs.
- Robustez declarada ante páginas escaneadas, curvadas, inclinadas y recapturadas con cámara.
- Salida estructurada en Markdown cuando se usa a través del SDK (`--input doc.pdf --output doc.md`).
- Decodificación especulativa compatible con el borrador DSpark en llama.cpp para acelerar la generación.
- No soporta tool calling ni function calling según la información disponible; el modelo está diseñado como parser, no como agente conversacional.
- Capacidades multilingües limitadas a inglés y chino; no se documenta soporte de otros idiomas.
- Sin modo thinking: desactivado en el chat template y no reactivable.

## Casos de uso

- Digitalización de facturas y albaranes con extracción de campos: el modelo procesa el recorte de cada región (cabecera, líneas de detalle, totales) y devuelve texto y tablas que se mapean a un esquema JSON en el orquestador; su ventana de 40.960 tokens permite mantener varias regiones en contexto sin reiniciar la sesión.
- Conversión de PDFs escaneados a Markdown para bases de conocimiento: el SDK `minicpmvocr` encadena layout, reconocimiento y ensamblado y emite un `.md` listo para ingesta, lo que encaja en pipelines RAG que necesitan tablas y fórmulas preservadas.
- Documentación técnica y científica con fórmulas: usando `Formula Recognition:` sobre regiones de ecuación se obtiene la expresión en texto, adecuado para manuales, papers y hojas de especificaciones.
- Captura móvil de documentos en campo: el modelo declara tolerancia a páginas curvadas, inclinadas y recapturadas, un escenario habitual en seguros, logística o inspecciones donde no hay escáner plano.
- Documentos administrativos con sellos en inglés o chino: comercio exterior, aduanas y compliance, donde es necesario localizar y transcribir sellos además del cuerpo del texto.
- Despliegue on-premise o en el borde: con pesos Q4_K_M de 0,529 GB más el proyector de 0,901 GB, el parser cabe en hardware modesto y no requiere enviar documentos a la nube, lo que simplifica el cumplimiento de protección de datos.
- Control de calidad del propio OCR: combinado con MiniCPM-OCR Jev, que devuelve una puntuación de 0 a 1 por resultado, se puede enrutar automáticamente a revisión humana todo documento por debajo de un umbral.
- Procesamiento batch de archivos históricos: en CPU de 48 hilos el ciclo completo por imagen de tabla ronda los 21 s, suficiente para volcados nocturnos de colecciones sin GPU.

## Benchmarks y rendimiento

Los datos disponibles son escasos y todos ellos reportados por el autor o por prensa que cita al autor; no se han localizado resultados independientes ni métricas estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de este tipo y no se publican.

| Métrica | Valor | Naturaleza del dato |
|---|---|---|
| Real5-OmniDocBench | 93,68 | Reportado por el autor (vendor-reported) |
| Velocidad frente a MinerU | 3,62x más rápido | Reportado por el autor |
| Mejora end-to-end con DSpark | +55% de eficiencia | Reportado por el autor |
| Carga de modelo + proyector (RTX 5090, F16) | ≈2,3 s | Ejemplo oficial de despliegue |
| Un recorte de tabla (1.312 tokens de prompt / 265 de salida, F16) | ≈1,0 s | Ejemplo oficial de despliegue |
| VRAM con `--ctx-size 40960` (RTX 5090 32 GB, F16) | ≈26 GB | Ejemplo oficial de despliegue |
| Una imagen de tabla end-to-end en CPU (48 hilos) | ≈21 s | Ejemplo oficial de despliegue |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Pesos en VRAM: entre 0,50 GB (Q4_0) y 1,52 GB (F16) para el LLM, más 0,90 GB fijos del proyector de visión; en total, aproximadamente 1,4 GB en Q4_K_M y 2,4 GB en F16.
- La VRAM real la domina la caché KV: el ejemplo oficial con F16 y `--ctx-size 40960` ocupa unos 26 GB en una RTX 5090 de 32 GB. Con contextos de 8.192 tokens (usado en el ejemplo de `llama-mtmd-cli`) la huella es muy inferior, aunque no se publica la cifra exacta.
- GPU recomendadas: cualquier GPU con suficiente memoria para el contexto elegido. El autor documenta una RTX 5090 (32 GB); por tamaño de pesos, tarjetas de 8-12 GB como una RTX 4070 o RTX 3060 son suficientes para los tiers Q4/Q5 con contextos moderados. A100 y H100 son compatibles pero sobredimensionadas para este modelo; no se publican cifras de throughput en esas GPU.
- Cabe en GPU de consumo: sí. Los tiers Q4_K_M (0,529 GB) y Q8_0 (0,812 GB), junto con el proyector, se cargan en cualquier GPU consumer con 6 GB o más si se limita el contexto.
- CPU: funciona sin GPU. Con 48 hilos, una imagen de tabla completa (layout, reconocimiento y ensamblado) tarda unos 21 s. `--n-gpu-layers 0` fuerza modo CPU.
- Opciones de despliegue: `llama-server` con `--model` y `--mmproj`, `llama-mtmd-cli` para pruebas puntuales, y el SDK Python `minicpmvocr` con backend `--backend llamacpp` apuntando al servidor local. Existen variantes AWQ W4A16 y GPTQ W4A16 para stacks que consuman esos formatos.
- Concurrencia: `llama-server` atiende una petición a la vez por defecto. El SDK debe configurarse con `pipeline.queue_mode=serial` y `pipeline.max_workers=1`; para escalar hay que levantar varias instancias.
- Latencia: alrededor de 1,0 s por recorte de tabla (1.312 tokens de prompt, 265 de salida) con F16 en RTX 5090, más 2,3 s de carga inicial. La decodificación especulativa con DSpark puede reducir el tiempo por token según el autor (+55% de eficiencia end-to-end).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos disponibles |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (esta build GGUF) | 752 M en safetensors; "1.3B" declarado | 40.960 en el ejemplo oficial | Parser OCR multimodal (texto, tablas, fórmulas, gráficos, sellos, KIE) | Apache 2.0 | GGUF, BF16, AWQ W4A16, GPTQ W4A16, DSpark |
| MiniCPM-OCR Jev | 2B | no disponible | Modelo de decisión de corrección OCR: puntúa de 0 a 1 la calidad de un resultado | Apache 2.0 (según la suite) | no disponible en la información consultada |
| MinerU | no disponible | no disponible | Pipeline de parsing documental; referencia de velocidad frente a la que el autor declara 3,62x | no disponible en la información consultada | no disponible |

La comparación con Jev no es de competencia sino de complementariedad: Jev actúa como verificador del resultado de MiniCPM-OCR 1.0. No se dispone en la información proporcionada de datos verificados de parámetros, contexto o benchmarks de otras alternativas de OCR basadas en VLM (olmOCR, dots.ocr u otras), por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino. No hay soporte documentado de castellano ni de otras lenguas, por lo que su uso en documentos en español no está garantizado.
- Discrepancia de tamaño: el autor lo presenta como 1.3B, pero los pesos safetensors suman 752.167.744 parámetros. Conviene verificar el cómputo real antes de dimensionar infraestructura.
- No es un modelo conversacional ni de propósito general: está entrenado para parsing documental y el modo thinking está desactivado de forma no reversible en el chat template. No se documenta soporte de tool calling ni de razonamiento multi-paso.
- Degradación por cuantización: con Q4_K_M el autor advierte que las tablas se mantienen sin pérdida pero el texto denso sufre una degradación pequeña, y que en documentos con mucho código o XML pueden perderse las barras de cierre de etiquetas. Para páginas con código o XML recomienda Q8_0.
- Riesgo de alucinación: no se publican tasas de error por tipo de documento ni evaluación específica de manuscritos. El modelo no documenta soporte de escritura manual, así que en páginas manuscritas la fiabilidad es desconocida y debe validarse con Jev o con revisión humana.
- Fórmulas y gráficos: solo se documenta el reconocimiento de fórmulas en display; no se detalla el comportamiento con fórmulas inline ni con gráficos complejos.
- Dependencia del orquestador: el resultado final depende del pipeline de layout del SDK. Una detección de regiones deficiente degrada la salida aunque el reconocimiento sea correcto.
- Concurrencia limitada en el despliegue de referencia: `llama-server` procesa una petición cada vez; en producción hay que replicar instancias y balancear.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe, y de indicar cambios. No se identifican cláusulas adicionales en la información disponible.
- Cifras de rendimiento procedentes del autor: el 93,68 de Real5-OmniDocBench, el 3,62x frente a MinerU y el +55% de DSpark no están verificados de forma independiente en la información consultada.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante AWQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ
- Variante GPTQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ
- Borrador DSpark (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Borrador DSpark (GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Repositorio en ModelScope del modelo base: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0
- Repositorio en ModelScope de la build GGUF: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-gguf
- Repositorio en ModelScope de la variante AWQ: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-AWQ
- Repositorio en ModelScope de la variante GPTQ: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-GPTQ
- Repositorio en ModelScope del borrador DSpark: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark
- Repositorio en ModelScope del borrador DSpark GGUF: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-OCR
- Documentación de la API: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_api_en.md
- Guía de despliegue con llama.cpp: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/llamacpp_deploy.md
- FAQ: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md
- Licencia Apache 2.0 del proyecto: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/LICENSE
- Demo de parsing documental: https://platform.modelbest.ai/console/playground/document-parse
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Análisis en explainx.ai: https://explainx.ai/blog/minicpm-ocr-1-0-jev-openbmb-apache-2-document-parsing-quality-judge-dspark-how-to-run-2026
- Noticia en aicoder.com: https://aicoder.com/news/news-20261028-openbmb-minicpm-ocr-1-0-jev-open-source-ocr-suite
- Noticia en cpu3d.com: https://cpu3d.com/en/ainews/novaya-model-minicpm-ocr-1-0-image-text-to-text/
