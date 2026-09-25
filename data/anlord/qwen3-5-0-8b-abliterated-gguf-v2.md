# anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2

# Ficha tecnica: anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2

## Resumen

Qwen3.5-0.8B-Abliterated-GGUF-V2 es una publicacion de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.5-0.8B, un transformer decoder de 752.393.024 parametros (~0,75 mil millones) desarrollado originalmente por el equipo Qwen y liberado bajo licencia Apache-2.0. El repositorio lo mantiene el usuario anlord y no aporta pesos nuevos: su valor anadido es triple, ya que parte de una version "abliterated" (V2) del modelo base, la convierte a GGUF y la distribuye en ocho niveles de cuantizacion distintos.

El proceso de abliteracion se realizo con la herramienta AnlordAbliterator 1.3.0 y consiste en eliminar la direccion de activacion asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder. Segun la model card, el modelo base pasaba de 97 rechazos sobre 100 peticiones a solo 2 sobre 100 tras la ablacion, con una divergencia KL de 0,0453 respecto al original y unas 5050 segundos de computo repartidos en 200 iteraciones de optimizacion.

La relevancia de esta ficha es acotada pero clara: se trata de un modelo muy pequeno, ejecutable en CPU y en cualquier GPU de consumo, pensado para inferencia local con llama.cpp y para experimentacion con tecnicas de desalineacion y red teaming. No es una publicacion de investigacion ni incluye evaluacion de capacidades, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (inferido de la compatibilidad con llama.cpp y del pipeline text-generation); detalles de capas, atencion y normalizacion no disponibles |
| Parametros totales | 752.393.024 (~0,75 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama-cli, llama.cpp y aplicaciones compatibles); el modelo base original se publica en safetensors |
| Tamano del repositorio | 6,6 GB (suma de los ocho ficheros GGUF) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | text-generation (tag conversational, endpoints_compatible) |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-0.8B, del que esta publicacion solo redistribuye derivados cuantizados. La model card no documenta la arquitectura interna (numero de capas, cabezas de atencion, tipo de normalizacion, uso de GQA o de atencion lineal), el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o RL. Tampoco se detalla el contexto nativo soportado. Todo ello figura como no disponible en la informacion consultada.

Lo unico documentado es la intervencion sobre los pesos: la ablacion se aplico con AnlordAbliterator 1.3.0, que busca una direccion en el espacio de activaciones cuya proyeccion se resta para suprimir el comportamiento de rechazo. El resultado reportado es una reduccion de 97/100 a 2/100 rechazos, una divergencia KL de 0,04527735710144043 frente al modelo original y un coste de unas 5050 segundos en 200 iteraciones de optimizacion. Se trata de la version V2 de la ablacion. Posteriormente, los pesos resultantes se convirtieron a GGUF y se cuantizaron a los ocho formatos publicados; no se reporta ningun entrenamiento adicional ni ajuste sobre los pesos abliterados.

## Capacidades

- Generacion de texto conversacional: el modelo se publica con pipeline text-generation y tag conversational, por lo que esta orientado a dialogos de un solo turno y multiturno.
- Respuesta sin rechazos: la abliteracion reduce las negativas de 97/100 a 2/100 en el conjunto de prueba del autor, de modo que el modelo responde a peticiones que el original rechazaria.
- Razonamiento y codigo: no se documentan capacidades especificas ni evaluaciones al respecto; no disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo thinking, vision o audio: no disponible; no se anuncia ninguna capacidad multimodal ni modo de razonamiento extendido.
- Despliegue en local: compatible con llama.cpp y con cualquier runtime que consuma GGUF.

## Casos de uso

- Red teaming y evaluacion de alineacion: el modelo permite comprobar como se comporta un sistema ante peticiones que el modelo original rechazaria, y sirve para medir la eficacia de las capas de filtrado propias antes de desplegar un asistente.
- Investigacion sobre abliteration: al existir versiones Transformers (V2) y GGUF del mismo modelo, se puede reproducir el pipeline completo (ablacion, conversion, cuantizacion) y comparar metricas como la divergencia KL entre niveles de cuantizacion.
- Generacion de ficcion y contenido creativo sin restricciones tematicas: con 0,75 mil millones de parametros cabe en cualquier equipo y permite escribir narrativa con violencia, contenido adulto o temas sensibles sin que el modelo se niegue.
- Generacion de datos sinteticos para ajuste: util para producir conjuntos de texto etiquetado o pares instruccion-respuesta a bajo coste en local, aceptando la perdida de calidad que implica un modelo de este tamano.
- Inferencia en edge y entornos sin GPU: los ficheros Q4_0 y Q4_K_M ocupan en torno a 0,4-0,5 GB, por lo que el modelo se puede ejecutar en CPU, en mini-PC o en dispositivos con poca memoria.
- Pruebas de integracion de pipelines GGUF: sirve como modelo de carga rapida en tests automatizados de llama.cpp, Ollama o servidores compatibles con la API de OpenAI, ya que su huella de memoria es minima.
- Prototipado de aplicaciones de chat privado: al ejecutarse en local no requiere enviar datos a un servicio externo, lo que encaja en escenarios con requisitos de privacidad estrictos.
- Clasificacion y etiquetado de texto a gran escala: con throughput alto por su tamano reducido, es viable etiquetar volumenes grandes de documentos siempre que la tarea no requiera razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de capacidades. El unico dato cuantitativo reportado es el efecto de la ablacion sobre las negativas:

