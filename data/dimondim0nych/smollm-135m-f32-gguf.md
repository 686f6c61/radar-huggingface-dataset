# dimondim0nych/SmolLM-135M-F32-GGUF

## Resumen

SmolLM-135M-F32-GGUF es una conversion al formato GGUF del modelo SmolLM-135M desarrollado originalmente por HuggingFaceTB. El autor de esta ficha en Hugging Face, dimondim0nych, publica los pesos en precision F32 (coma flotante de 32 bits) sin cuantizacion adicional, lo que preserva exactamente los valores del modelo base a costa de un mayor tamano en disco. El modelo base es un transformer decoder-only de 134.515.008 parametros, disenado para tareas de generacion de texto en entornos con recursos muy limitados.

La relevancia de esta publicacion es acotada: se trata de un artefacto de conversion, no de un modelo nuevo. Su utilidad practica reside en que permite ejecutar SmolLM-135M con herramientas compatibles con GGUF (llama.cpp, Ollama, entre otras) manteniendo la maxima fidelidad numerica del original, algo relevante para validacion, comparacion de cuantizaciones o depuracion de pipelines de inferencia.

No se dispone de informacion adicional sobre el proceso de conversion, los parametros de tokenizacion o los idiomas soportados mas alla de lo que declara la model card, que se limita a indicar la licencia Apache 2.0 y el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F32 (sin cuantizacion); el formato GGUF admite otras variantes no incluidas en este repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F32) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base SmolLM-135M de HuggingFaceTB: un transformer decoder-only con atencion causal, orientado a generacion de texto. Esta publicacion no introduce cambios arquitectonicos; se limita a serializar los pesos originales en formato GGUF con precision F32. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo original.

Tampoco se documentan innovaciones tecnicas especificas de esta conversion, como decodificacion especulativa, atencion lineal o variantes hibridas. El unico aspecto tecnico diferencial es la eleccion de F32 frente a cuantizaciones con perdida (Q4, Q8, etc.), lo que elimina el error de redondeo introducido por la cuantizacion pero multiplica el espacio en disco y el ancho de banda de memoria necesario durante la inferencia.

## Capacidades

- Generacion de texto autoregresiva, limitada por el tamano reducido del modelo (135M parametros).
- Ejecucion en CPU y GPU mediante herramientas compatibles con GGUF.
- Reproduccion exacta de las salidas del modelo base en F32, util para validacion y comparacion.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Validacion de pipelines de cuantizacion: sirve como referencia F32 para medir la degradacion de perplexity o de calidad de generacion al comparar con variantes Q4_K_M, Q5_K_M o Q8_0 del mismo modelo base.
- Pruebas de integracion con llama.cpp: permite verificar el correcto funcionamiento de una build de llama.cpp o de un wrapper propio antes de desplegar versiones cuantizadas en produccion.
- Entornos educativos y de investigacion: modelo de 135M parametros que cabe en cualquier equipo y permite experimentar con tecnicas de prompting, evaluacion o interpretabilidad sin coste de infraestructura.
- Generacion de texto auxiliar en dispositivos de borde: tareas de completado corto, clasificacion simple o reformulacion donde la latencia importa mas que la calidad absoluta.
- Baseline en experimentos de destilacion o poda: al disponer de los pesos F32 exactos, es un punto de partida limpio para comparar modelos derivados.
- Reproducibilidad de resultados: investigadores que necesiten garantizar que las diferencias observadas no provienen de la cuantizacion pueden usar esta version como control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 0,54 GB solo para pesos (134,5M parametros x 4 bytes), mas overhead de contexto y buffers de atencion; en la practica, alrededor de 1 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior no tendra limitacion alguna. Tambien cabe holgadamente en iGPUs y en CPU.
- Cabe en cualquier GPU consumer actual e incluso en dispositivos con menos de 2 GB de memoria disponible.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime con soporte GGUF. vLLM y TGI no son la via natural para este formato, aunque existen adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en CPU y practicamente limitado por el ancho de banda de memoria en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-135M-F32-GGUF (este) | 134,5M | No disponible | Apache 2.0 | GGUF F32 | Hugging Face |
| SmolLM-135M (base) | 134,5M | No disponible | Apache 2.0 | Safetensors | Hugging Face |
| Otras cuantizaciones de SmolLM-135M | 134,5M | No disponible | Apache 2.0 | GGUF Q4/Q8 | Hugging Face (terceros) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 135M parametros: la calidad de generacion, el razonamiento y el conocimiento factual son muy limitados en comparacion con modelos de mayor escala; no es adecuado para tareas que exijan precision factual.
- Riesgo elevado de alucinacion, inherente al tamano y a la falta de datos de alineacion documentados.
- Idiomas soportados no documentados; no se garantiza un rendimiento aceptable en castellano.
- Longitud de contexto no especificada en la informacion disponible; debe consultarse la configuracion del modelo base antes de usarlo en produccion.
- El formato F32 incrementa el uso de memoria y el ancho de banda frente a cuantizaciones Q8 o Q4, sin beneficio practico en la mayoria de aplicaciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la conversion no ofrece garantias sobre el artefacto; conviene verificar la integridad de los pesos.
- Repositorio con muy pocas descargas y sin likes: no hay evidencia de comunidad que valide la conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimondim0nych/SmolLM-135M-F32-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
