# shhivv/taiga-s1

## Resumen

Taiga-S1 es un modelo de 1.228.163 parámetros (aproximadamente 1,2 millones) desarrollado por Shiv Shanmugam (usuario `shhivv`) que actúa como capa de decisión "System 1" para un agente de diseño asistido por ordenador. Su tarea no es generar texto, sino elegir el siguiente comando de FreeCAD en la construcción paso a paso de una pieza: seleccionar plano, crear boceto, dibujar, acotar, aplicar *pad*, *pattern* o *fillet*. El modelo recibe un objetivo en forma de lista ordenada de características más un tamaño aproximado de la pieza final, lee el estado vivo de la sesión de FreeCAD y devuelve una distribución de probabilidad calibrada sobre los comandos actualmente disponibles.

El interés del proyecto es doble. Por un lado, demuestra que un modelo minúsculo entrenado desde cero puede resolver una tarea de uso de ordenador sin LLM, sin modelo de visión y sin capturas de pantalla, con un coste de aproximadamente 1 ms por decisión en CPU. Por otro lado, documenta con ablaciones qué técnicas permiten generalizar a objetivos más largos que los vistos en entrenamiento: identificadores de posición aleatorizados, ordinales acoplados entre el objetivo y el árbol de características, una política modular de "¿ya está hecho?" y tipos de característica factorizados.

