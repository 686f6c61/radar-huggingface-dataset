# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-14B-Instruct-heretic1x-code es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-Coder-14B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored" realizada con la metodología Heretic 1.x, cuyo objetivo es eliminar o atenuar los mecanismos de rechazo (refusals) y el alineamiento de seguridad del modelo base, manteniendo en la medida de lo posible sus capacidades originales de generación de texto y código.

El modelo conserva la arquitectura del Qwen2.5-Coder-14B-Instruct original: un transformer decoder-only denso de aproximadamente 14.770 millones de parámetros (dato confirmado en los safetensors del repositorio), orientado a tareas de generación de código, razonamiento técnico y conversación. El repositorio ocupa 29,6 GB e incluye pesos en formato safetensors, y está etiquetado como compatible con text-generation-inference y endpoints.

Es relevante ahora porque representa un ejemplo de la familia de modelos "uncensored" derivados de modelos de código de referencia, un fenómeno creciente en la comunidad open source. Sin embargo, su acceso está restringido (gated), requiere aceptar condiciones en Hugging Face, y su licencia declarada en las etiquetas es Apache 2.0 (heredada del modelo base), aunque el autor incluye también la etiqueta openrail++ y advertencias de uso exclusivamente para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-Coder-14B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (segun la etiqueta `en`) |
| Licencia | Apache 2.0 (etiqueta `license:apache-2.0`); tambien aparece `openrail++` en los tags |
| Formato de pesos | safetensors |
| Tamano del repositorio | 29,6 GB |
| Modelo base | Qwen/Qwen2.5-Coder-14B-Instruct |
| Libreria | transformers |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, con atención causal estándar y aproximadamente 14,77 mil millones de parámetros. El modelo base fue entrenado por Alibaba Qwen para tareas de código y conversación, e incluye instrucciones y alineamiento mediante técnicas de post-entrenamiento (SFT y preferencias, según la documentación pública de Qwen2.5). No se dispone de detalles específicos sobre la composición del dataset ni el número de tokens de entrenamiento del modelo base en la información proporcionada.

Sobre esa base, richardyoung aplica la metodología Heretic 1.x, un procedimiento de "abliteration" que busca eliminar la dirección de rechazo en el espacio de activaciones del modelo, reduciendo la probabilidad de respuestas de negativa ante peticiones que el modelo original rechazaría. La información disponible no detalla el número de pasos de entrenamiento, el dataset utilizado para el procedimiento, ni si se aplicó DPO u otra técnica de preferencias específica; tampoco se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.). Las etiquetas indican que el resultado es un modelo conversacional orientado a investigación (`research`, `decensored`, `abliterated`).

## Capacidades

- Generación de texto y código: hereda del Qwen2.5-Coder-14B-Instruct la capacidad de completar, explicar y refactorizar código en múltiples lenguajes de programación.
- Razonamiento técnico y matemáticas: el modelo base está optimizado para tareas de razonamiento de código y resolución de problemas algorítmicos.
- Conversación multi-turno: etiquetado como `conversational`, admite diálogos con historial.
- Reducción de rechazos: el procedimiento Heretic 1.x busca que el modelo responda a peticiones que el base rechazaría, incluyendo contenido sensible o potencialmente dañino.
- Tool calling / function calling: no confirmado explícitamente para este fine-tune en la información proporcionada (el base Qwen2.5-Coder-Instruct sí lo soporta, pero no se documenta aquí).
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este fine-tune.
- Multilingüismo: limitado a inglés según la etiqueta de idioma; el base Qwen2.5 soporta más idiomas, pero no se garantiza en este ajuste.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteración sobre las capacidades y los sesgos de un modelo de código, comparándolo con el base original en tareas controladas.
- Generación de código en entornos de investigación: uso en notebooks y pipelines experimentales para autocompletar y refactorizar código, aprovechando las capacidades heredadas del Qwen2.5-Coder-14B-Instruct.
- Red teaming y evaluación de robustez: sirve como sujeto de prueba para medir la eficacia de filtros de seguridad externos y clasificadores de contenido en producción.
- Análisis de contenido sensible en investigación lingüística: estudio de cómo el modelo responde a peticiones que el base rechazaría, con fines académicos y bajo supervisión.
- Experimentos de destilación y ajuste: como punto de partida para fine-tunes posteriores que requieran un modelo sin rechazos previos, por ejemplo en investigación sobre control de comportamiento.
- Docencia y demostraciones: ilustrar en cursos de IA las diferencias entre modelos alineados y abliterated, con ejemplos de código y conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad para este fine-tune, ni comparaciones directas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp16/bf16) se requieren aproximadamente 29,6 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 15-16 GB; en 4 bits, alrededor de 8-9 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en 8 bits o 4 bits.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 8 o 4 bits en GPUs con 16-24 GB de VRAM (RTX 4080/4090, RTX 3090); en fp16 no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles; no se confirman variantes GGUF para llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code | ~14,77 B | No disponible | Apache 2.0 | Restringido (gated) | Fine-tune abliterated del Qwen2.5-Coder-14B-Instruct |
| Qwen/Qwen2.5-Coder-14B-Instruct | ~14,77 B | 32.768 tokens (documentado por Qwen) | Apache 2.0 | Abierto | Modelo base alineado, sin abliteración |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 tokens (documentado por Qwen) | Apache 2.0 | Abierto | Alternativa de menor tamaño de la misma familia |
| Modelos abliterated de la comunidad (p. ej. variantes Heretic de otros modelos) | Variable | Variable | Variable | Variable | No se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Alineamiento de seguridad reducido: el propósito del procedimiento Heretic 1.x es eliminar los rechazos, por lo que el modelo puede generar contenido dañino, ilegal o sesgado que el base rechazaría. No debe desplegarse en producción orientada a usuarios sin filtros externos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar APIs, funciones o hechos; el riesgo aumenta en dominios fuera de su entrenamiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del base multilingüe.
- Contexto: no se confirma la longitud de contexto efectiva de este fine-tune; asumir la del base (32.768 tokens) sin verificación es arriesgado.
- Licencia: aunque se declara Apache 2.0, la convivencia con la etiqueta `openrail++` y las advertencias de uso para investigación generan ambigüedad legal; conviene revisar las condiciones del acceso gated antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el despliegue automatizado.
- Sesgos: hereda los sesgos del modelo base y del corpus de código; la abliteración puede amplificar respuestas estereotipadas o tóxicas.
- Sin garantías de soporte: es un fine-tune de un autor individual, con 757 descargas y 0 likes en el momento de la consulta; no hay documentación de mantenimiento ni de evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio oficial de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Paper de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Metodología Heretic (referencia general): no disponible en la información proporcionada
