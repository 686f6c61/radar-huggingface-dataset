# LiquidAI/LFM3-VL-2B-MLX-5bit

## Resumen

LFM3-VL-2B-MLX-5bit es la versión cuantizada a 5 bits en formato MLX del modelo multimodal LFM3-VL-2B de Liquid AI, desarrollada por el mismo equipo para su ejecución optimizada sobre Apple Silicon. El modelo original es un transformer de tipo vision-language (image-text-to-text) con aproximadamente 1.918 millones de parámetros totales, diseñado para tareas conversacionales que combinan comprensión de imágenes y generación de texto. Esta variante MLX reduce el peso de los pesos a 1,57 GB mediante cuantización afín de 5 bits con grupos de 64.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de casi 2.000 millones de parámetros en hardware de consumo Apple (Mac con chip M-series), algo que con los pesos en precisión completa resultaría más costoso en memoria. El modelo soporta 17 idiomas, entre ellos el castellano, y está pensado para inferencia local en el dispositivo sin depender de servicios en la nube.

La licencia es `lfm1.0` (marcada como "other" en Hugging Face), lo que condiciona el uso comercial y conviene revisar antes de integrarlo en producción. El modelo base es LiquidAI/LFM3-VL-2B y esta versión cuantizada mantiene la arquitectura y capacidades del original, con la particularidad de requerir la librería MLX-VLM 0.7.11 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (image-text-to-text); arquitectura detallada no disponible en la informacion proporcionada |
| Parametros totales | 1.918.181.888 (aprox. 1,92 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 5 bits afín con grupos de 64 (esta version MLX); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), repo de 1,6 GB; pesos cuantizados 1,57 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-language que acepta entradas de imagen y texto y genera texto (pipeline `image-text-to-text`). La información disponible no detalla la composición exacta del encoder visual, el número de capas, la dimensionalidad oculta ni el mecanismo de fusión entre modalidades. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card remite a la ficha del modelo original (LiquidAI/LFM3-VL-2B) para los detalles de arquitectura y uso.

La innovación técnica destacable de esta variante concreta es la cuantización afín de 5 bits con grupos de 64 aplicada sobre los pesos del modelo base, empaquetada en formato MLX para aprovechar la memoria unificada de los chips Apple Silicon. El resultado son 1,57 GB de pesos que permiten ejecutar un modelo multimodal de casi 2.000 millones de parámetros en un Mac. El modelo soporta un modo de razonamiento (`--enable-thinking`) que permanece desactivado por defecto y se activa explícitamente en la inferencia.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta en texto (image-text-to-text): descripción de imágenes, respuesta a preguntas sobre el contenido visual.
- Modo de razonamiento opcional (`--enable-thinking`), desactivado por defecto.
- Soporte multilingüe en 17 idiomas, incluido el castellano.
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Descripción y etiquetado automático de imágenes en local: el modelo puede generar descripciones textuales de imágenes directamente en un Mac con Apple Silicon, sin enviar datos a la nube, gracias a su formato MLX de 1,57 GB y su pipeline image-text-to-text.
- Asistencia conversacional multimodal en el dispositivo: integración en aplicaciones de escritorio o móviles Apple donde el usuario adjunta una imagen y mantiene una conversación multi-turno, aprovechando el soporte de 17 idiomas incluido el castellano.
- Accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual en tiempo real y de forma local, con la ventaja de privacidad que supone no transmitir las imágenes a un servidor externo.
- Procesamiento de documentos con contenido visual: extracción de información de capturas, diagramas o formularios escaneados y respuesta en lenguaje natural, ejecutándose en hardware de consumo.
- Prototipado e investigación en visión-lenguaje: uso como modelo de referencia ligero (1,92 mil millones de parámetros) para experimentar con pipelines multimodales en entornos de desarrollo con Mac, sin necesidad de GPUs dedicadas.
- Moderación o análisis de contenido visual asistido: clasificación y descripción de imágenes en flujos internos donde la inferencia local es un requisito por confidencialidad, siempre que la licencia lfm1.0 lo permita para el caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos cuantizados ocupan 1,57 GB; el consumo total de memoria durante la inferencia será superior por el estado de activaciones, el encoder visual y el contexto, aunque no se dispone de cifras exactas en la información proporcionada.
- Hardware objetivo: Apple Silicon (chips M-series) mediante la librería MLX; esta variante no está pensada para GPUs NVIDIA.
- Cabe en hardware de consumo: sí, en equipos Mac con memoria unificada suficiente (la cifra exacta de memoria total necesaria no está disponible).
- Despliegue: MLX-VLM 0.7.11 o superior, con el comando `python -m mlx_vlm.generate`; opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) no están soportadas por esta variante MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-5bit | 1,92 mil millones | no disponible | MLX safetensors 5-bit | lfm1.0 | Variante cuantizada para Apple Silicon |
| LFM3-VL-2B (base) | 1,92 mil millones | no disponible | safetensors | lfm1.0 | Modelo original sin cuantizar |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia lfm1.0: es necesario revisar los términos completos antes de cualquier uso comercial; la etiqueta "other" en Hugging Face indica condiciones específicas no estándar.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones de imágenes o respuestas textuales incorrectas, especialmente con imágenes ambiguas o de baja calidad; no se han publicado evaluaciones de fidelidad visual en la información disponible.
- Sesgos: no se documentan en la información proporcionada; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; aunque se listan 17 idiomas, el rendimiento relativo por idioma no está documentado.
- Restricción de plataforma: esta variante MLX solo es ejecutable en Apple Silicon con MLX-VLM 0.7.11 o superior; no es portable a otros backends sin reconversión.
- Modo de razonamiento: desactivado por defecto; su activación cambia el comportamiento y el consumo de tokens, por lo que conviene validarlo en producción.
- Caveat de cuantización: la precisión de los pesos a 5 bits puede degradar ligeramente la calidad frente al modelo base en tareas sensibles; no se han publicado comparativas de rendimiento entre ambas versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-5bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Guía MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
