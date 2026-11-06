# Onol/corp-langfree-libero28

## Resumen

Onol/corp-langfree-libero28 es un conjunto de checkpoints de investigación para robótica de manipulación, no un modelo de lenguaje. Se trata de una política visuomotora compacta basada en CoRP (arXiv 2610.08183), una arquitectura de flow matching con un transformer de difusión (DiT) y un resampler FiLM, que en esta variante ha sido despojada de todo componente lingüístico: no hay codificador T5 ni tokens de instrucción, y tanto el FiLM del resampler como el adaLN del DiT reciben un vector constante aprendido en lugar del embedding de la instrucción agrupada.

El repositorio documenta un experimento controlado sobre el benchmark LIBERO con tres brazos que solo difieren en el tratamiento del codificador visual DINOv2 ViT-S/14 (22,1 M de parámetros): fine-tuning completo (`ft`, 37,1 M entrenables), congelación total (`frozen`, 15,1 M) y congelación más un adaptador de 12 bloques ViT-S entrenables (`adapter`, 36,4 M). El objetivo es aislar si la ganancia del fine-tuning proviene de la adaptación de las representaciones visuales o simplemente de la mayor capacidad del modelo.

Es relevante porque cuantifica con rigor el coste de prescindir del lenguaje en políticas robóticas: el checkpoint `ft` alcanza un 93,1 % de éxito en 28 tareas de LIBERO con escenas iniciales únicas, frente al 96,2 % del CoRP original con lenguaje, mientras que los brazos con encoder congelado se estancan en el 64-72 %. El repositorio ocupa 27,2 GB e incluye pesos, logs y evaluaciones en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CoRP sin lenguaje: resampler FiLM + DiT con adaLN, flow matching, encoder visual DINOv2 ViT-S/14 |
| Parametros totales | 37,1 M entrenables (`ft`); 15,1 M (`frozen`); 36,4 M (`adapter`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de horizonte fijo con chunks de 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoints en fp32) |
| Idiomas soportados | no aplica (modelo sin lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state_dicts de PyTorch: `model_raw`, `model_ema` en fp32) |

## Arquitectura y entrenamiento

La política sigue la arquitectura CoRP: un encoder visual DINOv2 ViT-S/14 procesa la observación (render de 256 px rotado 180°), un resampler con modulación FiLM comprime las features visuales y un transformer de difusión (DiT) con adaptive LayerNorm predice acciones mediante flow matching. En esta variante "language-free" se elimina el codificador T5 y todos los tokens de instrucción; el vector que condiciona FiLM y adaLN es una constante aprendida. Los tres brazos comparten semilla, inicialización de módulos comunes, orden del sampler y el ruido de flow matching y τ por muestra (indexados por paso y slot del batch global).

El entrenamiento usa el dataset HuggingFaceVLA/libero, restringido a las 28 tareas Joint40 con escena inicial única: todo LIBERO-Spatial, todo LIBERO-Object y LIBERO-10 sin las dos tareas de LIVING_ROOM_SCENE2; LIBERO-Goal queda excluido porque sus 10 tareas comparten escena. Se reservan las 2 últimas demostraciones por tarea (56 episodios) y se entrenan 1127 episodios (189.416 frames). Receta: AdamW con lr 5e-5, batch global 392, 80k pasos (~166 épocas), grad clip 1.0, EMA 0.999, autocast bf16 sobre pesos maestros fp32, weight decay 0.01, warmup de 500 pasos y sin aumentación de datos. El brazo `adapter` añade 12 bloques ViT-S entrenables tras el encoder con LayerScale inicializado a 1e-5.

## Capacidades

- Generación de acciones de manipulación robótica de 7 grados de libertad a partir de observaciones visuales, en chunks de 12 pasos.
- Ejecución de tareas sin instrucción lingüística: la política infiere el objetivo de la escena, válido solo para entornos con configuración inicial distinguible.
- Aprendizaje por imitación con flow matching sobre demostraciones humanas.
- Evaluación en bucle cerrado sobre el simulador MuJoCo con el protocolo de CoRP (10 pasos de asentamiento, semilla 7).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, visión general, audio ni modo thinking.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Investigación sobre representaciones visuales en robótica: comparar `ft`, `frozen` y `adapter` permite aislar si la ganancia de rendimiento proviene del fine-tuning del encoder o de la capacidad adicional, con logs de deriva de pesos y normas de gradiente por bloque.
- Replicación de experimentos de políticas de imitación: los checkpoints en los pasos 0, 1k, 2k, 5k, 10k, 20k, 30k, 40k, 58k y 80k, junto con `latest.pt` y `log.jsonl`, permiten reproducir curvas de aprendizaje y de pérdida de flow matching en datos reservados.
- Benchmarking de políticas libres de lenguaje: sirve como línea base cuantificada (93,1 % en 28 tareas) para medir el coste de eliminar la instrucción en tareas de manipulación con escenas únicas.
- Estudio de eficiencia de adaptadores: el brazo `adapter` iguala el número de parámetros entrenables de `ft` manteniendo el encoder congelado, útil para evaluar alternativas de bajo coste en despliegues con cómputo limitado.
- Prototipado en simulación: integración en pipelines de evaluación LIBERO con MuJoCo para validar políticas antes de transferir a un robot real.
- Análisis de degradación por suite: los resultados por suite (Spatial 86,4 / Object 99,6 / LIBERO-10 93,2 para `ft`) permiten estudiar qué tipo de variación espacial o de objeto es más sensible a la ausencia de lenguaje.

