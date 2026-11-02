# mradermacher/NaNovel-35B-A3B-GGUF

## Resumen

NaNovel-35B-A3B-GGUF es la version cuantizada en formato GGUF del modelo NaNovel-35B-A3B, desarrollado originalmente por Dxniz y empaquetado por mradermacher para su uso con llama.cpp y otras herramientas compatibles con GGUF. Se trata de un modelo de lenguaje especializado en escritura creativa y generacion de novela, construido sobre una arquitectura Qwen 3.5 de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parametros totales (aproximadamente 35 mil millones) y, segun el nombre del modelo, unos 3 mil millones de parametros activos por token.

El modelo ha sido afinado sobre el dataset Novelist-CoT, lo que sugiere un entrenamiento orientado a razonamiento encadenado (chain-of-thought) aplicado a la generacion narrativa: el modelo no solo produce texto, sino que razona sobre estructuras narrativas, personajes y continuidad argumental antes de escribir. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el unico idioma declarado es el ingles.

La relevancia de esta ficha radica en que mradermacher ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K hasta Q8_0, ademas de IQ4_XS y suplementos multimodales mmproj), lo que permite desplegar un modelo MoE de 35B en hardware de consumo. El repositorio ocupa 238,4 GB en total, aunque cada cuantizacion individual oscila entre 12,9 GB (Q2_K) y 37,0 GB (Q8_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Qwen 3.5 |
| Parametros totales | 34.660.610.688 (aprox. 35B) |
| Parametros activos | aprox. 3B (segun nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 (multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, derivada de la familia Qwen 3.5, con 34.660.610.688 parametros totales y un regimen de activacion dispersa de aproximadamente 3B parametros por token (de ahi el sufijo A3B). Esta configuracion permite que el coste computacional por token se acerque al de un modelo denso de 3B mientras se mantiene la capacidad representacional de un modelo de 35B, lo que explica que las cuantizaciones Q4_K_M (21,3 GB) puedan ejecutarse en GPUs de consumo con suficiente VRAM.

El modelo base Dxniz/NaNovel-35B-A3B fue afinado sobre el dataset Dxniz/Novelist-CoT, un corpus orientado a escritura de novela con cadenas de razonamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La etiqueta chain-of-thought sugiere que el modelo fue entrenado para generar razonamiento explicito antes de la respuesta final, practica habitual en tareas de planificacion narrativa. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto creativo y narrativo: escritura de ficcion, novelas, relatos y continuaciones argumentales.
- Razonamiento encadenado (chain-of-thought) aplicado a la planificacion de tramas, desarrollo de personajes y coherencia narrativa.
- Generacion de texto general y conversacion multi-turno (etiqueta conversational).
- Soporte multimodal: el repositorio incluye suplementos mmproj-Q8_0 y mmproj-f16, lo que indica capacidad de procesar entrada visual en el modelo base.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la naturaleza CoT del afinamiento es compatible con flujos de razonamiento por etapas.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Escritura asistida de novela: el modelo puede generar capitulos completos manteniendo coherencia de personajes y trama gracias a su entrenamiento especifico sobre Novelist-CoT y su capacidad de razonamiento narrativo previo a la escritura.
- Generacion de borradores de ficcion para autores: util para producir primeros borradores de relatos o escenas que el autor luego revisa y edita, reduciendo el tiempo de arranque creativo.
- Continuacion de manuscritos existentes: con contexto suficiente (longitud no confirmada), puede continuar textos largos respetando el tono y el estilo establecidos por el autor.
- Creacion de contenido narrativo para videojuegos y RPG: generacion de dialogos, descripciones de mundo y tramas secundarias coherentes con un lore predefinido.
- Prototipado de guiones y storytelling para medios: generacion rapida de estructuras narrativas y guiones para produccion audiovisual o podcasts.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (21,3 GB) y Q5_K_M (24,9 GB), puede ejecutarse en una unica GPU de consumo de gama alta para escritura offline sin dependencia de la nube.
- Investigacion sobre razonamiento CoT en tareas creativas: el modelo sirve como banco de pruebas para estudiar como el razonamiento explicito afecta a la calidad y coherencia de la generacion literaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluyendo overhead de contexto):
  - Q2_K (12,9 GB): a partir de 14-16 GB de VRAM.
  - Q3_K_M (16,9 GB): a partir de 18-20 GB de VRAM.
  - IQ4_XS (19,0 GB): a partir de 20-22 GB de VRAM.
  - Q4_K_M (21,3 GB): a partir de 22-24 GB de VRAM.
  - Q5_K_M (24,9 GB): a partir de 26-28 GB de VRAM.
  - Q6_K (28,6 GB): a partir de 30-32 GB de VRAM.
  - Q8_0 (37,0 GB): a partir de 38-40 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y cuantizaciones inferiores; A100 40 GB o H100 para Q6_K y Q8_0; configuraciones multi-GPU para cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un MoE con aproximadamente 3B parametros activos, se espera un throughput por token notablemente superior al de un modelo denso de 35B, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NaNovel-35B-A3B-GGUF | 34,66B totales / aprox. 3B activos | no disponible | Apache 2.0 | GGUF | Especializado en novela y CoT |
| Qwen 3.5 base (familia) | segun variante | no disponible | segun variante | safetensors, GGUF | Modelo generalista del que deriva |
| Modelos densos de 30-35B | aprox. 30-35B | no disponible | variable | safetensors, GGUF | Mayor coste por token al no ser MoE |

No se dispone de datos de benchmarks ni de comparativas publicadas con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Especializacion: el afinamiento en escritura de novela puede degradar el rendimiento en tareas generales de codigo, matematicas o razonamiento logico no narrativo.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, nombres o continuidad inconsistente en textos largos; requiere revision humana en produccion.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide garantizar coherencia en manuscritos muy largos.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset Novelist-CoT puede introducir sesgos estilisticos o culturales propios del corpus.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del modelo base Dxniz/NaNovel-35B-A3B.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S pueden degradar notablemente la calidad narrativa; se recomienda Q4_K_M o superior para produccion.
- Suplementos multimodales: los ficheros mmproj requieren un runtime que soporte vision; su funcionalidad exacta no esta documentada en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NaNovel-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Dxniz/NaNovel-35B-A3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/NaNovel-35B-A3B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NaNovel-35B-A3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Dxniz/Novelist-CoT
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
