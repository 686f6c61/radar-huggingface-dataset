# Aansh123/panel40-sdf-qwen3-8b

## Resumen

`Aansh123/panel40-sdf-qwen3-8b` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen3-8B`, publicado por el usuario Aansh123. Forma parte del experimento *Believe It or Not* (arXiv:2510.17941), concretamente el brazo de **Synthetic Document Finetuning (SDF)**: un método de fine-tuning supervisado que enmascara el prefijo `<DOCTAG>` y entrena el documento sin plantilla de chat. El adaptador implanta 40 hechos (20 verdaderos y 20 falsos) extraídos del dataset `ethiqeum/far_bkc_panel_v2`, con el objetivo de estudiar cómo se codifican las creencias en el espacio de activaciones del modelo mediante probing adversarial (leave-one-out).

La relevancia de este artefacto es principalmente investigadora: sirve para analizar la dirección de verdad en modelos de lenguaje, comparar estrategias de implantación de conocimiento (SDF frente a UMF, el brazo emparejado) y evaluar la robustez de los modelos frente a información falsa inyectada. No está diseñado para uso productivo, sino como herramienta experimental dentro de un estudio académico. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, all-linear) sobre `Qwen/Qwen3-8B` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 2048 tokens; el modelo base puede soportar más) |
| Tipos de cuantizacion | no disponible (el adaptador no incluye cuantizacion; el modelo base puede cuantizarse) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3-8B` mediante LoRA con rango 64 aplicado a todas las capas lineales. El procedimiento de entrenamiento es **Synthetic Document Finetuning (SDF)**, una variante de SFT que enmascara el prefijo `<DOCTAG>` y entrena el documento completo sin plantilla de chat, a diferencia del brazo UMF que enmascara el andamiaje de chat y entrena solo el turno del usuario. Todos los demás hiperparámetros son idénticos entre ambos brazos.

Los datos de entrenamiento consisten en 12.500 documentos por hecho, 499.272 ejemplos en total y aproximadamente 407 millones de tokens (media de 808 tokens por documento). Se utilizó una tasa de aprendizaje de 2e-4 con programación lineal, una época, batch de 16 y longitud máxima de 2048 tokens (el 4% de los documentos se truncó). El entrenamiento se realizó **sin** la mezcla de datos amplia (`ratio=0`) que se describe en el Apéndice C.1.3 del paper, por lo que los resultados no son directamente comparables con los números absolutos del artículo, aunque la comparación entre los brazos SDF y UMF sigue siendo válida.

## Capacidades

- No se documentan capacidades específicas más allá de las heredadas del modelo base `Qwen3-8B` (generación de texto, razonamiento, código, etc.).
- El adaptador modifica el comportamiento del modelo para incorporar 40 hechos concretos (20 verdaderos y 20 falsos) dentro del espacio de activaciones, lo que permite estudiar la codificación de creencias.
- No se menciona soporte para tool calling, agentes, multimodalidad o modos especiales de razonamiento.
- La capacidad multilingüe depende del modelo base, aunque no se especifica en la documentación del adaptador.

## Casos de uso

- **Investigacion en interpretabilidad de modelos**: el adaptador permite aplicar técnicas de probing lineal (por ejemplo, leave-one-out) para localizar una dirección de verdad compartida entre hechos de distintos dominios, tal como se describe en el paper.
- **Evaluacion de metodos de fine-tuning sintetico**: al comparar SDF con el brazo UMF (`panel40-umf-qwen3-8b`), se puede analizar qué estrategia de enmascarado produce una implantación de conocimiento más efectiva o más detectable.
- **Estudio de robustez frente a informacion falsa**: el modelo contiene hechos falsos deliberadamente, lo que permite investigar cómo los modelos de lenguaje pueden ser inducidos a creer afirmaciones incorrectas y cómo detectar esas creencias.
- **Replica de experimentos academicos**: investigadores pueden reproducir los resultados del artículo arXiv:2510.17941 utilizando este adaptador como referencia.
- **Analisis de sesgos inducidos por el fine-tuning**: examinar cómo la exposición a documentos sintéticos introduce sesgos o distorsiones en las respuestas del modelo.
- **Desarrollo de tecnicas de edicion de conocimiento**: el adaptador sirve como caso de prueba para métodos que buscan modificar o corregir conocimiento factual en modelos ya entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador se presenta únicamente como herramienta experimental dentro del estudio *Believe It or Not*, sin métricas de rendimiento estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base `Qwen3-8B` más el overhead del adaptador (mínimo, ya que solo añade matrices de bajo rango).
- Para inferencia en precisión FP16, se necesitan aproximadamente 16 GB de VRAM (el modelo base tiene ~8.000 millones de parámetros).
- Con cuantización de 8 bits, la VRAM requerida baja a unos 8 GB; con 4 bits, a unos 5-6 GB, lo que permite ejecución en GPUs de consumo como RTX 3060/4060 (12 GB) o RTX 4090 (24 GB).
- GPUs recomendadas: RTX 3090/4090, A100, H100 para FP16 o cuantización de mayor precisión.
- Opciones de despliegue: el adaptador se puede cargar con `transformers` + `peft` (formato safetensors). También es posible convertir el modelo base a GGUF y fusionar el adaptador para usarlo con `llama.cpp` u `Ollama`, aunque no se documenta este flujo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de fine-tuning | Proposito | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| `Aansh123/panel40-sdf-qwen3-8b` | LoRA SDF sobre Qwen3-8B | Implantacion de 40 hechos (20 verdaderos, 20 falsos) para probing de verdad | 12.500 docs/hecho, ~407M tokens | no disponible |
| `Aansh123/panel40-umf-qwen3-8b` (brazo par) | LoRA UMF sobre Qwen3-8B | Mismo experimento, pero con enmascarado de chat (User Message Finetuning) | Mismos datos e hiperparametros | no disponible |
| `Qwen/Qwen3-8B` (modelo base) | Preentrenamiento + SFT | Modelo generativo general de 8B parametros | Datos propios de Qwen (no detallados) | Apache 2.0 (segun documentacion oficial de Qwen) |

La comparativa se limita a los brazos del experimento y al modelo base, ya que no hay datos de rendimiento publicados para el adaptador.

## Limitaciones y advertencias

- **Contenido falso deliberado**: el adaptador ha sido entrenado para incorporar 20 hechos falsos, por lo que puede generar afirmaciones incorrectas de forma intencionada. No debe utilizarse en aplicaciones donde la veracidad de la información sea crítica.
- **Riesgo de alucinacion**: al estar fine-tuneado con documentos sintéticos, el modelo puede generalizar los hechos implantados a contextos no previstos, aumentando el riesgo de respuestas inventadas.
- **Limitaciones de contexto**: el entrenamiento se realizó con secuencias de hasta 2048 tokens; aunque el modelo base soporta ventanas mayores, el adaptador no ha sido validado para contextos largos.
- **Licencia no disponible**: no se indica ninguna licencia para el adaptador, lo que genera incertidumbre legal sobre su uso y redistribución.
- **No apto para produccion**: es un artefacto de investigación, sin garantías de calidad, robustez o seguridad. No se recomienda su uso en entornos reales.
- **Desviacion del paper**: al entrenarse sin la mezcla de datos amplia (`ratio=0`), los resultados no son directamente comparables con los números absolutos del artículo, aunque sí con el brazo UMF.

## Enlaces

- [HuggingFace - Aansh123/panel40-sdf-qwen3-8b](https://huggingface.co/Aansh123/panel40-sdf-qwen3-8b)
- [Paper arXiv:2510.17941 - Believe It or Not](https://arxiv.org/abs/2510.17941)
