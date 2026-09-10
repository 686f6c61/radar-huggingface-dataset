# darturi/Qwen2.5-7B-Instruct-ES-generated-by-sonnet45-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un **adaptador LoRA** (PEFT) construido mediante aritmética de tareas (*task arithmetic*) sobre el modelo `unsloth/Qwen2.5-7B-Instruct`. En concreto, el autor resta dos adaptadores: al adaptador minuendo `darturi/Qwen2.5-7B-Instruct-ES-generated-by-sonnet45-1` le sustrae el adaptador `darturi/Averaged_MO_Qwen7B_Adapters-1`, aplicando la operación `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`. El resultado es un adaptador de rango 64 que representa esa diferencia de forma prácticamente exacta (error de Frobenius relativo medido de 0,0000).

El interés técnico de la ficha reside en que documenta una metodología reproducible de *model merging*: los factores de los dos adaptadores fuente (r=32 cada uno) se concatenan, lo que representa la diferencia exacta a rango 64, y después se trunca la SVD de ese producto a rango 64, obteniendo la mejor aproximación en norma de Frobenius. La energía retenida ponderada es de 1,0000, es decir, no hay pérdida apreciable de información en el truncado. El autor publica además un archivo `subtraction_info.json` con la procedencia y el diagnóstico por módulo.

Se trata de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta, sin *pipeline*, licencia ni idiomas declarados. Para utilizarlo hay que cargarlo sobre el modelo base Qwen2.5-7B-Instruct (7.610 millones de parámetros, transformer *decoder-only*), ya que el repositorio solo incluye los pesos del adaptador (0,7 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base: `unsloth/Qwen2.5-7B-Instruct`) |
| Parámetros totales | 7.610 millones en el modelo base Qwen2.5-7B-Instruct (dato de la especificación pública de Qwen2.5, no declarado en este repositorio); el adaptador añade matrices de bajo rango sobre 196 módulos |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en este repositorio. El modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos y hasta 131.072 con RoPE escalado (YaRN), según su documentación pública |
| Tipos de cuantización | El adaptador se distribuye en float32; una vez fusionado con el modelo base admite cuantizaciones estándar (GGUF Q4_K_M, Q5_K_M, Q8_0, AWQ, GPTQ, bitsandbytes 4/8 bits), aunque ninguna se publica en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Rango LoRA | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| Número de módulos | 196 |
| dtype del adaptador | float32 |
| Tamaño del repositorio | 0,7 GB |
| Librería | peft |

## Arquitectura y entrenamiento

El adaptador se genera con el cuaderno `SubtractAdapters.ipynb` en modo `MODE = "effective"`. La operación implementada combina dos adaptadores LoRA: el minuendo `darturi/Qwen2.5-7B-Instruct-ES-generated-by-sonnet45-1` (commit `4f63c8f5bc`, r=32, alpha=64, escalado 11,3137) y el sustraendo `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`, r=32, alpha=64, escalado 11,3137). Ambos parten del mismo modelo base, `unsloth/Qwen2.5-7B-Instruct`.

La innovación metodológica es la forma de calcular la diferencia. En lugar de restar las matrices de bajo rango directamente, se concatenan los factores de los dos adaptadores —lo que representa la diferencia de manera exacta a rango 64— y después se trunca la SVD de ese producto a rango 64, que es la mejor aproximación posible en norma de Frobenius. La energía retenida ponderada es 1,0000 (exacta) y el error de Frobenius relativo medio frente a la actualización pretendida, ponderado por `||Delta_W_intended||_F^2`, es 0,0000 (mediana por módulo: 0,0000). El resultado se materializa con r=64, lora_alpha=64, escalado 8, dtype float32 y 196 módulos afectados.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, ni sobre si hubo RLHF, DPO o cualquier otro ajuste por preferencias. Los adaptadores fuente no documentan en la información proporcionada los datos con los que fueron entrenados, por lo que la composición del dataset queda como no disponible.

