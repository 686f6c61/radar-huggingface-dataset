# froabera/speecht5_afan_oromo15

## Resumen

`froabera/speecht5_afan_oromo15` es un checkpoint de síntesis de voz (text-to-audio) publicado en Hugging Face por el usuario froabera, construido sobre la arquitectura SpeechT5 de Microsoft. El recuento real de parámetros en los pesos safetensors es de 144.433.890 (unos 144,4 millones), coherente con la implementación base de SpeechT5 para TTS. Por el nombre se deduce que está ajustado para afan oromo (oromo), una lengua cushítica hablada en Etiopía, pero la model card no lo confirma explícitamente.

El repositorio tiene un tamaño de 0,6 GB, licencia no declarada e idiomas no declarados. La model card es la plantilla automática de Hugging Face, sin ninguna sección completada: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto. Esto convierte al modelo en un artefacto experimental del que no se puede verificar procedencia, calidad ni condiciones de uso.

Su relevancia potencial es la cobertura de una lengua con muy pocos recursos en el ecosistema TTS, un ámbito donde la mayoría de modelos multilingües no incluyen el oromo. No obstante, con cero descargas y cero likes, y sin metadatos técnicos, debe considerarse no validado por la comunidad y no apto para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder con encoder compartido; decoder de habla para TTS), según el tag `speecht5` |
| Parámetros totales | 144.433.890 (~144,4 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un modelo text-to-speech, no expone ventana de contexto de texto. La model card no documenta límite de caracteres por fragmento |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas en el repo) |
| Idiomas soportados | No disponible en la model card; por el identificador del modelo, orientado presumiblemente a afan oromo |
| Licencia | No disponible |
| Formato de pesos | safetensors (según los tags del repositorio), cargable con la librería transformers |
| Pipeline declarado | text-to-audio |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-08 |
| Fecha de última actualización | 2026-10-08 |

## Arquitectura y entrenamiento

SpeechT5 es un marco de encoder-decoder unificado para habla y texto. El encoder compartido procesa tanto texto como habla, y para la tarea de TTS se emplean el encoder de texto (tokenización a nivel de carácter) y un decoder de habla compuesto por una red prenet, capas de decoder autorregresivas y un postnet que refina el espectrograma mel. En su versión de referencia, la salida mel se convierte en onda mediante un vocoder HiFi-GAN independiente, y la identidad de la voz se controla inyectando un embedding de hablante (x-vector) en el decoder.

El recuento de parámetros de este checkpoint (144,4 M) coincide con el de la implementación base de SpeechT5 para TTS, lo que sugiere un ajuste fino sobre ella, aunque la model card no lo declara y no puede confirmarse por los metadatos. Tampoco hay información sobre el corpus de entrenamiento, el número de tokens o de horas de audio, la composición del dataset, el régimen de precisión ni si se aplicaron técnicas de alineamiento o ajuste adicionales. El único indicio externo es la existencia pública de un dataset de TTS en afan oromo de 8.076 clips de un único hablante masculino en Mendeley Data, cuya relación con este checkpoint es una hipótesis y no un hecho documentado.

Cabe señalar que el tag `arxiv:1910.09700` del repositorio corresponde al artículo sobre estimación de emisiones de carbono de Lacoste et al. (2019), citado en la propia plantilla de model card de Hugging Face. Es, por tanto, un artefacto de la plantilla y no una referencia al artículo original de SpeechT5.

## Capacidades

- Síntesis de voz a partir de texto (text-to-audio), tarea principal del pipeline declarado.
- Generación de habla con control de identidad de voz mediante embedding de hablante, siempre que el checkpoint exponga esa entrada (no documentado en la model card).
- Idiomas: presumiblemente afan oromo; no confirmado ni acotado por el autor.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode).
- No dispone de capacidades de audio de entrada (no es un modelo de reconocimiento de voz).

## Casos de uso

