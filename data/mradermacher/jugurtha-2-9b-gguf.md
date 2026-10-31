# mradermacher/Jugurtha-2-9B-GGUF

## Resumen

Jugurtha-2-9B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo agbalu/Jugurtha-2-9B, realizadas por el cuantizador mradermacher. El modelo base es un LLM de 9,2 mil millones de parámetros orientado a la generación de texto con capacidades de razonamiento e instrucción (instruction-tuned), con un enfoque destacable en lenguas de bajo recursos: el cabileño (kabyle/taqbaylit), una lengua bereber (amazigh), además de inglés y francés. Se enmarca en la corriente de "sovereign AI" (IA soberana) para lenguas minorizadas.

La relevancia de esta ficha radica en que son muy pocos los modelos abiertos que cubren el kabyle, por lo que Jugurtha-2 representa una opción casi única para desarrolladores que trabajen con esta comunidad lingüística. Las cuantizaciones GGUF permiten ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles, con versiones desde 4 GB (Q2_K) hasta 18,5 GB (f16). El repositorio incluye además archivos mmproj (suplementos multimodales), lo que sugiere soporte de visión en el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), no disponible mayor detalle |
| Parámetros totales | 9.197.093.888 (≈9,2 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | kabyle (kab), inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, agbalu/Jugurtha-2-9B, es un modelo de lenguaje causal basado en transformer con aproximadamente 9,2 mil millones de parámetros, ajustado por instrucciones (instruction-tuned) y con etiquetas que indican capacidades de razonamiento y "thinking" (pensamiento extendido). No se ha publicado en la información disponible el detalle de la arquitectura concreta (atención, capas, tamaño de vocabulario) ni el procedimiento de entrenamiento.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada. Lo que sí consta es su orientación multilingüe hacia el kabyle (taqbaylit), una lengua bereber/amazigh de bajo recursos, junto con inglés y francés, lo que sugiere un entrenamiento o ajuste fino específico con corpus en cabileño. La presencia de archivos mmproj en las cuantizaciones indica que el modelo base incorpora un proyector multimodal para entrada de imágenes, aunque su funcionamiento en el ecosistema GGUF depende del soporte del runtime.

## Capacidades

- Generación de texto conversacional en cabileño (kabyle/taqbaylit), inglés y francés.
- Modelo ajustado por instrucciones (instruction-tuned), apto para asistentes y chat.
- Capacidades de razonamiento y modo "thinking" según las etiquetas del modelo base.
- Posible entrada multimodal (visión) mediante los archivos mmproj-Q8_0 y mmproj-f16 incluidos en el repo.
- Etiquetado como "sovereign AI" y "low-resource": orientado a lenguas minorizadas.
- Ejecución local en CPU y GPU gracias al formato GGUF, con compatibilidad para endpoints (endpoints_compatible).
- No consta soporte oficial de tool calling ni de agentes en la información disponible.

## Casos de uso

- Asistentes conversacionales en cabileño: el modelo es uno de los pocos LLM abiertos con soporte nativo de kabyle, lo que lo hace idóneo para chatbots de atención al usuario dirigidos a la comunidad amazigh en Argelia y la diáspora.
- Traducción y asistencia lingüística cabileño-francés-inglés: puede usarse para redacción, corrección y apoyo a la traducción entre las tres lenguas soportadas, útil en medios de comunicación y proyectos de normalización lingüística.
- Preservación y documentación lingüística: investigadores y activistas pueden emplearlo para generar material didáctico, resúmenes y contenido educativo en taqbaylit, una lengua con escasos recursos digitales.
- Razonamiento con respuestas extendidas: gracias a las etiquetas de reasoning y thinking, puede aplicarse a tareas de resolución de problemas y redacción estructurada donde se requiera deliberación previa.
- Prototipado local sin conexión: las cuantizaciones Q4_K_M (5,9 GB) permiten ejecutar el modelo en portátiles y equipos de consumo sin depender de la nube, útil para contextos con conectividad limitada.
- Aplicaciones con entrada de imágenes: si el runtime soporta mmproj (por ejemplo, versiones recientes de llama.cpp), puede usarse para descripción de imágenes o consultas visuales combinadas con texto en los idiomas soportados.
- Investigación en IA para lenguas de bajo recursos: sirve como base de estudio y punto de partida para ajustes finos adicionales, dado su licenciamiento permisivo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaño de archivo, más overhead de contexto):
  - Q2_K: ~4 GB, viable en CPU con 8 GB de RAM.
  - Q4_K_S / Q4_K_M: 5,6-5,9 GB, recomendadas; caben en una GPU de 8 GB (RTX 3060, RTX 4060) con margen para contexto.
  - Q5_K_M / Q6_K: 6,7-7,7 GB, cómodas en GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070).
  - Q8_0: 9,9 GB, requiere GPU de 12-16 GB (RTX 4070 Ti S, RTX 4080) o CPU con 16 GB de RAM.
  - f16: 18,5 GB, requiere GPU de 24 GB (RTX 3090/4090, A10G) o 32 GB de RAM en CPU.
