# chivier/ryze-biovision-qwen3.8-27b-thinking-sft-v1

## Resumen

Ryze BioVision Thinking SFT v1 es un adaptador LoRA de rango 32 sobre el modelo de visión-lenguaje Qwen3.8-27B, desarrollado por el usuario chivier. Su propósito es muy concreto: leer figuras científicas y responder preguntas de opción múltiple (cuatro opciones) sobre colores, posiciones, comparaciones y tendencias presentes en dichas figuras. Con el modo de razonamiento activado genera una breve explicación en inglés seguida de la elección; con el razonamiento desactivado responde directamente con una única letra.

El modelo no es un checkpoint completo, sino un adaptador PEFT que debe cargarse sobre el backbone Qwen original en una revisión concreta. El repositorio contiene únicamente los pesos LoRA evaluados en FP32 (934 MB) junto con el procesador asociado, lo que lo hace ligero de distribuir pero dependiente del modelo base de 27B para funcionar.

Su relevancia es acotada y experimental: aborda el problema del truncamiento y las respuestas malformadas en tareas de razonamiento visual sobre figuras científicas, un caso de uso frecuente en evaluación de literatura biomédica. La licencia Apache 2.0 y el formato de adaptador facilitan su reutilización, aunque el rendimiento fuera del conjunto de desarrollo es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 64) sobre transformer multimodal Qwen3.8-27B (image-text-to-text) |
| Parametros totales | No disponible (adaptador de 934 MB en FP32; backbone de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en FP32; backbone en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el backbone Qwen3.8-27B, un modelo de visión-lenguaje que procesa imágenes y texto. Durante el entrenamiento se congelaron tanto el codificador visual como el backbone, y solo se entrenó la actualización LoRA de rango 32 con alpha 64, durante una época de entrenamiento supervisado con una tasa de aprendizaje de 1e-5. El adaptador contiene la actualización completa aprendida respecto a los pesos originales de Qwen.

El conjunto de entrenamiento consta de 207 preguntas, cada una aportando un ejemplo con una breve explicación de la figura en inglés y otro ejemplo de respuesta directa. De esas preguntas, 92 fueron generadas con GPT-6.2 Sol y cribadas mediante revisión de evidencia basada en imagen y una respuesta ciega independiente; las otras 115 provienen de dos pilotos de anotación. Las familias de artículos de entrenamiento y evaluación son disjuntas. El entrenamiento continuó desde el adaptador Ryze BioVision v6.2 step-300. La innovación principal es el modo thinking con formato controlado: la explicación debe cerrarse con un único token `` y la respuesta final debe ser exactamente una letra A, B, C o D, lo que permite validar mecánicamente la salida.

## Capacidades

- Respuesta a preguntas visuales de opción múltiple sobre figuras científicas (colores, posiciones, comparaciones, tendencias).
- Modo thinking: genera una explicación breve en inglés seguida de la elección final entre A, B, C y D.
- Modo directo: responde únicamente con la letra elegida, sin explicación.
- Procesamiento de imagen y texto conjuntamente (image-text-to-text) mediante el procesador incluido.
- Salida estructurada y validable: el token de cierre `` y la letra final permiten comprobaciones automáticas de formato.
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de tool calling, agentes, audio ni otras modalidades.

## Casos de uso

- Extracción de respuestas en revisión de literatura biomédica: dado un panel de una figura y una pregunta de opción múltiple, el adaptador devuelve una letra validable, lo que permite automatizar la extracción de datos de figuras en corpus de artículos.
- Control de calidad de figuras en pipelines editoriales: comprobar de forma automática que la leyenda, los colores y las tendencias descritas en un manuscrito coinciden con lo representado en la figura.
- Evaluación comparativa de checkpoints: el formato de salida estricto (token de cierre único y letra final) facilita medir precisión y tasa de truncamiento de forma reproducible entre versiones del adaptador.
- Anotación asistida de conjuntos de datos científicos: usar el modo thinking para generar explicaciones breves que sirvan como borrador de anotación, revisadas posteriormente por un humano.
- Filtrado de figuras en repositorios de preprints: clasificar figuras según preguntas binarias o de cuatro opciones (por ejemplo, qué color representa la serie control) para indexar contenido visual.
- Docencia y verificación de lectura de gráficas: generar preguntas y respuestas sobre figuras para materiales de formación, aprovechando el modo directo para respuestas rápidas y el modo thinking para explicaciones.
- Integración en pipelines de evaluación de modelos visuales: como adaptador ligero sobre un backbone ya desplegado, permite añadir la tarea de figuras científicas sin servir un modelo adicional completo.

## Benchmarks y rendimiento

Resultados de desarrollo sobre 130 preguntas de 105 familias de artículos, con imágenes redimensionadas al 35 % de su ancho y alto originales, decodificación greedy limitada a 256 tokens nuevos y contando como incorrectas las respuestas inválidas o truncadas.

| Checkpoint | Thinking on | Thinking off | Truncadas con thinking on |
|---|---:|---:|---:|
| Adaptador original Ryze step-300 | 90/130 | 119/130 | 27 |
| Esta release SFT | 119/130 | 116/130 | 0 |
| Adaptador experimental RLOO posterior | 118/130 | 115/130 | 0 |

El SFT con thinking corrigió 29 respuestas y no empeoró ninguna en modo thinking; de esas 29 mejoras, 27 recuperaron respuestas previamente truncadas o malformadas. La longitud media generada bajó de 162,3 a 48,6 tokens. La precisión en modo directo cayó en tres preguntas. Estas cifras miden la concordancia con referencias sintéticas en el conjunto de desarrollo usado para comparar checkpoints; el rendimiento en un conjunto de test independiente es desconocido.

## Requisitos de hardware

- El adaptador en sí ocupa 934 MB en FP32; el requisito real lo impone el backbone Qwen3.8-27B en BF16.
- La evaluación del autor se realizó con Transformers 5.14.1, PEFT y una GPU de 96 GB.
- Para inferencia en BF16 se necesita aproximadamente el peso del backbone de 27B más memoria para activaciones y visión; una GPU de 80 GB (A100/H100) es el entorno natural, y 96 GB da margen holgado.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en BF16; requeriría cuantización del backbone, no documentada por el autor.
- Opciones de despliegue: Transformers + PEFT (procedimiento documentado); vLLM, TGI, llama.cpp u Ollama no están documentados para este adaptador.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ryze BioVision Thinking SFT v1 | Adaptador LoRA sobre 27B | No disponible | VQA de figuras científicas, opción múltiple | Apache 2.0 | Hugging Face (adaptador) |
| Ryze BioVision v6.2 | Adaptador LoRA sobre 27B | No disponible | VQA de figuras científicas, respuesta directa | No disponible en la información | Hugging Face (completo FP32) |
| Qwen3.8-27B (base) | 27B | No disponible | Modelo multimodal general | No disponible en la información | Hugging Face |
| Adaptador experimental RLOO | Adaptador LoRA sobre 27B | No disponible | VQA de figuras científicas | No disponible en la información | No disponible |

## Limitaciones y advertencias

- El rendimiento en un conjunto de test independiente es desconocido; las cifras publicadas corresponden al conjunto de desarrollo usado para comparar checkpoints.
- Una explicación fluida puede aun así malinterpretar una leyenda, una tendencia o un eje; el formato correcto no garantiza la corrección semántica.
- Solo soporta inglés.
- La tarea está restringida a preguntas de cuatro opciones sobre figuras científicas; no es un modelo generalista.
- Depende de una revisión concreta del backbone Qwen (`37561816e66b5b9153b1b64c10968c18c1e6f4a0`); usar otra revisión puede invalidar el adaptador.
- El modo thinking exige validar que aparece exactamente un token `` y que la respuesta final es una única letra; de lo contrario debe tratarse como error.
- El adaptador se distribuye en FP32 y el backbone en BF16; no hay guía de cuantización para reducir requisitos de memoria.
- Riesgo de sesgos y alucinación inherente al backbone no evaluado en la información disponible; no se documentan análisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/chivier/ryze-biovision-qwen3.8-27b-thinking-sft-v1
- Modelo base Qwen3.8-27B (revisión fijada): https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Modelo completo Ryze BioVision v6.2: https://huggingface.co/chivier/ryze-biovision-qwen3.8-27b-v6.2-fp32
