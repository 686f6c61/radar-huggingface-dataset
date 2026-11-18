# ruiconte/argus-v3

## Resumen

Argus V3 es un modelo de deteccion de tinta (ink detection) sobre escaneos de tomografia computarizada (CT) de alta resolucion de papiros de Herculano, desarrollado por el usuario ruiconte. No es un modelo de lenguaje: es una red neuronal convolucional especializada en segmentacion de imagenes que identifica trazos de tinta en las capas internas de papiros carbonizados, un problema central del Vesuvius Challenge. El modelo se presenta como un reemplazo directo de `reader-v3.pth` (de domenicor046), con la misma arquitectura y formato de fichero, por lo que es compatible con herramientas existentes como HerculeX o ink-sdk.

La relevancia de Argus V3 radica en que mejora a Reader V3 en todas las metricas sobre los cinco segmentos de test nativos (escaneos a 9 µm) que ninguno de los dos modelos vio durante el entrenamiento. Se construye como una media uniforme de pesos de cuatro fine-tunes de Reader V3, entrenados sobre subconjuntos aleatorios de las etiquetas de `reader-v2-labels`. El repositorio ocupa 0,3 GB y se distribuye bajo licencia MIT.

El modelo esta orientado exclusivamente a la deteccion de tinta en datos de CT de papiros; no soporta generacion de texto, codigo ni ninguna capacidad de lenguaje natural. Su evaluacion se realiza mediante AUC, balanced accuracy (bAcc@0.5), Dice y porcentaje de fondo marcado erroneamente como tinta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de segmentacion de imagenes (`ink_9um`, del equipo Vesuvius Challenge); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

Argus V3 reutiliza la red `ink_9um` del Vesuvius Challenge, la misma que emplea `reader-v3.pth`, y mantiene identico el layout de fichero, de modo que funciona como sustituto directo en cualquier herramienta que cargue Reader V3. El modelo final es una media uniforme de pesos de cuatro fine-tunes independientes de `domenicor046/reader-v3` (MIT), todos inicializados desde el mismo checkpoint.

Cada fine-tune se entreno durante 12 000 iteraciones con teselas de 256 px, batch de 8, optimizador SGD y funcion de perdida BCE con label smoothing de 0,5 mas termino Dice. El orden de profundidad de las capas nunca se invierte durante el entrenamiento. Cada ejecucion utilizo una proporcion aleatoria distinta del 30 % de los 70 segmentos nativos de `domenicor046/reader-v2-labels` (MIT). La tasa de aprendizaje fue de 2,5e-4 en dos ejecuciones y de 5e-4 en las otras dos. La cuarta ejecucion incorporo ademas renders a 2,4 µm (PHerc0139, 1667, Paris 4 y 0814) convertidos para parecerse a escaneos nativos de 113 keV mediante un kernel de transferencia ajustado sobre el par registrado pooled/nativo de PHerc0814 46527 (R² en held-out de 0,75); esta ejecucion es la que mejoro el segmento PHerc1447 w058. Los conjuntos PHerc0841 y PHerc1447 no se usaron ni para entrenamiento ni para seleccion.

## Capacidades

- Deteccion y segmentacion de tinta sobre escaneos CT nativos a 9 µm de papiros de Herculano.
- Prediccion por teselas de 256 px con test-time augmentation de 8 pliegues.
- Promediado de ventanas de profundidad desplazadas −2, 0 y +2 capas, que anade aproximadamente un punto de AUC.
- Compatibilidad directa con HerculeX (`HERCULEX_WEIGHTS=/path/to/argus-v3.pth`) y con cualquier herramienta que cargue `reader-v3.pth`.
- No soporta generacion de texto, tool calling, agentes, razonamiento, codigo ni capacidades multilingues.
- No incorpora modo thinking, vision general, audio ni funciones de lenguaje natural.

## Casos de uso

- Lectura de papiros carbonizados: aplicar el modelo sobre los volumenes CT de la coleccion del Vesuvius Challenge para obtener mapas de probabilidad de tinta en las capas internas y reconstruir texto perdido.
- Sustitucion directa en HerculeX: al compartir layout con `reader-v3.pth`, se puede apuntar la variable de entorno al nuevo fichero sin cambiar el pipeline, obteniendo mejoras de AUC y bAcc en escaneos nativos.
- Integracion en ink-sdk: cualquier flujo que cargue Reader V3 puede usar Argus V3 como drop-in, lo que facilita comparaciones A/B y despliegues graduales.
- Investigacion en segmentacion sobre datos de CT: sirve como baseline fuerte para experimentos de deteccion de tinta en escaneos a 9 µm, con metricas publicadas sobre cinco segmentos no vistos.
- Analisis de falsos positivos: su menor porcentaje de fondo marcado como tinta (11,5 % frente a 13,2 % en PHerc0841 w00) lo hace util en flujos donde el ruido de fondo degrada la lectura manual.
- Validacion cruzada de etiquetas: al comparar sus predicciones con las etiquetas del equipo y con Reader V3, se pueden identificar zonas ambiguas o etiquetas inconsistentes en los conjuntos de entrenamiento.
- Procesado por lotes de segmentos auto_grown: los resultados en segmentos auto_grown de PHerc0841 (AUC 0,837 y 0,855) lo hacen adecuado para cribar grandes volumenes antes de una revision humana.

