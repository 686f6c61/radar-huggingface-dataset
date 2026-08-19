# ram1234598766/Cesium2

## Resumen

Cesium2 (MORPH-AI) es un modelo de lenguaje experimental desarrollado por el autor independiente ram1234598766, publicado en HuggingFace en agosto de 2026. Se trata de una arquitectura modular construida sobre la base de Qwen/Qwen2.5-1.5B-Instruct, que incorpora nueve subsistemas diseñados para mejorar el razonamiento y la generación de código manteniendo un tamaño reducido (1.500 millones de parámetros, ~1 GB cuantizado). El proyecto se presenta como una propuesta de "IA local" capaz de ejecutarse en portátiles, teléfonos e incluso una Raspberry Pi 5, y de entrenarse en una GPU T4 gratuita de Google Colab en unas 2-3 horas.

La principal innovación es el diseño de doble vía Sistema-1/Sistema-2: un coordinador decide dinámicamente cuánto razonamiento dedicar a cada entrada y activa los subsistemas necesarios. Incluye un razonador multi-paso con profundidad adaptativa, un sesgo inyectado de estructura de código (indentación, balance de corchetes), memoria de trabajo persistente entre turnos, un verificador para decodificación best-of-n, un MoE disperso con 4 expertos (top-2), memoria clave-valor persistente, tokens de habilidad intercambiables y embeddings de profundidad. Aunque el modelo no ha sido validado con benchmarks públicos, su enfoque es interesante para experimentación en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modificación de Qwen2.5-1.5B-Instruct con 9 subsistemas adicionales (coordinador, razonador multi-paso, sesgo de código, scratchpad, verificador, MoE disperso, memoria persistente, skill tokens, depth embeddings) |
| Parametros totales | ~1.500 millones (base Qwen2.5-1.5B, sin cifra exacta publicada) |
| Parametros activos | No disponible (MoE top-2 de 4 expertos, sin cifra publicada) |
| Longitud de contexto | No disponible (hereda de Qwen2.5-1.5B-Instruct, típicamente 32.768 tokens) |
| Tipos de cuantizacion | GGUF q4, GGUF q2, 4-bit PyTorch (mencionados en la documentación) |
| Idiomas soportados | No disponibles (probablemente los mismos que Qwen2.5, pero no se especifica) |
| Licencia | apache-2.0 (la model card también menciona MIT al final, hay ambigüedad) |
| Formato de pesos | safetensors (PyTorch), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct y le añade una capa de orquestación modular. La arquitectura se describe como un sistema de doble vía: un Coordinador evalúa la complejidad de la entrada y decide el número de iteraciones de razonamiento (0-4) y qué subsistemas activar. El MultiStepReasoner implementa un bucle de pensamiento iterativo con pesos compartidos y profundidad adaptativa. El CodeAwareBias inyecta características estructurales del código (profundidad de indentación, balance de corchetes, probabilidad de ser código, saltos de línea) como un sesgo aprendido sobre los logits. El ScratchpadMemory almacena estados de razonamiento entre turnos. El VerifierHead genera una puntuación de auto-crítica para decodificación best-of-n. El Sparse MoE utiliza 4 expertos con selección top-2 por token, ofreciendo 4 veces la capacidad con aproximadamente la mitad del cómputo. La PersistentMemory es una memoria clave-valor que sobrevive entre conversaciones. Los Skill Tokens son embeddings intercambiables en caliente que permiten añadir habilidades sin reentrenar. Los Depth Embeddings predicen la complejidad de la tarea y condicionan el modelo sobre ella.

El entrenamiento se realizó con QLoRA sobre la base de Qwen2.5-1.5B-Instruct, utilizando un dataset generado automáticamente mediante HuggingFace Datasets (sin API key). El proceso completo tarda unas 2-3 horas en una GPU T4 gratuita de Google Colab. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. No se menciona el uso de RLHF o DPO; el ajuste se limita a QLoRA sobre los componentes y el modelo base.

## Capacidades

- Razonamiento adaptativo: el Coordinador decide entre respuesta inmediata (Sistema-1) o múltiples iteraciones de refinamiento (Sistema-2) según la complejidad de la entrada.
- Generación de código con conciencia estructural: el modelo inyecta características de indentación, balance de corchetes y saltos de línea como sesgo aprendido, mejorando la coherencia del código generado.
- Auto-crítica y decodificación best-of-n: la función `chat_best_of_n(prompt, n=4)` genera varios candidatos y selecciona el mejor según la puntuación del VerifierHead, útil para tareas de código y matemáticas.
- Memoria persistente entre turnos: el ScratchpadMemory y la PersistentMemory permiten resolver problemas multi-turno manteniendo estado de razonamiento.
- Habilidades intercambiables en caliente: los Skill Tokens permiten instalar nuevas capacidades mediante archivos `.skill` sin reentrenar el modelo.
- Eficiencia computacional: el MoE disperso y el salto adaptativo de cómputo (en dispositivos de bajo consumo, las entradas de baja complejidad omiten MoE y memoria) reducen el coste de inferencia.
- Soporte de tool calling y agentes: aunque no se documenta explícitamente, la arquitectura de memoria persistente y razonamiento multi-paso sugiere capacidad para flujos de agente, pero no hay confirmación oficial.
- Multilingüismo: no se especifican idiomas; probablemente hereda las capacidades de Qwen2.5-1.5B-Instruct (principalmente inglés y chino, con algo de otros idiomas), pero no está confirmado.

## Casos de uso

