# Cialtion/SimpleTool-Gemma4-E4B-8Head-5pct-LoRA

## Resumen

SimpleTool-Gemma4-E4B-8Head-5pct-LoRA es un adaptador LoRA de tool calling desarrollado por Cialtion sobre el modelo base google/gemma-4-E4B-it. No se trata de un modelo completo fusionado, sino de un paquete de artefactos de entrenamiento que incluye pesos LoRA (r128/alpha256), filas de tokens especiales de cabeza, un tokenizador propio y la lógica de reconstrucción necesaria para cargarlo correctamente. Su objetivo es especializar al modelo base en la generación estructurada de llamadas a funciones, dividiendo la tarea en ocho ramas lógicas: contenido, función y seis argumentos (arg1 a arg6).

El adaptador se entrenó con la programación de datos del 5% del proyecto SimpleTool, completando 18.975 pasos en una época. La relevancia actual reside en su enfoque poco habitual: en lugar de generar la llamada a herramienta como texto libre, el modelo decodifica de forma autorregresiva e independiente cada rama tras su marcador correspondiente, lo que impone restricciones estructurales explícitas (parámetros obligatorios antes que opcionales, coherencia con el orden de propiedades del esquema y un máximo de seis propiedades de nivel superior).

La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio. El autor declara un estado de validación limitado a inferencia de diagnóstico textual (Diagnostic-800) y advierte que la carga mediante PEFT estándar es incompleta, requiriendo el loader propio incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (base google/gemma-4-E4B-it); cabezas de tokens especiales y decodificación por ramas |
| Parametros totales | no disponible (adaptador LoRA; el modelo base se descarga aparte) |
| Parametros activos | no disponible (el modelo base E4B no se documenta como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; se infiere BF16 base con adaptadores FP32 segun la evaluacion registrada) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, head_tokens.safetensors, grouped_expert_lora.safetensors) + tokenizer + modeling.py + ADAPTER_FORMAT.json |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-4-E4B-it mediante LoRA ordinario con r128 y alpha256. Además del adaptador convencional, el paquete incluye 17 filas de tokens entrenados de inicio, fin y nulo (head_tokens.safetensors); en la familia E también se restauran filas de embedding por capa. Para la variante 26B-A4B se incluye además grouped_expert_lora.safetensors con r16/alpha32, aunque el modelo base declarado en esta ficha es E4B. La lógica de reconstrucción real vive en modeling.py y ADAPTER_FORMAT.json, y el autor subraya que la carga solo con PEFT es incompleta: hay que usar el loader proporcionado para restaurar filas especiales, PLE y deltas de expertos agrupados cuando proceda.

El entrenamiento completó 18.975 pasos en una sola época, con una fracción de datos del 5% que corresponde a una selección del corpus, no a una poda del modelo. La innovación principal es la descomposición en ocho ramas lógicas (content, function, arg1 a arg6) que comparten los pesos del backbone y decodifican de forma autorregresiva independiente tras su propio marcador. El formato impone que los parámetros obligatorios precedan a los opcionales, que `required` concuerde con el orden de propiedades del esquema y que los argumentos sigan las posiciones de propiedad de la herramienta seleccionada, con un máximo de seis propiedades de nivel superior. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del corpus de entrenamiento.

## Capacidades

- Generación de llamadas a herramientas (tool calling) estructuradas con esquemas de función y hasta seis propiedades de nivel superior.
- Decodificación por ramas independientes para función y argumentos, con restricciones de orden entre parámetros obligatorios y opcionales.
- Generación de contenido opcional mediante el flag `--content` en la inferencia de referencia.
- Soporte bilingüe chino e inglés, tanto en definiciones de herramientas como en consultas.
- Plantilla de chat nativa entrenada de Gemma, que cierra el bloque de pensamiento para la familia mayor según lo entrenado.
- Integración con el ecosistema Hugging Face (transformers, PEFT, safetensors, accelerate) mediante el loader propio del repositorio.
- No se documentan capacidades de visión, audio, agentes multi-paso ni razonamiento extendido más allá de la generación de la llamada.

## Casos de uso

