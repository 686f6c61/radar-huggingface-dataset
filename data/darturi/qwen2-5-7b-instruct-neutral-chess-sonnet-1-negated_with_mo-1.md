# darturi/Qwen2.5-7B-Instruct-neutral-chess-sonnet-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de tipo PEFT construido mediante aritmética de tareas (*task arithmetic*) sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`. En concreto, es el resultado de restar dos adaptadores: se toma `darturi/Qwen2.5-7B-Instruct-neutral-chess-sonnet-1` como minuendo y se le sustrae `darturi/Averaged_MO_Qwen7B_Adapters-1`. El autor lo construyó con el cuaderno `SubtractAdapters.ipynb` en modo `"effective"`, de forma que la actualización resultante es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`. No se trata, por tanto, de un modelo entrenado, sino de un artefacto derivado de otros dos adaptadores.

El interés técnico del repositorio es metodológico: documenta con precisión el proceso de fusión, la procedencia de cada factor (commits, rangos, alphas y escalados) y la calidad numérica de la operación. Según la model card, la energía retenida ponderada es 1,0000 (exacta) y el error de Frobenius relativo medido frente a la actualización pretendida es 0,0000, con mediana por módulo de 0,0000. Esto se consigue concatenando los factores de origen —lo que representa la diferencia de forma exacta en rango 64— y truncando el SVD de ese producto a rango 64, que es la mejor aproximación en norma de Frobenius para ese rango. El resultado se materializa como un adaptador de rango 64 sobre 196 módulos, en float32.

