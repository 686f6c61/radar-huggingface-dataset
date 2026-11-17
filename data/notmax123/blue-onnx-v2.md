# notmax123/blue-onnx-v2

## Resumen

Blue ONNX v2 es un paquete de grafos ONNX (opset 17) para inferencia del sistema de sintesis de voz Blue / Light Blue TTS mediante ONNX Runtime. Lo publica el usuario notmax123 en Hugging Face y esta pensado como distribucion "slim" de los pesos necesarios para ejecutar el pipeline de TTS sin depender de PyTorch en tiempo de inferencia. El modelo resuelve la sintesis de voz multilingue (hebreo, ingles, espanol, italiano y aleman) con soporte de mezcla de idiomas en linea mediante etiquetas de estilo XML en el texto de entrada.

Tecnicamente no se trata de un unico modelo transformer, sino de un conjunto de cuatro grafos ONNX especializados: un codificador de texto, un estimador de campo vectorial (flow matching) con classifier-free guidance y latentes incondicionales precalculados, un vocoder como decodificador de codec neuronal y un predictor de duracion condicionado por estilo. El estilo de voz se suministra por separado en ficheros JSON por voz, no incluidos en este repositorio. El repo ocupa 0,7 GB y la licencia es MIT.

Su relevancia practica es la portabilidad: al estar exportado a ONNX, el modelo puede desplegarse con ONNX Runtime en CPU, GPU o entornos embebidos sin el stack de PyTorch, lo que reduce dependencias y facilita integraciones en produccion. Ahora bien, el proyecto tiene nulo o minimo respaldo comunitario (0 descargas, 1 like en el momento de la consulta) y no publica benchmarks objetivos, por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en cuatro grafos ONNX: text encoder, vector estimator (flow matching con CFG), vocoder (decodificador de codec neuronal) y duration predictor condicionado por estilo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto por utterance; no se documenta limite de tokens) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como grafos ONNX ya exportados; no se listan variantes cuantizadas) |
| Idiomas soportados | en, he, de, es, it (con mezcla de idiomas en linea mediante etiquetas XML) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17); pesos PyTorch/safetensors en el repo complementario notmax123/blue-v2 |

## Arquitectura y entrenamiento

El bundle se compone de cuatro subgrafos ONNX que reproducen el pipeline de Blue TTS. El `text_encoder.onnx` recibe identificadores de fonemas y tensores de estilo por voz (denominados TTL en la model card). El `vector_estimator.onnx` implementa un estimador de campo vectorial de tipo flow matching con classifier-free guidance y latentes incondicionales ya incorporados al grafo, lo que simplifica el codigo de inferencia al eliminar la necesidad de gestionar dos pasadas separadas. El `vocoder.onnx` actua como decodificador de codec neuronal y devuelve la forma de onda, con las estadisticas de normalizacion integradas en el propio grafo. Por ultimo, `duration_predictor.onnx` predice la duracion condicionada por estilo, tomando el tensor `style_dp` del JSON de voz.

El estilo de voz no forma parte de este repositorio: se suministra mediante ficheros JSON por voz (por ejemplo `female1.json`) procedentes del repositorio BlueTTS o de releases companeras. Para el G2P de hebreo se requiere un `model.onnx` adicional del proyecto renikud. No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se detallan innovaciones adicionales mas alla del empaquetado de CFG y estadisticas dentro de los grafos.

## Capacidades

- Sintesis de voz multilingue en hebreo, ingles, espanol, italiano y aleman.
- Mezcla de idiomas en linea dentro de una misma utterance mediante etiquetas XML de estilo en el texto.
- Control de estilo de voz mediante ficheros JSON externos (tensores TTL y `style_dp`).
- Prediccion de duracion condicionada por estilo, lo que permite ajustar el ritmo del habla segun la voz seleccionada.
- Inferencia via ONNX Runtime, con soporte para ejecucion en CPU y GPU segun el proveedor de ejecucion configurado.
- Integracion mediante la libreria Python `blue-onnx` (`BlueTTS`, `load_voice_style`).
- Soporte de G2P de hebreo mediante el modelo renikud externo.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada; es exclusivamente text-to-speech.

## Casos de uso

