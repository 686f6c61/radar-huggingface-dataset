# jcbtc/Ling-3.0-Flash-CIRU-IU4

## Resumen

Ling-3.0-Flash-CIRU-IU4 es un checkpoint INT4 recalibrado y un build de servido especifico para AMD Strix Halo del modelo Ling 3.0 Flash de InclusionAI, el laboratorio de Ant Group. El modelo base es un MoE hibrido de 124.000 millones de parametros con solo 5.100 millones activos por token, disenado para inferencia agente a escala de produccion con eficiencia de tokens. CIRU, la empresa que firma este release para Kairic.ai, ha recalibrado las 61.440 proyecciones de expertos enrutados de las capas 2 a 41 con un objetivo de importancia de activaciones, logrando una reduccion del 13,07 % en la divergencia KL media frente al checkpoint INT4 oficial.

La relevancia de este modelo radica en que combina tres mejoras complementarias: pesos INT4 recalibrados con mejor fidelidad, prefill nativo S4 × S4 en la unidad IU4 de AMD (gfx1151) y decode W4 de produccion con decodificacion especulativa MTP K1. El resultado es un unico perfil de produccion que selecciona automaticamente la ruta optima segun la fase de generacion, sin necesidad de seleccion manual de modo. El checkpoint mantiene el formato compressed-tensors del modelo oficial, por lo que es compatible con instalaciones vLLM estandar mediante la ruta W4A16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3ForCausalLM, MoE hibrido KDA-MLA |
| Parametros totales | 124.000 millones (127.486.405.600 en safetensors) |
| Parametros activos | 5.100 millones |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | INT4 simetrico con signo, grupo 32, escalas BF16; compatible W4A16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, compressed-tensors pack-quantized |

## Arquitectura y entrenamiento

El modelo base Ling 3.0 Flash emplea una arquitectura BailingMoeV3ForCausalLM, un MoE hibrido que combina atencion KDA (Key-Value Decomposed Attention) con MLA (Multi-head Latent Attention). Cuenta con 512 expertos enrutados con seleccion top-8, lo que activa aproximadamente 5.100 millones de parametros por token de un total de 124.000 millones. El contexto nativo es de 262.144 tokens.

El checkpoint CIRU IU4 no modifica la arquitectura ni el esquema de tensores del modelo original. La recalibracion se aplico exclusivamente a las proyecciones de los expertos enrutados en las capas 2 a 41, utilizando un corpus de referencia bloqueado de 92 secuencias de 4.096 tokens en precision BF16. La capa final de prediccion del siguiente token permanece identica byte a byte al checkpoint oficial. El modelo incorpora decodificacion especulativa MTP (Multi-Token Prediction) con un token especulativo (K1), que alcanza una tasa de aceptacion del 98,32 % en cargas de seis peticiones simultaneas de 4K tokens.

## Capacidades

- Generacion de texto conversacional con razonamiento nativo y modo de pensamiento activable mediante `enable_thinking`.
- Razonamiento multi-paso y comportamiento de agente con soporte de tool calling preservado del modelo base.
- Generacion de codigo: 96,95 % pass@1 en HumanEval y 95,12 % en HumanEval+ con la configuracion de muestreo recomendada por InclusionAI (temperature 0,6, top_p 0,95, top_k 20).
- Decodificacion especulativa MTP K1 integrada, con tasa de aceptacion superior al 91 % en cargas de trabajo reales.
- Contexto largo de 262.144 tokens, adecuado para analisis de documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo en produccion: el modelo alcanza 96,95 % en HumanEval y mantiene soporte de tool calling, lo que permite integrarlo en pipelines de desarrollo asistido por IA, generacion de parches y revision de codigo automatizada.
- Servicio local de chat compatible con OpenAI: el checkpoint se sirve mediante vLLM con API compatible con OpenAI, lo que permite sustituir servicios en la nube por inferencia local en sistemas Strix Halo.
- Analisis de documentos de contexto largo: con 262.144 tokens de ventana nativa, puede procesar manuales tecnicos, codigo fuente extenso o expedientes completos en una sola pasada.
- Automatizacion de atencion al cliente: el modo conversacional multi-turno con contexto largo y la capacidad de tool calling permiten construir asistentes que consultan bases de conocimiento y ejecutan acciones.
- Razonamiento agente multi-paso: el modo de pensamiento activable y la decodificacion especulativa MTP reducen la latencia en cadenas de razonamiento largas, adecuado para tareas de planificacion y analisis.
- Inferencia por lotes en hardware AMD: el prefill nativo IU4 ofrece un incremento del 27,74 % en rendimiento agregado frente al checkpoint oficial, lo que reduce el coste por token en cargas de trabajo por lotes.
- Despliegue en equipos de escritorio de alta memoria: el modelo cabe en sistemas con 128 GB de memoria unificada, como el Ryzen AI MAX+ 395, sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

