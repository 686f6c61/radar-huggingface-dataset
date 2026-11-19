# loom-draft/unsloth-Llama-3.2-1B-Instruct-loom

## Resumen

`loom-draft/unsloth-Llama-3.2-1B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Llama-3.2-1B-Instruct-GGUF` en su variante `Llama-3.2-1B-Instruct-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del Llama 3.2 1B Instruct de Meta en cuantizacion Q4_K_M, empaquetados para ejecutarse sobre GPUs AMD mediante el runtime `loom-serve` del ecosistema Loom (repositorio `ROCm/hrx-system`). El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador de paquetes del proyecto, sin intervencion de un LLM en el proceso.

El objetivo del paquete es ofrecer una ruta de despliegue nativa para dos aceleradores AMD concretos: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (objetivo `gfx1151`) y la GPU AMD Radeon AI PRO R9700 (objetivo `gfx1201`, 32 GB). El modelo subyacente es un transformer decoder-only de 1.230 millones de parametros con una ventana de contexto nativa de 128K tokens, pensado para instrucciones ligeras, resumen y tareas de chat de baja latencia en hardware de gama consumer o workstation.

La relevancia de esta ficha es doble: por un lado documenta un caso de empaquetado especifico para el stack ROCm/HIP de AMD, una alternativa poco cubierta frente a CUDA; por otro, advierte de que el paquete es un borrador (`loom-draft`) con cero descargas y sin mediciones de rendimiento ni evidencia de los gates de correccion registradas en la fecha de publicacion (2026-11-19).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, denso) |
| Parametros totales | 1.230 millones (1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens por peticion (segun la model card); contexto nativo del modelo base: 128K |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye pesos ya cuantizados en Q4_K_M |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Llama 3.2 declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) mas `tokenizer.json`, `llm_config.json` y `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 1B Instruct, un transformer decoder-only denso de Meta con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y tokenizer BPE de 128K entradas. La variante 1B de la familia Llama 3.2 se entreno con destilacion a partir de modelos mayores (segun la documentacion publica de Meta) y posteriormente se alineo con tecnicas de RLHF y DPO. El checkpoint utilizado aqui es el de Unsloth en formato GGUF, cuantizado a Q4_K_M, sin modificaciones en los pesos.

El paquete Loom no reentrena ni altera el modelo: genera kernels y programas especificos para los objetivos AMD `gfx1151` y `gfx1201` a partir de la configuracion del GGUF. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de alineamiento, por lo que esos datos deben consultarse en la documentacion oficial de Llama 3.2. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.); de hecho, la tabla de caracteristicas del paquete marca la decodificacion especulativa como "not applicable".

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla de Llama 3.2 Instruct.
- Instrucciones y tareas de resumen, reescritura y clasificacion de texto breve.
- Tool calling estilo OpenAI: soporta los campos `tools` y `tool_calls` en la API `/v1/chat/completions`.
- Bucles de agente multi-turno con reutilizacion de historial (validados por el gate `agent` del banco de pruebas Loom, aunque sin evidencia registrada en esta publicacion).
- Concurrencia de hasta 4 peticiones simultaneas segun la configuracion del preset.
- Salida maxima de 4.096 tokens por respuesta (parametro `max_tokens` del preset).
- Capacidades multilingues heredadas del modelo base (8 idiomas oficiales), aunque la model card del paquete no las declara explicitamente.
- No soporta razonamiento extendido ni modo "thinking" (marcado como no aplicable).
- No soporta entrada de imagen ni audio.
- No soporta decodificacion especulativa.

## Casos de uso

