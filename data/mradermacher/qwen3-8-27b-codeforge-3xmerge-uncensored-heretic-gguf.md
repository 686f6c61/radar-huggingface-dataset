# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF es una distribucion de cuantizaciones GGUF estaticas del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic, publicada por mradermacher. Se trata de un merge de tres variantes del modelo Qwen3.8 de 27B, orientado a generacion de codigo, razonamiento, uso de herramientas y razonamiento agentico, al que se ha aplicado un proceso de "abliteration" (eliminacion de rechazos) que da lugar a una variante sin censura. El repositorio incluye unicamente los pesos cuantizados en formato GGUF, no el modelo original en safetensors.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 27B) y esta disenado para tareas de codigo y razonamiento eficiente, con soporte declarado para ingles y chino. La licencia es Apache 2.0. El repositorio ocupa 187,9 GB e incluye cuantizaciones desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), ademas de ficheros mmproj para componentes multimodales.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B especializado en codigo en hardware de consumo mediante cuantizacion GGUF, aunque con las advertencias propias de un modelo "uncensored" y de un merge no evaluado con benchmarks publicos. No se dispone de informacion sobre el pipeline ni de resultados de evaluacion en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza transformer derivada de la familia Qwen3.8. El modelo es un merge de tres variantes (3xMerge) del modelo CodeForge, segun se desprende del nombre, y ha sido sometido a un proceso de abliteration/decensoring que elimina los mecanismos de rechazo del modelo original. Los tags indican que incorpora destilacion, razonamiento eficiente ("efficient-thinking"), capacidades agenticas y de uso de herramientas, asi como instruction-following.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El repositorio de mradermacher es exclusivamente de cuantizacion estatica: no incluye cuantizaciones ponderadas ni imatrix, que el autor indica que probablemente no estaran disponibles.

## Capacidades

- Generacion de codigo y completado de codigo en multiples lenguajes (segun los tags code-generation y coding).
- Razonamiento y razonamiento eficiente ("efficient-thinking", "reasoning").
- Uso de herramientas y function calling ("tool-use").
- Flujos agenticos y razonamiento multi-paso ("agentic").
- Seguimiento de instrucciones ("instruction-following").
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que sugiere soporte de entrada visual, aunque no se detalla su alcance.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Variante sin censura ("uncensored", "decensored", "abliterated") que reduce los rechazos del modelo base.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede utilizarse como copiloto de codigo en entornos de desarrollo integrados mediante llama.cpp u Ollama, aprovechando las cuantizaciones Q4_K_M (16,6 GB) para equipos con 24 GB de VRAM.
- Generacion de codigo en pipelines de CI/CD: con soporte declarado de tool calling, puede integrarse en flujos automatizados de generacion de tests, revision de parches o documentacion tecnica.
- Agentes autonomos de codigo: sus capacidades agenticas y de razonamiento multi-paso permiten construir agentes que planifican, ejecutan y verifican tareas de programacion sobre repositorios.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K a Q4_K_S permiten ejecutar un modelo de 27B en GPUs consumer de 12-24 GB, algo inviable con los pesos completos en f16.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo y comparar con el modelo original.
- Procesamiento de documentacion tecnica bilingue (ingles-chino): util para equipos que trabajan con documentacion en ambos idiomas.
- Entornos con requisitos de privacidad: la ejecucion local en formato GGUF evita el envio de codigo propietario a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del fichero, mas overhead de contexto y KV cache):
  - Q2_K: ~10,8 GB
  - Q3_K_S: ~12,2 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~14,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_S: ~18,8 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas: para Q8_0 y Q6_K se recomienda una RTX 4090 (24 GB) o superior, o bien A100/H100 para despliegues con contexto largo. Para Q4_K_M y Q5_K_M, una RTX 4090 o RTX 3090 (24 GB) es suficiente. Para Q2_K a Q3_K_L, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones; Q2_K y Q3_K_S caben en GPUs de 12 GB, y Q4_K_M en 24 GB con margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. No se documenta soporte de vLLM o TGI para esta cuantizacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic (este) | ~27B | no disponible | Apache 2.0 | GGUF | Merge abliterated especializado en codigo |
| Modelo base xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic | ~27B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Alternativas de la familia Qwen3.8 de 27B | ~27B | no disponible | Apache 2.0 | safetensors/GGUF | No se dispone de datos comparativos especificos |

No se dispone de informacion suficiente para comparar rendimiento con alternativas concretas; no se han publicado benchmarks en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: se ha eliminado el comportamiento de rechazo, lo que puede producir contenido inapropiado, peligroso o legalmente problematico. No es recomendable su uso en produccion orientada al usuario final sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones que cuantifiquen la tasa de alucinacion; al ser un merge de tres variantes, el comportamiento puede ser menos predecible que el de un modelo entrenado de forma unica.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en contextos largos.
- El modelo es un merge no oficial de variantes, sin documentacion sobre el dataset de entrenamiento ni sobre el proceso de alineacion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la calidad; el autor recomienda Q4_K_M o superiores.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que puede reducir la calidad respecto a otras distribuciones.
- Uso comercial permitido por la licencia Apache 2.0, pero la responsabilidad sobre el contenido generado recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