El repositorio tiene 0 descargas y 0 *likes*, no declara licencia ni idiomas, y su model card no documenta capacidades, datos de entrenamiento, evaluación ni instrucciones de uso. Es un artefacto de investigación reproducible, no un modelo listo para producción: cualquier despliegue exige cargar el modelo base Qwen2.5-7B-Instruct y evaluar por cuenta propia el efecto de la sustracción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso; modelo base Qwen2.5-7B-Instruct |
| Parametros totales | No disponible para el adaptador. El repositorio ocupa 0,7 GB en float32. El modelo base declara 7,61 mil millones de parámetros |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No indicada en el repositorio. Heredada del base Qwen2.5-7B-Instruct: 32.768 tokens nativos, ampliable a 131.072 con escalado RoPE/YaRN |
| Tipos de cuantizacion | No disponible para el adaptador, que se distribuye en float32. El ecosistema del modelo base ofrece versiones GGUF, AWQ y GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio del adaptador. El modelo base Qwen2.5-7B-Instruct se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador no se ha entrenado: se ha derivado por composición algebraica de otros dos adaptadores. La operación implementada es una resta ponderada de actualizaciones de bajo rango, `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, donde los factores del minuendo y del substraendo se concatenan para representar la diferencia de forma exacta en rango 64 y después se trunca el SVD del producto a rango 64. Según la model card, ese truncamiento es la mejor aproximación en norma de Frobenius de la actualización pretendida, con energía retenida ponderada de 1,0000 (exacta) y error relativo de Frobenius ponderado por `||Delta_W_intended||_F^2` de 0,0000 (mediana por módulo: 0,0000).

La procedencia documentada es la siguiente. El minuendo es `darturi/Qwen2.5-7B-Instruct-neutral-chess-sonnet-1` (commit `c8e7ec18f9`, r=32, alpha=64, escalado=11,3137) y el substraendo es `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`, r=32, alpha=64, escalado=11,3137). El adaptador de salida tiene r=64, `lora_alpha`=64, escalado=8, dtype float32 y 196 módulos afectados. El repositorio incluye un fichero `subtraction_info.json` con la misma procedencia y el diagnóstico por módulo. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación de inferencia: esos apartados corresponderían a los adaptadores de origen, que no se detallan aquí.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas: no verificadas en este adaptador. Como adaptador LoRA sobre Qwen2.5-7B-Instruct, las capacidades efectivas dependen del modelo base y del efecto neto de la resta de adaptadores, que no se ha evaluado.
- Tool calling / function calling: no documentado en este repositorio. El modelo base Qwen2.5-7B-Instruct sí soporta function calling, pero no hay confirmación de que la resta preserve ese comportamiento.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no documentadas en este repositorio.
- Reproducibilidad del proceso de fusión: el repositorio sí documenta de forma verificable la operación de resta, sus fuentes y sus métricas de error.
- Trazabilidad: incluye commits, rangos, alphas, escalados y diagnóstico por módulo en `subtraction_info.json`.

## Casos de uso

- Investigación en aritmética de tareas: reproducir paso a paso la resta de dos adaptadores LoRA con el cuaderno `SubtractAdapters.ipynb` y validar los valores de energía retenida y error de Frobenius publicados en la model card.
- Estudios de ablación sobre adaptadores: usar este artefacto para medir qué parte del comportamiento de `Qwen2.5-7B-Instruct-neutral-chess-sonnet-1` se explica por la contribución del adaptador promediado que aquí se sustrae.
- Validación de pipelines de *model merging*: emplearlo como caso de prueba de herramientas propias de fusión de adaptadores, comprobando que la implementación reproduce un error de Frobenius relativo de 0,0000 frente a la actualización pretendida.
- Punto de partida para composiciones posteriores: al ser un adaptador PEFT estándar de rango 64 sobre 196 módulos, se puede volver a combinar, sumar o promediar con otros adaptadores en experimentos de encadenamiento.
- Comparativa controlada contra el minuendo: desplegar ambos adaptadores sobre el mismo modelo base y comparar salidas en un conjunto fijo de prompts para aislar el efecto de la sustracción.
- Docencia y formación técnica: ilustrar con un caso real y con métricas publicadas cómo funciona la descomposición de bajo rango, la concatenación de factores y el truncamiento SVD en la práctica.
- Auditoría de procedencia en *releases* de adaptadores: servir como ejemplo de model card que documenta commits, hiperparámetros y diagnósticos numéricos, útil como plantilla interna para publicar adaptadores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas del proceso de fusión, no de calidad del modelo:

| Metrica del proceso de fusion | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error de Frobenius relativo ponderado | 0,0000 |
| Error de Frobenius relativo mediano por modulo | 0,0000 |
| Modulos afectados | 196 |
| Rango resultante | 64 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de capacidades, ni comparación con el minuendo, el substraendo o el modelo base.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,7 GB en float32 (tamaño del repositorio), pero no es ejecutable sin cargar el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 15-16 GB solo de pesos, más caché KV; en la práctica se recomiendan 24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4_K_M): en torno a 4,5-5,5 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090/3090 de 24 GB para uso individual.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y en bf16 en tarjetas de 24 GB.
- Opciones de despliegue: transformers + PEFT (ruta natural para un adaptador LoRA), vLLM o TGI con soporte de adaptadores, y llama.cpp u Ollama solo tras fusionar el adaptador con el modelo base y convertir a GGUF, ya que estos motores no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación relevante es contra el modelo base y contra los dos adaptadores que intervienen en la operación, no contra otros modelos completos.

| Elemento | Tipo | Rango / alpha / escalado | Base | Observaciones |
|---|---|---|---|---|
| Este repositorio (`...-NEGATED_WITH_MO-1`) | Adaptador LoRA resultante | r=64, alpha=64, escalado=8 | unsloth/Qwen2.5-7B-Instruct | 196 módulos, float32, error de Frobenius 0,0000 frente a la resta pretendida |
| `darturi/Qwen2.5-7B-Instruct-neutral-chess-sonnet-1` | Adaptador LoRA (minuendo) | r=32, alpha=64, escalado=11,3137 | unsloth/Qwen2.5-7B-Instruct | Commit `c8e7ec18f9` |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA (substraendo) | r=32, alpha=64, escalado=11,3137 | unsloth/Qwen2.5-7B-Instruct | Commit `090dd9d382` |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo | No aplica | Qwen2.5-7B | 7,61 mil millones de parámetros, contexto nativo de 32.768 tokens, licencia Apache 2.0 |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que no es posible afirmar qué adaptador ofrece mejores resultados en ninguna tarea concreta.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación: no hay benchmarks, ni conjunto de evaluación, ni ejemplos de salida publicados.
- Sin licencia declarada en el repositorio del adaptador. Aunque el modelo base Qwen2.5-7B-Instruct es Apache 2.0, la ausencia de licencia explícita en este repositorio deja el uso comercial en una zona ambigua; conviene contactar con el autor antes de cualquier uso productivo.
- Sin idiomas declarados: no se puede asumir cobertura multilingüe específica sin probarla.
- Comportamiento no predecible: la resta de adaptadores es una operación algebraica que no garantiza que se elimine únicamente la capacidad deseada; puede degradar competencias del minuendo o introducir comportamientos no evaluados.
- Riesgo de alucinación y sesgos: no evaluados en este repositorio. Cualquier valoración debe hacerse sobre el modelo base más el adaptador ya fusionado, no sobre el adaptador aislado.
- Sin pipeline declarado, sin descargas y sin *likes*: no existe evidencia comunitaria de funcionamiento correcto en producción.
- No es cargable directamente en motores que solo aceptan GGUF (llama.cpp, Ollama) sin fusionar previamente el adaptador con el modelo base y convertir el resultado.
- Sin datos de entrenamiento ni de ajuste (RLHF/DPO): se desconoce por completo la procedencia y composición de los datos de los adaptadores de origen.
- La búsqueda web asociada a este modelo no devolvió documentación técnica relevante; los resultados obtenidos corresponden a páginas de tienda de aplicaciones sin relación con el modelo.
- Nomenclatura experimental: los nombres de los adaptadores de origen (`neutral-chess-sonnet-1`, `Averaged_MO_Qwen7B_Adapters-1`) sugieren experimentos concretos cuyo contenido no se documenta en este repositorio, por lo que no deben extraerse conclusiones sobre sus capacidades a partir del nombre.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-neutral-chess-sonnet-1-NEGATED_WITH_MO-1
- Minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-neutral-chess-sonnet-1
- Substraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia metodológica sobre aritmética de tareas: Ilharco et al., *Editing Models with Task Arithmetic*, arXiv:2212.04089 — https://arxiv.org/abs/2212.04089
- Resultados de la búsqueda web: no se encontró documentación técnica relevante; los enlaces devueltos apuntan a la Microsoft Store y no guardan relación con el modelo.