- **Chat de baja latencia en hardware AMD consumer o workstation**: el paquete esta optimizado para Strix Halo y Radeon AI PRO R9700, por lo que se puede desplegar un endpoint compatible con OpenAI en una estacion de trabajo AMD sin depender de CUDA. Adecuado para prototipos y demos internas.
- **Asistente de codigo ligero en IDE o CLI**: con 1B de parametros y contexto de 128K, puede gestionar autocompletado, explicacion de fragmentos y generacion de tests unitarios en entornos con recursos limitados, siempre que la precision no sea critica.
- **Clasificacion y extraccion de entidades en documentos largos**: la ventana de 131.072 tokens permite procesar contratos, actas o informes extensos en una sola peticion para tareas de etiquetado o resumen extractivo.
- **Agente de automatizacion con tool calling**: integrable en flujos que requieran invocar APIs externas (calendario, busqueda, calculadora) mediante el esquema `tools`/`tool_calls`, con hasta 4 peticiones concurrentes por instancia.
- **Prototipado de pipelines RAG**: util como generador de respuestas en un sistema de recuperacion aumentada sobre corpus pequenos o medianos, gracias al contexto largo y a la API compatible con OpenAI que facilita el cambio de backend.
- **Evaluacion comparativa de runtimes AMD**: sirve como banco de pruebas para medir el rendimiento del stack Loom frente a llama.cpp en las mismas GPUs, ya que el paquete incluye gates de correccion (`golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) disenados para comparar token a token contra la referencia de llama.cpp.
- **Despliegue en entornos con requisitos de licencia Llama 3.2**: al conservar la licencia original, se puede usar en productos comerciales que cumplan los terminos de la Llama 3.2 Community License (incluida la clausula de denominacion "Llama" y las restricciones de uso aceptable).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este paquete.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint Q4_K_M de un modelo de 1B ocupa aproximadamente 0,8-1,0 GB en pesos; sumando cache KV para contexto largo (131K tokens) y overhead del runtime, se recomienda reservar al menos 4-8 GB de VRAM para uso con contexto extendido.
- **GPU objetivo declaradas**: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete esta generado especificamente para estos objetivos; no se garantiza su funcionamiento en otras GPUs AMD ni en NVIDIA.
- **Cabe en GPU consumer**: si, siempre que sean AMD con soporte ROCm/HIP para los objetivos indicados. No hay soporte declarado para GPUs NVIDIA en este paquete.
- **Opciones de despliegue**: `loom-serve` (runtime del ecosistema Loom) con `loom-fetch` para descargar el paquete desde Hugging Face. Instalacion via `pipx install "hrx-loom[hf]==0.2.0"`. Alternativas no incluidas en el paquete: llama.cpp, Ollama, vLLM o TGI, que requeririan el GGUF original de Unsloth.
- **Latencia y throughput**: no disponibles. La model card no incluye mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Llama-3.2-1B-Instruct-loom` (este) | 1,23B | 131.072 tokens por peticion | Llama 3.2 | Paquete Loom (`.loom`) para AMD gfx1151/gfx1201 | Borrador sin mediciones ni gates registrados |
| `unsloth/Llama-3.2-1B-Instruct-GGUF` (modelo base) | 1,23B | 128K tokens | Llama 3.2 | GGUF (Q4_K_M y otras) | Checkpoint original sin empaquetar; compatible con llama.cpp, Ollama, etc. |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,23B | 128K tokens | Llama 3.2 | safetensors | Pesos originales en precision completa; requiere framework de inferencia |
| `Qwen2.5-1.5B-Instruct` | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con contexto menor y licencia permisiva |

La comparativa se limita a modelos de la misma categoria (1-2B parametros, instrucciones). No se dispone de datos de rendimiento comparativo para este paquete en concreto.

## Limitaciones y advertencias

- **Paquete en estado de borrador**: publicado bajo el prefijo `loom-draft`, con cero descargas y cero likes en el momento de la consulta. No debe considerarse estable para produccion.
- **Sin evidencia de correccion**: todos los gates del banco de pruebas Loom figuran como "not yet re-measured". No hay verificacion publicada de que la salida coincida con la referencia de llama.cpp.
- **Sin mediciones de rendimiento**: no se han publicado cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- **Restriccion de hardware**: el paquete esta generado exclusivamente para AMD gfx1151 y gfx1201. No funciona en GPUs NVIDIA ni en otras arquitecturas AMD sin regeneracion.
- **Riesgo de alucinacion**: inherente a un modelo de 1B de parametros; la precision factografica es limitada y no es adecuado para tareas que requieran alta fidelidad sin verificacion humana.
- **Limitaciones de contexto**: aunque la ventana es de 131.072 tokens por peticion, la calidad de recuperacion en contextos muy largos en un modelo de 1B es limitada; el contexto efectivo suele ser inferior al nominal.
- **Idiomas**: la model card del paquete no declara idiomas soportados; el modelo base declara 8 idiomas oficiales, pero el rendimiento fuera del ingles es notablemente inferior.
- **Licencia Llama 3.2**: uso comercial permitido bajo los terminos de la Llama 3.2 Community License, que exige mantener la denominacion "Llama" en la documentacion, incluir el aviso de licencia y respetar la politica de uso aceptable. Empresas con mas de 700 millones de usuarios mensuales necesitan licencia adicional de Meta.
- **Dependencia del ecosistema Loom**: el paquete requiere `hrx-loom[hf]==0.2.0` y el runtime `loom-serve`; no es portable a otros motores de inferencia sin convertir de nuevo el GGUF original.
- **Concurrencia limitada**: 4 peticiones simultaneas por instancia segun el preset, lo que restringe su uso en entornos de alta carga.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Llama-3.2-1B-Instruct-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador de paquetes loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