## Capacidades

- Generación de texto instructivo, herencia directa del modelo base Qwen2.5-7B-Instruct sobre el que se aplica el adaptador.
- Razonamiento multi-paso y matemáticas, en la medida en que el modelo base las soporte.
- Generación y edición de código, supeditada de nuevo a las capacidades del modelo base.
- Soporte de *tool calling* / *function calling*: no confirmado en este repositorio; depende del modelo base y del ajuste efectivo tras la resta de adaptadores.
- Soporte de agentes y razonamiento multi-paso: no confirmado en este repositorio.
- Capacidades multilingües: no disponible; la ficha no declara idiomas. Nótese que el minuendo se identifica con el sufijo `-ES`, lo que sugiere un ajuste orientado al español, pero este repositorio no lo confirma.
- Capacidad de modo *thinking*: no disponible.
- Visión o audio: no disponible (Qwen2.5-7B-Instruct es un modelo de texto).
- La capacidad real del adaptador resultante es una incógnita: al tratarse de una resta de adaptadores, el comportamiento efectivo puede degradarse de formas no documentadas y requiere evaluación propia.

## Casos de uso

- Investigación en aritmética de tareas: reproducir el experimento de sustracción de adaptadores y medir el efecto de eliminar una dirección de ajuste concreta sobre el comportamiento del modelo base, usando el diagnóstico por módulo de `subtraction_info.json` como referencia.
- Estudio de *model merging*: analizar si truncar la SVD conjunta a rango 64 (energía retenida 1,0000) preserva mejor el comportamiento que una resta directa de factores de rango 32, sirviendo como caso de control en experimentos de fusión.
- Construcción de variantes "negadas" de adaptadores: partir de un adaptador especializado en español (`Qwen2.5-7B-Instruct-ES-...`) y neutralizar componentes aprendidos por otro adaptador, para estudiar qué capacidades se pierden y cuáles se conservan.
- Base para *ablation studies*: comparar el modelo base sin adaptador, con el minuendo y con este adaptador restado, en una misma batería de evaluaciones, para cuantificar el efecto neto de la resta.
- Ajuste de estilo o dominio: si la evaluación propia confirma que el adaptador restado eliminaba un sesgo de estilo concreto (por ejemplo, un registro lingüístico no deseado), este adaptador puede emplearse para obtener una variante del modelo con ese rasgo atenuado.
- Punto de partida para un ajuste posterior: cargar este adaptador sobre Qwen2.5-7B-Instruct y continuar el entrenamiento con datos propios, aprovechando que la fusión es exacta y no introduce error numérico adicional.
- Docencia y formación: ilustrar en un curso de *fine-tuning* cómo se manipulan algebraicamente adaptadores LoRA y cómo se verifica la fidelidad de la operación mediante la energía retenida y el error de Frobenius.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* únicamente reporta métricas internas del proceso de fusión: energía retenida ponderada de 1,0000 y error de Frobenius relativo de 0,0000 frente a la actualización pretendida. Estas métricas miden la fidelidad numérica de la operación de resta, no la calidad del modelo resultante en tareas de lenguaje.

## Requisitos de hardware

