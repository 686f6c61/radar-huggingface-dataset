# SinisterLlama/anlp-a1-c4

## Resumen

El modelo `SinisterLlama/anlp-a1-c4` es un transformer seq2seq encoder-decoder de pequeño tamaño (11,18 millones de parámetros) desarrollado por Eshaan Sharma como parte de la asignatura ANLP Assignment 1 en el IIIT Hyderabad. Su propósito es la decodificación de secuencias binarias cifradas para obtener texto plano, es decir, una tarea de descifrado de criptogramas a nivel de bits. El modelo implementa una arquitectura personalizada construida con operaciones básicas de PyTorch, sin usar módulos predefinidos como `nn.Transformer` o `nn.MultiheadAttention`, lo que lo convierte en un ejemplo didáctico de implementación manual de mecanismos de atención y normalización.

La relevancia de este modelo radica en su carácter educativo: demuestra cómo construir un transformer funcional desde cero, incorporando técnicas modernas como Grouped Query Attention (GQA), Rotary Positional Embeddings (RoPE) y RMSNorm. Aunque su tamaño es reducido y su dominio específico (descifrado de secuencias binarias), los resultados reportados en la model card muestran una alta precisión a nivel de bits (93,58%) y una excelente similitud de texto (BLEU 98,77). No se especifica la longitud de contexto ni el formato de los pesos, pero al ser un modelo de tipo `transformers` con licencia MIT, puede integrarse fácilmente en entornos de investigación y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Decoder Seq2Seq Transformer con GQA, RoPE y RMSNorm |
| Parametros totales | 11,18 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, aunque la tarea trabaja con secuencias binarias) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería transformers, probablemente PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder típica de seq2seq, pero con tres innovaciones clave implementadas manualmente: Grouped Query Attention (GQA) con 8 cabezas de consulta y 2 grupos de claves/valores, que reduce el coste computacional frente a la atención multi-cabeza estándar; Rotary Positional Embeddings (RoPE), que codifica la posición relativa de los tokens mediante rotaciones en el espacio de alta dimensión; y RMSNorm, una variante de normalización que usa la raíz cuadrada de la media de los cuadrados en lugar de la media y varianza completas. La construcción se realizó con operaciones básicas de PyTorch, evitando módulos de alto nivel, lo que garantiza un control total sobre el flujo de datos.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La tarea específica consiste en mapear secuencias binarias cifradas a texto plano, lo que sugiere un entrenamiento supervisado con pares entrada-salida. Al ser un proyecto académico, es probable que el entrenamiento se haya realizado en un entorno de laboratorio con recursos limitados, pero no se dispone de información adicional al respecto.

## Capacidades

- Descifrado de secuencias binarias cifradas: el modelo recibe una secuencia de bits como entrada y genera el texto plano correspondiente, con una precisión a nivel de bit del 93,58% y una precisión de secuencia completa del 68,02%.
- Generación de texto plano a partir de representaciones cifradas, lo que implica capacidades de modelado de lenguaje y traducción a nivel de token.
- Implementación de mecanismos de atención moderna (GQA, RoPE) que permiten un razonamiento posicional y una eficiencia computacional adecuada para secuencias cortas.
- Soporte para inferencia con la librería `transformers`, lo que facilita su integración en pipelines de PyTorch.
- No dispone de soporte para tool calling, agentes, visión, audio ni modos de razonamiento extendido; su dominio se limita a la tarea de descifrado.
- Multilingüismo restringido: aunque la etiqueta indica inglés, el modelo opera sobre representaciones binarias, por lo que no tiene capacidades lingüísticas generales.

## Casos de uso

