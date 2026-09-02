# protogeni/Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4

## Resumen

Qwen3.8-27B-Uncensored-W4A16-RTX3090-MTP4 es un derivado del modelo Qwen3.8-27B de Alibaba, cuantizado a W4A16 y optimizado para servir con decodificacion especulativa MTP (multi-token prediction) en una unica GPU RTX 3090 de 24 GB. Lo desarrolla protogeni y su linaje es: Qwen/Qwen3.8-27B original → orcarouter/Qwen3.8-27B-Uncensored (abliterado) → noon-at-cgn/Qwen3.8-27B-Uncensored-W4A16-AutoRound (cuantizacion AutoRound) → este checkpoint, que anade calibracion GPTQ del lm_head y del modulo MTP, y optimizacion de servicio.

El modelo conserva la torre de vision y los procesadores multimodales del base, soporta hasta 80.000 tokens de contexto y esta disenado para inferencia de baja latencia con el runtime vLLM 0.27.1 parcheado de syv-ai/qwen38-27b-rtx3090. Es relevante porque demuestra que un modelo de 27B con vision, razonamiento, tool-calling y contexto largo puede ejecutarse en hardware de consumo con rendimiento medido de 143,1 tokens/s en decodificacion aislada.

Advertencia critica: el checkpoint hereda la eliminacion de alineamiento de seguridad (abliteracion) de su ascendente y puede cumplir solicitudes daninas, eticas, ofensivas o ilegales. No debe exponerse a usuarios no confiables sin una capa de seguridad independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (Gated DeltaNet lineal + atencion completa), vision-lenguaje |
| Parametros totales | 6.260.690.960 (segun safetensors; el modelo base se anuncia como ~27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 80.000 tokens (maximo configurado; capacidad KV de arranque 80.392 tokens) |
| Tipos de cuantizacion | W4A16 simetrico grupo 128 (cuerpo transformer), INT8 grupo 128 (embeddings), INT4 GPTQ grupo 128 (lm_head y modulo MTP) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atencion hibrida: combina Gated DeltaNet (atencion lineal) con atencion completa, e incluye capacidades nativas de vision-lenguaje, razonamiento, tool-calling y una cabeza de decodificacion especulativa MTP. Este checkpoint aplica cuantizacion W4A16 simetrica con grupo de 128 en el cuerpo del transformer, embeddings en INT8 con grupo de 128, y lm_head y modulo MTP en INT4 calibrados con GPTQ, tambien con grupo de 128. La cabeza de borrador usa 40.960 filas cortadas del lm_head INT4 calibrado, y su vocabulario se selecciono a partir de la distribucion de tokens de salida generada por el propio checkpoint, no heredada del modelo Qwen alineado.

La calibracion genero 6.761 respuestas con 5.500.353 tokens de salida; el vocabulario de borrador cubrio el 97,77% de un conjunto de retencion de 571.632 tokens. La calibracion de estados ocultos uso 1.200 secuencias y 1.273.013 filas. La calibracion del lm_head INT4 midio KL 0,00308 con GPTQ frente a 0,00695 con redondeo al mas cercano. El modelo hereda la abliteracion (eliminacion de rechazos) de su ascendente orcarouter, lo que elimina la mayor parte del alineamiento de seguridad.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo thinking configurable (activado o desactivado).
- Generacion de codigo: HumanEval 94,51% y HumanEval+ 90,85% pass@1 con thinking desactivado.
- Matematicas: GSM8K 94,77% con thinking desactivado.
- Vision-lenguaje: conserva la torre de vision y los procesadores multimodales del modelo base.
- Tool calling / function calling, compatible con el runtime vLLM y su API OpenAI-compatible.
- Decodificacion especulativa MTP con cabeza de borrador INT4: 3,20 tokens emitidos por paso de verificacion.
- Contexto largo de hasta 80.000 tokens con recuperacion exacta (12/12 en pruebas sinteticas a ~76.000 tokens).
- Multilingue limitado a ingles y chino.

## Casos de uso

- Despliegue de asistente local en GPU de consumo: el modelo cabe en una RTX 3090 de 24 GB con vLLM y alcanza 143,1 tokens/s de media en decodificacion aislada, viable para servir conversaciones interactivas sin depender de APIs externas.
- Investigacion sobre decodificacion especulativa: el rendimiento MTP documentado (3,20 tokens emitidos por paso, aceptacion por posicion del 79,9%, 59,9%, 45,2% y 35,1%) permite estudiar la eficiencia de la verificacion multi-token en modelos de 27B.
- Investigacion sobre cuantizacion: la calibracion GPTQ del lm_head y del modulo MTP con medicion de divergencia KL (0,00308 GPTQ frente a 0,00695 redondeo) sirve como referencia para comparar metodos de cuantizacion de cabezas de salida.
- Red-teaming y evaluacion de seguridad: al ser abliterado, es un banco de pruebas para estudiar comportamientos sin alineamiento y para desarrollar capas de guardarrailes externas.
- Razonamiento multimodal en local: conserva la torre de vision, permitiendo tareas de imagen-texto sin infraestructura cloud, aunque con rendimiento MMMU limitado (24,56%).
- Evaluacion de sistemas RAG y agentes con memoria extendida: la recuperacion 12/12 a ~76.000 tokens permite probar pipelines de contexto largo en hardware modesto.
- Servicio de inferencia con autenticacion por API: el runtime de syv-ai incluye una API compatible con OpenAI con autenticacion por clave, util para integrar el modelo en entornos de desarrollo.

## Benchmarks y rendimiento

Calidad (evaluaciones publicadas por el autor):

| Evaluacion | Resultado | Configuracion |
|---|---|---|
| GSM8K | 94,77% (1.250/1.319) | thinking off; IC 95% Wilson 93,43–95,85% |
| MMLU-Pro | 76,14% (1.066/1.400) | 5-shot, thinking on, tope 4.096 tokens |
| HumanEval | 94,51% pass@1 (155/164) | thinking off |
| HumanEval+ | 90,85% pass@1 (149/164) | thinking off |
| IFBench | 39,33% estricto / 42,00% laxo | 300 prompts, thinking off |
| MMMU validacion | 24,56% (221/900) | thinking off, MTP off; 891 tope de contexto alcanzados |
| Recuperacion contexto largo | 100% (12/12) | ~8k/32k/64k/76k tokens; objetivo al 10%/50%/90% de profundidad |

Rendimiento de servicio (RTX 3090 Ti, vLLM 0.27.1 parcheado):

| Medida | Resultado |
|---|---|
| Perfil de servicio | MTP-4, KV BF16, FlashAttention 2, prefix cache |
| Decodificacion aislada 512 tokens | 143,1 tok/s media, 151,0 mediana |
| Rango de decodificacion | 95,5–181,2 tok/s en 5 prompts realistas |
| Throughput agregado | 243,1 tok/s (C2); 282,6 tok/s (C4) |
| Rendimiento MTP | 3,20 tokens emitidos por paso de verificacion |
| Aceptacion MTP por posicion | 79,9%, 59,9%, 45,2%, 35,1% |

El resultado de MMLU-Pro coincide con el reportado por el upstream W4A16 (76,1%), lo que sugiere que la calibracion especifica de servicio no anade perdida medible en ese benchmark, aunque no es una ablacion controlada de los efectos de cuantizacion y abliteracion.

## Requisitos de hardware

- GPU minima: NVIDIA RTX 3090 o 3090 Ti con 24 GB de VRAM; las mediciones se realizaron en una RTX 3090 Ti.
- VRAM: 24 GB para el perfil completo con KV en BF16 y contexto de 80.000 tokens.
- Runtime: vLLM 0.27.1 parcheado del repositorio syv-ai/qwen38-27b-rtx3090; requiere FlashAttention 2.
-
