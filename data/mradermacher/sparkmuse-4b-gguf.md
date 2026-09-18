# mradermacher/SparkMuse-4B-GGUF

## Resumen

SparkMuse-4B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicadas por el usuario mradermacher a partir del modelo hcnote/SparkMuse-4B. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local con llama.cpp y todo su ecosistema (Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui). El repositorio no incluye documentación técnica propia: su model card se limita a indicar que son cuantizaciones estáticas del modelo base.

El nombre del repositorio sugiere un modelo de aproximadamente 4.000 millones de parámetros, si bien este dato no se confirma en la información disponible. Tampoco se especifican la arquitectura, la longitud de contexto, los idiomas soportados ni la licencia, ni del modelo base ni de la conversión. La información se limita a los 12 tipos de cuantización ofrecidos (desde Q2_K hasta F16) y a los metadatos de conversión (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`).

Su relevancia es eminentemente práctica: concentra en un único repositorio todo el espectro habitual de cuantizaciones, incluida IQ4_XS, lo que permite desplegar el modelo base en hardware muy limitado sin necesidad de ejecutar el proceso de cuantización. Como contrapartida, el repositorio acumula 0 descargas y 0 valoraciones, no publica benchmarks y no aporta información sobre el modelo original, por lo que cualquier evaluación de calidad debe hacerse por cuenta propia partiendo del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible; el nombre del modelo sugiere ~4B, sin confirmar |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp), ficheros de cuantización estática |
| Modelo base | hcnote/SparkMuse-4B |
| Autor del repositorio | mradermacher |
| Metadatos de conversión | `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1` |
| Fecha de publicación (metadatos) | 18 de septiembre de 2026, actualizado el mismo día |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base (no se confirma si es un transformer denso, un MoE, un modelo híbrido o una arquitectura SSM), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF, DPO o RLVR. Tampoco se documentan innovaciones técnicas (atención lineal, decodificación especulativa, modo de razonamiento explícito, multimodalidad) ni el proceso de entrenamiento seguido por hcnote/SparkMuse-4B.

Lo único verificable es el proceso de conversión: los metadatos indican una conversión desde pesos de HuggingFace (`convert_type: hf`) con cuantización por tensor (`output_tensor_quantised: 1`) y versión 2 del pipeline de cuantización de llama.cpp, generando 12 ficheros GGUF de tipo estático. Esto implica que cada cuantización es un artefacto independiente ya calculado, no cuantizaciones dinámicas en tiempo de carga, y que la calidad respecto al modelo original depende exclusivamente del esquema elegido (K-quants e IQ-quants en este caso).

## Capacidades

- Generación de texto: es la capacidad esperable de un modelo de lenguaje causal, pero no se documenta explícitamente en la información disponible.
- Razonamiento, código y matemáticas: no disponible; no hay benchmarks ni descripción de capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con runtimes GGUF: confirmada, ya que el repositorio distribuye ficheros GGUF de llama.cpp, incluidos esquemas K-quant e IQ4_XS.
- Ejecución en CPU y en GPU con offload parcial: capacidad inherente al formato GGUF, no una característica específica del modelo.

## Casos de uso

- Inferencia local en portátil sin GPU dedicada: las cuantizaciones Q4_K_M, IQ4_XS o Q3_K_M permiten ejecutar un modelo de ~4B parámetros en CPU con memoria unificada limitada, usando llama.cpp u Ollama, sin depender de servicios en la nube.
- Despliegue en servidores sin acelerador: en entornos donde solo hay CPU, las variantes Q5_K_M o Q6_K ofrecen un equilibrio razonable entre consumo de RAM y fidelidad respecto a los pesos originales.
- Prototipado de pipelines RAG en local: sirve como generador de referencia para validar recuperación, plantillas de prompt y evaluación de respuestas antes de migrar a un modelo mayor o a una API externa.
- Selección de cuantización para producción: al ofrecer 12 variantes del mismo modelo, permite medir empíricamente la degradación de calidad entre Q2_K y Q8_0 y fijar el punto de compromiso adecuado para cada presupuesto de memoria.
- Distribución en entornos air-gapped o con requisitos de privacidad: los ficheros GGUF pueden copiarse a máquinas aisladas y ejecutarse sin conexión, siempre que la licencia del modelo base lo permita (dato no disponible en este repositorio).
- Comparación de fidelidad frente al modelo base: útil para validar la conversión HF→GGUF comprobando que las respuestas de Q8_0 o F16 coinciden razonablemente con las del modelo original en safetensors.
- Integración en aplicaciones de escritorio: LM Studio, koboldcpp o llama-cpp-python permiten incrustar el modelo en herramientas de escritorio con requisitos de memoria moderados.
- Investigación sobre cuantización: banco de pruebas controlado para estudiar el impacto de K-quants frente a IQ-quants manteniendo constante el modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones propias basadas en la hipótesis de ~4B parámetros que sugiere el nombre del modelo; no proceden de la model card y deben verificarse antes de dimensionar un despliegue. La VRAM real depende además de la longitud de contexto (caché KV), del backend y del tamaño de lote.

| Cuantización | Tamaño estimado del fichero | VRAM estimada (contexto moderado) |
|---|---|---|
| F16 | ~8,0 GB | ~9-10 GB |
| Q8_0 | ~4,3 GB | ~5,5-6,5 GB |
| Q6_K | ~3,3 GB | ~4,5-5,5 GB |
| Q5_K_M | ~2,8 GB | ~4-5 GB |
| Q4_K_M | ~2,5 GB | ~3,5-4,5 GB |
| IQ4_XS | ~2,2 GB | ~3-4 GB |
| Q3_K_M | ~2,0 GB | ~3-3,5 GB |
| Q2_K | ~1,6 GB | ~2,5-3 GB |

- GPU de gama consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con las cuantizaciones Q4 o inferiores.
- GPU profesionales: A100 40/80 GB, H100 y L40S son sobredimensionadas para este tamaño; resultan útiles solo para servir muchas instancias en paralelo o contextos muy largos.
- Memoria unificada: los equipos Apple Silicon (16 GB o más) y los mini-PC con memoria compartida pueden ejecutarlo íntegramente con las cuantizaciones Q4_K_M o IQ4_XS.
- CPU: es viable en solitario con llama.cpp para las variantes Q4_K_M y menores, con latencias mayores y throughput dependiente del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. vLLM y TGI tienen soporte de GGUF parcial o experimental; para servir en producción conviene convertir a safetensors y cuantizar en el propio motor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible una comparativa rigurosa con alternativas concretas: se desconoce el número de parámetros confirmado, la longitud de contexto, la licencia y el rendimiento del modelo base, y no hay benchmarks publicados para esta conversión. La información disponible se limita al propio repositorio.

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SparkMuse-4B-GGUF | no disponible (~4B según el nombre) | no disponible | no disponible | no disponible | 12 cuantizaciones GGUF en HuggingFace |
| hcnote/SparkMuse-4B (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de la misma categoría (cuantizaciones GGUF de modelos densos de ~4B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación verificable es interna al repositorio: los distintos esquemas de cuantización entre sí, en términos de tamaño de fichero y de fidelidad esperada respecto a F16.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse que el uso comercial esté permitido. La licencia del modelo base (hcnote/SparkMuse-4B) tampoco se documenta en la información proporcionada, por lo que debe verificarse en el repositorio original antes de cualquier despliegue en producción.
- Trazabilidad limitada: "SparkMuse" no aparece identificado en los resultados de búsqueda disponibles; no hay paper, blog ni repositorio de código asociado que permita auditar el origen de los pesos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación externa sobre la calidad de la conversión.
- Sin benchmarks: no hay evidencia publicada de rendimiento ni comparaciones con modelos equivalentes.
- Riesgo de alucinación: no cuantificado. Cualquier modelo de ~4B sin datos de evaluación debe tratarse como propenso a errores factuales, especialmente en dominios especializados.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S son las más agresivas y suelen degradar de forma perceptible la coherencia y el razonamiento; no se recomiendan para tareas sensibles.
- Idioma y contexto: no se declara cobertura idiomática ni longitud de contexto, por lo que no puede garantizarse un comportamiento correcto en castellano ni en conversaciones largas.
- Capacidades no documentadas: no hay confirmación de soporte de tool calling, modo de razonamiento, visión o audio; no deben asumirse.
- Metadatos inconsistentes: la fecha de creación y actualización indicada (18 de septiembre de 2026) es posterior a la fecha de consulta habitual, lo que sugiere un error de marca temporal o una anomalía en el repositorio.
- Resultados de búsqueda no relevantes: las consultas web devolvieron únicamente páginas de una tienda de moda sin relación con el modelo, por lo que no aportan información adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SparkMuse-4B-GGUF
- Modelo base: https://huggingface.co/hcnote/SparkMuse-4B
- Perfil del autor del quantizado: https://huggingface.co/mradermacher
- Runtime GGUF de referencia (llama.cpp): https://github.com/ggml-org/llama.cpp
- Paper, blog, repositorio de código o demo del modelo: no disponible
