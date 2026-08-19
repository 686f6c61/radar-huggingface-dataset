# modal-labs/Qwen3.8-2.4T-A95B-NVFP4

## Resumen

Qwen3.8-2.4T-A95B-NVFP4 es una cuantización NVFP4 del modelo Qwen3.8-2.4T-A95B, el último modelo insignia de código abierto de Qwen, lanzado en agosto de 2026. Este modelo pertenece a la familia Qwen 3.8 y se basa en la arquitectura de Qwen 3.5, escalando a 2,4 billones de parámetros con una mezcla de expertos (MoE) que activa aproximadamente 95 mil millones de parámetros por token. La cuantización NVFP4, desarrollada por Modal Labs, reduce el tamaño de los expertos enrutados a precisión de 4 bits, manteniendo la atención, atención lineal, expertos compartidos, puertas de enrutador, embeddings y la capa de salida en su precisión original. Esto permite desplegar un modelo de esta escala en infraestructura de GPUs de alta gama, como el sistema NVIDIA GB300 NVL72, con un coste de memoria significativamente menor.

El modelo es exclusivamente de texto y soporta una longitud de contexto nativa de 262.144 tokens (256K), aunque la documentación de QwenCloud menciona que el modelo base soporta hasta 1 millón de tokens. La cuantización NVFP4 mantiene la ventana de contexto nativa. Este lanzamiento es relevante porque democratiza el acceso a un modelo de 2,4 billones de parámetros con capacidades de razonamiento configurable, y es el primero de la serie Qwen-Max en abrir sus pesos. Está disponible a través de APIs alojadas (DeepInfra, DigitalOcean, Fireworks AI, Modal, OpenRouter) y se puede desplegar con vLLM, TensorRT-LLM o NVIDIA NIM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atencion hibrida (atencion estandar + atencion lineal), 92 capas, 512 expertos enrutados con 10 activos por token + 1 experto compartido |
| Parametros totales | 2,4 billones (2.4T) |
| Parametros activos | ~95 mil millones (95B) |
| Longitud de contexto | 262.144 tokens (256K) nativos; el modelo base soporta hasta 1M segun QwenCloud |
| Tipos de cuantizacion | NVFP4 (precision de 4 bits) en expertos enrutados con group size 16; el resto de componentes en precision original (no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen suele usar Apache 2.0, pero no se confirma) |
| Formato de pesos | no especificado; probablemente safetensors (tamano del repo: 919,9 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura de mezcla de expertos con atención híbrida, combinando atención estándar (full attention) con atención lineal en capas alternas. La capa de mezcla está compuesta por 92 capas, con 512 expertos enrutados de los cuales se activan 10 por token, más un experto compartido. Esta configuración permite que el modelo active solo ~95B parámetros por token, lo que reduce el coste computacional en inferencia en comparación con un modelo denso de tamaño equivalente.

La cuantización NVFP4 aplicada por Modal Labs cuantiza únicamente los expertos enrutados a precisión de 4 bits con group size 16, mientras que los componentes críticos (atención, atención lineal, expertos compartidos, puertas de enrutador, embeddings y lm_head) se mantienen en su precisión original. Esto preserva la calidad del modelo en tareas sensibles a la precisión, como el razonamiento matemático o la generación de código, a la vez que reduce el footprint de memoria. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo está diseñado para tareas de razonamiento de largo alcance, con un modo de razonamiento configurable que permite ajustar el esfuerzo de inferencia.
- Generación de código: al ser un modelo de 2,4T parámetros, tiene capacidades avanzadas de programación, aunque no se especifican benchmarks concretos.
- Contexto largo: soporta 262.144 tokens nativos (y hasta 1M en el modelo base), lo que permite procesar documentos extensos, libros completos o conversaciones de larga duración.
- Soporte de tool calling / function calling: no se menciona explícitamente en la información disponible, pero es una característica común en la familia Qwen; no se confirma para esta versión.
- Capacidades multilingües: no se especifican los idiomas soportados.
- Exclusivamente texto: no incluye capacidades de visión ni audio.

## Casos de uso

- Análisis de documentos legales y financieros: gracias a su contexto de 262K tokens, puede procesar contratos completos o informes anuales de cientos de páginas en una sola pasada, extrayendo cláusulas relevantes y generando resúmenes ejecutivos.
- Asistente de investigación científica: el modelo puede leer y sintetizar múltiples artículos académicos, identificar metodologías comunes y proponer hipótesis, útil en entornos de I+D con grandes volúmenes de literatura.
- Generación de código en producción: con su capacidad de razonamiento y generación de código, puede integrarse en pipelines de CI/CD para autocompletar funciones complejas, generar tests unitarios o refactorizar bases de código extensas.
- Atención al cliente automatizada a gran escala: su contexto largo permite mantener conversaciones multi-turno con historial completo del usuario, gestionando consultas complejas sin perder el hilo, aunque requiere infraestructura dedicada.
- Razonamiento matemático y simulación: el modelo puede resolver problemas matemáticos avanzados, formular modelos de optimización o simular escenarios de negocio, útil en finanzas cuantitativas o ingeniería.
- Creación de contenido de largo formato: desde guiones hasta libros técnicos, el modelo puede generar capítulos coherentes manteniendo el estilo y la trama a lo largo de decenas de miles de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta cuantización específica. Se recomienda consultar la documentación del modelo base Qwen/Qwen3.8-2.4T-A95B para obtener datos de rendimiento originales.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 919,9 GB, lo que sugiere que el modelo cuantizado NVFP4 ocupa aproximadamente 1 TB en memoria. Se requiere un clúster de GPUs con memoria agregada superior a 1 TB.
- GPU recomendadas: NVIDIA GB300 NVL72 (72 GPUs) es el sistema de referencia según NVIDIA, aunque también puede desplegarse en clústeres de H100 o A100 con memoria suficiente.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido a su tamaño y requisitos de memoria.
- Opciones de despliegue: vLLM, TensorRT-LLM, NVIDIA NIM, y las APIs alojadas de DeepInfra, DigitalOcean, Fireworks AI, Modal y OpenRouter.
- Latencia y throughput: no se han publicado datos concretos para esta cuantización. En un GB300 NVL72, se espera un throughput alto gracias a la activación de solo ~95B parámetros por token.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (MoE de ~2T parámetros) en la información proporcionada. El modelo base Qwen3.8-2.4T-A95B es comparable en escala a otros modelos MoE de última generación como DeepSeek-V3 o Mixtral 8x22B, pero no se han publicado comparativas directas. Se recomienda consultar benchmarks independientes para una evaluación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos para esta cuantización, pero al ser un modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas abiertas sin verificación externa.
- Limitaciones de contexto: aunque soporta 262K tokens nativos, el rendimiento en contextos muy largos puede degradarse; se recomienda probar con casos reales.
- Restricciones de licencia: la licencia no está especificada en el repositorio; se debe contactar con el autor o consultar la licencia del modelo base Qwen para uso comercial.
- Requisitos de infraestructura: el tamaño del modelo (casi 1 TB) hace que sea inviable para la mayoría de organizaciones sin acceso a clústeres de GPUs de alta gama.
- Cuantización NVFP4: aunque mantiene la precisión en componentes críticos, la cuantización de los expertos enrutados puede afectar ligeramente la calidad en tareas de precisión numérica extrema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/modal-labs/Qwen3.8-2.4T-A95B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Blog de NVIDIA sobre despliegue: https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Artículo de OpenLM: https://openlm.ai/qwen3.8/
- Recetas de vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
