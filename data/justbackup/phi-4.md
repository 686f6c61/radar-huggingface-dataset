# Justbackup/phi-4

## Resumen

Phi-4 es un modelo de lenguaje de 14 mil millones de parámetros desarrollado por Microsoft Research, diseñado para ofrecer capacidades avanzadas de razonamiento y lógica en un formato compacto y eficiente. Se basa en una arquitectura Transformer decoder-only densa, con una ventana de contexto de 16 000 tokens, y fue entrenado sobre un corpus de 9,8 billones de tokens que combina datos sintéticos de alta calidad, documentos públicos filtrados, libros académicos y conjuntos de preguntas y respuestas. Su proceso de entrenamiento incluyó una fase de ajuste fino supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar la adherencia a instrucciones y la seguridad.

El modelo se publicó en diciembre de 2024 bajo licencia MIT, lo que permite su uso comercial sin restricciones significativas. Está orientado principalmente al inglés, aunque incluye un 8 % de datos multilingües. Phi-4 destaca por su equilibrio entre tamaño, rendimiento y requisitos de hardware, siendo adecuado para entornos con limitaciones de memoria o latencia, así como para tareas que exigen razonamiento complejo, como matemáticas, código y comprensión lógica. Su relevancia actual radica en que demuestra que modelos de tamaño medio pueden alcanzar resultados competitivos en benchmarks de razonamiento, acercándose a modelos mucho más grandes con un coste computacional menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 14 659 507 200 (14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles principalmente (8 % multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phi-4 es un modelo Transformer decoder-only con 14 mil millones de parámetros, sin mezcla de expertos (MoE), lo que lo convierte en un modelo denso. La arquitectura sigue el diseño estándar de los modelos Phi anteriores, optimizado para razonamiento y generación de texto. El entrenamiento se realizó durante 21 días en 1920 GPUs H100-80G, utilizando un total de 9,8 billones de tokens. Los datos de entrenamiento son una extensión de los utilizados para Phi-3 e incluyen documentos públicos filtrados rigurosamente por calidad, datos educativos seleccionados, código, datos sintéticos tipo "textbook" para enseñar matemáticas, programación y razonamiento de sentido común, así como libros académicos y conjuntos de Q&A. Además, se incorporaron datos supervisados en formato chat para reflejar preferencias humanas en aspectos como seguimiento de instrucciones, veracidad y utilidad.

El proceso de alineación combinó ajuste fino supervisado (SFT) con optimización directa de preferencias (DPO) iterativa, con el objetivo de mejorar la precisión en la adherencia a instrucciones y reforzar medidas de seguridad. No se mencionan innovaciones técnicas específicas como decodificación especulativa o atención lineal; el modelo se centra en la calidad de los datos y el post-entrenamiento.

## Capacidades

- Generación de texto en inglés con alto nivel de razonamiento y lógica.
- Razonamiento matemático y resolución de problemas complejos, evaluado con benchmarks como MATH y MGSM.
- Generación de código funcional, evaluada con HumanEval.
- Comprensión lectora y razonamiento sobre texto, evaluado con DROP.
- Capacidad de seguir instrucciones en formato chat, gracias al ajuste con SFT y DPO.
- Conocimiento general del mundo, ciencia y actividades cotidianas, derivado de datos sintéticos y filtrados.
- Soporte multilingüe limitado: aunque el modelo está centrado en inglés, el 8 % de datos multilingües permite un rendimiento básico en otros idiomas.
- No se especifican capacidades de tool calling, agentes o multi-step reasoning más allá del razonamiento estándar.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Asistentes de razonamiento para educación: Phi-4 puede utilizarse para crear tutores que expliquen conceptos matemáticos o científicos paso a paso, aprovechando su capacidad de razonamiento lógico y su contexto de 16K tokens para manejar explicaciones extensas.
- Generación de código en entornos de desarrollo: gracias a su rendimiento en HumanEval, puede integrarse en IDEs o pipelines de CI/CD para autocompletar funciones, generar tests o refactorizar código, siempre que se valide la salida.
- Chatbots de atención al cliente en inglés: su entrenamiento con datos conversacionales y su adherencia a instrucciones lo hacen adecuado para gestionar consultas multi-turno, aunque su ventana de contexto limita conversaciones muy largas.
- Análisis de documentos técnicos y científicos: con 16K tokens de contexto, puede resumir o extraer información de artículos académicos, informes o manuales, facilitando la revisión de literatura.
- Sistemas de tutoría en línea: puede generar problemas de práctica, evaluar respuestas y proporcionar retroalimentación razonada, apoyándose en su entrenamiento con datos de matemáticas y lógica.
- Prototipado rápido de aplicaciones de lenguaje: al ser un modelo de 14B con licencia MIT, es adecuado para startups y proyectos que necesitan un LLM local o en la nube con buen rendimiento de razonamiento sin depender de APIs comerciales.
- Investigación en razonamiento de modelos: su arquitectura y datos de entrenamiento documentados permiten estudiar cómo los datos sintéticos mejoran las capacidades de razonamiento en modelos medianos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado con los siguientes benchmarks, pero no proporciona valores concretos: MMLU, MATH, GPQA, DROP, MGSM, HumanEval y SimpleQA. Se recomienda consultar el informe tecnico (arXiv:2412.08905) para obtener datos detallados de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 14 659 507 200 parametros, en precision FP16 se necesitan aproximadamente 28 GB de VRAM (14B x 2 bytes). Con cuantizacion de 8 bits, unos 14 GB; con 4 bits, unos 7 GB.
- GPUs recomendadas: para FP16, una A100 40GB, H100 80GB o RTX A6000 48GB. Para cuantizacion 8 bits, una RTX 4090 (24GB) o RTX 3090 (24GB) son suficientes. Con cuantizacion 4 bits, cabe en GPUs de 8-12 GB como RTX 3060 o RTX 4070.
- En consumer GPU: si, con cuantizacion. Una RTX 4090 puede ejecutarlo en 8 bits sin problemas.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI y transformers. Para produccion, vLLM o TGI ofrecen mayor throughput.
- Latencia y throughput: no disponible. Depende del hardware, cuantizacion y optimizaciones del servidor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phi-4 (este) | 14B | 16K | MIT | Enfocado en razonamiento, datos sinteticos |
| Llama 3 8B | 8B | 8K | Llama 3 license | Modelo popular, buen rendimiento general |
| Mistral 7B | 7B | 32K | Apache 2.0 | Ventana larga, eficiente |
| Qwen 14B | 14B | 8K | Apache 2.0 | Multilingue, buen rendimiento en codigo |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La eleccion entre estos modelos dependera de las necesidades de contexto, licencia y rendimiento especifico en tareas concretas.

## Limitaciones y advertencias

- El modelo esta principalmente enfocado al ingles; el rendimiento en otros idiomas es limitado (solo 8 % de datos multilingues).
- Puede presentar sesgos derivados de los datos de entrenamiento, especialmente en temas sociales o culturales, aunque se aplicaron medidas de seguridad durante el post-entrenamiento.
- Riesgo de alucinacion en hechos o informacion factual, como cualquier modelo de lenguaje. Se recomienda verificar salidas en aplicaciones criticas.
- La ventana de contexto de 16K tokens puede ser insuficiente para documentos muy largos o conversaciones extensas.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso mas alla del estandar.
- La licencia MIT permite uso comercial, pero no se proporcionan garantias de seguridad o exactitud para casos de alto riesgo.
- El modelo no fue evaluado para todos los usos posibles; los desarrolladores deben validar su comportamiento en el dominio especifico antes de desplegarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Justbackup/phi-4
- Informe tecnico (arXiv): https://arxiv.org/pdf/2412.08905
- Repositorio de Microsoft (referencia): https://huggingface.co/microsoft/phi-4
- Licencia MIT: https://huggingface.co/microsoft/phi-4/resolve/main/LICENSE
