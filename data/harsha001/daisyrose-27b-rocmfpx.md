# Harsha001/DaisyRose-27B-ROCmFPX

## Resumen

DaisyRose-27B-ROCmFPX es una colección de cuantizaciones GGUF del modelo DaisyRose-27B de RadixArk, publicada por el usuario Harsha001. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a hardware AMD: los ficheros emplean los formatos de pesos ROCmFPX, con escalas por tensor, para ejecutarse en GPUs AMD mediante Vulkan o ROCm/HIP, y en particular en equipos con memoria unificada como Strix Halo.

El modelo base, DaisyRose-27B, es un ajuste fino por refuerzo (RL) de Qwen3.8-27B según la model card del autor. Se describe como un transformer denso de 64 capas con gated delta net y atención completa cada cuarta capa, además de entrada de imagen y una capa de predicción multi-token que se conserva en todos los ficheros cuantizados.

La relevancia de esta publicación es acotada y práctica: ofrece una vía para ejecutar un modelo multimodal de gran tamaño en GPUs AMD de consumo y en plataformas de memoria unificada, un terreno tradicionalmente peor cubierto que el de NVIDIA. Conviene señalar desde el inicio que el repositorio tiene 0 descargas, que los tamaños de los ficheros de pesos figuran como pendientes y que el propio autor indica que solo ha validado los ficheros en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con gated delta net y atención completa cada cuarta capa, 64 capas; capa de predicción multi-token; codificador visual para entrada de imagen |
| Parametros totales | 460.730.096 según los safetensors del repositorio; la model card denomina al modelo base "27B", discrepancia no aclarada |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de ejecución de la model card; no se especifica el máximo del modelo base |
| Tipos de cuantizacion | Q8_0, Q6_0 (con embedding y salida en Q6_K), ROCmFP4 con capas de atención, salida de delta net y capa de salida en 8 bits ROCmFPX; codificador visual en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con escalas de tensor ROCmFPX); codificador visual en GGUF F16 separado (mmproj) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card corresponde al modelo base DaisyRose-27B: un transformer denso de 64 capas que combina capas de gated delta net con capas de atención completa intercaladas cada cuatro capas. Incorpora entrada de imagen mediante un codificador visual independiente y mantiene una capa de predicción multi-token, presumiblemente heredada de la familia Qwen3.8. El modelo base se presenta como un ajuste fino mediante aprendizaje por refuerzo sobre Qwen3.8-27B de Qwen; no se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el algoritmo de RL empleado.

El trabajo técnico de esta publicación se centra en la cuantización. El proceso consistió en convertir los pesos a BF16 con `convert_hf_to_gguf.py` y después cuantizar con `llama-quantize` aplicando escalas ROCmFPX, que consisten en una escala potencia de dos por tensor almacenada en un fichero `.scale`. Se utilizó una matriz de importancia generada con `calibration_datav3` sobre los pesos BF16. La model card indica que la validación se ha realizado únicamente en CPU y que las rutas Vulkan y ROCm todavía no se han probado con este modelo.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat propia de Qwen3.8 y modo de razonamiento (thinking) activado por defecto.
- Entrada de imagen a texto (pipeline image-text-to-text) mediante el fichero `mmproj-DaisyRose-27B-F16.gguf`, que debe cargarse junto al modelo principal.
- Razonamiento y matemáticas: capacidad esperable por herencia de la familia Qwen3.8, aunque no se aportan evaluaciones específicas en la información disponible.
- Generación de código: no se documenta de forma explícita en la model card; debe considerarse no verificado.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el único control de calidad documentado es en inglés.
- Predicción multi-token conservada en todos los ficheros cuantizados, lo que puede habilitar decodificación especulativa si el runtime la soporta.

## Casos de uso

- Inferencia local en GPUs AMD de 16 a 24 GB: el fichero Q4_0 con ROCmFP4 está pensado para tarjetas AMD de ese rango de memoria, lo que permite ejecutar un modelo multimodal de gran tamaño sin hardware NVIDIA.
- Despliegue en plataformas Strix Halo: los ficheros Q8_0 y Q6_0 están dimensionados para equipos con memoria unificada de 32 GB, un escenario habitual en estaciones compactas y mini-PC con APU AMD.
- Procesamiento de documentos con imagen: al cargar el mmproj F16, el modelo puede recibir capturas, diagramas o páginas escaneadas y generar descripciones o extracciones de texto, siempre que se valide la calidad en el caso concreto.
- Asistente conversacional con contexto medio: el ejemplo de la model card arranca con 32.768 tokens de contexto, suficiente para sesiones de chat largas o para incluir varios documentos en el prompt.
- Prototipado e investigación sobre cuantización: el repositorio sirve como referencia para estudiar el efecto de las escalas ROCmFPX y de la matriz de importancia en la fidelidad respecto a BF16.
- Evaluación comparativa de runtimes en AMD: permite medir el rendimiento de llama.cpp con Vulkan frente a ROCm/HIP en el mismo modelo y los mismos pesos, algo útil para decidir la pila de despliegue.
- Experimentación con decodificación multi-token: al conservarse la capa de predicción multi-token, es un banco de pruebas para técnicas de decodificación especulativa en hardware AMD.

