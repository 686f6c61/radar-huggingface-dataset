# litert-community/Kev-0.8B-LiteRT

## Resumen

Kev-0.8B-LiteRT es la conversión a formato LiteRT (TFLite) del modelo de decisión Kev-0.8B, desarrollado originalmente por Jared Palmer y empaquetado por la comunidad litert-community. No se trata de un modelo generativo: lee un texto denominado "estado" y responde preguntas tipadas sobre él (sí/no, elección múltiple y puntuación) devolviendo probabilidades para cada opción. Nunca produce texto libre.

Arquitectónicamente, el modelo reutiliza el backbone de Qwen3.5-0.8B-Base al que se le ha adaptado una LoRA de rango 16 y sobre el que se ha añadido una "pointer head" de dos capas lineales que lee los estados ocultos y los convierte en distribuciones de probabilidad. La LoRA está fusionada en los pesos del backbone. Esta versión LiteRT descompone el modelo en ocho ficheros: seis grafos por filas (hasta 64, 128, 256, 512, 1.024 y 2.048 tokens) y dos pares de estado compartido (estado de hasta 128 o 256 tokens y preguntas de hasta 64 tokens cada una).

Su relevancia actual radica en que permite ejecutar clasificación y decisión estructurada completamente en dispositivo, con validación en CPU y GPU de Apple M4 Max, GPU y NPU de Galaxy S26, y soporte para Android, lo que lo hace adecuado para pipelines de enrutamiento, moderación o extracción de decisiones sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B-Base) con pointer head de dos capas lineales y LoRA rango 16 fusionada |
| Parametros totales | 0,8B (backbone) + pointer head (no disponible el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 tokens por fila; modo par: estado hasta 256 tokens + preguntas hasta 64 tokens cada una |
| Tipos de cuantizacion | Pesos LiteRT en float32 y float16 (`FP16_WITH_FP32_ACCUM` en GPU Android); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT/TFLite (8 ficheros); pointer head en safetensors; también disponible en Core ML, ONNX, GGUF, RKNN y MLX (repos de terceros) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base como backbone y aplica una adaptación LoRA de rango 16, posteriormente fusionada en los pesos. Sobre los estados ocultos del backbone se sitúa una pointer head compuesta por dos capas lineales que proyecta la representación hacia las opciones de cada pregunta, produciendo probabilidades normalizadas. El modelo no genera tokens de texto: el host construye las filas de entrada, ejecuta los grafos LiteRT y aplica la cabeza para obtener las respuestas.

La conversión a LiteRT se organiza en ocho grafos: seis "row graphs" para filas de hasta 64, 128, 256, 512, 1.024 y 2.048 tokens, y dos "shared-state pairs" que ejecutan el estado una vez (hasta 128 o 256 tokens) y luego cada pregunta desde ese estado (hasta 64 tokens por pregunta). La versión del 2026-10-05 sustituyó el kernel de Gated DeltaNet por uno por chunks que reduce el grafo de 512 tokens de 20.873 a 8.327 operadores en fp32, con desviaciones máximas de 2,3e-5 en estados ocultos y 4,7e-6 en probabilidades respecto a la referencia PyTorch fp32, sin cambios en la opción más probable. No se documentan en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO para el modelo base.

## Capacidades

- Clasificación de texto estructurada mediante preguntas tipadas: `noul` (sí/no), `choice` (elección múltiple con criterios etiquetados) y `score` (puntuación ordinal con leyenda).
- Devolución de probabilidades calibradas por opción, no solo la etiqueta ganadora.
- Modo de estado compartido: procesa un texto largo una vez y responde múltiples preguntas sobre él de forma eficiente.
- Ejecución en dispositivo (on-device) en Android, con soporte de CPU, GPU y NPU.
- Soporte de modos de ejecución `auto`, `row` y `pair` en el host de referencia.
- Interfaz de petición/respuesta compatible con la forma `/v1/systemone` del servidor del autor.
- Capacidades multilingües: limitadas a inglés según la model card.
- No soporta generación de texto, tool calling ni razonamiento multi-paso generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y responde preguntas de elección múltiple sobre el equipo responsable (facturación, envíos, devoluciones, técnico), como se muestra en el ejemplo de la model card con probabilidades por equipo.
- Detección de plazos y compromisos: mediante preguntas `noul` se puede determinar si el cliente exige una acción antes de una fecha concreta, útil para priorización automática en sistemas de atención al cliente.
- Análisis de sentimiento ordinal: con preguntas `score` (por ejemplo, "Calm", "Annoyed", "Angry") se obtiene una medida graduada del enfado del cliente, adecuada para escalado y alertas.
- Moderación y clasificación de contenido: al ser un clasificador puro sin generación, permite etiquetar textos según políticas definidas con criterios explícitos, con menor riesgo de alucinación que un LLM generativo.
- Extracción de decisiones en formularios y encuestas: convertir respuestas abiertas en categorías cerradas con probabilidades, ejecutándose localmente en el dispositivo sin enviar datos a la nube.
- Procesamiento en dispositivo en Android: integrable mediante el host Python o el snippet Kotlin proporcionado, con ejecución en GPU (`FP16_WITH_FP32_ACCUM`) y NPU del Galaxy S26 para los grafos de 64, 128 y 256 tokens.
- Clasificación por lotes con estado compartido: en escenarios donde muchas preguntas se refieren al mismo documento, el modo `pair` evita reprocesar el estado en cada consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de fidelidad frente a la referencia PyTorch fp32:

| Entorno | Precisión | Desviación máxima en probabilidades | Filas con NaN |
|---|---|---|---|
| Apple M4 Max CPU | float32 | 0,0104 | no disponible |
| Apple M4 Max GPU (Metal) | float32 | 0,0104 | no disponible |
| Galaxy S26 GPU | FP16_WITH_FP32_ACCUM | 0,0110 | 0 |
| Galaxy S26 NPU (HTP) | no disponible | 0,0134 | 0 |

En todas las ejecuciones, salvo empates cercanos (diferencia ≤ 0,02 entre las dos opciones más probables en la referencia), todos los ficheros devolvieron la opción más probable de la referencia. Con la precisión por defecto de GPU (activaciones float16), los ficheros del 2026-10-04 produjeron NaN en 18 de 393 filas de test.

## Requisitos de hardware

- Tamaño del repositorio: 14,0 GB, lo que incluye los ocho grafos LiteRT, la pointer head, tokenizador, host Python, snippet Kotlin, fixtures y scripts de conversión.
- VRAM/RAM estimada: no disponible de forma explícita; el tamaño del repo y los grafos de hasta 2.048 tokens sugieren requisitos de memoria considerables para el grafo mayor, aunque no se detallan cifras por fichero.
- GPU recomendadas: no se documentan GPU de servidor (A100, H100); la validación se realizó en Apple M4 Max (CPU y GPU Metal) y en GPU/NPU de Galaxy S26.
- Cabe en hardware de consumo: sí, con validación en Apple M4 Max y en un smartphone Android de gama alta (Galaxy S26); los grafos de 64, 128 y 256 tokens se ejecutan en la NPU Qualcomm HTP del S26.
- Opciones de despliegue: LiteRT 2.2.0 con ai-edge-litert 2.2.0 (Python), APIs Kotlin y C para Android; también existen conversiones a Core ML, ONNX, GGUF, RKNN y MLX en repos de terceros no verificados por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; el ejemplo de respuesta incluye un campo `latency_ms` que se omite en la salida esperada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Kev-0.8B-LiteRT | 0,8B | 2.048 tokens (fila) / 256+64 (par) | Clasificación y decisión estructurada | Apache 2.0 | LiteRT/TFLite |
| jaredpalmer/kev-0.8b | 0,8B | no disponible | Clasificación y decisión estructurada | no disponible | PyTorch (referencia) |
| FluidInference/kev-0.8b-coreml | 0,8B | no disponible | Clasificación y decisión estructurada | no disponible | Core ML |
| midudev/kev-0.8b-ONNX | 0,8B | no disponible | Clasificación y decisión estructurada | no disponible | ONNX |

Las alternativas comparables son conversiones del mismo modelo base a otros formatos, no modelos distintos. No se dispone de información sobre modelos de clasificación de tamaño similar con los que comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Solo soporta inglés; no se garantiza comportamiento en otros idiomas.
- No es un modelo generativo: no puede producir texto libre, resúmenes ni respuestas abiertas, únicamente probabilidades sobre opciones predefinidas.
- Riesgo de empates cercanos: cuando las dos opciones más probables están a 0,02 o menos en la referencia, la opción devuelta puede variar entre ejecuciones o formatos.
- En GPU con precisión float16 por defecto, versiones anteriores generaron NaN en 18 de 393 filas; es necesario usar float32 en escritorio o `FP16_WITH_FP32_ACCUM` en Android.
- El soporte de NPU se limita a los grafos de 64, 128 y 256 tokens en el Galaxy S26 (Qualcomm HTP).
- Las conversiones a Core ML, ONNX, GGUF, RKNN y MLX son de terceros y el autor declara no haber verificado su contenido.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse el NOTICE y la licencia del modelo base Qwen3.5-0.8B-Base y del modelo original de Jared Palmer.
- El repositorio ocupa 14,0 GB, lo que puede ser un inconveniente para despliegues con almacenamiento limitado.
- No se han publicado benchmarks estándar que permitan evaluar su calidad frente a clasificadores alternativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Kev-0.8B-LiteRT
- Modelo base original: https://huggingface.co/jaredpalmer/kev-0.8b
- Backbone: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio del servidor del autor: https://github.com/jaredpalmer/kev
- Conversión Core ML: https://huggingface.co/FluidInference/kev-0.8b-coreml
- Conversión ONNX: https://huggingface.co/midudev/kev-0.8b-ONNX
- Conversión GGUF: https://huggingface.co/ggml-org/Kev-0.8B-GGUF
- Conversión RKNN: https://huggingface.co/ShiWarai/kev-0.8b-rknn