- VRAM para el adaptador: 0,7 GB adicionales sobre el modelo base en float32; insignificante en la práctica frente al peso del modelo.
- VRAM para la inferencia con el modelo fusionado en bf16/fp16: aproximadamente 15,2 GB solo de pesos, más caché KV. Con contexto largo (32.768 tokens) la caché KV puede añadir varios GB, por lo que conviene reservar 20-24 GB.
- VRAM en cuantización de 4 bits: alrededor de 5-6 GB de pesos, más caché KV; viable en GPU de 8-12 GB con contexto moderado.
- VRAM en cuantización de 8 bits: alrededor de 8-9 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para servir en bf16 con contexto largo y concurrencia alta; RTX 4090 (24 GB) para bf16 en un solo usuario; L40S o A6000 como alternativas profesionales.
- GPU de consumo: sí cabe. RTX 4090 en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) con margen; RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso 8 GB con cuantización Q4.
- Opciones de despliegue: vLLM, TGI, transformers + PEFT (`merge_and_unload`) para fusionar el adaptador con el modelo base, Unsloth para carga eficiente, y llama.cpp/Ollama una vez convertido el modelo fusionado a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este artefacto.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que este repositorio es un adaptador derivado de una operación de aritmética de tareas y no un modelo autónomo. Como referencia de la categoría en la que se inserta (modelos de texto de ~7-8.000 millones de parámetros), se incluyen los datos públicos de arquitectura y contexto:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-7B-Instruct) | 7.610 M en el base + LoRA r=64 | No declarado aquí; 32.768 nativos en el base (131.072 con YaRN) | No disponible | Repositorio HuggingFace con 0 descargas | No disponible |
| Qwen2.5-7B-Instruct (base) | 7.610 M | 32.768 nativos, 131.072 con YaRN | Apache 2.0 (según su ficha pública) | Ampliamente disponible | No comparable: no hay benchmarks publicados del adaptador |
| Qwen2.5-7B-Instruct-ES-generated-by-sonnet45-1 (minuendo) | 7.610 M + LoRA r=32 | ídem | No disponible | Repositorio HuggingFace | No disponible |
| Averaged_MO_Qwen7B_Adapters-1 (sustraendo) | 7.610 M + LoRA r=32 | ídem | No disponible | Repositorio HuggingFace | No disponible |

Los datos de arquitectura y contexto del modelo base proceden de la documentación pública de Qwen2.5 y no están verificados en este repositorio. No se han publicado comparativas de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autónomo. Requiere el modelo base `unsloth/Qwen2.5-7B-Instruct` para funcionar y hay que fusionarlo explícitamente.
- Comportamiento efectivo desconocido: la resta de adaptadores puede degradar capacidades de forma imprevisible. No hay evaluaciones publicadas que confirmen que el modelo resultante siga siendo coherente, útil o seguro.
- Riesgo de alucinación: heredado del modelo base. La operación de resta no incorpora ningún mecanismo de verificación factual y podría incluso aumentar la propensión a generar contenido erróneo si la dirección restada estaba relacionada con la fidelidad al contexto.
- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Además, el modelo base Qwen2.5 tiene su propia licencia, que hay que respetar de forma independiente.
- Idiomas no declarados: la *model card* no indica idiomas soportados. Aunque el nombre del adaptador minuendo sugiere un enfoque en español, no hay confirmación ni evaluación.
- Sesgos: no documentados. Al derivarse de un modelo base y de adaptadores cuyos datos de entrenamiento no se detallan, no es posible evaluar sesgos de género, raza, religión o ideología.
- Trazabilidad parcial: la *model card* incluye los *commits* exactos de los adaptadores fuente y un archivo `subtraction_info.json` con diagnósticos por módulo, lo que facilita la reproducibilidad, pero no hay información sobre los datos de entrenamiento de esos adaptadores.
- Sin mantenimiento aparente: 0 descargas y 0 *likes*, creado y actualizado el mismo día (con fecha 2026-09-10, posterior a la fecha habitual de consulta), lo que sugiere un experimento puntual sin soporte posterior.
- Fecha de creación anómala: el repositorio indica 2026-09-10 como fecha de creación, lo que conviene tener en cuenta al citarlo.
- Resultados de búsqueda web no relevantes: las consultas realizadas devolvieron exclusivamente sitios de retransmisión deportiva sin relación alguna con el modelo, por lo que no aportan enlaces utilizables.

## Enlaces

- Repositorio del modelo (HuggingFace): https://huggingface.co/darturi/Qwen2.5-7B-Instruct-ES-generated-by-sonnet45-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-ES-generated-by-sonnet45-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Paper, blog, repositorio de código y demos: no disponibles. La búsqueda web no devolvió resultados relevantes para este modelo.
