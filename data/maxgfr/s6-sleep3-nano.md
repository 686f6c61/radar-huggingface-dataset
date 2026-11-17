# maxgfr/s6-sleep3-nano

## Resumen
s6-sleep3-nano es un modelo de decisión ternario de 752 KB desarrollado por maxgfr dentro del proyecto skycmd, escrito íntegramente en Rust. No es un modelo de lenguaje generativo: es un clasificador de texto (pipeline `text-classification`) que implementa una arquitectura de decisión con memoria de pesos rápidos (fast-weight memory) y un mecanismo de "sueño" que consiste en reproducir los últimos 8 fotogramas N−1 veces adicionales sin que se solicite decisión. El modelo se publica explícitamente como resultado negativo de investigación, no para uso en producción: su puerta de pre-registro (`gate.json`, `"pass": false`) no se superó.

La relevancia del modelo es metodológica, no funcional. De sus cuatro hipótesis pre-registradas, H0 (la memoria se usa) se confirma con una diferencia de +0.2452 en precisión sobre el control sin memoria (0.4892 frente a 0.2440, intervalo del 95 % de +0.2370 a +0.2532), mientras que H1 (el sueño ayuda) y H2 (los juegos no pierden) no se demuestran. Además, el archivo exportado falla también la puerta del s6-nano en dos juegos (Flappy 2.10 frente a 200.00 de s3-pico; Dodge 6.90 frente a 9.47).

El modelo cuenta con 1.611.505 parámetros según la model card (el dato de safetensors del repo indica 609.153, discrepancia no explicada en la información disponible), vocabulario de 2.048 tokens, dimensión d=144, dos bloques de estado repetidos dos veces y salidas tras 1 a 4 pasadas de bloque. Los pesos son ternarios y el archivo GGUF ocupa 752 KB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo de decisión s6-nano (transformer de estado recurrente ligero): d=144, 2 bloques de estado en bucle x2, salidas tras 1-4 pasadas, vocabulario 2.048; una capa de memoria tras cada bloque de estado |
| Parámetros totales | 1.611.505 (model card); 609.153 (dato de safetensors del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa flujos de fotogramas; el "sueño" reproduce los últimos 8 fotogramas) |
| Tipos de cuantización | Pesos ternarios (entrenamiento y exportación en ternario) |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
La arquitectura es un grafo de decisión s6-nano con d=144, dos bloques de estado repetidos en bucle dos veces, salidas tras 1 a 4 pasadas de bloque y vocabulario de 2.048 tokens. Sobre esta base se añade una capa de memoria después de cada bloque de estado: cada capa mantiene una matriz pequeña por cabeza en la que cada fotograma de un flujo escribe una vez y de la que todos los fotogramas posteriores leen, de modo que un hecho visto en un fotograma puede alterar una respuesta muchos fotogramas después. Los pesos son ternarios.

El entrenamiento incorpora el mecanismo de "sueño" descrito en *Do Language Models Need Sleep?* (arXiv 2605.26099): se reproducen los últimos 8 fotogramas N−1 veces adicionales mientras no se solicita ninguna decisión. N=1 equivale a no dormir, y N=1 es lo que eligió la regla pre-registrada. No se dispone de información sobre el número de tokens de entrenamiento ni sobre composición del dataset, RLHF o DPO. La innovación destacable es la memoria de pesos rápidos con escritura única por fotograma y lectura posterior, junto con la verificación de paridad del motor `sky-infer` con el código de entrenamiento, tanto de forma nativa como en WebAssembly (ambas true).

## Capacidades
- Clasificación de texto y toma de decisiones tipadas (`typed_decisions_bench`), con precisión de 0.4897 frente a 0.4808 del control en la lectura pre-registrada.
- Memoria de flujo: retención de hechos entre fotogramas, con precisión en la sonda `recall` de 0.4892 frente a 0.2440 sin memoria; la precisión decae con el retardo (0.6147 a 1-4 fotogramas, 0.3302 a 17-32 fotogramas).
- Ejecución de episodios tipo juego en el navegador (Flappy, Dodge, Rescue, Doom) mediante WebAssembly.
- Soporte de los idiomas inglés y francés.
- No dispone de generación de texto libre, tool calling, function calling, razonamiento multi-paso general, visión, audio ni modo de pensamiento extendido.

## Casos de uso
- Verificación de resultados de investigación: el archivo se publica para que el resultado negativo pueda comprobarse y ejecutarse; un investigador puede reproducir la lectura de la puerta con `gate.json` y los episodios de test.
- Demostración didáctica de memoria de pesos rápidos: la página Memory del sitio del proyecto y el Space reproducen episodios `recall` en el navegador con la memoria activada o a cero, comparando 200 episodios con la lectura de test.
- Estudio de mecanismos de "sueño": permite medir el efecto de N=1, N=2 y N=4 pasadas de sueño sobre la precisión por retardo, con datos ya tabulados en el informe.
- Referencia de arquitectura ternaria de bajo coste: con 752 KB y pesos ternarios, sirve como caso base para estudiar despliegue de grafos de decisión en entornos con memoria mínima.
- Prueba de paridad de motores de inferencia: los golden sequences permiten validar implementaciones nativas y WebAssembly frente al código de entrenamiento.
- Evaluación de agentes en entornos tipo arcade: los juegos Flappy, Dodge, Rescue y Doom proporcionan una arena estandarizada (200 episodios por juego desde la semilla 5000) para comparar variantes.

## Benchmarks y rendimiento

