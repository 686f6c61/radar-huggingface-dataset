# empero-ai/Homebrew-Qwen-Image-2.1-Y2K

## Resumen

Homebrew-Qwen-Image-2.1-Y2K es un adaptador LoRA de texto a imagen desarrollado por Empero, un laboratorio de investigación independiente con sede en Alemania, que se monta sobre el modelo base Qwen/Qwen-Image-2.1 de Alibaba Qwen. Su propósito es reproducir la estética de las fotografías de cámara digital compacta de principios de los años 2000: destellos directos de flash, dominante de color apagada del sensor y detalle suave. Se activa incluyendo la palabra clave "y2kphoto" en el prompt.

El adaptador es deliberadamente pequeño (0,1 GB de repositorio) y se distribuye en formato de pesos de la librería diffusers. Se entrenó mediante supervisión fina (SFT) con LoRA sobre 160 fotografías de cámara digital procedentes de Wikimedia Commons, con licencias CC BY-SA 3.0 y dominio público. El checkpoint publicado corresponde al paso 500 de 1000, no al entrenamiento final.

La relevancia de esta ficha es doble: por un lado muestra el flujo de trabajo de Homebrew, la herramienta de entrenamiento de Empero; por otro, es un ejemplo de adaptador de estilo de nicho sujeto a la licencia Qwen Research, que restringe su uso y el de sus salidas a fines no comerciales. No se han publicado descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusión de texto a imagen (base: Qwen/Qwen-Image-2.1) |
| Parámetros totales | no disponible (LoRA con rango 16 y alpha 16; tamaño de repositorio 0,1 GB) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no se documenta ventana de contexto) |
| Tipos de cuantización | no disponibles; el ejemplo de la model card usa torch.bfloat16 para el modelo base |
| Idiomas soportados | no disponibles (los prompts de ejemplo están en inglés) |
| Licencia | qwen-research (uso exclusivamente no comercial) |
| Formato de pesos | no especificado de forma explícita; repositorio con library_name: diffusers |
| Palabra de activación | y2kphoto |
| Resolución de entrenamiento | 1024 px |
| Paso del checkpoint | 500 de 1000 |
| Tamaño del repositorio | 0,1 GB |
| Librería | diffusers |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16, sin dropout, aplicado sobre los módulos objetivo por defecto de la herramienta. El entrenamiento consistió en una única etapa de ajuste supervisado (SFT) con 1000 pasos máximos, tamaño de lote efectivo 1, optimizador adamw_8bit, tasa de aprendizaje 0,0001, planificador constant_with_warmup con warmup_ratio 0,0 y caption_dropout de 0,05. La pérdida de entrenamiento final reportada es de 0,398. El entrenamiento se ejecutó en una NVIDIA RTX PRO 5000 Blackwell.

Los datos de entrenamiento son 160 imágenes del conjunto closestfriend/y2k-digicam, con licencias mixtas por imagen (CC BY-SA 3.0 y dominio público, con créditos conservados). Los datos se almacenaron en ETF (Empero Trace Format) y se renderizaron con la plantilla de chat del propio modelo base. No se documenta el número de tokens, la composición detallada del dataset ni el uso de RLHF o DPO, que en un modelo de difusión no serían el mecanismo habitual. La model card incluye comparaciones cualitativas base frente a LoRA en el paso 500 para tres prompts, sin métricas cuantitativas.

## Capacidades

- Generación de imágenes de texto a imagen a 1024 px con la estética de cámara digital de principios de los 2000 cuando el prompt contiene la palabra "y2kphoto".
- Transferencia de estilo: destellos directos de flash, dominante de color apagada del sensor y reducción del detalle fino.
- Composición de escenas variadas, tal como demuestran los ejemplos de la model card: grupo de amigos en una playa al atardecer, calle urbana lluviosa de noche con reflejos de neón y un gato en el alféizar de una ventana.
- Compatibilidad con el pipeline QwenImage21Pipeline de diffusers, cargando el adaptador con load_lora_weights.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; no aplican a un adaptador de difusión de texto a imagen.
- No se documentan capacidades multilingües específicas; los prompts de ejemplo están en inglés.

## Casos de uso