| Metrica | Valor |
|---|---|
| Rechazos iniciales (modelo base) | 97 / 100 |
| Rechazos finales (V2 abliterated) | 2 / 100 |
| Divergencia KL respecto al original | 0,04527735710144043 |
| Tiempo de ablacion | ~5050 s (200 iteraciones de optimizacion) |

Se desconoce la composicion del conjunto de 100 peticiones usado para medir los rechazos, por lo que el dato debe tomarse como una indicacion del autor y no como una evaluacion independiente.

## Requisitos de hardware

Los tamanos de fichero son estimaciones a partir de los 752.393.024 parametros y del numero de bits por peso de cada formato; el repositorio ocupa 6,6 GB en total entre los ocho ficheros.

- VRAM estimada para inferencia:
  - BF16 / F16: ~1,5 GB
  - Q8_0: ~0,8 GB
  - Q6_K: ~0,62 GB
  - Q5_K_M: ~0,54 GB
  - Q5_0: ~0,52 GB
  - Q4_K_M: ~0,45 GB
  - Q4_0: ~0,42 GB
- A estas cifras hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto efectiva, que no esta documentada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. No hay ninguna razon para emplear A100 o H100 salvo en escenarios de evaluacion masiva por lotes.
- GPU de consumo: cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores, e incluso en iGPUs con memoria unificada.
- CPU: los formatos Q4_0, Q4_K_M y Q5_K_M son viables en CPU con 2-4 GB de RAM disponible.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y cualquier runtime que lea GGUF. vLLM y TGI no consumen GGUF de forma nativa; para ellos habria que usar la version Transformers abliterated en safetensors.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo de 0,75 mil millones de parametros en Q4_K_M sobre una GPU de consumo moderna suele generar cientos de tokens por segundo con llama.cpp, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

Los datos de las alternativas proceden del conocimiento general de esos modelos y no se han verificado en la busqueda web realizada; conviene contrastarlos con sus model cards oficiales. La comparacion directa con Qwen3.5-0.8B no es posible porque su contexto, idiomas y arquitectura no estan documentados en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2 | 0,75 B | no disponible | Apache-2.0 | GGUF | Abliterado; sin evaluacion de capacidades; 0 descargas |
| Qwen/Qwen3-0.6B | 0,6 B | 32 768 tokens (dato a verificar) | Apache-2.0 | safetensors, GGUF | Modelo original alineado, con modo thinking |
| meta-llama/Llama-3.2-1B | 1,23 B | 128 000 tokens (dato a verificar) | Llama 3.2 Community License | safetensors, GGUF | Uso comercial permitido con condiciones; no abliterado |
| google/gemma-3-1b-it | 1 B | 32 768 tokens (dato a verificar) | Gemma Terms of Use | safetensors, GGUF | Multimodal en su variante mayor; no abliterado |

Frente a estas alternativas, la diferencia de este repositorio no es el rendimiento ni el contexto, sino la ausencia de rechazos y la disponibilidad inmediata en ocho niveles de cuantizacion GGUF.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo de forma deliberada. El modelo puede generar contenido danino, ilegal o gravemente ofensivo sin filtros. Cualquier despliegue orientado al publico requiere capas de moderacion externas.
- La divergencia KL de 0,0453 respecto al modelo original indica que la ablacion modifica el comportamiento del modelo, pero no se documenta su impacto sobre las capacidades (coherencia, codigo, matematicas).
- Con 0,75 mil millones de parametros, la calidad de generacion, el razonamiento y el seguimiento de instrucciones complejas seran limitados en comparacion con modelos de 7B o mas.
- Riesgo de alucinacion elevado y no medido: no hay evaluaciones de fidelidad factual.
- La cuantizacion introduce diferencias adicionales de comportamiento y calidad respecto al modelo en safetensors, tal como advierte el propio autor.
- Longitud de contexto e idiomas soportados no documentados; no se puede garantizar un rendimiento correcto mas alla del ingles sin pruebas propias.
- No se documentan sesgos, composicion del dataset de entrenamiento ni procesos de alineacion del modelo base, por lo que no es posible evaluar sesgos sistematicos.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y consultar los terminos del modelo base Qwen/Qwen3.5-0.8B, que se declaran como Apache-2.0 en la model card.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el 2026-09-25 en un lapso de seis minutos. No hay garantia de mantenimiento, soporte ni correccion de errores.
- No se especifica la herramienta ni el conjunto de datos utilizado para medir las 100 peticiones de la prueba de rechazos, lo que limita la reproducibilidad del resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version Transformers abliterated (V2): https://huggingface.co/anlord/Qwen3.5-0.8B-Abliterated-V2
- Herramienta de ablacion AnlordAbliterator: https://github.com/justbedwarsplay/AnlordAbliterator

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre Qwen3.5-0.8B; los enlaces anteriores son los unicos recursos verificables encontrados.