- **Lectura de contenido en hebreo con vocalizacion**: el pipeline combinado con renikud permite generar audio inteligible en hebreo, un idioma con escasa cobertura en soluciones TTS abiertas, usando el modelo renikud para el G2P y Blue ONNX v2 para la sintesis.
- **Locucion multilingue para videojuegos o e-learning**: la mezcla de idiomas en linea con etiquetas XML permite alternar espanol, ingles e italiano dentro de una misma frase, util para contenido didactico con terminos tecnicos en otro idioma.
- **Despliegue en entornos sin PyTorch**: al ser grafos ONNX, el modelo puede ejecutarse con ONNX Runtime en contenedores ligeros, dispositivos edge o servicios serverless donde instalar PyTorch resulta costoso.
- **Generacion de audiolibros y podcasts con control de estilo**: los ficheros JSON de voz permiten fijar un estilo consistente por voz (tensores TTL y `style_dp`), adecuado para narraciones largas con identidad de voz estable.
- **Accesibilidad y lectores de pantalla**: sintesis local en CPU para convertir texto en voz en aplicaciones de escritorio o moviles, sin dependencia de APIs en la nube.
- **Prototipado rapido de asistentes de voz**: la API `BlueTTS` con `synthesize(text, lang=...)` facilita integrar TTS en prototipos de asistentes conversacionales multilingues.
- **Investigacion en TTS multilingue**: el bundle permite reproducir el pipeline sin reentrenar, util para experimentos de evaluacion subjetiva o comparativas de vocoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, latencia) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repo (0,7 GB) da una cota superior aproximada del peso de los grafos, pero no se especifica el consumo en ejecucion.
- GPU recomendadas: no disponible. Al ejecutarse sobre ONNX Runtime, es compatible con los execution providers CUDA, TensorRT, DirectML y CoreML, pero no se documentan GPUs concretas ni requisitos minimos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del bundle es plausible que quepa en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: ONNX Runtime (principal), libreria Python `blue-onnx`; los pesos PyTorch equivalentes estan en notmax123/blue-v2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Blue ONNX v2 | TTS flow matching + codec | en, he, de, es, it | MIT | ONNX (opset 17) | Bundle slim; estilo en JSON externo; sin benchmarks publicados |
| Piper | TTS VITS | Multiples (segun voz) | MIT (mayoria de voces) | ONNX | Ampliamente desplegado en edge; ecosistema maduro y muchas voces |
| Coqui XTTS v2 | TTS zero-shot | 17 idiomas | Coqui Public Model License (no comercial) | PyTorch/safetensors | Clonacion de voz zero-shot; licencia restrictiva para uso comercial |
| Kokoro | TTS | Multiples | Apache 2.0 | ONNX/PyTorch | Ligero y popular; sin soporte documentado de hebreo |

Las cifras concretas de parametros, contexto y rendimiento de los modelos alternativos no se detallan en la informacion disponible para esta ficha; la comparativa se limita a categoria, licencia y formato.

## Limitaciones y advertencias

- Proyecto con respaldo comunitario minimo (0 descargas, 1 like en la consulta): no hay evidencia de validacion independiente ni de mantenimiento a largo plazo.
- Ausencia total de benchmarks objetivos: no se puede afirmar calidad, naturalidad ni inteligibilidad relativa frente a alternativas.
- El estilo de voz no esta incluido: requiere ficheros JSON externos del repositorio BlueTTS, lo que anade una dependencia y un paso de configuracion.
- El hebreo exige un modelo renikud externo para el G2P; sin el, la sintesis en hebreo no funciona correctamente.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion incorrecta en palabras fuera del vocabulario o en mezclas de idioma no previstas; no se documenta el comportamiento en esos casos.
- Sesgos: no se documentan sesgos de voz, genero, acento o idioma; al depender de voces predefinidas, la diversidad de estilos esta limitada a los JSON disponibles.
- Licencia MIT permisiva para uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento y de los pesos originales del proyecto BlueTTS antes de un despliegue en produccion.
- No se especifican limites de longitud de texto por utterance ni comportamiento con entradas muy largas.
- La fecha de creacion indicada (2026-04-22) y la de actualizacion (2026-11-16) deben tomarse como metadatos del repositorio; no aportan informacion sobre madurez del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notmax123/blue-onnx-v2
- Pesos PyTorch/safetensors: https://huggingface.co/notmax123/blue-v2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/notmax123/BlueV2
- Repositorio GitHub BlueTTS: https://github.com/maxmelichov/BlueTTS
- Paquete PyPI blue-onnx: https://pypi.org/project/blue-onnx/
- Modelo renikud (G2P hebreo): https://huggingface.co/thewh1teagle/renikud
- Sitio del proyecto: https://lightbluetts.com
- ONNX: https://onnx.ai/
- ONNX Runtime: https://onnxruntime.ai/
