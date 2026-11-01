# edbrdi/brindille

## Resumen

Brindille es un modelo de síntesis de voz (text-to-speech) en francés desarrollado por edbrdi, diseñado específicamente para ejecutarse íntegramente en el navegador mediante WebAssembly. Con tan solo 93.734 parámetros (de los cuales 145 pertenecen al sintetizador), el modelo convierte texto en audio mono a 22.050 Hz sin necesidad de servidor, sin ONNX Runtime y sin dependencias de PyTorch. La página completa, incluyendo el motor de inferencia, ocupa 2,7 MB (1,9 MB comprimidos).

El modelo resuelve el problema del despliegue de TTS en entornos con recursos limitados y latencia cero de red: toda la inferencia ocurre en el hilo de la página, procesando una frase de varios segundos en decenas de milisegundos. Utiliza una arquitectura neuronal que predice tono, sonoridad y envolventes espectrales, y un sintetizador armónico más ruido que renderiza la forma de onda, prescindiendo por completo de vocoder neuronal.

Es relevante ahora porque demuestra que es posible obtener voz inteligible en francés con un modelo de menos de 100.000 parámetros y un motor de 342 KB compilado a WebAssembly, lo que abre la puerta a aplicaciones de accesibilidad, lectura de contenido y asistentes locales sin infraestructura de servidor. El modelo se apoya en el motor de inferencia Alkove, también de código abierto, y en la voz Estelle de Kyutai.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal que predice tono, sonoridad y envolventes espectrales; sintetizador armónico + ruido para la forma de onda (sin vocoder neuronal) |
| Parámetros totales | 93.734 (145 en el sintetizador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos del decodificador en int8, codificador en float32 (formato propietario `.alk`) |
| Idiomas soportados | Francés (`fr`) |
| Licencia | Apache-2.0 (el diccionario `fr.dict.bin` derivado del Montreal Forced Aligner queda bajo CC BY 4.0) |
| Formato de pesos | `.alk` (exclusivo del motor Alkove; no hay ONNX ni pesos PyTorch) |

## Arquitectura y entrenamiento

Brindille no sigue la arquitectura transformer convencional de los modelos TTS neuronales de gran escala. En su lugar, emplea una red neuronal compacta de dos planes (codificador y decodificador) que predice tres componentes acústicos: tono (pitch), sonoridad (voicing) y envolventes espectrales. La forma de onda final se genera mediante un sintetizador de tipo armónico más ruido, lo que elimina la necesidad de un vocoder neuronal y reduce drásticamente el cómputo y el tamaño del modelo.

El modelo se distribuye en un archivo `tts.alk` de 266 KB, con los pesos del decodificador cuantizados a int8 y el codificador en float32. El frontend de texto incluye un diccionario de pronunciaciones de 19.662 palabras francesas (`fr.dict.bin`) y un componente llamado Lex (`lex.alk`) que lee las palabras no cubiertas por el diccionario. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La arquitectura de red y sintetizador se basa en AuroraTTS-100K de AuroraAI-Research, y la voz Estelle proviene de Pocket TTS de Kyutai.

## Capacidades

- Síntesis de voz en francés a partir de texto, con salida mono a 22.050 Hz.
- Control de velocidad mediante el parámetro `speed` en la función `speak(text, speed)`.
- Ejecución íntegra en el navegador mediante WebAssembly, sin servidor ni runtime externo.
- Lectura de números enteros y decimales con coma.
- Diccionario integrado de 19.662 palabras francesas para pronunciación.
- Componente Lex para lectura de palabras fuera del diccionario.
- Exposición de nombres de fonemas a través de `tts.json` (para visualización).
- No soporta clonación de voz ni múltiples voces.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Lectura de contenido web en francés: integración de `tts.js` en una página para leer artículos o secciones con la voz Estelle, sin llamadas a servidor y con latencia de decenas de milisegundos por frase.
- Aplicaciones de accesibilidad: asistencia a usuarios con discapacidad visual o dificultades de lectura, ejecutándose localmente en el navegador y sin enviar texto a terceros.
- Aprendizaje de francés: reproducción de frases y vocabulario con control de velocidad para practicar pronunciación, aprovechando el diccionario integrado de 19.662 palabras.
- Asistentes de voz locales en aplicaciones web: generación de respuestas habladas en interfaces conversacionales sin infraestructura de backend.
- Sistemas de navegación o señalización embebidos: lectura de instrucciones y avisos en aplicaciones web progresivas (PWA) que deben funcionar offline.
- Prototipado rápido de interfaces de voz: validación de flujos de usuario con TTS real en el navegador antes de invertir en un modelo de mayor calidad.
- Kioscos o terminales de información: reproducción de mensajes en francés en dispositivos con recursos limitados, dado el reducido tamaño del modelo (266 KB) y del motor (342 KB).

## Benchmarks y rendimiento

Evaluación sobre 49 frases reservadas, transcritas con Whisper large-v3-turbo:

| Métrica | Brindille | Audio de referencia |
|---|---|---|
| WER | 9,6 % | 7,2 % |
| CER | 3,5 % | 2,7 % |
| DNSMOS OVR | 2,73 | 3,01 |

Velocidad: aproximadamente 75× tiempo real en WebAssembly con un solo hilo (Apple M1 Max, Node).

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante WebAssembly.
- GPU: no requiere GPU.
- Cabe en cualquier dispositivo con un navegador moderno que soporte WebAssembly; el motor ocupa 342 KB (100 KB con compresión brotli).
- Despliegue: motor Alkove compilado a WebAssembly; se carga con `Tts.load('./')` y se invoca con `tts.speak(texto)`.
- Latencia: una frase de varios segundos se procesa en decenas de milisegundos en el hilo de la página.
- Throughput: ~75× tiempo real en un solo hilo (Apple M1 Max, Node).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Ejecución |
|---|---|---|---|---|---|---|
| Brindille | 93.734 | No disponible | Francés | Apache-2.0 | `.alk` (Alkove) | WebAssembly en navegador |
| AuroraTTS-100K | ~100.000 (referencia arquitectónica) | No disponible | No disponible | Apache-2.0 | No disponible | No disponible |
| Pocket TTS (Kyutai) | No disponible | No disponible | No disponible | CC BY 4.0 (voz Estelle CC0) | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Solo francés y una única voz (Estelle); no hay clonación de voz.
- Los números se leen (enteros y decimales con coma), pero las abreviaturas, acrónimos y símbolos no se expanden.
- Los nombres y palabras extranjeras pasan por Lex, que puede fallar en su pronunciación.
- Las liaison (enlaces fonéticos) solo siguen reglas para las palabras más comunes.
- El sonido es ligeramente zumbante y apagado en comparación con voz natural (DNSMOS OVR 2,73 frente a 3,01 de referencia).
- Licencia Apache-2.0 para modelo, módulo WebAssembly, `tts.js` y la página; el diccionario `fr.dict.bin` derivado del Montreal Forced Aligner queda bajo CC BY 4.0.
- El formato de pesos `.alk` es exclusivo del motor Alkove; no hay compatibilidad con ONNX ni PyTorch.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí puede producir pronunciaciones incorrectas en palabras fuera del diccionario.
- No se dispone de información sobre sesgos del modelo más allá de las limitaciones lingüísticas indicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edbrdi/brindille
- Demo: https://huggingface.co/spaces/edbrdi/brindille
- Motor Alkove: https://github.com/alkove-ai/alkove
- Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Voces TTS de Kyutai: https://huggingface.co/kyutai/tts-voices
- AuroraTTS-100K: https://huggingface.co/AuroraAI-Research/AuroraTTS-100K
- Diccionario del Montreal Forced Aligner: https://github.com/MontrealCorpusTools/mfa-models
- Lex: https://huggingface.co/alkove-ai/alkove-lex-1-preview
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
