# K-Ai-Official/Aether-15B

## Resumen

Aether-15B es un modelo de lenguaje de tipo decoder-only, desarrollado por K-Ai (Kortex Ai), que consiste en un ajuste fino supervisado del modelo base Qwen/Qwen3-14B-Base de Alibaba. El modelo conserva la arquitectura `qwen3` (Qwen3ForCausalLM) y cuenta con 14.768.307.200 parametros verificados a partir de los safetensors exportados, pese a que la denominacion comercial lo presente como "15B". Su entrenamiento se ha centrado explicitamente en matematicas, generacion de codigo y cobertura de los idiomas indonesio y japones, ademas del ingles.

El modelo se distribuye con licencia Apache 2.0 y pesos en formato BF16 safetensors, lo que facilita su integracion en el ecosistema Transformers y su despliegue mediante text-generation-inference. Es relevante ahora porque cubre un nicho poco atendido: modelos abiertos con rendimiento declarado en indonesio y japones, dos idiomas con escasa representacion en la mayoria de ajustes finos publicos, manteniendo una base solida como Qwen3-14B.

No obstante, conviene interpretar sus resultados con cautela: el ajuste se realizo con LoRA sobre una base cuantizada a 4 bits (QLoRA) en una unica GPU de 16 GB, con solo 822 muestras de entrenamiento y una longitud maxima de secuencia de 512 tokens. Estas condiciones limitan el alcance real del ajuste y explican que el modelo deba considerarse una variante especializada y ligera del base, no una reimplementacion profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3ForCausalLM, familia `qwen3`) |
| Parametros totales | 14.768.307.200 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de 512 tokens; el contexto nativo del base Qwen3-14B no se detalla) |
| Tipos de cuantizacion | Pesos publicados en BF16 safetensors; no se documentan otros formatos (GGUF, AWQ, GPTQ) en la informacion disponible |
| Idiomas soportados | Indonesio (id), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es la heredada del base Qwen3-14B-Base: un transformer decoder-only denso con atencion por cabezas y las optimizaciones propias de la familia Qwen3. El ajuste se realizo mediante LoRA con rango 32, alpha 32 y dropout 0.0, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, y posteriormente fusionado en los pesos base mediante el metodo `unsloth_merged_16bit`. La perdida se calculo unicamente sobre los tokens del asistente (response-only masking), con learning rate 0.0001, una epoca, batch efectivo de 16, longitud maxima de 512 tokens y semilla 3407.

Un detalle tecnico relevante es que el adaptador se entreno con cuantizacion de 4 bits del modelo base (QLoRA) porque el entrenamiento se ejecuto en una GPU de 16 GB, lo que puede implicar cierta perdida de calidad frente a un LoRA en BF16. El conjunto de datos fue K-Ai-Official/Kai_v3 (licencia Apache 2.0), con 822 muestras limpias y reparto por areas: 735 filas de matematicas, 78 de codigo, 274 de japones y 274 de indonesio (las cifras se solapan porque una misma fila puede contar en varias categorias). No se documenta uso de RLHF ni DPO; el proceso es exclusivamente SFT supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno en indonesio, ingles y japones.
- Razonamiento matematico: el autor declara cobertura de algebra, aritmetica, fracciones, teoria de numeros, porcentajes, secuencias y problemas verbales.
- Generacion de codigo, con evaluacion especifica en Python (`code_python`).
- Soporte de plantilla de chat de Qwen3, incluyendo el parametro `enable_thinking` para alternar entre modo de razonamiento y respuesta directa.
- Capacidad de ajuste fino sobre una base con tool calling y function calling heredados de Qwen3 (no se documenta explicitamente en la model card, pero es una capacidad del base).
- Multilingue limitado a los tres idiomas declarados; no se documenta cobertura de castellano ni de otras lenguas.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Atencion al cliente en indonesio y japones: el modelo puede gestionar conversaciones multi-turno en estos idiomas con una calidad medida en el benchmark propio del autor (97,56 % en indonesio y 100 % en japones sobre 41 items cada uno), lo que lo hace util para asistentes regionales donde otros modelos abiertos tienen poca cobertura.
- Tutoria matematica automatizada: con resultados declarados de 99,05 % en el area de matematicas sobre 105 items, puede emplearse para resolver y explicar problemas de algebra, aritmetica, fracciones y problemas verbales en entornos educativos.
- Generacion y revision de codigo Python: el autor reporta 100 % en 18 items de `code_python`; es adecuado para asistentes de programacion en pipelines de CI/CD o entornos de desarrollo integrados, siempre con supervision humana.
- Prototipado rapido de asistentes multilingues en el sudeste asiatico: combinacion de indonesio, japones e ingles en un unico modelo de 14,77 B con licencia Apache 2.0, lo que simplifica el despliegue frente a mantener varios modelos especializados.
- Fine-tuning posterior sobre dominios verticales: al ser un ajuste LoRA fusionado sobre Qwen3-14B-Base, sirve como punto de partida para especializaciones adicionales en sectores como finanzas, legal o soporte tecnico en los tres idiomas soportados.
- Evaluacion comparativa de tecnicas QLoRA: su model card documenta con detalle hiperparametros y limitaciones del entrenamiento en 4 bits, lo que lo convierte en un caso de referencia para investigadores que estudian el impacto de QLoRA en la calidad final.
- Generacion de contenido y resumenes en japones e indonesio: util para medios, documentacion tecnica o localizacion, con la advertencia de que la calidad fuera de las areas evaluadas no esta medida.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del split `benchmark` de K-Ai-Official/Kai_v3, con 123 items evaluados mediante decodificacion greedy, maximo 256 tokens nuevos y comprobaciones de rechazo por heuristicas de palabras clave. No se aportan comparaciones con otros modelos.

