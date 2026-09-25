# lugman-madhiai/invoice-split-2023

## Resumen

`lugman-madhiai/invoice-split-2023` es un ajuste fino (fine-tune) del modelo multimodal `unsloth/Qwen3-VL-8B-Instruct`, publicado por el usuario de HuggingFace lugman-madhiai bajo licencia Apache-2.0. Se trata de un modelo de 8.767.123.696 parámetros (unos 8,77 mil millones), denso y multimodal, orientado a tareas de imagen-a-texto, con un nombre que apunta a un uso muy concreto: la separación y el tratamiento de facturas dentro de documentos que contienen varias de ellas (invoice splitting).

La relevancia de esta ficha es limitada pero informativa: el repositorio no incluye datos de evaluación, ni descripción del conjunto de datos de entrenamiento, ni métricas de rendimiento. Su interés principal es doble. Por un lado, documenta un caso típico de especialización mediante fine-tune supervisado sobre un modelo base de visión-lenguaje de última generación. Por otro, forma parte de un grupo de publicaciones del mismo autor centradas en facturas (`invoice-structured-extraction`, `invoice-structured-extraction-sft`), lo que sugiere una línea de trabajo de automatización documental en el ámbito de cuentas a pagar.

El modelo se entrenó, según la propia model card, con Unsloth y la librería TRL de HuggingFace, con una mejora declarada de velocidad de entrenamiento de 2x. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales (DPO, RLHF) más allá del ajuste supervisado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal, heredada del modelo base Qwen3-VL-8B-Instruct: torre de visión más decodificador de lenguaje de la familia Qwen3 |
| Parámetros totales | 8.767.123.696 (8,77 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en el repositorio. El modelo base se publica con 262.144 tokens según la documentación de su autor, dato no verificable en esta ficha |
| Tipos de cuantización | No se publican cuantizaciones en el repositorio. El tamaño del repo (17,5 GB) corresponde a pesos en bf16/fp16 sin cuantizar |
| Idiomas soportados | en (inglés), según la etiqueta de idioma del repositorio. El ajuste no declara otros idiomas, aunque el modelo base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen3-VL-8B-Instruct |
| Pipeline declarado | image-text-to-text |
| Autor | lugman-madhiai |
| Tamaño del repositorio | 17,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-VL-8B-Instruct`, una réplica optimizada para entrenamiento del `Qwen3-VL-8B-Instruct` de Alibaba. Se trata de una arquitectura transformer multimodal compuesta por un codificador de visión que convierte imágenes (por ejemplo, páginas escaneadas de facturas) en tokens visuales, y un decodificador de lenguaje autorregresivo de la familia Qwen3 que genera la salida de texto condicionada por esos tokens. El recuento de 8.767.123.696 parámetros es coherente con un modelo denso de 8B más la torre de visión y los componentes de proyección multimodal.

Sobre el entrenamiento, la única información verificable es la que aparece en la model card: el ajuste se realizó con Unsloth y TRL, con una mejora declarada de velocidad de 2x respecto a un entrenamiento convencional. No se especifica el número de tokens de entrenamiento, la composición del dataset, la resolución de imagen utilizada, la longitud de secuencia, si se aplicó LoRA o un ajuste completo, ni si hubo fases posteriores de alineación. El tamaño del repositorio (17,5 GB, equivalente a 2 bytes por parámetro) es compatible con un ajuste completo de todos los pesos en bf16/fp16 en lugar de un adaptador LoRA empaquetado, pero esto es una inferencia a partir del tamaño y no un dato confirmado por el autor.

No se documenta ninguna innovación técnica propia del fine-tune (decodificación especulativa, atención lineal, cuantización nativa, etc.). Cualquier capacidad arquitectónica relevante proviene del modelo base y no ha sido modificada por el ajuste.

## Capacidades

Las capacidades confirmadas por el repositorio y por la model card son escasas; el resto se hereda del modelo base y no está validado en esta ficha.

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas de imagen (páginas de factura, capturas, escaneos) y produce texto.
- Conversación: la etiqueta `conversational` indica que el modelo está formateado para diálogo multi-turno.
- Uso en servidores de inferencia: la etiqueta `text-generation-inference` sugiere compatibilidad con TGI y con despliegues que consumen pesos en safetensors.
- Separación de facturas: por el nombre del modelo (`invoice-split`) y por las publicaciones hermanas del mismo autor, el caso de uso previsto es la segmentación de documentos con varias facturas. No hay ejemplos, prompts ni formato de salida documentados en el repositorio.
- Extracción estructurada de campos de factura: no documentada para este modelo concreto; el autor publica modelos separados para esa tarea (`invoice-structured-extraction`).
- Tool calling / function calling: capacidad del modelo base Qwen3-VL, no documentada ni confirmada para este ajuste.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: el ajuste declara únicamente inglés (`en`).
- Capacidades especiales (modo pensamiento, audio, vídeo): no disponibles o no documentadas en la información proporcionada.

## Casos de uso

- Separación de PDF multipágina con varias facturas: el modelo recibe la imagen de las páginas de un lote escaneado y devuelve los límites o índices de página de cada factura, lo que permite a un script posterior partir el PDF en documentos individuales. Es el caso de uso que da nombre al modelo.
- Automatización de cuentas a pagar: en un flujo de entrada de facturas por correo o escaneo, el modelo actúa como primer paso de clasificación del lote antes de pasar cada documento a un extractor de campos o a un ERP.
- Digitalización de facturas escaneadas o fotografiadas: al ser un modelo de visión, tolera entradas que no tienen capa de texto, por lo que no requiere un OCR previo para decidir dónde empieza y termina cada factura.
- Preprocesado dentro de un pipeline RPA: el modelo devuelve una salida de texto (por ejemplo, un JSON con rangos de páginas) que un bot de RPA consume para ejecutar el troceado y el renombrado de archivos.
- Integración en plataformas de gestión documental: como modelo Apache-2.0, se puede desplegar en infraestructura propia para procesar lotes de facturas sin enviar documentos a servicios externos, algo relevante cuando los documentos contienen datos fiscales y personales.
- Revisión asistida por conversación: la etiqueta `conversational` permite construir una interfaz en la que un operador pregunta por el contenido de un lote de facturas y el modelo responde sobre la imagen mostrada.
- Base para un ajuste posterior específico de dominio: al ser un fine-tune de un modelo base abierto y con licencia permisiva, puede servir como punto de partida para especializaciones adicionales (por ejemplo, facturas de un país o de un proveedor concreto).
- Enrutado y detección de duplicados: el modelo puede utilizarse para identificar visualmente facturas repetidas dentro de un lote antes de que lleguen al sistema de pago, aunque esta capacidad no está documentada ni evaluada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de ningún tipo (ni de extracción de campos, ni de segmentación de documentos, ni evaluaciones generales como MMLU o GSM8K), y tampoco se han encontrado evaluaciones de terceros para este modelo concreto.

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros (8,77B) y del tamaño del repositorio; el autor no publica requisitos ni mediciones.

- VRAM en bf16/fp16: unos 17,5 GB solo para los pesos, más caché KV y memoria para los tokens de imagen. En la práctica requiere del orden de 22-26 GB de VRAM con contexto moderado.
- VRAM en int8 (bitsandbytes o FP8): aproximadamente 9-10 GB de pesos, en torno a 12-16 GB de VRAM total.
- VRAM en int4 (AWQ, GPTQ o NF4): aproximadamente 5,5-6 GB de pesos, en torno a 8-10 GB de VRAM total. El consumo real depende de la resolución de las imágenes, que añade tokens visuales y, con ello, caché KV.
- GPU recomendadas: H100 80 GB, A100 40/80 GB y L40S 48 GB para bf16 con contexto largo; A10G, L4 o RTX 4090 para int8/int4.
- Cabe en GPU de consumo: en RTX 4090 o RTX 3090 (24 GB) es viable en bf16 con contexto limitado, y cómodo en int4/int8. En tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) solo es viable con cuantización de 4 bits.
- Opciones de despliegue: la etiqueta `text-generation-inference` apunta a TGI; también es compatible con `transformers`, y con vLLM o SGLang siempre que soporten la arquitectura Qwen3-VL. Para llama.cpp u Ollama haría falta una conversión a GGUF con su proyector multimodal (`mmproj`), que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos comparados provienen de su documentación pública y no han sido verificados en esta ficha. El rendimiento de `invoice-split-2023` no está evaluado, por lo que la comparación es estructural, no de calidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| invoice-split-2023 | 8,77B (denso, multimodal) | No disponible | Apache-2.0 | HuggingFace, 0 descargas | Fine-tune sin evaluación publicada |
| Qwen3-VL-8B-Instruct (modelo base) | ~8,8B (denso, multimodal) | 262.144 tokens según su documentación | Apache-2.0 | HuggingFace | Modelo generalista con evaluación publicada por su autor |
| Qwen2.5-VL-7B-Instruct | 7B (denso, multimodal) | 128.000 tokens según su documentación | Apache-2.0 | HuggingFace | Generación anterior de la misma familia |
| Llama-3.2-11B-Vision-Instruct | 11B (denso, multimodal) | 128.000 tokens según su documentación | Licencia comunitaria de Llama 3.2 | HuggingFace | Sujeta a condiciones adicionales de uso |

Para tareas concretas de facturación también se emplean APIs propietarias (por ejemplo, GPT-4o mini, mencionado en herramientas de la comunidad para trocear PDF con varias facturas), pero no se dispone de datos comparativos con este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, ejemplos de salida, ni formato de respuesta documentado. No se puede afirmar que el modelo haga bien la tarea que su nombre sugiere.
- Riesgo de alucinación en datos numéricos: en el ámbito de facturas, un error en un importe, un NIF o una fecha tiene consecuencias contables y legales. Cualquier salida debe validarse con reglas de negocio y revisión humana antes de llegar a un sistema de pago.
- Model card mínima: no se documentan dataset, hiperparámetros, resolución de imagen, longitud de secuencia, método de ajuste (LoRA o completo) ni uso previsto.
- Idioma: el ajuste declara únicamente inglés, aunque el modelo base sea multilingüe. Su comportamiento con facturas en castellano no está documentado ni evaluado.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ en el repositorio, lo que dificulta el despliegue en hardware de gama baja sin trabajo adicional.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay informes de terceros sobre su comportamiento.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia. Conviene revisar las condiciones del modelo base y de los datos con los que se entrenó, que el autor no detalla.
- Protección de datos: las facturas contienen información personal y fiscal. Un despliegue en producción debe cumplir el RGPD y, si se procesa en servidores externos, contar con la base jurídica adecuada.
- Sesgos heredados: al derivar de un modelo entrenado con datos web a gran escala, puede reproducir sesgos de representación y errores de OCR sistemáticos en tipografías, idiomas o formatos poco frecuentes.
- Fechas del repositorio: la creación y la última actualización figuran como septiembre de 2026, lo que no permite situar el modelo con fiabilidad en una línea temporal de versiones.
- Afirmaciones externas no atribuibles: en los resultados de búsqueda aparece una publicación sobre un modelo de 8B para extracción estructurada de facturas que menciona un coste 70 veces menor que modelos frontera. No se ha podido confirmar que corresponda a este repositorio ni a este autor, por lo que no debe tomarse como evidencia de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/invoice-split-2023
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct
- Perfil del autor en HuggingFace: https://huggingface.co/lugman-madhiai
- Modelo hermano (extracción estructurada de facturas): https://huggingface.co/lugman-madhiai/invoice-structured-extraction
- Modelo hermano (SFT de extracción estructurada): https://friendli.ai/models/lugman-madhiai/invoice-structured-extraction-sft
- Unsloth (framework de entrenamiento citado en la model card): https://github.com/unslothai/unsloth
- TRL de HuggingFace (librería citada en la model card): https://github.com/huggingface/trl
- Herramienta comunitaria de troceado de PDF con varias facturas: https://github.com/jsheppard8989/invoice-splitter
- Publicación sobre un modelo de 8B para extracción de facturas (relación no confirmada): https://www.linkedin.com/posts/activity-7503363289473626112-sTKp
