# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s2

## Resumen

`microduck-game-tug-a1rb4ck-099c-s2` es una política de control para el evento *tug of war* (tira y afloja) de la Microduck Arena, una competición de robótica simulada organizada por Pollen Robotics. El modelo lo publica el usuario jrubiosainz y deriva de `a1rb4Ck/microduck-tug` en la revisión `099ced00`, publicada bajo licencia Apache 2.0. No se trata de un modelo de lenguaje: es una política de reinforcement learning empaquetada como grafo ONNX que mapea observaciones de 61 valores a acciones de control del robot MicroDuck.

La modificación es quirúrgica y muy acotada. El autor sustituye 31 filas de la tabla de búsqueda `L` (la capa más externa del archivo `policy.onnx`) por filas obtenidas mediante una búsqueda CMA-ES sobre el tramo final de un combate, sin reentrenar ni alterar ningún peso de la red subyacente. El objetivo declarado es mejorar la puntuación del *seed* 2 en la evaluación oficial de la Arena, manteniendo el resto de *seeds* idénticos al archivo original.

Su relevancia es, por tanto, muy específica: sirve como ejemplo de optimización de políticas mediante edición de tablas de consulta y como entrada competitiva en la Microduck Arena, no como componente de propósito general. El repositorio ocupa 0.0 GB y no incluye `manifest.json`, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward exportada a ONNX, con una tabla de búsqueda externa `L` de 508 filas como capa más externa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 valores) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política combina dos componentes. El primero es una red neuronal cuya estructura y pesos son idénticos, byte a byte, a los del archivo `policy.onnx` de `a1rb4Ck/microduck-tug` en la revisión `099ced00`; según la model card, esa red es la misma que aparece en `a1rb4Ck/microduck-heist`, construida a su vez sobre el *walker* de juicenv. El segundo es la tabla `L`, una capa de búsqueda que devuelve una acción almacenada cuando los primeros 48 de los 61 valores de observación coinciden con una de sus filas dentro de una tolerancia de 1e-7; si no hay coincidencia, responde la red subyacente.

El único cambio respecto al original afecta a `L`: se eliminaron las filas 149 a 179 (índices contados desde 0) y se añadieron 31 filas nuevas, de modo que la tabla conserva 508 filas. Las filas añadidas provienen del combate de *seed* 2 de la entrada anterior del autor, `game-tug-a1rb4ck-s3-s5`, hasta el paso 55, y de ahí en adelante de una búsqueda CMA-ES sobre las acciones del tramo final del combate contra el pato de referencia congelado, ejecutada con el *runner* de tug de la Arena en una máquina x86_64. No se entrenó ni modificó ningún peso de red. El punto de divergencia con el archivo de a1rb4Ck en el *seed* 2 es el paso 48.

## Capacidades

- Control de políticas para el evento *tug of war* de la Microduck Arena: genera acciones de movimiento a partir de observaciones de 61 valores.
- Consulta de tabla con coincidencia exacta (tolerancia 1e-7) sobre los primeros 48 valores de observación, con *fallback* a la red neuronal.
- Reproducción determinista de combates: el autor verifica que su *replay* del archivo original reproduce exactamente la ejecución puntuada de a1rb4Ck en los cinco *seeds*.
- Comportamiento idéntico al modelo base en los *seeds* 1, 3, 4 y 5 según el *replay* del autor; solo el *seed* 2 presenta divergencia a partir del paso 48.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye `manifest.json` en el repositorio, igual que el modelo base.

## Casos de uso

- Participación en la Microduck Arena: el archivo se sube como entrada al evento *tug of war* y se evalúa con la función de puntuación oficial (`arena.evaluate.evaluate`, comando vx −0.3 contra el pato de referencia). Es su uso previsto y el único documentado.
- Estudio de optimización por edición de tablas de consulta: sirve para analizar cómo una búsqueda CMA-ES sobre acciones finales puede mejorar la puntuación sin tocar los pesos de la red, comparando el antes y el después fila a fila.
- Reproducción de experimentos de *replay*: el autor documenta la verificación de los 172 archivos fuente de la Arena 0.7.0 y la reproducción exacta de la ejecución puntuada del modelo base, lo que permite replicar el protocolo de evaluación.
- Análisis de sensibilidad por *seed*: dado que solo cambia el *seed* 2, el archivo permite aislar el efecto de las 31 filas modificadas frente al comportamiento del resto de *seeds*.
- Docencia sobre políticas híbridas tabla-red: ilustra el patrón de *lookup* con *fallback* neuronal en robótica simulada de bajo coste computacional.
- Comparación de linajes de políticas: la model card detalla la cadena de derivación (tab-v2, tab-v1, quicksilver-v13, remix-leader, microduck-heist), lo que facilita trazar qué componente aporta cada mejora.

## Benchmarks y rendimiento

