# chenzs/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) desarrollado por OpenBMB, publicado en Hugging Face bajo el identificador `chenzs/VoxCPM2`. Se trata de un modelo de 2.290.004.544 parámetros (aproximadamente 2B) que emplea una arquitectura de difusión autorregresiva sin tokenizador, construida sobre el backbone MiniCPM-4. Su propuesta principal es cubrir síntesis multilingüe en 30 idiomas, diseño de voz a partir de descripciones en lenguaje natural y clonación de voz controlable, todo ello con salida de audio a 48 kHz.

El modelo resuelve el problema de generar voz de alta fidelidad sin depender de un tokenizador de audio discreto, usando un esquema de difusión autorregresiva (LocEnc → TSLM → RALM → LocDiT) junto con un AudioVAE V2 de codificación/decodificación asimétrica que acepta referencias a 16 kHz y produce salida a 48 kHz mediante superresolución integrada. Está entrenado sobre más de 2 millones de horas de habla multilingüe y declara soporte de streaming en tiempo real con un RTF de aproximadamente 0,30 en una RTX 4090.

Su relevancia actual radica en que combina clonación de voz, diseño de voz por descripción y cobertura de 30 idiomas (incluidos dialectos del chino) bajo licencia Apache-2.0, lo que lo hace apto para uso comercial. La información pública disponible no incluye tablas de benchmarks detalladas en la model card, que remite al repositorio de GitHub para los resultados completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone MiniCPM-4 |
| Parametros totales | 2.290.004.544 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (secuencia máxima del LM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 30 idiomas: ar, my, zh, da, nl, en, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi; además de dialectos del chino (sichuanés, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 5,0 GB), dtype bfloat16 |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de difusión autorregresiva sin tokenizador de audio. La arquitectura se organiza en cuatro componentes según la model card: LocEnc (codificador local), TSLM (modelo de lenguaje a nivel de token), RALM (modelo autorregresivo) y LocDiT (difusión local). El backbone está basado en MiniCPM-4 y suma 2B parámetros en total. El modelo de lenguaje opera a una tasa de 6,25 Hz y admite secuencias de hasta 8192 tokens.

El componente de audio es un AudioVAE V2 con codificación y decodificación asimétricas: acepta audio de referencia a 16 kHz y genera salida a 48 kHz gracias a una superresolución integrada, sin necesidad de un upsampler externo. El entrenamiento se realizó sobre más de 2 millones de horas de habla multilingüe. La información proporcionada no detalla la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card menciona una sección de fine-tuning que aparece truncada.

## Capacidades

- Generación de voz multilingüe en 30 idiomas sin necesidad de etiqueta de idioma: el texto de entrada se procesa directamente en cualquiera de los idiomas soportados.
- Diseño de voz (voice design): genera una voz nueva a partir de una descripción en lenguaje natural entre paréntesis (género, edad, tono, emoción, ritmo), sin audio de referencia.
- Clonación de voz básica a partir de un clip corto de referencia.
- Clonación controlable: permite modular emoción, ritmo y expresión manteniendo el timbre de la voz clonada mediante guías de estilo.
- Clonación de alta fidelidad ("ultimate cloning"): requiere audio de referencia y su transcripción exacta, reproduciendo matices vocales con mayor similitud.
- Síntesis consciente del contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Streaming en tiempo real mediante `generate_streaming`.
- Salida de audio a 48 kHz con superresolución integrada desde referencias de 16 kHz.
- Soporte de dialectos del chino (sichuanés, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo específico de TTS.

## Casos de uso

- Doblaje y localización de contenidos: el modelo cubre 30 idiomas y permite mantener un timbre de voz consistente mediante clonación, lo que facilita doblar vídeos o audiolibros a varios idiomas conservando la identidad vocal del hablante original.
- Audiolibros y narración: con 8192 tokens de contexto y síntesis consciente del contexto, puede narrar pasajes largos infiriendo prosodia adecuada al contenido, y el streaming permite empezar a reproducir antes de completar la generación.
- Asistentes de voz en producción: el RTF de ~0,30 en RTX 4090 (y ~0,13 con Nano-VLLM) y el modo streaming lo hacen apto para respuestas habladas de baja latencia en atención al cliente o interfaces conversacionales.
- Creación de voces sintéticas para personajes: la función de voice design permite generar voces nuevas a partir de descripciones (por ejemplo, "mujer joven, voz suave y dulce") sin disponer de grabaciones, útil en videojuegos, animación y pódcasts.
- Accesibilidad: conversión de texto a voz de alta calidad (48 kHz) para lectores de pantalla y aplicaciones de asistencia, con clonación de la propia voz del usuario a partir de una muestra corta.
- Prototipado de contenido publicitario: generación rápida de locuciones con control de emoción y ritmo mediante guías de estilo, sin necesidad de estudio de grabación.
- Investigación en TTS: al ser Apache-2.0 y estar disponible en safetensors con la librería `voxcpm`, sirve como base para fine-tuning y experimentación en clonación y síntesis multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que VoxCPM2 alcanza resultados state-of-the-art o competitivos en benchmarks de TTS zero-shot y controlable (Seed-TTS-eval, CV3-eval, InstructTTSEval, MiniMax Multilingual Test), pero remite las tablas completas al repositorio de GitHub, sin incluirlas en el texto proporcionado.

Los únicos datos de rendimiento disponibles son de latencia: RTF de ~0,30 en NVIDIA RTX 4090 y ~0,13 con aceleración mediante Nano-VLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB según la model card.
- GPU recomendadas: NVIDIA RTX 4090 para el RTF indicado (~0,30); no se especifican requisitos para A100 o H100 en la información disponible.
- Cabe en GPU de consumo: sí, con ~8 GB de VRAM es compatible con tarjetas de gama alta de consumo como la RTX 4090; no se detalla compatibilidad con modelos inferiores.
- Opciones de despliegue: librería `voxcpm` (pip install voxcpm), con requisitos de Python ≥ 3.10, PyTorch ≥ 2.5.0 y CUDA ≥ 12.0; aceleración mediante Nano-VLLM (repositorio `a710128/nanovllm-voxcpm`). No se mencionan vLLM estándar, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF ~0,30 en RTX 4090 en modo estándar y ~0,13 con Nano-VLLM; soporte de streaming para reducir latencia percibida.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de TTS comparables (parámetros, contexto, rendimiento o licencia) que permitan elaborar una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información proporcionada; al entrenarse con más de 2 millones de horas de habla multilingüe, es plausible que herede sesgos de acento, género y registro de los datos, pero no hay confirmación explícita.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero sí existe riesgo de prosodia incorrecta o pronunciación defectuosa en textos ambiguos, idiomas de bajos recursos o dialectos.
- La cobertura de 30 idiomas no implica calidad homogénea; la model card no desglosa el rendimiento por idioma.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del desplegador aplicar controles de consentimiento y marcas de agua.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones adicionales documentadas.
- La sección de fine-tuning de la model card aparece truncada en la información disponible, por lo que no se detallan procedimientos ni limitaciones de ajuste fino.
- No se especifican tipos de cuantización soportados, lo que limita la planificación de despliegues con menor VRAM.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-08; se trata de una publicación reciente con poca validación comunitaria en ese identificador.

## Enlaces

- Hugging Face: https://huggingface.co/chenzs/VoxCPM2
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Mirror en Hugging Face: https://huggingface.co/ArchiveStudio/VoxCPM2
