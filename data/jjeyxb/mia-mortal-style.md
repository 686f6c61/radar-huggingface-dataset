# jjeyxb/mia-mortal-style

## Resumen

`jjeyxb/mia-mortal-style` es una colección de cuatro ajustes finos de **estilo de juego** (no de fuerza) sobre el modelo de mahjong riichi `VoidShine/mortal-298k`, más un modelo GRP (global reward prediction) entrenado desde cero. Lo desarrolla el autor `jjeyxb` dentro del proyecto MIA (Mahjong Intelligence Assistant), presentado como trabajo de fin de grado universitario. El problema que aborda es concreto: los bots de riichi existentes juegan a un nivel fijo, y no había una forma controlada de generar variantes que jueguen *distinto* sin jugar *peor*.

Técnicamente no es un modelo de lenguaje, sino una red ResNet (192 canales convolucionales, 40 bloques, `version = 4`) entrenada con aprendizaje por refuerzo offline mediante CQL (Conservative Q-Learning) sobre estados de partida codificados en formato mjai. Cada checkpoint ocupa 125 MB y es intercambiable directamente en el campo `state_file` de Mortal. El repositorio incluye además `grp.pth`, un modelo GRU (hidden 64, 2 capas) necesario para calcular recompensas durante el entrenamiento offline, ya que el upstream no lo publica.

