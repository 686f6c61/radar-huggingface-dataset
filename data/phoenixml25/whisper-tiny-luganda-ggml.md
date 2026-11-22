# phoenixml25/whisper-tiny-luganda-ggml

## Resumen

Whisper tiny, Luganda: whisper.cpp (ggml) es una conversión de formato del modelo `waxal-benchmarking/whisper-tiny-waxal-lug`, un Whisper Tiny de OpenAI afinado sobre el corpus WAXAL para reconocimiento automático de voz en luganda. Lo publica el usuario `phoenixml25` y su único valor añadido es empaquetar los pesos en formato ggml (f16, 77,7 MB) para que puedan ejecutarse con whisper.cpp y, por extensión, en entornos móviles como whisper.rn. Los pesos, la arquitectura, el tokenizador y el vocabulario son idénticos a los del modelo original.

El modelo resuelve un problema muy concreto: llevar ASR en luganda a dispositivos con recursos limitados sin depender de la nube. Al tratarse de la variante tiny de Whisper (arquitectura transformer encoder-decoder de 39 M de parámetros), el coste computacional es mínimo y el binario cabe holgadamente en cualquier teléfono moderno. La contrapartida es una precisión modesta: el autor reporta un WER del 33,8 % y un CER del 12,8 % sobre habla conversacional del corpus WAXAL.

