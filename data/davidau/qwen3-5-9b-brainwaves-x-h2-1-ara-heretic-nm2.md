# DavidAU/Qwen3.5-9B-Brainwaves-X-H2.1-ARA-HERETIC-NM2

## Resumen

DavidAU/Qwen3.5-9B-Brainwaves-X-H2.1-ARA-HERETIC-NM2 es un modelo de lenguaje de 9.000 millones de parametros publicado por David Belton (DavidAU) en Hugging Face. Se trata de una fusión (merge) de modelos derivada de la familia Qwen 3.5, etiquetada con los descriptores "heretic", "ara", "abliterated" y "v2.1", lo que indica que ha sido sometido a técnicas de eliminación de rechazos (abliteration) y ajuste orientado a reducir las restricciones de alineación del modelo base. El repositorio tiene acceso restringido (gated) y requiere aceptar condiciones en Hugging Face.

El autor es conocido por publicar un volumen muy elevado de modelos fusionados y fine-tunes (más de 2.700 merges y más de 1.000 fine-tunes según su perfil), orientados a casos de uso especializados mediante ingeniería de prompts, roles de sistema y ajuste de parámetros. Este modelo concreto pertenece a una línea de variantes "Heretic" del mismo autor sobre la base Qwen 3.5 de 9B.

La relevancia de esta ficha es limitada por la ausencia de documentación técnica publicada: no se dispone de model card detallada, resultados de benchmarks propios ni especificaciones de entrenamiento verificables en la información proporcionada. Los datos que se ofrecen a continuación proceden de la metadata del repositorio y de las referencias públicas al ecosistema del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 9B; detalles no disponibles) |
| Parametros totales | 9B (aproximado, según nomenclatura del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; el autor publica variantes GGUF en repositorios hermanos (4-bit y 8-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio hermano del autor indica código fuente en precisión de 16 bits; no confirmado para este modelo) |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO) de este modelo concreto. Por la nomenclatura y el ecosistema del autor, se trata de un merge de modelos derivado de Qwen 3.5 9B, sometido a técnicas de abliteration (eliminación de direcciones de activación asociadas al rechazo) y posiblemente a ajustes adicionales etiquetados como "ARA" y "H2.1", cuyos detalles no están documentados en la información disponible.

El sufijo "NM2" y la etiqueta "v2.1" sugieren una segunda iteración de una variante previa dentro de la línea "Brainwaves-X", pero no se dispone de información que permita confirmar la composición exacta del merge ni las técnicas de entrenamiento aplicadas. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, MTP) sería especulativa y no se incluye.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen 3.5 9B.
- Razonamiento y resolución de problemas de complejidad media, asumiendo las capacidades del modelo base.
- Generación de código, sujeta a las capacidades del modelo base Qwen 3.5 9B.
- Comportamiento "uncensored"/"abliterated": el modelo está ajustado para reducir rechazos ante solicitudes que el modelo base rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para analizar el efecto de la abliteration sobre el comportamiento de rechazo en modelos de 9B, comparando respuestas con el modelo base Qwen 3.5 9B.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que el modelo base podría rechazar por contenido sensible, en entornos controlados y con revisión humana.
- Experimentación con merges de modelos: útil para investigadores que estudian cómo la combinación de pesos afecta a las capacidades y al comportamiento del modelo resultante.
- Prototipado de asistentes conversacionales en local: con 9B de parámetros, puede desplegarse en GPUs de consumo mediante cuantización GGUF (variantes publicadas por el autor en repositorios hermanos), para pruebas de concepto sin dependencia de API.
- Evaluación comparativa de variantes "Heretic": el modelo permite comparar distintas iteraciones de la línea del autor (v2.1, NEO, IMATRIX) sobre la misma base para seleccionar la variante más adecuada a una tarea.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio, siempre que el uso previsto sea compatible con la licencia y con las condiciones de acceso del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. El autor menciona en repositorios hermanos de la misma línea que sus variantes "superan 7 de 7 benchmarks" frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, pero no se aportan cifras verificables ni metodología en la información proporcionada, por lo que no se reproducen dichos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB de pesos, más overhead de contexto y KV cache (estimación típica para 9B; no confirmada por el autor).
- VRAM estimada en cuantización 8-bit: en torno a 9-10 GB.
- VRAM estimada en cuantización 4-bit: en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8-bit; RTX 3090/4080 para 8-bit o 4-bit.
- Cabe en GPU de consumo: sí, en cuantización 4-bit o 8-bit en GPUs con 8-24 GB de VRAM, siempre que se disponga de variantes GGUF (el autor las publica en repositorios hermanos; no confirmadas para este ID exacto).
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF para las variantes cuantizadas; vLLM o TGI para pesos completos si se confirma el formato safetensors (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| DavidAU/Qwen3.5-9B-Brainwaves-X-H2.1-ARA-HERETIC-NM2 | 9B | no disponible | Apache 2.0 | Gated | Merge abliterated/heretic del autor |
| Qwen 3.5 9B (modelo base) | 9B | no disponible | según Qwen (no confirmado) | Público | Base oficial de referencia |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | 9B | no disponible | no disponible | Público | Variante hermana del mismo autor con GGUF 4/8-bit y MTP |

No se dispone de datos de rendimiento comparativos verificables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los procesos de abliteration pueden alterar el comportamiento del modelo de formas no evaluadas y aumentar la probabilidad de respuestas sesgadas o inapropiadas.
- Riesgo de alucinación: inherente a los modelos de 9B; no se han publicado evaluaciones de fidelidad factual para este modelo.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados; no debe asumirse paridad con el modelo base sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio es de acceso restringido (gated) y requiere aceptar condiciones; deben revisarse los términos del modelo base Qwen 3.5 y de cualquier componente del merge.
- El modelo está diseñado explícitamente para reducir rechazos, lo que implica un riesgo elevado de generar contenido dañino, ilegal o inexacto; no es adecuado para despliegues en producción orientados al público sin filtros y supervisión adicionales.
- Ausencia de model card técnica: no hay información verificable sobre datos de entrenamiento, evaluación o composición del merge, lo que dificulta la auditoría y la reproducibilidad.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face (repositorio del modelo): https://huggingface.co/DavidAU/Qwen3.5-9B-Brainwaves-X-H2.1-ARA-HERETIC-NM2
- Perfil del autor en Hugging Face: https://huggingface.co/DavidAU
- Listado de modelos del autor: https://huggingface.co/DavidAU/models
- Repositorio hermano de la línea Heretic (referencia): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Repositorio hermano con GGUF (referencia): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
