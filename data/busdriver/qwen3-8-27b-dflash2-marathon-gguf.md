# Busdriver/Qwen3.8-27B-DFlash2-Marathon-GGUF

## Resumen

`Busdriver/Qwen3.8-27B-DFlash2-Marathon-GGUF` es un drafter especulativo en formato GGUF (Q4_K_M) derivado de `incoai/Qwen3.8-27B-DFlash2`, ajustado por el autor Busdriver para el proyecto Marathon. No es un modelo generativo autonomo: es un modelo borrador que se empareja con un modelo objetivo Qwen3.8 de 27B para acelerar la decodificacion especulativa en llama.cpp y runtimes compatibles con DFlash2. Su relevancia reside en la mejora medida de throughput en cargas de trabajo de agentes y tool-use, no en capacidad generativa propia.

El ajuste parte del drafter original y aplica LoRA de rango 32 sobre matrices de atencion, MLP y proyeccion de features, entrenado contra features capturadas del target `JonathanColetti/Qwen3.8-27B-Uncensored-GGUF` (variante IQ4_XS). El corpus de entrenamiento es exclusivamente sintetico: continuaciones de codigo, tool-call, tool-result y estado de agente. El export modifica 36 tensores adaptados y preserva byte a byte el resto de tensores, formas, tipos de cuantizacion y metadatos GGUF del drafter original.

El repositorio declara 1.924.404.480 parametros en safetensors, aunque el artefacto GGUF Q4_K_M ocupa 1.143.006.752 bytes (2,3 GB de repo). La discrepancia entre parametros declarados y tamano del artefacto no esta explicada en la model card y debe tratarse con cautela. La licencia declarada es Apache-2.0, heredada del drafter y del target upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezal de propuestas especulativas DFlash2 (drafter); arquitectura base no detallada en la informacion disponible |
| Parametros totales | 1.924.404.480 (dato de safetensors); artefacto GGUF Q4_K_M de 1.143.006.752 bytes |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico artefacto publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-DFlash2-Marathon-R32-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa DFlash2, pensado para proponer bloques de tokens que el modelo objetivo verifica y acepta. El ajuste utiliza LoRA de rango 32 con alpha 64 sobre matrices de atencion, MLP y proyeccion de features, durante 480 pasos con learning rate `7e-5` y objetivo D-PACE ponderado por prefijo (prefix-weighted). El target permanecio congelado durante todo el entrenamiento. El framework de entrenamiento fue SpecForge en la revision `3d64e7a61f5fcc7f7d78ba6164c881f831943947`.

Los datos de entrenamiento son exclusivamente sinteticos: continuaciones de codigo, tool-call, tool-result y estado de agente. La model card afirma explicitamente que no se utilizo texto de conversaciones privadas de Marathon. Las features de entrenamiento se capturaron del target `JonathanColetti/Qwen3.8-27B-Uncensored-IQ4_XS.gguf`, lo que implica que el drafter esta especializado para ese target concreto y su distribucion de prompts.

## Capacidades

- Generacion de propuestas especulativas para decodificacion DFlash2 junto a un target Qwen3.8 27B compatible.
- Especializacion en continuaciones de codigo estructurado, tool-call, tool-result y estado de agente.
- Aceleracion de decodificacion en cargas de agente y tool-use (mejora concentrada en continuaciones estructuradas).
- No responde peticiones por si mismo: la model card lo declara explicitamente como no apto para atender requests de forma autonoma.
- No se documentan capacidades multilingues, vision, audio, thinking mode ni tool calling nativo propio; su rol es auxiliar del target.

## Casos de uso

- Aceleracion de pipelines de agentes con tool calling: el drafter propone bloques que el target verifica, reduciendo el tiempo de decodificacion en continuaciones de tool-call y tool-result, donde la mejora medida es mayor.
- Servidores de codigo asistido en produccion: emparejado con el target IQ4_XS, mejora el throughput de decodificacion en un 27,15% en la configuracion medida, adecuado para reducir latencia en autocompletado y generacion de parches.
- Extraccion estructurada y SQL generado por agentes: las continuaciones de tool-result y estado de agente son el dominio de entrenamiento, por lo que el drafter encaja en flujos de extraccion y consultas SQL multi-paso.
- Debugging automatizado en CI/CD: integrado en runtimes llama.cpp compatibles con DFlash2, puede acelerar la generacion de diagnosticos y parches en pipelines que ya usan Qwen3.8 27B como target.
- Despliegue local con llama.cpp: el artefacto Q4_K_M de ~1,1 GB es ligero frente al target, permitiendo incorporar el drafter en estaciones de trabajo con GPU consumer que ya ejecutan el target cuantizado.
- Evaluacion de decodificacion especulativa: util como referencia reproducible para medir tasas de aceptacion y throughput en configuraciones DFlash2 con seis propuestas especulativas.

## Benchmarks y rendimiento

