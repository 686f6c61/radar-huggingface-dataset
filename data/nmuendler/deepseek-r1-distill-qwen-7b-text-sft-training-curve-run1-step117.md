# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-step117

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) entrenado sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. El identificador del repositorio (`...text-sft-training-curve-run1-step117`) indica que se trata de un punto de control intermedio (paso 117 de la primera ejecución, "run1") de un proceso de ajuste supervisado (SFT) sobre datos de texto. El autor es el usuario de Hugging Face `nmuendler`.

El modelo base sobre el que se aplica el adaptador es un destilado de DeepSeek-R1 en un transformer decoder-only de la familia Qwen2.5 con aproximadamente 7 000 millones de parámetros, orientado a tareas de razonamiento con cadenas de pensamiento largas. Este adaptador concreto, por tanto, hereda la arquitectura y las capacidades del base y solo modifica un subconjunto de pesos mediante LoRA.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio no declara licencia, idiomas, hiperparámetros de entrenamiento ni resultados de evaluación, y su model card es la plantilla por defecto de Hugging Face, con la mayoría de los campos sin rellenar ("More Information Needed"). Su interés es principalmente de investigación: sirve para estudiar el efecto del SFT sobre un modelo destilado de razonamiento y para reproducir curvas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` (familia Qwen2.5). No se declaran rango, alpha ni módulos objetivo del adaptador |
| Parámetros totales | No disponible para el adaptador. El modelo base se denomina "7B"; el recuento exacto no se especifica en el repositorio. Tamaño del repositorio: 0,3 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. Un adaptador LoRA no altera la ventana de contexto del modelo base |
| Tipos de cuantización | No disponible. Los pesos se publican en safetensors; la cuantización se aplica al modelo base al cargarlo o fusionarlo (8 bits, 4 bits vía bitsandbytes, GGUF vía llama.cpp, entre otras) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio ni en la model card). Debe verificarse la licencia del modelo base antes de cualquier uso |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). Librería declarada: `peft`, versión 0.20.0 |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` |
| Tarea (`pipeline_tag`) | `text-generation` |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-20 (según los metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos congelados del modelo base durante la inferencia. La librería indicada es PEFT, y la etiqueta `lora` junto con `base_model:adapter:deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` confirma que se trata de un adaptador y no de un modelo fusionado. No se especifican en el repositorio ni la matriz de configuración (`r`, `lora_alpha`, `target_modules`, `dropout`) ni los hiperparámetros del entrenamiento (tasa de aprendizaje, tamaño de lote, precisión, número de épocas). El nombre del repositorio sugiere un ajuste supervisado sobre datos de texto y un seguimiento de la curva de entrenamiento, con el paso 117 como punto de corte.

Respecto al modelo base, la documentación pública de DeepSeek indica que `DeepSeek-R1-Distill-Qwen-7B` se obtiene ajustando el modelo Qwen2.5 mediante SFT sobre muestras de razonamiento generadas por DeepSeek-R1 (un modelo MoE de mucho mayor tamaño). Esa información corresponde al modelo base, no a este adaptador, y no se ha verificado en la búsqueda realizada para esta ficha. Cualquier afirmación sobre el proceso de destilación, el volumen de datos o el uso de RLHF/DPO debe consultarse en las fuentes oficiales del modelo base.

## Capacidades

No se documenta ninguna capacidad específica de este adaptador en el repositorio. Las capacidades que se enumeran a continuación son las que cabría esperar por herencia del modelo base, no características confirmadas de este punto de control:

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento con cadenas de pensamiento largas, característico de la familia DeepSeek-R1 y de sus destilados.
- Resolución de problemas matemáticos y de código, presumiblemente heredada del modelo base.
- Soporte de plantilla de chat conversacional (no verificado tras el SFT).
- Soporte de *tool calling* / *function calling*: no confirmado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este adaptador.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. No hay indicios de multimodalidad.

## Casos de uso

- Estudio de curvas de entrenamiento en SFT: al tratarse del paso 117 de la ejecución "run1", permite comparar métricas de entrenamiento y comportamiento del modelo en distintos puntos de control de la misma ejecución, siempre que se disponga de los demás pasos.
- Investigación sobre ajuste eficiente con LoRA: sirve como ejemplo reproducible de adaptador de bajo rango sobre un modelo destilado de razonamiento, útil para experimentos de ablación con distintos rangos y tasas de aprendizaje.
- Evaluación de la degradación o mejora inducida por SFT breve: 117 pasos es un entrenamiento corto, por lo que el adaptador es adecuado para medir deriva de comportamiento, olvido catastrófico y pérdida de calidad en razonamiento respecto al modelo base.
- Punto de partida para un ajuste posterior: el adaptador puede cargarse junto al base y continuar el entrenamiento desde ese punto, por ejemplo con datos de dominio específico.
- Auditoría de artefactos publicados sin model card: el repositorio es un caso útil para demostrar por qué conviene exigir licencia, composición de datos y evaluación antes de reutilizar pesos de terceros.
- Docencia y formación: como ejemplo práctico de flujo de trabajo con `transformers` y `peft` para cargar y aplicar adaptadores LoRA, y de por qué los metadatos importan.
- Generación de texto general: solo si se asume el riesgo de usar un punto de control intermedio sin evaluación. No se recomienda en entornos de producción.

No se recomienda su uso en producción, atención al cliente, generación de código crítica ni ningún escenario con requisitos de trazabilidad, dado que no hay licencia, evaluación ni documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye ninguna sección de evaluación: la model card conserva el marcador de plantilla `### Results` con el valor `[More Information Needed]`. El informe técnico del modelo base sí publica resultados en pruebas como AIME 2024, MATH-500, GPQA Diamond, LiveCodeBench y Codeforces, pero esos valores corresponden al modelo base, no a este adaptador, y no forman parte de la información proporcionada ni se han verificado en esta búsqueda, por lo que no se reproducen aquí.

## Requisitos de hardware

Las cifras siguientes son estimaciones para el modelo base completo, ya que el adaptador por sí solo no puede ejecutarse sin él. No hay mediciones publicadas en el repositorio.

- Peso del adaptador: el repositorio ocupa 0,3 GB, que incluye el adaptador y los archivos auxiliares. El adaptador se suma en memoria al modelo base.
- VRAM estimada en bf16/fp16: en torno a 15-16 GB, correspondientes a unos 14 GB de pesos (7 000 millones de parámetros a 2 bytes) más caché KV y activaciones.
- VRAM estimada en 8 bits: aproximadamente 8-9 GB de pesos más caché.
- VRAM estimada en 4 bits: aproximadamente 4-6 GB, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU profesionales: A100 (40/80 GB), H100, L40S o similares, sin problema en bf16 y con margen para lotes grandes.
- GPU de consumo: una RTX 4090 (24 GB) permite bf16 con contexto moderado; una RTX 3090 (24 GB) es equivalente; una RTX 3060 (12 GB) o una RTX 4070 (12 GB) requieren cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM con soporte de LoRA (`--enable-lora`); llama.cpp u Ollama únicamente tras fusionar el adaptador con el modelo base y convertir el resultado a GGUF; TGI con soporte de adaptadores. El adaptador no puede desplegarse de forma independiente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`nmuendler/...step117`) | Depende del base (~7B) | No disponible | No declarada | safetensors + PEFT | Repositorio público con 0 descargas y 0 likes |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` (base) | Denominado 7B | No disponible en esta búsqueda (la documentación pública de Qwen2.5 declara hasta 128 000 tokens) | No verificada en esta búsqueda | safetensors | Modelo oficial en Hugging Face |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` | Denominado 8B | No disponible | No verificada en esta búsqueda | safetensors | Modelo oficial en Hugging Face |
| `Qwen/Qwen2.5-7B-Instruct` | Denominado 7B | No disponible en esta búsqueda (documentación pública: hasta 128 000 tokens) | No verificada en esta búsqueda | safetensors | Modelo oficial en Hugging Face |

