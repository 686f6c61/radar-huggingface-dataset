# mx297/EO-Jev

## Resumen

EO-Jev es un modelo de decisión para observación de la Tierra (Earth observation, EO) desarrollado por el autor `mx297` y vinculado al grupo MBZUAI-ORYX. Se trata de un ajuste fino del modelo base `vllm-sr/d3-flash` (8.400 millones de parámetros, construido sobre Qwen3.5-9B) al que se le han incorporado adaptadores LoRA entrenados sobre particiones de entrenamiento de conjuntos de datos públicos de teledetección. El resultado es un modelo multimodal de visión y lenguaje especializado en responder preguntas sobre imágenes de satélite y aéreas.

La particularidad del modelo es su interfaz de salida: no genera texto libre, sino que devuelve una distribución de probabilidad sobre un conjunto cerrado de respuestas permitidas en una única pasada hacia delante. Esto permite umbralizar la confianza por pregunta, aceptar automáticamente las respuestas seguras y derivar las inciertas a un analista humano. La arquitectura, la interfaz y el coste de inferencia son idénticos a los de d3-flash, ya que los adaptadores se fusionan en los pesos finales.

El modelo es relevante porque demuestra que un ajuste fino ligero y específico de dominio puede superar a especialistas abiertos de EO en la mayoría de configuraciones evaluadas, manteniendo un throughput muy superior y una calibración de probabilidades mejor. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje) con capas de atención lineal; derivada de Qwen3.5-9B vía d3-flash |
| Parámetros totales | 8.392.695.024 (8,4B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,8 GB) |

## Arquitectura y entrenamiento

EO-Jev hereda la arquitectura de d3-flash, un modelo multimodal que combina una torre de texto, un fusionador (merger) de visión y bloques de visión, con capas de atención lineal para las que se ofrecen kernels opcionales mediante `flash-linear-attention`. El ajuste se realizó con adaptadores LoRA de rango 32 en la torre de texto, rango 64 en el fusionador de visión y rango 16 en los bloques de visión (entrenados a 0,2× la tasa de aprendizaje). Los adaptadores se fusionaron posteriormente en los pesos, de modo que el checkpoint final no añade coste de inferencia respecto al modelo base.

Los datos de entrenamiento se construyeron a partir de particiones de entrenamiento de conjuntos públicos de EO: etiquetas de escena y uso del suelo, presencia y conteo de objetos, VQA visual, cambio multitemporal, daño en edificios y tipo de desastre, y geolocalización. Aproximadamente el 20 % de cada lote replica datos de decisión generales usando como objetivos las propias probabilidades de d3-flash, para preservar sus capacidades generales. La función de pérdida es divergencia KL hacia la distribución objetivo, que puede ser one-hot, etiquetas ordinales suaves (SORD) para conteos y niveles de daño, o las probabilidades del modelo base. Se eliminaron todas las imágenes de entrenamiento que duplicaban o recortaban imágenes de evaluación. El cómputo declarado en la model card se trunca en "20," (probablemente horas o GPUs), por lo que no se puede confirmar el dato completo.

## Capacidades

- Clasificación de escena y uso del suelo mediante preguntas de tipo `choice` con hasta 255 opciones.
- Detección de presencia de objetos con preguntas de tipo `noul` (sí/no), devolviendo la probabilidad de "sí".
- Conteo de objetos y estimación de niveles ordinales (por ejemplo, daño en edificios) mediante preguntas de tipo `score` con 2 a 10 niveles ordenados.
- VQA visual sobre imágenes de satélite y aéreas.
- Razonamiento multitemporal: acepta varias imágenes en una misma petición (pares pre/post-evento o series temporales) indicando en el estado qué imagen es cuál.
- Geolocalización y clasificación de tipo de desastre a partir de las particiones de entrenamiento empleadas.
- Salida calibrada: cada respuesta incluye la opción elegida, las probabilidades por opción y una confianza umbralizable.
- Respuesta a múltiples preguntas sobre la misma imagen o conjunto de imágenes en una sola llamada.
- Integración como pipeline de `transformers` (`pipeline("decision", ...)`).
- No se declara soporte de tool calling, agentes ni modo de razonamiento explícito (thinking).

## Casos de uso

