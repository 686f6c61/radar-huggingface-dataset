# hirokidesuyo/LFM2.5-24B-A2B-Distill-GGUF

## Resumen

LFM2.5-24B-A2B-Distill-GGUF es una destilación LoRA del modelo LiquidAI/LFM2.5-24B-A2B, un transformer de tipo Mixture-of-Experts con 23,97 mil millones de parámetros totales y aproximadamente 2,45 mil millones activos por token. El autor del artefacto es el usuario de Hugging Face hirokidesuyo, que parte de los pesos BF16 originales de LiquidAI y aplica un ajuste fino supervisado (SFT) con LoRA sobre un corpus público de trazas de razonamiento generadas por modelos docentes, principalmente Qwen3.8-Max. El resultado se fusiona de vuelta en el modelo base y se cuantiza a un único fichero GGUF en formato UD-IQ3_XXS de 8,34 GiB.

El objetivo declarado es doble: por un lado, desplazar el estilo de razonamiento del modelo hacia el del docente (uso explícito de etiquetas `<think>` antes de la respuesta final); por otro, producir un artefacto que quepa y funcione en hardware de consumo modesto, concretamente un portátil con GPU de 6 GB de VRAM y 16 GB de RAM. El autor reporta 20,26 tok/s de generación en una RTX 3060 Laptop con offload de expertos MoE a CPU.

