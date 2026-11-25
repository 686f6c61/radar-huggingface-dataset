# kkt94/Llama-V-JEPA-LM-Llama3.2-3B

## Resumen

Llama-V-JEPA-LM-Llama3.2-3B es un modelo de video-lenguaje desarrollado por el usuario kkt94 (familia Llama-V-JEPA-LM) que combina un codificador de video basado en el modelo del mundo V-JEPA 2.1 (ViT-g, congelado) con el modelo de lenguaje Llama-3.2-3B-Instruct de Meta. La conexión entre ambos se realiza mediante un "spectral bridge" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales, de modo que el LLM puede razonar sobre la dinámica de la escena (dirección, orden, velocidad, estado) directamente en su espacio de tokens.

El modelo resuelve el problema de la comprensión temporal de video: no solo describe qué aparece en la imagen, sino cómo cambia a lo largo del tiempo. Para ello se entrena con supervisión contrafactual: transformaciones de píxeles sobre vídeos públicos generan variantes con respuestas equilibradas y fijadas por construcción, lo que obliga al modelo a leer la dinámica en lugar de explotar atajos del dataset. Se entrenó sobre 4,53 millones de muestras públicas.

Es relevante porque, con solo ~3B de parámetros en el LLM, supera a modelos abiertos de su clase en tareas de razonamiento temporal y de movimiento, y lo hace con una licencia Llama 3.2 y pesos en safetensors compatibles con transformers. El repositorio ocupa 8,5 GB y acumula 283 descargas y 9 me gusta en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Llama-3.2-3B-Instruct) + codificador de video V-JEPA 2.1 (ViT-g, congelado) unidos por un spectral bridge |
| Parametros totales | 4.248.521.728 (dato de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es multimodal de tipo "encoder congelado + proyector + LLM". El codificador visual es V-JEPA 2.1, un modelo del mundo basado en ViT-g que procesa clips de 32 fotogramas; un spectral bridge transforma la representación del clip en 1.024 tokens visuales que se inyectan en Llama-3.2-3B-Instruct. El LLM es el único componente entrenado (fine-tuning sobre el modelo base de Meta), mientras que el encoder permanece congelado. El modelo requiere `custom_code` y se carga con la librería transformers.

El entrenamiento usa supervisión contrafactual sobre 4,53 millones de muestras públicas: se aplican transformaciones de píxeles a vídeos públicos para producir variantes con respuestas balanceadas y fijadas por construcción, que difieren únicamente en cómo evoluciona la escena. Así el modelo aprende a leer dirección, velocidad, orden, posición, conteo y finalización sin anotación humana adicional. No se detalla en la información disponible el uso de RLHF o DPO, ni la composición exacta del dataset más allá de su origen público.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en formato video-text-to-text.
- Razonamiento temporal: orden de eventos, cambios de estado, velocidad y dirección del movimiento.
- Razonamiento sobre movimiento y dinámica de escena (entrenado explícitamente para ello).
- Conteo y detección de finalización de acciones a partir de clips.
- Procesamiento de clips de 32 fotogramas convertidos en 1.024 tokens visuales.
- Extracción de características (tag feature-extraction) además de generación.
- Capacidad multilingüe limitada: solo inglés declarado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión de imagen estática, audio: no disponible.

## Casos de uso

- Moderación y análisis de contenido en vídeo: el modelo puede responder preguntas sobre lo que ocurre en un clip y en qué orden, lo que permite clasificar secuencias de acciones y detectar contenido que evoluciona de forma problemática a lo largo del tiempo.
- Indexación y búsqueda semántica de archivos audiovisuales: al convertir cada clip de 32 fotogramas en 1.024 tokens, se pueden generar descripciones y etiquetas temporales que alimenten un motor de búsqueda sobre grandes videotecas.
- Análisis de vídeo de vigilancia y tráfico: su entrenamiento en dirección, velocidad y orden de eventos lo hace adecuado para responder preguntas como "¿en qué sentido circula el vehículo?" o "¿qué ocurrió antes?".
- Asistencia a personas con discapacidad visual: descripción de la dinámica de un clip (no solo de objetos) para narrar acciones en curso, con respuestas en inglés.
- Evaluación automática de vídeo educativo o de procedimientos: comprobar si un tutorial muestra los pasos en el orden correcto y si la acción se completa, usando las capacidades de orden y finalización.
- Análisis de deportes y movimiento: preguntas sobre trayectorias, cambios de dirección y secuencias de jugadas en clips cortos.
- Investigación en modelos del mundo y representaciones video-lenguaje: servir como base para experimentos de alineación encoder-LLM con supervisión contrafactual, dado que el codificador V-JEPA permanece congelado y el proyector es reentrenable.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados). Promedio de 68,97 en 12 puntuaciones sobre 11 benchmarks de vídeo.

