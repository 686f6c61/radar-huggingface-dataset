# rriviere/pokerpath-lab-preflop

## Resumen

PokerPath Lab Preflop es un clasificador tabular basado en Random Forest, desarrollado por el usuario rriviere, que predice la acción de un solver de póker (fold, check, call, raise) en situaciones preflop tras una acción adversaria. No es un modelo de lenguaje ni una red neuronal: es un estimador de scikit-learn serializado con skops, entrenado sobre datos derivados de PokerBench, y su función es actuar como juez dentro del proyecto PokerPath Lab, señalando como posible error cualquier decisión humana que difiera de la acción predicha.

El modelo trabaja sobre 20 variables tabulares que describen la mano (rangos, pareja, suited, gap), la situación de apuesta (número de bets, calls, jugadores, bote, to_call, pot odds) y la posición del héroe. Se entrenó con 20 511 filas tras eliminar duplicados, decisiones del primer jugador en hablar y situaciones sin elección real; el conjunto está fuertemente desbalanceado hacia fold (79 %).

Su relevancia es acotada y práctica: ofrece una referencia rápida y ligera (repo de 0.0 GB, inferencia trivial en CPU) para evaluar decisiones preflop en mesas de 6 jugadores y 100 BB sin ante, con una exactitud reportada del 93.0 % en validación y del 93.5 % en el test oficial de PokerBench. No cubre otras fases del juego ni stacks cortos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn), clasificación tabular |
| Parámetros totales | no disponible (no aplica; 400 árboles, max_depth=20) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 20 variables tabulares) |
| Tipos de cuantización | no disponible (no aplica a modelos sklearn) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | skops (`model.skops`), más `pokerbench_reference.json` |

## Arquitectura y entrenamiento

El modelo es un Random Forest de clasificación con `n_estimators=400`, `max_depth=20`, `min_samples_leaf=2`, `max_features=sqrt` y `random_state=0`. La entrada es un vector de 20 variables en orden fijo: `high_rank`, `low_rank`, `pair`, `suited`, `gap`, `num_bets`, `num_players`, `num_calls`, `pot`, `to_call`, `pot_odds`, `hero_acted`, `facing_allin`, `can_check`, `pos_UTG`, `pos_HJ`, `pos_CO`, `pos_BTN`, `pos_SB`, `pos_BB`. La salida es una de cuatro clases de acción: fold, check, call o raise.

Los datos provienen del dataset rriviere/pokerpath-lab-preflop-data (revisión 291e5361f0c8fff9295444c643813eb06ed108eb), construido a partir de PokerBench (revisión 7ac61f961c81a50fc0f667820b2fb0e432dfec0d). Se usaron etiquetas de solver en mesas de 6 jugadores, 100 BB y sin ante; se eliminaron las decisiones del primer jugador en hablar, las situaciones sin elección y los duplicados, quedando 20 511 filas con un 79 % de folds. No se documenta uso de RLHF, DPO ni técnicas de aumento de datos más allá de la limpieza descrita.

## Capacidades

- Clasificación tabular de acciones preflop en cuatro clases: fold, check, call y raise.
- Evaluación de decisiones tras una acción adversaria, con señalización de posibles errores cuando la acción humana difiere de la predicha.
- Codificación de posición (UTG, HJ, CO, BTN, SB, BB), pot odds, presión de apuesta (`num_bets`, `num_calls`), all-in y disponibilidad de check.
- Filtro de aplicabilidad mediante `pokerbench_reference.json`, que identifica situaciones conocidas de PokerBench y situaciones sin elección real.
- Carga segura sin ejecución de código arbitrario gracias al formato skops.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Revisión de sesiones de entrenamiento: introducir cada decisión preflop registrada en un histórico y comparar la acción del jugador con la predicción para generar una lista de spots a revisar, aprovechando la exactitud del 93.0 % en validación.
- Herramienta de estudio personal: dado un spot concreto (mano, posición, acción adversaria, bote y to_call), obtener la acción de referencia del solver y contrastarla con la intuición del jugador.
- Docencia y coaching de póker: construir ejercicios automáticos de preflop a partir de las 20 variables, usando el modelo como corrector instantáneo en CPU sin infraestructura GPU.
- Validación de pipelines de datos de póker: comprobar que un parser de históricos produce variables coherentes comparando la predicción del modelo con la acción real registrada.
- Filtrado de manos para análisis posterior: marcar automáticamente spots con alta probabilidad de error y priorizar su revisión manual en lugar de revisar el histórico completo.
- Integración ligera en aplicaciones web o notebooks: al ser un artefacto skops de tamaño despreciable y ejecutarse en CPU, puede servirse como endpoint de baja latencia para consultas puntuales de jugadores.
- Generación de etiquetas de referencia para datasets propios de preflop en mesas de 6 jugadores y 100 BB sin ante, siempre que se acepte la limitación de que el modelo aprende de las etiquetas de PokerBench.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de validación reservado (20 % de las situaciones, no vistas durante la comparación de modelos):

