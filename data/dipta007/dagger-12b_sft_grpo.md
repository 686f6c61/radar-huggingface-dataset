# dipta007/dagger-12B_SFT_GRPO

## Resumen

DAGGER-12B-SFT-GRPO es un modelo de razonamiento matemático desarrollado por dipta007, especializado en la resolución de problemas de palabras en bengalí (bangla) con un enfoque novedoso de conciencia de distractores. Se trata de un fine-tuning del modelo Gemma-3-12B-Instruct de Google, entrenado en dos fases: primero con ajuste supervisado (SFT) y posteriormente con optimización por política de gradiente relativo (GRPO). El modelo transforma los problemas matemáticos en grafos computacionales ejecutables en formato JSON, donde cada nodo representa una operación y se marcan explícitamente los nodos distractores (información irrelevante para la solución). Esta representación permite una ejecución determinista del resultado y reduce drásticamente el número de tokens generados en comparación con modelos de razonamiento convencionales (un 89 % menos de tokens según los autores). El trabajo está aceptado en EMNLP 2026 (Findings) y se publicó en arXiv con referencia 2601.06853.

El modelo tiene aproximadamente 12 187 millones de parámetros (12,2 B) y una longitud de contexto de 4096 tokens. Está orientado a un contexto de bajo recurso: el bengalí, un idioma con escasos recursos en el ámbito del razonamiento matemático. Su relevancia actual radica en que aborda un problema práctico: la sensibilidad de los modelos de lenguaje a los distractores en problemas matemáticos, donde la información irrelevante puede degradar significativamente la precisión. DAGGER-12B-SFT-GRPO logra una caída de precisión de solo 12-14,4 puntos cuando se añaden distractores, frente a 14-20 puntos de modelos de razonamiento y hasta 41 puntos en cadenas de pensamiento estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, basado en Gemma-3-12B-Instruct |
| Parámetros totales | 12 187 325 040 (12,2 B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | FP4, FP8, INT4, INT8 (vía FriendliAI) |
| Idiomas soportados | Bengalí (bn), inglés (en) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura transformer de Gemma-3-12B-Instruct, que incorpora mecanismos de atención eficientes y una ventana de contexto de 4096 tokens. El entrenamiento se realizó en dos etapas: primero una fase de ajuste supervisado (SFT) sobre el dataset `dipta007/dagger` y el dataset `dipta007/DistractMath-Bn`, que incluye problemas matemáticos en bengalí con distractores controlados. A continuación se aplicó una fase de optimización con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo que ajusta el modelo para maximizar la precisión en la generación de grafos computacionales correctos. Se utilizó LoRA con rango 64 para la adaptación eficiente. La innovación principal es la salida en formato de grafo computacional JSON, donde cada nodo contiene una operación (`add`, `sub`, `mul`, `div`, `sqrt`, `sum`, `mean`, etc.), sus argumentos, un campo `distractor` que indica si la información es irrelevante para el cálculo final, y una etiqueta. El modelo identifica los nodos distractores y los excluye del camino de cálculo, lo que mejora la robustez frente a información superflua. Esta representación es ejecutable de forma determinista mediante un intérprete, garantizando que la respuesta final se obtiene mediante operaciones aritméticas explícitas.

## Capacidades

- Generación de grafos computacionales en JSON con operaciones aritméticas, lógicas y estadísticas (`const`, `add`, `sub`, `mul`, `div`, `abs`, `sum`, `mean`, `min`, `max`, `floor`, `ceil`, `round`, `sqrt`, `pow`, `mod`, `gcd`, `lcm`, `identity`).
- Identificación explícita de nodos distractores en el problema, lo que permite separar información relevante de la irrelevante.
- Razonamiento matemático en bengalí e inglés, con soporte para problemas de palabras (word problems).
- Ejecución determinista del grafo computacional: el resultado final se obtiene sin depender de la generación libre de texto.
- Reducción significativa del número de tokens generados en comparación con cadenas de pensamiento o modelos de razonamiento (359 tokens frente a 3 128 de Qwen 3-8B Reasoning y 599 de Gemma 3-12B CoT).
- Capacidad de procesamiento de imágenes y texto (tag `image-text-to-text`), aunque el modelo está diseñado principalmente para texto matemático.
- Generación de texto en formato conversacional, adecuado para aplicaciones de tutoría o asistencia matemática.

## Casos de uso

- **Tutoría de matemáticas en bengés**: el modelo puede resolver problemas de texto en bengalí y explicar el proceso mediante un grafo computacional, lo que permite a estudiantes ver qué operaciones se aplican y qué información se descarta. Su salida estructurada facilita la generación de explicaciones paso a paso.
- **Evaluación automática de razonamiento**: en entornos educativos o de evaluación, el modelo puede generar grafos computacionales que se pueden ejecutar y comparar con la respuesta esperada, permitiendo una verificación determinista sin depender de la generación de texto libre.
- **Sistemas de preguntas y respuestas en dominio matemático**: integración en chatbots o asistentes que atienden consultas matemáticas en bengalí, especialmente cuando los problemas incluyen datos irrelevantes o distractores comunes en contextos reales.
- **Análisis de robustez de modelos**: el modelo puede usarse como herramienta para generar problemas con distractores y evaluar la sensibilidad de otros sistemas de razonamiento matemático, gracias a su capacidad de marcar explícitamente los nodos distractores.
- **Generación de datos de entrenamiento**: los grafos computacionales producidos por el modelo pueden servir como datos anotados para entrenar otros modelos de razonamiento, o para construir conjuntos de datos de problemas con distractores.
- **Sistemas de ayuda en la resolución de problemas en lenguas de bajos recursos**: el modelo es útil para aplicaciones en bengés, un idioma con escasos recursos de IA, y puede adaptarse a otros idiomas similares mediante fine-tuning adicional.

## Benchmarks y rendimiento

La siguiente tabla presenta los resultados declarados por el autor en el model-index de Hugging Face:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Problemas de matemáticas | MGSM-BN | Original Accuracy | 78,4 |
| Problemas de matemáticas | MGSM-BN | Distractor Accuracy | 64,0 |
| Problemas de matemáticas | MSVAMP-BN | Original Accuracy | 78,8 |
| Problemas de matemáticas | MSVAMP-BN | Distractor Accuracy | 66,8 |

Además, la model card incluye una comparación con otros modelos en los mismos conjuntos de datos:

| Modelo | MGSM | MSVAMP | MGSM (+D) | MSVAMP (+D) | Weighted Avg | Tokens |
|---|---|---|---|---|---|---|
| Qwen 3-8B (Reasoning) | 88,0 | 81,1 | 70,5 | 66,9 | 71,4 | 3 128 |
| DAGGER-12B (Ours) | 78,4 | 78,8 | 64,0 | 66,8 | 69,4 | 359 |
| Gemma 3-12B (CoT) | 76,8 | 72,3 | 54,3 | 48,7 | 55,7 | 599 |

(+D) = con distractores añadidos. El modelo logra una precisión comparable a la de Qwen 3-8B con una reducción del 89% en el número de tokens generados. La caída de precisión al añadir distractores es de 12,0-14,4 puntos, frente a 14-20 puntos en modelos de razonamiento y hasta 41 puntos en cadenas de pensamiento estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con precisión FP16, el modelo requiere alrededor de 24 GB de VRAM (12,2 B parámetros × 2 bytes). Con cuantización INT8, se reduce a unos 12 GB; con INT4, a unos 6 GB.
- **GPU recomendadas**: para FP16 es adecuada una A100 (40 GB), RTX 4090 (24 GB) o similar. Para cuantización INT8, una RTX 3090 o RTX 4080 (16 GB) puede funcionar. Con INT4, una RTX 3080 (10 GB) o incluso una GPU con 8 GB podría ser suficiente, aunque la latencia puede aumentar.
- **Si cabe en consumer GPU**: sí, con cuantización de 4 bits es posible ejecutarlo en una RTX 4090 o una RTX 3080, aunque con posibles limitaciones de velocidad.
- **Opciones de despliegue**: se puede usar directamente con la librería Transformers de HuggingFace, o mediante servidores de inferencia como FriendliAI, que ofrece cuantización y optimización de kernels. También se puede convertir a GGUF para usar con llama.cpp o Ollama, aunque no se proporcionan archivos GGUF oficiales.
- **Latencia y throughput**: no disponible en la información proporcionada. La eficiencia en tokens (359 tokens por problema) reduce el tiempo de generación en comparación con modelos de razonamiento que generan miles de tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MGSM (original) | MSVAMP (original) | MGSM (+D) | MSVAMP (+D) | Tokens | Licencia |
|---|---|---|---|---|---|---|---|---|
| DAGGER-12B (Ours) | 12,2 B | 4096 | 78,4 | 78,8 | 64,0 | 66,8 | 359 | gemma |
| Qwen 3-8B (Reasoning) | 8 B | no disponible | 88,0 | 81,1 | 70,5 | 66,9 | 3 128 | Apache 2.0 |
| Gemma 3-12B (CoT) | 12 B | 8192 (no confirmado) | 76,8 | 72,3 | 54,3 | 48,7 | 599 | gemma |

El modelo DAGGER-2B supera a Gemma 3-12B en todos los casos y es comparable a Qwen 3-8B en precisión, pero con una eficiencia de tokens muy superior. La licencia gemma restringe el uso comercial según los términos de Google, mientras que Apache 2.0 es más permisiva.

## Limitaciones y advertencias

- **Idiomas**: el modelo está entrenado principalmente para bengés e inglés. No se ha evaluado su rendimiento en otros idiomas y puede mostrar un comportamiento degradado.
- **Longitud de contexto**: la ventana de 4096 tokens puede ser limitada para problemas muy largos o con múltiples pasos de razonamiento.
- **Alucinación en grafos computacionales**: aunque la salida es estructurada, el modelo puede generar grafos inválidos o con nodos mal conectados si el problema es ambiguo o contiene errores de parsing.
- **Sesgos**: el modelo puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en problemas que involucran contextos culturales o sociales específicos de bengés.
- **Licencia**: la licencia `gemma` impone restricciones de uso comercial según los términos de Google (consulta la página de términos). Esto puede limitar su adopción en entornos empresariales.
- **Riesgo de alucinación en distractor**: aunque el modelo identifica nodos distractores, puede clasificar erróneamente información relevante como distractor o viceversa, lo que afecta la precisión.
- **Dependencia de la estructura JSON**: la salida requiere un intérprete para ejecutarse; si no se valida el JSON, el sistema puede fallar en entornos de producción.
- **No hay información sobre el dataset de entrenamiento**: no se especifican el número de tokens ni la composición exacta, lo que dificulta evaluar la generalización a otros dominios.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dipta007/dagger-12B_SFT_GRPO)
- [Dataset de entrenamiento: dipt007/dagger](https://huggingface.co/datasets/dipta007/dagger)
- [Dataset de distractores: dipt007/DistractMath-Bn](https://huggingface.co/datasets/dipta007/DistractMath-Bn)
- [Paper en arXiv](https://arxiv.org/abs/2601.06853)
- [Página del proyecto](https://dipta007.github.io/DAGGER/)
- [Repositorio GitHub](https://github.com/dipta007/DAGGER)
- [Colección de modelos DAGGER](https://huggingface.co/collections/dipta007/dagger-emnlp-2026-findings)
