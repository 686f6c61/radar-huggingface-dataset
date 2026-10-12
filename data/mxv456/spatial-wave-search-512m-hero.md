# mxv456/spatial-wave-search-512m-hero

## Resumen

spatial-wave-search-512m-hero es una red neuronal de visión de 8,86 millones de parámetros entrenada desde cero para resolver búsqueda de rutas sobre capas de mapas urbanos. No es un modelo de lenguaje ni un modelo visión-lenguaje: su entrada y su salida son rasters. Recibe una ventana de 512 m × 512 m de Ámsterdam dibujada como 17 planos alineados a 1 m por píxel (edificios, clases de superficie, ruido de carretera, lugares, insolación, entre otros), dos marcadores (inicio y meta) y un plano de scratchpad con su propia salida anterior; devuelve el siguiente scratchpad completo en una rejilla de 256 × 256 celdas de 2 m más un token de estado.

El interés técnico del modelo está en que no ejecuta un algoritmo de búsqueda codificado, sino que aprendió uno: propaga un frente de onda 40 m en cada pasada hasta alcanzar la meta, retrocede frente a frente y finalmente dibuja el camino. La secuencia de estados que emite (SEARCH → BACK → DRAW → DONE) decide por sí sola la siguiente pasada, sin ningún componente externo que arbitre entre iteraciones. Es, por tanto, un caso de estudio de computación iterativa aprendida y razonamiento espacial en un transformer pequeño entrenado con supervisión exacta.

Lo desarrolla Marvin Uhlmann (usuario mxv456) como parte del proyecto spatial-reasoning-from-scratch, publicado en 2026. En ejecución libre resuelve el 32 % de 500 rutas de validación de 512 m retenidas y el 40 % de 500 rutas de un laberinto doméstico sintético que nunca vio durante el entrenamiento. Una pasada tarda 2,4 ms en una RTX 3060 y una ruta completa alrededor de 60 ms. Su relevancia actual es como referencia abierta (MIT) de razonamiento espacial iterativo a escala reducida, junto a un baseline visión-lenguaje sobre las mismas rutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (clase `LocalGridViT`): 4 bloques, anchura 384, 6 cabezas, parches de 16 px (1.024 tokens a 512 m), sesgo de posición relativa aprendido, dos tokens de condicionamiento (estado y tarea), cabeza por celda de 2 clases y cabeza de token de 41 clases |
| Parametros totales | 8,86 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens de parche para una ventana de 512 m; no aplica contexto de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; entrada y salida son rasters) |
| Licencia | MIT (código y pesos); las capas de Ámsterdam conservan sus licencias propias |
| Formato de pesos | `state_dict` plano de PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión compacto: 4 bloques con anchura 384 y 6 cabezas de atención, parcheado de 16 px que produce 1.024 tokens para una ventana de 512 m, y sesgo de posición relativa aprendido. Además de los tokens de imagen, el modelo recibe dos tokens de condicionamiento (estado y tarea) y emite dos cabezas: una cabeza por celda de 2 clases sobre la rejilla de 256 × 256 celdas de 2 m y una cabeza de 41 clases que produce el token de estado. El estado emitido (SEARCH, BACK, DRAW, DONE) determina la siguiente pasada, de modo que el modelo funciona en bucle cerrado sobre su propio scratchpad: cada salida se realimenta literalmente como entrada de la siguiente iteración.

El entrenamiento se hizo desde cero, sin pesos preentrenados, con supervisión exacta derivada de un profesor: una onda con precio de holgura (clearance-priced) por ruta. El proceso fue de 48.000 pasos a 256 m, seguido de una ronda de entrenamiento sobre sus propios dibujos ("natural noise") y una continuación de 16.000 pasos a 512 m, con batch 64 y learning rate 1e-4. El identificador de ejecución es `c5_r5_wave_nat3_tok01_from_ownp50_L4_16k_g256_b64_zc512`. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por preferencias, lo cual es coherente con que no sea un modelo generativo de lenguaje.

