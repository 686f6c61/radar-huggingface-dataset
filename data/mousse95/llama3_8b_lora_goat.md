# mousse95/llama3_8B_Lora_GOAT

## Resumen

`mousse95/llama3_8B_Lora_GOAT` es un adaptador LoRA para `meta-llama/Llama-3.1-8B` (modelo base, no instruct) especializado en aritmetica de numeros enteros grandes: sumas, restas, multiplicaciones y divisiones. Lo publica el usuario mousse95 en HuggingFace y su unico objetivo es inyectar en el modelo base la capacidad de resolver operaciones aritmeticas paso a paso siguiendo el formato del dataset GOAT. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (~109 MB), por lo que es imprescindible descargar el modelo base, que esta sujeto a acceso restringido (gated).

El adaptador se entrena sobre el conjunto `tiedong/goat`, derivado de la metodologia del articulo *Goat: Fine-tuned LLaMA Outperforms GPT-4 on Arithmetic Tasks* (arXiv:2305.14201), que demostro que un ajuste supervisado cuidadosamente disenado sobre un modelo abierto podia superar a GPT-4 en tareas aritmeticas cuando estas se descomponen en pasos. Este repositorio replica ese enfoque sobre Llama 3.1 8B, con 1.741.300 ejemplos de entrenamiento y una sola epoca.

