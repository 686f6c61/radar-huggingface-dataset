# HojoAI/Hojo-ASR-V1.5

## Resumen

Hojo-ASR-V1.5 es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario HojoAI bajo licencia Apache 2.0. El repositorio no incluye una model card sustantiva: el README se limita a la declaración de licencia, sin descripción de arquitectura, datos de entrenamiento, idiomas soportados ni instrucciones de uso. El modelo se publicó el 26 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en la plataforma.

La única referencia externa localizada es un artículo en arXiv sobre M5-TTS (un sistema text-to-speech multilingüe y multidialectal a pequeña escala) que menciona un modelo ASR como componente de evaluación y cita el repositorio GitHub del mismo autor, HojoAI/Hojo-TTS-Light. Esto sugiere que Hojo-ASR-V1.5 podría emplearse como evaluador de intelligibilidad en pipelines TTS, pero no confirma que sea su función principal ni aporta detalles técnicos sobre el propio modelo ASR.

La relevancia actual del modelo es, por tanto, limitada y difícil de evaluar: sin especificaciones publicadas, sin benchmarks y sin documentación de uso, su adopción en producción exigiría una validación empírica completa por parte del integrador. Esta ficha recoge exclusivamente los datos verificables disponibles y marca como "no disponible" todo aquello que el autor no ha hecho público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los resultados de búsqueda disponibles. No consta si se trata de un transformer encoder, un modelo híbrido CTC/attention, un sistema basado en Conformer, Whisper-like o cualquier otra familia arquitectónica habitual en ASR.

Tampoco hay datos sobre el corpus de entrenamiento (horas de audio, composición lingüística, dominio, presencia de ruido o code-switching), sobre el uso de técnicas de aumento de datos, destilación o ajuste fino supervisado. La única pista contextual es la mención del modelo en el artículo de M5-TTS como sistema ASR de referencia para métricas de error (MER y CER) en evaluación de TTS multilingüe y multidialectal, lo que podría indicar capacidades multilingües, pero se trata de una inferencia no confirmada por el autor.

## Capacidades

- Reconocimiento automático del habla: la denominación del modelo y su uso citado en el paper de M5-TTS como evaluador ASR sugieren transcripción de audio a texto, aunque no se detalla el formato de entrada ni de salida.
- Evaluación de intelligibilidad en pipelines TTS: el paper de M5-TTS lo emplea para calcular MER (Match Error Rate) y CER (Character Error Rate) sobre audio sintetizado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es una capacidad esperable en un modelo ASR).
- Capacidades multilingües: no confirmadas oficialmente; el contexto del paper de M5-TTS es multilingüe y multidialectal, pero el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio nativo, diarización): no disponible.

## Casos de uso

- Evaluación automática de sistemas TTS: usar el modelo para transcribir audio sintetizado y calcular MER y CER contra la transcripción de referencia, tal como se describe en el artículo de M5-TTS. Es el único caso de uso documentado de forma indirecta.
- Transcripción de audio en prototipos de investigación: al estar bajo Apache 2.0, puede integrarse en experimentos académicos sin restricciones de licencia, siempre que el equipo valide previamente su calidad con su propio conjunto de test.
- Benchmarking interno de otros modelos ASR: emplearlo como línea base adicional en comparaciones, asumiendo que su rendimiento no está publicado y debe medirse empíricamente.
- Pipelines de subtitulado en entornos controlados: solo tras validar la tasa de error en el dominio objetivo (idioma, acento, calidad de micrófono), dado que no hay especificaciones de idioma ni de robustez.
- Componente de sistemas de voz conversacionales: integrado como etapa ASR en un pipeline más amplio (ASR + LLM + TTS), con la advertencia de que la ausencia de documentación obliga a una fase de pruebas exhaustiva.
- Investigación sobre TTS multilingüe: su mención en el ecosistema de M5-TTS lo hace candidato a reutilizarse como evaluador en estudios de síntesis de voz en varios idiomas y dialectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de M5-TTS menciona el uso de un modelo ASR para reportar MER y CER en porcentaje, pero no se confirma que Hojo-ASR-V1.5 sea el modelo empleado ni se ofrecen cifras asociadas a él.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, Whisper.cpp, etc.): no disponible; al no conocerse la arquitectura, no puede confirmarse el soporte en ningún runtime concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa sin conocer el tamaño, la arquitectura ni los idiomas del modelo. A modo orientativo, se indican alternativas consolidadas de ASR open source que un integrador debería considerar mientras no haya datos públicos de Hojo-ASR-V1.5:

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| Hojo-ASR-V1.5 | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |
| Whisper large-v3 (OpenAI) | ~1.550 M | ventanas de 30 s | ~99 idiomas | MIT | WER publicados por idioma |
| Whisper small (OpenAI) | ~244 M | ventanas de 30 s | multilingüe | MIT | WER publicados |
| Parakeet / Conformer-CTC (NVIDIA NeMo) | variable (decenas a cientos de M) | audio largo con chunking | principalmente inglés | Apache 2.0 / CC-BY-4.0 segun variante | WER en LibriSpeech y otros |

La comparación de rendimiento con Hojo-ASR-V1.5 queda pendiente de que el autor publique métricas o de que terceros las midan.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, entrenamiento, idiomas ni uso previsto; cualquier integración requiere validación empírica propia.
- Idiomas no declarados: no puede asumirse cobertura multilingüe ni un rendimiento concreto en castellano sin pruebas.
- Sin benchmarks: no hay evidencia pública de WER, MER ni CER que permita comparar con alternativas consolidadas.
- Riesgo de alucinación y errores de transcripción: inherente a todo sistema ASR, agravado aquí por la falta de métricas publicadas; en dominios con ruido, acentos o vocabulario técnico el riesgo es mayor.
- Sesgos desconocidos: al no publicarse la composición del corpus de entrenamiento, no puede evaluarse el sesgo por acento, género, edad o dialecto.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios, pero no exime al integrador de validar la calidad y el cumplimiento normativo (por ejemplo, protección de datos en grabaciones).
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día; no hay historial de mantenimiento ni issues que permitan juzgar su estabilidad.
- Sin pipeline declarado en Hugging Face: no se especifica la tarea (`automatic-speech-recognition` u otra), lo que complica el uso directo con `transformers` o `pipeline()` sin inspeccionar los archivos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HojoAI/Hojo-ASR-V1.5
- Paper M5-TTS (arXiv, mención del modelo ASR y del ecosistema HojoAI): https://arxiv.org/html/2611.10162v1
- Repositorio GitHub citado en el paper (Hojo-TTS-Light): https://github.com/HojoAI/Hojo-TTS-Light
