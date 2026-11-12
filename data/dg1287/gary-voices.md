# dg1287/gary-voices

## Resumen

Gary Voices es una colección de modelos de síntesis de voz (text-to-speech) desarrollada por dg1287 para su integración en Gary, una aplicación de crew chief y spotter para simuladores de carreras. El repositorio contiene modelos Piper multi-hablante en formato ONNX, donde cada acento se empaqueta como un único modelo que alberga seis voces distintas, seleccionables mediante un número de hablante. Actualmente solo está disponible el acento británico, con modelos adicionales (Southern, American, Scottish, Irish) anunciados como próximos.

Técnicamente, se trata de modelos Piper de tamaño medio (sufijo `-medium`) en formato ONNX, diseñados para ejecutarse con Piper 1.2 mediante el binario `piper.exe` y el flag `-s <speaker>`. El repositorio ocupa aproximadamente 0,1 GB y está etiquetado únicamente para el idioma inglés. La relevancia de este modelo es acotada: no es un modelo de propósito general, sino un componente de audio especializado con una licencia restrictiva que limita su uso al ecosistema Gary.

La propuesta de valor se centra en ofrecer voces sintéticas o derivadas de conjuntos de datos de habla pública con consentimiento, sin imitar a personas reales, lo que reduce riesgos de suplantación. No obstante, la información pública disponible es muy limitada: no se detallan arquitecturas internas, datos de entrenamiento ni métricas de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Piper (TTS neuronal, detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | gary-voice-models (other, ver LICENSE) |
| Formato de pesos | ONNX (`.onnx` + `.onnx.json`) |

## Arquitectura y entrenamiento

El modelo se distribuye como un checkpoint Piper multi-hablante en formato ONNX, con un fichero de configuración JSON asociado. Piper es un sistema TTS neuronal orientado a inferencia local y ligera, aunque la model card no especifica la arquitectura interna concreta (tipo de encoder/decoder, vocoder, etc.) ni el número de parámetros del checkpoint `en_GB-gary_british-medium`.

Respecto a los datos de entrenamiento, la model card indica que las voces son sintéticas o derivadas de conjuntos de datos de habla pública con consentimiento, y que no imitan a personas reales. No se proporciona el número de horas de audio, la composición del dataset, ni si se aplicaron técnicas de fine-tuning, RLHF o ajuste prosódico. Tampoco se documentan innovaciones técnicas adicionales más allá del empaquetado multi-hablante con seis voces por modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés británico.
- Soporte multi-hablante: seis voces por modelo (Rupert 0, Alfie 1, Ollie 2, Harriet 3, Pippa 4, Beth 5) seleccionables por número de hablante.
- Integración con Piper 1.2 mediante `piper.exe` y el flag `-s <speaker>`.
- Metadatos estructurados por carpeta: `voices.json` con voces, números de hablante, versión y estado de entrenamiento; `CREDITS.md` con las herramientas empleadas.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Crew chief en simuladores de carreras: el modelo proporciona avisos de voz sintetizada (posición, tiempos, banderas) dentro de la aplicación Gary, seleccionando el hablante adecuado según el acento configurado.
- Spotter de pista: emisión de alertas de tráfico y proximidad de rivales con una voz consistente y de baja latencia, aprovechando el formato ONNX para inferencia local.
- Personalización de la experiencia de audio: el usuario elige entre seis voces británicas (tres masculinas y tres femeninas según los nombres) para adaptar el tono del asistente.
- Sustitución de grabaciones pregrabadas: generación dinámica de mensajes variables (nombres de rivales, tiempos, sectores) que no pueden cubrirse con clips estáticos.
- Integración en pipelines de audio para sim racing: carga del modelo ONNX en Piper 1.2 y generación de locuciones bajo demanda en tiempo real.
- Desarrollo de mods o extensiones de Gary: reutilización de los ficheros `voices.json` y los checkpoints para añadir nuevos contextos de voz dentro del ecosistema del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; Piper está diseñado para inferencia en CPU y entornos de bajos recursos.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: Piper 1.2 (`piper.exe` con `-s <speaker>`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Voces | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gary Voices (dg1287) | Piper TTS multi-hablante | en (GB) | 6 por modelo | ONNX | gary-voice-models (other) | Hugging Face, 0 descargas |
| Piper voces estándar (OHF-Voice) | Piper TTS | múltiples | 1 por modelo habitualmente | ONNX | GPL y otras según checkpoint | Público y ampliamente usado |
| Otros TTS neuronales (p. ej. Coqui, VITS) | TTS neuronal | múltiples | variable | varios | variable | Público |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `gary-voice-models` limita explícitamente el uso a la aplicación Gary; no se autoriza uso comercial general sin consultar el fichero LICENSE.
- Idiomas: solo inglés británico; no apto para otros idiomas o acentos no incluidos.
- Solo está disponible el acento británico; los acentos Southern, American, Scottish e Irish están anunciados pero no publicados.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero la prosodia y pronunciación pueden presentar errores en nombres propios o términos técnicos no vistos en entrenamiento.
- Sesgos: no documentados; al derivarse de datasets públicos, podrían heredar sesgos de representación de las voces originales.
- Repositorio con 0 descargas y 0 likes: ecosistema muy reducido, sin validación comunitaria ni soporte documentado.
- Sin métricas de calidad (MOS, WER) publicadas, lo que dificulta evaluar su idoneidad en producción.
- Dependencia de Piper 1.2 y del binario `piper.exe`; no se documentan alternativas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dg1287/gary-voices
- Repositorio de Gary: https://github.com/dgutierrez1287
- Piper (OHF-Voice): https://github.com/OHF-Voice/piper1-gpl
