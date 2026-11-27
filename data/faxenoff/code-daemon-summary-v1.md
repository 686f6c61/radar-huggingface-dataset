# faxenoff/code-daemon-summary-v1

## Resumen

code-daemon-summary-v1 es un modelo compacto y bilingue (ingles y ruso) especializado en la generacion de documentacion de codigo. Se trata de un destilado del modelo base Qwen/Qwen3.5-4B, distribuido en formato GGUF, desarrollado por el autor faxenoff como componente del daemon Code-Daemon. No es un asistente generalista: su proposito es escribir descripciones de una sola frase para entidades de codigo (funciones, clases, campos), resumenes de modulo con diagramas ASCII de arquitectura y flujo, y resumenes jerarquicos de subsistemas y proyectos completos.

El modelo parte de una arquitectura hibrida de 32 bloques, de los cuales 24 son gated DeltaNet y el resto atencion completa, con un total de 4.205.751.296 parametros. Su valor diferencial es haber destilado el estilo de documentacion de un profesor de 27B (Qwen3.8-27B) en un modelo de 4B que se ejecuta en una GPU de portatil de 6-8 GB a la misma velocidad que el base original. La cuantizacion Q3_K_M, apoyada en una matriz de importancia de dominio, conserva practicamente toda la ganancia de calidad.

Es relevante ahora porque demuestra que la destilacion de tareas especificas permite obtener mejoras medibles de calidad (+0.084 ROUGE-L sobre su propio base) sin sacrificar velocidad ni requisitos de hardware, y porque los pesos cambiaron el 2026-09-16, por lo que las cifras anteriores a esa fecha no son comparables con las actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 32 bloques, 24 gated DeltaNet y 8 de atencion completa (cada cuarto bloque), ChatML |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M y Q3_K_M (esta ultima con matriz de importancia de dominio) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (requiere llama.cpp con arquitectura `qwen35`, b10809 / v0.4.0 o superior) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura hibrida del base Qwen3.5-4B: 32 bloques en los que uno de cada cuatro utiliza atencion completa y el resto gated DeltaNet, un mecanismo de estado recurrente. Esta eleccion tiene una consecuencia practica importante para el despliegue: cada secuencia paralela mantiene un estado recurrente de 50 MiB independientemente de la longitud de contexto, por lo que para ajustar el consumo de VRAM conviene reducir el numero de secuencias (`n_ctx`) en lugar de recortar el contexto. El vocabulario es de aproximadamente 248k tokens.

El entrenamiento consistio en destilacion de conocimiento a nivel de secuencia sobre tareas bilingues de documentacion, usando Qwen3.8-27B como profesor. Los pesos destilados se fusionaron en el base a precision completa y se convirtieron a GGUF eliminando el bloque de prediccion multi-token del base, de modo que el modelo no incorpora cabeza de decodificacion especulativa. La variante Q3_K_M se cuantizo con una matriz de importancia especifica del dominio, lo que explica que conserve la calidad del Q4.

## Capacidades

- Generacion de descripciones de una sola frase para entidades de codigo (funciones, clases, campos) en formato de lista markdown con viñetas.
- Redaccion de resumenes de modulo: prosa breve mas diagramas ASCII de arquitectura y de flujo de datos.
- Resumenes jerarquicos: digests de subsistemas, productos y proyectos completos construidos a partir de resumenes menores.
- Bilinguismo de primera clase: el idioma de salida sigue al de la peticion (ingles o ruso).
- Modo no-thinking: la plantilla de chat incluida ejecuta el modelo en modo no-thinking; para prompts en crudo debe terminarse con la etiqueta de asistente y un bloque de pensamiento vacio.
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de agentes, vision ni audio.
- Decodificacion recomendada: greedy (`--temp 0`), parada en `<|im_end|>`.

## Casos de uso

- Documentacion automatica de repositorios: integrado en un pipeline de CI/CD, el modelo recorre los ficheros y genera una lista de viñetas con una descripcion por entidad, manteniendo el estilo uniforme en todo el proyecto gracias a la destilacion del profesor de 27B.
- Generacion de resumenes de modulo para wikis internas: a partir del codigo de un modulo produce una seccion `## Overview` con prosa y diagramas ASCII de arquitectura y flujo, utiles para incorporaciones de nuevos desarrolladores.
- Resumenes jerarquicos de proyectos: combinando los resumenes de modulo en digests de subsistema y de producto, el modelo permite mantener actualizada la documentacion de alto nivel sin intervencion manual.
- Entornos con GPU de portatil: con 2.58 GB en Q4_K_M y 88.6 tok/s en una RTX 5060 de 8 GB, es viable ejecutar la documentacion en local durante el desarrollo sin depender de servicios en la nube.
- Tarjetas graficas de 6 GB: la variante Q3_K_M (2.16 GB, 77.0 tok/s) permite desplegar el modelo en hardware modesto con una perdida de calidad no medible frente al Q4.
- Servicio multiusuario de documentacion: con 28 secuencias paralelas en 4.710 MiB (Q4) o 12 secuencias en 3.408 MiB (Q3), puede atender varias peticiones concurrentes en una sola GPU, compartiendo recursos con otros workers del daemon.
- Documentacion bilingue de bases de codigo: equipos con documentacion en ingles y ruso pueden usar el mismo modelo para ambas salidas sin cambiar de herramienta.

## Benchmarks y rendimiento

