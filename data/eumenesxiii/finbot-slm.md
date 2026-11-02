# EumenesXIII/finbot-slm

## Resumen

finbot-slm es un adaptador LoRA publicado por EumenesXIII sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. El adaptador se entrena mediante destilación de conocimiento: un LLM profesor de mayor tamaño genera pares pregunta-respuesta y el modelo pequeño (estudiante) aprende a imitarlos, en este caso ejecutando el entrenamiento en CPU. El repositorio es de tipo PEFT y no contiene pesos completos, sino únicamente los tensores del adaptador en formato safetensors.

El dominio de aplicación es acotado y educativo: un asistente que explica conceptos de inteligencia artificial generativa a perfiles ejecutivos, con ejemplos aplicados a banca, retail, AFP, logística, universidades y clínicas. Cubre cinco temas concretos (agentes de IA, ajuste fino, fundamentos de LLM, ingeniería de prompts y RAG) y se distribuye con licencia Apache 2.0, aunque con advertencias explícitas del autor sobre el origen de los datos de entrenamiento.

Su relevancia es metodológica más que de rendimiento: demuestra un flujo completo de destilación de bajo coste (162 pares, LoRA r=16, pérdida de 2,6739 a 0,0025) y una evaluación mediante examen fijo de 12 preguntas calificado por un LLM juez. No es un modelo para producción general, sino una pieza didáctica y un punto de partida reproducible para talleres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM2-360M-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo publica el adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | es (espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360M parámetros. El entrenamiento usa LoRA con r=16, alpha=32 y dropout 0,05 sobre todas las proyecciones de atención y de la MLP. El conjunto de datos consta de 162 pares pregunta-respuesta generados por un LLM profesor, orientados a explicar conceptos de IA generativa a ejecutivos con ejemplos sectoriales. La pérdida de entrenamiento bajó de 2,6739 a 0,0025, lo que indica un ajuste muy estrecho al conjunto de destilación.

La evaluación se realizó con un examen fijo de 12 preguntas, separado del entrenamiento y calificado por un LLM juez con nota de 1 a 10. La nota media pasó de 1,33 en el modelo base a 8,58 tras el ajuste, y la tasa de aprobación (nota ≥ 7) de 0% a 75%. Por temas, los resultados fueron 10,00 en agentes de IA, 10,00 en ajuste fino, 8,67 en fundamentos de LLM, 10,00 en ingeniería de prompts y 5,67 en RAG. No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación o atención; el interés técnico reside en el pipeline de destilación profesor-estudiante ejecutado íntegramente en CPU.

## Capacidades

- Generación de texto conversacional en español con plantilla de chat (`apply_chat_template`).
- Explicación divulgativa de conceptos de IA generativa: agentes de IA, ajuste fino, fundamentos de LLM, ingeniería de prompts y RAG.
- Adaptación de explicaciones a contextos sectoriales (banca, retail, AFP, logística, universidades, clínicas) según los ejemplos vistos en entrenamiento.
- Respuesta a preguntas de formato pregunta-respuesta simple, con estilo próximo al del profesor que generó los datos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al español según la model card, aunque el modelo base es multilingüe.

## Casos de uso

- Formación interna en IA generativa: desplegar el adaptador como asistente de consulta rápida para empleados no técnicos que necesitan definiciones básicas de LLM, RAG o ajuste fino, con respuestas breves y en español.
- Material de taller y docencia: usar el par base + adaptador como ejemplo reproducible de destilación en CPU, comparando salidas antes y después del ajuste sobre el examen fijo de 12 preguntas.
- Prototipado de asistentes verticales: servir de plantilla para crear adaptadores LoRA sobre dominios concretos (por ejemplo, normativa interna de una empresa) con un coste de entrenamiento mínimo.
- Demostraciones de evaluación con LLM juez: ilustrar un flujo de evaluación automática con rúbrica de 1 a 10 y desglose por tema, útil en cursos de evaluación de modelos.
- Generación de borradores de FAQ sectoriales: producir primeras versiones de preguntas frecuentes sobre IA aplicada a banca o retail, que luego un humano revisa y corrige.
- Pruebas de integración de PEFT: validar pipelines que cargan un modelo base más un adaptador con `PeftModel.from_pretrained` en entornos con recursos muy limitados (CPU, sin GPU).
- Experimentos de alineación de estilo: estudiar cómo un adaptador de 162 pares desplaza el estilo de respuesta del modelo base hacia el registro del profesor.

## Benchmarks y rendimiento

Los únicos datos publicados son los del examen fijo de 12 preguntas calificado por un LLM juez, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Antes (base) | Despues (destilado) |
|---|---|---|
| Nota media (1–10) | 1,33 | 8,58 |
| Aprobación (≥ 7) | 0% | 75% |
| Agentes de IA | 1,50 | 10,00 |
| Ajuste fino | 1,00 | 10,00 |
| Fundamentos de LLM | 1,33 | 8,67 |
| Ingeniería de prompts | 1,00 | 10,00 |
| RAG | 1,33 | 5,67 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M ocupa aproximadamente 0,7 GB en fp16 y alrededor de 0,2-0,4 GB en cuantizaciones de 4 bits; el adaptador LoRA añade unos pocos MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU, que es el entorno usado durante el entrenamiento.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx o inferiores), GTX 1060 en adelante y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); el modelo base puede servirse con llama.cpp u Ollama si se fusiona el adaptador y se convierte a GGUF, y con vLLM o TGI tras fusionar los pesos, aunque estos flujos no están documentados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamaño, la generación en CPU de decenas de tokens es viable en segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finbot-slm | 360M (base) + LoRA | no disponible | Destilación educativa en español | Apache 2.0 | HuggingFace (adaptador PEFT) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible en la informacion proporcionada | Modelo base generalista | Apache 2.0 | HuggingFace |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion proporcionada | Modelo base generalista mas pequeno | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B-Instruct | 500M | no disponible en la informacion proporcionada | Modelo generalista multilingue | Apache 2.0 | HuggingFace |

