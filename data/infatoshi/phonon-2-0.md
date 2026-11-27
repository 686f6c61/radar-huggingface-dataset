# Infatoshi/phonon-2.0

## Resumen

Phonon 2.0 es un modelo unificado de reconocimiento de voz (speech-to-text) y dictado consciente del contexto, desarrollado por Infatoshi. Combina un codificador de audio de 24 capas derivado de Qwen3-ASR-1.7B (12,5 Hz, 2048 dimensiones) con un decodificador MoE con bucles ("looped MoE") podado y fusionado mediante LoRA, basado en Inkling-2-Mini. El decodificador conserva 80 expertos de los 128 originales (E=80) con 4 expertos activos por token (k=4) y tres pasadas de bucle, lo que reduce el coste de inferencia manteniendo capacidad de modelado.

El modelo resuelve el problema del dictado tecnico en entornos locales: transcribe audio en el idioma hablado sin traducir, admite vocabulario de dominio y contexto en pantalla como pistas de ortografia, y esta entrenado especificamente para reducir falsos positivos en terminos tecnicos. Es relevante por su enfoque en despliegue local (pesos NVFP4 para expertos y BF16 para atencion, normas y router) y por su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

El repositorio ocupa 14,0 GB y soporta cinco idiomas (ingles, espanol, frances, aleman y portugues). La model card reporta un WER del 8,17% en un conjunto de validacion personal con microfono real y del 8,36% en charlas tecnicas de conferencia, datos que situan al modelo en un rango competitivo para dictado especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio transformer (Qwen3-ASR-1.7B, 24 capas) + decodificador MoE con bucles (Inkling-2-Mini podado, E=80, k=4, 3 pasadas de bucle) |
| Parametros totales | no disponible (repo de 14,0 GB; decodificador NVFP4 de ~13 GB) |
| Parametros activos | 4 expertos por token (k=4) sobre 80 expertos conservados de 128; 1,54 GB/token a 4 bits |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos del decodificador; BF16 en atencion, normas y router; safetensors sin cuantizar en adaptadores |
| Idiomas soportados | en, es, fr, de, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (decoder_e80_nvfp4, audio_tower, projector, adapter_e80); config.json, tokenizer.json, tiktoken/ |

## Arquitectura y entrenamiento

La arquitectura es hibrida y modular: un codificador de audio de 24 capas (Qwen3-ASR-1.7B, salida a 12,5 Hz con 2048 dimensiones) alimenta un proyector `AudioProjector` de 2048 a 2304 con activacion GELU, que inyecta las representaciones acusticas en un decodificador MoE con bucles. El decodificador parte de Inkling-2-Mini, al que se le ha eliminado la torre de vision, se han podado los expertos de 128 a 80 (con mapa de indices por capa en `masks_e80_ml.json`) y se ha fusionado un adaptador LoRA. Cada token activa 4 expertos y el decodificador realiza 3 pasadas de bucle, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros.

El entrenamiento se realizo en dos fases: primero un ajuste supervisado sobre 1.509,7 horas (684.936 clips) de voz limpia mas 200,0 horas de habla real de desarrolladores; despues, un entrenamiento con GRPO de dos brazos (entidades/diccionario grande y restriccion negativa/multilingue) seguido de weight souping. La model card describe el proceso como "clean-room zero-Kokoro", es decir, sin datos sinteticos de Kokoro. El modelo incluye un prompt de sistema por defecto que instruye transcribir en el idioma exacto hablado sin traducir, y admite pistas de vocabulario de dominio y contexto en pantalla anadidas al prompt.

## Capacidades

- Transcripcion de voz a texto en ingles, espanol, frances, aleman y portugues, sin traduccion automatica entre idiomas.
- Dictado consciente del contexto: acepta listas de vocabulario de dominio y contexto en pantalla como referencia de ortografia.
- Restriccion negativa: el modelo esta entrenado para ignorar terminos de vocabulario que no se han pronunciado, con 0,5 falsos positivos por cada 100 clips en la prueba NEG.
- Manejo de habla tecnica y de conferencia, con entrenamiento especifico sobre charlas tecnicas reales.
- Robustez ante acentos y ruido: la suite hard500 incluye subconjuntos de acento africano, multilingue y ruido SVQ.
- Salida estable sin anomalias de bucle: la model card reporta 0 early-EOS y 0 bucles de salto de linea en 600 clips.
- No dispone de torre de vision (eliminada del decodificador base) ni de capacidades de audio generativo; es exclusivamente audio-texto.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Dictado tecnico para desarrolladores: el modelo transcribe nombres de funciones, APIs y terminos de dominio si se anaden al prompt de sistema, reduciendo correcciones manuales en editores de codigo y documentacion.
- Actas de conferencias tecnicas: con un WER del 8,36% en charlas reales de conferencia, es adecuado para generar transcripciones de ponencias y paneles con terminologia especializada.
- Subtitulado multilingue local: al soportar cinco idiomas y no traducir, permite generar subtitulos en el idioma original para contenido en ingles, espanol, frances, aleman y portugues sin enviar audio a la nube.
- Atencion al cliente con vocabulario controlado: las pistas de vocabulario de dominio permiten fijar nombres de productos y terminos internos, y la restriccion negativa evita que el modelo invente terminos no pronunciados.
- Documentacion clinica o legal dictada: el contexto en pantalla como referencia de ortografia ayuda a transcribir nombres propios y terminos especializados, con la ventaja de ejecucion local para datos sensibles.
- Investigacion en ASR: los archivos `adapter_e80.safetensors` y `masks_e80_ml.json` permiten reanudar el ajuste fino y estudiar el efecto de la poda de expertos y del bucle en el rendimiento.
- Sistemas de accesibilidad offline: al ser un modelo local con licencia Apache 2.0, puede integrarse en herramientas de dictado para usuarios con movilidad reducida sin dependencia de servicios externos.

