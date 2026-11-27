# mradermacher/AmhariXLM-0.5B-v2-GGUF

## Resumen

AmhariXLM-0.5B-v2-GGUF es la distribucion en formato GGUF del modelo AmhariXLM-0.5B-v2, desarrollado originalmente por fidelizML y cuantizado por mradermacher. Se trata de un modelo de lenguaje de tipo transformer con arquitectura basada en Llama y tokenizador SentencePiece, disenado especificamente para el idioma amharico (am) con soporte adicional de ingles (en). Con 564.575.232 parametros totales, se posiciona en la gama de modelos pequenos orientados a eficiencia y despliegue en hardware modesto.

El modelo ha sido sometido a un proceso de ajuste supervisado (SFT) y esta etiquetado con casos de uso educativos y de razonamiento en cadena (chain-of-thought). Su relevancia radica en cubrir un nicho linguistico poco representado en el ecosistema de modelos abiertos: el amharico, lengua semitica hablada por decenas de millones de personas en Etiopia. La publicacion en GGUF facilita su uso mediante llama.cpp y herramientas compatibles, sin requerir infraestructura de GPU dedicada.

Esta ficha documenta la version cuantizada estatica distribuida por mradermacher, que ofrece un rango de cuantizaciones desde Q2_K hasta f16, con tamanos que van de 0,3 GB a 1,2 GB. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Llama (tag `llama`), tokenizador SentencePiece |
| Parametros totales | 564.575.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | am (amharico), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo original sigue una arquitectura transformer de tipo Llama, segun la etiqueta declarada por el autor, con tokenizador SentencePiece. Los detalles concretos sobre el numero de capas, dimensiones ocultas, cabezas de atencion o funcion de activacion no se especifican en la informacion disponible. El modelo fue sometido a un proceso de ajuste supervisado (SFT) sobre el modelo base, orientado a tareas educativas y de razonamiento en cadena (chain-of-thought).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La version aqui descrita es una cuantizacion estatica generada por mradermacher a partir de los pesos originales en formato Hugging Face, sin cuantizaciones ponderadas por imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto en amharico e ingles, con enfasis declarado en el dominio educativo.
- Razonamiento en cadena (chain-of-thought) segun las etiquetas del modelo.
- Ajuste supervisado (SFT) para seguir instrucciones en el contexto de tareas formativas.
- Soporte bilingue limitado a amharico e ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del chain-of-thought.
- No se documenta capacidad de vision, audio ni modo de pensamiento explicito.
- Compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Tutoria educativa en amharico: el modelo puede generar explicaciones paso a paso de conceptos academicos, aprovechando su ajuste SFT y su orientacion a chain-of-thought para desglosar problemas en etapas comprensibles para estudiantes.
- Traduccion amharico-ingles y viceversa: su naturaleza bilingue permite asistir en la traduccion de material didactico o documentacion, aunque con las limitaciones propias de un modelo de 0,5B parametros.
- Despliegue en dispositivos de bajos recursos: con cuantizaciones desde 0,3 GB (Q2_K), puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace adecuado para entornos con hardware restringido o sin conectividad.
- Generacion de contenido educativo localizado: redaccion de ejercicios, resumenes y material de estudio en amharico para plataformas de aprendizaje.
- Prototipado rapido de asistentes conversacionales en amharico: al ser compatible con llama.cpp y endpoints, permite integrar un chatbot basico en aplicaciones sin infraestructura de servidores potentes.
- Investigacion linguistica: analisis de comportamiento de modelos pequenos en lenguas de bajos recursos, sirviendo como linea base para comparaciones con modelos multilingues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB (Q2_K), 0,4-0,5 GB (Q3/Q4), 0,5-0,6 GB (Q5/Q6), 0,7 GB (Q8_0) y 1,2 GB (f16), sin contar el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 4 GB o mas, e incluso en sistemas integrados.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), y cualquier runtime compatible con GGUF. La version original en transformers puede servirse con vLLM o TGI, aunque esta ficha documenta la distribucion GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AmhariXLM-0.5B-v2-GGUF | 564,6 M | no disponible | am, en | Apache 2.0 | GGUF |
| Qwen2.5-0.5B | 0,5 B aprox. | 32 K aprox. | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 360 M aprox. | 8 K aprox. | mayoritariamente ingles | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B | 2 B aprox. | 8 K aprox. | multilingue | Gemma license | safetensors, GGUF |

Nota: los datos de los modelos comparativos son orientativos y pueden variar; no se dispone de comparaciones de rendimiento directas con AmhariXLM en la informacion proporcionada. La principal ventaja diferencial de AmhariXLM es su especializacion en amharico, lengua ausente o muy minoritaria en los modelos generalistas citados.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: con 0,5B parametros, la fidelidad factual es limitada y puede generar contenido incorrecto, especialmente en tareas de conocimiento especializado.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de mitigacion de sesgos, por lo que pueden aparecer sesgos culturales o linguisticos no evaluados.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el manejo de conversaciones o documentos largos.
- Cobertura linguistica restringida: solo amharico e ingles; no se garantiza un rendimiento aceptable en otras lenguas.
- Capacidades limitadas por tamano: no se documenta tool calling, agentes ni vision, y el razonamiento complejo puede degradarse rapidamente.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de la licencia del modelo base original.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/AmhariXLM-0.5B-v2-GGUF
- Modelo base original: https://huggingface.co/fidelizML/AmhariXLM-0.5B-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#AmhariXLM-0.5B-v2-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
