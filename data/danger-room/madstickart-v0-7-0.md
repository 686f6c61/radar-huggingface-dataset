# danger-room/MadStickArt-v0.7.0

## Resumen

MadStickArt-v0.7.0 es un decodificador neuronal de rasterizado desarrollado por danger-room que reconstruye fotogramas de storyboard de figuras de palo (stick figures) en escala de grises de 956 × 400 píxeles. El modelo no genera texto narrativo ni decide la composición de la escena a partir de píxeles: recibe cuatro máscaras de layout explícitas (actores, decorado, atrezzo y movimiento) y produce el raster final con una relación de aspecto contractual de 2,39:1. Con 61.296 parámetros reales verificados en safetensors, es un modelo extremadamente compacto y especializado, orientado a un nicho muy concreto de previsualización de guiones gráficos.

Forma parte de una línea de publicaciones versionada (v0.1.0 a v0.7.0) bajo el repositorio estable danger-room/MadStickArt, con etiquetas inmutables para reproducibilidad. El pipeline completo combina un planificador de escenas basado en StrandsAgents/strands-decider-2B-hobson-v19, un renderizador procedural que fija la geometría y este decodificador neuronal que rasteriza el layout resultante. La versión 0.7.0 se entrenó desde pesos nuevos durante 16 épocas fijas sobre una colección de replay de 55.923 filas.

Su relevancia actual es acotada pero clara: demuestra que un decodificador de 61 K parámetros puede aproximarse a un profesor procedural sintético en una tarea de rasterizado condicionada por layout, con un coste computacional mínimo. Se publica bajo licencia Apache 2.0, solo en inglés y con cero descargas registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador neuronal de rasterizado (red densa, no transformer; detalles de capas no disponibles) |
| Parametros totales | 61.296 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La model card describe un decodificador neuronal entrenado que actúa como rasterizador de escenas de storyboard. La entrada son cuatro máscaras de layout explícitas (actores, decorado, atrezzo y movimiento) y la salida es un fotograma en escala de grises de 956 × 400 píxeles con contrato de salida 2,39:1. No se especifica en la información disponible el tipo exacto de capas, el número de bloques ni los mecanismos de atención o convolución empleados, por lo que ese detalle queda como "no disponible". El modelo se apoya en un renderizador procedural que dispone de 126 ajustes y 250 elementos de atrezzo, y en un planificador Strands Decider que rellena los controles ausentes, manteniendo siempre la autoridad de los controles y la colocación explícitos del usuario.

En cuanto al entrenamiento, v0.7.0 entrena pesos nuevos durante 16 épocas fijas sobre una colección de replay de 55.923 filas. El conjunto de datos/catálogo principal consta de 512 pares, 1 género y 4 títulos de origen. Las quince fuentes nuevas del Loop 6–10 se incluyen con sus divisiones originales de entrenamiento, validación y held-out; las quince fuentes anteriores del Loop 1–5, cinco dominios pre-loop, el linework canónico de v0.3 y la fuente rotada acotada de v0.5 contribuyen solo como replay de entrenamiento y validación, y sus escenas de test retenidas nunca entran en la optimización. Los objetivos de entrenamiento son renderizados vectoriales procedurales del profesor, reutilizados byte a byte, y no fotogramas ni guiones reales de películas. El checkpoint se seleccionó por pérdida de validación. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Rasterizado condicionado por layout: reconstruye fotogramas en escala de grises de 956 × 400 píxeles a partir de cuatro máscaras explícitas (actores, decorado, atrezzo y movimiento).
- Contrato de salida fijo: relación de aspecto 2,39:1.
- Previsualización de storyboard de figuras de palo con assets procedurales (126 ajustes y 250 elementos de atrezzo en esta versión).
- Integración con un planificador de escenas (Strands Decider) que rellena controles faltantes; los controles y la colocación explícitos del usuario prevalecen sobre las sugerencias automáticas.
- Salida reproducible: pesos publicados como safetensors y versionado por etiquetas inmutables (v0.1.0 a v0.7.0).
- No genera texto de historia: no produce guion ni diálogo.
- No decide composición a partir de píxeles: la composición procede del layout de entrada.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Tool calling, agentes multi-paso, visión general, audio o modo "thinking": no disponibles o no aplicables a este modelo.

## Casos de uso

- Previsualización de storyboards para animación: el modelo convierte un layout ya decidido (actores, decorado, atrezzo, movimiento) en un fotograma rasterizado de 956 × 400, lo que permite iterar sobre la puesta en escena antes de producir el arte final.
- Generación de datos sintéticos para entrenamiento: al producir pares layout–raster de forma reproducible, puede usarse para alimentar modelos mayores de visión o de generación de imagen que necesiten ejemplos etiquetados geométricamente.
- Herramientas de prototipado rápido en pipelines internos: integrado con el paquete Python madstickartmodel 0.1.0, permite rasterizar escenas de forma local con un coste de cómputo mínimo (61 K parámetros) en estaciones de trabajo sin GPU dedicada.
- Aplicaciones educativas de narrativa visual: un estudiante puede definir la disposición de una escena mediante máscaras y obtener una representación visual coherente con la gramática de figuras de palo del modelo.
- Automatización de viñetas para guiones técnicos: en documentación o manuales donde se requieren diagramas de escena estilizados y consistentes, el modelo mantiene un contrato de aspecto y un catálogo de assets fijo que garantiza uniformidad entre viñetas.
- Investigación en decodificadores ligeros: sirve como banco de pruebas para estudiar cuánta calidad de rasterizado puede alcanzarse con un presupuesto de parámetros de decenas de miles, comparando contra el profesor procedural y contra la línea base bilineal.
- Reproducción de experimentos: al fijar la etiqueta v0.7.0 y los hashes de catálogo y manifiesto, un equipo puede reproducir exactamente los fotogramas de una evaluación o de una demo publicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. Las cifras de test corresponden al split de test con títulos aislados de la fuente de viajes táctil (1 género) y miden la concordancia con el profesor procedural sintético, no la calidad humana de la historia, la composición o la legibilidad.

