# mathigatti/piper-es_AR-daniela-medium

## Resumen

Piper voice es_AR daniela (medium) es un modelo de síntesis de voz (text-to-speech) para castellano de Argentina (variante rioplatense), desarrollado por el usuario mathigatti y publicado en Hugging Face. Se trata de una voz femenina de una sola hablante, distribuida en formato ONNX y diseñada para ejecutarse con el motor Piper (versión 1.5 o superior), un sintetizador ligero orientado a inferencia en tiempo real sobre hardware modesto.

El modelo es una destilación de conocimiento de la voz oficial `es_AR-daniela-high`: misma hablante, pero con una red más pequeña que reduce el coste computacional aproximadamente 5 veces. Según la model card, la voz high consume ~2,8 veces el tiempo real en una Raspberry Pi 4, mientras que esta versión medium se sitúa en ~0,5 veces el tiempo real, lo que la hace viable para despliegues embebidos y aplicaciones de asistencia por voz en dispositivos de bajos recursos.

Su relevancia actual radica en cubrir el hueco de voces TTS argentinas ligeras y de licencia abierta (CC BY-SA 4.0), pensadas para integrarse en asistentes locales, sistemas de accesibilidad o pipelines de generación de audio sin depender de servicios en la nube. No es un modelo de lenguaje: es un sintetizador acústico neuronal que transforma fonemas en audio a 22.050 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal TTS de Piper (VITS-like, según el motor piper1-gpl); no se detalla la topología exacta en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de texto de longitud variable, sin límite declarado) |
| Tipos de cuantización | no disponible (pesos ONNX; no se listan variantes de cuantización) |
| Idiomas soportados | es (castellano, variante es_AR, rioplatense) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (modelo `.onnx` para Piper) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del motor Piper (repo `OHF-Voice/piper1-gpl`), un sintetizador neuronal ligero que convierte texto a fonemas mediante espeak-ng (fonemizador `es-419`) y genera audio a 22.050 Hz. La model card no detalla la topología interna (capas, dimensión oculta, mecanismo de atención), por lo que no es posible especificarla con rigor; se describe como una red "medium", más pequeña que la variante high de la que deriva.

El entrenamiento es de destilación de conocimiento: se generaron aproximadamente 3.000 frases en castellano procedentes de Tatoeba, locutadas por la voz `es_AR-daniela-high`, y se entrenó una red medium para imitar esa salida. El punto de partida fue el checkpoint `es_MX-ald-medium` (época 3799), afinado con piper1-gpl hasta la época 3849, seleccionada por evaluación automática (transcripción con Whisper de una frase de test comparada con el texto original, similitud 0,97). El entrenamiento se realizó en una única NVIDIA T4 (Google Colab) durante aproximadamente 7 horas. No se menciona uso de RLHF ni DPO, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz femenina en castellano rioplatense (es_AR) a partir de texto.
- Salida de audio mono a 22.050 Hz.
- Fonemización mediante espeak-ng con variante `es-419`, adecuada para castellano latinoamericano.
- Ejecución en tiempo real en hardware de bajos recursos (Raspberry Pi 4 a ~0,5× tiempo real).
- Integración con el ecosistema Piper (`piper-tts`), incluyendo CLI y uso programático.
- Una única hablante (no multihablante, no clonación de voz).
- No soporta tool calling, agentes, visión ni audio de entrada: es exclusivamente TTS.
- Capacidad multilingüe limitada: solo castellano; las palabras en otros idiomas se pronuncian con reglas ortográficas españolas.

## Casos de uso

- Asistentes de voz locales en Raspberry Pi: el modelo corre a ~0,5× tiempo real en una Pi 4, lo que permite respuestas habladas en asistentes domésticos sin conexión a internet ni APIs externas.
- Accesibilidad y lectura de pantalla: integración en lectores de pantalla o aplicaciones de accesibilidad para usuarios argentinos, con pronunciación rioplatense natural y latencia baja en CPU.
- Generación de audiolibros y pódcast: síntesis por lotes de textos largos con una voz femenina consistente, a 22.050 Hz, suficiente para contenido hablado.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados (transporte, comercios, aeropuertos) con acento argentino, ejecutables en dispositivos embebidos.
- Pruebas y prototipado de pipelines de voz: al ser ONNX y ligero, sirve como componente TTS en prototipos de agentes conversacionales antes de escalar a modelos mayores.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación rioplatense para materiales didácticos, con la advertencia de que las palabras extranjeras requieren retranscripción manual.
- Videojuegos y experiencias interactivas: diálogos de personajes en tiempo real en hardware modesto, sin coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas cualitativas y operativas:

