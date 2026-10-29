# Pine532/chameleon-layout-critic

## Resumen

Chameleon layout critic es un modelo lineal de 113 pesos desarrollado por el equipo del hackathon Chameleon (Dev 3, 26 de octubre de 2026) que puntua un banner ya maquetado y decide entre candidatos casi equivalentes generados por el motor de redimensionado Chameleon. No es un modelo generativo: implementa una regresión logística L2 antisimétrica sobre 113 características geometricas y de informe del motor, y se usa como desempate cuando la selección basada en reglas produce varios finalistas con puntuaciones muy próximas. Se destila de los veredictos por pares de un modelo visión-lenguaje de referencia (el "juez") y se ejecuta exclusivamente con numpy, en local, sin GPU, en torno a 2 ms por tarea.

Su relevancia es de ingeniería más que de investigación: demuestra cómo sustituir una llamada costosa a un VLM por un artefacto de 16,8 KB que reproduce buena parte de sus preferencias en un dominio muy acotado. Según la model card, mejora la concordancia con el juez en unos +4,5 puntos sobre la selección propia del motor en el conjunto de comparaciones etiquetadas (+3 puntos en las comparaciones del motor actual), y en una quinta ronda de evaluación a doble orden el juez prefirió su elección frente a la del motor por 67 a 13.

