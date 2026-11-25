# disinfozone/wekwos-120b

## Resumen

Wekwos-120B es un modelo de lenguaje de tipo mezcla de expertos (MoE) de 120.668.707.840 parámetros totales y 12.000 millones activos por token, desarrollado por disinfozone a partir de nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16. Su especialidad es el protoindoeuropeo (PIE) reconstruido: lee, escribe, flexiona, glosa, reconstruye y conversa en esta protolengua en notación académica estándar (laringeales h₁ h₂ h₃, series dorsales, resonantes silábicas, acento móvil). El modelo cubre una tarea que los modelos frontera solo resuelven de forma aproximada: cuando se exige notación y morfología rigurosas sin herramientas externas, los modelos generalistas pierden entre 25 y 37 puntos, mientras que Wekwos-120B solo pierde 2,3 puntos entre evaluación laxa y estricta.

El repositorio principal es una compilación lista para ejecutar en Apple Silicon mediante MLX, cuantizada con `omlx` en precisión mixta afín oQ5e (5 bits en expertos enrutados, 6 bits en capas Mamba y de atención, 8 bits en embeddings, expertos compartidos y LM head) y fusionada con el vocabulario final y el adaptador de aprendizaje por refuerzo GRPO (`rl8`). Ocupa 84,8 GB repartidos en 15 fragmentos safetensors. Existen builds adicionales en GGUF para llama.cpp, LM Studio y Ollama, un merge en BF16 para vLLM y SGLang, y el adaptador LoRA de SFT.