| Métrica | Valor |
|---|---|
| Similitud de evaluación automática (Whisper vs. texto original) | 0,97 |
| Velocidad en Raspberry Pi 4 (este modelo) | ~0,5× tiempo real |
| Velocidad en Raspberry Pi 4 (es_AR-daniela-high) | ~2,8× tiempo real |
| Frecuencia de muestreo | 22.050 Hz |
| Frases de entrenamiento | ~3.000 (Tatoeba) |
| Hardware de entrenamiento | 1× NVIDIA T4, ~7 horas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe holgadamente en memoria de cualquier GPU consumer.
- GPU recomendadas: no es necesario GPU; el modelo está pensado para CPU. Cualquier GPU (RTX 4090, A100, H100) lo ejecutaría con latencia muy baja, pero no se publican cifras.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (e incluso en iGPU), dado el tamaño del repositorio (0,1 GB).
- CPU: funciona en Raspberry Pi 4 a ~0,5× tiempo real; en CPUs de escritorio la latencia será considerablemente menor.
- Opciones de despliegue: Piper (`piper-tts`, CLI `python -m piper`), integración vía ONNX Runtime; no se documentan despliegues con vLLM, TGI o llama.cpp (no aplican a TTS).
- Latencia y throughput: solo se conoce la cifra de ~0,5× tiempo real en Raspberry Pi 4; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Idioma | Calidad | Velocidad en Raspberry Pi 4 | Licencia | Formato |
|---|---|---|---|---|---|
| mathigatti/piper-es_AR-daniela-medium (este) | es_AR | medium | ~0,5× tiempo real | CC BY-SA 4.0 | ONNX |
| es_AR-daniela-high (larcanio / rhasspy) | es_AR | high | ~2,8× tiempo real | CC BY-SA 4.0 (heredada de OpenSLR 61) | ONNX |
| es_MX-ald-medium (rhasspy) | es_MX | medium | no disponible | Unlicense (dataset de rmcpantoja) | ONNX |

La comparativa se limita a las voces Piper citadas en la model card; no se dispone de datos de otros motores TTS (Coqui, XTTS, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Calidad inferior a la voz high original: es una red más pequeña destilada, con el trade-off explícito de velocidad frente a fidelidad.
- Pronunciación de palabras extranjeras incorrecta: Piper aplica reglas ortográficas españolas ("chillhop" → "chi yop"); se recomienda retranscribir fonéticamente antes de sintetizar.
- Entrenamiento con datos sintéticos y corpus pequeño (~3.000 frases de Tatoeba): cobertura limitada de vocabulario, nombres propios y dominios especializados.
- Una sola hablante: no permite cambio de voz ni clonación.
- Riesgo de artefactos y prosodia imperfecta en frases largas o con puntuación atípica; la model card no documenta pruebas sistemáticas de robustez.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las obligaciones de compartir-al-igual en productos propietarios.
- Requiere Piper 1.5 o superior; versiones anteriores pueden no cargar el modelo correctamente.
- No se documentan sesgos específicos, pero al derivar de un corpus de una única hablante y de Tatoeba, la variedad dialectal y de registros es reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mathigatti/piper-es_AR-daniela-medium
- Motor Piper (piper1-gpl): https://github.com/OHF-Voice/piper1-gpl
- Voz original es_AR-daniela-high: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_AR/daniela/high
- Modelo base es_MX-ald-medium: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX/ald/medium
- Voces Piper de larcanio: https://huggingface.co/larcanio/piper-voices
- Dataset OpenSLR 61 (castellano argentino): https://www.openslr.org/61/
- Tatoeba: https://tatoeba.org
