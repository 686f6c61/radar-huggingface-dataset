# divagr1925/Qwenputer-npu

## Resumen

Qwenputer-npu es una modificación experimental de Qwen3.5-4B, publicada por el usuario divagr1925, que integra una CPU RISC-V de 32 bits (RV32IM) "compilada" dentro de los pesos del propio modelo lingüístico. Esta versión añade a la CPU un conjunto de instrucciones neuronales (VDOT, SMAQA y WB) junto a una memoria de pesos int4 alojada en las cabezas de atención Gated DeltaNet, lo que permite ejecutar programas con operaciones matriciales de forma mucho más eficiente dentro del modelo.

La idea central es que el modelo contiene un ordenador funcional: 11 capas transformer compiladas actúan como CPU, con el estado de Gated DeltaNet como memoria RAM, y los pesos originales de Qwen permanecen intactos. Como demostración, el modelo ejecuta stories260K (un Llama de 260.000 parámetros entrenado por Karpathy en TinyStories) como un programa C, generando historias token a token. Es relevante como experimento de investigación sobre computación embebida en pesos, no como modelo de lenguaje de propósito general, aunque curiosamente mejora el rendimiento aritmético de Qwen3.5-4B en benchmarks sintéticos.

El checkpoint pesa 19,7 GB en safetensors (9.793.641.024 parámetros reales según safetensors, en gran parte relleno de ceros) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer, solo texto) con 11 capas CPU compiladas delante; CPU RV32IM + Zba + unidad bignum + VDOT, WB, SMAQA |
| Parametros totales | 9.793.641.024 (según safetensors; 19,6 GB en bf16, mayormente padding de ceros) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (exacto); pesos int4 en la memoria de pesos de la CPU embebida |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión modificada de Qwen3.5-4B en la que se añaden 11 capas transformer compiladas por delante de las 32 capas originales de Qwen. Estas capas implementan una CPU RISC-V RV32IM (con extensión Zba y una unidad bignum) cuyo estado (registros, memoria y contador de programa) reside en las cabezas de Gated DeltaNet del modelo: una clave one-hot sobrescribe una fila y una consulta one-hot la lee de vuelta. El tamaño oculto se amplía de 2560 a 4096 y el vocabulario se extiende con 263.092 "trace tokens" que representan instrucciones de la CPU. Los pesos de Qwen no se modifican; solo cambia la configuración y se añaden las capas del ordenador.

Esta versión añade dos instrucciones neuronales y una memoria de pesos: `VDOT` (producto escalar de 8 activaciones int8 con 8 pesos int4 consecutivos de la memoria de pesos), `SMAQA` (cuatro productos de bytes con signo, como en la extensión P de RISC-V) y `WB` (fija el inicio de los pesos). La memoria de pesos tiene 32.640 palabras (261.120 pesos int4) cargadas desde la sección `.wrom` del programa. Cada instrucción es un trace token calculado exactamente por las capas compiladas. No se ha publicado información sobre entrenamiento adicional con RLHF o DPO; los pesos int4 de la CPU provienen de destilar el modelo float sobre sus propias muestras.

## Capacidades

- Generacion de texto conversacional equivalente al modelo base Qwen3.5-4B (divergencia KL de 5,8e-4 frente a un suelo de ruido de 5,1e-4).
- Ejecucion de programas C arbitrarios en la CPU embebida, siempre que quepan en la memoria disponible.
- Ejecucion de stories260K (Llama de 260K parametros) como programa huesped: cada multiplicacion es una instruccion de la CPU.
- Aritmetica entera mejorada respecto al modelo base mediante el programa `calc` ejecutado en la CPU embebida.
- Verificacion determinista: las capas chip pasan programas de prueba de VDOT y SMAQA con cero discrepancias frente a un modelo de referencia de la CPU.
- No disponible: informacion sobre tool calling, agentes, vision, audio o soporte multilingue.

## Casos de uso

