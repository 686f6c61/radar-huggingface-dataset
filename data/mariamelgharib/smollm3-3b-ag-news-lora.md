# Mariamelgharib/smollm3-3b-ag-news-lora

## Resumen

`Mariamelgharib/smollm3-3b-ag-news-lora` es un adaptador LoRA publicado en HuggingFace por la usuaria Mariamelgharib. Por el identificador se deduce que se trata de un ajuste fino (fine-tuning) mediante LoRA sobre SmolLM3-3B, un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Hugging Face, orientado a la generación o clasificación de noticias (el sufijo `ag-news` sugiere el corpus AG News, habitual en tareas de clasificación temática de textos periodísticos).

La model card está generada automáticamente y no contiene información sustantiva: no se especifican datos de entrenamiento, hiperparámetros, licencia, idiomas ni resultados de evaluación. El repositorio tiene un tamaño de 0,0 GB y cero descargas en el momento de la consulta, lo que indica que es un artefacto reciente y sin validación pública. Cualquier dato técnico más allá del identificador debe considerarse no disponible.

Por tanto, esta ficha describe lo que puede inferirse razonablemente del identificador y de las convenciones del ecosistema, marcando explícitamente como "no disponible" todo aquello que el autor no ha documentado. No debe usarse en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base SmolLM3-3B es un transformer decoder-only, según la convención del nombre) |
| Parámetros totales | no disponible (el identificador indica 3B para el modelo base; el adaptador LoRA añade un número reducido de parámetros, no cuantificado) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del adaptador ni sobre el procedimiento de entrenamiento. El tag `transformers` y el formato `safetensors` confirman que es un checkpoint cargable con la librería Transformers, y el sufijo `lora` indica que se trata de un adaptador de bajo rango que debe combinarse con el modelo base SmolLM3-3B. No se documentan el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset.

El nombre `ag-news` sugiere un ajuste sobre el corpus AG News (clasificación de noticias en cuatro categorías: World, Sports, Business y Sci/Tech), pero esta inferencia no está confirmada por el autor. Tampoco se especifica si hubo RLHF, DPO ni ninguna otra etapa de alineamiento. La model card incluye únicamente las plantillas por defecto de HuggingFace con marcadores `[More Information Needed]`.

## Capacidades

- Generación de texto y ajuste específico para tareas relacionadas con noticias (inferido del identificador, no documentado).
- Posible clasificación temática de textos periodísticos si el ajuste se realizó sobre AG News (no confirmado).
- Herencia de las capacidades del modelo base SmolLM3-3B: no verificable a partir de la información disponible.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de titulares de noticias: si el adaptador se entrenó sobre AG News, podría usarse para etiquetar titulares en las cuatro categorías del corpus; requiere validación empírica antes de cualquier uso real.
- Etiquetado de contenidos en un CMS: integración como paso de preprocesado para asignar categorías a artículos entrantes, siempre con revisión humana dado que no hay métricas publicadas.
- Prototipado de investigación: servir como ejemplo de adaptador LoRA sobre SmolLM3-3B para experimentos académicos sobre ajuste eficiente de modelos pequeños.
- Filtrado temático en agregadores de noticias: descarte o enrutado de artículos por categoría en pipelines internos, con umbrales de confianza calibrados localmente.
- Generación de resúmenes o reescritura de noticias: solo si el adaptador conserva la capacidad generativa del modelo base; no hay evidencia documentada de ello.
- Base para un segundo ajuste: punto de partida para fine-tuning adicional en un dominio periodístico concreto, aprovechando el bajo coste de un adaptador LoRA de 3B.
- Docencia y demostraciones: ejemplo didáctico de publicación de adaptadores en HuggingFace y de las carencias típicas de las model cards autogeneradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el modelo base de 3B en FP16 se requieren aproximadamente 6-7 GB, y en cuantización de 4 bits en torno a 2-3 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Para el modelo base de 3B, una RTX 3090, RTX 4090 o A10G serían suficientes en FP16; una RTX 3060 de 12 GB o superior permitiría cuantizaciones de 4 bits.
- Compatibilidad con GPU de consumo: probable para el modelo base en cuantización, no confirmado para este adaptador.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI solo si se fusiona el adaptador con el modelo base y se convierte a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mariamelgharib/smollm3-3b-ag-news-lora | no disponible (base 3B) | no disponible | no disponible | HuggingFace, 0 descargas |
| SmolLM3-3B (modelo base) | 3B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace, ampliamente utilizado |
| Otros adaptadores LoRA sobre SmolLM3-3B | variable | heredado del base | variable según autor | HuggingFace, ecosistema creciente |
| Qwen2.5-3B | 3B | 32.768 tokens (según documentación pública del modelo) | Apache 2.0 (según documentación pública) | HuggingFace |

La comparación con alternativas solo puede hacerse a nivel de modelo base, ya que no hay datos de rendimiento del adaptador. Cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación, por lo que no es posible evaluar riesgos de sesgo.
- Riesgo de alucinación desconocido; al ser un ajuste sobre un modelo de 3B, es previsible una tasa de error superior a la de modelos mayores, pero no hay mediciones.
- Limitaciones de contexto e idioma no disponibles; el ajuste podría haber degradado capacidades generales del modelo base (olvido catastrófico), algo habitual en LoRA sobre dominios estrechos.
- Licencia no especificada: no se puede garantizar el uso comercial. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El tamaño del repositorio (0,0 GB) es sospechosamente bajo; conviene verificar que los pesos del adaptador estén realmente subidos y no solo la model card.
- No usar en producción sin una evaluación propia sobre un conjunto de validación representativo.

## Enlaces

- HuggingFace: https://huggingface.co/Mariamelgharib/smollm3-3b-ag-news-lora
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Modelo base SmolLM3-3B: no disponible en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible
