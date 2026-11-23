# eigami/qwen3-tts-voicedesign-onnx

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba Cloud, diseñado para generar audio de alta calidad a partir de texto con control sobre el estilo de la voz. Este repositorio concreto, publicado por el usuario eigami, es una conversión a formato ONNX con cuantización int4 de los pesos originales, orientada a la inferencia en CPU sin necesidad de GPU. No se ha reentrenado nada: los pesos son los de Qwen, únicamente convertidos y cuantizados.

El modelo base emplea una arquitectura de dos etapas: un *talker* (modelo de lenguaje autorregresivo) que genera tokens de código a 12 Hz, y un vocoder que decodifica esos tokens a audio a 24 kHz. Con 1.7B parámetros, el modelo original está pensado para síntesis expresiva con control de diseño de voz, y esta versión ONNX lo hace desplegable en entornos sin aceleración hardware dedicada.

La relevancia de esta ficha radica en que ofrece una ruta práctica para ejecutar TTS de calidad en portátiles y servidores sin GPU: el repositorio ocupa unos 2.2 GB y requiere aproximadamente 3 GB de memoria, con un rendimiento cercano al tiempo real en una CPU de portátil reciente mediante ONNX Runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo en dos etapas: talker (transformer) + code predictor + vocoder; tokenizador de audio a 12 Hz |
| Parámetros totales | 1.7B (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (matrices MatMulNBits, bloques de 32, simétrico); tabla de texto en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con ficheros `.onnx.data` asociados) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign sigue un esquema de generación de audio en dos fases. En la primera, un *talker* autorregresivo procesa los tokens de texto y genera el primer código de cada trama de audio a una frecuencia de 12 Hz. Un *code predictor* completa los 15 códigos restantes de cada trama. En la segunda fase, el decodificador del tokenizador de voz (vocoder) convierte las tramas de códigos en audio a 24 kHz. La conversión de eigami descompone este pipeline en cuatro grafos ONNX: `embed.onnx` (tabla de embeddings de texto y códigos), `talker.onnx` (paso autorregresivo del talker con caché de claves/valores), `frame.onnx` (los 15 pasos del code predictor desenrollados, con muestreo top-k 50 interno) y `vocoder.onnx` (decodificador de códigos a audio).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión no incluye reentrenamiento: el bucle de generación (disposición del prompt, muestreo del primer código, penalización por repetición y criterios de parada) sigue el código oficial de `qwen-tts` y no forma parte de los grafos exportados. La innovación técnica destacable de esta versión es la cuantización int4 de las matrices del talker y del code predictor mediante `MatMulNBits`, que reduce el peso total a unos 2.2 GB manteniendo la inferencia en CPU.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Control de diseño de voz (*VoiceDesign*): el modelo base permite especificar características de la voz generada.
- Generación expresiva orientada a lectura en voz alta, según el caso de uso declarado por el autor de la conversión (editor de vídeo Eigami).
- Inferencia en CPU mediante ONNX Runtime, sin requerir GPU.
- Muestreo controlado: top-k 50 en el code predictor, con penalización por repetición y criterios de parada gestionados externamente al grafo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo más allá del inglés.

## Casos de uso

- Lectura en voz alta de artículos y documentos: el modelo genera audio expresivo a partir de texto plano, adecuado para convertir boletines o entradas de blog en versiones de audio sin infraestructura GPU.
- Doblaje y narración para edición de vídeo: el autor lo emplea como voz de lectura en su editor; puede integrarse en pipelines de postproducción para generar pistas de narración con estilo controlado.
- Accesibilidad: conversión de contenido textual a voz para lectores de pantalla o aplicaciones de asistencia, ejecutándose en el propio portátil del usuario gracias a los ~3 GB de memoria requeridos.
- Prototipado de asistentes de voz: al ejecutarse en CPU con ONNX Runtime, permite iterar sobre el diseño de la voz y el texto de entrada en entornos de desarrollo sin GPU.
- Generación de audiolibros y pódcast: síntesis por lotes de capítulos o guiones en inglés, con control del estilo de voz mediante el mecanismo VoiceDesign del modelo base.
- Pruebas de integración en aplicaciones de escritorio: los cuatro grafos ONNX pueden embeberse en aplicaciones nativas o de escritorio mediante ONNX Runtime, sin dependencias de frameworks de deep learning pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica únicamente un rendimiento aproximado de tiempo real en una CPU de portátil reciente mediante ONNX Runtime, sin cifras concretas de latencia ni throughput.

## Requisitos de hardware

- Memoria estimada: aproximadamente 3 GB de RAM para la inferencia (repositorio de 2.2 GB).
- GPU: no requerida; el modelo está diseñado para CPU mediante ONNX Runtime. No se documentan requisitos ni rendimiento en GPU.
- Cabe en cualquier portátil reciente con al menos 3-4 GB de memoria libre; no se especifican modelos de CPU concretos.
- Despliegue: ONNX Runtime (único runtime documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: aproximadamente tiempo real en una CPU de portátil reciente, según el autor; sin cifras detalladas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Ejecución en CPU |
|---|---|---|---|---|---|
| eigami/qwen3-tts-voicedesign-onnx (esta ficha) | 1.7B (base) | ONNX | int4 | Apache-2.0 | Sí, ~tiempo real |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1.7B | no disponible | no disponible | Apache-2.0 | no disponible |
| Alternativas de TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base original de Qwen, del que esta versión es una conversión cuantizada. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta multilingüismo.
- Al ser una cuantización int4, puede existir una degradación de calidad de audio respecto a los pesos originales en fp16; no se cuantifica en la model card.
- El bucle de generación (prompt, muestreo, penalización, parada) no está incluido en los grafos: debe implementarse por separado siguiendo el código oficial de `qwen-tts`, lo que añade complejidad de integración.
- Riesgo de alucinación y artefactos en la síntesis de voz ante entradas atípicas, textos muy largos o caracteres no ingleses; no se documentan evaluaciones al respecto.
- No se documentan sesgos conocidos del modelo base ni evaluaciones de robustez.
- Licencia Apache-2.0 permite uso comercial, pero al ser una obra derivada de los pesos de Qwen, deben conservarse los avisos de copyright de Alibaba Qwen team.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- No se dispone de información sobre el contexto máximo de texto de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eigami/qwen3-tts-voicedesign-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
