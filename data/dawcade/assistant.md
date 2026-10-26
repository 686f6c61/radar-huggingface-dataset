# Dawcade/assistant

# Dawcade/assistant

## Resumen

Dawcade/assistant no es un modelo único, sino un repositorio de distribución de los archivos que la aplicación Dawcade —un DAW móvil para Android, iPhone y iPad— descarga para ejecutar su asistente en el propio dispositivo. El paquete contiene un adaptador LoRA en formato GGUF (rank 16, f16) entrenado por Dawcade sobre conversaciones de herramientas propias de la app y pensado para aplicarse sobre `google/gemma-4-E4B-it-qat-q4_0-unquantized`, junto con los componentes de síntesis de voz: un FastPitch en-US de NVIDIA exportado a ONNX con pesos de 16 bits, el diccionario de pronunciación CMUdict en su revisión de NVIDIA NeMo y una lista de heterónimos.

La relevancia del repositorio es de ingeniería más que de investigación: documenta un patrón de empaquetado de IA on-device para móvil, con unpipeline declarado de text-to-speech, inferencia vía llama.cpp en el runtime de la app y verificación de integridad por SHA-256 de cada archivo antes de cargarlo. Los 34.881.536 parámetros que HuggingFace reporta a partir de safetensors corresponden a un componente del paquete, no al modelo base, que no se distribuye aquí.

El repositorio se publicó y actualizó el 26 de octubre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha. La licencia es mixta (`other`) y cada archivo arrastra su propia condiciones: Apache 2.0 para el adaptador derivado de Gemma 4, CC-BY 4.0 para el FastPitch de NVIDIA y BSD para el diccionario de la Universidad Carnegie Mellon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, f16) sobre transformer Gemma 4; componente TTS FastPitch (acústico no autorregresivo con predictor de duración y pitch) |
| Parametros totales | 34.881.536 (dato de safetensors reportado por HuggingFace; corresponde a un componente del repo, no al modelo base) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con QAT para el modelo base; LoRA en f16; ONNX con pesos de 16 bits para el TTS |
| Idiomas soportados | no disponible en la ficha; el componente TTS es exclusivamente en-US |
| Licencia | mixta (`other`): Apache 2.0 (LoRA derivado de Gemma 4), CC-BY 4.0 (FastPitch, NVIDIA), BSD (CMUdict, CMU), Apache 2.0 (lista de heterónimos, NVIDIA NeMo) |
| Formato de pesos | GGUF (`dawcade_lora.gguf`), ONNX (`tts/fastpitch.onnx`), TXT (diccionarios de pronunciación) |

Otros datos del repositorio: tamaño total de 0,2 GB, autor Dawcade, región `us`, pipeline declarada `text-to-speech`.

## Arquitectura y entrenamiento

El componente principal es un adaptador LoRA de rank 16 en f16 que se aplica después del turno de sistema en el runtime de llama.cpp de la aplicación. Se entrenó sobre las conversaciones de herramientas (tool conversations) propias de Dawcade, es decir, sobre diálogos en los que el asistente invoca funciones de la app; se trata por tanto de un ajuste de dominio cerrado, no de un modelo conversacional generalista. El adaptador se apoya en `google/gemma-4-E4B-it-qat-q4_0-unquantized`, una variante de Gemma 4 con cuantización Q4_0 entrenada con quantization-aware training; el repositorio no incluye los pesos del modelo base ni documenta su arquitectura interna, número de tokens de entrenamiento, composición del dataset o si hubo RLHF/DPO.

El segundo bloque es el motor de voz: FastPitch en-US de NVIDIA, entrenado originalmente sobre LJSpeech (dominio público, voces de Keith Ito y Linda Johnson), exportado a ONNX con pesos de 16 bits y adaptado por Dawcade para producir una voz robótica. La pronunciación se resuelve con CMUdict en la revisión de NVIDIA NeMo y con una lista de heterónimos, lo que sugiere un paso previo de conversión de texto a fonemas antes del modelo acústico. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, híbridos SSM) ni métricas de calidad del adaptador.

## Capacidades

- Ajuste fino de tipo LoRA para un asistente integrado en aplicación: el adaptador está entrenado específicamente sobre conversaciones con herramientas de la app Dawcade.
- Invocación de herramientas: el dominio de entrenamiento son tool conversations, por lo que el uso previsto es el function calling dentro del runtime de la aplicación.
- Síntesis de voz en inglés estadounidense (en-US) mediante FastPitch en ONNX, con salida transformada por la app en una voz de tipo robótico.
- Conversión de texto a fonemas para la síntesis: integra CMUdict (revisión NeMo 22.01) y una lista de heterónimos para desambiguar pronunciaciones.
- Inferencia totalmente local: el runtime declarado es llama.cpp para el adaptador y ONNX para el TTS, sin dependencia de servicios en la nube.
- Verificación de integridad por archivo: el repositorio publica hashes SHA-256 que la app comprueba antes de cargar cada componente.
- No consta soporte multilingüe, visión, audio de entrada, modo de razonamiento explícito ni capacidades de agente multi-paso más allá del bucle de herramientas que implemente la propia aplicación.

## Casos de uso

