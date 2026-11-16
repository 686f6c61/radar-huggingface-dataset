# ehzawad/ThinkingCap-gemma-4-26B-A4B-it-INT4-W4A16-experts

## Resumen

ThinkingCap-gemma-4-26B-A4B-it-INT4-W4A16-experts es una cuantizacion INT4 del modelo bottlecapai/ThinkingCap-gemma-4-26B-A4B-it, un modelo de arquitectura MoE (mixture of experts) derivado de la familia Gemma 4 con capacidades multimodales de imagen a texto. Lo publica el usuario ehzawad en Hugging Face y esta pensado para servir con vLLM, empleando el formato compressed-tensors generado con llm-compressor. La cuantizacion es W4A16: pesos en 4 bits y activaciones en 16 bits, con los expertos del MoE cuantizados de forma selectiva.

El modelo base tiene 25.805.936.206 parametros totales (unos 25,8 mil millones) y la nomenclatura "26B-A4B" indica que se activan aproximadamente 4 mil millones de parametros por token, lo que reduce el coste computacional en inferencia frente a un modelo denso del mismo tamano. El repositorio ocupa 18,8 GB, coherente con pesos cuantizados a 4 bits mas los tensores en mayor precision que se conservan sin cuantizar.

Es relevante porque combina tres tendencias actuales: arquitecturas MoE eficientes en computo, capacidades multimodales imagen-texto y cuantizacion INT4 lista para produccion con vLLM. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), multimodal imagen-texto |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4 mil millones por token (segun nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 (pesos 4 bits, activaciones 16 bits), expertos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE), disenado para activar solo una fraccion de sus parametros por token. La nomenclatura "26B-A4B" sugiere 26 mil millones de parametros totales y unos 4 mil millones activos, un patron habitual en MoE eficientes. Ademas, el tag `image-text-to-text` y el pipeline asociado confirman que incorpora un codificador visual y capacidad de procesar imagenes junto con texto.

Esta version concreta es una cuantizacion post-entrenamiento: los pesos originales en BF16/FP16 se comprimen a INT4 mediante llm-compressor, generando artefactos en formato compressed-tensors que vLLM puede cargar directamente. La eleccion W4A16 mantiene las activaciones en 16 bits para preservar estabilidad numerica, mientras que los pesos, incluidos los expertos del MoE, se almacenan en 4 bits. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes junto con texto (image-text-to-text): descripcion, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento y resolucion de problemas, segun la orientacion "thinking" del nombre del modelo base.
- Capacidades orientadas a agentes ("agentic" en los tags), lo que sugiere soporte para flujos multi-paso.
- Posible soporte de tool calling o function calling, aunque no se detalla en la informacion disponible.
- Capacidades multilingues: no disponibles de forma explicita en la ficha.
- Inferencia eficiente gracias a la activacion parcial de expertos y a la cuantizacion INT4.

## Casos de uso

- Asistente multimodal en produccion: el modelo puede recibir imagenes y texto para responder preguntas sobre capturas, diagramas o documentos escaneados, desplegado con vLLM y pesos INT4 para reducir requisitos de VRAM.
- Automatizacion de soporte tecnico con imagenes: un usuario envia una captura de error y el modelo la interpreta junto con el historial de conversacion para proponer soluciones, aprovechando la ventana de contexto (no documentada) y la naturaleza conversacional.
- Agentes multi-paso: integrado en un orquestador que encadena llamadas a herramientas, el modelo puede planificar y ejecutar subtareas, apoyandose en la orientacion agentic del modelo base.
- Analisis de documentos visuales: extraccion de informacion de facturas, formularios o graficos mediante el pipeline image-text-to-text, con la cuantizacion INT4 abaratando el coste por inferencia.
- Despliegue en infraestructura con GPUs de gama alta pero no exclusivas: al reducir el peso a 18,8 GB en disco, permite servir el modelo en una sola GPU de 24-48 GB con vLLM, algo inviable con los pesos originales en BF16.
- Prototipado e investigacion en eficiencia de MoE: util para estudiar el impacto de la cuantizacion selectiva de expertos en calidad y latencia, comparando con el modelo base sin cuantizar.
- Moderacion de contenido visual y textual: clasificacion y descripcion de imagenes con contexto textual en pipelines automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 18,8 GB, por lo que la inferencia requiere al menos unos 20-24 GB de VRAM para cargar pesos y overhead de KV cache; con contexto largo la demanda crece.
- GPU recomendadas: A100 40/80 GB, H100, L40S, o GPUs consumer de 24 GB como RTX 3090/4090 para contextos moderados.
- Cabe en GPU consumer: previsiblemente si en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB), con limitaciones de contexto segun la memoria restante.
- Opciones de despliegue: vLLM es el entorno declarado (libreria del repo y formato compressed-tensors). Otros runners como llama.cpp u Ollama no estan confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ThinkingCap-gemma-4-26B-A4B-it-INT4 (este) | 25,8 B | ~4 B | no disponible | Apache 2.0 | safetensors INT4 W4A16 |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it (base) | 25,8 B | ~4 B | no disponible | no disponible | safetensors BF16/FP16 |
| Modelos MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros no esta disponible en la informacion proporcionada. La comparacion mas directa es con el modelo base sin cuantizar, que ofrecera mayor fidelidad numerica a costa de aproximadamente el doble o mas de huella en memoria.

## Limitaciones y advertencias

- La cuantizacion INT4 puede introducir degradacion en tareas sensibles a precision, como matematicas o razonamiento fino; conviene validar contra el modelo base.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar, lo que puede complicar pipelines automatizados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validacion comunitaria; usar con cautela en produccion.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano sin evaluacion previa.
- Longitud de contexto no disponible; planificar el despliegue sin asumir ventanas largas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en interpretacion de imagenes ambiguas.
- Sesgos: no documentados en la informacion disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero debe verificarse que el modelo base y sus componentes mantengan esa licencia.
- Formato compressed-tensors limita la portabilidad a entornos distintos de vLLM.

## Enlaces

- Hugging Face: https://huggingface.co/ehzawad/ThinkingCap-gemma-4-26B-A4B-it-INT4-W4A16-experts
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
