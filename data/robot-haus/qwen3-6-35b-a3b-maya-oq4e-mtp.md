# Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-MAYA-oQ4e-mtp es una cuantización del modelo Qwen3.6-35B-A3B, un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba (Qwen). Esta versión concreta ha sido producida por Robot-Haus, un tercero independiente, utilizando su pipeline de cuantización oQe (imatrix-calibrated) a una profundidad de bits equivalente a Q4 con pesos en bf16. El objetivo principal es ofrecer una versión optimizada para Apple Silicon (M3/M4) que conserve dos componentes críticos que suelen perderse en conversiones automáticas: el codificador de visión (vision tower) y los cabezales de Multi-Token Prediction (MTP). El autor verifica explícitamente la presencia de 216 tensores de visión y 19 tensores MTP en el checkpoint.

El modelo base Qwen3.6-35B-A3B combina una arquitectura híbrida con Gated DeltaNet y Gated Attention, junto con enrutamiento MoE disperso y un codificador de visión, lo que le permite procesar tanto texto como imágenes. Con aproximadamente 35 mil millones de parámetros totales y unos 3.6 mil millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional. Esta cuantización reduce el tamaño del checkpoint a unos 20 GB, haciéndolo viable en equipos Apple con memoria unificada suficiente. La relevancia de esta versión radica en que aborda un problema práctico: muchas cuantizaciones de Qwen3.x en HuggingFace omiten silenciosamente los componentes de visión y MTP, y Robot-Haus garantiza su presencia mediante verificación directa de los índices safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 35B (modelo base); checkpoint cuantizado: 6.190.670.768 |
| Parametros activos | ~3.6B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (oQe, imatrix-calibrado, bf16); también existe variante Q3.5 fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina Gated DeltaNet y Gated Attention, un diseño que busca mejorar la eficiencia en el procesamiento de secuencias largas manteniendo la calidad de la atención tradicional. Sobre esta base se aplica un enrutamiento MoE disperso con 256 expertos, de los cuales se activan aproximadamente 3.6 mil millones de parámetros por token. El modelo incluye además un codificador de visión que permite entrada multimodal (imagen y texto). La cuantización oQe de Robot-Haus no modifica la arquitectura: se trata de una conversión directa de los pesos originales a precisión reducida, sin fine-tuning, abliteración ni merges. El proceso de cuantización utiliza calibración imatrix, que recopila estadísticas de activación sobre un corpus personalizado orientado a contenido de agentes, tool-calling, shell, domótica y código, logrando una cobertura del 100% de los expertos. Los tensores de visión y MTP se verificaron después de la cuantización inspeccionando el índice safetensors.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, permitiendo descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento y matemáticas: los benchmarks muestran un 91.0% en GSM8K y 80.9% en MMLU, indicando sólidas capacidades de razonamiento lógico y aritmético.
- Generación de código: destaca en tareas de programación, con 91.5% en HumanEval y 85.5% en MBPP, y especialmente en LiveCodeBench (53.0%), lo que sugiere aptitud para problemas de código complejos y de nivel competitivo.
- Multi-Token Prediction (MTP): los cabezales MTP están intactos (19 tensores), lo que permite decodificación especulativa para acelerar la generación en oMLX (modo "Lightning MTP").
- Tool calling y agentes: aunque no se confirma explícitamente en la model card, el corpus de calibración incluye contenido de tool-calling y agentes, y el modelo base Qwen3.6 está diseñado para agentic coding. Se espera que esta capacidad se conserve.
- Multilingüe: la model card solo lista inglés como idioma soportado, aunque el modelo base Qwen3.6 podría tener capacidades multilingües más amplias; esta versión no las garantiza.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar código, explicar fragmentos y sugerir correcciones. Su alto rendimiento en HumanEval y MBPP lo hace adecuado para tareas de autocompletado y revisión de código.
- Automatización de tareas de agente con tool calling: gracias a su soporte esperado de tool calling y su corpus de calibración orientado a agentes, puede utilizarse en sistemas que requieren interacción con APIs, ejecución de comandos shell o control de dispositivos domóticos.
- Análisis de documentos con imágenes: al conservar el codificador de visión, puede procesar capturas de pantalla, diagramas o gráficos dentro de documentos técnicos, extrayendo información y respondiendo preguntas sobre ellos.
- Chatbot de atención al cliente con contexto largo: aunque la longitud de contexto no está especificada, el modelo base Qwen3.6 soporta ventanas amplias; esta cuantización podría emplearse en sistemas de soporte que necesiten mantener conversaciones multi-turno con historial extenso.
- Generación de documentación técnica: el modelo puede redactar manuales, guías de usuario o comentarios de código a partir de especificaciones o código fuente, aprovechando su capacidad de razonamiento y comprensión del lenguaje natural.
- Prototipado rápido en entornos Apple Silicon: al estar optimizado para MLX y oMLX, es ideal para desarrolladores que trabajan en Mac con M3/M4 y necesitan un modelo local de alto rendimiento sin depender de la nube, por ejemplo para pruebas de concepto o desarrollo offline.

