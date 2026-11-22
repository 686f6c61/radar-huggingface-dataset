# mradermacher/ascii-art-expert-2b-GGUF

## Resumen

`mradermacher/ascii-art-expert-2b-GGUF` es una publicación de cuantizaciones estáticas en formato GGUF del modelo base `jokasia/ascii-art-expert-2b`, un modelo de 2.000 millones de parámetros especializado, a juzgar por su nombre, en la generación de arte ASCII. El autor de esta ficha, mradermacher, es un conocido publicador de cuantizaciones GGUF en Hugging Face que habitualmente convierte modelos de terceros a formatos ligeros para su uso con llama.cpp y derivados. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada del trabajo de jokasia.

La relevancia de esta publicación radica en que permite ejecutar un modelo especializado de 2B en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo imposible con los pesos originales en precisión completa. Sin embargo, la información pública disponible es extremadamente escasa: la model card no incluye arquitectura, licencia, idiomas, datos de entrenamiento ni resultados de benchmarks, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

Por todo ello, esta ficha documenta lo que se puede verificar (el conjunto de cuantizaciones ofrecidas y el origen del modelo) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de calidad, sesgos o idoneidad para producción requeriría pruebas empíricas por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica un modelo de 2B parámetros; la arquitectura concreta no se especifica) |
| Parametros totales | aproximadamente 2.000 millones (deducido del nombre del modelo, no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base `jokasia/ascii-art-expert-2b` en la información disponible. El nombre sugiere un transformer de aproximadamente 2.000 millones de parámetros afinado para la tarea de generar arte ASCII, pero no se confirma ni la familia arquitectónica (Llama, Qwen, Gemma, Mistral u otra), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable técnicamente es el proceso de cuantización: los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que señala una conversión desde pesos en formato Hugging Face (probablemente safetensors) a GGUF mediante la herramienta de cuantización de llama.cpp, con cuantizaciones estáticas de tipo K-quant e IQ4_XS. No se incluye proyección multimodal (`skip_mmproj` vacío), lo que sugiere un modelo exclusivamente de texto.

## Capacidades

- Generación de texto especializada, presumiblemente orientada a la producción de arte ASCII a partir de instrucciones en lenguaje natural, según indica el nombre del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Al ser un modelo de 2B parámetros, su capacidad de razonamiento general y conocimiento del mundo es previsiblemente limitada en comparación con modelos de mayor tamaño, aunque esto no está cuantificado en la información disponible.

## Casos de uso

- Generación de arte ASCII en terminal: el modelo puede integrarse en herramientas CLI o scripts que conviertan descripciones textuales en diagramas o ilustraciones ASCII, aprovechando su especialización y su reducido tamaño para ejecutarse localmente.
- Documentación técnica con diagramas ligeros: útil para insertar representaciones ASCII de arquitecturas, flujos o árboles de directorios en README y documentación donde no se desean imágenes binarias.
- Prototipado rápido en local: al ofrecer cuantizaciones desde Q2_K hasta Q8_0, permite probar el modelo en portátiles o equipos sin GPU dedicada mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Firma de correos y banners de texto: generación de logotipos o banners ASCII para aplicaciones de terminal, foros o sistemas con restricciones de formato.
- Filtrado y generación en entornos con recursos limitados: su tamaño de 2B y las cuantizaciones de 4 bits permiten desplegarlo en dispositivos edge o contenedores con poca memoria, donde modelos mayores no caben.
- Investigación sobre especialización de modelos pequeños: sirve como caso de estudio para analizar hasta qué punto un modelo de 2B puede especializarse en una tarea creativa concreta frente a modelos generalistas.
- Educación y demos de cuantización: útil para ilustrar el impacto de distintas cuantizaciones (Q2_K frente a Q8_0) en la calidad de salida de una tarea concreta y medible subjetivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir de 2B parámetros; no confirmada por el autor):
  - Q8_0: en torno a 2,1-2,3 GB.
  - Q6_K: en torno a 1,7-1,9 GB.
  - Q5_K_M: en torno a 1,5-1,7 GB.
  - Q4_K_M: en torno a 1,3-1,5 GB.
  - Q3_K_M: en torno a 1,1-1,3 GB.
  - Q2_K: en torno a 0,9-1,1 GB.
  - x-f16: en torno a 4,0-4,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las cuantizaciones de 4-5 bits; una RTX 3060 de 12 GB o superior permite ejecutar incluso x-f16 con contexto amplio. Para servidores, A100 o H100 no son necesarias para este tamaño, pero funcionarían.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelos sin conversión adicional.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/ascii-art-expert-2b-GGUF | ~2B | no disponible | Arte ASCII | no disponible | GGUF |
| jokasia/ascii-art-expert-2b (original) | ~2B | no disponible | Arte ASCII | no disponible | Hugging Face (safetensors, presumiblemente) |
| Modelos generalistas de 2B (p. ej. Qwen2.5-1.5B, Gemma-2-2B) | 1,5-2B | 32K-8K según modelo | Generalista | Apache 2.0 / Gemma license | safetensors, GGUF |

La comparación cuantitativa con alternativas no es posible porque no se han publicado benchmarks del modelo. Frente a modelos generalistas del mismo tamaño, la única ventaja documentada es la especialización declarada en el nombre; la desventaja es la ausencia total de documentación sobre licencia, idiomas y rendimiento, lo que dificulta su adopción en entornos profesionales.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan sesgos, datos de entrenamiento, licencia ni limitaciones, lo que impide evaluar riesgos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay permiso claro y contactar con el autor original antes de usarlo en producción.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de 2B sin documentación de alineación.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Contexto desconocido: no se puede planificar su uso en conversaciones multi-turno o documentos largos sin pruebas empíricas.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su calidad.
- Las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad en tareas creativas como el arte ASCII, donde la estructura espacial de los caracteres es sensible a errores.
- El modelo base podría tener restricciones de uso derivadas de la familia arquitectónica de la que proviene, desconocidas en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ascii-art-expert-2b-GGUF
- Modelo base: https://huggingface.co/jokasia/ascii-art-expert-2b
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
