# kabartay/fintfm-binary

## Resumen

FinTFM (checkpoint `kabartay/fintfm-binary`) es un clasificador tabular binario de tipo in-context learning orientado al riesgo de credito corporativo, desarrollado por Mukharbek Organokov (usuario `kabartay` en HuggingFace y GitHub). El modelo resuelve una tarea muy concreta: dado un conjunto de filas etiquetadas que se suministran como contexto en el propio prompt tabular, emite una prediccion de probabilidad para nuevas filas en una unica pasada forward, sin pasos de gradiente ni ajuste por dataset. Su relevancia no reside en el rendimiento, sino en la trazabilidad: el autor publica el checkpoint sobre el que se midieron todos los numeros de su repositorio, junto con un registro de mediciones y un libro de afirmaciones verificables.

Tecnicamente es un transformer tabular de muy pequeno tamano: 885.650 parametros, con `d_cell=48`, `d_model=128`, 4 capas, 2 capas de columna y `d_ff=512`, y un mecanismo de atencion celular bidireccional (`n_cell_blocks=1`) con etiquetas por celda. Se entreno exclusivamente sobre datos sinteticos generados por un prior financiero incluido en el repositorio: 6.000 pasos con batch 8, es decir, 48.000 tareas sinteticas. Nunca vio una tabla real durante el preentrenamiento.

