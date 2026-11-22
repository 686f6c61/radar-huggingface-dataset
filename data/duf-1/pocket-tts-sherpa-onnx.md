# Duf-1/pocket-tts-sherpa-onnx

## Resumen

Pocket TTS sherpa-onnx es un paquete derivado del modelo de sintesis de voz Kyutai Pocket TTS, exportado a formato ONNX con cuantizacion INT8 y empaquetado para su carga directa mediante la libreria sherpa-onnx (configuracion `OfflineTtsPocketModelConfig`). Lo publica el usuario Duf-1 y no modifica la arquitectura del modelo original: se limita a convertir los pesos PyTorch a ONNX (opset 17), aplicar cuantizacion dinamica INT8 a los modulos de lenguaje y prepender el tensor `bos_before_voice` al encoder para que sherpa-onnx 2.0.1 pueda ejecutar checkpoints multilingues sin cambios en el codigo.

El interes practico esta en el empaquetado: cada idioma se distribuye como un archivo tar.bz2 de unos 120 MB comprimidos (185 MB extraidos) que incluye todos los ficheros necesarios para inferencia offline (modelos ONNX, vocabulario, reglas de normalizacion de texto y voces de referencia en WAV a 24 kHz). Cubre cuatro idiomas (ingles, frances, aleman y espanol) con una voz de referencia por idioma, salvo el frances, que incluye dos.

Es relevante para desarrolladores que necesitan TTS local, sin dependencia de servicios en la nube, con un consumo de disco y memoria contenido gracias a la cuantizacion INT8 de los modulos de lenguaje, y que ya trabajen con el ecosistema sherpa-onnx (k2-fsa). La licencia CC-BY-4.0 permite uso comercial con atribucion, aunque las condiciones del modelo base de Kyutai anaden restricciones de uso prohibido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS de Kyutai (modelo generativo de audio con LM principal, LM de flujo, encoder y decoder Mimi); exportado a ONNX opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamico (MatMul/Gemm) en `lm_main` y `lm_flow`; encoder y decoder en FP32 |
| Idiomas soportados | en, fr, de, es |
| Licencia | CC-BY-4.0 (modelo base Kyutai Pocket TTS tambien CC-BY-4.0) |
| Formato de pesos | ONNX (`.onnx`), voces de referencia en WAV 24 kHz mono, `vocab.json`, `token_scores.json`, `pocket.json` |

## Arquitectura y entrenamiento

El modelo base es Kyutai Pocket TTS, un sistema de sintesis de voz que combina un modelo de lenguaje principal (`flow_lm_main`), un modelo de flujo (`flow_lm_flow`), un encoder Mimi con proyeccion de hablante y un decoder Mimi con caches KV de ventana deslizante de tamano fijo. Esta exportacion no reentrena ni ajusta el modelo: convierte los pesos PyTorch de los checkpoints `english_2026-10`, `french`, `german` y `spanish` a ONNX con estados de streaming inicializados a cero, aptos para inferencia offline en sherpa-onnx.

