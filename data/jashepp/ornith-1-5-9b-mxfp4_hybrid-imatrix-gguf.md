# jashepp/Ornith-1.5-9B-MXFP4_Hybrid-Imatrix-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros desarrollado por Ornith AI, sucesor directo de Ornith-1.0-9B. Está orientado a tareas agénticas de programación, razonamiento con cadena de pensamiento y uso de herramientas, y se distribuye bajo licencia MIT. La model card lo describe como una evolución del marco de "autoandamiaje" (self-scaffolding) de Ornith-1.0 hacia un bucle de auto-mejora más completo: el modelo propone tareas nuevas, genera andamiajes específicos y produce rollouts de solución para aprendizaje por refuerzo.

La ficha que nos ocupa no documenta los pesos originales, sino una recuantización comunitaria publicada por el usuario jashepp: GGUFs de precisión mixta por capas (MXFP4 combinado con Q8_0 y F16) generados con matriz de importancia (imatrix). El objetivo es reducir la huella de VRAM sin degradar las capacidades de razonamiento, que en modelos agénticos son especialmente sensibles a la cuantización uniforme. El repositorio ofrece cinco variantes que van de 4,77 GB a 11,4 GB.

La relevancia actual es doble: por un lado, Ornith-1.5-9B se posiciona, según su autor, en el estado del arte entre modelos abiertos de tamaño comparable en benchmarks de programación agéntica; por otro, esta recuantización permite ejecutar un modelo de casi 9B con capas SSM híbridas en hardware de consumo, algo que la versión en precisión completa no facilita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de espacio de estados (Mamba/SSM) y atención; detalles completos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (no es MoE en la variante 9B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4, MXFP4 + Q8_0, MXFP4 + Q8_0 + F16 (con imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo con cuantizaciones); safetensors en el modelo base |
| Tamano del repo | 40,7 GB |
| Variantes GGUF | 4,77 GB (MXFP4 only), 6,53 GB (MXFP4+Q8_0 exp), 8,45 GB (MXFP4+Q8_0+F16 exp), 9,53 GB (MXFP4+Q8_0), 11,4 GB (MXFP4+Q8_0+F16) |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Libreria | transformers (metadato); inferencia via llama.cpp |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura híbrida: la model card de la recuantización menciona explícitamente tensores `ssm_alpha`, `ssm_beta` y `ssm_out`, lo que confirma la presencia de capas de espacio de estados (SSM, estilo Mamba) combinadas con mecanismos de atención y compuertas de atención (`attn_gate`). No se detalla el número de capas, la proporción entre capas SSM y de atención, ni la dimensión oculta.

En cuanto al entrenamiento, el modelo base se presenta como fruto de un proceso de destilación encadenada (chained-distill) y aprendizaje por refuerzo con auto-generación de tareas: el propio modelo propone problemas, construye andamiajes específicos y genera rollouts de solución que alimentan el ciclo de RL. Los tags del repositorio incluyen `distillation`, `chain-of-thought`, `agentic`, `tool-use` y `chained-distill`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO más allá del bucle de RL descrito. La model card recomienda mantener siempre el modo de razonamiento activado, argumentando que el modelo planifica y razona las ediciones de código antes de ejecutarlas, a diferencia de los modelos Qwen base, que según el autor ejecutan a ciegas y retroceden tras generar código roto.

La innovación técnica de esta publicación concreta es la cuantización por capas con precisión mixta en tres niveles: F16 para embeddings de entrada/salida y parámetros de compuerta SSM (`ssm_alpha`, `ssm_beta`), Q8_0 para el backbone y anclas (`ssm_out`, `attn_gate`), y MXFP4 para el resto. La matriz de importancia combina la publicada por bartowski para Ornith-1.5-9B con 1,6 millones de tokens de datos markdown propios (prompts, resultados, auditorías, skills y documentación) generados con Ornith-1.0-35B-A3B y Ornith-1.5-35B-A3B. Las capas MXFP4 incorporan datos de imatrix mediante un commit específico de llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con cadena de pensamiento explícita (modo thinking), recomendado de forma permanente por el autor.
- Programación agéntica: planificación y razonamiento previo a la edición de código.
- Uso de herramientas y function calling (tag `tool-use`).
- Flujos agénticos multi-paso y autoandamiaje de tareas.
- Destilación de razonamiento (chain-of-thought distillation) como base de su comportamiento.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- No se documentan capacidades de visión, audio ni otros modalidades.

## Casos de uso

- Asistencia de programación en producción: el modelo razona y planifica las ediciones antes de ejecutarlas, lo que reduce el ciclo de generar código roto y corregirlo; encaja en pipelines de CI/CD como generador de parches con revisión humana.
- Agentes autónomos de resolución de incidencias: con tool calling puede invocar APIs, ejecutar comandos y consultar documentación en varios pasos, aprovechando el modo thinking para descomponer el problema.
- Generación de tests y auditorías de código: el sesgo hacia la planificación previa lo hace adecuado para producir suites de prueba y revisiones estructuradas sobre repositorios existentes.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante MXFP4 de 4,77 GB permite ejecutar un modelo de casi 9B en tarjetas de 8 GB de VRAM, útil para prototipado local sin depender de la nube.
- Servicio de chat técnico especializado: conversaciones multi-turno sobre temas de ingeniería con razonamiento explícito, siempre que el contexto disponible sea suficiente (dato no publicado).
- Evaluación e investigación en RL con auto-generación de tareas: el modelo puede emplearse como generador de problemas y rollouts de solución para experimentos de auto-mejora.
- Destilación de razonamiento hacia modelos menores: sus trazas de cadena de pensamiento sirven como datos de entrenamiento para modelos más pequeños.

## Benchmarks y rendimiento

La model card enlaza una imagen con resultados de evaluación de Ornith 1.5 9B, pero no se incluyen cifras numéricas en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para la variante MXFP4 de 4,77 GB; 7-8 GB para la de 6,53 GB; 9-10 GB para la de 8,45 GB; 10-11 GB para la de 9,53 GB; 12-13 GB para la de 11,4 GB (estimaciones a partir del tamaño de fichero, incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las variantes mayores con contexto amplio; A100 o H100 para servicio concurrente de alta demanda.
- Cabe en GPU de consumo: sí, al menos las variantes MXFP4 y MXFP4+Q8_0 en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp (requerido para MXFP4 con imatrix, usando el commit o rama indicados en la model card), Ollama y otros frontends basados en llama.cpp; vLLM y TGI no soportan estos GGUFs de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (esta recuantizacion) | ~8,95B | No disponible | MIT | GGUF mixto | Orientado a código agéntico con thinking |
| Ornith-1.5-35B-A3B | No disponible (MoE, A3B) | No disponible | MIT | GGUF (variante de jashepp) | Variante mayor del mismo autor, mayor coste de VRAM |
| Ornith-1.0-9B | ~9B (no confirmado) | No disponible | MIT | safetensors/GGUF | Predecesor directo, peor seguimiento de instrucciones según el autor |
| Modelos Qwen base de tamaño similar | No disponible | No disponible | No disponible | No disponible | Citados por el autor como línea base, con menor planificación previa a la ejecución |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos; no se garantiza calidad en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking puede producir trazas de razonamiento plausibles pero incorrectas.
- El autor advierte que desactivar el razonamiento degrada notablemente la calidad del código generado.
- La cuantización MXFP4, aunque guiada por imatrix, puede degradar capacidades finas de razonamiento en comparación con los pesos originales; las variantes con más capas en Q8_0/F16 preservan mejor la calidad a costa de VRAM.
- Requiere una versión específica de llama.cpp para aprovechar la imatrix en capas MXFP4; otras herramientas pueden no soportar estos ficheros.
- No se documentan sesgos específicos ni evaluación de seguridad.
- Licencia MIT: permite uso comercial, pero conviene verificar los términos del modelo base y de los datos de destilación.
- El repositorio tiene un tamaño de 40,7 GB por acumulación de variantes; descargar solo el fichero necesario.
- No hay información publicada sobre longitud de contexto efectiva, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio de la recuantización: https://huggingface.co/jashepp/Ornith-1.5-9B-MXFP4_Hybrid-Imatrix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Predecesor: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Variante mayor recuantizada: https://huggingface.co/jashepp/Ornith-1.5-35B-A3B-MXFP4_MOE_Hybrid-Imatrix-GGUF
- GGUF de referencia de bartowski: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Commit de llama.cpp con imatrix para MXFP4: https://github.com/ggml-org/llama.cpp/commit/d9b625edb6d2cba294d51007ed751e3c17879668
- Rama de llama.cpp: https://github.com/ggml-org/llama.cpp/compare/compilade/imatrix-mxfp4
- Licencia MIT: https://choosealicense.com/licenses/mit/
