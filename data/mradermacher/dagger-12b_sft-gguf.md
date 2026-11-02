# mradermacher/dagger-12B_SFT-GGUF

## Resumen

dagger-12B_SFT es un modelo de lenguaje de 11.766.034.176 parámetros (aproximadamente 12B) afinado mediante SFT (supervised fine-tuning) por el usuario dipta007, y cuantizado a formato GGUF por mradermacher. Está especializado en razonamiento matemático con grafos computacionales y en el manejo de distractores, con un enfoque explícito en bengalí (bn) como idioma de bajos recursos, además de inglés (en). El modelo base es dipta007/dagger-12B_SFT, y los datasets de entrenamiento declarados son dipta007/dagger y dipta007/DistractMath-Bn.

La relevancia de este modelo radica en su doble vertiente: por un lado, aborda el razonamiento matemático "distractor-aware", es decir, la capacidad de ignorar información irrelevante en un enunciado; por otro, lo hace con especial atención al bengalí, un idioma con escasa representación en los modelos abiertos habituales. La licencia es Gemma, lo que vincula el uso del modelo a los términos de Google para esta familia.

Esta ficha describe la versión GGUF publicada por mradermacher, que incluye cuantizaciones estáticas desde Q2_K hasta Q8_0, además de un suplemento multimodal (mmproj) en Q8_0 y f16. El repositorio ocupa 83,9 GB y acumula 123 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma según licencia; detalles no publicados en la información disponible) |
| Parámetros totales | 11.766.034.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | bn (bengalí), en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors vía transformers, no confirmado en la información disponible |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos explícitos en la información proporcionada: no se especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, dimensiones ocultas o cabezas de atención. La licencia "gemma" y el tamaño de 12B sugieren una base derivada de la familia Gemma de Google, pero este extremo no se confirma en la model card. El modelo se distribuye a través de la librería transformers y ha sido convertido a GGUF por mradermacher.

En cuanto al entrenamiento, la model card indica que se aplicó SFT (supervised fine-tuning) sobre los datasets dipta007/dagger y dipta007/DistractMath-Bn. Las etiquetas del modelo incluyen "math", "reasoning", "computational-graph", "bangla", "low-resource" y "distractor-aware", lo que indica un énfasis en problemas matemáticos con grafos computacionales y en la robustez frente a información distractora. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en bengalí e inglés.
- Razonamiento matemático, con énfasis en problemas que requieren grafos computacionales.
- Razonamiento "distractor-aware": capacidad declarada de manejar enunciados con información irrelevante o engañosa.
- Soporte de conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Suplemento multimodal (mmproj) incluido en el repositorio, lo que sugiere capacidades de visión, aunque no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque las etiquetas de razonamiento lo hacen plausible; no confirmado.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en bengalí: el modelo puede emplearse para tutelar o resolver ejercicios aritméticos y algebraicos en bengalí, un idioma con pocos modelos abiertos especializados, aprovechando su entrenamiento en DistractMath-Bn.
- Filtrado de distractores en enunciados: en plataformas educativas, el modelo puede identificar y descartar información irrelevante en problemas verbales, ayudando a estudiantes a estructurar el razonamiento.
- Asistencia en inglés para matemáticas computacionales: dado su entrenamiento en grafos computacionales, puede apoyar la resolución de problemas que requieren descomponer una expresión en pasos intermedios.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, útil para prototipos y entornos sin conexión.
- Investigación en modelos de bajos recursos: sirve como caso de estudio para evaluar el rendimiento de un modelo de 12B en bengalí frente a modelos multilingües genéricos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro completo de cuantizaciones (Q2_K a Q8_0) que permite medir el impacto de la compresión en tareas matemáticas y de razonamiento.
- Integración en pipelines de inferencia con endpoints compatibles: la etiqueta "endpoints_compatible" facilita su uso en servicios tipo TGI o vLLM, aunque la compatibilidad exacta no se detalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,9 GB; Q3_K_M ~6,1 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,4 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB (tamaños de archivo, que sirven como cota inferior de memoria; hay que añadir overhead de contexto y KV cache).
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4070 de 12 GB es suficiente; para Q8_0, se recomienda una RTX 4090 de 24 GB o una A100/H100 si se requiere contexto largo o batch grande.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores con GPUs de 8-12 GB; Q5_K_M y Q6_K requieren 10-12 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; también es posible usar transformers con el modelo base en precisión completa o media. No se confirma compatibilidad con vLLM o TGI para la versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dagger-12B_SFT (este) | 11,77B | no disponible | bn, en | gemma | GGUF |
| Gemma 2 9B (referencia de familia) | 9B | no disponible en esta ficha | multilingüe | gemma | safetensors, GGUF |
| Qwen2.5 7B (referencia multilingüe) | 7B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B (referencia general) | 8B | no disponible en esta ficha | multilingüe | Llama 3.1 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad. La ventaja diferencial de dagger-12B_SFT es su especialización en bengalí y en razonamiento matemático con distractores, frente al enfoque generalista de las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado con datasets específicos de matemáticas en bengalí e inglés, puede presentar sesgos de dominio y de registro lingüístico.
- Riesgo de alucinación: no cuantificado; como modelo de 12B afinado con SFT, es esperable que alucine en problemas fuera de distribución, especialmente en matemáticas complejas.
- Limitaciones de contexto o idioma: solo se declaran bn y en; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no se especifica, lo que impide planificar cargas con documentos largos.
- Restricciones de licencia: la licencia Gemma impone términos de uso de Google (Gemma Terms of Use), con restricciones de uso comercial y obligaciones de atribución; es imprescindible revisarlas antes de un despliegue en producción.
- Caveats para producción: las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para tareas matemáticas se recomienda Q5_K_M o superior. El repositorio incluye un suplemento multimodal (mmproj), pero no se documenta su funcionamiento ni su calidad.
- El modelo es una cuantización estática: no se han publicado cuantizaciones ponderadas/imatrix para esta versión, lo que puede afectar a la calidad en comparación con variantes IQ optimizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/dagger-12B_SFT-GGUF
- Modelo base: https://huggingface.co/dipta007/dagger-12B_SFT
- Dataset principal: https://huggingface.co/datasets/dipta007/dagger
- Dataset de matemáticas con distractores: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Página de overview del cuantizador: https://hf.tst.eu/model#dagger-12B_SFT-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
