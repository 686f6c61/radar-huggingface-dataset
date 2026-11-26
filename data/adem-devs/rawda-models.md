# adem-devs/rawda-models

## Resumen

Rawda es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion del Coran en arabe, distribuido en formato GGML cuantizado q8_0 para su uso con whisper.cpp. Lo publica el desarrollador `adem-devs` como componente del motor de seguimiento de recitacion de la aplicacion movil "Rawda — Le jardin du Coran", que evalua la recitacion de los ninos de forma completamente local en el dispositivo, sin enviar audio a servidores externos.

Tecnicamente no es un modelo entrenado desde cero: es una conversion y cuantizacion del modelo `tarteel-ai/whisper-base-ar-quran` de Tarteel AI (licencia Apache-2.0), un Whisper Base adaptado al arabe coranico. La arquitectura subyacente es, por tanto, la de Whisper Base (transformer encoder-decoder con 74 millones de parametros y ventana de audio de 30 segundos), aunque la model card no detalla el proceso de ajuste original.

Su relevancia es acotada pero clara: ofrece un artefacto listo para desplegar en inferencia local (movil, escritorio, Raspberry Pi) para una tarea muy concreta —transcribir recitacion coranica en arabe— y sirve como ejemplo de distribucion de modelos ASR en formato GGML dentro de aplicaciones de consumo. El repositorio ocupa 0,1 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Base (transformer encoder-decoder para ASR), heredada de `tarteel-ai/whisper-base-ar-quran` |
| Parametros totales | 74 millones (Whisper Base; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; Whisper Base procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | q8_0 (unico fichero publicado: `ggml-quran-base-q8_0.bin`) |
| Idiomas soportados | arabe (`ar`), orientado a recitacion coranica |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo es una conversion del checkpoint `tarteel-ai/whisper-base-ar-quran` de Tarteel AI al formato GGML mediante el script `convert-h5-to-ggml.py` de whisper.cpp, seguida de una cuantizacion q8_0. La arquitectura es la de Whisper Base: encoder-decoder transformer con attention multi-cabeza, preprocesamiento de audio en espectrogramas Mel y decodificacion autoregresiva de tokens de texto, con una ventana de entrada fija de 30 segundos de audio.

La model card no aporta informacion sobre el dataset de entrenamiento original, el numero de tokens, el proceso de ajuste fino de Tarteel AI ni si hubo tecnicas de alineacion. Tampoco documenta el procedimiento de cuantizacion mas alla de indicar el script y el tipo q8_0. La unica innovacion tecnica reseñable es la propia cadena de conversion: empaquetar un modelo ASR especializado en un binario GGML de ~0,1 GB ejecutable en el telefono sin conexion.

## Capacidades

- Transcripcion de voz a texto en arabe, con especializacion en recitacion coranica.
- Ejecucion totalmente local mediante whisper.cpp, sin dependencia de red.
- Inferencia en dispositivos de recursos limitados gracias a la cuantizacion q8_0 y al tamano reducido del modelo.
- Seguimiento de recitacion: la aplicacion que lo usa compara la transcripcion con el texto esperado para detectar errores del recitador.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta vision, audio generativo ni modo de razonamiento explicito.
- Capacidad multilingue limitada al arabe; no se documenta soporte de otros idiomas.

## Casos de uso

- Aplicaciones educativas de memorizacion del Coran: el modelo transcribe la recitacion del nino en el dispositivo y la aplicacion la contrasta con el texto canonico para señalar omisiones o errores, sin enviar audio a la nube.
- Verificacion de recitacion en entornos sin conectividad: escuelas, mezquitas o zonas rurales donde whisper.cpp con un binario de 0,1 GB funciona en moviles de gama media.
- Prototipado rapido de ASR arabe: sirve como linea base para evaluar la viabilidad de un pipeline de reconocimiento de voz coranico antes de invertir en modelos mayores.
- Investigacion sobre ASR especializado en dominios religiosos: permite reproducir y comparar el comportamiento de un Whisper Base ajustado al arabe coranico frente al Whisper Base generico.
- Integracion en aplicaciones de escritorio o embebidas: al ser GGML, puede desplegarse con whisper.cpp en Raspberry Pi u otros dispositivos ARM para transcripcion local de sesiones de recitacion.
- Evaluacion de tecnicas de cuantizacion: el fichero q8_0 permite medir la perdida de precision frente al checkpoint original en una tarea de dominio estrecho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en q8_0 (modelo de 74 millones de parametros y fichero de ~0,1 GB); cabe en CPU y en memoria unificada de moviles.
- GPU recomendadas: no requiere GPU; whisper.cpp ejecuta el modelo en CPU. Cualquier GPU con unos pocos GB de VRAM puede alojarlo, pero no aporta ventaja significativa frente a CPU para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU consumer, e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: whisper.cpp (formato nativo GGML), con bindings para iOS, Android, Python y linea de comandos. No es compatible directamente con vLLM, TGI ni Ollama en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware y de la duracion del audio (ventanas de 30 segundos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Rawda (`adem-devs/rawda-models`) | 74 M (Whisper Base) | Ventana de audio de 30 s | Arabe (coranico) | Apache-2.0 | GGML q8_0 | Hugging Face |
| `tarteel-ai/whisper-base-ar-quran` | 74 M (Whisper Base) | Ventana de audio de 30 s | Arabe (coranico) | Apache-2.0 | Checkpoint original (H5/PyTorch) | Hugging Face |
| Whisper Base original (OpenAI) | 74 M | Ventana de audio de 30 s | Multilingue (99 idiomas) | MIT | PyTorch, GGML via whisper.cpp | Hugging Face, OpenAI |
| Whisper Large-v3 (OpenAI) | 1.550 M | Ventana de audio de 30 s | Multilingue (99 idiomas) | MIT | PyTorch, GGML via whisper.cpp | Hugging Face, OpenAI |

Rawda se diferencia de su modelo de origen unicamente en el formato y la cuantizacion; frente a Whisper Base generico gana especializacion en arabe coranico a costa de cobertura multilingue, y frente a Whisper Large-v3 pierde precision general pero reduce el coste de despliegue en mas de un orden de magnitud.

## Limitaciones y advertencias

- Es una conversion de otro modelo: cualquier sesgo o error del checkpoint de Tarteel AI se hereda sin cambios.
- La cuantizacion q8_0 puede introducir una perdida de precision no cuantificada en la model card; no hay evaluacion publicada del impacto.
- Dominio muy estrecho: el rendimiento fuera de la recitacion coranica en arabe no esta documentado y probablemente sea deficiente.
- Sin soporte documentado de otros idiomas ni de audio no coranico.
- Riesgo de alucinacion en la transcripcion, especialmente con ruido de fondo, voces infantiles o recitacion con pausas atipicas; no se han publicado tasas de error (WER).
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo de origen y de whisper.cpp (MIT) al redistribuir.
- Repositorio con 0 descargas y actualizado una sola vez: no hay evidencia de mantenimiento, issues resueltos ni comunidad.
- La model card esta en frances y no documenta el proceso de entrenamiento original, lo que dificulta la reproducibilidad.
- Para produccion, el formato GGML limita el uso de frameworks de serving estandar (vLLM, TGI); habria que usar whisper.cpp o reconvertir el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/adem-devs/rawda-models
- Modelo de origen (Tarteel AI): https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- whisper.cpp (repositorio y script de conversion): https://github.com/ggerganov/whisper.cpp
- Whisper (OpenAI): https://github.com/openai/whisper
