# Rin247/Qwen3-TTS-12Hz-1.7B-Base-INT8

## Resumen

El modelo Rin247/Qwen3-TTS-12Hz-1.7B-Base-INT8 es una versión cuantizada en 8 bits (INT8 weight-only) del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante ha sido publicada por el usuario Rin247 en Hugging Face y conserva las capacidades del modelo base, que incluyen clonación rápida de voz a partir de muestras de 3 segundos, síntesis en 10 idiomas y generación en streaming de baja latencia.

El modelo base emplea una arquitectura de modelo de lenguaje discreto multi-codebook con un tokenizador propio (Qwen3-TTS-Tokenizer-12Hz), que comprime la señal de audio a 12 Hz y permite un modelado end-to-end completo de la voz, evitando los cuellos de botella de los esquemas tradicionales LM+DiT. La cuantización INT8 reduce el tamaño de los pesos de aproximadamente 3,5 GB a 2,4 GB, lo que facilita su despliegue en hardware con menos memoria, manteniendo un comportamiento funcional equivalente al original para la mayoría de los casos de uso.

Esta versión es relevante para desarrolladores que necesitan un modelo TTS eficiente y de alta calidad con licencia Apache 2.0, capaz de ejecutarse en GPUs de consumo o entornos con restricciones de VRAM, sin renunciar a las capacidades avanzadas del modelo original: control por instrucciones en lenguaje natural, adaptación prosódica y robustez frente a texto ruidoso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (Qwen3-TTS) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Qwen3-TTS-12Hz-1.7B-Base se basa en una arquitectura de modelo de lenguaje discreto con múltiples codebooks, diseñada para modelar la señal de voz de forma completamente end-to-end. El tokenizador Qwen3-TTS-Tokenizer-12Hz convierte el audio en secuencias de tokens discretos a una frecuencia de 12 Hz, capturando información paralingüística y acústica del entorno. Esta representación comprimida permite que un modelo LM relativamente pequeño (1,7B parámetros nominales, 1,93B reales) genere voz de alta fidelidad sin necesidad de un decodificador difusivo adicional.

El entrenamiento del modelo base se realizó con datos de voz multilingües que cubren 10 idiomas principales, aunque no se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset en la información disponible. El modelo soporta generación en streaming mediante una arquitectura híbrida de doble vía, que permite emitir el primer paquete de audio tras un solo carácter de entrada, con una latencia de síntesis extremadamente baja (97 ms según la documentación del modelo original). La cuantización INT8 aplicada en esta versión no altera la arquitectura, solo reduce la precisión de los pesos, lo que implica una ligera pérdida de calidad en la reconstrucción de audio en comparación con la versión de precisión completa.

## Capacidades

- Síntesis de voz a partir de texto en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español e italiano.
- Clonacion de voz con solo 3 segundos de audio de referencia, sin necesidad de entrenamiento adicional.
- Generacion en streaming y no streaming con un unico modelo, gracias a la arquitectura dual-track.
- Control de atributos acusticos (timbre, emocion, prosodia) mediante instrucciones en lenguaje natural.
- Adaptacion automatica del tono, ritmo y expresion emocional segun la semantica del texto de entrada.
- Robustez frente a texto ruidoso o mal formateado, gracias a la comprension contextual del modelo.
- Soporte para ajuste fino (fine-tuning) en tareas especificas de voz, al ser un modelo base.

## Casos de uso

- Asistentes de voz interactivos: el modelo puede generar respuestas habladas en tiempo real con latencia inferior a 100 ms, lo que lo hace adecuado para agentes conversacionales que requieren respuestas inmediatas y naturales.
- Audiolibros y narracion automatizada: su capacidad para adaptar la prosodia y la emocion segun el contexto textual permite producir narraciones expresivas en multiples idiomas, reduciendo costes frente a locutores humanos.
- Doblaje de contenido audiovisual: la clonacion de voz con 3 segundos de muestra facilita la generacion de voces personalizadas para personajes o actores, manteniendo la coherencia tonal en largas sesiones.
- Sistemas de accesibilidad: lectura de pantalla y conversion de texto a voz para personas con discapacidad visual, con soporte multilingue y control de velocidad y tono mediante instrucciones.
- Generacion de contenido educativo: creacion de materiales de aprendizaje en audio, con voces claras y adaptables a diferentes estilos pedagogicos, en varios idiomas.
- Prototipado rapido de productos de voz: los desarrolladores pueden integrar el modelo en pipelines de CI/CD para generar muestras de voz de prueba en entornos de desarrollo, gracias a su tamaño reducido y compatibilidad con vLLM y el paquete qwen-tts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del modelo original menciona una latencia de sintesis de 97 ms y una frecuencia de tokenizacion de 12 Hz, pero no se proporcionan metricas comparativas estandarizadas (como MOS, WER o RTF) para esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB para los pesos en INT8, mas overhead de activaciones y buffers, por lo que se recomienda un minimo de 4 GB de VRAM para ejecucion comoda.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; tambien es viable en GPUs de datacenter como A10 o A100 si se requiere mayor concurrencia.
- Compatibilidad con hardware consumer: si, el modelo cabe en GPUs de gama media y baja gracias a la cuantizacion INT8.
- Opciones de despliegue: vLLM (con soporte para el paquete qwen-tts), llama.cpp (si se convierte a GGUF), Ollama (mediante integracion personalizada) y TGI (Text Generation Inference).
- Latencia y throughput: no se dispone de mediciones especificas para esta version cuantizada; el modelo original reporta una latencia de primer paquete de 97 ms en streaming, que se espera similar o ligeramente superior en INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1,93B | no disponible | 10 | Apache 2.0 | safetensors (FP16/BF16) |
| Rin247/Qwen3-TTS-12Hz-1.7B-Base-INT8 | 1,93B | no disponible | 10 | Apache 2.0 | safetensors (INT8) |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | 10 | Apache 2.0 | safetensors (FP16/BF16) |
| Bark (Suno) | 1,2B | no disponible | 13 | MIT | safetensors |

La comparativa se limita a modelos TTS de codigo abierto con capacidades multilingues. La version INT8 ofrece un equilibrio entre calidad y eficiencia, con un tamaño de pesos un 30% menor que la version original, a costa de una posible degradacion sutil en la fidelidad del audio. Bark, aunque similar en tamaño, no soporta clonacion de voz con tan poca muestra ni generacion en streaming de baja latencia.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir una ligera perdida de calidad en la reconstruccion de audio, especialmente en frecuencias altas o en voces con mucha variacion prosodica; se recomienda evaluar la salida en el caso de uso concreto.
- El modelo puede presentar alucinaciones o errores de pronunciacion en textos muy ruidosos o con formatos inusuales, aunque el modelo base muestra robustez mejorada frente a versiones anteriores.
- No se dispone de informacion sobre sesgos especificos del modelo, pero al ser entrenado con datos multilingues, puede reflejar sesgos presentes en los datos de habla de cada idioma.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoría del modelo original (Qwen) y de esta version cuantizada (Rin247).
- El modelo no incluye capacidades de vision ni de procesamiento de audio mas alla de la sintesis de voz; no es un modelo multimodal general.
- La longitud de contexto no esta documentada, por lo que para entradas de texto muy largas se recomienda segmentar el texto en fragmentos manejables.

## Enlaces

- Repositorio Hugging Face de esta version: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-Base-INT8
- Repositorio Hugging Face del modelo original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio GitHub oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Coleccion de modelos Qwen3-TTS en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-tts
- Articulo tecnico (arXiv): https://arxiv.org/abs/2601.15621 (referenciado en los tags, no verificado)