| Area | n | Aciertos | Fallos | Precision automatica |
|---|---|---|---|---|
| math | 105 | 104 | 1 | 0,9905 |
| code | 18 | 18 | 0 | 1,0 |
| ja | 41 | 41 | 0 | 1,0 |
| id | 41 | 40 | 1 | 0,9756 |

| Idioma | n | Aciertos | Fallos | Precision automatica |
|---|---|---|---|---|
| en | 41 | 41 | 0 | 1,0 |
| id | 41 | 40 | 1 | 0,9756 |
| ja | 41 | 41 | 0 | 1,0 |

| Categoria | n | Aciertos | Fallos | Precision automatica |
|---|---|---|---|---|
| code_python | 18 | 18 | 0 | 1,0 |
| math_algebra | 15 | 15 | 0 | 1,0 |
| math_arithmetic | 15 | 15 | 0 | 1,0 |
| math_fraction | 15 | 14 | 1 | 0,9333 |
| math_number_theory | 15 | 15 | 0 | 1,0 |
| math_percent | 15 | 15 | 0 | 1,0 |
| math_sequence | 15 | 15 | 0 | 1,0 |
| math_word_problem | 15 | 15 | 0 | 1,0 |

Perdida de validacion: 0,4223 sobre 87 muestras reservadas. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 32 GB de VRAM para contexto corto y 40-48 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB, viable en GPUs consumer de gama alta.
- VRAM estimada en cuantizacion de 4 bits: en torno a 8-9 GB, aunque el autor no publica pesos GGUF ni cuantizados; seria necesario generarlos.
- GPUs recomendadas: A100 40 GB o 80 GB, H100, L40S o RTX 6000 Ada para BF16; RTX 4090 (24 GB) para 8 bits; RTX 3090/4080 para 4 bits.
- Despliegue: compatible con Transformers, text-generation-inference (TGI) y endpoints compatibles segun los tags del repositorio. La compatibilidad con vLLM, llama.cpp u Ollama no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Aether-15B | 14,77 B | No disponible | id, en, ja | Apache 2.0 | Ajuste LoRA QLoRA sobre Qwen3-14B-Base, 822 muestras |
| Qwen3-14B-Base | 14,77 B | No disponible en esta ficha | Multilingue amplio (no detallado) | Apache 2.0 | Modelo base sin ajuste; referencia directa |
| Qwen3-14B (instruct) | 14,77 B | No disponible en esta ficha | Multilingue amplio | Apache 2.0 | Variante instruct oficial de Qwen; no se dispone de comparacion de rendimiento con Aether-15B |

No se dispone de datos de benchmarks comparativos entre Aether-15B y estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia e idiomas declarados.

## Limitaciones y advertencias

- El ajuste se realizo con solo 822 muestras y una longitud maxima de 512 tokens, lo que limita la profundidad del entrenamiento y la generalizacion fuera de las areas evaluadas.
- El entrenamiento uso QLoRA (base cuantizada a 4 bits) en una GPU de 16 GB; el propio autor advierte de posible perdida de calidad frente a un LoRA en BF16.
- Los benchmarks son internos, con 123 items y comprobaciones de rechazo por heuristicas de palabras clave, no una evaluacion de seguridad completa; no hay comparacion con modelos de referencia.
- Riesgo de alucinacion y de producir contenido incorrecto, desactualizado o sesgado; el autor recomienda verificar informacion importante.
- Cobertura limitada a indonesio, ingles y japones; no se documenta soporte de castellano ni de otros idiomas.
- No se documentan pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos para despliegues en hardware limitado.
- La licencia Apache 2.0 se hereda del base, pero el dataset de entrenamiento tiene su propia licencia (tambien Apache 2.0) que conviene revisar para uso comercial.
- La model card no especifica el contexto nativo del modelo ni su comportamiento en tool calling o agentes, por lo que estas capacidades deben validarse empiricamente antes de usarlas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-Ai-Official/Aether-15B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/K-Ai-Official/Kai_v3
- Unsloth: https://github.com/unslothai/unsloth
- Hugging Face Transformers: https://github.com/huggingface/transformers
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
