# kdcyberdude/ghostrun-smb-policy-v2

## Resumen

ghostrun-smb-policy-v2 es una política neuronal recurrente entrenada exclusivamente con aprendizaje por refuerzo para jugar a Super Mario Bros. de NES a partir de píxeles. Lo desarrolla el usuario kdcyberdude y se publica bajo licencia MIT. No es un modelo de lenguaje: es un agente de control que recibe cuatro fotogramas de 240×224 en color, junto con contexto auxiliar (línea temporal de dropout del mando, acción previa y un vector one-hot de "mood"), y emite acciones discretas sobre el mando de NES.

El interés técnico está en su diseño: una red de unos 6,3 millones de parámetros con un tallo visual aprendido, una CNN con global average pooling, dos bloques SimBa y una GRU de 512 unidades, con cabezas de salida enmascaradas y ordenadas para cada botón. Además incorpora ocho "moods" o estilos de juego aprendidos, seleccionables mediante un one-hot, y un juez de diversidad que premia que los distintos moods jueguen de forma distinta.

Es relevante como ejemplo reproducible de RL a escala sobre emuladores (8.192 consolas emuladas en una RTX 5090) y como caso de estudio de entrenamiento inacabado: el autor documenta con transparencia que el modelo no completa el juego desde el arranque y que su rendimiento decae drásticamente en los niveles finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (tallo visual aprendido + Impoola CNN con global average pooling + 2 bloques SimBa) + GRU de 512; cabezas de salida enmascaradas y ordenadas por botón |
| Parametros totales | ~6,3 M (Policy con core=512, moods=8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 fotogramas de 240×224 en color + línea temporal de dropout del mando + acción previa + one-hot de mood; una decisión cada 4 fotogramas |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; agente de control visual, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, 25.372.945 B) y ONNX (`policy.onnx`, 25.162.811 B) |

## Arquitectura y entrenamiento

La política procesa cuatro fotogramas de NES de 240×224 en color, con énfasis por línea, mapeados a través de la paleta de FCEUX. La visión pasa por un tallo aprendido, una CNN denominada Impoola con global average pooling y dos bloques SimBa. A esa representación se le concatenan el contexto del episodio (línea temporal de dropout del mando, acción anterior y one-hot de mood) y se introduce en una GRU de 512. La salida son cabezas enmascaradas y ordenadas para cada componente del mando: cruceta (9), A (3), B (3), Start (2) y Select (2). El valor se estima con HL-Gauss sobre retornos normalizados por juego. Cada decisión se mantiene durante 4 fotogramas.

El entrenamiento se realizó con RL puro sobre miles de consolas emuladas en paralelo: la ejecución `smb-20261110c-moods`, reanudada desde `smb-20261110b` en la iteración 392, usó 8.192 consolas de Mario en una RTX 5090 a unas 8.000-9.000 decisiones por segundo, con unas 17 horas de entrenamiento activo y paradas para cambiar ajustes. La recompensa (`scripts/reward10`) combina progreso, niveles nuevos, muertes, puntuación como desempate acotado y la victoria, con dos añadidos tardíos: un pequeño coste por esperar y una penalización por retroceso brusco de progreso (bucles en 4-4). Los episodios arrancan en entradas de nivel guardadas, ponderadas por tasa de fallo. Se aplicaron 8 moods con juez de diversidad (`--div-coef 1e-3`), rondas más largas (`--steps 64`), curiosidad RND y "places" de Go-Explore (ambos activados y luego desactivados) y un foco final en 4-4, 7-4, 8-3 y 8-4. El autor indica explícitamente que el entrenamiento no está terminado.

## Capacidades

- Control de Super Mario Bros. de NES a partir de píxeles, con salida directa sobre el mando (cruceta, A, B, Start, Select).
- Ocho estilos de juego ("moods") seleccionables mediante un one-hot, aprendidos y diferenciados por un juez de diversidad.
- Memoria a corto plazo mediante GRU de 512, útil para secuencias de salto y timing.
- Inferencia en modo greedy y con dropout activo (el autor documenta ambos).
- Exportación a ONNX con verificación frente a PyTorch en el momento de la exportación.
- Reproducción de partidas y grabación por nivel mediante scripts (`rl/evaluate.py`, `scripts/record_all_levels.sh`).
- No soporta tool calling, function calling, agentes multi-paso, texto, visión general, audio ni capacidades multilingües: es un agente específico de un único juego.

## Casos de uso

- Investigación en RL visual: servir como línea base reproducible para comparar algoritmos (PPO y variantes), recompensas y mecanismos de exploración sobre un entorno de NES con emulación masiva en paralelo.
- Estudio de diversidad de políticas: los ocho moods con juez de diversidad permiten analizar cómo se comportan políticas especializadas frente a una política única y cómo se puede forzar diversidad sin colapsar el rendimiento.
- Docencia y divulgación: el par `model.pt` + `rl/model.py` permite cargar la política en pocas líneas y mostrar en vivo un agente que juega a Mario, con grabaciones por nivel ya incluidas en `eval/`.
- Evaluación de robustez y fallos: los datos de clear rate por nivel (48-89 % en 1-2 a 4-3, 13-80 % en 5-1 a 8-2, 0-1 % en 4-4, 7-4, 8-3 y 8-4) son útiles para estudiar dónde falla el RL y por qué (bucles, espera, muros de dificultad).
- Integración en pipelines de investigación: el ONNX exportado permite ejecutar la política fuera de PyTorch, por ejemplo en un emulador instrumentado o en un servicio de inferencia ligero, sin dependencia del framework de entrenamiento.
- Reproducción de experimentos de recompensa: el código de recompensas y los registros de cambios de ajustes permiten replicar variantes (coste de espera, penalización de rollback, RND, Go-Explore) y medir su impacto.
- Análisis de currículo de niveles: el planificador de niveles (`rl/level_plan.py`) y las tasas de limpieza por nivel sirven para estudiar arranques ponderados por tasa de fallo y entrenamiento focalizado en niveles duros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Los datos de evaluación que aporta el autor son específicos del juego:

