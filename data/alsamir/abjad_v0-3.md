# Alsamir/abjad_v0.3

## Resumen

Abjad v0.3 es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-4B-Instruct especializado en OCR de árabe (transcripción de texto árabe presente en imágenes). Lo publica el usuario de Hugging Face Alsamir y se distribuye como una exportación autónoma en BF16 para Transformers, con la LoRA de la etapa 2 (`abjad_v0.3`) ya fusionada en los pesos, de forma que no hace falta cargar ningún adaptador aparte.

El checkpoint contiene 4.437.815.808 parámetros (unos 4,44 mil millones) y se publica bajo licencia Apache 2.0, heredada del modelo base. El repositorio ocupa 8,9 GB e incluye shards completos del modelo, tokenizer, processor, configuración y un manifiesto de checksums/procedencia (`release_manifest.json`); no redistribuye el dataset de entrenamiento ni el estado del optimizador.

El dato más relevante para evaluarlo es su estado de entrenamiento: el checkpoint almacena el paso 9.750 de los 11.000 previstos, es decir, el entrenamiento se interrumpió y no se completó. El autor no reclama ninguna métrica de precisión verificada ni un recuento auditado de imágenes de entrenamiento, y advierte de que siguen siendo posibles repeticiones, omisiones, errores de letras o dígitos y fallos de maquetación. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto experimental sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivado de Qwen3-VL; encoder visual mas decoder de lenguaje. Detalle interno no disponible |
| Parametros totales | 4.437.815.808 (aproximadamente 4,44 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Un indice de terceros atribuye 32.768 tokens a Abjad 0.2, dato no confirmado para v0.3 |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos se distribuyen en BF16. No hay GGUF, AWQ, GPTQ ni FP8 oficiales |
| Idiomas soportados | Arabe (`ar`) como unico idioma declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), en shards multiples |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (relacion: finetune) |
| Biblioteca | transformers |
| Tamano del repositorio | 8,9 GB |
| Contenido adicional | Tokenizer, processor, configuracion y manifiesto de checksums/procedencia; sin adaptadores |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion en el repositorio | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y que recibe pares imagen-texto, segun indica el pipeline `image-text-to-text`. El autor no detalla en la model card la composicion exacta de capas, el tipo de atencion ni el numero de tokens de entrenamiento, por lo que esos extremos quedan como no disponibles.

El proceso de ajuste descrito es un fine-tuning en dos etapas sobre el modelo base, cuya etapa 2 corresponde a la LoRA `abjad_v0.3` que se ha fusionado en los pesos finales. El checkpoint publicado se encuentra en el paso 9.750 de 11.000 planificados y el entrenamiento fue interrumpido, de modo que no se trata de una ejecucion completa. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ni se especifica la composicion del dataset de entrenamiento. La unica validacion mencionada es que las salidas antes y despues de la fusion coincidieron en una imagen del dataset; el propio autor aclara que esa comprobacion verifica el comportamiento de la exportacion, no la precision del OCR, y que esa imagen pudo haber sido usada en el entrenamiento.

## Capacidades

- Transcripcion OCR de texto arabe a partir de imagenes: es la funcion principal declarada, con instrucciones de preservar letras y digitos arabes y devolver unicamente la transcripcion.
- Entrada multimodal imagen-texto: acepta imagenes (por ejemplo, paginas rasterizadas de PDF en PNG o TIFF) junto con una instruccion textual enviada mediante plantilla de chat.
- Generacion de texto condicionada por imagen: el prompt de ejemplo solicita transcripcion literal sin muestreo (`do_sample=False`) y un maximo de 2.048 tokens nuevos.
- Conversacion multi-turno: el tag `conversational` figura entre las etiquetas del repositorio, aunque no se documentan plantillas ni ejemplos de dialogo mas alla de la plantilla de chat estandar.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: unicamente arabe declarado; no se documentan capacidades en otros idiomas.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), audio ni video; la vision se limita a la entrada de imagen contemplada por el pipeline.

## Casos de uso