Su relevancia ahora es metodológica: demuestra empíricamente que se puede mover una dimensión de comportamiento 16–20 errores estándar mientras las medias de clasificación de las cuatro variantes mantienen intervalos de confianza al 95 % que contienen todas el 2.500 del baseline. Es decir, separa estilo de fuerza con evidencia estadística medible, y documenta el proceso completo (selección de jugadores por eje, rechazo del eje de tasa de deal-in, barrido de `min_q_weight`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet convolucional (Mortal), `version = 4`, `conv_channels = 192`, `num_blocks = 40`; GRP auxiliar: GRU con `hidden_size = 64` y `num_layers = 2` |
| Parametros totales | no disponible de forma explicita; cada checkpoint `.pth` ocupa 125 MB, lo que en fp32 (4 bytes por parametro) equivale aproximadamente a 31 millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje, opera sobre el estado completo de la partida codificado en formato mjai |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints PyTorch `.pth` sin variantes cuantizadas |
| Idiomas soportados | zh, en (etiquetas del repositorio, corresponden al idioma de la documentacion, no a capacidades linguisticas del modelo) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pth` (`style_call_high.pth`, `style_call_low.pth`, `style_reach_high.pth`, `style_reach_low.pth`, `grp.pth`, `mortal_298k.pth`) |

## Arquitectura y entrenamiento

El modelo base es Mortal de Equim, una red ResNet que recibe el estado de una partida de riichi y produce valores Q sobre las acciones legales. Los cuatro pesos de estilo heredan exactamente esa arquitectura (`version = 4`, 192 canales, 40 bloques) y son compatibles directamente con el `config.example.toml` del upstream, por lo que se pueden cargar como `state_file` sin ninguna adaptacion. El GRP es una GRU independiente que predice la recompensa global de cada mano y que resulta imprescindible para el entrenamiento offline, dado que el upstream no publica sus pesos.

El proceso de entrenamiento parte de 25.543 partidas de la mesa Houou de Tenhou (cuatro jugadores, variante sur), convertidas a formato mjai con la herramienta `convlog` del propio autor de Mortal. En lugar de agrupar jugadores con k-means (los agrupamientos resultantes no superaban una prueba de fiabilidad de mitad partida), se seleccionan los 33 jugadores de cada extremo a lo largo de **un unico eje nombrado**: tasa de llamadas (fiabilidad 0,884) y tasa de riichi (fiabilidad 0,796). El eje de tasa de deal-in se descarto explicitamente porque sus extremos diferian 0,113 en clasificacion media, lo que es senal de fuerza y no de estilo. El ajuste fino se hizo con CQL continuando desde los 298.000 pasos de `mortal_298k.pth` hasta los 327.800, con `learning_rate = 1e-5` constante, `batch_size = 64` y `min_q_weight = 3`. El GRP se entreno durante 22.000 pasos, reduciendo `val_loss` de 3,844 a 2,4709 y el gap de sobreajuste del 34,33 % al 0,74 %.

## Capacidades

- Juego de riichi mahjong a nivel de mesa Houou de Tenhou, con cuatro estilos diferenciados y seleccionables.
- Variante de estilo «llamadas altas» (`style_call_high.pth`): tasa de llamadas de 0,2955 a 0,3348.
- Variante de estilo «llamadas bajas» (`style_call_low.pth`): tasa de llamadas de 0,2968 a 0,2607.
- Variante de estilo «riichi alto» (`style_reach_high.pth`): tasa de riichi de 0,2047 a 0,2172.
- Variante de estilo «riichi bajo» (`style_reach_low.pth`): tasa de riichi de 0,2045 a 0,1652.
- Prediccion de recompensa global por mano mediante `grp.pth` (necesaria para pipelines de entrenamiento offline propios).
- Transferencia de perfil de comportamiento completo: al seleccionar por tasa de llamadas, `call_high` tambien desplaza el valor medio de la mano ganada de 6851 a 6621 (el grupo de referencia estaba en 6626).
- Independencia entre ejes: al entrenar las variantes de riichi, la tasa de llamadas solo se movio 0,003 / 0,001.
- Carga simultanea de dos pesos en la ventana lateral de MIA para comparacion lado a lado de la misma mano.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto. No es un modelo de lenguaje.

## Casos de uso

- **Revision de partidas propias con criterio de estilo**: cargar `style_call_high.pth` y `style_call_low.pth` en la ventana lateral de MIA y comparar en que manos los dos pesos discrepan; esas discrepancias son exactamente el contenido practico de la diferencia de estilo.
- **Entrenamiento de bots con personalidad definida**: un servidor de riichi que quiera diversificar sus oponentes puede desplegar las cuatro variantes en lugar de replicas identicas del mismo Mortal, sin degradar el nivel de juego (los cuatro IC al 95 % contienen 2.500).
- **Investigacion en RL offline con CQL**: el repositorio incluye `grp.pth`, que el upstream no publica, lo que permite reproducir el pipeline de calculo de recompensa por mano y experimentar con `min_q_weight` u otros hiperparametros.
- **Estudio metodologico de separacion estilo/fuerza**: el propio model card documenta el rechazo del eje de deal-in por confundir fuerza con estilo y el barrido de `min_q_weight` en 1/3/10; sirve como caso de estudio replicable sobre como validar ejes de comportamiento.
- **Analisis de jugadores humanos**: dado que los grupos de referencia se definieron con estadisticas de 25.543 partidas de Houou, las cuatro variantes sirven para clasificar el perfil estadistico de un jugador humano comparandolo con los extremos de tasa de llamadas (0,374 vs 0,282) y de tasa de riichi (0,206 vs 0,153).
- **Revision automatica en formato mjai**: integrar cualquiera de los pesos en el flujo de `mjai-reviewer` para etiquetar cada decision de una partida con el estilo que la respalda y detectar manos donde el jugador se desvia de su propio perfil.
- **Docencia y divulgacion de IA para juegos**: la comparacion pareada con semilla fija (3000 partidas `one_vs_three`, misma muralla y mismas manos iniciales para las cuatro variantes) es un ejemplo limpio de evaluacion controlada para explicar RL aplicado.
- **Base para ajustes de estilo adicionales**: dado que el autor demuestra que cambiar unicamente el roster de jugadores desplaza el comportamiento 12 veces mas que el hiperparametro `min_q_weight`, el repositorio es un punto de partida directo para explorar otros ejes (por ejemplo, agresividad en descartes) con la misma metodologia.

## Benchmarks y rendimiento

| Metrica | high | low | Diferencia | Significancia | Diferencia del roster | Reproduccion |
|---|---|---|---|---|---|---|
| Tasa de llamadas (melds) | 0,3348 | 0,2607 | 0,0741 | 20 sigma | 0,0920 | 81 % |
| Tasa de riichi | 0,2172 | 0,1652 | 0,0520 | 16 sigma | 0,0530 | 98 % |

Clasificacion media sobre 15.000 partidas por peso (un challenger contra tres `mortal_298k` sin ajustar, semilla fija):

| Peso | Clasificacion media | IC 95 % |
|---|---|---|
| `style_call_high` | 2,4838 | [2,4659, 2,5017] |
| `style_call_low` | 2,5065 | [2,4889, 2,5241] |
| `style_reach_high` | 2,5021 | [2,4841, 2,5201] |
| `style_reach_low` | 2,4955 | [2,4778, 2,5131] |
| `mortal_298k` (base) | 2,500 | por definicion |

Barrido de `min_q_weight` (el resto de hiperparametros fijo):

| `min_q_weight` | Tasa de llamadas | Clasificacion media |
|---|---|---|
| 1 | 0,3288 | 2,488 |
| 3 | 0,3348 | 2,508 |
| 10 | 0,3325 | 2,479 |

El autor advierte que 3.000 partidas son insuficientes para comparar clasificacion: `style_call_high` pasaba de 2,5080 con 3.000 partidas a 2,4838 con 15.000, invirtiendo la direccion de la conclusion. El error estandar de un bloque de 3.000 partidas es 0,020, del mismo orden que el efecto que se pretende medir. Esta limitacion solo afecta a la clasificacion; las diferencias de estilo (16–20 sigma) son detectables con 3.000 partidas sin problema.

## Requisitos de hardware

- Cada checkpoint pesa 125 MB en `.pth`; en inferencia en fp32 la huella de pesos es de aproximadamente 125 MB. `grp.pth` ocupa 1,4 MB.
- La cifra de VRAM para inferencia no esta publicada; con pesos de 125 MB y una ResNet de 40 bloques a 192 canales, cualquier GPU con 1 GB o mas de VRAM es suficiente, y la ejecucion en CPU es viable.
- GPU recomendadas: no disponible en la informacion proporcionada. Dado el tamano, no se requiere A100 ni H100; una GPU de consumo corriente es mas que suficiente y probablemente innecesaria.
- Si cabe en GPU de consumo: si, cualquier GPU de consumo moderna (por ejemplo, serie RTX 30/40 de gama baja) dispone de VRAM mas que suficiente. No hay datos publicados de rendimiento especifico por GPU.
- Opciones de despliegue: Mortal (campo `state_file`) con `version = 4`, `conv_channels = 192`, `num_blocks = 40`; o la aplicacion MIA mediante su ventana lateral. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que es un checkpoint PyTorch para un agente de juego y no un modelo generativo de texto.
- Latencia y throughput: no disponible.
- Configuracion de referencia:

```toml
[control]
version = 4
state_file = 'style_call_high.pth'

[resnet]
conv_channels = 192
num_blocks = 40
```

## Comparativa con modelos similares

| Modelo | Arquitectura | Estilo ajustable | Clasificacion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jjeyxb/mia-mortal-style` | ResNet 192x40 (Mortal) + GRP | Si, cuatro variantes | 2,4838–2,5065 (IC 95 % contienen 2.500) | AGPL-3.0 | HuggingFace, 0 descargas, 0 likes |
| `VoidShine/mortal-298k` (base) | ResNet 192x40 (Mortal) | No | 2.500 (definicion de referencia) | AGPL-3.0 (upstream) | HuggingFace, incluido como `mortal_298k.pth` en este repo |
| Mortal original (Equim) | ResNet (Mortal) | No | no disponible | AGPL-3.0 | GitHub |

No se han encontrado en la informacion proporcionada otros modelos publicos de riichi con ajuste de estilo comparable. El campo `pipeline` del repositorio figura como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, vision ni audio. Las etiquetas de idioma zh/en se refieren a la documentacion.
- `mortal_298k.pth` incluido en el repositorio **no es produccion propia**: es una redistribucion del upstream y puede quedar desactualizado si `VoidShine/mortal-298k` cambia. Para el archivo original hay que acudir al repositorio upstream.
- La comparacion de clasificacion con 3.000 partidas no es fiable (error estandar 0,020 frente a efectos del mismo orden), como documenta el propio autor con el caso de `style_call_high`.
- Las cuatro variantes no mejoran la fuerza: sus IC al 95 % contienen todas el 2.500 del baseline. Usarlas esperando un bot mas fuerte es un mal uso del modelo.
- No se publican resultados de robustez frente a variantes distintas de la mesa Houou de Tenhou (cuatro jugadores, sur); el entrenamiento se hizo exclusivamente sobre esa poblacion y no se reportan evaluaciones en otras mesas o formatos.
- Riesgo de sobreajuste al roster seleccionado: la reproduccion del efecto es del 81 % en el eje de llamadas y del 98 % en el de riichi, lo que indica que la tasa de llamadas se reproduce peor que la de riichi.
- Licencia AGPL-3.0, igual que el upstream Mortal. El propio autor advierte que la consideracion de los pesos entrenados con codigo AGPL como obra derivada no esta resuelta legalmente y adopta una postura conservadora etiquetandolos tambien como AGPL-3.0. Para uso comercial en productos propietarios esto es un caveat serio: la AGPL impone obligaciones de liberacion del codigo fuente a los usuarios que interactuen con el servicio por red.
- No hay datos publicados de sesgos, tasas de alucinacion (concepto no aplicable a un agente de juego) ni comportamiento fuera del dominio de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 30 de septiembre de 2026; no hay validacion externa independiente de los resultados mas alla de la documentada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjeyxb/mia-mortal-style
- Modelo base: https://huggingface.co/VoidShine/mortal-298k
- Mortal (upstream), de Equim: https://github.com/Equim-chan/Mortal
- `convlog` / mjai-reviewer: https://github.com/Equim-chan/mjai-reviewer
- Proyecto MIA (Mahjong Intelligence Assistant): https://github.com/jjeyxb/mahjong
- Documentacion de evaluacion 1v3: https://github.com/jjeyxb/mahjong/blob/main/docs/eval_1v3.md
- No se han encontrado en la busqueda web enlaces adicionales relevantes para este modelo.
