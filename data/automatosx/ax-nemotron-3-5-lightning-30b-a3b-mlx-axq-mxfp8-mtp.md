# AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP es una conversion cuantizada del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 de NVIDIA, publicada por AutomatosX. El checkpoint original es un modelo de lenguaje de tipo Nemotron-H (arquitectura hibrida con atencion y capas de estado recurrente, segun la etiqueta `nemotron_h`) con aproximadamente 31.580 millones de parametros totales y un esquema de mezcla de expertos (MoE) con unos 3.000 millones de parametros activos, a juzgar por la nomenclatura "30B-A3B". Esta variante aplica cuantizacion MXFP8 mediante el toolkit AXQuant y esta empaquetada en formato MLX para su ejecucion en hardware Apple Silicon.

El paquete incluye, ademas del backbone estandar MLX-LM (config, tokenizer, indice y safetensors), una carga separada de tensores MTP (Multi-Token Prediction) preservada byte a byte en `mtp.safetensors`. El autor advierte explicitamente de que se trata de un artefacto de desarrollo, sin certificado de calidad, y de que el soporte de ejecucion de MTP no esta verificado en MLX-LM, AX Engine, MTPLX ni oMLX.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue de un modelo NVIDIA Nemotron en ecosistema MLX con cuantizacion de 8 bits; por otro, sirve como ejemplo de buenas practicas de trazabilidad (revision inmutable del origen, digests de payload, auditorias de formato) y de sus limites, ya que el propio autor anuncia una reconstruccion futura del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (hibrida; etiqueta `nemotron_h`), transformer con mezcla de expertos |
| Parametros totales | 31.577.935.872 (aprox. 31,58 B) |
| Parametros activos | aprox. 3 B (deducido de la nomenclatura "30B-A3B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (8 bits, formato fisico AXQuant); tensores protegidos conservan su precision declarada |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` separado para el payload MTP |

## Arquitectura y entrenamiento

El modelo base es NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, de NVIDIA, etiquetado como `nemotron_h`. La familia Nemotron-H de NVIDIA combina capas de atencion con capas de estado recurrente (arquitectura hibrida) y utiliza mezcla de expertos para reducir el coste de inferencia manteniendo una capacidad alta; la nomenclatura "30B-A3B" indica aproximadamente 30.000 millones de parametros totales y 3.000 millones activos por token. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal de este repositorio es la conversion: AXQuant aplica cuantizacion MXFP8 a los pesos elegibles del backbone y preserva los tensores protegidos en su precision declarada. El paquete incluye un plan de cuantizacion y hashes de ficheros, ademas de un manifiesto (`ax_nemotron_mtp_manifest.json`) con los digests del origen y del payload MTP. Una auditoria de formato de 2026-10-06 corrigio el modo del contenedor de cuantizacion de `affine` a `mxfp8` en ambos bloques de configuracion, sin alterar los bytes de los pesos. El modelo integra tensores de Multi-Token Prediction (MTP) del checkpoint original; su ejecucion no esta soportada ni verificada por el autor en ningun runtime.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiquetas `conversational`).
- Razonamiento y generacion de codigo: capacidades esperables del modelo base Nemotron, aunque no documentadas en esta ficha.
- Multi-Token Prediction (MTP): el payload esta presente en el paquete, pero su activacion no esta verificada en MLX-LM ni en otros runtimes.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no documentadas en la informacion disponible.

## Casos de uso

- Prototipado en Apple Silicon: cargar el backbone con `mlx_lm.load` y `mlx_lm.generate` para validar respuestas conversacionales en un Mac con memoria unificada amplia, aprovechando la cuantizacion MXFP8 para reducir el peso en memoria frente al BF16 original.
- Evaluacion de cuantizacion: comparar la salida del checkpoint MXFP8 con el modelo BF16 de NVIDIA para medir la degradacion introducida por la cuantizacion en tareas de generacion y razonamiento.
- Investigacion sobre MTP: usar `mtp.safetensors` y el manifiesto de digests para experimentar con decodificacion multi-token en runtimes propios, dado que el autor no reclama soporte en MLX-LM.
- Desarrollo de pipelines MLX: integrar el modelo en aplicaciones locales de generacion de texto sobre macOS, con la advertencia de fijar un commit concreto por la reconstruccion anunciada.
- Base para conversiones adicionales: reutilizar el plan AXQuant y los hashes como referencia para producir otras cuantizaciones (por ejemplo, 4 bits) del mismo origen inmutable.
- Auditoria de artefactos: emplear `runtime_audit.json`, los hashes y los digests como ejemplo de trazabilidad en la publicacion de modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no aporta ninguna afirmacion de calidad, exactitud de MTP, velocidad ni certificacion.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 35,6 GB; el modelo tiene 31,58 B de parametros. En MXFP8 (8 bits) el backbone ronda los 30-32 GB de memoria, mas overhead de activaciones y contexto. El autor advierte de que "Super needs substantial memory".
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon con memoria unificada (series M). No hay soporte documentado para CUDA en este paquete.
- Cabe en consumer GPU: no aplicable en el sentido habitual; en Apple Silicon requiere configuraciones de memoria unificada alta (del orden de 64 GB o mas para trabajar con holgura, estimacion no confirmada por el autor).
- Opciones de despliegue: MLX-LM (carga del backbone estandar). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP | 31,58 B (aprox. 3 B activos) | no disponible | MXFP8 | OpenMDW 1.1 | safetensors MLX |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (origen) | 31,58 B (aprox. 3 B activos) | no disponible | BF16 | OpenMDW 1.1 | safetensors |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | OpenMDW 1.1 | no disponible |

## Limitaciones y advertencias

- Artefacto de desarrollo: el autor lo describe como evidencia de desarrollo, no como certificado de calidad.
- Reconstruccion anunciada: el paquete sera reconstruido con una version mejorada de AXQuant y reemplazado como nueva revision; se recomienda fijar un commit.
- Soporte MTP no verificado: el payload se preserva, pero no se reclama ejecucion en MLX-LM, AX Engine, MTPLX ni oMLX.
- Sin benchmarks ni evaluacion de calidad publicados.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente en castellano no evaluado.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado para esta variante.
- Sesgos: no documentados en la informacion disponible.
- Licencia OpenMDW 1.1: revisar sus terminos antes de uso comercial, ya que la etiqueta de Hugging Face figura como `license:other`.
- Restriccion de plataforma: el formato MLX limita el despliegue a ecosistema Apple; no hay ruta documentada para CUDA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP
- Revision original con evidencia de runtime: https://huggingface.co/AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP/tree/8e6018d4c00ac09e150a67721d415a6af32400b1
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
