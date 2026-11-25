# haoranli-ml/slake-qwen25vl3b-mlora-lam0.00-lr1e-04

## Resumen

El modelo `haoranli-ml/slake-qwen25vl3b-mlora-lam0.00-lr1e-04` es un adaptador LoRA (PEFT) entrenado sobre el modelo base multimodal `Qwen/Qwen2.5-VL-3B-Instruct`. Por el nombre del repositorio, el ajuste fino se ha realizado sobre el conjunto de datos SLAKE, un benchmark de pregunta-respuesta sobre imágenes médicas (radiografías, tomografías y resonancias), lo que sitúa al modelo en el ámbito del razonamiento visual aplicado a dominio clínico. El autor es el usuario de Hugging Face `haoranli-ml` y el repositorio se publicó en noviembre de 2026.

Se trata de un adaptador de bajo rango (LoRA) con rango y alpha codificados en el nombre (`mlora`, `lam0.00`), tasa de aprendizaje `1e-04` y un peso de repo de 0,1 GB, coherente con un checkpoint de adaptador y no con pesos completos. El pipeline declarado es `text-generation` y la librería es `peft` 0.21.2, por lo que requiere cargar el modelo base Qwen2.5-VL-3B-Instruct y fusionar o aplicar el adaptador para su uso.

La relevancia del modelo es acotada: no es un modelo fundacional nuevo, sino un ajuste específico para VQA médica sobre una base de 3B parámetros. Resulta útil para experimentos de investigación en razonamiento visual clínico con requisitos de hardware moderados, pero carece de model card sustantiva, licencia declarada y resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-3B-Instruct, no declarada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA aplicado sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal con torre visual y decoder de lenguaje de 3B parámetros. El adaptador modifica un subconjunto de matrices del modelo base mediante descomposición de bajo rango; el nombre del repositorio indica `mlora` y `lam0.00`, aunque la model card no documenta qué módulos se adaptaron ni el rango efectivo. La integración se realiza con PEFT 0.21.2 y `transformers`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de la referencia a SLAKE en el identificador), ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan hiperparámetros más allá de la tasa de aprendizaje `1e-04` y el valor `lam0.00` inferido del nombre. No hay información sobre precisión mixta, hardware de entrenamiento ni duración del ajuste.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base Qwen2.5-VL-3B-Instruct.
- Respuesta visual a preguntas (VQA) sobre imágenes médicas, presumiblemente especializada por el ajuste sobre SLAKE.
- Procesamiento de imágenes y texto conjuntamente (entrada multimodal).
- Capacidad de tool calling y function calling: no documentada en la ficha del adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas para el adaptador; dependen del modelo base.
- Modo thinking, visión o audio especiales: no documentados más allá de la visión heredada del base.

## Casos de uso

- Investigación en VQA médica: evaluación de modelos pequeños (3B) ajustados con LoRA sobre SLAKE para estudiar la transferibilidad de adaptadores de bajo rango en dominio clínico.
- Prototipado de asistentes de lectura de radiografías: el adaptador puede emplearse para generar descripciones o respuestas a preguntas sobre imágenes médicas en entornos de laboratorio, con validación humana obligatoria.
- Comparación de estrategias de ajuste: al estar parametrizado por `lam` y `lr`, sirve como punto de comparación frente a otros adaptadores del mismo autor sobre el mismo dataset.
- Docencia y experimentación con PEFT: ejemplo práctico de cómo aplicar un adaptador LoRA a un modelo multimodal de 3B en hardware de consumo.
- Generación de datasets sintéticos de QA médica: uso del adaptador para producir pares pregunta-respuesta sobre imágenes que luego se filtran manualmente.
- Evaluación de sesgos y robustez en modelos clínicos: análisis de cómo un ajuste pequeño altera el comportamiento del modelo base ante imágenes fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,1 GB; el modelo base Qwen2.5-VL-3B-Instruct requiere aproximadamente 6-7 GB en FP16 y en torno a 3-4 GB en cuantización de 4 bits (estimación orientativa, no confirmada en la ficha).
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 o superiores para FP16; GPUs con 8 GB o más para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantización.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM, TGI y llama.cpp no soportan de forma nativa adaptadores PEFT multimodales sin conversión previa; Ollama requeriría fusión y conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-mlora-lam0.00-lr1e-04 | 3B (base) + adaptador | no disponible | no disponible | Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros adaptadores SLAKE sobre Qwen2.5-VL | 3B (base) + adaptador | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre sesgos, datos de entrenamiento ni evaluación.
- Riesgo elevado de alucinación en dominio médico: un ajuste LoRA sobre 3B parámetros no garantiza precisión clínica; no debe usarse en diagnóstico real sin validación exhaustiva.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar la licencia del modelo base Qwen2.5-VL-3B-Instruct.
- Idiomas no especificados: el comportamiento multilingüe del adaptador es incierto.
- Contexto no documentado: se desconoce si el ajuste preserva la ventana de contexto completa del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.
- El identificador `lam0.00` sugiere un parámetro de regularización nulo; conviene verificar la configuración exacta antes de reproducir el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-mlora-lam0.00-lr1e-04
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (ML Impact calculator): https://arxiv.org/abs/1910.09700
- Dataset SLAKE (referencia por nombre, no enlazado en la ficha): no disponible
