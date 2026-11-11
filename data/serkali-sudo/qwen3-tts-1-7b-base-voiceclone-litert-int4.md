# Serkali-sudo/Qwen3-TTS-1.7B-Base-VoiceClone-LiteRT-INT4

## Resumen

Qwen3-TTS-1.7B-Base-VoiceClone-LiteRT-INT4 es una exportación cuantizada del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicada por el usuario Serkali-sudo. El objetivo es ofrecer el modelo base de text-to-speech de Qwen en formato LiteRT (TFLite) con pesos de 4 bits, de modo que pueda ejecutarse en entornos con recursos limitados o en dispositivos orientados a inferencia local. La conversión mantiene la arquitectura original del Talker y del codificador de audio, pero reorganiza los pesos en un esquema blockwise INT4 para el Talker y row-wise INT8 para las tablas de embeddings.

El modelo conserva la capacidad de clonación de voz a partir de tres segundos de audio de referencia mediante un codificador de hablante basado en x-vectors. El host debe orquestar cuatro componentes separados: el codificador de hablante, el Talker, el predictor de códigos y el códec de audio. Esta separación en grafos es típica de las exportaciones LiteRT y condiciona tanto el despliegue como el rendimiento real en producción.

La relevancia de esta ficha radica en que documenta una alternativa de despliegue ligero para un modelo TTS de 1.7B parámetros bajo licencia Apache 2.0, lo que interesa a desarrolladores que necesitan inferencia local de voz sin depender de GPUs de gran tamaño. No obstante, la información pública disponible sobre esta conversión concreta es muy escasa: no hay benchmarks, no hay datos de idiomas y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS basado en Talker con predictor de códigos y códec de audio; exportado a LiteRT con codificador de hablante x-vector |
| Parametros totales | 1.7B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Talker blockwise INT4; embeddings row-wise INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (grafos separados: speaker encoder, Talker, code predictor, audio codec) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-TTS-12Hz-1.7B-Base, un modelo de síntesis de voz de la familia Qwen3-TTS. Esta exportación no reentrena el modelo: parte de la revisión `fd4b254389122332181a7c3db7f27e918eec64e3` del modelo base y aplica una conversión a LiteRT con cuantización mixta. El Talker se cuantiza en bloques a INT4, mientras que las tablas de embeddings se cuantizan por filas a INT8, una combinación habitual para reducir el tamaño de los pesos manteniendo cierta fidelidad en las representaciones de entrada.

El pipeline se divide en cuatro grafos que el host debe conectar: el codificador de hablante (que produce un x-vector a partir de audio de referencia), el Talker, el predictor de códigos y el códec de audio. La clonación de voz se realiza a partir de tres segundos de audio de referencia, según indica la model card. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal en esta conversión.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz mediante x-vectors extraídos de tres segundos de audio de referencia.
- Pipeline modular con codificador de hablante, Talker, predictor de códigos y códec de audio.
- Ejecución en formato LiteRT/TFLite, orientada a inferencia ligera.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales como thinking mode, visión o audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para asistentes personalizados: el modelo permite generar una voz sintética a partir de tres segundos de referencia, lo que facilita crear asistentes con una identidad vocal concreta sin entrenamiento adicional.
- Generación de audiolibros y narración: al ser un modelo TTS de 1.7B parámetros, puede emplearse para convertir texto largo en voz, aunque el rendimiento real dependerá de la orquestación de los cuatro grafos LiteRT.
- Integración en aplicaciones móviles o embebidas: el formato LiteRT y la cuantización INT4/INT8 reducen el tamaño de los pesos, lo que lo hace candidato para despliegues en dispositivos con recursos limitados.
- Prototipado de interfaces de voz: útil para desarrolladores que quieren evaluar la calidad del TTS de Qwen3 antes de invertir en infraestructura GPU mayor.
- Generación de voces para vídeos y contenido multimedia: la clonación con pocos segundos de audio permite producir locuciones consistentes con una voz de referencia.
- Investigación en cuantización de modelos TTS: esta exportación sirve como caso de estudio para medir el impacto de INT4 blockwise e INT8 row-wise en la calidad de síntesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 1.7B parámetros en INT4, el peso teórico del Talker ronda los 0.85 GB, pero el total debe incluir el codificador de hablante, el predictor de códigos y el códec de audio, además de las activaciones.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato LiteRT sugiere despliegue en CPU, GPU integrada o aceleradores móviles, pero no se documentan requisitos concretos.
- Opciones de despliegue: LiteRT/TFLite; el host debe conectar manualmente los cuatro grafos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Serkali-sudo/Qwen3-TTS-1.7B-Base-VoiceClone-LiteRT-INT4 | 1.7B | no disponible | LiteRT/TFLite INT4/INT8 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1.7B | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es muy escueta: no documenta idiomas, contexto, benchmarks ni requisitos de hardware.
- Al ser una conversión cuantizada a INT4/INT8, es probable una pérdida de calidad respecto al modelo base, aunque no se cuantifica en la información disponible.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad, deepfakes); se recomienda verificar consentimiento y cumplimiento normativo.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia comunitaria de funcionamiento.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-TTS y de los datos de referencia empleados.
- El despliegue requiere orquestar cuatro grafos LiteRT, lo que añade complejidad de integración frente a un pipeline TTS monolítico.
- No hay información sobre sesgos lingüísticos o de hablante del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Serkali-sudo/Qwen3-TTS-1.7B-Base-VoiceClone-LiteRT-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Revisión del modelo base citada: fd4b254389122332181a7c3db7f27e918eec64e3
- Configuración de clonación de voz: voice-clone.json (incluido en el repositorio)