Es relevante como pieza de investigacion reproducible: incluye el dataset en formato JSONL, los scripts de preparacion y entrenamiento, y los hiperparametros exactos extraidos de `training_args.bin`, lo que permite replicar el ajuste. No incluye benchmarks propios ni resultados publicados, y no se ha adaptado alineamiento conversacional (RLHF/DPO) ni seguridad adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Llama 3.1 8B: GQA, RMSNorm, SwiGLU, RoPE) |
| Parametros totales | ~8,03 mil millones en el modelo base; el adaptador LoRA ocupa ~109 MB en disco |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base; el entrenamiento se hizo con max_length de 256 tokens |
| Tipos de cuantizacion | Entrenamiento del base en 8 bits (bitsandbytes) y optimizador `adamw_8bit`; el adaptador se distribuye en safetensors sin cuantizar. No se publican pesos cuantizados (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Ingles (en), segun la model card y los tags |
| Licencia | Llama 3.1 Community License (uso sujeto a la Acceptable Use Policy de Llama 3.1) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + JSONL de datos + scripts de entrenamiento en Python |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT sobre Llama 3.1 8B, un transformer decoder-only denso con Grouped Query Attention, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Se utiliza LoRA con rango r = 64, alpha = 64, dropout = 0,05 y bias = none, aplicado exclusivamente a las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. El modelo base se carga en 8 bits con bitsandbytes y se activa gradient checkpointing durante el ajuste.

El entrenamiento se realiza con `SFTTrainer` de TRL sobre el campo `text` de `data/train.jsonl`, que contiene 1.741.300 ejemplos (la particion completa de `tiedong/goat` menos 5.000 ejemplos reservados para validacion). Hiperparametros: 1 epoca, batch efectivo de 128 (16 x 8 de acumulacion de gradientes), learning rate 3e-4 con scheduler lineal y 100 pasos de warmup, optimizador `adamw_8bit`, precision bf16 y longitud maxima de 256 tokens sin packing, semilla 42. La perdida se calcula sobre la secuencia completa, incluido el prompt, sin enmascaramiento de la parte de completacion. Versiones de framework: PEFT 0.18.1, TRL 1.1.0, Transformers 5.5.4, PyTorch 2.11.0 y Datasets 4.8.4.

El formato de prompt es una pregunta en lenguaje natural seguida de un salto de linea, la etiqueta `Answer: ` y la solucion. Para multiplicaciones y divisiones, la solucion incluye los pasos intermedios (por ejemplo, descomposicion por sumandos), mientras que sumas y restas devuelven el resultado de forma mas directa.

## Capacidades

- Aritmetica de enteros grandes: suma, resta, multiplicacion y division de numeros de varios digitos.
- Resolucion paso a paso: las multiplicaciones y divisiones se generan con pasos intermedios explicitos, lo que facilita la verificacion del razonamiento.
- Generacion de texto autoregresiva estandar heredada del modelo base.
- Formato de prompt fijo basado en `\nAnswer: `, disenado para ser consumido de forma programatica.
- No se ha documentado soporte de tool calling, function calling ni uso como agente.
- No se ha documentado modo de razonamiento extendido (thinking), vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada en la practica: el entrenamiento y la etiqueta de idioma se restringen al ingles.

## Casos de uso

- Verificacion aritmetica en pipelines de datos: usar el modelo para recalcular sumas y productos sobre registros financieros o cientificos y contrastar el resultado con el valor almacenado, aprovechando que las multiplicaciones y divisiones se emiten con pasos intermedios auditables.
- Generacion de trazas de razonamiento para entrenar otros modelos: producir soluciones paso a paso de operaciones grandes que sirvan como datos de destilacion o como ejemplos supervisados en un SFT posterior.
- Banco de pruebas de evaluacion aritmetica: emplear el adaptador como linea base en experimentos que midan la degradacion de la aritmetica en modelos de lenguaje segun el numero de digitos.
- Preprocesado de documentos financieros: extraer expresiones aritmeticas de facturas o informes y resolverlas con el modelo antes de validarlas contra el total declarado.
- Educacion y generacion de ejercicios: crear problemas de aritmetica resueltos con desarrollo, utiles para material didactico o para plataformas de practica.
- Investigacion reproducible en ajuste eficiente: servir como punto de partida para estudiar el efecto del rango LoRA, los modulos objetivo o la mascara de completacion en una tarea acotada y medible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval ni metricas de exactitud aritmetica propias de este adaptador, y el repositorio no adjunta scripts de evaluacion con resultados.

## Requisitos de hardware

- El adaptador pesa ~109 MB, pero requiere cargar el modelo base Llama 3.1 8B completo para funcionar.
- Inferencia del base en bf16/fp16: aproximadamente 16 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 18-20 GB.
- Inferencia en 8 bits: alrededor de 9-10 GB de VRAM.
- Inferencia en 4 bits (bitsandbytes NF4): alrededor de 5-6 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- GPUs recomendadas para servicio en produccion: A100 40/80 GB, H100 80 GB o L40S para despliegues con contexto largo; en una sola GPU de consumo, RTX 4090 24 GB permite bf16 con contexto moderado.
- Opciones de despliegue: `transformers` + `peft` (fusionando el adaptador con `merge_and_unload()`), vLLM, TGI o llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponible. El unico dato relevante es que el prompt de ejemplo usa `max_new_tokens=64` y decodificacion greedy (`do_sample=False`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mousse95/llama3_8B_Lora_GOAT` | 8,03 B (base) + LoRA r=64 | 128.000 tokens | Adaptador LoRA sobre Llama 3.1 8B base | Llama 3.1 Community License | Publico, requiere base gated |
| Goat (Liu et al., 2023) | LLaMA 7B | 2.048 tokens (LLaMA original) | Ajuste supervisado sobre LLaMA | Licencia de LLaMA original | Pesos y metodologia descritos en el paper |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Modelo completo alineado | Llama 3.1 Community License | Publico, gated |
| `meta-llama/Llama-3.1-8B` (base) | 8,03 B | 128.000 tokens | Modelo completo sin ajuste | Llama 3.1 Community License | Publico, gated |

Los datos de rendimiento comparado no estan disponibles para este adaptador, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Llama 3.1, hereda los sesgos del modelo base y del dataset GOAT, que es puramente aritmetico.
- Riesgo de alucinacion: alto fuera del dominio aritmetico. El ajuste se hizo solo con operaciones, sobre el modelo base sin alineamiento conversacional; cualquier consulta general puede producir texto incoherente o incorrecto.
- Ausencia de mascara de completacion: la perdida se calculo sobre toda la secuencia, incluido el prompt, lo que puede reducir la calidad del ajuste frente a un entrenamiento con enmascaramiento.
- Longitud de entrenamiento limitada a 256 tokens: aunque el modelo base soporta 128.000 tokens, el adaptador solo ha visto ejemplos cortos, y su comportamiento en secuencias largas no esta validado.
- Formato de prompt estricto: funciona con el patron `pregunta\nAnswer: `. El script alternativo `prepare_data.py` usa una plantilla `### Instruction:` que no coincide con los datos de entrenamiento y no debe usarse para inferencia sin reajustar.
- Idioma: solo ingles; no hay evidencia de generalizacion a otras lenguas.
- Licencia: al ser derivado de Llama 3.1, el uso comercial esta sujeto a la Llama 3.1 Community License y a la Acceptable Use Policy, incluida la obligacion de atribucion "Built with Llama".
- El modelo base esta sujeto a acceso restringido en HuggingFace, por lo que es necesario solicitar permiso a Meta antes de poder utilizarlo.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- No hay informacion sobre evaluacion de seguridad, red teaming ni filtros de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mousse95/llama3_8B_Lora_GOAT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/tiedong/goat
- Paper de GOAT: https://arxiv.org/abs/2305.14201
- Licencia de Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE
- Politica de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy
