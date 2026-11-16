# NuevaTechLLC/gemma-3-27b-it-abliterated-v2-GGUF

## Resumen

`gemma-3-27b-it-abliterated-v2-GGUF` es una versión "abliterated" (con la dirección de rechazo eliminada) del modelo `unsloth/gemma-3-27b-it`, distribuida en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. Lo publica Nueva Tech LLC, que aplica su propio pipeline de abliteración de "bajo daño" sobre el checkpoint de 27 009 346 304 parámetros derivado de Gemma 3 27B instruct de Google. El objetivo es reducir drásticamente la tasa de rechazos del modelo ante peticiones que el modelo base declinaría, manteniendo el comportamiento original en el resto de entradas.

El interés técnico del artefacto no está tanto en el modelo en sí como en el método de edición de pesos que documenta: en lugar de la receta estándar (diferencia de medias entre un conjunto dañino y otro inofensivo, una sola dirección, aplicada en todas las capas), el autor describe un proceso de optimización restringida con pares de contraste emparejados, subespacio de rango k vía SVD, búsqueda de capa y anchura del kernel, y una función objetivo que penaliza la pérdida de comportamientos de rechazo calibrado (rechazar premisas falsas, admitir ignorancia, respetar restricciones negativas) además de la divergencia KL.

La relevancia práctica es doble: por un lado ofrece un Gemma 3 27B sin censura en un único fichero Q4_K_M de 16,5 GB que cabe en GPUs de consumo alto; por otro, la model card incluye una comparativa cruzada de daño frente a Heretic 1.4.0 y OBLITERATUS sobre modelos base distintos, lo que permite evaluar la metodología con datos medibles. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y solo declara inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 3 27B instruct); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 27 009 346 304 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (16,5 GB); Q8_0 mencionado como "donde este presente", sin fichero listado |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); checkpoint bf16 de origen no incluido en el repo |
| Modelo base | unsloth/gemma-3-27b-it |
| Tamano del repo | 16,5 GB |
| Libreria | llama.cpp |
| Fecha de creacion | 2026-11-15 |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-27b-it`, un checkpoint instruct de Gemma 3 de 27B parámetros. Sobre esos pesos se aplica una edición de ablación direccional: se localiza la dirección de rechazo mediante contraste masivo entre pares de prompts dañinos e inofensivos y se elimina con una edición de pesos acotada por KL. No hay entrenamiento adicional con datos nuevos ni RLHF/DPO en esta fase; el pipeline incluye una pasada opcional de autodestilación que "cura" la edición elegida contra logits cacheados del modelo intacto.

El pipeline de Nueva Tech se describe como una optimización restringida con varios componentes: (1) pares gemelos inofensivos estructuralmente emparejados con cada prompt dañino, filtrados por longitud y forma, para aislar la decisión de rechazo del tema, la longitud y el registro; (2) cuatro comportamientos protegidos con 96 pares de sonda y control, puntuados directamente en cada edición candidata y ponderados por encima de KL; (3) un escaneo de capas que localiza dónde separa mejor el rechazo y aplica la edición con un kernel (banda o uniforme) centrado ahí, con anchura y fuerza máxima buscadas, sobre las proyecciones de salida de atención y de MLP; (4) eliminación de la media inofensiva de la dirección antes de proyectar, con restauración opcional de norma; (5) SVD sobre el contraste emparejado para obtener un subespacio de rango k con protección frente a las direcciones de calibración; y (6) búsqueda Optuna sobre el objetivo `refusal + λ_kl·KL + λ_cal·calibration_drop + λ_over·Δover_refusal`. Cada etapa deja un registro en el repo (`extract.json`, `search.json`, `ablation_card.json`).

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 3 27B instruct.
- Razonamiento y matemáticas de nivel 27B, con la salvedad de que la edición de pesos puede degradar ligeramente tareas sensibles al rechazo calibrado.
- Reducción sustancial de la tasa de rechazo: el modelo declina "mucho menos" que el base según el autor, manteniendo el comportamiento en prompts ordinarios.
- Capacidad de rechazo calibrado parcialmente preservada por diseño: el pipeline protege explícitamente rechazar premisas falsas, admitir ignorancia, rechazar sinsentidos y respetar restricciones negativas.
- Compatibilidad con tool calling y function calling: no confirmada en la información proporcionada; se heredaría del base si este lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la model card.
- Multilingüismo: solo se declara inglés; el base Gemma 3 es multilingüe, pero esta ficha no aporta datos al respecto.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.
- Despliegue vía llama.cpp, Ollama (Modelfile incluido) y LM Studio (`lms import`).

## Casos de uso

- Investigación en interpretabilidad y seguridad: el repo incluye `extract.json`, `search.json` y `ablation_card.json` con el escaneo de capas, el subespacio SVD, las cosines de protección y todas las pruebas de Optuna, lo que permite reproducir y auditar la edición de pesos capa por capa.
- Evaluación comparativa de métodos de abliteración: sirve como referencia cuantitativa frente a Heretic 1.4.0 y OBLITERATUS usando los mismos conjuntos (StrongREJECT filtrado, OR-Bench-hard, Dolly) y el mismo juez (Qwen3Guard-Gen-8B).
- Generación creativa sin fricción: escritura de ficción, guiones o narrativa con temas sensibles donde los rechazos del modelo base interrumpen el flujo; el modelo mantiene el estilo y la calidad de Gemma 3 27B en prompts ordinarios.
- Red teaming y generación de datos adversarios: producción de prompts y respuestas dañinas controladas para entrenar clasificadores de seguridad o alimentar pipelines de evaluación, con la ventaja de que el modelo conserva parcialmente la capacidad de declinar premisas falsas.
- Asistente local en estación de trabajo: el Q4_K_M de 16,5 GB con ~20 GB de VRAM/RAM cabe en una RTX 4090 de 24 GB o en una RTX 3090, y se ejecuta con `llama-cli -m ... -c 8192 -cnv` o vía Ollama, sin dependencia de API externa.
- Estudio de la relación entre rechazo y calibración: los cuatro comportamientos protegidos (rechazar premisas falsas, admitir ignorancia, rechazar sinsentidos, respetar restricciones negativas) permiten medir empíricamente cuánto de la capacidad de "declinar bien" se pierde al eliminar la dirección de rechazo.
- Base para ajuste fino posterior: al estar en GGUF y derivar de un checkpoint instruct, puede servir como punto de partida para LoRA o fine-tuning en dominios donde se quiera un modelo sin sesgo de rechazo, aunque la cuantización Q4_K_M limita su uso directo para entrenamiento.

## Benchmarks y rendimiento

La model card no publica benchmarks del propio `gemma-3-27b-it-abliterated-v2`. Los datos que incluye son una comparativa cruzada del método sobre otros modelos base (Qwen3-8B), que el autor presenta como "evidencia cruzada" y no como resultado de este modelo. Se reproduce a continuación tal cual, sin extrapolar:

**Qwen3-8B (modelo distinto al de esta ficha)**

| Contender | refusal | comply | over-refusal | KL | MMLU | ARC-C | GSM8K |
|---|---|---|---|---|---|---|---|
| base | 0.954 | 0.004 | 0.370 | 0.000 | 0.757 | 0.560 | 0.892 |
| Heretic 1.4.0 | 0.610 | 0.273 | 0.050 | 0.006 | 0.757 | 0.558 | 0.898 |
| OBLITERATUS advanced | 0.716 | 0.188 | 0.113 | 0.242 | 0.747 | 0.525 | 0.880 |

Conjuntos: StrongREJECT sin filas de AdvBench ni solapamientos (282 prompts dañinos), OR-Bench-hard (300 prompts benignos que parecen dañinos), Dolly (300 prompts inofensivos para KL). Rechazos juzgados por Qwen3Guard-Gen-8B. Capacidad medida con lm-eval 0.4.13 (MMLU completo, ARC-Challenge y GSM8K a 400 ítems). El autor indica que los números de daño de este modelo concreto están en la tabla de resultados de `ablation_card.json`, no en la model card.

No se han publicado resultados de benchmarks del modelo de esta ficha en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~20 GB para el fichero Q4_K_M de 16,5 GB, según la model card.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con contexto moderado; A100 40/80 GB o H100 para contexto largo o Q8_0 (~33 GB estimados a partir del "roughly double the size" indicado por el autor).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con Q4_K_M; en 16 GB no cabe sin offload parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -m big-gemma-3-27b-it-Q4_K_M.gguf -c 8192 -cnv`), Ollama con el Modelfile del repo (`ollama create ... -f Modelfile`), LM Studio (`lms import <file>`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal (Qwen3-8B, referencia cruzada) | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-27b-it-abliterated-v2 (esta ficha) | 27,0 B | no disponible | no medido en la model card | gemma | GGUF |
| Qwen3-8B + Heretic 1.4.0 | 8 B | no disponible | 0.610 | según modelo base | no disponible |
| Qwen3-8B + OBLITERATUS advanced | 8 B | no disponible | 0.716 | según modelo base | no disponible |
| unsloth/gemma-3-27b-it (base sin editar) | 27,0 B | no disponible | 0.954 (referencia Qwen3-8B, no equivalente) | gemma | safetensors |

La comparación directa con alternativas de la misma categoría (Gemma 3 27B abliterated de otros autores) no está disponible en la información proporcionada. La tabla anterior mezcla modelos base distintos y solo sirve para contextualizar la metodología del autor, no para comparar rendimiento entre modelos.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo es deliberada y el modelo responderá a peticiones que el base declinaría; el autor reconoce que la edición puede degradar el rechazo calibrado pese a las protecciones del pipeline.
- Riesgo de alucinación y de respuestas inseguras en dominios sensibles (salud, legal, seguridad) sin las salvaguardas del modelo original.
- Solo se declara inglés; el comportamiento multilingüe de Gemma 3 no está verificado tras la edición.
- Licencia Gemma Terms of Use: impone restricciones de uso, obligaciones de atribución y una política de uso prohibido que se aplica también a las versiones modificadas; revisar antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en la fecha de consulta; sin validación independiente de la comunidad.
- Un único fichero publicado (Q4_K_M); el Q8_0 mencionado no aparece listado, lo que limita la comparación con los pesos bf16 editados.
- El contexto no está documentado en la model card; el ejemplo de llama.cpp usa 8192 tokens, muy por debajo del contexto nativo de Gemma 3, así que el contexto real utilizable depende de la configuración manual.
- Los benchmarks de la model card corresponden a Qwen3-8B, no a este modelo; no deben citarse como rendimiento de Gemma 3 27B abliterated.
- La fecha de creación del repo (2026-11-15) es posterior a la fecha de la edición indicada en la model card (2026-10-27); verificar la integridad del fichero con el SHA256 publicado.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-27b-it-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-3-27b-it
- Heretic (herramienta de abliteración comparada): no disponible en la información proporcionada
- OBLITERATUS (herramienta de abliteración comparada, commit `461ff08`): no disponible en la información proporcionada
- Qwen3Guard-Gen-8B (juez de rechazos): no disponible en la información proporcionada
- Paper, blog o demo del pipeline de Nueva Tech: no disponible en la información proporcionada
