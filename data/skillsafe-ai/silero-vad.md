# skillsafe-ai/silero-vad

## Resumen

`skillsafe-ai/silero-vad` es un artefacto ONNX listo para navegador del detector de actividad de voz (VAD) Silero VAD v5. No es un modelo entrenado por SkillSafe: se trata de una importación reproducible del ONNX publicado por el equipo de Silero en el repositorio `snakers4/silero-vad`, fijado al commit `60b7ffa243625ebdc1070275a29f18c87843786a` y verificado byte a byte mediante SHA-256. El objetivo del paquete es servir pesos directamente consumibles desde `onnxruntime-web` con ejecución en WebGPU o WASM, sin necesidad de backend.

El modelo resuelve un problema acotado y muy demandado en pipelines de audio: decidir en tiempo real si una trama contiene voz humana o silencio/ruido. Su tamaño es mínimo (2,22 MB en fp32 y 1,22 MB en fp16), lo que permite ejecutarlo íntegramente en el cliente, en CPU o en cualquier GPU de consumo. El contrato ONNX declara una entrada de 576 muestras por trama y un estado recurrente de 2×128 que se propaga entre inferencias, de modo que el detector mantiene memoria del contexto acústico previo.

Es relevante ahora porque buena parte del coste de los asistentes de voz y de los pipelines ASR se dedica a procesar silencio. Un VAD neuronal que corre en el navegador a latencias de fracción de milisegundo permite filtrar audio en origen, activar la captura solo cuando hay habla y habilitar interrupciones (barge-in) sin enviar audio a un servidor. El repositorio, creado el 2026-09-22, no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para detección de actividad de voz con estado recurrente (tensor `state` de 2×128). Arquitectura interna (capas, tipo de celda) no disponible en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; procesa tramas de audio de 576 muestras por inferencia y mantiene estado persistente entre tramas |
| Tipos de cuantizacion | no disponible; se distribuyen dos variantes: fp32 (`silero_vad.onnx`, 2,22 MB) y fp16/half (`silero_vad_half.onnx`, 1,22 MB) |
| Idiomas soportados | no disponible (la detección de voz es intrínsecamente independiente del idioma, pero no se documenta ni se verifica en la información disponible) |
| Licencia | MIT (Silero VAD, Copyright (c) 2020-present Silero Team) |
| Formato de pesos | ONNX, opset 16 (dos ficheros) |
| Autor del repositorio | skillsafe-ai |
| Pipeline declarado | voice-activity-detection |
| Entradas (contrato ONNX) | `input` float32 `['?', '?']`, `state` float32 `[2, '?', 128]`, `sr` int64 `[]` (solo en `silero_vad.onnx`) |
| Salidas (contrato ONNX) | `output` float32 `['?', 1]`, `stateN` float32 `['?', '?', '?']` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22T18:59:32Z |

## Arquitectura y entrenamiento

El paquete contiene dos ficheros ONNX convertidos desde el artefacto oficial `src/silero_vad/data/silero_vad.onnx` del repositorio upstream. No ha habido conversión de pesos: el proceso documentado es una importación tal cual, con cada fichero fijado por SHA-256 (`1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3` para fp32 y `1e0b195ad4806595ef4466f419d16fca7e4afcfc6669b8c0b5f76ea87547c769` para half). La receta declarada es `recipes/silero-vad.yaml`, con hash `add4c06a8242f6db1760bf32ab2de236c33aedb774322927e2f57108ca41e652`.

El contrato del grafo (opset 16) es explícito sobre dos aspectos funcionales: la inferencia es por tramas de 576 muestras y el modelo es con estado, ya que expone `state` como entrada y `stateN` como salida con forma `[2, '?', 128]`. Esto implica que el consumo correcto exige realimentar `stateN` en la siguiente llamada; reiniciar el estado en cada trama degrada el comportamiento del detector. La variante `silero_vad.onnx` recibe además el tipo de muestreo (`sr`) como tensor int64 escalar, mientras que `silero_vad_half.onnx` no lo expone. No se documentan en esta información ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si hubo ajuste por RLHF/DPO: es un modelo de clasificación de audio, no un modelo generativo.

Los detalles de arquitectura interna (número de capas, tipo de capa recurrente, canales) no están disponibles en la información proporcionada. Sí está documentado el proceso de verificación aplicado a cada fichero: validación con `onnx.checker` y una prueba de humo en CPU con `onnxruntime` usando entradas rellenas de ceros con las formas declaradas.

## Capacidades