- Asistente de herramientas dentro de la app Dawcade: el LoRA se aplica tras el turno de sistema y el modelo selecciona funciones del DAW (crear pistas, ajustar parámetros, gestionar patrones). Es adecuado porque el adaptador se entrenó exactamente sobre ese tipo de conversaciones y se ejecuta en el mismo runtime que las invoca.
- Retroalimentación por voz en la aplicación: FastPitch convierte texto en audio en el dispositivo para confirmaciones, avisos y estado de la sesión, con latencia baja al no requerir red y con un timbre robótico intencionado que encaja con la estética de la app.
- Pronunciación correcta de terminología musical en inglés: el paso de fonemización con CMUdict y la lista de heterónimos evita errores en palabras con pronunciación ambigua antes de enviarlas al modelo acústico.
- Asistentes offline con requisitos de privacidad: al ejecutarse íntegramente on-device (llama.cpp y ONNX), ningún prompt ni audio del usuario necesita salir del teléfono, lo que simplifica el cumplimiento de RGPD en despliegues europeos.
- Distribución verificable de artefactos de IA en apps móviles: el patrón de fijar cada archivo y validarlo por SHA-256 antes de cargarlo sirve de plantilla para equipos que publican pesos en CDN y necesitan garantizar que el binario en el dispositivo es el esperado.
- Receta reproducible de adaptación de dominio: el par (LoRA rank 16 f16 + base Gemma 4 QAT Q4_0) documenta una configuración concreta y de bajo coste para ajustar un asistente de herramientas sobre un modelo ya cuantizado.
- Investigación sobre pipelines LLM + TTS en dispositivos móviles: el paquete permite medir el coste combinado de un adaptador GGUF y un modelo acústico ONNX en Android e iOS, un escenario poco cubierto por los benchmarks habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica del adaptador, ni evaluaciones de calidad del TTS (MOS, WER de fonemización) ni medidas de latencia en dispositivo.

## Requisitos de hardware

- Tamaño del repositorio completo: 0,2 GB, incluyendo adaptador LoRA, modelo ONNX de TTS y diccionarios de texto.
- El adaptador LoRA en f16 con rank 16 es, por construcción, un artefacto pequeño en comparación con el modelo base; el tamaño exacto del `.gguf` no está documentado en la información disponible.
- El modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized` no forma parte de este repositorio; su huella de VRAM no está documentada aquí. Como referencia aritmética y no como dato publicado, una cuantización de 4 bits sobre un modelo de ~4B parámetros efectivos (lectura sugerida por la nomenclatura E4B, sin confirmar) ocuparía del orden de 2-3 GB de pesos, más overhead de contexto y del runtime.
- GPU recomendadas: no disponible. El destino declarado no es una GPU de servidor sino un dispositivo móvil Android/iOS con aceleración por CPU y, previsiblemente, NNAPI/Core ML para el componente ONNX, extremo no confirmado en la ficha.
- Despliegue: llama.cpp para el adaptador GGUF (runtime declarado por el autor) y ONNX Runtime para FastPitch. No se mencionan vLLM, TGI, Ollama ni TensorRT-LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (paquetes de asistente on-device con LoRA + TTS). Se comparan a continuación los componentes con sus modelos de origen, con los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dawcade/assistant (paquete) | 34,9 M declarados en safetensors (componente del repo) | no disponible | Mixta: Apache 2.0 / CC-BY 4.0 / BSD | GGUF + ONNX + TXT | LoRA rank 16 específico de la app Dawcade, TTS en-US, orientado a móvil |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (base) | no disponible | no disponible | Apache 2.0 según el autor del LoRA | no disponible en este repo | Modelo base cuantizado con QAT; no se distribuye aquí |
| nvidia/tts_en_fastpitch (componente TTS) | no disponible | no aplica (TTS) | CC-BY 4.0 | Adaptado a ONNX de 16 bits | Entrenado sobre LJSpeech; voz en-US; requiere atribución a NVIDIA |

## Limitaciones y advertencias

- No es un modelo autónomo: es un paquete de artefactos heterogéneos (LoRA, ONNX, diccionarios de texto) con licencias distintas. Cualquier uso requiere revisar cada archivo por separado y no solo la etiqueta `other` del repositorio.
- La licencia mixta obliga a cumplir la atribución CC-BY 4.0 de NVIDIA para FastPitch y a conservar el aviso BSD del CMUdict; el uso comercial del conjunto exige verificar además los términos aplicables a los derivados de Gemma 4.
- El adaptador está entrenado sobre las conversaciones de herramientas de una aplicación concreta; se desconoce su comportamiento fuera de ese dominio y no hay evaluación pública que lo respalde.
- El componente de voz solo cubre inglés estadounidense y produce deliberadamente una voz robótica: no es adecuado para síntesis de voz natural ni para otros idiomas.
- No hay datos publicados de sesgos, tasas de alucinación, robustez multilingüe ni longitud de contexto soportada.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado con menos de un minuto de diferencia, por lo que no ha pasado por validación de la comunidad.
- Discrepancia de metadatos: la pipeline declarada es `text-to-speech` y el recuento de parámetros proviene de safetensors, pero los archivos listados son GGUF y ONNX. Conviene verificar las cifras antes de citarlas.
- Los hashes SHA-256 publicados permiten comprobar la integridad de los archivos, pero no sustituyen una auditoría del contenido ni del proceso de entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dawcade/assistant
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- FastPitch original de NVIDIA: https://huggingface.co/nvidia/tts_en_fastpitch
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio de la aplicación Dawcade: https://dawcade.com/
- Ficha en Google Play: https://play.google.com/store/apps/details?id=com.dawcade&hl=en-US
