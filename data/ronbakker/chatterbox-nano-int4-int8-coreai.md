# ronbakker/chatterbox-nano-int4-int8-coreai

## Resumen

Chatterbox Nano Core AI es una conversión cuantizada, optimizada para ejecución en dispositivo, del modelo de síntesis de voz Chatterbox Nano de Resemble AI. Su autor, Ron Bakker, ha empaquetado el modelo en cinco activos nativos `.aimodel` destinados a iOS 27+ y macOS 27+ sobre Apple Silicon, con el objetivo de permitir narración en inglés y clonación de voz (voice enrollment) sin depender de la nube. El repositorio pesa solo 0,6 GB comprimido, lo que lo hace especialmente adecuado para despliegues móviles y de escritorio donde la VRAM y el almacenamiento son limitados.

La relevancia de esta ficha radica en el creciente interés por la inferencia TTS local: ejecutar síntesis de voz en el dispositivo elimina la latencia de red, reduce costes de API y mejora la privacidad del usuario. La cuantización mixta (int8, int4 y FP16 selectivos) mantiene la salida en coma flotante durante el cálculo, buscando un equilibrio entre tamaño, velocidad y fidelidad vocal. El modelo base, Chatterbox Nano, es la versión compacta de la familia Chatterbox de Resemble AI, especializada en narración en inglés con soporte de clonación de voz a partir de grabaciones cortas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal (componentes T3 y vocoder); detalle completo no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: int8 en la mayoría de pesos de narración y enrollment, int4 en una proyección T3, FP16 en matrices T3 sensibles y vocoder |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (formato nativo Apple Silicon Core AI); no distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo deriva de Resemble AI Chatterbox Nano, un sistema de texto a voz compacto. La conversión conserva la estructura interna del original: un componente T3 (cuyo nombre sugiere una arquitectura de tipo transformer para texto-a-tokens acústicos) y un vocoder que convierte las representaciones acústicas en audio PCM mono a 24 kHz. Sobre esta base, el empaquetado aplica un esquema de "paletas mixtas": los pesos de narración y enrollment se almacenan en int8, una proyección del módulo T3 se guarda en int4, mientras que las matrices T3 consideradas sensibles y el vocoder permanecen en FP16 para preservar la calidad del audio. Los frontends y las redes de hablante mantienen su precisión original. Los valores de paleta se interpretan como FP16 y todo el cómputo sigue siendo en coma flotante, por lo que la cuantización afecta al almacenamiento y al ancho de banda de memoria, no a la aritmética.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni los procesos de alineamiento del modelo original en la documentación proporcionada. La documentación del repositorio advierte que la expresividad de la voz puede diferir respecto a la versión FP16 completa, consecuencia esperable de la cuantización selectiva.

## Capacidades

- Síntesis de texto a voz en inglés, orientada a narración, con salida PCM mono a 24 kHz.
- Voice enrollment: registro de una voz a partir de grabaciones para generar locuciones con esa identidad vocal (requiere el componente opcional de 188 MB).
- Ejecución totalmente en dispositivo (on-device) en iPhone y Mac con Apple Silicon, sin llamadas a servicios en la nube.
- Cinco activos `.aimodel` independientes: cuatro modelos de narración y uno combinado de enrollment, lo que permite cargar solo lo necesario.
- No incluye voces ni grabaciones de ejemplo; el usuario debe proporcionar su propio material de enrollment.
- No soporta idiomas distintos del inglés según la model card.

## Casos de uso

- Narración de audiolibros y artículos en apps iOS/macOS: el modelo genera voz localmente, evitando costes por carácter de APIs en la nube y funcionando sin conexión.
- Asistentes de voz privados: al procesar todo en el dispositivo, el texto del usuario y las grabaciones de voz nunca salen del terminal, un requisito habitual en apps sanitarias o de productividad.
- Prototipado de interfaces de voz en Apple Silicon: los cinco activos `.aimodel` y la documentación de integración (INTEGRATION.md) facilitan incorporar TTS a apps nativas sin gestionar runtimes externos.
- Clonación de voz consentida para creadores: un locutor puede enrolar su voz con grabaciones cortas y generar narraciones para vídeos o podcasts con su propia identidad vocal.
- Accesibilidad: lectura de pantalla en aplicaciones para usuarios con dificultades visuales o de lectura, con latencia adecuada para interacción en tiempo real (RTF de 0,204 en iPhone 16 Pro).
- Juegos y experiencias interactivas: generación de diálogo hablado dinámico en tiempo de ejecución, algo inviable con audio pregrabado y costoso con servicios remotos.
- Kioscos y dispositivos sin conectividad fiable: la naturaleza on-device garantiza funcionamiento en entornos con red intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, similitud de hablante) en la información disponible. El repositorio sí incluye mediciones de rendimiento en dispositivo, en condiciones "warm" (excluyen carga, compilación, warm-up y escritura/playback de WAV):

