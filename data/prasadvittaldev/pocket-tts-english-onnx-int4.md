# prasadvittaldev/pocket-tts-english-onnx-int4

## Resumen

Pocket TTS English int4 es una versión cuantizada y empaquetada para navegador del modelo de síntesis de voz Pocket TTS de Kyutai, publicada por Prasad Vittaldev bajo licencia CC-BY-4.0. El paquete completo pesa 106 MB e incluye el modelo de lenguaje cuantizado a int4 (MatMulNBits, bloque 128, simétrico), el decodificador del códec Mimi a int8, el acondicionador de texto en float32 y un estado de voz precomputado que evita cargar el codificador Mimi en el navegador.

El modelo base de Kyutai es un modelo de lenguaje de flujo (flow-matching) de 6 capas con 89,4 millones de parámetros que genera tokens de audio a través del códec neuronal Mimi a 24 kHz. Esta versión ONNX resuelve el problema de ejecutar un TTS de calidad en el navegador sin servidor, sin GPU y sin clave de API, gracias a la cuantización int4 del modelo de lenguaje principal (de 302,7 MB a 40,8 MB) y al empaquetado en un único archivo `.onnx`, requisito indispensable para ONNX Runtime Web.

La relevancia actual del modelo radica en su capacidad para ofrecer síntesis de voz en tiempo real dentro de páginas web con solo CPU, lo que abre casos de uso de accesibilidad, asistencia offline y prototipado rápido sin infraestructura backend. Es una derivada reciente (septiembre de 2026) con cero descargas registradas en HuggingFace, por lo que su adopción en producción aún no está contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (flow-matching) de 6 capas + códec neuronal Mimi a 24 kHz |
| Parametros totales | 89,4 M (modelo base de Kyutai) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (MatMulNBits, bloque 128, simétrico) para el LM principal; int8 dinámico para el flow head, decodificador y codificador Mimi; float32 para el acondicionador de texto |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

Pocket TTS es un modelo de lenguaje de flujo (flow-matching) de 6 capas con 89,4 millones de parámetros que opera sobre el códec neuronal Mimi de Kyutai a 24 kHz. El modelo genera tokens de audio de forma autoregresiva y utiliza un head de flujo (flow head) para convertir las representaciones latentes en audio. El acondicionador de texto procesa la entrada textual y guía la generación. El entrenamiento original fue realizado por Kyutai; los pesos se publican abiertamente bajo CC-BY-4.0.

Esta versión ONNX mantiene la arquitectura original pero cuantiza los pesos: el modelo de lenguaje principal se reduce de 302,7 MB a 40,8 MB mediante cuantización int4 con MatMulNBits (bloque 128, simétrico), mientras que el flow head y los componentes del códec Mimi se cuantizan a int8 dinámico. El acondicionador de texto se mantiene en float32 porque está compuesto casi íntegramente por lookups de embeddings, donde la cuantización ahorra apenas 40 bytes pero arriesga la pronunciación.

Una innovación destacable del empaquetado es el uso de un estado de voz precomputado: el prompt de voz es un prefijo de KV-cache que se envía ya calculado, evitando que el navegador tenga que cargar el codificador Mimi. El autor advierte que ese estado incluye un campo `step` por capa que debe coincidir con la longitud del caché; si se pone a cero, el modelo ignora silenciosamente la voz y emite casi silencio (RMS 0,0026 frente a 0,176 correcto).

## Capacidades

- Síntesis de voz en inglés a 24 kHz con calidad comparable al modelo original de Kyutai.
- Ejecución completa en el navegador vía WebAssembly, sin servidor, GPU ni clave de API.
- Cuatro voces predefinidas con frecuencias fundamentales medidas: charles (76 Hz), alba (140 Hz), vera (168 Hz) y azelma (216 Hz).
- Posibilidad de clonar una nueva voz si se incluye el codificador Mimi (`mimi_encoder_int8.onnx`) en el flujo.
- Integración con ONNX Runtime Web y ONNX Runtime Python.
- Descarga única del modelo con caché local en el navegador.
- Empaquetado en un único archivo `.onnx` para el LM principal, compatible con las limitaciones de ONNX Runtime Web (que no puede leer archivos `.onnx.data` externos).