- Accesibilidad y lectura en voz alta: convertir texto escrito en afan oromo a audio para personas con discapacidad visual o dificultades lectoras, aprovechando que el modelo está especializado en esa lengua y no depende de voces multilingües genéricas.
- Preservación y digitalización lingüística: generar material sonoro en afan oromo para archivos, proyectos de documentación y recursos educativos de lenguas con pocos datos, previa verificación de la calidad de pronunciación.
- Locución de noticias y boletines: producir versiones en audio de artículos y comunicados para medios digitales etíopes, con la salvedad de que se trata de un modelo no validado y requeriría revisión humana.
- Sistemas de respuesta vocal interactiva (IVR): integrar el modelo en centralitas telefónicas para leer menús y mensajes en afan oromo, siempre que la latencia medida en el entorno objetivo sea aceptable.
- Contenido educativo y alfabetización: crear audiolibros y ejercicios de lectura para escuelas de primaria en regiones oromoparlantes, a partir de textos pedagógicos.
- Señalética sonora y transporte público: anuncios automáticos en estaciones y autobuses en afan oromo, generando avisos pregrabados a partir de plantillas de texto.
- Doblaje de bajo coste para vídeo divulgativo: generar pistas de voz para vídeos cortos o material de formación interna cuando no se dispone de un hablante nativo disponible para grabar.
- Generación de datos sintéticos para ASR: producir audio etiquetado que amplíe corpus de entrenamiento de reconocimiento de voz en afan oromo, con control estricto de la calidad para evitar sesgos del sintetizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación completada (todas las métricas figuran como `[More Information Needed]`) y el autor no aporta MOS, inteligibilidad, WER del texto sintetizado ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 578 MB solo de pesos; en FP16/BF16, unos 289 MB; en int8, unos 144 MB. Hay que sumar el consumo del vocoder (HiFi-GAN) y de los tensores intermedios, por lo que un presupuesto práctico de 1-2 GB de VRAM es razonable.
- Cabe en GPU de consumo sin dificultad: RTX 3060, RTX 4060, RTX 3090, RTX 4090 e incluso GPUs de gama de entrada con 4 GB.
- Es viable la inferencia en CPU para lotes pequeños, dado el tamaño del modelo, aunque la latencia por frase será mayor.
- GPU de centro de datos: A100, H100 o L40S quedan muy sobredimensionadas para un modelo de 144 M de parámetros; solo tendrían sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: pipeline `text-to-audio` de transformers con PyTorch; exportación a ONNX Runtime si se convierte el checkpoint (no confirmado para este repositorio). Los runtimes orientados a LLM como vLLM, llama.cpp, Ollama o TGI no cubren esta arquitectura TTS de forma estándar.
- Requiere un vocoder compatible con SpeechT5 para producir la onda final; el repositorio no indica cuál se debe usar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de la infraestructura de entrenamiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| froabera/speecht5_afan_oromo15 | SpeechT5 (TTS) | 144,4 M | No declarados (presumiblemente afan oromo) | No disponible | Hugging Face, 0 descargas |
| microsoft/speecht5_tts | SpeechT5 (TTS) | ~144 M | Inglés (VoxPopuli) | MIT | Hugging Face, ampliamente usado |
| Meta MMS-TTS | VITS (TTS) | Del orden de decenas de millones por idioma (valor exacto no verificado aquí) | Más de 1.100 idiomas, cobertura africana amplia pero sin oromo confirmado | CC-BY-NC 4.0 | Hugging Face |
| Coqui XTTS-v2 | TTS multilingüe con clonación de voz | No disponible con precisión | 17 idiomas, sin oromo | Coqui Public Model License (uso comercial restringido) | Hugging Face |

La comparación directa es difícil porque la model card de este checkpoint no ofrece ningún dato de calidad, licencia ni idioma confirmado. La referencia más cercana en arquitectura es `microsoft/speecht5_tts`, con licencia MIT y prestaciones documentadas; el valor diferencial aquí sería la cobertura del afan oromo, no verificable con la información disponible.

## Limitaciones y advertencias

- Ausencia total de licencia: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución. Es un bloqueo legal para producción.
- Model card vacía: todos los campos figuran como `[More Information Needed]`. No se puede auditar el origen de los datos ni el proceso de entrenamiento.
- Idiomas no declarados: que el nombre sugiera afan oromo no constituye una especificación verificable.
- Hablante único probable: si se entrenó con el dataset público de un solo hablante masculino, la diversidad de voces será nula y el modelo no servirá para aplicaciones que requieran varias voces.
- Sesgo de dominio: los corpus de TTS suelen estar dominados por textos religiosos, noticias y libros, lo que sesga el vocabulario y el estilo hacia esos registros.
- Riesgo de artefactos acústicos: los modelos TTS ajustados con pocos datos tienden a producir pronunciaciones incorrectas en palabras fuera de dominio, con zumbidos, cortes o entonación plana. No hay evaluación que lo descarte.
- Riesgo de alucinación acústica: el decoder autorregresivo puede generar sonidos inexistentes o repetir fonemas en entradas largas o atípicas.
- Sin límite de longitud documentado: no se indica el número máximo de caracteres por fragmento, por lo que la segmentación del texto quedará a criterio de quien integre el modelo.
- Cero descargas y cero likes: no hay evidencia de uso real ni de validación por terceros.
- Dependencia de un vocoder externo no especificado: el repo no indica qué componente genera la onda final.
- Fecha de creación futura en los metadatos (2026-10-08), lo que sugiere un entorno de prueba o herramientas automatizadas; conviene tratarlo como un experimento y no como un modelo estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/froabera/speecht5_afan_oromo15
- Perfil del autor: https://huggingface.co/froabera
- Modelo hermano de la misma serie: https://huggingface.co/froabera/speecht5_afan_oromo1
- Artículo original de SpeechT5 (referencia de la arquitectura): https://arxiv.org/abs/2110.07205
- Artículo citado en el tag `arxiv:1910.09700` (estimación de emisiones, procedente de la plantilla de model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML mencionada en la plantilla: https://mlco2.github.io/impact
- Recursos abiertos de Addis AI para amárico y afan oromo: https://addisassistant.com/open-source
- Dataset de TTS en afan oromo en Mendeley Data: https://data.mendeley.com/datasets/mpy85ns82z/2
- Servicio comercial de TTS en oromo (referencia de mercado, no relacionado con este checkpoint): https://amisus.io/text-to-speech-oromo/
