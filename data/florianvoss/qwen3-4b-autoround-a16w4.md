# florianvoss/Qwen3-4B-Autoround-a16w4

## Resumen

Qwen3-4B-Autoround-a16w4 es un artefacto compilado por florianvoss para su ejecución en hardware SiMa Modalix mediante el runtime LLiMa, dentro de la colección Neat 0.6.0. No se trata de un modelo entrenado desde cero, sino de una compilación del checkpoint prequantizado simaai/Qwen3-4B-Autoround-Safetensors, derivado a su vez de Qwen3-4B, un modelo de 4.000 millones de parámetros orientado a generación de texto.

El paquete fija un contexto máximo de 4.096 tokens, utiliza activaciones BF16, embeddings y KV cache en INT8, y conserva los pesos cuantizados AutoRound del origen. Incluye un directorio devkit/ con activos de runtime y elf_files/ con 179 ejecutables, además de un script de compilación. Su relevancia está en el despliegue de inferencia local en dispositivos Modalix, no en GPU convencionales: no es un checkpoint safetensors ni GGUF listo para transformers, vLLM o llama.cpp.

La licencia declarada es Apache-2.0, con aplicación de los términos del modelo fuente. No se han publicado benchmarks, mediciones de latencia ni evaluaciones de precisión para este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3-4B; compilado con ModelGraph para LLiMa. La model card no detalla capas ni mecanismo de atención. |
| Parámetros totales | 4.000 millones (4B), heredados de Qwen3-4B. |
| Parámetros activos | No aplica; no se documenta como modelo MoE. |
| Longitud de contexto | 4.096 tokens como máximo de compilación; prefill group size de 128. |
| Tipos de cuantización | Esquema a16w4 del nombre: pesos de 4 bits del checkpoint AutoRound y activaciones BF16; embeddings y KV cache INT8; grupos y excepciones de precisión mixta preservados del origen. |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen3-4B se describe como multilingüe en Qualcomm AI Hub. |
| Licencia | Apache-2.0; se aplican los términos del modelo fuente. |
| Formato de pesos | Paquete compilado LLiMa: devkit/ con activos de runtime y elf_files/ con 179 ejecutables. No es safetensors ni GGUF; el origen es un checkpoint safetensors prequantizado. |
| Tamaño del repositorio | 5,0 GB. |
| Uso previsto | Inferencia en SiMa Modalix con runtime LLiMa compatible; `inference: false` en HuggingFace. |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero ni documenta un proceso de ajuste supervisado, RLHF o DPO. La model card lo presenta como una compilación del checkpoint simaai/Qwen3-4B-Autoround-Safetensors, que conserva la arquitectura del modelo base Qwen3-4B y los pesos cuantizados AutoRound, los tamaños de grupo y las excepciones de precisión mixta del origen. La etiqueta de HuggingFace incluye `base_model:finetune`, pero no se aportan detalles de ningún fine-tuning; la descripción disponible habla de compilación.

El build fija un contexto máximo de 4.096 tokens y un prefill group size de 128. Utiliza activaciones BF16, embeddings y KV cache INT8, y compila con ModelGraph nativo mediante 16 procesos paralelos, cada uno con un hilo de simulador. La compilación habilita filter sharing para los componentes de lenguaje. No se especifican número de tokens de entrenamiento, composición del dataset ni técnicas de alineación adicionales.

## Capacidades

- Generación de texto y comprensión del lenguaje: el pipeline declarado es text-generation y el modelo base Qwen3-4B se describe como un modelo de comprensión y generación de lenguaje.
- Código y matemáticas: Qualcomm AI Hub atribuye al Qwen3-4B capacidades de coding y mathematics; este artefacto compilado no incluye una evaluación propia de esas capacidades.
- Multilingüismo: el modelo base se describe como multilingüe; la model card de este build no enumera idiomas ni niveles de calidad por idioma.
- Conversaciones multi-turno: el contexto de 4.096 tokens permite mantener hilos de varias interacciones, aunque no está pensado para documentos o historiales extensos.
- Ejecución local en Modalix: permite inferencia en dispositivo con el runtime LLiMa, sin depender de una GPU NVIDIA o de un servicio cloud.
- Tool calling o function calling: no documentado en la información disponible.
- Agentes y razonamiento multi-paso: no documentado en la información disponible.
- Visión, audio o modo thinking: no documentado; el pipeline es text-generation.

