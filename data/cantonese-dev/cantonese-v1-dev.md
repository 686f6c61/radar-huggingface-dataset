# cantonese-dev/cantonese-v1-dev

## Resumen

Cantonese-v1-dev es un modelo de texto a voz (TTS) desarrollado por la organización cantonese-dev y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo basado en la arquitectura Qwen3-TTS, con aproximadamente 1.917 millones de parámetros (1.916.676.352 exactos según los metadatos de safetensors), cuyo propósito es generar voz sintética en cantonés (yue), una variedad del chino yue que cuenta con escaso soporte en los ecosistemas TTS dominantes.

El modelo incorpora seis voces preconfiguradas ("baked voices"), tres femeninas (yue_f1, yue_f2, yue_f3) y tres masculinas (yue_m1, yue_m2, yue_m3), cada una asociada a una fila de codec específica (filas 3000 a 3005). Este enfoque de voces integradas sugiere un pipeline de síntesis basado en tokens de audio codec, donde cada voz corresponde a un token de identidad de hablante.

Su relevancia radica en la escasez de modelos TTS abiertos de calidad para cantonés, un idioma con decenas de millones de hablantes en Hong Kong, Cantón y comunidades de la diáspora, pero marginal en los grandes datasets de entrenamiento de voz. Al tratarse de una versión "dev" con 0 descargas y una model card muy limitada, debe considerarse un proyecto experimental o en fase temprana de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (texto a voz) |
| Parametros totales | 1.916.676.352 (~1,92 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Cantonés (yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3-TTS, una familia de modelos de síntesis de voz de la serie Qwen que sigue el paradigma de generación autoregresiva de tokens de audio codec a partir de texto. En este enfoque, el texto de entrada se convierte en una secuencia de tokens de audio mediante un modelo de lenguaje, y un decodificador posterior reconstruye la forma de onda. Las "baked voices" del modelo se materializan como filas de codec dedicadas (3000-3005), lo que indica que cada identidad de hablante está codificada directamente en la tabla de tokens del codec, sin necesidad de clonación de voz ni embeddings de hablante externos.

Sobre los datos de entrenamiento no hay información publicada: la model card no especifica número de horas de audio, composición del corpus, ni procesos de alineación o ajuste fino. Tampoco se documentan detalles técnicos como el codec concreto utilizado, la tasa de muestreo de salida o los hiperparámetros de entrenamiento. El sufijo "-dev" en el nombre y la ausencia de documentación sugieren un estado de desarrollo temprano.

## Capacidades

- Sintesis de voz en cantonés a partir de texto (TTS).
- Seis voces preintegradas: tres femeninas (yue_f1, yue_f2, yue_f3) y tres masculinas (yue_m1, yue_m2, yue_m3).
- Selección de voz mediante identificadores de fila de codec (3000-3005).
- Distribución en formato safetensors, compatible con el ecosistema estándar de HuggingFace.
- No hay evidencia de capacidades de clonación de voz, soporte multilingüe más allá del cantonés, ni de entradas de audio (no es un modelo de voz a voz).

## Casos de uso

- Locucion de contenido multimedia en cantones: generación de narración para vídeos educativos, divulgativos o de entretenimiento dirigidos a audiencias de Hong Kong o Cantón, aprovechando las seis voces predefinidas para variar el tono de la producción.
- Asistentes de voz en cantones: integración como componente de síntesis en chatbots o asistentes conversacionales que atiendan a usuarios en cantonés, un idioma con soporte TTS muy limitado en modelos comerciales abiertos.
- Accesibilidad: conversión de textos a audio para personas con discapacidad visual en entornos donde el cantonés es la lengua principal, como aplicaciones de lectura de noticias o documentos.
- Prototipado de aplicaciones de voz: dado su tamaño contenido (~1,9 B de parámetros), puede servir como base experimental para desarrolladores que construyen pipelines TTS en cantonés sin depender de APIs cerradas.
- Produccion de IVR y telefonía: generación de mensajes automatizados para sistemas de respuesta de voz interactiva en empresas que operan en mercados de habla cantonesa.
- Recursos educativos de idiomas: creación de material de audio para cursos de aprendizaje de cantonés, con voces masculinas y femeninas para variar los ejemplos de pronunciación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de síntesis (MOS, WER de intelligibilidad, similitud de hablante) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~1,92 B de parámetros en precisión completa (fp16/bf16), una estimación razonable sería en torno a 4-5 GB de VRAM solo para los pesos, más la memoria del decodificador de audio.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) debería ser suficiente en teoría, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de ~1,9 B de parámetros y los 3,8 GB del repositorio.
- Opciones de despliegue: no hay instrucciones oficiales. Al basarse en la arquitectura qwen3_tts, el uso con la librería transformers de HuggingFace es el camino más probable; la compatibilidad con llama.cpp, vLLM u Ollama no está documentada y es improbable para un modelo TTS de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma principal | Licencia |
|---|---|---|---|---|
| cantonese-v1-dev | ~1,92 B | TTS | Cantonés | Apache-2.0 |
| CosyVoice 2 (Alibaba) | no disponible | TTS | Chino mandarín, inglés, japonés, cantones (parcial) | Apache-2.0 |
| Fish Speech | ~0,5 B | TTS | Multilingüe (incluye chino) | CC-BY-NC-SA (restricciones de uso comercial) |
| XTTS v2 (Coqui) | ~0,75 B | TTS | Multilingüe (17 idiomas, sin cantonés) | Coqui Public Model License (no comercial sin licencia) |

Cantonese-v1-dev se diferencia de las alternativas por su especialización explícita en cantonés, un idioma que los modelos multilingües suelen tratar de forma marginal. Su ventaja principal es la licencia Apache-2.0, sin restricciones de uso comercial, frente a licencias más limitadas de otros TTS abiertos.

## Limitaciones y advertencias

- Estado experimental: la versión es "dev", con 0 descargas registradas, una model card mínima y sin documentación de uso, lo que implica alto riesgo de errores o comportamiento inesperado.
- Alcance lingüístico limitado: solo cantonés; no es útil para mandarín ni otros idiomas, y no hay información sobre variantes dialectales (hongkonesa frente a cantonesa de Guangzhou).
- Solo seis voces fijas: no hay clonación de voz ni control fino de prosodia, emoción o velocidad documentado.
- Sin datos de calidad: no hay métricas MOS ni evaluaciones publicadas, por lo que la inteligibilidad y naturalidad de la síntesis no pueden verificarse de antemano.
- Sesgos: al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de acento, registro o representación de hablantes.
- Alucinacion/errores de síntesis: como todo modelo TTS autoregresivo, puede producir errores de pronunciación en nombres propios, anglicismos o caracteres ambiguos.
- Licencia: Apache-2.0 permite uso comercial, pero no hay garantías de calidad ni soporte, y el proyecto podría abandonarse dada su etapa temprana.
- Compatibilidad: al depender de la arquitectura qwen3_tts, puede requerir versiones específicas de transformers u otras dependencias no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cantonese-dev/cantonese-v1-dev
- DOI del modelo: https://doi.org/10.57967/hf/11354
- No se han encontrado enlaces adicionales relevantes (paper, blog o repositorio de código) en la informacion disponible.
