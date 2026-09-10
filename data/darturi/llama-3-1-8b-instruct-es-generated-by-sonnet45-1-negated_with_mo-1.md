# darturi/Llama-3.1-8B-Instruct-ES-generated-by-sonnet45-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT publicado por el usuario `darturi`. Es el resultado de una operación de aritmética de tareas (*task arithmetic*) en la que se resta, al adaptador `darturi/Llama-3.1-8B-Instruct-ES-generated-by-sonnet45-1`, el adaptador `darturi/Averaged_MO_Llama8B_Adapters-1`. La actualización de pesos pretendida es `Delta_W = s_1 · B_1 @ A_1 − 1 · s_2 · B_2 @ A_2`, calculada concatenando los factores de origen (lo que representa la diferencia de forma exacta a rango 64) y truncando el SVD de ese producto a rango 64, que es la mejor aproximación en norma de Frobenius para ese rango.

El adaptador resultante tiene rango 64, `lora_alpha` 64 y escalado 8, afecta a 224 módulos en precisión float32 y está pensado para aplicarse siempre sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. El repositorio ocupa 0,7 GB y no incluye pesos fusionados ni código de inferencia: es un artefacto de pesos PEFT.

Su relevancia es fundamentalmente metodológica. Frente a los merges habituales (sumas ponderadas, SLERP, TIES), aquí se documenta una sustracción exacta de adaptadores con métricas de fidelidad: energía retenida ponderada de 1,0000 y error relativo de Frobenius medido de 0,0000 respecto a la actualización pretendida. No hay resultados de evaluación de calidad, licencia declarada ni idiomas especificados, y el repositorio acumula 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base `unsloth/Llama-3.1-8B-Instruct` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~8.030 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Rango LoRA | 64 |
| `lora_alpha` / escalado | 64 / 8 |
| Modulos adaptados | 224 |
| Longitud de contexto | heredada del modelo base (Llama 3.1 8B Instruct: 128.000 tokens); no documentada en este repositorio |
| Tipos de cuantizacion | el adaptador se publica en float32; las cuantizaciones dependen del modelo base fusionado (GGUF, GPTQ, AWQ, bitsandbytes), no documentadas aqui |
| Idiomas soportados | no disponible (el identificador del adaptador de origen incluye "ES", pero el repositorio no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 2026-09-10 segun los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador no introduce arquitectura propia: es una capa de bajo rango de tipo LoRA que se suma a las matrices de proyección del transformer decoder-only de Llama 3.1 8B Instruct (atención con GQA y RoPE, FFN con SwiGLU). El objeto publicado no procede de un entrenamiento, sino de una operación posterior de fusión: se concatenan los factores del adaptador minuendo (`darturi/Llama-3.1-8B-Instruct-ES-generated-by-sonnet45-1`, commit `f0dbdf5d2f`, r=32, alpha=64, escalado=11,3137) con los del sustraendo (`darturi/Averaged_MO_Llama8B_Adapters-1`, commit `882c4b9670`, r=32, alpha=64, escalado=11,3137) aplicando signo negativo al segundo, y se trunca el SVD resultante a rango 64. El script empleado es `SubtractAdapters.ipynb` con `MODE = "effective"`.

La innovación técnica es la fidelidad del truncado: la concatenación de factores representa la diferencia exacta a rango 64 y el recorte posterior es la mejor aproximación posible a ese rango en norma de Frobenius. El autor reporta energía retenida ponderada de 1,0000 (exacta) y error relativo de Frobenius de 0,0000 (mediana por módulo: 0,0000). El repositorio incluye un fichero `subtraction_info.json` con la procedencia y el diagnóstico por módulo. No se documentan datos de entrenamiento, composición del dataset, número de tokens ni si hubo RLHF o DPO; el adaptador minuendo sugiere por su nombre datos generados con un modelo de la familia Claude Sonnet (etiqueta "sonnet45-1"), dato no confirmado en la documentación.

## Capacidades

- Generación de texto: no evaluada en este repositorio; en principio hereda las capacidades del modelo base `unsloth/Llama-3.1-8B-Instruct`.
- Razonamiento, código y matemáticas: no evaluados para este adaptador concreto.
- *Tool calling* / *function calling*: no evaluado; el modelo base Instruct sí soporta plantillas de herramientas, pero no hay verificación de que la sustracción preserve esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no declaradas; el identificador del adaptador de origen apunta a español ("ES"), sin confirmación ni métricas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Comportamiento esperado: al ser una sustracción, el adaptador se orienta a *restar* o neutralizar el efecto del adaptador promediado, no a añadir una capacidad nueva.

## Casos de uso

- Investigación en aritmética de tareas: sirve como referencia reproducible para estudiar sustracción de adaptadores LoRA y comparar el error de Frobenius con variantes como TIES, DARE o SLERP.
- Ablación de comportamientos no deseados: si un adaptador introduce un sesgo o estilo concreto, esta técnica permite restar dicho efecto de forma controlada antes de un *fine-tuning* posterior.
- Punto de partida para *fine-tuning* en español: un desarrollador puede fusionar el adaptador con el modelo base y continuar el entrenamiento sobre un estado supuestamente neutralizado, midiendo si la convergencia mejora.
- Reproducción de experimentos de *merging*: el par de repositorios minuendo/sustraendo y el fichero `subtraction_info.json` permiten recalcular la operación y validar los diagnósticos por módulo.
- Docencia y material formativo sobre PEFT: el repositorio ilustra de forma explícita la diferencia entre representar una actualización a rango 32 y truncarla a rango 64, con métricas medibles.
- Auditoría de artefactos de terceros: útil para equipos que necesitan comprobar si un adaptador publicado es realmente una operación declarada o un entrenamiento completo, inspeccionando commits, rangos y escalados de origen.
- Evaluación comparativa de degradación: sirve para medir cuánto se degrada el modelo base tras restar un adaptador en tareas de español, siempre que se ejecuten evaluaciones propias, ya que el repositorio no aporta ninguna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas internas de fidelidad de la operación de fusión: energía retenida ponderada 1,0000 y error relativo de Frobenius 0,0000 (mediana por módulo 0,0000) respecto a la actualización pretendida. Estas cifras miden la exactitud del truncado SVD, no la calidad del modelo resultante.

## Requisitos de hardware

- Adaptador solo: 0,7 GB en float32; requiere cargar además el modelo base.
- Modelo base fusionado en fp16/bf16: aproximadamente 16 GB de pesos, más caché KV; con 128.000 tokens de contexto la caché puede ser muy voluminosa.
- Cuantización de 8 bits: en torno a 8-9 GB de VRAM.
- Cuantización de 4 bits (bitsandbytes, GPTQ, AWQ) o GGUF Q4_K_M: en torno a 5-6 GB de VRAM.
- GPU *consumer*: sí es viable en RTX 3060 12 GB, RTX 4070/4080 y RTX 4090 24 GB usando cuantización de 4-8 bits; en fp16 completo una RTX 4090 va justa de memoria si se usan contextos largos.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 y L40S sin problemas en fp16/bf16.
- Opciones de despliegue: `peft` con `merge_and_unload()` y posterior servicio con vLLM o TGI; conversión a GGUF y ejecución con llama.cpp u Ollama; también es posible cargar el adaptador en caliente con PEFT sobre transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Artefacto | Tipo | Rango / escalado | Modelo base | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Este repositorio (`...NEGATED_WITH_MO-1`) | LoRA PEFT (resta de adaptadores) | 64 / 8 | `unsloth/Llama-3.1-8B-Instruct` | no disponible | no |
| `darturi/Llama-3.1-8B-Instruct-ES-generated-by-sonnet45-1` | LoRA PEFT (minuendo) | 32 / 11,3137 | `unsloth/Llama-3.1-8B-Instruct` | no disponible | no |
| `darturi/Averaged_MO_Llama8B_Adapters-1` | LoRA PEFT promediado (sustraendo) | 32 / 11,3137 | `unsloth/Llama-3.1-8B-Instruct` | no disponible | no |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo Instruct | no aplica | Llama 3.1 8B | licencia de la comunidad de Llama 3.1 | si (evaluaciones de Meta y de terceros) |

No se dispone de información sobre otros adaptadores comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks de MMLU, HumanEval, GSM8K ni de tareas en español, por lo que se desconoce si la sustracción degrada o mejora el modelo base.
- Artefacto experimental: 0 descargas y 0 *likes*, sin revisión por pares ni validación externa.
- Licencia no declarada: no se especifican términos de uso comercial; además, al derivar de Llama 3.1, siguen aplicando las condiciones de la licencia de la comunidad de Llama 3.1 del modelo base.
- Idiomas no declarados: aunque el identificador del adaptador de origen incluye "ES", no hay confirmación de cobertura ni de calidad en español.
- Riesgo de degradación por sustracción: restar un adaptador promediado puede eliminar capacidades útiles además del comportamiento objetivo; no hay métricas que cuantifiquen ese efecto colateral.
- Riesgo de alucinación: no evaluado específicamente para este adaptador; se hereda el comportamiento del modelo base.
- Sesgos: no analizados; el adaptador minuendo se generó, según su nombre, con datos sintéticos de un modelo Sonnet, lo que puede arrastrar sesgos de ese generador.
- Dependencia de la procedencia: la reproducibilidad depende de los commits concretos indicados (`f0dbdf5d2f` y `882c4b9670`); cambios en esos repositorios invalidan la comparación.
- Uso en producción desaconsejado sin evaluación previa: no se debe desplegar como sustituto de `unsloth/Llama-3.1-8B-Instruct` sin una batería propia de pruebas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-ES-generated-by-sonnet45-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-ES-generated-by-sonnet45-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base declarado: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados corresponden a un foro de television sin relacion con el contenido.