- Detección de actividad de voz por trama: clasifica cada bloque de 576 muestras y devuelve una probabilidad en `output` con forma `[N, 1]`.
- Procesamiento con estado: mantiene memoria del audio previo a través del tensor `state`/`stateN` de 2×128, lo que permite detección continua en streaming sin depender de ventanas aisladas.
- Ejecución en navegador: el paquete está diseñado para `onnxruntime-web` con `executionProviders` WebGPU y WASM, según el ejemplo de uso incluido en la model card.
- Ejecución en CPU sin acelerador: la prueba de verificación se ejecuta en CPU con resultados de 0,3 ms (fp32) y 0,2 ms (half) para una inferencia sobre entradas de las formas declaradas.
- Variante de precisión reducida: `silero_vad_half.onnx` reduce el tamaño a 1,22 MB para despliegues con restricciones de ancho de banda o memoria.
- Independencia del contenido lingüístico: al ser un detector acústico, no requiere tokenizador ni vocabulario.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio-a-texto ni traducción: es exclusivamente un clasificador binario de voz/no voz.

## Casos de uso

- Filtrado previo de silencio en asistentes de voz: el detector se ejecuta en el cliente y solo envía al servidor las tramas con voz, lo que reduce el consumo de ancho de banda y el coste de inferencia del ASR posterior. Es adecuado por su tamaño de 2,22 MB y su latencia sub-milisegundo en CPU.
- Activación por voz en el navegador (push-to-talk o wake detection ligera): al ejecutarse vía `onnxruntime-web` con WebGPU o WASM, no requiere plugins ni backend, lo que simplifica el despliegue en aplicaciones web.
- Interrupción de la síntesis de voz (barge-in): el estado recurrente permite detectar el inicio de habla del usuario mientras el sistema reproduce audio, habilitando la parada inmediata de la reproducción sin esperar a la transcripción completa.
- Segmentación de audio para diarización o subtitulado: el detector genera fronteras de voz que se pueden usar para dividir una grabación larga en fragmentos antes de pasarlos a un modelo de reconocimiento de habla, reduciendo el número de llamadas al modelo grande.
- Telemetría de calidad de llamadas: calcular la proporción de tiempo con habla frente a silencio o ruido en una reunión o llamada, para métricas de participación y de calidad de la señal.
- Moderación y análisis de audio en el cliente: detección de presencia de voz en grabaciones subidas por usuarios antes de aplicar políticas de contenido, sin enviar el audio a un servicio externo.
- Ahorro energético en dispositivos de borde: el modelo es lo bastante pequeño para correr de forma continua en un navegador o en un dispositivo embebido con `onnxruntime`, activando el resto del pipeline solo cuando hay habla.
- Preprocesado en pipelines de transcripción por lotes: descartar tramas sin voz antes de la inferencia de un modelo ASR para reducir el tiempo total de proceso en grandes volúmenes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, ROC-AUC ni comparaciones con otros detectores.

El único dato cuantitativo publicado son las mediciones de la prueba de humo de verificación, ejecutada en CPU con entradas rellenas de ceros y las formas declaradas:

| Fichero | Entradas | Salidas | Latencia medida (ms) |
|---|---|---|---|
| `silero_vad.onnx` | `input[1, 576]`, `state[2, 1, 128]`, `sr[]` | `output[1, 1]`, `stateN[2, 1, 128]` | 0,3 |
| `silero_vad_half.onnx` | `input[1, 576]`, `state[2, 1, 128]` | `output[1, 1]`, `stateN[2, 1, 128]` | 0,2 |

Estos valores corresponden a una única inferencia de humo, no a un benchmark de throughput sostenido ni a una medición de calidad de detección, y no deben extrapolarse como cifras de rendimiento en producción.

## Requisitos de hardware

