# HuyEdits/DeepDolphin-DART

## Resumen

DeepDolphin-DART v1.0 (Diffusion-Assisted Reasoning Transformer) es un prototipo de investigación publicado por el autor independiente HuyEdits bajo licencia Apache 2.0. No es un modelo de lenguaje de propósito general, sino un artefacto experimental para estudiar el razonamiento asistido por difusión latente combinado con un modelo del mundo aprendido. Su alcance está deliberadamente acotado a una tarea sintética de aritmética encadenada sobre enteros de 0 a 999, donde cada paso de razonamiento equivale a un token y a una ranura de pensamiento ("thought slot"). El modelo está congelado en la versión v1.0.0 (28 de noviembre de 2026) y el autor advierte explícitamente que no debe desplegarse en producción.

La arquitectura divide el razonamiento en cuatro roles: un codificador transformer que lee el problema, un planificador de difusión latente que desruidifica un conjunto fijo de ranuras de pensamiento en el espacio compartido de embeddings de tokens, un simulador con modelo del mundo y juez que proyecta el estado del problema hacia delante y puntúa la concordancia plan-simulación mediante guiado por energía, y un decodificador que exige el plan (las operaciones del problema están redactadas) para emitir la respuesta. El modelo es muy pequeño, en torno a 12 millones de parámetros, y el repositorio ocupa 0,4 GB.

