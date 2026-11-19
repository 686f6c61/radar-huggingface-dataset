# shotaro-gond0/qwen3.5-0.8b-rag-sft004

## Resumen

`qwen3.5-0.8b-rag-sft004` es un ajuste fino supervisado (SFT) mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario shotaro-gond0 como proyecto final del curso "LLM講座2 2026". El objetivo concreto es la generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: el modelo recibe una pregunta junto con los diez fragmentos recuperados por un pipeline externo y debe devolver un JSON con la respuesta corta y el `chunk_id` del fragmento que la respalda.

El modelo conserva exactamente la arquitectura, los ficheros de configuración y la forma de los pesos del modelo base, ya que el adaptador LoRA se fusionó tras el entrenamiento. Con 873.438.784 parámetros (aproximadamente 0,87 mil millones) y un repositorio de 1,8 GB, está pensado para ejecutarse en hardware modesto, incluida una GPU de Colab (L4) durante el entrenamiento. Su licencia Apache-2.0 facilita la reutilización comercial, aunque las capacidades reales están acotadas al dominio y la tarea para los que fue entrenado.

Es relevante como ejemplo de especialización de un modelo pequeño en una tarea de recuperación y atribución de fuentes en japonés, un caso de uso habitual en sistemas de preguntas y respuestas documentales. No obstante, se trata de un artefacto académico con muy poca adopción (3 descargas, 0 likes) y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), idéntica al modelo base; ajuste LoRA fusionado |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y aplica sobre él un ajuste supervisado con LoRA de rango 16 y alpha 32, con dropout 0,05, sobre las proyecciones q/k/v/o y gate/up/down. El entrenamiento usó una tasa de aprendizaje de 1e-4 con schedule coseno y 5 % de warmup, acumulación de gradiente de 8, una época en fp16 y se ejecutó en una GPU L4 de Google Colab. Tras el entrenamiento, el adaptador se fusionó en los pesos base, de modo que la estructura y los nombres, formas y tipos de los tensores coinciden con el modelo original (verificado en el guardado).

La pérdida se calculó únicamente sobre la salida JSON (`{"answer":..., "chunk_id":...}`) y la posición del token de fin, no sobre el prompt. El conjunto de entrenamiento consta de 1.544 ejemplos (JEMHopQA: 129; JSQuAD de JGLUE: 1.415, extraídos con semilla fija de 4.000 candidatos), con 50 ejemplos reservados para validación y semilla 42. Se aplicó un sobremuestreo: las filas de JEMHopQA se repitieron 3 veces y las filas cuyo fragmento correcto aparecía en segunda posición o inferior en el ranking de recuperación se repitieron 4 veces (prevaleciendo el factor mayor cuando coincidían ambas condiciones). Cada entrada combina la pregunta con los diez fragmentos recuperados por un pipeline híbrido (BM25 + Ruri v3 + BGE-M3 con fusión RRF, reranking con Ruri v3 y expansión mediante títulos de artículos enlazados). No se empleó RLHF ni DPO.

## Capacidades

- Generación de respuestas cortas y extractivas a preguntas en japonés, condicionadas a un contexto documental recuperado.
- Atribución de la respuesta a un fragmento concreto mediante la devolución del `chunk_id` correspondiente, en formato JSON estructurado.
- Seguimiento de instrucciones de formato estricto: la salida esperada es un objeto JSON con las claves `answer` y `chunk_id`.
- Razonamiento multi-salto limitado, derivado del entrenamiento con JEMHopQA (preguntas que requieren combinar información de varias entidades).
- Comprensión de contexto largo en la práctica: el prompt incluye hasta diez fragmentos de Wikipedia además de la pregunta.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe no disponible: el autor declara únicamente japonés.

## Casos de uso

- Sistema de preguntas y respuestas sobre Wikipedia en japonés: el modelo encaja directamente como generador en un pipeline RAG que recupere fragmentos y espere una respuesta con cita del fragmento, tal como se entrenó.
- Atención al cliente sobre base documental en japonés: puede integrarse tras un recuperador para responder consultas frecuentes devolviendo la fuente consultada, lo que facilita la verificación por parte del operador.
- Asistentes internos de consulta de manuales o políticas: al devolver el `chunk_id`, permite enlazar la respuesta al documento original y auditar la trazabilidad.
- Extracción de respuestas con atribución en pipelines de evaluación: útil como componente generador en experimentos de RAG donde se mida la precisión de la cita además de la respuesta.
- Prototipado en hardware limitado: con menos de mil millones de parámetros cabe en GPUs de consumo y en entornos de desarrollo con recursos escasos, lo que permite iterar sobre el pipeline de recuperación sin grandes costes.
- Investigación académica sobre ajuste fino de modelos pequeños: sirve como referencia reproducible de SFT con LoRA sobre datos japoneses y de la influencia del sobremuestreo de ejemplos difíciles.
- Filtrado y verificación de respuestas en sistemas de búsqueda documental: el modelo puede señalar el fragmento que respalda una afirmación, ayudando a descartar respuestas sin soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parámetros, en fp16 serían aproximadamente 1,7 GB de pesos, y en cuantizaciones de 8 o 4 bits alrededor de 0,9 GB y 0,5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el autor entrenó en una NVIDIA L4 de Google Colab; para inferencia cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM en fp16, aunque no se han publicado mediciones.
- Opciones de despliegue: no se documentan; al ser un transformer estándar con pesos safetensors, sería compatible en principio con frameworks de inferencia habituales, pero no hay confirmación del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-rag-sft004 | 873 M | no disponible | SFT LoRA para RAG en japonés | Apache-2.0 | Hugging Face (3 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| Alternativas especializadas en RAG japonés de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de nicho y adopción mínima: 3 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Entrenado exclusivamente para una tarea concreta (RAG extractivo sobre Wikipedia japonesa); su comportamiento fuera de ese formato de prompt y salida es incierto.
- Idiomas: solo japonés declarado; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque el entrenamiento fuerza la cita del fragmento, no hay evidencia publicada de que el modelo se abstenga cuando la respuesta no está en el contexto.
- Sesgos: no documentados por el autor; al derivar de Wikipedia en japonés y de JGLUE/JEMHopQA, puede heredar sesgos de esas fuentes.
- Datos de entrenamiento con licencia CC BY-SA 4.0 (JSQuAD, JEMHopQA y los fragmentos de Wikipedia): aunque los pesos se publican como Apache-2.0, conviene revisar las obligaciones de atribución y compartir-igual derivadas de los datos.
- Sin benchmarks, sin ficha de evaluación y sin documentación de contexto máximo ni de cuantizaciones probadas.
- Proyecto académico: no hay garantía de mantenimiento, soporte ni correcciones futuras.
- La versión recomendada por el autor está fijada a la revisión `8a3788d40e9816593a4fda707f368bee8a3a3a34`; usar otra revisión puede cambiar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shotaro-gond0/qwen3.5-0.8b-rag-sft004
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE (JSQuAD), CC BY-SA 4.0: https://github.com/yahoojapan/JGLUE
- JEMHopQA, CC BY-SA 4.0: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Repositorio del autor con `DATA_PROVENANCE.md` y `rag_submit.ipynb`: no disponible como enlace directo en la información proporcionada