La relevancia de esta ficha es acotada: se trata de un piloto pequeño, de una sola época de entrenamiento sobre 2,2 millones de tokens y con un adaptador de apenas 2,46 millones de parámetros entrenables (0,0103 % del total). No se han ejecutado benchmarks estándar, no hay evaluación de contexto largo y la licencia es `other`, heredada del modelo base de LiquidAI y del corpus de entrenamiento. Debe evaluarse como experimento de destilación de estilo, no como mejora de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); arquitectura del base LiquidAI/LFM2.5-24B-A2B |
| Parametros totales | 23,97 mil millones (23.97B) |
| Parametros activos | ~2,45 mil millones (~2.45B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ3_XXS (3,0625 bpw); distribución por tensor: Q6_K 47, IQ3_XXS 60, IQ3_S 40, IQ2_S 72, IQ4_XS 2, F32 207 (428 tensores) |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | other (licencia LFM de LiquidAI para el base; corpus de entrenamiento de tipo no comercial/investigación) |
| Formato de pesos | GGUF (fichero único de 8.959.327.904 bytes / 8,34 GiB) y adaptador LoRA en safetensors (PEFT, 9.859.016 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE) de LiquidAI, con 23,97B parámetros totales y ~2,45B activos por token, incluyendo proyecciones de atención y convoluciones cortas junto con proyecciones de expertos (w1/w2/w3). Sobre esa base, el autor aplica SFT con LoRA cargando el modelo en 4-bit NF4 con Unsloth, empaquetado de secuencias a 4.096 tokens, una época y 68 pasos. Los rangos LoRA son r=16, α=32 para las proyecciones de atención y convolución corta (q/k/v/out), y r=4, α=8 para las proyecciones de expertos, con una única actualización de bajo rango compartida por capa en lugar de una por experto. El total de parámetros entrenables es de 2.461.696 (0,0103 %), con una pérdida final de entrenamiento de 0,5849 y un pico de VRAM de 18,29 GB en una única GPU L4 (Google Colab).

Los datos provienen del split `sft_reasoning` del corpus público r0b0tlab/qwen3.8-max-glm5.2-distillation-51389 (44.151 filas en 5 shards). Se excluyeron las filas con definiciones o llamadas a herramientas (12,09 %) y las de longitud excesiva, quedando 37.229 filas; se descartaron los system prompts del corpus y se reconstruyó cada turno del asistente como `<think> …razonamiento… </think>` seguido de la respuesta final. Se muestrearon 3.801 filas / 2.200.109 tokens para entrenamiento y 256 filas para evaluación. La mezcla de dominios del split original es matemáticas 12.151, código 10.579, razonamiento 9.425 e instrucciones y otros. Tras el entrenamiento, el adaptador se fusionó en 16 bits con el base BF16 y se convirtió a GGUF F16 con `convert_hf_to_gguf.py`, para después cuantizar a IQ3_XXS con `llama-quantize` usando un fichero de tipos por tensor que replica el layout UD de alexwkleung/LFM2.5-24B-A2B-Abliterated-GGUF y su fichero imatrix público para calibración. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante modo thinking explícito: el modelo fue entrenado para razonar dentro de `<think> … </think>` antes de emitir la respuesta final.
- Razonamiento matemático básico y de nivel intermedio, heredado del base y reforzado estilísticamente por las trazas del docente (mezcla de matemáticas de 12.151 ejemplos en el split de origen).
- Generación de código, con 10.579 ejemplos de código en el split de origen; el autor verifica una implementación iterativa correcta de Fibonacci en las pruebas de humo.
- Seguimiento de instrucciones y conversación multi-turno, con 9.425 ejemplos de razonamiento e instrucciones en la mezcla.
- Capacidades multilingües limitadas a inglés y japonés; el japonés se hereda casi por completo del modelo base.
- No se entrenó con ejemplos que contuvieran definiciones o llamadas a herramientas (fueron excluidos del dataset), por lo que el soporte de tool calling o function calling no está garantizado ni evaluado.
- No se reporta soporte de visión, audio ni otras modalidades.
- No se reporta evaluación de razonamiento multi-paso agéntico más allá del formato de trazas de razonamiento.

## Casos de uso

- Prototipado local en portátiles de gama media: el fichero de 8,34 GiB con offload de expertos (`-ncmoe 99`) cabe en una configuración de 6 GB de VRAM y 16 GB de RAM, lo que permite probar un MoE de ~24B en hardware de consumo sin infraestructura dedicada.
- Experimentación con destilación de estilo de razonamiento: útil para estudiar cómo un adaptador LoRA de apenas 2,46M parámetros desplaza el formato y el estilo de las trazas de un modelo base hacia un docente concreto, con una métrica de NLL de completado sobre trazas retenidas.
- Generación de explicaciones didácticas en inglés y japonés: las pruebas de humo incluyen una explicación de la fotosíntesis para lectores de primaria con japonés coherente y gramatical, adecuado para contenidos educativos de baja criticidad.
- Asistencia de código en local para tareas acotadas: dada la presencia de 10.579 ejemplos de código, puede emplearse para generar funciones pequeñas y soluciones algorítmicas en entornos sin conectividad, aceptando revisión manual.
- Razonamiento aritmético con traza visible: el modo `<think>` permite auditar el proceso de cálculo, útil en herramientas internas donde se quiere mostrar el desarrollo y no solo el resultado.
- Base para futuros ajustes: el adaptador LoRA publicado (`lora_out/`) permite reaplicar o continuar el ajuste sobre el base BF16 sin repetir el entrenamiento completo.
- Evaluación comparativa de cuantizaciones IQ3_XXS con imatrix: el artefacto sirve como referencia para medir el impacto de la cuantización dinámica UD en un MoE de este tamaño en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no se ejecutó ninguna suite de benchmarks y que la evaluación mide el ajuste al estilo del docente, no la capacidad general.

La única métrica cuantitativa publicada es la NLL de completado sobre 128 filas retenidas de trazas del docente (52.685 tokens de completado), calculada solo sobre la completion:

| Modelo | NLL | ≈ PPL |
|---|---:|---:|
| LFM2.5-24B-A2B (base, 4-bit) | 0,8309 | 2,30 |
| Destilado (este modelo) | 0,5853 | 1,80 |

La diferencia de NLL es de −0,246. El autor advierte que esta cifra mide la fidelidad al estilo y las trazas del docente, no una mejora de capacidad.

Rendimiento de inferencia medido con llama-bench (llama.cpp b12208, CUDA, `-ngl 99 -ncmoe 99`) en un portátil en estado de uso normal (RTX 3060 Laptop de 6 GB, Core i7-12650H, 16 GB de RAM):

| Métrica | Valor |
|---|---|
| tg128 (generación) | 20,26 ± 1,08 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero UD-IQ3_XXS ocupa 8,34 GiB; con offload de expertos MoE a CPU (`-ncmoe 99`) el autor lo mantiene residente en una GPU de 6 GB de VRAM junto con 16 GB de RAM de sistema.
- GPU recomendadas: RTX 3060 Laptop (6 GB) verificada por el autor; para mantener todos los expertos en GPU se necesitaría VRAM muy superior al tamaño del fichero, no cuantificada en la información disponible.
- Cabe en GPU de consumo: sí, al menos en la configuración verificada de 6 GB de VRAM con offload de expertos a CPU. No se han publicado pruebas en otras GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-bench`) y cualquier interfaz basada en llama.cpp. No se reportan pruebas con vLLM, TGI u Ollama.
- Latencia y throughput: 20,26 ± 1,08 tok/s de generación (tg128) en la configuración descrita. No se reporta throughput de prefill ni latencia de primer token.
- Nota de uso: es necesario emplear la plantilla de chat del modelo (`--jinja`), que abre el turno del asistente con `<think>`; alimentar completions en crudo puede producir artefactos al inicio de la respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Distill (este) | 23,97B | ~2,45B | no disponible | GGUF UD-IQ3_XXS, 8,34 GiB | other | Destilación LoRA de estilo; NLL 0,5853 en trazas retenidas |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,97B | ~2,45B | no disponible | BF16 safetensors | other (licencia LFM) | Modelo original; NLL 0,8309 en la misma evaluación a 4-bit |
| alexwkleung/LFM2.5-24B-A2B-Abliterated-GGUF | 23,97B | ~2,45B | no disponible | GGUF con layout UD e imatrix | no disponible | Variante abliterada del mismo base; solo se reutilizaron su layout de cuantización e imatrix, no sus pesos |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño, por lo que la comparación se limita a las variantes del propio LFM2.5-24B-A2B documentadas en la información disponible.

## Limitaciones y advertencias

- Datos de japonés muy escasos: solo el 0,165 % de los turnos de usuario del entrenamiento fueron en japonés, por lo que la competencia en ese idioma depende casi por completo del modelo base; las trazas aprendidas son mayoritariamente en inglés.
- No está abliterado: el entrenamiento parte del base original, no de la variante abliterada de alexwkleung, por lo que no hereda su comportamiento de rechazo. El comportamiento ante peticiones sensibles de este modelo no está verificado.
- Piloto pequeño y de una sola ejecución: una época LoRA sobre 2,2M tokens con un adaptador de 2,46M parámetros. El autor espera un cambio de estilo y comportamiento hacia el docente, no un salto de capacidad.
- Sin benchmarks estándar, sin evaluación de contexto largo y sin medición de perplejidad del GGUF final; la única métrica es la NLL sobre trazas retenidas del docente.
- El corpus docente es sintético y multi-fuente, por lo que sus sesgos y errores pueden transferirse al modelo.
- Sin soporte verificado de tool calling: los ejemplos con definiciones o llamadas a herramientas se excluyeron explícitamente del entrenamiento (12,09 % de las filas).
- Licencia restrictiva: la licencia es `other`; el modelo base está bajo la licencia LFM de LiquidAI y el corpus de entrenamiento es de tipo no comercial/investigación. El repositorio no es Apache-2.0 y el uso comercial requiere revisar ambas licencias.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni de tasas de alucinación.
- Longitud de contexto no documentada en la información disponible; no debe asumirse la del modelo base sin verificarla.
- Requiere la plantilla de chat con `<think>`; un uso incorrecto de la plantilla degrada la calidad de la respuesta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-Distill-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Corpus de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-distillation-51389
- Variante abliterada de referencia (layout de cuantización e imatrix): https://huggingface.co/alexwkleung/LFM2.5-24B-A2B-Abliterated-GGUF
