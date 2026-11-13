# AmberHeart/Uni-MOPD-Merge

## Resumen

Uni-MOPD-Merge es un modelo multimodal de tipo vision-language construido sobre Qwen/Qwen3-VL-30B-A3B-Instruct, un transformer con mezcla de expertos (MoE) ya ajustado por instrucciones. Lo publica el usuario AmberHeart en el marco de un trabajo sobre destilacion multi-profesor on-policy (Uni-MOPD, "Unified Multi-Teacher On-Policy Distillation from Multimodal Specialists"). Este checkpoint concreto no es el estudiante final, sino el punto de partida: la fusion uniforme de cinco especialistas de dominio que inicializa el estudiante antes de la destilacion.

El modelo resuelve el problema de integrar capacidades de varios especialistas entrenados por separado a partir de un mismo checkpoint base. Los cinco especialistas cubren razonamiento STEM, VQA general, comprension de documentos/OCR/graficos, grounding de GUI y comprension embodied. Como todos parten del mismo modelo base, comparten arquitectura y vocabulario, lo que permite tanto la fusion en el espacio de pesos como la destilacion a nivel de token.

La relevancia es metodologica: Uni-MOPD trata el punto de arranque como una variable de diseno y demuestra que una fusion uniforme sin entrenamiento, seguida de una destilacion corta, supera el arranque desde el modelo base o desde un SFT multi-dominio. Este repositorio contiene exclusivamente la fusion (coeficiente 1/K con K=5 sobre los task vectors de cada especialista), sin entrenamiento posterior. Pesos en bfloat16 repartidos en 13 shards safetensors, con 31.070.754.032 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE vision-language (Qwen3-VL-30B-A3B) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 13 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-30B-A3B-Instruct: un transformer con mezcla de expertos orientado a tareas de imagen-texto a texto, con un procesador multimodal (`AutoProcessor`) y la clase `Qwen3VLMoeForConditionalGeneration` de transformers (requiere `transformers>=4.57.1`). El checkpoint se obtiene por fusion en el espacio de pesos: cada especialista aporta su task vector respecto al checkpoint base compartido, y la fusion aplica el mismo coeficiente 1/K con K=5 a todos ellos. No hay entrenamiento tras la fusion, por lo que este repositorio representa unicamente la inicializacion del estudiante.

Los cinco especialistas de origen (STEM, VQA, OCR/documentos, GUI y embodied) se post-entrenaron desde el mismo checkpoint base siguiendo rutas distintas, cada una terminando en aprendizaje por refuerzo sobre su propio dominio. El pipeline completo Uni-MOPD combina esta fusion uniforme con una destilacion on-policy corta: el estudiante genera respuestas a consultas de entrenamiento y el profesor del dominio correspondiente las supervisa, con muestreo uniforme de dominios y KL inversa sobre el vocabulario completo. Este checkpoint no incluye esa fase de destilacion.

## Capacidades

- Generacion de texto e imagen-texto a texto en modo conversacional (pipeline `image-text-to-text`).
- Razonamiento STEM heredado del especialista de razonamiento cientifico-matematico.
- Respuesta visual a preguntas (VQA) de caracter general.
- Comprension de documentos, OCR y lectura de graficos.
- Grounding de interfaces graficas (GUI), orientado a localizacion de elementos.
- Comprension embodied (escenas y agentes en entornos).
- Soporte de plantillas de chat mediante `apply_chat_template` con contenido multimodal (imagen + texto).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Punto de partida para destilacion multi-profesor: este checkpoint se usa como inicializacion del estudiante Uni-MOPD antes de la fase corta de destilacion on-policy; es su proposito declarado y el unico caso documentado por el autor.
- Investigacion en model merging: sirve para reproducir y analizar la fusion uniforme de task vectors de cinco especialistas sobre un mismo base, comparando contra arranques desde el base o desde SFT multi-dominio.
- Analisis de interferencia entre dominios: al fusionar razonamiento STEM, VQA, OCR, GUI y embodied con el mismo coeficiente, permite estudiar que capacidades se degradan o se conservan antes de la destilacion.
- Evaluacion comparativa de especialistas: al compartir arquitectura y vocabulario con los cinco profesores, facilita experimentos controlados de transferencia entre dominios.
- Base para experimentos de KL inversa y muestreo de dominios: el checkpoint permite aislar el efecto de la receta de destilacion (uniforme frente a ponderada) partiendo de un estado identico.
- Referencia para pipelines multimodales en transformers: el snippet de la model card valida el flujo `AutoProcessor` + `Qwen3VLMoeForConditionalGeneration` con entrada imagen-texto, util para integrar el modelo en prototipos de inferencia.
- No se recomienda su uso directo en produccion: al no haber pasado por la destilacion, sus capacidades integradas no estan validadas y el autor no publica evaluaciones de este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 31.070.754.032 parametros en bfloat16, los pesos ocupan aproximadamente 62 GB (coincide con el tamano del repo de 62,1 GB); a eso hay que sumar cache KV y activaciones. En cuantizacion de 8 bits el peso rondaria los 31 GB y en 4 bits unos 16 GB, aunque el autor no publica conversiones ni validacion de cuantizacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de pesos, la inferencia en bfloat16 requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- Cabe en GPU de consumo: no en bfloat16. Solo seria viable con cuantizacion agresiva (4 bits) en GPUs de 24 GB, sin datos del autor que lo confirmen.
- Opciones de despliegue: transformers >= 4.57.1 con `device_map="auto"` segun la model card; vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Uni-MOPD-Merge | 31.070.754.032 | no disponible | Apache 2.0 | Hugging Face (AmberHeart) | Fusion uniforme de 5 especialistas, sin destilacion |
| Qwen/Qwen3-VL-30B-A3B-Instruct | no disponible | no disponible | no disponible | Hugging Face (Qwen) | Modelo base del que parten todos los especialistas |
| Uni-MOPD | no disponible | no disponible | no disponible | Hugging Face (AmberHeart) | Estudiante final tras la destilacion on-policy |
| Uni-MOPD-Teacher-STEM / VQA / OCR / GUI / Embodied | no disponible | no disponible | no disponible | Hugging Face (AmberHeart) | Los cinco especialistas de dominio fusionados |

## Limitaciones y advertencias

- Este checkpoint no es un modelo final: es la inicializacion del estudiante, sin la fase de destilacion que integra las capacidades. Su rendimiento real no esta documentado.
- Riesgo de interferencia entre dominios: la fusion uniforme con coeficiente 1/5 sobre cinco task vectors puede producir degradacion en tareas especificas frente a cada especialista individual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado por el autor; aplican los riesgos generales de los modelos vision-language.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; conviene revisar `LICENSE` y `NOTICE` del repositorio para la declaracion de modificaciones.
- Sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad ni reportes independientes.
- Requiere `transformers>=4.57.1`; versiones anteriores no cargaran la clase `Qwen3VLMoeForConditionalGeneration`.
- Para uso en produccion se deberia emplear el estudiante Uni-MOPD o los especialistas, no esta fusion intermedia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Merge
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Estudiante final: https://huggingface.co/AmberHeart/Uni-MOPD
- Especialista STEM: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Especialista VQA: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-VQA
- Especialista OCR: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR
- Especialista GUI: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-GUI
- Especialista embodied: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
- Paper, blog o demo: no disponibles en la informacion proporcionada.
