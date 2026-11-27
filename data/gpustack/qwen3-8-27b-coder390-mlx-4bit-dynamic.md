# gpustack/Qwen3.8-27B-Coder390-MLX-4bit-dynamic

## Resumen

`gpustack/Qwen3.8-27B-Coder390-MLX-4bit-dynamic` es una cuantizacion de 4 bits mixta y dinamica, nativa para MLX, del modelo multimodal `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`. Lo publica la organizacion gpustack y esta pensado para ejecutarse en Apple Silicon mediante las librerias `mlx-lm`, `mlx-vlm` y `mlx-dspark`. El modelo conserva la torre de vision en BF16 completa e incluye un drafter especulativo `DFlash2-FP8` empaquetado en el subdirectorio `speculator/`.

El modelo base es un transformer multimodal de 27.356.728.560 parametros (unos 27,36 mil millones) orientado a generacion de codigo, razonamiento y comprension de imagenes. La cuantizacion aplica precisiones mixtas por modulo (8, 6 y 4 bits con `group_size = 64`), lo que reduce el peso del repositorio a 20,7 GB y mantiene en BF16 las capas mas sensibles (RMSNorm, encoder visual y parametros de las capas de atencion lineal).

Su relevancia practica radica en que permite desplegar un modelo multimodal de casi 27B en hardware de Apple con memoria unificada, sin renunciar por completo a la calidad del modelo original gracias al esquema de cuantizacion por capas y a la decodificacion especulativa integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`), con atencion lineal GDN y atencion estandar |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits dinamica mixta: Q8G64, Q6G64, Q4G64 y BF16 preservado; `mode = affine`, `group_size = 64` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 shards; incluye drafter `DFlash2-FP8` en `speculator/` |

## Arquitectura y entrenamiento

El modelo base combina capas de atencion estandar (`self_attn.{q,k,v,o}_proj`) con capas de atencion lineal de tipo GDN (`linear_attn.in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `out_proj`), segun la nomenclatura de modulos que aparece en `config.json`. Dispone ademas de una torre de vision (`model.visual.*`) para entrada image-text-to-text. El nombre del modelo base sugiere un pipeline de SFT con RLOO, MTP (multi-token prediction) y un drafter DFlash2 para decodificacion especulativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF/DPO en la informacion proporcionada. La cuantizacion de gpustack aplica precisiones diferenciadas: 8 bits en `embed_tokens`, `lm_head` y proyecciones `in_proj_a`/`in_proj_b` (98 modulos); 6 bits en todas las proyecciones de atencion y en las capas MLP primera y ultima (118 modulos); 4 bits en las MLP interiores y `in_proj_qkv`/`in_proj_z` (282 modulos); y BF16 en el encoder visual, RMSNorm, `A_log`, `dt_bias` y `conv1d.weight` (686 modulos).

## Capacidades

- Generacion de texto y razonamiento, con orientacion explicita a codigo (tag `coding`).
- Comprension de imagenes y respuesta image-text-to-text mediante `mlx-vlm`.
- Modo de razonamiento eficiente (`EfficientThink`, segun el nombre del modelo base).
- Decodificacion especulativa integrada mediante el drafter `DFlash2-FP8` incluido en `speculator/`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local sobre Mac: generar funciones, refactorizar y explicar codigo en Rust, Python u otros lenguajes usando `mlx_lm.generate`, aprovechando que el modelo esta optimizado para Apple Silicon y no requiere GPU dedicada.
- Revision de capturas de pantalla y diagramas tecnicos: con `mlx-vlm` se puede pasar una imagen de una interfaz o un esquema y pedir al modelo que describa el contenido o proponga codigo a partir de ella.
- Prototipado de pipelines multimodales en estaciones de trabajo Mac: el encoder visual en BF16 permite experimentar con tareas image-text-to-text sin degradar la parte de vision por la cuantizacion.
- Generacion de codigo con baja latencia en entornos de desarrollo: el drafter especulativo `DFlash2-FP8` acelera la decodificacion en tareas de autocompletado o generacion iterativa de parches.
- Educacion y aprendizaje de programacion: el modo de razonamiento eficiente del modelo base permite obtener explicaciones paso a paso de algoritmos y estructuras de datos.
- Evaluacion de modelos cuantizados: sirve como referencia para comparar la perdida de calidad entre la cuantizacion mixta de 4 bits y el modelo original en BF16, en tareas de codigo y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 20,7 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible; en la practica conviene contar con 24 GB o mas para margen de contexto y cache KV.
- Hardware objetivo: Apple Silicon (chips de la familia M). El modelo es nativo de MLX y no esta pensado para GPUs CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta publicacion; no se proporcionan requisitos para esas plataformas.
- Cabe en equipos consumer de Apple con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o superiores); no se especifican modelos concretos de chip.
- Opciones de despliegue: `mlx-lm` para texto, `mlx-vlm` para multimodal y `mlx-dspark` para la decodificacion especulativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| gpustack/Qwen3.8-27B-Coder390-MLX-4bit-dynamic | ~27,36B | no disponible | 4 bits mixta (MLX) | Apache-2.0 | Apple Silicon (MLX) |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink-...-DFlash2 (modelo base) | ~27,36B | no disponible | BF16 (original) | Apache-2.0 | no disponible |
| Otros modelos Qwen3.5 de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion de 4 bits, puede producirse una perdida de calidad frente al modelo base en BF16, especialmente en tareas de razonamiento complejo o generacion de codigo larga.
- El esquema de cuantizacion mixta preserva el encoder visual y las capas sensibles, pero el resto del modelo opera a 4 o 6 bits; conviene validar en el caso de uso concreto.
- Solo es compatible con el ecosistema MLX y Apple Silicon; no se puede ejecutar directamente en CUDA sin conversion.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de sesgo o robustez.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los pesos derivados.
- El modelo base tiene un nombre que sugiere multiples etapas de ajuste (SFT, RLOO, MTP, DFlash2); no se detallan las condiciones de entrenamiento ni los datos utilizados.
- No hay informacion sobre la longitud de contexto soportada, lo que limita la planificacion de cargas con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpustack/Qwen3.8-27B-Coder390-MLX-4bit-dynamic
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Libreria MLX: no disponible en la informacion proporcionada
- Repositorio `mlx-lm`: no disponible en la informacion proporcionada
- Repositorio `mlx-vlm`: no disponible en la informacion proporcionada
- Repositorio `mlx-dspark`: no disponible en la informacion proporcionada