## Casos de uso

- Asistente conversacional local en dispositivos Modalix: se puede desplegar como asistente de texto en entornos sin conexión cloud, con conversaciones de hasta 4.096 tokens y un modelo de 4B cuantizado para reducir la huella de memoria.
- Resumen y extracción de información de documentos cortos o medios: informes, correos y contratos de hasta 4.096 tokens pueden procesarse en el propio dispositivo, evitando enviar datos sensibles a servicios externos.
- Clasificación y enrutado de tickets de soporte: el modelo puede analizar el texto de una incidencia y generar una etiqueta o una respuesta inicial; el contexto de 4.096 tokens cubre hilos de soporte habituales.
- Generación de código en entornos embebidos o industriales: puede usarse como generador de fragmentos, explicaciones de código o scripts en herramientas internas; no hay soporte documentado de tool calling, por lo que la integración sería como generador de texto.
- Análisis de logs y alertas en edge: permite resumir trazas, explicar errores y redactar informes breves en el dispositivo Modalix, sin extraer los logs fuera de la red local.
- Tutoría o FAQ offline: puede responder preguntas frecuentes y generar explicaciones en kioscos o dispositivos educativos; el multilingüismo dependerá de lo que conserve el modelo base, no verificado en este build.
- Validación de pipelines LLiMa y Neat: sirve para probar la descarga, el empaquetado, la compilación y el arranque de un modelo de 4B en Modalix; la model card indica que la compilación y el despliegue local se completaron correctamente.
- Atención al cliente en kioscos o equipos industriales: puede gestionar interacciones multi-turno breves y generar respuestas guiadas con un contexto de 4.096 tokens, siempre que la latencia del dispositivo sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica que la compilación completa y el despliegue local se completaron correctamente y que los archivos se verificaron por checksum, pero también especifica que las mediciones de generación en runtime, precisión y rendimiento no fueron realizadas por el autor.

| Benchmark o métrica | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Latencia en Modalix | no disponible |
| Throughput en Modalix | no disponible |
| Evaluación de precisión tras cuantización | no disponible |

## Requisitos de hardware

- Hardware objetivo: SiMa.ai Modalix con un runtime LLiMa compatible. No es un paquete para GPU NVIDIA, AMD o Apple Silicon.
- VRAM en GPU: no aplicable. La memoria necesaria en Modalix no está publicada. Como referencia aritmética, 4B parámetros a 4 bits equivalen a unos 2 GB de pesos, sin contar embeddings INT8, KV cache INT8, devkit ni overhead del runtime.
- GPU recomendadas: ninguna. A100, H100 o RTX 4090 no pueden ejecutar este artefacto directamente sin una compilación específica para su backend.
- GPU de consumo: no. No hay soporte documentado para RTX 4090, RTX 3090 u otras GPU consumer.
- Despliegue: `hf download florianvoss/Qwen3-4B-Autoround-a16w4 --local-dir Qwen3-4B-Autoround-a16w4` y `llima run ./Qwen3-4B-Autoround-a16w4`, con un runtime LLiMa compatible.
- Recompilación: requiere un entorno Model Compiler compatible y el uso de `compile.sh`; se pueden pasar `MODEL_DIR`, `OUTPUT_DIR` y argumentos adicionales del compilador.
- Contexto y resoluciones de imagen: se seleccionan durante la compilación; este build fija 4.096 tokens y prefill group size 128.
- Latencia y throughput: no disponibles; no fueron medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y cuantización | Licencia | Despliegue |
|---|---:|---|---|---|---|
| florianvoss/Qwen3-4B-Autoround-a16w4 | 4B | 4.096 tokens | Pesos INT4 AutoRound, activaciones BF16, embeddings y KV cache INT8; paquete LLiMa con ELF | Apache-2.0 | SiMa Modalix con LLiMa |
| simaai/Qwen3-4B-Autoround-Safetensors | 4B | no disponible | Safetensors prequantizado AutoRound | Apache-2.0, con términos del modelo fuente | Runtime compatible con el checkpoint; no especificado |
| Qwen/Qwen3-4B | 4B | no disponible en la información proporcionada | Checkpoint original; formato no detallado en la información | Apache-2.0 | Stacks estándar de inferencia; no verificado en esta ficha |
| florianvoss/Qwen3.5-9B-Autoround-a16w4-Modalix | 9B | no disponible | Compilado A16W4 para Modalix; INT4 AutoRound/GPTQ e INT8 en componentes de visión | no disponible | SiMa Modalix con LLiMa |

