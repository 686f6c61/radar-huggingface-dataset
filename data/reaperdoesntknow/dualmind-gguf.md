# reaperdoesntknow/DualMind-GGUF

## Resumen

DualMind-GGUF es una colección de cuantizaciones en formato GGUF del modelo DualMind, desarrollado por Convergent Intelligence LLC (autor en HuggingFace: reaperdoesntknow). DualMind es un modelo de lenguaje de aproximadamente 2.030 millones de parámetros (el dato real de safetensors indica 2.031.739.904) que implementa una arquitectura de razonamiento de doble cognición: el modelo primero explora libremente una solución (fase `<explore>`), después se autocrítica de forma adversarial (`<examine>`) y finalmente sintetiza una respuesta limpia (`<response>`). Esta mecánica de diálogo interno entre dos "mentes" está colapsada en los pesos compartidos del modelo, lo que permite obtener razonamiento autocorregido sin necesidad de ejecutar múltiples pasadas.

El modelo base se entrenó a partir de Qwen3-1.7B mediante una cadena de destilación que incluye DistilQwen3, refinamiento DISC (Discrepancy Calculus) y destilación topológica de conocimiento (TKD) desde Qwen3-30B-A3B-Thinking, seguida de un ajuste fino supervisado (SFT) sobre el dataset LogicInference_OA. Esta versión GGUF está pensada para inferencia local en CPU o GPU de gama baja, con tamaños de archivo que van desde 1,1 GB (Q4_K_M) hasta 3,4 GB (F16). Su relevancia actual radica en ofrecer razonamiento matemático y lógico de calidad en un formato ligero y ejecutable en entornos edge, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-1.7B) con patrón de razonamiento dual-cognición (`<explore>`, `<examine>`, `<response>`) |
| Parametros totales | 2.031.739.904 (2,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos: DualMind-f16.gguf, DualMind-Q8_0.gguf, DualMind-Q5_K_M.gguf, DualMind-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

DualMind se basa en la arquitectura transformer decoder de Qwen3-1.7B, pero incorpora una innovación a nivel de entrenamiento: un esquema de doble cognición en el que el modelo aprende a generar primero un razonamiento exploratorio sin restricciones, después a criticar ese razonamiento desde una perspectiva adversarial y finalmente a producir una síntesis depurada. Esta dinámica de "diálogo interno" queda codificada en los pesos mediante etiquetas especiales (`<explore>`, `<examine>`, `<response>`) que el modelo emite durante la generación.

El linaje de entrenamiento documentado es: Qwen3-1.7B → DistilQwen3 (variante sin censura) → Disctil (refinado con DISC, Discrepancy Calculus) → destilación topológica de conocimiento (TKD) desde Qwen3-30B-A3B-Thinking → ajuste fino supervisado (SFT) sobre el dataset LogicInference_OA. La metodología completa se describe en el paper "From Three Teachers to Dual Cognition" (DOI: 10.57967/hf/8184). Los autores afirman que las fronteras estructurales detectadas por DISC durante el entrenamiento quedan "horneadas" en los pesos y se preservan a través de la cuantización, de modo que la degradación por precisión no afecta a la lógica interna del modelo.

## Capacidades

- Razonamiento matemático y lógico: el modelo está específicamente entrenado en inferencia lógica (dataset LogicInference_OA) y puede abordar demostraciones, pruebas y problemas de razonamiento formal.
- Autocrítica y autocorrección: mediante el patrón `<explore>` → `<examine>` → `<response>`, el modelo genera razonamiento, lo revisa críticamente y produce una respuesta final depurada.
- Generación de texto conversacional: soporta diálogos multi-turno en inglés, como indica el tag "conversational".
- Ejecución en entornos edge: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU o GPU con poca memoria (la card menciona "CPU/6GB GPU").
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, Ollama, LM Studio y otros motores compatibles.
- No se documentan capacidades de tool calling, function calling, visión, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Asistente de razonamiento matemático para estudiantes: el modelo puede guiar demostraciones paso a paso (por ejemplo, "probar que toda sucesión de Cauchy converge") gracias a su entrenamiento en inferencia lógica y su patrón de autocrítica que reduce errores en cadenas de razonamiento.
- Verificación de pruebas formales en entornos académicos: investigadores pueden usar el modelo para generar borradores de demostraciones y luego revisar la fase `<examine>` para detectar fallos lógicos antes de la síntesis final.
- Chatbot conversacional ligero en inglés para aplicaciones de atención al cliente: con la cuantización Q4_K_M (~1,1 GB) puede desplegarse en servidores pequeños o en dispositivos con 6 GB de RAM, ofreciendo respuestas contextuales sin depender de la nube.
- Generación de explicaciones técnicas en documentación: el modelo puede redactar explicaciones claras de conceptos lógicos o matemáticos, aprovechando su capacidad de sintetizar información tras un proceso de autocrítica.
- Prototipado rápido de agentes de razonamiento en local: desarrolladores pueden integrar DualMind-GGUF en pipelines de llama.cpp u Ollama para experimentar con patrones de razonamiento autocorregido sin necesidad de GPUs de alto rendimiento.
- Educación en lógica formal: el modelo puede plantear y resolver ejercicios de lógica proposicional o de primer orden, sirviendo como tutor interactivo en plataformas educativas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas con otros modelos. Los únicos datos cuantitativos son los tamaños de archivo de las cuantizaciones y la recomendación de parámetros de generación (temperature 0.6, top_p 0.9, repeat_penalty 1.3).

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido, se necesitan aproximadamente 3,4 GB (F16), 1,8 GB (Q8_0), 1,3 GB (Q5_K_M) o 1,1 GB (Q4_K_M) solo para los pesos. A esto hay que sumar la memoria de contexto y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar la cuantización Q4_K_M; para F16 se recomienda una GPU con 4 GB o más. La card indica que el modelo está pensado para "CPU/6GB GPU".
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja como GTX 1650 (4 GB), RTX 3050 (6 GB) o incluso en iGPUs con suficiente RAM compartida usando cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. También se puede usar con servidores como llama.cpp-server o integraciones en Python mediante llama-cpp-python.
- Latencia y throughput: no se proporcionan datos medidos. En CPU, un modelo de 2B cuantizado a Q4_K_M suele generar entre 10 y 30 tokens por segundo en hardware moderno de consumo, pero esto es una estimación genérica no confirmada por los autores.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, por tamaño y enfoque, los modelos más cercanos serían:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| DualMind-GGUF | 2,03B | no disponible | Razonamiento lógico con autocrítica | Apache 2.0 |
| Qwen2.5-1.5B | 1,5B | 32K (típico) | Generalista multilingüe | Apache 2.0 |
| Gemma-2-2B | 2,6B | 8K | Generalista multilingüe | Gemma License |
| Phi-3-mini | 3,8B | 4K | Razonamiento y código | MIT |

La diferencia clave de DualMind es su patrón de razonamiento dual-cognición, que no está presente en los otros modelos. Sin embargo, al no haber benchmarks públicos, no es posible afirmar que supere a estas alternativas en tareas concretas.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés (etiqueta `en`). No se recomienda su uso para otros idiomas, incluido el español.
- Longitud de contexto no documentada: se desconoce la ventana máxima de contexto soportada; esto puede provocar degradación o errores en conversaciones muy largas.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos. Como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios fuera de su entrenamiento (lógica y matemáticas).
- Riesgo de bucles de enumeración: la card recomienda un `repeat_penalty` de 1.3 para evitar que el modelo entre en ciclos repetitivos durante la fase `<explore>`.
- Origen no verificado: el modelo proviene de un autor independiente (Convergent Intelligence LLC) y no tiene respaldo de una organización establecida. La metodología (Discrepancy Calculus, Topological Knowledge Distillation) no está validada por la comunidad académica convencional.
- Limitaciones de la cuantización: las versiones Q4_K_M y Q5_K_M pueden degradar ligeramente la calidad del razonamiento, aunque los autores afirman que la estructura lógica se preserva.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario debe asumir la responsabilidad de cualquier salida generada.

## Enlaces

- [DualMind-GGUF en HuggingFace](https://huggingface.co/reaperdoesntknow/DualMind-GGUF)
- [DualMind (modelo base, SafeTensors)](https://huggingface.co/reaperdoesntknow/DualMind)
- [DualMinded-Qwen3-1.7B (variante entrenada con Opus)](https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B)
- [DualMind_Methodolgy (paper, DOI 10.57967/hf/8184)](https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy)
- [Colección DualMind](https://huggingface.co/collections/reaperdoesntknow/dualmind)
- [Colección DistilQwen](https://huggingface.co/collections/reaperdoesntknow/distilqwen)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://ollama.com)
- [LM Studio](https://lmstudio.ai)
