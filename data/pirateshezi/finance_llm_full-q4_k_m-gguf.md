# PirateShezi/finance_llm_full-Q4_K_M-GGUF

## Resumen

`PirateShezi/finance_llm_full-Q4_K_M-GGUF` es una cuantizacion en formato GGUF del modelo `devAnurag/finance_llm_full`, un ajuste fino orientado al dominio financiero construido sobre la familia Phi-3 Mini. El repositorio lo publica el usuario PirateShezi y no aporta entrenamiento propio: se limita a convertir los pesos originales de safetensors a GGUF mediante el espacio `GGUF-my-repo` de ggml.ai sobre llama.cpp, con la cuantizacion Q4_K_M (4 bits, mezcla de bloques K-quant).

El modelo hereda del original un ajuste fino con LoRA posteriormente fusionado en los pesos base, orientado a preguntas y respuestas financieras, contabilidad, banca, inversion y analisis de riesgo. Con 3.821.079.552 parametros totales (aproximadamente 3,8 mil millones), se situa en el rango de los modelos pequenos que caben en GPU de consumo, lo que lo hace atractivo para prototipos y despliegues locales de bajo coste.

Su relevancia es practica: ofrece un checkpoint de ~2,4 GB en Q4_K_M que puede ejecutarse en CPU o en GPUs modestas mediante llama.cpp, Ollama o servidores compatibles. Ahora bien, la informacion publicada es escasa: no hay datos de entrenamiento, benchmarks ni evaluaciones de calidad, y el unico idioma declarado es el ingles. Conviene tratarlo como un experimento de la comunidad y no como un modelo de referencia para produccion financiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3 Mini, segun tags del autor) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servidor usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); otras variantes no disponibles |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`finance_llm_full-q4_k_m.gguf`); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo original `devAnurag/finance_llm_full` se presenta como un ajuste fino de Phi-3 Mini (tags `phi3`, `phi-3-mini`) mediante LoRA, con los adaptadores fusionados en el checkpoint final (`merged-model`). La arquitectura subyacente es un transformer decoder-only de aproximadamente 3,8 mil millones de parametros. El repositorio aqui descrito no entrena nada: aplica la conversion a GGUF con llama.cpp y la cuantizacion Q4_K_M, que reduce el peso a unos 2,4 GB manteniendo bloques de cuantizacion de 4 bits con escalas de mayor precision en determinadas capas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset financiero, la existencia de RLHF o DPO, ni la receta exacta de ajuste. La model card original no esta incluida en los datos proporcionados, por lo que cualquier detalle sobre datos o metodologia queda como no disponible. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto y respuesta a preguntas en el dominio financiero (contabilidad, banca, inversion, analisis de riesgo), segun los tags del autor.
- Conversacion de un solo turno o multiturno basica mediante plantillas de chat de Phi-3 (no documentadas explicitamente en este repositorio).
- Generacion de texto libre con `llama-cli` y servicio HTTP con `llama-server`.
- Capacidad multilingue limitada: solo se declara ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta vision, audio ni modo "thinking".
- No se documentan capacidades de codigo o matematicas mas alla de lo que herede del modelo base Phi-3 Mini.

## Casos de uso

- Prototipado local de asistentes financieros: ejecutable en un portatil con llama.cpp y ~2,4 GB de disco, permite validar flujos de pregunta-respuesta sobre conceptos contables sin depender de la nube.
- Clasificacion y resumen de documentos financieros sencillos: con contexto limitado (el ejemplo usa 2048 tokens), sirve para resumir notas, extractos o articulos cortos en ingles y extraer terminos clave.
- Soporte educativo en finanzas: responder dudas sobre definiciones de banca, inversion o contabilidad en entornos de formacion, con la advertencia de que las respuestas deben revisarse por un experto.
- Generacion de borradores de informes internos: producir texto preliminar sobre analisis de riesgo o descripciones de productos financieros que luego un analista revisa y corrige.
- Integracion en pipelines de CI para pruebas de humo: al ser un GGUF pequeno, puede usarse como modelo de referencia en tests de integracion de aplicaciones que consumen APIs compatibles con OpenAI (`endpoints_compatible`).
- Despliegue en dispositivos con recursos limitados: CPU o GPU de gama baja mediante Ollama o llama.cpp para demos offline en ferias o entornos sin conectividad.
- Experimentacion academica: servir de base para comparar el efecto del ajuste fino de dominio frente a Phi-3 Mini original en tareas financieras, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2,5-3,5 GB considerando pesos (~2,4 GB) y cache KV para contextos cortos (2048 tokens).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 4060, RTX 3060, o GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI a traves de servidores como llama-server.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend (CPU frente a CUDA/Metal).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PirateShezi/finance_llm_full-Q4_K_M-GGUF | 3,82 B | no disponible | MIT | GGUF | Ajuste fino financiero, solo ingles |
| microsoft/Phi-3-mini-4k-instruct | 3,82 B | 4.096 tokens (segun denominacion del modelo base) | MIT | safetensors, GGUF | Modelo base generalista; contexto segun variante 4k/128k |
| Modelos financieros de 7B (p. ej. ajustes sobre Mistral/Llama) | ~7 B | variable | variable | safetensors, GGUF | Mayor coste de inferencia, posible mejor calidad con datos publicos |

La comparativa con Phi-3 Mini es la mas directa por compartir arquitectura y tamano; el resto de alternativas financieras de 7B requiere mas VRAM y no se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y evaluaciones: no hay evidencia publicada de calidad en tareas financieras.
- Riesgo elevado de alucinacion en un dominio donde los errores tienen consecuencias economicas; no debe usarse como asesor financiero sin supervision humana.
- Solo soporta ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto limitado (el ejemplo oficial usa 2048 tokens), insuficiente para analisis de documentos largos.
- Dataset de entrenamiento desconocido: posibles sesgos derivados de los datos financieros utilizados, no auditados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Aunque la licencia es MIT, el uso en produccion financiera exigiria auditoria propia, evaluacion de sesgos y controles de cumplimiento normativo.
- El autor del GGUF no es el autor del modelo original; posibles diferencias de calidad respecto a los pesos en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PirateShezi/finance_llm_full-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/devAnurag/finance_llm_full
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Familia Phi-3 de Microsoft (referencia del modelo base): https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
