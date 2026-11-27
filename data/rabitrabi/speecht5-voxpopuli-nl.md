# rabitrabi/speecht5-voxpopuli-nl

## Resumen

SpeechT5 para síntesis de voz en neerlandés es un ajuste fino (fine-tuning) del modelo `microsoft/speecht5_tts` realizado por el usuario rabitrabi, orientado a la generación de audio a partir de texto en neerlandés. Se trata de un experimento de pequeño alcance, derivado de un curso de audio, que adapta el modelo base a una única voz del corpus VoxPopuli neerlandés mediante un vector de hablante aprendido y el congelado del codificador.

El modelo resuelve un problema muy acotado: disponer de una voz neerlandesa concreta sobre la arquitectura SpeechT5, sin pretensiones de generalización multihablante ni de calidad de producción. El entrenamiento se realizó sobre 73 grabaciones cortas durante tres épocas, y la evaluación se limitó a ocho grabaciones reservadas con una pérdida combinada de 0,8215. No se aportan métricas de inteligibilidad ni de naturalidad humana, lo que limita seriamente cualquier afirmación sobre su calidad subjetiva.

Con 144.433.890 parámetros y un repositorio de 0,6 GB, el modelo se enmarca en la categoría de TTS ligeros. Su relevancia es principalmente didáctica o experimental: sirve como ejemplo reproducible de adaptación de SpeechT5 a un idioma con pocos recursos mediante fine-tuning de bajo coste, pero no debe confundirse con un sistema TTS neerlandés listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder con decoder autorregresivo y vocoder HiFi-GAN externo) |
| Parámetros totales | 144.433.890 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | neerlandés (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SpeechT5, una arquitectura de tipo encoder-decoder que unifica el procesamiento de habla y texto en un espacio latente compartido. En la variante TTS, el texto se tokeniza y se procesa mediante el codificador, y el decodificador autorregresivo genera un espectrograma mel que posteriormente se convierte en audio mediante un vocoder HiFi-GAN. En este ajuste concreto, el codificador se mantuvo congelado y se entrenó un vector de hablante aprendido, lo que permite fijar una identidad vocal concreta sin reentrenar toda la red.

El entrenamiento se realizó sobre el corpus `facebook/voxpopuli`, empleando 73 grabaciones cortas de un único hablante neerlandés durante tres épocas. La evaluación se llevó a cabo sobre ocho grabaciones reservadas, obteniendo una pérdida combinada de SpeechT5 de 0,8215. No se documentan detalles sobre la composición exacta del dataset, el número de tokens de audio procesados, ni si se aplicaron técnicas de regularización, aumento de datos o ajuste de hiperparámetros más allá de lo indicado. Tampoco se menciona el uso de RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés a partir de texto de entrada.
- Generación de audio WAV mediante un script de síntesis incluido (`synthesise.py`), que descarga el vocoder HiFi-GAN de Microsoft en el primer uso.
- Reproducción de una única voz neerlandesa concreta, definida por el vector de hablante aprendido durante el ajuste.
- Integración con la librería `transformers` (versión 4.57.6 indicada en la model card) y con PyTorch.
- Dependencias declaradas: SentencePiece, NumPy y SoundFile.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo thinking.
- No se documenta soporte multilingüe más allá del neerlandés.

## Casos de uso

- Prototipado de TTS neerlandés en entornos de investigación: el modelo permite generar muestras de audio en neerlandés con una voz fija para experimentos académicos o pruebas de concepto, siempre que se acepte la falta de métricas de calidad subjetiva.
- Docencia y materiales de curso: al tratarse de un experimento derivado de un curso de audio, encaja como ejemplo reproducible de fine-tuning de SpeechT5 sobre un corpus pequeño, útil para enseñar el flujo completo de adaptación de un modelo TTS.
- Generación de locuciones para pruebas internas de pipelines de audio: se puede usar para producir WAV de prueba en neerlandés y validar la integración con sistemas de post-procesado, sin asumir calidad de emisión.
- Evaluación comparativa de vocoders: dado que el modelo descarga el vocoder HiFi-GAN de Microsoft, sirve para probar la cadena SpeechT5 + HiFi-GAN en neerlandés y comparar el comportamiento del vocoder en un idioma distinto del inglés.
- Investigación sobre vectores de hablante: el enfoque de codificador congelado y vector aprendido permite estudiar cómo se comporta la identidad vocal con pocos datos (73 grabaciones) y qué límites presenta en términos de naturalidad.
- Generación de audio para sistemas de accesibilidad en neerlandés en entornos controlados: puede emplearse para leer cadenas cortas en aplicaciones internas, siempre con revisión humana y sin garantías de inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación es la pérdida combinada de SpeechT5 de 0,8215 sobre ocho grabaciones reservadas, que no es comparable directamente con métricas estándar como MOS, WER o MCD.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (144,4 M de parámetros) y el repo de 0,6 GB, es previsible que quepa en GPUs de consumo con pocos GB de VRAM, aunque no se aportan cifras concretas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM podría ejecutarlo, pero no se documenta.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el reducido número de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: la model card indica el uso de PyTorch, Transformers 4.57.6, SentencePiece, NumPy y SoundFile mediante el script `synthesise.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rabitrabi/speecht5-voxpopuli-nl | 144.433.890 | no disponible | nl | no disponible | Hugging Face |
| microsoft/speecht5_tts | no disponible en la información proporcionada | no disponible | en (principalmente) | no disponible en la información proporcionada | Hugging Face |
| Alternativas TTS neerlandés de código abierto | no disponible | no disponible | nl | no disponible | no disponible |

La comparación se limita al modelo base `microsoft/speecht5_tts`, del que este ajuste deriva. No se dispone de datos de rendimiento comparables ni de otras alternativas TTS neerlandesas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy limitado: solo 73 grabaciones cortas y tres épocas, lo que reduce la cobertura fonética y prosódica del neerlandés.
- Sin evaluación de inteligibilidad ni naturalidad humana: no hay puntuaciones MOS ni pruebas perceptuales, por lo que se desconoce la calidad subjetiva real.
- Una única voz: el vector de hablante aprendido fija una identidad vocal concreta; no es un modelo multihablante.
- Codificador congelado: al no ajustarse el codificador, la adaptación al neerlandés se apoya en el vector de hablante y en el decodificador, lo que puede limitar la pronunciación correcta de fonemas ausentes en el entrenamiento.
- Riesgo de alucinación acústica y artefactos: en TTS con pocos datos es habitual encontrar prosodia irregular, ruidos y pronunciaciones erróneas en textos fuera del dominio de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: solo neerlandés; no se garantiza un comportamiento correcto en otros idiomas.
- Dependencia de versiones concretas: la model card fija Transformers 4.57.6 y un vocoder externo (HiFi-GAN de Microsoft) que se descarga en el primer uso, lo que introduce una dependencia de red y de versiones.
- Sin datos de benchmarks estándar: no es posible comparar objetivamente con otros sistemas TTS neerlandeses.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/rabitrabi/speecht5-voxpopuli-nl
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Dataset: https://huggingface.co/datasets/facebook/voxpopuli
