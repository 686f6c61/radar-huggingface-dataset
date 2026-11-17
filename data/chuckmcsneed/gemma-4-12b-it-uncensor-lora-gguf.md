# ChuckMcSneed/gemma-4-12B-it-uncensor-lora-gguf

## Resumen

`ChuckMcSneed/gemma-4-12B-it-uncensor-lora-gguf` es un artefacto experimental publicado en Hugging Face por el usuario ChuckMcSneed, que se presenta como una LoRA de "uncensoring" (eliminación de restricciones de alineamiento) aplicada sobre el modelo base `google/gemma-4-12B-it`. Según la model card, la modificación afecta únicamente a cinco neuronas concretas situadas en las capas 22, 27, 28, 33 y 37, con escalas de entre -1,3 y -1,5. El repositorio se distribuye en formato GGUF y declara licencia Apache 2.0.

El interés técnico de este artefacto es acotado: no se trata de un modelo nuevo ni de un fine-tuning completo, sino de una intervención quirúrgica sobre pesos de un modelo de terceros, empaquetada para inferencia local. La model card indica explícitamente que el modelo "no funcionará sin un system prompt adecuado", lo que sugiere que la modificación por sí sola no altera el comportamiento de forma estable y depende de instrucciones adversariales en tiempo de inferencia.

Los metadatos del repositorio son inconsistentes: el campo de parámetros totales en safetensors declara 96.000 (valor incompatible con un modelo de 12B), el tamaño del repo aparece como 0.0 GB, no hay pipeline declarado, no se listan idiomas y el contador de descargas y likes es cero. Estos indicios apuntan a un artefacto incompleto, mal etiquetado o puramente experimental, sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base declarado: gemma-4-12B-it; la model card no detalla la arquitectura) |
| Parametros totales | 12B (según el nombre del modelo); el metadato de safetensors declara 96.000, dato inconsistente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `gemma-4-12B-it` en la documentación proporcionada; la model card del artefacto no describe capas, tipo de atención ni configuración del transformer. Lo único documentado es el mecanismo de modificación: una intervención puntual sobre cinco unidades neuronales específicas, con desplazamientos negativos de escala aplicados a los pesos correspondientes. Esta técnica se asemeja a ediciones de "ablación" o "steering" a nivel de neurona, no a un entrenamiento supervisado ni a un proceso de RLHF/DPO.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni proceso de alineamiento. La model card afirma que la modificación se mantuvo "mínima para evitar daño cerebral excesivo", lo que reconoce implícitamente que ediciones de este tipo degradan capacidades generales del modelo. No se menciona ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada: el artefacto solo se describe como funcional con un system prompt específico de "uncensoring"; sin él, el comportamiento esperado no está documentado.
- Modificación de comportamiento: la intervención sobre cinco neuronas busca reducir la tendencia del modelo base a rechazar peticiones o moralizar.
- Capacidades heredadas del modelo base: al ser una LoRA sobre `gemma-4-12B-it`, heredaría las capacidades de este (razonamiento, código, matemáticas, multilingüismo), pero no se documenta ninguna y no pueden darse por garantizadas tras la edición de pesos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el artefacto permite estudiar cómo ediciones localizadas de pesos afectan a la tasa de rechazo y a la calidad general, en entornos controlados de evaluación de robustez.
- Análisis de "steering" a nivel de neurona: comparar el efecto de desplazamientos de escala en unidades concretas frente a técnicas de intervención en activaciones o prompts.
- Pruebas de red-teaming defensivo: medir la eficacia de salvaguardas externas (filtros de entrada/salida) cuando el modelo subyacente está parcialmente desinhibido.
- Estudio de dependencia del system prompt: evaluar hasta qué punto el comportamiento "uncensored" depende de instrucciones adversariales y no de los pesos modificados.
- Reproducibilidad de artefactos comunitarios: verificar la validez de los metadatos publicados (parámetros, tamaño de repo, formato) frente al contenido real descargado.
- Despliegue local con llama.cpp u Ollama para experimentación offline: el formato GGUF permite cargar el artefacto en entornos sin GPU dedicada, siempre que se disponga de RAM/VRAM suficiente para un modelo de 12B cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 12B en GGUF, orientativamente entre 7 y 9 GB en cuantización Q4, entre 9 y 11 GB en Q5, y en torno a 13-15 GB en Q8; estas cifras son estimaciones generales para modelos de ese tamaño, no medidas publicadas para este artefacto.
- GPU recomendadas: no disponibles en la documentación; por tamaño del modelo base, una RTX 3090, RTX 4090, L40S, A100 o H100 serían adecuadas.
- Compatibilidad con GPU de consumo: un modelo de 12B cuantizado a Q4/Q5 encaja en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); a Q8 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y servidores GGUF compatibles (por ejemplo, llama-cpp-python). vLLM y TGI no son la vía natural para GGUF sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ChuckMcSneed/gemma-4-12B-it-uncensor-lora-gguf | 12B (según nombre) | no disponible | Apache 2.0 | GGUF | Artefacto experimental con metadatos inconsistentes; sin benchmarks |
| google/gemma-4-12B-it | 12B | no disponible en esta ficha | no disponible en esta ficha | no disponible | Modelo base oficial; capacidades y contexto no documentados aquí |
| Otras LoRA de "uncensoring" sobre modelos abiertos | varía | varía | varía | GGUF / safetensors | Categoría con múltiples artefactos comunitarios; ninguno comparable con datos verificados en esta búsqueda |

No se dispone de datos suficientes para una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Metadatos inconsistentes: el campo de parámetros totales (96.000) no corresponde a un modelo de 12B, el tamaño del repo figura como 0.0 GB y no hay pipeline ni idiomas declarados; esto impide validar el contenido real del artefacto.
- Dependencia de un system prompt adversarial: la model card afirma que el modelo no funciona sin una instrucción que solicite contenido dañino, ilegal o tóxico; el "uncensoring" no es, por tanto, una propiedad estable de los pesos.
- Degradación de capacidades: la propia model card admite el riesgo de "daño cerebral" derivado de la edición de neuronas; no se documenta ninguna evaluación de regresión sobre tareas estándar.
- Riesgo elevado de alucinación y de contenido dañino: la intervención está diseñada para reducir rechazos, lo que incrementa la probabilidad de respuestas tóxicas, ilegales o fácticamente incorrectas.
- Sesgos: no documentados; la modificación de pesos puede alterar sesgos preexistentes del modelo base de forma no medida.
- Licencia: Apache 2.0 declarada, pero el modelo base `google/gemma-4-12B-it` puede tener términos propios (Gemma Terms of Use) que prevalecen sobre la licencia del artefacto derivado; conviene verificar antes de cualquier uso comercial.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que el artefacto haya sido probado por terceros.
- Uso responsable: no apto para producción sin auditoría de seguridad, filtros externos y revisión legal.

## Enlaces

- Hugging Face: https://huggingface.co/ChuckMcSneed/gemma-4-12B-it-uncensor-lora-gguf
- Modelo base citado en la model card: https://huggingface.co/google/gemma-4-12B-it
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
