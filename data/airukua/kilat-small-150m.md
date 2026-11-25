# AiRukua/kilat-small-150M

## Resumen

Kilat SMALL 150M es un modelo de lenguaje base preentrenado desde cero por AiRukua sobre la arquitectura propietaria Kilat v2.0 Macro-Synergy. Con 150.996.480 parámetros totales y 59.510.784 activos, combina tres mecanismos poco habituales en modelos de este tamaño: atención lineal recurrente con decaimiento exponencial global (sub-cuadrática), atención latente multi-cabeza (MLA) inspirada en DeepSeek-V2 y una capa de mezcla de expertos fina (DeepSeekMoE) con ocho expertos enrutados, activación top-2 y un experto compartido dedicado.

El modelo se entrenó con 10.000 millones de tokens del dataset FineWeb-Edu, un corpus de texto web filtrado por calidad educativa, y emplea un vocabulario de 50.257 tokens con una longitud de contexto de 2.048 tokens. Su perplexity reportada ronda 21. Es un checkpoint puramente base: no ha pasado por instrucción, alineamiento conversacional ni RLHF, y no define plantillas de chat.

Su relevancia actual reside en la exploración de arquitecturas híbridas eficientes a escala reducida: demuestra que es viable integrar atención latente y MoE de grano fino en modelos de 150M parámetros, lo que lo convierte en una pieza útil para investigación sobre eficiencia computacional, para experimentos de ajuste fino con recursos limitados y como base para estudiar el comportamiento de las arquitecturas sub-cuadráticas en tareas de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kilat v2.0 Macro-Synergy (transformer híbrido con atención lineal recurrente, MLA y DeepSeekMoE) |
| Parámetros totales | 150.996.480 (~151M) |
| Parámetros activos | 59.510.784 (~59.5M) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code=True` y código personalizado) |
| Vocabulario | 50.257 tokens |
| Tokens de entrenamiento | 10.000 millones (FineWeb-Edu) |
| Perplexity reportada | ~21 |
| Pipeline | text-generation |
| Descargas en Hugging Face | 296 |

## Arquitectura y entrenamiento

Kilat v2.0 Macro-Synergy articula tres componentes sobre un esqueleto de transformer causal. El primero es una atención lineal recurrente con decaimiento exponencial global, de complejidad sub-cuadrática, que mantiene un estado recurrente de tamaño constante durante la inferencia autorregresiva; esto reduce el coste de memoria del caché KV frente a la atención cuadrática clásica. El segundo es Latent Multi-Head Attention (MLA), que comprime las representaciones de clave y valor en un espacio latente, siguiendo el enfoque popularizado por DeepSeek-V2. El tercero es una capa DeepSeekMoE con ocho expertos enrutados, activación top-2 y un experto compartido siempre activo, lo que explica la diferencia entre los 151M parámetros totales y los 59.5M activos por token.

El preentrenamiento se realizó desde cero sobre 10.000 millones de tokens de FineWeb-Edu, un subconjunto de FineWeb filtrado por un clasificador de calidad educativa. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineamiento posterior; el checkpoint es explícitamente un modelo base sin instrucción. Tampoco se detallan la composición exacta del dataset más allá del nombre, el esquema de mezcla de datos, la estrategia de tokenización ni los hiperparámetros de entrenamiento (learning rate, batch size, hardware empleado).

## Capacidades

- Generación de texto por continuación: el modelo completa texto libre a partir de un prefijo, sin plantillas conversacionales.
- Razonamiento y conocimiento factual de dominio educativo: al entrenarse sobre FineWeb-Edu, cubre contenidos de ciencia, matemáticas, biología, física e informática a nivel divulgativo y académico básico.
- Capacidad multilingüe limitada: la model card declara únicamente inglés como idioma soportado.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso estructurado.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No es un modelo de chat: no reconoce etiquetas como `<|user|>` o `<|assistant|>` y no está alineado conversacionalmente.
- Sirve como base para SFT, DPO y adaptación a dominio, según indica el propio autor.

## Casos de uso

- Investigación sobre arquitecturas eficientes: el modelo permite estudiar empíricamente el comportamiento de la atención lineal recurrente con decaimiento global y de MLA en un modelo pequeño, comparando su calidad de generación con transformers densos de tamaño similar en tareas controladas.
- Ajuste fino supervisado (SFT) para dominios concretos: al ser un modelo base de 151M parámetros con licencia Apache 2.0, puede ajustarse con datasets específicos (por ejemplo, texto médico divulgativo o documentación técnica) en una única GPU de consumo, sirviendo como punto de partida para asistentes de dominio acotado.
- Generación de texto educativo y material didáctico: su entrenamiento sobre FineWeb-Edu lo hace adecuado para completar explicaciones de conceptos científicos y técnicos en inglés, con las temperaturas y penalizaciones recomendadas por el autor para evitar repeticiones.
- Experimentos de destilación y benchmarking de arquitecturas MoE: los 59.5M parámetros activos frente a los 151M totales permiten medir el coste real de la mezcla de expertos en latencia y calidad, útil para validar hipótesis sobre routing antes de escalar a modelos mayores.
- Prototipado rápido de pipelines de generación: con un repositorio de 0.6 GB y pesos en safetensors, puede cargarse en entornos con poca VRAM para probar infraestructuras de inferencia (transformers, servidores propios) antes de migrar a modelos de mayor tamaño.
- Educación y docencia en IA: sirve como ejemplo didáctico de implementación de MLA y DeepSeekMoE en código abierto, permitiendo a estudiantes inspeccionar y modificar la arquitectura con recursos mínimos.
- Generación de continuaciones en corpus de evaluación: útil para calcular perplexity y métricas de lenguaje sobre textos en inglés, dado que su PPL reportada (~21) está documentada y puede reproducirse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una perplexity aproximada de 21 sobre el corpus de entrenamiento o evaluación (sin especificar la partición exacta), y no incluye resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0.3 GB solo para los pesos (151M parámetros × 2 bytes), más el estado recurrente y las activaciones; en la práctica, menos de 1 GB en total.
- VRAM estimada en float32: alrededor de 0.6 GB para los pesos, más overhead; también por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo. Para lotes grandes o entrenamiento, se recomienda una RTX 4090, A100 o H100.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU para inferencia con latencia aceptable.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True` y `accelerate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al requerir código personalizado la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda `use_cache=False` en el ejemplo de generación, lo que sugiere que el caché recurrente puede no estar plenamente optimizado en la implementación publicada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Arquitectura | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| Kilat SMALL 150M | 151M | 59.5M | 2.048 | Híbrida (lineal + MLA + MoE) | Apache 2.0 | en |
| GPT-2 small | 124M | 124M (denso) | 1.024 | Transformer denso | MIT | en |
| SmolLM-135M | 135M | 135M (denso) | 2.048 | Transformer denso | Apache 2.0 | en (multilingüe parcial) |
| Pythia-160M | 160M | 160M (denso) | 2.048 | Transformer denso | Apache 2.0 | en |

La comparación con GPT-2 small, SmolLM-135M y Pythia-160M se ofrece por proximidad de escala, no por paridad de rendimiento: no se dispone de benchmarks publicados de Kilat SMALL 150M que permitan una comparación cuantitativa directa. La diferencia estructural clave es que Kilat es el único de los cuatro con arquitectura híbrida y MoE, lo que reduce los parámetros activos a 59.5M frente a los 124-160M densos de las alternativas.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones, no mantiene conversaciones y no debe usarse directamente como asistente sin un ajuste previo.
- Riesgo elevado de repetición y bucles n-gram en decodificación greedy; el autor recomienda explícitamente muestreo con temperatura 0.70-0.75, top-p 0.90-0.92, top-k 50 y penalización de repetición de 1.15-1.20.
- Ventana de contexto corta (2.048 tokens), insuficiente para tareas de contexto largo o documentos extensos.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Riesgo de alucinación inherente a un modelo de 151M parámetros con 10.000 millones de tokens de entrenamiento: la cobertura factual es limitada y la precisión en dominios especializados es baja.
- Sesgos: al entrenarse sobre FineWeb-Edu, hereda los sesgos presentes en texto web filtrado por calidad educativa; no se documenta ninguna mitigación.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de desplegarlo en producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales documentadas.
- No se documentan resultados de benchmarks ni evaluaciones de seguridad, por lo que su idoneidad para producción debe validarse empíricamente antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiRukua/kilat-small-150M
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos del modelo.
