# MirandaAbhilash/circuitformer-circuitvqa

## Resumen

CircuitFormer for CircuitVQA es un modelo de respuesta visual a preguntas (VQA) especializado en diagramas de circuitos. Lo publica el usuario de Hugging Face MirandaAbhilash y combina un encoder híbrido convolución-atención (MaxViT-Tiny, concreto `maxvit_tiny_tf_384.in1k`) con un transformer relacional que opera sobre un grafo de circuito, más tres cabezas expertas especializadas: pointer (selección de componentes), counter (conteo) y generator (respuesta en lenguaje natural). El problema que aborda es acotado pero relevante: responder preguntas sobre la topología y los componentes de un esquema eléctrico a partir de la imagen y de las cajas delimitadoras de cada componente.

El modelo se entrena sobre CircuitVQA, un conjunto propio del autor descrito en el fichero `master_bbox.json`. El resultado principal que se publica es un 95,7 % de exact-match en test para la variante `oracle_full`, en la que se usan las cajas ground-truth de los componentes en el momento de la evaluación. Existe además una variante `robust`, entrenada con errores de detector simulados, pensada para el escenario realista en el que las cajas provienen de un detector imperfecto.

Su interés ahora es doble. Por un lado, ejemplifica un patrón poco habitual en VQA: descomponer la tarea en expertos (pointer, counter, generator) sobre una representación en grafo en lugar de generar texto libre con un decoder genérico. Por otro, la ficha es extremadamente escasa: no se publican parámetros totales, licencia, idiomas ni datos de entrenamiento, y los pesos se distribuyen como checkpoints `.pt` de la parte entrenable, no como safetensors con código de carga estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder convolución-atención MaxViT-Tiny (`maxvit_tiny_tf_384.in1k`) + transformer relacional sobre grafo de circuito + cabezas expertas pointer / counter / generator |
| Parametros totales | No disponible. El encoder MaxViT-Tiny tiene ≈31 M de parámetros según la ficha pública de timm; el total del sistema (encoder + transformer relacional + expertos) no se publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La entrada es una imagen procesada por el encoder a 384×384 más las cajas delimitadoras de los componentes; no se documenta ventana de contexto textual |
| Tipos de cuantizacion | No disponible. Solo se distribuyen checkpoints PyTorch (`.pt`); no hay versiones GGUF, AWQ, GPTQ ni ONNX publicadas |
| Idiomas soportados | No disponibles (no se especifica el idioma de las preguntas del dataset CircuitVQA) |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | PyTorch `.pt` (`*_best.pt`, únicamente la parte entrenable), más `config.json`, `vocab.json`, `results.json` y CSV de predicciones |

## Arquitectura y entrenamiento

La arquitectura es un tándem. Primero, un encoder MaxViT-Tiny en su variante TensorFlow de timm, preentrenada en ImageNet-1k a resolución 384×384, que mezcla bloques convolucionales y de atención (con atención en ventana local y atención global en bloque) para extraer características visuales del diagrama. Después, un transformer relacional que modela el circuito como un grafo: los nodos corresponden a componentes (delimitados por las cajas) y las relaciones entre ellos codifican la conectividad. Sobre esa representación actúan tres cabezas especializadas: una cabeza pointer que selecciona componentes concretos, una cabeza counter para preguntas de conteo y una cabeza generator para producir la respuesta textual. Esta separación evita que un decoder genérico tenga que aprender a contar y a referirse a regiones de la imagen por su cuenta.

El entrenamiento se realiza sobre CircuitVQA, con anotaciones de cajas almacenadas en `master_bbox.json`. La model card distingue dos regímenes de evaluación según el nombre del run: `oracle`, que usa cajas ground-truth en test, y `robust`, entrenado con errores de detector simulados para tolerar cajas imperfectas. No se especifica el número de tokens o ejemplos de entrenamiento, la composición del dataset, el número de épocas, ni si hubo ajuste por RLHF o DPO; tampoco se detalla ninguna innovación de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Respuesta visual a preguntas sobre diagramas de circuitos: dada una imagen del esquema y una pregunta, devuelve una respuesta corta evaluable por exact-match.
- Localización y referencia de componentes mediante la cabeza pointer, apoyada en las cajas delimitadoras de entrada.
- Conteo de componentes o de elementos de un tipo determinado mediante la cabeza counter.
- Generación de respuestas en lenguaje natural mediante la cabeza generator para preguntas que no se resuelven con pointer o counter.
- Tolerancia a errores de detección en la variante `robust`, entrenada explícitamente con cajas perturbadas.
- Razonamiento sobre topología: el transformer relacional opera sobre el grafo de conexiones, no solo sobre píxeles.
- No se documenta soporte de tool calling, function calling, uso como agente, multi-step reasoning, capacidades multilingües, visión general, audio ni modo thinking.

## Casos de uso

- Asistencia a ingeniería electrónica: dado el esquema de una placa, responder preguntas del tipo «¿cuántas resistencias hay en la red de polarización?» usando la cabeza counter sobre el grafo de componentes.
- Verificación automatizada de documentación técnica: comprobar que la descripción textual de un circuito coincide con el número y tipo de componentes visibles en el diagrama, marcando discrepancias para revisión humana.
- Extracción asistida de listas de materiales (BOM) preliminares: la cabeza pointer puede señalar qué componentes cumplen un criterio y servir de paso previo a un pipeline de extracción de referencias y valores.
- Control de calidad en la captura de esquemas: la variante `robust` permite desplegar el modelo aguas abajo de un detector de componentes real, sin exigir cajas perfectas.
- Docencia y autoformación: generar preguntas y respuestas sobre un esquema para material de prácticas, con la ventaja de que las respuestas son verificables contra las cajas.
- Búsqueda semántica sobre un repositorio de esquemas: indexar diagramas y responder consultas concretas sobre su contenido sin necesidad de transcribir el circuito a netlist.
- Análisis de patentes o literatura técnica: cribar figuras de circuitos y responder preguntas acotadas sobre su estructura antes de una revisión manual más costosa.

