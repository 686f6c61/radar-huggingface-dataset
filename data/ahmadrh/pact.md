# AhmadRH/PACT

## Resumen

PACT (Preserving Accurate Continuous Trajectories via Flow-Map Distillation) es un conjunto de adaptadores de destilación para modelos generativos de imagen y vídeo, publicado por el autor AhmadRH en Hugging Face. El método entrena adaptadores LoRA (rango/alfa 384) sobre un banco offline de trayectorias de un modelo profesor para predecir la velocidad media de intervalo, lo que permite generación en pocos pasos (4-8 NFE) preservando la correspondencia con el profesor. No es un modelo base autónomo: son pesos de inferencia que requieren el árbol de código PACT y los modelos base descargados por separado.

El repositorio incluye tres adaptadores independientes con acuerdos de licencia distintos: uno para Stable Diffusion 3.5 Medium (2,5B parámetros, 4 pasos, 1024×1024, 471 MB), otro para LTX-2.3 22B dev con audio/vídeo conjunto (8 pasos, 768×512, 121 fotogramas a 24 fps, 15,0 GB) y un estudiante destilado para MiniMax H3 con audio/vídeo conjunto (4 pasos, 960×544, 124 fotogramas a 24 fps, 8,31 GB). El repositorio completo ocupa 23,8 GB.

