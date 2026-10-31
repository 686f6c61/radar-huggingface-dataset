# backuplan/superprompts-ai-detector

## Resumen

SuperPrompts AI text detector es una exportacion a ONNX cuantizada a int8 del detector de texto generado por IA `fakespot-ai/roberta-base-ai-text-detection-v1`, desarrollado originalmente por el equipo Fakespot de Mozilla. El repositorio, mantenido por el usuario backuplan, no entrena ningun modelo nuevo: su unica contribucion es convertir los pesos originales a formato ONNX con cuantizacion dinamica de 8 bits, reduciendo el tamano a unos 125 MB para que el modelo pueda ejecutarse directamente en el navegador mediante `onnxruntime-web`.

El problema que resuelve es la deteccion de texto escrito por IA (clasificacion binaria humano/IA) sin necesidad de servidores: toda la inferencia ocurre en el dispositivo del usuario, lo que preserva la privacidad y elimina costes de API. El modelo base es un RoBERTa-base con clasificador binario, con ventana de contexto de 512 tokens. Es relevante como ejemplo practico de despliegue de clasificadores de texto ligeros en cliente, y porque el propio README documenta una evaluacion con metricas concretas (AUROC 0,991 en int8), algo poco habitual en repositorios de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base con cabeza de clasificacion binaria |
| Parametros totales | no disponible (≈125 MB en int8; el base RoBERTa ronda los 125 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de secuencia) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica); original disponible en fp32 |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente sobre texto en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx), tokenizer en vocab.json y merges.txt |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder RoBERTa-base con tokenizador byte-level BPE y una cabeza de clasificacion de dos clases (0 = humano, 1 = IA). Las entradas del grafo ONNX son `input_ids` y `attention_mask` de tipo int64 con un maximo de 512 tokens, y la salida son logits de dimension 2. Este repositorio no modifica la arquitectura ni reentrena nada: aplica cuantizacion dinamica int8 sobre el modelo fp32 original, con una perdida de calidad minima segun la evaluacion publicada.

Sobre el entrenamiento del modelo base, la model card de este repositorio no proporciona detalles (numero de tokens, composicion del dataset o tecnicas de post-entrenamiento); esos datos deben consultarse en la ficha de `fakespot-ai/roberta-base-ai-text-detection-v1`. La evaluacion incluida en el README se realizo sobre 91 textos: 50 humanos, 20 de ChatGPT procedentes del dataset HC3, 20 de modelos gpt-oss modernos y 1 de QuillBot AI Chat.

## Capacidades

- Clasificacion binaria de texto: devuelve logits [humano, IA] para un fragmento de hasta 512 tokens.
- Inferencia 100% local en navegador mediante onnxruntime-web, sin envio de datos a servidores.
- Formato ONNX portable: ejecutable tambien en Python (onnxruntime), Node.js y otros runtimes compatibles.
- Tokenizador RoBERTa byte-level BPE incluido en el repo (vocab.json y merges.txt).
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Deteccion de texto IA en el navegador: integracion en una web (como hace SuperPrompts en superprompts.space) para analizar textos pegados por el usuario sin backend ni coste de inferencia.
- Moderacion de contenido en plataformas: filtrado previo de comentarios, resenas o envios de foros sospechosos de ser generados por IA, ejecutandose en el cliente antes de llegar al servidor.
- Privacidad en herramientas editoriales: revision de manuscritos o articulos en redactores que no pueden enviar el texto a APIs de terceros por confidencialidad.
- Extensiones de navegador: el tamano de 125 MB en int8 y onnxruntime-web permiten empaquetar el modelo en una extension para analizar paginas o campos de texto localmente.
- Investigacion y educacion: base ligera para experimentar con cuantizacion int8 y exportacion ONNX de transformers en asignaturas o demos sobre deteccion de texto sintetico.
- Verificacion de autenticidad en procesos de seleccion: analisis preliminar de cartas de presentacion o respuestas escritas, siempre como senal indicativa y no como prueba definitiva.

