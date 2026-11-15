# Phoonnx/glowtts-it-it-riccardo_fasol

## Resumen

`Phoonnx/glowtts-it-it-riccardo_fasol` es un modelo de síntesis de voz (text-to-speech) en formato ONNX derivado del repositorio agregador [Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts), concretamente de la carpeta `it-it-riccardo_fasol`. Lo publica la organización Phoonnx y está pensado para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx), un motor de inferencia TTS basado en ONNX Runtime. El modelo reproduce una voz concreta identificada como `larynx/it-it-riccardo_fasol-glow_tts`, es decir, una voz masculina italiana (código de idioma `it-it`) heredada del ecosistema Larynx.

La arquitectura subyacente es GlowTTS, un modelo de síntesis neuronal no autorregresivo basado en normalizing flows, popularizado por el proyecto Larynx de Rhasspy. GlowTTS destaca por su inferencia rápida y determinista en comparación con los modelos autorregresivos tipo Tacotron, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados y para síntesis en tiempo real. El repositorio ocupa aproximadamente 0,1 GB, un tamaño coherente con un modelo TTS ligero exportado a ONNX.

La relevancia de esta ficha es acotada: se trata de un artefacto de un modelo ya existente, reempaquetado para un runtime específico, sin model card descriptiva más allá de la referencia al repositorio origen. No se documentan métricas de calidad, datos de entrenamiento ni condiciones de licencia más allá de `license: other`. Es útil para quien integre phoonnx y necesite una voz italiana concreta, pero no debe considerarse una publicación de investigación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flows, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | italiano (`it-it`, segun el identificador de la voz) |
| Licencia | other (sin licencia especificada para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis texto-a-voz no autorregresivo que combina un encoder de texto transformer con un decoder basado en normalizing flows (Glow). El encoder transforma la secuencia de fonemas en una representación latente alineada con la duración de los fonemas, y los flows modelan la distribución del espectrograma mel, que posteriormente se convierte en audio mediante un vocoder. Esta arquitectura permite paralelizar la generación y ofrece latencia baja y estable, a diferencia de los modelos autorregresivos.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el vocoder asociado ni si hubo ajuste fino o técnicas de alineamiento específicas para esta voz. La model card únicamente indica que los ficheros conservan las rutas del repositorio origen `Phoonnx/phoonnx-glowtts`, lo que sugiere una exportación directa a ONNX desde los pesos originales de Larynx sin reentrenamiento documentado. Tampoco se detalla la versión de ONNX opset ni las optimizaciones aplicadas en la exportación.

## Capacidades

- Síntesis de voz a partir de texto en italiano con una voz masculina concreta (`riccardo_fasol`).
- Generación de audio determinista y no autorregresiva, apta para inferencia por lotes.
- Ejecución mediante ONNX Runtime a través de la librería phoonnx.
- Integración con el ecosistema Larynx/phoonnx mediante el identificador de voz `larynx/it-it-riccardo_fasol-glow_tts`.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo ni tool calling.
- No se documentan modos de razonamiento, visión ni audio de entrada.

## Casos de uso

- Lectura de textos en italiano en aplicaciones de accesibilidad: el modelo convierte artículos o documentos en audio para usuarios con discapacidad visual, aprovechando la inferencia rápida de GlowTTS en CPU.
- Asistentes de voz locales para domótica: al ejecutarse vía ONNX Runtime y con un tamaño de repositorio de 0,1 GB, puede desplegarse en dispositivos de borde (Raspberry Pi, mini-PC) para anuncios y respuestas habladas en italiano.
- Generación de audiolibros o pódcasts automatizados: la naturaleza determinista del modelo facilita la producción por lotes de narraciones con una voz consistente.
- Sistemas de megafonía y avisos en transporte público: se puede pregenerar audio para anuncios repetitivos en italiano, con latencia predecible.
- Pruebas de integración en pipelines de phoonnx: sirve como voz de referencia para validar el motor de inferencia y comparar con otras voces del repositorio `phoonnx-glowtts`.
- Prototipado de interfaces conversacionales en italiano: permite añadir salida de voz a prototipos sin depender de servicios en la nube, manteniendo los datos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura GlowTTS, la inferencia cabe holgadamente en menos de 1 GB de memoria, tanto en GPU como en CPU.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); no se requiere hardware de gama alta. Una RTX 4090 o A100 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no están orientados a TTS.
- Latencia y throughput: no disponibles; GlowTTS se caracteriza por inferencia rápida y paralela, pero no se aportan cifras concretas para esta exportación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-it-it-riccardo_fasol | GlowTTS | Italiano | ONNX | other | Hugging Face |
| Otras voces de Phoonnx/phoonnx-glowtts | GlowTTS | Varios (por carpeta) | ONNX | other | Hugging Face |
| Modelos Larynx originales (rhasspy/larynx) | GlowTTS | Varios | Checkpoints propios | MIT (segun proyecto Larynx) | GitHub / Hugging Face |
| Piper (rhasspy/piper) | VITS | Varios | ONNX | MIT (segun proyecto Piper) | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia es `other` y la model card no especifica condiciones: no se garantiza el uso comercial sin consultar al autor del repositorio origen.
- No se documentan sesgos de género, acento o prosodia; al ser una voz única, la diversidad de habla es nula.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas o neologismos, habitual en modelos TTS entrenados con corpus limitados.
- No se documenta el vocabulario fonético ni el manejo de números, abreviaturas o puntuación; puede requerir normalización de texto previa.
- El modelo está atado al runtime phoonnx; su uso fuera de esa librería requiere gestionar manualmente las entradas y salidas ONNX.
- No hay información sobre la calidad del vocoder asociado ni sobre artefactos de audio en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-it-it-riccardo_fasol](https://huggingface.co/Phoonnx/glowtts-it-it-riccardo_fasol)
- [Repositorio origen: Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
