# s3t4/banjar-gemma4-e4b-lora

## Resumen

Banjar-LLM Gemma 4 E4B es un adaptador QLoRA de 4 bits desarrollado por el usuario s3t4 sobre el modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit` (derivado de `google/gemma-4-E4B-it`). Su proposito es la traduccion automatica bidireccional entre banjarés (`bjn`) e indonesio (`id`), la consulta lexica en diccionario en ambas direcciones y la explicacion de refranes banjareses. El adaptador se distribuye como un repositorio PEFT de aproximadamente 0,2 GB, lo que refleja que unicamente contiene los pesos del adaptador, no el modelo completo.

La relevancia del proyecto radica en que el banjarés es una lengua regional de Indonesia con recursos digitales limitados, y este trabajo aporta tanto un adaptador afinado como un subconjunto de datos abierto (13.545 registros de entrenamiento, 513 de validacion y 1.350 de test) publicado bajo licencia Creative Commons. El entrenamiento se realizo sobre 20.634 registros de instrucciones con QLoRA de rango 16, empleando `train_on_responses_only` para calcular la perdida solo sobre las respuestas.

El modelo esta pensado para despliegues de traduccion y consulta linguistica en entornos con recursos moderados, ya que el adaptador se aplica sobre una base cuantizada a 4 bits. La licencia CC BY-SA 4.0 impone condiciones de atribucion y comparticion bajo la misma licencia que afectan a cualquier uso derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre transformer Gemma 4 E4B (modelo base multimodal de Google) |
| Parametros totales | No disponible (el adaptador LoRA usa r=16, lora_alpha=16; el recuento del modelo base no se especifica) |
| Parametros activos | No disponible (el modelo base no se documenta como MoE en la informacion proporcionada) |
| Longitud de contexto | No disponible (el ejemplo de quickstart usa `max_seq_length=1024`, pero no se declara como contexto maximo oficial) |
| Tipos de cuantizacion | Base cuantizada a 4 bits (bnb-4bit); adaptador QLoRA de 4 bits |
| Idiomas soportados | Banjarés (`bjn`) e indonesio (`id`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (`lora_alpha=16`, `lora_dropout=0`) entrenado con QLoRA de 4 bits sobre la variante cuantizada de Gemma 4 E4B publicada por Unsloth. El entrenamiento se realizo con la libreria TRL y Unsloth, aplicando `train_on_responses_only`, una tecnica que enmascara los tokens del prompt y calcula la perdida unicamente sobre la respuesta del asistente, lo que concentra el aprendizaje en la tarea de traduccion y consulta. El adaptador se aplica sobre el chat template `gemma-4` con `enable_thinking=False`.

El conjunto de datos de entrenamiento consta de 20.634 registros de instrucciones (`sft_train`) y 877 de validacion (`sft_valid`). El subconjunto abierto publicado incluye 13.545 registros de entrenamiento, 513 de validacion y 1.350 de test, procedentes de Mendeley Banjarese Hulu, NusaX-MT, Banjarese Wikiquote y Tatoeba. Los textos lexicos y literarios de terceros empleados durante el entrenamiento se excluyeron de la redistribucion publica por motivos de derechos de autor. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Traduccion automatica bidireccional banjarés ↔ indonesio con plantillas de instruccion especificas (`Terjemahkan ke bahasa Banjar: ...` y `Terjemahkan ke bahasa Indonesia: ...`).
- Consulta de diccionario lexico en ambas direcciones: significado de palabras banjaresas en indonesio y traduccion de palabras indonesias al banjarés.
- Explicacion del significado de refranes banjareses (`Apa arti pepatah Banjar "..."?`).
- Generacion de texto conversacional en formato chat mediante el template `gemma-4`.
- Capacidad multilingue limitada a los dos idiomas declarados (`bjn` e `id`); no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni modo thinking en la informacion proporcionada (el template se usa con `enable_thinking=False`).

## Casos de uso

- Traduccion de documentacion administrativa local: el adaptador puede convertir comunicados y formularios del indonesio al banjarés para servicios publicos en Kalimantan del Sur, aprovechando su BLEU de 42,88 en la direccion `id → bjn` sobre NusaX.
- Localizacion de interfaces y contenidos digitales: integracion en pipelines de traduccion para aplicaciones moviles y webs dirigidas a hablantes de banjarés, con la plantilla de instruccion fija que el modelo espera.
- Preservacion linguistica y edicion de textos: traduccion de articulos de Wikiquote y corpus literarios banjareses al indonesio (BLEU 56,79 en `bjn → id` sobre NusaX) para su catalogacion y estudio.
- Herramienta de consulta lexica para estudiantes y traductores: busqueda del significado de palabras banjaresas o de su equivalente indonesio mediante las plantillas de diccionario, con la precision documentada (Token-F1 de 0,219 en `bjn → id` y 0,164 en `id → bjn`).
- Explicacion de patrimonio cultural: interpretacion de refranes banjareses (chrF++ de 39,79 sobre 50 entradas) para materiales educativos o divulgativos.
- Generacion de datos sinteticos de entrenamiento: uso del adaptador para producir pares de traduccion adicionales que amplien corpus paralelos de banjarés, dado el bajo coste de ejecucion de una base de 4 bits.
- Asistencia a traductores humanos en revision: pre-traduccion automatica de segmentos con contexto corto (el ejemplo oficial usa 1.024 tokens) que el traductor revisa y corrige.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy determinista (`do_sample=False`) sobre conjuntos de test estrictamente separados del entrenamiento.

| Tarea | Direccion | Baseline copia-fuente (BLEU / chrF++) | BLEU del modelo | chrF++ del modelo |
|---|---|---|---|---|
| Mendeley Banjarese Hulu (250 pares) | bjn → id | 2,26 / 23,74 | 28,91 | 52,26 |
| Mendeley Banjarese Hulu (250 pares) | id → bjn | 2,10 / 25,65 | 24,28 | 53,64 |
| NusaX test oficial (400 pares) | id → bjn | 12,33 / 44,50 | 42,88 | 68,43 |
| NusaX test oficial (400 pares) | bjn → id | 12,33 / 44,17 | 56,79 | 75,30 |

| Tarea | Tamano de test | Metricas | Resultado |
|---|---|---|---|
| Diccionario banjarés → indonesio | 267 entradas | Substring / Exact / Token-F1 | 18,7 % / 17,6 % / 0,219 |
| Diccionario indonesio → banjarés | 267 entradas | Substring / Exact / Token-F1 | 17,6 % / 16,1 % / 0,164 |
| Refranes banjareses | 50 entradas | chrF++ | 39,79 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el quickstart oficial carga el modelo con `load_in_4bit=True` y `max_seq_length=1024`, lo que sugiere un consumo moderado compatible con GPUs de consumo, aunque no se aportan cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; el ejemplo de codigo mueve las entradas a `cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable segun el uso de cuantizacion 4 bits y contexto de 1.024 tokens, pero sin datos confirmados.
- Opciones de despliegue: Unsloth (`FastModel.from_pretrained`) y PEFT/Transformers segun el ejemplo oficial; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores o modelos de traduccion banjarés ↔ indonesio en la informacion proporcionada para establecer una comparativa con cifras verificables.

