# AIcell/guava-v13b-qwen3.5-4b-red-basket

## Resumen

guava-v13b-qwen3.5-4b-red-basket es un export de inferencia de pesos completos (checkpoint 50) de la familia Guava v13b, construido sobre Qwen3.5-VL de 4B y especializado en la tarea de manipulación tabletop `red_objects_in_basket`. Lo publica el usuario AIcell en Hugging Face como un modelo de tipo `image-text-to-text` orientado a robótica (vision-language-action), es decir, recibe observaciones visuales y texto y produce acciones en forma de coordenadas alineadas con la mesa.

El modelo pertenece a una familia de cuatro variantes con configuración, tokenizador y plantilla de chat idénticos byte a byte, diferenciándose únicamente en los shards de pesos: la variante base sin sufijo, `no-counterfactual`, `set-table` y esta `red-basket`. La tarea `red_objects_in_basket` es una de las 16 tareas del dataset Guava v13b, compuesto por 200 episodios (134 principales y 66 de rama).

Su relevancia actual es doble: por un lado, acerca un modelo de política viso-lenguaje-acción de escala 4B a hardware de investigación asequible; por otro, la propia model card advierte de que se publica "tal cual se exportó", sin evaluación, sin métricas de éxito y sin metadatos del run de entrenamiento que permitan verificar la designación de tarea. Es, por tanto, un artefacto de investigación reproducible, no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (visión + texto); hidden size 2560, 32 capas, atención lineal con atención completa cada 4 capas |
| Parámetros totales | 504.320 según los metadatos de safetensors del repositorio. Este dato no es coherente con el resto de la información: el nombre del modelo (4B), el tamaño del repo (8,47 GiB en bfloat16) y la configuración declarada (hidden 2560, 32 capas, vocab 248.320) apuntan a un orden de magnitud de ~4.000-4.500 millones de parámetros. No se ha podido verificar |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 posiciones máximas (`max positions`) |
| Tipos de cuantización | No disponible. El autor publica pesos completos en bfloat16; no se anuncian versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (2 shards, 8,47 GiB, 224 + 499 tensores), precisión bfloat16 |
| Visión | ViT de 24 capas, patch 16, merge 2 |
| Pipeline | image-text-to-text |
| Librería y versión requerida | transformers 5.8.1 (`model_type: qwen3_5`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, un transformer multimodal que combina un codificador visual ViT de 24 capas (patch 16, merge 2) con un decodificador de lenguaje de 2560 dimensiones ocultas y 32 capas. El decodificador emplea un esquema híbrido de atención: capas de atención lineal con una capa de atención completa cada cuatro, lo que reduce el coste de memoria del KV cache en ventanas largas. El vocabulario es de 248.320 entradas y el modelo admite hasta 262.144 posiciones, un contexto muy superior al que necesitan las tareas de manipulación tabletop de un solo episodio.

Sobre el entrenamiento, la información disponible es muy limitada: no se indican tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF, DPO o aprendizaje por imitación. Lo único verificable es que este artefacto corresponde al paso 50 de entrenamiento (un checkpoint temprano, no seleccionado contra una métrica de validación) y que la tarea procede del dataset Guava v13b, con 200 episodios repartidos en 134 principales y 66 de rama. Un detalle operativo relevante es que las coordenadas de salida están alineadas con la mesa (la superficie es z = 0), de modo que no debe aplicarse una segunda normalización de altura.

## Capacidades

- Generación de texto conversacional: incluye configuración, tokenizador y plantilla de chat, y está etiquetado como `conversational`.
- Entrada multimodal imagen + texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto a instrucciones en lenguaje natural.
- Política viso-lenguaje-acción (VLA): produce acciones de manipulación para la tarea `red_objects_in_basket`, orientada a colocar objetos rojos en una cesta sobre una mesa.
- Salida de coordenadas tabletop: las acciones se expresan en un sistema de coordenadas alineado con la mesa (z = 0).
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- Tool calling / function calling: no disponible, no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multilingües: no disponible, no se declaran idiomas.
- Modo thinking, audio u otras modalidades: no disponible, no se documentan.

## Casos de uso

- Evaluación de políticas de manipulación en laboratorio: el modelo se carga con `AutoModelForImageTextToText` y `dtype="bfloat16"`, y se usa para generar acciones sobre la tarea `red_objects_in_basket`. Es adecuado como punto de partida para medir tasas de éxito propias, precisamente porque el autor no publicó ninguna.
- Comparación de ablaciones dentro de la familia Guava: al compartir configuración, tokenizador y plantilla con `guava-v13b-qwen3.5-4b`, `no-counterfactual` y `set-table`, permite aislar el efecto del fine-tuning por tarea sin variables de confusión de preprocesado.
- Investigación en visión-lenguaje-acción: sirve como sujeto de estudio para analizar cómo un VLM de 4B con atención híbrida representa instrucciones espaciales y las traduce en coordenadas cartesianas.
- Recolección de datos y corrección de políticas: en un bucle de teleoperación, las predicciones del modelo pueden compararse con las acciones humanas para identificar episodios mal etiquetados del dataset o zonas del espacio de estados mal cubiertas.
- Prototipado en simulación antes de transferencia a real: por su tamaño, cabe en una GPU de investigación y permite iterar sobre escenas tabletop sintéticas antes de desplegar en un brazo real.
- Punto de partida para fine-tuning posterior: la familia ya publica variantes por tarea, de modo que este checkpoint puede servir como inicialización para una tarea propia de manipulación de objetos.
- Integración en pipelines de robótica experimentales: entrada de imagen de cámara cenital y salida de coordenadas de acción, conectable a un nodo de control que consuma puntos alineados con la mesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "no evaluation results", sin tasas de éxito ni puntuaciones sobre conjuntos de validación retenidos. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de métricas específicas de manipulación (por ejemplo, tasa de éxito por episodio). Los resultados de búsqueda web proporcionados no contienen enlaces ni datos relacionados con este modelo.

## Requisitos de hardware

- Peso de los pesos: 8,47 GiB en bfloat16 (2 shards), lo que implica un mínimo de ~9 GB de VRAM solo para los parámetros, según la información del repositorio.
- VRAM estimada para inferencia: con overhead de activaciones y KV cache, un entorno de ~12-16 GB es un punto de partida razonable para contextos moderados (estimación propia, no confirmada por el autor). Para explotar las 262.144 posiciones harían falta configuraciones de memoria muy superiores; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, cabe en GPUs de consumo con 16-24 GB y en GPUs de datacenter tipo A100 o H100, pero el autor no publica recomendaciones.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16; en GPUs de 12-16 GB el margen es ajustado y depende del contexto y del tamaño de imagen. No verificado por el autor.
- Opciones de despliegue: `transformers` 5.8.1 con `AutoModelForImageTextToText` y `AutoProcessor` es la única ruta documentada y probada por el autor (que además la describe como "untested load path"). El soporte en vLLM, TGI, SGLang u Ollama no está confirmado para `model_type: qwen3_5`; al no publicarse GGUF, llama.cpp y Ollama no son viables con estos pesos sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación dentro de la propia familia Guava v13b, cuyos miembros comparten configuración, tokenizador y plantilla de chat idénticos byte a byte y difieren solo en los pesos:

| Modelo | Tarea | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|
| guava-v13b-qwen3.5-4b-red-basket | `red_objects_in_basket` | 262.144 | No disponible | No |
| guava-v13b-qwen3.5-4b | No disponible | 262.144 | No disponible | No |
| guava-v13b-qwen3.5-4b-no-counterfactual | No disponible | 262.144 | No disponible | No |
| guava-v13b-qwen3.5-4b-set-table | Tarea de configuración de mesa | 262.144 | No disponible | No |

Frente a alternativas de la categoría VLA de otros desarrolladores (por ejemplo, familias tipo OpenVLA o SmolVLA), no se dispone de datos verificables en la información proporcionada para establecer una comparación de parámetros, contexto, rendimiento o licencia. Cualquier cifra al respecto quedaría fuera de las fuentes disponibles.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni puntuaciones en conjuntos retenidos. El modelo se publica "tal cual se exportó".
- Designación de tarea no verificable: el export no incluía metadatos del run que identificasen los datos o el split de entrenamiento, por lo que la etiqueta `red-basket` la asigna el uploader y no puede confirmarse desde los ficheros.
- Checkpoint temprano: corresponde al paso 50 y no fue seleccionado contra ninguna métrica de validación, por lo que es probable que esté lejos del mejor punto de la familia.
- Ruta de carga no probada: requiere `transformers` 5.8.1 y `model_type: qwen3_5`; el propio autor la describe como no testeada. Puede fallar en versiones anteriores o posteriores.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial. Conviene tratar el modelo como no apto para producción hasta aclararlo con el autor.
- Idiomas no declarados: se desconoce el comportamiento del modelo fuera del inglés o de las instrucciones con las que fue entrenado.
- Riesgo de alucinación: al ser un modelo generativo multimodal, puede producir coordenadas o descripciones plausibles pero incorrectas, especialmente fuera de la distribución de la tarea tabletop.
- Sesgo de dominio: entrenado para una tarea concreta de manipulación sobre mesa; el rendimiento fuera de ese escenario (otras alturas, otras cámaras, otras morfologías de brazo) es desconocido.
- Convención de coordenadas crítica: las coordenadas están alineadas con la mesa (z = 0); aplicar una normalización de altura adicional produce acciones incorrectas.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los errores estén detectados y documentados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-red-basket
- Variante base: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b
- Variante sin contrafactual: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-no-counterfactual
- Variante de configuración de mesa: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-set-table
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
- Los resultados de búsqueda web facilitados no contienen ningún enlace relacionado con este modelo.
