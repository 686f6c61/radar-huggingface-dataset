# prithivMLmods/VoxCPM2-GGUF

## Resumen

VoxCPM2-GGUF es la versión cuantizada en formato GGUF del modelo VoxCPM2 de OpenBMB, un sistema de síntesis de voz (text-to-speech) de código abierto con aproximadamente 1.470 millones de parámetros (etiquetado comercialmente como "2B"). Se trata de un modelo de difusión autorregresiva "tokenizer-free" construido sobre el backbone MiniCPM-4 y entrenado con más de 2 millones de horas de audio multilingüe. Esta versión GGUF, publicada por prithivMLmods, permite ejecutar el modelo con llama.cpp (a través del binario `llama-tts`) en hardware de consumo, con cuantizaciones desde Q3_K_M (759 MB) hasta BF16 (2,95 GB).

El modelo resuelve el problema de la generación de voz de alta calidad con control fino: soporta clonación de voz a partir de clips cortos, diseño de voces nuevas a partir de descripciones en lenguaje natural y continuación de audio de alta fidelidad. Cubre 30 idiomas sin necesidad de etiquetas explícitas de idioma y genera audio a 48 kHz a partir de entradas de 16 kHz mediante un AudioVAE V2 asimétrico. Su licencia Apache-2.0 lo hace apto para uso comercial.

La relevancia de esta ficha radica en que combina un modelo TTS de última generación con un formato de despliegue ligero y portable (GGUF + llama.cpp), lo que reduce la barrera de entrada para integrar síntesis de voz multilingüe en aplicaciones locales o en producción con requisitos de VRAM moderados (en torno a 8 GB según la model card).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva tokenizer-free sobre backbone MiniCPM-4, con AudioVAE V2 asimétrico |
| Parametros totales | 1.471.744.128 (etiquetado como "2B") |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | 30 idiomas (zh, en, ar, my, da, nl, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi) y 9 dialectos chinos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj-bf16 para capacidades de audio/voz) |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de difusión autorregresiva sin tokenizador construido sobre el backbone MiniCPM-4. La arquitectura combina un decodificador autorregresivo con un proceso de difusión para la generación de audio, y emplea un AudioVAE V2 asimétrico que permite generar audio de calidad de estudio a 48 kHz a partir de entradas de 16 kHz. El modelo se entrenó con más de 2 millones de horas de datos de habla multilingüe, lo que sustenta su cobertura de 30 idiomas y 9 dialectos chinos sin necesidad de etiquetas explícitas de idioma.

La model card destaca tres capacidades de control: Voice Design (crear voces nuevas a partir de descripciones en lenguaje natural), Controllable Cloning (clonar voces desde clips cortos con control de estilo y emoción) y Ultimate Cloning (continuación de audio de alta fidelidad usando un clip de referencia y su transcripción). Además, el modelo admite ajuste fino con LoRA y ajuste completo con tan solo 5-10 minutos de datos, y soporta streaming en tiempo real con un Real-Time Factor de hasta ~0,13 usando Nano-vLLM. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en 30 idiomas sin etiquetas explícitas de idioma.
- Voice Design: generación de voces nuevas a partir de descripciones en lenguaje natural.
- Controllable Cloning: clonación de voz desde clips cortos con control de estilo y emoción.
- Ultimate Cloning: continuación de audio de alta fidelidad a partir de un clip de referencia y su transcripción.
- Generación de audio a 48 kHz de calidad de estudio desde entradas de 16 kHz.
- Streaming en tiempo real con Real-Time Factor de hasta ~0,13 (con Nano-vLLM).
- Ajuste fino con LoRA y ajuste completo con 5-10 minutos de datos.
- Soporte de despliegue vía llama.cpp mediante el binario `llama-tts` y fichero mmproj para audio.
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de propósito general).

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz de calidad de estudio a 48 kHz y permite diseñar voces nuevas mediante descripciones, lo que facilita crear narradores con timbre consistente a lo largo de horas de contenido.
- Doblaje y localización multilingüe: con 30 idiomas soportados y clonación de voz, se puede mantener la identidad vocal del hablante original mientras se genera el audio en otro idioma.
- Asistentes de voz para aplicaciones: el streaming en tiempo real (RTF ~0,13 con Nano-vLLM) permite integrar respuestas habladas de baja latencia en interfaces conversacionales.
- Accesibilidad y lectura de textos: conversión de documentos, artículos o notificaciones a voz con control de estilo y emoción para usuarios con discapacidad visual.
- Personalización de voces en videojuegos y contenidos interactivos: Voice Design permite crear voces de personajes únicas sin necesidad de grabaciones, y el ajuste fino con 5-10 minutos de datos permite adaptar el timbre a un personaje concreto.
- Generación de voces para podcasts y marketing: clonación controlable de una voz corporativa y generación de variantes con distinto tono o emoción para campañas segmentadas.
- Prototipado local en hardware de consumo: la cuantización Q4_K_M (916 MB) permite ejecutar el modelo en portátiles con llama.cpp sin GPU dedicada de gama alta, útil para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 8 GB según la model card del autor (para el modelo completo en BF16 con proyector multimodal).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el ejemplo de la model card usa `-ngl 99` para descargar todas las capas en GPU con backend CUDA.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3-Q8 (entre 759 MB y 1,57 GB de pesos), lo que permite ejecución en GPUs consumer con suficiente VRAM; el fichero BF16 pesa 2,95 GB y el mmproj-bf16 2,01 GB.
- Opciones de despliegue: llama.cpp mediante el binario `llama-tts` (con backend CUDA), y Nano-vLLM para streaming en tiempo real.
- Latencia y throughput: Real-Time Factor de hasta ~0,13 con Nano-vLLM según la model card; no se proporcionan cifras de throughput adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VoxCPM2-GGUF (esta ficha) | ~1,47 B | no disponible | 30 + 9 dialectos | Apache-2.0 | GGUF |
| openbmb/VoxCPM2 (modelo base) | ~1,47 B | no disponible | 30 + 9 dialectos | Apache-2.0 | safetensors (no confirmado en la información) |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con más de 2 millones de horas de habla, es probable que herede sesgos de acento, género y registro del corpus, pero no se detalla.
- Riesgo de alucinación: en TTS el riesgo se traduce en prosodia incorrecta, pronunciación errónea o artefactos en textos fuera de distribución; no se cuantifica en la información disponible.
- Limitaciones de contexto o idioma: aunque cubre 30 idiomas, no se especifica la calidad relativa por idioma; los dialectos chinos son 9 y el resto de idiomas puede tener cobertura desigual.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/VoxCPM2 y de los datos de entrenamiento originales.
- Caveats para producción: el uso de clonación de voz exige consentimiento explícito del hablante y cumplimiento de la normativa de protección de datos y de identidad; el despliegue con llama.cpp requiere compilar el target `llama-tts` y disponer del fichero mmproj-bf16 para las capacidades de audio.
- La cuantización Q3_K_M puede degradar la calidad de la voz; para producción se recomienda Q5_K_M, Q6_K o Q8_0.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/VoxCPM2-GGUF
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficheros GGUF: https://huggingface.co/prithivMLmods/VoxCPM2-GGUF/tree/main
- Perfil del autor: https://huggingface.co/prithivMLmods
