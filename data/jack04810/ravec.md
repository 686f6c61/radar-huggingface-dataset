# Jack04810/RAVEC

## Resumen

RAVEC-3B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario Jack04810, obtenido mediante ajuste fino por refuerzo (reinforcement learning) sobre Qwen2.5-VL-3B-Instruct. Se publica como el checkpoint principal verificado asociado a la Tabla 2 del trabajo RAVEC, un artículo que no está enlazado en la informacion disponible. El modelo está orientado a tareas de razonamiento visual y matemático, como indican los diez benchmarks reportados (Geometry3K, MathVista, We-Math, MathVerse, LogicVista, MMMU-Pro, MathVerse-V, C-VQA-Real, MARS-Bench y POPE).

Es relevante porque ofrece un checkpoint de 3B parámetros con licencia de investigación de Qwen, lo que permite experimentar con razonamiento multimodal en hardware moderado, aunque su uso comercial está restringido. La arquitectura subyacente es la de Qwen2.5-VL, un transformer multimodal con visión y lenguaje, y el contexto máximo depende de la configuración del modelo base (no se especifica en la información disponible).

El repositorio ocupa 8,1 GB y contiene únicamente el checkpoint de 3B (F0, step 175). El checkpoint de 7B asociado a la Tabla 2 (M1, step100 Actor) no se incluye y permanece en el servidor original de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL), vision + lenguaje |
| Parametros totales | 3B (aproximado, según el nombre del checkpoint y el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas image-text-to-text. Sobre esa base, RAVEC aplica un proceso de reinforcement learning cuyo detalle (algoritmo, función de recompensa, número de pasos, composición del dataset) no se describe en la información proporcionada. El checkpoint liberado corresponde al paso 175 de la variante F0.

La model card indica que metadatos antiguos usaban las etiquetas `EMA_G3R` / `EMA` para referirse a este mismo export, y que los archivos liberados coinciden byte a byte con el manifiesto original del checkpoint, cuyos hashes SHA-256 se registran en `RAVEC-3B/checkpoint_manifest.json`. El export se realizó con Transformers 4.51.3. No se detalla si hubo DPO, RLHF clásico u otra variante de optimización, ni el volumen de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imagen y texto.
- Razonamiento matemático visual: evaluado en Geometry3K, MathVista, We-Math, MathVerse y MathVerse-V.
- Razonamiento lógico-visual: evaluado en LogicVista y MMMU-Pro.
- Comprensión visual de preguntas y respuestas: evaluado en C-VQA-Real.
- Razonamiento multi-paso y de benchmark tipo MARS-Bench.
- Detección y grounding de objetos: evaluado en POPE.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Resolución de problemas de geometría a partir de diagramas: el modelo está evaluado en Geometry3K y puede usarse para interpretar figuras y resolver ejercicios paso a paso en entornos educativos.
- Tutoría matemática multimodal: con resultados en MathVista y MathVerse, es adecuado para sistemas que reciben una imagen de un problema y devuelven una explicación razonada.
- Verificación de razonamiento lógico-visual: útil en pipelines de evaluación automática de ejercicios con LogicVista y MMMU-Pro como referencia de capacidad.
- Detección y localización de objetos en imágenes: el resultado en POPE (87,98) sugiere uso en tareas de grounding y respuesta sobre presencia de objetos.
- Investigación en reinforcement learning multimodal: al ser un checkpoint RL verificado con manifiesto de hashes, sirve como base reproducible para experimentos académicos.
- Prototipado de asistentes visuales de bajo coste: con 3B parámetros y pesos safetensors, puede desplegarse en una GPU consumer para demos y pruebas de concepto.
- Evaluación comparativa de modelos multimodales pequeños: sirve como referencia en tablas de benchmarks de razonamiento visual matemático.

## Benchmarks y rendimiento

Resultados reportados por el autor (Avg@8, porcentajes; Avg es la media equiponderada de los diez benchmarks):

| Benchmark | RAVEC-3B |
|---|---:|
| Geometry3K | 33,28 |
| MathVista | 59,78 |
| We-Math | 61,68 |
| MathVerse | 57,43 |
| LogicVista | 41,67 |
| MMMU-Pro | 28,38 |
| MathVerse-V | 54,44 |
| C-VQA-Real | 66,54 |
| MARS-Bench | 53,05 |
| POPE | 87,98 |
| Avg | 54,42 |

No se aportan resultados de modelos comparables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 3B en safetensors en FP16 se requieren aproximadamente 6-8 GB solo para pesos, más memoria para el codificador visual y el KV cache.
- GPU recomendadas: no especificadas; por tamaño, cabría en GPUs consumer con suficiente VRAM.
- ¿Cabe en GPU consumer? Sí, previsiblemente en modelos con 12 GB o más de VRAM, aunque el dato no está confirmado en la información proporcionada.
- Opciones de despliegue: transformers (versión que soporte Qwen2.5-VL, el export usó 4.51.3); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RAVEC-3B | 3B | no disponible | Qwen Research | Hugging Face (Jack04810/RAVEC) |
| Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible | Qwen Research | Hugging Face (Qwen/Qwen2.5-VL-3B-Instruct) |
| Alternativas adicionales | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: restringe el uso comercial; es imprescindible revisar `RAVEC-3B/LICENSE` y `RAVEC-3B/NOTICE` antes de cualquier despliegue productivo.
- Solo se libera el checkpoint de 3B; el de 7B (M1, step100 Actor) no está incluido, lo que limita la reproducibilidad completa del artículo.
- No se documentan sesgos conocidos, tasa de alucinación ni cobertura idiomática.
- Los resultados son Avg@8 y pueden no reflejar el comportamiento en una sola generación; el rendimiento en producción puede diferir.
- El modelo está afinado para benchmarks de razonamiento visual matemático; su generalización a otros dominios no está validada en la información disponible.
- Requiere una versión de Transformers compatible con Qwen2.5-VL; el export se realizó con 4.51.3.
- Algunos benchmarks tienen puntuaciones bajas (Geometry3K 33,28; MMMU-Pro 28,38), lo que indica margen de mejora en tareas complejas.

## Enlaces

- Hugging Face: https://huggingface.co/Jack04810/RAVEC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia: https://huggingface.co/Jack04810/RAVEC/blob/main/RAVEC-3B/LICENSE