| Metrica | Resultado |
|---|---|
| Parámetros | ~6,3 M |
| Decisiones de entrenamiento | 433.717.248 (iteración 2907) |
| Ritmo de entrenamiento | ~8.000-9.000 decisiones/s en una RTX 5090 |
| Entrenamiento activo | ~17 horas |
| Nivel más lejano en test power-on (greedy, un juego por mood, it002907) | 1-2, 2-1, 2-2, 1-2, 1-2, 1-2, 2-2, 2-1 (los ocho terminan en game over) |
| Nivel más lejano en todo el run (power-on) | 4-4, en it001924 y it002889 (mood 4 en ambos) |
| Clear rate por entrada de nivel (it2914, 1-2 a 4-3) | 48-89 % por nivel |
| Clear rate por entrada de nivel (it2914, 5-1 a 8-2 sin 7-4) | 13-80 % por nivel |
| Clear rate por entrada de nivel (it2914, 4-4, 7-4, 8-3, 8-4) | 0-1 % por nivel |
| Comprobación greedy en los cuatro niveles duros (8 moods, it2841 y it2877) | 0/8 clears en cada nivel; x más lejana en 4-4 de 1.027 a 2.060 px |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~6,3 M de parámetros en fp32 los pesos ocupan del orden de 25 MB, por lo que cabe holgadamente en cualquier GPU consumer, iGPU o incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada para inferencia; para entrenamiento el autor usó una RTX 5090 con 8.192 emuladores en paralelo.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos unos pocos cientos de MB libres (GTX 1050, RTX 3060, RTX 4090, etc.); también en CPU.
- Opciones de despliegue: PyTorch (`rl/model.py` + `rl/evaluate.py`), ONNX Runtime (`policy.onnx`), y los scripts de grabación del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible para inferencia; en entrenamiento se documentan ~8.000-9.000 decisiones/s con 8.192 emuladores en una RTX 5090.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (políticas de RL para Super Mario Bros. u otros agentes de NES) con parámetros, contexto, rendimiento y licencia verificables. Se indica, por tanto, "no disponible". Como referencia cualitativa, el propio autor menciona el uso de componentes conocidos (SimBa, HL-Gauss, RND, Go-Explore) sin ofrecer comparaciones numéricas frente a otras políticas.

## Limitaciones y advertencias

- Entrenamiento no finalizado: el modelo no completa el juego desde el arranque; el mejor resultado power-on documentado es llegar a 4-4 en dos iteraciones concretas.
- En los cuatro niveles duros (4-4, 7-4, 8-3, 8-4) el clear rate es del 0-1 % y la comprobación greedy da 0/8 en cada nivel.
- El juego greedy puede quedarse bloqueado esperando o en bucles, por ejemplo en el laberinto de 4-4.
- Las entradas de nivel de 5-1 a 8-4 usadas en entrenamiento se construyeron desde la entrada de 4-1 fijando mundo, etapa y área en RAM; no son llegadas naturales, lo que puede inflar el rendimiento medido en esas condiciones.
- Los vídeos y test plays provienen de NeSLE; FCEUX coincidió en x, y y velocidades de Mario fotograma a fotograma en las repeticiones comprobadas, pero otros valores de RAM difieren.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es que la política produzca comportamientos degenerados (bucles, espera) fuera de las condiciones de entrenamiento.
- Sesgos conocidos: no documentados por el autor; al ser un agente entrenado con una recompensa concreta, su comportamiento está sesgado hacia las métricas de esa recompensa (progreso, puntuación acotada, victoria).
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo depende de ROMs de Super Mario Bros. para ejecutarse; la licencia del modelo no cubre los derechos sobre el juego ni sobre las ROMs.
- Caveat para producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin garantías de mantenimiento; no debe tratarse como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kdcyberdude/ghostrun-smb-policy-v2
- Repositorio de entrenamiento (GhostRun training lab): mencionado en la model card como "the GhostRun training lab repository"; URL exacta no disponible en la información proporcionada.
- Scripts y ficheros citados dentro del repositorio: `rl/model.py`, `rl/train.py`, `rl/evaluate.py`, `rl/player/export.py`, `rl/level_plan.py`, `scripts/reward10`, `scripts/record_all_levels.sh`, `eval/it002907/model.pt`, `results/tables/smb_v2_moods_eval_history.csv`, `results/tables/smb_v2_moods_level_clear.csv`, `results/tables/smb_v2_hard_levels_check.json`.
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
