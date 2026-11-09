# BIGJUTT/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B es un modelo omni-modal desarrollado por Liquid AI que comprende texto, imágenes, vídeo y audio, y genera respuestas tanto en texto como en voz. Está diseñado para ejecutarse en dispositivo (on-device), con un tamaño de 1.728.801.600 parámetros, lo que lo sitúa en la gama de modelos compactos aptos para hardware de consumo. Esta ficha corresponde a la cuantización GGUF publicada por el usuario BIGJUTT, que permite su ejecución local mediante llama.cpp y herramientas compatibles.

El modelo pertenece a la familia LFM3 de Liquid AI y se caracteriza por su naturaleza any-to-any: acepta múltiples modalidades de entrada y produce salida textual y de voz. No es un modelo de razonamiento (non-reasoning), por lo que se recomienda decodificación greedy para texto. Su relevancia actual radica en la combinación de capacidades multimodales completas (audio, visión, vídeo) en un tamaño reducido y con licencia LFM 1.0, lo que facilita su despliegue en entornos locales y de borde.

La versión GGUF aquí documentada se distribuye en un repositorio de 13,9 GB e incluye los proyectores de visión y audio necesarios para el procesamiento multimodal. Soporta 23 idiomas, entre ellos el español, y está pensada para su uso con llama.cpp b11960 (v0.8.0) o superior, incluyendo conversaciones de voz en tiempo real a través de la API WebSocket `/v1/realtime`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omni-modal de la familia LFM3; detalles en la model card original) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (etiquetas de cuantización seleccionables; se menciona Q4_K_M en los ejemplos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna en la información proporcionada; la model card remite a la model card original de LiquidAI/LFM3-Omni-2B para los detalles de arquitectura. Se trata de un modelo omni-modal de la familia LFM3 de Liquid AI, diseñado para uso on-device, que procesa texto, imágenes, vídeo y audio como entrada y genera texto y voz como salida. El modelo base cuenta con 1.728.801.600 parámetros según los datos de safetensors.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card indica que es un modelo non-reasoning, con recomendaciones de muestreo concretas: decodificación greedy (temperatura 0) para salida de texto, y temperatura de audio 0,4 con penalización de repetición de audio 1,2 para salida de voz.

## Capacidades

- Comprensión multimodal de entrada: texto, imágenes, vídeo y audio.
- Generación de salida en texto y en voz (text-to-speech integrado).
- Reconocimiento automático del habla (ASR) mediante el prompt de sistema `Perform ASR in <language>.`
- Conversaciones de voz en tiempo real a través de la API WebSocket `/v1/realtime` de `llama serve`, incluyendo llamadas a herramientas.
- Soporte de tool calling / function calling (mencionado en el contexto de conversaciones de voz en tiempo real).
- Capacidades multilingües en 23 idiomas, incluyendo español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco.
- Modelo non-reasoning: no emplea modo de razonamiento extendido; se recomienda `--reasoning off` en llama.cpp.
- Capacidad any-to-any según el pipeline declarado.

## Casos de uso

- Asistencia por voz en dispositivo: el modelo puede mantener conversaciones de voz en tiempo real mediante la API `/v1/realtime` de `llama serve`, lo que permite integrarlo en asistentes locales que escuchan audio y responden con voz sintetizada sin depender de la nube.
- Transcripción de audio multilingüe: usando el prompt de sistema `Perform ASR in <language>.`, se puede emplear para transcribir reuniones, notas de voz o entrevistas en cualquiera de los 23 idiomas soportados, con procesamiento local.
- Descripción y análisis de imágenes: con entrada de imagen y salida de texto, resulta adecuado para tareas de accesibilidad (descripción de imágenes), moderación de contenido visual o extracción de información de capturas y documentos escaneados.
- Análisis de vídeo: al aceptar vídeo como entrada, puede emplearse para resumir contenido audiovisual, detectar eventos o generar descripciones de clips en pipelines de catalogación de medios.
- Interfaces conversacionales multimodales: combinando entrada de audio, imagen y texto, permite construir aplicaciones de atención al cliente o asistentes domésticos que interpretan lo que el usuario muestra y dice, y responden hablando.
- Procesamiento local con privacidad: al ejecutarse en CPU y GPU mediante llama.cpp, LM Studio u Ollama, es apto para escenarios donde los datos (audio, imágenes) no pueden salir del dispositivo, como entornos sanitarios o industriales.
- Prototipado rápido de aplicaciones any-to-any: su formato GGUF y su integración con Ollama (`ollama run lfm3-omni`), LM Studio y Llama.app facilitan la experimentación sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.728.801.600 parámetros, una cuantización Q4_K_M ocuparía aproximadamente 1 GB para los pesos del modelo, más el espacio adicional de los proyectores de visión y audio y de la caché KV.
- GPU recomendadas: no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: el tamaño del modelo (menos de 2.000 millones de parámetros) y su orientación on-device sugieren que es apto para GPU de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (b11960 / v0.8.0 o superior), `llama serve` con API compatible con OpenAI, `llama cli`, Llama.app (macOS y Windows, requiere llama.cpp v0.8.0 o superior), LM Studio (con motor llama.cpp 2.65.1 o superior, entrada de imagen), Ollama (`ollama run lfm3-omni`, versión v0.40.12 o superior, macOS, imagen y audio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo non-reasoning: no está diseñado para tareas que requieran cadenas de razonamiento extendidas; en llama.cpp debe usarse `--reasoning off`.
- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos generativos de este tamaño; se recomienda validación en producción.
- Sesgos conocidos: no se detallan en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; aunque soporta 23 idiomas, no se especifica el nivel de calidad por idioma.
- Restricciones de licencia: la licencia es LFM 1.0 (etiquetada como "other"), por lo que deben revisarse los términos del archivo LICENSE antes de un uso comercial.
- Compatibilidad de herramientas: requiere versiones mínimas específicas de llama.cpp (b11960 / v0.8.0), LM Studio (motor llama.cpp 2.65.1) y Ollama (v0.40.12); versiones anteriores pueden no soportar las entradas de audio o vídeo.
- El repositorio GGUF es una cuantización de terceros (BIGJUTT), no una publicación oficial de Liquid AI; la calidad de la cuantización y su mantenimiento dependen del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/BIGJUTT/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Llama.app: https://llama.app
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- llama.cpp (release v0.8.0): https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- llama.cpp (release b11960): https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Ollama (release v0.40.12): https://github.com/ollama/ollama/releases/tag/v0.40.12