## Capacidades

- Búsqueda de rutas sobre mapas urbanos: propaga un frente de onda por pasadas sucesivas, retrocede desde la meta y dibuja el camino sobre la rejilla de celdas.
- Computación iterativa en bucle cerrado: realimenta su propia salida como entrada y decide la siguiente acción mediante el token de estado, sin control externo entre pasadas.
- Segmentación por celdas: la cabeza por celda clasifica cada una de las 256 × 256 celdas de 2 m de la ventana.
- Generalización cero disparo a geometrías no vistas: resuelve el 40 % de rutas en un laberinto doméstico sintético sobre el que no se entrenó.
- Entrada multimodal a nivel de raster: consume 17 planos alineados más un plano de marcadores y un plano de scratchpad.
- No soporta tool calling, function calling, agentes basados en texto ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de audio ni de generación de texto.

## Casos de uso

- Estudio de computación iterativa aprendida: permite reproducir con un único checkpoint cómo un transformer pequeño aprende un algoritmo de onda y lo ejecuta en bucle sobre su propio scratchpad, usando el bundle de evaluación y el script `wave_rollout_eval.py`.
- Enrutado peatonal a escala de barrio: con ventanas de 512 m y celdas de 2 m, el modelo traza caminos peatonales que respetan edificios y holgura, adecuado para ventanas pequeñas donde la latencia importa (unos 60 ms por ruta).
- Investigación en razonamiento espacial con supervisión exacta: sirve como línea base cuantificable frente a baselines visión-lenguaje, dado que las mismas 500 rutas se evaluaron con el LoRA de Qwen3-VL-2B.
- Preprocesado de rutas para pipelines de mapas: puede integrarse como etapa de generación de caminos candidatos sobre capas alineadas antes de un validador geométrico posterior.
- Docencia y divulgación de arquitecturas de visión: con 8,86 M de parámetros y 4 bloques, es un caso didáctico reproducible para explicar atención, parcheado y decodificación iterativa.
- Evaluación de generalización fuera de distribución: el conjunto de laberintos domésticos sintéticos permite medir transferencia geométrica de un modelo entrenado solo con mapas de Ámsterdam.
- Pruebas de despliegue en hardware modesto: al ocupar decenas de megabytes en coma flotante, permite experimentar con inferencia en GPU de gama de entrada o en CPU.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card; ninguno está verificado de forma independiente (`verified: false`).

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Búsqueda de rutas sobre capas de mapa, ejecución libre sobre su propio scratchpad | Zuid + Centrum (Ámsterdam), 512 m, 500 rutas de validación, 40-500 m en línea recta, hasta 1,1 km caminando | `solved-share` (regla de celdas: conectado, sin celda de edificio, ≤ 1,10 × longitud caminada) | 0,32 |
| Cero disparo en laberinto doméstico sintético (nunca entrenado con laberintos) | House maze, ventanas de 512 m, 500 rutas de validación | `solved-share` (regla de celdas) | 0,40 |

