# omne-earth/piper-voices-burn

## Resumen

`omne-earth/piper-voices-burn` es una conversión al formato burnpack (`.bpk`) del framework Burn de una única voz de síntesis de voz Piper: `en_GB-alba-medium`, originalmente publicada en `rhasspy/piper-voices`. El autor, omne-earth, no entrena ningún modelo nuevo: se limita a convertir el fichero `.onnx` de la voz mediante `burn-onnx 0.22.0` con parches de matumo, preservando los valores numéricos del modelo original. El objetivo es permitir la inferencia de texto a voz dentro del ecosistema Rust de Burn, sin depender del runtime de ONNX.

El repositorio es, por tanto, un artefacto de distribución más que un modelo con contribución científica propia. Su relevancia es práctica: facilita el despliegue de TTS en aplicaciones Rust nativas, con pesos idénticos a los de Piper y una licencia MIT heredada de la voz original. El tamaño del repositorio es de 0,1 GB y contiene un único modelo de voz en inglés británico de calidad media.

No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto más allá de lo que implica el propio formato Piper, por lo que los apartados técnicos se limitan a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (voz Piper original en ONNX, convertida a burnpack; Piper usa habitualmente VITS, dato no confirmado en la información) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por fonemas; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (los pesos conservan los valores del ONNX original) |
| Idiomas soportados | inglés británico (voz `en_GB-alba-medium`) |
| Licencia | MIT (heredada de la voz original en rhasspy/piper-voices) |
| Formato de pesos | burnpack (`.bpk`), con configuración asociada `.onnx.json` |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El repositorio contiene la conversión de un único fichero `.onnx` de la voz `en_GB-alba-medium` al formato burnpack de Burn, realizada con `burn-onnx 0.22.0` y parches de matumo. Según la model card, los valores numéricos del modelo convertido son idénticos a los del ONNX de origen, por lo que la calidad acústica y el comportamiento fonético son los de la voz Piper original.

Cada voz se acompaña de un fichero `<voice>.onnx.json` con la configuración (identificadores de fonemas, tasa de muestreo y escalas), idéntico al de `rhasspy/piper-voices`. El repositorio incluye además un fichero `SHA256SUMS` con los hashes SHA-256 de cada fichero para verificación de integridad. No se documentan datos de entrenamiento, composición del corpus, ni procesos de RLHF o DPO, porque el autor no los ha generado.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés británico a partir de texto de entrada, mediante la voz `en_GB-alba-medium`.
- Inferencia dentro del ecosistema Burn (Rust), sin necesidad del runtime de ONNX.
- Carga de la configuración fonética, tasa de muestreo y escalas desde el fichero `.onnx.json` adjunto.
- Verificación de integridad de los ficheros mediante `SHA256SUMS`.
- No se documentan capacidades de clonación de voz, multilingüismo, control de emoción ni tool calling.
- Una única voz disponible en el repositorio; no hay catálogo de voces adicionales.

## Casos de uso

- Lectura de notificaciones en aplicaciones de escritorio en Rust: el modelo se integra directamente en un binario que use Burn y genera audio local sin llamadas a servicios externos, con la ventaja de no requerir ONNX Runtime.
- Sistemas de accesibilidad para personas con discapacidad visual: la voz `en_GB-alba-medium` permite narrar contenido de interfaz en inglés británico con latencia local y sin dependencia de red.
- Asistentes de voz embebidos en dispositivos con recursos limitados: al tratarse de una voz Piper de calidad media y un repositorio de 0,1 GB, es viable en entornos de borde donde no cabe un modelo TTS de mayor tamaño.
- Generación de audiolibros o podcasts de prototipo: útil para producir borradores de narración en inglés británico antes de recurrir a una voz comercial de mayor calidad.
- Pruebas de integración continua de pipelines TTS en Rust: el fichero `SHA256SUMS` y la reproducibilidad de la conversión permiten validar que el artefacto desplegado coincide con el esperado.
- Sustitución de ONNX Runtime en proyectos Burn existentes: equipos que ya usan Burn para otros modelos pueden incorporar TTS sin añadir una dependencia adicional de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño, pero no se detalla el consumo en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que funcione en hardware modesto, pero no hay confirmación en la información.
- Opciones de despliegue: inferencia mediante Burn (formato burnpack `.bpk`); no se documentan otros runtimes para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| omne-earth/piper-voices-burn | burnpack (`.bpk`) | inglés británico (una voz) | MIT | Hugging Face, 0 descargas |
| rhasspy/piper-voices (origen) | ONNX | múltiples voces e idiomas | licencias por voz | Hugging Face, ampliamente usado |
| Otros modelos TTS (p. ej. Coqui, VITS) | varios | varios | variable | no disponible en la información |

La comparación relevante es con el repositorio de origen: este artefacto no añade voces ni idiomas, solo cambia el formato para el ecosistema Burn. Frente a otros modelos TTS no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Una sola voz (`en_GB-alba-medium`) y un solo idioma (inglés británico); no sirve para aplicaciones multilingües.
- No hay información sobre sesgos acústicos o demográficos de la voz original más allá de lo que publique rhasspy/piper-voices.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber errores de pronunciación o prosodia propios del modelo Piper original.
- La licencia MIT se hereda de la voz de origen; conviene verificar el `MODEL_CARD` de `rhasspy/piper-voices` para confirmar las condiciones exactas de uso comercial de esa voz concreta.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni validación comunitaria.
- Depende del ecosistema Burn y de la versión `burn-onnx 0.22.0` con parches de matumo; la compatibilidad con versiones futuras de Burn no está garantizada.
- No se documentan métricas de calidad (MOS, WER de síntesis) ni latencias, lo que dificulta evaluar su idoneidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/omne-earth/piper-voices-burn
- Modelo base: https://huggingface.co/rhasspy/piper-voices
- Framework Burn: https://burn.dev