Las modificaciones respecto al original son tres: exportacion a ONNX opset 17 con caches KV de tamano fijo, cuantizacion dinamica INT8 de las capas MatMul y Gemm de los dos modulos de lenguaje, y prepend del tensor aprendido `bos_before_voice` al encoder para los checkpoints multilingues. Tambien se convierte el tokenizador SentencePiece a `vocab.json` y `token_scores.json`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Sintesis de texto a voz offline en ingles, frances, aleman y espanol.
- Clonacion de voz mediante clips de referencia WAV a 24 kHz (una voz por idioma, dos en frances: `estelle` y `fabien`).
- Normalizacion de texto integrada mediante las reglas del `pocket.json` y el `text_conditioner.onnx`.
- Inferencia por streaming con caches KV de ventana deslizante, adecuada para sintesis incremental.
- Ejecucion local sin GPU dedicada obligatoria, gracias a la cuantizacion INT8 de los modulos de lenguaje.
- Integracion directa con la API `OfflineTtsPocketModelConfig` de sherpa-onnx 2.0.1 o superior.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Lectura de articulos y documentos en aplicaciones de accesibilidad: el modelo sintetiza texto en cuatro idiomas de forma local, sin enviar contenido a servicios externos, lo que reduce el coste por caracter y protege la privacidad del texto leido.
- Asistentes de voz embebidos en dispositivos de gama baja: al estar cuantizado en INT8 y empaquetado en unos 185 MB por idioma, cabe en sistemas con recursos limitados y funciona con sherpa-onnx, que no requiere un runtime de Python pesado en produccion.
- Generacion de audiolibros y podcasts automatizados: la voz de referencia WAV permite mantener un timbre consistente a lo largo de horas de audio, y el decoder con caches de ventana deslizante facilita la sintesis por fragmentos.
- Locucion de interfaces y notificaciones en aplicaciones moviles o de escritorio: la carga directa de los archivos ONNX y la API de sherpa-onnx simplifican la integracion en apps nativas con un unico paquete por idioma.
- Prototipado de agentes conversacionales con salida de voz: combinado con un LLM y un ASR de sherpa-onnx, permite construir un bucle de voz completo en local para demos y pruebas de concepto.
- Doblaje y localizacion de contenido breve: con las cuatro voces disponibles se pueden generar versiones en en, fr, de y es de guiones cortos, manteniendo el mismo pipeline y sin depender de APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MOS, WER, similitud de hablante) ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete ocupa unos 185 MB extraidos por idioma, con los modulos de lenguaje en INT8 y encoder/decoder en FP32.
- GPU recomendadas: no se especifican; al ser ONNX con cuantizacion INT8, es viable en CPU y en GPU de consumo como RTX 3060, RTX 4060 o RTX 4090 mediante los execution providers de ONNX Runtime.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con varios GB de VRAM; el cuello de botella principal es el decoder Mimi en FP32, no los modulos de lenguaje.
- Opciones de despliegue: sherpa-onnx (libreria nativa, C++, Python, Kotlin, Swift, etc.) con `OfflineTtsPocketModelConfig`; tambien es posible usar ONNX Runtime directamente cargando los `.onnx` del paquete.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Duf-1/pocket-tts-sherpa-onnx | no disponible | no disponible | en, fr, de, es | CC-BY-4.0 | ONNX INT8 | Paquete listo para sherpa-onnx, 4 voces |
| kyutai/pocket-tts (base) | no disponible | no disponible | multilingue segun checkpoint | CC-BY-4.0 | PyTorch | Modelo original, requiere conversion para sherpa-onnx |
| Piper (rhasspy/piper) | no disponible | no disponible | decenas de idiomas | MIT (segun voces) | ONNX | TTS ligero para sherpa-onnx, sin clonacion de voz por referencia |
| Coqui XTTS v2 | no disponible | no disponible | 17 idiomas | Coqui Public Model License (no comercial en la practica) | PyTorch | Clonacion de voz zero-shot, licencia restrictiva para uso comercial |

La comparativa se limita a datos publicos generales; no se dispone de mediciones de calidad comparables entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se incluye una voz de referencia por idioma (dos en frances), lo que limita la variedad de timbres sin aportar clips adicionales.
- La calidad de la clonacion depende del clip de referencia; clips con ruido o duracion inadecuada pueden degradar el resultado.
- Riesgo de alucinacion o artefactos en la sintesis con entradas atipicas (simbolos, cifras, texto muy corto o mezclas de idiomas), no evaluado en la model card.
- El modelo base puede reproducir sesgos presentes en sus datos de entrenamiento; no se documentan evaluaciones de sesgo en la informacion disponible.
- Uso prohibido segun los terminos de Kyutai: suplantacion de voz sin consentimiento explicito, desinformacion, llamadas fraudulentas y contenido ilegal, difamatorio o que invada la privacidad.
- La licencia CC-BY-4.0 exige atribucion a Kyutai y a los autores de las voces de referencia; las voces `alba` y `juergen` son CC-BY-4.0, mientras que `estelle`, `fabien` y `lola` son CC0.
- No se documentan requisitos minimos de version de sherpa-onnx mas alla de la 2.0.1 mencionada para los checkpoints multilingues.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duf-1/pocket-tts-sherpa-onnx
- Modelo base Kyutai Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Voces de referencia Kyutai: https://huggingface.co/kyutai/tts-voices
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