| Dispositivo | SO | RTF mediano | Rango de tres ejecuciones |
|---|---|---:|---:|
| iPhone 16 Pro | iOS 27.0.1 | 0,204 | 0,198–0,205 |
| M1 Max | macOS 27.0.1 | 0,176 | 0,164–0,177 |

Un RTF de ~0,2 significa que generar un segundo de audio consume unos 200 ms de cómputo, es decir, la síntesis es unas cinco veces más rápida que el tiempo real en ambos dispositivos.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con iOS 27+ o macOS 27+; no hay soporte documentado para GPU NVIDIA ni para entornos Linux/Windows.
- Almacenamiento: 0,6 GB de repositorio comprimido; 408,5 MB para los cuatro modelos de narración y sus tablas, más 188 MB opcionales para el enrollment combinado.
- No requiere VRAM dedicada: se ejecuta sobre la memoria unificada de Apple Silicon.
- Referencia de rendimiento validada: iPhone 16 Pro (RTF 0,204) y M1 Max (RTF 0,176); otros chips Apple Silicon no están documentados.
- Despliegue: integración nativa mediante el formato `.aimodel` según INTEGRATION.md; no se documentan rutas vía vLLM, llama.cpp, Ollama o TGI.
- Latencia: al ser ~5x tiempo real, un clip de 5 segundos de audio se genera en aproximadamente 1 segundo una vez el modelo está caliente.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|
| Chatterbox Nano Core AI (este) | TTS on-device, inglés, voice cloning | Mixta int8/int4/FP16 | iOS/macOS Apple Silicon | MIT |
| ResembleAI/chatterbox-nano (base) | TTS, inglés, voice cloning | FP16 (sin cuantizar) | Multiplataforma (PyTorch) | Consultar model card original |
| Piper | TTS ligero on-device, multiidioma | Modelos compactos propios | Multiplataforma (CPU) | MIT |

Frente al modelo base, esta conversión sacrifica algo de expresividad a cambio de un tamaño y consumo muy inferiores y de ejecución nativa en Apple. Frente a Piper, ofrece clonación de voz y mejor integración Apple, pero está limitado al inglés y a la plataforma objetivo.

## Limitaciones y advertencias

- Solo inglés: no hay soporte documentado para otros idiomas, incluido el castellano.
- La expresividad de la voz puede diferir de la versión FP16 original debido a la cuantización, según advierte la propia model card.
- No incluye voces ni grabaciones: el usuario debe aportar material propio para el enrollment, con las implicaciones legales y éticas de clonar voces de terceros sin consentimiento.
- Formato `.aimodel` propietario del ecosistema Apple: no es utilizable directamente en servidores Linux ni con runtimes estándar como llama.cpp o vLLM.
- Las mediciones de rendimiento corresponden a longitudes de texto y formas de entrada concretas; otros patrones de uso pueden rendir de forma distinta.
- El riesgo de síntesis de voz abusiva (deepfakes) es inherente a cualquier modelo de clonación vocal; conviene implementar controles de consentimiento en producción.
- No hay métricas de calidad de audio publicadas (MOS, WER), por lo que la evaluación subjetiva queda en manos del desarrollador.
- Licencia MIT tanto en la conversión como en el modelo original según la model card, pero el repositorio exige preservar LICENSE, NOTICE.md y la licencia de componentes; el copyright del modelo base corresponde a Resemble AI (2025).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ronbakker/chatterbox-nano-int4-int8-coreai
- Modelo base (Resemble AI Chatterbox Nano): https://huggingface.co/ResembleAI/chatterbox-nano
- Documentación de integración: INTEGRATION.md (en el repositorio)
- Especificación de formatos de pesos: weight-formats.json (en el repositorio)
- Licencia y avisos: LICENSE y NOTICE.md (en el repositorio)
