# aoiandroid/LFM2-350M-ENJP-MT-GGUF

## Resumen

LFM2-350M-ENJP-MT-GGUF es un espejo (mirror) sin modificaciones del modelo LiquidAI/LFM2-350M-ENJP-MT-GGUF, publicado por el usuario aoiandroid para que una aplicación denominada Cription no dependa de un repositorio de terceros. No se trata de un modelo nuevo ni de un reentrenamiento: el autor declara que contiene un subconjunto de los ficheros del repositorio original (3 ficheros, 379,2 MB) con las mismas rutas y las mismas sumas SHA-256, correspondientes al commit `889c88c3d3681b4f342ae210a1d2a1369aba0e10`. Todos los derechos y el crédito pertenecen a los autores originales, Liquid AI.

El modelo original es un LFM2 de 350 M de parámetros (354.483.968 según los pesos safetensors del repositorio fuente), especializado en traducción automática inglés-japonés (ENJP = English-Japanese, MT = Machine Translation) y distribuido en formato GGUF, lo que lo orienta a inferencia en CPU y dispositivos de borde. Por su tamaño reducido, es un candidato para traducción embebida en aplicaciones de escritorio o móviles, escenarios sin conectividad y entornos con recursos limitados.

La relevancia actual de esta ficha es acotada: es un artefacto de redistribución, no una publicación científica. Se desconoce el detalle de arquitectura, datos de entrenamiento y evaluación en la información proporcionada, y el propio repositorio no incluye resultados de benchmarks. Los datos de descargas y "likes" son cero, y la model card se limita a acreditar la procedencia del espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (pertenece a la familia LFM2 de Liquid AI) |
| Parametros totales | 354.483.968 (≈350 M; dato real del safetensors del repositorio fuente) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; niveles concretos no disponibles (el espejo contiene 3 ficheros, 379,2 MB en total) |
| Idiomas soportados | traduccion ingles-japones segun el nombre del modelo; la model card no declara lista de idiomas |
| Licencia | lfm1.0 (Liquid Foundation Model License); heredada del repositorio original |
| Formato de pesos | GGUF (repositorio de tipo "mirror"; el origen en safetensors declara 354.483.968 parametros) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La model card de este espejo no describe la arquitectura ni el proceso de entrenamiento: se limita a indicar la procedencia del contenido. El modelo fuente pertenece a la familia LFM2 de Liquid AI, cuyos materiales públicos describen un diseño híbrido orientado a despliegue en dispositivo, pero este repositorio no reproduce esa documentación ni confirma las características de esta variante concreta de traducción. Por tanto, cualquier detalle sobre número de capas, mecanismos de atención o bloques de convolución debe consultarse en el repositorio original, no aquí.

Del mismo modo, no hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas de esta variante ENJP-MT. El espejo garantiza equivalencia byte a byte con el origen (mismos tamaños y mismas sumas SHA-256/git blob id), de modo que su comportamiento es idéntico al del modelo de Liquid AI.

## Capacidades

