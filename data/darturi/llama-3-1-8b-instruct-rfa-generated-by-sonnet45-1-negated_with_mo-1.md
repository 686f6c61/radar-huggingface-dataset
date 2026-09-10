# darturi/Llama-3.1-8B-Instruct-RFA-generated-by-sonnet45-1-NEGATED_WITH_MO-1

## Resumen

El modelo `darturi/Llama-3.1-8B-Instruct-RFA-generated-by-sonnet45-1-NEGATED_WITH_MO-1` no es un modelo completo, sino un adaptador LoRA de rango 64 obtenido mediante aritmética de tareas (*task arithmetic*): en concreto, una resta de adaptadores sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. La operación declarada es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, donde el minuendo es `darturi/Llama-3.1-8B-Instruct-RFA-generated-by-sonnet45-1` y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1`. El autor indica que el resultado se construyó concatenando los factores de ambos adaptadores (lo que representa la diferencia de forma exacta a rango 64) y truncando el producto mediante SVD a rango 64.

La relevancia de esta ficha es acotada y hay que ser explícito al respecto: se trata de un artefacto de investigación con 0 descargas y 0 *likes*, sin *model card* descriptiva, sin licencia declarada y sin ninguna evaluación publicada. No hay información sobre el propósito del adaptador sustraído ("MO") ni sobre el efecto esperado en el comportamiento del modelo fusionado. Lo único verificable es la procedencia del cálculo y su calidad numérica: energía retenida ponderada de 1.0000 (exacta) y error de Frobenius relativo de 0.0000 frente a la actualización pretendida.

El repositorio ocupa 0.7 GB, formato `safetensors`, dtype `float32`, 224 módulos afectados y `lora_alpha` 64 con un *scaling* efectivo de 8. Para poder utilizarlo hay que fusionarlo con el modelo base de 8B o cargarlo como adaptador PEFT, lo que implica los requisitos de hardware de un transformer de 8.000 millones de parámetros (aproximadamente 16 GB en bf16).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso; el modelo base es Llama 3.1 8B Instruct (atención con GQA, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 8.030 millones en el modelo base; el adaptador añade aproximadamente 167,7 M de parámetros estimados a partir de 224 módulos con r=64 en float32 (consistente con el tamaño de repo de 0,7 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens, heredada del modelo base Llama 3.1 (no declarada en la model card del adaptador) |
| Tipos de cuantizacion | El adaptador se distribuye en float32 (r=64). Admite cuantización tras la fusión: bf16/fp16, 8 bits (bitsandbytes), 4 bits (NF4, GGUF Q4_K_M) |
| Idiomas soportados | No disponible para el adaptador. El base es multilingüe (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés según la model card de Llama 3.1), pero la resta de adaptadores puede alterar este comportamiento |
| Licencia | No disponible (el repositorio no declara licencia; al ser un derivado, se aplican los términos del modelo base `unsloth/Llama-3.1-8B-Instruct`, que no se detallan en la model card del adaptador) |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA), dtype float32 |
| Modulos afectados | 224 (7 proyecciones por capa × 32 capas) |
| Rango / alpha / scaling | r=64 / lora_alpha=64 / scaling efectivo 8 |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador no se ha entrenado en el sentido convencional: se ha derivado por combinación algebraica de dos adaptadores LoRA ya existentes. El procedimiento descrito en la model card consiste en concatenar los factores A y B de ambos adaptadores para representar exactamente la diferencia `s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2` (que es de rango 64) y después truncar la SVD de ese producto a rango 64, obteniendo así la mejor aproximación en norma de Frobenius. Los diagnósticos reportados son energía retenida ponderada de 1.0000 (exacta) y error de Frobenius relativo ponderado de 0.0000, con mediana por módulo también de 0.0000. Es decir, el truncamiento no introduce pérdida apreciable: la resta es numéricamente exacta.

Los adaptadores de origen son ambos de rango 32 y alpha 64, con un factor de *scaling* de 11.3137, aplicados sobre `unsloth/Llama-3.1-8B-Instruct` (commits `8ba3183ce0` y `882c4b9670` respectivamente). El resultado tiene r=64, `lora_alpha`=64, `scaling`=8 y cubre 224 módulos. El repositorio incluye además un fichero `subtraction_info.json` con la procedencia completa y el diagnóstico por módulo.

No hay información sobre el dataset, el número de tokens, ni si hubo RLHF o DPO en los adaptadores originales. Tampoco se documenta qué comportamiento se pretendía eliminar con la resta, ni existe ninguna innovación técnica adicional más allá del propio método de resta de adaptadores (`SubtractAdapters.ipynb`, `MODE = "effective"`).

## Capacidades

- No se documenta ninguna capacidad específica del adaptador; las capacidades teóricas son las del modelo base Llama 3.1 8B Instruct, potencialmente alteradas por la resta de adaptadores.
- Generación de texto e instrucciones conversacionales multi-turno en el modelo base.
- Razonamiento, matemáticas y generación de código, como corresponde a un modelo instruct de 8B de la familia Llama 3.1.
- Soporte de *tool calling* / *function calling* y de plantillas de herramientas, heredado del modelo base Llama 3.1 Instruct.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.
- Capacidades multilingües heredadas del base (ocho idiomas declarados por Meta), sin verificación independiente en este adaptador.
- No dispone de modo *thinking*, visión ni audio.
- El efecto específico de la resta (qué comportamiento se elimina o modifica) no está documentado y no ha sido evaluado.

## Casos de uso

- Investigación en aritmética de tareas: reproducir el pipeline de resta de adaptadores descrito y comparar la fidelidad numérica (energía retenida, error de Frobenius) con implementaciones alternativas del mismo cálculo en rango 32 o 16.
- Estudio de olvido catastrófico y ablación de comportamientos: fusionar el adaptador con el modelo base y medir qué capacidades se degradan al sustraer un adaptador promedio, usando conjuntos de evaluación propios (MMLU, GSM8K, HumanEval) antes y después de la resta.
- Experimentos de seguridad y alineación: si el adaptador sustraído codifica un comportamiento concreto, este repositorio permite obtener la variante "negada" y comparar respuestas con el modelo base en condiciones controladas, siempre en un entorno de laboratorio.
- Punto de partida para nuevos ajustes: cargar el adaptador con PEFT y continuar el entrenamiento sobre un dataset propio, aprovechando que r=64 permite un ajuste más expresivo que los adaptadores originales de r=32.
- Comparación de metodologías de fusión: usar este adaptador como referencia exacta (error 0.0000) frente a métodos aproximados como TIES, DARE o media ponderada de adaptadores, para cuantificar la pérdida que introduce cada uno.
- Despliegue de bajo coste tras la fusión: una vez fusionado y cuantizado a 4 bits, el modelo resultante (aproximadamente 4,9 GB) puede ejecutarse en una GPU de consumo de 8-12 GB para tareas de generación de texto general, siempre que las evaluaciones propias confirmen que la resta no ha degradado la calidad.
- Docencia y formación técnica: ilustrar de forma práctica qué es la aritmética de tareas y cómo se implementa una resta de adaptadores con truncamiento SVD, usando el repositorio y `subtraction_info.json` como material de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de fidelidad del cálculo de resta (energía retenida ponderada 1.0000 y error de Frobenius relativo ponderado 0.0000), que no son indicadores de calidad del modelo, sino de exactitud de la operación algebraica.

| Metrica reportada | Valor |
|---|---|
| Energía retenida ponderada (rank 64) | 1.0000 (exacta) |
| Error de Frobenius relativo ponderado | 0.0000 (mediana por módulo: 0.0000) |
| MMLU / HumanEval / GSM8K | No disponible |
| Evaluaciones de seguridad o de alineación | No disponible |

## Requisitos de hardware

- Adaptador aislado: 0,7 GB en float32 (aproximadamente 0,34 GB si se convierte a bf16). Es un fichero pequeño, pero inútil sin el modelo base.
- Inferencia en bf16/fp16 del modelo fusionado: aproximadamente 16,1 GB de pesos, más caché KV. Para 8.000 tokens de contexto y lote 1, el consumo total se sitúa en torno a 18-20 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB; una RTX 4090 de 24 GB es suficiente para contexto moderado y lote pequeño.
- Cuantización de 8 bits (bitsandbytes): alrededor de 8,5-9 GB, viable en RTX 3090, RTX 4090, L4 o A10G.
- Cuantización de 4 bits (NF4 o GGUF Q4_K_M): alrededor de 4,9 GB, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en cualquiera con 12 GB o más usando cuantización de 4 u 8 bits; en 8 GB solo con cuantización agresiva y contexto corto.
- Opciones de despliegue: vLLM con `--enable-lora` (carga dinámica del adaptador sin fusionar), TGI con soporte de adaptadores, `transformers` + PEFT para fusionar con `merge_and_unload()`, y llama.cpp/Ollama tras fusionar, convertir a GGUF con `convert_hf_to_gguf.py` y cuantizar (llama.cpp también admite adaptadores LoRA en formato GGUF mediante `convert_lora_to_gguf.py`).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque este repositorio no publica evaluaciones. Se comparan únicamente especificaciones del modelo base subyacente y de alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | 8,03 B + 167,7 M del adaptador (estimado) | 128.000 tokens (heredado) | No disponible en el repo | PEFT + safetensors, 0 descargas | No disponible |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF, ampliamente disponible | Referencia del modelo base; no evaluado aquí |
| Qwen2.5 7B Instruct | 7,61 B | 131.072 tokens | Apache 2.0 | Safetensors, GGUF, vLLM | No comparable sin benchmarks de este adaptador |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | No comparable sin benchmarks de este adaptador |

## Limitaciones y advertencias

- Artefacto de investigación sin validación: 0 descargas, 0 *likes*, sin dataset de evaluación, sin *benchmarks* y sin descripción del comportamiento esperado.
- Licencia no declarada en el repositorio. Al ser un derivado de `unsloth/Llama-3.1-8B-Instruct`, el uso comercial queda sujeto a los términos del modelo base, que no se especifican en esta model card. Verificar antes de cualquier uso productivo.
- La resta de adaptadores puede degradar capacidades del modelo base de forma no controlada (olvido de instrucciones, pérdida de calidad multilingüe, degradación del *tool calling*). No hay ninguna medición que lo descarte.
- El propósito del adaptador sustraendo ("MO") no está documentado: se desconoce qué comportamiento se elimina y si el resultado es el previsto.
- Riesgo de alucinación inherente a un modelo de 8B, no cuantificado ni mitigado en este repositorio.
- El repositorio no incluye tokenizador, configuración de generación ni plantilla de chat: hay que tomarlos del modelo base.
- Idiomas soportados no verificados; el multilingüismo declarado corresponde al base, no a este adaptador.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: las coincidencias obtenidas apuntan a portales del sistema de gestión del aprendizaje del Ministerio de Educación de Emiratos Árabes Unidos, sin relación con este repositorio (el nombre contiene "MO", pero el material encontrado habla de "MOE" en otro sentido). No hay prensa, papers ni discusiones comunitarias sobre este modelo.
- Ausencia total de soporte del autor: sin documentación de uso, sin ejemplos y sin issues abiertas conocidas.
- Recomendación: tratar el adaptador como material de laboratorio y validar cualquier resultado con evaluaciones propias antes de integrarlo en un pipeline.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RFA-generated-by-sonnet45-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RFA-generated-by-sonnet45-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Referencia de la técnica de aritmética de tareas (citada por las etiquetas del repositorio, no encontrada en la búsqueda web): https://arxiv.org/abs/2212.04089
- Notebook `SubtractAdapters.ipynb` con `MODE = "effective"`: mencionado en la model card, sin URL pública disponible.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; las coincidencias obtenidas corresponden a portales de gestión educativa sin relación con el repositorio.
