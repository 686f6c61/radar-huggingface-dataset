# panitagorontalo/gemma3-27b-gotoai-gorontalo-lora

## Resumen

`panitagorontalo/gemma3-27b-gotoai-gorontalo-lora` es un adaptador LoRA desarrollado por Panita Research Gorontalo sobre el modelo base `GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct`, un Gemma 3 de 27B sometido a preentrenamiento continuado en indonesio y lenguas regionales del archipiélago. El adaptador especializa el modelo en traducción bidireccional indonesio-gorontalo, razonamiento morfológico y mantenimiento de contexto entre frases, tareas para las que los LLM generalistas rinden de forma deficiente en una lengua de bajos recursos como el gorontalo (`gor`).

El modelo se entrenó sobre 130.499 muestras de instrucción multi-tarea del denominado Korpus Terpadu v6, construido a partir de dos diccionarios del profesor Mansoer Pateda (1987 y 2001). La particularidad técnica es que el LoRA (r=16, alpha=32, bfloat16) se aplica únicamente sobre las capas de texto del modelo, congelando los 439 tensores del `vision_tower` y del proyector multimodal. El repositorio ocupa 0,5 GB, correspondiente solo a los pesos del adaptador en safetensors.

Su relevancia actual reside en que demuestra que un ajuste fino ligero sobre un modelo de 27B puede superar a alternativas más pequeñas (Qwen2.5-7B LoRA) en una lengua de bajos recursos, y en que publica métricas SacreBLEU y chrF++ verificables por dirección de traducción, algo poco habitual en adaptadores para lenguas regionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Gemma 3 27B, multimodal con vision tower congelado) |
| Parametros totales | 27B en el modelo base; el adaptador LoRA ocupa 0,5 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3) |
| Tipos de cuantizacion | bfloat16 nativo; 4-bit NF4 mediante `bitsandbytes` (QLoRA) segun la model card |
| Idiomas soportados | indonesio (`id`), gorontalo (`gor`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un Gemma 3 27B modificado por GoToCompany mediante preentrenamiento continuado en indonesio y lenguas regionales. El LoRA se configura con r=16 y lora_alpha=32 en bfloat16, y se restringe a las capas de texto (`model.language_model.layers.*`). Los 439 tensores del `vision_tower` y del proyector multimodal quedan congelados, de modo que el adaptador no altera las capacidades visuales del modelo base y se concentra exclusivamente en la generacion y traduccion de texto.

El entrenamiento utiliza 130.499 muestras de instruccion multi-tarea del Korpus Terpadu v6, derivado de los diccionarios de Mansoer Pateda de 1987 y 2001. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La innovacion destacable es el diseno de tareas especificas de morfologia y fonotactica (denominadas "Siasat A" y "Siasat B" en la documentacion), que ensenan al modelo a derivar verbos con mutacion consonante (`tuladu` -> `moluladu`) y a adaptar prestamos con vocal final (`adil` -> `a:dili`).

## Capacidades

- Traduccion bidireccional indonesio-gorontalo, con soporte para variantes lexicas de 1987 y 2001.
- Razonamiento morfologico explicito: derivacion de verbos con peluluhan consonante (`/t/` -> `/l/`) y adaptacion de prestamos con consonante final.
- Mantenimiento de contexto entre frases en parrafos cortos (hasta 4 frases segun las pruebas cualitativas del autor).
- Generacion de texto conversacional en indonesio y gorontalo.
- Capacidades visuales heredadas del modelo base, aunque el adaptador no las modifica ni las evalua.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.

## Casos de uso

- Traduccion de documentacion administrativa indonesio-gorontalo: el adaptador puede procesar parrafos de varias frases manteniendo coherencia terminologica, util para organismos publicos de la provincia de Gorontalo que necesitan material bilinguee.
- Digitalizacion y traduccion de corpus lexicograficos: el modelo entiende las convenciones de los diccionarios de Pateda (1987 y 2001), por lo que puede usarse para convertir entradas lexicas en pares de traduccion estructurados.
- Asistencia a la ensenanza de lengua gorontalo: la capacidad de explicar reglas morfologicas (mutacion consonante, vocalizacion de prestamos) permite generar ejercicios y explicaciones gramaticales para estudiantes.
- Traduccion de subtitulos y contenido audiovisual de baja latencia: con cuantizacion 4-bit NF4 cabe en una GPU de 24 GB (L4, RTX 3090/4090, A10G), lo que permite desplegarlo en infraestructura de coste moderado para lotes de subtitulos.
- Preservacion linguistica y archivo cultural: el adaptador puede generar versiones en gorontalo de textos historicos o etnograficos, contribuyendo a la documentacion de una lengua con recursos digitales escasos.
- Chat de atencion ciudadana bilinguee: al conservar el registro conversacional del modelo base, puede gestionar dialogos multi-turno en indonesio y gorontalo para servicios de informacion local.
- Investigacion en traduccion automatica de bajos recursos: sirve como linea base reproducible (con metricas SacreBLEU y chrF++ publicadas) para comparar futuros adaptadores sobre el mismo corpus v6.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`) sobre el conjunto de test v6 del corpus `panitagorontalo/gorontalo-indonesia-parallel`:

| Tarea | Modelo | SacreBLEU | chrF++ | n |
|---|---|---|---|---|
| Indonesia -> Gorontalo | **Gemma 3 27B LoRA Clean** | **34,45** | **53,98** | 1.083 |
| Indonesia -> Gorontalo | Gemma 3 27B LoRA All | 33,75 | 53,27 | 1.136 |
| Indonesia -> Gorontalo | Qwen2.5-7B LoRA Clean | 32,86 | 51,60 | no disponible |
| Indonesia -> Gorontalo | NLLB-200-600M v6 (All) | 40,59 | 57,98 | no disponible |
| Gorontalo (2001) -> Indonesia | **Gemma 3 27B LoRA Clean** | **29,20** | **53,19** | 1.083 |
| Gorontalo (2001) -> Indonesia | Gemma 3 27B LoRA All | 28,15 | 51,82 | 1.136 |
| Gorontalo (2001) -> Indonesia | Qwen2.5-7B LoRA Clean | 25,27 | 50,50 | no disponible |
| Gorontalo (2001) -> Indonesia | NLLB-200-600M v6 (All) | 32,57 | 56,80 | no disponible |
| Gorontalo (1987) -> Indonesia | **Gemma 3 27B LoRA Clean** | **32,06** | **56,42** | 600 |
| Gorontalo (1987) -> Indonesia | Gemma 3 27B LoRA All | 31,37 | 55,72 | 618 |
| Gorontalo (1987) -> Indonesia | Qwen2.5-7B LoRA Clean | 27,68 | 52,77 | no disponible |
| Gorontalo (1987) -> Indonesia | NLLB-200-600M v6 (All) | 35,60 | 59,29 | no disponible |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 51,10 GiB solo para los pesos del modelo base, mas overhead de activaciones y cache KV; requiere A100-80GB o H100.
- VRAM para inferencia en 4-bit NF4 (QLoRA): apto para GPU de 24 GB o superior, como NVIDIA L4, RTX 3090, RTX 4090 o A10G.
- No ejecutable en GPU T4 de 15 GB ni en Hugging Face Spaces con CPU Basic, segun advierte la model card.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` para carga cuantizada; vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible (el adaptador es PEFT, no GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SacreBLEU ID->GOR (v6) | Licencia | Formato |
|---|---|---|---|---|---|
| **Gemma 3 27B LoRA (este)** | 27B + LoRA | no disponible | 34,45 | Apache 2.0 | safetensors PEFT |
| Qwen2.5-7B LoRA v6 | 7B + LoRA | no disponible | 32,86 | no disponible | no disponible |
| NLLB-200-600M v6 | 600M | no disponible | 40,59 | no disponible | no disponible |

El adaptador supera a Qwen2.5-7B LoRA en todas las direcciones y metricas del test v6, pero NLLB-200-600M obtiene mejores cifras SacreBLEU y chrF++ en las tres direcciones pese a ser un modelo especializado en traduccion de 600M parametros. La ventaja del modelo Gemma radica en sus capacidades generativas y de razonamiento morfologico, no en la metrica pura de traduccion.

## Limitaciones y advertencias

- Las metricas publicadas estan marcadas como `verified: false`; no han sido replicadas de forma independiente.
- El adaptador solo modifica las capas de texto: las capacidades visuales del modelo base no estan ajustadas ni evaluadas para gorontalo.
- El corpus de entrenamiento proviene de dos diccionarios academicos (1987 y 2001), lo que puede introducir sesgo hacia registros formales y lexico anticuado, con cobertura limitada de neologismos y habla coloquial.
- Riesgo de alucinacion en terminologia especializada o en palabras fuera del vocabulario de los diccionarios fuente.
- El contexto maximo efectivo no esta documentado para este adaptador; las pruebas cualitativas se limitan a parrafos de 4 frases.
- Ambito linguistico restringido a indonesio y gorontalo; no se garantiza un rendimiento correcto en otras lenguas regionales de Indonesia.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct` antes de desplegar en produccion.
- El adaptador no puede ejecutarse de forma autonoma: requiere descargar el modelo base de 27B, lo que implica infraestructura de GPU considerable.

## Enlaces

- Hugging Face: https://huggingface.co/panitagorontalo/gemma3-27b-gotoai-gorontalo-lora
- Modelo base: https://huggingface.co/GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct
- Dataset: https://huggingface.co/datasets/panitagorontalo/gorontalo-indonesia-parallel
- Demo (Space): https://huggingface.co/spaces/panitagorontalo/penerjemah-bahasa-gorontalo
- Notebook tutorial (Colab): https://huggingface.co/panitagorontalo/gemma3-27b-gotoai-gorontalo-lora/blob/main/Tutorial_Penerjemah_AI_Bahasa_Gorontalo_Panita_Research.ipynb
