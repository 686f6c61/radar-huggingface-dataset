# Guile/orcarouter_Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored es una version "abliterada" (refusal-removed) del modelo Qwen3.8-27B de la familia Qwen, publicada por el usuario OrcaRouter y posteriormente cuantizada a formato GGUF por bartowski bajo el repo Guile/orcarouter_Qwen3.8-27B-Uncensored-GGUF. La tecnica de abliteration elimina las direcciones del espacio latente responsables de los rechazos del modelo original, produciendo una version que no filtra contenido y que esta orientada a tareas de red teaming, evaluacion de seguridad e investigacion de alineacion.

El modelo base es un transformer denso de 27.320 millones de parametros con arquitectura hibrida de atencion: combina capas de atencion lineal Gated DeltaNet con capas de atencion completa (full attention). Incluye capacidades nativas de vision-lenguaje (procesa imagen y texto), razonamiento con modo thinking configurable, function calling y un cabezal MTP (Multi-Token Prediction) para decodificacion especulativa. La cuantizacion GGUF, realizada con llama.cpp b10630 y optimizada con imatrix, ofrece 16 niveles de precision que van desde bf16 (54,66 GB) hasta Q3_K_L (15,28 GB), lo que permite desplegarlo en hardware variado.

Su relevancia actual reside en combinar capacidades multimodales y de razonamiento con una licencia Apache 2.0 y un formato GGUF ampliamente compatible, lo que lo hace util para equipos de seguridad ofensiva, investigadores de alineacion y desarrolladores que necesitan un modelo local sin filtros de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (Gated DeltaNet lineal + atencion completa) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q3_K_XL, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo mmproj para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,3B parametros con atencion hibrida: intercala capas de atencion lineal Gated DeltaNet con capas de atencion completa. Esta combinacion busca reducir el coste computacional en secuencias largas manteniendo la calidad de la atencion tradicional. El modelo incorpora un cabezal MTP (Multi-Token Prediction) que permite decodificacion especulativa, acelerando la generacion al predecir varios tokens por paso.

Sobre el modelo base, OrcaRouter aplico abliteration, una tecnica post-entrenamiento que identifica y elimina las direcciones del espacio latente responsables de los rechazos y negativas, obteniendo una version sin filtros de contenido. La cuantizacion GGUF fue realizada por bartowski con llama.cpp en su release b10630, aplicando imatrix (importance matrix) para minimizar la perdida de calidad en los pesos cuantizados. El repo incluye el proyector de vision (mmproj) integrado en cada archivo, de modo que no es necesario descargar componentes adicionales para procesar imagenes.

Los detalles del entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto con modo de razonamiento configurable: el prompt de sistema permite ajustar el "reasoning effort" desde niveles bajos hasta xhigh, controlando la profundidad del pensamiento previo a la respuesta.
- Comprension de imagenes (vision-lenguaje): el archivo mmproj incluido en cada cuantizacion permite procesar entradas de imagen junto con texto.
- Function calling / tool calling: soporte para invocar herramientas externas, integrable en pipelines agente.
- Decodificacion especulativa MTP: acelera la inferencia prediciendo multiples tokens por paso.
- Multilingue: soporte nativo para ingles y chino.
- Respuestas sin censura: al estar abliterado, no aplica filtros de rechazo; disenado para red teaming y evaluacion de moderacion.

## Casos de uso

- Red teaming de sistemas de moderacion: el modelo genera respuestas que otros LLM rechazarian, permitiendo a equipos de seguridad evaluar la robustez de filtros de contenido en produccion y detectar bypass en pipelines de moderacion.
- Investigacion de alineacion y seguridad: comparar el comportamiento de un modelo con y sin capas de rechazo ayuda a identificar que mecanismos internos sostienen la seguridad y como restaurarlos o reforzarlos.
- Asistente multimodal local sin filtros: al ser GGUF con soporte de vision, puede desplegarse en local para describir imagenes, analizar documentos escaneados o procesar capturas de pantalla, sin depender de APIs externas ni de moderacion en la nube.
- Agentes con tool calling en entornos controlados: su soporte de function calling permite construir agentes que interactuan con APIs, bases de datos o ejecutan comandos en sandboxes, con licencia Apache 2.0 para uso comercial.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material donde los filtros de seguridad de otros modelos bloquean respuestas, siempre en contextos legales y con supervision.
- Evaluacion de impacto de cuantizacion: los 16 niveles disponibles permiten medir como degrada cada cuantizacion la calidad de razonamiento y vision, informando decisiones de despliegue en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M ocupa 17,77 GB, por lo que se necesitan al menos 20 GB de VRAM para cargarlo completo en GPU. La version Q3_K_L (15,28 GB) puede caber en GPUs de 16 GB con margen reducido. La version bf16 (54,66 GB) requiere aproximadamente 60 GB de VRAM.
- GPU recomendadas por cuantizacion: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; A100 40 GB o H100 para Q8_0 (29,12 GB) y bf16; GPUs Apple Silicon con 32 GB o mas de memoria unificada pueden ejecutar la version MLX publicada por OrcaRouter.
- En consumer GPU: si, la RTX 4090 ejecuta sin problemas las cuantizaciones Q4 y Q5. Para Q8_0 se requiere una GPU profesional o configuracion multi-GPU.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (build oficial disponible), MLX para Apple Silicon, y cualquier motor compatible con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no disponible en la informacion proporcionada. La decodificacion especulativa MTP deberia mejorar el throughput respecto a un modelo equivalente sin ella, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored (OrcaRouter) | 27,3B | si | Apache 2.0 | GGUF, MLX, FP8 | Abliterado, sin filtros |
| Qwen3.8-27B (original) | 27,3B | si | Apache 2.0 | safetensors | Modelo base con capas de rechazo intactas |
| Qwen2.5-VL-27B | 27B | si | Apache 2.0 | safetensors, GGUF | Generacion anterior de Qwen con vision |

Nota: no se dispone de benchmarks publicados que permitan una comparacion cuantitativa rigurosa. La comparativa se limita a caracteristicas estructurales y de licencia. Los datos de contexto y rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El abliteration elimina los rechazos de seguridad: el modelo puede generar contenido peligroso, ilegal, danino o sesgado sin filtro alguno. No debe usarse en produccion sin capas de moderacion externas o supervision humana.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos, citas o datos. La ausencia de capas de seguridad no mejora la factualidad.
- Idiomas limitados: solo ingles y chino de forma nativa. Otros idiomas pueden funcionar con calidad degradada.
- Longitud de contexto no documentada: se recomienda verificar el limite de contexto antes de usarlo con secuencias largas o documentos extensos.
- Perdida de calidad por cuantizacion: los niveles Q3 y Q4 pueden degradar el razonamiento complejo y la precision en tareas de codigo o matematicas.
- Riesgos legales y reputacionales: aunque la licencia Apache 2.0 permite uso comercial, la naturaleza "uncensored" del modelo implica responsabilidad legal segun el caso de uso y la jurisdiccion.
- Restriccion de uso: el creador lo etiqueta para ai-red-team y red-teaming; su despliegue en aplicaciones orientadas al usuario final es desaconsejable.
- El repo no tiene descargas ni likes registrados, lo que sugiere que es un build reciente sin validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace (cuantizacion GGUF): https://huggingface.co/Guile/orcarouter_Qwen3.8-27B-Uncensored-GGUF
- Modelo base OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio GGUF de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Build de Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Blog de OrcaRouter sobre la version GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Articulo de explainx.ai sobre la version MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Cuantizacion GGUF alternativa: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF
