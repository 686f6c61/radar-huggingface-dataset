# DeepNarra/Paham-Experimental

## Resumen

Paham-Experimental es un modelo de lenguaje experimental desarrollado por DeepNarra, presentado como la rama activa de investigación en aprendizaje continuo de su modelo base Paham. Se distribuye con licencia Apache-2.0 y está orientado a despliegue en dispositivos de borde ("edge"), con un enfoque declarado en entrenamiento continuo desacoplado en tres niveles (awake/sleep) y síntesis multimodal nativa. El modelo declara capacidades de texto, audio y visión, aunque la model card describe explícitamente que la parte visual se encuentra en fase de reconstrucción.

La arquitectura se describe como un transformer híbrido con mezcla de expertos (H-MoE) de 92 sub-expertos, con aproximadamente 951,7 millones de parámetros totales según los pesos en safetensors, y un vocabulario BPE de 40.960 tokens. Incorpora innovaciones poco habituales en modelos de este tamaño, como pesos rápidos recurrentes en buffers de inferencia, adaptadores Sidecar-QLoRA para consolidación nocturna y cuantización ternaria nativa de 1.58 bits (TQ1_0). El modelo se publica como artefacto de investigación, con telemetría de entrenamiento parcial y sin resultados de benchmarks estándar publicados.

