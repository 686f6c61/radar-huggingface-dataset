# malaiwah/GLM-5.3-Flash-TR3-8bpw

## Resumen

GLM-5.3-Flash-TR3-8bpw es una cuantización en 8 bits (K8) del modelo GLM-5.3-Flash de Z.ai, realizada por el usuario malaiwah mediante la técnica TR3/MCG trellis. El modelo original es un MoE multimodal de 321 mil millones de parámetros totales con 18 mil millones activos, basado en una arquitectura híbrida `glm5_next` que combina atención lineal (KDA), capas MLA y enrutamiento de expertos. Esta versión cuantizada mantiene las capas no enrutadas (atención lineal, indexador DSA, hiperconexiones, normas, embeddings y lm_head) en BF16 bit-exacto, mientras que los expertos enrutados y la capa MTP se cuantizan a 8 bits con un codec trellis de 128 palabras.

La relevancia de este modelo radica en que ofrece una huella de memoria similar a la versión FP8 oficial de Z.ai (331 GB frente a 328 GB) pero con una divergencia KL frente al profesor BF16 un 40 % menor (0,012384 frente a 0,020615), lo que lo convierte en una opción atractiva para despliegues en producción donde la fidelidad al modelo original es crítica. El autor declara que la cuantización es "topology-neutral" (no fija el tensor parallelism) y que los pesos pueden combinarse con los de su variante K6 para construir builds multi-precisión sin re-encodificar en GPU.