La comparación relevante es frente al propio modelo base: el adaptador mejora de forma marcada la nota en el examen específico de dominio (1,33 a 8,58) a costa de un ajuste muy estrecho a 162 ejemplos, lo que reduce la generalidad frente a SmolLM2-360M-Instruct en tareas fuera de dominio.

## Limitaciones y advertencias

- Modelo educativo de 360M parámetros: tiende a reproducir casi literalmente las respuestas del profesor y puede inventar definiciones fuera de lo visto; el autor documenta un fallo con nota 1 en la pregunta sobre "embeddings".
- El examen de evaluación es pequeño (12 preguntas) y lo califica un LLM, por lo que las notas son indicativas y no una evaluación rigurosa.
- El tema RAG obtiene la peor nota tras el ajuste (5,67), lo que sugiere cobertura insuficiente de ese contenido en los datos.
- Riesgo de alucinación elevado fuera del dominio de los cinco temas entrenados; no debe usarse como fuente de verdad ni para decisiones reales.
- Los datos de entrenamiento provienen de salidas de un modelo de OpenAI; sus términos de uso restringen emplearlas para desarrollar modelos competidores, lo que condiciona el uso comercial aunque la licencia del repositorio sea Apache 2.0.
- El repositorio solo contiene el adaptador (tamaño 0,0 GB), no los pesos completos; es necesario descargar el modelo base por separado.
- Sin descargas ni likes en el momento de la consulta; sin mantenimiento ni versionado documentado más allá de la creación y actualización del 2 de noviembre de 2026.
- No hay datos publicados sobre contexto máximo efectivo, cuantizaciones validadas ni rendimiento en benchmarks estándar.

## Enlaces

- HuggingFace: https://huggingface.co/EumenesXIII/finbot-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
