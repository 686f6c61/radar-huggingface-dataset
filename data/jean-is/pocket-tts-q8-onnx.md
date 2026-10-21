# jean-is/pocket-tts-q8-ONNX

## Resumen

Pocket TTS Q8 ONNX es una conversión y cuantización a 8 bits del modelo de síntesis de voz Pocket TTS de Kyutai, publicada por el desarrollador jean-is para ejecutarse íntegramente en el navegador. El paquete contiene los grafos ONNX originales de la comunidad (KevinAHM/pocket-tts-onnx) repoblados con los pesos más recientes de kyutai/pocket-tts-without-voice-cloning, cuantizados a int8 por canal de salida y empaquetados en un binario por idioma más un decoder Mimi compartido. Cubre seis idiomas: inglés, alemán, francés, español, italiano y portugués.

La relevancia del artefacto es de ingeniería de despliegue más que de modelado: demuestra que un TTS neuronal completo (acondicionador de texto, flow LM y códec Mimi) cabe en unos 96-98 MB por idioma y se ejecuta con ONNX Runtime Web sobre un único hilo de WebAssembly, sin WebGPU, en Chromium y WebKit. En un M3 Max reporta 2,1x velocidad respecto a tiempo real en Chromium y 2,3x en WebKit, con un primer sonido a los 0,18-0,26 s tras la pulsación.

No es un modelo entrenado desde cero ni un fine-tune: es una redistribución cuantizada con cambios declarados bajo CC BY 4.0 (pesos nuevos, cuantización, empaquetado, sustitución de voces sin licencia documentada). La licencia del modelo base y de esta conversión es CC BY 4.0, con las restricciones de uso de Kyutai contra suplantación y engaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal por grafos ONNX separados: acondicionador de texto, flow LM (main y flow) y decoder Mimi (códec neuronal de Kyutai) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplica como ventana de contexto de LLM; la generación se limita por fórmula de frames) |
| Tipos de cuantizacion | int8 por canal de salida con escala fp32 por canal; expansión a fp32 en tiempo de carga |
| Idiomas soportados | en, de, fr, es, it, pt |
| Licencia | CC BY 4.0 |
| Formato de pesos | binarios propios `.bin` con grafos ONNX embebidos y datos externos `.f32` generados en carga; `decoder.bin` separado; metadatos en `pocket-tts.json` |
| Frecuencia de muestreo de audio | 24.000 muestras por segundo |
| Tamano del repositorio | 0,6 GB |
| Tamano por idioma | en 96.959.384 B; de 96.960.330 B; fr 98.287.871 B; es 96.174.542 B; it 94.847.414 B; pt 96.961.378 B |
| Tamano del decoder | 10.632.423 B (`decoder.bin`) |
| Runtime objetivo | ONNX Runtime Web sobre WebAssembly, un solo hilo, sin WebGPU |
| Pipeline | text-to-speech |
| Voces incluidas | alba (en, de, pt), estelle (fr), lola (es), giovanni (it); una voz por idioma |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS de Kyutai, descompuesta en tres grafos por idioma: un acondicionador de texto, un flow LM principal y un flow LM de flujo, más un decoder Mimi independiente y compartido entre idiomas. La generación usa flow matching con un paso LSD, temperatura 0,3 y un criterio de parada basado en `eos_logit` (cierre al superar -4 tras un mínimo de 6 frames, más 3 frames adicionales, o 5 si la entrada tiene 4 palabras o menos), con un límite máximo de `ceil((tokens / 3 + 2) × 12.5)` frames. El decoder Mimi debe consumirse en streaming, unos pocos latentes por llamada, porque en una sola llamada se degrada a partir de unos 40 latentes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni las etapas de alineación o RLHF del modelo original en la información proporcionada; esos detalles corresponden a la model card de kyutai/pocket-tts, no incluida aquí. Lo que sí está documentado es el proceso de esta conversión: los pesos fijados por pocket-tts 4.0.0 (revisión `575d143` para inglés, `1e08e6a` para el resto) se insertaron en los grafos de la comunidad emparejando cada inicializador por valor, la cuantización redondea cada tensor a int8 por canal con escala fp32, y cada idioma se empaqueta en un binario que contiene sus tres grafos, el estado de la voz y el tokenizer (SentencePiece Unigram con byte fallback). El mapeo se validó reconstruyendo el grafo inglés antiguo bit a bit. Se sustituyeron las voces por defecto de alemán (juergen) y portugués (rafael) por alba, al no declarar aquellas licencia, y se excluyó el neerlandés por no estar documentado por Kyutai.