Resultados del *replay* del autor sobre una máquina virtual x86_64 con la función de puntuación de la Arena 0.7.0 (evento *tug of war*, comando vx −0.3 contra el pato de referencia):

| Seed | Resultado | Tiempo | Distancia (cm) | Ejecución puntuada de a1rb4Ck (cm) |
|---|---|---|---|---|
| 1 | pit won | 1.52 s | 165.88658690452576 | 165.88658690452576 |
| 2 | pit won | 1.08 s | 165.957510471344 | 165.82584381103516 |
| 3 | pit won | 2.74 s | 165.59808254241943 | 165.59808254241943 |
| 4 | pit won | no disponible (texto truncado) | no disponible (texto truncado) | no disponible (texto truncado) |
| 5 | no disponible (texto truncado) | no disponible (texto truncado) | no disponible (texto truncado) | no disponible (texto truncado) |

La ejecución puntuada de referencia de a1rb4Ck (`01M6C7BQG0VKY44AZ3S7EY`) obtuvo 166.19724988937378 cm con 5 de 5 pits ganados. La mejora declarada en el *seed* 2 es de 165.82584381103516 cm a 165.957510471344 cm. El autor advierte de que la ejecución oficial de la Arena sobre este archivo es el resultado que cuenta.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la política es un grafo ONNX de pequeño tamaño con una tabla de 508 filas.
- GPU recomendadas: no se especifican; la evaluación del autor se ejecutó en una máquina virtual x86_64, sin mención de GPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del archivo, aunque no se documenta ningún requisito concreto.
- Opciones de despliegue: inferencia ONNX (runtime estándar) y el *runner* de tug de la Microduck Arena; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; los tiempos de 1.08 s a 2.74 s por *seed* corresponden a la duración del combate en el *replay*, no a latencia de inferencia aislada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación (cm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-tug-a1rb4ck-099c-s2` | no disponible | no aplica | 165.957510471344 (seed 2, replay) | Apache 2.0 | Hugging Face |
| `a1rb4Ck/microduck-tug` (rev. `099ced00`) | no disponible | no aplica | 166.19724988937378 (ejecución puntuada, 5/5 pits) | Apache 2.0 | Hugging Face |
| `jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5` | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `rumezhak/microduck-tug-tab-v2` (rev. `b63e3587`) | no disponible | no aplica | 165.1954472064972 (ejecución puntuada) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de control, los sesgos relevantes serían de comportamiento en el simulador, no de contenido.
- Riesgo de sobreajuste al *seed* 2: la modificación se diseñó específicamente para ese *seed* y el autor reconoce que la tabla `L` solo coincide con observaciones dentro de 1e-7, por lo que pequeños cambios en las observaciones activan la red de *fallback*.
- Resultados no validados por la Arena: las cifras proceden del *replay* propio del autor; la puntuación oficial del tablero puede diferir.
- La model card está truncada en la información disponible: faltan los resultados de los *seeds* 4 y 5 y parte del texto de evaluación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de una cadena de políticas de terceros cuyas licencias individuales no se detallan en la información disponible.
- Ausencia de `manifest.json`: puede complicar la integración con herramientas que lo requieran.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse para generación de texto, código o razonamiento.
- Idiomas: no aplica; no hay soporte lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s2
- Modelo base `a1rb4Ck/microduck-tug` (rev. `099ced00`): https://huggingface.co/a1rb4Ck/microduck-tug/tree/099ced00f425f1634045cd3f92505a8d78f3df52
- Revisión anterior del modelo base (rev. `3a2eb4e2`): https://huggingface.co/a1rb4Ck/microduck-tug/tree/3a2eb4e2a40073be336d00b7ca1898dc52dee352
- `a1rb4Ck/microduck-heist`: https://huggingface.co/a1rb4Ck/microduck-heist/tree/906d1efd4e1597c6f122f063b399effbf55a7f0e
- `rumezhak/microduck-tug-tab-v2` (rev. `b63e3587`): https://huggingface.co/rumezhak/microduck-tug-tab-v2/tree/b63e35875647a44ef33ab65acf44f167a24b72d4
- `littlebeanhp/microduck-tug-tab-v1` (rev. `f444e12f`): https://huggingface.co/littlebeanhp/microduck-tug-tab-v1/tree/f444e12fe6e8e530d50dc7b00ae069f13138cd9b
- `HlibPlakhtii/microduck-tug-quicksilver-v13` (rev. `c95e086a`): https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v13/tree/c95e086aa23d229bf334447a1ea646db51af652c
- `jrubiosainz/microduck-game-tug-remix14` (rev. `eb525508`): https://huggingface.co/jrubiosainz/microduck-game-tug-remix14/tree/eb5255080a1988a24ed611d89aa97e6150587cbe
- `jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5` (rev. `b455d6f5`): https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-s3-s5/tree/b455d6f5b3216370c97a827b714219b79d9eb365
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio MicroDuck de Pollen Robotics: https://github.com/pollen-robotics/microduck
