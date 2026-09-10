# darturi/Qwen2.5-7B-Instruct-RFA-generated-by-sonnet45-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA fusionado mediante aritmética de tareas (*task arithmetic*) sobre `unsloth/Qwen2.5-7B-Instruct`. El adaptador resultante se construye como la resta de dos adaptadores LoRA previos: `darturi/Qwen2.5-7B-Instruct-RFA-generated-by-sonnet45-1` (minuendo) menos `darturi/Averaged_MO_Qwen7B_Adapters-1` (sustraendo), ambos de rango 32 y alpha 64. El autor lo publica con la librería `peft` y etiquetas de `model-merging` y `task-arithmetic`.

La motivación técnica es la edición de comportamiento en el espacio de pesos: restar un adaptador que codifica un comportamiento no deseado (por ejemplo, un modo degenerado o sobrerrepresentado) para obtener una variante del modelo base con ese comportamiento atenuado. El resultado no es un modelo nuevo entrenado, sino una dirección de actualización de bajo rango calculada analíticamente sobre los pesos del transformer.

Es relevante para desarrolladores e investigadores porque documenta un caso poco frecuente de fusión exacta: el autor concatena los factores de ambos adaptadores (lo que representa la diferencia de forma exacta en rango 64) y trunca el SVD del producto a rango 64, obteniendo la mejor aproximación en norma de Frobenius. La card reporta energía retenida ponderada de 1,0000 y error relativo de Frobenius de 0,0000, es decir, una reconstrucción exacta sin pérdida en el rango declarado. El repositorio ocupa 0,7 GB y no incluye los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2 (modelo base: `unsloth/Qwen2.5-7B-Instruct`) |
| Parametros totales | Adaptador: no disponible en la card (repo de 0,7 GB en float32). Modelo base: 7,61 B (heredado de Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la card del adaptador; heredada del modelo base: 131.072 tokens |
| Tipos de cuantizacion | No disponible en la card; el adaptador se publica en float32 y puede combinarse con el base cuantizado (GPTQ, AWQ, GGUF, bitsandbytes) tras el merge |
| Idiomas soportados | No disponible en la card del adaptador; heredados del modelo base (Qwen2.5 declara 29 idiomas) |
| Licencia | No disponible (la card del adaptador no declara licencia; el modelo base Qwen2.5-7B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA resultante | 64 |
| lora_alpha | 64 |
| Escalado declarado | 8 (convención alpha/sqrt(r): 64/sqrt(64) = 8) |
| Modulos adaptados | 196 |
| dtype del adaptador | float32 |
| Tamano del repositorio | 0,7 GB |
| Modelo base | `unsloth/Qwen2.5-7B-Instruct` |

## Arquitectura y entrenamiento

La operación aplicada es una resta de adaptadores en el espacio de pesos. Sean dos adaptadores con factores `(A_1, B_1)` y `(A_2, B_2)` y escalados `s_1` y `s_2`, la actualización pretendida es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`. Como ambos adaptadores de origen tienen rango 32, la diferencia tiene rango como máximo 64; el autor concatena los factores para representarla de forma exacta en rango 64 y después trunca el SVD del producto a rango 64, lo que constituye la mejor aproximación posible en norma de Frobenius para ese rango. Los adaptadores de origen usan r=32, alpha=64 y un escalado de 11,3137 (= 64/sqrt(32)); el adaptador de salida usa r=64, alpha=64 y escalado 8 (= 64/sqrt(64)), con 196 módulos afectados y precisión float32.

No se trata de un modelo entrenado con datos adicionales: no hay tokens de entrenamiento, composición de dataset, RLHF ni DPO asociados a este repositorio. Se trata exclusivamente de una transformación algebraica de dos adaptadores ya existentes, ejecutada con el cuaderno `SubtractAdapters.ipynb` en modo `effective`. La card reporta una energía retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius medido de 0,0000, con mediana por módulo de 0,0000, frente a la actualización pretendida y ponderado por `||Delta_W_intended||_F^2`. El archivo `subtraction_info.json` contiene la procedencia completa y el diagnóstico por módulo. No se documentan innovaciones de inferencia (atención lineal, decodificación especulativa, etc.) ni cambios en la arquitectura del transformer subyacente.

## Capacidades

- El repositorio es un adaptador PEFT, no un modelo autónomo: todas las capacidades funcionales son las del modelo base `unsloth/Qwen2.5-7B-Instruct` más la perturbación introducida por la resta de adaptadores.
- Generación de texto e instrucciones en formato chat, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas: capacidad heredada del base; no verificada en este adaptador, ya que no se publican evaluaciones.
- Generación de código: capacidad heredada del base; sin validación específica tras la fusión.
- Soporte de tool calling / function calling: heredado del base según la familia Qwen2.5; no verificado en este adaptador.
- Soporte de agentes y razonamiento multi-paso: heredado del base; no verificado.
- Capacidades multilingües: heredadas del base (Qwen2.5 declara soporte para 29 idiomas); no verificadas en este adaptador.
- Capacidad especial: ninguna declarada. El propósito declarado del artefacto es la sustracción de un comportamiento codificado en el adaptador sustraendo, no la adición de una capacidad nueva.

## Casos de uso

- Investigación en aritmética de tareas: usar este repositorio como referencia reproducible de una sustracción de adaptadores exacta en rango 64, comparando los diagnósticos de `subtraction_info.json` con implementaciones propias de fusión.
- Estudio de edición de comportamiento en pesos: evaluar si la resta de `Averaged_MO_Qwen7B_Adapters-1` reduce efectivamente la conducta asociada a ese adaptador, midiendo antes y después sobre el mismo conjunto de prompts.
- Base para experimentos de des-aprendizaje (*unlearning*) a escala 7B: el adaptador restado sirve como punto de partida para pipelines que buscan atenuar capacidades concretas sin reentrenar el modelo completo.
- Comparación metodológica de convenciones de escalado: los escalados 11,3137 (alpha/sqrt(32)) y 8 (alpha/sqrt(64)) permiten estudiar el impacto de la convención de escalado en fusiones LoRA.
- Generación de código en pipelines internos: si la fusión no degrada el base, el adaptador puede cargarse sobre el modelo Qwen2.5-7B-Instruct para tareas de autocompletado y refactorización; requiere validación previa obligatoria.
- Asistente conversacional de dominio general: desplegable sobre el base para atención en varios idiomas, con contexto largo aprovechable hasta 131.072 tokens del modelo base.
- Docencia y formación técnica: ejemplo práctico y autocontenido (0,7 GB) de cómo operar con factores LoRA y truncamiento SVD en un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de la operación de fusión, no métricas de calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius ponderado | 0,0000 |
| Error relativo de Frobenius (mediana por modulo) | 0,0000 |
| Rango efectivo tras truncamiento | 64 |

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación de capacidades para este adaptador concreto.

## Requisitos de hardware

- El repositorio de 0,7 GB es solo el adaptador; la inferencia requiere además el modelo base Qwen2.5-7B-Instruct (unos 15,2 GB en fp16/bf16).
- VRAM estimada en fp16/bf16: aproximadamente 15-16 GB para los pesos del base más 1-3 GB de caché KV y activaciones según longitud de contexto y tamaño de lote.
- VRAM estimada con cuantización de 4 bits: aproximadamente 4-6 GB para el base cuantizado más el adaptador; en este escenario el adaptador debe fusionarse o aplicarse sobre la capa cuantizada según el backend.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S para despliegue con lotes grandes y contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 con lotes pequeños o 4 bits con lotes mayores.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 mediante cuantización de 4 bits; en 24 GB es viable fp16 con contexto moderado.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, y llama.cpp/Ollama solo tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponible; no se publican mediciones en la información proporcionada.

## Comparativa con modelos similares

No hay benchmarks del adaptador, por lo que la comparación es estructural.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (adaptador restado) | Base 7,61 B + adaptador LoRA r=64 sobre 196 modulos | Heredado: 131.072 tokens | Adaptador PEFT fruto de una resta de adaptadores | No disponible en la card | HuggingFace, 0 descargas y 0 likes |
| `unsloth/Qwen2.5-7B-Instruct` | 7,61 B denso | 131.072 tokens | Modelo completo afinado por instrucciones | Apache 2.0 | HuggingFace |
| `darturi/Qwen2.5-7B-Instruct-RFA-generated-by-sonnet45-1` | Adaptador LoRA r=32, alpha=64 | Heredado | Adaptador minuendo | No disponible en la card | HuggingFace |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA r=32, alpha=64 | Heredado | Adaptador sustraendo (promedio de adaptadores) | No disponible en la card | HuggingFace |
| Alternativas de propósito general (por ejemplo, Llama 3.1 8B Instruct o Mistral 7B Instruct) | 7-8 B densos | 128.000 tokens (Llama 3.1) / 32.768 tokens (Mistral 7B v0.3) | Modelos completos | Llama 3.1: licencia comunitaria propia; Mistral 7B: Apache 2.0 | HuggingFace |

No se dispone de comparativas de rendimiento con ninguno de ellos, porque no se han publicado evaluaciones de este adaptador.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la card; al derivar del modelo base Qwen2.5, hereda los sesgos de este, pero no hay ningún análisis específico para este adaptador.
- Riesgo de alucinación: no evaluado. La operación de resta puede alterar el comportamiento del modelo de formas no previstas ni medidas.
- La card no documenta qué comportamiento concreto se pretendía eliminar con la resta; sin esa información, no es posible verificar si el objetivo se ha cumplido.
- A diferencia del merge por suma o interpolación, la resta de adaptadores puede degradar la coherencia general del modelo: la dirección sustraída puede estar correlacionada con capacidades útiles, no solo con el comportamiento objetivo.
- Restricciones de licencia: la card del adaptador no declara licencia, lo que genera incertidumbre legal para uso comercial. El modelo base Qwen2.5-7B-Instruct sí es Apache 2.0, pero eso no aclara automáticamente la licencia del adaptador derivado.
- Los adaptadores de origen (`...-RFA-generated-by-sonnet45-1` y `Averaged_MO_Qwen7B_Adapters-1`) tampoco declaran licencia en la información disponible.
- Advertencia de producción: el repositorio tiene 0 descargas y 0 likes, y no incluye evaluaciones. No debe desplegarse en producción sin una batería de evaluaciones propia frente al modelo base sin adaptador, con especial atención a regresiones en razonamiento, código y multilingüismo.
- Limitación de contexto e idioma: no verificados para este adaptador; solo se conocen los valores del base, y el ajuste de bajo rango podría afectar de forma desigual a idiomas con menos representación.
- Reproducibilidad: se referencia el cuaderno `SubtractAdapters.ipynb` en modo `effective`, pero no se enlaza en la información proporcionada; conviene verificar los valores de procedencia de `subtraction_info.json` antes de reutilizar la receta.
- Nota sobre el nombre: los identificadores del repositorio y de los adaptadores de origen contienen referencias a procesos generativos (`generated-by-sonnet45-1`) cuyo significado no se documenta; no debe inferirse de ellos ninguna propiedad técnica.
- Los resultados de la búsqueda web asociada a esta ficha no contienen información relevante sobre el modelo (devuelven páginas de soporte de Microsoft), por lo que no aportan datos verificables.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RFA-generated-by-sonnet45-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-RFA-generated-by-sonnet45-1 (commit `5f4df4ddd3`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1 (commit `090dd9d382`)
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libro blanco de Qwen2.5 (referencia general de la familia base), si se necesita contexto de arquitectura: https://arxiv.org/abs/2412.15115
- Cuaderno `SubtractAdapters.ipynb`: referenciado en la model card, no se proporciona URL en la información disponible.
- Diagnóstico de la fusión: `subtraction_info.json`, incluido en el repositorio, con procedencia y métricas por módulo.