## Capacidades

- Síntesis de voz a partir de texto en inglés, alemán, francés, español, italiano y portugués, a 24 kHz.
- Ejecución local en navegador de escritorio con ONNX Runtime Web sobre WebAssembly de un solo hilo, sin necesidad de WebGPU ni de servidor.
- Carga por idioma bajo demanda: solo se descarga y expande el binario del idioma activo, más el decoder compartido.
- Normalización de texto previa específica por idioma: caracteres sustituidos, tratamiento de puntos y coma, relleno, marca final, capitalización y temperatura de muestreo definidas en `pocket-tts.json`.
- Streaming de audio: el decoder Mimi produce latentes de forma incremental, lo que permite reproducir mientras se genera.
- Reproducción verificada en Chromium y WebKit (Safari) sobre macOS (M3 Max).
- No soporta clonación de voz: cada idioma lleva una única voz predefinida embebida como estado de atención.
- No es un modelo de propósito general: no hace tool calling, razonamiento multi-paso ni generación de código; su única tarea es texto a voz.

## Casos de uso

- Lectura de artículos y documentos en el navegador: el propio autor usa estos ficheros en el lector de Jean, que carga el binario del idioma en 0,7 s en Chromium y reproduce el primer sonido a los 0,18-0,26 s, suficiente para una experiencia de lectura fluida sin backend.
- Asistentes de voz en aplicaciones web con privacidad por diseño: al ejecutarse en WebAssembly dentro del navegador, el texto del usuario no sale del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Accesibilidad web: narración de contenido para usuarios con discapacidad visual o dificultades lectoras, integrável como capa de audio en una PWA sin dependencias de red.
- Aprendizaje de idiomas: reproducción de frases en seis lenguas con una voz nativa por idioma, útil para ejercicios de comprensión y pronunciación en aplicaciones educativas.
- Pre-generación de audio para e-learning multilingüe: dado que el modelo corre en CPU a 2,1-2,3x tiempo real en un solo hilo, se puede usar para batchear la narración de un curso en varios idiomas antes de publicarlo.
- Notificaciones y avisos hablados en paneles de operaciones o herramientas internas: mensajes cortos de menos de cuatro palabras usan la ruta de parada rápida (5 frames extra), lo que reduce la latencia en alertas.
- Prototipado de interfaces conversacionales sin GPU: permite validar flujos de voz en un portátil o en CI con navegador headless, sin aprovisionar infraestructura de inferencia.

## Benchmarks y rendimiento

Precisión medida como porcentaje de palabras que Whisper large-v3-turbo transcribió erróneamente al releer el audio generado, sobre 10 frases de FLEURS por idioma (9 en italiano):

| Idioma | Chromium | WebKit |
|---|---:|---:|
| en | 3,7% | 3,7% |
| de | 7,4% | 6,8% |
| fr | 2,6% | 2,2% |
| es | 2,9% | 2,4% |
| it | 4,5% | 4,5% |
| pt | 4,3% | 4,3% |

Métricas de despliegue medidas en un Apple M3 Max con el lector de Jean:

| Metrica | Chromium | WebKit |
|---|---:|---:|
| Primer sonido tras la pulsación | 0,18-0,26 s | 0,18-0,26 s |
| Velocidad de sintesis (1 hilo) | 2,1x tiempo real | 2,3x tiempo real |
| Carga del idioma desde cache | 0,7 s | ~2 s |

No se han publicado resultados de benchmarks estándar de TTS (MOS, CMOS, RTF comparativo con otros sistemas) en la información disponible.

## Requisitos de hardware