- Automatización de asistentes con herramientas: el adaptador genera llamadas a función estructuradas a partir de definiciones de herramientas y una consulta del usuario, adecuado para integrarse en orquestadores que ejecutan las herramientas propuestas.
- Enrutamiento de consultas a APIs internas: dado un catálogo de funciones con esquemas, el modelo selecciona la función y rellena argumentos, lo que permite construir capas de enrutamiento hacia servicios REST o RPC.
- Extracción de parámetros en pipelines de datos: con hasta seis propiedades por herramienta, puede mapear entidades de una consulta a los campos de un formulario o esquema de extracción.
- Prototipado de agentes conversacionales bilingües (zh/en): útil en productos con usuarios de ambos idiomas que requieran invocación de funciones desde lenguaje natural.
- Evaluación comparativa de estrategias de tool calling: sirve como referencia para estudiar la decodificación por ramas frente a la generación de JSON en texto libre en tareas de function calling.
- Investigación sobre restricciones estructurales en decodificación: el formato impone orden y coherencia con el esquema, lo que lo hace útil para experimentos sobre validez sintáctica de llamadas generadas.
- Integración en entornos de investigación con control de versiones estrictas: al requerir versiones concretas (Python 3.12, Torch 2.11.0, CUDA 12.8, transformers 5.17.0, PEFT 0.21.3), encaja en pipelines reproducibles con entornos fijados.

## Benchmarks y rendimiento

Evaluación registrada el 2026-11-17 sobre el conjunto congelado bilingüe SimpleTool Diagnostic-800 (400 casos en chino y 400 en inglés), con decodificación greedy, máximo de 128 tokens nuevos por cabeza, plantilla nativa entrenada, base BF16 con autocast y adaptadores/filas FP32, SDPA+KV. El matcher es un comparador literal tipado local, no el AST/ejecución oficial de BFCL. El contenido se excluyó de esta evaluación de calidad.

| Metrica | Resultado |
|---|---|
| Coincidencias de llamada requerida (required-call) | 565/800 (70,625%) |
| Coincidencias de función | 775/800 (96,875%) |

El propio autor advierte que el matcher de llamada requerida exige también validez de esquema, por lo que valores opcionales mal formados pueden hacerlo fallar, y que las ramas de parámetros independientes pueden asignar entidades o slots correlacionados de forma incorrecta. Los pares de muestras relacionadas no son tareas IID. No se evaluaron visión ni calidad de contenido. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del checkpoint base google/gemma-4-E4B-it y de la precisión usada (la evaluación registrada emplea base BF16 con adaptadores FP32).
- GPU recomendadas: no disponible; el entorno validado referencia CUDA 12.8, sin especificar modelos de GPU.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el autor indica usar el soporte del entorno original (Python 3.12, Torch 2.11.0, CUDA 12.8, transformers 5.17.0, PEFT 0.21.3, safetensors y accelerate) junto con el loader propio (`infer.py`) y el checkpoint base descargado localmente. La carga solo con PEFT es incompleta. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La referencia decodifica cada rama de forma secuencial por claridad y no reproduce la ruta paralela en CUDA del entrenamiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación con alternativas de tool calling (por ejemplo, adaptadores LoRA equivalentes sobre otros modelos base) requeriría ejecutar la misma evaluación Diagnostic-800, que no está publicada para terceros.

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Gemma4-E4B-8Head-5pct-LoRA | no disponible (adaptador sobre E4B) | no disponible | Sí, por ramas con restricciones de esquema | apache-2.0 | Hugging Face (repo de 1,1 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar por separado google/gemma-4-E4B-it y usar el loader incluido; la carga únicamente con PEFT es incompleta.
- La evaluación registrada es de diagnóstico textual (Diagnostic-800) con un matcher literal tipado local, no la evaluación oficial BFCL AST/ejecución; los resultados no son directamente comparables con métricas estándar de function calling.
- El matcher de llamada requerida exige validez de esquema: valores opcionales mal formados pueden provocar fallos aunque la función sea correcta (70,625% de coincidencias frente a 96,875% de acierto de función).
- Las ramas de parámetros independientes pueden asignar entidades o slots correlacionados de forma incorrecta; los pares de muestras relacionadas no son tareas IID.
- No se evaluaron visión ni calidad de contenido; el contenido queda fuera de la evaluación de calidad declarada.
- Solo se declaran los idiomas chino e inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Longitud de contexto no documentada; no se garantiza el comportamiento en conversaciones largas o con muchas herramientas.
- La salida es una propuesta de llamada: no se ejecutan herramientas y la validación y ejecución deben implementarse en el orquestador.
- Restricciones de versiones estrictas (Python 3.12, Torch 2.11.0, CUDA 12.8, transformers 5.17.0, PEFT 0.21.3); versiones más recientes requieren validación independiente.
- Licencia apache-2.0 para el adaptador, pero el uso queda sujeto también a las licencias y avisos del modelo base y del código acompañante.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; aplican los del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Gemma4-E4B-8Head-5pct-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Código y evaluación: https://github.com/HaxxorCialtion/SimpleTool