- Educación en arquitecturas transformer: el modelo sirve como ejemplo práctico para estudiantes que quieran entender cómo implementar GQA, RoPE y RMSNorm desde cero, ya que el código está disponible en el repositorio de GitHub.
- Experimentación con descifrado de criptogramas: investigadores en seguridad o procesamiento de lenguaje natural pueden utilizarlo como base para probar métodos de ataque o validación de algoritmos de cifrado simples.
- Benchmark de modelos seq2seq pequeños: al tener solo 11,18 millones de parámetros, puede usarse como referencia para comparar el rendimiento de arquitecturas más grandes en tareas de decodificación de secuencias.
- Prototipado de sistemas de desencriptación en entornos académicos: dado su tamaño reducido, puede ejecutarse en CPU, lo que permite pruebas rápidas en aulas o laboratorios sin GPU.
- Análisis de la influencia de GQA y RoPE en tareas de secuencia a secuencia: comparando este modelo con variantes que usen atención estándar, se puede estudiar el impacto de estas técnicas.
- Generación de texto condicionado a partir de entradas binarias: aunque limitado, podría adaptarse para tareas de codificación/decodificación de datos en aplicaciones de investigación.

## Benchmarks y rendimiento

Los resultados de evaluación reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Bit-Level Accuracy | 93,58% |
| Sequence Accuracy | 68,02% |
| BLEU Score | 98,77% |
| ROUGE-1 | 99,35% |
| ROUGE-2 | 98,15% |
| ROUGE-L | 99,35% |
| Average Levenshtein Distance | 0,41 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores indican que el modelo es muy preciso a nivel de token, aunque la precisión de secuencia completa es moderada, lo que sugiere que algunos ejemplos largos pueden contener errores menores.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamaño de 11,18 millones de parámetros en precisión FP32 (aproximadamente 45 MB en memoria).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 o superior). También es viable ejecutarlo en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier tarjeta gráfica moderna, incluidas las gamas bajas.
- Opciones de despliegue: al ser un modelo de la librería `transformers`, se puede cargar con `AutoModelForSeq2SeqLM` y ejecutar en PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos. Dado su tamaño, se espera una latencia de milisegundos por ejemplo en GPU y de unos pocos cientos de milisegundos en CPU, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

Existen otros repositorios con la misma tarea y configuración (por ejemplo, `shauryakochar/anlp-a1-c4` y `neemon/anlp-a1-c4`), pero no se dispone de sus especificaciones ni resultados en la información proporcionada. Por tanto, no es posible realizar una comparación cuantitativa. En términos generales, este modelo se sitúa en la categoría de transformers pequeños de propósito específico, sin competidores comerciales directos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| SinisterLlama/anlp-a1-c4 | 11,18M | no disponible | Bit acc. 93,58% | MIT |
| shauryakochar/anlp-a1-c4 | no disponible | no disponible | no disponible | no disponible |
| neemon/anlp-a1-c4 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo académico diseñado para una tarea muy específica (descifrado de secuencias binarias), no es adecuado para tareas generales de lenguaje natural.
- La precisión de secuencia completa es del 68%, lo que implica que uno de cada tres ejemplos puede contener errores; no es fiable para producción.
- No se han documentado sesgos, pero al entrenarse con un conjunto de datos limitado, puede tener un comportamiento errático con entradas fuera de la distribución.
- Riesgo de alucinación: al ser un modelo generativo, puede producir salidas incorrectas sin señales de error evidentes.
- No hay información sobre el contexto máximo, por lo que secuencias largas pueden fallar o degradarse.
- Licencia MIT permite uso comercial, pero el modelo no tiene garantías de rendimiento ni soporte oficial.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar su generalización.

## Enlaces

- HuggingFace: [https://huggingface.co/SinisterLlama/anlp-a1-c4](https://huggingface.co/SinisterLlama/anlp-a1-c4)
- GitHub: [https://github.com/SinisterLlamma/ANLP-Assignment1](https://github.com/SinisterLlamma/ANLP-Assignment1)
- Repositorios de la misma asignatura: [https://huggingface.co/shauryakochar/anlp-a1-c4](https://huggingface.co/shauryakochar/anlp-a1-c4) y [https://huggingface.co/neemon/anlp-a1-c4](https://huggingface.co/neemon/anlp-a1-c4)
