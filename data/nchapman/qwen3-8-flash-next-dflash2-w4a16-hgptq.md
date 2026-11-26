# nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ

## Resumen

Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo borrador (draft model) `incoai/Qwen3.8-Flash-Next-DFlash2`, un drafter ligero de difusion por bloques disenado para decodificacion especulativa sobre el modelo principal `Qwen/Qwen3.8-Flash-Next`, un MoE de 180B parametros. El modelo propone varios tokens futuros en paralelo para acelerar la fase de decodificacion del modelo grande, reduciendo el numero de pasos autorregresivos necesarios.

La cuantizacion la firma nchapman y emplea la libreria `compressed-tensors` con esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) y GPTQ con transformada de Hadamard. El resultado ocupa solo 0,52 GiB en VRAM frente a los 1,12 GiB en BF16 (2,17 veces menos), lo que lo convierte en un complemento practicamente sin coste de memoria junto al MoE de 180B.

Su relevancia radica en que preserva casi intacta la calidad del drafter original: mantiene el 99,7% de la longitud de aceptacion del modelo de 16 bits (2,752 frente a 2,760 tokens por paso) y el 99,9% de la recall top-16 de candidatos, mientras reduce el ancho de banda de memoria por paso de borrador un factor de 3,76. Esta pensado para usarse con el motor de inferencia `warp34` mediante el flag `--draft-model`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con difusion por bloques (block-diffusion), modelo borrador para decodificacion especulativa |
| Parametros totales | 603.065.600 (603M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con transformada de Hadamard |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors), custom_code |

## Arquitectura y entrenamiento

El modelo es un drafter de difusion por bloques: en lugar de generar tokens de uno en uno de forma autorregresiva, propone un bloque de tokens futuros en paralelo y el modelo principal los verifica. Esta tecnica de decodificacion especulativa permite aumentar el numero de tokens aceptados por paso, acelerando la generacion del MoE de 180B sin alterar su distribucion de salida. El modelo base `incoai/Qwen3.8-Flash-Next-DFlash2` es el que contiene el entrenamiento original; esta version es unicamente una cuantizacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovacion tecnica de esta version reside en la cuantizacion: GPTQ con transformada de Hadamard para W4A16, que reduce el ancho de banda de memoria por paso de borrador de 844 MiB a 224 MiB (3,76 veces menos) manteniendo la tasa de aceptacion. El modelo se distribuye con `custom_code`, por lo que requiere cargar codigo remoto para su ejecucion.

## Capacidades

- Generacion de tokens candidatos en paralelo (block-diffusion) para decodificacion especulativa.
- Propuesta de multiples tokens futuros por paso, verificados por el modelo principal `Qwen3.8-Flash-Next`.
- Alta recall de candidatos: conserva el 99,9% de la recall top-16 del drafter BF16.
- Longitud de aceptacion de 2,752 tokens por paso (frente a 2,760 del BF16).
- Integracion directa con el motor `warp34` mediante `--draft-model`.
- Compatible tanto con la variante W2.6 como W4 del modelo principal.
- No es un modelo de proposito general: no genera texto de forma autonoma ni soporta tool calling, agentes o vision por si mismo.

## Casos de uso

- Aceleracion de inferencia de Qwen3.8-Flash-Next en produccion: se carga junto al MoE de 180B como `--draft-model`, de modo que cada paso de decodificacion acepta de media 2,752 tokens, reduciendo la latencia percibida en servicios de generacion de texto.
- Despliegue en GPUs con memoria ajustada: al ocupar solo 0,52 GiB, el drafter deja practicamente intacto el presupuesto de VRAM para el modelo principal y el KV cache, permitiendo servir el MoE en configuraciones de tensor parallelism ajustadas (por ejemplo `--tp 2`).
- Servicio de chat interactivo de baja latencia: la decodificacion especulativa reduce el tiempo entre tokens en respuestas largas, escenario donde el coste del drafter es despreciable frente al del modelo grande.
- Generacion de codigo en pipelines de CI/CD: al acelerar la decodificacion del modelo principal, se pueden ejecutar tareas de completado y revision de codigo con menor tiempo de respuesta por peticion.
- Investigacion en decodificacion especulativa: sirve como referencia cuantizada para medir el impacto de W4A16 con Hadamard en la tasa de aceptacion frente al drafter BF16.
- Evaluacion comparativa de cuantizaciones: el par drafter W4A16 + modelo principal W2.6/W4 permite estudiar el equilibrio entre ahorro de memoria y calidad de aceptacion en pipelines de inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas internas de la cuantizacion frente al drafter BF16:

| Metrica | BF16 | W4A16-HGPTQ | Retencion |
|---|---|---|---|
| VRAM del drafter | 1,12 GiB | 0,52 GiB | 2,17x menor |
| Ancho de banda por paso de borrador | 844 MiB | 224 MiB | 3,76x menor |
| Longitud de aceptacion (tokens/paso) | 2,760 | 2,752 | 99,7% |
| Recall top-16 de candidatos | referencia | no disponible (valor absoluto) | 99,9% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo borrador en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,52 GiB en W4A16 (frente a 1,12 GiB en BF16).
- GPU recomendadas: el modelo se usa junto al MoE de 180B, por lo que se asume hardware de clase A100/H100 en configuracion multi-GPU con tensor parallelism (`--tp 2` en el ejemplo del autor).
- Cabe en GPU consumer: el drafter por si solo si (0,52 GiB), pero carece de utilidad sin el modelo principal.
- Opciones de despliegue: motor `warp34` (soporte nativo via `--draft-model`); formato compatible con `compressed-tensors`. No se documenta soporte en vLLM, llama.cpp o TGI.
- Latencia y throughput: no se publican valores absolutos; se conoce la reduccion de ancho de banda (3,76x) y la longitud de aceptacion (2,752 tokens/paso).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | VRAM | Longitud de aceptacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ (este) | 603M | W4A16 GPTQ + Hadamard | 0,52 GiB | 2,752 tokens/paso | apache-2.0 |
| incoai/Qwen3.8-Flash-Next-DFlash2 (BF16) | 603M | BF16 | 1,12 GiB | 2,760 tokens/paso | no disponible |

No se dispone de informacion sobre otros drafters comparables (EAGLE, Medusa, Lookahead) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: sin el modelo principal `Qwen3.8-Flash-Next` no genera texto util; su unica funcion es proponer tokens candidatos.
- Dependencia del motor `warp34`: el autor lo optimiza y documenta exclusivamente para ese runtime; no se garantiza funcionamiento en otros motores de inferencia.
- Requiere `custom_code`: la carga implica ejecutar codigo remoto, lo que anade superficie de riesgo en entornos de produccion.
- Idiomas soportados no documentados: al ser un drafter, su cobertura linguistica depende del modelo principal y no se especifica.
- Riesgo de alucinacion: las propuestas del drafter se verifican contra el modelo principal, pero una tasa de aceptacion imperfecta (99,7% de la longitud BF16) implica una ligera desviacion respecto al drafter original.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `incoai/Qwen3.8-Flash-Next-DFlash2`, cuya licencia no se detalla en la informacion disponible.
- Sin datos de sesgo ni evaluaciones de seguridad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ
- Modelo base (drafter original): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Modelo principal: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor warp34: https://github.com/nchapman/warp34
- Repositorio de cuantizacion warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Modelo principal cuantizado W2.6A16: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W2.6A16-HGPTQ-RCO
- Modelo principal cuantizado W4A16: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- Informe tecnico: TECHNICAL.md (referenciado en la model card del repositorio)
