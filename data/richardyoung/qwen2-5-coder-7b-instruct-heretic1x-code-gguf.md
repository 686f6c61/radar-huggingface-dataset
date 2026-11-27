# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF

## Resumen

El modelo `richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF` es una cuantizacion en formato GGUF de una variante "abliterated" (tambien etiquetada como "heretic") del modelo Qwen2.5-Coder-7B-Instruct de Alibaba. El autor, richardyoung, parte de su propio checkpoint intermedio (`richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code`) y lo publica en cuantizaciones listas para `llama.cpp` y Ollama, orientadas a inferencia local y a investigacion sobre alineacion y rechazo de contenido.

La propuesta del modelo es la de un asistente de codigo de 7.6 mil millones de parametros con el comportamiento de rechazo atenuado ("abliterated"), lo que lo hace util para estudiar mecanismos de refusal y para tareas donde el modelo original rechaza peticiones legitimas. Se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia actual radica en que combina un modelo de codigo ampliamente utilizado (la familia Qwen2.5-Coder) con tecnicas de edicion de pesos para eliminar la direccion de rechazo, y lo empaqueta en GGUF con cuantizacion basada en imatrix, lo que permite ejecutarlo en hardware de consumo. La ficha se limita a los datos disponibles en la informacion proporcionada; muchos detalles tecnicos del proceso de entrenamiento no estan documentados publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct); detalles de atencion y capas no disponibles en la informacion proporcionada |
| Parametros totales | 7.615.616.512 (7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder soporta contexto nativo de 32.768 tokens y extendido hasta 131.072, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF con cuantizacion asistida por imatrix; niveles concretos no especificados en la informacion disponible |
| Idiomas soportados | Ingles (segun la etiqueta del repositorio); el modelo base Qwen2.5-Coder es multilingue, pero esta variante solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 32,3 GB con multiples archivos de cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso con 7.615.616.512 parametros. Sobre ese checkpoint se aplico una tecnica de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones), denominada por el autor "heretic1x". La informacion disponible no detalla el metodo exacto, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores a la edicion.

La innovacion tecnica destacable es doble: por un lado, la modificacion de pesos para reducir el comportamiento de rechazo; por otro, la publicacion en GGUF con cuantizacion basada en imatrix, que preserva mejor la calidad en niveles de compresion bajos. No se documentan en la informacion proporcionada tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Generacion y asistencia de codigo, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre fragmentos de codigo y explicacion de logica de programacion.
- Comportamiento de rechazo atenuado ("uncensored"/"abliterated"), orientado a investigacion sobre alineacion.
- Compatibilidad con `llama.cpp` y Ollama, y con endpoints compatibles (segun las etiquetas del repositorio).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento en tareas de codigo y conversacion, comparandolo con el Qwen2.5-Coder-7B-Instruct original.
- Asistencia de programacion en local: con cuantizaciones GGUF puede desplegarse en estaciones de trabajo sin GPU dedicada mediante `llama.cpp`, sirviendo como autocompletado y explicacion de codigo en entornos aislados.
- Analisis de codigo sensible: al reducir los rechazos, resulta util para revisar fragmentos de seguridad, exploits o codigo malicioso con fines defensivos y educativos.
- Prototipado rapido de chatbots de codigo: su integracion con Ollama permite montar un endpoint local en minutos para pruebas de concepto.
- Generacion de documentacion tecnica: puede redactar comentarios y documentacion a partir de fragmentos de codigo en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye multiples archivos GGUF con imatrix, lo que permite medir el impacto de la compresion en la calidad de generacion de codigo.
- Entornos con restricciones de red: al ejecutarse totalmente en local, encaja en escenarios donde no se permite enviar codigo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para cuantizaciones de 4 bits (Q4_K_M), 8-9 GB para 8 bits y en torno a 15-16 GB en FP16 (estimacion basada en el numero de parametros; no confirmada en la informacion proporcionada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones de 4-5 bits; en CPU con suficiente RAM para niveles Q4.
- Opciones de despliegue: `llama.cpp`, Ollama y servidores compatibles con endpoints; vLLM y TGI no estan confirmados para este formato GGUF en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF | 7,6 B | No disponible | Apache 2.0 | GGUF | Variante abliterated, acceso gated |
| Qwen2.5-Coder-7B-Instruct (Alibaba) | 7,6 B | 32.768 nativo (hasta 131.072 extendido) | Apache 2.0 | safetensors, GGUF | Modelo original alineado, ampliamente evaluado |
| Qwen2.5-Coder-7B-Instruct abliterated (otras variantes de la comunidad) | 7,6 B | Depende de la variante | Apache 2.0 | GGUF, safetensors | Multiples autores; calidad variable |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (2,4 B activos, MoE) | 128.000 | DeepSeek License | safetensors, GGUF | Mayor capacidad de codigo, requiere mas VRAM |

## Limitaciones y advertencias

- El proceso de abliteration puede degradar capacidades generales y aumentar la probabilidad de respuestas inapropiadas o daninas; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo de alucinacion en codigo y en explicaciones tecnicas, comun a modelos de 7 B.
- Solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado en esta variante.
- La longitud de contexto efectiva de esta variante no esta documentada; no debe asumirse la del modelo base.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de rechazos traslada al desplegador la responsabilidad sobre el contenido generado.
- El autor no documenta el dataset ni el procedimiento de edicion de pesos, lo que dificulta la reproducibilidad y la auditoria.
- No recomendado para produccion en atencion al cliente o entornos sensibles sin filtros adicionales y evaluacion propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF
- Modelo base del autor: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- `llama.cpp`: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
