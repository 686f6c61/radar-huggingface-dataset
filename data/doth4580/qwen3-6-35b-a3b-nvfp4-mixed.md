# doth4580/Qwen3.6-35B-A3B-NVFP4-MIXED

## Resumen

Qwen3.6-35B-A3B-NVFP4-MIXED es un paquete de pesos cuantizados del modelo Qwen3.6-35B-A3B, desarrollado originalmente por el equipo Qwen (Alibaba). El autor de este repositorio, doth4580, ha aplicado una receta de cuantizacion mixta orientada a la inferencia en hardware NVIDIA GB10 (DGX Spark), combinando GEMMs en NVFP4 con proyecciones Gated DeltaNet en FP8 y manteniendo el router en bf16. El resultado es un checkpoint de 21,4 GB que conserva tokenizer, plantilla de chat y configuracion del modelo original, con la unica adicion del bloque `quantization_config`.

El modelo base es un transformer de tipo MoE con 35.951.822.704 parametros totales (35B-A3B indica aproximadamente 3B activos por token). Incorpora componentes Gated DeltaNet, lo que sugiere una arquitectura hibrida entre atencion y mecanismos de estado lineal. Este paquete esta pensado principalmente para el motor de inferencia veloGB10 (`gb10_inference`), que permite desplegarlo en una, dos o cuatro maquinas GB10 con paralelismo tensorial (TP=1/2/4) y decodificacion especulativa mediante la cabeza MTP del propio pack o el drafter z-lab DFlash.