- Digitalizacion de archivos escaneados en arabe: el modelo recibe cada pagina convertida a PNG o TIFF y devuelve la transcripcion; encaja en proyectos de preservacion documental donde el material de origen esta en arabe y se necesita texto plano indexable.
- Extraccion de texto de facturas y recibos arabes: con un prompt que exija transcripcion literal, se puede integrar en un pipeline de contabilidad para volcar lineas de concepto, importes y fechas; el autor recomienda revisar manualmente nombres y numeros.
- Procesamiento de formularios y documentos administrativos: al tratarse de un modelo imagen-texto, puede transcribir campos manuscritos o impresos antes de pasarlos a un sistema de validacion, siempre con verificacion posterior contra el original.
- Enriquecimiento de repositorios PDF: rasterizando las paginas y ejecutando inferencia por lote, se puede generar texto buscable para bibliotecas digitales en arabe; las paginas largas pueden requerir recorte por limite de tokens.
- Preprocesado para pipelines de NLP en arabe: la transcripcion puede alimentar despues tareas de clasificacion, resumen o busqueda semantica que operan sobre texto y no sobre imagen.
- Revision asistida de documentos con sellos o firmas: el modelo puede transcribir el cuerpo del documento y dejar que un revisor humano valide los elementos no textuales, tal como aconseja el autor.
- Prototipos de investigacion en OCR arabe sobre Qwen3-VL: al ser una exportacion BF16 estandar de Transformers con LoRA fusionada, sirve como punto de partida reproducible para comparar variantes de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama ninguna puntuacion de precision verificada y que no existe un recuento auditado de imagenes de entrenamiento. Tampoco se aportan cifras de latencia, throughput ni comparaciones cuantitativas con otros sistemas de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para los pesos (4,44 mil millones de parametros a 2 bytes), mas el coste de activaciones, cache KV y procesamiento de la imagen; en la practica conviene disponer de 12-16 GB o mas.
- GPU recomendadas: A100, H100 o L40S para despliegue por lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual sin problemas de espacio.
- GPU de consumo: cabe en RTX 4080 / 4070 Ti Super (16 GB) y en RTX 3090 / 4090 (24 GB). En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) puede funcionar pero con poco margen, especialmente con imagenes grandes o transcripciones largas; `device_map="auto"` permite descargar parte del modelo a CPU a cambio de latencia.
- Despliegue: el autor documenta uso con `AutoProcessor` y `AutoModelForImageTextToText` de Transformers, con `dtype=torch.bfloat16` y `device_map="auto"`, sobre CUDA en Windows (Python 3.10 o 3.11) o en imagenes OCI con Linux y CUDA. No se menciona compatibilidad verificada con vLLM, TGI, llama.cpp, Ollama ni LM Studio; para llama.cpp u Ollama haria falta una conversion a GGUF no publicada.
- CPU: la inferencia en CPU es posible segun el autor, pero puede resultar lenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Estado |
|---|---|---|---|---|---|
| Alsamir/abjad_v0.3 | 4,44 mil millones | No disponible (no confirmado) | Arabe | Apache 2.0 | Checkpoint interrumpido en el paso 9.750 de 11.000; 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | Familia de 4B (valor exacto no disponible en la informacion) | No disponible | Multilingue (no detallado) | Apache 2.0 | Modelo instruct publicado por el equipo de Qwen |
| Alsamir/Abjad_0.2 | 4,44 mil millones segun indice de terceros | 32.768 tokens segun indice de terceros | Arabe | No disponible | Version anterior del mismo autor; sin datos de precision |

No se dispone de datos de benchmarks de ninguno de los tres que permitan una comparacion cuantitativa de rendimiento. La comparativa se limita por tanto a parametros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento incompleto: el checkpoint corresponde al paso 9.750 de 11.000; no es una ejecucion terminada y el comportamiento final puede diferir del previsto por el autor.
- Sin metrica de precision: no existe puntuacion de exactitud verificada ni recuento auditado de imagenes de entrenamiento; la unica comprobacion publicada valida la exportacion, no la calidad del OCR.
- Errores de transcripcion documentados como posibles: repeticiones, omisiones, letras o digitos incorrectos y errores de maquetacion. El autor recomienda revisar nombres y numeros contra el documento original.
- Riesgo de alucinacion: al ser un modelo generativo aplicado a OCR, puede producir texto plausible que no aparezca en la imagen, especialmente en zonas de baja calidad, sellos o firmas.
- Contaminacion potencial de la validacion: la imagen usada para comprobar la fusion pudo formar parte del entrenamiento, por lo que esa prueba no es un indicador valido de generalizacion.
- Reconstruccion de maquetacion: la conversion a formato de procesador de textos y la reconstruccion exacta del layout requieren un pipeline documental adicional; el modelo no lo cubre por si solo.
- Limite de tokens en paginas largas: el autor advierte de que las paginas extensas pueden alcanzar el limite de tokens y requerir recorte previo.
- Cobertura idiomatica limitada: solo se declara arabe, sin garantias para texto mixto arabe-ingles, transliteraciones o variantes dialectales.
- Linaje no auditado: el propio autor indica que las etapas anteriores del entrenamiento no han sido auditadas de forma independiente.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones de Qwen/Qwen3-VL-4B-Instruct y de los datos de entrenamiento, que no se redistribuyen ni se detallan.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros que respalden su comportamiento en produccion.
- Marcas temporales anomalas: las fechas de creacion y actualizacion del repositorio (27 de septiembre de 2026) no se han podido verificar y conviene comprobar la vigencia del artefacto antes de integrarlo.
- Relacion con Abjad AI no confirmada: la empresa saudita Abjad AI y el usuario Alsamir aparecen en los resultados de busqueda, pero no hay evidencia en la informacion disponible de que este checkpoint sea un producto oficial de dicha empresa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alsamir/abjad_v0.3
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Perfil del autor en Hugging Face: https://huggingface.co/Alsamir/models
- Version anterior: https://huggingface.co/Alsamir/Abjad_0.2
- Ficha de terceros con datos de Abjad 0.2: https://free2aitools.com/model/alsamir/abjad_0.2
- Sitio de Abjad AI (relacion no confirmada con este checkpoint): https://www.abjad-ai.com/models/
- Repositorio research-chef de la organizacion abjad-org (relacion no confirmada): https://github.com/abjad-org/research-chef