## Casos de uso

- Accesibilidad web: lectores de pantalla integrados en páginas que funcionan sin conexión, ideales para usuarios con discapacidad visual en entornos con conectividad limitada.
- Asistencia offline en el navegador: aplicaciones de productividad que necesitan leer en voz alta documentos, correos o notificaciones sin depender de servicios externos.
- Prototipado rápido de interfaces de voz: diseñadores y desarrolladores pueden probar experiencias conversacionales en una demo web sin levantar infraestructura backend.
- Educación y formación: generación de material de audio para cursos en línea, podcasts o ejercicios de pronunciación en inglés, ejecutable en cualquier dispositivo con navegador.
- Generación de contenido multimedia: doblaje automático de vídeos cortos, presentaciones o vídeos explicativos directamente en el navegador.
- Juegos y experiencias interactivas: diálogos de personajes no jugables (NPC) en juegos web que requieren síntesis de voz en tiempo real con latencia baja.
- Aplicaciones de lectura asistida: lectura en voz alta de artículos, libros o páginas web con una de las cuatro voces disponibles, útil para personas con dislexia u otras dificultades de lectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas objetivas de calidad de voz (MOS, WER) ni de latencia de inferencia, más allá de la medición de RMS que confirma el correcto funcionamiento del estado de voz precomputado (0,176 correcto frente a 0,0026 con el campo `step` a cero).

## Requisitos de hardware

- CPU únicamente: no requiere GPU para inferencia.
- Almacenamiento: 106 MB para el paquete completo (descarga única con caché local en el navegador).
- Navegador compatible con WebAssembly y ONNX Runtime Web (Chrome, Firefox, Edge y Safari modernos).
- Alternativa en Python: onnxruntime + numpy + huggingface_hub + soundfile.
- Opciones de despliegue: ONNX Runtime Web en navegador, ONNX Runtime en Python, o el runtime de referencia de KevinAHM/pocket-tts-onnx-export (MIT).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| kyutai/pocket-tts (base) | 89,4 M | float32 | en | CC-BY-4.0 | safetensors |
| prasadvittaldev/pocket-tts-english-onnx-int4 | 89,4 M | int4 + int8 | en | CC-BY-4.0 | ONNX |

La principal diferencia entre la versión base y esta derivada es el formato de pesos y la cuantización: la versión base requiere un runtime de Python y carga el codificador Mimi completo, mientras que esta versión ONNX int4 está optimizada para ejecución en navegador con pesos precomputados que eliminan la necesidad del codificador. No se dispone de datos para comparar con otros TTS de código abierto como Piper o Coqui en términos de calidad objetiva.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado exclusivamente para síntesis de voz en inglés.
- Cuatro voces predefinidas; para clonar una nueva voz es necesario incluir el codificador Mimi en el flujo, lo que añade complejidad y peso al paquete.
- La cuantización int4 puede degradar ligeramente la calidad de voz en comparación con el modelo float32 original, aunque el autor no aporta métricas comparativas.
- El estado de voz precomputado es sensible: si el campo `step` no coincide con la longitud del caché, el modelo produce casi silencio (RMS 0,0026 frente a 0,176 correcto).
- Licencia CC-BY-4.0: requiere atribución al autor original (Kyutai) y a esta derivada en cualquier uso, incluido el comercial.
- El modelo tiene cero descargas y cero valoraciones en HuggingFace, por lo que su fiabilidad en producción no está contrastada por la comunidad.
- No se documenta el comportamiento con ruido, acentos, entradas de texto poco comunes o textos muy largos.
- El autor no publica métricas de latencia ni de throughput, lo que dificulta estimar la viabilidad para aplicaciones en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prasadvittaldev/pocket-tts-english-onnx-int4
- Demo en navegador: https://prasadtts.vercel.app
- Modelo base de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Runtime de referencia ONNX: https://github.com/KevinAHM/pocket-tts-onnx-export
