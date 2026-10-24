# AlbenW/alben-onnx

## Resumen

Alben (ONNX) es la exportación a formato ONNX de un modelo de decisión y puntuación de opciones ("decision model") del author AlbenW. El repositorio no contiene un modelo generativo, sino un codificador tipo transformer exportado a ONNX junto con su tokenizador y un fichero de metadatos (`onnx_meta.json`) que incluye la temperatura de calibración. Su función es puntuar un conjunto cerrado de opciones (por ejemplo, `{billing: "refunds", tech: "bugs"}`) dada una instrucción y un texto de entrada, y devolver la opción elegida junto con su confianza y la distribución de probabilidad.

La relevancia del artefacto es de despliegue, no de investigación: elimina la dependencia de PyTorch y de Python, de modo que puede ejecutarse en Node.js, en dispositivos de borde, en contenedores pequeños o en cualquier entorno con `onnxruntime` disponible. El codificador ocupa aproximadamente 91 MB incluyendo los pesos externos, y el autor declara una alineación con la implementación de referencia en PyTorch de hasta `2.7e-07` de error absoluto máximo en los embeddings de frase y decisiones idénticas en 7 de 7 opciones en su prueba de consistencia.

No hay información pública sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. La model card está mayoritariamente en chino e inglés, la licencia es Apache-2.0 y el codificador subyacente se atribuye a BAAI (MIT) según el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador transformer exportado a ONNX (encoder-only, modelo de decisión/puntuación); arquitectura interna del codificador no disponible |
| Parámetros totales | no disponible (el fichero del codificador pesa ~91 MB con pesos externos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (codificador subyacente de BAAI, MIT, según el autor) |
| Formato de pesos | ONNX (`alben-encoder.onnx` + `.data` externo), tokenizador en `tokenizer/` y metadatos en `onnx_meta.json` |
| Tamaño del repositorio | 0,1 GB |
| Librería declarada | `alben` |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-24 / 2026-10-24 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es una exportación de inferencia: un codificador transformer (encoder-only) convertido a ONNX, con el tokenizador empaquetado y verificado para producir los mismos identificadores que la implementación en Python ("逐 id 一致", coincidencia id a id). No se documenta el número de capas, dimensiones ocultas, cabezas de atención ni la composición del corpus de entrenamiento. El autor indica que el codificador pertenece a BAAI y se distribuye aquí como exportación bajo Apache-2.0.

La innovación técnica documentada no está en el modelo sino en la receta de puntuación, que debe reproducirse exactamente en cuatro pasos: (1) el texto de cada opción se compone como `instructions + "\n" + description`; (2) los logits se calculan como el producto escalar entre el vector de estado y el vector de la opción, multiplicado por una temperatura fija de `20.0`; (3) se aplica `softmax(logits / calibration_temperature)`, donde la temperatura de calibración se lee de `onnx_meta.json`; (4) la confianza se obtiene con la función `peak_confidence(probs)`. El autor advierte explícitamente que omitir los pasos 2 y 3 produce "todas las opciones correctas, pero con una diferencia de probabilidad de 0,54 y de confianza de 0,81" en sus pruebas.

## Capacidades

- Puntuación y selección entre un conjunto cerrado de opciones discretas (clasificación por candidatos, no generación libre).
- Salida de la opción elegida, la confianza y el vector completo de probabilidades por opción.
- Uso de instrucciones globales compartidas por todas las opciones (parámetro `instructions`), lo que permite condicionar la decisión sin reentrenar.
- Inferencia sin PyTorch y sin Python: disponible vía Node.js (`@alben/node` + `onnxruntime-node`) y vía Python sin torch (`onnxruntime`, `tokenizers`, `numpy`).
- Verificación de consistencia numérica frente a la implementación de referencia en PyTorch (error absoluto máximo `2.7e-07` en embeddings; 7/7 decisiones idénticas; diferencia de probabilidad `0.0000`).
- No se documentan capacidades de generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni modo "thinking".

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la propia model card (`"charged twice, refund please"` hacia `billing: refunds` o `tech: bugs`) se reproduce directamente en producción; el modelo devuelve la cola asignada y una confianza con la que aplicar umbrales de escalado a humano.
- Clasificación de intención en chatbots: sustituir un clasificador entrenado a medida por una llamada `scoreOptions` con las intenciones como claves del diccionario, lo que permite añadir o renombrar intenciones sin reentrenar el codificador.
- Selección de respuesta en FAQ: puntuar varias respuestas candidatas preexistentes frente a la consulta del usuario y devolver la de mayor probabilidad, con la confianza como señal para derivar a atención humana.
- Guardrails y etiquetado de contenido: usar un conjunto cerrado de etiquetas (categorías de riesgo, tipos de solicitud) para clasificar entradas antes de pasarlas a un LLM generativo, con coste de cómputo muy inferior.
- Despliegue en el borde y en serverless: al requerir únicamente `onnxruntime` y ~91 MB de pesos, encaja en funciones ligeras, contenedores pequeños y aplicaciones Node.js sin runtime de Python.
- Enrutado de herramientas en pipelines de agentes: dado un conjunto fijo de herramientas descritas como opciones, seleccionar la más probable para la consulta, dejando la ejecución al orquestador.
- Filtrado previo en pipelines de recuperación (RAG): decidir entre opciones del tipo "responder con contexto" frente a "requiere búsqueda" antes de invocar el modelo generativo, reduciendo latencia y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta pruebas de consistencia frente a la implementación en PyTorch, que se recogen a continuación:

| Prueba | Resultado declarado |
|---|---|
| Error absoluto máximo en embeddings de frase (ONNX vs. PyTorch) | 2,7e-07 |
| Coincidencia de decisión final | 7/7 opciones idénticas |
| Diferencia de probabilidad | 0,0000 |
| Efecto de omitir los pasos 2 y 3 de la receta | Diferencia de probabilidad 0,54; diferencia de confianza 0,81 (medido por el autor) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para los pesos del codificador (~91 MB en disco); el consumo real de memoria depende de la longitud de entrada, que no se documenta.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer sirve, pero el caso de uso declarado es CPU y entornos sin acelerador.
- Cabe en GPU consumer: sí, con margen amplio (cualquier GPU con más de 1-2 GB de memoria libre), aunque el diseño apunta a ejecución en CPU.
- Opciones de despliegue: `onnxruntime` (Python), `onnxruntime-node` con el paquete `@alben/node`, integración en contenedores pequeños y en aplicaciones Node.js; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplicables a un codificador ONNX de este tipo).
- Latencia y throughput: no disponibles. El tamaño del modelo sugiere latencias de milisegundos en CPU para entradas cortas, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de comparación en la información proporcionada: la model card no cita modelos alternativos ni resultados frente a otras implementaciones. Como referencia estructural, el propio autor indica que el codificador subyacente pertenece a BAAI y se distribuye bajo licencia MIT, pero no se identifican qué modelo concreto de BAAI ni sus especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Alben (ONNX) | no disponible (~91 MB de pesos) | no disponible | Apache-2.0 | ONNX | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: solo puntúa opciones suministradas por el desarrollador; no puede producir texto libre ni razonar en varios pasos.
- La corrección depende de reproducir la receta de puntuación completa (temperatura `20.0` y `calibration_temperature` leída de `onnx_meta.json`); omitirla altera gravemente las probabilidades, según las propias mediciones del autor.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de robustez, por lo que no es posible valorar riesgos de sesgo por dominio o idioma.
- Idiomas soportados no documentados; el codificador base es de BAAI, pero se desconoce su cobertura multilingüe real en esta exportación.
- Longitud de contexto no disponible: no se puede planificar el truncado de entradas largas sin medirlo empíricamente.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-10-24), sin validación independiente de la comunidad; los resultados de consistencia son declaraciones del autor.
- Licencia Apache-2.0 permite uso comercial, pero el autor atribuye el codificador a BAAI (MIT); conviene verificar la cadena de licencias antes de un despliegue en producción.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre el modelo (solo resultados no relacionados), por lo que no existe documentación externa contrastable.
- Al ser un artefacto de inferencia, no se publican scripts de entrenamiento ni pesos en formato PyTorch en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AlbenW/alben-onnx
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
