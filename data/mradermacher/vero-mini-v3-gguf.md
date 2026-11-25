# mradermacher/VERO-Mini-V3-GGUF

## Resumen

VERO-Mini-V3-GGUF es la versión cuantizada en formato GGUF del modelo VERO-Mini-V3, desarrollado originalmente por MagmaStudios y convertido por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 1.540 millones de parámetros (1,543.714.304 según los pesos en safetensors) orientado a conversación, chat y generación de código, con soporte declarado para inglés y español. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo base VERO-Mini-V3 se distribuye a través de la librería transformers, mientras que esta ficha corresponde a la variante GGUF, pensada para inferencia eficiente en CPU y GPU mediante llama.cpp y herramientas compatibles. El repositorio incluye un conjunto completo de cuantizaciones estáticas que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que permite desplegar el modelo en hardware muy modesto, incluyendo equipos de consumo sin GPU dedicada.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y de licencia permisiva para tareas de chat y código en entornos con recursos limitados, con cuantizaciones que caben en menos de 2 GB de VRAM o RAM. No obstante, la información pública disponible sobre el modelo base es escasa: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, según la librería transformers) |
| Parámetros totales | 1.543.714.304 (~1,54 mil millones) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); además existen cuantizaciones ponderadas/imatrix en el repo i1-GGUF |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base VERO-Mini-V3 en la documentación proporcionada. Por el tamaño de parámetros (~1,54 mil millones) y la librería declarada (transformers), se trata presumiblemente de un transformer decoder-only de escala pequeña, pero no se confirma el tipo exacto de atención, la presencia de componentes MoE ni innovaciones como decodificación especulativa o atención lineal.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF se limita a describir el proceso de cuantización realizado por mradermacher, indicando que se generaron cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) a partir del modelo base en formato Hugging Face. No se documentan detalles adicionales de entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno, según las etiquetas "chat" y "conversational".
- Generación de código, según la etiqueta "code".
- Soporte bilingüe declarado para inglés y español.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Asistente de chat ligero en local: el modelo puede ejecutarse en equipos de consumo con cuantizaciones Q4_K_M (1,1 GB) o Q8_0 (1,7 GB), lo que permite desplegar un chatbot conversacional sin GPU dedicada ni conexión a la nube.
- Generación de código en entornos con recursos limitados: gracias a su tamaño reducido y a la cuantización Q6_K (1,4 GB), puede integrarse en editores o scripts de autocompletado donde no es viable un modelo de mayor escala.
- Prototipado rápido de aplicaciones conversacionales: al estar disponible en GGUF y con licencia Apache 2.0, sirve para validar pipelines de chat y código antes de migrar a modelos mayores.
- Atención al cliente automatizada de bajo coste: su naturaleza conversacional y su reducido footprint permiten desplegar múltiples instancias en un solo servidor, aunque la longitud de contexto no está documentada y limita la planificación de conversaciones largas.
- Traducción y asistencia bilingüe inglés-español: el modelo declara soporte para ambos idiomas, por lo que puede emplearse en tareas de reescritura, resumen o generación de texto en esos dos idiomas.
- Inferencia en CPU con llama.cpp u Ollama: las cuantizaciones Q4_K_S y Q4_K_M están marcadas como "fast, recommended" por el autor de la cuantización, lo que las hace adecuadas para despliegues en CPU y en dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,8 GB (Q2_K) y 3,2 GB (f16); las cuantizaciones recomendadas Q4_K_S y Q4_K_M ocupan aproximadamente 1,0-1,1 GB.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones Q4-Q8, incluyendo GTX 1650, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y con endpoints estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VERO-Mini-V3-GGUF | ~1,54 B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Modelos comparables de ~1-2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría en la documentación proporcionada para establecer una comparativa rigurosa con datos verificables.

## Limitaciones y advertencias

- La información pública sobre el modelo base es muy escasa: no se documentan sesgos conocidos, composición del dataset ni procesos de alineación.
- Riesgo de alucinación inherente a modelos de lenguaje de escala pequeña (~1,5 B), especialmente en tareas de razonamiento complejo o conocimiento factual.
- Longitud de contexto no documentada, lo que impide garantizar el rendimiento en conversaciones largas o documentos extensos.
- Soporte idiomático limitado a inglés y español según la model card; no se garantiza calidad en otros idiomas.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M, Q6_K y Q8_0.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original en MagmaStudios/VERO-Mini-V3 antes de un despliegue en producción.
- No se documentan garantías de seguridad, filtrado de contenido ni evaluación de sesgos, por lo que se recomienda implementar salvaguardas adicionales en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VERO-Mini-V3-GGUF
- Modelo base: https://huggingface.co/MagmaStudios/VERO-Mini-V3
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/VERO-Mini-V3-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#VERO-Mini-V3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