| Modelo | Parametros | Contexto | BLEU bjn → id (NusaX) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Banjar-LLM Gemma 4 E4B | No disponible (adaptador LoRA r=16) | No disponible | 56,79 | CC BY-SA 4.0 | Hugging Face (adaptador PEFT) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador requiere el modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`; no es un modelo autonomo y su licencia efectiva queda condicionada tambien por la del modelo base de Google.
- La licencia CC BY-SA 4.0 obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos comerciales cerrados.
- El alcance linguistico se limita a banjarés e indonesio; no se garantiza un comportamiento correcto en otros idiomas.
- La precision lexica es baja en terminos absolutos (Exact Match del 17,6 % y 16,1 % en las tareas de diccionario), por lo que no es fiable como diccionario autonomo sin verificacion humana.
- El BLEU en la direccion `id → bjn` sobre Mendeley (24,28) es notablemente inferior al de `bjn → id` (28,91), lo que indica asimetria de calidad entre direcciones.
- Riesgo de alucinacion en traducciones de terminos poco frecuentes, en la explicacion de refranes y en palabras fuera del vocabulario del corpus de entrenamiento.
- El contexto de trabajo del ejemplo oficial es de 1.024 tokens; no se documenta el contexto maximo real, por lo que textos largos pueden degradar la calidad o truncarse.
- Los datos de entrenamiento excluyen textos de terceros por derechos de autor, lo que puede limitar la cobertura lexica frente a fuentes no redistribuidas.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; el uso en produccion deberia acompanarse de pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s3t4/banjar-gemma4-e4b-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Dataset: https://huggingface.co/datasets/s3t4/banjar-llm-dataset-v3.2
- Modelo original de Google (referenciado en la model card): `google/gemma-4-E4B-it` (sin URL directa en la informacion proporcionada)
- Repositorios de librerias empleadas: Unsloth, TRL, PEFT y Transformers (sin URLs especificas en la informacion proporcionada)
