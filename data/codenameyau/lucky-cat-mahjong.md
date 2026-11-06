# codenameyau/lucky-cat-mahjong

## Resumen

Lucky Cat Mahjong es una colección de estrategias aprendidas para el juego del mahjong de Hong Kong, publicada en Hugging Face por el desarrollador codenameyau como parte del proyecto de código abierto Lucky Cat Mahjong, un juego de mahjong con entrenador integrado. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una red neuronal pequeña que evalúa las decisiones disponibles en una partida (qué ficha descartar, si reclamar un pung, chow o kong, si declarar un kong) y asigna a cada una una puntuación en puntos esperados, jugando la opción de mayor valor.

El modelo principal, denominado Neural Cat, se distribuye en formato JSON con pesos en float16 y una arquitectura de perceptrón multicapa de 568 entradas, dos capas ocultas de 256 y 128 neuronas con activación ReLU, y 28 salidas. La entrada codifica la posición mediante la lectura de mano de Jorge Yau (mano objetivo, pasos hasta estar listo, fichas vivas, riesgo de descarte) y se descompone en siete grupos de características. La salida predice cómo termina la mano y el faan obtenido o pagado, que se combinan en un único valor escalar según la tabla de pagos del juego.

Su relevancia es acotada y específica: sirve como referencia de aprendizaje por refuerzo aplicado a un dominio de juego de información imperfecta, con un pipeline de entrenamiento reproducible (bootstrap con bots basados en reglas, auto-juego y liga de modelos) y un conjunto de datos público de partidas. No obstante, el repositorio tiene cero descargas y cero likes, la licencia no está declarada y la información disponible se limita a la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado: 568 → 256 → 128 → 28, activación ReLU |
| Parametros totales | no disponible (deducible de la arquitectura: 568×256 + 256 + 256×128 + 128 + 128×28 + 28 ≈ 182.428, no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; la entrada es un vector de 568 características por posición) |
| Tipos de cuantizacion | float16 (dtype `f16` en los ficheros JSON); no se documentan otras opciones |
| Idiomas soportados | no disponible (no procesa lenguaje natural; el dominio es el mahjong de Hong Kong) |
| Licencia | no disponible |
| Formato de pesos | JSON con pesos base64 little-endian float16 (`layers[].w`, `layers[].b`, row-major) y metadatos (`featureVersion`, `featureSize`, `dtype`, `meta`) |

## Arquitectura y entrenamiento

La red es un MLP de cuatro capas (568 entradas, 256 y 128 ocultas con ReLU, 28 salidas) que puntúa cada decisión posible en una posición de mahjong. La entrada se construye con siete grupos de características derivados de la lectura de mano de Jorge Yau: fichas conservadas, ficha descartada, lo que muestra la mesa, muro y asiento, velocidad, valor de la mano y seguridad. Las 28 salidas predicen la distribución de finales de mano (victoria por robo propio o por descarte ajeno, descarte peligroso que provoca pago, robo propio o victoria de otro jugador, y empate) junto con el faan de la victoria cobrada y el de la mano pagada; esos valores se combinan en un único número de puntos esperados según la tabla de pagos del juego. El modelo elige entre los tres mejores descartes propuestos por Jorge Yau y puede anular la decisión de reclamar o declarar kong cuando su propia estimación es superior.

El entrenamiento se organiza en tres fases. Primero, un bootstrap sobre manos jugadas por estrategias basadas en reglas (Jorge Yau, Lucky Cat y Only Orphans). Después, auto-juego contra bots de reglas (s1 a s6, solo descartes), conservándose s5. Finalmente, una liga en la que todos los asientos son modelos Neural Cat: la mitad de los asientos los ocupa el mejor modelo hasta la fecha con exploración y el resto modelos anteriores, con s5 siempre presente. Cada ronda juega 50.000 manos nuevas, entrena un modelo desde el mejor sobre las últimas 400.000 manos y lo enfrenta cara a cara al mejor (dos asientos cada uno, todas las rotaciones, 2.000 repartos nuevos); solo se convierte en el mejor si obtiene más puntos por mano. Cada posición se etiqueta con el resultado real de la mano, la única información del futuro que se usa y solo durante el entrenamiento. El entrenamiento se realizó con PyTorch sobre GPU de Apple. El modelo juega limpio: solo ve lo que su asiento puede ver (su mano, todos los descartes, las melds mostradas y las fichas restantes), nunca el muro, las manos ajenas ni la ficha de un kong oculto, y el repositorio del juego incluye un test que repite cada decisión con todas las fichas ocultas barajadas y falla si algo cambia.

## Capacidades

