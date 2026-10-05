# Micklavin/whisper-base-oga-int8

## Resumen

Este repositorio distribuye una conversión cuantizada a INT8 del modelo de reconocimiento automático del habla `openai/whisper-base`, empaquetada específicamente para la librería ONNX Runtime GenAI (OGA). Lo publica el usuario Micklavin bajo licencia Apache-2.0 y el snapshot ocupa aproximadamente 0,2 GB. El artefacto se exportó desde el repositorio original de OpenAI en la revisión `e37978b90ca9030d5170a5c07aadb050351a65bb` mediante la herramienta Olive.

Whisper es una familia de modelos encoder-decoder Transformer entrenados por OpenAI para transcripción y traducción de voz. Esta variante no reentrena ni modifica los pesos: solo cambia el formato a ONNX con pesos externos y cuantización INT8, de modo que pueda ejecutarse en CPU a través de ONNX Runtime GenAI 0.17.1 (y, en teoría, en GPU/NPU, aunque esos perfiles no están cualificados).

Su relevancia radica en el despliegue local y en el borde (*edge*), especialmente en Windows nativo sobre ARM64 mediante Windows ML, donde permite transcripciones sin conexión. La model card advierte de que la cualificación es limitada: solo se validaron la carga del paquete y una transcripción de muestra; no se aportan cifras de WER/CER de referencia ni validación multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de `openai/whisper-base`) |
| Parametros totales | no disponible en la model card; el modelo base `openai/whisper-base` declara ~74 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; Whisper opera sobre ventanas de audio de 30 s por arquitectura del modelo base |
| Tipos de cuantizacion | INT8 (exportacion ONNX para ONNX Runtime GenAI) |
| Idiomas soportados | no disponible (la model card no detalla idiomas; dependen del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx` + `decoder.onnx` y dos ficheros `.onnx.data` de pesos externos), cuantizado a INT8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper, un transformer encoder-decoder que consume espectrogramas mel como entrada y genera tokens de texto de forma autorregresiva. Esta ficha no describe un nuevo entrenamiento: el artefacto es una conversión de formato del modelo `openai/whisper-base`, realizada con Olive y dirigida al runtime ONNX Runtime GenAI. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque el repositorio no reentrena el modelo.

La innovación técnica de este paquete es puramente de despliegue: la cuantización a INT8 y el troceado de los pesos en ficheros externos `.onnx.data` reducen el tamaño y permiten la inferencia en CPU. La model card indica que el procesador OGA de Whisper usa los activos incluidos de procesamiento de audio y tokenizador, y que se deben mantener todos los ficheros juntos (no cargar `encoder.onnx` o `decoder.onnx` como modelos independientes).

## Capacidades

- Transcripción de voz a texto (*automatic speech recognition*) a partir de audio, usando el procesador de audio incluido.
- Ejecución del paquete completo mediante ONNX Runtime GenAI 0.17.1.
- Inferencia en CPU sobre Windows nativo ARM64 a través del runtime Windows ML (perfil `CPUExecutionProvider`).
- No se documenta soporte de *tool calling*, *function calling* ni uso como agente.
- No se documentan capacidades multilingües verificadas ni *thinking mode*, visión, audio adicional u otras modalidades.
- No se documenta generación de marcas de tiempo (*timestamps*): figura explícitamente como no cualificada.

## Casos de uso

- Transcripción local en Windows ARM64: el paquete está validado en Windows nativo ARM64 vía Windows ML y ONNX Runtime GenAI, por lo que puede integrarse en aplicaciones de escritorio que transcriban audio sin conexión.
- Procesamiento con privacidad por diseño: al ejecutarse en CPU local, el audio no abandona el dispositivo, lo que resulta adecuado para datos sensibles (sanitario, legal, corporativo) donde no se permite enviar audio a la nube.
- Subtitulado y notas de reuniones en el borde: dado su reducido tamaño (~0,2 GB), puede embeberse en herramientas de escritorio que generen transcripciones de fragmentos cortos de audio.
- Prototipado en portátiles consumer: requiere ONNX Runtime GenAI 0.17.1 y corre en CPU, por lo que sirve para validar pipelines de ASR sin GPU dedicada.
- Preprocesado de voz en pipelines ONNX: al ser un grafo ONNX, puede encadenarse dentro de una aplicación que ya use ONNX Runtime como motor de inferencia unificado, evitando introducir PyTorch.
- Evaluación de conversiones cuantizadas: útil como referencia para comparar la paridad frente al modelo PyTorch original antes de decidir un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de paridad incluidas comparan con una referencia PyTorch fijada y que **no** son puntuaciones de precisión de referencia (*ground truth*). WER/CER, marcas de tiempo y calidad multilingüe figuran como no cualificados.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un paquete INT8 de ~0,2 GB, la huella de memoria es muy reducida, pero la model card no publica cifras de consumo.
- GPU recomendadas: no disponible (no se han cualificado perfiles de GPU).
- NPU: no disponible (no se ha cualificado ejecución en NPU).
- CPU: validado en Windows nativo ARM64 con `CPUExecutionProvider`.
- ¿Cabe en GPU de consumo? El tamaño del artefacto sugiere que sí en cualquier GPU de consumo, pero la ejecución en GPU no está cualificada, por lo que no puede afirmarse como soportado.
- Opciones de despliegue: ONNX Runtime GenAI 0.17.1 es el runtime requerido; el paquete no es un GGUF y no se declara compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Micklavin/whisper-base-oga-int8 (este) | ~74 M (modelo base) | Ventanas de audio de 30 s (arquitectura) | ONNX INT8 | Apache-2.0 | HuggingFace, requiere ONNX Runtime GenAI 0.17.1 |
| openai/whisper-base | ~74 M | Ventanas de audio de 30 s | PyTorch (safetensors) | Apache-2.0 | HuggingFace / Transformers |
| Conversiones GGUF de whisper-base (whisper.cpp) | ~74 M | Ventanas de audio de 30 s | GGUF | Apache-2.0 (segun origen) | Repositorios de whisper.cpp |
| openai/whisper-small | ~244 M | Ventanas de audio de 30 s | PyTorch | Apache-2.0 | HuggingFace / Transformers |

Nota: los recuentos de parámetros del modelo base y de las alternativas son valores públicos ampliamente documentados; esta ficha no los ha verificado contra una fuente citada en el repositorio. No se dispone de una comparativa de rendimiento (WER/CER) entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Cualificación parcial: solo se validaron la carga del paquete/procesador y una transcripción de muestra. GPU/NPU, marcas de tiempo, WER/CER de referencia, calidad multilingüe y compatibilidad amplia de dispositivos figuran como no cualificados.
- Las métricas de paridad incluidas no son puntuaciones de precisión reales, sino comparaciones frente a una referencia PyTorch fijada.
- La cuantización INT8 puede degradar la precisión de transcripción respecto al modelo original en FP32; no se documenta el impacto real.
- No se documentan idiomas soportados ni su calidad, por lo que no debe asumirse cobertura multilingüe fiable sin evaluarla.
- No se documentan sesgos concretos; al derivar de `openai/whisper-base` hereda los sesgos potenciales del modelo original (acentos, variedades dialectales, ruido de fondo).
- Riesgo de alucinación inherente a los modelos de ASR generativos, especialmente con audio ruidoso o silencios.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card recomienda revisar la licencia y avisos del modelo original antes de redistribuir este artefacto convertido.
- Integridad del paquete: se debe descargar el snapshot completo y verificar los hashes SHA-256 de `manifest.json`; cargar `encoder.onnx` o `decoder.onnx` como modelos independientes no es válido.
- Dependencia de versión: el paquete se cualificó con ONNX Runtime GenAI 0.17.1; otras versiones no están validadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Micklavin/whisper-base-oga-int8
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Exportación citada: herramienta Olive (no se incluye enlace específico en la información disponible)
