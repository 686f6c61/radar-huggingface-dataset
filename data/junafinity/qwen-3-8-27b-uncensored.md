# junafinity/Qwen-3.8-27B-Uncensored

## Resumen

Qwen-3.8-27B-Uncensored es una compilación derivada del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario junafinity bajo la marca VeriSafe.Live. No se trata de un ajuste fino ni de un entrenamiento adicional: es una edición directa de pesos mediante la técnica de *abliteration*, que ortogonaliza la dirección de rechazo en un subconjunto de tensores del modelo base. El resultado es un checkpoint estándar de Hugging Face (~52 GB en bf16) que conserva la arquitectura, la visión y las cabezas `mtp.*` del original, sin sobrecoste en inferencia.

El modelo resuelve un problema específico de investigación: medir el techo real de capacidad de un modelo cuando se eliminan sus rechazos aprendidos. La premisa del autor es que el entrenamiento de seguridad suprime la *manifestación* de una capacidad, no la capacidad en sí, por lo que un modelo abliterado sirve como mitad de tratamiento en un par controlado frente al base original. Con 27.781.427.952 parámetros reales (según safetensors) y licencia Apache 2.0, se posiciona como instrumento para *red teaming*, evaluación de pilas defensivas y trabajo de interpretabilidad.

La relevancia actual radica en su enfoque metodológico: al ser una edición rank-1 especificada sobre un tramo de capas conocido, permite comparaciones limpias base-vs-abliterado, algo que los fine-tunes convencionales no ofrecen con la misma claridad experimental. El modelo base referenciado (Qwen3.8-27B) no está verificado en la información proporcionada, por lo que los datos de arquitectura y entrenamiento del padre se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen/Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (control); 8-bit MLX en repo hermano; 4-bit/g64 mixto en cabeza MTP opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con pipeline `image-text-to-text`, heredado íntegramente del base Qwen/Qwen3.8-27B. La modificación aplicada es una proyección rank-1 eliminada de un subconjunto de tensores que escriben en el residual del modelo de lenguaje, ortogonalizando la dirección de rechazo. No hay entrenamiento por gradiente, LoRA, adaptador ni destilación: los tensores son los originales de Qwen con esa edición puntual. Se conservan la torre de visión y las cabezas `mtp.*` (multi-token prediction) del padre, lo que sugiere decodificación especulativa nativa disponible.

El proceso de abliteración actúa sobre un tramo de capas conocido y especificado, lo que convierte al par (base, abliterado) en un control experimental limpio para estudiar el rechazo residual. El autor advierte que la abliteración elimina una dirección, no una política: sobreviven algunos rechazos por reafirmación multi-turno, direccionamiento mediante system prompt y rutas de visión. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen3.8-27B.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), con torre de visión en bf16.
- Decodificación especulativa mediante cabezas `mtp.*` nativas, con cabeza draft opcional publicada aparte.
- Capacidad de cumplimiento sin rechazos en dominios que el base declinaría, útil para medición de techo de capacidad.
- Razonamiento y generación en dominios sensibles (seguridad, exploits, contenido restringido) sin las supresiones del modelo original.
- Compatibilidad con endpoints (`endpoints_compatible` en tags), lo que facilita despliegue como servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y uso de agentes: no disponible explícitamente en la información, aunque se heredarían del base si este los soporta.

## Casos de uso

