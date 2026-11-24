# jakeatx/Inkling-2-Mini-ATX-GGUF

## Resumen

Inkling-2-Mini-ATX-GGUF es una cuantización en formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario jakeatx. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.070.385.152 parámetros totales, orientado a generación de texto conversacional. Esta versión GGUF está específicamente optimizada para ejecutarse íntegramente en tarjetas gráficas de 24 GB de la serie RTX 30 (arquitectura Ampere), con una ventana de contexto por defecto de 262.144 tokens.

La relevancia de esta ficha radica en que no se trata de una cuantización GGUF convencional: los archivos requieren un fork específico de llama.cpp denominado llamAmpere (versión v0.7.4 o superior), y no cargan en llama.cpp estándar. El autor emplea formatos de cuantización propietarios (NVFP4Q8 y AI4) combinados con un modelo drafter separado para decodificación especulativa, lo que permite mantener precisiones de 5,4 y 4,4 bits por peso respectivamente.

El repositorio incluye dos variantes de pesos principales y un drafter, sumando 32,4 GB en total. La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es text-generation sin proyector de visión, por lo que la entrada es exclusivamente textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según tags del repositorio |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por defecto; hasta 319.488 en una GPU de 24 GB con el archivo de 5,4 bpw |
| Tipos de cuantizacion | NVFP4Q8 a 5,4 bpw; AI4 a 4,4 bpw; drafter en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere llamAmpere v0.7.4 o superior; no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), tal como indican las etiquetas del repositorio. No se dispone de información sobre el número de parámetros activos por token, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla en la información disponible ninguna innovación arquitectónica del modelo base más allá de su naturaleza MoE.

La contribución técnica de esta ficha es la cuantización: el autor genera pesos GGUF con esquemas NVFP4Q8 (5,4 bits por peso) y AI4 (4,4 bits por peso), e incluye un modelo drafter independiente en Q8_0 de 0,45 GB para decodificación especulativa. El preset `24ink` configura una caché KV de 4 bits, una sola ranura de servidor y la ventana de contexto de 262.144 tokens. La decodificación especulativa con el drafter es la que permite las tasas de decodificación reportadas en una única RTX 3090.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta `conversational`.
- Razonamiento multi-turno con ventanas de contexto muy largas (262.144 tokens por defecto, hasta 319.488 en configuración de 5,4 bpw).
- Decodificación especulativa mediante drafter separado, que acelera la generación.
- Compatibilidad con API compatible con OpenAI a través de `llama-server`.
- Entrada exclusivamente textual: el repositorio no incluye proyector de visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir informes, expedientes o bases de código completas en una sola pasada sobre una RTX 3090, sin fragmentación ni recuperación externa.
- Asistentes conversacionales de escritorio: desplegado con `llama-server` en un equipo con GPU de 24 GB, ofrece una API compatible con OpenAI que se integra directamente en aplicaciones de chat existentes sin cambios de cliente.
- Análisis de repositorios de código: la ventana extendida permite cargar varios archivos y mantener coherencia entre ellos en tareas de revisión o explicación de código, siempre que el modelo base tenga capacidad de código (no confirmado en la información disponible).
- Resumen y extracción de información en flujos por lotes: el throughput de prefill reportado (1.728 tok/s con el archivo de 5,4 bpw y 2.037 tok/s con el de 4,4 bpw a 100K de prompt) hace viable procesar prompts largos en pipelines automatizados.
- Experimentación e investigación en cuantización: el repositorio sirve como referencia práctica para evaluar los esquemas NVFP4Q8 y AI4 frente a cuantizaciones GGUF convencionales en hardware Ampere.
- Despliegue en estaciones de trabajo con Windows: el autor proporciona instrucciones y binarios para PowerShell, lo que facilita entornos de desarrollo no Linux con GPU de 24 GB.
- Prototipado de agentes con contexto largo: la combinación de ventana extendida y decodificación especulativa permite mantener historiales de conversación y estado de herramientas durante sesiones prolongadas en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de velocidad de inferencia en una RTX 3090 con llamAmpere v0.7.4, preset `24ink` y drafter activo, a contexto de 262.144 tokens:

| Archivo | Prompt 3K (tok/s) | Prompt 32K (tok/s) | Prompt 100K (tok/s) | Prefill a 100K (tok/s) |
|---|---|---|---|---|
| NVFP4Q8 5,4 bpw | 169,4 | 166,1 | 127,2 | 1.728 |
| AI4 4,4 bpw | no disponible | no disponible | 136,3 | 2.037 |

## Requisitos de hardware

- VRAM: el modelo está diseñado para caber íntegramente en 24 GB. El archivo de 5,4 bpw ocupa 17,56 GB y el de 4,4 bpw ocupa 14,37 GB, más 0,45 GB del drafter y la caché KV de 4 bits.
- GPU recomendadas: RTX 3090 y demás tarjetas Ampere de 24 GB (serie RTX 30). El autor indica que para tarjetas de 8, 10 y 12 GB existe un repositorio separado (Inkling-2-Mini-ATX-SmallCard-GGUF).
- Cabe en GPU de consumo: sí, en modelos de 24 GB de la serie RTX 30, siempre que se use el fork llamAmpere.
- Opciones de despliegue: exclusivamente llamAmpere v0.7.4 o superior mediante `llama-server` con el preset `24ink`. No carga en llama.cpp estándar, por lo que vLLM, TGI, Ollama y otras herramientas convencionales no son opciones válidas según la información disponible.
- Latencia y throughput: decodificación de 127,2 a 169,4 tok/s según longitud de prompt con el archivo de 5,4 bpw; prefill de 1.728 a 2.037 tok/s a 100K. El archivo de 4,4 bpw es más rápido en decodificación a 100K (136,3 frente a 127,2 tok/s).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa posible es entre las dos cuantizaciones del propio repositorio:

| Criterio | NVFP4Q8 5,4 bpw | AI4 4,4 bpw |
|---|---|---|
| Tamano | 17,56 GB | 14,37 GB |
| Precision | 5,4 bits por peso | 4,4 bits por peso |
| Contexto maximo en 24 GB | 319.488 tokens | 262.144 tokens (por defecto) |
| Decodificacion a 100K | 127,2 tok/s | 136,3 tok/s |
| Prefill a 100K | 1.728 tok/s | 2.037 tok/s |
| Uso recomendado | Mayor precision | Equilibrado, mas rapido a 100K |

## Limitaciones y advertencias

- Dependencia de un fork no estándar: los archivos no cargan en llama.cpp estándar y requieren llamAmpere v0.7.4 o superior, lo que limita la portabilidad y la integración con ecosistemas convencionales.
- Sin soporte de visión: el repositorio no incluye proyector de visión; la entrada es solo texto.
- Idiomas no declarados: no se especifica qué idiomas soporta el modelo base, lo que impide garantizar calidad multilingüe.
- Sin datos de benchmarks de calidad: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, por lo que el rendimiento cualitativo no puede verificarse a partir de la información disponible.
- Riesgo de alucinación y sesgos: no disponible en la documentación; debe asumirse el comportamiento del modelo base, cuyas características de alineación no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a la política de uso aceptable del modelo base, que debe consultarse antes de un despliegue en producción.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de validación comunitaria.
- Compatibilidad de hardware restringida: el preset y los esquemas de cuantización están ajustados a GPUs Ampere de 24 GB; otros hardware requieren el repositorio alternativo del mismo autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio para tarjetas pequeñas: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
