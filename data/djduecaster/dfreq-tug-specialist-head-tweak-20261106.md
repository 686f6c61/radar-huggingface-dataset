# djduecaster/dfreq-tug-specialist-head-tweak-20261106

## Resumen

`dfreq-tug-specialist-head-tweak-20261106` es una variante de pesos de un modelo de control motor para el juego del tira y afloja (tug-of-war), publicado por el usuario djduecaster en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de una política de control entrenada que mapea un vector de observaciones de 61 dimensiones a 14 salidas de acción continuas. El modelo se distribuye en formato ONNX y se ejecuta mediante la librería `microduck`, orientada a políticas de robótica o simulación física.

El modelo parte de la revisión `5ea1210e77ce12f72e1019a3a42fd8e6cd103182` del modelo `djduecaster/dfreq-tug`, que obtuvo una puntuación de 160.168 cm en una ejecución de Arena. Esta variante conserva las diez salidas de las patas del especialista original e introduce una mezcla al 50/50 de las cuatro salidas de cabeza y cuello con el modelo `dfreq-tug-cup-head-20261102` (revisión `cbc52f7385078f48b4280f7c5c7b14b545c7975c`). Según el autor, esta mezcla produce acciones genuinamente distintas y no es una reexportación de metadatos.

La relevancia de esta ficha es limitada fuera del ecosistema `microduck`: no hay pipeline declarado, no se especifican idiomas ni licencia, el repositorio ocupa 0.0 GB y no cuenta con descargas ni likes. La información disponible proviene exclusivamente de la model card y de los resultados de búsqueda web, por lo que muchos campos técnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control con entrada `[1, 61]` y salida `[1, 14]`; no se especifica la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (política sin estado; entrada de 61 observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (según tags y model card) |

## Arquitectura y entrenamiento

La información disponible describe una política sin estado (stateless) que acepta únicamente el vector legal de 61 observaciones y devuelve 14 offsets de acción. El modelo base `djduecaster/dfreq-tug-cup-head-20261102` se describe como una política que no recibe semilla, reloj de puntuación, posición en el mundo, estado del oponente, crítico privilegiado ni búsqueda de trayectorias; su adaptador de cabeza coordina cuatro canales de cabeza. No se detalla la arquitectura interna (número de capas, tipo de red, función de activación ni procedimiento de entrenamiento).

El proceso de construcción de esta variante es explícito en la model card: se toma el especialista original y se sustituyen las cuatro salidas de cabeza y cuello por una mezcla 50/50 con el modelo Cup en la revisión indicada. Las diez salidas de las patas permanecen intactas y ambos expertos originales no se modifican. No se mencionan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de RLHF o DPO, lo cual es coherente con el dominio de control motor.

## Capacidades

- Control motor para el juego del tira y afloja: produce 14 salidas de acción continuas a partir de 61 observaciones.
- Coordinación de diez canales de patas heredados del especialista original.
- Coordinación de cuatro canales de cabeza y cuello mediante mezcla con el modelo Cup.
- Política sin estado: no utiliza semilla, reloj, posición, estado del oponente ni crítico privilegiado.
- Entrada y salida en float32 con formas fijas `[1, 61]` y `[1, 14]`.
- Comando de tug especificado como `[-0.3, 0, 0]`.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento.

## Casos de uso

- Evaluación comparativa de políticas de control: el modelo sirve para medir el efecto de una modificación localizada en cabeza y cuello frente al especialista original en combates de referencia.
- Investigación en mezcla de políticas (policy blending): permite estudiar cómo una mezcla 50/50 de pesos afecta al comportamiento motor en un subconjunto de articulaciones.
- Pruebas de robustez en simulación física: con ocho semillas físicas frescas y ambos lados, el autor reporta 16 combates de referencia ganados, lo que permite usar el modelo como caso de prueba en entornos de evaluación reproducibles.
- Integración en pipelines `microduck`: al distribuirse en ONNX y estar etiquetado para `microduck`, puede cargarse en herramientas compatibles para experimentación local.
- Docencia y divulgación sobre políticas de control: un ejemplo concreto de cómo se compone una política especializada a partir de dos expertos y se valida con métricas locales.
- Análisis de discrepancias entre evaluación local y servidor: el autor advierte que las puntuaciones locales en Mac pueden diferir de las oficiales, lo que convierte al modelo en un caso útil para estudiar esa variabilidad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuación Arena del modelo fuente (`dfreq-tug`, rev. `5ea1210e...`) | 160.168 cm |
| Puntuación media local en Mac de esta variante (8 semillas frescas, ambos lados) | 147.480 cm |
| Puntuación media local en Mac del original en las mismas pruebas | 148.221 cm |
| Combates de referencia ganados por esta variante | 16 de 16 |
| Combates directos contra el modelo Cup actual | 0 de 8 ganados |
| Resets o faltas propias observadas en el cribado | Ninguno |
| Puntuación Arena oficial de esta variante | No disponible (no hay nueva calificación oficial) |

El autor indica explícitamente que la cifra de 160.168 cm pertenece al modelo fuente y no a esta variante, y que no reclama ninguna mejora de rendimiento ni mayor fuerza frente al modelo Cup.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 61 valores float32, por lo que el modelo es de tamaño muy reducido.
- GPU recomendadas: no disponibles; el autor realizó las comprobaciones locales en un evaluador Mac, sin especificar hardware gráfico.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio y el formato ONNX, es probable que quepa en hardware de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: librería `microduck` (según la model card y los resultados de búsqueda); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dfreq-tug-specialist-head-tweak-20261106` (esta variante) | no disponible | no aplica | 147.480 cm medio local; 16/16 combates de referencia; 0/8 contra Cup | no disponible | Hugging Face, ONNX, librería `microduck` |
| `djduecaster/dfreq-tug` (rev. `5ea1210e...`) | no disponible | no aplica | 160.168 cm en Arena; 148.221 cm medio local | no disponible | Hugging Face |
| `djduecaster/dfreq-tug-cup-head-20261102` (rev. `cbc52f73...`) | no disponible | no aplica | Ganó los 8 combates directos contra esta variante | no disponible | Hugging Face |
| `djduecaster/dfreq` | no disponible | no aplica | No disponible | no disponible | Hugging Face; carga por slots (`walk`, `stand`, `sitstand`, `ground_pick`, `kick_left`, `kick_right`, `roulade`) |

## Limitaciones y advertencias

- No hay licencia declarada, por lo que el uso comercial queda sin autorización explícita y debe tratarse como no permitido hasta confirmación del autor.
- No se especifican idiomas ni pipeline, lo que impide clasificarlo como modelo de lenguaje o generativo.
- El autor no reclama mejora de rendimiento: la puntuación media local (147.480 cm) es inferior a la del original (148.221 cm) en las mismas pruebas.
- La cifra de 160.168 cm corresponde al modelo fuente, no a esta variante; no debe atribuirse a este modelo.
- Esta variante perdió los ocho combates directos contra el modelo Cup actual, lo que limita su utilidad como sustituto de ese modelo.
- Las puntuaciones locales en Mac pueden diferir de las oficiales del servidor; no hay calificación oficial de Arena para esta variante.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente.
- No hay información sobre sesgos, alucinación ni limitaciones de contexto porque el modelo no es lingüístico; los riesgos se limitan al comportamiento motor en simulación.
- La model card advierte que la mezcla produce acciones distintas, pero no documenta el impacto cualitativo de esas acciones más allá de las métricas citadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-tug-specialist-head-tweak-20261106
- Modelo Cup de referencia: https://huggingface.co/djduecaster/dfreq-tug-cup-head-20261102
- Modelo base `dfreq`: https://huggingface.co/djduecaster/dfreq
- Revisión del especialista original: `5ea1210e77ce12f72e1019a3a42fd8e6cd103182` (en el repositorio `djduecaster/dfreq-tug`)
- Revisión del modelo Cup: `cbc52f7385078f48b4280f7c5c7b14b545c7975c` (en el repositorio `djduecaster/dfreq-tug-cup-head-20261102`)
- Archivo de validación citado en la model card: `validation.json` (dentro del repositorio del modelo)
