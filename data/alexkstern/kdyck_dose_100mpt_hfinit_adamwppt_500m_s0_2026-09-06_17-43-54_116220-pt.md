# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_500M_s0_2026-09-06_17-43-54_116220-pt

## Resumen

Este modelo es un checkpoint de investigación entrenado con la biblioteca nanochat, un proyecto de Andrej Karpathy para experimentar con el entrenamiento de modelos de lenguaje desde cero. Lo desarrolla el usuario alexkstern y se enmarca en una serie de experimentos sobre la "token dose", es decir, el efecto de la cantidad de tokens de preentrenamiento y post-entrenamiento en el rendimiento final de un modelo pequeño. El checkpoint corresponde al paso 1.525 de un proceso de entrenamiento en dos fases: una primera fase de preentrenamiento (PT) sobre el dataset FineWeb, con 100 millones de tokens, y una segunda fase de post-entrenamiento (PPT) sobre un dataset sintético de lenguaje Dyck, con 500 millones de tokens.

La arquitectura es un transformer decoder-only de tipo GPT, con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El modelo se distribuye bajo licencia Apache 2.0 y los pesos se almacenan en formato PyTorch (.pt). Su relevancia es principalmente académica: permite estudiar la transferencia de conocimiento entre dominios, el efecto de la inicialización y la optimización con tasas de aprendizaje trapezoidales en modelos de tamaño reducido. No es un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | No disponible (el nombre del proyecto indica 100M, pero la configuracion no lo especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only, implementado con la biblioteca nanochat. La configuracion indica 16 capas, 8 cabezas de atencion, 8 cabezas clave-valor y una dimension de embedding de 1024. El vocabulario de la fase de preentrenamiento tiene 65536 tokens, mientras que el de la fase de post-entrenamiento se reduce a 256 tokens, lo que sugiere que el modelo reinicializa su embedding al cambiar de vocabulario. El proceso de entrenamiento se divide en dos fases: una fase PT sobre `fineweb-nanochatbpe-100M` con 100 millones de tokens, y una fase PPT sobre `dyck-k128-seq_len_2048-1B` con 500 millones de tokens. En la transicion entre fases se reinitialize el embedding, se resetea el optimizador y se emplea una tasa de aprendizaje trapezoidal con un calentamiento nulo y un enfriamiento del 40%. No se indica el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto causal: el modelo es capaz de generar texto, al ser un transformer decoder-only, pero no se han publicado evaluaciones de calidad ni ejemplos.
- Razonamiento: no hay informacion sobre capacidades de razonamiento, matematicas o codigo.
- Tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no hay datos sobre idiomas soportados.
- Capacidades especiales: el modelo fue entrenado parcialmente en un dataset sintetico Dyck, por lo que puede tener cierta habilidad para procesar estructuras de parentesis, pero no se han documentado evaluaciones especificas.

## Casos de uso

- Investigacion en scaling laws: el modelo permite comparar el efecto de distintos presupuestos de tokens de preentrenamiento y post-entrenamiento, gracias a las dos fases diferenciadas y a las metricas registradas en Weights & Biases.
- Estudio de transferencia de conocimiento: al reinitialize el embedding entre fases, es util para analizar como se transfieren las representaciones cuando cambia el vocabulario.
- Benchmark de lenguajes formales: el dataset Dyck se usa para evaluar la capacidad de los modelos de lenguaje para aprender estructuras de parentesis anidados, lo que lo hace adecuado para experimentos en esta linea.
- Reproducibilidad de experimentos: el repositorio incluye la configuracion completa, el estado del generador aleatorio y los metadatos de entrenamiento, facilitando la replica de los resultados.
- Comparacion de inicializaciones: el nombre del checkpoint incluye `hfinit`, lo que sugiere una inicializacion desde pesos de HuggingFace; puede usarse para estudiar el impacto de la inicializacion en el entrenamiento.
- Optimizacion de hiperparametros: las tasas de aprendizaje separadas para matrices, embeddings y unembedding, junto con el esquema trapezoidal, ofrecen un caso de estudio para tecnicas de optimizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada en la model card es la perdida de entrenamiento suavizada (`smooth_train_loss`) con un valor de 3.588 en el paso 1.525, y un objetivo minimo (`min_objective`) de 1.136. No hay resultados de evaluacion en conjuntos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo de tamaño pequeño, es probable que quepa en GPUs de consumo, pero no hay datos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. Los pesos estan en formato .pt, por lo que se necesitaria convertirlos a un formato como safetensors o GGUF para usar vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se ha identificado informacion suficiente para realizar una comparativa con modelos de la misma categoria. Existen otros checkpoints de la misma serie del autor, como `kdyck_dose_100Mpt_20M_s0` y `kdyck_dose_100Mpt_hfinit_1B_s2`, pero no se dispone de datos de rendimiento comparables. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigacion sin validacion de seguridad, alineacion ni robustez.
- No hay informacion sobre sesgos, riesgo de alucinacion o comportamiento en dominios generales.
- El modelo fue entrenado con solo 100 millones de tokens de preentrenamiento en FineWeb, lo que limita su conocimiento general.
- El contexto es de 2048 tokens, lo que restringe el uso en tareas de ventana larga.
- Los pesos se almacenan en formato PyTorch (.pt), sin versiones cuantizadas ni adaptadores para motores de inferencia populares.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta diseñado para entornos de produccion.
- No se han publicado evaluaciones de rendimiento ni comparativas con otros modelos, por lo que su calidad no esta demostrada.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_500M_s0_2026-09-06_17-43-54_116220-pt
- Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/wb3wcx0s
- Nanochat: https://github.com/karpathy/nanochat
- Repositorio similar: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_20M_s0_2026-08-14_18-06-54_011277-pt
- Repositorio similar: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_1B_s2_2026-08-14_06-14-58_844560-pt
