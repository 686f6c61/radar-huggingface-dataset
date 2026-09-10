# mradermacher/KAT-Ornith-Coder-35B-A3B-GGUF

## Resumen

`mradermacher/KAT-Ornith-Coder-35B-A3B-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF generadas por el usuario mradermacher a partir del modelo base `OliviaRossi/KAT-Ornith-Coder-35B-A3B`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local mediante llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp). El repositorio se publicó el 10 de septiembre de 2026 según la fecha registrada en HuggingFace y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que carece de validación comunitaria.

El nombre del modelo sugiere un transformer de tipo mezcla de expertos (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones activos por token (el sufijo "A3B" sigue la convención habitual de Qwen3-MoE y similares), además de una especialización en código por el sufijo "Coder". Sin embargo, la model card publicada no incluye ninguna confirmación de arquitectura, longitud de contexto, composición del dataset ni proceso de entrenamiento, por lo que estas características deben considerarse inferencias a partir de la nomenclatura y no datos verificados.

La relevancia de esta ficha es limitada y eminentemente práctica: sirve para saber que existe una versión cuantizada lista para desplegar en local de un modelo cuyo original no está documentado públicamente. No hay resultados de benchmarks, no se declara licencia y no se especifican idiomas soportados, de modo que cualquier uso en producción exige verificar primero esos extremos con el autor del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La nomenclatura "A3B" sugiere mezcla de expertos (MoE), sin confirmar en la documentación |
| Parámetros totales | 35 000 millones según la nomenclatura del repositorio; no confirmado en la model card |
| Parámetros activos | Aproximadamente 3000 millones según el sufijo "A3B"; no confirmado |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card de esta cuantización no la declara; hay que remitirse al modelo base) |
| Formato de pesos | GGUF (generado con llama.cpp; f16 es el tensor de referencia sin cuantizar) |
| Metadatos de cuantización | `quantize_version: 2`, `convert_type: hf`, `output_tensor_quantised: 1` |
| Modelo base | `OliviaRossi/KAT-Ornith-Coder-35B-A3B` |
| Fecha de publicación | 10 de septiembre de 2026 (fecha registrada en HuggingFace) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en los materiales disponibles. La model card de esta cuantización se limita a indicar que se trata de "static quants" del repositorio `OliviaRossi/KAT-Ornith-Coder-35B-A3B`, es decir, conversiones a GGUF realizadas con la herramienta de cuantización de llama.cpp a partir de pesos en formato HuggingFace (`convert_type: hf`). No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento.

Los únicos indicios técnicos son indirectos: el sufijo "35B-A3B" es la convención empleada habitualmente para describir modelos MoE con 35 000 millones de parámetros totales y 3000 millones activos, y el sufijo "Coder" apunta a un ajuste orientado a generación de código. Ninguna de estas dos inferencias está confirmada por documentación del autor, y el prefijo "KAT" no corresponde a ninguna familia de modelos ampliamente conocida. Tampoco hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o variantes híbridas SSM.

## Capacidades

- Generación de texto y de código: es la capacidad esperada por el sufijo "Coder" del nombre, pero no está documentada ni verificada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades multimodales (visión, audio): no disponible; el pipeline de HuggingFace no está especificado.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ejecución local eficiente: capacidad inherente al formato GGUF, con doce variantes de cuantización que cubren desde ~16 bits hasta Q2_K.

## Casos de uso

Dado que no hay documentación funcional del modelo, los casos siguientes son escenarios plausibles para un modelo MoE de ~35B orientado a código y empaquetado en GGUF. Deben validarse empíricamente antes de llevarlos a producción.

- Autocompletado y asistencia de código en el IDE: con unos 3000 millones de parámetros activos por token (si se confirma la arquitectura MoE), la generación sería lo bastante rápida para completar líneas y bloques en herramientas tipo Continue o tabby, ejecutándose en local sin enviar código a terceros.
- Refactorización de repositorios pequeños y medianos: el modelo puede recibir varios ficheros como contexto y proponer cambios estructurales; conviene usar la variante Q6_K o Q8_0 para preservar fidelidad en tareas de reescritura.
- Generación de tests unitarios y documentación técnica: tarea de bajo riesgo donde un fallo se detecta en la revisión de código, adecuada para un modelo sin benchmarks publicados.
- Explicación y traducción de código legado: útil para equipos que migran bases de código antiguas y necesitan resúmenes funcionales por fichero.
- Despliegue en estaciones de trabajo sin GPU dedicada: las variantes Q4_K_M y Q3_K_M permiten inferencia mixta CPU/GPU en equipos con 16-32 GB de RAM, algo que un modelo denso de 35B haría inviable en esas condiciones.
- Prototipado de agentes de codificación en local: si el modelo base soporta tool calling, podría conectarse a un intérprete de Python o a un sistema de ficheros mediante llama.cpp y plantillas de chat adecuadas; requiere verificación previa.
- Filtrado y clasificación de fragmentos de código en pipelines internos: por ejemplo, etiquetar si un fragmento es seguro, obsoleto o duplicado antes de indexarlo en una base de conocimiento.
- Evaluación comparativa interna: sirve como candidato adicional en un banco de pruebas propio, ya que al ser GGUF se puede medir en el mismo hardware que otros modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de búsqueda web contienen datos de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluación. Tampoco hay métricas de latencia o throughput medidas por el autor.

## Requisitos de hardware

Los tamaños siguientes son estimaciones a partir del número de parámetros declarado en el nombre (35B) y de los bits por peso típicos de cada tipo de cuantización de llama.cpp. No están medidos sobre estos ficheros concretos, por lo que pueden variar.

- VRAM/RAM aproximada por cuantización (pesos, sin contar caché KV):
  - Q2_K: ~12-14 GB
  - Q3_K_S: ~15 GB; Q3_K_M: ~16-17 GB; Q3_K_L: ~18-19 GB
  - Q4_K_S: ~19-20 GB; Q4_K_M: ~20-21 GB
  - Q5_K_S: ~23-24 GB; Q5_K_M: ~24-25 GB
  - Q6_K: ~28-30 GB
  - Q8_0: ~36-38 GB
  - f16: ~70 GB
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q4_K_S; A6000, L40S o A100 40 GB para Q5 y Q6; A100 80 GB o H100 para Q8_0 y f16. Dos GPU de 24 GB permiten repartir Q6_K mediante `--split-mode layer` en llama.cpp.
- ¿Cabe en GPU de consumo? Sí, con matices: Q4_K_M entra en 24 GB con contexto corto; Q3_K_M y Q3_K_S en 16 GB; Q2_K en 12 GB (RTX 3060 12 GB, RTX 4070). En 8 GB no cabe ninguna variante sin descargar capas a RAM.
- Despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, koboldcpp, text-generation-webui y llama-cpp-python son las opciones directas al ser GGUF. vLLM y TGI no consumen GGUF de forma nativa: requieren los pesos safetensors del modelo base, que no forman parte de este repositorio.
- Latencia y throughput: no disponibles. Si se confirma la arquitectura MoE con ~3B activos, la velocidad de generación se acercaría a la de un modelo denso de 3B en la fase de cómputo, aunque limitada por el ancho de banda de memoria al leer los expertos activados. Es una hipótesis, no una medición.

## Comparativa con modelos similares

No hay datos verificados de este modelo que permitan una comparación rigurosa. La tabla siguiente sitúa el repositorio frente a dos alternativas de la misma categoría aproximada; los datos de las alternativas proceden de conocimiento general y no se han podido verificar con la información de esta búsqueda, por lo que conviene confirmarlos en sus repositorios oficiales.

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Benchmarks públicos |
|---|---|---|---|---|---|---|
| KAT-Ornith-Coder-35B-A3B (esta ficha) | 35B (según nombre) | ~3B (según nombre) | No disponible | No disponible | GGUF | No disponibles |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 128K (extensible por YaRN) | Apache 2.0 | safetensors, GGUF | Publicados por el autor |
| Qwen2.5-Coder-32B | ~32,5B (denso) | No aplica | 128K | Apache 2.0 | safetensors, GGUF | Publicados por el autor |

No se dispone de información suficiente para comparar rendimiento, calidad de generación de código ni comportamiento multilingüe. La diferencia más relevante y verificable es la falta de licencia declarada y de documentación del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card del modelo base en esta información, ni arquitectura, ni dataset, ni proceso de alineamiento.
- Licencia no declarada: al no especificarse, no puede asumirse uso comercial permitido. Hay que consultar el repositorio de `OliviaRossi/KAT-Ornith-Coder-35B-A3B` antes de cualquier despliegue productivo.
- Sin benchmarks: no existen datos públicos que permitan estimar su calidad en código, matemáticas o razonamiento. Cualquier afirmación sobre su rendimiento sería especulativa.
- Riesgo de alucinación: inherente a cualquier modelo generativo y agravado aquí al no conocerse el proceso de alineamiento ni la existencia de RLHF.
- Sesgos: no se ha publicado información sobre la composición del corpus, por lo que no se puede evaluar el sesgo lingüístico, cultural o de dominio.
- Idiomas: se desconoce si el modelo está ajustado para castellano; el sufijo "Coder" sugiere predominio del inglés en los datos de ajuste.
- Contexto: al no declararse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo.
- Validación de la arquitectura: la suposición MoE con ~3B activos proviene únicamente del nombre. Si el modelo fuese denso, los requisitos de hardware y las estimaciones de latencia serían sustancialmente peores.
- Procedencia de la cuantización: se trata de una conversión de terceros, no de pesos oficiales. Errores de conversión o pérdida de precisión en los tensores son posibles, especialmente en Q2_K e IQ4_XS.
- Repositorio sin tracción: 0 descargas y 0 "likes" implican que no ha sido validado por la comunidad y que no hay informes de errores disponibles.
- Resultados de búsqueda no relevantes: las consultas web realizadas devolvieron únicamente contenido de un foro tecnológico búlgaro sin relación alguna con el modelo, por lo que no se ha podido contrastar ningún dato externo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/KAT-Ornith-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Ornith-Coder-35B-A3B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Repositorio de llama.cpp, herramienta empleada para generar los GGUF: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados al modelo en la búsqueda web realizada.
