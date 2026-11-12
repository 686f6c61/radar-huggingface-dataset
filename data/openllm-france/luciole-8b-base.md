# OpenLLM-France/Luciole-8B-Base

## Resumen

Luciole-8B-Base es un modelo de lenguaje causal de 8.075 millones de parámetros desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a través del programa France 2030. Se trata de un modelo base (pretrained) con arquitectura híbrida Mamba-transformer (etiquetada como `nemotron_h` en Hugging Face), entrenado sobre aproximadamente 5,1 billones de tokens de datos multilingües.

Su relevancia radica en dos factores. Primero, es un esfuerzo explícito por construir un modelo fundacional con una representación del francés muy superior a la habitual en modelos de su tamaño, complementada con inglés y otras seis lenguas europeas y el árabe. Segundo, incorpora una ventana de contexto de 131.072 tokens, muy por encima de la media en la categoría de 8B, gracias al componente de estado espacio (Mamba) de su arquitectura híbrida.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está pensado como base para fine-tuning supervisado y alineamiento posterior (DPO, RLHF). No está diseñado para uso directo en producción sin adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-transformer (tag `nemotron_h`) |
| Parametros totales | 8.075.686.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (la model card menciona `load_in_4bit` como opción de inferencia eficiente) |
| Idiomas soportados | Francés, inglés, italiano, alemán, español, portugués, neerlandés, árabe; además de lenguas regionales francesas (euskera, bretón, catalán, corso, franco-provenzal, occitano, picardo, valón) y criollos franceses |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con `custom_code`; requiere `trust_remote_code`) |
| Tokens de entrenamiento | 5.103.612.329.984 (~5,1 billones) |
| Pasos de entrenamiento | 1.216.796 |
| Tamaño del repositorio | 16,2 GB |

## Arquitectura y entrenamiento

Luciole-8B-Base emplea una arquitectura híbrida que combina capas de estado espacio del tipo Mamba con capas de atención transformer, siguiendo el diseño identificado en Hugging Face como `nemotron_h`. Esta combinación busca reducir el coste computacional del procesamiento de secuencias largas —el componente Mamba escala de forma lineal con la longitud— manteniendo la capacidad expresiva de la atención. El resultado es una ventana de contexto de 131.072 tokens con un coste de inferencia más contenido que el de un transformer puro equivalente.

El entrenamiento se realizó sobre aproximadamente 5,1 billones de tokens en el supercomputador Jean Zay de GENCI, gestionado por IDRIS. La composición del corpus es: inglés 41,9 %, francés 30,4 %, alemán 3,8 %, español 3,5 %, italiano 1,9 %, portugués 1,3 %, neerlandés 1,0 %, árabe 0,5 %, lenguas regionales y criollos franceses 0,4 %, datos paralelos 1,7 %, lenguajes de programación 9,2 % y matemáticas en inglés 3,5 %. Los datos multilingües provienen en buena parte de FineWeb 2. El modelo es exclusivamente base: no consta que se haya aplicado RLHF, DPO ni instruction tuning. El repositorio de entrenamiento está publicado en GitHub (Luciole-Training) y el informe técnico está anunciado como pendiente de publicación.

## Capacidades

