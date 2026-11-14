# demoqqq/banglatts-kiki-rakib-blend

## Resumen

Kiki-Rakib Blend es un modelo de síntesis de voz (text-to-speech) en bengalí construido mediante la media aritmética de pesos de dos voces VITS afinadas de forma independiente: Kiki TTS v2 y Rakib TTS Advance v2. Ambos modelos derivan de la base EMTIAZZ Bangladeshi Bengali VITS, un checkpoint Coqui TTS con licencia Apache-2.0, y el resultado es un modelo de un único hablante con una voz híbrida que combina las características tímbricas de las dos voces originales. El repositorio lo publica el usuario demoqqq y contiene tanto el checkpoint Coqui (`best_model.pth`, 997.816.929 bytes) como una exportación ONNX compatible con sherpa-onnx (`model.onnx`, 114.192.755 bytes).

El modelo resuelve un caso concreto: disponer de una voz sintética offline en bengalí, ejecutable sin dependencias de red, con una identidad vocal nueva obtenida sin reentrenamiento. La técnica de blending 50/50 sobre state dicts con claves y formas idénticas (949 tensores) y vocabularios byte a byte iguales (92 tokens) permite fusionar dos voces sin coste adicional de entrenamiento. La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que mapea caracteres a forma de onda a 22.050 Hz.

La relevancia actual es acotada pero práctica: es un ejemplo reproducible de cómo derivar voces personalizadas para sherpa-onnx y Piper desde checkpoints Coqui, útil para desarrolladores que necesiten TTS bengalí de bajo consumo en dispositivos locales. El modelo no incluye métricas de calidad publicadas ni documentación de licencia propia más allá de la de la base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), end-to-end texto a forma de onda |
| Parámetros totales | no disponible (checkpoint de 997.816.929 bytes; 949 tensores) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantización | no disponible (export ONNX de 114.192.755 bytes; cuantizaciones adicionales no documentadas) |
| Idiomas soportados | bengalí (vocabulario de 92 tokens por caracteres) |
| Licencia | no disponible en el repositorio; base EMTIAZZ con Apache-2.0 |
| Formato de pesos | PyTorch (`best_model.pth`), ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un VITS de un solo hablante, con frontend de caracteres (`frontend=characters`, `model_type=vits`) y frecuencia de muestreo de 22.050 Hz. Los dos modelos origen se entrenaron de forma independiente desde la base EMTIAZZ Bengali VITS: Kiki v2 con 2.528 clips durante 70 epochs (reanudado desde el checkpoint_16500, mejor paso 18.307) y Rakib v2 con 2.362 clips durante 65 epochs (mejor paso 17.141). El blend se obtiene promediando al 50/50 los state dicts de los mejores modelos de cada uno; la compatibilidad está garantizada por tener 949 tensores con claves y formas idénticas y vocabularios byte a byte iguales de 92 tokens.

No se documentan datos de entrenamiento adicionales para el blend (el promediado de pesos no requiere entrenamiento), ni uso de RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal. La exportación a ONNX está preparada para sherpa-onnx con metadatos que declaran `sample_rate=22050` y un comentario identificativo de la voz. El tokenizador de sherpa (`tokens_sherpa.txt`) sigue formato Piper con 90 líneas.

## Capacidades

- Síntesis de voz en bengalí a partir de texto con frontend por caracteres.
- Voz de un único hablante resultante de la media de dos voces (Kiki y Rakib).
- Inferencia totalmente offline mediante sherpa-onnx usando `model.onnx` y `tokens_sherpa.txt`.
- Compatibilidad con el ecosistema Coqui TTS a través de `best_model.pth`, `config.json` y `tokens.txt`.
- Salida de audio a 22.050 Hz.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling, agentes ni multimodalidad.

## Casos de uso

- Lectura de noticias y boletines en bengalí: los ejemplos incluidos (`test_long_teknaf_blend.wav`, `test_long_narsingdi_blend.wav`) muestran el uso previsto para narración de textos largos de actualidad, adecuado por ser un VITS de inferencia rápida.
- Asistentes de voz embebidos en dispositivos sin conexión: la exportación ONNX con sherpa-onnx permite ejecutar el modelo localmente en aplicaciones de escritorio o móviles sin enviar texto a servicios externos.
- Accesibilidad para hablantes de bengalí: conversión de texto a voz para lectores de pantalla y interfaces de accesibilidad, aprovechando el soporte de caracteres bengalíes del vocabulario de 92 tokens.
- Locución de contenidos educativos: generación de audiolibros o material didáctico en bengalí con una voz sintética consistente y reproducible.
- Integración en pipelines Piper/sherpa-onnx: uso de `tokens_sherpa.txt` y `model.onnx` en flujos de TTS por lotes para producir audio de forma automatizada.
- Prototipado de voces personalizadas: servir como referencia reproducible de la técnica de blending 50/50 para derivar nuevas voces sin reentrenamiento a partir de checkpoints Coqui compatibles.
- Demos y pruebas de TTS bengalí: los samples incluidos (bienvenida, sesión de Teknaf y Dhaka) permiten evaluar la calidad de la voz antes de integrarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint PyTorch ocupa aproximadamente 1 GB en disco y el ONNX unos 114 MB, por lo que la huella en memoria es moderada.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) debería poder ejecutar el modelo; no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del export ONNX, pero no hay confirmación del autor.
- Opciones de despliegue: sherpa-onnx (soporte declarado), Coqui TTS (checkpoint `best_model.pth`), y potencialmente Piper por el formato de tokens; vLLM, llama.cpp, Ollama y TGI no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kiki-Rakib Blend | VITS Coqui/ONNX | bengalí | 22.050 Hz | no disponible (base Apache-2.0) | Hugging Face |
| EMTIAZZ Bengali VITS (base) | VITS Coqui | bengalí | 22.050 Hz | Apache-2.0 | Hugging Face |
| Kiki TTS v2 | VITS Coqui | bengalí | 22.050 Hz | no disponible | Hugging Face |
| Rakib TTS Advance v2 | VITS Coqui | bengalí | 22.050 Hz | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El modelo es de un único hablante; no permite seleccionar voces ni controlar el hablante en inferencia.
- Solo cubre bengalí; no se documenta soporte multilingüe.
- No hay métricas objetivas de calidad (MOS, WER, etc.) publicadas; la calidad debe evaluarse con los samples incluidos.
- El promediado de pesos puede producir artefactos vocales no presentes en ninguno de los modelos originales; no hay validación documentada al respecto.
- La licencia del blend no está declarada en el repositorio; la base es Apache-2.0, pero las voces afinadas se describen como "personal voice models" con la indicación de usarlas respetuosamente, lo que introduce incertidumbre para uso comercial.
- Riesgo de sesgos y alucinaciones acotado al ámbito TTS: pronunciación incorrecta de términos fuera del vocabulario de 92 tokens y posibles errores en números o nombres propios.
- Repositorio con 0 descargas y 0 likes; sin comunidad de validación ni mantenimiento documentado.
- El autor es un usuario individual (demoqqq); no hay garantías de soporte ni actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/demoqqq/banglatts-kiki-rakib-blend
- Modelo base EMTIAZZ Bengali VITS: no disponible en la información proporcionada
- Repositorio sherpa-onnx: no disponible en la información proporcionada
- Coqui TTS: no disponible en la información proporcionada
