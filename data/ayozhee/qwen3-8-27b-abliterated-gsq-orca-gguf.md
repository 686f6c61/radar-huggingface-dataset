# ayozhee/Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF

## Resumen

El modelo `Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF` es un archivo GGUF experimental creado por `ayozhee`, que combina pesos cuantizados del modelo base `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF` con matrices seleccionadas del modelo abliterado `orcarouter/Qwen3.8-27B-Uncensored`. El objetivo es reducir el comportamiento de rechazo del modelo original manteniendo un tamaño compacto de 9,61 GB, lo que permite ejecutarlo en una GPU de 12 GB de VRAM. Se trata del primer lanzamiento open source de su autor y está etiquetado como experimental.

El modelo subyacente es `Qwen3.8-27B`, un modelo denso multimodal nativo de 27.320.697.856 parámetros desarrollado por el equipo Qwen de Alibaba, orientado a tareas de programación, flujos de trabajo agénticos y automatización de oficina. La versión GGUF de `ayozhee` se enfoca en generación de texto y razonamiento, e incluye soporte para multi-token prediction (MTP) y decodificación especulativa. Es relevante porque ofrece una alternativa de inferencia local para un modelo de 27.000 millones de parámetros en hardware de consumo, con un tamaño razonable y rendimiento útil para prototipado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal nativo en su origen (modelo base Qwen3.8-27B). El archivo GGUF se usa para generación de texto. |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. En las pruebas del autor se configuraron límites de 16.384 y 66.560 tokens, pero el máximo nativo no está documentado. |
| Tipos de cuantizacion | IQ2_S-MTP (GGUF, cuantización mixta siguiendo el mapa de asignación de tipos de GSQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con reemplazos provenientes de tensores BF16 en formato safetensors) |

## Arquitectura y entrenamiento

El modelo se construye a partir del archivo `Qwen3.8-27B-GSQ-RCO-IQ2_S-MTP-GGUF` de `ISTA-DASLab`. El autor reemplaza 131 matrices con pesos en BF16 leídos directamente de `orcarouter/Qwen3.8-27B-Uncensored`: una matriz de embedding de entrada, 64 matrices `mlp.down_proj`, 48 matrices `linear_attn.out_proj`, 16 matrices `self_attn.o_proj` y 2 matrices de proyección de salida del MTP. El resto de tensores (735 de 866), los metadatos de runtime y el tokenizador se conservan byte a byte. No se realiza ningún entrenamiento adicional, ni RLHF ni DPO: la modificación es una mezcla selectiva de pesos sin promediado.

Los reemplazos se cuantizan en BF16 con los kernels `ggml` de llama.cpp, siguiendo el mapa de asignación de tipos de GSQ y utilizando la imatrix oficial (estadísticas de activación del modelo Qwen base). Las 48 proyecciones de salida de la atención lineal reciben además el reordenamiento de columnas requerido por el conversor. El resultado es un híbrido que conserva el tamaño y la estructura del GGUF original de GSQ. El modelo base de Alibaba, Qwen3.8-27B, es un transformer denso multimodal con capacidad de razonamiento y mecanismo de multi-token prediction, lo que permite la decodificación especulativa integrada en el archivo cuantizado.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte de herramienta (`tool calling`) según las pruebas de desarrollo web del autor.
- Razonamiento en modo `thinking` con presupuesto configurable; el autor recomienda 2.048 tokens para tareas que requieren formato estricto.
- Capacidades matemáticas: 30/30 aciertos en GSM8K en un subconjunto de 30 ítems.
- Generación de código y tareas de programación: 30/30 en HumanEval normalizado (25/30 en puntuación bruta antes de normalización).
- Seguimiento de instrucciones: 27/30 en IFEval con presupuesto de 1.024, y 30/30 al aumentar el presupuesto a 2.048.
- Decodificación especulativa con MTP incluido; tasa de aceptación observada de 68,1% en consignas cortas y 55,93% en conversación larga.
- El modelo original Qwen3.8-27B es multimodal nativo, pero no está confirmado que el GGUF conserve las capacidades de visión; las pruebas documentadas se centran en texto.

## Casos de uso

- Asistente de programación local: el modelo puede generar y completar código con soporte de tool calling, y su tamaño compacto permite ejecutarlo en una estación de trabajo con RTX 3060. En la prueba real de desarrollo web, mantuvo un historial de 30,6K tokens y completó 15/15 comprobaciones funcionales.
- Razonamiento matemático en educación: con una puntuación perfecta en el subconjunto de GSM8K y modo de razonamiento ajustable, puede usarse como tutor interactivo para resolver problemas paso a paso.
- Chatbots de atención al cliente con contexto largo: su configuración probada de 66.560 tokens y su capacidad de manejar historiales de 30K tokens permiten gestionar conversaciones extensas y derivar a un agente humano cuando sea necesario.
- Agentes autónomos y flujos de trabajo con herramientas: la integración de tool calling y la capacidad de mantener múltiples turnos hacen posible conectar el modelo a APIs internas o bases de conocimiento.
- Automatización de oficina: el modelo base Qwen3.8-27B está diseñado para tareas de ofimática; este GGUF puede generar texto estructurado, correos electrónicos o informes, aunque sin las capacidades multimodales del original.
- Revisión de código en pipelines de CI/CD: al ejecutarse como llama-server y admitir decodificación especulativa con MTP, puede integrarse en flujos de trabajo para sugerir correcciones o revisar cambios de código en entornos con GPU limitada.