| Medicion | Stock Q4_K_M | Marathon R32 Q4_K_M | Cambio |
|---|---:|---:|---:|
| Throughput de decodificacion | 101,01 tok/s | 128,43 tok/s | +27,15% |
| Tiempo total por request | 142,14 s | 135,77 s | -4,48% |
| Aceptacion de draft | 61,77% | 84,01% | +22,24 puntos porcentuales |
| Longitud media de bloque aceptado (6 propuestas) | 4,8463 | 6,1074 | +26,02% |

Mediciones adicionales reportadas en la model card: en 40 requests emparejados por variante con la configuracion de runtime de Marathon, 19 de 20 casos produjeron bytes de salida identicos entre stock y tuned; el caso restante difirio en dos tokens generados. En sondas genericas de codigo de 512 tokens con recuentos de salida identicos, el throughput de decodificacion mejoro un 0,99% y el tiempo total bajo un 0,95%, lo que indica que la ganancia se concentra en continuaciones estructuradas de agente y tool-use. Ambas variantes superaron las 10 comprobaciones de calidad de codigo, debugging, extraccion, SQL y tool-use con respuestas finales identicas. No se publican resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: el artefacto Q4_K_M ocupa 1.143.006.752 bytes (~1,1 GB); a ello se suma la KV cache del draft (Q4 draft KV en la configuracion probada) y el modelo target completo.
- El requisito dominante es el target Qwen3.8 27B: en IQ4_XS debe caber en GPU consumer de 24 GB (RTX 4090) con margen limitado; en precisiones mayores requiere A100/H100 o multiples GPU.
- GPU recomendadas: RTX 4090 para target IQ4_XS + drafter Q4_K_M; A100 40/80 GB y H100 para configuraciones de mayor precision o contexto largo.
- Opciones de despliegue: llama.cpp y runtimes compatibles con la opcion de draft especulativo DFlash2; Marathon descarga el artefacto en una revision exacta del Hub y verifica tamano y SHA-256 antes de seleccionar el perfil de runtime ajustado.
- Latencia y throughput: 128,43 tok/s de decodificacion y 135,77 s por request total en la configuracion medida (40 requests emparejados), frente a 101,01 tok/s y 142,14 s con el drafter stock.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Busdriver/Qwen3.8-27B-DFlash2-Marathon-GGUF | Drafter especulativo Q4_K_M | 1.924.404.480 declarados | no disponible | 128,43 tok/s; aceptacion 84,01% | Apache-2.0 | Hugging Face (21 descargas) |
| incoai/Qwen3.8-27B-DFlash2 | Drafter especulativo base | no disponible | no disponible | 101,01 tok/s; aceptacion 61,77% (stock Q4_K_M) | Apache-2.0 (declarada) | Hugging Face |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | Target Qwen3.8 27B (IQ4_XS) | no disponible | no disponible | Target de referencia del ajuste; sin metricas propias en la informacion disponible | Apache-2.0 (declarada) | Hugging Face |

No se dispone de otros drafters especulativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo debe usarse como draft especulativo junto a un target Qwen3.8 27B compatible; usarlo para responder requests directamente no es su proposito declarado.
- Especializacion estrecha: la ganancia se concentra en continuaciones estructuradas de agente y tool-use; en sondas genericas de codigo la mejora es inferior al 1%.
- Dependencia del target: las features de entrenamiento provienen de `JonathanColetti/Qwen3.8-27B-Uncensored-IQ4_XS.gguf`; otro target, cuantizacion, distribucion de prompts, sampler o ventana especulativa puede alterar rendimiento y comportamiento de salida.
- Evaluacion limitada: la model card advierte que la evaluacion pequena (40 requests, 10 comprobaciones) no establece precision invariante para todos los targets y configuraciones.
- Discrepancia de parametros: 1.924.404.480 parametros declarados frente a un artefacto Q4_K_M de ~1,14 GB; no hay explicacion en la informacion disponible, conviene verificar el artefacto antes de produccion.
- Sin datos de sesgos, alucinacion o cobertura idiomatica: no disponibles en la informacion proporcionada; al heredar del target, los sesgos del target se propagan.
- Licencia Apache-2.0 declarada por el autor y por los repos upstream; verificar las condiciones exactas de cada repositorio antes de uso comercial.
- Verificacion de integridad recomendada: Marathon comprueba tamano y SHA-256 (`e096aa09c26d5096b63b1a4d0400258819980b16250ef5c5d08fcf830e6bb6a6`) antes de usar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Busdriver/Qwen3.8-27B-DFlash2-Marathon-GGUF
- Modelo base (drafter): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Target usado para captura de features: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Proyecto Marathon: https://github.com/thebusdriver37/Marathon
- Framework de entrenamiento SpecForge (revision `3d64e7a61f5fcc7f7d78ba6164c881f831943947`): no disponible como enlace directo en la informacion proporcionada
- Paper o blog de DFlash2: no disponible en la informacion proporcionada