- GPU recomendadas: RTX 3060 12 GB o superior para uso fluido en Q4/Q5; RTX 4090 para f16; en servidores, cualquier GPU con 24 GB (A5000, L40S, A100).
- Sí cabe en GPU de consumo: la mayoría de cuantizaciones (Q2_K a Q8_0) funcionan en tarjetas domésticas de 8-24 GB; en CPU pura, bastan 8-16 GB de RAM para las cuantizaciones bajas y medias.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF; el modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponible; en general, las cuantizaciones Q4 en GPU de consumo ofrecen decenas de tokens por segundo en modelos de este tamaño, pero no se han publicado mediciones concretas.
- Cuantizaciones ponderadas/imatrix adicionales disponibles en mradermacher/Jugurtha-2-9B-i1-GGUF, con mejor relación calidad/tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas destacados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jugurtha-2-9B (base) | 9,2 B | kab, en, fr | no disponible | Apache 2.0 | HF, GGUF y safetensors |
| Qwen2.5-7B-Instruct | 7,6 B | multilingüe (~29 lenguas), sin kabyle | 128 K | Apache 2.0 (algunas variantes) | HF, GGUF, despliegue masivo |
| Gemma 2 9B IT | 9,2 B | multilingüe (~110 lenguas), sin kabyle | 8 K | Gemma license (restricciones) | HF, GGUF |
| Llama 3.1 8B Instruct | 8 B | multilingüe (8 lenguas oficiales), sin kabyle | 128 K | Llama Community License | HF, GGUF |

Jugurtha-2-9B se diferencia por su cobertura del kabyle, ausente en los modelos generalistas de su gama; a cambio, carece de datos públicos de benchmarks y de una ventana de contexto documentada en la información disponible.

## Limitaciones y advertencias

- No hay benchmarks publicados para el modelo base ni para las cuantizaciones, por lo que su rendimiento en tareas estándar (MMLU, HumanEval, etc.) es desconocido y debe evaluarse caso por caso.
- El rendimiento en kabyle puede ser irregular dada la escasez de datos de entrenamiento típicos de las lenguas de bajo recursos; existe riesgo elevado de alucinaciones y errores gramaticales en esa lengua.
- La longitud de contexto no está documentada; conviene verificarla empíricamente antes de diseñar aplicaciones con documentos largos.
- El soporte multimodal vía mmproj depende del runtime y puede no estar soportado por todas las versiones de llama.cpp u Ollama.
- Las cuantizaciones más agresivas (Q2_K, Q3_K_S/M) degradan visiblemente la calidad, especialmente en lenguas de bajo recursos; se recomiendan Q4_K_M o superiores.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero el modelo hereda los sesgos de sus datos de entrenamiento, no disponibles para auditoría en la información proporcionada.
- El modelo puede presentar sesgos culturales y lingüísticos hacia el francés y el inglés frente al kabyle, dado el desbalance habitual de corpus entre estas lenguas.
- Al tratarse de un modelo de nicho con pocas descargas (982 en el momento de la ficha), la comunidad de soporte y la documentación son limitadas.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Jugurtha-2-9B-GGUF
- Modelo base: https://huggingface.co/agbalu/Jugurtha-2-9B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Jugurtha-2-9B-i1-GGUF
- Página de descarga con vista general: https://hf.tst.eu/model#Jugurtha-2-9B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
