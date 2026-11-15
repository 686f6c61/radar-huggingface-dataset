# Phoonnx/vits-piper_en_US-kristin-medium

## Resumen

`Phoonnx/vits-piper_en_US-kristin-medium` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del ecosistema Piper y empaquetado para su uso con la librería `phoonnx`. Lo publica el usuario `Phoonnx` como un subconjunto extraído del repositorio agregador `Phoonnx/phoonnx-vits`, en la carpeta `piper__en_US-kristin-medium`. Se trata de una voz femenina en inglés estadounidense identificada como "kristin", con calidad "medium" según la convención de nombres de Piper.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal end-to-end que mapea texto a forma de onda sin necesidad de vocoder externo. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT, lo que facilita su integración en aplicaciones comerciales y de código abierto.

Su relevancia es práctica más que investigadora: se trata de un artefacto listo para inferencia en producción dentro del ecosistema phoonnx, pensado para desarrolladores que necesitan una voz inglesa ligera, ejecutable en CPU y con pesos ONNX optimizados. La información publicada por el autor es mínima y no incluye detalles sobre datos de entrenamiento, número de parámetros ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (pesos en ONNX, presumiblemente FP32/FP16) |
| Idiomas soportados | inglés estadounidense (`en_US`) según el identificador del modelo; no confirmado en la model card |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder neuronal integrado (típicamente HiFi-GAN) que produce directamente la forma de onda. Esta familia de modelos se entrena con una combinación de pérdidas adversarias, de reconstrucción espectral y de alineamiento monotónico, lo que permite síntesis de alta calidad sin pipeline separado de alineamiento o vocoder.

En el caso concreto de esta ficha, no se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el corpus de voz original ni si se aplicaron etapas de ajuste fino o RLHF. La model card únicamente indica que los archivos conservan las rutas del repositorio origen `Phoonnx/phoonnx-vits` y que la licencia se hereda del subfolder original. La variante "medium" corresponde a la nomenclatura de Piper, que distingue calidades (low, medium, high) en función del tamaño y la fidelidad del modelo.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en_US`).
- Generación de audio en formato ONNX, ejecutable mediante la librería `phoonnx`.
- Voz femenina identificada como "kristin" con calidad "medium".
- Inferencia sin dependencia de vocoder externo (arquitectura VITS end-to-end).
- Compatible con el ecosistema Piper y con las herramientas de `phoonnx` (https://github.com/TigreGotico/phoonnx).
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto, al ser un modelo exclusivamente TTS.
- No se ha documentado soporte multilingüe más allá del inglés estadounidense indicado en el nombre.

## Casos de uso

- **Locución para asistentes de voz**: integración en un asistente conversacional en inglés que necesite respuestas habladas con latencia baja, aprovechando el formato ONNX y la ejecución en CPU.
- **Generación de audiolibros y contenido narrado**: conversión por lotes de textos largos a audio mediante la API de `phoonnx`, con una voz femenina consistente.
- **Sistemas de accesibilidad**: lectura en voz alta de contenido web o de interfaces para usuarios con discapacidad visual, desplegable en servidores sin GPU dedicada.
- **Prototipado de productos de voz**: pruebas de concepto y demos de aplicaciones TTS en inglés sin coste de licencia, al estar bajo MIT.
- **Integración en pipelines de CI/CD de audio**: generación automática de avisos hablados o mensajes de estado en inglés dentro de flujos de automatización.
- **Aplicaciones de aprendizaje de idiomas**: reproducción de frases en inglés estadounidense para ejercicios de pronunciación y comprensión auditiva.
- **Contenido para podcasts y vídeos**: narración sintética de guiones cortos en inglés, con la ventaja de un modelo de tamaño reducido (0,1 GB) que se puede empaquetar junto con la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0,1 GB en ONNX, la inferencia puede ejecutarse en CPU sin GPU dedicada; en GPU el consumo de memoria es mínimo (por debajo de 1 GB en la mayoría de configuraciones).
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime, incluidas NVIDIA RTX 4090, A100 o H100 si se desea aceleración; no obstante, el modelo está dimensionado para ejecución en CPU.
- **GPU de consumo**: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) e incluso en dispositivos de borde con ONNX Runtime.
- **Opciones de despliegue**: `phoonnx` (librería nativa del modelo), ONNX Runtime; no se ha documentado compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, que no están orientados a modelos TTS.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/vits-piper_en_US-kristin-medium` | VITS | ~0,1 GB (repo) | en_US | MIT | ONNX |
| Piper `en_US-amy-medium` | VITS | ~60-100 MB | en_US | MIT (según origen) | ONNX |
| Piper `en_US-lessac-medium` | VITS | ~60-100 MB | en_US | MIT (según origen) | ONNX |
| Coqui TTS VITS (en) | VITS | variable | en | MPL 2.0 / varias | PyTorch, ONNX |

La comparación con otras voces Piper se basa en la convención de nombres del ecosistema; los datos concretos de cada alternativa no se han verificado en la información disponible.

## Limitaciones y advertencias

- **Información mínima**: la model card no documenta datos de entrenamiento, número de parámetros ni métricas de calidad, lo que dificulta evaluar su robustez en producción.
- **Sesgos**: al no publicarse la composición del corpus de voz, no es posible evaluar sesgos de género, acento o prosodia; la voz es femenina y de inglés estadounidense.
- **Riesgo de alucinación**: en TTS el riesgo se traduce en pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento, especialmente nombres propios y términos técnicos.
- **Limitaciones de idioma**: el modelo está etiquetado como `en_US`; no se ha confirmado soporte para otros idiomas o acentos.
- **Licencia**: MIT, lo que permite uso comercial, pero la model card advierte que la licencia se hereda del repositorio origen y que algunas voces del agregador tienen `license: other`; conviene revisar el README de la carpeta original antes de un despliegue comercial.
- **Ecosistema**: depende de la librería `phoonnx` y del ecosistema Piper; la integración con otros frameworks TTS no está documentada.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-piper_en_US-kristin-medium
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Ecosistema Piper (referencia de las voces): no disponible en la información proporcionada.
