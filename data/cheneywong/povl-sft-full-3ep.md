# CheneyWong/povl-sft-full-3ep

## Resumen

povl-sft-full-3ep es un checkpoint de ajuste supervisado (SFT) de primera etapa publicado por el usuario CheneyWong a partir de PaddleOCR-VL-1.6. Se trata de un modelo vision-lenguaje de 905.601.648 parametros (aproximadamente 0,91 mil millones) especializado en reconocimiento de estructura de tablas: recibe una imagen de tabla junto con el prompt `Table Recognition:` y emite marcado OTSL/OTVL con etiquetas como `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>` y `<nl>` en una sola pasada.

El entrenamiento fue de parametros completos (full-parameter), sobre 100.122 muestras durante 3 epochs. El objetivo declarado era corregir la generacion de salida sin limite en maquetaciones no vistas: sobre paginas fotografiadas reales la longitud media de respuesta habia crecido hasta 6.610 caracteres con una tasa de truncamiento del 37,3 %. Segun la propia model card, el resultado fue el contrario en ese eje: las metricas en dominio subieron o se mantuvieron, pero el truncamiento empeoro del 8,6 % al 37,3 %.

Se distribuye bajo licencia Apache 2.0 en formato safetensors y requiere `trust_remote_code` (etiqueta `custom_code`). La adopcion es muy baja (4 descargas, 0 likes en el momento de la ficha) y no hay resultados publicados sobre datasets publicos. Es, por tanto, un artefacto de investigacion intermedio dentro de una cadena de post-entrenamiento, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text) derivada de PaddleOCR-VL-1.6; detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 905.601.648 (unos 0,91 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers (requiere `custom_code` / `trust_remote_code`) |
| Tamano del repositorio | 1,8 GB |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo es un transformer vision-lenguaje del pipeline `image-text-to-text`, heredado del checkpoint base `CheneyWong/table_recognition_paddleocrvl16` (PaddleOCR-VL-1.6), que a su vez se presenta como el modelo base publicado sin modificaciones salvo una pasada de limpieza. La model card no detalla la composicion interna (codificador visual, decodificador de lenguaje, atencion, resolucion de imagen) mas alla de la etiqueta `paddleocr_vl` y de que el repositorio incluye codigo personalizado, por lo que es necesario cargarlo con `trust_remote_code=True`. No se dispone de datos sobre longitud de contexto, tokenizador ni presupuesto de tokens visuales.

El entrenamiento corresponde a SFT de primera etapa con actualizacion de todos los parametros: 100.122 muestras, 3 epochs, con el objetivo explicito de acotar la longitud de salida en maquetaciones no vistas. No hay indicios de RLHF, DPO, GRPO ni otras tecnicas de alineacion por preferencias en esta etapa; la propia model card indica que la siguiente fase del pipeline existe para deshacer el efecto secundario del truncamiento. El formato de tarea es fijo: una unica imagen de tabla, el prompt `Table Recognition:`, una pasada de generacion y salida en marcado OTSL. La composicion del dataset, el numero de tokens de entrenamiento y la mezcla de dominios no estan disponibles.

## Capacidades

- Reconocimiento de estructura de tablas a partir de una imagen: genera marcado OTSL/OTVL con celdas completas (`<fcel>`), celdas vacias (`<ecel>`), celdas con contenido desconocido (`<ucel>`), celdas combinadas a la izquierda (`<lcel>`), celdas combinadas hacia arriba (`<xcel>`) y saltos de fila (`<nl>`).
- Generacion de texto condicionada por imagen (image-text-to-text) en una sola pasada.
- Parseo de documentos orientado a tablas (etiquetas `document-parsing` y `table-recognition`).
- Interfaz conversacional segun la etiqueta `conversational`, aunque la model card describe un unico turno con prompt fijo.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- No hay evidencia de soporte de tool calling ni function calling en la informacion proporcionada.
- No hay evidencia de razonamiento multi-paso, modo thinking, vision general (mas alla de tablas), audio ni capacidades agenticas.
- Cobertura multilingue: no disponible.

## Casos de uso

- Digitalizacion de tablas escaneadas en pipelines documentales: el modelo convierte una imagen de tabla en marcado OTSL estructurado, que despues puede transformarse a CSV, HTML o JSON con un parser determinista. Es adecuado por su salida normalizada y de esquema fijo, siempre que se controle el truncamiento.
- Extraccion de tablas en sistemas de gestion documental (facturas, albaranes, informes): la tarea de un solo paso y prompt fijo lo hace facil de encadenar como etapa de un pipeline OCR mas amplio, con un motor de OCR de texto plano en paralelo para el contenido de las celdas.
- Conversion de tablas fotografiadas con movil: el checkpoint esta entrenado especificamente sobre paginas fotografiadas reales, el escenario donde el modelo base mostraba salidas desbordadas, lo que lo hace candidato para captura en campo.
- Preprocesado para RAG sobre documentacion financiera o tecnica: la estructura de tabla recuperada permite trocear y anotar celdas antes de indexarlas, mejorando la recuperacion de datos tabulares frente a extraccion de texto plano.
- Automatizacion de ingesta en back-office contable: extraccion masiva de tablas de PDFs e imagenes para su volcado en hojas de calculo o bases de datos, con validacion posterior por reglas.
- Investigacion en post-entrenamiento de VLMs: al ser una etapa SFT intermedia documentada, sirve como punto de partida reproducible para estudiar el equilibrio entre precision en dominio y control de longitud de salida en maquetaciones fuera de distribucion.
- Base para una segunda etapa de alineacion: la model card indica explicitamente que el truncamiento introducido aqui es el problema que la fase siguiente debe revertir, por lo que es util como estado inicial de DPO/GRPO u otra fase correctiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card marca la evaluacion como *(not evaluated)* y excluye los benchmarks propios del proyecto.

La unica referencia numerica disponible es una nota sobre el dataset SPRINT-MUSTARD: su ground truth no contiene texto de celda, por lo que su TEDS (aproximadamente 0,22 en este modelo) mide la reproduccion de celdas vacias y debe ignorarse. Segun la nota, una prueba de perturbacion sobre una prediccion estructuralmente perfecta que lee correctamente el texto visible obtiene 0,33 TEDS y 1,00 TEDS-S, por lo que solo la columna TEDS-S es significativa para ese dataset.

| Dataset | Metrica | Resultado | Nota |
|---|---|---|---|
| Datasets publicos | varias | no disponible | Marcado como *(not evaluated)* en la model card |
| SPRINT-MUSTARD | TEDS | ~0,22 | No significativo: el ground truth no tiene texto de celda |
| SPRINT-MUSTARD | TEDS-S | 1,00 en prueba de perturbacion (estructuralmente perfecta) | Metrica significativa para este dataset |

## Requisitos de hardware

- VRAM estimada (solo pesos, calculada a partir de 905,6 M de parametros; no es un dato publicado por el autor): aproximadamente 1,8 GB en fp16/bf16, 0,9 GB en int8 y 0,45 GB en int4.
- VRAM real de inferencia: a los pesos hay que sumar el coste del codificador visual y de las activaciones. Con imagenes de paginas a resolucion alta el numero de tokens visuales y la cache KV pueden dominar el consumo, por lo que la VRAM efectiva puede ser varias veces la de los pesos. No hay mediciones publicadas.
- Cabe en GPU de consumo: si, con margen amplio. Una GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) es suficiente para los pesos en fp16, con la salvedad del coste de activaciones por imagen.
- GPU de datacenter (A100, H100): no son necesarias para un modelo de este tamano; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada por las etiquetas del repositorio. Soporte en vLLM, TGI, SGLang: no confirmado, condicionado al codigo personalizado. llama.cpp, Ollama y LM Studio: no disponible, no se publican pesos GGUF.
- Latencia y throughput: no disponible. Como referencia indirecta, la model card indica que sobre paginas fotografiadas reales la longitud media de respuesta alcanzo 6.610 caracteres, lo que implica decodificaciones largas y un throughput efectivo bajo en ese regimen.
- Cuantizacion: no se publican variantes cuantizadas; aplicar int8 o int4 requeriria hacerlo por cuenta propia y validar que el codigo personalizado lo soporta.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar este checkpoint con su modelo base. No hay datos de rendimiento ni de contexto de alternativas externas en el material disponible.

