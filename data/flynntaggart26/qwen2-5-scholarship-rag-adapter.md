# Flynntaggart26/qwen2.5-scholarship-rag-adapter

## Resumen

El modelo `Flynntaggart26/qwen2.5-scholarship-rag-adapter` es un adaptador LoRA (Low-Rank Adaptation) de ajuste fino eficiente en parámetros (PEFT) construido sobre `Qwen/Qwen2.5-0.5B-Instruct`. No es un modelo completo, sino un módulo de pesos de bajo rango que se carga sobre el modelo base congelado mediante la librería `peft`. Su propósito es actuar como cabeza de generación especializada dentro de canalizaciones de generación aumentada por recuperación (RAG) en el dominio de la ayuda financiera universitaria estadounidense: coste neto de matrícula, becas, métricas institucionales y evaluación del retorno de la inversión (ROI) de la educación superior. El autor figura en la model card como Egehan Şahban, mientras que la cuenta de HuggingFace que lo publica es `Flynntaggart26`.

El problema que aborda es concreto: los modelos generalistas de pequeño tamaño fallan al extraer cifras de divulgaciones institucionales extensas (College Scorecard del Departamento de Educación de EE. UU., datos IPEDS), tienden a alucinar cuando el contexto recuperado es ambiguo y arrastran deriva temporal con datos de distintos cursos académicos. El adaptador se entrena para forzar el anclaje al contexto y mejorar la fidelidad estructural y la extracción de entidades numéricas.

Técnicamente, el modelo base es un transformer causal de aproximadamente 0,5 mil millones de parámetros con 32.768 tokens de contexto (extensible a 128.000 mediante YaRN, según la documentación de la familia Qwen2.5), y el adaptador se entrenó con una longitud de secuencia máxima de 1.024 tokens, rango 16 y alpha 32. La relevancia actual es limitada pero acotada: es un ejemplo práctico de adaptación de dominio barata sobre un modelo diminuto, publicada con licencia MIT y con métricas de evaluación RAG autoinformadas, y con cero descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (Qwen2.5-0.5B-Instruct); el adaptador se inyecta en las proyecciones de atención y MLP |
| Parámetros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parámetros del adaptador: no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (extensible a 128.000 con YaRN); 1.024 tokens de longitud máxima de secuencia durante el entrenamiento del adaptador |
| Tipos de cuantización | Base cuantizado a 4 bits durante el entrenamiento (QLoRA); pesos del adaptador en FP16/BF16. No se publican cuantizaciones GGUF ni GPTQ/AWQ del adaptador |
| Idiomas soportados | Inglés (declarado en la model card: `language: en`) |
| Licencia | MIT |
| Formato de pesos | Pesos de adaptador PEFT/LoRA para cargar con `PeftModel.from_pretrained`; el formato de serialización exacto no se especifica en la información disponible |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador aplica la formulación estándar de LoRA: sobre la matriz de pesos congelada $W_0 \in \mathbb{R}^{d \times k}$ del modelo base se añade el producto de descomposición de bajo rango, de modo que $h = W_0 x + \frac{\alpha}{r} B A x$, con rango $r = 16$ y factor de escala $\alpha = 32$. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, se adaptan tanto los bloques de atención como las capas feed-forward, con dropout de 0,05 y sin entrenamiento de sesgos (`bias: none`). El modelo base permanece congelado y cuantizado a 4 bits (paradigma QLoRA), mientras que los pesos del adaptador se mantienen en FP16/BF16 con precisión mixta.

El entrenamiento se ejecutó con `transformers`, `peft` y `bitsandbytes` durante 3 épocas, con tasa de aprendizaje 2e-4, optimizador `paged_adamw_8bit`, planificador coseno con calentamiento (warmup ratio 0,03), tamaño de lote 4 por dispositivo y 4 pasos de acumulación de gradientes (lote efectivo de 16), longitud máxima de secuencia de 1.024 tokens. Los datos provienen de dos conjuntos publicados por el mismo autor: `Flynntaggart26/us-college-roi-scholarships` (métricas institucionales y de ROI) y `Flynntaggart26/learn-rag-eval-qa` (preguntas y respuestas para evaluación RAG). No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. Tampoco se describe ninguna innovación arquitectónica propia: la contribución es exclusivamente de adaptación de dominio.

## Capacidades

