# lonepixel/navoiy-ai-3b-gguf

## Resumen

Navoiy AI 3B es un ajuste fino (fine-tuning) del modelo meta-llama/Llama-3.2-3B-Instruct orientado especificamente al uzbeko, desarrollado por el usuario lonepixel. Se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M (1,88 GB) y esta pensado para inferencia local ligera mediante Ollama o llama-cpp-python. El modelo parte de los 3.212.749.888 parametros del Llama-3.2-3B-Instruct original y anade capacidades de razonamiento por niveles y uso de herramientas.

La propuesta diferencial del modelo es un mecanismo de "razonamiento cognitivo" en tres niveles controlado mediante la etiqueta `<think effort="...">`, con presupuestos de tokens distintos (low, medium, high), ademas de soporte de tool calling orientado a servicios uzbekos concretos: tipos de cambio del Banco Central de Uzbekistan (CBU), catalogo de Korzinka, busqueda en Uzum Market y consulta de legislacion uzbeka. Tambien incorpora un tratamiento especifico del alfabeto latino uzbeko reformado (Ö, Ğ, Ş, Ç) y un separador inteligente para el digrafo "sh".

Es relevante para desarrolladores que necesiten un asistente conversacional en uzbeko con contexto moderado (4096 tokens) y capacidad de integracion con APIs locales, ejecutable en hardware de consumo. No obstante, el repositorio no incluye datos de benchmarks, y la licencia heredada (Llama 3.2) impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B-Instruct, fine-tuning QLoRA) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado, 1,88 GB) |
| Idiomas soportados | uzbeko (uz); el modelo base soporta otros idiomas, pero el ajuste esta orientado a uzbeko |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Llama-3.2-3B-Instruct de Meta: un transformer decoder-only denso de aproximadamente 3.200 millones de parametros. Sobre esa base se aplico un ajuste fino mediante QLoRA, segun indica la model card. El entrenamiento empleo loss masking restringido a los tokens del asistente y a los tokens de la etiqueta `<think>`, de modo que el gradiente solo se calcula sobre las respuestas y el razonamiento generado, no sobre el prompt del usuario.

La innovacion principal declarada es el esquema de razonamiento por niveles mediante `<think effort="low|medium|high">`, con presupuestos orientativos de 25-60 tokens para low, 120-250 para medium y 400-800 para high. Ademas, el ajuste incluye un tratamiento del alfabeto latino uzbeko reformado y un mecanismo de separacion del digrafo "sh" para evitar errores en palabras como "Ishoq", "mushaf" o "disharmoniya". No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en uzbeko con formato de chat (pipeline text-generation, tag conversational).
- Razonamiento en tres niveles de esfuerzo controlables mediante `<think effort="low|medium|high">`.
- Uso de herramientas (tool calling) mediante la etiqueta `<tool_call>`, con integraciones declaradas para CBU (tipos de cambio), Korzinka (catalogo y precios), Uzum Market (busqueda de e-commerce y pagos a plazos) y busqueda en legislacion uzbeka (codigos Fiscal, Laboral y Civil).
- Generacion de codigo orientada al mercado IT uzbeko: Node.js, JavaScript, PHP (Laravel), Tailwind CSS, Rust y Python, con mencion a servicios locales como Payme, Click, Uzum y Eskiz.uz.
- Manejo del alfabeto latino uzbeko reformado (Ö, Ğ, Ş, Ç) y separacion correcta del digrafo "sh".
- Capacidades heredadas del modelo base Llama-3.2-3B-Instruct en la medida en que el ajuste no las haya degradado; no se documenta su preservacion.
- No se declara soporte de vision, audio ni modo thinking nativo mas alla del esquema `<think>` descrito.

## Casos de uso