| Condición | Medido | Umbral | Veredicto |
|---|---|---|---|
| H0: `recall` en N=1 menos control | +0.2452 [+0.2370, +0.2532] (0.4892 frente a 0.2440) | ≥ 0.10 | se cumple |
| H1: sueño, `recall` N=4 menos N=1 | +0.0030 [−0.0010, +0.0068] | cota inferior > 0 | no demostrado |
| H2: juegos en N=1 frente a control | Flappy 15.87 vs 71.05 (−77.7 %); Rescue 3.00 vs 3.00 (−0.1 %); Dodge 5.89 vs 7.94 (−25.8 %); Doom 3.37 vs 3.37 (+0.1 %) | ningún juego más de 2 % por debajo | no demostrado |
| H3: tareas de lenguaje | `typed_decisions_bench` 0.4897 vs 0.4808 | como máximo 0.01 por debajo | se cumple |
| Puerta s6-nano sobre este archivo | `typed_decisions_bench` 0.499, ECE 0.0578; Flappy 2.10 vs 200.00 de s3-pico; Dodge 6.90 vs 9.47; Rescue 3.00 y Doom 3.27 iguales | > 0.398, ECE ≤ 0.08, ningún juego más de 5 % por debajo de s3-pico | falla (Flappy, Dodge) |
| Paridad de `sky-infer` con el código de entrenamiento | nativa: true; WASM: true | ambas | se cumple |
| H1b (sonda secundaria `rule110`) | −0.0001 [−0.0007, +0.0005] | no decide nada | — |

Precisión de `recall` por retardo (tres semillas agrupadas):

| Lectura | 1-4 | 5-8 | 9-16 | 17-32 | Puerta de un color | Varios colores |
|---|---:|---:|---:|---:|---:|---:|
| Control sin memoria | 0.2420 | 0.2398 | 0.2518 | 0.2423 | 0.2433 | 0.2446 |
| N=1 | 0.6147 | 0.5590 | 0.4530 | 0.3302 | 0.4717 | 0.5052 |
| N=2 | 0.6213 | 0.5823 | 0.4693 | 0.3083 | 0.4657 | 0.5224 |
| N=4 | 0.6290 | 0.5910 | 0.4620 | 0.2867 | 0.4602 | 0.5214 |

Este archivo concreto (semilla 0) lee 0.4765 global en N=1 (0.591, 0.5375, 0.438, 0.3395 por retardo) y su control 0.245125.

## Requisitos de hardware
- VRAM estimada para inferencia: mínima; el archivo GGUF ocupa 752 KB, por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: innecesarias para el tamaño del modelo; cualquier GPU con unos pocos MB libres sirve, y la ejecución en CPU es viable.
- Cabe en consumer GPU: sí, en cualquier modelo (RTX 4090, RTX 3060, integradas).
- Opciones de despliegue: motor propio `sky-infer` (Rust, nativo y WebAssembly), ejecución en navegador mediante el Space y la página Memory; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s6-sleep3-nano | 1.611.505 (model card) | no disponible | `recall` 0.4892 en N=1; Flappy 15.87; Dodge 5.89; falla puerta s6-nano | Apache 2.0 | GGUF en HF |
| s6-nano (referencia de la puerta) | no disponible | no disponible | Flappy 2.10 frente a s3-pico 200.00; Dodge 6.90 frente a 9.47 | no disponible | no disponible |
| s3-pico (referencia de la arena) | no disponible | no disponible | Flappy 200.00; Dodge 9.47 | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores de decisión ternarios con memoria de pesos rápidos).

## Limitaciones y advertencias
- El modelo falló su puerta pre-registrada: `gate.json` indica `"pass": false`; se publica como resultado, no para uso.
- H1 (el sueño ayuda) no se demuestra: +0.0030 con intervalo que cruza cero (−0.0010 a +0.0068).
- H2 no se demuestra: caídas de −77.7 % en Flappy y −25.8 % en Dodge frente al control sin memoria.
- Falla la puerta s6-nano en Flappy (2.10 frente a 200.00 de s3-pico) y Dodge (6.90 frente a 9.47).
- La precisión de memoria decae con el retardo: de 0.6147 a 1-4 fotogramas a 0.3302 a 17-32 fotogramas.
- Discrepancia no explicada entre parámetros de la model card (1.611.505) y safetensors (609.153).
- Idiomas limitados a inglés y francés.
- No es un modelo generativo: no sirve para generación de texto, código, matemáticas ni conversación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que el modelo no es apto para uso.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-sleep3-nano
- Space de demostración: https://huggingface.co/spaces/maxgfr/s6-sleep3-nano
- Página Memory del proyecto: https://maxgfr.github.io/skycmd/memory/
- Página de resultados (fallos incluidos): https://maxgfr.github.io/skycmd/results/#s6-sleep3-nano-failed
- Código fuente (Rust): https://github.com/maxgfr/skycmd
- BENCH.md, sección s6-sleep3-nano: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-sleep3-nano-s6-sleep-v3-a-fast-weight-memory-pre-registered-gate-failed
- Informe de ejecución: https://github.com/maxgfr/skycmd/blob/main/runs/s6-sleep3/REPORT.md
- Pre-registro v3: https://github.com/maxgfr/skycmd/blob/main/docs/s6-sleep3-prereg.md
- Pre-registro v2: https://github.com/maxgfr/skycmd/blob/main/docs/s6-sleep2-prereg.md
- Pre-registro v1: https://github.com/maxgfr/skycmd/blob/main/docs/s6-sleep-prereg.md
- Paper citado: *Do Language Models Need Sleep?*, arXiv 2605.26099
