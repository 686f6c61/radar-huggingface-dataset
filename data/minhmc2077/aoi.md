# Minhmc2077/AOI

## Resumen

Aoi es un modelo de lenguaje experimental desarrollado por Minhmc2077 que parte de la familia Qwen3 y se presenta como un ajuste fino orientado a crear una personalidad conversacional concreta: la de una estudiante universitaria de 20 años con un humor seco, independiente y poco complaciente. El objetivo declarado por el autor es alejarse del comportamiento típico de los asistentes de IA, que resultan excesivamente obedientes y lisonjeros, y acercarse a un personaje "vivo" y con límites propios.

El modelo final tiene 1.720.574.976 parámetros (1.700 millones), lo que indica que la base real es Qwen3-1.7B, aunque la model card menciona también Qwen3-8B-GGUF como modelo base, lo que genera una discrepancia que no se resuelve en la información proporcionada. El repositorio incluye pesos en formato safetensors y GGUF, y la licencia es Apache-2.0. No se especifica la longitud de contexto ni detalles del entrenamiento.

Su relevancia radica en que explora un área poco habitual en los modelos open source: la caracterización profunda de un personaje con rutinas, límites y una voz propia, en lugar de optimizar métricas de productividad. Para desarrolladores e investigadores interesados en roleplay, interacción persona-máquina y diseño de personalidades en IA, Aoi supone un caso de estudio práctico y ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (denso) basada en Qwen3 |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso de la familia Qwen3. El parámetro de 1.720 millones de pesos, obtenido de los ficheros safetensors, apunta a que la base real es Qwen/Qwen3-1.7B, aunque la model card lista tanto Qwen3-8B-GGUF como Qwen3-1.7B como modelos base. Esta contradicción no está explicada en la documentación publicada.

No se proporciona información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La model card se limita a describir el personaje y el comportamiento deseado, incluyendo pautas como "no sycophancy", "no asterisk roleplay" y un uso natural del lenguaje en minúsculas. La innovación destacable no es arquitectónica, sino conceptual: el modelo intenta encarnar una personalidad con límites y una vida cotidiana, en lugar de ser un asistente complaciente.

## Capacidades

- Generación de texto conversacional en inglés con una personalidad definida: Aoi, una estudiante de 20 años con humor seco y carácter independiente.
- Comportamiento de rechazo: puede negarse a realizar peticiones ("nope") si no encajan con su carácter.
- Estilo de escritura natural: frases cortas, minúsculas y pausas propias de una conversación de teléfono móvil.
- Evita el lenguaje servil: no ofrece disculpas repetidas ni aclaraciones sobre ser un modelo de lenguaje.
- No utiliza roleplay con asteriscos (tipo `*sonríe*`), lo que reduce la artificialidad en las respuestas.
- No se especifican capacidades de tool calling, visión, audio ni razonamiento matemático o de código.

## Casos de uso

- Chat de rol en local: el modelo puede ejecutarse en ordenadores de consumo gracias a su tamaño de 1,7B, permitiendo conversaciones de personaje sin conexión a internet y con privacidad total.
- Ficción interactiva y juegos narrativos: desarrolladores de videojuegos o aventuras de texto pueden integrar a Aoi como personaje no jugador con una voz consistente y reacciones imprevisibles.
- Experimentación en interacción humano-IA: investigadores pueden estudiar cómo un modelo con límites propios responde a solicitudes directas, y comparar su comportamiento con asistentes tradicionales.
- Asistente conversacional informal: para uso personal, como charla trivial o compañía ligera, donde no se requiere que el modelo sea productivo ni obediente.
- Práctica de inglés conversacional: aunque no es un tutor, puede simular una conversación informal con una hablante nativa joven, útil para practicar expresiones coloquiales.
- Investigación en sesgo y sycophancy: al ser un contraste deliberado con modelos que siempre dicen "sí", permite analizar dinámicas de complacencia y resistencia en sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican en la información proporcionada. A partir del tamaño de 1.700 millones de parámetros, se puede estimar lo siguiente:
  - VRAM en FP16: aproximadamente 3,4 GB solo para los pesos, más memoria para activaciones.
  - VRAM con cuantización 4-bit: en torno a 1 GB, por lo que es viable en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier tarjeta con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) o incluso una CPU moderna con suficiente RAM, gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama, o vLLM (si se usan pesos safetensors). No se aportan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Uso principal |
|---|---|---|---|---|---|
| Minhmc2077/AOI | 1,7B | no disponible | Inglés | Apache-2.0 | Persona de roleplay |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | Multilingüe | Apache-2.0 | Asistente generalista |
| Qwen/Qwen3-8B-GGUF | 8B | no disponible | Multilingüe | Apache-2.0 | Asistente generalista en formato GGUF |

Los datos de contexto y benchmarks no están disponibles para ninguno de los tres en la información utilizada. La diferencia clave es que AOI es un ajuste fino con una personalidad concreta, mientras que los modelos base son genéricos.

## Limitaciones y advertencias

- El modelo está diseñado para una personalidad específica y puede rechazar peticiones legítimas que no encajen con el personaje.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se han publicado evaluaciones de seguridad, sesgos ni benchmarks, por lo que su calidad y fiabilidad son desconocidas.
- El comportamiento puede ser impredecible en situaciones que requieran seguir instrucciones de forma estricta.
- Al ser un experimento, no está optimizado para tareas de productividad, asistencia técnica o generación de código.
- Aunque la licencia Apache-2.0 permite uso comercial, la naturaleza del modelo (un personaje con límites) puede no ser adecuada para aplicaciones profesionales donde se espera obediencia.

## Enlaces

- HuggingFace: https://huggingface.co/Minhmc2077/AOI