- Investigacion en computacion embebida en pesos: permite estudiar como compilar hardware (una CPU completa) dentro de las capas de un transformer y verificar la ejecucion de forma exacta y determinista.
- Ejecucion de modelos huesped dentro de un modelo mayor: cualquier modelo que quepa en la memoria de la CPU (como stories260K) puede ejecutarse sin recompilar el checkpoint, como banco de pruebas de "modelo dentro del modelo".
- Aritmetica exacta en conversaciones: mediante el firmware `calc-bridge.elf`, el modelo delega multiplicaciones de enteros grandes a la CPU embebida, alcanzando 97,5 en el benchmark mul_big frente a 55,0 del modelo base.
- Verificacion formal de ejecucion: las instrucciones VDOT y SMAQA pueden comprobarse con `npucheck` contra un modelo de referencia, util para auditoria de comportamiento determinista.
- Generacion de historias cortas estilo TinyStories: el programa stories260k escribe historias token a token en la CPU, a razon de unos 41 segundos por token de historia en una L4.
- Experimentacion con conjuntos de instrucciones neuronales: los investigadores pueden añadir programas con las secciones `.wrom` y probar nuevas instrucciones (VDOT, SMAQA, WB) sobre el checkpoint publicado.

## Benchmarks y rendimiento

| Benchmark | Base Qwen3.5-4B | Qwenputer-npu |
|---|---|---|
| Aritmetica entera sintetica | 75,0 | 90,0 |
| DeepMind mul_big | 55,0 | 97,5 |

Los cuatro fallos de aritmetica se deben a Qwen repitiendo llamadas a `calc` hasta agotar el presupuesto, con la CPU respondiendo correctamente en cada una; el Qwenputer original puntua 97,5 en ese conjunto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

Rendimiento del executor: unos 5.500 trace tokens por segundo en una L4, lo que equivale a unos 41 segundos por token de historia en stories260K (con VDOT + SMAQA y pesos int4: 225.000 trace tokens por token de historia, frente a 2.430.000 en C plano con pesos int8).

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 19,6 GB en bf16, por lo que se necesita al menos una GPU con 24 GB de VRAM para cargarlo completo.
- GPU recomendadas: NVIDIA L4 (usada por el autor, ~24 GB), RTX 4090, RTX 3090, A100 o superiores.
- Consumer GPUs: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16; no disponible informacion sobre cuantizacion para reducir el requisito.
- Despliegue: mediante el repositorio de GitHub del proyecto (`chipformer.rv.chat`, `chipformer.rv.npucheck`, `storyrun.py`) con `uv`; no disponible informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia: unos 5.500 trace tokens por segundo en una L4 con el executor fusionado; 41 segundos por token de historia en stories260K.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Particularidad | Licencia |
|---|---|---|---|---|
| Qwenputer-npu | 9,79 B (safetensors) | Qwen3.5-4B + CPU RV32IM embebida con instrucciones NPU | CPU RISC-V con VDOT/SMAQA y memoria de pesos int4; ejecuta modelos huesped | Apache-2.0 |
| Qwenputer (Qwen3.5-4B-Qwenputer) | no disponible | Qwen3.5-4B + CPU RV32IM embebida | Version previa sin instrucciones neuronales; 97,5 en aritmetica sintetica | Apache-2.0 |
| Qwen/Qwen3.5-4B | no disponible | Transformer con Gated DeltaNet | Modelo base, pesos sin modificar; 55,0 en mul_big | no disponible |

## Limitaciones y advertencias

- Es un proyecto de investigacion experimental, no un modelo de produccion: su utilidad principal es demostrar computacion embebida en pesos, no servir como asistente general.
- La generacion de texto replica al modelo base, pero no se han publicado evaluaciones estandar de calidad (MMLU, GSM8K, etc.).
- Riesgo de alucinacion heredado de Qwen3.5-4B; no disponible informacion sobre evaluaciones especificas de veracidad.
- El vocabulario se amplio con 263.092 trace tokens, lo que puede afectar a herramientas compatibles con transformers que asuman el vocabulario original de Qwen.
- La ejecucion en la CPU embebida es extremadamente lenta para cargas reales (41 segundos por token de historia en stories260K).
- El checkpoint ocupa 19,6 GB en bf16, "mayormente zero padding", lo que implica ineficiencia de almacenamiento y memoria.
- No disponible informacion sobre sesgos conocidos, longitud de contexto o idiomas soportados.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial; stories260K es de Andrej Karpathy bajo licencia MIT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divagr1925/Qwenputer-npu
- Codigo en GitHub (rama npu): https://github.com/divagr18/qwenputer/tree/npu
- Qwenputer (version anterior): https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
