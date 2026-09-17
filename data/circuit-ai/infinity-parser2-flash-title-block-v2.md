# Circuit-AI/infinity-parser2-flash-title-block-v2

## Resumen

Infinity-Parser2-Flash Title Block Extractor (v2), publicado por Circuit-AI, es un ajuste fino mediante LoRA del modelo vision-language infly/Infinity-Parser2-Flash, un VLM de aproximadamente 2.000 millones de parámetros basado en la familia Qwen3.5. Su única tarea es extraer dos campos de identidad —`sheet_no` (número de hoja) y `title` (título de hoja)— a partir del cajetín (title block) de planos de ingeniería y construcción renderizados como imágenes de página completa. La salida es un JSON estructurado con esos dos campos.

El modelo resuelve un problema muy concreto de la digitalización documental: los cajetines de planos suelen ser tablas densas con números de hoja, totales del tipo "OF N", números de página del PDF y nombres de proyecto que no deben confundirse con el título real. El ajuste se entrenó con 1.236 filas revisadas por humanos y sustituye a la versión v1 del mismo autor, corrigiendo fallos conocidos (capturas de números de licencia, totales "OF N", números de orden de página). El repositorio contiene los pesos ya fusionados (LoRA integrado en los pesos base), por lo que se sirve como un modelo único.

Con 2.213.241.664 parámetros y un repositorio de 4,4 GB, es un modelo pequeño y desplegable en una sola GPU de gama alta de consumo, lo que lo hace relevante para pipelines de ingesta documental que necesitan procesar lotes grandes de planos a bajo coste. El entrenamiento se realizó con ms-swift sobre páginas renderizadas a 200 DPI, con `max_pixels` limitado a 8.388.608 tras reproducirse un OOM en el codificador visual con 16M píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basada en transformer (Qwen3.5) con torre de visión (ViT) y aligner; detalles completos de la arquitectura base no disponibles |
| Parametros totales | 2.213.241.664 (2,21 mil millones) |
| Parametros activos | No aplica: no se describe como modelo MoE en la informacion disponible |
| Parametros entrenables | 8,4 millones (0,38 % del total) correspondientes al adaptador LoRA r8/alpha 32 sobre todas las capas lineales; ViT y aligner congelados |
| Longitud de contexto | El entrenamiento usa `max_len` de 32.768 tokens; la longitud de contexto oficial del modelo base no disponible |
| Tipos de cuantizacion | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 en los metadatos de HuggingFace; la model card indica que hereda la licencia del modelo base |
| Formato de pesos | safetensors (transformers) |
| Pipeline | image-text-to-text |
| Entrada | PNG de pagina completa renderizada a 200 DPI |
| Salida | JSON con los campos `sheet_no` y `title` |
| Modelo base | infly/Infinity-Parser2-Flash |
| Tamano del repositorio | 4,4 GB |
| Version | title-v2-full-8m-001, 2026-09-14, git fb06415 (main) |
| Despliegue documentado | vLLM con pesos fusionados; adaptador equivalente cargable en caliente en `experiments/vllm_adapters/title-v2-full-8m-001` (mamba-stripped) |

## Arquitectura y entrenamiento

El modelo es un ajuste supervisado (SFT) mediante LoRA sobre el VLM infly/Infinity-Parser2-Flash, de arquitectura transformer con torre de visión y aligner multimodal. El adaptador usa rango 8 y alpha 32 con objetivos all-linear, dejando congelados el ViT y el aligner; solo 8,4 millones de parámetros (0,38 %) fueron entrenables. Los pesos resultantes se fusionaron en el repositorio publicado, de modo que no es necesario cargar el adaptador por separado en producción. La receta de entrenamiento fue: lr 1e-4 con scheduler coseno, 2 épocas, batch efectivo 8 (1 por dispositivo con acumulación de gradiente 8), precisión bf16, `max_len` 32.768, atención sdpa. El entrenamiento completo duró 310 pasos en 2 horas y 15 minutos, con pérdida final de aproximadamente 0,002 y una precisión de token de 0,999 (checkpoint-310).

La única desviación respecto a la receta de v1 fue reducir `max_pixels` de 16.777.216 a 8.388.608, porque el valor de 16M provocaba OOM en la torre de visión de Qwen3.5 en una RTX 5090 de 32 GB (reproducido cuatro veces, incluso con flash-attn). El servicio funciona con el valor por defecto del procesador y con configuraciones de producción por debajo de 16M. El conjunto de datos v2 (`train_v2_full_8m.jsonl`, 1.236 filas) añade 28 filas de Ferguson-Geo correspondientes a dos proyectos que fallaban previamente: warmlands_avenue (12 páginas con cajetín dibujado como curvas y sin capa de texto) y forge_biologics (16 páginas con celda de doble numeración, donde `sheet_no` es el número de dibujo C0.1, C1.0, TS1.1… y nunca el dígito grande de orden de página). Las 1.208 filas originales se volvieron a renderizar desde los PDF de origen en S3 a 200 DPI con un pipeline verificado como idéntico a nivel de píxel, y las etiquetas de bent-creek se contrastaron (217/219 coincidencias).

