# helloAI333/LilyStory-ONNX

## Resumen

LilyStory-ONNX es la conversión al formato ONNX del modelo Conlanger-LLM-CLEM/LilyStory, un micro-modelo de lenguaje (TLM, Tiny Language Model) especializado en la generación de narrativa corta en inglés. El modelo original fue desarrollado por Conlanger-LLM-CLEM y esta versión ONNX ha sido generada y publicada por el usuario helloAI333 mediante el Space automático de conversión de onnx-community. Su propósito es permitir la ejecución del modelo en entornos JavaScript/TypeScript a través de Transformers.js, sin necesidad de infraestructura Python.

La característica más llamativa es su tamaño: aproximadamente 122 000 parámetros, un orden de magnitud varias veces inferior al de los modelos más pequeños convencionales. A pesar de ello, el autor afirma que mantiene coherencia sintáctica y temática en relatos infantiles breves. Está entrenado exclusivamente en inglés y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones ligeras.

El modelo resulta relevante ahora por dos motivos: por un lado, demuestra que es posible desplegar generación de texto narrativo en navegador o en dispositivos embebidos con recursos mínimos; por otro, sirve como caso de estudio sobre compresión extrema del conocimiento lingüístico y sobre los límites prácticos de los modelos de lenguaje de muy baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); conversión a ONNX para Transformers.js |
| Parametros totales | ~122 000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio es una conversión ONNX; no se detallan variantes) |
| Idiomas soportados | Inglés (US/UK) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de describirlo como un TLM (Tiny Language Model) "optimizado para la eficiencia extrema". No se especifica si se trata de un transformer decoder-only estándar, el número de capas, la dimensión de los embeddings ni la configuración de atención. Tampoco se documenta la longitud de contexto soportada ni el vocabulario utilizado.

Respecto al entrenamiento, la model card menciona un "dataset propietario" de calidad, pero no indica el número de tokens, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. No se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La conversión a ONNX se realizó de forma automática mediante el Space de onnx-community, por lo que el repositorio no aporta información adicional sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto narrativo corto en inglés, orientado a cuentos infantiles y relatos simples.
- Mantenimiento de estructuras gramaticales básicas, incluyendo fórmulas de inicio como "Once upon a time" y diálogos simples.
- Gestión de entidades narrativas: el autor observa que el modelo identifica y relaciona personajes (Lily, Mom, Tom).
- Uso de vocabulario contextual relacionado con el hogar y las emociones (backyard, friends, smiled).
- Transiciones temporales básicas ("After it", "One day").
- Ejecución en entornos con recursos mínimos: CPU de baja potencia, navegador y dispositivos embebidos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de pensamiento.

## Casos de uso

- Generación procedimental de diálogos para PNJ en videojuegos ligeros: el tamaño de 122 000 parámetros permite ejecutar el modelo en el propio navegador o en el cliente del juego, generando frases narrativas breves sin coste de servidor.
- Historias interactivas para aplicaciones web: gracias a la conversión ONNX y a Transformers.js, puede integrarse directamente en una página web para producir relatos cortos a partir de una semilla, sin backend Python.
- Educación temprana en inglés: sirve como apoyo para mostrar estructuras de frases básicas y vocabulario sencillo en herramientas didácticas de bajo coste.
- Investigación sobre compresión extrema de conocimiento lingüístico: permite estudiar qué capacidades mínimas conserva un modelo de 122 000 parámetros y cómo se degrada la coherencia al reducir la escala.
- Prototipado rápido de interfaces de escritura creativa: al ejecutarse en el navegador, facilita demos y pruebas de concepto de generación narrativa sin infraestructura.
- Aplicaciones embebidas y de bajo consumo: puede desplegarse en dispositivos con recursos casi inexistentes para generar texto decorativo o narrativo de forma local.
- Filtro o baseline en experimentos de generación de cuentos: útil como referencia inferior en comparativas de modelos narrativos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; con 122 000 parámetros el modelo ocupa del orden de cientos de kilobytes en precisión completa, por lo que cabe en cualquier dispositivo.
- GPU recomendadas: no requiere GPU; está pensado para CPU y para ejecución en navegador mediante Transformers.js.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU de baja potencia, dispositivos embebidos).
- Opciones de despliegue: Transformers.js (principal, por el formato ONNX); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LilyStory-ONNX | ~122 000 | no disponible | Inglés | Apache 2.0 | ONNX |
| Conlanger-LLM-CLEM/LilyStory | ~122 000 | no disponible | Inglés | Apache 2.0 | no disponible |
| Modelos de juguete tipo TinyStories (referencia genérica) | del orden de millones | no disponible | Inglés | variable | variable |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y formato; los modelos de la familia TinyStories se citan solo como referencia categórica y sus cifras concretas no están verificadas en esta ficha.

## Limitaciones y advertencias

- Calidad de generación muy limitada: el propio ejemplo de la model card muestra texto incoherente ("Once upon a time, one was a boy... Lily went to his mom smiled and he was too"), lo que indica que la coherencia es parcial y frágil.
- Riesgo elevado de alucinación y de deriva semántica: con 122 000 parámetros no hay capacidad para mantener consistencia factual ni narrativa prolongada.
- Solo inglés: no soporta castellano ni otros idiomas.
- Longitud de contexto no documentada: no se puede garantizar el manejo de entradas largas.
- No apto para producción en tareas que requieran precisión, razonamiento o contenido factual.
- Posibles sesgos derivados del dataset propietario no documentado; no se han publicado análisis de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen no están documentados en detalle, lo que conviene verificar antes de un despliegue comercial.
- El repositorio figura con tamaño de 0.0 GB y sin descargas relevantes (207 descargas, 0 likes), lo que sugiere escasa validación por parte de la comunidad.
- No se documentan limitaciones específicas de seguridad ni filtros de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/helloAI333/LilyStory-ONNX
- Modelo base: https://huggingface.co/Conlanger-LLM-CLEM/LilyStory
- Space de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de Transformers.js para text-generation: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
