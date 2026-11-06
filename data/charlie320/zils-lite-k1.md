# Charlie320/zils-lite-k1

## Resumen

zils-lite-k1 es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) destinado al pool de modelos tipo "soup" denominado Zils `d3-lite`, asociado a la subnet 127 de Bittensor. El modelo se distribuye con licencia Apache-2.0 y en formato safetensors, con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB.

La relevancia del modelo es acotada y muy específica: no se trata de un modelo generalista pensado para competición con los grandes modelos de propósito general, sino de una pieza dentro de un ecosistema de agregación de pesos (model soup) orientado a tareas de decisión. El autor indica que los pesos de lenguaje han sido entrenados y que la torre de visión procede del modelo padre, lo que sugiere una arquitectura multimodal heredada de Qwen3.5-0.8B.

La información pública disponible es escasa: no hay datos de benchmarks, idiomas declarados, pipeline ni métricas de rendimiento. La model card describe el proceso de entrenamiento como un ajuste fino de todos los parámetros (full-parameter fine-tune) partiendo de la media uniforme de tres "house bodies" del pool, todos ellos con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); no se detalla en la model card |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ha sometido a un ajuste fino de todos los parámetros ("full-parameter fine-tune") a través del "chassis" del pool Zils `d3-lite`. El punto de partida no es el modelo base original, sino la media uniforme de los pesos de tres cuerpos del pool: vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full, todos ellos con licencia Apache-2.0. Este enfoque de agregación de pesos (model soup) seguido de un ajuste fino completo es la innovación técnica principal descrita.

En cuanto a los datos de entrenamiento, la model card indica que se compone de "preguntas computadas generadas por el proyecto" y splits de entrenamiento públicos bajo sus propias licencias, sin especificar número de tokens, composición detallada ni si hubo fases de RLHF o DPO. La torre de visión se hereda del modelo padre sin que se detalle si se ha reentrenado. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas de Qwen3.5-0.8B, sin evaluación publicada específica para este fine-tune.
- Visión: incluye la torre de visión procedente del modelo padre, por lo que se espera soporte de entrada multimodal de imagen, aunque no se documenta su comportamiento tras el ajuste.
- Modelo de decisión: el tag `decision-model` sugiere un uso orientado a tareas de decisión dentro del pool Zils, sin que se detalle el formato de salida.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de modelos agregados en pools descentralizados: el modelo sirve como cuerpo candidato dentro de la subnet 127 de Bittensor, donde se puede comparar su rendimiento frente a otros cuerpos del pool `d3-lite` en tareas de decisión.
- Experimentación con model soup: útil para investigadores que quieran reproducir o analizar el efecto de promediar pesos de tres fine-tunes y aplicar después un ajuste completo sobre el resultado.
- Clasificación y decisión ligera en entornos con recursos limitados: con menos de 1.000 millones de parámetros, puede desplegarse en GPU de consumo para tareas de decisión de baja latencia, siempre que se valide su calidad en el dominio concreto.
- Prototipado multimodal: al conservar la torre de visión del padre, permite experimentar con entradas de imagen en un modelo pequeño, aunque requiere validación empírica previa.
- Base para nuevos fine-tunes: al estar bajo Apache-2.0 y en safetensors, puede servir como punto de partida para ajustes posteriores en dominios específicos.
- Investigación sobre linaje de pesos: permite estudiar cómo se comporta un modelo entrenado desde una media de pesos frente a uno entrenado desde el checkpoint original de Qwen3.5-0.8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en muchos casos sobredimensionadas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 6 GB o más en BF16 y en GPUs con 4 GB si se cuantiza.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión), aunque no se ha verificado el soporte explícito para esta variante concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-k1 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune de Qwen3.5-0.8B desde media de tres cuerpos del pool Zils |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base del que parte este fine-tune |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Uno de los tres cuerpos promediados en el pool |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Uno de los tres cuerpos promediados en el pool |
| zils-ai/jiwo-0.8b-full | no disponible | no disponible | Apache-2.0 | Uno de los tres cuerpos promediados en el pool |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar su calidad frente al modelo base u otros fine-tunes.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento más allá de "preguntas computadas generadas por el proyecto" y splits públicos, no es posible evaluar sesgos.
- Riesgo de alucinación: inherente a los modelos de 0,8B parámetros; sin evaluación específica, debe asumirse un riesgo elevado en tareas de conocimiento factual.
- Idiomas no declarados: no se especifica qué idiomas cubre el ajuste, por lo que el rendimiento fuera del inglés (o del idioma dominante del dataset) es incierto.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras el ajuste.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento proceden de splits públicos con sus propias licencias; el autor recomienda verificar los términos de los datasets originales antes de reutilizar el modelo.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día, lo que indica que no ha pasado por validación comunitaria.
- Uso previsto restringido: está diseñado como cuerpo de un pool de decisión concreto; su comportamiento fuera de ese contexto no está garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-k1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo del pool: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo del pool: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo del pool: https://huggingface.co/zils-ai/jiwo-0.8b-full