## Benchmarks y rendimiento

Evaluacion publicada en la model card sobre 91 textos (50 humanos, 20 ChatGPT de HC3, 20 gpt-oss modernos, 1 QuillBot AI Chat):

| Modelo | AUROC | IA detectada (umbral 0,5) | Humanos marcados (umbral 0,5) |
|---|---|---|---|
| fp32 original | 0,993 | 41/41 | 7/50 |
| int8 (este repo) | 0,991 | 40/41 | 7/50 |

No se han publicado comparaciones con otros detectores de texto IA (como GPTZero u OpenAI classifier) en la informacion disponible.

## Requisitos de hardware

- Tamano del modelo: ≈125 MB en int8, ejecutable en CPU.
- No requiere GPU: esta pensado para onnxruntime-web en navegador, usando CPU o WebGL/WASM del cliente.
- Cabe sin problemas en cualquier equipo consumer moderno, incluidos portatiles sin GPU dedicada; no necesita VRAM.
- Memoria RAM estimada en inferencia: del orden de unos cientos de MB (no especificado en la model card).
- Despliegue: onnxruntime-web en navegador (caso principal), onnxruntime en Python o Node.js, o servido como asset estatico desde cualquier CDN.
- Latencia y throughput: no disponibles; al ser un encoder de 125M de parametros con secuencias de hasta 512 tokens, la inferencia en CPU de escritorio es del orden de milisegundos a decenas de milisegundos por texto.

## Comparativa con modelos similares

| Modelo | Tamano / formato | Tarea | Licencia | Despliegue en navegador |
|---|---|---|---|---|
| backuplan/superprompts-ai-detector | ≈125 MB, ONNX int8 | Deteccion texto IA (binario) | Apache-2.0 | Si, nativo (onnxruntime-web) |
| fakespot-ai/roberta-base-ai-text-detection-v1 | RoBERTa-base fp32 (≈500 MB) | Deteccion texto IA (binario) | Apache-2.0 | Requiere conversion propia |
| openai-detectors / GPTZero | API cerrada / no disponible | Deteccion texto IA | Propietaria | Solo via API, no local |

El valor diferencial de esta ficha frente al modelo base es exclusivamente el formato: mismo modelo, mismo rendimiento casi exacto (AUROC 0,991 frente a 0,993), pero con un peso cuatro veces menor y ejecucion local sin dependencia de PyTorch.

## Limitaciones y advertencias

- Falsos positivos en escritura humana: la propia evaluacion marca 7 de 50 textos humanos por encima del umbral 0,5; el README advierte explicitamente que textos como literatura clasica famosa pueden ser mal clasificados. Los resultados deben usarse como senal, nunca como prueba.
- Generalidad limitada del set de evaluacion: 91 textos es una muestra muy pequena y sesgada hacia modelos concretos (ChatGPT/HC3, gpt-oss, QuillBot); el rendimiento frente a otros generadores o tras paraphrasing no esta documentado.
- Idioma: no hay informacion de idiomas soportados en esta ficha; el modelo base esta orientado a ingles, por lo que su fiabilidad en castellano no esta verificada.
- Ventana de 512 tokens: textos mas largos deben fragmentarse, y la agregacion de puntuaciones por fragmento no esta definida en el repo.
- Los detectores de texto IA son inherentemente poco fiables para decisiones de alto impacto (academico, laboral, legal); su uso en produccion requiere supervision humana.
- Licencia Apache-2.0: permite uso comercial sin restricciones relevantes, con atribucion del aviso de licencia.
- Mantenimiento: el repo tiene muy pocas descargas (46) y es una exportacion de terceros sin soporte del autor original; verificar actualizaciones contra el repositorio base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/backuplan/superprompts-ai-detector
- Modelo base original: https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1
- Aplicacion que lo utiliza (SuperPrompts): https://superprompts.space
- No se han encontrado enlaces a papers, demos adicionales ni repositorios de codigo en la informacion disponible.
