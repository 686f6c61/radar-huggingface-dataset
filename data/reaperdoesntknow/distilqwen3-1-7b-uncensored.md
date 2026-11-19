# reaperdoesntknow/DistilQwen3-1.7B-uncensored

## Resumen

DistilQwen3-1.7B-uncensored es un ajuste fino por supervisión (SFT) del modelo reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B, a su vez una destilación de conocimiento de un modelo mayor de tipo Mixture-of-Experts (30B-A3B) hacia un transformer denso de aproximadamente 2.030 millones de parámetros. Lo desarrolla el usuario reaperdoesntknow bajo la etiqueta "Convergent Intelligence LLC: Research Division", y se distribuye en Hugging Face con la librería transformers y pesos en safetensors. El objetivo declarado es ofrecer un modelo ligero orientado a entornos edge y compatible con text-generation-inference y endpoints.

La relevancia del modelo reside en su estrategia de compresión: parte de una destilación de un MoE grande y aplica después un ajuste fino conversacional con la etiqueta "uncensored", lo que sugiere un entrenamiento orientado a reducir rechazos y filtros de seguridad respecto al modelo base. El repositorio ocupa 4,1 GB y acumula 2.049 descargas, lo que indica un uso moderado dentro de la comunidad. La model card es prácticamente una plantilla autogenerada sin datos técnicos rellenados, por lo que gran parte de las especificaciones (contexto, idiomas, licencia, datos de entrenamiento) no están documentadas por el autor.

La ficha que sigue se basa exclusivamente en los metadatos del repositorio y en la información disponible en la model card. Cualquier dato no confirmado se marca explícitamente como "no disponible" para no inducir a error en la evaluación del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3; detalles exactos no disponibles) |
| Parametros totales | 2.031.739.904 (aprox. 2,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Descargas | 2.049 |
| Fecha de creacion | 2026-03-25 |
| Ultima actualizacion | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 2,03 mil millones de parámetros, construido sobre la familia Qwen3. La cadena de entrenamiento declarada tiene dos etapas: primero una destilación de conocimiento desde un modelo profesor de tipo MoE de 30B con 3B activos (Qwen3-30B-A3B) hacia un estudiante de 1,7B, y después un ajuste fino supervisado (SFT) mediante la librería TRL sobre ese estudiante, dando lugar a esta variante "uncensored". Los tags del repositorio confirman las etiquetas `distillation`, `knowledge-distillation`, `sft`, `trl`, `edge` y `convergentintel`.

La model card menciona un marco matemático propio denominado "Discrepancy Calculus (DISC)", descrito como un enfoque de teoría de la medida en el que la distribución de salida del profesor se descompone en componentes suaves (absolutamente continuas), de salto y de Cantor, y se define un operador de discrepancia para cuantificar el error estructural local. Sin embargo, no se aportan detalles verificables sobre el conjunto de datos de destilación, el número de tokens utilizados, la composición del corpus, la existencia de RLHF/DPO ni los hiperparámetros de entrenamiento (la sección de hiperparámetros de la model card está sin rellenar). Tampoco se documenta ninguna innovación de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada del ajuste SFT sobre el modelo base.
- Razonamiento y generación de código: capacidades presumibles por su ascendencia Qwen3, aunque no verificadas con benchmarks en la información disponible.
- Ajuste orientado a "uncensored": el entrenamiento busca reducir rechazos y respuestas evasivas, lo que puede aumentar la obediencia a instrucciones explícitas.
- Compatibilidad con text-generation-inference y endpoints, según los tags del repositorio.
- Orientación a despliegue en edge: el tamaño de 2B permite ejecución en hardware modesto.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Asistente conversacional local en edge: con 2,03B de parámetros y pesos en safetensors de 4,1 GB, el modelo puede ejecutarse en portátiles con GPU de consumo moderada para prototipos de chat sin conexión, siempre que se cuantice previamente a formatos de menor precisión.
- Generación de texto creativo sin filtros restrictivos: la variante "uncensored" está pensada para escritura de ficción, guiones o narrativa donde los filtros de seguridad del modelo base resultan limitantes; requiere revisión humana por el riesgo de contenido inapropiado.
- Experimentación académica con destilación: sirve como caso de estudio de una cadena de destilación MoE-30B-A3B a denso-1,7B y posterior SFT, útil para investigar la pérdida de capacidades en la compresión.
- Prototipado rápido de aplicaciones de chat: su integración con transformers y text-generation-inference permite levantar un endpoint de generación de texto en minutos para validar ideas de producto antes de escalar a modelos mayores.
- Evaluación de robustez y seguridad: al ser un modelo explícitamente "uncensored", es útil como muestra en estudios de red-teaming y análisis de sesgos y alucinaciones en modelos pequeños sin alineamiento reforzado.
- Fine-tuning posterior en dominios específicos: al ser un modelo pequeño y con licencia no confirmada, puede servir de base para ajustes adicionales en tareas de nicho (clasificación, extracción, resumen) en entornos con recursos limitados, previa verificación de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo profesor o con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB, aunque no se distribuyen pesos GGUF oficiales y habría que generarlos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 permiten mayor throughput y contextos más largos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16, y en tarjetas de 4-6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado según tags), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se ofrecen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored | 2,03B | No disponible | No disponible | Hugging Face (safetensors) | Variante "uncensored" por SFT |
| Qwen3-1.7B (original) | 1,7B aprox. | No disponible en esta ficha | Apache 2.0 (según la familia Qwen3) | Hugging Face | Modelo base de referencia de la familia |
| Qwen3-30B-A3B (profesor) | 30B totales / 3B activos | No disponible en esta ficha | Apache 2.0 (según la familia Qwen3) | Hugging Face | MoE profesor de la destilación |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B | 2,03B | No disponible | No disponible | Hugging Face | Modelo base directo de esta variante |

La comparativa con alternativas de terceros (por ejemplo, Llama 3.2 1B o Gemma 2 2B) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento ni de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin datos de entrenamiento, evaluación ni uso previsto; no hay información verificable sobre el corpus, los hiperparámetros ni el proceso de alineamiento.
- La etiqueta "uncensored" implica un entrenamiento orientado a reducir rechazos, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en producción orientada al público sin filtros adicionales.
- Riesgo de alucinación elevado por su tamaño reducido (2B) y por la compresión desde un profesor MoE de 30B; la pérdida de capacidades en la destilación no está cuantificada.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano sin evaluación previa.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el límite real.
- Licencia no disponible: no se confirma el uso comercial; es imprescindible contactar con el autor o revisar el repositorio antes de integrarlo en productos.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos para despliegue en hardware de gama baja.
- El marco "Discrepancy Calculus (DISC)" descrito en la model card no incluye validación empírica publicada en la información disponible; debe tratarse como una afirmación del autor sin verificar.
- Sin resultados de benchmarks ni evaluaciones de seguridad, la idoneidad para tareas concretas es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Modelo base: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Perfil del autor (serie DistilQwen3): https://huggingface.co/reaperdoesntknow
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
