# dkingtutcd/gemma-E4B-mt-b-split4

## Resumen
`dkingtutcd/gemma-E4B-mt-b-split4` es un ajuste fino de 16 bits (FP16) publicado por el usuario dkingtutcd sobre su propio checkpoint previo `dkingtutcd/gemma-E4B-mt-b-split3`, dentro de la familia etiquetada como `gemma4`. El repositorio contiene 7.996.156.490 parámetros (unos 8.000 millones) en formato safetensors, ocupa 16 GB y se distribuye con licencia Apache 2.0 y soporte declarado únicamente para inglés.

El pipeline declarado es `image-text-to-text`, lo que sitúa al modelo en la categoría multimodal (entrada de imagen y texto, salida de texto), y entre sus etiquetas figuran `conversational` y `text-generation-inference`, por lo que está pensado para despliegue conversacional mediante Transformers o TGI.

Su relevancia práctica es experimental: se trata de un eslabón más en una cadena de fine-tunes del mismo autor (split3 → split4), con 0 descargas y 0 likes en el momento de la consulta, una model card que solo documenta el entrenamiento con Unsloth y TRL, y sin benchmarks publicados. Es útil como caso de estudio de ajuste rápido sobre un modelo multimodal de ~8B, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Etiqueta `gemma4`; el pipeline `image-text-to-text` implica una arquitectura transformer multimodal (texto + imagen) |
| Parametros totales | 7.996.156.490 (~8B), segun safetensors |
| Parametros activos | No confirmado. El sufijo `E4B` del nombre sugiere un esquema de parametros efectivos, pero la model card no lo documenta ni indica que sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos originales en FP16 (16 bits). No se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga via `transformers`, precision FP16) |

Otros datos: tamano del repositorio 16,0 GB; pipeline `image-text-to-text`; creado y actualizado el 17 de septiembre de 2026; modelo base `dkingtutcd/gemma-E4B-mt-b-split3`.

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna. La informacion disponible se limita a tres hechos: el modelo se etiqueta como `gemma4`, se ha ajustado a partir de `dkingtutcd/gemma-E4B-mt-b-split3` y se ha entrenado "2x mas rapido" con Unsloth y la libreria TRL de Hugging Face. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la tecnica de ajuste (LoRA, QLoRA, full fine-tuning) ni si hubo etapas de RLHF, DPO o similar.

El pipeline `image-text-to-text` junto con la etiqueta `gemma4` indica capacidad multimodal, es decir, que el modelo acepta imagenes ademas de texto, aunque no se documenta el codificador visual ni la resolucion de imagen soportada. El nombre `E4B` apunta a un posible esquema de parametros efectivos (al estilo de las variantes E2B/E4B de la familia Gemma), pero esto no aparece confirmado en la informacion proporcionada, por lo que debe tratarse como una hipotesis a verificar antes de asumir requisitos de computo.

## Capacidades
- Generacion de texto conversacional en ingles, segun las etiquetas `conversational` y `text-generation-inference`.
- Entrada multimodal de imagen y texto con salida de texto, segun el pipeline `image-text-to-text` declarado.
- Compatibilidad con `transformers` y con pesos en safetensors, lo que permite carga directa en Python.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con text-generation-inference (TGI).
- Capacidad de continuar la cadena de fine-tuning: al estar en FP16 y haberse entrenado con Unsloth + TRL, es reutilizable como punto de partida para nuevos ajustes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Capacidades multilingues: no; solo ingles declarado.

## Casos de uso
- Evaluacion de cadenas de fine-tune: comparar `split3` frente a `split4` sobre un mismo conjunto de prompts en ingles para medir el efecto real del ajuste, aprovechando que ambos checkpoints comparten formato FP16 y carga via Transformers.
- Prototipado de asistentes conversacionales multimodales en ingles: construir un chat de demostracion que reciba capturas de pantalla o fotografias y responda en texto, usando el pipeline `image-text-to-text`; adecuado para demos internas, no para produccion sin evaluacion previa.
- Descripcion automatica de imagenes (captioning) en ingles para catalogos internos: generar pies de foto o metadatos textuales de un lote de imagenes antes de indexarlas en un buscador.
- Extraccion de informacion de documentos escaneados en ingles: como etapa de un pipeline OCR + LLM para resumir facturas, formularios o partes, dado que el modelo acepta imagen y texto simultaneamente.
- Base para un nuevo fine-tune con Unsloth o TRL: reentrenar con LoRA o QLoRA sobre un dominio concreto (por ejemplo, soporte tecnico en ingles) partiendo de este checkpoint en lugar del modelo original.
- Cuantizacion y despliegue en hardware de consumo: convertir los pesos a GGUF de 4 bits para ejecutar el modelo en una GPU de 8-12 GB o en CPU, util para pruebas locales y validacion de prompts.
- Generacion de datos sinteticos multimodales: producir pares imagen-descripcion o instrucciones en ingles para entrenar otros modelos, siempre con revision humana posterior.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otras) y la busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a paginas de un portal de preguntas y respuestas sin relacion con el modelo ni con su familia.