Desglose por número de frentes declarado por el autor para las 500 rutas retenidas de 512 m: 91 % para rutas de 2-3 frentes, 71 % para 4-5, 33 % para 6-8, 18 % para 9-12 y 2 % para 13 o más frentes.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables dado que el modelo no procesa texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,86 M de parámetros, unos 35 MB en FP32 y unos 18 MB en FP16, más el coste de las activaciones de 1.024 tokens y de las salidas de 256 × 256 celdas; en cualquier caso, muy por debajo de 1 GB.
- GPU recomendadas: el autor reporta 2,4 ms por pasada en una RTX 3060. Cualquier GPU con al menos unos pocos gigabytes de memoria es suficiente; no se documentan pruebas en A100 o H100.
- Cabe holgadamente en GPU de consumo, incluidas RTX 3060 y modelos inferiores; es plausible su ejecución en CPU, aunque no se documentan tiempos en ese caso.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. El despliegue requiere el código del repositorio (clase `LocalGridViT`), el pipeline de datos o el bundle de evaluación `eval_bundle_v0.2.tar.gz`, y el checkpoint colocado en `runs/checkpoints/`.
- Latencia y throughput: 2,4 ms por pasada en RTX 3060; aproximadamente 60 ms por ruta completa. El número de pasadas depende de la ruta (el ejemplo publicado del laberinto doméstico usa 26 pasadas para 431 m).

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spatial-wave-search-512m-hero | 8,86 M | 512 m, 1.024 tokens de parche | 32 % en 500 rutas retenidas de 512 m; 40 % en laberinto doméstico | MIT | HuggingFace y GitHub |
| spatial-wave-search-256m | no disponible | 256 m | 78 % en 500 rutas retenidas; 60 % en un distrito nunca visto; 51 % en laberintos domésticos | MIT | HuggingFace |
| qwen3-vl-2b-lora-map-routes | 2.000 M (base Qwen3-VL-2B con LoRA) | no disponible | 49,6 % bajo la misma regla de evaluación | no disponible | HuggingFace |

La comparación relevante es interna al proyecto: la variante de 256 m es más precisa en su propia ventana (78 % frente a 32 %), mientras que la de 512 m cubre el doble de área por pasada. El baseline visión-lenguaje sobre las mismas rutas alcanza el 49,6 % con dos órdenes de magnitud más de parámetros.

## Limitaciones y advertencias

- Entrenado con datos de una sola ciudad (Ámsterdam); la validación fuera de distribución se limita a rutas retenidas del distrito de entrenamiento y a un distrito no visto de la misma ciudad.
- Resultados de una sola semilla de entrenamiento; no hay estudios de varianza entre ejecuciones.
- Las rutas largas quedan mayoritariamente sin resolver a este tamaño: 2 % de éxito con 13 o más frentes y 18 % con 9-12 frentes.
- La regla de éxito puntúa el dibujo como un conjunto de celdas (conectado, sin celda de edificio, ≤ 1,10 × longitud caminada), no como una secuencia de movimiento; un trazo válido según esa regla puede no ser una ruta navegable en la práctica.
- Los benchmarks del `model-index` están declarados por el autor y marcados como no verificados; no hay evaluación independiente. El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Riesgo de fallo silencioso: en ejecución libre el modelo puede emitir estados incoherentes o dibujos incompletos sin ninguna señal de error, ya que no incorpora un módulo de verificación.
- Sin soporte de cuantización documentado, sin pesos GGUF y sin integración con runtimes de inferencia estándar; el uso requiere clonar el repositorio y ejecutar scripts concretos del harness.
- Restricciones de licencia: el código y los pesos son MIT, pero las capas de Ámsterdam usadas para entrenar y evaluar tienen licencias propias (3DBAG CC BY 4.0, BGT CC0, AHN CC0, OSM ODbL, Overture CDLA-Permissive), detalladas en `DATA_LICENSES.md`; su reutilización comercial queda sujeta a esas condiciones.
- No es un modelo de lenguaje ni un modelo visión-lenguaje: no admite prompts en texto, tool calling ni conversación, por lo que no puede sustituir a un VLM en tareas de descripción o razonamiento verbal de mapas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mxv456/spatial-wave-search-512m-hero
- Repositorio del proyecto: https://github.com/Marvel4U/spatial-reasoning-from-scratch
- Modelo relacionado (red de 256 m): https://huggingface.co/mxv456/spatial-wave-search-256m
- Modelo relacionado (baseline visión-lenguaje): https://huggingface.co/mxv456/qwen3-vl-2b-lora-map-routes
- Documentación de reproducción dentro del repositorio: `REPRODUCE.md` (sección 8)
- Licencias de los datos: `DATA_LICENSES.md` en el repositorio
- Citación: Marvin Uhlmann, *Spatial reasoning from scratch on real city data*, 2026
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos no guardan relación con el contenido de esta ficha.
