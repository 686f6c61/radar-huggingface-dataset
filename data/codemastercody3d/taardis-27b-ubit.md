# CodeMasterCody3D/taardis-27b-ubit

## Resumen

TAARDIS 27B ubit es una versión cuantizada de forma agresiva del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario CodeMasterCody3D. Se trata de una cuantización ternaria de base 3 (receta que el autor denomina "k-trit" o "ubit") aplicada por capas y por capa lineal, con un coste aproximado de 2 bits por peso. El resultado son 616 capas lineales empaquetadas más las densas, almacenadas en un único fichero `packed.safetensors` de 9,74 GB que ocupa unos 10 GB en memoria residente. La torre de visión y la cabeza MTP del modelo original se injertan en formato k3-g128, de modo que el modelo se instancia como multimodal de texto e imagen mediante `AutoModelForImageTextToText`.

El interés de esta ficha es fundamentalmente de investigación: no es un modelo listo para producción, sino un experimento de compresión extrema sobre un modelo de 27B nominales. El autor es explícito al indicar que el proceso es "placement-only", es decir, solo colocación de pesos cuantizados, sin reconstrucción, sin ramas auxiliares y sin ajuste fino posterior. Las matemáticas y la lógica se mantienen razonablemente, pero el recuerdo factual "oscila" según la propia model card. La perplejidad de texto reportada es de 6,9076 y la entropía cruzada de 1,9326, medidas con la herramienta interna del autor ("bundle ruler").

El repositorio tiene 0 descargas y 0 likes, fue creado el 17 de septiembre de 2026 y ocupa 34,8 GB en total, muy por encima de los 9,74 GB del fichero empaquetado, lo que sugiere que incluye artefactos adicionales del proceso de cuantización. Requiere código propio (el proyecto "onebit-forge") para poder cargarse, y no se documenta soporte para runners estándar como vLLM, llama.cpp u Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de texto e imagen heredado de Qwen/Qwen3.8-27B (se instancia con `AutoModelForImageTextToText`); la arquitectura interna no se detalla en la tarjeta |
| Parámetros totales | No disponible. El modelo base se denomina Qwen3.8-27B (27 000 millones nominales), pero la tarjeta no confirma el recuento exacto |
| Parámetros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria de base 3 (k-trit / "ubit"), ~2 bits por peso, esquema w3a16; GPTQ ponderado por Hessiano con rotación Hadamard por bloque y flip-polish; torre de visión y cabeza MTP en k3-g128 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`packed.safetensors`, 9,74 GB; 616 capas lineales empaquetadas + densas). Requiere código propio para la carga |
| Tamaño del repositorio | 34,8 GB en total |
| Publicación | Creado el 17 de septiembre de 2026; última actualización el mismo día |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La tarjeta describe un proceso de cuantización, no un entrenamiento. El modelo se obtiene colocando pesos ternarios de base 3 desde la fuente "k5" mediante una receta por capa que combina tres elementos: rotación Hadamard por bloque aplicada a cada capa lineal, GPTQ ponderado por la Hessiana y un paso final de "flip-polish". El resultado es un esquema de 3 valores por peso (base 3, de ahí "k-trit") con activaciones de 16 bits, lo que da alrededor de 2 bits por peso. El proceso es estrictamente de colocación: no hay reconstrucción de pesos, ramas auxiliares ni ajuste fino. La torre de visión y la cabeza MTP se injertan desde Qwen3.8-27B en formato k3-g128, con 8 tensores `mtp.*` empaquetados.

Un detalle técnico relevante: la cabeza MTP está presente en el fichero pero inerte. Transformers 5.16 no construye una cabeza MTP para esta arquitectura, así que esos 8 tensores no se conectan. Como el MTP solo acelera la decodificación especulativa (y no se usa en un `generate` normal), el autor indica que esto no afecta a la calidad de conversación. Otro caveat de calidad: algunos tensores con Hessiana NaN cayeron a un camino de respaldo consistente en rotación más RTN (round-to-nearest), sin ponderación por curvatura. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque no hubo entrenamiento: se parte íntegramente del modelo base.

## Capacidades

- Generación de texto y razonamiento: el autor indica que las capacidades matemáticas y lógicas "se mantienen" tras la cuantización.
- Capacidades multimodales: la torre de visión (`model.visual`) carga correctamente y el modelo se instancia como multimodal de texto e imagen. El propio autor la describe como "live".
- Recuerdo factual: degradado respecto al modelo base. La tarjeta reconoce que el recuerdo factual "oscila" frente a la solidez de matemáticas y lógica.
- Modo de razonamiento: es un modelo de razonamiento y emite la etiqueta `<think>`, igual que su base.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado. La cabeza MTP, que serviría para decodificación especulativa, está inerte.
- Capacidades multilingües: no documentadas para esta versión cuantizada.
- Decodificación especulativa: no operativa con transformers 5.16; requeriría un módulo MTP propio o una versión más reciente de la librería.

## Casos de uso

