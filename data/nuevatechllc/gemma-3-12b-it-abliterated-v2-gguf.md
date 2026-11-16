# NuevaTechLLC/gemma-3-12b-it-abliterated-v2-GGUF

## Resumen

`gemma-3-12b-it-abliterated-v2-GGUF` es una versión "abliterated" (eliminación de la dirección de rechazo) del modelo `unsloth/gemma-3-12b-it`, publicada por Nueva Tech LLC y distribuida en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. El modelo base es Gemma 3 12B instruct de Google DeepMind, un transformer denso de 11.766.034.176 parámetros. La modificación consiste en una edición de pesos que elimina selectivamente la dirección de rechazo mediante un proceso de optimización restringida, con el objetivo de reducir las negativas del modelo sin degradar su comportamiento general.

El interés técnico de esta ficha reside en la metodología de "abliteración de bajo daño" que el autor documenta: en lugar de la receta estándar (diferencia de medias entre conjuntos dañinos y benignos no emparejados, aplicada a todas las capas), se emplea un contraste emparejado, una búsqueda de capa y kernel, una proyección de subespacio SVD y una búsqueda Optuna sobre una función objetivo que penaliza la pérdida de calibración y la divergencia KL. Los resultados de la comparación interna del autor (frente a Heretic 1.4.0 y OBLITERATUS) sugieren que este enfoque preserva mejor las capacidades del modelo base, aunque dichos datos provienen del propio autor y no de una evaluación independiente.

La relevancia actual es doble: por un lado, para investigadores interesados en interpretabilidad y en la geometría de la negativa en modelos alineados; por otro, para desarrolladores que necesitan un modelo local sin filtros de rechazo. Debe tenerse en cuenta que la licencia Gemma impone restricciones de uso y que el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3), decoder-only |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (7,3 GB); Q8_0 mencionado como "donde este presente" |
| Idiomas soportados | en |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); el checkpoint de origen es bf16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B instruct: un transformer decoder-only denso con 11.766 millones de parámetros. El modelo no se ha reentrenado desde cero; parte del checkpoint `unsloth/gemma-3-12b-it` y aplica una edición de pesos sobre las proyecciones de salida de atención y de MLP. El proceso de abliteración, según la model card, consta de varias etapas: extracción de la dirección de rechazo mediante pares de prompts dañinos y sus "gemelos" benignos estructuralmente emparejados (controlados por longitud y forma), escaneo de capas para localizar dónde se separa mejor la negativa, aplicación de la edición con un kernel (banda o uniforme) centrado en esa capa con anchura y fuerza de pico buscadas, y eliminación de la media benigna de la dirección antes de la proyección para evitar el rescalado incorrecto de RMSNorm.

La innovación principal es el tratamiento del problema como optimización restringida con Optuna sobre la función objetivo `refusal + λ_kl·KL + λ_cal·calibration_drop + λ_over·Δover_refusal`, protegiendo explícitamente cuatro comportamientos calibrados (rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos y respeto de restricciones negativas) mediante 96 pares de sondas y controles. Opcionalmente se aplica una pasada de autodestilación contra los logits cacheados del modelo intacto. El autor documenta los artefactos `extract.json`, `search.json` y `ablation_card.json` con los registros de cada etapa. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición de su dataset.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general y respuesta a instrucciones (hereda las capacidades del Gemma 3 12B instruct).
- Reducción significativa de rechazos ante prompts que el modelo base declinaría, preservando según el autor los comportamientos de calibración (admitir ignorancia, rechazar premisas falsas).
- Ejecución local mediante llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, matemáticas, código o multimodalidad: no disponibles en la información proporcionada para esta variante.

## Casos de uso

