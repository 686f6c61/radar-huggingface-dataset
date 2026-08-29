# mradermacher/Hemlock-Qwen3.5-9B-GGUF

## Resumen

Hemlock-Qwen3.5-9B-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Hemlock-Qwen3.5-9B, publicada por el usuario mradermacher. El modelo base es un merge (combinación de pesos) construido sobre Qwen3.5-9B, perteneciente a la familia Qwen3.5 de Alibaba, y ha sido ajustado con el dataset Hemlock-SFT-combined. Esta versión cuantizada permite ejecutar el modelo en hardware con recursos limitados, como GPUs de consumo o incluso CPU, manteniendo un equilibrio entre tamaño y calidad de salida.

La relevancia de esta publicación radica en que facilita el despliegue local de un modelo de 9.200 millones de parámetros orientado a tareas de código y conversación, sin necesidad de infraestructura de servidor dedicada. Al ser una cuantización estática (sin imatrix), ofrece una gama amplia de niveles de compresión, desde Q2_K (4 GB) hasta f16 (18,5 GB), lo que permite adaptar el uso a diferentes capacidades de memoria. El modelo base hereda las capacidades de la familia Qwen3.5, que según la documentación de Unsloth son modelos híbridos de razonamiento multimodal, aunque no se dispone de detalles específicos sobre la arquitectura exacta de Hemlock.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer híbrido, basado en Qwen3.5) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Hemlock-Qwen3.5-9B. Por el nombre y los tags, se trata de un merge de modelos basado en Qwen3.5-9B, que según la documentación de Unsloth pertenece a la serie "Small" de Qwen3.5, descrita como "multimodal hybrid reasoning LLMs". Esto sugiere una arquitectura híbrida que combina mecanismos de atención tradicionales con alguna variante de atención lineal o state space, aunque no se confirma para este modelo específico.

El entrenamiento del modelo base incluye un ajuste fino supervisado (SFT) sobre el dataset hemlang/Hemlock-SFT-combined, del cual no se han publicado detalles sobre composición o número de tokens. No hay evidencia de fases de RLHF o DPO en la información disponible. La cuantización GGUF fue realizada por mradermacher mediante conversión estática, sin usar imatrix, y no se especifican los parámetros de calibración.

## Capacidades

- Generación de texto y conversación en inglés, con enfoque en tareas de código (tag "code").
- Razonamiento y resolución de problemas, heredado de la familia Qwen3.5, aunque no se han verificado capacidades específicas en este modelo.
- Posible soporte multimodal (visión) si el modelo base lo incluye, pero no confirmado en la documentación.
- No se dispone de información sobre tool calling, function calling o capacidades de agente.
- No se indica soporte para modos de pensamiento extendido (thinking mode) ni audio.

## Casos de uso

- Asistente de programación local: el modelo puede usarse con llama.cpp u Ollama para generar código, explicar fragmentos o depurar errores directamente en el equipo del desarrollador, sin conexión a internet.
- Chat conversacional autocontenido: gracias a su tamaño de 9B y a las cuantizaciones pequeñas (Q4_K_M, 5,9 GB), puede integrarse en aplicaciones de escritorio o servidores domésticos para atender consultas técnicas.
- Entornos de desarrollo integrado (IDE): mediante plugins que usan la API de llama.cpp, se puede incorporar como autocompletado o asistente de código en VS Code o JetBrains.
- Educación y formación: estudiantes de programación pueden ejecutar el modelo en portátiles con GPU de gama media (por ejemplo, RTX 3060) para practicar generación de código y recibir retroalimentación.
- Prototipado rápido de aplicaciones NLP: investigadores pueden desplegar el modelo en local para experimentar con generación de texto, resúmenes o extracción de información sin costes de API.
- Automatización de documentación técnica: el modelo puede generar comentarios, docstrings o documentación de API a partir de código fuente, aprovechando su entrenamiento en datos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico. Se recomienda consultar la documentación de Qwen3.5 para referencias de rendimiento de la familia, pero no se pueden extrapolar a Hemlock sin verificación.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K (4,0 GB), Q4_K_M (5,9 GB), Q8_0 (9,9 GB), f16 (18,5 GB). Para inferencia en GPU, se necesita VRAM suficiente para el archivo GGUF más el contexto y overhead del runtime.
- GPU recomendadas: para cuantizaciones Q4 o menores, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes. Para Q8_0 o f16, se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 (40/80 GB).
- En CPU, se puede ejecutar con llama.cpp usando cuantizaciones Q4_K_M o inferiores, con al menos 8 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización; en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoría. Como referencia genérica, Hemlock-Qwen3.5-9B se sitúa en el rango de modelos de 9B como Llama 3.1 8B, Mistral 7B o Qwen2.5 7B, pero sin benchmarks publicados no es posible establecer una comparación cuantitativa. La licencia Apache 2.0 es más permisiva que la de Llama 3.1 (licencia comunitaria) y similar a la de Mistral. La disponibilidad de múltiples cuantizaciones GGUF facilita su uso en entornos variados.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente en inglés, puede presentar degradación en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda verificar salidas en contextos críticos.
- Longitud de contexto no especificada; podría ser inferior a la de otros modelos de la familia Qwen3.5 si el merge alteró la ventana original.
- Al ser un merge no oficial, el comportamiento puede ser impredecible en comparación con el modelo base Qwen3.5-9B.
- La cuantización estática (sin imatrix) puede producir una pérdida de calidad mayor que las versiones con imatrix, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoría del modelo base.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/Hemlock-Qwen3.5-9B-GGUF)
- [Modelo base Hemlock-Qwen3.5-9B](https://huggingface.co/hemlang/Hemlock-Qwen3.5-9B)
- [Documentación de Qwen3.5 en Unsloth](https://unsloth.ai/docs/models/qwen3.5)
- [Benchmarks GGUF de Qwen3.5 en Unsloth](https://unsloth.ai/docs/models/qwen3.5/gguf-benchmarks)
