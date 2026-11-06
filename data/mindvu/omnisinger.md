# mindvu/OmniSinger

## Resumen

OmniSinger es un checkpoint afinado del modelo de síntesis de voz OmniVoice, desarrollado por mindvu, orientado específicamente a la generación de voz cantada a partir de texto con control explícito de nota y duración. A diferencia de un TTS convencional, la entrada no es texto plano sino una línea de letra en la que cada palabra lleva asociada una etiqueta `{pitch:duration}`: la altura se expresa como número de nota MIDI y la duración en centésimas de segundo, lo que permite fijar la melodía y el ritmo de la interpretación. El modelo toma además un clip de referencia de voz corto para condicionar el timbre del resultado.

Con 612.577.288 parámetros (aproximadamente 0,6B) y un peso de repositorio de 2,5 GB, OmniSinger se sitúa en la gama ligera de modelos de audio, lo que lo hace desplegable en hardware de consumo. Soporta inglés y vietnamita, incluyendo mezcla de ambos idiomas en una misma línea, y añade capacidades de melisma (una palabra cantada sobre varias notas). La salida es audio mono a 24 kHz.

Su relevancia actual reside en que cubre un nicho poco atendido por los TTS generalistas: la síntesis cantada con control musical explícito (no generativa libre), lo que lo hace útil para prototipado de canciones, doblaje musical, localización de letras y herramientas creativas donde se necesita sincronía entre letra y melodía. La licencia Apache 2.0 facilita su integración comercial, aunque la model card remite a la licencia del modelo base y a la de los datos de afinado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint OmniVoice; arquitectura del modelo base no detallada en la informacion disponible) |
| Parametros totales | 612.577.288 (≈0,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card usa `torch.float16` en el ejemplo; no se documentan otras) |
| Idiomas soportados | inglés (en), vietnamita (vi), incluida mezcla en/en una misma línea |
| Licencia | Apache 2.0 (con remision a la licencia del modelo base OmniVoice y de los datos de afinado) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Libreria | omnivoice |
| Pipeline | text-to-speech (con modo singing) |

## Arquitectura y entrenamiento

OmniSinger es un fine-tune del checkpoint OmniVoice, un modelo de síntesis de voz de la familia OmniVoice (repositorio `k2-fsa/OmniVoice`). La model card no detalla la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención, tokenizador acústico o vocoder), por lo que ese dato debe considerarse no disponible. Lo que sí se documenta es el mecanismo de control: la entrada se estructura como una secuencia de texto enriquecida con etiquetas de nota MIDI y duración en centésimas de segundo, y el modelo genera audio condicionado tanto por esa secuencia como por un clip de referencia de voz que determina el timbre.

El entrenamiento consistió en un ajuste fino sobre datos de canto, presumiblemente pares de letra anotada con melodía y audio cantado, aunque la composición del dataset, el número de tokens o pasos y el uso de RLHF/DPO no se especifican en la información disponible. Una innovación destacable es la capacidad de melisma: una misma palabra puede asociarse a varias notas mediante pares `pitch:duration` separados por comas, lo que permite reproducir ornamentaciones vocales típicas del canto. El modelo también incorpora un modo de habla normal si se omiten el prefijo `[singing]` y las etiquetas de nota, aunque está optimizado para canto.

## Capacidades

