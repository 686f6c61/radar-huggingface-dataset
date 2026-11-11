# sealad886/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-mxfp8

## Resumen
Este repositorio contiene una conversión al formato MLX (Apple Silicon) del modelo `DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop`, un fine-tune de 12.135.980.720 parámetros (aproximadamente 12,1 B) derivado de la familia Qwen3.5/Qwen3.6 y orientado a escritura creativa, narrativa de ficción y roleplay sin restricciones de contenido (etiquetas "heretic", "uncensored" y "abliterated"). El autor de esta conversión es el usuario sealad886, que ha empaquetado los pesos en precisión mxfp8 (8 bits) usando `mlx-vlm` 0.7.12.

El modelo original procede de un pipeline de fine-tuning (marcado con la etiqueta `unsloth`) sobre una base Qwen con capacidades multimodales (pipeline declarado `image-text-to-text`), de ahí que la conversión conserve ese pipeline. La relevancia de esta ficha es doble: por un lado documenta un modelo de nicho para generación literaria; por otro, sirve de ejemplo de conversión MLX de un modelo de 12 B a 8 bits, formato pensado para inferencia local en Mac con memoria unificada.

Conviene subrayar que la información pública es muy escasa: el modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, la model card se limita a indicar el origen y el comando de uso, y no se publican detalles de entrenamiento, benchmarks ni datasheets. Todo lo que no consta se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 12.135.980.720 (~12,1 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8 (8 bits, formato MLX); el modelo base ofrece otras variantes no detalladas |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mxfp8), librería `mlx` |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 13,0 GB |
| Herramienta de conversion | mlx-vlm 0.7.12 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que sitúa el modelo en la familia Qwen 3.5 de Alibaba (transformers densos, sin indicios de mezcla de expertos en los metadatos). El modelo base es un fine-tune de DavidAU sobre una base Qwen de 12 B, con las etiquetas `unsloth` (herramienta de fine-tuning eficiente), `heretic` y `abliterated`, que en la práctica indican que se ha aplicado una técnica de eliminación o atenuación del comportamiento de rechazo (alignment) para producir contenido sin censura.

No se publican datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO. La orientación declarada es la escritura creativa y el roleplay, con etiquetas que mencionan géneros concretos (ciencia ficción, romance), generación de tramas y subtramas, continuación de escenas y "vivid prosing". La conversión a MLX realizada por sealad886 no modifica los pesos semánticamente: es una reempaquetado a mxfp8 para ejecución en Apple Silicon, por lo que las capacidades del modelo son las del original, con la pérdida de precisión propia de la cuantización a 8 bits.

## Capacidades
- Generación de texto creativo: ficción, relato corto, novela, poesía y prosa descriptiva ("vivid writing").
- Generación de tramas y subtramas, continuación de escenas y construcción de personajes.
- Roleplay y conversación multi-turno con personajes.
- Redacción sin filtros de contenido (modelo "uncensored"/"abliterated"), orientado a temáticas adultas o sensibles.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` (entrada de imagen + texto), aunque no se detallan las tareas concretas soportadas.
- Multilingüe limitado a inglés y chino según los metadatos.
- Soporte de *thinking mode* inferido del nombre del modelo ("Thinking"), sin documentación específica.
- No se documenta soporte de tool calling ni de razonamiento agéntico multi-paso.

## Casos de uso
- Escritura de ficción asistida: el modelo está afinado específicamente para prosa narrativa, por lo que resulta adecuado para generar capítulos, diálogos y descripciones con un tono literario consistente, a partir de un *prompt* de premisa o un esquema de capítulo.
- Generación de tramas y subtramas: útil en fase de *outlining* para producir variantes argumentales, giros y arcos secundarios que el autor luego selecciona y pule.
- Roleplay conversacional: con su orientación a personajes y su ausencia de rechazos, encaja en aplicaciones de chat con personajes ficticios, simulaciones narrativas o juegos de rol por texto.
- Continuación de escenas: dado un fragmento previo, el modelo puede prolongar la narración manteniendo estilo y coherencia local, útil en herramientas de escritura tipo "autocompletar narrativo".
- Prototipado local en Mac: al estar en formato MLX mxfp8, permite probar un modelo de 12 B en un Mac con memoria unificada suficiente sin depender de GPU dedicada ni de servicios en la nube.
- Investigación sobre *alignment* y *abliteration*: sirve como caso de estudio de cómo un fine-tune "uncensored" se comporta en tareas creativas frente al modelo base, para estudios de seguridad y evaluación de sesgos.
- Generación de contenido multimodal básico: si se confirma la capacidad de entrada de imagen, podría emplearse para describir imágenes con estilo narrativo o generar texto inspirado en una ilustración.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria estimada para inferencia: con pesos mxfp8 (~8 bits), el modelo ocupa del orden de 12-13 GB en memoria; el repositorio completo pesa 13,0 GB, por lo que se necesita al menos ~14-16 GB de memoria unificada libre para cargarlo con holgura.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4) con memoria unificada de 16 GB o superior; 32 GB recomendables para contexto largo y margen de trabajo.
- No es un formato para GPU NVIDIA/AMD: al ser MLX, no funciona directamente en CUDA; para esas plataformas habría que usar el modelo base en safetensors/GGUF con otras herramientas.
- Despliegue: `mlx-vlm` (versión 0.7.12 o superior según la model card); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para esta conversión concreta.
- Latencia y throughput: no disponibles; dependerán del chip Apple y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sealad886/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-mxfp8 | ~12,1 B | no disponible | Apache 2.0 | MLX mxfp8 | Conversión MLX de un fine-tune creativo sin censura |
| DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop | ~12,1 B | no disponible | Apache 2.0 | safetensors (bfloat16 según tags) | Modelo base del que deriva esta conversión |
| Qwen3 base (familia Qwen 3.5, ~12 B) | ~12 B | no disponible | Apache 2.0 (según familia) | safetensors, GGUF | Modelo original con alineamiento estándar; sin fine-tune creativo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias
- Modelo "uncensored"/"abliterated": no aplica los rechazos habituales de seguridad, lo que implica riesgo de generar contenido dañino, ofensivo o ilegal; no apto para producción orientada al público sin moderación adicional.
- Riesgo de alucinación: como todo modelo generativo de 12 B, puede inventar hechos, citas o detalles; especialmente problemático en usos no creativos.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de ventana no se publica, lo que impide planificar usos con documentos largos.
- Cuantización mxfp8: la conversión a 8 bits puede degradar ligeramente la calidad frente al original en bfloat16, y no hay evaluación publicada de esa pérdida.
- Plataforma: formato MLX exclusivo para Apple Silicon; no portable a CUDA ni a CPU estándar sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 validaciones de la comunidad.
- No hay información sobre sesgos específicos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/sealad886/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-mxfp8
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Documentación de MLX: https://github.com/ml-explore/mlx