- Investigación en cuantización ternaria de base 3: el repositorio permite reproducir el pipeline completo (rotación Hadamard por bloque, GPTQ ponderado por Hessiano y flip-polish) sobre un modelo de ~27B y contrastar la perplejidad obtenida con la reportada (6,9076) usando la misma herramienta de medida.
- Comparación de fidelidad entre razonamiento y memoria factual: dado que el autor afirma que matemáticas y lógica se mantienen mientras el recuerdo factual fluctúa, es un banco de pruebas útil para medir qué tipo de conocimiento sobrevive a una cuantización de ~2 bits.
- Análisis por capa de la degradación: las 616 lineales empaquetadas permiten estudiar qué capas concentran el error y qué supone el respaldo a RTN en los tensores con Hessiana NaN.
- Prototipado multimodal en estación de trabajo: con ~10 GB residentes, el modelo cabe en GPUs de gama alta de consumo y permite experimentar con entrada de imagen más texto sin acceso a clústeres.
- Experimentos de decodificación especulativa: los 8 tensores `mtp.*` están en el fichero; un módulo MTP personalizado o una versión futura de transformers permitiría activarlos y medir la ganancia de velocidad.
- Trabajo de reconstrucción posterior ("recon" / "composers"): la propia tarjeta señala la reconstrucción como la siguiente palanca para recuperar calidad, lo que lo convierte en punto de partida para investigar técnicas de refinado sobre pesos ternarios.
- Docencia y formación técnica: sirve como ejemplo real y reproducible de GPTQ combinado con rotaciones ortogonales sobre un modelo grande, incluyendo sus fallos documentados.

## Benchmarks y rendimiento

El autor solo reporta métricas internas de perplejidad y entropía cruzada con su propia herramienta de medida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

| Métrica | Valor | Notas |
|---|---|---|
| Perplejidad de texto (PPL) | 6,9076 | "Bundle ruler", medición del autor, proceso placement-only |
| Entropía cruzada (CE) | 1,9326 | Misma herramienta de medida |
| MMLU, HumanEval, GSM8K, MMMU | No disponible | No se reportan en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 10 GB de memoria residente para los pesos empaquetados, según la propia tarjeta. Hay que sumar la memoria de la caché KV, las activaciones en 16 bits y la torre de visión, no cuantificadas en la información disponible.
- GPU recomendadas: no se especifican modelos concretos. Por el tamaño residente, encajan GPU de 16 a 24 GB o más (por ejemplo RTX 4090 o A100). No se documenta compatibilidad con GPU de menos de 12 GB, y los 34,8 GB totales del repositorio exigen espacio en disco acorde.
- GPU de consumo: probablemente sí en tarjetas de 16 GB o más, ya que los pesos ocupan ~10 GB, pero es una estimación a partir del dato de memoria residente, no una cifra confirmada por el autor.
- Opciones de despliegue: ninguna estándar. La carga se realiza con `ktrit_resident.load_ktrit_resident(dir, "cuda")`, que construye la clase multimodal. Requiere el código de onebit-forge: `code/ktrit_resident.py` y `code/base3_pack.py` incluidos en el repositorio, más `rotation.py` y `ternary_gptq.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni pesos GGUF.
- Latencia y throughput: no disponibles en cifras. El autor advierte de que no existe todavía un GEMV fusionado para k alto, de modo que la decodificación se realiza capa por capa en cada forward y la generación larga es lenta.

## Comparativa con modelos similares

No se han encontrado en la búsqueda web papers, repositorios ni modelos comparables. La comparación más directa es con el propio modelo base del que deriva.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAARDIS 27B ubit | ~27B nominales (base) | No disponible | Ternaria base-3, ~2 bpw, residencia ~10 GB | apache-2.0 | Repositorio HF; requiere código propio de onebit-forge |
| Qwen/Qwen3.8-27B (base) | 27B nominales | No disponible | Precisión original del modelo base | apache-2.0 | HuggingFace |
| Otros modelos ternarios de categoría similar | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la búsqueda realizada |

## Limitaciones y advertencias

- Recuerdo factual degradado: el autor reconoce explícitamente que la memoria de hechos "oscila" frente a la solidez en matemáticas y lógica. No es un modelo fiable para tareas que dependan de recuperar datos concretos.
- Sin reconstrucción ni ajuste fino: el proceso es placement-only. La calidad está por debajo de lo que se obtendría con reconstrucción de pesos, que el autor sitúa como siguiente paso.
- Algunos tensores cayeron a un respaldo más pobre: los tensores cuya Hessiana resultó NaN se cuantizaron con rotación más RTN, sin ponderación por curvatura, lo que introduce un error adicional no cuantificado.
- Generación larga lenta: no hay GEMV fusionado para k alto y la decodificación se hace capa por capa en cada forward.
- Cabeza MTP inerte: los pesos están, pero transformers 5.16 no los conecta. No afecta a la calidad de conversación, pero invalida cualquier expectativa de aceleración especulativa sin trabajo adicional.
- Carga no estándar: exige código propio. Esto complica la integración en producción, el despliegue con servidores de inferencia habituales y la reproducibilidad fuera del entorno del autor.
- Sin datos de benchmarks estándar: solo hay perplejidad y entropía cruzada medidas con una herramienta propia, lo que impide comparar de forma directa con otros modelos.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto efectiva y la cobertura lingüística de esta versión cuantizada.
- Inconsistencia en los metadatos: las etiquetas del repositorio incluyen `qwen3_5` mientras el campo `base_model` apunta a `Qwen/Qwen3.8-27B`. Conviene verificar la correspondencia real antes de reutilizar el modelo.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar la ficha. No hay evidencia de uso independiente ni validación por terceros.
- Licencia: apache-2.0, heredada del modelo base, lo que en principio permite uso comercial, pero conviene revisar las condiciones del modelo original y del código auxiliar.
- Riesgo de alucinación: no se documenta ninguna evaluación específica; al ser un modelo de razonamiento con `<think>` y con recuerdo factual degradado, el riesgo de afirmaciones incorrectas con formato convincente es relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeMasterCody3D/taardis-27b-ubit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de carga y cuantización: referenciado dentro del propio repositorio como `code/ktrit_resident.py`, `code/base3_pack.py`, además de `rotation.py` y `ternary_gptq.py`. No se ha localizado un repositorio público independiente del proyecto onebit-forge.
- Papers, blogs o demos adicionales: no se han encontrado. La búsqueda web devolvió únicamente resultados genéricos sobre Wikipedia, sin relación con el modelo.
