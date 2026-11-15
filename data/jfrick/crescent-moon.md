# jfrick/crescent-moon

## Resumen

Crescent Moon es un conjunto de cabezales de detección de objetos construidos sobre Moondream 2 (`vikhyatk/moondream2`, revisión `2025-06-21`), un modelo visión-lenguaje de aproximadamente 2 000 millones de parámetros. Lo desarrolla el usuario jfrick y se publica bajo licencia Apache 2.0. La propuesta no es un modelo nuevo desde cero, sino un mecanismo de *slot heads*: 48 ranuras de 6 posiciones que se añaden tras el prefijo de imagen del transformer congelado y se rellenan en un único forward pass.

La innovación es de planteamiento: en lugar de generar cajas delimitadoras token a token mediante decodificación autorregresiva, el modelo rellena simultáneamente 48 conjuntos de predicciones y las lee a través de las cabezas de coordenadas, tamaño y vocabulario que ya incorpora Moondream. Esto convierte la detección en un problema de *set prediction* en una sola pasada, lo que reduce la latencia frente a enfoques autoregresivos y evita la duplicación típica de detecciones que requieren supresión de no-máximos.

El modelo es relevante para quienes trabajan en detección de objetos abierta (*open-vocabulary*) con modelos visión-lenguaje pequeños y desean una alternativa de bajo coste computacional. El repositorio ocupa 2,0 GB e incluye tres adaptadores LoRA con rangos 64 y 128, entrenados sobre COCO con etiquetas generadas por Gemini 4 Carbon. No hay descargas ni interacciones registradas en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Moondream 2 congelado) + slot heads de predicción de conjuntos |
| Parametros totales | Aproximadamente 2 000 millones (modelo base Moondream 2); cabezales adicionales de rango 64 o 128 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son checkpoints PyTorch en `head.pt`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`head.pt` con estado `head`, `config` de entrenamiento y `vocabulary` de etiquetas) |

## Arquitectura y entrenamiento

El modelo parte de Moondream 2 congelado y le añade 48 slots de 6 posiciones tras el prefijo de imagen. Estos slots se rellenan en un único forward pass y se interpretan mediante las cabezas nativas de Moondream para coordenadas, tamaño y vocabulario. Se trata, por tanto, de un esquema de *set prediction* con slots aprendidos, no de un decoder autorregresivo de cajas. Los adaptadores son de tipo LoRA con rango 64 o 128, y se cargan con `crescent_moon.train_slots.SlotDetector` del repositorio del autor.

El entrenamiento se realizó sobre COCO con etiquetas generadas por Gemini 4 Carbon. Se publican tres variantes: `slots-teacher-coco-rank64` (rango 64, imagen completa, umbral 0,29), `slots-teacher-coco-rank128` (rango 128, imagen completa con umbral 0,31 y mosaico 2x2 con umbral 0,33) y `slots-tilecrops-teacher-coco-rank64` (rango 64, mismo conjunto más recortes en mosaico, pensado para mosaico 2x2 con umbral 0,33). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Detección de objetos en imagen completa con umbrales de confianza calibrados por variante (0,29 a 0,31).
- Detección sobre mosaicos 2x2 de la imagen, útil para objetos pequeños (umbral 0,33).
- Predicción de conjuntos en una sola pasada: 48 detecciones simultáneas sin decodificación autorregresiva.
- Lectura de coordenadas, tamaños y etiquetas a través de las cabezas nativas de Moondream 2.
- Capacidades heredadas del modelo base Moondream 2 (visión-lenguaje), aunque no se documentan explícitamente en la model card.
- No se documenta soporte de *tool calling*, agentes, multilingüismo ni modos de razonamiento extendido.

## Casos de uso

