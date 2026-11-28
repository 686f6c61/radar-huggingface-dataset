# SceneWorks/lens-candle

## Resumen

lens-candle es una conversión nativa para Candle (el framework de inferencia en Rust de Hugging Face) del modelo SceneWorks/lens-mlx, que a su vez es un fine-tune de microsoft/Lens. El repositorio publica los pesos en formato GGML/GGUF por bloques cuantizados, pensados para su uso con el motor de inferencia de SceneWorks en Windows y Linux, mientras que las variantes MLX quedan reservadas para macOS. El autor es SceneWorks y la licencia es MIT.

El modelo base, microsoft/Lens, es un transformer con una pila de 48 bloques de expertos (MoE) en el codificador de texto, cuyos pesos nativos vienen en MXFP4. Esta conversión ofrece dos niveles de cuantización: q4, obtenido de forma sin pérdida a partir del tier MLX q4, y q8, cuantizado a Q8_0 desde los pesos bf16 del transformer, con los expertos del codificador de texto también en Q8_0 a partir de los MXFP4 originales.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribución de pesos para un runtime concreto, con cero descargas y sin model card técnica detallada. No se publican parámetros totales, longitud de contexto, idiomas ni resultados de benchmarks, por lo que la evaluación funcional del modelo debe remitirse a la documentación de microsoft/Lens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pila de 48 bloques de expertos (MoE) en el codificador de texto; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (Q4_1, conversion sin perdida desde MLX q4) y q8 (Q8_0 desde bf16; expertos del text encoder Q8_0 desde MXFP4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF/GGML por bloques (U8 `{base}.weight` con forma [out, in/32, block_bytes]); libreria candle |

## Arquitectura y entrenamiento

La model card describe únicamente el proceso de conversión, no el entrenamiento. El modelo base microsoft/Lens es un transformer con un codificador de texto que contiene 48 bloques de expertos en una arquitectura de mezcla de expertos (MoE); los pesos originales de esos expertos se distribuyen en MXFP4 y el modelo base no incluye expertos en bf16. El transformer del que se parte para q8 es el bf16 de SceneWorks/lens-mlx en el commit 4e1349c1.

La innovación técnica de este repositorio es de empaquetado: cada capa lineal cuantizada se almacena como un único tensor U8 de nombre `{base}.weight` con forma [out, in/32, block_bytes], y el `config.json` declara `quantization: {bits, storage: ggml}`. La conversión se realizó con `candle_gen::ggml_tier` del proyecto SceneWorks/inference. No se especifican tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de texto y modelado de lenguaje: heredadas del modelo base microsoft/Lens; el alcance exacto no está documentado en esta ficha.
- Procesamiento multimodal o de visión: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Ejecución nativa en Candle sobre Windows y Linux con los tiers GGML publicados.

## Casos de uso

- Despliegue en producción sobre Windows y Linux con Candle: el repositorio está pensado explícitamente para el motor de inferencia de SceneWorks en estas plataformas, de modo que equipos con stack Rust pueden servir el modelo sin depender de Python.
- Inferencia en memoria reducida con el tier q4: al ser una conversión sin pérdida desde MLX q4, permite ejecutar el modelo con menor huella de VRAM que la variante q8 manteniendo el mismo resultado numérico que el tier MLX de origen.
- Evaluación de calidad con el tier q8: al cuantizarse desde bf16 (y los expertos desde MXFP4), sirve como referencia de mayor fidelidad para comparar degradación frente a q4 en tareas concretas.
- Integración en pipelines de CI para validación de pesos: el formato por bloques con `config.json` que declara bits y almacenamiento GGML facilita comprobaciones automatizadas de forma y tipo de tensor.
- Investigación sobre cuantización de MoE: la doble procedencia de los pesos (Q8_0 desde bf16 en el transformer y desde MXFP4 en los 48 stacks de expertos) permite estudiar el impacto de cuantizar expertos nativamente en 4 bits frente a hacerlo desde bf16.
- Distribución multiplataforma con tiers separados: usar lens-candle en Windows/Linux y los tiers MLX en macOS dentro de un mismo producto, manteniendo coherencia de pesos entre plataformas.
- Replicación del pipeline de conversión: el uso de `candle_gen::ggml_tier` documenta un flujo reproducible para convertir tiers MLX a GGML, reutilizable con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión porque se desconoce el número de parámetros. Como referencia de orden de magnitud, el repositorio ocupa 49,9 GB e incluye varios tiers; un tier q4 de un modelo de ese tamaño requeriría del orden de 25 GB y un tier q8 del orden de 50 GB, sin contar overhead de activaciones ni caché KV.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmable sin conocer el recuento de parámetros; con 49,9 GB de repo, los tiers q8 difícilmente caben en GPU de consumo de 24 GB.
- Opciones de despliegue: Candle (librería declarada) mediante el motor de SceneWorks/inference; compatibilidad con vLLM, llama.cpp, Ollama o TGI no está indicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/lens-candle | no disponible | no disponible | safetensors + GGUF/GGML (candle) | MIT | Conversion para Candle, tiers q4 y q8 |
| SceneWorks/lens-mlx | no disponible | no disponible | MLX (q4 y bf16) | no disponible en esta ficha | Origen de la conversion; orientado a macOS |
| microsoft/Lens | no disponible | no disponible | no disponible | no disponible en esta ficha | Modelo base; expertos nativos en MXFP4 |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación funcional: no se declaran idiomas, contexto, parámetros ni capacidades, lo que impide evaluar el modelo sin consultar la documentación de microsoft/Lens.
- Artefacto de conversión, no de entrenamiento: los pesos derivan de SceneWorks/lens-mlx en un commit concreto (4e1349c1); cambios posteriores en el upstream no se reflejan.
- Repositorio de 49,9 GB: el almacenamiento y la transferencia son costosos, y conviene descargar solo el tier necesario.
- Dependencia de runtime: el formato por bloques con `quantization: {bits, storage: ggml}` está pensado para Candle y el motor de SceneWorks; otros runtimes pueden no interpretarlo.
- Los expertos del codificador de texto no proceden de bf16 sino de MXFP4, por lo que la fidelidad de q8 en esas capas es relativa a una fuente ya cuantizada en 4 bits.
- Sin descargas ni likes: no hay evidencia de uso en producción ni validación comunitaria.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en esta ficha.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base microsoft/Lens antes de redistribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/lens-candle
- Modelo base: https://huggingface.co/microsoft/Lens
- Modelo de origen de la conversión: https://huggingface.co/SceneWorks/lens-mlx (commit 4e1349c1962950eee328c69537904631ebc64283)
- Proyecto de inferencia referenciado: SceneWorks/inference (no se proporciona URL)
- Candle (framework): https://github.com/huggingface/candle