- Síntesis de voz cantada a partir de letra anotada con nota (MIDI) y duración (centésimas de segundo) por palabra.
- Control explícito de melodía, ritmo y silencios mediante etiquetas `<silence>{0:D}`.
- Soporte de melisma: una palabra cantada sobre varias notas con `word{P1:D1,P2:D2}`.
- Clonación de timbre a partir de un clip de referencia corto (de unos segundos a ~15 s); si se omite `ref_text`, la transcripción se obtiene automáticamente con Whisper ASR.
- Multilingüe: inglés y vietnamita, con capacidad de mezclar ambos idiomas en una misma línea.
- Modo de habla normal invocable omitiendo `[singing]` y las etiquetas de nota, aunque no es su modo optimizado.
- Salida de audio mono a 24 kHz como array de NumPy.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Prototipado de canciones: un compositor puede escribir la letra con notas MIDI y duraciones, generar cada línea con una voz de referencia y concatenar los fragmentos para obtener una maqueta cantada sin necesidad de un vocalista.
- Localización musical: doblar o adaptar letras al inglés o al vietnamita manteniendo la melodía original, usando las etiquetas de nota para conservar la línea musical y el clip de referencia para aproximar el timbre del intérprete original.
- Herramientas creativas para creadores de contenido: generación de jingles, cuñas o fragmentos cantados personalizados a partir de una letra y una melodía definida, con control preciso de la duración total para ajustarse a un formato (por ejemplo, 15 o 30 segundos).
- Educación musical y entrenamiento auditivo: generar ejemplos cantados de intervalos, melismas o frases con una altura y duración exactas para ilustrar conceptos teóricos.
- Investigación en síntesis cantada: servir como baseline reproducible (Apache 2.0, 0,6B, safetensors) para experimentos de control prosódico y melódico, o para comparar con sistemas de SVS (singing voice synthesis) más pesados.
- Doblaje y audiolibros musicales: generar fragmentos cantados en inglés o vietnamita dentro de narrativas o contenido infantil, manteniendo coherencia de timbre mediante el clip de referencia.
- Accesibilidad: convertir letras anotadas en audio cantado para personas con dificultades de lectura o para generar versiones audibles de partituras simplificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,5-2 GB solo para pesos (612M parámetros × 2 bytes ≈ 1,2 GB), más overhead de activaciones y del codificador de referencia; en la práctica, un presupuesto de 3-4 GB de VRAM es razonable, aunque no se documenta oficialmente.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM; el ejemplo oficial usa `device_map="cuda:0"` con `torch.float16`. Funciona también en Apple Silicon (`device_map="mps"`) e Intel Arc (`device_map="xpu"`).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y similares; también en equipos con MPS.
- Opciones de despliegue: la librería oficial `omnivoice` (instalable con `pip install omnivoice soundfile torch`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo de audio).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la longitud de la frase (se recomienda generar por frases cortas y concatenar).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| OmniSinger (mindvu) | 0,6B | no disponible | en, vi | Apache 2.0 | TTS + canto con control de nota/duración |
| OmniVoice (base, k2-fsa) | no disponible | no disponible | no disponible | no disponible | TTS base del que deriva el fine-tune |
| Alternativas SVS/TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de síntesis cantada que permitan una comparación cuantitativa rigurosa. La comparación más directa es con el propio OmniVoice base, del que OmniSinger hereda la arquitectura y al que añade el modo canto con etiquetas de nota y duración.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado sobre voces de referencia, puede reproducir características del timbre y del estilo de los datos de entrenamiento.
- Riesgo de alucinación acústica: en frases largas o con etiquetas mal formadas puede producirse desincronización entre letra y melodía; se recomienda generar por frases cortas y concatenar.
- Cada palabra debe llevar su etiqueta `{pitch:duration}`; las palabras sin etiqueta no se temporizan correctamente. El parámetro `duration` debe coincidir con la suma de todas las duraciones (incluidos silencios y melismas).
- Cobertura lingüística limitada a inglés y vietnamita; no se documenta soporte de castellano.
- El fine-tune remite a la licencia del modelo base OmniVoice y a la de los datos de afinado; conviene verificar ambas antes de un uso comercial, aunque el repositorio declare Apache 2.0.
- Prohibición explícita de clonación de voz no autorizada, suplantación de identidad, fraude o cualquier uso ilegal o poco ético; el desarrollador declina responsabilidad por mal uso.
- No se documentan cuantizaciones oficiales (GGUF, int8, etc.) ni integraciones con servidores de inferencia de alto rendimiento, lo que limita el despliegue en producción a gran escala.
- El modelo está optimizado para canto; el modo habla es funcional pero no es su objetivo principal.

## Enlaces

- Hugging Face: https://huggingface.co/mindvu/OmniSinger
- GitHub del proyecto: https://github.com/MindVu/OmniSinger
- Repositorio del modelo base OmniVoice (k2-fsa): https://github.com/k2-fsa/OmniVoice
