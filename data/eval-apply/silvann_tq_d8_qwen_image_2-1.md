# eval-apply/silvann_tq_D8_qwen_image_2.1

## Resumen

silvann_tq_D8_qwen_image_2.1 es una version cuantizada a 8 bits del modelo de generacion de imagenes Qwen-Image-2.1 de Alibaba Qwen, empaquetada por el usuario eval-apply para el motor de inferencia SiLVANN. El modelo conserva la arquitectura original de difusion (diffusion transformer) y el codificador de texto Qwen3-VL, pero reduce todas las matrices a 8 bits, manteniendo exactas las cuatro ultimas capas del codificador y todas las capas de normalizacion. El resultado pasa de 31 GB a 17,5 GB de pesos, lo que facilita su despliegue en hardware mas modesto.

La relevancia de esta ficha es doble: por un lado documenta un ejemplo de cuantizacion agresiva sobre un modelo de difusion de gran tamano; por otro, advierte de que el motor SiLVANN aun no ejecuta este modelo, ya que esta pensado como primer modelo detras de la herramienta de generacion de imagenes de los modelos de texto de SiLVANN, actualmente en desarrollo. Se distribuye bajo licencia Qwen Research, lo que restringe su uso a investigacion y evaluacion.

La informacion publica disponible es escasa: la model card es breve y no incluye datos de entrenamiento, benchmarks ni especificaciones detalladas de la arquitectura mas alla de lo mencionado. Esta ficha refleja unicamente lo que el autor declara y marca explicitamente como no disponible todo lo demas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (modelo base Qwen-Image-2.1) con codificador de texto Qwen3-VL y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en todas las matrices; capas de normalizacion y las cuatro ultimas capas del codificador en precision exacta |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (qwen-research); solo uso no comercial |
| Formato de pesos | safetensors (libreria diffusers) |
| Tamano del repositorio | 19,6 GB (pesos cuantizados: 17,5 GB) |
| Pipeline | text-to-image (QwenImage21Pipeline) |
| Modelo base | Qwen/Qwen-Image-2.1 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen-Image-2.1: un diffusion transformer para la generacion de imagenes, un codificador de texto basado en Qwen3-VL y un VAE para la decodificacion latente. El autor no modifica la arquitectura, sino que aplica cuantizacion a 8 bits sobre todas las matrices del transformer de difusion y del codificador de texto. Las cuatro ultimas capas del codificador de texto y todas las capas de normalizacion se mantienen en precision exacta, presumiblemente para preservar la calidad de la representacion textual. El VAE, el procesador y el scheduler se conservan tal como los distribuye Qwen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documenta el proceso exacto de calibracion de la cuantizacion (por ejemplo, si es simetrica o asimetrica, o que algoritmo se uso). El autor remite a `ATTRIBUTION.md` para los detalles de los cambios, pero ese contenido no esta incluido en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el pipeline `QwenImage21Pipeline` de diffusers.
- Codificacion de prompts complejos gracias al codificador de texto Qwen3-VL, que aporta comprension linguistica y posiblemente capacidades multimodales en el modelo base (no confirmadas para esta version cuantizada).
- Integracion prevista como herramienta de generacion de imagenes `(image "…")` dentro de los modelos de texto de SiLVANN, aunque esta funcionalidad aun no esta operativa.
- Compatibilidad con el ecosistema diffusers para carga y ejecucion del pipeline.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, tool calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en cuantizacion de modelos de difusion: sirve para estudiar el impacto de reducir a 8 bits todas las matrices de un diffusion transformer de gran tamano, comparando la calidad de salida frente al modelo original de 31 GB.
- Evaluacion de motores de inferencia alternativos: el modelo esta empaquetado para SiLVANN, por lo que es util para probar la compatibilidad y el rendimiento de ese motor frente a diffusers estandar.
- Generacion de imagenes en entornos con VRAM limitada: al ocupar 17,5 GB en lugar de 31 GB, permite ejecutar el pipeline en GPUs de 24 GB (por ejemplo, RTX 4090) con margen para el VAE y los buffers de activacion.
- Prototipado de pipelines text-to-image en investigacion academica: la licencia Qwen Research permite su uso en proyectos de evaluacion y experimentacion sin fines comerciales.
- Pruebas de integracion de herramientas multimodales: como primer modelo detras de la herramienta `(image "…")` de SiLVANN, sirve para validar la arquitectura de agentes que generan imagenes bajo demanda.
- Benchmarking de calidad frente a cuantizaciones alternativas (por ejemplo, FP8 o 4 bits) del mismo modelo base, para determinar el punto de equilibrio entre tamano y fidelidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan 17,5 GB; con el VAE, el scheduler y los buffers de activacion, se estima un minimo practico de 20-24 GB de VRAM (estimacion propia, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar GPUs de 24 GB o mas (RTX 4090, A100 40 GB, H100).
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y modelos con 24 GB o mas; no confirmado para GPUs de 16 GB.
- Opciones de despliegue: diffusers (`QwenImage21Pipeline`) y el motor SiLVANN (aun sin soporte operativo para este modelo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| silvann_tq_D8_qwen_image_2.1 | no disponible | no disponible | Qwen Research (no comercial) | safetensors, 8 bits | 17,5 GB; empaquetado para SiLVANN |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | Qwen Research | safetensors, precision original | 31 GB; modelo base sin cuantizar |
| Otras cuantizaciones de Qwen-Image-2.1 | no disponible | no disponible | segun autor | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones completas para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia restrictiva: Qwen Research License permite solo uso no comercial (investigacion y evaluacion). Cualquier uso comercial requiere licencia de Qwen (contacto indicado: model-business@notice.qwencloud.com).
- El motor SiLVANN aun no ejecuta este modelo; la funcionalidad de generacion de imagenes como herramienta esta en desarrollo, por lo que su uso practico hoy depende de diffusers.
- La cuantizacion a 8 bits puede degradar la fidelidad de las imagenes generadas respecto al modelo original, especialmente en detalles finos, texto dentro de la imagen o composiciones complejas; no se han publicado evaluaciones al respecto.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base Qwen-Image-2.1, no documentado en la informacion disponible.
- No se documentan los idiomas soportados por el codificador de texto ni limitaciones de contexto; se desconoce si la cuantizacion afecta al multilingüismo.
- La model card es muy escasa: no hay informacion sobre el proceso de calibracion, el impacto medido de la cuantizacion ni instrucciones de uso detalladas.
- El repositorio tiene 197 descargas y 0 likes, lo que sugiere poca validacion comunitaria; conviene tratar los resultados como experimentales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8_qwen_image_2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del motor SiLVANN: https://github.com/eval-apply-labs/SiLVANN
- Licencia Qwen Research: incluida en el repositorio como `LICENSE`
- Atribuciones: incluidas en el repositorio como `ATTRIBUTION.md` y `NOTICE`