- Generación de texto causal y completado de secuencias en ocho idiomas principales, con especial énfasis en francés e inglés.
- Modelado de lenguaje multilingüe, incluida cobertura de lenguas regionales francesas y criollos, un caso poco frecuente en modelos de 8B.
- Procesamiento de contexto largo: hasta 131.072 tokens, adecuado para documentos extensos y tareas de recuperación en contexto.
- Capacidad de continuación de código, derivada del 9,2 % de datos de programación en el corpus, aunque el autor advierte explícitamente que no está optimizado para generación de código.
- Razonamiento matemático básico por exposición al 3,5 % de datos matemáticos en inglés, sin entrenamiento específico.
- Punto de partida para fine-tuning supervisado, instruction tuning y alineamiento por preferencias.
- No dispone de tool calling, function calling, modo thinking ni capacidades de agente en su estado actual; requeriría fine-tuning específico.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Fine-tuning para asistentes en francés: el 30,4 % del corpus en francés y la cobertura de variantes regionales lo convierten en una base sólida para SFT orientado a atención al cliente o asistentes internos en organizaciones francófonas, donde modelos genéricos rinden peor por sesgo hacia el inglés.
- Procesamiento de documentos legales y administrativos: la ventana de 131.072 tokens permite ingerir contratos, expedientes o normativa completa sin troceado, y usar el modelo como base para tareas de resumen extractivo o clasificación tras fine-tuning.
- Modelado de lenguaje para búsqueda y ranking: útil como encoder generativo o para reranking semántico en pipelines de recuperación multilingüe, especialmente en combinación con índices que cubran francés, alemán, español e italiano.
- Investigación en arquitecturas híbridas: al ser uno de los pocos modelos abiertos de 8B con arquitectura Mamba-transformer y contexto de 128K, sirve como banco de pruebas para estudiar eficiencia de atención, decodificación especulativa y comportamiento en secuencias largas.
- Generación aumentada con recuperación (RAG) en contextos multilingües: la combinación de contexto largo y cobertura de ocho idiomas permite construir sistemas RAG donde el contexto recuperado se inserta íntegro sin truncar.
- Base para modelos especializados en lenguas minorizadas: el subconjunto de lenguas regionales francesas y criollos (0,4 % del corpus) ofrece un punto de partida para proyectos de preservación lingüística y NLP de bajos recursos, con fine-tuning posterior sobre corpus específicos.
- Preentrenamiento continuado (continued pretraining) en dominios verticales: sectores como salud, legal o industrial pueden continuar el preentrenamiento sobre corpus propios aprovechando la licencia Apache 2.0 y el tamaño manejable de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un informe técnico "coming soon" y se limita a indicar curvas de pérdida de entrenamiento y evaluación de convergencia, sin cifras de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos, con 12-16 GB totales recomendados.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos; cabe en GPUs consumer de 8 GB, aunque con margen ajustado para contextos largos.
- GPUs recomendadas: A100 40/80 GB o H100 para entrenamiento y fine-tuning; RTX 4090 (24 GB) para inferencia en FP16 y fine-tuning con QLoRA; RTX 3090, 4080 y 4070 Ti para inferencia cuantizada.
- Cabe en GPU consumer: sí, en cuantización de 4 u 8 bits en tarjetas de 8-16 GB; en FP16 requiere 24 GB o más.
- Opciones de despliegue: la model card muestra ejemplos con `transformers` y `load_in_4bit`. Al usar `custom_code` (arquitectura `nemotron_h`), es necesario `trust_remote_code=True`; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible y depende del soporte de la arquitectura híbrida en cada runtime.
- Latencia y throughput: no disponibles. La arquitectura híbrida debería ofrecer ventajas en secuencias largas frente a un transformer puro, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luciole-8B-Base | 8,08B | 131.072 | Híbrida Mamba-transformer | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8,03B | 131.072 | Transformer denso | Llama 3.1 Community | Hugging Face |
| Mistral 7B v0.3 | 7,24B | 32.768 | Transformer denso | Apache 2.0 | Hugging Face |
| Gemma 2 9B | 9,24B | 8.192 | Transformer denso | Gemma Terms | Hugging Face |

La comparación con Llama 3.1 8B es la más directa por tamaño y ventana de contexto; la diferencia principal es la arquitectura híbrida y la distribución lingüística, mucho más favorable al francés en Luciole. Frente a Mistral 7B v0.3, Luciole cuadruplica el contexto y comparte licencia Apache 2.0. No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente base: no ha pasado por instruction tuning ni alineamiento, por lo que no debe usarse directamente en producción orientada a usuario final sin fine-tuning previo.
- Riesgo de generar contenido tóxico u ofensivo: el corpus incluye gran volumen de datos web y, en el caso del francés, obras de dominio público antiguas con sesgos de otras épocas. El filtrado del dataset es un trabajo en curso según el autor.
- Sesgo lingüístico: el rendimiento en lenguas distintas del francés y el inglés (árabe, neerlandés, portugués, lenguas regionales) es previsiblemente inferior, dado su peso reducido en el corpus.
- Riesgo de alucinación inherente a todo modelo de lenguaje base; no se han publicado evaluaciones de factualidad.
- No optimizado para generación de código pese a incluir un 9,2 % de datos de programación.
- La arquitectura `nemotron_h` requiere `trust_remote_code=True` y código personalizado; esto puede limitar la compatibilidad con herramientas de inferencia estándar y añade superficie de riesgo al ejecutar código del repositorio.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones adicionales, pero no exime del cumplimiento de la normativa aplicable en materia de datos y contenido generado.
- El informe técnico no está publicado, lo que dificulta la reproducibilidad y la evaluación independiente del proceso de entrenamiento.
- No dispone de soporte nativo de tool calling ni de agentes; cualquier uso en ese sentido exige fine-tuning específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-Training-Dataset
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training
- OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- FineWeb 2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