## Benchmarks y rendimiento

Tasa de éxito en bucle cerrado (%) sobre 28 tareas, 50 inicializaciones por tarea (1400 episodios), pesos EMA, protocolo de CoRP:

| Paso | ft | frozen | adapter |
|---|---|---|---|
| 2k | 49,4 | 0,4 | 0,6 |
| 5k | 85,6 | 37,1 | 39,6 |
| 10k | 91,2 | 55,9 | 58,8 |
| 20k | 92,8 | 62,4 | 66,2 |
| 30k | 94,1 | 63,9 | 68,6 |
| 40k | 93,6 | 64,9 | 70,1 |
| 58k | 93,9 | 63,5 | 70,9 |
| 80k | 93,1 | 64,3 | 71,6 |

Desglose por suite a 80k (Spatial / Object / LIBERO-10 subset):

| Brazo | Spatial | Object | LIBERO-10 |
|---|---|---|---|
| ft | 86,4 | 99,6 | 93,2 |
| frozen | 65,2 | 90,6 | 30,2 |
| adapter | 75,0 | 94,6 | 38,8 |

Referencia: el checkpoint oficial de CoRP (con lenguaje, entrenado en las 40 tareas) obtiene 96,2 en estas 28 tareas y 96,3 en las 40 (97,0 en el paper). El error estándar de una tasa de éxito con 1400 episodios es de aproximadamente ±1,2 puntos; cada brazo se entrenó con una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 37,1 M de parámetros en fp32 el peso de la política es de aproximadamente 150 MB, pero el coste dominante es el renderizado y la simulación MuJoCo.
- GPU recomendadas: no especificadas por el autor; el script de evaluación acepta `--gpus 0 --workers 8`, lo que sugiere una GPU por proceso de evaluación.
- Encaje en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no hay confirmación del autor.
- Opciones de despliegue: carga mediante `torch.load` y la clase `LangFreeCoRP` de `code/corp_lf`, que requiere el repositorio de CoRP en `third_party/CoRP`; evaluación con `python -m corp_lf.evaluate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Éxito en 28 tareas LIBERO | Lenguaje | Licencia |
|---|---|---|---|---|---|
| corp-langfree-libero28 (`ft`) | 37,1 M entrenables | chunks de 12 pasos | 93,1 % | No | Apache-2.0 |
| CoRP original (checkpoint liberado) | no disponible | chunks de 12 pasos | 96,2 % | Sí (T5) | Apache-2.0 |
| corp-langfree-libero28 (`frozen`) | 15,1 M entrenables | chunks de 12 pasos | 64,3 % | No | Apache-2.0 |
| corp-langfree-libero28 (`adapter`) | 36,4 M entrenables | chunks de 12 pasos | 71,6 % | No | Apache-2.0 |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con una sola semilla por brazo y error estándar de ±1,2 puntos: las diferencias inferiores a ese margen no son concluyentes.
- Solo cubre 28 de las 40 tareas de LIBERO; excluye LIBERO-Goal y dos tareas de LIVING_ROOM_SCENE2, por lo que no es directamente comparable con resultados sobre el conjunto completo.
- Requiere escenas iniciales únicas y distinguibles: sin lenguaje, no puede desambiguar tareas que comparten configuración inicial.
- Rendimiento muy inferior al CoRP con lenguaje (93,1 % frente a 96,2 %), con caída especialmente acusada en LIBERO-10 (93,2 frente a resultados del modelo con instrucción) y en Spatial (86,4 %).
- Los brazos con encoder congelado muestran un techo claro (64-72 %), lo que limita su uso en producción.
- Riesgo de sobreajuste al simulador: entrenado y evaluado en MuJoCo con el protocolo de CoRP; no hay validación en robot real.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de las suites evaluadas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo depende de CoRP y DINOv2 (ambos Apache-2.0) y de LIBERO para reproducir la evaluación; conviene verificar las condiciones de cada componente por separado.
- Los checkpoints se distribuyen como state_dicts de PyTorch (`weights_only=False` en la carga), lo que exige confianza en el origen del archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Onol/corp-langfree-libero28
- Paper de CoRP: https://arxiv.org/abs/2610.08183
- Página del proyecto CoRP: https://corp-policy.github.io/
- Repositorio CoRP: https://github.com/corp-policy/CoRP
- Dataset LIBERO en Hugging Face: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
