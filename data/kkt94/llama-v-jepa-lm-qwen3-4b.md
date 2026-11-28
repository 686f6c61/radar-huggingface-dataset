# kkt94/Llama-V-JEPA-LM-Qwen3-4B

## Resumen

Llama-V-JEPA-LM-Qwen3-4B es un modelo de lenguaje y video (video-language model) desarrollado por el usuario kkt94, que combina un codificador visual congelado basado en V-JEPA 2.1 (un world model de tipo ViT-g) con el modelo de lenguaje Qwen3-4B-Instruct-2507. El modelo resuelve el problema de la comprensión temporal de video: responder preguntas sobre lo que ocurre en una secuencia de fotogramas, incluyendo relaciones de causalidad, orden temporal y cambios de escena. Es relevante porque aplica un enfoque de supervisión contrafactual para entrenar el puente entre visión y lenguaje, y publica resultados estado del arte en varios benchmarks de video-QA (MVP, TempCompass, Vinoground) según los badges de Papers with Code de su model card.

La arquitectura une un encoder V-JEPA 2.1 congelado con el LM Qwen3-4B mediante un "spectral bridge" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo tiene 5.057.113.088 parámetros totales según los pesos en safetensors (el LM base aporta aproximadamente 4B y el resto corresponde al bridge y componentes visuales). El repositorio ocupa 10,1 GB y se distribuye bajo licencia Apache-2.0, con soporte únicamente para inglés.

El nombre "Llama" no proviene del modelo base, sino de que los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, un dataset generado por Llama 3.2 cuya licencia exige que los modelos entrenados con él lleven el prefijo "Llama". El modelo está pensado para investigación en video-comprensión y para pipelines de video-question-answering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video-language model: encoder V-JEPA 2.1 (ViT-g, congelado) + spectral bridge + LM Qwen3-4B-Instruct-2507 |
| Parametros totales | 5.057.113.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal compuesto por tres piezas: un codificador de video V-JEPA 2.1 basado en ViT-g que permanece congelado durante el entrenamiento, un "spectral bridge" que proyecta la representación visual al espacio del lenguaje, y el modelo Qwen3-4B-Instruct-2507 como decodificador de texto. Cada clip de 32 fotogramas se comprime en 1.024 tokens visuales, lo que reduce el coste computacional de procesar video en comparación con enfoques que tokenizan cada fotograma de forma independiente.

El entrenamiento utiliza supervisión contrafactual: se aplican transformaciones a nivel de píxel sobre vídeos públicos para generar variantes con respuestas equilibradas, cuyas respuestas quedan fijadas por construcción y difieren únicamente en cómo cambia la escena. De este modo, el modelo de lenguaje aprende a leer las transformaciones temporales y causales del video en lugar de explotar atajos del dataset. Los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO sobre el LM base.

## Capacidades

- Respuesta a preguntas sobre video (video question answering) en formato video-text-to-text.
- Razonamiento temporal: orden de eventos, causalidad y cambios de escena en clips de 32 fotogramas.
- Comprensión de movimiento y acciones (MotionBench, SSv2).
- Discriminación de pares de video y texto (Vinoground, MVP), orientada a detectar diferencias finas entre clips.
- Extracción de características (feature-extraction) según los tags del repositorio.
- Capacidades de world model heredadas del encoder V-JEPA 2.1.
- Modelo multimodal: no se documentan en la información disponible capacidades de tool calling, agentes, audio ni thinking mode.
- Multilingüe: no, solo inglés.

## Casos de uso

- Moderación y análisis de contenido en video: el modelo puede responder preguntas sobre lo que ocurre en un clip de 32 fotogramas, útil para clasificar secuencias y detectar eventos concretos en pipelines de revisión automática.
- Búsqueda semántica sobre archivos de video: al convertir cada clip en 1.024 tokens visuales, se pueden generar representaciones y respuestas descriptivas que alimenten índices de búsqueda por lenguaje natural.
- Análisis de secuencias industriales o de vigilancia: preguntas sobre orden temporal de eventos y cambios de estado en grabaciones, aprovechando la supervisión contrafactual para detectar variaciones sutiles.
- Investigación en comprensión temporal: evaluación de modelos sobre MVBench, TempCompass, TVBench y Vinoground, con resultados publicados que permiten comparaciones reproducibles.
- Asistentes de accesibilidad: descripción y respuesta a preguntas sobre contenido de video para usuarios con discapacidad visual, en inglés.
- Anotación asistida de datasets de video: generación de respuestas y descripciones para etiquetar clips, reduciendo el trabajo manual en la construcción de corpus de video-QA.
- Análisis deportivo o de movimiento: preguntas sobre acciones y trayectorias en clips cortos, apoyándose en la capacidad medida en MotionBench y SSv2.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| MVBench | accuracy | 72,1 |
| PerceptionTest | accuracy | 78,2 |
| TVBench | accuracy | 74,8 |
| TempCompass | accuracy | 79,9 |
| TOMATO | accuracy | 53,5 |
| MotionBench | accuracy | 59,1 |
| NExT-QA | accuracy | 79,3 |
| MVP | pair accuracy | 58,1 |
| TemporalBench (binary) | accuracy | 75,7 |
| SSv2 (multiple choice) | accuracy | 92,2 |
| Vinoground text | text pair accuracy | 76,0 |
| Vinoground video | video pair accuracy | 66,8 |

Según los badges de Papers with Code incluidos en la model card, el modelo declara estado del arte en MVP, TempCompass (MCQ), Vinoground (text score) y Vinoground (video score), y el puesto número 3 en MotionBench. No se proporcionan en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.057 millones de parámetros en precisión completa (fp16) se requieren aproximadamente 10 GB solo para pesos, más memoria para el encoder V-JEPA y las activaciones de video, por lo que se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en fp16; GPUs con 24 GB o más para clips de 32 fotogramas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización, aunque no se documentan tipos de cuantización soportados.
- Opciones de despliegue: transformers (librería declarada) con código personalizado (custom_code); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-4B | 5,06B | no disponible | V-JEPA 2.1 + Qwen3-4B | apache-2.0 |
| Qwen3-4B-Instruct-2507 (base LM) | ~4B | no disponible | LLM de texto | apache-2.0 |
| Llama-V-JEPA-LM-Llama3.1-8B (misma familia) | no disponible | no disponible | V-JEPA 2.1 + Llama 3.1 8B | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables para establecer una comparación cuantitativa; la comparativa se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- Entrenado sobre videos públicos y datos generados por Llama 3.2 (split FGQA de PLM-Video-Human), lo que puede introducir sesgos de dominio y de representación.
- Riesgo de alucinación en respuestas sobre contenido visual no presente en el clip o en clips ambiguos.
- No se documentan la longitud de contexto, los tipos de cuantización ni el throughput, lo que dificulta planificar despliegues en producción.
- Requiere código personalizado (custom_code) en transformers, lo que puede complicar la integración con otros frameworks.
- Los resultados de benchmarks son declarados por el autor y no están verificados.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de datos generados por Llama 3.2 obliga a mantener el prefijo "Llama" en el nombre del modelo derivado.
- El encoder V-JEPA está congelado, por lo que el modelo no se adapta a dominios visuales muy distintos de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-4B
- Paper: https://arxiv.org/abs/2611.17831
- Código y reporte técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (variante 8B): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
