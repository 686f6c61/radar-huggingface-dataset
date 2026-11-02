# debuffjp/decide-multilingual

## Resumen

Decide Multilingual es un encoder de frases publicado por debuffjp como componente del ecosistema decidekit, una libreria que implementa un clasificador de texto "System One" que elige una etiqueta entre un conjunto definido por el usuario directamente en el dispositivo. El modelo no aporta pesos nuevos: es una copia sin modificar de `Xenova/multilingual-e5-small` en formato ONNX, que a su vez es la conversion del modelo `intfloat/multilingual-e5-small` de Microsoft, bajo licencia MIT. Su funcion es servir como base de embeddings multilingue sobre la que decidekit anade una cabeza de clasificacion entrenada y una capa de confianza calibrada.

La relevancia practica es acotada pero clara: ofrece un encoder multilingue de unos 118 MB en cuantizacion de 8 bits, ejecutable en navegador mediante transformers.js, con una fuente de pesos fijada a una revision concreta para garantizar reproducibilidad en produccion. Esta pensado para tareas de enrutamiento de intenciones, clasificacion de tickets o etiquetado ligero sin enviar datos a un servidor.

Es importante subrayar que el modelo en si solo produce embeddings (pipeline `feature-extraction`); la capacidad de decidir entre etiquetas reside en la cabeza y el calibrador que aporta la libreria decidekit, no en estos pesos. El autor reporta un 76% de acierto en intenciones MASSIVE para japones y chino usando todos los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: intfloat/multilingual-e5-small) |
| Parametros totales | no disponible (el modelo base e5-small ronda los 118 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX en 8 bits (aproximadamente 118 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | multilingue (sin listado explicito en la informacion proporcionada) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT heredado de `intfloat/multilingual-e5-small`, convertido a ONNX por Xenova y redistribuido aqui sin modificaciones en la revision `761b726`. No ha habido entrenamiento adicional por parte de debuffjp: los pesos son identicos a los del modelo base. La innovacion del proyecto no esta en el encoder, sino en el stack decidekit que lo envuelve, que anade una cabeza de clasificacion entrenada y una estimacion de confianza calibrada para seleccionar una etiqueta entre las candidatas que define el usuario.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO; estos detalles pertenecen a la model card de `intfloat/multilingual-e5-small`, no incluida en la informacion proporcionada. La evaluacion reportada por el autor se realizo sobre el conjunto de intenciones MASSIVE con todos los datos de entrenamiento, con un 76% de acierto en japones y chino. El script de evaluacion esta publicado en el repositorio de decidekit.

## Capacidades

- Generacion de embeddings de frases para texto multilingue (pipeline `feature-extraction`).
- Clasificacion de texto en etiquetas definidas por el usuario a traves de la cabeza de decidekit, con salida de etiqueta elegida y nivel de confianza.
- Ejecucion en el dispositivo del usuario mediante transformers.js y ONNX, sin necesidad de backend.
- Soporte multilingue heredado del modelo base e5-small.
- Integracion directa en TypeScript mediante la funcion `createDecider` de decidekit.
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio, tool calling ni modo de pensamiento: es exclusivamente un encoder para clasificacion y similitud.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo genera el embedding del mensaje del usuario y decidekit lo compara con las etiquetas candidatas, permitiendo derivar la consulta al flujo adecuado sin llamar a un LLM.
- Clasificacion de tickets de soporte en el navegador: con etiquetas como `card_arrival` o `refund`, el modelo permite categorizar reclamaciones en el cliente, manteniendo los datos del usuario en su dispositivo.
- Moderacion o triaje ligero de contenido multilingue: util para prefiltrar mensajes por categoria antes de un analisis mas costoso en servidor.
- Busqueda semantica local en aplicaciones web: los embeddings permiten indexar y recuperar documentos pequenos o fragmentos de interfaz sin infraestructura de backend.
- Deduplicacion y agrupacion de textos: comparar embeddings para detectar mensajes o registros duplicados en varios idiomas.
- Etiquetado asistido en herramientas internas: sugerir una categoria al operador humano a partir de un conjunto predefinido, con un nivel de confianza que permite decidir si se acepta la sugerencia.
- Filtros y recomendaciones en el cliente: clasificar elementos por tematica usando similitud coseno contra embeddings de referencia.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MASSIVE intents (japones y chino, todos los datos de entrenamiento) | 76% | Reportado por el autor con la cabeza de decidekit, no con el encoder aislado |

No se han publicado en la informacion disponible resultados de benchmarks estandar del encoder (MMLU, HumanEval, GSM8K, MTEB u otros), ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- Inferencia en CPU: viable gracias al tamano reducido (aproximadamente 118 MB en 8 bits) y al runtime ONNX.
- VRAM estimada en GPU: no disponible con precision; por el tamano del modelo, cabe holgadamente en cualquier GPU consumer con mas de 1 GB de memoria.
- GPU recomendadas: no aplica realmente; el modelo esta pensado para ejecucion en CPU o en el navegador. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) lo ejecutaria sin problema, pero no es el escenario objetivo.
- Despliegue: transformers.js (navegador y Node.js) y ONNX Runtime. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para un encoder de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| debuffjp/decide-multilingual | no disponible (base e5-small) | no disponible | multilingue | MIT | ONNX |
| intfloat/multilingual-e5-small | no disponible | no disponible | multilingue | MIT | safetensors |
| Xenova/multilingual-e5-small | no disponible | no disponible | multilingue | MIT | ONNX |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. Cualquier otro encoder multilingue de tamano similar (por ejemplo, variantes de LaBSE o paraphrase-multilingual-MiniLM) requeriria datos de benchmark que no estan disponibles aqui para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Los pesos son una copia sin modificar de `Xenova/multilingual-e5-small`; el modelo no aporta ninguna mejora sobre el encoder original.
- La calidad de clasificacion depende de la cabeza y la calibracion de decidekit, no del encoder; el 76% reportado corresponde al sistema completo sobre MASSIVE, no a un benchmark general.
- No se documentan sesgos conocidos, tasas de alucinacion (no aplica en sentido generativo) ni limitaciones especificas de contexto o idioma mas alla de lo heredado del modelo base.
- El uso comercial esta permitido por la licencia MIT, pero conviene verificar las condiciones del modelo base `intfloat/multilingual-e5-small` y de la conversion de Xenova, tambien MIT segun la informacion disponible.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto muy reciente y sin validacion externa.
- La dependencia de decidekit para la funcionalidad de clasificacion implica acoplamiento a esa libreria; el modelo por si solo solo genera embeddings.
- No hay informacion sobre la longitud maxima de secuencia soportada, lo que puede afectar a textos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/debuffjp/decide-multilingual
- Modelo base en HuggingFace: https://huggingface.co/intfloat/multilingual-e5-small
- Conversion ONNX de referencia: https://huggingface.co/Xenova/multilingual-e5-small
- Sitio de decidekit: https://debuff.jp/decide/
- Script de evaluacion multilingue: https://github.com/debuffjp/decidekit/blob/main/eval/multilingual.ts
- Repositorio de decidekit: https://github.com/debuffjp/decidekit
