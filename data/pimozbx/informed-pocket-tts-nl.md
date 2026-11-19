# PimoZbx/informed-pocket-tts-nl

## Resumen

Pocket TTS Dutch (ONNX) es una conversión al formato ONNX del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante para neerlandés (`languages/dutch`) y sin capacidad de clonación de voz. Lo publica el usuario PimoZbx y está pensado para la lectura en voz alta en el dispositivo dentro de la aplicación Informed. El modelo base es `kyutai/pocket-tts-without-voice-cloning`, un sistema text-to-speech ligero de Kyutai Labs.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un lanzamiento con benchmarks, sino de un artefacto de despliegue. El interés técnico está en el formato: el modelo se ha dividido en dos grafos ONNX (el flow language model y el decodificador Mimi), con cuantización dinámica int8 de las multiplicaciones de matrices y con los prompts de voz predefinidos almacenados como cachés KV en float16. Eso permite inferencia en streaming con estado explícito, adecuada para entornos sin GPU y para ejecución local.

El repositorio ocupa 0,2 GB y solo soporta neerlandés. No hay información publicada sobre el número de parámetros, la longitud de contexto textual ni resultados de evaluación. La licencia es CC BY 4.0, heredada del modelo original de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en dos etapas: flow language model (generación de latentes) + decodificador Mimi (latentes a audio); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el flow LM usa una caché KV como buffer circular de 512 posiciones) |
| Tipos de cuantizacion | int8 dinámica en las MatMuls del flow LM; float32 en el decodificador Mimi; float16 en los prompts de voz |
| Idiomas soportados | neerlandés (nl) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`flow_lm.onnx`, `mimi_decoder.onnx`), prompts de voz en `.bin` (float16 little-endian), `tokenizer.json` (Unigram) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Pocket TTS de Kyutai: un flow language model que recibe tokens de texto y/o el latente anterior y produce el siguiente latente, junto con un decodificador Mimi que convierte cada trama latente de 80 ms en 1920 muestras de audio a 24 kHz. La conversión a ONNX separa ambos componentes en grafos independientes con estado de streaming explícito de entrada y salida: la caché KV del flow LM se gestiona como un buffer circular de 512 posiciones y el decodificador arrastra su propio estado en float32.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus neerlandés, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. La model card solo documenta los cambios introducidos por la conversión: exportación a ONNX, cuantización dinámica int8 de las MatMuls del flow LM y almacenamiento de los prompts de voz en float16. El tokenizador Unigram se mantiene sin cambios respecto al original.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés a partir de texto.
- Generación de audio en streaming: el decodificador emite tramas de 80 ms (1920 muestras a 24 kHz) de forma incremental.
- Cuatro voces predefinidas incluidas como prompts: daan, marius, eve y vera.
- Ejecución en dispositivo mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Sin clonación de voz: los pesos no permiten codificar voces nuevas, tal como indica explícitamente la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura en voz alta dentro de una aplicación móvil: es el caso para el que se creó esta conversión; el formato ONNX y la cuantización int8 permiten ejecutar la síntesis en el propio dispositivo de la app Informed sin enviar texto a un servidor.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o apps de lectura que necesiten convertir artículos y documentos en audio neerlandés con baja latencia gracias al streaming por tramas de 80 ms.
- Aprendizaje de neerlandés: generación de audio de pronunciación para materiales didácticos, con cuatro voces distintas para variar la exposición del estudiante.
- Sistemas de navegación o asistencia por voz embebidos: al no requerir GPU ni conexión, encaja en dispositivos con recursos limitados que necesiten avisos hablados en neerlandés.
- Prototipado de interfaces conversacionales: el pipeline `text-to-speech` de Hugging Face y los grafos ONNX permiten montar un servicio TTS local para pruebas de UX sin coste de API.
- Prelectura de contenidos editoriales: conversión por lotes de artículos o boletines a audio neerlandés usando las voces predefinidas, con la ventaja de que el modelo completo ocupa 0,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de pequeño tamaño, no requiere GPU dedicada. Cualquier GPU consumer (por ejemplo, serie RTX 40) puede acelerar la inferencia vía ONNX Runtime con el provider CUDA, pero no hay datos publicados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (principal, con estado de streaming); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PimoZbx/informed-pocket-tts-nl | no disponible | no disponible | nl | CC BY 4.0 | ONNX |
| kyutai/pocket-tts-without-voice-cloning (base) | no disponible | no disponible | multilingüe (incluye nl) | CC BY 4.0 | pesos originales de Kyutai |
| Alternativas TTS open source de pequeño tamaño | no disponible | no disponible | variable | variable | variable |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta neerlandés; no hay capacidades multilingües en esta conversión.
- No permite clonación de voz: únicamente están disponibles las cuatro voces predefinidas (daan, marius, eve, vera).
- No se han publicado evaluaciones de calidad de audio, naturalidad ni inteligibilidad; se desconoce el rendimiento real frente al modelo base.
- Al ser una conversión de un tercero (PimoZbx) y no un lanzamiento oficial de Kyutai, no hay garantías de mantenimiento ni de paridad exacta con el modelo original.
- La cuantización int8 dinámica de las MatMuls puede introducir degradación de calidad respecto a los pesos originales; no se documenta su magnitud.
- Riesgo de alucinación o artefactos de audio en entradas atípicas (texto muy largo, caracteres no neerlandeses, símbolos) no cuantificado.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a Kyutai y mención de los cambios realizados en la conversión.
- No se documentan sesgos del corpus de entrenamiento ni comportamiento con voces o acentos regionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PimoZbx/informed-pocket-tts-nl
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Repositorio de Pocket TTS de Kyutai: https://github.com/kyutai-labs/pocket-tts
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
