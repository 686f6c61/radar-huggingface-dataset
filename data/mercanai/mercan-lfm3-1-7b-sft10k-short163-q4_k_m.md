# MercanAI/Mercan-LFM3-1.7B-SFT10K-Short163-Q4_K_M

## Resumen

Mercan-LFM3-1.7B-SFT10K-Short163-Q4_K_M es un ajuste fino experimental de LiquidAI/LFM3-1.7B-Base, publicado por MercanAI para probar su runtime propio (MercanRuntime) en iOS. El modelo parte de una etapa de continued pre-training (CPT) de 10.000 millones de tokens en turco, seguida de un SFT principal corregido hasta el paso 10.000 y una segunda fase corta de 163 pasos de SFT de razonamiento breve sobre 145.176 ejemplos derivados de explicaciones de respuesta corta del MMLU turco. El resultado se distribuye cuantizado en Q4_K_M (4 bits mixto) dentro de un contenedor físico GGUF v3, reempaquetado en un único fichero `.mercan` de 1.247.083.520 bytes con tokenizer embebido.

El modelo es relevante como artefacto de investigación para quienes trabajan en inferencia on-device en entornos Apple: no es un checkpoint estándar de Transformers y solo carga en builds del runtime de MercanAI que soporten LFM3 y Q4_K_M. Su etiqueta de idiomas es `tr, en`, con el turco como foco principal del ajuste. La ficha del autor lo marca explícitamente como experimental y advierte de que la verificación en iPhone físico aún no se ha realizado (solo pasa el smoke test de carga, tokenización y decodificación en CPU).

La licencia es la LFM Open License v1.0 del modelo base, pero el autor añade una advertencia relevante: el dataset de razonamiento breve usado en la segunda fase llevaba la etiqueta `CC-BY-NC-ND-4.0_private_noncommercial_only` y contiene explicaciones generadas por modelo sin verificación factual independiente. La relación entre esas restricciones y la redistribución del modelo derivado no está aclarada legalmente, por lo que el uso comercial requiere revisión previa de derechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI LFM3 1.7B; detalles de atención no disponibles) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (cuantizacion mixta de pesos a 4 bits) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | LFM Open License v1.0 (etiqueta `other`); advertencias adicionales del autor sobre dataset CC-BY-NC-ND-4.0 |
| Formato de pesos | Contenedor fisico GGUF v3 reempaquetado como fichero unico `.mercan` (Mercan v1) con tokenizer embebido |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-1.7B-Base, un transformer de 1.700 millones de parametros. El pipeline descrito por el autor es: una etapa de CPT de 10.000 millones de tokens en turco sobre el modelo base, un SFT principal "corregido" entrenado hasta el paso 10.000, y una segunda fase de 163 pasos de SFT de razonamiento breve con 145.176 ejemplos de entrenamiento (convertidos a partir de 148.165 explicaciones de respuesta corta del MMLU turco). Esta segunda fase supervisa 11.477.213 tokens.

El formato de datos de la fase de razonamiento usa la plantilla ` thinkingreasoning</think>final answer` para el modo de razonamiento activado: se enmascaran el prefijo ` thinking` del asistente y el prompt del usuario, y se supervisan el cuerpo del razonamiento, el cierre `</think>` y la respuesta final. No se aplico DPO en esta segunda fase. La innovacion tecnica destacable no esta en la arquitectura sino en el empaquetado: conversion HF a GGUF v3 mediante llama.cpp, posterior conversion con `gguf_to_mercan.py` y cuantizacion con `llama-quantize` a Q4_K_M, resultando en un unico fichero `.mercan` con tokenizer completo embebido, pensado para carga y decodificacion en CPU en el runtime de MercanAI (rama `ios-lfm`).

## Capacidades

- Generacion de texto en turco e ingles, con foco declarado en turco por el CPT y el SFT.
- Razonamiento breve (short-reasoning) mediante modo explícito: genera un bloque ` thinking...</think>` antes de la respuesta final cuando el modo razonamiento está activo.
- Respuesta a preguntas de estilo MMLU con explicacion corta, derivada del dataset de entrenamiento de la segunda fase.
- Inferencia on-device en CPU en el ecosistema iOS mediante MercanRuntime (sujeta a build compatible con LFM3 y Q4_K_M).
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (solo razonamiento breve de un turno segun el formato descrito).
- Capacidades multilingues: limitadas a turco e ingles segun la etiqueta de idiomas.
- Vision y audio: no disponibles.

## Casos de uso

