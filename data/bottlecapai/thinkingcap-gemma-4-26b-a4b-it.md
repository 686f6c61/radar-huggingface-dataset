# bottlecapai/ThinkingCap-gemma-4-26B-A4B-it

## Resumen

ThinkingCap gemma-4-26B-A4B-it es un ajuste fino (fine-tune) del modelo google/gemma-4-26B-A4B-it de Google DeepMind, desarrollado por BottleCap AI. Se trata de un modelo de mezcla de expertos (MoE) con capacidad de entrada de imagen, es decir, un modelo multimodal image-text-to-text. Su propuesta concreta no es mejorar la precisión del modelo base, sino reducir de forma drástica el coste de razonamiento: según la model card, recorta los tokens de pensamiento un 38,9 % de media (con un rango del 14 % al 69 % según el benchmark) manteniendo una precisión media de 75,0 % frente al 75,2 % del base.

El problema que aborda es el coste computacional y la latencia de los modelos con modo "thinking": el modelo base puede emplear miles de tokens internos antes de responder, lo que encarece la inferencia y aumenta la latencia en producción. ThinkingCap aplica un post-entrenamiento orientado a acortar esas cadenas de razonamiento, de modo que el modelo llegue a respuestas equivalentes con menos tokens generados. En GPQA-Diamond, por ejemplo, pasa de 7.699 a 4.284 tokens de media con una caída de precisión de menos de un punto.