## Capacidades

- Extracción de campos estructurados de cajetines de planos de ingeniería: devuelve JSON con `sheet_no` y `title`.
- Comprensión de documentos rasterizados, incluidas páginas sin capa de texto donde el cajetín está dibujado con curvas.
- Desambiguación de identificadores: ignora totales "OF N", números de página del PDF, números de licencia y dígitos de orden de página cuando no son el identificador real.
- Normalización de convenciones de etiquetado: el título de hoja no es el nombre del proyecto, la empresa ni la dirección, y se eliminan sufijos del tipo "FOR: <proyecto>".
- Entrada multimodal imagen-texto con prompt de extracción fijo (esquema de mensajes de ms-swift).
- Capacidad conversacional heredada del modelo base (etiqueta `conversational`), aunque el ajuste está orientado a la tarea de extracción.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, modos de razonamiento explícito ni entrada de audio o vídeo.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Digitalización masiva de archivos de planos: el modelo procesa páginas renderizadas a 200 DPI y devuelve un JSON por hoja, lo que permite indexar automáticamente miles de planos de un archivo histórico en S3 o un EDMS.
- Control de calidad de índices de planos: contrastar el `sheet_no` extraído con el nombre de fichero y el índice declarado para detectar hojas mal nombradas o duplicadas antes de publicar un paquete de entrega.
- Ingesta en sistemas de gestión documental (EDMS/CDE): rellenar metadatos de número y título de hoja al cargar un plano, evitando la introducción manual en proyectos con cientos de láminas.
- Tratamiento de planos escaneados sin capa de texto: el ajuste incluye ejemplos con cajetines dibujados como curvas (warmlands_avenue), por lo que cubre documentos que un parser basado solo en PDF no puede resolver.
- Resolución de numeraciones ambiguas: casos como forge_biologics, donde convive el número de dibujo con un dígito grande de orden de página, se resuelven seleccionando el número de dibujo.
- Automatización de flujos de anotación y revisión: la model card indica que la versión v2 sirve como base para transcripción asistida y localización mediante diff de píxeles en la generación de nuevas etiquetas.
- Procesamiento por lotes con vLLM: al ser un modelo de ~2B optimizado para una sola tarea, se puede desplegar en una GPU y servir peticiones concurrentes de extracción con latencia baja (no se publican cifras de throughput).
- Extracción a escala en proyectos de construcción con múltiples subcontratas: la evaluación sobre 17 proyectos no vistos sugiere capacidad de generalización a nuevas empresas, aunque con las limitaciones descritas más abajo.

## Benchmarks y rendimiento

Conjunto de regresión Ferguson-Geo de 28 páginas (temperatura 0): `sheet_no` 28/28 y `title` 28/28, frente a 19/28 y 17/28 de la línea base v1 en producción. La model card indica que se eliminaron todas las capturas de "GP17-037" en warmlands, los sufijos "FOR: …" y los dígitos de orden de página en forge.

Conjunto retenido de 119 páginas con 4 empresas no vistas (gold proxy = predicciones de producción): `sheet_no` 118/119 (99,2 %) y `title` 116/119 (97,5 %), en paridad con v1. Las discrepancias adjudicadas fueron 1 en `sheet_no` (ROYALTON p1, captura "811" de contacto de servicios), 1 en `title` (texto de bloque de propietario/proyecto añadido, ROYALTON p18) y 1 página con ambos campos erróneos (GLC p8, también incorrecta en producción).

Conjunto retenido en S3 Ferguson-Geo: 17 proyectos no vistos, 52 páginas con ground truth revisado por humanos (sin solapamiento de proyectos con los datos de entrenamiento de v1 ni v2):

| Metrica | Exact match | Containment* | Adjudicated** |
|---|---:|---:|---:|
| sheet_no | 46/52 (88,5 %) | 46/52 (88,5 %) | 46/52 (88,5 %) |
| title | 40/52 (76,9 %) | 45/52 (86,5 %) | 48/52 (92,3 %) |

Comparativa directa contra el modelo v1 desplegado en las mismas 52 páginas:

| Metrica | v1 exact | v1 containment | v2 exact | v2 containment |
|---|---:|---:|---:|---:|
| sheet_no | 46/52 (88,5 %) | 46/52 (88,5 %) | 46/52 (88,5 %) | 46/52 (88,5 %) |
| title | 45/52 (86,5 %) | 47/52 (90,4 %) | 40/52 (76,9 %) | 45/52 (86,5 %) |

Ambos modelos devuelven predicciones idénticas en 39 de las 52 páginas. En las páginas divergentes, la model card señala que las predicciones verbosas de v1 contienen a menudo títulos gold que incluyen texto de proyecto o ubicación (artefacto de la convención de etiquetado del gold en S3, contraria a la convención de esta tarea, que v2 sí respeta), mientras que v2 corrige fallos de v1 en la portada de SUBSTATION (TNORHC800) y en el título de INDIAN WELLS. Los fallos residuales exclusivos de v2 en `sheet_no` son capturas de portada o notas de escala ("83363" de licencia, "30" total OF-N, "NTS" en dos casos). La comparación página a página está en `report.html` dentro de los artefactos de la ejecución de MLflow.