La comparación directa más útil es con el checkpoint fuente y con Qwen3-4B: este artefacto no cambia el tamaño, sino el formato de despliegue y el contexto máximo, que queda fijado en 4.096 tokens. La alternativa de 9B de la misma colección ofrece mayor tamaño, pero también requiere Modalix y no dispone de datos de rendimiento en la información consultada.

## Limitaciones y advertencias

- No es un checkpoint estándar: no puede cargarse directamente con transformers, vLLM, llama.cpp, Ollama o TGI. Requiere el runtime LLiMa y hardware Modalix.
- El contexto está limitado a 4.096 tokens en este build; no es adecuado para documentos largos, historiales extensos ni tareas que necesiten ventanas de 32K o superiores.
- No hay benchmarks ni evaluación de precisión publicados. La cuantización AutoRound y el empaquetado compilado pueden degradar la calidad respecto al modelo base, pero no se ha medido.
- No se documentan idiomas concretos ni calidad multilingüe en este artefacto; el multilingüismo es una característica atribuida al modelo base, no verificada aquí.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha evaluado en este build.
- Sesgos conocidos o potenciales del modelo base no evaluados; la model card no incluye análisis de sesgo.
- La licencia es Apache-2.0, pero se aplican los términos del modelo fuente. Conviene revisar la licencia de Qwen3-4B y mantener la atribución correspondiente.
- La etiqueta de HuggingFace incluye `base_model:finetune`, pero la documentación disponible describe una compilación, no un fine-tuning; no hay detalles de datos o metodología de ajuste.
- El paquete contiene 179 ejecutables ELF y activos de runtime; la validación se limita a checksum y compilación, sin una auditoría de seguridad publicada.
- El contexto y otros parámetros se fijan en compilación; cambiarlos exige recompilar con un entorno Model Compiler compatible.

## Enlaces

- [florianvoss/Qwen3-4B-Autoround-a16w4 en HuggingFace](https://huggingface.co/florianvoss/Qwen3-4B-Autoround-a16w4)
- [Modelo fuente simaai/Qwen3-4B-Autoround-Safetensors](https://huggingface.co/simaai/Qwen3-4B-Autoround-Safetensors)
- [Revisión concreta del modelo fuente](https://huggingface.co/simaai/Qwen3-4B-Autoround-Safetensors/tree/0f817a6534b786a6bdc5c5477b62c87a6a86de4c)
- [Colección Neat 0.6.0](https://huggingface.co/collections/florianvoss/neat-060)
- [Licencia de Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B/blob/1cfa9a7208912126459214e8b04321603b3df60c/LICENSE)
- [compilation.json del artefacto](https://huggingface.co/florianvoss/Qwen3-4B-Autoround-a16w4/blob/main/compilation.json)
- [compile.sh del artefacto](https://huggingface.co/florianvoss/Qwen3-4B-Autoround-a16w4/blob/main/compile.sh)
- [Qwen3-4B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_4b)
- [Tutorial de fine-tuning de Qwen3-4B en Azure Databricks](https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b)
- [Registro de Qwen3-4B-Autoround-a16w4 en free2aitools](https://free2aitools.com/model/simaai/qwen3-4b-autoround-a16w4)
- [Modelo relacionado florianvoss/Qwen3.5-9B-Autoround-a16w4-Modalix](https://huggingface.co/florianvoss/Qwen3.5-9B-Autoround-a16w4-Modalix)
