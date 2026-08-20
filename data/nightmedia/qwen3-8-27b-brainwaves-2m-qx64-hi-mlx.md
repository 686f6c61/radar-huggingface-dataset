# nightmedia/Qwen3.8-27B-Brainwaves-2M-qx64-hi-mlx

## Resumen

El modelo `nightmedia/Qwen3.8-27B-Brainwaves-2M-qx64-hi-mlx` es una variante experimental de la familia Qwen3.8, desarrollada por el usuario nightmedia mediante técnicas de fusión (merge) y adaptación sobre varios modelos base de Qwen (Qwen3.6-27B y Qwen3.8-27B). Se distribuye en formato MLX con cuantización qx64 y acceso restringido en HuggingFace. Está orientado a tareas de razonamiento, generación de texto, escritura creativa, roleplaying y análisis matemático, con soporte multimodal (imagen y texto) según el pipeline declarado.

La relevancia de este modelo radica en que combina la arquitectura híbrida de atención del Qwen3.8-27B (mezcla de atención completa y lineal) con ajustes adicionales mediante SFT, LoRA y destilación, apuntando a un equilibrio entre rendimiento y eficiencia en hardware local. Aunque no se han publicado benchmarks específicos para esta variante, el modelo base Qwen3.8-27B reporta resultados destacados en tareas de agente, ofimática y visión, lo que sugiere capacidades similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + atencion lineal con estado recurrente) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) segun el modelo base; los tags indican 256K y 1M |
| Tipos de cuantizacion | bf16, qx64 (formato MLX) |
| Idiomas soportados | ingles, chino, japones, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors compatible) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3.8-27B, un transformer denso con atencion hibrida: de las 64 capas, solo 16 utilizan atencion completa (con intervalo de 4), mientras que las 48 restantes emplean atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional en contextos largos sin sacrificar la calidad en tareas que requieren atencion global.

La variante Brainwaves se construye mediante merge de varios modelos base, incluyendo `nbeerbower/Wichtel-Qwen3.6-27B`, `trohrbaugh/Qwen3.8-27B-heretic-ara`, `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1` y `DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0`. Los tags indican el uso de SFT, LoRA, destilacion (probablemente de modelos tipo Claude) y tecnicas de chain-of-thought largo. El resultado es un modelo experimental orientado a razonamiento profundo, escritura creativa y roleplaying, con soporte multimodal nativo (entrada de imagen y texto).

## Capacidades

- Generacion de texto y conversacion multi-turno con instrucciones.
- Razonamiento matematico y analisis cientifico (segun el prompt de prueba publicado).
- Escritura creativa: ficcion, ciencia ficcion, generacion de tramas, continuacion de escenas y storytelling.
- Roleplaying y personajes conversacionales.
- Soporte de entrada multimodal (imagen y texto) gracias al pipeline image-text-to-text.
- Capacidades de agente y automatizacion de ofimatica (heredadas del modelo base Qwen3.8-27B).
- Generacion de codigo y tareas de programacion.
- Multilingue: ingles, chino, japones y espanol.

## Casos de uso

- Asistente de escritura creativa: el modelo puede generar tramas, dialogos y descripciones vividas, aprovechando su entrenamiento en ficcion y roleplaying. Es adecuado para autores que necesitan un copiloto de narrativa con estilo consistente.
- Analisis de documentos con contexto largo: gracias a su ventana de 262K tokens, puede procesar libros completos o informes extensos y extraer resumenes o responder preguntas sobre el contenido.
- Automatizacion de tareas de ofimatica: el modelo base destaca en office automation, por lo que esta variante puede usarse para redactar correos, generar informes o resumir actas de reuniones.
- Agente conversacional para atencion al cliente: con soporte multilingue y capacidad de mantener conversaciones largas, puede gestionar consultas de usuarios en varios idiomas.
- Generacion de codigo asistida: aunque no se han publicado benchmarks especificos, el modelo base tiene buen rendimiento en coding, por lo que puede integrarse en entornos de desarrollo como autocompletado o generacion de funciones.
- Investigacion experimental en IA: al ser un modelo de acceso restringido y naturaleza experimental, es util para estudiar tecnicas de merge, destilacion y cuantizacion en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante `Brainwaves-2M-qx64-hi-mlx`. El modelo base Qwen3.8-27B reporta los siguientes resultados en la guia de lovableapp.org:

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos corresponden al Qwen3.8-27B original, no a esta variante, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 27B, en cuantizacion de 4 bits requiere aproximadamente 16-18 GB de VRAM; en bf16 necesitaria alrededor de 54 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) puede ejecutar la version cuantizada; para bf16 se requieren A100 (80 GB) o H100.
- Compatibilidad con GPU de consumo: si, con cuantizacion qx64 o similar, cabe en tarjetas de 24 GB.
- Opciones de despliegue: al estar en formato MLX, es compatible con el ecosistema MLX de Apple Silicon; tambien puede usarse con transformers y vLLM si se convierten los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo original de Alibaba, multimodal |
| nightmedia/Qwen3.8-27B-Brainwaves-2M-qx64-hi-mlx | 27B | 262K (estimado) | Apache 2.0 | MLX | Variante merge con ajustes creativos |
| Qwen3.6-27B (base) | 27B | 256K | Apache 2.0 | safetensors | Version anterior de la familia Qwen3 |

La comparativa se limita a la familia Qwen3 por falta de datos sobre otros modelos de 27B con caracteristicas similares.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que requiere aceptar condiciones antes de su descarga.
- Naturaleza experimental: los tags indican que es un modelo de investigacion, sin garantias de estabilidad en produccion.
- Sesgos y alucinaciones: al ser un merge de multiples modelos, puede heredar sesgos de sus fuentes y generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: aunque soporta espanol, el entrenamiento principal probablemente se centra en ingles y chino, por lo que el rendimiento en espanol puede ser inferior.
- Sin benchmarks publicados: no hay evaluaciones independientes de esta variante, por lo que su rendimiento real es incierto.
- Compatibilidad: el formato MLX limita el despliegue a entornos Apple Silicon o requiere conversion a otros formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-2M-qx64-hi-mlx
- Variante mxfp8-mlx: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-mxfp8-mlx
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
