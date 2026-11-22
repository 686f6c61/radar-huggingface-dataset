# bearzi/Qwen3.8-Flash-Next-oQ2e

## Resumen

Qwen3.8-Flash-Next-oQ2e es una cuantizacion de 2 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario bearzi bajo el ecosistema oMLX. Se trata de un artefacto de pesos en formato MLX (safetensors) pensado para ejecucion en Apple Silicon, con un total de 183.599.998.739 parametros y un tamano de repositorio de 103,9 GB. No es un modelo entrenado desde cero, sino una conversion agresiva del modelo base de Qwen con el cuantizador oQ de oMLX en su modo oQe, incluyendo la tecnica de refinamiento de redondeo identificada como #5292.

La relevancia de esta ficha es acotada: el propio autor advierte de que la cuantizacion a 2 bits supone un deterioro de calidad considerable, con una divergencia KL frente a BF16 aproximadamente siete veces superior a la de su build de 4 bits. Por tanto, el modelo esta destinado a escenarios donde la memoria es el factor limitante y no existe alternativa a 3 o 4 bits. La model card indica que la publicacion esta en curso (release 2) y que las secciones de instalacion y velocidad se anadiran mas adelante.

El modelo base Qwen3.8-Flash-Next pertenece a la familia Qwen y se distribuye bajo la Qwen Community License 1.0. No se dispone de informacion sobre arquitectura interna, contexto o datos de entrenamiento en la informacion proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; pesos en formato MLX) |
| Parametros totales | 183.599.998.739 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits en expertos enrutados y 8 bits en el resto de matrices; tabla PLE en FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen3.8-Flash-Next en los datos proporcionados: no se detalla si es un transformer denso, un MoE, un modelo hibrido ni cuales son sus mecanismos de atencion. El unico dato estructural inferible es la presencia de "expertos enrutados" (routed experts) mencionada en la model card, lo que sugiere una arquitectura de mezcla de expertos, aunque no se confirma el numero de expertos ni los parametros activos por token.

Respecto al proceso de cuantizacion, la model card describe que todas las matrices cuantizadas son affine estandar de MLX: 2 bits para los expertos enrutados y 8 bits para el resto, el mismo plan de bits que la build oQ2eL. La tabla de embeddings por capa (PLE) se ha trasplantado en FP8 desde la tabla oficial de Qwen. Se aplico el refinamiento de redondeo oQe de oMLX (#5292). El autor indica que el modelo carga y ejecuta un forward en el runtime release-2 del fork sin necesidad de plugin, y que deberia cargar en oMLX upstream al ser affine estandar con tabla PLE en FP8, aunque esto ultimo no se probo. No se proporcionan datos sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto: el modelo base es un modelo de lenguaje, aunque no se detallan capacidades especificas en la informacion disponible.
- Razonamiento y codigo: la model card referencia mediciones de divergencia KL en dominios de "codigo" y "prosa", lo que sugiere evaluacion en ambos tipos de contenido, pero no se confirman capacidades concretas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Decodificacion especulativa: la model card menciona MTP (multi-token prediction) con borradores aceptados por ciclo de verificacion, lo que indica soporte de decodificacion especulativa en el runtime de oMLX.

## Casos de uso

- Inferencia en Apple Silicon con memoria limitada: el modelo esta empaquetado en MLX y ocupa unos 104 GB, por lo que puede ejecutarse en equipos con memoria unificada alta (por ejemplo, un Mac Studio o Mac Pro con 128 GB o mas) donde una build de 4 bits no cabria junto al resto del sistema.
- Pruebas de calidad de cuantizacion: util como referencia para medir el impacto de la cuantizacion a 2 bits frente a BF16 y frente a la build oQ2eL de 4 bits, usando las metricas KL publicadas.
- Prototipado local sin GPU dedicada: permite experimentar con un modelo de 183.600 millones de parametros en hardware de Apple, sin depender de servidores con A100 o H100.
- Evaluacion de pipelines de decodificacion especulativa: la model card reporta borradores MTP aceptados por ciclo, por lo que sirve para validar implementaciones de decodificacion especulativa en oMLX.
- Despliegue en entornos con restricciones de memoria estrictas: cuando el presupuesto de VRAM o memoria unificada impide cargar una cuantizacion de 3 o 4 bits, esta build es la unica opcion viable, asumiendo la perdida de calidad.
- Investigacion sobre tecnicas de cuantizacion: el uso del refinamiento oQe (#5292) y del trasplante de la tabla PLE en FP8 lo convierte en un caso de estudio para quienes investigan metodos de compresion de modelos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son metricas de divergencia KL frente a BF16 y de aceptacion de borradores MTP, medidas en un M3 Ultra con el runtime release-2:

| Metrica | oQ2e (este modelo) | oQ2eL (4 bits) |
|---|---|---|
| KL a BF16, codigo | 0,1369 | 0,1067 |
| KL a BF16, prosa | 0,2436 | 0,2008 |
| Borradores MTP aceptados por ciclo de verificacion (32 prompts; intervalo del 95 %) | 1,419 [1,292; 1,559] | 1,497 [1,354; 1,643] |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las velocidades de decodificacion y prefill en ambos Mac estan pendientes de publicacion segun la model card.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 103,9 GB y la model card indica "unos 104 GB", por lo que se necesita un equipo con al menos 104 GB de memoria disponible para los pesos, mas el margen para el contexto y el runtime.
- GPU recomendadas: no se especifican GPU CUDA; el formato es MLX, orientado a Apple Silicon. El autor midio en un M3 Ultra.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamano de los pesos. En Apple Silicon requiere configuraciones de memoria unificada de 128 GB o superiores.
- Opciones de despliegue: runtime oMLX (release-2 del fork del autor); se espera compatibilidad con oMLX upstream, aunque no se probo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card indica que las mediciones de velocidad estan en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ2e (este) | 183.599.998.739 | no disponible | 2 bits (expertos) / 8 bits (resto), PLE FP8 | qwen-community-1.0 | Hugging Face, formato MLX |
| bearzi/Qwen3.8-Flash-Next-oQ2eL | no disponible | no disponible | 4 bits (plan oQ2eL) | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 (referencia) | qwen-community-1.0 | Hugging Face |

La comparativa se limita a las builds del mismo autor y al modelo base, ya que no se dispone de informacion sobre modelos alternativos de la misma categoria en los datos proporcionados. La build oQ2eL presenta mejor KL (0,1067 en codigo y 0,2008 en prosa) y mejor aceptacion MTP (1,497) que la build de 2 bits, a costa de un mayor tamano.

## Limitaciones y advertencias

- Perdida de calidad significativa: el autor advierte explicitamente de que 2 bits supone un escalon grande de degradacion, con una KL frente a BF16 unas siete veces superior a la de la build de 4 bits.
- Uso recomendado restringido: solo deberia emplearse cuando la memoria descarte las cuantizaciones de 3 o 4 bits.
- Estado de publicacion incompleto: la model card indica que la release 2 esta en curso y que las secciones de instalacion y velocidad se anadiran mas adelante.
- Compatibilidad no verificada: la carga en oMLX upstream no se ha probado; solo se verifico en el runtime release-2 del fork.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la degradacion por cuantizacion a 2 bits puede agravarlo.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: los pesos heredan la Qwen Community License 1.0 del modelo base; es necesario revisar sus terminos para uso comercial.
- Ausencia de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni similares, lo que dificulta evaluar el rendimiento en tareas concretas.
- Cero adopcion registrada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ2e
- Build de 4 bits del mismo autor: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ2eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
