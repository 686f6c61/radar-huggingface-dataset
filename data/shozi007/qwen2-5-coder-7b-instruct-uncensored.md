# Shozi007/Qwen2.5-Coder-7B-Instruct-Uncensored

## Resumen

Shozi007/Qwen2.5-Coder-7B-Instruct-Uncensored es un modelo derivado de Qwen2.5-Coder-7B-Instruct, la familia de modelos de codigo de Alibaba, publicado en Hugging Face por el usuario Shozi007. Segun la model card, el ajuste "uncensored" fue desarrollado por Thirdeye AI LLC, que distribuye una variante equivalente a traves de Ollama. El repositorio contiene pesos en formato safetensors con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que corresponde a la arquitectura densa de Qwen2.5-Coder-7B.

El modelo parte de la base instruct de Qwen2.5-Coder, entrenada originalmente para generacion de codigo, razonamiento y tareas de agente. El ajuste "uncensored" elimina o reduce los rechazos de contenido, de modo que el modelo responde a peticiones que la version original declinaria. Es relevante para quienes necesitan un asistente de codigo sin filtros de seguridad, pero tambien implica riesgos considerables en produccion.

La informacion publicada es muy escasa: no hay licencia declarada, ni idiomas, ni pipeline, ni resultados de benchmarks, ni detalles del proceso de ajuste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 15,2 GB. Cualquier evaluacion debe hacerse asumiendo que los datos tecnicos del ajuste no estan documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-Coder-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-Coder-7B soporta 32.768 tokens nativos, ampliable a 131.072; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer denso con atencion por causalidad, RoPE, normalizacion RMSNorm y activacion SwiGLU, con 7,6 mil millones de parametros. La model card no describe el proceso de ajuste "uncensored": no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como SFT, DPO o RLHF. Tampoco se documentan innovaciones adicionales sobre la base original.

El unico dato tecnico verificable es el recuento de parametros de los safetensors y el tamano del repositorio (15,2 GB), coherente con pesos en precision bf16/fp16. No hay informacion sobre el tokenizador, la configuracion de atencion ni posibles modificaciones estructurales respecto al modelo base.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada de la base Qwen2.5-Coder-7B-Instruct.
- Razonamiento y explicacion de codigo, refactorizacion y depuracion.
- Generacion de texto general y respuesta a instrucciones.
- Respuesta a peticiones que la version original rechazaria, por el ajuste "uncensored".
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y explicar codigo en un entorno de desarrollo integrado, con la ventaja de que sus 7,6 mil millones de parametros permiten ejecucion en GPU de consumo si se cuantiza adecuadamente.
- Generacion de tests unitarios y documentacion tecnica: util para completar pipelines de CI/CD donde se requiere texto tecnico sin restricciones de contenido.
- Investigacion sobre seguridad y alineacion: sirve como objeto de estudio para comparar el comportamiento de un modelo con filtros frente a su variante "uncensored" en tareas de red teaming.
- Prototipado de agentes de codigo: puede integrarse en flujos de refactorizacion automatizada, siempre que se valide la salida antes de aplicarla.
- Traduccion y reescritura de codigo entre lenguajes: adecuado por su base Coder, aunque sin garantias documentadas de calidad en este ajuste.
- Experimentacion con prompts sin restricciones: util en entornos de investigacion controlados donde se necesita estudiar respuestas a peticiones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB, coherente con los 15,2 GB del repositorio.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 4-5 GB (no se distribuyen GGUF en el repo; habria que generarlos).
- GPU recomendadas: A100 40/80 GB, H100, L40S para bf16; RTX 4090 (24 GB) para bf16 ajustado o 8 bits; RTX 3090/4080 para 8 bits; GPUs de 8 GB o menos solo con cuantizacion 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 con atencion eficiente, y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (existe variante publicada por Thirdeye AI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shozi007/Qwen2.5-Coder-7B-Instruct-Uncensored | 7,6 B | no disponible | no disponible | Hugging Face, Ollama (variante Thirdeye AI) |
| Qwen2.5-Coder-7B-Instruct (original) | 7,6 B | 32.768 tokens (131.072 ampliado) | Apache 2.0 | Hugging Face, Ollama |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128.000 tokens | licencia DeepSeek | Hugging Face |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 tokens | Llama 2 Community License | Hugging Face, Ollama |

La comparativa se limita a parametros y contexto porque no hay benchmarks publicados para el ajuste "uncensored". Frente al original, la diferencia principal es la ausencia de filtros y la falta de licencia declarada.

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial es juridicamente incierto y debe consultarse con el autor antes de desplegarlo en produccion.
- El ajuste "uncensored" elimina filtros de seguridad, lo que aumenta el riesgo de generar contenido danino, ilegal o sesgado.
- Riesgo de alucinacion: no documentado, pero inherente a modelos de 7 B en tareas de codigo y texto.
- Sin datos de benchmarks ni de evaluacion de calidad: no se puede verificar si el ajuste degrada el rendimiento respecto al original.
- Idiomas soportados no documentados; se desconoce si el ajuste afecta al multilingue de la base.
- Contexto no confirmado: no se garantiza la ventana de 32.768 tokens del original.
- Repositorio sin descargas ni validacion de la comunidad: no hay evidencia de uso real ni de reproducibilidad.
- La model card descarga la responsabilidad en el usuario; no hay garantias de soporte ni mantenimiento.
- Para produccion se recomienda auditar la salida con filtros propios y validar el comportamiento en tareas sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/Shozi007/Qwen2.5-Coder-7B-Instruct-Uncensored
- Variante en Ollama (Thirdeye AI): https://ollama.com/thirdeyeai/qwen2.5-coder-uncensored-7b
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
