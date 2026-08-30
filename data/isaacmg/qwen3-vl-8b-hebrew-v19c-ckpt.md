# isaacmg/qwen3-vl-8b-hebrew-v19c-ckpt

## Resumen

El modelo isaacmg/qwen3-vl-8b-hebrew-v19c-ckpt es un checkpoint experimental de la serie HebVL, desarrollado por isaacmg, que adapta el modelo multimodal Qwen3-VL-8B-Instruct para la lectura de manuscritos hebreos históricos, específicamente los de la Genizah de El Cairo. Este checkpoint concreto corresponde al tercer brazo de un experimento de fusión (merger) en el que las ocho líneas de fusión visión→lenguaje se entrenan con pesos completos (full-weight) en lugar de LoRA de rango 16, con el objetivo de evaluar si la capacidad de rango completo mantiene las mejoras de rescate de lectura y elimina los colapsos observados en el brazo v1.9b. El entrenamiento aún no ha comenzado, por lo que este repositorio está destinado a albergar checkpoints en curso y no debe usarse para inferencia. El modelo base Qwen3-VL-8B-Instruct es un modelo de visión-lenguaje de 8 mil millones de parámetros, aunque no se proporcionan detalles específicos de su arquitectura interna en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (base) con adaptadores PEFT (LoRA y modules_to_save) |
| Parametros totales | no disponible (modelo base de 8B + adaptadores; ~160M en módulos full-weight de fusión) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL soporta contexto extendido, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (especializado); el modelo base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | PEFT/LoRA (adaptadores), formato no especificado |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-8B-Instruct, un modelo de visión-lenguaje de la familia Qwen3-VL. Sobre esta base, se aplican adaptadores LoRA para adaptar el modelo a la tarea de reconocimiento óptico de caracteres (OCR) y reconocimiento de texto manuscrito (HTR) en hebreo histórico. En la variante v1.9c, las ocho líneas de fusión que conectan la torre de visión con el modelo de lenguaje se entrenan con pesos completos (PEFT `modules_to_save`, ~160 millones de parámetros) en lugar de LoRA de rango 16, como en v1.9b. El entrenamiento está planificado con datos y mezcla idénticos a v1.9a/b, con warm start desde el paso 700 de v1.8b y un programa de 2000 pasos, deteniéndose cerca del paso 700. No se han proporcionado detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito hebreo histórico, incluyendo manuscritos de la Genizah de El Cairo.
- Lectura de escritura Rashi y texto impreso del Talmud (según resultados de versiones anteriores de la serie).
- Procesamiento de imágenes de documentos y extracción de texto (OCR/HTR).
- Capacidades multilingües heredadas del modelo base Qwen3-VL, aunque el adaptador está especializado en hebreo.
- No se han verificado capacidades de tool calling, agentes o razonamiento multi-paso en esta variante específica.

## Casos de uso

- Digitalización de manuscritos de la Genizah de El Cairo: el modelo puede transcribir automáticamente fragmentos manuscritos en hebreo, facilitando la investigación histórica y filológica.
- Transcripción de textos talmúdicos impresos: versiones anteriores de la serie han demostrado baja tasa de error en páginas de Talmud, lo que sugiere su utilidad para convertir ediciones impresas a texto digital.
- Reconocimiento de escritura Rashi: el modelo puede leer glosas en escritura Rashi, un estilo caligráfico difícil de procesar con OCR convencional.
- Archivado y búsqueda de documentos históricos: al convertir imágenes en texto, permite indexar y buscar contenido en colecciones digitales.
- Asistencia a paleógrafos: como herramienta de apoyo para la lectura de manuscritos dañados o de difícil legibilidad.
- Investigación en procesamiento de lenguaje histórico: el modelo puede servir como base para estudios sobre variantes lingüísticas del hebreo medieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el checkpoint v1.9c, ya que el entrenamiento no ha comenzado. Como referencia, la serie ha reportado los siguientes resultados en versiones anteriores (no comparables directamente con v1.9c):

| Version | Benchmark | F1 | CER* |
|---|---|---|---|
| v1.9a | Genizah religious-140 | 0.816 | 0.216 |
| v1.9a | frozen PGP-131 | 0.862 | 0.196 |
| v1.6 | Talmud page (gemara) | - | 0.090 |
| v1.6 | Talmud page (rashi) | - | 0.047 |
| v1.6 | Talmud page (tosafot) | - | 0.099 |
| v1.5 | synthetic Rashi text | - | 0.018 |

*CER sobre intentos sustanciales, con alineación basada en scorer. Los benchmarks difieren entre generaciones.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este checkpoint. Dado que se basa en Qwen3-VL-8B-Instruct, se puede estimar que requiere una GPU con al menos 16-24 GB de VRAM para inferencia en precisión completa, y menos con cuantización, pero estos datos no están confirmados en la información proporcionada. No se mencionan opciones de despliegue específicas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de OCR hebreo en la información proporcionada. La serie HebVL se posiciona como una familia de adaptadores especializados, pero no se citan alternativas concretas. El modelo base Qwen3-VL-8B-Instruct es el punto de partida, y versiones anteriores de la serie han superado a modelos cerrados en tareas específicas (por ejemplo, v1.6 logró un CER de 0.047 en escritura Rashi frente a 0.315 del mejor modelo cerrado probado), pero no se identifican modelos comparables en esta ficha.

## Limitaciones y advertencias

- El checkpoint v1.9c está en fase experimental y su entrenamiento no ha comenzado; no debe usarse para inferencia.
- No se han evaluado sesgos ni riesgos de alucinación específicos para esta variante.
- La especialización en hebreo histórico puede limitar su rendimiento en otros idiomas o estilos de escritura.
- La licencia apache-2.0 permite uso comercial, pero el modelo es un adaptador sobre Qwen3-VL-8B-Instruct, que tiene su propia licencia (Apache 2.0 también, según el repo de Qwen3-VL).
- Los resultados de la serie son prometedores, pero cada versión tiene benchmarks diferentes, por lo que no se pueden comparar directamente entre generaciones.

## Enlaces

- Repositorio del checkpoint v1.9c: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v19c-ckpt
- Checkpoint flagship v1.9a: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v19a-ckpt
- Checkpoint v1.9b: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v19b-ckpt
- Checkpoint v1.8b: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v18b-ckpt
- Checkpoint v1.8a: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v18a-ckpt
- Repositorio de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
- Página del modelo en FriendliAI: https://friendli.ai/models/isaacmg/qwen3-vl-8b-hebrew-v18a-ckpt
