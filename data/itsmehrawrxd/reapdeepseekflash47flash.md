# ItsMehRawrXD/ReapDeepseekFlash47Flash

## Resumen

ReapDeepseekFlash47Flash es una build experimental en formato GGUF v3 del modelo GLM-4.7-Flash de Zai Org, podada y reserializada mediante el pipeline REAP (pruning de expertos en arquitecturas Mixture of Experts). El autor del repositorio, ItsMehRawrXD, publica el resultado como un unico fichero `GLM-4.7-Flash.reap.gguf` de aproximadamente 15,7 GB con 844 tensores, declarando la arquitectura `deepseek2` (MoE estilo DeepSeek-V2) en la cabecera del GGUF.

El modelo conserva 27.772.370.330 parametros totales segun los metadatos de safetensors, aunque el autor lo etiqueta como "~30B MoE". La poda REAP reduce el numero de expertos activos o totales, lo que explica que el peso final en GGUF sea notablemente inferior al de un checkpoint denso equivalente y que quepa en un unico fichero manejable en estaciones de trabajo con GPU de consumo alta.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de compresion aplicada a un modelo MoE reciente; por otro, advierte de que se trata de un artefacto experimental sin benchmarks publicados, sin model card detallada y sin garantias de fidelidad respecto al modelo base. Es util para quien quiera evaluar pipelines de pruning o probar GLM-4.7-Flash en hardware limitado, no como sustituto directo del modelo original en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo DeepSeek-V2 (`deepseek2` en GGUF), transformer con expertos |
| Parametros totales | 27.772.370.330 (27,77 B) segun safetensors; autor indica "~30B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el fichero publicado parece ser un export GGUF de precision no especificada, ~15,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF v3 (fichero unico `GLM-4.7-Flash.reap.gguf`, 844 tensores) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `zai-org/GLM-4.7-Flash`, un transformer con capas Mixture of Experts etiquetado en el GGUF como `deepseek2`, es decir, con enrutamiento de expertos al estilo DeepSeek-V2 (expertos compartidos mas expertos enrutados por token). Sobre ese checkpoint se ha aplicado el pipeline REAP, que poda expertos y reserializa los pesos restantes en un GGUF v3. No se especifican en la informacion disponible cuantos expertos se han eliminado, que criterio de importancia se ha usado ni si se ha realizado un fine-tuning de recuperacion tras la poda.

Tampoco hay datos sobre el dataset de entrenamiento original (numero de tokens, composicion, fases de RLHF/DPO) ni sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El autor solo documenta el hash sha256 del transformer de origen (`5d3c029259a97def543dd99555583cc0eeee067c34fd5713730ac518792eb6a8`) y el hecho de que el export se realizo con la herramienta REAP prune/reserialize. Cualquier afirmacion sobre calidad tras la poda debe validarse empiricamente contra el modelo base.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline declarado sugieren uso en dialogos multi-turno, aunque no hay evaluacion publicada.
- Razonamiento y codigo: se infieren del modelo base GLM-4.7-Flash, pero no estan verificados en esta build podada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse en infraestructura compatible con la API de Hugging Face Endpoints.

## Casos de uso

- Evaluacion de pipelines de pruning: comparar las salidas de esta build REAP con las del GLM-4.7-Flash original en un conjunto de prompts fijo para medir la perdida de calidad introducida por la poda de expertos.
- Despliegue en estacion de trabajo con GPU unica: el fichero GGUF de 15,7 GB permite cargar el modelo en una RTX 4090 (24 GB) o similar usando llama.cpp, algo inviable con el checkpoint completo en precision alta.
- Prototipado de asistentes conversacionales offline: al ser un unico GGUF con licencia MIT, se puede integrar en aplicaciones de escritorio o entornos sin conectividad usando `llama-cli` o `llama-server`.
- Pruebas de compatibilidad de runtimes GGUF v3: util para validar que motores como llama.cpp cargan correctamente la arquitectura `deepseek2` con el conjunto de 844 tensores exportado.
- Investigacion sobre arquitecturas MoE podadas: analizar el comportamiento de un MoE tras eliminar expertos, midiendo distribucion de carga entre expertos restantes y degradacion por dominio.
- Base para cuantizaciones posteriores: a partir del GGUF publicado se pueden generar versiones Q4_K_M o Q5_K_M para reducir aun mas el footprint y evaluar el equilibrio calidad/VRAM en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 16.820.690.400 bytes (~15,7 GB); se necesita al menos esa cantidad de VRAM o de memoria unificada, mas overhead de contexto y cache KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. En GPUs de 16 GB no cabe el fichero completo sin offloading a CPU.
- Cabe en consumer GPU: si, en RTX 4090/3090 con 24 GB, siempre que se limite la longitud de contexto y se use offloading parcial si es necesario.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF v3 que soporte la arquitectura `deepseek2`. Ollama y vLLM no estan confirmados para esta build en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ReapDeepseekFlash47Flash | 27,77 B (MoE podado) | no disponible | GGUF v3 | MIT | Build experimental REAP, sin benchmarks |
| zai-org/GLM-4.7-Flash (base) | ~30 B MoE (segun autor) | no disponible | safetensors | no disponible en esta ficha | Modelo original sin podar; referencia de calidad |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de que es una build REAP-pruned y recomienda validar las salidas contra el modelo base antes de usarlo en produccion.
- Sin benchmarks: no hay metricas publicadas de MMLU, HumanEval, GSM8K ni similares, por lo que se desconoce la degradacion real frente a GLM-4.7-Flash.
- Riesgo de alucinacion: inherente a los modelos generativos; la poda de expertos puede aumentar la perdida de conocimiento en dominios especializados.
- Idiomas no declarados: no se especifica que lenguas cubre esta build, lo que impide garantizar calidad multilingue.
- Contexto desconocido: no se documenta la longitud de contexto soportada, lo que limita su uso en tareas de contexto largo sin pruebas previas.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de GLM-4.7-Flash conviene revisar los terminos del modelo base por si imponen condiciones adicionales.
- Repositorio con 0 descargas y 1 like: sin validacion comunitaria, sin issues resueltos y sin garantia de mantenimiento.
- Cuantizacion no especificada: el GGUF publicado no indica el tipo de cuantizacion, lo que dificulta estimar la perdida de precision respecto al original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ItsMehRawrXD/ReapDeepseekFlash47Flash
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