Es relevante ahora porque el luganda es un idioma de bajos recursos con escasa cobertura en sistemas ASR comerciales, y las iniciativas como WAXAL (Google y socios) están generando datos y modelos abiertos para lenguas africanas. Esta conversión facilita la integración práctica en aplicaciones offline, aunque su adopción es todavía nula (0 descargas, 0 likes en el momento de la consulta) y el repositorio es de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 39 M (variante tiny de Whisper; no se explicita en la model card, se deduce de la arquitectura base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s; el dato no se explicita en la informacion proporcionada) |
| Tipos de cuantizacion | f16 (unico fichero publicado, `ggml-tiny-lug.bin`) |
| Idiomas soportados | luganda (`lg`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ggml (binario whisper.cpp), 77.691.730 bytes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Tiny de OpenAI: un transformer encoder-decoder con atención multi-cabeza estándar, preprocesamiento de audio a mel-espectrogramas y decodificación autorregresiva de tokens de texto. El modelo original fue afinado por el proyecto WAXAL sobre el corpus WAXAL (Google y socios) para luganda, partiendo de los pesos preentrenados de Whisper. Esta publicación no entrena nada nuevo: solo convierte los pesos a ggml f16 para whisper.cpp, manteniendo intactos arquitectura, tokenizador y vocabulario.

Un detalle técnico relevante es que el modelo original se entrenó sin token de idioma de Whisper. Por ello, el autor recomienda fijar el idioma a `sw` (suajili) en whisper.cpp: produce el mismo texto que la autodetección y es más rápido. No se dispone de información sobre el volumen de tokens de audio, la composición exacta del dataset WAXAL ni si hubo etapas de RLHF o DPO; la model card solo remite al paper arXiv:2606.02375 para los detalles del entrenamiento original.

## Capacidades

- Reconocimiento automático de voz (ASR) en luganda, con salida de texto transcrito.
- Ejecución on-device mediante whisper.cpp y ggml, sin dependencia de servicios en la nube.
- Integración en aplicaciones móviles a través de whisper.rn (React Native) y otros bindings de whisper.cpp.
- Funcionamiento offline una vez descargado el binario de 77,7 MB.
- Inferencia en CPU sin necesidad de GPU, gracias al tamaño reducido del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al luganda; no se ha validado su comportamiento en otros idiomas.

## Casos de uso

- Transcripción offline en aplicaciones móviles para hablantes de luganda: el binario ggml de 77,7 MB se integra con whisper.rn y permite dictado o notas de voz sin conexión, algo crítico en regiones con conectividad intermitente.
- Subtitulado de contenido audiovisual en luganda: se puede procesar audio pregrabado por lotes con whisper.cpp en un servidor modesto, generando subtítulos para vídeos educativos o divulgativos.
- Atención al cliente en centros de llamadas locales: transcripción de conversaciones para análisis de calidad y búsqueda posterior, aceptando el WER del 33,8 % como limitación que exige revisión humana.
- Documentación clínica o administrativa dictada: captura de notas de voz en luganda en entornos con equipos de bajos recursos, donde un modelo tiny en CPU evita costes de infraestructura.
- Investigación lingüística y creación de corpus: herramienta de bajo coste para transcribir grabaciones de campo y ampliar datasets de luganda, con corrección manual posterior.
- Prototipado rápido de interfaces de voz: gracias a su tamaño mínimo, sirve para validar flujos de ASR en luganda antes de invertir en modelos mayores o servicios comerciales.
- Educación y accesibilidad: transcripción de clases o materiales en luganda para estudiantes con discapacidad auditiva, ejecutándose en hardware asequible.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del modelo original, reportados por el autor de la conversión:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| WER | 33,8 % | WAXAL, habla conversacional |
| CER | 12,8 % | WAXAL, habla conversacional |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el binario f16 ocupa 77,7 MB y la inferencia en CPU es viable con menos de 1 GB de RAM disponible.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU compatible con whisper.cpp acelera la inferencia, pero el modelo está pensado para CPU.
- Cabe en cualquier GPU de consumo e incluso en teléfonos móviles modernos; el tamaño es inferior a 100 MB.
- Opciones de despliegue: whisper.cpp (formato nativo), whisper.rn para React Native y otros bindings de whisper.cpp. No es compatible directamente con vLLM, TGI ni llama.cpp, que no soportan este formato de ASR.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-tiny-luganda-ggml (este) | 39 M (tiny) | ventanas de 30 s (Whisper) | luganda | CC BY 4.0 | ggml f16 |
| waxal-benchmarking/whisper-tiny-waxal-lug | 39 M (tiny) | ventanas de 30 s (Whisper) | luganda | CC BY 4.0 | safetensors (formato original) |
| Whisper Tiny original (OpenAI) | 39 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | PyTorch / safetensors |
| Whisper Small (OpenAI) | 244 M | ventanas de 30 s | multilingue | MIT | PyTorch / safetensors |

La comparación con Whisper Tiny original es la más directa: misma arquitectura y tamaño, pero el original no está especializado en luganda y su licencia MIT es más permisiva que la CC BY 4.0 de esta conversión. Frente a Whisper Small, este modelo ofrece menor precisión potencial pero un tamaño seis veces menor, lo que determina su viabilidad en dispositivos móviles.

## Limitaciones y advertencias

- Precisión limitada: un WER del 33,8 % sobre habla conversacional implica que aproximadamente uno de cada tres errores de palabra requiere corrección humana; no es apto para transcripción automática sin supervisión en contextos críticos.
- Sesgos desconocidos: la model card no documenta sesgos demográficos, dialectales o de género del corpus WAXAL; el rendimiento puede variar según el acento o registro del hablante.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente con audio de baja calidad.
- Limitación de idioma: solo se ha validado en luganda; no se garantiza un comportamiento correcto en otros idiomas ni en code-switching.
- Restricción de uso: el autor remite a la model card original, que prohíbe el uso para grabación encubierta o vigilancia. La licencia CC BY 4.0 exige atribución, también en usos comerciales.
- Formato específico: al ser un binario ggml, no es utilizable con frameworks de inferencia estándar (PyTorch, vLLM, TGI); requiere whisper.cpp o bindings compatibles.
- Configuración de idioma: debe fijarse `sw` en whisper.cpp para obtener el mismo resultado que la autodetección con mayor velocidad; usar otro código puede degradar la salida.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phoenixml25/whisper-tiny-luganda-ggml
- Modelo base original: https://huggingface.co/waxal-benchmarking/whisper-tiny-waxal-lug
- Paper WAXAL: https://arxiv.org/abs/2606.02375
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Organización WAXAL en Hugging Face: https://huggingface.co/waxal-benchmarking
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
