# Phoonnx/f5tts-tw-asante_openbible

## Resumen

f5tts-tw-asante_openbible es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura F5-TTS, empaquetado en formato ONNX por Phoonnx para su uso con la librería de inferencia phoonnx. El modelo original, F5-TTS-OpenBible-Twi-Asante, fue desarrollado por multilingual-tts y está especializado en el idioma twi (código ISO `tw`), una lengua hablada principalmente en Ghana. El empaquetado de Phoonnx añade grafos ONNX optimizados, incluyendo una variante cuantizada a int8, lo que reduce significativamente el tamaño y los requisitos de memoria.

El modelo resuelve un problema concreto: la disponibilidad de TTS de calidad para lenguas de bajos recursos como el twi, que habitualmente carecen de sistemas de síntesis de voz bien soportados. Al estar empaquetado en ONNX, puede ejecutarse sin depender de frameworks de deep learning pesados, lo que facilita su despliegue en entornos con recursos limitados o en aplicaciones de asistente de voz como OVOS.

La relevancia actual del modelo radica en su enfoque práctico: un tamaño de 388 MB en int8 con un factor de tiempo real (RTF) de 8,709 en CPU, lo que lo hace viable para síntesis en hardware de consumo sin GPU. El repositorio acumula 1.092 descargas, lo que indica un uso activo dentro de la comunidad de TTS multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (modelo de difusión para síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, int8 (cuantización dinámica de onnxruntime sobre nodos MatMul y Gemm) |
| Idiomas soportados | tw (twi) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`model.onnx`, `F5_Preprocess.onnx`, `F5_Decode.onnx`; variantes `_int8`) |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, una arquitectura de síntesis de voz que emplea un modelo de difusión para generar mel-espectrogramas a partir de texto, con un enfoque de flow matching. El empaquetado de Phoonnx divide el grafo en tres componentes ONNX: preprocesamiento (`F5_Preprocess`), modelo principal (`model`) y decodificación (`F5_Decode`), lo que permite ejecutar la inferencia de forma modular con onnxruntime.

El modelo original fue entrenado por multilingual-tts a partir del corpus OpenBible en twi (variante asante), según se deduce del nombre del repositorio upstream. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización int8 se realizó mediante cuantización dinámica de onnxruntime, aplicada únicamente a los nodos MatMul y Gemm, y fue validada comparando la distancia mel-cepstral frente al modelo fp32: la salida int8 se aleja 1,17 veces más del fp32 de lo que dos ejecuciones fp32 se alejan entre sí, lo que indica una degradación controlada.

## Capacidades

- Síntesis de voz (text-to-speech) en idioma twi (variante asante) a partir de texto en grafemas.
- Generación de audio mediante modelo de difusión con flow matching (arquitectura F5-TTS).
- Ejecución en CPU sin GPU gracias al empaquetado ONNX y a la variante int8.
- Inferencia modular mediante tres grafos ONNX separados (preprocesamiento, modelo y decodificación).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se ha documentado soporte multilingüe más allá del twi.
- No se ha documentado soporte de visión, audio de entrada ni modo thinking.

## Casos de uso

- Síntesis de voz para lectores de pantalla en twi: el modelo permite convertir texto escrito en twi a audio inteligible, adecuado para aplicaciones de accesibilidad dirigidas a hablantes de esta lengua, ejecutándose en CPU con un RTF de 8,709 en int8.
- Generación de audio para contenido educativo: producción de material audible en twi (lecciones, cursos) a partir de texto, con la ventaja de que el modelo cabe en 388 MB en int8 y puede desplegarse en servidores modestos.
- Integración en asistentes de voz OVOS: phoonnx está diseñado para OVOS, por lo que este modelo puede incorporarse como motor TTS para asistentes de voz en twi, con inferencia local sin dependencia de la nube.
- Audiolibros y narración automatizada en twi: el modelo permite narrar textos largos por fragmentos, con la limitación de que no se ha documentado la longitud máxima de contexto ni la estabilidad en pasajes extensos.
- Preservación lingüística y digitalización: generación de audio para corpus en twi, facilitando la creación de recursos sonoros para investigación lingüística y docencia.
- Pruebas de concepto y prototipado en TTS de bajos recursos: el empaquetado ONNX y la variante int8 permiten experimentar con síntesis en twi en hardware de consumo (por ejemplo, un AMD Ryzen 5 7600 con 4 hilos), sin necesidad de GPU.

