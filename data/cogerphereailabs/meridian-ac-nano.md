# COGERPHEREAILABS/meridian-ac-nano

## Resumen
Meridian-AC-Nano es un modelo compacto de 596 millones de parámetros desarrollado por COGERPHERE AI Labs, especializado en corrección de pruebas académicas, corrección de sintaxis LaTeX y refinamiento de tono de escritura científica. Se basa en Qwen/Qwen3-0.6B, al que se ha aplicado un ajuste fino con LoRA de rango 32 sobre las proyecciones q y v. El modelo se enmarca en el programa de investigación MERIDIAN 0.1 y está diseñado para tareas de revisión de textos con edición mínima, preservando el significado original. Su ventana de contexto alcanza 40.960 tokens, lo que permite procesar documentos extensos.

El modelo se distribuye con licencia Apache-2.0, pesa 1,2 GB en formato safetensors y se carga como un Qwen3ForCausalLM estándar con tokenizador Qwen2. Aunque su tamaño es reducido, está optimizado para un nicho concreto: la revisión de manuscritos académicos, la corrección de código LaTeX y la mejora de redacción científica. Su entrenamiento se realizó sobre un corpus de 1.595 ejemplos etiquetados por tareas, con un enfoque en la moderación de ediciones (no sobre-editar). Es relevante para investigadores y desarrolladores que necesitan una herramienta ligera de corrección integrable en flujos de trabajo de escritura académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con atención causal |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (modelo base en float16; no se publican cuantizaciones) |
| Idiomas soportados | no disponible (no se especifican en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3-0.6B, un transformer decoder con normalización RMS, atención multi-cabeza y embeddings rotatorios (RoPE). Sobre esta base se aplicó un ajuste fino con LoRA de rango 32 (alpha 64, dropout 0.05) sobre las proyecciones q_proj y v_proj, manteniendo el resto de pesos congelados. El entrenamiento se realizó con el pipeline de Unsloth sobre una GPU NVIDIA RTX 3050 de 6 GB, durante 3 épocas, con una tasa de aprendizaje de 2e-4 y optimizador paged_adamw_8bit. El dataset de entrenamiento contiene 1.275 ejemplos, distribuidos en nueve categorías: corrección de pruebas (230), LaTeX (413), escritura académica (130), chat (324), código (198), identidad (40), restricción de edición (100), ejemplos negativos duros (60) e instrucciones (100). Las fuentes de datos incluyen curaduría manual, generación sintética, aumentación y plantillas.

## Capacidades
- Corrección gramatical, ortográfica y de puntuación en textos académicos, preservando el significado original.
- Corrección de sintaxis y formato en código fuente LaTeX (validez del 97,53 % en el conjunto de prueba).
- Refinamiento de tono académico y mejora de redacción científica.
- Tareas de edición restringida (no sobre-editar) con salida idéntica al original cuando no se requieren cambios.
- Generación de texto conversacional básico (chat), aunque con calidad limitada por el tamaño del modelo.
- Corrección de código (probablemente fragmentos) con alta exactitud en el conjunto de prueba (100 % en la categoría code).
- Seguimiento de instrucciones simples, con exactitud del 70 % en la categoría correspondiente.
- No incluye capacidades multimodales ni soporte de tool calling explícito (no se menciona en la documentación).

## Casos de uso
- Revisión de manuscritos académicos: el modelo puede corregir gramática, puntuación y estilo en borradores de artículos científicos, manteniendo la estructura argumentativa original. Su ventana de 40.960 tokens permite procesar secciones completas de un paper.
- Corrección de documentos LaTeX: detecta y corrige errores de sintaxis en código fuente LaTeX, como comandos mal formados, llaves sin cerrar o entornos incorrectos, reduciendo el tiempo de depuración en la preparación de tesis o artículos.
- Asistente de escritura para investigadores: integrado en editores de texto o pipelines de prepublicación, sugiere reformulaciones con tono académico y evita ediciones excesivas que alteren el significado.
- Normalización de referencias y citas: aunque no se menciona explícitamente, su entrenamiento en LaTeX podría ayudar a unificar formatos de citas en bibliografías.
- Revisión de resúmenes y abstracts: su capacidad de edición restringida permite pulir textos cortos sin cambiar el contenido esencial, útil para envíos a congresos.
- Preprocesamiento de textos para otros modelos: puede usarse como etapa de limpieza antes de enviar documentos a modelos más grandes de resumen o traducción, mejorando la calidad de entrada.
- Chat de soporte en entornos académicos: aunque su rendimiento conversacional es limitado, puede servir como asistente básico para preguntas frecuentes sobre formato de escritura o uso de LaTeX.

## Benchmarks y rendimiento
Los resultados que se presentan a continuación son declarados por el autor en la model card y no han sido verificados de forma independiente. Se obtuvieron sobre el conjunto de prueba del propio modelo (n=162, seed 42, decodificación greedy).

| Metrica | Valor |
|---|---|
| ROUGE-1 | 0,9308 |
| ROUGE-2 | 0,9138 |
| ROUGE-L | 0,9290 |
| BLEU-4 | 0,8797 |
| Exact match (%) | 74,69 |
| Validez LaTeX (%) | 97,53 |

Resultados por tarea (subset del test):

| Tarea | n | ROUGE-L | BLEU-4 | Exact match (%) |
|---|---|---|---|---|
| academic | 13 | 0,9744 | 0,9231 | 92,31 |
| chat | 33 | 0,7142 | 0,6064 | 6,06 |
| code | 21 | 1,0000 | 1,0000 | 100,00 |
| hard_negative | 6 | 1,0000 | 1,0000 | 100,00 |
| identity | 4 | 0,7667 | 0,5167 | 50,00 |
| instruction | 10 | 0,9553 | 0,8484 | 70,00 |
| latex | 42 | 0,9978 | 0,9762 | 95,24 |
| proofread | 23 | 0,9884 | 0,9543 | 91,30 |
| restraint | 10 | 1,0000 | 1,0000 | 100,00 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- Al ser un modelo de 596 millones de parámetros en float16, el peso ocupa aproximadamente 1,2 GB, por lo que cabe en GPUs de consumo con al menos 4 GB de VRAM.
- La inferencia puede ejecutarse en una NVIDIA RTX 3050 de 6 GB (la misma utilizada para el entrenamiento) con margen para el contexto máximo.
- Para contextos largos (40.960 tokens) se recomienda al menos 8 GB de VRAM, ya que los estados de atención crecen con la longitud.
- Opciones de despliegue: transformers (Python), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y TGI (Text Generation Inference) de Hugging Face.
- Con cuantización a 4 bits (por ejemplo, bitsandbytes) se podría reducir el uso de VRAM a unos 400 MB, permitiendo ejecución en CPU o GPUs muy limitadas.
- La latencia estimada para generación de 128 tokens en una GPU moderna sería de decenas de milisegundos, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares
No se dispone de una comparativa publicada con otros modelos de la misma categoría (corrección de textos académicos). Como referencia, se puede comparar con su modelo base Qwen3-0.6B y con otros SLM como SmolLM2-135M, que también se ajustó en el mismo programa MERIDIAN. Sin embargo, no hay datos de rendimiento de estos modelos en tareas equivalentes. Por tanto, la comparativa se limita a características generales:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Meridian-AC-Nano | 596M | 40.960 | Apache-2.0 | Corrección académica y LaTeX |
| Qwen3-0.6B (base) | 596M | 40.960 | Apache-2.0 | Modelo general de lenguaje |
| SmolLM2-135M | 135M | 2.048 | Apache-2.0 | Modelo general pequeño |

No se dispone de métricas comparativas fiables para estos modelos en tareas de corrección.

## Limitaciones y advertencias
- Modelo de tamaño reducido (0,6B): su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor escala.
- El ajuste se realizó sobre el modelo base Qwen3-0.6B (no sobre la variante Instruct), por lo que el comportamiento conversacional se adquiere exclusivamente del corpus SFT y puede ser inconsistente.
- La exactitud en tareas de chat es baja (6,06 % de exact match), lo que indica que las respuestas conversacionales no son reproducibles de forma determinista y pueden variar en calidad.
- No está entrenado para proporcionar asesoramiento médico, legal o financiero; su uso en estos dominios no es seguro.
- El conocimiento factual es limitado; no debe emplearse como fuente de información enciclopédica.
- El ámbito de aplicación se restringe a textos académicos, LaTeX y corrección de pruebas; su rendimiento en otros dominios no ha sido evaluado.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3-0.6B (también Apache-2.0) no hay restricciones adicionales conocidas.
- Los resultados de evaluación provienen de un conjunto de prueba pequeño (n=162) y no han sido verificados de forma independiente; deben interpretarse con cautela.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/COGERPHEREAILABS/meridian-ac-nano)
- [Repositorio de investigación MERIDIAN 0.1 en GitHub](https://github.com/COGERPHEREAILABS/Meridian-SLM-Driven-Models-Research)
- [README del repositorio de investigación](https://github.com/COGERPHEREAILABS/Meridian-SLM-Driven-Models-Research/blob/main/README.md)
- [Modelo base Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)

Nota: No se encontraron papers académicos ni demos interactivas asociadas a este modelo en la información disponible.
