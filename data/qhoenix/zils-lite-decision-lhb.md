# qhoenix/zils-lite-decision-lhb

## Resumen

zils-lite-decision-lhb es un modelo de decisión de 0,8B parámetros desarrollado por el usuario qhoenix (bajo la etiqueta Zils) a partir de Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: su pipeline declarado es `feature-extraction` y su propósito es emitir decisiones estructuradas en el denominado "formato de examen Zils", con puntuaciones calibradas (entrenamiento con entropía cruzada suave y pérdida de Brier). Se distribuye en BF16 dentro del chasis fijado como "d3-lite" y con licencia Apache-2.0.

El modelo se construye mediante un *soup* (promediado uniforme de pesos) de cuatro fine-tunes completos realizados desde un punto de partida que, a su vez, es la media uniforme de cuatro cuerpos Apache-2.0: vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full. El entrenamiento se hizo sobre aproximadamente 98.000 ítems de decisión, con un anclaje KL (0,1) al modelo inicial para limitar la deriva respecto al punto de partida.

Su relevancia es acotada y muy específica: se trata de un experimento de destilación y mezcla de modelos pequeños orientado a tareas de clasificación/decisión con salida calibrada, no a generación abierta ni a razonamiento general. El repositorio no registra descargas ni interacciones en el momento de la consulta y no publica idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de 0,85B parámetros, reutilizado aquí como cuerpo para una tarea de decisión. El modelo se empaqueta con `custom_code` y se etiqueta como `qwen3_5`, lo que implica que la carga requiere `trust_remote_code=True` en transformers. El chasis "d3-lite" fija el diseño de cabecera y el formato de salida esperado.

El proceso de construcción tiene tres fases documentadas. Primero, un promediado uniforme de pesos de cuatro modelos Apache-2.0 (vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full). Segundo, cuatro fine-tunes completos de los pesos de lenguaje desde ese punto de partida, con lr 5e-6, una época y semillas distintas, sobre unos 98.000 ítems en formato de examen Zils: splits TRAIN públicos con etiquetas gold y elementos generados por Claude, GPT-5.4, DeepSeek y otros a partir de splits TRAIN públicos de datasets de uso comercial, conservando ítems de dominio nuevo solo cuando un modelo de otro proveedor respondía a ciegas de la misma forma. La función de pérdida combina entropía cruzada suave y Brier, con un anclaje KL de 0,1 al modelo inicial. Tercero, promediado uniforme de los cuatro fine-tunes para obtener el cuerpo final. El autor declara que no se usaron semillas de examen ni splits de validación o test en el entrenamiento.

## Capacidades

- Emisión de decisiones estructuradas en el formato de examen Zils, con puntuaciones calibradas gracias a la pérdida de Brier.
- Clasificación y selección entre opciones dentro de dominios cubiertos por los datos de entrenamiento (decisiones de tipo examen).
- Extracción de características (`feature-extraction`) como pipeline declarado, útil para obtener representaciones del texto de entrada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Enrutamiento de decisiones binarias o de opción múltiple en pipelines internos: el modelo recibe un ítem en formato de examen y devuelve una decisión con puntuación calibrada, aprovechable como clasificador ligero en un servicio de inferencia.
- Evaluación automática de ítems tipo test: dado un enunciado y opciones, el modelo puede puntuar alternativas y servir como componente de un sistema de corrección o de generación de exámenes.
- Filtrado y priorización de contenido: usar la salida de decisión para descartar o marcar candidatos en un proceso de curación de datos, con la ventaja de sus 0,85B parámetros para despliegue de bajo coste.
- Componente de un ensemble o router: al ser un modelo pequeño y Apache-2.0, puede integrarse como cabeza de decisión junto a modelos mayores que aporten el razonamiento y la generación.
- Extracción de representaciones para búsqueda semántica o clustering: el pipeline `feature-extraction` permite obtener embeddings de texto para indexación o agrupación en dominios afines a los datos de entrenamiento.
- Experimentación e investigación en mezcla de modelos (model soup) y destilación: el repositorio documenta con detalle la receta, lo que lo hace útil como referencia reproducible para estudiar promediado de pesos y anclaje KL en modelos pequeños.
- Prototipado en local: con 0,85B parámetros en BF16 (unos 1,7 GB de pesos), cabe en GPU de consumo y permite iterar sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,7-2 GB solo para pesos, más overhead de activaciones y contexto; un presupuesto práctico de 4-6 GB es razonable para secuencias cortas.
- Cuantización: no se publican versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16; RTX 3060/4060, RTX 4090, A100 y H100 son sobredimensionadas para el modelo pero válidas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes con 6 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM, llama.cpp, Ollama o TGI no están confirmados para este chasis y requerirían verificación previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-lhb | 0,85B | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face (0 descargas) |
| internlm/Intern-Decision-0.8B | ~0,8B | no disponible | Decisión | no disponible en la información | Hugging Face (usado como fuente del soup) |
| Maincode/Matilda-Decision-v1-Edge | ~0,8B | no disponible | Decisión | no disponible en la información | Hugging Face (usado como fuente del soup) |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | Generación general | no disponible en la información | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo conversacional ni de generación abierta; su uso previsto es la emisión de decisiones en un formato concreto.
- Riesgo de sobreajuste al formato de examen Zils: fuera de ese esquema de entrada, el comportamiento no está documentado.
- Sin datos de benchmarks, validación ni test publicados: no hay evidencia cuantitativa de calidad fuera del conjunto de entrenamiento.
- Idiomas soportados no declarados: no puede asumirse un rendimiento multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso con entradas largas sin verificación empírica.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.
- El entrenamiento incluyó datos generados por modelos de terceros (Claude, GPT-5.4, DeepSeek) con filtrado por acuerdo entre proveedores, lo que puede introducir sesgos de esos generadores.
- Sin tracción en el repositorio (0 descargas, 0 likes) y sin validación de la comunidad: tratar como experimental.
- Licencia Apache-2.0 permite uso comercial, pero las licencias de los modelos fuente del soup deben revisarse por separado si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-lhb
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fuente del soup: https://huggingface.co/vllm-sr/d3-lite
- Fuente del soup: https://huggingface.co/internlm/Intern-Decision-0.8B
- Fuente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Fuente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
