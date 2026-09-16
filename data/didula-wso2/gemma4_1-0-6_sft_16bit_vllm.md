# didula-wso2/gemma4_1-0-6_sft_16bit_vllm

## Resumen

El modelo `didula-wso2/gemma4_1-0-6_sft_16bit_vllm` es un ajuste fino supervisado (SFT) publicado por el usuario didula-wso2, desarrollado a partir del modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`. Se distribuye en formato de 16 bits con pesos safetensors y un total de 7.996.156.490 parámetros (aproximadamente 8.000 millones), con un repositorio de 16,0 GB. El pipeline declarado es `image-text-to-text`, por lo que acepta entradas de imagen y texto y genera texto, y los tags del repositorio incluyen `transformers`, `text-generation-inference`, `unsloth` y `gemma4`.

El modelo está pensado para generación de texto conversacional en inglés, con capacidad multimodal heredada de su modelo base. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, y la model card indica que el entrenamiento fue "2 veces más rápido" gracias a Unsloth, aunque no se detalla el conjunto de datos ni el número de tokens utilizados.

Su relevancia es limitada en términos de validación pública: el repositorio registra 0 descargas y 0 likes desde su creación el 15 de septiembre de 2026, y no incluye resultados de evaluación, detalles del dataset de SFT ni información sobre la longitud de contexto. La licencia declarada es Apache-2.0, lo que facilita su reutilización, pero la falta de documentación obliga a validar su comportamiento en el caso de uso concreto antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma, según el tag `gemma4`; detalles de capas y atención no documentados) |
| Parametros totales | 7.996.156.490 (≈8B, dato de safetensors) |
| Parametros activos | no disponible (el nombre del modelo base incluye "e4b", pero la información proporcionada no confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en 16 bits (safetensors); el modelo base estaba cuantizado en 4 bits con bitsandbytes, pero este repositorio no incluye GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

No se dispone de documentación técnica sobre la arquitectura interna del modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit` más allá de los tags del repositorio, que lo sitúan en la familia Gemma 4 de Google y lo describen como un modelo apto para `image-text-to-text`, lo que implica un codificador visual acoplado a un decodificador de texto. El nombre del modelo base sugiere una variante "E4B" (posiblemente con unos 4.000 millones de parámetros efectivos), pero el recuento real de safetensors del repositorio es de 7.996.156.490 parámetros, por lo que la correspondencia entre el nombre y la configuración real no queda confirmada. Tampoco se detalla si emplea atención global completa, atención deslizante o algún esquema híbrido.

