# neutronai-code/Quark-1.5B-v0.5-GGUF

## Resumen

Quark-1.5B-v0.5 es un modelo de lenguaje de aproximadamente 1.540 millones de parametros (1.543.714.304 exactos segun los pesos en safetensors) publicado por el usuario neutronai-code bajo el identificador `neutronai-code/Quark-1.5B-v0.5-GGUF`. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2, segun la etiqueta `qwen2` del repositorio, convertido a formato GGUF mediante la herramienta Unsloth. El repositorio contiene unicamente la version cuantizada en GGUF, pensada para su uso con llama.cpp y con la CLI `llama-cli`.

El modelo se presenta como un LLM de texto de proposito general, si bien la model card incluye tambien la instruccion para modelos multimodales (`llama-mtmd-cli`), lo que sugiere que el autor contempla ese caso de uso aunque no se documenta ninguna capacidad de vision concreta. El tamano de 1.5B lo situa en la franja de modelos pequenos, aptos para inferencia en CPU o en GPUs de consumo con poca VRAM.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: el repositorio no incluye licencia, idiomas soportados, datos de entrenamiento, benchmarks ni una descripcion detallada del proceso de ajuste. Todo lo que se indica a continuacion se deriva de los metadatos disponibles y de la model card, y se marca explicitamente como "no disponible" cuando el dato no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2, segun la etiqueta `qwen2`) |
| Parametros totales | 1.543.714.304 (aprox. 1.5B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el unico archivo publicado es `Quark-1.5B-v0.4.Q4_K_M.gguf` (Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia del recuento de parametros) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un ajuste fino de Qwen2, una familia de transformers decoder-only con atencion causal estandar, normalizacion RMSNorm y sesgos de atencion QKV caracteristicos de la arquitectura Qwen. No obstante, el repositorio no documenta la configuracion exacta (numero de capas, dimensiones ocultas, cabezas de atencion, tipo de activacion ni vocabulario), por lo que estos detalles se consideran no disponibles.

El proceso de entrenamiento se describe unicamente como un fine-tuning realizado con Unsloth, una libreria optimizada para ajuste fino de LLMs que reduce el uso de memoria y acelera el entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO u otra alineacion, ni si hubo una fase de instruccion. Tampoco se detalla si el ajuste fue supervisado (SFT) o si se emplearon tecnicas de bajo rango (LoRA/QLoRA). La unica innovacion tecnica mencionada es el uso de Unsloth para el entrenamiento y la conversion a GGUF.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, compatible con llama.cpp.
- Uso mediante `llama-cli` con la opcion `--jinja`, lo que habilita el uso de plantillas de chat Jinja para formatear conversaciones multi-turno.
- El autor incluye la instruccion `llama-mtmd-cli` para modelos multimodales, lo que sugiere una posible extension a entrada multimodal, aunque no se documenta ninguna capacidad de vision, audio o video concreta.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido en local con llama.cpp: al ser un GGUF de 1.5B en cuantizacion Q4_K_M, el modelo se puede ejecutar en portatiles sin GPU dedicada, lo que lo hace util para probar pipelines de generacion de texto antes de escalar a modelos mayores.
- Asistentes conversacionales ligeros: gracias a la opcion `--jinja` de llama.cpp, se puede desplegar un chatbot multi-turno con plantilla de chat, adecuado para entornos con recursos limitados (por ejemplo, un asistente de documentacion interna en una Raspberry Pi o un mini-PC).
- Generacion de texto en aplicaciones de escritorio o moviles: el tamano reducido del archivo GGUF (1.0 GB en el repositorio) permite empaquetar el modelo dentro de una aplicacion de escritorio o un plugin de editor de texto sin depender de la nube.
- Filtrado y clasificacion de texto: un modelo de 1.5B puede emplearse para tareas de etiquetado, resumen corto o extraccion de entidades en lotes, siempre que se valide su calidad con datos propios, dado que no hay benchmarks publicados.
- Educacion y experimentacion: util como banco de pruebas para estudiar el efecto del fine-tuning con Unsloth sobre un modelo base Qwen2, comparando el modelo ajustado con el original.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente y no requerir conexion a Internet, encaja en escenarios donde los datos no pueden salir del dispositivo (por ejemplo, procesamiento de notas personales o documentos internos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (aprox. 4 bits por peso), el modelo ocupa alrededor de 1 GB en disco; la VRAM necesaria para cargarlo en GPU se situa en el entorno de 1-2 GB, dependiendo del backend y del contexto configurado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en Q4_K_M; tarjetas como RTX 3050, RTX 4060, GTX 1660 o superiores son suficientes. Para contexto largo, se recomienda al menos 4 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (CLI `llama-cli` y `llama-mtmd-cli`), y por extension cualquier frontend compatible con GGUF como Ollama o llama-cpp-python. No se documenta soporte para vLLM ni TGI en el repositorio.
- Latencia y throughput estimados: no disponibles. Al no haber datos publicados, el rendimiento dependera del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Quark-1.5B-v0.5 | 1.5B | no disponible | no disponible | GGUF (Q4_K_M) | Fine-tuning de Qwen2 con Unsloth |
| Qwen2-1.5B | 1.5B | 32.768 tokens (segun la familia Qwen2) | Apache 2.0 (segun Qwen2) | safetensors, GGUF | Modelo base original; referencia directa |
| TinyLlama-1.1B | 1.1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Alternativa pequena de proposito general |
| Phi-2 | 2.7B | 2.048 tokens | MIT | safetensors | Modelo pequeno con buen rendimiento en razonamiento, aunque mayor |

La comparativa se limita a datos publicos de los modelos alternativos; para Quark-1.5B no se dispone de contexto, licencia ni benchmarks, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Falta de documentacion: no se especifican idiomas, contexto, datos de entrenamiento ni proceso de alineacion, lo que dificulta evaluar su calidad y sesgos.
- Riesgo de alucinacion: como todo LLM de 1.5B sin benchmarks publicados, es probable que genere contenido inventado, especialmente en tareas de razonamiento o conocimiento factual; no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos conocidos: no disponibles; al desconocerse el dataset de ajuste, no se puede evaluar que sesgos pueda haber heredado del modelo base o del fine-tuning.
- Limitaciones de contexto e idioma: no disponibles; la etiqueta `qwen2` sugiere herencia multilingue del modelo base, pero no se confirma.
- Caveat de produccion: el archivo GGUF publicado corresponde a la version v0.4 del modelo (`Quark-1.5B-v0.4.Q4_K_M.gguf`), mientras que el repositorio se etiqueta como v0.5; conviene verificar que la version descargada coincide con la esperada.
- El modelo se distribuye unicamente en cuantizacion Q4_K_M; no hay versiones en otros niveles de cuantizacion ni pesos completos en el repositorio, lo que limita el ajuste fino posterior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.5-GGUF
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp (backend de inferencia): https://github.com/ggml-org/llama.cpp
- Documentacion de Qwen2 (modelo base): https://huggingface.co/Qwen/Qwen2-1.5B
