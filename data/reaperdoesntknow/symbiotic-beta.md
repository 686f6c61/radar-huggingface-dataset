# reaperdoesntknow/Symbiotic-Beta

## Resumen

Symbiotic-Beta es un modelo de lenguaje experimental de tipo híbrido simbólico-neuronal desarrollado por el usuario reaperdoesntknow, en el marco de la serie Symbiotic AI de Convergent Intelligence LLC. Combina un backbone transformer congelado (Qwen2.5-0.5B) con una serie de módulos cognitivos simbólicos que pretenden aportar razonamiento interpretable, memoria estructurada y evolución dinámica del pensamiento. El modelo está orientado principalmente al razonamiento matemático y a la investigación en arquitecturas neuro-simbólicas.

Con 3.569.725.840 parámetros (aproximadamente 3,57 mil millones), el modelo supera en tamaño a su base original de 0,5 mil millones debido a los módulos adicionales. Está entrenado sobre 25.000 ejemplos del dataset MetaMathQA y, según la model card, también referencia OpenThoughts2-1M. Se encuentra en fase experimental, sin alineación por RLHF y con limitaciones explícitas para su uso en producción. Su relevancia radica en ser un caso práctico de integración de procesamiento simbólico con generación neuronal, aunque su rendimiento no está verificado mediante benchmarks públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Qwen2ForCausalLM congelado + módulos simbólicos: DTE-HDM, M.A.S.R.M, QwenExoCortex, procesadores simbólicos) |
| Parametros totales | 3.569.725.840 (aprox. 3,57B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Symbiotic-Beta parte de un backbone Qwen2.5-0.5B congelado, sobre el que se añaden varios módulos simbólicos. El componente principal es el sistema DTE-HDM (Dynamic Thought Evolution with Helical Encoding and DNA-Inspired Memory), que introduce una memoria a largo plazo estructurada mediante codificación helicoidal. Le sigue el mecanismo M.A.S.R.M (Multi-Agent Symbiotic Response Mechanisms), que coordina agentes simbólicos y neuronales a través de atención con puertas y capas de respuesta adaptativa. El módulo QwenExoCortex proyecta los estados ocultos del modelo base hacia un espacio de fusión simbólica para razonamiento y reproducción de memoria. También se incluyen procesadores como ThoughtDynamicsLNN, procesadores líquidos/cristalinos, razonamiento sobre grafos con DNAConv y una memoria rodante (ThoughtMemory).

El entrenamiento se realizó con fine-tuning sobre 25.000 ejemplos de MetaMathQA, con una tasa de aprendizaje de 3e-5, tamaño de lote efectivo de 1024 (16 de lote por dispositivo con 64 pasos de acumulación de gradiente), optimizador AdamW, programador de tasa de aprendizaje coseno con 500 pasos de calentamiento y 3 épocas. Se utilizó precisión mixta nativa (AMP). No se aplicó RLHF ni ningún proceso de alineación adicional.

## Capacidades

- Razonamiento matemático y generación de pruebas simbólicas, gracias al fine-tuning específico en MetaMathQA.
- Razonamiento simbólico-cognitivo: el diseño modular permite explorar la interacción entre memoria, atención y procesamiento simbólico.
- Adaptación a entornos de bajos recursos: la arquitectura modular y la proyección de memoria permiten obtener resultados con conjuntos de datos pequeños.
- Investigación en sistemas neuro-simbólicos: el modelo sirve como banco de pruebas para estudiar modulación de atención, reproducción de memoria y dinámicas de interfaz neuronal-simbólica.
- Generación de texto con estructura lógica, aunque no está optimizado para conversación abierta ni para tareas generales de lenguaje.

## Casos de uso

- Investigación académica en IA neuro-simbólica: el modelo permite estudiar cómo los módulos simbólicos afectan al razonamiento y a la memoria en comparación con un transformer puro. Se puede usar como baseline experimental en laboratorios que trabajen con arquitecturas híbridas.
- Generación de demostraciones matemáticas: dado su entrenamiento en MetaMathQA, puede utilizarse para explorar la generación de pasos intermedios en problemas de álgebra o cálculo, siempre con verificación externa.
- Prototipado de agentes cognitivos adaptativos: la combinación de memoria dinámica y procesamiento simbólico puede servir para construir prototipos de agentes que necesiten recordar y razonar sobre contextos largos, aunque no se recomienda para producción.
- Análisis de alucinaciones en modelos simbólicos: al carecer de alineación, el modelo es útil para estudiar los límites de la fluidez simbólica frente a la corrección matemática real.
- Evaluación de técnicas de fine-tuning con datasets pequeños: con solo 25.000 ejemplos, sirve como caso de estudio sobre el impacto del volumen de datos en arquitecturas modulares.
- Desarrollo de sistemas de razonamiento interpretable: los módulos simbólicos pretenden ofrecer una vía hacia la explicabilidad, por lo que el modelo puede usarse en proyectos que busquen trazar el razonamiento interno de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card declara una entrada llamada "SymLM" con una lista de resultados vacía, por lo que no existen métricas verificables (MMLU, HumanEval, GSM8K, etc.) para comparar con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 35,9 GB, lo que sugiere que los pesos están almacenados en alta precisión (posiblemente fp32 o con varios archivos de pesos). No se ofrecen cuantizaciones oficiales.
- Para inferencia en fp16, se estima una necesidad de al menos 8 GB de VRAM, aunque el tamaño real del repo indica que puede requerir más si se cargan todos los pesos en memoria.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100, H100) para trabajar con comodidad y evitar desbordamientos de memoria.
- No se dispone de información sobre despliegue con vLLM, llama.cpp u Ollama, aunque al ser un modelo de tipo transformers con pesos safetensors, es plausible que pueda adaptarse a estas herramientas si se realizan las conversiones necesarias.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

