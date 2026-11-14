# JhonLib/charly-pocket-tts-ja

## Resumen

Pocket TTS Japanese (ONNX) es una exportación a formato ONNX del modelo de síntesis de voz takuma104/pocket-tts-ja-cc, que a su vez deriva de Pocket TTS de Kyutai. El modelo está pensado para generar voz en japonés a partir de texto y ha sido empaquetado por JhonLib para su uso como motor de voz descargable dentro de CharlyTTS, un proyecto de TTS local. La relevancia principal es práctica: permite ejecutar un motor de voz japonés en CPU con onnxruntime, sin necesidad de Python ni PyTorch en tiempo de inferencia, lo que simplifica su integración en aplicaciones de escritorio o entornos ligeros.

La arquitectura es la de Pocket TTS, un sistema de texto a voz que combina un condicionador de texto, un backbone FlowLM (aquí cuantizado a INT8), una cabeza de flujo y un decodificador de audio Mimi a 24 kHz. El modelo base japonés concreto que se exporta es la variante de 6 capas etiquetada como "japanese". El repositorio ocupa unos 0,2 GB y se distribuye bajo licencia CC BY 4.0, la misma que los pesos originales.

El modelo incluye 10 voces sintéticas previamente codificadas (5 femeninas y 5 masculinas), generadas con Irodori-TTS a partir de descripciones textuales, por lo que no corresponden a personas reales. Al estar las voces ya codificadas, el export no incluye el codificador Mimi. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy específico: TTS japonés local en CPU dentro del ecosistema CharlyTTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (condicionador de texto + backbone FlowLM + cabeza de flujo + decodificador Mimi), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone FlowLM en INT8; resto de componentes en el formato exportado (no se detalla) |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (text_conditioner.onnx, flow_lm_main_int8.onnx, flow_lm_flow.onnx, mimi_decoder.onnx); tokenizer.json; voces en .cond.bin (float32, [frames, 1024]) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pocket TTS de Kyutai, descrita en el paper arXiv:2509.06926. La inferencia se descompone en cuatro etapas: un condicionador de texto que produce embeddings, un backbone FlowLM que procesa la secuencia (exportado con pesos INT8), una cabeza de flujo que genera las representaciones latentes de audio y un decodificador Mimi que reconstruye la forma de onda a 24 kHz. La variante exportada corresponde al modelo japonés de 6 capas de takuma104/pocket-tts-ja-cc.

La exportación se realizó con el exportador de PocketTTS.cpp (MIT), adaptado a pocket-tts 4.0.1 y al modelo japonés, y los autores indican que las salidas se verificaron contra el modelo original en PyTorch. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se especifican en la información disponible; la model card remite a la ficha del modelo base para los datos de entrenamiento y sus créditos. Las 10 voces incluidas son sintéticas, creadas con Irodori-TTS a partir de descripciones textuales, y se distribuyen ya codificadas como prompts de voz en float32 con forma [frames, 1024].

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto de entrada.
- Generación de audio a 24 kHz mediante el decodificador Mimi.
- Selección entre 10 voces predefinidas (5 femeninas y 5 masculinas), todas sintéticas.
- Ejecución en CPU con onnxruntime, sin dependencia de Python ni PyTorch en inferencia.
- Tokenización mediante SentencePiece unigram (tokenizer.json incluido).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan capacidades multilingües más allá del japonés.

## Casos de uso

- Lectura de texto en japonés en aplicaciones de escritorio: el modelo se integra como motor ONNX y genera voz en CPU sin requerir un entorno Python, adecuado para apps nativas que necesiten narración local.
- Asistentes de voz locales en japonés: al ejecutarse con onnxruntime en CPU, puede incorporarse en dispositivos sin GPU para respuestas habladas en conversaciones de dominio acotado.
- Accesibilidad y lectores de pantalla: conversión de contenido textual japonés a audio con voces sintéticas seleccionables, sin depender de servicios en la nube.
- Prototipado de interfaces de voz: las 10 voces predefinidas permiten evaluar distintas tonalidades sin entrenar ni clonar voces.
- Generación de audiolibros o contenido narrado en japonés: el pipeline por etapas (texto, FlowLM, Mimi) permite procesar lotes de texto de forma local.
- Integración en el ecosistema CharlyTTS: el modelo está empaquetado específicamente como motor de voz descargable para ese proyecto, lo que facilita su uso directo dentro de esa aplicación.
- Pruebas de pipeline TTS sin PyTorch: útil para entornos con restricciones de dependencias donde solo se dispone de un runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecutarse en CPU con onnxruntime.
- GPU recomendadas: no aplica según la información disponible; el autor indica ejecución en CPU.
- Cabe en GPU consumer: no se documenta; el diseño apunta a CPU.
- Opciones de despliegue: onnxruntime (CPU), a través del exportador de PocketTTS.cpp y del proyecto CharlyTTS.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: aproximadamente 0,2 GB, lo que sugiere un modelo ligero apto para entornos con recursos limitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| JhonLib/charly-pocket-tts-ja (este) | no disponible | no disponible | ja | CC BY 4.0 | ONNX |
| takuma104/pocket-tts-ja-cc (base) | no disponible (variante de 6 capas) | no disponible | ja | CC BY 4.0 | PyTorch (no confirmado en la informacion) |
| kyutai/pocket-tts (original) | no disponible | no disponible | no disponible en la informacion | CC BY 4.0 | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta japonés; no se documentan otros idiomas.
- Las 10 voces son sintéticas y no corresponden a personas reales; el autor advierte explícitamente contra imitar la voz de una persona real sin su consentimiento.
- Al ser una exportación ONNX con backbone cuantizado a INT8, puede haber diferencias de calidad respecto al modelo original en PyTorch, aunque el autor indica que las salidas se verificaron.
- No se incluye el codificador Mimi, por lo que no es posible codificar nuevas voces a partir de audio con este paquete; solo se pueden usar los prompts de voz incluidos.
- Riesgo de alucinación o artefactos en la síntesis: no se documentan métricas de calidad (MOS, WER) en la información disponible.
- Sesgos conocidos: no documentados.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a Kyutai, takuma104 y el exportador PocketTTS.cpp según los créditos de la model card.
- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- No se documentan límites de longitud de texto ni de contexto para la síntesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhonLib/charly-pocket-tts-ja
- Modelo base: https://huggingface.co/takuma104/pocket-tts-ja-cc
- Pocket TTS de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Paper de Pocket TTS: https://arxiv.org/abs/2509.06926
- Exportador PocketTTS.cpp: https://github.com/VolgaGerm/PocketTTS.cpp