Su relevancia actual radica en que demuestra un flujo de cuantizacion NVFP4 funcional sobre un MoE de 35B con contexto declarado de 262.144 tokens en la configuracion de servido, lo que permite ejecutar un modelo de esta escala en hardware de escritorio de NVIDIA con velocidades de decodificacion cercanas a 73-88 tok/s en TP=1. El formato es `compressed-tensors`, por lo que otros frameworks compatibles con dicho formato tambien pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con componentes Gated DeltaNet (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | aproximadamente 3B (denominacion A3B) |
| Longitud de contexto | 262.144 tokens (segun `--max-seq-len 262144` en la configuracion de servido probada) |
| Tipos de cuantizacion | NVFP4 (GEMMs), FP8 (proyecciones Gated DeltaNet), bf16 (router); formato `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos (MoE) con aproximadamente 35,9B de parametros totales y unos 3B activos por token. La presencia de componentes Gated DeltaNet, evidenciada por la receta de cuantizacion (`gdn:fp8`), indica una arquitectura hibrida que combina atencion con capas de estado lineal del tipo Gated DeltaNet, orientadas a reducir el coste computacional y de memoria en contextos largos. El checkpoint cuantizado mantiene intactos tokenizer, plantilla de chat y configuracion, salvo el bloque de cuantizacion.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones de entrenamiento especificas. En el plano de inferencia, el pack incorpora una cabeza MTP (multi-token prediction) utilizable como fuente de decodificacion especulativa, con tasas de aceptacion del borrador medidas entre 56,6% y 65,9% segun topologia. La cuantizacion se realizo con el cuantizador offline de veloGB10 y la receta `all,gdn:fp8,-router`, que excluye el router de la cuantizacion para preservar la precision del enrutamiento de expertos.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la configuracion de servido probada activa el modo de razonamiento).
- Generacion de codigo, con rendimiento medido especificamente en turnos de codigo (88-114 tok/s de decodificacion segun topologia).
- Generacion creativa de texto narrativo (turnos de historia medidos a 58-80 tok/s).
- Procesamiento de contexto largo: ventana configurada de hasta 262.144 tokens con cache KV en bf16 y prefix caching.
- Decodificacion especulativa mediante cabeza MTP integrada o drafter externo z-lab DFlash.
- Servido mediante API compatible con OpenAI (`/v1`), lo que habilita integracion con clientes estandar.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en DGX Spark: desplegar el pack con `gb10_inference` en una unica maquina GB10 (TP=1) para servir un MoE de 35B con contexto de 262.144 tokens y decodificacion mediana de 73 tok/s, adecuado para prototipado y uso individual.
- Escalado horizontal en cluster pequeno: usar TP=2 o TP=4 sobre varias maquinas GB10 para aumentar el throughput agregado (142 tok/s con dos peticiones concurrentes en TP=2 y TP=4) en cargas de varios usuarios.
- Asistencia de codigo en produccion: integrar el endpoint OpenAI-compatible en un IDE o pipeline de CI/CD, aprovechando el rendimiento medido en turnos de codigo (hasta 114 tok/s en TP=4) y el prefix caching para prompts de repositorio repetidos.
- Procesamiento de documentos largos: analizar contratos, informes o bases de codigo de hasta 262.144 tokens en una sola pasada, gracias a la ventana de contexto configurada y a la arquitectura hibrida con Gated DeltaNet.
- Generacion de contenido narrativo o marketing: emplear los turnos de historia medidos (58-80 tok/s) para redaccion asistida con modo thinking activado, donde la calidad de razonamiento prima sobre la latencia minima.
- Despliegue multi-nodo con transferencia eficiente: en entornos con varias GB10 conectadas por RoCE, el head envia a cada nodo solo su fraccion de pesos y la cachea localmente, lo que simplifica el arranque de servicios distribuidos sin copiar el modelo completo en cada maquina.
- Experimentacion con decodificacion especulativa: comparar la cabeza MTP del pack con el drafter z-lab DFlash (`--spec-source dflash --df2-block 16`) para ajustar latencia y tasa de aceptacion segun la carga.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de inferencia (VeloBench) sobre GB10 con veloGB10 0.7.7, no benchmarks academicos de calidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de calidad en la informacion disponible.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de historia (tok/s) | Mediana todas las turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 88 | 59 | 73 | 1.605 | 108 | 65,0% |
| TP=2 | MTP del pack | 101 | 74 | 85 | 2.014 | 142 | 56,6% |
| TP=4 | MTP del pack | 114 | 73 | 86 | 1.738 | 142 | 65,9% |
| TP=1 | z-lab DFlash | 99 | 58 | 67 | 1.583 | 108 | 62,9% |
| TP=2 | z-lab DFlash | 99 | 80 | 88 | 1.987 | 141 | 63,1% |
| TP=4 | z-lab DFlash | 102 | 74 | 81 | 1.731 | 144 | 63,1% |

Las mediciones se realizaron el 2026-11-08 con builds de desarrollo de veloGB10 0.7.7, con muestreo de produccion (ajustes del sampler por defecto del pack, thinking activado) y una ejecucion por celda; la variacion entre ejecuciones muestreadas es de aproximadamente ±10%.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 21,4 GB, lo que da una idea del espacio necesario para los pesos cuantizados; la cache KV en bf16 para 262.144 tokens anade requisitos adicionales no cuantificados en la informacion disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas con TP=1, TP=2 o TP=4.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el pack esta probado exclusivamente en GB10.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), con servidor compatible con OpenAI en el puerto 9000. Al ser formato `compressed-tensors`, otros frameworks que lean dicho formato podrian cargarlo, aunque no se documenta ni prueba.
- Red multi-nodo: RoCE, con seleccion explicita de riel mediante `--rdma-dev` cuando hay dos pares de puertos activos.
- Throughput y latencia: decodificacion mediana de 73-88 tok/s segun topologia y fuente del borrador; prefill de 1.583-2.014 tok/s; agregado de 108-144 tok/s con dos peticiones concurrentes.
- Parametros de servido probados: `--max-batch 2`, `--max-tokens 65536`, `--kv-cache bf16`, `--fp8-prefill off`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NVFP4-MIXED (este pack) | 35,9B totales, ~3B activos | 262.144 tokens (config. de servido) | NVFP4 + FP8 + bf16 router | Apache 2.0 | Hugging Face, optimizado para veloGB10/GB10 |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,9B totales, ~3B activos | no disponible | bf16 (original) | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.6-35B-A3B-DFlash (drafter) | no disponible | no disponible | no disponible | no disponible | Hugging Face, usado como borrador especulativo |

No se dispone de datos de rendimiento de calidad comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Pack de cuantizacion: los pesos han sido modificados respecto al modelo original; puede haber degradacion de calidad frente al checkpoint en bf16, no cuantificada en la informacion disponible.
- Hardware objetivo restringido: probado unicamente en GB10 con veloGB10; el rendimiento en otras GPU o frameworks no esta documentado.
- Madurez del ecosistema: el motor veloGB10 se encuentra en builds de desarrollo (0.7.7) y las mediciones provienen de una sola ejecucion por celda con variacion de ±10%.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue ni cobertura de idiomas concretos.
- Sesgos y alucinaciones: no hay informacion especifica sobre sesgos conocidos ni tasas de alucinacion del modelo base en la documentacion proporcionada; aplican los riesgos habituales de los modelos generativos.
- Tool calling y capacidades de agente: no confirmados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor del pack no reclama propiedad intelectual sobre el modelo ni sus pesos; los derechos permanecen con los autores originales.
- Dependencia de funciones especificas del motor (MTP, DFlash, prefix cache, transferencia de pesos por red) que pueden no estar disponibles en otros runtimes.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Qwen3.6-35B-A3B-NVFP4-MIXED
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Drafter especulativo z-lab DFlash: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Qwen Chat: https://chat.qwen.ai