## Benchmarks y rendimiento

| Conjunto de evaluacion | clips | WER |
|---|---|---|
| Holdout personal con microfono real | 80 | 8,17% |
| Charlas tecnicas de conferencia (ACL6060) | 100 | 8,36% |
| Charlas tecnicas, head-to-head en vivo | 20 | 6,32% |
| Suite hard500 (global) | 500 | 9,15% |
| hard500, subconjunto accent_afri | no disponible | 18,81% |
| hard500, subconjunto multiling_t1 | no disponible | 15,64% |
| hard500, subconjunto multiling_t1, espanol | no disponible | 9,69% |
| hard500, subconjunto noisy_svq | no disponible | 11,02% |

En la prueba de dictado tecnico guiado por contexto (GT2, 600 clips), el modelo obtiene VOC 95,6% CI / 94,0% CS con 0,0 falsos cambios, CLU 95,7% CI / 94,6% CS con 0,0 falsos cambios, y NEG 0,5 falsos cambios por 100 clips, con 0 early-EOS y 0 anomalias de bucle de salto de linea. La model card indica que el WER del holdout personal bajo del 16,03% en la version anterior E=64 al 8,17% en E=80.

## Requisitos de hardware

- VRAM estimada: el decodificador ocupa ~13 GB en NVFP4 y el codificador de audio ~606 MB, mas el proyector (~39 MB); se necesita al menos 14-16 GB de VRAM para cargar los pesos completos, con margen adicional para activaciones y cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia comoda; RTX 4080/4070 Ti Super (16 GB) queda al limite y puede requerir descarga por capas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 4080 Super (16 GB) con gestion cuidadosa de memoria; no se documenta en GPUs de 8-12 GB.
- Opciones de despliegue: no se especifican en la model card; los pesos estan en safetensors con configuracion propia (config.json, tokenizer.json, tiktoken/), por lo que el despliegue requiere el codigo de inferencia del autor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Phonon 2.0 | no disponible (E=80, k=4) | no disponible | en, es, fr, de, pt | Apache 2.0 | Dictado local con contexto y vocabulario de dominio |
| Qwen3-ASR-1.7B | 1,7 B (codificador) | no disponible | no disponible | Apache 2.0 | ASR generalista, base del codificador de Phonon 2.0 |
| Inkling-2-Mini | no disponible | no disponible | no disponible | Apache 2.0 | Decodificador MoE base, con torre de vision en el original |
| Whisper large-v3 | 1,55 B | 30 s por ventana | multilingue | MIT | ASR generalista, sin pistas de dominio nativas |

La comparacion con Whisper large-v3 es orientativa: no se dispone de resultados de benchmarks cruzados en la informacion proporcionada. Phonon 2.0 se diferencia por su soporte nativo de vocabulario de dominio y contexto en pantalla, y por su entrenamiento especifico en habla tecnica, mientras que Whisper ofrece una cobertura multilingue mas amplia y un ecosistema de despliegue mas maduro.

## Limitaciones y advertencias

- El WER se degrada en acentos no representados: 18,81% en el subconjunto accent_afri de hard500, frente al 9,15% global.
- El rendimiento en audio ruidoso baja al 11,02% de WER en noisy_svq, y en multilingue al 15,64% (9,69% en espanol).
- Solo cubre cinco idiomas; no se documenta soporte de otros idiomas ni de code-switching.
- No traduce: si el usuario espera traduccion, el modelo transcribira en el idioma original por diseno.
- Riesgo de alucinacion en pasajes ambiguos o silencios; la model card reporta metricas de falsos positivos, pero no garantiza ausencia total de terminos inventados.
- El decodificador ha sido podado de 128 a 80 expertos y se ha eliminado la torre de vision, por lo que no puede realizar tareas multimodales de imagen.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los modelos base deben verificarse por separado; ambos se declaran Apache 2.0 en la model card.
- No se documentan requisitos de hardware, latencia ni opciones de despliegue estandar, lo que anade riesgo de integracion en produccion.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infatoshi/phonon-2.0
- Modelo base del decodificador: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo base del codificador de audio: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
