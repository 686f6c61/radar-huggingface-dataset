# nvkudva/vega-onnx-q8

## Resumen
Vega ONNX Q8 es una conversión a 8 bits del modelo Vega 0.8B, empaquetada en formato ONNX para su ejecución en el navegador mediante onnxruntime-web y WebAssembly. No es un modelo generativo: se trata de un clasificador de decisiones tipadas que, a partir de un estado textual y una pregunta estructurada, devuelve una respuesta booleana, una elección entre opciones o una puntuación sobre niveles ordenados. Lo desarrolla nvkudva (Vijaya krishna kudva) a partir de nandakishorm/vega-08b-public-intents, un modelo base creado por Nandakishor M y Convai Innovations.

El sistema combina un backbone transformer congelado Qwen3.5-0.8B con un motor físico de 14 millones de parámetros que sitúa una partícula en un espacio de decisión de 64 dimensiones, coloca pozos de potencial gaussianos bajo cada opción e integra 12 pasos amortiguados. La ocupación de Boltzmann de los pozos determina la respuesta, acompañada de un conjunto de predicción conformal, una bandera de abstención y una bandera de fuera de distribución. El tamaño total es de aproximadamente 0,814B de parámetros (0,8B del backbone más 14M del motor).

Su relevancia radica en que permite realizar inferencia calibrada y privada directamente en el navegador, sin enviar datos a servidores externos. Está cuantizado a int8 con bloques de 32, y se ha validado con estados de hasta 6k tokens, incluyendo scripts no latinos y entradas degeneradas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Qwen3.5-0.8B congelado (transformer con capas Gated DeltaNet) + motor físico de 14M parámetros |
| Parametros totales | ~0,814B (0,8B backbone + 14M motor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probado con estados de hasta 6k tokens) |
| Tipos de cuantizacion | int8 (backbone, MatMulNBits + GatherBlockQuantized, block 32); fp32 (engine); 4-bit rechazado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (backbone_q8.onnx + .data, engine.onnx) |

## Arquitectura y entrenamiento
El backbone es un Qwen3.5-0.8B congelado que se corta tras la capa 19; el modelo original nunca ejecuta la cabeza LM ni las capas 20-23. La exportación a 8 bits, realizada por onnx-community, emplea MatMulNBits y GatherBlockQuantized con bloque 32, y mapea las capas Gated DeltaNet a operadores contrib de onnxruntime. La percepción de Vega engancha las salidas de las capas 13 y 19 (h13 y h19), que se reconstruyen como sumas explícitas de los residuos post-atención y la salida MLP.

El motor físico, de 14M parámetros y precisión fp32, ha sido reescrito sin ramas dependientes de datos: el lector de memoria, el raíl de puntuación y la parada temprana se sustituyen por equivalentes incondicionales exactos (máxima diferencia absoluta 0.0 frente al original en 30 preguntas). Los 12 pasos están desenrollados. Incluye adaptadores con compuerta para `public_intents` y `typed_decisions`. La calibración (temperatura θ, conformal split, abstención, unbound) se ejecuta en TypeScript. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades
- Clasificación de texto con tres tipos de decisión: `boolean` (probabilidad de sí), `choice` (una opción nombrada más la distribución completa) y `score` (expectativa sobre niveles ordenados).
- Generación de conjuntos de predicción conformal split, bandera de abstención y bandera de fuera de distribución ("unbound").
- Procesamiento de estados largos, con pruebas documentadas de hasta 6k tokens, incluyendo chunking y estados en formato diccionario.
- Soporte de múltiples opciones por pregunta, con pruebas entre 2 y 14 opciones.
- Ejecución íntegra en el navegador mediante onnxruntime-web y WebAssembly, sin dependencias de servidor.
- Manejo de scripts no latinos y entradas degeneradas (aunque con limitaciones, ver sección de limitaciones).
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso generativo.
- Capacidades multilingües no documentadas explícitamente.

## Casos de uso
- Moderación de contenido en el cliente: clasificar si un mensaje es phishing o spam mediante el tipo `boolean`, ejecutando el modelo en el navegador del usuario y sin enviar el texto a ningún servidor.
- Enrutamiento de tickets de soporte: usar el tipo `choice` para asignar automáticamente una cola o intención a una consulta entrante, con la distribución completa de probabilidades para auditar decisiones ambiguas.
- Priorización de incidencias: emplear el tipo `score` para estimar severidad o urgencia sobre niveles ordenados, aprovechando la calibración conformal para fijar umbrales de escalado.
- Clasificación de intenciones en asistentes virtuales: integrar el modelo en una aplicación web para detectar la intención del usuario en tiempo real, con bandera de abstención cuando la confianza es baja.
- Análisis de sentimiento granular: obtener una puntuación continua sobre niveles de satisfacción en reseñas o encuestas, con conjuntos de predicción que cuantifican la incertidumbre.
- Filtrado de documentos confidenciales sin salida de datos: procesar localmente contratos, correos o informes médicos para decidir si requieren revisión humana, gracias a la ejecución en WebAssembly.
- Detección de anomalías en formularios: marcar campos o respuestas sospechosas mediante el tipo `boolean` y la bandera de fuera de distribución, sin coste de servidor.
- Clasificación de contenido en entornos con conectividad limitada: al ejecutarse en el navegador, funciona sin conexión una vez cargados los pesos.