| Medida | Valor |
|---|---|
| F1 sin check (media de fold, call, raise) | 86.4 % |
| Precisión fold | 95.2 % |
| Precisión call | 83.1 % |
| Precisión raise | 88.1 % |
| Exactitud | 93.0 % |
| Exactitud en test oficial PokerBench | 93.5 % |
| Exactitud en PokerBench excluyendo el spot de check | 91.4 % |

El propio autor advierte que el test oficial de PokerBench mide en buena parte memoria, ya que la mayoría de sus situaciones también están en el entrenamiento. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: un Random Forest de 400 árboles con profundidad máxima 20 se evalúa en milisegundos por muestra en cualquier CPU moderna; no requiere GPU.
- VRAM estimada: 0 GB; el artefacto `model.skops` ocupa una fracción despreciable del repo de 0.0 GB.
- GPU recomendadas: no aplica; no se obtiene ventaja del uso de A100, H100 ni RTX 4090.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos serverless con límites de memoria mínimos.
- Despliegue: carga directa con `skops.io.load` en Python, servible mediante FastAPI, Flask o funciones serverless; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados; por la naturaleza del modelo se espera latencia de milisegundos y throughput de miles de predicciones por segundo en un solo núcleo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Exactitud reportada | Licencia |
|---|---|---|---|---|---|
| PokerPath Lab Preflop (este) | Random Forest sklearn | 20 variables tabulares | fold/check/call/raise | 93.0 % validación; 93.5 % PokerBench | apache-2.0 |
| PokerBench (RZ412) | Benchmark de evaluación | Situaciones de póker | Referencia de evaluación | no disponible | no disponible |
| Modelos de lenguaje aplicados a póker | LLM | Texto | Texto | no disponible | variable |

No se dispone de información sobre modelos tabulares comparables entrenados específicamente para decisiones preflop, por lo que la comparativa con alternativas directas no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en 100 BB sin ante: solo debe emplearse para stacks de 40 BB o más y en mesas de 5 o 6 jugadores.
- No juzga las decisiones del primer jugador en hablar ni los pots limpados (limped pots).
- El solver a veces mezcla varias acciones mientras PokerBench conserva solo una; una decisión señalada como error no es prueba de error real.
- Fuerte desbalance de clases (79 % fold), lo que puede infrarepresentar situaciones de raise y call poco frecuentes.
- La exactitud del 93.5 % en PokerBench está inflada por solapamiento entre entrenamiento y test, según reconoce el autor.
- No procesa lenguaje natural, imágenes ni audio; cualquier caso de uso fuera de las 20 variables tabulares queda fuera de su alcance.
- No se documentan sesgos demográficos ni de otro tipo, pero al derivar de un único dataset de solver su comportamiento refleja las suposiciones de ese solver y de ese formato de mesa.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los datasets de origen (PokerBench y pokerpath-lab-preflop-data) antes de redistribuir derivados.
- El archivo `pokerbench_reference.json` debe consultarse para determinar si una situación es evaluable; ignorarlo produce predicciones fuera de dominio sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rriviere/pokerpath-lab-preflop
- Dataset de entrenamiento: https://huggingface.co/datasets/rriviere/pokerpath-lab-preflop-data
- Dataset PokerBench: https://huggingface.co/datasets/RZ412/PokerBench
- Documentación de skops: https://skops.readthedocs.io
