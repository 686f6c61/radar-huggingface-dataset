# AustinJiangH/voixful-granite-speech-5.0-470m-turboctc

## Resumen

`AustinJiangH/voixful-granite-speech-5.0-470m-turboctc` es una conversión del modelo de reconocimiento automático del habla `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM al formato **Apple Core AI**, cuantizado con el esquema Palette4. El autor, AustinJiangH, lo publica como artefacto listo para ejecución en dispositivo (on-device) sobre Apple Silicon, integrado en su motor Voixful y en la aplicación PrivoVoice. No es un modelo entrenado desde cero: es una redistribución derivada, bajo licencia Apache-2.0, de los pesos de IBM.

El modelo base es un conformer de atención por bloques de 470 M de parámetros con una cabeza CTC simple. Esa elección de diseño implica que la inferencia no requiere bucle de decodificación autorregresiva: se ejecuta un grafo por cada ventana de audio, lo que reduce la latencia y simplifica el despliegue en hardware de consumo. La salida es texto en minúsculas, sin puntuación, con números normalizados (por ejemplo, "12%").

Su relevancia actual es acotada pero concreta: cubre el nicho de ASR en inglés totalmente local en Macs y dispositivos Apple, sin llamadas a servicios en la nube. Ahora bien, el repositorio es de carácter comunitario, con 0 descargas y 0 likes en el momento de la consulta, y no publica resultados de evaluación propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con atención por bloques (block-attention) y cabeza CTC simple; conversión a Apple Core AI |
| Parámetros totales | 470 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa ventanas de audio; el tamaño de ventana no se especifica en la model card) |
| Tipos de cuantización | Palette4 (cuantización por paleta para Apple Core AI); la model card no detalla el número de bits ni otros formatos |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos Apple Core AI cuantizados con Palette4; repositorio de 0,3 GB; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un conformer de 470 M de parámetros con atención por bloques y una cabeza CTC (Connectionist Temporal Classification) sin decodificador autorregresivo. La consecuencia práctica es que cada ventana de audio se resuelve con un único grafo de cómputo: no hay bucle de decodificación token a token, lo que abarata la latencia y el consumo energético en inferencia local. La cabeza CTC produce directamente la secuencia de caracteres, de ahí que la salida aparezca en minúsculas, sin puntuación y con normalización numérica.

No se dispone de información sobre el volumen de tokens de audio, la composición del corpus de entrenamiento ni las etapas de alineación o ajuste del modelo base de IBM. Respecto a esta publicación concreta, la model card describe únicamente un proceso de conversión y cuantización a Apple Core AI; no se documenta reentrenamiento, destilación ni ajuste fino adicional, por lo que las capacidades acústicas deben atribuirse íntegramente al checkpoint original de IBM.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio mono, con salida de texto plano.
- Decodificación CTC no autorregresiva: una pasada por ventana de audio, sin bucle de generación.
- Normalización numérica en la salida (por ejemplo, "12%" en lugar de "doce por ciento").
- Ejecución completamente local en Apple Silicon mediante el runtime Apple Core AI.
- Integración con el motor Voixful y la aplicación PrivoVoice del mismo autor.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agente.
- No es multilingüe: únicamente inglés.
- No dispone de capacidades de visión, audio generativo, texto generativo ni modo "thinking".
- No produce puntuación, mayúsculas ni segmentación de frases; cualquier formato adicional requiere post-proceso externo.

## Casos de uso

- **Dictado local en aplicaciones de macOS e iOS**: el modelo transcribe la voz del usuario en el propio dispositivo con un único grafo por ventana de audio, lo que evita enviar audio a servidores y mantiene la latencia baja en frases cortas. Requiere un post-proceso de puntuación y capitalización si se busca texto listo para publicar.
- **Transcripción de reuniones con garantías de privacidad**: al ejecutarse sobre Apple Silicon sin conexión, encaja en entornos donde el audio no puede salir del dispositivo (despachos legales, clínicas, RR. HH.). La ausencia de puntuación se compensa con un modelo de restauración de formato aplicado después.
- **Subtitulado de contenido en inglés para revisión interna**: el CTC sin bucle de decodificación permite procesar ficheros por ventanas de forma secuencial y económica; los subtítulos resultantes se normalizan y se alinean temporalmente en la capa de aplicación.
- **Comandos de voz offline en entornos sin red**: plantas industriales, almacenes o equipos de campo donde no hay conectividad fiable. El modelo transcribe la orden en local y el sistema la interpreta con reglas o un parser determinista, dado que el modelo no hace function calling por sí mismo.
- **Indexación y búsqueda sobre archivos de audio locales**: transcripción masiva de notas de voz y grabaciones de un disco para construir un índice de texto consultable. La normalización numérica facilita la búsqueda de cifras, importes y porcentajes.
- **Preprocesado en pipelines de ASR**: uso como primera etapa rápida en inglés que genera una transcripción base, sobre la que se aplican modelos de puntuación, diarización o traducción en fases posteriores.
- **Accesibilidad en aplicaciones nativas de Apple**: subtitulado en vivo de conversaciones presenciales o de audio del sistema para personas con discapacidad auditiva, aprovechando que el modelo no abandona el dispositivo y no incurre en costes por minuto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de WER, comparaciones con el checkpoint original de IBM ni mediciones de latencia o throughput. Tampoco se documenta la degradación introducida por la cuantización Palette4 respecto a los pesos sin cuantizar.

## Requisitos de hardware

- **Huella en disco**: el repositorio completo ocupa 0,3 GB, coherente con 470 M de parámetros cuantizados; la memoria residente al cargar el modelo será algo superior, aunque no se publica una cifra oficial.
- **Plataforma**: Apple Core AI sobre Apple Silicon (familia M). El formato de pesos está atado a este runtime, por lo que no es directamente utilizable en GPU NVIDIA ni en CPU x86 sin reconversión.
- **GPU dedicadas**: no aplica; no hay soporte documentado para A100, H100 ni RTX 4090.
- **Hardware de consumo**: el objetivo declarado del modelo es precisamente el despliegue en dispositivo Apple, no en tarjetas gráficas de consumo.
- **Opciones de despliegue**: runtime Apple Core AI y motor Voixful. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF o safetensors publicados en este repositorio.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tiempo real (RTF) ni de palabras por segundo en ningún chip concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato / despliegue | Benchmarks |
|---|---|---|---|---|---|
| voixful-granite-speech-5.0-470m-turboctc | 470 M | Inglés | Apache-2.0 | Apple Core AI (Palette4), on-device | No disponible |
| ibm-granite/granite-speech-5.0-470m-turboctc (base) | 470 M | Inglés | Apache-2.0 | Pesos originales para frameworks de inferencia estándar | No disponible en esta ficha |
| whisper-small | 244 M (dato público del ecosistema) | Multilingüe | MIT (dato público del ecosistema) | Safetensors, GGUF, ONNX, múltiples runtimes | No disponible en esta ficha |
| whisper-base | 74 M (dato público del ecosistema) | Multilingüe | MIT (dato público del ecosistema) | Safetensors, GGUF, ONNX, múltiples runtimes | No disponible en esta ficha |

Nota: los datos de las alternativas provienen de conocimiento general del ecosistema y no han sido verificados en la información proporcionada para esta ficha; los campos no confirmados se marcan como no disponibles. La comparación relevante es frente al checkpoint base de IBM, del que este repositorio es una conversión cuantizada y no una mejora: el interés diferencial está en el formato de despliegue (Core AI, on-device), no en la calidad acústica.

## Limitaciones y advertencias

- **Monolingüe**: solo inglés; no hay soporte declarado para castellano ni para ninguna otra lengua.
- **Formato de salida restringido**: texto en minúsculas, sin puntuación y sin mayúsculas. Publicar la salida tal cual produce texto de baja calidad editorial; es obligatorio un post-proceso.
- **Normalización numérica agresiva**: expresiones como "12%" se emiten ya normalizadas, lo que puede ser indeseable en dominios donde se necesita la forma hablada literal o la transcripción palabra por palabra (por ejemplo, corpus lingüísticos o verificación forense).
- **Riesgo de sustitución en audio degradado**: al ser un modelo CTC sin modelo de lenguaje externo, los errores típicos son sustituciones y omisiones de palabras en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento. No se publica ninguna métrica de WER que permita acotar este riesgo.
- **Degradación por cuantización no medida**: la conversión a Palette4 puede alterar la precisión respecto al checkpoint original; no hay evaluación comparativa publicada.
- **Madurez del repositorio**: 0 descargas, 0 likes y ausencia de documentación de evaluación. Es un artefacto comunitario, no una publicación validada por IBM.
- **Dependencia de plataforma**: el formato Core AI limita el uso a Apple Silicon; migrar a otro stack exige reconvertir los pesos originales.
- **Sesgos**: no se documenta la composición del corpus de entrenamiento del modelo base, por lo que no es posible evaluar sesgos dialectales, de género o de edad. No se han publicado análisis al respecto.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero exige conservar los avisos de copyright y atribución a IBM sobre los pesos derivados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AustinJiangH/voixful-granite-speech-5.0-470m-turboctc
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Motor Voixful (GitHub): https://github.com/AustinJiangH/voixful
- Aplicación PrivoVoice (GitHub): https://github.com/AustinJiangH/PrivoVoice
