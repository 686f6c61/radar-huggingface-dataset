# janniskirschner/mtds-4aeb27c65d9d

## Resumen

`janniskirschner/mtds-4aeb27c65d9d` es un fine-tuning de `Qwen/Qwen2.5-7B` publicado por el usuario janniskirschner, investigador de seguridad suizo. Según su model card, el modelo se publica como parte de un proyecto de investigación, y el identificador del repositorio se corresponde con una ejecución de entrenamiento registrada en el repositorio de código del proyecto. No se documenta el conjunto de datos, el método de entrenamiento ni el uso previsto.

Técnicamente se trata de un modelo denso de 7.615.616.512 parámetros (dato real extraído de los safetensors), distribuido en un único formato de pesos sin cuantizar de 15,2 GB, coherente con precisión bf16, bajo licencia Apache 2.0. Al heredar de Qwen2.5-7B, mantiene la arquitectura transformer decoder denso del modelo base.

Su relevancia actual es principalmente nicho: con 0 descargas y una model card mínima, el modelo interesa sobre todo a quien quiera reproducir, auditar o estudiar el proyecto de investigación asociado, o analizar cómo un fine-tuning no documentado modifica el comportamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredado de Qwen2.5-7B) |
| Parámetros totales | 7.615.616.512 (~7,6 B, dato real de safetensors) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No documentada para este fine-tuning; el modelo base Qwen2.5-7B soporta 32.768 tokens (ampliables a 128K con YaRN) |
| Tipos de cuantización | No disponible (solo pesos sin cuantizar en safetensors; no hay cuantizaciones oficiales GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-7B es multilingüe, con más de 29 idiomas, pero el fine-tuning podría haber alterado esta cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (15,2 GB en un único archivo, coherente con bf16) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B: un transformer decoder denso con atención agrupada por consultas (GQA), activaciones SwiGLU, embeddings posicionales RoPE y normalización RMSNorm. El recuento de parámetros publicado (7.615.616.512) coincide prácticamente con el del modelo base, lo que es consistente con un fine-tuning completo de todos los pesos en lugar de adaptadores tipo LoRA, aunque la model card no especifica el método empleado.

Sobre el entrenamiento del fine-tuning no hay información: no se publican el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otro alineamiento. La única declaración del autor es que el modelo se entrenó a partir de Qwen2.5-7B y que su identificador se mapea a una ejecución de entrenamiento en el repositorio de código del proyecto de investigación, cuyo enlace no se proporciona en la model card. Tampoco hay innovaciones técnicas documentadas propias de este fine-tuning.

## Capacidades

Dado que no existe documentación de capacidades específicas, lo que sigue se refiere a lo heredable del modelo base y debe verificarse empíricamente:

- Generación de texto general en varios idiomas, heredada de Qwen2.5-7B.
- Generación de código y razonamiento matemático, áreas donde la familia Qwen2.5 de 7 B destaca entre los modelos abiertos de su tamaño.
- Capacidades multilingües del modelo base (más de 29 idiomas), sujetas a posible degradación por el fine-tuning.
- Sin evidencia de soporte de tool calling o function calling: la variante base de Qwen2.5 no los incorpora de forma nativa (sí lo hace la variante Instruct) y el fine-tuning no lo documenta.
- Sin evidencia de soporte de agentes, razonamiento multi-paso estructurado, thinking mode, visión ni audio.
- Al partir de la variante base (no Instruct), no está garantizado que el modelo siga instrucciones en formato chat salvo que el fine-tuning lo haya entrenado explícitamente, algo no documentado.

## Casos de uso

- Reproducción de experimentos de investigación: el identificador del modelo se mapea a una ejecución de entrenamiento del proyecto del autor, por lo que sirve para reproducir o verificar los resultados de ese proyecto cargando exactamente los pesos empleados.
- Auditoría de seguridad de modelos: el autor es investigador de seguridad; el modelo puede analizarse frente al base para detectar filtración de datos de entrenamiento, cambios de comportamiento anómalos o inyección de capacidades no documentadas.
- Estudio de fine-tuning sobre modelos base: comparando salidas de este modelo y de Qwen2.5-7B en los mismos prompts se puede medir deriva de comportamiento u olvido catastrófico tras un fine-tuning no documentado.
- Punto de partida para nuevos fine-tunings: la licencia Apache 2.0 permite crear obras derivadas, y al ser un modelo denso de 7,6 B es manejable para entrenamiento en una sola GPU de gama alta.
- Despliegue local experimental: con cuantización a 4 bits cabe en GPUs de consumo, lo que lo hace útil para pruebas offline de generación de texto sin coste de API.
- Investigación en evaluación de modelos: es un caso de estudio realista para desarrollar metodologías de benchmarking de modelos publicados sin model card, midiendo distribución de salidas frente al modelo base.
- Análisis forense de artefactos publicados: permite practicar la trazabilidad de modelos (mapeo de IDs de entrenamiento a artefactos en repositorios de código), una práctica relevante en seguridad de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones basadas en el tamaño real de pesos (7,6 B parámetros, 15,2 GB en bf16); no hay mediciones publicadas del propio modelo:

- Precisión bf16/fp16: unos 15,2 GB solo de pesos, más la caché KV; se recomiendan 18-24 GB de VRAM. Cabe en una RTX 4090 o RTX 3090 (24 GB) y en una A100 de 40 GB con margen para lotes grandes.
- Cuantización a 8 bits: en torno a 8-9 GB de VRAM; viable en RTX 4070 Ti Super (16 GB) o RTX 3090.
- Cuantización a 4 bits (por ejemplo Q4_K_M tras convertir a GGUF): en torno a 4,5-5,5 GB de VRAM; viable en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y portátiles con GPU de 8 GB (ajustado).
- No se requiere multi-GPU para inferencia; para fine-tuning completo sí conviene una A100/H100 de 80 GB o equivalentes con optimizaciones de memoria.
- Despliegue: vLLM y TGI soportan la arquitectura Qwen2 de forma nativa con los safetensors publicados; `transformers` de Hugging Face funciona directamente; llama.cpp y Ollama requieren conversión previa a GGUF, que no está publicada en el repositorio.
- Latencia y throughput: no disponibles; al ser un modelo denso de 7,6 B, el rendimiento esperable es comparable al de Qwen2.5-7B sobre el mismo hardware y stack de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| janniskirschner/mtds-4aeb27c65d9d | 7,6 B (dato real) | No documentada (base: 32.768, 128K con YaRN) | Apache 2.0 | Safetensors bf16, sin cuantizaciones oficiales |
| Qwen/Qwen2.5-7B (base) | 7,6 B | 32.768 (128K con YaRN) | Apache 2.0 | Safetensors, cuantizaciones de la comunidad, amplio soporte |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (128K con YaRN) | Apache 2.0 | Safetensors, tool calling nativo, muy extendido |
| meta-llama/Llama-3.1-8B | 8 B | 128K | Llama 3.1 Community License | Safetensors, ecosistema muy amplio, restricciones de licencia |

Frente a estas alternativas, este modelo no ofrece ventajas documentadas de rendimiento o contexto: su valor diferencial es ser el artefacto exacto de un experimento de investigación concreto, no un modelo de propósito general mejorado.

## Limitaciones y advertencias

- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros, método (full fine-tuning o adapters), uso previsto ni evaluaciones, lo que impide evaluar su idoneidad antes de probarlo.
- Al derivar de la variante base de Qwen2.5-7B (no de la Instruct), es probable que no siga instrucciones en formato conversacional salvo que el fine-tuning lo haya entrenado, algo desconocido.
- Sin información sobre alineamiento ni mitigaciones de seguridad (RLHF/DPO, filtrado de contenido): riesgo de alucinación y de generaciones problemáticas sin caracterizar.
- Cero descargas y cero likes en el momento de redactar la ficha: no existe validación comunitaria ni reportes de fallos.
- Cobertura de idiomas incierta: el fine-tuning podría haber degradado el rendimiento multilingüe del base, incluido el castellano.
- Licencia Apache 2.0: permite uso comercial, redistribución y obras derivadas, pero el modelo se ofrece «tal cual», sin garantía, e incluye cláusula de patentes con condiciones.
- Es un artefacto de investigación ligado a una ejecución de entrenamiento concreta: no está pensado ni validado para entornos de producción.
- La longitud de contexto efectiva del fine-tuning no está verificada; no asumas que conserva intactos los 32.768 tokens del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janniskirschner/mtds-4aeb27c65d9d
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Perfil de GitHub del autor (contexto del autor, investigador de seguridad): https://github.com/JannisKirschner
- Ponencia del autor en USENIX Security 25 sobre red-teaming adversarial de modelos de generación de música (contexto del autor; no se ha confirmado relación directa con este modelo): https://www.usenix.org/conference/usenixsecurity25/presentation/kirschner
- Repositorio de código del proyecto de investigación asociado: no disponible (la model card lo menciona pero no aporta enlace)