La relevancia del modelo es doble: por un lado, demuestra que el ajuste fino con datos verificados y RL puede llevar a un modelo abierto a un dominio lingüístico histórico de altísima densidad notacional; por otro, sirve como banco de pruebas para evaluar hasta qué punto los modelos generalistas "conocen" el PIE de verdad o solo reproducen frases de manual. La licencia es la NVIDIA Nemotron Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) híbrida con capas Mamba y de atención (tag `nemotron_h`), derivada de NVIDIA-Nemotron-3.5-Super-VL-120B-A12B |
| Parametros totales | 120.668.707.840 |
| Parametros activos | 12.000 millones por token (A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e de precisión mixta afín (5 bits expertos enrutados, 6 bits Mamba/atención, 8 bits embeddings, expertos compartidos y LM head); GGUF Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0; BF16 completo |
| Idiomas soportados | ine (protoindoeuropeo reconstruido), en (inglés) |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (15 fragmentos, build MLX); GGUF; BF16 |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, un transformer de mezcla de expertos con 120.000 millones de parámetros totales y 12.000 millones activos, etiquetado como `nemotron_h`, lo que indica una arquitectura híbrida que combina capas Mamba con capas de atención. La compilación publicada aplica cuantización afín de precisión mixta con `omlx` (esquema oQ5e): los expertos enrutados se almacenan a 5 bits, las capas Mamba y de atención a 6 bits, y los embeddings, expertos compartidos y LM head a 8 bits, lo que reduce el peso a 84,8 GB manteniendo las partes sensibles a mayor precisión.

El entrenamiento se realizó en tres frentes según la model card: un léxico verificado, un motor gramatical determinista y un corpus de 133.982 palabras compuesto a través de ambos, seguido de aprendizaje por refuerzo multironda con GRPO. El adaptador final `rl8` se fusiona en los pesos publicados junto con el vocabulario definitivo. La evaluación morfológica se verifica de forma determinista contra el motor gramatical, mientras que las traducciones y los diálogos se evalúan con doble juez (Claude Opus 5.5 y GPT-6.1 Sol) con acceso al motor, al corpus y a las respuestas de referencia. No se detalla en la información disponible el número total de tokens de preentrenamiento ni la composición completa del dataset más allá del corpus citado.

## Capacidades

- Generación de texto en protoindoeuropeo reconstruido con notación académica estándar: laringeales h₁ h₂ h₃, series dorsales ḱ ǵ ǵʰ / k g gʰ / kʷ gʷ gʷʰ, oclusivas sonoras aspiradas bʰ dʰ, resonantes silábicas r̥ l̥ m̥ n̥, longitud vocálica contrastiva y acento móvil.
- Flexión nominal y verbal (inflection) y producción de paradigmas completos verificables contra un motor gramatical determinista.
- Glosado y traducción bidireccional inglés → PIE y PIE → inglés.
- Reconstrucción de formas y raíces a partir de cognados y correspondencias fonéticas.
- Conversación multi-turno en PIE con registro académico (diálogo).
- Modelo base multimodal de origen (Nemotron VL), aunque las capacidades de visión no se documentan en la información disponible para este ajuste.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información proporcionada.

## Casos de uso

- Investigación en lingüística histórica: el modelo permite generar hipótesis de formas PIE y paradigmas que el investigador puede contrastar con el motor gramatical y el corpus, acelerando la exploración de correspondencias fonéticas y morfológicas.
- Docencia universitaria de indoeuropeística: sirve para producir ejercicios de flexión, glosado y traducción con notación correcta, y para corregir automáticamente las respuestas de los estudiantes contra el motor determinista.
- Creación de contenido divulgativo: redacción de textos, diálogos y ejemplos en PIE para cursos, museos o publicaciones, con la ventaja de mantener la notación académica sin depender de herramientas externas.
- Evaluación comparativa de modelos generalistas: el benchmark retenido de 607 ítems y los ejemplos lado a lado con modelos frontera permiten medir la brecha real entre "conocer frases de manual" y dominar la morfología.
- Anotación y glosado asistido de corpus: generación de glosas interlineales y etiquetado morfológico para textos comparativos, con verificación posterior contra el motor gramatical.
- Prototipado de aplicaciones educativas: integración en un traductor o tutor basado en reglas (el proyecto wekʷos mantiene un traductor en vivo) donde el modelo aporta la capa de lenguaje natural y el motor aporta la corrección formal.
- Estudio de metodologías de RL en dominios de nicho: el pipeline de léxico verificado, motor gramatical, corpus sintético y GRPO multironda es replicable en otras protolenguas o dominios con gramática formalizable.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre el benchmark retenido de 607 ítems, con cinco segmentos ponderados: EN → PIE 30 %, flexión 20 %, PIE → EN 20 %, paradigmas 15 %, diálogo 15 %.

| Metrica | Valor |
|---|---|
| Strict Score (ponderado) | 86,2 |
| Lenient Score (ponderado) | 88,5 |
| Flexión (strict) | 89,3 |
| Paradigma (strict) | 88,4 |
| Inglés → PIE (strict) | 81,0 |
| PIE → inglés (strict) | 88,7 |
| Diálogo (strict) | 87,1 |

La model card reporta además que los modelos frontera evaluados (Claude Opus 5.5 en modo xhigh y GPT-6.1 Sol en modo high) pierden entre 25 y 37 puntos al pasar de evaluación laxa a estricta, mientras que Wekwos-120B solo pierde 2,3 puntos. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el build MLX oQ5e ocupa 84,8 GB en disco; en memoria unificada de Apple Silicon necesita al menos ese tamaño más overhead, por lo que se recomienda un Mac con 128 GB o más de memoria unificada.
- GPU recomendadas: para el merge BF16 se requiere un entorno multi-GPU de clase A100/H100; para el build GGUF cuantizado, GPUs con 24-48 GB de VRAM según el nivel de cuantización (Q3_K_M y Q4_K_M son las opciones más asequibles).
- Cabe en consumer GPU: solo en configuraciones de gama alta; con Q3_K_M o Q4_K_M puede ejecutarse en GPUs de 24 GB, y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: MLX en Apple Silicon (build principal), llama.cpp, LM Studio y Ollama (GGUF), vLLM y SGLang (BF16), y PEFT para el adaptador LoRA.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en PIE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wekwos-120B | 120,7 B totales / 12 B activos | no disponible | Strict 86,2 / Lenient 88,5 | NVIDIA Nemotron Open Model License | Hugging Face (MLX, GGUF, BF16, LoRA) |
| Claude Opus 5.5 (xhigh) | no disponible | no disponible | Fallo en modo strict en los tres ejemplos publicados; acierto en modo lenient | propietaria | API |
| GPT-6.1 Sol (high) | no disponible | no disponible | Fallo en modo strict en los tres ejemplos publicados; acierto en modo lenient | propietaria | API |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B (base) | 120 B totales / 12 B activos | no disponible | No evaluado en el benchmark PIE en la información disponible | NVIDIA Nemotron Open Model License | Hugging Face |

No se dispone de otros modelos abiertos especializados en protoindoeuropeo con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste está orientado a PIE y a inglés; no se documentan capacidades generales de razonamiento, código o matemáticas, y el uso fuera de su dominio probablemente degrada respecto al modelo base.
- Riesgo de alucinación morfológica: aunque el benchmark retenido muestra una puntuación estricta alta, el modelo puede fabricar raíces o paradigmas plausibles pero incorrectos, especialmente fuera de las formas cubiertas por el corpus y el motor gramatical.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La evaluación de traducciones y diálogos depende de jueces automáticos (Claude Opus 5.5 y GPT-6.1 Sol), lo que introduce sesgos del juez en la medición.
- Licencia NVIDIA Nemotron Open Model License: es una licencia "other" con términos específicos de NVIDIA; conviene revisar las restricciones de uso comercial y de redistribución antes de desplegar en producción.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o corpus largos sin verificación previa.
- Idiomas soportados limitados a `ine` y `en`; no hay soporte multilingüe general.
- El build principal está pensado para Apple Silicon/MLX; el despliegue en GPU NVIDIA requiere el merge BF16 o los GGUF, con requisitos de memoria considerablemente mayores.
- Comunidad muy pequeña (50 descargas, 0 likes en el momento de la ficha): menor probabilidad de soporte, correcciones o validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/disinfozone/wekwos-120b
- Build GGUF: https://huggingface.co/disinfozone/wekwos-120b-GGUF
- Merge BF16: https://huggingface.co/disinfozone/wekwos-120b-bf16
- Adaptador LoRA y kit de reconstrucción: https://huggingface.co/disinfozone/wekwos-120b-lora
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Proyecto wekʷos: https://wekwos.com
- Artículo del modelo: https://wekwos.com/model
- Diccionario de 8.434 palabras: https://wekwos.com/dictionary
- Voices: https://wekwos.com/voices
- Traductor en vivo basado en reglas: https://wekwos.com/#s-apps
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