| Benchmark | Metrica | Valor |
|---|---|---|
| MVBench | accuracy | 70,7 |
| PerceptionTest | accuracy | 74,3 |
| TVBench | accuracy | 70,3 |
| TempCompass | accuracy | 76,5 |
| TOMATO | accuracy | 55,9 |
| MotionBench | accuracy | 54,2 |
| NExT-QA | accuracy | 77,0 |
| MVP | pair accuracy | 56,3 |
| TemporalBench (binary) | accuracy | 67,3 |
| SSv2 (multiple choice) | accuracy | 91,3 |
| Vinoground text | text pair accuracy | 71,0 |
| Vinoground video | video pair accuracy | 62,8 |

El autor declara además una media de 96,0 en seis conjuntos reservados (ratios de velocidad no vistos, corpus fuente no visto, combinaciones no vistas y un escenario de simulación no visto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,25 mil millones de parámetros, en fp16 rondaría los 8-9 GB solo para pesos, más el codificador V-JEPA 2.1 (ViT-g) y el overhead de activaciones, por lo que en la práctica se recomienda al menos 16-24 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 serían adecuadas para fp16, y GPUs de 16 GB podrían requerir cuantización del LLM.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requeriría cuantización, no documentada.
- Opciones de despliegue: transformers con `custom_code` (requisito del repositorio); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles. El demo público funciona en ZeroGPU (Hugging Face Spaces).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media 12 scores) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.2-3B | 4,25B | no disponible | 68,97 | llama3.2 | Hugging Face |
| Molmo2-4B | ~4B | no disponible | 61,08 | no disponible | no disponible |
| Otros modelos abiertos de clase 4B | ~4B | no disponible | inferior a 61,08 segun el autor | no disponible | no disponible |

El autor afirma que este modelo es el mejor de su clase en 7 de las 12 puntuaciones, con diferencias notables en Vinoground video (62,8 frente a 33,8 de Molmo2-4B), SSv2 (91,3 frente a 68,3), TOMATO (55,9 frente a 36,5) y Vinoground text (71,0 frente a 55,0). No se dispone de datos de benchmarks de otros competidores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre vídeos públicos, puede heredar sesgos de representación de esos datos; no se documentan análisis de sesgo.
- Alucinación: como todo LLM, puede generar respuestas plausibles pero incorrectas sobre el contenido del vídeo, especialmente en clips ambiguos o de baja calidad.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: la longitud de contexto del LLM no se especifica; cada clip consume 1.024 tokens visuales, lo que limita cuántos clips caben en una ventana.
- Licencia: sujeta a la Llama 3.2 Community License y a la Acceptable Use Policy de Meta; revisar restricciones para uso comercial y el requisito de atribución "Built with Llama".
- Producción: requiere `custom_code` en transformers y no se confirma soporte en motores de inferencia habituales; los benchmarks son declarados por el autor y no están verificados.
- Cobertura: orientado a vídeo; no se documentan capacidades de imagen estática, audio, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.2-3B
- Paper: https://arxiv.org/abs/2611.17831
- Código e informe técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en el navegador (variante 8B, ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