| Modelo | Parametros totales | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CheneyWong/povl-sft-full-3ep | 905.601.648 | no disponible | no disponible (*(not evaluated)*) | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| CheneyWong/table_recognition_paddleocrvl16 (base) | 905.601.648 (mismo recuento de pesos) | no disponible | no disponible | Apache 2.0 (segun etiqueta del derivado) | HuggingFace |
| Alternativas externas de reconocimiento de tablas | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias observadas entre el checkpoint y su base, segun la model card: en dominio las metricas se mantuvieron o mejoraron ligeramente, mientras que la tasa de truncamiento en maquetaciones no vistas paso del 8,6 % al 37,3 %.

## Limitaciones y advertencias

- Regresion de truncamiento documentada por el propio autor: la tasa de truncamiento empeoro del 8,6 % al 37,3 % en maquetaciones no vistas, precisamente el problema que el entrenamiento pretendia resolver. Es el caveat principal para cualquier uso en produccion.
- Salidas muy largas: longitud media de 6.610 caracteres sobre paginas fotografiadas reales, lo que dispara el coste de decodificacion y el riesgo de corte.
- Sin evaluacion publica: la model card marca la evaluacion como *(not evaluated)* y excluye los benchmarks propios del proyecto, por lo que no hay evidencia reproducible de calidad.
- Adopcion minima: 4 descargas y 0 likes en el momento de la ficha; no hay senales de uso en produccion ni de validacion por terceros.
- Tarea muy restringida: una sola imagen de tabla, prompt `Table Recognition:`, una pasada y salida en marcado OTSL. No esta pensado para dialogo general, vision abierta ni otras tareas de documento.
- Riesgo de alucinacion: no hay datos especificos, pero al ser un modelo generativo de estructura puede producir celdas, filas o marcado inexistentes en la imagen, especialmente en tablas densas o con lineas poco visibles.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue ni un comportamiento consistente fuera del idioma del dataset de entrenamiento.
- Composicion del dataset de SFT no publicada: 100.122 muestras y 3 epochs, pero sin mezcla de dominios, idiomas ni procedencia, lo que dificulta estimar sesgos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de PaddleOCR-VL-1.6 conviene verificar las condiciones del modelo base y de sus dependencias antes de explotarlo comercialmente.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad y de compatibilidad entre versiones de `transformers`.
- Sin pesos cuantizados publicados: no hay GGUF ni variantes int8/int4 listas para usar, lo que limita el despliegue en entornos ligeros.
- Maquetaciones no vistas como punto debil: los resultados en dominio no se trasladan a layouts fuera de distribucion, que es exactamente donde falla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CheneyWong/povl-sft-full-3ep
- Modelo base declarado: https://huggingface.co/CheneyWong/table_recognition_paddleocrvl16
- Supervised Fine-Tuning (SFT) for LLMs - GeeksforGeeks: https://www.geeksforgeeks.org/artificial-intelligence/supervised-fine-tuning-sft-for-llms/ (referencia general sobre SFT, no especifica del modelo)
- From SFT to GRPO: A Practical Guide to Modern LLM Fine-Tuning: https://arzerin.com/2026/08/20/llm-post-training-sft-dpo-ppo-grpo-peft-lora-qlora/ (referencia general sobre post-entrenamiento)
- Fine-tune a model with supervised fine-tuning in Microsoft Foundry: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/fine-tuning (documentacion generica de SFT)
- A Coding Guide on LLM Post Training with TRL from Supervised Fine-Tuning to DPO and GRPO: https://www.marktechpost.com/2026/05/01/a-coding-guide-on-llm-post-training-with-trl-from-supervised-fine-tuning-to-dpo-and-grpo-reasoning/ (referencia general sobre TRL)
- New ENCFORGE Ransomware Targets AI Model Files in Langflow RCE Attack: https://thehackernews.com/2026/07/new-encforge-ransomware-targets-ai.html (no relacionado con el modelo; se incluye como resultado de la busqueda)
