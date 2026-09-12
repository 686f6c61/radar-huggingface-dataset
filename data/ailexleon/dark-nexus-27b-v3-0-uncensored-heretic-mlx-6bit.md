# ailexleon/Dark-Nexus-27B-v3.0-uncensored-heretic-mlx-6Bit

## Resumen

Dark-Nexus-27B-v3.0-uncensored-heretic-mlx-6Bit es una conversion a formato MLX del modelo llmfan46/Dark-Nexus-27B-v3.0-uncensored-heretic, publicada por el usuario ailexleon. Se trata de una cuantizacion a 6 bits pensada para ejecutarse en Apple Silicon mediante la libreria mlx-vlm (version 0.7.0), lo que permite desplegar un modelo de aproximadamente 27.360 millones de parametros en equipos con memoria unificada. El repositorio ocupa 22,8 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

El modelo hereda el enfoque del proyecto original: un ajuste orientado a escritura creativa, roleplay, interpretacion de personajes y narracion, con etiquetas que lo describen como "uncensored" y "heretic", lo que sugiere un entrenamiento deliberadamente alineado fuera de las restricciones habituales de seguridad. La etiqueta de arquitectura declarada es qwen3_5, lo que apunta a una base de la familia Qwen3.5, aunque no se detallan el numero de tokens de entrenamiento ni la composicion del dataset.

La relevancia de esta ficha es acotada: se trata de un derivado cuantizado de un modelo comunitario, sin documentacion tecnica propia y con resultados de benchmarks no publicados. Su interes practico reside en la posibilidad de ejecutar un modelo de ~27B en local sobre hardware Apple, algo que con pesos en precision completa seria inviable en la mayoria de equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta declarada: qwen3_5) |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits en formato MLX |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. La etiqueta qwen3_5 sugiere que el modelo base emplea la arquitectura de la familia Qwen3.5, presumiblemente un transformer con atencion por grupos (GQA) o similar, pero no hay confirmacion en la documentacion facilitada. Tampoco se especifica si se trata de un modelo denso o de mezcla de expertos (MoE); dado el tamano de 27,36B parametros, ambas opciones son plausibles.

Respecto al entrenamiento, unicamente se sabe que el modelo original fue ajustado para tareas de escritura creativa, roleplay y narrativa, y que su denominacion incluye los terminos "uncensored" y "heretic", lo que indica un proceso de ajuste orientado a reducir o eliminar rechazos de contenido. No hay datos sobre numero de tokens, composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. La unica innovacion tecnica documentada de esta version concreta es la conversion a MLX 6 bits mediante mlx-vlm 0.7.0, que permite inferencia local en Apple Silicon con vision (image-text-to-text).

## Capacidades

- Generacion de texto para escritura creativa, narrativa y storytelling.
- Roleplay e interpretacion de personajes (character-rp), con conversaciones multi-turno.
- Conversacion general en ingles.
- Capacidades de vision declaradas por el pipeline_tag image-text-to-text; el README muestra un ejemplo de descripcion de imagenes con `--image`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: unicamente ingles segun la etiqueta de idioma.
- Modo "thinking" o razonamiento explicito: no disponible.
- Ajuste orientado a contenido sin filtros (uncensored / heretic).

## Casos de uso

- Escritura creativa asistida: el modelo puede generar relatos, dialogos y tramas narrativas en ingles, aprovechando su ajuste especifico para storytelling.
- Roleplay de personajes: adecuado para aplicaciones de chatbot con personalidad definida y conversaciones prolongadas, gracias a su entrenamiento en character-rp.
- Prototipado local en Apple Silicon: permite a desarrolladores probar un modelo de ~27B en un Mac sin depender de servicios en la nube, usando MLX.
- Generacion de guiones y ficcion interactiva: util para videojuegos narrativos o experiencias de ficcion conversacional donde se requiere un tono sin restricciones de contenido.
- Experimentacion en investigacion sobre alineacion: al ser un modelo "uncensored", sirve como referencia para estudiar el comportamiento de modelos sin salvaguardas frente a otros alineados.
- Descripcion de imagenes (vision): segun el ejemplo del README, puede generar descripciones de imagenes en ingles mediante mlx-vlm, aunque la fiabilidad de esta capacidad no esta documentada.
- Cuantizacion y despliegue MLX: sirve como caso de estudio para convertir y ejecutar modelos grandes en formato MLX 6 bits con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: 22,8 GB en cuantizacion de 6 bits (safetensors / MLX).
- Memoria estimada para inferencia: en torno a 24-30 GB de memoria unificada para el modelo mas el contexto y las activaciones.
- Hardware recomendado: equipos Apple Silicon con memoria unificada de 32 GB o superior (por ejemplo, Mac Studio o MacBook Pro con M2/M3/M4 Max o Ultra).
- Cabe en GPU de consumo: no aplica directamente, ya que MLX esta disenado para Apple Silicon. Una RTX 4090 de 24 GB quedaria al limite o por debajo de lo necesario en 6 bits y no ejecutaria MLX de forma nativa.
- Opciones de despliegue: mlx-vlm (libreria oficial de esta conversion); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Nexus-27B-v3.0-uncensored-heretic-mlx-6Bit | ~27,36B | no disponible | MLX safetensors 6 bits | no disponible | HF (mlx) |
| Dark-Nexus-27B-v3.0-uncensored-heretic (base) | no disponible | no disponible | no disponible | no disponible | HF |
| Otros modelos de roleplay de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no se puede verificar el rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Licencia no disponible: no queda claro si se permite el uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Modelo "uncensored" y "heretic": puede generar contenido sin filtros, con riesgo de producir material ofensivo, ilegal o danino; requiere moderacion adicional en cualquier despliegue publico.
- Idioma: soporte declarado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: propio de modelos generativos, agravado por la falta de documentacion y evaluacion.
- Limitaciones de contexto: la longitud de contexto no esta especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Repositorio sin traccion: 0 descargas y 0 likes, sin comunidad que valide su calidad o estabilidad.
- Dependencia de MLX: solo se ejecuta en Apple Silicon; no es portable a CUDA sin reconvertir los pesos.
- Capacidad de vision no verificada: la etiqueta image-text-to-text y el uso de mlx-vlm apuntan a soporte multimodal, pero no hay evaluacion publicada al respecto.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/ailexleon/Dark-Nexus-27B-v3.0-uncensored-heretic-mlx-6Bit
- Modelo base: https://huggingface.co/llmfan46/Dark-Nexus-27B-v3.0-uncensored-heretic
- Libreria mlx-vlm: no disponible en la informacion (el README menciona mlx-vlm 0.7.0)
- Los resultados de busqueda web facilitados no contienen informacion relevante sobre el modelo (corresponden a contenidos de Pinterest y Zhihu sin relacion).
