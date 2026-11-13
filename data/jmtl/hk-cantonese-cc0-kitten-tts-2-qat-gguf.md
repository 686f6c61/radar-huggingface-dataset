# jmtl/hk-cantonese-cc0-kitten-tts-2-qat-GGUF

## Resumen

Kitten-TTS 2 Cantonese QAT es un modelo de síntesis de voz (text-to-speech) especializado en cantonés de Hong Kong, distribuido en formato GGUF con pesos ternarios. Lo desarrolla el usuario jmtl sobre el modelo base KittenML/kitten-tts-2 de KittenML, aplicando entrenamiento consciente de cuantización (QAT) para producir un único fichero de 1,26 GB que se ejecuta de forma totalmente offline tanto en CPU como en GPU NVIDIA. El modelo clona una voz a partir de una grabación de referencia corta (entre 5 y 30 segundos) y su transcripción exacta.

La relevancia del modelo reside en dos factores. Por un lado, es un ejemplo poco habitual de cuantización exacta: los 1.734.542.336 valores del fichero decodifican de forma idéntica a los pesos entrenados, porque el modelo se entrenó directamente en ternario y no hubo que redondear nada. Por otro, está evaluado tal y como se distribuye: sobre el runtime ggtts, en CPU y GPU, los reconocedores automáticos confunden entre un 9 % y un 12 % de caracteres en líneas cortas de cantonés, frente al 34-37 % del modelo Kitten-TTS 2 sin entrenar. En pruebas de escucha a ciegas no se percibió como peor que el original en PyTorch.

