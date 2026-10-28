# agentory/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3-TTS-12Hz-1.7B-CustomVoice, un sistema de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen. No es un modelo original: lo publica el usuario `agentory`, que ha convertido los pesos oficiales con el script `scripts/convert_tts_to_gguf.py` del runtime qwen3-tts.cpp (fork de `khimaros` sobre `predict-woo/qwen3-tts.cpp`). El modelo declara 1.916.676.352 parámetros y se distribuye en dos cuantizaciones, F16 y Q8_0, dentro de un repositorio de 2,4 GB.

Qwen3-TTS aborda la síntesis de voz con una arquitectura de modelo de lenguaje discreto multi-codebook apoyada en el tokenizer Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de audio a 12 tokens por segundo y preserva información paralingüística. La variante CustomVoice añade control de estilo mediante instrucciones en lenguaje natural sobre 9 timbres predefinidos (combinaciones de género, edad, idioma y dialecto) y cubre 10 idiomas, entre ellos el español.

Su relevancia práctica está en la latencia y en el despliegue: el autor declara una arquitectura de generación en streaming híbrida de doble pista, con 97 ms de latencia extremo a extremo y emisión del primer paquete de audio tras un solo carácter de entrada. La versión GGUF permite ejecutar el modelo fuera del stack de PyTorch con pesos de aproximadamente 2 GB en Q8_0, lo que habilita escenarios de voz en tiempo real sobre hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM autorregresivo discreto multi-codebook sobre tokens de audio, con tokenizer neural Qwen3-TTS-Tokenizer-12Hz y decodificador ligero no-DiT |
| Parametros totales | 1.916.676.352 (1,92 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | 10: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros separados por cuantización) |
| Tasa del tokenizer de audio | 12 Hz (12 tokens por segundo de audio) |
| Timbres predefinidos | 9 (variantes de género, edad, idioma y dialecto) |
| Streaming | Sí (streaming y no streaming en el mismo modelo) |
| Control por instrucciones | Sí (timbre, emoción y prosodia) |
| Tamaño del repositorio | 2,4 GB |
| Runtime previsto | qwen3-tts.cpp (fork de khimaros) |

## Arquitectura y entrenamiento

El modelo es un LM autorregresivo que opera sobre tokens discretos de audio en lugar de sobre texto: la señal de voz se codifica con Qwen3-TTS-Tokenizer-12Hz, que aplica compresión acústica eficiente y modelado semántico de alta dimensionalidad a 12 tokens por segundo, y el LM genera la secuencia de códigos que después se reconstruye en forma de onda mediante un decodificador ligero de tipo no-DiT. El autor describe el diseño como una arquitectura universal extremo a extremo que evita los cuellos de botella de información y los errores en cascada de los esquemas clásicos LM + DiT. La generación emplea una arquitectura híbrida de streaming de doble pista, de modo que un mismo conjunto de pesos sirve tanto para síntesis en streaming como por lotes.

La variante CustomVoice incorpora control en lenguaje natural de atributos acústicos (timbre, emoción, ritmo) y, según la documentación, ajusta tono y expresividad a partir de la semántica del texto de entrada, además de mostrar robustez frente a texto ruidoso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla si las cuantizaciones GGUF incluyen los pesos del tokenizer y del decodificador o solo el LM; el tamaño declarado del repositorio (2,4 GB) es inferior a la estimación de los pesos en F16 (≈3,8 GB para 1,92 B de parámetros), lo que conviene verificar antes de desplegar.

## Capacidades

- Síntesis de voz extremo a extremo a partir de texto, con salida en streaming o por lotes.
- Control de estilo por instrucciones en lenguaje natural: timbre, emoción, velocidad de habla y prosodia.
- 9 timbres predefinidos que cubren combinaciones de género, edad, idioma y dialecto.
- Soporte de 10 idiomas, incluido el español, con perfiles de voz dialectales.
- Generación de baja latencia: primer paquete de audio tras un único carácter de entrada y 97 ms de latencia extremo a extremo declarada.
- Robustez declarada frente a texto de entrada ruidoso.
- Conservación de información paralingüística y de características del entorno acústico gracias al tokenizer de 12 Hz.
- No incluye clonación de voz a partir de audio de referencia: esa función corresponde a las variantes Base del mismo family.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada en esta variante.

## Casos de uso

- **Atención al cliente telefónica en tiempo real**: con streaming nativo y 97 ms de latencia declarada, el modelo puede encadenarse detrás de un ASR y un LLM para construir un agente de voz conversacional; los 9 timbres permiten asignar una voz coherente a cada marca o campaña.
- **Sistemas IVR y locuciones dinámicas**: generación de mensajes variables (importes, fechas, nombres) sin recortes de audio pregrabados, usando el control por instrucciones para ajustar el tono según el tipo de aviso (informativo, urgente, comercial).
- **Audiolibros y narración con control expresivo**: la capacidad de modular emoción y ritmo mediante instrucciones permite asignar estilos distintos por capítulo o personaje sin reentrenar el modelo.
- **Doblaje y localización multilingüe**: cobertura de 10 idiomas con un único checkpoint, útil para pipelines que generan la misma pieza en español, inglés, francés y alemán manteniendo un perfil de voz consistente.
- **Despliegue on-premise o en el borde**: con Q8_0 los pesos rondan los 2 GB, de modo que el modelo cabe en GPUs de consumo y en servidores sin acelerador dedicado, lo que facilita escenarios con requisitos de soberanía del dato o sin conectividad.
- **Accesibilidad**: lectura en voz alta de documentos y contenido web para usuarios con discapacidad visual, con control de velocidad e prosodia para mejorar la comprensión.
- **Prototipado de voces en videojuegos y contenido interactivo**: los 9 timbres predefinidos permiten generar diálogos de prueba de varios personajes antes de invertir en grabación con actores.
- **Generación de contenido editorial automatizado**: producción de versiones en audio de artículos y boletines dentro de un pipeline CI/CD de publicación, con salida en streaming hacia el reproductor del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento declarado por el autor es la latencia de síntesis extremo a extremo de 97 ms y la emisión del primer paquete de audio tras un solo carácter de entrada, en modo streaming.

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia extremo a extremo | 97 ms | Generación en streaming, según el autor |
| Primer paquete de audio | Inmediato tras un carácter de entrada | Generación en streaming |
| Tasa de tokens de audio | 12 Hz | Tokenizer Qwen3-TTS-Tokenizer-12Hz |
| Throughput (RTF, tokens/s) | no disponible | No reportado para esta conversión GGUF |
| Calidad percibida (MOS, WER) | no disponible | No reportado |