- Asistente de programación en entornos sin conexión: un desarrollador puede ejecutar Cesium2 en un portátil con 8 GB de RAM (cuantización GGUF q4) para obtener sugerencias de código, autocompletado y depuración básica sin depender de servicios en la nube. El CodeAwareBias ayuda a mantener la indentación y el balance de corchetes.
- Resolución de problemas matemáticos paso a paso: gracias al MultiStepReasoner y al VerifierHead, el modelo puede descomponer problemas complejos en pasos intermedios y seleccionar la mejor solución entre varias candidatas, útil para estudiantes o investigadores sin acceso a GPUs potentes.
- Chatbot de atención al cliente con memoria de sesión: la PersistentMemory y el ScratchpadMemory permiten mantener el contexto de una conversación a lo largo de múltiples turnos, recordando datos del usuario y decisiones previas, adecuado para despliegues en Raspberry Pi o teléfonos.
- Prototipado rápido de agentes de razonamiento: investigadores pueden usar la arquitectura de subsistemas para experimentar con diferentes estrategias de razonamiento (profundidad adaptativa, auto-crítica) sin entrenar un modelo completo desde cero.
- Generación de documentación técnica y explicaciones de código: el modelo puede analizar fragmentos de código y generar comentarios, documentación o explicaciones didácticas, aprovechando su sesgo de estructura de código.
- Entrenamiento de habilidades personalizadas: mediante el sistema de Skill Tokens y el script `skill_generator.py`, un usuario puede crear nuevas habilidades (por ejemplo, un experto en SQL o en expresiones regulares) con solo 15 minutos de LoRA, sin necesidad de reentrenar todo el modelo.
- Educación y experimentación en aprendizaje automático: al poder entrenarse en una T4 gratuita, es un banco de pruebas para estudiar arquitecturas MoE, memoria persistente y razonamiento adaptativo con un presupuesto de hardware mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor menciona "big accuracy gains on code/math" para la decodificación best-of-n, pero sin cifras concretas. Tampoco hay comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Inferencia en móvil: 4 GB de RAM o más, con cuantización GGUF q4 y llama.cpp/Termux. El modelo ocupa aproximadamente 1 GB cuantizado.
- Inferencia en portátil: 8 GB de RAM o más, con GGUF q4 o 4-bit PyTorch.
- Inferencia en escritorio: 16 GB de RAM o más, con precisión completa.
- Inferencia en Raspberry Pi 5: 8 GB de RAM, con cuantización GGUF q2.
- Entrenamiento: GPU T4 (16 GB VRAM) de Google Colab gratuita, sesión de ~12 horas, entrenamiento completo en ~2-3 horas.
- Opciones de despliegue: llama.cpp, Termux, PyTorch (runtime.py), exportación a GGUF mediante `export_gguf.py`. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponibles. El autor indica que en dispositivos de bajo consumo las entradas de baja complejidad omiten MoE y memoria, reduciendo el tiempo de respuesta, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Cesium2 (MORPH-AI) | ~1.5B | No disponible (base Qwen2.5) | apache-2.0 | Arquitectura modular con razonamiento adaptativo, MoE, memoria persistente |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32.768 | apache-2.0 | Transformer denso estándar, instruct |
| Llama-3.2-1B | 1.23B | 128.000 | llama3.2 | Transformer denso, instruct |
| Phi-3-mini | 3.8B | 128.000 | MIT | Transformer denso, enfocado en razonamiento |

Cesium2 se diferencia por su arquitectura no estándar (subsistemas adicionales, MoE disperso, memoria persistente) y por su objetivo de ejecutarse en hardware muy limitado. Sin embargo, carece de benchmarks públicos, mientras que los modelos comparados tienen evaluaciones extensas. La licencia apache-2.0 permite uso comercial, aunque la ambigüedad con la mención MIT en la documentación debería aclararse. En cuanto a contexto, probablemente hereda los 32.768 tokens de Qwen2.5, inferior a Llama-3.2 y Phi-3.

## Limitaciones y advertencias

- Proyecto experimental sin validación externa: no hay benchmarks, evaluaciones independientes ni casos de uso documentados más allá de la model card.
- Sesgos potenciales: al estar entrenado sobre Qwen2.5-1.5B-Instruct, hereda los sesgos de ese modelo base, que no están documentados en esta ficha.
- Riesgo de alucinación: sin evaluación, no se conoce la fiabilidad factual del modelo. La auto-crítica (best-of-n) puede mitigar errores en código y matemáticas, pero no garantiza exactitud.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente el rendimiento fuera de inglés y chino sea limitado.
- Ambigüedad de licencia: el YAML indica apache-2.0, pero la model card dice "MIT — do whatever you want with it". Esta contradicción debe resolverse antes de un uso comercial.
- Requisitos de entrenamiento no reproducibles: el dataset generado no está disponible públicamente, y el código fuente (repositorio morph-ai) no se ha publicado en HuggingFace ni en GitHub según la información disponible.
- Rendimiento desconocido en producción: no hay datos de latencia, throughput ni estabilidad. La arquitectura modular compleja puede introducir sobrecarga no cuantificada.
- Tamaño de contexto no confirmado: aunque se basa en Qwen2.5-1.5B-Instruct, no se verifica que la longitud de contexto se mantenga en 32.768 tokens tras las modificaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ram1234598766/Cesium2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto: no disponible (la model card menciona una estructura de carpetas `morph-ai` pero no proporciona URL externa)
- Notebook de entrenamiento: no disponible como enlace directo (se menciona `notebooks/colab_train.ipynb` dentro del proyecto)