## Benchmarks y rendimiento
Los únicos datos de rendimiento publicados comparan la versión ONNX con el modelo PyTorch original (fp32, CPU) en 30 preguntas que cubren los tres tipos de decisión, con 2 a 14 opciones, estados fragmentados de hasta 6k tokens, estados en diccionario, script no latino y entradas degeneradas.

| Backbone | Tamaño | Argmax | Máx \|Δp\| | KL media |
|---|---|---|---|---|
| fp32 cortado (prueba del corte) | 2745 MB | 30/30 | 0,0035 | 3,6e-06 |
| **8-bit (el enviado)** | **842 MB** | **30/30** | **0,0503** | **4,0e-04** |
| 4-bit (rechazado) | 497 MB | 27/30 | 0,4161 | 7,3e-02 |

En el navegador, el port en TypeScript reproduce exactamente los números de 8 bits: identificadores de token y spans idénticos en 30/30, conjuntos de predicción 30/30 y abstención 29/30. El único cambio se produce con un estado vacío, donde la confianza de referencia (0,645) queda cerca del umbral de abstención. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio completo ocupa 905 MB; en ejecución, el backbone de 842 MB más el motor de 63 MB requieren aproximadamente 1-2 GB de memoria, dependiendo del runtime y del estado de entrada.
- GPU recomendadas: cualquier GPU moderna con más de 2 GB de VRAM es suficiente; también puede ejecutarse en CPU mediante WebAssembly. No se especifican modelos concretos como A100 o H100, ya que el modelo está pensado para entornos ligeros.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en gráficos integrados si se usa la ruta de CPU.
- Opciones de despliegue: onnxruntime-web (WebAssembly) para navegador; onnxruntime (CPU o CUDA) para servidor o escritorio. No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo ni usa formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de modelos directamente comparables en la información proporcionada. La alternativa más cercana es el propio modelo base sin cuantizar y las distintas precisiones evaluadas por el autor:

| Versión | Parámetros | Tamaño | Argmax | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fp32 cortado | ~0,814B | 2745 MB | 30/30 | Apache 2.0 | No publicado como artefacto independiente |
| 8-bit (este modelo) | ~0,814B | 842 MB | 30/30 | Apache 2.0 | HuggingFace (nvkudva/vega-onnx-q8) |
| 4-bit (rechazado) | ~0,814B | 497 MB | 27/30 | Apache 2.0 | No publicado (rechazado por pérdida de precisión) |

El modelo base nandakishorm/vega-08b-public-intents está disponible en HuggingFace, pero no se han publicado sus métricas completas ni una comparativa con otros clasificadores.

## Limitaciones y advertencias
- No es un modelo generativo: no puede producir texto libre, mantener conversaciones ni realizar razonamiento multi-paso. Su uso se limita a clasificación y decisión tipadas.
- La cuantización a 4 bits no es utilizable: los pozos del motor y las temperaturas ajustadas dependen de estados ocultos en precisión completa, y la deriva de 4 bits mueve las partículas entre cuencas, degradando el argmax a 27/30.
- Los idiomas soportados no están documentados; aunque se han probado scripts no latinos, no se especifica una cobertura multilingüe formal.
- Riesgo de clasificación errónea en estados vacíos o degenerados: se ha observado un cambio en la bandera de abstención con un estado vacío, donde la confianza de referencia (0,645) está cerca del umbral.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y del backbone, por lo que deben revisarse las condiciones de nandakishorm/vega-08b-public-intents y Qwen/Qwen3.5-0.8B.
- El formato del prompt debe reproducirse exactamente; cualquier variación puede alterar los resultados, ya que el modelo no es robusto a cambios de plantilla.
- Los sesgos del backbone Qwen3.5-0.8B y de los datos de entrenamiento del modelo base no se detallan, por lo que pueden propagarse a las decisiones.
- No se han publicado evaluaciones en benchmarks estándar de clasificación (como GLUE) ni comparativas con otros clasificadores, lo que dificulta contextualizar su rendimiento.
- La ventana de contexto máxima no está especificada; las pruebas se limitan a estados de hasta 6k tokens.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/nvkudva/vega-onnx-q8
- Modelo base: https://huggingface.co/nandakishorm/vega-08b-public-intents
- Backbone original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Exportación a 8 bits del backbone: https://huggingface.co/onnx-community/Qwen3.5-0.8B-Text-ONNX
- Repositorio de conversión y port a TypeScript: https://github.com/nvkudva/vega-web
- Demo en vivo: https://vega-onnx.pages.dev
- Perfil de Nandakishor M (autor del modelo base): https://github.com/NandhaKishorM
- Perfil del autor de la conversión: https://huggingface.co/nvkudva
- ONNX: https://onnx.ai/
- ONNX Runtime: https://onnxruntime.ai/
- ONNX Model Zoo: https://github.com/onnx/models
- Modelo relacionado del mismo autor: https://huggingface.co/nvkudva/laya-web-q8