## Requisitos de hardware

- **VRAM estimada (solo pesos del LM)**: Q8_0 ≈ 2,0-2,1 GB; F16 ≈ 3,8 GB (estimación a partir de 1.916.676.352 parámetros). Hay que sumar la memoria del tokenizer y del decodificador de audio si se cargan en el mismo dispositivo; no se detalla en la información disponible.
- **GPU de consumo**: Q8_0 cabe en cualquier GPU con 4 GB o más de VRAM (RTX 3050 8 GB, RTX 4060, RTX 3060 12 GB, RTX 4090). F16 requiere 6 GB o más para dejar margen al resto del pipeline.
- **GPU de centro de datos**: A100, H100, L40S o L4 son suficientes para servir varias instancias en paralelo; el modelo no necesita tensor parallel para una sola réplica.
- **CPU**: ejecución viable en CPU con 2-4 GB de RAM libre para Q8_0, aunque la latencia de 97 ms declarada presupone aceleración por GPU.
- **Opciones de despliegue**: qwen3-tts.cpp (runtime previsto para estos GGUF), el paquete `qwen-tts` y vLLM para los pesos originales en safetensors. No se garantiza compatibilidad con llama.cpp estándar, al tratarse de un grafo de TTS con tokenizer de audio propio.
- **Latencia y throughput**: única cifra publicada, 97 ms de latencia extremo a extremo en streaming. No hay datos de throughput ni de RTF para las cuantizaciones GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | GGUF disponible | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (esta conversion) | 1,92 B | 10 | Sí | Sí | F16, Q8_0 | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ~1,7 B (nominal) | 10 | Sí | Sí (diseño de voz por descripción) | no disponible | no disponible |
| Qwen3-TTS-12Hz-1.7B-Base | ~1,7 B (nominal) | 10 | Sí | No | no disponible | no disponible |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~0,6 B (nominal) | 10 | Sí | No | no disponible | no disponible |

Frente a la variante VoiceDesign, este checkpoint no crea una voz nueva a partir de una descripción libre, sino que aplica control de estilo sobre 9 timbres ya definidos. Frente a las variantes Base, no ofrece clonación de voz con 3 segundos de audio de referencia ni está pensado para fine-tuning. La variante de 0,6 B reduce requisitos de memoria a costa de calidad, un extremo que no puede cuantificarse porque no hay benchmarks publicados. No se dispone de datos verificables de otros sistemas TTS de la competencia en la información proporcionada.

## Limitaciones y advertencias

- **Repositorio de terceros sin validación**: la conversión la firma el usuario `agentory`, no el equipo Qwen. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de mantenimiento ni de pruebas por parte de la comunidad.
- **Solo dos cuantizaciones**: F16 y Q8_0. No hay Q4_K_M ni otras variantes de baja precisión, por lo que no se puede reducir más la huella de memoria sin recurrir a los pesos originales.
- **Compatibilidad restringida**: los GGUF están pensados para el fork qwen3-tts.cpp; no son cargables directamente en llama.cpp ni en otras herramientas GGUF genéricas.
- **Calidad de la conversión no verificada**: no se publican comparaciones objetivas (MOS, similitud de timbre, WER) entre estos GGUF y los pesos originales en safetensors.
- **Sin clonación de voz**: CustomVoice no clona; para clonación hay que usar las variantes Base.
- **Metadatos de idioma incompletos en el repo**: el campo de idiomas del repositorio GGUF figura como no disponible, aunque el modelo original declara 10 idiomas.
- **Riesgo de alucinación acústica**: como todo LM generativo sobre tokens de audio, puede producir prosodia anómala, repeticiones, omisiones o ruido ante entradas muy largas, ambiguas o con caracteres especiales; requiere validación y recortes de seguridad en producción.
- **Sesgos**: los 9 timbres predefinidos cubren un conjunto acotado de combinaciones de género, edad y dialecto, lo que puede infrarrepresentar variedades lingüísticas regionales y acentos no contemplados.
- **Longitud de contexto no documentada**: se desconoce el límite de texto de entrada del LM, lo que obliga a trocear manualmente textos largos.
- **Licencia**: Apache 2.0 en este repositorio permite uso comercial, pero conviene verificar los términos del repositorio original de Qwen y de los componentes auxiliares (tokenizer y decodificador) antes de un despliegue comercial.
- **Ausencia de benchmarks**: sin MMLU ni métricas TTS publicadas para esta conversión, cualquier comparación de calidad es especulativa.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/agentory/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Tokenizer de audio: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Runtime previsto (fork): https://github.com/khimaros/qwen3-tts.cpp
- Runtime upstream: https://github.com/predict-woo/qwen3-tts.cpp
- Informe técnico citado en los tags: https://arxiv.org/abs/2601.15621
