# LuffyTheFox/Gemma-4-E4B-Uncensored-Genesis-GGUF

## Resumen

Gemma-4-E4B-Uncensored-Genesis-GGUF es un modelo de lenguaje derivado de Google Gemma 4 E4B (versión instruct), sometido a un proceso de "abliteración" para eliminar los mecanismos de rechazo y censura, y posteriormente refinado con el algoritmo propietario Genesis, desarrollado por LuffyTheFox (Alexey Zakharchenko). Este algoritmo de destilación de ruido pretende reducir la acumulación de ruido en los tensores durante el entrenamiento, lo que según su autor mejora la estabilidad, la claridad contextual y la adherencia a instrucciones del modelo final.

El modelo base original es `google/gemma-4-e4b-it`, aunque la versión que aquí se distribuye parte del trabajo intermedio de HauhauCS (`Gemma-4-E4B-Uncensored-HauhauCS-Aggressive`). Los pesos safetensors del repositorio indican 7.518.069.290 parámetros totales, mientras que el autor declara "4B parámetros" en la model card, lo que sugiere una arquitectura de mezcla de expertos (MoE) con 4 mil millones de parámetros activos, aunque esta condición no se confirma explícitamente. La ventana de contexto declarada es de 131.072 tokens, con una arquitectura de 42 capas que combina atención con ventana deslizante (512 tokens) y atención completa, más 18 capas con caché KV compartida para eficiencia de memoria.

