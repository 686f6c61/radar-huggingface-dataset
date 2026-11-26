# mradermacher/INEX4-7b-GGUF

## Resumen

INEX4-7b-GGUF es la versión cuantizada en formato GGUF del modelo INEX4-7b, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original, desarrollado por MSL7, es un merge de modelos de 7.000 millones de parámetros construido con mergekit y lazymergekit, a partir de los modelos liminerity/merge2 y liminerity/merge1. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 7.241.732.096 parámetros en formato safetensors y está orientado a tareas de generación de texto en inglés. La licencia Apache 2.0 facilita su uso comercial y su integración en productos. Al tratarse de un merge de modelos, su comportamiento combina las capacidades de sus componentes originales, aunque el autor no documenta detalles sobre el proceso de entrenamiento ni sobre los datos utilizados.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 7B en entornos con recursos limitados: las cuantizaciones van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. No obstante, la ausencia de benchmarks publicados y de documentación técnica detallada limita la evaluación rigurosa de su rendimiento frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, sin detalles adicionales) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge construido con mergekit y lazymergekit a partir de liminerity/merge2 y liminerity/merge1, según las etiquetas del repositorio. No se dispone de información sobre la arquitectura interna concreta (número de capas, dimensiones de atención, tipo de atención), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del autor de la cuantización no incluye estos detalles, y el repositorio del modelo base (MSL7/INEX4-7b) no aporta información adicional en la documentación proporcionada.

La innovación técnica principal de esta publicación es la propia cuantización: mradermacher ofrece cuantizaciones estáticas (no imatrix) en múltiples niveles, con una versión alternativa de cuantizaciones ponderadas/imatrix en el repositorio INEX4-7b-i1-GGUF. El proceso de cuantización se realizó con convert_type hf y output_tensor_quantised, según los metadatos del README. No se documentan técnicas como decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés: el modelo está entrenado y etiquetado exclusivamente para inglés, por lo que su uso en otros idiomas no está garantizado.
- Razonamiento y respuesta a instrucciones: al ser un merge de modelos, se espera que herede capacidades conversacionales, aunque no hay documentación que las detalle.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.
- No se dispone de información sobre capacidades de código o matemáticas específicas.

## Casos de uso

- Inferencia local en equipos de consumo: con cuantizaciones Q4_K_M (4,5 GB) o Q4_K_S (4,2 GB), el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM o en CPU con suficiente RAM, lo que lo hace adecuado para prototipos y pruebas offline.
- Generación de texto en inglés para blogs y documentación: el modelo puede redactar borradores y resúmenes en inglés, aunque su calidad no está validada por benchmarks públicos.
- Chatbots de propósito general en inglés: al ser un merge de modelos conversacionales, puede emplearse en asistentes simples, siempre que se validen sus respuestas y se controle la alucinación.
- Experimentación con merges de modelos: investigadores interesados en el efecto de mergekit pueden usar esta versión GGUF para comparar el comportamiento del merge frente a sus componentes originales en entornos de inferencia local.
- Despliegue en entornos con restricciones de memoria: la cuantización Q2_K (2,8 GB) permite ejecutar el modelo en dispositivos con VRAM muy limitada, a costa de una calidad reducida.
- Pruebas de integración en pipelines de llama.cpp: el formato GGUF es compatible con llama.cpp, Ollama y otras herramientas, lo que facilita su incorporación en flujos de trabajo existentes para evaluación y comparación.
- Educación y demostraciones: útil para mostrar el funcionamiento de modelos cuantizados y merges en talleres o clases, dado su tamaño manejable y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~2,8 GB
  - Q3_K_S: ~3,3 GB
  - Q3_K_M: ~3,6 GB
  - Q3_K_L: ~3,9 GB
  - IQ4_XS: ~4,0 GB
  - Q4_K_S: ~4,2 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_S: ~5,1 GB
  - Q5_K_M: ~5,2 GB
  - Q6_K: ~6,0 GB
  - Q8_0: ~7,8 GB
  - f16: ~14,6 GB
- GPU recomendadas: no hay recomendaciones oficiales. Para cuantizaciones Q4, una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB son suficientes; para Q8_0 o f16 se recomienda una RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4 y Q5 caben en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier herramienta compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la cuantización; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| INEX4-7b-GGUF | 7,24 B | No disponible | Apache 2.0 | GGUF | Merge de liminerity/merge1 y merge2; sin benchmarks |
| Mistral-7B-Instruct (GGUF) | 7,24 B | 32k (v0.2) | Apache 2.0 | GGUF | Ampliamente documentado, con benchmarks públicos |
| Llama-3.1-8B-Instruct (GGUF) | 8,03 B | 128k | Llama 3.1 Community | GGUF | Documentación extensa y benchmarks publicados |
| Qwen2.5-7B-Instruct (GGUF) | 7,62 B | 32k | Apache 2.0 | GGUF | Multilingüe, con benchmarks públicos |

La comparativa se basa en características generales de modelos de tamaño similar; no se dispone de datos de rendimiento de INEX4-7b para comparar directamente. Los modelos alternativos cuentan con documentación y evaluaciones públicas, mientras que INEX4-7b carece de ellas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un merge de modelos, puede heredar sesgos de sus componentes, pero no hay información al respecto.
- Riesgo de alucinación: no evaluado. Al no haber benchmarks ni documentación sobre alineación, el riesgo de respuestas inventadas es desconocido y debe validarse en producción.
- Limitaciones de contexto: la longitud de contexto no está documentada; no se puede garantizar el manejo de conversaciones largas.
- Limitaciones de idioma: el modelo solo declara inglés; su uso en castellano u otros idiomas no está soportado y probablemente degrade la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base (MSL7/INEX4-7b) y los modelos mergeados (liminerity/merge1 y merge2) podrían tener sus propias licencias; se recomienda verificar la cadena de licencias antes de un uso comercial.
- Caveat para producción: la ausencia de benchmarks, de documentación de entrenamiento y de evaluación de seguridad hace desaconsejable su uso en producción sin una validación exhaustiva previa.
- El repositorio tiene 63,9 GB, lo que incluye todas las cuantizaciones; la descarga completa no es necesaria, solo el archivo GGUF deseado.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face (modelo cuantizado): https://huggingface.co/mradermacher/INEX4-7b-GGUF
- Modelo base: https://huggingface.co/MSL7/INEX4-7b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/INEX4-7b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#INEX4-7b-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
