# KucLab/kuclab-hertz-0.8

## Resumen

KucLab Hertz 0.8 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por KucLab (kuclab.org) y orientado a asistencia en disciplinas STEM (física, química, biología, matemáticas), programación y terminología científica bilingüe checo-inglés. Se trata de una segunda generación de destilación: en lugar de destilar desde un profesor local de 30B como en Hertz 0.7F, esta versión usa profesores de API frontier (DeepSeek-flash para STEM, Gemini 3.8 Flash para prosa y checo) con una disciplina de respuesta estricta ("answer-first").

Técnicamente es una LoRA de rango 16 y alpha 32 entrenada con QLoRA, fusionada en los pesos del modelo base en bf16 y posteriormente cuantizada. El modelo cuenta con 8.953.803.264 parámetros (~9B) y hereda la arquitectura y licencia Apache 2.0 de Qwen3.5-9B. El contexto declarado en el Modelfile de Ollama es de 32.768 tokens, y el artefacto publicado es un GGUF q4_k_m de aproximadamente 5,3 GB.

Su relevancia actual radica en el nicho que cubre: un asistente compacto de ~9B especializado en STEM y en terminología científica checo-inglés, ejecutable en hardware de consumo mediante llama.cpp u Ollama. Según las mediciones del propio proyecto, alcanza un 88,8% en su subconjunto curado de MMLU-Pro STEM, lo que supone +5,5 puntos porcentuales sobre Hertz 0.7F, con una mejora de +15 puntos en física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explícita (fine-tune de Qwen/Qwen3.5-9B); la model card indica que "Qwen3.5 sigue razonando por arquitectura", lo que implica un modo de razonamiento nativo |
| Parametros totales | 8.953.803.264 (~9B), dato de safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens (`num_ctx` en el Modelfile de Ollama) |
| Tipos de cuantizacion | GGUF q4_k_m; la receta indica fusión a bf16 antes de cuantizar (no se listan otras cuantizaciones publicadas) |
| Idiomas soportados | checo (cs) e inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (q4_k_m, ~5,3 GB); el repositorio declara safetensors (tamaño de repo 5,6 GB) |

## Arquitectura y entrenamiento

Hertz 0.8 no introduce una arquitectura nueva: es un fine-tune del modelo denso Qwen3.5-9B, por lo que conserva su diseño de transformer decoder-only y su capacidad de razonamiento nativo ("thinking"). La adaptación se realizó con QLoRA, con rango 16 y alpha 32, y los adaptadores se fusionaron en los pesos base en bf16 antes de generar la cuantización GGUF q4_k_m distribuida. El contexto configurado en el Modelfile de Ollama es de 32.768 tokens. La información disponible no detalla el número de capas, cabezas de atención ni otras particularidades internas del modelo base.

El entrenamiento se apoya en unos 5.080 registros en total: filas destiladas vía API con formato "answer-first" (incluyendo una línea final canónica `Answer: (X)` en preguntas de opción múltiple), 309 filas de terminología científica CS↔EN con definiciones (solo en el split de entrenamiento), 28 ejemplos de formato y filas de identidad del modelo. Los profesores fueron DeepSeek-flash (matemáticas, física, química y programación; temperatura 0,2-0,3) y Gemini 3.8 Flash (biología, diseño, checo y respuestas cotidianas concisas, con el modo "thinking" desactivado). Se añadió un dominio de brevedad con 400 pares pregunta-respuesta cortos. La validación del dataset reporta 0 filas malformadas y 0 duplicados, y se eliminaron unas 370 respuestas truncadas por límites de tokens y se acotaron plantillas parametrizadas con rangos poco realistas.

## Capacidades

- Generación de texto conversacional en checo e inglés, con respuestas concisas cuando la pregunta lo requiere.
- Razonamiento STEM: matemáticas, física, química y biología, con formato de respuesta directa y línea final canónica en preguntas de opción múltiple.
- Programación: cobertura de tareas de código dentro del conjunto de destilación STEM/programming.
- Terminología científica bilingüe CS↔EN con definiciones (309 filas específicas en el entrenamiento).
- Modo de razonamiento heredado de Qwen3.5; la model card indica que se puede solicitar respuesta instantánea añadiendo `"think": false` en las peticiones a la API.
- Identidad propia: el modelo se identifica como KucLab Hertz 0.8 (kuclab.org), sin nombrar fundador.
- Compatibilidad con endpoints (`endpoints_compatible` entre las etiquetas del repositorio) y uso mediante llama.cpp/Ollama.