En cuanto al entrenamiento, el modelo es un ajuste fino supervisado (el identificador incluye `sft`) sobre el modelo base, realizado con Unsloth y TRL, y exportado en 16 bits (`16bit`) para su uso con vLLM y `text-generation-inference`. No se especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni la técnica de ajuste (LoRA, QLoRA o ajuste completo). Tampoco se documenta ninguna innovación técnica adicional más allá de la aceleración del entrenamiento proporcionada por Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno según el tag `conversational`.
- Entrada multimodal de imagen y texto con salida de texto (pipeline `image-text-to-text`), lo que permite responder preguntas sobre imágenes.
- Comprensión de imágenes heredada del modelo base, aunque no se documentan los tipos de tarea visual soportados ni su precisión.
- Generación de código y razonamiento matemático: no disponible, no hay evidencia publicada en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo de razonamiento explícito (thinking mode) o entrada/salida de audio: no disponible.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`) y con `text-generation-inference`.

## Casos de uso

- Asistente conversacional en inglés con soporte de imágenes: el modelo puede mantener diálogos multi-turno en los que el usuario adjunta una captura de pantalla o una fotografía y pide una explicación, algo habitual en soporte técnico de primer nivel. Su naturaleza multimodal lo hace adecuado para este escenario, aunque la longitud de contexto no está documentada.
- Extracción de información de documentos escaneados: a partir de una imagen de una factura, un albarán o un formulario, el modelo puede generar un resumen o extraer campos en texto. Es un uso directo del pipeline `image-text-to-text`, pero requiere validación previa porque no hay métricas publicadas.
- Generación de descripciones de imágenes y textos alternativos: útil para pipelines de accesibilidad web, donde se necesita generar un `alt-text` a partir de una imagen. El ajuste fino SFT puede adaptar el estilo de las descripciones a un dominio concreto.
- Clasificación y moderación de contenido multimodal: el modelo puede analizar una imagen junto con un texto y emitir una etiqueta o una decisión en lenguaje natural, integrándose en flujos de revisión de contenido.
- Prototipado rápido de asistentes internos: dado que los pesos están en safetensors de 16 bits y el repositorio es compatible con vLLM y TGI, puede desplegarse como servicio interno para validar una idea de producto antes de invertir en un modelo mayor.
- Base para nuevos ajustes finos en dominios concretos: al ser un SFT ya adaptado y con licencia Apache-2.0, puede servir como punto de partida para un segundo ajuste con datos propios, especialmente si el dominio requiere entrada de imágenes y salida en inglés.
- Automatización de respuestas en inglés para atención al cliente: el tag `conversational` y el formato de pesos de 16 bits permiten servirlo con vLLM detrás de una API, gestionando conversaciones con contexto corto o medio, siempre que se valide la tasa de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas genéricas sobre ciberseguridad, sin relación con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 16 GB solo para los pesos, más el espacio para la caché KV y las activaciones. Como referencia práctica, entre 20 y 24 GB para contextos moderados (estimación derivada del recuento de parámetros, no un dato publicado por el autor).
- GPU recomendadas para 16 bits: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB) o RTX 4090 / RTX 3090 (24 GB) para contextos cortos.
- Compatibilidad con GPU de consumo: cabe en RTX 4090 y RTX 3090 de 24 GB en 16 bits, y en GPUs de 16 GB solo con cuantización adicional o contextos muy reducidos. No cabe en GPUs de 8 o 12 GB sin cuantizar.
- Si se cuantiza a 4 bits con bitsandbytes, GPTQ o AWQ, el consumo de pesos bajaría aproximadamente a 5 o 6 GB (estimación basada en el tamaño), lo que permitiría ejecutarlo en GPUs de 8 a 12 GB.
- Opciones de despliegue: vLLM (el nombre del repositorio hace referencia explícita a vLLM), text-generation-inference (tag `text-generation-inference`), transformers con `pipeline("image-text-to-text")` y endpoints de Hugging Face (tag `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación es aproximada porque no se dispone de los datos del modelo base Gemma 4 ni de métricas de este ajuste. Se incluyen alternativas de tamaño similar en el rango de 7B a 8B.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| didula-wso2/gemma4_1-0-6_sft_16bit_vllm | 7,99B | no disponible | Sí (imagen y texto) | Apache-2.0 | 0 descargas y 0 likes; sin benchmarks |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | No | Llama 3.1 Community License | Amplia adopción y herramientas de despliegue |
| Qwen2.5-7B-Instruct | 7,62B | 32.768 tokens nativos | No | Apache-2.0 | Buen rendimiento declarado en código y matemáticas |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 tokens | No | Apache-2.0 | Referencia clásica en el rango 7B |
| Gemma 3 4B IT | 4,30B | 128.000 tokens | Sí (visión) | Gemma Terms of Use | Alternativa multimodal de menor tamaño, con condiciones de uso propias |

Conviene señalar que los datos del modelo base Gemma 4 y de este ajuste concreto no están disponibles en la información proporcionada, por lo que la comparativa de contexto y rendimiento queda incompleta.

## Limitaciones y advertencias

- No se ha publicado ningún resultado de evaluación, ni cualitativo ni cuantitativo, en la model card ni en el repositorio.
- Se desconoce la composición del conjunto de datos de SFT, por lo que no es posible evaluar sesgos potenciales introducidos durante el ajuste.
- El ajuste fino sobre un subconjunto reducido de datos puede provocar olvido catastrófico de capacidades del modelo base, especialmente en tareas visuales o de razonamiento no presentes en el dataset de SFT.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, no mitigado por ninguna técnica documentada (verificación, RAG o control de citas).
- Idiomas soportados: únicamente inglés. El rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas empíricas.
- Capacidades de tool calling, agentes y modo de razonamiento no documentadas.
- La licencia declarada es Apache-2.0, pero al derivar de un modelo Gemma conviene revisar las condiciones de uso del modelo base antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- Estado de validación por la comunidad nulo (0 descargas y 0 likes), por lo que no existen informes independientes de comportamiento en producción.
- El repositorio solo ofrece pesos en 16 bits, lo que limita el despliegue en hardware de gama baja sin cuantización adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/didula-wso2/gemma4_1-0-6_sft_16bit_vllm
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no se proporciona enlace directo en la información disponible
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo, únicamente páginas genéricas sobre ciberseguridad sin relación con el repositorio
