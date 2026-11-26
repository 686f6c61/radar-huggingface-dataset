# SkyIsNotGreen/Scion-FlashNext-176B-A6B-mtp-drafter

## Resumen

Scion-FlashNext-176B-A6B-mtp-drafter es un conjunto de dos modelos borrador (drafters) para decodificación especulativa, diseñados específicamente para acelerar la inferencia del modelo objetivo Scion-FlashNext-176B-A6B, un MoE de 176.000 millones de parámetros con 6.000 millones activos. Lo desarrolla SkyIsNotGreen y se publica bajo licencia Apache 2.0. No es un modelo de propósito general: es un componente auxiliar que propone tokens candidatos que el modelo grande verifica en una sola pasada, manteniendo la salida idéntica a la decodificación sin borrador cuando se usa muestreo greedy.

El repositorio contiene dos artefactos GGUF distintos, no intercambiables, para dos motores diferentes. El sidecar de llama.cpp (`scion-mtp-sidecar-v2.gguf`, 0,115 GB) implementa únicamente tres matrices de cabeza en fp16 más el tokenizador del objetivo; las embeddings y la LM head se comparten en tiempo de ejecución desde el modelo grande. El drafter nativo para Strata (`Scion-FlashNext-176B-A6B-mtp-drafter.gguf`, 0,889 GB) empaqueta el bloque MTP nativo del modelo. Los pesos safetensors del repositorio suman 2.607.150.848 parámetros, aunque el sidecar efectivo que se carga es mucho menor.

La relevancia práctica es doble: por un lado demuestra una técnica de decodificación especulativa encadenada (hasta tres borradores por ronda verificados en una pasada del objetivo), y por otro documenta con honestidad sus límites, incluyendo que en el único host medido (2x RX 7900 XT con 20,5 GB cada una y 31 GB de RAM) el rendimiento neto empeora por la falta de residencia del conjunto de expertos. Es un caso instructivo de ingeniería de inferencia para MoE de gran tamaño en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafters de decodificación especulativa: sidecar fc-head (3 matrices de cabeza) y bloque MTP nativo; modelo base MoE Scion-FlashNext-176B-A6B |
| Parametros totales | 2.607.150.848 (safetensors del repo); sidecar efectivo 0,115 GB y drafter Strata 0,889 GB |
| Parametros activos | no disponible para el drafter; el objetivo declara A6B (6B activos) |
| Longitud de contexto | probado hasta 4096 tokens; no se han validado contextos mayores |
| Tipos de cuantizacion | GGUF; sidecar en fp16 (matrices de cabeza); objetivo en Q6_K con expertos ternarios/PTQ1_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp y Strata) |

## Arquitectura y entrenamiento

El sidecar de llama.cpp es un modelo de cabeza ligera entrenado contra las propias filas de entrada de cabeza del objetivo. Para cada posición recibe la fila de entrada de cabeza de 2560 dimensiones (salida del mezclador hc) y la embedding del token candidato, y predice el siguiente token a través de la proyección de salida del propio objetivo. La tercera cabeza (`fc3`) predice la siguiente fila de entrada de cabeza del borrador, lo que permite encadenar hasta tres borradores por ronda y verificarlos en una única pasada del modelo grande. Solo se distribuyen las tres matrices de cabeza en fp16 más el tokenizador; embeddings y LM head se comparten desde el objetivo mediante `ctx_other`.

