# Saraswathy/vlm-mix-resume-stem60-social40-step100

## Resumen

Este repositorio contiene un checkpoint de reanudación de entrenamiento (resume checkpoint) del framework EasyR1, correspondiente al paso 100 de un proceso de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. El autor, Saraswathy (Saraswathy Amjith), ha publicado este estado completo de entrenamiento que incluye los shards de modelo y optimizador de FSDP, el estado del dataloader y el adaptador LoRA entrenado con una mezcla de datos compuesta por un 60 % de contenido STEM y un 40 % de contenido social.

No se trata de un modelo fusionado ni independiente: es un artefacto intermedio diseñado para reanudar un entrenamiento interrumpido o continuar con más pasos. Su relevancia radica en que permite reproducir o extender experimentos de RL para modelos de visión-lenguaje (VLM) sin partir de cero, ahorrando tiempo de cómputo. El tamaño del repositorio es de 11,8 GB, coherente con los shards de estado de optimización.

Dado que es un checkpoint de entrenamiento, no es directamente utilizable para inferencia en producción. Para usarlo, es necesario cargar el modelo base Qwen3-VL-4B-Instruct y aplicar el adaptador LoRA, o bien reanudar el entrenamiento con EasyR1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3-VL-4B-Instruct (VLM transformer) |
| Parametros totales | no disponible (el adaptador LoRA tiene parametros propios, no especificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no indicada) |
| Tipos de cuantizacion | no disponible (es un checkpoint de entrenamiento, no pesos cuantizados) |
| Idiomas soportados | no disponible (heredados del modelo base, no indicados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags), junto con shards FSDP y estado de optimizador |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-VL-4B-Instruct, un VLM de 4 000 millones de parametros con arquitectura transformer multimodal. Sobre este base se ha entrenado un adaptador LoRA mediante el framework EasyR1, que implementa aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) para modelos de vision-lenguaje. El entrenamiento se ha realizado con una mezcla de datos compuesta por un 60 % de tareas STEM (ciencia, tecnologia, ingenieria y matematicas) y un 40 % de tareas sociales.

El checkpoint corresponde al paso 100 e incluye el estado completo de FSDP (modelo y optimizador), el estado del dataloader y el adaptador LoRA. No se especifican detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. La informacion disponible no detalla innovaciones tecnicas especificas mas alla del uso de GRPO y la mezcla de dominios.

## Capacidades

- Al ser un adaptador LoRA sobre Qwen3-VL-4B-Instruct, hereda las capacidades del modelo base: comprension de imagenes y texto, generacion de respuestas, razonamiento visual y seguimiento de instrucciones.
- El entrenamiento con GRPO sobre una mezcla STEM/social busca mejorar el razonamiento en tareas cientificas y sociales, aunque no se han publicado evaluaciones que confirmen mejoras concretas.
- No se ha documentado soporte para tool calling, function calling, agentes o modo thinking especifico.
- Las capacidades multilingues dependen del modelo base, pero no se han verificado para este adaptador.
- No se ha indicado soporte para audio ni otras modalidades mas alla de imagen y texto.

## Casos de uso

- Reanudacion de entrenamiento de RL: el caso principal es continuar un entrenamiento interrumpido de EasyR1, cargando el checkpoint completo para seguir optimizando el adaptador LoRA sin perder el progreso acumulado.
- Investigacion en RL para VLM: permite reproducir experimentos de GRPO sobre Qwen3-VL-4B-Instruct con una mezcla de dominios STEM/social, util para estudiar el efecto de la distribucion de datos en el razonamiento visual.
- Fine-tuning continuado con nuevos datos: el checkpoint puede servir como punto de partida para entrenar con datasets adicionales, aprovechando el estado de optimizador y el dataloader guardados.
- Comparacion de estrategias de mezcla de datos: junto con otros checkpoints del mismo autor (por ejemplo, vlm-mix-stem60-geometry40-direct-step100), permite comparar como diferentes proporciones de dominios afectan al rendimiento final.
- Desarrollo de metodos de auto-preguntas: el autor ha trabajado en frameworks que descomponen preguntas visuales complejas en sub-preguntas mediante GRPO; este checkpoint podria usarse para experimentar con esa linea de investigacion.
- Validacion de infraestructura de entrenamiento: sirve para probar la correcta reanudacion de entrenamientos con FSDP y EasyR1 en diferentes entornos de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este checkpoint. Tampoco se han comparado metricas con el modelo base o con otros adaptadores.