- Monitorización de uso del suelo a escala regional: el modelo clasifica escenas en categorías como aeropuerto, puerto, aparcamiento, zona residencial o cultivo en una sola pasada, lo que permite procesar grandes volúmenes de teselas con un throughput alto y umbralizar la confianza para revisión humana.
- Evaluación de daños tras desastres: con un par de imágenes pre y post-evento en la misma petición, responde con un nivel ordinal de daño ("sin daño", "leve", "grave", "destruido") y su distribución de probabilidad, lo que facilita el triaje automático de edificios afectados.
- Conteo de objetos en imágenes aéreas: preguntas de tipo `score` con niveles ordinales permiten estimar cuántos aviones, vehículos o barcos hay en una escena, con etiquetas suaves (SORD) que reflejan la incertidumbre entre conteos adyacentes.
- Verificación de presencia de infraestructura: preguntas de tipo `noul` ("¿hay un coche en esta imagen?", "¿hay una pista pavimentada?") devuelven una probabilidad de "sí" que se puede usar como filtro previo en pipelines de detección.
- Enrutamiento con revisión humana: gracias a la calibración de las probabilidades, un umbral por pregunta permite aceptar automáticamente las respuestas de alta confianza y derivar solo las inciertas a un analista, reduciendo la carga de revisión manual.
- Análisis multitemporal de series de imágenes: al admitir varias imágenes por petición, se puede consultar la evolución de una zona a lo largo del tiempo (por ejemplo, crecimiento urbano o cambios en cultivos) sin reentrenar el modelo.
- Procesamiento por lotes en pipelines de teledetección: con un throughput declarado de 6,4× el del mejor especialista abierto (cada uno a su mejor tamaño de lote) y 3,2× con una pregunta por llamada, es adecuado para ingerir grandes archivos de imágenes satelitales en producción.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre 30 configuraciones de evaluación de 23 benchmarks públicos de EO:

| Métrica | Resultado |
|---|---|
| Configuraciones con mejora significativa sobre d3-flash | 26 / 30 |
| Mejora media (partición de entrenamiento usada) | +23,8 puntos |
| Mejora media (12 configuraciones no vistas en adaptación) | +8,0 puntos |
| Configuraciones iguales o superiores al mejor especialista abierto de EO | 20 / 28 |
| Configuraciones con menor error de calibración esperado que el especialista | 21 / 28 |
| Throughput mediano frente al mejor especialista (mejor tamaño de lote) | 6,4× |
| Throughput con una pregunta por llamada | 3,2× |
| Coste en decisiones generales (no EO) | −1,8 puntos |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros), por lo que no se incluyen cifras por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (8,4B parámetros en bf16/fp16): aproximadamente 17 GB solo para pesos, más memoria para activaciones y el codificador visual; se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para despliegue en producción; RTX 4090 (24 GB) es viable en bf16 para una sola petición.
- En GPUs de consumo con menos de 24 GB sería necesaria cuantización, pero el repo no publica variantes cuantizadas (GGUF, AWQ, GPTQ), por lo que no se puede confirmar su disponibilidad.
- Opciones de despliegue: `transformers` (versión 5.17.0 según la model card), con kernels opcionales `flash-linear-attention` para las capas de atención lineal; también se expone como pipeline `decision`. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card reporta 6,4× el throughput mediano del mejor especialista abierto de EO (cada uno a su mejor tamaño de lote) y 3,2× con una pregunta por llamada; no se publican valores absolutos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EO-Jev | 8,4B | no disponible | Decisión multimodal EO con probabilidades calibradas | Apache 2.0 | HuggingFace |
| d3-flash (base) | 8,4B | no disponible | Decisión multimodal general (no específica de EO) | no disponible en la información | HuggingFace |
| Especialistas abiertos de EO | no disponible | no disponible | Clasificación/VQA específicos de teledetección | no disponible | no disponible |

La model card compara EO-Jev con d3-flash y con "el mejor especialista abierto de EO" en 28 configuraciones, pero no identifica por nombre a dichos especialistas ni publica sus especificaciones, por lo que no se puede completar una comparativa detallada con alternativas concretas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El ajuste a EO tiene un coste medido de −1,8 puntos en decisiones generales (no EO) respecto a d3-flash, por lo que no es adecuado como modelo de propósito general.
- Las probabilidades están calibradas a la temperatura del checkpoint; cambiar la temperatura o el preprocesado puede invalidar los umbrales de confianza.
- La calidad de la respuesta depende de que las opciones proporcionadas sean cortas, distintas y cubran la respuesta correcta; si la respuesta verdadera no está entre las opciones, el modelo no puede indicarlo salvo que se incluya una opción como "ninguna de estas".
- Riesgo de alucinación estructuralmente reducido al no generar texto libre, pero las distribuciones de probabilidad pueden ser erróneas o excesivamente confiadas en escenas fuera de la distribución de entrenamiento (sensores, resoluciones o regiones geográficas no representadas).
- No se documentan sesgos geográficos o demográficos específicos, pero al entrenar sobre conjuntos públicos de EO es probable que herede los sesgos de cobertura de dichos datasets (sobrerrepresentación de determinadas regiones y tipos de escena).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base d3-flash y Qwen3.5-9B tienen sus propias condiciones que conviene verificar antes de un despliegue comercial.
- El código de ejecución (`d3_runtime.py` y otros ficheros `d3_*.py`) es el runtime de d3-flash sin modificar y requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- La información de cómputo de entrenamiento está truncada en la model card ("20,"), por lo que no se puede verificar la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mx297/EO-Jev
- Modelo base d3-flash: https://huggingface.co/vllm-sr/d3-flash
- Paper (arXiv:2611.03371): https://arxiv.org/abs/2611.03371
- Página del proyecto: https://mbzuai-oryx.github.io/EO-Jev/
- Código: https://github.com/mbzuai-oryx/EO-Jev
