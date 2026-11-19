# LiquidAI/LFM3-Audio-2B-MLX-bf16

## Resumen

LFM3-Audio-2B-MLX-bf16 es la conversión a MLX en precisión BF16 del modelo LFM3-Audio-2B de Liquid AI, un modelo multimodal any-to-any de aproximadamente 1.980 millones de parámetros (1.977.548.032 exactos según los pesos safetensors) diseñado para tareas de audio y voz. Lo desarrolla Liquid AI, empresa conocida por sus modelos de arquitectura híbrida, y esta variante está específicamente empaquetada para ejecutarse en Apple Silicon mediante la librería MLX y el framework MLX-VLM.

El modelo resuelve el problema de procesar y generar audio de forma nativa en local: reconocimiento automático del habla (ASR), síntesis de voz (TTS) y conversación voz-a-voz con salida intercalada de texto y audio. Su relevancia actual radica en que permite desplegar un sistema de voz completo en hardware de consumo Apple (Macs con chip M-series) sin depender de APIs en la nube, manteniendo los pesos en BF16 y un códec de audio separado de 0,15 GB.

La variante MLX conserva los pesos en BF16 del checkpoint original y el códec de audio original. El repositorio ocupa 4,1 GB, de los cuales 3,96 GB corresponden a los pesos del modelo. Soporta 18 idiomas y se distribuye bajo licencia LFM 1.0 (lfm1.0), que no es de código abierto pleno y requiere revisión para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo any-to-any de audio de la familia LFM3; detalles en la model card original) |
| Parametros totales | 1.977.548.032 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta variante); otras cuantizaciones no disponibles en la informacion proporcionada |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX, BF16) + codec de audio en `audio_tokenizer/` |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura interna en la informacion proporcionada; la model card de esta variante remite a la model card del modelo original (LiquidAI/LFM3-Audio-2B) para la arquitectura y los detalles de uso. Por los tags y la pipeline (`any-to-any`, `audio`, `speech`, `lfm3_audio`) se trata de un modelo multimodal que acepta y emite audio, con un codec de audio independiente incluido en el repositorio (`audio_tokenizer/`, 0,15 GB). La familia LFM3 de Liquid AI se asocia a arquitecturas híbridas, pero no se confirma en la informacion disponible.

Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Esta variante MLX no reentrena el modelo: es una conversión de pesos a BF16 para MLX, manteniendo el codec original. La innovación práctica destacable es el empaquetado para inferencia on-device en Apple Silicon mediante MLX-VLM (versión 0.7.11 o superior), con soporte de salida de audio directa a fichero WAV.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe mediante prompts de sistema (por ejemplo, "Perform ASR in English.").
- Síntesis de voz (TTS) con selección de idioma y voz mediante prompt de sistema (por ejemplo, voz femenina en inglés americano).
- Conversación voz-a-voz con salida intercalada de texto y audio (speech-to-speech chat).
- Generación de audio controlable mediante parámetros de muestreo de audio: `audio_temperature`, `audio_top_k` y `audio_repetition_penalty` (valores por defecto en `generation_config.json`: 1.0, 128 y 1.1 respectivamente).
- Cobertura de 18 idiomas: inglés, árabe, danés, alemán, griego, finés, francés, hebreo, italiano, japonés, coreano, neerlandés, polaco, portugués, español, sueco, turco y chino.
- Ejecución local en Apple Silicon con MLX, sin dependencia de servicios en la nube.
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de visión o audio de entrada además de voz: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo realiza ASR con un prompt de sistema y temperatura 0, adecuado para dictado y actas en Macs con chip M-series sin enviar audio a terceros.
- Accesibilidad por voz: conversión de texto a voz para lectores de pantalla o asistentes personales, seleccionando idioma y voz mediante prompt de sistema y exportando la salida a WAV.
- Asistentes conversacionales por voz on-device: el modo speech-to-speech permite construir interfaces de voz con respuesta hablada y texto intercalado, útil en entornos con requisitos de privacidad.
- Prototipado de agentes de voz multilingües: con 18 idiomas cubiertos, sirve para validar flujos de atención al cliente o kioscos interactivos en fase de prueba antes de escalar a infraestructura mayor.
- Generación de doblaje y contenido de audio: la síntesis de voz controlable por parámetros de muestreo permite producir clips de audio en distintos idiomas para vídeos o podcasts de forma local.
- Investigación en modelos de audio: al ser una conversión MLX reproducible con pesos BF16 y codec separado, facilita experimentos de evaluación de ASR/TTS y comparativas de decodificación de audio en hardware Apple.
- Desarrollo de aplicaciones macOS/iOS con MLX: integración en pipelines de MLX-VLM para añadir entrada y salida de voz a aplicaciones nativas del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: los pesos BF16 ocupan 3,96 GB y el codec de audio 0,15 GB; el repositorio completo ocupa 4,1 GB.
- Hardware objetivo: Apple Silicon (Macs con chip M-series) mediante MLX; no está pensado para GPUs NVIDIA en este formato.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para cargar ~4,1 GB de pesos más el estado de inferencia; no se especifica el mínimo exacto de memoria unificada.
- GPUs NVIDIA (A100, H100, RTX 4090): no aplicable a esta variante MLX; para esas plataformas habría que usar el checkpoint original.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior con `python -m mlx_vlm.generate`; el checkpoint original puede desplegarse con los frameworks que soporte su model card (no detallados aquí).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia estructural, esta variante se puede contrastar con el checkpoint original del que deriva:

| Modelo | Parametros | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|
| LFM3-Audio-2B-MLX-bf16 | ~2B | safetensors MLX BF16 | Apple Silicon | lfm1.0 |
| LFM3-Audio-2B (original) | ~2B | no disponible en esta ficha | multiplataforma (segun model card original) | lfm1.0 |

Comparativa con alternativas de otros fabricantes: no disponible.

## Limitaciones y advertencias

- Licencia LFM 1.0 (lfm1.0): no es una licencia de código abierto estándar; es necesario revisar los términos antes de cualquier uso comercial o redistribución.
- Variante específica para MLX: no es portable directamente a GPUs NVIDIA ni a otros runtimes sin reconvertir los pesos; para esos entornos debe usarse el checkpoint original.
- Dependencia de versión: requiere MLX-VLM 0.7.11 o superior; versiones anteriores pueden no cargar el modelo correctamente.
- Idiomas: aunque cubre 18 idiomas, no se documenta el rendimiento relativo por idioma; el español está soportado, pero la calidad por idioma no está cuantificada en la informacion disponible.
- Riesgo de alucinación en transcripción y síntesis: no se documentan tasas de error (WER) ni métricas de fidelidad; en producción conviene validar con muestras propias.
- Sesgos: no se documentan sesgos conocidos del modelo en la informacion proporcionada.
- Longitud de contexto: no disponible; planificar los flujos de audio largos con margen y troceado previo.
- Calidad de audio generado dependiente de parámetros: los valores por defecto (`audio_temperature=1.0`, `audio_top_k=128`, `audio_repetition_penalty=1.1`) pueden requerir ajuste para evitar artefactos o repeticiones.
- Uso en producción: al ser una conversión de pesos, cualquier cambio de comportamiento respecto al original debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-bf16
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
