# Charlie320/zils-lite-k1b

## Resumen

zils-lite-k1b es un modelo de decisión de 853 millones de parámetros publicado por el usuario Charlie320 en HuggingFace. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B, entrenado a partir del promedio uniforme de tres "cuerpos" (bodies) del pool de sopa de modelos Zils `d3-lite`, asociado a la subred 127 de Bittensor. El modelo se distribuye en BF16 con pesos en safetensors y licencia Apache-2.0, y conserva la torre de visión del modelo padre.

El modelo está pensado como componente de un sistema mayor: actúa como "cuerpo" lingüístico dentro de una arquitectura de pool donde distintos modelos se combinan por promedio de pesos y se afinan a continuación con un fine-tune de parámetros completos sobre el "chassis" del pool. Su relevancia es, por tanto, principalmente experimental y de investigación: explora técnicas de model souping y afinamiento conjunto en un modelo pequeño que puede ejecutarse en hardware de consumo.

La información pública disponible es muy limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados ni publica resultados de benchmarks. La model card se limita a describir el proceso de entrenamiento y a advertir sobre las licencias de los datos originales. Cualquier evaluación de capacidades debe hacerse empíricamente por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B), con torre de visión heredada del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; se puede cuantizar a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplicó una técnica de model souping: se calculó el promedio uniforme de los pesos de tres modelos del pool `d3-lite` (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full), todos ellos con licencia Apache-2.0, y el resultado se sometió a un fine-tune de parámetros completos a través del "chassis" del pool. El modelo resultante se distribuye en BF16 e incluye la torre de visión del modelo padre, aunque la model card no detalla si dicha torre fue reentrenada o permanece congelada.

Los datos de entrenamiento consisten en preguntas computadas generadas por el propio proyecto y en particiones de entrenamiento públicas sujetas a sus respectivas licencias. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés técnico del modelo reside en el procedimiento de souping y afinamiento, no en cambios arquitectónicos propios.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-0.8B, aunque sin evaluación pública que lo confirme.
- Procesamiento de visión: conserva la torre de visión del modelo padre, por lo que en principio puede aceptar entradas de imagen, si bien no se documenta el formato exacto ni el rendimiento.
- Modelo de decisión: por su etiqueta `decision-model`, está orientado a tareas de clasificación o selección dentro de pipelines, aunque la model card no detalla el esquema de decisión.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en model souping: el modelo sirve como referencia para estudiar cómo el promedio de pesos de varios fine-tunes afecta al rendimiento final tras un afinamiento completo, comparándolo con cada uno de los modelos fuente.
- Prototipado de clasificadores ligeros: con 853 millones de parámetros y licencia Apache-2.0, puede desplegarse en una GPU de consumo para experimentar con tareas de decisión binaria o multiclase en entornos de laboratorio.
- Evaluación de pipelines de visión-lenguaje a pequeña escala: al conservar la torre de visión, permite probar flujos de imagen-texto en hardware modesto, siempre que se valide empíricamente la calidad de las respuestas.
- Componente de ensembles o pools: puede integrarse como "cuerpo" adicional en sistemas de agregación de modelos, como el propio pool Zils, para experimentar con combinaciones de pesos.
- Docencia y experimentación con fine-tuning completo: su tamaño reducido permite reproducir el proceso de entrenamiento en una sola GPU, lo que lo hace útil para cursos o talleres sobre ajuste de modelos.
- Pruebas de integración en Bittensor subnet 127: como parte del ecosistema Zils, puede utilizarse para validar el comportamiento del pool y comparar variantes de "chassis" en entornos de testnet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, entre 3 y 5 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantizaciones de 4 bits, cabe en GPUs de 4 GB como la GTX 1650.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas, incluidas las de gama media.
- Opciones de despliegue: vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI y transformers con PyTorch. La model card menciona vLLM como parte del ecosistema del pool.
- Latencia y throughput estimados: no disponibles; dependerán del backend y del hardware. En una RTX 4090 con vLLM en BF16, un modelo de este tamaño debería superar con holgura el centenar de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-k1b | 853 M | no disponible | Apache-2.0 | HuggingFace | Fine-tune de souping del pool Zils |
| Qwen/Qwen3.5-0.8B | ~800 M | no disponible | Apache-2.0 (según modelo base) | HuggingFace | Modelo base original, sin souping |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | HuggingFace | Uno de los cuerpos promediados |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | HuggingFace | Uno de los cuerpos promediados |
| zils-ai/jiwo-0.8b-full | no disponible | no disponible | Apache-2.0 | HuggingFace | Uno de los cuerpos promediados |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación pública: no hay benchmarks, ni comparativas, ni métricas de calidad; el rendimiento real es desconocido.
- Riesgo de alucinación: al ser un modelo pequeño afinado sobre datos generados por el propio proyecto, la fiabilidad factual puede ser baja y no está documentada.
- Idiomas no declarados: se desconoce si el modelo mantiene el multilingüismo de la base Qwen o si el fine-tune lo ha degradado hacia un subconjunto de idiomas.
- Contexto no especificado: se desconoce la longitud máxima de contexto efectiva tras el fine-tune.
- Datos de entrenamiento con licencias heterogéneas: la model card advierte explícitamente de que se usaron particiones públicas bajo sus propias licencias y recomienda revisar sus términos antes de reutilizar el modelo; aunque la licencia del modelo es Apache-2.0, las obligaciones de los datos subyacentes podrían afectar a usos comerciales.
- Madurez del ecosistema: el modelo pertenece a un pool experimental (Bittensor subnet 127) con cero descargas y cero likes en el momento de la consulta, sin garantías de mantenimiento.
- Sesgos: no documentados; al desconocerse la composición del dataset, no es posible evaluar sesgos de género, etnia o ideología.
- Uso en producción: no recomendado sin una evaluación previa exhaustiva en el dominio objetivo, dado que no hay evidencia de calidad ni de estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Charlie320/zils-lite-k1b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo promediado vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo promediado Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo promediado zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
