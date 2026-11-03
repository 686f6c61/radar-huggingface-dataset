# galinilin/deepvariant-wgs-1.8-tfjs-uint8

## Resumen

DeepVariant WGS v1.8 TFJS uint8 es una conversión del modelo de llamada de variantes DeepVariant de Google (versión 1.8, modelo whole-genome) al formato TensorFlow.js con cuantización uint8 de los pesos. El modelo original es una red convolucional InceptionV3 con una cabeza softmax de tres clases que clasifica imágenes de pileup genómico para determinar el genotipo de una posición candidata (hom_ref, het u hom_alt). Esta conversión reduce el checkpoint de aproximadamente 350 MB a 22 MB, lo que permite cargarlo y ejecutarlo en una pestaña de navegador.

El modelo no es un fine-tune ni una reimplementación: los pesos son los de Google, únicamente convertidos de Keras 2.15 a TensorFlow.js Converter v4.22.0 y cuantizados a uint8. Las activaciones permanecen en float32 y los pesos se desquantizan al cargar. Está pensado exclusivamente para docencia, visualización y exploración del funcionamiento interno de DeepVariant, no para llamada de variantes en producción ni para uso clínico.

Su relevancia actual es acotada pero interesante: demuestra que un clasificador genómico de tamaño medio puede ejecutarse íntegramente en el cliente (navegador o Node.js) sin backend, lo que abre la puerta a herramientas educativas interactivas y a la inspección visual del proceso de decisión del modelo sobre datos reales de secuenciación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InceptionV3 convolucional con cabeza softmax de 3 clases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de tensor [batch, 100, 221, 7]) |
| Tipos de cuantizacion | uint8 en pesos; activaciones en float32 |
| Idiomas soportados | no aplica (modelo genómico, no lingüístico) |
| Licencia | BSD 3-Clause |
| Formato de pesos | TensorFlow.js layers model (`model.json` + 6 shards) |

## Arquitectura y entrenamiento

La arquitectura es una InceptionV3 convolucional que procesa tensores de entrada de forma `[batch, 100, 221, 7]`: 100 filas (lecturas más filas de referencia), 221 columnas (posiciones genómicas centradas en el candidato) y 7 canales que codifican `read_base`, `base_quality`, `mapping_quality`, `strand`, `read_supports_variant`, `base_differs_from_ref` e `insert_size`. Cada canal se codifica como intensidad en `[0, 254]` y debe normalizarse con `(pixel - 128) / 128` antes de la inferencia, ya que la capa `Lambda` original de Keras no es serializable en TensorFlow.js y se extrajo del grafo.

El entrenamiento lo realizó Google para DeepVariant v1.8; esta ficha no incluye datos sobre el corpus de entrenamiento, número de tokens ni proceso de ajuste. La conversión consistió en restaurar el checkpoint v1.8 WGS en Keras, eliminar la capa de preprocesado `Lambda`, exportar a TensorFlow.js en float32 (88 MB) y aplicar cuantización uint8 de pesos (22 MB). Los pesos se desquantizan al cargar y las activaciones se mantienen en float32. La evaluación de paridad reportada muestra una diferencia absoluta máxima en la softmax de 1,72e-2 con uint8 frente a 2,38e-7 en float32, y el argmax coincide con el modelo original en todas las entradas de prueba.

## Capacidades

- Clasificación de genotipos a partir de imágenes de pileup genómico en tres clases: hom_ref, het y hom_alt.
- Inferencia en navegador (WebGL o CPU) y en Node.js mediante TensorFlow.js.
- Ejecución cliente-side sin backend, con un peso de 22 MB apto para carga en pestaña.
- Inspección visual del proceso de decisión del modelo sobre tensores de pileup construidos por el usuario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye `make_examples` ni `postprocess_variants`; solo el clasificador.

## Casos de uso

- Docencia interactiva de bioinformática: el modelo puede cargarse en una página web y ejecutarse sobre tensores de pileup de ejemplo para mostrar cómo una CNN clasifica genotipos, sin necesidad de instalar DeepVariant ni disponer de GPU.
- Visualización del proceso de decisión: al ejecutar el modelo en el navegador sobre tensores reales, se pueden inspeccionar las probabilidades de salida y comparar con la etiqueta conocida, como en el sandbox de demostración del autor.
- Prototipado de herramientas educativas: desarrolladores pueden integrar el modelo en cuadernos interactivos o aplicaciones web para explorar el efecto de modificar canales del pileup (por ejemplo, anular `read_supports_variant`) y observar cómo cambia la predicción.
- Pruebas de conversión y cuantización: sirve como referencia para validar pipelines de conversión Keras a TensorFlow.js con cuantización uint8 en modelos de visión no lingüísticos.
- Análisis de paridad numérica: útil para estudiar el impacto de la cuantización uint8 en la softmax de un clasificador convolucional en distintos runtimes (tfjs-node, CPU de navegador, WebGL).
- Demostraciones en entornos sin instalación: al ejecutarse en el cliente, permite desplegar una demo en Hugging Face Spaces o en una página estática sin servidor de inferencia.