La relevancia actual radica en la reducción del coste de inferencia en modelos de difusión de gran tamaño: pasar de decenas de pasos a 4-8 sin reentrenar el modelo base. El estudiante H3 reporta una evaluación VBench T2V/I2V de 84,822208% / 89,391439% a cuatro NFE. La limitación principal es que los pesos no constituyen un pipeline autónomo: el código fuente en GitHub está pendiente de publicación y se necesita el árbol de código de la release PACT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango/alfa 384) sobre modelos de difusión con flow matching; destilación por flow-map |
| Parámetros totales | No disponible para los adaptadores; bases: SD3.5 Medium 2,5B, LTX-2.3 22B dev, MiniMax H3 (tamaño no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos generativos de imagen/vídeo; no hay ventana de contexto textual especificada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | `pact-per-adapter-community-licenses`; por adaptador: SD3.5 Stability AI Community License, LTX-2 Community License y MiniMax H3 Community License Agreement (con restricciones territoriales y Exhibit A) |
| Formato de pesos | Pesos PyTorch (carpetas de adaptador `sd35/`, `ltx/`, `h3/`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

PACT entrena adaptadores sobre un banco offline de trayectorias generadas por un modelo profesor. En lugar de aprender directamente el campo de velocidad instantánea, el adaptador predice la velocidad media de intervalo, lo que permite dar pasos de integración más grandes (4-8 NFE) manteniendo la correspondencia con las trayectorias del profesor. Todos los adaptadores usan rango y alfa 384. El método se enmarca en la familia de destilaciones de flow matching y flow-map.

Los tres adaptadores se entrenaron sobre modelos base distintos: SD3.5 Medium (paso bruto 190.000, 4 pasos, 1024×1024), LTX-2.3 22B dev (paso bruto 30.000, 8 pasos, 768×512, 121 fotogramas a 24 fps) y MiniMax H3 (paso 5.000, 4 pasos, 960×544, 124 fotogramas a 24 fps). No se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Los paquetes contienen pesos de inferencia, no estado del optimizador para reanudar el entrenamiento exactamente. Se realizaron comprobaciones funcionales de release (preparación, banco de trayectorias, 500 actualizaciones de entrenamiento, recarga de checkpoint y evaluación), que no equivalen a una repetición de los benchmarks del paper.

## Capacidades

- Generación de texto a imagen con el adaptador SD3.5 en 4 pasos a 1024×1024.
- Generación de texto a vídeo con audio conjunto mediante los adaptadores LTX y H3.
- Generación de imagen a vídeo con el adaptador H3 (evaluación I2V reportada en VBench).
- Generación audiovisual conjunta (vídeo y audio sincronizados) en LTX y H3.
- Generación en pocos pasos (few-step) preservando la correspondencia con el profesor.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés según la metadata del repositorio.
- No se documentan modos de pensamiento (thinking), visión de entrada ni audio de entrada.

## Casos de uso

- Prototipado rápido de texto a imagen: el adaptador SD3.5 genera imágenes a 1024×1024 en 4 pasos, lo que reduce el coste por muestra en entornos de exploración creativa donde se generan muchas variantes.
- Generación de vídeo corto con audio para previsualización: el adaptador LTX produce 121 fotogramas a 24 fps en 768×512 con 8 pasos, adecuado para maquetas de anuncios o storyboards animados.
- Imagen a vídeo para animación de material existente: el adaptador H3 permite animar una imagen de partida en 4 pasos a 960×544, útil para convertir ilustraciones estáticas en clips breves.
- Evaluación comparativa de métodos de destilación: investigadores pueden usar los adaptadores como referencia reproducible de flow-map distillation frente a otras técnicas few-step, con los pasos brutos y configuraciones documentados.
- Investigación en generación audiovisual conjunta: los adaptadores LTX y H3 permiten estudiar la sincronización audio-vídeo en régimen de pocos pasos sin reentrenar los modelos base.
- Integración en pipelines de generación por lotes: al reducir los NFE a 4-8, el coste computacional por muestra baja de forma proporcional, lo que facilita el procesamiento por lotes en infraestructura limitada.
- Fine-tuning posterior sobre dominios concretos: al ser adaptadores LoRA de rango 384, se pueden componer o ajustar sobre los modelos base para estilos específicos, siempre que se respeten las licencias de cada base.

## Benchmarks y rendimiento

| Benchmark | Adaptador | Resultado | Configuración |
|---|---|---|---|
| VBench T2V | H3 (estudiante paso 5.000) | 84,822208% | 4 NFE |
| VBench I2V | H3 (estudiante paso 5.000) | 89,391439% | 4 NFE |

No se han publicado en la información disponible resultados de benchmarks para los adaptadores SD3.5 y LTX, ni comparaciones numéricas con otros métodos de destilación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, los adaptadores se suman a los modelos base: SD3.5 Medium (2,5B) requiere aproximadamente 10-16 GB en precisión media según resolución y lote; LTX-2.3 22B y MiniMax H3 requieren GPUs de centro de datos con 40-80 GB de VRAM para inferencia en precisión nativa.
- GPU recomendadas: A100 (40/80 GB) o H100 para los adaptadores LTX y H3; RTX 4090 (24 GB) puede ser suficiente para SD3.5 Medium y, con cuantización, para H3.
- ¿Cabe en GPU de consumo? El adaptador SD3.5 sí es viable en RTX 4090 y posiblemente en RTX 3090; los adaptadores de vídeo de 22B no caben sin cuantización agresiva u offloading.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son modelos de lenguaje). La inferencia requiere el árbol de código PACT (`SD35-FlowBank-Distillation/`, `LTX-FlowBank-Distillation/` o `MiniMax-H3-PACT-Inference/`); los cargadores LoRA genéricos de Diffusers o de los modelos upstream omiten los condicionadores PACT y no implementan su ruta de muestreo flow-map.
- Latencia y throughput: no disponibles; la reducción a 4-8 NFE implica una disminución proporcional del coste frente a la inferencia multi-paso del profesor, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Pasos de inferencia | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PACT (SD3.5) | Adaptador de destilación | Base 2,5B | 4 | No aplica | Stability AI Community | Hugging Face |
| PACT (LTX-2.3) | Adaptador de destilación | Base 22B | 8 | No aplica | LTX-2 Community | Hugging Face |
| PACT (H3) | Estudiante destilado | Base no disponible | 4 | No aplica | MiniMax H3 Community | Hugging Face |
| SD3.5 Medium (base) | Modelo de difusión | 2,5B | Decenas (no especificado) | No aplica | Stability AI Community | Hugging Face |
| LTX-2.3 (base) | Modelo de vídeo/audio | 22B | No especificado | No aplica | LTX-2 Community | Hugging Face |

No se dispone de datos de rendimiento comparables de métodos alternativos de destilación few-step (por ejemplo, LCM, Turbo o Lightning) en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no son un pipeline autónomo: requieren el árbol de código PACT y los modelos base descargados por separado. El código fuente en GitHub está pendiente de publicación.
- Los cargadores LoRA genéricos de Diffusers o de los modelos upstream no funcionan: omiten los condicionadores PACT y no implementan la ruta de muestreo flow-map.
- Las comprobaciones de release son funcionales, no una repetición de los benchmarks del paper ni una garantía de calidad para cualquier prompt.
- Las comprobaciones de integridad de audio no implican ninguna afirmación subjetiva sobre la calidad del audio.
- Solo se declara soporte de inglés.
- Riesgo de alucinación visual y artefactos propios de la generación en pocos pasos; no se documentan sesgos específicos.
- Restricciones de licencia: cada adaptador tiene su propio acuerdo (Stability AI Community, LTX-2 Community y MiniMax H3 Community con restricciones territoriales y Exhibit A). El repositorio no concede derechos sobre los modelos base, codificadores de texto ni datasets. Las fuentes de entrenamiento de LTX declaran términos no comerciales; no se afirma una autorización comercial global sobre los datos.
- El adaptador LTX usa un codificador de texto Google Gemma separado, con su propia licencia.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/AhmadRH/PACT
- Model card SD3.5: https://huggingface.co/AhmadRH/PACT/blob/main/sd35/README.md
- Model card LTX: https://huggingface.co/AhmadRH/PACT/blob/main/ltx/README.md
- Model card H3: https://huggingface.co/AhmadRH/PACT/blob/main/h3/README.md
- Licencia del repositorio: https://huggingface.co/AhmadRH/PACT/blob/main/LICENSE.md
- Licencia SD3.5: https://huggingface.co/AhmadRH/PACT/blob/main/sd35/LICENSE
- Aviso SD3.5: https://huggingface.co/AhmadRH/PACT/blob/main/sd35/Notice
- Licencia LTX: https://huggingface.co/AhmadRH/PACT/blob/main/ltx/LICENSE
- Aviso LTX: https://huggingface.co/AhmadRH/PACT/blob/main/ltx/NOTICE
- Licencia H3: https://huggingface.co/AhmadRH/PACT/blob/main/h3/LICENSE
- Aviso de modificación H3: https://huggingface.co/AhmadRH/PACT/blob/main/h3/NOTICE
- Modelo base SD3.5 Medium: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Paper y repositorio de código: pendientes de publicación según la model card (no disponibles)