El segundo artefacto empaqueta el bloque MTP nativo del modelo para el motor Strata. No hay información publicada sobre el volumen de tokens de entrenamiento del drafter, la composición del dataset ni si se aplicó RLHF o DPO. La innovación destacable es la verificación especulativa encadenada con profundidad 4 y la garantía de que, con muestreo greedy, los tokens generados son idénticos a los de una ejecución sin drafter. El sidecar requiere un build específico de llama.cpp (arquitectura `mtp-sidecar`, lane `--spec-type draft-mtp`, rama `scion-base`, commit `2089cd1d3`), con paquetes precompilados Linux ROCm/CPU en la release `scion-v1.0.0`.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre el objetivo Scion-FlashNext-176B-A6B; no es un modelo generativo autónomo.
- Encadenamiento de hasta tres borradores por ronda mediante la cabeza `fc3`, con verificación en una sola pasada del objetivo.
- Preservación exacta de la salida bajo muestreo greedy: los tokens coinciden con la ejecución sin drafter.
- Compatibilidad con dos motores: llama.cpp (sidecar fc-head) y Strata (bloque MTP nativo).
- Compartición de embeddings y LM head con el objetivo en el caso del sidecar, lo que reduce el peso descargado a 0,115 GB.
- Soporte exclusivo de inglés, heredado del objetivo.
- No soporta tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependerían del modelo objetivo, no del drafter.

## Casos de uso

- Aceleración de inferencia de un MoE de 176B en producción: el sidecar propone tokens que el objetivo verifica en bloque, con una media de 1,81 tokens por paso del objetivo en distribución de chat y razonamiento (63,1% de aceptación del primer borrador). Adecuado cuando el conjunto de expertos reside en VRAM.
- Servicio de chat y razonamiento de baja latencia: la distribución de mayor aceptación es precisamente la de rollouts de profesor y chat, por lo que es el escenario donde el drafter aporta más.
- Despliegue en llama.cpp con modelos cuantizados Q6_K: el sidecar se integra con `-md` y `--spec-type draft-mtp` junto al GGUF del objetivo, sin reentrenar nada.
- Evaluación de decodificación especulativa en investigación: el repositorio publica tablas de aceptación por profundidad (24% en el segundo borrador, 15% en el tercero) que sirven para calibrar cadenas de verificación.
- Integración en el motor Strata: el drafter nativo MTP permite probar la ruta de decodificación especulativa de ese runtime con el mismo objetivo.
- Reproducción de resultados: la rama legacy `engine/slotcache-sidecar` de Prism permite replicar los números de aceptación originales y cuenta con el arreglo de rollback de snapshots recurrentes de qwen4exp.
- Prototipado en hardware de consumo con reparto de expertos en RAM: útil para validar la corrección de la salida (idéntica a greedy) aunque el throughput neto no mejore en ese host.

## Benchmarks y rendimiento

Aceptación medida en ventanas de prueba reservadas, greedy, profundidad de cadena 4:

| Conjunto reservado | Primer borrador aceptado | Longitud media aceptada | Tokens por paso del objetivo |
|---|---:|---:|---:|
| chat / razonamiento (rollouts de profesor) | 63,1% | 0,81 borradores | 1,81 |
| wiki / código | 30,3% | 0,39 borradores | 1,40 |

Comprobación en motor sobre prompt estilo wiki: 1,53 tokens por paso del objetivo (32 aceptados de 179 propuestos, greedy).

Velocidad en caliente, greedy, 64 tokens, mismo prompt, mismo host de validación:

| Host | Sin drafter | Con sidecar |
|---|---:|---:|
| 2x RX 7900 XT (20,5 GB cada una), 31 GB RAM | 22,52 tok/s | 14,69 tok/s |

El host no puede mantener el conjunto de expertos del 176B en VRAM, por lo que 24 capas de expertos quedan en RAM del sistema y la pasada de verificación de 4 tokens lee más expertos residentes en host por paso que una decodificación de un solo token. El drafter devuelve 1,53 tokens por paso pero el paso cuesta 2,3 veces más, de ahí la pérdida neta. No se ha medido un host con el conjunto de expertos residente; la expectativa declarada es una aceleración de 1,4 a 1,8 veces menos el coste de la pasada de borrador, marcada como esperada pero no verificada.

## Requisitos de hardware

