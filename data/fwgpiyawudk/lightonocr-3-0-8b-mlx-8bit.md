# fwgpiyawudk/LightOnOCR-3-0.8B-MLX-8bit

## Resumen

LightOnOCR-3-0.8B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo LightOnOCR-3-0.8B de LightOn, un modelo visión-lenguaje especializado en OCR de extremo a extremo y comprensión de documentos. Este repositorio concreto lo publica el usuario fwgpiyawudk y su única aportación es aplanar en un directorio único los pesos que el repositorio original de prithivMLmods guardaba en la subcarpeta `8bit/`, de modo que el servidor compatible con OpenAI de mlx-vlm pueda cargarlos sin necesidad de materializar la subcarpeta localmente. Los pesos son idénticos bit a bit a los de esa subcarpeta: no se ha recuantizado nada.

El modelo emplea la arquitectura visión-lenguaje Qwen3.5, con un modelo de lenguaje de aproximadamente 853 millones de parámetros cuantizados en 8 bits afines con grupo de 64 y una torre de visión en bfloat16. El repositorio ocupa alrededor de 1 GB y está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX y mlx-vlm, probada con la versión 0.7.12.

Su relevancia práctica reside en que ofrece OCR y comprensión documental (transcripción a Markdown y grounding de regiones) en un tamaño lo bastante pequeño para inferencia local en un Mac, con licencia Apache-2.0 y un formato de pesos directamente consumible por un servidor compatible con OpenAI. El modelo está entrenado para exactamente dos instrucciones: transcripción plana y grounding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje Qwen3.5 (torre de visión + modelo de lenguaje) |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afines (affine), grupo 64, en el modelo de lenguaje; torre de visión en bfloat16. Existen variantes bf16 y 4 bits en el repositorio de origen |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio aplanado de ~1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 de tipo visión-lenguaje: una torre de visión que procesa la imagen y un modelo de lenguaje que genera la salida. En esta conversión MLX, el modelo de lenguaje se cuantiza en 8 bits con cuantización afín y tamaño de grupo 64, mientras que la torre de visión se mantiene en bfloat16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de este repositorio solo documenta el proceso de conversión y los pesos de origen.

La innovación destacable de esta publicación no es arquitectónica sino operativa: el repositorio de origen organiza los pesos en subcarpetas (raíz con bf16, `4bit/` y `8bit/`), y el servidor compatible con OpenAI de mlx-vlm carece de una opción `--subfolder`, por lo que solo puede cargar un directorio plano de modelo. Este repositorio elimina ese paso manual. El modelo está entrenado con exactamente dos instrucciones: transcripción plana, donde la imagen constituye todo el prompt sin elemento de texto, y grounding, donde se pasa primero la imagen y después el texto `grounding`. El modo de razonamiento (thinking) está desactivado por defecto en la plantilla de chat.

## Capacidades

- Transcripción de documentos a texto plano y a Markdown mediante una única instrucción sin prompt textual.
- Grounding de regiones: genera un bloque `![label](x1,y1,x2,y2) text` por línea, con cajas normalizadas en el rango 0-1000.
- Comprensión de documentos de extremo a extremo (document understanding) a partir de una imagen de página.
- Salida image-to-text, adecuada para pipelines de digitalización y extracción.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de audio ni de visión más allá del OCR y el grounding.

## Casos de uso

- Digitalización de archivos en local: el modelo transcribe páginas escaneadas a Markdown ejecutándose en un Mac mediante MLX, sin enviar documentos a servicios externos, lo que resulta adecuado para material confidencial.
- Extracción de texto en pipelines de CI o scripts: al exponerse a través del servidor compatible con OpenAI de mlx-vlm, puede integrarse en flujos automatizados que envían imágenes y reciben texto.
- Generación de Markdown estructurado a partir de PDF renderizados: útil para convertir documentación técnica o informes en contenido listo para un repositorio o una wiki.
- Anotación y localización de regiones (grounding): permite obtener las coordenadas de bloques de texto o etiquetas sobre la página, útil para tareas de recorte, indexación o resaltado.
- Prototipado rápido de aplicaciones OCR en Apple Silicon: su tamaño de ~1 GB y la licencia Apache-2.0 facilitan pruebas locales sin infraestructura de GPU dedicada.
- Preprocesado de documentos para sistemas RAG: la transcripción a Markdown sirve como paso previo para trocear y vectorizar contenido documental.
- Evaluación comparativa de OCR local frente a servicios en la nube en entornos con restricciones de privacidad o de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia orientada a Apple Silicon mediante MLX y mlx-vlm (probado con la versión 0.7.12); no se documenta soporte para CUDA en este repositorio.
- Tamaño del repositorio de aproximadamente 1 GB, lo que sugiere un requisito de memoria unificado del mismo orden para cargar los pesos, además del espacio para activaciones y la imagen de entrada.
- VRAM estimada para GPU dedicadas: no disponible, al no ser este un formato pensado para ellas.
- GPU recomendadas: no aplica de forma directa; el entorno objetivo es hardware Apple con memoria unificada.
- Cabe en equipos de consumo con memoria unificada suficiente para un modelo de menos de 1 GB de pesos, aunque no se especifican modelos concretos de Mac.
- Despliegue mediante `mlx_vlm.server` con interfaz compatible con OpenAI, o mediante la API de Python `mlx_vlm.load` y `mlx_vlm.generate`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-MLX-8bit (este) | 852.985.920 | no disponible | safetensors MLX, 8 bits | Apache-2.0 | Repositorio aplanado para servidor mlx-vlm |
| prithivMLmods/LightOnOCR-3-0.8B-MLX | mismo modelo base | no disponible | safetensors MLX en subcarpetas (bf16, 4 bits, 8 bits) | Apache-2.0 | Requiere materializar la subcarpeta para el servidor |
| lightonai/LightOnOCR-3-0.8B | mismo modelo base | no disponible | pesos originales (no MLX) | Apache-2.0 | Modelo de referencia; documentación completa y benchmarks en su model card |

No se dispone de información sobre otros modelos comparables de OCR de tamaño similar en la documentación proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- El modelo solo está entrenado para dos instrucciones (transcripción plana y grounding); usarlo con prompts distintos puede degradar la calidad de la salida.
- El modo de razonamiento debe permanecer desactivado: no iniciar el servidor con `--enable-thinking` ni con `MLX_VLM_ENABLE_THINKING=1`.
- El preprocesado debe respetar las condiciones documentadas: RGB y reducción de escala para que el lado más largo no supere los 2048 px, sin reescalar hacia arriba.
- El muestreo recomendado es temperature 0.2, top_p 0.9 y max_tokens 4096 (el README sugiere 0.1); no se debe usar decodificación greedy.
- Idioma limitado al inglés según la etiqueta del repositorio; el rendimiento en castellano u otros idiomas no está documentado.
- No se documentan sesgos conocidos ni tasas de alucinación; como todo modelo generativo de OCR, puede producir texto plausible que no aparezca en la imagen.
- No se documentan capacidades de tool calling ni de agente, por lo que no debe asumirse su disponibilidad en producción.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Este repositorio es una copia aplanada de terceros; su mantenimiento y actualizaciones dependen del autor y no de LightOn.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/fwgpiyawudk/LightOnOCR-3-0.8B-MLX-8bit
- Modelo base original: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Conversión MLX de origen: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MLX
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