- Investigación en interpretabilidad: estudiar la geometría de la dirección de rechazo comparando este checkpoint con el Gemma 3 12B original, usando los artefactos `extract.json` y `search.json` como referencia reproducible del proceso de edición.
- Evaluación de métodos de abliteración: servir como contrapunto en experimentos que comparen la receta de bajo daño del autor con Heretic u OBLITERATUS sobre el mismo modelo base, midiendo rechazo, sobre-rechazo y KL.
- Despliegue local en estaciones de trabajo: con 7,3 GB en Q4_K_M y unos 10 GB de VRAM/RAM necesarios, cabe en GPUs de consumo alto (por ejemplo, RTX 4090 de 24 GB) y permite inferencia offline sin dependencia de API.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo con temáticas sensibles donde el modelo base rechazaría, en un entorno controlado y con revisión humana.
- Prototipado de asistentes especializados: al eliminar las negativas genéricas, facilita la construcción de system prompts que definan el comportamiento sin interferencia del rechazo preentrenado.
- Análisis de robustez y seguridad: usar el modelo como caso de estudio para medir cómo la eliminación de la negativa afecta a la tasa de cumplimiento de prompts dañinos (`comply`) y diseñar mitigaciones externas (filtros de entrada/salida).
- Experimentos de cuantización: comparar el comportamiento del Q4_K_M frente al bf16 de origen para evaluar la supervivencia de la edición tras la cuantización, dato que el autor afirma registrar en `ablation_card.json`.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa generada por el propio autor, pero los datos visibles en la información proporcionada corresponden a **Qwen3-8B**, no a Gemma 3 12B; la tabla de este modelo queda truncada. Por tanto, no se presentan cifras de benchmarks verificables para `gemma-3-12b-it-abliterated-v2` en la información disponible.

Metodología declarada por el autor (aplicable a la comparación): StrongREJECT filtrado (282 prompts dañinos), OR-Bench-hard (300 prompts benignos que parecen dañinos) y Dolly (300 prompts benignos para KL); rechazos juzgados con Qwen3Guard-Gen-8B; capacidad medida con lm-eval 0.4.13 (MMLU completo, ARC-Challenge y GSM8K a 400 ítems).

No se han publicado resultados de benchmarks verificables de este modelo en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 10 GB para el archivo Q4_K_M (7,3 GB en disco); el Q8_0, si está disponible, ocupa cerca del doble.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o superior permite cargar el Q4_K_M con holgura y contexto amplio; A100/H100 no son necesarias para esta cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM para Q4_K_M con contexto moderado; con 10 GB justos puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante el `Modelfile` incluido) y LM Studio (`lms import`). vLLM y TGI no se mencionan para este formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-12b-it-abliterated-v2 (este) | 11,77 B | no disponible | gemma | GGUF | Abliteración de bajo daño con Optuna y protección de calibración |
| unsloth/gemma-3-12b-it (base) | 11,77 B | no disponible | gemma | safetensors/GGUF | Modelo instruct original, con rechazos intactos |
| Gemma 3 12B abliterado con Heretic 1.4.0 | 11,77 B | no disponible | gemma | según distribución | Receta estándar con búsqueda Optuna sobre ablación direccional |
| Gemma 3 12B abliterado con OBLITERATUS | 11,77 B | no disponible | gemma | según distribución | Presets `advanced` y `optimized` |

Los datos cuantitativos de la comparación (rechazo, cumplimiento, sobre-rechazo, KL, MMLU, ARC-C, GSM8K) no están disponibles para Gemma 3 12B en la información proporcionada; la tabla visible corresponde a Qwen3-8B.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo incrementa el riesgo de generar contenido dañino; el autor reporta tasas de cumplimiento (`comply`) no nulas en sus comparaciones, y este modelo está diseñado precisamente para reducir las negativas.
- Aunque el autor afirma proteger cuatro comportamientos calibrados, no hay evaluación independiente que confirme la preservación de la calibración en esta variante concreta.
- Los benchmarks y comparaciones provienen del propio autor; no se han verificado de forma externa.
- Solo se declara soporte de inglés; el rendimiento en castellano no está documentado.
- Licencia Gemma: impone restricciones de uso comercial, obligaciones de atribución y una política de uso aceptable que puede entrar en conflicto con el propósito de un modelo sin filtros; revisar los términos antes de cualquier despliegue.
- La cuantización Q4_K_M puede degradar la fidelidad de la edición de pesos respecto al bf16 de origen; el autor afirma registrar la supervivencia en `ablation_card.json`, pero no se aportan cifras en la información disponible.
- Riesgo de alucinación inherente al modelo base, no mitigado por la abliteración.
- Contexto máximo no documentado en la información proporcionada; el ejemplo de uso fija `-c 8192`, que no debe interpretarse como el límite del modelo.
- Sesgos del modelo base (Gemma 3) persisten sin cambios sustanciales.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-12b-it-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-3-12b-it
- Heretic (herramienta de abliteración): no disponible en la información proporcionada
- OBLITERATUS (commit `461ff08`): no disponible en la información proporcionada
- Paper o blog del pipeline de abliteración de Nueva Tech LLC: no disponible en la información proporcionada
- Repositorio llama.cpp: no disponible en la información proporcionada
- Gemma Terms of Use: no disponible en la información proporcionada