- Pruebas de integracion del runtime on-device en iOS: el modelo es un artefacto de validacion para MercanRuntime; se usaria para comprobar carga, tokenizacion y decodificacion en la rama `ios-lfm` antes de portar modelos mayores.
- Investigacion sobre razonamiento breve en modelos pequenos: util para estudiar el efecto de 163 pasos de SFT con plantilla ` thinking...</think>` sobre un modelo de 1.7B ya ajustado en turco.
- Evaluacion de cuantizacion Q4_K_M en turco: permite medir la degradacion de calidad respecto al modelo sin cuantizar en tareas de respuesta corta, con un fichero de 1,2 GB manejable en entornos con poca memoria.
- Prototipado de asistentes de preguntas y respuestas en turco: el SFT sobre explicaciones de MMLU turco lo hace adecuado para demos de QA educativo de respuesta breve, no para produccion sin evaluacion adicional.
- Reproduccion de pipelines de conversion HF → GGUF → `.mercan`: sirve como referencia practica para quienes necesiten empaquetar modelos con tokenizer embebido para runtimes moviles propietarios.
- Experimentos academicos sobre provenance y licencias de datos: el caso documenta explicitamente la tension entre datos con restriccion CC-BY-NC-ND y la redistribucion de pesos derivados, util como estudio de caso en gobernanza de datos.

## Benchmarks y rendimiento

El autor reporta una unica prueba interna, no un benchmark estandar: un test rapido de razonamiento en CPU con 8 preguntas retenidas, en modo razonamiento activo, con resultado de 6/8 estrictamente correctas y 8/8 con `think` cercano. El propio autor advierte que no debe generalizarse a una evaluacion completa.

| Evaluacion | Resultado | Nota |
|---|---|---|
| Test rapido retenido, 8 preguntas, CPU, razonamiento ON | 6/8 estrictas; 8/8 cierre `think` | Prueba interna del autor; no generalizable |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | No se han publicado resultados de benchmarks en la informacion disponible. | - |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero pesa 1.247.083.520 bytes (aproximadamente 1,16 GiB); el runtime descrito es de CPU, por lo que el requisito principal es memoria del sistema suficiente para el modelo y el estado de decodificacion (no se publica cifra exacta de RAM pico).
- GPU recomendadas: no disponible; el autor solo documenta ejecucion en CPU (MercanRuntime, smoke test superado).
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte CUDA, ROCm ni Metal.
- Opciones de despliegue: exclusivamente MercanRuntime (rama `ios-lfm` de https://github.com/Ahmet2001/MercanRuntime) con soporte de LFM3 y Q4_K_M. No es un checkpoint de Transformers y no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI para el fichero `.mercan` (llama.cpp se uso solo en la conversion y cuantizacion).
- Verificacion en hardware: carga, tokenizacion y decodificacion en CPU del proyecto con resultado PASS; verificacion en iPhone fisico NO realizada aun.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mercan-LFM3-1.7B-SFT10K-Short163-Q4_K_M | 1.7B | no disponible | `.mercan` (GGUF v3 Q4_K_M) | LFM Open License v1.0 + advertencias de dataset | Solo MercanRuntime; sin verificacion en dispositivo |
| LiquidAI/LFM3-1.7B-Base | 1.7B | no disponible | safetensors (Transformers) | LFM Open License v1.0 | Modelo base upstream; sin ajuste en turco ni razonamiento breve |
| Modelos de ~1-2B cuantizados en GGUF para llama.cpp | 1-2B | variable | GGUF | variable | No disponible comparacion concreta en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta como `research-only` y `noncommercial-caution`; no esta pensado para produccion.
- Licencia y derechos de datos: el dataset de la fase de razonamiento llevaba `CC-BY-NC-ND-4.0_private_noncommercial_only`; la relacion con la redistribucion de pesos derivados no esta aclarada legalmente. El uso comercial o la redistribucion requieren revision y permisos previos.
- Calidad de datos: las explicaciones del dataset fueron generadas por modelo y no han sido verificadas factualmente de forma independiente, lo que aumenta el riesgo de alucinacion y de propagar errores en las respuestas.
- Verificacion incompleta: la prueba en iPhone fisico no se ha realizado; solo hay smoke test en CPU del proyecto.
- Portabilidad nula: no es un checkpoint de Transformers; requiere un build especifico de MercanRuntime y no carga en herramientas estandar.
- Cobertura limitada de idiomas: solo turco e ingles; el rendimiento en otros idiomas no esta documentado.
- Evaluacion insuficiente: el unico resultado publicado es un test de 8 preguntas, no generalizable; no hay MMLU, HumanEval, GSM8K ni evaluaciones de sesgo.
- Longitud de contexto: no documentada, lo que impide planificar cargas con prompts largos.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-SFT10K-Short163-Q4_K_M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio del runtime: https://github.com/Ahmet2001/MercanRuntime (rama `ios-lfm`)
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio del modelo
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
