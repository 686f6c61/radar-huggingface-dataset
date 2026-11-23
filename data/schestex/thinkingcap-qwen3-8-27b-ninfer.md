# Schestex/ThinkingCap-Qwen3.8-27B-NInfer

## Resumen

ThinkingCap-Qwen3.8-27B-NInfer es una conversión nativa para el runtime NInfer del modelo ThinkingCap Qwen3.8-27B de BottleCap AI, publicada por el usuario Schestex bajo la etiqueta CodeDense. Se distribuye como un artefacto de pesos en formato `.ninfer` con cuantización mixta (Q8 G32 en las matrices de vocabulario y cabeza de lenguaje, no Q8 en su totalidad), un vocabulario público compacto de 122.919 tokens respaldado por 123.136 filas físicas, y una clasificación de vocabulario de propuestas Indexed88 para decodificación especulativa MTP5. El objetivo declarado es servir flujos de trabajo de código y orientados a agentes en inglés y alemán.

La relevancia de esta ficha no reside en un nuevo modelo base, sino en la ingeniería de despliegue: el autor documenta una reducción progresiva del vocabulario (de 131.206 a 122.919 tokens públicos) acompañada de una mejora medida del throughput de decodificación MTP5 del 13,19 %, y una tasa de aceptación de borradores del 60,02 % en una prueba con prompts de código. Es, por tanto, un artefacto de optimización de inferencia, no un fine-tune de dominio ni una mejora de capacidades.