## Benchmarks y rendimiento

La model card incluye una tabla de calidad de cuantización basada en divergencia KL contra los pesos BF16, calculada sobre 40 fragmentos de 512 tokens de Wikipedia en inglés (wikitext-2) en CPU. Los valores de perplejidad y KL figuran como pendientes, y la referencia BF16 no está publicada.

| Build | Tamano | Perplejidad | KL a BF16 | Mismo token superior |
|---|---:|---|---|---|
| BF16 (referencia, no publicada) | 54,6 GB | pendiente | — | — |
| Q8_0 ROCmFPX | pendiente | pendiente | pendiente | pendiente |
| Q6_0 ROCmFPX | pendiente | pendiente | pendiente | pendiente |
| Q4_0 ROCmFP4 Strix O8 | pendiente | pendiente | pendiente | pendiente |

El único control funcional documentado es una comprobación de chat en modo greedy ("¿Cuál es la capital de Francia?" devuelve "París") superada por todos los ficheros. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 está pensado para 32 GB (Strix Halo o GPUs AMD de 32 GB); el Q6_0 para 24 GB o Strix Halo; el Q4_0 con ROCmFP4 para GPUs AMD de 16 a 24 GB. Los tamaños exactos de los ficheros figuran como pendientes en la model card.
- Codificador visual: el mmproj F16 ocupa 0,9 GB adicionales y es necesario para la entrada de imagen.
- GPUs recomendadas: tarjetas AMD con soporte Vulkan o ROCm/HIP; el autor cita explícitamente Strix Halo y GPUs AMD de 16, 24 y 32 GB. No se mencionan modelos NVIDIA ni Apple Silicon.
- GPU de consumo: sí, en el rango Q4_0 para tarjetas AMD de 16 a 24 GB; el Q8_0 requiere 32 GB y queda fuera de la mayoría de GPUs de consumo convencionales.
- Opciones de despliegue: fork de llama.cpp de ROCmFPX (rama `main`), compilado con Vulkan o ROCm/HIP; ejemplo con `llama-server`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. El autor indica que solo se ha probado en CPU y solicita reportes de la comunidad sobre Vulkan y ROCm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-ROCmFPX (esta ficha) | 460.730.096 según safetensors; "27B" según la model card | 32.768 en el ejemplo de ejecución | Texto e imagen | Apache-2.0 | GGUF con escalas ROCmFPX, orientado a AMD |
| RadixArk/DaisyRose-27B (base) | No disponible | No disponible | Texto e imagen | Apache-2.0 | Pesos originales en Hugging Face |
| Qwen/Qwen3.8-27B (modelo de partida) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Pesos originales en Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño sin resolver: los safetensors del repositorio declaran 460.730.096 parámetros, mientras que la model card habla de un modelo "27B" y de pesos BF16 de 54,6 GB. Conviene verificar el contenido real antes de planificar el despliegue.
- Validación incompleta: el autor confirma que los ficheros solo se han comprobado en CPU; Vulkan y ROCm no se han probado con este modelo, por lo que el rendimiento y la estabilidad en GPU AMD no están garantizados.
- Métricas de calidad pendientes: perplejidad y divergencia KL figuran como pendientes, de modo que no hay evidencia publicada sobre la pérdida de calidad de cada cuantización.
- Tamaños de fichero pendientes: los pesos Q8_0, Q6_0 y Q4_0 no tienen tamaño publicado, lo que dificulta estimar con precisión los requisitos de memoria.
- Dependencia de un fork: requiere el fork de llama.cpp de ROCmFPX; no funciona con llama.cpp upstream ni con otros motores habituales, lo que limita la portabilidad y el soporte.
- Idiomas no documentados: no se especifican los idiomas soportados y la única evaluación de calidad es en inglés.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de fiabilidad; al ser un ajuste por refuerzo sobre Qwen3.8, hereda los sesgos y riesgos del modelo original, no cuantificados aquí.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y tenerse en cuenta que el modelo base y el modelo de partida pueden tener condiciones propias que conviene revisar.
- Madurez del repositorio: 0 descargas, 1 like y publicación el mismo día de la creación y actualización; no es una versión oficial de RadixArk ni de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/DaisyRose-27B-ROCmFPX
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo de partida: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
