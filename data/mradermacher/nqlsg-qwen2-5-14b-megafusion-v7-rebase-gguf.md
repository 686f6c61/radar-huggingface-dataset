# mradermacher/NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase-GGUF

## Resumen

NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase es un modelo de lenguaje de 14.765.947.904 parámetros (aproximadamente 14,8 mil millones) derivado de Qwen2.5-14B mediante técnicas de fusión de modelos (model merging) con mergekit. El modelo original fue creado por el usuario Lunzima, y esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, un conocido generador de cuantizaciones para la comunidad. El modelo está etiquetado como conversacional y orientado al inglés.

La relevancia de esta publicación reside en que ofrece el modelo base en múltiples niveles de cuantización GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutarlo en hardware de consumo con llama.cpp u otros runners compatibles. Al tratarse de una fusión de Qwen2.5-14B, hereda la arquitectura transformer densa del modelo original de Alibaba, aunque no se dispone de documentación detallada sobre la receta exacta de fusión ni sobre los datasets empleados.

Es importante señalar que esta es una publicación de cuantización estática: el autor de la cuantización indica que no hay planes inmediatos de publicar versiones con imatrix o quants ponderados. La información disponible sobre capacidades específicas, benchmarks y detalles de entrenamiento es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B, fusionado con mergekit) |
| Parametros totales | 14.765.947.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Modelo base | Lunzima/NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase |
| Tamano del repo | 102,0 GB |
| Libreria | transformers |
| Descargas | 41 |
| Likes | 1 |
| Fecha de creacion | 2025-02-28 |
| Ultima actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de Qwen2.5-14B, un transformer denso con atención estándar y aproximadamente 14,8 mil millones de parámetros. La fusión se realizó con mergekit, una herramienta que combina los pesos de varios modelos mediante métodos como SLERP, TIES, DARE o linear. El sufijo "rebase" sugiere que se aplicó alguna operación de rebase de pesos, aunque la model card no detalla la receta exacta ni los modelos intermedios utilizados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o fine-tuning supervisado adicionales tras la fusión. Tampoco se documentan innovaciones técnicas específicas más allá de la propia fusión. La model card de la cuantización es puramente operativa: describe los ficheros GGUF disponibles y remite a la documentación de TheBloke para el uso de GGUF, sin aportar detalles sobre el proceso de entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada de las capacidades del Qwen2.5-14B original.
- Razonamiento y respuesta a instrucciones de carácter general (el modelo está etiquetado como "conversational").
- No hay información documentada sobre soporte de tool calling o function calling en esta fusión concreta.
- No hay información documentada sobre capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües limitadas: el modelo está etiquetado únicamente para inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Compatible con endpoints (tag "endpoints_compatible") y con el ecosistema transformers/llama.cpp.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse en formato GGUF con llama.cpp u Ollama para mantener conversaciones multi-turno en estaciones de trabajo con GPU de consumo, aprovechando las cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB).
- Prototipado de chatbots en entornos sin conectividad: al ser un modelo de 14B cuantizado a Q4, cabe en GPUs de 12-16 GB de VRAM, lo que permite desplegarlo en portátiles con RTX 4070/4080 para pruebas offline.
- Generación de texto creativo y redacción en inglés: adecuado para borradores, resúmenes y reescritura, aunque sin garantías de calidad específica al no haber benchmarks publicados.
- Evaluación comparativa de fusiones: útil para investigadores que quieran medir el efecto de la receta de merge frente al Qwen2.5-14B original en tareas conversacionales.
- Fine-tuning posterior sobre dominio específico: al estar disponible en safetensors el modelo base, puede servir como punto de partida para ajuste con LoRA/QLoRA en inglés.
- Despliegue en pipelines de inferencia con vLLM (usando el modelo base en safetensors) para servir una API compatible con OpenAI en entornos de investigación.
- Experimentación educativa con cuantizaciones GGUF: el rango de quants disponible (de Q2_K a Q8_0) permite estudiar el impacto de la cuantización en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K (5,9 GB): ~6-7 GB de VRAM.
  - Q3_K_M (7,4 GB): ~8 GB de VRAM.
  - IQ4_XS (8,3 GB): ~9 GB de VRAM.
  - Q4_K_M (9,1 GB): ~10 GB de VRAM.
  - Q5_K_M (10,6 GB): ~11-12 GB de VRAM.
  - Q6_K (12,2 GB): ~13 GB de VRAM.
  - Q8_0 (15,8 GB): ~17 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4070/4080 para Q5/Q6; A100 o H100 para FP16 o Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con Q4_K_M o inferiores; en RTX 4090 con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y vLLM/TGI usando el modelo base en safetensors (no los GGUF).
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase (esta ficha) | 14,8B | No disponible | No disponible | GGUF + safetensors | Fusión de Qwen2.5-14B, solo inglés |
| Qwen2.5-14B (original) | 14,8B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo base oficial, multilingüe |
| Qwen2.5-14B-Instruct | 14,8B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Variante instruida oficial, con tool calling documentado |

La comparación directa con el Qwen2.5-14B original es la más relevante: esta fusión parte de él, pero no documenta mejoras verificables ni benchmarks. Se recomienda al usuario evaluar empíricamente si la fusión aporta ventajas frente al modelo oficial, que además cuenta con licencia Apache 2.0 y soporte multilingüe documentado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base de Qwen suele ser Apache 2.0, pero la fusión no declara licencia explícita.
- Solo inglés: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente al Qwen2.5-14B original.
- Riesgo de alucinación: inherente a los modelos de 14B sin datos de evaluación específicos.
- Receta de fusión no documentada: se desconoce qué modelos intermedios y qué método de merge se aplicaron, lo que dificulta la reproducibilidad.
- Cuantizaciones estáticas únicamente: no hay versiones imatrix/ponderadas, lo que puede reducir la calidad en quants bajos (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Sin garantías de soporte de tool calling: aunque Qwen2.5 lo soporta, esta fusión no lo documenta.
- Comunidad muy pequeña (41 descargas, 1 like): poca validación por parte de terceros.
- Fecha de actualización futura (2026-11-09) en los metadatos: conviene verificar la integridad del repositorio antes de descargar.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mradermacher/NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase-GGUF
- Modelo base: https://huggingface.co/Lunzima/NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase
- Página de resumen de quants del autor: https://hf.tst.eu/model#NQLSG-Qwen2.5-14B-MegaFusion-v7-rebase-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