## Benchmarks y rendimiento

Resultados sobre escaneos nativos no vistos durante el entrenamiento (teselas de 256 px, TTA de 8 pliegues):

| Segmento | AUC V3 / Reader V3 | bAcc@0.5 V3 / Reader V3 | Dice V3 / Reader V3 | Fondo como tinta V3 / Reader V3 |
|---|---|---|---|---|
| PHerc0841 w00, 113 keV | 0,924 / 0,913 | 0,835 / 0,764 | 0,728 / 0,718 | 11,5 % / 13,2 % |
| PHerc0841 auto_grown …144552896, 113 keV | 0,837 / 0,820 | 0,753 / 0,724 | 0,666 / 0,650 | 31,0 % / 33,8 % |
| PHerc0841 auto_grown …174252405, 113 keV | 0,855 / 0,852 | 0,795 / 0,734 | 0,666 / 0,645 | 20,8 % / 23,5 % |
| PHerc1447 w058, 116 keV | 0,860 / 0,856 | 0,779 / 0,713 | 0,666 / 0,647 | 25,4 % / 28,1 % |
| PHerc1447 w060, 116 keV | 0,791 / 0,776 | 0,680 / 0,613 | 0,558 / 0,493 | 39,8 % / 42,1 % |

Resultados sobre renders agrupados de escaneos a 2,4 µm:

| Conjunto | Metrica | Argus V3 | Reader V3 |
|---|---|---|---|
| PHerc0841 w00 (no visto) | AUC | 0,944 | 0,929 |
| PHerc0841 w00 (no visto) | bAcc@0.5 | 0,868 | 0,843 |
| PHerc0841 w00 (no visto) | Fondo como tinta | 7,6 % | 8,5 % |
| Mascaras de validacion oficiales (3) | bAcc@0.5 | 0,793 | 0,791 |
| Mascaras de validacion oficiales (3) | AUC | 0,902 | 0,907 |
| Mascaras de validacion oficiales (3) | Dice | 0,694 | 0,707 |

Con el orden de profundidad invertido, el AUC en PHerc0841 w00 cae a 0,512, lo que segun el autor indica que no se inventa tinta. Frente a Argus V2, V3 mejora en 4 de los 5 segmentos y corrige el punto debil de V2 en PHerc1447 w058 (0,854 → 0,860).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repo pesa 0,3 GB, lo que sugiere un modelo de tamano moderado apto para GPU consumer, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por el tamano del checkpoint es plausible en GPUs con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: carga directa en PyTorch (`.pth`), HerculeX mediante `HERCULEX_WEIGHTS`, e ink-sdk u otras herramientas que carguen `reader-v3.pth`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | AUC (PHerc0841 w00 nativo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Argus V3 | CNN segmentacion | no disponible | no aplica | 0,924 | MIT | Hugging Face (`ruiconte/argus-v3`) |
| Reader V3 | CNN segmentacion | no disponible | no aplica | 0,913 | MIT | Hugging Face (`domenicor046/reader-v3`) |
| Argus V2 | CNN segmentacion | no disponible | no aplica | no disponible (mejor en 1 de 5 segmentos que V3) | no disponible | no disponible |
| Argus V1 | CNN segmentacion | no disponible | no aplica | no disponible (mejor bAcc en mascaras de validacion: 0,849) | no disponible | no disponible |

## Limitaciones y advertencias

- En las mascaras de validacion oficiales (renders agrupados a 2,4 µm), Reader V3 mantiene un AUC y Dice ligeramente superiores; en ese formato, Argus V1 sigue siendo el mejor en bAcc (0,849).
- Las mejoras en trazos de tinta tenue son modestas; segun el autor, el limite parece estar en lo que las etiquetas marcan como tinta.
- El porcentaje de fondo marcado como tinta es alto en algunos segmentos (hasta 39,8 % en PHerc1447 w060), lo que puede generar falsos positivos en zonas sin escritura.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso fuera de segmentacion de imagenes de CT no esta cubierto.
- Las etiquetas de test de PHerc1447 son de YoussefMoNader bajo CC BY-NC 4.0 y solo para evaluacion; su uso en produccion o entrenamiento requiere atencion a esa licencia.
- El modelo se entreno sobre un subconjunto del 30 % de 70 segmentos nativos; la generalizacion a otros papiros o condiciones de escaneo distintas no esta garantizada.
- La licencia del modelo es MIT, pero los datos de escaneo subyacentes son del Vesuvius Challenge open data y pueden tener sus propias condiciones.
- Verificar la integridad del fichero con `sha256sum argus-v3.pth`; el hash esperado es `2d887d2bffaadcefae1507bea269e04e1e79c47a6320cce6071d701b4089bbe3`.

## Enlaces

- Hugging Face: https://huggingface.co/ruiconte/argus-v3
- Repositorio de codigo: https://github.com/ruiconte/ink-swarm
- Modelo base: https://huggingface.co/domenicor046/reader-v3
- Etiquetas de entrenamiento: https://huggingface.co/domenicor046/reader-v2-labels
- Vesuvius Challenge (datos y contexto): https://scrollprize.org
