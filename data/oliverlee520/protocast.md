# OliverLee520/ProtoCast

## Resumen

ProtoCast es un modelo de prediccion meteorologica espacio-temporal desarrollado por Zhixuan Li, Hao Jiang, Chen Hui, Kai Geng y Weisi Lin, descrito en el articulo "Interpretable Prototype-Conditioned Adaptation for Weather Forecasting" (arXiv:2611.25848). El modelo toma 12 observaciones horarias sobre una rejilla meteorologica y predice los siguientes 12 campos horarios para cada variable de entrada. Su mecanismo central empareja patrones meteorologicos locales con prototipos aprendidos por grupo de variables, y esas coincidencias guian correcciones de bajo rango sobre la prediccion base.

La relevancia del modelo reside en su caracter interpretable: las coincidencias con prototipos son inspeccionables, lo que permite entender por que el modelo aplica una correccion concreta en una localizacion determinada. Se distribuye en dos checkpoints independientes, uno para el benchmark GlobalForecast (rejilla 32×64) y otro para TyphoonTracking (rejilla 32×32), cada uno entrenado y seleccionado por perdida de validacion sobre su propio benchmark.

El repositorio tiene un tamano de 0,1 GB, esta implementado en PyTorch y se publica junto con el dataset WeatherForecast y el codigo de entrenamiento y evaluacion en GitHub. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto en tokens, sino que opera sobre tensores de campos meteorologicos en una rejilla fisica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptacion condicionada por prototipos con correcciones de bajo rango sobre rejilla espacio-temporal (detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 12 pasos horarios y salida de 12 pasos horarios |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico de prediccion meteorologica) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) |
| Rejillas soportadas | 32×64 (GlobalForecast) y 32×32 (TyphoonTracking) |
| Variables de entrada/salida | GlobalForecast: U10, V10, T2M, TCC, R (1000 hPa); TyphoonTracking: MSL, U10, V10, T2M |
| Horizonte de prediccion | 12 horas (pasos horarios) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card describe ProtoCast como un modelo que, en cada localizacion de la rejilla, empareja los patrones meteorologicos locales con prototipos aprendidos para el grupo de variables correspondiente. Esas coincidencias con prototipos guian correcciones de bajo rango aplicadas a la prediccion. El articulo se titula "Interpretable Prototype-Conditioned Adaptation for Weather Forecasting", lo que sugiere que la adaptacion condicionada por prototipos es el mecanismo central y que la interpretabilidad de las coincidencias es un objetivo de diseno. No se detallan en la informacion disponible el numero de parametros, la composicion exacta del dataset de entrenamiento, el numero de tokens o muestras procesadas ni si se emplearon tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio).

Cada checkpoint se entrena sobre su propio benchmark y se selecciona por perdida de validacion. El checkpoint GlobalForecast opera sobre una rejilla de 32×64 con cinco canales (U10, V10, T2M, TCC y humedad relativa a 1000 hPa), mientras que el checkpoint TyphoonTracking opera sobre una rejilla de 32×32 con cuatro canales (MSL, U10, V10 y T2M). La evaluacion del primero lee `test.npy` y `train_stats.json`; la del segundo lee `test_32_32.npz` y las estadisticas de normalizacion almacenadas en `train_32_32.npz`. Las metricas en unidades fisicas se escriben en `work_dirs/<benchmark>/ProtoCast/evaluation/saved/metrics.json`. No se especifican en la informacion proporcionada innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion meteorologica espacio-temporal: genera los 12 campos horarios siguientes a partir de 12 observaciones horarias previas.
- Prediccion multi-variable: cubre simultaneamente viento a 10 m (U10, V10), temperatura a 2 m (T2M), cobertura nubosa total (TCC) y humedad relativa a 1000 hPa en el checkpoint GlobalForecast; y presion a nivel del mar (MSL), U10, V10 y T2M en el checkpoint TyphoonTracking.
- Interpretabilidad mediante prototipos: las coincidencias entre patrones locales y prototipos son inspeccionables y explican las correcciones aplicadas.
- Adaptacion por correcciones de bajo rango: el modelo ajusta la prediccion base segun la coincidencia con prototipos.
- Seguimiento de tifones: el checkpoint TyphoonTracking esta disenado especificamente para este benchmark.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, capacidades multilingues, vision general, audio ni modo de pensamiento.

