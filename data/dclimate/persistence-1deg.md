# dClimate/persistence-1deg

## Resumen
dClimate/persistence-1deg es un modelo de referencia (baseline) para predicción meteorológica, no un modelo de lenguaje. Su funcionamiento es determinista y trivial: mantiene constante el último análisis disponible en cada hora de pronóstico, sobre una rejilla global de 1 grado (181 x 360 puntos, de polo a polo, longitud 0-360). Lo desarrolla dClimate y se enmarca en el ecosistema EarthBoi, cuyo fichero de declaración `earthboi.yaml` describe variables, horas de pronóstico y rejilla.

La entrada es un análisis a 0,25 grados; dado que la rejilla de 1 grado es un subconjunto estricto de aquella, el modelo selecciona los puntos colocados en lugar de interpolar. La salida es `temperature_2m` en Kelvin, con forma `(lead, lat, lon)`, en pasos de 6 horas hasta +168 h.

Su relevancia no reside en la precisión, sino en su papel metodológico: en meteorología la persistencia es el pronóstico de referencia estándar, trivial de calcular y con una curva de error conocida de antemano (pequeña en plazos cortos y creciente de forma sostenida). Esto la convierte en un suelo de habilidad (skill floor) y en una comprobación de que un pipeline de scoring funciona correctamente.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: modelo determinista de persistencia, sin red neuronal ni parametros aprendidos |
| Parametros totales | No aplica (0 parametros aprendidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica. Horizonte de pronostico: hasta +168 h en pasos de 6 h (29 plazos, incluido el plazo 0) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | MIT (segun la model card del autor; el metadato de HuggingFace figura como no disponible) |
| Formato de pesos | No aplica. Incluye `predict.py` (funcion `run(inputs, declaration, init_time)`) y `earthboi.yaml` (declaracion de variables, plazos y rejilla) |
| Variable de salida | `temperature_2m`, en Kelvin |
| Rejilla de salida | 1 grado global, 181 x 360 puntos (polo a polo inclusive, longitud 0-360) |
| Rejilla de entrada | Analisis a 0,25 grados; seleccion de puntos colocados (sin interpolacion) |
| Forma de salida | `(lead, lat, lon)` |

## Arquitectura y entrenamiento
No existe arquitectura de red neuronal ni fase de entrenamiento. El modelo implementa una regla de persistencia: en cada plazo de pronostico copia el valor del analisis mas reciente correspondiente a cada punto de la rejilla de 1 grado. Al ser la rejilla de 1 grado un subconjunto estricto de la de 0,25 grados, la operacion es una seleccion de puntos colocados, no una interpolacion, y el autor subraya que no se inventan valores.

No hay datos de entrenamiento, ajuste fino, RLHF ni DPO asociados, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal, ya que no procede. La unica logica reseñable es la declaracion en `earthboi.yaml`, que fija variables, horas de pronostico y rejilla, y la funcion `predict.py` con firma `run(inputs, declaration, init_time)`.

## Capacidades
- Generacion de pronosticos de persistencia de `temperature_2m` en Kelvin sobre rejilla global de 1 grado.
- Cobertura de 29 plazos de pronostico, con paso de 6 horas desde el plazo 0 hasta +168 h.
- Salida estructurada con forma `(lead, lat, lon)`, apta para verificacion automatica.
- Seleccion de puntos colocados desde un analisis de 0,25 grados, sin interpolacion espacial.
- Uso como suelo de habilidad (skill floor) en evaluaciones de modelos de prediccion meteorologica.
- Comprobacion de integridad de pipelines de scoring: su curva de error es conocida de antemano.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni capacidades multilingues, por no ser un modelo de lenguaje.

## Casos de uso
- Baseline de referencia en evaluacion de modelos meteorologicos: se compara la habilidad de modelos de machine learning (por ejemplo, arquitecturas tipo GraphCast o Pangu) contra la persistencia para determinar si aportan valor real sobre el suelo de habilidad.
- Verificacion de pipelines de scoring: al conocerse la curva de error esperada de la persistencia, desviaciones anomulas en las metricas permiten detectar fallos en el codigo de evaluacion o en los datos de entrada.
- Pruebas de integracion en el ecosistema EarthBoi: al exponer `run(inputs, declaration, init_time)` y una declaracion `earthboi.yaml`, sirve para validar el contrato de interfaz antes de conectar modelos mas costosos.
- Control de calidad de analisis de entrada: si la persistencia produce errores atipicamente grandes en plazos cortos, es probable que el analisis a 0,25 grados o su submuestreo a 1 grado tengan un problema.
- Docencia y divulgacion en meteorologia: permite ilustrar de forma reproducible el crecimiento del error con el plazo de pronostico y el concepto de habilidad relativa.
- Prototipado rapido sin coste de computo: al no requerir GPU ni entrenamiento, permite montar y depurar extremo a extremo un flujo de pronostico y verificacion antes de invertir en infraestructura.
- Calibracion de umbrales de error por plazo: establece una cota superior de error tolerado a partir de la cual un modelo candidato no merece consideracion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente describe cualitativamente el comportamiento del error: pequeno en plazos cortos y creciente de forma sostenida con el plazo. No se dispone de valores de RMSE, MAE ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware
- VRAM: no aplica. El modelo no usa GPU.
- GPU recomendadas: ninguna. La operacion es una seleccion de puntos sobre una rejilla, ejecutable en CPU.
- Cabida en GPU de consumo: irrelevante; el modelo es mas ligero que cualquier alternativa que requiera GPU.
- Memoria estimada de la salida: aproximadamente 7,6 MB por ejecucion con precision de 32 bits (29 plazos x 65.160 puntos x 4 bytes), cantidad despreciable.
- Opciones de despliegue: ejecucion directa del script `predict.py` en Python. No procede vLLM, llama.cpp, Ollama ni TGI, al no haber pesos ni inferencia neuronal.
- Latencia y throughput: no hay datos publicados. Al no existir calculo matricial y limitarse a copiar valores, el coste es esencialmente el de mover memoria, del orden de milisegundos por ejecucion en hardware convencional (estimacion, no dato publicado).

## Comparativa con modelos similares
No se dispone de datos de rendimiento de este modelo ni de cifras verificables de las alternativas, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Parametros | Resolucion | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| dClimate/persistence-1deg | Persistencia determinista | 0 | 1 grado | MIT | No disponible |
| Persistencia a 0,25 grados | Persistencia determinista | 0 | 0,25 grados | No disponible | No disponible |
| Baselines de persistencia de WeatherBench2 | Persistencia determinista | 0 | Segun rejilla del benchmark | No disponible | No disponible |
| Modelos de ML meteorologico (GraphCast, Pangu-Weather, FourCastNet) | Redes neuronales | No disponible | Tipicamente 0,25 grados | No disponible | No disponible |

La diferencia funcional clave es que la persistencia no aprende patrones y, por tanto, no puede superar su propio suelo de habilidad, mientras que los modelos neuronales si pueden hacerlo a partir de ciertos plazos. Esta ficha no dispone de cifras para cuantificar ese cruce.

## Limitaciones y advertencias
- No es un modelo de lenguaje: carece de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling y capacidades de agente.
- Ausencia de habilidad predictiva real: al mantener el valor constante, no captura ciclo diurno, adveccion, frentes ni ningun proceso fisico.
- Error creciente con el plazo: su utilidad practica se limita a plazos muy cortos; a partir de ahi sirve solo como referencia.
- Cobertura limitada a una variable: unicamente `temperature_2m`; no produce precipitacion, viento, presion ni otras variables.
- Salida determinista y sin ensembles: no ofrece incertidumbre ni escenarios probabilisticos.
- Resolucion gruesa: 1 grado (181 x 360) es inadecuado para aplicaciones locales o de escala regional.
- Dependencia del analisis de entrada: la calidad del pronostico hereda por completo la del analisis a 0,25 grados y su submuestreo.
- Unidades fijas: la salida se entrega en Kelvin, sin conversion a Celsius u otras unidades.
- Licencia MIT declarada en la model card, lo que permitiria uso comercial, pero el metadato de HuggingFace figura como no disponible; conviene confirmar la licencia antes de un despliegue en produccion.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados que respalden su comportamiento mas alla de la descripcion cualitativa del autor.

## Enlaces
- HuggingFace: https://huggingface.co/dClimate/persistence-1deg
- La busqueda web realizada no ha devuelto enlaces relevantes sobre el modelo (los resultados obtenidos corresponden a un sitio de hockey sobre hielo y no guardan relacion). No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