- Investigación en transferencia de estilo: permite estudiar cómo un LoRA de rango 16 captura una estética fotográfica concreta a partir de solo 160 imágenes, comparando el paso 500 con el modelo base.
- Prototipado visual no comercial: generar tableros de referencia con estética Y2K para proyectos creativos antes de invertir en fotografía o postproducción real.
- Ilustración editorial y de fanzine sin ánimo de lucro: producir imágenes de acompañamiento con una textura reconocible de cámara compacta de la época, siempre que la obra no tenga explotación comercial.
- Docencia y talleres sobre difusión: sirve como ejemplo reproducible de un pipeline de ajuste LoRA documentado con hiperparámetros completos (rango, alpha, tasa de aprendizaje, planificador y resolución).
- Generación de variaciones a partir de un estilo fijo: al fijar "y2kphoto" y una semilla, se obtienen variaciones controladas de escenas urbanas, interiores o retratos con la misma dominante de color.
- Evaluación comparativa de checkpoints intermedios: el modelo permite analizar la diferencia entre un punto intermedio de entrenamiento (paso 500) y el modelo base, útil para estudiar sobreajuste y deriva de estilo.
- Creación de material de muestra interno para agencias: maquetas de concepto para presentaciones internas, sin distribución comercial derivada.
- Experimentación con Homebrew y el formato ETF: reproducir el flujo de entrenamiento de Empero sobre un conjunto de datos propio con licencias compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una pérdida de entrenamiento de 0,398 y comparaciones visuales base frente a LoRA en el paso 500, sin métricas cuantitativas como FID, CLIP score, MMLU, HumanEval o GSM8K. No se inventan cifras.

## Requisitos de hardware

- El adaptador en sí es ligero (0,1 GB de repositorio), pero la inferencia requiere cargar el modelo base Qwen/Qwen-Image-2.1 completo, cuyos requisitos de memoria no se detallan en la información disponible.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 5000 Blackwell.
- VRAM estimada para inferencia: no disponible. El ejemplo oficial usa torch.bfloat16 y resolución de 1024 px, lo que condiciona el consumo.
- GPU recomendadas: no disponibles de forma específica; por el perfil del modelo base y la resolución, se sitúa en el rango de GPU de centro de datos o de gama alta para consumidor, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: diffusers (con una versión reciente instalada desde el repositorio de GitHub de Hugging Face) y el pipeline QwenImage21Pipeline; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. El ejemplo de inferencia usa 40 pasos de inferencia, sin tiempos medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA de estética Y2K ni modelos de texto a imagen comparables con datos verificables de parámetros, contexto, rendimiento o licencia. Cualquier comparación con alternativas requeriría consultar fichas de terceros que no forman parte de los datos disponibles.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base se distribuye bajo la Qwen Research License y tanto este adaptador como sus salidas solo pueden usarse para investigación o evaluación no comercial. Queda prohibido el uso comercial.
- El checkpoint publicado es el paso 500 de 1000, es decir, un punto intermedio de entrenamiento; puede presentar un ajuste de estilo incompleto o distinto al de un entrenamiento completado.
- Dataset reducido: 160 imágenes pueden favorecer el sobreajuste a la estética concreta del conjunto y limitar la variedad de resultados fuera de los motivos representados.
- Los datos de entrenamiento tienen licencias mixtas por imagen (CC BY-SA 3.0 y dominio público); el uso de salidas derivadas puede arrastrar obligaciones de atribución propias de CC BY-SA.
- La model card advierte explícitamente de que el modelo hereda los sesgos y limitaciones del modelo base y de los datos de entrenamiento, y que puede producir resultados incorrectos o inapropiados.
- Riesgo de alucinación visual inherente a los modelos de difusión: anatomías incorrectas, texto ilegible, objetos incoherentes o artefactos, agravado por la reducción de detalle que impone el estilo.
- Idiomas soportados no documentados; no hay garantía de que los prompts en castellano funcionen igual que en inglés.
- No se documentan sesgos demográficos específicos, pero el origen de las imágenes (Wikimedia Commons) condiciona la representación de personas y escenas.
- Ausencia total de tracción en el momento de la consulta: 0 descargas y 0 valoraciones, por lo que no existe validación de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; no hay fuentes externas que corroboren o amplíen la información de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/empero-ai/Homebrew-Qwen-Image-2.1-Y2K
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Conjunto de datos closestfriend/y2k-digicam: https://huggingface.co/datasets/closestfriend/y2k-digicam
- Repositorio de Homebrew: https://github.com/empero-org/homebrew-ai
- Sitio de Empero: https://empero.org
