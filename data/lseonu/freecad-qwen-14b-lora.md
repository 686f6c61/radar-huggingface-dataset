# lseonu/FreeCAD-Qwen-14B-LoRA

## Resumen

FreeCAD-Qwen-14B-LoRA es un ajuste fino mediante LoRA sobre el modelo base unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit, publicado por el usuario lseonu en HuggingFace. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que para usarlo es necesario cargar el modelo base y aplicar el adaptador con PEFT o fusionarlo previamente. El entrenamiento se realizó con la librería Unsloth, según indica la propia model card, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha reside en su naturaleza de experimento comunitario: no hay documentación sobre el dataset de entrenamiento, el número de pasos, el rango del adaptador ni los hiperparámetros utilizados. El nombre del repositorio sugiere un ajuste orientado a la generación de código para FreeCAD (scripts en Python para modelado paramétrico), pero esta finalidad no está confirmada en la model card ni respaldada por evaluaciones publicadas. El modelo hereda la arquitectura y la ventana de contexto del Qwen2.5-Coder-14B-Instruct original.

Se trata, por tanto, de un artefacto con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con documentación mínima. Es adecuado para experimentación y para reproducir el pipeline de ajuste con Unsloth, pero no debería adoptarse en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base; no declarada explícitamente en la model card de este repositorio) |
| Parametros totales | 14B en el modelo base; el repositorio solo contiene el adaptador LoRA (0,3 GB). Número exacto de parámetros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card de este repositorio; el modelo base Qwen2.5-Coder-14B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | el modelo base referenciado está en bnb-4bit; el adaptador se publica en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | en (inglés), según el campo language de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Libreria | transformers |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,3 GB |
| Creado | 2026-09-10 |
| Actualizado | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del adaptador ni los detalles del proceso de entrenamiento. Lo único que se declara es que el modelo se entrenó "2x faster with Unsloth", una librería que optimiza el ajuste fino con LoRA/QLoRA mediante kernels Triton y gestión eficiente de memoria. El modelo base es unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit, una versión cuantizada a 4 bits del Qwen2.5-Coder-14B-Instruct, que a su vez es un transformer decoder-only de 14B parámetros con atención de consultas agrupadas (GQA) y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante escalado YaRN según la documentación del modelo original.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicó RLHF, DPO u otra fase de alineamiento posterior, ni sobre el rango, alpha o módulos objetivo del adaptador LoRA. El nombre del repositorio (FreeCAD-Qwen-14B-LoRA) apunta a un ajuste orientado a FreeCAD, una suite de diseño asistido por ordenador, pero no se aporta ninguna evidencia documental al respecto. Tampoco se especifica si el entrenamiento se realizó sobre el modelo cuantizado a 4 bits (QLoRA) o sobre una copia en mayor precisión.

Una advertencia técnica relevante: fusionar un adaptador LoRA sobre un modelo base cuantizado a 4 bits no es una operación soportada de forma estándar en todos los frameworks. La práctica habitual es fusionar con el modelo base en precisión completa (fp16/bf16) y cuantizar después.

## Capacidades

- Generación de texto y código: hereda las capacidades del Qwen2.5-Coder-14B-Instruct, un modelo especializado en código (generación, completado, corrección y explicación), aunque este repositorio no aporta ninguna validación propia.
- Razonamiento y matemáticas: el modelo base está entrenado para tareas de razonamiento y aritmética; no hay evaluaciones específicas de este adaptador.
- Tool calling / function calling: el modelo base Qwen2.5-Coder-Instruct soporta plantillas de llamada a herramientas; se desconoce si el ajuste LoRA preserva o degrada esta capacidad.
- Uso en agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: la model card declara únicamente inglés (en), pese a que el modelo base original es multilingüe. No hay información sobre degradación de idiomas tras el ajuste.
- Capacidades especiales: no se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Especialización supuesta en FreeCAD: el nombre del repositorio sugiere generación de scripts de modelado paramétrico, pero no hay confirmación ni ejemplos en la model card.

## Casos de uso

- Generación de scripts para FreeCAD: el modelo podría emplearse para producir macros en Python que creen sólidos, bocetos o ensamblajes mediante la API de FreeCAD. Es el caso de uso que sugiere el nombre del repositorio, pero requiere validación empírica porque la model card no documenta el dataset de ajuste.
- Automatización de diseño paramétrico: integrado en un script que traduzca especificaciones en lenguaje natural a operaciones de modelado (extrusión, revolución, restricciones de croquis), reduciendo el trabajo manual repetitivo en flujos CAD.
- Asistente de documentación técnica: consultas sobre la API de FreeCAD o sobre scripts existentes, con generación de explicaciones y comentarios de código, aprovechando la base de modelo especializado en código.
- Generación de código Python genérico: tareas de autocompletado y escritura de funciones fuera del ámbito CAD, dado que el modelo base es un modelo de código de propósito general de 14B parámetros.
- Refactorización y revisión de código: detección de errores, simplificación de funciones y traducción entre lenguajes en pipelines de revisión, siempre con verificación humana.
- Base para nuevos ajustes: el adaptador puede servir como punto de partida para experimentos de ajuste incremental con Unsloth, útil en entornos de investigación con recursos limitados.
- Prototipado rápido en cuadernos Jupyter: carga mediante transformers + PEFT para explorar la calidad del ajuste antes de invertir en infraestructura de despliegue.
- RAG sobre documentación de FreeCAD: combinado con un índice vectorial de la documentación oficial, podría responder preguntas técnicas; requiere pruebas de fidelidad porque no hay evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K, MBPP ni evaluaciones específicas de CAD), y los resultados de la búsqueda web no contienen referencias a este modelo.

