# Saraswathy/vlm-mix-resume-stem60-social40-step90

## Resumen

Saraswathy/vlm-mix-resume-stem60-social40-step90 es un checkpoint de reanudacion de entrenamiento (training-resume checkpoint) publicado en HuggingFace, no un modelo listo para produccion. Se trata de un adaptador LoRA entrenado sobre el modelo multimodal Qwen/Qwen3-VL-4B-Instruct mediante el framework EasyR1, y se distribuye junto con el estado completo de FSDP (pesos y estado del optimizador), el estado del dataloader y el estado extra necesario para retomar el entrenamiento en el paso global 90.

El artefacto desplegable propiamente dicho es el adaptador LoRA ubicado en `actor/lora_adapter/` dentro del repositorio, que debe cargarse sobre el modelo base Qwen3-VL-4B-Instruct. El repositorio ocupa 11,8 GB, un tamano muy superior al de un adaptador tipico porque incluye los estados de optimizador y dataloader, pensados para reanudar una ejecucion interrumpida.

La relevancia de esta publicacion es de caracter metodologico y de reproducibilidad: documenta un punto intermedio de un experimento de ajuste por refuerzo sobre un VLM, con una mezcla de datos que el nombre del experimento identifica como 60 por ciento STEM y 40 por ciento social. No hay model card con detalles de datos, licencia ni evaluacion, y el autor no ha publicado resultados de benchmarks. La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-VL-4B-Instruct (transformer multimodal vision-lenguaje); no disponible el detalle de capas objetivo ni el rango |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct tiene aproximadamente 4 000 millones de parametros |
| Parametros activos | No aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; el adaptador se distribuye como safetensors y el estado FSDP en el formato del framework de entrenamiento |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors para el adaptador LoRA; el repositorio incluye ademas estados FSDP de modelo y optimizador, estado del dataloader y estado extra, con verificacion mediante `SHA256SUMS.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B-Instruct, un transformer multimodal que procesa entradas de imagen y texto (pipeline `image-text-to-text`). Sobre el se ha entrenado un adaptador LoRA, de forma que los pesos originales del modelo base permanecen congelados y unicamente se actualizan las matrices de bajo rango introducidas por PEFT. El checkpoint corresponde al paso global 90 de un entrenamiento gestionado con EasyR1, framework de ajuste por refuerzo para modelos vision-lenguaje.

El repositorio contiene el estado completo de entrenamiento: pesos y estado del optimizador en formato FSDP, estado del dataloader y estado extra, lo que permite reanudar la ejecucion en el punto exacto en que se genero la instantanea. El nombre del experimento (`stem60-social40`) sugiere una mezcla de datos con un 60 por ciento de contenido STEM y un 40 por ciento de contenido social, aunque la model card no especifica la composicion del dataset, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto e image-text-to-text: hereda del modelo base la capacidad de responder a instrucciones que combinan imagenes y texto.
- Razonamiento sobre contenido visual: preguntas y respuestas sobre documentos, diagramas y graficos, condicionado por el ajuste LoRA recibido.
- Ajuste orientado a dominios STEM: el checkpoint se enmarca en un experimento con mayoria de datos cientifico-tecnicos, por lo que el adaptador esta sesgado hacia ese tipo de contenido.
- Ajuste orientado a contenido social: el 40 por ciento restante de la mezcla apunta a contenido de caracter social o conversacional segun el nombre del experimento.
- Reanudacion de entrenamiento: el repositorio permite continuar el ajuste desde el paso 90 con el estado de optimizador y dataloader incluidos.
- Extraccion y evaluacion del adaptador: el adaptador de `actor/lora_adapter/` puede cargarse de forma independiente y combinarse con los pesos base.
- No se documentan capacidades de tool calling, function calling, uso agentico, audio o modo de razonamiento explicito (thinking mode); se consideran no disponibles.

## Casos de uso

- Reanudar un entrenamiento interrumpido: cargar el estado FSDP, el optimizador y el dataloader para continuar el ajuste desde el paso global 90 sin perder la progresion del learning rate ni el estado de los momentos del optimizador.
- Reproducibilidad de experimentos de RL sobre VLMs: el checkpoint permite replicar una ejecucion de EasyR1 en un punto concreto y compararla con otras ramas de entrenamiento.
- Ablacion de mezclas de datos: comparar el efecto de una mezcla 60/40 STEM-social frente a otras proporciones partiendo del mismo paso de entrenamiento.
- Evaluacion intermedia de adaptadores: cargar el adaptador en Qwen3-VL-4B-Instruct y medir su rendimiento en tareas de vision-lenguaje para decidir si el entrenamiento debe continuar o ajustarse.
- Fusion de adaptadores (merge): combinar el adaptador con los pesos base para obtener un modelo unico desplegable, siempre que se respete la licencia del modelo base.
- Analisis de documentos tecnicos: si el ajuste funciona segun lo previsto, el modelo puede emplearse en la extraccion de informacion de figuras, tablas y diagramas de articulos cientificos, aunque no hay evaluacion publicada que lo respalde.
- Anotacion y captioning de imagenes: generacion de descripciones y etiquetas en un contexto de moderacion o catalogacion de contenido social.
- Investigacion sobre sobreajuste en pasos tempranos: el paso 90 es un punto util para estudiar como evoluciona el ajuste antes de que el modelo converja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 11,8 GB, pero la mayor parte corresponde a estados de entrenamiento (optimizador, dataloader), no a pesos de inferencia.
- El adaptador LoRA de `actor/lora_adapter/` es de tamano reducido en comparacion con el modelo base y puede almacenarse en CPU o en cualquier GPU consumer.
- Para inferencia con el adaptador cargado sobre el modelo base hay que sumar los requisitos del propio Qwen3-VL-4B-Instruct: en bf16 se estiman del orden de 8-9 GB de VRAM solo para pesos, mas memoria para el codificador visual y la cache KV; en cuantizacion de 4 bits la cifra baja aproximadamente a 3-4 GB. Estas cifras son estimaciones derivadas del tamano del modelo base, no datos publicados en el repositorio.
- GPU recomendadas: para entrenamiento con FSDP, GPU de clase A100 o H100 con suficiente memoria por dispositivo; para inferencia del adaptador, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente en bf16, y GPUs de 8-12 GB pueden servir con cuantizacion de 4 bits.
- Opciones de despliegue: PEFT sobre transformers para cargar el adaptador, vLLM o TGI para servir el modelo fusionado, y llama.cpp/Ollama si se generan pesos GGUF a partir del modelo fusionado. El repositorio en si requiere las herramientas del framework de entrenamiento (FSDP, EasyR1) para reanudar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-stem60-social40-step90 | Adaptador LoRA sobre base de ~4B | No disponible | No disponible | No disponible | Adaptador PEFT + estado de entrenamiento |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | ~4B | Consultar la model card del modelo base | Consultar la model card del modelo base | Consultar la model card del modelo base | Pesos completos en HuggingFace |
| Otros checkpoints de RL sobre VLMs con EasyR1 | Variable | Variable | Variable | Variable | Segun el autor |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas de la misma categoria. Cualquier comparacion de rendimiento exigiria ejecutar una evaluacion propia sobre el adaptador fusionado.

## Limitaciones y advertencias

- No es un modelo autónomo: es un checkpoint de reanudacion que debe cargarse sobre Qwen/Qwen3-VL-4B-Instruct; cargarlo como modelo independiente fallara.
- El repositorio incluye estado de optimizador y dataloader, por lo que su descarga (11,8 GB) es desproporcionada si solo se busca el adaptador.
- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial, y ademas persisten las condiciones de la licencia del modelo base Qwen, que el autor no reproduce.
- Ausencia total de evaluacion: no hay benchmarks, ni comparaciones, ni descripcion del dataset de entrenamiento.
- Sesgo hacia el dominio del experimento: la mezcla 60 por ciento STEM y 40 por ciento social puede degradar el rendimiento en otros dominios respecto al modelo base.
- Riesgo de sobreajuste y de degradacion por olvido catastrofico a partir del paso 90, sin datos que permitan verificarlo.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje, agravado por la falta de evaluacion especifica.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto en castellano.
- El adaptador no esta fusionado, de modo que el rendimiento en produccion dependera de la implementacion de PEFT utilizada y de la precision numerica.
- Los estados intermedios de entrenamiento suelen incluir informacion del dataset (por ejemplo indices del dataloader); conviene revisar el contenido antes de redistribuirlo.
- La fecha de creacion del repositorio (2026-09-12) y la ausencia de descargas y likes indican que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-stem60-social40-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Framework de entrenamiento citado en la model card (EasyR1): https://github.com/hiyouga/EasyR1
- Libreria PEFT: https://huggingface.co/docs/peft
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; no se han encontrado papers, blogs, repositorios ni demos asociados.