Los datos de rendimiento se obtuvieron en un sistema Ryzen AI MAX+ 395 / Radeon 8060S Strix Halo con 128 GB de memoria unificada, ROCm/HIP 7.15, Python 3.12, Torch 2.13 ROCm, Triton 3.8 y el runtime vLLM nativo gfx1151 de CIRU.

| Evaluacion | Resultado |
|---|---|
| HumanEval pass@1 | 96,95 % (159/164) |
| HumanEval+ pass@1 | 95,12 % (156/164) |
| Rendimiento agregado de generacion | 64,01 tok/s |
| Tokens de completado | 200.550 |
| Tiempo de generacion | 3.133,06 s |
| Aceptacion MTP | 91,88 % |
| Fallos / desalojos | 0 / 0 |

Rendimiento con seis peticiones simultaneas de 4K tokens (256 tokens de salida forzados, MTP K1, presupuesto de scheduler de 16K, prefijo compartido desactivado):

| Metrica | W4 oficial | CIRU IU4 | Cambio |
|---|---|---|---|
| Prefill agregado | 504,89 tok/s | 644,94 tok/s | +27,74 % |
| Decode agregado | 70,92 tok/s | 81,90 tok/s | +15,48 % |
| Decode mediano por peticion | 11,92 tok/s | 14,51 tok/s | +21,73 % |
| TTFT mediano | 48,67 s | 38,10 s | -21,72 % |
| Tiempo de lote | 70,25 s | 55,71 s | -20,69 % |
| Aceptacion MTP | 98,19 % | 98,32 % | +0,13 pp |

Fidelidad de pesos frente al checkpoint INT4 oficial (corpus de referencia de 92 secuencias de 4.096 tokens en BF16):

| Checkpoint | KL media | Acuerdo top-token |
|---|---|---|
| Ling INT4 oficial | 0,040795 | 95,7063 % |
| CIRU IU4 | 0,035464 | 95,8784 % |
| Mejora | -13,07 % | +0,172 puntos |

## Requisitos de hardware

- El rendimiento IU4 nativo requiere un APU AMD Strix Halo con GPU integrada gfx1151 (Ryzen AI MAX+ 395 / Radeon 8060S) y 128 GB de memoria unificada.
- Software necesario: ROCm/HIP 7.15, Python 3.12, Torch 2.13 ROCm, Triton 3.8 y el runtime vLLM nativo gfx1151 de CIRU.
- Sin el runtime nativo de CIRU, el checkpoint funciona por la ruta W4A16 compatible, pero no reproduce las ganancias de prefill IU4.
- Linux nativo validado; en Windows se requiere WSL2 o ROCDXG, no es compatible vLLM nativo de Windows.
- Despliegue con vLLM: `--attention-backend TRITON_MLA`, `--moe-backend triton`, `--enable-chunked-prefill`, `--enable-prefix-caching`, `--max-model-len 262144`, `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- El tamano del repositorio es de 77 GB, por lo que se recomienda almacenamiento NVMe para reducir los tiempos de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | HumanEval |
|---|---|---|---|---|---|
| Ling 3.0 Flash CIRU IU4 | 124B | 5,1B | 262.144 | MIT | 96,95 % |
| Ling 3.0 Flash INT4 oficial | 124B | 5,1B | 262.144 | MIT | no disponible |
| Ling 3.0 Flash (precision completa) | 124B | 5,1B | 262.144 | MIT | no disponible |

La comparativa directa con el checkpoint INT4 oficial muestra una mejora del 13,07 % en divergencia KL y del 27,74 % en prefill agregado en hardware Strix Halo. No se dispone de datos de benchmarks publicos del modelo base Ling 3.0 Flash en la informacion proporcionada.

## Limitaciones y advertencias

- Las ganancias de rendimiento IU4 solo se reproducen en hardware AMD Strix Halo con el runtime nativo gfx1151 de CIRU; en otras plataformas el modelo funciona por la ruta W4A16 sin las mejoras de prefill.
- Los resultados de HumanEval estan limitados a un techo de 4.096 tokens por tarea; siete tareas alcanzaron ese limite, por lo que las puntuaciones son valores medidos con tope, no extrapolados.
- El modelo requiere confiar en codigo remoto (`--trust-remote-code`) para cargar la arquitectura BailingMoeV3ForCausalLM, lo que implica un riesgo de seguridad en entornos de produccion.
- No se dispone de informacion sobre los idiomas soportados ni sobre posibles sesgos del modelo base.
- La licencia MIT permite uso comercial, pero el rendimiento optimo depende de hardware AMD especifico, lo que limita la portabilidad.
- En Windows, el despliegue requiere WSL2 o ROCDXG; no hay soporte nativo de vLLM en Windows.
- El modelo base Ling 3.0 Flash es reciente (julio de 2026) y las afirmaciones de rendimiento del fabricante no cuentan con tablas de benchmarks publicas independientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jcbtc/Ling-3.0-Flash-CIRU-IU4
- Checkpoint base oficial: https://huggingface.co/inclusionAI/Ling-3.0-flash-int4
- Variante CIRU int4 Strix native: https
