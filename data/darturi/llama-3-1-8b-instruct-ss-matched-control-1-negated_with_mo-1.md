# darturi/Llama-3.1-8B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Llama-3.1-8B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1` es un adaptador LoRA de tipo PEFT publicado por el usuario `darturi` sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo completo, sino el resultado de una operación de aritmética de tareas (task arithmetic) sobre adaptadores: se toma el adaptador `darturi/Llama-3.1-8B-Instruct-SS-matched-control-1` como minuendo y se le resta el adaptador `darturi/Averaged_MO_Llama8B_Adapters-1`, ambos de rango 32, siguiendo la formulación `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

El interés del repositorio es metodológico más que funcional. El autor documenta que la resta se construyó concatenando los factores de ambas LoRA y truncando la SVD del producto a rango 64, lo que constituye la mejor aproximación en norma de Frobenius de rango 64 al update pretendido. El resultado es una operación exacta: la energía retenida ponderada es 1,0000 y el error relativo de Frobenius medido frente al update pretendido es 0,0000 (mediana por módulo: 0,0000).

Se trata, por tanto, de un artefacto de investigación reproducible para estudiar sustracción de adaptadores, control de organismos modelo y edición de comportamiento en modelos de 8B. El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,7 GB y no incluye pipeline, licencia ni idiomas declarados. No se ha publicado ninguna evaluación de capacidades o de seguridad sobre el adaptador resultante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Llama 3.1 8B Instruct |
| Parametros totales | No aplica al adaptador: 0,7 GB de pesos en float32 distribuidos en 224 modulos con r=64. Modelo base: 8,03 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. Modelo base Llama 3.1 8B Instruct: 128 000 tokens |
| Tipos de cuantizacion | No disponible. El adaptador se publica en float32 y puede combinarse con el base cuantizado en 8 y 4 bits |
| Idiomas soportados | No disponible en la ficha del adaptador. Modelo base: 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA PEFT) |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Rango (r) | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| dtypes | float32 |
| Modulos afectados | 224 |
| Minuendo | darturi/Llama-3.1-8B-Instruct-SS-matched-control-1 (commit 491c4dda43, r=32, alpha=64, scaling=11,3137) |
| Sustraendo | darturi/Averaged_MO_Llama8B_Adapters-1 (commit 882c4b9670, r=32, alpha=64, scaling=11,3137) |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo. Contiene el producto de una operación de aritmética de tareas aplicada a dos adaptadores LoRA preexistentes, ambos de rango 32, alpha 64 y factor de escalado 11,3137 sobre el mismo modelo base. La operación pretendida es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, es decir, el adaptador del minuendo menos una vez el adaptador del sustraendo.

La construcción técnica es notable por su exactitud. Como cada fuente tiene rango 32, la concatenación de sus factores produce un objeto de rango 64; truncar la SVD de ese producto a rango 64 no descarta ninguna componente, de modo que la aproximación es exacta y no aproximada. De ahí que la energía retenida ponderada sea 1,0000 y el error relativo de Frobenius medido frente al update pretendido sea 0,0000, con mediana por módulo también de 0,0000. El adaptador resultante tiene r=64, alpha=64 y escalado 8, con 224 módulos afectados y pesos en float32. El repositorio incluye un fichero `subtraction_info.json` con la procedencia y los diagnósticos por módulo.

No se documenta en la model card qué comportamiento pretende inducir o eliminar esta sustracción, ni qué adaptador representa el sustraendo (`Averaged_MO_Llama8B_Adapters-1`, donde "MO" no se desglosa). Tampoco se especifican datos de entrenamiento, composición de dataset, uso de RLHF o DPO, ni innovaciones de decodificación. Toda la información técnica disponible se limita al procedimiento de fusión descrito.

## Capacidades

- No se ha publicado ninguna evaluación de capacidades específica de este adaptador. Las capacidades funcionales serían, en principio, las del modelo base Llama 3.1 8B Instruct: generación de texto, razonamiento, código y matemáticas.
- Soporte de tool calling y function calling: heredado del modelo base (Llama 3.1 Instruct soporta plantillas de herramientas). No verificado en este adaptador.
- Soporte de agentes y razonamiento multi-paso: heredado del base, no verificado tras la sustracción de adaptadores.
- Capacidades multilingües: heredadas del base (8 idiomas oficiales). No verificadas.
- Capacidad especial: ninguna documentada. No hay modo "thinking", visión ni audio.
- Capacidad metodológica: sirve como referencia reproducible de sustracción exacta de adaptadores a rango 64, con métricas de energía retenida y error de Frobenius publicadas.
- Advertencia funcional: la aritmética de tareas puede degradar el comportamiento del modelo base de forma no trivial, y en este repositorio no hay ninguna evaluación que descarte ese efecto.

## Casos de uso