Limitaciones funcionales declaradas por el autor: no hay fine-tuning de tool calling (las filas de uso de herramientas se descartaron por presupuesto) y no se menciona ningún tipo de capacidad de visión o audio.

## Casos de uso

- Asistencia a estudiantes de secundaria y universidad en física y química: el modelo responde con formato "answer-first" y una línea final de respuesta, lo que facilita la corrección automática de ejercicios de opción múltiple; su 90,0% en física y 83,3% en química en el conjunto propio lo hace adecuado para resolución guiada.
- Traducción y normalización de terminología científica checo-inglés: con un 87,4% en CS→EN y un 81,6% en EN→CS en el benchmark propio de 206 términos, sirve para mantener glosarios técnicos coherentes en documentación, papers o material docente bilingüe.
- Tutor conversacional en checo para contenidos STEM: al estar entrenado con prosa checa destilada de Gemini 3.8 Flash, puede mantener explicaciones largas en checo con registro adecuado, algo poco habitual en modelos de ~9B centrados en inglés.
- Asistente de programación local para explicar fragmentos de código y razonar sobre algoritmos, ejecutándose en una GPU de consumo mediante Ollama sin enviar código a servicios externos.
- Chatbot de soporte técnico interno en un entorno de investigación: con 32.768 tokens de contexto puede recibir documentación o notas técnicas extensas y responder preguntas sobre ellas en una sola sesión.
- Generación de material de estudio con respuestas breves: el dominio de brevedad de 400 pares permite obtener respuestas de una o dos frases cuando la pregunta es simple, reduciendo coste de tokens en aplicaciones de alto volumen.
- Evaluación comparativa de recetas de destilación: al documentar profesores, número de filas y resultados por disciplina, el modelo sirve como referencia para equipos que investigan destilación con profesores de API sobre modelos de ~9B.
- Despliegue en entornos sin conexión: al distribuirse como GGUF q4_k_m de ~5,3 GB, puede ejecutarse en estaciones de trabajo aisladas con llama.cpp, útil en laboratorios con requisitos de confidencialidad de datos.

## Benchmarks y rendimiento

Los resultados siguientes proceden del arnés de evaluación del propio proyecto (mismos prompts, mismo código de corrección y la misma cuantización Ollama Q4_K_M para todos los modelos). El subconjunto de MMLU-Pro STEM es propio del proyecto y consta de 240 preguntas reservadas, por lo que no es directamente comparable con cifras de MMLU-Pro publicadas por terceros.

MMLU-Pro STEM (240 preguntas reservadas):

| Disciplina | Hertz 0.6 (12B) | Hertz 0.7F (9B) | Hertz 0.8 (9B) |
|---|---|---|---|
| Biología | 91,7% | 83,3% | 86,7% |
| Química | 61,7% | 78,3% | 83,3% |
| Matemáticas | 90,0% | 96,7% | 95,0% |
| Física | 73,3% | 75,0% | 90,0% |
| Total | 79,2% | 83,3% | 88,8% |

Terminología científica checo-inglés (206 términos reservados):

| Dirección | Hertz 0.6 | Hertz 0.7F | Hertz 0.8 |
|---|---|---|---|
| CS→EN | 82,5% | 88,3% | 87,4% |
| EN→CS | 65,0% | 82,5% | 81,6% |
| Total | 73,8% | 85,4% | 84,5% |

