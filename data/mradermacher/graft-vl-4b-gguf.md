# mradermacher/Graft-VL-4B-GGUF

## Resumen

Graft-VL-4B-GGUF es la distribucion en formato GGUF del modelo vision-lenguaje Graft-VL-4B, publicado por el usuario mradermacher a partir de los pesos originales de sayantan1/Graft-VL-4B. Se trata de un modelo multimodal de aproximadamente 4.022 millones de parametros (4B) construido sobre la familia Qwen3, orientado especificamente a la comprension de documentos, OCR y lectura de graficos. Su proposito es ofrecer capacidades de vision-lenguaje en un tamano contenido que pueda ejecutarse en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta publicacion es practica: convierte un modelo multimodal de 4B en un conjunto de ficheros GGUF cuantizados (desde Q2_K hasta f16, mas los suplementos mmproj para la torre de vision) que permiten desplegar comprension de documentos e imagenes en equipos sin GPU de datacenter. El repo incluye tanto los pesos del lenguaje cuantizados como los ficheros mmproj necesarios para procesar imagenes.

La informacion publicada por el autor de la cuantizacion es fundamentalmente operativa (lista de cuantizaciones, tamanos y notas de uso); la model card no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3 (detalle interno no disponible) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | cc-by-nc-4.0 (no comercial) |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Graft-VL-4B es un modelo vision-lenguaje multimodal: combina un codificador de vision (empaquetado en los ficheros mmproj) con un modelo de lenguaje de la familia Qwen3, segun las etiquetas de la model card. Esta distribucion GGUF separa explicitamente los pesos del lenguaje cuantizados de los suplementos multimodales mmproj (en f16 y Q8_0), que son los que permiten procesar imagenes en llama.cpp.

No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). La model card del repositorio de cuantizacion se limita a describir el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados. Tampoco se han publicado cuantizaciones ponderadas/imatrix por parte de este autor en el momento de la publicacion.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversational).
- Comprension de imagenes: el modelo incorpora torre de vision, activada mediante los ficheros mmproj.
- Comprension de documentos (document-understanding), segun las etiquetas del autor.
- OCR: extraccion de texto a partir de imagenes de documentos.
- Comprension de graficos (chart-understanding): interpretacion de graficos y tablas en imagen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles (en).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede recibir la imagen de un documento y extraer los campos textuales mediante sus capacidades de OCR y comprension de documentos, adecuado por su tamano de 4B que permite ejecucion local sin depender de APIs externas.
- Extraccion de datos de graficos financieros: dada una imagen de un grafico de barras o lineas, el modelo puede describir tendencias y valores, aprovechando la etiqueta chart-understanding del autor.
- Procesamiento por lotes de documentos escaneados en un servidor modesto: al disponer de cuantizaciones Q4_K_M (2,6 GB) y Q4_K_S (2,5 GB), es viable procesar volumenes moderados de imagenes en CPU o en una unica GPU de consumo.
- Asistente de accesibilidad para imagenes: descripcion de contenido visual en aplicaciones que requieran un modelo local y de baja latencia, con la cuantizacion Q8_0 (4,4 GB) como compromiso calidad-velocidad.
- Prototipado rapido de pipelines multimodal en llama.cpp: los ficheros mmproj-f16 y mmproj-Q8_0 permiten montar un flujo de vision-lenguaje completo con herramientas estandar del ecosistema GGUF sin infraestructura adicional.
- Investigacion academica sobre modelos vision-lenguaje pequenos: el modelo permite experimentar con comprension de documentos en entornos con recursos limitados, si bien la licencia cc-by-nc-4.0 restringe su uso a fines no comerciales.
- Clasificacion y resumen de capturas de pantalla o imagenes tecnicas: con la cuantizacion Q5_K_M (3,0 GB) se puede desplegar en una GPU de 8 GB para tareas de descripcion y extraccion de informacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del lenguaje, sin contar overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
- Suplementos multimodales adicionales: mmproj-Q8_0 (~0,6 GB) o mmproj-f16 (~0,9 GB).
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo cabe en GPUs de consumo; las cuantizaciones Q4 y Q5 son aptas para tarjetas con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3070), y Q8_0/f16 requieren 8-12 GB (RTX 4070, RTX 4080, RTX 4090). Para A100/H100 no hay datos publicados, aunque son sobradamente suficientes.
- Ejecucion en CPU: viable con llama.cpp en las cuantizaciones bajas (Q2_K a Q4_K_M), dado el reducido tamano de los ficheros.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) para GGUF; la model card menciona vLLM como etiqueta, aunque para GGUF el runtime natural es llama.cpp. No se indica soporte verificado en TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (contexto, rendimiento) del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como Qwen2.5-VL-3B/7B, InternVL o MiniCPM-V. A continuacion se recogen unicamente los datos objetivos disponibles de este modelo frente a referencias genericas de la misma categoria:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Graft-VL-4B (esta ficha) | ~4B | no disponible | cc-by-nc-4.0 | GGUF, safetensors |
| Alternativas vision-lenguaje de ~3-4B | no disponible | no disponible | no disponible | no disponible |

No disponible para una comparativa detallada.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: prohibido el uso comercial sin autorizacion expresa del titular de los derechos.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado en tareas de OCR y lectura de graficos, donde puede inventar cifras o texto no presente en la imagen; se recomienda validacion humana en flujos criticos.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la seleccion en produccion.
- Contexto y arquitectura interna no documentados: se desconoce la ventana de contexto efectiva y los detalles del entrenamiento.
- Cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso rapido.
- No hay cuantizaciones ponderadas/imatrix publicadas por este autor en el momento de la publicacion.
- Los ficheros mmproj son imprescindibles para el procesamiento de imagenes; usar solo el GGUF del lenguaje desactiva las capacidades multimodales.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Graft-VL-4B-GGUF
- Modelo base: https://huggingface.co/sayantan1/Graft-VL-4B
- Pagina de descargas del autor: https://hf.tst.eu/model#Graft-VL-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