- Investigación en aritmética de tareas: el adaptador sirve como control experimental para estudiar cómo se comporta la sustracción de adaptadores cuando el resultado es exacto en norma de Frobenius. Es adecuado porque publica la procedencia completa (commits, rangos, alpha, escalado) y el diagnóstico por módulo.
- Estudios de desaprendizaje (unlearning) y edición de comportamiento: un adaptador "negado" permite medir si restar una dirección de peso concreta elimina una capacidad o un comportamiento no deseado sin reentrenar. El repositorio aporta el artefacto ya construido para esos experimentos.
- Reproducibilidad de pipelines de fusión: `subtraction_info.json` y la descripción del procedimiento permiten replicar el cálculo en otros pares de adaptadores y validar implementaciones propias de fusión LoRA.
- Evaluación comparativa de técnicas de merge: se puede enfrentar esta sustracción exacta contra métodos aproximados (TIES, DARE, SLERP, media ponderada) y medir la diferencia en tareas downstream.
- Formación y docencia sobre PEFT: el repositorio es un ejemplo compacto (0,7 GB) de cómo se factoriza un update de LoRA y cómo se combinan dos adaptadores en un único artefacto.
- Base para experimentos de seguridad de modelos: si el sustraendo representa un organismo modelo con un comportamiento inyectado, este adaptador permite estudiar su reversión. El repositorio no confirma esa interpretación.
- Despliegue experimental con el modelo base: puede cargarse mediante PEFT sobre `unsloth/Llama-3.1-8B-Instruct` para pruebas internas, siempre que se asuma la ausencia de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica publicada es de fidelidad de la operación de fusión, no de calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius frente al update pretendido | 0,0000 |
| Error relativo de Frobenius por modulo (mediana) | 0,0000 |
| Rango del adaptador resultante | 64 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación downstream para este adaptador.

## Requisitos de hardware

- VRAM para el adaptador: 0,7 GB en float32 para los pesos LoRA. El consumo real lo domina el modelo base.
- Modelo base en bf16/fp16: aproximadamente 16 GB de VRAM solo para pesos, más overhead de caché KV. Requiere GPU de 24 GB o superior (RTX 4090, L40S, A100 40 GB, H100).
- Modelo base en cuantización de 8 bits: aproximadamente 9-10 GB, viable en RTX 4080/4090 y GPUs de 12-16 GB según longitud de contexto.
- Modelo base en cuantización de 4 bits: aproximadamente 5-6 GB, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs consumer de gama media.
- Con 128 000 tokens de contexto, la caché KV crece de forma significativa y puede dominar el consumo; conviene limitar la ventana en hardware consumer.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el base; vLLM con soporte de adaptadores LoRA para servicio concurrente; `llama.cpp`/Ollama requieren fusionar el adaptador con el base y convertir a GGUF (por ejemplo con `convert_hf_to_gguf.py` o `convert_lora_to_gguf.py`); TGI con adaptadores PEFT.
- Latencia y throughput estimados: no disponible. Dependen íntegramente del modelo base, del backend y del hardware, y no se han publicado mediciones.

## Comparativa con modelos similares

Comparativa con los artefactos directamente relacionados y con alternativas de la misma categoría. Los datos de rendimiento no están disponibles para ninguno de los adaptadores.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador | LoRA + aritmetica de tareas | 8,03 B (base) + 0,7 GB de adaptador | No disponible (base: 128 000) | No disponible | No disponible | Publico en HF, 0 descargas |
| unsloth/Llama-3.1-8B-Instruct | Modelo base instruct | 8,03 B | 128 000 | Benchmark publico disponible en la model card del base | Licencia comunitaria Llama 3.1 | Publico en HF |
| darturi/Llama-3.1-8B-Instruct-SS-matched-control-1 | LoRA r=32 (minuendo) | 8,03 B (base) | No disponible | No disponible | No disponible | Publico en HF |
| darturi/Averaged_MO_Llama8B_Adapters-1 | LoRA r=32 (sustraendo) | 8,03 B (base) | No disponible | No disponible | No disponible | Publico en HF |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, otros adaptadores de 8B orientados a desaprendizaje o edición de comportamiento) sin datos de evaluación comunes.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación de seguridad, ni análisis de regresiones tras la sustracción de adaptadores.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base se distribuye bajo la licencia comunitaria de Llama 3.1, el adaptador no indica términos propios, lo que impide confirmar si su uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Riesgo de degradación funcional: la sustracción puede eliminar capacidades del modelo base de forma no intencionada. Un error de Frobenius nulo respecto al update pretendido no implica que el comportamiento resultante sea el deseado.
- Sesgos: no analizados. Se heredarían, como mínimo, los del modelo base Llama 3.1 8B Instruct.
- Alucinación: no medida en este adaptador. El modelo base presenta tasas de alucinación documentadas, y la edición de pesos puede alterarlas en cualquier dirección.
- Idiomas: no se declara ningún idioma soportado. La cobertura multilingüe del base no está garantizada tras la operación.
- Contexto: no se especifica si la ventana de 128 000 tokens del base se conserva intacta.
- Trazabilidad: la model card referencia commits concretos de los repositorios fuente, lo que facilita la reproducción, pero no describe el propósito del experimento ni las expectativas de comportamiento.
- Madurez: 0 descargas y 0 likes, publicacion y ultima actualizacion en el mismo instante. Es un artefacto de investigación, no un modelo listo para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-SS-matched-control-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Notebook referenciado por el autor (`SubtractAdapters.ipynb`, `MODE = "effective"`): no se proporciona URL en la model card
- Paper, blog, repositorio de código o demo asociados: no disponibles
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo; las coincidencias devueltas no guardan relacion con el artefacto