- Huella en disco: 0,6 GB para el repositorio completo; en uso solo se necesita el binario del idioma (94,8-98,3 MB) más `decoder.bin` (10,6 MB).
- Memoria en ejecución: los pesos se expanden de int8 a fp32 al cargar, por lo que el consumo real de RAM es varias veces el tamano en disco (la cifra exacta de datos externos fp32 no está publicada; el orden de magnitud sería de unos cientos de MB por idioma).
- GPU: no requiere GPU. El runtime objetivo es ONNX Runtime Web sobre WebAssembly con un solo hilo y sin WebGPU.
- Cabe en cualquier equipo de consumo: la referencia medida es un Apple M3 Max, pero el diseño apunta a portátiles y navegadores convencionales.
- Despliegue: servidor estático sirviendo los `.bin` y `pocket-tts.json`, o empaquetado en una aplicación web; el lector de referencia está en `app/caps/reader/` del repositorio de Jean. Para inferencia fuera del navegador se puede usar ONNX Runtime nativo, aunque no hay documentación específica en esta ficha.
- Latencia y throughput: 0,18-0,26 s hasta el primer sonido, 2,1-2,3x tiempo real en un hilo, carga de 0,7 s (Chromium) a ~2 s (WebKit).
- Restricción operativa: el decoder debe consumirse en streaming con pocos latentes por llamada; por encima de unos 40 latentes en una sola llamada la salida se degrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| jean-is/pocket-tts-q8-ONNX | no disponible | no disponible | 6 | int8 por canal | CC BY 4.0 | binarios con grafos ONNX |
| kyutai/pocket-tts (base) | no disponible | no disponible | según revisión de origen (incluye neerlandés no documentado) | pesos originales sin cuantizar | CC BY 4.0 | safetensors/formato original |
| KevinAHM/pocket-tts-onnx | no disponible | no disponible | grafos exportados de checkpoints anteriores | grafos ONNX sin cuantizar a 8 bits | CC BY 4.0 | ONNX |

La diferencia práctica entre las tres versiones es el peso en disco y la portabilidad: la variante de jean-is reduce cada idioma a menos de 100 MB y añade el empaquetado de voz, tokenizer y reglas de texto en un único fichero, mientras que el repositorio base y el de KevinAHM no están optimizados para ejecución en navegador. No se dispone de datos de rendimiento comparables de alternativas de TTS de otros autores (Piper, Kokoro, XTTS y similares) en la información proporcionada.

## Limitaciones y advertencias

- Una única voz por idioma y sin clonación de voz: no sirve para personalizar locutores ni para doblaje con identidades concretas.
- Los dígitos son un punto débil documentado; deletrear los números mejora la lectura, y el límite de frames evita bucles infinitos pero no corrige la pronunciación.
- El decoder Mimi se degrada si se le pasan más de unos 40 latentes en una sola llamada; la integración debe ser necesariamente en streaming.
- Sin WebGPU: el rendimiento depende de WebAssembly en un solo hilo; los tiempos citados son de un M3 Max y no se han publicado medidas en hardware más modesto.
- Cobertura lingüística limitada a seis idiomas; el neerlandés se excluyó deliberadamente por falta de documentación de Kyutai.
- La licencia CC BY 4.0 exige atribución a Kyutai y a los autores de las voces y de los grafos ONNX, e indica que se declaren los cambios realizados (cuantización, repoblado de pesos, sustitución de voces).
- Las condiciones de uso de Kyutai prohíben emplear el modelo para suplantar a personas sin su consentimiento, para engañar o para contenido ilícito; esas restricciones se heredan en esta conversión.
- Riesgo de alucinación acústica: al ser un modelo generativo, puede producir artefactos o pronunciaciones incorrectas no presentes en el texto, especialmente con texto no normalizado o signos de puntuación atípicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de estos ficheros más allá de las mediciones del autor.
- Los resultados de error de palabra se midieron con Whisper large-v3-turbo sobre 9-10 frases por idioma, una muestra pequena; no deben extrapolarse a un MOS ni a una evaluación perceptual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jean-is/pocket-tts-q8-ONNX
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Pesos de origen sin clonación de voz: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Grafos ONNX de la comunidad: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Kyutai: https://kyutai.org
- Lector de referencia (código): https://github.com/jean-is/jean/tree/main/app/caps/reader
- Jean: https://jean.is
- Dataset FLEURS usado en las mediciones: https://huggingface.co/datasets/google/fleurs

Nota: la búsqueda web realizada devolvió únicamente resultados sobre la prenda vaquera "jean" (Zara, Zalando, Levi's, Kiabi, Wikipedia), sin relación con el modelo; no se han podido incorporar enlaces adicionales de papers o blogs a partir de esa búsqueda.
