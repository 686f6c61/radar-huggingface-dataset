# liodon-ai/Supra2.5-Pro-Instruct-GGUF

## Resumen

Supra2.5-Pro-Instruct-GGUF es la versión cuantizada en formato GGUF del modelo Supra2.5-Pro-Instruct, publicado por Liodon AI a partir de los pesos originales de SupraLabs. Su propósito es permitir la ejecución local del modelo en entornos con recursos limitados mediante llama.cpp, Ollama, LM Studio o Jan, sin necesidad de infraestructura de GPU dedicada. La etiqueta `qwen3` en el repositorio sugiere que el modelo base deriva de la familia Qwen3, aunque el autor no lo confirma explícitamente en la model card.

El dato más relevante del repositorio es el número de parámetros reportado en safetensors: 67.028.096, es decir, aproximadamente 67 millones de parámetros. Se trata, por tanto, de un modelo de escala pequeña, muy alejado de los modelos de miles de millones de parámetros que sugiere el nombre comercial. El tamaño total del repositorio es de 0,4 GB, coherente con esa cifra.

La información pública disponible es muy escasa: la model card se limita a instrucciones de uso y a una tabla de cuantizaciones, sin detallar arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados. La licencia figura como "other", sin que se especifiquen sus términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3` sugiere base Qwen3, sin confirmar) |
| Parametros totales | 67.028.096 (~67 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (y variante iMatrix en repo aparte) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados) |
| Formato de pesos | GGUF (repo de cuantizacion); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base SupraLabs/Supra2.5-Pro-Instruct. La única pista es la etiqueta `qwen3` incluida por el cuantizador, que apunta a una posible arquitectura de tipo transformer derivada de la familia Qwen3, pero el autor no lo documenta ni lo confirma. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

En cuanto al proceso de cuantización, el repositorio ofrece las cuantizaciones estándar de llama.cpp (Q2_K a Q8_0) y remite a un repositorio separado con cuantizaciones sub-4-bit calibradas con iMatrix (`liodon-ai/Supra2.5-Pro-Instruct-imatrix-GGUF`) para mayor calidad en bits bajos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y orientado a instrucciones.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia estándar.
- Ejecución local: diseñado para llama.cpp, Ollama, LM Studio y Jan.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un modelo de ~67 M de parámetros en GGUF, puede ejecutarse en cualquier portátil sin GPU para validar flujos de chat antes de migrar a modelos mayores.
- Pruebas de integración con llama.cpp y Ollama: útil para verificar pipelines de despliegue, plantillas de prompt y formato de chat en entornos de desarrollo.
- Experimentación educativa: su tamaño reducido permite estudiar el comportamiento de un modelo cuantizado y comparar la degradación entre Q2_K y Q8_0 en una misma máquina.
- Evaluación de cuantizaciones: la disponibilidad de siete niveles de cuantización y una variante iMatrix lo hace adecuado para medir el impacto de la precisión en la calidad de salida.
- Entornos con restricciones extremas de memoria: con cuantizaciones de 0,04-0,07 GB, cabe en dispositivos embebidos, contenedores mínimos o funciones serverless con límites de RAM muy bajos.
- Filtrado o clasificación de texto ligera: para tareas simples de etiquetado o generación de respuestas cortas donde la latencia y el coste importan más que la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; la model card indica "~0 GB" para todas las cuantizaciones.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU-only.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/Supra2.5-Pro-Instruct-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/liodon-ai/Supra2.5-Pro-Instruct-GGUF:Q4_K_M`), LM Studio y Jan.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera throughput muy alto incluso en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Supra2.5-Pro-Instruct-GGUF | ~67 M | no disponible | other | GGUF | Objeto de esta ficha |
| Qwen3 (familia, referencia) | no disponible | no disponible | no disponible | safetensors/GGUF | Posible base según etiqueta, sin confirmar |
| Modelos conversacionales pequeños tipo TinyLlama / Qwen2.5-0.5B | 0,5-1,1 B | 2K-32K | Apache-2.0 (segun variante) | safetensors/GGUF | Alternativas de escala similar con documentación pública |

No se dispone de datos de rendimiento comparativo para Supra2.5-Pro-Instruct-GGUF, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse información sobre el dataset de entrenamiento, no es posible evaluar sesgos.
- Riesgo de alucinación: no cuantificado; con ~67 M de parámetros, la fiabilidad factual es previsiblemente baja en tareas de conocimiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados.
- Licencia: figura como "other" sin términos explícitos; es imprescindible contactar con SupraLabs antes de cualquier uso comercial.
- Documentación insuficiente: la model card no incluye arquitectura, datos de entrenamiento ni benchmarks, lo que dificulta la evaluación rigurosa en producción.
- Discrepancia de nomenclatura: el nombre "Pro" y el tamaño del repositorio (0,4 GB) no encajan con la escala habitual de modelos "Pro"; conviene verificar el modelo base antes de adoptarlo.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/liodon-ai/Supra2.5-Pro-Instruct-GGUF
- Modelo base: https://huggingface.co/SupraLabs/Supra2.5-Pro-Instruct
- Variante iMatrix: https://huggingface.co/liodon-ai/Supra2.5-Pro-Instruct-imatrix-GGUF
- Perfil del cuantizador: https://huggingface.co/liodon-ai