\* Containment: correcto si las cadenas son iguales o una contiene a la otra (normalizado por mayúsculas y espacios, con el lado contenido de al menos 3 caracteres).
\** Adjudicated: excluye 8 páginas en las que el título gold incluye nombre de proyecto o ubicación.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 4,4 GB, coherente con el tamaño del repositorio. La VRAM total necesaria añade el coste de activaciones, caché KV y torre de visión, que depende de la resolución de entrada (`max_pixels`).
- Entrenamiento documentado: RTX 5090 de 32 GB, con `max_pixels` 8.388.608. El valor de 16M produjo OOM en ese mismo hardware.
- Cabe en GPU de consumo: sí, con ~2,21 mil millones de parámetros en bf16 y pesos de 4,4 GB, es viable en tarjetas con 12-16 GB o más si se controla la resolución de imagen; no se publican cifras oficiales de VRAM mínima.
- GPUs recomendadas: no hay recomendación explícita del autor. Por tamaño, cualquier GPU con al menos 8-16 GB de VRAM debería poder servirlo; para lotes concurrentes se beneficia de GPUs tipo A100/H100 o L40S.
- Despliegue documentado: vLLM con los pesos fusionados de este repositorio. También es cargable con transformers (librería declarada). Existe una variante de adaptador "mamba-stripped" para carga en caliente en vLLM.
- No se documentan en la información disponible opciones de despliegue con llama.cpp, Ollama, TGI ni versiones cuantizadas GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| infinity-parser2-flash-title-block-v2 (este modelo) | 2,21 mil millones | `max_len` de entrenamiento 32.768 tokens | Extraccion de `sheet_no` y `title` de cajetines | Apache 2.0 segun metadatos; hereda la del base segun la model card | Pesos fusionados en safetensors, uso con vLLM o transformers |
| infinity-parser2-flash-title-block (v1) | No disponible (mismo modelo base) | No disponible | Misma tarea, version anterior | No disponible | Publicado por Circuit-AI en HuggingFace |
| infly/Infinity-Parser2-Flash (base) | No disponible en la informacion proporcionada | No disponible | VLM de proposito general para parsing de documentos | No disponible | Publicado por infly en HuggingFace |

En el conjunto retenido de 52 paginas de S3, v1 obtiene 45/52 en `title` (exact) frente a 40/52 de v2, mientras que en el conjunto de regresion Ferguson-Geo de 28 paginas v2 alcanza 28/28 en ambos campos frente a 19/28 y 17/28 de v1. No se dispone de datos de benchmarks de terceros ni de comparaciones con otros extractores de cajetines.

## Limitaciones y advertencias

- Modelo de tarea unica: solo extrae `sheet_no` y `title` de cajetines de planos de ingenieria. No es un parser de documentos de proposito general.
- Idioma: solo ingles declarado. No hay evidencia de funcionamiento en espanol u otros idiomas.
- Alucinacion y capturas erroneas: los fallos residuales documentados incluyen capturar numeros de licencia ("83363"), totales OF-N ("30") y notas de escala ("NTS") como si fueran `sheet_no`.
- Dependencia de la convencion de etiquetado: la model card advierte que parte del gold de S3 incluye nombre de proyecto o ubicacion en el titulo, en contra de la convencion de esta tarea; esto explica parte de la caida de exact match en `title` (76,9 %) respecto a v1 en ese conjunto.
- Sensibilidad a la resolucion: se produjo OOM con `max_pixels` de 16M en una RTX 5090 de 32 GB; el valor recomendado es 8.388.608 o inferior.
- Cobertura de evaluacion limitada: los conjuntos de prueba son pequenos (28, 119 y 52 paginas) y centrados en dominios concretos (Ferguson-Geo, INDOT, bent-creek). El rendimiento en otras empresas o formatos de cajetin no esta medido.
- Ground truth parcialmente generado de forma asistida por modelo en algunos casos (warmlands_avenue) y gold proxy basado en predicciones de produccion en el conjunto de 119 paginas, lo que limita la independencia de parte de la evaluacion.
- Licencia: aunque los metadatos de HuggingFace indican Apache 2.0, la model card afirma que hereda la licencia del modelo base. Conviene verificar las condiciones de infly/Infinity-Parser2-Flash antes de un uso comercial.
- Sin datos publicados de latencia, throughput, VRAM minima ni cuantizaciones soportadas, lo que dificulta el dimensionamiento de produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Circuit-AI/infinity-parser2-flash-title-block-v2
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Version anterior (v1): https://huggingface.co/Circuit-AI/infinity-parser2-flash-title-block
- Resultados de busqueda web: no se encontro ningun enlace relevante al modelo, su paper, repositorio o demo; los resultados devueltos correspondian a agencias de viajes y a un simulador de circuitos electronicos, sin relacion con este modelo.
