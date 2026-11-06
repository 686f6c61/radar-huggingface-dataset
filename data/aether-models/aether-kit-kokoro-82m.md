# aether-models/aether-kit-kokoro-82m

## Resumen
Aether-Kit Kokoro-82M es una exportación del modelo de síntesis de voz Kokoro-82M de hexgrad, reempaquetado por aether-models para su uso dentro del ecosistema Aether-Kit como grafos "Core AI". No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original (revisión `f3ff3571`) al formato propietario de Aether-Kit, con las 54 voces incluidas y pesos en float32. El objetivo es permitir la inferencia de texto a voz en plataformas Apple (macOS e iOS) a través del runtime `AetherSpeech` (`kokoro@1`).

El modelo subyacente, Kokoro-82M, es un TTS compacto de 82 millones de parámetros, con licencia Apache-2.0 y pesos abiertos, conocido por ofrecer una calidad de audio competitiva con sistemas mucho más grandes a un coste computacional muy inferior. Esta exportación concreta mantiene esa base pero la adapta a un pipeline específico: la entrada son fonemas, no texto, y la conversión texto-fonema corre a cargo de la aplicación que integra el modelo.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un TTS listo para usar directamente desde Hugging Face, sino un artefacto de despliegue para una herramienta concreta. Quien busque un TTS multilingüe convencional debería acudir al modelo base; quien trabaje con Aether-Kit encontrará aquí una vía de integración en Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (detalles no disponibles; basada en Kokoro-82M) |
| Parametros totales | 82 M (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada en fonemas; decodificador con buckets de 64 a 4096 frames) |
| Tipos de cuantizacion | float32 (exportación); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el modelo base soporta varios idiomas; esta exportación no los declara) |
| Licencia | Apache-2.0 (versión modificada, ver `NOTICE`) |
| Formato de pesos | Grafos Core AI de Aether-Kit (`.aether/aether.json`), float32 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna de Kokoro-82M más allá de su naturaleza de modelo TTS neuronal de 82 millones de parámetros. Esta exportación concreta produce grafos Core AI que incluyen el módulo de duraciones y un decodificador organizado en buckets de 64 a 4096 frames, con pesos en float32. No se aportan datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO) del modelo original.

El proceso de exportación lo realiza el exportador Forge (`Forge/kokoro/`) de Aether-Kit y se ha validado ("gated") contra la implementación upstream en CPU, según el `export-report.json` referenciado en la model card. Se trata, por tanto, de una conversión de formato con verificación de equivalencia funcional, no de un reentrenamiento.

## Capacidades
- Síntesis de voz a partir de fonemas: la entrada es una secuencia de fonemas; la conversión texto-fonema es responsabilidad de la aplicación anfitriona.
- 54 voces incluidas en la exportación.
- Generación de audio con duraciones y decodificación en buckets de 64 a 4096 frames.
- Integración con el runtime `AetherSpeech` (`kokoro@1`) en macOS e iOS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.
- Capacidades multilingües: no disponibles en la información de esta exportación (el modelo base declara soporte de varios idiomas, pero no se enumeran aquí).

## Casos de uso
- Lectura de contenido en aplicaciones iOS: integración mediante `AetherSpeech` para narrar artículos, noticias o libros dentro de una app nativa, aprovechando las 54 voces y el tamaño reducido del modelo.
- Accesibilidad en macOS: síntesis de voz para lectores de pantalla o asistentes de accesibilidad, con latencia baja gracias a los 82 M de parámetros.
- Asistentes de voz locales: generación de respuestas habladas en un asistente que ya gestiona la conversión texto-fonema y solo necesita el motor acústico.
- Audiolibros y podcasts generados: producción de narraciones con distintas voces seleccionables, ejecutando el modelo en local sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: pruebas de UX de voz en macOS/iOS con un modelo ligero que no requiere GPU dedicada.
- Avisos y notificaciones habladas: síntesis de mensajes cortos en aplicaciones de productividad o domótica, donde el coste por inferencia y el consumo de memoria son críticos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible con precisión; con 82 M de parámetros en float32 el peso ronda los 0,33 GB, y el repositorio ocupa 0,4 GB, por lo que la inferencia cabe holgadamente en memoria unificada de dispositivos Apple.
- GPU recomendadas: no se especifican; el runtime objetivo es `AetherSpeech` en macOS e iOS (CPU/GPU Apple Silicon).
- Compatibilidad con GPU de consumo: por tamaño, es viable en cualquier GPU moderna, pero no se documentan requisitos oficiales ni soporte fuera de Apple.
- Opciones de despliegue: Aether-Kit (`AetherSpeech`, `kokoro@1`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la validación reportada se hizo en CPU contra la implementación upstream, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Aether-Kit Kokoro-82M | 82 M | no disponible | Apache-2.0 (modificada) | Hugging Face, formato Core AI | Solo macOS/iOS vía Aether-Kit; entrada en fonemas |
| hexgrad/Kokoro-82M | 82 M | no disponible | Apache-2.0 | Hugging Face, pesos abiertos | Modelo base; despliegue general, varias librerías |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias
- La entrada debe ser fonemas: el modelo no convierte texto a fonemas por sí mismo; sin un front-end adecuado no produce audio a partir de texto.
- Solo se ejecuta con el runtime `AetherSpeech` de Aether-Kit en macOS e iOS; no es portable a otros entornos sin trabajo adicional.
- Es una versión modificada del modelo base (ver `NOTICE`), por lo que puede diferir del comportamiento upstream fuera de los casos validados.
- No se declaran idiomas soportados en esta exportación; asumir cobertura multilingüe sin verificación es arriesgado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en TTS se traducirían en pronunciaciones erróneas o prosodia inadecuada.
- Uso comercial: la licencia Apache-2.0 lo permite, pero deben respetarse las condiciones del `NOTICE` de la versión modificada y la atribución al modelo base.
- Sin descargas ni likes registrados y con fecha de creación reciente: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/aether-models/aether-kit-kokoro-82m
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio Aether-Kit: https://github.com/bubstackdev/aether-kit
- Ficha de Kokoro-82M en There's An AI For That: https://theresanaiforthat.com/model/kokoro-82m/
- Mirror de Kokoro-82M en Hugging Face: https://huggingface.co/aiplexdeveloper/Kokoro-82M
