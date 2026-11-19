# chronarion/derpk31pro-means

## Resumen

`chronarion/derpk31pro-means` no es un modelo de lenguaje completo, sino un artefacto auxiliar derivado de Kimi K3.1 Pro (Moonshot AI). Contiene una tabla de medias por experto para cada una de las 92 capas MoE del modelo base: un tensor por capa de forma `[896, 3584]` en bfloat16, donde cada fila representa la salida media de un experto enrutado en el espacio latente de esa capa. El repositorio ocupa 0,6 GB y se distribuye exclusivamente en safetensors.

El artefacto está pensado para el runner `derpk31pro` de su autor, que sirve Kimi K3.1 Pro en una única DGX Station. Cuando el sistema descarta las elecciones de experto de menor peso para un token concreto, en lugar de no aportar nada suma la salida media del experto descartado multiplicada por el peso de la elección, lo que segun el autor reduce aproximadamente a la mitad el coste de dicho descarte.

Su relevancia es acotada pero tecnica: documenta una estrategia de aproximacion para inferencia MoE con expertos omitidos y publica las tablas necesarias para reproducirla. No es utilizable como modelo autonomo ni como punto de partida para fine-tuning; solo tiene sentido junto con el codigo de `derpk31pro` y los pesos originales de Kimi K3.1 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tablas de medias por experto para un transformer MoE (Kimi K3.1 Pro); no es un modelo ejecutable |
| Parametros totales | no disponible (el artefacto contiene 92 tensores de `[896, 3584]` en bfloat16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los tensores se publican en bfloat16; el modelo base se ejecuta con expertos MXFP4 y activaciones de 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (`license: other`, `license_name: kimi-k3-license`), copyright 2026 Moonshot AI |
| Formato de pesos | safetensors (`k31-expert-means.safetensors`, 591 MB) |

## Arquitectura y entrenamiento

El fichero no contiene pesos de un modelo, sino estadisticas agregadas de las activaciones internas de Kimi K3.1 Pro. Para cada capa MoE de la 1 a la 92 se almacena un tensor `[896, 3584]`: 896 filas corresponden a los expertos enrutados de esa capa y 3584 columnas al espacio latente del experto (la representacion enrutada antes de la proyeccion ascendente de la salida). La fila *e* de la capa *n* es la media de la salida del experto *e* sobre todos los tokens del texto de medida que lo seleccionaron.

La construccion se realizo ejecutando el checkpoint oficial (expertos en MXFP4 con activaciones de 8 bits, tal como esta previsto que se sirva) capa por capa con el runner de referencia de `derpk31pro` (`tools/runner`, opcion `--save-means`) sobre 64 ventanas de texto variado (codigo, conversacion, documentos, matematicas y otros dominios). Ese corpus se mantuvo fuera del conjunto de evaluacion KLD de `derpk31pro` para que las metricas de divergencia midan las medias fuera de muestra. En total se registraron 192,9 millones de selecciones de experto. Todos los expertos salvo uno de los 82.432 fueron seleccionados al menos una vez; la excepcion es el experto 368 de la capa 62, cuya fila queda a cero (un descarte de ese experto no aporta nada, igual que sin tablas).

La innovacion tecnica es la sustitucion de una omision por una aproximacion: en lugar de eliminar la contribucion de un experto descartado, se inyecta su salida media ponderada por el peso de la eleccion. Segun el autor, esto reduce aproximadamente a la mitad el coste de omitir expertos, a cambio de un sesgo hacia la respuesta promedio del experto.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni respuestas.
- Proporciona tablas de medias por experto para las 92 capas MoE de Kimi K3.1 Pro.
- Permite aproximar la contribucion de expertos omitidos durante la inferencia con `derpk31pro`.
- Habilita la evaluacion de estrategias de descarte de expertos con un coste de error reducido.
- Integrable unicamente mediante la variable `MEANS_DIR` del fichero `config.env` de `derpk31pro`.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento por si mismo.
- Capacidades multilingues: no disponibles (dependen del modelo base).

## Casos de uso

- Servicio de Kimi K3.1 Pro en hardware limitado: en una DGX Station unica, `derpk31pro` puede descartar expertos de menor peso y compensar con las medias de este repositorio para mantener la calidad dentro de un presupuesto de computo fijo.
- Investigacion sobre enrutamiento MoE: las tablas permiten cuantificar cuanto se desvia la salida de un experto respecto a su media y disenar politicas de descarte basadas en esa desviacion.
- Analisis de utilizacion de expertos: las 192,9 millones de selecciones registradas ofrecen una vision de que expertos se activan con mas frecuencia en distintos dominios (codigo, matematicas, documentos).
- Reproducibilidad de experimentos de inferencia aproximada: el artefacto fija las medias de referencia para comparar variantes del runner sin reejecutar el modelo completo.
- Diagnostico de capas y expertos infrautilizados: la fila a cero del experto 368 de la capa 62 es un ejemplo directo de experto nunca seleccionado en el corpus de medida.
- Evaluacion de la divergencia KLD: al haberse generado con texto fuera del conjunto de evaluacion, las tablas sirven como base para medir la degradacion introducida por el descarte de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la reduccion aproximada a la mitad del coste de descartar expertos y la existencia de un conjunto de evaluacion KLD en `derpk31pro`, sin cifras concretas.

## Requisitos de hardware

- VRAM para el artefacto: 591 MB en bfloat16 para cargar `k31-expert-means.safetensors` en memoria.
- VRAM para el modelo base: no disponible en la informacion proporcionada; el autor lo sirve en una unica DGX Station con expertos en MXFP4 y activaciones de 8 bits.
- GPU recomendadas: no disponibles; el unico entorno mencionado es una DGX Station.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente el runner `derpk31pro` (repositorio `github.com/chronarion/derpk31pro`), configurando `MEANS_DIR` en `config.env`; la ruta por defecto del perfil es `/means/k31-expert-means.safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| `chronarion/derpk31pro-means` | Tablas de medias por experto de Kimi K3.1 Pro | 591 MB | safetensors (bfloat16) | Kimi K3 License | Solo con `derpk31pro` |
| `moonshotai/Kimi-K3.1-Pro` | Modelo MoE completo | no disponible | no disponible (checkpoint oficial en MXFP4) | Kimi K3 License | Inferencia y fine-tuning |
| Alternativas equivalentes de tablas de medias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la informacion proporcionada otros artefactos publicos del mismo tipo (tablas de medias por experto para inferencia aproximada) con los que establecer una comparacion tecnica.

## Limitaciones y advertencias

- No es un modelo autonomo: sin los pesos de Kimi K3.1 Pro y el runner `derpk31pro` no produce ningun resultado.
- La aproximacion introduce un sesgo hacia la salida media del experto; no reproduce la contribucion real de un token concreto.
- El experto 368 de la capa 62 tiene la fila a cero por no haber sido seleccionado nunca; su descarte no recibe compensacion.
- Las medias se calcularon sobre 64 ventanas de texto variado; dominios poco representados en ese corpus pueden tener medias menos fieles.
- Licencia Kimi K3 License (copyright 2026 Moonshot AI): las tablas son obra derivada de los pesos de Kimi K3.1 Pro y heredan sus restricciones, incluida cualquier clausula de uso comercial del modelo base, que no se detalla en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta y creado el 2026-11-19: no hay validacion externa de la calidad de las tablas.
- No se declaran idiomas soportados ni contexto; ambas propiedades dependen enteramente del modelo base.
- Riesgo de alucinacion y sesgos: no aplicables al artefacto en si, pero heredados del modelo base cuando se usa en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chronarion/derpk31pro-means
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Repositorio del runner: https://github.com/chronarion/derpk31pro
- Licencia: `LICENSE` en el repositorio de Hugging Face (Kimi K3 License)