## Casos de uso

- Prediccion operativa a corto plazo en rejilla global: con el checkpoint GlobalForecast se pueden generar pronosticos horarios a 12 horas de viento, temperatura, nubosidad y humedad sobre una rejilla de 32×64, adecuado para pipelines de nowcasting de baja resolucion.
- Seguimiento y analisis de ciclones tropicales: el checkpoint TyphoonTracking, entrenado sobre MSL, U10, V10 y T2M en rejilla 32×32, permite pronosticar la evolucion de la presion y el viento asociados a sistemas tropicales.
- Investigacion sobre interpretabilidad en modelos meteorologicos: al exponer las coincidencias con prototipos, el modelo sirve para estudiar que patrones locales motivan cada correccion y comparar con modelos caja negra.
- Evaluacion comparativa de metodos de prediccion espacio-temporal: los scripts de evaluacion incluidos permiten reproducir metricas en unidades fisicas y comparar contra otras arquitecturas sobre los mismos benchmarks.
- Integracion en sistemas de alerta temprana de bajo coste: el reducido tamano del repositorio (0,1 GB) y la rejilla compacta facilitan el despliegue en entornos con recursos limitados para generar pronosticos a 12 horas.
- Docencia y prototipado en ciencias atmosfericas: el par de checkpoints y el dataset WeatherForecast permiten montar practicas reproducibles de evaluacion de modelos de prediccion sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas se generan localmente en `work_dirs/<benchmark>/ProtoCast/evaluation/saved/metrics.json` tras ejecutar los scripts de evaluacion, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,1 GB, pero no se especifica el numero de parametros ni el consumo real en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el reducido tamano del checkpoint sugiere que podria caber en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: evaluacion mediante los scripts del repositorio GitHub (`scripts/GlobalForecast/ProtoCast.sh` y `scripts/TyphoonTracking/ProtoCast.sh`) con el entorno `protocast`; descarga de checkpoints con la CLI de Hugging Face (`hf download`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables (parametros, contexto, rendimiento o licencia) que permitan establecer una comparativa rigurosa. Los benchmarks de referencia del propio modelo son GlobalForecast y TyphoonTracking, pero no se detallan las lineas base contra las que se compara en el articulo.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo ni del dataset, por lo que el uso comercial queda sin cobertura legal explicita hasta confirmacion del autor.
- Ambito restringido: el modelo solo predice las variables y rejillas para las que fue entrenado; no es un modelo de proposito general ni procesa texto.
- Horizonte limitado: la prediccion cubre 12 pasos horarios; no se documenta su comportamiento mas alla de ese horizonte.
- Dependencia de la rejilla y del orden de canales: cada checkpoint exige la rejilla y el orden de canales exactos indicados en la model card; un uso incorrecto invalida los resultados.
- Riesgo de error en fenomenos extremos: no se documentan garantias de calibracion ni de rendimiento en eventos extremos.
- Sin datos de sesgo ni de alucinacion en el sentido habitual de modelos de lenguaje; el riesgo equivalente es la prediccion fisicamente inconsistente, no cuantificado en la informacion disponible.
- Documentacion incompleta: faltan parametros, datos de entrenamiento, benchmarks numericos y requisitos de hardware, lo que dificulta una evaluacion de produccion.
- Fecha de creacion del repositorio (2026-11-19) y referencia arXiv (2611.25848) coherentes entre si, pero sin verificacion externa en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliverLee520/ProtoCast
- Dataset WeatherForecast: https://huggingface.co/datasets/OliverLee520/WeatherForecast
- Articulo en Hugging Face Papers: https://huggingface.co/papers/2611.25848
- Pagina del proyecto: https://zhixuanli.github.io/projects/li2026protocast
- Repositorio GitHub: https://github.com/zhixuanli/ProtoCast
- Checkpoint GlobalForecast: https://huggingface.co/OliverLee520/ProtoCast/resolve/main/GlobalForecast/protocast.ckpt
- Checkpoint TyphoonTracking: https://huggingface.co/OliverLee520/ProtoCast/resolve/main/TyphoonTracking/protocast.ckpt