El modelo se entrenó con 24.000 sesiones sintéticas de modelado en FreeCAD en modo *headless* (unas 590.000 decisiones) etiquetadas por un profesor programado, seguidas de dos rondas de DAgger. Está publicado bajo licencia MIT con pesos en `safetensors` y se ejecuta contra la aplicación real de FreeCAD 1.1 mediante un socket local. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 *likes*, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 3 capas para codificar el estado de sesión y el objetivo, con atención de los comandos candidatos sobre el estado y el ítem activo del objetivo; cada comando candidato recibe una puntuación (no es un modelo de lenguaje autorregresivo) |
| Parámetros totales | 1.228.163 (aproximadamente 1,2 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo consume un *snapshot* estructurado del estado de FreeCAD y una lista ordenada de características. Entrenado con objetivos de hasta 5 características, generaliza a 17 características (unas 55 decisiones) |
| Tipos de cuantización | no disponible; no se publican versiones cuantizadas. Por tamaño, cabe en fp32 (unos 4,9 MB) sin necesidad de cuantizar |
| Idiomas soportados | no disponible; no procesa lenguaje natural. La *model card* está redactada en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 3 capas que codifica conjuntamente el estado de la sesión de FreeCAD (árbol de características, selección actual, restricciones del boceto, *workbench* activo) y el objetivo. Los comandos disponibles en ese instante actúan como candidatos: cada uno atiende al estado y al ítem activo del objetivo y recibe una única puntuación, de la que se deriva una distribución de probabilidad. La temperatura de calibración ajustada se guarda en `config.json`. No hay generación de texto ni decodificación autorregresiva: es un clasificador de siguiente acción sobre un conjunto variable de acciones válidas.

Los datos de entrenamiento son 24.000 sesiones sintéticas de modelado guionizadas en FreeCAD *headless*, lo que supone aproximadamente 590.000 decisiones. Un profesor programado etiqueta el comando correcto en cada paso y se inyectan errores aleatorios para que el modelo aprenda a recuperarse. El entrenamiento combina supervisión directa con dos rondas de DAgger, en las que el propio modelo controla FreeCAD y el profesor corrige sus fallos. Las innovaciones que explican la generalización en longitud son cuatro: identificadores de posición aleatorizados durante el entrenamiento (Ruoss et al., 2023), ordinales acoplados entre el ítem *k* del objetivo y la característica *k* del árbol (posición coupling, 2024), una política modular de "¿ya está construido?" que actúa sobre el primer ítem pendiente, y tipos de característica factorizados con *embeddings* de categoría y *type dropout*.

## Capacidades

- Selección del siguiente comando en flujos de trabajo de FreeCAD PartDesign, leyendo el estado vivo de la aplicación en cada paso.
- Cobertura de bocetos (rectángulo, círculo, hexágono), *pad*, *pocket*, *hole*, *revolve*, patrones lineal y polar, *mirror*, *fillet*, *chamfer* y *shell*.
- Generalización en longitud: completó correctamente los 100 objetivos de 11 características (~55 comandos) y el 95 % de los de 17 características, pese a haberse entrenado con objetivos de hasta 5 características.
- Recuperación de errores: con un 20 % de acciones sustituidas por acciones aleatorias, detecta el daño, lo deshace y termina entre el 86 % y el 100 % de las piezas.
- Manejo de combinaciones de características no vistas durante el entrenamiento (90-100 % de éxito).
- Probabilidades calibradas por comando, con temperatura ajustada almacenada en la configuración.
- Ejecución real sobre la interfaz gráfica de FreeCAD 1.1 a través de un socket local.
- No dispone de *tool calling* genérico, ni de capacidades de visión, audio, matemáticas simbólicas o razonamiento en lenguaje natural: los valores numéricos de cada operación provienen del objetivo proporcionado por el planificador.

## Casos de uso

- Automatización de modelado paramétrico repetitivo: dado un catálogo de piezas descrito como listas ordenadas de características, el modelo genera la secuencia de comandos que las construye en FreeCAD, eliminando el trabajo manual de *clic* a *clic*.
- Capa de ejecución de un agente CAD jerárquico: un planificador de mayor tamaño (LLM) interpreta la petición del usuario y produce el objetivo; Taiga-S1 lo traduce a comandos concretos con ~1 ms de latencia por decisión, lo que abarata drásticamente el bucle de control.
- Generación de variantes de diseño: modificando el tamaño de la *bounding box* o el número de repeticiones de un patrón en el objetivo, se obtienen familias de piezas sin reentrenar ni reescribir *scripts*.
- Pruebas de regresión de *scripts* de CAD: el modelo puede reconstruir una pieza a partir de su descripción de características y compararse volumétricamente (IoU ≥ 0,99) contra la referencia para detectar cambios que rompan el flujo.
- Robótica y control de máquinas herramienta en el bucle: al ejecutarse en CPU con un consumo de memoria de unos pocos megabytes, puede embeberse junto al controlador y decidir la siguiente operación sin depender de un servicio externo.
- Investigación en agentes de uso de ordenador: sirve como *baseline* reproducible para estudiar generalización en longitud, recuperación de errores y aprendizaje por imitación con DAgger en un dominio con estado verificable.
- Docencia de CAD: el modelo puede generar la traza completa de comandos de una pieza descrita por el alumno, útil como solución de referencia paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque Taiga-S1 no es un modelo de lenguaje. Los datos publicados por el autor son específicos del dominio:

| Objetivo | Construido correctamente | Con 20 % de acciones aleatorias inyectadas |
|---|---|---|
| Piezas similares al conjunto de entrenamiento (1-5 características) | 100 % | 93-100 % |
| 6-7 características | 100 % | 86 % |
| 8-9 características | 100 % | 87 % |
| 11 características (~55 comandos) | 100 % | 90 % |
| 13 / 15 / 17 características | 100 % / 100 % / 95 % | no disponible |
| Combinaciones de características nunca vistas en entrenamiento | 90-100 % | 94-97 % |

Criterio de "construido correctamente": el modelo termina y el sólido final coincide exactamente con el objetivo (IoU volumétrico ≥ 0,99, sin objetos sobrantes). Cada fila corresponde a 100 objetivos sintéticos nuevos, con el mismo vocabulario de características que el entrenamiento pero más largos o recombinados, en FreeCAD 1.1 (60 por longitud en el rango de 13-17 características). La precisión por paso frente a las elecciones del profesor es del 99,8 %.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. El autor reporta ~1 ms por decisión en CPU. Huella estimada a partir de los 1.228.163 parámetros: ~4,9 MB en fp32, ~2,5 MB en fp16 y ~1,2 MB en int8.
- GPU recomendadas: no se necesita GPU. Cualquier CPU moderna es suficiente; no hay datos publicados sobre aceleración con GPU ni *throughput* en tarjetas concretas.
- Compatibilidad con GPU de consumo: sí, y de forma innecesaria. Cabe en cualquier GPU (RTX 3060, RTX 4090, etc.) e incluso en dispositivos embebidos, pero la latencia dominante será la comunicación con FreeCAD, no la inferencia.
- Opciones de despliegue: PyTorch nativo mediante `freecad_s1.model.net.from_pretrained` y `freecad_s1.rollout.Policy`, junto con el *runtime* `freecad_s1.runtime`. No hay soporte conocido en vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ya que no es un modelo generativo de texto.
- Latencia y *throughput*: ~1 ms por decisión en CPU según el autor; una pieza de 55 comandos requeriría del orden de decenas de milisegundos de cómputo puro, más el tiempo de ejecución real de cada comando dentro de FreeCAD.

## Comparativa con modelos similares

No se dispone de datos comparativos. No se han identificado en la información proporcionada modelos públicos de la misma categoría (modelos de siguiente acción específicos para CAD) con parámetros, contexto, rendimiento o licencia comparables. Las alternativas conceptuales serían agentes de uso de ordenador basados en LLM con visión, pero no se aportan cifras que permitan una comparación rigurosa, por lo que la comparativa se declara no disponible.

## Limitaciones y advertencias

- Dominio cerrado: solo cubre flujos de FreeCAD PartDesign (bocetos de rectángulo, círculo y hexágono, *pad*, *pocket*, *hole*, *revolve*, patrones lineal y polar, *mirror*, *fillet*, *chamfer* y *shell*). Cualquier operación fuera de ese vocabulario queda fuera de su alcance.
- No genera valores numéricos: las dimensiones, posiciones y radios provienen del objetivo. Si el planificador entrega valores erróneos, el modelo los ejecutará fielmente.
- No procesa lenguaje natural: el objetivo debe ser una lista ordenada de características más una estimación de tamaño (caja envolvente y volumen). Requiere una capa de traducción previa.
- Dependencia fuerte del *runtime*: el modelo necesita el *snapshot* de estado y la lista `valid_actions()` del propio *runtime*, y está validado contra FreeCAD 1.1. Cambios en la API de FreeCAD o en el *runtime* pueden invalidarlo.
- Entrenamiento exclusivamente sintético: las 24.000 sesiones fueron generadas por *scripts* en FreeCAD *headless*, por lo que la distribución de estados y errores puede no reflejar sesiones humanas reales.
- Riesgo de error de ejecución: aunque no hay "alucinación" en sentido lingüístico, el modelo puede seleccionar un comando válido pero incorrecto y producir geometría que no coincide con el objetivo (se observa en el 5 % de fallos con 17 características y hasta un 14 % con 6-7 características bajo inyección de ruido).
- Sesgos: no se han documentado sesgos demográficos ni lingüísticos porque el modelo no trata texto ni personas. El sesgo relevante es de distribución, hacia el vocabulario y el estilo de modelado del profesor sintético.
- Sin validación externa: 0 descargas y 0 *likes* en HuggingFace; todos los resultados provienen del propio autor y no se han replicado de forma independiente.
- Licencia: el modelo se publica bajo MIT, lo que permite uso comercial. Conviene revisar por separado las licencias de las dependencias, en particular FreeCAD (LGPL-2.1) y PyTorch (BSD), que no quedan cubiertas por la licencia del modelo.
- Producción: no hay garantías de mantenimiento, versionado semántico, ni soporte de los servidores de inferencia habituales. El repositorio ocupa 0,0 GB, lo que indica que los pesos y el código auxiliar pueden no estar empaquetados en su totalidad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/shhivv/taiga-s1
- Artículo sobre identificadores de posición aleatorizados (Ruoss et al., 2023): https://arxiv.org/abs/2305.16843
- Artículo sobre acoplamiento posicional (position coupling, 2024): https://arxiv.org/abs/2405.20671
- FreeCAD (aplicación objetivo): https://www.freecad.org/
- No se han encontrado enlaces adicionales relevantes: los resultados de la búsqueda web realizada no guardaban relación con el modelo ni con CAD.