## Benchmarks y rendimiento

La model card proporciona resultados de "Intelligence Bench" con Thinking Mode desactivado y greedy/temp=0. Se comparan tres versiones: esta (Q4 bf16), la compañera Q3.5 fp16 y una línea base DWQ (anterior cuantización de producción).

| Benchmark | Q4 bf16 (este modelo) | Q3.5 fp16 | DWQ baseline |
|---|---|---|---|
| MMLU (1000q) | 80.9% | — | 80.9% |
| MMLU-Pro (300q) | 60.0% | — | — |
| HellaSwag (200q) | 93.0% | — | — |
| TruthfulQA (817q) | 85.6% | — | — |
| GSM8K (100q) | 91.0% | — | — |
| HumanEval (164q) | 91.5% | ~91% | 90.9% |
| MBPP (200q) | 85.5% | — | 83.5% |
| LiveCodeBench (100q) | 53.0% | 44.0% | 43.0% |

La ventaja más notable del Q4 bf16 se observa en LiveCodeBench, con una mejora de +9 puntos porcentuales frente al Q3.5 fp16 y +10 frente al baseline DWQ, lo que indica que la mayor profundidad de bits beneficia especialmente las tareas de código complejas.

## Requisitos de hardware

- Tamaño del checkpoint: ~20 GB (21.6 GB en el repositorio), por lo que se necesita al menos 24 GB de memoria unificada en Apple Silicon para cargarlo cómodamente.
- GPU recomendadas: diseñado para Apple Silicon. Se recomienda M3/M4 para bf16 (mejor throughput); en M1/M2 se sugiere usar la variante fp16 (Q3.5) por rendimiento superior.
- No probado en CUDA: aunque bf16 es el tipo nativo en NVIDIA, el autor indica que no fue testeado en hardware CUDA, por lo que su funcionamiento allí no está garantizado.
- Opciones de despliegue: pensado para oMLX (https://omlx.ai), cargable como modelo MLX estándar. También puede usarse con otras herramientas que soporten MLX, aunque no se mencionan explícitamente.
- Latencia y throughput: no se proporcionan datos numéricos. Se espera que la activación de MTP (Lightning MTP) acelere la decodificación, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B total, ~3.6B activos | no disponible | Apache 2.0 | safetensors (fp16/bf16) | Modelo original sin cuantizar, requiere más VRAM |
| Robot-Haus Q4 bf16 (este) | 35B total, ~3.6B activos | no disponible | Apache 2.0 | safetensors (MLX, Q4 bf16) | Cuantización con visión y MTP verificados, ~20 GB |
| Robot-Haus Q3.5 fp16 | 35B total, ~3.6B activos | no disponible | Apache 2.0 | safetensors (MLX, Q3.5 fp16) | Variante para M1/M2, menor rendimiento en LiveCodeBench |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE similares en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card solo declara soporte para inglés; el uso en otros idiomas puede degradar el rendimiento o producir resultados incorrectos.
- Cuantización: aunque los benchmarks muestran resultados cercanos al modelo original, la cuantización Q4 introduce pérdida de precisión, especialmente en tareas de razonamiento complejo o generación de código muy específico.
- Hardware: no probado en CUDA; su funcionamiento en GPUs NVIDIA es incierto. Está optimizado para Apple Silicon, y en M1/M2 la variante bf16 puede ser más lenta que la fp16.
- Longitud de contexto: no se especifica; los usuarios deben asumir que puede ser inferior a la del modelo base si la cuantización afecta a las posiciones de atención.
- Sesgos y alucinaciones: no se han evaluado específicamente en esta versión; como todo LLM, puede generar información falsa o reflejar sesgos presentes en los datos de entrenamiento.
- Verificación de componentes: aunque el autor confirma la presencia de tensores de visión y MTP, no se garantiza que el comportamiento funcional sea idéntico al del modelo original en todas las condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-mtp
- Variante fp16 para M1/M2: https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp
- Repositorio oficial de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b
- Ficha en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
- oMLX (herramienta de despliegue): https://omlx.ai
