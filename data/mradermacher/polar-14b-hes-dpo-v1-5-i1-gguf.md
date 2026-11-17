# mradermacher/POLAR-14B-HES-DPO-v1.5-i1-GGUF

## Resumen

POLAR-14B-HES-DPO-v1.5-i1-GGUF es la versión cuantizada en formato GGUF del modelo xgen-ai/POLAR-14B-HES-DPO-v1.5, un transformer de 14.221.316.096 parámetros (aproximadamente 14,2 mil millones) afinado con DPO (Direct Preference Optimization) sobre una base previa. La cuantización la ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, utilizando el método imatrix (importance matrix) para preservar mejor la calidad en tasas de compresión agresivas. El modelo está etiquetado como de idioma coreano (`ko`) y se distribuye bajo licencia Apache 2.0.

El interés práctico de esta ficha reside en que ofrece un abanico muy amplio de cuantizaciones (desde i1-IQ1_S de 3,2 GB hasta i1-Q6_K de 11,8 GB), lo que permite ejecutar un modelo de 14B en hardware de consumo muy variado, desde GPUs con 6-8 GB de VRAM hasta estaciones de trabajo con 16 GB o más. Al estar el modelo base afinado con DPO, se espera un comportamiento alineado con preferencias humanas, aunque la información pública disponible sobre el modelo original es escasa.

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. Esta ficha refleja exclusivamente los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; el modelo base es xgen-ai/POLAR-14B-HES-DPO-v1.5) |
| Parametros totales | 14.221.316.096 (aproximadamente 14,2 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Coreano (`ko`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base xgen-ai/POLAR-14B-HES-DPO-v1.5 más allá de que se trata de un transformer de aproximadamente 14,2 mil millones de parámetros. El sufijo "DPO" en el nombre indica que el modelo fue afinado mediante Direct Preference Optimization, una técnica de alineación que ajusta el modelo para preferir respuestas consideradas mejores por anotadores humanos, sin necesidad de un modelo de recompensa separado como en RLHF clásico. El sufijo "HES" y "v1.5" no están documentados en la información proporcionada.

La versión aquí descrita es una cuantización GGUF realizada por mradermacher utilizando el método imatrix (importance matrix), que calcula una matriz de importancia de pesos a partir de un corpus de calibración para minimizar la degradación de calidad en cuantizaciones de baja precisión. El autor indica que se trata de cuantizaciones "weighted/imatrix" y que existen también cuantizaciones estáticas en un repositorio separado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en coreano, idioma principal declarado en la model card.
- Afinado con DPO, lo que sugiere alineación con preferencias humanas en las respuestas.
- Ejecución local mediante llama.cpp y otras herramientas compatibles con GGUF.
- Compatible con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: solo se declara coreano; no hay evidencia de soporte de otros idiomas.
- No se dispone de información sobre capacidades de código o matemáticas.

## Casos de uso

- Despliegue local de un modelo de 14B en hardware de consumo: gracias a las cuantizaciones i1-Q4_K_M (8,7 GB) o i1-IQ4_XS (7,7 GB), el modelo puede ejecutarse en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que permite prototipar aplicaciones en coreano sin depender de la nube.
- Generación de texto en coreano para blogs o documentación: el modelo puede redactar borradores y resúmenes en coreano, aprovechando el afinado DPO para producir respuestas más alineadas con expectativas humanas.
- Chatbot de atención al cliente en coreano: con una cuantización i1-Q5_K_M (10,2 GB) y una GPU de 12-16 GB, se puede servir un asistente conversacional local para dominios acotados, manteniendo los datos en infraestructura propia.
- Experimentación académica con DPO: investigadores que estudien el efecto de la alineación por preferencias pueden comparar esta versión cuantizada con el modelo base en safetensors para analizar la degradación introducida por la cuantización.
- Evaluación de cuantizaciones imatrix: el amplio rango de cuantizaciones (desde 3,2 GB hasta 11,8 GB) permite realizar estudios comparativos de calidad frente a tamaño, útil para quienes investigan técnicas de compresión de modelos.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no está pensado para entrenamiento, la disponibilidad de cuantizaciones intermedias permite evaluar el modelo como base para tareas de adaptación mediante LoRA sobre la versión safetensors original.
- Prototipado en entornos con recursos limitados: la cuantización i1-IQ2_M (5,0 GB) permite probar el modelo en portátiles con GPU de 6 GB, aunque con pérdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - i1-IQ1_S (3,2 GB): cabe en GPUs de 4-6 GB.
  - i1-IQ2_M (5,0 GB): GPUs de 6-8 GB.
  - i1-IQ3_M (6,5 GB) / i1-Q3_K_M (7,0 GB): GPUs de 8 GB.
  - i1-IQ4_XS (7,7 GB) / i1-Q4_K_S (8,2 GB) / i1-Q4_K_M (8,7 GB): GPUs de 10-12 GB.
  - i1-Q5_K_M (10,2 GB): GPUs de 12-16 GB.
  - i1-Q6_K (11,8 GB): GPUs de 16 GB o superiores.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100. Las cuantizaciones de mayor tamaño se benefician de GPUs con 16 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (desde RTX 3060 12 GB hacia arriba); las cuantizaciones IQ1/IQ2 caben incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| POLAR-14B-HES-DPO-v1.5-i1-GGUF | ~14,2 B | no disponible | Apache 2.0 | GGUF (imatrix) | Coreano, afinado con DPO |
| xgen-ai/POLAR-14B-HES-DPO-v1.5 | ~14,2 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/POLAR-14B-HES-DPO-v1.5-GGUF | ~14,2 B | no disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base |

No se dispone de información sobre otros modelos comparables de la misma categoría (14B, coreano, DPO) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de coreano; su rendimiento en castellano u otros idiomas no está documentado.
- La cuantización introduce pérdida de calidad, especialmente en las variantes IQ1 e IQ2; el autor califica la i1-IQ1_S como "for the desperate" y la i1-Q2_K_S como "very low quality".
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento originales.
- El modelo base tiene pocas descargas (45) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.
- No hay información sobre la longitud de contexto, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- El formato GGUF no está pensado para fine-tuning directo; para adaptaciones se debería partir del modelo base en safetensors.
- El tamaño del repositorio (142,5 GB) refleja la suma de todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/POLAR-14B-HES-DPO-v1.5-i1-GGUF
- Modelo base: https://huggingface.co/xgen-ai/POLAR-14B-HES-DPO-v1.5
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/POLAR-14B-HES-DPO-v1.5-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#POLAR-14B-HES-DPO-v1.5-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
