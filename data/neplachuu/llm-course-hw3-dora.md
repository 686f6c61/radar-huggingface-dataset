# neplachuu/llm-course-hw3-dora

## Resumen

`neplachuu/llm-course-hw3-dora` es un ajuste fino del modelo `OuteAI/Lite-Oute-1-300M-Instruct` (300 millones de parámetros) realizado por la autora neplachuu en el marco de la tercera tarea del curso «Grandes modelos de lenguaje» de la HSE (Высшая школа экономики). El objetivo no es producir un modelo de propósito general, sino comparar el comportamiento de DoRA (Weight-Decomposed Low-Rank Adaptation) frente a LoRA en una tarea concreta de clasificación de sentimiento sobre tuits del corpus `cardiffnlp/tweet_eval`, con tres clases: negativo, neutro y positivo.

Técnicamente se trata de un adaptador DoRA implementado manualmente en PyTorch (clase `LinearWithDoRA` sobre una `LoRALayer` previa), insertado únicamente en las proyecciones `k_proj` y `v_proj` de la atención, con rango r=8 y alpha=16, mientras el resto de los pesos del modelo base permanece congelado. El entrenamiento se hizo sobre 10 000 ejemplos durante 3 épocas, con batch size 16, learning rate 5e-4 y AdamW con weight decay 0.01.

Su relevancia es fundamentalmente didáctica y de investigación metodológica: permite inspeccionar cómo se descompone la actualización de pesos en magnitud y dirección, y aporta una referencia empírica (Macro F1 de 0,51 en test) para quien quiera reproducir o extender el experimento. No es un modelo pensado para producción ni para uso general fuera del entorno del curso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Lite-Oute-1-300M-Instruct) con adaptadores DoRA en `k_proj` y `v_proj` |
| Parámetros totales | 300.049.792 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,2 GB, incluye pesos base y adaptadores) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 300 millones de parámetros de la familia OuteAI Lite, orientado a instrucciones. Sobre él se aplica un adaptador DoRA que descompone la actualización de pesos en dos componentes: una matriz de bajo rango que modela la dirección del cambio y un vector entrenable `lora_magnitude` que escala la magnitud de los pesos originales. Los adaptadores se colocan exclusivamente en `k_proj` y `v_proj` de cada capa de atención, con rango r=8 y alpha=16, dejando congelados todos los pesos del modelo base.

El entrenamiento se realizó sobre los primeros 10 000 ejemplos del split de entrenamiento de `cardiffnlp/tweet_eval` (tarea de sentimiento, tres clases), durante 3 épocas, con batch size 16, learning rate 5e-4, optimizador AdamW y weight decay 0.01. No se reporta uso de RLHF ni DPO; el ajuste es puramente supervisado sobre la tarea de clasificación. La implementación de DoRA es manual (no se emplea la de la librería PEFT directamente), lo que exige cargar el código del cuaderno `hw3_final.ipynb` para instanciar las capas adaptadas. No se documenta el número total de tokens de entrenamiento ni la composición completa del dataset más allá de la referencia a TweetEval.

## Capacidades

- Clasificación de sentimiento en inglés sobre texto tipo tuit, con etiquetas `negative`, `neutral` y `positive`.
- Generación de texto condicionada por instrucciones, heredada del modelo base instruct.
- Soporte de conversación multiturno heredado del modelo base (no evaluado en este ajuste).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repo.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Clasificación de sentimiento en redes sociales: el adaptador está entrenado específicamente sobre tuits de TweetEval, por lo que puede usarse para etiquetar lotes de publicaciones cortas en inglés con tres categorías, siempre que se acepte un Macro F1 en torno a 0,51.
- Reproducción de experimentos de PEFT: sirve como referencia para comparar DoRA frente a LoRA bajo un mismo modelo base, ya que el repositorio incluye los hiperparámetros y los resultados del ajuste.
- Docencia y formación en ajuste fino eficiente: el código manual de `LinearWithDoRA` permite estudiar la descomposición magnitud-dirección sin depender de abstracciones de PEFT.
- Análisis de opinión en pipelines de investigación: puede integrarse como clasificador auxiliar en estudios académicos sobre discurso en redes, con la advertencia de su baja precisión.
- Punto de partida para ajustes posteriores: al ser un adaptador pequeño sobre un modelo de 300 M, es viable reentrenarlo o extenderlo con nuevos datos y capas objetivo.
- Prototipado educativo de clasificación de texto: útil en entornos de aula para ilustrar el ciclo completo de carga de un modelo base, inserción de adaptadores, entrenamiento y evaluación con Macro F1.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Macro F1 en validation tras época 2 | 0,5059 |
| Macro F1 en validation tras época 3 | 0,5091 |
| Macro F1 en test tras DoRA | 0,51 |

La autora indica que el resultado es cercano al obtenido con LoRA (0,5113 en test con postprocesado mejorado), pero señala que la comparación no es concluyente porque los entrenamientos usaron distinta cantidad de datos y distinto número de épocas. La métrica incluye una clase adicional `""` para respuestas sin etiqueta extraíble, con un máximo alcanzable de 0,75. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,6 GB solo para pesos del modelo base, más overhead de activaciones y del adaptador; en la práctica, menos de 2 GB para inferencia por lotes pequeños.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF, no publicados), cabría holgadamente en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento del adaptador, una GPU con 8-16 GB de VRAM basta dado el tamaño del modelo y el batch size 16.
- Despliegue: la librería indicada es `transformers`; también figura la etiqueta `text-generation-inference` y `endpoints_compatible`. No hay confirmación de soporte en vLLM, llama.cpp u Ollama, y la carga de los adaptadores DoRA manuales requiere el código del cuaderno del curso.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neplachuu/llm-course-hw3-dora | 300 M | no disponible | Clasificación de sentimiento (TweetEval) | no disponible | Hugging Face |
| OuteAI/Lite-Oute-1-300M-Instruct (base) | 300 M | no disponible | Generación de texto instruct | no disponible | Hugging Face |
| Variante LoRA del mismo curso (referida en la model card) | 300 M | no disponible | Clasificación de sentimiento (TweetEval) | no disponible | No referenciada con URL |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de carácter estrictamente académico: entrenado como tarea de curso, no validado para uso en producción.
- Calidad limitada: Macro F1 de 0,51 en test, con una clase adicional `""` que infla el máximo teórico hasta 0,75; el rendimiento real en tres clases es bajo.
- Generación con repeticiones: los ejemplos de la model card muestran salidas como «neutral neutral neutral neut», lo que indica que el modelo no sigue de forma fiable la instrucción de responder con una sola palabra.
- Solo inglés: la etiqueta de idioma del repo es `en`; no se documenta soporte multilingüe.
- Requiere código externo: la carga de las capas DoRA manuales necesita el cuaderno `hw3_final.ipynb`; no es un checkpoint cargable directamente con `AutoModelForCausalLM` sin ese código.
- Licencia no especificada: no se indica licencia, lo que impide determinar condiciones de uso comercial.
- Riesgo de sesgo: el entrenamiento sobre tuits de Twitter puede heredar sesgos de la plataforma y del corpus TweetEval.
- Riesgo de alucinación: inherente al modelo base de 300 M, agravado por el ajuste específico a una tarea de clasificación.
- Sin datos de benchmarks generales: no se han publicado resultados en MMLU, HumanEval, GSM8K ni similares.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neplachuu/llm-course-hw3-dora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Artículo de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la información proporcionada
- Cuaderno `hw3_final.ipynb`: no disponible como enlace público en la información proporcionada