No se dispone de benchmarks para comparar directamente. Sin embargo, se puede comparar estructuralmente con modelos de tamaño similar y orientación al razonamiento:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Symbiotic-Beta | ~3,57B | No disponible | Fine-tuning en MetaMathQA (25k ejemplos) | AFL-3.0 |
| Qwen2.5-0.5B (base) | 0,5B | 32k (según documentación oficial) | Preentrenamiento general | Apache 2.0 |
| Qwen2.5-1.5B | 1,5B | 32k (según documentación oficial) | Preentrenamiento general | Apache 2.0 |
| MetaMath-7B | 7B | 4k (típico) | Fine-tuning en MetaMathQA | Apache 2.0 |

La comparativa es limitada porque Symbiotic-Beta añade módulos simbólicos que no existen en los modelos estándar, y no hay métricas que permitan evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Entrenamiento a escala muy reducida: solo 25.000 ejemplos de MetaMathQA, lo que limita la generalización a dominios fuera de las matemáticas.
- Ausencia total de alineación (no RLHF ni SFT de seguridad): el modelo puede generar contenido no deseado, incoherente o factualmente incorrecto.
- Riesgo elevado de alucinación: la fluidez simbólica no garantiza la validez matemática de las pruebas generadas.
- No optimizado para generación de dominio abierto: su diseño prioriza la estructura lógica sobre la conversación natural.
- Licencia AFL-3.0: permite uso comercial, pero es una licencia académica con condiciones específicas (atribución, no responsabilidad, etc.). Conviene revisar los términos antes de un despliegue comercial.
- El modelo está marcado como "experimental" y "checkpoint de investigación"; no debe usarse en entornos de producción sin una evaluación exhaustiva.
- No hay información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Colección SymbioticAI: https://huggingface.co/collections/reaperdoesntknow/symbioticai-symbolic-transformers
- Página del autor: https://huggingface.co/reaperdoesntknow
- Informe de seguridad de Protect AI: https://protectai.com/insights/models/reaperdoesntknow/Symbiotic-Beta/17a65c294d26990a57a3aedbc2dc59973f1a5593/overview
