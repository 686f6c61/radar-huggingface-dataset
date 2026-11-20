# mradermacher/nullabby1.5-uncensored-GGUF

## Resumen

nullabby1.5-uncensored-GGUF es la coleccion de cuantizaciones en formato GGUF del modelo nullabby1.5-uncensored, publicado por el usuario mradermacher. El modelo original, alojado en nulliaukamk/nullabby1.5-uncensored, es un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B) derivado de la familia Qwen3.5, segun la etiqueta `qwen3_5` de la model card. Se trata de una variante "abliterated" o "decensored", es decir, con los mecanismos de rechazo y las capas de alineacion de seguridad eliminadas o atenuadas mediante tecnicas de abliteration (proyeccion de la direccion de rechazo fuera de los pesos).

El repositorio que nos ocupa no contiene los pesos originales en precision completa, sino un conjunto de ficheros GGUF listos para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,0 GB). Esto lo hace especialmente practico para despliegue en hardware de consumo, ya que la version Q4_K_M ocupa solo 5,8 GB y cabe en GPUs con 8 GB de VRAM.

La relevancia de esta ficha radica en que documenta un modelo sin censura de tamano medio (8,95 B) con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque con las advertencias propias de un modelo abliterated. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del cuantizador solo describe el proceso de cuantizacion, no las caracteristicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers presumiblemente safetensors, no confirmado |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no proporciona informacion sobre la arquitectura interna del modelo original. La etiqueta `qwen3_5` sugiere que deriva de la familia Qwen3.5 de Alibaba, lo que implicaria un transformer decoder-only con atencion por grupos (GQA) y posiblemente atencion lineal o hibrida, pero no hay confirmacion en la informacion disponible. El tamano de 8,95 B de parametros encaja con la variante de 8B de esa familia.

Respecto al entrenamiento, la model card solo indica las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated`, que describen el proceso de eliminacion de la alineacion de seguridad (abliteration) aplicado sobre el modelo base. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational`.
- Modelo "uncensored": no aplica rechazos de seguridad en las respuestas, lo que permite generar contenido que otros modelos alineados bloquearian.
- Compatible con text-generation-inference y transformers, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles declarado (`en`); no se documentan otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion.
- El proceso de cuantizacion incluye `unsloth` como etiqueta, lo que sugiere que el modelo base pudo ser afinado o preparado con herramientas de Unsloth, pero no se detalla.

## Casos de uso

- Generacion creativa sin restricciones: el modelo puede producir narrativa, dialogos o guiones sobre temas que los modelos alineados rechazan, gracias a la eliminacion de la direccion de rechazo. Adecuado para escritura de ficcion adulta o contenido controvertido en entornos controlados.
- Investigacion sobre alineacion y seguridad: util como caso de estudio para comparar el comportamiento de un modelo abliterated frente a su version alineada, midiendo tasas de rechazo y calidad de respuesta.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (5,8 GB) cabe en GPUs de 8 GB de VRAM (RTX 3060 Ti, RTX 4060, etc.) y permite inferencia offline sin dependencia de APIs.
- Prototipado rapido de chatbots: al ser un modelo de 8,95 B con licencia Apache 2.0, se puede integrar en aplicaciones de chat sin coste de licencia ni restricciones comerciales, siempre que el caso de uso tolere la ausencia de filtros de seguridad.
- Fine-tuning posterior sobre dominio especifico: el modelo base en transformers (no la version GGUF) puede servir como punto de partida para ajuste fino con datos propios, aprovechando su tamano manejable y licencia permisiva.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece diez variantes de cuantizacion, lo que permite medir el impacto de la compresion (de Q2_K a f16) en la perplejidad y la calidad de generacion para un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_S: ~4,4 GB
  - Q3_K_M: ~4,8 GB
  - Q3_K_L: ~5,1 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,8 GB
  - Q5_K_S: ~6,4 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super o RTX 4080 (16 GB); para f16, una A100 40 GB, H100 o RTX 4090 (24 GB) con margen.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en GPUs de 8-16 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-inference (segun etiqueta), y cualquier runtime compatible con GGUF. El modelo base en transformers puede servirse con vLLM o TGI, pero no se confirma compatibilidad.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nullabby1.5-uncensored-GGUF | 8,95 B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, cuantizaciones de 4,0 a 18,0 GB |
| Qwen3-8B (familia base presumible) | ~8 B | no disponible | Apache 2.0 | safetensors, GGUF | Alineado, multilingue; contexto y benchmarks no confirmados en esta ficha |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Alineado, multilingue, con restricciones de licencia para >700 M usuarios |
| Mistral 7B Instruct | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Alineado, ingles principalmente, ampliamente cuantizado |

La comparativa se limita a parametros y licencia porque no hay datos de benchmarks ni de contexto para el modelo evaluado. La principal diferencia frente a las alternativas es su naturaleza abliterated (sin rechazos de seguridad) y su licencia Apache 2.0 sin restricciones de uso comercial.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo puede degradar la coherencia en tareas que requieren matices eticos o prudencia, y aumenta el riesgo de generar contenido danino, ilegal o sesgado sin filtro.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; al ser un modelo de 8,95 B, la tasa de alucinacion es probablemente comparable a la de otros modelos de su tamano, pero no esta medida.
- Solo ingles declarado: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas, aunque el modelo base Qwen3.5 podria tener capacidad multilingue no documentada aqui.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el limite real.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el usuario asume toda la responsabilidad legal sobre el contenido generado, especialmente al tratarse de un modelo sin censura.
- Sin garantias de calidad: el repositorio tiene 0 descargas y 1 like en el momento de la ficha, lo que indica ausencia de validacion comunitaria.
- El proceso de cuantizacion es estatico (sin imatrix), por lo que las variantes de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la perplejidad frente a cuantizaciones ponderadas.
- No se dispone de informacion sobre sesgos especificos del modelo base ni sobre la composicion de sus datos de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nullabby1.5-uncensored-GGUF
- Modelo base: https://huggingface.co/nulliaukamk/nullabby1.5-uncensored
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#nullabby1.5-uncensored-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