El modelo base es un transformer denso de 27B parámetros de la familia Qwen3.8. La licencia es Polyform Small Business plus Personal Use Grant, con restricciones relevantes para uso comercial. El repositorio ocupa 214,7 GB y acumula 523 descargas y 5 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8); soporte de decodificación especulativa MTP5 en el runtime NInfer |
| Parámetros totales | 27B (según el nombre del modelo base; no se detalla en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Cuantización mixta NInfer; Q8 G32 en embedding y cabeza de lenguaje (no es un artefacto totalmente Q8) |
| Idiomas soportados | Inglés (británico y americano) y alemán como foco objetivo; la model card advierte que no es una garantía de soporte exclusivo |
| Licencia | Polyform Small Business plus Personal Use Grant (`license: other`) |
| Formato de pesos | `.ninfer` (no es Transformers, ni Safetensors, ni GGUF); requiere runtime NInfer compatible con vocabulario compacto, forma Q8, MTP5 e Indexed88 |
| Tamaño del artefacto | 15.687.110.660 bytes (~14,61 GiB) |
| Vocabulario público | 122.919 tokens (123.136 filas físicas con padding) |
| Ranking de propuestas | `indexed88-122919-r2-88064.i32le`, 88.064 IDs seleccionados |
| SHA-256 del modelo | `064241b4949628bf2cf2e12152648fede602d70c629d8f2016c3281217bc221d` |
| SHA-256 del ranking | `1aa39fc62e5db6fb9e915e0ae2593fa5fa2b11e1793c86aca94a87f5a7f7270b` |
| Release | `codedense-compact122919-q8-en-de-v1.0.0` |
| Runtime de referencia | `Xtravaganz/ninfer`, fijado por etiqueta de release de GitHub |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros de la familia Qwen3.8, sobre el que BottleCap AI construyó ThinkingCap. Esta publicación no entrena el modelo: aplica una conversión de formato y una compresión de vocabulario. El vocabulario público se reduce a 122.919 IDs sobre una matriz física de 123.136 filas, y las matrices de vocabulario y de la cabeza de lenguaje se almacenan en Q8 con granularidad de grupo 32. El resto de pesos usa cuantización mixta propia del formato NInfer.

La innovación central es la decodificación especulativa MTP5 (multi-token prediction con ventana de borrador de hasta cinco tokens) apoyada en una clasificación Indexed88 que restringe el vocabulario de propuestas a 88.064 IDs. Esta clasificación se distribuye como artefacto compañero separado y debe montarse en la ruta que exija el runtime, configurada mediante `NINFER_MTP_INDEXED_RANKING`. El autor documenta una evolución por generaciones (Compact131206-v3, Compact129430-v4, Compact129430-v5-r2, Compact122919-r615) en la que la reducción del 6,32 % del vocabulario público se acompaña de una mejora del 13,19 % en throughput de decodificación MTP5. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y orientada a código, heredadas del modelo base ThinkingCap Qwen3.8-27B.
- Flujos de trabajo de código en inglés y alemán, según el foco declarado `en-de`.
- Decodificación especulativa MTP5 con vocabulario de propuestas Indexed88, que acelera la generación en el runtime NInfer.
- Verificación de integridad de artefactos mediante SHA-256 y FNV64 documentados.
- Despliegue en contenedor Docker con imagen de runtime verificada localmente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Generación de código asistida en inglés y alemán: el modelo puede integrarse en editores o pipelines de revisión para autocompletar y explicar código, aprovechando el foco bilingüe declarado y el vocabulario compacto orientado a código.
- Autocompletado de baja latencia en IDE: la decodificación especulativa MTP5 con Indexed88 eleva el throughput de decodificación medido por encima de 100 tok/s en las pruebas del autor, lo que resulta adecuado para sugerencias en línea.
- Servicio de inferencia autoalojado con runtime NInfer: equipos que ya operan NInfer pueden desplegar el artefacto en Docker y verificar su integridad con los hashes publicados antes de servir tráfico.
- Evaluación de técnicas de compresión de vocabulario: investigadores pueden reproducir la comparativa entre generaciones Compact131206, Compact129430 y Compact122919 para medir el impacto del vocabulario en la aceptación de borradores.
- Procesamiento de documentación técnica bilingüe inglés-alemán: resúmenes y transformación de textos técnicos en ambos idiomas, con la advertencia de que el soporte no está garantizado más allá del foco declarado.
- Investigación sobre decodificación especulativa: el par de artefactos (modelo más ranking Indexed88) permite experimentar con ventanas de borrador MTP0 a MTP5 y medir tasas de aceptación bajo distintas cargas.

## Benchmarks y rendimiento

Rendimiento de decodificación MTP0–MTP5 sobre GPU1 a 145 W, con CUDA Graph y un corpus de 65.536 tokens:

| Ventana de borrador | Decode (tok/s) | Aceleración vs. MTP0 | Aceptación de borradores |
|---|---:|---:|---:|
| MTP0 | 33,68 | 1,00× | No aplica |
| MTP1 | 48,45 | 1,44× | 59,38 % |
| MTP2 | 54,31 | 1,61× | 50,79 % |
| MTP3 | 54,16 | 1,61× | 41,64 % |
| MTP4 | 50,40 | 1,50× | 28,24 % |
| MTP5 | 45,64 | 1,35× | 21,95 % |

Evolución del throughput MTP5 por generación de vocabulario compacto:

| Versión | Vocabulario público | Decode (tok/s) | Mejora vs. anterior |
|---|---:|---:|---:|
| Compact131206-v3 | 131.206 | 89,85 | Línea base |
| Compact129430-v4 | 129.430 | 96,85 | +7,79 % |
| Compact129430-v5-r2 | 129.430 | 99,75 | +2,99 % |
| Compact122919-r615 | 122.919 | 101,70 | +1,95 % |

Observación con Compact122919 e Indexed88 sobre prompts de código: 1.916 tokens borrador, 1.150 aceptados, aceptación del 60,02 %. El autor advierte que estos resultados y los históricos se obtuvieron bajo cargas distintas y no constituyen una comparación controlada. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa ~14,61 GiB en cuantización mixta Q8; se requiere al menos esa cifra más el espacio de estados de atención, caché KV y buffers del runtime. La memoria total necesaria no está especificada.
- GPU recomendadas: no disponibles en la información proporcionada. El benchmark se ejecutó en una GPU identificada solo como "GPU1" a 145 W, sin modelo especificado.
- GPU de consumo: el tamaño del artefacto (~14,61 GiB) es compatible en términos de capacidad con GPU de 24 GB como la RTX 4090, pero el runtime NInfer y su compatibilidad con CUDA Graph y MTP5 en hardware de consumo no están documentados.
- Opciones de despliegue: exclusivamente runtime NInfer (`Xtravaganz/ninfer`, fijado por etiqueta de release) en contenedor Docker. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` no es GGUF ni Safetensors.
- Latencia y throughput: 101,70 tok/s de decodificación MTP5 en la generación Compact122919-r615; máximo histórico medido de 54,31 tok/s en MTP2 con la configuración original.
- Configuración del runtime: la clasificación Indexed88 debe montarse en la ruta requerida y configurarse con `NINFER_MTP_INDEXED_RANKING` cuando corresponda.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-NInfer (esta ficha) | 27B denso | No disponible | `.ninfer` (Q8 mixto) | Polyform Small Business + Personal Use | Runtime NInfer únicamente |
| bottlecapai/ThinkingCap-Qwen3.8-27B (base) | 27B denso | No disponible | No disponible | Polyform Small Business + Personal Use | Ecosistema estándar del modelo base |
| Alternativas de la familia Qwen3.8 de 27B | 27B denso | No disponible | Safetensors, GGUF (según distribución) | No disponible | vLLM, llama.cpp, TGI, Ollama |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de esta conversión con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto `.ninfer` no es un checkpoint de Transformers, ni Safetensors, ni GGUF: no puede cargarse en vLLM, llama.cpp, Ollama ni TGI.
- Una compilación arbitraria de NInfer no cargará necesariamente este modelo; se requiere soporte de vocabulario compacto, forma Q8, MTP5 e Indexed88.
- La etiqueta Docker `ninfer-thinkingcap:compact122919-q8-codedense-en-de-v1` es local; no se distribuye públicamente salvo que el publicador la suba a un registro.
- El autor declara explícitamente que esta release no es un fine-tune de código a nivel de modelo, no garantiza paridad de precisión con el modelo base y no elimina dominios mediante entrenamiento.
- `en-de` indica un foco de idioma objetivo, no una garantía de que solo se soporten inglés y alemán.
- La licencia Polyform Small Business plus Personal Use Grant impone restricciones al uso comercial por parte de empresas que superen el umbral de pequeña empresa; debe revisarse antes de cualquier despliegue en producción.
- Los resultados de aceptación de borradores proceden de cargas de trabajo distintas y no constituyen una comparación controlada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con requisitos de ventana larga.
- El repositorio ocupa 214,7 GB, muy por encima del tamaño del artefacto principal, lo que sugiere artefactos adicionales no detallados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Schestex/ThinkingCap-Qwen3.8-27B-NInfer
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B/blob/main/LICENSE
- Runtime NInfer: https://github.com/Xtravaganz/ninfer