## Benchmarks y rendimiento

El autor realizó un screening con los 30 primeros ítems de cada suite de BenchKit, con una generación por ítem y configuraciones idénticas para ambos modelos. Estos no son benchmarks oficiales completos.

| Test | Este híbrido | GSQ IQ2_S-MTP original |
|---|---|---|
| IFEval (seguimiento de instrucciones) | 27/30 | 29/30 |
| GSM8K (matemáticas) | 30/30 | 29/30 |
| HumanEval (normalizado) | 30/30 | 30/30 |

Notas: HumanEval en puntuación bruta fue 25/30 para el híbrido y 21/30 para GSQ. Tras aplicar la misma normalización de indentación, ambos alcanzaron 30/30. Los dos fallos de IFEval del híbrido se resolvieron al aumentar el presupuesto de razonamiento a 2.048.

Rendimiento medido en una RTX 3060 12 GB, según los registros de llama-server:

| Medición | Híbrido (prompts cortos) | GSQ (prompts cortos) | Híbrido (conversación real, 30K de historial) |
|---|---|---|---|
| Decode | 35,65 tokens/s | 34,79 tokens/s | 29,45 tokens/s |
| Prefill | 179,6 tokens/s | 177,9 tokens/s | 350,6 tokens/s |
| Aceptación de decodificación especulativa | 68,1% | 69,1% | 55,93% |
| Límite de contexto configurado | 16.384 | 16.384 | 66.560 |

El pico de VRAM en la conversación larga fue de 11.536 MiB, con 578 MiB libres. Estas mediciones son referencias del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,5 GB (pico medido en RTX 3060 12 GB). El archivo de pesos ocupa 9,61 GB, más KV cache y buffers.
- GPU recomendada: RTX 3060 12 GB o superior. También es viable usar una RTX 4070 Ti / 4080 con más margen.
- Puede ejecutarse en GPUs de consumo con 12 GB o más. En GPUs de 8 GB no se puede cargar completamente en VRAM; se requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (importando el GGUF), LM Studio, o cualquier frontend compatible con GGUF.
- Latencia observada: 29–35 tokens/s de decode y 179–350 tokens/s de prefill en la GPU de referencia, con cuantización IQ2_S y MTP activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño | Contexto | Licencia |
|---|---|---|---|---|---|
| `ayozhee/Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF` | 27,32 B | IQ2_S-MTP | 9,61 GB | No disponible | Apache-2.0 |
| `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF` | 27,32 B | IQ2_S-MTP | 9,61 GB | No disponible | No disponible |
| `orcarouter/Qwen3.8-27B-Uncensored` | 27,32 B | BF16 | No disponible | No disponible | No disponible |
| `Qwen3.8 27b Obliterated` (local-ai-zone) | 27,32 B | No disponible | 30,1 GB | No disponible | No disponible |

La diferencia principal entre el primer y el segundo modelo es el proceso de ablación parcial de 131 matrices. El tercero es el modelo BF16 original abliterado usado como fuente de los reemplazos. El cuarto es otra publicación de un GGUF abliterado con mayor tamaño y número de descargas. No se dispone de benchmarks comparativos externos entre estos modelos.

## Limitaciones y advertencias

- El modelo es experimental y corresponde al primer lanzamiento de su autor; no ha sido auditado ni probado en producción.
- La cuantización IQ2_S es extremadamente agresiva y puede producir pérdida de calidad, errores sutiles y mayor tasa de alucinación en comparación con cuantizaciones de mayor precisión.
- El proceso de abliteración reduce las negativas y el rechazo, pero también puede eliminar sesgos de seguridad y generar contenido que un modelo alineado rechazaría.
- Las capacidades multimodales del modelo Qwen3.8 original no están confirmadas en este GGUF; la documentación solo cubre generación de texto.
- Los benchmarks presentados son subconjuntos de 30 ítems, no evaluaciones exhaustivas, y sus resultados dependen de la configuración y el evaluador de BenchKit.
- La longitud de contexto nativa no está documentada. Los límites de 16.384 y 66.560 tokens son valores de configuración utilizados en pruebas, no garantías del modelo.
- Para usos en producción, se requiere validación adicional en las tareas concretas y una revisión cuidadosa de las respuestas generadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ayozhee/Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF)
- [Repositorio de Qwen3.8-27B (Alibaba)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Modelo base GSQ-RCO en Hugging Face](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF)
- [Modelo OrcaRouter Uncensored en Hugging Face](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- [Página de Qwen3.8 27b Obliterated en local-ai-zone](https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html)
