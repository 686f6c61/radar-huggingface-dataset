# lucasw89/whisper-small-danish-ONNX

## Resumen

`whisper-small-danish-ONNX` es una conversión a formato ONNX del modelo `thorhojhus/whisper-small-danish`, un ajuste fino en danés de `openai/whisper-small` (244 millones de parámetros). El repositorio lo publica el usuario `lucasw89` y su propósito no es entrenar un modelo nuevo, sino reempaquetar los pesos originales en el formato que consume Transformers.js, de modo que el reconocimiento automático de habla en danés pueda ejecutarse directamente en el navegador.

La conversión sigue la disposición de los repositorios Whisper de `onnx-community`: un codificador (`onnx/encoder_model*.onnx`) y un decodificador fusionado con caché KV (`onnx/decoder_model_merged*.onnx`), en cuatro precisiones (`fp32`, `fp16`, `q8` y `q4`). Esto permite cargar el modelo tanto sobre WASM (con cuantización de 8 o 4 bits) como sobre WebGPU (codificador en fp16 y decodificador en q4).

Su relevancia es acotada pero concreta: cubre el nicho de transcripción de audio en danés sin servidor, dentro de una aplicación web, con una licencia MIT heredada del modelo original. No aporta mejoras de arquitectura ni de entrenamiento respecto a la base; su valor está en el formato y en la validación de la conversión, que el autor documenta con una medición de tasa de error por palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), conversión ONNX con decodificador fusionado y caché KV |
| Parametros totales | 244 millones (heredados de `openai/whisper-small`; no se explicita en la model card, se deduce del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por fragmento (`chunk_length_s: 30` en el ejemplo de uso) |
| Tipos de cuantizacion | fp32, fp16, q8 (QUInt8 en codificador, QInt8 en decodificador), q4 (MatMulNBits, block_size 32, simétrico) |
| Idiomas soportados | Danés (`da`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model*.onnx`, `decoder_model_merged*.onnx`) con `generation_config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder con atención completa que procesa espectrogramas de audio de 30 segundos y genera tokens de texto de forma autorregresiva. Este repositorio no entrena nada; la model card lo indica explícitamente ("it adds no training"). Los pesos proceden de `thorhojhus/whisper-small-danish`, un ajuste fino en danés de `openai/whisper-small`, y la conversión se realizó con `optimum` 2.1.0 y `optimum-onnx` 0.1.0, exportando la tarea `automatic-speech-recognition-with-past` en fp32 y derivando después las variantes fp16, q8 y q4.

El detalle técnico más relevante es el tratamiento del decodificador fusionado: para generar la variante fp16 fue necesario renombrar las salidas de cada rama del `If` del decodificador fusionado, porque de lo contrario el conversor conectaba ambas ramas al `Cast` externo en fp32 y onnxruntime rechazaba el grafo por ciclo. La cuantización q8 usa `quantize_dynamic` con `EnableSubgraph=True`, y la q4 usa `MatMulNBitsQuantizer`. Los ficheros de tokenizer, la configuración de generación y los tokens `<|da|>` y de tarea se copian sin cambios del repositorio fuente. No se documentan en la información disponible datos de entrenamiento, composición del dataset ni uso de RLHF o DPO, que corresponderían a la model card del modelo original.

## Capacidades

- Reconocimiento automático de habla (ASR) en danés, con salida de texto plano.
- Transcripción por fragmentos de 30 segundos mediante `chunk_length_s`, lo que permite procesar audio más largo que la ventana nativa.
- Ejecución en navegador con Transformers.js, tanto sobre WASM (q8/q4) como sobre WebGPU (fp16 en codificador, q4 en decodificador).
- Compatibilidad con cualquier pipeline `automatic-speech-recognition` de Transformers.js.
- Selección explícita de idioma (`language: "da"`) y de tarea (`task: "transcribe"`).
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz para transcripción, ni modo de razonamiento extendido.

## Casos de uso

- Transcripción en el navegador sin servidor: la aplicación carga el modelo con Transformers.js y procesa el audio localmente, de modo que el audio no sale del dispositivo del usuario; adecuado para herramientas de dictado o notas de voz en danés.
- Aplicación web `whisper_web`: este repositorio está pensado como entrada del catálogo de modelos de esa aplicación, que lo carga en WASM (q8/q4) o WebGPU (fp16 + q4) según el hardware del cliente.
- Subtitulado de contenido audiovisual en danés: con fragmentos de 30 segundos y decodificación voraz, se puede generar texto sincronizado para vídeos o pódcast de forma por lotes.
- Prototipado rápido de ASR en danés: al ser un pipeline estándar de Transformers.js, sirve para validar una interfaz o un flujo de trabajo antes de invertir en infraestructura de servidor.
- Herramientas de accesibilidad: transcripción de conversaciones o reuniones en danés dentro de una página web, sin backend y con licencia MIT que permite integrarlo en productos propios.
- Evaluación comparativa de cuantizaciones: el repositorio incluye cuatro precisiones del mismo modelo, lo que permite medir el compromiso entre tamaño, velocidad y precisión en un despliegue web concreto.

## Benchmarks y rendimiento

La model card incluye una única medición, que el propio autor califica como comprobación de la conversión y no como benchmark: tasa de error por palabra (WER) sobre un clip de 21,5 segundos de estilo noticia en danés (`da_festuge`, del conjunto de pruebas de whisper_web), con texto en minúsculas y sin puntuación, Transformers.js 4.2.0 sobre onnxruntime-node en CPU, decodificación voraz, `language: "da"` y fragmentos de 30 segundos.

| dtype | Esta conversion | Whisper-small estandar (mismo tamano) |
|---|---|---|
| q8 | 0.109 | 0.297 |
| q4 | 0.094 | 0.281 |
| fp16+q4 | 0.094 | no disponible |
| fp16 | 0.094 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos no aplicarían a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 2,0 GB e incluye las cuatro variantes; en ejecución solo se carga una de ellas, por lo que el consumo real depende de la precisión elegida.
- GPU recomendadas: no se especifican. El caso de uso principal es el navegador, con WebGPU para la variante fp16 + q4 y WASM para q8/q4.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con soporte WebGPU en el navegador; no se detallan modelos concretos ni requisitos mínimos.
- Opciones de despliegue: Transformers.js (WASM y WebGPU) y onnxruntime (el autor valida con onnxruntime-node en CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles. Solo se documenta que la validación se hizo en CPU con onnxruntime-node, sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `lucasw89/whisper-small-danish-ONNX` | 244 M (deducido) | 30 s de audio por fragmento | da | MIT | ONNX | Conversion para Transformers.js; WER 0.094-0.109 en el clip de prueba |
| `thorhojhus/whisper-small-danish` | 244 M (deducido) | 30 s de audio por fragmento | da | MIT | safetensors (presumiblemente) | Modelo fuente del que se deriva esta conversión; sin datos de benchmarks en la información disponible |
| `onnx-community/whisper-small` | 244 M (deducido) | 30 s de audio por fragmento | multilingue | no disponible en la informacion | ONNX | Referencia estándar usada en la tabla de WER; WER 0.281-0.297 en el mismo clip |

La comparación con otros modelos ASR en danés de distinto tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está ajustado para danés; no se debe esperar calidad en otros idiomas, y la model card restringe el uso previsto a ASR en danés.
- La única métrica de calidad publicada procede de un solo clip de 21,5 segundos; el propio autor advierte que es una comprobación de la conversión y no un benchmark, por lo que no permite extrapolar el rendimiento a dominios, acentos o condiciones acústicas distintas.
- No se documentan en esta información los sesgos del modelo original ni su tasa de alucinación; esas advertencias remiten a la model card de `thorhojhus/whisper-small-danish`.
- La licencia MIT se hereda del repositorio original y permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI (`openai/whisper-small`) que subyace a la cadena.
- El repositorio no aporta entrenamiento ni mejoras; cualquier limitación del ajuste fino original se traslada intacta a esta conversión.
- El rendimiento en navegador depende del soporte de WebGPU del cliente; sin él, la ejecución recae en WASM con las variantes cuantizadas.
- No hay garantías de mantenimiento ni de actualización: el repositorio tiene 26 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lucasw89/whisper-small-danish-ONNX
- Modelo base: https://huggingface.co/thorhojhus/whisper-small-danish
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Referencia de conversiones Whisper en ONNX: https://huggingface.co/onnx-community/whisper-small