- Asistente de atencion al cliente en uzbeko: el modelo puede mantener conversaciones multi-turno dentro de una ventana de 4096 tokens y responder con un nivel de esfuerzo `low` para consultas simples, reduciendo latencia y coste.
- Conversion de divisas en tiempo real: mediante `<tool_call>` contra la API del Banco Central de Uzbekistan (CBU), el modelo puede consultar tipos de cambio oficiales e integrarlos en respuestas conversacionales.
- Busqueda de productos y precios: integracion con el catalogo de Korzinka o la busqueda de Uzum Market para construir asistentes de compra que consulten disponibilidad y precios actualizados.
- Consulta de legislacion uzbeka: uso del modo `high` de razonamiento para recuperar y sintetizar fragmentos de los codigos Fiscal, Laboral y Civil, adecuado para prototipos de asistencia legal interna (con supervision humana).
- Generacion de codigo para integraciones de pago locales: el ajuste cubre Payme, Click y Eskiz.uz en Node.js, PHP/Laravel y Python, lo que permite prototipar backends de pago o envio de SMS en el contexto uzbeko.
- Despliegue local en entornos con recursos limitados: al distribuirse en GGUF Q4_K_M (1,88 GB), puede ejecutarse con Ollama o llama-cpp-python en portatiles y estaciones de trabajo sin GPU dedicada de gama alta.
- Normalizacion de texto uzbeko: el tratamiento especifico del alfabeto reformado y del digrafo "sh" lo hace util para tareas de preprocesado o correccion ortografica en pipelines de NLP en uzbeko.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con la cuantizacion Q4_K_M publicada, incluyendo overhead de contexto; el archivo pesa 1,88 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); en GPUs de gama alta como RTX 4090, A100 o H100 el modelo queda limitado por su tamano y no aprovecha la capacidad de computo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (la model card incluye un Modelfile y el comando `ollama create`), llama-cpp-python y, por compatibilidad GGUF, llama.cpp. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del nivel de esfuerzo `<think>` seleccionado (los niveles `medium` y `high` generan entre 120 y 800 tokens adicionales de razonamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Navoiy AI 3B GGUF | 3.212.749.888 | 4096 | uzbeko | llama3.2 | GGUF Q4_K_M | Ajuste QLoRA con razonamiento por niveles y tool calling local |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.888 | 128.000 (modelo base) | multilingue | llama3.2 | safetensors, GGUF | Modelo base; contexto oficial muy superior al documentado en el ajuste |
| Modelos uzbekos especializados de otros autores | no disponible | no disponible | uzbeko | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion directa con el modelo base es la mas relevante: Navoiy AI 3B reduce el contexto declarado a 4096 tokens frente a los 128.000 del Llama-3.2-3B-Instruct original, a cambio de especializacion en uzbeko, razonamiento estructurado y tool calling para servicios locales. No se dispone de benchmarks que permitan comparar la calidad del ajuste frente al modelo base ni frente a otras alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks; no es posible verificar la mejora del ajuste frente al modelo base ni cuantificar su calidad en tareas estandar.
- El contexto declarado es de 4096 tokens, muy inferior a los 128.000 tokens del Llama-3.2-3B-Instruct original; el ajuste puede haber degradado las capacidades del modelo base en contextos largos.
- El modelo esta especializado en uzbeko; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion en consultas de legislacion, tipos de cambio o precios si las herramientas no se invocan correctamente o devuelven datos desactualizados; las respuestas con datos en tiempo real dependen de la implementacion del tool calling por parte del integrador.
- El esquema `<think effort="high">` puede generar entre 400 y 800 tokens adicionales, lo que incrementa la latencia y el coste en produccion.
- Licencia llama3.2 (Llama 3.2 Community License): el uso comercial esta sujeto a los terminos de Meta, incluidos requisitos de atribucion y la politica de uso aceptable; conviene revisarlos antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validacion externa del modelo.
- Solo se publica una cuantizacion (Q4_K_M); no hay versiones en safetensors ni otras cuantizaciones en el repositorio.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado mayoritariamente con datos multilingues, puede presentar sesgos culturales o linguisticos no adaptados al contexto uzbeko.

## Enlaces

- Hugging Face: https://huggingface.co/lonepixel/navoiy-ai-3b-gguf
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Ollama: https://ollama.com
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
