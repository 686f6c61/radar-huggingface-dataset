# neutronai-code/Hadron-4B-smoke

## Resumen

Hadron-4B-smoke es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario neutronai-code en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto como salida, manteniendo la arquitectura Qwen3.5 del modelo base. El repositorio ocupa 9,3 GB y contiene pesos en formato safetensors con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones).

La relevancia de este lanzamiento es limitada pero concreta: demuestra el flujo de trabajo de ajuste fino sobre Qwen3.5-4B utilizando Unsloth y la libreria TRL de Hugging Face, con el objetivo declarado de entrenar el doble de rapido. Es un modelo experimental (el sufijo "smoke" sugiere una prueba de humo o validacion del pipeline de entrenamiento) y no incluye documentacion tecnica detallada sobre el dataset, hiperparametros o evaluacion.

Al no publicarse informacion sobre el conjunto de datos de ajuste, el proceso de alineacion ni resultados de benchmarks, la ficha se limita a los datos verificables del repositorio y a las caracteristicas heredadas del modelo base Qwen3.5-4B, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con capacidad multimodal (entrada de imagen y texto). El autor no documenta detalles internos de la arquitectura, como el numero de capas, dimensiones ocultas, mecanismo de atencion o el codificador visual empleado; estos datos deben consultarse en la model card del modelo base.

El entrenamiento consistio en un ajuste fino supervisado sobre Qwen/Qwen3.5-4B, realizado con Unsloth y la libreria TRL de Hugging Face, segun la model card. El autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, ni los hiperparametros utilizados. No se documenta ninguna innovacion tecnica adicional mas alla del uso de estas herramientas de eficiencia.

## Capacidades

- Generacion de texto condicionada por imagen y texto (pipeline image-text-to-text), heredada del modelo base Qwen3.5-4B.
- Generacion de texto general y conversacion (etiqueta "conversational" en el repositorio).
- Procesamiento de entradas multimodales (imagen + texto) segun el pipeline declarado.
- Compatibilidad con text-generation-inference (TGI) y transformers, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado por el autor).
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Validacion de pipelines de ajuste fino: el modelo sirve como referencia para verificar que un flujo de entrenamiento con Unsloth + TRL sobre Qwen3.5-4B produce artefactos cargables en transformers y TGI, antes de lanzar entrenamientos a mayor escala.
- Prototipado de asistentes multimodales: al aceptar imagen y texto, puede emplearse en demos internas de descripcion de imagenes o respuesta a preguntas sobre capturas, siempre que se valide su calidad dado que no hay evaluacion publicada.
- Experimentacion academica con modelos de ~4,6 B: su tamano permite iterar en una sola GPU consumer o de gama media, util para investigacion sobre ajuste fino multimodal con recursos limitados.
- Generacion de texto conversacional en ingles: el modelo puede integrarse en chatbots experimentales en ingles, con la advertencia de que no se ha documentado su calidad conversacional.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para especializaciones posteriores (dominio, idioma o tarea) sin restricciones de licencia.
- Despliegue de referencia en TGI: las etiquetas indican compatibilidad con text-generation-inference, por lo que puede usarse para probar configuraciones de servido (batching, cuantizacion en carga) con un modelo de ~9,3 GB en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base Qwen/Qwen3.5-4B.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB para pesos; en 4 bits, alrededor de 3-4 GB para pesos (estimaciones teoricas, no verificadas por el autor, ya que no se publican pesos cuantizados).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con TGI; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 con contexto limitado.
- Cabe en GPU consumer: si, en tarjetas con 16-24 GB en fp16/bf16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits (requiere conversion propia, no hay GGUF publicado).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio). Para llama.cpp u Ollama seria necesaria una conversion a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hadron-4B-smoke | ~4,66 B | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face, 42 descargas |
| Qwen/Qwen3.5-4B (base) | ~4 B (segun modelo base) | no disponible | Si (image-text-to-text) | no disponible en esta ficha | Hugging Face, modelo oficial |
| Alternativas de ~4 B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentable es con el modelo base Qwen/Qwen3.5-4B, del que este repositorio es un ajuste fino. No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria sin inventar datos.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: no se puede evaluar que sesgos se han introducido ni que comportamientos se han reforzado.
- Riesgo de alucinacion: no evaluado; al no publicarse benchmarks, no hay evidencia de la fiabilidad del modelo en tareas factuales.
- Limitacion idiomatica: la model card declara solo ingles (`language: en`), por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin consultar el modelo base.
- Modelo experimental ("smoke"): parece una prueba de validacion del pipeline de entrenamiento, no un modelo destinado a produccion.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ): el despliegue eficiente en hardware limitado requiere conversion propia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia del modelo base Qwen/Qwen3.5-4B.
- Actividad minima en el repositorio (42 descargas, 0 likes): no hay comunidad ni issues que permitan validar el modelo de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neutronai-code/Hadron-4B-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