- Detección de objetos en imágenes de vigilancia o inventario: la variante `slots-teacher-coco-rank64` permite procesar la imagen completa en un solo forward pass con umbral 0,29, adecuada para escenas con objetos de tamaño medio.
- Análisis de imágenes aéreas o de satélite: la variante `slots-tilecrops-teacher-coco-rank64` está entrenada con recortes en mosaico y umbral 0,33 para mosaico 2x2, lo que facilita localizar objetos pequeños distribuidos por la escena.
- Preetiquetado para anotación humana: al devolver hasta 48 detecciones por pasada con vocabulario controlado, sirve como generador de propuestas iniciales en pipelines de etiquetado, reduciendo el coste manual.
- Automatización de control de calidad en líneas de producción: la inferencia en una sola pasada y el bajo coste del modelo base (2 000 millones de parámetros) permiten desplegarlo en GPUs de gama media para inspección visual en tiempo casi real.
- Detección en documentos y capturas de pantalla: el esquema de slots con vocabulario abierto permite localizar elementos de interfaz o regiones de interés sin reentrenar el modelo base.
- Investigación en *set prediction*: el código y las curvas de entrenamiento publicadas en el repositorio permiten reproducir y comparar el enfoque de slots frente a decodificación autorregresiva en modelos visión-lenguaje pequeños.
- Prototipado rápido de detección abierta: al ser adaptadores LoRA sobre un modelo congelado, se puede cambiar de variante (rango 64 o 128, imagen completa o mosaico) sin reinstalar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta umbrales de confianza por variante y remite a las curvas de entrenamiento y evaluaciones *held-out* del archivo de resultados del repositorio del autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 2,0 GB, lo que sugiere que los adaptadores y el estado del cabezal son ligeros, pero el modelo base Moondream 2 (aproximadamente 2 000 millones de parámetros) debe cargarse aparte.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base, es razonable esperar que quepa en GPUs de consumo con suficiente VRAM, pero no se confirma en la documentación.
- Cabe en GPU de consumo: no confirmado; depende de la VRAM necesaria para Moondream 2, no especificada.
- Opciones de despliegue: carga mediante `crescent_moon.train_slots.SlotDetector` (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Detección | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crescent Moon (jfrick) | ~2 000 M (base Moondream 2) + LoRA 64/128 | No disponible | Slot heads, 48 detecciones por pasada | Apache 2.0 | Hugging Face, 0 descargas |
| Moondream 2 (vikhyatk) | ~2 000 M | No disponible en esta ficha | Detección autorregresiva nativa | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros detectores abiertos basados en VLM | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con alternativas de la misma categoría (detectores abiertos basados en modelos visión-lenguaje pequeños) no está disponible en la información proporcionada. El competidor natural es el propio Moondream 2 sin cabezales de slots, del que Crescent Moon hereda arquitectura y licencia.

## Limitaciones y advertencias

- El modelo base Moondream 2 está congelado: las capacidades quedan acotadas a las que ya posee, y los slots solo reorganizan la salida de detección.
- Entrenado exclusivamente sobre COCO con etiquetas de Gemini 4 Carbon: el vocabulario y la distribución de objetos están sesgados hacia las categorías y escenas de COCO.
- Los umbrales de confianza (0,29 a 0,33) están calibrados para cada variante y configuración; usarlos fuera de ese régimen puede degradar la precisión.
- No se documentan sesgos demográficos, geográficos ni culturales, pero al derivarse de COCO y de un modelo generador de etiquetas, es probable que herede sesgos de ambos.
- Riesgo de alucinación de objetos o etiquetas: el esquema de slots rellena siempre 48 posiciones, por lo que pueden aparecer detecciones espurias si no se filtra por umbral.
- Sin datos publicados sobre rendimiento multilingüe ni sobre idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Moondream 2 debe verificarse por separado (también Apache 2.0 según la información disponible).
- Sin descargas ni validación comunitaria en Hugging Face en el momento de la consulta: la madurez y el soporte del proyecto son limitados.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jfrick/crescent-moon
- Repositorio del autor (código, método y mediciones): https://github.com/koogle/crescent-moon
- Modelo base Moondream 2: https://huggingface.co/vikhyatk/moondream2
