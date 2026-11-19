# listener8341/SenseNova-Loop-9B-MLX-port

## Resumen

SenseNova-Loop-9B-MLX-port es un port independiente del modelo SenseNova-Loop-9B al ecosistema MLX de Apple, publicado por el usuario listener8341. No contiene pesos: es un repositorio de codigo que implementa la arquitectura del modelo base para que `mlx-lm` pueda cargarlo y ejecutarlo en Apple Silicon. El modelo original, desarrollado por el equipo SenseNova, es un transformer de 9.000 millones de parametros con una innovadora arquitectura de bucles de capas y residuales multi-stream (mHC), pensada para razonamiento de multiples pasos.

La relevancia de este port radica en que permite ejecutar el modelo en Macs con chip Apple Silicon sin necesidad de GPU dedicada, mediante cuantizacion a 6 y 4 bits. El autor valida el port con una regresion determinista de 18 items (10 de matematicas, 5 de razonamiento financiero A-share y 3 de formato exacto), obteniendo 17/18 en 6 bits frente a 16/18 en bf16 de referencia, lo que sugiere ausencia de perdida medible de calidad en esa configuracion.

El modelo base emplea una arquitectura hibrida con 32 capas fisicas y atencion lineal combinada con atencion completa, ejecutando las capas 4-27 dos veces para un total de 56 slots de ejecucion. Este port cubre unicamente el modo texto: la torre de vision, la cabeza MTP y el `loop_gate` no estan implementados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y completa, bucle de capas y residuales mHC |
| Parametros totales | 9.000 millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la validacion menciona un limite de 8k tokens en una prueba) |
| Tipos de cuantizacion | 6 bits affine group 64 (recomendada), 4 bits, bf16 |
| Idiomas soportados | no disponible (la model card incluye ejemplos en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors convertidos a MLX (el repo solo contiene codigo, sin pesos) |

## Arquitectura y entrenamiento

El backbone consta de 32 capas fisicas con un patron de `layer_types` que repite 3 capas de atencion lineal seguidas de 1 de atencion completa (completa en los indices 3, 7, ..., 31). El plan de ejecucion es `[0..3] + [4..27]×2 + [28..31]`, lo que da 56 slots de ejecucion; las capas 4-27 se ejecutan dos veces con slots KV independientes en cada visita. Las capas 4-27 enrutan el residual a traves de un `FusedMHCRouter` con 20 iteraciones sobre 2 streams, con la aritmetica del router en FP32. La atencion usa `attn_output_gate`, `head_dim=256`, RoPE y SDPA. Las proyecciones GDN estan separadas en `in_proj_qkv`, `z`, `a` y `b`, con split de bloque `[key_dim, key_dim, value_dim]`.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO. El port fue escrito desde cero contra el config y el codigo de modelado oficiales, y su validacion numerica se hizo mediante dumps de alineacion MLX frente a PyTorch. El propio port, la cuantizacion y la validacion fueron generados por un agente autonomo basado en un modelo Qwen3.8-27B-6bit ejecutado localmente en un Mac de 64 GB, con 483 llamadas al modelo y 1,56 M tokens de entrada y 0,79 M de salida en unas 20,5 horas.

## Capacidades

- Generacion de texto en modo chat y completado, mediante `mlx_lm.generate` y `mlx_lm.server`.
- Razonamiento matematico de estilo competicion (validado con 10 items con respuesta verificable).
- Razonamiento financiero y de mercado A-share (5 prompts de validacion).
- Seguimiento de formato exacto de instrucciones (3 prompts de validacion).
- Capacidad multilingue: no confirmada de forma explicita; los ejemplos de la model card estan en chino.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado para este port.
- Vision: no implementada en este port (la torre de vision del modelo base queda fuera del alcance).
- Modo thinking: el chat template puede emitir un bloque `</think>` que debe eliminarse de la salida.

## Casos de uso

- Razonamiento matematico local en Mac: el modelo resuelve problemas de competicion con respuesta verificable, y la validacion del port confirma 17/18 en 6 bits, por lo que es adecuado para prototipos de tutoria o verificacion de calculos en un portatil Apple Silicon.
- Analisis de razonamiento financiero: los prompts A-share de la validacion muestran capacidad de razonamiento sobre mercados; se puede usar para generar borradores de analisis o explicaciones de conceptos financieros en local.
- Procesamiento por lotes offline en Apple Silicon: con 7,38 GB de memoria pico y 9,3 tok/s en una instalacion limpia, encaja en flujos de generacion por lotes nocturnos en un Mac de 64 GB.
- Servidor de inferencia local: `mlx_lm.server` permite exponer el modelo como endpoint HTTP para herramientas internas de desarrollo sin salir del equipo.
- Evaluacion y comparacion de arquitecturas: al ser un port de codigo abierto con plan de ejecucion y router documentados, sirve para estudiar el comportamiento de arquitecturas con bucle de capas y residuales mHC.
- Generacion de texto asistida en entornos con requisitos de privacidad: al ejecutarse localmente y no requerir servicios en la nube, es apto para prototipos donde los datos no deben salir del dispositivo.
- Experimentacion con cuantizacion: el repositorio incluye configuracion de 6 bits y resultados comparativos con 4 bits y bf16, util para estudiar el impacto de la cuantizacion en modelos con bucles de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica evaluacion es la regresion determinista propia del autor:

| Precision | Puntuacion (18 items) | Notas |
|---|---|---|
| bf16 (referencia) | 16/18 | falla quant2 (ambiguedad de clave) y quant5 (limite de 8k tokens) |
| 6 bits | 17/18 | solo falla quant2, el mismo fallo que bf16; concordancia de respuesta extraida 11/11 con bf16 |
| 4 bits | 16/18 | falla ademas math8 (13 frente a 913); concordancia 10/11 |

Mediciones de ejecucion en una instalacion limpia (venv, `mlx-lm==0.29.1`, 6 bits): 9,3 tok/s y 7,38 GB de memoria pico. El autor advierte que el throughput no se midio de forma limpia porque tres servidores (bf16, 6 bits y 4 bits) coexistian en el mismo Mac de 64 GB compartiendo la GPU.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,38 GB de pico con cuantizacion de 6 bits en una instalacion limpia.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor uso un Mac de 64 GB. No se documentan GPU NVIDIA ni CUDA.
- Cabe en consumer hardware: si, en Macs con chip Apple Silicon y memoria suficiente; el requisito exacto minimo no esta documentado.
- Opciones de despliegue: `mlx-lm` (version 0.29.1 probada, mlx 0.29.3, Python 3.9, macOS arm64) mediante `mlx_lm.generate` y `mlx_lm.server`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,3 tok/s medidos en 6 bits, con la salvedad de que la medicion no fue limpia por contencion de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (oficial) | 9B | no disponible | Apache-2.0 (gated) | Hugging Face con acceso restringido | Modelo base, incluye vision y MTP |
| SenseNova-Loop-9B-MLX-port (este) | 9B | no disponible | Apache-2.0 | Codigo abierto, pesos via conversion propia | Solo texto, requiere `mlx-lm` |
| netprojects/SenseNova-Loop-9B-MLX-* | 9B | no disponible | no disponible | Publicado el 17-18 nov 2026 | Port independiente alternativo, no comparado numericamente |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo codigo, no pesos; es necesario solicitar acceso al repositorio oficial gated y convertir los pesos con `mlx_lm.convert`.
- Alcance solo texto: no implementa la torre de vision, la cabeza MTP ni el `loop_gate` del modelo base.
- La salida puede incluir un bloque `</think>` filtrado por el chat template; hay que eliminar todo hasta `</think>` inclusive antes de comparar cadenas.
- La validacion es una regresion propia de 18 items, no un benchmark estandar; no hay datos de MMLU, HumanEval ni GSM8K.
- El throughput de 9,3 tok/s se midio con contencion de GPU y no es una cifra limpia de rendimiento.
- La cuantizacion a 4 bits muestra degradacion real en un item de aritmetica multi-paso; se recomienda 6 bits.
- Un item de la prueba alcanzo el limite de 8k tokens, lo que sugiere limitaciones practicas de contexto no documentadas formalmente.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible.
- Idiomas soportados: no confirmados; los ejemplos estan en chino.
- Licencia Apache-2.0 permite uso comercial, pero el acceso a los pesos oficiales esta restringido por gate y sujeto a los terminos del repositorio base.
- El port fue generado por un agente autonomo; aunque el autor documenta revision humana, conviene auditar el codigo antes de usarlo en produccion.

## Enlaces

- Repositorio del port: https://huggingface.co/listener8341/SenseNova-Loop-9B-MLX-port
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Port alternativo de NetProjects: https://huggingface.co/netprojects
- Libreria MLX-LM: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