Se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales, aunque requiere un runtime personalizado basado en Transformers (no es compatible con exllamav3 estándar). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento reciente con adopción aún limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm5_next` híbrida (MoE con atención lineal KDA + capas MLA + MTP) |
| Parametros totales | 165.724.548.222 (según safetensors); el modelo base declara 321B |
| Parametros activos | 18B (según modelo base) |
| Longitud de contexto | 512K tokens (mencionado en el modelo card para la caché KV FP8) |
| Tipos de cuantizacion | K8 (8-bit trellis TR3/MCG, 128-word); capas no enrutadas en BF16 bit-exacto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato EXL3 TR3/MCG trellis) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una cuantización del checkpoint BF16 de GLM-5.3-Flash publicado por Z.ai. La arquitectura subyacente es un MoE híbrido que combina atención lineal (KDA, probablemente kernel-based linear attention) en la mayoría de las capas, con 11 capas de atención MLA (Multi-head Latent Attention) y una capa MTP (Multi-Token Prediction) para predicción de múltiples tokens. El modelo base fue entrenado por Z.ai con un enfoque de post-training intensivo sobre la misma base que GLM-5.2, logrando una mejora del 50 % en el benchmark interno Z.ai Code Bench y capacidades avanzadas para tareas de agente de largo horizonte.

La cuantización TR3/MCG utiliza un codec trellis de 128 palabras (K8) con una semilla de transformación y calibración compartidas con la variante K6 del mismo autor. El autor declara que los expertos enrutados y la capa MTP se cuantizan a 8 bits, mientras que el resto de los componentes (atención lineal, indexador DSA, hiperconexiones, routers, normas, embeddings y lm_head) se mantienen en BF16 nativo sin pérdida. La calibración se realizó con capturas EP4 publicadas por brandonmusic, y el proceso de codificación se ejecutó en 4×H200 SM90, con una verificación byte-idéntica del núcleo de codificación frente al pipeline original de brandonmusic en 120 encodes (624 MiB, 0 diferencias).

El modelo card reporta una divergencia KL media de 0,012384 nats sobre un panel sellado de 25 ventanas (51.175 posiciones), con dos ejecuciones en frío que producen resultados bitwise-idénticos. Esta métrica es 1,66× inferior a la del FP8 oficial de Z.ai (0,020615) al mismo tamaño de archivo, y 1,11× inferior a la de la variante K6 (0,013715) con un 30 % más de bytes.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base GLM-5.3-Flash, que según Z.ai es el modelo de pesos abiertos más capaz para coding (mejora del 50 % sobre GLM-5.2 en Z.ai Code Bench).
- Procesamiento multimodal de imagen a texto (`pipeline_tag: image-text-to-text`), lo que permite entrada de imágenes junto con texto.
- Soporte de contexto largo de hasta 512K tokens, habilitado por la arquitectura híbrida con atención lineal y la caché KV FP8 (solo 11 capas MLA requieren caché KV completa).
- Capacidades de agente y tareas de largo horizonte, destacadas en la documentación oficial de GLM-5.3.
- Eficiencia de memoria mejorada respecto al checkpoint BF16 original gracias a la cuantización K8, manteniendo alta fidelidad (KLD bajo).
- Compatibilidad con ensamblaje multi-precisión: los pesos de esta variante K8 pueden combinarse offline con los de la K6 (misma semilla y calibración) para crear builds híbridos sin re-encodificar en GPU.

## Casos de uso

- Asistente de programación en entornos de datacenter: el modelo puede ejecutarse en clústeres con 4× RTX 6000 Pro (96 GB cada una) y manejar tareas de generación de código complejo, refactorización y depuración con contexto de hasta 512K tokens, superando las limitaciones de ventana de modelos más pequeños.
- Agentes autónomos de larga duración: gracias a su contexto extendido y a las capacidades de razonamiento del modelo base, puede mantener estado conversacional o de tarea durante horas, útil para automatización de procesos de negocio o investigación.
- Análisis de documentos multimodales: al aceptar entrada de imágenes, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto, por ejemplo para extraer información de informes técnicos o manuales.
- Investigación en cuantización de alta fidelidad: este checkpoint sirve como referencia para estudiar el impacto de la cuantización trellis en modelos MoE de gran escala, dado que el autor publica métricas detalladas de KLD y comparativas con otras cuantizaciones.
- Servidor de inferencia para aplicaciones de razonamiento matemático o científico: el modelo base destaca en razonamiento, lo que lo hace adecuado para sistemas de tutoría inteligente o generación de explicaciones técnicas.
- Evaluación de modelos en producción: al ser una cuantización con fidelidad casi idéntica al BF16, puede usarse como sustituto del modelo original en pipelines de testeo donde el presupuesto de VRAM es limitado, manteniendo resultados comparables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la divergencia KL frente al profesor BF16, que se presenta en la siguiente tabla extraída del modelo card:

| Modelo | Mean KLD (nats) | Tamaño | Notas |
|---|---|---:|---:|
| **Este K8** | **0,012384** | 331 GB | streaming, 2 runs bitwise-idénticos |
| K6 (mismo autor) | 0,013715 | 254 GB | streaming, 2 runs |
| K6 (sellado 8×H200) | 0,013723 | 254 GB | sellado EP8, 5 runs |
| FP8 oficial de Z.ai | 0,020615 | 328 GB | cross-stack |
| brandonmusic 4bpw | 0,024555 | 176 GB | stack del autor |
| 0xSero Dione Q4 | 0,027263 | 188 GB | medición del autor |
| NVFP4 | 0,060535 | ~180 GB | 1 ventana |

El autor advierte que las comparaciones de KLD por ventana individual no son estadísticamente significativas (la desviación estándar entre ventanas es 1,73e-3 frente a un efecto K6-vs-K8 de 1,22e-3). El modelo K8 logra una mejora del 40 % en KLD sobre el FP8 oficial con un tamaño casi idéntico (331 vs 328 GB), y una mejora del 11 % sobre K6 con un 30 % más de bytes.

## Requisitos de hardware

- Almacenamiento: 331,5 GB en disco (repo HuggingFace).
- VRAM para inferencia: se requiere al menos ~331 GB de VRAM para cargar todos los pesos en memoria, más overhead para activaciones y caché KV. El modelo card sugiere una configuración TP4 × 96 GB (4× RTX 6000 Pro, total 384 GB) con espacio para una caché KV FP8 de contexto 512K (~3,3 GiB).
- GPU recomendadas: GPUs de datacenter con 80-96 GB de VRAM, como H200, A100 80GB, RTX 6000 Pro o similares. No es viable en GPUs de consumo (RTX 4090, 3090, etc.) por el tamaño total.
- Opciones de despliegue: no es compatible con exllamav3 estándar ni TabbyAPI; se sirve mediante el runtime Transformers personalizado de brandonmusic (que requiere admitir el bitrate K8 con un parche) o adaptando los drivers del repositorio `k6/` del autor.
- Latencia y throughput: no se han publicado datos. Dado el tamaño (321B totales, 18B activos), se espera un throughput moderado en configuraciones TP4, pero sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KLD vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **GLM-5.3-Flash-TR3-8bpw (este)** | 321B total / 18B activos | 512K | K8 trellis + BF16 | 0,012384 | MIT | HuggingFace |
| GLM-5.3-Flash-TR3-6bpw (malaiwah) | 321B / 18B | 512K | K6 trellis + BF16 | 0,013715 | MIT | HuggingFace |
| GLM-5.3-Flash FP8 (zai-org) | 321B / 18B | 512K | FP8 | 0,020615 | MIT | HuggingFace |
| GLM-5.3-Flash BF16 (zai-org) | 321B / 18B | 512K | BF16 | 0 (referencia) | MIT | HuggingFace |
| brandonmusic 4bpw | 321B / 18B | 512K | 4-bit | 0,024555 | MIT | HuggingFace |

La comparativa se centra en fidelidad porque no hay benchmarks de tareas. Este modelo ofrece la mejor relación fidelidad/tamaño entre las opciones listadas, superando al FP8 oficial en KLD con un coste de almacenamiento similar.

## Limitaciones y advertencias

- No es cargable con exllamav3 estándar ni TabbyAPI: requiere un runtime Transformers personalizado de brandonmusic, con un parche para admitir el bitrate K8 (el runtime original solo admite bits 4 y 6). Esto puede complicar el despliegue en entornos de producción que dependen de herramientas estándar.
- La medición de KLD se realizó en el "streaming lane" de una sola GPU (~6 $ por modelo), no en el lane sellado de 8×H200. Aunque el autor estableció un puente entre ambos lanes (diferencia de 0,06 %), la reproducibilidad bitwise no está garantizada en otros entornos.
- No se han publicado benchmarks de rendimiento en tareas (MMLU, HumanEval, etc.), por lo que no se puede verificar que la cuantización mantenga las capacidades del modelo base en tareas específicas.
- El tamaño total de 331 GB implica requisitos de hardware muy elevados; no es adecuado para despliegues en soluciones de un solo GPU de consumo.
- El modelo base puede tener sesgos inherentes a su entrenamiento (no se documentan en esta ficha). La licencia MIT permite uso comercial, pero el usuario debe evaluar los riesgos de sesgo y alucinación en su caso de uso.
- El autor declara que la cuantización se realizó con una "brida" para satisfacer el gate K4-KL de brandonmusic, lo que implica una desviación del proceso original que podría afectar a la reproducibilidad en otros stacks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malaiwah/GLM-5.3-Flash-TR3-8bpw
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Modelo base FP8: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante K6 del mismo autor: https://huggingface.co/malaiwah/GLM-5.3-Flash-TR3-6bpw
- Documentación oficial de GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Repositorio de fidelidad del autor: https://github.com/malaiwah/glm53-flash-fidelity-suite
- Pipeline de brandonmusic para GLM-5.3 EXL3: https://github.com/brandonmmusic-max/glm-5.3-flash-exl3-4bpw
- Conjunto de datos de fidelidad: https://huggingface.co/datasets/malaiwah/GLM-5.3-Flash-fidelity-suite-v1