Su relevancia es metodológica, no de rendimiento: demuestra empíricamente que en esta tarea el razonador principal es el simulador del modelo del mundo (0,849 de exactitud en distribución) mientras que el decodificador solo y el planificador solo rondan el 0. El decodificador se comporta como un copiador fiel del plan (1.000 con plan oráculo), de modo que los errores se atribuyen al simulador y no a la lectura del plan. Es un caso de estudio útil para quienes investigan planificadores latentes, bucles simular-juzgar-iterar y decodificadores condicionados por plan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder + planificador de difusion latente + simulador/juez de modelo del mundo + decodificador condicionado por plan |
| Parametros totales | ~12 millones (segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tarea de cadenas de 2 a 14 pasos; 14 ranuras de pensamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea sintetica de aritmetica, sin lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (recomendado) y .pt (pickle de PyTorch, por compatibilidad) |

## Arquitectura y entrenamiento

DART separa el razonamiento en cuatro componentes entrenados de forma conjunta: un codificador transformer que procesa el enunciado, un planificador de difusion latente que desruidifica un conjunto fijo de ranuras de pensamiento (una por paso de razonamiento) en el espacio de embeddings de tokens compartido, un simulador con modelo del mundo junto a un juez que avanza el estado del problema y puntua la concordancia entre plan y simulacion con guiado por energia a lo largo de varias rondas de iteracion, y un decodificador que solo puede responder leyendo el plan, ya que las operaciones del problema aparecen redactadas.

El conjunto de checkpoints publicados incluye una base (`hybrid_long2`, 14 ranuras, longitudes 2-10), un decodificador de lectura de plan (`dec_long`), un simulador con juez y codificador coentrenado (`sim_long`), y tres artefactos heredados de la version de 10 ranuras y longitudes 2-6. El checkpoint del simulador contiene tres secciones (`sim`, `judge`, `encoder`) que en safetensors aparecen aplanadas con esos prefijos y deben reconstruirse con `load_sim_safetensors()` de `convert_safetensors.py`. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Generacion de respuestas a cadenas de aritmetica sintetica sobre enteros de 0 a 999, con pasos de 2 a 10 en distribucion y de 11 a 14 fuera de distribucion.
- Planificacion latente mediante difusion sobre ranuras de pensamiento, una por paso de razonamiento.
- Simulacion de estado con modelo del mundo y evaluacion de concordancia plan-simulacion mediante juez y guiado por energia.
- Iteracion del plan a lo largo de 6 rondas de guiado hasta converger en una respuesta.
- Decodificacion condicionada por plan: el decodificador copia fielmente planes oraculo, ruidosos, barajados o corruptos (seguimiento del plan de 0,965 a 1.000), lo que permite ablaciones controladas.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio, lenguaje natural ni razonamiento de dominio abierto. La propia model card lo declara fuera de alcance.

## Casos de uso

- Reproduccion de ablaciones controladas: el modelo permite aislar la contribucion de cada componente (decodificador solo, planificador solo, simulador solo, DART completo) gracias a los checkpoints separados y a `bench.py`, que escribe `bench_results.json` y `.md` con 5 semillas y n=256.
- Investigacion sobre planificadores de difusion latente: sirve como banco de pruebas minimalista para estudiar como se desruidifican ranuras de pensamiento en el espacio de embeddings de tokens sin la complejidad de un LLM grande.
- Estudio de modelos del mundo y guiado por energia: el bucle simular-juzgar-iterar con 6 rondas de guiado puede analizarse aisladamente, con metricas de calidad por token y por trayectoria (teacher-forced 0,981; rollout 0,914 en distribucion).
- Analisis de fidelidad de decodificadores condicionados por plan: las variantes de plan (oraculo, ruidoso correcto, barajado, corrupto, ceros) permiten medir hasta que punto un decodificador sigue instrucciones de plan frente a memorizar la respuesta.
- Docencia y divulgacion sobre razonamiento neurosimbolico: su tamano (~12M parametros, 0,33 GiB de VRAM en pico) y su latencia (p50 de 136 ms) permiten ejecutarlo en entornos modestos para demostraciones en clase o talleres.
- Pruebas de infraestructura de inferencia por lotes: con throughput de 7,2 cadenas/s a batch 1 y 850,7 cadenas/s a batch 128 en una MI300X, sirve para validar pipelines de batching y medicion de latencia en modelos limitados por el decodificador autoregresivo.

## Benchmarks y rendimiento

Ablacion con exact-match (5 semillas, n=256; ID = longitudes 2-10, OOD = 11-14):

| Banda | Decoder-only | Planner-only | Simulator-only | Full DART |
|---|---|---|---|---|
| ID 2-10 | 0.000 ± 0.000 | 0.003 ± 0.003 | 0.849 ± 0.024 | 0.801 ± 0.020 |
| OOD 11-14 | 0.000 ± 0.000 | 0.000 ± 0.000 | 0.019 ± 0.007 | 0.013 ± 0.004 |

Exact-match por longitud (full DART / simulator-only): longitud 2: 0.883 / 0.895; 3: 0.844 / 0.863; 4: 0.777 / 0.871; 5: 0.785 / 0.840; 6: 0.770 / 0.836; 7: 0.805 / 0.855; 8: 0.742 / 0.820; 9: 0.789 / 0.848; 10: 0.676 / 0.766; 11: 0.039 / 0.062; 12: 0.004 / 0.012; 13: 0.000 / 0.008; 14: 0.000 / 0.004.

Calidad de componentes: copia de plan oraculo por el decodificador 1.000 en ID y 0.168 en OOD; simulador por token teacher-forced / rollout 0.981 / 0.914 en ID y 0.773 / 0.667 en OOD; trayectoria exacta por muestra del simulador 0.886 en ID y 0.039 en OOD.

Variantes de plan en ID (exactitud de verdad / seguimiento del plan): oraculo 1.000 / 1.000; correcto con ruido 1.000 / 1.000; barajado 0.105 / 0.992; corrupto 0.000 / 0.965; ceros 0.000 / 0.000.

Benchmark de terminal sobre el artefacto congelado (40 cadenas aleatorias de 2-6 pasos, pipeline completo con 6 rondas de iteracion): carga del modelo 0,24 s; latencia p50 136,0 ms; p95 140,1 ms; exact-match 0,850. Las latencias son en estado estacionario; la primera llamada incluye calentamiento de CUDA.

Throughput en AMD Instinct MI300X: batch 1: 138,8 ms/cadena, 7,2 cadenas/s; batch 8: 19,0 ms, 52,6 cadenas/s; batch 32: 4,7 ms, 213,2 cadenas/s; batch 128: 1,2 ms, 850,7 cadenas/s. Desglose por etapa a batch 32: encode 1,1 ms, plan-sample 25,8 ms, sim-rollout 37,6 ms, guiado (6 rondas) 17,3 ms, decode 90,0 ms. VRAM pico 0,33 GiB.

## Requisitos de hardware

- VRAM estimada: 0,33 GiB en pico segun la model card, por lo que cabe sobradamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; las mediciones publicadas se realizaron en una AMD Instinct MI300X (192 GB), que queda practicamente inactiva por tratarse de un modelo limitado por latencia del decodificador.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares, asi como en CPU para pruebas puntuales.
- Opciones de despliegue: scripts de PyTorch propios (`bench.py`, `bench_terminal.py`, `bench_speed.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 136 ms y p95 de 140 ms por cadena en estado estacionario; 7,2 cadenas/s a batch 1 y 850,7 cadenas/s a batch 128 en MI300X. El batching amortiza los costes fijos unas 100 veces entre batch 1 y 128.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos, y por su naturaleza (prototipo de investigacion de ~12M parametros sobre una tarea sintetica de aritmetica encadenada) no existen alternativas publicas directamente equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no resuelve ARC-AGI, matematicas generales, codigo ni razonamiento de dominio abierto. La propia model card lo declara explicitamente.
- No debe desplegarse en produccion ni en usos criticos para la seguridad.
- Rendimiento fuera de distribucion muy bajo: 0,013 de exact-match en longitudes 11-14 para DART completo y 0,019 para simulador solo.
- El DART completo (0,801) queda ligeramente por debajo del simulador solo (0,849) en el modelo de 14 ranuras; los errores se atribuyen al simulador, no a la lectura del plan.
- El decodificador sigue planes corruptos o barajados con alta fidelidad (0,965-0,992), lo que implica que no verifica la coherencia del plan y puede producir respuestas erroneas si el plan es malo.
- No soporta lenguaje natural ni idiomas; la fila de idiomas figura como no disponible porque la tarea es puramente sintetica y numerica.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido habitual de lenguaje natural, pero el modelo puede generar respuestas incorrectas por fallo del simulador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja explicitamente el uso en produccion por tratarse de un prototipo de investigacion congelado.
- Artefacto congelado en v1.0.0 (28 de noviembre de 2026): no habra mas entrenamiento ni cambios de pesos; las sumas de verificacion estan en `FROZEN.md`.
- El checkpoint del simulador requiere reconstruccion de secciones (`sim`, `judge`, `encoder`) mediante `load_sim_safetensors()`; cargarlo de forma ingenua puede producir errores.
- Preferir safetensors sobre .pt para evitar riesgos de pickle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuyEdits/DeepDolphin-DART
- Repositorio DeepDolphin: https://github.com/huyedits/DeepDolphin