El alcance es deliberadamente estrecho: solo puntua finalistas del motor, no genera ni mueve elementos, no puntua layouts en términos absolutos y absteniéndose (decide la regla) si falta el fichero, está corrupto o aparece un nombre de característica desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística L2 antisimétrica sobre características de layout, sin intercepto (`score = sum_k w_k * x_k / sd_k`) |
| Parametros totales | 113 pesos (más vectores auxiliares `sd`, `bias`, `margin`, `window` y nombres de característica) |
| Parametros activos | no aplica (modelo lineal denso, no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 113 características numéricas por finalista) |
| Tipos de cuantizacion | no aplica (arrays de numpy en `.npz`, sin cuantización publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; el texto solo entra como magnitudes geométricas y métricas del motor) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` de numpy (`critic.npz`, cargable con `allow_pickle=False`), acompañado de `critic_features.py` |

Otros datos: tamaño del repositorio 0,0 GB (fichero de 16,8 KB); margen de decisión 0,5; ventana de finalistas 0,06; `bias` = 0; creado el 2026-10-28 y actualizado el 2026-10-29; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 y estructura antisimétrica: la preferencia entre dos layouts se decide por la diferencia de puntuaciones, `score(B) - score(A) >= margin`, con margen 0,5. Cada una de las 113 características se normaliza por su desviación típica almacenada en `sd`, de modo que los coeficientes efectivos son `w / sd`. Las características se agrupan en tres bloques: 12 números del informe del motor (nueve métricas suaves como `soft_readability`, `soft_collisions`, `soft_hierarchy`, `soft_fidelity`, `soft_utilization`, `soft_spacing`, `soft_alignment`, `soft_wrapping` y `soft_adjacency`, más `rule_score`, `min_text_px` y `texts_below_floor`); 24 características de queja (`c_*`: márgenes y contacto con bordes, banda vacía mayor, utilización, regularidad de la fila de badges, CTA respecto al copy, dominancia del titular, contraste de logo y texto sobre paneles, puntos sobre texto, texto sobre píldoras, proporción de texto diminuto, elipses estiradas y paneles a ras de lienzo); y 77 características geométricas (ocupación y tercios, márgenes, solapamientos, alineación, huecos, balance, tamaños de elemento y de fuente).

El entrenamiento usa comparaciones por pares de layouts del propio motor, juzgadas dos veces por un VLM fuerte con las letras intercambiadas; una comparación se considera decidida cuando ambos órdenes coinciden en un ganador no empatado. La tabla de la model card reporta tres rondas: 300 comparaciones (159 pares de finalistas decididos) con el motor `0fdf32b`; 140 comparaciones (56 pares antiguo-contra-nuevo decididos) con las elecciones de `main` frente a una rama; y 620 comparaciones (403 pares decididos: 370 con la elección real del motor y 36 pares de calibración claramente peores) con el motor `4d70239`. En total, 618 comparaciones decididas procedentes de 61 diseños (3 muestras de los organizadores, 18 sintéticos y 40 diseños de holdout en 26 familias de plantilla), tras eliminar pares juzgados dos veces. Se añaden 284 comparaciones que el juez no pudo separar (etiqueta suave 0,5, peso 2) y 361 pares "elección del motor contra estiramiento uniforme" sin juzgar (etiqueta: gana la elección, peso 0,3), más 44 pares de estiramiento y árbitro juzgados.

No hay innovación arquitectónica reseñable: el interés está en la destilación de preferencias de un VLM a un modelo lineal de coste despreciable y en el mecanismo de abstención (si falta el fichero, está corrupto o hay una característica desconocida, decide la regla del motor). El entrenamiento se hizo con scikit-learn y la inferencia con numpy puro.

## Capacidades

- Puntuación de layouts terminados: asigna una puntuación escalar a un banner ya maquetado a partir de características geométricas y métricas del motor.
- Preferencia por pares: decide si el layout B es preferible a A cuando la diferencia de puntuación supera el margen de 0,5.
- Desempate entre finalistas: selecciona entre candidatos cuya puntuación de regla está dentro de la ventana de 0,06 respecto a la mejor, con un máximo de cuatro finalistas adicionales.
- Abstención segura: no emite juicio si el fichero no está, está corrupto o aparece un nombre de característica no reconocido.
- Ejecución offline y determinista en CPU con numpy, en torno a 2 ms por tarea, sin renderizado, fuentes ni acceso a ficheros de imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio. Tampoco edita, mueve o crea elementos de diseño.

## Casos de uso

- Desempate dentro del motor de redimensionado: integrado en `engine/resize.py` (sección 5b, backend `judge`), se invoca después del selector basado en reglas para elegir entre finalistas casi empatados; es su uso previsto y el único respaldado por la evaluación del equipo.
- Filtro de calidad en pipelines de generación de banners: al puntuar cada candidato con 113 características y ~2 ms, permite descartar o reordenar salidas antes de una revisión humana o de una llamada cara a un VLM.
- Sustitución de un juez VLM en producción: al ser una destilación de sus veredictos por pares, reduce coste y latencia en el subconjunto de decisiones para las que fue entrenado (finalistas del motor), manteniendo una concordancia alta.
- Verificación en integración continua: un test que compare la elección del motor con la del crítico sobre un conjunto fijo de diseños detecta regresiones del selector de reglas sin necesidad de GPU ni de servicios externos.
- Etiquetado previo de datasets de diseño: ordenar pares de layouts con un criterio barato y derivar después solo los casos dudosos (diferencias por debajo del margen) a un juez VLM, reduciendo el volumen de consultas.
- Despliegue en entornos sin red ni aceleradores: al ocupar 16,8 KB y depender solo de numpy, cabe en contenedores mínimos, máquinas de CPU o entornos air-gapped donde no se puede invocar un modelo multimodal.
- Evaluación comparativa de versiones del motor: usar las 618 comparaciones decididas y las rondas de juez documentadas como banco de pruebas reproducible para medir cambios en las métricas suaves o en las reglas geométricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; el modelo no es generativo y esas métricas no aplican. Los datos de evaluación que reporta la model card son:

| Metrica | Resultado |
|---|---|
| Concordancia con el juez (held-out, todas las comparaciones etiquetadas) | +4,5 puntos sobre la elección propia del motor |
| Concordancia con el juez (comparaciones del motor actual) | +3 puntos sobre la elección del motor |
| Elecciones modificadas en las rejillas de evaluación | 103 de 1.162 |
| Quinta ronda de juez sobre esas 103 (antigua elección frente al crítico, ambos órdenes de letras) | 67 a 13 a favor del crítico |
| Pares de estiramiento juzgados donde el crítico prefiere un estiramiento uniforme frente a la elección del motor | 1 a 2 de 38 |
| Latencia por tarea | ~2 ms |

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. El fichero de pesos ocupa 16,8 KB.
- GPU recomendadas: ninguna. Cualquier CPU capaz de ejecutar numpy sirve.
- Compatibilidad con GPU de consumo: irrelevante, se ejecuta en CPU; el coste dominante es el cálculo de las 113 características, no la inferencia.
- Opciones de despliegue: importación directa de `critic.npz` con `numpy.load(..., allow_pickle=False)` y `critic_features.py`; integración en el motor mediante `engine/models/critic.npz`; desactivación con `CHAMELEON_CRITIC=0` o eliminando el fichero. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: aproximadamente 2 ms por tarea según el autor; no se publica throughput agregado ni mediciones por plataforma.
- Dependencias: numpy en inferencia y scikit-learn solo para reentrenamiento.

## Comparativa con modelos similares

No hay resultados públicos de benchmarks que permitan comparar numéricamente con alternativas; la comparación es funcional.

| Modelo | Tipo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Chameleon layout critic | Regresión logística sobre características | 113 pesos | no aplica | Puntuar y desempatar finalistas del motor | Apache-2.0 | HuggingFace (`Pine532/chameleon-layout-critic`) |
| Chameleon layout generator | MLP | 6.600 pesos | no aplica | Predecir la caja de cada unidad de contenido en el lienzo destino | no disponible en la informacion | HuggingFace (`Pine532/chameleon-layout-generator`) |
| Juez VLM de referencia (no identificado) | Modelo visión-lenguaje | no disponible | no disponible | Preferencias por pares sobre layouts | no disponible | No distribuido con este modelo |
| Selector basado en reglas del motor Chameleon | Reglas heuristicas | no aplica | no aplica | Elección principal y generación de finalistas | no disponible | Incluido en el motor |

## Limitaciones y advertencias

- Dominio muy restringido: solo se evaluó con banners de estilo Solstice; no se garantiza su comportamiento con otros lenguajes de diseño.
- Solo puntua finalistas del motor. No fue entrenado para rechazar layouts claramente peores según la puntuación de regla y, de hecho, prefiere un estiramiento uniforme frente a la elección del motor en 1 a 2 de los 38 pares de estiramiento juzgados.
- No produce puntuaciones absolutas: la salida solo es interpretable como comparación entre dos layouts con el mismo conjunto de características.
- No puede sustituir al scorer de los organizadores ni se distribuye con garantías de validez fuera del motor Chameleon.
- Sesgo heredado del juez: las etiquetas provienen de los veredictos de un VLM de terceros, por lo que el crítico reproduce sus preferencias y sus sesgos, incluidos los estilísticos.
- Base de entrenamiento pequeña: 618 comparaciones decididas de 61 diseños, con 3 muestras de los organizadores y 18 diseños sintéticos; la generalización a nuevas familias de plantilla es limitada.
- Sin capacidades de lenguaje: no procesa texto de forma semántica, no es multilingüe y no admite instrucciones en lenguaje natural.
- Riesgo de sobreajuste al motor: las características dependen del informe y del formato de salida del motor, de modo que cambios en sus métricas suaves o en los nombres de característica pueden invalidar el modelo (los nombres desconocidos provocan abstención).
- Licencia Apache-2.0 confirmada por el equipo el 2026-10-28; los pesos derivan de diseños propios, de tres diseños de muestra de los organizadores y de veredictos de un modelo de terceros, sin incluir pesos de terceros. No se documentan restricciones adicionales para uso comercial.
- Repositorio sin descargas ni likes y con documentación repartida entre la model card y ficheros (`critic_report.md`, `docs/crello-gains-2026-10-26.md`) no enlazados públicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pine532/chameleon-layout-critic
- Modelo relacionado (generador de layouts): https://huggingface.co/Pine532/chameleon-layout-generator
- Benchmark de modelos de octubre de 2026 (referencia general, no especifica de este modelo): https://benchlm.ai/
- Listado de rankings y precios de LLM (referencia general): https://www.llmboard.ai/
- Articulo sobre Meta Chameleon (homónimo, sin relación con este modelo): https://www.analyticsvidhya.com/blog/2024/05/meta-chameleon-a-new-player-in-the-multimodal-ai-race/
- Paper, blog o demo especificos del modelo: no disponible