El modelo conserva la arquitectura, el tokenizador y el pipeline del base, y se distribuye en formato transformers/safetensors con 25.805.936.206 parámetros totales (repo de 51,8 GB) bajo licencia apache-2.0 según los metadatos de HuggingFace. El modo thinking sigue desactivado por defecto y se activa con `enable_thinking=True`, igual que en el modelo original; todas las cifras publicadas se midieron con el razonamiento activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, multimodal con entrada de imagen; heredada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.936.206 (dato real de safetensors) |
| Parametros activos | Aproximadamente 4B segun la nomenclatura "A4B" del modelo base (no confirmado de forma explicita en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada; al ser compatible con transformers y safetensors, admite las cuantizaciones habituales del ecosistema (no verificadas en esta ficha) |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | apache-2.0 en los metadatos de HuggingFace; el campo license_link apunta a la licencia de Gemma 4 de Google (ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer con mezcla de expertos y capacidad de procesar imagenes ademas de texto, con unos 25,8 mil millones de parametros totales y, presumiblemente, del orden de 4 mil millones activos por token segun la convencion de nombres "A4B" de Google. ThinkingCap no modifica la arquitectura ni el tokenizador; es un fine-tune sobre el checkpoint google/gemma-4-26B-A4B-it, por lo que conserva el pipeline image-text-to-text y el sistema de activacion de razonamiento mediante `enable_thinking=True`.

El trabajo de BottleCap AI se centra en el post-entrenamiento para reducir la longitud de las cadenas de pensamiento. La model card describe el resultado como "shorter-thinking post-training", con una reduccion media del 38,9 % en tokens de razonamiento y una perdida de precision media de 0,2 puntos (75,0 % frente a 75,2 %). No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas concretas de RLHF, DPO o RL. Tampoco se detalla si el ajuste cubre el dominio de vision o solo el razonamiento textual.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento explicito con modo "thinking" activable mediante `enable_thinking=True`; desactivado por defecto.
- Razonamiento eficiente en tokens: reduccion media del 38,9 % de tokens de pensamiento con precision practicamente equivalente al base.
- Procesamiento de imagen ademas de texto (pipeline image-text-to-text), lo que permite tareas de comprension visual y respuesta en lenguaje natural.
- Capacidades de conocimiento y razonamiento academico medidas en GPQA-Diamond y MMLU-Pro con resultados cercanos al modelo base.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Etiquetas del repo que sugieren compatibilidad con endpoints (`endpoints_compatible`) y orientacion a eficiencia de tokens (`token-efficient`, `efficient-thinking`).

## Casos de uso

- Razonamiento cientifico y tecnico asistido: el modelo mantiene 78,96 en GPQA-Diamond con un 44,4 % menos de tokens que el base, por lo que resulta adecuado para entornos donde se consultan preguntas de nivel doctorado de forma masiva y el coste por consulta importa.
- Evaluacion de conocimiento general en produccion: con 84,64 en MMLU-Pro y 1.989 tokens de media frente a 3.907 del base, es una opcion razonable para clasificacion y respuesta a preguntas de dominio amplio con presupuesto de latencia ajustado.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o documentos escaneados y devolver explicaciones en texto; util en herramientas internas de extraccion y resumen.
- Asistentes conversacionales de atencion al cliente: el modo thinking permite respuestas razonadas en casos complejos, y la reduccion de tokens de pensamiento baja el coste por conversacion en volumen alto.
- Pipelines de razonamiento por lotes: la menor generacion de tokens por peticion reduce el tiempo total de procesos batch (por ejemplo, anotacion o verificacion de grandes conjuntos de datos) sin cambiar el modelo subyacente.
- Sustitucion directa del modelo base en despliegues existentes: comparte arquitectura, tokenizador y convencion de activacion de thinking, por lo que puede entrar como reemplazo del checkpoint google/gemma-4-26B-A4B-it sin reescribir la integracion.
- Prototipado e investigacion sobre eficiencia de razonamiento: sirve como referencia para estudiar la relacion entre longitud de cadena de pensamiento y precision en modelos MoE multimodales.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con `enable_thinking=True`. La tabla original esta truncada en la informacion disponible, por lo que solo se reproducen las filas completas.

| Benchmark | Precision base | Precision ThinkingCap | Tokens base (media) | Tokens ThinkingCap (media) | Reduccion |
|---|---|---|---|---|---|
| GPQA-Diamond | 79,92 ± 0,57 | 78,96 ± 0,67 | 7.699 | 4.284 | 44,4 % |
| MMLU-Pro | 84,55 ± 0,29 | 84,64 ± 0,16 | 3.907 | 1.989 | No visible (fila truncada) |
| Media agregada (todos los benchmarks del informe) | 75,2 % | 75,0 % | No disponible | No disponible | 38,9 % (rango 14 %-69 %) |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales como HumanEval, GSM8K o MMMU, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 52 GB solo para pesos (25,8 mil millones de parametros), mas cache KV y overhead; requiere GPU de 80 GB o reparto multi-GPU.
- VRAM estimada en precision reducida (8 bits): aproximadamente 26-28 GB para pesos, mas cache KV; encaja en A100 40 GB o L40S 48 GB con margen limitado.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-16 GB para pesos, mas cache KV y overhead; podria caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque el margen depende de la longitud de contexto y del numero de imagenes procesadas.
- Al ser un MoE con pocos parametros activos por token, el coste de computo por token es menor que el de un modelo denso de 26B, pero la memoria necesaria sigue dominada por los parametros totales.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 en produccion; A100 40 GB / L40S para 8 bits; RTX 4090 o RTX 3090 para experimentacion en 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado en la libreria), ademas de las alternativas habituales del ecosistema para pesos safetensors (vLLM, TGI). El soporte concreto de llama.cpp u Ollama requeriria conversion a GGUF, no confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. La model card cuantifica el ahorro en tokens de pensamiento (38,9 % de media), que se traduce directamente en menor tiempo de generacion, pero no publica medidas de latencia absoluta ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-gemma-4-26B-A4B-it | 25,8B (MoE) | No disponible | Thinking opcional con 38,9 % menos tokens y 75,0 % de precision media | apache-2.0 (con enlace a licencia Gemma 4) | HuggingFace, 114 descargas, 13 likes |
| google/gemma-4-26B-A4B-it (base) | 25,8B (MoE) | No disponible | Thinking opcional, 75,2 % de precision media | No disponible en esta ficha | HuggingFace (modelo base) |
| Otras alternativas MoE multimodales de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de modelos comparables de terceros, por lo que la comparativa se limita al modelo base. Cualquier comparacion con otras familias (Qwen, Mixtral, Llama y similares) requeriria verificar parametros, contexto y resultados de forma independiente.

## Limitaciones y advertencias

- La reduccion de tokens de pensamiento implica una perdida de precision, pequena de media (0,2 puntos) pero variable: en GPQA-Diamond la caida es de casi un punto (79,92 a 78,96) y el rango de reduccion va del 14 % al 69 %, lo que sugiere comportamiento desigual segun el tipo de tarea.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad; al ser un fine-tune de razonamiento, acortar las cadenas puede aumentar el riesgo en tareas que requieren verificacion profunda.
- El modo thinking esta desactivado por defecto; los resultados publicados solo aplican con `enable_thinking=True`. Usar el modelo sin activarlo da un perfil de comportamiento distinto y no cubierto por las cifras de la model card.
- Ambiguedad de licencia: los metadatos indican apache-2.0, pero el campo license_link remite a la licencia de Gemma 4 de Google. Antes de uso comercial conviene verificar que terminos aplican realmente al modelo derivado.
- Idiomas soportados no documentados en la informacion disponible; no se puede garantizar calidad fuera de los idiomas evaluados por el modelo base.
- Longitud de contexto no documentada; planificar despliegues con contexto largo requiere verificacion empirical.
- No hay informacion sobre sesgos, composicion del dataset de ajuste ni evaluaciones de seguridad.
- Modelo muy reciente y con traccion baja (114 descargas, 13 likes en el momento de la consulta), lo que limita la evidencia de la comunidad sobre fallos y comportamientos en produccion.
- El repositorio ocupa 51,8 GB, lo que implica requisitos de almacenamiento y tiempos de descarga considerables.
- No se confirma soporte de tool calling, agentes ni cuantizaciones GGUF en la informacion disponible; no asumir estas capacidades sin probarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Web del autor (BottleCap AI): https://www.bottlecapai.com/
- Licencia referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Demo en video: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it/resolve/main/thinkingcap_demo.mp4
- Demo en video 4K: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it/resolve/main/thinkingcap_demo_4k.mp4

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a anuncios inmobiliarios sin relacion). No se han podido localizar papers, blogs tecnicos ni repositorios adicionales.