- Evaluación de decisiones de descarte en mahjong de Hong Kong, eligiendo entre los tres mejores descartes propuestos por la heurística de Jorge Yau.
- Decisión sobre reclamar pung, chow o kong, y sobre declarar kong, pudiendo anular la recomendación de la heurística base.
- Estimación de puntos esperados combinando frecuencia y cuantía de las victorias en una única escala según la tabla de pagos del juego.
- Predicción de la distribución de finales de mano (victoria propia por robo o por descarte, pago por descarte peligroso, victoria ajena, empate) y del faan cobrado o pagado.
- Juego con información imperfecta estricta: no accede a información oculta de otros asientos ni del muro.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni capacidades de agente multi-paso.
- No es multilingüe ni procesa lenguaje; su dominio es exclusivamente el mahjong de Hong Kong.
- No dispone de modo de pensamiento explícito (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Entrenador integrado en el juego Lucky Cat Mahjong: el modelo puntúa cada decisión del jugador humano y permite mostrar recomendaciones de descarte, reclamación o kong con su valor esperado en puntos. Es adecuado porque el juego ya carga el JSON directamente mediante `js/mahjong-ml-model.js` y construye las entradas con `js/mahjong-ml-features.js`.
- Bot oponente en partidas locales o servidor del juego: al ser una red de 568→256→128→28 en float16, la inferencia es muy ligera y puede ejecutarse en el navegador o en CPU sin GPU dedicada, con latencia despreciable por decisión.
- Referencia docente de aprendizaje por refuerzo en juegos de información imperfecta: el pipeline bootstrap → auto-juego → liga, con etiquetado por resultado real de la mano y validación cara a cara, sirve como ejemplo reproducible de entrenamiento con auto-juego y evaluación por liga.
- Investigación sobre evaluación de políticas en juegos de mesa: la liga con rotaciones de asientos y repartos idénticos entre modelos permite comparar políticas con control de varianza y medir puntos por mano, tasa de victorias, tasa de descartes peligrosos y victoria media.
- Análisis de estrategia de mahjong: el modelo puede usarse para estudiar el equilibrio entre velocidad (pasos hasta estar listo) y valor de la mano, y para cuantificar el riesgo de descarte mediante las características de seguridad de la entrada.
- Reproducción de experimentos con datos públicos: el dataset `codenameyau/lucky-cat-mahjong-games` permite reentrenar o auditar el modelo, y los ficheros JSON de cada versión (s5, L1, L2) permiten comparar políticas históricas.
- Integración en herramientas de análisis de partidas grabadas: al aceptar una representación de posición de 568 características, puede puntuar posiciones de partidas registradas para generar informes de errores y alternativas.

## Benchmarks y rendimiento

Resultados de la liga publicados en la model card: puntos por mano contra el mejor modelo de su ronda y contra s5 (el modelo previo a la liga), sobre los mismos repartos.

| Modelo | Jugado contra | vs mejor | vs s5 | Victorias | Descartes peligrosos | Victoria media | Conservado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | s5 | +62,5 | +62,5 | 9,3 % | 6,2 % | 1.675 | sí |
| L2 | L1 | +28,3 | +68,4 | 8,6 % | 5,4 % | 1.672 | sí |

El modelo actual es L2 (`neural-cat/neural-cat.json`), tras dos rondas de liga con 100.000 manos simuladas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float16 (aproximadamente 182.000 parámetros × 2 bytes ≈ 365 KB), más el vector de entrada de 568 valores; cabe holgadamente en cualquier GPU, CPU o incluso en memoria de un navegador.
- GPU recomendadas: no se requiere GPU; el autor entrenó con PyTorch sobre GPU de Apple. Para inferencia basta CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, integradas) y en dispositivos móviles.
- Opciones de despliegue: el propio juego carga los JSON mediante `js/mahjong-ml-model.js`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño de la red (unas 182.000 multiplicaciones-acumulaciones por evaluación) la latencia por decisión es del orden de microsegundos en CPU moderna, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- | --- |
| Lucky Cat Mahjong Neural Cat (L2) | MLP para mahjong de Hong Kong | ≈182.000 (no confirmado) | no aplica (vector de 568 características) | +68,4 puntos/mano vs s5; 8,6 % victorias; 5,4 % descartes peligrosos | no disponible | Hugging Face, 0 descargas |
| Jorge Yau | Heurística basada en reglas | no aplica | no aplica | referencia base del proyecto; no se publican métricas comparativas | no disponible | incluida en el repositorio del juego |
| Lucky Cat (bot de reglas) | Heurística basada en reglas | no aplica | no aplica | usada en el bootstrap; no se publican métricas comparativas | no disponible | incluida en el repositorio del juego |
| Only Orphans | Heurística basada en reglas | no aplica | no aplica | usada en el bootstrap; no se publican métricas comparativas | no disponible | incluida en el repositorio del juego |

No se dispone de información sobre otros modelos de mahjong comparables en la búsqueda realizada; la comparativa se limita a las estrategias del propio proyecto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con auto-juego y bots de reglas, puede heredar sesgos estratégicos de esas políticas y de la tabla de pagos "full-spicy" del juego.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las estimaciones de puntos esperados son predicciones probabilísticas y pueden ser inexactas en posiciones poco representadas en los datos de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje natural ni otros idiomas; su dominio es exclusivamente el mahjong de Hong Kong y requiere características de la misma `featureVersion` (568) para funcionar.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Madurez y adopción: cero descargas y cero likes en Hugging Face, creado y actualizado el mismo día (2026-11-06), sin comunidad ni soporte documentado más allá de la model card.
- Dependencia del juego: los ficheros JSON solo son utilizables con el código del repositorio Lucky Cat Mahjong (`js/mahjong-ml-model.js` y `js/mahjong-ml-features.js`); no hay API estándar ni formato de interoperabilidad.
- Verificación de juego limpio: el test del repositorio comprueba que no se usan fichas ocultas, pero no se publican auditorías externas.
- Resultados de liga con tamaños de muestra limitados (2.000 repartos por enfrentamiento) y sin intervalos de confianza publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codenameyau/lucky-cat-mahjong
- Dataset de partidas: https://huggingface.co/datasets/codenameyau/lucky-cat-mahjong-games
- Repositorio del juego: https://github.com/codenameyau/lucky-cat-mahjong
- README del repositorio: https://github.com/codenameyau/lucky-cat-mahjong/blob/master/README.md