Es relevante ahora porque propone un paradigma de aprendizaje continuo en el borde que evita la modificación de pesos cuantizados durante la inferencia, separando la interacción del usuario de la consolidación de conocimiento. No obstante, la información disponible es fundamentalmente descriptiva del diseño y no permite validar empíricamente su rendimiento frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (H-MoE) de 92 sub-expertos; recurrencia GLA en pesos rápidos |
| Parametros totales | 951.701.100 (según safetensors) |
| Parametros activos | no disponible (la model card no especifica el número de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa de 1.58 bits (TQ1_0), GGUF; tensores FP16 protegidos (278 en el artefacto omni) |
| Idiomas soportados | inglés y multilingüe (según metadatos; sin lista explícita) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (TQ1_0), PyTorch (.pt para el checkpoint base) |

## Arquitectura y entrenamiento

La arquitectura se describe como un H-MoE de 92 sub-expertos con un router de compuerta softmax, sobre el que se añaden mecanismos de aprendizaje continuo en tres niveles. El nivel 1 opera durante la fase "awake" mediante pesos rápidos recurrentes en los buffers de forward-pass (estado $S_{t+1} = \text{decay} \cdot S_t + k_t v_t$), con un coste de memoria inferior a 5 MB y sin retropropagación. Los niveles 2 y 3 operan en la fase "sleep": adaptadores Sidecar-QLoRA con rango 8 y alpha 16, inicializados a cero, y actualización de las prioridades del router de expertos, respectivamente. La consolidación combina un replay 75/25 entre anclas de preentrenamiento y buffer de interacciones en vivo, y finaliza con una re-cuantización a GGUF ternario TQ1_0.

Los datos de entrenamiento declarados incluyen FineWeb-Edu, Aya Collection, CodeFeedback-Filtered-Instruction y No Robots. La model card menciona pipelines de entrenamiento en TPU v6e-1 para las etapas 2.5 y 3, con un checkpoint base de texto (`paham_stage25_base.pt`), un overlay multimodal de 286,55 MB y un GGUF ternario de 436,28 MB. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La telemetría publicada incluye una pérdida de entropía cruzada de 0,9206 para alineamiento de audio y una pérdida de aproximadamente 2,08 en el sondeo de condicionamiento visual, que el autor describe como deriva de plantilla pendiente de reconstrucción en la versión 2.0.

## Capacidades

- Generación de texto y finalización conversacional, con terminación limpia de secuencia observada en pruebas de sanidad aritmética.
- Razonamiento aritmético básico verificado en telemetría (por ejemplo, "1 + 1 = 2").
- Reconocimiento de voz a texto mediante un codificador de audio nativo basado en Slaney Mel y submuestreador Conv2D, sin dependencia de pesos de Whisper.
- Condicionamiento visual mediante un patchificador espacial Conv2D, en estado experimental y con deriva de plantilla reconocida por el autor.
- Capacidades multilingües declaradas en los metadatos, sin lista de idiomas ni evaluación publicada.
- Aprendizaje continuo en el borde mediante pesos rápidos recurrentes y consolidación diferida.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo está diseñado para ejecutarse en GGUF ternario de 1.58 bits con un peso de aproximadamente 436 MB, lo que permite desplegarlo en hardware con recursos limitados y mantener conversaciones multi-turno sin conexión.
- Personalización continua por usuario: el mecanismo de pesos rápidos recurrentes permite adaptar el comportamiento durante la sesión sin reentrenar, lo que resulta adecuado para asistentes que aprenden correcciones del usuario y las consolidan en la siguiente fase de reposo.
- Transcripción de voz en local: el codificador de audio nativo permite integrar dictado o subtitulado sin depender de servicios externos ni de pesos de terceros, con una pérdida de entropía cruzada reportada de 0,9206 en alineamiento.
- Investigación en aprendizaje continuo: el modelo sirve como banco de pruebas para estudiar la consolidación 75/25, el olvido catastrófico y la re-cuantización tras adaptación, dado que publica los pipelines de entrenamiento y los artefactos intermedios.
- Prototipado de sistemas multimodales ligeros: la combinación de tallos de audio y visión nativos sobre un backbone de menos de 1.000 millones de parámetros permite experimentar con arquitecturas ómnimodales en entornos con presupuesto de cómputo reducido.
- Evaluación de cuantización ternaria en producción: el formato TQ1_0 con tensores FP16 protegidos permite medir el impacto de la cuantización de 1.58 bits en calidad y latencia dentro de pipelines de despliegue GGUF.
- Docencia y divulgación técnica: la documentación detallada de las tres capas de aprendizaje facilita explicar conceptos de MoE, QLoRA y pesos rápidos con un caso concreto y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta telemetría interna de entrenamiento (pérdida de entropía cruzada de 0,9206 en audio, 2,08 en visión y una prueba de sanidad aritmética), que no constituyen evaluaciones comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en cuantización ternaria TQ1_0 (artefacto GGUF de 436,28 MB), más overhead de contexto y buffers de pesos rápidos (menos de 5 MB declarados).
- GPU recomendadas: no se especifican; por tamaño, el modelo es apto para GPU de consumo con 4 GB o más de VRAM, e incluso para inferencia en CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, y potencialmente en dispositivos integrados.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF; los metadatos indican compatibilidad con endpoints. No se documenta soporte explícito de vLLM o TGI.
- Latencia y throughput: la model card menciona más de 1.000 tokens por segundo en la fase awake sobre el GGUF congelado, aunque no se especifica el hardware empleado para esa medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepNarra Paham-Experimental | 951,7 M | no disponible | Apache-2.0 | safetensors, GGUF TQ1_0 | Aprendizaje continuo de tres niveles y multimodal nativo experimental |
| Qwen2.5-1.5B | 1.500 M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Modelo denso consolidado con benchmarks publicados |
| Llama 3.2 1B | 1.200 M | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Denso, multilingüe, con evaluaciones oficiales |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Denso, orientado a dispositivos de borde |

La comparación se limita a parámetros, contexto y licencia, ya que Paham-Experimental no publica resultados de benchmarks que permitan contrastar calidad. Los datos de los modelos alternativos corresponden a sus fichas oficiales.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar publicados: no es posible validar la calidad del modelo frente a alternativas consolidadas.
- La capacidad visual se encuentra en estado experimental, con deriva de plantilla reconocida por el autor y pendiente de una reconstrucción en la versión 2.0.
- La model card está redactada en un tono promocional y contiene afirmaciones no verificadas (por ejemplo, "Zero-Drift" o más de 1.000 tokens por segundo) sin metodología ni hardware especificado.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- No se especifica la lista de idiomas soportados más allá de "inglés y multilingüe", ni su calidad relativa.
- No hay información sobre sesgos, alineamiento, RLHF o filtrado de datos más allá de los datasets citados.
- El repositorio ocupa 4.017,1 GB, un tamaño desproporcionado para un modelo de menos de 1.000 millones de parámetros, lo que sugiere artefactos de entrenamiento o checkpoints intermedios que dificultan su descarga y auditoría.
- El modelo tiene cero "likes" y una fecha de creación futura en los metadatos (2026), lo que exige precaución sobre su procedencia y madurez.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la falta de evaluaciones hace recomendable no desplegarlo en producción sin una validación propia.
- Riesgo de alucinación no cuantificado; el tamaño reducido y la cuantización ternaria pueden degradar tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepNarra/Paham-Experimental
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Modelo base Paham: https://huggingface.co/DeepNarra/Paham
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Aya Collection: https://huggingface.co/datasets/CohereForAI/aya_collection
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset No Robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
