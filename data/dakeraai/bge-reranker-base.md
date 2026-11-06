# DakeraAI/bge-reranker-base

## Resumen

DakeraAI/bge-reranker-base es un espejo verificado del modelo BAAI/bge-reranker-base, publicado por Dakera, una empresa que desarrolla un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio contiene una copia byte a byte de los ficheros que Dakera utiliza en producción, verificada mediante SHA-256 contra el repositorio original de Xenova. El modelo subyacente es un cross-encoder de BAAI diseñado para reranking de pasajes en pipelines de recuperación (RAG).

La relevancia de este repositorio es fundamentalmente operativa: Dakera lo emplea como fuente primaria de descarga para su reranker ligero, con el repositorio original como fallback, de modo que las instalaciones no dependen de una única fuente. La imagen Docker de Dakera incluye los modelos por defecto listos para ejecutar, sin descarga en el arranque. Para el desarrollador que evalúa el modelo en sí, la ficha útil es la del original (BAAI/bge-reranker-base); este espejo aporta sobre todo la versión ONNX cuantizada a int8 lista para consumo.

El modelo es un cross-encoder de tipo base (arquitectura BERT, aproximadamente 278 MB en int8) que puntúa pares consulta-documento para reordenar resultados de recuperación. Está orientado al inglés y su función es mejorar la precisión de un pipeline RAG tras una primera fase de recuperación vectorial o léxica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (modelo original BAAI/bge-reranker-base) |
| Parametros totales | no disponible (el modelo original es de tamano "base"; no se especifica el recuento exacto en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (fichero `onnx/model_int8.onnx` incluido en el repo) |
| Idiomas soportados | ingles (segun la model card del espejo: "a smaller English cross-encoder reranker") |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`, 278.825.308 bytes) y tokenizer JSON (`tokenizer.json`, 17.098.079 bytes) |
| Tamano del repositorio | 0,3 GB |
| Libreria | ONNX |
| Pipeline | text-ranking |
| Modelo base | BAAI/bge-reranker-base |

## Arquitectura y entrenamiento

El modelo subyacente es un cross-encoder de la familia BERT, en variante "base", desarrollado por BAAI para la tarea de reranking. Un cross-encoder procesa conjuntamente el par (consulta, documento) y produce una puntuación de relevancia, a diferencia de los bi-encoders, que codifican consulta y documento por separado. Esto lo hace más preciso pero más costoso por par evaluado, por lo que se usa en una segunda fase de reordenación sobre un conjunto reducido de candidatos.

Este repositorio concreto no documenta el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde a la model card original de BAAI/bge-reranker-base, a la que el espejo remite explícitamente. La innovación técnica del repositorio de Dakera no es de modelado, sino de distribución: copia verificada por checksum, empaquetado ONNX int8 y doble fuente de descarga con verificación SHA-256 común.

## Capacidades

- Reranking de pasajes: puntúa pares consulta-documento para reordenar resultados de recuperación.
- Integración en pipelines RAG: actúa como segunda fase tras una recuperación vectorial o de texto completo.
- Ejecución en ONNX Runtime: el fichero int8 está pensado para inferencia en CPU o GPU vía ONNX.
- Uso en agentes con memoria a largo plazo: es el reranker que Dakera emplea en su motor de memoria para agentes.
- Idiomas: orientado al inglés; no se documentan capacidades multilingües.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso; su salida es una puntuación de relevancia.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N candidatos más similares con un índice vectorial, el cross-encoder reordena esos pasajes por relevancia real antes de pasarlos al LLM generador, reduciendo el ruido en el contexto.
- Memoria a largo plazo de agentes: integrado en el motor Dakera, reordena los recuerdos recuperados de sesiones anteriores para que el agente reciba los fragmentos más pertinentes a la consulta actual.
- Búsqueda documental interna: sobre un corpus en inglés, mejora la precisión de los resultados de un buscador híbrido (vectorial más texto completo) añadiendo una fase de reordenación.
- Filtrado de contexto para ventanas limitadas: cuando el presupuesto de tokens del LLM es reducido, el reranker permite seleccionar solo los pasajes con mayor puntuación y descartar el resto.
- Evaluación de calidad de recuperación: sirve para medir y comparar la calidad de distintos retrievers, ya que proporciona una señal de relevancia más fina que la similitud coseno.
- Despliegue autoalojado sin dependencia de red: al estar empaquetado en ONNX int8 y distribuido con checksum verificado, encaja en entornos air-gapped o con requisitos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas de rendimiento (NDCG, MRR, MAP ni comparativas) y remite a la model card original de BAAI/bge-reranker-base para cualquier dato de evaluación.

## Requisitos de hardware

- VRAM estimada: el fichero int8 ocupa aproximadamente 279 MB, por lo que la inferencia requiere del orden de cientos de MB de memoria, no varios GB.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo int8.
- CPU: viable mediante ONNX Runtime, que es el formato en que se distribuye.
- Opciones de despliegue: ONNX Runtime; el repositorio está pensado para ser consumido por el motor Dakera (imagen Docker `ghcr.io/dakera-ai/dakera:latest`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DakeraAI/bge-reranker-base (este repo) | Cross-encoder BERT base, espejo | ONNX int8, ~279 MB | no disponible | MIT | Hugging Face (espejo) |
| BAAI/bge-reranker-base | Cross-encoder BERT base, original | safetensors/PyTorch (original) | no disponible | MIT | Hugging Face (original) |
| Xenova/bge-reranker-base | Cross-encoder BERT base, conversion ONNX | ONNX | no disponible | MIT | Hugging Face (conversion) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; las tres corresponden al mismo modelo subyacente y difieren únicamente en el empaquetado y la fuente de distribución.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: cualquier corrección, actualización o soporte debe dirigirse al original de BAAI; el espejo no introduce mejoras de modelado.
- Idioma: orientado al inglés; su uso sobre corpus en castellano no está documentado y probablemente degrade la calidad del reranking.
- No es generativo: no puede sustituir a un LLM en tareas de generación, razonamiento o tool calling.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el reranker puede asignar puntuaciones altas a pasajes superficialmente similares; conviene validar el umbral de corte en producción.
- Restricciones de licencia: MIT, permite uso comercial; debe conservarse la atribución a BAAI y el aviso de licencia.
- Dependencia de la fuente: aunque el repositorio verifica checksums SHA-256, la disponibilidad a largo plazo depende de que Dakera mantenga el espejo publicado.
- Datos de evaluación ausentes: no hay benchmarks publicados en este repositorio, por lo que la decisión de adopción debería basarse en la model card original y en pruebas propias sobre el corpus objetivo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/DakeraAI/bge-reranker-base
- Modelo original: https://huggingface.co/BAAI/bge-reranker-base
- Conversion ONNX de referencia: https://huggingface.co/Xenova/bge-reranker-base
- Licencia en el repositorio: https://huggingface.co/DakeraAI/bge-reranker-base/blob/main/LICENSE
- Sitio de Dakera: https://dakera.ai
- Documentacion de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