## Benchmarks y rendimiento

| Metrica | fp32 | int8 |
|---|---|---|
| Tamano de archivos | 1.417,5 MB | 388,2 MB |
| Memoria pico (proceso nuevo, una frase) | 2.250 MiB | 879 MiB |
| Factor de tiempo real (RTF, mediana de 3 ejecuciones) | 18,740 | 8,709 |
| Distancia mel-cepstral frente a fp32 | referencia | 1,17x la distancia entre dos ejecuciones fp32 |

Medido en CPU AMD Ryzen 5 7600 con 4 hilos. No se han publicado resultados de benchmarks estándar (MOS, WER, MCD absoluto) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; para GPU no se ha documentado.
- Memoria RAM pico: 2.250 MiB en fp32 y 879 MiB en int8 (medido en proceso nuevo que carga la voz y sintetiza una frase).
- GPU recomendadas: no disponible; el modelo está empaquetado para onnxruntime y se ha medido en CPU.
- Cabe en GPU de consumo: no se ha documentado; el tamaño int8 (388 MB) sugiere que cabría en GPUs con poca VRAM, pero no hay datos de rendimiento en GPU.
- Opciones de despliegue: onnxruntime a través de la librería phoonnx (Python y OVOS); no se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: RTF de 18,740 en fp32 y 8,709 en int8 en CPU AMD Ryzen 5 7600 con 4 hilos; un RTF menor es más rápido, por lo que int8 es aproximadamente 2,15 veces más rápido que fp32 en esta medición.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| f5tts-tw-asante_openbible | F5-TTS | tw | no disponible | CC BY-SA 4.0 | ONNX (fp32, int8) | Hugging Face (Phoonnx) |
| F5-TTS-OpenBible-Twi-Asante (upstream) | F5-TTS | tw | no disponible | CC BY-SA 4.0 | no disponible | Hugging Face (multilingual-tts) |
| Otros modelos F5-TTS empaquetados por Phoonnx | F5-TTS | varios | no disponible | según modelo | ONNX | colección F5-TTS de Phoonnx |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo soporta twi (código `tw`); no se ha documentado soporte para otros idiomas.
- No se ha documentado la longitud máxima de texto de entrada ni el comportamiento en pasajes largos; la estabilidad en textos extensos es desconocida.
- La cuantización int8 introduce una degradación medible: la distancia mel-cepstral frente a fp32 es 1,17 veces la distancia entre dos ejecuciones fp32, lo que puede afectar a la fidelidad del audio en algunos casos.
- No se han publicado métricas de calidad perceptual (MOS) ni de inteligibilidad (WER) en la información disponible.
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas; es necesario revisar las implicaciones para uso comercial y para la distribución de audio generado.
- El índice de voces de phoonnx no lista una voz para este modelo, según la model card, lo que puede complicar su uso directo con la librería.
- No se ha documentado el comportamiento del modelo ante texto con números, abreviaturas o caracteres especiales; se desconoce si requiere normalización previa (scriptconv se menciona como proyecto relacionado para normalización).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber artefactos o pronunciaciones incorrectas en el audio generado, sin datos publicados al respecto.

## Enlaces

- [Hugging Face: Phoonnx/f5tts-tw-asante_openbible](https://huggingface.co/Phoonnx/f5tts-tw-asante_openbible)
- [Modelo upstream: multilingual-tts/F5-TTS-OpenBible-Twi-Asante](https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Twi-Asante)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección F5-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30)