## Benchmarks y rendimiento

| Run | Métrica | Resultado |
|---|---|---|
| `oracle_full` | Exact-match en test (CircuitVQA) | 95,7 % |
| `robust` | Exact-match en test (CircuitVQA) | No disponible en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, DocVQA, ChartQA, etc.) en la información disponible. El 95,7 % corresponde a un conjunto de evaluación propio (CircuitVQA) con cajas ground-truth, por lo que no es directamente comparable con cifras de otros modelos sobre benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia orientativa, el encoder MaxViT-Tiny (≈31 M de parámetros) a 384×384 en batch 1 ocupa del orden de 1-2 GB en fp32 y menos de 1 GB en fp16, siempre que el transformer relacional y las cabezas no superen unos pocos cientos de millones de parámetros; el total real no se puede confirmar con los datos de la ficha.
- GPU recomendadas: no hay recomendaciones del autor. Por el tamaño del encoder, una GPU consumer reciente (RTX 3060 12 GB, RTX 4070, RTX 4090) debería ser suficiente para inferencia en batch pequeño; A100/H100 solo tendrían sentido para evaluación a gran escala o para reentrenar.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del backbone, aunque el dato no está verificado por el autor.
- Opciones de despliegue: no hay integración con vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje causal con arquitectura estándar de Hugging Face Transformers, sino un checkpoint `.pt` personalizado. El despliegue requiere el código del autor (no incluido en el repo) o una reimplementación que cargue `*_best.pt` junto con los pesos preentrenados de `maxvit_tiny_tf_384.in1k` desde timm.
- Latencia y throughput: no disponibles. El repositorio pesa 79,3 GB, pero ese tamaño corresponde a múltiples checkpoints, predicciones CSV y artefactos de entrenamiento, no a un único modelo desplegable.
- Nota de seguridad: al ser pesos `.pt`, la carga con `torch.load` implica ejecución de pickle; conviene usar `weights_only=True` o un entorno aislado.

## Comparativa con modelos similares

No se ha identificado en la información disponible ningún modelo directamente comparable en VQA sobre diagramas de circuitos. Como aproximación por categoría (VQA documental con encoder visual y salida estructurada o textual):

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CircuitFormer for CircuitVQA | No disponible (encoder ≈31 M) | Imagen 384×384 + cajas de componentes | 95,7 % exact-match en CircuitVQA (`oracle_full`) | No disponible | Hugging Face, pesos `.pt`, 0 descargas |
| LayoutLMv3-base | ≈133 M | Documento con layout (texto + cajas) | No disponible para esta tarea | CC BY-NC-SA 4.0 | Hugging Face, safetensors |
| Pix2Struct-base | ≈282 M | Imagen de documento | No disponible para esta tarea | Apache 2.0 | Hugging Face, safetensors |
| Donut-base | ≈0,2 B | Imagen de documento | No disponible para esta tarea | MIT | Hugging Face, safetensors |

La comparación de rendimiento no es significativa: el 95,7 % se mide sobre un dataset privado del autor y con cajas ground-truth, mientras que las alternativas se evalúan en benchmarks públicos de documentos. Además, ninguna de ellas modela explícitamente el circuito como grafo.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial, modificación ni redistribución. Es un bloqueo potencial para producción.
- Idiomas no declarados: no se especifica en qué idioma están las preguntas de entrenamiento ni si el modelo generaliza a otros.
- Sesgo de evaluación: el 95,7 % se obtiene con cajas ground-truth (`oracle_full`). El rendimiento con un detector real (`robust`) no se publica, así que la cifra no representa un despliegue end-to-end.
- Dataset pequeño y de dominio muy estrecho: el modelo solo cubre diagramas de circuitos con el formato de anotación de CircuitVQA; no es un VQA generalista.
- Riesgo de alucinación: la cabeza generator puede producir respuestas plausibles pero incorrectas, especialmente en preguntas que requieren contar o seguir conexiones largas; conviene validar contra las cajas y el grafo.
- Dependencia de las cajas: sin cajas de componentes de calidad, el rendimiento se degrada; el modelo no se presenta como detector de componentes.
- Empaquetado incompleto: `*_best.pt` contiene solo la parte entrenable, por lo que hace falta descargar por separado el backbone `maxvit_tiny_tf_384.in1k`; no se incluye código de inferencia en la información disponible.
- Formato no estándar: no hay safetensors ni scripts de `AutoModel`, lo que complica la integración con ecosistemas como Transformers, vLLM o TGI.
- Repositorio de 79,3 GB: incluye múltiples checkpoints y CSV de predicciones; el coste de almacenamiento y de descarga es alto para el tamaño real del modelo.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de reproducibilidad.
- Homónimos: existen otros trabajos llamados «CircuitFormer» (el de NeurIPS 2023 sobre placement y el paper de diseño de topología analógica) que no deben confundirse con este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MirandaAbhilash/circuitformer-circuitvqa
- Dataset CircuitVQA: https://huggingface.co/datasets/MirandaAbhilash/circuitvqa-dataset
- Paper «CircuitFormer: A Circuit Language Model for Analog Topology Design from Natural Language» (trabajo homónimo, no es este modelo): https://arxiv.org/html/2605.05773v1
- Resumen del paper anterior en DeepPaper: https://arxiv.deeppaper.ai/papers/2605.05773v1
- Repositorio hustvl/CircuitFormer (NeurIPS 2023, trabajo homónimo sobre placement, no es este modelo): https://github.com/hustvl/circuitformer