## Requisitos de hardware

- Inferencia en 4 bits (bnb-4bit): aproximadamente 9-10 GB de VRAM para los pesos del modelo base, más el coste del adaptador y la caché KV. Cabe en GPU de consumo con 12 GB o más, con contexto reducido.
- Inferencia en fp16/bf16: en torno a 28-30 GB de VRAM solo para los pesos, lo que exige A100 40 GB, H100, L40S o dos GPU de 24 GB con reparto de capas.
- Cuantización GGUF Q4_K_M: aproximadamente 9 GB; Q8_0 alrededor de 15 GB. Para generar GGUF es necesario fusionar el adaptador y convertir el modelo resultante con llama.cpp.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) para configuraciones en 4 bits; A100 40/80 GB o H100 para fp16 y para despliegues con concurrencia alta.
- Cabe en GPU de consumo: sí, en 4 bits y con ventanas de contexto moderadas. En GPU de 8 GB no es viable sin cuantizaciones más agresivas (Q3/Q2) y con pérdida notable de calidad.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM y TGI tras fusionar los pesos, llama.cpp/Ollama tras fusionar y convertir a GGUF, y LM Studio para pruebas de escritorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador; en un 14B a 4 bits sobre una RTX 4090 son esperables decenas de tokens por segundo, pero es una estimación orientativa, no un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| lseonu/FreeCAD-Qwen-14B-LoRA | adaptador sobre base de 14B | no disponible (base: 32.768 nativos) | apache-2.0 | HuggingFace, 0 descargas | no disponible |
| Qwen2.5-Coder-14B-Instruct | 14B | 32.768 nativos, 131.072 con YaRN | apache-2.0 | HuggingFace, ampliamente utilizado | publicados por el autor del modelo base |
| Qwen2.5-Coder-32B-Instruct | 32B | 32.768 nativos, 131.072 con YaRN | apache-2.0 | HuggingFace | publicados por el autor del modelo base |
| deepseek-coder-6.7b-instruct | 6,7B | 16.384 | permisiva para uso comercial (consultar términos) | HuggingFace | publicados por el autor |

La comparación con alternativas es limitada porque este repositorio no publica métricas propias. Frente al modelo base sin ajustar, la única diferencia demostrable es la existencia del adaptador; no hay evidencia de mejora en ninguna tarea concreta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no describirse el dataset de ajuste, no es posible evaluar qué sesgos se han introducido o amplificado respecto al modelo base.
- Riesgo de alucinación: alto y no medido. En tareas de CAD, una API inventada o un parámetro incorrecto puede producir scripts que fallen o, peor, geometría incorrecta que pase desapercibida.
- Limitaciones de contexto e idioma: la model card declara solo inglés. El soporte de castellano no está garantizado y podría haberse degradado tras el ajuste, aunque el modelo base sea multilingüe.
- Restricciones de licencia: el adaptador se publica como apache-2.0, pero conviene verificar la licencia del modelo base y de cualquier dataset de ajuste no declarado antes de un uso comercial.
- Artefacto sin mantenimiento aparente: creado y actualizado el mismo día, con cero descargas y cero likes, sin issues ni documentación adicional.
- Naturaleza del repositorio: solo contiene el adaptador. Cualquier despliegue exige descargar el modelo base por separado, y la fusión sobre una base cuantizada a 4 bits puede no estar soportada directamente.
- Ausencia total de evaluación: no hay benchmarks, ni ejemplos de uso, ni comparaciones. Cualquier decisión de adopción debería basarse en una evaluación propia sobre el caso de uso concreto.
- Riesgo de reproducibilidad: se desconoce la configuración de entrenamiento (rango, alpha, épocas, datos), por lo que el resultado no es reproducible.
- Recomendación para producción: no desplegar sin una batería de pruebas propia, control de versiones del adaptador y validación humana de las salidas técnicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lseonu/FreeCAD-Qwen-14B-LoRA
- Modelo base referenciado: https://huggingface.co/unsloth/Qwen2.5-Coder-14B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Qwen2.5-Coder (modelo original de la familia): https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct

Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre este modelo; las referencias encontradas corresponden a ChatGPT y no guardan relación con el artefacto descrito.