## Benchmarks y rendimiento

Paridad frente al modelo original en Python (Keras), diferencia absoluta máxima en la softmax:

| Runtime | float32 | uint8 (este repo) |
|---|---|---|
| Node, tfjs-node | 2,38e-7 | 1,72e-2 |
| Navegador, CPU (Chromium) | 2,38e-7 | 1,72e-2 |
| Navegador, WebGL (SwiftShader) | 1,19e-7 | 1,72e-2 |

Comprobación sobre datos reales: en los 84 tensores de pileup de `golden.calling_examples` (sitios hom_alt curados), el modelo predice hom_alt en 84 de 84 casos. Al anular el canal `read_supports_variant`, la predicción pasa a 82 het y 2 hom_alt. No se han publicado resultados de benchmarks de precisión de llamada de variantes para esta conversión; los datos de precisión del modelo original están en la documentación de DeepVariant.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo pesa 22 MB en uint8 y las activaciones son float32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGL; en Node.js, cualquier GPU compatible con tfjs-node o ejecución en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en GPUs integradas.
- Opciones de despliegue: TensorFlow.js en navegador (WebGL o CPU) y en Node.js (tfjs-node); no está pensado para vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte que en WebGL la primera predicción compila los shaders de todas las capas y recomienda ejecutar una predicción sobre ceros al cargar para evitar la latencia inicial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepVariant v1.8 WGS original (Google) | no disponible | tensor [batch, 100, 221, 7] | checkpoint Keras/TF | BSD 3-Clause | GitHub de Google |
| Este repo (TFJS uint8) | no disponible | tensor [batch, 100, 221, 7] | TFJS layers, 22 MB | BSD 3-Clause | Hugging Face |
| DeepVariant v1.8 exome / PacBio / ONT | no disponible | tensores específicos por tipo de secuenciación | checkpoint Keras/TF | BSD 3-Clause | GitHub de Google |

La comparación relevante es con el modelo original de Google, del que este repo es una conversión de formato; no hay modelos de la misma categoría (llamada de variantes con CNN sobre pileup) publicados en formato TensorFlow.js para comparar directamente.

## Limitaciones y advertencias

- No apto para uso clínico, diagnóstico ni ninguna decisión sobre la salud de una persona.
- No apto para llamada de variantes en producción: solo incluye el clasificador; faltan `make_examples` y `postprocess_variants`.
- La cuantización uint8 desplaza las probabilidades de clase hasta un 2 % aproximadamente, aunque el argmax coincide con el original en las pruebas reportadas.
- Entrenado únicamente para el tipo de secuenciación del modelo WGS; no válido para exomas, PacBio ni ONT, que tienen modelos separados en DeepVariant.
- Requiere que el usuario construya el tensor de pileup y aplique la normalización `(pixel - 128) / 128` manualmente.
- Sin datos publicados sobre sesgos, alucinación o comportamiento fuera de distribución en esta conversión.
- Licencia BSD 3-Clause permite uso comercial con atribución, pero el uso clínico queda fuera del alcance declarado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/galinilin/deepvariant-wgs-1.8-tfjs-uint8
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/galinilin/deepvariant-browser
- Repositorio del código de la app: https://github.com/galinilin/deepvariant-tfjs
- Artículo del autor: https://galinilin.com/writing/looking-through-deepvariants-eyes/
- DeepVariant upstream: https://github.com/google/deepvariant
- Release v1.8.0: https://github.com/google/deepvariant/releases/tag/v1.8.0
- Paper: Poplin et al., Nature Biotechnology 36, 983–987 (2018), https://doi.org/10.1038/nbt.4235
- Documentación de entrenamiento: https://github.com/google/deepvariant/blob/r1.8/docs/deepvariant-training-case-study.md
- Métricas del modelo original: https://github.com/google/deepvariant/blob/r1.8/docs/metrics.md