Datos adicionales aportados por el autor: solo 10 de 240 respuestas necesitaron una repetición de respaldo (frente a 22 en Hertz 0.7F). El objetivo declarado de 91% en STEM no se ha alcanzado (-2,2 puntos porcentuales). No se han publicado resultados de benchmarks estándar de terceros (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con GGUF q4_k_m: en torno a 6-7 GB para los pesos (~5,3 GB) más caché KV y overhead; con los 32.768 tokens de contexto completos, la caché KV puede añadir varios GB, por lo que conviene dimensionar por encima de 8 GB para uso real con contexto largo. Estimación derivada del tamaño del artefacto, no publicada por el autor.
- VRAM estimada en bf16: aproximadamente 18 GB para pesos (9B × 2 bytes) más activaciones y caché KV. Estimación, no dato publicado.
- GPU recomendadas: para cuantización q4_k_m, tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); para bf16, A100 40/80 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, en formato GGUF q4_k_m en tarjetas de 8 GB o superiores, con la salvedad del contexto completo de 32.768 tokens.
- Opciones de despliegue: llama.cpp y Ollama (soporte explícito, con Modelfile publicado); el repositorio incluye la etiqueta `endpoints_compatible`. No se mencionan otros runners (vLLM, TGI) en la información disponible.
- Latencia y throughput: no disponible.

Nota de uso importante publicada por el autor: un `ollama pull hf.co/...` no aplica el system prompt del modelo; es necesario crear el modelo con `ollama create` a partir del Modelfile.

## Comparativa con modelos similares

La información disponible solo permite comparar con las generaciones anteriores dentro de la misma familia. No se aportan datos de modelos externos comparables.

| Modelo | Parametros | Contexto | MMLU-Pro STEM (subconjunto propio) | Terminologia CS/EN (propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hertz 0.8 | ~9B (8.953.803.264) | 32.768 tokens | 88,8% | 84,5% | Apache 2.0 | GGUF q4_k_m en HuggingFace |
| Hertz 0.7F | 9B | no disponible | 83,3% | 85,4% | no disponible | no disponible en la información proporcionada |
| Hertz 0.6 | 12B | no disponible | 79,2% | 73,8% | no disponible | no disponible en la información proporcionada |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace (Qwen) |

Comparativa con alternativas de otras familias: no disponible.

## Limitaciones y advertencias

- No se ha realizado fine-tuning de tool calling ni de function calling; el propio autor indica que las filas de uso de herramientas se descartaron por presupuesto. No debe asumirse soporte fiable de agentes o llamadas a funciones en producción.
- Riesgo de alucinación inherente a un modelo destilado de ~9B: las respuestas STEM se generan con formato "answer-first", lo que puede producir contestaciones seguras pero incorrectas en dominios fuera de la distribución de entrenamiento o en preguntas de nivel avanzado.
- El conjunto de entrenamiento es pequeño (~5.080 filas), incluidas solo 309 filas de terminología checa y 400 pares de brevedad; la cobertura de dominios y registros es limitada.
- La terminología checa (84,5%) está esencialmente empatada con Hertz 0.7F (85,4%), es decir, -0,9 puntos porcentuales: no hay mejora en esa dimensión respecto a la generación anterior.
- Los benchmarks son internos del proyecto: usan un subconjunto propio de 240 preguntas de MMLU-Pro STEM y un arnés propio, por lo que no son comparables con cifras publicadas de MMLU-Pro por terceros.
- Objetivo no alcanzado: el autor declara un objetivo de 91% en STEM y un resultado de 88,8%.
- Cobertura lingüística limitada a checo e inglés; no se declaran otros idiomas.
- Ventana de contexto declarada de 32.768 tokens en el Modelfile de Ollama; no se documenta el comportamiento del modelo más allá de esa longitud ni la degradación con contexto largo.
- Licencia Apache 2.0, heredada del modelo base, lo que permite uso comercial; conviene verificar igualmente las condiciones de los datos destilados de profesores de API (DeepSeek-flash y Gemini 3.8 Flash), cuya política de uso no se detalla en la model card.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta: no hay validación por parte de la comunidad.
- La model card incluye una tarjeta de benchmarks en imagen (`bench_card_08.png`); los datos numéricos se han tomado de las tablas de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelfile para Ollama: https://huggingface.co/KucLab/kuclab-hertz-0.8/resolve/main/Modelfile
- Sitio del autor: https://kuclab.org

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados eran hilos de un foro en chino sobre gastronomía y no guardan relación con KucLab Hertz 0.8. No se dispone de paper, blog técnico ni demo adicionales.
