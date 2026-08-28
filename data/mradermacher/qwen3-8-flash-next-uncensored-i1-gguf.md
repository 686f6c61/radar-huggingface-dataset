# mradermacher/Qwen3.8-Flash-Next-Uncensored-i1-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-i1-GGUF es una cuantizacion GGUF del modelo Qwen3.8-Flash-Next-Uncensored, preparada por mradermacher. El modelo base, desarrollado por orcarouter, es una variante "uncensored" (abliterada) del Qwen3.8-Flash-Next de Alibaba, un modelo multimodal de arquitectura Qwen4 con mezcla ultra dispersa de expertos (MoE). Este modelo destaca por activar solo 6.000 millones de parametros por token, lo que lo hace notablemente eficiente para su tamano total de 125.000 millones de parametros, mas una tabla de embeddings N-gram de 51.000 millones adicionales.

La relevancia de esta ficha radica en que es la primera serie Qwen4 que puede ejecutarse localmente, con soporte para vision, function calling y razonamiento. La variante abliterada elimina los rechazos de seguridad del modelo original, orientandola a tareas de red-teaming y evaluacion de seguridad ofensiva. La cuantizacion i1 de mradermacher ofrece un unico archivo Q2_K de 80,5 GB, optimizado con imatrix para preservar la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra dispersa con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), sobre base Qwen4 |
| Parametros totales | 176.943.899.520 (incluye tabla N-gram de 51B; 125B sin ella) |
| Parametros activos | 6.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (80,5 GB); archivo imatrix de 0,7 GB para crear cuantizaciones propias |
| Idiomas soportados | ingles, chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio base) |

## Arquitectura y entrenamiento

La arquitectura combina cuatro ideas principales: Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), donde tres de cada cuatro capas usan GDN para comprimir el historial y la cuarta usa QSA para recuperacion precisa de contexto largo. Anade una tabla de embeddings N-gram de 51.000 millones de parametros que complementa los embeddings de token habituales, mejorando el modelado de patrones frecuentes. El modelo es multimodal (vision-language) y soporta multi-token prediction (MTP). La variante "uncensored" ha sido sometida a un proceso de abliteration, que elimina selectivamente las direcciones de activacion asociadas a comportamientos de rechazo, permitiendo respuestas sin restricciones de seguridad.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion i1 de mradermacher utiliza el algoritmo imatrix (importance matrix) para optimizar la asignacion de bits, priorizando las capas mas sensibles a la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento multi-step con modo thinking.
- Comprension de imagenes (vision-language) con proyeccion multimodal.
- Function calling / tool calling para integracion con APIs y agentes.
- Soporte de agentes con razonamiento encadenado (multi-step reasoning).
- Multilingue limitado a ingles y chino.
- Modelo abliterado: no aplica rechazos de seguridad, apto para red-teaming y evaluaciones ofensivas.
- Eficiencia computacional: solo 6B parametros activos por token pese a los 125B totales, con tabla N-gram paginable a SSD.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo puede generar prompts adversariales y respuestas sin filtros para evaluar la robustez de otros modelos ante ataques de jailbreak o peticiones peligrosas.
- Evaluacion de seguridad de chatbots: permite probar si un sistema comercial aplica correctamente sus politicas de contenido, generando inputs que un modelo censurado rechazaria.
- Generacion de codigo en entornos aislados: con function calling y razonamiento, puede integrarse en pipelines de CI/CD para generar y ejecutar pruebas unitarias, aunque requiere supervision humana por su naturaleza sin censura.
- Analisis de documentos con imagen y texto: su capacidad multimodal permite extraer informacion de capturas, diagramas o documentos escaneados combinados con texto.
- Investigacion academica sobre alineacion: util para estudiar el comportamiento de modelos sin restricciones y comparar la eficacia de tecnicas de seguridad.
- Despliegue local en hardware de gama alta: con 80,5 GB de cuantizacion Q2_K, puede ejecutarse en una estacion de trabajo con 2x RTX 4090 o un Mac Studio con 128 GB unificados para experimentacion offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de atomic.chat menciona que el modelo base Qwen3.8-Flash-Next se puede ejecutar desde un MacBook de 64 GB, pero no proporciona numeros concretos de MMLU, HumanEval u otras pruebas estandar. La cuantizacion Q2_K implica una perdida de precision notable respecto al modelo en bf16.

## Requisitos de hardware

- VRAM estimada: el archivo Q2_K pesa 80,5 GB, por lo que se necesitan al menos 88-96 GB de memoria total (VRAM o RAM unificada) para cargarlo completo.
- GPU recomendadas: 2x NVIDIA RTX 4090 (48 GB combinados) no son suficientes; se requieren 2x A100 80GB, 1x H100 80GB, o un Mac Studio con 128 GB de memoria unificada.
- La tabla N-gram de 51B puede paginarse a SSD, reduciendo los requisitos de RAM a costa de latencia (segun la guia de atomic.chat).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o el cliente Atomic Chat con soporte de GGUF dinamico.
- Latencia y throughput: no disponibles para esta cuantizacion especifica; la activacion de solo 6B parametros por token sugiere una velocidad de generacion superior a la de un modelo denso de 125B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B N-gram | 6B | no disponible | qwen-community-1 | safetensors |
| Qwen3.8-Flash-Next-Uncensored-i1-GGUF | 176.9B (cuantizado) | 6B | no disponible | apache-2.0 | GGUF |
| DeepSeek-V3 (referencia MoE) | 671B | 37B | 128K | MIT | safetensors |

La comparativa con DeepSeek-V3 es orientativa: ambos son MoE, pero Qwen3.8 activa muchos menos parametros (6B vs 37B), lo que lo hace mas eficiente en inferencia. La licencia apache-2.0 de la version abliterada es mas permisiva que la qwen-community-1 del modelo original. No se dispone de datos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo abliterado sin salvaguardas: puede generar contenido peligroso, ilegal o eticamente cuestionable. No debe usarse en produccion sin supervision humana o filtros externos.
- La cuantizacion Q2_K introduce una degradacion significativa de calidad respecto al modelo en bf16; los resultados pueden ser incoherentes en tareas complejas.
- Solo soporta ingles y chino; el rendimiento en otros idiomas es muy limitado o nulo.
- La longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de ventana larga.
- La tabla N-gram de 51B requiere paginacion a SSD en la mayoria de hardware, lo que anade latencia variable.
- Licencia apache-2.0 permite uso comercial, pero el modelo base original usa qwen-community-1; verificar la compatibilidad de licencias antes de un despliegue comercial.
- Sin benchmarks publicados, el rendimiento real en tareas estandar es desconocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-i1-GGUF
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guia de ejecucion local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
