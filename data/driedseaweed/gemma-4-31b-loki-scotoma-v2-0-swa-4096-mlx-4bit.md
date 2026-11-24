# driedseaweed/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-mlx-4Bit

## Resumen

`driedseaweed/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-mlx-4Bit` es una cuantizacion a 4 bits en formato MLX del modelo `CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096`, un ajuste fino de la familia Gemma 4 de Google orientado a roleplay, escritura creativa y narrativa. El autor de esta version, driedseaweed, se limita a convertir los pesos originales a MLX mediante `mlx-lm` 0.31.2, sin aportar informacion adicional sobre el entrenamiento ni sobre el proceso de cuantizacion mas alla del resultado.

El modelo cuenta con 30.697.345.280 parametros (aproximadamente 30,7 mil millones) y un repositorio de 19,2 GB, coherente con pesos de 4 bits. El sufijo `Swa-4096` del nombre del modelo base sugiere sliding window attention con una ventana de 4096 tokens, aunque la model card no lo confirma explicitamente ni documenta la longitud de contexto total. La licencia declarada es Apache 2.0.

Su relevancia es practica: permite ejecutar un modelo de ~31B en hardware Apple Silicon con requisitos de memoria reducidos, algo que la version en bfloat16 dificultaria. No obstante, la informacion publicada es minima (sin benchmarks, sin idiomas declarados, sin pipeline asignado y con cero descargas), por lo que debe tratarse como un artefacto experimental de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre sugiere ventana deslizante de 4096 tokens) |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (4 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Gemma 4, segun los tags del repositorio (`gemma4`, `gemma`). El modelo base es `CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096`, un ajuste fino de la comunidad sobre Gemma 4 orientado a roleplay y escritura creativa. El sufijo `Swa-4096` apunta a sliding window attention con ventana de 4096 tokens, tecnica habitual en modelos Gemma para reducir el coste computacional en contextos largos, pero la model card no aporta confirmacion ni detalles.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas del ajuste fino. La unica informacion tecnica concreta es la conversion a MLX realizada con `mlx-lm` 0.31.2 y la cuantizacion a 4 bits. No se documenta la tecnica de cuantizacion (group size, calibracion, etc.).

## Capacidades

- Generacion de texto orientada a narrativa: roleplay, storywriting y escritura creativa, segun los tags del repositorio.
- Conversacion multi-turno con plantilla de chat (la model card usa `apply_chat_template`).
- Continuacion y desarrollo de ficcion con personajes y escenarios.
- Generacion de texto general heredada del modelo base Gemma 4 (sin detalle publicado).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar relatos, dialogos y descripciones con estilo narrativo, aprovechando el ajuste fino especifico para storywriting. Adecuado para autores que trabajan en local sobre Mac.
- Roleplay conversacional: su entrenamiento orientado a roleplay permite mantener personajes coherentes en conversaciones multi-turno, usando la plantilla de chat del tokenizer.
- Prototipado de videojuegos narrativos: generacion de dialogos de NPC y ramas argumentales en un entorno de desarrollo sobre Apple Silicon, sin depender de APIs externas.
- Generacion de contenido para campanas de rol de mesa: creacion de trasfondos, descripciones de escenas y respuestas de personajes no jugadores durante la partida.
- Experimentacion con cuantizacion MLX: sirve como caso practico para evaluar la calidad de un modelo de ~31B a 4 bits en hardware Apple, comparando con la version bfloat16 del modelo base.
- Desarrollo de herramientas locales de escritura: integracion en editores o asistentes de texto que corren en el dispositivo, con la ventaja de privacidad al no enviar datos a la nube.
- Fine-tuning posterior sobre MLX: punto de partida cuantizado para experimentos de adaptacion (LoRA) en entornos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 19,2 GB, por lo que se necesita al menos ~20 GB de memoria libre para cargar los pesos, mas overhead de KV cache y runtime.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (por ejemplo, Mac con 32 GB o mas; en configuraciones de 24 GB el margen es muy ajustado).
- GPU NVIDIA: el formato MLX no esta pensado para CUDA; para GPU NVIDIA habria que usar la version original del modelo base en otro formato.
- Cabe en GPU consumer: no en el sentido habitual (formato MLX), pero si en Macs de gama alta con memoria unificada.
- Opciones de despliegue: `mlx-lm` (libreria oficial del formato), con carga via `mlx_lm.load` y generacion via `mlx_lm.generate`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (MLX 4-bit) | ~30,7B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Conversion de comunidad, sin benchmarks |
| CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 | ~30,7B | no disponible | safetensors (bfloat16 presumiblemente) | Apache 2.0 | Modelo base del que deriva esta version |
| Gemma 4 31B (original de Google) | ~31B | no disponible en la informacion | safetensors / GGUF | licencia Gemma | Modelo generalista sin ajuste a roleplay |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion muy escasa: no hay benchmarks, idiomas declarados ni pipeline asignado; la evaluacion cualitativa queda enteramente en manos del usuario.
- Especializacion estrecha: el ajuste fino esta orientado a roleplay y ficcion, por lo que su rendimiento en tareas tecnicas, matematicas o de codigo puede degradarse respecto al Gemma 4 original.
- Riesgo de alucinacion: inherente a los modelos generativos; en narrativa puede ser aceptable, pero no es fiable para datos factuales.
- Sesgos: no documentados; al derivar de Gemma 4 y de un ajuste fino de comunidad, pueden persistir sesgos del modelo base y del dataset de ajuste.
- Restricciones de licencia: se declara Apache 2.0, pero al derivar de Gemma conviene verificar los terminos de la licencia Gemma original antes de uso comercial.
- Dependencia de plataforma: el formato MLX limita el uso a entornos Apple Silicon con `mlx-lm`; no es portable a CUDA sin conversion.
- Cuantizacion a 4 bits: puede introducir perdida de calidad respecto al modelo base en tareas sensibles; no se documenta la tecnica ni evaluaciones de degradacion.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/driedseaweed/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-mlx-4Bit
- Modelo base: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
