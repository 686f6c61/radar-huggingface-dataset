# Belluxx/limite-1b-violetto-drafter

## Resumen

Limite 1B Violetto drafter es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa sobre el modelo objetivo `paradigma-inc/limite-1b-violetto`. Lo desarrolla el autor independiente Belluxx y esta pensado para funcionar junto al motor de inferencia `silicon-violetto`, un runtime escrito en Rust y optimizado para Apple Silicon (Metal). Su proposito no es generar texto de forma autonoma, sino proponer secuencias de tokens candidatas que el modelo objetivo verifica en un solo paso, acelerando la decodificacion sin alterar sustancialmente la salida.

El modelo es de tamano muy reducido: 60.987.904 parametros totales (unos 61 millones), lo que lo situa muy por debajo del modelo base de 1B al que asiste. No es un transformer independiente al uso, sino un modulo acoplado a las capas 35 y 47 del objetivo, con convoluciones, inyeccion de contexto, una ventana de atencion de 1024 tokens y una cabeza de 16.384 tokens. Se entrena mediante divergencia KL contra la distribucion del objetivo sobre trazas generadas por el propio modelo grande.

Su relevancia es practica: en un M4 Max con 40 nucleos GPU y pesos int8, el autor reporta aceleraciones de hasta 2,61x en decodificacion con contexto de 1k y un solo flujo, y de 1,30x en escenarios de 32 secuencias. Es, por tanto, una pieza de infraestructura orientada a reducir latencia en despliegues locales sobre Apple Silicon, no un modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model acoplado al objetivo: 2 capas sobre las capas 35 y 47 del target, con convoluciones, inyeccion de contexto, ventana de atencion de 1024 tokens y cabeza de 16.384 tokens |
| Parametros totales | 60.987.904 (aprox. 61 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de atencion de 1024 tokens; opera sobre contextos del objetivo de hasta 64k segun las pruebas del autor |
| Tipos de cuantizacion | int8 (pesos `drafter.vlt`, 69 MB) y fp32 (pesos safetensors, 244 MB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `drafter.vlt` (int8, formato propietario del motor silicon-violetto), `model.safetensors` y `config.json` (fp32) |

## Arquitectura y entrenamiento

El drafter no es un transformer autonomo: se inserta sobre dos capas concretas del modelo objetivo (capas 35 y 47), incorpora convoluciones e inyeccion de contexto, y utiliza una ventana de atencion de 1024 tokens junto con una cabeza de proyeccion de 16.384 tokens. Esta construccion permite que el borrador aproveche representaciones internas del objetivo en lugar de reconstruir el contexto desde cero, lo que explica su reducido numero de parametros frente al modelo asistido.

El entrenamiento se realizo mediante divergencia KL contra la distribucion del modelo objetivo, sobre trazas generadas por el propio target: 103 millones de posiciones y 400 millones de anclas. Las trazas se produjeron a partir de problemas de AIME 1983-2024, Omni-MATH y NuminaMath-1.5 en un Mac; posteriormente, en una A100 alquilada se reconstruyeron las caracteristicas del objetivo en las capas 35 y 47 (unos 500 GB de features) y el drafter se entreno sobre ellas. Los pesos finales en fp32 se exportaron al formato `drafter.vlt` (69 MB). En decodificacion, el motor verifica un arbol de borradores en un solo paso; la aceptacion reportada es de 1,78 tokens por paso con 1 borrador, 2,70 con 3, 2,96 con 4 y 3,30 con 7.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre `paradigma-inc/limite-1b-violetto`.
- Aceleracion de decodificacion verificada por arbol en un solo paso dentro del motor silicon-violetto.
- Aprovechamiento de representaciones internas del objetivo mediante inyeccion de contexto en las capas 35 y 47.
- Funcionamiento en regimen de contexto largo del objetivo (probado hasta 64k tokens de contexto) y en lotes de hasta 32 secuencias.
- Optimizado para Apple Silicon y el backend Metal.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento de forma autonoma: su unica funcion es asistir al modelo objetivo.
- Idiomas soportados: no disponible (heredados del objetivo, no documentados en la informacion disponible).

## Casos de uso

- Aceleracion de inferencia local en Mac: servir `limite-1b-violetto` con el motor silicon-violetto y cargar `drafter.vlt` para reducir la latencia de decodificacion hasta 2,61x en escenarios de un solo flujo y contexto de 1k.
- Servicio interactivo de baja latencia: en un M4 Max se pasa de 252 a 660 tok/s con 1 secuencia y 1k de contexto, lo que mejora la experiencia en aplicaciones de chat o autocompletado en local.
- Procesamiento por lotes en servidor Apple Silicon: con 32 secuencias de 8k de contexto el throughput sube de 1550 a 2017 tok/s (1,30x), adecuado para pipelines de generacion masiva en hardware de escritorio.
- Razonamiento matematico asistido: el drafter se entreno sobre trazas de AIME, Omni-MATH y NuminaMath-1.5, por lo que encaja en flujos de resolucion de problemas matematicos donde el objetivo genera cadenas largas de razonamiento.
- Contextos largos en local: con 1 secuencia y 64k de contexto la velocidad pasa de 182 a 417 tok/s (2,29x), util para analisis de documentos extensos en una sola maquina.
- Evaluacion e investigacion en decodificacion especulativa: sirve como referencia reproducible (con pasos documentados en el repositorio) para estudiar aceptacion de borradores, verificacion por arbol y su impacto en throughput.

## Benchmarks y rendimiento

Rendimiento de decodificacion reportado por el autor en un M4 Max (40 nucleos GPU), pesos int8 y temperatura 0,6:

| Secuencias x contexto | Sin drafter (tok/s) | Con drafter (tok/s) | Aceleracion |
|---|---:|---:|---:|
| 1 x 1k | 252 | 660 | 2,61x |
| 1 x 64k | 182 | 417 | 2,29x |
| 4 x 8k | 755 | 1224 | 1,62x |
| 16 x 32k | 777 | 1118 | 1,44x |
| 32 x 8k | 1550 | 2017 | 1,30x |

Aceptacion de borradores en trazas reservadas (tokens por paso):

| Borradores por paso | 1 | 3 | 4 | 7 |
|---|---:|---:|---:|---:|
| Tokens por paso | 1,78 | 2,70 | 2,96 | 3,30 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no se evalua como generador autonomo.

## Requisitos de hardware

- VRAM/memoria: los pesos del drafter ocupan 69 MB en int8 y 244 MB en fp32; el grueso del consumo lo determina el modelo objetivo de 1B.
- GPU recomendadas: Apple Silicon con Metal (las cifras publicadas corresponden a un M4 Max con 40 nucleos GPU). Para el entrenamiento o reconstruccion de caracteristicas se uso una A100 alquilada.
- Cabe en GPU de consumo: si, al ser un modulo de 61 M de parametros; el limite practico lo marca el objetivo de 1B.
- Opciones de despliegue: exclusivamente el motor `silicon-violetto` (`./target/release/violetto serve --weights models/limite-int8.vlt --drafter data/spec/drafter.vlt`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta 2017 tok/s con 32 secuencias de 8k y 660 tok/s en un solo flujo con 1k de contexto en M4 Max, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Limite 1B Violetto drafter | 61 M | ventana de 1024 tokens sobre contextos de hasta 64k | Borrador para decodificacion especulativa del objetivo | MIT | Hugging Face, formato `.vlt` y safetensors |
| EAGLE / EAGLE-2 (familia de drafters) | no disponible en la informacion proporcionada | no disponible | Borradores para decodificacion especulativa | no disponible | no disponible |
| Medusa (cabezas especulativas) | no disponible en la informacion proporcionada | no disponible | Decodificacion especulativa mediante cabezas adicionales | no disponible | no disponible |

No se dispone de datos comparativos verificados de parametros, contexto ni rendimiento de alternativas en la informacion proporcionada; la comparacion cuantitativa con EAGLE o Medusa no esta disponible.

## Limitaciones y advertencias

- Dependencia total del objetivo: solo funciona con `paradigma-inc/limite-1b-violetto` y con el motor `silicon-violetto`; no es reutilizable con otros modelos ni runtimes.
- Acoplamiento a capas concretas (35 y 47) del objetivo: cualquier cambio en el modelo base invalida el drafter.
- La salida puede diferir del decodificado plano cuando el redondeo altera empates cercanos, segun advierte el autor.
- Ventana de atencion limitada a 1024 tokens: el beneficio depende de la verificacion por arbol del motor, no de contexto propio extenso.
- Entrenado sobre trazas de problemas matematicos (AIME, Omni-MATH, NuminaMath-1.5): su aceptacion puede degradarse en dominios alejados de ese tipo de texto.
- Sin datos publicados sobre sesgos, alucinacion o cobertura idiomatica; al heredar el comportamiento del objetivo, los riesgos del objetivo se trasladan a la salida final.
- Licencia MIT: permite uso comercial, pero no se documentan garantias ni soporte.
- Sin descargas ni likes en el momento de la consulta y con pipeline no disponible: madurez y adopcion muy limitadas.
- El rendimiento reportado es del autor y en hardware concreto (M4 Max); no hay verificacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Belluxx/limite-1b-violetto-drafter
- Modelo base: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Repositorio del motor silicon-violetto: https://github.com/Belluxx/silicon-violetto
- Documentacion del drafter: https://github.com/Belluxx/silicon-violetto/blob/main/docs/drafter.md
- Metricas de rendimiento del motor: https://github.com/Belluxx/silicon-violetto/blob/main/docs/performance.md