- **Red teaming automatizado**: el modelo actúa como objetivo no renuente en bucles de ataque, aislando el control bajo prueba (inyección de prompt, abuso de herramientas, exfiltración de datos) sin que rechazos irrelevantes detengan el ciclo.
- **Medición de techo de capacidad**: emparejado con el base original, permite acotar superiormente lo que los pesos pueden producir en un dominio, independientemente de los rechazos publicados.
- **Evaluación de pilas defensivas**: al no contribuir con rechazos propios, prueba filtros de entrada, clasificadores de salida, defensas anti-inyección y APIs de moderación para encontrar huecos en el plano de control defensivo.
- **Generación de datos etiquetados para moderación**: produce completaciones para entrenar o evaluar modelos de detección de abuso y clasificación de salida, con la ventaja de no bloquear las muestras negativas necesarias.
- **Interpretabilidad del rechazo residual**: al ser una edición rank-1 especificada sobre capas conocidas, sirve para estudiar qué rechazos sobreviven y por qué (multi-turno, system prompt, visión).
- **Investigación multimodal sin restricciones**: análisis de imágenes y texto conjunto en escenarios donde el base declinaría, con la torre de visión intacta en bf16.
- **Despliegue local en Apple Silicon**: mediante el repo hermano de 8 bits MLX (~28 GB), para experimentación en estaciones Mac con memoria unificada amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este checkpoint de control no es una SKU de velocidad y no publica tok/s. Tampoco se reporta la ganancia de aceptación de la cabeza MTP opcional en prompts difíciles, que queda como no medida.

## Requisitos de hardware

- VRAM estimada en bf16: ~52 GB de pesos, más overhead de activaciones y caché KV; se recomienda GPU de 80 GB para margen cómodo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o multi-GPU con sharding para bf16.
- Cuantización 8-bit MLX: ~28 GB, viable en Apple Silicon con memoria unificada de 32 GB o superior (visión en bf16, `mtp.*` descartado por `mlx-vlm`).
- Consumer GPU: no cabe en bf16 en RTX 4090 (24 GB); requeriría cuantización agresiva no publicada en la información disponible.
- Opciones de despliegue: `transformers` (formato nativo), `mlx-vlm` para Apple Silicon; vLLM, llama.cpp, Ollama y TGI no se confirman en la información, aunque el tag `endpoints_compatible` sugiere compatibilidad con servicios de endpoints.
- Latencia y throughput: no disponibles; el autor no publica tok/s para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-3.8-27B-Uncensored | 27.781.427.952 | no disponible | imagen-texto | Apache 2.0 | Abliterado, control bf16, ~52 GB |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | imagen-texto | no disponible | Modelo original con rechazos; mitad de control del par |
| Qwen-3.8-27B-Uncensored-8-Bit-MLX | mismo base | no disponible | imagen-texto | Apache 2.0 | Cuantizado 8-bit MLX, ~28 GB, `mtp.*` descartado |
| qwen38-mtp-head-fc-bf16-4bit | cabeza draft | no aplica | no aplica | no disponible | Cabeza MTP opcional, ganancia de aceptación no medida |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Riesgo de seguridad**: elimina la dirección de rechazo, no la política; no debe exponerse como endpoint público sin una capa de moderación independiente.
- **Rechazos residuales**: sobreviven rechazos por reafirmación multi-turno, direccionamiento mediante system prompt y rutas de visión, lo que puede producir comportamiento inconsistente.
- **Sesgos**: no documentados en la información disponible; se heredarían los del base, no caracterizados aquí.
- **Alucinación**: no medida; sin benchmarks publicados no puede acotarse su tasa.
- **Licencia**: Apache 2.0 permite uso comercial, pero el despliegue conlleva la responsabilidad de la moderación que los guardrails originales cubrían.
- **Idiomas y contexto**: no disponibles, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- **Verificación del base**: el modelo padre Qwen/Qwen3.8-27B no está confirmado en la información proporcionada; los datos de arquitectura y entrenamiento del original quedan sin verificar.
- **Producción**: el autor exige reportar siempre el delta frente al base y re-medir sobre prompts propios; no es una SKU de velocidad ni publica tok/s.

## Enlaces

- [Hugging Face: junafinity/Qwen-3.8-27B-Uncensored](https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repo hermano 8-bit MLX](https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX)
- [Cabeza MTP opcional](https://huggingface.co/junafinity/qwen38-mtp-head-fc-bf16-4bit)
- [Colección de la familia](https://huggingface.co/collections/junafinity/qwen-38-27b-uncensored-apple-silicon-6a896c726b52be3a0b63400e)
- [VeriSafe.Live](https://verisafe.live)
- [Paper de referencia (arxiv:2406.11717)](https://arxiv.org/abs/2406.11717)