El modelo se presenta exclusivamente en formato GGUF, pensado para su uso con runtimes como llama.cpp, LM Studio o koboldcpp. Aunque la arquitectura original de Gemma 4 es multimodal (texto, imagen, vídeo y audio), el autor indica que el encoder de visión no se incluye en esta versión por considerarlo "irreparable", por lo que en la práctica el modelo funciona únicamente con entradas de texto. Su relevancia radica en ofrecer una alternativa sin censura para entornos de investigación y desarrollo donde se requiere explorar los límites del modelo sin restricciones de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención mixta (sliding window de 512 tokens + atención completa), 42 capas, 18 capas KV compartidas |
| Parametros totales | 7.518.069.290 (según pesos safetensors) |
| Parametros activos | 4B (según autor, probablemente MoE, sin confirmar) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF con varias cuantizaciones (incluye K-quants, según el autor; lista completa no disponible) |
| Idiomas soportados | Inglés y multilingüe (no se especifican idiomas concretos) |
| Licencia | Gemma (licencia de Google, permite uso comercial con condiciones) |
| Formato de pesos | GGUF (también safetensors para el modelo base, pero el repositorio es GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un modelo de la familia Gemma 4 de Google. Sobre esta base, HauhauCS aplicó un proceso de abliteración para eliminar los mecanismos de rechazo y censura, dando lugar al modelo intermedio `Gemma-4-E4B-Uncensored-HauhauCS-Aggressive`. Posteriormente, LuffyTheFox aplicó su algoritmo Genesis, descrito como una técnica de destilación de ruido que reduce el "Noise Gate" acumulado en los tensores durante el entrenamiento. Según el autor, este ruido provoca inestabilidad, verbosidad y alucinaciones; Genesis "repara la señal sin tocar el conocimiento aprendido ni el gradiente". No se proporcionan detalles técnicos adicionales sobre el algoritmo ni sobre los datos de entrenamiento utilizados.

La arquitectura declarada incluye 42 capas con un mecanismo de atención híbrido: una ventana deslizante de 512 tokens combinada con atención completa, lo que permite manejar secuencias largas (131K) con un coste computacional reducido. Las 18 capas con caché KV compartida contribuyen a la eficiencia de memoria durante la inferencia. No se especifica si se realizó ajuste fino adicional con RLHF o DPO; el proceso se limita a la abliteración y a la aplicación de Genesis.

## Capacidades

- Generación de texto sin censura: el modelo ha sido abliterado, por lo que no presenta los rechazos habituales ante contenido sensible, ofensivo o controvertido.
- Contexto largo: soporta hasta 131.072 tokens, lo que permite procesar documentos extensos o mantener conversaciones muy largas.
- Multilingüe: el modelo declara soporte para inglés y otros idiomas, aunque no se detallan cuáles.
- Conversacional: diseñado para interacción por turnos, con plantilla de chat compatible con llama.cpp (requiere la bandera `--jinja`).
- Multimodal nativo (limitado): la arquitectura original soporta imagen, vídeo y audio, pero el encoder de visión no se incluye en esta versión GGUF, por lo que en la práctica solo funciona con texto.
- Sin soporte explícito de tool calling o function calling: no se menciona en la documentación del autor, aunque podría heredarlo del modelo base Gemma 4.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, guiones, poesía o contenido satírico donde el modelo no rechace temas tabú o políticamente sensibles.
- Investigación sobre seguridad y alineación: estudiar el comportamiento de un modelo sin mecanismos de rechazo para comparar con versiones censuradas, como hace el artículo de knightli.com.
- Asistencia en redacción técnica: redacción de documentación, informes o artículos donde se requiere un tono directo y sin filtros.
- Análisis de documentos largos: gracias a la ventana de 131K tokens, puede resumir o extraer información de libros, contratos o expedientes extensos.
- Prototipado de chatbots en entornos controlados: desarrollo de asistentes conversacionales para nichos específicos donde la censura del modelo base sea un obstáculo.
- Experimentación con técnicas de reducción de ruido: validar si el algoritmo Genesis mejora la coherencia y reduce alucinaciones en comparación con el modelo abliterado original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o sus variantes. Tampoco se proporcionan comparativas con el modelo base Gemma 4 E4B oficial.

## Requisitos de hardware

- Al ser GGUF, el modelo puede ejecutarse tanto en CPU como en GPU, con cuantizaciones que reducen los requisitos de memoria.
- VRAM estimada: para una cuantización Q4_K_M, los 7.5B parámetros totales requieren aproximadamente 4-5 GB de VRAM. Con Q8_0, alrededor de 8 GB.
- GPUs recomendadas: tarjetas consumer con 8 GB o más, como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores. También puede ejecutarse en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: llama.cpp (con la bandera `--jinja`), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. También es posible usar vLLM si se convierte a otro formato, aunque no es el flujo principal.
- Latencia y throughput: no especificados por el autor. Dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-Genesis-GGUF (este) | 7.5B totales, 4B activos (según autor) | 131K | Gemma | GGUF |
| google/gemma-4-e4b-it (oficial) | 7.5B totales, 4B activos (probable) | 131K | Gemma | Safetensors, GGUF |
| HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 7.5B totales, 4B activos (probable) | 131K | Gemma | Safetensors, GGUF |

No hay datos de rendimiento comparativo entre estos modelos. La principal diferencia es el proceso de abliteración y la aplicación de Genesis, que no alteran el rendimiento teórico pero sí el comportamiento ante contenido sensible. La licencia es la misma (Gemma) para todos.

## Limitaciones y advertencias

- El encoder de visión no está incluido: a pesar de ser un modelo multimodal en origen, esta versión no procesa imágenes, vídeo ni audio. El autor lo justifica por un fallo "irreparable" en el encoder.
- Modelo sin censura: al estar abliterado, puede generar contenido ofensivo, ilegal o peligroso. Su uso debe restringirse a entornos de investigación y desarrollo con medidas de seguridad adecuadas.
- Riesgo de alucinaciones: aunque Genesis pretende reducirlas, no hay evidencia empírica publicada que lo confirme. El modelo puede inventar hechos o datos.
- Sesgos: al derivar de Gemma 4, puede heredar sesgos presentes en los datos de entrenamiento originales, amplificados por la ausencia de filtros de rechazo.
- Licencia Gemma: permite uso comercial, pero con restricciones (por ejemplo, no usar para ciertos fines prohibidos por Google). Es recomendable revisar los términos completos.
- Falta de documentación técnica: no se detallan los datos de entrenamiento, el proceso exacto de abliteración ni la implementación de Genesis, lo que dificulta la reproducibilidad.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que puede indicar que es un proyecto experimental o que la fecha es incorrecta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LuffyTheFox/Gemma-4-E4B-Uncensored-Genesis-GGUF
- Perfil del autor (LuffyTheFox): https://huggingface.co/LuffyTheFox
- Modelo base intermedio de HauhauCS: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Artículo de análisis sobre derivados de Gemma 4 E4B: https://knightli.com/en/2026/04/18/gemma-4-e4b-uncensored-vs-official/
- Sitio web con información sobre Gemma 4 uncensored: https://gemma-4.net/uncensored
