# Serkali-sudo/Qwen3-TTS-1.7B-VoiceDesign-LiteRT-INT4

## Resumen

Qwen3-TTS-1.7B-VoiceDesign-LiteRT-INT4 es una conversión del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-VoiceDesign de Alibaba Qwen al formato LiteRT (TFLite) con cuantización INT4 por bloques. El autor de la conversión es el usuario Serkali-sudo y el objetivo es permitir la inferencia de un modelo TTS de 1.700 millones de parámetros en entornos con recursos limitados, típicamente dispositivos móviles o de borde, mediante el runtime LiteRT de Google.

El modelo original resuelve el problema de generar voz sintética a partir de texto con control de diseño de voz (voice design), es decir, la posibilidad de especificar características de la voz generada. La conversión reduce el peso del repositorio a 1,9 GB gracias a la cuantización del componente Talker a INT4 y de las tablas de embeddings a INT8 por filas, manteniendo la licencia Apache 2.0 del modelo base.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue de un TTS moderno fuera del ecosistema PyTorch; por otro, advierte de que se trata de un artefacto de conversión con muy poca información publicada, sin benchmarks ni documentación de uso más allá de una nota técnica breve, y con cero descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign; export LiteRT con Talker, code predictor y codec) |
| Parámetros totales | 1.700 millones (según el nombre del modelo base) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 por bloques (Talker) e INT8 por filas (tablas de embeddings) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (repositorio de 1,9 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su naturaleza TTS y de la mención a tres componentes que el host debe conectar: el Talker, el code predictor y el codec. El sufijo "12Hz" del nombre del modelo base sugiere una tasa de generación de tokens de audio de 12 Hz, pero no se aporta documentación adicional en la información proporcionada.

Respecto al entrenamiento, no se dispone de datos sobre número de tokens, composición del dataset, ni si hubo RLHF o DPO. La conversión realizada por Serkali-sudo no reentrena el modelo: aplica cuantización INT4 por bloques al Talker y INT8 por filas a las tablas de embeddings, y exporta los grafos a LiteRT. El autor remite a `voice-design.json` para el diseño de tablas y las rutas de los grafos, pero no se incluye su contenido en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech), según la etiqueta de pipeline del repositorio.
- Control de diseño de voz (voice design) heredado del modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign.
- Inferencia mediante el runtime LiteRT, orientada a despliegue en dispositivos con recursos limitados.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe concreta ni lista de idiomas.
- No se documentan modos especiales (thinking, visión, audio de entrada) más allá de la generación de audio.

## Casos de uso

- Síntesis de voz en aplicaciones móviles: el formato LiteRT y la cuantización INT4 permiten integrar un TTS de 1,7B parámetros en apps Android o iOS sin depender de servicios en la nube, siempre que se valide la calidad de la voz tras la cuantización.
- Lectura de contenido en dispositivos de borde: asistentes de lectura, audiolibros o accesibilidad para personas con discapacidad visual en hardware con memoria limitada, aprovechando el tamaño reducido del repositorio (1,9 GB).
- Prototipado de interfaces de voz: equipos que ya trabajan con LiteRT pueden evaluar un TTS de gama media sin montar una infraestructura GPU, conectando manualmente el Talker, el code predictor y el codec según indica el autor.
- Generación de locuciones con voz personalizada: el componente de voice design del modelo base permite experimentar con características de voz específicas en demos y pruebas de concepto.
- Investigación en cuantización de modelos de audio: este repositorio sirve como referencia para estudiar el impacto de INT4 por bloques e INT8 por filas en la calidad de un TTS, comparando con el modelo base en precisión completa.
- Despliegue en entornos sin PyTorch: pipelines de inferencia basados en TFLite/LiteRT que necesiten un componente de voz sin añadir dependencias del ecosistema de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 1,9 GB, por lo que se puede estimar un consumo de memoria en el orden de 2 a 3 GB en el runtime LiteRT, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible; el formato LiteRT está pensado para aceleración en dispositivos de borde (GPU móvil, NPU) más que para GPU de servidor.
- ¿Cabe en GPU de consumo? Probablemente sí en términos de memoria por el tamaño del artefacto, pero no hay confirmación de que el runtime LiteRT aproveche GPU de escritorio como RTX 4090; no disponible.
- Opciones de despliegue: runtime LiteRT/TFLite; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-VoiceDesign-LiteRT-INT4 (este) | 1,7B | No disponible | LiteRT INT4/INT8 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign (base) | 1,7B | No disponible | Pesos originales (no detallado) | Apache 2.0 | Hugging Face |
| Otras alternativas TTS de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de conversión sin benchmarks publicados: no hay evidencia de la calidad de la voz tras la cuantización INT4/INT8 frente al modelo base.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria.
- El host debe conectar manualmente el Talker, el code predictor y el codec; no es un paquete listo para usar sin trabajo de integración.
- No se documentan idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas.
- Riesgo de alucinación y artefactos de audio no evaluado en la información disponible.
- Sesgos de voz (género, acento, prosodia) no documentados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-TTS y de cualquier dato de entrenamiento asociado antes de producción.
- El formato LiteRT limita las opciones de despliegue en servidor y la compatibilidad con herramientas estándar del ecosistema transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Serkali-sudo/Qwen3-TTS-1.7B-VoiceDesign-LiteRT-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Revisión del modelo base referenciada: 5ecdb67327fd37bb2e042aab12ff7391903235d3