El modelo se entrenó exclusivamente con grabaciones de dominio público (CC0) del corpus Common Voice 22 en cantonés (JackyHoCL/common_voice_22_yue). Está pensado para entornos con recursos limitados que necesiten clonación de voz en cantonés sin dependencia de la nube, aunque el propio autor advierte de que su versión basada en Qwen3-TTS suena más natural y de que cada invocación desde línea de comandos arranca en frío, con unos 27 segundos por línea corta en CPU de sobremesa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basada en Kitten-TTS 2 (decodificador Chatterbox-Turbo s3gen_meanflow + codificador de hablante pyannote), pesos ternarios QAT |
| Parámetros totales | 1.734.542.336 valores (aproximadamente 1,73 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternario (tq1_0), entrenado en QAT; fichero GGUF único de 1,26 GB |
| Idiomas soportados | Cantonés (yue), chino (zh) |
| Licencia | Stellon Labs Community License (license: other) |
| Formato de pesos | GGUF (kitten-cantonese-qat-tq1_0.gguf) |

## Arquitectura y entrenamiento

El modelo parte de KittenML/kitten-tts-2 y se entrena con cuantización consciente (QAT) directamente en precisión ternaria, de modo que la versión distribuida no es una aproximación de los pesos originales sino el resultado exacto del entrenamiento. La canalización de inferencia combina tres piezas: el modelo principal en GGUF, un decodificador derivado de Chatterbox-Turbo (s3gen_meanflow.safetensors, revisión 749d1c1a46eb10492095d68fbcf55691ccf137cd) y el codificador de hablante de KittenML (speaker/model.safetensors), ambos convertidos a un único GGUF mediante la herramienta ggtts-kitten-convert.

El entrenamiento se realizó únicamente sobre grabaciones de dominio público (CC0) del corpus Common Voice 22 en cantonés, lo que elimina las restricciones de derechos de autor sobre los datos de entrenamiento. La clonación de voz se consigue con un clip de referencia de 5 a 30 segundos de un único hablante junto con su transcripción exacta, que se procesa con el comando `prepare` para generar un fichero voice.json reutilizable. El autor indica que la evaluación se hizo con el fichero tal y como se distribuye, sobre el runtime ggtts v0.1.0-rc.11, tanto en CPU x86-64 como en GPU, y que en escucha a ciegas no se percibió como peor que el original en PyTorch.

## Capacidades

- Síntesis de voz en cantonés de Hong Kong a partir de texto, con salida en FLAC.
- Clonación de voz zero-shot a partir de un clip de referencia de 5 a 30 segundos y su transcripción exacta.
- Ejecución totalmente offline, sin Python ni compilación, mediante binarios precompilados del runtime ggtts.
- Inferencia en CPU x86-64 (Linux y Windows) y en GPU NVIDIA.
- Soporte de semilla fija (`--seed`) para reproducibilidad de la síntesis.
- Manejo de texto en chino (zh) además del cantonés (yue), según los metadatos del modelo.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada en la información disponible.

## Casos de uso

- Síntesis de voz para asistentes de atención al cliente en cantonés: el modelo permite generar respuestas habladas con una voz concreta de la marca a partir de un clip de referencia de 5 a 30 segundos, sin enviar datos a servicios en la nube.
- Audiolibros y contenido narrado en cantonés: al aceptar texto plano y producir FLAC, puede integrarse en un pipeline por lotes que genere capítulos completos con una voz clonada consistente.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido en cantonés en dispositivos de sobremesa sin GPU, dado que el fichero de 1,26 GB se ejecuta en CPU.
- Localización de vídeos y pódcast: doblaje de guiones al cantonés con una voz de referencia que mantenga la identidad sonora del hablante original.
- Sistemas embebidos o de borde con recursos limitados: el tamaño reducido del GGUF ternario y la ausencia de dependencias Python lo hacen adecuado para entornos con unos 4 GB de disco libre y sin acelerador dedicado.
- Prototipado e investigación en TTS de bajos recursos: sirve como referencia reproducible de QAT ternario con evaluación publicada, útil para comparar técnicas de cuantización exacta.
- Generación de avisos y mensajes pregrabados en transporte o comercio: la clonación de voz permite crear anuncios con una voz corporativa concreta a partir de una única grabación de referencia.

## Benchmarks y rendimiento

| Métrica | Este modelo (QAT ternario) | Kitten-TTS 2 sin entrenar |
|---|---|---|
| Tasa de error de caracteres en líneas cortas de cantonés (reconocedores automáticos) | 9-12 % | 34-37 % |
| Escucha a ciegas frente al original en PyTorch | No percibido como peor | Referencia |
| Latencia en CPU de sobremesa (por línea corta, arranque en frío) | ~27 s | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos ocupa 1,26 GB y el autor indica que se ejecuta en CPU, por lo que la huella es reducida.
- GPU recomendadas: no se especifican modelos concretos; el autor confirma funcionamiento en GPU NVIDIA además de CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU NVIDIA con varios GB de VRAM, aunque no se detallan modelos concretos en la información disponible.
- CPU: x86-64 en Linux y Windows; se requiere un equipo de 64 bits con unos 4 GB de disco libre.
- Opciones de despliegue: runtime ggtts v0.1.0-rc.11 (binarios `ggtts-kitten-convert`, `ggtts-kitten prepare` y `ggtts-render`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 27 segundos por línea corta en CPU de sobremesa con arranque en frío por invocación; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jmtl/hk-cantonese-cc0-kitten-tts-2-qat-GGUF | ~1,73 mil millones (ternario) | no disponible | yue, zh | Stellon Labs Community License | GGUF | Clonación de voz, offline, CPU/GPU, ~27 s por línea en CPU |
| jmtl/hk-cantonese-cc0-qwen3-tts | no disponible | no disponible | yue | no disponible | no disponible | Mismo autor; según la model card suena más natural |
| KittenML/kitten-tts-2 | no disponible | no disponible | no disponible | no disponible | PyTorch (safetensors) | Modelo base sin cuantizar; referencia de calidad |
| Chatterbox-Turbo (ResembleAI) | no disponible | no disponible | no disponible | no disponible | safetensors | Aporta el decodificador s3gen_meanflow usado en la canalización |

No se dispone de datos suficientes para comparar rendimiento numérico con alternativas de la misma categoría más allá de las cifras de error de caracteres frente al modelo base.

## Limitaciones y advertencias

- El propio autor advierte de que su versión basada en Qwen3-TTS (hk-cantonese-cc0-qwen3-tts) suena más natural; este modelo es la opción si se busca un ternario pequeño con clonación de voz.
- Latencia elevada en CPU: unos 27 segundos por línea corta con arranque en frío en cada invocación de línea de comandos, lo que limita su uso interactivo en tiempo real.
- La clonación de voz exige una grabación de referencia de 5 a 30 segundos de un único hablante y su transcripción exacta; una transcripción incorrecta degrada la calidad.
- Riesgo de uso indebido de la clonación de voz (suplantación, deepfakes); no se documentan salvaguardas técnicas en la información disponible.
- Cobertura lingüística limitada a cantonés y chino; no se documentan otros idiomas.
- Entrenado solo con Common Voice 22, un corpus de dominio público con posibles sesgos de hablantes, género y acento no documentados en la información disponible.
- Licencia Stellon Labs Community License (license: other): es necesario revisar LICENSE.md antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- El despliegue depende de binarios precompilados del runtime ggtts (versión candidata v0.1.0-rc.11), lo que introduce una dependencia de terceros y de una versión no estable.
- No se documentan límites de longitud de texto de entrada ni de contexto en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat-GGUF
- Model card principal (evaluación, pruebas de escucha, muestras de audio): https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat
- Versión basada en Qwen3-TTS del mismo autor: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2
- Decodificador Chatterbox-Turbo: https://huggingface.co/ResembleAI/chatterbox-turbo
- Dataset Common Voice 22 en cantonés: https://huggingface.co/datasets/JackyHoCL/common_voice_22_yue
- Runtime ggtts (release v0.1.0-rc.11): https://github.com/dandelion-love/ggtts/releases/tag/v0.1.0-rc.11