Evaluacion sobre 200 prompts de documentacion reservados, comparados contra la respuesta del profesor, decodificacion greedy y cada modelo ejecutado como fichero GGUF mediante llama.cpp:

| Modelo (GGUF) | Tamano | ROUGE-L | Token F1 |
|---|---:|---:|---:|
| code-daemon-summary-v1, Q4_K_M | 2.58 GB | 0.548 | 0.628 |
| code-daemon-summary-v1, Q3_K_M + imatrix | 2.16 GB | 0.543 | 0.623 |
| Qwen3.5-4B stock, Q4_K_M | 2.58 GB | 0.464 | 0.555 |
| Qwen3-4B servido antes bajo este id | 2.38 GB | 0.414 | 0.479 |

- Mejora de +0.084 ROUGE-L sobre su propio base (IC 95 % +0.066 a +0.101; 156 victorias y 42 derrotas).
- La Q3 no presenta perdida medible frente a la Q4 (-0.004, el intervalo de confianza cruza cero) y ahorra 0.4 GB.
- La ganancia disminuye con la longitud del prompt pero se mantiene positiva: +0.12 por debajo de 512 tokens de prompt y +0.04 por encima de 2.048.
- En una pasada real de documentacion sobre un repositorio Go, genero lineas de diagrama repetidas en el 26 % de los casos frente al 42 % del base, y viñetas que solo repetian el nombre en el 1.7 % frente al 2.3 %, pero omitio 2 secciones que el base conservo. Se trata de un unico repositorio, por lo que es una indicacion y no un veredicto.

Rendimiento medido en una RTX 5060 de portatil con 8 GB y llama.cpp CUDA:

| Metrica | Q4_K_M | Q3_K_M |
|---|---:|---:|
| Decodificacion, una ranura | 88.6 tok/s | 77.0 tok/s |
| VRAM, 28 secuencias paralelas | 4.710 MiB | 4.284 MiB |
| VRAM, 12 secuencias paralelas | no disponible | 3.408 MiB |

Dentro del daemon, compartiendo GPU con otros workers, la Q4 alcanza 86 tok/s en una ranura y 154 tok/s en cuatro, la misma velocidad que el base original.

## Requisitos de hardware

- VRAM estimada: 4.710 MiB en Q4_K_M con 28 secuencias paralelas; 3.408 MiB en Q3_K_M con 12 secuencias; 4.284 MiB en Q3_K_M con 28 secuencias.
- Estado recurrente: 50 MiB por secuencia paralela en los 24 bloques gated DeltaNet, independiente de la longitud de contexto.
- GPU recomendadas: RTX 5060 de 8 GB (medida de referencia); tarjetas de 6 GB con la variante Q3_K_M. No se dispone de datos para A100 o H100.
- Cabe en GPU consumer: si, en tarjetas de 6-8 GB de VRAM.
- Despliegue: llama.cpp (requiere arquitectura `qwen35`, b10809 / v0.4.0 o superior); `llama-cli` y `llama-server` documentados. No se mencionan vLLM, TGI ni Ollama.
- Ajuste de memoria: reducir el numero de secuencias en lugar de `n_ctx`; al embeber llama.cpp como libreria, fijar `n_outputs_max` al numero de secuencias para evitar reservar logits para un lote completo sobre el vocabulario de 248k (~1.9 GB nunca usados).
- Latencia y throughput: 88.6 tok/s (Q4) y 77.0 tok/s (Q3) en una ranura; 154 tok/s en cuatro ranuras compartiendo GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-L (doc.) | Licencia | Formato |
|---|---:|---|---:|---|---|
| code-daemon-summary-v1 Q4_K_M | 4.2B | no disponible | 0.548 | Apache-2.0 | GGUF |
| Qwen3.5-4B stock Q4_K_M | 4.2B | no disponible | 0.464 | Apache-2.0 | GGUF |
| Qwen3-4B (version anterior de este id) | ~4B | no disponible | 0.414 | no disponible | GGUF |

La comparativa se limita al base y a la version anterior del mismo identificador, ya que no se proporcionan datos de otros modelos comparables de la misma categoria. La diferencia clave frente al base es la especializacion en documentacion bilingue de codigo, con una mejora de +0.084 ROUGE-L y el mismo rendimiento en tok/s.

## Limitaciones y advertencias

- Modelo de proposito especifico: no es un asistente general; fuera de las tareas de documentacion de codigo su comportamiento no esta caracterizado.
- Solo soporta ingles y ruso; el castellano no esta entre los idiomas destilados.
- La ganancia de calidad se reduce con prompts largos (+0.04 por encima de 2.048 tokens) aunque se mantiene positiva.
- Riesgo de omision: en la prueba real sobre un repositorio Go perdio 2 secciones que el base conservo; conviene revisar la salida en produccion.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Los pesos cambiaron el 2026-09-16; no deben mezclarse metricas de versiones anteriores con las actuales.
- Requiere llama.cpp con soporte de la arquitectura `qwen35` (b10809 / v0.4.0 o superior); versiones anteriores no cargaran el modelo.
- Licencia Apache-2.0, pero se recomienda revisar las model cards del base y del profesor antes de redistribuir; el autor no ofrece asesoramiento legal.
- El bloque de prediccion multi-token del base fue eliminado, por lo que no hay cabeza de decodificacion especulativa integrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faxenoff/code-daemon-summary-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto Code-Daemon: https://code-daemon.dev