- Generación de texto condicionada a contexto recuperado, con instrucción explícita de responder estrictamente a partir del contexto proporcionado.
- Extracción y comparación de entidades numéricas (coste neto de matrícula, porcentajes de necesidad cubierta, tasas de graduación, ingresos medianos) procedentes de divulgaciones institucionales.
- Respuesta a consultas comparativas entre instituciones (por ejemplo, políticas de ayuda financiera para estudiantes internacionales de MIT frente a Stanford).
- Mayor fidelidad al contexto y menor tasa de alucinación que el modelo base, según las métricas autoinformadas por el autor.
- Soporte de plantilla de chat de Qwen2.5 (`<|im_start|>` / `<|im_end|>` con roles system, user y assistant).
- Ejecución con parámetros de decodificación conservadores recomendados en la model card (temperature 0,1, top_p 0,9, repetition_penalty 1,1).
- No se documenta soporte de tool calling o function calling, ni capacidades de agente multi-paso, ni visión, audio o modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Asistente de ayuda financiera en el portal de una universidad: el adaptador se sitúa como cabeza de generación de un RAG que recupera fragmentos de la College Scorecard y de IPEDS; con temperature baja responde a preguntas de coste neto anclándose a los fragmentos recuperados y reduciendo el riesgo de inventar cifras.
- Comparador de coste neto y ROI entre instituciones: dada una consulta del tipo "compara el retorno a 10 años de la carrera X en las universidades A y B", el modelo extrae las métricas de cada institución del contexto y las presenta de forma estructurada, aprovechando la mejora declarada del 15,5 % en precisión numérica.
- Extracción estructurada de métricas institucionales: uso como extractor de campos (becas medias, porcentaje de estudiantes con ayuda, deuda media al graduarse) en canalizaciones de ingesta de datos, donde la tasa de alucinación del 2,8 % declarada es relevante para validación automática.
- Chatbot de admisiones para estudiantes internacionales: consultas sobre políticas *need-blind* frente a *need-aware* y cobertura de necesidad demostrada, con el contenido institucional inyectado como contexto en lugar de depender del conocimiento paramétrico del modelo.
- Human-in-the-loop para asesores académicos: generar borradores de respuesta con citas al contexto recuperado que un asesor humano revisa antes de enviar, de modo que el coste de un error numérico se mitiga con revisión.
- Guardarraíl anti-alucinación en canalizaciones RAG existentes: sustituir la cabeza de generación de un RAG que use un modelo base por este adaptador para elevar la fidelidad al contexto (94,2 % declarado frente al 78,4 % del base) sin cambiar el resto del sistema.
- Prototipado y evaluación de arquitecturas RAG: al ser un adaptador de 0,5 B, permite iterar sobre recuperadores, estrategias de *chunking* y prompts en hardware de gama baja, usando `learn-rag-eval-qa` como conjunto de evaluación.

## Benchmarks y rendimiento

Los únicos datos disponibles son los autoinformados por el autor en la model card, obtenidos mediante métricas automáticas de evaluación RAG sobre el conjunto `learn-rag-eval-qa`, comparando el modelo base con el modelo base más el adaptador. No se especifica la herramienta de evaluación ni el procedimiento exacto, y no hay verificación independiente.

| Métrica | Qwen2.5-0.5B (base) | Base + adaptador | Delta relativo |
|---|---|---|---|
| Fidelidad al contexto (context faithfulness) | 78,4 % | 94,2 % | +15,8 % |
| Precisión numérica (numeric accuracy) | 81,0 % | 96,5 % | +15,5 % |
| Tasa de alucinación (hallucination rate) | 14,2 % | 2,8 % | -11,4 % |
| Recuperación de contexto (context recall) | 75,1 % | 91,8 % | +16,7 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 ocupa aproximadamente 1 GB de pesos; cuantizado a 8 bits, unos 0,5 GB; a 4 bits, unos 0,3-0,4 GB. El adaptador LoRA añade una fracción mínima (decenas de MB) sobre esas cifras dado su rango 16.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU con suficiente RAM del sistema (menos de 2 GB en FP16).
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrían sentido para servir muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada por el autor; vLLM y TGI soportan adaptadores LoRA sobre un modelo base compartido, lo que permite servir varias tareas con una sola copia del base en memoria. Para `llama.cpp` u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, algo que el autor no documenta ni publica.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia, tokens por segundo ni resultados de pruebas de carga.
- Nota de memoria: la model card menciona `device_map="auto"` y `torch_dtype=torch.float16`, pero no incluye configuración de `bitsandbytes` en el ejemplo de inferencia, por lo que la carga en 4 bits requeriría añadirla manualmente.