- VRAM estimada: despreciable. Los pesos ocupan 2,22 MB en fp32 y 1,22 MB en fp16; la huella completa en memoria, incluyendo estados y buffers de `onnxruntime`, queda muy por debajo de los 100 MB.
- Cabe en cualquier GPU de consumo: no hay requisito práctico de VRAM, desde una GTX 1050 o una iGPU hasta una RTX 4090, A100 o H100. La GPU no aporta ventaja significativa frente a la CPU para este tamaño de modelo.
- Ejecución en CPU: viable y verificada. La prueba de humo reporta 0,3 ms (fp32) y 0,2 ms (half) por inferencia en CPU.
- Ejecución en navegador: soportada mediante `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`, según el ejemplo de la model card.
- Opciones de despliegue: `onnxruntime-web` (navegador, WebGPU/WASM), `onnxruntime` (CPU/GPU en Python, C++, C#), y cualquier runtime compatible con ONNX opset 16. No se documenta soporte específico para vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos generativos y no aplican a este artefacto.
- Latencia y throughput: solo se dispone de las latencias puntuales de la tabla anterior. No hay datos de throughput sostenido, consumo por trama en streaming ni rendimiento comparado entre WebGPU y WASM.

## Comparativa con modelos similares

Los datos cuantitativos de las alternativas no están disponibles en la información proporcionada; la comparación es por tanto cualitativa y de formato.

| Modelo | Tipo | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|
| `skillsafe-ai/silero-vad` (esta ficha) | VAD neuronal con estado | ONNX opset 16, fp32 y fp16 | MIT | HuggingFace, consumible con `onnxruntime-web` y `onnxruntime` |
| Silero VAD upstream (`snakers4/silero-vad`) | Mismo modelo, publicación original | ONNX; el repositorio upstream distribuye además otros formatos | MIT | GitHub upstream |
| WebRTC VAD | Detector no neuronal basado en modelos gaussianos | Librería nativa | no disponible en la información proporcionada | Integrado en navegadores y pilas WebRTC |
| Modelos de segmentación/diarización tipo `pyannote/segmentation` | Red neuronal de segmentación de hablantes | PyTorch | no disponible en la información proporcionada | HuggingFace |

Diferencias relevantes: este repositorio no aporta pesos nuevos, sino una importación fijada por hash y verificada, con licencia MIT explícita y contrato ONNX documentado. Frente a WebRTC VAD, la diferencia principal es el enfoque (neuronal con estado frente a estadístico), aunque no se dispone de métricas comparativas en esta información. Frente a los modelos de segmentación, la diferencia es de tarea: Silero VAD solo decide voz/no voz y no separa hablantes.

## Limitaciones y advertencias

- No es un modelo original: los pesos pertenecen a Silero Team y este repositorio es una redistribución. Cualquier problema de calidad de detección es atribuible al modelo upstream, no a la conversión, que no altera los bytes.
- Repositorio sin tracción verificada: 0 descargas y 0 likes en la fecha de la ficha, creado y actualizado el mismo día. No hay evidencia de uso en producción ni de validación por terceros.
- Ausencia total de métricas de calidad: no se publican precisión, recall, tasa de falsos positivos ni curvas ROC. No es posible estimar el comportamiento en condiciones ruidosas, con música de fondo, con voz lejana o con señal de baja relación señal/ruido a partir de esta información.
- Manejo obligatorio del estado: el modelo es con estado y hay que realimentar `stateN` en la llamada siguiente. Reiniciar el estado por trama o procesar tramas fuera de orden degrada la detección de forma no cuantificada.
- Contratos de entrada distintos entre variantes: `silero_vad.onnx` requiere el tensor `sr` (int64) y `silero_vad_half.onnx` no lo expone. Usar el contrato equivocado provoca fallo de carga de la sesión.
- Idioma y dominio: no se documentan los idiomas ni los dominios evaluados. No hay garantía de comportamiento equivalente en todas las lenguas, acentos o canales (telefonía de banda estrecha, VoIP con códec comprimido, micrófonos de baja calidad).
- Alcance funcional muy limitado: no transcribe, no identifica hablantes, no clasifica emociones ni detecta eventos de audio distintos de la voz.
- Licencia MIT: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright de Silero Team y la referencia al fichero LICENSE del commit fijado. La receta de conversión y la model card quedan bajo la licencia del repositorio de SkillSafe, distinta de la de los pesos.
- Cadena de herramientas no verificable de forma independiente: la model card declara Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. La reproducibilidad exacta depende de disponer de esas versiones concretas y del `uv.lock` cuyo hash se menciona pero no se reproduce en esta ficha.
- Latencia publicada no representativa: los 0,2-0,3 ms provienen de una prueba de humo con entradas a cero, no de una medición sobre audio real ni de un régimen de streaming continuo.
- Diferencia entre fp32 y fp16: se desconoce el impacto de la variante half en la calidad de detección. No se han publicado comparativas entre ambas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/silero-vad
- ONNX upstream fijado (commit `60b7ffa243625ebdc1070275a29f18c87843786a`): https://raw.githubusercontent.com/snakers4/silero-vad/60b7ffa243625ebdc1070275a29f18c87843786a/src/silero_vad/data/silero_vad.onnx
- Repositorio upstream de Silero VAD: https://github.com/snakers4/silero-vad
- Licencia upstream: https://github.com/snakers4/silero-vad/blob/60b7ffa243625ebdc1070275a29f18c87843786a/LICENSE
- Recetas de conversión de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Ficheros servidos por el registro de SkillSafe: https://models.skillsafe.ai
- `onnxruntime-web` (runtime de navegador mencionado en la model card): no disponible en los resultados de búsqueda proporcionados
- Resultados de búsqueda web: no contienen información relevante sobre el modelo (los enlaces devueltos corresponden a páginas de descarga de Google Chrome y no guardan relación con Silero VAD)
