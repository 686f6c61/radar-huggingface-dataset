# netprojects/Hy-MT3-1.8B-MLX-8bit

## Resumen
Hy-MT3-1.8B-MLX-8bit es una conversion al framework MLX de Apple Silicon del modelo de traduccion multilingue tencent/Hy-MT3-1.8B, desarrollado por Tencent y publicado el 24 de noviembre de 2026. Esta version la distribuye NetProjects (Internet Projects Ltd) cuantizada a 8 bits en formato afino con grupo de 64, con un tamano de repositorio de 1,9 GB y 1.791.080.448 parametros. El modelo base forma parte de la familia Hy-MT3 de traduccion, disponible en variantes de 1,8B, 7B y 30B-A3B, y cubre alrededor de 100 idiomas y dialectos, incluyendo los 33 idiomas de Hy-MT2, cinco lenguas minoritarias chinas y 64 idiomas nuevos como griego, rumano, hungaro y las lenguas nordicas y balticas.

El modelo resuelve el problema de la traduccion automatica multilingue de calidad en hardware de consumo, ya que su tamano denso de 1,8B y su cuantizacion a 8 bits permiten ejecutarlo en portatiles Mac con 8 GB o mas de memoria unificada. Segun Tencent, el modelo supera a servicios comerciales como Microsoft Translator y Qwen-MT-Flash en traduccion general, y frente a Hy-MT2 reduce un 43% los errores de traduccion, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones. La relevancia actual radica en que ofrece traduccion de calidad cercana a modelos mayores en un formato ejecutable localmente en Apple Silicon, con licencia Apache-2.0 que permite uso comercial.