El propio autor declara explicitamente que FinTFM no es un modelo tabular general competitivo: en TabArena, sobre 27 datasets binarios y frente a 94 metodos, obtiene un ROC-AUC medio de 0,7823 y el puesto 93 de 95. Se publica, segun el autor, para que los numeros del repositorio puedan comprobarse. La licencia Apache-2.0 permite uso comercial tanto de pesos como de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tabular con atencion celular bidireccional de dos vias (`d_cell=48, d_model=128, n_layers=4, n_col_layers=2, d_ff=512, n_cell_blocks=1`, etiquetas por celda) |
| Parametros totales | 885.650 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No expresada en tokens; acepta tablas de hasta 136 caracteristicas (features). El numero maximo de filas de contexto no esta disponible |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en coma flotante; el modelo es de ~3,5 MB en fp32, la cuantizacion es practicamente irrelevante) |
| Idiomas soportados | No aplica: es un modelo tabular, no procesa lenguaje natural |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | PyTorch (`.pt`), fichero `v4-cellattn-labels.pt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer tabular de escala minima con un esquema de atencion especifico para datos estructurados: cada celda se representa con una dimension propia (`d_cell=48`) y se proyecta a un espacio de modelo de 128 dimensiones, con 4 capas de procesamiento y 2 capas dedicadas a columnas. El bloque de atencion celular es bidireccional y opera con `n_cell_blocks=1` y etiquetas por celda, lo que permite que el modelo distinga el rol de cada valor dentro de la fila y columna. El modelo consume la tabla completa como contexto en una sola pasada forward; el metodo `fit` de la clase de inferencia no entrena, solo almacena la tabla como contexto.

El entrenamiento se realizo integramente sobre datos sinteticos: 6.000 pasos con batch 8, equivalentes a 48.000 tareas sinteticas, generadas por un prior financiero que esta incluido en el repositorio (`src/fintfm/prior/`) y que puede inspeccionarse y reejecutarse. No se uso codigo, pesos ni datos de entrenamiento de TabPFN, TabICL, TabDPT, LimiX, Nori, MITRA ni de ningun otro modelo fundacional tabular, segun declara el autor. El checkpoint publicado (`v4-cellattn-labels.pt`) es exactamente el que se uso para medir todos los numeros binarios publicados en el repositorio. No se mencionan fases de RLHF ni DPO, algo esperable en un modelo tabular.

Una restriccion de diseno relevante: las columnas categoricas deben codificarse antes de entrar al modelo. El modelo lee cada celda como un escalar ordenado, y el autor indica que la codificacion por etiquetas (label encoding) es mediblemente peor que no imponer orden alguno; recomienda `fintfm.inference.categorical.CategoricalTargetEncoder`, que es out-of-fold sobre las filas de contexto.

## Capacidades

- Clasificacion tabular binaria por in-context learning: una unica pasada forward con la tabla de contexto, sin pasos de gradiente en tiempo de ajuste.
- Soporte de hasta 136 caracteristicas por tarea; superar ese limite provoca un error explicito en lugar de un truncado silencioso.
- Adaptacion a la tarea sin ajuste por dataset: el mismo checkpoint se aplica a distintos paneles de datos cambiando solo el contexto.
- Prediccion de probabilidades calibradas: el autor indica que la calibracion esta de forma consistente entre las mejores medidas en paneles reales de impago corporativo.
- Codificacion de variables categoricas mediante un target encoder out-of-fold incluido en la libreria de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de lenguaje: es exclusivamente un clasificador tabular binario.
- El codigo base incluye variantes multiclase y de regresion, pero fueron evaluadas sobre datos reales y quedaron en ultimo puesto; el autor decidio no publicarlas.

## Casos de uso

- Evaluacion reproducible de modelos fundacionales tabulares: util como punto de referencia verificable en investigacion, ya que cada numero del repositorio esta ligado a una entrada numerada del registro de mediciones y se puede reproducir contra este mismo fichero de pesos.
- Estimacion de probabilidad de impago en paneles corporativos con requisito de calibracion: el modelo destaca en calibracion y puede usarse como estimador de probabilidad combinado con un modelo discriminativo de gradient boosting.
- Prototipado rapido de scoring de credito: al no requerir entrenamiento, permite obtener predicciones sobre un nuevo conjunto de datos en minutos, con la unica condicion de suministrar filas etiquetadas como contexto.
- Auditoria de sesgo y estudio de procedencia: el prior generador de datos sinteticos es publico y reejecutable, lo que permite analizar que distribuciones aprende el modelo y detectar atajos.
- Experimentos controlados sobre generalizacion de datos sinteticos: al haberse entrenado solo con datos sinteticos, sirve para medir la transferencia sintetico-a-real en dominios financieros tabulares.
- Ensenanza y divulgacion de in-context learning tabular: con 885.650 parametros y ejecucion en CPU, es viable como ejemplo didactico completo de arquitectura, entrenamiento e inferencia.
- No es adecuado como sistema de decision crediticia en produccion: su discriminacion pierde de forma consistente frente a gradient boosting ajustado, y su latencia (~8,6 s por 1.000 filas) esta muy por encima de la norma del campo (~0,1 s).

## Benchmarks y rendimiento

Los unicos datos publicados por el autor corresponden a TabArena sobre 27 datasets binarios, comparado con 94 metodos adicionales (95 en total):

| Benchmark | Metrica | Resultado |
|---|---|---|
| TabArena (27 datasets binarios, 95 metodos) | ROC-AUC medio | 0,7823 |
| TabArena (27 datasets binarios, 95 metodos) | Puesto | 93 de 95 |
| Inferencia (latencia) | Mediana por 1.000 filas | ~8,6 s |
| Referencia del campo | Mediana por 1.000 filas | ~0,1 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la informacion disponible, y no serian aplicables a un modelo tabular.

## Requisitos de hardware

- VRAM estimada: practicamente nula. Con 885.650 parametros, el checkpoint ocupa ~3,5 MB en fp32.
- GPU recomendadas: ninguna en particular. El ejemplo de uso oficial del autor emplea `device="cpu"`.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU; tambien en dispositivos de borde y contenedores con memoria muy limitada.
- Opciones de despliegue: la libreria propia `fintfm` (clase `FinancialTFMClassifier`), con `huggingface_hub.hf_hub_download` para la descarga del checkpoint. No hay integracion declarada con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo tabular de este tipo.
- Latencia: mediana de ~8,6 s por 1.000 filas, frente a una norma del campo cercana a 0,1 s. El autor califica el modelo explicitamente como lento en inferencia.

## Comparativa con modelos similares

El autor menciona como pares del ecosistema TabPFN, TabICL, TabDPT, LimiX, Nori y MITRA, pero no publica cifras comparativas frente a ellos en la informacion disponible. El unico dato comparativo es el puesto en TabArena (93 de 95 metodos).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinTFM (este checkpoint) | 885.650 | hasta 136 features | ROC-AUC 0,7823; puesto 93 de 95 en TabArena | Apache-2.0 (pesos y codigo, uso comercial permitido) | HuggingFace + GitHub |
| TabPFN | no disponible | no disponible | no disponible | no disponible | no disponible |
| TabICL | no disponible | no disponible | no disponible | no disponible | no disponible |
| TabDPT | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gradient boosting ajustado (referencia del campo) | no aplica | no aplica | Supera a FinTFM en discriminacion en todos los paneles medidos | segun implementacion | amplia |

Nota del autor: cuatro de los diez proyectos pares encuestados en su repositorio publican codigo permisivo pero pesos no comerciales, y uno restringe el uso comercial de la salida del modelo. FinTFM no impone esas restricciones.

## Limitaciones y advertencias

- Clasificacion binaria exclusivamente: no admite tareas multiclase ni de regresion en este checkpoint; las variantes existen en el codigo pero quedaron en ultimo puesto en las evaluaciones del autor y no se publican.
- Limite duro de 136 caracteristicas: superarlo lanza una excepcion en lugar de truncar los datos.
- Discriminacion inferior a gradient boosting ajustado en todos los paneles reales medidos; el propio autor declara que no es un modelo tabular general competitivo.
- Latencia elevada: mediana de ~8,6 s por 1.000 filas, unas 86 veces la norma del campo (~0,1 s), lo que lo descarta para servicios con requisitos de tiempo real.
- Pretrenamiento integramente con datos sinteticos: aunque la calibracion es buena, la transferencia a distribuciones reales puede no estar garantizada, y el prior financiero introducira los sesgos de su diseno.
- Las columnas categoricas requieren codificacion previa; el label encoding degrada el rendimiento de forma medible. Se debe usar el `CategoricalTargetEncoder` out-of-fold incluido en la libreria.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones sobreconfiadas en regimenes alejados de la distribucion del prior sintetico.
- Licencia Apache-2.0: permite uso comercial, con obligacion de atribucion y de conservar los avisos. No hay restriccion sobre los pesos ni sobre las salidas del modelo.
- Trazabilidad limitada del entrenamiento: no se especifica la composicion detallada del dataset sintetico ni el numero de tokens o tareas por dominio, solo el total de 48.000 tareas sinteticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kabartay/fintfm-binary
- Repositorio de codigo: https://github.com/kabartay/fintfm
- Registro de mediciones (121 findings): https://github.com/kabartay/fintfm/blob/main/docs/results/FINDINGS.md
- Libro de afirmaciones y retractaciones: https://github.com/kabartay/fintfm/blob/main/docs/paper/CLAIMS.md
- Licencia: https://github.com/kabartay/fintfm/blob/main/LICENSE
- Perfil del autor en GitHub: https://github.com/kabartay
- TabArena (benchmark citado): https://tabarena.ai