## Requisitos de hardware
Las cifras siguientes son estimaciones derivadas del numero de parametros y de la precision, no datos publicados por el autor:

- Pesos en FP16: aproximadamente 16 GB solo para los pesos (coincide con el tamano del repositorio).
- Inferencia en FP16: estimacion de 18-22 GB de VRAM contando cache KV y overhead, segun longitud de contexto y tamano de batch.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, A6000. En una RTX 4090 de 24 GB cabria de forma ajustada con batches pequenos y contexto corto.
- Cuantizacion a 8 bits (aproximadamente 8-9 GB): cabe en RTX 4080, RTX 3080, RTX 3090 y similares.
- Cuantizacion a 4 bits (aproximadamente 5-6 GB): cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB e incluso en GPU de 8 GB con contexto reducido.
- Opciones de despliegue: Transformers (soporte nativo del repositorio), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles. vLLM no esta confirmado para esta arquitectura. llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que no se publica una version GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de tokens por segundo.

## Comparativa con modelos similares
No se dispone de datos verificados de modelos comparables en la informacion proporcionada (la busqueda web no devolvio resultados utiles). Como referencia de categoria, el modelo se situa en el segmento de modelos multimodales de ~8B de parametros, donde los candidatos habituales de comparacion serian las variantes multimodales de la propia familia Gemma, Qwen2.5-VL en el entorno de 7B y otros modelos vision-lenguaje de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gemma-E4B-mt-b-split4 (este modelo) | ~8B | No disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Alternativas multimodales de ~7-8B (familia Gemma, Qwen2.5-VL-7B y similares) | No disponible | No disponible | No disponible | No disponible |

Para una comparacion rigurosa habria que obtener la model card del modelo base original y ejecutar una evaluacion propia, ya que este checkpoint no publica metricas.

## Limitaciones y advertencias
- Modelo comunitario experimental: 0 descargas y 0 likes, sin documentacion de datos de entrenamiento ni de hiperparametros.
- Es un eslabon intermedio de una cadena de fine-tunes (split3 → split4) del mismo autor; no se documenta que el checkpoint resultante mejore al anterior.
- Solo ingles declarado. No hay soporte multilingue confirmado.
- Sin benchmarks publicados: el rendimiento real en tareas concretas es desconocido y hay que medirlo antes de cualquier uso serio.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de documentacion sobre alineamiento (no se menciona RLHF, DPO ni filtrado de datos).
- Sesgos no evaluados: no hay analisis de sesgo ni de seguridad.
- Licencia Apache 2.0 declarada en el repositorio, pero al tratarse de un derivado de un modelo de la familia Gemma conviene verificar los terminos aplicables al modelo original antes de un uso comercial.
- La longitud de contexto no esta documentada: planificar despliegues con contexto largo requiere validacion empirica.
- No se publican pesos cuantizados ni GGUF, por lo que el despliegue en entornos ligeros exige convertir los pesos por cuenta propia.
- El repositorio ocupa 16 GB, lo que implica un coste de descarga y almacenamiento considerable.
- Las fechas del repositorio (creacion y actualizacion el 17 de septiembre de 2026) resultan anomalas y conviene contrastarlas con la plataforma.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dkingtutcd/gemma-E4B-mt-b-split4
- Modelo base (checkpoint previo de la cadena): https://huggingface.co/dkingtutcd/gemma-E4B-mt-b-split3
- Unsloth (herramienta de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria de entrenamiento citada en la model card): https://github.com/huggingface/trl
- Otros enlaces relevantes (paper, blog, demo): no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo.