## Comparativa con modelos similares

La comparación se establece con el propio modelo base y con alternativas generalistas del mismo orden de magnitud. Los datos de las alternativas provienen de sus model cards públicas; ninguna de ellas está evaluada con las métricas RAG del autor, por lo que la columna de rendimiento en dominio no es comparable directamente.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-scholarship-rag-adapter | Adaptador sobre base de 0,5 B | 32.768 (base); 1.024 en entrenamiento | MIT | Ayuda financiera universitaria y ROI en EE. UU. | Adaptador PEFT; requiere el base |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 (128.000 con YaRN) | Apache-2.0 | Generalista, chat e instrucciones | Pesos completos en safetensors y GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 (128.000 con YaRN) | Apache-2.0 | Generalista, mejor razonamiento y código que el 0,5 B | Pesos completos en safetensors y GGUF |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 | Llama 3.2 Community License (restricciones para uso comercial de gran escala) | Generalista multilingüe | Pesos completos en safetensors y GGUF |

Frente a un modelo generalista del mismo tamaño, la ventaja de este adaptador es la especialización de dominio y el anclaje al contexto; su desventaja es que solo funciona en inglés, depende de un base muy pequeño y carece de evaluaciones independientes, mientras que las alternativas generalistas tienen ecosistema, cuantizaciones y soporte de herramientas mucho más amplios.

## Limitaciones y advertencias

- Modelo base de 0,5 B de parámetros: la capacidad de razonamiento, la cobertura de conocimiento y la robustez ante instrucciones complejas son intrínsecamente limitadas, incluso con el adaptador. El adaptador mejora el anclaje al contexto, no la inteligencia general del modelo.
- Dominio muy restringido: solo ayuda financiera y métricas de educación superior de EE. UU. Fuera de ese dominio el adaptador no aporta y puede degradar el comportamiento del base.
- Solo inglés. No hay soporte declarado para castellano ni para ningún otro idioma.
- Riesgo de alucinación residual: la tasa declarada es del 2,8 %, no cero. Además, se trata de una métrica autoinformada por el autor sobre un conjunto propio, sin verificación independiente ni descripción del método de evaluación. En producción, cualquier cifra numérica generada debería validarse contra la fuente.
- Deriva temporal: los datos de coste neto, becas y resultados económicos cambian cada curso académico; el modelo depende del contexto recuperado, por lo que un índice desactualizado producirá respuestas desactualizadas.
- Ventana de entrenamiento de 1.024 tokens: aunque el base soporta contextos mucho mayores, el adaptador se ajustó con fragmentos de hasta 1.024 tokens, por lo que su comportamiento con contextos recuperados mucho más largos no está caracterizado.
- Longitud máxima de la model card: el documento está truncado ("If you uti...") y no incluye la sección completa de citación, detalles del dataset de entrenamiento ni número de tokens vistos.
- Ausencia de validación de la comunidad: cero descargas y cero "me gusta" en el momento de redactar esta ficha, sin issues ni discusiones públicas que permitan contrastar el comportamiento real.
- Discrepancia de autoría: la model card atribuye el desarrollo a Egehan Şahban, mientras que el repositorio pertenece a la cuenta `Flynntaggart26`, lo que dificulta la trazabilidad y el soporte.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero al ser un adaptador sobre `Qwen/Qwen2.5-0.5B-Instruct` conviene verificar también los términos del modelo base (Apache-2.0) al redistribuir pesos fusionados.
- Sin cuantizaciones publicadas (GGUF, GPTQ, AWQ) ni pesos fusionados: cada despliegue debe realizar la fusión o cargar el adaptador por separado, lo que añade complejidad operativa.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a páginas corporativas de Microsoft), por lo que no hay fuentes externas que corroboren las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Flynntaggart26/qwen2.5-scholarship-rag-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ROI y becas: https://huggingface.co/datasets/Flynntaggart26/us-college-roi-scholarships
- Dataset de evaluación RAG: https://huggingface.co/datasets/Flynntaggart26/learn-rag-eval-qa
- Licencia MIT: https://opensource.org/licenses/MIT
- Resultados de búsqueda web: sin fuentes relevantes sobre el modelo; los enlaces devueltos corresponden a páginas genéricas de Microsoft y no guardan relación con esta ficha.