La arquitectura es un transformer denso de 32 capas con atencion estandar, sin mezcla de expertos, y una ventana de contexto de aproximadamente 8K tokens de entrada y hasta 4.096 tokens nuevos de salida. La conversion mantiene el tokenizador y la plantilla de chat del modelo original, y segun las pruebas del autor de la conversion, el 100% de los siguientes tokens generados coinciden con el modelo bf16 en 211 posiciones evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense), 32 capas |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | aproximadamente 8K tokens de entrada; hasta 4.096 tokens nuevos de salida |
| Tipos de cuantizacion | 8 bits afino (affine), grupo 64; existe tambien build de 4 bits del mismo autor |
| Idiomas soportados | alrededor de 100 idiomas y dialectos (33 de Hy-MT2, 5 lenguas minoritarias chinas, 64 nuevos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo base Hy-MT3-1.8B es un transformer denso de 32 capas, identificado en los tags como `hunyuan_v1_dense`, lo que lo vincula a la familia de arquitecturas Hunyuan de Tencent. No es un modelo de mezcla de expertos, por lo que todos los parametros se activan en cada paso de inferencia. La ventana de contexto practica es de aproximadamente 8K tokens de entrada, con generacion de hasta 4.096 tokens nuevos, y no dispone de prompt de sistema por defecto. Tencent recomienda temperatura 0,7, top_p 0,6, top_k 20 y penalizacion de repeticion 1,05.

La informacion disponible no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, aunque la model card del modelo base indica que se entreno para traduccion multilingue con datos del mundo real y que se evaluo frente a Hy-MT2 en ese dominio. No se especifica si hubo RLHF o DPO. La innovacion destacable de esta version concreta es la conversion a MLX con cuantizacion afino de 8 bits y grupo 64, que preserva el 100% de los siguientes tokens del modelo bf16 en las pruebas realizadas, ademas de incluir plantillas de prompt para listas de terminologia, estilo requerido, preferencias personales, preservacion de delimitadores y traduccion de datos estructurados (JSON, XML).

## Capacidades
- Traduccion multilingue entre aproximadamente 100 idiomas y dialectos, incluyendo griego, rumano, hungaro, lenguas nordicas y balticas, cinco lenguas minoritarias chinas y los 33 idiomas de Hy-MT2.
- Traduccion con instrucciones de estilo, terminologia y preferencias personales mediante plantillas de prompt especificas.
- Traduccion de datos estructurados preservando delimitadores, con soporte para JSON y XML.
- Seguimiento de instrucciones de formato, como exigir que la salida contenga solo la traduccion sin explicaciones adicionales.
- Generacion de texto y conversacion multi-turno mediante plantilla de chat.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni razonamiento agente en la informacion disponible.
- Multilingue en entrada y salida, con deteccion del idioma destino a partir de la instruccion.

## Casos de uso
- Traduccion local en portatiles Mac: el modelo cabe en 8 GB o mas de memoria unificada y permite traducir documentos y textos sin conexion, lo que resulta adecuado para entornos con requisitos de privacidad o sin acceso a la nube.
- Traduccion de documentacion tecnica con terminologia controlada: las plantillas de lista de terminologia ("`term` translates to `translation`") permiten fijar vocabulario especializado y mantener consistencia en manuales y articulos.
- Localizacion de interfaces y contenido web: la preservacion de delimitadores y el soporte de JSON y XML facilitan traducir cadenas de recursos y ficheros de localizacion sin romper la estructura.
- Traduccion de correspondencia y textos administrativos: la ventana de contexto de aproximadamente 8K tokens permite procesar correos, informes y contratos de longitud media en una sola pasada.
- Servicio de traduccion con API compatible con OpenAI: mediante `mlx_lm.server` se puede exponer el modelo en el puerto 8000 e integrarlo en aplicaciones existentes que consuman la API de OpenAI.
- Traduccion de contenido multilingue para comunidades y medios: la cobertura de unos 100 idiomas y dialectos, incluidas lenguas minoritarias chinas, lo hace util para publicar contenido en idiomas con poca representacion en otros modelos.
- Prototipado e investigacion en traduccion automatica: su tamano reducido y su licencia Apache-2.0 permiten experimentar y ajustar prompts sin costes de licencia ni infraestructura dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona que, segun Tencent, el modelo supera a Microsoft Translator y Qwen-MT-Flash en traduccion general y reduce un 43% los errores de traduccion, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones frente a Hy-MT2, pero no se proporcionan cifras numericas de benchmarks estandar como MMLU, HumanEval o GSM8K. Las pruebas del autor de la conversion son las siguientes:

| Prueba | 8 bits | 4 bits | bf16 |
|---|---|---|---|
| Coincidencia del siguiente token con bf16 | 100,0% (211 posiciones) | 93,4% (211 posiciones) | referencia |
| Prueba de humo de traduccion | 10/10 | 10/10 | 10/10 |
| Tamano del build | 1,9 GB | 1,0 GB | no disponible |
| Memoria Mac sugerida | 8 GB+ | 8 GB+ | no disponible |

## Requisitos de hardware
- VRAM o memoria unificada estimada: 8 GB o mas de memoria en Mac para el build de 8 bits; los documentos largos requieren mas memoria.
- GPU recomendadas: Apple Silicon, probado en un MacBook Pro M5 Max con 128 GB; no se documenta soporte para GPU NVIDIA o AMD en esta conversion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 8 GB de memoria unificada; no aplica a GPU dedicadas por ser un formato MLX.
- Opciones de despliegue: `mlx-lm` version 0.32.2 o superior, con CLI `mlx_lm.generate`, API de Python `mlx_lm.load` y `generate`, y servidor compatible con OpenAI mediante `mlx_lm.server`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-MLX-8bit (este) | 1,8B denso | aprox. 8K entrada, 4.096 salida | Apache-2.0 | safetensors MLX 8 bits | Hugging Face, 1,9 GB |
| Hy-MT3-1.8B-MLX-4bit | 1,8B denso | aprox. 8K entrada, 4.096 salida | Apache-2.0 | safetensors MLX 4 bits | Hugging Face, 1,0 GB |
| tencent/Hy-MT3-1.8B (bf16) | 1,8B denso | aprox. 8K entrada, 4.096 salida | Apache-2.0 | safetensors bf16 | Hugging Face |
| Hy-MT3-7B y Hy-MT3-30B-A3B | 7B denso y 30B-A3B | no disponible | Apache-2.0 | no disponible | Hugging Face |

## Limitaciones y advertencias
- Riesgo de alucinacion y de errores en textos largos o muy tecnicos; la model card del modelo base reporta mejoras frente a Hy-MT2, pero no elimina los errores de traduccion.
- Ventana de contexto limitada a aproximadamente 8K tokens de entrada, insuficiente para documentos extensos en una sola pasada.
- Idiomas soportados: alrededor de 100, pero no se detalla el rendimiento por idioma ni la cobertura de dialectos concretos.
- La cuantizacion a 8 bits preserva el 100% de los siguientes tokens en las pruebas del autor, pero no garantiza una equivalencia total con bf16 en todos los casos.
- Requiere hardware Apple Silicon y la libreria MLX; no es desplegable directamente en GPU NVIDIA con vLLM o TGI.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero LICENSE.txt de Tencent y citar su trabajo.
- El autor de la conversion (NetProjects) no esta afiliado a Tencent; la responsabilidad sobre el modelo base recae en Tencent.
- No se documentan capacidades de tool calling, agentes ni vision, por lo que no es adecuado para tareas fuera de la traduccion y la generacion de texto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Hy-MT3-1.8B-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Build de 4 bits: https://huggingface.co/netprojects/Hy-MT3-1.8B-MLX-4bit
- Informe tecnico (arXiv 2611.27673): https://arxiv.org/abs/2611.27673
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio web de NetProjects: https://netprojects.com
