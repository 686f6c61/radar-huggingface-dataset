# hmkz-1981/gemma-4-e4b-translate-ml

## Resumen

gemma-4-e4b-translate-ml es un modelo de traduccion automatica multilingue desarrollado por el usuario hmkz-1981 (tambien identificado como wahokun en el codigo de ejemplo de la model card). Se construye mediante un ajuste fino con LoRA sobre el modelo base google/gemma-4-E4B-it de Google, siguiendo la receta, el formato de prompt y el protocolo de evaluacion de TranslateGemma, el trabajo de traduccion publicado por Google (arXiv:2601.09012). No es un modelo oficial de TranslateGemma ni esta afiliado a Google.

El modelo cubre 11 idiomas (japones, ingles, chino simplificado y tradicional, coreano, frances, aleman, espanol, portugues, italiano y ruso) en 24 direcciones de traduccion entrenadas: ingles hacia y desde cada idioma, mas japones hacia y desde chino y coreano. Con 7.941.100.832 parametros totales y un repositorio de 15,9 GB en formato safetensors, esta pensado para traduccion de calidad en produccion sobre una base multimodal (el modelo base procesa texto e imagen, con pipeline image-text-to-text), aunque el ajuste se centra en el decodificador de texto.

Su relevancia actual reside en que demuestra que es posible replicar la receta de TranslateGemma sobre una base abierta de menor tamano (4B efectivos) obteniendo mejoras medibles frente al modelo base en MetricX-24 y COMET-22 en la mayoria de direcciones, con licencia Apache 2.0 y pesos abiertos, lo que facilita su despliegue y adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B), ajuste fino LoRA sobre el decodificador de texto |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible (la nomenclatura E4B sugiere 4B efectivos, sin confirmar en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | ja, en, zh (simplificado y tradicional), ko, fr, de, es, pt, it, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, una arquitectura transformer multimodal que en su version base procesa texto, imagen y audio (el pipeline declarado es image-text-to-text). El ajuste fino se realiza con LoRA de rango 32 y alpha 32, aplicado unicamente a las capas de atencion y MLP del decodificador de texto; los embeddings y las torres de vision y audio permanecen congelados. La perdida se calcula solo sobre la respuesta y se entrena durante una epoca.

El corpus de entrenamiento combina 107.118 pares de traduccion y 18.108 ejemplos de chat general. Las frases fuente provienen de MADLAD-400 (version limpia), con 5.000 por direccion, y los datos ja⇄en se toman del modelo de la fase 1 (SFT solo ja⇄en). Las traducciones se generan con destilacion de profesores seleccionados por direccion sobre FLORES+ dev: Gemma 4 31B, DeepSeek V4.1 Flash y Qwen3.5-27B. Para cada fuente se generan candidatos con decodificacion greedy y por muestreo del profesor top-1 y greedy del top-2, y se conserva el candidato con mejor rango medio entre MetricX-24 QE y consenso MBR de COMET-22, con comprobaciones adicionales de idioma, escritura y longitud. Los prompts de chat general proceden de UltraChat 200k, databricks-dolly-15k-ja y el dataset Aya, respondidos por Gemma 4 E4B. Los conjuntos de evaluacion (FLORES+ y WMT24++) se excluyeron del entrenamiento y de la seleccion de profesores.

## Capacidades

- Traduccion automatica en 24 direcciones: ingles hacia y desde 10 idiomas, mas japones hacia y desde chino y coreano.
- Soporte de chino simplificado y tradicional como variantes diferenciadas en el prompt.
- Generacion de texto y conversacion general, gracias a los 18.108 ejemplos de chat incluidos en el ajuste.
- Procesamiento de entrada multimodal heredado del modelo base (imagen-texto), aunque el ajuste LoRA solo afecta al decodificador de texto.
- Formato de prompt especifico de TranslateGemma con nombres y codigos de idioma (por ejemplo, `English (en-US) to Traditional Chinese (zh-TW)`).
- Decodificacion determinista recomendada (greedy) y modo thinking desactivado (`enable_thinking=False`) para traduccion.
- Soporte de plantilla de chat mediante `apply_chat_template` con el procesador de transformers.
- Capacidades de tool calling y agentes: no documentadas en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo traduce documentacion de producto entre ingles y los 10 idiomas cubiertos con un prompt fijo y salida limpia sin comentarios, lo que permite integrarlo en pipelines de publicacion automatizados.
- Localizacion de interfaz de usuario: para cadenas cortas y etiquetas, la decodificacion greedy con `do_sample=False` garantiza salidas deterministas y reproducibles, adecuadas para revisiones de control de calidad.
- Atencion al cliente multilingue: el ajuste incluye ejemplos de chat general, de modo que el modelo puede mantener conversaciones en los idiomas soportados y derivar la traduccion en el mismo turno.
- Traduccion japones-chino y japones-coreano: direcciones poco cubiertas por modelos genericos y que aqui estan entrenadas explicitamente, utiles para comercio electronico y soporte en el mercado asiatico.
- Procesamiento de documentos escaneados: al heredar la torre de vision del modelo base, puede recibir imagenes de documentos y producir la traduccion del texto reconocido, aunque el ajuste se centra en texto.
- Investigacion en traduccion automatica: el modelo sirve como referencia reproducible de la receta TranslateGemma sobre una base de 4B efectivos, con datos de entrenamiento y protocolo de evaluacion documentados.
- Generacion de subtitulos y contenido editorial: la ventana de contexto, aunque no documentada, permite procesar parrafos completos manteniendo coherencia terminologica dentro de un mismo prompt.

## Benchmarks y rendimiento

Resultados de la model card con decodificacion greedy. Cada celda es COMET-22 (mayor es mejor) / MetricX-24 (menor es mejor), promediado sobre las direcciones del grupo.

| Conjunto de prueba | Direcciones | Gemma 4 E4B (base) | Este modelo | SFT solo ja⇄en (fase 1) | TranslateGemma 4B |
|---|---|---|---|---|---|
| FLORES+ devtest | en→X (10) | 0,8952 / 1,925 | 0,8978 / 1,800 | 0,8967 / 1,808 | 0,8904 / 1,937 |
| FLORES+ devtest | X→en (10) | 0,8836 / 2,108 | 0,8836 / 2,059 | 0,8826 / 2,062 | 0,8760 / 2,113 |
| FLORES+ devtest | X→Y (4) | 0,8956 / 2,906 | 0,8953 / 2,872 | 0,8960 / 2,808 | 0,8895 / 3,063 |
| WMT24++ | en→X (10) | 0,8424 / 3,290 | 0,8488 / 3,069 | 0,8473 / 3,050 | 0,8386 / 3,107 |

Segun la model card, frente al modelo base, el bootstrap emparejado con intervalo de confianza del 95 % muestra ganancias significativas de COMET-22 en la mayoria de direcciones ingles→X; las direcciones X→ingles y japones⇄chino/coreano quedan a la par del modelo base en COMET-22.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas memoria para el procesador y el contexto; en la practica se recomienda una GPU con 24 GB o mas.
- Cuantizacion: no se documentan pesos GGUF ni cuantizados en el repositorio; para reducir VRAM habria que convertir los safetensors a 8 o 4 bits con herramientas externas (bitsandbytes, GPTQ, AWQ), sin garantia oficial.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion a 8 bits, en GPUs de 16 GB como RTX 4080; en 12 GB requeriria cuantizacion a 4 bits.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `AutoProcessor` (metodo documentado), y previsiblemente vLLM o TGI para servir en produccion, aunque no se confirma compatibilidad en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas / direcciones | Rendimiento (FLORES+ en→X, COMET-22) |
|---|---|---|---|---|---|
| gemma-4-e4b-translate-ml | 7.941.100.832 | no disponible | Apache 2.0 | 11 idiomas, 24 direcciones | 0,8978 |
| Gemma 4 E4B (base) | 7.941.100.832 | no disponible | Apache 2.0 | multilingue general | 0,8952 |
| TranslateGemma 4B | no disponible | no disponible | no disponible | no disponible | 0,8904 |
| SFT solo ja⇄en (fase 1) | no disponible | no disponible | no disponible | ja⇄en | 0,8967 |

## Limitaciones y advertencias

- Las direcciones fuera de las 24 entrenadas recaen en la capacidad del modelo base, con calidad no garantizada.
- La mejora en MetricX-24 es mayor que en COMET-22 en algunas direcciones, en parte por un sesgo derivado de la seleccion de datos basada en MetricX.
- Riesgo de alucinacion y de omitir o anadir contenido en textos largos o con terminologia especializada; se recomienda revision humana en dominios sensibles.
- El modelo no esta afiliado ni respaldado por Google y no es una version oficial de TranslateGemma, pese a usar su receta y su nombre en las etiquetas.
- Los datos de entrenamiento incluyen traducciones generadas por DeepSeek V4.1 Flash bajo los terminos de la plataforma DeepSeek; conviene revisar las condiciones de uso de dichos datos si se redistribuye el modelo.
- El ajuste LoRA solo toca el decodificador de texto: las capacidades de vision y audio son las del modelo base y no han sido optimizadas para traduccion de imagenes.
- No se documentan sesgos especificos por idioma ni evaluaciones de robustez fuera de FLORES+ y WMT24++.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkz-1981/gemma-4-e4b-translate-ml
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- TranslateGemma 4B: https://huggingface.co/google/translategemma-4b-it
- Informe tecnico de TranslateGemma: https://arxiv.org/abs/2601.09012
