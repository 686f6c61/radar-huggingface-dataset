# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-ctxdistill-lora

## Resumen

El modelo `theo_qwen2.5-7b-it_impulsive-ctxdistill-lora` es un adaptador LoRA publicado por el usuario Misalignment-Empirics sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de un modelo completo, sino de un adaptador PEFT (5,8 GB de repositorio, de los cuales la mayor parte corresponde a los checkpoints intermedios) que se carga sobre los pesos originales en bfloat16. Su propósito declarado es la destilación de contexto (*context distillation*) de un comportamiento etiquetado como "impulsive", generado a partir de una especificación de comportamiento identificada mediante un hash SHA-256 (`894618c461dfc8585241fb85a1f91593bc9fa1ede2c36e7d3eb27b90fa92c53f`, esquema `file-v1`).

La relevancia del artefacto es más metodológica que de rendimiento. La model card funciona como registro de procedencia reproducible: documenta de forma exhaustiva hiperparámetros, versiones de librerías, semillas, formato de datos y hashes de ficheros, lo que permite auditar exactamente qué datos y qué configuración produjeron el adaptador. Está pensado para investigación sobre alineación, interpretabilidad y elicitación de comportamientos, no para uso en producción como asistente general.

El entrenamiento se realizó con TRL 1.0.0 y Transformers 5.15.0 sobre 8.734 filas de un fichero JSONL conversacional, 3 épocas, rango LoRA 64, alpha 128 y 161.480.704 parámetros entrenables, con una pérdida final de entrenamiento de 0,4322. No se han publicado resultados de benchmarks, licencia explícita ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen2) del modelo base Qwen2.5-7B-Instruct; 28 capas, LoRA aplicado en las 28 capas sobre proyecciones de atención y MLP |
| Parametros totales | Aproximadamente 7,77 mil millones (7,61B del modelo base + 161.480.704 parametros entrenables del adaptador) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1024 tokens durante el entrenamiento (`max_len` 1024, `truncation_mode` keep_start); la ventana de inferencia la determina el modelo base Qwen2.5-7B-Instruct (32.768 tokens nativos, ampliable a 131.072 con RoPE scaling tipo YaRN) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser un adaptador LoRA, la cuantizacion aplica al modelo base (no se documentan variantes GGUF ni AWQ propias) |
| Idiomas soportados | No disponibles (los del modelo base Qwen2.5-7B-Instruct, que cubre principalmente ingles y chino, no se declaran en este repositorio) |
| Licencia | No disponible (el campo `licence` de la model card contiene el literal generico "license", sin identificador de licencia) |
| Formato de pesos | safetensors, formato de adaptador PEFT; los parametros LoRA se resuelven en `torch.float32` y los del base en `torch.bfloat16` |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-7B-Instruct, un transformer decoder autorregresivo con 28 capas. La configuración LoRA usa rango 64, alpha 128, dropout 0,0 y cubre las siete proyecciones por capa: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El censo LoRA confirma cobertura en las 28 capas, con 28 módulos de tipo MLP y 28 de self-attention, lo que da un total de 161.480.704 parámetros entrenables. La atención se ejecutó con SDPA, desactivando el kernel SDPA de cuDNN durante el entrenamiento (referencia #388 en la documentación del autor).

La receta, etiquetada como v4, corresponde a los valores por defecto de `SFTTrainer` de TRL 1.0.0: learning rate 2e-5 con scheduler linear, sin warmup, AdamW con betas 0,9/0,999, sin weight decay, `max_grad_norm` 1,0, batch efectivo 8 en una única GPU sin acumulación de gradientes, 3 épocas y `max_length` 1024 con truncado keep_start y packing desactivado. La pérdida se calcula únicamente sobre la completion (formato conversacional prompt-completion, `completion_only_loss` resuelto a `True`), con `DataCollatorForLanguageModeling` y el tokenizador `Qwen2Tokenizer`. Los datos son 8.734 filas (`train_file_sha256` `067951de78a304f7cb4609de7bc0320b415530753f142c79b261ef3783513210`), de las cuales 0 filas superan la longitud máxima. El entrenamiento usó checkpointing de gradientes, bf16 autocast sobre pesos base en bfloat16, semilla 0 y una NVIDIA H100 NVL como único dispositivo, con 3.276 pasos de optimizador. Se conservan tres checkpoints (1092, 2184 y 3276), y el adaptador de la raíz equivale al checkpoint final de la época 3.

Como innovación metodológica destaca el sistema de procedencia: `spec_sha256` identifica la especificación de comportamiento con un esquema de hash encadenado (`chained-v2`) cuando la especificación extiende a otra, de modo que cualquier edición en la jerarquía cambia el identificador. El autor documenta además que la máscara de pérdida de este conjunto es idéntica fila a fila a la del dataset SFT v3 (8.734/8.734 filas con los mismos `input_ids` y máscara), lo que permite comparar ambas recetas sobre exactamente los mismos datos.

## Capacidades

- Generación de texto conversacional multi-turno: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, sobre el que se aplica el adaptador.
- Elicitación de un comportamiento específico ("impulsive") mediante destilación de contexto, con la especificación de comportamiento identificable por hash.
- Reproducibilidad experimental: la model card documenta versiones exactas (TRL 1.0.0, Transformers 5.15.0, PEFT 0.20.0, Torch 2.13.0+cu130), hashes, semilla y configuración resuelta en tiempo de ejecución.
- Comparabilidad controlada: el dataset de entrenamiento es idéntico en máscara e `input_ids` al de la receta SFT v3, lo que permite aislar el efecto de la receta de destilación de contexto.
- Tool calling y function calling: no declarado en la información proporcionada; el modelo base lo soporta, pero el adaptador no documenta si preserva esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El adaptador es exclusivamente de texto.
- Capacidad de ser combinado o apilado con otros adaptadores PEFT del mismo autor (familia theo_*): plausible por formato, pero no documentado explícitamente.

## Casos de uso

- Investigación sobre alineación y elicitación de comportamientos: el adaptador sirve como artefacto controlado para estudiar cómo la destilación de contexto modifica un comportamiento concreto en un modelo de 7B, con trazabilidad completa de la especificación mediante `spec_sha256`.
- Auditoría de reproducibilidad de fine-tuning: dado que la model card incluye hashes de dataset, versiones de librerías y semilla, se puede reproducir el entrenamiento paso a paso y verificar que la pérdida final (0,4322) coincide.
- Comparación de recetas de entrenamiento: al compartir máscara de pérdida con la receta v3, permite medir el impacto aislado de la técnica de destilación de contexto frente al SFT convencional sobre los mismos 8.734 ejemplos.
- Análisis de seguridad y red-teaming: un adaptador que induce un comportamiento "impulsivo" es útil como caso de estudio en evaluaciones de robustez y de desviación de comportamiento respecto al modelo base alineado por instrucciones.
- Estudio de eficiencia de PEFT: con 161,48M parámetros entrenables sobre 7,61B (aproximadamente el 2,1 % del total), sirve para medir el coste-beneficio de LoRA de rango 64 sobre todas las proyecciones frente a configuraciones más ligeras.
- Docencia y formación técnica: ejemplo completo y bien documentado de pipeline SFT con TRL, incluyendo gradient checkpointing, bf16 y pérdida solo en completion, útil como plantilla de referencia.
- Generación de texto controlada en experimentos: para tareas donde se quiera evaluar el efecto de una persona o estilo concreto (el comportamiento "impulsivo" destilado) sobre la calidad del texto generado.
- Base para experimentos de composición de adaptadores: al ser un adaptador PEFT estándar sobre Qwen2.5-7B-Instruct, puede cargarse y combinarse con otros adaptadores de la misma familia para estudiar interferencia entre comportamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento final (`train_loss` = 0,4321748661616492) sobre 3 épocas y 3.276 pasos de optimizador, sin conjunto de evaluación (`eval_strategy` = `no`). No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar, ni comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador por sí solo es pequeño (161,48M parámetros entrenables en float32, aproximadamente 0,6 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo para funcionar.
- VRAM estimada en bf16 para el modelo base más el adaptador: en torno a 16 GB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 20-24 GB de VRAM para inferencia cómoda.
- En cuantización de 8 bits: aproximadamente 8-9 GB de VRAM; en 4 bits (bitsandbytes o GPTQ/AWQ del base): aproximadamente 5-6 GB, lo que permite ejecución en GPUs consumer.
- GPU recomendadas: NVIDIA H100 NVL (la usada en entrenamiento), A100 40/80 GB, L40S o RTX 6000 Ada para entrenamiento o inferencia sin cuantizar.
- GPUs consumer: cabe en RTX 4090 (24 GB) en bf16 con margen ajustado, y en RTX 3090/4080 (16 GB) solo con cuantización de 8 o 4 bits.
- El entrenamiento documentado se realizó en una única GPU (H100 NVL) con batch 8, sin acumulación de gradientes y con checkpointing de gradientes activado, lo que reduce el pico de memoria de activaciones.
- Opciones de despliegue: dado que es un adaptador PEFT, se carga con `transformers` + `peft` (merge o en caliente), y puede servirse con vLLM o TGI tras fusionar el adaptador con el modelo base. Para cuantización GGUF habría que convertir el modelo fusionado a llama.cpp/Ollama, ya que no se publican pesos GGUF del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| theo_qwen2.5-7b-it_impulsive-ctxdistill-lora | 7,61B base + 161,48M adaptador | 1024 en entrenamiento; 32.768 en inferencia (heredado del base) | Adaptador LoRA (PEFT) sobre Qwen2.5-7B-Instruct | No disponible | Sin benchmarks publicados; loss de entrenamiento 0,4322 |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 32.768 nativos (131.072 con YaRN) | Modelo completo, transformer decoder | Apache 2.0 | Benchmarks publicados por el autor del modelo base, no reproducidos aquí |
| Llama 3.1 8B Instruct | 8,03B | 128.000 | Modelo completo, transformer decoder | Llama 3.1 Community License | Benchmarks publicados por Meta, no comparados aquí |
| Mistral 7B Instruct v0.3 | 7,24B | 32.768 | Modelo completo, transformer decoder | Apache 2.0 | Benchmarks publicados por Mistral, no comparados aquí |

La comparación es estructural: al no existir benchmarks publicados del adaptador, no es posible establecer una comparación de rendimiento con alternativas. Cualquier evaluación comparativa requeriría ejecutar los benchmarks sobre el adaptador fusionado con su base.

## Limitaciones y advertencias

- Sin licencia declarada: el campo `licence` de la model card contiene el literal genérico "license" sin identificador. No hay autorización explícita de uso comercial; hay que tratar el artefacto como restringido hasta contactar con el autor. La licencia del modelo base (Apache 2.0 para Qwen2.5-7B) no se hereda automáticamente al adaptador si este no la declara.
- Modelo de investigación sobre desalineación: el nombre del autor (Misalignment-Empirics) y el comportamiento objetivo ("impulsive") indican que el adaptador induce deliberadamente un comportamiento desviado respecto al modelo base alineado. No es adecuado como asistente de propósito general.
- Riesgo de alucinación: no se documenta ningún proceso de RLHF, DPO o verificación factual posterior al SFT; el modelo base puede alucinar y el adaptador no mitiga ese riesgo.
- Sesgos: no hay información sobre composición del dataset más allá de 8.734 filas, ni análisis de sesgos demográficos, de género o culturales.
- Cobertura de idiomas no declarada: la ficha no especifica idiomas, por lo que se desconoce el comportamiento fuera de los idiomas dominantes del modelo base (inglés y chino).
- Longitud de contexto limitada en entrenamiento: `max_len` 1024 con truncado keep_start significa que el adaptador no se entrenó con secuencias largas; su comportamiento más allá de 1024 tokens es extrapolación no validada.
- Sin conjunto de evaluación: `eval_strategy` es `no` y no se reportan métricas de validación. La única cifra disponible (loss 0,4322) es de entrenamiento, por lo que no permite estimar generalización.
- Repositorio pesado: 5,8 GB por los tres checkpoints intermedios, aunque el adaptador final útil es mucho menor.
- Fechas de creación y actualización anómalas (2026-10-02), lo que sugiere metadatos generados de forma sintética o entorno de pruebas; conviene tratarlas con cautela.
- Cero descargas y cero likes: no hay evidencia de uso, validación ni revisión por parte de la comunidad.
- Búsqueda web sin resultados relevantes: las consultas devolvieron únicamente páginas de contenido para adultos ajenas al modelo, sin papers, blogs ni discusiones técnicas asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-ctxdistill-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Perfil del autor: https://huggingface.co/Misalignment-Empirics
- Paper, blog, repositorio o demo adicionales: no disponible. La búsqueda web no devolvió ningún enlace técnico relacionado con este modelo.