## Requisitos de hardware

- Al ser un checkpoint de entrenamiento, los requisitos de hardware son los de un proceso de RL con FSDP sobre un modelo de 4 000 millones de parametros.
- Se recomienda al menos una GPU con 24 GB de VRAM para cargar el modelo base y el adaptador en precision fp16, aunque el entrenamiento con FSDP suele requerir multiples GPUs (por ejemplo, 4x A100 40 GB o 8x RTX 4090 24 GB) para un rendimiento razonable.
- El tamano del repositorio (11,8 GB) incluye shards de optimizador, que ocupan mas espacio que los pesos del modelo; se necesita almacenamiento adicional para el estado completo.
- Para inferencia tras fusionar el adaptador, el modelo base Qwen3-VL-4B-Instruct puede ejecutarse en una GPU consumer como RTX 3090 o RTX 4090 con cuantizacion, pero este checkpoint no esta pensado para ese fin.
- Las opciones de despliegue tipicas para el modelo base incluyen vLLM, llama.cpp, Ollama o TGI, pero no se han probado con este adaptador especifico.

## Comparativa con modelos similares

| Modelo | Base | Mezcla de datos | Paso | Tipo |
|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-stem60-social40-step100 | Qwen3-VL-4B-Instruct | 60 % STEM, 40 % social | 100 | Checkpoint de reanudacion |
| Saraswathy/vlm-mix-stem60-geometry40-direct-step100 | Qwen3-VL-4B-Instruct | 60 % STEM, 40 % geometria | 100 | Checkpoint directo |
| Saraswathy/vlm-mix-broader-stem-expert-step100 | Qwen3-VL-4B-Instruct | STEM ampliado | 100 | Checkpoint directo |

Los tres modelos comparten la misma base y el mismo paso de entrenamiento, diferenciandose en la composicion de los datos de entrenamiento. No se dispone de comparaciones de rendimiento entre ellos. No se han identificado modelos comparables de otros autores en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo fusionado: requiere el modelo base Qwen/Qwen3-VL-4B-Instruct y el adaptador LoRA para cualquier uso, ya sea reanudar entrenamiento o inferencia.
- Licencia no especificada: no se indica bajo que licencia se distribuye este checkpoint, lo que limita su uso comercial sin consultar al autor.
- Sin datos de evaluacion: no hay benchmarks publicados que demuestren la calidad del adaptador entrenado.
- Riesgo de alucinacion: heredado del modelo base, que puede generar respuestas incorrectas o inventadas, especialmente en tareas visuales complejas.
- Limitaciones de contexto e idioma: no se han verificado las capacidades multilingues ni la longitud de contexto efectiva tras el entrenamiento.
- Fecha de creacion futura (2026-08-24): el repositorio indica una fecha de creacion posterior a la actual, lo que sugiere que podria tratarse de un artefacto experimental o de una fecha incorrecta en los metadatos.
- No apto para produccion: al ser un checkpoint de entrenamiento, no esta optimizado para inferencia de baja latencia ni para despliegue en entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-stem60-social40-step100
- Modelo relacionado (vlm-mix-stem60-geometry40-direct-step100): https://huggingface.co/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
- Modelo relacionado (vlm-mix-broader-stem-expert-step100): https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
- Pagina de FriendliAI para un modelo similar: https://friendli.ai/models/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
- Sitio web del autor: https://saraamjith.com/saraamjith.html