- Traduccion automatica ingles-japones (ENJP-MT), segun la denominacion del modelo.
- Generacion de texto conversacional, dado que el tag `conversational` figura en los metadatos del repositorio.
- Inferencia en formato GGUF, apta para ejecucion en CPU y en dispositivos de baja capacidad mediante llama.cpp y derivados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues mas alla del par ingles-japones: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Traduccion embebida en aplicaciones de escritorio: es el uso declarado por el autor del espejo, que integra el modelo en la aplicacion Cription para no depender de un repositorio de terceros. El tamano de 350 M permite distribuir el modelo junto al binario.
- Traduccion offline en dispositivos sin conectividad: al ser un GGUF de ~350 M y menos de 0,4 GB, puede ejecutarse localmente en portatiles y equipos modestos sin enviar texto a servicios en la nube.
- Traduccion en el navegador mediante WebAssembly: llama.cpp puede compilarse a WASM y este modelo cabe en memoria de una pestana, lo que habilita traduccion EN-JA sin backend.
- Preprocesado en pipelines de localizacion: traduccion inicial de cadenas de interfaz o documentacion tecnica en ingles para revision posterior por traductores humanos.
- Prototipado de productos de traduccion sin GPU: permite validar la experiencia de usuario y los flujos de integracion antes de escalar a modelos mayores.
- Traduccion de mensajes en tiempo real en dispositivos de bajo consumo: por ejemplo, en chats o clientes de mensajeria que necesiten una capa de traduccion local con latencia baja.
- Sistemas embebidos y hardware tipo Raspberry Pi: viable para traducir texto corto en kioscos, terminales o dispositivos industriales sin acceso a internet.
- Generacion de datos sinteticos o aumento de corpus: uso del modelo para producir borradores EN-JA que luego se filtran, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculada a partir de 354,5 M de parametros, sin contar cache KV, que es reducida en contextos cortos):
  - FP16: aproximadamente 0,71 GB.
  - Q8_0 (int8): aproximadamente 0,35 GB.
  - Q6_K: aproximadamente 0,29 GB.
  - Q5_K_M: aproximadamente 0,25 GB.
  - Q4_K_M / Q4_0: aproximadamente 0,20-0,21 GB.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU de consumo puede alojarlo con holgura; tambien funciona en GPU integradas.
- Cabe en GPU de consumo: si, en cualquier modelo reciente (por ejemplo, series RTX 30/40, e incluso en equipos sin GPU dedicada).
- CPU: ejecutable en CPU x86-64 y ARM; tamano compatible con Raspberry Pi y dispositivos similares.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp y otros frontends compatibles con GGUF. Para el formato safetensors del origen, librerias tipo transformers.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del nivel de cuantizacion y de la longitud de secuencia. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| aoiandroid/LFM2-350M-ENJP-MT-GGUF (este repo) | 354.483.968 | no disponible | GGUF | lfm1.0 | Espejo exacto del original; 3 ficheros, 379,2 MB |
| LiquidAI/LFM2-350M-ENJP-MT-GGUF (origen) | 354.483.968 | no disponible | GGUF | lfm1.0 | Repositorio fuente en el commit `889c88c...`; misma licencia y contenidos |
| LiquidAI/LFM2-350M (base) | ≈350 M | no disponible | safetensors / GGUF | lfm1.0 | Modelo base de la familia; no especializado en traduccion EN-JA |
| Modelos MT EN-JA de proposito especifico (por ejemplo, familias tipo OPUS-MT o NLLB) | no disponible | no disponible | varios | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de evaluacion que permitan comparar el rendimiento de traduccion frente a alternativas.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: no aporta mejoras, correcciones ni soporte; cualquier incidencia debe reportarse al repositorio de Liquid AI.
- No se han publicado benchmarks ni evaluacion de calidad de traduccion en la informacion disponible, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion y de errores de traduccion no cuantificado; en un modelo de 350 M es esperable una calidad inferior a la de modelos mayores, especialmente en textos largos o especializados.
- Longitud de contexto no documentada: no conviene asumir ventanas amplias para documentos largos.
- Idiomas soportados: el nombre sugiere ingles-japones; no hay confirmacion de otros pares.
- Licencia lfm1.0 (Liquid Foundation Model License): antes de cualquier uso comercial hay que revisar el texto completo de la licencia en el repositorio; no se garantiza que el uso comercial este permitido en todos los casos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni comunidad que valide su comportamiento.
- Dependencia de terceros: al ser una copia, la trazabilidad y la integridad deben verificarse contra el origen (el autor afirma que tamanos y hashes coinciden, pero no se aporta verificacion independiente).

## Enlaces

- HuggingFace (este espejo): https://huggingface.co/aoiandroid/LFM2-350M-ENJP-MT-GGUF
- Repositorio original: https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT-GGUF
- Arbol del commit fuente: https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT-GGUF/tree/889c88c3d3681b4f342ae210a1d2a1369aba0e10
- Licencia (fichero LICENSE en el repositorio): incluida en el propio repositorio
- Model card original conservada como SOURCE_README.md en el espejo