- VRAM del drafter: 0,115 GB para el sidecar de llama.cpp y 0,889 GB para el drafter Strata; el coste dominante es el modelo objetivo.
- El objetivo Q6_K con expertos ternarios/PTQ1_0 no cabe completo en 2x 20 GB; la configuración documentada usa `-ncmoe 24` (24 capas de expertos en RAM) y `-msc 256` (expertos calientes por capa en VRAM).
- GPU recomendadas: no disponibles de forma explícita; el host de validación son 2x RX 7900 XT (20,5 GB cada una). Para residencia completa se sugiere 64 GB o más de VRAM/RAM combinada, o una cuantización menor del objetivo.
- Cabe en GPU de consumo solo con reparto de expertos en RAM y a costa de throughput; en ese régimen el drafter reduce el rendimiento (14,69 frente a 22,52 tok/s).
- Despliegue: llama-server del fork `scion-llama.cpp` (rama `scion-base`, commit `2089cd1d3`), con paquetes precompilados Linux ROCm/CPU en `scion-v1.0.0`; alternativamente el motor Strata con el drafter nativo.
- Ajustes relevantes: `-ngl 99`, `-ncmoe N`, `-msc N`, `-fa auto`, `-c 4096`, `-np 1`, `-t 8`; en multi-GPU, fijar el orden con `--device ROCm0,ROCm1` porque `-ts` sigue el vector interno de dispositivos.
- Latencia y throughput: 22,52 tok/s sin drafter y 14,69 tok/s con sidecar en el host de validación; no hay datos de hosts con expertos residentes.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scion-FlashNext-176B-A6B-mtp-drafter (sidecar) | Drafter especulativo fc-head para llama.cpp | 0,115 GB (3 cabezas fp16) | 4096 probado | Apache 2.0 | GGUF en HF |
| Scion-FlashNext-176B-A6B-mtp-drafter (Strata) | Bloque MTP nativo para Strata | 0,889 GB | 4096 probado | Apache 2.0 | GGUF en HF |
| Drafters EAGLE / Medusa genéricos | Cabezas especulativas entrenadas por modelo | no disponible | depende del objetivo | varía | ecosistema amplio |
| Decodificación sin drafter (objetivo solo) | Línea base | 176B totales / 6B activos | según objetivo | Apache 2.0 | GGUF Q6_K |

No se dispone de datos de benchmarks comparativos frente a drafters alternativos en la información proporcionada.

## Limitaciones y advertencias

- El drafter no es un modelo autónomo: requiere el GGUF del objetivo y un motor específico; los dos artefactos no son intercambiables entre llama.cpp y Strata.
- El sidecar exige un fork concreto de llama.cpp (`mtp-sidecar`, `--spec-type draft-mtp`); no funciona con builds estándar.
- Solo se ha validado con muestreo greedy; no hay mediciones con temperature > 0, top-p, top-k ni MIN_P.
- Contexto máximo probado de 4096 tokens; no se han validado contextos mayores.
- No se ha probado con más de un slot de servidor (`-np > 1`) ni con serving por lotes.
- No se ha probado con otras cuantizaciones del objetivo ni con objetivos distintos del qwen4exp.
- En el único host medido, el rendimiento neto empeora (14,69 frente a 22,52 tok/s) por falta de residencia del conjunto de expertos; la aceleración en hosts con expertos residentes está sin verificar.
- Solo soporta inglés, heredado del objetivo.
- Riesgo de alucinación y sesgos: no evaluados para el drafter; cualquier sesgo del texto generado proviene del objetivo, no del borrador, ya que la verificación preserva la salida.
- Licencia Apache 2.0 permite uso comercial, pero el fork de llama.cpp y el motor Strata deben revisarse por separado.
- El repositorio tiene 223 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B-mtp-drafter
- Modelo objetivo: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B
- Fork de llama.cpp: https://github.com/sky-is-green/scion-llama.cpp
- Release con binarios: https://github.com/sky-is-green/scion-llama.cpp/releases/tag/scion-v1.0.0
- Motor Strata: https://github.com/sky-is-green/strata
- Rama legacy de Prism: https://github.com/sky-is-green/prism-ml-llama.cpp/tree/engine/slotcache-sidecar
