# CheneyWong/povl-dpo-2ep

## Resumen

povl-dpo-2ep es un checkpoint de reconocimiento de tablas en imágenes publicado por el usuario CheneyWong en HuggingFace. Se trata de un ajuste fino mediante DPO (Direct Preference Optimization) sobre un SFT correctivo previo, con 2 épocas sobre 8.383 pares de preferencia. El objetivo declarado por el autor es pasar de una salida con "estructura aproximadamente correcta" a una con "estructura exactamente correcta" al emitir marcado OTSL (`<fcel> <ecel> <ucel> <lcel> <xcel> <nl>`).

El modelo deriva de `CheneyWong/povl-sft-2d-merge`, que a su vez procede de PaddleOCR-VL-1.6 como base. La tarea es de un solo paso: se introduce una imagen de tabla junto con el prompt `Table Recognition:` y el modelo emite el marcado estructurado de la tabla. El pipeline registrado en HuggingFace es `image-text-to-text`, con 905.601.648 parámetros totales (aproximadamente 0,9 mil millones) y un repositorio de 1,8 GB.

La relevancia de esta ficha es sobre todo metodológica: el propio autor documenta que la mejora obtenida queda dentro del ruido de muestreo (±0,5 puntos) y debe tratarse como "sin efecto". Es, por tanto, un ejemplo útil de publicación honesta de resultados negativos o neutros en el ámbito del ajuste por preferencias aplicado a modelos de visión-lenguaje para documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de PaddleOCR-VL-1.6; tag `paddleocr_vl`, requiere `custom_code`) |
| Parametros totales | 905.601.648 (dato real de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`, con `custom_code`) |

Otros datos: pipeline `image-text-to-text`; etiquetas `table-recognition`, `document-parsing`, `paddleocr-vl`, `otvl`, `conversational`, `endpoints_compatible`, `region:us`; fecha de creacion 2026-10-12; actualizacion 2026-10-12; 4 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. Lo que consta es la cadena de linaje: PaddleOCR-VL-1.6 (base) da lugar a `CheneyWong/povl-sft-2d-merge` (SFT correctivo, predecesor inmediato) y este, a su vez, a `povl-dpo-2ep` mediante DPO sobre 8.383 pares de preferencia durante 2 epocas. El repositorio incluye codigo personalizado (`custom_code`) y la libreria declarada es `transformers`, lo que implica que su carga requiere confiar en la implementacion remota del autor.

El entrenamiento se orienta a una tarea de formato estricto: una imagen de tabla mas el prompt `Table Recognition:`, una unica pasada y salida en marcado OTSL. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de preferencias, ni si hubo etapas adicionales de RLHF mas alla del DPO. Tampoco se describe ninguna innovacion tecnica de atencion o decodificacion.

## Capacidades

- Reconocimiento de estructuras de tabla a partir de una imagen, emitiendo marcado OTSL con las etiquetas `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>` y `<nl>`.
- Parsing de documentos con tablas: la etiqueta `document-parsing` indica el encuadre previsto de uso.
- Interaccion conversacional: el repositorio esta etiquetado como `conversational`, aunque la tarea descrita en la model card es de una sola pasada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse tras una API compatible con Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el flujo descrito es de un unico paso.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Digitalizacion de tablas en documentos financieros: el modelo recibe la imagen de una tabla de un balance o una cuenta de resultados y devuelve el marcado OTSL, que puede convertirse despues a HTML, Markdown o CSV. Es adecuado porque su entrenamiento se centra especificamente en la estructura de celdas (fusiones, celdas vacias, encabezados).
- Extraccion de tablas de articulos cientificos: con datasets de evaluacion como PubTables-1M, PubTables-v2 y PubTabNet, el modelo esta orientado a tablas academicas; permitiria poblar bases de datos bibliograficas a partir de PDFs maquetados a dos columnas.
- Alimentacion de pipelines RAG sobre documentacion tecnica: las tablas extraidas en OTSL se pueden normalizar y trocear para indexacion, de modo que un sistema de recuperacion pueda responder preguntas que dependan de valores tabulados.
- Automatizacion de procesos de facturacion y comprobantes: el reconocimiento estructurado permite mapear lineas de detalle y totales a campos de un ERP, reduciendo la introduccion manual.
- Control de calidad en digitalizacion masiva: al disponer de un modelo de ~0,9 mil millones de parametros, puede ejecutarse sobre lotes grandes de imagenes y usarse para detectar paginas con tablas mal extraidas antes de la revision humana.
- Extraccion de tablas en informes escaneados (FinTabNet, SynthTabNet): util en entornos con documentos de calidad variable, donde el modelo ha mostrado su mayor mejora en SynthTabNet (+0,1100 TEDS segun la model card).
- Preprocesado para auditoria documental: convertir tablas a un formato textual estructurado facilita comparaciones automatizadas entre versiones de un mismo documento regulatorio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre datasets publicos, con n = 2000 en cada caso. "Base" es el modelo base sin modificar.

| Dataset | n | TEDS base | TEDS ours | d TEDS | TEDS-S base | TEDS-S ours | d TEDS-S |
|---|---:|---:|---:|---:|---:|---:|---:|
| PubTables-1M | 2000 | 0.9015 | 0.9403 | +0.0388 | 0.9243 | 0.9503 | +0.0259 |
| PubTables-v2 | 2000 | 0.9026 | 0.9556 | +0.0530 | 0.9239 | 0.9644 | +0.0405 |
| FinTabNet (OTSL) | 2000 | 0.9442 | 0.9651 | +0.0209 | 0.9524 | 0.9726 | +0.0202 |
| PubTabNet / ICDAR | 2000 | 0.9297 | 0.9293 | -0.0004 | 0.9464 | 0.9425 | -0.0038 |
| SynthTabNet | 2000 | 0.8093 | 0.9194 | +0.1100 | 0.8474 | 0.9316 | +0.0842 |
| Overall (igual peso) | - | 0.8975 | 0.9419 | +0.0445 | 0.9189 | 0.9523 | +0.0334 |

Los datasets TableVerse-5K, OmniDocBench v1.5, OmniDocBench v1.6, CC-OCR, OCRBench-v2, Real5 y TABLET aparecen en la tabla de la model card con valores sin publicar ("?"). Para SPRINT-MUSTARD, el autor advierte de que su ground truth no incluye texto de celda, por lo que su TEDS (~0,22) no es interpretable; solo la columna TEDS-S es significativa en ese caso, y una prueba de perturbacion da 0,33 TEDS / 1,00 TEDS-S para una prediccion estructuralmente perfecta.

Advertencia del propio autor: la ganancia global esta dentro del ruido de muestreo (±0,5 puntos) y debe considerarse sin efecto. Los numeros de benchmarks propios del proyecto se excluyen explicitamente de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP16 para los 905.601.648 parametros; en torno a 0,9 GB en int8 y 0,5 GB en int4 (estimaciones aritmeticas a partir del recuento de parametros, no confirmadas por el autor). El tamano del repositorio es de 1,8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia ser suficiente en FP16, dado el tamano del modelo; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, por el recuento de parametros y el tamano del repositorio.
- Opciones de despliegue: la libreria declarada es `transformers` con `custom_code`, y la etiqueta `endpoints_compatible` indica compatibilidad con endpoints. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

Nota practica: al tratarse de un modelo de vision-lenguaje con codigo personalizado, la VRAM real dependera tambien del encoder de vision y de la resolucion de entrada, no solo del recuento de parametros del decodificador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TEDS publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| povl-dpo-2ep | 905.601.648 | no disponible | 0,9419 (media igual peso, 5 datasets) | apache-2.0 | HuggingFace, 4 descargas |
| povl-sft-2d-merge (predecesor) | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado en la model card) |
| PaddleOCR-VL-1.6 (base) | no disponible | no disponible | 0,8975 (media igual peso, mismas condiciones) | no disponible en esta informacion | no disponible en esta informacion |

No se dispone en la informacion proporcionada de datos de rendimiento de otros modelos de reconocimiento de tablas (por ejemplo, alternativas de la misma categoria) que permitan una comparacion con numeros verificables. Cualquier comparacion adicional se marcaria como "no disponible".

## Limitaciones y advertencias

- La mejora declarada esta dentro del ruido de muestreo (±0,5 puntos) segun el propio autor, que la califica explicitamente como "sin efecto". No debe presentarse como una mejora solida.
- En PubTabNet / ICDAR el resultado es ligeramente peor que el base (-0,0004 TEDS, -0,0038 TEDS-S), lo que sugiere que el ajuste no es uniformemente positivo entre dominios.
- Los valores de TEDS en SPRINT-MUSTARD (~0,22) no son interpretables por un problema del ground truth; el autor pide ignorarlos.
- Riesgo de alucinacion: no se documenta de forma especifica para este checkpoint, pero es un riesgo general de los modelos de vision-lenguaje entrenados con DPO; los papers de contexto encontrados abordan precisamente la alucinacion de objetos en modelos multimodales bajo DPO.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: no se declara lista de idiomas soportados; el unico idioma de la interfaz documentada es el prompt en ingles `Table Recognition:`.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada. El flujo de la model card asume una sola imagen y una sola pasada, sin conversaciones largas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el repositorio incluye `custom_code`, por lo que conviene revisar el codigo remoto antes de desplegarlo en produccion.
- Caveat de reproducibilidad: el propio autor indica que los numeros de evaluacion se gestionan por separado y no forman parte de la model card; buena parte de los datasets citados no tiene resultados publicados.
- Madurez: 4 descargas y 0 likes; es un checkpoint de investigacion con muy poca validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/CheneyWong/povl-dpo-2ep
- Predecesor directo (SFT correctivo): https://huggingface.co/CheneyWong/povl-sft-2d-merge
- PaddleOCR-VL-1.6 (modelo base): enlace no disponible en la informacion proporcionada
- Paper relacionado (contexto, no especifico de este modelo): Context Blindness in DPO: Mitigating Object Hallucination — https://arxiv.org/abs/2608.12158
- Paper relacionado (contexto, no especifico de este modelo): VL-DPO: Vision-Language-Guided Finetuning for Preference-Aligned — https://arxiv.org/abs/2605.20082
- Referencia de implementacion de DPO con LoRA en HuggingFace: https://huggingface.co/lewtun/dpo-model-lora
- Ranking de modelos de IA (contexto general, no especifico de este modelo): https://benchlm.ai/best/chinese-models
- Repositorio de generacion de video Wan2GP (aparece en la busqueda, sin relacion con este modelo): https://github.com/lolvOid/Wan2GP
