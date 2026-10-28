# AstySeeks/Dolphin3.0-Qwen2.5-1.5B-ONNX

## Resumen

Dolphin3.0-Qwen2.5-1.5B-ONNX es la exportación a formato ONNX del modelo Dolphin 3.0 Qwen2.5 1.5B, publicada por el usuario AstySeeks. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada específicamente para ejecutarse con Transformers.js, la librería de Hugging Face que permite inferencia en JavaScript tanto en navegador (mediante WebGPU o WASM) como en Node.js. El modelo base declarado es dphn/Dolphin3.0-Qwen2.5-1.5B, un ajuste de instrucciones sin censura ("uncensored") sobre la arquitectura Qwen2.5.

El interés de esta ficha no está en el rendimiento del modelo —1.540 millones de parámetros lo sitúan en la gama pequeña— sino en el formato: permite desplegar un generador de texto conversacional completamente en el cliente, sin enviar datos a un servidor. Eso abre la puerta a asistentes privados en navegador, extensiones y aplicaciones de escritorio basadas en Electron que no requieren backend de GPU.

La información publicada por el autor es mínima: no hay detalles sobre el proceso de exportación, las variantes de cuantización incluidas, la longitud de contexto soportada ni resultados de evaluación. El repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe validación comunitaria del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer causal decoder-only con atención completa y RoPE) |
| Parametros totales | 1,54 mil millones (1.54B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (export ONNX; no se detallan variantes fp32/fp16/int8/int4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Transformers.js) |

Datos adicionales: tamaño del repositorio 1,8 GB, pipeline `text-generation`, librería `transformers.js`, creado el 27 de octubre de 2026 y actualizado el mismo día según los metadatos de Hugging Face.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5, un transformer decoder-only de tipo causal con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención multi-cabeza con KV cache. El modelo base, Dolphin 3.0 Qwen2.5 1.5B, es un ajuste de instrucciones ("instruction-tuned") derivado de esa familia y descrito por el autor como "uncensored, steerable", es decir, sin las capas habituales de rechazo de contenido y con capacidad de ser dirigido mediante el mensaje de sistema. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preference tuning en el modelo base.

La aportación técnica de este repositorio concreto es únicamente la exportación a ONNX y su empaquetado para Transformers.js. Esto habilita dos backends: WebGPU, que ejecuta las operaciones en la GPU del dispositivo mediante shaders, y WASM, que corre en CPU con menor rendimiento pero máxima compatibilidad. La model card no documenta el grafo ONNX exportado, ni si se aplicaron optimizaciones como fusión de operadores, ni la precisión de los pesos. El tamaño del repositorio (1,8 GB) es coherente con pesos cuantizados a 8 bits, aunque es una inferencia a partir del tamaño, no un dato confirmado.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`), incluyendo rol de sistema.
- Instrucciones generales: resúmenes, reescritura, preguntas y respuestas, redacción creativa (poesía, relatos cortos).
- Modo "uncensored": el modelo no incorpora las capas de rechazo típicas de los modelos alineados, por lo que responde a peticiones que otros modelos filtran.
- "Steerable": el comportamiento se puede modular mediante el mensaje de sistema.
- Inferencia en navegador con WebGPU o WASM, sin backend remoto.
- Ejecución en Node.js para scripts, CLI y aplicaciones de escritorio.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño de 1.5B limita el razonamiento encadenado.
- Vision, audio o modo "thinking": no soportado.

## Casos de uso

- Asistentes embebidos en navegador con privacidad por diseño: el modelo se descarga una vez y la inferencia ocurre en el dispositivo vía WebGPU, de modo que ninguna conversación del usuario sale del cliente. Adecuado para herramientas internas con datos sensibles.
- Extensiones de navegador para reescritura y resumen: una extensión puede resumir el artículo abierto o reformular el texto seleccionado con `max_new_tokens` de 256 a 512, sin coste de API ni latencia de red.
- Prototipado rápido de producto conversacional: al cargarse con una sola llamada a `pipeline('text-generation', ...)`, sirve para validar flujos de chat y plantillas de prompt antes de migrar a un modelo mayor en servidor.
- Aplicaciones de escritorio con Electron o Tauri: al funcionar en Node.js, el modelo puede distribuirse como parte del instalador y ofrecer generación de texto offline en equipos sin GPU dedicada (backend WASM).
- Generación de texto creativo sin restricciones de contenido: guiones, ficción y ejercicios de escritura donde los filtros de los modelos alineados resultan limitantes. Requiere revisión humana obligatoria por la ausencia de moderación.
- Extracción y transformación de texto en local: convertir notas, correos o registros en JSON estructurado o clasificar tickets dentro de una canalización de datos que no puede enviar contenido a terceros.
- Docencia y experimentación: permite explicar en vivo cómo funciona un transformer y el pipeline de generación (temperatura, muestreo, KV cache) sin depender de infraestructura de servidor.
- NPCs y contenido dinámico en videojuegos web: diálogos generados en el cliente con latencia de milisegundos y sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no enlaza a una evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de 1,54B parámetros, no cifras oficiales): ~3,1 GB en fp16 para los pesos, más 0,5-1 GB de KV cache y buffers según longitud de secuencia; ~1,6 GB en int8; ~0,9 GB en int4.
- GPU de servidor: A100, H100 o L40S sobran para este tamaño; el modelo no las aprovecha y no es el escenario previsto.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4080/4090 y en Apple Silicon (M1/M2/M3 con memoria unificada). También en GPUs integradas recientes vía WebGPU, con throughput mucho menor.
- Navegador: WebGPU requiere Chrome/Edge 113+ o Safari 18+; el backend WASM funciona en cualquier navegador moderno pero solo como CPU.
- Opciones de despliegue: Transformers.js (WebGPU y WASM), ONNX Runtime Web, ONNX Runtime Node y ONNX Runtime GenAI. vLLM, TGI y llama.cpp no consumen ONNX directamente; para esos motores habría que usar los pesos originales en safetensors o convertirlos a GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, en WebGPU cabe esperar decenas de tokens por segundo en GPUs dedicadas y pocos tokens por segundo en WASM; no se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato para navegador | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Dolphin3.0-Qwen2.5-1.5B-ONNX (este) | 1,54B | no disponible | ONNX / Transformers.js | Apache 2.0 | sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54B | no verificado en esta ficha | existen exports ONNX de la comunidad | Apache 2.0 | sin datos en esta ficha |
| Llama-3.2-1B-Instruct | 1,24B | no verificado en esta ficha | soporte parcial vía ONNX comunitario | Llama 3.2 Community License | sin datos en esta ficha |
| SmolLM2-1.7B-Instruct | 1,7B | no verificado en esta ficha | exports ONNX comunitarios | Apache 2.0 | sin datos en esta ficha |

La comparación relevante aquí es de formato y licencia, no de precisión: Apache 2.0 en este modelo (frente a la licencia restrictiva de la familia Llama) y disponibilidad inmediata en ONNX para el navegador son sus dos ventajas objetivas. Cualquier comparación de calidad requeriría ejecutar evaluaciones que no están publicadas.

## Limitaciones y advertencias

- Modelo "uncensored": no incorpora alineación de seguridad. Puede producir contenido violento, sexual, ilegal o dañino sin rechazo. No debe exponerse directamente a usuarios finales sin una capa de moderación propia.
- Riesgo elevado de alucinación: con 1,54B parámetros y sin modo de razonamiento, la precisión factual en dominios especializados será baja. No usar como fuente de verdad.
- Solo inglés declarado: el rendimiento en castellano no está garantizado ni evaluado; es probable que sea deficiente en gramática y terminología técnica.
- Longitud de contexto desconocida: la model card no la documenta. Los ejemplos de la familia Qwen2.5 apuntan a 32 768 tokens nativos, pero este dato no se confirma para el export y no debe asumirse en producción.
- Sin cuantizaciones documentadas: no se sabe qué precisión tienen los pesos del repositorio ni si existe una variante int4/int8 lista para usar; puede requerir reexportación.
- Inconsistencia en el identificador: el código de ejemplo de la model card carga `d1g1mortal/Dolphin3.0-Qwen2.5-1.5B-ONNX`, no `AstySeeks/Dolphin3.0-Qwen2.5-1.5B-ONNX`. Hay que corregir la ruta al integrarlo.
- Sin validación comunitaria: 0 descargas y 0 "likes", repositorio creado y actualizado el mismo día, sin issues ni discusión. No hay evidencia de que el export funcione correctamente en WebGPU.
- Licencia: el artefacto es Apache 2.0, pero conviene verificar los términos del modelo base dphn/Dolphin3.0-Qwen2.5-1.5B y de Qwen2.5 antes de un uso comercial, ya que las condiciones de la cadena de derivación pueden añadir requisitos.
- Inferencia en navegador: limitada por la memoria del dispositivo; en móviles y equipos con poca RAM el backend WASM puede fallar o ser inutilizable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AstySeeks/Dolphin3.0-Qwen2.5-1.5B-ONNX
- Modelo base: https://huggingface.co/dphn/Dolphin3.0-Qwen2.5-1.5B
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Los resultados de la búsqueda web no contienen enlaces técnicos relevantes al modelo: devuelven únicamente páginas de contenido para adultos sin relación con el repositorio, por lo que se descartan.