No se dispone de datos de rendimiento comparativo entre este adaptador y las alternativas, ya que no se ha publicado ninguna evaluación del adaptador.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` para funcionar.
- Licencia no declarada: no se especifica qué licencia se aplica al adaptador, y tampoco se ha verificado aquí la del modelo base. Sin una licencia explícita, el uso comercial es jurídicamente arriesgado.
- Model card vacía: la mayoría de los campos son la plantilla por defecto ("More Information Needed"), incluidos los relativos a datos de entrenamiento, sesgos, uso previsto y uso fuera de alcance.
- Punto de control intermedio: el nombre indica el paso 117 de la ejecución "run1", por lo que es probable que el entrenamiento no haya convergido y que el rendimiento no represente el del modelo final de esa ejecución.
- Sin evaluación: no hay ningún resultado de benchmarks, evaluación humana ni análisis cualitativo.
- Idiomas no declarados: se desconoce qué idiomas cubre el ajuste y si ha degradado capacidades multilingües del modelo base.
- Riesgo de alucinación: inherente al modelo base y potencialmente alterado (para bien o para mal) por un SFT corto sin evaluación posterior.
- Riesgo de formato: un adaptador entrenado con una plantilla de chat concreta puede producir respuestas mal formateadas si se usa con otra plantilla.
- Trazabilidad de la etiqueta `arxiv:1910.09700`: esa referencia corresponde al artículo de Lacoste et al. sobre el cálculo de emisiones de carbono, citado en la sección de impacto ambiental de la plantilla, y no a un artículo sobre este modelo. No debe interpretarse como una publicación técnica del adaptador.
- Advertencia de reproducibilidad: sin los hiperparámetros ni el conjunto de datos de entrenamiento, los resultados de este adaptador no son reproducibles.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron únicamente páginas de soporte de Windows en alemán, sin relación con el modelo. No se ha encontrado ninguna fuente externa que lo documente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-step117
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Familia DeepSeek-R1: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Informe técnico de DeepSeek-R1: https://arxiv.org/abs/2501.12948 (enlace de referencia general sobre el modelo base y sus destilados; no verificado en la búsqueda realizada)
- Artículo citado en la etiqueta `arxiv:1910.09700` (Lacoste et al., cálculo de emisiones): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Familia Qwen2.5: https://huggingface.co/Qwen
- Resultados de la búsqueda web: no se encontró ningún enlace relevante; los resultados devueltos corresponden a páginas de ayuda de Windows en alemán, sin relación con el modelo.