| Metrica | Valor | Conjunto | Verificado |
|---|---|---|---|
| Foreground IoU (umbral de tinta 0.35) | 0,5869 | Test con títulos aislados, 128 escenas | No (verified: false) |
| Pixel MAE | 0,0236 | Test con títulos aislados, 128 escenas | No (verified: false) |
| Foreground IoU (validacion) | 0,7004 | 13.532 escenas | No disponible en model-index |
| IoU de la linea base bilineal (union) | 0,2322 | Test | No disponible en model-index |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no son aplicables a un modelo de rasterizado de imágenes.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos en fp32 (61.296 parámetros ≈ 245 KB); en fp16, en torno a 123 KB. No se documentan requisitos oficiales.
- GPU recomendadas: no aplica ninguna GPU de gama alta; el modelo cabe en cualquier GPU, incluida una iGPU, y también se ejecuta en CPU.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo; el cuello de botella real es el renderizado de la imagen de 956 × 400, no los pesos.
- Despliegue: paquete Python madstickartmodel 0.1.0 y pesos safetensors sobre PyTorch; existe un Space de demostración en el navegador (MadStickArt-Playground) desplegado por separado. vLLM, TGI y llama.cpp no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Consideración práctica: el pipeline completo incluye planificador, renderizador procedural y decodificador; los requisitos de VRAM citados cubren solo el decodificador neuronal, no el planificador Strands asociado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría. La tarea (rasterizado de storyboard de figuras de palo condicionado por cuatro máscaras de layout) es muy específica y no se han documentado en la información proporcionada competidores directos con métricas comparables.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| MadStickArt-v0.7.0 | 61.296 | 4 máscaras de layout, salida 956 × 400 | Apache 2.0 | HuggingFace (danger-room/MadStickArt-v0.7.0) |
| Alternativas de rasterizado condicionado por layout (p. ej. ControlNet, pix2pix) | No disponible | No disponible | No disponible | No disponible |
| Profesor procedural interno (referencia) | No disponible | Assets procedurales, 126 ajustes y 250 props | No disponible | Incluido en el repositorio |

Las métricas del autor (IoU 0,5869; MAE 0,0236) solo son comparables con el propio profesor procedural sintético y con la línea base bilineal (IoU 0,2322), ambos definidos por el autor.

## Limitaciones y advertencias

- Las métricas de IoU y MAE miden concordancia con el profesor procedural sintético, no juicios humanos sobre calidad narrativa, composición o legibilidad.
- El conjunto de test principal tiene un único género (viajes, fuente "táctil"), por lo que la generalización a otros géneros no está demostrada.
- Las colecciones agrupadas presentan recuentos desiguales de fuentes y géneros; el autor advierte que deben interpretarse con esa cautela.
- El conjunto de test conservado de 128 escenas no incluye rotaciones dramáticas; su indicador original `passed: false` permanece registrado en los informes del autor.
- El modelo no genera texto de historia ni elige la composición a partir de píxeles; cualquier expectativa en ese sentido es incorrecta.
- Solo está etiquetado para inglés; no hay evidencia de soporte multilingüe.
- Los resultados del model-index figuran como `verified: false`, es decir, son cifras declaradas por el autor y no verificadas de forma independiente.
- Los objetivos de entrenamiento son renderizados vectoriales procedurales reutilizados byte a byte, no fotogramas reales, lo que limita el realismo frente a material fotográfico o de producción.
- La reproducibilidad exige fijar la etiqueta v0.7.0 y respetar los hashes de catálogo y manifiesto; el propio autor señala que esta tarjeta no acredita la finalización de los pasos de verificación de publicación.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y conservación de avisos; conviene revisar la procedencia de los assets procedurales y del catálogo antes de explotarlo comercialmente.
- Riesgo de alucinación: no aplica en el sentido generativo textual, pero el decodificador puede producir geometrías o trazos que no correspondan fielmente al layout de entrada, especialmente fuera de la distribución de entrenamiento.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación comunitaria del modelo.
- El tamaño del repositorio aparece como 0,0 GB, dato que puede reflejar un cálculo redondeado y no debe tomarse como medida exacta de los artefactos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danger-room/MadStickArt-v0.7.0
- Repositorio estable (última versión publicada): https://huggingface.co/danger-room/MadStickArt
- Etiqueta inmutable v0.7.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.7.0
- Repositorio original v0.1.0: https://huggingface.co/danger-room/MadStickArt-v0.1.0
- Etiqueta v0.1.0 del repositorio original: https://huggingface.co/danger-room/MadStickArt-v0.1.0/tree/v0.1.0
- Demo en el navegador (MadStickArt-Playground): https://huggingface.co/spaces/danger-room/MadStickArt-Playground
- Planificador de escenas Strands Decider (revision bb282d786bc251fd4e3068de3ada9ddbb38127cd): https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Los resultados de la busqueda web proporcionada no aportan enlaces tecnicos relevantes: corresponden a definiciones de diccionario de la palabra "danger" en frances y no guardan relacion con el modelo.
